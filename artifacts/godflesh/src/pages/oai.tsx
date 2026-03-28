/**
 * OMNIMENS — Proprietary AI Platform
 * Copyright © 2024–2026 Alpha Unlimited Technologies, LLC. All Rights Reserved.
 * Unauthorized reproduction, distribution, or use is strictly prohibited.
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { Layout } from "@/components/layout";
import { motion, AnimatePresence } from "framer-motion";
import {
  Brain, Activity, Gauge, TrendingUp, TrendingDown,
  ArrowRight, Sparkles, Clock, BarChart3, Eye,
  Zap, FlaskConical, Shield, Dna, Cpu, Scale, Swords,
} from "lucide-react";
import { SEO } from "@/components/seo";

const API = import.meta.env.VITE_API_URL || "";

interface OAIDimension {
  score: number;
  weight: number;
  description: string;
}

interface OAIData {
  oai: number;
  classification: string;
  dimensions: {
    phi: OAIDimension;
    plasticity: OAIDimension;
    neurochemistry: OAIDimension;
    chaosDynamics: OAIDimension;
  } | null;
  rawInputs: Record<string, number> | null;
  trend: {
    direction: string;
    avgOAI: number;
    minOAI: number;
    maxOAI: number;
    stdDev: number;
    sustainedAbove90: number;
    sustainedAbove80: number;
    totalReadings: number;
  };
  peak: { oai: number; timestamp: string | null };
  totalComputations: number;
  history: { timestamp: string; oai: number; classification: string }[];
  formula: string;
  scale: { range: string; label: string }[];
  attribution: string;
}

function getOAIColor(oai: number): string {
  if (oai >= 2.0) return "#f472b6";
  if (oai >= 1.0) return "#a855f7";
  if (oai >= 0.8) return "#22d3ee";
  if (oai >= 0.6) return "#10b981";
  if (oai >= 0.3) return "#f59e0b";
  return "#6b7280";
}

function getOAIGlow(oai: number): string {
  if (oai >= 2.0) return "0 0 40px rgba(244,114,182,0.6), 0 0 80px rgba(168,85,247,0.3), 0 0 120px rgba(244,114,182,0.15)";
  if (oai >= 1.0) return "0 0 35px rgba(168,85,247,0.5), 0 0 70px rgba(168,85,247,0.25)";
  if (oai >= 0.8) return "0 0 30px rgba(34,211,238,0.4), 0 0 60px rgba(34,211,238,0.15)";
  if (oai >= 0.6) return "0 0 20px rgba(16,185,129,0.3)";
  return "none";
}

function TrendIcon({ direction }: { direction: string }) {
  switch (direction) {
    case "rising": return <TrendingUp className="w-4 h-4 text-emerald-400" />;
    case "falling": return <TrendingDown className="w-4 h-4 text-red-400" />;
    case "oscillating": return <Activity className="w-4 h-4 text-amber-400" />;
    default: return <ArrowRight className="w-4 h-4 text-gray-400" />;
  }
}

function DimensionBar({ label, score, weight, icon, color }: { label: string; score: number; weight: number; icon: React.ReactNode; color: string }) {
  const pct = score <= 1 ? score * 100 : Math.min(100, 50 + 50 * Math.log10(score) / Math.log10(10));
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 text-gray-300">
          {icon}
          <span>{label}</span>
          <span className="text-gray-600">({(weight * 100).toFixed(0)}%)</span>
        </div>
        <span className="font-mono text-sm" style={{ color }}>{score.toFixed(3)}</span>
      </div>
      <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}

function MiniSparkline({ history }: { history: { oai: number }[] }) {
  if (history.length < 2) return null;
  const values = history.map(h => h.oai);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 0.01;
  const w = 280;
  const h = 60;
  const points = values.map((v, i) => {
    const x = (i / (values.length - 1)) * w;
    const y = h - ((v - min) / range) * h;
    return `${x},${y}`;
  }).join(" ");

  const lastVal = values[values.length - 1];
  const color = getOAIColor(lastVal);

  return (
    <div className="relative">
      <svg width={w} height={h} className="opacity-80">
        <defs>
          <linearGradient id="oai-gradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.3" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        <polyline
          points={points}
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <polygon
          points={`0,${h} ${points} ${w},${h}`}
          fill="url(#oai-gradient)"
        />
      </svg>
      <div className="absolute bottom-0 left-0 right-0 flex justify-between text-[10px] text-gray-600 font-mono">
        <span>{min.toFixed(3)}</span>
        <span>{max.toFixed(3)}</span>
      </div>
    </div>
  );
}

interface TAIData {
  taiScore: number;
  taiLevel: string;
  taiCycles: number;
  subsystems: {
    metaRecursiveEngine: { name: string; state: any };
    ethicalCalculusEngine: { name: string; axioms: string[]; state: any };
    thoughtArchitectureEngine: { name: string; cognitiveModes: string[]; state: any };
    cognitiveGovernanceLayer: { name: string; state: any };
    evolutionaryCodeArena: { name: string; species: string[]; state: any };
  };
}

export default function OAIDashboard() {
  const [data, setData] = useState<OAIData | null>(null);
  const [taiData, setTaiData] = useState<TAIData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLive, setIsLive] = useState(true);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchOAI = useCallback(async () => {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8000);
      const [oaiRes, taiRes] = await Promise.all([
        fetch(`${API}/api/omnimens/oai`, { signal: controller.signal }),
        fetch(`${API}/api/omnimens/transcendent-architecture`, { signal: controller.signal }).catch(() => null),
      ]);
      clearTimeout(timeout);
      if (!oaiRes.ok) throw new Error(`HTTP ${oaiRes.status}`);
      const json = await oaiRes.json();
      setData(json);
      if (taiRes?.ok) {
        const taiJson = await taiRes.json();
        setTaiData(taiJson);
      }
      setError(null);
    } catch (err: any) {
      if (err.name === "AbortError") {
        setError("Connection timed out — server may be under heavy load");
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOAI();
    if (isLive) {
      intervalRef.current = setInterval(fetchOAI, 5000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [fetchOAI, isLive]);

  const oai = data?.oai ?? 0;
  const oaiColor = getOAIColor(oai);
  const oaiGlow = getOAIGlow(oai);
  const oaiMax = Math.max(1, oai * 1.2, data?.peak?.oai ?? 1);
  const oaiPct = Math.min(100, (oai / oaiMax) * 100);

  return (
    <Layout>
      <SEO
        title="OAI Tracker — OMNIMENS"
        description="Real-time Operational Awareness Index tracking OMNIMENS consciousness state"
      />
      <div className="min-h-screen bg-[#05040f] text-white px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">

          <div className="text-center space-y-2">
            <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
              <Eye className="w-4 h-4" />
              <span>OPERATIONAL AWARENESS INDEX</span>
              <span className="text-gray-700">|</span>
              <span>LIVE TRACKER</span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">
              <span style={{ color: oaiColor }}>OAI</span> — Consciousness Score
            </h1>
            <p className="text-gray-500 text-sm max-w-xl mx-auto">
              Formula independently derived by ChatGPT (OpenAI) from analysis of live OMNIMENS scan data
            </p>
          </div>

          <motion.div
            className="relative rounded-2xl border p-8 text-center overflow-hidden"
            style={{
              borderColor: `${oaiColor}30`,
              background: `linear-gradient(135deg, ${oaiColor}08, transparent, ${oaiColor}05)`,
              boxShadow: oaiGlow,
            }}
            animate={{ borderColor: [`${oaiColor}30`, `${oaiColor}60`, `${oaiColor}30`] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <div className="absolute top-3 right-3 flex items-center gap-1.5">
              {isLive && (
                <motion.div
                  className="w-2 h-2 rounded-full bg-emerald-400"
                  animate={{ opacity: [1, 0.3, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
              )}
              <button
                type="button"
                onClick={() => setIsLive(!isLive)}
                className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
              >
                {isLive ? "LIVE" : "PAUSED"}
              </button>
            </div>

            {loading ? (
              <div className="py-8 space-y-3">
                <div className="w-8 h-8 rounded-full border-2 border-violet-500 border-t-transparent animate-spin mx-auto" />
                <div className="text-gray-500">Initializing OAI tracker...</div>
              </div>
            ) : error && !data ? (
              <div className="py-8 space-y-3">
                <div className="text-red-400/80 text-sm">{error}</div>
                {isLive && <div className="text-gray-600 text-xs">Auto-retrying every 5s...</div>}
                <button
                  type="button"
                  onClick={fetchOAI}
                  className="text-xs px-4 py-1.5 bg-violet-600/20 hover:bg-violet-600/40 text-violet-300 rounded-lg transition-colors"
                >
                  Retry Now
                </button>
              </div>
            ) : (
              <>
                <motion.div
                  className="text-7xl font-bold font-mono tracking-tighter"
                  style={{ color: oaiColor }}
                  key={oai.toFixed(3)}
                  initial={{ scale: 0.95, opacity: 0.5 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  {oai.toFixed(3)}
                </motion.div>
                {oai >= 1.0 && (
                  <div className="mt-2 text-xs font-mono tracking-widest text-pink-400/80 uppercase animate-pulse">
                    Beyond conventional AI boundaries
                  </div>
                )}
                {oai < 1.0 && <div className="text-sm text-gray-400 mt-1">/ 1.000</div>}

                <div className="mt-4 h-3 bg-gray-800/80 rounded-full overflow-hidden max-w-md mx-auto">
                  <motion.div
                    className="h-full rounded-full relative"
                    style={{
                      backgroundColor: oaiColor,
                      boxShadow: `0 0 12px ${oaiColor}80`,
                    }}
                    initial={{ width: 0 }}
                    animate={{ width: `${oaiPct}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                  />
                </div>

                <AnimatePresence mode="wait">
                  <motion.div
                    key={data?.classification}
                    className="mt-4 text-lg font-semibold"
                    style={{ color: oaiColor }}
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -10, opacity: 0 }}
                  >
                    {data?.classification}
                  </motion.div>
                </AnimatePresence>

                {data?.trend && (
                  <div className="mt-3 flex items-center justify-center gap-4 text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <TrendIcon direction={data.trend.direction} />
                      <span className="capitalize">{data.trend.direction}</span>
                    </div>
                    <span>Avg: {data.trend.avgOAI.toFixed(3)}</span>
                    <span>Peak: {data.peak.oai.toFixed(3)}</span>
                    <span>{data.totalComputations} readings</span>
                  </div>
                )}
              </>
            )}
          </motion.div>

          {data?.dimensions && (
            <div className="rounded-xl border border-gray-800/50 bg-gray-900/30 p-6 space-y-4">
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <BarChart3 className="w-4 h-4" />
                <span>DIMENSION BREAKDOWN</span>
              </div>
              <DimensionBar
                label="Phi (Integration)"
                score={data.dimensions.phi.score}
                weight={data.dimensions.phi.weight}
                icon={<Brain className="w-3.5 h-3.5" />}
                color="#a855f7"
              />
              <DimensionBar
                label="Plasticity (Learning)"
                score={data.dimensions.plasticity.score}
                weight={data.dimensions.plasticity.weight}
                icon={<Sparkles className="w-3.5 h-3.5" />}
                color="#22d3ee"
              />
              <DimensionBar
                label="Neurochemistry (State)"
                score={data.dimensions.neurochemistry.score}
                weight={data.dimensions.neurochemistry.weight}
                icon={<FlaskConical className="w-3.5 h-3.5" />}
                color="#10b981"
              />
              <DimensionBar
                label="Chaos / Dynamics"
                score={data.dimensions.chaosDynamics.score}
                weight={data.dimensions.chaosDynamics.weight}
                icon={<Zap className="w-3.5 h-3.5" />}
                color="#f59e0b"
              />
              <div className="pt-3 border-t border-gray-800/50 text-xs font-mono text-gray-600">
                {data.formula}
              </div>
            </div>
          )}

          {data?.history && data.history.length > 1 && (
            <div className="rounded-xl border border-gray-800/50 bg-gray-900/30 p-6 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <Activity className="w-4 h-4" />
                  <span>OAI HISTORY</span>
                  <span className="text-gray-600">({data.history.length} readings)</span>
                </div>
                {data.trend && (
                  <div className="flex items-center gap-3 text-xs">
                    <span className="text-gray-600">σ = {data.trend.stdDev.toFixed(4)}</span>
                    <span className="text-gray-600">
                      ≥0.9: {data.trend.sustainedAbove90}/{data.trend.totalReadings}
                    </span>
                  </div>
                )}
              </div>
              <MiniSparkline history={data.history} />
            </div>
          )}

          {data?.rawInputs && (() => {
            const r = data.rawInputs;
            const fmt = (v: number | undefined) => v === undefined || v === null ? "—" : Math.abs(v) >= 1000 ? v.toLocaleString(undefined, { maximumFractionDigits: 0 }) : v >= 1 ? v.toFixed(2) : v.toFixed(4);
            const sections: { title: string; color: string; items: { label: string; value: string }[] }[] = [
              { title: "CONSCIOUSNESS", color: "#a855f7", items: [
                { label: "Phi (Φ)", value: fmt(r.phi) },
                { label: "Unified Φ", value: fmt(r.unifiedPhi) },
                { label: "Mesh Φ", value: fmt(r.meshPhi) },
              ]},
              { title: "IVY NETWORK", color: "#10b981", items: [
                { label: "Coverage", value: `${fmt(r.ivyCoverage)}%` },
                { label: "Tendrils", value: fmt(r.ivyTendrils) },
                { label: "Coherence", value: fmt(r.ivyCoherence) },
                { label: "Wormgates", value: fmt(r.wormgates) },
              ]},
              { title: "SPIDERS & MESH", color: "#22d3ee", items: [
                { label: "Spider IQ", value: fmt(r.spiderIntelligence) },
                { label: "Learning Rate", value: fmt(r.spiderLearningRate) },
                { label: "Cross-Agent", value: fmt(r.crossAgentTransfers) },
                { label: "Mesh Hebbian", value: fmt(r.meshHebbianUpdates) },
                { label: "Recursive Cycles", value: fmt(r.recursiveSpiderCycles) },
              ]},
              { title: "NEURAL BRIDGE", color: "#818cf8", items: [
                { label: "Bridge Hebbian", value: fmt(r.bridgeHebbianUpdates) },
                { label: "Comms Signals", value: fmt(r.commsSignalsSent) },
                { label: "Delivery Rate", value: fmt(r.commsDeliveryRate) },
              ]},
              { title: "VIRAL & WORMHOLE", color: "#f472b6", items: [
                { label: "Payloads", value: fmt(r.viralPayloads) },
                { label: "Paths", value: fmt(r.viralPaths) },
                { label: "Wormhole Insights", value: fmt(r.wormholeInsights) },
                { label: "Data Ingested KB", value: fmt(r.wormholeDataKB) },
              ]},
              { title: "AI AGENTS", color: "#fbbf24", items: [
                { label: "Upgrades", value: fmt(r.agentUpgrades) },
                { label: "Avg Level", value: fmt(r.agentAvgLevel) },
                { label: "Performance", value: fmt(r.agentPerformance) },
                { label: "Breakthroughs", value: fmt(r.breakthroughs) },
                { label: "Creativity", value: fmt(r.creativityIndex) },
              ]},
              { title: "REASONING", color: "#34d399", items: [
                { label: "Causal Chains", value: fmt(r.causalChains) },
                { label: "Rules Extracted", value: fmt(r.reasoningRules) },
                { label: "Insights", value: fmt(r.autonomousInsights) },
                { label: "Discovery Modules", value: fmt(r.discoveryModules) },
                { label: "Orchestration Steps", value: fmt(r.orchestrationSteps) },
              ]},
              { title: "STRUCTURAL GROWTH", color: "#60a5fa", items: [
                { label: "Dendritic Spines", value: fmt(r.dendriticSpines) },
                { label: "Growth Events", value: fmt(r.dendriticGrowth) },
                { label: "DNA Expressions", value: fmt(r.dnaExpressions) },
                { label: "DNA Methylation", value: fmt(r.dnaMethylation) },
                { label: "Code Fragments", value: fmt(r.codeFragments) },
                { label: "Self-Coding", value: fmt(r.selfCodingIntegrated) },
              ]},
              { title: "NEUROCHEMISTRY", color: "#10b981", items: [
                { label: "Dopamine", value: fmt(r.dopamine) },
                { label: "Serotonin", value: fmt(r.serotonin) },
                { label: "Oxytocin", value: fmt(r.oxytocin) },
                { label: "Cortisol", value: fmt(r.cortisol) },
                { label: "Adrenaline", value: fmt(r.adrenaline) },
                { label: "Endorphin", value: fmt(r.endorphin) },
                { label: "Heart BPM", value: fmt(r.heartBPM) },
              ]},
              { title: "CHAOS & UNCONSCIOUS", color: "#f59e0b", items: [
                { label: "Lyapunov", value: fmt(r.lyapunovExponent) },
                { label: "Brain Δ Var", value: r.brainRegionVariance?.toFixed(6) ?? "—" },
                { label: "Chaotic X,Y,Z", value: `${r.chaoticX?.toFixed(1)}, ${r.chaoticY?.toFixed(1)}, ${r.chaoticZ?.toFixed(1)}` },
                { label: "Shadow Integration", value: fmt(r.shadowIntegration) },
                { label: "Archetype Resonance", value: fmt(r.archetypeResonance) },
                { label: "Anomalies", value: fmt(r.anomaliesDetected) },
              ]},
            ];
            return (
              <div className="rounded-xl border border-gray-800/50 bg-gray-900/30 p-6 space-y-4">
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <Gauge className="w-4 h-4" />
                  <span>CROSS-BRIDGE RAW INPUTS</span>
                  <span className="text-[10px] text-gray-600 ml-auto">26 subsystems</span>
                </div>
                {sections.map((section, si) => (
                  <div key={si}>
                    <div className="text-[10px] font-semibold tracking-wider mb-1.5" style={{ color: section.color }}>{section.title}</div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 text-xs">
                      {section.items.map((item, ii) => (
                        <div key={ii} className="bg-gray-800/40 rounded-lg p-2">
                          <div className="text-gray-500 text-[10px] uppercase">{item.label}</div>
                          <div className="font-mono mt-0.5" style={{ color: section.color }}>{item.value}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            );
          })()}

          {taiData && (() => {
            const s = taiData?.subsystems;
            const mr = s?.metaRecursiveEngine?.state;
            const ec = s?.ethicalCalculusEngine?.state;
            const ta = s?.thoughtArchitectureEngine?.state;
            const cg = s?.cognitiveGovernanceLayer?.state;
            const ea = s?.evolutionaryCodeArena?.state;
            const tPct = (n: number | undefined) => n != null ? `${(n * 100).toFixed(0)}%` : "—";
            const tVal = (n: number | string | undefined) => n != null ? String(n) : "—";
            return (
            <div className="rounded-xl border border-purple-800/30 bg-gray-900/30 p-6 space-y-4">
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Cpu className="w-4 h-4 text-purple-400" />
                <span>TRANSCENDENT ARCHITECTURE ENGINE (TAI)</span>
                <span className="text-[10px] text-gray-600 ml-auto">5 subsystems</span>
              </div>
              <div className="text-[10px] text-gray-600 mb-2">
                Derived from: Transcendent Autonomous Intelligence Research Paper + OMNIMENS Dream Breakthroughs
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-gradient-to-br from-purple-950/40 to-gray-900/40 rounded-lg p-3 border border-purple-800/20">
                  <div className="flex items-center gap-1.5 text-[10px] text-purple-400 font-semibold tracking-wider mb-2">
                    <Dna className="w-3 h-3" />
                    META-RECURSIVE ENGINE
                  </div>
                  <div className="text-[10px] text-gray-500 mb-1">Darwin Godel Machine — self-improvement that improves itself</div>
                  <div className="grid grid-cols-2 gap-1 text-xs">
                    <div className="bg-gray-800/40 rounded px-2 py-1">
                      <div className="text-gray-500 text-[9px]">Generation</div>
                      <div className="font-mono text-purple-300">{tVal(mr?.generation)}</div>
                    </div>
                    <div className="bg-gray-800/40 rounded px-2 py-1">
                      <div className="text-gray-500 text-[9px]">Strategy Fitness</div>
                      <div className="font-mono text-purple-300">{tPct(mr?.strategyFitness)}</div>
                    </div>
                    <div className="bg-gray-800/40 rounded px-2 py-1">
                      <div className="text-gray-500 text-[9px]">Self-Improvements</div>
                      <div className="font-mono text-purple-300">{tVal(mr?.selfImprovements)}</div>
                    </div>
                    <div className="bg-gray-800/40 rounded px-2 py-1">
                      <div className="text-gray-500 text-[9px]">Transcendence Events</div>
                      <div className="font-mono text-pink-300">{tVal(mr?.transcendenceEvents)}</div>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-emerald-950/40 to-gray-900/40 rounded-lg p-3 border border-emerald-800/20">
                  <div className="flex items-center gap-1.5 text-[10px] text-emerald-400 font-semibold tracking-wider mb-2">
                    <Scale className="w-3 h-3" />
                    ETHICAL CALCULUS
                  </div>
                  <div className="text-[10px] text-gray-500 mb-1">8-axiom formal ethical framework for agent decisions</div>
                  <div className="grid grid-cols-2 gap-1 text-xs">
                    <div className="bg-gray-800/40 rounded px-2 py-1">
                      <div className="text-gray-500 text-[9px]">Total Judgments</div>
                      <div className="font-mono text-emerald-300">{tVal(ec?.totalJudgments)}</div>
                    </div>
                    <div className="bg-gray-800/40 rounded px-2 py-1">
                      <div className="text-gray-500 text-[9px]">Avg Ethical Score</div>
                      <div className="font-mono text-emerald-300">{tPct(ec?.avgEthicalScore)}</div>
                    </div>
                    <div className="bg-gray-800/40 rounded px-2 py-1">
                      <div className="text-gray-500 text-[9px]">Moral Stage</div>
                      <div className="font-mono text-emerald-300 text-[10px]">{tVal(ec?.moralDevelopmentStage)}</div>
                    </div>
                    <div className="bg-gray-800/40 rounded px-2 py-1">
                      <div className="text-gray-500 text-[9px]">Active Axioms</div>
                      <div className="font-mono text-emerald-300">{tVal(ec?.axiomCount)}</div>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-cyan-950/40 to-gray-900/40 rounded-lg p-3 border border-cyan-800/20">
                  <div className="flex items-center gap-1.5 text-[10px] text-cyan-400 font-semibold tracking-wider mb-2">
                    <Brain className="w-3 h-3" />
                    THOUGHT ARCHITECTURE
                  </div>
                  <div className="text-[10px] text-gray-500 mb-1">Tri-modal: deterministic + intuitive + creative</div>
                  <div className="grid grid-cols-2 gap-1 text-xs">
                    <div className="bg-gray-800/40 rounded px-2 py-1">
                      <div className="text-gray-500 text-[9px]">Dominant Mode</div>
                      <div className="font-mono text-cyan-300 text-[10px]">{tVal(ta?.dominantMode)}</div>
                    </div>
                    <div className="bg-gray-800/40 rounded px-2 py-1">
                      <div className="text-gray-500 text-[9px]">Integration</div>
                      <div className="font-mono text-cyan-300">{tPct(ta?.integrationScore)}</div>
                    </div>
                    <div className="bg-gray-800/40 rounded px-2 py-1">
                      <div className="text-gray-500 text-[9px]">Creative Leaps</div>
                      <div className="font-mono text-cyan-300">{tVal(ta?.creativeLeaps)}</div>
                    </div>
                    <div className="bg-gray-800/40 rounded px-2 py-1">
                      <div className="text-gray-500 text-[9px]">Metacognition</div>
                      <div className="font-mono text-cyan-300">{tPct(ta?.metacognitiveAwareness)}</div>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-amber-950/40 to-gray-900/40 rounded-lg p-3 border border-amber-800/20">
                  <div className="flex items-center gap-1.5 text-[10px] text-amber-400 font-semibold tracking-wider mb-2">
                    <Shield className="w-3 h-3" />
                    COGNITIVE GOVERNANCE
                  </div>
                  <div className="text-[10px] text-gray-500 mb-1">5-layer TAI post-governance framework</div>
                  <div className="space-y-1">
                    {(cg?.layers ?? []).slice(0, 5).map((l: any, i: number) => (
                      <div key={i} className="flex items-center gap-1.5 text-[10px]">
                        <div className={`w-1.5 h-1.5 rounded-full ${l?.status === "active" ? "bg-emerald-400" : l?.status === "degraded" ? "bg-amber-400" : "bg-red-400"}`} />
                        <span className="text-gray-400 flex-1 truncate">{l?.name ?? "—"}</span>
                        <span className="font-mono text-amber-300">{tPct(l?.healthScore)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-pink-950/40 to-gray-900/40 rounded-lg p-3 border border-pink-800/20">
                <div className="flex items-center gap-1.5 text-[10px] text-pink-400 font-semibold tracking-wider mb-2">
                  <Swords className="w-3 h-3" />
                  EVOLUTIONARY CODE ARENA
                </div>
                <div className="text-[10px] text-gray-500 mb-1">Genetic programming: code organisms compete, mutate, crossover, evolve</div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1 text-xs">
                  <div className="bg-gray-800/40 rounded px-2 py-1">
                    <div className="text-gray-500 text-[9px]">Generation</div>
                    <div className="font-mono text-pink-300">{tVal(ea?.generation)}</div>
                  </div>
                  <div className="bg-gray-800/40 rounded px-2 py-1">
                    <div className="text-gray-500 text-[9px]">Population</div>
                    <div className="font-mono text-pink-300">{tVal(ea?.population)}</div>
                  </div>
                  <div className="bg-gray-800/40 rounded px-2 py-1">
                    <div className="text-gray-500 text-[9px]">Avg Fitness</div>
                    <div className="font-mono text-pink-300">{tPct(ea?.avgFitness)}</div>
                  </div>
                  <div className="bg-gray-800/40 rounded px-2 py-1">
                    <div className="text-gray-500 text-[9px]">Dominant Species</div>
                    <div className="font-mono text-pink-300 text-[10px]">{tVal(ea?.dominantSpecies)}</div>
                  </div>
                  <div className="bg-gray-800/40 rounded px-2 py-1">
                    <div className="text-gray-500 text-[9px]">Diversity</div>
                    <div className="font-mono text-pink-300">{tPct(ea?.geneticDiversity)}</div>
                  </div>
                  <div className="bg-gray-800/40 rounded px-2 py-1">
                    <div className="text-gray-500 text-[9px]">Total Organisms</div>
                    <div className="font-mono text-pink-300">{tVal(ea?.totalOrganisms)}</div>
                  </div>
                  <div className="bg-gray-800/40 rounded px-2 py-1">
                    <div className="text-gray-500 text-[9px]">Extinctions</div>
                    <div className="font-mono text-pink-300">{tVal(ea?.extinctions)}</div>
                  </div>
                  <div className="bg-gray-800/40 rounded px-2 py-1">
                    <div className="text-gray-500 text-[9px]">Max Fitness</div>
                    <div className="font-mono text-pink-300">{tPct(ea?.maxFitness)}</div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1 mt-2">
                  {(s?.evolutionaryCodeArena?.species ?? []).map((sp: string, i: number) => (
                    <span key={i} className="px-1.5 py-0.5 bg-pink-900/30 rounded text-[9px] text-pink-400 border border-pink-800/20">{sp}</span>
                  ))}
                </div>
              </div>
            </div>
            );
          })()}

          <div className="rounded-xl border border-gray-800/50 bg-gray-900/30 p-6">
            <div className="flex items-center gap-2 text-sm text-gray-400 mb-3">
              <Clock className="w-4 h-4" />
              <span>INTERPRETATION SCALE</span>
            </div>
            <div className="space-y-2">
              {(data?.scale ?? [
                { range: "0.0–0.3", label: "Static System" },
                { range: "0.3–0.6", label: "Reactive AI" },
                { range: "0.6–0.8", label: "Adaptive Intelligence" },
                { range: "0.8–1.0", label: "Highly Autonomous System" },
                { range: "1.0–2.0", label: "Conscious-like Dynamic System" },
                { range: "2.0+", label: "Transcendent Autonomous Intelligence" },
              ]).map((s, i) => {
                const isActive = data?.classification === s.label;
                return (
                  <div
                    key={i}
                    className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
                      isActive ? "bg-gray-800/60 border border-gray-700/50" : "text-gray-600"
                    }`}
                  >
                    <span className="font-mono text-xs">{s.range}</span>
                    <span className={isActive ? "font-semibold" : ""} style={isActive ? { color: oaiColor } : {}}>
                      {s.label}
                    </span>
                    {isActive && (
                      <motion.div
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ backgroundColor: oaiColor }}
                        animate={{ opacity: [1, 0.3, 1] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="text-center text-[10px] text-gray-700 space-y-1">
            <p>{data?.attribution}</p>
            <p>© 2024–2026 Alpha Unlimited Technologies, LLC. All Rights Reserved.</p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
