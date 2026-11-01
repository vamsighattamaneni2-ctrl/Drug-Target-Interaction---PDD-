import os
from typing import List, Union
from pydantic import Field
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    PROJECT_NAME: str = "Drug–Target Interaction Analysis Tool API"
    VERSION: str = "0.1.0"
    API_V1_STR: str = "/api/v1"
    
    # Environment & Debug Configuration (Secure defaults: debug disabled by default)
    ENVIRONMENT: str = "development"
    DEBUG: bool = False
    
    # Server network binding configuration
    HOST: str = "127.0.0.1"
    PORT: int = 8000
    
    # Security & JWT Configuration
    SECRET_KEY: str = Field(
        default="dti-secure-secret-key-2026-prod-b8c7e4a19f3d520e1a84f3c7b9e02d61",
        description="HMAC secret key for JWT signature verification"
    )
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    FIREBASE_PROJECT_ID: str = "drug-target-interaction-ef745"
    FIREBASE_CREDENTIALS_PATH: str = ""
    
    # Upload limits (Default: 10 MB)
    MAX_UPLOAD_SIZE_BYTES: int = 10 * 1024 * 1024  # 10 MB
    
    # Rate Limiting configuration
    RATE_LIMIT_DOCKING: str = "10/minute"
    RATE_LIMIT_BATCH: str = "5/minute"
    RATE_LIMIT_DEFAULT: str = "60/minute"

    # CORS Configuration
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://10.0.2.2:8000",  # Android Emulator loopback
    ]

    class Config:
        case_sensitive = True
        env_file = ".env"
        extra = "ignore"


settings = Settings()
