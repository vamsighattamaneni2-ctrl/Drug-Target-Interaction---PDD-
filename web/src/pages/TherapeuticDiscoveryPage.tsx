import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ArrowRight,
  Filter,
  FlaskConical,
  Pill,
  Crosshair,
  HeartPulse,
} from 'lucide-react';
import { INTERACTIONS, DRUGS, TARGETS, DISEASES } from '../data/dataset';

export const TherapeuticDiscoveryPage: React.FC = () => {
  const navigate = useNavigate();

  const [selectedDisease, setSelectedDisease] = useState('ALL');
  const [selectedTarget, setSelectedTarget] = useState('ALL');
  const [selectedConfidence, setSelectedConfidence] = useState('ALL');
  const [minScore, setMinScore] = useState(0.50);

  // Filter and rank interactions by score descending
  const rankedCandidates = INTERACTIONS.filter((item) => {
    const matchesDisease = selectedDisease === 'ALL' || item.diseaseId === selectedDisease;
    const matchesTarget = selectedTarget === 'ALL' || item.targetId === selectedTarget;
    const matchesConfidence = selectedConfidence === 'ALL' || item.confidence === selectedConfidence;
    const matchesScore = item.score >= minScore;

    return matchesDisease && matchesTarget && matchesConfidence && matchesScore;
  }).sort((a, b) => b.score - a.score);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* 20. Therapeutic Discovery Header */}
      <div className="border-b border-slate-200 pb-5">
        <div className="flex items-center space-x-2.5">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Therapeutic Discovery
          </h1>
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-slate-100 text-slate-600 border border-slate-200">
            Lead Prioritization
          </span>
        </div>
        <p className="text-sm text-slate-500 mt-1">
          Prioritize drug–target relationships for further computational investigation.
        </p>
      </div>

      {/* Discovery Filters Panel */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider font-mono flex items-center space-x-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <span>Prioritization Filters</span>
          </h2>
          <span className="text-xs font-mono text-slate-500">
            {rankedCandidates.length} candidate pair{rankedCandidates.length !== 1 ? 's' : ''} ranked
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          {/* Disease Filter */}
          <div>
            <label className="block text-[11px] font-mono text-slate-500 mb-1">Target Disease</label>
            <select
              value={selectedDisease}
              onChange={(e) => setSelectedDisease(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-700 focus:outline-none focus:bg-white focus:border-teal-500"
            >
              <option value="ALL">All Diseases</option>
              {DISEASES.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          {/* Target Filter */}
          <div>
            <label className="block text-[11px] font-mono text-slate-500 mb-1">Target Receptor</label>
            <select
              value={selectedTarget}
              onChange={(e) => setSelectedTarget(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-700 focus:outline-none focus:bg-white focus:border-teal-500"
            >
              <option value="ALL">All Targets</option>
              {TARGETS.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.geneSymbol} ({t.id})
                </option>
              ))}
            </select>
          </div>

          {/* Confidence Filter */}
          <div>
            <label className="block text-[11px] font-mono text-slate-500 mb-1">Confidence Threshold</label>
            <select
              value={selectedConfidence}
              onChange={(e) => setSelectedConfidence(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-700 focus:outline-none focus:bg-white focus:border-teal-500"
            >
              <option value="ALL">All Confidence Levels</option>
              <option value="High">High Confidence Only</option>
              <option value="Medium">Medium & Above</option>
              <option value="Low">Include Screening Hits</option>
            </select>
          </div>

          {/* Min Score Slider */}
          <div>
            <div className="flex justify-between text-[11px] font-mono text-slate-500 mb-1">
              <span>Min Score Cutoff:</span>
              <span className="font-bold text-slate-800">{minScore.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="0.50"
              max="0.95"
              step="0.05"
              value={minScore}
              onChange={(e) => setMinScore(parseFloat(e.target.value))}
              className="w-full accent-slate-800 cursor-pointer mt-2"
            />
          </div>
        </div>
      </div>

      {/* Ranking Table: Rank, Drug, Target, Disease, Interaction Score, Confidence, Therapeutic Relevance */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {rankedCandidates.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <FlaskConical className="w-8 h-8 text-slate-300 mx-auto" />
            <h3 className="text-sm font-semibold text-slate-700">No interaction records found</h3>
            <p className="text-xs text-slate-400">Try adjusting your search criteria.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-mono uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4 font-semibold w-14">Rank</th>
                  <th className="py-3 px-4 font-semibold">Drug</th>
                  <th className="py-3 px-4 font-semibold">Target</th>
                  <th className="py-3 px-4 font-semibold">Disease</th>
                  <th className="py-3 px-4 font-semibold">Interaction Score</th>
                  <th className="py-3 px-4 font-semibold">Confidence</th>
                  <th className="py-3 px-4 font-semibold max-w-[280px]">Therapeutic Relevance</th>
                  <th className="py-3 px-4 text-right font-semibold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rankedCandidates.map((item, index) => (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                    {/* Rank */}
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-600">
                      #{index + 1}
                    </td>

                    {/* Drug */}
                    <td className="py-3.5 px-4 font-medium text-slate-900">
                      <Link to={`/drugs/${item.drugId}`} className="hover:text-sky-600 transition-colors">
                        {item.drugName}
                      </Link>
                      <div className="text-[10px] text-slate-400 font-mono">{item.drugId}</div>
                    </td>

                    {/* Target */}
                    <td className="py-3.5 px-4 font-mono font-bold text-teal-800">
                      <Link to={`/targets/${item.targetId}`} className="hover:underline">
                        {item.targetGene}
                      </Link>
                    </td>

                    {/* Disease */}
                    <td className="py-3.5 px-4 text-slate-700">
                      {item.diseaseName}
                    </td>

                    {/* Interaction Score */}
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-800">
                      <span className="px-2 py-0.5 rounded bg-slate-100">
                        {item.score.toFixed(2)}
                      </span>
                    </td>

                    {/* Confidence */}
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-mono font-semibold ${
                          item.confidence === 'High'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : item.confidence === 'Medium'
                            ? 'bg-sky-50 text-sky-700 border border-sky-200'
                            : 'bg-slate-100 text-slate-600 border border-slate-200'
                        }`}
                      >
                        {item.confidence}
                      </span>
                    </td>

                    {/* Therapeutic Relevance */}
                    <td className="py-3.5 px-4 text-slate-600 max-w-[280px] leading-relaxed truncate" title={item.therapeuticRelevance}>
                      {item.therapeuticRelevance}
                    </td>

                    {/* Action */}
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() =>
                          navigate(
                            `/interaction-analysis?drug=${item.drugId}&target=${item.targetId}`
                          )
                        }
                        className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs transition-colors"
                      >
                        Analyze
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
