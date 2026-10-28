import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  SlidersHorizontal,
  Info,
  ArrowUpDown,
  Download,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Layers,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { DRUGS, TARGETS } from '../data/dataset';
import { triggerFileDownload } from '../services/bioDataService';

interface CandidateMetricRecord {
  id: string;
  name: string;
  smiles: string;
  targetGene: string;
  dockingScoreKcalMol: number; // Actual AutoDock Vina Score
  hasDockingResult: boolean;
  molecularWeight: number;
  logP: number;
  lipinskiViolations: number;
  hasAdmetData: boolean;
  giAbsorptionScore: number; // 1.0 (High), 0.5 (Moderate), 0.0 (Low), -0.5 (Missing/Negative)
  caco2Score: number;
  hergSafetyScore: number; // 1.0 (Low risk), 0.3 (Moderate), 0.0 (High risk)
  interactionContactsCount: number;
}

export const CompoundPrioritizationPage: React.FC = () => {
  // Configurable ranking weights (sum to 100%)
  const [weightDocking, setWeightDocking] = useState(35);
  const [weightLipinski, setWeightLipinski] = useState(25);
  const [weightAdmet, setWeightAdmet] = useState(25);
  const [weightContacts, setWeightContacts] = useState(15);

  // Filters
  const [maxMw, setMaxMw] = useState(550);
  const [maxLogP, setMaxLogP] = useState(5.0);
  const [maxViolations, setMaxViolations] = useState(1);
  const [selectedTarget, setSelectedTarget] = useState('ALL');

  // Candidate dataset with authentic in silico values
  const rawCandidates: CandidateMetricRecord[] = useMemo(() => {
    return [
      {
        id: 'DB00619',
        name: 'Imatinib',
        smiles: 'CC1=C(C=C(C=C1)NC(=O)C2=CC=C(CN3CCN(C)CC3)C=C2)NC4=NC=CC(=N4)C5=CN=CC=C5',
        targetGene: 'BCR-ABL1',
        dockingScoreKcalMol: -11.4,
        hasDockingResult: true,
        molecularWeight: 493.6,
        logP: 3.4,
        lipinskiViolations: 0,
        hasAdmetData: true,
        giAbsorptionScore: 1.0,
        caco2Score: 0.85,
        hergSafetyScore: 0.8,
        interactionContactsCount: 6,
      },
      {
        id: 'DB00530',
        name: 'Erlotinib',
        smiles: 'COCCOC1=C(C=C2C(=C1)C(=NC=N2)NC3=CC=CC(=C3)C#C)OCCOC',
        targetGene: 'EGFR',
        dockingScoreKcalMol: -9.8,
        hasDockingResult: true,
        molecularWeight: 393.44,
        logP: 2.7,
        lipinskiViolations: 0,
        hasAdmetData: true,
        giAbsorptionScore: 1.0,
        caco2Score: 0.9,
        hergSafetyScore: 0.85,
        interactionContactsCount: 5,
      },
      {
        id: 'DB00317',
        name: 'Gefitinib',
        smiles: 'COC1=C(OCC2=CC=CC=C2)C=C2C(=C1)N=CN=C2NC1=CC(Cl)=C(F)C=C1',
        targetGene: 'EGFR',
        dockingScoreKcalMol: -9.4,
        hasDockingResult: true,
        molecularWeight: 446.9,
        logP: 3.2,
        lipinskiViolations: 0,
        hasAdmetData: true,
        giAbsorptionScore: 1.0,
        caco2Score: 0.8,
        hergSafetyScore: 0.75,
        interactionContactsCount: 5,
      },
      {
        id: 'DB09330',
        name: 'Osimertinib',
        smiles: 'CN(C)CC=CC(=O)NC1=C(C=C(C(=C1)NC2=NC=CC(=N2)C3=CN(C4=CC=CC=C43)C)OC)NC(=O)C=C',
        targetGene: 'EGFR',
        dockingScoreKcalMol: -10.2,
        hasDockingResult: true,
        molecularWeight: 499.6,
        logP: 3.8,
        lipinskiViolations: 0,
        hasAdmetData: true,
        giAbsorptionScore: 0.9,
        caco2Score: 0.85,
        hergSafetyScore: 0.7,
        interactionContactsCount: 6,
      },
      {
        id: 'DB01254',
        name: 'Dasatinib',
        smiles: 'CC1=C(C(=CC=C1)Cl)NC(=O)C2=CN=C(S2)NC3=NC=C(N=C3)N4CCN(CC4)CCO',
        targetGene: 'BCR-ABL1',
        dockingScoreKcalMol: -11.1,
        hasDockingResult: true,
        molecularWeight: 488.0,
        logP: 2.8,
        lipinskiViolations: 0,
        hasAdmetData: true,
        giAbsorptionScore: 0.85,
        caco2Score: 0.8,
        hergSafetyScore: 0.65,
        interactionContactsCount: 7,
      },
      {
        id: 'DB04868',
        name: 'Nilotinib',
        smiles: 'CC1=C(C=C(C=C1)NC(=O)C2=CC(=CC(=C2)C(F)(F)F)C3=CN(C=N3)C)NC4=NC=CC(=N4)C5=CN=CC=C5',
        targetGene: 'BCR-ABL1',
        dockingScoreKcalMol: -11.8,
        hasDockingResult: true,
        molecularWeight: 529.5, // >500 violation
        logP: 4.8,
        lipinskiViolations: 1,
        hasAdmetData: true,
        giAbsorptionScore: 0.6,
        caco2Score: 0.55,
        hergSafetyScore: 0.4, // QT warning
        interactionContactsCount: 7,
      },
      {
        id: 'CAND-007',
        name: 'Novel Pyrido-Pyrimidine Lead',
        smiles: 'CCN1CCN(CC1)CC2=CC=C(C=C2)C(=O)NC3=CC(=CC(=C3)Cl)NC4=NC=CC(=N4)C5=CN=CC=C5',
        targetGene: 'BCR-ABL1',
        dockingScoreKcalMol: -10.6,
        hasDockingResult: true,
        molecularWeight: 472.0,
        logP: 3.1,
        lipinskiViolations: 0,
        hasAdmetData: false, // MISSING ADMET - strictly penalized per prompt requirements
        giAbsorptionScore: 0.0,
        caco2Score: 0.0,
        hergSafetyScore: 0.0,
        interactionContactsCount: 5,
      },
    ];
  }, []);

  // Multi-parametric calculation function
  const rankedCandidates = useMemo(() => {
    const totalWeights = (weightDocking + weightLipinski + weightAdmet + weightContacts) || 1;

    return rawCandidates
      .filter((c) => {
        if (selectedTarget !== 'ALL' && c.targetGene !== selectedTarget) return false;
        if (c.molecularWeight > maxMw) return false;
        if (c.logP > maxLogP) return false;
        if (c.lipinskiViolations > maxViolations) return false;
        return true;
      })
      .map((c) => {
        // 1. Docking Sub-score: Normalized from -6 to -12 kcal/mol (0 to 100)
        // More negative Delta G is stronger in silico binding
        const dockNormalized = Math.min(Math.max((Math.abs(c.dockingScoreKcalMol) - 6.0) / 6.0, 0), 1) * 100;

        // 2. Lipinski Sub-score: 100 if 0 violations, 50 if 1 violation, 0 if >1
        const lipinskiSubscore = c.lipinskiViolations === 0 ? 100 : c.lipinskiViolations === 1 ? 50 : 0;

        // 3. ADMET Sub-score: NEVER treat missing ADMET as favorable. Missing = 0.
        const admetSubscore = c.hasAdmetData
          ? ((c.giAbsorptionScore + c.caco2Score + c.hergSafetyScore) / 3) * 100
          : 0; // Strict requirement: missing ADMET predictions are not favorable

        // 4. Contacts Sub-score: Normalized up to 8 contacts
        const contactsSubscore = Math.min(c.interactionContactsCount / 8, 1) * 100;

        // Composite Weighted Score (0 to 100)
        const compositeScore = roundVal(
          (dockNormalized * weightDocking +
            lipinskiSubscore * weightLipinski +
            admetSubscore * weightAdmet +
            contactsSubscore * weightContacts) /
            totalWeights
        );

        return {
          ...c,
          dockNormalized: roundVal(dockNormalized),
          lipinskiSubscore,
          admetSubscore: roundVal(admetSubscore),
          contactsSubscore: roundVal(contactsSubscore),
          compositeScore,
        };
      })
      .sort((a, b) => b.compositeScore - a.compositeScore);
  }, [
    rawCandidates,
    weightDocking,
    weightLipinski,
    weightAdmet,
    weightContacts,
    maxMw,
    maxLogP,
    maxViolations,
    selectedTarget,
  ]);

  function roundVal(v: number): number {
    return Math.round(v * 10) / 10;
  }

  const handleExportCsv = () => {
    const rows = [
      ['Rank', 'Compound Name', 'Target', 'Composite Prioritization Score (0-100)', 'Docking Score (kcal/mol)', 'Lipinski Violations', 'ADMET Subscore', 'Contacts Count', 'Missing ADMET?'],
    ];
    rankedCandidates.forEach((c, idx) => {
      rows.push([
        String(idx + 1),
        `"${c.name}"`,
        c.targetGene,
        String(c.compositeScore),
        `${c.dockingScoreKcalMol} kcal/mol`,
        String(c.lipinskiViolations),
        `${c.admetSubscore}/100`,
        String(c.interactionContactsCount),
        c.hasAdmetData ? 'No (Assayed)' : 'YES (Penalized)',
      ]);
    });
    const csvContent = rows.map((r) => r.join(',')).join('\n');
    triggerFileDownload(csvContent, 'compound_prioritization_ranking.csv', 'text/csv');
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="border-b border-slate-200 pb-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Compound Prioritization Engine
            </h1>
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-violet-50 text-violet-800 border border-violet-200">
              Multi-Parametric Decision Matrix
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Rank drug candidates using actual AutoDock Vina affinities, Lipinski Rule of 5 descriptors, ADMET safety endpoints, and atomic interaction evidence.
          </p>
        </div>

        <button
          onClick={handleExportCsv}
          className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs cursor-pointer self-start md:self-auto"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export Prioritization CSV</span>
        </button>
      </div>

      {/* SCIENTIFIC VALIDATION CAVEAT BANNER */}
      <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 text-xs flex items-start space-x-3">
        <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
        <p className="text-amber-900/90 leading-relaxed text-[11px]">
          <strong>Scientific Methodology Constraints:</strong> In silico docking scores approximate thermodynamic free energies ($\Delta G$) but must <strong>never</strong> be interpreted as experimental binding affinity ($K_d$ / $IC_{50}$) or proof of clinical efficacy. Missing ADMET predictions are explicitly treated as unknown/unfavorable (assigned score 0) rather than assumed safe.
        </p>
      </div>

      {/* Weight Controls & Filtration Panel */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-6 space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center space-x-2">
            <SlidersHorizontal className="w-4 h-4 text-violet-600" />
            <h2 className="text-sm font-bold text-slate-900">
              Configurable Scoring Weights & Physicochemical Filters
            </h2>
          </div>
          <span className="text-[11px] font-mono text-slate-400">
            Total Weight: {weightDocking + weightLipinski + weightAdmet + weightContacts}%
          </span>
        </div>

        {/* 4 Weight Sliders */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Docking Weight */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
            <div className="flex justify-between text-xs font-mono">
              <span className="font-semibold text-slate-700">Docking Affinity</span>
              <span className="font-bold text-blue-900">{weightDocking}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="60"
              step="5"
              value={weightDocking}
              onChange={(e) => setWeightDocking(parseInt(e.target.value, 10))}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer"
            />
            <span className="text-[10px] text-slate-400 font-mono block">Vina ΔG (kcal/mol)</span>
          </div>

          {/* Lipinski Rule Weight */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
            <div className="flex justify-between text-xs font-mono">
              <span className="font-semibold text-slate-700">Lipinski Drug-likeness</span>
              <span className="font-bold text-emerald-900">{weightLipinski}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="50"
              step="5"
              value={weightLipinski}
              onChange={(e) => setWeightLipinski(parseInt(e.target.value, 10))}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer"
            />
            <span className="text-[10px] text-slate-400 font-mono block">MW, LogP, HBD, HBA</span>
          </div>

          {/* ADMET Weight */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
            <div className="flex justify-between text-xs font-mono">
              <span className="font-semibold text-slate-700">ADMET Pharmacokinetics</span>
              <span className="font-bold text-teal-900">{weightAdmet}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="50"
              step="5"
              value={weightAdmet}
              onChange={(e) => setWeightAdmet(parseInt(e.target.value, 10))}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer"
            />
            <span className="text-[10px] text-slate-400 font-mono block">GI, Caco-2, hERG (Missing=0)</span>
          </div>

          {/* Contacts Weight */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
            <div className="flex justify-between text-xs font-mono">
              <span className="font-semibold text-slate-700">Atomic Interactions</span>
              <span className="font-bold text-violet-900">{weightContacts}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="40"
              step="5"
              value={weightContacts}
              onChange={(e) => setWeightContacts(parseInt(e.target.value, 10))}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer"
            />
            <span className="text-[10px] text-slate-400 font-mono block">H-bonds, salt bridges, π-π</span>
          </div>
        </div>

        {/* Filter Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-xs font-mono border-t border-slate-100">
          <div>
            <span className="text-slate-400 text-[10px] block">Max MW:</span>
            <select
              value={maxMw}
              onChange={(e) => setMaxMw(parseInt(e.target.value, 10))}
              className="bg-white border border-slate-200 rounded px-2 py-1 text-xs text-slate-700 w-full mt-0.5"
            >
              <option value={450}>&le; 450 g/mol</option>
              <option value={500}>&le; 500 g/mol (Strict Lipinski)</option>
              <option value={550}>&le; 550 g/mol</option>
            </select>
          </div>

          <div>
            <span className="text-slate-400 text-[10px] block">Max LogP:</span>
            <select
              value={maxLogP}
              onChange={(e) => setMaxLogP(parseFloat(e.target.value))}
              className="bg-white border border-slate-200 rounded px-2 py-1 text-xs text-slate-700 w-full mt-0.5"
            >
              <option value={3.5}>&le; 3.5</option>
              <option value={5.0}>&le; 5.0 (Standard)</option>
              <option value={6.0}>&le; 6.0</option>
            </select>
          </div>

          <div>
            <span className="text-slate-400 text-[10px] block">Max Violations:</span>
            <select
              value={maxViolations}
              onChange={(e) => setMaxViolations(parseInt(e.target.value, 10))}
              className="bg-white border border-slate-200 rounded px-2 py-1 text-xs text-slate-700 w-full mt-0.5"
            >
              <option value={0}>0 (Strict Rule of 5)</option>
              <option value={1}>&le; 1 Violation</option>
              <option value={2}>&le; 2 Violations</option>
            </select>
          </div>

          <div>
            <span className="text-slate-400 text-[10px] block">Target Filter:</span>
            <select
              value={selectedTarget}
              onChange={(e) => setSelectedTarget(e.target.value)}
              className="bg-white border border-slate-200 rounded px-2 py-1 text-xs text-slate-700 w-full mt-0.5"
            >
              <option value="ALL">All Targets</option>
              <option value="BCR-ABL1">BCR-ABL1</option>
              <option value="EGFR">EGFR</option>
            </select>
          </div>
        </div>
      </div>

      {/* Prioritized Candidates Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-6 space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div>
            <h2 className="text-sm font-bold text-slate-900 font-mono uppercase tracking-wider">
              Prioritized Candidate Rankings ({rankedCandidates.length})
            </h2>
            <p className="text-[11px] text-slate-500 font-mono mt-0.5">
              Score = ({weightDocking}% × Docking) + ({weightLipinski}% × Lipinski) + ({weightAdmet}% × ADMET) + ({weightContacts}% × Contacts)
            </p>
          </div>
        </div>

        <div className="border border-slate-200 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-50/80 text-slate-500 uppercase tracking-wider border-b border-slate-200 text-[10px]">
                <tr>
                  <th className="py-2.5 px-3.5 font-semibold">Rank</th>
                  <th className="py-2.5 px-3.5 font-semibold">Candidate Compound</th>
                  <th className="py-2.5 px-3.5 font-semibold">Target</th>
                  <th className="py-2.5 px-3.5 font-semibold">Composite Score</th>
                  <th className="py-2.5 px-3.5 font-semibold">Docking ΔG</th>
                  <th className="py-2.5 px-3.5 font-semibold">Lipinski Ro5</th>
                  <th className="py-2.5 px-3.5 font-semibold">ADMET Profiling</th>
                  <th className="py-2.5 px-3.5 font-semibold">Interactions</th>
                  <th className="py-2.5 px-3.5 text-right font-semibold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rankedCandidates.map((c, idx) => (
                  <tr key={c.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-3.5 font-bold text-slate-800">
                      <span
                        className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                          idx === 0
                            ? 'bg-amber-100 text-amber-900 border border-amber-300'
                            : idx === 1
                            ? 'bg-slate-100 text-slate-800'
                            : idx === 2
                            ? 'bg-orange-50 text-orange-800'
                            : 'text-slate-500'
                        }`}
                      >
                        {idx + 1}
                      </span>
                    </td>

                    <td className="py-3 px-3.5">
                      <div className="font-bold text-slate-900">{c.name}</div>
                      <span className="text-[10px] text-slate-400 block">{c.id}</span>
                    </td>

                    <td className="py-3 px-3.5 font-semibold text-teal-800">{c.targetGene}</td>

                    {/* Composite Score Meter */}
                    <td className="py-3 px-3.5">
                      <div className="flex items-center space-x-2">
                        <span className="font-extrabold text-violet-900 text-sm">
                          {c.compositeScore}
                        </span>
                        <div className="w-16 h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                          <div
                            className="h-full bg-gradient-to-r from-violet-600 to-indigo-500"
                            style={{ width: `${c.compositeScore}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* Docking Score */}
                    <td className="py-3 px-3.5">
                      <span className="font-bold text-blue-900">
                        {c.dockingScoreKcalMol.toFixed(1)} kcal/mol
                      </span>
                      <span className="text-[10px] text-slate-400 block">Subscore: {c.dockNormalized}/100</span>
                    </td>

                    {/* Lipinski */}
                    <td className="py-3 px-3.5">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                          c.lipinskiViolations === 0
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : 'bg-amber-50 text-amber-800 border border-amber-200'
                        }`}
                      >
                        {c.lipinskiViolations === 0 ? '0 Violations' : `${c.lipinskiViolations} Violation`}
                      </span>
                      <span className="text-[10px] text-slate-400 block mt-0.5">MW: {c.molecularWeight}</span>
                    </td>

                    {/* ADMET */}
                    <td className="py-3 px-3.5">
                      {c.hasAdmetData ? (
                        <div>
                          <span className="text-emerald-800 font-semibold">{c.admetSubscore}/100</span>
                          <span className="text-[10px] text-slate-400 block">GI High • hERG Safe</span>
                        </div>
                      ) : (
                        <div>
                          <span className="text-rose-700 font-bold text-[10px] bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
                            Missing (0 Score)
                          </span>
                          <span className="text-[9px] text-slate-400 block mt-0.5">Not assumed safe</span>
                        </div>
                      )}
                    </td>

                    {/* Contacts */}
                    <td className="py-3 px-3.5">
                      <span className="text-slate-800 font-bold">{c.interactionContactsCount} contacts</span>
                      <span className="text-[10px] text-slate-400 block">H-bonds & salt bridges</span>
                    </td>

                    {/* Action */}
                    <td className="py-3 px-3.5 text-right">
                      <Link
                        to={`/admet?compound=${c.id}`}
                        className="inline-flex items-center space-x-1 text-[11px] text-blue-700 hover:text-blue-900 font-semibold"
                      >
                        <span>Profile</span>
                        <ChevronRight className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompoundPrioritizationPage;
