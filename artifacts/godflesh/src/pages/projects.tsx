import { useEffect, useRef, useState, useCallback } from "react";
import { Layout } from "@/components/layout";
import { useAuth } from "@workspace/replit-auth-web";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Globe, Cpu, Gamepad2, BarChart3, Wrench, Code, Layers,
  Play, Loader2, CheckCircle, XCircle, Clock, Download, Eye,
  Trash2, Edit3, ExternalLink, Copy, Check, ChevronRight, ChevronLeft,
  Upload, AlertCircle, RefreshCw, Send, Link, X, FileCode, Zap,
  Monitor, Smartphone, Server, Package, Rocket, Settings
} from "lucide-react";
import { Button } from "@/components/ui/button";
// ── Types ──────────────────────────────────────────────────────────────────────

type ProjectType = "website" | "webapp" | "game" | "dataviz" | "api" | "tool" | "extension";

type ProjectFile = {
  id: number;
  filename: string;
  content: string;
  language: string;
};

type Project = {
  id: number;
  name: string;
  description: string;
  type: ProjectType;
  status: "idle" | "building" | "ready" | "failed";
  published: boolean;
  publishedAt: string | null;
  slug: string | null;
  customDomain: string | null;
  domainStatus: "none" | "pending" | "active" | "error";
  buildLog: string | null;
  fileCount?: number;
  files?: string[];
  createdAt: string;
  updatedAt: string;
};

// ── Constants ──────────────────────────────────────────────────────────────────

const PROJECT_TYPES: { value: ProjectType; label: string; desc: string; icon: React.ReactNode; color: string }[] = [
  { value: "website", label: "Website", desc: "Landing page, portfolio, blog", icon: <Globe className="w-5 h-5" />, color: "text-blue-400 bg-blue-400/10 border-blue-400/20" },
  { value: "webapp", label: "Web App", desc: "Full interactive application", icon: <Monitor className="w-5 h-5" />, color: "text-purple-400 bg-purple-400/10 border-purple-400/20" },
  { value: "game", label: "Game", desc: "Browser game with canvas/WebGL", icon: <Gamepad2 className="w-5 h-5" />, color: "text-green-400 bg-green-400/10 border-green-400/20" },
  { value: "dataviz", label: "Data Viz", desc: "Charts, dashboards, analytics", icon: <BarChart3 className="w-5 h-5" />, color: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20" },
  { value: "api", label: "API / Backend", desc: "REST endpoints, data service", icon: <Server className="w-5 h-5" />, color: "text-pink-400 bg-pink-400/10 border-pink-400/20" },
  { value: "tool", label: "Tool / Utility", desc: "Developer or productivity tool", icon: <Wrench className="w-5 h-5" />, color: "text-orange-400 bg-orange-400/10 border-orange-400/20" },
];

const STATUS_CONFIG = {
  idle:     { label: "Draft",    color: "text-white/40", icon: <Clock className="w-3 h-3" />, bg: "bg-white/5 border-white/10" },
  building: { label: "Building", color: "text-yellow-400", icon: <Loader2 className="w-3 h-3 animate-spin" />, bg: "bg-yellow-400/10 border-yellow-400/20" },
  ready:    { label: "Ready",    color: "text-green-400", icon: <CheckCircle className="w-3 h-3" />, bg: "bg-green-400/10 border-green-400/20" },
  failed:   { label: "Failed",   color: "text-red-400", icon: <XCircle className="w-3 h-3" />, bg: "bg-red-400/10 border-red-400/20" },
};

const TYPE_ICONS: Record<ProjectType, React.ReactNode> = {
  website: <Globe className="w-4 h-4" />,
  webapp: <Monitor className="w-4 h-4" />,
  game: <Gamepad2 className="w-4 h-4" />,
  dataviz: <BarChart3 className="w-4 h-4" />,
  api: <Server className="w-4 h-4" />,
  tool: <Wrench className="w-4 h-4" />,
  extension: <Package className="w-4 h-4" />,
};

// ── Helper ─────────────────────────────────────────────────────────────────────

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
      className="p-1 text-white/30 hover:text-white transition-colors">
      {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
    </button>
  );
}

// ── Create Project Modal ───────────────────────────────────────────────────────

function CreateProjectModal({ onClose, onCreate }: { onClose: () => void; onCreate: (p: { name: string; description: string; type: ProjectType }) => void }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<ProjectType>("website");

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }}
        className="bg-black border border-white/15 rounded-2xl p-6 max-w-2xl w-full shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-xl font-bold text-white tracking-wider">NEW PROJECT</h2>
          <button onClick={onClose} className="text-white/30 hover:text-white transition-colors"><X className="w-5 h-5" /></button>
        </div>

        <div className="space-y-4">
          {/* Name */}
          <div>
            <label className="block text-xs font-mono text-white/50 uppercase tracking-widest mb-1.5">Project Name</label>
            <input
              value={name} onChange={e => setName(e.target.value)}
              placeholder="My awesome project..."
              className="w-full bg-white/5 border border-white/10 focus:border-primary rounded-lg px-4 py-2.5 text-white font-mono text-sm outline-none transition-all placeholder:text-white/20"
              autoFocus
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-mono text-white/50 uppercase tracking-widest mb-1.5">Description (used as AI build brief)</label>
            <textarea
              value={description} onChange={e => setDescription(e.target.value)}
              placeholder="Describe what you want to build. The more detail, the better the result..."
              rows={3}
              className="w-full bg-white/5 border border-white/10 focus:border-primary rounded-lg px-4 py-2.5 text-white font-mono text-sm outline-none transition-all placeholder:text-white/20 resize-none"
            />
          </div>

          {/* Type */}
          <div>
            <label className="block text-xs font-mono text-white/50 uppercase tracking-widest mb-2">Project Type</label>
            <div className="grid grid-cols-3 gap-2">
              {PROJECT_TYPES.map(pt => (
                <button key={pt.value} onClick={() => setType(pt.value)}
                  className={`flex flex-col items-start gap-1 p-3 rounded-xl border transition-all text-left ${
                    type === pt.value ? pt.color : "border-white/8 bg-white/3 text-white/50 hover:border-white/20"
                  }`}
                >
                  {pt.icon}
                  <p className="text-[11px] font-mono font-bold">{pt.label}</p>
                  <p className="text-[9px] font-mono opacity-70">{pt.desc}</p>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <Button onClick={onClose} variant="ghost" className="flex-1 text-white/40">Cancel</Button>
          <Button
            onClick={() => { if (name.trim()) { onCreate({ name: name.trim(), description: description.trim(), type }); onClose(); } }}
            disabled={!name.trim()}
            className="flex-1 gap-2"
          >
            <Plus className="w-4 h-4" />
            Create Project
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Project Card ───────────────────────────────────────────────────────────────

function ProjectCard({ project, onClick, onDelete }: { project: Project; onClick: () => void; onDelete: () => void }) {
  const s = STATUS_CONFIG[project.status];
  const typeConf = PROJECT_TYPES.find(t => t.value === project.type);

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      className="group relative bg-white/3 border border-white/8 hover:border-primary/30 rounded-2xl overflow-hidden cursor-pointer transition-all duration-200 hover:shadow-[0_0_25px_rgba(130,80,220,0.1)]"
      onClick={onClick}
    >
      {/* Type color strip */}
      <div className={`h-1 w-full ${typeConf?.value === "website" ? "bg-blue-400/50" : typeConf?.value === "webapp" ? "bg-purple-400/50" : typeConf?.value === "game" ? "bg-green-400/50" : typeConf?.value === "dataviz" ? "bg-yellow-400/50" : typeConf?.value === "api" ? "bg-pink-400/50" : "bg-orange-400/50"}`} />

      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex items-center gap-2 min-w-0">
            <div className={`p-1.5 rounded-lg border ${typeConf?.color || "text-white/40 bg-white/5 border-white/10"}`}>
              {TYPE_ICONS[project.type]}
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-white text-sm font-mono truncate">{project.name}</h3>
              <p className="text-[9px] font-mono text-white/40 uppercase tracking-widest">{project.type}</p>
            </div>
          </div>
          <button
            onClick={e => { e.stopPropagation(); onDelete(); }}
            className="opacity-0 group-hover:opacity-100 p-1 text-white/30 hover:text-red-400 transition-all"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>

        <p className="text-white/50 text-xs font-mono line-clamp-2 mb-3">{project.description || "No description"}</p>

        <div className="flex items-center justify-between">
          <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full border text-[10px] font-mono ${s.bg} ${s.color}`}>
            {s.icon}
            {s.label}
          </div>
          <div className="flex items-center gap-2">
            {project.published && (
              <div className="flex items-center gap-1 text-[9px] font-mono text-green-400/70">
                <Rocket className="w-3 h-3" />
                LIVE
              </div>
            )}
            <span className="text-[9px] font-mono text-white/25">
              {project.fileCount || 0} file{project.fileCount !== 1 ? "s" : ""}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ── Project Detail View ────────────────────────────────────────────────────────

function ProjectDetail({ project: initialProject, onBack, onRefresh }: {
  project: Project;
  onBack: () => void;
  onRefresh: () => void;
}) {
  const [project, setProject] = useState(initialProject);
  const [files, setFiles] = useState<ProjectFile[]>([]);
  const [activeFile, setActiveFile] = useState<ProjectFile | null>(null);
  const [buildPrompt, setBuildPrompt] = useState("");
  const [building, setBuilding] = useState(false);
  const [buildLog, setBuildLog] = useState<string[]>([]);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [domainInput, setDomainInput] = useState("");
  const [showDomainPanel, setShowDomainPanel] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingFile, setEditingFile] = useState(false);
  const [editContent, setEditContent] = useState("");
  const buildLogRef = useRef<HTMLDivElement>(null);

  const BASE = window.location.origin;
  const publishedUrl = project.slug ? `${BASE}/godflesh/p/${project.slug}` : null;

  const loadFiles = useCallback(async () => {
    const res = await fetch(`/godflesh/api/omnimens/projects/${project.id}`, { credentials: "include" });
    if (res.ok) {
      const data = await res.json();
      setProject(data);
      setFiles(data.files || []);
      if (data.files?.length > 0 && !activeFile) {
        setActiveFile(data.files[0]);
      }
    }
  }, [project.id]);

  useEffect(() => { loadFiles(); }, [loadFiles]);

  useEffect(() => {
    buildLogRef.current?.scrollTo(0, buildLogRef.current.scrollHeight);
  }, [buildLog]);

  const handleBuild = async () => {
    if (building) return;
    setBuilding(true);
    setBuildLog([]);
    setProject(p => ({ ...p, status: "building" }));

    const res = await fetch(`/godflesh/api/omnimens/projects/${project.id}/build`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ prompt: buildPrompt }),
    });

    if (!res.body) { setBuilding(false); return; }
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buf = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buf += decoder.decode(value, { stream: true });
      const lines = buf.split("\n");
      buf = lines.pop() ?? "";
      for (const line of lines) {
        if (!line.startsWith("data: ")) continue;
        try {
          const data = JSON.parse(line.slice(6));
          if (data.type === "chunk") {
            setBuildLog(l => [...l, data.content]);
          } else if (data.type === "status") {
            setBuildLog(l => [...l, `\n[${data.message}]\n`]);
          } else if (data.type === "done") {
            setProject(p => ({ ...p, status: "ready" }));
            setFiles(data.files || []);
            if (data.files?.length > 0) setActiveFile(data.files[0]);
            onRefresh();
          } else if (data.type === "error") {
            setProject(p => ({ ...p, status: "failed" }));
            setBuildLog(l => [...l, `\n[ERROR: ${data.message}]`]);
          }
        } catch {}
      }
    }
    setBuilding(false);
  };

  const handlePublish = async (publish: boolean) => {
    setPublishing(true);
    try {
      const res = await fetch(`/godflesh/api/omnimens/projects/${project.id}/publish`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ publish }),
      });
      if (res.ok) {
        const data = await res.json();
        setProject(p => ({ ...p, ...data }));
        onRefresh();
      }
    } finally {
      setPublishing(false);
    }
  };

  const handleSetDomain = async () => {
    if (!domainInput.trim()) return;
    const res = await fetch(`/godflesh/api/omnimens/projects/${project.id}/domain`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ domain: domainInput }),
    });
    if (res.ok) {
      const data = await res.json();
      setProject(p => ({ ...p, customDomain: data.domain, domainStatus: "pending" }));
      setDomainInput("");
    }
  };

  const handleRemoveDomain = async () => {
    await fetch(`/godflesh/api/omnimens/projects/${project.id}/domain`, { method: "DELETE", credentials: "include" });
    setProject(p => ({ ...p, customDomain: null, domainStatus: "none" }));
  };

  const handleSaveFile = async () => {
    if (!activeFile) return;
    setSaving(true);
    try {
      await fetch(`/godflesh/api/omnimens/projects/${project.id}/files/${activeFile.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ content: editContent }),
      });
      setFiles(fs => fs.map(f => f.id === activeFile.id ? { ...f, content: editContent } : f));
      setActiveFile(af => af ? { ...af, content: editContent } : null);
      setEditingFile(false);
    } finally {
      setSaving(false);
    }
  };

  const handleDownloadZip = async () => {
    if (files.length === 0) return;
    // Simple approach: create a blob with all files concatenated in a descriptive format
    const content = files.map(f => `===FILE: ${f.filename}===\n${f.content}\n===END===`).join("\n\n");
    const blob = new Blob([content], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${project.name.toLowerCase().replace(/\s+/g, "-")}-files.txt`;
    a.click();
  };

  const s = STATUS_CONFIG[project.status];
  const typeConf = PROJECT_TYPES.find(t => t.value === project.type);
  const previewHtml = files.find(f => f.filename === "index.html")?.content || files.find(f => f.filename.endsWith(".html"))?.content;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="shrink-0 flex items-center gap-3 px-6 py-4 border-b border-white/8 bg-black/40">
        <button onClick={onBack} className="flex items-center gap-1.5 text-white/40 hover:text-white transition-colors text-sm font-mono">
          <ChevronLeft className="w-4 h-4" />
          Projects
        </button>
        <span className="text-white/20">/</span>
        <div className="flex items-center gap-2">
          <span className={typeConf?.color.split(" ")[0]}>{TYPE_ICONS[project.type]}</span>
          <h1 className="font-bold text-white font-mono">{project.name}</h1>
        </div>
        <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full border text-[10px] font-mono ${s.bg} ${s.color}`}>
          {s.icon} {s.label}
        </div>
        {project.published && (
          <div className="flex items-center gap-1 text-[10px] font-mono text-green-400 bg-green-400/10 border border-green-400/20 px-2 py-1 rounded-full">
            <Rocket className="w-3 h-3" /> LIVE
          </div>
        )}

        {/* Actions */}
        <div className="ml-auto flex items-center gap-2">
          {files.length > 0 && (
            <>
              <button onClick={handleDownloadZip}
                className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-mono text-white/50 hover:text-white border border-white/10 hover:border-white/25 rounded-lg transition-all">
                <Download className="w-3 h-3" /> DOWNLOAD
              </button>
              {previewHtml && (
                <button onClick={() => setPreviewOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-mono text-white/50 hover:text-white border border-white/10 hover:border-white/25 rounded-lg transition-all">
                  <Eye className="w-3 h-3" /> PREVIEW
                </button>
              )}
              {project.published ? (
                <button onClick={() => handlePublish(false)} disabled={publishing}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-mono text-red-400/70 hover:text-red-400 border border-red-400/20 hover:border-red-400/40 rounded-lg transition-all disabled:opacity-40">
                  {publishing ? <Loader2 className="w-3 h-3 animate-spin" /> : <X className="w-3 h-3" />} UNPUBLISH
                </button>
              ) : (
                <button onClick={() => handlePublish(true)} disabled={publishing || project.status !== "ready"}
                  className="flex items-center gap-1.5 px-4 py-1.5 text-[10px] font-mono text-white bg-primary hover:bg-primary/80 rounded-lg transition-all disabled:opacity-40 font-bold">
                  {publishing ? <Loader2 className="w-3 h-3 animate-spin" /> : <Rocket className="w-3 h-3" />} PUBLISH
                </button>
              )}
            </>
          )}
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* Left: File Explorer */}
        <div className="w-56 shrink-0 border-r border-white/8 bg-black/40 flex flex-col">
          <div className="px-3 py-2.5 border-b border-white/8">
            <p className="text-[9px] font-mono text-white/30 uppercase tracking-widest">FILES ({files.length})</p>
          </div>
          <div className="flex-1 overflow-y-auto py-1">
            {files.length === 0 ? (
              <div className="px-3 py-4 text-center">
                <FileCode className="w-6 h-6 text-white/15 mx-auto mb-1" />
                <p className="text-[9px] font-mono text-white/25">No files yet.<br />Build your project first.</p>
              </div>
            ) : (
              files.map(file => (
                <button key={file.id}
                  onClick={() => { setActiveFile(file); setEditContent(file.content); setEditingFile(false); }}
                  className={`w-full flex items-center gap-2 px-3 py-2 text-left transition-all text-xs font-mono ${
                    activeFile?.id === file.id ? "bg-primary/15 text-white border-r-2 border-primary" : "text-white/50 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <FileCode className="w-3 h-3 shrink-0" />
                  <span className="truncate">{file.filename}</span>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Center: Editor / Build Console */}
        <div className="flex-1 flex flex-col overflow-hidden min-w-0">
          {/* Build console */}
          {(building || buildLog.length > 0) && (
            <div className={`border-b border-white/8 bg-black/60 transition-all ${building ? "h-48 shrink-0" : "h-36 shrink-0"}`}>
              <div className="flex items-center justify-between px-4 py-2 border-b border-white/5">
                <div className="flex items-center gap-2 font-mono text-[10px] text-white/50">
                  {building ? <Loader2 className="w-3 h-3 animate-spin text-yellow-400" /> : <CheckCircle className="w-3 h-3 text-green-400" />}
                  <span>BUILD CONSOLE</span>
                </div>
                <button onClick={() => setBuildLog([])} className="text-white/20 hover:text-white/50 text-xs">✕</button>
              </div>
              <div ref={buildLogRef} className="flex-1 overflow-y-auto px-4 py-2 font-mono text-[10px] text-green-300/70 h-full overflow-auto">
                <pre className="whitespace-pre-wrap">{buildLog.join("")}</pre>
              </div>
            </div>
          )}

          {/* File content / editor */}
          {activeFile ? (
            <div className="flex-1 flex flex-col overflow-hidden min-h-0">
              <div className="shrink-0 flex items-center justify-between px-4 py-2 border-b border-white/5 bg-black/30">
                <span className="font-mono text-xs text-white/60">{activeFile.filename}</span>
                <div className="flex gap-2">
                  {editingFile ? (
                    <>
                      <button onClick={() => setEditingFile(false)} className="text-[10px] font-mono text-white/40 hover:text-white border border-white/10 px-2 py-1 rounded transition-all">Cancel</button>
                      <button onClick={handleSaveFile} disabled={saving}
                        className="flex items-center gap-1 text-[10px] font-mono text-primary border border-primary/30 px-2 py-1 rounded transition-all disabled:opacity-40">
                        {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />} Save
                      </button>
                    </>
                  ) : (
                    <button onClick={() => { setEditContent(activeFile.content); setEditingFile(true); }}
                      className="flex items-center gap-1 text-[10px] font-mono text-white/40 hover:text-white border border-white/10 hover:border-white/25 px-2 py-1 rounded transition-all">
                      <Edit3 className="w-3 h-3" /> Edit
                    </button>
                  )}
                </div>
              </div>
              {editingFile ? (
                <textarea
                  value={editContent}
                  onChange={e => setEditContent(e.target.value)}
                  className="flex-1 bg-black/60 text-white/80 font-mono text-xs p-4 outline-none resize-none"
                  spellCheck={false}
                />
              ) : (
                <div className="flex-1 overflow-auto">
                  <pre className="p-4 text-xs font-mono text-white/70 whitespace-pre-wrap">{activeFile.content}</pre>
                </div>
              )}
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
              <Zap className="w-12 h-12 text-primary/30 mb-4" />
              <h3 className="text-white/40 font-mono font-bold mb-2">Build your project with AI</h3>
              <p className="text-white/25 font-mono text-xs max-w-xs mb-6">Describe what you want to add or change, and OMNIMENS will build it instantly.</p>
              <div className="w-full max-w-md">
                <textarea
                  value={buildPrompt}
                  onChange={e => setBuildPrompt(e.target.value)}
                  placeholder={`Build a complete ${project.type}: ${project.description || "Describe your project..."}`}
                  rows={4}
                  className="w-full bg-white/5 border border-white/10 focus:border-primary rounded-xl px-4 py-3 text-white font-mono text-sm outline-none resize-none placeholder:text-white/20 mb-3"
                />
                <Button onClick={handleBuild} disabled={building} className="w-full gap-2">
                  {building ? <><Loader2 className="w-4 h-4 animate-spin" /> Building...</> : <><Zap className="w-4 h-4" /> Build with OMNIMENS</>}
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Right: Settings panel */}
        <div className="w-64 shrink-0 border-l border-white/8 bg-black/40 overflow-y-auto p-3 space-y-4">
          {/* AI Build panel (when files exist) */}
          {files.length > 0 && (
            <div className="rounded-xl border border-white/8 p-3">
              <p className="text-[9px] font-mono text-white/40 uppercase tracking-widest mb-2">AI BUILD</p>
              <textarea
                value={buildPrompt}
                onChange={e => setBuildPrompt(e.target.value)}
                placeholder="Describe changes or improvements..."
                rows={3}
                className="w-full bg-black/40 border border-white/8 focus:border-primary rounded-lg px-3 py-2 text-white font-mono text-xs outline-none resize-none placeholder:text-white/20 mb-2"
              />
              <Button onClick={handleBuild} disabled={building} size="sm" className="w-full gap-1.5 text-xs">
                {building ? <Loader2 className="w-3 h-3 animate-spin" /> : <Zap className="w-3 h-3" />}
                {building ? "Building..." : "Rebuild"}
              </Button>
            </div>
          )}

          {/* Published URL */}
          {project.published && publishedUrl && (
            <div className="rounded-xl border border-green-400/20 bg-green-400/5 p-3">
              <p className="text-[9px] font-mono text-green-400/70 uppercase tracking-widest mb-2">LIVE URL</p>
              <div className="flex items-center gap-1.5 bg-black/40 border border-white/8 rounded-lg px-2 py-1.5">
                <span className="text-[9px] font-mono text-white/60 truncate flex-1">{publishedUrl}</span>
                <CopyButton text={publishedUrl} />
                <a href={publishedUrl} target="_blank" rel="noopener noreferrer" className="p-1 text-white/30 hover:text-white transition-colors">
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          )}

          {/* Custom Domain */}
          {project.published && (
            <div className="rounded-xl border border-white/8 p-3">
              <div className="flex items-center justify-between mb-2">
                <p className="text-[9px] font-mono text-white/40 uppercase tracking-widest">CUSTOM DOMAIN</p>
                {project.customDomain && (
                  <button onClick={handleRemoveDomain} className="text-[9px] font-mono text-red-400/60 hover:text-red-400">Remove</button>
                )}
              </div>
              {project.customDomain ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5">
                    <div className={`w-1.5 h-1.5 rounded-full ${project.domainStatus === "active" ? "bg-green-400" : project.domainStatus === "pending" ? "bg-yellow-400 animate-pulse" : "bg-red-400"}`} />
                    <span className="font-mono text-[10px] text-white/70">{project.customDomain}</span>
                  </div>
                  {/* DNS Instructions */}
                  <div className="bg-black/40 border border-white/5 rounded-lg p-2 space-y-1">
                    <p className="text-[9px] font-mono text-white/30 uppercase">DNS SETUP — ADD CNAME RECORD:</p>
                    <div className="flex items-center justify-between">
                      <p className="text-[9px] font-mono text-white/60">Type: <span className="text-primary/80">CNAME</span></p>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-[9px] font-mono text-white/60 truncate">Name: <span className="text-primary/80">@</span></p>
                    </div>
                    <div className="flex items-center gap-1">
                      <p className="text-[9px] font-mono text-white/60 truncate flex-1">Value: <span className="text-primary/80 text-[8px]">{window.location.hostname}</span></p>
                      <CopyButton text={window.location.hostname} />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <input
                    value={domainInput}
                    onChange={e => setDomainInput(e.target.value)}
                    placeholder="yourdomain.com"
                    className="w-full bg-black/40 border border-white/8 focus:border-primary rounded-lg px-3 py-2 text-white font-mono text-[10px] outline-none placeholder:text-white/20"
                    onKeyDown={e => { if (e.key === "Enter") handleSetDomain(); }}
                  />
                  <button onClick={handleSetDomain}
                    className="w-full flex items-center justify-center gap-1.5 text-[10px] font-mono text-white/60 hover:text-white border border-white/10 hover:border-white/25 py-1.5 rounded-lg transition-all">
                    <Link className="w-3 h-3" /> Connect Domain
                  </button>
                  <p className="text-[8px] font-mono text-white/20">Point your domain's CNAME to our servers after connecting.</p>
                </div>
              )}
            </div>
          )}

          {/* Project Info */}
          <div className="rounded-xl border border-white/8 p-3">
            <p className="text-[9px] font-mono text-white/40 uppercase tracking-widest mb-2">PROJECT INFO</p>
            <div className="space-y-1.5 text-[10px] font-mono">
              <div className="flex justify-between">
                <span className="text-white/40">Type</span>
                <span className="text-white/70 capitalize">{project.type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/40">Files</span>
                <span className="text-white/70">{files.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/40">Status</span>
                <span className={s.color}>{s.label}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/40">Published</span>
                <span className={project.published ? "text-green-400" : "text-white/40"}>{project.published ? "Yes" : "No"}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Preview modal */}
      <AnimatePresence>
        {previewOpen && previewHtml && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-black/90 backdrop-blur flex flex-col">
            <div className="flex items-center gap-3 px-4 py-3 border-b border-white/10 bg-black/60 shrink-0">
              <button onClick={() => setPreviewOpen(false)} className="text-white/40 hover:text-white">
                <X className="w-5 h-5" />
              </button>
              <span className="font-mono text-xs text-white/60">PREVIEW — {project.name}</span>
              {publishedUrl && (
                <a href={publishedUrl} target="_blank" rel="noopener noreferrer"
                  className="ml-auto flex items-center gap-1.5 text-xs font-mono text-primary border border-primary/30 px-3 py-1 rounded-lg hover:bg-primary/10 transition-all">
                  <ExternalLink className="w-3.5 h-3.5" /> Open in new tab
                </a>
              )}
            </div>
            <iframe
              srcDoc={previewHtml}
              className="flex-1 w-full border-0"
              sandbox="allow-scripts allow-same-origin"
              title={`Preview: ${project.name}`}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Main Projects Page ─────────────────────────────────────────────────────────

export default function Projects() {
  const { isAuthenticated, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) setLocation("/");
  }, [isLoading, isAuthenticated, setLocation]);

  const loadProjects = async () => {
    setLoading(true);
    try {
      const res = await fetch("/godflesh/api/omnimens/projects", { credentials: "include" });
      if (res.ok) setProjects(await res.json());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (isAuthenticated) loadProjects(); }, [isAuthenticated]);

  const handleCreate = async ({ name, description, type }: { name: string; description: string; type: ProjectType }) => {
    const res = await fetch("/godflesh/api/omnimens/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ name, description, type }),
    });
    if (res.ok) {
      const project = await res.json();
      setProjects(p => [project, ...p]);
      setActiveProject(project);
    }
  };

  const handleDelete = async (id: number) => {
    await fetch(`/godflesh/api/omnimens/projects/${id}`, { method: "DELETE", credentials: "include" });
    setProjects(p => p.filter(pr => pr.id !== id));
    setDeleteConfirm(null);
    if (activeProject?.id === id) setActiveProject(null);
  };

  if (isLoading) return (
    <Layout>
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-pulse text-primary font-mono tracking-widest">LOADING...</div>
      </div>
    </Layout>
  );

  return (
    <Layout>
      <div className="flex-1 flex flex-col overflow-hidden" style={{ height: "calc(100vh - 4rem)" }}>
        {activeProject ? (
          <ProjectDetail
            project={activeProject}
            onBack={() => { setActiveProject(null); loadProjects(); }}
            onRefresh={loadProjects}
          />
        ) : (
          /* Projects dashboard */
          <div className="flex-1 overflow-y-auto p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="font-display text-2xl font-bold text-white tracking-wider mb-1">PROJECTS</h1>
                <p className="font-mono text-sm text-white/40">Build, deploy, and publish with OMNIMENS AI</p>
              </div>
              <Button onClick={() => setShowCreate(true)} className="gap-2">
                <Plus className="w-4 h-4" />
                New Project
              </Button>
            </div>

            {/* Stats bar */}
            <div className="grid grid-cols-4 gap-3 mb-6">
              {[
                { label: "Total", value: projects.length, color: "text-white" },
                { label: "Live", value: projects.filter(p => p.published).length, color: "text-green-400" },
                { label: "Ready", value: projects.filter(p => p.status === "ready").length, color: "text-blue-400" },
                { label: "Building", value: projects.filter(p => p.status === "building").length, color: "text-yellow-400" },
              ].map(s => (
                <div key={s.label} className="bg-white/3 border border-white/8 rounded-xl p-3 text-center">
                  <p className={`text-2xl font-bold font-mono ${s.color}`}>{s.value}</p>
                  <p className="text-[9px] font-mono text-white/30 uppercase tracking-widest mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Project grid */}
            {loading ? (
              <div className="flex items-center justify-center py-16 text-white/30 font-mono">
                <Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading projects...
              </div>
            ) : projects.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <Layers className="w-16 h-16 text-white/10 mb-4" />
                <h3 className="font-mono font-bold text-white/40 text-lg mb-2">No projects yet</h3>
                <p className="font-mono text-sm text-white/25 mb-6 max-w-sm">
                  Create your first project and let OMNIMENS build it for you. Websites, apps, games — anything.
                </p>
                <Button onClick={() => setShowCreate(true)} className="gap-2">
                  <Plus className="w-4 h-4" /> Create Your First Project
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {projects.map(project => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    onClick={() => setActiveProject(project)}
                    onDelete={() => setDeleteConfirm(project.id)}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Create modal */}
      <AnimatePresence>
        {showCreate && (
          <CreateProjectModal onClose={() => setShowCreate(false)} onCreate={handleCreate} />
        )}
      </AnimatePresence>

      {/* Delete confirm */}
      <AnimatePresence>
        {deleteConfirm !== null && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }}
              className="bg-black border border-red-400/30 rounded-2xl p-6 max-w-sm w-full text-center">
              <Trash2 className="w-10 h-10 text-red-400 mx-auto mb-3" />
              <h3 className="font-bold text-white text-lg mb-2">Delete Project?</h3>
              <p className="text-white/50 font-mono text-sm mb-6">This will permanently delete the project and all its files. This cannot be undone.</p>
              <div className="flex gap-3">
                <Button onClick={() => setDeleteConfirm(null)} variant="ghost" className="flex-1 text-white/40">Cancel</Button>
                <Button onClick={() => handleDelete(deleteConfirm!)} className="flex-1 bg-red-500 hover:bg-red-600 border-red-500">Delete</Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </Layout>
  );
}
