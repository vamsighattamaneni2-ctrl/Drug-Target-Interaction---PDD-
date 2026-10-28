import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Upload,
  FolderKanban,
  FileSpreadsheet,
  AlertCircle,
  CheckCircle2,
  Clock,
  XCircle,
  Loader2,
  Download,
  Filter,
  ArrowUpDown,
  Search,
  Dna,
  Layers,
  StopCircle,
  ExternalLink,
  ChevronRight,
  Info,
} from 'lucide-react';
import { TARGETS } from '../data/dataset';
import {
  validateCompoundLibraryFile,
  startBatchVirtualScreening,
  getBatchScreeningStatus,
  cancelBatchScreeningJob,
  LibraryValidationResponse,
  BatchJobStatusResponse,
  BatchTaskRecord,
} from '../services/advancedFeaturesService';
import { triggerFileDownload } from '../services/bioDataService';

export const BatchScreeningPage: React.FC = () => {
  // Library Upload & Validation state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<LibraryValidationResponse | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Target and Pocket setup
  const [selectedTargetId, setSelectedTargetId] = useState(TARGETS[0].id);
  const [selectedPocketMode, setSelectedPocketMode] = useState<'primary' | 'allosteric'>('primary');
  const [exhaustiveness, setExhaustiveness] = useState(8);

  // Active Batch Job state
  const [activeBatchId, setActiveBatchId] = useState<string | null>(null);
  const [batchJob, setBatchJob] = useState<BatchJobStatusResponse | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [filterQuery, setFilterQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'running' | 'pending' | 'failed'>('all');
  const [sortField, setSortField] = useState<'score' | 'name' | 'status'>('score');
  const [sortAsc, setSortAsc] = useState(true);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const pollingRef = useRef<any>(null);

  const target = TARGETS.find((t) => t.id === selectedTargetId) || TARGETS[0];

  // Handle file select
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setValidationError(null);
    setValidationResult(null);
    setIsValidating(true);

    try {
      const parsed = await validateCompoundLibraryFile(file);
      setValidationResult(parsed);
    } catch (err: any) {
      console.error('Validation error:', err);
      setValidationError(err?.message || 'Failed to parse chemical library file.');
    } finally {
      setIsValidating(false);
    }
  };

  // Sample CSV generator for quick researcher evaluation
  const handleLoadSampleLibrary = async () => {
    const sampleCsv = `Name,SMILES\nImatinib,CC1=C(C=C(C=C1)NC(=O)C2=CC=C(CN3CCN(C)CC3)C=C2)NC4=NC=CC(=N4)C5=CN=CC=C5\nErlotinib,COCCOC1=C(C=C2C(=C1)C(=NC=N2)NC3=CC=CC(=C3)C#C)OCCOC\nGefitinib,COC1=C(OCC2=CC=CC=C2)C=C2C(=C1)N=CN=C2NC1=CC(Cl)=C(F)C=C1\nDasatinib,CC1=C(C(=CC=C1)Cl)NC(=O)C2=CN=C(S2)NC3=NC=C(N=C3)N4CCN(CC4)CCO\nInvalidEntry_1,INVALID_VALENCE_C123\nNilotinib,CC1=C(C=C(C=C1)NC(=O)C2=CC(=CC(=C2)C(F)(F)F)C3=CN(C=N3)C)NC4=NC=CC(=N4)C5=CN=CC=C5\nSorafenib,CNC(=O)C1=NC=CC(=C1)OC2=CC=C(C=C2)NC(=O)NC3=CC(=C(C=C3)Cl)C(F)(F)F\nCorruptSMILES_2,C1=CC(=C(C=C1)N(=O)\n`;
    const blob = new Blob([sampleCsv], { type: 'text/csv' });
    const sampleFile = new File([blob], 'kinase_inhibitor_cohort.csv', { type: 'text/csv' });
    setSelectedFile(sampleFile);
    setValidationError(null);
    setIsValidating(true);

    try {
      const parsed = await validateCompoundLibraryFile(sampleFile);
      setValidationResult(parsed);
    } catch (err: any) {
      setValidationError(err?.message || 'Failed to validate sample library.');
    } finally {
      setIsValidating(false);
    }
  };

  // Submit batch job to background queue
  const handleStartScreening = async () => {
    if (!validationResult || validationResult.valid_compounds.length === 0) return;

    setIsSubmitting(true);
    try {
      const pocketInfo = {
        pocket_id: selectedPocketMode === 'primary' ? 'Pocket-1 (Orthosteric Catalytic Cleft)' : 'Pocket-2 (Allosteric Sub-Cleft)',
        center_x: 14.8,
        center_y: 21.2,
        center_z: 17.9,
        box_size_x: 22.0,
        box_size_y: 22.0,
        box_size_z: 22.0,
      };

      const res = await startBatchVirtualScreening({
        target_gene: target.geneSymbol,
        pdb_id: target.pdbId,
        pocket_info: pocketInfo,
        compounds: validationResult.valid_compounds,
        exhaustiveness,
      });

      setActiveBatchId(res.batch_id);
      // Immediate first poll
      const initialStatus = await getBatchScreeningStatus(res.batch_id);
      setBatchJob(initialStatus);
    } catch (err: any) {
      alert(`Submission error: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Polling active batch status
  useEffect(() => {
    if (!activeBatchId) return;

    const poll = async () => {
      try {
        const status = await getBatchScreeningStatus(activeBatchId);
        setBatchJob(status);
        if (status.status === 'completed' || status.status === 'cancelled' || status.status === 'failed') {
          if (pollingRef.current) clearInterval(pollingRef.current);
        }
      } catch (e) {
        console.warn('Polling error:', e);
      }
    };

    pollingRef.current = setInterval(poll, 1500);
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [activeBatchId]);

  // Cancel job
  const handleCancelJob = async () => {
    if (!activeBatchId) return;
    await cancelBatchScreeningJob(activeBatchId);
    const updated = await getBatchScreeningStatus(activeBatchId);
    setBatchJob(updated);
  };

  // Export results CSV
  const handleExportCsv = () => {
    if (!batchJob) return;
    const rows = [
      ['Rank', 'Compound Name', 'SMILES', 'Molecular Weight (g/mol)', 'LogP', 'Status', 'Docking Score (kcal/mol)', 'Estimated Kd (nM)', 'Error/Notes'],
    ];

    const sorted = [...batchJob.tasks].sort((a, b) => {
      if (a.docking_score_kcal_mol !== null && b.docking_score_kcal_mol !== null) {
        return a.docking_score_kcal_mol - b.docking_score_kcal_mol;
      }
      return a.docking_score_kcal_mol !== null ? -1 : 1;
    });

    sorted.forEach((t, i) => {
      rows.push([
        String(i + 1),
        `"${t.compound_name}"`,
        `"${t.smiles}"`,
        String(t.molecular_weight || 'N/A'),
        String(t.log_p || 'N/A'),
        t.status.toUpperCase(),
        t.docking_score_kcal_mol !== null ? String(t.docking_score_kcal_mol) : 'N/A', // Never fabricated
        t.estimated_kd_nm !== null ? String(t.estimated_kd_nm) : 'N/A',
        `"${t.error_message || ''}"`,
      ]);
    });

    const csvContent = rows.map((r) => r.join(',')).join('\n');
    triggerFileDownload(csvContent, `${batchJob.batch_id}_${target.geneSymbol}_results.csv`, 'text/csv');
  };

  // Filtered & sorted tasks
  const displayTasks = (batchJob?.tasks || [])
    .filter((t) => {
      if (statusFilter !== 'all' && t.status !== statusFilter) return false;
      if (filterQuery.trim()) {
        const q = filterQuery.toLowerCase();
        return t.compound_name.toLowerCase().includes(q) || t.smiles.toLowerCase().includes(q);
      }
      return true;
    })
    .sort((a, b) => {
      if (sortField === 'score') {
        if (a.docking_score_kcal_mol === null && b.docking_score_kcal_mol === null) return 0;
        if (a.docking_score_kcal_mol === null) return 1;
        if (b.docking_score_kcal_mol === null) return -1;
        return sortAsc ? a.docking_score_kcal_mol - b.docking_score_kcal_mol : b.docking_score_kcal_mol - a.docking_score_kcal_mol;
      }
      if (sortField === 'name') {
        return sortAsc ? a.compound_name.localeCompare(b.compound_name) : b.compound_name.localeCompare(a.compound_name);
      }
      return sortAsc ? a.status.localeCompare(b.status) : b.status.localeCompare(a.status);
    });

  const progressPercent = batchJob && batchJob.total_compounds > 0
    ? Math.round(((batchJob.completed_count + batchJob.failed_count + batchJob.cancelled_count) / batchJob.total_compounds) * 100)
    : 0;

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="border-b border-slate-200 pb-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Batch Virtual Screening
            </h1>
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-indigo-50 text-indigo-800 border border-indigo-200">
              High-Throughput Docking Queue
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Upload multi-compound chemical libraries in CSV or SDF formats, validate molecular structures via RDKit, and execute background AutoDock Vina virtual screening runs.
          </p>
        </div>

        <button
          onClick={handleLoadSampleLibrary}
          className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs cursor-pointer self-start md:self-auto"
        >
          <FolderKanban className="w-3.5 h-3.5 text-indigo-600" />
          <span>Load Kinase Inhibitor Cohort</span>
        </button>
      </div>

      {/* STEP 1: Library Upload & RDKit Structure Validation */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-6 space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center space-x-2.5">
            <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center font-bold text-xs font-mono">
              1
            </div>
            <h2 className="text-sm font-bold text-slate-900">
              Upload Chemical Library (CSV or SDF)
            </h2>
          </div>
          <span className="text-[11px] text-slate-400 font-mono">
            RDKit Strict Valence & Kekulization Verification
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Drag & Drop Upload Dropzone */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-xl p-8 text-center cursor-pointer transition-colors bg-slate-50/50 hover:bg-blue-50/20 flex flex-col items-center justify-center space-y-2.5"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.sdf,.tsv,.txt"
              onChange={handleFileChange}
              className="hidden"
            />
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-800">
                {selectedFile ? selectedFile.name : 'Click to upload compound library file'}
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Supports CSV (with Name & SMILES columns) or multi-molecule SDF files
              </p>
            </div>
            {isValidating && (
              <div className="flex items-center space-x-2 text-xs text-blue-700 font-mono pt-2">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Parsing & validating chemical structures...</span>
              </div>
            )}
          </div>

          {/* Validation Report Card */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between space-y-3">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-1">
                Library Validation Status
              </span>

              {validationError ? (
                <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start space-x-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span>{validationError}</span>
                </div>
              ) : validationResult ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-3 gap-2 text-center font-mono text-xs">
                    <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                      <span className="text-[10px] text-slate-400 block">Total</span>
                      <span className="font-bold text-slate-900 text-base">{validationResult.total_parsed}</span>
                    </div>

                    <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800">
                      <span className="text-[10px] text-emerald-600 block">Valid Compounds</span>
                      <span className="font-bold text-base">{validationResult.valid_count}</span>
                    </div>

                    <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-800">
                      <span className="text-[10px] text-rose-600 block">Invalid Entries</span>
                      <span className="font-bold text-base">{validationResult.invalid_count}</span>
                    </div>
                  </div>

                  {/* Rejected items summary if any */}
                  {validationResult.invalid_count > 0 && (
                    <div className="text-[11px] text-rose-800 font-mono space-y-1 bg-white p-2.5 rounded-lg border border-rose-200 max-h-24 overflow-y-auto">
                      <div className="font-bold flex items-center space-x-1">
                        <AlertCircle className="w-3 h-3 text-rose-600" />
                        <span>Actionable Validation Alerts:</span>
                      </div>
                      {validationResult.invalid_entries.map((inv, idx) => (
                        <div key={idx} className="text-[10px] text-slate-600">
                          • Entry #{inv.entry_index} ({inv.identifier}): {inv.reason}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-xs text-slate-500 italic mt-2">
                  No file uploaded yet. Click the upload box or select "Load Kinase Inhibitor Cohort" to begin.
                </p>
              )}
            </div>

            <div className="text-[10px] font-mono text-slate-400">
              Only structurally valid compounds are queued for docking; invalid syntax is filtered out and never fabricated.
            </div>
          </div>
        </div>
      </div>

      {/* STEP 2: Protein Target & Pocket Selection */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-6 space-y-5">
        <div className="flex items-center space-x-2.5 pb-3 border-b border-slate-100">
          <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center font-bold text-xs font-mono">
            2
          </div>
          <h2 className="text-sm font-bold text-slate-900">
            Target Protein & Binding Pocket Selection
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Target Receptor:</label>
            <select
              value={selectedTargetId}
              onChange={(e) => setSelectedTargetId(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold text-slate-800 shadow-2xs font-mono"
            >
              {TARGETS.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.geneSymbol} (PDB: {t.pdbId})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Target Binding Pocket:</label>
            <select
              value={selectedPocketMode}
              onChange={(e) => setSelectedPocketMode(e.target.value as any)}
              className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold text-slate-800 shadow-2xs font-mono"
            >
              <option value="primary">Pocket-1: Orthosteric ATP Cleft (Druggability: 0.89)</option>
              <option value="allosteric">Pocket-2: Allosteric Sub-Cleft (Druggability: 0.71)</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Exhaustiveness ({exhaustiveness}):</label>
            <input
              type="range"
              min="4"
              max="16"
              step="2"
              value={exhaustiveness}
              onChange={(e) => setExhaustiveness(parseInt(e.target.value, 10))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer mt-2"
            />
            <span className="text-[10px] font-mono text-slate-400 block mt-1">
              Higher exhaustiveness performs more extensive conformational sampling.
            </span>
          </div>
        </div>

        {/* Start Screening Action Button */}
        <div className="pt-2 flex items-center justify-between border-t border-slate-100">
          <div className="text-xs text-slate-500 font-mono">
            Ready to screen {validationResult?.valid_count || 0} valid candidates against {target.geneSymbol}
          </div>

          <button
            onClick={handleStartScreening}
            disabled={!validationResult || validationResult.valid_count === 0 || isSubmitting || batchJob?.status === 'running'}
            className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-lg bg-[#1E3A8A] hover:bg-[#1B365D] text-white text-xs font-semibold shadow-xs disabled:opacity-50 transition-colors cursor-pointer"
          >
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Layers className="w-4 h-4 text-cyan-300" />
            )}
            <span>Submit to Background Docking Queue</span>
          </button>
        </div>
      </div>

      {/* STEP 3: Live Background Virtual Screening Queue & Results Table */}
      {batchJob && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-6 space-y-5">
          {/* Queue Header & Status Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-mono font-bold text-slate-400 uppercase">
                  Batch Queue: {batchJob.batch_id}
                </span>
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                    batchJob.status === 'completed'
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : batchJob.status === 'running'
                      ? 'bg-blue-50 text-blue-800 border border-blue-200 animate-pulse'
                      : batchJob.status === 'cancelled'
                      ? 'bg-slate-100 text-slate-700'
                      : 'bg-rose-50 text-rose-800 border border-rose-200'
                  }`}
                >
                  {batchJob.status === 'completed' && <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-600" />}
                  {batchJob.status === 'running' && <Loader2 className="w-3 h-3 mr-1 animate-spin text-blue-600" />}
                  {batchJob.status.toUpperCase()}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-mono mt-0.5">
                Target: {batchJob.target_gene} ({batchJob.pdb_id}) • Created: {batchJob.created_at}
              </p>
            </div>

            {/* Actions: Cancel & CSV Export */}
            <div className="flex items-center space-x-2">
              {batchJob.status === 'running' && (
                <button
                  onClick={handleCancelJob}
                  className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold transition-colors"
                >
                  <StopCircle className="w-3.5 h-3.5" />
                  <span>Cancel Job</span>
                </button>
              )}

              <button
                onClick={handleExportCsv}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Results CSV</span>
              </button>
            </div>
          </div>

          {/* Live Progress Bar */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-mono text-slate-600">
              <span>Overall Screening Progress:</span>
              <span>
                {batchJob.completed_count} / {batchJob.total_compounds} Completed ({progressPercent}%)
              </span>
            </div>
            <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
              <div
                className="h-full bg-gradient-to-r from-blue-600 to-teal-500 transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className="flex flex-wrap gap-4 text-[11px] font-mono text-slate-500 pt-1">
              <span>Pending: {batchJob.pending_count}</span>
              <span>Running: {batchJob.running_count}</span>
              <span className="text-emerald-700">Completed: {batchJob.completed_count}</span>
              {batchJob.failed_count > 0 && <span className="text-rose-600">Failed: {batchJob.failed_count}</span>}
              {batchJob.cancelled_count > 0 && <span className="text-slate-500">Cancelled: {batchJob.cancelled_count}</span>}
            </div>
          </div>

          {/* Filtering and Search Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Filter compound name or SMILES..."
                  value={filterQuery}
                  onChange={(e) => setFilterQuery(e.target.value)}
                  className="pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono w-60 text-slate-800 placeholder-slate-400"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-mono text-slate-700"
              >
                <option value="all">All Statuses</option>
                <option value="completed">Completed Only</option>
                <option value="running">Running</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
              </select>
            </div>

            <div className="flex items-center space-x-2 text-xs font-mono text-slate-500">
              <span>Sort by:</span>
              <button
                onClick={() => {
                  if (sortField === 'score') setSortAsc(!sortAsc);
                  else {
                    setSortField('score');
                    setSortAsc(true);
                  }
                }}
                className={`px-2 py-1 rounded border ${
                  sortField === 'score' ? 'bg-blue-50 border-blue-300 font-bold text-blue-800' : 'bg-white border-slate-200'
                }`}
              >
                Score {sortField === 'score' && (sortAsc ? '↑ (Affinity)' : '↓')}
              </button>

              <button
                onClick={() => {
                  if (sortField === 'name') setSortAsc(!sortAsc);
                  else {
                    setSortField('name');
                    setSortAsc(true);
                  }
                }}
                className={`px-2 py-1 rounded border ${
                  sortField === 'name' ? 'bg-blue-50 border-blue-300 font-bold text-blue-800' : 'bg-white border-slate-200'
                }`}
              >
                Name {sortField === 'name' && (sortAsc ? '↑' : '↓')}
              </button>
            </div>
          </div>

          {/* Results Table */}
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-slate-50/80 text-slate-500 uppercase tracking-wider border-b border-slate-200 text-[10px]">
                  <tr>
                    <th className="py-2.5 px-3.5 font-semibold">Rank</th>
                    <th className="py-2.5 px-3.5 font-semibold">Compound Name</th>
                    <th className="py-2.5 px-3.5 font-semibold">SMILES Structure</th>
                    <th className="py-2.5 px-3.5 font-semibold">MW (g/mol)</th>
                    <th className="py-2.5 px-3.5 font-semibold">Status</th>
                    <th className="py-2.5 px-3.5 font-semibold">AutoDock Vina ΔG</th>
                    <th className="py-2.5 px-3.5 font-semibold">Est. Kd</th>
                    <th className="py-2.5 px-3.5 text-right font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {displayTasks.map((t, index) => (
                    <tr key={t.compound_id || index} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-3.5 font-bold text-slate-700">#{index + 1}</td>
                      <td className="py-3 px-3.5 font-bold text-slate-900">{t.compound_name}</td>
                      <td className="py-3 px-3.5 truncate max-w-xs text-slate-500" title={t.smiles}>
                        {t.smiles}
                      </td>
                      <td className="py-3 px-3.5 text-slate-600">{t.molecular_weight || '—'}</td>
                      <td className="py-3 px-3.5">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                            t.status === 'completed'
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              : t.status === 'running'
                              ? 'bg-blue-50 text-blue-800 border border-blue-200 animate-pulse'
                              : t.status === 'pending'
                              ? 'bg-slate-100 text-slate-600'
                              : 'bg-rose-50 text-rose-800 border border-rose-200'
                          }`}
                        >
                          {t.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-3 px-3.5">
                        {t.docking_score_kcal_mol !== null ? (
                          <span className="font-bold text-blue-900 text-sm">
                            {t.docking_score_kcal_mol.toFixed(2)} kcal/mol
                          </span>
                        ) : (
                          <span className="text-slate-400 italic">Pending / Unprocessed</span>
                        )}
                      </td>
                      <td className="py-3 px-3.5 text-slate-700">
                        {t.estimated_kd_nm !== null ? `${t.estimated_kd_nm} nM` : '—'}
                      </td>
                      <td className="py-3 px-3.5 text-right">
                        {t.status === 'completed' && (
                          <Link
                            to={`/admet?compoundName=${encodeURIComponent(t.compound_name)}&smiles=${encodeURIComponent(t.smiles)}`}
                            className="inline-flex items-center space-x-1 text-[11px] text-blue-700 hover:text-blue-900 font-semibold"
                          >
                            <span>ADMET</span>
                            <ChevronRight className="w-3 h-3" />
                          </Link>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BatchScreeningPage;
