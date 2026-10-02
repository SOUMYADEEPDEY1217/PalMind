import React from 'react';
import {
  LayoutDashboard,
  MessageSquare,
  CheckSquare,
  Brain,
  FileText,
  Timer,
  Sparkles,
  Bell,
  Search,
  ShieldCheck,
  Settings,
  Heart,
  Cpu,
  X
} from 'lucide-react';
import { AIStatus } from '../types';

interface SidebarProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
  aiStatus: AIStatus | null;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onTabChange,
  aiStatus,
  mobileOpen,
  onMobileClose,
}) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'chat', label: 'Ask PalMind', icon: MessageSquare },
    { id: 'tasks', label: 'Smart Tasks', icon: CheckSquare },
    { id: 'memory', label: 'My Memory', icon: Brain },
    { id: 'documents', label: 'Documents', icon: FileText },
    { id: 'study', label: 'Study Mode', icon: Timer },
    { id: 'brief', label: 'Daily Brief', icon: Sparkles },
    { id: 'reminders', label: 'Reminders', icon: Bell },
    { id: 'search', label: 'Search', icon: Search },
  ];

  const bottomItems = [
    { id: 'story', label: 'Our Story', icon: Heart, badge: 'For a Friend' },
    { id: 'privacy', label: 'Privacy Center', icon: ShieldCheck },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const handleSelect = (id: string) => {
    onTabChange(id);
    onMobileClose();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/80 backdrop-blur-md lg:hidden"
          onClick={onMobileClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col w-64 bg-[#06090e]/95 backdrop-blur-2xl border-r border-white/5 transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header / Brand with Radiant Molten Ring */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/5">
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => handleSelect('dashboard')}>
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-[#ff3b14] via-[#ff5722] to-[#ffa143] shadow-[0_0_20px_rgba(255,87,34,0.4)] text-white font-bold group-hover:scale-105 transition">
              <Brain className="w-5 h-5 text-white" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-[#06090e] shadow-[0_0_8px_#34d399]"></span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-lg tracking-tight text-white">PalMind</span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">Local AI Companion</p>
            </div>
          </div>
          <button
            onClick={onMobileClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Primary Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <div className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            Workspace
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleSelect(item.id)}
                className={`flex items-center w-full gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  active
                    ? 'bg-gradient-to-r from-coral-500/20 to-coral-500/5 text-coral-400 font-semibold shadow-sm shadow-coral-500/10 border border-coral-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
                }`}
              >
                <Icon className={`w-4 h-4 ${active ? 'text-coral-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}

          <div className="pt-5 px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            Control & Trust
          </div>
          {bottomItems.map((item) => {
            const Icon = item.icon;
            const active = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleSelect(item.id)}
                className={`flex items-center justify-between w-full px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  active
                    ? 'bg-coral-500/20 text-coral-400 font-semibold border border-coral-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${active ? 'text-coral-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-coral-500/20 text-coral-300 border border-coral-500/30">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* AI Status Footer Indicator */}
        <div className="p-4 border-t border-white/5 bg-[#030508]/80">
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.03] border border-white/5">
            <div className="flex items-center gap-2.5 min-w-0">
              <Cpu className="w-4 h-4 text-coral-400 shrink-0" />
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span
                    className={`w-2 h-2 rounded-full shrink-0 ${
                      aiStatus?.available ? 'bg-emerald-400 shadow-[0_0_8px_#34d399] animate-pulse' : 'bg-amber-400'
                    }`}
                  />
                  <p className="text-xs font-semibold text-slate-200 truncate">
                    {aiStatus?.available ? 'Local AI Active' : 'AI Offline'}
                  </p>
                </div>
                <p className="text-[10px] text-slate-400 truncate">
                  {aiStatus?.active_model || aiStatus?.configured_model || 'Ollama'}
                </p>
              </div>
            </div>
            <button
              onClick={() => handleSelect('settings')}
              className="px-2 py-1 text-[11px] font-medium rounded-lg text-coral-400 hover:bg-coral-500/10 hover:text-coral-300 transition"
              title="Configure AI"
            >
              Config
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
