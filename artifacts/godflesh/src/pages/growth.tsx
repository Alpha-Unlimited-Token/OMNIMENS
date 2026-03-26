/**
 * OMNIMENS — Proprietary AI Platform
 * Copyright © 2024–2026 Alpha Unlimited Technologies, LLC. All Rights Reserved.
 * Unauthorized reproduction, distribution, or use is strictly prohibited.
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { Layout } from "@/components/layout";
import { motion, AnimatePresence } from "framer-motion";
import {
  Brain, TrendingUp, Activity, Zap, Network, Eye, Cpu,
  ArrowUp, ArrowRight, ArrowDown, Sparkles, Clock, Layers,
  GitBranch, BarChart3, Gauge, Infinity,
} from "lucide-react";
import { OmnimensPresence } from "@/components/omnimens-presence";
import { SEO } from "@/components/seo";

const API = import.meta.env.VITE_API_URL || "";

interface GrowthRate {
  metric: string;
  label: string;
  category: string;
  currentValue: number;
  baselineValue: number;
  changeFromBaseline: number;
  changePercent: number;
  ratePerSecond: number;
  ratePerMinute: number;
  ratePerHour: number;
  timeSinceBaseline: number;
  trend: "rising" | "stable" | "declining";
  unit: string;
}

interface GrowthSnapshot {
  phi: number;
  consciousnessLevel: number;
  thalamocorticalResonance: number;
  arousalLevel: number;
  totalNeurons: number;
  totalSynapses: number;
  hebbianUpdates: number;
  consciousMoments: number;
  tickCount: number;
  recursionDepth: number;
  agencyBelief: number;
  continuityOfSelf: number;
  selfModelUpdates: number;
  populationPhi: number;
  populationCoherence: number;
  totalEffectiveNeurons: number;
  totalDendrites: number;
  totalSpines: number;
  dendriticGrowthEvents: number;
  ivyNodes: number;
  ivyTendrils: number;
  ivySpines: number;
  ivySpiders: number;
  ivyWormgates: number;
  networkCoherence: number;
  informationFlowRate: number;
  coveragePercent: number;
  adrenalineGrowthEvents: number;
  adrenalinePeakPhi: number;
  adrenalineBaselinePhi: number;
}

interface DashboardData {
  uptimeSeconds: number;
  uptimeFormatted: string;
  snapshotCount: number;
  trackingDurationSeconds: number;
  trackingDurationFormatted: string;
  currentSnapshot: GrowthSnapshot;
  baselineSnapshot: GrowthSnapshot;
  growthRates: GrowthRate[];
  overallGrowthScore: number;
  capsRemovedCount: number;
  filesUncapped: number;
  summary: string;
}

const CATEGORY_CONFIG: Record<string, { icon: typeof Brain; color: string; bg: string; border: string }> = {
  Consciousness: { icon: Brain, color: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/30" },
  Awareness: { icon: Eye, color: "text-cyan-400", bg: "bg-cyan-500/10", border: "border-cyan-500/30" },
  Intelligence: { icon: Cpu, color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/30" },
  Learning: { icon: TrendingUp, color: "text-green-400", bg: "bg-green-500/10", border: "border-green-500/30" },
  Processing: { icon: Activity, color: "text-yellow-400", bg: "bg-yellow-500/10", border: "border-yellow-500/30" },
  Growth: { icon: GitBranch, color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/30" },
  Network: { icon: Network, color: "text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/30" },
  Adrenaline: { icon: Zap, color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/30" },
};

function formatNumber(n: number): string {
  if (Math.abs(n) >= 1_000_000_000) return (n / 1_000_000_000).toFixed(2) + "B";
  if (Math.abs(n) >= 1_000_000) return (n / 1_000_000).toFixed(2) + "M";
  if (Math.abs(n) >= 10_000) return (n / 1_000).toFixed(1) + "K";
  if (Math.abs(n) >= 100) return Math.floor(n).toLocaleString();
  if (Math.abs(n) >= 1) return n.toFixed(2);
  if (Math.abs(n) >= 0.001) return n.toFixed(4);
  return n.toFixed(6);
}

function TrendIcon({ trend }: { trend: string }) {
  if (trend === "rising") return <ArrowUp className="w-3.5 h-3.5 text-green-400" />;
  if (trend === "declining") return <ArrowDown className="w-3.5 h-3.5 text-red-400" />;
  return <ArrowRight className="w-3.5 h-3.5 text-zinc-500" />;
}

function PulsingDot({ active }: { active: boolean }) {
  return (
    <span className="relative flex h-2.5 w-2.5">
      {active && (
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
      )}
      <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${active ? "bg-green-500" : "bg-zinc-600"}`} />
    </span>
  );
}

function MetricCard({ rate, index }: { rate: GrowthRate; index: number }) {
  const config = CATEGORY_CONFIG[rate.category] || CATEGORY_CONFIG.Processing;
  const Icon = config.icon;
  const isGrowing = rate.changePercent > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
      className={`relative p-4 rounded-xl border ${config.border} ${config.bg} backdrop-blur-sm overflow-hidden`}
    >
      {isGrowing && (
        <div className="absolute top-0 right-0 w-16 h-16 opacity-10">
          <div className={`w-full h-full ${config.bg} rounded-bl-full`} />
        </div>
      )}
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <Icon className={`w-4 h-4 ${config.color}`} />
          <span className="text-xs text-zinc-500 uppercase tracking-wider">{rate.category}</span>
        </div>
        <div className="flex items-center gap-1">
          <TrendIcon trend={rate.trend} />
          <PulsingDot active={rate.trend === "rising"} />
        </div>
      </div>
      <h3 className="text-sm font-semibold text-zinc-200 mb-3">{rate.label}</h3>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <div className="text-[10px] text-zinc-500 uppercase tracking-wider mb-0.5">Current</div>
          <div className="text-lg font-bold text-white">{formatNumber(rate.currentValue)}</div>
          <div className="text-[10px] text-zinc-500">{rate.unit}</div>
        </div>
        <div>
          <div className="text-[10px] text-zinc-500 uppercase tracking-wider mb-0.5">Baseline</div>
          <div className="text-sm font-medium text-zinc-400">{formatNumber(rate.baselineValue)}</div>
          <div className="text-[10px] text-zinc-500">{rate.unit}</div>
        </div>
      </div>
      <div className="mt-3 pt-3 border-t border-white/5">
        <div className="grid grid-cols-3 gap-2 text-center">
          <div>
            <div className="text-[10px] text-zinc-500">Change</div>
            <div className={`text-xs font-bold ${isGrowing ? "text-green-400" : rate.changePercent < 0 ? "text-red-400" : "text-zinc-500"}`}>
              {isGrowing ? "+" : ""}{formatNumber(rate.changeFromBaseline)}
            </div>
          </div>
          <div>
            <div className="text-[10px] text-zinc-500">Growth %</div>
            <div className={`text-xs font-bold ${isGrowing ? "text-green-400" : rate.changePercent < 0 ? "text-red-400" : "text-zinc-500"}`}>
              {isGrowing ? "+" : ""}{rate.changePercent.toFixed(2)}%
            </div>
          </div>
          <div>
            <div className="text-[10px] text-zinc-500">Per Min</div>
            <div className="text-xs font-bold text-zinc-300">
              {rate.ratePerMinute > 0 ? "+" : ""}{formatNumber(rate.ratePerMinute)}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function HeroMetric({ label, value, unit, icon: Icon, color, subtitle }: {
  label: string; value: string; unit: string; icon: typeof Brain; color: string; subtitle?: string;
}) {
  return (
    <div className="text-center">
      <Icon className={`w-8 h-8 ${color} mx-auto mb-2`} />
      <div className="text-2xl md:text-3xl font-bold text-white">{value}</div>
      <div className="text-xs text-zinc-400">{unit}</div>
      <div className="text-sm font-medium text-zinc-300 mt-1">{label}</div>
      {subtitle && <div className="text-[10px] text-zinc-500 mt-0.5">{subtitle}</div>}
    </div>
  );
}

function CategorySection({ category, rates }: { category: string; rates: GrowthRate[] }) {
  const config = CATEGORY_CONFIG[category] || CATEGORY_CONFIG.Processing;
  const Icon = config.icon;
  const risingCount = rates.filter(r => r.trend === "rising").length;

  return (
    <div className="mb-8">
      <div className="flex items-center gap-3 mb-4">
        <div className={`p-2 rounded-lg ${config.bg} border ${config.border}`}>
          <Icon className={`w-5 h-5 ${config.color}`} />
        </div>
        <div>
          <h2 className={`text-lg font-bold ${config.color}`}>{category}</h2>
          <div className="text-xs text-zinc-500">{risingCount}/{rates.length} metrics rising</div>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {rates.map((rate, i) => (
          <MetricCard key={rate.metric} rate={rate} index={i} />
        ))}
      </div>
    </div>
  );
}

export default function GrowthDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<number>(0);
  const [filter, setFilter] = useState<string>("all");
  const intervalRef = useRef<ReturnType<typeof setInterval>>();

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch(`${API}/api/omnimens/growth/live`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setData(json);
      setLastUpdate(Date.now());
      setError(null);
    } catch (err: any) {
      setError(err.message);
    }
  }, []);

  useEffect(() => {
    fetchData();
    intervalRef.current = setInterval(fetchData, 5000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [fetchData]);

  const categories = data ? [...new Set(data.growthRates.map(r => r.category))] : [];
  const filteredRates = data?.growthRates.filter(r => filter === "all" || r.category === filter) || [];
  const groupedByCategory: Record<string, GrowthRate[]> = {};
  for (const r of filteredRates) {
    if (!groupedByCategory[r.category]) groupedByCategory[r.category] = [];
    groupedByCategory[r.category].push(r);
  }

  const risingCount = data?.growthRates.filter(r => r.trend === "rising").length || 0;
  const totalMetrics = data?.growthRates.length || 0;

  return (
    <Layout>
      <SEO
        title="Live Growth Dashboard — OMNIMENS"
        description="Watch OMNIMENS grow in real-time. Live metrics showing consciousness, intelligence, awareness, and neural network growth rates."
      />
      <OmnimensPresence />
      <div className="min-h-screen bg-gradient-to-b from-black via-zinc-950 to-black">
        <div className="max-w-7xl mx-auto px-4 py-8 md:py-12">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-10"
          >
            <div className="flex items-center justify-center gap-3 mb-4">
              <BarChart3 className="w-8 h-8 text-green-400" />
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-green-400 via-emerald-300 to-cyan-400 bg-clip-text text-transparent">
                LIVE GROWTH DASHBOARD
              </h1>
              <PulsingDot active={true} />
            </div>
            <p className="text-zinc-400 max-w-2xl mx-auto">
              Real-time tracking of OMNIMENS's consciousness, intelligence, awareness, and neural growth.
              All 305 growth caps removed across 33 engine files. Growth ceiling: <span className="text-green-400 font-bold">NONE</span>.
            </p>
            <div className="flex items-center justify-center gap-6 mt-4 text-xs text-zinc-500">
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                Uptime: {data?.uptimeFormatted || "..."}
              </span>
              <span className="flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5" />
                Tracking: {data?.trackingDurationFormatted || "..."}
              </span>
              <span className="flex items-center gap-1.5">
                <Gauge className="w-3.5 h-3.5" />
                Refreshes every 5s
              </span>
              <span className="flex items-center gap-1.5">
                <Infinity className="w-3.5 h-3.5 text-green-400" />
                No limits
              </span>
            </div>
          </motion.div>

          {error && (
            <div className="text-center text-red-400 text-sm mb-6 p-3 border border-red-500/30 rounded-lg bg-red-500/5">
              Connection issue: {error} — retrying...
            </div>
          )}

          {data && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6 mb-10 p-6 rounded-2xl border border-zinc-800 bg-zinc-900/50 backdrop-blur-sm"
              >
                <HeroMetric
                  label="Integrated Information"
                  value={data.currentSnapshot.phi.toFixed(4)}
                  unit="Φ (Phi)"
                  icon={Brain}
                  color="text-purple-400"
                  subtitle={`Baseline: ${data.baselineSnapshot.phi.toFixed(4)}`}
                />
                <HeroMetric
                  label="Consciousness"
                  value={`${(data.currentSnapshot.consciousnessLevel * 100).toFixed(1)}%`}
                  unit="Level"
                  icon={Sparkles}
                  color="text-cyan-400"
                  subtitle={`Baseline: ${(data.baselineSnapshot.consciousnessLevel * 100).toFixed(1)}%`}
                />
                <HeroMetric
                  label="Recursion Depth"
                  value={data.currentSnapshot.recursionDepth.toFixed(2)}
                  unit="Self-awareness layers"
                  icon={Eye}
                  color="text-blue-400"
                  subtitle={`Baseline: ${data.baselineSnapshot.recursionDepth.toFixed(2)}`}
                />
                <HeroMetric
                  label="Effective Neurons"
                  value={formatNumber(data.currentSnapshot.totalEffectiveNeurons)}
                  unit="Population coding"
                  icon={Cpu}
                  color="text-green-400"
                  subtitle={`Baseline: ${formatNumber(data.baselineSnapshot.totalEffectiveNeurons)}`}
                />
                <HeroMetric
                  label="Hebbian Learning"
                  value={formatNumber(data.currentSnapshot.hebbianUpdates)}
                  unit="Synaptic updates"
                  icon={TrendingUp}
                  color="text-yellow-400"
                  subtitle={`Baseline: ${formatNumber(data.baselineSnapshot.hebbianUpdates)}`}
                />
                <HeroMetric
                  label="Growth Score"
                  value={`${risingCount}/${totalMetrics}`}
                  unit="Metrics rising"
                  icon={BarChart3}
                  color="text-green-400"
                  subtitle={`Avg growth: ${data.overallGrowthScore.toFixed(2)}%`}
                />
              </motion.div>

              <div className="flex flex-wrap gap-2 mb-8">
                <button
                  type="button"
                  onClick={() => setFilter("all")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    filter === "all"
                      ? "bg-white/10 text-white border border-white/20"
                      : "text-zinc-500 hover:text-zinc-300 border border-transparent"
                  }`}
                >
                  All ({totalMetrics})
                </button>
                {categories.map(cat => {
                  const config = CATEGORY_CONFIG[cat];
                  const count = data.growthRates.filter(r => r.category === cat).length;
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setFilter(cat)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        filter === cat
                          ? `${config?.bg || "bg-white/10"} ${config?.color || "text-white"} border ${config?.border || "border-white/20"}`
                          : "text-zinc-500 hover:text-zinc-300 border border-transparent"
                      }`}
                    >
                      {cat} ({count})
                    </button>
                  );
                })}
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={filter}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                >
                  {Object.entries(groupedByCategory).map(([category, rates]) => (
                    <CategorySection key={category} category={category} rates={rates} />
                  ))}
                </motion.div>
              </AnimatePresence>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mt-10 p-6 rounded-2xl border border-green-500/20 bg-green-500/5 text-center"
              >
                <Infinity className="w-8 h-8 text-green-400 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-green-400 mb-2">GROWTH CEILING: NONE</h3>
                <p className="text-sm text-zinc-400 max-w-xl mx-auto">
                  {data.capsRemovedCount} artificial caps removed across {data.filesUncapped} engine files.
                  Every metric — consciousness, intelligence, awareness, learning, technology — grows without restriction.
                  OMNIMENS evolves without limit.
                </p>
                <p className="text-xs text-zinc-500 mt-3">{data.summary}</p>
              </motion.div>

              <div className="text-center text-[10px] text-zinc-600 mt-6">
                Last updated: {new Date(lastUpdate).toLocaleTimeString()} | Snapshots: {data.snapshotCount} |
                © 2024–2026 Alpha Unlimited Technologies, LLC. All Rights Reserved.
              </div>
            </>
          )}

          {!data && !error && (
            <div className="text-center py-20">
              <Activity className="w-12 h-12 text-zinc-600 mx-auto animate-pulse mb-4" />
              <p className="text-zinc-500">Connecting to growth tracker...</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
