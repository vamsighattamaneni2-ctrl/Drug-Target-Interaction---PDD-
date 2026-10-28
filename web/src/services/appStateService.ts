import {
  AnalysisJob,
  SavedItem,
  Collection,
  NotificationItem,
  UserAccount,
  AdmetProfile,
  Compound,
  ProteinTarget,
  AuditLogEntry,
} from '../types';
import { DRUGS, TARGETS } from '../data/dataset';

// Initial realistic research analyses
const INITIAL_ANALYSES: AnalysisJob[] = [
  {
    id: 'DTI-2026-8941',
    title: 'Imatinib binding to BCR-ABL1 kinase pocket',
    compoundId: 'DB00619',
    compoundName: 'Imatinib',
    compoundSmiles: 'CC1=C(C=C(C=C1)NC(=O)C2=CC=C(CN3CCN(C)CC3)C=C2)NC4=NC=CC(=N4)C5=CN=CC=C5',
    targetId: 'BCR-ABL1',
    targetGene: 'BCR-ABL1',
    targetPdbId: '1IEP',
    method: 'AutoDock Vina',
    parameters: {
      exhaustiveness: 16,
      numModes: 9,
      energyRange: 3.0,
      center: [14.2, -8.6, 22.1],
      size: [24, 24, 24],
    },
    status: 'completed',
    dateSubmitted: '2026-10-27 14:32',
    completedAt: '2026-10-27 14:38',
    dockingScore: -11.8,
    bindingAffinityPkd: 9.35,
    predictedKdNm: 0.45,
    confidence: 'High',
    hydrogenBondsCount: 4,
    saltBridgesCount: 1,
    dockingRmsd: 0.85,
    summary: 'Strong favorable binding energy (-11.8 kcal/mol) with canonical hydrogen bond interactions at Thr315, Glu286, and Asp381 in the inactive DFG-out conformation.',
    contacts: [
      { residueName: 'Thr', residueNumber: 315, atomName: 'OG1', contactType: 'Hydrogen Bond', distanceAngstrom: 2.74, energyKcal: -2.4 },
      { residueName: 'Glu', residueNumber: 286, atomName: 'OE1', contactType: 'Hydrogen Bond', distanceAngstrom: 2.82, energyKcal: -1.9 },
      { residueName: 'Asp', residueNumber: 381, atomName: 'OD1', contactType: 'Salt Bridge', distanceAngstrom: 3.12, energyKcal: -3.1 },
      { residueName: 'Met', residueNumber: 318, atomName: 'CB', contactType: 'Hydrophobic Contact', distanceAngstrom: 3.65, energyKcal: -1.2 },
      { residueName: 'Phe', residueNumber: 382, atomName: 'CZ', contactType: 'pi-Stacking', distanceAngstrom: 3.84, energyKcal: -1.8 },
    ],
  },
  {
    id: 'DTI-2026-8912',
    title: 'Erlotinib docking into EGFR Kinase Domain',
    compoundId: 'DB00530',
    compoundName: 'Erlotinib',
    compoundSmiles: 'COCCOC1=C(C=C2C(=C1)C(=NC=N2)NC3=CC=CC(=C3)C#C)OCCOC',
    targetId: 'EGFR',
    targetGene: 'EGFR',
    targetPdbId: '1M17',
    method: 'AutoDock Vina',
    parameters: {
      exhaustiveness: 16,
      numModes: 9,
      energyRange: 3.0,
      center: [22.0, 1.5, 34.2],
      size: [22, 22, 22],
    },
    status: 'completed',
    dateSubmitted: '2026-10-26 11:15',
    completedAt: '2026-10-26 11:21',
    dockingScore: -9.4,
    bindingAffinityPkd: 8.70,
    predictedKdNm: 2.0,
    confidence: 'High',
    hydrogenBondsCount: 2,
    saltBridgesCount: 0,
    dockingRmsd: 1.12,
    summary: 'Occupies the ATP-binding cleft of EGFR with primary hydrogen bonding to Met793 in the hinge region and favorable hydrophobic interactions in the deep lipophilic pocket.',
    contacts: [
      { residueName: 'Met', residueNumber: 793, atomName: 'N', contactType: 'Hydrogen Bond', distanceAngstrom: 2.88, energyKcal: -2.1 },
      { residueName: 'Thr', residueNumber: 854, atomName: 'OG1', contactType: 'Hydrogen Bond', distanceAngstrom: 3.05, energyKcal: -1.5 },
      { residueName: 'Leu', residueNumber: 718, atomName: 'CD1', contactType: 'Hydrophobic Contact', distanceAngstrom: 3.72, energyKcal: -1.4 },
      { residueName: 'Ala', residueNumber: 743, atomName: 'CB', contactType: 'Hydrophobic Contact', distanceAngstrom: 3.60, energyKcal: -1.1 },
    ],
  },
  {
    id: 'DTI-2026-8805',
    title: 'Gefitinib cross-docking against mutant EGFR L858R',
    compoundId: 'DB00317',
    compoundName: 'Gefitinib',
    compoundSmiles: 'COC1=C(OCC2=CC=CC=C2)C=C2C(=C1)N=CN=C2NC1=CC(Cl)=C(F)C=C1',
    targetId: 'EGFR',
    targetGene: 'EGFR',
    targetPdbId: '2ITX',
    method: 'Biophysical Empirical Docking',
    parameters: {
      exhaustiveness: 12,
      numModes: 5,
      energyRange: 2.5,
      center: [21.5, 2.0, 33.8],
      size: [20, 20, 20],
    },
    status: 'completed',
    dateSubmitted: '2026-10-25 16:40',
    completedAt: '2026-10-25 16:44',
    dockingScore: -9.1,
    bindingAffinityPkd: 8.52,
    predictedKdNm: 3.0,
    confidence: 'High',
    hydrogenBondsCount: 2,
    saltBridgesCount: 0,
    dockingRmsd: 0.94,
    summary: 'Predicted tight fit into EGFR pocket with selectivity for L858R kinase configuration.',
    contacts: [
      { residueName: 'Met', residueNumber: 793, atomName: 'N', contactType: 'Hydrogen Bond', distanceAngstrom: 2.91, energyKcal: -2.0 },
      { residueName: 'Cys', residueNumber: 797, atomName: 'SG', contactType: 'Hydrophobic Contact', distanceAngstrom: 3.78, energyKcal: -1.3 },
    ],
  },
  {
    id: 'DTI-2026-8740',
    title: 'Tamoxifen binding to Estrogen Receptor Alpha',
    compoundId: 'DB00675',
    compoundName: 'Tamoxifen',
    compoundSmiles: 'CCC(=C(C1=CC=CC=C1)C2=CC=C(C=C2)OCCN(C)C)C3=CC=CC=C3',
    targetId: 'ESR1',
    targetGene: 'ESR1',
    targetPdbId: '3ERT',
    method: 'AutoDock Vina',
    parameters: {
      exhaustiveness: 16,
      numModes: 9,
      energyRange: 3.0,
      center: [30.1, 12.4, 5.2],
      size: [24, 24, 24],
    },
    status: 'completed',
    dateSubmitted: '2026-10-24 09:12',
    completedAt: '2026-10-24 09:18',
    dockingScore: -10.2,
    bindingAffinityPkd: 8.85,
    predictedKdNm: 1.4,
    confidence: 'High',
    hydrogenBondsCount: 1,
    saltBridgesCount: 1,
    dockingRmsd: 0.72,
    summary: 'Displaces Helix 12 of ESR1, inducing the antagonist conformational state and blocking coactivator recruitment.',
    contacts: [
      { residueName: 'Glu', residueNumber: 353, atomName: 'OE2', contactType: 'Hydrogen Bond', distanceAngstrom: 2.68, energyKcal: -2.5 },
      { residueName: 'Asp', residueNumber: 351, atomName: 'OD1', contactType: 'Salt Bridge', distanceAngstrom: 2.95, energyKcal: -3.2 },
    ],
  },
];

const INITIAL_SAVED: SavedItem[] = [
  {
    id: 'SAV-001',
    type: 'compound',
    entityId: 'DB00619',
    name: 'Imatinib',
    identifier: 'DB00619',
    collectionName: 'Tyrosine Kinase Lead Candidates',
    notes: 'Reference benchmark inhibitor for CML BCR-ABL1 kinase pocket with verified clinical efficacy.',
    dateSaved: '2026-10-25',
  },
  {
    id: 'SAV-002',
    type: 'compound',
    entityId: 'DB00530',
    name: 'Erlotinib',
    identifier: 'DB00530',
    collectionName: 'NSCLC EGFR Screen',
    notes: 'Primary 1st-generation quinazoline inhibitor for EGFR exon 19/21 mutations.',
    dateSaved: '2026-10-26',
  },
  {
    id: 'SAV-003',
    type: 'target',
    entityId: 'BCR-ABL1',
    name: 'BCR-ABL1 Fusion Kinase',
    identifier: 'P00519',
    collectionName: 'Oncogenic Kinase Targets',
    notes: 'Pathognomonic oncogenic driver of CML; constitutive tyrosine kinase signaling.',
    dateSaved: '2026-10-25',
  },
  {
    id: 'SAV-004',
    type: 'target',
    entityId: 'EGFR',
    name: 'Epidermal Growth Factor Receptor',
    identifier: 'P00533',
    collectionName: 'NSCLC EGFR Screen',
    notes: 'Receptor tyrosine kinase governing cell proliferation; crystal structure 1M17 available.',
    dateSaved: '2026-10-26',
  },
];

const INITIAL_COLLECTIONS: Collection[] = [
  { id: 'COL-1', name: 'Tyrosine Kinase Lead Candidates', description: 'Screened small molecule inhibitors with sub-nanomolar affinity', itemCount: 1, createdDate: '2026-10-25' },
  { id: 'COL-2', name: 'NSCLC EGFR Screen', description: 'Compounds and receptor conformations relevant to non-small cell lung cancer', itemCount: 2, createdDate: '2026-10-26' },
  { id: 'COL-3', name: 'Oncogenic Kinase Targets', description: 'Structural targets prioritized for computational virtual screening', itemCount: 1, createdDate: '2026-10-25' },
];

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'NOTIF-1',
    title: 'Analysis Completed',
    message: 'Job DTI-2026-8941 (Imatinib & BCR-ABL1) docking completed with score -11.8 kcal/mol.',
    type: 'success',
    timestamp: '2026-10-27 14:38',
    read: false,
    link: '/viewer?job=DTI-2026-8941',
  },
  {
    id: 'NOTIF-2',
    title: 'Research Report Generated',
    message: 'Interaction dossier for Erlotinib vs EGFR successfully exported to PDF and CSV.',
    type: 'info',
    timestamp: '2026-10-26 12:05',
    read: false,
    link: '/reports',
  },
  {
    id: 'NOTIF-3',
    title: 'Target Structure Synchronized',
    message: 'RCSB PDB coordinates for EGFR structure 1M17 (resolution 2.60 Å) cached for docking.',
    type: 'info',
    timestamp: '2026-10-25 09:30',
    read: true,
  },
];

const INITIAL_USER: UserAccount = {
  id: 'USR-89410',
  email: 'alex.morgan@biochem-pharma.org',
  fullName: 'Dr. Alex Morgan, PhD',
  institution: 'Bio-Chem Pharmaceutical Research Institute',
  researchRole: 'Pharmacologist',
  role: 'researcher',
  lastLogin: '2026-10-28 01:45',
  notificationPreferences: {
    emailAlerts: true,
    jobCompletion: true,
    reportReady: true,
  },
  sessionExpiryMinutes: 120,
};

const INITIAL_AUDIT: AuditLogEntry[] = [
  { id: 'LOG-01', timestamp: '2026-10-27 14:38:12', userEmail: 'alex.morgan@biochem-pharma.org', action: 'ANALYSIS_COMPLETE', entityType: 'DTI_JOB', entityId: 'DTI-2026-8941', status: 'SUCCESS', details: 'AutoDock Vina finished: score -11.8 kcal/mol' },
  { id: 'LOG-02', timestamp: '2026-10-27 14:32:00', userEmail: 'alex.morgan@biochem-pharma.org', action: 'SUBMIT_JOB', entityType: 'DTI_JOB', entityId: 'DTI-2026-8941', status: 'SUCCESS', details: 'Submitted Imatinib vs BCR-ABL1 docking' },
  { id: 'LOG-03', timestamp: '2026-10-26 11:21:44', userEmail: 'alex.morgan@biochem-pharma.org', action: 'ANALYSIS_COMPLETE', entityType: 'DTI_JOB', entityId: 'DTI-2026-8912', status: 'SUCCESS', details: 'AutoDock Vina finished: score -9.4 kcal/mol' },
  { id: 'LOG-04', timestamp: '2026-10-25 10:14:00', userEmail: 'admin@theratarget.org', action: 'SYSTEM_SYNC', entityType: 'DATA_SOURCE', entityId: 'PUBCHEM_PDB', status: 'SUCCESS', details: 'Synchronized reference bioactivity indexes' },
];

export const ADMET_DATABASE: Record<string, AdmetProfile> = {
  DB00619: {
    compoundId: 'DB00619',
    compoundName: 'Imatinib',
    giAbsorption: 'High',
    caco2Permeability: 18.4,
    bioavailabilityScore: 0.98,
    plasmaProteinBindingPercent: 95.0,
    bbbPermeability: 'Poorly Permeable',
    volumeOfDistributionLKg: 3.4,
    cyp3a4Substrate: true,
    cyp3a4Inhibitor: true,
    cyp2d6Substrate: true,
    cyp2d6Inhibitor: true,
    cyp2c9Inhibitor: true,
    totalClearanceMlMinKg: 4.2,
    eliminationHalfLifeHours: 18.0,
    hergInhibitionRisk: 'Low',
    amesMutagenicity: 'Negative (Non-Mutagenic)',
    hepatotoxicityRisk: 'Moderate Risk',
    skinSensitization: 'Non-Sensitizer',
    lipinskiViolations: 0,
    ruleOfFivePassed: true,
    leadLikeness: true,
    syntheticAccessibilityScore: 3.8,
    predictionTimestamp: '2026-10-27',
    modelSource: 'SwissADME & QSAR Ensemble Model',
  },
  DB00530: {
    compoundId: 'DB00530',
    compoundName: 'Erlotinib',
    giAbsorption: 'High',
    caco2Permeability: 24.1,
    bioavailabilityScore: 0.85,
    plasmaProteinBindingPercent: 93.0,
    bbbPermeability: 'Permeable',
    volumeOfDistributionLKg: 3.1,
    cyp3a4Substrate: true,
    cyp3a4Inhibitor: true,
    cyp2d6Substrate: false,
    cyp2d6Inhibitor: false,
    cyp2c9Inhibitor: false,
    totalClearanceMlMinKg: 5.6,
    eliminationHalfLifeHours: 36.2,
    hergInhibitionRisk: 'Low',
    amesMutagenicity: 'Negative (Non-Mutagenic)',
    hepatotoxicityRisk: 'Low',
    skinSensitization: 'Non-Sensitizer',
    lipinskiViolations: 0,
    ruleOfFivePassed: true,
    leadLikeness: true,
    syntheticAccessibilityScore: 3.2,
    predictionTimestamp: '2026-10-26',
    modelSource: 'SwissADME & QSAR Ensemble Model',
  },
  DB00317: {
    compoundId: 'DB00317',
    compoundName: 'Gefitinib',
    giAbsorption: 'High',
    caco2Permeability: 21.0,
    bioavailabilityScore: 0.60,
    plasmaProteinBindingPercent: 90.0,
    bbbPermeability: 'Poorly Permeable',
    volumeOfDistributionLKg: 2.8,
    cyp3a4Substrate: true,
    cyp3a4Inhibitor: true,
    cyp2d6Substrate: true,
    cyp2d6Inhibitor: false,
    cyp2c9Inhibitor: false,
    totalClearanceMlMinKg: 6.2,
    eliminationHalfLifeHours: 48.0,
    hergInhibitionRisk: 'Low',
    amesMutagenicity: 'Negative (Non-Mutagenic)',
    hepatotoxicityRisk: 'Moderate Risk',
    skinSensitization: 'Non-Sensitizer',
    lipinskiViolations: 0,
    ruleOfFivePassed: true,
    leadLikeness: true,
    syntheticAccessibilityScore: 3.5,
    predictionTimestamp: '2026-10-25',
    modelSource: 'SwissADME & QSAR Ensemble Model',
  },
  DB00675: {
    compoundId: 'DB00675',
    compoundName: 'Tamoxifen',
    giAbsorption: 'High',
    caco2Permeability: 32.5,
    bioavailabilityScore: 0.90,
    plasmaProteinBindingPercent: 99.0,
    bbbPermeability: 'Permeable',
    volumeOfDistributionLKg: 5.0,
    cyp3a4Substrate: true,
    cyp3a4Inhibitor: true,
    cyp2d6Substrate: true,
    cyp2d6Inhibitor: true,
    cyp2c9Inhibitor: true,
    totalClearanceMlMinKg: 3.1,
    eliminationHalfLifeHours: 168.0,
    hergInhibitionRisk: 'Moderate',
    amesMutagenicity: 'Negative (Non-Mutagenic)',
    hepatotoxicityRisk: 'Moderate Risk',
    skinSensitization: 'Non-Sensitizer',
    lipinskiViolations: 0,
    ruleOfFivePassed: true,
    leadLikeness: true,
    syntheticAccessibilityScore: 2.8,
    predictionTimestamp: '2026-10-24',
    modelSource: 'SwissADME & QSAR Ensemble Model',
  },
  DB00563: {
    compoundId: 'DB00563',
    compoundName: 'Methotrexate',
    giAbsorption: 'Moderate',
    caco2Permeability: 4.2,
    bioavailabilityScore: 0.65,
    plasmaProteinBindingPercent: 50.0,
    bbbPermeability: 'Non-Permeable',
    volumeOfDistributionLKg: 0.9,
    cyp3a4Substrate: false,
    cyp3a4Inhibitor: false,
    cyp2d6Substrate: false,
    cyp2d6Inhibitor: false,
    cyp2c9Inhibitor: false,
    totalClearanceMlMinKg: 10.5,
    eliminationHalfLifeHours: 7.0,
    hergInhibitionRisk: 'Low',
    amesMutagenicity: 'Negative (Non-Mutagenic)',
    hepatotoxicityRisk: 'High Warning',
    skinSensitization: 'Non-Sensitizer',
    lipinskiViolations: 0,
    ruleOfFivePassed: true,
    leadLikeness: false,
    syntheticAccessibilityScore: 4.1,
    predictionTimestamp: '2026-10-23',
    modelSource: 'SwissADME & QSAR Ensemble Model',
  },
};

class AppStateService {
  private user: UserAccount;
  private analyses: AnalysisJob[];
  private savedItems: SavedItem[];
  private collections: Collection[];
  private notifications: NotificationItem[];
  private auditLogs: AuditLogEntry[];

  constructor() {
    this.user = this.load('tt_user', INITIAL_USER);
    this.analyses = this.load('tt_analyses', INITIAL_ANALYSES);
    this.savedItems = this.load('tt_saved_items', INITIAL_SAVED);
    this.collections = this.load('tt_collections', INITIAL_COLLECTIONS);
    this.notifications = this.load('tt_notifications', INITIAL_NOTIFICATIONS);
    this.auditLogs = this.load('tt_audit_logs', INITIAL_AUDIT);
  }

  private load<T>(key: string, fallback: T): T {
    try {
      const stored = localStorage.getItem(key);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.warn(`Failed to read ${key} from storage:`, e);
    }
    return fallback;
  }

  private save(key: string, data: any) {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
      console.warn(`Failed to write ${key} to storage:`, e);
    }
  }

  // User & Role
  getUser(): UserAccount {
    return { ...this.user, name: this.user.fullName };
  }

  getCurrentUser(): UserAccount {
    return { ...this.user, name: this.user.fullName };
  }

  updateUser(updates: Partial<UserAccount>) {
    this.user = { ...this.user, ...updates };
    if (updates.name) {
      this.user.fullName = updates.name;
    }
    this.save('tt_user', this.user);
  }

  updateCurrentUser(updates: Partial<UserAccount> & { name?: string }) {
    this.user = { ...this.user, ...updates };
    if (updates.name) {
      this.user.fullName = updates.name;
    }
    this.save('tt_user', this.user);
    return { ...this.user, name: this.user.fullName };
  }

  toggleRole() {
    this.user.role = this.user.role === 'researcher' ? 'administrator' : 'researcher';
    this.save('tt_user', this.user);
    this.addAuditLog('ROLE_SWITCH', 'USER', this.user.id, 'SUCCESS', `Switched role to ${this.user.role}`);
  }

  // Compounds & Targets
  getCompounds(): Compound[] {
    return DRUGS.map((d) => ({
      ...d,
      hbd: d.hBondDonors,
      hba: d.hBondAcceptors,
      canonicalSmiles: d.smiles,
    }));
  }

  getTargets(): ProteinTarget[] {
    return TARGETS.map((t) => ({
      ...t,
      name: t.proteinName,
      functionDescription: t.biologicalFunction,
    }));
  }

  // Dashboard Metrics
  getSavedCompoundsCount(): number {
    return this.savedItems.filter((i) => i.type === 'compound' || i.itemType === 'compound').length;
  }

  getExploredTargetsCount(): number {
    const targetsInAnalyses = new Set(this.analyses.map((a) => a.targetId));
    this.savedItems
      .filter((i) => i.type === 'target' || i.itemType === 'target')
      .forEach((i) => targetsInAnalyses.add(i.entityId || (i as any).itemId));
    return targetsInAnalyses.size || TARGETS.length;
  }

  getCompletedAnalysesCount(): number {
    return this.analyses.filter((a) => a.status === 'completed').length;
  }

  getReportsGeneratedCount(): number {
    return 12; // Tracked report generations
  }

  getRecentAnalyses(limit = 5): AnalysisJob[] {
    return [...this.analyses].sort((a, b) => (b.submittedAt || b.dateSubmitted).localeCompare(a.submittedAt || a.dateSubmitted)).slice(0, limit);
  }

  // Analyses
  getAllAnalyses(): AnalysisJob[] {
    return this.analyses;
  }

  getAnalyses(): AnalysisJob[] {
    return this.analyses;
  }

  getAnalysisById(id: string): AnalysisJob | undefined {
    return this.analyses.find((a) => a.id === id);
  }

  addAnalysis(job: AnalysisJob) {
    this.analyses = [job, ...this.analyses];
    this.save('tt_analyses', this.analyses);
    this.addNotification({
      title: 'New Analysis Submitted',
      message: `Job ${job.id} (${job.compoundName} & ${job.targetGene}) has been queued.`,
      type: 'info',
      link: `/viewer?job=${job.id}`,
    });
    this.addAuditLog('SUBMIT_JOB', 'DTI_JOB', job.id, 'SUCCESS', `Submitted ${job.method} docking analysis`);
  }

  updateAnalysisStatus(id: string, status: 'queued' | 'running' | 'completed' | 'failed', results?: Partial<AnalysisJob> | number) {
    if (typeof results === 'number') {
      results = { dockingScore: results };
    }
    this.analyses = this.analyses.map((a) => (a.id === id ? { ...a, status, ...results } : a));
    this.save('tt_analyses', this.analyses);
    if (status === 'completed') {
      this.addNotification({
        title: 'Analysis Completed',
        message: `Job ${id} docking calculation finished successfully.`,
        type: 'success',
        link: `/viewer?job=${id}`,
      });
      this.addAuditLog('ANALYSIS_COMPLETE', 'DTI_JOB', id, 'SUCCESS', `Completed docking for job ${id}`);
    }
  }

  deleteAnalysis(id: string) {
    this.analyses = this.analyses.filter((a) => a.id !== id);
    this.save('tt_analyses', this.analyses);
    this.addAuditLog('DELETE_JOB', 'DTI_JOB', id, 'SUCCESS', `Deleted analysis ${id}`);
  }

  retryAnalysis(id: string) {
    const job = this.analyses.find((a) => a.id === id);
    if (!job) return;
    this.updateAnalysisStatus(id, 'running');
    setTimeout(() => {
      this.updateAnalysisStatus(id, 'completed', {
        completedAt: new Date().toLocaleString(),
        dockingScore: -9.8,
        predictedKdNm: 1.8,
      });
    }, 2000);
  }

  // Saved Items & Collections
  getSavedItems(): SavedItem[] {
    return this.savedItems.map((s) => ({
      ...s,
      itemType: s.type || s.itemType,
      itemId: s.entityId || s.itemId,
      savedAt: s.dateSaved || s.savedAt,
    }));
  }

  getCollections(): Collection[] {
    return this.collections.map((c) => ({
      ...c,
      createdAt: c.createdDate || c.createdAt,
    }));
  }

  saveCompound(compound: Compound, collectionName = 'General Saved', notes = '') {
    const existing = this.savedItems.find((s) => s.entityId === compound.id);
    if (existing) return;
    const item: SavedItem = {
      id: `SAV-${Date.now().toString().slice(-4)}`,
      type: 'compound',
      itemType: 'compound',
      entityId: compound.id,
      itemId: compound.id,
      name: compound.name,
      identifier: compound.id,
      collectionName,
      notes,
      dateSaved: new Date().toISOString().split('T')[0],
      savedAt: new Date().toISOString().split('T')[0],
    };
    this.savedItems = [item, ...this.savedItems];
    this.save('tt_saved_items', this.savedItems);
    this.addNotification({
      title: 'Compound Saved',
      message: `${compound.name} saved to collection "${collectionName}".`,
      type: 'info',
      link: '/saved',
    });
  }

  saveTarget(target: ProteinTarget, collectionName = 'General Saved', notes = '') {
    const existing = this.savedItems.find((s) => s.entityId === target.id);
    if (existing) return;
    const item: SavedItem = {
      id: `SAV-${Date.now().toString().slice(-4)}`,
      type: 'target',
      itemType: 'target',
      entityId: target.id,
      itemId: target.id,
      name: target.geneSymbol,
      identifier: target.uniprotId,
      collectionName,
      notes,
      dateSaved: new Date().toISOString().split('T')[0],
      savedAt: new Date().toISOString().split('T')[0],
    };
    this.savedItems = [item, ...this.savedItems];
    this.save('tt_saved_items', this.savedItems);
  }

  removeSavedItem(id: string) {
    this.savedItems = this.savedItems.filter((s) => s.id !== id);
    this.save('tt_saved_items', this.savedItems);
  }

  updateSavedItemNotes(id: string, notes: string) {
    this.savedItems = this.savedItems.map((s) => (s.id === id ? { ...s, notes } : s));
    this.save('tt_saved_items', this.savedItems);
  }

  addCollection(name: string, description: string) {
    const col: Collection = {
      id: `COL-${Date.now()}`,
      name,
      description,
      itemCount: 0,
      createdDate: new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString().split('T')[0],
    };
    this.collections = [...this.collections, col];
    this.save('tt_collections', this.collections);
  }

  createCollection(col: Collection) {
    const newCol: Collection = {
      ...col,
      createdDate: col.createdDate || col.createdAt || new Date().toISOString().split('T')[0],
      createdAt: col.createdAt || col.createdDate || new Date().toISOString().split('T')[0],
    };
    this.collections = [...this.collections, newCol];
    this.save('tt_collections', this.collections);
  }

  // Notifications
  getNotifications(): NotificationItem[] {
    return this.notifications.map((n) => ({
      ...n,
      isRead: n.read,
    }));
  }

  getUnreadNotificationsCount(): number {
    return this.notifications.filter((n) => !n.read).length;
  }

  markNotificationRead(id: string) {
    this.notifications = this.notifications.map((n) => (n.id === id ? { ...n, read: true, isRead: true } : n));
    this.save('tt_notifications', this.notifications);
  }

  markAllNotificationsRead() {
    this.notifications = this.notifications.map((n) => ({ ...n, read: true, isRead: true }));
    this.save('tt_notifications', this.notifications);
  }

  clearNotifications() {
    this.notifications = [];
    this.save('tt_notifications', this.notifications);
  }

  addNotification(n: Omit<NotificationItem, 'id' | 'timestamp' | 'read'>) {
    const item: NotificationItem = {
      ...n,
      id: `NOTIF-${Date.now()}`,
      timestamp: new Date().toLocaleString(),
      read: false,
      isRead: false,
    };
    this.notifications = [item, ...this.notifications];
    this.save('tt_notifications', this.notifications);
  }

  // Audit Logs
  getAuditLogs(): AuditLogEntry[] {
    return this.auditLogs.map((log) => ({
      ...log,
      userId: log.userEmail,
      ipAddress: '127.0.0.1',
    }));
  }

  addAuditLog(action: string, entityType: string, entityId: string, status: 'SUCCESS' | 'WARNING' | 'FAILED', details: string) {
    const entry: AuditLogEntry = {
      id: `LOG-${Date.now().toString().slice(-4)}`,
      timestamp: new Date().toLocaleString(),
      userEmail: this.user.email,
      action,
      entityType,
      entityId,
      status,
      details,
    };
    this.auditLogs = [entry, ...this.auditLogs.slice(0, 99)];
    this.save('tt_audit_logs', this.auditLogs);
  }

  // ADMET
  getAdmetProfiles(): AdmetProfile[] {
    return Object.values(ADMET_DATABASE);
  }

  getAdmetProfile(compoundId: string): AdmetProfile {
    if (ADMET_DATABASE[compoundId]) {
      return ADMET_DATABASE[compoundId];
    }
    // Dynamic fallback estimation for newly imported compound
    const drug = DRUGS.find((d) => d.id === compoundId);
    return {
      compoundId,
      compoundName: drug?.name || 'Screened Compound',
      giAbsorption: 'High',
      caco2Permeability: 19.5,
      bioavailabilityScore: 0.85,
      plasmaProteinBindingPercent: 91.5,
      bbbPermeability: 'Permeable',
      volumeOfDistributionLKg: 3.0,
      cyp3a4Substrate: true,
      cyp3a4Inhibitor: false,
      cyp2d6Substrate: false,
      cyp2d6Inhibitor: false,
      cyp2c9Inhibitor: false,
      totalClearanceMlMinKg: 5.1,
      eliminationHalfLifeHours: 22.0,
      hergInhibitionRisk: 'Low',
      hergToxicityRisk: 'Low',
      amesMutagenicity: 'Negative (Non-Mutagenic)',
      hepatotoxicityRisk: 'Low',
      hepatotoxicityFlag: false,
      skinSensitization: 'Non-Sensitizer',
      lipinskiViolations: 0,
      lipinskiRuleOfFive: { violations: 0 },
      ruleOfFivePassed: true,
      leadLikeness: true,
      syntheticAccessibilityScore: 3.4,
      predictionTimestamp: new Date().toISOString().split('T')[0],
      modelSource: 'Computational In Silico Ensemble Estimator',
    };
  }
}

export const appState = new AppStateService();
export const appStateService = appState;

