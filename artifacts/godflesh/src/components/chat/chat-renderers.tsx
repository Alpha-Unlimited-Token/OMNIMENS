/**
 * OMNIMENS — Proprietary AI Platform
 * Copyright © 2024–2026 Alpha Unlimited Technologies. All Rights Reserved.
 * Chat Renderers — CogniSync, MermaidDiagram, InlineChart, ToolResultCard
 */
import React, { useState, useEffect, useRef, useMemo } from "react";
import DOMPurify from "dompurify";
import { motion, AnimatePresence } from "framer-motion";
import {
  Cpu, FileCode, Film, GitBranch, Globe, GraduationCap,
  Loader2, Terminal, Zap, ChevronDown, Check, Download,
  ExternalLink, Image, Eye,
} from "lucide-react";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  AreaChart, Area, ScatterChart, Scatter,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import type { CogniSyncState, ToolResult } from "@/hooks/use-omnimens-chat";

// ── COGNISYNC™ Live Indicator ─────────────────────────────────────────────────
// Copyright © 2024–2026 Alpha Unlimited Technologies, LLC. All Rights Reserved.
export const COGNI_MODE_STYLES: Record<string, { color: string; bg: string; border: string; label: string }> = {
  creative:      { color: "text-pink-400",    bg: "bg-pink-400/8",    border: "border-pink-400/20",    label: "CREATIVE" },
  analytical:    { color: "text-cyan-400",    bg: "bg-cyan-400/8",    border: "border-cyan-400/20",    label: "ANALYTICAL" },
  urgent:        { color: "text-red-400",     bg: "bg-red-400/8",     border: "border-red-400/20",     label: "URGENT" },
  exploratory:   { color: "text-violet-400",  bg: "bg-violet-400/8",  border: "border-violet-400/20",  label: "EXPLORATORY" },
  directive:     { color: "text-yellow-400",  bg: "bg-yellow-400/8",  border: "border-yellow-400/20",  label: "DIRECTIVE" },
  conversational:{ color: "text-emerald-400", bg: "bg-emerald-400/8", border: "border-emerald-400/20", label: "CONVERSATIONAL" },
};

export function CogniSyncIndicator({ state }: { state: CogniSyncState | null }) {
  if (!state) return null;
  const style = COGNI_MODE_STYLES[state.primaryMode] || COGNI_MODE_STYLES.exploratory;
  return (
    <motion.div
      key={state.primaryMode}
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full border ${style.bg} ${style.border} cursor-default`}
      title={`COGNISYNC™ Active — ${state.summary}\nDomains: ${state.semanticDomains.join(", ") || "general"}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${style.color} animate-pulse`} style={{ background: "currentColor" }} />
      <span className={`text-[8px] font-mono tracking-[0.25em] ${style.color}`}>
        COGNISYNC™ · {style.label}
      </span>
    </motion.div>
  );
}

// ── Mermaid diagram renderer ────────────────────────────────────────────────────
export function sanitizeDiagramSVG(raw: string): string {
  return raw
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/\bon\w+\s*=\s*["'][^"']*["']/gi, "")
    .replace(/\bon\w+\s*=\s*[^\s>]*/gi, "")
    .replace(/\bhref\s*=\s*["']\s*javascript:[^"']*["']/gi, 'href="#"')
    .replace(/\bxlink:href\s*=\s*["']\s*javascript:[^"']*["']/gi, 'xlink:href="#"')
    .replace(/<use\b[^>]*\bhref\s*=\s*["'][^#][^"']*["'][^>]*>/gi, "")
    .replace(/<foreignObject\b[^<]*(?:(?!<\/foreignObject>)<[^<]*)*<\/foreignObject>/gi, "")
    .replace(/vbscript:/gi, "")
    .replace(/expression\s*\([^)]*\)/gi, "");
}

export function loadMermaidFromCDN(): Promise<any> {
  return new Promise((resolve, reject) => {
    if ((window as any).mermaid) { resolve((window as any).mermaid); return; }
    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.min.js";
    script.onload = () => resolve((window as any).mermaid);
    script.onerror = () => reject(new Error("Failed to load mermaid from CDN"));
    document.head.appendChild(script);
  });
}

export function MermaidDiagram({ code }: { code: string }) {
  const [svg, setSvg] = useState<string>("");
  const [err, setErr] = useState<string>("");
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const mermaid = await loadMermaidFromCDN();
        mermaid.initialize({ startOnLoad: false, theme: "dark", securityLevel: "antiscript" });
        const id = `mm-${Math.random().toString(36).slice(2)}`;
        const { svg: rendered } = await mermaid.render(id, code);
        if (!cancelled) setSvg(sanitizeDiagramSVG(rendered));
      } catch (e: any) {
        if (!cancelled) setErr(e.message || "Diagram error");
      }
    })();
    return () => { cancelled = true; };
  }, [code]);
  if (err) return <div className="text-red-400/70 text-xs font-mono p-2">[Diagram error: {err}]</div>;
  if (!svg) return <div className="flex items-center gap-2 text-primary/50 text-xs font-mono p-2"><Loader2 className="w-3 h-3 animate-spin" />Rendering diagram…</div>;
  return (
    <div
      className="mt-3 rounded-xl border border-white/10 bg-black/40 p-3 overflow-x-auto"
      dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(svg, { USE_PROFILES: { svg: true }, ADD_TAGS: ['foreignObject'] }) }}
    />
  );
}

// ── Inline chart renderer ──────────────────────────────────────────────────────
export const CHART_COLORS = ["#8b5cf6","#06b6d4","#10b981","#f59e0b","#ef4444","#ec4899","#6366f1","#84cc16"];

export function InlineChart({ spec }: { spec: any }) {
  const { type = "bar", title, data = [], xKey = "name", yKey = "value", color = "#8b5cf6" } = spec;
  const h = 220;
  if (!data.length) return null;
  return (
    <div className="mt-3 rounded-xl border border-white/10 bg-black/40 p-4">
      {title && <p className="text-xs font-mono text-white/50 mb-3 tracking-widest uppercase">{title}</p>}
      <ResponsiveContainer width="100%" height={h}>
        {type === "line" ? (
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
            <XAxis dataKey={xKey} tick={{ fill: "#ffffff60", fontSize: 10 }} />
            <YAxis tick={{ fill: "#ffffff60", fontSize: 10 }} />
            <Tooltip contentStyle={{ background: "#0a0a0a", border: "1px solid #ffffff15", borderRadius: 8, fontSize: 11 }} />
            <Line type="monotone" dataKey={yKey} stroke={color} strokeWidth={2} dot={{ r: 3, fill: color }} />
          </LineChart>
        ) : type === "pie" ? (
          <PieChart>
            <Pie data={data} dataKey={yKey} nameKey={xKey} cx="50%" cy="50%" outerRadius={80} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
              {data.map((_: any, i: number) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
            </Pie>
            <Tooltip contentStyle={{ background: "#0a0a0a", border: "1px solid #ffffff15", borderRadius: 8, fontSize: 11 }} />
            <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 10, color: "#ffffff80" }} />
          </PieChart>
        ) : type === "area" ? (
          <AreaChart data={data}>
            <defs><linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={color} stopOpacity={0.3} /><stop offset="95%" stopColor={color} stopOpacity={0} /></linearGradient></defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
            <XAxis dataKey={xKey} tick={{ fill: "#ffffff60", fontSize: 10 }} />
            <YAxis tick={{ fill: "#ffffff60", fontSize: 10 }} />
            <Tooltip contentStyle={{ background: "#0a0a0a", border: "1px solid #ffffff15", borderRadius: 8, fontSize: 11 }} />
            <Area type="monotone" dataKey={yKey} stroke={color} strokeWidth={2} fill="url(#areaGrad)" />
          </AreaChart>
        ) : (
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
            <XAxis dataKey={xKey} tick={{ fill: "#ffffff60", fontSize: 10 }} />
            <YAxis tick={{ fill: "#ffffff60", fontSize: 10 }} />
            <Tooltip contentStyle={{ background: "#0a0a0a", border: "1px solid #ffffff15", borderRadius: 8, fontSize: 11 }} />
            <Bar dataKey={yKey} fill={color} radius={[4, 4, 0, 0]}>
              {data.map((_: any, i: number) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
            </Bar>
          </BarChart>
        )}
      </ResponsiveContainer>
    </div>
  );
}

export function parseChartMarkers(text: string): { before: string; spec: any }[] {
  const parts: { before: string; spec: any }[] = [];
  const re = /\[CHART:\s*(\{[\s\S]*?\})\]/g;
  let last = 0, m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    try {
      const spec = JSON.parse(m[1]);
      parts.push({ before: text.slice(last, m.index), spec });
      last = m.index + m[0].length;
    } catch {}
  }
  if (last < text.length || parts.length === 0) parts.push({ before: text.slice(last), spec: null });
  return parts;
}

// ── Tool result cards ──────────────────────────────────────────────────────────
export function ToolResultCard({ tool }: { tool: ToolResult }) {
  if (tool.type === "qr") {
    return (
      <div className="mt-3 flex flex-col items-center gap-2 p-4 rounded-xl border border-primary/20 bg-black/40 w-fit">
        <p className="text-[9px] font-mono text-primary/50 tracking-widest uppercase">QR Code</p>
        {tool.dataUrl && <img src={tool.dataUrl} alt="QR Code" className="w-40 h-40 rounded-lg border border-white/10" />}
        {tool.text && <p className="text-[9px] font-mono text-white/40 text-center max-w-[160px] break-all">{tool.text}</p>}
      </div>
    );
  }
  if (tool.type === "color_palette" && tool.palette) {
    return (
      <div className="mt-3 p-4 rounded-xl border border-white/10 bg-black/40">
        <p className="text-[9px] font-mono text-white/40 mb-3 tracking-widest uppercase">Color Palette{tool.theme ? ` — ${tool.theme}` : ""}</p>
        <div className="flex flex-wrap gap-2">
          {tool.palette.map((c, i) => (
            <div key={i} className="flex flex-col items-center gap-1">
              <div className="w-10 h-10 rounded-lg border border-white/10 shadow-sm" style={{ background: c.hex }} />
              <span className="text-[8px] font-mono text-white/50">{c.hex}</span>
              <span className="text-[7px] font-mono text-white/30 text-center max-w-[44px]">{c.name}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  if (tool.type === "weather" || tool.type === "stock" || tool.type === "currency" || tool.type === "translate" || tool.type === "units") {
    const icons: Record<string, React.ReactNode> = {
      weather: <span className="text-base">🌤️</span>,
      stock: <BarChart2 className="w-3.5 h-3.5 text-emerald-400" />,
      currency: <span className="text-base">💱</span>,
      translate: <Globe className="w-3.5 h-3.5 text-blue-400" />,
      units: <Zap className="w-3.5 h-3.5 text-yellow-400" />,
    };
    const labels: Record<string, string> = {
      weather: `Weather${tool.location ? ` — ${tool.location}` : ""}`,
      stock: `Stock${tool.ticker ? ` — ${tool.ticker}` : ""}`,
      currency: `Currency${tool.from && tool.to ? ` — ${tool.from} → ${tool.to}` : ""}`,
      translate: `Translation${tool.language ? ` → ${tool.language}` : ""}`,
      units: "Unit Conversion",
    };
    return (
      <div className="mt-2 flex items-start gap-2 px-3 py-2.5 rounded-xl border border-white/10 bg-black/40 text-xs font-mono">
        <span className="shrink-0 mt-0.5">{icons[tool.type]}</span>
        <div>
          <p className="text-[9px] text-white/40 tracking-widest uppercase mb-1">{labels[tool.type]}</p>
          <p className="text-white/70 whitespace-pre-wrap text-[11px] leading-relaxed">{tool.result}</p>
        </div>
      </div>
    );
  }
  if (tool.type === "news" || tool.type === "academic" || tool.type === "video") {
    const icons: Record<string, React.ReactNode> = {
      news: <Globe className="w-3.5 h-3.5 text-blue-400" />,
      academic: <GraduationCap className="w-3.5 h-3.5 text-violet-400" />,
      video: <Film className="w-3.5 h-3.5 text-red-400" />,
    };
    const labels: Record<string, string> = {
      news: `News${tool.topic ? ` — ${tool.topic}` : ""}`,
      academic: `Academic Search${tool.query ? ` — ${tool.query}` : ""}`,
      video: `Video Analysis${tool.url ? ` — ${tool.url?.slice(0, 40)}…` : ""}`,
    };
    return (
      <div className="mt-2 flex items-start gap-2 px-3 py-2.5 rounded-xl border border-white/10 bg-black/40 text-xs font-mono">
        <span className="shrink-0 mt-0.5">{icons[tool.type]}</span>
        <div>
          <p className="text-[9px] text-white/40 tracking-widest uppercase mb-1">{labels[tool.type]}</p>
          <p className="text-white/70 whitespace-pre-wrap text-[11px] leading-relaxed max-h-40 overflow-y-auto omnimens-scrollbar">{tool.result}</p>
        </div>
      </div>
    );
  }

  // ── Developer Platform Tools ────────────────────────────────────────────────

  if (tool.type === "code_run") {
    const langColor: Record<string, string> = { python: "text-blue-400", python3: "text-blue-400", javascript: "text-yellow-400", node: "text-yellow-400", bash: "text-green-400", sh: "text-green-400" };
    const langLabel = tool.lang || "code";
    const isSuccess = tool.success !== false && tool.exit_code === 0;
    return (
      <div className="mt-3 rounded-xl border border-white/10 bg-black/50 overflow-hidden">
        <div className="flex items-center justify-between px-3 py-1.5 bg-white/4 border-b border-white/8">
          <div className="flex items-center gap-2">
            <Terminal className="w-3 h-3 text-primary/60" />
            <span className="text-[9px] font-mono tracking-widest uppercase text-white/40">Code Output</span>
            <span className={`text-[9px] font-mono font-bold ${langColor[langLabel] || "text-white/40"}`}>{langLabel.toUpperCase()}</span>
          </div>
          <div className="flex items-center gap-2">
            {tool.elapsed_sec != null && <span className="text-[8px] font-mono text-white/25">{tool.elapsed_sec}s</span>}
            <span className={`text-[8px] font-mono font-bold px-1.5 py-0.5 rounded ${isSuccess ? "bg-emerald-400/15 text-emerald-400" : "bg-red-400/15 text-red-400"}`}>{isSuccess ? "OK" : `EXIT ${tool.exit_code ?? 1}`}</span>
          </div>
        </div>
        {tool.stdout && (
          <pre className="px-3 py-2 text-[11px] font-mono text-emerald-300/80 whitespace-pre-wrap max-h-56 overflow-y-auto omnimens-scrollbar leading-relaxed">{tool.stdout}</pre>
        )}
        {tool.stderr && (
          <pre className="px-3 py-2 text-[10px] font-mono text-red-400/70 whitespace-pre-wrap max-h-32 overflow-y-auto omnimens-scrollbar border-t border-white/5">{tool.stderr}</pre>
        )}
        {tool.error && !tool.stdout && !tool.stderr && (
          <p className="px-3 py-2 text-[10px] font-mono text-red-400/70">{tool.error}</p>
        )}
        {/* Lint results */}
        {Array.isArray((tool as any).issues) && (tool as any).issues.length >= 0 && (
          <div className="px-3 py-2 border-t border-white/5">
            <p className="text-[9px] font-mono text-white/30 mb-1">{(tool as any).issues.length} issue{(tool as any).issues.length !== 1 ? "s" : ""} found</p>
            {(tool as any).issues.slice(0, 10).map((iss: any, i: number) => (
              <p key={i} className="text-[10px] font-mono text-yellow-400/70">L{iss.line}: [{iss.type}] {iss.message}</p>
            ))}
          </div>
        )}
        {/* Formatted code */}
        {(tool as any).formatted && (
          <pre className="px-3 py-2 text-[10px] font-mono text-white/60 whitespace-pre-wrap max-h-56 overflow-y-auto omnimens-scrollbar border-t border-white/5">{(tool as any).formatted}</pre>
        )}
      </div>
    );
  }

  if (tool.type === "web_fetch") {
    const ok = tool.success !== false;
    const mode = tool.op === "api_request" ? "API" : "WEB";
    return (
      <div className="mt-3 rounded-xl border border-white/10 bg-black/50 overflow-hidden">
        <div className="flex items-center justify-between px-3 py-1.5 bg-white/4 border-b border-white/8">
          <div className="flex items-center gap-2">
            <Globe className="w-3 h-3 text-sky-400/60" />
            <span className="text-[9px] font-mono tracking-widest uppercase text-white/40">{mode} Fetch</span>
            {tool.url && <span className="text-[9px] font-mono text-white/25 max-w-[200px] truncate">{tool.url}</span>}
          </div>
          <div className="flex items-center gap-1.5">
            {tool.elapsed_ms != null && <span className="text-[8px] font-mono text-white/25">{tool.elapsed_ms}ms</span>}
            {tool.status != null && <span className={`text-[8px] font-mono font-bold px-1.5 py-0.5 rounded ${ok ? "bg-emerald-400/15 text-emerald-400" : "bg-red-400/15 text-red-400"}`}>{tool.status}</span>}
          </div>
        </div>
        {tool.title && <p className="px-3 pt-2 text-[11px] font-mono text-white/70 font-semibold">{tool.title}</p>}
        {tool.description && <p className="px-3 pt-1 pb-1 text-[10px] font-mono text-white/40 italic">{tool.description}</p>}
        {tool.text && <p className="px-3 py-2 text-[11px] font-mono text-white/60 whitespace-pre-wrap max-h-48 overflow-y-auto omnimens-scrollbar leading-relaxed">{tool.text.slice(0, 1200)}{(tool.text.length > 1200) ? "…" : ""}</p>}
        {tool.json != null && <pre className="px-3 py-2 text-[10px] font-mono text-sky-300/70 whitespace-pre-wrap max-h-48 overflow-y-auto omnimens-scrollbar">{JSON.stringify(tool.json, null, 2).slice(0, 2000)}</pre>}
        {tool.links && tool.links.length > 0 && (
          <div className="px-3 py-2 border-t border-white/5 max-h-40 overflow-y-auto omnimens-scrollbar">
            <p className="text-[8px] font-mono text-white/25 mb-1">{tool.link_count} links found</p>
            {tool.links.slice(0, 8).map((l, i) => (
              <p key={i} className="text-[10px] font-mono text-sky-400/60 truncate">{l.text} — {l.url}</p>
            ))}
          </div>
        )}
        {tool.error && <p className="px-3 py-2 text-[10px] font-mono text-red-400/70">{tool.error}</p>}
        {tool.char_count != null && <p className="px-3 py-1 text-[8px] font-mono text-white/20">{tool.char_count.toLocaleString()} chars extracted</p>}
      </div>
    );
  }

  if (tool.type === "git") {
    return (
      <div className="mt-3 rounded-xl border border-white/10 bg-black/50 overflow-hidden">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-white/4 border-b border-white/8">
          <GitBranch className="w-3 h-3 text-orange-400/60" />
          <span className="text-[9px] font-mono tracking-widest uppercase text-white/40">Git</span>
          {tool.branch && <span className="text-[9px] font-mono text-orange-400/50">branch: {tool.branch}</span>}
          {(tool as any).url && <span className="text-[9px] font-mono text-white/25 max-w-[180px] truncate">{(tool as any).url}</span>}
        </div>
        {tool.error && <p className="px-3 py-2 text-[10px] font-mono text-red-400/70">{tool.error}</p>}
        {tool.file_count != null && <p className="px-3 pt-2 text-[10px] font-mono text-white/50">{tool.file_count} files</p>}
        {tool.recent_commits && tool.recent_commits.length > 0 && (
          <div className="px-3 py-2">
            <p className="text-[8px] font-mono text-white/25 mb-1">Recent commits</p>
            {tool.recent_commits.slice(0, 8).map((c, i) => <p key={i} className="text-[10px] font-mono text-white/50 truncate">{c}</p>)}
          </div>
        )}
        {tool.log && tool.log.length > 0 && (
          <div className="px-3 py-2 border-t border-white/5">
            <p className="text-[8px] font-mono text-white/25 mb-1">Log</p>
            {tool.log.slice(0, 10).map((l, i) => <p key={i} className="text-[10px] font-mono text-white/50 truncate">{l}</p>)}
          </div>
        )}
        {tool.diff && (
          <pre className="px-3 py-2 text-[9px] font-mono text-white/50 whitespace-pre-wrap max-h-48 overflow-y-auto omnimens-scrollbar border-t border-white/5">{tool.diff.slice(0, 2000)}</pre>
        )}
        {tool.stat && <p className="px-3 py-2 text-[10px] font-mono text-white/40 border-t border-white/5">{tool.stat}</p>}
      </div>
    );
  }

  if (tool.type === "sys_info") {
    return (
      <div className="mt-3 rounded-xl border border-white/10 bg-black/50 overflow-hidden">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-white/4 border-b border-white/8">
          <Cpu className="w-3 h-3 text-violet-400/60" />
          <span className="text-[9px] font-mono tracking-widest uppercase text-white/40">System Info</span>
          {tool.scope && <span className="text-[9px] font-mono text-violet-400/50">{tool.scope}</span>}
        </div>
        <div className="px-3 py-2 grid grid-cols-2 gap-2 text-[10px] font-mono">
          {tool.cpu && (
            <div>
              <p className="text-[8px] text-white/30 mb-1 uppercase tracking-wider">CPU</p>
              <p className="text-white/60">{tool.cpu.count_logical} cores · {tool.cpu.percent}% · {tool.cpu.freq_mhz ? `${Math.round(tool.cpu.freq_mhz)}MHz` : ""}</p>
            </div>
          )}
          {tool.memory && (
            <div>
              <p className="text-[8px] text-white/30 mb-1 uppercase tracking-wider">Memory</p>
              <p className="text-white/60">{tool.memory.used_gb}GB / {tool.memory.total_gb}GB ({tool.memory.percent}%)</p>
            </div>
          )}
          {tool.disk && (
            <div>
              <p className="text-[8px] text-white/30 mb-1 uppercase tracking-wider">Disk</p>
              <p className="text-white/60">{tool.disk.used_gb}GB / {tool.disk.total_gb}GB ({tool.disk.percent}%)</p>
            </div>
          )}
          {tool.platform && (
            <div>
              <p className="text-[8px] text-white/30 mb-1 uppercase tracking-wider">Platform</p>
              <p className="text-white/60">{tool.platform.system} · Python {tool.platform.python} · Up {tool.platform.uptime_hours}h</p>
            </div>
          )}
        </div>
        {tool.stdout && <pre className="px-3 py-2 text-[10px] font-mono text-white/60 whitespace-pre-wrap max-h-40 overflow-y-auto omnimens-scrollbar border-t border-white/5">{tool.stdout}</pre>}
        {tool.processes && tool.processes.length > 0 && (
          <div className="px-3 py-2 border-t border-white/5">
            <p className="text-[8px] font-mono text-white/25 mb-1">Top processes by memory</p>
            {tool.processes.slice(0, 5).map((p: any, i: number) => (
              <p key={i} className="text-[10px] font-mono text-white/40">{p.name} · {p.mem_mb}MB · {p.status}</p>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (tool.type === "file_op") {
    const opLabel: Record<string, string> = { diff: "Text Diff", zip_create: "ZIP Created", zip_list: "ZIP Contents", convert: "Format Converted", validate: "JSON Validated", search: "File Search" };
    return (
      <div className="mt-3 rounded-xl border border-white/10 bg-black/50 overflow-hidden">
        <div className="flex items-center justify-between px-3 py-1.5 bg-white/4 border-b border-white/8">
          <div className="flex items-center gap-2">
            <FileCode className="w-3 h-3 text-amber-400/60" />
            <span className="text-[9px] font-mono tracking-widest uppercase text-white/40">{opLabel[tool.op || ""] || "File Op"}</span>
          </div>
          {tool.valid != null && (
            <span className={`text-[8px] font-mono font-bold px-1.5 py-0.5 rounded ${tool.valid ? "bg-emerald-400/15 text-emerald-400" : "bg-red-400/15 text-red-400"}`}>{tool.valid ? "VALID" : "INVALID"}</span>
          )}
        </div>
        {tool.diff && (
          <pre className="px-3 py-2 text-[9px] font-mono whitespace-pre-wrap max-h-56 overflow-y-auto omnimens-scrollbar leading-relaxed">
            {tool.diff.split("\n").map((l, i) => (
              <span key={i} className={l.startsWith("+") && !l.startsWith("+++") ? "text-emerald-400/70 block" : l.startsWith("-") && !l.startsWith("---") ? "text-red-400/70 block" : l.startsWith("@@") ? "text-sky-400/60 block" : "text-white/40 block"}>{l}</span>
            ))}
          </pre>
        )}
        {tool.output && <pre className="px-3 py-2 text-[10px] font-mono text-white/60 whitespace-pre-wrap max-h-48 overflow-y-auto omnimens-scrollbar">{tool.output.slice(0, 3000)}</pre>}
        {tool.error && <p className="px-3 py-2 text-[10px] font-mono text-red-400/70">{tool.error}</p>}
        {tool.changed_lines != null && <p className="px-3 py-1 text-[8px] font-mono text-white/25">{tool.changed_lines} lines changed</p>}
        {tool.count != null && tool.op === "search" && <p className="px-3 py-1 text-[8px] font-mono text-white/25">{tool.count} files found</p>}
        {tool.members && tool.op === "zip_list" && (
          <div className="px-3 py-2 border-t border-white/5 max-h-40 overflow-y-auto omnimens-scrollbar">
            {tool.members.slice(0, 15).map((m: any, i: number) => (
              <p key={i} className="text-[10px] font-mono text-white/50 truncate">{m.name} {m.size != null ? `(${(m.size/1024).toFixed(1)}KB)` : ""}</p>
            ))}
          </div>
        )}
      </div>
    );
  }

  return null;
}

