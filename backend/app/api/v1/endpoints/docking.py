"""
API Endpoints for Molecular Preparation and AutoDock Vina Docking Simulation
"""

from typing import Any, Dict, List, Optional
from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel, Field

from app.core.config import settings
from app.core.limiter import limiter
from app.core.security import AuthenticatedUser, get_current_user
from app.services.docking_service import (
    prepare_ligand,
    prepare_protein_receptor,
    run_docking_simulation,
)

router = APIRouter()


class LigandPrepRequest(BaseModel):
    compound_name: str = "Candidate Ligand"
    smiles: Optional[str] = None
    sdf_content: Optional[str] = None
    ph: float = Field(7.4, ge=4.0, le=10.0)


class ReceptorPrepRequest(BaseModel):
    pdb_id: Optional[str] = "1M17"
    target_gene: str = "EGFR"
    strip_water: bool = True
    add_polar_hydrogens: bool = True
    repair_missing_sidechains: bool = True


class DockingRunRequest(BaseModel):
    compound_name: str = "Imatinib"
    smiles: str = "CC1=C(C=C(C=C1)NC(=O)C2=CC=C(CN3CCN(C)CC3)C=C2)NC4=NC=CC(=N4)C5=CN=CC=C5"
    target_gene: str = "BCR-ABL1"
    pdb_id: str = "1IEP"
    exhaustiveness: int = Field(16, ge=1, le=64)
    num_modes: int = Field(9, ge=1, le=20)
    grid_center: Optional[List[float]] = None
    grid_size: Optional[List[float]] = None


@router.post("/prepare/ligand", response_model=Dict[str, Any], tags=["Molecular Preparation"])
async def prepare_ligand_endpoint(
    payload: LigandPrepRequest,
    current_user: AuthenticatedUser = Depends(get_current_user),
):
    """
    Standardize ligand, compute physiological protonation state (pH 7.4),
    generate 3D conformer coordinates, and detect rotatable bonds.
    """
    return prepare_ligand(
        smiles=payload.smiles,
        sdf_content=payload.sdf_content,
        compound_name=payload.compound_name,
        ph=payload.ph,
    )


@router.post("/prepare/receptor", response_model=Dict[str, Any], tags=["Molecular Preparation"])
async def prepare_receptor_endpoint(
    payload: ReceptorPrepRequest,
    current_user: AuthenticatedUser = Depends(get_current_user),
):
    """
    De-solvate receptor, strip crystallographic water and co-solvents,
    add polar hydrogens, and automatically compute binding pocket search grid coordinates.
    """
    return prepare_protein_receptor(
        pdb_id=payload.pdb_id,
        target_gene=payload.target_gene,
        strip_water=payload.strip_water,
        add_polar_hydrogens=payload.add_polar_hydrogens,
        repair_missing_sidechains=payload.repair_missing_sidechains,
    )


@router.post("/run", response_model=Dict[str, Any], tags=["Molecular Docking"])
@limiter.limit(settings.RATE_LIMIT_DOCKING)
async def run_molecular_docking(
    request: Request,
    payload: DockingRunRequest,
    current_user: AuthenticatedUser = Depends(get_current_user),
):
    """
    Execute empirical AutoDock Vina molecular docking simulation.
    Requires verified authentication and is rate limited.
    """
    return run_docking_simulation(
        compound_name=payload.compound_name,
        smiles=payload.smiles,
        target_gene=payload.target_gene,
        pdb_id=payload.pdb_id,
        exhaustiveness=payload.exhaustiveness,
        num_modes=payload.num_modes,
        grid_center=payload.grid_center,
        grid_size=payload.grid_size,
    )
