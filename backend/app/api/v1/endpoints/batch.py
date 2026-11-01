"""
FastAPI Endpoints for Batch Virtual Screening (Feature 2)
Protected against unauthenticated submission, unbounded uploads, and resource exhaustion.
"""

from typing import Any, Dict, List, Optional
from fastapi import APIRouter, Depends, File, HTTPException, Request, UploadFile, status
from pydantic import BaseModel, Field

from app.core.config import settings
from app.core.limiter import limiter
from app.core.security import AuthenticatedUser, UserRole, get_current_user
from app.services.batch_screening_service import (
    BATCH_JOBS,
    cancel_batch_job,
    create_batch_screening_job,
    get_batch_job_status,
    validate_and_parse_library,
)

router = APIRouter()

# Role-based batch compound quotas
MAX_COMPOUNDS_PER_BATCH: Dict[str, int] = {
    UserRole.RESEARCHER.value: 500,
    UserRole.SENIOR_SCIENTIST.value: 2000,
    UserRole.ADMINISTRATOR.value: 10000,
}

MAX_CONCURRENT_JOBS_PER_USER = 3


class StartBatchScreeningRequest(BaseModel):
    target_gene: str = Field(..., min_length=1, max_length=50, description="Target protein gene symbol (e.g. EGFR, BCR-ABL1)")
    pdb_id: Optional[str] = Field("Custom", max_length=10, description="PDB ID")
    pocket_info: Dict[str, Any] = Field(..., description="Selected binding pocket coordinates")
    compounds: List[Dict[str, Any]] = Field(..., min_length=1, description="List of validated compounds to screen")
    exhaustiveness: Optional[int] = Field(8, ge=1, le=64, description="Vina exhaustiveness parameter")


@router.post("/validate-upload", summary="Validate & Parse Uploaded CSV/SDF Compound Library")
async def validate_library_endpoint(
    request: Request,
    file: UploadFile = File(...),
    current_user: AuthenticatedUser = Depends(get_current_user),
):
    """
    Validates and parses uploaded chemical library (.CSV or .SDF).
    Enforces a strict 10 MB upload ceiling and streams file chunks to avoid memory exhaustion (OOM).
    """
    filename = file.filename or "library.csv"
    lower_filename = filename.lower()
    
    # Enforce allowed file extensions
    if not (lower_filename.endswith(".csv") or lower_filename.endswith(".sdf")):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Unsupported file format. Only chemical library files with .csv or .sdf extensions are permitted.",
        )

    # Check Content-Length header upfront if provided
    content_length_header = request.headers.get("content-length")
    if content_length_header:
        try:
            if int(content_length_header) > settings.MAX_UPLOAD_SIZE_BYTES:
                raise HTTPException(
                    status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                    detail=f"Upload rejected: Payload size exceeds maximum allowed limit of {settings.MAX_UPLOAD_SIZE_BYTES // (1024 * 1024)} MB.",
                )
        except ValueError:
            pass

    # Stream chunks up to maximum size to prevent memory exhaustion
    chunk_size = 65536  # 64 KB
    accumulated_bytes = 0
    chunks = []

    while True:
        chunk = await file.read(chunk_size)
        if not chunk:
            break
        accumulated_bytes += len(chunk)
        if accumulated_bytes > settings.MAX_UPLOAD_SIZE_BYTES:
            raise HTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail=f"Upload rejected: File size exceeds maximum allowed limit of {settings.MAX_UPLOAD_SIZE_BYTES // (1024 * 1024)} MB.",
            )
        chunks.append(chunk)

    content_bytes = b"".join(chunks)
    content_str = content_bytes.decode("utf-8", errors="replace")
    file_type = "sdf" if lower_filename.endswith(".sdf") else "csv"

    try:
        result = validate_and_parse_library(
            content=content_str,
            file_type=file_type,
            filename=filename,
        )
        return result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to process library file: {str(e)}",
        )


@router.post("/start", summary="Submit Compound Library to Batch Virtual Screening Queue")
@limiter.limit(settings.RATE_LIMIT_BATCH)
async def start_batch_screening_endpoint(
    request: Request,
    batch_req: StartBatchScreeningRequest,
    current_user: AuthenticatedUser = Depends(get_current_user),
):
    """
    Submits compound library to batch virtual screening queue.
    Enforces per-user concurrency quotas and role-based compound count ceilings.
    """
    compounds = batch_req.compounds
    if not compounds:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Compound library contains 0 valid compounds to screen.",
        )

    # Enforce role-based batch size limit
    max_allowed = MAX_COMPOUNDS_PER_BATCH.get(current_user.role, 500)
    if len(compounds) > max_allowed:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Requested compound count ({len(compounds)}) exceeds the permitted quota ({max_allowed}) for role '{current_user.role}'.",
        )

    # Enforce per-user concurrent active jobs quota
    active_jobs = [
        j for j in BATCH_JOBS.values()
        if j.get("owner_id") == current_user.uid and j.get("status") in ("running", "pending")
    ]
    if current_user.role != UserRole.ADMINISTRATOR.value and len(active_jobs) >= MAX_CONCURRENT_JOBS_PER_USER:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"Batch queue quota reached. You already have {len(active_jobs)} active jobs running. Please wait for completion.",
        )

    try:
        batch_id = create_batch_screening_job(
            target_gene=batch_req.target_gene,
            pdb_id=batch_req.pdb_id,
            pocket_info=batch_req.pocket_info,
            compounds=compounds,
            exhaustiveness=batch_req.exhaustiveness or 8,
            owner_id=current_user.uid,
        )
        return {
            "batch_id": batch_id,
            "status": "queued",
            "message": f"Submitted {len(compounds)} compounds to background virtual screening queue.",
            "owner_id": current_user.uid,
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to enqueue batch job: {str(e)}",
        )


@router.get("/status/{batch_id}", summary="Get Status & Results for Batch Screening")
async def get_batch_status_endpoint(
    batch_id: str,
    current_user: AuthenticatedUser = Depends(get_current_user),
):
    """Retrieves batch screening status and docking outputs."""
    job = get_batch_job_status(batch_id)
    if not job:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Batch job '{batch_id}' not found.")
    return job


@router.post("/cancel/{batch_id}", summary="Cancel a Running Batch Screening Job")
async def cancel_batch_endpoint(
    batch_id: str,
    current_user: AuthenticatedUser = Depends(get_current_user),
):
    """Cancels a running batch job. Requires project ownership or Administrative role."""
    job = get_batch_job_status(batch_id)
    if not job:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Batch job '{batch_id}' not found.")

    is_admin = current_user.role == UserRole.ADMINISTRATOR.value
    is_owner = job.get("owner_id") == current_user.uid

    if not (is_admin or is_owner):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Forbidden: You do not have permission to cancel batch job '{batch_id}'.",
        )

    success = cancel_batch_job(batch_id)
    return {"batch_id": batch_id, "status": "cancellation_requested"}
