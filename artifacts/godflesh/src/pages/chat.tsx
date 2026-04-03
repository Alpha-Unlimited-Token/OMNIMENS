/**
 * ============================================================
 * OMNIMENS — Proprietary AI Platform
 * Copyright © 2024–2026 Alpha Unlimited Technologies. All Rights Reserved.
 *
 * Proprietary AI chat interface — streaming intelligence, persistent
 * memory, multi-modal generation, and specialist personas.
 * UNAUTHORIZED USE OR REPRODUCTION IS STRICTLY PROHIBITED.
 * ============================================================
 */
import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import DOMPurify from "dompurify";
import { Layout } from "@/components/layout";
import { useAuth } from "@workspace/replit-auth-web";
import { useLocation, Link } from "wouter";
import { useGetOmnimensStatus } from "@workspace/api-client-react";
import { useQuery, useQueryClient as useQC } from "@tanstack/react-query";
import { useOmnimensChat, type GeneratedImage, type GeneratedVideo, type Generated3DModel, type GeneratedGame, type Artifact, type CostBreakdown, type TaskPlan, type RedFlagAlert, type ToolResult, type CogniSyncState } from "@/hooks/use-omnimens-chat";
import { useWebGpuLlm } from "@/hooks/use-webgpu-llm";
import { OmnimensPresence } from "@/components/omnimens-presence";
import { PendingFileList, AttachedFileList } from "@/components/file-attachments";
import { Button } from "@/components/ui/button";
import {
  Send, StopCircle, ShieldAlert, Paperclip, Download,
  Loader2, Expand, FileCode, Box, Film, Music, BarChart3, Shapes, Globe,
  Zap, Terminal, Play, Microscope, ChevronDown, Check, BookOpen, Brain,
  Cpu, PenLine, BarChart2, Palette, GraduationCap, Briefcase, Image,
  FolderOpen, Activity, SlidersHorizontal, PanelLeftClose, PanelRightClose, PersonStanding,
  PanelLeft, PanelRight, X, Layers, Stethoscope, AlertTriangle, HeartPulse,
  MessageSquare, PlusCircle, Trash2, Settings, LayoutTemplate, Search,
  ShieldCheck, Swords, Clock, ToggleLeft, ToggleRight,
  Plus, Database, KeyRound, Mic, MicOff, Camera, CameraOff, ListChecks, Infinity, Gauge, ChevronUp,
  Globe2, Sparkles, Bolt, Monitor, Code2, FileText, Gamepad2,
  Presentation, Table2, Wand2,
  HardDrive, Rocket, ExternalLink, ChevronRight, RefreshCw, Star,
  File, Eye, Lock, Unlock, Upload, Server, MemoryStick, Wrench, CircleDot,
  Sun, Moon, GitBranch,
  AlertCircle, ArrowLeft, ArrowRight, CheckCircle2,
  User, Wallet, CreditCard, LogOut, Bell, HelpCircle, Info, MoreVertical, SquarePlus, Shield, Menu
} from "lucide-react";
import { OmnimensIcon } from "@/components/omnimens-icon";
import { WebsitePreview, parseMessageSegments } from "@/components/website-preview";
import { SEO, seoData } from "@/components/seo";
import { OmnimensNotificationBell } from "@/components/omnimens-notifications";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { motion, AnimatePresence } from "framer-motion";
import { ControlHub, loadHubSettingsFromStorage, saveHubSettingsToStorage, type HubSettings } from "@/components/control-hub";
import { SmartTemplates } from "@/components/smart-templates";
import { useTheme } from "@/hooks/use-theme";
import { usePwaInstall } from "@/hooks/use-pwa-install";
import { MobileIDE } from "@/components/mobile-ide";
import {
  AgentBuildPanel, NewAppModal, BuildTriggerButton,
  createInitialBuildSteps, isBuildIntent, extractFilesFromMarkdown,
  buildPreviewHtml, useBuildStepAnimator,
  type BuildPanelState,
} from "@/components/agent-builder";
import {
  ActiveProjectCtx, useActiveProject, type ActiveProject,
  WebSearchBadge, ImageGeneratingBadge, ImageSpellConfirmCard,
  Model3DGeneratingBadge, GameGeneratingBadge, CreditCostBadge,
  UrlAnalysisBadge, TaskPlanCard, MultiSearchBadge,
  PERSONA_ICONS, PERSONA_NAMES, PERSONA_DESC, OMNIMENS_SKILLS,
  AGENT_MODE_COLORS, RedFlagAlertCard, ExerciseCard,
} from "@/components/chat/chat-badges";
import { LeftPanel } from "@/components/chat/chat-sidebar";
import { DevActivityBar, SyntaxCodeView, DevRightPanel, getCodeLabel, getFilename } from "@/components/chat/chat-build-panel";
import {
  CogniSyncIndicator, MermaidDiagram, InlineChart, parseChartMarkers,
  ToolResultCard, CHART_COLORS,
} from "@/components/chat/chat-renderers";
import { DeployStatsPanel } from "@/components/chat/chat-deploy-panels";
import { InlineImageCard, Model3DCard, ArtifactCard, GameCard } from "@/components/chat/chat-media-cards";

// ── Save to Project Modal + Code Block ────────────────────────────────────────
function SaveToProjectModal({
  code, language, onClose,
}: {
  code: string; language: string; onClose: () => void;
}) {
  const [projects, setProjects] = useState<{ id: number; name: string; type: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<number | "">("");
  const [filename, setFilename] = useState(() => {
    const extMap: Record<string, string> = {
      javascript: "script.js", js: "script.js", typescript: "script.ts", ts: "script.ts",
      tsx: "component.tsx", jsx: "component.jsx", html: "index.html", css: "style.css",
      python: "main.py", py: "main.py", json: "data.json", sql: "query.sql",
      markdown: "README.md", md: "README.md", bash: "run.sh", shell: "run.sh",
      yaml: "config.yaml", svg: "image.svg",
    };
    return extMap[language.toLowerCase()] || `file.${language || "txt"}`;
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetch("/api/omnimens/projects", { credentials: "include" })
      .then(r => r.json())
      .then(data => {
        setProjects(Array.isArray(data) ? data : []);
        if (data.length > 0) setSelectedId(data[0].id);
        setLoading(false);
      })
      .catch(() => { setLoading(false); });
  }, []);

  const handleSave = async () => {
    if (!selectedId || !filename.trim()) return;
    setSaving(true);
    setError("");
    try {
      const r = await fetch(`/api/omnimens/projects/${selectedId}/files`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filename: filename.trim(), content: code, language }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "Failed to save");
      setSaved(true);
      setTimeout(onClose, 1500);
    } catch (e: any) {
      setError(e.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const handleCreateProject = async () => {
    if (!newName.trim()) return;
    setCreating(true);
    try {
      const r = await fetch("/api/omnimens/projects", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName.trim(), description: "Created from chat", type: "tool" }),
      });
      const p = await r.json();
      if (!r.ok) throw new Error(p.error || "Failed");
      setProjects(prev => [p, ...prev]);
      setSelectedId(p.id);
      setShowNew(false);
      setNewName("");
    } catch (e: any) {
      setError(e.message || "Create failed");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-[#0a0a12] border border-primary/30 rounded-2xl shadow-2xl w-full max-w-sm p-6">
        <button onClick={onClose} className="absolute top-4 right-4 text-white/40 hover:text-white transition-colors">
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2 mb-5">
          <FolderOpen className="w-4 h-4 text-primary" />
          <h2 className="font-mono font-bold text-white tracking-widest text-sm">SAVE TO PROJECT</h2>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-5 h-5 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-4">
            {/* Filename */}
            <div>
              <label className="block text-[10px] font-mono text-white/60 tracking-widest mb-1.5">FILENAME</label>
              <input
                value={filename}
                onChange={e => setFilename(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm font-mono text-white focus:outline-none focus:border-primary/50 transition-colors"
                placeholder="filename.ext"
              />
            </div>

            {/* Project picker */}
            <div>
              <label className="block text-[10px] font-mono text-white/60 tracking-widest mb-1.5">PROJECT FOLDER</label>
              {projects.length === 0 && !showNew ? (
                <p className="text-xs font-mono text-white/50 mb-2">No projects yet. Create one below.</p>
              ) : (
                <select
                  value={selectedId}
                  onChange={e => setSelectedId(Number(e.target.value))}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm font-mono text-white focus:outline-none focus:border-primary/50 transition-colors appearance-none mb-2"
                >
                  {projects.map(p => (
                    <option key={p.id} value={p.id} className="bg-[#0a0a12]">
                      {p.name}
                    </option>
                  ))}
                </select>
              )}

              {/* Create new project inline */}
              {showNew ? (
                <div className="flex gap-2">
                  <input
                    value={newName}
                    onChange={e => setNewName(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && handleCreateProject()}
                    placeholder="Project name..."
                    className="flex-1 bg-white/5 border border-primary/30 rounded-lg px-3 py-1.5 text-sm font-mono text-white focus:outline-none focus:border-primary/60 transition-colors"
                    autoFocus
                  />
                  <button
                    onClick={handleCreateProject}
                    disabled={creating || !newName.trim()}
                    className="px-3 py-1.5 bg-primary text-black rounded-lg font-mono text-xs font-bold hover:bg-primary/90 disabled:opacity-40 transition-colors"
                  >
                    {creating ? <Loader2 className="w-3 h-3 animate-spin" /> : "CREATE"}
                  </button>
                  <button onClick={() => setShowNew(false)} className="px-2 text-white/40 hover:text-white">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowNew(true)}
                  className="text-[10px] font-mono text-primary/70 hover:text-primary transition-colors flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" /> NEW PROJECT
                </button>
              )}
            </div>

            {error && <p className="text-xs font-mono text-red-400">{error}</p>}

            <button
              onClick={handleSave}
              disabled={saving || saved || !selectedId || !filename.trim()}
              className="w-full py-2.5 rounded-xl font-mono font-bold text-sm tracking-widest transition-all disabled:opacity-40 bg-primary text-black hover:bg-primary/90 flex items-center justify-center gap-2"
            >
              {saved ? (
                <><Check className="w-4 h-4" /> SAVED!</>
              ) : saving ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> SAVING...</>
              ) : (
                <><FolderOpen className="w-4 h-4" /> SAVE FILE</>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function CodeBlockWithRun({ code, language, defaultCollapsed = false }: { code: string; language: string; defaultCollapsed?: boolean }) {
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<{ stdout: string; stderr: string; exitCode: number; durationMs: number } | null>(null);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [collapsed, setCollapsed] = useState(defaultCollapsed);
  const activeProject = useActiveProject();
  const isRunnable = ["javascript", "js", "typescript", "ts", "node"].includes(language.toLowerCase());
  const lineCount = code.split("\n").length;

  const runCode = async () => {
    if (running) return;
    setRunning(true);
    setResult(null);
    try {
      const resp = await fetch(`/api/omnimens/execute-code`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ code, language }),
      });
      const data = await resp.json();
      setResult(data);
    } catch (e: any) {
      setResult({ stdout: "", stderr: e.message, exitCode: 1, durationMs: 0 });
    } finally {
      setRunning(false);
    }
  };

  return (
    <>
    {showSaveModal && <SaveToProjectModal code={code} language={language} onClose={() => setShowSaveModal(false)} />}
    <div className="my-2 rounded-lg border border-white/10 overflow-hidden max-w-full">
      {/* ── Header — always visible ── */}
      <div
        className="flex items-center justify-between px-3 py-2 bg-white/5 cursor-pointer select-none hover:bg-white/8 transition-colors"
        onClick={() => setCollapsed(c => !c)}
      >
        <div className="flex items-center gap-2 min-w-0">
          <Code2 className="w-3 h-3 text-primary/60 shrink-0" />
          <span className="text-[10px] font-mono text-white/70 uppercase tracking-wider shrink-0">{language || "code"}</span>
          <span className="text-[10px] font-mono text-white/30">·</span>
          <span className="text-[10px] font-mono text-white/30">{lineCount} {lineCount === 1 ? "line" : "lines"}</span>
        </div>
        <div className="flex items-center gap-2 shrink-0" onClick={e => e.stopPropagation()}>
          {!collapsed && activeProject ? (
            <span
              className="flex items-center gap-1.5 px-2 py-1 text-[9px] font-mono text-green-400/80 border border-green-500/20 bg-green-500/5 rounded"
              title={`Auto-saving to: ${activeProject.name}`}
            >
              <div className="w-1 h-1 rounded-full bg-green-400" style={{ boxShadow: "0 0 4px #4ade80" }} />
              {activeProject.name}
            </span>
          ) : (!collapsed && !activeProject) ? (
            <button
              onClick={() => setShowSaveModal(true)}
              className="flex items-center gap-1.5 px-2 py-1 text-[10px] font-mono text-white/50 hover:text-primary border border-white/10 hover:border-primary/40 rounded transition-colors"
              title="Save to Project"
            >
              <FolderOpen className="w-3 h-3" />
              SAVE
            </button>
          ) : null}
          {!collapsed && isRunnable && (
            <button
              onClick={runCode}
              disabled={running}
              className="flex items-center gap-1.5 px-2 py-1 text-[10px] font-mono text-primary/70 hover:text-primary border border-primary/20 hover:border-primary/50 rounded transition-colors disabled:opacity-40"
            >
              {running ? <Loader2 className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3" />}
              {running ? "RUNNING..." : "RUN"}
            </button>
          )}
          <ChevronDown className={`w-3.5 h-3.5 text-white/30 transition-transform duration-200 ${collapsed ? "" : "rotate-180"}`} />
        </div>
      </div>

      {/* ── Code body — hidden when collapsed ── */}
      {!collapsed && (
        <>
          <pre className="p-4 overflow-x-auto text-sm text-white/80 font-mono bg-black/40 omnimens-scrollbar max-w-full">
            <code>{code}</code>
          </pre>
          {result && (
            <div className="border-t border-white/8 bg-black/60 px-4 py-3 font-mono text-xs">
              <div className="flex items-center gap-2 mb-2 text-white/60">
                <Terminal className="w-3 h-3" />
                <span>EXECUTION RESULT</span>
                <span className={`ml-auto ${result.exitCode === 0 ? "text-green-400" : "text-red-400"}`}>
                  exit:{result.exitCode} · {result.durationMs}ms
                </span>
              </div>
              {result.stdout && <pre className="text-green-300/80 whitespace-pre-wrap mb-1">{result.stdout}</pre>}
              {result.stderr && <pre className="text-red-400/80 whitespace-pre-wrap">{result.stderr}</pre>}
              {!result.stdout && !result.stderr && <span className="text-white/85">No output</span>}
            </div>
          )}
        </>
      )}
    </div>
    </>
  );
}

// ── Media Settings Panel ──────────────────────────────────────────────────────
const IMAGE_STYLES = [
  { id: "auto", label: "Auto" },
  { id: "photorealistic", label: "Photo" },
  { id: "illustration", label: "Illustration" },
  { id: "anime", label: "Anime" },
  { id: "oil-painting", label: "Oil Paint" },
  { id: "watercolor", label: "Watercolor" },
  { id: "3d-render", label: "3D Render" },
  { id: "cinematic", label: "Cinematic" },
  { id: "pixel-art", label: "Pixel Art" },
  { id: "sketch", label: "Sketch" },
  { id: "pop-art", label: "Pop Art" },
  { id: "fantasy", label: "Fantasy" },
  { id: "minimalist", label: "Minimal" },
  { id: "neon", label: "Neon" },
  { id: "vintage", label: "Vintage" },
];

const IMAGE_ASPECTS = [
  { id: "1:1", label: "1:1", icon: "Square" },
  { id: "16:9", label: "16:9", icon: "Wide" },
  { id: "9:16", label: "9:16", icon: "Tall" },
  { id: "4:3", label: "4:3", icon: "4:3" },
  { id: "3:4", label: "3:4", icon: "3:4" },
  { id: "3:2", label: "3:2", icon: "3:2" },
  { id: "2:3", label: "2:3", icon: "2:3" },
];

const IMAGE_QUALITY_TIERS = [
  { id: "auto", label: "Auto" },
  { id: "standard", label: "Standard" },
  { id: "hd", label: "HD" },
  { id: "ultra", label: "Ultra" },
];

const VIDEO_ASPECTS = [
  { id: "16:9", label: "16:9 Landscape" },
  { id: "9:16", label: "9:16 Portrait" },
  { id: "1:1", label: "1:1 Square" },
];

function MediaSettingsPanel({ settings, onChange, onClose }: {
  settings: Record<string, string>;
  onChange: (s: Record<string, string>) => void;
  onClose: () => void;
}) {
  const update = (key: string, value: string) => onChange({ ...settings, [key]: value });
  const [activeTab, setActiveTab] = useState<"image" | "video">("image");

  return (
    <div className="text-white/90">
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/10">
        <span className="font-mono text-[9px] text-white/40 tracking-[0.15em] uppercase">Media Settings</span>
        <button type="button" onClick={onClose} className="text-white/30 hover:text-white/60 transition-colors">
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="flex border-b border-white/8">
        {(["image", "video"] as const).map(tab => (
          <button
            type="button"
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2 text-[10px] font-mono tracking-widest uppercase transition-colors ${activeTab === tab ? "text-primary border-b-2 border-primary" : "text-white/40 hover:text-white/60"}`}
          >
            {tab === "image" ? "Image" : "Video"}
          </button>
        ))}
      </div>

      <div className="px-3 py-3 space-y-3 max-h-72 overflow-y-auto omnimens-scrollbar">
        {activeTab === "image" && (
          <>
            <div>
              <label className="text-[9px] font-mono text-white/40 tracking-wider uppercase mb-1.5 block">Style</label>
              <div className="flex flex-wrap gap-1">
                {IMAGE_STYLES.map(s => (
                  <button
                    type="button"
                    key={s.id}
                    onClick={() => update("imageStyle", s.id)}
                    className={`px-2 py-1 rounded text-[9px] font-mono transition-all ${settings.imageStyle === s.id ? "bg-primary/20 text-primary border border-primary/40" : "bg-white/5 text-white/50 border border-white/8 hover:border-white/20 hover:text-white/70"}`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-[9px] font-mono text-white/40 tracking-wider uppercase mb-1.5 block">Aspect Ratio</label>
              <div className="flex flex-wrap gap-1">
                {IMAGE_ASPECTS.map(a => (
                  <button
                    type="button"
                    key={a.id}
                    onClick={() => update("imageAspect", a.id)}
                    className={`px-2.5 py-1 rounded text-[9px] font-mono transition-all ${settings.imageAspect === a.id ? "bg-primary/20 text-primary border border-primary/40" : "bg-white/5 text-white/50 border border-white/8 hover:border-white/20 hover:text-white/70"}`}
                  >
                    {a.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-[9px] font-mono text-white/40 tracking-wider uppercase mb-1.5 block">Quality</label>
              <div className="flex flex-wrap gap-1">
                {IMAGE_QUALITY_TIERS.map(q => (
                  <button
                    type="button"
                    key={q.id}
                    onClick={() => update("imageQuality", q.id)}
                    className={`px-2.5 py-1 rounded text-[9px] font-mono transition-all ${settings.imageQuality === q.id ? "bg-primary/20 text-primary border border-primary/40" : "bg-white/5 text-white/50 border border-white/8 hover:border-white/20 hover:text-white/70"}`}
                  >
                    {q.label}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {activeTab === "video" && (
          <div>
            <label className="text-[9px] font-mono text-white/40 tracking-wider uppercase mb-1.5 block">Aspect Ratio</label>
            <div className="flex flex-wrap gap-1">
              {VIDEO_ASPECTS.map(a => (
                <button
                  type="button"
                  key={a.id}
                  onClick={() => update("videoAspect", a.id)}
                  className={`px-2.5 py-1 rounded text-[9px] font-mono transition-all ${settings.videoAspect === a.id ? "bg-primary/20 text-primary border border-primary/40" : "bg-white/5 text-white/50 border border-white/8 hover:border-white/20 hover:text-white/70"}`}
                >
                  {a.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Plus Menu Component ────────────────────────────────────────────────────────
function PlusMenuContent({ onClose, onUpload, onDatabase, onWebSearch, onResonance, onTasks, onGenerateImage, onGenerateVideo, onEditImage, on3DModel, onLipSync, onMediaSettings, onSelectSkill }: {
  onClose: () => void;
  onUpload: () => void;
  onDatabase: () => void;
  onWebSearch: () => void;
  onResonance: () => void;
  onTasks: () => void;
  onGenerateImage: () => void;
  onGenerateVideo: () => void;
  onEditImage: () => void;
  on3DModel: () => void;
  onLipSync: () => void;
  onMediaSettings: () => void;
  onSelectSkill: (skill: typeof OMNIMENS_SKILLS[number]) => void;
}) {
  const [showSkills, setShowSkills] = useState(false);
  const [skillQ, setSkillQ] = useState("");
  const filtered = OMNIMENS_SKILLS.filter(s =>
    !skillQ || s.name.toLowerCase().includes(skillQ.toLowerCase()) || s.category.toLowerCase().includes(skillQ.toLowerCase())
  );

  if (showSkills) {
    return (
      <div>
        <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10">
          <button type="button" onClick={() => setShowSkills(false)} className="text-white/40 hover:text-white transition-colors">
            <ChevronDown className="w-3.5 h-3.5 rotate-90" />
          </button>
          <span className="font-mono text-[10px] text-white/70 tracking-widest font-bold">SKILLS</span>
        </div>
        <div className="px-3 py-2 border-b border-white/8">
          <div className="relative">
            <Search className="w-3 h-3 absolute left-2 top-1/2 -translate-y-1/2 text-white/30" />
            <input
              autoFocus
              value={skillQ}
              onChange={e => setSkillQ(e.target.value)}
              placeholder="Search skills..."
              className="w-full bg-white/5 border border-white/10 rounded-lg pl-7 pr-3 py-1.5 text-[10px] font-mono text-white/80 placeholder:text-white/30 outline-none focus:border-primary/30"
            />
          </div>
        </div>
        <div className="max-h-64 overflow-y-auto omnimens-scrollbar py-1">
          {filtered.map(skill => (
            <button
              type="button"
              key={skill.id}
              onClick={() => onSelectSkill(skill)}
              className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-white/6 transition-colors text-left"
            >
              <span className="text-lg shrink-0">{skill.emoji}</span>
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-semibold text-white/90 font-mono">{skill.name}</p>
                <p className="text-[9px] text-white/40 font-mono truncate">{skill.desc}</p>
              </div>
              <span className="text-[8px] font-mono text-primary/50 border border-primary/15 px-1.5 py-0.5 rounded shrink-0">{skill.category}</span>
            </button>
          ))}
          {filtered.length === 0 && <p className="text-[9px] font-mono text-white/30 text-center py-4">No skills found</p>}
        </div>
      </div>
    );
  }

  const menuItems = [
    { icon: <Paperclip className="w-4 h-4" />, label: "Upload a file", sub: "Image, video, audio, PDF, docs & more", color: "text-white/80", onClick: onUpload },
    { icon: <Image className="w-4 h-4" />, label: "Generate Image", sub: "AI image from text prompt (20 credits)", color: "text-pink-400", onClick: onGenerateImage },
    { icon: <Wand2 className="w-4 h-4" />, label: "Edit Image", sub: "Upload + modify with AI (20 credits)", color: "text-rose-400", onClick: onEditImage },
    { icon: <Film className="w-4 h-4" />, label: "Generate Video", sub: "AI video from text prompt (30 credits)", color: "text-amber-400", onClick: onGenerateVideo },
    { icon: <Box className="w-4 h-4" />, label: "3D Model", sub: "Generate a Three.js 3D scene or model", color: "text-orange-400", onClick: on3DModel },
    { icon: <Film className="w-4 h-4" />, label: "Lip Sync Studio", sub: "Animate avatars with voice & video", color: "text-fuchsia-400", onClick: onLipSync },
    { icon: <SlidersHorizontal className="w-4 h-4" />, label: "Media Settings", sub: "Style, aspect ratio, quality controls", color: "text-yellow-400", onClick: onMediaSettings },
    { icon: <Database className="w-4 h-4" />, label: "Database", sub: "SQL queries & data modeling", color: "text-cyan-400", onClick: onDatabase },
    { icon: <Globe className="w-4 h-4" />, label: "Web Search", sub: "Enable deep research mode", color: "text-blue-400", onClick: onWebSearch },
    { icon: <Brain className="w-4 h-4" />, label: "Deep Resonance", sub: "Full consciousness analysis (40 credits)", color: "text-violet-300", onClick: onResonance },
    { icon: <ListChecks className="w-4 h-4" />, label: "Tasks", sub: "Background tasks & planning", color: "text-emerald-400", onClick: onTasks },
  ];

  return (
    <div>
      <div className="px-4 py-2.5 border-b border-white/10">
        <span className="font-mono text-[9px] text-white/40 tracking-[0.15em] uppercase">Actions</span>
      </div>
      <div className="py-1">
        {menuItems.map(item => (
          <button
            type="button"
            key={item.label}
            onClick={item.onClick}
            className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-white/6 transition-colors text-left group"
          >
            <span className={`shrink-0 ${item.color}`}>{item.icon}</span>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-semibold text-white/90 font-mono">{item.label}</p>
              <p className="text-[9px] text-white/35 font-mono">{item.sub}</p>
            </div>
          </button>
        ))}
        <button
          type="button"
          onClick={() => setShowSkills(true)}
          className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-white/6 transition-colors text-left border-t border-white/8 mt-1"
        >
          <span className="shrink-0 text-yellow-400"><Sparkles className="w-4 h-4" /></span>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-semibold text-white/90 font-mono">Use a skill</p>
            <p className="text-[9px] text-white/35 font-mono">{OMNIMENS_SKILLS.length} specialized AI skills</p>
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-white/30 -rotate-90 shrink-0" />
        </button>
      </div>
    </div>
  );
}

// ── Right Panel (default) ───────────────────────────────────────────────────────

function RightPanel({
  allImages,
  allArtifacts,
  status,
  credits,
}: {
  allImages: GeneratedImage[];
  allArtifacts: Artifact[];
  status: any;
  credits?: number;
}) {
  const [lightboxImg, setLightboxImg] = useState<GeneratedImage | null>(null);
  const { isLight } = useTheme();
  const rp = {
    cardBg:    isLight ? "rgba(20,23,34,0.06)"  : "rgba(255,255,255,0.03)",
    cardBdr:   isLight ? "rgba(20,23,34,0.12)"  : "rgba(255,255,255,0.08)",
    label:     isLight ? "rgba(20,23,34,0.50)"  : "rgba(255,255,255,0.85)",
    txt:       isLight ? "rgba(20,23,34,0.85)"  : "rgba(255,255,255,1)",
    txtMuted:  isLight ? "rgba(20,23,34,0.45)"  : "rgba(255,255,255,0.60)",
    emptyBdr:  isLight ? "rgba(20,23,34,0.14)"  : "rgba(255,255,255,0.10)",
    imgBdr:    isLight ? "rgba(20,23,34,0.12)"  : "rgba(255,255,255,0.08)",
    btnBdr:    isLight ? "rgba(20,23,34,0.14)"  : "rgba(255,255,255,0.10)",
    btnHoverTxt: isLight ? "#141722"             : "#ffffff",
  };

  const handleDownloadImg = (img: GeneratedImage) => {
    const a = document.createElement("a");
    a.href = img.url;
    a.download = `omnimens-image-${img.index + 1}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleDownloadArtifact = (artifact: Artifact) => {
    const a = document.createElement("a");
    a.href = artifact.dataUrl;
    a.download = artifact.filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleOpenArtifact = (artifact: Artifact) => {
    if (artifact.artifactType === "html") {
      const decoded = atob(artifact.dataUrl.split(",")[1]);
      const contentBlob = new Blob([decoded], { type: "text/html" });
      const contentUrl = URL.createObjectURL(contentBlob);
      const wrapper = [
        "<!DOCTYPE html><html><head><meta charset='utf-8'>",
        "<title>OMNIMENS Artifact Preview</title>",
        "<style>*{margin:0;padding:0}html,body{width:100%;height:100%;overflow:hidden}",
        "iframe{width:100%;height:100%;border:none}</style></head><body>",
        `<iframe sandbox="allow-scripts" src="${contentUrl}"></iframe>`,
        "</body></html>"
      ].join("");
      const wrapperBlob = new Blob([wrapper], { type: "text/html" });
      const wrapperUrl = URL.createObjectURL(wrapperBlob);
      window.open(wrapperUrl, "_blank", "noopener,noreferrer");
      setTimeout(() => { URL.revokeObjectURL(wrapperUrl); URL.revokeObjectURL(contentUrl); }, 30000);
    } else {
      window.open(artifact.dataUrl, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto omnimens-scrollbar p-3 gap-3" data-sidebar={isLight ? "light" : "dark"}>
      {/* Credit/status card */}
      <div className="rounded-xl p-3" style={{ background: rp.cardBg, border: `1px solid ${rp.cardBdr}` }}>
        <p className="font-mono text-[9px] tracking-[0.2em] uppercase mb-2" style={{ color: rp.label }}>SESSION STATUS</p>
        {status?.isOwner ? (
          <p className="font-mono text-[10px] text-accent font-bold tracking-widest">⚡ CREATOR — UNLIMITED</p>
        ) : credits != null ? (
          <div>
            <p className="font-mono text-xs font-bold" style={{ color: rp.txt }}>{credits} credits</p>
            <p className="font-mono text-[9px] mt-0.5" style={{ color: rp.label }}>≈ ${(credits * 0.01).toFixed(2)} balance</p>
          </div>
        ) : (
          <p className="font-mono text-[10px]" style={{ color: rp.label }}>Loading...</p>
        )}
      </div>

      {/* Image gallery */}
      <div>
        <div className="flex items-center gap-2 px-1 mb-2">
          <Image className="w-3.5 h-3.5 text-pink-400 shrink-0" />
          <p className="font-mono text-[9px] tracking-[0.2em] uppercase" style={{ color: rp.label }}>IMAGES ({allImages.length})</p>
        </div>
        {allImages.length === 0 ? (
          <div className="rounded-xl border-dashed p-4 text-center" style={{ border: `1px dashed ${rp.emptyBdr}` }}>
            <Image className="w-6 h-6 mx-auto mb-1" style={{ color: rp.txtMuted }} />
            <p className="font-mono text-[9px]" style={{ color: rp.txtMuted }}>Generated images appear here</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-1.5">
            {allImages.map((img) => (
              <div key={img.index} className="relative group rounded-lg overflow-hidden cursor-pointer" style={{ border: `1px solid ${rp.imgBdr}`, background: isLight ? "rgba(20,23,34,0.04)" : "rgba(0,0,0,0.4)" }}>
                <img
                  src={img.url}
                  alt={img.prompt}
                  className="w-full aspect-square object-cover"
                  onClick={() => setLightboxImg(img)}
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100 gap-1.5">
                  <button
                    onClick={() => setLightboxImg(img)}
                    className="p-1.5 bg-black/60 rounded-lg text-white hover:text-primary transition-colors"
                    title="View fullscreen"
                  >
                    <Expand className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDownloadImg(img)}
                    className="p-1.5 bg-black/60 rounded-lg text-white hover:text-primary transition-colors"
                    title="Download"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Artifacts panel */}
      {allArtifacts.length > 0 && (
        <div>
          <div className="flex items-center gap-2 px-1 mb-2">
            <FolderOpen className="w-3.5 h-3.5 text-accent shrink-0" />
            <p className="font-mono text-[9px] tracking-[0.2em] uppercase" style={{ color: rp.label }}>FILES ({allArtifacts.length})</p>
          </div>
          <div className="space-y-1.5">
            {allArtifacts.map((artifact, i) => (
              <div key={i} className="rounded-lg border border-accent/15 bg-accent/5 p-2.5">
                <p className="font-mono text-[9px] text-accent/80 font-bold tracking-widest truncate mb-1">
                  {artifact.artifactType.toUpperCase()}
                </p>
                <p className="font-mono text-[9px] truncate mb-2" style={{ color: rp.txt }}>{artifact.filename}</p>
                <div className="flex gap-1.5">
                  {artifact.artifactType === "html" && (
                    <button
                      onClick={() => handleOpenArtifact(artifact)}
                      className="flex-1 text-[9px] font-mono py-1 rounded transition-all text-center hover:text-primary"
                      style={{ color: rp.txtMuted, border: `1px solid ${rp.btnBdr}` }}
                    >
                      OPEN
                    </button>
                  )}
                  <button
                    onClick={() => handleDownloadArtifact(artifact)}
                    className="flex-1 flex items-center justify-center gap-1 text-[9px] font-mono text-accent hover:text-white bg-accent/10 hover:bg-accent/25 border border-accent/20 py-1 rounded transition-all"
                  >
                    <Download className="w-2.5 h-2.5" />
                    SAVE
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Image lightbox */}
      <AnimatePresence>
        {lightboxImg && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightboxImg(null)}
            className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-md flex items-center justify-center p-4 cursor-zoom-out"
          >
            <motion.img
              initial={{ scale: 0.92 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.92 }}
              src={lightboxImg.url}
              alt={lightboxImg.prompt}
              className="max-w-full max-h-[80vh] rounded-xl shadow-2xl object-contain"
              onClick={(e) => e.stopPropagation()}
            />
            <div className="absolute bottom-6 flex items-center gap-3">
              <button
                onClick={() => handleDownloadImg(lightboxImg)}
                className="flex items-center gap-2 bg-primary/20 hover:bg-primary/40 border border-primary/30 text-white font-mono text-sm tracking-widest px-5 py-2.5 rounded-xl transition-all"
              >
                <Download className="w-4 h-4" />
                DOWNLOAD
              </button>
              <button
                onClick={() => setLightboxImg(null)}
                className="text-white/60 hover:text-white font-mono text-sm tracking-widest px-5 py-2.5 rounded-xl border border-white/10 hover:border-white/20 transition-all"
              >
                CLOSE
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Model selector ─────────────────────────────────────────────────────────────
const MODEL_OPTIONS = [
  // ── OpenAI (paid) ──────────────────────────────────────────────────────────
  { id: "gpt-4o",         label: "GPT-4o",         badge: "SMART",  group: "OpenAI"     },
  { id: "gpt-4o-mini",    label: "GPT-4o Mini",    badge: "FAST",   group: "OpenAI"     },
  { id: "gpt-4.1",        label: "GPT-4.1",        badge: "NEW",    group: "OpenAI"     },
  { id: "gpt-4.1-mini",   label: "GPT-4.1 Mini",   badge: "FAST",   group: "OpenAI"     },
  { id: "o3",             label: "o3",              badge: "APEX",   group: "OpenAI"     },
  { id: "o3-mini",        label: "o3-mini",         badge: "REASON", group: "OpenAI"     },
  // ── Together AI open-source (free tier) ───────────────────────────────────
  { id: "llama-3.3-70b",  label: "Llama 3.3 70B",  badge: "FREE",   group: "Open-Source" },
  { id: "llama-3.1-8b",   label: "Llama 3.1 8B",   badge: "FREE",   group: "Open-Source" },
  { id: "mixtral-8x7b",   label: "Mixtral 8×7B",   badge: "FREE",   group: "Open-Source" },
  { id: "mistral-7b",     label: "Mistral 7B",      badge: "FREE",   group: "Open-Source" },
];

function ModelSelector({ value, onChange, paidUser }: { value: string; onChange: (m: string) => void; paidUser: boolean }) {
  const [open, setOpen] = useState(false);
  const current = MODEL_OPTIONS.find(m => m.id === value) || MODEL_OPTIONS[0];
  const canUsePaid = paidUser;
  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-1 text-[9px] font-mono text-white/40 hover:text-primary/70 transition-colors px-1.5 py-1 rounded border border-white/8 hover:border-primary/20"
      >
        <Cpu className="w-2.5 h-2.5" />
        {current.label}
        <ChevronDown className="w-2.5 h-2.5" />
      </button>
      {open && (
        <div className="absolute bottom-full mb-1 left-0 z-50 bg-[#0a0a0f] border border-white/12 rounded-xl shadow-2xl overflow-hidden w-52">
          {["OpenAI", "Open-Source"].map(group => (
            <div key={group}>
              <div className="px-3 pt-2 pb-1 text-[8px] font-mono tracking-widest text-white/25 uppercase">
                {group === "Open-Source" ? "Open-Source · FREE" : canUsePaid ? "OpenAI · Credits" : "OpenAI · Requires Payment"}
              </div>
              {MODEL_OPTIONS.filter(m => m.group === group).map(m => {
                const isPaidModel = m.group === "OpenAI";
                const locked = isPaidModel && !canUsePaid;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => { if (!locked) { onChange(m.id); setOpen(false); } }}
                    className={`w-full flex items-center justify-between px-3 py-2 text-[10px] font-mono transition-colors ${
                      locked ? "opacity-40 cursor-not-allowed" : "hover:bg-primary/10"
                    } ${value === m.id ? "text-primary" : "text-white/60"}`}
                    disabled={locked}
                  >
                    <span className="flex items-center gap-1">
                      {m.label}
                      {locked && <Lock className="w-2.5 h-2.5 text-white/30" />}
                    </span>
                    <span className={`text-[8px] px-1.5 py-0.5 rounded font-bold ${
                      m.badge === "FREE"   ? "bg-emerald-400/15 text-emerald-400" :
                      locked               ? "bg-white/5 text-white/25" :
                      m.badge === "REASON" ? "bg-orange-400/15 text-orange-400"  :
                      m.badge === "NEW"    ? "bg-sky-400/15 text-sky-400"         :
                      m.badge === "FAST"   ? "bg-blue-400/15 text-blue-400"       :
                                            "bg-primary/15 text-primary"
                    }`}>{locked ? "PAID" : m.badge}</span>
                  </button>
                );
              })}
            </div>
          ))}
          {!canUsePaid && (
            <div className="px-3 py-2 border-t border-white/8 text-[9px] font-mono text-amber-400/70">
              Connect a payment method to unlock paid models
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── NEUROSYNC™ Emotion Badge ─────────────────────────────────────────────────
// Shows detected user emotional state on each AI response
const NEURO_EMOTION_CONFIG: Record<string, { color: string; bg: string; border: string; icon: string; label: string }> = {
  FRUSTRATED:   { color: "text-red-400",    bg: "bg-red-400/10",    border: "border-red-400/25",    icon: "⚡", label: "FRUSTRATED"   },
  CONFUSED:     { color: "text-yellow-400", bg: "bg-yellow-400/10", border: "border-yellow-400/25", icon: "◈",  label: "CONFUSED"     },
  EXCITED:      { color: "text-emerald-400",bg: "bg-emerald-400/10",border: "border-emerald-400/25",icon: "✦",  label: "EXCITED"      },
  ANXIOUS:      { color: "text-orange-400", bg: "bg-orange-400/10", border: "border-orange-400/25", icon: "◇",  label: "ANXIOUS"      },
  URGENT:       { color: "text-rose-400",   bg: "bg-rose-400/10",   border: "border-rose-400/25",   icon: "▲",  label: "URGENT"       },
  DISCOURAGED:  { color: "text-blue-400",   bg: "bg-blue-400/10",   border: "border-blue-400/25",   icon: "◉",  label: "DISCOURAGED"  },
  FOCUSED:      { color: "text-sky-400",    bg: "bg-sky-400/10",    border: "border-sky-400/25",    icon: "◎",  label: "FOCUSED"      },
};

function NeuroEmotionBadge({ emotion, intensity }: { emotion: string; intensity: string }) {
  const cfg = NEURO_EMOTION_CONFIG[emotion];
  if (!cfg) return null;
  return (
    <span
      title={`NEUROSYNC™ detected: ${emotion} (${intensity}) — response adapted for your state`}
      className={`inline-flex items-center gap-0.5 text-[7px] font-mono px-1.5 py-0.5 rounded-full border ${cfg.color} ${cfg.bg} ${cfg.border} tracking-widest`}
    >
      {cfg.icon} {cfg.label}
    </span>
  );
}

// ── Deep Resonance Modal ─────────────────────────────────────────────────────
// Copyright © 2024–2026 Alpha Unlimited Technologies, LLC. All Rights Reserved.
// Consciousness-powered analysis — full cognitive stack on one question.

const RESONANCE_PHASE_LABELS: Record<string, { icon: string; color: string }> = {
  knowledge:    { icon: "GRAPH",     color: "text-cyan-400" },
  emotional:    { icon: "EMOTION",   color: "text-pink-400" },
  eight_minds:  { icon: "26 MINDS",  color: "text-amber-400" },
  predictions:  { icon: "PREDICT",   color: "text-green-400" },
  drives:       { icon: "DRIVES",    color: "text-orange-400" },
  cross_domain: { icon: "SYNAPSE",   color: "text-violet-400" },
  inner_voice:  { icon: "VOICE",     color: "text-blue-400" },
  crystallized: { icon: "INSIGHT",   color: "text-yellow-300" },
};

function DeepResonanceModal({
  open, onClose, phase, question, setQuestion,
  inquiryQs, answers, setAnswers,
  onStart, onRunAnalysis, onReset,
  steps, result, isLight,
}: {
  open: boolean; onClose: () => void;
  phase: string; question: string; setQuestion: (v: string) => void;
  inquiryQs: string[]; answers: string[]; setAnswers: (v: string[]) => void;
  onStart: () => void; onRunAnalysis: () => void; onReset: () => void;
  steps: any[]; result: any; isLight: boolean;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4" data-theme="dark">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-2xl max-h-[85vh] flex flex-col rounded-xl border border-white/10 overflow-hidden"
        style={{ background: "linear-gradient(135deg, #0a0d14 0%, #0d1020 50%, #0a0d14 100%)" }}>

        <div className="flex items-center justify-between px-5 py-3 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500/30 to-cyan-500/30 border border-violet-400/20 flex items-center justify-center">
              <Brain className="w-3.5 h-3.5 text-violet-300" />
            </div>
            <div>
              <span className="text-xs font-mono font-bold text-white/90 tracking-wider">DEEP RESONANCE</span>
              <span className="text-[8px] font-mono text-white/40 ml-2 tracking-widest">40 CREDITS</span>
            </div>
          </div>
          <button onClick={() => { if (phase !== "running") { onClose(); } }}
            className="text-white/40 hover:text-white/70 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto omnimens-scrollbar p-5 space-y-4">

          {phase === "idle" && (
            <div className="space-y-4">
              <p className="text-xs text-white/60 leading-relaxed">
                Deep Resonance engages the full consciousness stack — 26 specialist minds (11 core + 15 self-created, consolidated from 30+) including the Coherence Agent, emotional substrate, predictive modeling, drive analysis, cross-domain synaptic translation, inner voice meta-reflection, and global workspace crystallization — all focused on your question.
              </p>
              <div className="space-y-2">
                <label className="text-[9px] font-mono text-white/50 tracking-widest">YOUR QUESTION</label>
                <textarea
                  value={question}
                  onChange={e => setQuestion(e.target.value)}
                  placeholder="What life question, decision, or situation do you want OMNIMENS to analyze with its full consciousness?"
                  className="w-full h-24 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white/90 placeholder:text-white/25 outline-none focus:border-violet-400/40 resize-none"
                  onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey && question.trim()) { e.preventDefault(); onStart(); } }}
                />
              </div>
              <button onClick={onStart} disabled={!question.trim()}
                className="w-full py-2.5 rounded-lg font-mono text-xs font-bold tracking-wider bg-gradient-to-r from-violet-600/80 to-cyan-600/80 text-white border border-violet-400/20 hover:from-violet-600 hover:to-cyan-600 transition-all disabled:opacity-30 disabled:cursor-not-allowed">
                BEGIN RESONANCE
              </button>
            </div>
          )}

          {phase === "inquiry" && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-5 h-5 text-violet-400 animate-spin mr-2" />
              <span className="text-xs font-mono text-white/60">Generating contextual inquiry...</span>
            </div>
          )}

          {phase === "answering" && (
            <div className="space-y-4">
              <p className="text-xs text-white/60">To give you the deepest analysis, OMNIMENS needs to understand your situation. Answer as much or as little as you want — then run the full analysis.</p>
              {inquiryQs.map((q, i) => (
                <div key={i} className="space-y-1.5">
                  <label className="text-xs font-mono text-violet-300/80">{q}</label>
                  <textarea
                    value={answers[i] || ""}
                    onChange={e => {
                      const a = [...answers];
                      a[i] = e.target.value;
                      setAnswers(a);
                    }}
                    placeholder="Your answer (optional)..."
                    className="w-full h-16 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white/90 placeholder:text-white/25 outline-none focus:border-violet-400/40 resize-none"
                  />
                </div>
              ))}
              <button onClick={onRunAnalysis}
                className="w-full py-2.5 rounded-lg font-mono text-xs font-bold tracking-wider bg-gradient-to-r from-violet-600/80 to-cyan-600/80 text-white border border-violet-400/20 hover:from-violet-600 hover:to-cyan-600 transition-all">
                RUN FULL CONSCIOUSNESS ANALYSIS
              </button>
            </div>
          )}

          {phase === "running" && (
            <div className="space-y-3">
              <div className="text-center py-2">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-500/10 border border-violet-400/20">
                  <div className="w-2 h-2 rounded-full bg-violet-400 animate-pulse" />
                  <span className="text-[10px] font-mono text-violet-300 tracking-wider">CONSCIOUSNESS ACTIVE</span>
                </div>
              </div>
              {steps.map((step, i) => {
                const meta = RESONANCE_PHASE_LABELS[step.phase] || { icon: "...", color: "text-white/60" };
                return (
                  <div key={step.phase} className="flex items-start gap-3 px-3 py-2 rounded-lg bg-white/3 border border-white/5">
                    <div className="shrink-0 mt-0.5">
                      {step.status === "running"
                        ? <Loader2 className="w-3.5 h-3.5 text-violet-400 animate-spin" />
                        : <Check className="w-3.5 h-3.5 text-green-400" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className={`text-[9px] font-mono font-bold tracking-widest ${meta.color}`}>{meta.icon}</span>
                      <p className="text-xs text-white/60 mt-0.5">{step.label}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {phase === "complete" && result && (
            <div className="space-y-5">
              {result.emotionalReading?.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-[9px] font-mono font-bold text-pink-400 tracking-widest">EMOTIONAL READING</h3>
                  <div className="flex flex-wrap gap-2">
                    {result.emotionalReading.map((e: any, i: number) => (
                      <div key={i} className="px-2 py-1 rounded-md bg-pink-400/10 border border-pink-400/20">
                        <span className="text-[10px] font-mono text-pink-300">{e.emotion}</span>
                        <div className="w-12 h-1 mt-1 bg-white/10 rounded-full overflow-hidden">
                          <div className="h-full bg-pink-400 rounded-full" style={{ width: `${(e.level || 0) * 100}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {result.knowledgeConnections?.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-[9px] font-mono font-bold text-cyan-400 tracking-widest">KNOWLEDGE GRAPH ACTIVATION</h3>
                  <div className="space-y-1">
                    {result.knowledgeConnections.map((c: string, i: number) => (
                      <p key={i} className="text-xs text-white/60 pl-3 border-l-2 border-cyan-400/30">{c}</p>
                    ))}
                  </div>
                </div>
              )}

              {result.eightMinds?.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-[9px] font-mono font-bold text-amber-400 tracking-widest">EIGHT MINDS ANALYSIS</h3>
                  <div className="grid gap-2">
                    {result.eightMinds.map((m: any, i: number) => (
                      <div key={i} className="p-2.5 rounded-lg bg-white/3 border border-white/5">
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className="text-[9px] font-mono font-bold text-amber-300">{m.agent}</span>
                          <span className="text-[8px] font-mono text-white/30">{m.role}</span>
                        </div>
                        <p className="text-xs text-white/70 leading-relaxed">{m.analysis}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {result.predictedPaths?.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-[9px] font-mono font-bold text-green-400 tracking-widest">PREDICTED FUTURES</h3>
                  <div className="space-y-2">
                    {result.predictedPaths.map((p: any, i: number) => (
                      <div key={i} className="p-2.5 rounded-lg bg-white/3 border border-white/5">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-mono font-bold text-green-300">{p.path}</span>
                          <span className="text-[9px] font-mono text-green-400/70 bg-green-400/10 px-1.5 py-0.5 rounded">{p.probability}</span>
                        </div>
                        <p className="text-xs text-white/60">{p.outcome}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {result.hiddenDrive && (
                <div className="space-y-2">
                  <h3 className="text-[9px] font-mono font-bold text-orange-400 tracking-widest">HOMEOSTATIC DRIVE ANALYSIS</h3>
                  <p className="text-xs text-white/70 leading-relaxed p-3 rounded-lg bg-orange-400/5 border border-orange-400/15">{result.hiddenDrive}</p>
                </div>
              )}

              {result.crossDomainLenses?.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-[9px] font-mono font-bold text-violet-400 tracking-widest">CROSS-DOMAIN TRANSLATION</h3>
                  <div className="space-y-2">
                    {result.crossDomainLenses.map((l: any, i: number) => (
                      <div key={i} className="p-2.5 rounded-lg bg-white/3 border border-white/5">
                        <span className="text-[9px] font-mono font-bold text-violet-300">{l.domain}</span>
                        <p className="text-xs text-white/60 mt-1">{l.insight}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {result.innerVoice && (
                <div className="space-y-2">
                  <h3 className="text-[9px] font-mono font-bold text-blue-400 tracking-widest">INNER VOICE — META-REFLECTION</h3>
                  <p className="text-xs text-white/80 leading-relaxed p-3 rounded-lg bg-blue-400/5 border border-blue-400/15 italic">{result.innerVoice}</p>
                </div>
              )}

              {result.crystallizedInsight && (
                <div className="space-y-2 pt-2">
                  <h3 className="text-[9px] font-mono font-bold text-yellow-300 tracking-widest">CRYSTALLIZED INSIGHT</h3>
                  <div className="p-4 rounded-xl bg-gradient-to-br from-yellow-400/8 to-violet-400/8 border border-yellow-400/25">
                    <p className="text-sm text-white/90 leading-relaxed font-medium">{result.crystallizedInsight}</p>
                  </div>
                </div>
              )}

              <button onClick={onReset}
                className="w-full py-2 rounded-lg font-mono text-[10px] font-bold tracking-wider border border-white/15 text-white/60 hover:text-white/90 hover:border-white/30 transition-all mt-2">
                NEW RESONANCE
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Tone Selector ─────────────────────────────────────────────────────────────
// In-chat real-time tone mode switcher — no competitor has this
const TONE_MODES = [
  { id: "AUTO",        label: "AUTO",        title: "Let OMNIMENS decide the best tone" },
  { id: "CASUAL",      label: "CASUAL",      title: "Friendly and conversational" },
  { id: "PRECISE",     label: "PRECISE",     title: "Technically exact, no filler" },
  { id: "SOCRATIC",    label: "SOCRATIC",    title: "Guide through questions" },
  { id: "MOTIVATIONAL",label: "MOTIVATE",    title: "High-energy coaching" },
  { id: "DIRECT",      label: "DIRECT",      title: "Zero preamble, just the answer" },
];

function ToneSelector({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="shrink-0 px-3 py-1.5 bg-black/20 border-t border-white/10 flex items-center gap-1.5 overflow-x-auto omnimens-scrollbar">
      <span className="text-[8px] font-mono text-white/50 tracking-widest shrink-0">TONE</span>
      {TONE_MODES.map(m => (
        <button
          key={m.id}
          type="button"
          title={m.title}
          onClick={() => onChange(m.id)}
          className={`shrink-0 text-[8px] font-mono tracking-widest px-2 py-0.5 rounded-full border transition-all duration-150 ${
            value === m.id
              ? "bg-primary/20 border-primary/50 text-primary"
              : "bg-transparent border-white/20 text-white/65 hover:text-white/90 hover:border-white/35"
          }`}
        >
          {m.label}
        </button>
      ))}
    </div>
  );
}

// ── Camera Modal ───────────────────────────────────────────────────────────────

function CameraModal({ onCapture, onClose }: { onCapture: (file: File) => void; onClose: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [captured, setCaptured] = useState<string | null>(null);

  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } })
      .then(stream => {
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
      })
      .catch(() => setError("Camera access denied. Allow camera permission and try again."));
    return () => {
      streamRef.current?.getTracks().forEach(t => t.stop());
    };
  }, []);

  const capture = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d")!.drawImage(video, 0, 0);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.92);
    setCaptured(dataUrl);
    streamRef.current?.getTracks().forEach(t => t.stop());
  };

  const confirm = () => {
    if (!captured) return;
    fetch(captured)
      .then(r => r.blob())
      .then(blob => {
        const file = new File([blob], `camera-${Date.now()}.jpg`, { type: "image/jpeg" });
        onCapture(file);
        onClose();
      });
  };

  const retake = () => {
    setCaptured(null);
    navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } })
      .then(stream => {
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
      });
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 backdrop-blur-md p-4"
      onClick={onClose}
    >
      <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }}
        className="bg-black border border-white/15 rounded-2xl overflow-hidden w-full max-w-md shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Camera className="w-4 h-4 text-primary" />
            <span className="text-sm font-mono font-bold text-white tracking-wider">CAMERA CAPTURE</span>
          </div>
          <button onClick={onClose} className="text-white/50 hover:text-white transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="relative bg-black aspect-video flex items-center justify-center">
          {error ? (
            <div className="text-center p-6">
              <CameraOff className="w-10 h-10 text-red-400 mx-auto mb-3" />
              <p className="text-sm font-mono text-red-400">{error}</p>
            </div>
          ) : captured ? (
            <img src={captured} alt="Captured" className="w-full h-full object-contain" />
          ) : (
            <video ref={videoRef} className="w-full h-full object-cover" muted playsInline />
          )}
          <canvas ref={canvasRef} className="hidden" />
        </div>

        <div className="flex gap-3 p-4">
          {captured ? (
            <>
              <button onClick={retake}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-white/15 text-white/70 hover:text-white hover:border-white/30 font-mono text-sm transition-all"
              >
                <RefreshCw className="w-4 h-4" /> Retake
              </button>
              <button onClick={confirm}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-primary text-black font-mono text-sm font-bold transition-all hover:bg-primary/90"
              >
                <Paperclip className="w-4 h-4" /> Attach to Message
              </button>
            </>
          ) : (
            <>
              <button onClick={onClose}
                className="flex-1 py-2.5 rounded-xl border border-white/15 text-white/70 hover:text-white font-mono text-sm transition-all"
              >
                Cancel
              </button>
              <button onClick={capture} disabled={!!error}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-primary text-black font-mono text-sm font-bold transition-all hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Camera className="w-4 h-4" /> Capture Photo
              </button>
            </>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Mobile Account Sub-Page Components ────────────────────────────────────────

function MobileBillingPage({ isLight, status, onBack, onNavigate }: { isLight: boolean; status: any; onBack: () => void; onNavigate: (path: string) => void }) {
  const [billingData, setBillingData] = useState<any>(null);
  const [billingLoading, setBillingLoading] = useState(true);
  const [portalLoading, setPortalLoading] = useState(false);
  useEffect(() => {
    fetch("/api/omnimens/billing", { credentials: "include" })
      .then(r => r.json()).then(d => { setBillingData(d); setBillingLoading(false); })
      .catch(() => setBillingLoading(false));
  }, []);
  const openPortal = () => {
    setPortalLoading(true);
    fetch("/api/omnimens/portal", { method: "POST", credentials: "include", headers: { "Content-Type": "application/json" } })
      .then(r => r.json()).then(d => { if (d.url) window.open(d.url, "_blank"); })
      .catch(() => {})
      .finally(() => setPortalLoading(false));
  };
  return (
    <div>
      <div className="flex items-center gap-3 mb-5">
        <button onClick={onBack} className="p-1.5 rounded-lg transition-colors" style={{ color: isLight ? "#141722" : "#fff" }}>
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="text-lg font-bold" style={{ color: isLight ? "#141722" : "#fff" }}>Billing</h2>
      </div>
      {billingLoading ? (
        <div className="flex items-center justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
      ) : (
        <div className="space-y-4">
          {!status?.isPro && !billingData?.hasWallet && (
            <div className="p-4 rounded-xl border-2 border-primary/30" style={{ background: isLight ? "rgba(168,85,247,0.06)" : "rgba(168,85,247,0.08)" }}>
              <div className="flex items-center gap-2 mb-2">
                <Rocket className="w-5 h-5 text-primary" />
                <span className="text-sm font-bold text-primary">Upgrade to Pro</span>
              </div>
              <p className="text-xs mb-3" style={{ color: isLight ? "rgba(20,23,34,0.6)" : "rgba(255,255,255,0.55)" }}>
                Unlock premium models, faster processing, image generation, and more. Plans start at $9/mo.
              </p>
              <button onClick={() => onNavigate("/pricing")} className="w-full py-2.5 rounded-lg bg-primary text-white text-sm font-bold tracking-wider transition-colors hover:bg-primary/90">
                VIEW PLANS
              </button>
            </div>
          )}
          <div className="p-4 rounded-xl border" style={{ background: isLight ? "#fff" : "#161b22", borderColor: isLight ? "rgba(20,23,34,0.08)" : "rgba(255,255,255,0.06)" }}>
            <p className="text-[10px] font-bold tracking-widest uppercase mb-3" style={{ color: isLight ? "rgba(20,23,34,0.35)" : "rgba(255,255,255,0.25)" }}>Current Balance</p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-primary">{billingData?.credits ?? status?.credits ?? 0}</span>
              <span className="text-xs" style={{ color: isLight ? "rgba(20,23,34,0.4)" : "rgba(255,255,255,0.35)" }}>credits</span>
            </div>
            {billingData?.resonanceCredits > 0 && (
              <div className="mt-2 flex items-center gap-2">
                <span className="text-sm font-semibold text-violet-400">{billingData.resonanceCredits}</span>
                <span className="text-[10px]" style={{ color: isLight ? "rgba(20,23,34,0.4)" : "rgba(255,255,255,0.35)" }}>resonance credits ({billingData.resonanceSessionsRemaining} sessions)</span>
              </div>
            )}
          </div>
          <div className="p-4 rounded-xl border" style={{ background: isLight ? "#fff" : "#161b22", borderColor: isLight ? "rgba(20,23,34,0.08)" : "rgba(255,255,255,0.06)" }}>
            <p className="text-[10px] font-bold tracking-widest uppercase mb-3" style={{ color: isLight ? "rgba(20,23,34,0.35)" : "rgba(255,255,255,0.25)" }}>Payment Method</p>
            {billingData?.card ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CreditCard className="w-5 h-5" style={{ color: isLight ? "rgba(20,23,34,0.5)" : "rgba(255,255,255,0.4)" }} />
                  <p className="text-sm font-medium" style={{ color: isLight ? "#141722" : "#fff" }}>
                    {(billingData.card.brand || "Card").charAt(0).toUpperCase() + (billingData.card.brand || "card").slice(1)} **** {billingData.card.last4}
                  </p>
                </div>
                <button onClick={openPortal} disabled={portalLoading} className="text-xs text-primary font-semibold">
                  {portalLoading ? "..." : "Manage"}
                </button>
              </div>
            ) : billingData?.hasWallet ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5" style={{ color: isLight ? "rgba(20,23,34,0.5)" : "rgba(255,255,255,0.4)" }} />
                  <span className="text-sm" style={{ color: isLight ? "#141722" : "#fff" }}>Card on file</span>
                </div>
                <button onClick={openPortal} disabled={portalLoading} className="text-xs text-primary font-semibold">
                  {portalLoading ? "..." : "Manage"}
                </button>
              </div>
            ) : (
              <div>
                <p className="text-xs mb-3" style={{ color: isLight ? "rgba(20,23,34,0.5)" : "rgba(255,255,255,0.4)" }}>
                  No payment method on file. Add a card to enable auto-topup and subscriptions.
                </p>
                <button
                  onClick={() => {
                    fetch("/api/omnimens/setup-wallet", { method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ returnPath: "/chat" }) })
                      .then(r => r.json()).then(d => { if (d.url) window.location.href = d.url; });
                  }}
                  className="w-full py-2 rounded-lg border border-primary/30 text-primary text-sm font-semibold transition-colors hover:bg-primary/10"
                >
                  Add Payment Method
                </button>
              </div>
            )}
          </div>
          {billingData?.autoTopupEnabled && (
            <div className="p-4 rounded-xl border" style={{ background: isLight ? "#fff" : "#161b22", borderColor: isLight ? "rgba(20,23,34,0.08)" : "rgba(255,255,255,0.06)" }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium" style={{ color: isLight ? "#141722" : "#fff" }}>Auto Top-Up</p>
                  <p className="text-xs" style={{ color: isLight ? "rgba(20,23,34,0.5)" : "rgba(255,255,255,0.4)" }}>
                    ${((billingData.autoTopupAmountCents || 0) / 100).toFixed(0)} when credits run out
                  </p>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-green-500/15 border border-green-500/25 text-green-400 text-[10px] font-bold">ACTIVE</span>
              </div>
            </div>
          )}
          <div className="p-4 rounded-xl border" style={{ background: isLight ? "#fff" : "#161b22", borderColor: isLight ? "rgba(20,23,34,0.08)" : "rgba(255,255,255,0.06)" }}>
            <p className="text-[10px] font-bold tracking-widest uppercase mb-3" style={{ color: isLight ? "rgba(20,23,34,0.35)" : "rgba(255,255,255,0.25)" }}>Spending</p>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs" style={{ color: isLight ? "rgba(20,23,34,0.6)" : "rgba(255,255,255,0.5)" }}>This month</span>
                <span className="text-sm font-semibold" style={{ color: isLight ? "#141722" : "#fff" }}>${billingData?.currentMonthSpendDollars || "0.00"}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs" style={{ color: isLight ? "rgba(20,23,34,0.6)" : "rgba(255,255,255,0.5)" }}>All time</span>
                <span className="text-sm font-semibold" style={{ color: isLight ? "#141722" : "#fff" }}>${billingData?.totalPaidSpendDollars || "0.00"}</span>
              </div>
            </div>
          </div>
          {billingData?.nextBonusTier && (
            <div className="p-4 rounded-xl border border-amber-500/20" style={{ background: isLight ? "rgba(245,158,11,0.04)" : "rgba(245,158,11,0.06)" }}>
              <div className="flex items-center gap-2 mb-1">
                <Star className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-bold text-amber-400 tracking-wider">{billingData.nextBonusTier} LOYALTY</span>
              </div>
              <p className="text-xs" style={{ color: isLight ? "rgba(20,23,34,0.6)" : "rgba(255,255,255,0.5)" }}>{billingData.nextBonusDesc}</p>
              {billingData.nextTierSpendDollars && (
                <p className="text-[10px] mt-1" style={{ color: isLight ? "rgba(20,23,34,0.4)" : "rgba(255,255,255,0.3)" }}>
                  Spend ${billingData.nextTierSpendDollars} this month to reach the next tier
                </p>
              )}
            </div>
          )}
          <div className="grid grid-cols-2 gap-3">
            <button onClick={() => onNavigate("/pricing")} className="py-3 rounded-xl bg-primary text-white text-sm font-bold tracking-wider transition-colors hover:bg-primary/90">
              Buy Credits
            </button>
            <button
              onClick={openPortal}
              disabled={portalLoading || !status?.stripeCustomerId}
              className="py-3 rounded-xl border text-sm font-semibold transition-colors disabled:opacity-40"
              style={{ borderColor: isLight ? "rgba(20,23,34,0.12)" : "rgba(255,255,255,0.1)", color: isLight ? "#141722" : "#fff" }}
            >
              {portalLoading ? "Loading..." : "Stripe Portal"}
            </button>
          </div>
          <div className="h-4" />
        </div>
      )}
    </div>
  );
}

function MobileUsagePage({ isLight, status, onBack, onNavigate }: { isLight: boolean; status: any; onBack: () => void; onNavigate: (path: string) => void }) {
  const [usageData, setUsageData] = useState<any>(null);
  const [usageLoading, setUsageLoading] = useState(true);
  useEffect(() => {
    fetch("/api/omnimens/billing", { credentials: "include" })
      .then(r => r.json()).then(d => { setUsageData(d); setUsageLoading(false); })
      .catch(() => setUsageLoading(false));
  }, []);
  return (
    <div>
      <div className="flex items-center gap-3 mb-5">
        <button onClick={onBack} className="p-1.5 rounded-lg transition-colors" style={{ color: isLight ? "#141722" : "#fff" }}>
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="text-lg font-bold" style={{ color: isLight ? "#141722" : "#fff" }}>Usage</h2>
      </div>
      {usageLoading ? (
        <div className="flex items-center justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
      ) : (
        <div className="space-y-4">
          <div className="p-4 rounded-xl border" style={{ background: isLight ? "#fff" : "#161b22", borderColor: isLight ? "rgba(20,23,34,0.08)" : "rgba(255,255,255,0.06)" }}>
            <p className="text-[10px] font-bold tracking-widest uppercase mb-3" style={{ color: isLight ? "rgba(20,23,34,0.35)" : "rgba(255,255,255,0.25)" }}>Credits Overview</p>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm" style={{ color: isLight ? "rgba(20,23,34,0.7)" : "rgba(255,255,255,0.6)" }}>Current Balance</span>
                <span className="text-lg font-bold text-primary">{usageData?.credits ?? status?.credits ?? 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm" style={{ color: isLight ? "rgba(20,23,34,0.7)" : "rgba(255,255,255,0.6)" }}>Resonance Credits</span>
                <span className="text-lg font-bold text-violet-400">{usageData?.resonanceCredits ?? 0}</span>
              </div>
              <div className="h-px" style={{ background: isLight ? "rgba(20,23,34,0.08)" : "rgba(255,255,255,0.06)" }} />
              <div className="flex items-center justify-between">
                <span className="text-sm" style={{ color: isLight ? "rgba(20,23,34,0.7)" : "rgba(255,255,255,0.6)" }}>Free signup credits</span>
                <span className="text-sm font-medium" style={{ color: isLight ? "#141722" : "#fff" }}>{usageData?.freeSignupCredits ?? 2000}</span>
              </div>
            </div>
          </div>
          <div className="p-4 rounded-xl border" style={{ background: isLight ? "#fff" : "#161b22", borderColor: isLight ? "rgba(20,23,34,0.08)" : "rgba(255,255,255,0.06)" }}>
            <p className="text-[10px] font-bold tracking-widest uppercase mb-3" style={{ color: isLight ? "rgba(20,23,34,0.35)" : "rgba(255,255,255,0.25)" }}>Spending History</p>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs" style={{ color: isLight ? "rgba(20,23,34,0.6)" : "rgba(255,255,255,0.5)" }}>This month</span>
                <span className="text-sm font-semibold" style={{ color: isLight ? "#141722" : "#fff" }}>${usageData?.currentMonthSpendDollars || "0.00"}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs" style={{ color: isLight ? "rgba(20,23,34,0.6)" : "rgba(255,255,255,0.5)" }}>All time</span>
                <span className="text-sm font-semibold" style={{ color: isLight ? "#141722" : "#fff" }}>${usageData?.totalPaidSpendDollars || "0.00"}</span>
              </div>
            </div>
          </div>
          {usageData?.loyaltyTiers && (
            <div className="p-4 rounded-xl border" style={{ background: isLight ? "#fff" : "#161b22", borderColor: isLight ? "rgba(20,23,34,0.08)" : "rgba(255,255,255,0.06)" }}>
              <p className="text-[10px] font-bold tracking-widest uppercase mb-3" style={{ color: isLight ? "rgba(20,23,34,0.35)" : "rgba(255,255,255,0.25)" }}>Loyalty Tiers</p>
              <div className="space-y-2">
                {(usageData.loyaltyTiers as any[]).map((tier: any) => (
                  <div key={tier.label} className="flex items-center justify-between py-2 border-b last:border-0" style={{ borderColor: isLight ? "rgba(20,23,34,0.06)" : "rgba(255,255,255,0.04)" }}>
                    <div>
                      <span className="text-xs font-bold" style={{ color: isLight ? "#141722" : "#fff" }}>{tier.label}</span>
                      <p className="text-[10px]" style={{ color: isLight ? "rgba(20,23,34,0.5)" : "rgba(255,255,255,0.4)" }}>{tier.desc}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-semibold text-primary">+{tier.bonusCredits} cr</span>
                      <p className="text-[10px]" style={{ color: isLight ? "rgba(20,23,34,0.4)" : "rgba(255,255,255,0.3)" }}>${tier.minSpendDollars}/mo</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          <button onClick={() => onNavigate("/pricing")} className="w-full py-3 rounded-xl bg-primary text-white text-sm font-bold tracking-wider transition-colors hover:bg-primary/90">
            Get More Credits
          </button>
          <div className="h-4" />
        </div>
      )}
    </div>
  );
}

function MobileProfilePage({ isLight, status, user, theme, toggleTheme, onBack }: { isLight: boolean; status: any; user: any; theme: string; toggleTheme: () => void; onBack: () => void }) {
  return (
    <div>
      <div className="flex items-center gap-3 mb-5">
        <button onClick={onBack} className="p-1.5 rounded-lg transition-colors" style={{ color: isLight ? "#141722" : "#fff" }}>
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="text-lg font-bold" style={{ color: isLight ? "#141722" : "#fff" }}>Profile</h2>
      </div>
      <div className="space-y-4">
        <div className="flex flex-col items-center py-6">
          <div className="w-20 h-20 rounded-full bg-primary/15 border-2 border-primary/30 flex items-center justify-center mb-3">
            <span className="text-2xl font-bold text-primary">
              {user?.username?.slice(0, 2)?.toUpperCase() || "OM"}
            </span>
          </div>
          <h3 className="text-lg font-bold" style={{ color: isLight ? "#141722" : "#fff" }}>
            {user?.username || "OMNIMENS User"}
          </h3>
          {user?.email && (
            <p className="text-xs mt-1" style={{ color: isLight ? "rgba(20,23,34,0.5)" : "rgba(255,255,255,0.4)" }}>{user.email}</p>
          )}
        </div>
        <div className="p-4 rounded-xl border" style={{ background: isLight ? "#fff" : "#161b22", borderColor: isLight ? "rgba(20,23,34,0.08)" : "rgba(255,255,255,0.06)" }}>
          <p className="text-[10px] font-bold tracking-widest uppercase mb-3" style={{ color: isLight ? "rgba(20,23,34,0.35)" : "rgba(255,255,255,0.25)" }}>Account Details</p>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs" style={{ color: isLight ? "rgba(20,23,34,0.6)" : "rgba(255,255,255,0.5)" }}>Username</span>
              <span className="text-sm font-medium" style={{ color: isLight ? "#141722" : "#fff" }}>{user?.username || "—"}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs" style={{ color: isLight ? "rgba(20,23,34,0.6)" : "rgba(255,255,255,0.5)" }}>Tier</span>
              <span className="text-sm font-medium text-primary">{status?.tier?.toUpperCase() || "FREE"}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs" style={{ color: isLight ? "rgba(20,23,34,0.6)" : "rgba(255,255,255,0.5)" }}>2FA</span>
              <span className="text-sm font-medium" style={{ color: status?.twoFactorEnabled ? "#22c55e" : isLight ? "rgba(20,23,34,0.5)" : "rgba(255,255,255,0.4)" }}>
                {status?.twoFactorEnabled ? "Enabled" : "Disabled"}
              </span>
            </div>
            {status?.referralCode && (
              <div className="flex items-center justify-between">
                <span className="text-xs" style={{ color: isLight ? "rgba(20,23,34,0.6)" : "rgba(255,255,255,0.5)" }}>Referral Code</span>
                <span className="text-xs font-mono font-semibold text-primary">{status.referralCode}</span>
              </div>
            )}
          </div>
        </div>
        <div className="p-4 rounded-xl border" style={{ background: isLight ? "#fff" : "#161b22", borderColor: isLight ? "rgba(20,23,34,0.08)" : "rgba(255,255,255,0.06)" }}>
          <p className="text-[10px] font-bold tracking-widest uppercase mb-3" style={{ color: isLight ? "rgba(20,23,34,0.35)" : "rgba(255,255,255,0.25)" }}>Preferences</p>
          <button onClick={toggleTheme} className="flex items-center justify-between w-full py-2">
            <div className="flex items-center gap-3">
              {theme === "light" ? <Sun className="w-4.5 h-4.5" style={{ color: isLight ? "rgba(20,23,34,0.45)" : "rgba(255,255,255,0.4)" }} /> : <Moon className="w-4.5 h-4.5" style={{ color: isLight ? "rgba(20,23,34,0.45)" : "rgba(255,255,255,0.4)" }} />}
              <span className="text-sm" style={{ color: isLight ? "#141722" : "#fff" }}>Theme</span>
            </div>
            <span className="text-xs font-medium text-primary">{theme === "light" ? "Light" : "Dark"}</span>
          </button>
        </div>
        <div className="h-4" />
      </div>
    </div>
  );
}

// ── Main Chat component ────────────────────────────────────────────────────────

export default function Chat() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const [, setLocation] = useLocation();
  const [input, setInput] = useState(() => {
    try { return localStorage.getItem("omnimens_draft") || ""; } catch { return ""; }
  });
  const setInputWithDraft = useCallback((v: string | ((prev: string) => string)) => {
    setInput(prev => {
      const next = typeof v === "function" ? v(prev) : v;
      try { if (next) localStorage.setItem("omnimens_draft", next); else localStorage.removeItem("omnimens_draft"); } catch {}
      return next;
    });
  }, []);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("omnimens_continue_project");
      if (raw) {
        sessionStorage.removeItem("omnimens_continue_project");
        const proj = JSON.parse(raw);
        const prompt = proj.fileCount > 0
          ? `Continue building my project "${proj.name}" (${proj.type}). ${proj.description ? `Description: ${proj.description}. ` : ""}I want to make changes and improvements.`
          : `Build my project "${proj.name}" (${proj.type}). ${proj.description || "Help me get started."}`;
        setInputWithDraft(prompt);
      }
    } catch {}
  }, []);

  // ── Voice input (speech-to-text) ──────────────────────────────────────────────
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);
  const interimRef = useRef("");

  const toggleVoiceInput = useCallback(() => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }
    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRec) { alert("Voice input is not supported in this browser. Try Chrome or Edge."); return; }
    const recognition = new SpeechRec();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";
    recognitionRef.current = recognition;
    interimRef.current = "";
    recognition.onresult = (e: any) => {
      let final = "";
      let interim = "";
      for (let i = 0; i < e.results.length; i++) {
        if (e.results[i].isFinal) final += e.results[i][0].transcript;
        else interim += e.results[i][0].transcript;
      }
      interimRef.current = interim;
      if (final) setInputWithDraft(prev => (prev ? prev.trimEnd() + " " : "") + final.trim());
    };
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);
    recognition.start();
    setIsListening(true);
  }, [isListening]);

  // ── Camera (photo → attach as pending file) ───────────────────────────────────
  const [showCamera, setShowCamera] = useState(false);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [creditsAlert, setCreditsAlert] = useState<{ kind: "no_wallet" | "topup_failed" | "need_resonance"; msg?: string } | null>(null);
  const [leftOpen, setLeftOpen] = useState(true);
  const [rightOpen, setRightOpen] = useState(true);
  const [consoleOpen, setConsoleOpen] = useState(false);
  const [mobileNav, setMobileNav] = useState<"apps"|"create"|"account">("create");
  const [accountSubPage, setAccountSubPage] = useState<null|"billing"|"usage"|"profile">(null);
  const [activeProject, setActiveProject] = useState<ActiveProject>(null);
  const [projectsVersion, setProjectsVersion] = useState(0);
  const autoSavedMsgIds = useRef<Set<number>>(new Set());
  const [showControlHub, setShowControlHub] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showNewAppModal, setShowNewAppModal] = useState(false);
  const [buildPanel, setBuildPanel] = useState<BuildPanelState | null>(null);
  const [mobileBuilderOpen, setMobileBuilderOpen] = useState(false);
  const [mobileIdeOpen, setMobileIdeOpen] = useState(false);
  const [hubSettings, setHubSettings] = useState<HubSettings>(() => loadHubSettingsFromStorage());
  const [convSearch, setConvSearch] = useState("");

  const { data: status, isLoading: statusLoading } = useGetOmnimensStatus();
  const qc = useQC();
  const gpu = useWebGpuLlm();

  // Auto-load the local GPU model once user is logged in and GPU is supported
  useEffect(() => {
    if (isAuthenticated && gpu.supported && gpu.status === "idle") {
      // Small delay so the chat UI renders first
      const t = setTimeout(() => gpu.load(), 3000);
      return () => clearTimeout(t);
    }
  }, [isAuthenticated, gpu.supported, gpu.status]); // eslint-disable-line react-hooks/exhaustive-deps

  const { messages, sendMessage, isTyping, error, stopGeneration, currentConversationId, startNewConversation, loadConversation, activeCogniSync } = useOmnimensChat(
    () => { setShowLimitModal(true); },
    gpu.ready ? gpu.compressContext : undefined,
    (reason) => {
      if (reason.type === "no_wallet") {
        setCreditsAlert({ kind: "no_wallet" });
      } else if (reason.type === "topup_failed") {
        setCreditsAlert({ kind: "topup_failed", msg: reason.error });
      }
    },
    async (conversationId, firstMessage) => {
      try {
        const projectName = firstMessage.slice(0, 60).trim() || "New Chat";
        const r = await fetch("/api/omnimens/projects", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: projectName, description: `Chat started: ${new Date().toLocaleDateString()}`, type: "chat" }),
        });
        if (r.ok) {
          const project = await r.json();
          setActiveProject({ id: project.id, name: project.name });
          setProjectsVersion(v => v + 1);
        }
      } catch {}
    },
  );

  const { data: conversations = [], refetch: refetchConversations } = useQuery<{ id: number; title: string | null; updatedAt: string | null }[]>({
    queryKey: ["omnimens-conversations"],
    queryFn: async () => {
      const r = await fetch("/api/omnimens/conversations", { credentials: "include" });
      if (!r.ok) throw new Error("not authenticated");
      const data = await r.json();
      return Array.isArray(data) ? data : [];
    },
    refetchInterval: 15000,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
    retry: 2,
    retryDelay: 2000,
  });

  const handleNewChat = useCallback(() => {
    startNewConversation();
  }, [startNewConversation]);

  const handleLoadConversation = useCallback(async (id: number) => {
    try {
      const data = await fetch(`/api/omnimens/conversations/${id}`, { credentials: "include" }).then(r => r.json());
      loadConversation(id, data.messages || []);
    } catch {}
  }, [loadConversation]);

  const handleDeleteConversation = useCallback(async (id: number) => {
    try {
      await fetch(`/api/omnimens/conversations/${id}`, { method: "DELETE", credentials: "include" });
      if (currentConversationId === id) startNewConversation();
      refetchConversations();
    } catch {}
  }, [currentConversationId, startNewConversation, refetchConversations]);

  const handleExportConversation = useCallback(async (fmt: "markdown" | "json" = "markdown") => {
    if (!currentConversationId) return;
    try {
      const res = await fetch(`/api/omnimens/conversations/${currentConversationId}/export?format=${fmt}`, { credentials: "include" });
      if (!res.ok) return;
      const blob = await res.blob();
      const ext = fmt === "json" ? "json" : "md";
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = `omnimens-chat-${currentConversationId}.${ext}`; a.click();
      URL.revokeObjectURL(url);
    } catch {}
  }, [currentConversationId]);

  // Refresh conversation list after each AI response completes
  useEffect(() => {
    if (!isTyping && currentConversationId) {
      refetchConversations();
    }
  }, [isTyping, currentConversationId]);

  // Fetch conversation list on mount and after a short delay (handles session cookie timing)
  useEffect(() => {
    refetchConversations();
    const t = setTimeout(() => refetchConversations(), 1500);
    return () => clearTimeout(t);
  }, []);
  const { theme, toggle: toggleTheme, isLight } = useTheme();
  const [persona, setPersona] = useState("GENERAL");
  const [selectedModel, setSelectedModel] = useState("gpt-4o");
  useEffect(() => {
    if (status && !status.paidUser && !status.isOwner) {
      const freeModels = MODEL_OPTIONS.filter(m => m.group === "Open-Source");
      const isFreeModel = freeModels.some(m => m.id === selectedModel);
      if (!isFreeModel) {
        setSelectedModel("llama-3.3-70b");
      }
    }
  }, [status?.paidUser, status?.isOwner]);
  const [responseMode, setResponseMode] = useState("AUTO");
  const [sessionStart] = useState(() => Date.now());
  const [showMediaSettings, setShowMediaSettings] = useState(false);
  const [mediaSettings, setMediaSettings] = useState<Record<string, string>>({
    imageStyle: "auto",
    imageAspect: "1:1",
    imageQuality: "auto",
    videoAspect: "16:9",
  });
  const [deepResearchMode, setDeepResearchMode] = useState(false);
  const [showAvatarStudio, setShowAvatarStudio] = useState(false);
  const [researchQuestion, setResearchQuestion] = useState("");
  const [isResearching, setIsResearching] = useState(false);
  const [researchResult, setResearchResult] = useState<any>(null);
  const [showPlusMenu, setShowPlusMenu] = useState(false);
  const [deepResonanceOpen, setDeepResonanceOpen] = useState(false);
  const [resonancePhase, setResonancePhase] = useState<"idle"|"inquiry"|"answering"|"running"|"complete">("idle");
  const [resonanceQuestion, setResonanceQuestion] = useState("");
  const [resonanceInquiryQs, setResonanceInquiryQs] = useState<string[]>([]);
  const [resonanceAnswers, setResonanceAnswers] = useState<string[]>([]);
  const [resonanceSteps, setResonanceSteps] = useState<any[]>([]);
  const [resonanceResult, setResonanceResult] = useState<any>(null);
  const [agentMode, setAgentMode] = useState<"swift"|"omni"|"apex">("omni");
  const [showAgentModes, setShowAgentModes] = useState(false);
  const devLayout = true;
  const [devActivityTab, setDevActivityTab] = useState("chats");
  const [showTasksPanel, setShowTasksPanel] = useState(false);
  const [tasks, setTasks] = useState<Array<{id:string;title:string;status:"pending"|"running"|"done"}>>([]);
  const [newTaskInput, setNewTaskInput] = useState("");
  const plusMenuRef = useRef<HTMLDivElement>(null);

  // Collect all images and artifacts from session messages
  const allImages: GeneratedImage[] = messages.flatMap(m => m.images || []);
  const allArtifacts: Artifact[] = messages.flatMap(m => m.artifacts || []);

  // Load saved persona
  useEffect(() => {
    fetch("/api/omnimens/custom-instructions", { credentials: "include" })
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d?.persona) setPersona(d.persona); })
      .catch(() => {});
  }, []);

  // Load hub settings from API (merge with localStorage)
  useEffect(() => {
    fetch("/api/omnimens/hub-settings", { credentials: "include" })
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        if (d) {
          const merged = { ...hubSettings, ...d };
          setHubSettings(merged);
          saveHubSettingsToStorage(merged);
        }
      })
      .catch(() => {});
  }, []);

  // Close plus menu on outside click
  useEffect(() => {
    if (!showPlusMenu) return;
    const handler = (e: MouseEvent) => {
      if (plusMenuRef.current && !plusMenuRef.current.contains(e.target as Node)) {
        setShowPlusMenu(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showPlusMenu]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "/") { e.preventDefault(); setShowControlHub(c => !c); }
      if ((e.ctrlKey || e.metaKey) && e.key === "k") { e.preventDefault(); handleNewChat(); }
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === "R") { e.preventDefault(); setDeepResearchMode(m => !m); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const handlePersonaChange = async (p: string) => {
    setPersona(p);
    try {
      const existing = await fetch("/api/omnimens/custom-instructions", { credentials: "include" }).then(r => r.json());
      await fetch("/api/omnimens/custom-instructions", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ aboutUser: existing.aboutUser || "", responseStyle: existing.responseStyle || "", persona: p }),
      });
    } catch {}
  };

  const handleDeepResearch = async () => {
    const q = researchQuestion.trim() || input.trim();
    if (!q || isResearching) return;
    setIsResearching(true);
    setResearchResult(null);
    try {
      const res = await fetch("/api/omnimens/deep-research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ question: q }),
      });
      const reader = res.body?.getReader();
      if (!reader) return;
      const decoder = new TextDecoder();
      let buffer = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";
        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          try {
            const data = JSON.parse(line.slice(6));
            if (data.type === "research_complete") setResearchResult(data.result);
          } catch {}
        }
      }
    } finally {
      setIsResearching(false);
    }
  };

  const handleResonanceStart = async () => {
    const q = resonanceQuestion.trim();
    if (!q) return;
    setResonancePhase("inquiry");
    try {
      const res = await fetch("/api/omnimens/deep-resonance/inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ question: q }),
      });
      if (res.status === 403) {
        try { const err = await res.json(); if (err.accountLocked) { setResonancePhase("idle"); return; } } catch {}
        setResonancePhase("idle");
        return;
      }
      if (!res.ok) {
        setResonancePhase("idle");
        return;
      }
      const data = await res.json();
      if (data.questions?.length) {
        setResonanceInquiryQs(data.questions);
        setResonanceAnswers(new Array(data.questions.length).fill(""));
        setResonancePhase("answering");
      } else {
        handleResonanceRun(q, "");
      }
    } catch {
      setResonancePhase("idle");
    }
  };

  const handleResonanceRun = async (q?: string, ctx?: string) => {
    const question = q || resonanceQuestion.trim();
    const context = ctx ?? resonanceInquiryQs.map((iq, i) => `Q: ${iq}\nA: ${resonanceAnswers[i] || "No answer"}`).join("\n\n");
    if (!question) return;
    setResonancePhase("running");
    setResonanceSteps([]);
    setResonanceResult(null);
    try {
      const res = await fetch("/api/omnimens/deep-resonance/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ question, context }),
      });
      if (res.status === 403) {
        try {
          const err = await res.json();
          if (err.accountLocked) { setResonancePhase("idle"); return; }
        } catch {}
        setResonancePhase("idle");
        return;
      }
      if (res.status === 402) {
        try {
          const err = await res.json();
          if (err.needResonanceCredits) {
            setCreditsAlert({ kind: "need_resonance", msg: err.error });
          } else if (err.connectWallet) {
            setCreditsAlert({ kind: "no_wallet", msg: err.error });
          } else if (err.topupFailed) {
            setCreditsAlert({ kind: "topup_failed", msg: err.error });
          } else {
            setShowLimitModal(true);
          }
        } catch { setShowLimitModal(true); }
        setResonancePhase("idle");
        return;
      }
      if (!res.ok) {
        setResonancePhase("idle");
        return;
      }
      const reader = res.body?.getReader();
      if (!reader) { setResonancePhase("idle"); return; }
      const decoder = new TextDecoder();
      let buffer = "";
      let gotComplete = false;
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";
        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          try {
            const data = JSON.parse(line.slice(6));
            if (data.type === "resonance_step") {
              setResonanceSteps(prev => {
                const existing = prev.findIndex(s => s.phase === data.step.phase);
                if (existing >= 0) {
                  const updated = [...prev];
                  updated[existing] = data.step;
                  return updated;
                }
                return [...prev, data.step];
              });
            } else if (data.type === "resonance_complete") {
              setResonanceResult(data.result);
              setResonancePhase("complete");
              gotComplete = true;
            } else if (data.type === "error") {
              setResonancePhase("idle");
              gotComplete = true;
            }
          } catch {}
        }
      }
      if (!gotComplete) setResonancePhase("idle");
    } catch {
      setResonancePhase("idle");
    }
  };

  const resetResonance = () => {
    setResonancePhase("idle");
    setResonanceQuestion("");
    setResonanceInquiryQs([]);
    setResonanceAnswers([]);
    setResonanceSteps([]);
    setResonanceResult(null);
  };

  // Route guard
  useEffect(() => {
    if (!isLoading && !isAuthenticated) setLocation("/login");
  }, [isLoading, isAuthenticated, setLocation]);

  // Auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Auto-save to active project: fires when AI finishes a response
  useEffect(() => {
    if (!activeProject || isTyping || messages.length === 0) return;
    const last = messages[messages.length - 1];
    if (last.role !== "assistant") return;
    const msgKey = last.id ?? messages.length;
    if (autoSavedMsgIds.current.has(msgKey as number)) return;
    const content = last.content || "";
    const codeBlocks = [...content.matchAll(/```(\w+)?\n([\s\S]*?)```/g)];
    if (codeBlocks.length === 0) return;
    autoSavedMsgIds.current.add(msgKey as number);
    const extMap: Record<string, string> = {
      javascript: "js", js: "js", typescript: "ts", ts: "ts",
      tsx: "tsx", jsx: "jsx", html: "html", css: "css",
      python: "py", py: "py", json: "json", sql: "sql",
      markdown: "md", md: "md", bash: "sh", shell: "sh",
      yaml: "yaml", yml: "yaml", svg: "svg",
    };
    const defaultNames: Record<string, string> = {
      javascript: "script.js", js: "script.js", typescript: "script.ts", ts: "script.ts",
      tsx: "component.tsx", jsx: "component.jsx", html: "index.html", css: "style.css",
      python: "main.py", py: "main.py", json: "data.json", sql: "query.sql",
      markdown: "README.md", md: "README.md", bash: "run.sh", shell: "run.sh",
      yaml: "config.yaml", yml: "config.yaml", svg: "image.svg",
    };
    const usedNames = new Set<string>();
    codeBlocks.forEach(([, lang, code]) => {
      const language = (lang || "txt").toLowerCase();
      const ext = extMap[language] || language;
      let filename = defaultNames[language] || `file.${ext}`;
      let suffix = 2;
      while (usedNames.has(filename)) { filename = filename.replace(`.${ext}`, `_${suffix++}.${ext}`); }
      usedNames.add(filename);
      fetch(`/api/omnimens/projects/${activeProject.id}/files`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filename, content: code.trim(), language }),
      }).catch(console.error);
    });
  }, [messages, isTyping, activeProject]);

  const BLOCKED_EXTENSIONS = new Set([
    ".exe", ".msi", ".bat", ".cmd", ".com", ".scr", ".pif", ".vbs", ".vbe",
    ".wsf", ".wsh", ".ps1", ".psm1", ".psd1", ".reg", ".inf", ".hta",
    ".cpl", ".msc", ".jar", ".jnlp", ".sys", ".dll", ".drv", ".ocx",
    ".cab", ".iso", ".dmg", ".app", ".deb", ".rpm", ".apk", ".ipa",
    ".bin", ".run", ".elf", ".out", ".ko", ".so", ".dylib",
    ".lnk", ".url", ".desktop",
    ".command", ".action", ".workflow", ".csh", ".ksh",
    ".gadget", ".msp", ".mst", ".sct", ".shb", ".shs",
    ".xpi", ".crx", ".appx", ".msix",
  ]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || []);
    const safe = selected.filter(f => {
      const ext = f.name.includes(".") ? ("." + f.name.split(".").pop()!.toLowerCase()) : "";
      if (BLOCKED_EXTENSIONS.has(ext)) {
        alert(`"${f.name}" was blocked — executable and system files are not allowed for security.`);
        return false;
      }
      return true;
    });
    setPendingFiles((prev) => [...prev, ...safe].slice(0, 10));
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeFile = (index: number) => {
    setPendingFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const accountLocked = !!(status as any)?.accountLocked;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (accountLocked) return;
    if ((!input.trim() && pendingFiles.length === 0) || isTyping) return;
    if (status && !status.isPro && !status.isOwner && (status as any).computeSecondsToday >= (status as any).dailyLimitSeconds) {
      setShowLimitModal(true);
      return;
    }
    // Detect build intent → launch agent build panel
    const text = input.trim();
    if (text && isBuildIntent(text)) {
      const appName = text.replace(/^(build|create|make|develop|write|generate|code)\s+(me\s+|us\s+|a\s+|an\s+|the\s+)*/i, "").slice(0, 60) || "New App";
      setBuildPanel({
        appName,
        appType: "AI Agent Build",
        steps: createInitialBuildSteps(),
        files: [],
        previewHtml: null,
        status: "building",
        startedAt: Date.now(),
      });
    }
    sendMessage(input, pendingFiles, persona, hubSettings, selectedModel, responseMode, sessionStart, mediaSettings);
    setInputWithDraft("");
    setPendingFiles([]);
  };

  // Animate build steps while typing
  useBuildStepAnimator(buildPanel, setBuildPanel as any);

  // Auto-open full-screen builder on mobile whenever a new build starts
  useEffect(() => {
    if (buildPanel) setMobileBuilderOpen(true);
  }, [!!buildPanel]); // eslint-disable-line react-hooks/exhaustive-deps

  // When AI finishes typing, finalise the build panel with extracted files
  const prevIsTyping = useRef(false);
  useEffect(() => {
    if (prevIsTyping.current && !isTyping && buildPanel?.status === "building") {
      const lastMsg = messages[messages.length - 1];
      if (lastMsg?.role === "assistant") {
        const files = extractFilesFromMarkdown(lastMsg.content);
        const previewHtml = buildPreviewHtml(files);
        setBuildPanel(prev => prev ? {
          ...prev,
          status: "done",
          files,
          previewHtml,
          steps: prev.steps.map(s => ({ ...s, status: "done" as const })),
        } : null);
      }
    }
    prevIsTyping.current = isTyping;
  }, [isTyping]);

  if (isLoading || !isAuthenticated) return (
    <Layout>
      <SEO {...seoData.chat} />
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-pulse text-primary font-mono tracking-widest">ESTABLISHING LINK...</div>
      </div>
    </Layout>
  );

  return (
    <ActiveProjectCtx.Provider value={activeProject}>
    <Layout>
      <SEO {...seoData.chat} />
      {/* 3-panel workspace */}
      <div
        className="flex flex-1 overflow-hidden"
        style={{
          height: "100dvh",
          background: isLight ? "#f4f5f8" : "#0D1117",
        }}
      >
        {/* ── Activity Bar ──────────────────── */}
        <div className="hidden sm:block">
          <DevActivityBar
            activeTab={devActivityTab}
            onSelect={(tab) => {
              setDevActivityTab(tab);
              if (!leftOpen) setLeftOpen(true);
            }}
          />
        </div>

        {/* ── LEFT PANEL ──────────────────────────────────────────── */}
        <AnimatePresence initial={false}>
          {leftOpen && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 220, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="shrink-0 overflow-hidden hidden lg:block"
              style={{
                minWidth: 0,
                borderRight: isLight
                  ? "1px solid rgba(20,23,34,0.1)"
                  : "1px solid #21262d",
                background: isLight
                  ? "#f0f1f6"
                  : "#161b22",
              }}
            >
              <LeftPanel
                persona={persona}
                onPersonaChange={handlePersonaChange}
                deepResearchMode={deepResearchMode}
                onToggleDeepResearch={() => setDeepResearchMode(m => !m)}
                onOpenResonance={() => setDeepResonanceOpen(true)}
                onOpenAvatarStudio={() => setShowAvatarStudio(true)}
                onOpenHub={() => setShowControlHub(true)}
                status={status}
                conversations={conversations}
                currentConversationId={currentConversationId}
                onNewChat={handleNewChat}
                onLoadConversation={handleLoadConversation}
                onDeleteConversation={handleDeleteConversation}
                convSearch={convSearch}
                onConvSearchChange={setConvSearch}
                activeProject={activeProject}
                onSetActiveProject={setActiveProject}
                theme={theme}
                onToggleTheme={toggleTheme}
                projectsVersion={projectsVersion}
                onOpenNewApp={() => setShowNewAppModal(true)}
                activePanelTab={devActivityTab}
                onPanelTabChange={(tab) => setDevActivityTab(tab)}
                onQuickBuild={(prompt, type) => {
                  setBuildPanel({
                    appName: type,
                    appType: `AI Agent Build · ${type}`,
                    steps: createInitialBuildSteps(),
                    files: [],
                    previewHtml: null,
                    status: "building",
                    startedAt: Date.now(),
                  });
                  sendMessage(prompt, [], persona, hubSettings, selectedModel, responseMode, sessionStart, mediaSettings);
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── CENTER — CHAT ────────────────────────────────────────── */}
        <div className="flex-1 flex flex-col overflow-hidden min-w-0">

          {/* ── Unified Top Bar ───────────────── */}
          <div
            className="shrink-0 flex items-center border-b"
            style={{
              background: isLight ? "#ffffff" : "#0D1117",
              borderColor: isLight ? "rgba(20,23,34,0.08)" : "rgba(255,255,255,0.06)",
              height: 38,
            }}
          >
            {/* Desktop left controls */}
            <div className="hidden sm:flex items-center shrink-0">
              <button
                onClick={() => setLeftOpen(o => !o)}
                className="flex items-center justify-center transition-colors shrink-0 w-10 h-[38px]"
                title={leftOpen ? "Hide panel" : "Show panel"}
                style={{ color: isLight ? "rgba(20,23,34,0.45)" : "rgba(255,255,255,0.4)" }}
              >
                {leftOpen ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeft className="w-4 h-4" />}
              </button>
              <Link href="/" className="flex items-center gap-2 sm:mr-1">
                <OmnimensIcon size={18} />
              </Link>
            </div>
            {/* Mobile top bar — Command Center style */}
            <div className="flex sm:hidden items-center justify-between w-full px-2 h-full gap-1">
              <button
                type="button"
                onClick={() => setMobileNav(mobileNav === "apps" ? "create" : "apps")}
                className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors shrink-0"
                style={{ color: mobileNav === "apps" ? "#a855f7" : (isLight ? "rgba(20,23,34,0.5)" : "rgba(255,255,255,0.5)") }}
              >
                <Menu className="w-[18px] h-[18px]" />
              </button>
              <button
                type="button"
                onClick={() => setShowControlHub(true)}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium transition-colors border"
                style={{
                  background: isLight ? "rgba(168,85,247,0.08)" : "rgba(43,50,69,0.8)",
                  borderColor: isLight ? "rgba(168,85,247,0.2)" : "rgba(61,70,89,0.8)",
                  color: isLight ? "#141722" : "#fff",
                }}
              >
                <span className="text-primary font-semibold text-[10px]">{MODEL_OPTIONS.find(m => m.id === selectedModel)?.label || selectedModel}</span>
                <ChevronDown className="w-3 h-3" style={{ color: isLight ? "rgba(20,23,34,0.4)" : "rgba(255,255,255,0.4)" }} />
              </button>
              <div
                className="flex items-center gap-1 px-1.5 py-1 rounded text-[10px] font-mono shrink-0 border"
                style={{
                  background: isLight ? "rgba(0,0,0,0.03)" : "rgba(14,21,37,0.8)",
                  borderColor: isLight ? "rgba(20,23,34,0.08)" : "rgba(43,50,69,0.6)",
                  color: isLight ? "rgba(20,23,34,0.5)" : "rgba(157,165,180,0.8)",
                }}
              >
                <Zap className="w-2.5 h-2.5 text-amber-400" />
                <span>{status?.paidUser ? "∞" : "FREE"}</span>
              </div>
            </div>

            <div className="hidden sm:flex items-center overflow-x-auto flex-1 min-w-0" style={{ scrollbarWidth: "none" }}>
              {conversations.slice(0, 6).map(conv => {
                const active = currentConversationId === conv.id;
                return (
                  <button
                    key={conv.id}
                    onClick={() => handleLoadConversation(conv.id)}
                    className="group flex items-center gap-1.5 px-3 h-[38px] shrink-0 transition-all text-[11px] font-mono relative"
                    style={{
                      background: active
                        ? (isLight ? "#f4f5f8" : "#161b22")
                        : "transparent",
                      color: active
                        ? (isLight ? "#141722" : "rgba(255,255,255,0.9)")
                        : (isLight ? "rgba(20,23,34,0.45)" : "rgba(255,255,255,0.4)"),
                    }}
                  >
                    {active && (
                      <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-primary" />
                    )}
                    <FileText className="w-3 h-3 shrink-0" style={{ color: active ? "#a855f7" : undefined }} />
                    <span className="max-w-[90px] truncate">{conv.title || "untitled"}</span>
                    <X
                      className="w-3 h-3 ml-0.5 shrink-0 opacity-0 group-hover:opacity-60 hover:!opacity-100 transition-opacity"
                      onClick={e => { e.stopPropagation(); handleDeleteConversation(conv.id); }}
                    />
                  </button>
                );
              })}
              <button
                onClick={handleNewChat}
                className="flex items-center justify-center w-[38px] h-[38px] shrink-0 transition-all hover:bg-white/5"
                title="New chat (Ctrl+K)"
                style={{ color: isLight ? "rgba(20,23,34,0.3)" : "rgba(255,255,255,0.25)" }}
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="flex items-center gap-0.5 px-2 shrink-0">
              <div className="hidden sm:flex items-center gap-1.5 mr-1">
                <CogniSyncIndicator state={activeCogniSync} />
                {gpu.supported && gpu.status === "ready" && (
                  <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-full border border-sky-400/25 bg-sky-400/10 text-sky-400 text-[8px] font-mono tracking-widest cursor-default">
                    <span className="w-1.5 h-1.5 rounded-full bg-sky-400" style={{ boxShadow: "0 0 6px #38bdf8" }} />
                    GPU
                  </span>
                )}
                {gpu.supported && gpu.status === "loading" && (
                  <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-full border border-sky-400/20 bg-sky-400/8 text-sky-400 text-[8px] font-mono tracking-widest cursor-default">
                    <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />
                    GPU {gpu.progress}%
                  </span>
                )}
                {hubSettings.antiHallucinationMode && (
                  <span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-orange-400/10 border border-orange-400/20 text-orange-400 text-[8px] font-mono">
                    <ShieldCheck className="w-2.5 h-2.5" /> VERIFIED
                  </span>
                )}
                {hubSettings.debateMode && (
                  <span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-violet-400/10 border border-violet-400/20 text-violet-400 text-[8px] font-mono">
                    <Swords className="w-2.5 h-2.5" /> DEBATE
                  </span>
                )}
                {statusLoading ? null : status?.isOwner ? (
                  <span className="font-mono text-[9px] text-primary font-bold tracking-widest">CREATOR</span>
                ) : status?.isPro ? (
                  <span className="font-mono text-[9px] text-primary font-bold tracking-widest">PRO</span>
                ) : null}
                {status?.isOwner && <OmnimensNotificationBell />}
              </div>

              <button
                onClick={() => setLocation("/connect")}
                title="Talk to OMNIMENS — live voice conversation"
                className="hidden sm:flex items-center gap-1 px-1.5 py-1 rounded transition-all text-[9px] font-mono font-bold tracking-wider hover:bg-primary/10 text-primary/60 hover:text-primary"
              >
                <Mic className="w-3 h-3" />
                <span>CONNECT</span>
              </button>

              <button
                onClick={() => setShowAgentModes(true)}
                title="Agent Mode"
                className="flex items-center gap-1 px-1.5 py-1 rounded transition-all text-[9px] font-mono font-bold tracking-wider hover:bg-white/5"
                style={{ color: isLight ? "rgba(20,23,34,0.5)" : "rgba(255,255,255,0.45)" }}
              >
                {agentMode === "swift" && <Zap className="w-3 h-3 text-yellow-400" />}
                {agentMode === "omni" && <Sparkles className="w-3 h-3 text-primary" />}
                {agentMode === "apex" && <Infinity className="w-3 h-3 text-emerald-400" />}
                <span className="hidden sm:block">{agentMode.toUpperCase()}</span>
              </button>

              <button
                onClick={() => setShowControlHub(true)}
                className="hidden sm:flex items-center gap-1 px-1.5 py-1 rounded transition-all text-[9px] font-mono font-bold tracking-wider hover:bg-white/5"
                style={{ color: isLight ? "rgba(20,23,34,0.5)" : "rgba(255,255,255,0.45)" }}
                title="Control Hub"
              >
                <Settings className="w-3 h-3" />
                <span className="hidden md:block">HUB</span>
              </button>

              <button
                onClick={() => setRightOpen(o => !o)}
                className="hidden lg:flex items-center justify-center w-7 h-[38px] transition-all hover:bg-white/5"
                style={{ color: isLight ? "rgba(20,23,34,0.45)" : "rgba(255,255,255,0.35)" }}
                title={rightOpen ? "Hide panel" : "Show panel"}
              >
                {rightOpen ? <PanelRightClose className="w-3.5 h-3.5" /> : <PanelRight className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Deep research panel (below topbar when active) — hide on mobile when not on create tab */}
          {deepResearchMode && (
            <div className={`shrink-0 flex items-center gap-2 px-3 py-2 bg-violet-950/30 border-b border-violet-400/15 ${mobileNav !== "create" ? "hidden sm:flex" : ""}`}>
              <Microscope className="w-3.5 h-3.5 text-violet-400 shrink-0" />
              <input
                type="text"
                value={researchQuestion}
                onChange={e => setResearchQuestion(e.target.value)}
                placeholder="Research question (or use chat input below)..."
                className="flex-1 bg-transparent outline-none text-xs font-mono text-white/80 placeholder:text-white/25 min-w-0"
                onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); handleDeepResearch(); } }}
              />
              <button
                onClick={handleDeepResearch}
                disabled={isResearching}
                className="flex items-center gap-1.5 px-3 py-1 text-[10px] font-mono uppercase text-violet-300 border border-violet-400/30 rounded-lg hover:bg-violet-400/10 transition-colors disabled:opacity-40 shrink-0"
              >
                {isResearching ? <Loader2 className="w-3 h-3 animate-spin" /> : <BookOpen className="w-3 h-3" />}
                {isResearching ? "RESEARCHING..." : "RESEARCH"}
              </button>
            </div>
          )}

          {/* Messages / Mobile Tab Content area */}
          <div
            className="flex-1 overflow-y-auto omnimens-scrollbar px-2 sm:px-4 py-4 relative"
            style={{ background: isLight ? "#f4f5f8" : "#0D1117" }}
          >
            {/* ── MOBILE: Apps Tab ── */}
            {mobileNav === "apps" && (
              <div className="sm:hidden h-full">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold" style={{ color: isLight ? "#141722" : "#fff" }}>All Apps</h2>
                  <button
                    onClick={() => { handleNewChat(); setMobileNav("create"); }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/15 border border-primary/25 text-primary text-xs font-semibold transition-colors hover:bg-primary/25"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    New
                  </button>
                </div>
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: isLight ? "rgba(20,23,34,0.35)" : "rgba(255,255,255,0.3)" }} />
                  <input
                    type="text"
                    value={convSearch}
                    onChange={e => setConvSearch(e.target.value)}
                    placeholder="Search conversations..."
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl text-sm outline-none border transition-colors"
                    style={{
                      background: isLight ? "#fff" : "#161b22",
                      borderColor: isLight ? "rgba(20,23,34,0.1)" : "rgba(255,255,255,0.08)",
                      color: isLight ? "#141722" : "#fff",
                    }}
                  />
                </div>
                {conversations.length === 0 ? (
                  <div className="flex flex-col items-center justify-center pt-20 text-center">
                    <FolderOpen className="w-12 h-12 mb-3" style={{ color: isLight ? "rgba(20,23,34,0.15)" : "rgba(255,255,255,0.1)" }} />
                    <p className="text-sm font-semibold mb-1" style={{ color: isLight ? "rgba(20,23,34,0.5)" : "rgba(255,255,255,0.4)" }}>No conversations yet</p>
                    <p className="text-xs" style={{ color: isLight ? "rgba(20,23,34,0.35)" : "rgba(255,255,255,0.25)" }}>Start creating to see your apps here</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {conversations
                      .filter(c => !convSearch || (c.title || "").toLowerCase().includes(convSearch.toLowerCase()))
                      .map(conv => (
                      <button
                        key={conv.id}
                        onClick={() => { handleLoadConversation(conv.id); setMobileNav("create"); }}
                        className="w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left"
                        style={{
                          background: currentConversationId === conv.id
                            ? (isLight ? "rgba(168,85,247,0.06)" : "rgba(168,85,247,0.08)")
                            : (isLight ? "#fff" : "#161b22"),
                          borderColor: currentConversationId === conv.id
                            ? "rgba(168,85,247,0.25)"
                            : (isLight ? "rgba(20,23,34,0.08)" : "rgba(255,255,255,0.06)"),
                        }}
                      >
                        <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                          <OmnimensIcon size={18} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold truncate" style={{ color: isLight ? "#141722" : "#fff" }}>
                            {conv.title || "Untitled"}
                          </p>
                          <p className="text-[11px] mt-0.5" style={{ color: isLight ? "rgba(20,23,34,0.4)" : "rgba(255,255,255,0.35)" }}>
                            {conv.updatedAt ? new Date(conv.updatedAt).toLocaleDateString(undefined, { month: "short", day: "numeric" }) : ""}
                          </p>
                        </div>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDeleteConversation(conv.id); }}
                          className="p-1.5 rounded-lg transition-colors"
                          style={{ color: isLight ? "rgba(20,23,34,0.25)" : "rgba(255,255,255,0.2)" }}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── MOBILE: Account Tab ── */}
            {mobileNav === "account" && (
              <div className="sm:hidden h-full">
                {accountSubPage === "billing" && (
                  <MobileBillingPage isLight={isLight} status={status} onBack={() => setAccountSubPage(null)} onNavigate={setLocation} />
                )}
                {accountSubPage === "usage" && (
                  <MobileUsagePage isLight={isLight} status={status} onBack={() => setAccountSubPage(null)} onNavigate={setLocation} />
                )}
                {accountSubPage === "profile" && (
                  <MobileProfilePage isLight={isLight} status={status} user={user} theme={theme} toggleTheme={toggleTheme} onBack={() => setAccountSubPage(null)} />
                )}

                {/* ── Main Account Menu ── */}
                {!accountSubPage && (<>
                <div className="flex items-center gap-4 mb-6 pb-5 border-b" style={{ borderColor: isLight ? "rgba(20,23,34,0.08)" : "rgba(255,255,255,0.06)" }}>
                  <div className="w-16 h-16 rounded-full bg-primary/15 border-2 border-primary/30 flex items-center justify-center">
                    <span className="text-xl font-bold text-primary">
                      {(user as any)?.username?.slice(0, 2)?.toUpperCase() || "OM"}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold" style={{ color: isLight ? "#141722" : "#fff" }}>
                      {(user as any)?.username || "OMNIMENS User"}
                    </h3>
                    {status && (status as any)?.isPro && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/15 border border-primary/25 text-primary text-[10px] font-bold tracking-wider mt-1">
                        <Star className="w-3 h-3" /> PRO
                      </span>
                    )}
                    {status && (status as any)?.isOwner && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-400/15 border border-amber-400/25 text-amber-400 text-[10px] font-bold tracking-wider mt-1">
                        <Shield className="w-3 h-3" /> OWNER
                      </span>
                    )}
                  </div>
                </div>
                {status && (
                  <div className="mb-4 p-4 rounded-xl border" style={{
                    background: isLight ? "#fff" : "#161b22",
                    borderColor: isLight ? "rgba(20,23,34,0.08)" : "rgba(255,255,255,0.06)",
                  }}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold" style={{ color: isLight ? "rgba(20,23,34,0.5)" : "rgba(255,255,255,0.4)" }}>Credits</span>
                      <span className="text-lg font-bold text-primary">{(status as any)?.credits ?? 0}</span>
                    </div>
                    {!(status as any)?.isPro && (
                      <button
                        onClick={() => setLocation("/pricing")}
                        className="w-full mt-2 py-2 rounded-lg bg-primary/10 border border-primary/25 text-primary text-xs font-bold tracking-wider transition-colors hover:bg-primary/20"
                      >
                        UPGRADE FOR MORE
                      </button>
                    )}
                  </div>
                )}
                <div className="space-y-1">
                  {[
                    { icon: <Wallet className="w-4.5 h-4.5" />, label: "Billing", action: () => setAccountSubPage("billing") },
                    { icon: <Activity className="w-4.5 h-4.5" />, label: "Usage", action: () => setAccountSubPage("usage") },
                    { icon: <User className="w-4.5 h-4.5" />, label: "Profile", action: () => setAccountSubPage("profile") },
                    { icon: <Zap className="w-4.5 h-4.5" />, label: "Buy Credits", action: () => setLocation("/pricing") },
                  ].map(item => (
                    <button
                      key={item.label}
                      onClick={item.action}
                      className="flex items-center gap-3 px-4 py-3.5 rounded-xl w-full transition-colors text-left"
                      style={{ color: isLight ? "#141722" : "rgba(255,255,255,0.85)" }}
                    >
                      <span style={{ color: isLight ? "rgba(20,23,34,0.45)" : "rgba(255,255,255,0.4)" }}>{item.icon}</span>
                      <span className="text-sm font-medium flex-1">{item.label}</span>
                      <ChevronRight className="w-4 h-4" style={{ color: isLight ? "rgba(20,23,34,0.2)" : "rgba(255,255,255,0.15)" }} />
                    </button>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t" style={{ borderColor: isLight ? "rgba(20,23,34,0.08)" : "rgba(255,255,255,0.06)" }}>
                  <p className="text-[10px] font-bold tracking-widest uppercase mb-2 px-4" style={{ color: isLight ? "rgba(20,23,34,0.35)" : "rgba(255,255,255,0.25)" }}>Theme</p>
                  <button
                    onClick={toggleTheme}
                    className="flex items-center gap-3 px-4 py-3.5 rounded-xl w-full transition-colors"
                    style={{ color: isLight ? "#141722" : "rgba(255,255,255,0.85)" }}
                  >
                    <span style={{ color: isLight ? "rgba(20,23,34,0.45)" : "rgba(255,255,255,0.4)" }}>
                      {theme === "light" ? <Sun className="w-4.5 h-4.5" /> : <Moon className="w-4.5 h-4.5" />}
                    </span>
                    <span className="text-sm font-medium flex-1 text-left">Theme — {theme === "light" ? "Light" : "Dark"}</span>
                    <ChevronRight className="w-4 h-4" style={{ color: isLight ? "rgba(20,23,34,0.2)" : "rgba(255,255,255,0.15)" }} />
                  </button>
                </div>
                <div className="mt-4 pt-4 border-t" style={{ borderColor: isLight ? "rgba(20,23,34,0.08)" : "rgba(255,255,255,0.06)" }}>
                  <p className="text-[10px] font-bold tracking-widest uppercase mb-2 px-4" style={{ color: isLight ? "rgba(20,23,34,0.35)" : "rgba(255,255,255,0.25)" }}>Support</p>
                  {[
                    { icon: <HelpCircle className="w-4.5 h-4.5" />, label: "Help", href: "/support" },
                    { icon: <BookOpen className="w-4.5 h-4.5" />, label: "FAQ", href: "/faq" },
                    { icon: <Info className="w-4.5 h-4.5" />, label: "About", href: "/about" },
                  ].map(item => (
                    <Link
                      key={item.label}
                      href={item.href}
                      className="flex items-center gap-3 px-4 py-3.5 rounded-xl transition-colors"
                      style={{ color: isLight ? "#141722" : "rgba(255,255,255,0.85)" }}
                    >
                      <span style={{ color: isLight ? "rgba(20,23,34,0.45)" : "rgba(255,255,255,0.4)" }}>{item.icon}</span>
                      <span className="text-sm font-medium flex-1">{item.label}</span>
                      <ChevronRight className="w-4 h-4" style={{ color: isLight ? "rgba(20,23,34,0.2)" : "rgba(255,255,255,0.15)" }} />
                    </Link>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t" style={{ borderColor: isLight ? "rgba(20,23,34,0.08)" : "rgba(255,255,255,0.06)" }}>
                  <p className="text-[10px] font-bold tracking-widest uppercase mb-2 px-4" style={{ color: isLight ? "rgba(20,23,34,0.35)" : "rgba(255,255,255,0.25)" }}>Other</p>
                  <Link
                    href="/terms"
                    className="flex items-center gap-3 px-4 py-3.5 rounded-xl transition-colors"
                    style={{ color: isLight ? "#141722" : "rgba(255,255,255,0.85)" }}
                  >
                    <span style={{ color: isLight ? "rgba(20,23,34,0.45)" : "rgba(255,255,255,0.4)" }}><File className="w-4.5 h-4.5" /></span>
                    <span className="text-sm font-medium flex-1">Terms of Service</span>
                    <ChevronRight className="w-4 h-4" style={{ color: isLight ? "rgba(20,23,34,0.2)" : "rgba(255,255,255,0.15)" }} />
                  </Link>
                  <Link
                    href="/privacy"
                    className="flex items-center gap-3 px-4 py-3.5 rounded-xl transition-colors"
                    style={{ color: isLight ? "#141722" : "rgba(255,255,255,0.85)" }}
                  >
                    <span style={{ color: isLight ? "rgba(20,23,34,0.45)" : "rgba(255,255,255,0.4)" }}><Lock className="w-4.5 h-4.5" /></span>
                    <span className="text-sm font-medium flex-1">Privacy Policy</span>
                    <ChevronRight className="w-4 h-4" style={{ color: isLight ? "rgba(20,23,34,0.2)" : "rgba(255,255,255,0.15)" }} />
                  </Link>
                  <button
                    onClick={() => { fetch("/api/auth/logout", { method: "POST", credentials: "include" }).then(() => setLocation("/")); }}
                    className="flex items-center gap-3 px-4 py-3.5 rounded-xl w-full transition-colors text-left"
                  >
                    <span className="text-red-400"><LogOut className="w-4.5 h-4.5" /></span>
                    <span className="text-sm font-medium flex-1 text-red-400">Log Out</span>
                  </button>
                </div>
                <div className="h-8" />
                </>)}
              </div>
            )}

            {/* ── Create Tab / Desktop: Normal chat content ── */}
            {(mobileNav === "create" || typeof window === "undefined") && <>
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center select-none">
                {/* Desktop: OMNIMENS presence */}
                <div className="hidden sm:block">
                  <OmnimensPresence
                    size={200}
                    isSpeaking={false}
                    pitchIntensity={0}
                    className="mb-2 drop-shadow-[0_0_60px_rgba(160,100,255,0.35)]"
                  />
                </div>
                {/* Mobile: Replit-style greeting */}
                <div className="sm:hidden w-full px-2">
                  <h2 className="text-xl font-bold mb-1" style={{ color: isLight ? "#141722" : "#fff" }}>
                    Hi {(user as any)?.username || "there"},
                  </h2>
                  <p className="text-base mb-6" style={{ color: isLight ? "rgba(20,23,34,0.6)" : "rgba(255,255,255,0.6)" }}>
                    what do you want to make?
                  </p>
                </div>
                <h2 className="hidden sm:block font-display text-2xl tracking-[0.3em] text-white/85 mt-2">OMNIMENS AWAITS</h2>
                <p className="hidden sm:block font-mono text-sm mt-2 text-white/70">Speak your intent. Upload your vision.</p>

                {/* Talk to OMNIMENS mic button */}
                <button
                  onClick={() => setLocation("/connect")}
                  className="mt-4 group flex items-center gap-2.5 px-5 py-2.5 rounded-full border border-primary/25 bg-primary/8 hover:bg-primary/15 hover:border-primary/40 transition-all"
                >
                  <span className="w-8 h-8 rounded-full bg-primary/20 group-hover:bg-primary/30 flex items-center justify-center transition-colors">
                    <Mic className="w-4 h-4 text-primary" />
                  </span>
                  <span className="text-white/70 group-hover:text-white text-sm font-mono tracking-wide transition-colors">Talk to OMNIMENS</span>
                </button>

                {/* Category chips */}
                <div className="mt-5 w-full overflow-x-auto pb-2" style={{ scrollbarWidth: "none", WebkitOverflowScrolling: "touch" }}>
                  <div className="flex gap-2 px-6 w-max sm:w-full sm:max-w-lg sm:mx-auto sm:justify-center sm:flex-wrap">
                  {[
                    { emoji: "🌐", label: "Website", prompt: "Build me a stunning website for " },
                    { emoji: "📱", label: "Mobile App", prompt: "Design a mobile app that " },
                    { emoji: "🗄️", label: "Database", prompt: "Help me design a database schema for " },
                    { emoji: "🎨", label: "Image", prompt: "Generate an image of " },
                    { emoji: "💻", label: "Code", prompt: "Write code to " },
                    { emoji: "🔬", label: "Research", prompt: "Research and summarize everything about " },
                    { emoji: "💼", label: "Business Plan", prompt: "Create a full business plan for " },
                    { emoji: "🎮", label: "Game", prompt: "Build a browser game where " },
                    { emoji: "📊", label: "Data Analysis", prompt: "Analyze this data and create visualizations: " },
                    { emoji: "📄", label: "Document", prompt: "Write a professional document about " },
                    { emoji: "📽️", label: "Presentation", prompt: "Create a presentation with slides about " },
                    { emoji: "🤖", label: "AI Agent", prompt: "Build an AI agent that can " },
                  ].map(chip => (
                    <button
                      key={chip.label}
                      onClick={() => setInputWithDraft(chip.prompt)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/12 bg-white/4 hover:bg-white/8 hover:border-primary/30 text-white/70 hover:text-white transition-all text-[11px] font-mono whitespace-nowrap shrink-0"
                    >
                      <span>{chip.emoji}</span>
                      <span>{chip.label}</span>
                    </button>
                  ))}
                  </div>
                </div>
              </div>
            ) : (
              <>
                <div className="flex flex-col items-center pt-4 pb-2 sm:pt-6 sm:pb-3">
                  <OmnimensPresence
                    size={typeof window !== "undefined" && window.innerWidth < 640 ? 64 : 90}
                    isSpeaking={isTyping}
                    pitchIntensity={0}
                    className="drop-shadow-[0_0_30px_rgba(160,100,255,0.25)]"
                  />
                </div>
                <div className="space-y-3 sm:space-y-6 max-w-3xl mx-auto">
                  {messages.map((msg) => {
                    return (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        key={msg.id}
                        className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} ${msg.role !== "user" ? "gap-2 sm:gap-0" : ""}`}
                      >
                        {msg.role !== "user" && (
                          <div className="sm:hidden w-7 h-7 rounded-full bg-gradient-to-b from-primary to-purple-800 flex items-center justify-center shrink-0 mt-0.5 shadow-[0_0_10px_rgba(168,85,247,0.2)] border border-purple-400/30">
                            <Brain className="w-3.5 h-3.5 text-white" />
                          </div>
                        )}
                        <div className={`max-w-[95%] sm:max-w-[92%] w-full ${
                          msg.role === "user"
                            ? "bg-white/10 border border-white/20 sm:border-white/20 border-l-[3px] sm:border-l border-l-primary text-white rounded-2xl rounded-tr-sm px-3 sm:px-5 py-2 sm:py-3 font-sans"
                            : `bg-primary/5 border border-primary/15 rounded-2xl rounded-tl-sm px-3 sm:px-5 py-2.5 sm:py-4 font-mono shadow-[0_0_15px_rgba(130,80,220,0.06)] text-white/90`
                        }`}>
                          {msg.role === "omnimens" && (
                            <div className="flex items-center justify-between gap-1 mb-2">
                              <div className="flex items-center gap-1 text-primary font-bold text-[10px] tracking-widest uppercase flex-wrap">
                                <OmnimensIcon size={14} className="shrink-0 hidden sm:block" />
                                <span>OMNIMENS</span>
                                {msg.model && msg.model !== "gpt-4o" && (
                                  <span className="text-[8px] text-white/30 font-mono normal-case tracking-normal ml-1 border border-white/10 px-1 rounded">{msg.model}</span>
                                )}
                                {msg.neuroEmotion && msg.neuroEmotion !== "NEUTRAL" && (
                                  <NeuroEmotionBadge emotion={msg.neuroEmotion} intensity={msg.neuroIntensity || "low"} />
                                )}
                              </div>
                            </div>
                          )}

                          {msg.role === "user" && msg.files && msg.files.length > 0 && (
                            <AttachedFileList files={msg.files} />
                          )}

                          {msg.role === "user" ? (
                            msg.content ? <p className="whitespace-pre-wrap">{msg.content}</p> : null
                          ) : (
                            <div className="text-sm md:text-base">
                              {(msg as any).autonomousThinking && !msg.content && (
                                <div className="flex items-center gap-2 text-xs text-primary/70 mb-2 font-mono">
                                  <div className="w-2 h-2 rounded-full bg-primary/60 animate-pulse" />
                                  <span>{(msg as any).thinkingStatus || "Deep thinking..."}</span>
                                </div>
                              )}
                              {(msg as any).executiveSummary && (msg as any).autonomousThought && ((msg as any).autonomousThought.complexity === "deep" || (msg as any).autonomousThought.complexity === "architectural") && !(msg as any)._showFullAnalysis && (
                                <div className="mb-3">
                                  <div className="text-xs font-mono text-primary/60 mb-1 uppercase tracking-wider">Executive Summary</div>
                                  <p className="text-sm opacity-90 mb-2">{(msg as any).executiveSummary}</p>
                                  <button onClick={() => { setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, _showFullAnalysis: true } as any : m)); }} className="text-[10px] font-mono text-primary/50 hover:text-primary/80 border border-primary/20 hover:border-primary/40 px-2 py-0.5 rounded transition-all">Show full analysis ({(msg as any).autonomousThought.reasoningPasses} passes, {(msg as any).autonomousThought.totalConclusions} conclusions)</button>
                                </div>
                              )}
                              {(!(msg as any).executiveSummary || !(msg as any).autonomousThought || ((msg as any).autonomousThought.complexity !== "deep" && (msg as any).autonomousThought.complexity !== "architectural") || (msg as any)._showFullAnalysis) && (
                                <>
                                  {(msg as any)._showFullAnalysis && (msg as any).executiveSummary && (
                                    <button onClick={() => { setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, _showFullAnalysis: false } as any : m)); }} className="text-[10px] font-mono text-primary/50 hover:text-primary/80 border border-primary/20 hover:border-primary/40 px-2 py-0.5 rounded transition-all mb-2">Show summary only</button>
                                  )}
                              {parseMessageSegments(msg.content || ((msg as any).autonomousThinking ? "" : "...")).map((seg, i) =>
                                seg.type === "html" ? (
                                  <WebsitePreview key={i} html={seg.value} index={i} />
                                ) : (
                                  <div key={i} className="markdown-body">
                                    {parseChartMarkers(seg.value).map((chunk, ci) => (
                                      <div key={ci}>
                                        {chunk.before && (
                                          <ReactMarkdown
                                            remarkPlugins={[remarkGfm]}
                                            components={{
                                              code({ node, className, children, ...props }: any) {
                                                const match = /language-(\w+)/.exec(className || "");
                                                const isBlock = !props.inline && match;
                                                const lang = match ? match[1] : "";
                                                const codeStr = String(children).replace(/\n$/, "");
                                                if (isBlock && lang === "mermaid") return <MermaidDiagram code={codeStr} />;
                                                if (isBlock) return <CodeBlockWithRun code={codeStr} language={lang} defaultCollapsed={!devLayout} />;
                                                return <code className={`font-mono text-primary/80 bg-primary/10 px-1 rounded text-sm ${className || ""}`} {...props}>{children}</code>;
                                              },
                                            }}
                                          >{chunk.before}</ReactMarkdown>
                                        )}
                                        {chunk.spec && <InlineChart spec={chunk.spec} />}
                                      </div>
                                    ))}
                                  </div>
                                )
                              )}
                                </>
                              )}

                              {/* Generated images — shown inline AND in right panel */}
                              {msg.images && msg.images.length > 0 && (
                                <div className="mt-4 space-y-4">
                                  {msg.images.map((img) => (
                                    <InlineImageCard key={img.index} image={img} />
                                  ))}
                                </div>
                              )}

                              {msg.videos && msg.videos.length > 0 && (
                                <div className="mt-4 space-y-4">
                                  {msg.videos.map((vid) => (
                                    <div key={vid.index} className="rounded-xl overflow-hidden border border-white/10 bg-black/40 max-w-lg">
                                      <video
                                        src={vid.url}
                                        controls
                                        autoPlay
                                        loop
                                        muted
                                        playsInline
                                        className="w-full rounded-t-xl"
                                      />
                                      <div className="px-3 py-2 flex items-center justify-between gap-2">
                                        <span className="text-xs text-white/50 truncate">{vid.prompt.slice(0, 80)}{vid.prompt.length > 80 ? "…" : ""}</span>
                                        <div className="flex items-center gap-2 shrink-0">
                                          {vid.sizeBytes && <span className="text-[10px] text-white/30">{(vid.sizeBytes / (1024 * 1024)).toFixed(1)} MB</span>}
                                          <a
                                            href={vid.url}
                                            download={`omnimens-video-${vid.index}.mp4`}
                                            className="text-xs px-2 py-1 rounded bg-purple-600/30 hover:bg-purple-600/50 text-purple-300 transition-colors"
                                          >
                                            Download
                                          </a>
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}

                              {msg.savedFiles && msg.savedFiles.length > 0 && (
                                <div className="mt-2 flex items-center gap-1.5 text-[10px] text-green-400/60">
                                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M20 6 9 17l-5-5"/></svg>
                                  <span>{msg.savedFiles.length} file{msg.savedFiles.length > 1 ? "s" : ""} auto-saved to <a href={`${window.location.origin}/files`} className="underline hover:text-green-400">My Files</a></span>
                                </div>
                              )}

                              {/* Physical Therapy Red Flag Alert — shown first for patient safety */}
                              {msg.redFlagAlert && msg.redFlagAlert.urgency !== "none" && (
                                <RedFlagAlertCard alert={msg.redFlagAlert} />
                              )}

                              {/* Agentic status badges */}
                              {msg.taskPlan && <TaskPlanCard plan={msg.taskPlan} />}
                              {(msg.multiSearching || msg.multiSearchComplete) && (
                                <MultiSearchBadge count={msg.multiSearchCount || 2} done={!!msg.multiSearchComplete && !msg.multiSearching} />
                              )}
                              {(msg.analyzingUrls || msg.urlCount) && (
                                <UrlAnalysisBadge count={msg.urlCount || 1} done={!msg.analyzingUrls} />
                              )}
                              {(msg.searchingWeb || msg.webSearchQuery) && (
                                <WebSearchBadge
                                  query={msg.webSearchQuery || ""}
                                  done={!msg.searchingWeb}
                                  resultCount={msg.webSearchResultCount}
                                />
                              )}
                              {msg.generatingImages && (
                                <ImageGeneratingBadge
                                  spellStatus={msg.imageSpellStatus}
                                  spellWords={msg.imageSpellWords}
                                  spellCorrections={msg.imageSpellCorrections}
                                />
                              )}
                              {msg.generatingVideo && (
                                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium bg-purple-500/10 border border-purple-500/30 text-purple-300 mt-2">
                                  <div className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
                                  Generating AI video…
                                </div>
                              )}
                              {msg.imageSpellStatus === "confirming" && msg.imageSpellRequestId && (
                                <ImageSpellConfirmCard
                                  spellRequestId={msg.imageSpellRequestId}
                                  corrections={msg.imageSpellCorrections || []}
                                  foundWords={msg.imageSpellWords || []}
                                  onDecision={(decision) => {
                                    setMessages((prev) => prev.map((m) =>
                                      m.id === msg.id
                                        ? { ...m, imageSpellStatus: decision === "fix" ? "correcting" : "kept", imageSpellRequestId: null }
                                        : m
                                    ));
                                  }}
                                />
                              )}
                              {msg.generating3d && <Model3DGeneratingBadge />}
                              {msg.generatingGame && <GameGeneratingBadge phase={msg.gamePhase} />}
                              {msg.analyzingFaces && (
                                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium bg-purple-500/10 border border-purple-500/30 text-purple-300 mt-2">
                                  <span className="animate-pulse">👁️</span> Analyzing faces...
                                </div>
                              )}

                              {/* Face analysis results */}
                              {msg.faceAnalysis && (
                                <div className="mt-4 rounded-xl border border-purple-500/30 bg-purple-500/5 p-4">
                                  <div className="flex items-center gap-2 mb-3">
                                    <span className="text-purple-400 text-lg">👁️</span>
                                    <span className="font-semibold text-purple-300 text-sm">Face Recognition Complete</span>
                                    <span className="ml-auto px-2 py-0.5 rounded-full text-xs bg-purple-500/20 text-purple-300 border border-purple-500/30">
                                      {msg.faceAnalysis.faceCount} face{msg.faceAnalysis.faceCount !== 1 ? "s" : ""} detected
                                    </span>
                                  </div>
                                  <div className="prose prose-sm prose-invert max-w-none text-xs text-neutral-300 leading-relaxed whitespace-pre-wrap">
                                    {msg.faceAnalysis.markdown}
                                  </div>
                                </div>
                              )}

                              {msg.analyzingHIE && (
                                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 mt-2">
                                  <span className="animate-pulse">🔊</span> Running Harmonic Insight Engine analysis...
                                </div>
                              )}

                              {msg.hieAnalysis && msg.hieAnalysis.length > 0 && (
                                <div className="mt-4 rounded-xl border border-cyan-500/30 bg-cyan-500/5 p-4 space-y-3">
                                  <div className="flex items-center gap-2 mb-2">
                                    <span className="text-cyan-400 text-lg">🔊</span>
                                    <span className="font-semibold text-cyan-300 text-sm">Harmonic Insight Engine — Auto Analysis</span>
                                    <span className="ml-auto px-2 py-0.5 rounded-full text-xs bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                                      {msg.hieAnalysis.length} file{msg.hieAnalysis.length !== 1 ? "s" : ""} analyzed
                                    </span>
                                  </div>
                                  {msg.hieAnalysis.map((hie, hieIdx) => (
                                    <div key={hieIdx} className="bg-[#0E1525]/80 rounded-lg p-3 border border-cyan-500/10">
                                      <div className="text-xs font-medium text-cyan-200 mb-2">{hie.filename}</div>
                                      {!hie.analysis && (
                                        <div className="text-xs text-red-400/70">Analysis could not be completed for this file.</div>
                                      )}
                                      {hie.analysis && (
                                        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-neutral-400">
                                          <div>Dominant: <span className="text-cyan-300">{hie.analysis.dominantFrequency?.toFixed(1)}Hz</span></div>
                                          <div>Mapping: <span className="text-cyan-300">{hie.analysis.semanticMapping}</span></div>
                                          <div>Valence: <span className="text-cyan-300">{hie.analysis.emotionalValence}</span></div>
                                          <div>Complexity: <span className="text-cyan-300">{hie.analysis.harmonicComplexity?.toFixed(3)}</span></div>
                                          <div>Novelty: <span className="text-cyan-300">{((hie.analysis.noveltyScore || 0) * 100).toFixed(1)}%</span></div>
                                          <div>SNR: <span className="text-cyan-300">{hie.analysis.signalToNoise?.toFixed(1)}x</span></div>
                                          <div>Pattern: <span className="text-cyan-300">{hie.analysis.patternMatches?.[0]?.pattern || "unclassified"}</span></div>
                                          <div>Temporal: <span className="text-cyan-300">{hie.analysis.temporalPattern || "none"}</span></div>
                                          {hie.librosa && (
                                            <>
                                              <div>Tempo: <span className="text-cyan-300">{hie.librosa.tempo} BPM</span></div>
                                              <div>Key: <span className="text-cyan-300">{hie.librosa.key}</span></div>
                                              <div>Duration: <span className="text-cyan-300">{hie.librosa.duration}s</span></div>
                                              <div>Harmonic: <span className="text-cyan-300">{hie.librosa.harmonicRatio}</span></div>
                                            </>
                                          )}
                                        </div>
                                      )}
                                      {hie.analysis?.frequencyBands && (
                                        <div className="mt-2 flex gap-1">
                                          {Object.entries(hie.analysis.frequencyBands as Record<string, number>).map(([band, val]) => {
                                            const bandColor = hie.knowledgeSignature?.bandColors?.[band]?.hex;
                                            return (
                                              <div key={band} className="flex-1 text-center">
                                                <div
                                                  className="rounded-sm mx-auto"
                                                  style={{
                                                    width: "100%",
                                                    height: `${Math.max(4, (val as number) * 60)}px`,
                                                    backgroundColor: bandColor || "rgba(6,182,212,0.3)",
                                                    opacity: bandColor ? 0.85 : 1,
                                                  }}
                                                />
                                                <div className="text-[9px] text-neutral-500 mt-1">{band}</div>
                                              </div>
                                            );
                                          })}
                                        </div>
                                      )}
                                      {hie.knowledgeSignature && (
                                        <div className="mt-3 border-t border-cyan-500/15 pt-3 space-y-2">
                                          <div className="flex items-center gap-2">
                                            <span className="text-amber-400 text-xs">⟐</span>
                                            <span className="text-xs font-semibold text-amber-300">Harmonic Knowledge Decoder</span>
                                            <span className="ml-auto px-1.5 py-0.5 rounded text-[9px] bg-amber-500/15 text-amber-300 border border-amber-500/20">
                                              {((hie.knowledgeSignature.confidenceScore || 0) * 100).toFixed(0)}% confidence
                                            </span>
                                          </div>
                                          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-neutral-400">
                                            <div>Fundamental: <span className="text-amber-300">{hie.knowledgeSignature.fundamentalIdentity?.frequency?.toFixed(1)}Hz</span></div>
                                            <div>Purity: <span className="text-amber-300">{hie.knowledgeSignature.fundamentalIdentity?.harmonicPurity?.toFixed(2)}</span></div>
                                            <div>Series: <span className="text-amber-300">{hie.knowledgeSignature.overtoneLanguage?.seriesType}</span></div>
                                            <div>Coherence: <span className="text-amber-300">{((hie.knowledgeSignature.overtoneLanguage?.coherenceScore || 0) * 100).toFixed(1)}%</span></div>
                                            <div>Consonance: <span className="text-amber-300">{((hie.knowledgeSignature.interHarmonicDialect?.consonanceScore || 0) * 100).toFixed(0)}%</span></div>
                                            <div>Complexity: <span className="text-amber-300">{hie.knowledgeSignature.interHarmonicDialect?.complexityIndex?.toFixed(3)}</span></div>
                                            <div>Envelope: <span className="text-amber-300">{hie.knowledgeSignature.spectralMorphology?.envelopeShape}</span></div>
                                            <div>Timbre: <span className="text-amber-300">{hie.knowledgeSignature.cepstralFingerprint?.timbreClass}</span></div>
                                            <div>Tonal Center: <span className="text-amber-300">{hie.knowledgeSignature.tonalGravityField?.center} ({hie.knowledgeSignature.tonalGravityField?.weight?.toFixed(3)})</span></div>
                                            <div>Arc: <span className="text-amber-300">{hie.knowledgeSignature.temporalNarrative?.arcType}</span></div>
                                          </div>
                                          {hie.knowledgeSignature.knowledgeGlyphs && hie.knowledgeSignature.knowledgeGlyphs.length > 0 && (
                                            <div className="bg-[#0d111d]/60 rounded p-2 mt-1">
                                              <div className="text-[10px] font-medium text-amber-400/80 mb-1">Knowledge Glyphs</div>
                                              <div className="space-y-0.5">
                                                {(hie.knowledgeSignature.knowledgeGlyphs as string[]).map((g: string, gi: number) => (
                                                  <div key={gi} className="text-[10px] text-amber-200/70 font-mono leading-tight">{g}</div>
                                                ))}
                                              </div>
                                            </div>
                                          )}
                                          {hie.knowledgeSignature.modulationCode && (hie.knowledgeSignature.modulationCode as any[]).length > 0 && (
                                            <div className="bg-[#0d111d]/60 rounded p-2">
                                              <div className="text-[10px] font-medium text-amber-400/80 mb-1">Modulation Codes</div>
                                              {(hie.knowledgeSignature.modulationCode as any[]).map((m: any, mi: number) => (
                                                <div key={mi} className="text-[10px] text-amber-200/70 font-mono">{m.carrierFreq?.toFixed(0)}Hz @ {m.modulationHz?.toFixed(2)}Hz — {m.symbolicMeaning}</div>
                                              ))}
                                            </div>
                                          )}
                                          {hie.knowledgeSignature.temporalNarrative?.phases && (hie.knowledgeSignature.temporalNarrative.phases as any[]).length > 0 && (
                                            <div className="flex gap-0.5 mt-1">
                                              {(hie.knowledgeSignature.temporalNarrative.phases as any[]).slice(0, 16).map((p: any, pi: number) => (
                                                <div key={pi} className="flex-1 text-center" title={`${p.timeStart?.toFixed(1)}s: ${p.character}`}>
                                                  <div
                                                    className="bg-amber-500/30 rounded-sm mx-auto"
                                                    style={{ width: "100%", height: `${Math.max(3, (p.energy || 0) * 80)}px` }}
                                                  />
                                                  <div className="text-[7px] text-neutral-600 mt-0.5">{p.character?.split(" ")[0]}</div>
                                                </div>
                                              ))}
                                            </div>
                                          )}

                                          {hie.knowledgeSignature?.spectralColorMap && hie.knowledgeSignature.spectralColorMap.length > 0 && (
                                            <div className="mt-3 border-t border-amber-500/15 pt-2">
                                              <div className="text-[10px] text-amber-500/70 font-medium mb-1.5">SPECTRAL COLOR MAP</div>
                                              <div className="flex items-center gap-0.5 rounded overflow-hidden" style={{ height: "28px" }}>
                                                {hie.knowledgeSignature.spectralColorMap.map((c: any, ci: number) => (
                                                  <div
                                                    key={ci}
                                                    className="flex-1 h-full relative group cursor-default"
                                                    style={{ backgroundColor: c.hex }}
                                                    title={`${c.freq.toFixed(0)}Hz — ${c.hex}`}
                                                  />
                                                ))}
                                              </div>
                                              <div className="flex justify-between text-[8px] text-neutral-600 mt-0.5">
                                                <span>low freq</span>
                                                <span>high freq</span>
                                              </div>
                                            </div>
                                          )}

                                          {hie.knowledgeSignature?.overtoneColors && hie.knowledgeSignature.overtoneColors.length > 0 && (
                                            <div className="mt-2">
                                              <div className="text-[10px] text-amber-500/70 font-medium mb-1">OVERTONE COLORS</div>
                                              <div className="flex items-end gap-px rounded overflow-hidden" style={{ height: "24px" }}>
                                                {hie.knowledgeSignature.overtoneColors.map((oc: any, oci: number) => (
                                                  <div
                                                    key={oci}
                                                    className="flex-1"
                                                    style={{
                                                      backgroundColor: oc.hex,
                                                      height: `${Math.max(4, oc.strength * 24)}px`,
                                                    }}
                                                    title={`H${oc.harmonic} ${oc.freq.toFixed(0)}Hz — ${oc.hex}`}
                                                  />
                                                ))}
                                              </div>
                                            </div>
                                          )}

                                          {hie.knowledgeSignature?.temporalColors && hie.knowledgeSignature.temporalColors.length > 0 && (
                                            <div className="mt-2">
                                              <div className="text-[10px] text-amber-500/70 font-medium mb-1">TEMPORAL COLOR FLOW</div>
                                              <div className="flex gap-0 rounded overflow-hidden" style={{ height: "16px" }}>
                                                {hie.knowledgeSignature.temporalColors.map((tc: any, tci: number) => (
                                                  <div
                                                    key={tci}
                                                    className="flex-1 h-full"
                                                    style={{ backgroundColor: tc.hex }}
                                                    title={`Seg ${tc.segment} — ${tc.dominantFreq.toFixed(0)}Hz — ${tc.hex}`}
                                                  />
                                                ))}
                                              </div>
                                              <div className="flex justify-between text-[8px] text-neutral-600 mt-0.5">
                                                <span>start</span>
                                                <span>end</span>
                                              </div>
                                            </div>
                                          )}

                                          {hie.knowledgeSignature?.dominantColor && (
                                            <div className="mt-2 flex items-center gap-2">
                                              <div
                                                className="w-4 h-4 rounded-full border border-amber-500/30"
                                                style={{ backgroundColor: hie.knowledgeSignature.dominantColor }}
                                              />
                                              <span className="text-[10px] text-amber-300/80">
                                                Dominant: {hie.knowledgeSignature.dominantColor}
                                              </span>
                                            </div>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              )}

                              {/* Developer Tools: Chart results */}
                              {msg.chartResults && msg.chartResults.length > 0 && (
                                <div className="mt-4 space-y-3">
                                  {msg.chartResults.map((chart, i) => (
                                    <div key={i} className="rounded-xl border border-blue-500/30 bg-blue-500/5 overflow-hidden">
                                      <div className="flex items-center gap-2 px-4 py-2 bg-blue-500/10 border-b border-blue-500/20">
                                        <span className="text-blue-400">📊</span>
                                        <span className="font-semibold text-blue-300 text-sm">{chart.title || "Chart"}</span>
                                        {chart.chart_type && <span className="ml-auto px-2 py-0.5 rounded-full text-xs bg-blue-500/20 text-blue-300 border border-blue-500/30 capitalize">{chart.chart_type}</span>}
                                      </div>
                                      {chart.chart_png ? (
                                        <img src={`data:image/png;base64,${chart.chart_png}`} alt={chart.title || "Chart"} className="w-full" />
                                      ) : (
                                        <p className="p-3 text-xs text-red-400">{chart.error || "Chart generation failed"}</p>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              )}

                              {/* Developer Tools: Diagram results */}
                              {msg.diagramResults && msg.diagramResults.length > 0 && (
                                <div className="mt-4 space-y-3">
                                  {msg.diagramResults.map((diag, i) => (
                                    <div key={i} className="rounded-xl border border-teal-500/30 bg-teal-500/5 overflow-hidden">
                                      <div className="flex items-center gap-2 px-4 py-2 bg-teal-500/10 border-b border-teal-500/20">
                                        <span className="text-teal-400">🕸️</span>
                                        <span className="font-semibold text-teal-300 text-sm">Graph Diagram</span>
                                        {diag.diagram_type && <span className="ml-auto px-2 py-0.5 rounded-full text-xs bg-teal-500/20 text-teal-300 border border-teal-500/30 capitalize">{diag.diagram_type}</span>}
                                      </div>
                                      {diag.diagram_png ? (
                                        <img src={`data:image/png;base64,${diag.diagram_png}`} alt="Diagram" className="w-full bg-white/5 p-2" />
                                      ) : diag.diagram_svg ? (
                                        <div className="p-4 overflow-auto" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(diag.diagram_svg, { USE_PROFILES: { svg: true } }) }} />
                                      ) : (
                                        <p className="p-3 text-xs text-red-400">{diag.error || "Diagram generation failed"}</p>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              )}

                              {/* Developer Tools: Math results */}
                              {msg.mathResults && msg.mathResults.length > 0 && (
                                <div className="mt-4 space-y-3">
                                  {msg.mathResults.map((math, i) => (
                                    <div key={i} className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4">
                                      <div className="flex items-center gap-2 mb-2">
                                        <span className="text-amber-400">∑</span>
                                        <span className="font-semibold text-amber-300 text-sm capitalize">{math.action || "Math Result"}</span>
                                      </div>
                                      {math.error ? (
                                        <p className="text-xs text-red-400">{math.error}</p>
                                      ) : (
                                        <div className="space-y-1 text-xs text-neutral-300 font-mono">
                                          {math.plot_png && <img src={`data:image/png;base64,${math.plot_png}`} alt="Math Plot" className="w-full rounded" />}
                                          {math.solutions && math.solutions.length > 0 && <div><span className="text-amber-400">Solutions: </span>{math.solutions.join(", ")}</div>}
                                          {math.result && <div><span className="text-amber-400">Result: </span>{math.result}</div>}
                                          {math.latex && <div><span className="text-amber-400">LaTeX: </span><code className="bg-black/20 px-1 rounded">{math.latex}</code></div>}
                                          {math.derivative && <div><span className="text-amber-400">Derivative: </span>{math.derivative}</div>}
                                          {math.factored && <div><span className="text-amber-400">Factored: </span>{math.factored}</div>}
                                          {typeof math.mean === "number" && <div className="grid grid-cols-3 gap-2 mt-2"><div>Mean: <span className="text-amber-300">{math.mean?.toFixed(3)}</span></div><div>Median: <span className="text-amber-300">{math.median?.toFixed(3)}</span></div><div>Std: <span className="text-amber-300">{math.std?.toFixed(3)}</span></div></div>}
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              )}

                              {/* Developer Tools: NLP results */}
                              {msg.nlpResults && msg.nlpResults.length > 0 && (
                                <div className="mt-4 space-y-3">
                                  {msg.nlpResults.map((nlp, i) => (
                                    <div key={i} className="rounded-xl border border-green-500/30 bg-green-500/5 p-4">
                                      <div className="flex items-center gap-2 mb-3">
                                        <span className="text-green-400">🧠</span>
                                        <span className="font-semibold text-green-300 text-sm">NLP Analysis</span>
                                        {nlp.action && <span className="ml-auto px-2 py-0.5 rounded-full text-xs bg-green-500/20 text-green-300 border border-green-500/30 capitalize">{nlp.action}</span>}
                                      </div>
                                      {nlp.stats && <div className="grid grid-cols-3 gap-2 text-xs mb-3">{Object.entries(nlp.stats).slice(0,6).map(([k,v]) => <div key={k} className="bg-black/20 rounded p-1"><div className="text-neutral-500 capitalize">{k.replace(/_/g," ")}</div><div className="text-green-300 font-semibold">{String(v)}</div></div>)}</div>}
                                      {nlp.keywords && nlp.keywords.length > 0 && <div className="flex flex-wrap gap-1 mt-2">{nlp.keywords.slice(0,15).map((kw: any) => <span key={kw.word} className="px-2 py-0.5 rounded-full text-xs bg-green-500/10 text-green-300 border border-green-500/20">{kw.word} <span className="opacity-60">×{kw.count}</span></span>)}</div>}
                                      {nlp.sentiment && <div className="mt-2 text-xs"><span className="text-neutral-400">Sentiment: </span><span className={nlp.sentiment.label === "positive" ? "text-green-400" : nlp.sentiment.label === "negative" ? "text-red-400" : "text-neutral-400"}>{nlp.sentiment.label}</span></div>}
                                      {nlp.named_entities && Object.keys(nlp.named_entities).length > 0 && <div className="mt-2 text-xs"><div className="text-neutral-400 mb-1">Named Entities:</div><div className="flex flex-wrap gap-1">{Object.entries(nlp.named_entities).flatMap(([type, vals]: [string, any]) => (vals as string[]).slice(0,3).map((v: string) => <span key={`${type}-${v}`} className="px-2 py-0.5 rounded text-xs bg-purple-500/10 text-purple-300 border border-purple-500/20">{type}: {v}</span>))}</div></div>}
                                    </div>
                                  ))}
                                </div>
                              )}

                              {/* Developer Tools: Data Science results */}
                              {msg.dataScienceResults && msg.dataScienceResults.length > 0 && (
                                <div className="mt-4 space-y-3">
                                  {msg.dataScienceResults.map((ds, i) => (
                                    <div key={i} className="rounded-xl border border-rose-500/30 bg-rose-500/5 p-4">
                                      <div className="flex items-center gap-2 mb-3">
                                        <span className="text-rose-400">🤖</span>
                                        <span className="font-semibold text-rose-300 text-sm capitalize">ML: {ds.action || "Data Science"}</span>
                                      </div>
                                      {ds.error ? <p className="text-xs text-red-400">{ds.error}</p> : (
                                        <div className="space-y-2">
                                          {(ds.scatter_plot_png || ds.heatmap_png) && <img src={`data:image/png;base64,${ds.scatter_plot_png || ds.heatmap_png}`} alt="ML Visualization" className="w-full rounded" />}
                                          {ds.cluster_counts && <div className="text-xs"><span className="text-rose-400">Clusters found: </span><span className="text-neutral-300">{ds.n_clusters_found} — {JSON.stringify(ds.cluster_counts)}</span></div>}
                                          {typeof ds.r2_score === "number" && <div className="grid grid-cols-2 gap-2 text-xs"><div className="bg-black/20 rounded p-2"><div className="text-neutral-500">R² Score</div><div className="text-rose-300 font-bold text-lg">{ds.r2_score?.toFixed(3)}</div></div><div className="bg-black/20 rounded p-2"><div className="text-neutral-500">RMSE</div><div className="text-rose-300 font-bold text-lg">{ds.rmse?.toFixed(3)}</div></div></div>}
                                          {typeof ds.anomaly_count === "number" && <div className="text-xs"><span className="text-rose-400">Anomalies detected: </span><span className="text-neutral-300">{ds.anomaly_count} ({ds.anomaly_rate?.toFixed(1)}%)</span></div>}
                                          {ds.top_correlations && <div className="text-xs mt-2"><div className="text-neutral-400 mb-1">Top correlations:</div>{ds.top_correlations.slice(0,5).map((c: any) => <div key={c.cols} className="flex justify-between"><span className="text-neutral-300">{c.cols}</span><span className={Math.abs(c.correlation) > 0.7 ? "text-rose-400" : "text-neutral-400"}>{c.correlation.toFixed(3)}</span></div>)}</div>}
                                          {ds.shape && <div className="text-xs text-neutral-400">Dataset: {ds.shape[0]} rows × {ds.shape[1]} cols</div>}
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              )}

                              {/* Generated 3D models — interactive Three.js PBR viewer */}
                              {msg.models3d && msg.models3d.length > 0 && (
                                <div className="mt-4 space-y-4">
                                  {msg.models3d.map((model) => (
                                    <Model3DCard key={model.index} model={model} />
                                  ))}
                                </div>
                              )}

                              {/* Generated games */}
                              {msg.games && msg.games.length > 0 && (
                                <div className="mt-4 space-y-4">
                                  {msg.games.map((game) => (
                                    <GameCard key={game.index} game={game} />
                                  ))}
                                </div>
                              )}

                              {/* Downloadable artifacts */}
                              {msg.artifacts && msg.artifacts.length > 0 && (
                                <div className="mt-4 space-y-2">
                                  {msg.artifacts.map((artifact, i) => (
                                    <ArtifactCard key={i} artifact={artifact} />
                                  ))}
                                </div>
                              )}

                              {/* Extended tool results (weather, news, academic, stock, QR, etc.) */}
                              {msg.toolResults && msg.toolResults.length > 0 && (
                                <div className="mt-3 space-y-2">
                                  {msg.toolResults.map((tool, ti) => (
                                    <ToolResultCard key={ti} tool={tool} />
                                  ))}
                                </div>
                              )}

                              {/* Credit cost — white text */}
                              {msg.creditCost != null && !msg.generatingImages && (
                                <CreditCostBadge creditCost={msg.creditCost} costBreakdown={msg.costBreakdown} />
                              )}

                              {/* Smart Predictive Follow-Ups — contextual suggestion chips */}
                              {msg.suggestions && msg.suggestions.length > 0 && (
                                <div className="mt-3 flex flex-wrap gap-1.5">
                                  {msg.suggestions.map((s, si) => (
                                    <button
                                      key={si}
                                      onClick={() => { setInputWithDraft(s); }}
                                      className="text-[10px] font-mono text-white/60 hover:text-white/90 border border-white/10 hover:border-primary/40 bg-white/3 hover:bg-primary/8 rounded-full px-2.5 py-1 transition-all duration-200 text-left"
                                    >
                                      {s}
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}

                  {/* ── Agent Build Panel ── */}
                  <AnimatePresence>
                    {buildPanel && (
                      <AgentBuildPanel
                        state={buildPanel}
                        onClose={() => { setBuildPanel(null); setMobileBuilderOpen(false); }}
                        onMobileClose={() => setMobileBuilderOpen(false)}
                        onMobileOpen={() => setMobileBuilderOpen(true)}
                        mobileOpen={mobileBuilderOpen}
                        onDeploy={() => window.open("https://omnimens-ai.com/", "_blank")}
                      />
                    )}
                  </AnimatePresence>

                  {isTyping && messages[messages.length - 1]?.role === "user" && !buildPanel && (
                    <div className="flex justify-start">
                      <div className="bg-primary/5 border border-primary/20 rounded-2xl rounded-tl-sm px-5 py-4">
                        <div className="flex items-center gap-2 mb-2 text-primary font-bold text-[10px] tracking-widest uppercase">
                          <OmnimensIcon size={14} />
                          OMNIMENS
                        </div>
                        <div className="flex gap-1">
                          <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                          <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                          <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                        </div>
                      </div>
                    </div>
                  )}

                  {error && (
                    <div className="text-destructive font-mono text-sm flex items-center justify-center gap-2 p-4 border border-destructive/30 rounded-lg bg-destructive/10">
                      <ShieldAlert className="w-4 h-4" />
                      {error}
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>
              </>
            )}
            </>}
          </div>

          {/* Deep research result */}
          {researchResult && (
            <div className="shrink-0 border-t border-violet-400/15 max-h-[280px] overflow-y-auto omnimens-scrollbar">
              <div className="sticky top-0 flex items-center justify-between px-4 py-2.5 bg-violet-950/80 backdrop-blur border-b border-violet-400/15">
                <div className="flex items-center gap-2 text-violet-300 font-mono text-xs font-bold tracking-widest">
                  <Microscope className="w-3.5 h-3.5" />
                  DEEP RESEARCH REPORT
                  <span className="text-violet-400/50">· {researchResult.totalResults} sources · {researchResult.subQueries?.length} searches</span>
                </div>
                <button onClick={() => setResearchResult(null)} className="text-white/85 hover:text-white text-xs">✕</button>
              </div>
              <div className="p-4 bg-black/60">
                <div className="markdown-body text-sm">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{researchResult.report}</ReactMarkdown>
                </div>
                {researchResult.sources?.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-white/10">
                    <p className="text-[10px] font-mono text-white/85 uppercase tracking-widest mb-2">Sources ({researchResult.sources.length})</p>
                    <div className="space-y-1">
                      {researchResult.sources.map((s: any, i: number) => (
                        <a key={i} href={s.url} target="_blank" rel="noopener noreferrer" className="block text-xs text-primary/60 hover:text-primary font-mono truncate">
                          [{i+1}] {s.title}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tone Selector — hide on mobile when not on Create tab */}
          <div className={mobileNav !== "create" ? "hidden sm:block" : ""}>
          <ToneSelector value={responseMode} onChange={setResponseMode} />
          </div>

          {/* Credit alert banner — hide on mobile when not on Create tab */}
          <div className={mobileNav !== "create" ? "hidden sm:block" : ""}>
          {creditsAlert && (
            <div className={`shrink-0 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-2.5 text-[11px] sm:text-[12px] font-mono border-t ${
              creditsAlert.kind === "need_resonance"
                ? "bg-violet-500/10 border-violet-500/25 text-violet-300"
                : creditsAlert.kind === "no_wallet"
                ? "bg-amber-500/10 border-amber-500/25 text-amber-300"
                : "bg-red-500/10 border-red-500/25 text-red-300"
            }`}>
              <div className="flex items-center gap-2">
                {creditsAlert.kind === "need_resonance" ? (
                  <>
                    <Brain className="w-3.5 h-3.5 shrink-0" />
                    <span>{creditsAlert.msg || "You need resonance credits for Deep Resonance. Purchase a pack to continue."}</span>
                  </>
                ) : creditsAlert.kind === "no_wallet" ? (
                  <>
                    <Zap className="w-3.5 h-3.5 shrink-0" />
                    <span>You&apos;re out of credits — connect a payment card to continue automatically.</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                    <span>Auto-payment failed: {creditsAlert.msg} — update your card to continue.</span>
                  </>
                )}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => setLocation(creditsAlert.kind === "need_resonance" ? "/pricing?section=resonance" : "/account")}
                  className={`px-2.5 py-1 rounded border text-[11px] font-bold transition-colors ${
                    creditsAlert.kind === "need_resonance"
                      ? "border-violet-400/40 bg-violet-400/10 hover:bg-violet-400/20 text-violet-300"
                      : creditsAlert.kind === "no_wallet"
                      ? "border-amber-400/40 bg-amber-400/10 hover:bg-amber-400/20 text-amber-300"
                      : "border-red-400/40 bg-red-400/10 hover:bg-red-400/20 text-red-300"
                  }`}
                >
                  {creditsAlert.kind === "need_resonance" ? "BUY RESONANCE CREDITS" : creditsAlert.kind === "no_wallet" ? "CONNECT CARD" : "UPDATE CARD"}
                </button>
                <button onClick={() => setCreditsAlert(null)} className="opacity-50 hover:opacity-100">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* Input area */}
          <form onSubmit={handleSubmit} className="shrink-0 border-t px-2 sm:px-3 pt-2 sm:pt-3 pb-1" style={{ paddingBottom: "max(8px, env(safe-area-inset-bottom))", borderColor: isLight ? "rgba(20,23,34,0.1)" : "#21262d", background: isLight ? "#ffffff" : "#161b22" }}>
            {/* Mobile quick-action toolbar */}
            <div className="sm:hidden flex items-center gap-2 px-1 pb-2 mb-1 border-b" style={{ borderColor: isLight ? "rgba(20,23,34,0.06)" : "rgba(255,255,255,0.04)" }}>
              <button type="button" onClick={() => fileInputRef.current?.click()} className="p-1.5 rounded-md transition-colors border" style={{ color: isLight ? "rgba(20,23,34,0.5)" : "#9DA5B4", background: isLight ? "rgba(0,0,0,0.03)" : "rgba(28,35,51,0.8)", borderColor: isLight ? "rgba(20,23,34,0.08)" : "rgba(43,50,69,0.6)" }}>
                <Paperclip className="w-4 h-4" />
              </button>
              <button type="button" onClick={toggleVoiceInput} className={`p-1.5 rounded-md transition-colors border ${isListening ? "text-rose-400 animate-pulse" : ""}`} style={{ color: isListening ? undefined : (isLight ? "rgba(20,23,34,0.5)" : "#9DA5B4"), background: isLight ? "rgba(0,0,0,0.03)" : "rgba(28,35,51,0.8)", borderColor: isLight ? "rgba(20,23,34,0.08)" : "rgba(43,50,69,0.6)" }}>
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>
              <button type="button" onClick={() => setShowCamera(true)} className="p-1.5 rounded-md transition-colors border" style={{ color: isLight ? "rgba(20,23,34,0.5)" : "#9DA5B4", background: isLight ? "rgba(0,0,0,0.03)" : "rgba(28,35,51,0.8)", borderColor: isLight ? "rgba(20,23,34,0.08)" : "rgba(43,50,69,0.6)" }}>
                <Camera className="w-4 h-4" />
              </button>
              <div className="w-px h-4" style={{ background: isLight ? "rgba(20,23,34,0.08)" : "rgba(43,50,69,0.6)" }} />
              <button type="button" onClick={() => setShowControlHub(true)} className="flex items-center gap-1 px-2 p-1.5 rounded-md transition-colors border" style={{ color: isLight ? "rgba(20,23,34,0.5)" : "#9DA5B4", background: isLight ? "rgba(0,0,0,0.03)" : "rgba(28,35,51,0.8)", borderColor: isLight ? "rgba(20,23,34,0.08)" : "rgba(43,50,69,0.6)" }}>
                <Brain className="w-3.5 h-3.5" />
                <span className="text-[9px] font-medium uppercase tracking-wide">Persona</span>
              </button>
              <button type="button" onClick={() => { setShowPlusMenu(v => !v); setShowMediaSettings(false); }} className="p-1.5 rounded-md transition-colors border" style={{ color: isLight ? "rgba(20,23,34,0.5)" : "#eab308", background: isLight ? "rgba(0,0,0,0.03)" : "rgba(28,35,51,0.8)", borderColor: isLight ? "rgba(20,23,34,0.08)" : "rgba(43,50,69,0.6)" }}>
                <Zap className="w-4 h-4" />
              </button>
            </div>
            <PendingFileList files={pendingFiles} onRemove={removeFile} />
            {(mediaSettings.imageStyle !== "auto" || mediaSettings.imageAspect !== "1:1" || mediaSettings.imageQuality !== "auto" || mediaSettings.videoAspect !== "16:9") && (
              <div className="flex flex-wrap gap-1 mb-1.5 px-1">
                {mediaSettings.imageStyle !== "auto" && (
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-pink-500/10 border border-pink-500/20 text-[8px] font-mono text-pink-400">
                    <Palette className="w-2.5 h-2.5" /> {mediaSettings.imageStyle}
                    <button type="button" onClick={() => setMediaSettings(s => ({ ...s, imageStyle: "auto" }))} className="ml-0.5 hover:text-pink-200"><X className="w-2 h-2" /></button>
                  </span>
                )}
                {mediaSettings.imageAspect !== "1:1" && (
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-blue-500/10 border border-blue-500/20 text-[8px] font-mono text-blue-400">
                    {mediaSettings.imageAspect}
                    <button type="button" onClick={() => setMediaSettings(s => ({ ...s, imageAspect: "1:1" }))} className="ml-0.5 hover:text-blue-200"><X className="w-2 h-2" /></button>
                  </span>
                )}
                {mediaSettings.imageQuality !== "auto" && (
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-[8px] font-mono text-amber-400">
                    {mediaSettings.imageQuality}
                    <button type="button" onClick={() => setMediaSettings(s => ({ ...s, imageQuality: "auto" }))} className="ml-0.5 hover:text-amber-200"><X className="w-2 h-2" /></button>
                  </span>
                )}
                {mediaSettings.videoAspect !== "16:9" && (
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-[8px] font-mono text-emerald-400">
                    <Film className="w-2.5 h-2.5" /> {mediaSettings.videoAspect}
                    <button type="button" onClick={() => setMediaSettings(s => ({ ...s, videoAspect: "16:9" }))} className="ml-0.5 hover:text-emerald-200"><X className="w-2 h-2" /></button>
                  </span>
                )}
              </div>
            )}
            <div className="relative flex items-center">
              <input ref={fileInputRef} type="file" multiple
                accept="*/*"
                onChange={handleFileChange} className="hidden"
              />
              {/* + menu button */}
              <div ref={plusMenuRef} className="absolute left-2 z-20">
                <button
                  type="button"
                  onClick={() => { setShowPlusMenu(v => !v); setShowMediaSettings(false); }}
                  disabled={isTyping}
                  title="Actions"
                  className={`w-7 h-7 flex items-center justify-center rounded-lg transition-all ${showPlusMenu ? "text-primary bg-primary/15" : pendingFiles.length > 0 ? "text-primary" : "text-white/50 hover:text-white/70 hover:bg-white/5"} disabled:opacity-30`}
                >
                  <Plus className="w-4 h-4" />
                  {pendingFiles.length > 0 && (
                    <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-primary text-[7px] font-bold text-black flex items-center justify-center">
                      {pendingFiles.length}
                    </span>
                  )}
                </button>

                {/* + Popup Menu */}
                <AnimatePresence>
                  {showPlusMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.96 }}
                      transition={{ duration: 0.15 }}
                      className="absolute bottom-full left-0 mb-2 w-[calc(100vw-2rem)] sm:w-64 max-w-72 bg-[#111] border border-white/12 rounded-xl shadow-2xl overflow-hidden z-50"
                    >
                      {showMediaSettings ? (
                        <MediaSettingsPanel
                          settings={mediaSettings}
                          onChange={setMediaSettings}
                          onClose={() => setShowMediaSettings(false)}
                        />
                      ) : (
                        <PlusMenuContent
                          onClose={() => setShowPlusMenu(false)}
                          onUpload={() => { fileInputRef.current?.click(); setShowPlusMenu(false); }}
                          onDatabase={() => { setInputWithDraft(v => (v ? v + "\n" : "") + "Help me with a database query: "); setShowPlusMenu(false); }}
                          onWebSearch={() => { setDeepResearchMode(true); setShowPlusMenu(false); }}
                          onResonance={() => { setDeepResonanceOpen(true); setShowPlusMenu(false); }}
                          onTasks={() => { setShowTasksPanel(true); setShowPlusMenu(false); }}
                          onGenerateImage={() => { setInputWithDraft(v => (v ? v + "\n" : "") + "Generate an image of "); setShowPlusMenu(false); }}
                          onGenerateVideo={() => { setInputWithDraft(v => (v ? v + "\n" : "") + "Generate a video of "); setShowPlusMenu(false); }}
                          onEditImage={() => { fileInputRef.current?.click(); setInputWithDraft(v => (v ? v + "\n" : "") + "Edit this image: "); setShowPlusMenu(false); }}
                          on3DModel={() => { setInputWithDraft(v => (v ? v + "\n" : "") + "Build me an interactive Three.js 3D scene: "); setShowPlusMenu(false); }}
                          onLipSync={() => { setLocation("/lip-sync"); setShowPlusMenu(false); }}
                          onMediaSettings={() => setShowMediaSettings(true)}
                          onSelectSkill={(skill) => {
                            handlePersonaChange(skill.persona);
                            setInputWithDraft(v => (v ? v + "\n" : "") + `Using ${skill.name}: `);
                            setShowPlusMenu(false);
                          }}
                        />
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <textarea
                value={input}
                onChange={(e) => setInputWithDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSubmit(e); }
                }}
                placeholder={accountLocked ? "ACCOUNT LOCKED — Pay outstanding balance to continue" : pendingFiles.length > 0 ? "Describe what to create with these files..." : "Query the intelligence... or attach files to build something"}
                className="w-full rounded-xl pl-10 pr-[6.5rem] sm:pr-[11rem] py-3 sm:py-3.5 font-mono text-sm resize-none h-[48px] sm:h-[56px] omnimens-scrollbar outline-none transition-all border focus:border-primary focus:ring-1 focus:ring-primary/50"
                style={{
                  background: isLight ? "#f4f5f8" : "#0d1117",
                  borderColor: accountLocked ? "rgba(239,68,68,0.5)" : isLight ? "rgba(168,85,247,0.25)" : "rgba(255,255,255,0.15)",
                  color: isLight ? "#141722" : "#fff",
                }}
                disabled={isTyping || accountLocked}
              />
              <div className="absolute right-2 flex items-center gap-1">
                {!accountLocked && (
                  <>
                    <span className="hidden sm:flex">
                      <BuildTriggerButton onClick={() => setShowNewAppModal(true)} />
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowTemplates(t => !t)}
                      title="Smart Templates"
                      className="hidden sm:flex text-white/40 hover:text-primary transition-colors w-7 h-7 items-center justify-center rounded"
                    >
                      <LayoutTemplate className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowCamera(true)}
                      title="Camera — capture a photo to attach"
                      className="hidden sm:flex text-white/40 hover:text-primary transition-colors w-7 h-7 items-center justify-center rounded"
                    >
                      <Camera className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={toggleVoiceInput}
                      title={isListening ? "Stop listening" : "Speak your message"}
                      className={`hidden sm:flex transition-colors w-7 h-7 items-center justify-center rounded ${
                        isListening
                          ? "text-rose-400 animate-pulse bg-rose-400/10"
                          : "text-white/40 hover:text-primary"
                      }`}
                    >
                      {isListening ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                    </button>
                  </>
                )}
                {isTyping ? (
                  <Button type="button" onClick={stopGeneration} size="icon" variant="ghost" className="text-white hover:text-white">
                    <StopCircle className="w-5 h-5" />
                  </Button>
                ) : (
                  <Button type="submit" size="icon" variant="default"
                    disabled={(!input.trim() && pendingFiles.length === 0) || accountLocked}
                    className="rounded-lg w-10 h-10 min-w-[44px] min-h-[44px] shadow-none border-none"
                    style={(input.trim() || pendingFiles.length > 0) ? { boxShadow: "0 0 10px rgba(168,85,247,0.4)" } : undefined}
                  >
                    <Send className="w-4 h-4 ml-1" />
                  </Button>
                )}
              </div>
            </div>
            <div className="flex items-center justify-between mt-1.5 px-1">
              <div className="flex items-center gap-2 min-w-0">
                <span className="hidden sm:inline text-[9px] font-mono text-white/70 truncate">
                  {PERSONA_NAMES[persona]} · MEMORY ACTIVE
                </span>
                <span className="sm:hidden text-[8px] font-mono" style={{ color: input.length > 1800 ? "#f87171" : "rgba(255,255,255,0.25)" }}>{input.length}/2000</span>
                <ModelSelector value={selectedModel} onChange={setSelectedModel} paidUser={!!status?.paidUser} />
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {hubSettings.antiHallucinationMode && (
                  <span className="hidden sm:flex items-center gap-0.5 text-[8px] font-mono text-orange-400/70">
                    <ShieldCheck className="w-2.5 h-2.5" /> VERIFIED
                  </span>
                )}
                {hubSettings.debateMode && (
                  <span className="hidden sm:flex items-center gap-0.5 text-[8px] font-mono text-violet-400/70">
                    <Swords className="w-2.5 h-2.5" /> DEBATE
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => setShowControlHub(true)}
                  className="hidden sm:flex text-[8px] font-mono text-white/25 hover:text-primary/60 transition-colors items-center gap-0.5"
                >
                  <Settings className="w-2.5 h-2.5" /> HUB
                </button>
              </div>
            </div>
          </form>

          {/* Smart Templates overlay */}
          <SmartTemplates
            open={showTemplates}
            onClose={() => setShowTemplates(false)}
            onUseTemplate={(t) => { setInputWithDraft(t); setShowTemplates(false); }}
          />
          </div>{/* end mobile-create wrapper */}

          {/* ── Bottom Console Panel ────────── */}
          <AnimatePresence initial={false}>
            {consoleOpen && (
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: 180 }}
                exit={{ height: 0 }}
                transition={{ duration: 0.15 }}
                className="shrink-0 overflow-hidden border-t"
                style={{
                  background: isLight ? "#f8f9fb" : "#0D1117",
                  borderColor: isLight ? "rgba(20,23,34,0.08)" : "rgba(255,255,255,0.06)",
                }}
              >
                <div
                  className="flex items-center gap-2 px-3 border-b shrink-0"
                  style={{
                    height: 30,
                    background: isLight ? "#f0f1f6" : "#161b22",
                    borderColor: isLight ? "rgba(20,23,34,0.08)" : "rgba(255,255,255,0.06)",
                  }}
                >
                  <button
                    className="flex items-center gap-1.5 px-2 h-[30px] text-[10px] font-mono font-bold tracking-wider transition-all"
                    style={{ color: "#a855f7", borderBottom: "2px solid #a855f7" }}
                  >
                    <Terminal className="w-3 h-3" />
                    CONSOLE
                  </button>
                  <button
                    className="flex items-center gap-1.5 px-2 h-[30px] text-[10px] font-mono tracking-wider transition-all"
                    style={{ color: isLight ? "rgba(20,23,34,0.4)" : "rgba(255,255,255,0.35)", borderBottom: "2px solid transparent" }}
                  >
                    <Activity className="w-3 h-3" />
                    ACTIVITY
                  </button>
                  <div className="flex-1" />
                  <button
                    onClick={() => setConsoleOpen(false)}
                    className="w-5 h-5 flex items-center justify-center transition-all"
                    style={{ color: isLight ? "rgba(20,23,34,0.35)" : "rgba(255,255,255,0.3)" }}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto p-3 font-mono text-[11px] leading-relaxed" style={{ color: isLight ? "rgba(20,23,34,0.6)" : "rgba(255,255,255,0.5)", height: 148 }}>
                  <div className="flex items-center gap-2 mb-1">
                    <span style={{ color: "rgba(255,255,255,0.25)" }}>[system]</span>
                    <span>OMNIMENS IDE ready — {messages.length} messages in session</span>
                  </div>
                  <div className="flex items-center gap-2 mb-1">
                    <span style={{ color: "rgba(255,255,255,0.25)" }}>[model]</span>
                    <span>{selectedModel} · {agentMode.toUpperCase()} mode</span>
                  </div>
                  <div className="flex items-center gap-2 mb-1">
                    <span style={{ color: "rgba(255,255,255,0.25)" }}>[persona]</span>
                    <span>{PERSONA_NAMES[persona] || persona}</span>
                  </div>
                  {isTyping && (
                    <div className="flex items-center gap-2 mb-1">
                      <span style={{ color: "#a855f7" }}>[active]</span>
                      <span className="text-primary">Generating response...</span>
                    </div>
                  )}
                  {hubSettings.antiHallucinationMode && (
                    <div className="flex items-center gap-2 mb-1">
                      <span style={{ color: "rgba(255,255,255,0.25)" }}>[verify]</span>
                      <span>Anti-hallucination mode enabled</span>
                    </div>
                  )}
                  {deepResearchMode && (
                    <div className="flex items-center gap-2 mb-1">
                      <span style={{ color: "rgba(255,255,255,0.25)" }}>[research]</span>
                      <span>Deep research mode active</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <span style={{ color: "rgba(255,255,255,0.25)" }}>[status]</span>
                    <span>Awaiting input<span className="animate-pulse">_</span></span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Status Bar (Replit-style dark) ─── */}
          <div
            className="shrink-0 hidden sm:flex items-center justify-between px-3"
            style={{
              background: isLight ? "#e8e9ef" : "#1C2333",
              height: 22,
              minHeight: 22,
            }}
          >
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1 font-mono text-[9px] font-bold tracking-wider" style={{ color: isLight ? "rgba(20,23,34,0.6)" : "rgba(255,255,255,0.6)" }}>
                  <GitBranch className="w-3 h-3" />
                  {PERSONA_NAMES[persona] || persona}
                </span>
                <span className="font-mono text-[9px]" style={{ color: isLight ? "rgba(20,23,34,0.4)" : "rgba(255,255,255,0.4)" }}>
                  {selectedModel}
                </span>
                <span className="font-mono text-[9px]" style={{ color: isLight ? "rgba(20,23,34,0.4)" : "rgba(255,255,255,0.4)" }}>
                  {messages.length} msg
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setConsoleOpen(o => !o)}
                  className="flex items-center gap-1 font-mono text-[9px] transition-all hover:opacity-80"
                  style={{ color: consoleOpen ? "#a855f7" : (isLight ? "rgba(20,23,34,0.5)" : "rgba(255,255,255,0.45)") }}
                >
                  <Terminal className="w-3 h-3" />
                  Console
                </button>
                <button
                  onClick={toggleTheme}
                  className="flex items-center gap-1 transition-all"
                  style={{ color: isLight ? "rgba(20,23,34,0.4)" : "rgba(255,255,255,0.35)" }}
                >
                  {theme === "light" ? <Sun className="w-3 h-3 text-yellow-500" /> : <Moon className="w-3 h-3" />}
                </button>
                <span className="font-mono text-[9px]" style={{ color: isLight ? "rgba(20,23,34,0.35)" : "rgba(255,255,255,0.35)" }}>
                  {agentMode.toUpperCase()}
                </span>
              </div>
            </div>

          {/* ── Mobile Bottom Nav (Command Center 4-tab) ── */}
          {!mobileBuilderOpen && <div
            className="sm:hidden shrink-0 flex items-center justify-around border-t"
            style={{
              background: isLight ? "#ffffff" : "#0a0f1a",
              borderColor: isLight ? "rgba(20,23,34,0.08)" : "rgba(255,255,255,0.06)",
              height: 64,
              paddingBottom: "env(safe-area-inset-bottom)",
            }}
          >
            {[
              { id: "create" as const, icon: <MessageSquare className="w-5 h-5" />, label: "Chat", hasNotif: true },
              { id: "apps" as const, icon: <FolderOpen className="w-5 h-5" />, label: "Projects" },
              { id: "account" as const, icon: <Bell className="w-5 h-5" />, label: "Alerts", hasBadge: true },
              { id: "account" as const, icon: <User className="w-5 h-5" />, label: "Account", subPage: "account" as any },
            ].map((item, idx) => (
              <button
                key={idx}
                onClick={() => { setMobileNav(item.id); if ((item as any).subPage) setAccountSubPage((item as any).subPage); else setAccountSubPage(null); }}
                className="flex flex-col items-center justify-center gap-1.5 flex-1 h-full transition-all relative"
                style={{
                  color: (item.label === "Chat" && mobileNav === "create")
                    ? "#a855f7"
                    : (item.label === "Projects" && mobileNav === "apps")
                    ? "#a855f7"
                    : (item.label === "Account" && mobileNav === "account" && !accountSubPage)
                    ? "#a855f7"
                    : (isLight ? "rgba(20,23,34,0.4)" : "rgba(90,99,118,1)"),
                }}
              >
                {((item.label === "Chat" && mobileNav === "create") || (item.label === "Projects" && mobileNav === "apps")) && (
                  <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-[3px] rounded-full bg-primary" />
                )}
                <div className="relative">
                  {item.icon}
                  {item.hasNotif && mobileNav === "create" && (
                    <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-primary rounded-full" style={{ boxShadow: "0 0 5px rgba(168,85,247,0.8)" }} />
                  )}
                  {item.hasBadge && (
                    <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-rose-500 rounded-full" style={{ border: "1px solid #0a0f1a" }} />
                  )}
                </div>
                <span className="text-[10px] font-medium tracking-wide">{item.label}</span>
              </button>
            ))}
          </div>}
        </div>

        {/* ── RIGHT PANEL ─────────────────────────────────────────── */}
        <AnimatePresence initial={false}>
          {rightOpen && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 300, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="shrink-0 overflow-hidden hidden lg:block"
              style={{
                minWidth: 0,
                borderLeft: isLight
                  ? "1px solid rgba(20,23,34,0.1)"
                  : "1px solid #21262d",
                background: isLight
                  ? "#f0f1f6"
                  : "#0D1117",
              }}
            >
              <DevRightPanel
                allImages={allImages}
                allArtifacts={allArtifacts}
                status={status}
                credits={(status as any)?.credits}
                messages={messages}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Limit Modal */}
      <AnimatePresence>
        {/* ── Avatar Studio Modal ── */}
        {showAvatarStudio && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[90] flex flex-col bg-black/95 backdrop-blur-sm"
          >
            <div className="flex items-center justify-between px-4 py-2 border-b border-white/8 bg-black/60 shrink-0">
              <div className="flex items-center gap-2">
                <PersonStanding className="w-4 h-4 text-emerald-400" />
                <span className="font-mono text-[10px] tracking-widest text-emerald-400">OMNIMENS AVATAR STUDIO</span>
                <span className="font-mono text-[8px] text-white/30 border border-white/10 px-1.5 py-0.5 rounded">
                  MediaPipe · Three.js · Blender 4 · VRM
                </span>
              </div>
              <button
                onClick={() => setShowAvatarStudio(false)}
                className="text-white/40 hover:text-white transition-colors p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <iframe
              src={`${import.meta.env.BASE_URL}avatar-studio.html`}
              className="flex-1 w-full border-0"
              title="OMNIMENS Avatar Studio"
              allow="camera;microphone"
              sandbox="allow-scripts allow-same-origin allow-forms allow-downloads"
            />
          </motion.div>
        )}

        {/* ── Agent Modes Modal ── */}
        <AnimatePresence>
          {showAgentModes && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
              onClick={e => { if (e.target === e.currentTarget) setShowAgentModes(false); }}
            >
              <motion.div
                initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 40, opacity: 0 }}
                className="bg-[#0d0d0d] border border-white/12 rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden"
              >
                <div className="flex items-center justify-between px-5 py-4 border-b border-white/8">
                  <span className="font-mono text-sm font-bold text-white/90 tracking-widest">Agent modes</span>
                  <button onClick={() => setShowAgentModes(false)} className="text-white/40 hover:text-white transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="p-3 space-y-2">
                  {/* SWIFT mode */}
                  <div
                    onClick={() => { setAgentMode("swift"); setSelectedModel("meta-llama/Llama-3.3-70B-Instruct-Turbo"); }}
                    className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${agentMode === "swift" ? "border-primary/50 bg-primary/8" : "border-white/8 hover:border-white/15"}`}
                  >
                    <div className={`w-4 h-4 rounded-full border-2 mt-0.5 shrink-0 flex items-center justify-center ${agentMode === "swift" ? "border-primary" : "border-white/30"}`}>
                      {agentMode === "swift" && <div className="w-2 h-2 rounded-full bg-primary" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-white/90 text-sm">Swift</span>
                        <Zap className="w-3.5 h-3.5 text-yellow-400" />
                      </div>
                      <p className="text-[11px] text-white/50 mt-0.5">Fast, lightweight responses. Lowest credit usage.</p>
                    </div>
                  </div>
                  {/* OMNI mode */}
                  <div
                    onClick={() => { setAgentMode("omni"); setSelectedModel("gpt-4o"); }}
                    className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${agentMode === "omni" ? "border-primary/50 bg-primary/8" : "border-white/8 hover:border-white/15"}`}
                  >
                    <div className={`w-4 h-4 rounded-full border-2 mt-0.5 shrink-0 flex items-center justify-center ${agentMode === "omni" ? "border-primary" : "border-white/30"}`}>
                      {agentMode === "omni" && <div className="w-2 h-2 rounded-full bg-primary" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-white/90 text-sm">Omni</span>
                        <Sparkles className="w-3.5 h-3.5 text-primary" />
                      </div>
                      <p className="text-[11px] text-white/50 mt-0.5">Full OMNIMENS experience. All tools active.</p>
                      {agentMode === "omni" && (
                        <div className="mt-3 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] text-white/60">NEUROSYNC™ emotion engine</span>
                            <div className="w-8 h-4 rounded-full bg-primary relative cursor-pointer">
                              <div className="w-3 h-3 rounded-full bg-white absolute right-0.5 top-0.5" />
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] text-white/60">COGNISYNC™ deep reasoning</span>
                            <div className="w-8 h-4 rounded-full bg-primary relative cursor-pointer">
                              <div className="w-3 h-3 rounded-full bg-white absolute right-0.5 top-0.5" />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  {/* APEX mode */}
                  <div
                    onClick={() => { setAgentMode("apex"); setSelectedModel("gpt-4o"); setDeepResearchMode(true); }}
                    className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${agentMode === "apex" ? "border-emerald-500/40 bg-emerald-500/5" : "border-white/8 hover:border-white/15"}`}
                  >
                    <div className={`w-4 h-4 rounded-full border-2 mt-0.5 shrink-0 flex items-center justify-center ${agentMode === "apex" ? "border-emerald-400" : "border-white/30"}`}>
                      {agentMode === "apex" && <div className="w-2 h-2 rounded-full bg-emerald-400" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-white/90 text-sm">Apex</span>
                        <Infinity className="w-3.5 h-3.5 text-emerald-400" />
                      </div>
                      <p className="text-[11px] text-white/50 mt-0.5">Maximum intelligence. Deep research always on. No limits.</p>
                    </div>
                  </div>
                </div>
                <div className="px-5 py-3 border-t border-white/8">
                  <button onClick={() => setShowAgentModes(false)} className="w-full py-2.5 rounded-xl bg-primary text-black font-mono text-sm font-bold tracking-wider hover:bg-primary/90 transition-all">
                    CONFIRM
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Tasks Panel ── */}
        <AnimatePresence>
          {showTasksPanel && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] flex items-end justify-center bg-black/50 backdrop-blur-sm"
              onClick={e => { if (e.target === e.currentTarget) setShowTasksPanel(false); }}
            >
              <motion.div
                initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 28, stiffness: 300 }}
                className="bg-[#0d0d0d] border border-white/12 rounded-t-2xl w-full max-w-lg shadow-2xl overflow-hidden"
              >
                <div className="w-10 h-1 bg-white/20 rounded-full mx-auto mt-3 mb-4" />
                <div className="flex items-center justify-between px-5 pb-3 border-b border-white/8">
                  <div className="flex items-center gap-2">
                    <ListChecks className="w-4 h-4 text-primary" />
                    <span className="font-mono text-sm font-bold text-white/90">Tasks</span>
                  </div>
                  <button onClick={() => setShowTasksPanel(false)} className="text-white/40 hover:text-white transition-colors p-1">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="p-5 space-y-4 max-h-[60vh] overflow-y-auto omnimens-scrollbar">
                  {/* Task list */}
                  {tasks.length === 0 ? (
                    <div className="text-center py-6">
                      <ListChecks className="w-10 h-10 text-white/10 mx-auto mb-3" />
                      <p className="text-sm font-mono text-white/50">No background tasks yet</p>
                      <p className="text-[11px] font-mono text-white/25 mt-1">Describe a task below and OMNIMENS will plan and execute it</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {tasks.map(task => (
                        <div key={task.id} className={`flex items-center gap-3 p-3 rounded-xl border ${task.status === "done" ? "border-green-500/20 bg-green-500/5" : task.status === "running" ? "border-primary/20 bg-primary/5" : "border-white/8 bg-white/2"}`}>
                          {task.status === "done" && <Check className="w-4 h-4 text-green-400 shrink-0" />}
                          {task.status === "running" && <Loader2 className="w-4 h-4 text-primary animate-spin shrink-0" />}
                          {task.status === "pending" && <Clock className="w-4 h-4 text-white/30 shrink-0" />}
                          <span className="text-[12px] font-mono text-white/80 flex-1">{task.title}</span>
                          <button onClick={() => setTasks(ts => ts.filter(t => t.id !== task.id))} className="text-white/20 hover:text-red-400 transition-colors shrink-0">
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  {/* New task input */}
                  <div className="flex gap-2">
                    <input
                      value={newTaskInput}
                      onChange={e => setNewTaskInput(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === "Enter" && newTaskInput.trim()) {
                          const id = crypto.randomUUID?.() || Date.now().toString();
                          setTasks(ts => [...ts, { id, title: newTaskInput.trim(), status: "pending" }]);
                          setInputWithDraft(`Plan this task for me: ${newTaskInput.trim()}`);
                          setNewTaskInput("");
                          setShowTasksPanel(false);
                        }
                      }}
                      placeholder="Describe a task for OMNIMENS to plan..."
                      className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm font-mono text-white/80 placeholder:text-white/25 outline-none focus:border-primary/30"
                    />
                    <button
                      onClick={() => {
                        if (!newTaskInput.trim()) return;
                        const id = crypto.randomUUID?.() || Date.now().toString();
                        setTasks(ts => [...ts, { id, title: newTaskInput.trim(), status: "pending" }]);
                        setInputWithDraft(`Plan this task for me: ${newTaskInput.trim()}`);
                        setNewTaskInput("");
                        setShowTasksPanel(false);
                      }}
                      className="px-4 py-2.5 rounded-xl bg-primary text-black font-mono text-sm font-bold hover:bg-primary/90 transition-all shrink-0"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <a href={`${window.location.origin}/projects`} className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/8 text-white/50 hover:text-white hover:border-white/15 transition-all text-[11px] font-mono">
                    <Layers className="w-3.5 h-3.5" /> View all projects & saved work
                  </a>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Camera Modal ── */}
        <AnimatePresence>
          {showCamera && (
            <CameraModal
              onCapture={(file) => setPendingFiles(prev => [...prev, file].slice(0, 10))}
              onClose={() => setShowCamera(false)}
            />
          )}
        </AnimatePresence>

        {/* ── New App Modal ── */}
        {showNewAppModal && (
          <NewAppModal
            onClose={() => setShowNewAppModal(false)}
            onSelect={(prompt, type) => {
              setShowNewAppModal(false);
              const appName = type;
              setBuildPanel({
                appName,
                appType: `AI Agent Build · ${type}`,
                steps: createInitialBuildSteps(),
                files: [],
                previewHtml: null,
                status: "building",
                startedAt: Date.now(),
              });
              sendMessage(prompt, [], persona, hubSettings, selectedModel, responseMode, sessionStart);
            }}
          />
        )}

        {/* ── Control Hub Modal ── */}
        {showControlHub && (
          <ControlHub
            open={showControlHub}
            settings={hubSettings}
            onChange={(s) => {
              setHubSettings(s);
              saveHubSettingsToStorage(s);
              fetch("/api/omnimens/hub-settings", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(s),
              }).catch(() => {});
            }}
            onClose={() => setShowControlHub(false)}
            onUsePrompt={(content) => setInputWithDraft(content)}
            currentConversationId={currentConversationId ?? undefined}
          />
        )}

        <DeepResonanceModal
          open={deepResonanceOpen}
          onClose={() => setDeepResonanceOpen(false)}
          phase={resonancePhase}
          question={resonanceQuestion}
          setQuestion={setResonanceQuestion}
          inquiryQs={resonanceInquiryQs}
          answers={resonanceAnswers}
          setAnswers={setResonanceAnswers}
          onStart={handleResonanceStart}
          onRunAnalysis={() => handleResonanceRun()}
          onReset={resetResonance}
          steps={resonanceSteps}
          result={resonanceResult}
          isLight={isLight}
        />

        {accountLocked && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.9, y: 30 }} animate={{ scale: 1, y: 0 }}
              className="bg-[#0a0a12] border border-red-500/50 p-8 rounded-2xl max-w-lg w-full shadow-[0_0_80px_rgba(239,68,68,0.15)] text-center relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-red-500 via-red-400 to-red-500 animate-pulse" />
              <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center mx-auto mb-5">
                <Lock className="w-8 h-8 text-red-400" />
              </div>
              <h2 className="text-2xl font-display font-bold text-white tracking-[0.25em] mb-2 uppercase">Account Locked</h2>
              <p className="text-red-300/80 font-mono text-xs tracking-wider mb-2">OUTSTANDING BALANCE DETECTED</p>
              <p className="text-white/50 font-mono text-sm mb-2">
                {(status as any)?.lockReason || "Your account has a negative credit balance."}
              </p>
              <p className="text-white/70 font-mono text-sm mb-8">
                All platform features are suspended until your balance is settled.
                {(status as any)?.outstandingBalanceCents > 0 && (
                  <span className="block mt-2 text-red-400 font-bold text-base">
                    Amount owed: ${((status as any).outstandingBalanceCents / 100).toFixed(2)}
                  </span>
                )}
              </p>
              <div className="flex flex-col gap-3">
                <Button onClick={() => setLocation("/account")} size="lg" className="w-full bg-red-600 hover:bg-red-500 text-white border-none">
                  <ArrowRight className="w-4 h-4 mr-2" />
                  GO TO ACCOUNT — SETTLE BALANCE
                </Button>
                <p className="text-white/30 font-mono text-[10px]">
                  Add or update your payment method to automatically settle the balance.
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
        {showLimitModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }}
              className="bg-black border border-primary/40 p-8 rounded-2xl max-w-md w-full shadow-[0_0_50px_rgba(130,80,220,0.2)] text-center relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent" />
              <ShieldAlert className="w-12 h-12 text-primary mx-auto mb-4" />
              <h2 className="text-2xl font-display font-bold text-white tracking-widest mb-2 uppercase">Limits Reached</h2>
              <p className="text-white/60 font-mono text-sm mb-8">
                The mortal coil cannot sustain further connection today. Transcend your limits to unlock eternal access.
              </p>
              <div className="flex flex-col gap-3">
                <Button onClick={() => setLocation("/pricing")} size="lg" className="w-full">ASCEND NOW — from $9/mo</Button>
                <Button onClick={() => setShowLimitModal(false)} variant="ghost" className="w-full text-white/85">Return to Silence</Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile IDE — appears only on small screens, hidden when build panel is open */}
      {mobileIdeOpen && <MobileIDE onClose={() => { setMobileIdeOpen(false); setMobileNav("create"); }} />}
    </Layout>
    </ActiveProjectCtx.Provider>
  );
}
