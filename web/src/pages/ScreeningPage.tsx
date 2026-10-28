import { Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Flame, Sliders } from 'lucide-react';

export const ScreeningPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#070B14] text-slate-100 py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="mb-6">
        <Link
          to="/"
          className="inline-flex items-center space-x-1.5 text-xs font-mono text-cyan-400 hover:text-cyan-300 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Overview</span>
        </Link>
      </div>

      <div className="space-y-2 mb-8">
        <div className="inline-flex items-center space-x-2 text-xs font-mono text-teal-400">
          <Flame className="w-4 h-4" />
          <span>VIRTUAL COMPOUND SCREENING</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white">Therapeutic Library Screening</h1>
        <p className="text-sm text-slate-400 max-w-2xl">
          High-throughput virtual screening of candidate molecule libraries with automated ADMET and Lipinski Rule of 5 pharmacokinetic profiling.
        </p>
      </div>

      <div className="glass-panel rounded-2xl p-8 border border-slate-800 text-center max-w-2xl mx-auto space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-teal-500/10 border border-teal-500/20 text-teal-400 flex items-center justify-center mx-auto">
          <Sliders className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-bold text-white">High-Throughput Batch Engine</h2>
        <p className="text-xs text-slate-400 leading-relaxed">
          Screen multi-compound SDF or SMILES files asynchronously against any kinase or GPCR target in the catalog.
        </p>
        <div className="inline-flex items-center space-x-2 text-xs font-mono text-teal-300 bg-teal-950/40 px-3 py-1.5 rounded-full border border-teal-800">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>ADMET Filters & QSAR Multi-Task Classifiers Ready</span>
        </div>
      </div>
    </div>
  );
};
