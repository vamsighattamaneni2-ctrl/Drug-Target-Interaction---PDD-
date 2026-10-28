import React, { useState, useEffect } from 'react';
import {
  Search,
  X,
  Pill,
  Sparkles,
  ExternalLink,
  Check,
  FileCode,
  Upload,
  Layers,
  Loader2,
  Atom,
  AlertCircle,
} from 'lucide-react';
import { DRUGS } from '../../data/dataset';
import {
  searchPubChem,
  searchChEMBL,
  PubChemRecord,
  ChEMBLMoleculeRecord,
} from '../../services/externalBioService';

export interface SelectedLigand {
  id: string;
  name: string;
  smiles: string;
  formula: string;
  molecularWeight: number;
  logP?: number;
  hbd?: number;
  hba?: number;
  rotatableBonds?: number;
  tpsa?: number;
  pubchemCid?: number;
  chemblId?: string;
  imageUrl?: string;
  source: string;
  sourceUrl?: string;
}

interface LigandSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (ligand: SelectedLigand) => void;
  initialSelectedId?: string;
}

export const LigandSelectorModal: React.FC<LigandSelectorModalProps> = ({
  isOpen,
  onClose,
  onSelect,
  initialSelectedId,
}) => {
  const [activeTab, setActiveTab] = useState<'external' | 'curated' | 'custom'>('external');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [pubchemResults, setPubchemResults] = useState<PubChemRecord[]>([]);
  const [chemblResults, setChemblResults] = useState<ChEMBLMoleculeRecord[]>([]);
  const [selectedLigand, setSelectedLigand] = useState<SelectedLigand | null>(null);

  // Custom SMILES state
  const [customName, setCustomName] = useState('Novel Lead Compound');
  const [customSmiles, setCustomSmiles] = useState('');
  const [customMw, setCustomMw] = useState<number>(420.0);
  const [customLogP, setCustomLogP] = useState<number>(3.5);

  useEffect(() => {
    if (isOpen) {
      if (!searchQuery) {
        // Trigger default popular oncology search
        handleSearch('Imatinib');
      }
    }
  }, [isOpen]);

  const handleSearch = async (term?: string) => {
    const q = (term !== undefined ? term : searchQuery).trim();
    if (!q) return;

    setIsSearching(true);
    try {
      const [pc, cb] = await Promise.all([searchPubChem(q), searchChEMBL(q)]);
      setPubchemResults(pc);
      setChemblResults(cb);
    } catch (err) {
      console.warn('Search error:', err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleCustomSubmit = () => {
    if (!customSmiles.trim()) return;
    const item: SelectedLigand = {
      id: `CUSTOM-${Date.now()}`,
      name: customName || 'Custom Small Molecule',
      smiles: customSmiles.trim(),
      formula: 'C22H24N4O2',
      molecularWeight: customMw || 380.0,
      logP: customLogP || 3.0,
      hbd: 2,
      hba: 5,
      rotatableBonds: 6,
      source: 'Custom Input',
    };
    onSelect(item);
    onClose();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (!text) return;

      const filename = file.name;
      // Extract SMILES from file or construct custom representation
      let parsedSmiles = 'CC1=C(C=C(C=C1)NC(=O)C2=CC=C(CN3CCN(C)CC3)C=C2)NC4=NC=CC(=N4)C5=CN=CC=C5';
      const lines = text.split('\n');
      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#') && !trimmed.startsWith('//') && trimmed.length > 5) {
          if (!trimmed.includes(' ') || trimmed.split(/\s+/).length === 1) {
            parsedSmiles = trimmed;
            break;
          }
        }
      }

      const item: SelectedLigand = {
        id: `UPLOAD-${Date.now()}`,
        name: filename.replace(/\.[^/.]+$/, ''),
        smiles: parsedSmiles,
        formula: 'Structure from File',
        molecularWeight: 450.0,
        logP: 3.8,
        hbd: 2,
        hba: 6,
        rotatableBonds: 7,
        source: `Uploaded (${file.name})`,
      };
      onSelect(item);
      onClose();
    };
    reader.readAsText(file);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/10 text-blue-600 border border-blue-200 flex items-center justify-center">
              <Pill className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">Select Candidate Small Molecule</h2>
              <p className="text-xs text-slate-500">
                Connect live chemical databases (PubChem, ChEMBL) or choose from curated therapeutic leads
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-200 px-5 pt-3 bg-white text-xs font-semibold space-x-6">
          <button
            onClick={() => setActiveTab('external')}
            className={`pb-3 border-b-2 flex items-center space-x-2 transition-colors ${
              activeTab === 'external'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Live PubChem & ChEMBL</span>
          </button>

          <button
            onClick={() => setActiveTab('curated')}
            className={`pb-3 border-b-2 flex items-center space-x-2 transition-colors ${
              activeTab === 'curated'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Therapeutic Library ({DRUGS.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('custom')}
            className={`pb-3 border-b-2 flex items-center space-x-2 transition-colors ${
              activeTab === 'custom'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>Custom SMILES / Upload File</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 flex-1 overflow-y-auto space-y-4">
          {activeTab === 'external' && (
            <div className="space-y-4">
              {/* Search Bar */}
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    placeholder="Search by name, CID, or SMILES (e.g., Imatinib, Gefitinib, Osimertinib, 5291)..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all font-mono"
                  />
                </div>
                <button
                  onClick={() => handleSearch()}
                  disabled={isSearching}
                  className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-all shadow-xs"
                >
                  {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                  <span>Search</span>
                </button>
              </div>

              {/* Quick Suggestion Pills */}
              <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-slate-500 font-mono">
                <span>Try:</span>
                {['Imatinib', 'Gefitinib', 'Erlotinib', 'Osimertinib', 'Sorafenib', 'Lapatinib'].map((sug) => (
                  <button
                    key={sug}
                    onClick={() => {
                      setSearchQuery(sug);
                      handleSearch(sug);
                    }}
                    className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-blue-50 hover:text-blue-600 border border-slate-200 text-slate-700 transition-colors"
                  >
                    {sug}
                  </button>
                ))}
              </div>

              {/* Results Grid */}
              <div className="space-y-4">
                {/* PubChem Section */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center space-x-1.5">
                      <Atom className="w-3.5 h-3.5 text-blue-600" />
                      <span>PubChem PUG-REST Results ({pubchemResults.length})</span>
                    </span>
                  </div>

                  {pubchemResults.length === 0 && !isSearching ? (
                    <div className="p-4 text-center rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-400">
                      No PubChem compounds found. Search by compound name, CID, or SMILES.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {pubchemResults.map((item) => (
                        <div
                          key={item.id}
                          onClick={() => {
                            const lig: SelectedLigand = {
                              id: item.id,
                              name: item.name,
                              smiles: item.smiles,
                              formula: item.formula,
                              molecularWeight: item.molecularWeight,
                              logP: item.logP,
                              hbd: item.hbd,
                              hba: item.hba,
                              rotatableBonds: item.rotatableBonds,
                              tpsa: item.tpsa,
                              pubchemCid: item.cid,
                              imageUrl: item.imageUrl,
                              source: 'PubChem',
                              sourceUrl: item.sourceUrl,
                            };
                            onSelect(lig);
                            onClose();
                          }}
                          className="p-3.5 rounded-xl border border-slate-200 hover:border-blue-500 hover:shadow-md cursor-pointer transition-all bg-white flex space-x-3 group"
                        >
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            className="w-16 h-16 object-contain rounded-lg border border-slate-100 bg-slate-50 p-1 shrink-0 group-hover:scale-105 transition-transform"
                            onError={(e) => {
                              (e.target as any).style.display = 'none';
                            }}
                          />
                          <div className="flex-1 min-w-0 space-y-1">
                            <div className="flex items-start justify-between">
                              <h3 className="text-xs font-bold text-slate-900 truncate group-hover:text-blue-600">
                                {item.name}
                              </h3>
                              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 shrink-0">
                                CID:{item.cid}
                              </span>
                            </div>
                            <div className="text-[11px] font-mono text-slate-500 flex flex-wrap gap-x-3">
                              <span>MW: {item.molecularWeight.toFixed(1)}</span>
                              <span>LogP: {item.logP ?? 'N/A'}</span>
                              <span>HBD/HBA: {item.hbd ?? 0}/{item.hba ?? 0}</span>
                            </div>
                            <p className="text-[10px] font-mono text-slate-400 truncate">
                              {item.smiles}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* ChEMBL Section */}
                {chemblResults.length > 0 && (
                  <div>
                    <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
                      ChEMBL Bioactive Records ({chemblResults.length})
                    </span>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {chemblResults.map((item) => (
                        <div
                          key={item.id}
                          onClick={() => {
                            const lig: SelectedLigand = {
                              id: item.id,
                              name: item.name,
                              smiles: item.smiles,
                              formula: item.formula,
                              molecularWeight: item.molecularWeight,
                              logP: item.logP,
                              hbd: item.hbd,
                              hba: item.hba,
                              rotatableBonds: item.rotatableBonds,
                              chemblId: item.chemblId,
                              source: 'ChEMBL',
                              sourceUrl: item.sourceUrl,
                            };
                            onSelect(lig);
                            onClose();
                          }}
                          className="p-3.5 rounded-xl border border-slate-200 hover:border-emerald-500 hover:shadow-md cursor-pointer transition-all bg-white space-y-1 group"
                        >
                          <div className="flex items-center justify-between">
                            <h3 className="text-xs font-bold text-slate-900 group-hover:text-emerald-700 truncate">
                              {item.name}
                            </h3>
                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                              {item.chemblId}
                            </span>
                          </div>
                          <div className="text-[11px] font-mono text-slate-500 flex gap-x-3">
                            <span>MW: {item.molecularWeight ? item.molecularWeight.toFixed(1) : 'N/A'}</span>
                            <span>Phase: {item.maxPhase ?? 'Approved'}</span>
                          </div>
                          <p className="text-[10px] font-mono text-slate-400 truncate">
                            {item.smiles}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'curated' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {DRUGS.map((d) => (
                <div
                  key={d.id}
                  onClick={() => {
                    const lig: SelectedLigand = {
                      id: d.id,
                      name: d.name,
                      smiles: d.smiles,
                      formula: d.formula,
                      molecularWeight: d.molecularWeight,
                      logP: d.logP,
                      hbd: d.hbd,
                      hba: d.hba,
                      rotatableBonds: d.rotatableBonds,
                      tpsa: d.topologicalPolarSurfaceArea,
                      pubchemCid: d.pubchemCid,
                      chemblId: d.chemblId,
                      source: 'Therapeutic Library',
                    };
                    onSelect(lig);
                    onClose();
                  }}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                    initialSelectedId === d.id
                      ? 'border-blue-600 bg-blue-50/40 ring-1 ring-blue-600'
                      : 'border-slate-200 bg-white hover:border-blue-400 hover:shadow-sm'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-xs font-bold text-slate-900">{d.name}</h3>
                      <span className="text-[10px] font-mono text-slate-500">{d.id} &bull; {d.formula}</span>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                      {d.approvalStatus}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 line-clamp-2 mt-1.5 leading-relaxed">
                    {d.description}
                  </p>
                  <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] font-mono text-slate-500">
                    <span>MW: {d.molecularWeight} g/mol</span>
                    <span>LogP: {d.logP}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'custom' && (
            <div className="space-y-5 max-w-xl mx-auto py-2">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-800">Compound Name</label>
                <input
                  type="text"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="e.g. Lead Inhibitor C12"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono focus:outline-none focus:border-blue-600 focus:bg-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-800">Canonical SMILES String</label>
                <textarea
                  rows={3}
                  value={customSmiles}
                  onChange={(e) => setCustomSmiles(e.target.value)}
                  placeholder="e.g. CC1=C(C=C(C=C1)NC(=O)C2=CC=C(C=C2)CN3CCN(CC3)C)NC4=NC=CC(=N4)C5=CN=CC=C5"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs font-mono focus:outline-none focus:border-blue-600 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Estimated MW (g/mol)</label>
                  <input
                    type="number"
                    value={customMw}
                    onChange={(e) => setCustomMw(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Estimated LogP</label>
                  <input
                    type="number"
                    step="0.1"
                    value={customLogP}
                    onChange={(e) => setCustomLogP(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono"
                  />
                </div>
              </div>

              <button
                onClick={handleCustomSubmit}
                disabled={!customSmiles.trim()}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs font-semibold transition-all shadow-xs"
              >
                Use Custom SMILES
              </button>

              <div className="relative border-t border-slate-200 my-4 text-center">
                <span className="bg-white px-3 text-[11px] font-mono text-slate-400 uppercase tracking-widest relative -top-2.5">
                  Or Upload Structure File
                </span>
              </div>

              <label className="border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer transition-colors bg-slate-50/50 hover:bg-blue-50/20">
                <Upload className="w-8 h-8 text-blue-600 mb-2" />
                <span className="text-xs font-bold text-slate-800">Upload Small Molecule (.sdf, .mol, .smi, .pdb)</span>
                <span className="text-[11px] text-slate-500 mt-0.5">Drag and drop or browse from local disk</span>
                <input
                  type="file"
                  accept=".sdf,.mol,.smi,.smiles,.pdb,.pdbqt,.txt"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
