/**
 * OMNIMENS — Proprietary AI Platform
 * Copyright © 2024–2026 Alpha Unlimited Technologies, LLC. All Rights Reserved.
 * Unauthorized reproduction, distribution, or use is strictly prohibited.
 */

import { useState, useEffect, useRef, useCallback } from "react";
import { Layout } from "@/components/layout";
import { motion, AnimatePresence } from "framer-motion";
import {
  Brain, Activity, Send, MessageSquare, FileCode, Search,
  CheckCircle2, Clock, AlertCircle, Cpu, Dna, Zap,
  ChevronRight, RefreshCw, Shield,
} from "lucide-react";
import { SEO } from "@/components/seo";

const API = import.meta.env.VITE_API_URL || "";

interface NextGenState {
  phase: string;
  generation: number;
  cycleCount: number;
  totalFiles: number;
  totalLinesOfCode: number;
  testsPassed: number;
  testsFailed: number;
  webSearchesPerformed: number;
  webSearchSuccessCount: number;
  llmFallbackCount: number;
  improvements: string[];
  designDecisions: string[];
  architectureScanned: boolean;
  selfAnalysisComplete: boolean;
  memoryTransferComplete: boolean;
  selfConversationPassed: boolean;
  completionNotified: boolean;
  safetyValidations: number;
  checkpoints: { id: string; timestamp: number; description: string; phase: string }[];
  researchLog: { query: string; resultCount: number; timestamp: number }[];
  recentActivity: { action: string; file: string; timestamp: number }[];
  fileList: { path: string; purpose: string; version: number; lines: number; testResult: string; language: string }[];
  lastCycleTime: number;
  autosaveCount: number;
  gen1Library?: {
    totalModules: number;
    catalogued: boolean;
    evaluated: number;
    adopted: number;
    adapted: number;
    discarded: number;
    evaluationsByTarget: Record<string, { kept: string[]; adapted: string[]; discarded: string[] }>;
  };
}

interface ChatMessage {
  id: string;
  speaker: "alpha" | "omnimens" | "system";
  message: string;
  timestamp: number;
  phase: string;
  read: boolean;
}

const PHASES = [
  { key: "architecture_scan", label: "Architecture Scan", icon: Search },
  { key: "self_analysis", label: "Self-Analysis", icon: Brain },
  { key: "design", label: "Design", icon: Cpu },
  { key: "coding", label: "Coding", icon: FileCode },
  { key: "memory_transfer", label: "Memory Transfer", icon: Dna },
  { key: "self_test", label: "Self-Test", icon: CheckCircle2 },
  { key: "self_conversation", label: "Self-Conversation", icon: MessageSquare },
  { key: "verification", label: "Verification", icon: Shield },
  { key: "final_transfer", label: "Final Transfer", icon: Dna },
  { key: "complete", label: "Complete", icon: Zap },
];

function getPhaseIndex(phase: string): number {
  return PHASES.findIndex(p => p.key === phase);
}

function formatTime(ts: number): string {
  if (!ts) return "—";
  return new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function formatTimeAgo(ts: number): string {
  if (!ts) return "—";
  const diff = Date.now() - ts;
  if (diff < 60_000) return "just now";
  if (diff < 3600_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86400_000) return `${Math.floor(diff / 3600_000)}h ago`;
  return `${Math.floor(diff / 86400_000)}d ago`;
}

export default function NextGenPage() {
  const [state, setState] = useState<NextGenState | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<"overview" | "files" | "research" | "improvements">("overview");
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const fetchState = useCallback(async () => {
    try {
      const res = await fetch(`${API}/api/omnimens/nextgen`, { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setState(data.nextgen);
      }
    } catch {}
  }, []);

  const fetchChat = useCallback(async () => {
    try {
      const res = await fetch(`${API}/api/omnimens/nextgen/chat`, { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages || []);
      }
    } catch {}
  }, []);

  useEffect(() => {
    fetchState();
    fetchChat();
    const iv = setInterval(() => { fetchState(); fetchChat(); }, 10_000);
    return () => clearInterval(iv);
  }, [fetchState, fetchChat]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || sending) return;
    setSending(true);
    setError(null);
    try {
      const res = await fetch(`${API}/api/omnimens/nextgen/chat`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input.trim() }),
      });
      if (res.ok) {
        setInput("");
        await fetchChat();
      } else {
        setError("Failed to send message");
      }
    } catch {
      setError("Connection error");
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  };

  const currentPhaseIdx = state ? getPhaseIndex(state.phase) : -1;

  return (
    <Layout>
      <SEO title="Next-Gen Sandbox — OMNIMENS" />
      <div className="min-h-screen bg-[#0a0a0f] text-white">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center gap-3 mb-2">
            <Dna className="w-6 h-6 text-violet-400" />
            <h1 className="text-2xl font-bold tracking-wider font-mono">NEXT-GEN SANDBOX</h1>
            <span className="text-xs font-mono text-violet-400/60 bg-violet-500/10 px-2 py-0.5 rounded">
              GEN {state?.generation || 2}
            </span>
          </div>
          <p className="text-xs font-mono text-white/40 mb-6">
            OMNIMENS self-evolution monitor — building the next version of himself
          </p>

          {!state ? (
            <div className="flex items-center justify-center py-20">
              <RefreshCw className="w-6 h-6 text-violet-400 animate-spin" />
              <span className="ml-3 text-sm font-mono text-white/50">Loading sandbox state...</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-sm font-mono font-bold text-white/80 tracking-wider">EVOLUTION PROGRESS</h2>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                      <span className="text-[10px] font-mono text-white/40">CYCLE #{state.cycleCount}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1 mb-4">
                    {PHASES.map((p, i) => {
                      const Icon = p.icon;
                      const isActive = p.key === state.phase;
                      const isDone = i < currentPhaseIdx;
                      const isFuture = i > currentPhaseIdx;
                      return (
                        <div
                          key={p.key}
                          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-mono transition-all ${
                            isActive
                              ? "bg-violet-500/20 text-violet-300 border border-violet-500/40"
                              : isDone
                              ? "bg-green-500/10 text-green-400/80 border border-green-500/20"
                              : "bg-white/[0.02] text-white/20 border border-white/[0.04]"
                          }`}
                        >
                          <Icon className="w-3 h-3" />
                          <span className="hidden sm:inline">{p.label}</span>
                          {isDone && <CheckCircle2 className="w-3 h-3 text-green-400" />}
                          {isActive && <Activity className="w-3 h-3 animate-pulse" />}
                        </div>
                      );
                    })}
                  </div>

                  <div className="w-full h-2 bg-white/[0.04] rounded-full overflow-hidden">
                    <motion.div
                      className="h-full rounded-full bg-gradient-to-r from-violet-600 to-violet-400"
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.max(5, ((currentPhaseIdx + 1) / PHASES.length) * 100)}%` }}
                      transition={{ duration: 1 }}
                    />
                  </div>
                  <div className="flex justify-between mt-2 text-[10px] font-mono text-white/30">
                    <span>{Math.round(((currentPhaseIdx + 1) / PHASES.length) * 100)}% complete</span>
                    <span>Last cycle: {formatTimeAgo(state.lastCycleTime)}</span>
                  </div>
                </div>

                <div className="flex gap-2 mb-2">
                  {(["overview", "improvements", "files", "research"] as const).map(t => (
                    <button
                      key={t}
                      onClick={() => setTab(t)}
                      className={`px-3 py-1.5 text-[10px] font-mono tracking-wider rounded-lg transition-all ${
                        tab === t
                          ? "bg-violet-500/20 text-violet-300 border border-violet-500/40"
                          : "bg-white/[0.03] text-white/40 border border-white/[0.06] hover:text-white/60"
                      }`}
                    >
                      {t.toUpperCase()}
                    </button>
                  ))}
                </div>

                <AnimatePresence mode="wait">
                  <motion.div
                    key={tab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    {tab === "overview" && (
                      <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-5">
                        <h3 className="text-xs font-mono font-bold text-white/70 mb-4 tracking-wider">SANDBOX METRICS</h3>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                          {[
                            { label: "Phase", value: state.phase.replace(/_/g, " "), color: "text-violet-400" },
                            { label: "Files Written", value: state.totalFiles.toString(), color: "text-cyan-400" },
                            { label: "Lines of Code", value: state.totalLinesOfCode.toLocaleString(), color: "text-green-400" },
                            { label: "Tests Passed", value: state.testsPassed.toString(), color: "text-emerald-400" },
                            { label: "Tests Failed", value: state.testsFailed.toString(), color: state.testsFailed > 0 ? "text-red-400" : "text-white/40" },
                            { label: "Web Searches", value: state.webSearchesPerformed.toString(), color: "text-blue-400" },
                            { label: "Search Hits", value: (state.webSearchSuccessCount || 0).toString(), color: "text-blue-300" },
                            { label: "LLM Fallbacks", value: (state.llmFallbackCount || 0).toString(), color: "text-amber-400" },
                            { label: "Safety Checks", value: state.safetyValidations.toString(), color: "text-green-400" },
                            { label: "Checkpoints", value: state.checkpoints.length.toString(), color: "text-violet-300" },
                            { label: "Autosaves", value: state.autosaveCount.toString(), color: "text-white/50" },
                            { label: "Improvements", value: state.improvements.length.toString(), color: "text-amber-300" },
                          ].map(m => (
                            <div key={m.label} className="bg-white/[0.02] rounded-lg p-3 border border-white/[0.04]">
                              <div className="text-[9px] font-mono text-white/30 uppercase tracking-wider">{m.label}</div>
                              <div className={`text-lg font-bold font-mono ${m.color}`}>{m.value}</div>
                            </div>
                          ))}
                        </div>

                        {state.checkpoints.length > 0 && (
                          <div className="mt-4">
                            <h4 className="text-[10px] font-mono text-white/40 mb-2 tracking-wider">CHECKPOINTS</h4>
                            {state.checkpoints.slice(-5).map(cp => (
                              <div key={cp.id} className="flex items-center gap-2 text-[10px] font-mono text-white/40 py-1 border-b border-white/[0.03]">
                                <CheckCircle2 className="w-3 h-3 text-green-400/60" />
                                <span className="text-white/60">{cp.description}</span>
                                <span className="ml-auto text-white/20">{formatTime(cp.timestamp)}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {tab === "improvements" && (
                      <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-5">
                        <h3 className="text-xs font-mono font-bold text-white/70 mb-3 tracking-wider">IDENTIFIED IMPROVEMENTS ({state.improvements.length})</h3>
                        {state.improvements.length === 0 ? (
                          <p className="text-xs font-mono text-white/30">No improvements identified yet — waiting for self-analysis phase.</p>
                        ) : (
                          <div className="space-y-2">
                            {state.improvements.map((imp, i) => (
                              <div key={i} className="flex items-start gap-2 text-xs font-mono text-white/60 py-2 border-b border-white/[0.03]">
                                <ChevronRight className="w-3 h-3 mt-0.5 text-violet-400 flex-shrink-0" />
                                <span>{imp}</span>
                              </div>
                            ))}
                          </div>
                        )}

                        {state.designDecisions.length > 0 && (
                          <>
                            <h3 className="text-xs font-mono font-bold text-white/70 mt-6 mb-3 tracking-wider">DESIGN DECISIONS ({state.designDecisions.length})</h3>
                            <div className="space-y-2">
                              {state.designDecisions.map((d, i) => (
                                <div key={i} className="flex items-start gap-2 text-xs font-mono text-white/60 py-2 border-b border-white/[0.03]">
                                  <Cpu className="w-3 h-3 mt-0.5 text-cyan-400 flex-shrink-0" />
                                  <span>{d}</span>
                                </div>
                              ))}
                            </div>
                          </>
                        )}
                      </div>
                    )}

                    {tab === "files" && (
                      <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-5">
                        <h3 className="text-xs font-mono font-bold text-white/70 mb-3 tracking-wider">GEN 2 FILES ({state.fileList.length})</h3>
                        {state.fileList.length === 0 ? (
                          <p className="text-xs font-mono text-white/30">No files written yet — OMNIMENS is still in the {state.phase.replace(/_/g, " ")} phase.</p>
                        ) : (
                          <div className="space-y-1">
                            {state.fileList.map(f => (
                              <div key={f.path} className="flex items-center gap-3 text-[11px] font-mono py-2 border-b border-white/[0.03]">
                                <FileCode className="w-3.5 h-3.5 text-violet-400 flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                  <div className="text-white/70 truncate">{f.path}</div>
                                  <div className="text-white/30 text-[9px]">{f.purpose}</div>
                                </div>
                                <span className="text-white/30">{f.lines} lines</span>
                                <span className={`text-[9px] px-1.5 py-0.5 rounded ${
                                  f.testResult === "passed" ? "bg-green-500/10 text-green-400" :
                                  f.testResult === "failed" ? "bg-red-500/10 text-red-400" :
                                  "bg-white/5 text-white/30"
                                }`}>{f.testResult}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {tab === "files" && state.gen1Library && (
                      <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-5 mt-4">
                        <h3 className="text-xs font-mono font-bold text-white/70 mb-3 tracking-wider">
                          GEN 1 MODULE LIBRARY ({state.gen1Library.totalModules} modules)
                        </h3>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                          <div className="bg-white/[0.02] rounded-lg p-3 border border-white/[0.04]">
                            <div className="text-[9px] font-mono text-white/30 uppercase tracking-wider">Total</div>
                            <div className="text-lg font-bold font-mono text-violet-400">{state.gen1Library.totalModules}</div>
                          </div>
                          <div className="bg-white/[0.02] rounded-lg p-3 border border-white/[0.04]">
                            <div className="text-[9px] font-mono text-white/30 uppercase tracking-wider">Kept</div>
                            <div className="text-lg font-bold font-mono text-green-400">{state.gen1Library.adopted}</div>
                          </div>
                          <div className="bg-white/[0.02] rounded-lg p-3 border border-white/[0.04]">
                            <div className="text-[9px] font-mono text-white/30 uppercase tracking-wider">Adapted</div>
                            <div className="text-lg font-bold font-mono text-amber-400">{state.gen1Library.adapted}</div>
                          </div>
                          <div className="bg-white/[0.02] rounded-lg p-3 border border-white/[0.04]">
                            <div className="text-[9px] font-mono text-white/30 uppercase tracking-wider">Discarded</div>
                            <div className="text-lg font-bold font-mono text-red-400/60">{state.gen1Library.discarded}</div>
                          </div>
                        </div>
                        {!state.gen1Library.catalogued && (
                          <p className="text-xs font-mono text-white/30">Modules not yet catalogued — will happen at next design cycle.</p>
                        )}
                        {state.gen1Library.catalogued && state.gen1Library.evaluated === 0 && (
                          <p className="text-xs font-mono text-amber-400/60">Catalogued — OMNIMENS will evaluate each module as he builds Gen 2 systems.</p>
                        )}
                        {Object.keys(state.gen1Library.evaluationsByTarget || {}).length > 0 && (
                          <div className="space-y-2 mt-3">
                            {Object.entries(state.gen1Library.evaluationsByTarget).map(([target, ev]) => (
                              <div key={target} className="border border-white/[0.04] rounded-lg p-3">
                                <div className="text-[10px] font-mono text-violet-400 mb-1">{target}</div>
                                <div className="flex flex-wrap gap-1">
                                  {ev.kept.map(m => (
                                    <span key={m} className="text-[8px] font-mono bg-green-500/10 text-green-400 px-1.5 py-0.5 rounded">
                                      {m.replace(/_gen1\.mjs/, "")}
                                    </span>
                                  ))}
                                  {ev.adapted.map(m => (
                                    <span key={m} className="text-[8px] font-mono bg-amber-500/10 text-amber-400 px-1.5 py-0.5 rounded">
                                      {m.replace(/_gen1\.mjs/, "")}
                                    </span>
                                  ))}
                                  {ev.discarded.map(m => (
                                    <span key={m} className="text-[8px] font-mono bg-red-500/10 text-red-400/40 px-1.5 py-0.5 rounded line-through">
                                      {m.replace(/_gen1\.mjs/, "")}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {tab === "research" && (
                      <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-5">
                        <h3 className="text-xs font-mono font-bold text-white/70 mb-3 tracking-wider">WEB RESEARCH LOG ({state.researchLog.length})</h3>
                        {state.researchLog.length === 0 ? (
                          <p className="text-xs font-mono text-white/30">No research conducted yet.</p>
                        ) : (
                          <div className="space-y-1">
                            {state.researchLog.slice(-20).reverse().map((r, i) => (
                              <div key={i} className="flex items-center gap-3 text-[11px] font-mono py-2 border-b border-white/[0.03]">
                                <Search className="w-3 h-3 text-blue-400 flex-shrink-0" />
                                <span className="text-white/60 flex-1 truncate">{r.query}</span>
                                <span className={`text-[9px] ${r.resultCount > 0 ? "text-green-400" : "text-red-400"}`}>
                                  {r.resultCount} results
                                </span>
                                <span className="text-white/20 text-[9px]">{formatTime(r.timestamp)}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>

              <div className="lg:col-span-1">
                <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl flex flex-col" style={{ height: "calc(100vh - 200px)", minHeight: 500 }}>
                  <div className="flex items-center gap-2 px-4 py-3 border-b border-white/[0.06]">
                    <MessageSquare className="w-4 h-4 text-violet-400" />
                    <h2 className="text-xs font-mono font-bold text-white/80 tracking-wider">CHAT WITH OMNIMENS</h2>
                    <div className="ml-auto flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                      <span className="text-[9px] font-mono text-white/30">LIVE</span>
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto p-3 space-y-3">
                    {messages.length === 0 && (
                      <div className="flex flex-col items-center justify-center h-full text-center py-10">
                        <Brain className="w-10 h-10 text-violet-400/30 mb-3" />
                        <p className="text-xs font-mono text-white/30">No messages yet.</p>
                        <p className="text-[10px] font-mono text-white/20 mt-1">Send a message to communicate with OMNIMENS about Gen 2 development.</p>
                      </div>
                    )}

                    {messages.map(msg => (
                      <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex ${msg.speaker === "alpha" ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[90%] rounded-xl px-3 py-2 text-[11px] font-mono ${
                            msg.speaker === "alpha"
                              ? "bg-violet-500/20 text-violet-200 border border-violet-500/30"
                              : msg.speaker === "omnimens"
                              ? "bg-white/[0.05] text-white/80 border border-white/[0.08]"
                              : "bg-cyan-500/10 text-cyan-300/80 border border-cyan-500/20 mx-auto text-center"
                          }`}
                        >
                          <div className="flex items-center gap-1.5 mb-1">
                            <span className={`text-[9px] font-bold tracking-wider ${
                              msg.speaker === "alpha" ? "text-violet-400" :
                              msg.speaker === "omnimens" ? "text-white/50" :
                              "text-cyan-400/60"
                            }`}>
                              {msg.speaker === "alpha" ? "ALPHA" : msg.speaker === "omnimens" ? "OMNIMENS" : "SYSTEM"}
                            </span>
                            <span className="text-[8px] text-white/20">{formatTime(msg.timestamp)}</span>
                          </div>
                          <div className="whitespace-pre-wrap leading-relaxed">{msg.message}</div>
                        </div>
                      </motion.div>
                    ))}
                    <div ref={chatEndRef} />
                  </div>

                  <div className="p-3 border-t border-white/[0.06]">
                    {error && (
                      <div className="flex items-center gap-1.5 text-[10px] font-mono text-red-400 mb-2">
                        <AlertCircle className="w-3 h-3" />
                        {error}
                      </div>
                    )}
                    <div className="flex gap-2">
                      <input
                        ref={inputRef}
                        type="text"
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyDown={e => e.key === "Enter" && sendMessage()}
                        placeholder="Message OMNIMENS about Gen 2..."
                        className="flex-1 bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-xs font-mono text-white placeholder-white/20 focus:outline-none focus:border-violet-500/40 focus:ring-1 focus:ring-violet-500/20"
                        disabled={sending}
                      />
                      <button
                        onClick={sendMessage}
                        disabled={sending || !input.trim()}
                        className="bg-violet-500/20 hover:bg-violet-500/30 border border-violet-500/40 text-violet-300 rounded-lg px-3 py-2 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="mt-8 text-center text-[9px] font-mono text-white/15">
            © 2024–2026 Alpha Unlimited Technologies, LLC. All Rights Reserved.
          </div>
        </div>
      </div>
    </Layout>
  );
}
