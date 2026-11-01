import logging
from datetime import datetime, timezone
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi.errors import RateLimitExceeded

from app.api.v1.router import api_router
from app.core.config import settings
from app.core.limiter import limiter, rate_limit_exceeded_handler
from app.schemas.health import HealthResponse

logger = logging.getLogger("drugnet.api")

# Determine interactive documentation exposure
docs_enabled = settings.DEBUG and settings.ENVIRONMENT == "development"

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Scientific API for Drug–Target Interaction Analysis & Therapeutic Discovery",
    openapi_url=f"{settings.API_V1_STR}/openapi.json" if docs_enabled else None,
    docs_url="/docs" if docs_enabled else None,
    redoc_url="/redoc" if docs_enabled else None,
)

# Attach rate limiter to app state and register 429 handler
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, rate_limit_exceeded_handler)


# Pure ASGI Security Response Headers Middleware (High-performance, no deadlock)
class SecurityHeadersMiddleware:
    def __init__(self, app):
        self.app = app

    async def __call__(self, scope, receive, send):
        if scope["type"] != "http":
            await self.app(scope, receive, send)
            return

        async def send_with_security_headers(message):
            if message["type"] == "http.response.start":
                headers = list(message.get("headers", []))
                headers.append((b"x-content-type-options", b"nosniff"))
                headers.append((b"x-frame-options", b"DENY"))
                headers.append((b"content-security-policy", b"default-src 'self'; frame-ancestors 'none'; object-src 'none';"))
                headers.append((b"referrer-policy", b"strict-origin-when-cross-origin"))
                if settings.ENVIRONMENT == "production":
                    headers.append((b"strict-transport-security", b"max-age=31536000; includeSubDomains"))
                message["headers"] = headers
            await send(message)

        await self.app(scope, receive, send_with_security_headers)


app.add_middleware(SecurityHeadersMiddleware)

# CORS middleware for Web and Mobile clients with explicit methods & headers
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "HEAD"],
    allow_headers=["Authorization", "Content-Type", "Accept", "Origin", "X-Requested-With"],
)


# Global Exception Handler to prevent stack trace leaks in non-debug mode
@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled error on {request.method} {request.url.path}: {str(exc)}", exc_info=True)
    if settings.DEBUG:
        return JSONResponse(
            status_code=500,
            content={"detail": str(exc), "type": type(exc).__name__},
        )
    return JSONResponse(
        status_code=500,
        content={"detail": "An internal server error occurred. Please contact system administrator."},
    )


# Root health endpoint
@app.get("/health", response_model=HealthResponse, tags=["System"])
async def root_health():
    """Root health check endpoint."""
    return HealthResponse(
        status="healthy",
        service=settings.PROJECT_NAME,
        version=settings.VERSION,
        timestamp=datetime.now(timezone.utc),
        environment=settings.ENVIRONMENT,
    )


@app.get("/", tags=["Root"])
async def root():
    return {
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "status": "online",
        "documentation": "/docs" if docs_enabled else "disabled in current environment",
        "health_endpoint": "/health",
        "api_v1": settings.API_V1_STR,
    }


# Include versioned API router
app.include_router(api_router, prefix=settings.API_V1_STR)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host=settings.HOST, port=settings.PORT, reload=settings.DEBUG)
