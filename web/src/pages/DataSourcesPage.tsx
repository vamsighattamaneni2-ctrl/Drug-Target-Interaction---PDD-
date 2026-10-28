import React from 'react';
import {
  Database,
  ExternalLink,
  Library,
  Info,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';

interface DataSourceItem {
  name: string;
  dataType: string;
  purpose: string;
  usage: string;
  integrationStatus: 'Reference Source' | 'Direct API';
  link: string;
  version: string;
}

const SOURCES: DataSourceItem[] = [
  {
    name: 'PubChem (NIH)',
    version: 'PUG-REST v2.0',
    dataType: '2D/3D Chemical Structures, Canonical SMILES, InChIKey, Physical Properties',
    purpose: 'Open chemistry repository indexing molecular physical properties, chemical identifiers, and biological assay outcomes.',
    usage: 'Live small molecule search, automated 2D depiction rendering, and .SDF / .MOL 3D coordinate pipeline.',
    integrationStatus: 'Direct API',
    link: 'https://pubchem.ncbi.nlm.nih.gov',
  },
  {
    name: 'ChEMBL (EMBL-EBI)',
    version: 'ChEMBL 34 REST API',
    dataType: 'Bioactivity, Binding Affinities (Kd, Ki, IC50), Drug Mechanisms, Clinical Phases',
    purpose: 'Manually curated bioactivity database providing measured affinity constants and target pharmacological profiles.',
    usage: 'Calibrating quantitative binding affinity ranges and benchmarking simulated interaction confidence scores.',
    integrationStatus: 'Direct API',
    link: 'https://www.ebi.ac.uk/chembl',
  },
  {
    name: 'UniProt KB',
    version: 'UniProtKB REST API',
    dataType: 'Protein Sequences, Domain Architecture, Kinase Active Sites, PDB Mappings',
    purpose: 'Protein knowledgebase supplying canonical accession numbers, catalytic domain annotations, and mutation variants.',
    usage: 'Live protein search, canonical primary amino acid sequences, and mapping UniProt accession IDs to PDB crystal structures.',
    integrationStatus: 'Direct API',
    link: 'https://www.uniprot.org',
  },
  {
    name: 'RCSB Protein Data Bank (PDB)',
    version: 'Data & Coordinates REST API',
    dataType: '3D Macromolecular Atomic Coordinates, Resolution, Experimental Methods',
    purpose: 'Global repository of atomic coordinates for biological macromolecules and drug-target complexes.',
    usage: 'Live fetching of high-resolution crystal structures, pocket cavity coordinates, and .PDB stream downloads.',
    integrationStatus: 'Direct API',
    link: 'https://www.rcsb.org',
  },
  {
    name: 'PubMed (NCBI)',
    version: 'E-Utilities REST API',
    dataType: 'Biomedical Literature, Clinical Trials, Pharmacological Studies, PMIDs, DOIs',
    purpose: 'Searchable scientific literature database covering therapeutic oncology and drug-target interactions.',
    usage: 'Automatic retrieval of peer-reviewed clinical citations, authors, and DOI links for docked candidate pairs.',
    integrationStatus: 'Direct API',
    link: 'https://pubmed.ncbi.nlm.nih.gov',
  },
  {
    name: 'DrugBank',
    version: 'Release 5.1.12',
    dataType: 'Small Molecules & Biologics, MoA, Pharmacogenomics',
    purpose: 'Comprehensive chemoinformatics repository providing chemical structures, mechanisms of action, and clinical indications.',
    usage: 'Cross-referencing approved drug identifiers, molecular weights, SMILES formulas, and documented oncology indications.',
    integrationStatus: 'Reference Source',
    link: 'https://go.drugbank.com',
  },
  {
    name: 'BindingDB',
    version: '2026 Update',
    dataType: 'Experimental Binding Thermodynamics & ITC Data',
    purpose: 'Database of measured binding affinities focusing chiefly on small molecule–target interactions and crystal complexes.',
    usage: 'Validating biophysical binding thermodynamics and corroborating kinase ATP-pocket affinities.',
    integrationStatus: 'Reference Source',
    link: 'https://www.bindingdb.org',
  },
];

export const DataSourcesPage: React.FC = () => {
  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="border-b border-slate-200 pb-5">
        <div className="flex items-center space-x-2.5">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Data Sources
          </h1>
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-blue-50 text-blue-700 border border-blue-200">
            Scientific Provenance & Standards
          </span>
        </div>
        <p className="text-sm text-slate-500 mt-1">
          Open-access bioinformatics databases, chemoinformatic repositories, and structural resources referenced within the TheraTarget platform.
        </p>
      </div>

      {/* Scientific Transparency Notice */}
      <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-200 text-xs flex items-start space-x-3">
        <ShieldCheck className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <span className="font-bold text-blue-950">Integration Status Notice</span>
          <p className="text-blue-900/90 leading-relaxed">
            All external repositories below are incorporated as <strong>Reference Sources</strong> for structural standardization, biochemical nomenclature, and educational benchmarking. External databases are not labeled as live uninterrupted endpoints unless explicitly connected via on-demand REST services (such as PubChem live queries).
          </p>
        </div>
      </div>

      {/* 6 Source Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {SOURCES.map((source) => (
          <div
            key={source.name}
            className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between hover:border-blue-400 transition-colors"
          >
            <div>
              {/* Header: Name + Status */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <span className="text-base font-bold text-slate-900">{source.name}</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                  {source.integrationStatus}
                </span>
              </div>

              {/* Version, Data Type, Purpose, Usage */}
              <div className="mt-3 space-y-2.5 text-xs">
                <div>
                  <div className="text-[10px] font-mono text-slate-400 uppercase">Data Type</div>
                  <div className="text-slate-800 font-medium mt-0.5">{source.dataType}</div>
                </div>

                <div>
                  <div className="text-[10px] font-mono text-slate-400 uppercase">Purpose</div>
                  <p className="text-slate-600 mt-0.5 leading-relaxed">{source.purpose}</p>
                </div>

                <div>
                  <div className="text-[10px] font-mono text-slate-400 uppercase">Usage in Platform</div>
                  <p className="text-slate-600 mt-0.5 leading-relaxed bg-slate-50 p-2 rounded border border-slate-100">
                    {source.usage}
                  </p>
                </div>
              </div>
            </div>

            {/* Footer with External Link */}
            <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-[10px] font-mono text-slate-400">{source.version}</span>
              <a
                href={source.link}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center space-x-1 text-blue-700 hover:text-blue-900 font-medium"
              >
                <span>Visit Database</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
