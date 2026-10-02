import React, { useState, useEffect } from 'react';
import {
  Brain,
  Plus,
  Search,
  Pin,
  Trash2,
  Tag,
  Sparkles,
  Filter,
  CheckCircle2,
  Calendar
} from 'lucide-react';
import { api } from '../api/client';
import { Memory } from '../types';

interface MemoryPageProps {
  onOpenQuickAdd: (type: 'memory') => void;
}

export const MemoryPage: React.FC<MemoryPageProps> = ({ onOpenQuickAdd }) => {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('');
  const [isSearching, setIsSearching] = useState(false);

  const fetchMemories = async () => {
    try {
      setLoading(true);
      if (searchQuery.trim()) {
        const results = await api.searchMemories(searchQuery.trim(), selectedType || undefined);
        setMemories(results);
        setIsSearching(true);
      } else {
        const data = await api.getMemories({
          memory_type: selectedType || undefined,
          pinned_first: true,
        });
        setMemories(data);
        setIsSearching(false);
      }
    } catch (err) {
      console.error('Failed to load memories:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const debounce = setTimeout(() => {
      fetchMemories();
    }, 200);
    return () => clearTimeout(debounce);
  }, [searchQuery, selectedType]);

  const handleTogglePin = async (mem: Memory) => {
    try {
      await api.updateMemory(mem.id, { is_pinned: !mem.is_pinned });
      fetchMemories();
    } catch (err) {
      console.error('Failed to toggle pin:', err);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await api.deleteMemory(id);
      fetchMemories();
    } catch (err) {
      console.error('Failed to delete memory:', err);
    }
  };

  const categories = [
    'All',
    'Academic',
    'Commitment',
    'People',
    'Deadline',
    'Preference',
    'Project',
    'Personal'
  ];

  return (
    <div className="p-4 sm:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">My Memory</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Your private memory vault. Tell PalMind natural things; it remembers and retrieves them with vector similarity.
          </p>
        </div>
        <button
          onClick={() => onOpenQuickAdd('memory')}
          className="btn-coral self-start sm:self-center flex items-center gap-1.5 px-5 py-2 text-xs font-bold active:scale-95 shadow-lg"
        >
          <Plus className="w-4 h-4" />
          <span>Record Memory</span>
        </button>
      </div>

      {/* Semantic Search Box */}
      <div className="glass-panel p-4 rounded-3xl border-coral-500/25 shadow-xl">
        <div className="relative">
          <Search className="w-4 h-4 text-coral-400 absolute left-4 top-3" />
          <input
            type="text"
            placeholder='Semantic search: "What did professor say about the exam?" or "What did I promise Rahul?"'
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 bg-white/[0.04] border border-white/10 rounded-2xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-coral-500/60 focus:bg-white/[0.06] transition"
          />
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {categories.map((cat) => {
          const active = (cat === 'All' && !selectedType) || selectedType === cat;
          return (
            <button
              key={cat}
              onClick={() => setSelectedType(cat === 'All' ? '' : cat)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition ${
                active
                  ? 'bg-gradient-to-r from-coral-500 to-[#ff3b14] text-white font-bold shadow-[0_0_12px_rgba(255,87,34,0.35)]'
                  : 'bg-white/[0.03] text-slate-400 hover:text-white border border-white/5'
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Memory Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-pulse">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-32 bg-white/5 rounded-3xl" />
          ))}
        </div>
      ) : memories.length === 0 ? (
        <div className="glass-panel py-16 text-center rounded-3xl space-y-3">
          <Brain className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-sm font-bold text-white">No memories found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            {searchQuery
              ? `No semantic matches found for "${searchQuery}". Try different phrasing.`
              : 'Add your first memory note using the button above.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 perspective-1000">
          {memories.map((mem) => {
            const isPromise = mem.memory_type === 'Commitment' || mem.content.toLowerCase().includes('promise');

            return (
              <div
                key={mem.id}
                className={`glass-card card-3d-tilt p-5 rounded-3xl flex flex-col justify-between space-y-4 relative ${
                  mem.is_pinned
                    ? 'border-coral-500/40 bg-coral-950/15'
                    : isPromise
                    ? 'border-amber-500/30'
                    : ''
                }`}
              >
                {/* Top: Category Tag & Pin & Similarity */}
                <div className="flex items-center justify-between">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                    isPromise
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : mem.memory_type === 'Academic'
                      ? 'bg-coral-500/20 text-coral-300 border border-coral-500/30'
                      : 'bg-white/5 text-slate-300 border border-white/10'
                  }`}>
                    {mem.memory_type}
                  </span>

                  <div className="flex items-center gap-1.5">
                    {mem.similarity !== undefined && (
                      <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-coral-500/10 border border-coral-500/30 text-coral-400 text-[10px] font-bold">
                        <Sparkles className="w-2.5 h-2.5" />
                        <span>{Math.round(mem.similarity * 100)}% match</span>
                      </span>
                    )}
                    <button
                      onClick={() => handleTogglePin(mem)}
                      className={`p-1.5 rounded-lg transition ${
                        mem.is_pinned
                          ? 'text-coral-400 bg-coral-500/20 shadow-[0_0_8px_#ff5722]'
                          : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
                      }`}
                      title={mem.is_pinned ? 'Unpin' : 'Pin to top'}
                    >
                      <Pin className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(mem.id)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition"
                      title="Delete memory"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Content */}
                <p className="text-xs sm:text-sm text-slate-100 font-medium leading-relaxed">
                  "{mem.content}"
                </p>

                {/* Footer Metadata */}
                <div className="flex items-center justify-between pt-2 border-t border-white/5 text-[10px] text-slate-500">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    <span>{new Date(mem.created_at).toLocaleDateString()}</span>
                  </span>
                  <span>Importance {mem.importance}/5</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
