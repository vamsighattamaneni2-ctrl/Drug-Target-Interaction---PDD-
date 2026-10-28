"""
FastAPI Endpoints for Binding-Pocket Detection (Feature 1)
"""

from fastapi import APIRouter, HTTPException, Body
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from app.services.pocket_service import detect_binding_pockets

router = APIRouter()


class PocketDetectionRequest(BaseModel):
    pdb_id: Optional[str] = Field(None, description="PDB Accession code (e.g. 1IEP, 2HYY)")
    pdb_content: Optional[str] = Field(None, description="Raw PDB file text")
    target_gene: Optional[str] = Field("Target", description="Protein gene symbol")
    max_pockets: Optional[int] = Field(4, description="Max candidate pockets to return")


@router.post("/detect", summary="Detect Candidate Protein Binding Pockets")
async def detect_pockets_endpoint(request: PocketDetectionRequest):
    try:
        result = detect_binding_pockets(
            pdb_content=request.pdb_content,
            pdb_id=request.pdb_id,
            target_gene=request.target_gene or "Target",
            max_pockets=request.max_pockets or 4,
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Binding-pocket detection failed: {str(e)}")
