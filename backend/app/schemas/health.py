from datetime import datetime
from pydantic import BaseModel, Field


class HealthResponse(BaseModel):
    status: str = Field(..., example="healthy")
    service: str = Field(..., example="Drug-Target Interaction Analysis Service")
    version: str = Field(..., example="0.1.0")
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    environment: str = Field(..., example="development")
