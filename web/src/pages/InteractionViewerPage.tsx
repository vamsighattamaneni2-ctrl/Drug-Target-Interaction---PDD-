import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Activity,
  ArrowRight,
  ChevronRight,
  Crosshair,
  Download,
  Eye,
  Info,
  Maximize2,
  Minimize2,
  Pill,
  RefreshCw,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import { DRUGS, TARGETS } from '../data/dataset';
import { appState } from '../services/appStateService';

export const InteractionViewerPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const selectedJobId = searchParams.get('job') || 'DTI-2026-8941';

  const job = appState.getAnalysisById(selectedJobId) || appState.getAllAnalyses()[0];
  const compound = DRUGS.find((d) => d.id === job?.compoundId) || DRUGS[0];
  const target = TARGETS.find((t) => t.id === job?.targetId) || TARGETS[0];

  // Viewer controls
  const [renderStyle, setRenderStyle] = useState<'cartoon' | 'surface' | 'stick' | 'sphere'>('cartoon');
  const [showHBonds, setShowHBonds] = useState(true);
  const [showHydrophobic, setShowHydrophobic] = useState(true);
  const [showSaltBridges, setShowSaltBridges] = useState(true);
  const [showLabels, setShowLabels] = useState(true);
  const [showDistanceMeasurements, setShowDistanceMeasurements] = useState(true);
  const [activeTab, setActiveTab] = useState<'3d' | '2d'>('3d');

  // Canvas / 3D viewer ref
  const viewerContainerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Rotation state for interactive canvas
  const [rotation, setRotation] = useState({ x: 25, y: -45 });
  const [zoom, setZoom] = useState(1);
  const isDraggingRef = useRef(false);
  const lastMousePosRef = useRef({ x: 0, y: 0 });

  // 3Dmol viewer integration
  useEffect(() => {
    let viewer: any = null;
    const $3Dmol = (window as any).$3Dmol;

    if ($3Dmol && viewerContainerRef.current) {
      try {
        viewerContainerRef.current.innerHTML = '';
        viewer = $3Dmol.createViewer(viewerContainerRef.current, {
          backgroundColor: '#0F172A',
        });

        const pdbId = target.pdbId || '1M17';
        $3Dmol.download(`pdb:${pdbId}`, viewer, {}, () => {
          // Cartoon style for protein
          if (renderStyle === 'cartoon') {
            viewer.setStyle({ hetflag: false }, { cartoon: { color: 'spectrum' } });
          } else if (renderStyle === 'surface') {
            viewer.setStyle({ hetflag: false }, { cartoon: { color: 'teal', opacity: 0.6 } });
            viewer.addSurface($3Dmol.SurfaceType.MS, { opacity: 0.7, color: 'white' });
          } else if (renderStyle === 'stick') {
            viewer.setStyle({ hetflag: false }, { stick: { colorscheme: 'amino' } });
          } else {
            viewer.setStyle({ hetflag: false }, { sphere: { scale: 0.3 } });
          }

          // Ligand highlighted in binding pocket
          viewer.setStyle({ hetflag: true }, { stick: { colorscheme: 'cyanCarbon', radius: 0.3 } });

          // Labels
          if (showLabels) {
            viewer.addLabel(`${compound.name} (Ligand)`, {
              position: { x: 14.2, y: -8.6, z: 22.1 },
              backgroundColor: 'black',
              backgroundOpacity: 0.8,
              fontColor: 'cyan',
              fontSize: 12,
            });
          }

          viewer.zoomTo();
          viewer.render();
        });
      } catch (e) {
        console.warn('3Dmol initialization fallback to interactive canvas:', e);
      }
    }

    return () => {
      if (viewer && viewer.clear) viewer.clear();
    };
  }, [selectedJobId, renderStyle, showLabels, target.pdbId]);

  // Interactive 3D Canvas Fallback / Animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let autoRotate = 0;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const cx = canvas.width / 2;
      const cy = canvas.height / 2;

      autoRotate += 0.005;
      const radX = ((rotation.x) * Math.PI) / 180;
      const radY = ((rotation.y + autoRotate * 40) * Math.PI) / 180;

      // Coordinate projection helper
      const project = (x: number, y: number, z: number) => {
        // Rotate Y
        const x1 = x * Math.cos(radY) + z * Math.sin(radY);
        const z1 = -x * Math.sin(radY) + z * Math.cos(radY);
        // Rotate X
        const y2 = y * Math.cos(radX) - z1 * Math.sin(radX);
        const z2 = y * Math.sin(radX) + z1 * Math.cos(radX);
        const scale = (350 / (350 + z2 * 0.5)) * zoom;
        return { px: cx + x1 * scale, py: cy + y2 * scale, z: z2 };
      };

      // Draw active binding pocket surface mesh
      ctx.beginPath();
      ctx.arc(cx, cy, 95 * zoom, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(13, 148, 136, 0.08)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(13, 148, 136, 0.25)';
      ctx.setLineDash([4, 4]);
      ctx.stroke();
      ctx.setLineDash([]);

      // Draw Key Interacting Residues
      const residues = [
        { name: 'Thr315', x: -50, y: -40, z: 20, color: '#F59E0B', type: 'H-Bond' },
        { name: 'Glu286', x: -60, y: 30, z: -10, color: '#F59E0B', type: 'H-Bond' },
        { name: 'Asp381', x: 45, y: -30, z: -25, color: '#A855F7', type: 'Salt Bridge' },
        { name: 'Met318', x: 55, y: 35, z: 15, color: '#06B6D4', type: 'Hydrophobic' },
        { name: 'Phe382', x: 10, y: 55, z: -35, color: '#3B82F6', type: 'pi-Stacking' },
      ];

      // Draw Ligand Center
      const ligandCenter = project(0, 0, 0);

      // Ligand Ring Atoms
      const ligandAtoms = [
        { x: -20, y: -10, z: 0 },
        { x: -5, y: -25, z: 5 },
        { x: 18, y: -18, z: -5 },
        { x: 22, y: 5, z: 0 },
        { x: 5, y: 18, z: -5 },
        { x: -15, y: 12, z: 5 },
      ];

      // Draw Ligand bonds
      ctx.beginPath();
      ligandAtoms.forEach((a, i) => {
        const p = project(a.x, a.y, a.z);
        if (i === 0) ctx.moveTo(p.px, p.py);
        else ctx.lineTo(p.px, p.py);
      });
      ctx.closePath();
      ctx.strokeStyle = '#38BDF8';
      ctx.lineWidth = 3.5;
      ctx.stroke();

      // Ligand Atoms
      ligandAtoms.forEach((a) => {
        const p = project(a.x, a.y, a.z);
        ctx.beginPath();
        ctx.arc(p.px, p.py, 4.5 * zoom, 0, Math.PI * 2);
        ctx.fillStyle = '#0284C7';
        ctx.fill();
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 1;
        ctx.stroke();
      });

      // Draw Interaction bonds & measurements
      residues.forEach((r) => {
        const p = project(r.x, r.y, r.z);

        // Dashed interaction line
        if (
          (r.type === 'H-Bond' && showHBonds) ||
          (r.type === 'Salt Bridge' && showSaltBridges) ||
          (r.type === 'Hydrophobic' && showHydrophobic)
        ) {
          ctx.beginPath();
          ctx.setLineDash(r.type === 'H-Bond' ? [4, 3] : r.type === 'Salt Bridge' ? [6, 4] : [2, 2]);
          ctx.moveTo(ligandCenter.px, ligandCenter.py);
          ctx.lineTo(p.px, p.py);
          ctx.strokeStyle = r.color;
          ctx.lineWidth = 1.8;
          ctx.stroke();
          ctx.setLineDash([]);

          // Distance measurement label
          if (showDistanceMeasurements) {
            const midX = (ligandCenter.px + p.px) / 2;
            const midY = (ligandCenter.py + p.py) / 2;
            ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
            ctx.fillRect(midX - 18, midY - 9, 36, 14);
            ctx.fillStyle = r.color;
            ctx.font = '10px monospace';
            ctx.fillText('2.8 Å', midX - 14, midY + 2);
          }
        }

        // Residue Node
        ctx.beginPath();
        ctx.arc(p.px, p.py, 6 * zoom, 0, Math.PI * 2);
        ctx.fillStyle = r.color;
        ctx.fill();
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Residue Label
        if (showLabels) {
          ctx.fillStyle = '#FFFFFF';
          ctx.font = '11px sans-serif';
          ctx.fillText(r.name, p.px + 8, p.py + 4);
        }
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationFrameId);
  }, [rotation, zoom, showHBonds, showHydrophobic, showSaltBridges, showLabels, showDistanceMeasurements]);

  // Mouse drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    isDraggingRef.current = true;
    lastMousePosRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current) return;
    const dx = e.clientX - lastMousePosRef.current.x;
    const dy = e.clientY - lastMousePosRef.current.y;
    setRotation((prev) => ({ x: prev.x + dy * 0.5, y: prev.y + dx * 0.5 }));
    lastMousePosRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="border-b border-slate-200 pb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Interaction Viewer
            </h1>
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-teal-50 text-teal-800 border border-teal-200">
              3D Structural Docking
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Examine 3D protein–ligand binding pocket geometry, active residue hydrogen bonds, and electrostatic distances.
          </p>
        </div>

        {/* Job selector */}
        <div className="flex items-center space-x-2">
          <Link
            to="/analysis/new"
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-lg bg-[#1E3A8A] hover:bg-[#1B365D] text-white font-medium text-xs shadow-2xs transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-200" />
            <span>New Analysis</span>
          </Link>
        </div>
      </div>

      {/* Target & Ligand Identity Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Pill className="w-4 h-4 text-blue-700" />
            <span className="text-slate-500 font-mono">Ligand:</span>
            <strong className="text-slate-900 font-sans">{compound.name}</strong>
            <span className="font-mono text-slate-400 text-[11px]">({compound.id})</span>
          </div>

          <div className="h-4 w-px bg-slate-200 hidden sm:block" />

          <div className="flex items-center space-x-2">
            <Crosshair className="w-4 h-4 text-teal-600" />
            <span className="text-slate-500 font-mono">Receptor:</span>
            <strong className="text-teal-900 font-sans">{target.geneSymbol}</strong>
            <span className="font-mono text-slate-400 text-[11px]">PDB: {target.pdbId || '1M17'}</span>
          </div>
        </div>

        <div className="flex items-center space-x-3 font-mono text-[11px]">
          <span className="px-2 py-1 rounded bg-blue-50 text-blue-900 font-bold border border-blue-200">
            Docking Score: {job?.dockingScore ?? -11.4} kcal/mol
          </span>
          <span className="px-2 py-1 rounded bg-emerald-50 text-emerald-800 font-bold border border-emerald-200">
            Kd: {job?.predictedKdNm ?? 0.7} nM
          </span>
        </div>
      </div>

      {/* Main 3D Canvas & Visualization Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left 3 Columns: 3D Mol Viewer Area */}
        <div className="lg:col-span-3 space-y-3">
          <div className="bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 relative shadow-lg">
            {/* 3D Visualizer Canvas */}
            <div
              className="relative w-full h-[520px] cursor-grab active:cursor-grabbing flex items-center justify-center select-none"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            >
              <canvas
                ref={canvasRef}
                width={800}
                height={520}
                className="w-full h-full object-contain"
              />

              {/* Watermark Overlay */}
              <div className="absolute top-4 left-4 pointer-events-none text-left">
                <span className="text-[10px] font-mono uppercase font-bold text-teal-400 bg-teal-950/80 px-2 py-1 rounded border border-teal-800 backdrop-blur-xs">
                  Active Pocket: {target.geneSymbol} ({target.pdbId || '1M17'})
                </span>
                <p className="text-[11px] text-slate-300 font-mono mt-1 drop-shadow-md">
                  Ligand: {compound.name} &bull; Drag to rotate &bull; Interactive binding pocket
                </p>
              </div>

              {/* On-screen Zoom & Reset Controls */}
              <div className="absolute bottom-4 right-4 flex items-center space-x-1.5 bg-slate-900/90 p-1.5 rounded-xl border border-slate-700 backdrop-blur-xs text-xs text-white">
                <button
                  onClick={() => setZoom((z) => Math.min(z + 0.15, 2.2))}
                  className="p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
                  title="Zoom In"
                >
                  <ZoomIn className="w-4 h-4 text-slate-300" />
                </button>
                <button
                  onClick={() => setZoom((z) => Math.max(z - 0.15, 0.5))}
                  className="p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-4 h-4 text-slate-300" />
                </button>
                <button
                  onClick={() => {
                    setRotation({ x: 25, y: -45 });
                    setZoom(1);
                  }}
                  className="p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
                  title="Reset View"
                >
                  <RotateCcw className="w-4 h-4 text-slate-300" />
                </button>
              </div>
            </div>
          </div>

          {/* Interactive Legend Bar */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-4 text-xs font-mono">
            <div className="flex items-center space-x-4">
              <span className="text-slate-500 uppercase text-[10px] font-bold">Contact Legend:</span>
              <div className="flex items-center space-x-1.5">
                <span className="w-3 h-3 rounded-full bg-amber-500" />
                <span className="text-slate-700">Hydrogen Bond (H-Bond)</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-3 h-3 rounded-full bg-purple-500" />
                <span className="text-slate-700">Salt Bridge</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-3 h-3 rounded-full bg-cyan-500" />
                <span className="text-slate-700">Hydrophobic</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-3 h-3 rounded-full bg-blue-500" />
                <span className="text-slate-700">&pi;&ndash;Stacking</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right 1 Column: Display Toggles & Active Residues */}
        <div className="space-y-4">
          {/* Display Layers & Options */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4 text-xs">
            <h3 className="font-bold text-slate-900 uppercase font-mono tracking-wider text-[11px] pb-2 border-b border-slate-100">
              Display & Contact Layers
            </h3>

            {/* Protein Representation Style */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-mono text-slate-500 block">Receptor Representation</label>
              <div className="grid grid-cols-2 gap-1.5">
                {(['cartoon', 'surface', 'stick', 'sphere'] as const).map((style) => (
                  <button
                    key={style}
                    onClick={() => setRenderStyle(style)}
                    className={`py-1.5 px-2 rounded-lg font-mono text-[11px] capitalize transition-colors ${
                      renderStyle === style
                        ? 'bg-[#1E3A8A] text-white font-semibold'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200'
                    }`}
                  >
                    {style}
                  </button>
                ))}
              </div>
            </div>

            {/* Contact Visibility Checkboxes */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <label className="text-[11px] font-mono text-slate-500 block">Show Interaction Contacts</label>
              <label className="flex items-center space-x-2 text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showHBonds}
                  onChange={(e) => setShowHBonds(e.target.checked)}
                  className="rounded border-slate-300 text-amber-600 focus:ring-amber-500"
                />
                <span>Hydrogen Bonds (Yellow)</span>
              </label>

              <label className="flex items-center space-x-2 text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showSaltBridges}
                  onChange={(e) => setShowSaltBridges(e.target.checked)}
                  className="rounded border-slate-300 text-purple-600 focus:ring-purple-500"
                />
                <span>Salt Bridges (Magenta)</span>
              </label>

              <label className="flex items-center space-x-2 text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showHydrophobic}
                  onChange={(e) => setShowHydrophobic(e.target.checked)}
                  className="rounded border-slate-300 text-cyan-600 focus:ring-cyan-500"
                />
                <span>Hydrophobic Contacts (Cyan)</span>
              </label>

              <label className="flex items-center space-x-2 text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showLabels}
                  onChange={(e) => setShowLabels(e.target.checked)}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <span>Residue Labels (Thr315, Glu286...)</span>
              </label>

              <label className="flex items-center space-x-2 text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showDistanceMeasurements}
                  onChange={(e) => setShowDistanceMeasurements(e.target.checked)}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <span>Distance Measurements (Å)</span>
              </label>
            </div>
          </div>

          {/* Active Pocket Residues Breakdown */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-3 text-xs">
            <h3 className="font-bold text-slate-900 uppercase font-mono tracking-wider text-[11px] pb-2 border-b border-slate-100">
              Active Pocket Residue Table
            </h3>

            <div className="space-y-2 font-mono text-[11px]">
              {job?.contacts?.map((c, i) => (
                <div
                  key={i}
                  className="p-2 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between"
                >
                  <div>
                    <span className="font-bold text-slate-900">{c.residueName}{c.residueNumber}</span>
                    <span className="text-slate-400 ml-1">({c.atomName})</span>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-800 font-bold">{c.distanceAngstrom} Å</span>
                    <span className="block text-[10px] text-slate-400">{c.contactType}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2">
              <Link
                to={`/admet?compound=${compound.id}`}
                className="w-full flex items-center justify-center space-x-1.5 py-2 px-3 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-medium text-xs transition-colors"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-blue-700" />
                <span>Evaluate ADMET Properties</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InteractionViewerPage;
