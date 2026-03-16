import { useEffect, useRef, useState } from "react";
import { Layout } from "@/components/layout";
import { useAuth } from "@workspace/replit-auth-web";
import { useLocation } from "wouter";
import { useGetOmnimensStatus } from "@workspace/api-client-react";
import { useOmnimensChat, type GeneratedImage, type Artifact, type CostBreakdown, type TaskPlan } from "@/hooks/use-omnimens-chat";
import { useOmnimensVoice } from "@/hooks/use-omnimens-voice";
import { VoiceIndicator } from "@/components/voice-indicator";
import { OmnimensPresence } from "@/components/omnimens-presence";
import { PendingFileList, AttachedFileList } from "@/components/file-attachments";
import { Button } from "@/components/ui/button";
import {
  Send, StopCircle, ShieldAlert, Volume2, VolumeX, Paperclip, Download,
  Loader2, Expand, FileCode, Box, Film, Music, BarChart3, Shapes, Globe,
  Zap, Terminal, Play, Microscope, ChevronDown, Check, BookOpen, Brain,
  Cpu, PenLine, BarChart2, Palette, GraduationCap, Briefcase, Image,
  FolderOpen, Activity, SlidersHorizontal, PanelLeftClose, PanelRightClose,
  PanelLeft, PanelRight, X, Layers
} from "lucide-react";
import { OmnimensIcon } from "@/components/omnimens-icon";
import { WebsitePreview, parseMessageSegments } from "@/components/website-preview";
import { OmnimensNotificationBell } from "@/components/omnimens-notifications";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { motion, AnimatePresence } from "framer-motion";

// ── Small reusable badges ──────────────────────────────────────────────────────

function WebSearchBadge({ query, done, resultCount }: { query: string; done: boolean; resultCount?: number }) {
  return (
    <div className="flex items-center gap-2 mt-2 px-3 py-2 rounded-lg bg-accent/8 border border-accent/15 font-mono text-xs text-accent/70 w-fit">
      <Globe className={`w-3 h-3 shrink-0 ${done ? "text-accent/50" : "text-accent animate-pulse"}`} />
      {done
        ? <span className="text-accent/50">Searched: <span className="text-accent/70">{query}</span>{resultCount ? ` · ${resultCount} results` : ""}</span>
        : <span>Scanning internet: <span className="text-white/60 italic">{query}</span></span>
      }
    </div>
  );
}

function ImageGeneratingBadge() {
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, []);
  const pct = Math.min(95, (elapsed / 45) * 100);
  return (
    <div className="mt-4 border border-primary/20 rounded-xl px-4 py-3 bg-primary/5 font-mono text-xs space-y-2">
      <div className="flex items-center gap-3 text-white/70">
        <Loader2 className="w-4 h-4 animate-spin text-primary shrink-0" />
        <span className="tracking-widest">MANIFESTING IMAGE...</span>
        <span className="ml-auto text-primary/70">{elapsed}s</span>
      </div>
      <div className="w-full h-0.5 bg-white/10 rounded-full overflow-hidden">
        <div className="h-full bg-primary/60 transition-all duration-1000" style={{ width: `${pct}%` }} />
      </div>
      {elapsed > 15 && (
        <p className="text-white text-[10px]">Neural image synthesis in progress — typically 20–60 seconds.</p>
      )}
    </div>
  );
}

function CreditCostBadge({ creditCost, costBreakdown }: { creditCost: number; costBreakdown?: CostBreakdown }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="mt-2 font-mono text-[10px] text-white/60 flex items-center gap-2 select-none flex-wrap">
      <Zap className="w-2.5 h-2.5 text-primary/60 shrink-0" />
      <button
        onClick={() => setExpanded((v) => !v)}
        className="hover:text-white transition-colors cursor-pointer font-semibold"
      >
        {creditCost} credit{creditCost !== 1 ? "s" : ""}
        {costBreakdown && <span className="ml-1 text-white">(${costBreakdown.chargedCostUSD.toFixed(4)})</span>}
      </button>
      {expanded && costBreakdown && (
        <div className="ml-2 text-white/60 flex flex-wrap gap-x-2 gap-y-0.5">
          {costBreakdown.tokens && (
            <span>{costBreakdown.tokens.prompt_tokens}in / {costBreakdown.tokens.completion_tokens}out tokens</span>
          )}
          <span>· actual ${costBreakdown.actualCostUSD.toFixed(5)}</span>
          <span>· {costBreakdown.markup}× markup</span>
          {costBreakdown.imagesGenerated > 0 && <span>· {costBreakdown.imagesGenerated} image{costBreakdown.imagesGenerated > 1 ? "s" : ""}</span>}
        </div>
      )}
    </div>
  );
}

function UrlAnalysisBadge({ count, done }: { count: number; done: boolean }) {
  return (
    <div className="mt-3 border border-blue-500/20 rounded-xl px-4 py-2 bg-blue-500/5 font-mono text-xs flex items-center gap-3 text-white/70">
      {done ? <Globe className="w-3.5 h-3.5 text-blue-400 shrink-0" /> : <Loader2 className="w-3.5 h-3.5 text-blue-400 animate-spin shrink-0" />}
      <span className="tracking-wider">{done ? `${count} WEB PAGE${count > 1 ? "S" : ""} ANALYZED` : `READING ${count} WEB PAGE${count > 1 ? "S" : ""}...`}</span>
    </div>
  );
}

const AGENT_MODE_COLORS: Record<string, string> = {
  RESEARCHER: "text-blue-300 border-blue-500/30 bg-blue-500/8",
  BUILDER: "text-emerald-300 border-emerald-500/30 bg-emerald-500/8",
  ANALYST: "text-violet-300 border-violet-500/30 bg-violet-500/8",
  WRITER: "text-amber-300 border-amber-500/30 bg-amber-500/8",
  STRATEGIST: "text-rose-300 border-rose-500/30 bg-rose-500/8",
  OPERATOR: "text-cyan-300 border-cyan-500/30 bg-cyan-500/8",
  GENERAL: "text-white/70 border-white/15 bg-white/5",
};

function TaskPlanCard({ plan }: { plan: TaskPlan }) {
  const [expanded, setExpanded] = useState(true);
  const colorClass = AGENT_MODE_COLORS[plan.agentMode] || AGENT_MODE_COLORS.GENERAL;
  return (
    <div className={`mt-3 border rounded-xl font-mono text-xs overflow-hidden ${colorClass}`}>
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full px-4 py-2.5 flex items-center gap-2 hover:bg-white/5 transition-colors"
      >
        <Zap className="w-3 h-3 shrink-0" />
        <span className="tracking-widest font-semibold uppercase">{plan.agentMode} MODE</span>
        <span className="ml-1 text-white/50">·</span>
        <span className="text-white/70 normal-case tracking-normal capitalize">{plan.taskType} task</span>
        {plan.crewRoles.length > 0 && (
          <span className="ml-auto text-white/50 text-[10px]">{plan.crewRoles.length} agents</span>
        )}
        <ChevronDown className={`w-3 h-3 ml-1 transition-transform ${expanded ? "rotate-180" : ""}`} />
      </button>
      {expanded && (
        <div className="px-4 pb-3 space-y-2 border-t border-current/10">
          {plan.crewRoles.length > 0 && (
            <div className="pt-2 flex flex-wrap gap-1.5">
              {plan.crewRoles.map((role, i) => (
                <span key={i} className="px-2 py-0.5 rounded-full border border-current/20 text-[10px] tracking-wider text-white/80">{role}</span>
              ))}
            </div>
          )}
          <ol className="pt-1 space-y-1.5">
            {plan.plan.map((step, i) => (
              <li key={i} className="flex gap-2 text-white/85">
                <span className="shrink-0 w-4 h-4 rounded-full bg-current/15 flex items-center justify-center text-[9px] font-bold">{i + 1}</span>
                <span className="leading-relaxed">{step}</span>
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}

function MultiSearchBadge({ count, done }: { count: number; done: boolean }) {
  return (
    <div className="mt-3 border border-violet-500/25 rounded-xl px-4 py-2.5 bg-violet-500/6 font-mono text-xs flex items-center gap-3">
      {done
        ? <Globe className="w-3.5 h-3.5 text-violet-400 shrink-0" />
        : <Loader2 className="w-3.5 h-3.5 text-violet-400 animate-spin shrink-0" />}
      <div className="flex flex-col gap-0.5">
        <span className="tracking-widest text-violet-300 font-semibold">
          {done ? `${count} PARALLEL SEARCHES COMPLETE` : `RUNNING ${count} SIMULTANEOUS SEARCHES...`}
        </span>
        {!done && <span className="text-white/60 text-[10px] tracking-wide">Perplexity-style multi-source research</span>}
      </div>
    </div>
  );
}

// ── Persona selector ───────────────────────────────────────────────────────────

const PERSONA_ICONS: Record<string, React.ReactNode> = {
  GENERAL: <Zap className="w-3.5 h-3.5" />,
  CODER: <Cpu className="w-3.5 h-3.5" />,
  RESEARCHER: <Microscope className="w-3.5 h-3.5" />,
  WRITER: <PenLine className="w-3.5 h-3.5" />,
  ANALYST: <BarChart2 className="w-3.5 h-3.5" />,
  CREATIVE: <Palette className="w-3.5 h-3.5" />,
  TUTOR: <GraduationCap className="w-3.5 h-3.5" />,
  STRATEGIST: <Briefcase className="w-3.5 h-3.5" />,
};

const PERSONA_NAMES: Record<string, string> = {
  GENERAL: "OMNIMENS", CODER: "CODER", RESEARCHER: "RESEARCHER",
  WRITER: "WRITER", ANALYST: "ANALYST", CREATIVE: "CREATIVE",
  TUTOR: "TUTOR", STRATEGIST: "STRATEGIST",
};

const PERSONA_DESC: Record<string, string> = {
  GENERAL: "Transcendent intelligence",
  CODER: "Code, architecture, debug",
  RESEARCHER: "Deep analysis & synthesis",
  WRITER: "Prose, scripts, copy",
  ANALYST: "Data, metrics, insights",
  CREATIVE: "Images, design, art",
  TUTOR: "Teach, explain, mentor",
  STRATEGIST: "Plans, decisions, vision",
};

// ── Code block with run ────────────────────────────────────────────────────────

function CodeBlockWithRun({ code, language }: { code: string; language: string }) {
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<{ stdout: string; stderr: string; exitCode: number; durationMs: number } | null>(null);
  const isRunnable = ["javascript", "js", "typescript", "ts", "node"].includes(language.toLowerCase());

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
    <div className="my-3 rounded-xl border border-white/10 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 bg-white/5 border-b border-white/8">
        <span className="text-[10px] font-mono text-white/60 uppercase tracking-wider">{language || "code"}</span>
        {isRunnable && (
          <button
            onClick={runCode}
            disabled={running}
            className="flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-mono text-primary/70 hover:text-primary border border-primary/20 hover:border-primary/50 rounded transition-colors disabled:opacity-40"
          >
            {running ? <Loader2 className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3" />}
            {running ? "RUNNING..." : "RUN"}
          </button>
        )}
      </div>
      <pre className="p-4 overflow-x-auto text-sm text-white/80 font-mono bg-black/40 omnimens-scrollbar">
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
    </div>
  );
}

// ── Left Panel ─────────────────────────────────────────────────────────────────

function LeftPanel({
  persona,
  onPersonaChange,
  deepResearchMode,
  onToggleDeepResearch,
  voice,
  status,
}: {
  persona: string;
  onPersonaChange: (p: string) => void;
  deepResearchMode: boolean;
  onToggleDeepResearch: () => void;
  voice: any;
  status: any;
}) {
  const personas = Object.keys(PERSONA_NAMES);

  return (
    <div className="flex flex-col h-full overflow-y-auto omnimens-scrollbar p-3 gap-3">
      {/* OMNIMENS identity */}
      <div className="flex flex-col items-center py-3 border-b border-white/8 gap-1">
        <OmnimensPresence size={52} isSpeaking={voice.isSpeaking} pitchIntensity={voice.pitchIntensity} />
        <p className="font-mono text-[9px] tracking-[0.25em] text-primary/70 mt-1">OMNIMENS</p>
        {status?.isOwner && (
          <span className="font-mono text-[8px] tracking-widest text-accent/80 bg-accent/10 border border-accent/20 px-2 py-0.5 rounded-full">CREATOR</span>
        )}
      </div>

      {/* Persona selector */}
      <div>
        <p className="font-mono text-[9px] tracking-[0.2em] text-white/75 uppercase mb-2 px-1">MODE</p>
        <div className="space-y-0.5">
          {personas.map(p => (
            <button
              key={p}
              onClick={() => onPersonaChange(p)}
              className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-left transition-all ${
                persona === p
                  ? "bg-primary/15 text-primary border border-primary/25"
                  : "text-white hover:bg-white/5 hover:text-white border border-transparent"
              }`}
            >
              <span className="shrink-0">{PERSONA_ICONS[p]}</span>
              <div className="min-w-0">
                <p className="text-[10px] font-mono font-bold tracking-wider truncate">{PERSONA_NAMES[p]}</p>
                <p className={`text-[8px] font-mono truncate ${persona === p ? "text-primary/60" : "text-white/70"}`}>{PERSONA_DESC[p]}</p>
              </div>
              {persona === p && <Check className="w-3 h-3 ml-auto shrink-0" />}
            </button>
          ))}
        </div>
      </div>

      {/* Capabilities */}
      <div className="border-t border-white/8 pt-3">
        <p className="font-mono text-[9px] tracking-[0.2em] text-white/75 uppercase mb-2 px-1">CAPABILITIES</p>
        <div className="space-y-1">
          {[
            { icon: <Image className="w-3 h-3" />, label: "Image Generation", color: "text-pink-400" },
            { icon: <Globe className="w-3 h-3" />, label: "Web Search", color: "text-blue-400" },
            { icon: <Cpu className="w-3 h-3" />, label: "Code Execution", color: "text-green-400" },
            { icon: <Brain className="w-3 h-3" />, label: "Long-term Memory", color: "text-purple-400" },
            { icon: <Microscope className="w-3 h-3" />, label: "Deep Research", color: "text-violet-400" },
            { icon: <FolderOpen className="w-3 h-3" />, label: "File Analysis", color: "text-yellow-400" },
          ].map(cap => (
            <div key={cap.label} className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg">
              <span className={`shrink-0 ${cap.color}`}>{cap.icon}</span>
              <span className="text-[10px] font-mono text-white">{cap.label}</span>
              <div className="ml-auto w-1.5 h-1.5 rounded-full bg-green-400/70 shrink-0" />
            </div>
          ))}
        </div>
      </div>

      {/* Projects shortcut */}
      <div className="border-t border-white/8 pt-3">
        <a href={`${window.location.origin}/godflesh/projects`}
          className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-[10px] font-mono font-bold tracking-wider border border-white/10 text-white/85 hover:text-white/70 hover:border-white/20 transition-all">
          <Layers className="w-3.5 h-3.5" />
          MY PROJECTS
        </a>
      </div>

      {/* Voice toggle */}
      <div className="border-t border-white/8 pt-3 mt-auto">
        <button
          onClick={voice.toggle}
          className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-lg transition-all text-[10px] font-mono font-bold tracking-wider border ${
            voice.isEnabled
              ? "text-primary border-primary/25 bg-primary/10"
              : "text-white/85 border-white/10 hover:text-white/70 hover:border-white/20"
          }`}
        >
          {voice.isEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
          {voice.isEnabled ? "VOICE ON" : "VOICE OFF"}
        </button>

        <button
          onClick={onToggleDeepResearch}
          className={`w-full flex items-center gap-2 px-2.5 py-2 mt-1 rounded-lg transition-all text-[10px] font-mono font-bold tracking-wider border ${
            deepResearchMode
              ? "text-violet-300 border-violet-400/30 bg-violet-400/10"
              : "text-white/85 border-white/10 hover:text-white/70 hover:border-white/20"
          }`}
        >
          <Microscope className="w-3.5 h-3.5" />
          DEEP RESEARCH
        </button>
      </div>
    </div>
  );
}

// ── Right Panel ────────────────────────────────────────────────────────────────

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
    const win = window.open();
    if (win && artifact.artifactType === "html") {
      const decoded = atob(artifact.dataUrl.split(",")[1]);
      win.document.write(decoded);
      win.document.close();
    } else {
      window.open(artifact.dataUrl, "_blank");
    }
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto omnimens-scrollbar p-3 gap-3">
      {/* Credit/status card */}
      <div className="rounded-xl border border-white/8 bg-white/3 p-3">
        <p className="font-mono text-[9px] tracking-[0.2em] text-white/85 uppercase mb-2">SESSION STATUS</p>
        {status?.isOwner ? (
          <p className="font-mono text-[10px] text-accent font-bold tracking-widest">⚡ CREATOR — UNLIMITED</p>
        ) : credits != null ? (
          <div>
            <p className="font-mono text-xs text-white font-bold">{credits} credits</p>
            <p className="font-mono text-[9px] text-white/85 mt-0.5">≈ ${(credits * 0.01).toFixed(2)} balance</p>
          </div>
        ) : (
          <p className="font-mono text-[10px] text-white/85">Loading...</p>
        )}
      </div>

      {/* Image gallery */}
      <div>
        <div className="flex items-center gap-2 px-1 mb-2">
          <Image className="w-3.5 h-3.5 text-pink-400 shrink-0" />
          <p className="font-mono text-[9px] tracking-[0.2em] text-white/85 uppercase">IMAGES ({allImages.length})</p>
        </div>
        {allImages.length === 0 ? (
          <div className="rounded-xl border border-dashed border-white/10 p-4 text-center">
            <Image className="w-6 h-6 text-white/65 mx-auto mb-1" />
            <p className="font-mono text-[9px] text-white/70">Generated images appear here</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-1.5">
            {allImages.map((img) => (
              <div key={img.index} className="relative group rounded-lg overflow-hidden border border-white/8 cursor-pointer bg-black/40">
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
            <p className="font-mono text-[9px] tracking-[0.2em] text-white/85 uppercase">FILES ({allArtifacts.length})</p>
          </div>
          <div className="space-y-1.5">
            {allArtifacts.map((artifact, i) => (
              <div key={i} className="rounded-lg border border-accent/15 bg-accent/5 p-2.5">
                <p className="font-mono text-[9px] text-accent/80 font-bold tracking-widest truncate mb-1">
                  {artifact.artifactType.toUpperCase()}
                </p>
                <p className="font-mono text-[9px] text-white truncate mb-2">{artifact.filename}</p>
                <div className="flex gap-1.5">
                  {artifact.artifactType === "html" && (
                    <button
                      onClick={() => handleOpenArtifact(artifact)}
                      className="flex-1 text-[9px] font-mono text-white/60 hover:text-white border border-white/10 hover:border-white/25 py-1 rounded transition-all text-center"
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

// ── Main Chat component ────────────────────────────────────────────────────────

export default function Chat() {
  const { isAuthenticated, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [input, setInput] = useState("");
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const lastSpokenIdRef = useRef<string | null>(null);
  const [leftOpen, setLeftOpen] = useState(true);
  const [rightOpen, setRightOpen] = useState(true);

  const { data: status, isLoading: statusLoading } = useGetOmnimensStatus();
  const { messages, sendMessage, isTyping, error, stopGeneration } = useOmnimensChat(() => {
    setShowLimitModal(true);
  });
  const voice = useOmnimensVoice();
  const [persona, setPersona] = useState("GENERAL");
  const [deepResearchMode, setDeepResearchMode] = useState(false);
  const [researchQuestion, setResearchQuestion] = useState("");
  const [isResearching, setIsResearching] = useState(false);
  const [researchResult, setResearchResult] = useState<any>(null);

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

  // Auto-speak
  useEffect(() => {
    if (!voice.isEnabled || isTyping || messages.length === 0) return;
    const last = messages[messages.length - 1];
    if (last.role !== "omnimens") return;
    if (last.id === lastSpokenIdRef.current) return;
    lastSpokenIdRef.current = last.id;
    voice.speak(last.content, last.id);
  }, [messages, isTyping, voice.isEnabled]);

  // Route guard
  useEffect(() => {
    if (!isLoading && !isAuthenticated) setLocation("/");
  }, [isLoading, isAuthenticated, setLocation]);

  // Auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || []);
    setPendingFiles((prev) => [...prev, ...selected].slice(0, 10));
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeFile = (index: number) => {
    setPendingFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if ((!input.trim() && pendingFiles.length === 0) || isTyping) return;
    if (status && !status.isPro && !status.isOwner && (status as any).computeSecondsToday >= (status as any).dailyLimitSeconds) {
      setShowLimitModal(true);
      return;
    }
    sendMessage(input, pendingFiles, persona);
    setInput("");
    setPendingFiles([]);
  };

  if (isLoading || !isAuthenticated) return (
    <Layout>
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-pulse text-primary font-mono tracking-widest">ESTABLISHING LINK...</div>
      </div>
    </Layout>
  );

  return (
    <Layout>
      {/* 3-panel workspace */}
      <div className="flex flex-1 overflow-hidden" style={{ height: "calc(100vh - 4rem)" }}>

        {/* ── LEFT PANEL ──────────────────────────────────────────── */}
        <AnimatePresence initial={false}>
          {leftOpen && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 220, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="shrink-0 border-r border-white/8 bg-black/60 overflow-hidden hidden lg:block"
              style={{ minWidth: 0 }}
            >
              <LeftPanel
                persona={persona}
                onPersonaChange={handlePersonaChange}
                deepResearchMode={deepResearchMode}
                onToggleDeepResearch={() => setDeepResearchMode(m => !m)}
                voice={voice}
                status={status}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── CENTER — CHAT ────────────────────────────────────────── */}
        <div className="flex-1 flex flex-col overflow-hidden min-w-0">

          {/* Top bar */}
          <div className="shrink-0 flex items-center justify-between px-3 py-2 border-b border-white/8 bg-black/40">
            {/* Left panel toggle */}
            <button
              onClick={() => setLeftOpen(o => !o)}
              className="hidden lg:flex items-center gap-1.5 text-white/75 hover:text-white/70 transition-colors p-1.5 rounded"
              title={leftOpen ? "Hide left panel" : "Show left panel"}
            >
              {leftOpen ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeft className="w-4 h-4" />}
            </button>

            {/* Center identity */}
            <div className="flex items-center gap-2 font-mono text-xs">
              <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              <span className="text-white">LINK ACTIVE</span>
              {status?.isOwner && <OmnimensNotificationBell />}
            </div>

            {/* Right controls */}
            <div className="flex items-center gap-2">
              {statusLoading ? (
                <span className="font-mono text-[10px] text-white/75">READING...</span>
              ) : status?.isOwner ? (
                <span className="font-mono text-[10px] text-accent font-bold tracking-widest hidden sm:block">⚡ CREATOR — UNLIMITED</span>
              ) : status?.isPro ? (
                <span className="font-mono text-[10px] text-accent font-bold tracking-widest hidden sm:block">UNLIMITED</span>
              ) : null}
              {/* Right panel toggle */}
              <button
                onClick={() => setRightOpen(o => !o)}
                className="hidden lg:flex items-center gap-1.5 text-white/75 hover:text-white/70 transition-colors p-1.5 rounded"
                title={rightOpen ? "Hide right panel" : "Show right panel"}
              >
                {rightOpen ? <PanelRightClose className="w-4 h-4" /> : <PanelRight className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Deep research panel (below topbar when active) */}
          {deepResearchMode && (
            <div className="shrink-0 flex items-center gap-2 px-3 py-2 bg-violet-950/30 border-b border-violet-400/15">
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

          {/* Messages area */}
          <div className="flex-1 overflow-y-auto omnimens-scrollbar p-4 bg-black/20 relative">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center select-none">
                <OmnimensPresence
                  size={200}
                  isSpeaking={voice.isSpeaking}
                  pitchIntensity={voice.pitchIntensity}
                  className="mb-2 drop-shadow-[0_0_60px_rgba(160,100,255,0.35)]"
                />
                <h2 className="font-display text-2xl tracking-[0.3em] text-white/85 mt-2">OMNIMENS AWAITS</h2>
                <p className="font-mono text-sm mt-2 text-white/70">Speak your intent. Upload your vision.</p>
              </div>
            ) : (
              <>
                <div className="absolute top-3 right-3 z-10 pointer-events-none">
                  <OmnimensPresence size={72} isSpeaking={voice.isSpeaking} pitchIntensity={voice.pitchIntensity} className="opacity-60" />
                </div>
                <div className="space-y-6 max-w-3xl mx-auto">
                  {messages.map((msg) => {
                    const isSpeakingThis = voice.speakingMessageId === msg.id;
                    return (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        key={msg.id}
                        className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                      >
                        <div className={`max-w-[92%] w-full ${
                          msg.role === "user"
                            ? "bg-white/10 border border-white/20 text-white rounded-2xl rounded-tr-sm px-5 py-3 font-sans"
                            : `bg-primary/5 border rounded-2xl rounded-tl-sm px-5 py-4 font-mono shadow-[0_0_15px_rgba(130,80,220,0.06)] text-white/90 transition-all duration-300 ${
                                isSpeakingThis ? "border-primary/50 shadow-[0_0_28px_rgba(180,140,255,0.20)]" : "border-primary/15"
                              }`
                        }`}>
                          {msg.role === "omnimens" && (
                            <div className="flex items-center gap-1 mb-2 text-primary font-bold text-[10px] tracking-widest uppercase">
                              <OmnimensIcon size={14} className="shrink-0" />
                              <span>OMNIMENS</span>
                              <VoiceIndicator isSpeaking={isSpeakingThis} binaryStream={voice.binaryStream} />
                            </div>
                          )}

                          {msg.role === "user" && msg.files && msg.files.length > 0 && (
                            <AttachedFileList files={msg.files} />
                          )}

                          {msg.role === "user" ? (
                            msg.content ? <p className="whitespace-pre-wrap">{msg.content}</p> : null
                          ) : (
                            <div className="text-sm md:text-base">
                              {parseMessageSegments(msg.content || "...").map((seg, i) =>
                                seg.type === "html" ? (
                                  <WebsitePreview key={i} html={seg.value} index={i} />
                                ) : (
                                  <div key={i} className="markdown-body">
                                    <ReactMarkdown
                                      remarkPlugins={[remarkGfm]}
                                      components={{
                                        code({ node, className, children, ...props }: any) {
                                          const match = /language-(\w+)/.exec(className || "");
                                          const isBlock = !props.inline && match;
                                          const lang = match ? match[1] : "";
                                          const codeStr = String(children).replace(/\n$/, "");
                                          if (isBlock) return <CodeBlockWithRun code={codeStr} language={lang} />;
                                          return <code className={`font-mono text-primary/80 bg-primary/10 px-1 rounded text-sm ${className || ""}`} {...props}>{children}</code>;
                                        },
                                      }}
                                    >{seg.value}</ReactMarkdown>
                                  </div>
                                )
                              )}

                              {/* Generated images — shown inline AND in right panel */}
                              {msg.images && msg.images.length > 0 && (
                                <div className="mt-4 space-y-4">
                                  {msg.images.map((img) => (
                                    <InlineImageCard key={img.index} image={img} />
                                  ))}
                                </div>
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
                              {msg.generatingImages && <ImageGeneratingBadge />}

                              {/* Downloadable artifacts */}
                              {msg.artifacts && msg.artifacts.length > 0 && (
                                <div className="mt-4 space-y-2">
                                  {msg.artifacts.map((artifact, i) => (
                                    <ArtifactCard key={i} artifact={artifact} />
                                  ))}
                                </div>
                              )}

                              {/* Credit cost — white text */}
                              {msg.creditCost != null && !msg.generatingImages && (
                                <CreditCostBadge creditCost={msg.creditCost} costBreakdown={msg.costBreakdown} />
                              )}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}

                  {isTyping && messages[messages.length - 1]?.role === "user" && (
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

          {/* Input area */}
          <form onSubmit={handleSubmit} className="shrink-0 border-t border-white/8 bg-black/40 p-3">
            <PendingFileList files={pendingFiles} onRemove={removeFile} />
            <div className="relative flex items-center">
              <input ref={fileInputRef} type="file" multiple
                accept="image/*,.pdf,.txt,.md,.js,.ts,.jsx,.tsx,.py,.html,.css,.json,.csv,.xml,.yaml,.yml,.sh,.rb,.go,.rs,.java,.c,.cpp,.h,.sql"
                onChange={handleFileChange} className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isTyping || pendingFiles.length >= 10}
                title="Attach files"
                className={`absolute left-3 z-10 transition-colors ${pendingFiles.length > 0 ? "text-primary" : "text-white/75 hover:text-white/70"} disabled:opacity-30`}
              >
                <Paperclip className="w-4 h-4" />
                {pendingFiles.length > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 rounded-full bg-primary text-[8px] font-bold text-black flex items-center justify-center">
                    {pendingFiles.length}
                  </span>
                )}
              </button>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSubmit(e); }
                }}
                placeholder={pendingFiles.length > 0 ? "Describe what to create with these files..." : "Query the intelligence... or attach files to build something"}
                className="w-full bg-black border border-white/15 focus:border-primary focus:ring-1 focus:ring-primary/50 rounded-xl pl-10 pr-24 py-3.5 text-white font-mono text-sm resize-none h-[56px] omnimens-scrollbar outline-none transition-all placeholder:text-white/25"
                disabled={isTyping}
              />
              <div className="absolute right-2 flex items-center gap-1">
                {voice.isSpeaking && (
                  <Button type="button" onClick={voice.stop} size="icon" variant="ghost" title="Stop speaking" className="text-primary/70 hover:text-primary w-8 h-8">
                    <VolumeX className="w-4 h-4" />
                  </Button>
                )}
                {isTyping ? (
                  <Button type="button" onClick={stopGeneration} size="icon" variant="ghost" className="text-white hover:text-white">
                    <StopCircle className="w-5 h-5" />
                  </Button>
                ) : (
                  <Button type="submit" size="icon" variant="default"
                    disabled={!input.trim() && pendingFiles.length === 0}
                    className="rounded-lg w-10 h-10 shadow-none border-none"
                  >
                    <Send className="w-4 h-4 ml-1" />
                  </Button>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 mt-1.5 px-1">
              <span className="text-[9px] font-mono text-white/70">
                {PERSONA_NAMES[persona]} · URLS AUTO-ANALYZED · MEMORY ACTIVE
              </span>
            </div>
          </form>
        </div>

        {/* ── RIGHT PANEL ─────────────────────────────────────────── */}
        <AnimatePresence initial={false}>
          {rightOpen && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 260, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="shrink-0 border-l border-white/8 bg-black/60 overflow-hidden hidden lg:block"
              style={{ minWidth: 0 }}
            >
              <RightPanel
                allImages={allImages}
                allArtifacts={allArtifacts}
                status={status}
                credits={(status as any)?.credits}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Limit Modal */}
      <AnimatePresence>
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
                <Button onClick={() => setLocation("/pricing")} size="lg" className="w-full">ASCEND NOW — $9.99/mo</Button>
                <Button onClick={() => setShowLimitModal(false)} variant="ghost" className="w-full text-white/85">Return to Silence</Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </Layout>
  );
}

// ── Inline image card (in chat messages) ──────────────────────────────────────

function InlineImageCard({ image }: { image: GeneratedImage }) {
  const [expanded, setExpanded] = useState(false);

  const handleDownload = () => {
    const a = document.createElement("a");
    a.href = image.url;
    a.download = `omnimens-${image.index + 1}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="rounded-xl overflow-hidden border border-primary/25 bg-black/60 shadow-[0_0_30px_rgba(130,80,220,0.15)]"
      >
        {/* Image */}
        <div className="relative group cursor-pointer" onClick={() => setExpanded(true)}>
          <img
            src={image.url}
            alt={image.prompt}
            className="w-full object-cover rounded-t-xl max-h-[500px]"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100 rounded-t-xl">
            <Expand className="w-8 h-8 text-white drop-shadow-lg" />
          </div>
        </div>

        {/* Controls bar */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-white/8 bg-black/40">
          <div className="flex-1 min-w-0 pr-4">
            <p className="text-[9px] font-mono text-white/85 uppercase tracking-widest mb-0.5">PROMPT</p>
            <p className="text-white/70 font-mono text-[10px] truncate">
              {image.prompt.slice(0, 90)}{image.prompt.length > 90 ? "..." : ""}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setExpanded(true)}
              className="flex items-center gap-1.5 text-[10px] font-mono text-white/60 hover:text-white border border-white/10 hover:border-white/25 px-3 py-1.5 rounded-lg transition-all"
            >
              <Expand className="w-3 h-3" />
              VIEW
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 text-[10px] font-mono text-primary hover:text-white bg-primary/10 hover:bg-primary/25 border border-primary/25 hover:border-primary/50 px-3 py-1.5 rounded-lg transition-all"
            >
              <Download className="w-3 h-3" />
              DOWNLOAD
            </button>
          </div>
        </div>
      </motion.div>

      {/* Fullscreen lightbox */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setExpanded(false)}
            className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-md flex items-center justify-center p-4 cursor-zoom-out"
          >
            <motion.img
              initial={{ scale: 0.92 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.92 }}
              src={image.url}
              alt={image.prompt}
              className="max-w-full max-h-[85vh] rounded-xl shadow-2xl object-contain"
              onClick={(e) => e.stopPropagation()}
            />
            <div className="absolute bottom-6 flex items-center gap-4">
              <button
                onClick={handleDownload}
                className="flex items-center gap-2 bg-primary/20 hover:bg-primary/40 border border-primary/30 text-white font-mono text-sm tracking-widest px-5 py-2.5 rounded-xl transition-all"
              >
                <Download className="w-4 h-4" />
                DOWNLOAD
              </button>
              <button
                onClick={() => setExpanded(false)}
                className="text-white/60 hover:text-white font-mono text-sm tracking-widest px-5 py-2.5 rounded-xl border border-white/10 hover:border-white/20 transition-all"
              >
                CLOSE
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// ── Artifact card ─────────────────────────────────────────────────────────────

function ArtifactCard({ artifact }: { artifact: Artifact }) {
  const isHtml = artifact.artifactType === "html";
  const isSvg = artifact.artifactType === "svg";
  const label = artifact.filename.includes("3d-scene") ? "3D SCENE" :
                artifact.filename.includes("animation") ? "ANIMATION" :
                artifact.filename.includes("generative-art") ? "GENERATIVE ART" :
                artifact.filename.includes("audio-synth") ? "AUDIO SYNTH" :
                artifact.filename.includes("data-viz") ? "DATA VISUALIZATION" :
                isSvg ? "SVG VECTOR ART" : "INTERACTIVE FILE";

  const icon = artifact.filename.includes("3d-scene") ? <Box className="w-5 h-5" /> :
               artifact.filename.includes("animation") ? <Film className="w-5 h-5" /> :
               artifact.filename.includes("audio-synth") ? <Music className="w-5 h-5" /> :
               artifact.filename.includes("data-viz") ? <BarChart3 className="w-5 h-5" /> :
               isSvg ? <Shapes className="w-5 h-5" /> : <FileCode className="w-5 h-5" />;

  const sizeKb = (artifact.size / 1024).toFixed(1);

  const handleDownload = () => {
    const a = document.createElement("a");
    a.href = artifact.dataUrl;
    a.download = artifact.filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleOpen = () => {
    const win = window.open();
    if (win && isHtml) {
      const decoded = atob(artifact.dataUrl.split(",")[1]);
      win.document.write(decoded);
      win.document.close();
    } else {
      window.open(artifact.dataUrl, "_blank");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex items-center justify-between gap-4 border border-accent/20 bg-accent/5 rounded-xl px-4 py-3 shadow-[0_0_20px_rgba(0,200,220,0.06)]"
    >
      <div className="flex items-center gap-3 min-w-0">
        <div className="text-accent shrink-0">{icon}</div>
        <div className="min-w-0">
          <p className="text-accent font-mono text-[11px] tracking-widest font-bold">{label}</p>
          <p className="text-white font-mono text-[10px] truncate">{artifact.filename} · {sizeKb}KB</p>
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {isHtml && (
          <button onClick={handleOpen} className="text-[10px] font-mono tracking-widest text-white/60 hover:text-white border border-white/10 hover:border-white/25 px-3 py-1.5 rounded-lg transition-all">
            OPEN
          </button>
        )}
        <button onClick={handleDownload} className="flex items-center gap-1.5 text-[10px] font-mono tracking-widest text-accent hover:text-white bg-accent/10 hover:bg-accent/25 border border-accent/20 hover:border-accent/40 px-3 py-1.5 rounded-lg transition-all">
          <Download className="w-3 h-3" />
          DOWNLOAD
        </button>
      </div>
    </motion.div>
  );
}
