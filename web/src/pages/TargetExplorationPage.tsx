import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Dna, ExternalLink, RefreshCw, Search } from 'lucide-react';
import { fetchTargets, type TargetInfo } from '../services/api';

export const TargetExplorationPage: React.FC = () => {
  const [targets, setTargets] = useState<TargetInfo[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedType, setSelectedType] = useState<string>('ALL');

  const loadTargets = () => {
    setLoading(true);
    fetchTargets()
      .then((data) => {
        setTargets(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load targets:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadTargets();
  }, []);

  const filteredTargets = targets.filter((t) => {
    const matchesSearch =
      t.target_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (t.gene_symbol && t.gene_symbol.toLowerCase().includes(searchTerm.toLowerCase())) ||
      t.target_id.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = selectedType === 'ALL' || t.target_type === selectedType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="min-h-screen bg-[#070B14] text-slate-100 py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <Link
          to="/"
          className="inline-flex items-center space-x-1.5 text-xs font-mono text-cyan-400 hover:text-cyan-300 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Discovery Overview</span>
        </Link>
        <button
          onClick={loadTargets}
          className="p-2 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white transition-colors"
          title="Reload targets catalog"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="space-y-2 mb-8">
        <div className="inline-flex items-center space-x-2 text-xs font-mono text-cyan-400">
          <Dna className="w-4 h-4" />
          <span>TARGET DISCOVERY MODULE</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white">Therapeutic Target Exploration</h1>
        <p className="text-sm text-slate-400 max-w-2xl">
          Curated therapeutic targets with cross-referenced UniProt accessions, ChEMBL target identifiers, and biological domain taxonomy.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-panel p-4 rounded-xl border border-slate-800 mb-6 flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search gene symbol, target name, or ID..."
            className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <span className="text-xs text-slate-400 font-mono">Classification:</span>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
          >
            <option value="ALL">All Types</option>
            <option value="Receptor tyrosine kinase">Receptor tyrosine kinase</option>
            <option value="Non-receptor tyrosine kinase">Non-receptor tyrosine kinase</option>
            <option value="Serine/threonine kinase">Serine/threonine kinase</option>
          </select>
        </div>
      </div>

      {/* Targets Table */}
      <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/90 text-slate-400 font-mono uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Gene Symbol</th>
                <th className="py-3 px-4">Target Name</th>
                <th className="py-3 px-4">Classification</th>
                <th className="py-3 px-4">Organism</th>
                <th className="py-3 px-4">Accessions</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-cyan-400" />
                    Fetching targets from FastAPI backend...
                  </td>
                </tr>
              ) : filteredTargets.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    No matching therapeutic targets found.
                  </td>
                </tr>
              ) : (
                filteredTargets.map((t) => (
                  <tr key={t.target_id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-cyan-300">{t.gene_symbol || 'N/A'}</td>
                    <td className="py-3.5 px-4 text-slate-200 font-sans font-medium">{t.target_name}</td>
                    <td className="py-3.5 px-4 text-slate-400">{t.target_type}</td>
                    <td className="py-3.5 px-4 text-slate-400 italic font-sans">{t.organism}</td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center space-x-2">
                        {t.uniprot_id && (
                          <a
                            href={`https://www.uniprot.org/uniprotkb/${t.uniprot_id}`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center space-x-1 px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-500/20"
                          >
                            <span>{t.uniprot_id}</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        )}
                        <span className="text-slate-500">ID: {t.target_id}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Link
                        to="/"
                        className="inline-flex items-center space-x-1 px-2.5 py-1 rounded bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 hover:bg-cyan-500/25 transition-colors"
                      >
                        <span>Simulate</span>
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
