import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  ExternalLink,
  FileText,
  FlaskConical,
  Heart,
  Info,
  Pill,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Zap,
  Search,
  Loader2,
  BookOpen,
  Download,
  RefreshCw,
  FileSpreadsheet,
  Layers,
  Copy,
  Check,
  FileCode,
} from 'lucide-react';
import { DRUGS } from '../data/dataset';
import { evaluateAdmet, AdmetPrediction } from '../services/admetService';
import { searchPubMed, PubMedArticleRecord } from '../services/externalBioService';
import {
  LigandSelectorModal,
  SelectedLigand,
} from '../components/selection/LigandSelectorModal';
import { triggerFileDownload } from '../services/bioDataService';

function drugToSelectedLigand(drug: (typeof DRUGS)[0]): SelectedLigand {
  return {
    id: drug.id,
    name: drug.name,
    smiles: drug.smiles,
    formula: drug.formula,
    molecularWeight: drug.molecularWeight,
    logP: drug.logP ?? 3.4,
    hbd: drug.hBondDonors ?? 2,
    hba: drug.hBondAcceptors ?? 6,
    rotatableBonds: drug.rotatableBonds ?? 7,
    tpsa: drug.topologicalPolarSurfaceArea ?? 86.3,
    source: `DrugBank (${drug.id})`,
    sourceUrl: `https://go.drugbank.com/drugs/${drug.id}`,
  };
}

export const AdmetEvaluationPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCompoundId = searchParams.get('compound') || 'DB00619';

  // Selected compound state
  const initialDrug = DRUGS.find((d) => d.id === initialCompoundId) || DRUGS[0];
  const [selectedLigand, setSelectedLigand] = useState<SelectedLigand>(() =>
    drugToSelectedLigand(initialDrug)
  );

  // Modal state
  const [isLigandModalOpen, setIsLigandModalOpen] = useState(false);

  // ADMET evaluation state
  const [admetData, setAdmetData] = useState<AdmetPrediction | null>(null);
  const [isEvaluating, setIsEvaluating] = useState<boolean>(true);
  const [admetError, setAdmetError] = useState<string | null>(null);

  // PubMed state
  const [pubMedQuery, setPubMedQuery] = useState<string>(
    `${initialDrug.name} pharmacokinetics ADMET toxicity`
  );
  const [pubMedArticles, setPubMedArticles] = useState<PubMedArticleRecord[]>([]);
  const [isSearchingPubMed, setIsSearchingPubMed] = useState<boolean>(false);
  const [copiedPmid, setCopiedPmid] = useState<string | null>(null);

  // Run ADMET calculation
  const runAdmetEvaluation = useCallback(async (ligand: SelectedLigand) => {
    setIsEvaluating(true);
    setAdmetError(null);
    try {
      const pred = await evaluateAdmet({
        compoundName: ligand.name,
        smiles: ligand.smiles,
        molecularWeight: ligand.molecularWeight,
        logP: ligand.logP,
        hbd: ligand.hbd,
        hba: ligand.hba,
        rotatableBonds: ligand.rotatableBonds,
        tpsa: ligand.tpsa,
      });
      setAdmetData(pred);
    } catch (err: any) {
      console.error('ADMET evaluation error:', err);
      setAdmetError(err?.message || 'Failed to compute ADMET profile');
    } finally {
      setIsEvaluating(false);
    }
  }, []);

  // Run PubMed search
  const runPubMedSearch = useCallback(async (query: string) => {
    if (!query.trim()) return;
    setIsSearchingPubMed(true);
    try {
      const articles = await searchPubMed(query.trim());
      setPubMedArticles(articles);
    } catch (err) {
      console.error('PubMed search error:', err);
    } finally {
      setIsSearchingPubMed(false);
    }
  }, []);

  // Initial load or compound change
  useEffect(() => {
    runAdmetEvaluation(selectedLigand);
    const initialQuery = `${selectedLigand.name} pharmacokinetics ADMET toxicity`;
    setPubMedQuery(initialQuery);
    runPubMedSearch(initialQuery);
  }, [selectedLigand.id, selectedLigand.name, selectedLigand.smiles]);

  // Handle drug catalog dropdown change
  const handleCatalogSelect = (drugId: string) => {
    const found = DRUGS.find((d) => d.id === drugId);
    if (found) {
      const lig = drugToSelectedLigand(found);
      setSelectedLigand(lig);
      setSearchParams({ compound: found.id });
    }
  };

  // Handle compound selection from Modal (PubChem / ChEMBL / Custom SMILES)
  const handleModalSelect = (ligand: SelectedLigand) => {
    setSelectedLigand(ligand);
    setIsLigandModalOpen(false);
    setSearchParams({ compound: ligand.id });
  };

  // Export JSON dossier
  const handleExportJson = () => {
    if (!admetData) return;
    const exportPayload = {
      compound: selectedLigand,
      admetProfile: admetData,
      literatureCitations: pubMedArticles,
      exportedAt: new Date().toISOString(),
      platform: 'Drug Net In Silico Discovery Suite',
    };
    triggerFileDownload(
      JSON.stringify(exportPayload, null, 2),
      `${selectedLigand.name.replace(/\s+/g, '_')}_ADMET_PubMed_Dossier.json`,
      'application/json'
    );
  };

  // Export CSV summary
  const handleExportCsv = () => {
    if (!admetData) return;
    const rows = [
      ['Dimension', 'Metric', 'Value', 'Unit / Threshold', 'Assessment'],
      ['General', 'Compound Name', selectedLigand.name, '', ''],
      ['General', 'SMILES', `"${selectedLigand.smiles}"`, '', ''],
      ['Drug-likeness', 'Molecular Weight', admetData.molecularWeight, 'g/mol (<= 500)', admetData.molecularWeight <= 500 ? 'Pass' : 'Violation'],
      ['Drug-likeness', 'LogP (Lipophilicity)', admetData.logP, '<= 5.0', admetData.logP <= 5 ? 'Pass' : 'Violation'],
      ['Drug-likeness', 'H-Bond Donors (HBD)', admetData.hbd, '<= 5', admetData.hbd <= 5 ? 'Pass' : 'Violation'],
      ['Drug-likeness', 'H-Bond Acceptors (HBA)', admetData.hba, '<= 10', admetData.hba <= 10 ? 'Pass' : 'Violation'],
      ['Drug-likeness', 'Rotatable Bonds', admetData.rotatableBonds, '<= 10', admetData.rotatableBonds <= 10 ? 'Pass' : 'Violation'],
      ['Drug-likeness', 'TPSA', `${admetData.tpsa} Å²`, '<= 140 Å²', admetData.veberRulePassed ? 'Pass (Veber)' : 'Alert'],
      ['Drug-likeness', 'Lipinski Rule of 5', admetData.lipinskiRuleOfFivePassed ? 'PASSED' : 'VIOLATION', `${admetData.lipinskiViolations} Violations`, ''],
      ['Drug-likeness', 'Synthetic Accessibility', admetData.syntheticAccessibilityScore, '1 (easy) - 10 (hard)', admetData.syntheticAccessibilityScore <= 5 ? 'Feasible' : 'Challenging'],
      ['Absorption', 'Human Intestinal Absorption (HIA)', admetData.giAbsorption, 'High / Moderate / Low', ''],
      ['Absorption', 'Caco-2 Permeability', admetData.caco2Permeability, '10^-6 cm/s', ''],
      ['Absorption', 'Oral Bioavailability Score', `${(admetData.bioavailabilityScore * 100).toFixed(0)}%`, 'Percent', ''],
      ['Absorption', 'P-glycoprotein (P-gp) Substrate', admetData.pGlycoproteinSubstrate ? 'Yes' : 'No', '', ''],
      ['Distribution', 'Plasma Protein Binding (PPB)', `${admetData.plasmaProteinBindingPct}%`, 'Percent bound', ''],
      ['Distribution', 'Blood-Brain Barrier (BBB)', admetData.bbbPermeability, `logBB: ${admetData.logBb}`, ''],
      ['Distribution', 'Volume of Distribution (Vd)', `${admetData.volumeOfDistributionLKg} L/kg`, 'L/kg', ''],
      ['Metabolism', 'CYP3A4 Substrate', admetData.cyp3a4Substrate ? 'Yes' : 'No', '', ''],
      ['Metabolism', 'CYP3A4 Inhibitor', admetData.cyp3a4Inhibitor ? 'Yes' : 'No', '', ''],
      ['Metabolism', 'CYP2D6 Substrate', admetData.cyp2d6Substrate ? 'Yes' : 'No', '', ''],
      ['Metabolism', 'CYP2D6 Inhibitor', admetData.cyp2d6Inhibitor ? 'Yes' : 'No', '', ''],
      ['Metabolism', 'CYP2C9 Inhibitor', admetData.cyp2c9Inhibitor ? 'Yes' : 'No', '', ''],
      ['Excretion', 'Total Hepatic Clearance', `${admetData.totalClearanceMlMinKg} mL/min/kg`, 'mL/min/kg', ''],
      ['Excretion', 'Elimination Half-Life (t1/2)', `${admetData.eliminationHalfLifeHours} hours`, 'Hours', ''],
      ['Toxicity', 'hERG Cardiotoxicity Risk', admetData.hergInhibitionRisk, 'QT prolongation', ''],
      ['Toxicity', 'Ames Mutagenicity', admetData.amesMutagenicity, 'Bacterial mutagenicity', ''],
      ['Toxicity', 'Hepatotoxicity Risk (DILI)', admetData.hepatotoxicityRisk, 'Drug-induced liver injury', ''],
      ['Toxicity', 'Skin Sensitization', admetData.skinSensitization, '', ''],
    ];

    const csvContent = rows.map((r) => r.join(',')).join('\n');
    triggerFileDownload(
      csvContent,
      `${selectedLigand.name.replace(/\s+/g, '_')}_ADMET_metrics.csv`,
      'text/csv'
    );
  };

  const copyPmid = (pmid: string) => {
    navigator.clipboard.writeText(pmid);
    setCopiedPmid(pmid);
    setTimeout(() => setCopiedPmid(null), 2000);
  };

  // Quick preset PubMed queries
  const pubMedPresets = [
    { label: '⚡ Pharmacokinetics', query: `${selectedLigand.name} pharmacokinetics ADMET clearance` },
    { label: '🛡️ Safety & Toxicity', query: `${selectedLigand.name} cardiotoxicity hepatotoxicity safety` },
    { label: '🧬 CYP Metabolism', query: `${selectedLigand.name} cytochrome P450 CYP3A4 metabolism` },
    { label: '💊 Bioavailability', query: `${selectedLigand.name} oral bioavailability absorption Caco-2` },
    { label: '🏥 Clinical Trials', query: `${selectedLigand.name} clinical trial pharmacokinetics efficacy` },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header & Compound Selection */}
      <div className="border-b border-slate-200 pb-5 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2.5">
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                ADMET Evaluation & Evidence
              </h1>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded text-[11px] font-mono font-medium bg-emerald-50 text-emerald-800 border border-emerald-200">
                Pharmacokinetics & Safety
              </span>
            </div>
            <p className="text-sm text-slate-500 mt-1">
              In silico Absorption, Distribution, Metabolism, Excretion, and Toxicity profiling with live NCBI PubMed literature connection.
            </p>
          </div>

          {/* Action buttons: Search Any Compound modal + Export */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setIsLigandModalOpen(true)}
              className="inline-flex items-center space-x-2 px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Search Any Compound</span>
              <span className="px-1.5 py-0.2 bg-blue-500 text-white text-[10px] rounded font-mono font-normal">
                PubChem / ChEMBL
              </span>
            </button>

            <button
              onClick={handleExportJson}
              disabled={!admetData}
              className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium shadow-2xs disabled:opacity-50"
              title="Download structured JSON report"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export JSON</span>
            </button>

            <button
              onClick={handleExportCsv}
              disabled={!admetData}
              className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium shadow-2xs disabled:opacity-50"
              title="Download tabular metrics CSV"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>CSV</span>
            </button>
          </div>
        </div>

        {/* Selected Compound Info Bar & Fast Switcher */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm shrink-0">
              <Pill className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-bold text-slate-900">{selectedLigand.name}</span>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-white text-slate-600 border border-slate-200">
                  {selectedLigand.formula || 'C-H-N-O'}
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                  {selectedLigand.source}
                </span>
              </div>
              <div className="flex items-center space-x-3 mt-0.5 text-xs text-slate-500 font-mono">
                <span>MW: {selectedLigand.molecularWeight} g/mol</span>
                <span>•</span>
                <span className="truncate max-w-[280px] sm:max-w-md text-slate-600" title={selectedLigand.smiles}>
                  SMILES: {selectedLigand.smiles}
                </span>
              </div>
            </div>
          </div>

          {/* Catalog Quick Dropdown */}
          <div className="flex items-center space-x-2 shrink-0">
            <span className="text-xs font-mono text-slate-500">Curated Library:</span>
            <select
              value={DRUGS.some((d) => d.id === selectedLigand.id) ? selectedLigand.id : ''}
              onChange={(e) => handleCatalogSelect(e.target.value)}
              className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-800 focus:outline-none focus:border-blue-600 shadow-2xs font-mono"
            >
              {!DRUGS.some((d) => d.id === selectedLigand.id) && (
                <option value="">Custom: {selectedLigand.name}</option>
              )}
              {DRUGS.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.id})
                </option>
              ))}
            </select>

            <button
              onClick={() => runAdmetEvaluation(selectedLigand)}
              disabled={isEvaluating}
              className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-600 shadow-2xs"
              title="Recalculate ADMET"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isEvaluating ? 'animate-spin text-blue-600' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Model Disclaimer Notice */}
      <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-200 text-xs flex items-start space-x-3">
        <Info className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
        <p className="text-blue-900/90 leading-relaxed text-[11px]">
          <strong>Computational Estimation Disclaimer:</strong> All ADMET endpoints displayed below are in silico quantitative structure-activity relationship (QSAR) predictions derived from model ensembles ({admetData?.modelSource || 'QSAR & Heuristic Engine'}). These values serve as pre-clinical filtering guides and do not represent confirmed in vivo or clinical pharmacokinetic outcomes. Cross-reference with peer-reviewed literature below.
        </p>
      </div>

      {/* Drug-likeness & Lipinski Rule of Five Banner */}
      {isEvaluating && !admetData ? (
        <div className="bg-white p-12 rounded-xl border border-slate-200 text-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto" />
          <p className="text-sm font-semibold text-slate-700">
            Calculating QSAR ADMET Profile for {selectedLigand.name}...
          </p>
          <p className="text-xs text-slate-400 font-mono">
            Evaluating Lipinski parameters, CYP isoforms, clearance & cardiotoxicity
          </p>
        </div>
      ) : admetData ? (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base font-bold text-slate-900">
                  Drug-likeness & Lipinski Rule of Five
                </h2>
                <span className="text-xs text-slate-400 font-mono">
                  (Lipinski 1997 / Veber 2002)
                </span>
              </div>
              <p className="text-xs text-slate-500 font-mono mt-0.5">
                Evaluating oral bioavailability criteria for {selectedLigand.name}
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <span
                className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold ${
                  admetData.lipinskiRuleOfFivePassed
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-rose-50 text-rose-800 border border-rose-200'
                }`}
              >
                {admetData.lipinskiRuleOfFivePassed ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                )}
                <span>
                  {admetData.lipinskiRuleOfFivePassed
                    ? 'PASSED (0 Violations)'
                    : `${admetData.lipinskiViolations} VIOLATION${admetData.lipinskiViolations > 1 ? 'S' : ''}`}
                </span>
              </span>

              <span
                className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-mono ${
                  admetData.veberRulePassed
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : 'bg-amber-50 text-amber-700 border border-amber-200'
                }`}
              >
                <span>Veber: {admetData.veberRulePassed ? 'Pass' : 'Alert'}</span>
              </span>
            </div>
          </div>

          {/* Molecular Property Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 font-mono text-xs">
            {/* Molecular Weight */}
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-[10px] text-slate-400 uppercase block">Mol. Weight</span>
              <div className="text-base font-bold text-slate-900 mt-1">
                {admetData.molecularWeight} g/mol
              </div>
              <span className={`text-[10px] block mt-0.5 ${admetData.molecularWeight <= 500 ? 'text-emerald-700' : 'text-rose-600 font-semibold'}`}>
                {admetData.molecularWeight <= 500 ? '≤ 500 g/mol' : 'Exceeds 500'}
              </span>
            </div>

            {/* LogP */}
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-[10px] text-slate-400 uppercase block">LogP (Lipophilicity)</span>
              <div className="text-base font-bold text-slate-900 mt-1">
                {admetData.logP}
              </div>
              <span className={`text-[10px] block mt-0.5 ${admetData.logP <= 5 ? 'text-emerald-700' : 'text-rose-600 font-semibold'}`}>
                {admetData.logP <= 5 ? '≤ 5.0' : 'Exceeds 5.0'}
              </span>
            </div>

            {/* H-Bond Donors */}
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-[10px] text-slate-400 uppercase block">H-Bond Donors</span>
              <div className="text-base font-bold text-slate-900 mt-1">
                {admetData.hbd}
              </div>
              <span className={`text-[10px] block mt-0.5 ${admetData.hbd <= 5 ? 'text-emerald-700' : 'text-rose-600 font-semibold'}`}>
                {admetData.hbd <= 5 ? '≤ 5' : 'Exceeds 5'}
              </span>
            </div>

            {/* H-Bond Acceptors */}
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-[10px] text-slate-400 uppercase block">H-Bond Acceptors</span>
              <div className="text-base font-bold text-slate-900 mt-1">
                {admetData.hba}
              </div>
              <span className={`text-[10px] block mt-0.5 ${admetData.hba <= 10 ? 'text-emerald-700' : 'text-rose-600 font-semibold'}`}>
                {admetData.hba <= 10 ? '≤ 10' : 'Exceeds 10'}
              </span>
            </div>

            {/* Rotatable Bonds */}
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-[10px] text-slate-400 uppercase block">Rotatable Bonds</span>
              <div className="text-base font-bold text-slate-900 mt-1">
                {admetData.rotatableBonds}
              </div>
              <span className={`text-[10px] block mt-0.5 ${admetData.rotatableBonds <= 10 ? 'text-emerald-700' : 'text-rose-600 font-semibold'}`}>
                {admetData.rotatableBonds <= 10 ? '≤ 10' : 'Exceeds 10'}
              </span>
            </div>

            {/* TPSA & Synthetic Accessibility */}
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-[10px] text-slate-400 uppercase block">TPSA & Synth Access</span>
              <div className="text-sm font-bold text-slate-900 mt-1">
                {admetData.tpsa} Å²
              </div>
              <span className="text-[10px] text-slate-500 block mt-0.5">
                SA Score: {admetData.syntheticAccessibilityScore}/10
              </span>
            </div>
          </div>

          {/* Violations notice if any */}
          {admetData.lipinskiViolationsReasons && admetData.lipinskiViolationsReasons.length > 0 && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-800 space-y-1">
              <div className="font-semibold flex items-center space-x-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                <span>Lipinski Rule Violations:</span>
              </div>
              <ul className="list-disc list-inside text-[11px] font-mono space-y-0.5">
                {admetData.lipinskiViolationsReasons.map((reason, idx) => (
                  <li key={idx}>{reason}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ) : null}

      {/* 5 ADMET Dimension Panels */}
      {admetData && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* 1. Absorption */}
          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-2xs space-y-3">
            <div className="flex items-center space-x-2 pb-2 border-b border-slate-100">
              <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-800 flex items-center justify-center font-bold text-xs">
                A
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900">Absorption</h3>
                <p className="text-[10px] text-slate-400 font-mono">Gastrointestinal & epithelial uptake</p>
              </div>
            </div>

            <div className="space-y-2.5 text-xs font-mono">
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex justify-between items-center">
                <span className="text-slate-500">GI Absorption:</span>
                <span
                  className={`font-bold px-2 py-0.5 rounded border ${
                    admetData.giAbsorption === 'High'
                      ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
                      : admetData.giAbsorption === 'Moderate'
                      ? 'text-amber-700 bg-amber-50 border-amber-200'
                      : 'text-rose-700 bg-rose-50 border-rose-200'
                  }`}
                >
                  {admetData.giAbsorption}
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex justify-between items-center">
                <span className="text-slate-500">Caco-2 Permeability:</span>
                <span className="font-bold text-slate-900">
                  {admetData.caco2Permeability} &times; 10⁻⁶ cm/s
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex justify-between items-center">
                <span className="text-slate-500">Bioavailability Score:</span>
                <span className="font-bold text-slate-900">
                  {(admetData.bioavailabilityScore * 100).toFixed(0)}%
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex justify-between items-center">
                <span className="text-slate-500">P-gp Substrate:</span>
                <span
                  className={`font-bold px-2 py-0.5 rounded text-[11px] ${
                    admetData.pGlycoproteinSubstrate
                      ? 'text-amber-800 bg-amber-50 border border-amber-200'
                      : 'text-slate-700 bg-white border border-slate-200'
                  }`}
                >
                  {admetData.pGlycoproteinSubstrate ? 'Active Substrate' : 'Non-Substrate'}
                </span>
              </div>
            </div>
          </div>

          {/* 2. Distribution */}
          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-2xs space-y-3">
            <div className="flex items-center space-x-2 pb-2 border-b border-slate-100">
              <div className="w-7 h-7 rounded-lg bg-teal-50 text-teal-800 flex items-center justify-center font-bold text-xs">
                D
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900">Distribution</h3>
                <p className="text-[10px] text-slate-400 font-mono">Tissue, plasma & BBB partitioning</p>
              </div>
            </div>

            <div className="space-y-2.5 text-xs font-mono">
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex justify-between items-center">
                <span className="text-slate-500">Plasma Protein Binding:</span>
                <span className="font-bold text-slate-900">
                  {admetData.plasmaProteinBindingPct}% bound
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex justify-between items-center">
                <span className="text-slate-500">BBB Penetration:</span>
                <span
                  className={`font-bold px-2 py-0.5 rounded border ${
                    admetData.bbbPermeability.includes('Permeable') || admetData.bbbPermeability.includes('High')
                      ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
                      : 'text-amber-700 bg-amber-50 border-amber-200'
                  }`}
                >
                  {admetData.bbbPermeability}
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex justify-between items-center">
                <span className="text-slate-500">LogBB Partition:</span>
                <span className="font-bold text-slate-900">{admetData.logBb}</span>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex justify-between items-center">
                <span className="text-slate-500">Volume of Distribution:</span>
                <span className="font-bold text-slate-900">
                  {admetData.volumeOfDistributionLKg} L/kg
                </span>
              </div>
            </div>
          </div>

          {/* 3. Metabolism */}
          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-2xs space-y-3">
            <div className="flex items-center space-x-2 pb-2 border-b border-slate-100">
              <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-800 flex items-center justify-center font-bold text-xs">
                M
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900">Metabolism (CYP450)</h3>
                <p className="text-[10px] text-slate-400 font-mono">Hepatic enzymatic biotransformation</p>
              </div>
            </div>

            <div className="space-y-2.5 text-xs font-mono">
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex justify-between items-center">
                <span className="text-slate-500">CYP3A4 Substrate:</span>
                <span
                  className={`font-bold px-2 py-0.5 rounded ${
                    admetData.cyp3a4Substrate
                      ? 'text-purple-900 bg-purple-50 border border-purple-200'
                      : 'text-slate-700 bg-white border border-slate-200'
                  }`}
                >
                  {admetData.cyp3a4Substrate ? 'Yes (Substrate)' : 'No'}
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex justify-between items-center">
                <span className="text-slate-500">CYP3A4 Inhibitor:</span>
                <span className="font-bold text-slate-800">
                  {admetData.cyp3a4Inhibitor ? 'Active Inhibitor' : 'No Inhibition'}
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex justify-between items-center">
                <span className="text-slate-500">CYP2D6 Substrate:</span>
                <span className="font-bold text-slate-800">
                  {admetData.cyp2d6Substrate ? 'Yes' : 'No'}
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex justify-between items-center">
                <span className="text-slate-500">CYP2C9 Inhibition:</span>
                <span className="font-bold text-slate-800">
                  {admetData.cyp2c9Inhibitor ? 'Inhibitor Flag' : 'No Inhibition'}
                </span>
              </div>
            </div>
          </div>

          {/* 4. Excretion */}
          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-2xs space-y-3">
            <div className="flex items-center space-x-2 pb-2 border-b border-slate-100">
              <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-800 flex items-center justify-center font-bold text-xs">
                E
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900">Excretion</h3>
                <p className="text-[10px] text-slate-400 font-mono">Renal and biliary clearance kinetics</p>
              </div>
            </div>

            <div className="space-y-2.5 text-xs font-mono">
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex justify-between items-center">
                <span className="text-slate-500">Total Hepatic Clearance:</span>
                <span className="font-bold text-slate-900">
                  {admetData.totalClearanceMlMinKg} mL/min/kg
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex justify-between items-center">
                <span className="text-slate-500">Elimination Half-Life (t₁/₂):</span>
                <span className="font-bold text-blue-900">
                  {admetData.eliminationHalfLifeHours} hours
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex justify-between items-center">
                <span className="text-slate-500">Renal Fraction Flag:</span>
                <span className="font-bold text-slate-700">
                  {admetData.totalClearanceMlMinKg > 15 ? 'Rapid Clearance' : 'Moderate / Biliary'}
                </span>
              </div>
            </div>
          </div>

          {/* 5. Toxicity */}
          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-2xs space-y-3 lg:col-span-2">
            <div className="flex items-center space-x-2 pb-2 border-b border-slate-100">
              <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-800 flex items-center justify-center font-bold text-xs">
                T
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900">Toxicity Endpoints & Safety Warnings</h3>
                <p className="text-[10px] text-slate-400 font-mono">hERG cardiotoxicity, mutagenicity & liver injury</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs font-mono">
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-slate-400 text-[10px] block">hERG K⁺ Channel</span>
                <span
                  className={`font-bold text-sm mt-0.5 block ${
                    admetData.hergInhibitionRisk.includes('High')
                      ? 'text-rose-700'
                      : admetData.hergInhibitionRisk.includes('Moderate')
                      ? 'text-amber-700'
                      : 'text-emerald-800'
                  }`}
                >
                  {admetData.hergInhibitionRisk}
                </span>
                <span className="text-[10px] text-slate-400 mt-1 block">Cardiotoxicity QT risk</span>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-slate-400 text-[10px] block">Ames Mutagenicity</span>
                <span
                  className={`font-bold text-sm mt-0.5 block ${
                    admetData.amesMutagenicity.includes('Positive')
                      ? 'text-rose-700'
                      : 'text-emerald-800'
                  }`}
                >
                  {admetData.amesMutagenicity}
                </span>
                <span className="text-[10px] text-slate-400 mt-1 block">Bacterial reverse mutation</span>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-slate-400 text-[10px] block">Hepatotoxicity Risk (DILI)</span>
                <span
                  className={`font-bold text-sm mt-0.5 block ${
                    admetData.hepatotoxicityRisk.includes('High') || admetData.hepatotoxicityRisk.includes('Warning')
                      ? 'text-amber-800'
                      : 'text-emerald-800'
                  }`}
                >
                  {admetData.hepatotoxicityRisk}
                </span>
                <span className="text-[10px] text-slate-400 mt-1 block">Liver enzyme elevation</span>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-slate-400 text-[10px] block">Skin Sensitization</span>
                <span className="font-bold text-slate-800 text-sm mt-0.5 block">
                  {admetData.skinSensitization || 'Non-Sensitizer'}
                </span>
                <span className="text-[10px] text-slate-400 mt-1 block">Dermal safety flag</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PUBMED CLINICAL & PHARMACOKINETIC EVIDENCE SECTION */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold text-sm">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base font-bold text-slate-900">
                  PubMed Literature & Pharmacokinetic Evidence
                </h2>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                  NCBI Live
                </span>
              </div>
              <p className="text-xs text-slate-500 font-mono mt-0.5">
                Peer-reviewed citations and clinical pharmacokinetic studies for {selectedLigand.name}
              </p>
            </div>
          </div>

          <a
            href={`https://pubmed.ncbi.nlm.nih.gov/?term=${encodeURIComponent(
              `${selectedLigand.name} pharmacokinetics toxicity`
            )}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center space-x-1.5 text-xs text-blue-600 hover:text-blue-800 font-semibold"
          >
            <span>Open in PubMed</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* PubMed Search Bar & Presets */}
        <div className="space-y-3">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              runPubMedSearch(pubMedQuery);
            }}
            className="flex items-center gap-2"
          >
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={pubMedQuery}
                onChange={(e) => setPubMedQuery(e.target.value)}
                placeholder="Search PubMed (e.g. Imatinib cardiotoxicity, Caco-2 permeability, clearance)..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:bg-white transition-colors"
              />
            </div>
            <button
              type="submit"
              disabled={isSearchingPubMed || !pubMedQuery.trim()}
              className="inline-flex items-center space-x-1.5 px-4 py-2.5 bg-[#1E3A8A] hover:bg-[#1B365D] text-white rounded-lg text-xs font-semibold shadow-xs disabled:opacity-50 transition-colors shrink-0"
            >
              {isSearchingPubMed ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Search className="w-3.5 h-3.5" />
              )}
              <span>Query NCBI</span>
            </button>
          </form>

          {/* Quick preset filters */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] text-slate-400 font-mono mr-1">Suggested:</span>
            {pubMedPresets.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setPubMedQuery(preset.query);
                  runPubMedSearch(preset.query);
                }}
                className={`text-[11px] font-mono px-2.5 py-1 rounded-full border transition-colors ${
                  pubMedQuery === preset.query
                    ? 'bg-blue-50 text-blue-800 border-blue-300 font-semibold'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {/* Literature Results List */}
        {isSearchingPubMed ? (
          <div className="py-8 text-center space-y-2">
            <Loader2 className="w-6 h-6 animate-spin text-blue-600 mx-auto" />
            <p className="text-xs text-slate-500 font-mono">
              Retrieving indexed literature from NCBI PubMed E-Utilities...
            </p>
          </div>
        ) : pubMedArticles.length === 0 ? (
          <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200 space-y-2">
            <BookOpen className="w-8 h-8 text-slate-400 mx-auto" />
            <p className="text-xs font-semibold text-slate-700">No PubMed articles found for this query</p>
            <p className="text-[11px] text-slate-400 font-mono">
              Try refining the search term or searching with the primary compound name.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-500 font-mono">
              <span>{pubMedArticles.length} peer-reviewed publications retrieved</span>
              <span className="text-[11px] text-slate-400">Indexed by National Library of Medicine</span>
            </div>

            <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
              {pubMedArticles.map((article, index) => (
                <div
                  key={article.pmid || index}
                  className="p-4 bg-white hover:bg-slate-50/70 transition-colors space-y-2"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                    <h4 className="text-xs font-bold text-slate-900 leading-snug">
                      <a
                        href={article.pubmedUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="hover:text-blue-700 hover:underline flex items-start gap-1.5"
                      >
                        <span>{article.title}</span>
                        <ExternalLink className="w-3 h-3 text-slate-400 shrink-0 mt-0.5 inline" />
                      </a>
                    </h4>

                    {/* PMID Badge & Copy */}
                    <div className="flex items-center space-x-1.5 shrink-0 font-mono text-[10px]">
                      <span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 font-bold border border-indigo-200">
                        PMID: {article.pmid}
                      </span>
                      <button
                        onClick={() => copyPmid(article.pmid)}
                        className="p-1 text-slate-400 hover:text-slate-600 rounded"
                        title="Copy PMID"
                      >
                        {copiedPmid === article.pmid ? (
                          <Check className="w-3 h-3 text-emerald-600" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-500 font-mono">
                    <span className="text-slate-700 font-medium">{article.authors}</span>
                    <span>•</span>
                    <span className="italic text-slate-600">{article.sourceJournal}</span>
                    <span>•</span>
                    <span>{article.pubDate}</span>
                    {article.doi && (
                      <>
                        <span>•</span>
                        <a
                          href={article.doiUrl || `https://doi.org/${article.doi}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          DOI: {article.doi}
                        </a>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Action Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-200">
        <Link
          to={`/compare?compoundA=${selectedLigand.id}`}
          className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-medium"
        >
          <span>Compare with Another Candidate</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>

        <div className="flex items-center space-x-2">
          <Link
            to={`/docking?compound=${encodeURIComponent(selectedLigand.id)}`}
            className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-lg border border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-800 text-xs font-semibold"
          >
            <Layers className="w-3.5 h-3.5 text-blue-600" />
            <span>Dock Against Target</span>
          </Link>

          <Link
            to={`/analysis/new?compound=${encodeURIComponent(selectedLigand.id)}`}
            className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-lg bg-[#1E3A8A] hover:bg-[#1B365D] text-white text-xs font-semibold shadow-2xs"
          >
            <span>Run Complete Pipeline</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Ligand Selector Modal for Searching ANY Compound across PubChem / ChEMBL / Custom SMILES */}
      <LigandSelectorModal
        isOpen={isLigandModalOpen}
        onClose={() => setIsLigandModalOpen(false)}
        onSelect={handleModalSelect}
        initialSelectedId={selectedLigand.id}
      />
    </div>
  );
};

export default AdmetEvaluationPage;
