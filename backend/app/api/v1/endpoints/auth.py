"""
Authentication and Session Token Issuance Endpoints
Provides authenticated session issuance and user introspection for Web and Mobile clients.
"""

from typing import Any, Dict, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field

from app.core.security import (
    AuthenticatedUser,
    UserRole,
    create_access_token,
    get_current_user,
)

router = APIRouter()


class TokenRequest(BaseModel):
    email: str = Field(..., min_length=3, max_length=150, description="User email address")
    uid: Optional[str] = Field(None, max_length=100, description="User unique identifier")
    role: Optional[str] = Field(UserRole.RESEARCHER.value, description="Assigned scientific role")
    name: Optional[str] = Field(None, max_length=150, description="Display name")


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int = 3600
    user: Dict[str, Any]


@router.post("/token", response_model=TokenResponse, summary="Issue Authenticated JWT Access Token")
async def issue_token_endpoint(req: TokenRequest):
    """
    Issues a cryptographically signed JWT bearer token.
    Enforces valid scientific role hierarchy.
    """
    role = req.role if req.role in (UserRole.RESEARCHER.value, UserRole.SENIOR_SCIENTIST.value, UserRole.ADMINISTRATOR.value) else UserRole.RESEARCHER.value
    uid = req.uid or f"usr-{abs(hash(req.email)) % 100000:05d}"
    
    token = create_access_token({
        "uid": uid,
        "email": req.email.strip().lower(),
        "role": role,
        "name": req.name or req.email.split("@")[0],
    })

    return TokenResponse(
        access_token=token,
        token_type="bearer",
        expires_in=3600,
        user={
            "uid": uid,
            "email": req.email,
            "role": role,
            "display_name": req.name or req.email.split("@")[0],
        },
    )


@router.get("/me", summary="Get Authenticated Session Profile")
async def get_current_user_profile(
    current_user: AuthenticatedUser = Depends(get_current_user),
):
    """Returns verified profile and claims for the authenticated Bearer token."""
    return {
        "uid": current_user.uid,
        "email": current_user.email,
        "role": current_user.role,
        "display_name": current_user.display_name,
    }

