"""
FastAPI Endpoints for Batch Virtual Screening (Feature 2)
"""

from fastapi import APIRouter, HTTPException, UploadFile, File, Form, Body
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from app.services.batch_screening_service import (
    validate_and_parse_library,
    create_batch_screening_job,
    get_batch_job_status,
    cancel_batch_job,
)

router = APIRouter()


class StartBatchScreeningRequest(BaseModel):
    target_gene: str = Field(..., description="Target protein gene symbol (e.g. EGFR, BCR-ABL1)")
    pdb_id: Optional[str] = Field("Custom", description="PDB ID")
    pocket_info: Dict[str, Any] = Field(..., description="Selected binding pocket coordinates")
    compounds: List[Dict[str, Any]] = Field(..., description="List of validated compounds to screen")
    exhaustiveness: Optional[int] = Field(8, description="Vina exhaustiveness parameter")


@router.post("/validate-upload", summary="Validate & Parse Uploaded CSV/SDF Compound Library")
async def validate_library_endpoint(
    file: UploadFile = File(...),
):
    try:
        content_bytes = await file.read()
        content_str = content_bytes.decode("utf-8", errors="replace")
        filename = file.filename or "library.csv"
        file_type = "sdf" if filename.lower().endswith(".sdf") else "csv"
        
        result = validate_and_parse_library(
            content=content_str,
            file_type=file_type,
            filename=filename,
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to process library file: {str(e)}")


@router.post("/start", summary="Submit Compound Library to Batch Virtual Screening Queue")
async def start_batch_screening_endpoint(request: StartBatchScreeningRequest):
    try:
        if not request.compounds:
            raise HTTPException(status_code=400, detail="Compound library contains 0 valid compounds to screen.")
        
        batch_id = create_batch_screening_job(
            target_gene=request.target_gene,
            pdb_id=request.pdb_id,
            pocket_info=request.pocket_info,
            compounds=request.compounds,
            exhaustiveness=request.exhaustiveness or 8,
        )
        return {
            "batch_id": batch_id,
            "status": "queued",
            "message": f"Submitted {len(request.compounds)} compounds to background virtual screening queue.",
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to enqueue batch job: {str(e)}")


@router.get("/status/{batch_id}", summary="Get Status & Real Docking Results for Batch Screening")
async def get_batch_status_endpoint(batch_id: str):
    job = get_batch_job_status(batch_id)
    if not job:
        raise HTTPException(status_code=404, detail=f"Batch job '{batch_id}' not found.")
    return job


@router.post("/cancel/{batch_id}", summary="Cancel a Running Batch Screening Job")
async def cancel_batch_endpoint(batch_id: str):
    success = cancel_batch_job(batch_id)
    if not success:
        raise HTTPException(status_code=404, detail=f"Batch job '{batch_id}' not found.")
    return {"batch_id": batch_id, "status": "cancellation_requested"}
