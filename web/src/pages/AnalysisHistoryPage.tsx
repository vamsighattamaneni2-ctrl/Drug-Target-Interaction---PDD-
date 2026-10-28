import React, { useState, useMemo } from 'react';
import {
  History,
  Search,
  Filter,
  Play,
  RotateCcw,
  Copy,
  Trash2,
  ExternalLink,
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
  FileText,
  Calendar,
  Layers,
  Sparkles,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { appStateService } from '../services/appStateService';
import { AnalysisJob } from '../types';

export const AnalysisHistoryPage: React.FC = () => {
  const navigate = useNavigate();
  const [analyses, setAnalyses] = useState<AnalysisJob[]>(() => appStateService.getAnalyses());
  const currentUser = appStateService.getCurrentUser();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'running' | 'queued' | 'failed'>('all');
  const [methodFilter, setMethodFilter] = useState<string>('all');
  const [selectedAnalysis, setSelectedAnalysis] = useState<AnalysisJob | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Filter analyses (Researchers view only their own analyses unless role is Administrator)
  const filteredAnalyses = useMemo(() => {
    return analyses.filter((job) => {
      // User privacy scope
      if (currentUser.role !== 'Administrator' && job.submittedBy && job.submittedBy !== currentUser.id) {
        return false;
      }

      // Status
      if (statusFilter !== 'all' && job.status !== statusFilter) {
        return false;
      }

      // Method
      if (methodFilter !== 'all' && !job.method.toLowerCase().includes(methodFilter.toLowerCase())) {
        return false;
      }

      // Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesId = job.id.toLowerCase().includes(q);
        const matchesCompound = job.compoundName.toLowerCase().includes(q);
        const matchesTarget = (job.targetName || '').toLowerCase().includes(q);
        const matchesGene = (job.targetGene || '').toLowerCase().includes(q);
        if (!matchesId && !matchesCompound && !matchesTarget && !matchesGene) {
          return false;
        }
      }

      return true;
    });
  }, [analyses, currentUser, statusFilter, methodFilter, searchQuery]);

  const handleDelete = (id: string) => {
    appStateService.deleteAnalysis(id);
    setAnalyses(appStateService.getAnalyses());
    setConfirmDeleteId(null);
  };

  const handleRetry = (job: AnalysisJob) => {
    // Retry job
    appStateService.updateAnalysisStatus(job.id, 'running');
    setAnalyses(appStateService.getAnalyses());

    setTimeout(() => {
      appStateService.updateAnalysisStatus(job.id, 'completed', -8.45);
      setAnalyses(appStateService.getAnalyses());
    }, 2000);
  };

  const handleDuplicate = (job: AnalysisJob) => {
    navigate(`/analysis/new?compound=${job.compoundId}&target=${job.targetId}`);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-[#0284C7] uppercase tracking-wider mb-1">
            <History className="w-4 h-4" />
            <span>Audit Trail & Job Queue</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Analysis History</h1>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            Complete record of computational docking runs, conformational searches, and molecular affinity evaluations
            logged for your account.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            to="/analysis/new"
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-lg bg-[#0284C7] hover:bg-[#0369A1] text-white text-xs font-semibold shadow-sm transition-all"
          >
            <Sparkles className="w-4 h-4" />
            <span>Start New Analysis</span>
          </Link>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          <div className="md:col-span-6 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by analysis ID, compound name, target, or gene symbol..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:bg-white focus:border-[#0284C7] transition-all"
            />
          </div>

          <div className="md:col-span-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:bg-white focus:border-[#0284C7]"
            >
              <option value="all">All Statuses ({analyses.length})</option>
              <option value="completed">Completed</option>
              <option value="running">Running / In Progress</option>
              <option value="queued">Queued in Dispatcher</option>
              <option value="failed">Failed / Exception</option>
            </select>
          </div>

          <div className="md:col-span-3">
            <select
              value={methodFilter}
              onChange={(e) => setMethodFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:bg-white focus:border-[#0284C7]"
            >
              <option value="all">All Computational Methods</option>
              <option value="AutoDock Vina">AutoDock Vina 1.2.5</option>
              <option value="RDKit">RDKit MMFF94 Conformer</option>
              <option value="Pocket">Binding Pocket Alignment</option>
            </select>
          </div>
        </div>

        {/* Quick status count badges */}
        <div className="flex items-center space-x-2 pt-2 text-[11px] text-slate-500 border-t border-slate-100">
          <span>Active filter results: <strong>{filteredAnalyses.length}</strong> jobs</span>
          <span>•</span>
          <span className="text-emerald-700">
            {analyses.filter((a) => a.status === 'completed').length} completed
          </span>
          <span>•</span>
          <span className="text-sky-700">
            {analyses.filter((a) => a.status === 'running').length} in progress
          </span>
          <span>•</span>
          <span className="text-rose-700">
            {analyses.filter((a) => a.status === 'failed').length} failed
          </span>
        </div>
      </div>

      {/* Analysis Records Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {filteredAnalyses.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
              <History className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-800">No Analysis Records Found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {searchQuery || statusFilter !== 'all' || methodFilter !== 'all'
                ? 'No jobs match your current search criteria. Try resetting your query filters.'
                : 'You have not submitted any interaction docking runs yet. Start a new analysis to generate your first computational record.'}
            </p>
            <Link
              to="/analysis/new"
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-[#0284C7] hover:bg-[#0369A1] text-white text-xs font-semibold shadow-sm transition-all mt-2"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Launch First Analysis</span>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                  <th className="py-3 px-4">Analysis ID</th>
                  <th className="py-3 px-4">Drug Compound</th>
                  <th className="py-3 px-4">Target Protein</th>
                  <th className="py-3 px-4">Method & Grid</th>
                  <th className="py-3 px-4">Docking Score</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Submitted</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAnalyses.map((job) => {
                  return (
                    <tr key={job.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-slate-800">
                        {job.id}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900">{job.compoundName}</div>
                        <div className="text-[10px] text-slate-400 font-mono">ID: {job.compoundId}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900">{job.targetName}</div>
                        <div className="text-[10px] text-slate-500">
                          {job.targetGene} • PDB: {job.targetPdbId || 'N/A'}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-slate-700 font-medium">{job.method}</div>
                        <div className="text-[10px] text-slate-400">
                          Exhaustiveness: {job.parameters?.exhaustiveness ?? 8}
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono">
                        {job.status === 'completed' && job.dockingScore !== undefined ? (
                          <span className="font-bold text-[#0369A1] bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                            {job.dockingScore} kcal/mol
                          </span>
                        ) : job.status === 'running' ? (
                          <span className="text-sky-600 text-[11px] animate-pulse">Calculating...</span>
                        ) : job.status === 'failed' ? (
                          <span className="text-rose-600 text-[11px]">Failed</span>
                        ) : (
                          <span className="text-slate-400 text-[11px]">Queued</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {job.status === 'completed' && (
                          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>Completed</span>
                          </span>
                        )}
                        {job.status === 'running' && (
                          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-sky-50 text-sky-700 border border-sky-200">
                            <Clock className="w-3 h-3 text-sky-600 animate-spin" />
                            <span>Running</span>
                          </span>
                        )}
                        {job.status === 'queued' && (
                          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                            <Clock className="w-3 h-3 text-amber-600" />
                            <span>Queued</span>
                          </span>
                        )}
                        {job.status === 'failed' && (
                          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                            <XCircle className="w-3 h-3 text-rose-600" />
                            <span>Failed</span>
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-slate-500 text-[11px]">
                        <div>{(job.submittedAt || job.dateSubmitted || '').split('T')[0]}</div>
                        <div className="text-[10px] text-slate-400">
                          {job.completedAt ? `Completed: ${job.completedAt.split('T')[1]?.slice(0, 5)}` : 'In queue'}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="inline-flex items-center space-x-1">
                          {job.status === 'completed' && (
                            <Link
                              to={`/viewer`}
                              className="p-1.5 text-slate-500 hover:text-[#0284C7] hover:bg-sky-50 rounded transition-colors"
                              title="Open in 3D Molecular Viewer"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </Link>
                          )}
                          {job.status === 'failed' && (
                            <button
                              onClick={() => handleRetry(job)}
                              className="p-1.5 text-amber-600 hover:bg-amber-50 rounded transition-colors"
                              title="Retry failed calculation"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button
                            onClick={() => handleDuplicate(job)}
                            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded transition-colors"
                            title="Duplicate analysis parameters"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setConfirmDeleteId(job.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                            title="Delete record"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {confirmDeleteId && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-sm w-full p-5 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center space-x-3 text-rose-600">
              <AlertCircle className="w-6 h-6" />
              <h3 className="text-sm font-bold text-slate-900">Confirm Record Deletion</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to delete analysis <strong className="font-mono text-slate-800">{confirmDeleteId}</strong>? This will permanently remove docking poses, coordinate files, and interaction contact logs.
            </p>
            <div className="flex items-center justify-end space-x-2 pt-2">
              <button
                onClick={() => setConfirmDeleteId(null)}
                className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(confirmDeleteId)}
                className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-xs font-semibold text-white shadow-sm"
              >
                Delete Record
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
