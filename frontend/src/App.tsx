import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { CommandPalette } from './components/CommandPalette';
import { OnboardingModal } from './components/OnboardingModal';
import { AuthModal } from './components/AuthModal';
import {
  AddTaskModal,
  AddMemoryModal,
  UploadDocumentModal,
  AddReminderModal
} from './components/QuickAddModals';

// Pages
import { DashboardPage } from './pages/DashboardPage';
import { ChatPage } from './pages/ChatPage';
import { TasksPage } from './pages/TasksPage';
import { MemoryPage } from './pages/MemoryPage';
import { DocumentsPage } from './pages/DocumentsPage';
import { StudyPage } from './pages/StudyPage';
import { DailyBriefPage } from './pages/DailyBriefPage';
import { RemindersPage } from './pages/RemindersPage';
import { SearchPage } from './pages/SearchPage';
import { PrivacyPage } from './pages/PrivacyPage';
import { SettingsPage } from './pages/SettingsPage';
import { StoryPage } from './pages/StoryPage';

import { api } from './api/client';
import { UserProfile, AIStatus } from './types';
import { useSmoothScroll } from './hooks/useSmoothScroll';

export const App: React.FC = () => {
  useSmoothScroll();
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);

  // User & AI state
  const [user, setUser] = useState<UserProfile | null>(null);
  const [aiStatus, setAIStatus] = useState<AIStatus | null>(null);
  const [loadingInitial, setLoadingInitial] = useState(true);

  // Authentication Modal State
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'signin' | 'signup'>('signin');

  // Quick Add Modals
  const [activeModal, setActiveModal] = useState<'task' | 'memory' | 'document' | 'reminder' | null>(null);

  const fetchInitialData = async () => {
    try {
      const [u, ai] = await Promise.all([
        api.getCurrentUser(),
        api.getAIStatus()
      ]);
      setUser(u);
      setAIStatus(ai);
    } catch (err) {
      console.error('Initial data fetch failed:', err);
    } finally {
      setLoadingInitial(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  const handleToggleTheme = () => {
    setIsDarkMode((prev) => {
      const next = !prev;
      if (next) {
        document.documentElement.classList.add('dark');
        document.documentElement.classList.remove('light');
      } else {
        document.documentElement.classList.remove('dark');
        document.documentElement.classList.add('light');
      }
      return next;
    });
  };

  const handleQuickAddSuccess = (data: any) => {
    // Notify or refresh active page by changing or re-triggering state
    console.log('Item created successfully:', data);
  };

  const handleOpenAuthModal = (mode: 'signin' | 'signup' = 'signin') => {
    setAuthModalMode(mode);
    setAuthModalOpen(true);
  };

  const handleAuthSuccess = (updatedUser: UserProfile) => {
    setUser(updatedUser);
    fetchInitialData();
  };

  const handleLogout = async () => {
    try {
      await api.logout();
    } catch {
      localStorage.removeItem('palmind_token');
    }
    fetchInitialData();
  };

  const handleDataReset = () => {
    fetchInitialData();
    setCurrentTab('dashboard');
  };

  return (
    <div className={`min-h-screen bg-[#030508] text-slate-100 flex ${isDarkMode ? 'dark' : 'light'} selection:bg-coral-500 selection:text-white`}>
      {/* Sidebar */}
      <Sidebar
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        aiStatus={aiStatus}
        mobileOpen={mobileMenuOpen}
        onMobileClose={() => setMobileMenuOpen(false)}
      />

      {/* Main Content Arena */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64 relative">
        <Header
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
          onOpenCommandPalette={() => setCommandPaletteOpen(true)}
          user={user}
          onOpenQuickAdd={setActiveModal}
          isDarkMode={isDarkMode}
          onToggleTheme={handleToggleTheme}
          currentTab={currentTab}
          onTabChange={setCurrentTab}
          onOpenAuthModal={handleOpenAuthModal}
          onLogout={handleLogout}
        />

        <main className="flex-1 min-w-0">
          {currentTab === 'dashboard' && (
            <DashboardPage
              user={user}
              onNavigate={setCurrentTab}
              onOpenQuickAdd={setActiveModal}
            />
          )}
          {currentTab === 'chat' && (
            <ChatPage
              aiStatus={aiStatus}
              onNavigateSettings={() => setCurrentTab('settings')}
            />
          )}
          {currentTab === 'tasks' && (
            <TasksPage onOpenQuickAdd={setActiveModal} />
          )}
          {currentTab === 'memory' && (
            <MemoryPage onOpenQuickAdd={setActiveModal} />
          )}
          {currentTab === 'documents' && (
            <DocumentsPage onOpenQuickAdd={setActiveModal} />
          )}
          {currentTab === 'study' && <StudyPage />}
          {currentTab === 'brief' && (
            <DailyBriefPage onNavigate={setCurrentTab} />
          )}
          {currentTab === 'reminders' && (
            <RemindersPage onOpenQuickAdd={setActiveModal} />
          )}
          {currentTab === 'search' && (
            <SearchPage onNavigate={setCurrentTab} />
          )}
          {currentTab === 'privacy' && (
            <PrivacyPage aiStatus={aiStatus} onDataReset={handleDataReset} />
          )}
          {currentTab === 'settings' && (
            <SettingsPage
              user={user}
              onUserUpdate={setUser}
              onRefreshAIStatus={fetchInitialData}
              onOpenAuthModal={handleOpenAuthModal}
              onLogout={handleLogout}
            />
          )}
          {currentTab === 'story' && (
            <StoryPage onNavigate={setCurrentTab} />
          )}
        </main>
      </div>

      {/* Command Palette (Ctrl+K) */}
      <CommandPalette
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
        onNavigate={setCurrentTab}
        onOpenQuickAdd={setActiveModal}
        onOpenAuthModal={handleOpenAuthModal}
      />

      {/* Authentication Modal (Google & Gmail / Email) */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onAuthSuccess={handleAuthSuccess}
        initialMode={authModalMode}
      />

      {/* Onboarding Wizard (first run when not onboarded) */}
      {user && !user.onboarded && (
        <OnboardingModal
          isOpen={true}
          onComplete={(updatedUser) => setUser(updatedUser)}
        />
      )}

      {/* Quick Add Modals */}
      <AddTaskModal
        isOpen={activeModal === 'task'}
        onClose={() => setActiveModal(null)}
        onSuccess={handleQuickAddSuccess}
      />
      <AddMemoryModal
        isOpen={activeModal === 'memory'}
        onClose={() => setActiveModal(null)}
        onSuccess={handleQuickAddSuccess}
      />
      <UploadDocumentModal
        isOpen={activeModal === 'document'}
        onClose={() => setActiveModal(null)}
        onSuccess={handleQuickAddSuccess}
      />
      <AddReminderModal
        isOpen={activeModal === 'reminder'}
        onClose={() => setActiveModal(null)}
        onSuccess={handleQuickAddSuccess}
      />
    </div>
  );
};
export default App;
