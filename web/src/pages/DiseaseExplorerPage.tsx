import React, { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowRight,
  Crosshair,
  Dna,
  HeartPulse,
  LayoutGrid,
  List,
  Pill,
  Search,
  Share2,
  Sparkles,
} from 'lucide-react';
import { DISEASES, TARGETS, DRUGS, INTERACTIONS, REPURPOSING_CANDIDATES } from '../data/dataset';

export const DiseaseExplorerPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  const filteredDiseases = DISEASES.filter((d) => {
    const matchesSearch =
      d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'ALL' || d.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="border-b border-slate-200 pb-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2.5">
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                Disease Explorer
              </h1>
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-rose-50 text-rose-700 border border-rose-200">
                Nosology & Indications
              </span>
            </div>
            <p className="text-sm text-slate-500 mt-1">
              Start the discovery process from the disease side: explore therapeutic areas, pathogenic kinase dependencies, and mapped drugs.
            </p>
          </div>

          <Link
            to="/discovery/repurposing"
            className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-lg bg-[#1E3A8A] hover:bg-[#1B365D] text-white font-medium text-xs shadow-sm transition-all self-start sm:self-auto"
          >
            <Sparkles className="w-4 h-4 text-cyan-300" />
            <span>Investigate Repurposing</span>
          </Link>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center justify-between mt-5">
          <span className="text-xs font-mono text-slate-500">
            {filteredDiseases.length} disease indications
          </span>
          <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs">
            <button
              onClick={() => setViewMode('cards')}
              className={`flex items-center space-x-1.5 px-3 py-1 rounded-md font-medium transition-colors ${
                viewMode === 'cards'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5 text-blue-700" />
              <span>Cards</span>
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`flex items-center space-x-1.5 px-3 py-1 rounded-md font-medium transition-colors ${
                viewMode === 'table'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <List className="w-3.5 h-3.5 text-blue-700" />
              <span>Table</span>
            </button>
          </div>
        </div>
      </div>

      {/* Search & Category Filter */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search disease, cancer type or disease category..."
            className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-10 pr-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <span className="text-xs text-slate-500 font-mono">Category:</span>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 focus:outline-none focus:bg-white focus:border-blue-600"
          >
            <option value="ALL">All Categories</option>
            <option value="Hematologic Malignancy">Hematologic Malignancy</option>
            <option value="Solid Tumor Oncology">Solid Tumor Oncology</option>
            <option value="Autoimmune & Inflammatory">Autoimmune & Inflammatory</option>
          </select>
        </div>
      </div>

      {/* Results Presentation */}
      {filteredDiseases.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center space-y-2">
          <HeartPulse className="w-8 h-8 text-slate-300 mx-auto" />
          <h3 className="text-sm font-semibold text-slate-700">No disease indications found</h3>
          <p className="text-xs text-slate-400">Try adjusting your search criteria or category filter.</p>
        </div>
      ) : viewMode === 'cards' ? (
        /* PROFESSIONAL SCIENTIFIC CARDS (DEFAULT) */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredDiseases.map((dis) => {
            const targetList = TARGETS.filter((t) => dis.targetIds.includes(t.id));
            const drugList = DRUGS.filter((d) => dis.drugIds.includes(d.id));

            return (
              <div
                key={dis.id}
                className="bg-white rounded-xl border border-slate-200 hover:border-blue-400 shadow-sm hover:shadow-md transition-all p-5 flex flex-col justify-between"
              >
                <div>
                  {/* Top Badges */}
                  <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-100">
                    <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded bg-rose-50 text-rose-800 border border-rose-200">
                      {dis.id}
                    </span>
                    <span className="font-mono text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                      {dis.category}
                    </span>
                  </div>

                  {/* Disease Name */}
                  <div className="mt-3">
                    <h2 className="text-base font-bold text-slate-900 group-hover:text-blue-700">
                      {dis.name}
                    </h2>
                    <p className="text-xs text-slate-500 font-medium mt-1 line-clamp-2">
                      {dis.description}
                    </p>
                  </div>

                  {/* Therapeutic Area */}
                  <div className="mt-2.5">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">
                      Therapeutic Area
                    </span>
                    <p className="text-xs font-semibold text-rose-900 mt-0.5">
                      {dis.category}
                    </p>
                  </div>

                  {/* Associated Targets & Associated Drugs */}
                  <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-slate-100 font-mono text-xs">
                    <div className="p-2 rounded bg-slate-50 border border-slate-100">
                      <span className="text-[10px] text-slate-400 block">Associated Targets</span>
                      <span className="font-bold text-teal-800 text-sm">
                        {targetList.length} targets
                      </span>
                      <div className="text-[10px] text-teal-600 truncate mt-0.5">
                        {targetList.map((t) => t.geneSymbol).join(', ') || 'None'}
                      </div>
                    </div>

                    <div className="p-2 rounded bg-slate-50 border border-slate-100">
                      <span className="text-[10px] text-slate-400 block">Associated Drugs</span>
                      <span className="font-bold text-blue-800 text-sm">
                        {drugList.length} drugs
                      </span>
                      <div className="text-[10px] text-blue-600 truncate mt-0.5">
                        {drugList.map((d) => d.name).join(', ') || 'None'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Action Button: Explore Disease */}
                <div className="mt-4 pt-3 border-t border-slate-100">
                  <Link
                    to={`/diseases/${dis.id}`}
                    className="w-full inline-flex items-center justify-center space-x-1.5 py-2 px-3 rounded-lg bg-[#1E3A8A] hover:bg-[#1B365D] text-white font-medium text-xs shadow-sm transition-colors"
                  >
                    <span>Explore Disease</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* TABLE VIEW */
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-mono uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4 font-semibold">Disease Name</th>
                  <th className="py-3 px-4 font-semibold">Disease Category</th>
                  <th className="py-3 px-4 font-semibold">Associated Targets</th>
                  <th className="py-3 px-4 font-semibold">Associated Drugs</th>
                  <th className="py-3 px-4 text-right font-semibold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredDiseases.map((dis) => {
                  const targetList = TARGETS.filter((t) => dis.targetIds.includes(t.id));
                  const drugList = DRUGS.filter((d) => dis.drugIds.includes(d.id));

                  return (
                    <tr key={dis.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-slate-900">
                        <Link to={`/diseases/${dis.id}`} className="hover:text-blue-700">
                          {dis.name}
                        </Link>
                        <div className="text-[10px] text-slate-400 font-mono">{dis.id}</div>
                      </td>
                      <td className="py-3.5 px-4 font-medium text-slate-700">
                        {dis.category}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-medium text-teal-800">
                        {targetList.map((t) => t.geneSymbol).join(', ') || '—'}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-blue-900">
                        {drugList.map((d) => d.name).join(', ') || '—'}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <Link
                          to={`/diseases/${dis.id}`}
                          className="inline-flex items-center space-x-1 px-3 py-1 rounded bg-[#1E3A8A] hover:bg-[#1B365D] text-white font-medium text-xs transition-colors"
                        >
                          <span>Explore Disease</span>
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
