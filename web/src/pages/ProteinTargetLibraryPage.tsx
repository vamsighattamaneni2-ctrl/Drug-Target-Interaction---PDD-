import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Bookmark,
  Check,
  ChevronRight,
  Crosshair,
  Dna,
  Download,
  ExternalLink,
  Eye,
  Globe,
  Loader2,
  Search,
  Sparkles,
} from 'lucide-react';
import { TARGETS, DISEASES } from '../data/dataset';
import { ProteinTarget } from '../types';
import { appState } from '../services/appStateService';
import {
  searchBioTargets,
  triggerFileDownload,
  downloadRemoteFile,
  generateStandardPdb,
  generateFasta,
  type BioTarget,
} from '../services/bioDataService';

export const ProteinTargetLibraryPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('ALL');
  const [selectedOrganism, setSelectedOrganism] = useState('ALL');
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  // Live PDB/UniProt search
  const [activeTab, setActiveTab] = useState<'curated' | 'live_pdb'>('curated');
  const [isSearchingLive, setIsSearchingLive] = useState(false);
  const [liveResults, setLiveResults] = useState<BioTarget[]>([]);

  const savedTargets = appState.getSavedItems().filter((i) => i.type === 'target');
  const savedIds = new Set(savedTargets.map((s) => s.entityId));

  const handleLiveQuery = async (queryText: string) => {
    const q = queryText.trim() || 'EGFR';
    setIsSearchingLive(true);
    try {
      const results = await searchBioTargets(q);
      setLiveResults(results);
    } catch (e) {
      console.error('PDB search failed:', e);
    } finally {
      setIsSearchingLive(false);
    }
  };

  const handleDownloadCoordinates = async (
    target: { geneSymbol: string; proteinName: string; pdbId?: string; uniprotId?: string; organism?: string },
    format: 'pdb' | 'cif' | 'fasta'
  ) => {
    const key = `${target.geneSymbol}-${format}`;
    setDownloadingId(key);
    try {
      const pdbId = target.pdbId || '1M17';
      const uniprotId = target.uniprotId || 'P00533';

      if (format === 'pdb') {
        const directUrl = `https://files.rcsb.org/download/${pdbId}.pdb`;
        const fallback = generateStandardPdb(target);
        await downloadRemoteFile(directUrl, `${target.geneSymbol}_${pdbId}.pdb`, fallback);
      } else if (format === 'cif') {
        const directUrl = `https://files.rcsb.org/download/${pdbId}.cif`;
        await downloadRemoteFile(directUrl, `${target.geneSymbol}_${pdbId}.cif`);
      } else if (format === 'fasta') {
        const fasta = generateFasta(target);
        triggerFileDownload(fasta, `${target.geneSymbol}_${uniprotId}.fasta`, 'text/plain');
      }
    } finally {
      setTimeout(() => setDownloadingId(null), 800);
    }
  };

  const filteredTargets = TARGETS.filter((t) => {
    const matchesSearch =
      t.geneSymbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.proteinName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.uniprotId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (t.pdbId && t.pdbId.toLowerCase().includes(searchTerm.toLowerCase())) ||
      t.id.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesClass = selectedClass === 'ALL' || t.targetClass === selectedClass;
    const matchesOrganism = selectedOrganism === 'ALL' || (t.organism && t.organism.includes(selectedOrganism));

    return matchesSearch && matchesClass && matchesOrganism;
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="border-b border-slate-200 pb-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2.5">
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                Protein Target Library
              </h1>
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-teal-50 text-teal-800 border border-teal-200">
                Structural Biology & Proteomics
              </span>
            </div>
            <p className="text-sm text-slate-500 mt-1">
              Search druggable oncogenic kinases, catalytic receptors, query live RCSB Protein Data Bank crystal structures, and inspect 3D conformations.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <Link
              to="/viewer"
              className="inline-flex items-center space-x-1.5 px-4 py-2.5 rounded-lg bg-[#0D9488] hover:bg-[#0F766E] text-white font-medium text-xs shadow-sm transition-colors"
            >
              <Eye className="w-3.5 h-3.5 text-cyan-200" />
              <span>Launch 3D Molecular Viewer</span>
            </Link>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center space-x-2 mt-5">
          <button
            onClick={() => setActiveTab('curated')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'curated'
                ? 'bg-[#1E3A8A] text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            Curated Proteome ({TARGETS.length} Validated Oncology Kinases)
          </button>

          <button
            onClick={() => {
              setActiveTab('live_pdb');
              if (liveResults.length === 0) handleLiveQuery(searchTerm || 'EGFR');
            }}
            className={`inline-flex items-center space-x-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'live_pdb'
                ? 'bg-teal-700 text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>RCSB PDB & UniProt Live Proteome</span>
          </button>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && activeTab === 'live_pdb') handleLiveQuery(searchTerm);
              }}
              placeholder="Search by protein name, gene symbol (e.g. EGFR, ABL1), UniProt ID (P00533), or PDB ID (1M17)..."
              className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-10 pr-4 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-teal-600 font-mono"
            />
          </div>

          {activeTab === 'live_pdb' ? (
            <button
              onClick={() => handleLiveQuery(searchTerm)}
              disabled={isSearchingLive}
              className="inline-flex items-center justify-center space-x-1.5 px-5 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-lg text-xs font-semibold transition-colors disabled:bg-teal-400"
            >
              {isSearchingLive ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Querying RCSB PDB...</span>
                </>
              ) : (
                <>
                  <Search className="w-3.5 h-3.5" />
                  <span>Search Proteome</span>
                </>
              )}
            </button>
          ) : (
            <button
              onClick={() => {
                setActiveTab('live_pdb');
                handleLiveQuery(searchTerm || 'EGFR');
              }}
              className="inline-flex items-center space-x-1.5 px-4 py-2 bg-slate-100 hover:bg-teal-50 text-slate-700 hover:text-teal-800 rounded-lg text-xs font-medium border border-slate-200 transition-colors"
            >
              <Globe className="w-3.5 h-3.5 text-teal-600" />
              <span>Query RCSB PDB</span>
            </button>
          )}
        </div>

        {activeTab === 'curated' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div>
              <label className="block text-[11px] font-mono text-slate-500 mb-1">Target Class</label>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 focus:outline-none focus:bg-white focus:border-teal-600"
              >
                <option value="ALL">All Target Classes</option>
                <option value="Receptor Tyrosine Kinase">Receptor Tyrosine Kinase</option>
                <option value="Non-Receptor Tyrosine Kinase">Non-Receptor Tyrosine Kinase</option>
                <option value="Nuclear Hormone Receptor">Nuclear Hormone Receptor</option>
                <option value="Enzyme / Oxidoreductase">Enzyme / Oxidoreductase</option>
                <option value="Cell Surface Antigen">Cell Surface Antigen</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-mono text-slate-500 mb-1">Organism</label>
              <select
                value={selectedOrganism}
                onChange={(e) => setSelectedOrganism(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 focus:outline-none focus:bg-white focus:border-teal-600"
              >
                <option value="ALL">All Organisms</option>
                <option value="Homo sapiens">Homo sapiens (Human)</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Target Cards Presentation */}
      {activeTab === 'live_pdb' ? (
        /* LIVE RCSB PDB RESULTS */
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-500 font-mono">
            <span>RCSB PDB & UniProt Search for: &ldquo;{searchTerm || 'Kinase Targets'}&rdquo;</span>
            <span>{liveResults.length} structures found</span>
          </div>

          {isSearchingLive ? (
            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center space-y-3">
              <Loader2 className="w-8 h-8 text-teal-600 animate-spin mx-auto" />
              <p className="text-sm font-semibold text-slate-800">Fetching Crystallographic Coordinates...</p>
              <p className="text-xs text-slate-400">Querying resolution, UniProt accession, and active pocket coordinates.</p>
            </div>
          ) : liveResults.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center space-y-2">
              <Crosshair className="w-8 h-8 text-slate-300 mx-auto" />
              <h3 className="text-sm font-semibold text-slate-700">No PDB Structures Found</h3>
              <p className="text-xs text-slate-400">Try searching another kinase code (e.g. BRAF, KRAS, CDK4, ABL1).</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {liveResults.map((target) => (
                <div
                  key={`${target.geneSymbol}-${target.pdbId || target.uniprotId}`}
                  className="bg-white rounded-xl border border-slate-200 shadow-2xs hover:shadow-md transition-shadow p-5 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center space-x-2">
                          <h2 className="text-base font-bold text-slate-900">{target.geneSymbol}</h2>
                          {target.pdbId && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-teal-50 text-teal-800 border border-teal-200">
                              PDB: {target.pdbId}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-600 font-medium mt-0.5">{target.proteinName}</p>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-100 text-slate-600">
                        {target.organism || 'Homo sapiens'}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px] font-mono bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                      <div>
                        <span className="text-slate-400 text-[10px] block">UniProt Accession</span>
                        <a
                          href={`https://www.uniprot.org/uniprotkb/${target.uniprotId}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-teal-700 hover:underline font-semibold flex items-center gap-1"
                        >
                          <span>{target.uniprotId}</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      </div>
                      <div>
                        <span className="text-slate-400 text-[10px] block">Resolution</span>
                        <span className="text-slate-700">{target.resolution || 'X-ray 2.4 Å'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <div className="flex items-center space-x-1 font-mono text-[10px]">
                      <button
                        onClick={() => handleDownloadCoordinates(target, 'pdb')}
                        className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700"
                      >
                        {downloadingId === `${target.geneSymbol}-pdb` ? '✓' : '.PDB'}
                      </button>
                      <button
                        onClick={() => handleDownloadCoordinates(target, 'fasta')}
                        className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700"
                      >
                        {downloadingId === `${target.geneSymbol}-fasta` ? '✓' : '.FASTA'}
                      </button>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Link
                        to={`/viewer?target=${encodeURIComponent(target.geneSymbol)}&pdb=${target.pdbId || '1M17'}`}
                        className="px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-medium"
                      >
                        3D View
                      </Link>
                      <Link
                        to={`/analysis/new?target=${encodeURIComponent(target.geneSymbol)}&pdbId=${target.pdbId || ''}`}
                        className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-[#0D9488] hover:bg-[#0F766E] text-white text-xs font-semibold shadow-2xs"
                      >
                        <span>Select Target</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* CURATED PROTEOME CARDS */
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-500 font-mono px-1">
            <span>Showing {filteredTargets.length} validated target kinases</span>
            <span>Organism: Homo sapiens</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredTargets.map((t) => {
              const isSaved = savedIds.has(t.id);

              return (
                <div
                  key={t.id}
                  className="bg-white rounded-xl border border-slate-200 hover:border-teal-400 shadow-2xs hover:shadow-md transition-all p-5 flex flex-col justify-between"
                >
                  <div>
                    {/* Header */}
                    <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-100">
                      <div className="flex items-center space-x-1.5">
                        <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded bg-teal-50 text-teal-900 border border-teal-200">
                          {t.geneSymbol}
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                          UniProt: {t.uniprotId}
                        </span>
                      </div>

                      <button
                        onClick={() => {
                          if (isSaved) {
                            const item = savedTargets.find((s) => s.entityId === t.id);
                            if (item) appState.removeSavedItem(item.id);
                          } else {
                            appState.saveTarget(t, 'Oncogenic Kinase Targets', t.biologicalFunction);
                          }
                        }}
                        title={isSaved ? 'Remove from saved' : 'Add to saved targets'}
                        className={`p-1.5 rounded-lg transition-colors ${
                          isSaved
                            ? 'bg-teal-50 text-teal-700 border border-teal-200'
                            : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-teal-700' : ''}`} />
                      </button>
                    </div>

                    {/* Target Name & Protein Name */}
                    <div className="mt-3">
                      <h2 className="text-base font-bold text-slate-900">
                        {t.proteinName}
                      </h2>
                      <p className="text-xs text-slate-500 font-medium mt-0.5">
                        Classification: <span className="text-teal-900 font-semibold">{t.targetClass}</span>
                      </p>
                    </div>

                    {/* Biological Function */}
                    <div className="mt-2.5 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">
                        Biological Function
                      </span>
                      <p className="text-xs text-slate-700 mt-0.5 line-clamp-3 leading-relaxed">
                        {t.biologicalFunction}
                      </p>
                    </div>

                    {/* Available PDB Structures */}
                    <div className="mt-3 pt-2.5 border-t border-slate-100 text-xs">
                      <span className="text-[10px] font-mono text-slate-400 uppercase block">Available PDB Crystal Structures</span>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="font-mono font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200 text-[11px]">
                          {t.pdbId || '1M17'} (2.4 Å)
                        </span>
                        <span className="text-[10px] text-slate-400">X-Ray Crystallography</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions Toolbar */}
                  <div className="mt-4 pt-3 border-t border-slate-100 space-y-2.5">
                    {/* Downloads */}
                    <div className="flex items-center justify-between text-[11px] font-mono">
                      <span className="text-slate-400 flex items-center gap-1">
                        <Download className="w-3 h-3" /> Coordinates:
                      </span>
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => handleDownloadCoordinates(t, 'pdb')}
                          className="px-1.5 py-0.5 rounded bg-slate-100 hover:bg-teal-100 text-slate-700"
                        >
                          {downloadingId === `${t.geneSymbol}-pdb` ? '✓' : '.PDB'}
                        </button>
                        <button
                          onClick={() => handleDownloadCoordinates(t, 'fasta')}
                          className="px-1.5 py-0.5 rounded bg-slate-100 hover:bg-teal-100 text-slate-700"
                        >
                          {downloadingId === `${t.geneSymbol}-fasta` ? '✓' : '.FASTA'}
                        </button>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="grid grid-cols-2 gap-2">
                      <Link
                        to={`/viewer?target=${encodeURIComponent(t.geneSymbol)}&pdb=${t.pdbId || '1M17'}`}
                        className="inline-flex items-center justify-center space-x-1.5 py-2 px-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium text-xs transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5 text-teal-600" />
                        <span>3D Structure</span>
                      </Link>

                      <Link
                        to={`/analysis/new?target=${t.id}`}
                        className="inline-flex items-center justify-center space-x-1 py-2 px-2 rounded-lg bg-[#0D9488] hover:bg-[#0F766E] text-white font-medium text-xs shadow-2xs transition-colors"
                      >
                        <span>Select Target</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProteinTargetLibraryPage;
