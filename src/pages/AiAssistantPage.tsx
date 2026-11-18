import React, { useEffect, useRef, useState } from 'react';
import { Loader2, MessageSquare, Send, ShieldAlert } from 'lucide-react';
import { findObdCodeDetails } from '../data/obdCodes';
import type { DiagnosticScan, ObdCodeEntry, Vehicle } from '../types/autosense';

interface AiAssistantPageProps {
  activeVehicle: Vehicle | undefined;
  latestScan: DiagnosticScan | undefined;
  customCodes: ObdCodeEntry[];
  prefilledPrompt?: string;
  onClearPrefilledPrompt?: () => void;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

const STARTER_QUESTIONS = [
  'What does the check engine light mean?',
  'Why is my car overheating?',
  'What is error code P0300?',
  'When should I service my vehicle?',
  'Is this warning serious?',
];

export function AiAssistantPage({
  activeVehicle,
  latestScan,
  customCodes,
  prefilledPrompt,
  onClearPrefilledPrompt,
}: AiAssistantPageProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content:
        'Hello! I am AutoSense AI. Ask me about dashboard warning lights, OBD-II error codes, routine maintenance intervals, or your current vehicle readings. For any urgent safety signs (flashing lights, overheating, brake loss), always pull over safely.',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (prefilledPrompt) {
      setInput(prefilledPrompt);
      onClearPrefilledPrompt?.();
    }
  }, [prefilledPrompt, onClearPrefilledPrompt]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const sendQuestion = async (questionText: string) => {
    const trimmed = questionText.trim();
    if (!trimmed || loading) return;

    const userMsg: ChatMessage = {
      id: `u_${Date.now()}`,
      role: 'user',
      content: trimmed,
    };

    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setInput('');
    setErrorMsg('');
    setLoading(true);

    try {
      const activeCodesContext = (latestScan?.detectedCodes ?? []).map((code) => {
        const info = findObdCodeDetails(code, customCodes);
        return { code: info.code, name: info.name, severity: info.severity };
      });

      const response = await fetch('/api/ai/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: trimmed,
          history: nextMessages.slice(-6).map((m) => ({ role: m.role, content: m.content })),
          vehicleContext: activeVehicle
            ? {
                label: `${activeVehicle.manufacturer} ${activeVehicle.model}`,
                year: activeVehicle.year,
                fuelType: activeVehicle.fuelType,
                odometerKm: activeVehicle.odometerKm,
                healthScore: latestScan?.overallHealthScore ?? activeVehicle.lastHealthScore,
                isDemoData: Boolean(activeVehicle.isDemoData || latestScan?.isDemoData),
              }
            : null,
          activeCodesContext,
        }),
      });

      const data = (await response.json()) as { reply?: string; error?: string };
      if (!response.ok || !data.reply) {
        throw new Error(data.error || 'Failed to get a response from AutoSense AI.');
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `a_${Date.now()}`,
          role: 'assistant',
          content: data.reply!,
        },
      ]);
    } catch (err) {
      setErrorMsg(
        err instanceof Error
          ? err.message
          : 'AutoSense AI is temporarily unreachable. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void sendQuestion(input);
  };

  return (
    <div className="space-y-4">
      <section className="bg-[#0F172A] border border-slate-800 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-display font-bold text-xl text-white flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-blue-400" />
            AutoSense AI Assistant
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            {activeVehicle
              ? `Context aware: ${activeVehicle.year} ${activeVehicle.manufacturer} ${activeVehicle.model}${
                  latestScan?.isDemoData ? ' (DEMO DATA)' : ''
                }`
              : 'Ask general questions about warning lights, trouble codes, and vehicle care.'}
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-400">
          <ShieldAlert className="w-4 h-4 text-blue-400 shrink-0" />
          <span>Educational guidance only — not a substitute for inspection</span>
        </div>
      </section>

      {/* Starter Questions */}
      <div className="flex flex-wrap gap-2">
        {STARTER_QUESTIONS.map((q) => (
          <button
            key={q}
            type="button"
            disabled={loading}
            onClick={() => void sendQuestion(q)}
            className="px-3 py-1.5 rounded-lg bg-[#0F172A] border border-slate-800 hover:border-blue-500/50 text-xs text-slate-300 hover:text-white transition-colors"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Chat Viewport */}
      <section className="bg-[#0F172A] border border-slate-800 rounded-2xl flex flex-col h-[520px] overflow-hidden">
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                  m.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-[#0B1120] border border-slate-800 text-slate-200'
                }`}
              >
                {m.content}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="rounded-2xl px-4 py-3 bg-[#0B1120] border border-slate-800 text-xs text-slate-400 inline-flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
                AutoSense AI is analyzing your question...
              </div>
            </div>
          )}

          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-200">
              {errorMsg}
            </div>
          )}

          <div ref={endRef} />
        </div>

        <form
          onSubmit={handleSubmit}
          className="p-4 border-t border-slate-800 bg-[#0B1120] flex items-center gap-3"
        >
          <input
            type="text"
            value={input}
            maxLength={2000}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about a warning light, trouble code (e.g. P0300), or maintenance schedule..."
            className="flex-1 px-4 py-2.5 rounded-xl bg-[#0F172A] border border-slate-700 focus:border-blue-500 focus:outline-none text-sm text-white"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-sm font-semibold text-white min-h-[44px]"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">Send</span>
          </button>
        </form>
      </section>
    </div>
  );
}
