import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  BadgeCheck,
  Search,
  Crosshair,
  Pill,
  HeartPulse,
  ExternalLink,
  ShieldCheck,
  Activity,
  Layers,
  Info,
  CheckCircle2,
  FileText,
} from 'lucide-react';
import { EVIDENCE_ITEMS } from '../data/dataset';

export const EvidenceExplorerPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('ALL');
  const [selectedStrength, setSelectedStrength] = useState('ALL');

  const evidenceTypes = Array.from(new Set(EVIDENCE_ITEMS.map((e) => e.evidenceType)));
  const strengthTypes = Array.from(new Set(EVIDENCE_ITEMS.map((e) => e.strength)));

  const filteredEvidence = EVIDENCE_ITEMS.filter((item) => {
    const matchesSearch =
      item.drugName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.targetGene.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.diseaseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.source.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.assayDetails.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = selectedType === 'ALL' || item.evidenceType === selectedType;
    const matchesStrength = selectedStrength === 'ALL' || item.strength === selectedStrength;

    return matchesSearch && matchesType && matchesStrength;
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* 1. Header */}
      <div className="border-b border-slate-200 pb-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2.5">
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                Evidence Explorer
              </h1>
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-emerald-50 text-emerald-800 border border-emerald-200">
                Data Provenance & Reliability
              </span>
            </div>
            <p className="text-sm text-slate-500 mt-1">
              Audit the scientific evidence, validation status, assay protocols, and data origin behind every drug–target interaction.
            </p>
          </div>

          <Link
            to="/analysis/interaction"
            className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-lg bg-teal-700 hover:bg-teal-800 text-white font-medium text-xs shadow-sm transition-all self-start sm:self-auto"
          >
            <Activity className="w-4 h-4 text-teal-200" />
            <span>Interaction Analyzer</span>
          </Link>
        </div>
      </div>

      {/* 2. Scientific Disclaimer & Provenance Alert */}
      <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-4 text-xs text-blue-900 flex items-start space-x-3">
        <Info className="w-5 h-5 text-blue-700 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-bold block">Scientific Transparency & Evidence Stratification:</span>
          <p className="text-blue-800 leading-relaxed">
            All records in this repository are categorized as <strong>Demo / Educational Benchmarks</strong> or <strong>Curated Database References</strong>. Computational docking scores represent mathematical approximations calibrated against published crystallographic datasets (ChEMBL, PDB, BindingDB) and do not substitute for prospective wet-lab assays.
          </p>
        </div>
      </div>

      {/* 3. Search & Filters Bar */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by drug, target, source (e.g. ChEMBL, PDB, Imatinib, EGFR)..."
              className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-10 pr-4 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all"
            />
          </div>

          <div className="sm:w-56">
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-xs text-slate-700 focus:outline-none focus:bg-white focus:border-blue-600"
            >
              <option value="ALL">All Evidence Types</option>
              {evidenceTypes.map((et) => (
                <option key={et} value={et}>
                  {et}
                </option>
              ))}
            </select>
          </div>

          <div className="sm:w-48">
            <select
              value={selectedStrength}
              onChange={(e) => setSelectedStrength(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-xs text-slate-700 focus:outline-none focus:bg-white focus:border-blue-600"
            >
              <option value="ALL">All Strengths</option>
              {strengthTypes.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500 font-mono pt-1 border-t border-slate-100">
          <span>{filteredEvidence.length} validated evidence records documented</span>
          <span>Standards: ChEMBL &bull; DrugBank &bull; PDB &bull; BindingDB</span>
        </div>
      </div>

      {/* 4. Evidence Records Table / Cards */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-mono uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4 font-semibold">Interaction Pair</th>
                <th className="py-3 px-4 font-semibold">Evidence Type</th>
                <th className="py-3 px-4 font-semibold">Source</th>
                <th className="py-3 px-4 font-semibold">Strength & Confidence</th>
                <th className="py-3 px-4 font-semibold">Validation Status</th>
                <th className="py-3 px-4 font-semibold">Data Origin</th>
                <th className="py-3 px-4 text-right font-semibold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredEvidence.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                  {/* Pair */}
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-slate-900">
                      <Link to={`/drugs/${item.drugId}`} className="hover:text-blue-700 transition-colors">
                        {item.drugName}
                      </Link>
                      <span className="text-slate-400 font-normal"> &rarr; </span>
                      <Link to={`/targets/${item.targetId}`} className="hover:text-teal-700 font-mono text-teal-800 transition-colors">
                        {item.targetGene}
                      </Link>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono block mt-0.5">
                      {item.diseaseName}
                    </span>
                  </td>

                  {/* Evidence Type */}
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[10px] font-mono font-medium ${
                        item.evidenceType === 'Experimental assay'
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : item.evidenceType === 'Database-derived evidence'
                          ? 'bg-blue-50 text-blue-800 border border-blue-200'
                          : item.evidenceType === 'Clinical literature'
                          ? 'bg-violet-50 text-violet-800 border border-violet-200'
                          : 'bg-amber-50 text-amber-800 border border-amber-200'
                      }`}
                    >
                      {item.evidenceType}
                    </span>
                  </td>

                  {/* Source */}
                  <td className="py-3.5 px-4 font-mono font-semibold text-slate-800">
                    {item.source}
                  </td>

                  {/* Strength & Confidence */}
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-slate-900">{item.strength}</div>
                    <span className="text-[10px] font-mono text-emerald-700">Confidence: {item.confidence}</span>
                  </td>

                  {/* Validation Status */}
                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center space-x-1 text-slate-700">
                      <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                      <span className="truncate max-w-[170px]">{item.validationStatus}</span>
                    </span>
                  </td>

                  {/* Data Origin */}
                  <td className="py-3.5 px-4">
                    <span className="inline-block px-2 py-0.5 rounded text-[10px] font-mono bg-slate-100 text-slate-600 border border-slate-200">
                      {item.dataOrigin}
                    </span>
                  </td>

                  {/* Action */}
                  <td className="py-3.5 px-4 text-right">
                    <Link
                      to={`/analysis/interaction?drug=${item.drugId}&target=${item.targetId}`}
                      className="inline-flex items-center space-x-1 px-2.5 py-1 rounded bg-blue-50 hover:bg-blue-100 text-blue-800 font-semibold text-xs transition-colors"
                    >
                      <Activity className="w-3.5 h-3.5" />
                      <span>Analyze</span>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
