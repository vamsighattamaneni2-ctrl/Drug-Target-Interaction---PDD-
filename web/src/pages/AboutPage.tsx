import React from 'react';
import {
  Info,
  Dna,
  Cpu,
  GitBranch,
  Database,
  Pill,
  CheckCircle2,
  Library,
  ShieldAlert,
  Compass,
  Layers,
  ArrowRight,
  FlaskConical,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const AboutPage: React.FC = () => {
  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-5xl mx-auto">
      {/* 1. Platform Branding Header */}
      <div className="border-b border-slate-200 pb-5">
        <div className="flex items-center space-x-2.5">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            TheraTarget
          </h1>
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-blue-50 text-blue-700 border border-blue-200">
            Version 2.0 &bull; Research Edition
          </span>
        </div>
        <p className="text-base font-semibold text-blue-900 mt-1">
          Drug–Target Interaction Intelligence Platform
        </p>
        <p className="text-xs text-slate-500 italic mt-0.5">
          “Explore molecules. Understand targets. Discover therapeutic opportunities.”
        </p>
      </div>

      {/* 2. Purpose */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm space-y-3">
        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider font-mono flex items-center space-x-2">
          <Compass className="w-4 h-4 text-blue-700" />
          <span>Purpose</span>
        </h2>
        <p className="text-xs text-slate-600 leading-relaxed">
          <strong>TheraTarget</strong> is a scientific drug-discovery intelligence platform built to bridge the gap between chemoinformatic structural data, biophysical target interaction profiling, and disease pathway nosology. The platform provides computational researchers, pharmacologists, and translational scientists with an interconnected interface to formulate, investigate, and test drug discovery hypotheses.
        </p>
      </div>

      {/* 3. Scientific Concept */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm space-y-3">
        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider font-mono flex items-center space-x-2">
          <Dna className="w-4 h-4 text-blue-700" />
          <span>Scientific Concept</span>
        </h2>
        <p className="text-xs text-slate-600 leading-relaxed">
          Modern drug discovery operates on the principle that small molecules rarely interact with a single biological target in isolation. Polypharmacology—the modulation of multiple targets across biological pathways—dictates both therapeutic efficacy and off-target toxicology.
        </p>
        <p className="text-xs text-slate-600 leading-relaxed">
          TheraTarget models the entire translational continuum:
          <strong className="text-slate-800 ml-1">
            DRUG &rarr; MOLECULAR TARGET &rarr; DRUG–TARGET INTERACTION &rarr; BIOLOGICAL PATHWAY &rarr; DISEASE &rarr; THERAPEUTIC OPPORTUNITY
          </strong>.
          By structuring affinity data across multiple confidence tiers, researchers can pinpoint high-affinity primary on-target agents while uncovering secondary interactions suitable for clinical repurposing.
        </p>
      </div>

      {/* 4. Application Workflow */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm space-y-4">
        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider font-mono flex items-center space-x-2">
          <GitBranch className="w-4 h-4 text-blue-700" />
          <span>Application Workflow</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 text-xs">
          <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-1.5">
            <span className="w-5 h-5 rounded-full bg-[#1E3A8A] text-white flex items-center justify-center font-bold text-[10px]">
              1
            </span>
            <div className="font-bold text-slate-900">Explore Entities</div>
            <p className="text-[11px] text-slate-500 leading-normal">
              Investigate drugs, targets, pathways, and oncology diseases.
            </p>
          </div>

          <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-1.5">
            <span className="w-5 h-5 rounded-full bg-[#1E3A8A] text-white flex items-center justify-center font-bold text-[10px]">
              2
            </span>
            <div className="font-bold text-slate-900">Analyze Affinity</div>
            <p className="text-[11px] text-slate-500 leading-normal">
              Compute Kd, pKd, and confidence tiers via pairwise analysis.
            </p>
          </div>

          <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-1.5">
            <span className="w-5 h-5 rounded-full bg-[#1E3A8A] text-white flex items-center justify-center font-bold text-[10px]">
              3
            </span>
            <div className="font-bold text-slate-900">Review Evidence</div>
            <p className="text-[11px] text-slate-500 leading-normal">
              Audit data provenance and separate computational predictions from benchmarks.
            </p>
          </div>

          <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-1.5">
            <span className="w-5 h-5 rounded-full bg-[#1E3A8A] text-white flex items-center justify-center font-bold text-[10px]">
              4
            </span>
            <div className="font-bold text-slate-900">Map Networks</div>
            <p className="text-[11px] text-slate-500 leading-normal">
              Trace multi-partite Drug &rarr; Target &rarr; Pathway &rarr; Disease topologies.
            </p>
          </div>

          <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-1.5">
            <span className="w-5 h-5 rounded-full bg-[#1E3A8A] text-white flex items-center justify-center font-bold text-[10px]">
              5
            </span>
            <div className="font-bold text-slate-900">Discover & Export</div>
            <p className="text-[11px] text-slate-500 leading-normal">
              Prioritize targets, screen repurposing leads, and generate research reports.
            </p>
          </div>
        </div>
      </div>

      {/* 5. Technology */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm space-y-3">
        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider font-mono flex items-center space-x-2">
          <Cpu className="w-4 h-4 text-blue-700" />
          <span>Technology Stack</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
            <span className="font-bold text-slate-900 block">Frontend Architecture</span>
            <p className="text-slate-600 mt-1">React 18, TypeScript, Tailwind CSS, Lucide Icons, and React Router 6.</p>
          </div>
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
            <span className="font-bold text-slate-900 block">Bioinformatics APIs</span>
            <p className="text-slate-600 mt-1">NCBI PubChem PUG-REST, RCSB Protein Data Bank API, and UniProt KB REST.</p>
          </div>
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
            <span className="font-bold text-slate-900 block">Backend & Services</span>
            <p className="text-slate-600 mt-1">FastAPI Python backend with biophysical prediction heuristics and Firebase Auth.</p>
          </div>
        </div>
      </div>

      {/* 6. Use Cases */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm space-y-3">
        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider font-mono flex items-center space-x-2">
          <Layers className="w-4 h-4 text-blue-700" />
          <span>Use Cases</span>
        </h2>
        <ul className="text-xs text-slate-600 space-y-2 list-disc list-inside leading-relaxed">
          <li><strong>De Novo Interaction Profiling:</strong> Evaluate candidate binding between approved small molecules and newly crystallized kinase variants.</li>
          <li><strong>Oncology Target Prioritization:</strong> Rank therapeutic kinase targets across solid tumors and hematologic malignancies based on clinical druggability and multi-layer connectivity.</li>
          <li><strong>Drug Repurposing Screening:</strong> Identify approved oncology agents with unexploited off-target affinities for rare or therapy-resistant cancers.</li>
          <li><strong>Pathway Impact Mapping:</strong> Quantify how multi-kinase inhibitors modulate converging signal transduction cascades.</li>
        </ul>
      </div>

      {/* 7. Limitations & 8. Future Development */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm space-y-3">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider font-mono flex items-center space-x-2">
            <ShieldAlert className="w-4 h-4 text-amber-600" />
            <span>Limitations</span>
          </h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            Interactions presented in this demonstration dataset reflect curated pharmacological benchmarks and in silico predictive modeling. Binding affinity scores are computational estimations and do not account for in vivo ADMET (absorption, distribution, metabolism, excretion, toxicology) properties or patient-specific tumor microenvironments.
          </p>
        </div>

        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm space-y-3">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider font-mono flex items-center space-x-2">
            <FlaskConical className="w-4 h-4 text-blue-700" />
            <span>Future Development</span>
          </h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            Upcoming platform iterations will incorporate 3D molecular docking visualization (NGL / Mol* viewers), AlphaFold structure integration, deep-learning based binding free energy (&Delta;G) calculations, and clinical trial cohort outcome cross-referencing.
          </p>
        </div>
      </div>

      {/* 9. Scientific Research Disclaimer */}
      <div className="p-5 rounded-xl bg-amber-50/50 border border-amber-200 text-xs space-y-2">
        <div className="flex items-center space-x-2 font-bold text-amber-900">
          <Info className="w-4 h-4 text-amber-700" />
          <span>Scientific Research & Educational Disclaimer</span>
        </div>
        <p className="text-amber-800/90 leading-relaxed">
          TheraTarget is intended strictly for academic research, hypothesis generation, and educational bioinformatics exploration. The outputs, rankings, and interaction predictions provided by this platform do not constitute medical advice, clinical guidance, or experimental laboratory validation. No clinical administration of any compound should be undertaken based solely on in silico computational predictions.
        </p>
      </div>
    </div>
  );
};
