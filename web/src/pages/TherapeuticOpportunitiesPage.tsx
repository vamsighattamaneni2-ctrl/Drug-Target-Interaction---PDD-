import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FlaskConical,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Crosshair,
  Pill,
  HeartPulse,
  Activity,
  Share2,
  GitCompare,
  FileText,
  BookmarkCheck,
  CheckCircle2,
  ChevronRight,
  HelpCircle,
} from 'lucide-react';
import { THERAPEUTIC_OPPORTUNITIES, DRUGS, TARGETS, DISEASES } from '../data/dataset';

export const TherapeuticOpportunitiesPage: React.FC = () => {
  const navigate = useNavigate();

  // Research Question Selector
  const [researchQuestion, setResearchQuestion] = useState<'all' | 'candidate_drugs' | 'prioritize_targets' | 'disease_mechanisms' | 'repurposing' | 'compare'>(
    'all'
  );

  // Active Category Filter
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'high_confidence' | 'disease_target' | 'repurposing' | 'target_opportunity'>('all');

  const categories = [
    {
      id: 'high_confidence',
      title: 'High-Confidence Interactions',
      desc: 'Robust drug–target relationships supported by crystallographic data and nanomolar binding affinities.',
      count: THERAPEUTIC_OPPORTUNITIES.filter((o) => o.category === 'high_confidence').length,
      color: 'blue',
      badge: 'Validated Benchmarks',
    },
    {
      id: 'disease_target',
      title: 'Disease-Associated Targets',
      desc: 'Validated kinase and nuclear receptor targets directly implicated in oncogenesis and inflammation.',
      count: THERAPEUTIC_OPPORTUNITIES.filter((o) => o.category === 'disease_target').length,
      color: 'teal',
      badge: 'Direct Drivers',
    },
    {
      id: 'repurposing',
      title: 'Potential Repurposing Candidates',
      desc: 'Approved pharmaceutical molecules with biological rationale for secondary indications.',
      count: THERAPEUTIC_OPPORTUNITIES.filter((o) => o.category === 'repurposing').length,
      color: 'violet',
      badge: 'Secondary Indications',
    },
    {
      id: 'target_opportunity',
      title: 'Target Opportunities',
      desc: 'Biological targets with multi-target cross-reactivity and potential therapeutic synergies.',
      count: THERAPEUTIC_OPPORTUNITIES.filter((o) => o.category === 'target_opportunity').length,
      color: 'amber',
      badge: 'Cross-Kinome Hits',
    },
  ];

  const filteredOpportunities = THERAPEUTIC_OPPORTUNITIES.filter((opp) => {
    if (selectedCategory !== 'all' && opp.category !== selectedCategory) return false;

    if (researchQuestion === 'candidate_drugs') return opp.category === 'high_confidence' || opp.category === 'repurposing';
    if (researchQuestion === 'prioritize_targets') return opp.category === 'disease_target' || opp.category === 'target_opportunity';
    if (researchQuestion === 'disease_mechanisms') return opp.category === 'disease_target';
    if (researchQuestion === 'repurposing') return opp.category === 'repurposing';
    return true;
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto">
      {/* 1. Header */}
      <div className="border-b border-slate-200 pb-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2.5">
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                Therapeutic Opportunities
              </h1>
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-blue-50 text-blue-800 border border-blue-200">
                Discovery Workspace
              </span>
            </div>
            <p className="text-sm text-slate-500 mt-1">
              Identify drug–target relationships that may warrant further computational investigation.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <Link
              to="/discovery/target-prioritization"
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-medium transition-colors"
            >
              <Crosshair className="w-3.5 h-3.5 text-teal-600" />
              <span>Target Prioritization</span>
            </Link>
            <Link
              to="/discovery/repurposing"
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-medium transition-colors"
            >
              <Pill className="w-3.5 h-3.5 text-blue-600" />
              <span>Drug Repurposing</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 2. Top Research Question Selector */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-3">
        <div className="flex items-center space-x-2">
          <HelpCircle className="w-4 h-4 text-blue-700" />
          <h2 className="text-xs font-bold text-slate-900 uppercase font-mono tracking-wider">
            What are you trying to discover?
          </h2>
        </div>

        <div className="flex flex-wrap gap-2 pt-1">
          {[
            { id: 'all', label: 'All Opportunities' },
            { id: 'candidate_drugs', label: 'Find Candidate Drugs' },
            { id: 'prioritize_targets', label: 'Prioritize Targets' },
            { id: 'disease_mechanisms', label: 'Explore Disease Mechanisms' },
            { id: 'repurposing', label: 'Investigate Drug Repurposing' },
          ].map((q) => (
            <button
              key={q.id}
              onClick={() => {
                setResearchQuestion(q.id as any);
                if (q.id === 'all') setSelectedCategory('all');
              }}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                researchQuestion === q.id
                  ? 'bg-blue-800 text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              {q.label}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Four Discovery Categories (Visual Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          return (
            <div
              key={cat.id}
              onClick={() => setSelectedCategory(isSelected ? 'all' : (cat.id as any))}
              className={`bg-white rounded-xl border p-5 flex flex-col justify-between space-y-4 cursor-pointer transition-all ${
                isSelected
                  ? 'border-blue-600 ring-2 ring-blue-500/20 shadow-md'
                  : 'border-slate-200 hover:border-slate-300 hover:shadow-sm'
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="inline-block px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-100 text-slate-700">
                    {cat.count} Candidates
                  </span>
                  <span className="text-[10px] font-mono text-blue-700 font-semibold">{cat.badge}</span>
                </div>
                <h3 className="text-sm font-bold text-slate-900">{cat.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{cat.desc}</p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-blue-700">
                <span>{isSelected ? '✓ Showing Category' : 'Explore Category'}</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </div>
          );
        })}
      </div>

      {/* 4. Candidate Results with Investigation Workflow */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-4 gap-2">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Candidate Results ({filteredOpportunities.length} Hits)
            </h3>
            <p className="text-xs text-slate-500">
              Continuous Workflow: <strong className="text-slate-800">Investigate &rarr; Analyze &rarr; Network &rarr; Compare &rarr; Report</strong>
            </p>
          </div>

          {selectedCategory !== 'all' && (
            <button
              onClick={() => setSelectedCategory('all')}
              className="text-xs text-blue-700 hover:underline font-mono"
            >
              Show all categories
            </button>
          )}
        </div>

        {/* Candidate Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredOpportunities.map((opp) => (
            <div
              key={opp.id}
              className="bg-slate-50/70 border border-slate-200 rounded-xl p-5 hover:bg-white hover:shadow-md transition-all space-y-3"
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="inline-block px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-100/70 text-blue-900 border border-blue-200/60 mb-1">
                    {opp.categoryTitle}
                  </span>
                  <h4 className="text-sm font-bold text-slate-900">
                    <Link to={`/drugs/${opp.drugId}`} className="hover:text-blue-700">
                      {opp.drugName}
                    </Link>
                    <span className="text-slate-400 font-normal"> &rarr; </span>
                    <Link to={`/targets/${opp.targetId}`} className="hover:text-teal-700 text-teal-800 font-mono">
                      {opp.targetGene}
                    </Link>
                  </h4>
                  <div className="text-[11px] text-slate-500 font-mono">
                    Indication: <span className="text-slate-800 font-semibold">{opp.diseaseName}</span>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-lg font-bold font-mono text-blue-900">
                    {(opp.score * 100).toFixed(0)}%
                  </div>
                  <span className="text-[10px] text-emerald-700 font-mono font-semibold">
                    {opp.confidence} Conf
                  </span>
                </div>
              </div>

              {/* Rationale */}
              <p className="text-xs text-slate-600 leading-relaxed bg-white border border-slate-200/60 rounded-lg p-2.5">
                {opp.rationale}
              </p>

              {/* Evidence Level Badge */}
              <div className="text-[11px] font-mono text-slate-500 flex items-center space-x-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                <span>{opp.evidenceLevel}</span>
              </div>

              {/* 5-Step Continuous Action Strip */}
              <div className="pt-3 border-t border-slate-200/80 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center space-x-1.5 text-xs">
                  <Link
                    to={`/analysis/interaction?drug=${opp.drugId}&target=${opp.targetId}`}
                    className="px-2.5 py-1 rounded bg-teal-50 hover:bg-teal-100 text-teal-800 font-semibold text-xs transition-colors border border-teal-200"
                    title="Run pairwise interaction assay"
                  >
                    Analyze
                  </Link>

                  <Link
                    to="/analysis/network"
                    className="px-2.5 py-1 rounded bg-violet-50 hover:bg-violet-100 text-violet-800 font-semibold text-xs transition-colors border border-violet-200"
                    title="View in multi-entity network"
                  >
                    Network
                  </Link>

                  <Link
                    to={`/insights/compare?drugA=${opp.drugId}`}
                    className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors"
                    title="Compare candidate with other compounds"
                  >
                    Compare
                  </Link>

                  <Link
                    to="/reports"
                    className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors"
                    title="Generate research report"
                  >
                    Report
                  </Link>
                </div>

                <Link
                  to={`/analysis/interaction?drug=${opp.drugId}&target=${opp.targetId}`}
                  className="inline-flex items-center space-x-1 px-3 py-1 bg-blue-800 hover:bg-blue-900 text-white rounded text-xs font-semibold transition-colors"
                >
                  <span>Investigate</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
