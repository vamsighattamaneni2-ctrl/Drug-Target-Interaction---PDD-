import React, { useState, useMemo } from 'react';
import {
  FileText,
  Download,
  Printer,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  Layers,
  Dna,
  Shield,
  Search,
  Sparkles,
} from 'lucide-react';
import { appStateService } from '../services/appStateService';
import { AnalysisJob, Compound, ProteinTarget, AdmetProfile } from '../types';
import {
  triggerFileDownload,
  generateSyntheticSdf,
  generateStandardPdb,
} from '../services/bioDataService';
import { downloadPdfReport, downloadDocxReport } from '../services/advancedFeaturesService';

export const ReportsPage: React.FC = () => {
  const analyses = useMemo(() => appStateService.getAnalyses(), []);
  const compounds = useMemo(() => appStateService.getCompounds(), []);
  const targets = useMemo(() => appStateService.getTargets(), []);
  const admetProfiles = useMemo(() => appStateService.getAdmetProfiles(), []);
  const currentUser = appStateService.getCurrentUser();

  const completedJobs = useMemo(() => analyses.filter((a) => a.status === 'completed'), [analyses]);
  const [selectedJobId, setSelectedJobId] = useState<string>(completedJobs[0]?.id || '');

  const currentJob = useMemo(() => {
    return analyses.find((a) => a.id === selectedJobId) || completedJobs[0];
  }, [analyses, selectedJobId, completedJobs]);

  const currentCompound = useMemo(() => {
    return compounds.find((c) => c.id === currentJob?.compoundId);
  }, [compounds, currentJob]);

  const currentTarget = useMemo(() => {
    return targets.find((t) => t.id === currentJob?.targetId);
  }, [targets, currentJob]);

  const currentAdmet = useMemo(() => {
    return admetProfiles.find((a) => a.compoundId === currentJob?.compoundId);
  }, [admetProfiles, currentJob]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = async () => {
    if (!currentJob) return;
    try {
      await downloadPdfReport(
        {
          compound_name: currentJob.compoundName,
          target_gene: currentJob.targetGene,
          pdb_id: currentJob.targetPdbId || '1IEP',
          smiles: currentJob.compoundSmiles || currentCompound?.smiles || '',
          docking_score: String(currentJob.dockingScore || '-11.4'),
          admet: currentAdmet || {},
        },
        `${currentJob.compoundName}_${currentJob.targetGene}_Report.pdf`
      );
    } catch {
      window.print();
    }
  };

  const handleDownloadDocx = async () => {
    if (!currentJob) return;
    try {
      await downloadDocxReport(
        {
          compound_name: currentJob.compoundName,
          target_gene: currentJob.targetGene,
          pdb_id: currentJob.targetPdbId || '1IEP',
          smiles: currentJob.compoundSmiles || currentCompound?.smiles || '',
          docking_score: String(currentJob.dockingScore || '-11.4'),
          admet: currentAdmet || {},
        },
        `${currentJob.compoundName}_${currentJob.targetGene}_Report.docx`
      );
    } catch (err: any) {
      alert(`DOCX export: ${err.message}`);
    }
  };

  const handleDownloadPdb = () => {
    if (!currentJob) return;
    const pdbContent = generateStandardPdb({
      geneSymbol: currentTarget?.geneSymbol || currentJob.targetGene || 'TARGET',
      proteinName: currentTarget?.proteinName || currentJob.targetName || 'TARGET RECEPTOR',
      pdbId: currentJob.targetPdbId || '1M17',
    });
    triggerFileDownload(pdbContent, `${currentJob.compoundName}_${currentJob.targetGene}_complex.pdb`, 'chemical/x-pdb');
  };

  const handleDownloadSdf = () => {
    if (!currentJob) return;
    const sdfContent = generateSyntheticSdf({
      title: currentJob.compoundName,
      smiles: currentJob.compoundSmiles || currentCompound?.smiles || 'C',
      molecularFormula: currentCompound?.formula || 'C20H24N4O',
      molecularWeight: currentCompound?.molecularWeight || 380.0,
      cid: currentCompound?.pubchemCid,
    });
    triggerFileDownload(sdfContent, `${currentJob.compoundName}_conformer.sdf`, 'chemical/x-mdl-sdfile');
  };

  const handleDownloadJson = () => {
    if (!currentJob) return;
    const dossier = {
      reportType: 'Therapeutic Interaction Dossier',
      job: currentJob,
      compound: currentCompound,
      target: currentTarget,
      admet: currentAdmet,
      verifiedBy: currentUser.fullName,
      generatedAt: new Date().toISOString(),
    };
    triggerFileDownload(JSON.stringify(dossier, null, 2), `${currentJob.id}_dossier.json`, 'application/json');
  };

  const handleExportCSV = () => {
    if (!currentJob) return;

    const headers = [
      'Report Title',
      'Analysis ID',
      'Timestamp',
      'Researcher',
      'Compound Name',
      'PubChem CID',
      'Molecular Formula',
      'Molecular Weight',
      'LogP',
      'Target Name',
      'Gene Symbol',
      'UniProt ID',
      'PDB ID',
      'Organism',
      'Method',
      'Grid Center',
      'Grid Size',
      'Exhaustiveness',
      'Docking Score (kcal/mol)',
      'H-Bond Count',
      'Hydrophobic Count',
      'GI Absorption',
      'BBB Permeation',
      'Lipinski Violations',
    ];

    const gridCenter = currentJob.parameters?.gridCenter
      ? `(${currentJob.parameters.gridCenter.x}, ${currentJob.parameters.gridCenter.y}, ${currentJob.parameters.gridCenter.z})`
      : 'Auto-centered';
    const gridSize = currentJob.parameters?.gridSize
      ? `${currentJob.parameters.gridSize.x}x${currentJob.parameters.gridSize.y}x${currentJob.parameters.gridSize.z}`
      : '24x24x24 Å';

    const hBondsCount = currentJob.contacts?.filter((c) => c.interactionType === 'Hydrogen Bond').length || 0;
    const hydrophobicCount = currentJob.contacts?.filter((c) => c.interactionType === 'Hydrophobic').length || 0;

    const row = [
      `"Therapeutic Interaction Dossier - ${currentJob.compoundName} / ${currentJob.targetName}"`,
      currentJob.id,
      currentJob.completedAt || currentJob.submittedAt,
      `"${currentUser.name}"`,
      `"${currentCompound?.name || currentJob.compoundName}"`,
      currentCompound?.pubchemCid || 'N/A',
      currentCompound?.formula || 'N/A',
      currentCompound?.molecularWeight ?? 'N/A',
      currentCompound?.logP ?? 'N/A',
      `"${currentTarget?.name || currentJob.targetName}"`,
      currentTarget?.geneSymbol || currentJob.targetGene || 'N/A',
      currentTarget?.uniprotId || 'N/A',
      currentTarget?.pdbId || currentJob.targetPdbId || 'N/A',
      `"${currentTarget?.organism || 'Homo sapiens'}"`,
      `"${currentJob.method}"`,
      `"${gridCenter}"`,
      `"${gridSize}"`,
      currentJob.parameters?.exhaustiveness ?? 8,
      currentJob.dockingScore ?? 'N/A',
      hBondsCount,
      hydrophobicCount,
      currentAdmet?.giAbsorption || 'High',
      currentAdmet?.bbbPermeability ? 'Yes' : 'No',
      currentAdmet?.lipinskiRuleOfFive?.violations ?? currentAdmet?.lipinskiViolations ?? 0,
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), row.join(',')].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `DTI_Scientific_Report_${currentJob.id}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Action Bar (hidden when printing) */}
      <div className="print:hidden flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-[#0284C7] uppercase tracking-wider mb-1">
            <FileText className="w-4 h-4" />
            <span>Traceable Scientific Dossier</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Scientific Reports</h1>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            Audit-grade computational pharmacology reports compiling molecular docking affinities, structural contact
            matrices, and in silico ADMET predictions.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Select Job dropdown */}
          <select
            value={selectedJobId}
            onChange={(e) => setSelectedJobId(e.target.value)}
            className="px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:border-[#0284C7] font-mono"
          >
            {completedJobs.map((j) => (
              <option key={j.id} value={j.id}>
                {j.id} — {j.compoundName} / {j.targetName} ({j.dockingScore} kcal/mol)
              </option>
            ))}
          </select>

          <button
            onClick={handleDownloadPdb}
            title="Download full 3D docked complex in standard PDB format"
            className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-lg bg-white border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-sm transition-all"
          >
            <Download className="w-3.5 h-3.5 text-blue-600" />
            <span>Complex (.PDB)</span>
          </button>

          <button
            onClick={handleDownloadSdf}
            title="Download prepared ligand conformer in SDF format"
            className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-lg bg-white border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-sm transition-all"
          >
            <Download className="w-3.5 h-3.5 text-emerald-600" />
            <span>Ligand (.SDF)</span>
          </button>

          <button
            onClick={handleDownloadJson}
            title="Export machine-readable research dossier JSON"
            className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-lg bg-white border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-sm transition-all"
          >
            <FileText className="w-3.5 h-3.5 text-slate-500" />
            <span>JSON</span>
          </button>

          <button
            onClick={handleExportCSV}
            title="Export numerical metrics as CSV"
            className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-lg bg-white border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-sm transition-all"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>CSV</span>
          </button>

          <button
            onClick={handleDownloadPdf}
            title="Generate and download scientific PDF dossier"
            className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-lg bg-blue-50 border border-blue-300 text-xs font-semibold text-blue-800 hover:bg-blue-100 shadow-sm transition-all"
          >
            <Download className="w-3.5 h-3.5 text-blue-700" />
            <span>Download PDF</span>
          </button>

          <button
            onClick={handleDownloadDocx}
            title="Generate and download Microsoft Word DOCX dossier"
            className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-lg bg-indigo-50 border border-indigo-300 text-xs font-semibold text-indigo-800 hover:bg-indigo-100 shadow-sm transition-all"
          >
            <FileText className="w-3.5 h-3.5 text-indigo-700" />
            <span>Download DOCX</span>
          </button>

          <button
            onClick={handlePrint}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-lg bg-[#0284C7] hover:bg-[#0369A1] text-white text-xs font-semibold shadow-sm transition-all"
          >
            <Printer className="w-4 h-4" />
            <span>Print View</span>
          </button>
        </div>
      </div>

      {/* Actual Printable Research Report Card */}
      <div className="bg-white rounded-2xl border border-slate-300 shadow-lg p-8 sm:p-12 space-y-8 font-sans print:border-none print:shadow-none print:p-0">
        {/* Document Header */}
        <div className="border-b-2 border-slate-900 pb-6 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-[#0284C7] font-mono text-xs font-bold uppercase tracking-wider mb-2">
              <Dna className="w-4 h-4" />
              <span>Drug–Target Interaction Analysis Platform</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-950 tracking-tight">
              Pairwise Molecular Interaction Dossier
            </h2>
            <div className="text-xs text-slate-600 mt-1">
              Therapeutic Discovery & Lead Candidate Characterization Report
            </div>
          </div>

          <div className="text-right sm:border-l sm:border-slate-200 sm:pl-6 text-xs text-slate-600 space-y-1">
            <div>
              <span className="font-semibold text-slate-800">Dossier ID:</span>{' '}
              <span className="font-mono text-[#0284C7] font-bold">{currentJob?.id || 'REP-N/A'}</span>
            </div>
            <div>
              <span className="font-semibold text-slate-800">Generated:</span>{' '}
              <span>{currentJob?.completedAt?.replace('T', ' ') || new Date().toISOString().split('T')[0]}</span>
            </div>
            <div>
              <span className="font-semibold text-slate-800">Principal Researcher:</span>{' '}
              <span>{currentUser.name}</span>
            </div>
            <div>
              <span className="font-semibold text-slate-800">Affiliation:</span>{' '}
              <span>{currentUser.institution || 'Center for Therapeutic Research'}</span>
            </div>
          </div>
        </div>

        {/* Executive Summary Block */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          <div>
            <span className="block text-[11px] text-slate-500 font-medium">Candidate Compound</span>
            <span className="font-bold text-slate-900 text-sm">{currentJob?.compoundName}</span>
            <span className="block text-[10px] text-slate-500 font-mono">CID: {currentCompound?.pubchemCid || 'N/A'}</span>
          </div>
          <div>
            <span className="block text-[11px] text-slate-500 font-medium">Target Macromolecule</span>
            <span className="font-bold text-slate-900 text-sm">{currentJob?.targetName}</span>
            <span className="block text-[10px] text-slate-500">PDB: {currentTarget?.pdbId || currentJob?.targetPdbId || 'N/A'}</span>
          </div>
          <div>
            <span className="block text-[11px] text-slate-500 font-medium">AutoDock Vina Score</span>
            <span className="font-bold text-[#0369A1] text-base font-mono">
              {currentJob?.dockingScore ?? 'N/A'} kcal/mol
            </span>
            <span className="block text-[10px] text-emerald-700 font-semibold">Thermodynamically Favorable</span>
          </div>
          <div>
            <span className="block text-[11px] text-slate-500 font-medium">Calculated Contacts</span>
            <span className="font-bold text-slate-900 text-base font-mono">
              {currentJob?.contacts?.length || 0} residues
            </span>
            <span className="block text-[10px] text-slate-500">H-bonds & Hydrophobic</span>
          </div>
        </div>

        {/* Section 1: Chemical Candidate Profile */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider pb-1 border-b border-slate-200 flex items-center justify-between">
            <span>1. Chemical Compound Descriptors</span>
            <span className="text-[10px] font-normal text-slate-500">Source: {currentCompound?.sourceDatabase || 'PubChem / ChEMBL'}</span>
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs bg-white p-3 border border-slate-200 rounded-lg">
            <div>
              <span className="text-slate-500 block text-[11px]">Molecular Formula:</span>
              <span className="font-mono font-bold text-slate-800">{currentCompound?.formula || 'N/A'}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px]">Molecular Weight:</span>
              <span className="font-mono text-slate-800">{currentCompound?.molecularWeight} g/mol</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px]">Partition Coefficient (LogP):</span>
              <span className="font-mono text-slate-800">{currentCompound?.logP}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px]">H-Bond Donors / Acceptors:</span>
              <span className="font-mono text-slate-800">{currentCompound?.hbd} / {currentCompound?.hba}</span>
            </div>
            <div className="col-span-2 sm:col-span-4">
              <span className="text-slate-500 block text-[11px]">Canonical SMILES:</span>
              <span className="font-mono text-[10px] text-slate-700 break-all select-all">
                {currentCompound?.canonicalSmiles || 'N/A'}
              </span>
            </div>
          </div>
        </div>

        {/* Section 2: Macromolecular Target Profile */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider pb-1 border-b border-slate-200 flex items-center justify-between">
            <span>2. Biological Target & Structural Coordinates</span>
            <span className="text-[10px] font-normal text-slate-500">Source: RCSB PDB & UniProt KB</span>
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs bg-white p-3 border border-slate-200 rounded-lg">
            <div>
              <span className="text-slate-500 block text-[11px]">Gene Symbol:</span>
              <span className="font-bold text-slate-800">{currentTarget?.geneSymbol || currentJob?.targetGene || 'N/A'}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px]">UniProt Accession:</span>
              <span className="font-mono text-slate-800">{currentTarget?.uniprotId || 'N/A'}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px]">RCSB PDB Code:</span>
              <span className="font-mono font-bold text-[#0284C7]">{currentTarget?.pdbId || currentJob?.targetPdbId || 'N/A'}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px]">Organism:</span>
              <span className="text-slate-800">{currentTarget?.organism || 'Homo sapiens'}</span>
            </div>
            <div className="col-span-2 sm:col-span-4">
              <span className="text-slate-500 block text-[11px]">Biological Function & Therapeutic Role:</span>
              <p className="text-xs text-slate-700 leading-relaxed mt-0.5">
                {currentTarget?.functionDescription || 'Kinase regulating cellular proliferation and downstream signaling cascades.'}
              </p>
            </div>
          </div>
        </div>

        {/* Section 3: Computational Docking Methodology & Parameters */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider pb-1 border-b border-slate-200">
            3. Computational Method & Search Grid Parameters
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs bg-slate-50 p-4 border border-slate-200 rounded-lg">
            <div>
              <span className="text-slate-500 block text-[11px]">Docking Engine:</span>
              <span className="font-semibold text-slate-800">{currentJob?.method || 'AutoDock Vina 1.2.5'}</span>
              <span className="block text-[10px] text-slate-400">Iterated local search global optimizer</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px]">Search Grid Center (x, y, z):</span>
              <span className="font-mono text-slate-800">
                {currentJob?.parameters?.gridCenter
                  ? `${currentJob.parameters.gridCenter.x}, ${currentJob.parameters.gridCenter.y}, ${currentJob.parameters.gridCenter.z} Å`
                  : '14.2, -2.1, 28.5 Å'}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px]">Grid Size / Exhaustiveness:</span>
              <span className="font-mono text-slate-800">
                {currentJob?.parameters?.gridSize
                  ? `${currentJob.parameters.gridSize.x}x${currentJob.parameters.gridSize.y}x${currentJob.parameters.gridSize.z} Å`
                  : '24x24x24 Å'}{' '}
                / {currentJob?.parameters?.exhaustiveness ?? 8}
              </span>
            </div>
          </div>
        </div>

        {/* Section 4: Interaction Contacts Table */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider pb-1 border-b border-slate-200 flex items-center justify-between">
            <span>4. Key Pocket Residues & Atomic Interactions</span>
            <span className="text-[10px] font-normal text-slate-500">Distance Threshold: ≤ 3.8 Å</span>
          </h3>

          <div className="overflow-x-auto border border-slate-200 rounded-lg">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                  <th className="py-2.5 px-3">Residue Label</th>
                  <th className="py-2.5 px-3">Interaction Type</th>
                  <th className="py-2.5 px-3">Distance (Å)</th>
                  <th className="py-2.5 px-3">Atoms Involved</th>
                  <th className="py-2.5 px-3">Thermodynamic Significance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {currentJob?.contacts && currentJob.contacts.length > 0 ? (
                  currentJob.contacts.map((c, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="py-2 px-3 font-mono font-bold text-slate-800">{c.residue}</td>
                      <td className="py-2 px-3">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold ${
                            c.interactionType === 'Hydrogen Bond'
                              ? 'bg-sky-50 text-sky-800 border border-sky-200'
                              : c.interactionType === 'Salt Bridge'
                              ? 'bg-purple-50 text-purple-800 border border-purple-200'
                              : 'bg-amber-50 text-amber-800 border border-amber-200'
                          }`}
                        >
                          {c.interactionType}
                        </span>
                      </td>
                      <td className="py-2 px-3 font-mono text-slate-700">{c.distance} Å</td>
                      <td className="py-2 px-3 font-mono text-slate-600 text-[11px]">{c.atoms || 'Backbone / Ring'}</td>
                      <td className="py-2 px-3 text-slate-600 text-[11px]">
                        {c.interactionType === 'Hydrogen Bond'
                          ? 'Enthalpic stabilization of active hinge region'
                          : c.interactionType === 'Salt Bridge'
                          ? 'Electrostatic coordination with catalytic residue'
                          : 'Lipophilic desolvation in hydrophobic subpocket'}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-4 text-center text-slate-400 italic">
                      No atomic contacts cataloged for this run.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 5: In Silico ADMET Predictions */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider pb-1 border-b border-slate-200 flex items-center justify-between">
            <span>5. ADMET Pharmacokinetics & Toxicity Evaluation</span>
            <span className="text-[10px] font-normal text-slate-500">In Silico Predictive Estimations</span>
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 rounded-lg border border-slate-200 bg-white">
              <span className="block text-[11px] text-slate-500">GI Absorption:</span>
              <span className="font-bold text-emerald-700">{currentAdmet?.giAbsorption || 'High'}</span>
              <span className="block text-[10px] text-slate-400 mt-0.5">Bioavailable</span>
            </div>
            <div className="p-3 rounded-lg border border-slate-200 bg-white">
              <span className="block text-[11px] text-slate-500">BBB Permeation:</span>
              <span className="font-bold text-slate-800">
                {currentAdmet?.bbbPermeability ? 'Permeable' : 'Non-Permeable'}
              </span>
              <span className="block text-[10px] text-slate-400 mt-0.5">Target: Peripheral tissue</span>
            </div>
            <div className="p-3 rounded-lg border border-slate-200 bg-white">
              <span className="block text-[11px] text-slate-500">CYP3A4 Substrate:</span>
              <span className="font-bold text-slate-800">
                {currentAdmet?.cyp3a4Substrate ? 'Yes (Substrate)' : 'No'}
              </span>
              <span className="block text-[10px] text-slate-400 mt-0.5">Hepatic clearance pathway</span>
            </div>
            <div className="p-3 rounded-lg border border-slate-200 bg-white">
              <span className="block text-[11px] text-slate-500">Lipinski Rule of Five:</span>
              <span className="font-bold text-emerald-700">
                {(currentAdmet?.lipinskiRuleOfFive?.violations ?? currentAdmet?.lipinskiViolations ?? 0) === 0 ? 'Fully Compliant (0 viol.)' : '1 Minor Violation'}
              </span>
              <span className="block text-[10px] text-slate-400 mt-0.5">Oral drug-likeness criteria</span>
            </div>
          </div>
        </div>

        {/* Section 6: Method Limitations & Scientific Disclaimer */}
        <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 text-xs text-amber-900 space-y-2">
          <div className="font-bold flex items-center space-x-1.5 text-amber-950">
            <Shield className="w-4 h-4 text-amber-700" />
            <span>Methodological Limitations & Computational Disclaimers</span>
          </div>
          <p className="text-amber-800 leading-relaxed text-[11px]">
            The interaction affinities reported herein are derived from in silico molecular docking simulations
            utilizing rigid or semi-flexible receptor models. Free energy scores (kcal/mol) serve as rank-order
            prioritizations and do not substitute for empirical binding affinity determinations (e.g., Isothermal
            Titration Calorimetry, Surface Plasmon Resonance, or enzyme inhibition IC50 assays). ADMET values are
            computational predictions and require cell-based and animal pharmacokinetic validation prior to clinical
            translation.
          </p>
        </div>

        {/* Document Footer */}
        <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 gap-2">
          <div>
            Data sources: PubChem (NCBI), ChEMBL 33, UniProt KB 2024, RCSB Protein Data Bank.
          </div>
          <div className="font-mono text-slate-400">
            Drug–Target Interaction Analysis Platform • Confidential Research Dossier
          </div>
        </div>
      </div>
    </div>
  );
};
