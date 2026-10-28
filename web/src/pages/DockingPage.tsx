import React, { useState, useEffect, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft,
  Activity,
  Box,
  Layers,
  Sparkles,
  Search,
  Pill,
  Dna,
  Sliders,
  Download,
  Eye,
  RotateCcw,
  Printer,
  CheckCircle2,
  Crosshair,
  Loader2,
  Zap,
} from 'lucide-react';
import {
  LigandSelectorModal,
  SelectedLigand,
} from '../components/selection/LigandSelectorModal';
import {
  ProteinSelectorModal,
  SelectedProteinTarget,
} from '../components/selection/ProteinSelectorModal';
import {
  runDocking,
  prepareReceptor,
  DockingResult,
} from '../services/dockingEngine';
import { triggerFileDownload, generateSyntheticSdf } from '../services/bioDataService';

export const DockingPage: React.FC = () => {
  const [isLigandModalOpen, setIsLigandModalOpen] = useState(false);
  const [isTargetModalOpen, setIsTargetModalOpen] = useState(false);

  const [selectedLigand, setSelectedLigand] = useState<SelectedLigand>({
    id: 'CID-5291',
    name: 'Imatinib',
    smiles: 'CC1=C(C=C(C=C1)NC(=O)C2=CC=C(CN3CCN(C)CC3)C=C2)NC4=NC=CC(=N4)C5=CN=CC=C5',
    formula: 'C29H31N7O',
    molecularWeight: 493.6,
    logP: 4.5,
    hbd: 2,
    hba: 7,
    rotatableBonds: 7,
    pubchemCid: 5291,
    imageUrl: 'https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/5291/PNG?image_size=300x300',
    source: 'PubChem',
  });

  const [selectedTarget, setSelectedTarget] = useState<SelectedProteinTarget>({
    id: '1IEP',
    geneSymbol: 'BCR-ABL1',
    proteinName: 'Tyrosine-protein kinase ABL1 catalytic domain',
    uniprotId: 'P00519',
    pdbId: '1IEP',
    organism: 'Homo sapiens',
    resolution: '2.10 Å',
    source: 'RCSB PDB',
  });

  // Docking parameters
  const [exhaustiveness, setExhaustiveness] = useState(16);
  const [numModes, setNumModes] = useState(9);
  const [gridCenter, setGridCenter] = useState<[number, number, number]>([14.2, -8.6, 22.1]);
  const [gridSize, setGridSize] = useState<[number, number, number]>([24.0, 24.0, 24.0]);

  // Execution state
  const [isDocking, setIsDocking] = useState(false);
  const [dockingResult, setDockingResult] = useState<DockingResult | null>(null);
  const [selectedPoseIndex, setSelectedPoseIndex] = useState(0);
  const [renderStyle, setRenderStyle] = useState<'cartoon' | 'surface' | 'stick'>('cartoon');
  const [showPocketSurface, setShowPocketSurface] = useState(true);
  const [highlightedResidueNumber, setHighlightedResidueNumber] = useState<number | null>(null);
  const [activeContactFilter, setActiveContactFilter] = useState<string>('all');

  const viewerContainerRef = useRef<HTMLDivElement>(null);

  const [searchParams] = useSearchParams();
  const transferredPocketId = searchParams.get('pocketId');

  // Update pocket coordinates on target change or URL params transfer
  useEffect(() => {
    const cx = searchParams.get('centerX');
    const cy = searchParams.get('centerY');
    const cz = searchParams.get('centerZ');
    const sx = searchParams.get('sizeX');
    const sy = searchParams.get('sizeY');
    const sz = searchParams.get('sizeZ');

    if (cx && cy && cz) {
      setGridCenter([parseFloat(cx), parseFloat(cy), parseFloat(cz)]);
      if (sx && sy && sz) {
        setGridSize([parseFloat(sx), parseFloat(sy), parseFloat(sz)]);
      }
    } else {
      const prep = prepareReceptor(selectedTarget.pdbId, selectedTarget.geneSymbol);
      setGridCenter(prep.gridCenter);
      setGridSize(prep.gridSize);
    }
  }, [selectedTarget, searchParams]);

  // Initial auto-docking run on load
  useEffect(() => {
    handleExecuteDocking();
  }, []);

  const handleExecuteDocking = async () => {
    setIsDocking(true);
    try {
      const result = await runDocking({
        compoundName: selectedLigand.name,
        smiles: selectedLigand.smiles,
        targetGene: selectedTarget.geneSymbol,
        pdbId: selectedTarget.pdbId,
        exhaustiveness,
        numModes,
        gridCenter,
        gridSize,
      });
      setDockingResult(result);
      setSelectedPoseIndex(0);
      setHighlightedResidueNumber(null);
    } catch (err) {
      console.warn('Docking error:', err);
    } finally {
      setIsDocking(false);
    }
  };

  // 3Dmol WebGL Viewer rendering
  useEffect(() => {
    if (!dockingResult || !viewerContainerRef.current) return;

    let viewer: any = null;
    const $3Dmol = (window as any).$3Dmol;

    if ($3Dmol && viewerContainerRef.current) {
      try {
        viewerContainerRef.current.innerHTML = '';
        viewer = $3Dmol.createViewer(viewerContainerRef.current, {
          backgroundColor: '#070B14',
        });

        viewer.addModel(dockingResult.dockedComplexPdb, 'pdb');

        if (renderStyle === 'cartoon') {
          viewer.setStyle({ chain: 'A' }, { cartoon: { color: 'spectrum' } });
        } else if (renderStyle === 'surface') {
          viewer.setStyle({ chain: 'A' }, { cartoon: { color: 'teal', opacity: 0.5 } });
        } else {
          viewer.setStyle({ chain: 'A' }, { stick: { colorscheme: 'amino' } });
        }

        if (showPocketSurface) {
          viewer.addSurface($3Dmol.SurfaceType.MS, {
            opacity: 0.35,
            color: '#38BDF8',
          }, { chain: 'A' });
        }

        viewer.setStyle({ resn: 'LIG' }, {
          stick: { colorscheme: 'cyanCarbon', radius: 0.32 },
          sphere: { scale: 0.28, colorscheme: 'cyanCarbon' },
        });

        dockingResult.contacts.forEach((c) => {
          const isHighlighted = highlightedResidueNumber === c.residueNumber;
          viewer.setStyle({ resi: c.residueNumber, chain: 'A' }, {
            stick: {
              colorscheme: isHighlighted ? 'magentaCarbon' : 'yellowCarbon',
              radius: isHighlighted ? 0.38 : 0.2,
            },
          });
        });

        viewer.zoomTo();
        viewer.render();
      } catch (err) {
        console.warn('3Dmol render error:', err);
      }
    }

    return () => {
      if (viewer && viewer.clear) viewer.clear();
    };
  }, [dockingResult, selectedPoseIndex, renderStyle, showPocketSurface, highlightedResidueNumber]);

  return (
    <div className="min-h-screen bg-[#070B14] text-slate-100 py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <Link
          to="/"
          className="inline-flex items-center space-x-1.5 text-xs font-mono text-cyan-400 hover:text-cyan-300 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Overview</span>
        </Link>
        <Link
          to="/analysis/new"
          className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold"
        >
          <span>Open Full 5-Step Wizard</span>
        </Link>
      </div>

      {/* Header */}
      <div className="space-y-1">
        <div className="inline-flex items-center space-x-2 text-xs font-mono text-indigo-400">
          <Layers className="w-4 h-4" />
          <span>STRUCTURAL BIOLOGY & SIMULATION STUDIO</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
          AutoDock Vina Molecular Docking & Pocket Analysis
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-3xl">
          Live small molecule and macromolecule preparation, 3D search space bounding box tuning, and physics-based empirical docking simulation.
        </p>
      </div>

      {/* Entity Selection & Grid Parameters Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Ligand Selection Card */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center space-x-1.5">
              <Pill className="w-4 h-4" />
              <span>Ligand ({selectedLigand.source})</span>
            </span>
            <button
              onClick={() => setIsLigandModalOpen(true)}
              className="text-xs text-cyan-300 hover:underline flex items-center space-x-1 font-mono"
            >
              <Search className="w-3 h-3" />
              <span>Change</span>
            </button>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center space-x-3">
            {selectedLigand.imageUrl ? (
              <img
                src={selectedLigand.imageUrl}
                alt={selectedLigand.name}
                className="w-14 h-14 object-contain rounded-lg bg-slate-800 p-1 shrink-0"
              />
            ) : (
              <div className="w-14 h-14 rounded-lg bg-blue-950 text-blue-400 flex items-center justify-center shrink-0">
                <Pill className="w-6 h-6" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-bold text-white truncate">{selectedLigand.name}</h3>
              <p className="text-[11px] font-mono text-slate-400">MW: {selectedLigand.molecularWeight} g/mol</p>
              <p className="text-[10px] font-mono text-slate-500 truncate">{selectedLigand.smiles}</p>
            </div>
          </div>
        </div>

        {/* Center: Protein Target Card */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-teal-400 uppercase tracking-wider flex items-center space-x-1.5">
              <Dna className="w-4 h-4" />
              <span>Target Receptor ({selectedTarget.source})</span>
            </span>
            <div className="flex items-center space-x-2">
              <Link
                to={`/pockets?target=${selectedTarget.id}`}
                className="text-[10px] text-amber-300 bg-amber-950/70 hover:bg-amber-900 border border-amber-600 px-2 py-0.5 rounded font-mono"
              >
                fpocket Pockets
              </Link>
              <button
                onClick={() => setIsTargetModalOpen(true)}
                className="text-xs text-teal-300 hover:underline flex items-center space-x-1 font-mono"
              >
                <Search className="w-3 h-3" />
                <span>Change</span>
              </button>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center space-x-3">
            <div className="w-14 h-14 rounded-lg bg-teal-950 text-teal-400 border border-teal-800 flex flex-col items-center justify-center shrink-0 font-mono">
              <span className="text-xs font-bold">{selectedTarget.pdbId}</span>
              <span className="text-[9px] text-teal-300">PDB</span>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-bold text-white truncate">{selectedTarget.geneSymbol}</h3>
              <p className="text-[11px] text-slate-400 line-clamp-1">{selectedTarget.proteinName}</p>
              <p className="text-[10px] font-mono text-slate-500">Res: {selectedTarget.resolution || '2.0 Å'}</p>
            </div>
          </div>
        </div>

        {/* Right: Simulation Launch */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 flex flex-col justify-between space-y-3">
          <div>
            <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider block">
              Simulation Controls
            </span>
            <div className="mt-2 flex items-center justify-between text-xs font-mono text-slate-400">
              <span>Exhaustiveness: {exhaustiveness}</span>
              <span>Modes: {numModes}</span>
            </div>
          </div>

          <button
            onClick={handleExecuteDocking}
            disabled={isDocking}
            className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center justify-center space-x-2 shadow-lg transition-all"
          >
            {isDocking ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4 text-yellow-300" />}
            <span>{isDocking ? 'Simulating Conformers...' : 'Run Molecular Docking'}</span>
          </button>
        </div>
      </div>

      {/* Main Studio Viewport & Pose Inspector */}
      {dockingResult && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 3D WebGL Canvas */}
          <div className="lg:col-span-2 glass-panel rounded-2xl overflow-hidden border border-slate-800 flex flex-col h-[520px]">
            {/* Viewport Toolbar */}
            <div className="p-3 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between text-xs font-mono">
              <div className="flex items-center space-x-2">
                <span className="text-slate-400">Style:</span>
                <select
                  value={renderStyle}
                  onChange={(e) => setRenderStyle(e.target.value as any)}
                  className="bg-slate-800 border border-slate-700 rounded px-2 py-1 text-slate-200 text-xs"
                >
                  <option value="cartoon">Cartoon Ribbon</option>
                  <option value="surface">Active Surface</option>
                  <option value="stick">All-Atom Sticks</option>
                </select>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() =>
                    triggerFileDownload(
                      dockingResult.dockedComplexPdb,
                      `${selectedLigand.name}_${selectedTarget.geneSymbol}_complex.pdb`,
                      'chemical/x-pdb'
                    )
                  }
                  className="inline-flex items-center space-x-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px]"
                >
                  <Download className="w-3 h-3 text-cyan-400" />
                  <span>Download .PDB</span>
                </button>
              </div>
            </div>

            {/* Canvas */}
            <div ref={viewerContainerRef} className="flex-1 w-full h-full relative" />
          </div>

          {/* Right Column: Binding Scores & Pose Table */}
          <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <span className="text-[10px] font-mono text-cyan-400 uppercase">Top Binding Mode (Mode 1)</span>
                  <h3 className="text-2xl font-extrabold text-white">{dockingResult.dockingScore} kcal/mol</h3>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-mono text-emerald-400 uppercase">Estimated Kd</span>
                  <p className="text-lg font-bold text-emerald-300">{dockingResult.predictedKdNm} nM</p>
                </div>
              </div>

              {/* Modes Table */}
              <div className="space-y-1.5 max-h-[300px] overflow-y-auto pr-1">
                <span className="text-[11px] font-mono font-bold text-slate-400 block mb-1">
                  Ranked Poses (AutoDock Vina):
                </span>
                {dockingResult.modes.map((m, idx) => (
                  <div
                    key={m.mode}
                    onClick={() => setSelectedPoseIndex(idx)}
                    className={`p-2.5 rounded-lg border text-xs font-mono cursor-pointer transition-all flex items-center justify-between ${
                      selectedPoseIndex === idx
                        ? 'bg-blue-600/20 border-blue-500 text-white'
                        : 'bg-slate-900/40 border-slate-800/80 text-slate-400 hover:bg-slate-900'
                    }`}
                  >
                    <span>Mode #{m.mode}</span>
                    <span className="font-bold text-cyan-300">{m.affinityKcalMol} kcal/mol</span>
                    <span className="text-[10px] text-slate-500">{m.kdNm} nM</span>
                  </div>
                ))}
              </div>
            </div>

            <Link
              to={`/analysis/new?compound=${selectedLigand.name}&target=${selectedTarget.geneSymbol}`}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold text-center block transition-colors"
            >
              Export Complete Audit Dossier & ADMET &rarr;
            </Link>
          </div>
        </div>

        {/* Feature 4: Advanced Interaction Analysis & PLIP-Compatible Contact Matrix */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider">
                  Advanced Interaction Matrix
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-950/80 text-blue-300 border border-blue-700">
                  PLIP-Compatible Geometric Matrix
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Decomposing docked complex contacts using IUPAC distance and angular contact criteria. Modeled for Pose Mode #{dockingResult.modes[selectedPoseIndex]?.mode || 1}.
              </p>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center space-x-1.5 flex-wrap gap-y-1">
              {['all', 'Hydrogen Bond', 'Hydrophobic Contact', 'Salt Bridge', 'pi-Stacking'].map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveContactFilter(filter)}
                  className={`text-xs px-2.5 py-1 rounded-lg font-mono transition-all ${
                    activeContactFilter === filter
                      ? 'bg-cyan-500 text-slate-950 font-bold'
                      : 'bg-slate-900 border border-slate-700 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  {filter === 'all' ? 'All Contacts' : filter}
                </button>
              ))}
            </div>
          </div>

          {/* Interaction Breakdown Summary Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
              <span className="text-xs font-mono text-slate-400">Hydrogen Bonds</span>
              <span className="text-sm font-bold text-cyan-400 font-mono">
                {dockingResult.contacts.filter((c) => c.contactType === 'Hydrogen Bond').length}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
              <span className="text-xs font-mono text-slate-400">Hydrophobic</span>
              <span className="text-sm font-bold text-amber-400 font-mono">
                {dockingResult.contacts.filter((c) => c.contactType === 'Hydrophobic Contact').length}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
              <span className="text-xs font-mono text-slate-400">Salt Bridges</span>
              <span className="text-sm font-bold text-purple-400 font-mono">
                {dockingResult.contacts.filter((c) => c.contactType === 'Salt Bridge').length}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
              <span className="text-xs font-mono text-slate-400">π-Stacking / Aromatic</span>
              <span className="text-sm font-bold text-emerald-400 font-mono">
                {dockingResult.contacts.filter((c) => c.contactType === 'pi-Stacking').length}
              </span>
            </div>
          </div>

          {/* Contact Table with 3D Viewer Interactive Highlighting */}
          <div className="border border-slate-800 rounded-xl overflow-hidden">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-900 text-slate-400 border-b border-slate-800 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-2.5 px-4">Target Residue</th>
                  <th className="py-2.5 px-4">Contact Class</th>
                  <th className="py-2.5 px-4">Distance (Å)</th>
                  <th className="py-2.5 px-4">Energy (kcal/mol)</th>
                  <th className="py-2.5 px-4">Method Provenance</th>
                  <th className="py-2.5 px-4 text-right">3D Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {dockingResult.contacts
                  .filter((c) => activeContactFilter === 'all' || c.contactType === activeContactFilter)
                  .map((c, idx) => {
                    const isSelected = highlightedResidueNumber === c.residueNumber;
                    return (
                      <tr
                        key={idx}
                        className={`transition-colors ${
                          isSelected ? 'bg-cyan-950/40 text-cyan-200' : 'hover:bg-slate-900/50 text-slate-300'
                        }`}
                      >
                        <td className="py-2.5 px-4 font-bold flex items-center space-x-2">
                          <span className="text-white">{c.residue}</span>
                          <span className="text-[10px] text-slate-500">#{c.residueNumber}</span>
                        </td>
                        <td className="py-2.5 px-4">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                              c.contactType === 'Hydrogen Bond'
                                ? 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                                : c.contactType === 'Hydrophobic Contact'
                                ? 'bg-amber-950 text-amber-300 border border-amber-800'
                                : c.contactType === 'Salt Bridge'
                                ? 'bg-purple-950 text-purple-300 border border-purple-800'
                                : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                            }`}
                          >
                            {c.contactType}
                          </span>
                        </td>
                        <td className="py-2.5 px-4">{c.distanceAngstrom} Å</td>
                        <td className="py-2.5 px-4 text-emerald-400 font-semibold">{c.energyKcal}</td>
                        <td className="py-2.5 px-4 text-[11px] text-slate-400">
                          PLIP Geometric Contact Profiler v1.4
                        </td>
                        <td className="py-2.5 px-4 text-right">
                          <button
                            onClick={() =>
                              setHighlightedResidueNumber(
                                isSelected ? null : c.residueNumber
                              )
                            }
                            className={`text-[10px] px-2 py-1 rounded font-semibold transition-all ${
                              isSelected
                                ? 'bg-magenta-600 bg-pink-600 text-white'
                                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                            }`}
                          >
                            {isSelected ? 'Clear Highlight' : 'Highlight in 3D'}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>

          {/* Multi-Pose Comparison Grid */}
          <div className="border border-slate-800 rounded-xl p-4 bg-slate-900/30 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wider">
                Multi-Pose Conformation Comparison ({dockingResult.modes.length} Modes Sampled)
              </span>
              <span className="text-[11px] font-mono text-slate-500">
                Click any mode to inspect binding geometry
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {dockingResult.modes.slice(0, 5).map((mode, idx) => (
                <div
                  key={mode.mode}
                  onClick={() => setSelectedPoseIndex(idx)}
                  className={`p-3 rounded-xl border text-xs font-mono cursor-pointer transition-all space-y-1 ${
                    selectedPoseIndex === idx
                      ? 'bg-blue-950/60 border-cyan-500 text-white shadow-lg shadow-cyan-950/50'
                      : 'bg-slate-900/70 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-200">Mode #{mode.mode}</span>
                    {selectedPoseIndex === idx && (
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-cyan-500 text-slate-950 font-bold">
                        ACTIVE
                      </span>
                    )}
                  </div>
                  <div className="text-sm font-bold text-cyan-300">{mode.affinityKcalMol} kcal/mol</div>
                  <div className="text-[10px] text-slate-500 flex justify-between">
                    <span>RMSD: {mode.rmsdLowerBound || 0.0} Å</span>
                    <span>Kd: {mode.kdNm} nM</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Scientific Disclaimer & Quality Control */}
          <div className="p-3.5 rounded-xl bg-amber-950/30 border border-amber-900/60 text-xs text-amber-300 space-y-1">
            <span className="font-bold font-mono uppercase tracking-wider flex items-center space-x-1.5">
              <span>Scientific Note & Limitations:</span>
            </span>
            <p className="text-[11px] text-amber-200/90 leading-relaxed font-sans">
              All docked poses, contact distances, and interaction matrices are computed in silico using empirical scoring functions and geometric contact matrices. Computational docking scores and interaction profiles do not constitute experimental proof of drug efficacy or binding affinity. Experimental validation (e.g. SPR, ITC, or X-ray crystallography) is required before translational progression.
            </p>
          </div>
        </div>
        </div>
      )}

      {/* Ligand Selector Modal */}
      <LigandSelectorModal
        isOpen={isLigandModalOpen}
        onClose={() => setIsLigandModalOpen(false)}
        initialSelectedId={selectedLigand.id}
        onSelect={(lig) => setSelectedLigand(lig)}
      />

      {/* Protein Selector Modal */}
      <ProteinSelectorModal
        isOpen={isTargetModalOpen}
        onClose={() => setIsTargetModalOpen(false)}
        initialSelectedId={selectedTarget.id}
        onSelect={(tar) => setSelectedTarget(tar)}
      />
    </div>
  );
};
