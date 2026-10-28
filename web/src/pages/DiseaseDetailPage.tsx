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
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import { DISEASES, TARGETS, DRUGS, PATHWAYS, INTERACTIONS } from '../data/dataset';

export const DiseaseDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const disease = DISEASES.find((d) => d.id === id) || DISEASES[0];

  const diseaseTargets = TARGETS.filter((t) => disease.targetIds.includes(t.id) || disease.targetIds.includes(t.geneSymbol));
  const diseaseDrugs = DRUGS.filter((d) => disease.drugIds.includes(d.id));
  const diseasePathways = PATHWAYS.filter((pw) => pw.diseaseIds.includes(disease.id));
  const diseaseInteractions = INTERACTIONS.filter((i) => i.diseaseId === disease.id);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Back Link */}
      <div className="flex items-center justify-between">
        <Link
          to="/diseases"
          className="inline-flex items-center space-x-1.5 text-xs font-mono text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Disease Explorer</span>
        </Link>

        <span className="text-[11px] font-mono text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
          Clinical Indication Profile &bull; {disease.id}
        </span>
      </div>

      {/* Header Profile Hero */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
          <div className="space-y-3">
            <div className="flex items-center space-x-2.5">
              <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center font-bold">
                <HeartPulse className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-rose-700">
                  {disease.category}
                </span>
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
                  {disease.name}
                </h1>
              </div>
            </div>

            <p className="text-sm text-slate-600 leading-relaxed max-w-3xl">
              {disease.description}
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap lg:flex-col gap-2 shrink-0">
            <Link
              to={`/discovery/opportunities`}
              className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-lg bg-blue-700 hover:bg-blue-800 text-white text-xs font-medium shadow-xs transition-colors"
            >
              <FlaskConical className="w-3.5 h-3.5 text-blue-200" />
              <span>Find Candidate Drugs</span>
            </Link>

            <Link
              to="/targets"
              className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-lg bg-teal-700 hover:bg-teal-800 text-white text-xs font-medium shadow-xs transition-colors"
            >
              <Crosshair className="w-3.5 h-3.5 text-teal-200" />
              <span>Explore Targets</span>
            </Link>

            <Link
              to="/analysis/network"
              className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-lg bg-violet-700 hover:bg-violet-800 text-white text-xs font-medium shadow-xs transition-colors"
            >
              <Share2 className="w-3.5 h-3.5 text-violet-200" />
              <span>Explore Network</span>
            </Link>
          </div>
        </div>

        {/* Clinical Statistics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-slate-100 text-xs font-mono">
          <div>
            <span className="text-slate-400 block text-[10px]">Estimated Prevalence</span>
            <span className="font-semibold text-slate-900">{disease.prevalence}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px]">Associated Targets</span>
            <span className="font-semibold text-teal-800">{diseaseTargets.length} Receptors</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px]">Targeted Therapies</span>
            <span className="font-semibold text-blue-800">{diseaseDrugs.length} Approved / Investigational</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px]">Interactions Recorded</span>
            <span className="font-semibold text-emerald-800">{diseaseInteractions.length} Pairs</span>
          </div>
        </div>
      </div>

      {/* Disease Network Diagram (Disease ↑ Target ↑ Drug) */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
        <h3 className="text-xs font-bold text-slate-900 font-mono uppercase tracking-wider">
          Translational Disease Cascade: Disease &uarr; Targets &uarr; Drugs
        </h3>

        <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Disease Node */}
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-center min-w-[200px] shadow-xs">
            <HeartPulse className="w-6 h-6 text-rose-600 mx-auto mb-1.5" />
            <div className="text-xs font-bold text-slate-900">{disease.name}</div>
            <div className="text-[10px] text-rose-700 font-mono mt-0.5">{disease.category}</div>
          </div>

          <div className="text-slate-300 font-mono font-bold text-lg hidden md:block">&larr; Driven by &larr;</div>

          {/* Targets Column */}
          <div className="space-y-2 min-w-[220px]">
            <div className="text-[10px] font-mono text-slate-400 uppercase text-center font-bold">Causative Targets</div>
            {diseaseTargets.map((t) => (
              <Link
                key={t.id}
                to={`/targets/${t.id}`}
                className="block p-2.5 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-lg text-center transition-colors"
              >
                <div className="text-xs font-bold text-teal-900 font-mono">{t.geneSymbol}</div>
                <div className="text-[10px] text-teal-700 truncate">{t.proteinName}</div>
              </Link>
            ))}
          </div>

          <div className="text-slate-300 font-mono font-bold text-lg hidden md:block">&larr; Inhibited by &larr;</div>

          {/* Drugs Column */}
          <div className="space-y-2 min-w-[220px]">
            <div className="text-[10px] font-mono text-slate-400 uppercase text-center font-bold">Targeted Inhibitors</div>
            {diseaseDrugs.map((d) => (
              <Link
                key={d.id}
                to={`/drugs/${d.id}`}
                className="block p-2.5 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg text-center transition-colors"
              >
                <div className="text-xs font-bold text-blue-900">{d.name}</div>
                <div className="text-[10px] text-blue-700 font-mono">{d.type}</div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Drug-Target Relationships in this Disease */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden space-y-3 p-6">
        <h3 className="text-xs font-bold text-slate-900 font-mono uppercase tracking-wider">
          Interaction Relationships for {disease.name}
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-mono uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-4 font-semibold">Drug</th>
                <th className="py-2.5 px-4 font-semibold">Target</th>
                <th className="py-2.5 px-4 font-semibold">Interaction Type</th>
                <th className="py-2.5 px-4 font-semibold">Affinity (Kd)</th>
                <th className="py-2.5 px-4 font-semibold">Score</th>
                <th className="py-2.5 px-4 text-right font-semibold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {diseaseInteractions.map((i) => (
                <tr key={i.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-4 font-bold text-slate-900">
                    <Link to={`/drugs/${i.drugId}`} className="hover:text-blue-600 transition-colors">
                      {i.drugName}
                    </Link>
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-teal-800">
                    <Link to={`/targets/${i.targetId}`} className="hover:text-teal-600 transition-colors">
                      {i.targetGene}
                    </Link>
                  </td>
                  <td className="py-3 px-4 text-slate-600">
                    {i.interactionType}
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-800">
                    {i.affinityKdNm} nM
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-emerald-700">
                    {(i.score * 100).toFixed(0)}%
                  </td>
                  <td className="py-3 px-4 text-right">
                    <Link
                      to={`/analysis/interaction?drug=${i.drugId}&target=${i.targetId}`}
                      className="inline-flex items-center space-x-1 px-2.5 py-1 rounded bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-medium transition-colors"
                    >
                      <Activity className="w-3.5 h-3.5" />
                      <span>Analyze</span>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
