import React, { useState, useEffect } from 'react';
import {
  Search,
  CheckSquare,
  Brain,
  FileText,
  Calendar,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { api } from '../api/client';
import { SearchResultItem } from '../types';

interface SearchPageProps {
  onNavigate: (tab: string) => void;
}

export const SearchPage: React.FC<SearchPageProps> = ({ onNavigate }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setSearched(false);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await api.search(query.trim());
        setResults(res.results || []);
        setSearched(true);
      } catch (err) {
        console.error('Failed to search:', err);
      } finally {
        setLoading(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  return (
    <div className="p-4 sm:p-8 space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Global Search
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Search across tasks, memories, documents, and notes in one unified view.
        </p>
      </div>

      {/* Big Search Input */}
      <div className="glass-panel p-4 rounded-3xl border-coral-500/20 shadow-xl">
        <div className="relative">
          <Search className="w-5 h-5 text-coral-400 absolute left-4 top-3.5" />
          <input
            type="text"
            placeholder='Type: "Computer Networks", "Rahul", "Hamming Code", "Exam"...'
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            className="w-full pl-12 pr-4 py-3 bg-white/[0.04] border border-white/10 rounded-2xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-coral-500/60 focus:bg-white/[0.06] transition"
          />
        </div>
      </div>

      {/* Results */}
      {loading ? (
        <div className="space-y-3 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-white/5 rounded-2xl" />
          ))}
        </div>
      ) : searched && results.length === 0 ? (
        <div className="glass-panel py-16 text-center rounded-3xl space-y-2">
          <Search className="w-10 h-10 text-slate-600 mx-auto mb-2" />
          <p className="text-sm font-bold text-white">No results found for "{query}"</p>
          <p className="text-xs text-slate-500">Check spelling or try a broader term.</p>
        </div>
      ) : results.length > 0 ? (
        <div className="space-y-3 perspective-1000">
          <p className="text-xs font-semibold text-slate-400 px-1">
            Found {results.length} item{results.length > 1 ? 's' : ''}:
          </p>
          {results.map((item) => (
            <div
              key={`${item.type}-${item.id}`}
              onClick={() => {
                if (item.type === 'task') onNavigate('tasks');
                else if (item.type === 'memory') onNavigate('memory');
                else if (item.type === 'document') onNavigate('documents');
              }}
              className="glass-card card-3d-tilt p-4 rounded-2xl flex items-center justify-between gap-4 cursor-pointer hover:border-coral-500/40 transition group"
            >
              <div className="flex items-start gap-3.5 min-w-0">
                <div className="p-2 rounded-xl bg-white/5 text-coral-400 shrink-0 mt-0.5">
                  {item.type === 'task' ? <CheckSquare className="w-4 h-4 text-coral-400" /> :
                   item.type === 'memory' ? <Brain className="w-4 h-4 text-emerald-400" /> :
                   <FileText className="w-4 h-4 text-amber-400" />}
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white group-hover:text-coral-400 transition truncate">
                      {item.title}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-white/5 text-slate-400 uppercase">
                      {item.type}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                    {item.snippet}
                  </p>
                </div>
              </div>

              <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-coral-400 group-hover:translate-x-1 transition shrink-0" />
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
};
