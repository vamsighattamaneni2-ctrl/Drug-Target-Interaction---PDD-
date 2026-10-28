import React from 'react';
import {
  HelpCircle,
  BookOpen,
  Dna,
  Cpu,
  Layers,
  ExternalLink,
  ShieldAlert,
  FileText,
  Workflow,
  Sparkles,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const HelpDocumentationPage: React.FC = () => {
  return (
    <div className="space-y-8 max-w-4xl mx-auto font-sans">
      {/* Page Header */}
      <div className="pb-4 border-b border-slate-200">
        <div className="flex items-center space-x-2 text-xs font-semibold text-[#0284C7] uppercase tracking-wider mb-1">
          <BookOpen className="w-4 h-4" />
          <span>Scientific Methodology & User Guide</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Help & Documentation</h1>
        <p className="text-xs text-slate-500 mt-1">
          Reference guide on computational docking pipelines, structural pocket definitions, ADMET pharmacokinetic
          models, and data source citations.
        </p>
      </div>

      {/* 5-Step Scientific Workflow Diagram */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex items-center space-x-2 text-slate-900 font-bold text-sm">
          <Workflow className="w-4 h-4 text-[#0284C7]" />
          <span>Therapeutic Discovery Workflow</span>
        </div>
        <p className="text-xs text-slate-600 leading-relaxed">
          The platform follows a standard computational pharmacology pipeline for prioritizing hit-to-lead therapeutic candidates:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 pt-2">
          <div className="p-3 rounded-lg bg-sky-50/60 border border-sky-200 text-xs space-y-1">
            <span className="text-[10px] font-mono font-bold text-[#0284C7] uppercase">Step 1</span>
            <div className="font-bold text-slate-900">Compound Library</div>
            <p className="text-[11px] text-slate-600">Explore small molecules, SMILES, and 2D chemical descriptors.</p>
          </div>
          <div className="p-3 rounded-lg bg-sky-50/60 border border-sky-200 text-xs space-y-1">
            <span className="text-[10px] font-mono font-bold text-[#0284C7] uppercase">Step 2</span>
            <div className="font-bold text-slate-900">Target Selection</div>
            <p className="text-[11px] text-slate-600">Query UniProt & RCSB PDB for validated macromolecular coordinates.</p>
          </div>
          <div className="p-3 rounded-lg bg-sky-50/60 border border-sky-200 text-xs space-y-1">
            <span className="text-[10px] font-mono font-bold text-[#0284C7] uppercase">Step 3</span>
            <div className="font-bold text-slate-900">Pairwise Docking</div>
            <p className="text-[11px] text-slate-600">Run AutoDock Vina search within defined binding pocket coordinates.</p>
          </div>
          <div className="p-3 rounded-lg bg-sky-50/60 border border-sky-200 text-xs space-y-1">
            <span className="text-[10px] font-mono font-bold text-[#0284C7] uppercase">Step 4</span>
            <div className="font-bold text-slate-900">3D Interaction</div>
            <p className="text-[11px] text-slate-600">Examine H-bonds, salt bridges, and steric contacts in 3Dmol viewer.</p>
          </div>
          <div className="p-3 rounded-lg bg-sky-50/60 border border-sky-200 text-xs space-y-1">
            <span className="text-[10px] font-mono font-bold text-[#0284C7] uppercase">Step 5</span>
            <div className="font-bold text-slate-900">ADMET & Reports</div>
            <p className="text-[11px] text-slate-600">Verify Lipinski compliance and compile auditable scientific dossiers.</p>
          </div>
        </div>
      </div>

      {/* Computational Engines & Methods */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
        <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
          <Cpu className="w-4 h-4 text-[#0284C7]" />
          <span>Computational Algorithms & Simulation Engines</span>
        </h2>

        <div className="space-y-4 text-xs text-slate-700">
          <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 text-sm">AutoDock Vina 1.2.5</span>
              <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-sky-100 text-[#0369A1] font-semibold">
                Molecular Docking
              </span>
            </div>
            <p className="leading-relaxed">
              Calculates empirical binding affinities through iterated local search (Broyden-Fletcher-Goldfarb-Shanno algorithm) with a scoring function accounting for steric interactions, hydrogen bonding, and hydrophobic desolvation. Scores are reported in <strong>kcal/mol</strong>, where more negative numbers indicate stronger predicted thermodynamic binding stability.
            </p>
          </div>

          <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 text-sm">RDKit Open-Source Cheminformatics</span>
              <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-sky-100 text-[#0369A1] font-semibold">
                Chemical Processing
              </span>
            </div>
            <p className="leading-relaxed">
              Provides parsing of SMILES notation, 2D structure layout generation, MMFF94 force-field geometry optimization, and calculation of physicochemical descriptors including LogP (Wildman-Crippen method), Topological Polar Surface Area (TPSA), and hydrogen-bond donor/acceptor counts.
            </p>
          </div>

          <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 text-sm">3Dmol.js WebGL Visualization Engine</span>
              <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-sky-100 text-[#0369A1] font-semibold">
                Structural Biology
              </span>
            </div>
            <p className="leading-relaxed">
              Hardware-accelerated WebGL macromolecular viewer capable of rendering secondary structures (cartoon ribbon), ligand stick geometries, active site residues, contact distance vectors, and van der Waals solvent-accessible surfaces directly in desktop and Android mobile browsers.
            </p>
          </div>
        </div>
      </div>

      {/* External Primary Data Sources */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
        <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
          <Layers className="w-4 h-4 text-[#0284C7]" />
          <span>Integrated External Data Sources</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-3 rounded-lg border border-slate-200 space-y-1">
            <div className="flex items-center justify-between font-bold text-slate-800">
              <span>PubChem (NCBI / NLM)</span>
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </div>
            <p className="text-slate-500 text-[11px] leading-relaxed">
              World's largest open chemical library providing 2D structures, molecular weights, SMILES, and bioactivity assay summaries.
            </p>
          </div>

          <div className="p-3 rounded-lg border border-slate-200 space-y-1">
            <div className="flex items-center justify-between font-bold text-slate-800">
              <span>ChEMBL (EMBL-EBI)</span>
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </div>
            <p className="text-slate-500 text-[11px] leading-relaxed">
              Curated database of bioactive molecules with drug-like properties, reporting empirical Kd, Ki, and IC50 binding records.
            </p>
          </div>

          <div className="p-3 rounded-lg border border-slate-200 space-y-1">
            <div className="flex items-center justify-between font-bold text-slate-800">
              <span>UniProt Knowledgebase</span>
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </div>
            <p className="text-slate-500 text-[11px] leading-relaxed">
              Universal protein resource providing primary amino acid sequences, catalytic residue annotations, and gene ontology associations.
            </p>
          </div>

          <div className="p-3 rounded-lg border border-slate-200 space-y-1">
            <div className="flex items-center justify-between font-bold text-slate-800">
              <span>RCSB Protein Data Bank (PDB)</span>
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </div>
            <p className="text-slate-500 text-[11px] leading-relaxed">
              Archive of experimentally resolved 3D structures determined via X-ray crystallography, Cryo-EM, and NMR spectroscopy.
            </p>
          </div>
        </div>
      </div>

      {/* Scientific Literature Citations */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-3 text-xs">
        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Scientific Literature Citations</h2>
        <ul className="space-y-2 text-slate-600 list-disc list-inside">
          <li>
            <strong>AutoDock Vina:</strong> Trott, O., & Olson, A. J. (2010). AutoDock Vina: improving the speed and accuracy of docking with a new scoring function, efficient optimization, and multithreading. <em>Journal of Computational Chemistry</em>, 31(2), 455-461.
          </li>
          <li>
            <strong>Lipinski Rule of 5:</strong> Lipinski, C. A., et al. (2001). Experimental and computational approaches to estimate solubility and permeability in drug discovery and development settings. <em>Advanced Drug Delivery Reviews</em>, 46(1-3), 3-26.
          </li>
          <li>
            <strong>3Dmol.js:</strong> Rego, N., & Koes, D. (2015). 3Dmol.js: molecular visualization without Java. <em>Bioinformatics</em>, 31(8), 1322-1324.
          </li>
        </ul>
      </div>
    </div>
  );
};
