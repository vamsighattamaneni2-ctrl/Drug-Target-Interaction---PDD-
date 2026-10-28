import React, { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  CartesianGrid,
} from 'recharts';
import {
  Activity,
  ChartNoAxesCombined,
  Crosshair,
  Dna,
  HeartPulse,
  Pill,
} from 'lucide-react';
import { DRUGS, TARGETS, DISEASES, INTERACTIONS } from '../data/dataset';

export const AnalyticsPage: React.FC = () => {
  const [confidenceFilter, setConfidenceFilter] = useState<'ALL' | 'High' | 'Medium' | 'Low'>('ALL');

  // Filtered interactions
  const filteredInteractions = INTERACTIONS.filter((i) =>
    confidenceFilter === 'ALL' ? true : i.confidence === confidenceFilter
  );

  // SECTION 1: Interaction Statistics Data
  const confidenceData = [
    { level: 'High Confidence (≥0.80)', count: INTERACTIONS.filter((i) => i.confidence === 'High').length, fill: '#059669' },
    { level: 'Medium Confidence (0.60–0.79)', count: INTERACTIONS.filter((i) => i.confidence === 'Medium').length, fill: '#0284C7' },
    { level: 'Low / Screening (<0.60)', count: INTERACTIONS.filter((i) => i.confidence === 'Low').length, fill: '#94A3B8' },
  ];

  // SECTION 2: Drug Statistics Data
  const drugClassCounts = DRUGS.reduce<Record<string, number>>((acc, d) => {
    const raw = d.therapeuticClass.split('/')[1]?.trim() || d.therapeuticClass;
    acc[raw] = (acc[raw] || 0) + 1;
    return acc;
  }, {});
  const drugClassData = Object.entries(drugClassCounts).map(([name, count]) => ({
    name,
    count,
  }));

  // SECTION 3: Target Statistics Data
  const targetClassCounts = TARGETS.reduce<Record<string, number>>((acc, t) => {
    acc[t.targetClass] = (acc[t.targetClass] || 0) + 1;
    return acc;
  }, {});
  const targetClassData = Object.entries(targetClassCounts).map(([name, count]) => ({
    name: name.length > 20 ? name.slice(0, 18) + '...' : name,
    fullName: name,
    count,
  }));

  // SECTION 4: Disease Associations Data
  const diseaseAssociationData = DISEASES.map((dis) => ({
    name: dis.name.length > 18 ? dis.name.slice(0, 16) + '...' : dis.name,
    fullName: dis.name,
    targets: dis.targetIds.length,
    drugs: dis.drugIds.length,
  }));

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto">
      {/* 23. Analytics Header */}
      <div className="border-b border-slate-200 pb-5">
        <div className="flex items-center space-x-2.5">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Research Analytics
          </h1>
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-slate-100 text-slate-600 border border-slate-200">
            Statistical Breakdown
          </span>
        </div>
        <p className="text-sm text-slate-500 mt-1">
          Quantitative distributions of compound chemotypes, molecular targets, interaction affinities, and disease associations.
        </p>
      </div>

      {/* SECTION 1: Interaction Statistics */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-700 flex items-center justify-center">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">1. Interaction Statistics</h2>
              <p className="text-xs text-slate-500">Stratification of pairwise interaction metrics and confidence levels</p>
            </div>
          </div>
          <div className="flex items-center space-x-2 text-xs">
            <span className="text-slate-500 font-mono">Filter Confidence:</span>
            <select
              value={confidenceFilter}
              onChange={(e) => setConfidenceFilter(e.target.value as any)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-slate-800 focus:outline-none focus:bg-white focus:border-indigo-500"
            >
              <option value="ALL">All Levels</option>
              <option value="High">High (≥0.80)</option>
              <option value="Medium">Medium (0.60–0.79)</option>
              <option value="Low">Low (&lt;0.60)</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
          {/* Chart: Confidence Distribution */}
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={confidenceData} layout="vertical" margin={{ top: 10, right: 20, left: 20, bottom: 10 }}>
                <CartesianGrid strokeDasharray="2 2" stroke="#F1F5F9" horizontal={false} />
                <XAxis type="number" stroke="#94A3B8" fontSize={11} allowDecimals={false} />
                <YAxis dataKey="level" type="category" stroke="#94A3B8" fontSize={11} width={150} />
                <Tooltip
                  formatter={(val: any) => [`${val} interactions`, 'Count']}
                  contentStyle={{ backgroundColor: '#0F172A', borderRadius: '8px', color: '#FFF', fontSize: '12px' }}
                />
                <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                  {confidenceData.map((entry, idx) => (
                    <Cell key={`c-${idx}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Table: Interaction Sample */}
          <div className="overflow-x-auto border border-slate-200 rounded-lg">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-mono uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Pair (Drug &times; Target)</th>
                  <th className="py-2.5 px-3">Score</th>
                  <th className="py-2.5 px-3">Affinity Kd</th>
                  <th className="py-2.5 px-3">Confidence</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredInteractions.slice(0, 4).map((i) => (
                  <tr key={i.id} className="hover:bg-slate-50/70">
                    <td className="py-2 px-3 font-medium text-slate-900">
                      {i.drugName} &bull; <span className="text-teal-800">{i.targetGene}</span>
                    </td>
                    <td className="py-2 px-3 font-mono font-bold text-slate-800">{i.score.toFixed(2)}</td>
                    <td className="py-2 px-3 font-mono text-slate-600">{i.affinityKdNm.toFixed(1)} nM</td>
                    <td className="py-2 px-3 font-mono text-[10px]">{i.confidence}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* SECTION 2: Drug Statistics */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-5">
        <div className="flex items-center space-x-2.5 pb-4 border-b border-slate-100">
          <div className="w-8 h-8 rounded-lg bg-sky-50 border border-sky-100 text-sky-700 flex items-center justify-center">
            <Pill className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">2. Drug Statistics</h2>
            <p className="text-xs text-slate-500">Distribution of small molecules and biologics across therapeutic classes</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
          {/* Chart */}
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={drugClassData} margin={{ top: 10, right: 15, left: -20, bottom: 25 }}>
                <CartesianGrid strokeDasharray="2 2" stroke="#F1F5F9" vertical={false} />
                <XAxis dataKey="name" stroke="#94A3B8" fontSize={10} interval={0} angle={-15} textAnchor="end" />
                <YAxis stroke="#94A3B8" fontSize={11} allowDecimals={false} />
                <Tooltip
                  formatter={(val: any) => [`${val} compounds`, 'Count']}
                  contentStyle={{ backgroundColor: '#0F172A', borderRadius: '8px', color: '#FFF', fontSize: '12px' }}
                />
                <Bar dataKey="count" fill="#0284C7" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Table */}
          <div className="overflow-x-auto border border-slate-200 rounded-lg">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-mono uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Compound</th>
                  <th className="py-2.5 px-3">Type</th>
                  <th className="py-2.5 px-3">Mol. Weight</th>
                  <th className="py-2.5 px-3">Targets Mapped</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {DRUGS.slice(0, 4).map((d) => (
                  <tr key={d.id} className="hover:bg-slate-50/70">
                    <td className="py-2 px-3 font-medium text-slate-900">{d.name}</td>
                    <td className="py-2 px-3 text-slate-600">{d.type}</td>
                    <td className="py-2 px-3 font-mono text-slate-700">{d.molecularWeight} g/mol</td>
                    <td className="py-2 px-3 font-mono font-bold text-teal-800">{d.targetIds.length}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* SECTION 3: Target Statistics */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-5">
        <div className="flex items-center space-x-2.5 pb-4 border-b border-slate-100">
          <div className="w-8 h-8 rounded-lg bg-teal-50 border border-teal-100 text-teal-700 flex items-center justify-center">
            <Crosshair className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">3. Target Statistics</h2>
            <p className="text-xs text-slate-500">Functional taxonomy and inhibitor density across therapeutic targets</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
          {/* Chart */}
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={targetClassData} margin={{ top: 10, right: 15, left: -20, bottom: 25 }}>
                <CartesianGrid strokeDasharray="2 2" stroke="#F1F5F9" vertical={false} />
                <XAxis dataKey="name" stroke="#94A3B8" fontSize={10} interval={0} angle={-15} textAnchor="end" />
                <YAxis stroke="#94A3B8" fontSize={11} allowDecimals={false} />
                <Tooltip
                  formatter={(val: any, _name: any, item: any) => [`${val} targets`, item.payload.fullName]}
                  contentStyle={{ backgroundColor: '#0F172A', borderRadius: '8px', color: '#FFF', fontSize: '12px' }}
                />
                <Bar dataKey="count" fill="#0D9488" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Table */}
          <div className="overflow-x-auto border border-slate-200 rounded-lg">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-mono uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Gene Symbol</th>
                  <th className="py-2.5 px-3">Class</th>
                  <th className="py-2.5 px-3">UniProt</th>
                  <th className="py-2.5 px-3">Drugs Bound</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {TARGETS.slice(0, 4).map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/70">
                    <td className="py-2 px-3 font-mono font-bold text-teal-800">{t.geneSymbol}</td>
                    <td className="py-2 px-3 text-slate-600 truncate max-w-[150px]">{t.targetClass}</td>
                    <td className="py-2 px-3 font-mono text-slate-500">{t.uniprotId}</td>
                    <td className="py-2 px-3 font-mono font-bold text-slate-800">{t.drugIds.length}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* SECTION 4: Disease Associations */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-5">
        <div className="flex items-center space-x-2.5 pb-4 border-b border-slate-100">
          <div className="w-8 h-8 rounded-lg bg-rose-50 border border-rose-100 text-rose-700 flex items-center justify-center">
            <HeartPulse className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">4. Disease Associations</h2>
            <p className="text-xs text-slate-500">Mapping of validated therapeutic targets and approved agents across diseases</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
          {/* Chart */}
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={diseaseAssociationData} margin={{ top: 10, right: 15, left: -20, bottom: 25 }}>
                <CartesianGrid strokeDasharray="2 2" stroke="#F1F5F9" vertical={false} />
                <XAxis dataKey="name" stroke="#94A3B8" fontSize={10} interval={0} angle={-15} textAnchor="end" />
                <YAxis stroke="#94A3B8" fontSize={11} allowDecimals={false} />
                <Tooltip
                  formatter={(val: any, name: any, item: any) => [
                    `${val} ${name}`,
                    item.payload.fullName,
                  ]}
                  contentStyle={{ backgroundColor: '#0F172A', borderRadius: '8px', color: '#FFF', fontSize: '12px' }}
                />
                <Bar dataKey="targets" fill="#475569" radius={[4, 4, 0, 0]} name="Targets" />
                <Bar dataKey="drugs" fill="#0284C7" radius={[4, 4, 0, 0]} name="Drugs" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Table */}
          <div className="overflow-x-auto border border-slate-200 rounded-lg">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-mono uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Disease Indication</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3">Targets</th>
                  <th className="py-2.5 px-3">Drugs</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {DISEASES.slice(0, 4).map((d) => (
                  <tr key={d.id} className="hover:bg-slate-50/70">
                    <td className="py-2 px-3 font-medium text-slate-900">{d.name}</td>
                    <td className="py-2 px-3 text-slate-500">{d.category}</td>
                    <td className="py-2 px-3 font-mono font-bold text-teal-800">{d.targetIds.length}</td>
                    <td className="py-2 px-3 font-mono font-bold text-slate-800">{d.drugIds.length}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
