import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Sparkles,
  FlaskConical,
  Crosshair,
  Pill,
  Activity,
  Layers,
  Dna,
  ShieldCheck,
  FolderKanban,
  GitCompare,
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  return (
    <div className="w-full space-y-10 pb-16">
      {/* 1. SCIENTIFIC HERO SECTION: Restricted to Title, Hero Image, Concise Description, and Start New Analysis */}
      <section className="relative w-full overflow-hidden bg-slate-900 text-white min-h-[440px] sm:min-h-[500px] flex items-center">
        {/* Real Scientific Laboratory Photograph with Human Researchers */}
        <div className="absolute inset-0 z-0">
          <img
            src="/images/hero_researchers_lab.jpg"
            alt="Pharmaceutical researchers collaborating on structure-based therapeutic discovery in molecular biology laboratory"
            className="w-full h-full object-cover object-center opacity-75 filter saturate-105"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/images/login_drug_research.jpg';
            }}
          />
          {/* Subtle gradient overlay to guarantee scientific typography contrast */}
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/92 via-slate-900/80 to-slate-950/65" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 w-full">
          <div className="max-w-2xl space-y-5">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-mono font-medium bg-teal-500/20 text-teal-300 border border-teal-400/30 backdrop-blur-xs">
              <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
              <span>Computational Drug Discovery Workspace</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
              Discover Better Therapeutic Candidates
            </h1>

            <p className="text-base sm:text-lg text-slate-200 leading-relaxed font-normal">
              Explore drug–target interactions, evaluate molecular properties, and support evidence-based therapeutic discovery.
            </p>

            {/* SINGLE PRIMARY ACTION BUTTON */}
            <div className="pt-2">
              <Link
                to="/analysis/new"
                className="inline-flex items-center space-x-2.5 px-6 py-3.5 rounded-xl bg-gradient-to-r from-[#0D9488] to-[#1E3A8A] hover:from-[#0F766E] hover:to-[#172554] text-white font-semibold text-sm shadow-lg shadow-teal-900/30 transition-all transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-cyan-200" />
                <span>Start New Analysis</span>
                <ArrowRight className="w-4 h-4 text-cyan-200" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 2. SCIENTIFIC RESEARCH PHOTOGRAPHY SHOWCASE & CORE PIPELINE OVERVIEW */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div>
          <div className="border-b border-slate-200 pb-3 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                Integrated In Silico Therapeutic Discovery Pipeline
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Multi-stage computational biophysics connecting genomic targets, molecular libraries, and empirical pharmacology.
              </p>
            </div>
            <span className="text-xs font-mono text-slate-400 hidden sm:block">
              Open Hamburger Menu for Full Suite
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            {/* Stage 1: Structural Biology & Pocket Cavities */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs group hover:shadow-md transition-shadow flex flex-col">
              <div className="h-44 overflow-hidden relative bg-slate-900">
                <img
                  src="/images/card_target_discovery.jpg"
                  alt="Biochemist examining 3D protein crystal coordinates and binding cavities"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-90"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/images/login_drug_research.jpg';
                  }}
                />
                <div className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full bg-slate-950/70 text-cyan-300 text-[11px] font-mono border border-cyan-400/30 backdrop-blur-xs">
                  Stage 1: Receptors & Pockets
                </div>
              </div>
              <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <h3 className="font-bold text-sm text-slate-900 group-hover:text-blue-900 transition-colors">
                    Target Identification & Cavity Mapping
                  </h3>
                  <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                    Identify macromolecular binding pockets with fpocket/P2Rank geometric standards, compute druggability scores, and extract 3D search boxes.
                  </p>
                </div>
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <Link
                    to="/pockets"
                    className="text-xs font-semibold text-blue-700 hover:text-blue-900 flex items-center space-x-1"
                  >
                    <span>Detect Pockets</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                  <Link
                    to="/targets"
                    className="text-xs text-slate-500 hover:text-slate-800"
                  >
                    Target Library &rarr;
                  </Link>
                </div>
              </div>
            </div>

            {/* Stage 2: Empirical Docking & Batch Screening */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs group hover:shadow-md transition-shadow flex flex-col">
              <div className="h-44 overflow-hidden relative bg-slate-900">
                <img
                  src="/images/card_drug_discovery.jpg"
                  alt="Chemoinformatics researcher screening small molecule library against catalytic active site"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-90"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/images/hero_researchers_lab.jpg';
                  }}
                />
                <div className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full bg-slate-950/70 text-indigo-300 text-[11px] font-mono border border-indigo-400/30 backdrop-blur-xs">
                  Stage 2: Physics & Virtual Screening
                </div>
              </div>
              <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <h3 className="font-bold text-sm text-slate-900 group-hover:text-blue-900 transition-colors">
                    Empirical Docking & Virtual Screening
                  </h3>
                  <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                    Screen candidate libraries with AutoDock Vina force-field scoring, monitor background queues, and compare 9-mode conformational poses.
                  </p>
                </div>
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <Link
                    to="/batch-screening"
                    className="text-xs font-semibold text-indigo-700 hover:text-indigo-900 flex items-center space-x-1"
                  >
                    <span>Batch Screening</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                  <Link
                    to="/docking"
                    className="text-xs text-slate-500 hover:text-slate-800"
                  >
                    AutoDock Vina &rarr;
                  </Link>
                </div>
              </div>
            </div>

            {/* Stage 3: Pharmacokinetics & Prioritization */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs group hover:shadow-md transition-shadow flex flex-col">
              <div className="h-44 overflow-hidden relative bg-slate-900">
                <img
                  src="/images/card_therapeutic_discovery.jpg"
                  alt="Clinical pharmacology scientist analyzing pharmacokinetic absorption and safety profiles"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-90"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/images/login_drug_research.jpg';
                  }}
                />
                <div className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full bg-slate-950/70 text-teal-300 text-[11px] font-mono border border-teal-400/30 backdrop-blur-xs">
                  Stage 3: ADMET & Prioritization
                </div>
              </div>
              <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <h3 className="font-bold text-sm text-slate-900 group-hover:text-blue-900 transition-colors">
                    ADMET Profiling & Compound Prioritization
                  </h3>
                  <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                    Evaluate 5-dimension ADMET safety, query live PubMed clinical literature, and apply multi-parametric ranking formulas to prioritize hits.
                  </p>
                </div>
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <Link
                    to="/admet"
                    className="text-xs font-semibold text-teal-700 hover:text-teal-900 flex items-center space-x-1"
                  >
                    <span>ADMET Evaluation</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                  <Link
                    to="/prioritization"
                    className="text-xs text-slate-500 hover:text-slate-800"
                  >
                    Prioritization &rarr;
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
