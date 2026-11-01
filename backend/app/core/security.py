"""
Authentication & Role-Based Access Control (RBAC) Module
Provides verified JWT authentication, Firebase Admin token validation,
and hierarchical RBAC guards for DrugNet API endpoints.
"""

from datetime import datetime, timedelta, timezone
from enum import Enum
from typing import Any, Dict, List, Optional
import jwt
from fastapi import Depends, HTTPException, Security, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from pydantic import BaseModel, Field

from app.core.config import settings

# HTTP Bearer scheme with automatic error suppression so we can return custom 401 payloads
bearer_scheme = HTTPBearer(auto_error=False)


class UserRole(str, Enum):
    RESEARCHER = "Researcher"
    SENIOR_SCIENTIST = "Senior Scientist"
    ADMINISTRATOR = "Administrator"


# Hierarchical role levels (higher level includes lower level privileges)
ROLE_HIERARCHY: Dict[str, int] = {
    UserRole.RESEARCHER.value: 1,
    UserRole.SENIOR_SCIENTIST.value: 2,
    UserRole.ADMINISTRATOR.value: 3,
}


class AuthenticatedUser(BaseModel):
    uid: str
    email: str
    role: str = UserRole.RESEARCHER.value
    display_name: Optional[str] = None
    claims: Dict[str, Any] = Field(default_factory=dict)

    def has_role(self, required_role: str) -> bool:
        """Evaluates whether user has equal or superior role hierarchy."""
        user_level = ROLE_HIERARCHY.get(self.role, 1)
        req_level = ROLE_HIERARCHY.get(required_role, 1)
        return user_level >= req_level


# Initialize Firebase Admin SDK if service account is provided
_firebase_initialized = False
try:
    import firebase_admin
    from firebase_admin import auth as firebase_auth, credentials

    if settings.FIREBASE_CREDENTIALS_PATH:
        cred = credentials.Certificate(settings.FIREBASE_CREDENTIALS_PATH)
        firebase_admin.initialize_app(cred)
        _firebase_initialized = True
except Exception:
    _firebase_initialized = False


def create_access_token(
    data: Dict[str, Any],
    expires_delta: Optional[timedelta] = None,
) -> str:
    """Generates a signed JWT access token for authenticated API requests."""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)

    to_encode.update({
        "exp": expire,
        "iat": datetime.now(timezone.utc),
        "iss": "drugnet-api",
    })
    encoded_jwt = jwt.encode(
        to_encode,
        settings.SECRET_KEY,
        algorithm=settings.JWT_ALGORITHM,
    )
    return encoded_jwt


def verify_token(token: str) -> AuthenticatedUser:
    """
    Verifies cryptographic signatures, expiration, and claims of bearer token.
    Supports Firebase ID tokens and standard signed JWT tokens.
    Never trusts unverified token claims.
    """
    if not token or not isinstance(token, str):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing or malformed authentication credentials.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # 1. Try Firebase Admin token verification if initialized
    if _firebase_initialized:
        try:
            decoded_firebase = firebase_auth.verify_id_token(token, check_revoked=True)
            uid = decoded_firebase.get("uid") or decoded_firebase.get("sub")
            email = decoded_firebase.get("email", f"{uid}@drugnet.internal")
            role = decoded_firebase.get("role") or decoded_firebase.get("admin") and UserRole.ADMINISTRATOR.value or UserRole.RESEARCHER.value
            return AuthenticatedUser(
                uid=uid,
                email=email,
                role=role,
                display_name=decoded_firebase.get("name"),
                claims=decoded_firebase,
            )
        except Exception:
            # Fall through to native JWT validation
            pass

    # 2. Native cryptographically validated JWT token verification
    try:
        # Enforce exact algorithm whitelist to prevent 'none' algorithm bypass
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[settings.JWT_ALGORITHM],
            options={"verify_signature": True, "verify_exp": True},
        )
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication token has expired. Please log in again.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except jwt.InvalidAlgorithmError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token algorithm.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except jwt.PyJWTError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid authentication token: {str(e)}",
            headers={"WWW-Authenticate": "Bearer"},
        )

    uid = payload.get("uid") or payload.get("sub")
    if not uid:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token payload missing subject identifier (uid).",
            headers={"WWW-Authenticate": "Bearer"},
        )

    role = payload.get("role", UserRole.RESEARCHER.value)
    # Validate assigned role is recognized
    if role not in ROLE_HIERARCHY:
        role = UserRole.RESEARCHER.value

    return AuthenticatedUser(
        uid=str(uid),
        email=payload.get("email", f"{uid}@drugnet.internal"),
        role=role,
        display_name=payload.get("name") or payload.get("displayName"),
        claims=payload,
    )


async def get_current_user(
    auth_creds: Optional[HTTPAuthorizationCredentials] = Security(bearer_scheme),
) -> AuthenticatedUser:
    """FastAPI dependency: Extracts and cryptographically validates user identity."""
    if not auth_creds or not auth_creds.credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required. Missing Bearer token in Authorization header.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return verify_token(auth_creds.credentials)


def require_role(*allowed_roles: str):
    """
    FastAPI dependency factory enforcing Role-Based Access Control (RBAC).
    Denies unauthorized requests by default with HTTP 403 Forbidden.
    """
    async def role_checker(user: AuthenticatedUser = Depends(get_current_user)) -> AuthenticatedUser:
        # Administrator can always access
        if user.role == UserRole.ADMINISTRATOR.value:
            return user

        # Check explicit allowed roles or role hierarchy
        allowed_set = set(allowed_roles)
        if user.role in allowed_set:
            return user

        for r in allowed_roles:
            if user.has_role(r):
                return user

        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Forbidden: Insufficient privileges. Required role in {[r for r in allowed_roles]} but current role is '{user.role}'.",
        )

    return role_checker

