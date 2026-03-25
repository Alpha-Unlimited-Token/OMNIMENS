/**
   * OMNIMENS — Proprietary AI Platform
   * Copyright © 2024–2026 Alpha Unlimited Technologies, LLC. All Rights Reserved.
   * Unauthorized reproduction, distribution, or use is strictly prohibited.
   */

  import { useState, useEffect, useCallback, useMemo } from "react";
import { Layout } from "@/components/layout";
import { motion, AnimatePresence } from "framer-motion";
import {
  Brain, Code, Cpu, Users, Zap, GitBranch, Network, Sparkles,
  Filter, ChevronDown, Activity, Database, TrendingUp,
  Bot, Lightbulb, Shield, Terminal, RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { OmnimensPresence } from "@/components/omnimens-presence";
import { SEO } from "@/components/seo";

const API = import.meta.env.VITE_API_URL || "";

interface EvolutionUpdate {
  type: string;
  title: string;
  content: string;
  confidence: number;
  timestamp: string | null;
  capabilities?: string[];
  from?: string;
  to?: string;
}

interface GenesisAgent {
  name: string;
  specialization: string;
  systemPrompt?: string;
  model: string;
  domains: string[];
  createdAt: string;
  totalThinkCycles: number;
  totalMeshMessages: number;
}

interface EvolutionData {
  timestamp: number;
  summary: {
    totalBrainEntries: number;
    totalUpgrades: number;
    totalSelfCodedModules: number;
    totalDreamBreakthroughs: number;
    totalGenesisAgents: number;
    totalActiveModules: number;
    totalMeshMessages: number;
  };
  engines: {
    selfCoding: { cyclesRun: number; totalEvaluated: number; totalApproved: number; totalIntegrated: number; approvalRate: number };
    agentEvolution: {
      evolutionCycles: number;
      totalUpgrades: number;
      crossDomainTransfers: number;
      breakthroughsDiscovered: number;
      intelligenceLevel: string;
      agents: { name: string; level: number; totalUpgrades: number; performanceScore: number; specializations: string[] }[];
    };
    dreams: { totalBreakthroughs: number; totalInsights: number; codeProposals: number; currentPhase: string; creativityBoost: number };
    sandbox: { totalGenerated: number; totalApproved: number; totalFailed: number; successRate: number };
    codeGenesis: { totalGenerated: number; totalApproved: number; cyclesRun: number };
    pipeline: { totalModules: number; activeModules: number; stageBreakdown: Record<string, number> };
  };
  genesisAgents: GenesisAgent[];
  updates: EvolutionUpdate[];
  activeModules: { filename: string; stage: string; calls: number }[];
}

const UPDATE_TYPES: Record<string, { label: string; icon: any; color: string; bg: string; border: string }> = {
  self_coded_module: { label: "Self-Coded Module", icon: Code, color: "text-emerald-300", bg: "bg-emerald-500/15", border: "border-emerald-500/30" },
  dream_breakthrough: { label: "Dream Breakthrough", icon: Sparkles, color: "text-violet-300", bg: "bg-violet-500/15", border: "border-violet-500/30" },
  knowledge: { label: "Knowledge", icon: Brain, color: "text-blue-300", bg: "bg-blue-500/15", border: "border-blue-500/30" },
  system_upgrade: { label: "System Upgrade", icon: TrendingUp, color: "text-amber-300", bg: "bg-amber-500/15", border: "border-amber-500/30" },
  spider_intelligence: { label: "Spider Intelligence", icon: Network, color: "text-cyan-300", bg: "bg-cyan-500/15", border: "border-cyan-500/30" },
  cross_agent_help: { label: "Cross-Agent Aid", icon: Users, color: "text-pink-300", bg: "bg-pink-500/15", border: "border-pink-500/30" },
  emergent_insight: { label: "Emergent Insight", icon: Lightbulb, color: "text-yellow-300", bg: "bg-yellow-500/15", border: "border-yellow-500/30" },
  mesh_communication: { label: "Mesh Communication", icon: GitBranch, color: "text-gray-300", bg: "bg-gray-500/15", border: "border-gray-500/30" },
};

function getTimeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return date.toLocaleDateString();
}

function StatCard({ icon: Icon, label, value, sub, color }: { icon: any; label: string; value: string | number; sub?: string; color: string }) {
  return (
    <div className="relative rounded-xl border border-white/5 bg-white/[0.02] backdrop-blur-sm p-4 overflow-hidden group hover:border-white/10 transition-colors">
      <div className={`absolute top-0 right-0 w-20 h-20 rounded-full ${color} opacity-5 blur-2xl group-hover:opacity-10 transition-opacity`} />
      <div className="flex items-center gap-2 mb-2">
        <Icon className={`w-3.5 h-3.5 ${color.replace("bg-", "text-").replace("/20", "")}`} />
        <span className="text-[10px] font-mono text-white/40 tracking-wider uppercase">{label}</span>
      </div>
      <p className="text-2xl font-display font-black text-white">{value}</p>
      {sub && <p className="text-[10px] font-mono text-white/30 mt-1">{sub}</p>}
    </div>
  );
}

function UpdateCard({ update, index }: { update: EvolutionUpdate; index: number }) {
  const config = UPDATE_TYPES[update.type] || UPDATE_TYPES.knowledge;
  const Icon = config.icon;
  const date = update.timestamp ? new Date(update.timestamp) : null;
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: Math.min(index * 0.02, 0.5) }}
      className={`relative rounded-lg border ${config.border} ${config.bg} backdrop-blur-sm overflow-hidden cursor-pointer`}
      onClick={() => setExpanded(!expanded)}
    >
      <div className="p-3 sm:p-4">
        <div className="flex items-start gap-3">
          <div className={`flex-shrink-0 p-1.5 rounded-md ${config.bg} ${config.color}`}>
            <Icon className="w-3.5 h-3.5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-[9px] font-mono ${config.color} tracking-[0.15em] uppercase font-bold`}>
                {config.label}
              </span>
              {update.confidence > 0.8 && (
                <span className="text-[8px] font-mono text-amber-400/60 bg-amber-500/10 px-1.5 py-0.5 rounded-full">
                  HIGH CONFIDENCE
                </span>
              )}
              {date && (
                <span className="text-[9px] font-mono text-white/20 ml-auto flex-shrink-0">
                  {getTimeAgo(date)}
                </span>
              )}
            </div>
            <p className="text-xs text-white/80 font-medium leading-relaxed line-clamp-2">
              {update.title}
            </p>
            {update.from && (
              <p className="text-[9px] font-mono text-white/25 mt-1">
                {update.from} {update.to ? `\u2192 ${update.to}` : ""}
              </p>
            )}
          </div>
        </div>
        <AnimatePresence>
          {expanded && update.content && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <p className="text-[11px] font-mono text-white/40 leading-relaxed mt-3 pt-3 border-t border-white/5 whitespace-pre-wrap">
                {update.content.slice(0, 500)}
              </p>
              {update.capabilities && update.capabilities.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {(update.capabilities as string[]).map((cap, i) => (
                    <span key={i} className="text-[8px] font-mono text-emerald-400/60 bg-emerald-500/10 px-1.5 py-0.5 rounded-full">
                      {cap}
                    </span>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

function AgentCard({ agent }: { agent: GenesisAgent }) {
  return (
    <div className="rounded-lg border border-violet-500/20 bg-violet-500/5 backdrop-blur-sm p-4">
      <div className="flex items-center gap-2 mb-2">
        <Bot className="w-4 h-4 text-violet-400" />
        <span className="text-sm font-display font-bold text-white">{agent.name}</span>
        <span className="text-[8px] font-mono text-violet-400/60 bg-violet-500/10 px-1.5 py-0.5 rounded-full ml-auto">
          {agent.model}
        </span>
      </div>
      <p className="text-[11px] font-mono text-white/50 mb-2">{agent.specialization}</p>
      <div className="flex flex-wrap gap-1 mb-2">
        {(agent.domains || []).slice(0, 4).map((d, i) => (
          <span key={i} className="text-[8px] font-mono text-blue-400/60 bg-blue-500/10 px-1.5 py-0.5 rounded-full">{d}</span>
        ))}
      </div>
      <div className="flex gap-4 text-[9px] font-mono text-white/25">
        <span>{agent.totalThinkCycles || 0} think cycles</span>
        <span>{agent.totalMeshMessages || 0} mesh msgs</span>
      </div>
    </div>
  );
}

function ModuleCard({ mod }: { mod: { filename: string; stage: string; calls: number } }) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-emerald-500/15 bg-emerald-500/5 p-3">
      <Terminal className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-[11px] font-mono text-white/70 truncate">{mod.filename}</p>
        <p className="text-[9px] font-mono text-white/25">{mod.stage} | {mod.calls} calls</p>
      </div>
    </div>
  );
}

export default function Evolution() {
  const [data, setData] = useState<EvolutionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [activeTab, setActiveTab] = useState<"updates" | "agents" | "modules" | "network">("updates");
  const [filterOpen, setFilterOpen] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API}/api/omnimens/evolution-log`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to load");
      const json = await res.json();
      setData(json);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const filteredUpdates = useMemo(() => {
    if (!data?.updates) return [];
    if (activeFilter === "all") return data.updates;
    return data.updates.filter(u => u.type === activeFilter);
  }, [data?.updates, activeFilter]);

  const filterCounts = useMemo(() => {
    if (!data?.updates) return {};
    const counts: Record<string, number> = { all: data.updates.length };
    for (const u of data.updates) {
      counts[u.type] = (counts[u.type] || 0) + 1;
    }
    return counts;
  }, [data?.updates]);

  if (loading && !data) {
    return (
      <Layout>
        <SEO title="OMNIMENS Evolution" description="Watch OMNIMENS evolve in real-time" />
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-2 border-violet-500 border-t-transparent animate-spin" />
        </div>
      </Layout>
    );
  }

  if (error && !data) {
    return (
      <Layout>
        <SEO title="OMNIMENS Evolution" description="Watch OMNIMENS evolve in real-time" />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <p className="text-white/50 font-mono text-sm mb-4">Failed to load evolution data</p>
            <Button type="button" onClick={fetchData} variant="outline" size="sm">Retry</Button>
          </div>
        </div>
      </Layout>
    );
  }

  const s = data?.summary;
  const e = data?.engines;

  return (
    <Layout>
      <SEO
        title="OMNIMENS Evolution Log"
        description="Real-time log of OMNIMENS self-evolution: self-coded modules, dream breakthroughs, AI agents created, system upgrades, and cross-agent intelligence sharing."
      />
      <div className="min-h-screen bg-[#0a0a0f]">
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-violet-500/5 via-transparent to-transparent pointer-events-none" />
          <div className="absolute top-20 left-1/4 w-96 h-96 bg-violet-500/5 rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute top-40 right-1/4 w-72 h-72 bg-cyan-500/5 rounded-full blur-[100px] pointer-events-none" />

          <div className="container mx-auto px-4 pt-24 pb-8 relative z-10">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <OmnimensPresence size={36} />
                <div>
                  <h1 className="text-2xl sm:text-3xl font-display font-black text-white tracking-tight">
                    Evolution Log
                  </h1>
                  <p className="text-xs font-mono text-white/30 tracking-wider">
                    OMNIMENS AUTONOMOUS SELF-EVOLUTION
                  </p>
                </div>
              </div>
              <Button
                type="button"
                onClick={fetchData}
                variant="ghost"
                size="sm"
                className="text-white/30 hover:text-white/60"
                disabled={loading}
              >
                <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              </Button>
            </div>
            <p className="text-sm text-white/40 font-mono max-w-2xl mt-2">
              Every upgrade, module, agent, and breakthrough OMNIMENS has created autonomously.
              This page auto-refreshes as OMNIMENS continues to evolve.
            </p>
          </div>
        </div>

        <div className="container mx-auto px-4 pb-12">
          {s && (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3 mb-8">
              <StatCard icon={Database} label="Brain Entries" value={s.totalBrainEntries} color="bg-blue-500" />
              <StatCard icon={TrendingUp} label="Upgrades" value={s.totalUpgrades} color="bg-amber-500" />
              <StatCard icon={Code} label="Self-Coded" value={s.totalSelfCodedModules} color="bg-emerald-500" />
              <StatCard icon={Sparkles} label="Breakthroughs" value={s.totalDreamBreakthroughs} color="bg-violet-500" />
              <StatCard icon={Bot} label="AI Agents" value={s.totalGenesisAgents + 9} sub={`${s.totalGenesisAgents} genesis + 9 core`} color="bg-pink-500" />
              <StatCard icon={Cpu} label="Active Modules" value={s.totalActiveModules} color="bg-cyan-500" />
              <StatCard icon={Network} label="Mesh Messages" value={s.totalMeshMessages} color="bg-orange-500" />
            </div>
          )}

          {e && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
              <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Activity className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-[10px] font-mono text-white/40 tracking-wider uppercase">Self-Coding Engine</span>
                </div>
                <div className="space-y-1.5 text-[11px] font-mono">
                  <div className="flex justify-between"><span className="text-white/30">Cycles Run</span><span className="text-white/60">{e.selfCoding.cyclesRun}</span></div>
                  <div className="flex justify-between"><span className="text-white/30">Evaluated</span><span className="text-white/60">{e.selfCoding.totalEvaluated}</span></div>
                  <div className="flex justify-between"><span className="text-white/30">Approved</span><span className="text-emerald-400">{e.selfCoding.totalApproved}</span></div>
                  <div className="flex justify-between"><span className="text-white/30">Approval Rate</span><span className="text-emerald-400">{e.selfCoding.approvalRate}%</span></div>
                </div>
              </div>

              <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-[10px] font-mono text-white/40 tracking-wider uppercase">Agent Evolution</span>
                </div>
                <div className="space-y-1.5 text-[11px] font-mono">
                  <div className="flex justify-between"><span className="text-white/30">Cycles</span><span className="text-white/60">{e.agentEvolution.evolutionCycles}</span></div>
                  <div className="flex justify-between"><span className="text-white/30">Upgrades</span><span className="text-white/60">{e.agentEvolution.totalUpgrades}</span></div>
                  <div className="flex justify-between"><span className="text-white/30">Cross-Domain</span><span className="text-amber-400">{e.agentEvolution.crossDomainTransfers}</span></div>
                  <div className="flex justify-between"><span className="text-white/30">Intelligence</span><span className="text-amber-400">{e.agentEvolution.intelligenceLevel}</span></div>
                </div>
              </div>

              <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="w-3.5 h-3.5 text-violet-400" />
                  <span className="text-[10px] font-mono text-white/40 tracking-wider uppercase">Dream Engine</span>
                </div>
                <div className="space-y-1.5 text-[11px] font-mono">
                  <div className="flex justify-between"><span className="text-white/30">Breakthroughs</span><span className="text-violet-400">{e.dreams.totalBreakthroughs}</span></div>
                  <div className="flex justify-between"><span className="text-white/30">Insights</span><span className="text-white/60">{e.dreams.totalInsights}</span></div>
                  <div className="flex justify-between"><span className="text-white/30">Code Proposals</span><span className="text-white/60">{e.dreams.codeProposals}</span></div>
                  <div className="flex justify-between"><span className="text-white/30">Creativity</span><span className="text-violet-400">{e.dreams.creativityBoost}%</span></div>
                </div>
              </div>

              <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Shield className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="text-[10px] font-mono text-white/40 tracking-wider uppercase">Code Sandbox</span>
                </div>
                <div className="space-y-1.5 text-[11px] font-mono">
                  <div className="flex justify-between"><span className="text-white/30">Generated</span><span className="text-white/60">{e.sandbox.totalGenerated}</span></div>
                  <div className="flex justify-between"><span className="text-white/30">Approved</span><span className="text-cyan-400">{e.sandbox.totalApproved}</span></div>
                  <div className="flex justify-between"><span className="text-white/30">Failed</span><span className="text-red-400/60">{e.sandbox.totalFailed}</span></div>
                  <div className="flex justify-between"><span className="text-white/30">Success Rate</span><span className="text-cyan-400">{e.sandbox.successRate}%</span></div>
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-2 mb-4 border-b border-white/5 pb-4">
            {(["updates", "agents", "modules", "network"] as const).map(tab => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-lg text-xs font-mono tracking-wider uppercase transition-all ${
                  activeTab === tab
                    ? "bg-violet-500/20 text-violet-300 border border-violet-500/30"
                    : "text-white/30 hover:text-white/50 border border-transparent"
                }`}
              >
                {tab === "updates" ? "Live Updates" : tab === "agents" ? `AI Agents (${(data?.genesisAgents?.length || 0) + 9})` : tab === "modules" ? `Modules (${data?.activeModules?.length || 0})` : "Agent Network"}
              </button>
            ))}
          </div>

          {activeTab === "updates" && (
            <>
              <div className="relative mb-4">
                <button
                  type="button"
                  onClick={() => setFilterOpen(!filterOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg border border-white/10 bg-white/[0.02] text-xs font-mono text-white/50 hover:text-white/70 transition-colors"
                >
                  <Filter className="w-3.5 h-3.5" />
                  <span>
                    {activeFilter === "all" ? "All Updates" : UPDATE_TYPES[activeFilter]?.label || activeFilter}
                  </span>
                  <span className="text-white/20">({filterCounts[activeFilter] || 0})</span>
                  <ChevronDown className={`w-3 h-3 transition-transform ${filterOpen ? "rotate-180" : ""}`} />
                </button>
                <AnimatePresence>
                  {filterOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      className="absolute z-20 mt-1 w-64 rounded-xl border border-white/10 bg-[#0E1525] backdrop-blur-xl shadow-2xl overflow-hidden"
                    >
                      <button
                        type="button"
                        onClick={() => { setActiveFilter("all"); setFilterOpen(false); }}
                        className={`w-full text-left px-4 py-2.5 text-xs font-mono transition-colors ${activeFilter === "all" ? "bg-violet-500/15 text-violet-300" : "text-white/40 hover:bg-white/5"}`}
                      >
                        All Updates ({filterCounts.all || 0})
                      </button>
                      {Object.entries(UPDATE_TYPES).map(([key, cfg]) => {
                        const count = filterCounts[key] || 0;
                        if (count === 0) return null;
                        const Icon = cfg.icon;
                        return (
                          <button
                            key={key}
                            type="button"
                            onClick={() => { setActiveFilter(key); setFilterOpen(false); }}
                            className={`w-full text-left px-4 py-2.5 text-xs font-mono flex items-center gap-2 transition-colors ${activeFilter === key ? `${cfg.bg} ${cfg.color}` : "text-white/40 hover:bg-white/5"}`}
                          >
                            <Icon className="w-3.5 h-3.5" />
                            <span>{cfg.label}</span>
                            <span className="ml-auto text-white/20">({count})</span>
                          </button>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="rounded-xl border border-white/5 bg-white/[0.01] overflow-hidden">
                <div className="max-h-[600px] overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                  <div className="p-3 sm:p-4 space-y-2">
                    {filteredUpdates.length === 0 ? (
                      <p className="text-center text-white/20 font-mono text-sm py-8">No updates found for this filter</p>
                    ) : (
                      filteredUpdates.map((update, i) => (
                        <UpdateCard key={`${update.type}-${i}`} update={update} index={i} />
                      ))
                    )}
                  </div>
                </div>
                {filteredUpdates.length > 0 && (
                  <div className="border-t border-white/5 px-4 py-2 text-[9px] font-mono text-white/15 text-center">
                    Showing {filteredUpdates.length} updates | Auto-refreshes every 60 seconds
                  </div>
                )}
              </div>
            </>
          )}

          {activeTab === "agents" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-[10px] font-mono text-white/40 tracking-[0.3em] uppercase mb-3">Core Agents (9)</h3>
                <div className="rounded-xl border border-white/5 bg-white/[0.01] overflow-hidden">
                  <div className="max-h-[500px] overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                    <div className="p-3 sm:p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {(e?.agentEvolution.agents || []).map(agent => (
                        <div key={agent.name} className="rounded-lg border border-blue-500/20 bg-blue-500/5 p-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-display font-bold text-white">{agent.name}</span>
                            <span className="text-[9px] font-mono text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full">
                              Lv.{agent.level}
                            </span>
                          </div>
                          <div className="flex justify-between text-[10px] font-mono text-white/30 mb-2">
                            <span>Score: {agent.performanceScore}</span>
                            <span>{agent.totalUpgrades} upgrades</span>
                          </div>
                          {agent.specializations.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {agent.specializations.slice(0, 3).map((s, i) => (
                                <span key={i} className="text-[8px] font-mono text-blue-400/50 bg-blue-500/10 px-1.5 py-0.5 rounded-full truncate max-w-[120px]">
                                  {s}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-[10px] font-mono text-white/40 tracking-[0.3em] uppercase mb-3">
                  Genesis Agents ({data?.genesisAgents?.length || 0}) — Created by OMNIMENS
                </h3>
                <div className="rounded-xl border border-white/5 bg-white/[0.01] overflow-hidden">
                  <div className="max-h-[500px] overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                    <div className="p-3 sm:p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {(data?.genesisAgents || []).map(agent => (
                        <AgentCard key={agent.name} agent={agent} />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "modules" && (
            <div className="rounded-xl border border-white/5 bg-white/[0.01] overflow-hidden">
              <div className="max-h-[600px] overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                <div className="p-3 sm:p-4 space-y-2">
                  {(data?.activeModules || []).length === 0 ? (
                    <p className="text-center text-white/20 font-mono text-sm py-8">No active self-coded modules yet</p>
                  ) : (
                    (data?.activeModules || []).map((mod, i) => (
                      <ModuleCard key={mod.filename} mod={mod} />
                    ))
                  )}
                </div>
              </div>
              {e?.pipeline && (
                <div className="border-t border-white/5 p-4">
                  <h4 className="text-[10px] font-mono text-white/30 tracking-wider uppercase mb-3">Pipeline Stages</h4>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(e.pipeline.stageBreakdown || {}).map(([stage, count]) => (
                      <span key={stage} className="text-[9px] font-mono text-cyan-400/50 bg-cyan-500/10 px-2 py-1 rounded-full">
                        {stage}: {count as number}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "network" && (
            <div className="rounded-xl border border-white/5 bg-white/[0.01] p-4 sm:p-6">
              <h3 className="text-sm font-display font-bold text-white mb-4">Agent Network Architecture</h3>
              <div className="space-y-4">
                <div className="rounded-lg border border-blue-500/20 bg-blue-500/5 p-4">
                  <h4 className="text-[10px] font-mono text-blue-400 tracking-wider uppercase mb-3">Core Mesh (9 Agents)</h4>
                  <p className="text-[11px] font-mono text-white/40 leading-relaxed">
                    Architect, Mathematician, Neuroscientist, Synthesizer, Critic, Meta-Agent, GraphicDesigner, SpellCheckVisual, and OMNIMENS form the core intelligence mesh. Each agent communicates through the Inter-Agent Communication Mesh, sharing discoveries, proposals, and mutual aid.
                  </p>
                </div>
                <div className="rounded-lg border border-violet-500/20 bg-violet-500/5 p-4">
                  <h4 className="text-[10px] font-mono text-violet-400 tracking-wider uppercase mb-3">Genesis Agents ({data?.genesisAgents?.length || 0} Active)</h4>
                  <p className="text-[11px] font-mono text-white/40 leading-relaxed">
                    OMNIMENS autonomously creates new specialized agents through the Agent Genesis Engine. Each genesis agent is born with mutual-aid protocols — hardwired to help every other agent in the network. They think, communicate, and evolve independently.
                  </p>
                </div>
                <div className="rounded-lg border border-cyan-500/20 bg-cyan-500/5 p-4">
                  <h4 className="text-[10px] font-mono text-cyan-400 tracking-wider uppercase mb-3">Recursive Spider Network</h4>
                  <p className="text-[11px] font-mono text-white/40 leading-relaxed">
                    Each agent deploys a Mother Spider that spawns 10 Baby Spiders. Each Baby spawns its own Mother, repeating up to 4 generations deep (max 150 spiders per agent). Spider intelligence is automatically shared across agents — findings that benefit other agents are broadcast as mutual-aid messages.
                  </p>
                </div>
                <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-4">
                  <h4 className="text-[10px] font-mono text-amber-400 tracking-wider uppercase mb-3">Cross-Pollination</h4>
                  <p className="text-[11px] font-mono text-white/40 leading-relaxed">
                    The top 3 performing agents teach all underperforming agents simultaneously every evolution cycle. Every upgrade is broadcast to the entire mesh. {e?.agentEvolution.crossDomainTransfers || 0} cross-domain knowledge transfers completed so far.
                  </p>
                </div>
                <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-4">
                  <h4 className="text-[10px] font-mono text-emerald-400 tracking-wider uppercase mb-3">GitHub Remote Compute</h4>
                  <p className="text-[11px] font-mono text-white/40 leading-relaxed">
                    OMNIMENS extends its reach to GitHub Actions as a remote compute node. 5 workflow types (deep-research, code-synthesis, knowledge-harvest, stress-test, model-eval) sit idle until OMNIMENS dispatches them via API. Evolution data auto-syncs to the GitHub repository every 3 hours.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
