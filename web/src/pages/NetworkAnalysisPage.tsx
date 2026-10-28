import React, { useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import {
  Activity,
  ArrowRight,
  Crosshair,
  Dna,
  Filter,
  GitBranch,
  HeartPulse,
  Info,
  Pill,
  RotateCcw,
  Search,
  Share2,
  SlidersHorizontal,
  X,
} from 'lucide-react';
import { DRUGS, TARGETS, DISEASES, INTERACTIONS, PATHWAYS } from '../data/dataset';
import { NetworkGraph, NetworkNode } from '../components/NetworkGraph';

export const NetworkAnalysisPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const initialSelect = searchParams.get('select') || 'DB00619'; // Imatinib default

  const [selectedNode, setSelectedNode] = useState<NetworkNode | null>(() => {
    const defaultDrug = DRUGS.find((d) => d.id === initialSelect) || DRUGS[0];
    return {
      id: defaultDrug.id,
      name: defaultDrug.name,
      type: 'drug',
      category: defaultDrug.therapeuticClass,
      x: 100,
      y: 100,
      connections: defaultDrug.targetIds.length + defaultDrug.diseaseIds.length,
      details: defaultDrug,
    };
  });

  const [selectedDrugFilter, setSelectedDrugFilter] = useState('ALL');
  const [selectedTargetFilter, setSelectedTargetFilter] = useState('ALL');
  const [selectedPathwayFilter, setSelectedPathwayFilter] = useState('ALL');
  const [selectedDiseaseFilter, setSelectedDiseaseFilter] = useState('ALL');
  const [minConfidenceFilter, setMinConfidenceFilter] = useState<'ALL' | 'HIGH' | 'MODERATE'>('ALL');
  const [networkKey, setNetworkKey] = useState(0);

  const handleResetView = () => {
    setSelectedDrugFilter('ALL');
    setSelectedTargetFilter('ALL');
    setSelectedPathwayFilter('ALL');
    setSelectedDiseaseFilter('ALL');
    setMinConfidenceFilter('ALL');
    setSelectedNode(null);
    setNetworkKey((k) => k + 1);
  };

  // Connected interactions for selected node
  const connectedInteractions = selectedNode
    ? INTERACTIONS.filter(
        (i) =>
          (selectedNode.type === 'drug' && i.drugId === selectedNode.id) ||
          (selectedNode.type === 'target' && (i.targetId === selectedNode.id || i.targetGene === selectedNode.name)) ||
          (selectedNode.type === 'disease' && i.diseaseId === selectedNode.id)
      )
    : [];

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* 1. Network Explorer Header */}
      <div className="border-b border-slate-200 pb-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Network Explorer
            </h1>
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-blue-50 text-blue-700 border border-blue-200">
              Multi-Partite Topology
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Topological mapping of molecular interactions: <strong>Drug &rarr; Target &rarr; Pathway &rarr; Disease</strong>
          </p>
        </div>

        {/* Global Controls: Reset View */}
        <div className="flex items-center space-x-2">
          <button
            onClick={handleResetView}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium text-xs shadow-sm transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
            <span>Reset Network</span>
          </button>
        </div>
      </div>

      {/* Network Filter Controls Bar: Entity Types & Confidence */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-wrap items-center gap-3 text-xs">
        <div className="flex items-center space-x-1.5 text-slate-500 font-mono text-[11px] mr-1">
          <Filter className="w-3.5 h-3.5 text-blue-700" />
          <span>Filters:</span>
        </div>

        {/* Drug Filter */}
        <div className="flex items-center space-x-1.5">
          <span className="text-slate-500 font-mono text-[11px]">Drug:</span>
          <select
            value={selectedDrugFilter}
            onChange={(e) => {
              setSelectedDrugFilter(e.target.value);
              if (e.target.value !== 'ALL') {
                const d = DRUGS.find((x) => x.id === e.target.value);
                if (d) {
                  setSelectedNode({
                    id: d.id,
                    name: d.name,
                    type: 'drug',
                    category: d.therapeuticClass,
                    x: 100,
                    y: 100,
                    connections: d.targetIds.length,
                    details: d,
                  });
                }
              }
            }}
            className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-slate-800 focus:outline-none focus:bg-white focus:border-blue-600"
          >
            <option value="ALL">All Drugs</option>
            {DRUGS.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </div>

        {/* Target Filter */}
        <div className="flex items-center space-x-1.5">
          <span className="text-slate-500 font-mono text-[11px]">Target:</span>
          <select
            value={selectedTargetFilter}
            onChange={(e) => {
              setSelectedTargetFilter(e.target.value);
              if (e.target.value !== 'ALL') {
                const t = TARGETS.find((x) => x.id === e.target.value);
                if (t) {
                  setSelectedNode({
                    id: t.id,
                    name: t.geneSymbol,
                    type: 'target',
                    category: t.targetClass,
                    x: 360,
                    y: 100,
                    connections: t.drugIds.length,
                    details: t,
                  });
                }
              }
            }}
            className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-slate-800 focus:outline-none focus:bg-white focus:border-blue-600"
          >
            <option value="ALL">All Targets</option>
            {TARGETS.map((t) => (
              <option key={t.id} value={t.id}>
                {t.geneSymbol} ({t.id})
              </option>
            ))}
          </select>
        </div>

        {/* Pathway Filter */}
        <div className="flex items-center space-x-1.5">
          <span className="text-slate-500 font-mono text-[11px]">Pathway:</span>
          <select
            value={selectedPathwayFilter}
            onChange={(e) => {
              setSelectedPathwayFilter(e.target.value);
              if (e.target.value !== 'ALL') {
                const p = PATHWAYS.find((x) => x.id === e.target.value);
                if (p) {
                  setSelectedNode({
                    id: p.id,
                    name: p.name,
                    type: 'pathway',
                    category: p.category,
                    x: 640,
                    y: 100,
                    connections: p.targetIds.length,
                    details: p,
                  });
                }
              }
            }}
            className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-slate-800 focus:outline-none focus:bg-white focus:border-blue-600"
          >
            <option value="ALL">All Pathways</option>
            {PATHWAYS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        {/* Disease Filter */}
        <div className="flex items-center space-x-1.5">
          <span className="text-slate-500 font-mono text-[11px]">Disease:</span>
          <select
            value={selectedDiseaseFilter}
            onChange={(e) => {
              setSelectedDiseaseFilter(e.target.value);
              if (e.target.value !== 'ALL') {
                const dis = DISEASES.find((x) => x.id === e.target.value);
                if (dis) {
                  setSelectedNode({
                    id: dis.id,
                    name: dis.name,
                    type: 'disease',
                    category: dis.category,
                    x: 900,
                    y: 100,
                    connections: dis.targetIds.length,
                    details: dis,
                  });
                }
              }
            }}
            className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-slate-800 focus:outline-none focus:bg-white focus:border-blue-600"
          >
            <option value="ALL">All Diseases</option>
            {DISEASES.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </div>

        {/* Confidence Strata Filter */}
        <div className="flex items-center space-x-1.5 border-l border-slate-200 pl-3">
          <span className="text-slate-500 font-mono text-[11px]">Confidence:</span>
          <select
            value={minConfidenceFilter}
            onChange={(e) => setMinConfidenceFilter(e.target.value as any)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-slate-800 focus:outline-none focus:bg-white focus:border-blue-600"
          >
            <option value="ALL">All Confidence Levels</option>
            <option value="HIGH">High Confidence (&ge; 0.85)</option>
            <option value="MODERATE">Moderate & High (&ge; 0.70)</option>
          </select>
        </div>
      </div>

      {/* Network Central Visualization & Right Detail Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Large Central Network (3 cols or 4 if no selection) */}
        <div className={`${selectedNode ? 'lg:col-span-3' : 'lg:col-span-4'}`}>
          <NetworkGraph
            key={networkKey}
            initialDrugId={selectedDrugFilter !== 'ALL' ? selectedDrugFilter : undefined}
            initialTargetId={selectedTargetFilter !== 'ALL' ? selectedTargetFilter : undefined}
            initialDiseaseId={selectedDiseaseFilter !== 'ALL' ? selectedDiseaseFilter : undefined}
            height={620}
            onSelectNode={(node) => setSelectedNode(node)}
          />
        </div>

        {/* Right-Side Detail Panel (1 col) */}
        {selectedNode && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4 animate-in fade-in duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <span className="text-xs font-bold font-mono uppercase text-slate-400">
                Node Profile & Properties
              </span>
              <button
                onClick={() => setSelectedNode(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Node Identity */}
            <div>
              <span
                className={`inline-block px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                  selectedNode.type === 'drug'
                    ? 'bg-blue-100 text-blue-800'
                    : selectedNode.type === 'target'
                    ? 'bg-teal-100 text-teal-800'
                    : selectedNode.type === 'pathway'
                    ? 'bg-purple-100 text-purple-800'
                    : 'bg-rose-100 text-rose-800'
                }`}
              >
                {selectedNode.type}
              </span>
              <h3 className="text-base font-bold text-slate-900 mt-1">{selectedNode.name}</h3>
              <p className="text-xs text-slate-400 font-mono">{selectedNode.id}</p>
            </div>

            {/* Classification */}
            <div className="text-xs p-3 rounded-lg bg-slate-50 border border-slate-200">
              <div className="text-[10px] font-mono text-slate-400 uppercase">Classification</div>
              <div className="font-medium text-slate-800 mt-0.5">{selectedNode.category}</div>
            </div>

            {/* Description */}
            {selectedNode.details?.description && (
              <div className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">
                {selectedNode.details.description}
              </div>
            )}

            {/* Connected Interactions List */}
            <div className="space-y-2">
              <div className="text-[11px] font-mono text-slate-400 uppercase font-semibold">
                Associated Interactions ({connectedInteractions.length})
              </div>
              <div className="max-h-48 overflow-y-auto space-y-1.5 divide-y divide-slate-100 text-xs">
                {connectedInteractions.length === 0 ? (
                  <p className="text-slate-400 italic text-[11px] py-1">No direct pairwise records</p>
                ) : (
                  connectedInteractions.map((int) => (
                    <div key={int.id} className="pt-1.5 flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-slate-800">
                          {selectedNode.type === 'drug' ? int.targetGene : int.drugName}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          Score: {int.score.toFixed(2)} &bull; {int.confidence}
                        </div>
                      </div>
                      <button
                        onClick={() =>
                          navigate(`/analysis/interaction?drug=${int.drugId}&target=${int.targetId}`)
                        }
                        className="px-2 py-1 rounded bg-blue-50 hover:bg-blue-100 text-blue-700 text-[11px] font-medium"
                      >
                        Analyze
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Open Profile Main Button */}
            <div className="pt-3 border-t border-slate-100">
              {selectedNode.type === 'drug' && (
                <Link
                  to={`/drugs/${selectedNode.id}`}
                  className="w-full flex items-center justify-center space-x-1.5 py-2.5 px-3 rounded-lg bg-[#1E3A8A] hover:bg-[#1B365D] text-white font-medium text-xs shadow-sm transition-colors"
                >
                  <span>Open Drug Profile</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              )}
              {selectedNode.type === 'target' && (
                <Link
                  to={`/targets/${selectedNode.id}`}
                  className="w-full flex items-center justify-center space-x-1.5 py-2.5 px-3 rounded-lg bg-[#1E3A8A] hover:bg-[#1B365D] text-white font-medium text-xs shadow-sm transition-colors"
                >
                  <span>Open Target Profile</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              )}
              {selectedNode.type === 'pathway' && (
                <Link
                  to={`/pathways/${selectedNode.id}`}
                  className="w-full flex items-center justify-center space-x-1.5 py-2.5 px-3 rounded-lg bg-[#1E3A8A] hover:bg-[#1B365D] text-white font-medium text-xs shadow-sm transition-colors"
                >
                  <span>Open Pathway Profile</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              )}
              {selectedNode.type === 'disease' && (
                <Link
                  to={`/diseases/${selectedNode.id}`}
                  className="w-full flex items-center justify-center space-x-1.5 py-2.5 px-3 rounded-lg bg-[#1E3A8A] hover:bg-[#1B365D] text-white font-medium text-xs shadow-sm transition-colors"
                >
                  <span>Open Disease Profile</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
