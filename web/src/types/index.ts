export type DrugType = 'Small Molecule' | 'Monoclonal Antibody' | 'Kinase Inhibitor' | 'Antimetabolite' | 'SERM';

export type TherapeuticClass =
  | 'Oncology / Tyrosine Kinase Inhibitor'
  | 'Oncology / HER2-Targeted Therapy'
  | 'Oncology / Selective Estrogen Receptor Modulator'
  | 'Immunology & Oncology / Anti-CD20'
  | 'Immunology & Oncology / Antifolate Antimetabolite';

export type TargetClass =
  | 'Receptor Tyrosine Kinase'
  | 'Non-Receptor Tyrosine Kinase'
  | 'Nuclear Hormone Receptor'
  | 'Enzyme / Oxidoreductase'
  | 'Cell Surface Antigen'
  | 'Angiogenic Signaling Factor';

export type ConfidenceLevel = 'High' | 'Medium' | 'Low';

export interface Compound {
  id: string; // e.g. "DB00619" or "CID-5291"
  name: string; // e.g. "Imatinib"
  brandName?: string; // e.g. "Gleevec"
  pubchemCid?: any;
  chemblId?: string;
  type: DrugType;
  therapeuticClass: TherapeuticClass;
  formula: string;
  molecularWeight: number; // in g/mol
  smiles: string;
  canonicalSmiles?: string;
  inchiKey?: string;
  logP?: number;
  hBondDonors?: number;
  hbd?: number;
  hBondAcceptors?: number;
  hba?: number;
  rotatableBonds?: number;
  topologicalPolarSurfaceArea?: number; // TPSA
  approvalStatus: 'FDA Approved' | 'Investigational' | 'Clinical Trial';
  approvalYear?: number;
  description: string;
  mechanismOfAction: string;
  sourceDatabase?: 'DrugBank' | 'PubChem' | 'ChEMBL' | 'Internal Repository' | string;
  externalLinks?: { label: string; url: string }[];
  targetIds: string[];
  diseaseIds: string[];
  pathwayIds?: string[];
}

// Alias for backward compatibility
export type Drug = Compound;

export interface ProteinTarget {
  id: string; // e.g. "BCR-ABL1"
  geneSymbol: string;
  proteinName: string;
  name?: string;
  uniprotId: string;
  pdbId?: string;
  targetClass: TargetClass;
  organism: string;
  biologicalFunction: string;
  functionDescription?: string;
  cellularLocation: string;
  proteinSequence?: string;
  availablePdbStructures?: { pdbId: string; title: string; resolution: string; method: string }[];
  knownDiseaseAssociations?: { diseaseName: string; associationType: string; citation: string }[];
  drugIds: string[];
  diseaseIds: string[];
  pathwayIds?: string[];
}

// Alias for backward compatibility
export type Target = ProteinTarget;

export interface Disease {
  id: string;
  name: string;
  category: 'Hematologic Malignancy' | 'Solid Tumor Oncology' | 'Autoimmune & Inflammatory' | 'Vascular Oncology';
  description: string;
  targetIds: string[];
  drugIds: string[];
  pathwayIds?: string[];
  prevalence: string;
}

export interface Pathway {
  id: string;
  name: string;
  category: 'Signal Transduction' | 'Cell Proliferation' | 'Angiogenesis' | 'Apoptosis & Survival' | 'Metabolic Biosynthesis' | 'Immune Regulation';
  description: string;
  biologicalFunction: string;
  targetIds: string[];
  drugIds: string[];
  diseaseIds: string[];
  keyProcesses: string[];
  cellularLocation: string;
}

export interface InteractionContact {
  residueName?: string; // e.g. "Asp", "Met"
  residueNumber?: number; // e.g. 381
  residue?: string; // e.g. "Thr315"
  atomName?: string; // e.g. "OD1"
  atoms?: string;
  contactType?: 'Hydrogen Bond' | 'Hydrophobic Contact' | 'Salt Bridge' | 'pi-Stacking' | string;
  interactionType?: 'Hydrogen Bond' | 'Hydrophobic' | 'Salt Bridge' | 'pi-Stacking' | string;
  distanceAngstrom?: number; // e.g. 2.85
  distance?: number;
  energyKcal?: number;
}

export interface AnalysisJob {
  id: string; // e.g. "DTI-2026-0814"
  title: string;
  compoundId: string;
  compoundName: string;
  compoundSmiles?: string;
  targetId: string;
  targetName?: string;
  targetGene?: string;
  targetPdbId?: string;
  method: string;
  parameters: {
    exhaustiveness: number;
    numModes?: number;
    energyRange?: number;
    center?: [number, number, number];
    gridCenter?: { x: number; y: number; z: number };
    size?: [number, number, number];
    gridSize?: { x: number; y: number; z: number };
  };
  status: 'queued' | 'running' | 'completed' | 'failed';
  dateSubmitted: string;
  submittedAt?: string;
  completedAt?: string;
  submittedBy?: string;
  dockingScore?: number; // in kcal/mol (e.g. -11.4)
  bindingAffinityPkd?: number; // -log10 Kd
  predictedKdNm?: number; // in nM
  confidence?: ConfidenceLevel;
  contacts?: InteractionContact[];
  hydrogenBondsCount?: number;
  saltBridgesCount?: number;
  dockingRmsd?: number;
  summary?: string;
  warningFlags?: string[];
  notes?: string;
}

export interface AdmetProfile {
  compoundId: string;
  compoundName: string;
  // Absorption
  giAbsorption: 'High' | 'Moderate' | 'Low' | string;
  caco2Permeability?: number; // 10^-6 cm/s (e.g. 21.4)
  bioavailabilityScore?: number; // 0.0 - 1.0 (e.g. 0.85)
  // Distribution
  plasmaProteinBindingPercent?: number; // e.g. 95.2%
  bbbPermeability: 'Permeable' | 'Poorly Permeable' | 'Non-Permeable' | 'Moderate' | boolean | string;
  volumeOfDistributionLKg?: number; // e.g. 3.2 L/kg
  // Metabolism
  cyp3a4Substrate: boolean;
  cyp3a4Inhibitor?: boolean;
  cyp2d6Substrate?: boolean;
  cyp2d6Inhibitor?: boolean;
  cyp2c9Inhibitor?: boolean;
  // Excretion
  totalClearanceMlMinKg?: number; // e.g. 4.8
  eliminationHalfLifeHours?: number; // e.g. 18.0
  // Toxicity
  hergInhibitionRisk?: 'Low' | 'Moderate' | 'High' | string;
  hergToxicityRisk?: 'Low' | 'Moderate' | 'High' | string;
  amesMutagenicity?: 'Negative (Non-Mutagenic)' | 'Positive (Mutagenic)' | string;
  hepatotoxicityRisk?: 'Low' | 'Moderate Risk' | 'High Warning' | string;
  hepatotoxicityFlag?: boolean;
  skinSensitization?: 'Non-Sensitizer' | 'Sensitizer' | string;
  // Drug-likeness (Lipinski)
  lipinskiViolations: number;
  lipinskiRuleOfFive?: { violations: number };
  ruleOfFivePassed?: boolean;
  leadLikeness?: boolean;
  syntheticAccessibilityScore?: number; // 1 - 10 (1 = easy)
  predictionTimestamp?: string;
  modelSource?: string;
}

export interface SavedItem {
  id: string;
  type: 'compound' | 'target';
  itemType?: 'compound' | 'target';
  entityId: string;
  itemId?: string;
  name: string;
  subtitle?: string;
  identifier: string;
  collectionName: string;
  collectionId?: string;
  notes?: string;
  dateSaved: string;
  savedAt?: string;
}

export interface Collection {
  id: string;
  name: string;
  description: string;
  itemCount: number;
  createdDate?: string;
  createdAt?: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'info' | 'warning' | 'error' | 'analysis_completed' | 'analysis_failed' | 'report_generated' | 'attention_required';
  timestamp: string;
  read: boolean;
  isRead?: boolean;
  link?: string;
}

export interface UserAccount {
  id: string;
  email: string;
  fullName: string;
  name?: string;
  institution?: string;
  researchRole: 'Pharmacologist' | 'Medicinal Chemist' | 'Bioinformatician' | 'Graduate Researcher' | 'Principal Investigator' | 'System Administrator' | string;
  role: 'researcher' | 'administrator' | 'Researcher' | 'Senior Scientist' | 'Administrator';
  lastLogin: string;
  createdAt?: string;
  notificationPreferences?: {
    emailAlerts: boolean;
    jobCompletion: boolean;
    reportReady: boolean;
  };
  sessionExpiryMinutes?: number;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  userEmail?: string;
  userId?: string;
  action: string;
  entityType?: string;
  entityId?: string;
  status: 'SUCCESS' | 'WARNING' | 'FAILED' | string;
  details: string;
  ipAddress?: string;
}

// Preserve existing compatibility interfaces
export interface Interaction {
  id: string;
  drugId: string;
  drugName: string;
  targetId: string;
  targetGene: string;
  diseaseId: string;
  diseaseName: string;
  pathwayId?: string;
  interactionType: 'ATP-Competitive Inhibitor' | 'Allosteric Modulator' | 'Receptor Antagonist' | 'Monoclonal Antibody Binding' | 'Substrate Analog Inhibitor';
  score: number;
  confidence: ConfidenceLevel;
  affinityKdNm: number;
  affinityPkd: number;
  evidenceSource: 'ChEMBL' | 'DrugBank' | 'PubMed' | 'ClinicalTrials.gov' | 'Computational Docking';
  status: 'Strong interaction' | 'Moderate interaction' | 'Candidate hit';
  therapeuticRelevance: string;
  dateAdded: string;
}

export interface EvidenceItem {
  id: string;
  interactionId: string;
  drugId: string;
  drugName: string;
  targetId: string;
  targetGene: string;
  diseaseId: string;
  diseaseName: string;
  evidenceType: 'Database-derived evidence' | 'Computational prediction' | 'Experimental assay' | 'Clinical literature';
  source: 'ChEMBL 33' | 'DrugBank 5.1' | 'PDB Complex (X-Ray)' | 'BindingDB' | 'PubChem BioAssay' | 'PubMed Literature';
  strength: 'Very Strong' | 'Strong' | 'Moderate' | 'Candidate';
  confidence: ConfidenceLevel;
  validationStatus: 'Curated Benchmark' | 'In Vitro Kinase Assay' | 'Crystal Structure Co-complex' | 'In Silico Molecular Docking';
  dataOrigin: 'Demo / Educational Benchmark';
  pmid?: string;
  assayDetails: string;
  score: number;
}

export interface TherapeuticOpportunity {
  id: string;
  category: 'high_confidence' | 'disease_target' | 'repurposing' | 'target_opportunity';
  categoryTitle: string;
  drugId: string;
  drugName: string;
  targetId: string;
  targetGene: string;
  diseaseId: string;
  diseaseName: string;
  pathwayId?: string;
  rationale: string;
  score: number;
  confidence: ConfidenceLevel;
  evidenceLevel: string;
  status: 'Priority Investigation' | 'Validated Benchmark' | 'Repurposing Candidate';
}

export interface TargetPrioritizationItem {
  id: string;
  targetId: string;
  geneSymbol: string;
  proteinName: string;
  targetClass: string;
  confidenceScore: number;
  drugCount: number;
  diseaseCount: number;
  pathwayRelevanceScore: number;
  evidenceAvailability: 'High' | 'Moderate' | 'Emerging';
  overallPriorityScore: number;
  priorityTier: 'Tier 1 (High Priority)' | 'Tier 2 (Moderate Priority)' | 'Tier 3 (Candidate)';
  computationalRationale: string;
}

export interface SavedAnalysis {
  id: string;
  name?: string;
  drug: Compound;
  target: ProteinTarget;
  score: number;
  confidence: ConfidenceLevel;
  interactionType: string;
  affinityKdNm: number;
  affinityPkd: number;
  therapeuticRelevance: string;
  associatedDisease: string;
  evidence: string;
  date: string;
  status?: string;
}
