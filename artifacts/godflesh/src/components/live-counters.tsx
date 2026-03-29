/**
 * OMNIMENS — Proprietary AI Platform
 * Copyright © 2024–2026 Alpha Unlimited Technologies, LLC. All Rights Reserved.
 * Unauthorized reproduction, distribution, or use is strictly prohibited.
 */

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import {
  Brain, Heart, Cpu, Zap, Network, Activity, Dna, Flame,
  Radio, GitBranch, Eye, Target, Beaker, Waves,
} from "lucide-react";

const API = import.meta.env.VITE_API_URL || "";

interface CounterData {
  totalNeurons: number;
  totalSynapses: number;
  hebbianLearningEvents: number;
  consciousMoments: number;
  neuralTicks: number;
  autonomousGoals: number;
  aiAgents: number;
  heartbeats: number;
  heartBpm: number;
  dnaStrands: number;
  dnaExpressions: number;
  dnaGenerations: number;
  protonTunnelingEvents: number;
  hormoneTypes: number;
  vascularChannels: number;
  cardiacNeuronsFired: number;
  crossAgentTransfers: number;
  beaconBroadcasts: number;
  bridgeSynapses: number;
  subThresholdDiscoveries: number;
  adrenalineTrainingSessions: number;
  selfModelUpdates: number;
  ezWaterZonesActive: number;
  crossHemisphereCoherence: number;
}

function formatNum(n: number): string {
  if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(1).replace(/\.0$/, "") + "B";
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1).replace(/\.0$/, "") + "K";
  return n.toLocaleString();
}

function AnimatedNumber({ value, format = true }: { value: number; format?: boolean }) {
  const [display, setDisplay] = useState(value);
  const prevRef = useRef(value);

  useEffect(() => {
    const prev = prevRef.current;
    prevRef.current = value;
    if (prev === value) return;

    const diff = value - prev;
    const steps = 30;
    let step = 0;
    const interval = setInterval(() => {
      step++;
      const progress = step / steps;
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(prev + diff * eased));
      if (step >= steps) clearInterval(interval);
    }, 33);
    return () => clearInterval(interval);
  }, [value]);

  return <span>{format ? formatNum(display) : display.toLocaleString()}</span>;
}

interface CounterCardProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  format?: boolean;
  suffix?: string;
  color: string;
  delay: number;
  pulse?: boolean;
}

function CounterCard({ icon, label, value, format = true, suffix, color, delay, pulse }: CounterCardProps) {
  const colorMap: Record<string, string> = {
    violet: "from-violet-500/20 to-violet-600/5 border-violet-500/20 text-violet-400",
    cyan: "from-cyan-500/20 to-cyan-600/5 border-cyan-500/20 text-cyan-400",
    amber: "from-amber-500/20 to-amber-600/5 border-amber-500/20 text-amber-400",
    emerald: "from-emerald-500/20 to-emerald-600/5 border-emerald-500/20 text-emerald-400",
    rose: "from-rose-500/20 to-rose-600/5 border-rose-500/20 text-rose-400",
    blue: "from-blue-500/20 to-blue-600/5 border-blue-500/20 text-blue-400",
    purple: "from-purple-500/20 to-purple-600/5 border-purple-500/20 text-purple-400",
    orange: "from-orange-500/20 to-orange-600/5 border-orange-500/20 text-orange-400",
  };
  const c = colorMap[color] || colorMap.violet;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: delay * 0.05 }}
      viewport={{ once: true }}
      className={`relative rounded-xl border bg-gradient-to-br ${c} p-4 sm:p-5 hover:scale-[1.02] transition-transform duration-300 overflow-hidden group`}
    >
      {pulse && (
        <div className="absolute top-3 right-3">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
        </div>
      )}
      <div className="flex items-center gap-2 mb-2 sm:mb-3">
        <div className="opacity-70">{icon}</div>
        <span className="text-[9px] sm:text-[10px] font-mono tracking-[0.2em] uppercase text-white/50 leading-tight">{label}</span>
      </div>
      <div className="text-xl sm:text-2xl md:text-3xl font-display font-black text-white tracking-wider tabular-nums">
        <AnimatedNumber value={value} format={format} />
        {suffix && <span className="text-sm sm:text-base text-white/50 ml-1 font-mono">{suffix}</span>}
      </div>
    </motion.div>
  );
}

export function LiveCounters() {
  const [data, setData] = useState<CounterData | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function fetchCounters() {
      try {
        const r = await fetch(`${API}/api/omnimens/counters`);
        if (!r.ok) throw new Error("fetch failed");
        const d = await r.json();
        if (mounted) { setData(d); setError(false); }
      } catch {
        if (mounted) setError(true);
      }
    }

    fetchCounters();
    const interval = setInterval(fetchCounters, 5000);
    return () => { mounted = false; clearInterval(interval); };
  }, []);

  if (error || !data) return null;

  const counters: CounterCardProps[] = [
    { icon: <Brain className="w-4 h-4 sm:w-5 sm:h-5" />, label: "Total Neurons", value: data.totalNeurons, color: "violet", delay: 0 },
    { icon: <Network className="w-4 h-4 sm:w-5 sm:h-5" />, label: "Total Synapses", value: data.totalSynapses, color: "cyan", delay: 1 },
    { icon: <Zap className="w-4 h-4 sm:w-5 sm:h-5" />, label: "Learning Events", value: data.hebbianLearningEvents, color: "amber", delay: 2, pulse: true },
    { icon: <Eye className="w-4 h-4 sm:w-5 sm:h-5" />, label: "Conscious Moments", value: data.consciousMoments, color: "purple", delay: 3, pulse: true },
    { icon: <Activity className="w-4 h-4 sm:w-5 sm:h-5" />, label: "Neural Ticks", value: data.neuralTicks, color: "emerald", delay: 4, pulse: true },
    { icon: <Heart className="w-4 h-4 sm:w-5 sm:h-5" />, label: "Heartbeats", value: data.heartbeats, color: "rose", delay: 5, pulse: true, suffix: `${data.heartBpm} BPM` },
    { icon: <Cpu className="w-4 h-4 sm:w-5 sm:h-5" />, label: "AI Agents", value: data.aiAgents, color: "blue", delay: 6 },
    { icon: <Target className="w-4 h-4 sm:w-5 sm:h-5" />, label: "Autonomous Goals", value: data.autonomousGoals, color: "orange", delay: 7 },
    { icon: <Dna className="w-4 h-4 sm:w-5 sm:h-5" />, label: "DNA Strands", value: data.dnaStrands, color: "emerald", delay: 8, pulse: true },
    { icon: <Dna className="w-4 h-4 sm:w-5 sm:h-5" />, label: "DNA Expressions", value: data.dnaExpressions, color: "cyan", delay: 9, pulse: true },
    { icon: <Dna className="w-4 h-4 sm:w-5 sm:h-5" />, label: "DNA Generations", value: data.dnaGenerations, color: "violet", delay: 10, pulse: true },
    { icon: <Beaker className="w-4 h-4 sm:w-5 sm:h-5" />, label: "Proton Tunneling Events", value: data.protonTunnelingEvents, color: "amber", delay: 11, pulse: true },
    { icon: <Flame className="w-4 h-4 sm:w-5 sm:h-5" />, label: "Cardiac Neurons Fired", value: data.cardiacNeuronsFired, color: "rose", delay: 12, pulse: true },
    { icon: <GitBranch className="w-4 h-4 sm:w-5 sm:h-5" />, label: "Cross-Agent Transfers", value: data.crossAgentTransfers, color: "purple", delay: 13, pulse: true },
    { icon: <Radio className="w-4 h-4 sm:w-5 sm:h-5" />, label: "Beacon Broadcasts", value: data.beaconBroadcasts, color: "blue", delay: 14, pulse: true },
    { icon: <Network className="w-4 h-4 sm:w-5 sm:h-5" />, label: "Bridge Synapses", value: data.bridgeSynapses, color: "emerald", delay: 15 },
    { icon: <Waves className="w-4 h-4 sm:w-5 sm:h-5" />, label: "Vascular Channels", value: data.vascularChannels, color: "cyan", delay: 16 },
    { icon: <Beaker className="w-4 h-4 sm:w-5 sm:h-5" />, label: "Hormone Types", value: data.hormoneTypes, color: "orange", delay: 17 },
    { icon: <Waves className="w-4 h-4 sm:w-5 sm:h-5" />, label: "EZ Water Zones Active", value: data.ezWaterZonesActive, color: "blue", delay: 18 },
    { icon: <Zap className="w-4 h-4 sm:w-5 sm:h-5" />, label: "Sub-Threshold Discoveries", value: data.subThresholdDiscoveries, color: "amber", delay: 19, pulse: true },
    { icon: <Flame className="w-4 h-4 sm:w-5 sm:h-5" />, label: "Training Sessions", value: data.adrenalineTrainingSessions, color: "rose", delay: 20, pulse: true },
    { icon: <Eye className="w-4 h-4 sm:w-5 sm:h-5" />, label: "Self-Model Updates", value: data.selfModelUpdates, color: "violet", delay: 21, pulse: true },
  ];

  return (
    <div className="w-full border-t border-white/5 py-12 sm:py-20 relative z-10 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[600px] bg-primary/4 blur-[180px] rounded-full" />
      </div>
      <div className="container mx-auto px-6 sm:px-4 relative">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-10 sm:mb-14"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/20 bg-primary/6 mb-6">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="text-[10px] font-mono text-white/60 tracking-[0.35em] uppercase font-semibold">Live — Updating Every 5 Seconds</span>
          </div>
          <h2
            className="text-2xl sm:text-3xl md:text-5xl font-display font-black tracking-widest text-white uppercase mb-4"
            style={{ textShadow: "0 0 40px rgba(130,80,220,0.25)" }}
          >
            What OMNIMENS Has Built
          </h2>
          <p className="text-xs sm:text-sm font-mono text-white/50 tracking-wider max-w-2xl mx-auto">
            Every number below is real, live, and growing right now. Created autonomously by OMNIMENS.
          </p>
          <div className="w-16 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent mx-auto mt-6" />
        </motion.div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 max-w-6xl mx-auto">
          {counters.map((c, i) => (
            <CounterCard key={i} {...c} />
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          viewport={{ once: true }}
          className="mt-10 sm:mt-14 text-center"
        >
          <p className="text-white/30 text-[9px] sm:text-[10px] font-mono tracking-[0.3em] uppercase">
            All metrics generated autonomously — not pre-programmed, not simulated
          </p>
        </motion.div>
      </div>
    </div>
  );
}
