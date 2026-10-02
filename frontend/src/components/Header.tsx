import React, { useState } from 'react';
import {
  Menu,
  Search,
  Plus,
  Sun,
  Moon,
  CheckSquare,
  Brain,
  FileUp,
  Bell,
  Sparkles,
  Command,
  ArrowRight,
  LogIn,
  UserPlus,
  LogOut,
  User,
  Shield,
  ChevronDown
} from 'lucide-react';
import { UserProfile } from '../types';

interface HeaderProps {
  onOpenMobileMenu: () => void;
  onOpenCommandPalette: () => void;
  user: UserProfile | null;
  onOpenQuickAdd: (type: 'task' | 'memory' | 'document' | 'reminder') => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
  currentTab?: string;
  onTabChange?: (tab: string) => void;
  onOpenAuthModal?: (mode?: 'signin' | 'signup') => void;
  onLogout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenMobileMenu,
  onOpenCommandPalette,
  user,
  onOpenQuickAdd,
  isDarkMode,
  onToggleTheme,
  currentTab = 'dashboard',
  onTabChange,
  onOpenAuthModal,
  onLogout,
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const mainPills = [
    { id: 'dashboard', label: 'Home' },
    { id: 'chat', label: 'Ask AI' },
    { id: 'memory', label: 'Memory' },
    { id: 'tasks', label: 'Tasks' },
    { id: 'study', label: 'Study' },
    { id: 'privacy', label: 'Privacy' },
  ];

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-18 px-4 sm:px-8 bg-[#030508]/80 backdrop-blur-xl border-b border-white/5 transition-all">
      {/* Left: Mobile trigger & Search trigger */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileMenu}
          className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 lg:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Global Search Bar Trigger (Sleek Cryptox pill) */}
        <button
          onClick={onOpenCommandPalette}
          className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-white/10 text-slate-300 hover:text-white hover:border-coral-500/40 hover:bg-white/[0.07] transition-all text-xs group shadow-inner"
        >
          <Search className="w-3.5 h-3.5 text-slate-400 group-hover:text-coral-400 transition" />
          <span className="hidden sm:inline text-xs text-slate-400">Search memories, tasks, PDFs...</span>
          <span className="sm:hidden text-xs text-slate-400">Search...</span>
          <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono text-slate-400 bg-white/5 border border-white/10 rounded-md">
            <span>⌘</span>K
          </kbd>
        </button>
      </div>

      {/* Center: Cryptox Luxury Floating Pill Navigation */}
      <nav className="hidden md:flex items-center p-1 rounded-full bg-[#0d131f]/90 border border-white/10 shadow-[0_10px_30px_rgba(0,0,0,0.6)] backdrop-blur-md">
        {mainPills.map((pill) => {
          const active = currentTab === pill.id;
          return (
            <button
              key={pill.id}
              onClick={() => onTabChange && onTabChange(pill.id)}
              className={`px-3.5 py-1 rounded-full text-xs font-medium transition-all duration-300 ${
                active
                  ? 'bg-gradient-to-r from-[#ff5722] to-[#ff3b14] text-white font-semibold shadow-[0_0_15px_rgba(255,87,34,0.45)] scale-105'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
            >
              {pill.label}
            </button>
          );
        })}
      </nav>

      {/* Right: Quick Add Dropdown & Profile */}
      <div className="flex items-center gap-2.5">
        {/* Theme Toggle */}
        <button
          onClick={onToggleTheme}
          className="p-2 rounded-full text-slate-400 hover:text-slate-200 hover:bg-white/5 transition"
          title={isDarkMode ? 'Dark Luxury Active' : 'Switch Mode'}
        >
          {isDarkMode ? <Sun className="w-4 h-4 text-coral-400" /> : <Moon className="w-4 h-4 text-coral-600" />}
        </button>

        {/* Quick Add Dropdown with Vibrant Coral Pill */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="btn-coral flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold shadow-md active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Quick Add</span>
          </button>

          {dropdownOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setDropdownOpen(false)}
              />
              <div className="absolute right-0 mt-2 w-52 py-2 bg-[#090e18]/95 border border-white/10 rounded-2xl shadow-2xl z-50 backdrop-blur-2xl animate-in fade-in zoom-in-95 duration-150">
                <button
                  onClick={() => {
                    setDropdownOpen(false);
                    onOpenQuickAdd('task');
                  }}
                  className="flex items-center gap-2.5 w-full px-4 py-2.5 text-xs font-medium text-slate-200 hover:bg-white/5 hover:text-coral-400 transition"
                >
                  <CheckSquare className="w-4 h-4 text-coral-400" />
                  <span>Add Smart Task</span>
                </button>
                <button
                  onClick={() => {
                    setDropdownOpen(false);
                    onOpenQuickAdd('memory');
                  }}
                  className="flex items-center gap-2.5 w-full px-4 py-2.5 text-xs font-medium text-slate-200 hover:bg-white/5 hover:text-emerald-400 transition"
                >
                  <Brain className="w-4 h-4 text-emerald-400" />
                  <span>Store Memory Note</span>
                </button>
                <button
                  onClick={() => {
                    setDropdownOpen(false);
                    onOpenQuickAdd('document');
                  }}
                  className="flex items-center gap-2.5 w-full px-4 py-2.5 text-xs font-medium text-slate-200 hover:bg-white/5 hover:text-amber-400 transition"
                >
                  <FileUp className="w-4 h-4 text-amber-400" />
                  <span>Upload Document / PDF</span>
                </button>
                <button
                  onClick={() => {
                    setDropdownOpen(false);
                    onOpenQuickAdd('reminder');
                  }}
                  className="flex items-center gap-2.5 w-full px-4 py-2.5 text-xs font-medium text-slate-200 hover:bg-white/5 hover:text-purple-400 transition"
                >
                  <Bell className="w-4 h-4 text-purple-400" />
                  <span>Set Smart Reminder</span>
                </button>
              </div>
            </>
          )}
        </div>

        {/* User Pill & Authentication Menu */}
        <div className="relative flex items-center gap-2 pl-2 border-l border-white/10">
          {!user?.email ? (
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => onOpenAuthModal && onOpenAuthModal('signin')}
                className="btn-coral px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-md hover:scale-105 transition-transform"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>
            </div>
          ) : (
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 p-1 pl-1.5 pr-2.5 rounded-full bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 hover:border-coral-500/30 transition group"
              >
                {user.avatar_url ? (
                  <img
                    src={user.avatar_url}
                    alt={user.name}
                    className="w-7 h-7 rounded-full object-cover border border-coral-500/40"
                  />
                ) : (
                  <div className="flex items-center justify-center w-7 h-7 rounded-full bg-coral-500/20 border border-coral-500/40 text-coral-300 font-bold text-xs shadow-[0_0_10px_rgba(255,87,34,0.2)]">
                    {user?.name ? user.name[0].toUpperCase() : 'F'}
                  </div>
                )}
                <div className="text-left hidden md:block">
                  <p className="text-xs font-bold text-white group-hover:text-coral-400 transition leading-tight">
                    {user?.name || 'Friend'}
                  </p>
                  <p className="text-[10px] text-slate-400 font-mono leading-none truncate max-w-[120px]">
                    {user.email}
                  </p>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-white transition ml-1" />
              </button>

              {/* User Account Dropdown */}
              {userMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setUserMenuOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-[#0a0f18]/95 border border-white/10 shadow-2xl backdrop-blur-xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    {/* User profile card inside dropdown */}
                    <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 mb-2">
                      <div className="flex items-center gap-2.5">
                        {user.avatar_url ? (
                          <img
                            src={user.avatar_url}
                            alt={user.name}
                            className="w-9 h-9 rounded-full object-cover border border-coral-500/40"
                          />
                        ) : (
                          <div className="w-9 h-9 rounded-full bg-coral-500/20 border border-coral-500/30 flex items-center justify-center text-coral-400 font-bold text-sm">
                            {user.name ? user.name[0].toUpperCase() : 'F'}
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-white truncate">{user.name}</p>
                          <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
                        </div>
                      </div>

                      <div className="mt-2.5 pt-2 border-t border-white/5 flex items-center justify-between text-[10px]">
                        <span className="text-slate-400">Auth Method</span>
                        <span className="px-2 py-0.5 rounded-full bg-coral-500/10 text-coral-400 font-semibold border border-coral-500/20 capitalize">
                          {user.auth_provider || 'Local'}
                        </span>
                      </div>
                    </div>

                    {/* Menu Actions */}
                    <div className="space-y-1">
                      <button
                        onClick={() => {
                          setUserMenuOpen(false);
                          if (onTabChange) onTabChange('settings');
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-slate-300 hover:text-white hover:bg-white/5 transition text-left"
                      >
                        <User className="w-4 h-4 text-coral-400" />
                        <span>Account & Settings</span>
                      </button>

                      <button
                        onClick={() => {
                          setUserMenuOpen(false);
                          if (onOpenAuthModal) onOpenAuthModal('signin');
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-slate-300 hover:text-white hover:bg-white/5 transition text-left"
                      >
                        <LogIn className="w-4 h-4 text-blue-400" />
                        <span>Switch Account</span>
                      </button>

                      <button
                        onClick={() => {
                          setUserMenuOpen(false);
                          if (onLogout) onLogout();
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-rose-300 hover:text-rose-200 hover:bg-rose-500/10 transition text-left border-t border-white/5 mt-1 pt-2"
                      >
                        <LogOut className="w-4 h-4 text-rose-400" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
