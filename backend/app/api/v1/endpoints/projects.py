"""
FastAPI Endpoints for Research Project History (Feature 7)
Protected against unauthenticated access, project IDOR, and unauthorized deletion.
"""

from typing import Any, Dict, List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field

from app.core.security import AuthenticatedUser, UserRole, get_current_user, require_role
from app.services.project_service import (
    delete_research_project,
    get_research_project,
    list_research_projects,
    save_research_project,
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
    is_public: Optional[bool] = Field(False, description="Public benchmark project flag")


@router.get("", summary="List Saved Research Project Sessions")
async def list_projects_endpoint(
    current_user: AuthenticatedUser = Depends(get_current_user),
):
    """
    Returns only project sessions the authenticated user is authorized to view.
    Does not expose other researchers' confidential investigational parameters.
    """
    return list_research_projects(user=current_user)


@router.post("", summary="Save or Update a Research Project Session")
async def save_project_endpoint(
    payload: ResearchProjectPayload,
    current_user: AuthenticatedUser = Depends(get_current_user),
):
    """
    Saves or updates a project session bound to the authenticated owner.
    Prevents unauthorized overwriting of other users' projects.
    """
    try:
        saved = save_research_project(payload.dict(), user=current_user)
        return saved
    except PermissionError as pe:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(pe))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Failed to save research project: {str(e)}")


@router.get("/{project_id}", summary="Get Specific Research Project Session Details")
async def get_project_endpoint(
    project_id: str,
    current_user: AuthenticatedUser = Depends(get_current_user),
):
    """
    Retrieves project details. Validates caller ownership to prevent IDOR vulnerabilities.
    Returns 403 Forbidden if user tries to view another researcher's private project.
    """
    project, error_type = get_research_project(project_id, user=current_user)
    if error_type == "NOT_FOUND":
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Research project '{project_id}' not found.")
    elif error_type == "FORBIDDEN":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Forbidden: You do not have authorization to access project '{project_id}'.",
        )
    return project


@router.delete("/{project_id}", summary="Delete a Research Project Session")
async def delete_project_endpoint(
    project_id: str,
    current_user: AuthenticatedUser = Depends(get_current_user),
):
    """
    Deletes a project session.
    Requires verified project ownership or Administrator privilege.
    """
    success, error_type = delete_research_project(project_id, user=current_user)
    if error_type == "NOT_FOUND":
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Research project '{project_id}' not found.")
    elif error_type == "FORBIDDEN":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Forbidden: Insufficient privileges. You must be project owner or Administrator to delete project '{project_id}'.",
        )
    return {"id": project_id, "deleted": True}
