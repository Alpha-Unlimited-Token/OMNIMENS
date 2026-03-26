/**
 * OMNIMENS — Proprietary AI Platform
 * Copyright © 2024–2026 Alpha Unlimited Technologies, LLC. All Rights Reserved.
 * Unauthorized reproduction, distribution, or use is strictly prohibited.
 */

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2, Loader2, Circle, AlertCircle,
  Globe, Code2, Smartphone, Database, Zap, Brain, BarChart2,
  Play, Eye, Download, Share2, ExternalLink, X,
  File, Folder, FolderOpen, ChevronRight, ChevronDown, ChevronLeft,
  Terminal, Sparkles, Cpu, LayoutGrid, Monitor,
  Gamepad2, Bot, Package, Server, Layers, RefreshCw, Copy, Check,
  Plus, Rocket, Wand2, FileCode, FileJson, FileText, Layout,
  MessageSquare, Infinity, Settings, PanelLeft, Maximize2, Minimize2,
  ShoppingCart, Mic, BookOpen, Presentation, BarChart3,
  Shield, ClipboardList, PenLine, Image, Workflow,
} from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────
// Mobile detection hook
// ─────────────────────────────────────────────────────────────────────────────
function useIsMobile() {
  const [mobile, setMobile] = useState(() => typeof window !== "undefined" && window.innerWidth < 1024);
  useEffect(() => {
    const handler = () => setMobile(window.innerWidth < 1024);
    window.addEventListener("resize", handler, { passive: true });
    return () => window.removeEventListener("resize", handler);
  }, []);
  return mobile;
}

const V = "#a855f7";
const VD = "rgba(168,85,247,0.10)";
const VB = "rgba(168,85,247,0.25)";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface BuildStep {
  id: string;
  label: string;
  detail?: string;
  status: "pending" | "running" | "done" | "error";
  durationMs?: number;
}

export interface ExtractedFile {
  name: string;
  language: string;
  content: string;
}

export interface BuildPanelState {
  appName: string;
  appType: string;
  steps: BuildStep[];
  files: ExtractedFile[];
  previewHtml: string | null;
  status: "building" | "done" | "error";
  startedAt: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

const BUILD_STEPS_TEMPLATE: Omit<BuildStep, "status" | "durationMs">[] = [
  { id: "vision",      label: "Analyzing your vision",        detail: "Understanding requirements" },
  { id: "architect",   label: "Designing architecture",       detail: "Planning component structure" },
  { id: "scaffold",    label: "Scaffolding project",          detail: "Creating folder structure" },
  { id: "components",  label: "Writing core components",      detail: "Building UI & logic" },
  { id: "styles",      label: "Applying styles & animations", detail: "Crafting the look & feel" },
  { id: "deps",        label: "Configuring dependencies",     detail: "Installing packages" },
  { id: "preview",     label: "Generating live preview",      detail: "Compiling & running" },
];

// Step timing in ms (cumulative from start)
const STEP_TIMINGS = [0, 900, 2000, 3200, 4800, 6200, 7800, 9500];

export function createInitialBuildSteps(): BuildStep[] {
  return BUILD_STEPS_TEMPLATE.map((s, i) => ({
    ...s,
    status: i === 0 ? "running" : "pending",
  }));
}

export function isBuildIntent(text: string): boolean {
  if (/\b(video|movie|clip|film|animation|image|picture|photo|song|music|audio|sound|voice\s*over)\b/i.test(text)) return false;
  return /\b(build|create|make|develop|write|generate|code|scaffold)\b.{0,60}\b(app|application|website|web app|page|component|dashboard|api|server|game|bot|tool|ui|interface|extension|mobile|site|landing|portfolio|chat|store|shop|blog|voice|slides|presentation|quiz|form|admin|panel|e-?commerce|cart|checkout|diagram|chart|agent|automation|workflow|saas|platform|directory|gallery|timer|calculator|converter|tracker|planner|editor|studio)\b/i.test(text)
    || /\b(build|create|make)\b.{0,10}\b(me|us|a|an|the)\b.{0,30}\b(app|application|website|web app|page|component|dashboard|api|server|game|bot|tool|ui|interface|extension|mobile|site|landing|portfolio|chat|store|shop|blog|slides|presentation|quiz|form|admin|panel|e-?commerce|cart|checkout|diagram|chart|agent|automation|workflow|saas|platform|directory|gallery|timer|calculator|converter|tracker|planner|editor|studio)\b/i.test(text);
}

export function extractFilesFromMarkdown(content: string): ExtractedFile[] {
  const files: ExtractedFile[] = [];
  const regex = /```(\w+)?(?:\s*\/\/\s*([^\n]+)\n|\s*#\s*([^\n]+)\n|\n)?([\s\S]*?)```/g;
  let match;
  const seen = new Set<string>();
  while ((match = regex.exec(content)) !== null) {
    const lang = (match[1] || "text").toLowerCase();
    const comment1 = match[2]?.trim();
    const comment2 = match[3]?.trim();
    const code = match[4]?.trim() || "";
    if (!code || code.length < 10) continue;
    let name = comment1 || comment2 || "";
    if (!name || !name.includes(".")) {
      const ext: Record<string, string> = {
        html: "index.html", css: "styles.css", javascript: "app.js", js: "app.js",
        typescript: "index.ts", ts: "index.ts", tsx: "App.tsx", jsx: "App.jsx",
        python: "main.py", py: "main.py", json: "package.json", bash: "setup.sh",
        sh: "setup.sh", sql: "schema.sql", yaml: "config.yaml", yml: "config.yaml",
        markdown: "README.md", md: "README.md", rust: "main.rs", go: "main.go",
      };
      name = ext[lang] || `file.${lang}`;
      let suffix = 0;
      while (seen.has(name)) {
        suffix++;
        const parts = name.split(".");
        name = `${parts[0]}-${suffix}.${parts.slice(1).join(".")}`;
      }
    }
    seen.add(name);
    files.push({ name, language: lang, content: code });
  }
  return files;
}

export function buildPreviewHtml(files: ExtractedFile[]): string | null {
  const html = files.find(f => f.name.endsWith(".html"));
  if (!html) return null;
  let doc = html.content;
  const css = files.find(f => f.name.endsWith(".css"));
  const js = files.find(f => f.name.endsWith(".js") || f.name.endsWith(".ts"));
  if (css && !doc.includes(css.content.slice(0, 20))) {
    doc = doc.replace("</head>", `<style>${css.content}</style></head>`);
  }
  if (js && !doc.includes(js.content.slice(0, 20))) {
    doc = doc.replace("</body>", `<script>${js.content}</script></body>`);
  }
  return doc;
}

function langIcon(lang: string) {
  if (lang === "html") return <FileCode className="w-3 h-3 text-orange-400" />;
  if (lang === "css") return <FileCode className="w-3 h-3 text-blue-400" />;
  if (["js", "javascript", "jsx"].includes(lang)) return <FileCode className="w-3 h-3 text-yellow-400" />;
  if (["ts", "typescript", "tsx"].includes(lang)) return <FileCode className="w-3 h-3 text-blue-500" />;
  if (["py", "python"].includes(lang)) return <FileCode className="w-3 h-3 text-green-400" />;
  if (lang === "json") return <FileJson className="w-3 h-3 text-amber-400" />;
  if (lang === "sql") return <Database className="w-3 h-3 text-cyan-400" />;
  return <File className="w-3 h-3 text-white/40" />;
}

// ─────────────────────────────────────────────────────────────────────────────
// Step indicator
// ─────────────────────────────────────────────────────────────────────────────

function StepRow({ step, index }: { step: BuildStep; index: number }) {
  const isActive = step.status === "running";
  const isDone = step.status === "done";
  const isErr = step.status === "error";

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: step.status === "pending" ? 0.35 : 1, x: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      className="flex items-center gap-2.5 py-1.5"
    >
      <div className="shrink-0 w-4 h-4 flex items-center justify-center">
        {isDone && <CheckCircle2 className="w-4 h-4 text-green-400" />}
        {isActive && <Loader2 className="w-4 h-4 animate-spin" style={{ color: V }} />}
        {isErr && <AlertCircle className="w-4 h-4 text-red-400" />}
        {step.status === "pending" && <Circle className="w-3.5 h-3.5 text-white/20" />}
      </div>
      <div className="flex-1 min-w-0">
        <span className={`font-mono text-[11px] ${isActive ? "font-bold" : ""}`}
          style={{ color: isDone ? "rgba(255,255,255,0.7)" : isActive ? "#fff" : "rgba(255,255,255,0.3)" }}>
          {step.label}
        </span>
        {isActive && step.detail && (
          <span className="font-mono text-[9px] text-white/30 ml-1.5">{step.detail}</span>
        )}
      </div>
      {isDone && step.durationMs && (
        <span className="font-mono text-[9px] text-green-400/50 shrink-0">{(step.durationMs / 1000).toFixed(1)}s</span>
      )}
      {isActive && (
        <motion.span
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ repeat: 1e9, duration: 1.2 }}
          className="font-mono text-[9px] shrink-0"
          style={{ color: V }}>
          working...
        </motion.span>
      )}
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// File tree
// ─────────────────────────────────────────────────────────────────────────────

function FileTreeView({ files, onSelect, selected }: {
  files: ExtractedFile[];
  onSelect: (f: ExtractedFile) => void;
  selected: ExtractedFile | null;
}) {
  return (
    <div className="space-y-0.5">
      <div className="flex items-center gap-1.5 py-1">
        <FolderOpen className="w-3 h-3 text-yellow-400/70 shrink-0" />
        <span className="font-mono text-[10px] text-yellow-400/70">project/</span>
      </div>
      {files.map((f, i) => (
        <motion.button
          key={i}
          initial={{ opacity: 0, x: -6 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.08 }}
          onClick={() => onSelect(f)}
          className="w-full flex items-center gap-1.5 pl-4 py-1 rounded-md transition-all"
          style={{
            background: selected?.name === f.name ? VD : "transparent",
            borderLeft: selected?.name === f.name ? `1px solid ${V}` : "1px solid transparent",
          }}>
          {langIcon(f.language)}
          <span className="font-mono text-[10px] text-white/65 truncate">{f.name}</span>
          <span className="ml-auto font-mono text-[8px] text-white/20 shrink-0">{f.content.split("\n").length}L</span>
        </motion.button>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Preview iframe with browser chrome
// ─────────────────────────────────────────────────────────────────────────────

function PreviewFrame({ html }: { html: string }) {
  const blobUrl = useRef<string>("");
  const [url, setUrl] = useState("");
  const [maximized, setMaximized] = useState(false);

  useEffect(() => {
    const blob = new Blob([html], { type: "text/html" });
    const u = URL.createObjectURL(blob);
    blobUrl.current = u;
    setUrl(u);
    return () => URL.revokeObjectURL(u);
  }, [html]);

  return (
    <div className={`flex flex-col rounded-xl overflow-hidden border ${maximized ? "fixed inset-4 z-50 shadow-2xl" : ""}`}
      style={{ borderColor: VB, background: "#111" }}>
      {/* Browser chrome */}
      <div className="flex items-center gap-2 px-3 py-2 border-b shrink-0" style={{ borderColor: "rgba(255,255,255,0.08)", background: "#1a1a2e" }}>
        <div className="flex gap-1 shrink-0">
          <div className="w-2.5 h-2.5 rounded-full bg-red-400/70" />
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-400/70" />
          <div className="w-2.5 h-2.5 rounded-full bg-green-400/70" />
        </div>
        <div className="flex-1 flex items-center gap-2 px-2 py-1 rounded-md mx-2"
          style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }}>
          <Globe className="w-2.5 h-2.5 shrink-0" style={{ color: V }} />
          <span className="font-mono text-[9px] text-white/40 truncate">omnimens-preview://local</span>
        </div>
        <button onClick={() => setMaximized(m => !m)} className="shrink-0 text-white/30 hover:text-white/70 transition-colors">
          {maximized ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
        </button>
      </div>
      {/* iframe */}
      {url && (
        <iframe
          src={url}
          sandbox="allow-scripts allow-same-origin allow-forms"
          className="w-full bg-white"
          style={{ height: maximized ? "calc(100% - 36px)" : "300px", border: "none" }}
          title="OMNIMENS Preview"
        />
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Agent Build Panel — the core "Replit Agent" experience
// ─────────────────────────────────────────────────────────────────────────────

export function AgentBuildPanel({
  state,
  onClose,
  onDeploy,
  mobileOpen,
  onMobileClose,
  onMobileOpen,
}: {
  state: BuildPanelState;
  onClose?: () => void;
  onDeploy?: () => void;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
  onMobileOpen?: () => void;
}) {
  const isMobile = useIsMobile();
  const [selectedFile, setSelectedFile] = useState<ExtractedFile | null>(null);
  const [activeTab, setActiveTab] = useState<"steps" | "files" | "preview" | "publish">("steps");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (state.files.length > 0 && !selectedFile) setSelectedFile(state.files[0]);
  }, [state.files]);

  useEffect(() => {
    if (state.status === "done" && state.files.length > 0) setActiveTab("files");
    if (state.status === "done" && state.previewHtml) setActiveTab("preview");
  }, [state.status]);

  const copyFile = useCallback(() => {
    if (!selectedFile) return;
    navigator.clipboard.writeText(selectedFile.content).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [selectedFile]);

  const downloadFiles = useCallback(() => {
    state.files.forEach(f => {
      const blob = new Blob([f.content], { type: "text/plain" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = f.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(a.href);
    });
  }, [state.files]);

  const doneCount = state.steps.filter(s => s.status === "done").length;
  const totalCount = state.steps.length;
  const progress = (doneCount / totalCount) * 100;

  const TABS = [
    { id: "steps"   as const, Icon: Layers,   label: "Steps",   badge: `${doneCount}/${totalCount}` },
    { id: "files"   as const, Icon: Code2,    label: "Files",   badge: state.files.length > 0 ? String(state.files.length) : null },
    { id: "preview" as const, Icon: Eye,      label: "Preview", badge: state.previewHtml ? "●" : null },
    { id: "publish" as const, Icon: Rocket,   label: "Publish", badge: state.status === "done" ? "✓" : null },
  ];

  // ── Shared tab content ──────────────────────────────────────────────────
  const renderTabContent = () => (
    <>
      {/* STEPS */}
      {activeTab === "steps" && (
        <div className="space-y-0">
          {state.steps.map((step, i) => <StepRow key={step.id} step={step} index={i} />)}
        </div>
      )}

      {/* FILES */}
      {activeTab === "files" && (
        <div>
          {state.files.length === 0 ? (
            <div className="text-center py-8 font-mono text-[10px] text-white/25">
              {state.status === "building" ? "Files will appear here as they are created..." : "No files extracted."}
            </div>
          ) : isMobile ? (
            /* Mobile: stacked layout */
            <div className="space-y-3">
              <FileTreeView files={state.files} onSelect={setSelectedFile} selected={selectedFile} />
              {selectedFile && (
                <div className="rounded-xl overflow-hidden border" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
                  <div className="flex items-center justify-between px-3 py-2 border-b"
                    style={{ borderColor: "rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.02)" }}>
                    <div className="flex items-center gap-1.5">
                      {langIcon(selectedFile.language)}
                      <span className="font-mono text-[10px] text-white/60">{selectedFile.name}</span>
                    </div>
                    <button onClick={copyFile} className="text-white/30 hover:text-white/70 transition-colors">
                      {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <pre className="overflow-auto p-3 font-mono text-[9px] leading-relaxed text-white/60"
                    style={{ maxHeight: "360px", scrollbarWidth: "thin", background: "rgba(0,0,0,0.3)" }}>
                    {selectedFile.content}
                  </pre>
                </div>
              )}
            </div>
          ) : (
            /* Desktop: side-by-side layout */
            <div className="flex gap-3">
              <div className="w-36 shrink-0">
                <FileTreeView files={state.files} onSelect={setSelectedFile} selected={selectedFile} />
              </div>
              <div className="flex-1 min-w-0 rounded-xl overflow-hidden border" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
                {selectedFile ? (
                  <>
                    <div className="flex items-center justify-between px-3 py-2 border-b"
                      style={{ borderColor: "rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.02)" }}>
                      <div className="flex items-center gap-1.5">
                        {langIcon(selectedFile.language)}
                        <span className="font-mono text-[10px] text-white/60">{selectedFile.name}</span>
                      </div>
                      <button onClick={copyFile} className="text-white/30 hover:text-white/70 transition-colors">
                        {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                    <pre className="overflow-auto p-3 font-mono text-[9px] leading-relaxed text-white/60"
                      style={{ maxHeight: "200px", scrollbarWidth: "thin", background: "rgba(0,0,0,0.3)" }}>
                      {selectedFile.content}
                    </pre>
                  </>
                ) : (
                  <div className="p-4 text-center font-mono text-[10px] text-white/25">Select a file</div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* PREVIEW */}
      {activeTab === "preview" && (
        <div>
          {state.previewHtml ? (
            <PreviewFrame html={state.previewHtml} />
          ) : (
            <div className="text-center py-8 space-y-2">
              <Monitor className="w-8 h-8 mx-auto text-white/15" />
              <p className="font-mono text-[10px] text-white/25">
                {state.status === "building" ? "Preview will render here when complete" : "No HTML preview available for this project type"}
              </p>
            </div>
          )}
        </div>
      )}

      {/* PUBLISH */}
      {activeTab === "publish" && (
        <div className="space-y-4">
          {/* Status card */}
          <div className="rounded-xl p-4 border" style={{ borderColor: VB, background: VD }}>
            <div className="flex items-center gap-2 mb-1">
              {state.status === "done"
                ? <CheckCircle2 className="w-4 h-4 text-green-400" />
                : <Loader2 className="w-4 h-4 animate-spin" style={{ color: V }} />}
              <span className="font-mono text-sm font-bold text-white">{state.appName}</span>
            </div>
            <p className="font-mono text-[10px] text-white/50">{state.appType} · {state.files.length} file{state.files.length !== 1 ? "s" : ""}</p>
          </div>

          {/* Download */}
          <button
            onClick={downloadFiles}
            disabled={state.files.length === 0}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border font-mono text-sm font-bold transition-all hover:bg-white/5 disabled:opacity-30"
            style={{ borderColor: VB, color: V }}>
            <Download className="w-4 h-4" /> Download All Files
          </button>

          {/* Deploy */}
          <button
            onClick={onDeploy}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-mono text-sm font-bold transition-all"
            style={{ background: V, color: "#fff" }}>
            <Rocket className="w-4 h-4" /> Deploy to Web
          </button>

          {/* Continue building (mobile only) */}
          {isMobile && (
            <button
              onClick={onMobileClose}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border font-mono text-sm transition-all hover:border-white/30 hover:text-white"
              style={{ borderColor: "rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.50)" }}>
              <MessageSquare className="w-4 h-4" /> Continue Building with AI
            </button>
          )}

          <p className="font-mono text-[9px] text-white/25 text-center leading-relaxed px-2">
            Your code is ready to use. Download the files and open in any editor, or deploy directly to the web.
          </p>
        </div>
      )}
    </>
  );

  // ── MOBILE: compact card + full-screen overlay ──────────────────────────
  if (isMobile) {
    return (
      <>
        {/* Compact inline summary card */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl overflow-hidden border my-3"
          style={{ borderColor: VB, background: "#0d0d1a" }}>
          <div className="flex items-center gap-3 px-4 py-3">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: VD, border: `1px solid ${VB}` }}>
              {state.status === "building"
                ? <Loader2 className="w-4 h-4 animate-spin" style={{ color: V }} />
                : state.status === "done"
                  ? <CheckCircle2 className="w-4 h-4 text-green-400" />
                  : <AlertCircle className="w-4 h-4 text-red-400" />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-mono text-[9px] tracking-widest font-bold uppercase" style={{ color: V }}>OMNIMENS AGENT</div>
              <p className="font-mono text-[11px] text-white/60 truncate mt-0.5">
                {state.appType} · <span className="text-white/85">{state.appName}</span>
              </p>
            </div>
            <button
              onClick={onMobileOpen}
              className="flex items-center gap-1 px-3 py-2 rounded-xl font-mono text-[10px] font-bold shrink-0 transition-all"
              style={{ background: VD, color: V, border: `1px solid ${VB}` }}>
              Open <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="h-0.5 w-full bg-white/5">
            <motion.div className="h-full" style={{ background: state.status === "done" ? "#4ade80" : V }}
              animate={{ width: `${progress}%` }} transition={{ duration: 0.4 }} />
          </div>
        </motion.div>

        {/* Full-screen overlay */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 32, stiffness: 300 }}
              className="fixed inset-0 z-50 flex flex-col"
              style={{ background: "#0d0d1a" }}>

              {/* Header */}
              <div className="flex items-center gap-3 px-3 py-3 border-b shrink-0"
                style={{ borderColor: "rgba(168,85,247,0.15)", background: "rgba(168,85,247,0.07)" }}>
                <button onClick={onMobileClose}
                  className="flex items-center gap-1 text-white/50 hover:text-white transition-colors p-1 shrink-0">
                  <ChevronLeft className="w-5 h-5" />
                  <span className="font-mono text-[10px]">Chat</span>
                </button>
                <div className="flex-1 min-w-0 text-center">
                  <div className="font-mono text-[10px] tracking-widest font-bold uppercase" style={{ color: V }}>OMNIMENS AGENT</div>
                  <p className="font-mono text-[9px] text-white/40 truncate">{state.appName}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {state.status === "building" ? (
                    <motion.span animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: 1e9, duration: 1.5 }}
                      className="font-mono text-[9px]" style={{ color: V }}>building...</motion.span>
                  ) : (
                    <span className="font-mono text-[9px] text-green-400">✓ done</span>
                  )}
                  {onClose && (
                    <button onClick={() => { onClose(); }}
                      className="text-white/25 hover:text-white/60 transition-colors p-1">
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Progress bar */}
              <div className="h-0.5 w-full bg-white/5 shrink-0">
                <motion.div className="h-full" style={{ background: state.status === "done" ? "#4ade80" : V }}
                  animate={{ width: `${progress}%` }} transition={{ duration: 0.4 }} />
              </div>

              {/* Scrollable content */}
              <div className="flex-1 overflow-y-auto p-4" style={{ scrollbarWidth: "none" }}>
                {renderTabContent()}
              </div>

              {/* Bottom tab bar */}
              <div className="shrink-0 border-t" style={{ borderColor: "rgba(168,85,247,0.12)", background: "#0a0a14" }}>
                <div className="flex" style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
                  {TABS.map(({ id, Icon, label, badge }) => (
                    <button key={id} onClick={() => setActiveTab(id)}
                      className="flex-1 flex flex-col items-center gap-1 py-3 transition-all relative">
                      <div className="relative">
                        <Icon style={{ width: 18, height: 18, color: activeTab === id ? V : "rgba(255,255,255,0.28)" }} />
                        {badge && (
                          <span className="absolute -top-1.5 -right-2.5 font-mono text-[7px] px-1 rounded-full leading-4"
                            style={{ background: activeTab === id ? V : "rgba(255,255,255,0.10)", color: activeTab === id ? "#fff" : "rgba(255,255,255,0.40)" }}>
                            {badge}
                          </span>
                        )}
                      </div>
                      <span className="font-mono text-[9px]" style={{ color: activeTab === id ? V : "rgba(255,255,255,0.28)" }}>
                        {label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </>
    );
  }

  // ── DESKTOP: inline card ────────────────────────────────────────────────
  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.35 }}
      className="rounded-2xl overflow-hidden border my-3"
      style={{ borderColor: VB, background: "#0d0d1a" }}>

      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b"
        style={{ borderColor: "rgba(168,85,247,0.15)", background: "rgba(168,85,247,0.07)" }}>
        <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: VD, border: `1px solid ${VB}` }}>
          {state.status === "building"
            ? <Loader2 className="w-4 h-4 animate-spin" style={{ color: V }} />
            : state.status === "done"
              ? <CheckCircle2 className="w-4 h-4 text-green-400" />
              : <AlertCircle className="w-4 h-4 text-red-400" />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] tracking-widest font-bold uppercase" style={{ color: V }}>OMNIMENS AGENT</span>
            {state.status === "building" && (
              <motion.span animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: 1e9, duration: 1.5 }}
                className="font-mono text-[9px] text-white/35">building...</motion.span>
            )}
            {state.status === "done" && <span className="font-mono text-[9px] text-green-400">✓ complete</span>}
          </div>
          <p className="font-mono text-[11px] text-white/55 truncate mt-0.5">
            {state.appType} · <span className="text-white/80">{state.appName}</span>
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {onClose && (
            <button onClick={onClose} className="text-white/25 hover:text-white/60 transition-colors">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-0.5 w-full bg-white/5">
        <motion.div className="h-full" style={{ background: state.status === "done" ? "#4ade80" : V }}
          animate={{ width: `${progress}%` }} transition={{ duration: 0.4 }} />
      </div>

      {/* Tab bar */}
      <div className="flex border-b" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
        {TABS.map(({ id, label, badge }) => (
          <button key={id} onClick={() => setActiveTab(id)}
            className="flex items-center gap-1.5 px-4 py-2.5 font-mono text-[10px] uppercase tracking-wide border-b-2 transition-all"
            style={{ color: activeTab === id ? V : "rgba(255,255,255,0.3)", borderColor: activeTab === id ? V : "transparent", background: "transparent" }}>
            {label}
            {badge && (
              <span className="font-mono text-[8px] px-1.5 py-0.5 rounded"
                style={{ background: activeTab === id ? VD : "rgba(255,255,255,0.04)", color: activeTab === id ? V : "rgba(255,255,255,0.25)" }}>
                {badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="p-4">
        {renderTabContent()}
      </div>

      {/* Desktop action bar */}
      {state.status === "done" && (
        <div className="flex items-center gap-2 px-4 py-3 border-t flex-wrap"
          style={{ borderColor: "rgba(255,255,255,0.06)" }}>
          {onDeploy && (
            <button onClick={onDeploy}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-mono text-[10px] font-bold transition-all"
              style={{ background: VD, color: V, border: `1px solid ${VB}` }}>
              <Rocket className="w-3 h-3" /> Deploy
            </button>
          )}
          {state.previewHtml && (
            <button onClick={() => setActiveTab("preview")}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-mono text-[10px] transition-all border border-white/10 text-white/50 hover:text-white hover:border-white/20">
              <Eye className="w-3 h-3" /> Preview
            </button>
          )}
          {state.files.length > 0 && (
            <button onClick={downloadFiles}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-mono text-[10px] transition-all border border-white/10 text-white/50 hover:text-white hover:border-white/20">
              <Download className="w-3 h-3" /> Download
            </button>
          )}
          <span className="ml-auto font-mono text-[9px] text-white/20">
            {state.files.length} file{state.files.length !== 1 ? "s" : ""}
            {state.previewHtml ? " · preview ready" : ""}
          </span>
        </div>
      )}
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// New App Modal — Template Picker
// ─────────────────────────────────────────────────────────────────────────────

const APP_TEMPLATES = [
  // Web & Sites
  {
    id: "website",
    label: "Website",
    desc: "Responsive site with hero, features & contact",
    icon: Globe,
    color: "#60a5fa",
    prompt: "Build me a stunning, fully responsive website with a hero section, features grid, pricing cards, and a contact form. Use modern CSS animations and glassmorphism effects. Make it dark themed and ultra-modern.",
  },
  {
    id: "landing",
    label: "Landing Page",
    desc: "High-converting SaaS marketing page",
    icon: Layout,
    color: "#a78bfa",
    prompt: "Create a high-converting SaaS landing page with a bold hero, social proof, feature highlights, pricing table, FAQ section, and CTA. Use gradient text and scroll animations.",
  },
  {
    id: "blog",
    label: "Blog / CMS",
    desc: "Article-based site with categories & search",
    icon: PenLine,
    color: "#f9a8d4",
    prompt: "Build a beautiful blog/CMS website with a featured articles hero, category filtering, article cards with cover images, pagination, a full article reader with markdown support, and a newsletter signup. Dark themed.",
  },
  {
    id: "portfolio",
    label: "Portfolio",
    desc: "Developer/designer portfolio showcase",
    icon: FileText,
    color: "#2dd4bf",
    prompt: "Build a stunning developer portfolio website with animated hero, skills section, project grid with hover effects, experience timeline, testimonials, and contact form. Dark, modern, impressive.",
  },
  // Apps & Dashboards
  {
    id: "react",
    label: "React App",
    desc: "React SPA with hooks, routing & state",
    icon: Layers,
    color: "#38bdf8",
    prompt: "Build a complete React application with multiple components, useState/useEffect hooks, routing, and a polished dark UI. Include TypeScript types and modern styling.",
  },
  {
    id: "dashboard",
    label: "Dashboard",
    desc: "Analytics dashboard with charts & tables",
    icon: BarChart2,
    color: "#34d399",
    prompt: "Build a data analytics dashboard with KPI cards, line charts, bar charts, a data table with sorting/filtering, sidebar navigation, and a dark theme with violet accents.",
  },
  {
    id: "admin",
    label: "Admin Panel",
    desc: "Full CRUD admin with users & settings",
    icon: Shield,
    color: "#f87171",
    prompt: "Build a complete admin panel with a sidebar, user management table (CRUD), settings page, role-based access indicators, stats overview cards, and a dark themed UI with clean typography.",
  },
  {
    id: "mobile",
    label: "Mobile App",
    desc: "Mobile UI with bottom tabs & navigation",
    icon: Smartphone,
    color: "#fb923c",
    prompt: "Create a polished mobile app UI with a bottom tab bar, stack screen navigation, card-based content, smooth transitions, and a modern mobile-first design. Include a home, profile, explore, and settings screen.",
  },
  // Commerce & SaaS
  {
    id: "ecommerce",
    label: "E-Commerce",
    desc: "Online store with cart & checkout",
    icon: ShoppingCart,
    color: "#4ade80",
    prompt: "Build a complete e-commerce storefront with a product grid, product detail page, cart sidebar, checkout form with validation, order confirmation, and a dark themed UI with smooth animations.",
  },
  {
    id: "saas",
    label: "SaaS Platform",
    desc: "Subscription app with auth & billing UI",
    icon: Rocket,
    color: "#818cf8",
    prompt: "Build a SaaS platform UI with a marketing landing page, authentication screens (login/signup), a feature-rich dashboard, subscription/pricing modal, user settings, and a sidebar navigation. Modern dark design.",
  },
  {
    id: "directory",
    label: "Directory / Marketplace",
    desc: "Searchable listings with filters & maps",
    icon: LayoutGrid,
    color: "#fb923c",
    prompt: "Build a directory/marketplace website with a hero search bar, filterable listing cards, a sidebar with category filters, individual listing detail pages, and an interactive map integration. Clean, modern UI.",
  },
  // Tools & Utilities
  {
    id: "api",
    label: "API Server",
    desc: "Node.js/Express REST API with auth",
    icon: Server,
    color: "#f87171",
    prompt: "Write a complete Node.js Express API server with JWT authentication middleware, CRUD endpoints, database connection, request validation, error handling, rate limiting, and full documentation comments.",
  },
  {
    id: "tool",
    label: "Tool / Utility",
    desc: "Productivity or developer tool",
    icon: Code2,
    color: "#a3e635",
    prompt: "Build a useful productivity tool with a clean single-page interface, intuitive controls, real-time output, keyboard shortcuts, copy-to-clipboard functionality, and a polished dark UI.",
  },
  {
    id: "form",
    label: "Form Builder",
    desc: "Multi-step form with validation",
    icon: ClipboardList,
    color: "#67e8f9",
    prompt: "Build a beautiful multi-step form builder with field validation, progress indicator, conditional logic, summary preview, and a success confirmation screen. Include text, select, radio, checkbox, and file upload fields.",
  },
  // AI & Bots
  {
    id: "chatbot",
    label: "AI Chatbot",
    desc: "Chat interface with AI integration",
    icon: Bot,
    color: "#c084fc",
    prompt: "Build a beautiful AI chatbot interface with a message history, typing indicator, markdown rendering, code block highlighting, voice input button, file attachment, and an input with send on Enter. Dark themed.",
  },
  {
    id: "agent",
    label: "AI Agent",
    desc: "Autonomous agent with tool use & memory",
    icon: Brain,
    color: "#a78bfa",
    prompt: "Build an autonomous AI agent interface with a goal input, step-by-step execution log, tool use visualization (web search, code run, file read), memory panel, and a results display. Futuristic dark UI.",
  },
  {
    id: "workflow",
    label: "Automation / Workflow",
    desc: "Visual workflow builder with triggers",
    icon: Workflow,
    color: "#f0abfc",
    prompt: "Build a visual automation workflow builder with a drag-and-drop node canvas, trigger nodes (webhook, schedule, event), action nodes (API call, email, transform), connection arrows, and a run history panel.",
  },
  // Media & Creative
  {
    id: "game",
    label: "Game",
    desc: "Browser game with canvas & physics",
    icon: Gamepad2,
    color: "#fbbf24",
    prompt: "Create an impressive browser game using HTML5 Canvas with a smooth game loop, collision detection, progressive difficulty, particle effects, scoring system, high score board, and responsive controls.",
  },
  {
    id: "presentation",
    label: "Presentation",
    desc: "Slide deck with animated transitions",
    icon: Presentation,
    color: "#f59e0b",
    prompt: "Build an interactive presentation/slide deck with 8+ slides, animated transitions between slides, progress bar, keyboard navigation (arrow keys), a title slide, content slides with bullet points, charts, and a closing CTA slide. Dark themed.",
  },
  {
    id: "quiz",
    label: "Quiz / Education",
    desc: "Interactive quiz with scoring & feedback",
    icon: BookOpen,
    color: "#34d399",
    prompt: "Build an interactive quiz application with multiple choice questions, a timer per question, instant feedback (correct/incorrect with explanation), a score tracker, progress bar, results summary, and a shareable score card.",
  },
  {
    id: "voice",
    label: "Voice App",
    desc: "Speech input/output & voice UI",
    icon: Mic,
    color: "#fb7185",
    prompt: "Build a voice-first web application with a large microphone button, real-time speech-to-text transcription display, text-to-speech playback for responses, voice waveform visualization, and a conversational UI. Dark futuristic design.",
  },
  {
    id: "image-gen",
    label: "Image Generator",
    desc: "AI image generation UI with gallery",
    icon: Image,
    color: "#c084fc",
    prompt: "Build an AI image generation UI with a prompt input, style selector (photorealistic, anime, abstract, etc.), aspect ratio picker, a generate button with loading state, a generated image display, and a gallery of recent generations. Dark themed.",
  },
  {
    id: "data-viz",
    label: "Data Visualization",
    desc: "Interactive charts, maps & infographics",
    icon: BarChart3,
    color: "#38bdf8",
    prompt: "Build an interactive data visualization dashboard with multiple chart types (line, bar, pie, scatter, area), a data table, date range filter, CSV import button, chart export option, and smooth animated transitions. Dark themed with vibrant chart colors.",
  },
  {
    id: "extension",
    label: "Browser Extension",
    desc: "Chrome/Firefox extension popup UI",
    icon: Package,
    color: "#fb923c",
    prompt: "Build a browser extension popup UI (300x500px) with a settings panel, toggle switches for features, a main action button, a mini dashboard with stats, and a clean compact design. Include the popup HTML, CSS, and JavaScript files.",
  },
];

export function NewAppModal({ onClose, onSelect }: {
  onClose: () => void;
  onSelect: (prompt: string, type: string) => void;
}) {
  const [customPrompt, setCustomPrompt] = useState("");
  const [search, setSearch] = useState("");

  const filtered = APP_TEMPLATES.filter(t =>
    t.label.toLowerCase().includes(search.toLowerCase()) ||
    t.desc.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
        style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(8px)" }}
        onClick={e => e.target === e.currentTarget && onClose()}>

        <motion.div
          initial={{ scale: 0.95, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.95, y: 20 }}
          className="w-full max-w-2xl rounded-2xl overflow-hidden border"
          data-theme="dark"
          style={{ borderColor: VB, background: "#0d0d1a", maxHeight: "90vh" }}>

          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: "rgba(168,85,247,0.15)" }}>
            <div className="flex items-center gap-2.5">
              <Wand2 className="w-5 h-5" style={{ color: V }} />
              <div>
                <h2 className="font-mono text-sm font-bold text-white">Build with OMNIMENS Agent</h2>
                <p className="font-mono text-[10px] text-white/35 mt-0.5">Choose a template or describe what you want to build</p>
              </div>
            </div>
            <button onClick={onClose} className="text-white/30 hover:text-white/70 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="overflow-y-auto p-5 space-y-4" style={{ maxHeight: "calc(90vh - 80px)" }}>
            {/* Custom prompt */}
            <div className="rounded-xl border p-3" style={{ borderColor: VB, background: VD }}>
              <p className="font-mono text-[9px] tracking-widest text-white/35 uppercase mb-2">Custom Prompt</p>
              <div className="flex gap-2">
                <input
                  value={customPrompt}
                  onChange={e => setCustomPrompt(e.target.value)}
                  placeholder='Describe your app... e.g. "Build a Spotify clone with dark theme"'
                  className="flex-1 bg-transparent font-mono text-xs text-white placeholder:text-white/20 outline-none"
                  onKeyDown={e => e.key === "Enter" && customPrompt.trim() && onSelect(customPrompt.trim(), "Custom App")}
                />
                <button
                  disabled={!customPrompt.trim()}
                  onClick={() => customPrompt.trim() && onSelect(customPrompt.trim(), "Custom App")}
                  className="shrink-0 px-3 py-1.5 rounded-lg font-mono text-[10px] font-bold transition-all disabled:opacity-30"
                  style={{ background: V, color: "#fff" }}>
                  Build <Zap className="w-3 h-3 inline-block ml-1" />
                </button>
              </div>
            </div>

            {/* Search */}
            <div className="relative">
              <MessageSquare className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-white/25" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Filter templates..."
                className="w-full bg-white/4 border border-white/8 rounded-xl pl-9 pr-3 py-2 font-mono text-[11px] text-white/70 placeholder:text-white/20 outline-none focus:border-violet-400/30"
              />
            </div>

            {/* Template grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
              {filtered.map(t => (
                <motion.button
                  key={t.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onSelect(t.prompt, t.label)}
                  className="flex flex-col items-start p-4 rounded-xl border text-left transition-all group"
                  style={{ borderColor: "rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.02)" }}>
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3"
                    style={{ background: `${t.color}18`, border: `1px solid ${t.color}30` }}>
                    <t.icon className="w-4.5 h-4.5" style={{ color: t.color, width: "18px", height: "18px" }} />
                  </div>
                  <p className="font-mono text-xs font-bold text-white/85 mb-1">{t.label}</p>
                  <p className="font-mono text-[9px] text-white/35 leading-relaxed">{t.desc}</p>
                </motion.button>
              ))}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Build Step Animator — drives the timed step progression
// ─────────────────────────────────────────────────────────────────────────────

export function useBuildStepAnimator(
  state: BuildPanelState | null,
  onUpdate: (updater: (s: BuildPanelState) => BuildPanelState) => void,
) {
  const timerRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    if (!state || state.status !== "building") return;
    timerRef.current.forEach(clearTimeout);
    timerRef.current = [];

    STEP_TIMINGS.forEach((delay, i) => {
      if (i === STEP_TIMINGS.length - 1) return; // last step triggered when AI done
      const t = setTimeout(() => {
        const stepStart = Date.now();
        onUpdate(prev => {
          if (!prev || prev.status !== "building") return prev;
          const steps = prev.steps.map((s, idx) => {
            if (idx < i) return { ...s, status: "done" as const, durationMs: s.durationMs ?? (delay - (STEP_TIMINGS[idx] ?? 0)) };
            if (idx === i) return { ...s, status: "running" as const };
            return s;
          });
          return { ...prev, steps };
        });
      }, delay);
      timerRef.current.push(t);
    });

    return () => timerRef.current.forEach(clearTimeout);
  }, [state?.startedAt]); // only re-run when a new build starts
}

// ─────────────────────────────────────────────────────────────────────────────
// Build Trigger Button — compact "Build App" button for chat input area
// ─────────────────────────────────────────────────────────────────────────────

export function BuildTriggerButton({ onClick }: { onClick: () => void }) {
  return (
    <motion.button
      type="button"
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.96 }}
      onClick={onClick}
      className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 rounded-xl font-mono text-[10px] font-bold transition-all"
      style={{ background: VD, color: V, border: `1px solid ${VB}` }}>
      <Wand2 className="w-3.5 h-3.5 sm:w-3 sm:h-3" />
      <span className="hidden sm:inline">New App</span>
    </motion.button>
  );
}
