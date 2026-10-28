import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  Sliders,
  AlertTriangle,
  Layers,
  ArrowRight,
  Loader2,
  ExternalLink,
  ChevronRight,
  Info,
  Pill,
  ShieldAlert,
  Sparkles,
} from 'lucide-react';
import { DRUGS } from '../data/dataset';
import {
  searchMolecularSimilarity,
  SimilaritySearchResult,
  SimilarCompoundMatch,
} from '../services/advancedFeaturesService';

export const MolecularSimilarityPage: React.FC = () => {
  const [querySmiles, setQuerySmiles] = useState(DRUGS[0].smiles);
  const [threshold, setThreshold] = useState(0.35);
  const [maxResults, setMaxResults] = useState(12);
  const [isSearching, setIsSearching] = useState(false);
  const [result, setResult] = useState<SimilaritySearchResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const runSearch = async (smiles: string, tVal: number) => {
    if (!smiles.trim()) return;
    setIsSearching(true);
    setErrorMsg(null);
    try {
      const data = await searchMolecularSimilarity({
        query_smiles: smiles.trim(),
        threshold: tVal,
        max_results: maxResults,
      });
      setResult(data);
    } catch (err: any) {
      console.error('Similarity search error:', err);
      setErrorMsg(err.message || 'Failed to execute RDKit molecular fingerprint search.');
    } finally {
      setIsSearching(false);
    }
  };

  useEffect(() => {
    runSearch(querySmiles, threshold);
  }, []);

  const handleSelectReferenceDrug = (drugId: string) => {
    const found = DRUGS.find((d) => d.id === drugId);
    if (found) {
      setQuerySmiles(found.smiles);
      runSearch(found.smiles, threshold);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="border-b border-slate-200 pb-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Molecular Similarity Search
            </h1>
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-teal-50 text-teal-800 border border-teal-200">
              RDKit Morgan ECFP4 / Tanimoto
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Calculate topological extended-connectivity bit fingerprints and evaluate exact Tanimoto structural coefficients against reference bioactive compound libraries.
          </p>
        </div>

        {/* Reference drug quick selector */}
        <div className="flex items-center space-x-2">
          <span className="text-xs font-mono text-slate-500">Query Preload:</span>
          <select
            onChange={(e) => handleSelectReferenceDrug(e.target.value)}
            className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold text-slate-800 shadow-2xs font-mono"
          >
            {DRUGS.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name} ({d.id})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* CRITICAL SCIENTIFIC DISTINCTION CAVEAT BANNER */}
      <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200 text-xs flex items-start space-x-3">
        <Info className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
        <p className="text-blue-900/90 leading-relaxed text-[11px]">
          <strong>Critical Pharmacological Distinction:</strong> Chemical similarity (calculated via 2D Morgan ECFP4 fingerprints and Tanimoto coefficient) evaluates shared structural subgraphs. It does <strong>NOT</strong> prove or guarantee identical biological affinity, kinase selectivity, or clinical efficacy. Small atom substitutions (e.g., fluorine shifts or gatekeeper residue variants) frequently induce dramatic pharmacological activity cliffs.
        </p>
      </div>

      {/* Query Search Form */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-6 space-y-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            runSearch(querySmiles, threshold);
          }}
          className="space-y-4"
        >
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Query Molecule SMILES String:
            </label>
            <div className="relative">
              <input
                type="text"
                value={querySmiles}
                onChange={(e) => setQuerySmiles(e.target.value)}
                placeholder="Enter SMILES (e.g. CC1=C(C=C...))..."
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:bg-white transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
            {/* Threshold slider */}
            <div className="sm:col-span-2 space-y-1">
              <div className="flex justify-between text-xs font-mono text-slate-600">
                <span>Minimum Tanimoto Similarity Threshold:</span>
                <span className="font-bold text-slate-900">{(threshold * 100).toFixed(0)}% (T &ge; {threshold})</span>
              </div>
              <input
                type="range"
                min="0.20"
                max="0.90"
                step="0.05"
                value={threshold}
                onChange={(e) => setThreshold(parseFloat(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-[10px] font-mono text-slate-400">
                <span>Broad Scaffold (0.20)</span>
                <span>Moderate (0.50)</span>
                <span>Near-Isosteric (0.85)</span>
              </div>
            </div>

            {/* Submit button */}
            <div className="flex items-end">
              <button
                type="submit"
                disabled={isSearching || !querySmiles.trim()}
                className="w-full inline-flex items-center justify-center space-x-2 px-4 py-2.5 bg-[#1E3A8A] hover:bg-[#1B365D] text-white text-xs font-semibold rounded-lg shadow-xs disabled:opacity-50 transition-colors cursor-pointer"
              >
                {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                <span>Calculate RDKit Similarities</span>
              </button>
            </div>
          </div>
        </form>

        {errorMsg && (
          <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}
      </div>

      {/* Results Section */}
      {isSearching ? (
        <div className="bg-white p-12 rounded-xl border border-slate-200 text-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto" />
          <p className="text-xs font-semibold text-slate-700">Generating Morgan Fingerprints & Evaluating Tanimoto Matrix...</p>
          <p className="text-[11px] text-slate-400 font-mono">Comparing against reference database</p>
        </div>
      ) : result ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs font-mono text-slate-500">
            <span>
              {result.total_matches} structural analogs identified with Tanimoto &ge; {result.threshold}
            </span>
            <span>Fingerprint: {result.fingerprint_type}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {result.matches.map((match) => (
              <div
                key={match.id}
                className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5 space-y-3 hover:border-slate-300 transition-colors flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-bold text-sm text-slate-900">{match.name}</h3>
                      <span className="text-[10px] font-mono text-slate-400 block">{match.id}</span>
                    </div>

                    {/* Tanimoto Score Badge */}
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-mono font-bold border ${
                        match.tanimoto_similarity >= 0.75
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : match.tanimoto_similarity >= 0.50
                          ? 'bg-blue-50 text-blue-800 border-blue-200'
                          : 'bg-slate-50 text-slate-700 border-slate-200'
                      }`}
                    >
                      T = {(match.tanimoto_similarity * 100).toFixed(1)}%
                    </span>
                  </div>

                  <span className="inline-block text-[10px] font-mono px-2 py-0.5 rounded bg-slate-50 text-slate-600 border border-slate-200">
                    {match.target_class}
                  </span>

                  <p className="text-[11px] font-mono text-slate-500 truncate" title={match.smiles}>
                    {match.smiles}
                  </p>

                  <div className="grid grid-cols-2 gap-2 text-[10px] font-mono pt-1 text-slate-600">
                    <div>MW: {match.molecular_weight} g/mol</div>
                    <div>LogP: {match.log_p}</div>
                  </div>
                </div>

                {/* Workflow Actions */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <Link
                    to={`/admet?compoundName=${encodeURIComponent(match.name)}&smiles=${encodeURIComponent(match.smiles)}`}
                    className="text-blue-700 hover:text-blue-900 font-semibold flex items-center space-x-1"
                  >
                    <span>ADMET</span>
                    <ChevronRight className="w-3 h-3" />
                  </Link>

                  <Link
                    to={`/docking?compound=${encodeURIComponent(match.id)}&smiles=${encodeURIComponent(match.smiles)}`}
                    className="inline-flex items-center space-x-1 px-2.5 py-1 rounded bg-[#1E3A8A] hover:bg-[#1B365D] text-white text-[11px] font-semibold"
                  >
                    <Layers className="w-3 h-3" />
                    <span>Dock Analogue</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default MolecularSimilarityPage;
