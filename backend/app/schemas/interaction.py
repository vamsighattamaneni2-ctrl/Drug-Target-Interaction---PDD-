from typing import Optional, List
from pydantic import BaseModel, Field


class TargetInfo(BaseModel):
    target_id: str = Field(..., description="Target identifier (e.g. UniProt ID or ChEMBL target ID)")
    target_name: str = Field(..., description="Standard common name of protein target")
    gene_symbol: Optional[str] = None
    organism: str = "Homo sapiens"
    uniprot_id: Optional[str] = None
    target_type: str = "Kinase"


class CompoundInfo(BaseModel):
    compound_id: str = Field(..., description="Compound identifier or SMILES identifier")
    name: str = Field(..., description="Approved or investigational drug name")
    smiles: str = Field(..., description="Canonical SMILES representation")
    molecular_weight: Optional[float] = None
    chembl_id: Optional[str] = None


class InteractionPredictionRequest(BaseModel):
    target_id: Optional[str] = None
    compound_smiles: Optional[str] = None
    algorithm: str = Field(default="deep_dti_transformer", description="Bioinformatics affinity model")
    drug_filename: Optional[str] = None
    target_filename: Optional[str] = None
    drug_content: Optional[str] = None
    target_content: Optional[str] = None


class InteractionPredictionResponse(BaseModel):
    target_id: str
    compound_smiles: str
    binding_affinity_pkd: float = Field(..., description="Predicted binding affinity (-log10 Kd/Ki)")
    predicted_kd_nm: float = Field(..., description="Calculated dissociation constant in nM")
    confidence_score: float = Field(..., ge=0.0, le=1.0, description="Model prediction confidence score")
    interaction_type: str = Field(..., description="Inhibitor, Activator, or Allosteric Modulator")
    key_contact_residues: List[str] = Field(default_factory=list, description="Predicted pocket contact residues")
    binding_affinity_delta_g: Optional[float] = Field(default=-8.7, description="Binding free energy in kcal/mol")
    hydrogen_bonds_count: Optional[int] = Field(default=3, description="Estimated hydrogen bonds")
    salt_bridges_count: Optional[int] = Field(default=1, description="Estimated salt bridge contacts")
    buried_sasa_angstrom: Optional[float] = Field(default=460.0, description="Buried solvent accessible surface area (A^2)")
    docking_rmsd: Optional[float] = Field(default=1.18, description="Estimated docking pose RMSD in A")
    summary: Optional[str] = Field(default=None, description="Detailed biological summary")

