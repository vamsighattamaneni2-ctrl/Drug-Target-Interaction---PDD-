package com.drugtarget.discovery.data.repository

data class ExternalTargetRecord(
    val targetId: String,
    val gene: String,
    val protein: String,
    val organism: String,
    val pdbId: String,
    val databaseSource: String, // "NCBI / PDB"
    val description: String
)

data class ExternalLigandRecord(
    val compoundId: String,
    val name: String,
    val formula: String,
    val mw: Double,
    val smiles: String,
    val logP: Double,
    val databaseSource: String // "ChEMBL / DrugBank"
)

object ExternalDatabaseSearch {
    val publicTargets = listOf(
        ExternalTargetRecord("CHEMBL203", "EGFR", "Epidermal Growth Factor Receptor", "Homo sapiens", "1IVO", "NCBI / PDB", "Receptor tyrosine kinase mutated in NSCLC."),
        ExternalTargetRecord("CHEMBL205", "ESR1", "Estrogen Receptor Alpha", "Homo sapiens", "1ERE", "NCBI / PDB", "Nuclear receptor transcription factor in breast cancer."),
        ExternalTargetRecord("CHEMBL217", "ACE", "Angiotensin-Converting Enzyme", "Homo sapiens", "1O86", "NCBI / PDB", "Regulates blood pressure and vascular tone."),
        ExternalTargetRecord("CHEMBL220", "ADORA2A", "Adenosine A2a Receptor", "Homo sapiens", "3EML", "NCBI / PDB", "GPCR modulating inflammation and neurotransmission."),
        ExternalTargetRecord("CHEMBL2095", "BCR-ABL1", "BCR-ABL Tyrosine Kinase", "Homo sapiens", "1IEP", "NCBI / PDB", "Constitutively active kinase in CML."),
        ExternalTargetRecord("CHEMBL612", "TP53", "Tumor Protein p53", "Homo sapiens", "2OCJ", "NCBI / PDB", "Master tumor suppressor transcription factor."),
        ExternalTargetRecord("CHEMBL340", "VEGFR2", "Vascular Endothelial GF Receptor 2", "Homo sapiens", "2OH4", "NCBI / PDB", "Mediates endothelial cell proliferation and angiogenesis."),
        ExternalTargetRecord("CHEMBL1862", "TNF", "Tumor Necrosis Factor", "Homo sapiens", "1TNF", "NCBI / PDB", "Pro-inflammatory cytokine implicated in autoimmune disorders."),
        ExternalTargetRecord("CHEMBL2823", "BRAF", "Serine/threonine-protein kinase B-raf", "Homo sapiens", "4EZH", "NCBI / PDB", "MAPK/ERK signaling pathway kinase mutated in melanoma."),
        ExternalTargetRecord("CHEMBL5159", "KRAS", "GTPase KRas", "Homo sapiens", "4OBE", "NCBI / PDB", "Small GTPase frequently mutated in pancreatic and colorectal cancer.")
    )

    val publicLigands = listOf(
        ExternalLigandRecord("CHEMBL941", "Imatinib", "C29H31N7O", 493.6, "CC1=C(C=C(C=C1)NC(=O)c2ccc(cc2)CN3CCN(CC3)C)Nc4nccc(n4)c5cccnc5", 4.5, "ChEMBL / DrugBank"),
        ExternalLigandRecord("CHEMBL921", "Gefitinib", "C22H24ClFN4O3", 446.9, "COc1cc2ncnc(Nc3ccc(F)c(Cl)c3)c2cc1OCCCN4CCOCC4", 4.2, "ChEMBL"),
        ExternalLigandRecord("CHEMBL534", "Doxorubicin", "C27H29NO11", 543.5, "COc1cccc2C(=O)c3c(O)c4CC(O)(CC(=O)CO)Oc4c(O)c3C(=O)c12", 1.3, "ChEMBL"),
        ExternalLigandRecord("CHEMBL521", "Ibuprofen", "C13H18O2", 206.3, "CC(C)Cc1ccc(cc1)C(C)C(O)=O", 3.5, "ChEMBL"),
        ExternalLigandRecord("CHEMBL25", "Aspirin", "C9H8O4", 180.2, "CC(=O)Oc1ccccc1C(O)=O", 1.2, "ChEMBL"),
        ExternalLigandRecord("CHEMBL1235", "Dexamethasone", "C22H29FO5", 392.5, "C[C@@H]1C[C@H]2[C@@H]3CCC4=CC(=O)C=C[C@@]4(C)[C@@]3(F)[C@@H](O)C[C@@]2(C)[C@@]1(O)C(=O)CO", 1.8, "ChEMBL"),
        ExternalLigandRecord("CHEMBL303792", "Etoposide", "C29H32O13", 588.6, "COc1cc2c(cc1OC)[C@@H]3[C@@H]4CC5=CC=6OCOC=6C=C5[C@@H]4[C@@H](O3)CO2", 0.5, "ChEMBL"),
        ExternalLigandRecord("CHEMBL3989", "Dasatinib", "C22H26ClN7O2S", 488.0, "Clc1cc(Nc2ncc(cc2Cl)C(=O)Nc3cc(C)cc(c3)N4CCN(CC4)CCO)nc(n1)C", 3.7, "ChEMBL"),
        ExternalLigandRecord("CHEMBL59", "Erlotinib", "C22H23N3O4", 393.4, "COCCOC1=CC(=C(C=C1)OC)Nc2nc3cc(c(cc3nc2)OCC#C)OC", 2.9, "ChEMBL"),
        ExternalLigandRecord("CHEMBL1165", "Paclitaxel", "C47H51NO14", 853.9, "CC(=O)OC1C(C(C2(C(CC3(C4CC(C5(C(CC(C6C5(C(CC6=O)OC(=O)C7=CC=CC=C7)O)CO4)(OC(=O)C)C)CC3)OC(=O)C8=CC=CC=C8)C2(C1=O)O)O)OC(=O)C)C)", 3.0, "ChEMBL")
    )
}
