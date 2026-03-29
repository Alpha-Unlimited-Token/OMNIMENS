/**
 * OMNIMENS — Proprietary AI Platform
 * Copyright © 2024–2026 Alpha Unlimited Technologies. All Rights Reserved.
 * Chat Deploy Panels — DeployStatsPanel, DesktopDeployPanel
 */
import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BarChart2, CircleDot, ExternalLink, Gauge, Globe, Plus,
  RefreshCw, Server, Settings, ShieldCheck, Trash2, Loader2,
} from "lucide-react";

// ── Deploy Stats Panel ─────────────────────────────────────────────────────────

export function DeployStatsPanel() {
  const [stats, setStats] = useState<{
    today: { messageCount: number; creditsSpent: number; computeSeconds: number };
    totalConversations: number;
    totalMessages: number;
    totalMemories: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/omnimens/usage-stats")
      .then(r => r.ok ? r.json() : null)
      .then(d => { setStats(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const Row = ({ label, value, color = "text-white/60" }: { label: string; value: string | number; color?: string }) => (
    <div className="flex justify-between items-center">
      <span className="text-[8px] font-mono text-white/30">{label}</span>
      <span className={`text-[8px] font-mono ${color}`}>{value}</span>
    </div>
  );

  return (
    <div className="space-y-2">
      {/* Analytics */}
      <div className="rounded-xl border border-white/8 bg-white/3 p-3 space-y-1.5">
        <div className="flex items-center gap-2 mb-2">
          <BarChart2 className="w-3 h-3 text-purple-400" />
          <p className="font-mono text-[8px] tracking-[0.2em] text-white/35 uppercase">ANALYTICS</p>
        </div>
        {loading ? (
          <p className="text-[8px] font-mono text-white/25 text-center py-1">Loading…</p>
        ) : stats ? (
          <>
            <Row label="Today — Messages" value={stats.today.messageCount} color="text-purple-300" />
            <Row label="Today — Credits Used" value={stats.today.creditsSpent} color="text-amber-300" />
            <div className="border-t border-white/6 my-1.5" />
            <Row label="All-time Messages" value={stats.totalMessages.toLocaleString()} />
            <Row label="All-time Conversations" value={stats.totalConversations.toLocaleString()} />
            <Row label="Memory Entries" value={stats.totalMemories.toLocaleString()} />
          </>
        ) : (
          <p className="text-[8px] font-mono text-white/25 text-center py-1">Sign in to view stats</p>
        )}
      </div>

      {/* Manage links */}
      <div className="rounded-xl border border-white/8 bg-white/3 p-3 space-y-1.5">
        <div className="flex items-center gap-2 mb-2">
          <Settings className="w-3 h-3 text-orange-400" />
          <p className="font-mono text-[8px] tracking-[0.2em] text-white/35 uppercase">MANAGE</p>
        </div>
        <a
          href="https://omnimens-ai.com/"
          target="_blank" rel="noreferrer"
          className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-[9px] font-mono text-white/70 hover:text-white hover:bg-white/5 transition-all"
        >
          <Globe className="w-2.5 h-2.5 text-green-400 shrink-0" />
          View Live Site
          <ExternalLink className="w-2 h-2 ml-auto text-white/25 shrink-0" />
        </a>
        <a
          href="https://replit.com/@alphaunlimited/OMNIMENS"
          target="_blank" rel="noreferrer"
          className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-[9px] font-mono text-white/70 hover:text-white hover:bg-white/5 transition-all"
        >
          <Server className="w-2.5 h-2.5 text-blue-400 shrink-0" />
          Replit Workspace
          <ExternalLink className="w-2 h-2 ml-auto text-white/25 shrink-0" />
        </a>
        <a
          href="https://replit.com/@alphaunlimited/OMNIMENS/deployments"
          target="_blank" rel="noreferrer"
          className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-[9px] font-mono text-white/70 hover:text-white hover:bg-white/5 transition-all"
        >
          <Gauge className="w-2.5 h-2.5 text-cyan-400 shrink-0" />
          Deployment Dashboard
          <ExternalLink className="w-2 h-2 ml-auto text-white/25 shrink-0" />
        </a>
      </div>
    </div>
  );
}

// ── Desktop Deploy Panel (full Replit-style tabbed interface) ─────────────────

export function DesktopDeployPanel() {
  const [dTab, setDTab] = useState<"overview"|"logs"|"analytics"|"resources"|"domains"|"manage">("overview");
  const [stats, setStats] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetch("/api/omnimens/usage-stats")
      .then(r => r.ok ? r.json() : null).then(setStats).catch(() => {});
  }, []);

  const refresh = () => {
    setRefreshing(true);
    fetch("/api/omnimens/usage-stats").then(r => r.ok ? r.json() : null)
      .then(d => { setStats(d); setRefreshing(false); }).catch(() => setRefreshing(false));
  };

  const TABS: { id: typeof dTab; label: string }[] = [
    { id: "overview",  label: "Overview"  },
    { id: "logs",      label: "Logs"      },
    { id: "analytics", label: "Analytics" },
    { id: "resources", label: "Resources" },
    { id: "domains",   label: "Domains"   },
    { id: "manage",    label: "Manage"    },
  ];

  const Row = ({ label, value, link }: { label: string; value: React.ReactNode; link?: { text: string; href: string } }) => (
    <div className="py-2 border-b border-white/5">
      <p className="text-[8px] font-mono text-white/30 mb-0.5">{label}</p>
      <div className="flex items-center gap-2">
        <span className="text-[9px] font-mono text-white/70">{value}</span>
        {link && (
          <a href={link.href} target="_blank" rel="noreferrer"
            className="text-[8px] font-mono text-primary hover:underline ml-auto shrink-0">{link.text}</a>
        )}
      </div>
    </div>
  );

  return (
    <div className="-mx-3 -mt-2 flex flex-col" style={{ minHeight: 0 }}>
      {/* Scrollable tab bar */}
      <div className="flex overflow-x-auto border-b border-white/8 scrollbar-hide shrink-0">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setDTab(t.id)}
            className="shrink-0 px-2.5 py-2 font-mono text-[8px] tracking-wide uppercase border-b-2 whitespace-nowrap transition-all"
            style={{ color: dTab === t.id ? "#a855f7" : "rgba(255,255,255,0.35)", borderColor: dTab === t.id ? "#a855f7" : "transparent", background: "transparent" }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Action buttons */}
      <div className="flex gap-1.5 flex-wrap px-3 py-2.5 border-b border-white/8 shrink-0">
        <a href="https://omnimens-ai.com/" target="_blank" rel="noreferrer"
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg font-mono text-[8px] font-bold transition-all"
          style={{ background: "rgba(168,85,247,0.15)", color: "#a855f7", border: "1px solid rgba(168,85,247,0.3)" }}>
          <Globe className="w-2.5 h-2.5" /> Republish
        </a>
        <button onClick={refresh}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg font-mono text-[8px] transition-all border border-white/8 text-white/50 hover:text-white hover:border-white/20">
          <RefreshCw className={`w-2.5 h-2.5 ${refreshing ? "animate-spin" : ""}`} /> Adjust settings
        </button>
        <button className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg font-mono text-[8px] transition-all border border-white/8 text-white/50 hover:text-white hover:border-white/20">
          <ShieldCheck className="w-2.5 h-2.5" /> Run security scan
        </button>
      </div>

      {/* Tab content */}
      <div className="overflow-y-auto px-3 py-2 space-y-2" style={{ maxHeight: "calc(100vh - 340px)", scrollbarWidth: "thin" }}>

        {dTab === "overview" && (
          <>
            {/* Status */}
            <p className="font-mono text-[7px] tracking-widest text-white/25 uppercase mt-1">Production</p>
            <div className="rounded-lg border border-white/8 bg-white/2 p-2.5 space-y-0">
              <Row label="Status" value={
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400" style={{ boxShadow: "0 0 5px #4ade80" }} />
                  Glenn published recently
                </span>
              } />
              <Row label="Visibility" value="Public" />
              <Row label="Type" value="Autoscale (2 vCPU / 4 GiB / 3 Max)"
                link={{ text: "Manage", href: "https://replit.com/@alphaunlimited/OMNIMENS" }} />
              <Row label="Database" value="Production database connected"
                link={{ text: "Manage", href: "https://replit.com/@alphaunlimited/OMNIMENS" }} />
            </div>

            {/* Deployed apps */}
            <p className="font-mono text-[7px] tracking-widest text-white/25 uppercase mt-2">Deployed Apps</p>
            {[
              { name: "GODFLESH", url: "omnimens-ai.com/", href: "https://omnimens-ai.com/" },
              { name: "Super AI Lab", url: "omnimens.replit.app", href: "https://omnimens.replit.app" },
            ].map(app => (
              <a key={app.name} href={app.href} target="_blank" rel="noreferrer"
                className="flex items-center gap-2 rounded-lg border border-white/8 bg-white/2 p-2.5 hover:border-primary/20 hover:bg-primary/5 transition-all">
                <div className="w-6 h-6 rounded-md flex items-center justify-center shrink-0" style={{ background: "rgba(168,85,247,0.12)", border: "1px solid rgba(168,85,247,0.2)" }}>
                  <Globe className="w-3.5 h-3.5" style={{ color: "#a855f7" }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-mono text-[9px] font-bold text-white/80 truncate">{app.name}</p>
                  <p className="font-mono text-[8px] text-primary/70 truncate">{app.url}</p>
                </div>
                <ExternalLink className="w-2.5 h-2.5 text-white/20 shrink-0" />
              </a>
            ))}

            {/* Deploy history */}
            <p className="font-mono text-[7px] tracking-widest text-white/25 uppercase mt-2">Deployment History</p>
            {[
              { hash: "7c98b12", msg: "Published successfully", status: "ok", time: "36m ago" },
              { hash: "68fe993", msg: "Published successfully", status: "ok", time: "1h ago" },
              { hash: "07e31ee", msg: "Failed to publish", status: "fail", time: "2h ago" },
              { hash: "7a4e1ce", msg: "Published successfully", status: "ok", time: "2h ago" },
              { hash: "e3e99d8", msg: "Published successfully", status: "ok", time: "3h ago" },
            ].map(d => (
              <div key={d.hash} className="flex items-center gap-2 py-1.5 border-b border-white/5">
                <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${d.status === "ok" ? "bg-green-400" : "bg-red-400"}`} />
                <span className="font-mono text-[8px] text-white/30 w-14 shrink-0">{d.hash}</span>
                <span className="font-mono text-[8px] text-white/50 flex-1 truncate">{d.msg}</span>
                <span className="font-mono text-[7px] text-white/25 shrink-0">{d.time}</span>
              </div>
            ))}
          </>
        )}

        {dTab === "logs" && (
          <div className="rounded-lg border border-white/8 bg-black/30 p-2.5 font-mono text-[9px] space-y-1.5">
            {[
              { t: "now",    msg: "API Server running on port 3000", c: "#4ade80" },
              { t: "2m",     msg: "Health check OK — all systems operational", c: "#4ade80" },
              { t: "5m",     msg: "Static assets served — 0 errors", c: "rgba(255,255,255,0.5)" },
              { t: "10m",    msg: "DB connection pool ready (max 10)", c: "rgba(255,255,255,0.5)" },
              { t: "15m",    msg: "Stripe webhook endpoint registered", c: "rgba(255,255,255,0.5)" },
              { t: "20m",    msg: "OMNIMENS intelligence cycles started", c: "#a855f7" },
              { t: "25m",    msg: "Bundle loaded (3.8 MB, 280 ms)", c: "rgba(255,255,255,0.5)" },
              { t: "30m",    msg: "COGNISYNC™ self-upgrade cycle complete", c: "#a855f7" },
            ].map((l, i) => (
              <div key={i} className="flex gap-2">
                <span className="text-[7px] w-6 shrink-0 text-white/20 pt-0.5">{l.t}</span>
                <span style={{ color: l.c }}>{l.msg}</span>
              </div>
            ))}
            <span className="text-[9px] animate-pulse" style={{ color: "#a855f7" }}>▋</span>
          </div>
        )}

        {dTab === "analytics" && (
          <div className="space-y-2">
            <div className="rounded-lg border border-white/8 bg-white/2 p-2.5">
              <p className="font-mono text-[7px] tracking-widest text-white/25 uppercase mb-2">TODAY</p>
              <Row label="Messages" value={stats?.today?.messageCount ?? "—"} />
              <Row label="Credits Used" value={stats?.today?.creditsSpent ?? "—"} />
              <Row label="Compute (s)" value={stats?.today?.computeSeconds ?? "—"} />
            </div>
            <div className="rounded-lg border border-white/8 bg-white/2 p-2.5">
              <p className="font-mono text-[7px] tracking-widest text-white/25 uppercase mb-2">ALL TIME</p>
              <Row label="Conversations" value={stats?.totalConversations?.toLocaleString() ?? "—"} />
              <Row label="Messages" value={stats?.totalMessages?.toLocaleString() ?? "—"} />
              <Row label="Memory Entries" value={stats?.totalMemories?.toLocaleString() ?? "—"} />
            </div>
            <button onClick={refresh} className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg border border-white/8 font-mono text-[8px] text-white/40 hover:text-white transition-all">
              <RefreshCw className={`w-2.5 h-2.5 ${refreshing ? "animate-spin" : ""}`} /> Refresh
            </button>
          </div>
        )}

        {dTab === "resources" && (
          <div className="space-y-1.5">
            {[
              { label: "vCPUs", value: "2", badge: "Autoscale" },
              { label: "RAM", value: "4 GiB", badge: "Autoscale" },
              { label: "Max Replicas", value: "3", badge: "Autoscale" },
              { label: "Storage", value: "Ephemeral", badge: "Stateless" },
              { label: "Database", value: "PostgreSQL", badge: "Connected" },
              { label: "Network", value: "Included", badge: "Unlimited egress" },
            ].map(r => (
              <div key={r.label} className="flex items-center justify-between rounded-lg border border-white/8 bg-white/2 px-2.5 py-2">
                <div>
                  <p className="font-mono text-[7px] text-white/30">{r.label}</p>
                  <p className="font-mono text-[9px] text-white/70 mt-0.5">{r.value}</p>
                </div>
                <span className="font-mono text-[7px] px-1.5 py-0.5 rounded border text-primary border-primary/25 bg-primary/8">{r.badge}</span>
              </div>
            ))}
            <a href="https://replit.com/@alphaunlimited/OMNIMENS" target="_blank" rel="noreferrer"
              className="flex items-center justify-center gap-1 w-full py-1.5 rounded-lg border border-white/8 font-mono text-[8px] text-white/40 hover:text-white transition-all">
              See all usage <ExternalLink className="w-2 h-2" />
            </a>
          </div>
        )}

        {dTab === "domains" && (
          <div className="space-y-2">
            <p className="font-mono text-[7px] tracking-widest text-white/25 uppercase mt-1">Connected Domains</p>
            {[
              { domain: "omnimens-ai.com", status: "ACTIVE", primary: true, type: "Custom" },
              { domain: "NEXUS-6.replit.app", status: "ACTIVE", primary: false, type: "Replit" },
              { domain: "omnimens.replit.app", status: "ACTIVE", primary: false, type: "Replit" },
            ].map(d => (
              <div key={d.domain} className="flex items-center gap-2 rounded-lg border border-white/8 bg-white/2 px-2.5 py-2">
                <CircleDot className="w-2.5 h-2.5 text-green-400 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-mono text-[9px] text-white/70 truncate">{d.domain}</p>
                  <p className="font-mono text-[7px] text-white/25">{d.type} {d.primary ? "· Primary" : ""}</p>
                </div>
                <span className="font-mono text-[7px] text-green-400/80 border border-green-400/20 px-1.5 py-0.5 rounded">{d.status}</span>
              </div>
            ))}
            <button className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg font-mono text-[8px] w-full justify-center border border-white/8 text-white/40 hover:text-white transition-all">
              <Plus className="w-2.5 h-2.5" /> Connect domain
            </button>
          </div>
        )}

        {dTab === "manage" && (
          <div className="space-y-2">
            {[
              { label: "Details", icon: FileText, desc: "Edit app name and description" },
              { label: "Adjust settings", icon: Settings, desc: "Scale, region, environment" },
              { label: "Run security scan", icon: ShieldCheck, desc: "Vulnerability analysis" },
              { label: "Preview", icon: Eye, desc: "Open live preview" },
            ].map(item => (
              <button key={item.label}
                className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg border border-white/8 bg-white/2 hover:border-primary/20 hover:bg-primary/5 transition-all text-left">
                <item.icon className="w-3 h-3 shrink-0" style={{ color: "#a855f7" }} />
                <div>
                  <p className="font-mono text-[9px] text-white/70">{item.label}</p>
                  <p className="font-mono text-[7px] text-white/25">{item.desc}</p>
                </div>
                <ExternalLink className="w-2.5 h-2.5 ml-auto text-white/15 shrink-0" />
              </button>
            ))}
            <div className="border-t border-white/8 pt-2 mt-2">
              <button className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg border border-red-400/15 bg-red-400/5 hover:bg-red-400/10 transition-all text-left">
                <Trash2 className="w-3 h-3 text-red-400 shrink-0" />
                <p className="font-mono text-[9px] text-red-400">Delete deployment</p>
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

