import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  ArrowRight,
  ArrowUpDown,
  ChevronRight,
  Crosshair,
  Dna,
  Download,
  ExternalLink,
  FlaskConical,
  Globe,
  HeartPulse,
  LayoutGrid,
  List,
  Loader2,
  Pill,
  Search,
  Sparkles,
  FileCode,
  Check,
} from 'lucide-react';
import { TARGETS, DRUGS, DISEASES, INTERACTIONS } from '../data/dataset';
import {
  searchBioTargets,
  triggerFileDownload,
  downloadRemoteFile,
  generateStandardPdb,
  generateFasta,
  type BioTarget,
} from '../services/bioDataService';

export const TargetSearchPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Search Mode: 'curated' | 'pdb_uniprot'
  const [searchMode, setSearchMode] = useState<'curated' | 'pdb_uniprot'>('curated');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '');
  const [selectedClass, setSelectedClass] = useState('ALL');
  const [selectedFamily, setSelectedFamily] = useState('ALL');
  const [selectedDisease, setSelectedDisease] = useState('ALL');
  const [selectedDrug, setSelectedDrug] = useState('ALL');
  const [sortBy, setSortBy] = useState<'gene' | 'drugs' | 'diseases'>('gene');

  // RCSB PDB & UniProt live search state
  const [liveTargets, setLiveTargets] = useState<BioTarget[]>([]);
  const [isSearchingLive, setIsSearchingLive] = useState(false);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  // Trigger live search on mode switch
  useEffect(() => {
    if (searchMode === 'pdb_uniprot' && searchTerm.trim().length >= 2) {
      handleLiveSearch(searchTerm);
    }
  }, [searchMode]);

  const handleLiveSearch = async (termToSearch: string) => {
    const q = termToSearch.trim() || 'EGFR';
    setIsSearchingLive(true);
    try {
      const results = await searchBioTargets(q);
      setLiveTargets(results);
    } catch (e) {
      console.error('Target search failed:', e);
    } finally {
      setIsSearchingLive(false);
    }
  };

  const handleDownloadTarget = async (
    target: { geneSymbol: string; proteinName: string; pdbId?: string; uniprotId?: string; organism?: string },
    format: 'pdb' | 'cif' | 'fasta' | 'json'
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
        const fastaContent = generateFasta(target);
        triggerFileDownload(fastaContent, `${target.geneSymbol}_${uniprotId}.fasta`, 'text/plain');
      } else if (format === 'json') {
        const jsonContent = JSON.stringify(target, null, 2);
        triggerFileDownload(jsonContent, `${target.geneSymbol}_metadata.json`, 'application/json');
      }
    } finally {
      setTimeout(() => setDownloadingId(null), 1000);
    }
  };

  const handlePredictWithTarget = (geneSymbol: string, proteinName: string, pdbId?: string) => {
    navigate(
      `/analysis/interaction?target=${encodeURIComponent(geneSymbol)}&targetName=${encodeURIComponent(proteinName)}&pdbId=${encodeURIComponent(pdbId || '')}&mode=predict`
    );
  };

  // Filter curated targets
  const filteredTargets = TARGETS.filter((t) => {
    const matchesSearch =
      t.geneSymbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.proteinName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.uniprotId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.biologicalFunction.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesClass = selectedClass === 'ALL' || t.targetClass === selectedClass;
    const matchesDisease = selectedDisease === 'ALL' || t.diseaseIds.includes(selectedDisease);
    const matchesDrug = selectedDrug === 'ALL' || t.drugIds.includes(selectedDrug);

    const matchesFamily =
      selectedFamily === 'ALL' ||
      (selectedFamily === 'Kinase' && t.targetClass.toLowerCase().includes('kinase')) ||
      (selectedFamily === 'Nuclear Receptor' && t.targetClass.toLowerCase().includes('nuclear')) ||
      (selectedFamily === 'Enzyme' && t.targetClass.toLowerCase().includes('enzyme')) ||
      (selectedFamily === 'Surface Antigen' && t.targetClass.toLowerCase().includes('differentiation'));

    return matchesSearch && matchesClass && matchesDisease && matchesDrug && matchesFamily;
  }).sort((a, b) => {
    if (sortBy === 'gene') return a.geneSymbol.localeCompare(b.geneSymbol);
    if (sortBy === 'drugs') return b.drugIds.length - a.drugIds.length;
    if (sortBy === 'diseases') return b.diseaseIds.length - a.diseaseIds.length;
    return 0;
  });

  const targetClasses = Array.from(new Set(TARGETS.map((t) => t.targetClass)));

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* 1. Target Explorer Header */}
      <div className="border-b border-slate-200 pb-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2.5">
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                Target Explorer
              </h1>
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-teal-50 text-teal-700 border border-teal-200">
                PDB & UniProt Connected
              </span>
            </div>
            <p className="text-sm text-slate-500 mt-1">
              Discover biological targets, oncogenic receptor kinases, and query structural coordinates across human proteome repositories.
            </p>
          </div>

          {/* Quick Action: Predict Interaction */}
          <Link
            to="/analysis/interaction?mode=predict"
            className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-lg bg-[#1E3A8A] hover:bg-[#1B365D] text-white font-medium text-xs shadow-sm transition-all self-start sm:self-auto"
          >
            <Sparkles className="w-4 h-4 text-cyan-300" />
            <span>Predict Interaction</span>
          </Link>
        </div>

        {/* Database Mode Switcher */}
        <div className="flex items-center justify-between flex-wrap gap-3 mt-5">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setSearchMode('curated')}
              className={`px-4 py-2 rounded-lg text-xs font-medium transition-all ${
                searchMode === 'curated'
                  ? 'bg-[#1E3A8A] text-white shadow-sm'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              Curated Proteome ({TARGETS.length} Validated Oncology Targets)
            </button>
            <button
              onClick={() => {
                setSearchMode('pdb_uniprot');
                if (liveTargets.length === 0) {
                  handleLiveSearch(searchTerm || 'EGFR');
                }
              }}
              className={`inline-flex items-center space-x-1.5 px-4 py-2 rounded-lg text-xs font-medium transition-all ${
                searchMode === 'pdb_uniprot'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>RCSB PDB & UniProt / NCBI (Live Proteome)</span>
            </button>
          </div>

          {/* View Mode Toggle: Cards vs Table */}
          {searchMode === 'curated' && (
            <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs">
              <button
                onClick={() => setViewMode('cards')}
                className={`flex items-center space-x-1.5 px-3 py-1 rounded-md font-medium transition-colors ${
                  viewMode === 'cards'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5 text-blue-700" />
                <span>Cards</span>
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`flex items-center space-x-1.5 px-3 py-1 rounded-md font-medium transition-colors ${
                  viewMode === 'table'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <List className="w-3.5 h-3.5 text-blue-700" />
                <span>Table</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 2. Search & Filters Bar */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && searchMode === 'pdb_uniprot') {
                  handleLiveSearch(searchTerm);
                }
              }}
              placeholder="Search gene, protein, target or UniProt identifier..."
              className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-10 pr-4 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all"
            />
          </div>

          {searchMode === 'pdb_uniprot' ? (
            <button
              onClick={() => handleLiveSearch(searchTerm)}
              disabled={isSearchingLive}
              className="inline-flex items-center justify-center space-x-1.5 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors"
            >
              {isSearchingLive ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Querying PDB / UniProt...</span>
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  <span>Search Proteome</span>
                </>
              )}
            </button>
          ) : (
            <button
              onClick={() => {
                setSearchMode('pdb_uniprot');
                handleLiveSearch(searchTerm || 'EGFR');
              }}
              className="inline-flex items-center justify-center space-x-1.5 px-4 py-2 bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 rounded-lg text-xs font-medium border border-slate-200 transition-colors"
            >
              <Globe className="w-3.5 h-3.5 text-blue-600" />
              <span>Query PDB & UniProt</span>
            </button>
          )}
        </div>

        {/* Curated Filters: Target Class, Protein Family, Disease, Drug Association */}
        {searchMode === 'curated' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
            <div>
              <label className="block text-[11px] font-mono text-slate-500 mb-1">Target Class</label>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 focus:outline-none focus:bg-white focus:border-blue-600"
              >
                <option value="ALL">All Target Classes</option>
                {targetClasses.map((tc) => (
                  <option key={tc} value={tc}>
                    {tc}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-mono text-slate-500 mb-1">Protein Family</label>
              <select
                value={selectedFamily}
                onChange={(e) => setSelectedFamily(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 focus:outline-none focus:bg-white focus:border-blue-600"
              >
                <option value="ALL">All Protein Families</option>
                <option value="Kinase">Kinase Superfamily</option>
                <option value="Nuclear Receptor">Nuclear Receptor Family</option>
                <option value="Enzyme">Metabolic Enzyme</option>
                <option value="Surface Antigen">Cluster of Differentiation (CD)</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-mono text-slate-500 mb-1">Disease</label>
              <select
                value={selectedDisease}
                onChange={(e) => setSelectedDisease(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 focus:outline-none focus:bg-white focus:border-blue-600"
              >
                <option value="ALL">All Associated Diseases</option>
                {DISEASES.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-mono text-slate-500 mb-1">Drug Association</label>
              <select
                value={selectedDrug}
                onChange={(e) => setSelectedDrug(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 focus:outline-none focus:bg-white focus:border-blue-600"
              >
                <option value="ALL">All Associated Compounds</option>
                {DRUGS.map((drug) => (
                  <option key={drug.id} value={drug.id}>
                    {drug.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* 3. Results Section */}
      {searchMode === 'pdb_uniprot' ? (
        /* LIVE RCSB PDB & UNIPROT RESULTS */
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-500 font-mono px-1">
            <span>RCSB Protein Data Bank & UniProt Records for: &ldquo;{searchTerm || 'Kinases'}&rdquo;</span>
            <span>{liveTargets.length} targets retrieved</span>
          </div>

          {isSearchingLive ? (
            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center space-y-3">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto" />
              <p className="text-sm font-semibold text-slate-800">Connecting to RCSB PDB & UniProt...</p>
              <p className="text-xs text-slate-400">Retrieving crystallographic coordinates, active site residues, and FASTA sequences.</p>
            </div>
          ) : liveTargets.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center space-y-2">
              <Crosshair className="w-8 h-8 text-slate-300 mx-auto" />
              <h3 className="text-sm font-semibold text-slate-700">No protein records found</h3>
              <p className="text-xs text-slate-400">Try searching a different gene or PDB identifier (e.g. EGFR, 1M17, BRAF, ERBB2).</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {liveTargets.map((target) => (
                <div
                  key={`${target.geneSymbol}-${target.pdbId || target.uniprotId}`}
                  className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow p-5 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center space-x-2">
                          <h2 className="text-base font-bold text-slate-900">{target.geneSymbol}</h2>
                          {target.pdbId && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-50 text-blue-800 border border-blue-200">
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
                          className="text-blue-700 hover:underline font-semibold flex items-center gap-1"
                        >
                          <span>{target.uniprotId}</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      </div>
                      <div>
                        <span className="text-slate-400 text-[10px] block">Resolution / Method</span>
                        <span className="text-slate-700">{target.resolution || 'X-ray 2.2 Å'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions: Download Coordinates & Predict */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center space-x-1.5 text-xs">
                      <span className="text-[11px] text-slate-400 font-mono flex items-center gap-1">
                        <Download className="w-3.5 h-3.5" />
                        Coords:
                      </span>
                      <button
                        onClick={() => handleDownloadTarget(target, 'pdb')}
                        className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono text-[11px] transition-colors"
                        title="Download Protein Data Bank coordinate file (.pdb)"
                      >
                        {downloadingId === `${target.geneSymbol}-pdb` ? '✓' : '.PDB'}
                      </button>
                      <button
                        onClick={() => handleDownloadTarget(target, 'fasta')}
                        className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono text-[11px] transition-colors"
                        title="Download canonical FASTA sequence (.fasta)"
                      >
                        {downloadingId === `${target.geneSymbol}-fasta` ? '✓' : '.FASTA'}
                      </button>
                    </div>

                    <button
                      onClick={() => handlePredictWithTarget(target.geneSymbol, target.proteinName, target.pdbId)}
                      className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-[#1E3A8A] hover:bg-[#1B365D] text-white rounded-lg text-xs font-medium shadow-sm transition-colors"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
                      <span>Predict Interaction</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : viewMode === 'cards' ? (
        /* PROFESSIONAL SCIENTIFIC CARDS VIEW (DEFAULT) */
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-500 font-mono px-1">
            <span>Showing {filteredTargets.length} biological targets</span>
            <span>Sorted by: {sortBy.toUpperCase()}</span>
          </div>

          {filteredTargets.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center space-y-2">
              <Crosshair className="w-8 h-8 text-slate-300 mx-auto" />
              <h3 className="text-sm font-semibold text-slate-700">No target records found</h3>
              <p className="text-xs text-slate-400">Try adjusting your filters or query keywords.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredTargets.map((target) => {
                const drugObjects = DRUGS.filter((d) => target.drugIds.includes(d.id));
                const diseaseObjects = DISEASES.filter((d) => target.diseaseIds.includes(d.id));

                return (
                  <div
                    key={target.id}
                    className="bg-white rounded-xl border border-slate-200 hover:border-blue-400 shadow-sm hover:shadow-md transition-all p-5 flex flex-col justify-between"
                  >
                    <div>
                      {/* Top Badges */}
                      <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-100">
                        <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200">
                          {target.id}
                        </span>
                        <span className="font-mono text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                          UniProt: {target.uniprotId}
                        </span>
                      </div>

                      {/* Target Name, Gene & Protein */}
                      <div className="mt-3">
                        <h2 className="text-base font-bold text-slate-900 group-hover:text-blue-700">
                          {target.geneSymbol}
                        </h2>
                        <p className="text-xs text-slate-500 font-medium">
                          {target.proteinName}
                        </p>
                      </div>

                      {/* Target Class */}
                      <div className="mt-2.5">
                        <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">
                          Target Class
                        </span>
                        <p className="text-xs font-semibold text-blue-900 mt-0.5 line-clamp-1">
                          {target.targetClass}
                        </p>
                      </div>

                      {/* Biological Function */}
                      <div className="mt-2.5 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                        <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">
                          Biological Function
                        </span>
                        <p className="text-xs text-slate-700 mt-0.5 line-clamp-2 leading-relaxed">
                          {target.biologicalFunction}
                        </p>
                      </div>

                      {/* Associated Drugs & Diseases */}
                      <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-slate-100 font-mono text-xs">
                        <div className="p-2 rounded bg-slate-50 border border-slate-100">
                          <span className="text-[10px] text-slate-400 block">Associated Drugs</span>
                          <span className="font-bold text-blue-800 text-sm">
                            {target.drugIds.length} drugs
                          </span>
                          <div className="text-[10px] text-blue-600 truncate mt-0.5">
                            {drugObjects.map((d) => d.name).join(', ') || 'None'}
                          </div>
                        </div>

                        <div className="p-2 rounded bg-slate-50 border border-slate-100">
                          <span className="text-[10px] text-slate-400 block">Assoc. Diseases</span>
                          <span className="font-bold text-rose-800 text-sm">
                            {target.diseaseIds.length} diseases
                          </span>
                          <div className="text-[10px] text-rose-600 truncate mt-0.5">
                            {diseaseObjects.map((d) => d.name).join(', ') || 'None'}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Card Actions: Coords & View Target */}
                    <div className="mt-4 pt-3 border-t border-slate-100 space-y-2.5">
                      {/* Structure Downloads */}
                      <div className="flex items-center justify-between text-[11px] font-mono">
                        <span className="text-slate-400 flex items-center gap-1">
                          <Download className="w-3 h-3" /> Coords:
                        </span>
                        <div className="flex items-center space-x-1">
                          <button
                            onClick={() => handleDownloadTarget(target, 'pdb')}
                            className="px-1.5 py-0.5 rounded bg-slate-100 hover:bg-blue-100 hover:text-blue-800 text-slate-700 transition-colors"
                          >
                            {downloadingId === `${target.geneSymbol}-pdb` ? '✓' : '.PDB'}
                          </button>
                          <button
                            onClick={() => handleDownloadTarget(target, 'fasta')}
                            className="px-1.5 py-0.5 rounded bg-slate-100 hover:bg-blue-100 hover:text-blue-800 text-slate-700 transition-colors"
                          >
                            {downloadingId === `${target.geneSymbol}-fasta` ? '✓' : '.FASTA'}
                          </button>
                        </div>
                      </div>

                      {/* Main Button: View Target & Predict */}
                      <div className="flex items-center space-x-2">
                        <Link
                          to={`/targets/${target.id}`}
                          className="flex-1 inline-flex items-center justify-center space-x-1.5 py-2 px-3 rounded-lg bg-[#1E3A8A] hover:bg-[#1B365D] text-white font-medium text-xs shadow-sm transition-colors"
                        >
                          <span>View Target</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                        <button
                          onClick={() => handlePredictWithTarget(target.geneSymbol, target.proteinName, target.pdbId)}
                          className="p-2 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 transition-colors"
                          title="Predict Interaction Assay"
                        >
                          <Sparkles className="w-4 h-4 text-blue-700" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        /* TABLE VIEW OPTION */
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          {filteredTargets.length === 0 ? (
            <div className="p-12 text-center space-y-2">
              <Crosshair className="w-8 h-8 text-slate-300 mx-auto" />
              <h3 className="text-sm font-semibold text-slate-700">No interaction records found</h3>
              <p className="text-xs text-slate-400">Try adjusting your search criteria or switch to PDB Live Search.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-mono uppercase tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4 font-semibold">Target / Gene</th>
                    <th className="py-3 px-4 font-semibold">Protein Name</th>
                    <th className="py-3 px-4 font-semibold">Target Class</th>
                    <th className="py-3 px-4 font-semibold">Associated Drugs</th>
                    <th className="py-3 px-4 font-semibold">Associated Diseases</th>
                    <th className="py-3 px-4 font-semibold">Download Coords</th>
                    <th className="py-3 px-4 text-right font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredTargets.map((target) => (
                    <tr key={target.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        <Link to={`/targets/${target.id}`} className="hover:text-blue-700">
                          {target.geneSymbol}
                        </Link>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {target.id} &bull; UniProt: {target.uniprotId}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-700 max-w-[200px] truncate">
                        {target.proteinName}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-medium text-blue-900">
                        {target.targetClass}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-medium text-teal-800">
                        {target.drugIds.join(', ')}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-rose-800">
                        {target.diseaseIds.length} diseases
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center space-x-1 font-mono text-[10px]">
                          <button
                            onClick={() => handleDownloadTarget(target, 'pdb')}
                            className="px-1.5 py-0.5 rounded bg-slate-100 hover:bg-blue-100 hover:text-blue-800 text-slate-700 transition-colors"
                          >
                            .PDB
                          </button>
                          <button
                            onClick={() => handleDownloadTarget(target, 'fasta')}
                            className="px-1.5 py-0.5 rounded bg-slate-100 hover:bg-blue-100 hover:text-blue-800 text-slate-700 transition-colors"
                          >
                            .FASTA
                          </button>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <Link
                          to={`/targets/${target.id}`}
                          className="inline-flex items-center space-x-1 px-3 py-1 rounded bg-[#1E3A8A] hover:bg-[#1B365D] text-white font-medium text-xs transition-colors"
                        >
                          <span>View Target</span>
                          <ChevronRight className="w-3 h-3" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
