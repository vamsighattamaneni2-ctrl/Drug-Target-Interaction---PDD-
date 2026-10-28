-- ============================================================================
-- Drug–Target Interaction Analysis Tool for Therapeutic Discovery
-- PostgreSQL Relational Database Schema (Version 1.0)
-- 20 Normalized Relational Tables with Indexes, Foreign Keys & Constraints
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "citext";

-- ----------------------------------------------------------------------------
-- 1. ROLES & PERMISSIONS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL, -- 'Researcher', 'Senior Scientist', 'Administrator'
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ----------------------------------------------------------------------------
-- 2. USERS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email CITEXT UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    institution VARCHAR(255),
    research_role VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    is_verified BOOLEAN DEFAULT FALSE,
    last_login TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ----------------------------------------------------------------------------
-- 3. USER ROLES (Multi-tenant RBAC Junction)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS user_roles (
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_id INT NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    assigned_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, role_id)
);

-- ----------------------------------------------------------------------------
-- 4. DATA SOURCES
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS data_sources (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL, -- 'PubChem', 'ChEMBL', 'UniProt', 'RCSB PDB'
    version VARCHAR(50),
    base_url VARCHAR(255),
    license VARCHAR(100),
    last_synced TIMESTAMPTZ,
    status VARCHAR(50) DEFAULT 'ACTIVE'
);

-- ----------------------------------------------------------------------------
-- 5. COMPOUNDS (Small Molecules & Ligands)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS compounds (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    primary_name VARCHAR(255) NOT NULL,
    formula VARCHAR(100) NOT NULL,
    molecular_weight NUMERIC(10, 4) NOT NULL,
    canonical_smiles TEXT NOT NULL,
    inchi_key VARCHAR(50) UNIQUE,
    log_p NUMERIC(6, 3),
    h_bond_donors INT DEFAULT 0,
    h_bond_acceptors INT DEFAULT 0,
    rotatable_bonds INT DEFAULT 0,
    tpsa NUMERIC(8, 3),
    source_id INT REFERENCES data_sources(id) ON DELETE SET NULL,
    source_compound_id VARCHAR(100),
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_compounds_name ON compounds(primary_name);
CREATE INDEX IF NOT EXISTS idx_compounds_smiles ON compounds(canonical_smiles);

-- ----------------------------------------------------------------------------
-- 6. COMPOUND IDENTIFIERS (Cross-reference Keys)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS compound_identifiers (
    id SERIAL PRIMARY KEY,
    compound_id UUID NOT NULL REFERENCES compounds(id) ON DELETE CASCADE,
    identifier_type VARCHAR(50) NOT NULL, -- 'PubChem_CID', 'ChEMBL_ID', 'DrugBank_ID', 'CAS'
    identifier_value VARCHAR(100) NOT NULL,
    UNIQUE (identifier_type, identifier_value)
);

-- ----------------------------------------------------------------------------
-- 7. PROTEIN TARGETS (Macromolecules & Enzymes)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS protein_targets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    target_name VARCHAR(255) NOT NULL,
    gene_symbol VARCHAR(50) NOT NULL,
    uniprot_accession VARCHAR(30) UNIQUE NOT NULL,
    organism VARCHAR(100) DEFAULT 'Homo sapiens',
    target_class VARCHAR(100),
    biological_function TEXT,
    sequence TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_targets_gene ON protein_targets(gene_symbol);
CREATE INDEX IF NOT EXISTS idx_targets_uniprot ON protein_targets(uniprot_accession);

-- ----------------------------------------------------------------------------
-- 8. PROTEIN STRUCTURES (PDB Coordinates & AlphaFold Models)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS protein_structures (
    id SERIAL PRIMARY KEY,
    target_id UUID NOT NULL REFERENCES protein_targets(id) ON DELETE CASCADE,
    pdb_id VARCHAR(10) NOT NULL, -- e.g. '1M17', '1IEP'
    experimental_method VARCHAR(50), -- 'X-ray Diffraction', 'Cryo-EM'
    resolution_angstrom NUMERIC(4, 2),
    file_uri VARCHAR(512),
    deposition_date DATE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (target_id, pdb_id)
);

-- ----------------------------------------------------------------------------
-- 9. ANALYSES (Computational Docking & Binding Jobs)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS analyses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    analysis_code VARCHAR(50) UNIQUE NOT NULL, -- e.g. 'DTI-2026-8941'
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    compound_id UUID NOT NULL REFERENCES compounds(id) ON DELETE CASCADE,
    target_id UUID NOT NULL REFERENCES protein_targets(id) ON DELETE CASCADE,
    structure_id INT REFERENCES protein_structures(id) ON DELETE SET NULL,
    computational_method VARCHAR(100) NOT NULL, -- 'AutoDock Vina', 'RDKit MMFF94'
    status VARCHAR(30) NOT NULL DEFAULT 'QUEUED', -- 'QUEUED', 'RUNNING', 'COMPLETED', 'FAILED'
    submitted_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMPTZ,
    error_message TEXT
);

CREATE INDEX IF NOT EXISTS idx_analyses_user ON analyses(user_id);
CREATE INDEX IF NOT EXISTS idx_analyses_status ON analyses(status);

-- ----------------------------------------------------------------------------
-- 10. ANALYSIS PARAMETERS (Simulation Configuration Grid)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS analysis_parameters (
    id SERIAL PRIMARY KEY,
    analysis_id UUID UNIQUE NOT NULL REFERENCES analyses(id) ON DELETE CASCADE,
    grid_center_x NUMERIC(8, 3) NOT NULL,
    grid_center_y NUMERIC(8, 3) NOT NULL,
    grid_center_z NUMERIC(8, 3) NOT NULL,
    grid_size_x NUMERIC(6, 2) NOT NULL,
    grid_size_y NUMERIC(6, 2) NOT NULL,
    grid_size_z NUMERIC(6, 2) NOT NULL,
    exhaustiveness INT DEFAULT 8,
    num_modes INT DEFAULT 9,
    energy_range NUMERIC(4, 2) DEFAULT 3.0,
    custom_options JSONB DEFAULT '{}'::jsonb
);

-- ----------------------------------------------------------------------------
-- 11. INTERACTION RESULTS (Calculated Binding Energies)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS interaction_results (
    id SERIAL PRIMARY KEY,
    analysis_id UUID UNIQUE NOT NULL REFERENCES analyses(id) ON DELETE CASCADE,
    docking_score_kcal NUMERIC(6, 2), -- e.g. -11.80
    rmsd_lower_bound NUMERIC(5, 2),
    rmsd_upper_bound NUMERIC(5, 2),
    predicted_kd_nm NUMERIC(12, 3),
    confidence_tier VARCHAR(20), -- 'HIGH', 'MODERATE', 'LOW'
    pose_file_uri VARCHAR(512),
    summary TEXT
);

-- ----------------------------------------------------------------------------
-- 12. INTERACTION CONTACTS (Residue Contacts & Pocket Vectors)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS interaction_contacts (
    id SERIAL PRIMARY KEY,
    analysis_id UUID NOT NULL REFERENCES analyses(id) ON DELETE CASCADE,
    residue_name VARCHAR(10) NOT NULL, -- e.g. 'Thr', 'Asp'
    residue_number INT NOT NULL,
    atom_name VARCHAR(10),
    contact_type VARCHAR(50) NOT NULL, -- 'Hydrogen Bond', 'Hydrophobic', 'Salt Bridge'
    distance_angstrom NUMERIC(4, 2) NOT NULL,
    energy_contribution_kcal NUMERIC(6, 2)
);

CREATE INDEX IF NOT EXISTS idx_contacts_analysis ON interaction_contacts(analysis_id);

-- ----------------------------------------------------------------------------
-- 13. ADMET RESULTS (In Silico Pharmacokinetics & Toxicity)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS admet_results (
    id SERIAL PRIMARY KEY,
    compound_id UUID NOT NULL REFERENCES compounds(id) ON DELETE CASCADE,
    model_version VARCHAR(50) NOT NULL,
    gi_absorption VARCHAR(20), -- 'High', 'Moderate', 'Low'
    caco2_permeability NUMERIC(8, 3),
    bioavailability_score NUMERIC(4, 2),
    plasma_protein_binding_pct NUMERIC(5, 2),
    bbb_permeability VARCHAR(30), -- 'Permeable', 'Non-Permeable'
    volume_of_distribution NUMERIC(6, 2),
    cyp3a4_substrate BOOLEAN,
    cyp3a4_inhibitor BOOLEAN,
    cyp2d6_inhibitor BOOLEAN,
    cyp2c9_inhibitor BOOLEAN,
    total_clearance NUMERIC(8, 3),
    elimination_half_life_hours NUMERIC(6, 2),
    herg_risk VARCHAR(20),
    ames_mutagenicity VARCHAR(50),
    hepatotoxicity_risk VARCHAR(50),
    lipinski_violations INT DEFAULT 0,
    prediction_timestamp TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ----------------------------------------------------------------------------
-- 14. COLLECTIONS (Custom Research Notebook Folders)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS collections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ----------------------------------------------------------------------------
-- 15. COLLECTION ITEMS (Junction for Compounds & Targets in Collections)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS collection_items (
    id SERIAL PRIMARY KEY,
    collection_id UUID NOT NULL REFERENCES collections(id) ON DELETE CASCADE,
    item_type VARCHAR(20) NOT NULL, -- 'compound', 'target'
    entity_id UUID NOT NULL,
    notes TEXT,
    added_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (collection_id, item_type, entity_id)
);

-- ----------------------------------------------------------------------------
-- 16. SAVED COMPOUNDS (Direct Bookmarks)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS saved_compounds (
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    compound_id UUID NOT NULL REFERENCES compounds(id) ON DELETE CASCADE,
    notes TEXT,
    saved_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, compound_id)
);

-- ----------------------------------------------------------------------------
-- 17. SAVED TARGETS (Direct Bookmarks)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS saved_targets (
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    target_id UUID NOT NULL REFERENCES protein_targets(id) ON DELETE CASCADE,
    notes TEXT,
    saved_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, target_id)
);

-- ----------------------------------------------------------------------------
-- 18. REPORTS (Generated PDF & CSV Audit Artifacts)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    report_code VARCHAR(50) UNIQUE NOT NULL,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    analysis_id UUID REFERENCES analyses(id) ON DELETE SET NULL,
    report_title VARCHAR(255) NOT NULL,
    file_format VARCHAR(20) NOT NULL, -- 'PDF', 'CSV'
    file_uri VARCHAR(512),
    generated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ----------------------------------------------------------------------------
-- 19. NOTIFICATIONS (In-app Event Stream)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(150) NOT NULL,
    message TEXT NOT NULL,
    notification_type VARCHAR(50) NOT NULL, -- 'COMPLETED', 'FAILED', 'WARNING', 'INFO'
    link_url VARCHAR(255),
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON notifications(user_id, is_read);

-- ----------------------------------------------------------------------------
-- 20. AUDIT LOGS (Immutable Security & Compliance Record)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS audit_logs (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id VARCHAR(100),
    ip_address VARCHAR(45),
    status VARCHAR(20) NOT NULL, -- 'SUCCESS', 'FAILED', 'DENIED'
    details JSONB,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);

-- ----------------------------------------------------------------------------
-- INITIAL SEED DATA
-- ----------------------------------------------------------------------------
INSERT INTO roles (name, description) VALUES
    ('Researcher', 'Standard investigator with access to molecular libraries, docking, and reports.'),
    ('Senior Scientist', 'Privileged scientist with multi-compound comparison and team collection access.'),
    ('Administrator', 'System operator with user management, job queue diagnostic, and cluster monitoring privileges.')
ON CONFLICT (name) DO NOTHING;

INSERT INTO data_sources (name, version, base_url, license) VALUES
    ('PubChem', '2024.10', 'https://pubchem.ncbi.nlm.nih.gov/rest/v2', 'Public Domain'),
    ('ChEMBL', 'ChEMBL_33', 'https://www.ebi.ac.uk/chembl/api/data', 'CC BY-SA 3.0'),
    ('UniProt', '2024_05', 'https://rest.uniprot.org/uniprotkb', 'CC BY 4.0'),
    ('RCSB PDB', 'v1', 'https://data.rcsb.org/rest/v1', 'CC0 1.0')
ON CONFLICT (name) DO NOTHING;
