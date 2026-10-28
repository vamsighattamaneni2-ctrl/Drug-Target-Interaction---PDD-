"""
FastAPI Endpoints for Research Project History (Feature 7)
"""

from fastapi import APIRouter, HTTPException, Body
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from app.services.project_service import (
    save_research_project,
    list_research_projects,
    get_research_project,
    delete_research_project,
)

router = APIRouter()


class ResearchProjectPayload(BaseModel):
    id: Optional[str] = Field(None, description="Optional Project ID")
    title: Optional[str] = Field(None, description="Project Title")
    description: Optional[str] = Field(None, description="Investigation scope and notes")
    target_gene: str = Field("BCR-ABL1", description="Target protein gene symbol")
    pdb_id: Optional[str] = Field("1IEP", description="PDB code")
    compound_name: str = Field("Imatinib", description="Compound name")
    smiles: str = Field("", description="Ligand SMILES")
    molecular_weight: Optional[float] = Field(None)
    log_p: Optional[float] = Field(None)
    prep_settings: Optional[Dict[str, Any]] = Field(default_factory=dict)
    grid_center: Optional[Dict[str, float]] = Field(default_factory=dict)
    grid_size: Optional[Dict[str, float]] = Field(default_factory=dict)
    exhaustiveness: Optional[int] = Field(8)
    results: Optional[Dict[str, Any]] = Field(default_factory=dict)
    admet_profile: Optional[Dict[str, Any]] = Field(default_factory=dict)
    status: Optional[str] = Field("completed")


@router.get("", summary="List All Saved Research Project Sessions")
async def list_projects_endpoint():
    return list_research_projects()


@router.post("", summary="Save or Update a Research Project Session")
async def save_project_endpoint(payload: ResearchProjectPayload):
    try:
        saved = save_research_project(payload.dict())
        return saved
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save research project: {str(e)}")


@router.get("/{project_id}", summary="Get Specific Research Project Session Details")
async def get_project_endpoint(project_id: str):
    project = get_research_project(project_id)
    if not project:
        raise HTTPException(status_code=404, detail=f"Research project '{project_id}' not found.")
    return project


@router.delete("/{project_id}", summary="Delete a Research Project Session")
async def delete_project_endpoint(project_id: str):
    success = delete_research_project(project_id)
    if not success:
        raise HTTPException(status_code=404, detail=f"Research project '{project_id}' not found.")
    return {"id": project_id, "deleted": True}
