import React, { useState, useEffect, useRef } from 'react';
import {
  Send,
  Sparkles,
  Brain,
  FileText,
  CheckSquare,
  Bot,
  User,
  Plus,
  Trash2,
  AlertTriangle,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Cpu,
  ArrowRight
} from 'lucide-react';
import { api } from '../api/client';
import { Conversation, Message, SourceCitation, AIStatus } from '../types';

interface ChatPageProps {
  aiStatus: AIStatus | null;
  onNavigateSettings: () => void;
}

export const ChatPage: React.FC<ChatPageProps> = ({ aiStatus, onNavigateSettings }) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConvId, setActiveConvId] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [expandedSources, setExpandedSources] = useState<Record<number, boolean>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const suggestedPrompts = [
    "What should I study first today?",
    "What deadlines do I have this week?",
    "What did I promise Rahul?",
    "Summarize my Computer Networks notes.",
    "Which assignment is most urgent?"
  ];

  const fetchConversations = async () => {
    try {
      const convs = await api.getConversations();
      setConversations(convs);
      if (convs.length > 0 && !activeConvId) {
        selectConversation(convs[0].id);
      }
    } catch (err) {
      console.error('Failed to load conversations:', err);
    }
  };

  const selectConversation = async (id: number) => {
    setActiveConvId(id);
    try {
      const conv = await api.getConversation(id);
      setMessages(conv.messages || []);
    } catch (err) {
      console.error('Failed to load conversation details:', err);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async (messageText?: string) => {
    const textToSend = messageText || input;
    if (!textToSend.trim() || loading) return;

    const userText = textToSend.trim();
    setInput('');

    // Optimistic UI for user message
    const tempUserMsg: Message = {
      id: Date.now(),
      conversation_id: activeConvId || 0,
      role: 'user',
      content: userText,
      sources: [],
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempUserMsg]);
    setLoading(true);

    try {
      const res = await api.sendChatMessage(userText, activeConvId || undefined);
      if (!activeConvId) {
        setActiveConvId(res.conversation_id);
        fetchConversations();
      }

      const botMsg: Message = {
        id: Date.now() + 1,
        conversation_id: res.conversation_id,
        role: 'assistant',
        content: res.message,
        sources: res.sources || [],
        created_at: res.created_at,
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err: any) {
      const errorMsg: Message = {
        id: Date.now() + 1,
        conversation_id: activeConvId || 0,
        role: 'assistant',
        content: `Error: ${err.message || 'Failed to get AI response'}. If local AI is offline, check Ollama in Settings.`,
        sources: [],
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleNewChat = () => {
    setActiveConvId(null);
    setMessages([]);
  };

  const handleDeleteConversation = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await api.deleteConversation(id);
      if (activeConvId === id) {
        handleNewChat();
      }
      fetchConversations();
    } catch (err) {
      console.error('Failed to delete conversation:', err);
    }
  };

  const toggleSourceExpand = (msgId: number) => {
    setExpandedSources((prev) => ({ ...prev, [msgId]: !prev[msgId] }));
  };

  return (
    <div className="flex h-[calc(100vh-4.5rem)] max-w-7xl mx-auto overflow-hidden bg-[#030508]">
      {/* Conversations Drawer / Sidebar */}
      <div className="hidden md:flex flex-col w-64 border-r border-white/5 bg-[#06090e]/95 p-4 backdrop-blur-xl">
        <button
          onClick={handleNewChat}
          className="btn-coral flex items-center justify-center gap-2 w-full py-2.5 px-4 text-xs font-bold mb-4 active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>New Chat</span>
        </button>

        <div className="flex-1 overflow-y-auto space-y-1">
          <p className="px-2 py-1 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Previous Dialogues
          </p>
          {conversations.length === 0 ? (
            <p className="px-2 py-4 text-xs text-slate-500 text-center">No chat history yet.</p>
          ) : (
            conversations.map((conv) => (
              <div
                key={conv.id}
                onClick={() => selectConversation(conv.id)}
                className={`flex items-center justify-between w-full px-3 py-2.5 rounded-xl text-xs font-medium cursor-pointer transition group ${
                  activeConvId === conv.id
                    ? 'bg-coral-500/15 text-coral-400 font-semibold border border-coral-500/30 shadow-[0_0_12px_rgba(255,87,34,0.15)]'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
                }`}
              >
                <span className="truncate pr-2">{conv.title}</span>
                <button
                  onClick={(e) => handleDeleteConversation(conv.id, e)}
                  className="opacity-0 group-hover:opacity-100 p-1 text-slate-500 hover:text-rose-400 transition"
                  title="Delete chat"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* AI Model Badge in chat drawer */}
        <div className="pt-3 border-t border-white/5 mt-auto">
          <div className="flex items-center gap-2 text-[11px] text-slate-400">
            <Cpu className="w-3.5 h-3.5 text-coral-400" />
            <span className="truncate">{aiStatus?.active_model || 'Local Qwen2.5 7B'}</span>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col h-full bg-[#030508] relative">
        {/* Ollama Offline Warning Banner if needed */}
        {aiStatus && !aiStatus.available && (
          <div className="p-3 bg-amber-500/10 border-b border-amber-500/20 text-amber-300 text-xs flex items-center justify-between px-6">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>
                Local AI engine (Ollama) is currently unavailable. PalMind will provide database lookups as a fallback.
              </span>
            </div>
            <button
              onClick={onNavigateSettings}
              className="text-xs font-bold underline hover:text-white ml-3 shrink-0"
            >
              Configure in Settings
            </button>
          </div>
        )}

        {/* Messages Scroll Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center max-w-lg mx-auto text-center space-y-5 my-auto py-12">
              <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-[#ff3b14] to-[#ff5722] p-1 shadow-[0_0_30px_rgba(255,87,34,0.4)] flex items-center justify-center">
                <div className="w-full h-full rounded-[22px] bg-[#06090e] flex items-center justify-center">
                  <Brain className="w-8 h-8 text-coral-400" />
                </div>
              </div>
              <div className="space-y-1">
                <h2 className="text-2xl font-bold text-white tracking-tight">Ask PalMind</h2>
                <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
                  Your private, grounded AI assistant that references your stored memory, tasks, and documents with zero cloud leakage.
                </p>
              </div>

              {/* Suggested Prompts */}
              <div className="w-full space-y-2 pt-2">
                <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  Suggested inquiries:
                </p>
                <div className="grid grid-cols-1 gap-2 text-left">
                  {suggestedPrompts.map((prompt, i) => (
                    <button
                      key={i}
                      onClick={() => handleSend(prompt)}
                      className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-coral-500/40 hover:bg-white/[0.05] text-xs font-medium text-slate-300 hover:text-white transition flex items-center justify-between group"
                    >
                      <span>"{prompt}"</span>
                      <Sparkles className="w-3.5 h-3.5 text-slate-500 group-hover:text-coral-400 transition" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            messages.map((msg) => {
              const isUser = msg.role === 'user';
              const hasSources = msg.sources && msg.sources.length > 0;
              const isExpanded = !!expandedSources[msg.id];

              return (
                <div
                  key={msg.id}
                  className={`flex gap-3 sm:gap-4 max-w-3xl ${
                    isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'
                  }`}
                >
                  {/* Avatar */}
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                      isUser
                        ? 'bg-gradient-to-tr from-[#ff5722] to-[#ff3b14] text-white font-bold text-xs shadow-[0_0_10px_rgba(255,87,34,0.3)]'
                        : 'bg-coral-500/10 text-coral-400 border border-coral-500/30'
                    }`}
                  >
                    {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                  </div>

                  {/* Message Bubble */}
                  <div
                    className={`rounded-2xl p-4 text-xs sm:text-sm leading-relaxed max-w-[85%] ${
                      isUser
                        ? 'btn-coral rounded-tr-none text-white'
                        : 'glass-card border border-white/10 text-slate-200 rounded-tl-none shadow-xl'
                    }`}
                  >
                    <div className="whitespace-pre-wrap">{msg.content}</div>

                    {/* Grounded Source Citations */}
                    {hasSources && (
                      <div className="mt-3 pt-3 border-t border-white/10">
                        <button
                          onClick={() => toggleSourceExpand(msg.id)}
                          className="flex items-center gap-1.5 text-[11px] font-semibold text-coral-400 hover:text-coral-300 transition"
                        >
                          <Brain className="w-3.5 h-3.5" />
                          <span>
                            {msg.sources.length} Grounded Source{msg.sources.length > 1 ? 's' : ''}
                          </span>
                          {isExpanded ? (
                            <ChevronUp className="w-3.5 h-3.5 ml-0.5" />
                          ) : (
                            <ChevronDown className="w-3.5 h-3.5 ml-0.5" />
                          )}
                        </button>

                        {isExpanded && (
                          <div className="mt-2 space-y-2 animate-in fade-in duration-100">
                            {msg.sources.map((source, sIdx) => (
                              <div
                                key={sIdx}
                                className="p-2.5 rounded-xl bg-white/[0.04] border border-white/5 text-[11px]"
                              >
                                <div className="flex items-center gap-1.5 font-bold text-slate-300 mb-1">
                                  {source.type === 'document' ? (
                                    <FileText className="w-3 h-3 text-amber-400" />
                                  ) : source.type === 'memory' ? (
                                    <Brain className="w-3 h-3 text-emerald-400" />
                                  ) : (
                                    <CheckSquare className="w-3 h-3 text-coral-400" />
                                  )}
                                  <span>{source.title}</span>
                                  {source.page && (
                                    <span className="text-[10px] text-slate-400">
                                      (Page {source.page})
                                    </span>
                                  )}
                                </div>
                                <p className="text-slate-400 italic">"{source.snippet}"</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}

          {loading && (
            <div className="flex gap-3 max-w-3xl mr-auto">
              <div className="w-8 h-8 rounded-full bg-coral-500/20 text-coral-400 border border-coral-500/30 flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4 animate-spin" />
              </div>
              <div className="p-4 rounded-2xl glass-card text-xs text-slate-400 flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-coral-400 animate-pulse" />
                <span>Searching local memories & documents, reasoning...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-4 border-t border-white/5 bg-[#030508]/90 backdrop-blur-md">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2 max-w-3xl mx-auto"
          >
            <input
              type="text"
              placeholder="Ask PalMind about your notes, promises, exams, or tasks..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 px-4 py-3 bg-white/[0.04] border border-white/10 rounded-2xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-coral-500/60 focus:bg-white/[0.06] transition"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="btn-coral p-3 rounded-2xl disabled:opacity-40 shadow-lg active:scale-95"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
