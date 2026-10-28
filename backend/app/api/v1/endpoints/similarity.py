"""
FastAPI Endpoints for Molecular Similarity Search (Feature 3)
"""

from fastapi import APIRouter, HTTPException, Query, Body
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from app.services.similarity_service import search_molecular_similarity

router = APIRouter()


class SimilaritySearchRequest(BaseModel):
    query_smiles: str = Field(..., description="Query compound SMILES string")
    threshold: Optional[float] = Field(0.35, ge=0.0, le=1.0, description="Minimum Tanimoto similarity threshold")
    max_results: Optional[int] = Field(10, ge=1, le=50, description="Maximum number of similar compounds to return")
    custom_library: Optional[List[Dict[str, Any]]] = Field(None, description="Optional custom compound pool to search")


@router.post("/search", summary="Search Chemical Library by Morgan Fingerprint Tanimoto Similarity")
async def search_similarity_endpoint(request: SimilaritySearchRequest):
    try:
        result = search_molecular_similarity(
            query_smiles=request.query_smiles,
            threshold=request.threshold or 0.35,
            max_results=request.max_results or 10,
            custom_library=request.custom_library,
        )
        return result
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Similarity calculation failed: {str(e)}")
