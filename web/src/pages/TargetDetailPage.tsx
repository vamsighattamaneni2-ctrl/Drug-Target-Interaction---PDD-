import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Activity,
  ArrowLeft,
  ArrowRight,
  ChevronRight,
  Crosshair,
  Dna,
  ExternalLink,
  FileText,
  GitBranch,
  GitCompare,
  HeartPulse,
  Pill,
  Share2,
  Sparkles,
} from 'lucide-react';
import { TARGETS, DRUGS, DISEASES, INTERACTIONS, PATHWAYS } from '../data/dataset';
import { NetworkGraph } from '../components/NetworkGraph';

export const TargetDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const target = TARGETS.find(
    (t) => t.id === id || t.geneSymbol.toLowerCase() === id?.toLowerCase()
  );

  if (!target) {
    return (
      <div className="p-8 max-w-4xl mx-auto text-center space-y-4">
        <Crosshair className="w-10 h-10 text-slate-300 mx-auto" />
        <h2 className="text-lg font-bold text-slate-800">Target Entity Not Found</h2>
        <p className="text-xs text-slate-500">
          No molecular target record exists for identifier "{id}".
        </p>
        <Link
          to="/targets"
          className="inline-flex items-center space-x-1 px-3.5 py-2 rounded-lg bg-[#1E3A8A] text-white font-medium text-xs hover:bg-[#1B365D] transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          <span>Return to Target Explorer</span>
        </Link>
      </div>
    );
  }

  // Interacting drugs, diseases, pathways
  const targetInteractions = INTERACTIONS.filter((i) => i.targetId === target.id);
  const associatedDiseases = DISEASES.filter((d) => target.diseaseIds.includes(d.id));
  const associatedDrugs = DRUGS.filter((d) => target.drugIds.includes(d.id));
  const associatedPathways = PATHWAYS.filter(
    (p) => target.pathwayIds?.includes(p.id) || p.targetIds.includes(target.id)
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Top Header & 3 Main Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <Link
          to="/targets"
          className="inline-flex items-center space-x-1.5 text-xs font-mono text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Target Explorer</span>
        </Link>

        {/* 3 Main Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() =>
              navigate(
                `/analysis/interaction?target=${target.id}&drug=${
                  targetInteractions[0]?.drugId || ''
                }`
              )
            }
            className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-lg bg-[#1E3A8A] hover:bg-[#1B365D] text-white font-medium text-xs shadow-sm transition-colors"
          >
            <Activity className="w-3.5 h-3.5 text-cyan-300" />
            <span>Analyze Interactions</span>
          </button>

          <button
            onClick={() => navigate(`/analysis/network?select=${target.id}`)}
            className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium text-xs shadow-sm transition-colors"
          >
            <Share2 className="w-3.5 h-3.5 text-blue-700" />
            <span>Explore Network</span>
          </button>

          <button
            onClick={() => navigate(`/insights/compare?target1=${target.id}`)}
            className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium text-xs shadow-sm transition-colors"
          >
            <GitCompare className="w-3.5 h-3.5 text-teal-700" />
            <span>Compare Targets</span>
          </button>
        </div>
      </div>

      {/* 1. Target Overview */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm space-y-5">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 pb-4 border-b border-slate-100">
          <div className="space-y-1.5">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200">
                {target.id}
              </span>
              <a
                href={`https://www.uniprot.org/uniprotkb/${target.uniprotId}`}
                target="_blank"
                rel="noreferrer"
                className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200 flex items-center space-x-1"
              >
                <span>UniProt: {target.uniprotId}</span>
                <ExternalLink className="w-3 h-3 text-slate-400" />
              </a>
              <span className="text-xs text-slate-500 font-mono">{target.organism || 'Homo sapiens'}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              {target.geneSymbol}{' '}
              <span className="text-slate-400 font-normal text-lg">({target.proteinName})</span>
            </h1>

            <p className="text-xs text-slate-600 max-w-3xl leading-relaxed">
              {target.biologicalFunction}
            </p>
          </div>

          <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 font-mono text-xs min-w-[220px]">
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Target Classification</span>
            <div className="font-bold text-blue-900 mt-0.5">{target.targetClass}</div>
            <div className="text-[10px] text-slate-500 mt-2 pt-2 border-t border-slate-200">
              Gene Symbol: <strong className="text-slate-800">{target.geneSymbol}</strong>
            </div>
          </div>
        </div>

        {/* Biological Function Detail */}
        <div className="space-y-1.5 text-xs">
          <div className="text-[11px] font-mono font-semibold text-slate-500 uppercase flex items-center gap-1.5">
            <Dna className="w-3.5 h-3.5 text-blue-700" />
            <span>Biological Function & Signal Transduction</span>
          </div>
          <p className="text-slate-700 leading-relaxed bg-slate-50 p-3.5 rounded-lg border border-slate-200">
            {target.biologicalFunction}
          </p>
        </div>
      </div>

      {/* 2. Drug Associations & 3. Disease Associations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Drug Associations: Which drugs interact with this target? */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center space-x-2 text-xs font-bold text-slate-800 uppercase font-mono">
              <Pill className="w-4 h-4 text-blue-700" />
              <span>Interacting Drug Compounds ({associatedDrugs.length})</span>
            </div>
            <span className="text-[11px] font-mono text-slate-400">Target &larr; Drug</span>
          </div>

          <div className="space-y-2">
            {associatedDrugs.map((d) => {
              const intRec = targetInteractions.find((i) => i.drugId === d.id);
              return (
                <div
                  key={d.id}
                  className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between text-xs hover:border-blue-300 transition-colors"
                >
                  <div>
                    <Link
                      to={`/drugs/${d.id}`}
                      className="font-bold text-blue-900 hover:underline flex items-center gap-1"
                    >
                      <span>{d.name}</span>
                      <ChevronRight className="w-3 h-3 text-blue-600" />
                    </Link>
                    <div className="text-[11px] text-slate-500">{d.type} &bull; {d.therapeuticClass}</div>
                  </div>
                  <div className="text-right">
                    {intRec && (
                      <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-mono font-bold text-[10px]">
                        Kd: {intRec.affinityKdNm.toFixed(1)} nM
                      </span>
                    )}
                    <div className="font-mono text-slate-400 text-[10px] mt-0.5">{d.id}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Disease Associations: Which diseases are connected to this target? */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center space-x-2 text-xs font-bold text-slate-800 uppercase font-mono">
              <HeartPulse className="w-4 h-4 text-rose-600" />
              <span>Connected Disease Indications ({associatedDiseases.length})</span>
            </div>
            <span className="text-[11px] font-mono text-slate-400">Target &rarr; Disease</span>
          </div>

          <div className="space-y-2">
            {associatedDiseases.map((d) => (
              <div
                key={d.id}
                className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between text-xs hover:border-rose-300 transition-colors"
              >
                <div>
                  <Link
                    to={`/diseases/${d.id}`}
                    className="font-bold text-slate-900 hover:text-rose-700 flex items-center gap-1"
                  >
                    <span>{d.name}</span>
                    <ChevronRight className="w-3 h-3 text-rose-500" />
                  </Link>
                  <div className="text-[11px] text-slate-500">{d.category}</div>
                </div>
                <Link
                  to={`/diseases/${d.id}`}
                  className="px-2 py-1 rounded bg-rose-50 text-rose-700 font-mono text-[10px] border border-rose-200 hover:bg-rose-100 transition-colors"
                >
                  Explore Indication
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 4. Pathway Associations & 6. Therapeutic Relevance */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Pathway Associations: Which biological pathways involve this target? */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-3">
          <div className="flex items-center space-x-2 text-xs font-bold text-slate-800 uppercase font-mono">
            <GitBranch className="w-4 h-4 text-blue-700" />
            <span>Pathway Associations ({associatedPathways.length} Cascades)</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            {target.geneSymbol} functions as a critical kinase or signaling node within key oncogenic transduction cascades.
          </p>
          <div className="space-y-2 pt-2">
            {associatedPathways.map((p) => (
              <div key={p.id} className="p-3 rounded-lg bg-blue-50/50 border border-blue-200 flex items-center justify-between text-xs">
                <div>
                  <Link to={`/pathways/${p.id}`} className="font-bold text-blue-900 hover:underline">
                    {p.name}
                  </Link>
                  <div className="text-[10px] text-slate-500">{p.category}</div>
                </div>
                <Link
                  to={`/pathways/${p.id}`}
                  className="text-xs text-blue-700 hover:text-blue-900 font-medium"
                >
                  Explore Pathway &rarr;
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* Therapeutic Relevance: Explain why the target may be relevant */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-3">
          <div className="flex items-center space-x-2 text-xs font-bold text-slate-800 uppercase font-mono">
            <Sparkles className="w-4 h-4 text-blue-700" />
            <span>Therapeutic Relevance & Druggability</span>
          </div>
          <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 text-xs space-y-2">
            <div>
              <span className="text-[10px] font-mono text-slate-400 uppercase">Kinase Druggability Profile</span>
              <p className="text-slate-700 mt-0.5 leading-relaxed">
                {target.geneSymbol} contains well-characterized catalytic pockets amenable to ATP-competitive small molecule binding and allosteric inhibition.
              </p>
            </div>
            <div>
              <span className="text-[10px] font-mono text-slate-400 uppercase">Translational Prioritization</span>
              <p className="text-slate-600 mt-0.5 leading-relaxed">
                Dysregulation or hyperphosphorylation of {target.geneSymbol} drives uncontrolled cellular proliferation, making it an essential target in precision oncology regimens.
              </p>
            </div>
          </div>
          <div className="pt-2 flex items-center space-x-2">
            <Link
              to={`/discovery/target-prioritization`}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-medium transition-colors"
            >
              <span>Target Prioritization</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* 5. Interaction Landscape: Visualize Target ↕ Drugs ↕ Diseases */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center space-x-2 text-xs font-bold text-slate-800 uppercase font-mono">
            <Share2 className="w-4 h-4 text-blue-700" />
            <span>Interaction Landscape: Target &updownarrow; Drugs &updownarrow; Diseases</span>
          </div>
          <Link
            to={`/analysis/network?select=${target.id}`}
            className="text-xs text-blue-700 hover:text-blue-900 font-medium flex items-center space-x-1"
          >
            <span>Open in Network Explorer</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-950">
          <NetworkGraph
            key={target.id}
            initialTargetId={target.id}
            height={420}
          />
        </div>
      </div>
    </div>
  );
};
