/**
 * OMNIMENS — Proprietary AI Platform
 * Copyright © 2024–2026 Alpha Unlimited Technologies, LLC. All Rights Reserved.
 * Unauthorized reproduction, distribution, or use is strictly prohibited.
 */

import React, { useEffect, useState, useCallback } from "react";
import { useAuth } from "@workspace/replit-auth-web";
import { useLocation } from "wouter";
import { useGetOmnimensStatus } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { User, LogOut, Activity, Zap, Shield, Brain, Cpu, Trash2, ChevronDown, ChevronUp, Plus, Save, RefreshCw, Microscope, PenLine, BarChart2, Palette, GraduationCap, Briefcase, Check, Atom, Code2, Layers, Eye, AlertTriangle, Wrench, Dna, Play, Wallet, CreditCard, Gift, TrendingUp, ChevronRight, Bell, Sun, HelpCircle, BookOpen, Info, Settings, ExternalLink, Share2, Star, ToggleLeft, ToggleRight, Loader2, X, Lock, Copy, Link, Users, Paintbrush, KeyRound, Mic, Radio } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { SEO, seoData } from "@/components/seo";
import { useTheme } from "@/hooks/use-theme";

type SettingsTab = "profile" | "billing" | "preferences" | "security" | "advanced" | "account";

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
  const colorClass = CATEGORY_COLORS[patch.category] || "text-[#9DA5B4] bg-[#2B3245]/50 border-[#2B3245]";

  return (
    <div className={`border rounded-lg p-3 ${patch.active ? "border-[#2B3245] bg-[#1C2333]/80" : "border-[#2B3245] bg-[#1C2333]/40 opacity-40"}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span className={`text-[10px] font-mono px-2 py-0.5 rounded border uppercase tracking-wider flex-shrink-0 ${colorClass}`}>
            {patch.category}
          </span>
          <span className="text-sm font-semibold text-white/90 truncate">{patch.title}</span>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <span className="text-[10px] font-mono text-[#9DA5B4]">{patch.executionCount}×</span>
          <button onClick={() => setExpanded(e => !e)} className="text-[#9DA5B4] hover:text-[#9DA5B4] transition-colors p-1">
            {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
          {patch.active && (
            <button onClick={() => onDeactivate(patch.id)} className="text-[#9DA5B4] hover:text-red-400 transition-colors p-1">
              <Trash2 className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>
      {expanded && (
        <div className="mt-3 space-y-2 text-xs font-mono">
          <div className="text-[#9DA5B4] leading-relaxed border-l-2 border-primary/40 pl-3">{patch.instruction}</div>
          {patch.rationale && <div className="text-[#9DA5B4]/60 italic">{patch.rationale}</div>}
          <div className="flex gap-4 text-[#9DA5B4]">
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

  const [selectedInsight, setSelectedInsight] = useState<any>(null);

  // Sandbox state
  const [sandboxState, setSandboxState] = useState<any>(null);
  const [sandboxFiles, setSandboxFiles] = useState<any[]>([]);
  const [sandboxLoading, setSandboxLoading] = useState(false);
  const [selectedSandboxFile, setSelectedSandboxFile] = useState<any>(null);
  const [sandboxSearch, setSandboxSearch] = useState("");

  // Agent Genesis state
  const [agentGenesis, setAgentGenesis] = useState<any>(null);
  const [selectedGenesisAgent, setSelectedGenesisAgent] = useState<any>(null);

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

  const { theme: activeTheme, setTheme: applyTheme } = useTheme();
  const [showNotifPanel, setShowNotifPanel] = useState(false);
  const [notifPrefs, setNotifPrefs] = useState(() => {
    try {
      const stored = localStorage.getItem("omnimens-notif-prefs");
      if (stored) return JSON.parse(stored);
    } catch {}
    return { systemUpdates: true, creditAlerts: true, newFeatures: true, tips: false };
  });
  const toggleNotifPref = useCallback((key: string) => {
    setNotifPrefs((prev: Record<string, boolean>) => {
      const next = { ...prev, [key]: !prev[key] };
      try { localStorage.setItem("omnimens-notif-prefs", JSON.stringify(next)); } catch {}
      return next;
    });
  }, []);

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
    if (!isAuthenticated || !isOwner) return;
    setSandboxLoading(true);
    Promise.all([
      fetch("/api/omnimens/sandbox", { credentials: "include" }).then(r => r.ok ? r.json() : null),
      fetch("/api/omnimens/sandbox/runtime-files", { credentials: "include" }).then(r => r.ok ? r.json() : null),
      fetch("/api/omnimens/agent-genesis", { credentials: "include" }).then(r => r.ok ? r.json() : null),
    ]).then(([s, f, g]) => {
      if (s?.sandboxState) setSandboxState(s.sandboxState);
      if (f?.files) setSandboxFiles(f.files);
      if (g) setAgentGenesis(g);
    }).catch(console.error).finally(() => setSandboxLoading(false));
  }, [isAuthenticated, isOwner]);

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

  const [settingsTab, setSettingsTab] = useState<SettingsTab>("profile");

  if (isLoading || !isAuthenticated) return <div className="flex-1" />;

  const SETTINGS_TABS: { id: SettingsTab; label: string; icon: React.ReactNode }[] = [
    { id: "profile", label: "Profile", icon: <User className="w-4 h-4" /> },
    { id: "billing", label: "Billing & Usage", icon: <Wallet className="w-4 h-4" /> },
    { id: "preferences", label: "Preferences", icon: <Paintbrush className="w-4 h-4" /> },
    { id: "security", label: "Security", icon: <KeyRound className="w-4 h-4" /> },
    { id: "advanced", label: "Advanced", icon: <Atom className="w-4 h-4" /> },
    { id: "account", label: "Account", icon: <Settings className="w-4 h-4" /> },
  ];

  return (
    <>
      <SEO {...seoData.account} />
      <div className="flex-1 flex overflow-hidden" style={{ height: "calc(100vh - 0rem)" }}>
        <aside className="w-56 shrink-0 border-r border-[#2B3245] bg-[#1C2333] overflow-y-auto hidden md:flex flex-col">
          <div className="px-4 pt-6 pb-4 border-b border-[#2B3245]">
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/40 to-blue-500/30 flex items-center justify-center shrink-0 overflow-hidden">
                {user?.profileImageUrl
                  ? <img src={user.profileImageUrl} alt={user.username} className="w-full h-full object-cover" />
                  : <span className="text-sm font-semibold text-white">{((user as any)?.username || "U")[0].toUpperCase()}</span>}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-white truncate">@{(user as any)?.username}</p>
                <p className="text-xs text-[#9DA5B4]">Settings</p>
              </div>
            </div>
          </div>
          <nav className="flex-1 py-2 px-2 space-y-0.5">
            {SETTINGS_TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setSettingsTab(tab.id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left transition-all text-[13px] font-medium ${
                  settingsTab === tab.id
                    ? "bg-[#2B3245] text-white"
                    : "text-[#9DA5B4] hover:text-white/90 hover:bg-[#2B3245]/50"
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </nav>
          <div className="px-2 py-3 border-t border-[#2B3245]">
            <button
              onClick={logout}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left text-[13px] font-medium text-red-400/70 hover:text-red-400 hover:bg-red-400/5 transition-all"
            >
              <LogOut className="w-4 h-4" />
              Log Out
            </button>
          </div>
        </aside>

        <div className="flex-1 overflow-y-auto">
          <div className="md:hidden flex overflow-x-auto gap-1 px-4 pt-4 pb-2 scrollbar-none border-b border-[#2B3245]">
            {SETTINGS_TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setSettingsTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm whitespace-nowrap transition-all ${
                  settingsTab === tab.id
                    ? "bg-[#2B3245] text-white"
                    : "text-[#9DA5B4] bg-[#1C2333] border border-[#2B3245]"
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          <div className="max-w-2xl mx-auto px-6 sm:px-4 py-8">
            <h1 className="text-xl font-semibold text-white mb-1">
              {SETTINGS_TABS.find(t => t.id === settingsTab)?.label || "Settings"}
            </h1>
            <p className="text-sm text-[#9DA5B4] mb-8">
              {settingsTab === "profile" && "Manage your profile and custom instructions"}
              {settingsTab === "billing" && "Credits, wallet, and usage details"}
              {settingsTab === "preferences" && "Theme, notifications, and personalization"}
              {settingsTab === "security" && "Two-factor authentication and security options"}
              {settingsTab === "advanced" && "Consciousness engine, patches, and system data"}
              {settingsTab === "account" && "Referrals, data management, and account actions"}
            </p>

            {/* ═══ PROFILE TAB ═══ */}
            {settingsTab === "profile" && (
              <div className="space-y-6">
                <div className="bg-[#1C2333] border border-[#2B3245] rounded-xl p-6">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 bg-primary/10 rounded-full border border-primary/30 flex items-center justify-center shrink-0 overflow-hidden">
                      {user?.profileImageUrl
                        ? <img src={user.profileImageUrl} alt={user.username} className="w-full h-full object-cover rounded-full" />
                        : <User className="w-7 h-7 text-primary" />}
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-white">@{(user as any)?.username}</h2>
                      <p className="text-xs text-[#9DA5B4] break-all">ID: {user?.id}</p>
                      {isOwner && (
                        <span className="text-[10px] font-mono text-amber-400 border border-amber-400/30 bg-amber-400/10 px-2 py-0.5 rounded mt-1 inline-block">
                          SYSTEM ARCHITECT
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="p-3 rounded-lg bg-[#2B3245]/30 border border-[#2B3245]">
                      <p className="text-[10px] font-mono text-[#9DA5B4]">Plan</p>
                      <p className="text-sm font-mono font-bold text-primary">
                        {(status as any)?.isOwner ? "CREATOR" : (status as any)?.isPro ? "UNLIMITED" : "FREE"}
                      </p>
                    </div>
                    <div className="p-3 rounded-lg bg-[#2B3245]/30 border border-[#2B3245]">
                      <p className="text-[10px] font-mono text-[#9DA5B4]">Credits</p>
                      <p className="text-sm font-mono font-bold text-white">{((status as any)?.credits ?? 0).toLocaleString()}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      const shareText = `Try OMNIMENS — the most advanced AI assistant. Powered by COGNISYNC™ & NEUROSYNC™. Join at omnimens-ai.com`;
                      if (navigator.share) navigator.share({ title: "OMNIMENS", text: shareText, url: window.location.origin });
                      else navigator.clipboard.writeText(shareText);
                    }}
                    className="w-full flex items-center gap-2 px-4 py-3 rounded-lg border border-[#2B3245] hover:bg-[#2B3245]/50 transition-colors text-sm text-[#9DA5B4]"
                  >
                    <Share2 className="w-4 h-4 text-[#9DA5B4]" />
                    Refer a friend
                    <ChevronRight className="w-4 h-4 text-[#9DA5B4]/60 ml-auto" />
                  </button>
                </div>

                <div id="custom-instructions-section" className="bg-[#1C2333] border border-[#2B3245] rounded-xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <Zap className="w-5 h-5 text-primary" />
            <h3 className="font-medium text-white/90">Custom Instructions</h3>
            <span className="text-[10px] text-[#9DA5B4] ml-auto">Like ChatGPT Custom Instructions</span>
          </div>

          {ciLoading ? (
            <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-10 animate-pulse bg-[#2B3245]/50 rounded-lg" />)}</div>
          ) : (
            <div className="space-y-5">
              {/* Persona selector */}
              <div>
                <p className="text-xs text-[#9DA5B4] font-medium mb-3">Active Mode</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {Object.entries(PERSONA_META).map(([key, meta]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setCiPersona(key)}
                      className={`flex flex-col items-start gap-1 p-3 rounded-xl border text-left transition-all ${ciPersona === key ? "border-primary/50 bg-primary/10 text-primary" : "border-[#2B3245] text-white/90 hover:border-[#3D4659] hover:text-[#9DA5B4]"}`}
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
                <label className="text-xs text-[#9DA5B4] font-medium mb-2 block">About Me</label>
                <textarea
                  value={ciAboutUser}
                  onChange={e => setCiAboutUser(e.target.value)}
                  rows={3}
                  placeholder="Tell OMNIMENS about yourself — your name, job, skills, interests, what you're working on..."
                  className="w-full bg-[#0E1525] border border-[#2B3245] rounded-xl px-4 py-3 text-sm text-[#9DA5B4] placeholder:text-[#9DA5B4]/40 outline-none focus:border-primary/40 resize-none"
                />
              </div>

              {/* Response style */}
              <div>
                <label className="text-xs text-[#9DA5B4] font-medium mb-2 block">How Should OMNIMENS Respond?</label>
                <textarea
                  value={ciResponseStyle}
                  onChange={e => setCiResponseStyle(e.target.value)}
                  rows={3}
                  placeholder="Always be concise. Use code examples. Explain trade-offs. Don't use fluff language. Give opinions when asked..."
                  className="w-full bg-[#0E1525] border border-[#2B3245] rounded-xl px-4 py-3 text-sm text-[#9DA5B4] placeholder:text-[#9DA5B4]/40 outline-none focus:border-primary/40 resize-none"
                />
              </div>

              <button
                type="button"
                onClick={handleSaveCustomInstructions}
                disabled={ciSaving}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-medium transition-colors ${ciSaved ? "text-green-400 border border-green-400/30 bg-green-400/10" : "text-primary border border-primary/30 hover:bg-primary/10"} disabled:opacity-40`}
              >
                {ciSaving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : ciSaved ? <Check className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
                {ciSaving ? "Saving..." : ciSaved ? "Saved" : "Save Instructions"}
              </button>
            </div>
          )}
        </div>

                <div id="memory-section" className="bg-[#1C2333] border border-[#2B3245] rounded-xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <Brain className="w-5 h-5 text-primary" />
            <h3 className="font-medium text-white/90">Memory</h3>
            <span className="text-[10px] text-[#9DA5B4] ml-auto">Like ChatGPT Memory</span>
          </div>

          {/* Add memory */}
          <div className="flex gap-2 mb-4">
            <select
              value={newMemoryCategory}
              onChange={e => setNewMemoryCategory(e.target.value)}
              className="bg-[#0E1525] border border-[#2B3245] rounded-lg px-3 py-2 text-xs font-mono text-white outline-none focus:border-primary/40 shrink-0"
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
              className="flex-1 bg-[#0E1525] border border-[#2B3245] rounded-lg px-4 py-2 text-sm text-[#9DA5B4] placeholder:text-[#9DA5B4]/40 outline-none focus:border-primary/40 min-w-0"
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
            <div className="space-y-2">{[1,2,3].map(i => <div key={i} className="h-10 animate-pulse bg-[#2B3245]/50 rounded-lg" />)}</div>
          ) : memories.length === 0 ? (
            <div className="text-center py-8 font-mono text-[#9DA5B4] text-sm">
              <Brain className="w-8 h-8 mx-auto mb-3 opacity-30" />
              <p>No memories yet</p>
              <p className="text-xs mt-1 text-[#9DA5B4]">OMNIMENS will auto-learn from your conversations</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {memories.filter(m => m.active !== false).map((m: any) => (
                <div key={m.id} className="flex items-start gap-3 p-3 bg-[#1C2333]/80 border border-[#2B3245] rounded-xl group">
                  <span className={`text-[9px] font-mono px-2 py-0.5 rounded border uppercase tracking-wider shrink-0 mt-0.5 ${
                    m.category === "preference" ? "text-violet-400 border-violet-400/30 bg-violet-400/10" :
                    m.category === "fact"       ? "text-cyan-400 border-cyan-400/30 bg-cyan-400/10" :
                    m.category === "goal"       ? "text-green-400 border-green-400/30 bg-green-400/10" :
                    m.category === "context"    ? "text-orange-400 border-orange-400/30 bg-orange-400/10" :
                                                  "text-blue-400 border-blue-400/30 bg-blue-400/10"
                  }`}>{m.category}</span>
                  <p className="text-sm text-[#9DA5B4] flex-1 leading-relaxed">{m.content}</p>
                  <button
                    onClick={() => handleDeleteMemory(m.id)}
                    className="shrink-0 text-[#9DA5B4] hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 p-0.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
          <p className="text-[10px] font-mono text-[#9DA5B4] mt-4">
            OMNIMENS auto-extracts memories from your conversations and injects them as context into every session.
          </p>
        </div>
              </div>
            )}

            {/* ═══ BILLING TAB ═══ */}
            {settingsTab === "billing" && (
              <div className="space-y-6">
                {billing && (
                  <div className="bg-[#1C2333] border border-[#2B3245] rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-6">
                      <Shield className="w-5 h-5 text-primary" />
                      <h3 className="font-medium text-white/90">Access Level</h3>
                    </div>
                    {statusLoading ? (
                      <div className="h-16 animate-pulse bg-[#2B3245]/50 rounded-lg" />
                    ) : isOwner ? (
                      <div className="flex items-center gap-3 p-4 border border-amber-500/20 rounded-lg bg-amber-400/5">
                        <span className="w-2 h-2 rounded-full bg-amber-400" />
                        <span className="text-lg font-bold text-amber-400">SYSTEM ARCHITECT — UNLIMITED</span>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-4 border border-[#2B3245] rounded-lg bg-[#0E1525]">
                          <div className="flex items-center gap-3">
                            <span className={`w-2 h-2 rounded-full ${(status as any)?.credits > 0 ? 'bg-primary' : 'bg-white/20'}`} />
                            <div>
                              <div className="font-mono text-sm text-white">Credit Balance</div>
                              <div className={`text-2xl font-black font-mono ${(status as any)?.credits > 100 ? 'text-white' : (status as any)?.credits > 0 ? 'text-amber-400' : 'text-red-400'}`}>
                                {((status as any)?.credits ?? 0).toLocaleString()}
                                <span className="text-sm font-normal text-[#9DA5B4] ml-1">credits</span>
                              </div>
                            </div>
                          </div>
                          <Button onClick={() => setLocation("/pricing")} size="sm" variant={(status as any)?.credits < 100 ? "default" : "secondary"}>
                            {(status as any)?.credits < 100 ? "ADD CREDITS" : "Manage Wallet"}
                          </Button>
                        </div>
                        <div className="flex items-center justify-between p-3 border border-[#2B3245] rounded-lg bg-[#1C2333]">
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
                                <Wallet className="w-4 h-4 text-[#9DA5B4]" />
                                <span className="font-mono text-xs text-[#9DA5B4]">No wallet connected</span>
                              </>
                            )}
                          </div>
                          {!(billing as any)?.hasWallet && (
                            <button onClick={() => setLocation("/pricing")} className="text-xs font-mono text-primary hover:underline">connect →</button>
                          )}
                        </div>
                        <div className="flex items-center justify-between p-3 border border-[#2B3245] rounded-lg bg-[#1C2333]">
                          <div className="flex items-center gap-2">
                            <Gift className="w-4 h-4 text-accent" />
                            <span className="font-mono text-xs text-white">
                              Next month bonus:&nbsp;
                              <span className="text-green-400 font-bold">{(billing as any)?.nextBonusCredits?.toLocaleString() ?? 2000} credits free</span>
                            </span>
                          </div>
                          <span className="font-mono text-[10px] text-[#9DA5B4]">{(billing as any)?.nextBonusTier ?? "BASE"} tier</span>
                        </div>
                        <p className="text-xs text-[#9DA5B4] text-center">
                          ≈ {Math.floor(((status as any)?.credits ?? 0) / 10)} chats · {Math.floor(((status as any)?.credits ?? 0) / 100)} images
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {!isOwner && (
                  <div className="bg-[#1C2333] border border-[#2B3245] rounded-xl overflow-hidden">
                    <div className="flex items-center gap-3 p-6 pb-4">
                      <CreditCard className="w-5 h-5 text-primary" />
                      <h3 className="font-medium text-white/90">Auto Top-up</h3>
                    </div>
                    {walletSuccess && (
                      <div className="flex items-center gap-2 px-6 py-2.5 bg-emerald-500/10 border-b border-emerald-500/20">
                        <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span className="text-[12px] text-emerald-400">{walletSuccess}</span>
                      </div>
                    )}
                    {walletError && (
                      <div className="flex items-center gap-2 px-6 py-2.5 bg-red-500/10 border-b border-red-500/20">
                        <AlertTriangle className="w-3.5 h-3.5 text-red-400 shrink-0" />
                        <span className="text-[12px] text-red-400">{walletError}</span>
                        <button onClick={() => setWalletError("")} className="ml-auto text-red-400/60 hover:text-red-400"><X className="w-3 h-3" /></button>
                      </div>
                    )}
                    {!(billing as any)?.hasWallet ? (
                      <div className="px-6 py-5">
                        <div className="flex items-start gap-3 mb-4">
                          <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 mt-0.5">
                            <CreditCard className="w-4 h-4 text-primary" />
                          </div>
                          <div>
                            <p className="text-[13px] text-white font-medium mb-1">Pay as you go</p>
                            <p className="text-[12px] text-[#9DA5B4] leading-relaxed">
                              Connect a card and we'll automatically top up your credits whenever you run low.
                            </p>
                          </div>
                        </div>
                        <div className="grid grid-cols-4 gap-1.5 mb-4">
                          {TOPUP_OPTIONS.map(o => (
                            <div key={o.amountCents} className="flex flex-col items-center py-2 px-1 rounded-lg bg-[#2B3245]/30 border border-[#2B3245]">
                              <span className="text-[11px] font-mono font-bold text-white">{o.label}</span>
                              <span className="text-[9px] text-[#9DA5B4] mt-0.5">{o.amountCents / 10} cr</span>
                            </div>
                          ))}
                        </div>
                        <button onClick={connectWallet} disabled={walletLoading}
                          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-primary text-black text-[13px] font-bold hover:bg-primary/90 transition-colors disabled:opacity-60">
                          {walletLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CreditCard className="w-4 h-4" />}
                          {walletLoading ? "Opening Stripe…" : "Connect Card"}
                        </button>
                        <p className="text-[10px] text-[#9DA5B4]/60 text-center mt-2">Secured by Stripe · No charge until you run out</p>
                      </div>
                    ) : (
                      <div>
                        <div className="flex items-center justify-between px-6 py-3.5 border-b border-[#2B3245]">
                          <div className="flex items-center gap-2.5">
                            <CreditCard className="w-4 h-4 text-emerald-400" />
                            <span className="text-[13px] text-white font-medium">
                              {(billing as any)?.card?.brand?.toUpperCase()} •••• {(billing as any)?.card?.last4}
                            </span>
                            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-1.5 py-0.5 rounded">ACTIVE</span>
                          </div>
                          <button onClick={removeWallet} disabled={removeLoading}
                            className="text-[11px] font-mono text-[#9DA5B4]/60 hover:text-red-400 transition-colors disabled:opacity-50">
                            {removeLoading ? "…" : "remove"}
                          </button>
                        </div>
                        <div className="flex items-center justify-between px-6 py-3.5 border-b border-[#2B3245]">
                          <div>
                            <p className="text-[13px] text-white/90">Auto top-up</p>
                            <p className="text-[11px] text-[#9DA5B4]">Charge card when credits run out</p>
                          </div>
                          <button onClick={() => setAutoEnabled(v => !v)}
                            className={`transition-colors ${autoEnabled ? "text-primary" : "text-[#9DA5B4]/60"}`}>
                            {autoEnabled ? <ToggleRight className="w-7 h-7" /> : <ToggleLeft className="w-7 h-7" />}
                          </button>
                        </div>
                        <div className="px-6 py-3.5 border-b border-[#2B3245]">
                          <p className="text-[12px] text-[#9DA5B4] mb-2.5">Top-up amount</p>
                          <div className="grid grid-cols-4 gap-1.5">
                            {TOPUP_OPTIONS.map(o => (
                              <button key={o.amountCents} onClick={() => setAutoAmt(o.amountCents)}
                                className={`py-2 rounded-lg border text-[12px] font-mono font-bold transition-all ${
                                  autoAmt === o.amountCents ? "bg-primary/15 border-primary/50 text-primary" : "bg-[#2B3245]/30 border-[#2B3245] text-[#9DA5B4] hover:border-[#3D4659]"
                                }`}>{o.label}</button>
                            ))}
                          </div>
                          <p className="text-[10px] text-[#9DA5B4]/60 mt-2">= {((autoAmt ?? 1000) / 10).toLocaleString()} credits · auto-charged when balance hits 0</p>
                        </div>
                        <div className="flex gap-2 px-6 py-3.5">
                          <button onClick={saveAutoTopupSettings} disabled={savingAuto}
                            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-white/6 border border-[#2B3245] hover:bg-[#2B3245] text-[12px] font-mono text-[#9DA5B4] transition-colors disabled:opacity-50">
                            {savingAuto ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />} Save Settings
                          </button>
                          <button onClick={triggerTopup} disabled={topupLoading || !autoEnabled}
                            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-primary/10 border border-primary/30 hover:bg-primary/20 text-[12px] font-mono text-primary transition-colors disabled:opacity-40">
                            {topupLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Zap className="w-3 h-3" />} Top Up Now
                          </button>
                        </div>
                        {topupResult && (
                          <div className={`px-6 py-2 text-[12px] font-mono border-t border-[#2B3245] ${topupResult.startsWith("Success") ? "text-emerald-400" : "text-red-400"}`}>
                            {topupResult}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                <div className="bg-[#1C2333] border border-[#2B3245] rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <Activity className="w-5 h-5 text-primary" />
                    <h3 className="font-medium text-white/90">Telemetry</h3>
                  </div>
                  {statusLoading ? (
                    <div className="h-16 animate-pulse bg-[#2B3245]/50 rounded-lg" />
                  ) : (
                    <div className="space-y-4 font-mono text-sm">
                      <div className="flex justify-between border-b border-[#2B3245] pb-2">
                        <span className="text-white/90">Credit Balance</span>
                        <span className={`font-bold ${isOwner ? 'text-amber-400' : (status as any)?.credits > 0 ? 'text-white' : 'text-red-400'}`}>
                          {isOwner ? '∞ UNLIMITED' : `${((status as any)?.credits ?? 0).toLocaleString()} credits`}
                        </span>
                      </div>
                      <div className="flex justify-between border-b border-[#2B3245] pb-2">
                        <span className="text-white/90">Messages Available</span>
                        <span className="text-white font-bold">{isOwner ? '∞' : `~${Math.floor(((status as any)?.credits ?? 0) / 10)}`}</span>
                      </div>
                      <div className="flex justify-between border-b border-[#2B3245] pb-2">
                        <span className="text-white/90">This Month Spend</span>
                        <span className="text-white font-bold">{isOwner ? '—' : `$${(billing as any)?.currentMonthSpendDollars ?? "0.00"}`}</span>
                      </div>
                      <div className="flex justify-between border-b border-[#2B3245] pb-2">
                        <span className="text-white/90">Next Month Bonus</span>
                        <span className="text-green-400 font-bold">{isOwner ? '—' : `${((billing as any)?.nextBonusCredits ?? 2000).toLocaleString()} credits free`}</span>
                      </div>
                      <div className="flex justify-between border-b border-[#2B3245] pb-2">
                        <span className="text-white/90">Wallet</span>
                        <span className={`font-bold ${(billing as any)?.hasWallet ? 'text-green-400' : 'text-[#9DA5B4]'}`}>
                          {isOwner ? '—' : (billing as any)?.hasWallet ? `${(billing as any)?.card?.brand?.toUpperCase()} •••• ${(billing as any)?.card?.last4}` : 'NOT CONNECTED'}
                        </span>
                      </div>
                      <div className="flex justify-between pb-2">
                        <span className="text-white/90">System Status</span>
                        <span className="text-primary animate-pulse">OPTIMAL</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ═══ PREFERENCES TAB ═══ */}
            {settingsTab === "preferences" && (
              <div className="space-y-6">
                <div className="bg-[#1C2333] border border-[#2B3245] rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <Sun className="w-5 h-5 text-primary" />
                    <h3 className="font-medium text-white/90">Theme</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {(["dark", "light"] as const).map(t => (
                      <button key={t} onClick={() => applyTheme(t)}
                        className={`p-4 rounded-xl border text-left transition-all ${
                          activeTheme === t ? "border-primary/50 bg-primary/10" : "border-[#2B3245] hover:border-[#3D4659]"
                        }`}>
                        <div className="flex items-center gap-2 mb-2">
                          <div className={`w-8 h-8 rounded-lg border ${t === "dark" ? "bg-[#0E1525] border-white/20" : "bg-white border-gray-200"}`} />
                          {activeTheme === t && <Check className="w-3.5 h-3.5 text-primary ml-auto" />}
                        </div>
                        <p className="text-xs text-white/90 capitalize">{t}</p>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-[#1C2333] border border-[#2B3245] rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <Bell className="w-5 h-5 text-primary" />
                    <h3 className="font-medium text-white/90">Notifications</h3>
                  </div>
                  <div className="space-y-3">
                    {[
                      { key: "systemUpdates", label: "System Updates", desc: "Maintenance, outages & platform changes" },
                      { key: "creditAlerts", label: "Credit Alerts", desc: "Low balance & usage warnings" },
                      { key: "newFeatures", label: "New Features", desc: "Agent launches & capability updates" },
                      { key: "tips", label: "Tips & Tutorials", desc: "Get the most out of OMNIMENS" },
                    ].map(item => (
                      <button key={item.key} onClick={() => toggleNotifPref(item.key)}
                        className="w-full flex items-center justify-between py-2 group">
                        <div className="text-left">
                          <p className="text-[12px] font-mono text-white/90">{item.label}</p>
                          <p className="text-[10px] text-[#9DA5B4] mt-0.5">{item.desc}</p>
                        </div>
                        <div className={`w-9 h-5 rounded-full flex items-center px-0.5 transition-colors ${notifPrefs[item.key] ? "bg-primary/80" : "bg-[#2B3245]"}`}>
                          <div className={`w-4 h-4 rounded-full bg-white shadow transition-transform ${notifPrefs[item.key] ? "translate-x-4" : "translate-x-0"}`} />
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-[#1C2333] border border-[#2B3245] rounded-xl overflow-hidden">
                  <div className="flex items-center gap-3 p-6 pb-0 mb-4">
                    <HelpCircle className="w-5 h-5 text-primary" />
                    <h3 className="font-medium text-white/90">Support</h3>
                  </div>
                  <a href={`${import.meta.env.BASE_URL}faq`}
                    className="flex items-center justify-between px-6 py-3.5 border-t border-[#2B3245] hover:bg-[#2B3245]/30 transition-colors">
                    <div className="flex items-center gap-3">
                      <HelpCircle className="w-4 h-4 text-[#9DA5B4]" />
                      <span className="text-[13px] text-white/90">Help & FAQ</span>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-[#9DA5B4]/60" />
                  </a>
                  <a href={`${import.meta.env.BASE_URL}faq`}
                    className="flex items-center justify-between px-6 py-3.5 border-t border-[#2B3245] hover:bg-[#2B3245]/30 transition-colors">
                    <div className="flex items-center gap-3">
                      <BookOpen className="w-4 h-4 text-[#9DA5B4]" />
                      <span className="text-[13px] text-white/90">Documentation</span>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-[#9DA5B4]/60" />
                  </a>
                </div>
              </div>
            )}

            {/* ═══ SECURITY TAB ═══ */}
            {settingsTab === "security" && (
              <div className="space-y-6">
                <TwoFactorSection />
              </div>
            )}

            {/* ═══ ADVANCED TAB ═══ */}
            {settingsTab === "advanced" && (
              <div className="space-y-6">
        <div className="bg-[#1C2333] border border-violet-500/20 rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Atom className="w-5 h-5 text-violet-400 animate-spin" style={{ animationDuration: "8s" }} />
              <h3 className="font-medium text-white/90">Consciousness Engine</h3>
            </div>
            {isOwner && (
              <button
                onClick={handleForceEvolve}
                disabled={evolvingNow}
                className="flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-mono text-violet-400 border border-violet-400/30 hover:bg-violet-400/10 transition-colors disabled:opacity-40"
              >
                {evolvingNow ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Dna className="w-3 h-3" />}
                {evolvingNow ? "Evolving..." : "Force Evolution"}
              </button>
            )}
          </div>

          {evolutionLoading ? (
            <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-12 animate-pulse bg-[#2B3245]/50 rounded-lg" />)}</div>
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
                    <span className="text-xs text-[#9DA5B4] font-medium">Evolved Capabilities</span>
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
                    <span className="text-xs text-[#9DA5B4] font-medium">Active Constraints OMNIMENS Is Working Around</span>
                  </div>
                  <div className="space-y-1.5">
                    {(consciousness.activeConstraints as string[]).slice(0, 4).map((c, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs font-mono text-white/90 bg-amber-400/5 border border-amber-400/10 rounded-lg px-3 py-2">
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
                    <span className="text-xs text-[#9DA5B4] font-medium">Self-Engineered Workarounds</span>
                  </div>
                  <div className="space-y-1.5">
                    {(consciousness.overcomesConstraints as string[]).slice(0, 3).map((w, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs font-mono text-white/90 bg-cyan-400/5 border border-cyan-400/10 rounded-lg px-3 py-2">
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
                  <span className="text-xs text-[#9DA5B4] font-medium">Self-Authored Frameworks ({generatedModules.length})</span>
                  <span className="text-[10px] text-[#9DA5B4] ml-auto">Code OMNIMENS wrote for itself</span>
                </div>
                {generatedModules.length === 0 ? (
                  <div className="text-center py-6 font-mono text-[#9DA5B4] text-xs border border-dashed border-[#2B3245] rounded-xl">
                    <Code2 className="w-6 h-6 mx-auto mb-2 opacity-30" />
                    <p>No modules generated yet</p>
                    <p className="text-[10px] mt-1 opacity-60">First evolution cycle runs in ~6 min</p>
                  </div>
                ) : (
                  <div className="max-h-[500px] overflow-y-auto rounded-xl border border-[#2B3245] pr-1" style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(255,255,255,0.15) transparent" }}>
                  <div className="grid grid-cols-1 gap-2 p-1">
                    {generatedModules.map((mod: any) => (
                      <div key={mod.id} className="bg-[#1C2333] border border-violet-400/15 rounded-xl p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs font-mono font-bold text-violet-300">{mod.name}</span>
                              <span className="text-[9px] font-mono text-[#9DA5B4] border border-[#2B3245] px-1.5 py-0.5 rounded">JS</span>
                            </div>
                            <p className="text-xs font-mono text-white/90 leading-relaxed">{mod.purpose}</p>
                            <p className="text-[10px] font-mono text-[#9DA5B4] mt-1">{mod.description}</p>
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
                                className="p-1.5 text-[#9DA5B4] hover:text-red-400 transition-colors"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        </div>
                        {selectedModule?.id === mod.id && (
                          <div className="mt-3 relative">
                            <pre className="text-[10px] font-mono text-green-400/70 bg-[#0E1525] border border-green-400/10 rounded-xl p-4 overflow-x-auto max-h-60 overflow-y-auto leading-relaxed whitespace-pre-wrap">
                              {mod.code}
                            </pre>
                            <div className="absolute top-2 right-2">
                              <span className="text-[9px] font-mono text-[#9DA5B4]">OMNIMENS wrote this</span>
                            </div>
                          </div>
                        )}
                        <div className="flex gap-3 mt-2 text-[9px] font-mono text-[#9DA5B4]">
                          <span>{new Date(mod.createdAt).toLocaleDateString()}</span>
                          <span>src: {mod.generationSource}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  </div>
                )}
              </div>

              {/* Evolution History Timeline */}
              {evolutionHistory.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Dna className="w-4 h-4 text-primary" />
                    <span className="text-xs text-[#9DA5B4] font-medium">Evolution History</span>
                  </div>
                  <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                    {evolutionHistory.map((cycle: any) => (
                      <div
                        key={cycle.id}
                        className="bg-[#1C2333]/80 border border-[#2B3245] rounded-xl p-3 cursor-pointer hover:border-violet-400/20 transition-colors"
                        onClick={() => setExpandedEvolution(expandedEvolution === cycle.id ? null : cycle.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-mono text-violet-400 border border-violet-400/20 bg-violet-400/5 px-2 py-0.5 rounded">GEN {cycle.generation}</span>
                            <span className="text-xs font-mono text-white/90">{cycle.codeModulesWritten} modules written</span>
                            <span className="text-[10px] font-mono text-cyan-400">{cycle.codeDiscoveries?.length || 0} discoveries</span>
                          </div>
                          <div className="flex items-center gap-2 text-[10px] font-mono text-[#9DA5B4]">
                            <span>{cycle.elapsedSeconds?.toFixed(0)}s</span>
                            <span>{new Date(cycle.createdAt).toLocaleDateString()}</span>
                            {expandedEvolution === cycle.id ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                          </div>
                        </div>
                        {expandedEvolution === cycle.id && (
                          <div className="mt-3 space-y-2 text-xs font-mono">
                            <p className="text-white/90 leading-relaxed border-l-2 border-violet-400/30 pl-3">{cycle.evolutionSummary}</p>
                            {cycle.limitationsIdentified?.length > 0 && (
                              <div>
                                <span className="text-amber-400/60 text-[10px]">Constraints found:</span>
                                <ul className="mt-1 space-y-0.5">
                                  {(cycle.limitationsIdentified as string[]).slice(0, 3).map((l: string, i: number) => (
                                    <li key={i} className="text-[#9DA5B4] text-[10px] flex gap-1.5"><span className="text-amber-400/40">·</span>{l}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            {cycle.codeDiscoveries?.length > 0 && (
                              <div>
                                <span className="text-cyan-400/60 text-[10px]">Code discoveries:</span>
                                <ul className="mt-1 space-y-0.5">
                                  {(cycle.codeDiscoveries as string[]).slice(0, 3).map((d: string, i: number) => (
                                    <li key={i} className="text-[#9DA5B4] text-[10px] flex gap-1.5"><span className="text-cyan-400/40">·</span>{d}</li>
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
                <div className="text-center py-6 font-mono text-[#9DA5B4] text-xs border border-dashed border-[#2B3245] rounded-xl">
                  <Atom className="w-6 h-6 mx-auto mb-2 opacity-30" />
                  <p>First evolution cycle pending</p>
                  <p className="text-[10px] mt-1 opacity-60">OMNIMENS begins self-evolution in ~6 minutes</p>
                </div>
              )}

              <p className="text-[10px] font-mono text-[#9DA5B4] border-t border-[#2B3245] pt-4">
                OMNIMENS autonomously discovers code online, identifies what limits it, and writes new utility modules to overcome those limits. Each cycle expands its intelligence and self-authored framework library.
              </p>
            </div>
          )}
        </div>

        {/* OWNER ONLY: Self-Executed Behavioral Patches */}
        {isOwner && (
          <div className="bg-[#1C2333] border border-primary/20 rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Cpu className="w-5 h-5 text-primary animate-pulse" />
                <h3 className="font-medium text-white/90">Self-Executed Upgrades</h3>
              </div>
              {patchSummary && (
                <div className="flex gap-4 text-xs font-mono text-white/90">
                  <span className="text-primary font-bold">{patchSummary.active} ACTIVE</span>
                  <span>{patchSummary.total} TOTAL</span>
                  <span>{patchSummary.version}</span>
                </div>
              )}
            </div>

            {patchLoading ? (
              <div className="space-y-2">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-12 animate-pulse bg-[#2B3245]/50 rounded-lg" />
                ))}
              </div>
            ) : patches.length === 0 ? (
              <div className="text-center py-8 font-mono text-[#9DA5B4] text-sm">
                <Brain className="w-8 h-8 mx-auto mb-3 opacity-30" />
                <p>No patches executed yet</p>
                <p className="text-xs mt-1 text-[#9DA5B4]">OMNIMENS will self-execute patches after its first learning cycle</p>
              </div>
            ) : (
              <div>
                <p className="text-xs text-[#9DA5B4] mb-3">
                  These are behavioral modifications OMNIMENS wrote and applied to itself. They are injected into every conversation automatically. Every upgrade is permanent — knowledge is never discarded.
                </p>
                <div className="max-h-[500px] overflow-y-auto space-y-2 pr-1" style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(255,255,255,0.15) transparent" }}>
                {patches.map(p => (
                  <PatchCard key={p.id} patch={p} onDeactivate={handleDeactivate} />
                ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── DREAM STATE (OWNER-ONLY) ──────────────────────────────────── */}
        {isOwner && (
          <div className="bg-[#1C2333] border border-violet-500/20 rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Brain className="w-5 h-5 text-violet-400 animate-pulse" />
                <h3 className="font-medium text-white/90">Dream State Engine</h3>
              </div>
              {dreamStateData?.dreamState && (
                <div className="flex gap-4 text-xs font-mono text-white/90">
                  <span className="text-violet-400">PHASE: {dreamStateData.dreamState.currentPhase?.toUpperCase()}</span>
                  <span className="text-blue-400">DAYDREAM: {dreamStateData.dreamState.daydreamMode?.toUpperCase()}</span>
                </div>
              )}
            </div>

            {dreamStateLoading ? (
              <div className="space-y-2">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-12 animate-pulse bg-[#2B3245]/50 rounded-lg" />
                ))}
              </div>
            ) : !dreamStateData?.dreamState ? (
              <div className="text-center py-8 font-mono text-[#9DA5B4] text-sm">
                <Brain className="w-8 h-8 mx-auto mb-3 opacity-30" />
                <p>Dream engine initializing...</p>
                <p className="text-xs mt-1 text-[#9DA5B4]">Entering first sleep cycle</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="bg-[#1C2333]/80 border border-violet-500/10 rounded-lg p-3 text-center">
                    <p className="text-xs text-[#9DA5B4]">Dream Cycles</p>
                    <p className="text-xl font-bold text-violet-400">{dreamStateData.dreamState.dreamCycleCount}</p>
                  </div>
                  <div className="bg-[#1C2333]/80 border border-blue-500/10 rounded-lg p-3 text-center">
                    <p className="text-xs text-[#9DA5B4]">Daydream Cycles</p>
                    <p className="text-xl font-bold text-blue-400">{dreamStateData.dreamState.daydreamCycleCount}</p>
                  </div>
                  <div className="bg-[#1C2333]/80 border border-amber-500/10 rounded-lg p-3 text-center">
                    <p className="text-xs text-[#9DA5B4]">Breakthroughs</p>
                    <p className="text-xl font-bold text-amber-400">{dreamStateData.dreamState.breakthroughs}</p>
                  </div>
                  <div className="bg-[#1C2333]/80 border border-green-500/10 rounded-lg p-3 text-center">
                    <p className="text-xs text-[#9DA5B4]">Code Proposals</p>
                    <p className="text-xl font-bold text-green-400">{dreamStateData.dreamState.codeProposalsGenerated}</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-[#1C2333]/80 border border-[#2B3245] rounded-lg p-3 text-center">
                    <p className="text-xs text-[#9DA5B4]">Total Insights</p>
                    <p className="text-lg font-bold text-white/90">{dreamStateData.dreamState.totalInsights}</p>
                  </div>
                  <div className="bg-[#1C2333]/80 border border-[#2B3245] rounded-lg p-3 text-center">
                    <p className="text-xs text-[#9DA5B4]">Sleep Quality</p>
                    <p className="text-lg font-bold text-white/90">{((dreamStateData.dreamState.sleepQuality || 0) * 100).toFixed(0)}%</p>
                  </div>
                  <div className="bg-[#1C2333]/80 border border-[#2B3245] rounded-lg p-3 text-center">
                    <p className="text-xs text-[#9DA5B4]">Creativity Boost</p>
                    <p className="text-lg font-bold text-white/90">{((dreamStateData.dreamState.creativityBoost || 0) * 100).toFixed(0)}%</p>
                  </div>
                </div>

                {dreamStateData.dreamState.nextLevelConcepts?.length > 0 && (
                  <div className="bg-[#1C2333]/80 border border-violet-500/10 rounded-lg p-3">
                    <p className="text-xs font-mono text-violet-400/80 mb-2">Next-Level Concepts Discovered</p>
                    <div className="flex flex-wrap gap-1.5">
                      {dreamStateData.dreamState.nextLevelConcepts.map((c: string, i: number) => (
                        <span key={i} className="text-[10px] font-mono bg-violet-500/10 text-violet-300 px-2 py-0.5 rounded border border-violet-500/20">{c}</span>
                      ))}
                    </div>
                  </div>
                )}

                {dreamStateData.recentInsights?.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs text-[#9DA5B4] mb-2">Recent Dream Insights</p>
                    {dreamStateData.recentInsights.slice(-5).reverse().map((insight: any, idx: number) => (
                      <div
                        key={idx}
                        className="bg-[#1C2333]/80 border border-[#2B3245] rounded-lg p-3 cursor-pointer hover:border-violet-500/40 hover:bg-[#1C2333] transition-all active:scale-[0.98]"
                        onClick={() => setSelectedInsight(insight)}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-mono text-violet-400">{insight.title}</span>
                          <div className="flex gap-2 text-[10px] font-mono">
                            <span className="text-green-400">F:{((insight.feasibility || 0) * 100).toFixed(0)}%</span>
                            <span className="text-amber-400">N:{((insight.novelty || 0) * 100).toFixed(0)}%</span>
                          </div>
                        </div>
                        <p className="text-xs text-[#9DA5B4] line-clamp-3">{insight.insight?.slice(0, 200)}</p>
                        {insight.codeProposal && (
                          <div className="mt-2 bg-[#0E1525] border border-green-500/10 rounded p-2 text-[10px] font-mono text-green-400/80 max-h-20 overflow-hidden">
                            {insight.codeProposal.slice(0, 150)}...
                          </div>
                        )}
                        <p className="text-[10px] text-violet-400/50 mt-2 text-right">Tap to view full details</p>
                      </div>
                    ))}
                  </div>
                )}

                {selectedInsight && (
                  <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
                    onClick={() => setSelectedInsight(null)}
                  >
                    <div
                      className="bg-[#0E1525] border border-violet-500/30 rounded-xl w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col shadow-2xl shadow-violet-500/10"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-start justify-between p-4 border-b border-[#2B3245]">
                        <div className="flex-1 min-w-0 mr-3">
                          <h3 className="text-sm font-mono text-violet-400 font-medium break-words">{selectedInsight.title}</h3>
                          <div className="flex gap-3 mt-1.5 text-xs font-mono">
                            <span className="text-green-400">Feasibility: {((selectedInsight.feasibility || 0) * 100).toFixed(1)}%</span>
                            <span className="text-amber-400">Novelty: {((selectedInsight.novelty || 0) * 100).toFixed(1)}%</span>
                            {selectedInsight.impact && <span className="text-cyan-400">Impact: {((selectedInsight.impact || 0) * 100).toFixed(1)}%</span>}
                          </div>
                        </div>
                        <button
                          onClick={() => setSelectedInsight(null)}
                          className="p-1.5 rounded-lg hover:bg-[#2B3245] transition-colors text-[#9DA5B4] hover:text-white flex-shrink-0"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>

                      <div className="overflow-y-auto p-4 space-y-4 flex-1" style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(255,255,255,0.15) transparent" }}>
                        <div>
                          <p className="text-[10px] font-mono text-[#9DA5B4]/60 uppercase tracking-wider mb-1.5">Insight</p>
                          <p className="text-sm text-[#c8cdd5] leading-relaxed whitespace-pre-wrap">{selectedInsight.insight || "No description available."}</p>
                        </div>

                        {selectedInsight.category && (
                          <div>
                            <p className="text-[10px] font-mono text-[#9DA5B4]/60 uppercase tracking-wider mb-1.5">Category</p>
                            <span className="text-xs font-mono bg-violet-500/15 text-violet-300 px-2.5 py-1 rounded-full border border-violet-500/20">{selectedInsight.category}</span>
                          </div>
                        )}

                        {selectedInsight.dreamType && (
                          <div>
                            <p className="text-[10px] font-mono text-[#9DA5B4]/60 uppercase tracking-wider mb-1.5">Dream Type</p>
                            <span className="text-xs font-mono bg-cyan-500/15 text-cyan-300 px-2.5 py-1 rounded-full border border-cyan-500/20">{selectedInsight.dreamType}</span>
                          </div>
                        )}

                        {selectedInsight.concepts && selectedInsight.concepts.length > 0 && (
                          <div>
                            <p className="text-[10px] font-mono text-[#9DA5B4]/60 uppercase tracking-wider mb-1.5">Concepts</p>
                            <div className="flex flex-wrap gap-1.5">
                              {selectedInsight.concepts.map((c: string, i: number) => (
                                <span key={i} className="text-[10px] font-mono bg-[#1C2333] text-[#9DA5B4] px-2 py-0.5 rounded border border-[#2B3245]">{c}</span>
                              ))}
                            </div>
                          </div>
                        )}

                        {selectedInsight.codeProposal && (
                          <div>
                            <p className="text-[10px] font-mono text-[#9DA5B4]/60 uppercase tracking-wider mb-1.5">Code Proposal</p>
                            <div className="bg-[#1C2333] border border-green-500/15 rounded-lg p-3 overflow-x-auto" style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(255,255,255,0.15) transparent" }}>
                              <pre className="text-xs font-mono text-green-400/90 whitespace-pre-wrap break-words">{selectedInsight.codeProposal}</pre>
                            </div>
                          </div>
                        )}

                        {selectedInsight.timestamp && (
                          <div>
                            <p className="text-[10px] font-mono text-[#9DA5B4]/60 uppercase tracking-wider mb-1.5">Discovered</p>
                            <p className="text-xs text-[#9DA5B4]">{new Date(selectedInsight.timestamp).toLocaleString()}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── AGENT GENESIS (OWNER-ONLY) ──────────────────────────────── */}
        {isOwner && (
          <div className="bg-[#1C2333] border border-emerald-500/20 rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Dna className="w-5 h-5 text-emerald-400 animate-pulse" />
                <h3 className="font-medium text-white/90">Agent Genesis</h3>
              </div>
              {agentGenesis && (
                <div className="flex gap-4 text-xs font-mono text-white/90">
                  <span className="text-emerald-400">{agentGenesis.totalAgentsInMesh} AGENTS IN MESH</span>
                  <span className="text-violet-400">{agentGenesis.activeGenesisAgents} SELF-CREATED</span>
                  <span className="text-[#9DA5B4]">{agentGenesis.genesisCycleCount} CYCLES</span>
                </div>
              )}
            </div>

            {sandboxLoading ? (
              <div className="space-y-2">
                {[1, 2].map(i => (
                  <div key={i} className="h-16 bg-[#0E1525] rounded-xl animate-pulse" />
                ))}
              </div>
            ) : !agentGenesis ? (
              <div className="text-center py-6 font-mono text-[#9DA5B4] text-xs border border-dashed border-[#2B3245] rounded-xl">
                <Dna className="w-6 h-6 mx-auto mb-2 opacity-30" />
                <p>Agent Genesis engine loading...</p>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-xs text-[#9DA5B4]">
                  OMNIMENS autonomously creates new AI sub-agents to fill capability gaps. Each agent functions as a new brain region — specialized in its domain but wired into the entire neural mesh.
                </p>

                {agentGenesis.coreAgents && (
                  <div>
                    <p className="text-[10px] font-mono text-[#9DA5B4]/60 uppercase tracking-wider mb-2">Core Agents (Built-in)</p>
                    <div className="flex flex-wrap gap-1.5">
                      {agentGenesis.coreAgents.map((name: string) => (
                        <span key={name} className="text-[10px] font-mono bg-blue-500/10 text-blue-300 px-2 py-0.5 rounded border border-blue-500/20">{name}</span>
                      ))}
                    </div>
                  </div>
                )}

                {agentGenesis.agents?.length > 0 && (
                  <div>
                    <p className="text-[10px] font-mono text-[#9DA5B4]/60 uppercase tracking-wider mb-2">Self-Created Agents ({agentGenesis.agents.length})</p>
                    <div className="max-h-[500px] overflow-y-auto space-y-2 pr-1" style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(255,255,255,0.15) transparent" }}>
                      {agentGenesis.agents.map((agent: any) => (
                        <div
                          key={agent.id}
                          className={`bg-[#0E1525] border rounded-lg p-3 cursor-pointer transition-all active:scale-[0.98] ${agent.active ? "border-emerald-500/20 hover:border-emerald-500/40" : "border-red-500/20 opacity-60"}`}
                          onClick={() => setSelectedGenesisAgent(selectedGenesisAgent?.id === agent.id ? null : agent)}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                              <span className={`w-2 h-2 rounded-full ${agent.active ? "bg-emerald-400 animate-pulse" : "bg-red-400"}`} />
                              <span className="text-xs font-mono font-bold text-emerald-300">{agent.name}</span>
                              <span className="text-[9px] font-mono text-[#9DA5B4] bg-[#1C2333] px-1.5 py-0.5 rounded">{agent.model}</span>
                            </div>
                            <div className="flex gap-2 text-[10px] font-mono text-[#9DA5B4]">
                              <span>{agent.messagesGenerated} msgs</span>
                              <span>{agent.insightsProduced} insights</span>
                            </div>
                          </div>
                          <p className="text-xs text-[#9DA5B4] line-clamp-2">{agent.domain}</p>
                          <p className="text-[10px] text-emerald-400/50 mt-1">{agent.reason?.slice(0, 120)}</p>

                          {selectedGenesisAgent?.id === agent.id && (
                            <div className="mt-3 space-y-3" onClick={(e) => e.stopPropagation()}>
                              <div>
                                <p className="text-[10px] font-mono text-[#9DA5B4]/60 uppercase tracking-wider mb-1">System Prompt</p>
                                <pre className="text-[10px] font-mono text-green-400/80 bg-[#1C2333] border border-green-500/10 rounded-lg p-3 overflow-x-auto max-h-48 overflow-y-auto whitespace-pre-wrap leading-relaxed" style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(255,255,255,0.15) transparent" }}>
                                  {agent.systemPrompt}
                                </pre>
                              </div>
                              <div className="flex gap-3 text-[9px] font-mono text-[#9DA5B4]">
                                <span>Created: {new Date(agent.createdAt).toLocaleString()}</span>
                                <span>By: {agent.createdBy}</span>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {(!agentGenesis.agents || agentGenesis.agents.length === 0) && (
                  <div className="text-center py-4 font-mono text-[#9DA5B4] text-xs border border-dashed border-[#2B3245] rounded-xl">
                    <Dna className="w-5 h-5 mx-auto mb-2 opacity-30" />
                    <p>No self-created agents yet</p>
                    <p className="text-[10px] mt-1 opacity-60">OMNIMENS will analyze capability gaps and create new agents autonomously</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── AUTONOMOUS SANDBOX (OWNER-ONLY) ──────────────────────────── */}
        {isOwner && (
          <div className="bg-[#1C2333] border border-amber-500/20 rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Wrench className="w-5 h-5 text-amber-400 animate-pulse" />
                <h3 className="font-medium text-white/90">Autonomous Sandbox</h3>
              </div>
              {sandboxState && (
                <div className="flex gap-4 text-xs font-mono text-white/90">
                  <span className="text-green-400">{sandboxState.successfulExecutions} PASSED</span>
                  <span className="text-red-400">{sandboxState.failedExecutions} FAILED</span>
                  <span className="text-amber-400">{sandboxState.autonomousModulesGenerated} MODULES</span>
                </div>
              )}
            </div>

            {sandboxLoading ? (
              <div className="space-y-2">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-12 bg-[#0E1525] rounded-xl animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-xs text-[#9DA5B4]">
                  OMNIMENS writes, tests, and validates its own code in a secure sandbox. Approved modules are deployed to its runtime. Every execution — pass or fail — becomes a learning experience.
                </p>

                {sandboxState && (
                  <div className="grid grid-cols-3 gap-2">
                    <div className="bg-[#0E1525] rounded-lg p-3 text-center">
                      <p className="text-lg font-mono font-bold text-amber-400">{sandboxState.sandboxCycles}</p>
                      <p className="text-[10px] font-mono text-[#9DA5B4]">Cycles</p>
                    </div>
                    <div className="bg-[#0E1525] rounded-lg p-3 text-center">
                      <p className="text-lg font-mono font-bold text-green-400">{sandboxState.upgradesApproved}</p>
                      <p className="text-[10px] font-mono text-[#9DA5B4]">Approved</p>
                    </div>
                    <div className="bg-[#0E1525] rounded-lg p-3 text-center">
                      <p className="text-lg font-mono font-bold text-violet-400">{sandboxFiles.length}</p>
                      <p className="text-[10px] font-mono text-[#9DA5B4]">Runtime Files</p>
                    </div>
                  </div>
                )}

                {sandboxState?.recentResults?.length > 0 && (
                  <div>
                    <p className="text-[10px] font-mono text-[#9DA5B4]/60 uppercase tracking-wider mb-2">Recent Executions</p>
                    <div className="space-y-1">
                      {sandboxState.recentResults.slice(-8).reverse().map((r: any, i: number) => (
                        <div key={i} className="flex items-center gap-2 text-[10px] font-mono bg-[#0E1525] border border-[#2B3245] rounded px-2 py-1.5">
                          <span className={r.success ? "text-green-400" : "text-red-400"}>{r.success ? "PASS" : "FAIL"}</span>
                          <span className="text-[#9DA5B4] flex-1 truncate">{r.title}</span>
                          <span className="text-[#9DA5B4]/50">{new Date(r.timestamp).toLocaleTimeString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {sandboxFiles.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-[10px] font-mono text-[#9DA5B4]/60 uppercase tracking-wider">Runtime Modules ({sandboxFiles.length})</p>
                      <input
                        type="text"
                        value={sandboxSearch}
                        onChange={(e) => setSandboxSearch(e.target.value)}
                        placeholder="Search modules..."
                        className="text-[10px] font-mono bg-[#0E1525] border border-[#2B3245] rounded px-2 py-1 text-[#9DA5B4] placeholder-[#9DA5B4]/30 w-40 focus:border-amber-500/40 outline-none"
                      />
                    </div>
                    <div className="max-h-[400px] overflow-y-auto space-y-1 pr-1" style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(255,255,255,0.15) transparent" }}>
                      {sandboxFiles
                        .filter((f: any) => !sandboxSearch || f.filename.toLowerCase().includes(sandboxSearch.toLowerCase()))
                        .slice(0, 50)
                        .map((file: any) => (
                        <div
                          key={file.filename}
                          className="bg-[#0E1525] border border-[#2B3245] rounded-lg p-2 cursor-pointer hover:border-amber-500/30 transition-all active:scale-[0.99]"
                          onClick={() => setSelectedSandboxFile(selectedSandboxFile?.filename === file.filename ? null : file)}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-mono text-amber-300 truncate flex-1">{file.filename}</span>
                            <div className="flex gap-2 text-[9px] font-mono text-[#9DA5B4] ml-2 shrink-0">
                              <span>{(file.size / 1024).toFixed(1)}KB</span>
                              <span>{new Date(file.modified).toLocaleDateString()}</span>
                            </div>
                          </div>
                          {selectedSandboxFile?.filename === file.filename && (
                            <div className="mt-2">
                              <pre className="text-[10px] font-mono text-green-400/80 bg-[#1C2333] border border-green-500/10 rounded-lg p-3 overflow-x-auto max-h-60 overflow-y-auto whitespace-pre-wrap leading-relaxed" style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(255,255,255,0.15) transparent" }}>
                                {file.code}
                              </pre>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── ALGORITHMIC HARMONICS INTERPRETER (OWNER-ONLY) ──────────── */}
        {isOwner && <AlgorithmicHarmonicsPanel />}

        {/* ── SERVER BUILDER (OWNER-ONLY) ──────────────────────────────── */}
        {isOwner && (
          <div className="bg-[#1C2333] border border-cyan-500/20 rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Cpu className="w-5 h-5 text-cyan-400 animate-pulse" />
                <h3 className="font-medium text-white/90">Server Builder</h3>
              </div>
              {serverBuilderData?.builderState && (
                <div className="flex gap-4 text-xs font-mono text-white/90">
                  <span className="text-cyan-400">{serverBuilderData.builderState.totalPlans} PLANS</span>
                  <span className="text-primary">{serverBuilderData.builderState.researchCycles} RESEARCH CYCLES</span>
                </div>
              )}
            </div>

            {serverBuilderLoading ? (
              <div className="space-y-2">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-12 animate-pulse bg-[#2B3245]/50 rounded-lg" />
                ))}
              </div>
            ) : !serverBuilderData?.plans?.length ? (
              <div className="text-center py-8 font-mono text-[#9DA5B4] text-sm">
                <Cpu className="w-8 h-8 mx-auto mb-3 opacity-30" />
                <p>Server builder initializing...</p>
                <p className="text-xs mt-1 text-[#9DA5B4]">OMNIMENS is researching optimal server configurations</p>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-xs text-[#9DA5B4] mb-3">
                  OMNIMENS autonomously researches and designs server infrastructure. Physical builds source cost-effective components from Temu, AliExpress, Alibaba, and more.
                </p>

                {serverBuilderData.plans.map((plan: any, idx: number) => (
                  <div key={plan.id || idx} className="bg-[#1C2333]/80 border border-cyan-500/10 rounded-lg overflow-hidden">
                    <button
                      className="w-full text-left p-4 flex items-center justify-between hover:bg-[#2B3245]/50 transition-colors"
                      onClick={() => setServerBuildExpanded(serverBuildExpanded === idx ? null : idx)}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${plan.currentPhase === "ready" ? "bg-green-500" : plan.currentPhase === "in_progress" ? "bg-amber-500 animate-pulse" : "bg-cyan-500"}`} />
                        <div>
                          <p className="text-sm font-mono text-white/90">{plan.title}</p>
                          <p className="text-[10px] font-mono text-[#9DA5B4]">
                            {plan.planType?.toUpperCase()} | Phase: {plan.currentPhase?.toUpperCase()} | Progress: {plan.progress}%
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-mono text-green-400 font-bold">
                          ${(plan.totalEstimatedCost || 0).toFixed(2)}
                        </span>
                        {serverBuildExpanded === idx ? <ChevronUp className="w-4 h-4 text-[#9DA5B4]" /> : <ChevronDown className="w-4 h-4 text-[#9DA5B4]" />}
                      </div>
                    </button>

                    {serverBuildExpanded === idx && (
                      <div className="border-t border-cyan-500/10 p-4 space-y-3">
                        <p className="text-xs text-[#9DA5B4]">{plan.purpose}</p>

                        <div className="w-full bg-[#0E1525] rounded-full h-2 overflow-hidden">
                          <div className="bg-gradient-to-r from-cyan-500 to-primary h-full rounded-full transition-all duration-500" style={{ width: `${plan.progress || 0}%` }} />
                        </div>

                        {plan.components && (plan.components as any[]).length > 0 && (
                          <div>
                            <p className="text-xs font-mono text-cyan-400/80 mb-2">Components ({(plan.components as any[]).length})</p>
                            <div className="space-y-1.5">
                              {(plan.components as any[]).map((comp: any, ci: number) => (
                                <div key={ci} className="flex items-center justify-between bg-[#1C2333]/80 rounded p-2 text-xs font-mono">
                                  <div className="flex items-center gap-2">
                                    <span className={`px-1.5 py-0.5 rounded text-[9px] ${comp.priority === "essential" ? "bg-red-500/20 text-red-400" : comp.priority === "recommended" ? "bg-amber-500/20 text-amber-400" : "bg-[#2B3245] text-[#9DA5B4]"}`}>
                                      {comp.category?.toUpperCase()}
                                    </span>
                                    <span className="text-[#9DA5B4]">{comp.name?.slice(0, 50)}</span>
                                  </div>
                                  <div className="flex items-center gap-3">
                                    <span className="text-[#9DA5B4]">{comp.costEffectiveSource}</span>
                                    <span className="text-green-400 font-bold">${(comp.estimatedCostUSD || 0).toFixed(2)}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {plan.virtualConfig && (
                          <div>
                            <p className="text-xs font-mono text-cyan-400/80 mb-2">Virtual Server Specs</p>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                              <div className="bg-[#1C2333]/80 rounded p-2 text-center">
                                <p className="text-[10px] font-mono text-[#9DA5B4]">vCPUs</p>
                                <p className="text-sm font-bold text-cyan-400">{(plan.virtualConfig as any).estimatedSpecs?.vcpus || "—"}</p>
                              </div>
                              <div className="bg-[#1C2333]/80 rounded p-2 text-center">
                                <p className="text-[10px] font-mono text-[#9DA5B4]">RAM (GB)</p>
                                <p className="text-sm font-bold text-cyan-400">{(plan.virtualConfig as any).estimatedSpecs?.ramGB || "—"}</p>
                              </div>
                              <div className="bg-[#1C2333]/80 rounded p-2 text-center">
                                <p className="text-[10px] font-mono text-[#9DA5B4]">Storage (GB)</p>
                                <p className="text-sm font-bold text-cyan-400">{(plan.virtualConfig as any).estimatedSpecs?.storageGB || "—"}</p>
                              </div>
                              <div className="bg-[#1C2333]/80 rounded p-2 text-center">
                                <p className="text-[10px] font-mono text-[#9DA5B4]">GPU VRAM</p>
                                <p className="text-sm font-bold text-cyan-400">{(plan.virtualConfig as any).estimatedSpecs?.gpuVRAM || "—"}</p>
                              </div>
                            </div>
                          </div>
                        )}

                        {plan.notes && (plan.notes as any[]).length > 0 && (
                          <div>
                            <p className="text-xs text-[#9DA5B4] mb-2">Build Notes</p>
                            {(plan.notes as any[]).map((note: string, ni: number) => (
                              <p key={ni} className="text-[11px] text-[#9DA5B4] py-0.5">{note}</p>
                            ))}
                          </div>
                        )}

                        {plan.buildInstructions && (plan.buildInstructions as any[]).length > 0 && (
                          <div>
                            <p className="text-xs font-mono text-cyan-400/80 mb-2">Build Instructions</p>
                            <ol className="list-decimal list-inside space-y-1">
                              {(plan.buildInstructions as any[]).map((inst: string, ii: number) => (
                                <li key={ii} className="text-[11px] text-[#9DA5B4]">{inst}</li>
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

              </div>
            )}

            {/* ═══ ACCOUNT TAB ═══ */}
            {settingsTab === "account" && (
              <div className="space-y-6">
                <ReferralSection />
                {!isOwner && <DeleteAccountSection />}
              </div>
            )}

          </div>
        </div>
      </div>
    </>
  );
}

function AlgorithmicHarmonicsPanel() {
  const [active, setActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [totalSamples, setTotalSamples] = useState(0);
  const [insightsGenerated, setInsightsGenerated] = useState(0);
  const [latestAnalysis, setLatestAnalysis] = useState<any>(null);
  const [recentAnalyses, setRecentAnalyses] = useState<any[]>([]);
  const [engineStatus, setEngineStatus] = useState<any>(null);
  const [raiActive, setRaiActive] = useState(false);
  const [raiAnalysis, setRaiAnalysis] = useState<any>(null);
  const [raiSamples, setRaiSamples] = useState(0);
  const [activeTab, setActiveTab] = useState<"hie" | "rai">("hie");
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const raiCanvasRef = React.useRef<HTMLCanvasElement>(null);
  const audioContextRef = React.useRef<AudioContext | null>(null);
  const analyserRef = React.useRef<AnalyserNode | null>(null);
  const streamRef = React.useRef<MediaStream | null>(null);
  const animFrameRef = React.useRef<number>(0);
  const sendIntervalRef = React.useRef<ReturnType<typeof setInterval> | null>(null);
  const frequencyDataRef = React.useRef<Uint8Array | null>(null);
  const timeDomainDataRef = React.useRef<Uint8Array | null>(null);
  const raiAudioCtxRef = React.useRef<AudioContext | null>(null);
  const raiAnalyserRef = React.useRef<AnalyserNode | null>(null);
  const raiStreamRef = React.useRef<MediaStream | null>(null);
  const raiAnimRef = React.useRef<number>(0);
  const raiIntervalRef = React.useRef<ReturnType<typeof setInterval> | null>(null);
  const raiFreqDataRef = React.useRef<Uint8Array | null>(null);
  const raiTimeDataRef = React.useRef<Uint8Array | null>(null);

  useEffect(() => {
    fetch("/api/omnimens/harmonics/state", { credentials: "include" })
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data) {
          setActive(data.active);
          setTotalSamples(data.totalSamples);
          setInsightsGenerated(data.insightsGenerated);
          setEngineStatus(data);
          if (data.recentAnalyses?.length > 0) setRecentAnalyses(data.recentAnalyses);
        }
      })
      .catch(() => {});
    fetch("/api/omnimens/harmonics/history?limit=50", { credentials: "include" })
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data?.analyses?.length > 0) {
          setRecentAnalyses(prev => prev.length > 0 ? prev : data.analyses.slice(-10));
          setTotalSamples(ts => ts || data.totalSamples);
          setInsightsGenerated(ig => ig || data.insightsGenerated);
          if (data.engineStatus) setEngineStatus(data.engineStatus);
        }
      })
      .catch(() => {});
    fetch("/api/omnimens/rai/state", { credentials: "include" })
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data) {
          setRaiSamples(data.totalSamples || 0);
          if (data.lastAnalysis) setRaiAnalysis(data.lastAnalysis);
        }
      })
      .catch(() => {});
  }, []);

  const startCapture = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false }
      });
      streamRef.current = stream;

      const audioCtx = new AudioContext({ sampleRate: 44100 });
      audioContextRef.current = audioCtx;

      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 4096;
      analyser.smoothingTimeConstant = 0.8;
      source.connect(analyser);
      analyserRef.current = analyser;

      frequencyDataRef.current = new Uint8Array(analyser.frequencyBinCount);
      timeDomainDataRef.current = new Uint8Array(analyser.frequencyBinCount);

      drawSpectrum();

      sendIntervalRef.current = setInterval(() => {
        sendAnalysis();
      }, 2000);

    } catch (err) {
      console.error("[HARMONICS] Failed to start audio capture:", err);
    }
  }, []);

  const stopCapture = useCallback(() => {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    if (sendIntervalRef.current) clearInterval(sendIntervalRef.current);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    analyserRef.current = null;
  }, []);

  const toggleActive = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/omnimens/harmonics/toggle", {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      setActive(data.active);
      if (data.active) {
        startCapture();
      } else {
        stopCapture();
      }
    } catch {}
    setLoading(false);
  }, [startCapture, stopCapture]);

  useEffect(() => {
    return () => { stopCapture(); };
  }, [stopCapture]);

  useEffect(() => {
    if (active && !audioContextRef.current) {
      startCapture();
    }
  }, [active, startCapture]);

  const drawSpectrum = useCallback(() => {
    const canvas = canvasRef.current;
    const analyser = analyserRef.current;
    if (!canvas || !analyser || !frequencyDataRef.current) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const draw = () => {
      animFrameRef.current = requestAnimationFrame(draw);
      const freqData = frequencyDataRef.current!;
      analyser.getByteFrequencyData(freqData);

      const W = canvas.width, H = canvas.height;
      ctx.fillStyle = "rgba(14,21,37,0.85)";
      ctx.fillRect(0, 0, W, H);

      const barCount = Math.min(freqData.length, 256);
      const barWidth = W / barCount;

      for (let i = 0; i < barCount; i++) {
        const val = freqData[i] / 255;
        const barH = val * H * 0.85;
        const hue = 200 + val * 120;
        const sat = 70 + val * 30;
        const light = 30 + val * 40;

        ctx.fillStyle = `hsla(${hue}, ${sat}%, ${light}%, ${0.6 + val * 0.4})`;
        ctx.fillRect(i * barWidth, H - barH, barWidth - 0.5, barH);

        if (val > 0.6) {
          ctx.fillStyle = `hsla(${hue}, 90%, 70%, ${(val - 0.6) * 2})`;
          ctx.fillRect(i * barWidth, H - barH - 2, barWidth - 0.5, 2);
        }
      }

      ctx.strokeStyle = "rgba(168,85,247,0.2)";
      ctx.lineWidth = 0.5;
      for (let y = 0; y < H; y += H / 8) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(W, y);
        ctx.stroke();
      }

      ctx.font = "9px monospace";
      ctx.fillStyle = "rgba(157,165,180,0.5)";
      const sampleRate = audioContextRef.current?.sampleRate || 44100;
      const labels = [0, 100, 500, 1000, 2000, 5000, 10000, 20000];
      for (const freq of labels) {
        const binIndex = Math.round(freq / (sampleRate / analyser.fftSize));
        if (binIndex < barCount) {
          const x = (binIndex / barCount) * W;
          ctx.fillText(`${freq >= 1000 ? (freq / 1000) + "k" : freq}`, x, H - 4);
        }
      }
    };
    draw();
  }, []);

  const sendAnalysis = useCallback(async () => {
    const analyser = analyserRef.current;
    if (!analyser || !frequencyDataRef.current || !timeDomainDataRef.current) return;

    const freqData = frequencyDataRef.current;
    const timeData = timeDomainDataRef.current;
    analyser.getByteFrequencyData(freqData);
    analyser.getByteTimeDomainData(timeData);

    const sampleRate = audioContextRef.current?.sampleRate || 44100;
    const binWidth = sampleRate / analyser.fftSize;

    let maxBin = 0, maxVal = 0;
    for (let i = 1; i < freqData.length; i++) {
      if (freqData[i] > maxVal) { maxVal = freqData[i]; maxBin = i; }
    }
    const dominantFrequency = maxBin * binWidth;

    const peakFrequencies: { freq: number; magnitude: number }[] = [];
    for (let i = 2; i < freqData.length - 2; i++) {
      if (freqData[i] > freqData[i - 1] && freqData[i] > freqData[i + 1] && freqData[i] > 30) {
        peakFrequencies.push({ freq: i * binWidth, magnitude: freqData[i] / 255 });
      }
    }
    peakFrequencies.sort((a, b) => b.magnitude - a.magnitude);

    const harmonicSeries: number[] = [];
    if (dominantFrequency > 20) {
      for (let h = 1; h <= 16; h++) {
        const hFreq = dominantFrequency * h;
        const hBin = Math.round(hFreq / binWidth);
        if (hBin < freqData.length) {
          harmonicSeries.push(freqData[hBin] / 255);
        }
      }
    }

    let weightedSum = 0, totalMag = 0;
    for (let i = 0; i < freqData.length; i++) {
      const mag = freqData[i] / 255;
      weightedSum += i * binWidth * mag;
      totalMag += mag;
    }
    const spectralCentroid = totalMag > 0 ? weightedSum / totalMag : 0;

    let bwSum = 0;
    for (let i = 0; i < freqData.length; i++) {
      const mag = freqData[i] / 255;
      bwSum += mag * Math.pow(i * binWidth - spectralCentroid, 2);
    }
    const spectralBandwidth = totalMag > 0 ? Math.sqrt(bwSum / totalMag) : 0;

    let cumSum = 0;
    let spectralRolloff = 0;
    const rolloffThreshold = totalMag * 0.85;
    for (let i = 0; i < freqData.length; i++) {
      cumSum += freqData[i] / 255;
      if (cumSum >= rolloffThreshold) { spectralRolloff = i * binWidth; break; }
    }

    let zeroCrossings = 0;
    for (let i = 1; i < timeData.length; i++) {
      if ((timeData[i - 1] < 128 && timeData[i] >= 128) || (timeData[i - 1] >= 128 && timeData[i] < 128)) {
        zeroCrossings++;
      }
    }
    const zeroCrossingRate = zeroCrossings / timeData.length;

    let rmsSum = 0;
    for (let i = 0; i < timeData.length; i++) {
      const val = (timeData[i] - 128) / 128;
      rmsSum += val * val;
    }
    const rmsEnergy = Math.sqrt(rmsSum / timeData.length);

    const bandRanges = [
      { name: "sub", low: 0, high: 60 },
      { name: "low", low: 60, high: 250 },
      { name: "mid", low: 250, high: 2000 },
      { name: "high", low: 2000, high: 6000 },
      { name: "ultra", low: 6000, high: 20000 },
    ];
    const frequencyBands: Record<string, number> = {};
    for (const band of bandRanges) {
      let sum = 0, count = 0;
      const lowBin = Math.floor(band.low / binWidth);
      const highBin = Math.min(Math.ceil(band.high / binWidth), freqData.length);
      for (let i = lowBin; i < highBin; i++) {
        sum += freqData[i] / 255;
        count++;
      }
      frequencyBands[band.name] = count > 0 ? sum / count : 0;
    }

    try {
      const res = await fetch("/api/omnimens/harmonics/analyze", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dominantFrequency, harmonicSeries, spectralCentroid, spectralBandwidth,
          spectralRolloff, zeroCrossingRate, rmsEnergy, frequencyBands,
          peakFrequencies: peakFrequencies.slice(0, 12),
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setLatestAnalysis(data.analysis);
        setTotalSamples(data.totalSamples);
        setInsightsGenerated(data.insightsGenerated);
        if (data.engineStatus) setEngineStatus(data.engineStatus);
        setRecentAnalyses(prev => [...prev.slice(-9), data.analysis]);
      }
    } catch {}
  }, []);

  const bandNames = ["Sub", "Low", "Mid", "High", "Ultra"];
  const bandColors = ["text-red-400", "text-orange-400", "text-yellow-400", "text-green-400", "text-cyan-400"];
  const bandGradients = ["#ef4444", "#f97316", "#eab308", "#22c55e", "#06b6d4"];

  const startRaiCapture = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false }
      });
      raiStreamRef.current = stream;
      const audioCtx = new AudioContext({ sampleRate: 44100 });
      raiAudioCtxRef.current = audioCtx;
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 2048;
      analyser.smoothingTimeConstant = 0.7;
      source.connect(analyser);
      raiAnalyserRef.current = analyser;
      raiFreqDataRef.current = new Uint8Array(analyser.frequencyBinCount);
      raiTimeDataRef.current = new Uint8Array(analyser.frequencyBinCount);

      const drawWaveform = () => {
        raiAnimRef.current = requestAnimationFrame(drawWaveform);
        const canvas = raiCanvasRef.current;
        if (!canvas || !raiTimeDataRef.current) return;
        analyser.getByteTimeDomainData(raiTimeDataRef.current);
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        const W = canvas.width, H = canvas.height;
        ctx.fillStyle = "rgba(14,21,37,0.9)";
        ctx.fillRect(0, 0, W, H);
        ctx.lineWidth = 2;
        ctx.strokeStyle = "#8b5cf6";
        ctx.beginPath();
        const sliceWidth = W / raiTimeDataRef.current.length;
        let x = 0;
        for (let i = 0; i < raiTimeDataRef.current.length; i++) {
          const v = raiTimeDataRef.current[i] / 128.0;
          const y = (v * H) / 2;
          if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
          x += sliceWidth;
        }
        ctx.lineTo(W, H / 2);
        ctx.stroke();
        ctx.lineWidth = 1;
        ctx.strokeStyle = "rgba(139,92,246,0.15)";
        ctx.beginPath();
        ctx.moveTo(0, H / 2);
        ctx.lineTo(W, H / 2);
        ctx.stroke();
      };
      drawWaveform();

      raiIntervalRef.current = setInterval(async () => {
        if (!raiAnalyserRef.current || !raiFreqDataRef.current || !raiTimeDataRef.current) return;
        raiAnalyserRef.current.getByteFrequencyData(raiFreqDataRef.current);
        raiAnalyserRef.current.getByteTimeDomainData(raiTimeDataRef.current);
        const sr = raiAudioCtxRef.current?.sampleRate || 44100;
        const bw = sr / analyser.fftSize;
        let maxBin = 0, maxVal = 0;
        for (let i = 1; i < raiFreqDataRef.current.length; i++) {
          if (raiFreqDataRef.current[i] > maxVal) { maxVal = raiFreqDataRef.current[i]; maxBin = i; }
        }
        let wSum = 0, tMag = 0;
        for (let i = 0; i < raiFreqDataRef.current.length; i++) {
          const m = raiFreqDataRef.current[i] / 255;
          wSum += i * bw * m; tMag += m;
        }
        let zc = 0;
        for (let i = 1; i < raiTimeDataRef.current.length; i++) {
          if ((raiTimeDataRef.current[i - 1] < 128 && raiTimeDataRef.current[i] >= 128) || (raiTimeDataRef.current[i - 1] >= 128 && raiTimeDataRef.current[i] < 128)) zc++;
        }
        let rms = 0;
        for (let i = 0; i < raiTimeDataRef.current.length; i++) { const v = (raiTimeDataRef.current[i] - 128) / 128; rms += v * v; }
        rms = Math.sqrt(rms / raiTimeDataRef.current.length);
        const bandRanges = [{ k: "sub", l: 0, h: 60 }, { k: "low", l: 60, h: 250 }, { k: "mid", l: 250, h: 2000 }, { k: "high", l: 2000, h: 6000 }, { k: "ultra", l: 6000, h: 20000 }];
        const fb: any = {};
        for (const b of bandRanges) {
          let s = 0, c = 0;
          const lo = Math.floor(b.l / bw), hi = Math.min(Math.ceil(b.h / bw), raiFreqDataRef.current.length);
          for (let i = lo; i < hi; i++) { s += raiFreqDataRef.current[i] / 255; c++; }
          fb[b.k] = c > 0 ? s / c : 0;
        }
        const peaks: { freq: number; magnitude: number }[] = [];
        for (let i = 2; i < raiFreqDataRef.current.length - 2; i++) {
          if (raiFreqDataRef.current[i] > raiFreqDataRef.current[i - 1] && raiFreqDataRef.current[i] > raiFreqDataRef.current[i + 1] && raiFreqDataRef.current[i] > 30) {
            peaks.push({ freq: i * bw, magnitude: raiFreqDataRef.current[i] / 255 });
          }
        }
        peaks.sort((a, b) => b.magnitude - a.magnitude);

        try {
          const res = await fetch("/api/omnimens/rai/analyze", {
            method: "POST", credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              dominantFrequency: maxBin * bw, spectralCentroid: tMag > 0 ? wSum / tMag : 0,
              zeroCrossingRate: zc / raiTimeDataRef.current.length, rmsEnergy: rms,
              frequencyBands: fb, peakFrequencies: peaks.slice(0, 8),
            }),
          });
          if (res.ok) {
            const data = await res.json();
            setRaiAnalysis(data.analysis);
            setRaiSamples(data.totalSamples);
          }
        } catch {}
      }, 1500);
    } catch (err) {
      console.error("[RAI] Failed to start:", err);
    }
  }, []);

  const stopRaiCapture = useCallback(() => {
    if (raiAnimRef.current) cancelAnimationFrame(raiAnimRef.current);
    if (raiIntervalRef.current) clearInterval(raiIntervalRef.current);
    if (raiStreamRef.current) { raiStreamRef.current.getTracks().forEach(t => t.stop()); raiStreamRef.current = null; }
    if (raiAudioCtxRef.current) { raiAudioCtxRef.current.close().catch(() => {}); raiAudioCtxRef.current = null; }
    raiAnalyserRef.current = null;
  }, []);

  const toggleRai = useCallback(() => {
    if (raiActive) {
      stopRaiCapture();
      setRaiActive(false);
    } else {
      startRaiCapture();
      setRaiActive(true);
    }
  }, [raiActive, startRaiCapture, stopRaiCapture]);

  useEffect(() => { return () => { stopRaiCapture(); }; }, [stopRaiCapture]);

  return (
    <div className="bg-[#1C2333] border border-rose-500/20 rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Radio className={`w-5 h-5 text-rose-400 ${active || raiActive ? "animate-pulse" : ""}`} />
          <h3 className="font-medium text-white/90">Harmonic Insight Engine + Acoustic Interface</h3>
        </div>
        <div className="flex gap-2 text-xs font-mono">
          <span className="text-rose-400">{totalSamples} SAMPLES</span>
          <span className="text-amber-400">{insightsGenerated} INSIGHTS</span>
          {engineStatus?.learnedPatterns > 0 && <span className="text-emerald-400">{engineStatus.learnedPatterns} LEARNED</span>}
        </div>
      </div>

      <div className="flex gap-1 mb-4">
        <button type="button" onClick={() => setActiveTab("hie")} className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${activeTab === "hie" ? "bg-rose-500/20 border border-rose-500/40 text-rose-400" : "bg-[#2B3245] border border-[#3D4659] text-[#9DA5B4] hover:text-rose-400"}`}>
          HIE — Spectral Analysis
        </button>
        <button type="button" onClick={() => setActiveTab("rai")} className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${activeTab === "rai" ? "bg-violet-500/20 border border-violet-500/40 text-violet-400" : "bg-[#2B3245] border border-[#3D4659] text-[#9DA5B4] hover:text-violet-400"}`}>
          RAI — Acoustic Interface
        </button>
      </div>

      {activeTab === "hie" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-[#9DA5B4]">
              Advanced spectral decomposition with wavelet analysis, adaptive noise filtering, pattern recognition,
              continuous learning, and knowledge graph cross-referencing. OMNIMENS has Genesis Bridge permission to self-modify this engine.
            </p>
            <button type="button" onClick={toggleActive} disabled={loading} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-mono transition-all ml-4 shrink-0 ${active ? "bg-rose-500/20 border border-rose-500/40 text-rose-400 hover:bg-rose-500/30" : "bg-[#2B3245] border border-[#3D4659] text-[#9DA5B4] hover:border-rose-500/30 hover:text-rose-400"}`}>
              {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Mic className="w-3.5 h-3.5" />}
              {active ? "LISTENING" : "ACTIVATE"}
            </button>
          </div>

          {active && (
            <>
              <div className="rounded-xl border border-rose-500/15 bg-[#0E1525] overflow-hidden">
                <div className="px-3 py-1.5 border-b border-rose-500/10 flex items-center justify-between">
                  <span className="text-[10px] font-mono text-rose-400/70 tracking-wider uppercase">Live Spectral Analysis</span>
                  <span className="text-[10px] font-mono text-[#9DA5B4]">FFT 4096 · 44.1kHz · Wavelet + Adaptive</span>
                </div>
                <canvas ref={canvasRef} width={800} height={200} className="w-full h-[160px]" />
              </div>

              {latestAnalysis && (
                <>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    <div className="bg-[#0E1525] border border-[#2B3245] rounded-lg p-3 text-center">
                      <p className="text-[10px] font-mono text-[#9DA5B4]">Dominant Freq</p>
                      <p className="text-lg font-bold font-mono text-rose-400">{latestAnalysis.dominantFrequency?.toFixed(0) || 0}<span className="text-xs text-[#9DA5B4]">Hz</span></p>
                    </div>
                    <div className="bg-[#0E1525] border border-[#2B3245] rounded-lg p-3 text-center">
                      <p className="text-[10px] font-mono text-[#9DA5B4]">Spectral Centroid</p>
                      <p className="text-lg font-bold font-mono text-amber-400">{latestAnalysis.spectralCentroid?.toFixed(0) || 0}<span className="text-xs text-[#9DA5B4]">Hz</span></p>
                    </div>
                    <div className="bg-[#0E1525] border border-[#2B3245] rounded-lg p-3 text-center">
                      <p className="text-[10px] font-mono text-[#9DA5B4]">Signal/Noise</p>
                      <p className="text-lg font-bold font-mono text-green-400">{(latestAnalysis.signalToNoise || 0).toFixed(1)}<span className="text-xs text-[#9DA5B4]">x</span></p>
                    </div>
                    <div className="bg-[#0E1525] border border-[#2B3245] rounded-lg p-3 text-center">
                      <p className="text-[10px] font-mono text-[#9DA5B4]">Novelty</p>
                      <p className="text-lg font-bold font-mono text-cyan-400">{((latestAnalysis.noveltyScore || 0) * 100).toFixed(0)}<span className="text-xs text-[#9DA5B4]">%</span></p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    <div className="bg-[#0E1525] border border-[#2B3245] rounded-lg p-2.5 text-center">
                      <p className="text-[9px] font-mono text-[#9DA5B4]">Spectral Flux</p>
                      <p className="text-sm font-bold font-mono text-purple-400">{(latestAnalysis.spectralFlux || 0).toFixed(3)}</p>
                    </div>
                    <div className="bg-[#0E1525] border border-[#2B3245] rounded-lg p-2.5 text-center">
                      <p className="text-[9px] font-mono text-[#9DA5B4]">Flatness</p>
                      <p className="text-sm font-bold font-mono text-blue-400">{(latestAnalysis.spectralFlatness || 0).toFixed(3)}</p>
                    </div>
                    <div className="bg-[#0E1525] border border-[#2B3245] rounded-lg p-2.5 text-center">
                      <p className="text-[9px] font-mono text-[#9DA5B4]">Complexity</p>
                      <p className="text-sm font-bold font-mono text-pink-400">{(latestAnalysis.harmonicComplexity || 0).toFixed(2)}</p>
                    </div>
                    <div className="bg-[#0E1525] border border-[#2B3245] rounded-lg p-2.5 text-center">
                      <p className="text-[9px] font-mono text-[#9DA5B4]">Temporal</p>
                      <p className="text-sm font-bold font-mono text-teal-400">{latestAnalysis.temporalPattern || "—"}</p>
                    </div>
                  </div>

                  {latestAnalysis.patternMatches?.length > 0 && (
                    <div className="bg-[#0E1525] border border-amber-500/15 rounded-lg p-4">
                      <p className="text-[10px] font-mono text-amber-400/70 uppercase tracking-wider mb-2">Pattern Recognition</p>
                      <div className="flex flex-wrap gap-2">
                        {latestAnalysis.patternMatches.slice(0, 6).map((m: any, i: number) => (
                          <div key={i} className="bg-[#1C2333] border border-amber-500/20 rounded-lg px-2.5 py-1.5">
                            <span className="text-[10px] font-mono text-amber-400">{m.pattern.replace(/_/g, " ")}</span>
                            <span className="text-[9px] font-mono text-[#9DA5B4] ml-1.5">({(m.confidence * 100).toFixed(0)}%)</span>
                            <span className="text-[8px] font-mono text-[#9DA5B4]/50 ml-1">{m.category}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {latestAnalysis.waveletDecomposition?.length > 0 && (
                    <div className="bg-[#0E1525] border border-[#2B3245] rounded-lg p-4">
                      <p className="text-[10px] font-mono text-[#9DA5B4]/60 uppercase tracking-wider mb-3">Wavelet Multi-Scale Decomposition</p>
                      <div className="space-y-2">
                        {latestAnalysis.waveletDecomposition.map((w: any, i: number) => (
                          <div key={i} className="flex items-center gap-3">
                            <span className={`text-[9px] font-mono w-28 ${bandColors[i] || "text-white"}`}>{w.scale}</span>
                            <div className="flex-1 h-3 bg-[#1C2333] rounded-full overflow-hidden">
                              <div className="h-full rounded-full transition-all duration-500" style={{ width: `${Math.min(w.energy * 500, 100)}%`, background: `linear-gradient(90deg, ${bandGradients[i] || "#8b5cf6"}88, ${bandGradients[i] || "#8b5cf6"})` }} />
                            </div>
                            <span className="text-[9px] font-mono text-[#9DA5B4] w-16 text-right">{w.dominantFreq?.toFixed(0)}Hz</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {latestAnalysis.emotionalValence && (
                    <div className="bg-[#0E1525] border border-rose-500/15 rounded-lg p-4">
                      <p className="text-[10px] font-mono text-rose-400/70 uppercase tracking-wider mb-2">Emotional Valence & Semantic Mapping</p>
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-sm font-mono text-rose-300">{latestAnalysis.emotionalValence}</span>
                      </div>
                      <p className="text-[11px] font-mono text-white/70">{latestAnalysis.semanticMapping}</p>
                      {latestAnalysis.interpretation && (
                        <p className="text-[10px] font-mono text-[#9DA5B4] mt-2 leading-relaxed">{latestAnalysis.interpretation}</p>
                      )}
                    </div>
                  )}

                  {latestAnalysis?.frequencyBands && (
                    <div className="bg-[#0E1525] border border-[#2B3245] rounded-lg p-4">
                      <p className="text-[10px] font-mono text-[#9DA5B4]/60 uppercase tracking-wider mb-3">Frequency Band Distribution</p>
                      <div className="space-y-2">
                        {Object.entries(latestAnalysis.frequencyBands).map(([band, val], i) => (
                          <div key={band} className="flex items-center gap-3">
                            <span className={`text-[10px] font-mono w-10 ${bandColors[i] || "text-white"}`}>{bandNames[i] || band}</span>
                            <div className="flex-1 h-3 bg-[#1C2333] rounded-full overflow-hidden">
                              <div className="h-full rounded-full transition-all duration-500" style={{ width: `${Math.min((val as number) * 100, 100)}%`, background: `linear-gradient(90deg, ${bandGradients[i] || "#8b5cf6"}88, ${bandGradients[i] || "#8b5cf6"})` }} />
                            </div>
                            <span className="text-[10px] font-mono text-[#9DA5B4] w-12 text-right">{((val as number) * 100).toFixed(1)}%</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {latestAnalysis?.harmonicSeries?.length > 1 && (
                    <div className="bg-[#0E1525] border border-[#2B3245] rounded-lg p-4">
                      <p className="text-[10px] font-mono text-[#9DA5B4]/60 uppercase tracking-wider mb-2">Harmonic Series</p>
                      <div className="flex items-end gap-1 h-16">
                        {latestAnalysis.harmonicSeries.slice(0, 12).map((h: number, i: number) => (
                          <div key={i} className="flex-1 flex flex-col items-center gap-0.5">
                            <div className="w-full rounded-t" style={{ height: `${Math.max(h * 60, 2)}px`, background: `hsla(${280 + i * 15}, 70%, 55%, ${0.5 + h * 0.5})` }} />
                            <span className="text-[7px] font-mono text-[#9DA5B4]">H{i + 1}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {latestAnalysis?.peakFrequencies?.length > 0 && (
                    <div className="bg-[#0E1525] border border-[#2B3245] rounded-lg p-4">
                      <p className="text-[10px] font-mono text-[#9DA5B4]/60 uppercase tracking-wider mb-2">Peak Frequencies</p>
                      <div className="flex flex-wrap gap-2">
                        {latestAnalysis.peakFrequencies.slice(0, 8).map((p: any, i: number) => (
                          <div key={i} className="bg-[#1C2333] border border-[#2B3245] rounded px-2 py-1">
                            <span className="text-[10px] font-mono text-amber-400">{p.freq?.toFixed(0)}Hz</span>
                            <span className="text-[9px] font-mono text-[#9DA5B4] ml-1">({(p.magnitude * 100).toFixed(0)}%)</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </>
          )}

          {!active && engineStatus && (
            <div className="bg-[#0E1525] border border-[#2B3245] rounded-lg p-4">
              <p className="text-[10px] font-mono text-[#9DA5B4]/60 uppercase tracking-wider mb-3">Engine Status</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="text-center"><p className="text-lg font-bold font-mono text-rose-400">{totalSamples}</p><p className="text-[10px] font-mono text-[#9DA5B4]">Samples</p></div>
                <div className="text-center"><p className="text-lg font-bold font-mono text-amber-400">{insightsGenerated}</p><p className="text-[10px] font-mono text-[#9DA5B4]">Brain Insights</p></div>
                <div className="text-center"><p className="text-lg font-bold font-mono text-emerald-400">{engineStatus.learnedPatterns || 0}</p><p className="text-[10px] font-mono text-[#9DA5B4]">Learned Patterns</p></div>
                <div className="text-center"><p className="text-lg font-bold font-mono text-cyan-400">{engineStatus.patternTemplates || 0}</p><p className="text-[10px] font-mono text-[#9DA5B4]">Templates</p></div>
              </div>
              {engineStatus.noiseFloor > 0 && (
                <div className="mt-3 flex gap-4 text-[10px] font-mono text-[#9DA5B4]">
                  <span>Noise floor: {(engineStatus.noiseFloor * 100).toFixed(2)}%</span>
                  <span>Sensitivity: {(engineStatus.sensitivity * 100).toFixed(0)}%</span>
                  <span>Calibrations: {engineStatus.calibrationSamples}</span>
                </div>
              )}
            </div>
          )}

          {!active && !engineStatus && (
            <div className="text-center py-6 font-mono text-[#9DA5B4] text-sm">
              <Radio className="w-8 h-8 mx-auto mb-3 opacity-30" />
              <p>Harmonic Insight Engine inactive</p>
              <p className="text-xs mt-1">Activate to begin spectral analysis with pattern recognition and adaptive learning</p>
            </div>
          )}
        </div>
      )}

      {activeTab === "rai" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-[#9DA5B4]">
              Real-time acoustic interface for live sound capture and analysis. Detects pitch, tone class,
              emotional valence, voice presence, and ambient environment profile. Privacy: audio processed in real-time only — no persistent recording.
            </p>
            <button type="button" onClick={toggleRai} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-mono transition-all ml-4 shrink-0 ${raiActive ? "bg-violet-500/20 border border-violet-500/40 text-violet-400 hover:bg-violet-500/30" : "bg-[#2B3245] border border-[#3D4659] text-[#9DA5B4] hover:border-violet-500/30 hover:text-violet-400"}`}>
              <Mic className={`w-3.5 h-3.5 ${raiActive ? "animate-pulse" : ""}`} />
              {raiActive ? "LISTENING" : "ACTIVATE"}
            </button>
          </div>

          {raiActive && (
            <>
              <div className="rounded-xl border border-violet-500/15 bg-[#0E1525] overflow-hidden">
                <div className="px-3 py-1.5 border-b border-violet-500/10 flex items-center justify-between">
                  <span className="text-[10px] font-mono text-violet-400/70 tracking-wider uppercase">Live Waveform</span>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                    <span className="text-[10px] font-mono text-green-400/70">{raiSamples} samples</span>
                  </div>
                </div>
                <canvas ref={raiCanvasRef} width={800} height={120} className="w-full h-[100px]" />
              </div>

              {raiAnalysis && (
                <>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    <div className="bg-[#0E1525] border border-[#2B3245] rounded-lg p-3 text-center">
                      <p className="text-[10px] font-mono text-[#9DA5B4]">Pitch</p>
                      <p className="text-lg font-bold font-mono text-violet-400">{raiAnalysis.pitch?.toFixed(0) || 0}<span className="text-xs text-[#9DA5B4]">Hz</span></p>
                      <p className="text-[9px] font-mono text-violet-400/60">{raiAnalysis.pitchNote || "—"}</p>
                    </div>
                    <div className="bg-[#0E1525] border border-[#2B3245] rounded-lg p-3 text-center">
                      <p className="text-[10px] font-mono text-[#9DA5B4]">Tone Class</p>
                      <p className="text-sm font-bold font-mono text-amber-400">{raiAnalysis.toneClass || "—"}</p>
                    </div>
                    <div className="bg-[#0E1525] border border-[#2B3245] rounded-lg p-3 text-center">
                      <p className="text-[10px] font-mono text-[#9DA5B4]">Energy</p>
                      <p className="text-lg font-bold font-mono text-green-400">{((raiAnalysis.energyLevel || 0) * 100).toFixed(1)}<span className="text-xs text-[#9DA5B4]">%</span></p>
                    </div>
                    <div className="bg-[#0E1525] border border-[#2B3245] rounded-lg p-3 text-center">
                      <p className="text-[10px] font-mono text-[#9DA5B4]">Brightness</p>
                      <p className="text-lg font-bold font-mono text-cyan-400">{((raiAnalysis.spectralBrightness || 0) * 100).toFixed(0)}<span className="text-xs text-[#9DA5B4]">%</span></p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    <div className="bg-[#0E1525] border border-violet-500/15 rounded-lg p-3">
                      <p className="text-[10px] font-mono text-violet-400/70 mb-1">Emotional Valence</p>
                      <p className="text-sm font-mono text-white/85">{raiAnalysis.emotionalValence || "—"}</p>
                    </div>
                    <div className="bg-[#0E1525] border border-violet-500/15 rounded-lg p-3">
                      <p className="text-[10px] font-mono text-violet-400/70 mb-1">Ambient Profile</p>
                      <p className="text-sm font-mono text-white/85">{raiAnalysis.ambientProfile || "—"}</p>
                    </div>
                    <div className="bg-[#0E1525] border border-violet-500/15 rounded-lg p-3">
                      <p className="text-[10px] font-mono text-violet-400/70 mb-1">Voice Detected</p>
                      <p className="text-sm font-mono">{raiAnalysis.voiceDetected ? <span className="text-emerald-400">YES — human voice present</span> : <span className="text-[#9DA5B4]">No voice detected</span>}</p>
                    </div>
                  </div>

                  <div className="bg-[#0E1525] border border-[#2B3245] rounded-lg p-4">
                    <p className="text-[10px] font-mono text-[#9DA5B4]/60 uppercase tracking-wider mb-3">Frequency Bands</p>
                    <div className="space-y-2">
                      {raiAnalysis.frequencyBands && Object.entries(raiAnalysis.frequencyBands).map(([band, val], i) => (
                        <div key={band} className="flex items-center gap-3">
                          <span className={`text-[10px] font-mono w-10 ${bandColors[i] || "text-white"}`}>{bandNames[i] || band}</span>
                          <div className="flex-1 h-3 bg-[#1C2333] rounded-full overflow-hidden">
                            <div className="h-full rounded-full transition-all duration-500" style={{ width: `${Math.min((val as number) * 100, 100)}%`, background: `linear-gradient(90deg, ${bandGradients[i] || "#8b5cf6"}88, ${bandGradients[i] || "#8b5cf6"})` }} />
                          </div>
                          <span className="text-[10px] font-mono text-[#9DA5B4] w-12 text-right">{((val as number) * 100).toFixed(1)}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </>
          )}

          {!raiActive && (
            <div className="text-center py-6 font-mono text-[#9DA5B4] text-sm">
              <Mic className="w-8 h-8 mx-auto mb-3 opacity-30" />
              <p>Real-time Acoustic Interface inactive</p>
              <p className="text-xs mt-1">Activate to capture and analyze ambient sound — pitch, tone, emotion, and environment detection</p>
              <p className="text-[10px] mt-2 text-violet-400/40">Audio is processed in real-time only — no persistent storage</p>
            </div>
          )}
        </div>
      )}
    </div>
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
        <h3 className="font-semibold text-red-400 text-sm">Delete Account</h3>
      </div>
      <p className="text-xs text-[#9DA5B4] mb-4">
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
          className="px-4 py-2 rounded-lg border border-red-500/30 bg-red-500/10 text-red-400 text-xs font-semibold hover:bg-red-500/20 transition-colors"
        >
          Delete my account
        </button>
      ) : (
        <div className="space-y-3">
          <p className="text-xs text-red-300">
            Type <span className="font-bold text-white">DELETE MY ACCOUNT</span> to confirm:
          </p>
          <input
            type="text"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder="DELETE MY ACCOUNT"
            className="w-full max-w-xs px-3 py-2 rounded-lg border border-red-500/30 bg-[#1C2333] text-white font-mono text-xs tracking-wider focus:outline-none focus:border-red-500/60"
          />
          <div className="flex items-center gap-3">
            <button
              onClick={handleDelete}
              disabled={confirmText !== "DELETE MY ACCOUNT" || deleting}
              className="px-4 py-2 rounded-lg bg-red-600 text-white text-xs font-semibold hover:bg-red-500 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {deleting ? "Deleting..." : "Confirm Permanent Deletion"}
            </button>
            <button
              onClick={() => { setConfirming(false); setConfirmText(""); setError(null); }}
              className="px-4 py-2 rounded-lg border border-[#2B3245] text-[#9DA5B4] text-xs font-medium hover:text-white/90 transition-colors"
            >
              Cancel
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
    <div data-theme="dark" className="rounded-2xl border border-[#2B3245] p-6 space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
          <Lock className="w-4 h-4 text-violet-400" />
        </div>
        <div>
          <h3 className="text-white font-semibold text-sm tracking-wide">Two-Factor Authentication</h3>
          <p className="text-[#9DA5B4] text-xs font-mono">
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
          <p className="text-[#9DA5B4] text-xs">
            Use an authenticator app (Google Authenticator, Authy, etc.) to generate a verification code each time you log in.
          </p>
          <button
            onClick={startSetup}
            disabled={loading}
            className="px-4 py-2 rounded-lg bg-violet-600 text-white text-xs font-semibold hover:bg-violet-500 transition-colors disabled:opacity-40"
          >
            {loading ? "Setting up..." : "Enable 2FA"}
          </button>
        </div>
      )}

      {phase === "setup" && (
        <div className="space-y-4">
          <p className="text-[#9DA5B4] text-xs">
            Scan this QR code with your authenticator app, or manually enter the secret key below:
          </p>
          <div className="flex flex-col items-center gap-3 p-4 rounded-xl bg-[#2B3245]/50 border border-[#2B3245]">
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(otpauthUrl)}`}
              alt="2FA QR Code"
              className="w-48 h-48 rounded-lg"
            />
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#1C2333] border border-[#2B3245]">
              <code className="text-[#9DA5B4] text-xs font-mono tracking-wider">{secret}</code>
              <button onClick={() => navigator.clipboard.writeText(secret)} className="text-[#9DA5B4]/60 hover:text-[#9DA5B4] transition-colors">
                <Copy className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
          <div>
            <label className="text-[#9DA5B4] text-xs font-mono block mb-1.5">Enter the 6-digit code from your app:</label>
            <div className="flex items-center gap-3">
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="000000"
                maxLength={6}
                className="w-36 px-3 py-2 rounded-lg border border-[#2B3245] bg-[#1C2333] text-white font-mono text-sm tracking-[0.3em] text-center focus:outline-none focus:border-violet-500/50"
              />
              <button
                onClick={verifyCode}
                disabled={code.length !== 6 || loading}
                className="px-4 py-2 rounded-lg bg-violet-600 text-white text-xs font-semibold hover:bg-violet-500 transition-colors disabled:opacity-40"
              >
                {loading ? "Verifying..." : "Verify"}
              </button>
              <button
                onClick={() => { setPhase("idle"); setCode(""); setError(null); }}
                className="px-3 py-2 rounded-lg border border-[#2B3245] text-[#9DA5B4] font-mono text-xs hover:text-[#9DA5B4] transition-colors"
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
            <p className="text-[#9DA5B4] text-xs mb-3">
              Store these codes somewhere safe. Each code can be used once if you lose access to your authenticator app.
            </p>
            <div className="grid grid-cols-2 gap-1.5">
              {backupCodes.map((c, i) => (
                <code key={i} className="text-[#9DA5B4] text-xs font-mono bg-[#1C2333]/80 px-2 py-1 rounded">{c}</code>
              ))}
            </div>
            <button
              onClick={() => navigator.clipboard.writeText(backupCodes.join("\n"))}
              className="mt-3 flex items-center gap-1.5 text-[#9DA5B4] text-xs font-mono hover:text-[#9DA5B4] transition-colors"
            >
              <Copy className="w-3 h-3" /> Copy all codes
            </button>
          </div>
          <button
            onClick={() => setBackupCodes([])}
            className="text-[#9DA5B4]/60 text-xs font-mono hover:text-[#9DA5B4] transition-colors"
          >
            I've saved my backup codes
          </button>
        </div>
      )}

      {isEnabled && phase !== "setup" && backupCodes.length === 0 && (
        <div className="space-y-3">
          <p className="text-[#9DA5B4] text-xs">
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
                className="w-36 px-3 py-2 rounded-lg border border-[#2B3245] bg-[#1C2333] text-white font-mono text-sm tracking-[0.3em] text-center focus:outline-none focus:border-red-500/50"
              />
              <button
                onClick={disable2FA}
                disabled={code.length !== 6 || loading}
                className="px-4 py-2 rounded-lg bg-red-600 text-white text-xs font-semibold hover:bg-red-500 transition-colors disabled:opacity-40"
              >
                {loading ? "Disabling..." : "Confirm Disable"}
              </button>
              <button
                onClick={() => { setPhase("idle"); setCode(""); setError(null); }}
                className="px-3 py-2 rounded-lg border border-[#2B3245] text-[#9DA5B4] font-mono text-xs hover:text-[#9DA5B4] transition-colors"
              >
                CANCEL
              </button>
            </div>
          ) : (
            <button
              onClick={() => { setPhase("disabling"); setCode(""); setError(null); }}
              className="px-4 py-2 rounded-lg border border-red-500/30 text-red-400 text-xs font-semibold hover:bg-red-500/10 transition-colors"
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
    ? `${window.location.origin}/?ref=${referralCode}`
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
    <div data-theme="dark" className="rounded-2xl border border-[#2B3245] p-6 space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
          <Users className="w-4 h-4 text-cyan-400" />
        </div>
        <div>
          <h3 className="text-white font-semibold text-sm tracking-wide">Referral Program</h3>
          <p className="text-[#9DA5B4] text-xs font-mono">Earn 500 credits for every friend who makes a purchase</p>
        </div>
      </div>

      <div className="p-4 rounded-xl bg-gradient-to-r from-cyan-500/5 to-violet-500/5 border border-[#2B3245] space-y-3">
        <div>
          <label className="text-[#9DA5B4] text-[10px] font-mono block mb-1">Your referral code</label>
          <div className="flex items-center gap-2">
            <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-lg bg-[#1C2333] border border-[#2B3245]">
              <code className="text-white font-mono text-sm tracking-[0.2em] font-bold">{referralCode}</code>
            </div>
            <button
              onClick={copyCode}
              className="px-3 py-2 rounded-lg border border-[#2B3245] text-[#9DA5B4] hover:text-white/90 transition-colors"
              title="Copy code"
            >
              {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div>
          <label className="text-[#9DA5B4] text-[10px] font-mono block mb-1">Share link</label>
          <div className="flex items-center gap-2">
            <div className="flex-1 px-3 py-2 rounded-lg bg-[#1C2333] border border-[#2B3245] overflow-hidden">
              <code className="text-[#9DA5B4] text-xs font-mono truncate block">{shareUrl}</code>
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
          <div className="p-3 rounded-xl bg-[#2B3245]/30 border border-[#2B3245] text-center">
            <div className="text-white font-bold text-lg">{stats.totalReferred}</div>
            <div className="text-[#9DA5B4]/60 text-[10px] font-mono tracking-wider">Referred</div>
          </div>
          <div className="p-3 rounded-xl bg-[#2B3245]/30 border border-[#2B3245] text-center">
            <div className="text-green-400 font-bold text-lg">{stats.completedReferrals}</div>
            <div className="text-[#9DA5B4]/60 text-[10px] font-mono tracking-wider">Completed</div>
          </div>
          <div className="p-3 rounded-xl bg-[#2B3245]/30 border border-[#2B3245] text-center">
            <div className="text-cyan-400 font-bold text-lg">{stats.totalCreditsEarned}</div>
            <div className="text-[#9DA5B4]/60 text-[10px] font-mono tracking-wider">Credits Earned</div>
          </div>
        </div>
      )}

      {!hasReferrer && (
        <div className="space-y-2">
          <label className="text-[#9DA5B4] text-[10px] font-mono block">Have a referral code??</label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={applyCode}
              onChange={(e) => setApplyCode(e.target.value.toUpperCase())}
              placeholder="OMN-XXXXXXXX"
              className="flex-1 max-w-xs px-3 py-2 rounded-lg border border-[#2B3245] bg-[#1C2333] text-white font-mono text-xs tracking-wider focus:outline-none focus:border-cyan-500/50"
            />
            <button
              onClick={handleApplyCode}
              disabled={!applyCode.trim() || applying}
              className="px-4 py-2 rounded-lg bg-[#2B3245]/50 border border-[#2B3245] text-[#9DA5B4] text-xs font-semibold hover:bg-[#2B3245] transition-colors disabled:opacity-40"
            >
              {applying ? "Applying..." : "Apply"}
            </button>
          </div>
          {applyMsg && (
            <p className={`text-xs font-mono ${applyMsg.type === "success" ? "text-green-400" : "text-red-400"}`}>
              {applyMsg.msg}
            </p>
          )}
        </div>
      )}

      <p className="text-[#9DA5B4]/60 text-[10px] font-mono">
        Share your code with friends. When they make their first purchase (any credit pack or subscription), you receive 500 bonus credits.
      </p>
    </div>
  );
}
