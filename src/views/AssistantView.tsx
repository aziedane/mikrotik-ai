import React, { useState, useRef, useEffect } from 'react';
import {
  Bot,
  Send,
  Sparkles,
  Copy,
  Check,
  RefreshCw,
  PlusCircle,
} from 'lucide-react';
import { ChatMessage, NavPage } from '../types';
import { api } from '../services/api';

interface AssistantViewProps {
  isDemo?: boolean;
  onNavigate?: (page: NavPage) => void;
}

export function AssistantView({ isDemo = false }: AssistantViewProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-welcome',
      sender: 'assistant',
      text: `Halo! Saya **MikroTik AI Assistant**, asisten kecerdasan buatan untuk analisis, diagnosis, dan audit jaringan RouterOS Anda.

Saya siap membaca data telemetri live dari router MikroTik dan STB Armbian secara otomatis. 

Silakan pilih pertanyaan cepat di bawah atau ketik pertanyaan teknis untuk analisis langsung.`,
      timestamp: new Date().toISOString(),
      confidence: 'Tinggi',
      modelUsed: 'gemini-3.8-flash',
      isDemo: false,
    },
  ]);

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const quickPrompts = [
    'Analisis kondisi jaringan saya.',
    'Mengapa internet terasa lambat?',
    'Periksa kesehatan router utama.',
    'Periksa router hotspot.',
    'Analisis CPU dan RAM.',
    'Periksa koneksi PPPoE.',
    'Periksa penggunaan bandwidth.',
    'Audit firewall dan NAT.',
  ];

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const handleSend = async (customText?: string) => {
    const textToSend = customText || input;
    if (!textToSend.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!customText) setInput('');
    setLoading(true);

    try {
      const response = await api.chatWithAI(textToSend);
      const assistantMsg: ChatMessage = {
        id: `ast-${Date.now()}`,
        sender: 'assistant',
        text: response.reply,
        timestamp: new Date().toISOString(),
        confidence: response.confidence,
        modelUsed: response.modelUsed,
        dataReferences: response.dataReferences,
        isDemo: false,
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        sender: 'assistant',
        text: `**Pemberitahuan Sistem:**\nTerjadi kendala saat menghubungi AI Assistant (${err?.message || 'Koneksi gagal'}). Silakan coba lagi.`,
        timestamp: new Date().toISOString(),
        confidence: 'Terbatas',
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleNewChat = () => {
    setMessages([
      {
        id: `msg-${Date.now()}`,
        sender: 'assistant',
        text: 'Percakapan baru dimulai. Bagaimana saya dapat membantu menganalisis jaringan MikroTik Anda hari ini?',
        timestamp: new Date().toISOString(),
        confidence: 'Tinggi',
        modelUsed: 'gemini-3.8-flash',
        isDemo: false,
      },
    ]);
  };

  const renderInlineMarkdown = (str: string) => {
    const parts = str.split(/(\*\*.*?\*\*|`.*?`)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={i} className="font-semibold text-white">
            {part.slice(2, -2)}
          </strong>
        );
      }
      if (part.startsWith('`') && part.endsWith('`')) {
        return (
          <code key={i} className="px-1.5 py-0.5 rounded bg-slate-800 text-cyan-300 font-mono text-xs border border-slate-700">
            {part.slice(1, -1)}
          </code>
        );
      }
      return part;
    });
  };

  const renderFormattedText = (text: string) => {
    return text.split('\n').map((line, idx) => {
      if (line.startsWith('### ')) {
        return (
          <h3 key={idx} className="text-sm font-bold text-white mt-2 mb-1">
            {line.replace('### ', '')}
          </h3>
        );
      }
      if (line.startsWith('## ')) {
        return (
          <h2 key={idx} className="text-base font-bold text-cyan-400 mt-3 mb-1.5">
            {line.replace('## ', '')}
          </h2>
        );
      }
      if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
        const itemText = line.trim().replace(/^[-*]\s+/, '');
        return (
          <li key={idx} className="ml-4 list-disc text-slate-300 text-xs sm:text-sm leading-relaxed my-0.5">
            {renderInlineMarkdown(itemText)}
          </li>
        );
      }
      if (!line.trim()) {
        return <div key={idx} className="h-1.5" />;
      }
      return (
        <p key={idx} className="text-xs sm:text-sm text-slate-300 leading-relaxed my-0.5">
          {renderInlineMarkdown(line)}
        </p>
      );
    });
  };

  return (
    <div className="flex flex-col h-[calc(100vh-6.5rem)] sm:h-[calc(100vh-7rem)] max-w-4xl mx-auto pb-16 lg:pb-4 select-none gap-2.5">
      {/* Top Header */}
      <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-900 border border-slate-800 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold border border-cyan-500/30 shrink-0">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-xs sm:text-sm text-white">MikroTik AI Assistant</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <span className="text-[10px] sm:text-xs text-slate-400 font-mono">
              Gemini 3.8 Flash • Live Telemetry Context
            </span>
          </div>
        </div>

        <button
          onClick={handleNewChat}
          className="p-1.5 px-2.5 rounded-xl text-xs font-mono bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center gap-1.5 transition-colors border border-slate-700 shrink-0"
          title="Mulai percakapan baru"
        >
          <PlusCircle className="w-3.5 h-3.5 text-cyan-400" />
          <span className="hidden sm:inline">Reset</span>
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div
        ref={chatContainerRef}
        className="flex-1 min-h-0 overflow-y-auto p-3 sm:p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3 scrollbar-thin scrollbar-thumb-slate-800"
      >
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-2 sm:gap-3 ${
              msg.sender === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            {msg.sender === 'assistant' && (
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-cyan-600/20 text-cyan-300 flex items-center justify-center shrink-0 mt-0.5 border border-cyan-500/30">
                <Bot className="w-4 h-4" />
              </div>
            )}

            <div
              className={`max-w-[88%] sm:max-w-[80%] rounded-2xl p-3 sm:p-4 shadow-sm text-xs sm:text-sm space-y-1.5 ${
                msg.sender === 'user'
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-tr-xs'
                  : 'bg-slate-950 border border-slate-800/90 text-slate-200 rounded-tl-xs'
              }`}
            >
              {msg.sender === 'assistant' && (
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-1.5 mb-1.5 text-[10px] text-slate-400 font-mono">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="w-3 h-3 text-cyan-400" />
                    <span>AI Diagnosis RouterOS</span>
                  </div>
                  <button
                    onClick={() => handleCopy(msg.id, msg.text)}
                    className="p-1 rounded text-slate-400 hover:text-white transition-colors"
                    title="Salin jawaban"
                  >
                    {copiedId === msg.id ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              )}

              {/* Text content */}
              <div>{renderFormattedText(msg.text)}</div>

              {/* Data References */}
              {msg.dataReferences && msg.dataReferences.length > 0 && (
                <div className="mt-2 pt-2 border-t border-slate-800/80 flex flex-wrap gap-1">
                  {msg.dataReferences.map((ref, idx) => (
                    <span
                      key={idx}
                      className="text-[9px] px-1.5 py-0.5 rounded bg-slate-900 text-cyan-300 border border-slate-800 font-mono"
                    >
                      {ref}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex gap-2.5 justify-start items-center p-3 sm:p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-300 font-mono animate-pulse">
            <RefreshCw className="w-4 h-4 text-cyan-400 animate-spin shrink-0" />
            <span>Memproses telemetri live &amp; generating AI diagnosis...</span>
          </div>
        )}
      </div>

      {/* Horizontal Quick Prompts Chips (Mobile Touch Friendly) */}
      <div className="overflow-x-auto scrollbar-none py-0.5 shrink-0">
        <div className="flex items-center gap-1.5 whitespace-nowrap">
          {quickPrompts.map((prompt, i) => (
            <button
              key={i}
              onClick={() => handleSend(prompt)}
              disabled={loading}
              className="text-[11px] px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 hover:border-cyan-500/40 transition-all shrink-0 font-mono disabled:opacity-50 active:scale-95"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>

      {/* Bottom Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="flex items-center gap-2 p-1.5 sm:p-2 rounded-2xl bg-slate-900 border border-slate-800 shrink-0"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={loading}
          placeholder="Tanyakan analisis router, PPPoE, Hotspot, atau CPU..."
          className="flex-1 bg-transparent text-white placeholder-slate-500 text-xs sm:text-sm px-3 py-1.5 focus:outline-none font-mono min-w-0"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="p-2 sm:px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-all disabled:opacity-40 shrink-0"
        >
          <Send className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Kirim</span>
        </button>
      </form>
    </div>
  );
}
