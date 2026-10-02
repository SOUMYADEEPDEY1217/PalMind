import React, { useState, useEffect } from 'react';
import {
  Search,
  CheckSquare,
  Brain,
  FileText,
  Timer,
  ShieldCheck,
  Settings,
  Sparkles,
  ArrowRight,
  X,
  LogIn
} from 'lucide-react';
import { api } from '../api/client';
import { SearchResultItem } from '../types';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (tab: string) => void;
  onOpenQuickAdd: (type: 'task' | 'memory' | 'document' | 'reminder') => void;
  onOpenAuthModal?: (mode?: 'signin' | 'signup') => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onNavigate,
  onOpenQuickAdd,
  onOpenAuthModal,
}) => {
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResultItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else onClose(); // parent toggles
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await api.search(query);
        setSearchResults(res.results || []);
      } catch (err) {
        console.error('Search error in command palette:', err);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  const defaultActions = [
    { label: 'Add Task (Natural Language)', icon: CheckSquare, action: () => onOpenQuickAdd('task') },
    { label: 'Store New Memory', icon: Brain, action: () => onOpenQuickAdd('memory') },
    { label: 'Upload Notes or PDF', icon: FileText, action: () => onOpenQuickAdd('document') },
    { label: 'Start 25-min Study Session', icon: Timer, action: () => onNavigate('study') },
    { label: 'Ask PalMind AI', icon: Sparkles, action: () => onNavigate('chat') },
    { label: 'Sign In / Switch Account (Google or Gmail)', icon: LogIn, action: () => onOpenAuthModal && onOpenAuthModal('signin') },
    { label: 'View Privacy Center', icon: ShieldCheck, action: () => onNavigate('privacy') },
    { label: 'Configure Settings & AI', icon: Settings, action: () => onNavigate('settings') },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-150">
      <div
        className="w-full max-w-2xl bg-[#080d16] border border-white/10 rounded-3xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-5 py-4 border-b border-white/10 gap-3">
          <Search className="w-5 h-5 text-coral-400 shrink-0" />
          <input
            type="text"
            placeholder="Type a command or search anything..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            className="flex-1 bg-transparent text-sm text-white placeholder-slate-400 outline-none"
          />
          {query && (
            <button onClick={() => setQuery('')} className="p-1 rounded-md text-slate-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="px-2 py-0.5 text-[10px] font-mono text-slate-400 bg-white/5 border border-white/10 rounded-md">
            ESC
          </kbd>
        </div>

        {/* Results / Commands List */}
        <div className="max-h-96 overflow-y-auto p-2 space-y-1">
          {loading && (
            <div className="py-8 text-center text-xs text-slate-400">
              Searching your private local database...
            </div>
          )}

          {!loading && query && searchResults.length > 0 && (
            <div>
              <div className="px-3 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Matching Records
              </div>
              {searchResults.map((item) => (
                <button
                  key={`${item.type}-${item.id}`}
                  onClick={() => {
                    onClose();
                    if (item.type === 'task') onNavigate('tasks');
                    else if (item.type === 'memory') onNavigate('memory');
                    else if (item.type === 'document') onNavigate('documents');
                    else onNavigate('dashboard');
                  }}
                  className="flex items-center justify-between w-full px-3 py-2.5 rounded-xl hover:bg-white/5 text-left transition group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="p-1.5 rounded-lg bg-coral-500/10 text-coral-400 text-xs shrink-0">
                      {item.type === 'task' ? <CheckSquare className="w-4 h-4" /> :
                       item.type === 'memory' ? <Brain className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                    </span>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-slate-200 truncate group-hover:text-coral-400 transition">
                        {item.title}
                      </p>
                      <p className="text-[11px] text-slate-400 truncate">{item.snippet}</p>
                    </div>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-white opacity-0 group-hover:opacity-100 transition shrink-0 ml-2" />
                </button>
              ))}
            </div>
          )}

          {!loading && query && searchResults.length === 0 && (
            <div className="py-8 text-center text-xs text-slate-400">
              No matching items found for "{query}".
            </div>
          )}

          {(!query || searchResults.length === 0) && (
            <div>
              <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Quick Actions
              </div>
              {defaultActions.map((act, idx) => {
                const Icon = act.icon;
                return (
                  <button
                    key={idx}
                    onClick={() => {
                      onClose();
                      act.action();
                    }}
                    className="flex items-center justify-between w-full px-3 py-2.5 rounded-xl hover:bg-white/[0.04] text-left text-xs font-medium text-slate-300 hover:text-white transition group"
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-4 h-4 text-coral-400" />
                      <span>{act.label}</span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-white opacity-0 group-hover:opacity-100 transition" />
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
