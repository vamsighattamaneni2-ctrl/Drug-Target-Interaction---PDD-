"""
API Endpoints for in silico ADMET Pharmacokinetics & Toxicity Evaluation
"""

from typing import Any, Dict, Optional
from fastapi import APIRouter
from pydantic import BaseModel, Field
from app.services.admet_service import predict_admet_profile

router = APIRouter()


class AdmetEvaluationRequest(BaseModel):
    compound_name: str = "Candidate Compound"
    smiles: str = "CC1=C(C=C(C=C1)NC(=O)C2=CC=C(CN3CCN(C)CC3)C=C2)NC4=NC=CC(=N4)C5=CN=CC=C5"
    molecular_weight: Optional[float] = None
    log_p: Optional[float] = None
    hbd: Optional[int] = None
    hba: Optional[int] = None
    rotatable_bonds: Optional[int] = None
    tpsa: Optional[float] = None


@router.post("/evaluate", response_model=Dict[str, Any], tags=["ADMET Pharmacokinetics"])
async def evaluate_admet_properties(payload: AdmetEvaluationRequest):
    """
    Predict in silico ADMET endpoints covering GI absorption, Caco-2, BBB permeation,
    CYP450 metabolism, renal clearance, half-life, hERG cardiotoxicity, Ames mutagenicity,
    and Lipinski Rule of 5 / Veber compliance.
    """
    return predict_admet_profile(
        compound_name=payload.compound_name,
        smiles=payload.smiles,
        molecular_weight=payload.molecular_weight,
        log_p=payload.log_p,
        hbd=payload.hbd,
        hba=payload.hba,
        rotatable_bonds=payload.rotatable_bonds,
        tpsa=payload.tpsa,
    )
