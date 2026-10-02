import React, { useState } from 'react';
import {
  ShieldCheck,
  HardDrive,
  Cpu,
  Download,
  Trash2,
  Lock,
  CheckCircle2,
  AlertTriangle,
  FileCheck,
  Database
} from 'lucide-react';
import { api } from '../api/client';
import { AIStatus } from '../types';

interface PrivacyPageProps {
  aiStatus: AIStatus | null;
  onDataReset: () => void;
}

export const PrivacyPage: React.FC<PrivacyPageProps> = ({ aiStatus, onDataReset }) => {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteSuccess, setDeleteSuccess] = useState(false);

  const handleExport = () => {
    window.open(api.getExportUrl(), '_blank');
  };

  const handleDeleteAll = async () => {
    setDeleting(true);
    try {
      await api.resetAllData();
      setDeleteSuccess(true);
      setConfirmDelete(false);
      onDataReset();
    } catch (err) {
      console.error('Failed to reset data:', err);
    } finally {
      setDeleting(false);
    }
  };

  const guarantees = [
    {
      title: '100% Local Database',
      desc: 'All tasks, personal memories, notes, and study sessions are stored in a local SQLite file on your disk. Nothing is uploaded to external clouds.',
      icon: Database,
    },
    {
      title: 'Local AI Inference (Ollama)',
      desc: 'PalMind communicates directly with your locally installed Ollama instance over localhost (127.0.0.1:11434). Your prompts never reach closed cloud APIs.',
      icon: Cpu,
    },
    {
      title: 'Local Dense Embeddings',
      desc: 'Vector embeddings are generated using an open-source sentence-transformers model running directly on your CPU/GPU.',
      icon: HardDrive,
    },
    {
      title: 'Local Document Processing',
      desc: 'PDFs and notes are parsed and chunked locally using PyMuPDF and stored inside your project directory.',
      icon: FileCheck,
    },
  ];

  return (
    <div className="p-4 sm:p-8 space-y-6 sm:space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-400 mb-1">
          <ShieldCheck className="w-4 h-4" />
          <span>Privacy & Sovereignty</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Privacy Center
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Your memories shouldn't require sending your life to someone else's server.
        </p>
      </div>

      {/* Main Privacy Shield Banner - Cryptox Dark Luxury */}
      <div className="glass-panel card-3d-tilt p-6 sm:p-8 rounded-3xl border-emerald-500/30 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shadow-[0_0_8px_#34d399]" />
              <h2 className="text-base font-bold text-white">Your Data Stays on This Device</h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              PalMind is built from the ground up for zero-leak privacy. It runs open-weight AI models locally through Ollama, uses local vector search, and operates with no paid or proprietary cloud AI dependencies.
            </p>
          </div>
          <div className="shrink-0 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-mono text-xs font-bold shadow-[0_0_12px_rgba(52,211,153,0.15)]">
            ZERO CLOUD TELEMETRY
          </div>
        </div>
      </div>

      {/* Architecture Verification Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 perspective-1000">
        {guarantees.map((g, idx) => {
          const Icon = g.icon;
          return (
            <div key={idx} className="glass-card card-3d-tilt p-5 rounded-3xl space-y-2.5">
              <div className="flex items-center gap-2.5 font-bold text-sm text-white">
                <div className="p-2 rounded-xl bg-coral-500/10 border border-coral-500/20 text-coral-400">
                  <Icon className="w-4 h-4" />
                </div>
                <span>{g.title}</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                {g.desc}
              </p>
            </div>
          );
        })}
      </div>

      {/* Configured AI Layer Inspection */}
      <div className="glass-panel card-3d-tilt p-6 rounded-3xl space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Cpu className="w-4 h-4 text-coral-400" />
          <span>Active Local AI Stack</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5">
            <p className="text-[11px] text-slate-500 font-medium">Inference Engine</p>
            <p className="font-bold text-slate-200 mt-0.5">Ollama (Localhost)</p>
          </div>
          <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5">
            <p className="text-[11px] text-slate-500 font-medium">Active LLM Model</p>
            <p className="font-bold text-coral-400 mt-0.5 truncate">
              {aiStatus?.active_model || aiStatus?.configured_model || 'qwen2.5:7b'}
            </p>
          </div>
          <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5">
            <p className="text-[11px] text-slate-500 font-medium">Local Embeddings</p>
            <p className="font-bold text-emerald-400 mt-0.5 truncate">all-MiniLM-L6-v2</p>
          </div>
        </div>
      </div>

      {/* Data Sovereignty Actions: Export & Reset */}
      <div className="glass-panel card-3d-tilt p-6 rounded-3xl space-y-4">
        <h3 className="text-sm font-bold text-white">Data Sovereignty & Portability</h3>

        {deleteSuccess && (
          <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs">
            ✓ All user data, memories, and documents have been permanently cleared from this device.
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-2">
          <div>
            <p className="text-xs font-bold text-slate-200">Export My Data</p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Download your complete database of tasks, memories, documents, and study history in structured JSON.
            </p>
          </div>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/[0.04] hover:bg-white/[0.08] text-white font-semibold text-xs border border-white/10 transition active:scale-95 shrink-0"
          >
            <Download className="w-4 h-4 text-coral-400" />
            <span>Export JSON</span>
          </button>
        </div>

        <div className="pt-4 border-t border-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <p className="text-xs font-bold text-rose-300">Delete All Data</p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Permanently wipe all tasks, memories, indexed PDF files, and chat transcripts.
            </p>
          </div>
          {!confirmDelete ? (
            <button
              onClick={() => setConfirmDelete(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 font-semibold text-xs border border-rose-500/20 transition shrink-0"
            >
              <Trash2 className="w-4 h-4" />
              <span>Reset Everything</span>
            </button>
          ) : (
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setConfirmDelete(false)}
                className="px-3 py-1.5 rounded-xl text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAll}
                disabled={deleting}
                className="px-4 py-1.5 rounded-full bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-md transition"
              >
                {deleting ? 'Erasing...' : 'Confirm Wipe'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
