import React, { useState, useEffect } from 'react';
import {
  Search,
  X,
  Dna,
  Sparkles,
  Layers,
  Loader2,
  ExternalLink,
  Upload,
  Check,
  FileCode,
  Box,
} from 'lucide-react';
import { TARGETS } from '../../data/dataset';
import {
  searchUniProt,
  getPdbDetails,
  UniProtTargetRecord,
  PdbStructureRecord,
} from '../../services/externalBioService';

export interface SelectedProteinTarget {
  id: string;
  geneSymbol: string;
  proteinName: string;
  uniprotId: string;
  pdbId: string;
  organism: string;
  resolution?: string;
  experimentalMethod?: string;
  targetClass?: string;
  sequenceLength?: number;
  source: string;
  sourceUrl?: string;
}

interface ProteinSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (target: SelectedProteinTarget) => void;
  initialSelectedId?: string;
}

export const ProteinSelectorModal: React.FC<ProteinSelectorModalProps> = ({
  isOpen,
  onClose,
  onSelect,
  initialSelectedId,
}) => {
  const [activeTab, setActiveTab] = useState<'external' | 'curated' | 'custom'>('external');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [uniprotResults, setUniprotResults] = useState<UniProtTargetRecord[]>([]);
  const [pdbDirectResult, setPdbDirectResult] = useState<PdbStructureRecord | null>(null);

  // Custom target state
  const [customGene, setCustomGene] = useState('EGFR');
  const [customProtein, setCustomProtein] = useState('Epidermal Growth Factor Receptor');
  const [customPdbId, setCustomPdbId] = useState('1M17');
  const [customUniprot, setCustomUniprot] = useState('P00533');

  useEffect(() => {
    if (isOpen) {
      if (!searchQuery) {
        handleSearch('EGFR');
      }
    }
  }, [isOpen]);

  const handleSearch = async (term?: string) => {
    const q = (term !== undefined ? term : searchQuery).trim();
    if (!q) return;

    setIsSearching(true);
    setPdbDirectResult(null);

    try {
      // Check if 4-character PDB code
      if (/^[0-9][a-zA-Z0-9]{3}$/.test(q)) {
        const pdb = await getPdbDetails(q);
        setPdbDirectResult(pdb);
      }

      const up = await searchUniProt(q);
      setUniprotResults(up);
    } catch (err) {
      console.warn('Search protein error:', err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleCustomSubmit = () => {
    const item: SelectedProteinTarget = {
      id: customPdbId || customGene,
      geneSymbol: customGene.toUpperCase(),
      proteinName: customProtein,
      uniprotId: customUniprot.toUpperCase(),
      pdbId: customPdbId.toUpperCase() || '1M17',
      organism: 'Homo sapiens',
      resolution: '2.00 Å',
      experimentalMethod: 'X-Ray Diffraction',
      targetClass: 'Receptor Tyrosine Kinase',
      source: 'Custom Macromolecule',
    };
    onSelect(item);
    onClose();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const filename = file.name;
    const base = filename.replace(/\.[^/.]+$/, '').toUpperCase();

    const item: SelectedProteinTarget = {
      id: `UPLOAD-${Date.now()}`,
      geneSymbol: base.slice(0, 8),
      proteinName: `Structure loaded from ${filename}`,
      uniprotId: 'CUSTOM',
      pdbId: filename.endsWith('.pdb') ? base.slice(0, 4) : '1M17',
      organism: 'Homo sapiens',
      resolution: '1.95 Å',
      experimentalMethod: 'Coordinates Upload',
      source: `Uploaded (${filename})`,
    };
    onSelect(item);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-teal-600/10 text-teal-700 border border-teal-200 flex items-center justify-center">
              <Dna className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">Select Biological Target Protein</h2>
              <p className="text-xs text-slate-500">
                Query reviewed UniProtKB entries, RCSB PDB crystal coordinates, or oncology kinase receptors
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
                ? 'border-teal-600 text-teal-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Live UniProt & RCSB PDB</span>
          </button>

          <button
            onClick={() => setActiveTab('curated')}
            className={`pb-3 border-b-2 flex items-center space-x-2 transition-colors ${
              activeTab === 'curated'
                ? 'border-teal-600 text-teal-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Target Catalog ({TARGETS.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('custom')}
            className={`pb-3 border-b-2 flex items-center space-x-2 transition-colors ${
              activeTab === 'custom'
                ? 'border-teal-600 text-teal-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>PDB ID / Upload Structure</span>
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
                    placeholder="Search by gene symbol, UniProt ID, or PDB code (e.g. EGFR, ABL1, BRAF, 1M17, P00533)..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-teal-600 focus:ring-1 focus:ring-teal-600 transition-all font-mono"
                  />
                </div>
                <button
                  onClick={() => handleSearch()}
                  disabled={isSearching}
                  className="px-4 py-2.5 bg-teal-700 hover:bg-teal-800 disabled:opacity-60 text-white rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-all shadow-xs"
                >
                  {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                  <span>Search</span>
                </button>
              </div>

              {/* Suggestions */}
              <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-slate-500 font-mono">
                <span>Try:</span>
                {['EGFR (1M17)', 'ABL1 (1IEP)', 'BRAF (4EHG)', 'ERBB2 (1N8Z)', 'KDR (2P2H)', 'ESR1 (3ERT)'].map((sug) => {
                  const gene = sug.split(' ')[0];
                  return (
                    <button
                      key={sug}
                      onClick={() => {
                        setSearchQuery(gene);
                        handleSearch(gene);
                      }}
                      className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-teal-50 hover:text-teal-700 border border-slate-200 text-slate-700 transition-colors"
                    >
                      {sug}
                    </button>
                  );
                })}
              </div>

              {/* Direct PDB Match */}
              {pdbDirectResult && (
                <div className="p-4 rounded-xl border border-teal-200 bg-teal-50/50 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-teal-900 flex items-center space-x-1.5">
                      <Box className="w-4 h-4 text-teal-700" />
                      <span>Direct RCSB PDB Structure Matched: {pdbDirectResult.pdbId}</span>
                    </span>
                    <button
                      onClick={() => {
                        const target: SelectedProteinTarget = {
                          id: pdbDirectResult.pdbId,
                          geneSymbol: pdbDirectResult.pdbId,
                          proteinName: pdbDirectResult.title,
                          uniprotId: 'RCSB_PDB',
                          pdbId: pdbDirectResult.pdbId,
                          organism: 'Homo sapiens',
                          resolution: pdbDirectResult.resolution,
                          experimentalMethod: pdbDirectResult.experimentalMethod,
                          source: 'RCSB PDB',
                          sourceUrl: pdbDirectResult.pdbUrl,
                        };
                        onSelect(target);
                        onClose();
                      }}
                      className="px-3 py-1 bg-teal-700 hover:bg-teal-800 text-white rounded-lg text-xs font-semibold"
                    >
                      Select PDB Structure
                    </button>
                  </div>
                  <p className="text-xs text-teal-950 font-medium">{pdbDirectResult.title}</p>
                  <div className="text-[11px] font-mono text-teal-800 flex gap-x-4">
                    <span>Resolution: {pdbDirectResult.resolution}</span>
                    <span>Method: {pdbDirectResult.experimentalMethod}</span>
                    <span>Released: {pdbDirectResult.releaseDate}</span>
                  </div>
                </div>
              )}

              {/* UniProt Results Grid */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                  Reviewed UniProtKB Targets ({uniprotResults.length})
                </span>

                {uniprotResults.length === 0 && !isSearching ? (
                  <div className="p-4 text-center rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-400">
                    No UniProt targets found. Try searching by gene name e.g. EGFR, ABL1, BRAF.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {uniprotResults.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => {
                          const target: SelectedProteinTarget = {
                            id: item.uniprotId,
                            geneSymbol: item.geneSymbol,
                            proteinName: item.proteinName,
                            uniprotId: item.uniprotId,
                            pdbId: item.pdbIds[0] || '1M17',
                            organism: item.organism,
                            resolution: '2.00 Å',
                            experimentalMethod: 'X-Ray Diffraction',
                            sequenceLength: item.sequenceLength,
                            source: 'UniProt',
                            sourceUrl: item.sourceUrl,
                          };
                          onSelect(target);
                          onClose();
                        }}
                        className="p-3.5 rounded-xl border border-slate-200 hover:border-teal-600 hover:shadow-md cursor-pointer transition-all bg-white space-y-1.5 group"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="text-xs font-bold text-slate-900 group-hover:text-teal-700">
                              {item.geneSymbol}
                            </h3>
                            <span className="text-[10px] font-mono text-slate-500">
                              UniProt: {item.uniprotId}
                            </span>
                          </div>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-teal-50 text-teal-800 border border-teal-200">
                            PDB: {item.pdbIds[0] || '1M17'}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-700 line-clamp-2 leading-relaxed">
                          {item.proteinName}
                        </p>
                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] font-mono text-slate-500">
                          <span>{item.organism}</span>
                          <span>Length: {item.sequenceLength} aa</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'curated' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {TARGETS.map((t) => (
                <div
                  key={t.id}
                  onClick={() => {
                    const target: SelectedProteinTarget = {
                      id: t.id,
                      geneSymbol: t.geneSymbol,
                      proteinName: t.proteinName,
                      uniprotId: t.uniprotId,
                      pdbId: t.pdbId || '1M17',
                      organism: t.organism,
                      targetClass: t.targetClass,
                      source: 'Target Catalog',
                    };
                    onSelect(target);
                    onClose();
                  }}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                    initialSelectedId === t.id
                      ? 'border-teal-600 bg-teal-50/40 ring-1 ring-teal-600'
                      : 'border-slate-200 bg-white hover:border-teal-500 hover:shadow-sm'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-xs font-bold text-slate-900">{t.geneSymbol}</h3>
                      <span className="text-[10px] font-mono text-slate-500">{t.uniprotId} &bull; PDB: {t.pdbId}</span>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                      {t.targetClass.split('/')[0]}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 line-clamp-2 mt-1.5 leading-relaxed">
                    {t.proteinName}
                  </p>
                  <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] font-mono text-slate-500">
                    <span>{t.organism}</span>
                    <span>{t.cellularLocation}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'custom' && (
            <div className="space-y-5 max-w-xl mx-auto py-2">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-800">Gene Symbol</label>
                  <input
                    type="text"
                    value={customGene}
                    onChange={(e) => setCustomGene(e.target.value)}
                    placeholder="e.g. KRAS, EGFR, CDK4"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono uppercase focus:outline-none focus:border-teal-600 focus:bg-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-800">PDB Structure Code</label>
                  <input
                    type="text"
                    maxLength={4}
                    value={customPdbId}
                    onChange={(e) => setCustomPdbId(e.target.value.toUpperCase())}
                    placeholder="e.g. 4OB0, 1M17"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono uppercase focus:outline-none focus:border-teal-600 focus:bg-white"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-800">Full Protein Name</label>
                <input
                  type="text"
                  value={customProtein}
                  onChange={(e) => setCustomProtein(e.target.value)}
                  placeholder="e.g. GTPase KRas"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-teal-600 focus:bg-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-800">UniProt Accession</label>
                <input
                  type="text"
                  value={customUniprot}
                  onChange={(e) => setCustomUniprot(e.target.value)}
                  placeholder="e.g. P01116"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono uppercase focus:outline-none focus:border-teal-600 focus:bg-white"
                />
              </div>

              <button
                onClick={handleCustomSubmit}
                className="w-full py-2.5 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-semibold transition-all shadow-xs"
              >
                Use Custom Macromolecule
              </button>

              <div className="relative border-t border-slate-200 my-4 text-center">
                <span className="bg-white px-3 text-[11px] font-mono text-slate-400 uppercase tracking-widest relative -top-2.5">
                  Or Upload Protein Coordinates
                </span>
              </div>

              <label className="border-2 border-dashed border-slate-300 hover:border-teal-600 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer transition-colors bg-slate-50/50 hover:bg-teal-50/20">
                <Upload className="w-8 h-8 text-teal-700 mb-2" />
                <span className="text-xs font-bold text-slate-800">Upload PDB / mmCIF Coordinate File (.pdb, .cif)</span>
                <span className="text-[11px] text-slate-500 mt-0.5">Drag and drop or browse from local disk</span>
                <input
                  type="file"
                  accept=".pdb,.ent,.cif,.mmcif,.fasta,.fa"
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
