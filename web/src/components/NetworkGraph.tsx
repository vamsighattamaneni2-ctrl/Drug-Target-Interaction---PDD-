import React, { useState, useMemo } from 'react';
import { DRUGS, TARGETS, DISEASES, PATHWAYS, INTERACTIONS } from '../data/dataset';
import { ConfidenceLevel } from '../types';
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Search,
  Filter,
  Layers,
  Info,
  Pill,
  Crosshair,
  GitBranch,
  HeartPulse,
} from 'lucide-react';

export interface NetworkNode {
  id: string;
  name: string;
  type: 'drug' | 'target' | 'pathway' | 'disease';
  category: string;
  x: number;
  y: number;
  connections: number;
  details: any;
}

export interface NetworkLink {
  source: string;
  target: string;
  score: number;
  confidence: ConfidenceLevel;
  type: string;
}

interface NetworkGraphProps {
  initialDrugId?: string;
  initialTargetId?: string;
  initialDiseaseId?: string;
  initialPathwayId?: string;
  height?: number;
  onSelectNode?: (node: NetworkNode | null) => void;
}

export const NetworkGraph: React.FC<NetworkGraphProps> = ({
  initialDrugId,
  initialTargetId,
  initialDiseaseId,
  initialPathwayId,
  height = 580,
  onSelectNode,
}) => {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(
    initialDrugId || initialTargetId || initialDiseaseId || initialPathwayId || 'DB00619'
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [minConfidence, setMinConfidence] = useState<'ALL' | 'HIGH' | 'MEDIUM'>('ALL');
  const [activeFilterType, setActiveFilterType] = useState<'ALL' | 'drug' | 'target' | 'pathway' | 'disease'>('ALL');

  // Compute filtered interactions based on confidence
  const filteredInteractions = useMemo(() => {
    return INTERACTIONS.filter((int) => {
      if (minConfidence === 'HIGH') return int.confidence === 'High';
      if (minConfidence === 'MEDIUM') return int.confidence === 'High' || int.confidence === 'Medium';
      return true;
    });
  }, [minConfidence]);

  // Generate 4 distinct columns:
  // Column 1: Drug (X = 100)
  // Column 2: Target (X = 350)
  // Column 3: Pathway (X = 600)
  // Column 4: Disease (X = 850)
  const { nodes, links } = useMemo(() => {
    const rawNodes: NetworkNode[] = [];
    const rawLinks: NetworkLink[] = [];

    // 1. Drugs (Left Column)
    DRUGS.forEach((d, index) => {
      const spacing = 480 / (DRUGS.length + 1);
      rawNodes.push({
        id: d.id,
        name: d.name,
        type: 'drug',
        category: d.therapeuticClass.split('/')[1]?.trim() || d.type,
        x: 100,
        y: 40 + (index + 1) * spacing,
        connections: d.targetIds.length + d.diseaseIds.length,
        details: d,
      });
    });

    // 2. Targets (Middle-Left Column)
    TARGETS.forEach((t, index) => {
      const spacing = 480 / (TARGETS.length + 1);
      rawNodes.push({
        id: t.id,
        name: t.geneSymbol,
        type: 'target',
        category: t.targetClass,
        x: 350,
        y: 35 + (index + 1) * spacing,
        connections: t.drugIds.length + t.diseaseIds.length,
        details: t,
      });
    });

    // 3. Pathways (Middle-Right Column)
    PATHWAYS.forEach((pw, index) => {
      const spacing = 480 / (PATHWAYS.length + 1);
      rawNodes.push({
        id: pw.id,
        name: pw.name.split(' ')[0] + ' ' + (pw.name.split(' ')[1] || ''),
        type: 'pathway',
        category: pw.category,
        x: 600,
        y: 45 + (index + 1) * spacing,
        connections: pw.targetIds.length + pw.diseaseIds.length,
        details: pw,
      });
    });

    // 4. Diseases (Right Column)
    DISEASES.forEach((dis, index) => {
      const spacing = 480 / (DISEASES.length + 1);
      rawNodes.push({
        id: dis.id,
        name: dis.name,
        type: 'disease',
        category: dis.category,
        x: 850,
        y: 55 + (index + 1) * spacing,
        connections: dis.targetIds.length + dis.drugIds.length,
        details: dis,
      });
    });

    // LINKS:
    // Drug -> Target
    filteredInteractions.forEach((int) => {
      rawLinks.push({
        source: int.drugId,
        target: int.targetId,
        score: int.score,
        confidence: int.confidence,
        type: int.interactionType,
      });
    });

    // Target -> Pathway
    PATHWAYS.forEach((pw) => {
      pw.targetIds.forEach((tId) => {
        rawLinks.push({
          source: tId,
          target: pw.id,
          score: 0.9,
          confidence: 'High',
          type: 'Pathway Cascade',
        });
      });

      // Pathway -> Disease
      pw.diseaseIds.forEach((disId) => {
        rawLinks.push({
          source: pw.id,
          target: disId,
          score: 0.85,
          confidence: 'High',
          type: 'Signaling Deregulation',
        });
      });
    });

    // Drug -> Disease (Direct Indication)
    DRUGS.forEach((d) => {
      d.diseaseIds.forEach((disId) => {
        rawLinks.push({
          source: d.id,
          target: disId,
          score: 0.92,
          confidence: 'High',
          type: 'Therapeutic Indication',
        });
      });
    });

    return { nodes: rawNodes, links: rawLinks };
  }, [filteredInteractions]);

  // Selected node and connected nodes
  const selectedNode = useMemo(() => {
    return nodes.find((n) => n.id === selectedNodeId) || null;
  }, [nodes, selectedNodeId]);

  const connectedNodeIds = useMemo(() => {
    if (!selectedNodeId) return new Set<string>();
    const ids = new Set<string>();
    ids.add(selectedNodeId);

    links.forEach((l) => {
      if (l.source === selectedNodeId) ids.add(l.target);
      if (l.target === selectedNodeId) ids.add(l.source);
    });

    return ids;
  }, [selectedNodeId, links]);

  // Mouse pan handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => setIsDragging(false);

  const handleReset = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setSelectedNodeId(null);
    if (onSelectNode) onSelectNode(null);
  };

  const handleNodeClick = (node: NetworkNode) => {
    const nextId = node.id === selectedNodeId ? null : node.id;
    setSelectedNodeId(nextId);
    if (onSelectNode) {
      onSelectNode(nextId ? node : null);
    }
  };

  // Node position map for rendering curves
  const nodeMap = useMemo(() => {
    const map = new Map<string, NetworkNode>();
    nodes.forEach((n) => map.set(n.id, n));
    return map;
  }, [nodes]);

  // Filtered nodes by search or type
  const isNodeVisible = (node: NetworkNode) => {
    if (activeFilterType !== 'ALL' && node.type !== activeFilterType) return false;
    if (searchQuery.trim().length > 0) {
      return (
        node.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        node.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        node.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return true;
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden relative shadow-sm flex flex-col">
      {/* Network Header Controls */}
      <div className="p-3 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-slate-50/70 text-xs">
        {/* Left: Search input */}
        <div className="relative w-48 sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search nodes in network..."
            className="w-full bg-white border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-600 font-sans"
          />
        </div>

        {/* Center: Node Type Filters */}
        <div className="flex items-center space-x-1">
          {(['ALL', 'drug', 'target', 'pathway', 'disease'] as const).map((type) => (
            <button
              key={type}
              onClick={() => setActiveFilterType(type)}
              className={`px-2.5 py-1 rounded text-[11px] font-mono transition-colors ${
                activeFilterType === type
                  ? 'bg-blue-800 text-white font-semibold'
                  : 'text-slate-600 hover:bg-slate-200/60'
              }`}
            >
              {type.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Right: Zoom & Reset */}
        <div className="flex items-center space-x-1">
          <button
            onClick={() => setZoom((z) => Math.min(z + 0.15, 2.2))}
            className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setZoom((z) => Math.max(z - 0.15, 0.6))}
            className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleReset}
            className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700"
            title="Reset Network View"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* SVG Canvas */}
      <div
        className="w-full relative overflow-hidden bg-[#F8FAFC] cursor-grab active:cursor-grabbing select-none"
        style={{ height }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {/* Column Labels */}
        <div className="absolute top-3 left-0 right-0 grid grid-cols-4 px-12 pointer-events-none text-center text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
          <div>DRUGS (LIGANDS)</div>
          <div>TARGETS (KINASES)</div>
          <div>PATHWAYS</div>
          <div>DISEASES</div>
        </div>

        <svg
          width="100%"
          height="100%"
          viewBox="0 0 980 560"
          className="w-full h-full"
        >
          <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
            {/* LINKS */}
            {links.map((link, idx) => {
              const srcNode = nodeMap.get(link.source);
              const tgtNode = nodeMap.get(link.target);
              if (!srcNode || !tgtNode) return null;

              const isHighlighted =
                selectedNodeId &&
                (link.source === selectedNodeId || link.target === selectedNodeId);

              const isDimmed = selectedNodeId && !isHighlighted;

              // Cubic bezier curve for smooth scientific visual connections
              const dx = (tgtNode.x - srcNode.x) / 2;
              const pathD = `M ${srcNode.x} ${srcNode.y} C ${srcNode.x + dx} ${srcNode.y}, ${tgtNode.x - dx} ${tgtNode.y}, ${tgtNode.x} ${tgtNode.y}`;

              return (
                <path
                  key={`${link.source}-${link.target}-${idx}`}
                  d={pathD}
                  fill="none"
                  stroke={
                    isHighlighted
                      ? '#2563EB'
                      : isDimmed
                      ? '#CBD5E1'
                      : link.confidence === 'High'
                      ? '#94A3B8'
                      : '#CBD5E1'
                  }
                  strokeWidth={isHighlighted ? 2.5 : 1.2}
                  strokeOpacity={isDimmed ? 0.2 : isHighlighted ? 0.9 : 0.45}
                  strokeDasharray={link.type === 'Pathology Link' ? '3 3' : undefined}
                />
              );
            })}

            {/* NODES */}
            {nodes.map((node) => {
              const isSelected = node.id === selectedNodeId;
              const isConnected = connectedNodeIds.has(node.id);
              const isVisible = isNodeVisible(node);
              const isDimmed = selectedNodeId && !isConnected;

              // Entity colors:
              // Drug: Blue (#2563EB)
              // Target: Teal (#0D9488)
              // Pathway: Violet (#7C3AED)
              // Disease: Rose (#E11D48)
              const fillColor =
                node.type === 'drug'
                  ? '#2563EB'
                  : node.type === 'target'
                  ? '#0D9488'
                  : node.type === 'pathway'
                  ? '#7C3AED'
                  : '#E11D48';

              return (
                <g
                  key={node.id}
                  transform={`translate(${node.x}, ${node.y})`}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleNodeClick(node);
                  }}
                  className="cursor-pointer"
                  opacity={!isVisible ? 0.15 : isDimmed ? 0.3 : 1}
                >
                  {/* Selection Ring */}
                  {isSelected && (
                    <circle
                      r="16"
                      fill="none"
                      stroke={fillColor}
                      strokeWidth="2.5"
                      strokeOpacity="0.4"
                      className="animate-pulse"
                    />
                  )}

                  {/* Core Node Circle */}
                  <circle
                    r={isSelected ? 10 : 8}
                    fill={fillColor}
                    stroke="#FFFFFF"
                    strokeWidth="2"
                    className="transition-all hover:scale-125"
                  />

                  {/* Node Label Text */}
                  <text
                    x={node.type === 'disease' ? -12 : 12}
                    y="4"
                    textAnchor={node.type === 'disease' ? 'end' : 'start'}
                    fontSize={isSelected ? '11px' : '10px'}
                    fontWeight={isSelected ? '700' : '500'}
                    fill={isSelected ? '#0F172A' : '#334155'}
                    className="font-sans pointer-events-none"
                  >
                    {node.name}
                  </text>
                </g>
              );
            })}
          </g>
        </svg>
      </div>

      {/* Network Legend Footer */}
      <div className="p-3 border-t border-slate-100 flex flex-wrap items-center justify-between text-xs bg-white text-slate-500 font-mono">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
            <span>Drug</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-teal-600" />
            <span>Target</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-violet-600" />
            <span>Pathway</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-600" />
            <span>Disease</span>
          </div>
        </div>

        <div className="text-[11px] text-slate-400">
          Click node to highlight connections & view profile in side panel
        </div>
      </div>
    </div>
  );
};
