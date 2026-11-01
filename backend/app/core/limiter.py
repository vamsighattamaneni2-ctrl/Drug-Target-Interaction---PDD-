"""
Configurable Rate Limiting Module for Compute-Intensive Workloads
Implements per-user rate limiting with client IP fallback via SlowAPI.
"""

from typing import Optional
from fastapi import Request, Response
from fastapi.responses import JSONResponse
import jwt
from slowapi import Limiter
from slowapi.errors import RateLimitExceeded
from slowapi.util import get_remote_address

from app.core.config import settings


def get_user_or_ip_key(request: Request) -> str:
    """
    Identifies client by authenticated user UID if present,
    falling back to direct socket client host IP.
    Does not trust spoofable X-Forwarded-For headers from untrusted clients.
    """
    auth_header = request.headers.get("Authorization", "")
    if auth_header.startswith("Bearer "):
        token = auth_header[7:].strip()
        try:
            # Unverified claim read only for bucket keying (auth dependency performs cryptographic verification)
            unverified = jwt.decode(token, options={"verify_signature": False})
            uid = unverified.get("uid") or unverified.get("sub")
            if uid:
                return f"user:{uid}"
        except Exception:
            pass

    # Fallback to direct client socket host
    client_host = request.client.host if request.client else "unknown_client"
    return f"ip:{client_host}"


limiter = Limiter(
    key_func=get_user_or_ip_key,
    default_limits=[settings.RATE_LIMIT_DEFAULT],
)


def rate_limit_exceeded_handler(request: Request, exc: RateLimitExceeded) -> Response:
    """Returns structured HTTP 429 Too Many Requests response."""
    return JSONResponse(
        status_code=429,
        content={
            "detail": f"Rate limit exceeded: {exc.detail}. Please throttle your requests.",
            "error": "Too Many Requests",
            "retry_after": getattr(exc, "retry_after", 60),
        },
        headers={"Retry-After": str(getattr(exc, "retry_after", 60))},
    )

