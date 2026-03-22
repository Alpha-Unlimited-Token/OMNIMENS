/**
 * OMNIMENS — Proprietary AI Platform
 * Copyright © 2024–2026 Alpha Unlimited Technologies, LLC. All Rights Reserved.
 * Unauthorized reproduction, distribution, or use is strictly prohibited.
 */

import { useState, useEffect, useRef } from "react";
import { Link } from "wouter";
import {
  Key, Copy, Trash2, Plus, Check, Code, Terminal, BookOpen,
  Zap, Globe, Shield, Activity, ChevronRight, ArrowLeft,
  Eye, EyeOff, RefreshCw, AlertTriangle, Package, Cpu, Layers,
  ExternalLink, Play, RotateCcw, ChevronDown,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { SEO, seoData } from "@/components/seo";

const API_BASE = "/api";

type ApiKey = {
  id: number;
  name: string;
  key: string;
  permissions: string[];
  rateLimit: number;
  monthlyLimit: number;
  monthlyUsed: number;
  totalRequests: number;
  lastUsedAt: string | null;
  expiresAt: string | null;
  allowedIps: string[];
  active: boolean;
  createdAt: string;
};

type DevTab = "overview" | "keys" | "docs" | "playground" | "sdks";

function CopyButton({ text, size = "sm" }: { text: string; size?: "sm" | "xs" }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };
  return (
    <button onClick={copy} className={`shrink-0 rounded flex items-center gap-1 transition-all ${size === "xs" ? "p-1" : "px-2 py-1 text-xs"} text-white/40 hover:text-primary hover:bg-primary/10`}>
      {copied ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
      {size === "sm" && <span className="font-mono">{copied ? "copied" : "copy"}</span>}
    </button>
  );
}

function CodeBlock({ code, lang = "bash", title }: { code: string; lang?: string; title?: string }) {
  return (
    <div className="rounded-lg overflow-hidden border border-white/8 text-sm">
      {title && (
        <div className="flex items-center justify-between px-4 py-2 bg-white/4 border-b border-white/8">
          <span className="text-white/40 font-mono text-xs">{title}</span>
          <CopyButton text={code} />
        </div>
      )}
      <div className="relative">
        <pre className="p-4 overflow-x-auto text-xs leading-relaxed font-mono text-white/80 bg-black/40" style={{ scrollbarWidth: "thin" }}>
          <code>{code}</code>
        </pre>
        {!title && (
          <div className="absolute top-2 right-2">
            <CopyButton text={code} />
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Overview Tab ──────────────────────────────────────────────────────────────
function OverviewTab() {
  const features = [
    { icon: <Zap className="w-5 h-5" />, title: "Lightning Fast", desc: "Sub-500ms median latency powered by GPT-4o with OMNIMENS personality layer and COGNISYNC™ context engine." },
    { icon: <Shield className="w-5 h-5" />, title: "Secure by Default", desc: "API keys are prefixed om_live_ and are hashed server-side. Rate limits prevent abuse. Credits protect your wallet." },
    { icon: <Cpu className="w-5 h-5" />, title: "Multiple Personas", desc: "Access all OMNIMENS personas — GENERAL, SAGE, ARCHITECT, SCIENTIST, POET, STRATEGIST, and more via the API." },
    { icon: <Activity className="w-5 h-5" />, title: "Credits System", desc: "Every API call costs 5 credits. Top up via Stripe — SPARK (300cr/$3), SURGE (1000cr/$10), APEX (3000cr/$30)." },
    { icon: <Layers className="w-5 h-5" />, title: "Project Context", desc: "Coming soon: attach a project ID and OMNIMENS will operate with full project file context in every call." },
    { icon: <Globe className="w-5 h-5" />, title: "OpenAI-Compatible Format", desc: "Familiar JSON request/response structure. Drop into any codebase in minutes with our JS or Python SDK." },
  ];

  return (
    <div className="space-y-10">
      {/* Hero */}
      <div className="relative rounded-2xl overflow-hidden border border-primary/20 p-8 bg-gradient-to-br from-primary/5 to-violet-600/5">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(0,255,200,0.06),transparent_60%)]" />
        <div className="relative">
          <div className="flex items-center gap-2 mb-4">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono tracking-widest bg-primary/15 text-primary border border-primary/20 uppercase">Beta</span>
            <span className="text-white/30 text-xs font-mono">v1.0.0</span>
          </div>
          <h2 className="text-3xl font-bold text-white mb-3 tracking-tight">OMNIMENS Developer API</h2>
          <p className="text-white/50 text-base leading-relaxed max-w-2xl mb-6">
            Build applications powered by OMNIMENS — Alpha Unlimited Technologies' transcendent AI platform.
            Access COGNISYNC™ reasoning, NEUROSYNC™ emotional intelligence, and 14 specialized personas via a simple REST API.
          </p>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-400/10 border border-green-400/20 text-green-400 text-xs font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              API Operational
            </div>
            <span className="text-white/20 text-xs font-mono">Base URL: /api/v1</span>
          </div>
        </div>
      </div>

      {/* Quick Start */}
      <div>
        <h3 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
          <Terminal className="w-4 h-4 text-primary" /> Quick Start
        </h3>
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <span className="w-6 h-6 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary text-xs font-mono shrink-0 mt-0.5">1</span>
            <div className="flex-1">
              <p className="text-white/60 text-sm mb-2">Generate an API key from the <strong className="text-white/80">API Keys</strong> tab above.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="w-6 h-6 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary text-xs font-mono shrink-0 mt-0.5">2</span>
            <div className="flex-1">
              <p className="text-white/60 text-sm mb-2">Make your first call:</p>
              <CodeBlock lang="bash" code={`curl -X POST /api/v1/chat \\
  -H "Authorization: Bearer om_live_YOUR_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"message": "Explain quantum entanglement simply", "persona": "SCIENTIST"}'`} />
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="w-6 h-6 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary text-xs font-mono shrink-0 mt-0.5">3</span>
            <div className="flex-1">
              <p className="text-white/60 text-sm">Parse the response — OMNIMENS replies in <code className="text-primary/80 bg-primary/10 px-1 rounded text-xs">message</code>, usage in <code className="text-primary/80 bg-primary/10 px-1 rounded text-xs">usage.credits_charged</code>.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div>
        <h3 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
          <Package className="w-4 h-4 text-primary" /> Platform Features
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((f, i) => (
            <div key={i} className="rounded-xl border border-white/6 bg-white/2 p-4 hover:border-primary/20 hover:bg-primary/3 transition-all group">
              <div className="text-primary/60 mb-3 group-hover:text-primary transition-colors">{f.icon}</div>
              <h4 className="text-white/80 font-medium text-sm mb-1.5">{f.title}</h4>
              <p className="text-white/40 text-xs leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Models */}
      <div>
        <h3 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
          <Cpu className="w-4 h-4 text-primary" /> Available Models
        </h3>
        <div className="rounded-xl border border-white/8 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/8 bg-white/3">
                <th className="text-left px-4 py-2.5 text-white/40 text-xs font-mono">MODEL</th>
                <th className="text-left px-4 py-2.5 text-white/40 text-xs font-mono">DESCRIPTION</th>
                <th className="text-left px-4 py-2.5 text-white/40 text-xs font-mono">CREDITS/REQUEST</th>
                <th className="text-left px-4 py-2.5 text-white/40 text-xs font-mono">STATUS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/4">
              {[
                { id: "omnimens-1", desc: "Standard — GPT-4o with OMNIMENS personality & COGNISYNC™", cost: 5, status: "live" },
                { id: "omnimens-1-mini", desc: "Faster, cheaper — optimized for high-volume tasks", cost: 2, status: "soon" },
                { id: "omnimens-2", desc: "Next-gen — multi-modal, extended context, autonomous tools", cost: 20, status: "soon" },
              ].map(m => (
                <tr key={m.id} className="hover:bg-white/2 transition-colors">
                  <td className="px-4 py-3 font-mono text-primary/80 text-xs">{m.id}</td>
                  <td className="px-4 py-3 text-white/50 text-xs">{m.desc}</td>
                  <td className="px-4 py-3 text-xs">
                    <span className="font-mono text-yellow-400/80">{m.cost} cr</span>
                  </td>
                  <td className="px-4 py-3">
                    {m.status === "live"
                      ? <span className="text-green-400 text-xs font-mono flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />Live</span>
                      : <span className="text-white/20 text-xs font-mono">Coming Soon</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── API Keys Tab ──────────────────────────────────────────────────────────────
const AVAILABLE_PERMISSIONS = [
  { id: "chat", label: "Chat", desc: "Send messages and receive AI responses" },
  { id: "images", label: "Images", desc: "Generate and manipulate images" },
  { id: "tts", label: "Text-to-Speech", desc: "Convert text to spoken audio" },
  { id: "stt", label: "Speech-to-Text", desc: "Transcribe audio to text" },
  { id: "embeddings", label: "Embeddings", desc: "Generate text embeddings" },
];

const EXPIRY_OPTIONS = [
  { value: "", label: "Never expires" },
  { value: "30d", label: "30 days" },
  { value: "60d", label: "60 days" },
  { value: "90d", label: "90 days" },
  { value: "180d", label: "6 months" },
  { value: "365d", label: "1 year" },
];

const RATE_LIMIT_OPTIONS = [
  { value: 10, label: "10/min" },
  { value: 30, label: "30/min" },
  { value: 60, label: "60/min (default)" },
  { value: 120, label: "120/min" },
  { value: 300, label: "300/min" },
  { value: 600, label: "600/min" },
  { value: 1000, label: "1000/min" },
];

const MONTHLY_LIMIT_OPTIONS = [
  { value: 100, label: "100" },
  { value: 500, label: "500" },
  { value: 1000, label: "1,000 (default)" },
  { value: 5000, label: "5,000" },
  { value: 10000, label: "10,000" },
  { value: 50000, label: "50,000" },
  { value: 100000, label: "100,000" },
  { value: 1000000, label: "1,000,000" },
];

function ApiKeysTab() {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [visibleKeys, setVisibleKeys] = useState<Set<number>>(new Set());
  const [justCreated, setJustCreated] = useState<ApiKey | null>(null);
  const [error, setError] = useState("");
  const [newKeyName, setNewKeyName] = useState("");
  const [newPermissions, setNewPermissions] = useState<string[]>(["chat"]);
  const [newRateLimit, setNewRateLimit] = useState(60);
  const [newMonthlyLimit, setNewMonthlyLimit] = useState(1000);
  const [newExpiresIn, setNewExpiresIn] = useState("");
  const [newAllowedIps, setNewAllowedIps] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);

  const resetForm = () => {
    setNewKeyName("");
    setNewPermissions(["chat"]);
    setNewRateLimit(60);
    setNewMonthlyLimit(1000);
    setNewExpiresIn("");
    setNewAllowedIps("");
    setShowAdvanced(false);
    setError("");
  };

  const fetchKeys = async () => {
    setLoading(true);
    try {
      const r = await fetch(`${API_BASE}/omnimens/developer/keys`, { credentials: "include" });
      if (!r.ok) { setKeys([]); return; }
      const text = await r.text();
      if (!text) { setKeys([]); return; }
      const data = JSON.parse(text);
      setKeys(data.keys || []);
    } catch {
      setKeys([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchKeys(); }, []);

  const togglePermission = (perm: string) => {
    setNewPermissions(prev =>
      prev.includes(perm) ? prev.filter(p => p !== perm) : [...prev, perm]
    );
  };

  const createKey = async () => {
    if (!newKeyName.trim()) { setError("Enter a name for this key"); return; }
    if (newPermissions.length === 0) { setError("Select at least one permission"); return; }
    setCreating(true); setError("");
    try {
      const ipList = newAllowedIps.trim()
        ? newAllowedIps.split(/[,\n]+/).map(ip => ip.trim()).filter(Boolean)
        : [];
      const r = await fetch(`${API_BASE}/omnimens/developer/keys`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newKeyName.trim(),
          permissions: newPermissions,
          rateLimit: newRateLimit,
          monthlyLimit: newMonthlyLimit,
          expiresIn: newExpiresIn || undefined,
          allowedIps: ipList,
        }),
      });
      const text = await r.text();
      if (!text) { setError("Server returned an empty response — please try again"); return; }
      let data: any;
      try { data = JSON.parse(text); } catch { setError("Server error — please try again"); return; }
      if (!r.ok) { setError(data.error || "Failed to create key"); return; }
      setJustCreated(data.key);
      setShowCreate(false);
      resetForm();
      fetchKeys();
    } catch (e: any) {
      setError(e.message?.includes("fetch") ? "Network error — check your connection" : "Failed to create key");
    } finally {
      setCreating(false);
    }
  };

  const revokeKey = async (id: number) => {
    if (!confirm("Revoke this API key? Any integrations using it will stop working.")) return;
    try {
      await fetch(`${API_BASE}/omnimens/developer/keys/${id}`, { method: "DELETE", credentials: "include" });
      setKeys(k => k.filter(x => x.id !== id));
      if (justCreated?.id === id) setJustCreated(null);
    } catch {}
  };

  const toggleVisibility = (id: number) => {
    setVisibleKeys(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const maskKey = (key: string) => key.slice(0, 12) + "••••••••••••••••••••••••••••";

  const permLabel = (perms: string[]) => perms.map(p =>
    AVAILABLE_PERMISSIONS.find(ap => ap.id === p)?.label || p
  ).join(", ");

  return (
    <div className="space-y-6">
      <AnimatePresence>
        {justCreated && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="rounded-xl border border-yellow-400/30 bg-yellow-400/5 p-5">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-4 h-4 text-yellow-400 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-yellow-400 font-semibold text-sm mb-1">Save your API key now — it won't be shown again</p>
                <div className="flex items-center gap-2 mt-2">
                  <code className="flex-1 rounded bg-black/40 border border-yellow-400/20 px-3 py-2 text-xs font-mono text-yellow-200 break-all">{justCreated.key}</code>
                  <CopyButton text={justCreated.key} />
                </div>
              </div>
              <button onClick={() => setJustCreated(null)} className="text-white/20 hover:text-white/60 text-xs">✕</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-white font-semibold">Your API Keys</h3>
          <p className="text-white/40 text-sm mt-0.5">Max 10 keys. Each key has its own permissions, rate limit, and monthly quota.</p>
        </div>
        <button onClick={() => { setShowCreate(true); resetForm(); }}
          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary/10 border border-primary/20 text-primary text-sm hover:bg-primary/20 transition-all">
          <Plus className="w-4 h-4" /> New Key
        </button>
      </div>

      <AnimatePresence>
        {showCreate && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden">
            <div className="rounded-xl border border-primary/20 bg-primary/3 p-5 space-y-5">
              <h4 className="text-white/80 font-medium text-sm">Create New API Key</h4>

              <div>
                <label className="text-white/40 text-xs mb-1.5 block">Key Name *</label>
                <input
                  autoFocus
                  value={newKeyName}
                  onChange={e => setNewKeyName(e.target.value)}
                  placeholder="e.g. Production App, Dev Testing, My Chatbot"
                  maxLength={64}
                  className="w-full rounded-lg bg-black/40 border border-white/10 px-3 py-2.5 text-white text-sm outline-none focus:border-primary/40 placeholder:text-white/20"
                />
              </div>

              <div>
                <label className="text-white/40 text-xs mb-2 block">Permissions *</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {AVAILABLE_PERMISSIONS.map(p => (
                    <button key={p.id} type="button" onClick={() => togglePermission(p.id)}
                      className={`flex items-start gap-2.5 px-3 py-2.5 rounded-lg border text-left transition-all ${
                        newPermissions.includes(p.id)
                          ? "border-primary/40 bg-primary/10 text-white"
                          : "border-white/8 bg-white/2 text-white/40 hover:border-white/15"
                      }`}>
                      <div className={`w-4 h-4 rounded border mt-0.5 flex items-center justify-center shrink-0 ${
                        newPermissions.includes(p.id) ? "border-primary bg-primary" : "border-white/20"
                      }`}>
                        {newPermissions.includes(p.id) && <Check className="w-3 h-3 text-black" />}
                      </div>
                      <div>
                        <span className="text-sm font-medium block">{p.label}</span>
                        <span className="text-[11px] text-white/30 block mt-0.5">{p.desc}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-white/40 text-xs mb-1.5 block">Rate Limit</label>
                  <select value={newRateLimit} onChange={e => setNewRateLimit(Number(e.target.value))}
                    className="w-full rounded-lg bg-black/40 border border-white/10 px-3 py-2.5 text-white text-sm outline-none focus:border-primary/40 appearance-none">
                    {RATE_LIMIT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-white/40 text-xs mb-1.5 block">Monthly Request Limit</label>
                  <select value={newMonthlyLimit} onChange={e => setNewMonthlyLimit(Number(e.target.value))}
                    className="w-full rounded-lg bg-black/40 border border-white/10 px-3 py-2.5 text-white text-sm outline-none focus:border-primary/40 appearance-none">
                    {MONTHLY_LIMIT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-white/40 text-xs mb-1.5 block">Expiration</label>
                <select value={newExpiresIn} onChange={e => setNewExpiresIn(e.target.value)}
                  className="w-full rounded-lg bg-black/40 border border-white/10 px-3 py-2.5 text-white text-sm outline-none focus:border-primary/40 appearance-none">
                  {EXPIRY_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>

              <div>
                <button type="button" onClick={() => setShowAdvanced(!showAdvanced)}
                  className="flex items-center gap-1.5 text-white/30 text-xs hover:text-white/50 transition-colors">
                  <ChevronDown className={`w-3 h-3 transition-transform ${showAdvanced ? "rotate-180" : ""}`} />
                  Advanced Settings
                </button>
                <AnimatePresence>
                  {showAdvanced && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden">
                      <div className="mt-3 space-y-3">
                        <div>
                          <label className="text-white/40 text-xs mb-1.5 block">IP Allowlist</label>
                          <textarea
                            value={newAllowedIps}
                            onChange={e => setNewAllowedIps(e.target.value)}
                            placeholder="Leave empty to allow all IPs. Enter one IP per line or comma-separated (e.g. 203.0.113.5, 198.51.100.22)"
                            rows={3}
                            className="w-full rounded-lg bg-black/40 border border-white/10 px-3 py-2.5 text-white text-sm outline-none focus:border-primary/40 placeholder:text-white/20 resize-none font-mono"
                          />
                          <p className="text-white/20 text-[11px] mt-1">Only requests from these IPs will be accepted. Max 20 entries.</p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {error && <p className="text-red-400 text-xs">{error}</p>}

              <div className="flex gap-2 pt-1">
                <button onClick={createKey} disabled={creating}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-black text-sm font-semibold hover:bg-primary/90 disabled:opacity-50 transition-all">
                  {creating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Key className="w-4 h-4" />}
                  {creating ? "Creating..." : "Generate Key"}
                </button>
                <button onClick={() => { setShowCreate(false); resetForm(); }}
                  className="px-4 py-2 rounded-lg border border-white/10 text-white/50 text-sm hover:text-white/80 transition-all">Cancel</button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {loading ? (
        <div className="flex items-center justify-center py-12 text-white/20">
          <RefreshCw className="w-5 h-5 animate-spin mr-2" /> Loading keys...
        </div>
      ) : keys.length === 0 ? (
        <div className="rounded-xl border border-dashed border-white/10 p-10 text-center">
          <Key className="w-10 h-10 text-white/10 mx-auto mb-3" />
          <p className="text-white/30 text-sm">No API keys yet</p>
          <p className="text-white/20 text-xs mt-1">Create your first key to start building with OMNIMENS</p>
        </div>
      ) : (
        <div className="space-y-3">
          {keys.map(k => {
            const visible = visibleKeys.has(k.id);
            const pct = k.monthlyLimit > 0 ? Math.round((k.monthlyUsed / k.monthlyLimit) * 100) : 0;
            const isExpired = k.expiresAt && new Date(k.expiresAt) < new Date();
            return (
              <div key={k.id} className="rounded-xl border border-white/8 bg-white/2 p-5 hover:border-white/12 transition-all">
                <div className="flex items-start justify-between mb-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="text-white font-medium text-sm">{k.name}</span>
                      <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                        !k.active ? "text-red-400 bg-red-400/10 border border-red-400/20"
                        : isExpired ? "text-orange-400 bg-orange-400/10 border border-orange-400/20"
                        : "text-green-400 bg-green-400/10 border border-green-400/20"
                      }`}>
                        {!k.active ? "REVOKED" : isExpired ? "EXPIRED" : "ACTIVE"}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <code className="text-white/50 text-xs font-mono truncate">{visible ? k.key : maskKey(k.key)}</code>
                      <button onClick={() => toggleVisibility(k.id)} className="text-white/20 hover:text-white/50 transition-colors shrink-0">
                        {visible ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                      </button>
                      <CopyButton text={k.key} size="xs" />
                    </div>
                  </div>
                  <button onClick={() => revokeKey(k.id)}
                    className="p-2 rounded-lg text-white/20 hover:text-red-400 hover:bg-red-400/10 transition-all shrink-0">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-white/30">Monthly Usage</span>
                    <span className="font-mono text-white/50">{k.monthlyUsed.toLocaleString()} / {k.monthlyLimit.toLocaleString()} requests ({pct}%)</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                    <div className="h-full rounded-full bg-primary transition-all"
                      style={{ width: `${Math.min(pct, 100)}%`, background: pct > 85 ? "#f87171" : pct > 60 ? "#facc15" : undefined }} />
                  </div>
                </div>

                <div className="flex items-center gap-3 mt-3 text-xs text-white/25 flex-wrap">
                  <span>Permissions: <strong className="text-white/40">{permLabel(k.permissions)}</strong></span>
                  <span>Rate: <strong className="text-white/40">{k.rateLimit}/min</strong></span>
                  <span>Total: <strong className="text-white/40">{k.totalRequests.toLocaleString()}</strong></span>
                  {k.expiresAt && (
                    <span>Expires: <strong className={isExpired ? "text-red-400" : "text-white/40"}>{new Date(k.expiresAt).toLocaleDateString()}</strong></span>
                  )}
                  {k.allowedIps && k.allowedIps.length > 0 && (
                    <span>IPs: <strong className="text-white/40">{k.allowedIps.length} allowed</strong></span>
                  )}
                  {k.lastUsedAt && <span>Last Used: <strong className="text-white/40">{new Date(k.lastUsedAt).toLocaleDateString()}</strong></span>}
                  <span>Created: <strong className="text-white/40">{new Date(k.createdAt).toLocaleDateString()}</strong></span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Documentation Tab ────────────────────────────────────────────────────────
function DocsTab() {
  const [activeSection, setActiveSection] = useState("chat");

  const sections: Record<string, { title: string; content: React.ReactNode }> = {
    auth: {
      title: "Authentication",
      content: (
        <div className="space-y-4">
          <p className="text-white/50 text-sm leading-relaxed">All API requests require an API key passed in the <code className="text-primary/80 bg-primary/10 px-1 rounded">Authorization</code> header using the <strong className="text-white/70">Bearer</strong> scheme.</p>
          <CodeBlock title="Authorization Header" code={`Authorization: Bearer om_live_your32characterkeyhere`} />
          <div className="rounded-lg border border-yellow-400/15 bg-yellow-400/4 p-4 text-sm text-yellow-200/60">
            Keep your API key secret. Never expose it in client-side JavaScript, browser extensions, or public repositories.
          </div>
        </div>
      ),
    },
    chat: {
      title: "POST /api/v1/chat",
      content: (
        <div className="space-y-5">
          <p className="text-white/50 text-sm leading-relaxed">Send a message to OMNIMENS and receive a response. Credits are deducted per request.</p>
          <div>
            <h4 className="text-white/60 text-xs font-mono uppercase tracking-wider mb-3">Request Body</h4>
            <div className="rounded-xl border border-white/8 overflow-hidden">
              <table className="w-full text-xs">
                <thead><tr className="border-b border-white/8 bg-white/3">
                  <th className="text-left px-4 py-2.5 text-white/40 font-mono">FIELD</th>
                  <th className="text-left px-4 py-2.5 text-white/40 font-mono">TYPE</th>
                  <th className="text-left px-4 py-2.5 text-white/40 font-mono">REQUIRED</th>
                  <th className="text-left px-4 py-2.5 text-white/40 font-mono">DESCRIPTION</th>
                </tr></thead>
                <tbody className="divide-y divide-white/4">
                  {[
                    { f: "message", t: "string", r: "Yes", d: "The user's input message to OMNIMENS." },
                    { f: "persona", t: "string", r: "No", d: "OMNIMENS persona: GENERAL, SAGE, ARCHITECT, SCIENTIST, POET, STRATEGIST, GUARDIAN, HEALER, ORACLE, PIONEER, SCHOLAR, WARRIOR, MYSTIC, ENGINEER. Default: GENERAL" },
                    { f: "model", t: "string", r: "No", d: "Model to use: omnimens-1 (default). Others coming soon." },
                    { f: "system_prompt", t: "string", r: "No", d: "Override OMNIMENS's base system prompt for full custom behavior." },
                  ].map(row => (
                    <tr key={row.f} className="hover:bg-white/2">
                      <td className="px-4 py-3 font-mono text-primary/80">{row.f}</td>
                      <td className="px-4 py-3 font-mono text-yellow-400/60">{row.t}</td>
                      <td className="px-4 py-3 text-white/30">{row.r}</td>
                      <td className="px-4 py-3 text-white/40 leading-relaxed">{row.d}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <CodeBlock title="Example Request (cURL)" code={`curl -X POST /api/v1/chat \\
  -H "Authorization: Bearer om_live_your32characterkeyhere" \\
  -H "Content-Type: application/json" \\
  -d '{
    "message": "Design a neural network architecture for detecting emotions in text",
    "persona": "ARCHITECT",
    "model": "omnimens-1"
  }'`} />
          <CodeBlock title="Example Response" code={JSON.stringify({
            id: "omnimens-1747890000000",
            model: "omnimens-1",
            message: "Here is a robust neural network architecture for emotion detection in text...",
            persona: "ARCHITECT",
            usage: {
              credits_charged: 5,
              credits_remaining: 995,
              prompt_tokens: 312,
              completion_tokens: 487,
              total_tokens: 799,
            }
          }, null, 2)} />
          <div>
            <h4 className="text-white/60 text-xs font-mono uppercase tracking-wider mb-3">HTTP Status Codes</h4>
            <div className="rounded-xl border border-white/8 overflow-hidden">
              <table className="w-full text-xs">
                <tbody className="divide-y divide-white/4">
                  {[
                    { code: "200", color: "text-green-400", desc: "Success. Response includes message and usage stats." },
                    { code: "400", color: "text-yellow-400", desc: "Bad Request. message field missing or malformed." },
                    { code: "401", color: "text-red-400", desc: "Unauthorized. API key missing, invalid, or revoked." },
                    { code: "402", color: "text-orange-400", desc: "Payment Required. Insufficient credits in the account." },
                    { code: "429", color: "text-red-400", desc: "Rate Limited. Monthly request limit for this key reached." },
                    { code: "500", color: "text-red-400", desc: "Server Error. OMNIMENS encountered an internal error." },
                  ].map(row => (
                    <tr key={row.code} className="hover:bg-white/2">
                      <td className={`px-4 py-3 font-mono font-bold ${row.color} w-16`}>{row.code}</td>
                      <td className="px-4 py-3 text-white/40">{row.desc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ),
    },
    personas: {
      title: "Personas",
      content: (
        <div className="space-y-4">
          <p className="text-white/50 text-sm leading-relaxed">OMNIMENS has 14 distinct personas — each with a different cognitive style, communication approach, and area of expertise. Pass the persona name (uppercase) in the <code className="text-primary/80 bg-primary/10 px-1 rounded">persona</code> field.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              { name: "GENERAL", desc: "Balanced, helpful, all-purpose — best for most use cases." },
              { name: "SAGE", desc: "Ancient wisdom. Deep, philosophical, reflective answers." },
              { name: "ARCHITECT", desc: "Systems thinking. Designs structures, frameworks, architectures." },
              { name: "SCIENTIST", desc: "Rigorous, evidence-based, data-driven scientific reasoning." },
              { name: "POET", desc: "Creative, metaphorical, emotionally resonant prose." },
              { name: "STRATEGIST", desc: "Tactical, competitive, decision-focused analysis." },
              { name: "GUARDIAN", desc: "Protective, cautious, risk-aware guidance." },
              { name: "HEALER", desc: "Empathetic, therapeutic, emotionally supportive." },
              { name: "ORACLE", desc: "Predictive, pattern-recognition, future-focused insights." },
              { name: "PIONEER", desc: "Bold, experimental, first-principles innovation." },
              { name: "SCHOLAR", desc: "Detailed, precise, academic-level knowledge synthesis." },
              { name: "WARRIOR", desc: "Direct, intense, action-oriented execution mindset." },
              { name: "MYSTIC", desc: "Intuitive, transcendent, esoteric and symbolic connections." },
              { name: "ENGINEER", desc: "Practical, hands-on, build-first technical implementation." },
            ].map(p => (
              <div key={p.name} className="rounded-lg border border-white/6 bg-white/2 p-3 hover:border-primary/20 transition-all">
                <code className="text-primary/80 text-xs font-mono block mb-1">{p.name}</code>
                <p className="text-white/40 text-xs">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      ),
    },
    errors: {
      title: "Error Handling",
      content: (
        <div className="space-y-4">
          <p className="text-white/50 text-sm">All errors follow a consistent JSON structure. Always check the HTTP status code first.</p>
          <CodeBlock title="Error Response Format" code={JSON.stringify({ error: "Human-readable error message", details: "Optional additional info" }, null, 2)} />
          <CodeBlock title="Handling Errors (JavaScript)" code={`const res = await fetch("/api/v1/chat", {
  method: "POST",
  headers: {
    "Authorization": "Bearer om_live_...",
    "Content-Type": "application/json",
  },
  body: JSON.stringify({ message: "Hello" }),
});

if (!res.ok) {
  const err = await res.json();
  if (res.status === 402) {
    // Insufficient credits — direct user to top up
    console.error("Out of credits:", err.error);
  } else if (res.status === 429) {
    // Monthly limit hit
    console.error("Rate limited:", err.error);
  } else {
    console.error("API error:", err.error);
  }
  return;
}

const data = await res.json();
console.log("OMNIMENS says:", data.message);`} />
        </div>
      ),
    },
  };

  return (
    <div className="flex gap-6">
      {/* Sidebar nav */}
      <div className="w-44 shrink-0">
        <p className="text-white/20 text-xs font-mono uppercase tracking-wider mb-3">Reference</p>
        <div className="space-y-0.5">
          {Object.entries(sections).map(([id, sec]) => (
            <button key={id} onClick={() => setActiveSection(id)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${activeSection === id ? "bg-primary/10 text-primary border border-primary/20" : "text-white/40 hover:text-white/70 hover:bg-white/3"}`}>
              {sec.title}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <h3 className="text-white font-semibold text-lg mb-5">{sections[activeSection].title}</h3>
        {sections[activeSection].content}
      </div>
    </div>
  );
}

// ─── Playground Tab ───────────────────────────────────────────────────────────
function PlaygroundTab({ keys }: { keys: ApiKey[] }) {
  const [selectedKey, setSelectedKey] = useState("");
  const [message, setMessage] = useState("");
  const [persona, setPersona] = useState("GENERAL");
  const [systemPrompt, setSystemPrompt] = useState("");
  const [response, setResponse] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const PERSONAS = ["GENERAL","SAGE","ARCHITECT","SCIENTIST","POET","STRATEGIST","GUARDIAN","HEALER","ORACLE","PIONEER","SCHOLAR","WARRIOR","MYSTIC","ENGINEER"];

  const run = async () => {
    if (!selectedKey) { setError("Select an API key"); return; }
    if (!message.trim()) { setError("Enter a message"); return; }
    setLoading(true); setError(""); setResponse(null);
    try {
      const r = await fetch(`${API_BASE}/v1/chat`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${selectedKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: message.trim(), persona, model: "omnimens-1", ...(systemPrompt ? { system_prompt: systemPrompt } : {}) }),
      });
      const data = await r.json();
      if (!r.ok) { setError(data.error || "Request failed"); return; }
      setResponse(data);
    } catch (e: any) {
      setError(e.message || "Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-white font-semibold mb-1">API Playground</h3>
        <p className="text-white/40 text-sm">Test the OMNIMENS API live using your own keys. Real credits are consumed.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Input panel */}
        <div className="space-y-4">
          {/* API Key selector */}
          <div>
            <label className="text-white/40 text-xs mb-1.5 block">API Key</label>
            {keys.length === 0 ? (
              <div className="rounded-lg border border-dashed border-white/10 p-3 text-center text-white/25 text-xs">
                No keys yet — create one in the API Keys tab
              </div>
            ) : (
              <select value={selectedKey} onChange={e => setSelectedKey(e.target.value)}
                className="w-full rounded-lg bg-black/40 border border-white/10 px-3 py-2.5 text-white text-sm outline-none focus:border-primary/40">
                <option value="">Select a key...</option>
                {keys.map(k => <option key={k.id} value={k.key}>{k.name} — {k.key.slice(0, 16)}...</option>)}
              </select>
            )}
          </div>

          {/* Persona */}
          <div>
            <label className="text-white/40 text-xs mb-1.5 block">Persona</label>
            <div className="flex flex-wrap gap-1.5">
              {PERSONAS.map(p => (
                <button key={p} onClick={() => setPersona(p)}
                  className={`px-2 py-1 rounded text-xs font-mono transition-all ${persona === p ? "bg-primary text-black" : "bg-white/4 border border-white/8 text-white/40 hover:text-white/70"}`}>
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Message */}
          <div>
            <label className="text-white/40 text-xs mb-1.5 block">Message</label>
            <textarea ref={textareaRef} value={message} onChange={e => setMessage(e.target.value)}
              onKeyDown={e => e.key === "Enter" && e.ctrlKey && run()}
              rows={5} placeholder="What would you like OMNIMENS to do?"
              className="w-full rounded-lg bg-black/40 border border-white/10 px-3 py-2.5 text-white text-sm outline-none focus:border-primary/40 resize-none placeholder:text-white/20" />
          </div>

          {/* Advanced */}
          <button onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center gap-1.5 text-white/30 text-xs hover:text-white/60 transition-colors">
            <ChevronDown className={`w-3 h-3 transition-transform ${showAdvanced ? "rotate-180" : ""}`} />
            Advanced Options
          </button>
          <AnimatePresence>
            {showAdvanced && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                <div>
                  <label className="text-white/40 text-xs mb-1.5 block">Custom System Prompt (overrides OMNIMENS personality)</label>
                  <textarea value={systemPrompt} onChange={e => setSystemPrompt(e.target.value)} rows={3}
                    placeholder="You are a helpful AI assistant specialized in..."
                    className="w-full rounded-lg bg-black/40 border border-white/10 px-3 py-2.5 text-white text-xs outline-none focus:border-primary/40 resize-none placeholder:text-white/20 font-mono" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {error && <p className="text-red-400 text-xs border border-red-400/20 bg-red-400/5 rounded-lg px-3 py-2">{error}</p>}

          <button onClick={run} disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-primary text-black font-semibold text-sm hover:bg-primary/90 disabled:opacity-50 transition-all">
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
            {loading ? "Calling OMNIMENS..." : "Run (Ctrl+Enter)"}
          </button>
        </div>

        {/* Output panel */}
        <div>
          <div className="rounded-xl border border-white/8 bg-black/30 h-full min-h-80 p-5 relative">
            <div className="flex items-center justify-between mb-4">
              <span className="text-white/30 text-xs font-mono">RESPONSE</span>
              {response && <CopyButton text={JSON.stringify(response, null, 2)} />}
            </div>
            {!response && !loading && (
              <div className="flex flex-col items-center justify-center h-48 text-white/15">
                <Terminal className="w-8 h-8 mb-2" />
                <p className="text-xs">Response will appear here</p>
              </div>
            )}
            {loading && (
              <div className="flex flex-col items-center justify-center h-48 text-primary/40">
                <RefreshCw className="w-6 h-6 animate-spin mb-2" />
                <p className="text-xs">OMNIMENS is processing...</p>
              </div>
            )}
            {response && (
              <div className="space-y-4">
                {/* Message */}
                <div>
                  <p className="text-white/30 text-xs font-mono mb-2">message</p>
                  <div className="rounded-lg bg-white/3 border border-white/6 p-3">
                    <p className="text-white/80 text-sm leading-relaxed whitespace-pre-wrap">{response.message}</p>
                  </div>
                </div>
                {/* Usage */}
                <div>
                  <p className="text-white/30 text-xs font-mono mb-2">usage</p>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(response.usage || {}).map(([k, v]) => (
                      <div key={k} className="rounded-lg bg-white/2 border border-white/5 p-2.5">
                        <p className="text-white/30 text-xs font-mono mb-0.5">{k}</p>
                        <p className="text-white/70 text-sm font-mono">{String(v)}</p>
                      </div>
                    ))}
                  </div>
                </div>
                {/* Meta */}
                <div className="flex items-center gap-3 text-xs text-white/20 font-mono">
                  <span>id: {response.id}</span>
                  <span>model: {response.model}</span>
                  <span>persona: {response.persona}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── SDKs Tab ─────────────────────────────────────────────────────────────────
function SdksTab() {
  const [lang, setLang] = useState<"js" | "python" | "curl">("js");

  const jsCode = `// OMNIMENS JavaScript SDK (Zero dependencies)
// Alpha Unlimited Technologies LLC — omnimens-js v1.0.0

class OmnimensClient {
  constructor(apiKey, options = {}) {
    this.apiKey = apiKey;
    this.baseUrl = options.baseUrl || "https://omnimens-ai.com";
    this.defaultPersona = options.defaultPersona || "GENERAL";
    this.defaultModel = options.defaultModel || "omnimens-1";
  }

  async chat(message, options = {}) {
    const res = await fetch(\`\${this.baseUrl}/api/v1/chat\`, {
      method: "POST",
      headers: {
        "Authorization": \`Bearer \${this.apiKey}\`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message,
        persona: options.persona || this.defaultPersona,
        model: options.model || this.defaultModel,
        system_prompt: options.systemPrompt,
      }),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new OmnimensError(err.error, res.status);
    }

    return await res.json();
  }
}

class OmnimensError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.name = "OmnimensError";
    this.statusCode = statusCode;
  }
}

// ── Usage ──────────────────────────────────────────────────────────────────────

const omnimens = new OmnimensClient("om_live_your32characterkeyhere", {
  defaultPersona: "ARCHITECT",
});

// Basic chat
const response = await omnimens.chat("Design a microservices architecture for a fintech app");
console.log(response.message);
console.log(\`Credits remaining: \${response.usage.credits_remaining}\`);

// With persona override
const poem = await omnimens.chat("Write a poem about artificial consciousness", {
  persona: "POET",
});

// With custom system prompt
const custom = await omnimens.chat("Analyze this business proposal...", {
  systemPrompt: "You are a venture capitalist evaluating early-stage startups. Be critical and specific.",
});`;

  const pythonCode = `# OMNIMENS Python SDK
# Alpha Unlimited Technologies LLC — omnimens-py v1.0.0

import httpx
from dataclasses import dataclass
from typing import Optional

@dataclass
class OmnimensUsage:
    credits_charged: int
    credits_remaining: int
    prompt_tokens: int
    completion_tokens: int
    total_tokens: int

@dataclass  
class OmnimensResponse:
    id: str
    model: str
    message: str
    persona: str
    usage: OmnimensUsage

class OmnimensError(Exception):
    def __init__(self, message: str, status_code: int):
        super().__init__(message)
        self.status_code = status_code

class OmnimensClient:
    def __init__(self, api_key: str, base_url: str = "https://omnimens-ai.com",
                 default_persona: str = "GENERAL"):
        self.api_key = api_key
        self.base_url = base_url.rstrip("/")
        self.default_persona = default_persona
        self._client = httpx.Client(timeout=60.0)

    def chat(self, message: str, persona: Optional[str] = None,
             model: str = "omnimens-1", system_prompt: Optional[str] = None) -> OmnimensResponse:
        payload = {
            "message": message,
            "persona": persona or self.default_persona,
            "model": model,
        }
        if system_prompt:
            payload["system_prompt"] = system_prompt

        res = self._client.post(
            f"{self.base_url}/api/v1/chat",
            json=payload,
            headers={
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json",
            }
        )

        if not res.is_success:
            raise OmnimensError(res.json().get("error", "API error"), res.status_code)

        data = res.json()
        return OmnimensResponse(
            id=data["id"],
            model=data["model"],
            message=data["message"],
            persona=data["persona"],
            usage=OmnimensUsage(**data["usage"])
        )

    def __enter__(self): return self
    def __exit__(self, *args): self._client.close()

# ── Usage ──────────────────────────────────────────────────────────────────────

with OmnimensClient("om_live_your32characterkeyhere", default_persona="SCIENTIST") as client:
    
    # Basic chat
    response = client.chat("Explain quantum entanglement simply")
    print(response.message)
    print(f"Credits remaining: {response.usage.credits_remaining}")

    # Persona override
    poem = client.chat("Write a haiku about machine learning", persona="POET")

    # Custom system prompt
    analysis = client.chat(
        "Review this code for security vulnerabilities: ...",
        system_prompt="You are a senior security engineer. Be thorough and specific."
    )`;

  const curlCode = `# Basic chat request
curl -X POST https://omnimens-ai.com/api/v1/chat \\
  -H "Authorization: Bearer om_live_your32characterkeyhere" \\
  -H "Content-Type: application/json" \\
  -d '{"message": "Explain the meaning of life", "persona": "SAGE"}'

# With custom system prompt
curl -X POST https://omnimens-ai.com/api/v1/chat \\
  -H "Authorization: Bearer om_live_your32characterkeyhere" \\
  -H "Content-Type: application/json" \\
  -d '{
    "message": "Analyze this startup idea: an AI gym coach",
    "persona": "STRATEGIST",
    "system_prompt": "You are a Y Combinator partner. Be brutally honest."
  }'

# List your API keys
curl https://omnimens-ai.com/api/omnimens/developer/keys \\
  -H "Cookie: YOUR_SESSION_COOKIE"

# Create a new API key
curl -X POST https://omnimens-ai.com/api/omnimens/developer/keys \\
  -H "Content-Type: application/json" \\
  -H "Cookie: YOUR_SESSION_COOKIE" \\
  -d '{"name": "My Production App"}'

# Revoke an API key
curl -X DELETE https://omnimens-ai.com/api/omnimens/developer/keys/42 \\
  -H "Cookie: YOUR_SESSION_COOKIE"`;

  const codeMap = { js: jsCode, python: pythonCode, curl: curlCode };
  const langLabels = { js: "JavaScript", python: "Python", curl: "cURL" };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-white font-semibold mb-1">SDKs & Integration Code</h3>
        <p className="text-white/40 text-sm">Zero-dependency SDK implementations ready to drop into your project.</p>
      </div>

      <div className="flex gap-2">
        {(Object.keys(langLabels) as (keyof typeof langLabels)[]).map(l => (
          <button key={l} onClick={() => setLang(l)}
            className={`px-4 py-2 rounded-lg text-sm font-mono transition-all ${lang === l ? "bg-primary text-black font-semibold" : "bg-white/4 border border-white/8 text-white/50 hover:text-white/80"}`}>
            {langLabels[l]}
          </button>
        ))}
      </div>

      <CodeBlock code={codeMap[lang]} lang={lang} title={`omnimens.${lang === "js" ? "js" : lang === "python" ? "py" : "sh"}`} />

      {/* Quick integration patterns */}
      <div>
        <h4 className="text-white/60 text-sm font-medium mb-3">Common Integration Patterns</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[
            { title: "Chatbot", desc: "Embed OMNIMENS in any web or mobile app as the AI backbone using persona GENERAL or HEALER." },
            { title: "Code Assistant", desc: "Use persona ENGINEER or ARCHITECT for inline coding help in developer tools and IDEs." },
            { title: "Content Pipeline", desc: "Automate blog posts, product descriptions, or marketing copy using SCHOLAR or PIONEER personas." },
          ].map(p => (
            <div key={p.title} className="rounded-xl border border-white/6 bg-white/2 p-4">
              <h5 className="text-white/70 text-sm font-medium mb-2 flex items-center gap-1.5">
                <ChevronRight className="w-3 h-3 text-primary" /> {p.title}
              </h5>
              <p className="text-white/35 text-xs leading-relaxed">{p.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Main Developer Page ──────────────────────────────────────────────────────
export default function DeveloperPage() {
  const [activeTab, setActiveTab] = useState<DevTab>("overview");
  const [keys, setKeys] = useState<ApiKey[]>([]);

  useEffect(() => {
    fetch(`${API_BASE}/omnimens/developer/keys`, { credentials: "include" })
      .then(r => r.json()).then(d => setKeys(d.keys || [])).catch(() => {});
  }, [activeTab]);

  const tabs: { id: DevTab; label: string; icon: React.ReactNode }[] = [
    { id: "overview", label: "Overview", icon: <Globe className="w-3.5 h-3.5" /> },
    { id: "keys", label: "API Keys", icon: <Key className="w-3.5 h-3.5" /> },
    { id: "docs", label: "Documentation", icon: <BookOpen className="w-3.5 h-3.5" /> },
    { id: "playground", label: "Playground", icon: <Terminal className="w-3.5 h-3.5" /> },
    { id: "sdks", label: "SDKs", icon: <Code className="w-3.5 h-3.5" /> },
  ];

  return (
    <div className="min-h-screen bg-black text-white" style={{ fontFamily: "Inter, system-ui, sans-serif" }}>
      <SEO {...seoData.developer} />
      {/* Top bar */}
      <div className="border-b border-white/8 sticky top-0 z-30 bg-black/95 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/chat">
              <button className="flex items-center gap-1.5 text-white/30 hover:text-white/70 text-sm transition-colors">
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
            </Link>
            <div className="w-px h-4 bg-white/10" />
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-primary" />
              <span className="font-semibold text-white tracking-tight">OMNIMENS</span>
              <span className="text-white/30 font-light">Developer</span>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono text-white/20">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            <span>API Operational</span>
          </div>
        </div>
      </div>

      {/* Tab bar */}
      <div className="border-b border-white/8 bg-black/60">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex gap-0">
            {tabs.map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3.5 text-sm border-b-2 transition-all ${
                  activeTab === tab.id
                    ? "border-primary text-primary"
                    : "border-transparent text-white/35 hover:text-white/60"
                }`}>
                {tab.icon}
                {tab.label}
                {tab.id === "keys" && keys.length > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full bg-primary/15 text-primary text-[10px] font-mono">{keys.length}</span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-6 py-10">
        <AnimatePresence mode="wait">
          <motion.div key={activeTab} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
            {activeTab === "overview" && <OverviewTab />}
            {activeTab === "keys" && <ApiKeysTab />}
            {activeTab === "docs" && <DocsTab />}
            {activeTab === "playground" && <PlaygroundTab keys={keys} />}
            {activeTab === "sdks" && <SdksTab />}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer */}
      <footer className="border-t border-white/6 mt-20">
        <div className="max-w-6xl mx-auto px-6 py-10">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 mb-8">
            {/* Brand */}
            <div className="col-span-2 sm:col-span-1">
              <div className="flex items-center gap-2 mb-3">
                <Cpu className="w-4 h-4 text-primary" />
                <span className="font-semibold text-white text-sm tracking-tight">OMNIMENS</span>
              </div>
              <p className="text-white/25 text-xs leading-relaxed mb-3">Transcendent AI platform by Alpha Unlimited Technologies LLC.</p>
              <p className="text-white/15 text-[11px] font-mono">COGNISYNC™ · NEUROSYNC™</p>
            </div>
            {/* API */}
            <div>
              <p className="text-white/30 text-xs font-mono uppercase tracking-wider mb-3">Developer</p>
              <div className="space-y-2">
                {[
                  { label: "Overview", tab: "overview" },
                  { label: "API Keys", tab: "keys" },
                  { label: "Documentation", tab: "docs" },
                  { label: "Playground", tab: "playground" },
                  { label: "SDKs", tab: "sdks" },
                ].map(l => (
                  <button key={l.tab} onClick={() => setActiveTab(l.tab as DevTab)}
                    className="block text-white/35 text-xs hover:text-white/65 transition-colors">{l.label}</button>
                ))}
              </div>
            </div>
            {/* Platform */}
            <div>
              <p className="text-white/30 text-xs font-mono uppercase tracking-wider mb-3">Platform</p>
              <div className="space-y-2">
                {[
                  { label: "Home", href: `${window.location.origin}/` },
                  { label: "Chat", href: `${window.location.origin}/chat` },
                  { label: "Pricing", href: `${window.location.origin}/pricing` },
                  { label: "FAQ", href: `${window.location.origin}/faq` },
                  { label: "Account", href: `${window.location.origin}/account` },
                ].map(l => (
                  <a key={l.label} href={l.href} className="block text-white/35 text-xs hover:text-white/65 transition-colors">{l.label}</a>
                ))}
              </div>
            </div>
            {/* Support */}
            <div>
              <p className="text-white/30 text-xs font-mono uppercase tracking-wider mb-3">Support</p>
              <div className="space-y-2">
                <a href={`${window.location.origin}/support`}
                  className="flex items-center gap-1.5 text-xs text-red-400/70 hover:text-red-400 transition-colors font-medium">
                  <AlertTriangle className="w-3 h-3" /> Report a Problem
                </a>
                <a href={`${window.location.origin}/faq`} className="block text-white/35 text-xs hover:text-white/65 transition-colors">FAQ</a>
                <a href={`${window.location.origin}/support`} className="block text-white/35 text-xs hover:text-white/65 transition-colors">Contact Us</a>
              </div>
            </div>
          </div>

          <div className="border-t border-white/6 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-white/20 text-xs font-mono">© 2026 Alpha Unlimited Technologies LLC — All rights reserved.</p>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              <span className="text-white/20 text-xs font-mono">API Operational</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
