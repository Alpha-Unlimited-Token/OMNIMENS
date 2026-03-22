/**
 * OMNIMENS Mobile IDE
 * Replit-style mobile developer interface with violet outlines
 * © 2024–2026 Alpha Unlimited Technologies. All Rights Reserved.
 */
import React, { useState, useEffect, useCallback } from "react";
import {
  Globe, Database, Lock, Users, FolderOpen, MessageSquare,
  RefreshCw, ChevronRight, Eye, EyeOff, Copy, Check,
  ArrowLeft, MoreVertical, ExternalLink, Play, Shield,
  BarChart2, Server, Zap, AlertTriangle, Search, Plus,
  Table2, Layers, KeyRound, Activity, X, Settings, Clock
} from "lucide-react";

const V = "#a855f7";        // violet primary
const VD = "rgba(168,85,247,0.12)"; // violet dim bg
const BORDER = "rgba(168,85,247,0.25)";
const BG = "#0a0a12";
const CARD = "#111827";
const BORDER_MID = "rgba(255,255,255,0.08)";
const TXT = "rgba(255,255,255,0.85)";
const TXT_MID = "rgba(255,255,255,0.5)";
const TXT_FAINT = "rgba(255,255,255,0.3)";

type Tab = "chat" | "files" | "deploy" | "database" | "secrets" | "auth";

function timeAgo(iso: string | null | undefined): string {
  if (!iso) return "never";
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

// ── Shared UI atoms ───────────────────────────────────────────────────────────

function SectionHeader({ title, sub, onRefresh }: { title: string; sub?: string; onRefresh?: () => void }) {
  return (
    <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: BORDER_MID }}>
      <div>
        <p className="font-mono text-sm font-bold" style={{ color: TXT }}>{title}</p>
        {sub && <p className="font-mono text-[10px] mt-0.5" style={{ color: TXT_FAINT }}>{sub}</p>}
      </div>
      {onRefresh && (
        <button onClick={onRefresh} className="p-1.5 rounded-lg transition-all" style={{ color: TXT_MID }}>
          <RefreshCw className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

function Pill({ label, color = V }: { label: string; color?: string }) {
  return (
    <span className="font-mono text-[9px] px-2 py-0.5 rounded-full border" style={{ color, borderColor: `${color}40`, background: `${color}15` }}>
      {label}
    </span>
  );
}

function Row({ label, value, action }: { label: string; value?: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-3 border-b" style={{ borderColor: BORDER_MID }}>
      <span className="font-mono text-xs" style={{ color: TXT_MID }}>{label}</span>
      <div className="flex items-center gap-2">
        {value && <span className="font-mono text-xs" style={{ color: TXT }}>{value}</span>}
        {action}
      </div>
    </div>
  );
}

// ── Deploy / Publishing ───────────────────────────────────────────────────────

function DeployView() {
  const [deployTab, setDeployTab] = useState<"overview" | "logs" | "analytics" | "resources" | "domains" | "manage">("overview");
  const [stats, setStats] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);
  const refresh = () => { setRefreshing(true); fetch("/api/omnimens/usage-stats").then(r=>r.ok?r.json():null).then(d=>{setStats(d);setRefreshing(false);}).catch(()=>setRefreshing(false)); };

  useEffect(() => {
    fetch("/api/omnimens/usage-stats")
      .then(r => r.ok ? r.json() : null)
      .then(setStats).catch(() => {});
  }, []);

  const tabs = ["overview", "logs", "analytics", "resources", "domains", "manage"] as const;

  return (
    <div className="flex flex-col h-full">
      <SectionHeader title="Publishing" />

      {/* Tabs */}
      <div className="flex border-b overflow-x-auto" style={{ borderColor: BORDER_MID }}>
        {tabs.map(t => (
          <button
            key={t}
            onClick={() => setDeployTab(t)}
            className="shrink-0 px-4 py-2.5 font-mono text-xs capitalize border-b-2 transition-all"
            style={{ color: deployTab === t ? V : TXT_FAINT, borderColor: deployTab === t ? V : "transparent" }}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto">
        {deployTab === "overview" && (
          <div className="p-4 space-y-4">
            {/* Action buttons */}
            <div className="flex gap-2 flex-wrap">
              <a href="https://omnimens-ai.com/" target="_blank" rel="noreferrer"
                className="flex items-center gap-2 px-4 py-2 rounded-xl font-mono text-xs font-bold transition-all"
                style={{ background: VD, color: V, border: `1px solid ${BORDER}` }}>
                <Play className="w-3.5 h-3.5" /> View Live
              </a>
              <button className="flex items-center gap-2 px-4 py-2 rounded-xl font-mono text-xs transition-all"
                style={{ background: CARD, color: TXT_MID, border: `1px solid ${BORDER_MID}` }}>
                <RefreshCw className="w-3.5 h-3.5" /> Republish
              </button>
              <button className="flex items-center gap-2 px-4 py-2 rounded-xl font-mono text-xs transition-all"
                style={{ background: CARD, color: TXT_MID, border: `1px solid ${BORDER_MID}` }}>
                <Shield className="w-3.5 h-3.5" /> Security scan
              </button>
            </div>

            {/* Production card */}
            <div className="rounded-2xl border p-4" style={{ borderColor: BORDER, background: VD }}>
              <p className="font-mono text-[10px] tracking-widest mb-3" style={{ color: TXT_FAINT }}>PRODUCTION</p>
              <div className="space-y-0">
                <Row label="Status" value={
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-green-400" style={{ boxShadow: "0 0 6px #4ade80" }} />
                    Live
                  </span>
                } />
                <Row label="Visibility" value="Public" />
                <Row label="Type" value="Autoscale (2 vCPU / 4 GiB)" />
                <Row label="Database" value="PostgreSQL — Connected" />
              </div>
            </div>

            {/* Deployments */}
            <div>
              <p className="font-mono text-[10px] tracking-widest mb-2 px-1" style={{ color: TXT_FAINT }}>DEPLOYED APPS</p>
              {[
                { name: "GODFLESH", url: "omnimens-ai.com/", type: "Website" },
                { name: "Super AI Lab", url: "omnimens.replit.app", type: "Website" },
              ].map(app => (
                <a key={app.name} href={`https://${app.url}`} target="_blank" rel="noreferrer"
                  className="flex items-center gap-3 p-3 rounded-xl border mb-2 transition-all active:scale-[0.98]"
                  style={{ borderColor: BORDER_MID, background: CARD }}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: VD, border: `1px solid ${BORDER}` }}>
                    <Globe className="w-5 h-5" style={{ color: V }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-mono text-xs font-bold truncate" style={{ color: TXT }}>{app.name}</p>
                    <p className="font-mono text-[10px] truncate mt-0.5" style={{ color: V }}>{app.url}</p>
                  </div>
                  <ExternalLink className="w-4 h-4 shrink-0" style={{ color: TXT_FAINT }} />
                </a>
              ))}
            </div>
          </div>
        )}

        {deployTab === "logs" && (
          <div className="p-4">
            <div className="rounded-2xl border p-4 font-mono" style={{ borderColor: BORDER_MID, background: CARD }}>
              <p className="text-[10px] mb-3" style={{ color: TXT_FAINT }}>DEPLOYMENT LOG</p>
              {[
                { time: "now", msg: "OMNIMENS API Server running on port 3000", c: "#4ade80" },
                { time: "2m ago", msg: "Health check passed — all systems operational", c: "#4ade80" },
                { time: "5m ago", msg: "Static assets served — 0 errors", c: TXT_MID },
                { time: "10m ago", msg: "DB connection pool established (max: 10)", c: TXT_MID },
                { time: "15m ago", msg: "Stripe webhook endpoint registered", c: TXT_MID },
                { time: "20m ago", msg: "OMNIMENS intelligence cycles started", c: V },
                { time: "25m ago", msg: "Application bundle loaded successfully", c: TXT_MID },
              ].map((l, i) => (
                <div key={i} className="flex gap-3 py-1.5 border-b" style={{ borderColor: BORDER_MID }}>
                  <span className="text-[9px] shrink-0 pt-0.5 w-12" style={{ color: TXT_FAINT }}>{l.time}</span>
                  <span className="text-[10px]" style={{ color: l.c }}>{l.msg}</span>
                </div>
              ))}
              <p className="text-[10px] mt-3 animate-pulse" style={{ color: V }}>▋</p>
            </div>
          </div>
        )}

        {deployTab === "analytics" && (
          <div className="p-4 space-y-3">
            <div className="rounded-2xl border p-4" style={{ borderColor: BORDER_MID, background: CARD }}>
              <p className="font-mono text-[10px] tracking-widest mb-3" style={{ color: TXT_FAINT }}>TODAY</p>
              <div className="space-y-0">
                <Row label="Messages" value={stats?.today?.messageCount ?? "—"} />
                <Row label="Credits Used" value={stats?.today?.creditsSpent ?? "—"} />
              </div>
            </div>
            <div className="rounded-2xl border p-4" style={{ borderColor: BORDER_MID, background: CARD }}>
              <p className="font-mono text-[10px] tracking-widest mb-3" style={{ color: TXT_FAINT }}>ALL TIME</p>
              <div className="space-y-0">
                <Row label="Conversations" value={stats?.totalConversations?.toLocaleString() ?? "—"} />
                <Row label="Messages" value={stats?.totalMessages?.toLocaleString() ?? "—"} />
                <Row label="Memory Entries" value={stats?.totalMemories?.toLocaleString() ?? "—"} />
              </div>
            </div>
          </div>
        )}

        {deployTab === "resources" && (
          <div className="p-4 space-y-3">
            {[
              { label: "vCPUs", value: "2", detail: "Autoscale" },
              { label: "RAM", value: "4 GiB", detail: "Autoscale" },
              { label: "Max Replicas", value: "3", detail: "Autoscale" },
              { label: "Storage", value: "Ephemeral", detail: "Stateless" },
              { label: "Database", value: "PostgreSQL", detail: "Connected" },
            ].map(r => (
              <div key={r.label} className="flex items-center justify-between p-4 rounded-2xl border" style={{ borderColor: BORDER_MID, background: CARD }}>
                <div>
                  <p className="font-mono text-xs" style={{ color: TXT_FAINT }}>{r.label}</p>
                  <p className="font-mono text-sm font-bold mt-0.5" style={{ color: TXT }}>{r.value}</p>
                </div>
                <Pill label={r.detail} />
              </div>
            ))}
          </div>
        )}

        {deployTab === "domains" && (
          <div className="p-4 space-y-3">
            <p className="font-mono text-[10px] tracking-widest px-1" style={{ color: TXT_FAINT }}>CONNECTED DOMAINS</p>
            {[
              { domain: "omnimens-ai.com", type: "Custom", primary: true, status: "Active" },
              { domain: "NEXUS-6.replit.app", type: "Replit", primary: false, status: "Active" },
              { domain: "omnimens.replit.app", type: "Replit", primary: false, status: "Active" },
            ].map(d => (
              <div key={d.domain} className="flex items-center gap-3 p-4 rounded-2xl border" style={{ borderColor: BORDER_MID, background: CARD }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: VD, border: `1px solid ${BORDER}` }}>
                  <Globe className="w-5 h-5" style={{ color: "#4ade80" }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-mono text-sm font-bold truncate" style={{ color: TXT }}>{d.domain}</p>
                  <p className="font-mono text-xs mt-0.5" style={{ color: TXT_FAINT }}>{d.type}{d.primary ? " · Primary" : ""}</p>
                </div>
                <Pill label={d.status} />
              </div>
            ))}
            <button className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border font-mono text-xs transition-all active:scale-[0.98]"
              style={{ borderColor: BORDER, color: V, background: VD }}>
              + Connect domain
            </button>
          </div>
        )}

        {deployTab === "manage" && (
          <div className="p-4 space-y-3">
            <p className="font-mono text-[10px] tracking-widest px-1" style={{ color: TXT_FAINT }}>MANAGEMENT</p>
            {[
              { label: "Preview", desc: "Open live preview of your app", icon: Eye },
              { label: "Adjust settings", desc: "Scale, region, environment vars", icon: Settings },
              { label: "Run security scan", desc: "Scan for vulnerabilities", icon: Shield },
              { label: "Deployment history", desc: "View all past deployments", icon: Clock },
            ].map(item => (
              <button key={item.label}
                className="w-full flex items-center gap-3 p-4 rounded-2xl border text-left transition-all active:scale-[0.98]"
                style={{ borderColor: BORDER_MID, background: CARD }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: VD, border: `1px solid ${BORDER}` }}>
                  <item.icon className="w-5 h-5" style={{ color: V }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-mono text-sm font-bold" style={{ color: TXT }}>{item.label}</p>
                  <p className="font-mono text-xs mt-0.5" style={{ color: TXT_FAINT }}>{item.desc}</p>
                </div>
                <ExternalLink className="w-4 h-4 shrink-0" style={{ color: TXT_FAINT }} />
              </button>
            ))}
            <div className="pt-1">
              <button className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border font-mono text-sm font-bold transition-all active:scale-[0.98]"
                style={{ borderColor: "rgba(248,113,113,0.25)", color: "#f87171", background: "rgba(248,113,113,0.06)" }}>
                Delete deployment
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

// ── Files / Library ───────────────────────────────────────────────────────────

function FilesView({ onNavigate }: { onNavigate: (tab: Tab) => void }) {
  const [search, setSearch] = useState("");
  const apps = [
    { name: "GODFLESH", type: "Website", url: "omnimens-ai.com/" },
    { name: "Super AI Lab", type: "Website", url: "omnimens.replit.app" },
  ].filter(a => a.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="flex flex-col h-full">
      <SectionHeader title="Library" />

      {/* Search + New */}
      <div className="flex gap-2 p-3 border-b" style={{ borderColor: BORDER_MID }}>
        <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-xl border" style={{ borderColor: BORDER_MID, background: CARD }}>
          <Search className="w-3.5 h-3.5 shrink-0" style={{ color: TXT_FAINT }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search..."
            className="flex-1 bg-transparent font-mono text-xs outline-none"
            style={{ color: TXT }}
          />
        </div>
        <a href="/chat" className="flex items-center gap-1 px-3 py-2 rounded-xl font-mono text-xs font-bold transition-all"
          style={{ background: VD, color: V, border: `1px solid ${BORDER}` }}>
          <Plus className="w-3.5 h-3.5" /> New
        </a>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <p className="font-mono text-[10px] tracking-widest mb-3 px-1" style={{ color: TXT_FAINT }}>APPS</p>
        <div className="space-y-2 mb-6">
          {apps.map(app => (
            <a key={app.name} href={`https://${app.url}`} target="_blank" rel="noreferrer"
              className="flex items-center gap-3 p-3 rounded-2xl border transition-all active:scale-[0.98]"
              style={{ borderColor: BORDER_MID, background: CARD }}>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: VD, border: `1px solid ${BORDER}` }}>
                <Globe className="w-6 h-6" style={{ color: V }} />
              </div>
              <div className="flex-1">
                <p className="font-mono text-sm font-bold" style={{ color: TXT }}>{app.name}</p>
                <p className="font-mono text-[10px] mt-0.5" style={{ color: TXT_FAINT }}>{app.type}</p>
              </div>
              <MoreVertical className="w-4 h-4" style={{ color: TXT_FAINT }} />
            </a>
          ))}
        </div>

        <p className="font-mono text-[10px] tracking-widest mb-3 px-1" style={{ color: TXT_FAINT }}>QUICK TOOLS</p>
        <div className="grid grid-cols-2 gap-2">
          {[
            { label: "Secrets", icon: Lock, tab: "secrets" as Tab },
            { label: "Database", icon: Database, tab: "database" as Tab },
            { label: "Auth", icon: Users, tab: "auth" as Tab },
            { label: "Deploy", icon: Globe, tab: "deploy" as Tab },
          ].map(({ label, icon: Icon, tab }) => (
            <button key={label} onClick={() => onNavigate(tab)}
              className="flex flex-col items-center gap-2 py-4 rounded-2xl border transition-all active:scale-[0.97]"
              style={{ borderColor: BORDER_MID, background: CARD }}>
              <Icon className="w-5 h-5" style={{ color: V }} />
              <span className="font-mono text-xs" style={{ color: TXT_MID }}>{label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Database Browser ──────────────────────────────────────────────────────────

function DatabaseView() {
  const [tables, setTables] = useState<{ table_name: string; row_count: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<string | null>(null);
  const [tableData, setTableData] = useState<{ columns: string[]; rows: any[]; total: number } | null>(null);
  const [tableLoading, setTableLoading] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    fetch("/api/omnimens/admin/tables")
      .then(r => r.ok ? r.json() : { tables: [] })
      .then(d => { setTables(d.tables || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const openTable = (name: string) => {
    setSelected(name);
    setTableLoading(true);
    setTableData(null);
    fetch(`/api/omnimens/admin/table/${name}`)
      .then(r => r.ok ? r.json() : null)
      .then(d => { setTableData(d); setTableLoading(false); })
      .catch(() => setTableLoading(false));
  };

  if (selected) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center gap-2 px-4 py-3 border-b" style={{ borderColor: BORDER_MID }}>
          <button onClick={() => { setSelected(null); setTableData(null); }} className="p-1" style={{ color: TXT_MID }}>
            <ArrowLeft className="w-4 h-4" />
          </button>
          <Database className="w-4 h-4" style={{ color: V }} />
          <span className="font-mono text-sm font-bold flex-1 truncate" style={{ color: TXT }}>{selected}</span>
          {tableData && <span className="font-mono text-[10px]" style={{ color: TXT_FAINT }}>{tableData.total} rows</span>}
        </div>
        <div className="flex-1 overflow-auto">
          {tableLoading ? (
            <div className="flex items-center justify-center h-32">
              <RefreshCw className="w-5 h-5 animate-spin" style={{ color: TXT_FAINT }} />
            </div>
          ) : tableData && tableData.rows.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full font-mono text-[10px] border-collapse">
                <thead>
                  <tr style={{ background: CARD }}>
                    {tableData.columns.map(col => (
                      <th key={col} className="text-left px-3 py-2 border-b border-r whitespace-nowrap"
                        style={{ borderColor: BORDER_MID, color: V }}>
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {tableData.rows.map((row: any, i) => (
                    <tr key={i} className="border-b" style={{ borderColor: BORDER_MID }}>
                      {tableData.columns.map(col => (
                        <td key={col} className="px-3 py-2 border-r max-w-[160px] truncate"
                          style={{ borderColor: BORDER_MID, color: TXT_MID }}>
                          {row[col] == null ? <span style={{ color: TXT_FAINT }}>null</span> : String(row[col]).slice(0, 60)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex items-center justify-center h-32">
              <p className="font-mono text-xs" style={{ color: TXT_FAINT }}>No rows</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <SectionHeader title="Database" sub="Production Database" onRefresh={load} />

      {/* Breadcrumb */}
      <div className="flex items-center gap-1 px-4 py-2 border-b text-[10px] font-mono" style={{ borderColor: BORDER_MID, color: TXT_FAINT }}>
        <span>All Databases</span>
        <ChevronRight className="w-3 h-3" />
        <span style={{ color: V }}>Production Database</span>
      </div>

      {/* Sub-tabs */}
      <div className="flex border-b" style={{ borderColor: BORDER_MID }}>
        {["Overview", "My Data", "Settings"].map((t, i) => (
          <button key={t} className="px-4 py-2 font-mono text-xs border-b-2 transition-all"
            style={{ color: i === 0 ? V : TXT_FAINT, borderColor: i === 0 ? V : "transparent" }}>
            {t}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <p className="font-mono text-sm font-bold mb-4" style={{ color: TXT }}>Tables</p>
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <RefreshCw className="w-5 h-5 animate-spin" style={{ color: TXT_FAINT }} />
          </div>
        ) : (
          <div className="space-y-2">
            {tables.map(t => (
              <button key={t.table_name} onClick={() => openTable(t.table_name)}
                className="w-full flex items-center gap-3 p-4 rounded-2xl border text-left transition-all active:scale-[0.98]"
                style={{ borderColor: BORDER_MID, background: CARD }}>
                <Table2 className="w-5 h-5 shrink-0" style={{ color: V }} />
                <div className="flex-1 min-w-0">
                  <p className="font-mono text-xs font-bold truncate" style={{ color: TXT }}>{t.table_name}</p>
                  <p className="font-mono text-[10px] mt-0.5" style={{ color: TXT_FAINT }}>{t.row_count} rows</p>
                </div>
                <ChevronRight className="w-4 h-4 shrink-0" style={{ color: TXT_FAINT }} />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Secrets / Env Vars ────────────────────────────────────────────────────────

function SecretsView() {
  const [secrets, setSecrets] = useState<{ key: string; set: boolean; linked: boolean }[]>([]);
  const [loading, setLoading] = useState(true);
  const [revealed, setRevealed] = useState<Set<string>>(new Set());
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/omnimens/admin/env-keys")
      .then(r => r.ok ? r.json() : { secrets: [] })
      .then(d => { setSecrets(d.secrets || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const toggle = (key: string) => setRevealed(s => { const n = new Set(s); n.has(key) ? n.delete(key) : n.add(key); return n; });
  const copy = (key: string) => {
    navigator.clipboard.writeText("••••••••").catch(() => {});
    setCopied(key);
    setTimeout(() => setCopied(null), 1500);
  };

  const configured = secrets.filter(s => s.set);
  const unconfigured = secrets.filter(s => !s.set);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: BORDER_MID }}>
        <p className="font-mono text-sm font-bold" style={{ color: TXT }}>Secrets</p>
        <div className="flex items-center gap-2">
          <button className="font-mono text-[10px] px-2 py-1 rounded-lg border transition-all"
            style={{ color: TXT_MID, borderColor: BORDER_MID }}>More</button>
          <button className="font-mono text-[10px] px-3 py-1 rounded-lg font-bold transition-all"
            style={{ background: VD, color: V, border: `1px solid ${BORDER}` }}>+ New Secret</button>
        </div>
      </div>

      {/* Info banner */}
      <div className="mx-4 mt-3 p-3 rounded-xl border text-[10px] font-mono flex gap-2"
        style={{ borderColor: "rgba(96,165,250,0.3)", background: "rgba(96,165,250,0.05)", color: "rgba(147,197,253,0.9)" }}>
        <span className="shrink-0">ℹ</span>
        <span>Secrets are accessible to anyone with access to this App. To restrict access, update App invite permissions.</span>
      </div>

      <div className="flex-1 overflow-y-auto mt-3">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <RefreshCw className="w-5 h-5 animate-spin" style={{ color: TXT_FAINT }} />
          </div>
        ) : (
          <>
            {configured.map(s => (
              <div key={s.key} className="flex items-center gap-2 px-4 py-3 border-b" style={{ borderColor: BORDER_MID }}>
                <KeyRound className="w-4 h-4 shrink-0" style={{ color: TXT_FAINT }} />
                <span className="font-mono text-xs flex-1 truncate" style={{ color: TXT }}>{s.key}</span>
                {s.linked && <span className="font-mono text-[9px] px-1.5 rounded" style={{ color: V, background: VD }}>linked</span>}
                <button onClick={() => copy(s.key)} className="p-1.5" style={{ color: TXT_FAINT }}>
                  {copied === s.key ? <Check className="w-3.5 h-3.5" style={{ color: "#4ade80" }} /> : <Copy className="w-3.5 h-3.5" />}
                </button>
                <button onClick={() => toggle(s.key)} className="p-1.5" style={{ color: TXT_FAINT }}>
                  {revealed.has(s.key) ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                </button>
                <div className="font-mono text-xs min-w-[72px]" style={{ color: TXT_MID }}>
                  {revealed.has(s.key) ? <span style={{ color: V }}>SET</span> : "••••••••"}
                </div>
                <button className="p-1.5" style={{ color: TXT_FAINT }}>
                  <MoreVertical className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}

            {unconfigured.length > 0 && (
              <>
                <p className="px-4 py-2 font-mono text-[10px] tracking-widest" style={{ color: TXT_FAINT }}>NOT SET</p>
                {unconfigured.map(s => (
                  <div key={s.key} className="flex items-center gap-2 px-4 py-3 border-b opacity-40" style={{ borderColor: BORDER_MID }}>
                    <KeyRound className="w-4 h-4 shrink-0" style={{ color: TXT_FAINT }} />
                    <span className="font-mono text-xs flex-1 truncate" style={{ color: TXT_MID }}>{s.key}</span>
                    <AlertTriangle className="w-3.5 h-3.5" style={{ color: "#f59e0b" }} />
                  </div>
                ))}
              </>
            )}

            <div className="px-4 py-3 mt-2">
              <p className="font-mono text-xs font-bold mb-3" style={{ color: TXT }}>Configurations</p>
              <p className="font-mono text-[10px]" style={{ color: TXT_FAINT }}>
                Configurations are similar to secrets, but for non-sensitive information. Values can differ between your published app and Replit.
              </p>
              {[
                { key: "GOOGLE_CLIENT_ID", val: "66165770155-u1kvu..." },
                { key: "STRIPE_PRICE_IGNITE", val: "price_1TC5fVIo..." },
                { key: "STRIPE_PRICE_DEV", val: "price_1TC5fVIo..." },
                { key: "STRIPE_PRICE_ULTRA", val: "price_1TC5fWIo..." },
              ].map(c => (
                <div key={c.key} className="flex items-center gap-2 py-2.5 border-b" style={{ borderColor: BORDER_MID }}>
                  <span className="font-mono text-[10px] flex-1 truncate font-bold" style={{ color: TXT_MID }}>{c.key}</span>
                  <span className="font-mono text-[10px]" style={{ color: TXT_FAINT }}>{c.val}</span>
                  <button className="p-1" style={{ color: TXT_FAINT }}><MoreVertical className="w-3.5 h-3.5" /></button>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ── Auth / Users ──────────────────────────────────────────────────────────────

function AuthView() {
  const [authTab, setAuthTab] = useState<"users" | "configure">("users");
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/omnimens/admin/users")
      .then(r => r.ok ? r.json() : { users: [] })
      .then(d => { setUsers(d.users || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const filtered = users.filter(u =>
    (u.username || "").toLowerCase().includes(search.toLowerCase()) ||
    (u.email || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full">
      <SectionHeader title="Auth" />

      {/* Sub-tabs */}
      <div className="flex border-b" style={{ borderColor: BORDER_MID }}>
        {(["users", "configure"] as const).map(t => (
          <button key={t} onClick={() => setAuthTab(t)}
            className="px-5 py-2.5 font-mono text-xs capitalize border-b-2 transition-all flex items-center gap-1.5"
            style={{ color: authTab === t ? V : TXT_FAINT, borderColor: authTab === t ? V : "transparent" }}>
            {t === "users" ? <Users className="w-3.5 h-3.5" /> : <Shield className="w-3.5 h-3.5" />}
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {authTab === "users" && (
        <div className="flex flex-col flex-1 overflow-hidden">
          <div className="p-4">
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl border" style={{ borderColor: BORDER_MID, background: CARD }}>
              <Search className="w-3.5 h-3.5 shrink-0" style={{ color: TXT_FAINT }} />
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search users"
                className="flex-1 bg-transparent font-mono text-xs outline-none" style={{ color: TXT }} />
            </div>
          </div>

          {/* Table header */}
          <div className="flex px-4 pb-2 border-b" style={{ borderColor: BORDER_MID }}>
            <span className="font-mono text-[9px] tracking-wider flex-1" style={{ color: TXT_FAINT }}>USER ID</span>
            <span className="font-mono text-[9px] tracking-wider w-28" style={{ color: TXT_FAINT }}>NAME</span>
            <span className="font-mono text-[9px] tracking-wider w-20 text-right" style={{ color: TXT_FAINT }}>LAST ACTIVE</span>
          </div>

          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center h-32">
                <RefreshCw className="w-5 h-5 animate-spin" style={{ color: TXT_FAINT }} />
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex items-center justify-center h-32">
                <p className="font-mono text-xs" style={{ color: TXT_FAINT }}>No users found</p>
              </div>
            ) : (
              filtered.map(u => (
                <div key={u.id} className="flex items-center px-4 py-3 border-b" style={{ borderColor: BORDER_MID }}>
                  <span className="font-mono text-xs flex-1" style={{ color: TXT_MID }}>{u.id}</span>
                  <div className="w-28 flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0"
                      style={{ background: VD, border: `1px solid ${BORDER}` }}>
                      <span className="font-mono text-[8px] font-bold" style={{ color: V }}>
                        {(u.username || u.email || "?")[0].toUpperCase()}
                      </span>
                    </div>
                    <span className="font-mono text-xs truncate" style={{ color: TXT }}>{u.username || u.email || "Unknown"}</span>
                  </div>
                  <span className="font-mono text-[10px] w-20 text-right" style={{ color: TXT_FAINT }}>
                    {timeAgo(u.lastActiveAt || u.createdAt)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {authTab === "configure" && (
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {[
            { label: "Google OAuth", status: "Active", detail: "66165770155-u1kvu..." },
            { label: "Replit Auth", status: "Active", detail: "OpenID Connect" },
            { label: "Email/Password", status: "Disabled", detail: "Not configured" },
          ].map(p => (
            <div key={p.label} className="flex items-center justify-between p-4 rounded-2xl border" style={{ borderColor: BORDER_MID, background: CARD }}>
              <div>
                <p className="font-mono text-xs font-bold" style={{ color: TXT }}>{p.label}</p>
                <p className="font-mono text-[10px] mt-0.5" style={{ color: TXT_FAINT }}>{p.detail}</p>
              </div>
              <Pill label={p.status} color={p.status === "Active" ? "#4ade80" : TXT_FAINT} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Bottom Navigation ─────────────────────────────────────────────────────────

const NAV_ITEMS: { tab: Tab; icon: React.FC<any>; label: string }[] = [
  { tab: "chat",     icon: MessageSquare, label: "Chat"     },
  { tab: "files",    icon: FolderOpen,    label: "Files"    },
  { tab: "deploy",   icon: Globe,         label: "Deploy"   },
  { tab: "database", icon: Database,      label: "Database" },
  { tab: "secrets",  icon: Lock,          label: "Secrets"  },
  { tab: "auth",     icon: Users,         label: "Auth"     },
];

// ── Main Mobile IDE ───────────────────────────────────────────────────────────

export function MobileIDE({ onClose }: { onClose?: () => void }) {
  const [tab, setTab] = useState<Tab>("files");

  const navigate = (t: Tab) => setTab(t);

  return (
    <div className="fixed inset-0 z-[300] flex flex-col" style={{ background: BG }}>
      {/* Top bar */}
      <div className="shrink-0 flex items-center justify-between px-4 py-3 border-b safe-top"
        style={{ borderColor: BORDER, background: "#0d0d1a" }}>
        {onClose ? (
          <button onClick={onClose} className="p-1.5" style={{ color: TXT_MID }}>
            <ArrowLeft className="w-5 h-5" />
          </button>
        ) : <div className="w-8" />}
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: VD, border: `1px solid ${BORDER}` }}>
            <Zap className="w-4 h-4" style={{ color: V }} />
          </div>
          <span className="font-mono text-sm font-bold tracking-widest" style={{ color: TXT }}>OMNIMENS</span>
        </div>
        <button className="p-1.5" style={{ color: TXT_MID }}>
          <MoreVertical className="w-5 h-5" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {tab === "chat" && (
          <div className="flex flex-col items-center justify-center h-full gap-4 p-6">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ background: VD, border: `1px solid ${BORDER}` }}>
              <MessageSquare className="w-8 h-8" style={{ color: V }} />
            </div>
            <p className="font-mono text-sm font-bold text-center" style={{ color: TXT }}>Open Full Chat</p>
            <p className="font-mono text-xs text-center" style={{ color: TXT_FAINT }}>Use the full OMNIMENS interface for the complete AI experience</p>
            <a href="/chat"
              className="px-6 py-3 rounded-xl font-mono text-sm font-bold transition-all"
              style={{ background: VD, color: V, border: `1px solid ${BORDER}` }}>
              Open OMNIMENS Chat →
            </a>
          </div>
        )}
        {tab === "files"    && <FilesView onNavigate={navigate} />}
        {tab === "deploy"   && <DeployView />}
        {tab === "database" && <DatabaseView />}
        {tab === "secrets"  && <SecretsView />}
        {tab === "auth"     && <AuthView />}
      </div>

      {/* Bottom navigation */}
      <div className="shrink-0 border-t safe-bottom" style={{ borderColor: BORDER, background: "#0d0d1a" }}>
        <div className="flex">
          {NAV_ITEMS.map(({ tab: t, icon: Icon, label }) => (
            <button key={t} onClick={() => setTab(t)}
              className="flex-1 flex flex-col items-center gap-1 py-2.5 transition-all"
              style={{ color: tab === t ? V : TXT_FAINT }}>
              <div className="relative">
                <Icon className="w-5 h-5" />
                {tab === t && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full" style={{ background: V }} />
                )}
              </div>
              <span className="font-mono text-[8px] tracking-wide">{label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Mobile Trigger Button (shown on small screens in the main app) ─────────────

export function MobileTrigger() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="sm:hidden fixed right-4 z-[200] w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transition-all active:scale-95"
        style={{ background: VD, border: `1.5px solid ${BORDER}`, boxShadow: `0 0 20px rgba(168,85,247,0.3)`, bottom: "max(20px, calc(env(safe-area-inset-bottom) + 12px))" }}
        aria-label="Open mobile IDE"
      >
        <Layers className="w-5 h-5" style={{ color: V }} />
      </button>
      {open && <MobileIDE onClose={() => setOpen(false)} />}
    </>
  );
}
