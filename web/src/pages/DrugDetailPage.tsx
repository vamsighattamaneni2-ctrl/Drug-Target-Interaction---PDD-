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
import { DRUGS, TARGETS, DISEASES, INTERACTIONS, PATHWAYS } from '../data/dataset';
import { NetworkGraph } from '../components/NetworkGraph';

export const DrugDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const drug = DRUGS.find((d) => d.id === id || d.name.toLowerCase() === id?.toLowerCase());

  if (!drug) {
    return (
      <div className="p-8 max-w-4xl mx-auto text-center space-y-4">
        <Pill className="w-10 h-10 text-slate-300 mx-auto" />
        <h2 className="text-lg font-bold text-slate-800">Drug Record Not Found</h2>
        <p className="text-xs text-slate-500">
          No pharmaceutical record exists for identifier "{id}".
        </p>
        <Link
          to="/drugs"
          className="inline-flex items-center space-x-1 px-3.5 py-2 rounded-lg bg-[#1E3A8A] text-white font-medium text-xs hover:bg-[#1B365D] transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          <span>Return to Drug Explorer</span>
        </Link>
      </div>
    );
  }

  // Associated interactions, targets, diseases, pathways
  const drugInteractions = INTERACTIONS.filter((i) => i.drugId === drug.id);
  const associatedTargets = TARGETS.filter((t) => drug.targetIds.includes(t.id));
  const associatedDiseases = DISEASES.filter((d) => drug.diseaseIds.includes(d.id));
  const associatedPathways = PATHWAYS.filter(
    (p) => drug.pathwayIds?.includes(p.id) || p.drugIds.includes(drug.id)
  );

  // Confidence tiers
  const highConf = drugInteractions.filter((i) => i.score >= 0.85);
  const modConf = drugInteractions.filter((i) => i.score >= 0.70 && i.score < 0.85);
  const lowConf = drugInteractions.filter((i) => i.score < 0.70);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Top Navigation & Scientific Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <Link
          to="/drugs"
          className="inline-flex items-center space-x-1.5 text-xs font-mono text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Drug Explorer</span>
        </Link>

        {/* 4 Main Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => navigate(`/analysis/interaction?drug=${drug.id}`)}
            className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-lg bg-[#1E3A8A] hover:bg-[#1B365D] text-white font-medium text-xs shadow-sm transition-colors"
          >
            <Activity className="w-3.5 h-3.5 text-cyan-300" />
            <span>Analyze Interactions</span>
          </button>

          <button
            onClick={() => navigate(`/analysis/network?select=${drug.id}`)}
            className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium text-xs shadow-sm transition-colors"
          >
            <Share2 className="w-3.5 h-3.5 text-blue-700" />
            <span>Explore Network</span>
          </button>

          <button
            onClick={() => navigate(`/insights/compare?drug1=${drug.id}`)}
            className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium text-xs shadow-sm transition-colors"
          >
            <GitCompare className="w-3.5 h-3.5 text-teal-700" />
            <span>Compare Drug</span>
          </button>

          <button
            onClick={() => navigate(`/reports?type=drug&id=${drug.id}`)}
            className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium text-xs shadow-sm transition-colors"
          >
            <FileText className="w-3.5 h-3.5 text-slate-600" />
            <span>Generate Report</span>
          </button>
        </div>
      </div>

      {/* 1. Drug Overview */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm space-y-5">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 pb-4 border-b border-slate-100">
          <div className="space-y-1.5">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200">
                {drug.id}
              </span>
              <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                {drug.approvalStatus} ({drug.approvalYear || 'Approved'})
              </span>
              <span className="text-xs text-slate-500 font-mono">{drug.type}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              {drug.name} <span className="text-slate-400 font-normal text-lg">({drug.brandName})</span>
            </h1>

            <p className="text-xs text-slate-600 max-w-3xl leading-relaxed">
              {drug.description}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 min-w-[260px] bg-slate-50 p-3.5 rounded-lg border border-slate-200 font-mono text-xs">
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Formula</span>
              <div className="font-bold text-slate-800 mt-0.5">{drug.formula || 'C29H31N7O'}</div>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Mol. Weight</span>
              <div className="font-bold text-slate-800 mt-0.5">{drug.molecularWeight || 493.6} g/mol</div>
            </div>
            <div className="col-span-2 pt-2 border-t border-slate-200">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Therapeutic Class</span>
              <div className="font-bold text-blue-900 mt-0.5">{drug.therapeuticClass}</div>
            </div>
          </div>
        </div>

        {/* Mechanism of Action */}
        <div className="space-y-1.5 text-xs">
          <div className="text-[11px] font-mono font-semibold text-slate-500 uppercase flex items-center gap-1.5">
            <Dna className="w-3.5 h-3.5 text-blue-700" />
            <span>Mechanism of Action (MoA)</span>
          </div>
          <p className="text-slate-700 leading-relaxed bg-slate-50 p-3.5 rounded-lg border border-slate-200">
            {drug.mechanismOfAction}
          </p>
        </div>

        {/* Canonical SMILES */}
        {drug.smiles && (
          <div className="space-y-1 text-xs">
            <div className="text-[11px] font-mono font-semibold text-slate-400 uppercase">
              Canonical SMILES Chemical Notation
            </div>
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 font-mono text-[11px] text-slate-700 break-all select-all">
              {drug.smiles}
            </div>
          </div>
        )}
      </div>

      {/* 2. Target Profile & 3. Disease Associations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Target Profile: Drug → Target relationships */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center space-x-2 text-xs font-bold text-slate-800 uppercase font-mono">
              <Crosshair className="w-4 h-4 text-teal-600" />
              <span>Target Profile ({associatedTargets.length} Receptors)</span>
            </div>
            <span className="text-[11px] font-mono text-slate-400">Drug &rarr; Target</span>
          </div>

          <div className="space-y-2">
            {associatedTargets.map((t) => {
              const intRec = drugInteractions.find((i) => i.targetId === t.id);
              return (
                <div
                  key={t.id}
                  className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between text-xs hover:border-teal-300 transition-colors"
                >
                  <div>
                    <Link
                      to={`/targets/${t.id}`}
                      className="font-bold text-teal-800 hover:underline flex items-center gap-1"
                    >
                      <span>{t.geneSymbol}</span>
                      <ChevronRight className="w-3 h-3 text-teal-600" />
                    </Link>
                    <div className="text-[11px] text-slate-500 truncate max-w-[240px]">
                      {t.proteinName} &bull; {t.targetClass}
                    </div>
                  </div>
                  <div className="text-right">
                    {intRec && (
                      <span className="px-2 py-0.5 rounded bg-teal-100/70 text-teal-800 font-mono font-bold text-[10px]">
                        Kd: {intRec.affinityKdNm.toFixed(1)} nM
                      </span>
                    )}
                    <div className="font-mono text-slate-400 text-[10px] mt-0.5">{t.uniprotId}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Disease Associations */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center space-x-2 text-xs font-bold text-slate-800 uppercase font-mono">
              <HeartPulse className="w-4 h-4 text-rose-600" />
              <span>Disease Associations ({associatedDiseases.length} Indications)</span>
            </div>
            <span className="text-[11px] font-mono text-slate-400">Drug &rarr; Disease</span>
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

      {/* 4. Interaction Summary: High, Moderate, Lower confidence */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center space-x-2 text-xs font-bold text-slate-800 uppercase font-mono">
            <Activity className="w-4 h-4 text-blue-700" />
            <span>Interaction Summary & Confidence Strata</span>
          </div>
          <span className="text-xs font-mono text-slate-500">
            {drugInteractions.length} evaluated interactions
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* High-confidence */}
          <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/40 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold font-mono uppercase text-emerald-800">
                High-Confidence (Score &ge; 0.85)
              </span>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                {highConf.length}
              </span>
            </div>
            <div className="space-y-1.5 text-xs">
              {highConf.length === 0 ? (
                <p className="text-[11px] text-slate-400 italic">No high-confidence pairs</p>
              ) : (
                highConf.map((i) => (
                  <div key={i.id} className="p-2 rounded bg-white border border-emerald-200 flex items-center justify-between">
                    <div>
                      <Link to={`/targets/${i.targetId}`} className="font-bold text-slate-900 hover:underline">
                        {i.targetGene}
                      </Link>
                      <div className="text-[10px] text-slate-400 font-mono">Score: {i.score.toFixed(2)}</div>
                    </div>
                    <Link
                      to={`/analysis/interaction?drug=${i.drugId}&target=${i.targetId}`}
                      className="text-[10px] text-emerald-700 font-semibold hover:underline"
                    >
                      Analyze &rarr;
                    </Link>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Moderate */}
          <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/40 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold font-mono uppercase text-amber-800">
                Moderate (0.70 &le; Score &lt; 0.85)
              </span>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                {modConf.length}
              </span>
            </div>
            <div className="space-y-1.5 text-xs">
              {modConf.length === 0 ? (
                <p className="text-[11px] text-slate-400 italic">No moderate pairs</p>
              ) : (
                modConf.map((i) => (
                  <div key={i.id} className="p-2 rounded bg-white border border-amber-200 flex items-center justify-between">
                    <div>
                      <Link to={`/targets/${i.targetId}`} className="font-bold text-slate-900 hover:underline">
                        {i.targetGene}
                      </Link>
                      <div className="text-[10px] text-slate-400 font-mono">Score: {i.score.toFixed(2)}</div>
                    </div>
                    <Link
                      to={`/analysis/interaction?drug=${i.drugId}&target=${i.targetId}`}
                      className="text-[10px] text-amber-700 font-semibold hover:underline"
                    >
                      Analyze &rarr;
                    </Link>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Lower-confidence */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold font-mono uppercase text-slate-700">
                Lower-Confidence (Score &lt; 0.70)
              </span>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-200 text-slate-700">
                {lowConf.length}
              </span>
            </div>
            <div className="space-y-1.5 text-xs">
              {lowConf.length === 0 ? (
                <p className="text-[11px] text-slate-400 italic">No low-confidence pairs</p>
              ) : (
                lowConf.map((i) => (
                  <div key={i.id} className="p-2 rounded bg-white border border-slate-200 flex items-center justify-between">
                    <div>
                      <Link to={`/targets/${i.targetId}`} className="font-bold text-slate-900 hover:underline">
                        {i.targetGene}
                      </Link>
                      <div className="text-[10px] text-slate-400 font-mono">Score: {i.score.toFixed(2)}</div>
                    </div>
                    <Link
                      to={`/analysis/interaction?drug=${i.drugId}&target=${i.targetId}`}
                      className="text-[10px] text-slate-600 font-semibold hover:underline"
                    >
                      Analyze &rarr;
                    </Link>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 5. Mechanism & Biology & 7. Therapeutic Context */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Mechanism & Biology */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-3">
          <div className="flex items-center space-x-2 text-xs font-bold text-slate-800 uppercase font-mono">
            <GitBranch className="w-4 h-4 text-blue-700" />
            <span>Mechanism & Biological Pathway Integration</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            {drug.name} exerts therapeutic intervention by competitive ATP-pocket binding or allosteric modulation, selectively dampening hyperactive cascade signaling.
          </p>
          <div className="space-y-2 pt-2">
            <div className="text-[11px] font-mono text-slate-400 uppercase font-semibold">
              Associated Signaling Cascades ({associatedPathways.length})
            </div>
            {associatedPathways.map((p) => (
              <div key={p.id} className="p-2.5 rounded-lg bg-blue-50/50 border border-blue-200 flex items-center justify-between text-xs">
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
                  View Pathway &rarr;
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* Therapeutic Context */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-3">
          <div className="flex items-center space-x-2 text-xs font-bold text-slate-800 uppercase font-mono">
            <Sparkles className="w-4 h-4 text-blue-700" />
            <span>Therapeutic Context & Translational Rationale</span>
          </div>
          <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 text-xs space-y-2">
            <div>
              <span className="text-[10px] font-mono text-slate-400 uppercase">Primary Therapeutic Area</span>
              <p className="font-bold text-slate-900 mt-0.5">{drug.therapeuticClass}</p>
            </div>
            <div>
              <span className="text-[10px] font-mono text-slate-400 uppercase">Polypharmacological Relevance</span>
              <p className="text-slate-600 mt-0.5 leading-relaxed">
                Evaluating multi-target inhibition profiles allows identification of secondary efficacy pathways and cross-indication repurposing opportunities.
              </p>
            </div>
          </div>
          <div className="pt-2 flex items-center space-x-2">
            <Link
              to={`/discovery/opportunities?drug=${drug.id}`}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-medium transition-colors"
            >
              <span>Explore Opportunities</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link
              to={`/discovery/repurposing?drug=${drug.id}`}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-medium transition-colors"
            >
              <span>Investigate Repurposing</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* 6. Interaction Network: Interactive Drug → Target → Disease */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center space-x-2 text-xs font-bold text-slate-800 uppercase font-mono">
            <Share2 className="w-4 h-4 text-blue-700" />
            <span>Interaction Network: Drug &rarr; Target &rarr; Disease</span>
          </div>
          <Link
            to={`/analysis/network?select=${drug.id}`}
            className="text-xs text-blue-700 hover:text-blue-900 font-medium flex items-center space-x-1"
          >
            <span>Open in Network Explorer</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-950">
          <NetworkGraph
            key={drug.id}
            initialDrugId={drug.id}
            height={420}
          />
        </div>
      </div>
    </div>
  );
};
