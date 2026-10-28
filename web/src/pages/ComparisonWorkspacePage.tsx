import React, { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  GitCompare,
  Pill,
  Crosshair,
  HeartPulse,
  Activity,
  Share2,
  FileText,
  CheckCircle2,
  ChevronRight,
  ArrowRightLeft,
} from 'lucide-react';
import { DRUGS, TARGETS, DISEASES, INTERACTIONS, PATHWAYS } from '../data/dataset';

export const ComparisonWorkspacePage: React.FC = () => {
  const [searchParams] = useSearchParams();

  // Mode: 'drug_vs_drug' | 'target_vs_target'
  const [compareMode, setCompareMode] = useState<'drug_vs_drug' | 'target_vs_target'>('drug_vs_drug');

  // Drug vs Drug state
  const initialDrugA = searchParams.get('drugA') || 'DB00619'; // Imatinib
  const initialDrugB = searchParams.get('drugB') || 'DB00530'; // Erlotinib
  const [drugAId, setDrugAId] = useState(initialDrugA);
  const [drugBId, setDrugBId] = useState(initialDrugB);

  // Target vs Target state
  const [targetAId, setTargetAId] = useState('EGFR');
  const [targetBId, setTargetBId] = useState('ERBB2');

  const drugA = DRUGS.find((d) => d.id === drugAId) || DRUGS[0];
  const drugB = DRUGS.find((d) => d.id === drugBId) || DRUGS[1];

  const targetA = TARGETS.find((t) => t.id === targetAId) || TARGETS[1];
  const targetB = TARGETS.find((t) => t.id === targetBId) || TARGETS[2];

  const drugAInteractions = INTERACTIONS.filter((i) => i.drugId === drugA.id);
  const drugBInteractions = INTERACTIONS.filter((i) => i.drugId === drugB.id);

  const targetAInteractions = INTERACTIONS.filter((i) => i.targetId === targetA.id || i.targetGene.includes(targetA.geneSymbol));
  const targetBInteractions = INTERACTIONS.filter((i) => i.targetId === targetB.id || i.targetGene.includes(targetB.geneSymbol));

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto">
      {/* 1. Header */}
      <div className="border-b border-slate-200 pb-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2.5">
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                Comparison Workspace
              </h1>
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-blue-50 text-blue-800 border border-blue-200">
                Comparative Biology
              </span>
            </div>
            <p className="text-sm text-slate-500 mt-1">
              Side-by-side comparative profiling of molecular mechanisms, binding selectivity, targeted kinases, and disease spectra.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCompareMode('drug_vs_drug')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                compareMode === 'drug_vs_drug'
                  ? 'bg-blue-800 text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              Drug vs Drug
            </button>
            <button
              onClick={() => setCompareMode('target_vs_target')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                compareMode === 'target_vs_target'
                  ? 'bg-teal-800 text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              Target vs Target
            </button>
          </div>
        </div>
      </div>

      {/* 2. DRUG VS DRUG MODE */}
      {compareMode === 'drug_vs_drug' ? (
        <div className="space-y-6">
          {/* Selector Strip */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            {/* Drug A Select */}
            <div className="space-y-2">
              <label className="block text-xs font-mono font-bold uppercase tracking-wider text-blue-800">
                Candidate A (Reference)
              </label>
              <select
                value={drugAId}
                onChange={(e) => setDrugAId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:border-blue-600 font-sans"
              >
                {DRUGS.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.brandName}) &bull; {d.therapeuticClass}
                  </option>
                ))}
              </select>
            </div>

            {/* Drug B Select */}
            <div className="space-y-2">
              <label className="block text-xs font-mono font-bold uppercase tracking-wider text-teal-800">
                Candidate B (Comparator)
              </label>
              <select
                value={drugBId}
                onChange={(e) => setDrugBId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:border-teal-600 font-sans"
              >
                {DRUGS.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.brandName}) &bull; {d.therapeuticClass}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Side-by-Side Comparison Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* CARD A */}
            <div className="bg-white rounded-xl border border-blue-200 p-6 space-y-5 shadow-xs">
              <div className="flex items-start justify-between border-b border-slate-100 pb-3">
                <div>
                  <span className="text-[10px] font-mono text-blue-800 font-bold bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                    Candidate A &bull; {drugA.id}
                  </span>
                  <h3 className="text-xl font-bold text-slate-900 mt-1">
                    {drugA.name} ({drugA.brandName})
                  </h3>
                  <p className="text-xs text-slate-500 font-mono">{drugA.type}</p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-mono font-bold text-slate-800">{drugA.molecularWeight} g/mol</span>
                  <span className="text-[10px] text-slate-400 block font-mono">{drugA.formula}</span>
                </div>
              </div>

              {/* Mechanism of Action */}
              <div className="space-y-1">
                <span className="text-[11px] font-mono text-slate-400 uppercase font-bold">Mechanism of Action</span>
                <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">
                  {drugA.mechanismOfAction}
                </p>
              </div>

              {/* Targets */}
              <div className="space-y-1">
                <span className="text-[11px] font-mono text-slate-400 uppercase font-bold">Primary Target Receptors</span>
                <div className="flex flex-wrap gap-1.5 pt-0.5">
                  {drugA.targetIds.map((tId) => (
                    <Link
                      key={tId}
                      to={`/targets/${tId}`}
                      className="px-2.5 py-1 rounded-md bg-teal-50 hover:bg-teal-100 text-teal-800 font-mono text-xs font-bold transition-colors"
                    >
                      {tId}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Indications */}
              <div className="space-y-1">
                <span className="text-[11px] font-mono text-slate-400 uppercase font-bold">Associated Diseases</span>
                <div className="flex flex-wrap gap-1.5 pt-0.5">
                  {drugA.diseaseIds.map((disId) => {
                    const dis = DISEASES.find((d) => d.id === disId);
                    return (
                      <Link
                        key={disId}
                        to={`/diseases/${disId}`}
                        className="px-2.5 py-1 rounded-md bg-rose-50 hover:bg-rose-100 text-rose-800 text-xs font-medium transition-colors"
                      >
                        {dis ? dis.name : disId}
                      </Link>
                    );
                  })}
                </div>
              </div>

              {/* Top Interactions Recorded */}
              <div className="space-y-1 pt-2 border-t border-slate-100">
                <span className="text-[11px] font-mono text-slate-400 uppercase font-bold">Binding Assay Benchmarks</span>
                {drugAInteractions.map((i) => (
                  <div key={i.id} className="text-xs flex items-center justify-between py-1 font-mono">
                    <span className="font-semibold text-slate-800">&rarr; {i.targetGene}:</span>
                    <span className="text-blue-800 font-bold">{i.affinityKdNm} nM (Score: {(i.score * 100).toFixed(0)}%)</span>
                  </div>
                ))}
              </div>

              <div className="pt-3">
                <Link
                  to={`/drugs/${drugA.id}`}
                  className="w-full inline-flex items-center justify-center space-x-1 py-2 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-800 text-xs font-semibold transition-colors"
                >
                  <span>Open Full Drug Profile</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* CARD B */}
            <div className="bg-white rounded-xl border border-teal-200 p-6 space-y-5 shadow-xs">
              <div className="flex items-start justify-between border-b border-slate-100 pb-3">
                <div>
                  <span className="text-[10px] font-mono text-teal-800 font-bold bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                    Candidate B &bull; {drugB.id}
                  </span>
                  <h3 className="text-xl font-bold text-slate-900 mt-1">
                    {drugB.name} ({drugB.brandName})
                  </h3>
                  <p className="text-xs text-slate-500 font-mono">{drugB.type}</p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-mono font-bold text-slate-800">{drugB.molecularWeight} g/mol</span>
                  <span className="text-[10px] text-slate-400 block font-mono">{drugB.formula}</span>
                </div>
              </div>

              {/* Mechanism of Action */}
              <div className="space-y-1">
                <span className="text-[11px] font-mono text-slate-400 uppercase font-bold">Mechanism of Action</span>
                <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">
                  {drugB.mechanismOfAction}
                </p>
              </div>

              {/* Targets */}
              <div className="space-y-1">
                <span className="text-[11px] font-mono text-slate-400 uppercase font-bold">Primary Target Receptors</span>
                <div className="flex flex-wrap gap-1.5 pt-0.5">
                  {drugB.targetIds.map((tId) => (
                    <Link
                      key={tId}
                      to={`/targets/${tId}`}
                      className="px-2.5 py-1 rounded-md bg-teal-50 hover:bg-teal-100 text-teal-800 font-mono text-xs font-bold transition-colors"
                    >
                      {tId}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Indications */}
              <div className="space-y-1">
                <span className="text-[11px] font-mono text-slate-400 uppercase font-bold">Associated Diseases</span>
                <div className="flex flex-wrap gap-1.5 pt-0.5">
                  {drugB.diseaseIds.map((disId) => {
                    const dis = DISEASES.find((d) => d.id === disId);
                    return (
                      <Link
                        key={disId}
                        to={`/diseases/${disId}`}
                        className="px-2.5 py-1 rounded-md bg-rose-50 hover:bg-rose-100 text-rose-800 text-xs font-medium transition-colors"
                      >
                        {dis ? dis.name : disId}
                      </Link>
                    );
                  })}
                </div>
              </div>

              {/* Top Interactions Recorded */}
              <div className="space-y-1 pt-2 border-t border-slate-100">
                <span className="text-[11px] font-mono text-slate-400 uppercase font-bold">Binding Assay Benchmarks</span>
                {drugBInteractions.map((i) => (
                  <div key={i.id} className="text-xs flex items-center justify-between py-1 font-mono">
                    <span className="font-semibold text-slate-800">&rarr; {i.targetGene}:</span>
                    <span className="text-teal-800 font-bold">{i.affinityKdNm} nM (Score: {(i.score * 100).toFixed(0)}%)</span>
                  </div>
                ))}
              </div>

              <div className="pt-3">
                <Link
                  to={`/drugs/${drugB.id}`}
                  className="w-full inline-flex items-center justify-center space-x-1 py-2 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-800 text-xs font-semibold transition-colors"
                >
                  <span>Open Full Drug Profile</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* TARGET VS TARGET MODE */
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-5 grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            <div className="space-y-2">
              <label className="block text-xs font-mono font-bold uppercase tracking-wider text-teal-800">
                Target Receptor A
              </label>
              <select
                value={targetAId}
                onChange={(e) => setTargetAId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:border-teal-600 font-sans"
              >
                {TARGETS.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.geneSymbol} &bull; {t.proteinName} ({t.uniprotId})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-mono font-bold uppercase tracking-wider text-blue-800">
                Target Receptor B
              </label>
              <select
                value={targetBId}
                onChange={(e) => setTargetBId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:border-blue-600 font-sans"
              >
                {TARGETS.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.geneSymbol} &bull; {t.proteinName} ({t.uniprotId})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* TARGET CARD A */}
            <div className="bg-white rounded-xl border border-teal-200 p-6 space-y-5">
              <div className="border-b border-slate-100 pb-3">
                <span className="text-[10px] font-mono text-teal-800 font-bold bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                  Target A &bull; {targetA.uniprotId}
                </span>
                <h3 className="text-xl font-bold text-slate-900 mt-1 font-mono">
                  {targetA.geneSymbol}
                </h3>
                <p className="text-xs text-slate-500">{targetA.proteinName}</p>
              </div>

              <div className="space-y-1">
                <span className="text-[11px] font-mono text-slate-400 uppercase font-bold">Biological Function</span>
                <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">
                  {targetA.biologicalFunction}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                <div>
                  <span className="text-slate-400 block text-[10px]">Target Class</span>
                  <span className="font-bold text-slate-800">{targetA.targetClass}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Cell Location</span>
                  <span className="font-bold text-slate-800">{targetA.cellularLocation}</span>
                </div>
              </div>

              <div className="pt-2">
                <Link
                  to={`/targets/${targetA.id}`}
                  className="w-full inline-flex items-center justify-center space-x-1 py-2 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-800 text-xs font-semibold transition-colors"
                >
                  <span>Open Target Profile</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* TARGET CARD B */}
            <div className="bg-white rounded-xl border border-blue-200 p-6 space-y-5">
              <div className="border-b border-slate-100 pb-3">
                <span className="text-[10px] font-mono text-blue-800 font-bold bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  Target B &bull; {targetB.uniprotId}
                </span>
                <h3 className="text-xl font-bold text-slate-900 mt-1 font-mono">
                  {targetB.geneSymbol}
                </h3>
                <p className="text-xs text-slate-500">{targetB.proteinName}</p>
              </div>

              <div className="space-y-1">
                <span className="text-[11px] font-mono text-slate-400 uppercase font-bold">Biological Function</span>
                <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">
                  {targetB.biologicalFunction}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                <div>
                  <span className="text-slate-400 block text-[10px]">Target Class</span>
                  <span className="font-bold text-slate-800">{targetB.targetClass}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Cell Location</span>
                  <span className="font-bold text-slate-800">{targetB.cellularLocation}</span>
                </div>
              </div>

              <div className="pt-2">
                <Link
                  to={`/targets/${targetB.id}`}
                  className="w-full inline-flex items-center justify-center space-x-1 py-2 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-800 text-xs font-semibold transition-colors"
                >
                  <span>Open Target Profile</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
