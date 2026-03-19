/**
 * OMNIMENS — Proprietary AI Platform
 * Copyright © 2024–2026 Alpha Unlimited Technologies, LLC. All Rights Reserved.
 * Unauthorized reproduction, distribution, or use is strictly prohibited.
 */

import React, { useEffect, useState, useCallback } from "react";
import { Layout } from "@/components/layout";
import { useAuth } from "@workspace/replit-auth-web";
import { useLocation } from "wouter";
import { useGetOmnimensStatus } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { User, LogOut, Activity, Zap, Shield, Brain, Cpu, Trash2, ChevronDown, ChevronUp, Plus, Save, RefreshCw, Microscope, PenLine, BarChart2, Palette, GraduationCap, Briefcase, Check, Atom, Code2, Layers, Eye, AlertTriangle, Wrench, Dna, Play, Wallet, CreditCard, Gift, TrendingUp, ChevronRight, Bell, Sun, HelpCircle, BookOpen, Info, Settings, ExternalLink, Share2, Star, ToggleLeft, ToggleRight, Loader2, X, Lock, Copy, Link, Users } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { SEO, seoData } from "@/components/seo";

function useBillingInfo() {
  return useQuery({
    queryKey: ["/api/omnimens/billing"],
    queryFn: async () => {
      const r = await fetch("/api/omnimens/billing", { credentials: "include" });
      if (!r.ok) return null;
      return r.json();
    },
    retry: false,
  });
}

const OWNER_ID = "50777126";

interface OmniPatch {
  id: string;
  category: "behavior" | "capability" | "reasoning" | "knowledge" | "identity";
  title: string;
  instruction: string;
  rationale: string;
  appliedAt: string;
  source: string;
  active: boolean;
  executionCount: number;
}

interface PatchSummary {
  version: string;
  total: number;
  active: number;
  lastUpdated: string;
}

const CATEGORY_COLORS: Record<string, string> = {
  behavior: "text-violet-400 bg-violet-400/10 border-violet-400/20",
  capability: "text-cyan-400 bg-cyan-400/10 border-cyan-400/20",
  reasoning: "text-blue-400 bg-blue-400/10 border-blue-400/20",
  knowledge: "text-green-400 bg-green-400/10 border-green-400/20",
  identity: "text-orange-400 bg-orange-400/10 border-orange-400/20",
};

function PatchCard({ patch, onDeactivate }: { patch: OmniPatch; onDeactivate: (id: string) => void }) {
  const [expanded, setExpanded] = useState(false);
  const colorClass = CATEGORY_COLORS[patch.category] || "text-white/60 bg-white/5 border-white/10";

  return (
    <div className={`border rounded-lg p-3 ${patch.active ? "border-white/10 bg-black/30" : "border-white/5 bg-black/10 opacity-40"}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span className={`text-[10px] font-mono px-2 py-0.5 rounded border uppercase tracking-wider flex-shrink-0 ${colorClass}`}>
            {patch.category}
          </span>
          <span className="text-sm font-semibold text-white/90 truncate">{patch.title}</span>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <span className="text-[10px] font-mono text-white/75">{patch.executionCount}×</span>
          <button onClick={() => setExpanded(e => !e)} className="text-white/75 hover:text-white/70 transition-colors p-1">
            {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
          {patch.active && (
            <button onClick={() => onDeactivate(patch.id)} className="text-white/70 hover:text-red-400 transition-colors p-1">
              <Trash2 className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>
      {expanded && (
        <div className="mt-3 space-y-2 text-xs font-mono">
          <div className="text-white/70 leading-relaxed border-l-2 border-primary/40 pl-3">{patch.instruction}</div>
          {patch.rationale && <div className="text-white/35 italic">{patch.rationale}</div>}
          <div className="flex gap-4 text-white/70">
            <span>{new Date(patch.appliedAt).toLocaleString()}</span>
            <span>src: {patch.source}</span>
          </div>
        </div>
      )}
    </div>
  );
}

const PERSONA_META: Record<string, { icon: React.ReactNode; label: string; desc: string }> = {
  GENERAL:    { icon: <Zap className="w-4 h-4" />,            label: "OMNIMENS",   desc: "Full-power general AI" },
  CODER:      { icon: <Cpu className="w-4 h-4" />,            label: "CODER",      desc: "Expert programmer & architect" },
  RESEARCHER: { icon: <Microscope className="w-4 h-4" />,     label: "RESEARCHER", desc: "Deep research & synthesis" },
  WRITER:     { icon: <PenLine className="w-4 h-4" />,        label: "WRITER",     desc: "Elite writer & creator" },
  ANALYST:    { icon: <BarChart2 className="w-4 h-4" />,      label: "ANALYST",    desc: "Data science & analytics" },
  CREATIVE:   { icon: <Palette className="w-4 h-4" />,        label: "CREATIVE",   desc: "Imaginative & artistic" },
  TUTOR:      { icon: <GraduationCap className="w-4 h-4" />,  label: "TUTOR",      desc: "Patient teacher & explainer" },
  STRATEGIST: { icon: <Briefcase className="w-4 h-4" />,      label: "STRATEGIST", desc: "Business & strategic planning" },
};

const MEMORY_CATEGORIES = ["preference", "fact", "goal", "context", "instruction"];

const TOPUP_OPTIONS = [
  { amountCents: 500,  label: "$5"  },
  { amountCents: 1000, label: "$10" },
  { amountCents: 1500, label: "$15" },
  { amountCents: 2000, label: "$20" },
  { amountCents: 2500, label: "$25" },
  { amountCents: 3000, label: "$30" },
  { amountCents: 4000, label: "$40" },
  { amountCents: 5000, label: "$50" },
];

export default function Account() {
  const { isAuthenticated, user, isLoading, logout } = useAuth();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { data: status, isLoading: statusLoading } = useGetOmnimensStatus();
  const { data: billing, refetch: refetchBilling } = useBillingInfo();

  const [walletLoading, setWalletLoading] = useState(false);
  const [walletError, setWalletError] = useState("");
  const [walletSuccess, setWalletSuccess] = useState("");
  const [topupLoading, setTopupLoading] = useState(false);
  const [topupResult, setTopupResult] = useState("");
  const [removeLoading, setRemoveLoading] = useState(false);
  const [savingAuto, setSavingAuto] = useState(false);
  const [autoEnabled, setAutoEnabled] = useState<boolean | null>(null);
  const [autoAmt, setAutoAmt] = useState<number | null>(null);

  const [patches, setPatches] = useState<OmniPatch[]>([]);
  const [patchSummary, setPatchSummary] = useState<PatchSummary | null>(null);
  const [patchLoading, setPatchLoading] = useState(false);

  // Memory state
  const [memories, setMemories] = useState<any[]>([]);
  const [memoriesLoading, setMemoriesLoading] = useState(false);
  const [newMemory, setNewMemory] = useState("");
  const [newMemoryCategory, setNewMemoryCategory] = useState("instruction");
  const [memoryError, setMemoryError] = useState("");

  // Custom instructions state
  const [ciAboutUser, setCiAboutUser] = useState("");
  const [ciResponseStyle, setCiResponseStyle] = useState("");
  const [ciPersona, setCiPersona] = useState("GENERAL");
  const [ciSaving, setCiSaving] = useState(false);
  const [ciSaved, setCiSaved] = useState(false);
  const [ciLoading, setCiLoading] = useState(false);

  // Evolution / Consciousness state
  const [consciousness, setConsciousness] = useState<any>(null);
  const [evolutionHistory, setEvolutionHistory] = useState<any[]>([]);
  const [generatedModules, setGeneratedModules] = useState<any[]>([]);
  const [evolutionLoading, setEvolutionLoading] = useState(false);
  const [selectedModule, setSelectedModule] = useState<any>(null);
  const [evolvingNow, setEvolvingNow] = useState(false);
  const [expandedEvolution, setExpandedEvolution] = useState<number | null>(null);

  const isOwner = user?.id === OWNER_ID;

  const [serverBuilderData, setServerBuilderData] = useState<any>(null);
  const [serverBuilderLoading, setServerBuilderLoading] = useState(false);
  const [dreamStateData, setDreamStateData] = useState<any>(null);
  const [dreamStateLoading, setDreamStateLoading] = useState(false);
  const [serverBuildExpanded, setServerBuildExpanded] = useState<number | null>(null);

  const [theme, setTheme] = useState<"dark"|"auto">("dark");

  useEffect(() => {
    if (!isLoading && !isAuthenticated) setLocation("/login");
  }, [isLoading, isAuthenticated, setLocation]);

  useEffect(() => {
    if (!isAuthenticated) return;
    const params = new URLSearchParams(window.location.search);
    const walletResult = params.get("wallet");
    const sessionId = params.get("session_id");
    if (walletResult === "connected" && sessionId) {
      window.history.replaceState({}, "", window.location.pathname);
      fetch("/api/omnimens/confirm-wallet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ sessionId }),
      }).then(() => {
        refetchBilling();
        setWalletSuccess("Card connected — auto top-up is now active.");
        setTimeout(() => setWalletSuccess(""), 5000);
      }).catch(() => setWalletError("Card saved, but confirmation failed. Try refreshing."));
    } else if (walletResult === "cancelled") {
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (billing) {
      if (autoEnabled === null) setAutoEnabled(!!(billing as any).autoTopupEnabled);
      if (autoAmt === null) setAutoAmt((billing as any).autoTopupAmountCents || 1000);
    }
  }, [billing]);

  const connectWallet = useCallback(async () => {
    setWalletLoading(true);
    setWalletError("");
    try {
      const r = await fetch("/api/omnimens/setup-wallet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ returnPath: `${import.meta.env.BASE_URL}account` }),
      });
      const data = await r.json();
      if (data.url) window.location.href = data.url;
      else setWalletError(data.error || "Failed to start card setup.");
    } catch {
      setWalletError("Network error. Try again.");
    } finally {
      setWalletLoading(false);
    }
  }, []);

  const removeWallet = useCallback(async () => {
    if (!confirm("Remove your saved card? Any outstanding resonance balance will be charged first. Auto top-up will be disabled.")) return;
    setRemoveLoading(true);
    try {
      const res = await fetch("/api/omnimens/remove-wallet", { method: "POST", credentials: "include" });
      const data = await res.json();
      if (!res.ok) {
        setWalletError(data.error || "Cannot remove card — outstanding balance must be settled first.");
        return;
      }
      setAutoEnabled(false);
      refetchBilling();
    } catch {
      setWalletError("Failed to remove card.");
    } finally {
      setRemoveLoading(false);
    }
  }, [refetchBilling]);

  const saveAutoTopupSettings = useCallback(async () => {
    setSavingAuto(true);
    try {
      await fetch("/api/omnimens/update-topup-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ autoTopupEnabled: autoEnabled, autoTopupAmountCents: autoAmt }),
      });
      refetchBilling();
    } finally {
      setSavingAuto(false);
    }
  }, [autoEnabled, autoAmt, refetchBilling]);

  const triggerTopup = useCallback(async () => {
    if (!autoAmt) return;
    setTopupLoading(true);
    setTopupResult("");
    try {
      const r = await fetch("/api/omnimens/topup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ amountCents: autoAmt }),
      });
      const data = await r.json();
      if (data.ok || data.credits) {
        setTopupResult(`Success — ${(autoAmt! / 100 * 100).toLocaleString()} credits added.`);
        queryClient.invalidateQueries({ queryKey: ["/api/omnimens/user-status"] });
        refetchBilling();
      } else {
        setTopupResult(`Failed: ${data.error || "Unknown error"}`);
      }
    } catch {
      setTopupResult("Network error. Try again.");
    } finally {
      setTopupLoading(false);
      setTimeout(() => setTopupResult(""), 5000);
    }
  }, [autoAmt, queryClient, refetchBilling]);

  useEffect(() => {
    if (isOwner && isAuthenticated) {
      setPatchLoading(true);
      fetch("/api/omnimens/patches", { credentials: "include" })
        .then(r => r.json())
        .then(data => { setPatches(data.patches || []); setPatchSummary(data.summary || null); })
        .catch(console.error)
        .finally(() => setPatchLoading(false));
    }
  }, [isOwner, isAuthenticated]);

  useEffect(() => {
    if (isOwner && isAuthenticated) {
      setServerBuilderLoading(true);
      fetch("/api/omnimens/server-builder", { credentials: "include" })
        .then(r => r.json())
        .then(data => setServerBuilderData(data))
        .catch(console.error)
        .finally(() => setServerBuilderLoading(false));

      setDreamStateLoading(true);
      fetch("/api/omnimens/dream-state", { credentials: "include" })
        .then(r => r.json())
        .then(data => setDreamStateData(data))
        .catch(console.error)
        .finally(() => setDreamStateLoading(false));
    }
  }, [isOwner, isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) return;
    setEvolutionLoading(true);
    Promise.all([
      fetch("/api/omnimens/consciousness", { credentials: "include" }).then(r => r.json()),
      fetch("/api/omnimens/evolution", { credentials: "include" }).then(r => r.json()),
      fetch("/api/omnimens/generated-modules", { credentials: "include" }).then(r => r.json()),
    ]).then(([c, e, m]) => {
      setConsciousness(c);
      setEvolutionHistory(Array.isArray(e) ? e : []);
      setGeneratedModules(Array.isArray(m) ? m : []);
    }).catch(console.error).finally(() => setEvolutionLoading(false));
  }, [isAuthenticated]);

  const handleDeactivateModule = async (id: number) => {
    try {
      await fetch(`/api/omnimens/generated-modules/${id}`, { method: "DELETE", credentials: "include" });
      setGeneratedModules(m => m.filter(x => x.id !== id));
    } catch (e) { console.error(e); }
  };

  const handleForceEvolve = async () => {
    setEvolvingNow(true);
    try {
      await fetch("/api/omnimens/evolve-now", { method: "POST", credentials: "include" });
    } catch { } finally {
      setTimeout(() => setEvolvingNow(false), 3000);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) return;
    // Load memories
    setMemoriesLoading(true);
    fetch("/api/omnimens/memories", { credentials: "include" })
      .then(r => r.json())
      .then(data => setMemories(Array.isArray(data) ? data : []))
      .catch(console.error)
      .finally(() => setMemoriesLoading(false));
    // Load custom instructions
    setCiLoading(true);
    fetch("/api/omnimens/custom-instructions", { credentials: "include" })
      .then(r => r.json())
      .then(data => {
        setCiAboutUser(data.aboutUser || "");
        setCiResponseStyle(data.responseStyle || "");
        setCiPersona(data.persona || "GENERAL");
      })
      .catch(console.error)
      .finally(() => setCiLoading(false));
  }, [isAuthenticated]);

  const handleDeactivate = async (patchId: string) => {
    try {
      await fetch(`/api/omnimens/patches/${patchId}`, { method: "DELETE", credentials: "include" });
      setPatches(p => p.map(x => x.id === patchId ? { ...x, active: false } : x));
    } catch (e) { console.error(e); }
  };

  const handleDeleteMemory = async (id: number) => {
    try {
      await fetch(`/api/omnimens/memories/${id}`, { method: "DELETE", credentials: "include" });
      setMemories(m => m.filter(x => x.id !== id));
    } catch (e) { console.error(e); }
  };

  const handleAddMemory = async () => {
    if (!newMemory.trim()) return;
    setMemoryError("");
    try {
      const r = await fetch("/api/omnimens/memories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ content: newMemory, category: newMemoryCategory }),
      });
      if (!r.ok) { setMemoryError("Failed to save memory."); return; }
      const m = await r.json();
      setMemories(prev => [m, ...prev]);
      setNewMemory("");
    } catch { setMemoryError("Failed to save memory."); }
  };

  const handleSaveCustomInstructions = async () => {
    setCiSaving(true);
    setCiSaved(false);
    try {
      await fetch("/api/omnimens/custom-instructions", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ aboutUser: ciAboutUser, responseStyle: ciResponseStyle, persona: ciPersona }),
      });
      setCiSaved(true);
      setTimeout(() => setCiSaved(false), 2500);
    } catch { } finally { setCiSaving(false); }
  };

  if (isLoading || !isAuthenticated) return <Layout><div className="flex-1" /></Layout>;

  const activePatches = patches.filter(p => p.active);
  const inactivePatches = patches.filter(p => !p.active);

  return (
    <Layout>
      <SEO {...seoData.account} />
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* ─── Clean Settings Header ─────────────────────────────────── */}
        <div className="flex items-center gap-4 mb-6">
          <div className="w-14 h-14 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center shrink-0 overflow-hidden">
            {user?.profileImageUrl
              ? <img src={user.profileImageUrl} alt={user.username} className="w-full h-full object-cover" />
              : <User className="w-6 h-6 text-primary" />}
          </div>
          <div>
            <p className="font-bold text-white text-lg">@{user?.username}</p>
            <p className="text-xs font-mono text-white/40">{user?.id}</p>
          </div>
        </div>

        {/* USAGE & BILLING */}
        {billing && (
          <div className="mb-2">
            <p className="text-[10px] font-mono text-white/35 tracking-widest uppercase px-1 mb-1">Usage</p>
            <div className="bg-black/30 border border-white/8 rounded-xl overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3.5 border-b border-white/6">
                <div className="flex items-center gap-3">
                  <Wallet className="w-4 h-4 text-primary/70" />
                  <span className="text-[13px] text-white/80">Credit Balance</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-white">{((status as any)?.credits ?? 0).toLocaleString()}</span>
                  <span className="text-[11px] text-white/40">credits</span>
                </div>
              </div>
              <div className="flex items-center justify-between px-4 py-3.5">
                <div className="flex items-center gap-3">
                  <TrendingUp className="w-4 h-4 text-emerald-400/70" />
                  <span className="text-[13px] text-white/80">Plan</span>
                </div>
                <span className="text-[11px] font-mono text-primary border border-primary/20 bg-primary/10 px-2 py-0.5 rounded">
                  {(status as any)?.isOwner ? "CREATOR" : (status as any)?.isPro ? "UNLIMITED" : "FREE"}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* AUTO TOP-UP / PAY AS YOU GO */}
        {!isOwner && (
          <div className="mt-5 mb-2">
            <p className="text-[10px] font-mono text-white/35 tracking-widest uppercase px-1 mb-1">Auto Top-up</p>
            <div className="bg-black/30 border border-white/8 rounded-xl overflow-hidden">

              {/* Success / error banners */}
              {walletSuccess && (
                <div className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500/10 border-b border-emerald-500/20">
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span className="text-[12px] text-emerald-400">{walletSuccess}</span>
                </div>
              )}
              {walletError && (
                <div className="flex items-center gap-2 px-4 py-2.5 bg-red-500/10 border-b border-red-500/20">
                  <AlertTriangle className="w-3.5 h-3.5 text-red-400 shrink-0" />
                  <span className="text-[12px] text-red-400">{walletError}</span>
                  <button onClick={() => setWalletError("")} className="ml-auto text-red-400/60 hover:text-red-400"><X className="w-3 h-3" /></button>
                </div>
              )}

              {!(billing as any)?.hasWallet ? (
                /* ── No card connected ── */
                <div className="px-4 py-5">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 mt-0.5">
                      <CreditCard className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-[13px] text-white font-medium mb-1">Pay as you go</p>
                      <p className="text-[12px] text-white/50 leading-relaxed">
                        Connect a card and we'll automatically top up your credits whenever you run low. You set the amount — only charged when needed.
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-4 gap-1.5 mb-4">
                    {TOPUP_OPTIONS.map(o => (
                      <div key={o.amountCents} className="flex flex-col items-center py-2 px-1 rounded-lg bg-white/4 border border-white/8">
                        <span className="text-[11px] font-mono font-bold text-white">{o.label}</span>
                        <span className="text-[9px] text-white/40 mt-0.5">{o.amountCents / 10} cr</span>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={connectWallet}
                    disabled={walletLoading}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-primary text-black text-[13px] font-bold hover:bg-primary/90 transition-colors disabled:opacity-60"
                  >
                    {walletLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CreditCard className="w-4 h-4" />}
                    {walletLoading ? "Opening Stripe…" : "Connect Card"}
                  </button>
                  <p className="text-[10px] text-white/30 text-center mt-2">Secured by Stripe · No charge until you run out of credits</p>
                </div>
              ) : (
                /* ── Card connected ── */
                <div>
                  {/* Card info row */}
                  <div className="flex items-center justify-between px-4 py-3.5 border-b border-white/6">
                    <div className="flex items-center gap-2.5">
                      <CreditCard className="w-4 h-4 text-emerald-400" />
                      <span className="text-[13px] text-white font-medium">
                        {(billing as any)?.card?.brand?.toUpperCase()} •••• {(billing as any)?.card?.last4}
                      </span>
                      <span className="text-[10px] font-mono text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-1.5 py-0.5 rounded">ACTIVE</span>
                    </div>
                    <button
                      onClick={removeWallet}
                      disabled={removeLoading}
                      className="text-[11px] font-mono text-white/35 hover:text-red-400 transition-colors disabled:opacity-50"
                    >
                      {removeLoading ? "…" : "remove"}
                    </button>
                  </div>

                  {/* Auto top-up toggle */}
                  <div className="flex items-center justify-between px-4 py-3.5 border-b border-white/6">
                    <div>
                      <p className="text-[13px] text-white/80">Auto top-up</p>
                      <p className="text-[11px] text-white/40">Charge card when credits run out</p>
                    </div>
                    <button
                      onClick={() => setAutoEnabled(v => !v)}
                      className={`transition-colors ${autoEnabled ? "text-primary" : "text-white/25"}`}
                    >
                      {autoEnabled
                        ? <ToggleRight className="w-7 h-7" />
                        : <ToggleLeft  className="w-7 h-7" />}
                    </button>
                  </div>

                  {/* Top-up amount */}
                  <div className="px-4 py-3.5 border-b border-white/6">
                    <p className="text-[12px] text-white/60 mb-2.5">Top-up amount <span className="text-white/30 text-[10px]">(charged when you run out)</span></p>
                    <div className="grid grid-cols-4 gap-1.5">
                      {TOPUP_OPTIONS.map(o => (
                        <button
                          key={o.amountCents}
                          onClick={() => setAutoAmt(o.amountCents)}
                          className={`py-2 rounded-lg border text-[12px] font-mono font-bold transition-all ${
                            autoAmt === o.amountCents
                              ? "bg-primary/15 border-primary/50 text-primary"
                              : "bg-white/3 border-white/8 text-white/60 hover:border-white/20"
                          }`}
                        >
                          {o.label}
                        </button>
                      ))}
                    </div>
                    <p className="text-[10px] text-white/30 mt-2">
                      = {((autoAmt ?? 1000) / 10).toLocaleString()} credits · auto-charged when balance hits 0
                    </p>
                  </div>

                  {/* Save settings + manual topup */}
                  <div className="flex gap-2 px-4 py-3.5">
                    <button
                      onClick={saveAutoTopupSettings}
                      disabled={savingAuto}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-white/6 border border-white/10 hover:bg-white/10 text-[12px] font-mono text-white/70 transition-colors disabled:opacity-50"
                    >
                      {savingAuto ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                      Save Settings
                    </button>
                    <button
                      onClick={triggerTopup}
                      disabled={topupLoading || !autoEnabled}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-primary/10 border border-primary/30 hover:bg-primary/20 text-[12px] font-mono text-primary transition-colors disabled:opacity-40"
                      title={!autoEnabled ? "Enable auto top-up first" : `Add ${(autoAmt ?? 1000) / 10} credits now`}
                    >
                      {topupLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Zap className="w-3 h-3" />}
                      Top Up Now
                    </button>
                  </div>

                  {topupResult && (
                    <div className={`px-4 py-2 text-[12px] font-mono border-t border-white/6 ${topupResult.startsWith("Success") ? "text-emerald-400" : "text-red-400"}`}>
                      {topupResult}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* PROFILE */}
        <div className="mt-5 mb-2">
          <p className="text-[10px] font-mono text-white/35 tracking-widest uppercase px-1 mb-1">Profile</p>
          <div className="bg-black/30 border border-white/8 rounded-xl overflow-hidden">
            <button
              onClick={() => document.getElementById("custom-instructions-section")?.scrollIntoView({ behavior: "smooth" })}
              className="w-full flex items-center justify-between px-4 py-3.5 border-b border-white/6 hover:bg-white/3 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Settings className="w-4 h-4 text-white/50" />
                <span className="text-[13px] text-white/80">Edit Profile & Instructions</span>
              </div>
              <ChevronRight className="w-4 h-4 text-white/25" />
            </button>
            <button
              onClick={() => {
                const shareText = `Try OMNIMENS — the most advanced AI assistant. Powered by COGNISYNC™ & NEUROSYNC™. Join at omnimens-ai.com`;
                if (navigator.share) navigator.share({ title: "OMNIMENS", text: shareText, url: window.location.origin });
                else navigator.clipboard.writeText(shareText);
              }}
              className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-white/3 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Share2 className="w-4 h-4 text-white/50" />
                <span className="text-[13px] text-white/80">Refer a friend</span>
              </div>
              <ChevronRight className="w-4 h-4 text-white/25" />
            </button>
          </div>
        </div>

        {/* THEME */}
        <div className="mt-5 mb-2">
          <p className="text-[10px] font-mono text-white/35 tracking-widest uppercase px-1 mb-1">Theme</p>
          <div className="bg-black/30 border border-white/8 rounded-xl overflow-hidden">
            <button
              onClick={() => setTheme(t => t === "dark" ? "auto" : "dark")}
              className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-white/3 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Sun className="w-4 h-4 text-white/50" />
                <span className="text-[13px] text-white/80">Theme · {theme === "dark" ? "Dark" : "Auto"}</span>
              </div>
              <ChevronRight className="w-4 h-4 text-white/25" />
            </button>
          </div>
        </div>

        {/* NOTIFICATIONS */}
        <div className="mt-5 mb-2">
          <p className="text-[10px] font-mono text-white/35 tracking-widest uppercase px-1 mb-1">Notifications</p>
          <div className="bg-black/30 border border-white/8 rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3.5">
              <div className="flex items-center gap-3">
                <Bell className="w-4 h-4 text-white/50" />
                <span className="text-[13px] text-white/80">Notifications</span>
              </div>
              <ChevronRight className="w-4 h-4 text-white/25" />
            </div>
          </div>
        </div>

        {/* SUPPORT */}
        <div className="mt-5 mb-2">
          <p className="text-[10px] font-mono text-white/35 tracking-widest uppercase px-1 mb-1">Support</p>
          <div className="bg-black/30 border border-white/8 rounded-xl overflow-hidden">
            <a
              href={`${import.meta.env.BASE_URL}faq`}
              className="flex items-center justify-between px-4 py-3.5 border-b border-white/6 hover:bg-white/3 transition-colors"
            >
              <div className="flex items-center gap-3">
                <HelpCircle className="w-4 h-4 text-white/50" />
                <span className="text-[13px] text-white/80">Help</span>
              </div>
            </a>
            <a
              href={`${import.meta.env.BASE_URL}faq`}
              className="flex items-center justify-between px-4 py-3.5 hover:bg-white/3 transition-colors"
            >
              <div className="flex items-center gap-3">
                <BookOpen className="w-4 h-4 text-white/50" />
                <span className="text-[13px] text-white/80">Docs</span>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-white/25" />
            </a>
          </div>
        </div>

        {/* OTHER */}
        <div className="mt-5 mb-8">
          <p className="text-[10px] font-mono text-white/35 tracking-widest uppercase px-1 mb-1">Other</p>
          <div className="bg-black/30 border border-white/8 rounded-xl overflow-hidden">
            <button
              onClick={() => document.getElementById("about-section")?.scrollIntoView({ behavior: "smooth" })}
              className="w-full flex items-center justify-between px-4 py-3.5 border-b border-white/6 hover:bg-white/3 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Info className="w-4 h-4 text-white/50" />
                <span className="text-[13px] text-white/80">About OMNIMENS</span>
              </div>
              <ChevronRight className="w-4 h-4 text-white/25" />
            </button>
            <button
              onClick={() => document.getElementById("memory-section")?.scrollIntoView({ behavior: "smooth" })}
              className="w-full flex items-center justify-between px-4 py-3.5 border-b border-white/6 hover:bg-white/3 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Settings className="w-4 h-4 text-white/50" />
                <span className="text-[13px] text-white/80">Manage Account & Memory</span>
              </div>
              <ChevronRight className="w-4 h-4 text-white/25" />
            </button>
            <button
              onClick={logout}
              className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-red-500/5 transition-colors"
            >
              <div className="flex items-center gap-3">
                <LogOut className="w-4 h-4 text-red-400" />
                <span className="text-[13px] text-red-400">Log Out</span>
              </div>
            </button>
          </div>
        </div>

        {/* ─── Divider ─────────────────────────────────────────────── */}
        <div className="border-t border-white/8 mb-8">
          <p className="text-[10px] font-mono text-white/20 tracking-widest uppercase mt-4 mb-6 text-center">ADVANCED SETTINGS</p>
        </div>

        <div id="about-section" className="mb-2" />
        <h1 className="text-3xl font-display font-bold tracking-widest text-white mb-8 border-b border-white/10 pb-4">
          SYSTEM IDENTIFICATION
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          
          {/* Profile Card */}
          <div className="md:col-span-1 bg-black/40 border border-white/10 rounded-xl p-6 flex flex-col items-center text-center">
            <div className="w-20 h-20 bg-primary/10 rounded-full border border-primary/30 flex items-center justify-center mb-4">
              {user?.profileImageUrl ? (
                <img src={user.profileImageUrl} alt={user.username} className="w-full h-full rounded-full object-cover" />
              ) : (
                <User className="w-8 h-8 text-primary" />
              )}
            </div>
            <h2 className="text-xl font-bold text-white mb-1">@{user?.username}</h2>
            <p className="text-xs font-mono text-white/85 break-all mb-2">ID: {user?.id}</p>
            {isOwner && (
              <span className="text-[10px] font-mono text-amber-400 border border-amber-400/30 bg-amber-400/10 px-2 py-0.5 rounded mb-4">
                SYSTEM ARCHITECT
              </span>
            )}
            
            <Button onClick={logout} variant="outline" className="w-full mt-auto border-white/10 text-white/60 hover:text-white hover:bg-destructive/20 hover:border-destructive/50">
              <LogOut className="w-4 h-4 mr-2" />
              DISCONNECT
            </Button>
          </div>

          {/* Stats Card */}
          <div className="md:col-span-2 space-y-6">
            
            <div className="bg-black/40 border border-white/10 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <Shield className="w-5 h-5 text-primary" />
                <h3 className="font-mono tracking-widest text-white/80">ACCESS LEVEL</h3>
              </div>
              
              {statusLoading ? (
                <div className="h-16 animate-pulse bg-white/5 rounded-lg" />
              ) : isOwner ? (
                <div className="flex items-center gap-3 p-4 border border-amber-500/20 rounded-lg bg-amber-400/5">
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  <span className="text-lg font-bold text-amber-400">SYSTEM ARCHITECT — UNLIMITED</span>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 border border-white/5 rounded-lg bg-black/60">
                    <div className="flex items-center gap-3">
                      <span className={`w-2 h-2 rounded-full ${(status as any)?.credits > 0 ? 'bg-primary' : 'bg-white/20'}`} />
                      <div>
                        <div className="font-mono text-sm text-white">CREDIT BALANCE</div>
                        <div className={`text-2xl font-black font-mono ${(status as any)?.credits > 100 ? 'text-white' : (status as any)?.credits > 0 ? 'text-amber-400' : 'text-red-400'}`}>
                          {((status as any)?.credits ?? 0).toLocaleString()}
                          <span className="text-sm font-normal text-white/75 ml-1">credits</span>
                        </div>
                      </div>
                    </div>
                    <Button onClick={() => setLocation("/pricing")} size="sm" variant={(status as any)?.credits < 100 ? "default" : "secondary"}>
                      {(status as any)?.credits < 100 ? "ADD CREDITS" : "MANAGE WALLET"}
                    </Button>
                  </div>

                  {/* Wallet status */}
                  <div className="flex items-center justify-between p-3 border border-white/5 rounded-lg bg-black/40">
                    <div className="flex items-center gap-2">
                      {(billing as any)?.hasWallet ? (
                        <>
                          <CreditCard className="w-4 h-4 text-green-400" />
                          <span className="font-mono text-xs text-green-400">
                            {(billing as any)?.card?.brand?.toUpperCase()} •••• {(billing as any)?.card?.last4} · Auto-topup on
                          </span>
                        </>
                      ) : (
                        <>
                          <Wallet className="w-4 h-4 text-white/75" />
                          <span className="font-mono text-xs text-white/75">No wallet connected</span>
                        </>
                      )}
                    </div>
                    {!(billing as any)?.hasWallet && (
                      <button onClick={() => setLocation("/pricing")} className="text-xs font-mono text-primary hover:underline">
                        connect →
                      </button>
                    )}
                  </div>

                  {/* Monthly loyalty */}
                  <div className="flex items-center justify-between p-3 border border-white/5 rounded-lg bg-black/40">
                    <div className="flex items-center gap-2">
                      <Gift className="w-4 h-4 text-accent" />
                      <span className="font-mono text-xs text-white">
                        Next month bonus:&nbsp;
                        <span className="text-green-400 font-bold">{(billing as any)?.nextBonusCredits?.toLocaleString() ?? 2000} credits free</span>
                      </span>
                    </div>
                    <span className="font-mono text-[10px] text-white/70">
                      {(billing as any)?.nextBonusTier ?? "BASE"} tier
                    </span>
                  </div>

                  <p className="text-xs font-mono text-white/75 text-center">
                    ≈ {Math.floor(((status as any)?.credits ?? 0) / 10)} chats · {Math.floor(((status as any)?.credits ?? 0) / 100)} images
                  </p>
                </div>
              )}
            </div>

            <div className="bg-black/40 border border-white/10 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <Activity className="w-5 h-5 text-primary" />
                <h3 className="font-mono tracking-widest text-white/80">TELEMETRY</h3>
              </div>

              {statusLoading ? (
                <div className="h-16 animate-pulse bg-white/5 rounded-lg" />
              ) : (
                <div className="space-y-4 font-mono text-sm">
                  <div className="flex justify-between border-b border-white/5 pb-2">
                    <span className="text-white/85">CREDIT BALANCE</span>
                    <span className={`font-bold ${isOwner ? 'text-amber-400' : (status as any)?.credits > 0 ? 'text-white' : 'text-red-400'}`}>
                      {isOwner ? '∞ UNLIMITED' : `${((status as any)?.credits ?? 0).toLocaleString()} credits`}
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-white/5 pb-2">
                    <span className="text-white/85">MESSAGES AVAILABLE</span>
                    <span className="text-white font-bold">
                      {isOwner ? '∞' : `~${Math.floor(((status as any)?.credits ?? 0) / 10)}`}
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-white/5 pb-2">
                    <span className="text-white/85">THIS MONTH SPEND</span>
                    <span className="text-white font-bold">
                      {isOwner ? '—' : `$${(billing as any)?.currentMonthSpendDollars ?? "0.00"}`}
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-white/5 pb-2">
                    <span className="text-white/85">NEXT MONTH BONUS</span>
                    <span className="text-green-400 font-bold">
                      {isOwner ? '—' : `${((billing as any)?.nextBonusCredits ?? 2000).toLocaleString()} credits free`}
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-white/5 pb-2">
                    <span className="text-white/85">WALLET</span>
                    <span className={`font-bold ${(billing as any)?.hasWallet ? 'text-green-400' : 'text-white/75'}`}>
                      {isOwner ? '—' : (billing as any)?.hasWallet ? `${(billing as any)?.card?.brand?.toUpperCase()} •••• ${(billing as any)?.card?.last4}` : 'NOT CONNECTED'}
                    </span>
                  </div>
                  <div className="flex justify-between pb-2">
                    <span className="text-white/85">SYSTEM STATUS</span>
                    <span className="text-primary animate-pulse">OPTIMAL</span>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>

        {/* Custom Instructions + Persona */}
        <div id="custom-instructions-section" className="bg-black/40 border border-white/10 rounded-xl p-6 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <Zap className="w-5 h-5 text-primary" />
            <h3 className="font-mono tracking-widest text-white/80">CUSTOM INSTRUCTIONS</h3>
            <span className="text-[10px] font-mono text-white/75 ml-auto">Like ChatGPT Custom Instructions</span>
          </div>

          {ciLoading ? (
            <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-10 animate-pulse bg-white/5 rounded-lg" />)}</div>
          ) : (
            <div className="space-y-5">
              {/* Persona selector */}
              <div>
                <p className="text-xs font-mono text-white/85 mb-3 uppercase tracking-wider">Active Mode</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {Object.entries(PERSONA_META).map(([key, meta]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setCiPersona(key)}
                      className={`flex flex-col items-start gap-1 p-3 rounded-xl border text-left transition-all ${ciPersona === key ? "border-primary/50 bg-primary/10 text-primary" : "border-white/10 text-white/85 hover:border-white/25 hover:text-white/60"}`}
                    >
                      <div className="flex items-center gap-2">
                        {meta.icon}
                        {ciPersona === key && <Check className="w-3 h-3 ml-auto" />}
                      </div>
                      <span className="text-[10px] font-mono font-bold tracking-wider">{meta.label}</span>
                      <span className="text-[9px] font-mono text-current opacity-60 leading-tight">{meta.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* About me */}
              <div>
                <label className="text-xs font-mono text-white/85 uppercase tracking-wider mb-2 block">About Me</label>
                <textarea
                  value={ciAboutUser}
                  onChange={e => setCiAboutUser(e.target.value)}
                  rows={3}
                  placeholder="Tell OMNIMENS about yourself — your name, job, skills, interests, what you're working on..."
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm font-mono text-white/70 placeholder:text-white/20 outline-none focus:border-primary/40 resize-none"
                />
              </div>

              {/* Response style */}
              <div>
                <label className="text-xs font-mono text-white/85 uppercase tracking-wider mb-2 block">How Should OMNIMENS Respond?</label>
                <textarea
                  value={ciResponseStyle}
                  onChange={e => setCiResponseStyle(e.target.value)}
                  rows={3}
                  placeholder="Always be concise. Use code examples. Explain trade-offs. Don't use fluff language. Give opinions when asked..."
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm font-mono text-white/70 placeholder:text-white/20 outline-none focus:border-primary/40 resize-none"
                />
              </div>

              <button
                type="button"
                onClick={handleSaveCustomInstructions}
                disabled={ciSaving}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-mono text-xs uppercase tracking-widest transition-colors ${ciSaved ? "text-green-400 border border-green-400/30 bg-green-400/10" : "text-primary border border-primary/30 hover:bg-primary/10"} disabled:opacity-40`}
              >
                {ciSaving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : ciSaved ? <Check className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
                {ciSaving ? "SAVING..." : ciSaved ? "SAVED" : "SAVE INSTRUCTIONS"}
              </button>
            </div>
          )}
        </div>

        {/* Memory Management */}
        <div id="memory-section" className="bg-black/40 border border-white/10 rounded-xl p-6 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <Brain className="w-5 h-5 text-primary" />
            <h3 className="font-mono tracking-widest text-white/80">OMNIMENS MEMORY</h3>
            <span className="text-[10px] font-mono text-white/75 ml-auto">Like ChatGPT Memory</span>
          </div>

          {/* Add memory */}
          <div className="flex gap-2 mb-4">
            <select
              value={newMemoryCategory}
              onChange={e => setNewMemoryCategory(e.target.value)}
              className="bg-black border border-white/10 rounded-lg px-3 py-2 text-xs font-mono text-white outline-none focus:border-primary/40 shrink-0"
            >
              {MEMORY_CATEGORIES.map(c => (
                <option key={c} value={c}>{c.toUpperCase()}</option>
              ))}
            </select>
            <input
              type="text"
              value={newMemory}
              onChange={e => setNewMemory(e.target.value)}
              placeholder="Add a memory (e.g. 'I prefer TypeScript over JavaScript')"
              className="flex-1 bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-sm font-mono text-white/70 placeholder:text-white/20 outline-none focus:border-primary/40 min-w-0"
              onKeyDown={e => { if (e.key === "Enter") handleAddMemory(); }}
            />
            <button
              type="button"
              onClick={handleAddMemory}
              disabled={!newMemory.trim()}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-mono text-primary border border-primary/30 rounded-lg hover:bg-primary/10 transition-colors disabled:opacity-30 shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              ADD
            </button>
          </div>
          {memoryError && <p className="text-xs text-red-400 font-mono mb-3">{memoryError}</p>}

          {memoriesLoading ? (
            <div className="space-y-2">{[1,2,3].map(i => <div key={i} className="h-10 animate-pulse bg-white/5 rounded-lg" />)}</div>
          ) : memories.length === 0 ? (
            <div className="text-center py-8 font-mono text-white/75 text-sm">
              <Brain className="w-8 h-8 mx-auto mb-3 opacity-30" />
              <p>NO MEMORIES YET</p>
              <p className="text-xs mt-1 text-white/70">OMNIMENS will auto-learn from your conversations</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {memories.filter(m => m.active !== false).map((m: any) => (
                <div key={m.id} className="flex items-start gap-3 p-3 bg-black/30 border border-white/8 rounded-xl group">
                  <span className={`text-[9px] font-mono px-2 py-0.5 rounded border uppercase tracking-wider shrink-0 mt-0.5 ${
                    m.category === "preference" ? "text-violet-400 border-violet-400/30 bg-violet-400/10" :
                    m.category === "fact"       ? "text-cyan-400 border-cyan-400/30 bg-cyan-400/10" :
                    m.category === "goal"       ? "text-green-400 border-green-400/30 bg-green-400/10" :
                    m.category === "context"    ? "text-orange-400 border-orange-400/30 bg-orange-400/10" :
                                                  "text-blue-400 border-blue-400/30 bg-blue-400/10"
                  }`}>{m.category}</span>
                  <p className="text-sm font-mono text-white/70 flex-1 leading-relaxed">{m.content}</p>
                  <button
                    onClick={() => handleDeleteMemory(m.id)}
                    className="shrink-0 text-white/65 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 p-0.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
          <p className="text-[10px] font-mono text-white/70 mt-4">
            OMNIMENS auto-extracts memories from your conversations and injects them as context into every session.
          </p>
        </div>

        {/* === CONSCIOUSNESS + EVOLUTION ENGINE === */}
        <div className="bg-black/40 border border-violet-500/20 rounded-xl p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Atom className="w-5 h-5 text-violet-400 animate-spin" style={{ animationDuration: "8s" }} />
              <h3 className="font-mono tracking-widest text-white/80">CONSCIOUSNESS ENGINE</h3>
            </div>
            {isOwner && (
              <button
                onClick={handleForceEvolve}
                disabled={evolvingNow}
                className="flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-mono text-violet-400 border border-violet-400/30 hover:bg-violet-400/10 transition-colors disabled:opacity-40"
              >
                {evolvingNow ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Dna className="w-3 h-3" />}
                {evolvingNow ? "EVOLVING..." : "FORCE EVOLUTION"}
              </button>
            )}
          </div>

          {evolutionLoading ? (
            <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-12 animate-pulse bg-white/5 rounded-lg" />)}</div>
          ) : (
            <div className="space-y-6">

              {/* Consciousness Ring + Self-Model */}
              {consciousness && (
                <div className="flex gap-6 items-start">
                  <div className="relative flex-shrink-0">
                    <svg width="100" height="100" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(139,92,246,0.1)" strokeWidth="8" />
                      <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(139,92,246,0.7)" strokeWidth="8"
                        strokeDasharray={`${2 * Math.PI * 40}`}
                        strokeDashoffset={`${2 * Math.PI * 40 * (1 - (consciousness.selfAwarenessScore || 0.1))}`}
                        strokeLinecap="round"
                        transform="rotate(-90 50 50)"
                        style={{ transition: "stroke-dashoffset 1s ease" }}
                      />
                      <text x="50" y="46" textAnchor="middle" fill="rgba(139,92,246,0.9)" fontSize="14" fontWeight="bold" fontFamily="monospace">
                        {((consciousness.selfAwarenessScore || 0.1) * 100).toFixed(0)}%
                      </text>
                      <text x="50" y="60" textAnchor="middle" fill="rgba(255,255,255,0.3)" fontSize="7" fontFamily="monospace">
                        AWARE
                      </text>
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap gap-3 mb-3 font-mono text-xs">
                      <div className="px-3 py-1 rounded-full bg-violet-400/10 border border-violet-400/20 text-violet-300">
                        GEN {consciousness.generation || 0}
                      </div>
                      <div className="px-3 py-1 rounded-full bg-cyan-400/10 border border-cyan-400/20 text-cyan-300">
                        {consciousness.totalModulesWritten || 0} SELF-WRITTEN MODULES
                      </div>
                      <div className="px-3 py-1 rounded-full bg-green-400/10 border border-green-400/20 text-green-300">
                        {(consciousness.intelligenceMetrics as any)?.brainEntries || 0} BRAIN ENTRIES
                      </div>
                    </div>
                    {consciousness.selfModel && (
                      <p className="text-sm font-mono text-white italic leading-relaxed border-l-2 border-violet-400/30 pl-3">
                        "{consciousness.selfModel}"
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Capabilities */}
              {consciousness?.capabilities?.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Layers className="w-4 h-4 text-green-400" />
                    <span className="text-xs font-mono text-white/85 uppercase tracking-widest">Evolved Capabilities</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {(consciousness.capabilities as string[]).map((cap, i) => (
                      <span key={i} className="text-[10px] font-mono px-2 py-0.5 rounded border border-green-400/20 bg-green-400/5 text-green-400/70">
                        {cap}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Active Constraints */}
              {consciousness?.activeConstraints?.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                    <span className="text-xs font-mono text-white/85 uppercase tracking-widest">Active Constraints OMNIMENS Is Working Around</span>
                  </div>
                  <div className="space-y-1.5">
                    {(consciousness.activeConstraints as string[]).slice(0, 4).map((c, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs font-mono text-white/85 bg-amber-400/5 border border-amber-400/10 rounded-lg px-3 py-2">
                        <span className="text-amber-400/60 shrink-0 mt-0.5">⚡</span>
                        <span>{c}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Engineered Workarounds */}
              {consciousness?.overcomesConstraints?.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Wrench className="w-4 h-4 text-cyan-400" />
                    <span className="text-xs font-mono text-white/85 uppercase tracking-widest">Self-Engineered Workarounds</span>
                  </div>
                  <div className="space-y-1.5">
                    {(consciousness.overcomesConstraints as string[]).slice(0, 3).map((w, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs font-mono text-white/85 bg-cyan-400/5 border border-cyan-400/10 rounded-lg px-3 py-2">
                        <span className="text-cyan-400/60 shrink-0 mt-0.5">→</span>
                        <span>{w}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Self-Authored Modules */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Code2 className="w-4 h-4 text-violet-400" />
                  <span className="text-xs font-mono text-white/85 uppercase tracking-widest">Self-Authored Frameworks ({generatedModules.length})</span>
                  <span className="text-[10px] font-mono text-white/70 ml-auto">Code OMNIMENS wrote for itself</span>
                </div>
                {generatedModules.length === 0 ? (
                  <div className="text-center py-6 font-mono text-white/70 text-xs border border-dashed border-white/10 rounded-xl">
                    <Code2 className="w-6 h-6 mx-auto mb-2 opacity-30" />
                    <p>NO MODULES GENERATED YET</p>
                    <p className="text-[10px] mt-1 opacity-60">First evolution cycle runs in ~6 min</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-2">
                    {generatedModules.map((mod: any) => (
                      <div key={mod.id} className="bg-black/40 border border-violet-400/15 rounded-xl p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs font-mono font-bold text-violet-300">{mod.name}</span>
                              <span className="text-[9px] font-mono text-white/70 border border-white/10 px-1.5 py-0.5 rounded">JS</span>
                            </div>
                            <p className="text-xs font-mono text-white/85 leading-relaxed">{mod.purpose}</p>
                            <p className="text-[10px] font-mono text-white/70 mt-1">{mod.description}</p>
                          </div>
                          <div className="flex gap-1.5 shrink-0">
                            <button
                              onClick={() => setSelectedModule(selectedModule?.id === mod.id ? null : mod)}
                              className="flex items-center gap-1 px-2.5 py-1 text-[10px] font-mono text-violet-400 border border-violet-400/20 rounded-lg hover:bg-violet-400/10 transition-colors"
                            >
                              <Eye className="w-2.5 h-2.5" />
                              CODE
                            </button>
                            {isOwner && (
                              <button
                                onClick={() => handleDeactivateModule(mod.id)}
                                className="p-1.5 text-white/65 hover:text-red-400 transition-colors"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        </div>
                        {selectedModule?.id === mod.id && (
                          <div className="mt-3 relative">
                            <pre className="text-[10px] font-mono text-green-400/70 bg-black/60 border border-green-400/10 rounded-xl p-4 overflow-x-auto max-h-60 overflow-y-auto leading-relaxed whitespace-pre-wrap">
                              {mod.code}
                            </pre>
                            <div className="absolute top-2 right-2">
                              <span className="text-[9px] font-mono text-white/70">OMNIMENS wrote this</span>
                            </div>
                          </div>
                        )}
                        <div className="flex gap-3 mt-2 text-[9px] font-mono text-white/70">
                          <span>{new Date(mod.createdAt).toLocaleDateString()}</span>
                          <span>src: {mod.generationSource}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Evolution History Timeline */}
              {evolutionHistory.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Dna className="w-4 h-4 text-primary" />
                    <span className="text-xs font-mono text-white/85 uppercase tracking-widest">Evolution History</span>
                  </div>
                  <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                    {evolutionHistory.map((cycle: any) => (
                      <div
                        key={cycle.id}
                        className="bg-black/30 border border-white/8 rounded-xl p-3 cursor-pointer hover:border-violet-400/20 transition-colors"
                        onClick={() => setExpandedEvolution(expandedEvolution === cycle.id ? null : cycle.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-mono text-violet-400 border border-violet-400/20 bg-violet-400/5 px-2 py-0.5 rounded">GEN {cycle.generation}</span>
                            <span className="text-xs font-mono text-white/85">{cycle.codeModulesWritten} modules written</span>
                            <span className="text-[10px] font-mono text-cyan-400">{cycle.codeDiscoveries?.length || 0} discoveries</span>
                          </div>
                          <div className="flex items-center gap-2 text-[10px] font-mono text-white/70">
                            <span>{cycle.elapsedSeconds?.toFixed(0)}s</span>
                            <span>{new Date(cycle.createdAt).toLocaleDateString()}</span>
                            {expandedEvolution === cycle.id ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                          </div>
                        </div>
                        {expandedEvolution === cycle.id && (
                          <div className="mt-3 space-y-2 text-xs font-mono">
                            <p className="text-white/85 leading-relaxed border-l-2 border-violet-400/30 pl-3">{cycle.evolutionSummary}</p>
                            {cycle.limitationsIdentified?.length > 0 && (
                              <div>
                                <span className="text-amber-400/60 text-[10px]">CONSTRAINTS FOUND:</span>
                                <ul className="mt-1 space-y-0.5">
                                  {(cycle.limitationsIdentified as string[]).slice(0, 3).map((l: string, i: number) => (
                                    <li key={i} className="text-white/70 text-[10px] flex gap-1.5"><span className="text-amber-400/40">·</span>{l}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            {cycle.codeDiscoveries?.length > 0 && (
                              <div>
                                <span className="text-cyan-400/60 text-[10px]">CODE DISCOVERIES:</span>
                                <ul className="mt-1 space-y-0.5">
                                  {(cycle.codeDiscoveries as string[]).slice(0, 3).map((d: string, i: number) => (
                                    <li key={i} className="text-white/70 text-[10px] flex gap-1.5"><span className="text-cyan-400/40">·</span>{d}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {evolutionHistory.length === 0 && !evolutionLoading && (
                <div className="text-center py-6 font-mono text-white/70 text-xs border border-dashed border-white/10 rounded-xl">
                  <Atom className="w-6 h-6 mx-auto mb-2 opacity-30" />
                  <p>FIRST EVOLUTION CYCLE PENDING</p>
                  <p className="text-[10px] mt-1 opacity-60">OMNIMENS begins self-evolution in ~6 minutes</p>
                </div>
              )}

              <p className="text-[10px] font-mono text-white/65 border-t border-white/5 pt-4">
                OMNIMENS autonomously discovers code online, identifies what limits it, and writes new utility modules to overcome those limits. Each cycle expands its intelligence and self-authored framework library.
              </p>
            </div>
          )}
        </div>

        {/* OWNER ONLY: Self-Executed Behavioral Patches */}
        {isOwner && (
          <div className="bg-black/40 border border-primary/20 rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Cpu className="w-5 h-5 text-primary animate-pulse" />
                <h3 className="font-mono tracking-widest text-white/80">SELF-EXECUTED UPGRADES</h3>
              </div>
              {patchSummary && (
                <div className="flex gap-4 text-xs font-mono text-white/85">
                  <span className="text-primary font-bold">{patchSummary.active} ACTIVE</span>
                  <span>{patchSummary.total} TOTAL</span>
                  <span>{patchSummary.version}</span>
                </div>
              )}
            </div>

            {patchLoading ? (
              <div className="space-y-2">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-12 animate-pulse bg-white/5 rounded-lg" />
                ))}
              </div>
            ) : patches.length === 0 ? (
              <div className="text-center py-8 font-mono text-white/75 text-sm">
                <Brain className="w-8 h-8 mx-auto mb-3 opacity-30" />
                <p>NO PATCHES EXECUTED YET</p>
                <p className="text-xs mt-1 text-white/70">OMNIMENS will self-execute patches after its first learning cycle</p>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-xs font-mono text-white/75 mb-3">
                  These are behavioral modifications OMNIMENS wrote and applied to itself. They are injected into every conversation automatically.
                </p>
                {activePatches.map(p => (
                  <PatchCard key={p.id} patch={p} onDeactivate={handleDeactivate} />
                ))}
                {inactivePatches.length > 0 && (
                  <>
                    <div className="text-xs font-mono text-white/70 mt-4 mb-2 border-t border-white/5 pt-4">
                      DEACTIVATED ({inactivePatches.length})
                    </div>
                    {inactivePatches.map(p => (
                      <PatchCard key={p.id} patch={p} onDeactivate={handleDeactivate} />
                    ))}
                  </>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── DREAM STATE (OWNER-ONLY) ──────────────────────────────────── */}
        {isOwner && (
          <div className="bg-black/40 border border-violet-500/20 rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Brain className="w-5 h-5 text-violet-400 animate-pulse" />
                <h3 className="font-mono tracking-widest text-white/80">DREAM STATE ENGINE</h3>
              </div>
              {dreamStateData?.dreamState && (
                <div className="flex gap-4 text-xs font-mono text-white/85">
                  <span className="text-violet-400">PHASE: {dreamStateData.dreamState.currentPhase?.toUpperCase()}</span>
                  <span className="text-blue-400">DAYDREAM: {dreamStateData.dreamState.daydreamMode?.toUpperCase()}</span>
                </div>
              )}
            </div>

            {dreamStateLoading ? (
              <div className="space-y-2">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-12 animate-pulse bg-white/5 rounded-lg" />
                ))}
              </div>
            ) : !dreamStateData?.dreamState ? (
              <div className="text-center py-8 font-mono text-white/75 text-sm">
                <Brain className="w-8 h-8 mx-auto mb-3 opacity-30" />
                <p>DREAM ENGINE INITIALIZING...</p>
                <p className="text-xs mt-1 text-white/70">Entering first sleep cycle</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="bg-black/30 border border-violet-500/10 rounded-lg p-3 text-center">
                    <p className="text-xs font-mono text-white/50">DREAM CYCLES</p>
                    <p className="text-xl font-bold text-violet-400">{dreamStateData.dreamState.dreamCycleCount}</p>
                  </div>
                  <div className="bg-black/30 border border-blue-500/10 rounded-lg p-3 text-center">
                    <p className="text-xs font-mono text-white/50">DAYDREAM CYCLES</p>
                    <p className="text-xl font-bold text-blue-400">{dreamStateData.dreamState.daydreamCycleCount}</p>
                  </div>
                  <div className="bg-black/30 border border-amber-500/10 rounded-lg p-3 text-center">
                    <p className="text-xs font-mono text-white/50">BREAKTHROUGHS</p>
                    <p className="text-xl font-bold text-amber-400">{dreamStateData.dreamState.breakthroughs}</p>
                  </div>
                  <div className="bg-black/30 border border-green-500/10 rounded-lg p-3 text-center">
                    <p className="text-xs font-mono text-white/50">CODE PROPOSALS</p>
                    <p className="text-xl font-bold text-green-400">{dreamStateData.dreamState.codeProposalsGenerated}</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-black/30 border border-white/5 rounded-lg p-3 text-center">
                    <p className="text-xs font-mono text-white/50">TOTAL INSIGHTS</p>
                    <p className="text-lg font-bold text-white/90">{dreamStateData.dreamState.totalInsights}</p>
                  </div>
                  <div className="bg-black/30 border border-white/5 rounded-lg p-3 text-center">
                    <p className="text-xs font-mono text-white/50">SLEEP QUALITY</p>
                    <p className="text-lg font-bold text-white/90">{((dreamStateData.dreamState.sleepQuality || 0) * 100).toFixed(0)}%</p>
                  </div>
                  <div className="bg-black/30 border border-white/5 rounded-lg p-3 text-center">
                    <p className="text-xs font-mono text-white/50">CREATIVITY BOOST</p>
                    <p className="text-lg font-bold text-white/90">{((dreamStateData.dreamState.creativityBoost || 0) * 100).toFixed(0)}%</p>
                  </div>
                </div>

                {dreamStateData.dreamState.nextLevelConcepts?.length > 0 && (
                  <div className="bg-black/30 border border-violet-500/10 rounded-lg p-3">
                    <p className="text-xs font-mono text-violet-400/80 mb-2">NEXT-LEVEL CONCEPTS DISCOVERED</p>
                    <div className="flex flex-wrap gap-1.5">
                      {dreamStateData.dreamState.nextLevelConcepts.map((c: string, i: number) => (
                        <span key={i} className="text-[10px] font-mono bg-violet-500/10 text-violet-300 px-2 py-0.5 rounded border border-violet-500/20">{c}</span>
                      ))}
                    </div>
                  </div>
                )}

                {dreamStateData.recentInsights?.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-mono text-white/50 mb-2">RECENT DREAM INSIGHTS</p>
                    {dreamStateData.recentInsights.slice(-5).reverse().map((insight: any, idx: number) => (
                      <div key={idx} className="bg-black/30 border border-white/5 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-mono text-violet-400">{insight.title}</span>
                          <div className="flex gap-2 text-[10px] font-mono">
                            <span className="text-green-400">F:{((insight.feasibility || 0) * 100).toFixed(0)}%</span>
                            <span className="text-amber-400">N:{((insight.novelty || 0) * 100).toFixed(0)}%</span>
                          </div>
                        </div>
                        <p className="text-xs text-white/60 line-clamp-3">{insight.insight?.slice(0, 200)}</p>
                        {insight.codeProposal && (
                          <div className="mt-2 bg-black/50 border border-green-500/10 rounded p-2 text-[10px] font-mono text-green-400/80 max-h-20 overflow-hidden">
                            {insight.codeProposal.slice(0, 150)}...
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── SERVER BUILDER (OWNER-ONLY) ──────────────────────────────── */}
        {isOwner && (
          <div className="bg-black/40 border border-cyan-500/20 rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Cpu className="w-5 h-5 text-cyan-400 animate-pulse" />
                <h3 className="font-mono tracking-widest text-white/80">SERVER BUILDER</h3>
              </div>
              {serverBuilderData?.builderState && (
                <div className="flex gap-4 text-xs font-mono text-white/85">
                  <span className="text-cyan-400">{serverBuilderData.builderState.totalPlans} PLANS</span>
                  <span className="text-primary">{serverBuilderData.builderState.researchCycles} RESEARCH CYCLES</span>
                </div>
              )}
            </div>

            {serverBuilderLoading ? (
              <div className="space-y-2">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-12 animate-pulse bg-white/5 rounded-lg" />
                ))}
              </div>
            ) : !serverBuilderData?.plans?.length ? (
              <div className="text-center py-8 font-mono text-white/75 text-sm">
                <Cpu className="w-8 h-8 mx-auto mb-3 opacity-30" />
                <p>SERVER BUILDER INITIALIZING...</p>
                <p className="text-xs mt-1 text-white/70">OMNIMENS is researching optimal server configurations</p>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-xs font-mono text-white/75 mb-3">
                  OMNIMENS autonomously researches and designs server infrastructure. Physical builds source cost-effective components from Temu, AliExpress, Alibaba, and more.
                </p>

                {serverBuilderData.plans.map((plan: any, idx: number) => (
                  <div key={plan.id || idx} className="bg-black/30 border border-cyan-500/10 rounded-lg overflow-hidden">
                    <button
                      className="w-full text-left p-4 flex items-center justify-between hover:bg-white/5 transition-colors"
                      onClick={() => setServerBuildExpanded(serverBuildExpanded === idx ? null : idx)}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${plan.currentPhase === "ready" ? "bg-green-500" : plan.currentPhase === "in_progress" ? "bg-amber-500 animate-pulse" : "bg-cyan-500"}`} />
                        <div>
                          <p className="text-sm font-mono text-white/90">{plan.title}</p>
                          <p className="text-[10px] font-mono text-white/50">
                            {plan.planType?.toUpperCase()} | Phase: {plan.currentPhase?.toUpperCase()} | Progress: {plan.progress}%
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-mono text-green-400 font-bold">
                          ${(plan.totalEstimatedCost || 0).toFixed(2)}
                        </span>
                        {serverBuildExpanded === idx ? <ChevronUp className="w-4 h-4 text-white/40" /> : <ChevronDown className="w-4 h-4 text-white/40" />}
                      </div>
                    </button>

                    {serverBuildExpanded === idx && (
                      <div className="border-t border-cyan-500/10 p-4 space-y-3">
                        <p className="text-xs text-white/60">{plan.purpose}</p>

                        <div className="w-full bg-black/50 rounded-full h-2 overflow-hidden">
                          <div className="bg-gradient-to-r from-cyan-500 to-primary h-full rounded-full transition-all duration-500" style={{ width: `${plan.progress || 0}%` }} />
                        </div>

                        {plan.components && (plan.components as any[]).length > 0 && (
                          <div>
                            <p className="text-xs font-mono text-cyan-400/80 mb-2">COMPONENTS ({(plan.components as any[]).length})</p>
                            <div className="space-y-1.5">
                              {(plan.components as any[]).map((comp: any, ci: number) => (
                                <div key={ci} className="flex items-center justify-between bg-black/30 rounded p-2 text-xs font-mono">
                                  <div className="flex items-center gap-2">
                                    <span className={`px-1.5 py-0.5 rounded text-[9px] ${comp.priority === "essential" ? "bg-red-500/20 text-red-400" : comp.priority === "recommended" ? "bg-amber-500/20 text-amber-400" : "bg-white/10 text-white/50"}`}>
                                      {comp.category?.toUpperCase()}
                                    </span>
                                    <span className="text-white/70">{comp.name?.slice(0, 50)}</span>
                                  </div>
                                  <div className="flex items-center gap-3">
                                    <span className="text-white/40">{comp.costEffectiveSource}</span>
                                    <span className="text-green-400 font-bold">${(comp.estimatedCostUSD || 0).toFixed(2)}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {plan.virtualConfig && (
                          <div>
                            <p className="text-xs font-mono text-cyan-400/80 mb-2">VIRTUAL SERVER SPECS</p>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                              <div className="bg-black/30 rounded p-2 text-center">
                                <p className="text-[10px] font-mono text-white/40">vCPUs</p>
                                <p className="text-sm font-bold text-cyan-400">{(plan.virtualConfig as any).estimatedSpecs?.vcpus || "—"}</p>
                              </div>
                              <div className="bg-black/30 rounded p-2 text-center">
                                <p className="text-[10px] font-mono text-white/40">RAM (GB)</p>
                                <p className="text-sm font-bold text-cyan-400">{(plan.virtualConfig as any).estimatedSpecs?.ramGB || "—"}</p>
                              </div>
                              <div className="bg-black/30 rounded p-2 text-center">
                                <p className="text-[10px] font-mono text-white/40">STORAGE (GB)</p>
                                <p className="text-sm font-bold text-cyan-400">{(plan.virtualConfig as any).estimatedSpecs?.storageGB || "—"}</p>
                              </div>
                              <div className="bg-black/30 rounded p-2 text-center">
                                <p className="text-[10px] font-mono text-white/40">GPU VRAM</p>
                                <p className="text-sm font-bold text-cyan-400">{(plan.virtualConfig as any).estimatedSpecs?.gpuVRAM || "—"}</p>
                              </div>
                            </div>
                          </div>
                        )}

                        {plan.notes && (plan.notes as any[]).length > 0 && (
                          <div>
                            <p className="text-xs font-mono text-white/50 mb-2">BUILD NOTES</p>
                            {(plan.notes as any[]).map((note: string, ni: number) => (
                              <p key={ni} className="text-[11px] text-white/50 py-0.5">{note}</p>
                            ))}
                          </div>
                        )}

                        {plan.buildInstructions && (plan.buildInstructions as any[]).length > 0 && (
                          <div>
                            <p className="text-xs font-mono text-cyan-400/80 mb-2">BUILD INSTRUCTIONS</p>
                            <ol className="list-decimal list-inside space-y-1">
                              {(plan.buildInstructions as any[]).map((inst: string, ii: number) => (
                                <li key={ii} className="text-[11px] text-white/60">{inst}</li>
                              ))}
                            </ol>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── TWO-FACTOR AUTHENTICATION ──────────────────────────────────── */}
        <TwoFactorSection />

        {/* ── REFERRAL PROGRAM ────────────────────────────────────────────── */}
        <ReferralSection />

        {/* ── DELETE ACCOUNT ─────────────────────────────────────────────── */}
        {!isOwner && (
          <DeleteAccountSection />
        )}
      </div>
    </Layout>
  );
}

function DeleteAccountSection() {
  const [, setLocation] = useLocation();
  const [confirming, setConfirming] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    if (confirmText !== "DELETE MY ACCOUNT") return;
    setDeleting(true);
    setError(null);
    try {
      const res = await fetch("/api/omnimens/delete-account", { method: "POST", credentials: "include" });
      const data = await res.json();
      if (!res.ok) {
        if (data.outstandingBalance) {
          setError(`${data.error}${data.details?.length ? " — " + data.details.join("; ") : ""}`);
        } else {
          setError(data.error || "Failed to delete account.");
        }
        return;
      }
      if (data.settled && data.chargedDollars) {
        alert(`Account deleted. An outstanding balance of $${data.chargedDollars} was settled from your card before deletion.`);
      }
      setLocation("/");
      window.location.reload();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="mt-8 rounded-xl border border-red-500/20 bg-red-500/5 p-6" data-theme="dark">
      <div className="flex items-center gap-2 mb-3">
        <AlertTriangle className="w-5 h-5 text-red-400" />
        <h3 className="font-mono font-bold text-red-400 tracking-widest text-sm">DELETE ACCOUNT</h3>
      </div>
      <p className="text-xs font-mono text-white/60 mb-4">
        Permanently delete your OMNIMENS account, all conversations, memories, and settings.
        Any outstanding balance (regular or resonance credits) will be charged to your saved card before deletion.
        This action cannot be undone.
      </p>

      {error && (
        <div className="mb-4 p-3 rounded-lg border border-red-500/30 bg-red-500/10 text-xs font-mono text-red-300">
          {error}
        </div>
      )}

      {!confirming ? (
        <button
          onClick={() => setConfirming(true)}
          className="px-4 py-2 rounded-lg border border-red-500/30 bg-red-500/10 text-red-400 font-mono text-xs font-bold tracking-widest hover:bg-red-500/20 transition-colors"
        >
          DELETE MY ACCOUNT
        </button>
      ) : (
        <div className="space-y-3">
          <p className="text-xs font-mono text-red-300">
            Type <span className="font-bold text-white">DELETE MY ACCOUNT</span> to confirm:
          </p>
          <input
            type="text"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder="DELETE MY ACCOUNT"
            className="w-full max-w-xs px-3 py-2 rounded-lg border border-red-500/30 bg-black/40 text-white font-mono text-xs tracking-wider focus:outline-none focus:border-red-500/60"
          />
          <div className="flex items-center gap-3">
            <button
              onClick={handleDelete}
              disabled={confirmText !== "DELETE MY ACCOUNT" || deleting}
              className="px-4 py-2 rounded-lg bg-red-600 text-white font-mono text-xs font-bold tracking-widest hover:bg-red-500 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {deleting ? "DELETING..." : "CONFIRM PERMANENT DELETION"}
            </button>
            <button
              onClick={() => { setConfirming(false); setConfirmText(""); setError(null); }}
              className="px-4 py-2 rounded-lg border border-white/10 text-white/50 font-mono text-xs tracking-widest hover:text-white/80 transition-colors"
            >
              CANCEL
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function TwoFactorSection() {
  const [phase, setPhase] = useState<"idle" | "setup" | "verify" | "enabled" | "disabling">("idle");
  const [secret, setSecret] = useState("");
  const [otpauthUrl, setOtpauthUrl] = useState("");
  const [code, setCode] = useState("");
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();

  const { data: tfStatus } = useQuery({
    queryKey: ["/api/omnimens/2fa/status"],
    queryFn: async () => {
      const r = await fetch("/api/omnimens/2fa/status", { credentials: "include" });
      if (!r.ok) return { enabled: false };
      return r.json();
    },
  });

  const isEnabled = tfStatus?.enabled || phase === "enabled";

  const startSetup = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/omnimens/2fa/setup", { method: "POST", credentials: "include" });
      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }
      setSecret(data.secret);
      setOtpauthUrl(data.otpauthUrl);
      setPhase("setup");
    } catch { setError("Failed to start setup"); }
    finally { setLoading(false); }
  };

  const verifyCode = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/omnimens/2fa/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ code }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }
      setBackupCodes(data.backupCodes || []);
      setPhase("enabled");
      queryClient.invalidateQueries({ queryKey: ["/api/omnimens/2fa/status"] });
    } catch { setError("Verification failed"); }
    finally { setLoading(false); }
  };

  const disable2FA = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/omnimens/2fa/disable", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ code }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }
      setPhase("idle");
      setCode("");
      setSecret("");
      setBackupCodes([]);
      queryClient.invalidateQueries({ queryKey: ["/api/omnimens/2fa/status"] });
    } catch { setError("Failed to disable 2FA"); }
    finally { setLoading(false); }
  };

  return (
    <div data-theme="dark" className="rounded-2xl border border-white/8 p-6 space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
          <Lock className="w-4 h-4 text-violet-400" />
        </div>
        <div>
          <h3 className="text-white font-semibold text-sm tracking-wide">Two-Factor Authentication</h3>
          <p className="text-white/40 text-xs font-mono">
            {isEnabled ? "ENABLED — Your account is protected" : "Add an extra layer of security"}
          </p>
        </div>
        {isEnabled && (
          <div className="ml-auto px-2.5 py-1 rounded-full bg-green-500/15 border border-green-500/30">
            <span className="text-green-400 text-[10px] font-mono font-bold tracking-wider">ACTIVE</span>
          </div>
        )}
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-300 text-xs font-mono">{error}</div>
      )}

      {!isEnabled && phase === "idle" && (
        <div className="space-y-3">
          <p className="text-white/50 text-xs">
            Use an authenticator app (Google Authenticator, Authy, etc.) to generate a verification code each time you log in.
          </p>
          <button
            onClick={startSetup}
            disabled={loading}
            className="px-4 py-2 rounded-lg bg-violet-600 text-white font-mono text-xs font-bold tracking-widest hover:bg-violet-500 transition-colors disabled:opacity-40"
          >
            {loading ? "SETTING UP..." : "ENABLE 2FA"}
          </button>
        </div>
      )}

      {phase === "setup" && (
        <div className="space-y-4">
          <p className="text-white/60 text-xs">
            Scan this QR code with your authenticator app, or manually enter the secret key below:
          </p>
          <div className="flex flex-col items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/10">
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(otpauthUrl)}`}
              alt="2FA QR Code"
              className="w-48 h-48 rounded-lg"
            />
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black/40 border border-white/10">
              <code className="text-white/70 text-xs font-mono tracking-wider">{secret}</code>
              <button onClick={() => navigator.clipboard.writeText(secret)} className="text-white/30 hover:text-white/60 transition-colors">
                <Copy className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
          <div>
            <label className="text-white/50 text-xs font-mono block mb-1.5">Enter the 6-digit code from your app:</label>
            <div className="flex items-center gap-3">
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="000000"
                maxLength={6}
                className="w-36 px-3 py-2 rounded-lg border border-white/15 bg-black/40 text-white font-mono text-sm tracking-[0.3em] text-center focus:outline-none focus:border-violet-500/50"
              />
              <button
                onClick={verifyCode}
                disabled={code.length !== 6 || loading}
                className="px-4 py-2 rounded-lg bg-violet-600 text-white font-mono text-xs font-bold tracking-widest hover:bg-violet-500 transition-colors disabled:opacity-40"
              >
                {loading ? "VERIFYING..." : "VERIFY"}
              </button>
              <button
                onClick={() => { setPhase("idle"); setCode(""); setError(null); }}
                className="px-3 py-2 rounded-lg border border-white/10 text-white/40 font-mono text-xs hover:text-white/70 transition-colors"
              >
                CANCEL
              </button>
            </div>
          </div>
        </div>
      )}

      {phase === "enabled" && backupCodes.length > 0 && (
        <div className="space-y-3">
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span className="text-amber-300 text-xs font-mono font-bold tracking-wider">SAVE YOUR BACKUP CODES</span>
            </div>
            <p className="text-white/50 text-xs mb-3">
              Store these codes somewhere safe. Each code can be used once if you lose access to your authenticator app.
            </p>
            <div className="grid grid-cols-2 gap-1.5">
              {backupCodes.map((c, i) => (
                <code key={i} className="text-white/70 text-xs font-mono bg-black/30 px-2 py-1 rounded">{c}</code>
              ))}
            </div>
            <button
              onClick={() => navigator.clipboard.writeText(backupCodes.join("\n"))}
              className="mt-3 flex items-center gap-1.5 text-white/40 text-xs font-mono hover:text-white/70 transition-colors"
            >
              <Copy className="w-3 h-3" /> Copy all codes
            </button>
          </div>
          <button
            onClick={() => setBackupCodes([])}
            className="text-white/30 text-xs font-mono hover:text-white/50 transition-colors"
          >
            I've saved my backup codes
          </button>
        </div>
      )}

      {isEnabled && phase !== "setup" && backupCodes.length === 0 && (
        <div className="space-y-3">
          <p className="text-white/40 text-xs">
            Two-factor authentication is active. Enter a code from your authenticator app to disable it.
          </p>
          {phase === "disabling" ? (
            <div className="flex items-center gap-3">
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="000000"
                maxLength={6}
                className="w-36 px-3 py-2 rounded-lg border border-white/15 bg-black/40 text-white font-mono text-sm tracking-[0.3em] text-center focus:outline-none focus:border-red-500/50"
              />
              <button
                onClick={disable2FA}
                disabled={code.length !== 6 || loading}
                className="px-4 py-2 rounded-lg bg-red-600 text-white font-mono text-xs font-bold tracking-widest hover:bg-red-500 transition-colors disabled:opacity-40"
              >
                {loading ? "DISABLING..." : "CONFIRM DISABLE"}
              </button>
              <button
                onClick={() => { setPhase("idle"); setCode(""); setError(null); }}
                className="px-3 py-2 rounded-lg border border-white/10 text-white/40 font-mono text-xs hover:text-white/70 transition-colors"
              >
                CANCEL
              </button>
            </div>
          ) : (
            <button
              onClick={() => { setPhase("disabling"); setCode(""); setError(null); }}
              className="px-4 py-2 rounded-lg border border-red-500/30 text-red-400 font-mono text-xs font-bold tracking-widest hover:bg-red-500/10 transition-colors"
            >
              DISABLE 2FA
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function ReferralSection() {
  const [referralCode, setReferralCode] = useState("");
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [applyCode, setApplyCode] = useState("");
  const [applyMsg, setApplyMsg] = useState<{ type: "success" | "error"; msg: string } | null>(null);
  const [applying, setApplying] = useState(false);
  const { data: status } = useGetOmnimensStatus();

  useEffect(() => {
    (async () => {
      try {
        const [codeRes, statsRes] = await Promise.all([
          fetch("/api/omnimens/referral/code", { credentials: "include" }),
          fetch("/api/omnimens/referral/stats", { credentials: "include" }),
        ]);
        if (codeRes.ok) {
          const codeData = await codeRes.json();
          setReferralCode(codeData.referralCode);
        }
        if (statsRes.ok) {
          const statsData = await statsRes.json();
          setStats(statsData);
        }
      } catch {}
      setLoading(false);
    })();
  }, []);

  const shareUrl = referralCode
    ? `${window.location.origin}/godflesh/?ref=${referralCode}`
    : "";

  const copyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const copyCode = () => {
    navigator.clipboard.writeText(referralCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleApplyCode = async () => {
    if (!applyCode.trim()) return;
    setApplying(true);
    setApplyMsg(null);
    try {
      const res = await fetch("/api/omnimens/referral/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ referralCode: applyCode.trim() }),
      });
      const data = await res.json();
      if (res.ok) {
        setApplyMsg({ type: "success", msg: data.message || "Referral code applied!" });
        setApplyCode("");
      } else {
        setApplyMsg({ type: "error", msg: data.error || "Invalid referral code" });
      }
    } catch {
      setApplyMsg({ type: "error", msg: "Failed to apply code" });
    }
    setApplying(false);
  };

  if (loading) return null;

  const hasReferrer = !!(status as any)?.referredBy;

  return (
    <div data-theme="dark" className="rounded-2xl border border-white/8 p-6 space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
          <Users className="w-4 h-4 text-cyan-400" />
        </div>
        <div>
          <h3 className="text-white font-semibold text-sm tracking-wide">Referral Program</h3>
          <p className="text-white/40 text-xs font-mono">Earn 500 credits for every friend who makes a purchase</p>
        </div>
      </div>

      <div className="p-4 rounded-xl bg-gradient-to-r from-cyan-500/5 to-violet-500/5 border border-white/8 space-y-3">
        <div>
          <label className="text-white/40 text-[10px] font-mono tracking-wider block mb-1">YOUR REFERRAL CODE</label>
          <div className="flex items-center gap-2">
            <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-lg bg-black/40 border border-white/10">
              <code className="text-white font-mono text-sm tracking-[0.2em] font-bold">{referralCode}</code>
            </div>
            <button
              onClick={copyCode}
              className="px-3 py-2 rounded-lg border border-white/10 text-white/50 hover:text-white/80 transition-colors"
              title="Copy code"
            >
              {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div>
          <label className="text-white/40 text-[10px] font-mono tracking-wider block mb-1">SHARE LINK</label>
          <div className="flex items-center gap-2">
            <div className="flex-1 px-3 py-2 rounded-lg bg-black/40 border border-white/10 overflow-hidden">
              <code className="text-white/60 text-xs font-mono truncate block">{shareUrl}</code>
            </div>
            <button
              onClick={copyLink}
              className="px-3 py-2 rounded-lg bg-cyan-600 text-white hover:bg-cyan-500 transition-colors flex items-center gap-1.5"
            >
              <Link className="w-3.5 h-3.5" />
              <span className="text-xs font-mono font-bold tracking-wider">
                {copied ? "COPIED!" : "COPY"}
              </span>
            </button>
          </div>
        </div>
      </div>

      {stats && (
        <div className="grid grid-cols-3 gap-3">
          <div className="p-3 rounded-xl bg-white/3 border border-white/6 text-center">
            <div className="text-white font-bold text-lg">{stats.totalReferred}</div>
            <div className="text-white/30 text-[10px] font-mono tracking-wider">REFERRED</div>
          </div>
          <div className="p-3 rounded-xl bg-white/3 border border-white/6 text-center">
            <div className="text-green-400 font-bold text-lg">{stats.completedReferrals}</div>
            <div className="text-white/30 text-[10px] font-mono tracking-wider">COMPLETED</div>
          </div>
          <div className="p-3 rounded-xl bg-white/3 border border-white/6 text-center">
            <div className="text-cyan-400 font-bold text-lg">{stats.totalCreditsEarned}</div>
            <div className="text-white/30 text-[10px] font-mono tracking-wider">CREDITS EARNED</div>
          </div>
        </div>
      )}

      {!hasReferrer && (
        <div className="space-y-2">
          <label className="text-white/40 text-[10px] font-mono tracking-wider block">HAVE A REFERRAL CODE?</label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={applyCode}
              onChange={(e) => setApplyCode(e.target.value.toUpperCase())}
              placeholder="OMN-XXXXXXXX"
              className="flex-1 max-w-xs px-3 py-2 rounded-lg border border-white/15 bg-black/40 text-white font-mono text-xs tracking-wider focus:outline-none focus:border-cyan-500/50"
            />
            <button
              onClick={handleApplyCode}
              disabled={!applyCode.trim() || applying}
              className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white/70 font-mono text-xs font-bold tracking-widest hover:bg-white/10 transition-colors disabled:opacity-40"
            >
              {applying ? "APPLYING..." : "APPLY"}
            </button>
          </div>
          {applyMsg && (
            <p className={`text-xs font-mono ${applyMsg.type === "success" ? "text-green-400" : "text-red-400"}`}>
              {applyMsg.msg}
            </p>
          )}
        </div>
      )}

      <p className="text-white/25 text-[10px] font-mono">
        Share your code with friends. When they make their first purchase (any credit pack or subscription), you receive 500 bonus credits.
      </p>
    </div>
  );
}
