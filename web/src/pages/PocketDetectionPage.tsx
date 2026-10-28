import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import {
  Dna,
  Search,
  Layers,
  ArrowRight,
  Loader2,
  Info,
  CheckCircle2,
  Sliders,
  Maximize2,
  ExternalLink,
  ChevronRight,
  RotateCw,
  Box,
} from 'lucide-react';
import { TARGETS } from '../data/dataset';
import {
  detectBindingPockets,
  BindingPocket,
  PocketDetectionResult,
} from '../services/advancedFeaturesService';

export const PocketDetectionPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialTargetId = searchParams.get('target') || 'BCR-ABL1';

  const [selectedTargetId, setSelectedTargetId] = useState(initialTargetId);
  const [customPdbId, setCustomPdbId] = useState('');
  const [isDetecting, setIsDetecting] = useState(false);
  const [result, setResult] = useState<PocketDetectionResult | null>(null);
  const [selectedPocket, setSelectedPocket] = useState<BindingPocket | null>(null);
  const [surfaceMode, setSurfaceMode] = useState<'cartoon' | 'surface'>('cartoon');

  const viewerContainerRef = useRef<HTMLDivElement>(null);
  const viewerInstanceRef = useRef<any>(null);

  const currentTarget = TARGETS.find((t) => t.id === selectedTargetId) || TARGETS[0];
  const activePdbId = customPdbId.trim() || currentTarget.pdbId || '1IEP';

  const runDetection = async (targetGene: string, pdbCode: string) => {
    setIsDetecting(true);
    try {
      const data = await detectBindingPockets({
        target_gene: targetGene,
        pdb_id: pdbCode,
        max_pockets: 4,
      });
      setResult(data);
      if (data.pockets.length > 0) {
        setSelectedPocket(data.pockets[0]);
      }
    } catch (err) {
      console.error('Pocket detection error:', err);
    } finally {
      setIsDetecting(false);
    }
  };

  useEffect(() => {
    runDetection(currentTarget.geneSymbol, activePdbId);
  }, [currentTarget.id, customPdbId]);

  // 3Dmol WebGL Viewer rendering
  useEffect(() => {
    const $3Dmol = (window as any).$3Dmol;
    if ($3Dmol && viewerContainerRef.current) {
      viewerContainerRef.current.innerHTML = '';
      try {
        const viewer = $3Dmol.createViewer(viewerContainerRef.current, {
          backgroundColor: '#0F172A',
        });
        viewerInstanceRef.current = viewer;

        $3Dmol.download(`pdb:${activePdbId}`, viewer, {}, () => {
          viewer.setStyle({}, { cartoon: { color: 'spectrum', opacity: 0.85 } });

          if (surfaceMode === 'surface') {
            viewer.addSurface($3Dmol.SurfaceType.MS, { opacity: 0.5, color: '#0D9488' });
          }

          // If a pocket is selected, highlight its center and bounding sphere
          if (selectedPocket) {
            viewer.addSphere({
              center: { x: selectedPocket.center_x, y: selectedPocket.center_y, z: selectedPocket.center_z },
              radius: 4.5,
              color: '#F59E0B',
              opacity: 0.65,
              wireframe: true,
            });

            // Highlight lining residues
            for (const resStr of selectedPocket.lining_residues) {
              const parts = resStr.split('-');
              const resi = parseInt(parts[1], 10);
              if (!isNaN(resi)) {
                viewer.setStyle(
                  { resi },
                  {
                    stick: { radius: 0.25, color: '#38BDF8' },
                    cartoon: { color: '#F59E0B' },
                  }
                );
              }
            }
          }

          viewer.zoomTo();
          viewer.render();
        });
      } catch (err) {
        console.warn('3Dmol render warning in pocket detector:', err);
      }
    }
  }, [activePdbId, selectedPocket?.pocket_id, surfaceMode]);

  const handleTransferToDocking = (pocket: BindingPocket) => {
    const params = new URLSearchParams({
      target: currentTarget.id,
      pdbId: activePdbId,
      pocketId: pocket.pocket_id,
      centerX: String(pocket.center_x),
      centerY: String(pocket.center_y),
      centerZ: String(pocket.center_z),
      sizeX: String(pocket.box_size_x),
      sizeY: String(pocket.box_size_y),
      sizeZ: String(pocket.box_size_z),
    });
    navigate(`/docking?${params.toString()}`);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="border-b border-slate-200 pb-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Binding-Pocket Detection
            </h1>
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-amber-50 text-amber-800 border border-amber-200">
              fpocket / P2Rank Standard
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Detect candidate protein binding cavities, calculate volume and druggability scores, and transfer grid box coordinates directly into docking simulations.
          </p>
        </div>

        {/* Target Selector Bar */}
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={selectedTargetId}
            onChange={(e) => {
              setSelectedTargetId(e.target.value);
              setCustomPdbId('');
            }}
            className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold text-slate-800 shadow-2xs font-mono"
          >
            {TARGETS.map((t) => (
              <option key={t.id} value={t.id}>
                {t.geneSymbol} ({(t.proteinName || t.name || t.geneSymbol).slice(0, 24)}... - PDB: {t.pdbId})
              </option>
            ))}
          </select>

          <input
            type="text"
            placeholder="Or enter PDB (e.g. 1IEP)"
            value={customPdbId}
            onChange={(e) => setCustomPdbId(e.target.value.toUpperCase())}
            maxLength={4}
            className="w-28 px-2.5 py-2 bg-white border border-slate-200 rounded-lg text-xs font-mono uppercase text-slate-800 placeholder-slate-400"
          />

          <button
            onClick={() => runDetection(currentTarget.geneSymbol, activePdbId)}
            disabled={isDetecting}
            className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-lg bg-[#1E3A8A] hover:bg-[#1B365D] text-white text-xs font-semibold shadow-xs disabled:opacity-50"
          >
            {isDetecting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RotateCw className="w-3.5 h-3.5" />}
            <span>Re-detect</span>
          </button>
        </div>
      </div>

      {/* Limitations Banner */}
      <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 text-xs flex items-start space-x-3">
        <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
        <p className="text-amber-900/90 leading-relaxed text-[11px]">
          <strong>Cavity Prediction Notice & Limitations:</strong> Binding pockets are detected via geometric curvature analysis and alpha-sphere clustering ({result?.method || 'fpocket/P2Rank algorithm'}). High druggability scores reflect volume, enclosure, and hydrophobicity in the rigid crystal lattice; cryptic allosteric sites and induced-fit rearrangements require experimental validation.
        </p>
      </div>

      {/* Main Grid: Left Pockets List, Right 3D Visualizer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Detected Pockets (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 font-mono uppercase tracking-wider">
              Candidate Pockets ({result?.pockets_found || 0})
            </h2>
            <span className="text-[11px] text-slate-400 font-mono">
              Target: {currentTarget.geneSymbol} • PDB {activePdbId}
            </span>
          </div>

          {isDetecting ? (
            <div className="bg-white p-12 rounded-xl border border-slate-200 text-center space-y-3">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto" />
              <p className="text-xs font-semibold text-slate-700">Detecting surface cavities...</p>
              <p className="text-[11px] text-slate-400 font-mono">Evaluating alpha-spheres & solvent accessibility</p>
            </div>
          ) : result?.pockets && result.pockets.length > 0 ? (
            <div className="space-y-3">
              {result.pockets.map((p) => {
                const isSelected = selectedPocket?.pocket_id === p.pocket_id;
                return (
                  <div
                    key={p.pocket_id}
                    onClick={() => setSelectedPocket(p)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer space-y-2.5 ${
                      isSelected
                        ? 'bg-blue-50/60 border-blue-400 shadow-sm ring-1 ring-blue-300'
                        : 'bg-white border-slate-200 hover:border-slate-300 shadow-2xs'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center space-x-1.5">
                          <span
                            className={`w-2 h-2 rounded-full ${
                              p.is_primary ? 'bg-emerald-500' : 'bg-amber-500'
                            }`}
                          />
                          <h3 className="text-xs font-bold text-slate-900">{p.pocket_id}</h3>
                        </div>
                        <span className="text-[10px] font-mono text-slate-500 block mt-0.5">
                          {p.druggability_label}
                        </span>
                      </div>

                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold border ${
                          p.druggability_score >= 0.75
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : 'bg-amber-50 text-amber-800 border-amber-200'
                        }`}
                      >
                        Score: {p.druggability_score}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-600 leading-snug">{p.description}</p>

                    {/* Pocket Metrics Grid */}
                    <div className="grid grid-cols-3 gap-2 font-mono text-[10px] pt-1">
                      <div className="p-1.5 rounded bg-slate-50 border border-slate-200/80">
                        <span className="text-slate-400 block text-[9px]">Volume</span>
                        <span className="font-bold text-slate-800">{p.volume_angstrom3} Å³</span>
                      </div>

                      <div className="p-1.5 rounded bg-slate-50 border border-slate-200/80">
                        <span className="text-slate-400 block text-[9px]">Hydrophobic</span>
                        <span className="font-bold text-slate-800">{(p.hydrophobicity_score * 100).toFixed(0)}%</span>
                      </div>

                      <div className="p-1.5 rounded bg-slate-50 border border-slate-200/80">
                        <span className="text-slate-400 block text-[9px]">Lining Residues</span>
                        <span className="font-bold text-slate-800">{p.lining_residues_count} AA</span>
                      </div>
                    </div>

                    {/* Coordinates & Transfer Button */}
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[10px] font-mono text-slate-400">
                        Center: ({p.center_x}, {p.center_y}, {p.center_z})
                      </span>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleTransferToDocking(p);
                        }}
                        className="inline-flex items-center space-x-1 px-2.5 py-1 rounded bg-[#1E3A8A] hover:bg-[#1B365D] text-white text-[11px] font-semibold transition-colors shadow-2xs"
                      >
                        <span>Transfer to Docking</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white p-8 rounded-xl border border-slate-200 text-center text-xs text-slate-500 font-mono">
              No pockets detected for this coordinate set.
            </div>
          )}
        </div>

        {/* Right Column: 3D Visualization & Lining Residues (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden flex flex-col">
            <div className="p-3.5 border-b border-slate-200 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Box className="w-4 h-4 text-cyan-400" />
                <span className="font-mono text-xs font-bold">
                  3D Cavity Viewer: {activePdbId} ({selectedPocket?.pocket_id || 'Overview'})
                </span>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setSurfaceMode(surfaceMode === 'cartoon' ? 'surface' : 'cartoon')}
                  className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[11px] font-mono text-cyan-300 border border-slate-700 transition-colors"
                >
                  {surfaceMode === 'cartoon' ? 'Show Surface' : 'Cartoon Only'}
                </button>
              </div>
            </div>

            {/* 3D WebGL Canvas */}
            <div
              ref={viewerContainerRef}
              className="w-full h-[400px] sm:h-[480px] bg-slate-950 relative"
            />

            {/* Selected Pocket Parameter Box */}
            {selectedPocket && (
              <div className="p-4 bg-slate-50 border-t border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-slate-900 font-mono">
                      Recommended AutoDock Grid Box:
                    </span>
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-semibold">
                      {selectedPocket.box_size_x} × {selectedPocket.box_size_y} × {selectedPocket.box_size_z} Å
                    </span>
                  </div>

                  <button
                    onClick={() => handleTransferToDocking(selectedPocket)}
                    className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-2xs transition-colors"
                  >
                    <span>Use this Pocket for Docking</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div>
                  <span className="text-[10px] font-mono text-slate-500 uppercase block mb-1">
                    Lining Contact Residues:
                  </span>
                  <div className="flex flex-wrap gap-1 font-mono text-[11px]">
                    {selectedPocket.lining_residues.map((r, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded bg-white text-slate-700 border border-slate-200"
                      >
                        {r}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PocketDetectionPage;
