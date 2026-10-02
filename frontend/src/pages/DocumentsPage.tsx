import React, { useState, useEffect } from 'react';
import {
  FileText,
  FileUp,
  Trash2,
  HelpCircle,
  Sparkles,
  Send,
  Loader2,
  Calendar,
  Layers,
  X,
  Bot
} from 'lucide-react';
import { api } from '../api/client';
import { DocumentItem } from '../types';

interface DocumentsPageProps {
  onOpenQuickAdd: (type: 'document') => void;
}

export const DocumentsPage: React.FC<DocumentsPageProps> = ({ onOpenQuickAdd }) => {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeAskDoc, setActiveAskDoc] = useState<DocumentItem | null>(null);
  const [question, setQuestion] = useState('');
  const [qaAnswer, setQaAnswer] = useState<string | null>(null);
  const [qaSources, setQaSources] = useState<any[]>([]);
  const [asking, setAsking] = useState(false);

  const fetchDocuments = async () => {
    try {
      const data = await api.getDocuments();
      setDocuments(data);
    } catch (err) {
      console.error('Failed to load documents:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleDelete = async (id: number) => {
    try {
      await api.deleteDocument(id);
      fetchDocuments();
    } catch (err) {
      console.error('Failed to delete document:', err);
    }
  };

  const handleAskSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeAskDoc || !question.trim() || asking) return;

    setAsking(true);
    setQaAnswer(null);
    setQaSources([]);

    try {
      const res = await api.askDocument(activeAskDoc.id, question.trim());
      setQaAnswer(res.answer);
      setQaSources(res.sources || []);
    } catch (err: any) {
      setQaAnswer(`Failed to query document: ${err.message}`);
    } finally {
      setAsking(false);
    }
  };

  const sampleQuestions = [
    "Summarize this document.",
    "Give me important exam topics.",
    "Explain key concepts simply.",
    "Find where key definitions are discussed."
  ];

  return (
    <div className="p-4 sm:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Document Intelligence
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Upload PDFs, lecture notes, or markdown. PalMind chunks, embeds, and indexes them locally for grounded Q&A.
          </p>
        </div>
        <button
          onClick={() => onOpenQuickAdd('document')}
          className="btn-coral self-start sm:self-center flex items-center gap-1.5 px-5 py-2 text-xs font-bold active:scale-95 shadow-lg"
        >
          <FileUp className="w-4 h-4" />
          <span>Upload Document</span>
        </button>
      </div>

      {/* Document Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-pulse">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-44 bg-white/5 rounded-3xl" />
          ))}
        </div>
      ) : documents.length === 0 ? (
        <div className="glass-panel py-16 text-center rounded-3xl space-y-3">
          <FileText className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-sm font-bold text-white">No documents uploaded yet</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Upload course slides, syllabus, or notes in PDF, TXT, or Markdown format to ask questions directly.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 perspective-1000">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="glass-card card-3d-tilt p-5 rounded-3xl flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="p-2 rounded-xl bg-coral-500/10 border border-coral-500/20 text-coral-400 shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-xs sm:text-sm font-bold text-white truncate">
                        {doc.filename}
                      </h3>
                      <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400">
                        <span className="uppercase font-mono text-[10px] px-1.5 py-0.5 rounded bg-white/5">
                          {doc.file_type}
                        </span>
                        <span>{(doc.file_size / 1024).toFixed(1)} KB</span>
                        <span className="flex items-center gap-1">
                          <Layers className="w-3 h-3 text-coral-400" />
                          <span>{doc.chunk_count} chunks</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDelete(doc.id)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition"
                    title="Delete document"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Summary */}
                {doc.summary && (
                  <p className="text-xs text-slate-300 mt-3 p-3 rounded-2xl bg-white/[0.02] border border-white/5 line-clamp-3 leading-relaxed">
                    {doc.summary}
                  </p>
                )}
              </div>

              {/* Bottom Actions */}
              <div className="flex items-center justify-between pt-2 border-t border-white/5 text-[11px]">
                <span className="text-slate-500 flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  <span>{new Date(doc.created_at).toLocaleDateString()}</span>
                </span>

                <button
                  onClick={() => {
                    setActiveAskDoc(doc);
                    setQaAnswer(null);
                    setQuestion('');
                  }}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-coral-500/15 hover:bg-coral-500/25 border border-coral-500/30 text-coral-300 font-semibold transition text-xs shadow-sm"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Ask Document</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Ask Document Modal */}
      {activeAskDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-150">
          <div className="w-full max-w-2xl bg-[#080d16] border border-white/10 rounded-3xl p-6 shadow-2xl relative max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-white/5">
              <div className="flex items-center gap-2.5 min-w-0">
                <Sparkles className="w-5 h-5 text-coral-400 shrink-0" />
                <div className="min-w-0">
                  <h3 className="text-sm font-bold text-white truncate">
                    Ask: {activeAskDoc.filename}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Answers grounded strictly in this document's text chunks.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveAskDoc(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Answer & Sources Scroll Container */}
            <div className="flex-1 overflow-y-auto py-4 space-y-4">
              {/* Sample question chips */}
              <div>
                <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  Suggested Questions:
                </p>
                <div className="flex flex-wrap gap-2">
                  {sampleQuestions.map((q, idx) => (
                    <button
                      key={idx}
                      onClick={() => setQuestion(q)}
                      className="px-3 py-1.5 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/5 text-xs text-slate-300 hover:text-white transition"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>

              {asking && (
                <div className="p-4 rounded-2xl glass-card text-xs text-slate-400 flex items-center gap-2">
                  <Loader2 className="w-4 h-4 text-coral-400 animate-spin" />
                  <span>Searching document chunks and generating grounded answer...</span>
                </div>
              )}

              {qaAnswer && (
                <div className="p-4 rounded-2xl glass-panel space-y-3">
                  <div className="flex items-center gap-2 font-bold text-xs text-coral-400">
                    <Bot className="w-4 h-4" />
                    <span>Answer from {activeAskDoc.filename}</span>
                  </div>
                  <div className="text-xs sm:text-sm text-slate-200 leading-relaxed whitespace-pre-wrap">
                    {qaAnswer}
                  </div>

                  {/* Sources / Pages */}
                  {qaSources.length > 0 && (
                    <div className="pt-3 border-t border-white/5 space-y-1.5">
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                        Cited Excerpts:
                      </p>
                      {qaSources.map((s, idx) => (
                        <div key={idx} className="p-2 rounded-xl bg-white/[0.03] text-[11px] text-slate-400">
                          <span className="font-semibold text-slate-300">Page {s.page || 1}:</span> "{s.snippet}"
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Input Bar */}
            <form onSubmit={handleAskSubmit} className="pt-3 border-t border-white/5 flex gap-2">
              <input
                type="text"
                placeholder={`Ask anything about ${activeAskDoc.filename}...`}
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                autoFocus
                className="flex-1 px-4 py-2.5 bg-white/[0.04] border border-white/10 rounded-2xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-coral-500/60 transition"
              />
              <button
                type="submit"
                disabled={!question.trim() || asking}
                className="btn-coral p-3 rounded-2xl disabled:opacity-40 shadow-md transition active:scale-95"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
