import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  ArrowUpDown,
  ChevronRight,
  Crosshair,
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
  SlidersHorizontal,
  Sparkles,
  FileCode,
  FileText,
  Check,
  ArrowRight,
} from 'lucide-react';
import { DRUGS, TARGETS, DISEASES, INTERACTIONS } from '../data/dataset';
import {
  searchPubChem,
  triggerFileDownload,
  downloadRemoteFile,
  generateSyntheticSdf,
  type PubChemCompound,
} from '../services/bioDataService';

export const DrugSearchPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Search Mode: 'curated' | 'pubchem'
  const [searchMode, setSearchMode] = useState<'curated' | 'pubchem'>('curated');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '');
  const [selectedClass, setSelectedClass] = useState('ALL');
  const [selectedType, setSelectedType] = useState('ALL');
  const [selectedTargetClass, setSelectedTargetClass] = useState('ALL');
  const [selectedDisease, setSelectedDisease] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [sortBy, setSortBy] = useState<'name' | 'targets' | 'diseases' | 'interactions'>('name');

  // PubChem live query state
  const [pubchemResults, setPubchemResults] = useState<PubChemCompound[]>([]);
  const [isPubchemLoading, setIsPubchemLoading] = useState(false);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  // Auto trigger PubChem query if starting in or switching to pubchem mode
  useEffect(() => {
    if (searchMode === 'pubchem' && searchTerm.trim().length >= 2) {
      handlePubChemSearch(searchTerm);
    }
  }, [searchMode]);

  const handlePubChemSearch = async (termToSearch: string) => {
    const q = termToSearch.trim() || 'Imatinib';
    setIsPubchemLoading(true);
    try {
      const results = await searchPubChem(q);
      setPubchemResults(results);
    } catch (e) {
      console.error('PubChem search failed:', e);
    } finally {
      setIsPubchemLoading(false);
    }
  };

  const handleDownloadDrug = async (
    drug: { name: string; id: string; smiles?: string; molecularWeight?: number; formula?: string; cid?: number },
    format: 'sdf' | 'mol' | 'smi' | 'json'
  ) => {
    const downloadKey = `${drug.id}-${format}`;
    setDownloadingId(downloadKey);
    try {
      const smiles = drug.smiles || 'CC1=C(C=C(C=C1)NC(=O)C2=CC=C(C=C2)CN3CCN(CC3)C)NC4=NC=CC(=N4)C5=CN=CC=C5';
      const formula = drug.formula || 'C29H31N7O';
      const mw = drug.molecularWeight || 493.6;

      if (format === 'sdf') {
        if (drug.cid) {
          const directUrl = `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/${drug.cid}/SDF`;
          const fallback = generateSyntheticSdf({ title: drug.name, smiles, molecularFormula: formula, molecularWeight: mw, cid: drug.cid });
          await downloadRemoteFile(directUrl, `${drug.name.replace(/\s+/g, '_')}_PubChem_${drug.cid}.sdf`, fallback);
        } else {
          const content = generateSyntheticSdf({ title: drug.name, smiles, molecularFormula: formula, molecularWeight: mw });
          triggerFileDownload(content, `${drug.name.replace(/\s+/g, '_')}_${drug.id}.sdf`, 'chemical/x-mdl-sdfile');
        }
      } else if (format === 'mol') {
        const content = generateSyntheticSdf({ title: drug.name, smiles, molecularFormula: formula, molecularWeight: mw });
        triggerFileDownload(content, `${drug.name.replace(/\s+/g, '_')}.mol`, 'chemical/x-mdl-molfile');
      } else if (format === 'smi') {
        const smiContent = `${smiles}\t${drug.name}\t${drug.id}\n`;
        triggerFileDownload(smiContent, `${drug.name.replace(/\s+/g, '_')}.smi`, 'text/plain');
      } else if (format === 'json') {
        const jsonContent = JSON.stringify(drug, null, 2);
        triggerFileDownload(jsonContent, `${drug.name.replace(/\s+/g, '_')}_descriptor.json`, 'application/json');
      }
    } finally {
      setTimeout(() => setDownloadingId(null), 1000);
    }
  };

  const handlePredictWithDrug = (drugName: string, drugId: string, smiles?: string) => {
    navigate(`/analysis/interaction?drug=${encodeURIComponent(drugId)}&drugName=${encodeURIComponent(drugName)}&smiles=${encodeURIComponent(smiles || '')}&mode=predict`);
  };

  // Filter curated drugs
  const filteredDrugs = DRUGS.filter((drug) => {
    const matchesSearch =
      drug.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      drug.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (drug.brandName ? drug.brandName.toLowerCase().includes(searchTerm.toLowerCase()) : false) ||
      drug.mechanismOfAction.toLowerCase().includes(searchTerm.toLowerCase()) ||
      drug.therapeuticClass.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesClass = selectedClass === 'ALL' || drug.therapeuticClass === selectedClass;
    const matchesType = selectedType === 'ALL' || drug.type === selectedType;

    const matchesTargetClass =
      selectedTargetClass === 'ALL' ||
      drug.targetIds.some((tId) => {
        const target = TARGETS.find((t) => t.id === tId || t.geneSymbol === tId);
        return target && target.targetClass === selectedTargetClass;
      });

    const matchesDisease =
      selectedDisease === 'ALL' ||
      drug.diseaseIds.includes(selectedDisease);

    const matchesStatus =
      selectedStatus === 'ALL' ||
      (selectedStatus === 'Approved' && drug.approvalStatus?.toLowerCase().includes('approved')) ||
      (selectedStatus === 'Investigational' && !drug.approvalStatus?.toLowerCase().includes('approved'));

    return matchesSearch && matchesClass && matchesType && matchesTargetClass && matchesDisease && matchesStatus;
  }).sort((a, b) => {
    if (sortBy === 'name') return a.name.localeCompare(b.name);
    if (sortBy === 'targets') return b.targetIds.length - a.targetIds.length;
    if (sortBy === 'diseases') return b.diseaseIds.length - a.diseaseIds.length;
    if (sortBy === 'interactions') {
      const aInt = INTERACTIONS.filter((i) => i.drugId === a.id).length;
      const bInt = INTERACTIONS.filter((i) => i.drugId === b.id).length;
      return bInt - aInt;
    }
    return 0;
  });

  const targetClasses = Array.from(new Set(TARGETS.map((t) => t.targetClass)));

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* 1. Header with Scientific Badge & Actions */}
      <div className="border-b border-slate-200 pb-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2.5">
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                Drug Explorer
              </h1>
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-blue-50 text-blue-700 border border-blue-200">
                Chemoinformatics Catalog
              </span>
            </div>
            <p className="text-sm text-slate-500 mt-1">
              Discover and investigate drug compounds, structural descriptors, known kinase targets, and clinical indications.
            </p>
          </div>

          {/* Quick Action: Jump to Predict Interaction */}
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
              Curated Library ({DRUGS.length} Validated Drugs)
            </button>
            <button
              onClick={() => {
                setSearchMode('pubchem');
                if (pubchemResults.length === 0) {
                  handlePubChemSearch(searchTerm || 'Imatinib');
                }
              }}
              className={`inline-flex items-center space-x-1.5 px-4 py-2 rounded-lg text-xs font-medium transition-all ${
                searchMode === 'pubchem'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>PubChem NIH Database (Live 110M+ Compounds)</span>
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

      {/* 2. Search and Filter Bar */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
        {/* Search Input */}
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && searchMode === 'pubchem') {
                  handlePubChemSearch(searchTerm);
                }
              }}
              placeholder="Search by drug name, identifier, mechanism or therapeutic class..."
              className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-10 pr-4 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all"
            />
          </div>

          {searchMode === 'pubchem' ? (
            <button
              onClick={() => handlePubChemSearch(searchTerm)}
              disabled={isPubchemLoading}
              className="inline-flex items-center justify-center space-x-1.5 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors"
            >
              {isPubchemLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Searching PubChem...</span>
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  <span>Search PubChem</span>
                </>
              )}
            </button>
          ) : (
            <button
              onClick={() => {
                setSearchMode('pubchem');
                handlePubChemSearch(searchTerm || 'Imatinib');
              }}
              className="inline-flex items-center justify-center space-x-1.5 px-4 py-2 bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 rounded-lg text-xs font-medium border border-slate-200 transition-colors"
            >
              <Globe className="w-3.5 h-3.5 text-blue-600" />
              <span>Query PubChem</span>
            </button>
          )}
        </div>

        {/* Curated Filters: Drug Type, Therapeutic Class, Target Class, Disease Area, Development Status */}
        {searchMode === 'curated' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-1">
            {/* Drug Type */}
            <div>
              <label className="block text-[11px] font-mono text-slate-500 mb-1">Drug Type</label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 focus:outline-none focus:bg-white focus:border-blue-600"
              >
                <option value="ALL">All Types</option>
                <option value="Small Molecule">Small Molecule</option>
                <option value="Monoclonal Antibody">Monoclonal Antibody</option>
              </select>
            </div>

            {/* Therapeutic Class */}
            <div>
              <label className="block text-[11px] font-mono text-slate-500 mb-1">Therapeutic Class</label>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 focus:outline-none focus:bg-white focus:border-blue-600"
              >
                <option value="ALL">All Classes</option>
                <option value="Oncology / Tyrosine Kinase Inhibitor">Tyrosine Kinase Inhibitor</option>
                <option value="Oncology / HER2-Targeted Therapy">HER2-Targeted Therapy</option>
                <option value="Oncology / Selective Estrogen Receptor Modulator">SERM Modulator</option>
                <option value="Immunology & Oncology / Antifolate Antimetabolite">Antifolate Antimetabolite</option>
                <option value="Immunology & Oncology / Anti-CD20">Anti-CD20 Biologic</option>
              </select>
            </div>

            {/* Target Class */}
            <div>
              <label className="block text-[11px] font-mono text-slate-500 mb-1">Target Class</label>
              <select
                value={selectedTargetClass}
                onChange={(e) => setSelectedTargetClass(e.target.value)}
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

            {/* Disease Area */}
            <div>
              <label className="block text-[11px] font-mono text-slate-500 mb-1">Disease Area</label>
              <select
                value={selectedDisease}
                onChange={(e) => setSelectedDisease(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 focus:outline-none focus:bg-white focus:border-blue-600"
              >
                <option value="ALL">All Diseases</option>
                {DISEASES.map((dis) => (
                  <option key={dis.id} value={dis.id}>
                    {dis.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Development Status */}
            <div>
              <label className="block text-[11px] font-mono text-slate-500 mb-1">Development Status</label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 focus:outline-none focus:bg-white focus:border-blue-600"
              >
                <option value="ALL">All Statuses</option>
                <option value="Approved">FDA Approved</option>
                <option value="Investigational">Investigational</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* 3. Results Section */}
      {searchMode === 'pubchem' ? (
        /* LIVE PUBCHEM NIH RESULTS */
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-500 font-mono px-1">
            <span>NIH PubChem PUG-REST Results for: &ldquo;{searchTerm || 'Curated Compounds'}&rdquo;</span>
            <span>{pubchemResults.length} compounds retrieved</span>
          </div>

          {isPubchemLoading ? (
            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center space-y-3">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto" />
              <p className="text-sm font-semibold text-slate-800">Connecting to NIH PubChem Database...</p>
              <p className="text-xs text-slate-400">Fetching 2D molecular structures, SMILES, and 3D coordinate sets.</p>
            </div>
          ) : pubchemResults.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center space-y-2">
              <Pill className="w-8 h-8 text-slate-300 mx-auto" />
              <h3 className="text-sm font-semibold text-slate-700">No PubChem compounds found</h3>
              <p className="text-xs text-slate-400">Try searching a different chemical or drug name (e.g. Aspirin, Osimertinib, Nilotinib).</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pubchemResults.map((compound) => (
                <div
                  key={compound.cid}
                  className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow p-5 flex flex-col justify-between"
                >
                  <div className="flex gap-4">
                    <div className="w-28 h-28 rounded-lg bg-slate-50 border border-slate-200 flex-shrink-0 flex items-center justify-center p-1 overflow-hidden">
                      <img
                        src={compound.imageUrl}
                        alt={compound.title}
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                    </div>

                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="text-sm font-bold text-slate-900 truncate">
                          {compound.title}
                        </h3>
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono bg-blue-50 text-blue-700 border border-blue-200">
                          CID: {compound.cid}
                        </span>
                      </div>

                      <p className="text-[11px] text-slate-500 font-mono truncate">
                        Formula: <span className="text-slate-800 font-semibold">{compound.molecularFormula}</span> &bull; MW: {compound.molecularWeight} g/mol
                      </p>

                      <div className="bg-slate-50 rounded p-1.5 font-mono text-[10px] text-slate-600 truncate">
                        <span className="text-slate-400">SMILES:</span> {compound.smiles}
                      </div>

                      <p className="text-[10px] text-slate-400 truncate">
                        {compound.iupacName}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center space-x-1.5 text-xs">
                      <span className="text-[11px] text-slate-400 font-mono flex items-center gap-1">
                        <Download className="w-3.5 h-3.5" />
                        Download:
                      </span>
                      <button
                        onClick={() => handleDownloadDrug({ name: compound.title, id: `CID-${compound.cid}`, smiles: compound.smiles, formula: compound.molecularFormula, molecularWeight: compound.molecularWeight, cid: compound.cid }, 'sdf')}
                        className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono text-[11px] transition-colors"
                        title="Structure-Data File (.sdf)"
                      >
                        {downloadingId === `CID-${compound.cid}-sdf` ? '✓' : '.SDF'}
                      </button>
                      <button
                        onClick={() => handleDownloadDrug({ name: compound.title, id: `CID-${compound.cid}`, smiles: compound.smiles, formula: compound.molecularFormula, molecularWeight: compound.molecularWeight, cid: compound.cid }, 'mol')}
                        className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono text-[11px] transition-colors"
                        title="MDL Molfile (.mol)"
                      >
                        {downloadingId === `CID-${compound.cid}-mol` ? '✓' : '.MOL'}
                      </button>
                      <button
                        onClick={() => handleDownloadDrug({ name: compound.title, id: `CID-${compound.cid}`, smiles: compound.smiles, formula: compound.molecularFormula, molecularWeight: compound.molecularWeight, cid: compound.cid }, 'smi')}
                        className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono text-[11px] transition-colors"
                        title="Canonical SMILES (.smi)"
                      >
                        {downloadingId === `CID-${compound.cid}-smi` ? '✓' : '.SMI'}
                      </button>
                    </div>

                    <button
                      onClick={() => handlePredictWithDrug(compound.title, `CID-${compound.cid}`, compound.smiles)}
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
            <span>Showing {filteredDrugs.length} investigational compounds</span>
            <span>Sorted by: {sortBy.toUpperCase()}</span>
          </div>

          {filteredDrugs.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center space-y-2">
              <Pill className="w-8 h-8 text-slate-300 mx-auto" />
              <h3 className="text-sm font-semibold text-slate-700">No drug records found</h3>
              <p className="text-xs text-slate-400">Try adjusting your filters or search keywords.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredDrugs.map((drug) => {
                const drugInteractions = INTERACTIONS.filter((i) => i.drugId === drug.id);
                const targetObjects = TARGETS.filter((t) => drug.targetIds.includes(t.id));
                const diseaseObjects = DISEASES.filter((d) => drug.diseaseIds.includes(d.id));

                return (
                  <div
                    key={drug.id}
                    className="bg-white rounded-xl border border-slate-200 hover:border-blue-400 shadow-sm hover:shadow-md transition-all p-5 flex flex-col justify-between"
                  >
                    <div>
                      {/* Top Badges */}
                      <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-100">
                        <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200">
                          {drug.id}
                        </span>
                        <span className="font-mono text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                          {drug.type}
                        </span>
                      </div>

                      {/* Drug Name & Brand */}
                      <div className="mt-3">
                        <h2 className="text-base font-bold text-slate-900 group-hover:text-blue-700">
                          {drug.name}
                        </h2>
                        <p className="text-xs text-slate-400 font-medium">
                          Brand: {drug.brandName} &bull; {drug.approvalStatus}
                        </p>
                      </div>

                      {/* Therapeutic Class */}
                      <div className="mt-2.5">
                        <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">
                          Therapeutic Class
                        </span>
                        <p className="text-xs font-semibold text-blue-900 mt-0.5 line-clamp-1">
                          {drug.therapeuticClass}
                        </p>
                      </div>

                      {/* Mechanism */}
                      <div className="mt-2.5 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                        <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">
                          Mechanism
                        </span>
                        <p className="text-xs text-slate-700 mt-0.5 line-clamp-2 leading-relaxed">
                          {drug.mechanismOfAction}
                        </p>
                      </div>

                      {/* Metrics: Known Targets & Associated Diseases */}
                      <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-slate-100 font-mono text-xs">
                        <div className="p-2 rounded bg-slate-50 border border-slate-100">
                          <span className="text-[10px] text-slate-400 block">Known Targets</span>
                          <span className="font-bold text-teal-800 text-sm">
                            {drug.targetIds.length} targets
                          </span>
                          <div className="text-[10px] text-teal-600 truncate mt-0.5">
                            {targetObjects.map((t) => t.geneSymbol).join(', ') || 'None'}
                          </div>
                        </div>

                        <div className="p-2 rounded bg-slate-50 border border-slate-100">
                          <span className="text-[10px] text-slate-400 block">Assoc. Diseases</span>
                          <span className="font-bold text-rose-800 text-sm">
                            {drug.diseaseIds.length} diseases
                          </span>
                          <div className="text-[10px] text-rose-600 truncate mt-0.5">
                            {diseaseObjects.map((d) => d.name).join(', ') || 'None'}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Card Actions: Downloads & View Profile */}
                    <div className="mt-4 pt-3 border-t border-slate-100 space-y-2.5">
                      {/* Structure Downloads */}
                      <div className="flex items-center justify-between text-[11px] font-mono">
                        <span className="text-slate-400 flex items-center gap-1">
                          <Download className="w-3 h-3" /> Export:
                        </span>
                        <div className="flex items-center space-x-1">
                          <button
                            onClick={() => handleDownloadDrug(drug, 'sdf')}
                            className="px-1.5 py-0.5 rounded bg-slate-100 hover:bg-blue-100 hover:text-blue-800 text-slate-700 transition-colors"
                          >
                            {downloadingId === `${drug.id}-sdf` ? '✓' : '.SDF'}
                          </button>
                          <button
                            onClick={() => handleDownloadDrug(drug, 'mol')}
                            className="px-1.5 py-0.5 rounded bg-slate-100 hover:bg-blue-100 hover:text-blue-800 text-slate-700 transition-colors"
                          >
                            {downloadingId === `${drug.id}-mol` ? '✓' : '.MOL'}
                          </button>
                          <button
                            onClick={() => handleDownloadDrug(drug, 'smi')}
                            className="px-1.5 py-0.5 rounded bg-slate-100 hover:bg-blue-100 hover:text-blue-800 text-slate-700 transition-colors"
                          >
                            {downloadingId === `${drug.id}-smi` ? '✓' : '.SMI'}
                          </button>
                        </div>
                      </div>

                      {/* Main Button: View Drug Profile & Predict */}
                      <div className="flex items-center space-x-2">
                        <Link
                          to={`/drugs/${drug.id}`}
                          className="flex-1 inline-flex items-center justify-center space-x-1.5 py-2 px-3 rounded-lg bg-[#1E3A8A] hover:bg-[#1B365D] text-white font-medium text-xs shadow-sm transition-colors"
                        >
                          <span>View Drug Profile</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                        <button
                          onClick={() => handlePredictWithDrug(drug.name, drug.id)}
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
          {filteredDrugs.length === 0 ? (
            <div className="p-12 text-center space-y-2">
              <Pill className="w-8 h-8 text-slate-300 mx-auto" />
              <h3 className="text-sm font-semibold text-slate-700">No interaction records found</h3>
              <p className="text-xs text-slate-400">Try adjusting your search criteria or switch to PubChem Live Search.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-mono uppercase tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4 font-semibold">Drug Name</th>
                    <th className="py-3 px-4 font-semibold">Drug ID</th>
                    <th className="py-3 px-4 font-semibold">Drug Type</th>
                    <th className="py-3 px-4 font-semibold">Therapeutic Class</th>
                    <th className="py-3 px-4 font-semibold">Known Targets</th>
                    <th className="py-3 px-4 font-semibold">Diseases</th>
                    <th className="py-3 px-4 font-semibold">Download File</th>
                    <th className="py-3 px-4 text-right font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredDrugs.map((drug) => {
                    const drugInteractions = INTERACTIONS.filter((i) => i.drugId === drug.id);
                    return (
                      <tr key={drug.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3.5 px-4 font-medium text-slate-900">
                          <Link
                            to={`/drugs/${drug.id}`}
                            className="font-bold text-slate-900 hover:text-blue-700 transition-colors block text-xs"
                          >
                            {drug.name}
                          </Link>
                          <span className="text-[10px] text-slate-400 font-mono">
                            Brand: {drug.brandName}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-slate-600">
                          {drug.id}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="inline-block px-2 py-0.5 rounded text-[10px] font-mono bg-slate-100 text-slate-700">
                            {drug.type}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-600 max-w-[180px] truncate">
                          {drug.therapeuticClass}
                        </td>
                        <td className="py-3.5 px-4 font-mono font-medium text-teal-800">
                          {drug.targetIds.join(', ')}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-rose-800">
                          {drug.diseaseIds.length} diseases
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center space-x-1 font-mono text-[10px]">
                            <button
                              onClick={() => handleDownloadDrug(drug, 'sdf')}
                              className="px-1.5 py-0.5 rounded bg-slate-100 hover:bg-blue-100 hover:text-blue-800 text-slate-700 transition-colors"
                            >
                              .SDF
                            </button>
                            <button
                              onClick={() => handleDownloadDrug(drug, 'mol')}
                              className="px-1.5 py-0.5 rounded bg-slate-100 hover:bg-blue-100 hover:text-blue-800 text-slate-700 transition-colors"
                            >
                              .MOL
                            </button>
                            <button
                              onClick={() => handleDownloadDrug(drug, 'smi')}
                              className="px-1.5 py-0.5 rounded bg-slate-100 hover:bg-blue-100 hover:text-blue-800 text-slate-700 transition-colors"
                            >
                              .SMI
                            </button>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <Link
                            to={`/drugs/${drug.id}`}
                            className="inline-flex items-center space-x-1 px-3 py-1 rounded bg-[#1E3A8A] hover:bg-[#1B365D] text-white font-medium text-xs transition-colors"
                          >
                            <span>View Drug Profile</span>
                            <ChevronRight className="w-3 h-3" />
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
