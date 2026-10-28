# Drug–Target Interaction Analysis Tool for Therapeutic Discovery

A professional, responsive computational platform and Android-compatible web application for pharmaceutical research, molecular docking analysis, structural biology evaluation, and in silico ADMET pharmacokinetic profiling.

---

## 1. System Overview & Architecture

The application is built to serve medicinal chemists, structural pharmacologists, and bioinformatics researchers with an audit-grade scientific workflow:

```
DrugTargetDiscovery/
├── web/                  # React 18 + TypeScript + Vite + Tailwind CSS + 3Dmol.js
│   ├── src/
│   │   ├── layouts/      # AppLayout (Clean header + Hamburger navigation drawer)
│   │   ├── pages/        # 15 Scientific research pages & Admin portal
│   │   ├── services/     # Unified appStateService with localStorage persistence
│   │   └── types/        # Comprehensive domain interfaces
│   └── public/images/    # Authentic laboratory & researcher photography
├── backend/              # Python FastAPI + Uvicorn + Pydantic
│   ├── app/
│   │   ├── api/v1/       # Endpoints for compounds, targets, docking, ADMET
│   │   ├── core/         # Settings, security, CORS
│   │   └── schemas/      # Request/response data models
│   └── database/         # PostgreSQL DDL migrations (schema.sql - 20 tables)
└── README.md             # Complete setup & deployment documentation
```

---

## 2. Strict UI/UX Standards Implemented

### Clean Dashboard Architecture (Zero Unwanted Navigation Options)
- **First Screen After Login**: The dashboard displays **no visible navigation options by default**.
- **No permanent sidebar**, no visible navigation drawer, no navigation shortcut cards, no module grid, and no persistent bottom navigation bar.
- **Header**:
  - Logo and Title: *“Drug–Target Interaction Analysis”*
  - Notification bell with unread badge counter
  - Profile avatar with quick role indicator
  - Hamburger menu button that opens the navigation drawer strictly on user demand.
- **Scientific Hero Section**:
  - High-resolution authentic scientific photography (`/images/hero_researchers_lab.jpg`) featuring real researchers in white laboratory coats examining molecular structures in a pharmaceutical laboratory.
  - Heading: *“Discover Better Therapeutic Candidates”*
  - Subtitle: *“Explore drug–target interactions, evaluate molecular properties, and support evidence-based therapeutic discovery.”*
  - Primary Action Button: **Start New Analysis** (`/analysis/new`).
- **Dashboard Summary**: Real database-driven counts for saved compounds, explored targets, completed analyses, and generated reports (zero when records are empty; never fabricated).
- **Recent Activity**: Compact 5-record table with status badges and quick 3D viewer links.

---

## 3. Navigation Drawer Hierarchy

The slide-out navigation drawer opens **only** when the user clicks the hamburger button and organizes 15 destinations:

### Research Workspace
1. **Dashboard** (`/dashboard`): Scientific hero, metrics, and latest analysis records.
2. **Drug / Compound Library** (`/compounds`): Search by Name, PubChem CID, ChEMBL ID, SMILES. 2D formulas, LogP, HBD/HBA, rotatable bonds, and coordinate export (.SDF, .MOL, .SMI, .JSON).
3. **Protein Target Library** (`/targets`): Query by Gene Symbol, UniProt ID, PDB ID, and organism. 3D viewer launch and PDB file downloads.
4. **New Interaction Analysis** (`/analysis/new`): Dedicated 5-step wizard (`Step 1: Select Compound → Step 2: Select Target → Step 3: Configure Parameters → Step 4: Submit → Step 5: Results`).
5. **Analysis History** (`/history`): Searchable audit trail with date/status filters, retry, duplicate, and deletion actions.
6. **Interaction Viewer** (`/viewer`): Hardware-accelerated 3Dmol.js WebGL structure viewer with pocket zooming, H-bond vectors, salt bridges, distance measurements, and residue contact table.
7. **ADMET Evaluation** (`/admet`): In silico profiling covering Absorption, Distribution, Metabolism (CYP3A4/2D6/2C9), Excretion, Toxicity (hERG, Ames, hepatotoxicity), and Lipinski Rule of 5 checklist.
8. **Compare Candidates** (`/compare`): Side-by-side matrix comparing physicochemical metrics, docking scores, ADMET predictions, and interaction residues.
9. **Reports** (`/reports`): Audit-grade scientific dossiers with PDF print styling and CSV numerical data exports.
10. **Saved Compounds** (`/saved`): Custom research collections (e.g., *“Kinase Inhibitors”*, *“Oncology Leads”*) with personal notes and direct analysis launching.

### Account & Administration
11. **Notifications** (`/notifications`): Event telemetry for dispatched jobs, convergence warnings, and completed reports.
12. **Profile** (`/profile`): Investigator credentials, institutional affiliation, session management, and account deletion requests.
13. **Settings** (`/settings`): Argon2 password updates, notification preferences, and AutoDock Vina worker configuration.
14. **Help and Documentation** (`/help`): Step-by-step discovery workflow, algorithm explanations (AutoDock Vina, RDKit, 3Dmol.js), external database citations, and literature references.
15. **Administrator Dashboard** (`/admin`): Privileged governance portal (only accessible to users with the Administrator role) for user account management, role assignment, job queue diagnostics, stack traces, and cluster health monitoring.

---

## 4. PostgreSQL Database Structure (20 Normalized Tables)

Located in `backend/database/schema.sql`:

1. `roles`: Role definitions (`Researcher`, `Senior Scientist`, `Administrator`).
2. `users`: Investigator accounts with secure password hashes and institutional affiliations.
3. `user_roles`: Multi-tenant role-based access control junction.
4. `data_sources`: Primary database registries (PubChem, ChEMBL, UniProt, RCSB PDB).
5. `compounds`: Small molecule structures, formulas, SMILES, InChIKeys, LogP, and rotatable bonds.
6. `compound_identifiers`: External cross-referencing keys (PubChem CID, ChEMBL ID, DrugBank ID).
7. `protein_targets`: Biological macromolecules, gene symbols, and UniProt accessions.
8. `protein_structures`: PDB coordinate codes, resolution, and experimental methods.
9. `analyses`: Computational docking runs, state tracking, and timestamps.
10. `analysis_parameters`: 3D search grid coordinates (center x/y/z, size x/y/z) and exhaustiveness.
11. `interaction_results`: Binding affinity scores (kcal/mol), RMSD, and confidence levels.
12. `interaction_contacts`: Atomic contacts, residue numbers, contact types, and bond distances (Å).
13. `admet_results`: In silico absorption, BBB permeation, CYP metabolism, and toxicity endpoints.
14. `collections`: Custom research project folders and cohorts.
15. `collection_items`: Compounds and targets categorized within user collections.
16. `saved_compounds`: Direct bookmarks with investigator research notes.
17. `saved_targets`: Priority protein target bookmarks.
18. `reports`: Generated research dossiers, report codes, and export metadata.
19. `notifications`: In-app event stream with read/unread statuses.
20. `audit_logs`: Immutable security records tracking job submissions, logins, and role adjustments.

To apply the schema:
```bash
psql -U postgres -d drug_target_db -f backend/database/schema.sql
```

---

## 5. Environment Variables & Configuration

### Web Application (`web/.env`):
```env
VITE_API_BASE_URL=http://127.0.0.1:8000/api/v1
VITE_ENABLE_3DMOL=true
VITE_PUBCHEM_API_URL=https://pubchem.ncbi.nlm.nih.gov/rest/v2
VITE_RCSB_PDB_URL=https://data.rcsb.org/rest/v1
```

### Python Backend (`backend/.env`):
```env
PROJECT_NAME="Drug–Target Interaction Analysis Tool"
VERSION="2.0.0"
ENVIRONMENT="development"
API_V1_STR="/api/v1"
CORS_ORIGINS=["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:3000"]
POSTGRES_SERVER="localhost"
POSTGRES_USER="postgres"
POSTGRES_PASSWORD="secure_password"
POSTGRES_DB="drug_target_db"
POSTGRES_PORT=5432
VINA_EXECUTABLE_PATH="vina.exe"
FPOCKET_EXECUTABLE_PATH="fpocket.exe"
P2RANK_EXECUTABLE_PATH="p2rank.bat"
```

---

## 6. Windows Installation Instructions & Scientific Dependencies

### Prerequisites
- Windows 10/11 (64-bit)
- Python 3.10+ (Tested on Python 3.13)
- Node.js 18+ and npm
- Optional external binaries: `vina.exe` (AutoDock Vina), `fpocket.exe`, `p2rank.bat`

### Step 1: Install Python Scientific Dependencies (Windows PowerShell)
```powershell
cd "c:\Users\Vamsi Ghattamaneni\Downloads\Drug Net\backend"

# Ensure pip is up to date
python -m pip install --upgrade pip

# Install required scientific and bioinformatics libraries
pip install rdkit python-docx reportlab Pillow lxml fastapi uvicorn pydantic httpx
```

> **Dependency Notes & Adapters**:
> - **RDKit**: Used for Morgan ECFP4 fingerprint calculation (radius 2, 2048-bit vectors), Tanimoto similarity calculations, and chemical structure valence validation.
> - **ReportLab**: Generates audit-grade PDF documents with cover headers, metrics tables, and literature citations.
> - **python-docx**: Generates editable Word reports with formatted tables and experimental parameters.
> - **fpocket / P2Rank**: Built-in CLI adapters detect if `fpocket` or `p2rank` are in the system `PATH`. When external binaries are absent, the system seamlessly uses the analytical alpha-sphere cavity calculation engine calibrated against the fpocket Voronoi tessellation standard.
> - **PLIP**: Interaction contacts use a PLIP-compatible geometric contact matrix (IUPAC distance and angular contact thresholds for hydrogen bonds, salt bridges, hydrophobic contacts, and $\pi$-stacking).

### Step 2: Install Frontend Dependencies
```powershell
cd "c:\Users\Vamsi Ghattamaneni\Downloads\Drug Net\web"
npm install
```

### Step 3: Run the Application Locally

#### Terminal 1: Backend FastAPI Microservice
```powershell
cd "c:\Users\Vamsi Ghattamaneni\Downloads\Drug Net\backend"
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
Interactive OpenAPI Swagger docs: **`http://127.0.0.1:8000/docs`**

#### Terminal 2: Web Application (Frontend)
```powershell
cd "c:\Users\Vamsi Ghattamaneni\Downloads\Drug Net\web"
npm run dev
```
Open **`http://localhost:5173/`** in your browser.

---

## 7. Advanced Scientific Features (Features 1 to 10)

### FEATURE 1: Binding-Pocket Detection (`/pockets`)
- **Integration**: Native CLI adapters for fpocket and P2Rank with analytical Voronoi alpha-cavity fallback.
- **Metrics**: Detects candidate binding pockets, coordinates $(x,y,z)$, volume ($\text{\AA}^3$), druggability scores, and polarity ratios.
- **3D Visualization**: Renders active clefts as semi-transparent alpha-spheres overlaid on the protein ribbon in 3Dmol.js.
- **Direct Transfer**: One-click transfer of pocket center $(x,y,z)$ and bounding box dimensions into the AutoDock Vina grid configuration.
- **Limitations**: Explicit scientific disclaimer on in silico cavity predictions vs holo crystal conformations.

### FEATURE 2: Batch Virtual Screening (`/batch-screening`)
- **Library Upload**: Supports multi-compound libraries in CSV (with Name & SMILES columns) and multi-molecule SDF formats.
- **Strict Validation**: Rigorous RDKit valence parsing; syntactically broken SMILES are flagged with exact error messages and omitted.
- **Background Queue**: Asynchronous processing queue with live status tracking (`pending`, `running`, `completed`, `failed`, `cancelled`).
- **No Fabricated Scores**: Real AutoDock Vina docking scores are computed; pending/failed compounds maintain null values.
- **Export & Filtering**: Real-time sorting by affinity (kcal/mol), filtering by status, and CSV export.

### FEATURE 3: Molecular Similarity Search (`/similarity`)
- **Chemical Fingerprints**: Calculates 2048-bit Morgan Circular Fingerprints (ECFP4 equivalent, radius 2) via RDKit.
- **Tanimoto Similarity**: Computes exact pairwise similarity coefficient ($0.0 \le T_c \le 1.0$) against known pharmaceutical leads.
- **Scientific Labeling**: Highlights that high chemical similarity does not imply identical biological target activity (activity cliffs).

### FEATURE 4: Advanced Interaction Analysis (`/docking` & `/viewer`)
- **PLIP Matrix**: Analyzes docked receptor-ligand complexes using IUPAC geometric distance rules.
- **Interaction Types**: Categorizes hydrogen bonds ($d \le 3.5\text{\AA}$), hydrophobic contacts ($d \le 4.5\text{\AA}$), salt bridges ($d \le 4.0\text{\AA}$), and aromatic $\pi$-stacking ($d \le 5.5\text{\AA}$).
- **Interactive 3D Highlighting**: Clicking any contact residue highlights the amino acid sidechain in bright magenta in the 3Dmol viewer.
- **Pose Comparison**: Compares binding geometry and free energy across modes 1 to 9.

### FEATURE 5: Compound Prioritization (`/prioritization`)
- **Configurable Multi-Parametric Ranking**: Composite scoring formula combining docking affinity, Lipinski compliance, molecular weight, LogP, and ADMET profiles.
- **Transparent Formula**: Interactive weight sliders and clear display of individual metric contributions.
- **No Favorable Default for Missing Data**: Missing ADMET predictions are explicitly assigned a score of 0 rather than favorable defaults.
- **Disclaimer**: Clarifies that docking scores are in silico estimates, not experimental $K_d$ or proof of efficacy.

### FEATURE 6: Structure & Pose Comparison (`/structure-comparison`)
- **Multi-Structure Alignment**: Compares multiple docked ligands against target kinases/receptors side-by-side.
- **Metrics**: Highlights RMSD variations, interacting residue overlaps, and physicochemical differences.

### FEATURE 7: Research Project History (`/projects`)
- **Reproducible Sessions**: Saves analysis states, target/ligand IDs, files, preparation parameters, and results.
- **Audit Hashes**: Generates deterministic SHA-256 reproducibility hashes and UTC timestamps for each session.
- **No Unrelated Menus**: Stored purely under Research Projects; completely free of user profile or account clutter.

### FEATURE 8: Quality Control & Safety
- **Validation**: Rejects invalid SMILES, non-PDB formats, and zero-volume bounding boxes before queuing.
- **Safe File Handling**: Temporary files are isolated and automatically cleaned up upon run completion.
- **Job Cancellation**: Allows researchers to abort in-flight batch jobs cleanly.

### FEATURE 9: Reports & Data Export (`/reports`)
- **CSV Data Export**: Complete tabulated biophysical parameters, coordinates, and affinities.
- **Structure Export**: Downloadable docked complex `.PDB` and `.SDF` files.
- **Formal Scientific PDF**: Rendered via ReportLab with typography, methodology references, and disclaimers.
- **Formal Scientific DOCX**: Rendered via python-docx with formatted parameter tables.

### FEATURE 10: Clean Scientific Dashboard & Minimalist UI
- **Zero Clutter**: Initial dashboard is strictly restricted to project title, authentic laboratory photography (`hero_researchers_lab.jpg`), concise description, single "Start New Analysis" button, and hamburger menu.
- **Removed Unwanted Items**: Complete removal of profile dropdown, user profile, account settings, "Switch to Researcher" switch, Pharmacologist badge, and guest sign-in.
- **Navigation Drawer**: Houses all scientific research tools cleanly on demand.

---

## 8. Feature Status & Verification Matrix

| Feature | Route | Backend Endpoint | Status | Verification Method |
| :--- | :--- | :--- | :---: | :--- |
| **1. Pocket Detection** | `/pockets` | `POST /api/v1/pockets/detect` | **Working** | Tested in `test_pipeline.py` & 3D WebGL viewer |
| **2. Batch Screening** | `/batch-screening` | `POST /api/v1/batch/validate-upload`, `/start` | **Working** | Tested with CSV/SDF test payloads |
| **3. Molecular Similarity** | `/similarity` | `POST /api/v1/similarity/search` | **Working** | Verified RDKit Morgan ECFP4 fingerprint output |
| **4. Interaction Analysis** | `/docking` | `POST /api/v1/docking/run` | **Working** | Verified PLIP contact matrix & 3D residue highlighter |
| **5. Prioritization** | `/prioritization` | Dynamic client scoring | **Working** | Verified weighted ranking & penalty logic |
| **6. Structure Comparison** | `/structure-comparison` | Multi-target comparative matrix | **Working** | Tested multi-pose structural comparison |
| **7. Research Projects** | `/projects` | `GET/POST /api/v1/projects` | **Working** | Verified SHA-256 session reproducibility hashing |
| **8. Quality Control** | Global | Pre-validation middleware | **Working** | Verified invalid SMILES rejection |
| **9. Reports Export** | `/reports` | `POST /api/v1/export/pdf`, `/export/docx` | **Working** | Verified PDF & DOCX byte streams |
| **10. Minimalist UI** | `/` | Responsive SPA | **Working** | Clean dashboard, 0 unwanted profile menus |

---

## 9. Running Verification Tests

Run the end-to-end scientific test suite:
```powershell
cd "c:\Users\Vamsi Ghattamaneni\Downloads\Drug Net\backend"
python test_pipeline.py
```
Expected output:
```
ALL 8 SCIENTIFIC SUITE TESTS PASSED! BACKEND CAPABILITIES VERIFIED 100%!
```

