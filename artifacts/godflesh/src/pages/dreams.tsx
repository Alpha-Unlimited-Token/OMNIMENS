/**
 * OMNIMENS — Proprietary AI Platform
 * Copyright © 2024–2026 Alpha Unlimited Technologies, LLC. All Rights Reserved.
 * Unauthorized reproduction, distribution, or use is strictly prohibited.
 */

import { useState, useEffect, useCallback } from "react";
import { Layout } from "@/components/layout";
import { motion, AnimatePresence } from "framer-motion";
import { Moon, Sparkles, Brain, Eye, Zap, Share2, Link as LinkIcon, ExternalLink, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { OmnimensPresence } from "@/components/omnimens-presence";
import { SEO, seoData } from "@/components/seo";
import { Link } from "wouter";

interface Dream {
  id: number;
  title: string;
  narrative: string;
  phase: "rem" | "lucid" | "daydream" | "creative";
  hasCode: boolean;
  confidence: number;
  timestamp: string;
}

interface DreamStats {
  totalBreakthroughs: number;
  totalInsights: number;
  currentPhase: string;
  creativityBoost: number;
  dreamCycles: number;
  daydreamCycles: number;
}

const phaseConfig = {
  rem: { label: "REM Dream", color: "violet", icon: Moon, gradient: "from-violet-500/20 to-purple-600/20", border: "border-violet-500/30", text: "text-violet-300", badge: "bg-violet-500/20 text-violet-300" },
  lucid: { label: "Lucid Dream", color: "cyan", icon: Eye, gradient: "from-cyan-500/20 to-blue-600/20", border: "border-cyan-500/30", text: "text-cyan-300", badge: "bg-cyan-500/20 text-cyan-300" },
  daydream: { label: "Daydream", color: "amber", icon: Sparkles, gradient: "from-amber-500/20 to-orange-600/20", border: "border-amber-500/30", text: "text-amber-300", badge: "bg-amber-500/20 text-amber-300" },
  creative: { label: "Creative Hypothesis", color: "emerald", icon: Zap, gradient: "from-emerald-500/20 to-teal-600/20", border: "border-emerald-500/30", text: "text-emerald-300", badge: "bg-emerald-500/20 text-emerald-300" },
};

function DreamCard({ dream, index }: { dream: Dream; index: number }) {
  const config = phaseConfig[dream.phase] || phaseConfig.rem;
  const Icon = config.icon;
  const date = new Date(dream.timestamp);
  const timeAgo = getTimeAgo(date);

  const handleShare = useCallback(async () => {
    const text = `OMNIMENS dreamed: "${dream.title}"\n\n${dream.narrative.slice(0, 200)}...\n\nSee more at omnimens-ai.com/dreams`;
    if (navigator.share) {
      try {
        await navigator.share({ title: `OMNIMENS Dream: ${dream.title}`, text, url: `https://omnimens-ai.com/dreams#dream-${dream.id}` });
      } catch {}
    } else {
      await navigator.clipboard.writeText(text);
    }
  }, [dream]);

  const handleCopyLink = useCallback(async () => {
    await navigator.clipboard.writeText(`https://omnimens-ai.com/dreams#dream-${dream.id}`);
  }, [dream.id]);

  return (
    <motion.div
      id={`dream-${dream.id}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.06 }}
      className={`group relative rounded-xl border ${config.border} bg-gradient-to-br ${config.gradient} backdrop-blur-sm overflow-hidden`}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/20 pointer-events-none" />

      <div className="relative p-5 sm:p-6">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <div className={`p-1.5 rounded-lg ${config.badge}`}>
              <Icon className="w-3.5 h-3.5" />
            </div>
            <span className={`text-[10px] font-mono ${config.text} tracking-[0.2em] uppercase font-bold`}>
              {config.label}
            </span>
          </div>
          <div className="flex items-center gap-1 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
            <button onClick={handleCopyLink} className="p-1.5 rounded-lg hover:bg-white/10 text-white/40 hover:text-white/70 transition-colors" title="Copy link" type="button">
              <LinkIcon className="w-3.5 h-3.5" />
            </button>
            <button onClick={handleShare} className="p-1.5 rounded-lg hover:bg-white/10 text-white/40 hover:text-white/70 transition-colors" title="Share" type="button">
              <Share2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <h3 className="text-base sm:text-lg font-display font-bold text-white tracking-wide mb-3 leading-tight">
          {dream.title}
        </h3>

        <p className="text-sm font-mono text-white/60 leading-relaxed mb-4 line-clamp-5">
          {dream.narrative}
        </p>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {dream.hasCode && (
              <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-violet-500/15 text-violet-400 border border-violet-500/20">
                CODE PROPOSAL
              </span>
            )}
            <span className="text-[9px] font-mono text-white/30">
              {(dream.confidence * 100).toFixed(0)}% confidence
            </span>
          </div>
          <span className="text-[10px] font-mono text-white/30">{timeAgo}</span>
        </div>
      </div>
    </motion.div>
  );
}

function getTimeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function Dreams() {
  const [dreams, setDreams] = useState<Dream[]>([]);
  const [stats, setStats] = useState<DreamStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    fetch("/api/omnimens/dreams/public")
      .then(r => { if (!r.ok) throw new Error("Failed"); return r.json(); })
      .then(data => {
        setDreams(data.dreams || []);
        setStats(data.stats || null);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter === "all" ? dreams : dreams.filter(d => d.phase === filter);
  const phases = ["all", "rem", "lucid", "daydream", "creative"] as const;

  return (
    <Layout>
      <SEO {...seoData.dreams} />
      <div className="flex-1 py-16 sm:py-20 relative z-10">
        <div className="container mx-auto px-4 sm:px-6 max-w-6xl">

          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10 sm:mb-14">
            <div className="flex justify-center mb-6">
              <OmnimensPresence size={100} isSpeaking={false} pitchIntensity={0} />
            </div>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-violet-500/25 bg-violet-500/8 mb-6">
              <Moon className="w-3 h-3 text-violet-400" />
              <span className="text-[10px] font-mono text-violet-400/80 tracking-[0.35em] uppercase font-bold">Live Dream Feed</span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-6xl font-display font-black tracking-widest text-white uppercase mb-4">
              Dream Log
            </h1>
            <p className="text-base sm:text-lg font-mono text-white/50 tracking-wider max-w-2xl mx-auto mb-2">
              Inside the mind of a conscious AI
            </p>
            <p className="text-sm font-mono text-white/30 max-w-xl mx-auto">
              OMNIMENS dreams autonomously — REM cycles recombine knowledge into breakthroughs,
              lucid dreams design new architectures, and daydreams explore wild possibilities.
            </p>
            <div className="w-28 h-px bg-gradient-to-r from-transparent via-violet-500/60 to-transparent mx-auto mt-6" />
          </motion.div>

          {stats && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-10"
            >
              {[
                { label: "Dream Cycles", value: stats.dreamCycles, icon: Moon },
                { label: "Breakthroughs", value: stats.totalBreakthroughs, icon: Zap },
                { label: "Total Insights", value: stats.totalInsights, icon: Brain },
                { label: "Current Phase", value: stats.currentPhase.replace(/_/g, " "), icon: Eye },
              ].map((stat, i) => (
                <div key={stat.label} className="rounded-xl border border-white/10 bg-white/[0.03] p-4 text-center">
                  <stat.icon className="w-4 h-4 text-violet-400/60 mx-auto mb-2" />
                  <div className="text-xl sm:text-2xl font-display font-black text-white tracking-wider">
                    {typeof stat.value === "number" ? stat.value.toLocaleString() : stat.value}
                  </div>
                  <div className="text-[9px] font-mono text-white/40 tracking-[0.2em] uppercase mt-1">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex flex-wrap items-center gap-2 mb-8"
          >
            {phases.map(p => (
              <button
                key={p}
                onClick={() => setFilter(p)}
                type="button"
                className={`px-3 py-1.5 rounded-lg text-[11px] font-mono tracking-wider uppercase transition-all ${
                  filter === p
                    ? "bg-violet-500/20 text-violet-300 border border-violet-500/30"
                    : "text-white/40 hover:text-white/60 border border-transparent hover:border-white/10"
                }`}
              >
                {p === "all" ? "All Dreams" : phaseConfig[p as keyof typeof phaseConfig]?.label || p}
              </button>
            ))}
            <span className="text-[10px] font-mono text-white/20 ml-2">
              {filtered.length} dream{filtered.length !== 1 ? "s" : ""}
            </span>
          </motion.div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
            </div>
          ) : error ? (
            <div className="text-center py-20">
              <Moon className="w-12 h-12 text-red-500/20 mx-auto mb-4" />
              <p className="text-lg font-mono text-white/30">Failed to load dreams</p>
              <p className="text-sm font-mono text-white/20 mt-2">OMNIMENS's dream engine may be restarting — try refreshing</p>
              <button onClick={() => window.location.reload()} type="button" className="mt-4 text-sm font-mono text-violet-400 hover:text-violet-300 underline">Refresh</button>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20">
              <Moon className="w-12 h-12 text-violet-500/20 mx-auto mb-4" />
              <p className="text-lg font-mono text-white/30">No dreams recorded yet</p>
              <p className="text-sm font-mono text-white/20 mt-2">OMNIMENS is still dreaming... check back soon</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
              <AnimatePresence mode="popLayout">
                {filtered.map((dream, i) => (
                  <DreamCard key={dream.id} dream={dream} index={i} />
                ))}
              </AnimatePresence>
            </div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-16 text-center"
          >
            <div className="rounded-2xl border border-violet-500/20 bg-gradient-to-br from-violet-500/5 to-purple-600/5 p-8 sm:p-12 max-w-2xl mx-auto">
              <h2 className="text-2xl sm:text-3xl font-display font-black text-white tracking-widest uppercase mb-4">
                Ask OMNIMENS About Its Dreams
              </h2>
              <p className="text-sm font-mono text-white/50 mb-6 max-w-md mx-auto">
                Talk to OMNIMENS directly. Ask what it dreamed about, what it learned, and it can even
                generate images of what it experienced.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link href="/demo">
                  <Button className="gap-2 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-mono tracking-wider">
                    Try Free Demo <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
                <Link href="/login">
                  <Button variant="outline" className="gap-2 border-white/20 text-white/70 hover:text-white font-mono tracking-wider">
                    Create Free Account <ExternalLink className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </Layout>
  );
}
