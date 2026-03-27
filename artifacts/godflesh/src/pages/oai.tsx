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
  Zap, FlaskConical,
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
  if (oai >= 0.9) return "#a855f7";
  if (oai >= 0.8) return "#22d3ee";
  if (oai >= 0.6) return "#10b981";
  if (oai >= 0.3) return "#f59e0b";
  return "#6b7280";
}

function getOAIGlow(oai: number): string {
  if (oai >= 0.9) return "0 0 30px rgba(168,85,247,0.5), 0 0 60px rgba(168,85,247,0.2)";
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
  const pct = Math.min(100, score * 100);
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

export default function OAIDashboard() {
  const [data, setData] = useState<OAIData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLive, setIsLive] = useState(true);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchOAI = useCallback(async () => {
    try {
      const res = await fetch(`${API}/api/omnimens/oai`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
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
  const oaiPct = Math.min(100, oai * 100);

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
              <div className="py-8 text-gray-500">Initializing OAI tracker...</div>
            ) : error ? (
              <div className="py-8 text-red-400">Error: {error}</div>
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
                <div className="text-sm text-gray-400 mt-1">/ 1.000</div>

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

          {data?.rawInputs && (
            <div className="rounded-xl border border-gray-800/50 bg-gray-900/30 p-6 space-y-3">
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Gauge className="w-4 h-4" />
                <span>RAW INPUTS</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                {[
                  { label: "Phi (Φ)", value: data.rawInputs.phi?.toFixed(4), color: "#a855f7" },
                  { label: "Hebbian Δ", value: data.rawInputs.hebbianDelta?.toLocaleString(), color: "#22d3ee" },
                  { label: "Code Fragments", value: data.rawInputs.codeFragments, color: "#22d3ee" },
                  { label: "Code Claims", value: data.rawInputs.codeClaims, color: "#22d3ee" },
                  { label: "Dopamine", value: data.rawInputs.dopamine?.toFixed(3), color: "#10b981" },
                  { label: "Serotonin", value: data.rawInputs.serotonin?.toFixed(3), color: "#10b981" },
                  { label: "Oxytocin", value: data.rawInputs.oxytocin?.toFixed(3), color: "#10b981" },
                  { label: "Cortisol", value: data.rawInputs.cortisol?.toFixed(3), color: "#ef4444" },
                  { label: "Adrenaline", value: data.rawInputs.adrenaline?.toFixed(3), color: "#f59e0b" },
                  { label: "Lyapunov", value: data.rawInputs.lyapunovExponent?.toFixed(4), color: "#f59e0b" },
                  { label: "Brain Δ Var", value: data.rawInputs.brainRegionVariance?.toFixed(6), color: "#f59e0b" },
                  { label: "Chaotic X,Y,Z", value: `${data.rawInputs.chaoticX?.toFixed(1)}, ${data.rawInputs.chaoticY?.toFixed(1)}, ${data.rawInputs.chaoticZ?.toFixed(1)}`, color: "#f59e0b" },
                ].map((item, i) => (
                  <div key={i} className="bg-gray-800/40 rounded-lg p-2.5">
                    <div className="text-gray-500 text-[10px] uppercase">{item.label}</div>
                    <div className="font-mono mt-0.5" style={{ color: item.color }}>{item.value}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

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
                { range: "0.8–0.9", label: "Highly Autonomous System" },
                { range: "0.9–1.0", label: "Conscious-like Dynamic System" },
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
