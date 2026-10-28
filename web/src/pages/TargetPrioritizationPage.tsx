import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ListFilter,
  Crosshair,
  Search,
  Activity,
  Share2,
  GitBranch,
  ShieldAlert,
  Info,
  CheckCircle2,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import { TARGET_PRIORITIZATIONS, TARGETS } from '../data/dataset';

export const TargetPrioritizationPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTier, setSelectedTier] = useState('ALL');

  const tiers = ['Tier 1 (High Priority)', 'Tier 2 (Moderate Priority)', 'Tier 3 (Candidate)'];

  const filteredTargets = TARGET_PRIORITIZATIONS.filter((t) => {
    const matchesSearch =
      t.geneSymbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.proteinName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.targetClass.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.computationalRationale.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesTier = selectedTier === 'ALL' || t.priorityTier === selectedTier;

    return matchesSearch && matchesTier;
  }).sort((a, b) => b.overallPriorityScore - a.overallPriorityScore);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto">
      {/* 1. Header */}
      <div className="border-b border-slate-200 pb-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2.5">
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                Target Prioritization Workspace
              </h1>
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-teal-50 text-teal-800 border border-teal-200">
                Computational Ranking
              </span>
            </div>
            <p className="text-sm text-slate-500 mt-1">
              Multi-factorial algorithmic prioritization evaluating interaction confidence, drug tractability, disease linkage, and evidence density.
            </p>
          </div>

          <Link
            to="/targets"
            className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-lg bg-teal-700 hover:bg-teal-800 text-white font-medium text-xs shadow-sm transition-all self-start sm:self-auto"
          >
            <Crosshair className="w-4 h-4 text-teal-200" />
            <span>Target Explorer</span>
          </Link>
        </div>
      </div>

      {/* 2. Scientific Safety Notice */}
      <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-4 text-xs text-amber-900 flex items-start space-x-3">
        <ShieldAlert className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-bold block font-mono uppercase text-[11px] tracking-wide">
            Methodology Notice: Computational Prioritization (Not Proven Therapeutic Targets)
          </span>
          <p className="text-amber-800 leading-relaxed">
            The ranking scores below represent algorithmic scoring models derived from published structural complexes, druggability indices, and pathway relevance. These rankings highlight candidates for experimental investigation and do not assert verified clinical efficacy.
          </p>
        </div>
      </div>

      {/* 3. Transparent Scoring Rationale Breakdown */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-3">
        <h3 className="text-xs font-bold text-slate-900 font-mono uppercase tracking-wider">
          Algorithmic Weighting Factors (100-Point Composite Model)
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 text-xs">
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 space-y-1">
            <span className="text-[10px] font-mono text-slate-400 block font-bold">Factor 01 (30%)</span>
            <span className="font-bold text-slate-900">Interaction Confidence</span>
            <p className="text-[11px] text-slate-500">Kd binding strength & crystal structure resolution.</p>
          </div>
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 space-y-1">
            <span className="text-[10px] font-mono text-slate-400 block font-bold">Factor 02 (20%)</span>
            <span className="font-bold text-slate-900">Associated Drugs</span>
            <p className="text-[11px] text-slate-500">Known chemical tractability & ligand scaffold availability.</p>
          </div>
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 space-y-1">
            <span className="text-[10px] font-mono text-slate-400 block font-bold">Factor 03 (20%)</span>
            <span className="font-bold text-slate-900">Disease Linkage</span>
            <p className="text-[11px] text-slate-500">Direct oncogenic or inflammatory driver role.</p>
          </div>
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 space-y-1">
            <span className="text-[10px] font-mono text-slate-400 block font-bold">Factor 04 (15%)</span>
            <span className="font-bold text-slate-900">Pathway Relevance</span>
            <p className="text-[11px] text-slate-500">Centrality in canonical signaling networks.</p>
          </div>
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 space-y-1">
            <span className="text-[10px] font-mono text-slate-400 block font-bold">Factor 05 (15%)</span>
            <span className="font-bold text-slate-900">Evidence Density</span>
            <p className="text-[11px] text-slate-500">Cross-validation across ChEMBL, PDB, and literature.</p>
          </div>
        </div>
      </div>

      {/* 4. Search & Tier Filter */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by gene symbol, target name or class..."
              className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-10 pr-4 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all"
            />
          </div>

          <div className="sm:w-64">
            <select
              value={selectedTier}
              onChange={(e) => setSelectedTier(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-xs text-slate-700 focus:outline-none focus:bg-white focus:border-teal-500"
            >
              <option value="ALL">All Priority Tiers</option>
              {tiers.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 5. Prioritized Target Cards */}
      <div className="space-y-4">
        {filteredTargets.map((item, idx) => (
          <div
            key={item.id}
            className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-all space-y-4"
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-4">
              <div className="flex items-center space-x-3">
                <span className="w-8 h-8 rounded-lg bg-teal-50 text-teal-800 border border-teal-200 font-mono text-xs font-bold flex items-center justify-center shrink-0">
                  #{idx + 1}
                </span>
                <div>
                  <div className="flex items-center space-x-2">
                    <Link
                      to={`/targets/${item.targetId}`}
                      className="text-base font-bold text-slate-900 hover:text-teal-700 font-mono transition-colors"
                    >
                      {item.geneSymbol}
                    </Link>
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                        item.priorityTier.includes('Tier 1')
                          ? 'bg-teal-50 text-teal-800 border border-teal-200'
                          : item.priorityTier.includes('Tier 2')
                          ? 'bg-blue-50 text-blue-800 border border-blue-200'
                          : 'bg-slate-100 text-slate-700 border border-slate-200'
                      }`}
                    >
                      {item.priorityTier}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {item.proteinName} &bull; <span className="font-mono text-slate-700">{item.targetClass}</span>
                  </p>
                </div>
              </div>

              {/* Composite Score Circle */}
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <div className="text-2xl font-black font-mono text-teal-800">
                    {item.overallPriorityScore} <span className="text-xs font-normal text-slate-400">/ 100</span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">Priority Index</span>
                </div>
              </div>
            </div>

            {/* Metrics Breakdown Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono bg-slate-50 p-3 rounded-lg border border-slate-100">
              <div>
                <span className="text-slate-400 block text-[10px]">Tractability</span>
                <span className="font-bold text-slate-800">{item.drugCount} Known Inhibitors</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Disease Spectrum</span>
                <span className="font-bold text-slate-800">{item.diseaseCount} Malignancies</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Pathway Relevance</span>
                <span className="font-bold text-violet-800">{item.pathwayRelevanceScore}% Centrality</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Evidence Density</span>
                <span className="font-bold text-emerald-800">{item.evidenceAvailability}</span>
              </div>
            </div>

            {/* Rationale & Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-1">
              <p className="text-xs text-slate-600 leading-relaxed max-w-3xl">
                <strong className="text-slate-900 font-mono text-[11px]">Computational Rationale:</strong>{' '}
                {item.computationalRationale}
              </p>

              <div className="flex items-center space-x-2 shrink-0">
                <Link
                  to={`/targets/${item.targetId}`}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-medium transition-colors"
                >
                  View Target
                </Link>

                <Link
                  to={`/analysis/interaction?target=${item.targetId}`}
                  className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold shadow-xs transition-colors"
                >
                  <span>Analyze</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
