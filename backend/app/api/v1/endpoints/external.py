"""
API Endpoints for External Bioinformatics and Chemoinformatics Data Sources:
- PubChem
- ChEMBL
- UniProt
- RCSB PDB
- PubMed
"""

from typing import Any, Dict, List, Optional
from fastapi import APIRouter, Query, HTTPException
from app.services.external_sources import (
    search_pubchem_compounds,
    search_chembl_molecules,
    search_chembl_targets,
    search_uniprot_proteins,
    get_rcsb_pdb_details,
    search_pubmed_literature,
)

router = APIRouter()


# ==========================================
# PubChem Endpoints
# ==========================================

@router.get("/pubchem/search", response_model=List[Dict[str, Any]], tags=["External - PubChem"])
async def search_pubchem(
    query: str = Query(..., description="Compound name, PubChem CID, or SMILES"),
    limit: int = Query(6, ge=1, le=20),
):
    """Search small molecule compounds in PubChem with 2D/3D properties and structure preview."""
    return await search_pubchem_compounds(query=query, limit=limit)


# ==========================================
# ChEMBL Endpoints
# ==========================================

@router.get("/chembl/compounds", response_model=List[Dict[str, Any]], tags=["External - ChEMBL"])
async def search_chembl_compounds(
    query: str = Query(..., description="Compound name or ChEMBL ID (e.g. CHEMBL941)"),
    limit: int = Query(6, ge=1, le=20),
):
    """Search bioactive molecules in the ChEMBL database with max phase and molecular properties."""
    return await search_chembl_molecules(query=query, limit=limit)


@router.get("/chembl/targets", response_model=List[Dict[str, Any]], tags=["External - ChEMBL"])
async def search_chembl_target_entities(
    query: str = Query(..., description="Protein target name or synonym"),
    limit: int = Query(6, ge=1, le=20),
):
    """Search biological targets in the ChEMBL database."""
    return await search_chembl_targets(query=query, limit=limit)


# ==========================================
# UniProt Endpoints
# ==========================================

@router.get("/uniprot/search", response_model=List[Dict[str, Any]], tags=["External - UniProt"])
async def search_uniprot(
    query: str = Query(..., description="Gene symbol (e.g. EGFR, ABL1), accession, or protein name"),
    limit: int = Query(6, ge=1, le=20),
):
    """Search reviewed UniProtKB target proteomes and mapped PDB crystal structures."""
    return await search_uniprot_proteins(query=query, limit=limit)


# ==========================================
# RCSB PDB Endpoints
# ==========================================

@router.get("/pdb/{pdb_id}", response_model=Dict[str, Any], tags=["External - RCSB PDB"])
async def get_pdb_metadata(pdb_id: str):
    """Fetch experimental crystallographic metadata, method, and resolution from RCSB PDB."""
    details = await get_rcsb_pdb_details(pdb_id=pdb_id)
    if not details:
        raise HTTPException(status_code=404, detail=f"PDB structure {pdb_id} not found.")
    return details


# ==========================================
# PubMed Endpoints
# ==========================================

@router.get("/pubmed/search", response_model=List[Dict[str, Any]], tags=["External - PubMed"])
async def search_pubmed(
    query: str = Query(..., description="Search query e.g. drug name, protein gene, or interaction"),
    limit: int = Query(5, ge=1, le=20),
):
    """Search scientific literature in PubMed using NCBI E-Utilities."""
    return await search_pubmed_literature(query=query, limit=limit)
