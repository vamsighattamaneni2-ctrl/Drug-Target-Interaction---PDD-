import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Crosshair,
  Pill,
  HeartPulse,
  GitBranch,
  Activity,
  Share2,
  FlaskConical,
  Sparkles,
  Layers,
} from 'lucide-react';
import { PATHWAYS, TARGETS, DRUGS, DISEASES, INTERACTIONS } from '../data/dataset';

export const PathwayDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const pathway = PATHWAYS.find((p) => p.id === id) || PATHWAYS[0];

  const pathwayTargets = TARGETS.filter((t) => pathway.targetIds.includes(t.id) || pathway.targetIds.includes(t.geneSymbol));
  const pathwayDrugs = DRUGS.filter((d) => pathway.drugIds.includes(d.id));
  const pathwayDiseases = DISEASES.filter((dis) => pathway.diseaseIds.includes(dis.id));
  const pathwayInteractions = INTERACTIONS.filter((i) =>
    pathway.targetIds.some((tId) => i.targetId === tId || i.targetGene.includes(tId))
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Back Link */}
      <div className="flex items-center justify-between">
        <Link
          to="/pathways"
          className="inline-flex items-center space-x-1.5 text-xs font-mono text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Pathway Explorer</span>
        </Link>

        <span className="text-[11px] font-mono text-violet-700 bg-violet-50 px-2 py-0.5 rounded border border-violet-200">
          Canonical Pathway Profile &bull; {pathway.id}
        </span>
      </div>

      {/* Header Profile Hero */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
          <div className="space-y-3">
            <div className="flex items-center space-x-2.5">
              <div className="w-10 h-10 rounded-xl bg-violet-600 text-white flex items-center justify-center font-bold">
                <GitBranch className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-violet-700">
                  {pathway.category}
                </span>
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
                  {pathway.name}
                </h1>
              </div>
            </div>

            <p className="text-sm text-slate-600 leading-relaxed max-w-3xl">
              {pathway.description}
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap lg:flex-col gap-2 shrink-0">
            <Link
              to={`/analysis/interaction?target=${pathwayTargets[0]?.geneSymbol || ''}`}
              className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-lg bg-teal-700 hover:bg-teal-800 text-white text-xs font-medium shadow-xs transition-colors"
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Analyze Pathway Interactions</span>
            </Link>

            <Link
              to="/analysis/network"
              className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-lg bg-violet-700 hover:bg-violet-800 text-white text-xs font-medium shadow-xs transition-colors"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Explore Pathway in Network</span>
            </Link>

            <Link
              to="/discovery/opportunities"
              className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-medium transition-colors"
            >
              <FlaskConical className="w-3.5 h-3.5 text-slate-500" />
              <span>Therapeutic Opportunities</span>
            </Link>
          </div>
        </div>

        {/* Pathway Properties Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-slate-100 text-xs font-mono">
          <div>
            <span className="text-slate-400 block text-[10px]">Cellular Location</span>
            <span className="font-semibold text-slate-900">{pathway.cellularLocation}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px]">Connected Kinases / Targets</span>
            <span className="font-semibold text-teal-800">{pathwayTargets.length} Receptors</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px]">Targeting Drugs</span>
            <span className="font-semibold text-blue-800">{pathwayDrugs.length} Compounds</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px]">Disease Indications</span>
            <span className="font-semibold text-rose-800">{pathwayDiseases.length} Malignancies</span>
          </div>
        </div>
      </div>

      {/* Biological Function & Key Molecular Processes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-3">
          <h3 className="text-xs font-bold text-slate-900 font-mono uppercase tracking-wider">
            Biological Mechanism & Downstream Cascades
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            {pathway.biologicalFunction}
          </p>
          <div className="pt-2 text-[11px] font-mono text-slate-500 bg-slate-50 p-3 rounded-lg border border-slate-100">
            Signaling flux modulation: Targeted small-molecule inhibitors competitively ablate downstream autophosphorylation, arresting pro-survival oncogenic cascades and restoring normal apoptotic thresholds.
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-3">
          <h3 className="text-xs font-bold text-slate-900 font-mono uppercase tracking-wider">
            Key Molecular Processes
          </h3>
          <div className="space-y-2">
            {pathway.keyProcesses.map((proc, idx) => (
              <div key={idx} className="flex items-center space-x-2 text-xs">
                <span className="w-5 h-5 rounded-full bg-violet-100 text-violet-800 font-mono text-[10px] flex items-center justify-center font-bold">
                  {idx + 1}
                </span>
                <span className="text-slate-800 font-medium">{proc}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Connected Biological Entities: Targets, Drugs, Diseases */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Targets in this pathway */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-900 font-mono uppercase">
              <Crosshair className="w-4 h-4 text-teal-600" />
              <span>Pathway Targets ({pathwayTargets.length})</span>
            </div>
            <Link to="/targets" className="text-[10px] text-teal-700 hover:underline">
              All &rarr;
            </Link>
          </div>

          <div className="space-y-2">
            {pathwayTargets.map((t) => (
              <Link
                key={t.id}
                to={`/targets/${t.id}`}
                className="block p-2.5 rounded-lg border border-slate-100 hover:border-teal-300 hover:bg-teal-50/30 transition-all text-xs"
              >
                <div className="font-bold text-slate-900 font-mono">{t.geneSymbol}</div>
                <div className="text-[11px] text-slate-500 truncate">{t.proteinName}</div>
              </Link>
            ))}
          </div>
        </div>

        {/* Drugs targeting this pathway */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-900 font-mono uppercase">
              <Pill className="w-4 h-4 text-blue-600" />
              <span>Targeting Drugs ({pathwayDrugs.length})</span>
            </div>
            <Link to="/drugs" className="text-[10px] text-blue-700 hover:underline">
              All &rarr;
            </Link>
          </div>

          <div className="space-y-2">
            {pathwayDrugs.map((d) => (
              <Link
                key={d.id}
                to={`/drugs/${d.id}`}
                className="block p-2.5 rounded-lg border border-slate-100 hover:border-blue-300 hover:bg-blue-50/30 transition-all text-xs"
              >
                <div className="font-bold text-slate-900">{d.name}</div>
                <div className="text-[11px] text-slate-500 truncate">{d.therapeuticClass}</div>
              </Link>
            ))}
          </div>
        </div>

        {/* Diseases associated with this pathway */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-900 font-mono uppercase">
              <HeartPulse className="w-4 h-4 text-rose-500" />
              <span>Diseases ({pathwayDiseases.length})</span>
            </div>
            <Link to="/diseases" className="text-[10px] text-rose-700 hover:underline">
              All &rarr;
            </Link>
          </div>

          <div className="space-y-2">
            {pathwayDiseases.map((dis) => (
              <Link
                key={dis.id}
                to={`/diseases/${dis.id}`}
                className="block p-2.5 rounded-lg border border-slate-100 hover:border-rose-300 hover:bg-rose-50/30 transition-all text-xs"
              >
                <div className="font-bold text-slate-900">{dis.name}</div>
                <div className="text-[11px] text-slate-500 truncate">{dis.category}</div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
