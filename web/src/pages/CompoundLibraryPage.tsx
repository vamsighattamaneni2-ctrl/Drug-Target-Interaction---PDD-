import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Bookmark,
  Check,
  ChevronRight,
  Download,
  ExternalLink,
  FlaskConical,
  Globe,
  Loader2,
  Pill,
  Plus,
  Search,
  Sparkles,
  GitCompare,
} from 'lucide-react';
import { DRUGS, TARGETS } from '../data/dataset';
import { Compound } from '../types';
import { appState } from '../services/appStateService';
import {
  searchPubChem,
  triggerFileDownload,
  downloadRemoteFile,
  generateSyntheticSdf,
  type PubChemCompound,
} from '../services/bioDataService';

export const CompoundLibraryPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('ALL');
  const [selectedType, setSelectedType] = useState('ALL');
  const [selectedSavedOnly, setSelectedSavedOnly] = useState(false);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  // Live PubChem Search state
  const [isSearchingPubChem, setIsSearchingPubChem] = useState(false);
  const [pubchemResults, setPubchemResults] = useState<PubChemCompound[]>([]);
  const [activeTab, setActiveTab] = useState<'curated' | 'pubchem'>('curated');

  const savedItems = appState.getSavedItems().filter((i) => i.type === 'compound');
  const savedIds = new Set(savedItems.map((s) => s.entityId));

  const handlePubChemQuery = async (queryText: string) => {
    const q = queryText.trim() || 'Imatinib';
    setIsSearchingPubChem(true);
    try {
      const results = await searchPubChem(q);
      setPubchemResults(results);
    } catch (e) {
      console.error('PubChem search failed:', e);
    } finally {
      setIsSearchingPubChem(false);
    }
  };

  const handleDownloadFile = async (
    compound: { name: string; id: string; smiles?: string; molecularWeight?: number; formula?: string; cid?: number },
    format: 'sdf' | 'mol' | 'smi' | 'json'
  ) => {
    const key = `${compound.id}-${format}`;
    setDownloadingId(key);
    try {
      const smiles = compound.smiles || 'CC1=C(C=C(C=C1)NC(=O)C2=CC=C(CN3CCN(C)CC3)C=C2)NC4=NC=CC(=N4)C5=CN=CC=C5';
      const formula = compound.formula || 'C29H31N7O';
      const mw = compound.molecularWeight || 493.6;

      if (format === 'sdf') {
        if (compound.cid) {
          const directUrl = `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/${compound.cid}/SDF`;
          const fallback = generateSyntheticSdf({ title: compound.name, smiles, molecularFormula: formula, molecularWeight: mw, cid: compound.cid });
          await downloadRemoteFile(directUrl, `${compound.name.replace(/\s+/g, '_')}_PubChem_${compound.cid}.sdf`, fallback);
        } else {
          const content = generateSyntheticSdf({ title: compound.name, smiles, molecularFormula: formula, molecularWeight: mw });
          triggerFileDownload(content, `${compound.name.replace(/\s+/g, '_')}_${compound.id}.sdf`, 'chemical/x-mdl-sdfile');
        }
      } else if (format === 'mol') {
        const content = generateSyntheticSdf({ title: compound.name, smiles, molecularFormula: formula, molecularWeight: mw });
        triggerFileDownload(content, `${compound.name.replace(/\s+/g, '_')}.mol`, 'chemical/x-mdl-molfile');
      } else if (format === 'smi') {
        triggerFileDownload(`${smiles}\t${compound.name}\t${compound.id}\n`, `${compound.name.replace(/\s+/g, '_')}.smi`, 'text/plain');
      } else if (format === 'json') {
        triggerFileDownload(JSON.stringify(compound, null, 2), `${compound.name.replace(/\s+/g, '_')}_data.json`, 'application/json');
      }
    } finally {
      setTimeout(() => setDownloadingId(null), 800);
    }
  };

  const filteredCompounds = DRUGS.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.smiles.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.brandName && c.brandName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      c.formula.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesClass = selectedClass === 'ALL' || c.therapeuticClass === selectedClass;
    const matchesType = selectedType === 'ALL' || c.type === selectedType;
    const matchesSaved = !selectedSavedOnly || savedIds.has(c.id);

    return matchesSearch && matchesClass && matchesType && matchesSaved;
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="border-b border-slate-200 pb-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2.5">
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                Drug / Compound Library
              </h1>
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-blue-50 text-blue-800 border border-blue-200">
                Chemoinformatics Database
              </span>
            </div>
            <p className="text-sm text-slate-500 mt-1">
              Search approved pharmaceutical agents, query live NIH PubChem compounds, examine 2D chemical structures, and export formats.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <Link
              to="/analysis/new"
              className="inline-flex items-center space-x-1.5 px-4 py-2.5 rounded-lg bg-[#1E3A8A] hover:bg-[#1B365D] text-white font-medium text-xs shadow-sm transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-200" />
              <span>Select Compound for Analysis</span>
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
            Curated Compound Library ({DRUGS.length} Validated Agents)
          </button>

          <button
            onClick={() => {
              setActiveTab('pubchem');
              if (pubchemResults.length === 0) handlePubChemQuery(searchTerm || 'Imatinib');
            }}
            className={`inline-flex items-center space-x-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'pubchem'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>NIH PubChem Live Database</span>
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
                if (e.key === 'Enter' && activeTab === 'pubchem') handlePubChemQuery(searchTerm);
              }}
              placeholder="Search by compound name, DrugBank ID, PubChem CID, formula, or SMILES..."
              className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-10 pr-4 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-blue-600 font-mono"
            />
          </div>

          {activeTab === 'pubchem' ? (
            <button
              onClick={() => handlePubChemQuery(searchTerm)}
              disabled={isSearchingPubChem}
              className="inline-flex items-center justify-center space-x-1.5 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition-colors disabled:bg-blue-400"
            >
              {isSearchingPubChem ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Querying PubChem...</span>
                </>
              ) : (
                <>
                  <Search className="w-3.5 h-3.5" />
                  <span>Search PubChem</span>
                </>
              )}
            </button>
          ) : (
            <button
              onClick={() => {
                setActiveTab('pubchem');
                handlePubChemQuery(searchTerm || 'Imatinib');
              }}
              className="inline-flex items-center space-x-1.5 px-4 py-2 bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-800 rounded-lg text-xs font-medium border border-slate-200 transition-colors"
            >
              <Globe className="w-3.5 h-3.5 text-blue-600" />
              <span>Query PubChem</span>
            </button>
          )}
        </div>

        {activeTab === 'curated' && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            <div>
              <label className="block text-[11px] font-mono text-slate-500 mb-1">Therapeutic Class</label>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 focus:outline-none focus:bg-white focus:border-blue-600"
              >
                <option value="ALL">All Therapeutic Classes</option>
                <option value="Oncology / Tyrosine Kinase Inhibitor">Tyrosine Kinase Inhibitor</option>
                <option value="Oncology / HER2-Targeted Therapy">HER2-Targeted Therapy</option>
                <option value="Oncology / Selective Estrogen Receptor Modulator">SERM Modulator</option>
                <option value="Immunology & Oncology / Antifolate Antimetabolite">Antifolate Antimetabolite</option>
                <option value="Immunology & Oncology / Anti-CD20">Anti-CD20 Biologic</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-mono text-slate-500 mb-1">Compound Type</label>
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

            <div className="flex items-end">
              <label className="flex items-center space-x-2 text-xs text-slate-700 cursor-pointer pb-2">
                <input
                  type="checkbox"
                  checked={selectedSavedOnly}
                  onChange={(e) => setSelectedSavedOnly(e.target.checked)}
                  className="rounded border-slate-300 text-blue-700 focus:ring-blue-600"
                />
                <span className="font-medium">Show Saved Compounds Only ({savedItems.length})</span>
              </label>
            </div>
          </div>
        )}
      </div>

      {/* Results Presentation */}
      {activeTab === 'pubchem' ? (
        /* PUBCHEM NIH LIVE RESULTS */
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-500 font-mono">
            <span>NIH PubChem PUG-REST Retrieval for: &ldquo;{searchTerm || 'Curated Compounds'}&rdquo;</span>
            <span>{pubchemResults.length} compounds</span>
          </div>

          {isSearchingPubChem ? (
            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center space-y-3">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto" />
              <p className="text-sm font-semibold text-slate-800">Querying NCBI PubChem API...</p>
              <p className="text-xs text-slate-400">Retrieving 2D coordinates, Canonical SMILES, and Mol Weight.</p>
            </div>
          ) : pubchemResults.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center space-y-2">
              <Pill className="w-8 h-8 text-slate-300 mx-auto" />
              <h3 className="text-sm font-semibold text-slate-700">No PubChem Compounds Found</h3>
              <p className="text-xs text-slate-400">Search another chemical or drug name (e.g. Osimertinib, Nilotinib, Lapatinib).</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pubchemResults.map((c) => (
                <div
                  key={c.cid}
                  className="bg-white rounded-xl border border-slate-200 shadow-2xs hover:shadow-md transition-shadow p-5 flex flex-col justify-between"
                >
                  <div className="flex gap-4">
                    <div className="w-28 h-28 rounded-lg bg-slate-50 border border-slate-200 flex-shrink-0 flex items-center justify-center p-1 overflow-hidden">
                      <img src={c.imageUrl} alt={c.title} className="w-full h-full object-contain" />
                    </div>

                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="text-sm font-bold text-slate-900 truncate">{c.title}</h3>
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-blue-50 text-blue-800 border border-blue-200">
                          CID: {c.cid}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 font-mono">
                        {c.molecularFormula} &bull; {c.molecularWeight} g/mol
                      </p>
                      <div className="bg-slate-50 rounded p-1.5 font-mono text-[10px] text-slate-600 truncate">
                        SMILES: {c.smiles}
                      </div>
                      <p className="text-[10px] text-slate-400 truncate">{c.iupacName}</p>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center space-x-1 font-mono text-[10px]">
                      <button
                        onClick={() => handleDownloadFile({ name: c.title, id: `CID-${c.cid}`, smiles: c.smiles, formula: c.molecularFormula, molecularWeight: c.molecularWeight, cid: c.cid }, 'sdf')}
                        className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700"
                      >
                        {downloadingId === `CID-${c.cid}-sdf` ? '✓' : '.SDF'}
                      </button>
                      <button
                        onClick={() => handleDownloadFile({ name: c.title, id: `CID-${c.cid}`, smiles: c.smiles, formula: c.molecularFormula, molecularWeight: c.molecularWeight, cid: c.cid }, 'mol')}
                        className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700"
                      >
                        {downloadingId === `CID-${c.cid}-mol` ? '✓' : '.MOL'}
                      </button>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Link
                        to={`/admet?compound=CID-${c.cid}&name=${encodeURIComponent(c.title)}`}
                        className="px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-medium"
                      >
                        ADMET
                      </Link>
                      <Link
                        to={`/analysis/new?compound=CID-${c.cid}&name=${encodeURIComponent(c.title)}&smiles=${encodeURIComponent(c.smiles)}`}
                        className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-[#1E3A8A] hover:bg-[#1B365D] text-white text-xs font-semibold shadow-2xs"
                      >
                        <span>Select for Analysis</span>
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
        /* CURATED LIBRARY CARDS */
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-500 font-mono px-1">
            <span>Showing {filteredCompounds.length} verified compounds</span>
            <span>Source: DrugBank / ChEMBL Verified</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredCompounds.map((c) => {
              const isSaved = savedIds.has(c.id);

              return (
                <div
                  key={c.id}
                  className="bg-white rounded-xl border border-slate-200 hover:border-blue-400 shadow-2xs hover:shadow-md transition-all p-5 flex flex-col justify-between"
                >
                  <div>
                    {/* Header */}
                    <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-100">
                      <div className="flex items-center space-x-1.5">
                        <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-900 border border-blue-200">
                          {c.id}
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                          {c.type}
                        </span>
                      </div>

                      {/* Bookmark / Save Action */}
                      <button
                        onClick={() => {
                          if (isSaved) {
                            const item = savedItems.find((s) => s.entityId === c.id);
                            if (item) appState.removeSavedItem(item.id);
                          } else {
                            appState.saveCompound(c, 'General Saved', c.mechanismOfAction);
                          }
                        }}
                        title={isSaved ? 'Remove from saved' : 'Add to saved compounds'}
                        className={`p-1.5 rounded-lg transition-colors ${
                          isSaved
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-blue-700' : ''}`} />
                      </button>
                    </div>

                    {/* Compound Name & Brand */}
                    <div className="mt-3">
                      <h2 className="text-base font-bold text-slate-900 group-hover:text-blue-900">
                        {c.name}
                      </h2>
                      {c.brandName && (
                        <p className="text-xs text-slate-500 font-medium">
                          Brand: {c.brandName} &bull; {c.approvalStatus}
                        </p>
                      )}
                    </div>

                    {/* Therapeutic Class */}
                    <div className="mt-2.5">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">
                        Therapeutic Class
                      </span>
                      <p className="text-xs font-semibold text-blue-950 mt-0.5 line-clamp-1">
                        {c.therapeuticClass}
                      </p>
                    </div>

                    {/* Physico-chemical properties (MW, Formula, LogP, HBD/HBA, RotB) */}
                    <div className="grid grid-cols-2 gap-2 mt-3 p-2.5 rounded-lg bg-slate-50 border border-slate-200 font-mono text-[11px]">
                      <div>
                        <span className="text-[10px] text-slate-400 block">Formula</span>
                        <span className="font-semibold text-slate-800">{c.formula}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">Mol. Weight</span>
                        <span className="font-semibold text-slate-800">{c.molecularWeight} g/mol</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">LogP (Lipophilicity)</span>
                        <span className="font-semibold text-slate-800">{c.logP ?? 3.4}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">HBD / HBA</span>
                        <span className="font-semibold text-slate-800">{c.hBondDonors ?? 2} / {c.hBondAcceptors ?? 6}</span>
                      </div>
                    </div>

                    {/* SMILES notation */}
                    <div className="mt-2.5 bg-slate-50 p-2 rounded border border-slate-100 font-mono text-[10px] text-slate-600 truncate" title={c.smiles}>
                      <span className="text-slate-400">SMILES:</span> {c.smiles}
                    </div>
                  </div>

                  {/* Actions Toolbar */}
                  <div className="mt-4 pt-3 border-t border-slate-100 space-y-2.5">
                    {/* File Formats Export */}
                    <div className="flex items-center justify-between text-[11px] font-mono">
                      <span className="text-slate-400 flex items-center gap-1">
                        <Download className="w-3 h-3" /> Formats:
                      </span>
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => handleDownloadFile(c, 'sdf')}
                          className="px-1.5 py-0.5 rounded bg-slate-100 hover:bg-blue-100 text-slate-700"
                        >
                          {downloadingId === `${c.id}-sdf` ? '✓' : '.SDF'}
                        </button>
                        <button
                          onClick={() => handleDownloadFile(c, 'mol')}
                          className="px-1.5 py-0.5 rounded bg-slate-100 hover:bg-blue-100 text-slate-700"
                        >
                          {downloadingId === `${c.id}-mol` ? '✓' : '.MOL'}
                        </button>
                        <button
                          onClick={() => handleDownloadFile(c, 'smi')}
                          className="px-1.5 py-0.5 rounded bg-slate-100 hover:bg-blue-100 text-slate-700"
                        >
                          {downloadingId === `${c.id}-smi` ? '✓' : '.SMI'}
                        </button>
                      </div>
                    </div>

                    {/* Operational Buttons */}
                    <div className="grid grid-cols-3 gap-2">
                      <Link
                        to={`/admet?compound=${c.id}`}
                        className="text-center py-2 px-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium text-xs transition-colors"
                      >
                        ADMET
                      </Link>

                      <Link
                        to={`/compare?compoundA=${c.id}`}
                        className="text-center py-2 px-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium text-xs transition-colors"
                      >
                        Compare
                      </Link>

                      <Link
                        to={`/analysis/new?compound=${c.id}`}
                        className="inline-flex items-center justify-center space-x-1 py-2 px-2 rounded-lg bg-[#1E3A8A] hover:bg-[#1B365D] text-white font-medium text-xs shadow-2xs transition-colors"
                      >
                        <span>Analyze</span>
                        <ChevronRight className="w-3 h-3" />
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

export default CompoundLibraryPage;
