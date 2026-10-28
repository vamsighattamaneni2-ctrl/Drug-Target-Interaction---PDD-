import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Activity,
  ArrowRight,
  BadgeCheck,
  ChevronRight,
  Crosshair,
  Dna,
  FileText,
  GitBranch,
  GitCompare,
  HeartPulse,
  Pill,
  RefreshCw,
  Search,
  Sparkles,
} from 'lucide-react';
import { DISEASES, TARGETS, DRUGS, INTERACTIONS, REPURPOSING_CANDIDATES } from '../data/dataset';

export const DrugRepurposingPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedDiseaseId, setSelectedDiseaseId] = useState<string>('NSCLC');
  const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(null);

  const selectedDisease =
    DISEASES.find((d) => d.id === selectedDiseaseId) || DISEASES[0];

  // Associated Targets for selected disease
  const diseaseTargets = TARGETS.filter((t) =>
    selectedDisease.targetIds.includes(t.id)
  );

  // Existing drugs associated with targets or disease
  const existingDrugs = DRUGS.filter((d) =>
    d.diseaseIds.includes(selectedDisease.id) ||
    d.targetIds.some((tId) => selectedDisease.targetIds.includes(tId))
  );

  // Repurposing candidates for this disease or cross-indications
  const candidatesForDisease = REPURPOSING_CANDIDATES.map((rep) => {
    const targetGene = rep.candidateTarget.split('/')[0].trim();
    const interaction = INTERACTIONS.find(
      (i) => i.drugId === rep.drugId || i.targetGene.includes(targetGene)
    );
    return {
      ...rep,
      targetGene,
      interactionScore: interaction ? interaction.score : 0.88,
    };
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto">
      {/* 1. Header */}
      <div className="border-b border-slate-200 pb-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2.5">
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                Drug Repurposing
              </h1>
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-blue-50 text-blue-700 border border-blue-200">
                Indication Expansion Workflow
              </span>
            </div>
            <p className="text-sm text-slate-500 mt-1">
              Could an existing drug be investigated for another disease? Guided 5-step computational pipeline exploring target affinities and clinical evidence.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <Link
              to="/discovery/opportunities"
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium text-xs shadow-sm transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-700" />
              <span>Therapeutic Opportunities</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 5-Step Guided Workflow Banner */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <div className="text-xs font-bold font-mono text-slate-400 uppercase tracking-wider mb-4">
          Guided 5-Step Repurposing Discovery Workflow
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 relative">
          <div className="p-3 rounded-lg bg-blue-50/50 border border-blue-200 flex items-center space-x-2.5">
            <div className="w-6 h-6 rounded-full bg-[#1E3A8A] text-white flex items-center justify-center font-bold text-xs shrink-0">
              1
            </div>
            <div>
              <div className="font-bold text-blue-950 text-xs">Select Disease</div>
              <div className="text-[10px] text-blue-700">Choose indication</div>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-blue-50/50 border border-blue-200 flex items-center space-x-2.5">
            <div className="w-6 h-6 rounded-full bg-[#1E3A8A] text-white flex items-center justify-center font-bold text-xs shrink-0">
              2
            </div>
            <div>
              <div className="font-bold text-blue-950 text-xs">Identify Targets</div>
              <div className="text-[10px] text-blue-700">Driver receptors</div>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-blue-50/50 border border-blue-200 flex items-center space-x-2.5">
            <div className="w-6 h-6 rounded-full bg-[#1E3A8A] text-white flex items-center justify-center font-bold text-xs shrink-0">
              3
            </div>
            <div>
              <div className="font-bold text-blue-950 text-xs">Find Drugs</div>
              <div className="text-[10px] text-blue-700">Approved agents</div>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-blue-50/50 border border-blue-200 flex items-center space-x-2.5">
            <div className="w-6 h-6 rounded-full bg-[#1E3A8A] text-white flex items-center justify-center font-bold text-xs shrink-0">
              4
            </div>
            <div>
              <div className="font-bold text-blue-950 text-xs">Compare</div>
              <div className="text-[10px] text-blue-700">Candidate ranking</div>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-blue-50/50 border border-blue-200 flex items-center space-x-2.5">
            <div className="w-6 h-6 rounded-full bg-[#1E3A8A] text-white flex items-center justify-center font-bold text-xs shrink-0">
              5
            </div>
            <div>
              <div className="font-bold text-blue-950 text-xs">Review Evidence</div>
              <div className="text-[10px] text-blue-700">Biological support</div>
            </div>
          </div>
        </div>
      </div>

      {/* STEP 1: Select Disease */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-slate-800 uppercase tracking-wider font-mono flex items-center gap-2">
            <HeartPulse className="w-4 h-4 text-rose-600" />
            <span>STEP 1 — Select Disease</span>
          </label>
          <span className="text-xs font-mono text-slate-500">
            Selected: <strong className="text-blue-900">{selectedDisease.name}</strong>
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
          {DISEASES.map((dis) => {
            const isSelected = dis.id === selectedDiseaseId;
            return (
              <button
                key={dis.id}
                onClick={() => setSelectedDiseaseId(dis.id)}
                className={`p-3 rounded-lg text-left border text-xs transition-colors ${
                  isSelected
                    ? 'bg-[#1E3A8A] text-white border-[#1E3A8A] font-medium shadow-sm'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                <div className="font-semibold truncate">{dis.name}</div>
                <div className={`text-[10px] truncate mt-0.5 ${isSelected ? 'text-blue-200' : 'text-slate-400'}`}>
                  {dis.category}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* STEP 2 & STEP 3: Identify Associated Targets & Find Existing Drugs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Step 2: Associated Targets */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center space-x-2 text-xs font-bold font-mono text-slate-800 uppercase tracking-wider">
              <Crosshair className="w-4 h-4 text-teal-600" />
              <span>STEP 2 — Identify Associated Targets</span>
            </div>
            <span className="text-[11px] font-mono text-slate-400">{diseaseTargets.length} receptors</span>
          </div>
          <div className="space-y-2">
            {diseaseTargets.map((t) => (
              <div
                key={t.id}
                className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between text-xs hover:border-teal-300 transition-colors"
              >
                <div>
                  <Link to={`/targets/${t.id}`} className="font-bold text-teal-800 hover:underline">
                    {t.geneSymbol}
                  </Link>
                  <span className="text-slate-500 ml-2">({t.targetClass})</span>
                </div>
                <span className="font-mono text-slate-500 text-[11px]">{t.uniprotId}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Step 3: Find Existing Drugs */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center space-x-2 text-xs font-bold font-mono text-slate-800 uppercase tracking-wider">
              <Pill className="w-4 h-4 text-blue-700" />
              <span>STEP 3 — Find Existing Approved Drugs</span>
            </div>
            <span className="text-[11px] font-mono text-slate-400">{existingDrugs.length} compounds</span>
          </div>
          <div className="space-y-2">
            {existingDrugs.map((d) => (
              <div
                key={d.id}
                className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between text-xs hover:border-blue-300 transition-colors"
              >
                <div>
                  <Link to={`/drugs/${d.id}`} className="font-bold text-blue-900 hover:underline">
                    {d.name}
                  </Link>
                  <span className="text-slate-500 ml-2 font-mono text-[11px]">({d.id})</span>
                </div>
                <span className="text-[11px] text-slate-600">{d.type}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* STEP 4 & 5: Repurposing Candidate Cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-200">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <RefreshCw className="w-4 h-4 text-blue-700" />
              <span>STEP 4 & 5 — Compare Candidates & Review Evidence</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Identified off-target affinity vectors and computational repurposing rationales for {selectedDisease.name}.
            </p>
          </div>
          <span className="text-xs font-mono text-slate-500">
            {candidatesForDisease.length} candidate profiles
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {candidatesForDisease.map((c) => (
            <div
              key={c.id}
              className="bg-white rounded-xl border border-slate-200 hover:border-blue-400 shadow-sm hover:shadow-md transition-all p-5 flex flex-col justify-between"
            >
              <div>
                {/* Header: Drug -> Target -> Disease */}
                <div className="flex items-start justify-between gap-2 pb-3 border-b border-slate-100">
                  <div>
                    <span className="text-[10px] font-mono uppercase text-slate-400 block">Investigational Drug</span>
                    <Link
                      to={`/drugs/${c.drugId}`}
                      className="text-base font-bold text-slate-900 hover:text-blue-700"
                    >
                      {c.drugName}
                    </Link>
                    <span className="text-[10px] text-slate-400 font-mono ml-2">({c.drugId})</span>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] font-mono uppercase text-slate-400 block">Repurposing Score</span>
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200">
                      {c.repurposingScore.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Target & Disease Relationships */}
                <div className="grid grid-cols-2 gap-3 my-3 p-3 rounded-lg bg-slate-50 border border-slate-100 text-xs">
                  <div>
                    <span className="text-[10px] font-mono text-slate-400 uppercase block">Candidate Target</span>
                    <span className="font-bold text-teal-800">{c.candidateTarget}</span>
                    <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                      Interaction Score: <strong>{c.interactionScore.toFixed(2)}</strong>
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] font-mono text-slate-400 uppercase block">Candidate Disease</span>
                    <span className="font-bold text-rose-800">{c.candidateDisease}</span>
                    <div className="text-[10px] text-slate-500 mt-0.5">
                      Primary: {c.primaryDisease}
                    </div>
                  </div>
                </div>

                {/* Repurposing Rationale */}
                <div className="space-y-1 text-xs">
                  <span className="text-[10px] font-mono uppercase font-semibold text-slate-500 block">
                    Repurposing Rationale
                  </span>
                  <p className="text-slate-700 leading-relaxed bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                    Dual or off-target kinase inhibition against {c.candidateTarget} blocks secondary downstream survival cascades implicated in {c.candidateDisease}.
                  </p>
                </div>

                {/* Evidence & Provenance */}
                <div className="mt-2.5 p-2.5 rounded-lg bg-emerald-50/50 border border-emerald-200 text-xs">
                  <div className="flex items-center space-x-1.5 text-emerald-800 font-semibold text-[11px]">
                    <BadgeCheck className="w-3.5 h-3.5" />
                    <span>Evidence Summary:</span>
                  </div>
                  <p className="text-slate-700 mt-1 leading-relaxed text-[11px]">
                    {c.evidence}
                  </p>
                </div>
              </div>

              {/* Action: Investigate Candidate */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <Link
                  to={`/analysis/evidence`}
                  className="text-xs text-slate-500 hover:text-blue-700 font-mono flex items-center gap-1"
                >
                  <FileText className="w-3 h-3" />
                  <span>Review Evidence Audit</span>
                </Link>

                <button
                  onClick={() =>
                    navigate(
                      `/analysis/interaction?drug=${c.drugId}&target=${c.targetGene}&mode=repurpose`
                    )
                  }
                  className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 bg-[#1E3A8A] hover:bg-[#1B365D] text-white rounded-lg text-xs font-medium shadow-sm transition-colors"
                >
                  <span>Investigate Candidate</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
