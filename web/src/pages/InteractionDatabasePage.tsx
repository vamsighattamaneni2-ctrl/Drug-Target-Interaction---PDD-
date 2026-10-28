import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Database,
  Search,
  Filter,
  ArrowUpDown,
  Download,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  Eye,
} from 'lucide-react';
import { INTERACTIONS, DISEASES, TARGETS } from '../data/dataset';

export const InteractionDatabasePage: React.FC = () => {
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedConfidence, setSelectedConfidence] = useState('ALL');
  const [selectedDisease, setSelectedDisease] = useState('ALL');
  const [sortBy, setSortBy] = useState<'score' | 'drug' | 'target' | 'gene'>('score');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [showColumnMenu, setShowColumnMenu] = useState(false);
  const pageSize = 8;

  // Column visibility state
  const [visibleColumns, setVisibleColumns] = useState({
    drug: true,
    target: true,
    gene: true,
    disease: true,
    interactionType: true,
    score: true,
    confidence: true,
    evidence: true,
  });

  const toggleColumn = (key: keyof typeof visibleColumns) => {
    setVisibleColumns((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Filter & Sort
  const filteredInteractions = INTERACTIONS.filter((i) => {
    const matchesSearch =
      i.drugName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.drugId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.targetGene.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.targetId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.diseaseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.interactionType.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesConfidence =
      selectedConfidence === 'ALL' || i.confidence === selectedConfidence;

    const matchesDisease =
      selectedDisease === 'ALL' || i.diseaseId === selectedDisease;

    return matchesSearch && matchesConfidence && matchesDisease;
  }).sort((a, b) => {
    let comp = 0;
    if (sortBy === 'score') comp = a.score - b.score;
    if (sortBy === 'drug') comp = a.drugName.localeCompare(b.drugName);
    if (sortBy === 'target') comp = a.targetId.localeCompare(b.targetId);
    if (sortBy === 'gene') comp = a.targetGene.localeCompare(b.targetGene);
    return sortOrder === 'desc' ? -comp : comp;
  });

  // Pagination
  const totalPages = Math.ceil(filteredInteractions.length / pageSize) || 1;
  const paginatedItems = filteredInteractions.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // CSV Export functionality
  const handleExportCSV = () => {
    const headers = ['Drug', 'Drug ID', 'Target ID', 'Gene Symbol', 'Disease', 'Interaction Type', 'Score', 'Confidence', 'Evidence'];
    const rows = filteredInteractions.map((i) => [
      `"${i.drugName}"`,
      `"${i.drugId}"`,
      `"${i.targetId}"`,
      `"${i.targetGene}"`,
      `"${i.diseaseName}"`,
      `"${i.interactionType}"`,
      i.score.toFixed(2),
      `"${i.confidence}"`,
      `"${i.evidenceSource}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `TheraTarget_Interactions_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* 24. Interaction Database Header */}
      <div className="border-b border-slate-200 pb-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Interaction Database
            </h1>
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-slate-100 text-slate-600 border border-slate-200">
              Curated Registry
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Searchable repository of pairwise affinity scores, confidence classifications, and empirical evidence sources.
          </p>
        </div>

        {/* Action: Export CSV */}
        <div className="flex items-center space-x-2">
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-lg bg-[#0F172A] hover:bg-slate-800 text-white font-medium text-xs shadow-sm transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-teal-400" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Search, Filter, Sort & Column Controls */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          {/* Search */}
          <div className="relative sm:col-span-2">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by drug, target, gene, disease, or interaction type..."
              className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-sky-500"
            />
          </div>

          {/* Confidence Filter */}
          <div>
            <select
              value={selectedConfidence}
              onChange={(e) => {
                setSelectedConfidence(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 text-xs text-slate-700 focus:outline-none focus:bg-white focus:border-sky-500"
            >
              <option value="ALL">All Confidence Levels</option>
              <option value="High">High Confidence</option>
              <option value="Medium">Medium Confidence</option>
              <option value="Low">Low / Screening</option>
            </select>
          </div>

          {/* Disease Filter */}
          <div>
            <select
              value={selectedDisease}
              onChange={(e) => {
                setSelectedDisease(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 text-xs text-slate-700 focus:outline-none focus:bg-white focus:border-sky-500"
            >
              <option value="ALL">All Diseases</option>
              {DISEASES.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Toolbar: Sort Controls & Column Visibility Menu */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs">
          <div className="flex items-center space-x-2">
            <span className="text-slate-500 font-mono">Sort by:</span>
            {(['score', 'drug', 'target', 'gene'] as const).map((key) => (
              <button
                key={key}
                onClick={() => {
                  if (sortBy === key) {
                    setSortOrder((o) => (o === 'asc' ? 'desc' : 'asc'));
                  } else {
                    setSortBy(key);
                    setSortOrder('desc');
                  }
                }}
                className={`px-2.5 py-1 rounded text-xs transition-colors flex items-center space-x-1 ${
                  sortBy === key
                    ? 'bg-slate-900 text-white font-medium'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <span>{key.charAt(0).toUpperCase() + key.slice(1)}</span>
                {sortBy === key && (
                  <span className="text-[10px]">{sortOrder === 'desc' ? '↓' : '↑'}</span>
                )}
              </button>
            ))}
          </div>

          <div className="flex items-center space-x-3">
            {/* Column Visibility Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowColumnMenu(!showColumnMenu)}
                className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs transition-colors"
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
                <span>Columns</span>
              </button>

              {showColumnMenu && (
                <div className="absolute right-0 mt-1 w-48 bg-white border border-slate-200 rounded-lg shadow-lg z-20 p-2 space-y-1 text-xs">
                  <div className="text-[10px] font-mono text-slate-400 uppercase px-1 pb-1 border-b border-slate-100">
                    Visible Columns
                  </div>
                  {Object.entries(visibleColumns).map(([colKey, isVis]) => (
                    <label key={colKey} className="flex items-center space-x-2 px-1 py-0.5 hover:bg-slate-50 rounded cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isVis}
                        onChange={() => toggleColumn(colKey as any)}
                        className="rounded accent-slate-800"
                      />
                      <span className="capitalize">{colKey.replace(/([A-Z])/g, ' $1')}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            <span className="text-slate-500 font-mono text-xs">
              {filteredInteractions.length} records found
            </span>
          </div>
        </div>
      </div>

      {/* Main Table: Columns (Drug, Target, Gene, Disease, Interaction Type, Score, Confidence, Evidence) */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {paginatedItems.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <Database className="w-8 h-8 text-slate-300 mx-auto" />
            <h3 className="text-sm font-semibold text-slate-700">No interaction records found</h3>
            <p className="text-xs text-slate-400">Try adjusting your search criteria.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-mono uppercase tracking-wider border-b border-slate-200">
                <tr>
                  {visibleColumns.drug && <th className="py-3 px-4 font-semibold">Drug</th>}
                  {visibleColumns.target && <th className="py-3 px-4 font-semibold">Target</th>}
                  {visibleColumns.gene && <th className="py-3 px-4 font-semibold">Gene</th>}
                  {visibleColumns.disease && <th className="py-3 px-4 font-semibold">Disease</th>}
                  {visibleColumns.interactionType && <th className="py-3 px-4 font-semibold">Interaction Type</th>}
                  {visibleColumns.score && <th className="py-3 px-4 font-semibold">Score</th>}
                  {visibleColumns.confidence && <th className="py-3 px-4 font-semibold">Confidence</th>}
                  {visibleColumns.evidence && <th className="py-3 px-4 font-semibold max-w-[200px]">Evidence</th>}
                  <th className="py-3 px-4 text-right font-semibold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedItems.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                    {/* Drug */}
                    {visibleColumns.drug && (
                      <td className="py-3.5 px-4 font-medium text-slate-900">
                        <Link to={`/drugs/${item.drugId}`} className="hover:text-sky-600 transition-colors">
                          {item.drugName}
                        </Link>
                        <div className="text-[10px] text-slate-400 font-mono">{item.drugId}</div>
                      </td>
                    )}

                    {/* Target */}
                    {visibleColumns.target && (
                      <td className="py-3.5 px-4 font-mono font-medium text-slate-800">
                        <Link to={`/targets/${item.targetId}`} className="hover:text-teal-700 transition-colors">
                          {item.targetId}
                        </Link>
                      </td>
                    )}

                    {/* Gene */}
                    {visibleColumns.gene && (
                      <td className="py-3.5 px-4 font-mono font-bold text-teal-800">
                        {item.targetGene}
                      </td>
                    )}

                    {/* Disease */}
                    {visibleColumns.disease && (
                      <td className="py-3.5 px-4 text-slate-700">
                        {item.diseaseName}
                      </td>
                    )}

                    {/* Interaction Type */}
                    {visibleColumns.interactionType && (
                      <td className="py-3.5 px-4 text-slate-600">
                        <span className="inline-block px-2 py-0.5 rounded text-[10px] font-mono bg-slate-100">
                          {item.interactionType}
                        </span>
                      </td>
                    )}

                    {/* Score */}
                    {visibleColumns.score && (
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-800">
                        <span className="px-2 py-0.5 rounded bg-slate-100">
                          {item.score.toFixed(2)}
                        </span>
                      </td>
                    )}

                    {/* Confidence */}
                    {visibleColumns.confidence && (
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
                    )}

                    {/* Evidence */}
                    {visibleColumns.evidence && (
                      <td className="py-3.5 px-4 text-slate-600 max-w-[200px] truncate" title={item.evidenceSource}>
                        {item.evidenceSource}
                      </td>
                    )}

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

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-xs">
            <span className="text-slate-500 font-mono">
              Page {currentPage} of {totalPages}
            </span>
            <div className="flex items-center space-x-1.5">
              <button
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                className="px-2.5 py-1 rounded border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-50 transition-colors flex items-center space-x-1"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Prev</span>
              </button>
              {Array.from({ length: totalPages }).map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentPage(idx + 1)}
                  className={`w-7 h-7 rounded text-xs font-mono font-medium transition-colors ${
                    currentPage === idx + 1
                      ? 'bg-slate-900 text-white'
                      : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {idx + 1}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-2.5 py-1 rounded border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-50 transition-colors flex items-center space-x-1"
              >
                <span>Next</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
