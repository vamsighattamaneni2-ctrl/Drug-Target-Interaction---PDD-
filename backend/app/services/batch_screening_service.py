"""
Batch Virtual Screening Service (Feature 2)
Handles:
- Upload and parsing of CSV and SDF chemical libraries.
- Strict RDKit molecular structure validation with actionable syntax error reports.
- Asynchronous background docking queue with real AutoDock Vina scoring.
- Comprehensive status tracking: pending, running, completed, failed, cancelled.
- Real docking scores without fabrication.
- Job cancellation and resource cleanup.
"""

import asyncio
import csv
import io
import time
import uuid
from typing import Any, Dict, List, Optional
from rdkit import Chem
from rdkit.Chem import Descriptors, AllChem
from app.services.docking_service import (
    prepare_ligand,
    prepare_protein_receptor,
    run_docking_simulation,
)


# Global in-memory batch jobs store
BATCH_JOBS: Dict[str, Dict[str, Any]] = {}


def validate_and_parse_library(
    content: str,
    file_type: str = "csv",
    filename: str = "library.csv",
) -> Dict[str, Any]:
    """
    Parses and validates a chemical library (CSV or SDF) using RDKit.
    Returns valid compounds and a detailed list of invalid entries with error reasons.
    """
    valid_compounds = []
    invalid_entries = []

    if file_type.lower() == "sdf" or filename.lower().endswith(".sdf"):
        # Multi-molecule SDF parser
        suppl = Chem.ForwardSDMolSupplier(io.BytesIO(content.encode("utf-8", errors="replace")))
        mol_idx = 0
        for mol in suppl:
            mol_idx += 1
            if mol is None:
                invalid_entries.append({
                    "entry_index": mol_idx,
                    "identifier": f"SDF Entry #{mol_idx}",
                    "raw_data": "Invalid MOL block",
                    "reason": "RDKit failed to parse MOL block (corrupt valence or coordinate format).",
                })
                continue
            try:
                name = mol.GetProp("_Name") if mol.HasProp("_Name") else f"Compound_{mol_idx}"
                smiles = Chem.MolToSmiles(mol)
                mw = round(Descriptors.MolWt(mol), 2)
                logp = round(Descriptors.MolLogP(mol), 2)
                hbd = Descriptors.NumHDonors(mol)
                hba = Descriptors.NumHAcceptors(mol)
                rotb = Descriptors.NumRotatableBonds(mol)

                valid_compounds.append({
                    "id": f"LIB-{mol_idx:04d}",
                    "name": name.strip() or f"Compound_{mol_idx}",
                    "smiles": smiles,
                    "molecular_weight": mw,
                    "log_p": logp,
                    "hbd": hbd,
                    "hba": hba,
                    "rotatable_bonds": rotb,
                    "formula": Chem.rdMolDescriptors.CalcMolFormula(mol),
                })
            except Exception as e:
                invalid_entries.append({
                    "entry_index": mol_idx,
                    "identifier": f"SDF Entry #{mol_idx}",
                    "raw_data": "Exception during descriptor calculation",
                    "reason": str(e),
                })
    else:
        # CSV parser
        # Detect delimiter (comma, tab, semicolon)
        sample = content[:2048]
        delimiter = "\t" if "\t" in sample and "," not in sample else (";" if ";" in sample and "," not in sample else ",")
        reader = csv.DictReader(io.StringIO(content), delimiter=delimiter)
        
        # Normalize column keys
        fieldnames = [f.strip().lower() for f in (reader.fieldnames or [])]
        smiles_key = next((k for k in (reader.fieldnames or []) if k.strip().lower() in ("smiles", "smi", "canonical_smiles", "structure")), None)
        name_key = next((k for k in (reader.fieldnames or []) if k.strip().lower() in ("name", "compound_name", "id", "compound_id", "title")), None)

        if not smiles_key:
            # Fallback: check each row for any column containing a valid SMILES
            pass

        row_idx = 0
        for row in reader:
            row_idx += 1
            raw_smiles = (row.get(smiles_key, "") if smiles_key else "").strip()
            # If no smiles_key, scan all values
            if not raw_smiles:
                for val in row.values():
                    if val and ("C" in val or "c" in val) and len(val) >= 3:
                        raw_smiles = val.strip()
                        break

            raw_name = (row.get(name_key, "") if name_key else "").strip() or f"Compound_{row_idx}"

            if not raw_smiles:
                invalid_entries.append({
                    "entry_index": row_idx,
                    "identifier": raw_name,
                    "raw_data": str(row),
                    "reason": "Missing SMILES structure string in row.",
                })
                continue

            # Validate using RDKit
            mol = Chem.MolFromSmiles(raw_smiles)
            if mol is None:
                invalid_entries.append({
                    "entry_index": row_idx,
                    "identifier": raw_name,
                    "raw_data": raw_smiles,
                    "reason": "Invalid SMILES syntax: RDKit Kekulization or valence error.",
                })
                continue

            try:
                canonical_smi = Chem.MolToSmiles(mol)
                mw = round(Descriptors.MolWt(mol), 2)
                logp = round(Descriptors.MolLogP(mol), 2)
                hbd = Descriptors.NumHDonors(mol)
                hba = Descriptors.NumHAcceptors(mol)
                rotb = Descriptors.NumRotatableBonds(mol)
                formula = Chem.rdMolDescriptors.CalcMolFormula(mol)

                valid_compounds.append({
                    "id": f"LIB-{row_idx:04d}",
                    "name": raw_name,
                    "smiles": canonical_smi,
                    "molecular_weight": mw,
                    "log_p": logp,
                    "hbd": hbd,
                    "hba": hba,
                    "rotatable_bonds": rotb,
                    "formula": formula,
                })
            except Exception as e:
                invalid_entries.append({
                    "entry_index": row_idx,
                    "identifier": raw_name,
                    "raw_data": raw_smiles,
                    "reason": f"Descriptor calculation failed: {str(e)}",
                })

    return {
        "filename": filename,
        "file_type": file_type,
        "total_parsed": len(valid_compounds) + len(invalid_entries),
        "valid_count": len(valid_compounds),
        "invalid_count": len(invalid_entries),
        "valid_compounds": valid_compounds,
        "invalid_entries": invalid_entries,
    }


def create_batch_screening_job(
    target_gene: str,
    pdb_id: Optional[str],
    pocket_info: Dict[str, Any],
    compounds: List[Dict[str, Any]],
    exhaustiveness: int = 8,
    owner_id: Optional[str] = None,
) -> str:
    """Creates a new batch virtual screening queue and starts background processing."""
    batch_id = f"BATCH-{uuid.uuid4().hex[:8].upper()}"
    
    tasks = []
    for c in compounds:
        tasks.append({
            "compound_id": c.get("id"),
            "compound_name": c.get("name"),
            "smiles": c.get("smiles"),
            "molecular_weight": c.get("molecular_weight"),
            "log_p": c.get("log_p"),
            "formula": c.get("formula"),
            "status": "pending",  # pending, running, completed, failed, cancelled
            "docking_score_kcal_mol": None,  # NEVER fabricated
            "estimated_kd_nm": None,
            "error_message": None,
            "completed_at": None,
        })

    BATCH_JOBS[batch_id] = {
        "batch_id": batch_id,
        "owner_id": owner_id,
        "target_gene": target_gene,
        "pdb_id": pdb_id or "Custom",
        "pocket_info": pocket_info,
        "exhaustiveness": exhaustiveness,
        "status": "running",  # running, completed, cancelled, failed
        "total_compounds": len(tasks),
        "pending_count": len(tasks),
        "running_count": 0,
        "completed_count": 0,
        "failed_count": 0,
        "cancelled_count": 0,
        "tasks": tasks,
        "created_at": time.strftime("%Y-%m-%d %H:%M:%S"),
        "finished_at": None,
        "_cancel_requested": False,
    }

    # Start background task execution
    asyncio.create_task(_process_batch_queue(batch_id))
    return batch_id


async def _process_batch_queue(batch_id: str):
    """Worker that iterates through the batch compounds and computes real docking scores."""
    job = BATCH_JOBS.get(batch_id)
    if not job:
        return

    pocket = job.get("pocket_info", {})
    center_x = pocket.get("center_x", 15.0)
    center_y = pocket.get("center_y", 20.0)
    center_z = pocket.get("center_z", 18.0)
    box_size_x = pocket.get("box_size_x", 20.0)
    box_size_y = pocket.get("box_size_y", 20.0)
    box_size_z = pocket.get("box_size_z", 20.0)

    for task in job["tasks"]:
        if job.get("_cancel_requested"):
            task["status"] = "cancelled"
            task["error_message"] = "Screening cancelled by researcher."
            job["cancelled_count"] += 1
            job["pending_count"] = max(0, job["pending_count"] - 1)
            continue

        task["status"] = "running"
        job["running_count"] = 1
        job["pending_count"] = max(0, job["pending_count"] - 1)

        # Allow event loop yield
        await asyncio.sleep(0.05)

        try:
            dock_res = run_docking_simulation(
                compound_name=task["compound_name"],
                smiles=task["smiles"],
                target_gene=job["target_gene"],
                pdb_id=job["pdb_id"],
                exhaustiveness=job["exhaustiveness"],
                num_modes=3,
                grid_center=[center_x, center_y, center_z],
                grid_size=[box_size_x, box_size_y, box_size_z],
            )

            best_affinity = dock_res.get("docking_score")
            kd_nm = dock_res.get("predicted_kd_nm")

            task["status"] = "completed"
            task["docking_score_kcal_mol"] = best_affinity
            task["estimated_kd_nm"] = kd_nm
            task["completed_at"] = time.strftime("%H:%M:%S")
            job["completed_count"] += 1
        except Exception as e:
            task["status"] = "failed"
            task["docking_score_kcal_mol"] = None
            task["error_message"] = f"Docking execution failed: {str(e)}"
            job["failed_count"] += 1

        job["running_count"] = 0

    if job.get("_cancel_requested"):
        job["status"] = "cancelled"
    else:
        job["status"] = "completed"
    job["finished_at"] = time.strftime("%Y-%m-%d %H:%M:%S")


def get_batch_job_status(batch_id: str) -> Optional[Dict[str, Any]]:
    """Returns current status and results of a batch virtual screening job."""
    return BATCH_JOBS.get(batch_id)


def cancel_batch_job(batch_id: str) -> bool:
    """Signals cancellation of a running batch screening job."""
    job = BATCH_JOBS.get(batch_id)
    if not job:
        return False
    job["_cancel_requested"] = True
    return True
