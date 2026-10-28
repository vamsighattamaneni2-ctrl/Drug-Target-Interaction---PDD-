"""
Verification and Test Suite for DrugNet Scientific Pipeline:
- PubChem, ChEMBL, UniProt, RCSB PDB, PubMed Connectors
- Molecular Preparation
- AutoDock Vina Docking Simulation
- ADMET Pharmacokinetic & Toxicity Prediction
- Binding-Pocket Detection (fpocket / P2Rank compatible)
- Batch Virtual Screening Library Validation (CSV & SDF)
- RDKit Molecular Similarity Search (Morgan ECFP4 / Tanimoto)
- PDF and DOCX Report Generation
- Research Project History & Reproducibility Sessions
"""

import asyncio
import sys
from app.services.external_sources import (
    search_pubchem_compounds,
    search_chembl_molecules,
    search_uniprot_proteins,
    get_rcsb_pdb_details,
    search_pubmed_literature,
)
from app.services.docking_service import (
    prepare_ligand,
    prepare_protein_receptor,
    run_docking_simulation,
)
from app.services.admet_service import predict_admet_profile
from app.services.pocket_service import detect_binding_pockets
from app.services.batch_screening_service import validate_and_parse_library
from app.services.similarity_service import search_molecular_similarity
from app.services.report_export_service import generate_pdf_report, generate_docx_report
from app.services.project_service import save_research_project, list_research_projects


async def test_external_sources():
    print("\n--- 1. Testing External Bioinformatics Sources ---")
    
    # 1. PubChem
    pubchem = await search_pubchem_compounds("Imatinib", limit=2)
    assert len(pubchem) > 0, "PubChem search returned no results"
    print(f"[OK] PubChem: Found '{pubchem[0]['name']}' (CID: {pubchem[0]['cid']}, MW: {pubchem[0]['molecular_weight']})")

    # 2. ChEMBL
    chembl = await search_chembl_molecules("Gefitinib", limit=2)
    assert len(chembl) > 0, "ChEMBL search returned no results"
    print(f"[OK] ChEMBL: Found '{chembl[0]['name']}' ({chembl[0]['id']})")

    # 3. UniProt
    uniprot = await search_uniprot_proteins("EGFR", limit=2)
    assert len(uniprot) > 0, "UniProt search returned no results"
    print(f"[OK] UniProt: Found '{uniprot[0]['gene_symbol']}' ({uniprot[0]['uniprot_id']}) - PDB: {uniprot[0]['pdb_ids']}")

    # 4. RCSB PDB
    pdb = await get_rcsb_pdb_details("1M17")
    assert pdb is not None, "RCSB PDB returned None"
    print(f"[OK] RCSB PDB: Entry '{pdb['pdb_id']}' - Resolution: {pdb['resolution']}, Method: {pdb['experimental_method']}")

    # 5. PubMed
    pubmed = await search_pubmed_literature("Imatinib BCR-ABL", limit=2)
    assert len(pubmed) > 0, "PubMed literature returned no results"
    print(f"[OK] PubMed: Found {len(pubmed)} articles. Top: '{pubmed[0]['title'][:60]}...' (PMID: {pubmed[0]['pmid']})")


def test_docking_and_prep():
    print("\n--- 2. Testing Molecular Preparation & AutoDock Vina Docking ---")
    
    # Ligand Prep
    lig_prep = prepare_ligand(
        smiles="CC1=C(C=C(C=C1)NC(=O)C2=CC=C(CN3CCN(C)CC3)C=C2)NC4=NC=CC(=N4)C5=CN=CC=C5",
        compound_name="Imatinib",
        ph=7.4,
    )
    assert lig_prep["status"] == "prepared"
    assert lig_prep["heavy_atoms"] > 0
    print(f"[OK] Ligand Prep: Heavy Atoms: {lig_prep['heavy_atoms']}, Rotatable Bonds: {lig_prep['rotatable_bonds']}")

    # Protein Prep
    prot_prep = prepare_protein_receptor(pdb_id="1IEP", target_gene="BCR-ABL1")
    assert prot_prep["status"] == "prepared"
    assert "grid_center" in prot_prep
    print(f"[OK] Protein Prep: Target: {prot_prep['target_gene']}, Grid Box Center: {prot_prep['grid_center']}")

    # Docking Simulation
    docking = run_docking_simulation(
        compound_name="Imatinib",
        smiles="CC1=C(C=C(C=C1)NC(=O)C2=CC=C(CN3CCN(C)CC3)C=C2)NC4=NC=CC(=N4)C5=CN=CC=C5",
        target_gene="BCR-ABL1",
        pdb_id="1IEP",
        exhaustiveness=8,
        num_modes=9,
    )
    assert len(docking["modes"]) == 9, "Expected 9 docking modes"
    assert docking["docking_score"] < -6.0, f"Unexpected docking score: {docking['docking_score']}"
    assert len(docking["contacts"]) > 0, "Expected atomic contacts"
    assert "HEADER" in docking["docked_complex_pdb"] and "HETATM" in docking["docked_complex_pdb"], "PDB output missing key records"
    print(f"[OK] AutoDock Vina Simulation: Score: {docking['docking_score']} kcal/mol, Kd: {docking['predicted_kd_nm']} nM, Modes: {len(docking['modes'])}, Contacts: {len(docking['contacts'])}")


def test_admet_prediction():
    print("\n--- 3. Testing ADMET Pharmacokinetics & Toxicity Evaluation ---")
    
    admet = predict_admet_profile(
        compound_name="Imatinib",
        smiles="CC1=C(C=C(C=C1)NC(=O)C2=CC=C(CN3CCN(C)CC3)C=C2)NC4=NC=CC(=N4)C5=CN=CC=C5",
        molecular_weight=493.6,
        log_p=4.5,
        hbd=2,
        hba=7,
        rotatable_bonds=7,
        tpsa=86.3,
    )
    assert admet["gi_absorption"] in ("High", "Moderate", "Low")
    assert "lipinski_rule_of_five_passed" in admet
    print(f"[OK] ADMET: GI Absorption: {admet['gi_absorption']}, BBB: {admet['bbb_permeability']}, Lipinski Rule of 5 Passed: {admet['lipinski_rule_of_five_passed']}")
    print(f"[OK] Toxicity: hERG Risk: {admet['herg_inhibition_risk']}, Ames Mutagenicity: {admet['ames_mutagenicity']}, Hepatotoxicity: {admet['hepatotoxicity_risk']}")


def test_pocket_detection():
    print("\n--- 4. Testing Binding-Pocket Detection (Feature 1) ---")
    res = detect_binding_pockets(target_gene="BCR-ABL1", pdb_id="1IEP", max_pockets=3)
    assert res["pockets_found"] >= 2, f"Expected at least 2 pockets, got {res['pockets_found']}"
    primary = res["pockets"][0]
    assert primary["druggability_score"] >= 0.70, "Primary pocket should have high druggability"
    assert len(primary["lining_residues"]) > 0, "Pocket should have lining residues"
    print(f"[OK] Pocket Detection ({res['method']}): Found {res['pockets_found']} pockets. Primary: '{primary['pocket_id']}', Score: {primary['druggability_score']}, Volume: {primary['volume_angstrom3']} A^3")


def test_batch_library_validation():
    print("\n--- 5. Testing Batch Virtual Screening Library Validation (Feature 2) ---")
    test_csv = (
        "Name,SMILES\n"
        "Imatinib,CC1=C(C=C(C=C1)NC(=O)C2=CC=C(CN3CCN(C)CC3)C=C2)NC4=NC=CC(=N4)C5=CN=CC=C5\n"
        "Erlotinib,COCCOC1=C(C=C2C(=C1)C(=NC=N2)NC3=CC=CC(=C3)C#C)OCCOC\n"
        "InvalidMolecule,INVALID_SMILES_STRING_123\n"
    )
    res = validate_and_parse_library(test_csv, file_type="csv", filename="test_screen.csv")
    assert res["valid_count"] == 2, f"Expected 2 valid molecules, got {res['valid_count']}"
    assert res["invalid_count"] == 1, f"Expected 1 invalid entry, got {res['invalid_count']}"
    assert "Invalid SMILES" in res["invalid_entries"][0]["reason"]
    print(f"[OK] Batch Library Validation: Parsed {res['total_parsed']} entries -> {res['valid_count']} Valid, {res['invalid_count']} Invalid (Rejected syntax error)")


def test_rdkit_similarity_search():
    print("\n--- 6. Testing RDKit Molecular Similarity Search (Feature 3) ---")
    imatinib_smi = "CC1=C(C=C(C=C1)NC(=O)C2=CC=C(CN3CCN(C)CC3)C=C2)NC4=NC=CC(=N4)C5=CN=CC=C5"
    sim_res = search_molecular_similarity(imatinib_smi, threshold=0.30, max_results=5)
    assert len(sim_res["matches"]) > 0, "Expected similar compound matches"
    top_match = sim_res["matches"][0]
    assert top_match["tanimoto_similarity"] > 0.40, f"Expected high similarity for related kinase inhibitors, got {top_match['tanimoto_similarity']}"
    print(f"[OK] RDKit Fingerprint Search ({sim_res['fingerprint_type']}): Top Match: '{top_match['name']}', Tanimoto Similarity: {top_match['tanimoto_similarity']}")


def test_report_generation():
    print("\n--- 7. Testing PDF & DOCX Report Generation (Feature 9) ---")
    sample_data = {
        "compound_name": "Imatinib",
        "target_gene": "BCR-ABL1",
        "pdb_id": "1IEP",
        "smiles": "CC1=C(C=C(C=C1)NC(=O)C2=CC=C(CN3CCN(C)CC3)C=C2)NC4=NC=CC(=N4)C5=CN=CC=C5",
        "docking_score": "-11.4",
        "pocket": {"pocket_id": "Pocket-1 (ATP Cleft)", "druggability_score": 0.89, "volume_angstrom3": 1180.0},
    }
    pdf_bytes = generate_pdf_report(sample_data)
    assert len(pdf_bytes) > 1000, "PDF bytes should be non-empty"
    assert pdf_bytes.startswith(b"%PDF"), "Output is not a valid PDF header"
    print(f"[OK] ReportLab PDF Generation: Created {len(pdf_bytes)} byte valid PDF document")

    docx_bytes = generate_docx_report(sample_data)
    assert len(docx_bytes) > 1000, "DOCX bytes should be non-empty"
    print(f"[OK] python-docx Word Generation: Created {len(docx_bytes)} byte valid Word document")


def test_project_history():
    print("\n--- 8. Testing Research Project History & Session Reproducibility (Feature 7) ---")
    saved = save_research_project({
        "title": "Automated Unit Test Session",
        "compound_name": "Gefitinib",
        "target_gene": "EGFR",
        "pdb_id": "1M17",
        "smiles": "COC1=C(OCC2=CC=CC=C2)C=C2C(=C1)N=CN=C2NC1=CC(Cl)=C(F)C=C1",
    })
    assert saved["id"] is not None
    assert "SHA256" in saved["reproducibility_hash"]
    projects = list_research_projects()
    assert len(projects) >= 1
    print(f"[OK] Research Project Session: Saved ID '{saved['id']}' with Reproducibility Hash: {saved['reproducibility_hash']}")


async def main():
    try:
        await test_external_sources()
        test_docking_and_prep()
        test_admet_prediction()
        test_pocket_detection()
        test_batch_library_validation()
        test_rdkit_similarity_search()
        test_report_generation()
        test_project_history()
        print("\n==========================================================================")
        print("ALL 8 SCIENTIFIC SUITE TESTS PASSED! BACKEND CAPABILITIES VERIFIED 100%!")
        print("==========================================================================\n")
    except Exception as e:
        print(f"\n[FAIL] TEST FAILED: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == "__main__":
    asyncio.run(main())
