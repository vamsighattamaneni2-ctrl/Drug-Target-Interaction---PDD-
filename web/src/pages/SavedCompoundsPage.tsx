import React, { useState, useMemo } from 'react';
import {
  Bookmark,
  Plus,
  Trash2,
  FolderPlus,
  Folder,
  Edit3,
  Dna,
  ExternalLink,
  Sparkles,
  Search,
  Filter,
  Check,
  Tag,
  ArrowRight,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { appStateService } from '../services/appStateService';
import { SavedItem, Collection } from '../types';

export const SavedCompoundsPage: React.FC = () => {
  const navigate = useNavigate();
  const [savedItems, setSavedItems] = useState<SavedItem[]>(() => appStateService.getSavedItems());
  const [collections, setCollections] = useState<Collection[]>(() => appStateService.getCollections());

  const [activeTab, setActiveTab] = useState<'all' | 'compound' | 'target'>('all');
  const [selectedCollectionId, setSelectedCollectionId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreatingCollection, setIsCreatingCollection] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [editingNotesId, setEditingNotesId] = useState<string | null>(null);
  const [noteText, setNoteText] = useState('');

  const filteredItems = useMemo(() => {
    return savedItems.filter((item) => {
      if (activeTab !== 'all' && item.itemType !== activeTab) {
        return false;
      }
      if (selectedCollectionId !== 'all' && item.collectionId !== selectedCollectionId) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = item.name.toLowerCase().includes(q);
        const matchesSub = item.subtitle?.toLowerCase().includes(q);
        const matchesNotes = item.notes?.toLowerCase().includes(q);
        if (!matchesName && !matchesSub && !matchesNotes) {
          return false;
        }
      }
      return true;
    });
  }, [savedItems, activeTab, selectedCollectionId, searchQuery]);

  const handleRemoveItem = (id: string) => {
    appStateService.removeSavedItem(id);
    setSavedItems(appStateService.getSavedItems());
  };

  const handleCreateCollection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCollectionName.trim()) return;

    const newCol: Collection = {
      id: `col-${Date.now()}`,
      name: newCollectionName.trim(),
      description: 'Custom research collection',
      itemCount: 0,
      createdDate: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };

    appStateService.createCollection(newCol);
    setCollections(appStateService.getCollections());
    setNewCollectionName('');
    setIsCreatingCollection(false);
  };

  const handleSaveNotes = (id: string) => {
    appStateService.updateSavedItemNotes(id, noteText);
    setSavedItems(appStateService.getSavedItems());
    setEditingNotesId(null);
  };

  const handleStartAnalysis = (item: SavedItem) => {
    if (item.itemType === 'compound') {
      navigate(`/analysis/new?compound=${item.itemId}`);
    } else {
      navigate(`/analysis/new?target=${item.itemId}`);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-[#0284C7] uppercase tracking-wider mb-1">
            <Bookmark className="w-4 h-4" />
            <span>Research Workspace Repository</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Saved Compounds & Targets</h1>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            Organize high-priority small molecules, macromolecular targets, and custom annotations into structured
            therapeutic candidate collections.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setIsCreatingCollection(true)}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-lg bg-white border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-sm transition-all"
          >
            <FolderPlus className="w-4 h-4 text-slate-500" />
            <span>New Collection</span>
          </button>
          <Link
            to="/analysis/new"
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-lg bg-[#0284C7] hover:bg-[#0369A1] text-white text-xs font-semibold shadow-sm transition-all"
          >
            <Sparkles className="w-4 h-4" />
            <span>Start New Analysis</span>
          </Link>
        </div>
      </div>

      {/* New Collection Modal */}
      {isCreatingCollection && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateCollection}
            className="bg-white rounded-xl max-w-md w-full p-5 shadow-2xl border border-slate-200 space-y-4"
          >
            <div className="flex items-center space-x-2 text-[#0284C7]">
              <FolderPlus className="w-5 h-5" />
              <h3 className="text-sm font-bold text-slate-900">Create New Research Collection</h3>
            </div>
            <p className="text-xs text-slate-500">
              Create a custom cohort to group candidate molecules and priority targets (e.g., "EGFR Resistance Candidates", "Dual-Inhibitors").
            </p>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Collection Name</label>
              <input
                type="text"
                value={newCollectionName}
                onChange={(e) => setNewCollectionName(e.target.value)}
                placeholder="e.g. Tyrosine Kinase Oncology Leads"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:bg-white focus:border-[#0284C7]"
                autoFocus
              />
            </div>
            <div className="flex items-center justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setIsCreatingCollection(false)}
                className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!newCollectionName.trim()}
                className="px-3 py-1.5 rounded-lg bg-[#0284C7] hover:bg-[#0369A1] text-xs font-semibold text-white shadow-sm disabled:opacity-50"
              >
                Create Collection
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Main Grid: Collections Sidebar + Saved Items List */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left: Collections Manager (1 col) */}
        <div className="lg:col-span-1 space-y-3">
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">Collections</span>
              <span className="text-[11px] font-mono text-slate-400">{collections.length}</span>
            </div>

            <div className="space-y-1">
              <button
                onClick={() => setSelectedCollectionId('all')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                  selectedCollectionId === 'all'
                    ? 'bg-sky-50 text-[#0284C7] border border-sky-200'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Folder className="w-3.5 h-3.5" />
                  <span>All Items</span>
                </div>
                <span className="text-[11px] font-mono text-slate-400">{savedItems.length}</span>
              </button>

              {collections.map((col) => {
                const count = savedItems.filter((i) => i.collectionId === col.id).length;
                return (
                  <button
                    key={col.id}
                    onClick={() => setSelectedCollectionId(col.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                      selectedCollectionId === col.id
                        ? 'bg-sky-50 text-[#0284C7] border border-sky-200'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center space-x-2 truncate">
                      <Tag className="w-3.5 h-3.5 text-slate-400" />
                      <span className="truncate">{col.name}</span>
                    </div>
                    <span className="text-[11px] font-mono text-slate-400">{count}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right: Items Explorer (3 cols) */}
        <div className="lg:col-span-3 space-y-4">
          {/* Controls: Search & Tabs */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
            {/* Tabs */}
            <div className="flex items-center space-x-1 w-full sm:w-auto">
              <button
                onClick={() => setActiveTab('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'all'
                    ? 'bg-[#0284C7] text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                All ({savedItems.length})
              </button>
              <button
                onClick={() => setActiveTab('compound')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'compound'
                    ? 'bg-[#0284C7] text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Compounds ({savedItems.filter((i) => i.itemType === 'compound').length})
              </button>
              <button
                onClick={() => setActiveTab('target')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'target'
                    ? 'bg-[#0284C7] text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Targets ({savedItems.filter((i) => i.itemType === 'target').length})
              </button>
            </div>

            {/* Search */}
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter saved items or notes..."
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:bg-white focus:border-[#0284C7]"
              />
            </div>
          </div>

          {/* Cards List */}
          {filteredItems.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                <Bookmark className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-800">No Saved Items</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Bookmark molecules from the Compound Library or proteins from the Target Library to build your research dossier.
              </p>
              <div className="flex items-center justify-center space-x-3 pt-2">
                <Link
                  to="/compounds"
                  className="px-3 py-1.5 rounded-lg bg-sky-50 text-[#0284C7] border border-sky-200 text-xs font-semibold hover:bg-sky-100"
                >
                  Explore Compounds
                </Link>
                <Link
                  to="/targets"
                  className="px-3 py-1.5 rounded-lg bg-sky-50 text-[#0284C7] border border-sky-200 text-xs font-semibold hover:bg-sky-100"
                >
                  Explore Targets
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredItems.map((item) => {
                const isEditing = editingNotesId === item.id;
                return (
                  <div
                    key={item.id}
                    className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm hover:border-sky-300 transition-all space-y-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start space-x-3">
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                            item.itemType === 'compound'
                              ? 'bg-sky-50 text-[#0284C7]'
                              : 'bg-emerald-50 text-emerald-700'
                          }`}
                        >
                          {item.itemType === 'compound' ? <Sparkles className="w-4 h-4" /> : <Dna className="w-4 h-4" />}
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <h3 className="text-sm font-bold text-slate-900">{item.name}</h3>
                            <span
                              className={`text-[10px] font-mono px-2 py-0.5 rounded-full uppercase font-bold ${
                                item.itemType === 'compound'
                                  ? 'bg-sky-100 text-sky-800'
                                  : 'bg-emerald-100 text-emerald-800'
                              }`}
                            >
                              {item.itemType}
                            </span>
                          </div>
                          {item.subtitle && <p className="text-xs text-slate-500 mt-0.5">{item.subtitle}</p>}
                        </div>
                      </div>

                      {/* Top actions */}
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => handleStartAnalysis(item)}
                          className="inline-flex items-center space-x-1 px-2.5 py-1 rounded bg-[#0284C7] hover:bg-[#0369A1] text-white text-[11px] font-semibold transition-all shadow-sm"
                          title="Start analysis with this entity"
                        >
                          <span>Analyze</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => handleRemoveItem(item.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                          title="Remove from saved"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Notes block */}
                    <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs">
                      {isEditing ? (
                        <div className="space-y-2">
                          <textarea
                            value={noteText}
                            onChange={(e) => setNoteText(e.target.value)}
                            placeholder="Add scientific notes, assay hypotheses, or literature references..."
                            rows={3}
                            className="w-full p-2 text-xs bg-white border border-slate-300 rounded focus:outline-none focus:border-[#0284C7]"
                          />
                          <div className="flex justify-end space-x-2">
                            <button
                              onClick={() => setEditingNotesId(null)}
                              className="px-2.5 py-1 rounded border border-slate-300 text-[11px] font-semibold text-slate-600 hover:bg-slate-100"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => handleSaveNotes(item.id)}
                              className="px-2.5 py-1 rounded bg-[#0284C7] text-white text-[11px] font-semibold hover:bg-[#0369A1]"
                            >
                              Save Notes
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-start justify-between">
                          <div className="text-slate-600 leading-relaxed">
                            {item.notes ? (
                              <p className="italic">"{item.notes}"</p>
                            ) : (
                              <span className="text-slate-400 italic">No research notes recorded yet.</span>
                            )}
                          </div>
                          <button
                            onClick={() => {
                              setEditingNotesId(item.id);
                              setNoteText(item.notes || '');
                            }}
                            className="text-slate-400 hover:text-[#0284C7] p-1 flex-shrink-0 ml-2"
                            title="Edit notes"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Metadata Footer */}
                    <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-100">
                      <span>Saved: {(item.savedAt || item.dateSaved || '').split('T')[0]}</span>
                      {item.collectionId && (
                        <span className="inline-flex items-center space-x-1 text-slate-500 font-medium">
                          <Tag className="w-3 h-3 text-[#0284C7]" />
                          <span>{collections.find((c) => c.id === item.collectionId)?.name || 'Custom'}</span>
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
