import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  GitBranch,
  Search,
  Crosshair,
  Pill,
  HeartPulse,
  ChevronRight,
  Sparkles,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { PATHWAYS, TARGETS, DRUGS, DISEASES } from '../data/dataset';

export const PathwayExplorerPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  const categories = Array.from(new Set(PATHWAYS.map((p) => p.category)));

  const filteredPathways = PATHWAYS.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.biologicalFunction.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = selectedCategory === 'ALL' || p.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* 1. Header */}
      <div className="border-b border-slate-200 pb-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2.5">
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                Pathway Explorer
              </h1>
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-violet-50 text-violet-700 border border-violet-200">
                Biological Systems
              </span>
            </div>
            <p className="text-sm text-slate-500 mt-1">
              Connect drug–target interactions with intracellular signaling networks, cell-cycle cascades, and disease mechanisms.
            </p>
          </div>

          <Link
            to="/analysis/network"
            className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-lg bg-violet-700 hover:bg-violet-800 text-white font-medium text-xs shadow-sm shadow-violet-500/20 transition-all self-start sm:self-auto"
          >
            <GitBranch className="w-4 h-4 text-violet-200" />
            <span>Open Network Explorer</span>
          </Link>
        </div>
      </div>

      {/* 2. Search & Category Filters */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search pathway or biological process (e.g. BCR-ABL1, EGFR cascade, apoptosis)..."
              className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-10 pr-4 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all"
            />
          </div>

          <div className="sm:w-64">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-xs text-slate-700 focus:outline-none focus:bg-white focus:border-violet-500 font-sans"
            >
              <option value="ALL">All Biological Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500 font-mono pt-1 border-t border-slate-100">
          <span>{filteredPathways.length} canonical pathways active</span>
          <span>Paradigm: Target &rarr; Pathway &rarr; Disease</span>
        </div>
      </div>

      {/* 3. Pathway Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredPathways.map((pathway) => (
          <div
            key={pathway.id}
            className="bg-white rounded-xl border border-slate-200 shadow-sm hover:border-violet-400 hover:shadow-md transition-all p-6 flex flex-col justify-between space-y-5"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-violet-50 text-violet-700 border border-violet-200">
                    {pathway.id} &bull; {pathway.category}
                  </span>
                  <h3 className="text-base font-bold text-slate-900">
                    {pathway.name}
                  </h3>
                </div>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                {pathway.description}
              </p>

              <div className="bg-slate-50 rounded-lg p-3 border border-slate-100 space-y-1.5 text-xs">
                <span className="font-bold text-slate-800 text-[11px] block font-mono">Biological Function:</span>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  {pathway.biologicalFunction}
                </p>
              </div>

              {/* Connected Biological Entities (Clickable badges) */}
              <div className="space-y-2 pt-2">
                {/* Associated Targets */}
                <div className="flex items-center space-x-1.5 text-xs">
                  <Crosshair className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                  <span className="text-[11px] font-mono text-slate-400">Targets:</span>
                  <div className="flex flex-wrap gap-1">
                    {pathway.targetIds.map((tId) => (
                      <Link
                        key={tId}
                        to={`/targets/${tId}`}
                        className="px-2 py-0.5 rounded bg-teal-50 hover:bg-teal-100 text-teal-800 text-[10px] font-mono font-semibold transition-colors"
                      >
                        {tId}
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Associated Drugs */}
                <div className="flex items-center space-x-1.5 text-xs">
                  <Pill className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span className="text-[11px] font-mono text-slate-400">Targeting Drugs:</span>
                  <div className="flex flex-wrap gap-1">
                    {pathway.drugIds.map((dId) => {
                      const drug = DRUGS.find((d) => d.id === dId);
                      return (
                        <Link
                          key={dId}
                          to={`/drugs/${dId}`}
                          className="px-2 py-0.5 rounded bg-blue-50 hover:bg-blue-100 text-blue-800 text-[10px] font-semibold transition-colors"
                        >
                          {drug ? drug.name : dId}
                        </Link>
                      );
                    })}
                  </div>
                </div>

                {/* Associated Diseases */}
                <div className="flex items-center space-x-1.5 text-xs">
                  <HeartPulse className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                  <span className="text-[11px] font-mono text-slate-400">Diseases:</span>
                  <div className="flex flex-wrap gap-1">
                    {pathway.diseaseIds.map((disId) => {
                      const disease = DISEASES.find((d) => d.id === disId);
                      return (
                        <Link
                          key={disId}
                          to={`/diseases/${disId}`}
                          className="px-2 py-0.5 rounded bg-rose-50 hover:bg-rose-100 text-rose-800 text-[10px] font-medium transition-colors"
                        >
                          {disease ? disease.name : disId}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[10px] font-mono text-slate-400">
                Cell Location: {pathway.cellularLocation}
              </span>

              <Link
                to={`/pathways/${pathway.id}`}
                className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-violet-50 hover:bg-violet-100 text-violet-800 text-xs font-semibold transition-colors"
              >
                <span>Explore Pathway</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
