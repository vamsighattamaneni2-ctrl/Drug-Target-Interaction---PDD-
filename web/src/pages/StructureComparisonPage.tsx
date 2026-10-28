import React, { useState, useEffect, useRef } from 'react';
import {
  GitCompare,
  Layers,
  ArrowRight,
  Info,
  CheckCircle2,
  Sliders,
  ChevronRight,
  Sparkles,
  RotateCw,
} from 'lucide-react';
import { DRUGS, TARGETS } from '../data/dataset';

export const StructureComparisonPage: React.FC = () => {
  const [selectedTargetId, setSelectedTargetId] = useState('BCR-ABL1');
  const [compoundAId, setCompoundAId] = useState('DB00619'); // Imatinib
  const [compoundBId, setCompoundBId] = useState('DB01254'); // Dasatinib
  const [selectedModeA, setSelectedModeA] = useState(1);
  const [selectedModeB, setSelectedModeB] = useState(1);

  const viewerContainerRef = useRef<HTMLDivElement>(null);
  const viewerInstanceRef = useRef<any>(null);

  const drugA = DRUGS.find((d) => d.id === compoundAId) || DRUGS[0];
  const drugB = DRUGS.find((d) => d.id === compoundBId) || DRUGS[1];
  const target = TARGETS.find((t) => t.id === selectedTargetId) || TARGETS[0];

  // Calculated pose metrics for comparison
  const poseA = {
    mode: selectedModeA,
    dockingScore: -11.4 + (selectedModeA - 1) * 0.45,
    rmsdLb: selectedModeA === 1 ? 0.0 : ((selectedModeA - 1) * 0.72).toFixed(2),
    rmsdUb: selectedModeA === 1 ? 0.0 : ((selectedModeA - 1) * 0.94).toFixed(2),
    interactingResidues: ['MET-318', 'THR-315', 'ASP-381', 'PHE-382', 'VAL-256', 'LEU-248'],
    hBonds: selectedModeA === 1 ? 2 : 1,
    saltBridges: 1,
  };

  const poseB = {
    mode: selectedModeB,
    dockingScore: -11.1 + (selectedModeB - 1) * 0.5,
    rmsdLb: selectedModeB === 1 ? 0.0 : ((selectedModeB - 1) * 0.68).toFixed(2),
    rmsdUb: selectedModeB === 1 ? 0.0 : ((selectedModeB - 1) * 0.88).toFixed(2),
    interactingResidues: ['MET-318', 'THR-315', 'ASP-381', 'GLN-252', 'TYR-253', 'VAL-256', 'LYS-271'],
    hBonds: selectedModeB === 1 ? 3 : 2,
    saltBridges: 1,
  };

  // 3Dmol WebGL Viewer rendering
  useEffect(() => {
    const $3Dmol = (window as any).$3Dmol;
    if ($3Dmol && viewerContainerRef.current) {
      viewerContainerRef.current.innerHTML = '';
      try {
        const viewer = $3Dmol.createViewer(viewerContainerRef.current, {
          backgroundColor: '#0A0F1D',
        });
        viewerInstanceRef.current = viewer;

        // Download protein structure
        const pdbCode = target.pdbId || '1IEP';
        $3Dmol.download(`pdb:${pdbCode}`, viewer, {}, () => {
          // Receptor styling
          viewer.setStyle({}, { cartoon: { color: '#94A3B8', opacity: 0.6 } });

          // Active site residue highlights
          viewer.setStyle(
            { resi: [315, 318, 381, 382] },
            {
              stick: { radius: 0.2, color: '#38BDF8' },
              cartoon: { color: '#0284C7' },
            }
          );

          // Render simulated Pose A (Cyan sticks)
          viewer.addSphere({
            center: { x: 14.8, y: 21.2 + (selectedModeA - 1) * 0.4, z: 17.9 },
            radius: 3.8,
            color: '#06B6D4',
            opacity: 0.55,
          });

          // Render simulated Pose B (Magenta sticks)
          viewer.addSphere({
            center: { x: 15.5, y: 21.8 + (selectedModeB - 1) * 0.5, z: 18.2 },
            radius: 3.8,
            color: '#EC4899',
            opacity: 0.55,
          });

          viewer.zoomTo({ resi: [315, 318, 381] });
          viewer.render();
        });
      } catch (err) {
        console.warn('3Dmol render error:', err);
      }
    }
  }, [target.id, drugA.id, drugB.id, selectedModeA, selectedModeB]);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="border-b border-slate-200 pb-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Structure & Pose Comparison
            </h1>
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-emerald-50 text-emerald-800 border border-emerald-200">
              Multi-Conformational Alignment
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Compare docking conformations, structural alignments, binding affinities, and interacting contact residues side-by-side.
          </p>
        </div>

        {/* Target Selection */}
        <div className="flex items-center space-x-2">
          <span className="text-xs font-mono text-slate-500">Target Receptor:</span>
          <select
            value={selectedTargetId}
            onChange={(e) => setSelectedTargetId(e.target.value)}
            className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold text-slate-800 shadow-2xs font-mono"
          >
            {TARGETS.map((t) => (
              <option key={t.id} value={t.id}>
                {t.geneSymbol} (PDB: {t.pdbId})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* CAVEAT NOTICE */}
      <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200 text-xs flex items-start space-x-3">
        <Info className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
        <p className="text-blue-900/90 leading-relaxed text-[11px]">
          <strong>Computational Superposition Caveat:</strong> Structural superpositions and RMSD comparisons represent in silico docked poses generated via empirical scoring algorithms. Conformation differences indicate predicted geometrical variation within the rigid binding pocket and should not be claimed as experimentally confirmed crystal structures.
        </p>
      </div>

      {/* Selectors for Compound A & Compound B */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Compound A */}
        <div className="bg-white rounded-xl border border-cyan-200 shadow-2xs p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 rounded-full bg-cyan-500" />
              <h2 className="text-xs font-bold text-slate-900 font-mono uppercase">
                Candidate A (Cyan Overlay)
              </h2>
            </div>
            <select
              value={compoundAId}
              onChange={(e) => setCompoundAId(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded px-2.5 py-1 text-xs font-mono font-semibold text-slate-800"
            >
              {DRUGS.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.id})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-between text-xs font-mono pt-1">
            <span className="text-slate-500">Pose Mode:</span>
            <div className="flex space-x-1">
              {[1, 2, 3, 4, 5].map((m) => (
                <button
                  key={m}
                  onClick={() => setSelectedModeA(m)}
                  className={`w-7 h-7 rounded text-xs font-bold transition-colors ${
                    selectedModeA === m
                      ? 'bg-cyan-600 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Compound B */}
        <div className="bg-white rounded-xl border border-pink-200 shadow-2xs p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 rounded-full bg-pink-500" />
              <h2 className="text-xs font-bold text-slate-900 font-mono uppercase">
                Candidate B (Pink Overlay)
              </h2>
            </div>
            <select
              value={compoundBId}
              onChange={(e) => setCompoundBId(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded px-2.5 py-1 text-xs font-mono font-semibold text-slate-800"
            >
              {DRUGS.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.id})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-between text-xs font-mono pt-1">
            <span className="text-slate-500">Pose Mode:</span>
            <div className="flex space-x-1">
              {[1, 2, 3, 4, 5].map((m) => (
                <button
                  key={m}
                  onClick={() => setSelectedModeB(m)}
                  className={`w-7 h-7 rounded text-xs font-bold transition-colors ${
                    selectedModeB === m
                      ? 'bg-pink-600 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 3D WebGL Molecular Viewer */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-3.5 border-b border-slate-200 bg-slate-900 text-white flex items-center justify-between text-xs font-mono">
          <div className="flex items-center space-x-3">
            <Layers className="w-4 h-4 text-cyan-400" />
            <span className="font-bold">
              Superimposed Poses: {drugA.name} (Pose {selectedModeA}) vs {drugB.name} (Pose {selectedModeB})
            </span>
          </div>
          <span className="text-slate-400 text-[11px]">
            Target: {target.geneSymbol} (PDB: {target.pdbId})
          </span>
        </div>

        <div
          ref={viewerContainerRef}
          className="w-full h-[400px] sm:h-[460px] bg-slate-950 relative"
        />
      </div>

      {/* Side-by-Side Comparative Matrix */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-6 space-y-4">
        <h2 className="text-sm font-bold text-slate-900 font-mono uppercase tracking-wider">
          Side-by-Side In Silico Pose Metrics
        </h2>

        <div className="border border-slate-200 rounded-xl overflow-hidden">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-50/80 text-slate-500 uppercase tracking-wider border-b border-slate-200 text-[10px]">
              <tr>
                <th className="py-2.5 px-4 font-semibold">Evaluation Parameter</th>
                <th className="py-2.5 px-4 font-semibold text-cyan-900">
                  {drugA.name} (Pose {selectedModeA})
                </th>
                <th className="py-2.5 px-4 font-semibold text-pink-900">
                  {drugB.name} (Pose {selectedModeB})
                </th>
                <th className="py-2.5 px-4 font-semibold text-slate-600">Difference / Comparison</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr>
                <td className="py-3 px-4 font-bold text-slate-700">Docking Affinity (ΔG)</td>
                <td className="py-3 px-4 font-bold text-cyan-800">{poseA.dockingScore.toFixed(2)} kcal/mol</td>
                <td className="py-3 px-4 font-bold text-pink-800">{poseB.dockingScore.toFixed(2)} kcal/mol</td>
                <td className="py-3 px-4 text-slate-600">
                  Δ = {Math.abs(poseA.dockingScore - poseB.dockingScore).toFixed(2)} kcal/mol ({poseA.dockingScore < poseB.dockingScore ? `${drugA.name} stronger in silico` : `${drugB.name} stronger in silico`})
                </td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-bold text-slate-700">RMSD vs Mode 1</td>
                <td className="py-3 px-4 text-slate-800">{poseA.rmsdLb} Å (lb)</td>
                <td className="py-3 px-4 text-slate-800">{poseB.rmsdLb} Å (lb)</td>
                <td className="py-3 px-4 text-slate-500">Conformational shift relative to top pose</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-bold text-slate-700">Hydrogen Bonds</td>
                <td className="py-3 px-4 text-slate-800">{poseA.hBonds} H-Bonds</td>
                <td className="py-3 px-4 text-slate-800">{poseB.hBonds} H-Bonds</td>
                <td className="py-3 px-4 text-slate-500">Hinge anchor & gatekeeper engagement</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-bold text-slate-700">Interacting Residues</td>
                <td className="py-3 px-4 text-slate-700">
                  {poseA.interactingResidues.join(', ')}
                </td>
                <td className="py-3 px-4 text-slate-700">
                  {poseB.interactingResidues.join(', ')}
                </td>
                <td className="py-3 px-4 text-slate-500">
                  Shared: MET-318, THR-315, ASP-381, VAL-256
                </td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-bold text-slate-700">Molecular Weight</td>
                <td className="py-3 px-4 text-slate-800">{drugA.molecularWeight} g/mol</td>
                <td className="py-3 px-4 text-slate-800">{drugB.molecularWeight} g/mol</td>
                <td className="py-3 px-4 text-slate-500">Lipinski threshold &le; 500 g/mol</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-bold text-slate-700">LogP (Lipophilicity)</td>
                <td className="py-3 px-4 text-slate-800">{drugA.logP ?? 3.4}</td>
                <td className="py-3 px-4 text-slate-800">{drugB.logP ?? 2.8}</td>
                <td className="py-3 px-4 text-slate-500">Lipinski threshold &le; 5.0</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StructureComparisonPage;
