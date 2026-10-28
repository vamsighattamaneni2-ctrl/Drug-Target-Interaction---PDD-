import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  BookmarkCheck,
  Activity,
  GitCompare,
  FileText,
  Trash2,
  Plus,
  ExternalLink,
  Pill,
  Crosshair,
  HeartPulse,
} from 'lucide-react';
import { SavedAnalysis } from '../types';
import { DRUGS, TARGETS } from '../data/dataset';

export const SavedAnalysesPage: React.FC = () => {
  const navigate = useNavigate();
  const [savedItems, setSavedItems] = useState<SavedAnalysis[]>([]);

  useEffect(() => {
    const cached = localStorage.getItem('theratarget_saved_analyses');
    if (cached) {
      try {
        setSavedItems(JSON.parse(cached));
      } catch (e) {
        console.error(e);
      }
    } else {
      // Default initial saved analyses demo
      const initialDemo: SavedAnalysis[] = [
        {
          id: 'SAVED-1701',
          name: 'Imatinib BCR-ABL1 Kinase Pocket Binding Session',
          drug: DRUGS[0],
          target: TARGETS[0],
          score: 0.96,
          confidence: 'High',
          interactionType: 'ATP-Competitive Inhibitor',
          affinityKdNm: 12.4,
          affinityPkd: 7.91,
          therapeuticRelevance: 'Established first-line standard of care targeted inhibitor in CML.',
          associatedDisease: 'Chronic Myeloid Leukemia',
          evidence: 'DrugBank 5.1 & PDB 1IEP',
          date: '2026-10-24',
          status: 'Validated Benchmark',
        },
        {
          id: 'SAVED-1702',
          name: 'Osimertinib Cys797 Covalent Docking Assay',
          drug: DRUGS[4],
          target: TARGETS[1],
          score: 0.97,
          confidence: 'High',
          interactionType: 'Covalent Kinase Inhibitor',
          affinityKdNm: 1.8,
          affinityPkd: 8.74,
          therapeuticRelevance: 'Irreversible inhibition overcoming gatekeeper T790M resistance.',
          associatedDisease: 'Non-Small Cell Lung Cancer',
          evidence: 'ChEMBL 33 & PDB 4ZAU',
          date: '2026-10-26',
          status: 'Priority Investigation',
        },
      ];
      setSavedItems(initialDemo);
      localStorage.setItem('theratarget_saved_analyses', JSON.stringify(initialDemo));
    }
  }, []);

  const handleDelete = (id: string) => {
    const updated = savedItems.filter((item) => item.id !== id);
    setSavedItems(updated);
    localStorage.setItem('theratarget_saved_analyses', JSON.stringify(updated));
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* 1. Header */}
      <div className="border-b border-slate-200 pb-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2.5">
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                Saved Analyses & Research Sessions
              </h1>
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-blue-50 text-blue-800 border border-blue-200">
                Notebook Sessions
              </span>
            </div>
            <p className="text-sm text-slate-500 mt-1">
              Review saved computational docking runs, pairwise affinity assays, and generated candidate hypotheses.
            </p>
          </div>

          <Link
            to="/analysis/interaction"
            className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-lg bg-blue-700 hover:bg-blue-800 text-white font-medium text-xs shadow-sm transition-all self-start sm:self-auto"
          >
            <Plus className="w-4 h-4 text-blue-200" />
            <span>New Interaction Analysis</span>
          </Link>
        </div>
      </div>

      {/* 2. Saved Items Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {savedItems.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <BookmarkCheck className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-slate-800">No saved analyses yet</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Run an assay in the Interaction Analyzer and click &ldquo;Save Analysis&rdquo; to track and document your research here.
            </p>
            <Link
              to="/analysis/interaction"
              className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-lg bg-blue-700 text-white text-xs font-semibold hover:bg-blue-800 transition-colors"
            >
              <span>Run First Assay &rarr;</span>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-mono uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4 font-semibold">Session Name</th>
                  <th className="py-3 px-4 font-semibold">Drug Candidate</th>
                  <th className="py-3 px-4 font-semibold">Target Receptor</th>
                  <th className="py-3 px-4 font-semibold">Disease Context</th>
                  <th className="py-3 px-4 font-semibold">Affinity / Score</th>
                  <th className="py-3 px-4 font-semibold">Date</th>
                  <th className="py-3 px-4 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {savedItems.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                    {/* Session Name */}
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">
                        {item.name || `${item.drug.name} &bull; ${item.target.geneSymbol}`}
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">{item.id}</span>
                    </td>

                    {/* Drug */}
                    <td className="py-3.5 px-4">
                      <Link
                        to={`/drugs/${item.drug.id}`}
                        className="font-semibold text-blue-700 hover:underline"
                      >
                        {item.drug.name}
                      </Link>
                      <span className="text-[10px] text-slate-400 font-mono block">
                        {item.drug.id}
                      </span>
                    </td>

                    {/* Target */}
                    <td className="py-3.5 px-4">
                      <Link
                        to={`/targets/${item.target.id}`}
                        className="font-mono font-bold text-teal-800 hover:underline"
                      >
                        {item.target.geneSymbol}
                      </Link>
                      <span className="text-[10px] text-slate-400 font-mono block">
                        {item.target.uniprotId}
                      </span>
                    </td>

                    {/* Disease */}
                    <td className="py-3.5 px-4 text-slate-700">
                      {item.associatedDisease}
                    </td>

                    {/* Affinity / Score */}
                    <td className="py-3.5 px-4 font-mono">
                      <span className="font-bold text-slate-900">{item.affinityKdNm} nM</span>
                      <span className="text-[10px] text-emerald-700 font-semibold block">
                        Score: {(item.score * 100).toFixed(0)}%
                      </span>
                    </td>

                    {/* Date */}
                    <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px]">
                      {item.date}
                    </td>

                    {/* Action Buttons: View, Compare, Report, Delete */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="inline-flex items-center space-x-1.5">
                        <Link
                          to={`/analysis/interaction?drug=${item.drug.id}&target=${item.target.id}`}
                          className="px-2.5 py-1 rounded bg-blue-50 hover:bg-blue-100 text-blue-800 font-semibold text-xs transition-colors"
                          title="View analysis in Interaction Analyzer"
                        >
                          View
                        </Link>

                        <Link
                          to={`/insights/compare?drugA=${item.drug.id}`}
                          className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors"
                          title="Open in Comparison Workspace"
                        >
                          Compare
                        </Link>

                        <Link
                          to="/reports"
                          className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors"
                          title="Generate Research Report"
                        >
                          Report
                        </Link>

                        <button
                          onClick={() => handleDelete(item.id)}
                          className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Delete saved session"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
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
