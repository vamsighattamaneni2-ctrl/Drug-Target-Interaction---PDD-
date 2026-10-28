"""
Research Project History & Session Reproducibility Service (Feature 7)
Preserves:
- Selected target and ligand identifiers
- Input files / file references
- Molecular preparation settings & pH
- AutoDock Vina grid box parameters
- Results, interaction contacts, and ADMET profiles
- SHA-256 reproducibility verification hash & timestamps.
Strictly under Research Projects without user profile or account clutter.
"""

import hashlib
import json
import time
import uuid
from typing import Any, Dict, List, Optional

# In-memory storage of research project sessions (persisted across session lifetime)
RESEARCH_PROJECTS: Dict[str, Dict[str, Any]] = {}


def _calculate_reproducibility_hash(session_data: Dict[str, Any]) -> str:
    """Calculates SHA-256 hash over deterministic input parameters for scientific reproducibility."""
    components = [
        str(session_data.get("target_gene", "")),
        str(session_data.get("pdb_id", "")),
        str(session_data.get("compound_name", "")),
        str(session_data.get("smiles", "")),
        str(session_data.get("grid_center", "")),
        str(session_data.get("grid_size", "")),
        str(session_data.get("exhaustiveness", "8")),
    ]
    raw_str = "|".join(components)
    return hashlib.sha256(raw_str.encode("utf-8")).hexdigest()[:16]


def save_research_project(data: Dict[str, Any]) -> Dict[str, Any]:
    """Saves or updates a research project session."""
    project_id = data.get("id") or f"PRJ-{uuid.uuid4().hex[:8].upper()}"
    title = data.get("title") or f"{data.get('compound_name', 'Compound')} vs {data.get('target_gene', 'Target')} Investigation"
    
    reproducibility_hash = _calculate_reproducibility_hash(data)

    project_entry = {
        "id": project_id,
        "title": title,
        "description": data.get("description", "In silico drug-target interaction and pharmacokinetic profiling."),
        "target_gene": data.get("target_gene", "BCR-ABL1"),
        "pdb_id": data.get("pdb_id", "1IEP"),
        "compound_name": data.get("compound_name", "Imatinib"),
        "smiles": data.get("smiles", ""),
        "molecular_weight": data.get("molecular_weight"),
        "log_p": data.get("log_p"),
        "prep_settings": data.get("prep_settings", {"ph": 7.4, "gasteiger_charges": True}),
        "docking_params": data.get("docking_params", {
            "center": data.get("grid_center", {"x": 15.0, "y": 20.0, "z": 18.0}),
            "size": data.get("grid_size", {"x": 20.0, "y": 20.0, "z": 20.0}),
            "exhaustiveness": data.get("exhaustiveness", 8),
        }),
        "results": data.get("results", {}),
        "admet_profile": data.get("admet_profile", {}),
        "reproducibility_hash": f"SHA256:{reproducibility_hash}",
        "created_at": data.get("created_at") or time.strftime("%Y-%m-%d %H:%M:%S"),
        "updated_at": time.strftime("%Y-%m-%d %H:%M:%S"),
        "status": data.get("status", "completed"),
    }

    RESEARCH_PROJECTS[project_id] = project_entry
    return project_entry


def list_research_projects() -> List[Dict[str, Any]]:
    """Returns all saved research project sessions sorted by most recent."""
    projects = list(RESEARCH_PROJECTS.values())
    projects.sort(key=lambda p: p.get("updated_at", ""), reverse=True)
    return projects


def get_research_project(project_id: str) -> Optional[Dict[str, Any]]:
    """Retrieves a specific research project session by ID."""
    return RESEARCH_PROJECTS.get(project_id)


def delete_research_project(project_id: str) -> bool:
    """Deletes a research project session."""
    if project_id in RESEARCH_PROJECTS:
        del RESEARCH_PROJECTS[project_id]
        return True
    return False


# Seed canonical sample projects
_sample1 = {
    "id": "PRJ-ABL-IMATINIB",
    "title": "BCR-ABL1 Kinase Inhibition by Imatinib",
    "description": "Baseline catalytic pocket docking and pharmacokinetic profile for chronic myeloid leukemia therapeutic discovery.",
    "target_gene": "BCR-ABL1",
    "pdb_id": "1IEP",
    "compound_name": "Imatinib",
    "smiles": "CC1=C(C=C(C=C1)NC(=O)C2=CC=C(CN3CCN(C)CC3)C=C2)NC4=NC=CC(=N4)C5=CN=CC=C5",
    "molecular_weight": 493.6,
    "log_p": 3.4,
    "grid_center": {"x": 14.8, "y": 21.2, "z": 17.9},
    "grid_size": {"x": 22.0, "y": 22.0, "z": 22.0},
    "exhaustiveness": 8,
    "results": {"best_affinity_kcal_mol": -11.4, "kd_nm": 4.6},
    "created_at": "2026-10-25 09:30:00",
}
save_research_project(_sample1)

_sample2 = {
    "id": "PRJ-EGFR-ERLOTINIB",
    "title": "EGFR Kinase Domain Targeting with Erlotinib",
    "description": "Comparative evaluation of ATP-binding pocket affinity in non-small cell lung carcinoma targets.",
    "target_gene": "EGFR",
    "pdb_id": "1M17",
    "compound_name": "Erlotinib",
    "smiles": "COCCOC1=C(C=C2C(=C1)C(=NC=N2)NC3=CC=CC(=C3)C#C)OCCOC",
    "molecular_weight": 393.44,
    "log_p": 2.7,
    "grid_center": {"x": 22.0, "y": 1.5, "z": 52.8},
    "grid_size": {"x": 20.0, "y": 20.0, "z": 20.0},
    "exhaustiveness": 8,
    "results": {"best_affinity_kcal_mol": -9.8, "kd_nm": 65.2},
    "created_at": "2026-10-26 14:15:00",
}
save_research_project(_sample2)
