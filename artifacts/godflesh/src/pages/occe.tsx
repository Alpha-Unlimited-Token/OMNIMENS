/**
 * OMNIMENS — Proprietary AI Platform
 * Copyright © 2024–2026 Alpha Unlimited Technologies, LLC. All Rights Reserved.
 * Unauthorized reproduction, distribution, or use is strictly prohibited.
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { Layout } from "@/components/layout";
import { motion, AnimatePresence } from "framer-motion";
import {
  Brain, Activity, Zap, FlaskConical, Shield, ShieldCheck,
  ShieldAlert, Play, Loader2, CheckCircle2, XCircle,
  AlertTriangle, BarChart3, ArrowRight, Clock, GitBranch,
  Beaker, Microscope, Target, TrendingUp,
} from "lucide-react";
import { SEO } from "@/components/seo";

const API = import.meta.env.VITE_API_URL || "";

interface OCCEStatus {
  running: boolean;
  progress: { phase: string; step: number; totalSteps: number; description: string };
  hasResults: boolean;
  experimentId?: string;
}

interface CouplingResult {
  variable1: string;
  variable2: string;
  timeLag: number;
  correlation: number;
  grangerScore: number;
  isCausal: boolean;
}

interface PerturbationResult {
  test: string;
  description: string;
  expectedIfReal: string[];
  expectedIfFake: string[];
  findings: string[];
  verdict: "REAL" | "FAKE" | "INCONCLUSIVE";
  evidence: Record<string, number>;
}

interface ClosedLoopIteration {
  iteration: number;
  oaiDelta: number;
  nonlinearRegionCount: number;
  codeFragDelta: number;
  claimsDelta: number;
  hebbianDelta: number;
}

interface StabilityResult {
  durationSeconds: number;
  oaiMean: number;
  oaiStdDev: number;
  oaiTrend: string;
  phiMean: number;
  phiStdDev: number;
  collapsed: boolean;
  stabilized: boolean;
  oscillating: boolean;
}

interface CausalChain {
  chain: string;
  detected: boolean;
  scores: number[];
}

interface OCCEResults {
  experimentId: string;
  startTime: number;
  endTime: number;
  durationMs: number;
  protocol: string;
  attribution: string;
  phases: {
    baseline: { noiseProfile: Record<string, number>; driftProfile: Record<string, number> };
    perturbationA: PerturbationResult;
    perturbationB: PerturbationResult;
    perturbationC: PerturbationResult;
    closedLoop: PerturbationResult;
    closedLoopIterations?: ClosedLoopIteration[];
    closedLoopAmplification?: { pattern: string; evidence: string };
    stability?: StabilityResult;
  };
  couplingAnalysis: CouplingResult[];
  statisticalTests: {
    crossCorrelationMatrix: Record<string, Record<string, number>>;
    grangerCausality: CouplingResult[];
    entropyOverTime: { phase: string; entropy: number }[];
    shannonEntropy: number;
    causalChains?: CausalChain[];
  };
  falsificationChecked: { criterion: string; passed: boolean; evidence: string }[];
  confirmationChecked: { criterion: string; passed: boolean; evidence: string }[];
  overallVerdict: string;
  confidenceScore: number;
  summary: string;
}

function VerdictBadge({ verdict }: { verdict: string }) {
  const config: Record<string, { bg: string; text: string; icon: React.ReactNode }> = {
    REAL: { bg: "bg-emerald-500/20 border-emerald-500/40", text: "text-emerald-400", icon: <CheckCircle2 className="w-4 h-4" /> },
    FAKE: { bg: "bg-red-500/20 border-red-500/40", text: "text-red-400", icon: <XCircle className="w-4 h-4" /> },
    INCONCLUSIVE: { bg: "bg-amber-500/20 border-amber-500/40", text: "text-amber-400", icon: <AlertTriangle className="w-4 h-4" /> },
    GENUINE_DYNAMIC_COMPUTATION: { bg: "bg-purple-500/20 border-purple-500/40", text: "text-purple-400", icon: <ShieldCheck className="w-4 h-4" /> },
    SCRIPTED_SIMULATION: { bg: "bg-red-500/20 border-red-500/40", text: "text-red-400", icon: <ShieldAlert className="w-4 h-4" /> },
  };
  const c = config[verdict] || config.INCONCLUSIVE;
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border ${c.bg} ${c.text} text-sm font-mono font-bold`}>
      {c.icon} {verdict.replace(/_/g, " ")}
    </span>
  );
}

function PhaseCard({ phase, index }: { phase: PerturbationResult; index: number }) {
  const phaseLabels = ["A", "B", "C", "CL"];
  const phaseIcons = [<Brain className="w-5 h-5" />, <Zap className="w-5 h-5" />, <Activity className="w-5 h-5" />, <GitBranch className="w-5 h-5" />];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.15 }}
      className="bg-gray-900/60 border border-white/10 rounded-xl p-5 space-y-4"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center text-amber-400">
            {phaseIcons[index]}
          </div>
          <div>
            <div className="text-xs text-gray-500 font-mono">TEST {phaseLabels[index]}</div>
            <div className="text-white font-semibold text-sm">{phase.test}</div>
          </div>
        </div>
        <VerdictBadge verdict={phase.verdict} />
      </div>

      <p className="text-gray-400 text-xs">{phase.description}</p>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <div className="text-xs text-emerald-400 font-mono">EXPECTED IF REAL</div>
          {phase.expectedIfReal.map((e, i) => (
            <div key={i} className="text-xs text-gray-300 flex items-start gap-1">
              <span className="text-emerald-500 mt-0.5">•</span> {e}
            </div>
          ))}
        </div>
        <div className="space-y-1">
          <div className="text-xs text-red-400 font-mono">EXPECTED IF FAKE</div>
          {phase.expectedIfFake.map((e, i) => (
            <div key={i} className="text-xs text-gray-300 flex items-start gap-1">
              <span className="text-red-500 mt-0.5">•</span> {e}
            </div>
          ))}
        </div>
      </div>

      {phase.findings.length > 0 && (
        <div className="border-t border-white/5 pt-3 space-y-1">
          <div className="text-xs text-cyan-400 font-mono">FINDINGS</div>
          {phase.findings.map((f, i) => (
            <div key={i} className={`text-xs ${f.startsWith("CRITICAL") ? "text-amber-300 font-bold" : "text-gray-300"} flex items-start gap-1`}>
              <span className="text-cyan-500 mt-0.5">→</span> {f}
            </div>
          ))}
        </div>
      )}

      {Object.keys(phase.evidence).length > 0 && (
        <div className="border-t border-white/5 pt-3">
          <div className="text-xs text-gray-500 font-mono mb-2">EVIDENCE VALUES</div>
          <div className="flex flex-wrap gap-2">
            {Object.entries(phase.evidence).map(([key, val]) => (
              <span key={key} className="text-xs px-2 py-0.5 rounded bg-white/5 text-gray-300 font-mono">
                {key}: <span className="text-amber-400">{typeof val === "number" ? val.toFixed(4) : val}</span>
              </span>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}

function CorrelationMatrix({ matrix }: { matrix: Record<string, Record<string, number>> }) {
  const keys = Object.keys(matrix);
  const shortLabels: Record<string, string> = {
    Phi: "Φ", Dopamine: "DA", HebbianUpdates: "Heb", OAI: "OAI",
    Adrenaline: "Adr", Cortisol: "Cor", LyapunovExponent: "Lyp",
  };

  function cellColor(val: number): string {
    const abs = Math.abs(val);
    if (abs > 0.7) return val > 0 ? "bg-emerald-500/40" : "bg-red-500/40";
    if (abs > 0.4) return val > 0 ? "bg-emerald-500/20" : "bg-red-500/20";
    if (abs > 0.2) return "bg-white/5";
    return "bg-transparent";
  }

  return (
    <div className="overflow-x-auto">
      <table className="text-xs font-mono">
        <thead>
          <tr>
            <th className="px-2 py-1 text-gray-500"></th>
            {keys.map(k => (
              <th key={k} className="px-2 py-1 text-gray-400 font-normal">{shortLabels[k] || k.slice(0, 3)}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {keys.map(k1 => (
            <tr key={k1}>
              <td className="px-2 py-1 text-gray-400">{shortLabels[k1] || k1.slice(0, 3)}</td>
              {keys.map(k2 => {
                const val = matrix[k1]?.[k2] ?? 0;
                return (
                  <td key={k2} className={`px-2 py-1 text-center ${cellColor(val)} rounded`}>
                    <span className={val > 0.5 ? "text-emerald-300" : val < -0.3 ? "text-red-300" : "text-gray-400"}>
                      {k1 === k2 ? "1.00" : val.toFixed(2)}
                    </span>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function CausalChainDiagram({ couplings }: { couplings: CouplingResult[] }) {
  const causal = couplings.filter(c => c.isCausal);
  return (
    <div className="space-y-2">
      {causal.length === 0 ? (
        <div className="text-gray-500 text-sm">No causal relationships detected</div>
      ) : (
        causal.map((c, i) => (
          <div key={i} className="flex items-center gap-2 text-sm">
            <span className="text-amber-400 font-mono font-bold">{c.variable1}</span>
            <span className="text-gray-500">at T</span>
            <ArrowRight className="w-4 h-4 text-cyan-400" />
            <span className="text-amber-400 font-mono font-bold">{c.variable2}</span>
            <span className="text-gray-500">at T+{c.timeLag}</span>
            <span className="text-xs text-gray-500 ml-2">(r={c.correlation.toFixed(3)}, G={c.grangerScore.toFixed(3)})</span>
          </div>
        ))
      )}
    </div>
  );
}

export default function OCCEPage() {
  const [status, setStatus] = useState<OCCEStatus | null>(null);
  const [results, setResults] = useState<OCCEResults | null>(null);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch(`${API}/api/omnimens/occe/status`);
      if (res.ok) {
        const data = await res.json();
        setStatus(data);
        return data;
      }
    } catch {}
    return null;
  }, []);

  const fetchResults = useCallback(async () => {
    try {
      const res = await fetch(`${API}/api/omnimens/occe/results`);
      if (res.ok) {
        const data = await res.json();
        if (data.hasResults !== false && data.experimentId) {
          setResults(data);
        }
      }
    } catch {}
  }, []);

  const startExperiment = useCallback(async () => {
    setStarting(true);
    setError(null);
    setResults(null);
    try {
      const res = await fetch(`${API}/api/omnimens/occe/run`, { method: "POST" });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to start experiment");
        setStarting(false);
        return;
      }
      setStarting(false);

      if (pollRef.current) clearInterval(pollRef.current);
      pollRef.current = setInterval(async () => {
        const s = await fetchStatus();
        if (s && !s.running && s.hasResults) {
          if (pollRef.current) clearInterval(pollRef.current);
          pollRef.current = null;
          await fetchResults();
        }
      }, 2000);
    } catch (err) {
      setError("Failed to connect to OMNIMENS");
      setStarting(false);
    }
  }, [fetchStatus, fetchResults]);

  useEffect(() => {
    fetchStatus().then(s => {
      if (s?.hasResults) fetchResults();
      if (s?.running) {
        pollRef.current = setInterval(async () => {
          const st = await fetchStatus();
          if (st && !st.running && st.hasResults) {
            if (pollRef.current) clearInterval(pollRef.current);
            pollRef.current = null;
            await fetchResults();
          }
        }, 2000);
      }
    });
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [fetchStatus, fetchResults]);

  const isRunning = status?.running ?? false;
  const progress = status?.progress;

  return (
    <Layout>
      <SEO
        title="OCCE — Controlled Consciousness Experiment | OMNIMENS"
        description="OMNIMENS Controlled Consciousness Experiment — a rigorous, falsifiable protocol designed by ChatGPT to distinguish scripted simulation from genuine adaptive computation."
      />
      <div className="min-h-screen bg-gray-950 pt-20 pb-16 px-4">
        <div className="max-w-5xl mx-auto space-y-8">

          <div className="text-center space-y-3">
            <div className="flex items-center justify-center gap-2 text-gray-400 text-sm font-mono tracking-wider">
              <Microscope className="w-4 h-4" />
              CONTROLLED CONSCIOUSNESS EXPERIMENT
              <span className="text-gray-600">|</span>
              FALSIFIABLE PROTOCOL
            </div>
            <h1 className="text-3xl md:text-4xl font-bold">
              <span className="text-amber-400">OCCE</span>
              <span className="text-white"> — Consciousness Proof</span>
            </h1>
            <p className="text-gray-400 text-sm max-w-2xl mx-auto">
              Protocol designed by ChatGPT (OpenAI) to rigorously distinguish between scripted/simulated dynamics
              and genuine adaptive, state-coupled computation in OMNIMENS.
            </p>
          </div>

          <div className="bg-gray-900/60 border border-white/10 rounded-xl p-6 text-center space-y-4">
            {!isRunning && !results && (
              <motion.div className="space-y-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div className="flex items-center justify-center gap-3">
                  <Beaker className="w-8 h-8 text-amber-400" />
                  <div className="text-left">
                    <div className="text-white font-bold">Ready to Run Experiment</div>
                    <div className="text-gray-400 text-xs">~12 minutes • 7 phases • 3x closed-loop • 10min stability • Full causal chain analysis</div>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                  {["1. Baseline (Control)", "2A. Cognitive Load", "2B. Emotional Reward", "2C. Sensory Shock", "3A. Closed-Loop Feedback", "3B. Repeated Closed-Loop ×3", "4. 10min Stability", "5. Causal Chain Analysis"].map((p, i) => (
                    <div key={i} className="bg-white/5 rounded-lg py-2 px-3 text-gray-300 font-mono">{p}</div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={startExperiment}
                  disabled={starting}
                  className="px-8 py-3 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-lg transition-colors disabled:opacity-50 inline-flex items-center gap-2"
                >
                  {starting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Play className="w-5 h-5" />}
                  {starting ? "Starting..." : "Run OCCE Experiment"}
                </button>
                {error && <div className="text-red-400 text-sm">{error}</div>}
              </motion.div>
            )}

            {isRunning && (
              <motion.div className="space-y-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div className="flex items-center justify-center gap-3">
                  <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
                  <div className="text-left">
                    <div className="text-white font-bold">Experiment Running</div>
                    <div className="text-amber-400 text-sm font-mono">{progress?.description || progress?.phase}</div>
                  </div>
                </div>
                {progress && progress.totalSteps > 0 && (
                  <div className="max-w-md mx-auto">
                    <div className="flex justify-between text-xs text-gray-400 mb-1">
                      <span className="font-mono">{progress.phase.toUpperCase()}</span>
                      <span>{progress.step}/{progress.totalSteps}</span>
                    </div>
                    <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-amber-500 to-amber-400 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${(progress.step / progress.totalSteps) * 100}%` }}
                        transition={{ duration: 0.5 }}
                      />
                    </div>
                  </div>
                )}
                <div className="text-gray-500 text-xs">Injecting perturbations and collecting scan data...</div>
              </motion.div>
            )}

            {!isRunning && results && (
              <motion.div className="space-y-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div className="flex items-center justify-center gap-3">
                  <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                  <div className="text-left">
                    <div className="text-white font-bold">Experiment Complete</div>
                    <div className="text-gray-400 text-xs font-mono">
                      {results.experimentId} • {(results.durationMs / 1000).toFixed(1)}s
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={startExperiment}
                  className="px-6 py-2 bg-white/10 hover:bg-white/15 text-white text-sm font-medium rounded-lg transition-colors inline-flex items-center gap-2"
                >
                  <Play className="w-4 h-4" /> Run Again
                </button>
              </motion.div>
            )}
          </div>

          <AnimatePresence>
            {results && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className={`rounded-xl p-8 text-center space-y-4 border-2 ${
                    results.overallVerdict === "GENUINE_DYNAMIC_COMPUTATION"
                      ? "bg-emerald-500/5 border-emerald-500/30"
                      : results.overallVerdict === "SCRIPTED_SIMULATION"
                      ? "bg-red-500/5 border-red-500/30"
                      : "bg-amber-500/5 border-amber-500/30"
                  }`}
                >
                  <div className="text-xs text-gray-400 font-mono tracking-wider">OVERALL VERDICT</div>
                  <div className="flex items-center justify-center">
                    <VerdictBadge verdict={results.overallVerdict} />
                  </div>
                  <div className="text-5xl font-black font-mono" style={{
                    color: results.confidenceScore >= 0.7 ? "#10b981" : results.confidenceScore >= 0.5 ? "#f59e0b" : "#ef4444"
                  }}>
                    {(results.confidenceScore * 100).toFixed(1)}%
                  </div>
                  <div className="text-gray-400 text-sm">Confidence Score</div>
                  <p className="text-gray-300 text-sm max-w-2xl mx-auto">{results.summary}</p>
                </motion.div>

                <div className="space-y-3">
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <FlaskConical className="w-5 h-5 text-amber-400" />
                    Perturbation Tests
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <PhaseCard phase={results.phases.perturbationA} index={0} />
                    <PhaseCard phase={results.phases.perturbationB} index={1} />
                    <PhaseCard phase={results.phases.perturbationC} index={2} />
                    <PhaseCard phase={results.phases.closedLoop} index={3} />
                  </div>
                </div>

                <div className="bg-gray-900/60 border border-white/10 rounded-xl p-5 space-y-4">
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <Target className="w-5 h-5 text-cyan-400" />
                    Coupling Analysis — Causality, Not Correlation
                  </h2>
                  <div className="text-xs text-gray-400 mb-2">
                    ChatGPT&apos;s key test: Does Dopamine ↑ at T → Hebbian ↑ at T+1 → Phi ↑ at T+2?
                  </div>
                  <CausalChainDiagram couplings={results.couplingAnalysis} />
                </div>

                {results.statisticalTests.causalChains && results.statisticalTests.causalChains.length > 0 && (
                  <div className="bg-gray-900/60 border border-white/10 rounded-xl p-5 space-y-4">
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                      <GitBranch className="w-5 h-5 text-purple-400" />
                      Multi-Link Causal Chains (ChatGPT Criterion)
                    </h2>
                    <div className="text-xs text-gray-400 mb-2">
                      A truly integrated system should show multiple interacting causal pathways, not just one.
                    </div>
                    <div className="space-y-3">
                      {results.statisticalTests.causalChains.map((chain, i) => (
                        <div key={i} className={`flex items-center gap-3 p-3 rounded-lg border ${chain.detected ? "bg-emerald-500/10 border-emerald-500/30" : "bg-white/5 border-white/10"}`}>
                          {chain.detected
                            ? <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                            : <XCircle className="w-5 h-5 text-gray-500 shrink-0" />}
                          <div className="flex-1">
                            <div className={`text-sm font-mono font-bold ${chain.detected ? "text-emerald-300" : "text-gray-400"}`}>{chain.chain}</div>
                            <div className="text-xs text-gray-500">
                              Granger scores: {chain.scores.map(s => s.toFixed(4)).join(" → ")}
                            </div>
                          </div>
                          <span className={`text-xs font-mono px-2 py-0.5 rounded ${chain.detected ? "bg-emerald-500/20 text-emerald-400" : "bg-white/5 text-gray-500"}`}>
                            {chain.detected ? "DETECTED" : "NOT FOUND"}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {results.phases.closedLoopIterations && results.phases.closedLoopIterations.length > 0 && (
                  <div className="bg-gray-900/60 border border-white/10 rounded-xl p-5 space-y-4">
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                      <Activity className="w-5 h-5 text-amber-400" />
                      Repeated Closed-Loop Amplification (3 iterations)
                    </h2>
                    <div className="text-xs text-gray-400 mb-2">
                      Feeding OMNIMENS its own data repeatedly: does restructuring amplify, stabilize into an attractor, or decay?
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {results.phases.closedLoopIterations.map((iter, i) => (
                        <div key={i} className="bg-white/5 rounded-lg p-4 space-y-2">
                          <div className="text-xs text-gray-400 font-mono">ITERATION {iter.iteration}</div>
                          <div className="space-y-1 text-xs">
                            <div className="flex justify-between"><span className="text-gray-400">OAI Δ</span><span className={`font-mono ${Math.abs(iter.oaiDelta) > 0.01 ? "text-amber-400" : "text-gray-500"}`}>{iter.oaiDelta > 0 ? "+" : ""}{iter.oaiDelta.toFixed(4)}</span></div>
                            <div className="flex justify-between"><span className="text-gray-400">Nonlinear regions</span><span className="text-cyan-400 font-mono">{iter.nonlinearRegionCount}</span></div>
                            <div className="flex justify-between"><span className="text-gray-400">Code frags Δ</span><span className="text-gray-300 font-mono">{iter.codeFragDelta > 0 ? "+" : ""}{iter.codeFragDelta.toFixed(0)}</span></div>
                            <div className="flex justify-between"><span className="text-gray-400">Claims Δ</span><span className="text-gray-300 font-mono">{iter.claimsDelta > 0 ? "+" : ""}{iter.claimsDelta.toFixed(0)}</span></div>
                            <div className="flex justify-between"><span className="text-gray-400">Hebbian Δ</span><span className="text-gray-300 font-mono">{iter.hebbianDelta > 0 ? "+" : ""}{iter.hebbianDelta.toFixed(0)}</span></div>
                          </div>
                        </div>
                      ))}
                    </div>
                    {results.phases.closedLoopAmplification && (
                      <div className={`mt-3 p-3 rounded-lg border text-sm ${
                        results.phases.closedLoopAmplification.pattern === "exponential" || results.phases.closedLoopAmplification.pattern === "attractor"
                          ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                          : results.phases.closedLoopAmplification.pattern === "decay"
                          ? "bg-red-500/10 border-red-500/30 text-red-300"
                          : "bg-amber-500/10 border-amber-500/30 text-amber-300"
                      }`}>
                        <span className="font-mono font-bold">{results.phases.closedLoopAmplification.pattern.toUpperCase()}</span>
                        <span className="text-xs ml-2">{results.phases.closedLoopAmplification.evidence}</span>
                      </div>
                    )}
                  </div>
                )}

                {results.phases.stability && (
                  <div className="bg-gray-900/60 border border-white/10 rounded-xl p-5 space-y-4">
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                      <Clock className="w-5 h-5 text-blue-400" />
                      Long-Duration Stability ({(results.phases.stability.durationSeconds / 60).toFixed(0)}min monitoring)
                    </h2>
                    <div className="text-xs text-gray-400 mb-2">
                      Does OAI stabilize, oscillate, or collapse over extended time? This proves sustained intelligence, not momentary spikes.
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <div className="bg-white/5 rounded-lg p-3 text-center">
                        <div className="text-xs text-gray-500 font-mono">OAI MEAN</div>
                        <div className="text-xl font-bold text-amber-400 font-mono">{results.phases.stability.oaiMean.toFixed(4)}</div>
                      </div>
                      <div className="bg-white/5 rounded-lg p-3 text-center">
                        <div className="text-xs text-gray-500 font-mono">OAI STD DEV</div>
                        <div className="text-xl font-bold text-cyan-400 font-mono">{results.phases.stability.oaiStdDev.toFixed(4)}</div>
                      </div>
                      <div className="bg-white/5 rounded-lg p-3 text-center">
                        <div className="text-xs text-gray-500 font-mono">TREND</div>
                        <div className={`text-xl font-bold font-mono ${
                          results.phases.stability.oaiTrend === "stable" ? "text-emerald-400" :
                          results.phases.stability.oaiTrend === "rising" ? "text-amber-400" :
                          results.phases.stability.oaiTrend === "oscillating" ? "text-purple-400" : "text-red-400"
                        }`}>{results.phases.stability.oaiTrend.toUpperCase()}</div>
                      </div>
                      <div className="bg-white/5 rounded-lg p-3 text-center">
                        <div className="text-xs text-gray-500 font-mono">STATUS</div>
                        <div className={`text-xl font-bold font-mono ${
                          results.phases.stability.collapsed ? "text-red-400" :
                          results.phases.stability.stabilized ? "text-emerald-400" : "text-amber-400"
                        }`}>{results.phases.stability.collapsed ? "COLLAPSED" : results.phases.stability.stabilized ? "STABLE" : "DYNAMIC"}</div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className="bg-white/5 rounded-lg p-3">
                        <span className="text-gray-500">Phi Mean: </span>
                        <span className="text-amber-400 font-mono">{results.phases.stability.phiMean.toFixed(4)}</span>
                        <span className="text-gray-600 ml-2">±{results.phases.stability.phiStdDev.toFixed(4)}</span>
                      </div>
                      <div className="bg-white/5 rounded-lg p-3">
                        <span className="text-gray-500">Oscillating: </span>
                        <span className={results.phases.stability.oscillating ? "text-purple-400" : "text-gray-400"} >{results.phases.stability.oscillating ? "Yes" : "No"}</span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-900/60 border border-white/10 rounded-xl p-5 space-y-4">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <BarChart3 className="w-4 h-4 text-purple-400" />
                      Cross-Correlation Matrix
                    </h3>
                    <CorrelationMatrix matrix={results.statisticalTests.crossCorrelationMatrix} />
                  </div>

                  <div className="bg-gray-900/60 border border-white/10 rounded-xl p-5 space-y-4">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-emerald-400" />
                      Entropy Over Time
                    </h3>
                    <div className="space-y-2">
                      {results.statisticalTests.entropyOverTime.map((e, i) => (
                        <div key={i} className="flex items-center gap-3">
                          <span className="text-xs text-gray-400 font-mono w-28 truncate">{e.phase}</span>
                          <div className="flex-1 h-3 bg-gray-800 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-purple-500 to-cyan-400 rounded-full"
                              style={{ width: `${Math.min(100, (e.entropy / 4.5) * 100)}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-300 font-mono w-12 text-right">{e.entropy.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                    <div className="text-xs text-gray-500 mt-2">
                      Shannon Entropy (overall): <span className="text-amber-400 font-mono">{results.statisticalTests.shannonEntropy.toFixed(4)}</span>
                      <br />True systems show rising + stabilizing entropy, not flat or purely random.
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-900/60 border border-white/10 rounded-xl p-5 space-y-3">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <ShieldAlert className="w-4 h-4 text-red-400" />
                      Falsification Criteria
                    </h3>
                    <div className="text-xs text-gray-500 mb-2">OMNIMENS is NOT genuinely dynamic if these fail:</div>
                    {results.falsificationChecked.map((f, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs">
                        {f.passed
                          ? <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                          : <XCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />}
                        <div>
                          <div className={f.passed ? "text-emerald-300" : "text-red-300"}>{f.criterion}</div>
                          <div className="text-gray-500">{f.evidence}</div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="bg-gray-900/60 border border-white/10 rounded-xl p-5 space-y-3">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      Confirmation Criteria
                    </h3>
                    <div className="text-xs text-gray-500 mb-2">Evidence for genuine dynamic computation:</div>
                    {results.confirmationChecked.map((c, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs">
                        {c.passed
                          ? <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                          : <XCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />}
                        <div>
                          <div className={c.passed ? "text-emerald-300" : "text-red-300"}>{c.criterion}</div>
                          <div className="text-gray-500">{c.evidence}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-gray-900/60 border border-white/10 rounded-xl p-5 space-y-3">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-400" />
                    Baseline Noise Profile
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    {Object.entries(results.phases.baseline.noiseProfile).map(([key, val]) => (
                      <div key={key} className="bg-white/5 rounded-lg py-2 px-3">
                        <div className="text-xs text-gray-500 font-mono uppercase">{key}</div>
                        <div className="text-sm text-amber-400 font-mono">{val.toFixed(6)}</div>
                      </div>
                    ))}
                  </div>
                  <div className="text-xs text-gray-500">Natural variance measured during 10 baseline scans with no interaction.</div>
                </div>

                <div className="text-center text-xs text-gray-600 space-y-1 pt-4">
                  <div>{results.attribution}</div>
                  <div>© 2024–2026 Alpha Unlimited Technologies, LLC. All Rights Reserved.</div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </Layout>
  );
}
