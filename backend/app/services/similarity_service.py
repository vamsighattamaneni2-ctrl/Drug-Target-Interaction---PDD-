"""
Molecular Similarity Search Service (Feature 3)
Calculates:
- Real RDKit Morgan chemical fingerprints (ECFP4 equivalent, radius=2, 2048 bits).
- Exact Tanimoto similarity coefficient: T(A,B) = |A ∩ B| / |A ∪ B|.
- Distinguishes 2D chemical structural similarity from biological target activity.
"""

from typing import Any, Dict, List, Optional
from rdkit import Chem
from rdkit.Chem import AllChem, DataStructs, Descriptors


# Comprehensive Reference Database of Kinase Inhibitors and Bioactive Compounds
REFERENCE_LIBRARY = [
    {
        "id": "DB00619",
        "name": "Imatinib",
        "smiles": "CC1=C(C=C(C=C1)NC(=O)C2=CC=C(CN3CCN(C)CC3)C=C2)NC4=NC=CC(=N4)C5=CN=CC=C5",
        "target_class": "Abl / PDGFR / c-Kit Tyrosine Kinase",
        "approval_status": "FDA Approved",
    },
    {
        "id": "DB00530",
        "name": "Erlotinib",
        "smiles": "COCCOC1=C(C=C2C(=C1)C(=NC=N2)NC3=CC=CC(=C3)C#C)OCCOC",
        "target_class": "EGFR Tyrosine Kinase",
        "approval_status": "FDA Approved",
    },
    {
        "id": "DB00317",
        "name": "Gefitinib",
        "smiles": "COC1=C(OCC2=CC=CC=C2)C=C2C(=C1)N=CN=C2NC1=CC(Cl)=C(F)C=C1",
        "target_class": "EGFR Tyrosine Kinase",
        "approval_status": "FDA Approved",
    },
    {
        "id": "DB09330",
        "name": "Osimertinib",
        "smiles": "CN(C)CC=CC(=O)NC1=C(C=C(C(=C1)NC2=NC=CC(=N2)C3=CN(C4=CC=CC=C43)C)OC)NC(=O)C=C",
        "target_class": "EGFR T790M Mutant Kinase",
        "approval_status": "FDA Approved",
    },
    {
        "id": "DB01259",
        "name": "Lapatinib",
        "smiles": "CS(=O)(=O)CCNCC1=CC=C(O1)C2=CC=C(C=C2)NC3=NC=NC4=CC(=C(C=C43)Cl)OCC5=CC(=CC=C5)F",
        "target_class": "Dual EGFR / HER2 Kinase",
        "approval_status": "FDA Approved",
    },
    {
        "id": "DB01254",
        "name": "Dasatinib",
        "smiles": "CC1=C(C(=CC=C1)Cl)NC(=O)C2=CN=C(S2)NC3=NC=C(N=C3)N4CCN(CC4)CCO",
        "target_class": "Multi-target BCR-ABL / Src Kinase",
        "approval_status": "FDA Approved",
    },
    {
        "id": "DB04868",
        "name": "Nilotinib",
        "smiles": "CC1=C(C=C(C=C1)NC(=O)C2=CC(=CC(=C2)C(F)(F)F)C3=CN(C=N3)C)NC4=NC=CC(=N4)C5=CN=CC=C5",
        "target_class": "BCR-ABL1 Second Generation",
        "approval_status": "FDA Approved",
    },
    {
        "id": "DB08901",
        "name": "Ponatinib",
        "smiles": "CC1=C(C=C(C=C1)C#CC2=CN=C3N2N=CC=C3)NC(=O)C4=CC(=C(C=C4)CN5CCN(CC5)C)C(F)(F)F",
        "target_class": "BCR-ABL1 T315I Gatekeeper Inhibitor",
        "approval_status": "FDA Approved",
    },
    {
        "id": "DB00214",
        "name": "Sorafenib",
        "smiles": "CNC(=O)C1=NC=CC(=C1)OC2=CC=C(C=C2)NC(=O)NC3=CC(=C(C=C3)Cl)C(F)(F)F",
        "target_class": "VEGFR / PDGFR / Raf Kinase",
        "approval_status": "FDA Approved",
    },
    {
        "id": "DB00398",
        "name": "Sunitinib",
        "smiles": "CCN(CC)CCNC(=O)C1=C(NC(=C1C)/C=C/2\\C3=C(C=CC(=C3)F)NC2=O)C",
        "target_class": "Multi-kinase VEGFR / Kit / FLT3",
        "approval_status": "FDA Approved",
    },
    {
        "id": "DB08896",
        "name": "Regorafenib",
        "smiles": "CNC(=O)C1=NC=CC(=C1)OC2=C(C=C(C=C2)NC(=O)NC3=CC(=C(C=C3)Cl)C(F)(F)F)F",
        "target_class": "Angiogenic & Stromal Kinases",
        "approval_status": "FDA Approved",
    },
    {
        "id": "DB11714",
        "name": "Brigatinib",
        "smiles": "CP(=O)(C)C1=CC=C(C=C1)NC2=NC=C(C(=N2)NC3=C(C=CC=C3Cl)P(=O)(C)C)Cl",
        "target_class": "ALK / ROS1 / EGFR Dual",
        "approval_status": "FDA Approved",
    },
]


def search_molecular_similarity(
    query_smiles: str,
    threshold: float = 0.35,
    max_results: int = 10,
    custom_library: Optional[List[Dict[str, Any]]] = None,
) -> Dict[str, Any]:
    """
    Computes Morgan ECFP4 fingerprints and evaluates Tanimoto similarity
    against the reference library and optional user-provided candidates.
    """
    clean_smi = query_smiles.strip()
    query_mol = Chem.MolFromSmiles(clean_smi)
    if query_mol is None:
        raise ValueError(f"Invalid query SMILES: '{query_smiles}'. RDKit parsing failed.")

    # Generate query Morgan fingerprint (radius 2 = ECFP4, 2048 bits)
    query_fp = AllChem.GetMorganFingerprintAsBitVect(query_mol, radius=2, nBits=2048)
    query_mw = round(Descriptors.MolWt(query_mol), 2)
    query_logp = round(Descriptors.MolLogP(query_mol), 2)
    query_formula = Chem.rdMolDescriptors.CalcMolFormula(query_mol)

    target_pool = list(REFERENCE_LIBRARY)
    if custom_library:
        target_pool.extend(custom_library)

    results = []
    for entry in target_pool:
        ref_smi = entry.get("smiles", "")
        if not ref_smi:
            continue
        ref_mol = Chem.MolFromSmiles(ref_smi)
        if ref_mol is None:
            continue

        ref_fp = AllChem.GetMorganFingerprintAsBitVect(ref_mol, radius=2, nBits=2048)
        tanimoto_score = round(DataStructs.TanimotoSimilarity(query_fp, ref_fp), 4)

        if tanimoto_score >= threshold:
            results.append({
                "id": entry.get("id", "REF"),
                "name": entry.get("name", "Candidate"),
                "smiles": ref_smi,
                "tanimoto_similarity": tanimoto_score,
                "molecular_weight": round(Descriptors.MolWt(ref_mol), 2),
                "log_p": round(Descriptors.MolLogP(ref_mol), 2),
                "hbd": Descriptors.NumHDonors(ref_mol),
                "hba": Descriptors.NumHAcceptors(ref_mol),
                "target_class": entry.get("target_class", "Bioactive Compound"),
                "approval_status": entry.get("approval_status", "Investigational"),
                "pubchem_cid": entry.get("pubchem_cid"),
            })

    # Sort descending by Tanimoto similarity
    results.sort(key=lambda x: x["tanimoto_similarity"], reverse=True)

    return {
        "query": {
            "smiles": Chem.MolToSmiles(query_mol),
            "molecular_weight": query_mw,
            "log_p": query_logp,
            "formula": query_formula,
        },
        "fingerprint_type": "Morgan ECFP4 (Radius 2, 2048 Bits)",
        "metric": "Tanimoto Similarity Coefficient T(A,B)",
        "threshold": threshold,
        "total_matches": len(results),
        "matches": results[:max_results],
        "scientific_caveat": (
            "IMPORTANT PHARMACOLOGICAL DISTINCTION: High 2D chemical topological similarity "
            "(Tanimoto score ≥ 0.70) indicates shared chemical scaffolds and pharmacophore features, "
            "but does NOT guarantee identical biological activity, potency, or target selectivity. "
            "Minor structural modifications (e.g., 'magic methyl' effects or gatekeeper mutations) "
            "frequently cause steep activity cliffs or switch kinase inhibitory profiles."
        ),
    }
