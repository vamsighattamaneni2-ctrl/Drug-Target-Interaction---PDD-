import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Activity,
  ArrowRight,
  BadgeCheck,
  CheckCircle2,
  Crosshair,
  Download,
  FileSpreadsheet,
  FileText,
  FlaskConical,
  GitBranch,
  Pill,
  Printer,
  RefreshCw,
  Share2,
  Sparkles,
} from 'lucide-react';
import {
  INTERACTIONS,
  DRUGS,
  TARGETS,
  DISEASES,
  PATHWAYS,
  REPURPOSING_CANDIDATES,
  THERAPEUTIC_OPPORTUNITIES,
} from '../data/dataset';

type ReportType =
  | 'interaction'
  | 'drug'
  | 'target'
  | 'network'
  | 'opportunity'
  | 'repurposing';

export const ReportsExportPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialType = (searchParams.get('type') as ReportType) || 'interaction';
  const selectedEntityId = searchParams.get('id') || '';

  const [activeReportType, setActiveReportType] = useState<ReportType>(initialType);
  const [isGenerating, setIsGenerating] = useState(false);
  const [reportGeneratedAt, setReportGeneratedAt] = useState<string>(
    new Date().toLocaleString()
  );

  const handleGenerate = (type: ReportType) => {
    setIsGenerating(true);
    setActiveReportType(type);
    setTimeout(() => {
      setReportGeneratedAt(new Date().toLocaleString());
      setIsGenerating(false);
    }, 200);
  };

  // CSV Export
  const handleExportCSV = () => {
    let headers: string[] = [];
    let rows: (string | number)[][] = [];

    if (activeReportType === 'interaction') {
      headers = ['Drug', 'Drug ID', 'Target Gene', 'Target ID', 'Disease', 'Score', 'Confidence', 'Kd (nM)'];
      rows = INTERACTIONS.map((i) => [
        `"${i.drugName}"`,
        i.drugId,
        `"${i.targetGene}"`,
        i.targetId,
        `"${i.diseaseName}"`,
        i.score.toFixed(2),
        i.confidence,
        i.affinityKdNm.toFixed(1),
      ]);
    } else if (activeReportType === 'drug') {
      headers = ['Drug ID', 'Drug Name', 'Type', 'Therapeutic Class', 'Known Targets', 'Associated Diseases'];
      rows = DRUGS.map((d) => [
        d.id,
        `"${d.name}"`,
        d.type,
        `"${d.therapeuticClass}"`,
        `"${d.targetIds.join(', ')}"`,
        `"${d.diseaseIds.join(', ')}"`,
      ]);
    } else if (activeReportType === 'target') {
      headers = ['Target ID', 'Gene Symbol', 'Protein Name', 'Class', 'Associated Drugs', 'Associated Diseases'];
      rows = TARGETS.map((t) => [
        t.id,
        t.geneSymbol,
        `"${t.proteinName}"`,
        `"${t.targetClass}"`,
        `"${t.drugIds.join(', ')}"`,
        `"${t.diseaseIds.join(', ')}"`,
      ]);
    } else if (activeReportType === 'network') {
      headers = ['Entity ID', 'Entity Name', 'Type', 'Connections', 'Associated Nodes'];
      rows = [
        ...DRUGS.map((d) => [d.id, `"${d.name}"`, 'Drug', d.targetIds.length, `"${d.targetIds.join(', ')}"`]),
        ...TARGETS.map((t) => [t.id, `"${t.geneSymbol}"`, 'Target', t.drugIds.length, `"${t.drugIds.join(', ')}"`]),
        ...DISEASES.map((dis) => [dis.id, `"${dis.name}"`, 'Disease', dis.targetIds.length, `"${dis.targetIds.join(', ')}"`]),
      ];
    } else if (activeReportType === 'opportunity') {
      headers = ['Category', 'Title', 'Drug', 'Target', 'Disease', 'Score', 'Rationale'];
      rows = THERAPEUTIC_OPPORTUNITIES.map((o) => [
        o.category,
        `"${o.categoryTitle}"`,
        `"${o.drugName || '—'}"`,
        `"${o.targetGene || '—'}"`,
        `"${o.diseaseName || '—'}"`,
        o.score ? o.score.toFixed(2) : '—',
        `"${o.rationale}"`,
      ]);
    } else {
      headers = ['Drug', 'Candidate Target', 'Primary Disease', 'Candidate Disease', 'Repurposing Score', 'Evidence'];
      rows = REPURPOSING_CANDIDATES.map((r) => [
        `"${r.drugName}"`,
        `"${r.candidateTarget}"`,
        `"${r.primaryDisease}"`,
        `"${r.candidateDisease}"`,
        r.repurposingScore.toFixed(2),
        `"${r.evidence}"`,
      ]);
    }

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `TheraTarget_${activeReportType}_Report.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // JSON Export
  const handleExportJSON = () => {
    let exportData: any = {};
    if (activeReportType === 'interaction') {
      exportData = { title: 'Interaction Analysis Report', generatedAt: reportGeneratedAt, dataset: INTERACTIONS };
    } else if (activeReportType === 'drug') {
      exportData = { title: 'Drug Profile Report', generatedAt: reportGeneratedAt, dataset: DRUGS };
    } else if (activeReportType === 'target') {
      exportData = { title: 'Target Profile Report', generatedAt: reportGeneratedAt, dataset: TARGETS };
    } else if (activeReportType === 'network') {
      exportData = { title: 'Network Topology Report', generatedAt: reportGeneratedAt, drugs: DRUGS, targets: TARGETS, pathways: PATHWAYS, diseases: DISEASES };
    } else if (activeReportType === 'opportunity') {
      exportData = { title: 'Therapeutic Opportunity Report', generatedAt: reportGeneratedAt, dataset: THERAPEUTIC_OPPORTUNITIES };
    } else {
      exportData = { title: 'Drug Repurposing Dossier', generatedAt: reportGeneratedAt, dataset: REPURPOSING_CANDIDATES };
    }

    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(exportData, null, 2))}`;
    const link = document.createElement('a');
    link.setAttribute('href', jsonString);
    link.setAttribute('download', `TheraTarget_${activeReportType}_Dossier.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrintPDF = () => {
    window.print();
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto">
      {/* 1. Header */}
      <div className="border-b border-slate-200 pb-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2.5">
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                Research Reports
              </h1>
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-blue-50 text-blue-700 border border-blue-200">
                Scientific Dossier Generator
              </span>
            </div>
            <p className="text-sm text-slate-500 mt-1">
              Generate publication-grade computational dossiers across interactions, drug profiles, target dependencies, network topology, and repurposing rationale.
            </p>
          </div>

          {/* Export Action Controls */}
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrintPDF}
              className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium text-xs shadow-sm transition-colors"
              title="Print or Save as PDF"
            >
              <Printer className="w-3.5 h-3.5 text-slate-600" />
              <span>Export PDF</span>
            </button>
            <button
              onClick={handleExportCSV}
              className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium text-xs shadow-sm transition-colors"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-700" />
              <span>Export CSV</span>
            </button>
            <button
              onClick={handleExportJSON}
              className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium text-xs shadow-sm transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-blue-700" />
              <span>Export JSON</span>
            </button>
          </div>
        </div>
      </div>

      {/* 6 Report Type Selector Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* 1. Interaction Report */}
        <div
          onClick={() => handleGenerate('interaction')}
          className={`cursor-pointer rounded-xl p-5 border shadow-sm flex flex-col justify-between transition-all ${
            activeReportType === 'interaction'
              ? 'border-blue-600 ring-2 ring-blue-500/20 bg-blue-50/20'
              : 'border-slate-200 bg-white hover:border-blue-300'
          }`}
        >
          <div>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center mb-3">
              <Activity className="w-4 h-4" />
            </div>
            <h2 className="text-sm font-bold text-slate-900">Interaction Report</h2>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
              Pairwise binding affinities, pKd metrics, confidence levels, and target inhibition mechanisms.
            </p>
          </div>
          <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="font-mono text-slate-400 text-[11px]">{INTERACTIONS.length} records</span>
            <span className="font-semibold text-blue-700">Select Report &rarr;</span>
          </div>
        </div>

        {/* 2. Drug Profile Report */}
        <div
          onClick={() => handleGenerate('drug')}
          className={`cursor-pointer rounded-xl p-5 border shadow-sm flex flex-col justify-between transition-all ${
            activeReportType === 'drug'
              ? 'border-blue-600 ring-2 ring-blue-500/20 bg-blue-50/20'
              : 'border-slate-200 bg-white hover:border-blue-300'
          }`}
        >
          <div>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center mb-3">
              <Pill className="w-4 h-4" />
            </div>
            <h2 className="text-sm font-bold text-slate-900">Drug Profile Report</h2>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
              Chemoinformatics profiles, known target engagement, indications, and polypharmacology overview.
            </p>
          </div>
          <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="font-mono text-slate-400 text-[11px]">{DRUGS.length} compounds</span>
            <span className="font-semibold text-blue-700">Select Report &rarr;</span>
          </div>
        </div>

        {/* 3. Target Profile Report */}
        <div
          onClick={() => handleGenerate('target')}
          className={`cursor-pointer rounded-xl p-5 border shadow-sm flex flex-col justify-between transition-all ${
            activeReportType === 'target'
              ? 'border-blue-600 ring-2 ring-blue-500/20 bg-blue-50/20'
              : 'border-slate-200 bg-white hover:border-blue-300'
          }`}
        >
          <div>
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center mb-3">
              <Crosshair className="w-4 h-4" />
            </div>
            <h2 className="text-sm font-bold text-slate-900">Target Profile Report</h2>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
              Kinase structural architecture, UniProt annotations, disease dependencies, and druggability scores.
            </p>
          </div>
          <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="font-mono text-slate-400 text-[11px]">{TARGETS.length} targets</span>
            <span className="font-semibold text-blue-700">Select Report &rarr;</span>
          </div>
        </div>

        {/* 4. Network Analysis Report */}
        <div
          onClick={() => handleGenerate('network')}
          className={`cursor-pointer rounded-xl p-5 border shadow-sm flex flex-col justify-between transition-all ${
            activeReportType === 'network'
              ? 'border-blue-600 ring-2 ring-blue-500/20 bg-blue-50/20'
              : 'border-slate-200 bg-white hover:border-blue-300'
          }`}
        >
          <div>
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center mb-3">
              <Share2 className="w-4 h-4" />
            </div>
            <h2 className="text-sm font-bold text-slate-900">Network Analysis Report</h2>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
              Multi-partite topological connectivity mapping Drug &rarr; Target &rarr; Pathway &rarr; Disease.
            </p>
          </div>
          <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="font-mono text-slate-400 text-[11px]">Multi-Partite</span>
            <span className="font-semibold text-blue-700">Select Report &rarr;</span>
          </div>
        </div>

        {/* 5. Therapeutic Opportunity Report */}
        <div
          onClick={() => handleGenerate('opportunity')}
          className={`cursor-pointer rounded-xl p-5 border shadow-sm flex flex-col justify-between transition-all ${
            activeReportType === 'opportunity'
              ? 'border-blue-600 ring-2 ring-blue-500/20 bg-blue-50/20'
              : 'border-slate-200 bg-white hover:border-blue-300'
          }`}
        >
          <div>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center mb-3">
              <Sparkles className="w-4 h-4" />
            </div>
            <h2 className="text-sm font-bold text-slate-900">Therapeutic Opportunity Report</h2>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
              High-confidence pairs, target opportunities, and translational oncology candidates.
            </p>
          </div>
          <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="font-mono text-slate-400 text-[11px]">{THERAPEUTIC_OPPORTUNITIES.length} candidates</span>
            <span className="font-semibold text-blue-700">Select Report &rarr;</span>
          </div>
        </div>

        {/* 6. Drug Repurposing Report */}
        <div
          onClick={() => handleGenerate('repurposing')}
          className={`cursor-pointer rounded-xl p-5 border shadow-sm flex flex-col justify-between transition-all ${
            activeReportType === 'repurposing'
              ? 'border-blue-600 ring-2 ring-blue-500/20 bg-blue-50/20'
              : 'border-slate-200 bg-white hover:border-blue-300'
          }`}
        >
          <div>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center mb-3">
              <RefreshCw className="w-4 h-4" />
            </div>
            <h2 className="text-sm font-bold text-slate-900">Drug Repurposing Report</h2>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
              Off-target affinities, biological mechanisms, and indication expansion hypotheses.
            </p>
          </div>
          <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="font-mono text-slate-400 text-[11px]">{REPURPOSING_CANDIDATES.length} candidates</span>
            <span className="font-semibold text-blue-700">Select Report &rarr;</span>
          </div>
        </div>
      </div>

      {/* Generated Report Dossier Display View */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
        {/* Title, Date & Selected Entities */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
              TheraTarget Scientific Intelligence Report
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mt-1.5 capitalize">
              {activeReportType === 'interaction' && 'Drug–Target Interaction Dossier'}
              {activeReportType === 'drug' && 'Investigational Drug Profile Dossier'}
              {activeReportType === 'target' && 'Molecular Target & Proteome Dossier'}
              {activeReportType === 'network' && 'Translational Cascade Topology Dossier'}
              {activeReportType === 'opportunity' && 'Therapeutic Opportunity Prioritization'}
              {activeReportType === 'repurposing' && 'Cross-Indication Drug Repurposing Dossier'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Compiled on: {reportGeneratedAt} &bull; Environment: TheraTarget Intelligence Platform
            </p>
          </div>

          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 font-mono text-xs text-right">
            <span className="text-[10px] text-slate-400 block uppercase">Selected Scope</span>
            <span className="font-bold text-slate-800">
              {activeReportType === 'interaction' && 'Pairwise Binding Affinities'}
              {activeReportType === 'drug' && 'Approved & Investigational Small Molecules'}
              {activeReportType === 'target' && 'Human Oncogenic Kinase Repertoire'}
              {activeReportType === 'network' && 'Drug → Target → Pathway → Disease'}
              {activeReportType === 'opportunity' && 'Computational Prioritization Pipeline'}
              {activeReportType === 'repurposing' && 'Off-Target Cross-Indication Screening'}
            </span>
          </div>
        </div>

        {/* 1. Analysis Summary */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-slate-700">
            1. Analysis Summary & Scientific Scope
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-lg border border-slate-200">
            This dossier synthesizes curated chemoinformatic binding assays, crystallographic coordinates, and translational oncology nosology. Interactions are parameterized by equilibrium dissociation constants (Kd), negative logarithmic affinities (pKd), and multi-layer confidence scoring to guide prospective computational assays.
          </p>
        </div>

        {/* 2. Evidence & Data Origin */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-slate-700">
            2. Evidence & Provenance Audit
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 rounded-lg bg-emerald-50/50 border border-emerald-200">
              <span className="text-[10px] font-mono text-emerald-800 uppercase block font-semibold">
                Evidence Provenance
              </span>
              <p className="font-semibold text-emerald-950 mt-0.5">Literature & Curated Repositories</p>
              <p className="text-[11px] text-slate-600 mt-1">Cross-referenced against DrugBank, ChEMBL, and UniProt.</p>
            </div>

            <div className="p-3 rounded-lg bg-blue-50/50 border border-blue-200">
              <span className="text-[10px] font-mono text-blue-800 uppercase block font-semibold">
                Prediction Methodology
              </span>
              <p className="font-semibold text-blue-950 mt-0.5">Biophysical & Statistical Scoring</p>
              <p className="text-[11px] text-slate-600 mt-1">Ensemble binding affinity models and kinase pocket complementarity.</p>
            </div>

            <div className="p-3 rounded-lg bg-purple-50/50 border border-purple-200">
              <span className="text-[10px] font-mono text-purple-800 uppercase block font-semibold">
                Validation Status
              </span>
              <p className="font-semibold text-purple-950 mt-0.5">Educational Benchmark</p>
              <p className="text-[11px] text-slate-600 mt-1">Intended for pre-experimental candidate filtering and hypothesis generation.</p>
            </div>
          </div>
        </div>

        {/* 3. Visualizations & Tabular Metrics */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-slate-700">
            3. Selected Records & Interaction Data
          </h3>
          <div className="overflow-x-auto border border-slate-200 rounded-lg">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-mono uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3 font-semibold">Entity 1</th>
                  <th className="py-2.5 px-3 font-semibold">Entity 2</th>
                  <th className="py-2.5 px-3 font-semibold">Classification</th>
                  <th className="py-2.5 px-3 font-semibold">Score / Metric</th>
                  <th className="py-2.5 px-3 font-semibold">Confidence</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {INTERACTIONS.slice(0, 5).map((int) => (
                  <tr key={int.id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 font-bold text-slate-900">{int.drugName}</td>
                    <td className="py-2.5 px-3 font-mono font-medium text-teal-800">{int.targetGene}</td>
                    <td className="py-2.5 px-3 text-slate-600">{int.diseaseName}</td>
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-800">{int.score.toFixed(2)}</td>
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-800 font-mono text-[10px] border border-blue-200">
                        {int.confidence}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 4. Conclusion & 5. Research Disclaimer */}
        <div className="space-y-3 pt-3 border-t border-slate-100">
          <div>
            <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-slate-700">
              4. Computational Conclusion
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed mt-1">
              Topological analysis and biophysical affinity distributions confirm actionable candidate pairings warranting secondary computational docking or wet-lab surface plasmon resonance (SPR) confirmation.
            </p>
          </div>

          <div className="p-3.5 rounded-lg bg-amber-50/40 border border-amber-200 text-xs space-y-1">
            <div className="font-bold text-amber-900 flex items-center gap-1.5">
              <BadgeCheck className="w-3.5 h-3.5 text-amber-700" />
              <span>Scientific Research Disclaimer</span>
            </div>
            <p className="text-amber-800/90 leading-relaxed text-[11px]">
              The outputs provided in this report are computationally prioritized predictions derived from educational demonstration datasets and curated literature. They are not intended as clinical diagnostic guidance, medical advice, or definitive proof of therapeutic efficacy.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
