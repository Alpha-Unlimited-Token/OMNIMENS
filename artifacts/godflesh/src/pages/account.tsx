import React, { useEffect, useState } from "react";
import { Layout } from "@/components/layout";
import { useAuth } from "@workspace/replit-auth-web";
import { useLocation } from "wouter";
import { useGetOmnimensStatus } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { User, LogOut, Activity, Zap, Shield, Brain, Cpu, Trash2, ChevronDown, ChevronUp, Plus, Save, RefreshCw, Microscope, PenLine, BarChart2, Palette, GraduationCap, Briefcase, Check, Atom, Code2, Layers, Eye, AlertTriangle, Wrench, Dna, Play, Wallet, CreditCard, Gift, TrendingUp } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

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

export default function Account() {
  const { isAuthenticated, user, isLoading, logout } = useAuth();
  const [, setLocation] = useLocation();
  const { data: status, isLoading: statusLoading } = useGetOmnimensStatus();
  const { data: billing } = useBillingInfo();

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

  useEffect(() => {
    if (!isLoading && !isAuthenticated) setLocation("/");
  }, [isLoading, isAuthenticated, setLocation]);

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
      <div className="container mx-auto px-4 py-12 max-w-3xl">
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
                    <Button onClick={() => setLocation("/omnimens/pricing")} size="sm" variant={(status as any)?.credits < 100 ? "default" : "secondary"}>
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
                      <button onClick={() => setLocation("/omnimens/pricing")} className="text-xs font-mono text-primary hover:underline">
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
        <div className="bg-black/40 border border-white/10 rounded-xl p-6 mb-6">
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
        <div className="bg-black/40 border border-white/10 rounded-xl p-6 mb-6">
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
      </div>
    </Layout>
  );
}
