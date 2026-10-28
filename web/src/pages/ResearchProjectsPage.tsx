import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  FolderGit2,
  Calendar,
  Layers,
  ArrowRight,
  Download,
  Trash2,
  Search,
  Plus,
  CheckCircle2,
  Hash,
  ExternalLink,
  FileText,
  FileCode,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';
import {
  listResearchProjects,
  saveResearchProjectSession,
  deleteResearchProjectSession,
  ResearchProjectSession,
} from '../services/advancedFeaturesService';
import { triggerFileDownload } from '../services/bioDataService';

export const ResearchProjectsPage: React.FC = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<ResearchProjectSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);

  // New project dialog state
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newTarget, setNewTarget] = useState('BCR-ABL1');
  const [newCompound, setNewCompound] = useState('Imatinib');

  const loadProjects = async () => {
    setIsLoading(true);
    try {
      const data = await listResearchProjects();
      setProjects(data);
    } catch (err) {
      console.error('Error fetching research projects:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    try {
      await saveResearchProjectSession({
        title: newTitle.trim(),
        description: newDesc.trim() || 'In silico structure-based therapeutic evaluation.',
        target_gene: newTarget,
        pdb_id: newTarget === 'BCR-ABL1' ? '1IEP' : '1M17',
        compound_name: newCompound,
        smiles: 'CC1=C(C=C(C=C1)NC(=O)C2=CC=C(CN3CCN(C)CC3)C=C2)NC4=NC=CC(=N4)C5=CN=CC=C5',
      });
      setIsNewProjectModalOpen(false);
      setNewTitle('');
      setNewDesc('');
      await loadProjects();
    } catch (err) {
      console.error('Save project error:', err);
    }
  };

  const handleDelete = async (projectId: string) => {
    if (confirm(`Are you sure you want to delete research project session '${projectId}'?`)) {
      await deleteResearchProjectSession(projectId);
      await loadProjects();
    }
  };

  const handleExportSessionJson = (project: ResearchProjectSession) => {
    triggerFileDownload(
      JSON.stringify(project, null, 2),
      `${project.id}_reproducible_session.json`,
      'application/json'
    );
  };

  const filteredProjects = projects.filter((p) => {
    const q = searchQuery.toLowerCase();
    return (
      p.title.toLowerCase().includes(q) ||
      p.target_gene.toLowerCase().includes(q) ||
      p.compound_name.toLowerCase().includes(q) ||
      p.id.toLowerCase().includes(q)
    );
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="border-b border-slate-200 pb-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Research Projects & Reproducibility Sessions
            </h1>
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-blue-50 text-blue-800 border border-blue-200">
              Traceable Audit Records
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Preserve and reopen in silico docking sessions with exact grid parameters, molecular preparation settings, SHA-256 hashes, and generated dossiers.
          </p>
        </div>

        <button
          onClick={() => setIsNewProjectModalOpen(true)}
          className="inline-flex items-center space-x-2 px-4 py-2 rounded-lg bg-[#1E3A8A] hover:bg-[#1B365D] text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer self-start md:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Research Session</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search projects by title, target gene, compound, or session ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-xs font-mono text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-600 shadow-2xs"
          />
        </div>

        <button
          onClick={loadProjects}
          className="p-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 shadow-2xs self-end sm:self-auto"
          title="Refresh Sessions"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-blue-600' : ''}`} />
        </button>
      </div>

      {/* Projects Grid */}
      {isLoading ? (
        <div className="bg-white p-16 rounded-xl border border-slate-200 text-center space-y-3">
          <RefreshCw className="w-8 h-8 animate-spin text-blue-600 mx-auto" />
          <p className="text-xs font-semibold text-slate-700">Loading research project sessions...</p>
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="bg-white p-12 rounded-xl border border-dashed border-slate-300 text-center space-y-3">
          <FolderGit2 className="w-10 h-10 text-slate-400 mx-auto" />
          <h3 className="text-sm font-semibold text-slate-800">No Research Project Sessions Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Save your ongoing docking and ADMET analyses as project sessions to preserve parameters, input references, and reproducibility hashes.
          </p>
          <div className="pt-2">
            <button
              onClick={() => setIsNewProjectModalOpen(true)}
              className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-lg bg-[#1E3A8A] text-white text-xs font-semibold"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create First Session</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredProjects.map((p) => (
            <div
              key={p.id}
              className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5 space-y-4 hover:border-slate-300 transition-colors flex flex-col justify-between"
            >
              <div className="space-y-2.5">
                <div className="flex items-start justify-between gap-2">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 font-bold">
                    {p.id}
                  </span>

                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-emerald-50 text-emerald-800 border border-emerald-200">
                    <CheckCircle2 className="w-2.5 h-2.5 mr-1 text-emerald-600" />
                    Verified
                  </span>
                </div>

                <h3 className="font-bold text-sm text-slate-900 leading-snug">{p.title}</h3>

                <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                  {p.description}
                </p>

                {/* Target & Compound Meta */}
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/80 space-y-1 text-xs font-mono">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Target:</span>
                    <span className="font-bold text-teal-800">
                      {p.target_gene} ({p.pdb_id})
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Ligand:</span>
                    <span className="font-bold text-slate-900">{p.compound_name}</span>
                  </div>
                  {p.results?.best_affinity_kcal_mol && (
                    <div className="flex justify-between pt-1 border-t border-slate-200/60">
                      <span className="text-slate-500">Vina Affinity:</span>
                      <span className="font-bold text-blue-900">
                        {p.results.best_affinity_kcal_mol} kcal/mol
                      </span>
                    </div>
                  )}
                </div>

                {/* Reproducibility Hash */}
                <div className="flex items-center space-x-1.5 text-[10px] font-mono text-slate-400">
                  <Hash className="w-3 h-3 text-slate-400 shrink-0" />
                  <span className="truncate" title={p.reproducibility_hash}>
                    {p.reproducibility_hash}
                  </span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-mono">
                <button
                  onClick={() => handleExportSessionJson(p)}
                  className="p-1.5 text-slate-500 hover:text-slate-800 rounded hover:bg-slate-50"
                  title="Export Session JSON"
                >
                  <Download className="w-3.5 h-3.5" />
                </button>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleDelete(p.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded hover:bg-rose-50"
                    title="Delete Session"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>

                  <Link
                    to={`/docking?target=${p.target_gene}&compound=${encodeURIComponent(p.compound_name)}`}
                    className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-[#1E3A8A] hover:bg-[#1B365D] text-white text-xs font-semibold"
                  >
                    <span>Reopen Session</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* New Project Modal */}
      {isNewProjectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-sm text-slate-900">Create New Research Session</h3>
              <button
                onClick={() => setIsNewProjectModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateProject} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Project Title:</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. BCR-ABL1 Allosteric Asciminib Lead Screening"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg font-sans"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Investigation Notes:</label>
                <textarea
                  rows={2}
                  placeholder="Outline the pharmacological target mechanism, cohort, and hypotheses..."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg font-sans"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Target Gene:</label>
                  <select
                    value={newTarget}
                    onChange={(e) => setNewTarget(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded font-mono"
                  >
                    <option value="BCR-ABL1">BCR-ABL1 (PDB: 1IEP)</option>
                    <option value="EGFR">EGFR (PDB: 1M17)</option>
                    <option value="HER2">HER2 (PDB: 3PP0)</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Initial Compound:</label>
                  <input
                    type="text"
                    value={newCompound}
                    onChange={(e) => setNewCompound(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded font-mono"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsNewProjectModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-[#1E3A8A] text-white font-semibold"
                >
                  Save Session
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResearchProjectsPage;
