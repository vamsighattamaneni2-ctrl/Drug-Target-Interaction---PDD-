import React, { useState, useMemo } from 'react';
import {
  GitCompare,
  Plus,
  Trash2,
  AlertTriangle,
  Download,
  Info,
  CheckCircle2,
  XCircle,
  ExternalLink,
  ChevronRight,
  Filter,
  Sparkles,
  Search,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { appStateService } from '../services/appStateService';
import { Compound } from '../types';

export const CompareCandidatesPage: React.FC = () => {
  const allCompounds = useMemo(() => appStateService.getCompounds(), []);
  const allAdmet = useMemo(() => appStateService.getAdmetProfiles(), []);
  const analyses = useMemo(() => appStateService.getAnalyses(), []);

  // Pre-select 2 compounds
  const [selectedIds, setSelectedIds] = useState<string[]>([
    allCompounds[0]?.id || 'imatinib',
    allCompounds[1]?.id || 'gefitinib',
  ]);
  const [filterQuery, setFilterQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'physicochemical' | 'docking' | 'admet'>('all');

  const selectedCompounds = useMemo(() => {
    return selectedIds
      .map((id) => allCompounds.find((c) => c.id === id))
      .filter((c): c is Compound => Boolean(c));
  }, [selectedIds, allCompounds]);

  const availableToAdd = useMemo(() => {
    return allCompounds.filter(
      (c) =>
        !selectedIds.includes(c.id) &&
        (c.name.toLowerCase().includes(filterQuery.toLowerCase()) ||
          c.pubchemCid?.toLowerCase().includes(filterQuery.toLowerCase()))
    );
  }, [allCompounds, selectedIds, filterQuery]);

  const handleAdd = (id: string) => {
    if (!selectedIds.includes(id)) {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleRemove = (id: string) => {
    setSelectedIds(selectedIds.filter((item) => item !== id));
  };

  const exportComparisonCSV = () => {
    const headers = [
      'Compound Name',
      'PubChem CID',
      'Formula',
      'MW (g/mol)',
      'LogP',
      'HBD',
      'HBA',
      'Rotatable Bonds',
      'Lipinski Violations',
      'Best Docking Target',
      'Best Docking Score (kcal/mol)',
      'GI Absorption',
      'BBB Permeation',
      'CYP3A4 Substrate',
      'hERG Risk',
    ];

    const rows = selectedCompounds.map((c) => {
      const admet = allAdmet.find((a) => a.compoundId === c.id);
      const cAnalyses = analyses.filter((a) => a.compoundId === c.id && a.status === 'completed');
      const bestAnalysis = cAnalyses.sort((a, b) => (a.dockingScore || 0) - (b.dockingScore || 0))[0];

      return [
        `"${c.name}"`,
        c.pubchemCid || 'N/A',
        c.formula,
        c.molecularWeight,
        c.logP,
        c.hbd,
        c.hba,
        c.rotatableBonds,
        admet?.lipinskiRuleOfFive?.violations ?? admet?.lipinskiViolations ?? (c.molecularWeight > 500 ? 1 : 0),
        `"${bestAnalysis?.targetName || 'N/A'}"`,
        bestAnalysis?.dockingScore ?? 'N/A',
        admet?.giAbsorption || 'High',
        admet?.bbbPermeability ? 'Yes' : 'No',
        admet?.cyp3a4Substrate ? 'Yes' : 'No',
        admet?.hergToxicityRisk || 'Low',
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Candidate_Comparison_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-[#0284C7] uppercase tracking-wider mb-1">
            <GitCompare className="w-4 h-4" />
            <span>Therapeutic Candidate Assessment</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Compare Candidate Compounds</h1>
          <p className="text-xs text-slate-500 mt-1 max-w-3xl">
            Side-by-side comparative analysis of physicochemical metrics, computational docking affinities, ADMET
            profiles, and interaction profiles for hit-to-lead decision making.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={exportComparisonCSV}
            disabled={selectedCompounds.length === 0}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-lg bg-white border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-sm transition-all disabled:opacity-50"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Export Comparison (CSV)</span>
          </button>
          <Link
            to="/analysis/new"
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-lg bg-[#0284C7] hover:bg-[#0369A1] text-white text-xs font-semibold shadow-sm transition-all"
          >
            <Sparkles className="w-4 h-4" />
            <span>New Analysis</span>
          </Link>
        </div>
      </div>

      {/* Scientific Validation & Method Caution Alert */}
      <div className="p-4 rounded-xl bg-amber-50/90 border border-amber-200 text-amber-900 text-xs flex items-start space-x-3">
        <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <div className="font-semibold text-amber-950">Comparative Methodological Standard</div>
          <p className="text-amber-800 leading-relaxed">
            Only compare docking scores generated using compatible grid boxes, exhaustive search modes, and scoring
            functions (e.g. AutoDock Vina). <strong>Do not rank a compound as clinically superior based solely on a docking score.</strong> In vitro binding assays (Kd, IC50), target selectivity, and in vivo bioavailability must be independently confirmed.
          </p>
        </div>
      </div>

      {/* Selector & Compound Cards */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold text-slate-800">Selected Compounds ({selectedCompounds.length})</span>
            <span className="text-[11px] text-slate-500">Select two or more candidates to compare:</span>
          </div>

          {/* Add candidate dropdown search */}
          <div className="relative">
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5 pointer-events-none" />
                <input
                  type="text"
                  value={filterQuery}
                  onChange={(e) => setFilterQuery(e.target.value)}
                  placeholder="Add compound..."
                  className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:bg-white focus:border-[#0284C7] w-48"
                />
              </div>
            </div>
            {filterQuery && (
              <div className="absolute right-0 mt-1 w-64 bg-white border border-slate-200 rounded-lg shadow-lg z-20 max-h-48 overflow-y-auto p-1 text-xs">
                {availableToAdd.length === 0 ? (
                  <div className="p-2 text-slate-400 text-center text-[11px]">No matching candidates</div>
                ) : (
                  availableToAdd.map((comp) => (
                    <button
                      key={comp.id}
                      onClick={() => {
                        handleAdd(comp.id);
                        setFilterQuery('');
                      }}
                      className="w-full text-left px-2.5 py-1.5 hover:bg-sky-50 rounded flex items-center justify-between group"
                    >
                      <div>
                        <div className="font-semibold text-slate-800 group-hover:text-[#0284C7]">{comp.name}</div>
                        <div className="text-[10px] text-slate-400">{comp.formula} • MW {comp.molecularWeight}</div>
                      </div>
                      <Plus className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#0284C7]" />
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        {/* Selected Compound Badges */}
        <div className="flex flex-wrap gap-2 pt-2">
          {selectedCompounds.map((comp) => (
            <div
              key={comp.id}
              className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-sky-50 border border-sky-200 text-xs text-sky-900"
            >
              <div className="w-2 h-2 rounded-full bg-[#0284C7]" />
              <span className="font-bold">{comp.name}</span>
              <span className="text-[11px] text-sky-700">({comp.formula})</span>
              {selectedCompounds.length > 2 && (
                <button
                  onClick={() => handleRemove(comp.id)}
                  className="text-sky-500 hover:text-rose-600 transition-colors ml-1"
                  title="Remove from comparison"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Comparison View Filter Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
            activeTab === 'all'
              ? 'bg-[#0284C7] text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          All Dimensions
        </button>
        <button
          onClick={() => setActiveTab('physicochemical')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
            activeTab === 'physicochemical'
              ? 'bg-[#0284C7] text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Physicochemical & Drug-Likeness
        </button>
        <button
          onClick={() => setActiveTab('docking')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
            activeTab === 'docking'
              ? 'bg-[#0284C7] text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Docking & Target Interactions
        </button>
        <button
          onClick={() => setActiveTab('admet')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
            activeTab === 'admet'
              ? 'bg-[#0284C7] text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          ADMET Predictions
        </button>
      </div>

      {/* Structured Comparison Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="py-3 px-4 font-bold text-slate-700 w-64 bg-slate-100/70 border-r border-slate-200">
                  Feature / Parameter
                </th>
                {selectedCompounds.map((comp) => (
                  <th key={comp.id} className="py-3 px-4 font-bold text-slate-800 min-w-[200px] border-r border-slate-200 last:border-r-0">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-bold text-slate-900">{comp.name}</div>
                        <div className="text-[10px] font-mono text-slate-400 font-normal">
                          PubChem: {comp.pubchemCid || 'N/A'}
                        </div>
                      </div>
                      <Link
                        to={`/compounds`}
                        className="text-[11px] text-[#0284C7] hover:underline inline-flex items-center"
                      >
                        Details <ExternalLink className="w-2.5 h-2.5 ml-0.5" />
                      </Link>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans">
              {/* Category: Identity & Chemistry */}
              {(activeTab === 'all' || activeTab === 'physicochemical') && (
                <>
                  <tr className="bg-slate-50/50">
                    <td colSpan={selectedCompounds.length + 1} className="py-2 px-4 font-bold text-slate-700 uppercase tracking-wider text-[10px] bg-sky-50/60 text-[#0369A1]">
                      1. Identification & 2D Architecture
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-4 font-semibold text-slate-700 bg-slate-50/30 border-r border-slate-200">
                      Molecular Formula
                    </td>
                    {selectedCompounds.map((comp) => (
                      <td key={comp.id} className="py-2.5 px-4 font-mono font-bold text-slate-800 border-r border-slate-200 last:border-r-0">
                        {comp.formula}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-2.5 px-4 font-semibold text-slate-700 bg-slate-50/30 border-r border-slate-200">
                      Canonical SMILES
                    </td>
                    {selectedCompounds.map((comp) => (
                      <td key={comp.id} className="py-2.5 px-4 font-mono text-[10px] text-slate-600 break-all max-w-xs border-r border-slate-200 last:border-r-0">
                        {comp.canonicalSmiles}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-2.5 px-4 font-semibold text-slate-700 bg-slate-50/30 border-r border-slate-200">
                      Data Source
                    </td>
                    {selectedCompounds.map((comp) => (
                      <td key={comp.id} className="py-2.5 px-4 text-slate-600 border-r border-slate-200 last:border-r-0">
                        <span className="inline-flex items-center px-2 py-0.5 rounded bg-slate-100 text-[10px] font-mono text-slate-700">
                          {comp.sourceDatabase}
                        </span>
                      </td>
                    ))}
                  </tr>

                  {/* Physicochemical Properties */}
                  <tr className="bg-slate-50/50">
                    <td colSpan={selectedCompounds.length + 1} className="py-2 px-4 font-bold uppercase tracking-wider text-[10px] bg-sky-50/60 text-[#0369A1]">
                      2. Physicochemical Descriptors
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-4 font-semibold text-slate-700 bg-slate-50/30 border-r border-slate-200">
                      Molecular Weight (g/mol)
                      <span className="block text-[10px] text-slate-400 font-normal">Lipinski limit: ≤ 500</span>
                    </td>
                    {selectedCompounds.map((comp) => (
                      <td key={comp.id} className="py-2.5 px-4 font-mono text-slate-800 border-r border-slate-200 last:border-r-0">
                        <span className={comp.molecularWeight <= 500 ? 'text-emerald-700 font-bold' : 'text-amber-700 font-bold'}>
                          {comp.molecularWeight} g/mol
                        </span>
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-2.5 px-4 font-semibold text-slate-700 bg-slate-50/30 border-r border-slate-200">
                      LogP (Partition Coefficient)
                      <span className="block text-[10px] text-slate-400 font-normal">Lipinski limit: ≤ 5.0</span>
                    </td>
                    {selectedCompounds.map((comp) => (
                      <td key={comp.id} className="py-2.5 px-4 font-mono text-slate-800 border-r border-slate-200 last:border-r-0">
                        <span className={(comp.logP ?? 0) <= 5.0 ? 'text-emerald-700 font-bold' : 'text-amber-700 font-bold'}>
                          {comp.logP ?? 'N/A'}
                        </span>
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-2.5 px-4 font-semibold text-slate-700 bg-slate-50/30 border-r border-slate-200">
                      H-Bond Donors (HBD)
                      <span className="block text-[10px] text-slate-400 font-normal">Lipinski limit: ≤ 5</span>
                    </td>
                    {selectedCompounds.map((comp) => (
                      <td key={comp.id} className="py-2.5 px-4 font-mono text-slate-800 border-r border-slate-200 last:border-r-0">
                        {comp.hbd}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-2.5 px-4 font-semibold text-slate-700 bg-slate-50/30 border-r border-slate-200">
                      H-Bond Acceptors (HBA)
                      <span className="block text-[10px] text-slate-400 font-normal">Lipinski limit: ≤ 10</span>
                    </td>
                    {selectedCompounds.map((comp) => (
                      <td key={comp.id} className="py-2.5 px-4 font-mono text-slate-800 border-r border-slate-200 last:border-r-0">
                        {comp.hba}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-2.5 px-4 font-semibold text-slate-700 bg-slate-50/30 border-r border-slate-200">
                      Rotatable Bonds
                      <span className="block text-[10px] text-slate-400 font-normal">Veber rule: ≤ 10</span>
                    </td>
                    {selectedCompounds.map((comp) => (
                      <td key={comp.id} className="py-2.5 px-4 font-mono text-slate-800 border-r border-slate-200 last:border-r-0">
                        {comp.rotatableBonds}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-2.5 px-4 font-semibold text-slate-700 bg-slate-50/30 border-r border-slate-200">
                      Lipinski Rule of Five
                    </td>
                    {selectedCompounds.map((comp) => {
                      const admet = allAdmet.find((a) => a.compoundId === comp.id);
                      const violations = admet?.lipinskiRuleOfFive?.violations ?? admet?.lipinskiViolations ?? (comp.molecularWeight > 500 ? 1 : 0);
                      const passes = violations <= 1;
                      return (
                        <td key={comp.id} className="py-2.5 px-4 border-r border-slate-200 last:border-r-0">
                          <span
                            className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                              passes
                                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                : 'bg-rose-50 text-rose-800 border border-rose-200'
                            }`}
                          >
                            {passes ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <XCircle className="w-3.5 h-3.5 text-rose-600" />}
                            <span>{passes ? 'Compliant' : 'Non-Compliant'} ({violations} viol.)</span>
                          </span>
                        </td>
                      );
                    })}
                  </tr>
                </>
              )}

              {/* Category: Docking & Interaction Scores */}
              {(activeTab === 'all' || activeTab === 'docking') && (
                <>
                  <tr className="bg-slate-50/50">
                    <td colSpan={selectedCompounds.length + 1} className="py-2 px-4 font-bold uppercase tracking-wider text-[10px] bg-sky-50/60 text-[#0369A1]">
                      3. Interaction Docking Affinities
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-4 font-semibold text-slate-700 bg-slate-50/30 border-r border-slate-200">
                      Comparable Target Analyses
                    </td>
                    {selectedCompounds.map((comp) => {
                      const cAnalyses = analyses.filter((a) => a.compoundId === comp.id);
                      return (
                        <td key={comp.id} className="py-2.5 px-4 border-r border-slate-200 last:border-r-0">
                          <div className="space-y-1.5">
                            {cAnalyses.length === 0 ? (
                              <span className="text-slate-400 italic text-[11px]">No completed docking runs</span>
                            ) : (
                              cAnalyses.map((an) => (
                                <div key={an.id} className="p-2 rounded bg-slate-50 border border-slate-200 text-[11px]">
                                  <div className="flex items-center justify-between">
                                    <span className="font-semibold text-slate-800">{an.targetName}</span>
                                    <span className="font-mono font-bold text-sky-700">{an.dockingScore ?? 'N/A'} kcal/mol</span>
                                  </div>
                                  <div className="text-[10px] text-slate-500 mt-0.5">Method: {an.method}</div>
                                </div>
                              ))
                            )}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                  <tr>
                    <td className="py-2.5 px-4 font-semibold text-slate-700 bg-slate-50/30 border-r border-slate-200">
                      Calculated Binding Contacts
                    </td>
                    {selectedCompounds.map((comp) => {
                      const an = analyses.find((a) => a.compoundId === comp.id && a.contacts && a.contacts.length > 0);
                      const contacts = an?.contacts || [];
                      return (
                        <td key={comp.id} className="py-2.5 px-4 border-r border-slate-200 last:border-r-0">
                          {contacts.length === 0 ? (
                            <span className="text-slate-400 italic text-[11px]">No contact residues logged</span>
                          ) : (
                            <div className="flex flex-wrap gap-1">
                              {contacts.slice(0, 4).map((cnt, idx) => (
                                <span
                                  key={idx}
                                  className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 text-[10px] font-mono text-slate-700"
                                >
                                  {cnt.residue} ({cnt.interactionType})
                                </span>
                              ))}
                              {contacts.length > 4 && (
                                <span className="text-[10px] text-slate-400 self-center">+{contacts.length - 4} more</span>
                              )}
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                </>
              )}

              {/* Category: ADMET Evaluation */}
              {(activeTab === 'all' || activeTab === 'admet') && (
                <>
                  <tr className="bg-slate-50/50">
                    <td colSpan={selectedCompounds.length + 1} className="py-2 px-4 font-bold uppercase tracking-wider text-[10px] bg-sky-50/60 text-[#0369A1]">
                      4. ADMET Pharmacokinetics (In Silico Predictions)
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-4 font-semibold text-slate-700 bg-slate-50/30 border-r border-slate-200">
                      Gastrointestinal (GI) Absorption
                    </td>
                    {selectedCompounds.map((comp) => {
                      const admet = allAdmet.find((a) => a.compoundId === comp.id);
                      const abs = admet?.giAbsorption || 'High';
                      return (
                        <td key={comp.id} className="py-2.5 px-4 border-r border-slate-200 last:border-r-0">
                          <span
                            className={`font-semibold ${
                              abs === 'High' ? 'text-emerald-700' : abs === 'Moderate' ? 'text-amber-700' : 'text-rose-700'
                            }`}
                          >
                            {abs}
                          </span>
                        </td>
                      );
                    })}
                  </tr>
                  <tr>
                    <td className="py-2.5 px-4 font-semibold text-slate-700 bg-slate-50/30 border-r border-slate-200">
                      Blood-Brain Barrier (BBB)
                    </td>
                    {selectedCompounds.map((comp) => {
                      const admet = allAdmet.find((a) => a.compoundId === comp.id);
                      return (
                        <td key={comp.id} className="py-2.5 px-4 border-r border-slate-200 last:border-r-0">
                          <span className="font-semibold text-slate-700">
                            {admet?.bbbPermeability ? 'Permeable (CNS active)' : 'Non-Permeable (Periphery)'}
                          </span>
                        </td>
                      );
                    })}
                  </tr>
                  <tr>
                    <td className="py-2.5 px-4 font-semibold text-slate-700 bg-slate-50/30 border-r border-slate-200">
                      CYP3A4 Inhibition / Substrate
                    </td>
                    {selectedCompounds.map((comp) => {
                      const admet = allAdmet.find((a) => a.compoundId === comp.id);
                      return (
                        <td key={comp.id} className="py-2.5 px-4 border-r border-slate-200 last:border-r-0">
                          <span className={admet?.cyp3a4Substrate ? 'text-amber-700 font-semibold' : 'text-slate-600'}>
                            {admet?.cyp3a4Substrate ? 'Yes (Potential DDI risk)' : 'No (Low risk)'}
                          </span>
                        </td>
                      );
                    })}
                  </tr>
                  <tr>
                    <td className="py-2.5 px-4 font-semibold text-slate-700 bg-slate-50/30 border-r border-slate-200">
                      Cardiotoxicity (hERG Channel)
                    </td>
                    {selectedCompounds.map((comp) => {
                      const admet = allAdmet.find((a) => a.compoundId === comp.id);
                      const risk = admet?.hergToxicityRisk || 'Low';
                      return (
                        <td key={comp.id} className="py-2.5 px-4 border-r border-slate-200 last:border-r-0">
                          <span
                            className={`font-semibold ${
                              risk === 'Low' ? 'text-emerald-700' : risk === 'Moderate' ? 'text-amber-700' : 'text-rose-700'
                            }`}
                          >
                            {risk} Risk
                          </span>
                        </td>
                      );
                    })}
                  </tr>
                  <tr>
                    <td className="py-2.5 px-4 font-semibold text-slate-700 bg-slate-50/30 border-r border-slate-200">
                      Hepatotoxicity Risk Flag
                    </td>
                    {selectedCompounds.map((comp) => {
                      const admet = allAdmet.find((a) => a.compoundId === comp.id);
                      return (
                        <td key={comp.id} className="py-2.5 px-4 border-r border-slate-200 last:border-r-0">
                          <span className={admet?.hepatotoxicityFlag ? 'text-rose-700 font-semibold' : 'text-emerald-700 font-semibold'}>
                            {admet?.hepatotoxicityFlag ? 'Flagged (Monitor transaminases)' : 'Negative (Clean profile)'}
                          </span>
                        </td>
                      );
                    })}
                  </tr>
                </>
              )}

              {/* Action Rows */}
              <tr className="bg-slate-50">
                <td className="py-3 px-4 font-bold text-slate-700 bg-slate-100/70 border-r border-slate-200">
                  Actions
                </td>
                {selectedCompounds.map((comp) => (
                  <td key={comp.id} className="py-3 px-4 border-r border-slate-200 last:border-r-0">
                    <div className="flex flex-col space-y-1.5">
                      <Link
                        to={`/analysis/new`}
                        className="text-center px-2.5 py-1.5 rounded bg-[#0284C7] hover:bg-[#0369A1] text-white text-[11px] font-semibold transition-all shadow-sm"
                      >
                        Launch Pairwise Analysis
                      </Link>
                      <Link
                        to={`/admet`}
                        className="text-center px-2.5 py-1.5 rounded bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 text-[11px] font-semibold transition-all"
                      >
                        View Full ADMET Dossier
                      </Link>
                    </div>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
