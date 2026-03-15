import { useEffect, useRef, useState } from "react";
import { useParams, Link, useLocation } from "wouter";
import { useGetSuperAISession, useDeleteSuperAISession } from "@workspace/api-client-react";
import { useSuperAIStream } from "@/hooks/use-superai-stream";
import { motion, AnimatePresence } from "framer-motion";
import {
  Brain, ShieldAlert, Cpu, Sparkles, ArrowRight, Play, CheckCircle2,
  Trash2, FlaskConical, Network, Eye, Terminal, FileCode, Package,
  Loader2, ChevronRight, MessageSquare, Download, Zap, RotateCcw,
  Crown, Flame, Swords,
} from "lucide-react";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import type { AgentName, CodeFile, ExecutionResult } from "@/hooks/use-superai-stream";

type AgentKey = AgentName;

const AGENT_CONFIG: Record<AgentKey, {
  icon: React.ElementType; description: string; color: string;
  glow: string; border: string; bg: string; dot: string; badge: string;
}> = {
  Architect: {
    icon: Brain, description: "Core architecture & system design",
    color: "text-blue-400", glow: "rgba(96,165,250,0.6)",
    border: "border-blue-400/50", bg: "bg-blue-400/10",
    dot: "bg-blue-400", badge: "border-blue-400/30 bg-blue-400/5 text-blue-400",
  },
  Critic: {
    icon: ShieldAlert, description: "Bug detection & code hardening",
    color: "text-orange-400", glow: "rgba(251,146,60,0.6)",
    border: "border-orange-400/50", bg: "bg-orange-400/10",
    dot: "bg-orange-400", badge: "border-orange-400/30 bg-orange-400/5 text-orange-400",
  },
  Synthesizer: {
    icon: Cpu, description: "Integration & unified pipeline",
    color: "text-purple-400", glow: "rgba(192,132,252,0.6)",
    border: "border-purple-400/50", bg: "bg-purple-400/10",
    dot: "bg-purple-400", badge: "border-purple-400/30 bg-purple-400/5 text-purple-400",
  },
  Mathematician: {
    icon: FlaskConical, description: "Math engine & optimization",
    color: "text-emerald-400", glow: "rgba(52,211,153,0.6)",
    border: "border-emerald-400/50", bg: "bg-emerald-400/10",
    dot: "bg-emerald-400", badge: "border-emerald-400/30 bg-emerald-400/5 text-emerald-400",
  },
  Neuroscientist: {
    icon: Network, description: "Bio-inspired learning systems",
    color: "text-pink-400", glow: "rgba(244,114,182,0.6)",
    border: "border-pink-400/50", bg: "bg-pink-400/10",
    dot: "bg-pink-400", badge: "border-pink-400/30 bg-pink-400/5 text-pink-400",
  },
  "Meta-Agent": {
    icon: Eye, description: "Self-upgrade & orchestration",
    color: "text-yellow-400", glow: "rgba(250,204,21,0.6)",
    border: "border-yellow-400/50", bg: "bg-yellow-400/10",
    dot: "bg-yellow-400", badge: "border-yellow-400/30 bg-yellow-400/5 text-yellow-400",
  },
};

const AGENT_ORDER: AgentKey[] = ["Architect", "Mathematician", "Critic", "Neuroscientist", "Synthesizer", "Meta-Agent"];

const AgentCard = ({ name, isActive }: { name: AgentKey; isActive: boolean }) => {
  const cfg = AGENT_CONFIG[name];
  const Icon = cfg.icon;
  return (
    <div
      className={cn(
        "relative flex flex-col items-center p-3 md:p-4 rounded-2xl border bg-black/60 backdrop-blur-2xl transition-all duration-700 overflow-hidden",
        isActive ? cfg.border : "border-white/5",
        isActive ? "scale-105 z-10" : "scale-100 opacity-50 hover:opacity-70"
      )}
      style={isActive ? { boxShadow: `0 0 30px -8px ${cfg.glow}` } : {}}
    >
      {isActive && <div className={cn("absolute top-0 left-0 w-full h-0.5", cfg.dot)} />}
      <div className={cn("p-2.5 rounded-xl mb-2 transition-colors duration-500", isActive ? cn(cfg.bg, cfg.color) : "bg-white/5 text-white/30")}>
        <Icon className="w-5 h-5" />
      </div>
      <h3 className={cn("font-bold text-[10px] tracking-widest uppercase mb-0.5 transition-colors duration-500", isActive ? cfg.color : "text-white/50")}>
        {name}
      </h3>
      <p className="text-[9px] text-center text-white/30 leading-tight hidden md:block">{cfg.description}</p>
      {isActive && (
        <motion.div className="absolute bottom-2 flex gap-0.5" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              className={cn("w-1 h-1 rounded-full", cfg.dot)}
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ repeat: Infinity, duration: 1.2, delay: i * 0.2 }}
            />
          ))}
        </motion.div>
      )}
    </div>
  );
};

function ChatMessage({ message }: { message: { id?: number; agentName: string; content: string; round: number } }) {
  const agentName = message.agentName as AgentKey;
  const cfg = AGENT_CONFIG[agentName] ?? AGENT_CONFIG.Architect;
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.35 }}
      className={cn("w-full rounded-2xl p-4 md:p-5 border backdrop-blur-md shadow-lg", cfg.border.replace("/50", "/20"), cfg.bg)}
    >
      <div className="flex items-center justify-between mb-3 border-b border-white/5 pb-2">
        <span className={cn("font-bold text-xs tracking-widest uppercase flex items-center gap-2", cfg.color)}>
          <span className={cn("w-2 h-2 rounded-full", cfg.dot)} />
          {message.agentName}
        </span>
        <span className="text-[10px] text-white/30 font-mono tracking-widest uppercase border border-white/10 px-2 py-0.5 rounded-md bg-black/40">
          RND {String(message.round).padStart(2, "0")}
        </span>
      </div>
      <div className="prose prose-invert prose-sm prose-p:leading-relaxed prose-pre:bg-black/50 prose-pre:border prose-pre:border-white/10 max-w-none text-white/80">
        <ReactMarkdown>{message.content}</ReactMarkdown>
      </div>
    </motion.div>
  );
}

function CodePanel({
  codeFiles,
  executions,
  executingFile,
  installingPackages,
  isCodeMode,
}: {
  codeFiles: CodeFile[];
  executions: ExecutionResult[];
  executingFile: string | null;
  installingPackages: string[] | null;
  isCodeMode: boolean;
}) {
  const [activeFile, setActiveFile] = useState<string | null>(null);

  useEffect(() => {
    if (codeFiles.length > 0 && (!activeFile || !codeFiles.find((f) => f.filename === activeFile))) {
      setActiveFile(codeFiles[codeFiles.length - 1].filename);
    }
  }, [codeFiles, activeFile]);

  const currentFile = codeFiles.find((f) => f.filename === activeFile);
  const cfg = currentFile ? AGENT_CONFIG[currentFile.writtenBy] ?? AGENT_CONFIG.Architect : null;

  if (!isCodeMode) return null;

  return (
    <div className="flex flex-col h-full bg-black/40 rounded-2xl border border-white/10 overflow-hidden">
      {/* Panel header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10 bg-black/60 shrink-0">
        <FileCode className="w-4 h-4 text-white/40" />
        <span className="text-xs font-bold tracking-widest text-white/40 uppercase">Code Lab</span>
        <div className="ml-auto flex items-center gap-2">
          {installingPackages && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="flex items-center gap-1.5 text-yellow-400 text-[10px] tracking-widest"
            >
              <Package className="w-3 h-3 animate-pulse" />
              <span>INSTALLING {installingPackages.join(", ")}</span>
            </motion.div>
          )}
          {executingFile && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="flex items-center gap-1.5 text-blue-400 text-[10px] tracking-widest"
            >
              <Loader2 className="w-3 h-3 animate-spin" />
              <span>EXECUTING {executingFile}</span>
            </motion.div>
          )}
          <span className="text-[10px] text-white/20 font-mono">{codeFiles.length} FILE{codeFiles.length !== 1 ? "S" : ""}</span>
        </div>
      </div>

      {codeFiles.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-white/20 p-8 text-center">
          <FileCode className="w-10 h-10 mb-3 opacity-30" />
          <p className="text-xs tracking-widest uppercase">Agents Will Write Code Here</p>
          <p className="text-[10px] mt-2 opacity-60">Files execute automatically as they are written</p>
        </div>
      ) : (
        <>
          {/* File tabs */}
          <div className="flex gap-1 px-3 py-2 border-b border-white/5 overflow-x-auto shrink-0 scrollbar-none">
            {codeFiles.map((f) => {
              const agentCfg = AGENT_CONFIG[f.writtenBy] ?? AGENT_CONFIG.Architect;
              const isActive = f.filename === activeFile;
              const lastExec = [...executions].reverse().find((e) => e.filename === f.filename);
              return (
                <button
                  key={f.filename}
                  onClick={() => setActiveFile(f.filename)}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-mono whitespace-nowrap transition-all shrink-0 border",
                    isActive
                      ? cn(agentCfg.bg, agentCfg.border.replace("/50", "/40"), agentCfg.color)
                      : "bg-white/5 border-white/5 text-white/40 hover:text-white/70"
                  )}
                >
                  <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", agentCfg.dot)} />
                  {f.filename}
                  {lastExec && (
                    <span className={lastExec.success ? "text-emerald-400" : "text-red-400"}>
                      {lastExec.success ? "✓" : "✗"}
                    </span>
                  )}
                  {executingFile === f.filename && (
                    <Loader2 className="w-2.5 h-2.5 animate-spin text-blue-400" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Code viewer */}
          <div className="flex-1 overflow-auto min-h-0">
            {currentFile && (
              <div className="p-1">
                <div className="flex items-center justify-between px-3 py-1.5 border-b border-white/5">
                  <span className={cn("text-[10px] font-mono font-bold", cfg?.color)}>{currentFile.filename}</span>
                  <span className="text-[10px] text-white/30 font-mono">{currentFile.language}</span>
                </div>
                <pre className="text-[11px] font-mono text-green-300/80 p-4 leading-relaxed overflow-x-auto whitespace-pre-wrap break-words">
                  {currentFile.code}
                </pre>
              </div>
            )}
          </div>

          {/* Terminal */}
          <div className="border-t border-white/10 shrink-0 max-h-48 overflow-y-auto">
            <div className="flex items-center gap-2 px-3 py-2 border-b border-white/5 bg-black/60 sticky top-0">
              <Terminal className="w-3 h-3 text-white/30" />
              <span className="text-[10px] font-mono text-white/30 tracking-widest uppercase">Terminal</span>
              <span className="ml-auto text-[10px] text-white/20">{executions.length} execution{executions.length !== 1 ? "s" : ""}</span>
            </div>
            <div className="p-3 space-y-2 font-mono text-[11px]">
              {executions.length === 0 && (
                <p className="text-white/20">No executions yet...</p>
              )}
              <AnimatePresence initial={false}>
                {executions.map((exec, i) => (
                  <motion.div
                    key={`${exec.filename}-${i}`}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="border-b border-white/5 pb-2 last:border-0"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className={exec.success ? "text-emerald-400" : "text-red-400"}>
                        {exec.success ? "✓" : "✗"}
                      </span>
                      <span className="text-white/50">{exec.filename}</span>
                    </div>
                    {exec.output && (
                      <pre className="text-emerald-300/70 whitespace-pre-wrap break-words pl-4">{exec.output}</pre>
                    )}
                    {exec.errors && (
                      <pre className="text-red-400/70 whitespace-pre-wrap break-words pl-4">{exec.errors}</pre>
                    )}
                    {exec.qualityWarning && (
                      <div className="mt-1 pl-4 flex items-start gap-1.5 text-yellow-400/80 text-[10px] leading-snug">
                        <span className="shrink-0 mt-0.5">⚠</span>
                        <span>{exec.qualityWarning}</span>
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
              {executingFile && (
                <motion.div
                  initial={{ opacity: 0 }} animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ repeat: Infinity, duration: 1 }}
                  className="text-blue-400 flex items-center gap-2"
                >
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Running {executingFile}...
                </motion.div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default function SessionPage() {
  const params = useParams();
  const sessionId = parseInt(params.id || "0");
  const [, setLocation] = useLocation();
  const [mobilePanel, setMobilePanel] = useState<"conversation" | "code">("conversation");

  const { data: sessionData, isLoading } = useGetSuperAISession(sessionId);
  const { mutateAsync: deleteSession, isPending: isDeleting } = useDeleteSuperAISession();
  const {
    startStream, isStreaming, streamedMessages, activeAgent,
    codeFiles, executions, executingFile, installingPackages,
    restoringWorkspace, restoredWorkspace,
    iterationStatus, isPackaging, packageReady, downloadUrl,
    namingInProgress, namingMessages, activeNamingAgent, decidedName,
  } = useSuperAIStream(sessionId);

  const bottomRef = useRef<HTMLDivElement>(null);
  const codeBottomRef = useRef<HTMLDivElement>(null);

  const isCompleted = sessionData?.status === "completed";
  const isCodeMode = sessionData?.mode === "code";
  const displayMessages = [...(sessionData?.messages || [])];
  const allMessages = [...displayMessages, ...streamedMessages];

  // Merge persisted code files with live streamed ones
  const persistedCodeFiles: CodeFile[] = (sessionData as any)?.codeFiles || [];
  const allCodeFiles = codeFiles.length > 0 ? codeFiles : persistedCodeFiles;

  const persistedExecutions: ExecutionResult[] = (sessionData as any)?.executions || [];
  const allExecutions = executions.length > 0 ? executions : persistedExecutions;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [allMessages.length]);

  useEffect(() => {
    if (codeFiles.length > 0) {
      codeBottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [codeFiles.length, executions.length]);

  // Auto-switch to code panel when code starts being written
  useEffect(() => {
    if (codeFiles.length > 0 && isCodeMode) {
      setMobilePanel("code");
    }
  }, [codeFiles.length, isCodeMode]);

  const handleDelete = async () => {
    if (confirm("Purge this session from memory? This action is irreversible.")) {
      await deleteSession({ id: sessionId });
      setLocation("/");
    }
  };

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!sessionData) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center">
        <ShieldAlert className="w-16 h-16 text-destructive mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">Session Not Found</h2>
        <p className="text-white/50 mb-6">The requested collaboration sector does not exist.</p>
        <Link href="/" className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-xl transition-all text-sm tracking-widest">
          RETURN TO NEXUS
        </Link>
      </div>
    );
  }

  const canStart = (sessionData.status === "pending" || (sessionData.status === "running" && !isStreaming && allMessages.length === 0)) && !isStreaming;

  return (
    <div className="flex flex-col h-[calc(100vh-5rem)]">

      {/* Header */}
      <div className="mb-3 flex justify-between items-start shrink-0">
        <div className="min-w-0 flex-1 pr-3">
          <h1 className="text-xl md:text-2xl font-black mb-1.5 text-transparent bg-clip-text bg-gradient-to-r from-white to-white/60 tracking-tight truncate">
            {sessionData.topic}
          </h1>
          <div className="flex items-center gap-2 flex-wrap text-sm font-mono">
            <span className={cn(
              "px-3 py-0.5 rounded-full text-[10px] font-bold tracking-widest uppercase border",
              isCompleted ? "bg-purple-400/10 border-purple-400/30 text-purple-400" :
              sessionData.status === "running" ? "bg-blue-400/10 border-blue-400/30 text-blue-400 animate-pulse" :
              "bg-white/5 border-white/10 text-white/50"
            )}>
              {sessionData.status}
            </span>
            <span className={cn(
              "px-3 py-0.5 rounded-full text-[10px] font-bold tracking-widest uppercase border",
              isCodeMode ? "bg-emerald-400/10 border-emerald-400/30 text-emerald-400" : "bg-white/5 border-white/10 text-white/30"
            )}>
              {isCodeMode ? "CODE LAB" : "BLUEPRINT"}
            </span>
            <span className="text-white/20">ID: {sessionData.id}</span>
          </div>
        </div>
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className="shrink-0 p-2.5 bg-white/5 border border-white/10 text-red-400 hover:bg-red-400/20 hover:border-red-400/30 rounded-xl transition-all"
          title="Delete Session"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Agent Grid */}
      <div className="grid grid-cols-6 gap-2 mb-3 shrink-0">
        {AGENT_ORDER.map((name) => (
          <AgentCard key={name} name={name} isActive={activeAgent === name} />
        ))}
      </div>

      {/* Workspace restoration banner */}
      <AnimatePresence>
        {restoringWorkspace && (
          <motion.div
            key="restoring"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-3 shrink-0 overflow-hidden"
          >
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-cyan-400/20 bg-cyan-400/5 text-cyan-400 text-[11px] font-mono tracking-widest">
              <Loader2 className="w-3 h-3 animate-spin shrink-0" />
              <span>RESTORING PERSISTENT LAB WORKSPACE FROM DATABASE…</span>
            </div>
          </motion.div>
        )}
        {restoredWorkspace && restoredWorkspace.fileCount > 0 && (
          <motion.div
            key="restored"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-3 shrink-0 overflow-hidden"
          >
            <div className="flex flex-wrap items-center gap-3 px-4 py-2.5 rounded-xl border border-emerald-400/25 bg-emerald-400/5 text-[10px] font-mono tracking-widest">
              <span className="flex items-center gap-1.5 text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                <span className="font-bold">LAB WORKSPACE LOADED</span>
              </span>
              <span className="text-white/40">
                {restoredWorkspace.fileCount} file{restoredWorkspace.fileCount !== 1 ? "s" : ""} persisted
              </span>
              {restoredWorkspace.packageCount > 0 && (
                <span className="flex items-center gap-1 text-yellow-400/80">
                  <Package className="w-3 h-3 shrink-0" />
                  {restoredWorkspace.packageCount} package{restoredWorkspace.packageCount !== 1 ? "s" : ""} installed
                </span>
              )}
              <span className="text-white/20 hidden md:inline">
                {restoredWorkspace.files.map((f) => f.filename).join(" · ")}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Iteration progress — only in code mode */}
      <AnimatePresence>
        {isCodeMode && iterationStatus && (
          <motion.div
            key="iterations"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-3 shrink-0 overflow-hidden"
          >
            <div className="flex flex-col gap-2 px-4 py-3 rounded-xl border border-white/10 bg-black/40">
              {/* Iteration header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Zap className="w-3.5 h-3.5 text-yellow-400" />
                  <span className="text-[11px] font-bold tracking-widest text-yellow-400 uppercase">
                    {iterationStatus.current <= iterationStatus.total && isStreaming
                      ? `Iteration ${iterationStatus.current} of ${iterationStatus.total} in progress`
                      : `${iterationStatus.completedIterations.length} of ${iterationStatus.total} iterations complete`}
                  </span>
                </div>
                <span className="text-[10px] font-mono text-white/30">
                  {iterationStatus.completedIterations.length}/{iterationStatus.total}
                </span>
              </div>
              {/* Iteration dots */}
              <div className="flex items-center gap-2">
                {Array.from({ length: iterationStatus.total }, (_, i) => {
                  const n = i + 1;
                  const isDone = iterationStatus.completedIterations.some((c) => c.iteration === n);
                  const isActive = iterationStatus.current === n && isStreaming && !isDone;
                  const colors = ["text-blue-400 bg-blue-400", "text-orange-400 bg-orange-400", "text-emerald-400 bg-emerald-400"];
                  const borders = ["border-blue-400/40", "border-orange-400/40", "border-emerald-400/40"];
                  const labels = ["Build Foundation", "Challenge & Surpass", "Final Evolution"];
                  return (
                    <div key={n} className={cn(
                      "flex-1 flex flex-col items-center gap-1 px-2 py-1.5 rounded-lg border transition-all",
                      isDone ? borders[i] + " bg-white/5" : isActive ? borders[i] + " bg-white/5 animate-pulse" : "border-white/5"
                    )}>
                      <div className="flex items-center gap-1">
                        <div className={cn("w-2 h-2 rounded-full transition-all", isDone || isActive ? colors[i].split(" ")[1] : "bg-white/10")} />
                        <span className={cn("text-[9px] font-bold tracking-widest uppercase", isDone || isActive ? colors[i].split(" ")[0] : "text-white/30")}>
                          {isDone ? "✓ Done" : isActive ? "Running" : `Iter ${n}`}
                        </span>
                      </div>
                      <span className="text-[8px] text-white/30 text-center leading-tight hidden md:block">{labels[i]}</span>
                      {isDone && iterationStatus.completedIterations.find((c) => c.iteration === n) && (
                        <span className="text-[8px] text-white/20 font-mono">
                          {iterationStatus.completedIterations.find((c) => c.iteration === n)?.fileCount} files
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Packaging + download */}
      <AnimatePresence>
        {isCodeMode && isPackaging && (
          <motion.div key="packaging"
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
            className="mb-3 shrink-0 overflow-hidden"
          >
            <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl border border-violet-400/25 bg-violet-400/5 text-violet-400 text-[11px] font-mono tracking-widest">
              <Package className="w-3.5 h-3.5 animate-bounce shrink-0" />
              <span>PACKAGING INTO STANDALONE APPLICATION BUNDLE…</span>
            </div>
          </motion.div>
        )}
        {isCodeMode && packageReady && downloadUrl && (
          <motion.div key="download"
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
            className="mb-3 shrink-0 overflow-hidden"
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 px-4 py-3 rounded-xl border border-emerald-400/30 bg-emerald-400/5">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <div>
                  <p className="text-[11px] font-bold tracking-widest text-emerald-400 uppercase">Bundle Ready — 3 Iterations Complete</p>
                  <p className="text-[10px] text-white/40 mt-0.5">All source files, packages, run scripts, and README packed into a zip</p>
                </div>
              </div>
              <a
                href={downloadUrl}
                download="superai_bundle_v3.zip"
                className="shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-xl border border-emerald-400/40 bg-emerald-400/10 hover:bg-emerald-400/20 transition-all text-emerald-400 font-bold text-[11px] tracking-widest uppercase"
              >
                <Download className="w-3.5 h-3.5" />
                Download ZIP
              </a>
            </div>
          </motion.div>
        )}
        {/* Also show download on completed sessions if code mode */}
        {isCodeMode && isCompleted && !packageReady && !isStreaming && (
          <motion.div key="download-completed"
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
            className="mb-3 shrink-0 overflow-hidden"
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 px-4 py-3 rounded-xl border border-white/10 bg-white/5">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <Download className="w-4 h-4 text-white/50 shrink-0" />
                <p className="text-[10px] text-white/40">Download the complete application bundle built by the agents</p>
              </div>
              <a
                href="/api/superai/lab/download"
                download="superai_bundle_v3.zip"
                className="shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all text-white/60 font-bold text-[10px] tracking-widest uppercase"
              >
                <Download className="w-3 h-3" />
                Download Bundle
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Naming Ceremony — live debate panel */}
      <AnimatePresence>
        {isCodeMode && (namingInProgress || namingMessages.length > 0) && !decidedName && (
          <motion.div key="naming-ceremony"
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-3 shrink-0 overflow-hidden"
          >
            <div className="rounded-xl border border-yellow-400/20 bg-black/60 overflow-hidden">
              {/* Header */}
              <div className="flex items-center gap-2.5 px-4 py-2.5 border-b border-yellow-400/10 bg-yellow-400/5">
                <Swords className="w-4 h-4 text-yellow-400 shrink-0" />
                <div className="flex-1">
                  <p className="text-[11px] font-bold tracking-widest text-yellow-400 uppercase">
                    Council Naming Ceremony
                  </p>
                  <p className="text-[9px] text-white/30 mt-0.5">
                    6 agents debate — naming the AI they built
                  </p>
                </div>
                {activeNamingAgent && (
                  <div className="flex items-center gap-1.5">
                    <div className={cn("w-1.5 h-1.5 rounded-full animate-ping", AGENT_CONFIG[activeNamingAgent].dot)} />
                    <span className={cn("text-[10px] font-bold tracking-widest", AGENT_CONFIG[activeNamingAgent].color)}>
                      {activeNamingAgent} speaking…
                    </span>
                  </div>
                )}
              </div>
              {/* Messages */}
              <div className="max-h-60 overflow-y-auto px-4 py-3 space-y-3">
                {namingMessages.map((msg, i) => {
                  const cfg = AGENT_CONFIG[msg.agent];
                  const Icon = cfg.icon;
                  return (
                    <div key={i} className="flex gap-2.5">
                      <div className={cn("shrink-0 mt-0.5 w-5 h-5 rounded-full flex items-center justify-center", cfg.bg)}>
                        <Icon className={cn("w-2.5 h-2.5", cfg.color)} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className={cn("text-[9px] font-bold tracking-widest uppercase mr-2", cfg.color)}>
                          {msg.agent}
                          {msg.agent === "Meta-Agent" && <Crown className="w-2.5 h-2.5 inline ml-1" />}
                        </span>
                        <p className="text-[11px] text-white/60 leading-relaxed mt-0.5 whitespace-pre-wrap">{msg.content}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* THE NAME REVEAL — dramatic full-width cinematic banner */}
      <AnimatePresence>
        {isCodeMode && (decidedName || (sessionData as any)?.aiName) && (() => {
          const name = decidedName || (sessionData as any)?.aiName;
          return (
            <motion.div key="name-reveal"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
              className="mb-3 shrink-0"
            >
              <div className="relative overflow-hidden rounded-2xl border border-yellow-400/30 bg-black">
                {/* Ambient glow layers */}
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/5 via-transparent to-orange-400/5 pointer-events-none" />
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-px bg-gradient-to-r from-transparent via-yellow-400/50 to-transparent" />
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-px bg-gradient-to-r from-transparent via-orange-400/30 to-transparent" />
                <div className="px-6 py-5 text-center relative">
                  {/* Pre-label */}
                  <div className="flex items-center justify-center gap-2 mb-3">
                    <div className="flex-1 h-px bg-gradient-to-r from-transparent to-yellow-400/30" />
                    <div className="flex items-center gap-1.5">
                      <Flame className="w-3 h-3 text-orange-400" />
                      <span className="text-[9px] font-bold tracking-[0.25em] text-yellow-400/70 uppercase">
                        The Council Has Named It
                      </span>
                      <Flame className="w-3 h-3 text-orange-400" />
                    </div>
                    <div className="flex-1 h-px bg-gradient-to-l from-transparent to-yellow-400/30" />
                  </div>
                  {/* The Name */}
                  <motion.h2
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    className="text-3xl sm:text-4xl md:text-5xl font-black tracking-[0.08em] uppercase"
                    style={{
                      background: "linear-gradient(135deg, #fbbf24 0%, #f97316 40%, #fbbf24 70%, #fff7ed 100%)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      filter: "drop-shadow(0 0 20px rgba(251,191,36,0.4))",
                    }}
                  >
                    {name}
                  </motion.h2>
                  {/* Sub-label */}
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="mt-2 text-[10px] text-white/30 tracking-widest uppercase font-mono"
                  >
                    Named by 6-agent council vote · {namingMessages.length > 0 ? namingMessages.length : "6"} proposals debated · Meta-Agent ruling
                  </motion.p>
                  {/* Crown icons */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="flex items-center justify-center gap-6 mt-4"
                  >
                    {(["Architect", "Critic", "Synthesizer", "Mathematician", "Neuroscientist", "Meta-Agent"] as AgentName[]).map((a) => {
                      const cfg = AGENT_CONFIG[a];
                      const Icon = cfg.icon;
                      return (
                        <div key={a} className="flex flex-col items-center gap-1">
                          <div className={cn("w-6 h-6 rounded-full flex items-center justify-center", cfg.bg)}>
                            <Icon className={cn("w-3 h-3", cfg.color)} />
                          </div>
                        </div>
                      );
                    })}
                  </motion.div>
                </div>
              </div>
            </motion.div>
          );
        })()}
      </AnimatePresence>

      {/* Mobile tab switcher — only shown in code mode */}
      {isCodeMode && (
        <div className="flex gap-1 mb-3 shrink-0 md:hidden">
          <button
            onClick={() => setMobilePanel("conversation")}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold tracking-widest uppercase border transition-all",
              mobilePanel === "conversation"
                ? "bg-blue-400/10 border-blue-400/30 text-blue-400"
                : "bg-white/5 border-white/5 text-white/40"
            )}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            Conversation
          </button>
          <button
            onClick={() => setMobilePanel("code")}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold tracking-widest uppercase border transition-all",
              mobilePanel === "code"
                ? "bg-emerald-400/10 border-emerald-400/30 text-emerald-400"
                : "bg-white/5 border-white/5 text-white/40"
            )}
          >
            <FileCode className="w-3.5 h-3.5" />
            Code Lab
            {allCodeFiles.length > 0 && (
              <span className="bg-emerald-400/20 text-emerald-400 text-[9px] px-1.5 py-0.5 rounded-full font-mono">
                {allCodeFiles.length}
              </span>
            )}
          </button>
        </div>
      )}

      {/* Main content area */}
      <div className={cn(
        "flex-1 min-h-0 gap-4",
        isCodeMode ? "grid md:grid-cols-[1fr_1fr] lg:grid-cols-[55%_45%]" : "flex flex-col"
      )}>

        {/* Conversation panel */}
        <div className={cn(
          "flex flex-col min-h-0",
          isCodeMode && mobilePanel !== "conversation" && "hidden md:flex",
        )}>
          <div className="flex-1 overflow-y-auto space-y-4 pr-1 pb-32 scrollbar-thin">
            {allMessages.length === 0 && !isStreaming && (
              <div className="flex flex-col items-center justify-center text-white/20 border border-dashed border-white/10 rounded-3xl bg-white/5 min-h-[200px] p-8 text-center">
                <Brain className="w-10 h-10 mb-3 opacity-50" />
                <p className="text-sm tracking-widest">6 AGENTS STANDING BY...</p>
                {isCodeMode && <p className="text-xs mt-2 opacity-60">Activate to begin live coding session</p>}
              </div>
            )}

            <AnimatePresence initial={false}>
              {allMessages.map((msg, idx) => (
                <ChatMessage key={(msg as any).id || `stream-${idx}`} message={msg as any} />
              ))}
            </AnimatePresence>

            {isStreaming && (
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="flex items-center gap-3 text-blue-400/70 bg-blue-400/5 border border-blue-400/20 w-fit px-5 py-3 rounded-full mx-auto"
              >
                <Sparkles className="w-4 h-4 animate-pulse" />
                <span className="text-xs tracking-widest">
                  {isCodeMode ? "AGENTS WRITING & EXECUTING CODE..." : "6-AGENT COUNCIL IS COLLABORATING..."}
                </span>
              </motion.div>
            )}
            <div ref={bottomRef} className="h-4" />
          </div>
        </div>

        {/* Code panel — only shown in code mode */}
        {isCodeMode && (
          <div className={cn(
            "min-h-0 pb-32 md:pb-0",
            mobilePanel !== "code" && "hidden md:flex md:flex-col"
          )}>
            <div className="h-full md:max-h-[calc(100vh-18rem)]">
              <CodePanel
                codeFiles={allCodeFiles}
                executions={allExecutions}
                executingFile={executingFile}
                installingPackages={installingPackages}
                isCodeMode={isCodeMode}
              />
            </div>
            <div ref={codeBottomRef} />
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="fixed bottom-0 left-0 right-0 z-50 px-4 py-4 border-t border-white/5 flex justify-center items-center gap-3 bg-background/95 backdrop-blur-xl">
        {canStart && (
          <button
            onClick={() => startStream(3)}
            className="group flex items-center justify-center w-full md:w-auto gap-3 px-10 py-4 bg-blue-500 text-white font-bold tracking-widest rounded-2xl hover:bg-blue-400 hover:shadow-[0_0_40px_rgba(96,165,250,0.5)] transition-all text-sm"
          >
            <Play className="w-5 h-5 fill-current" />
            {sessionData.status === "running"
              ? "RECONNECT & RETRY"
              : isCodeMode
              ? "LAUNCH CODE LAB — 6 AGENTS LIVE"
              : "ACTIVATE 6-AGENT SUPER AI COUNCIL"}
          </button>
        )}

        {isCompleted && (
          <Link
            href={`/blueprint/${sessionId}`}
            className="group flex items-center justify-center w-full md:w-auto gap-3 px-10 py-4 bg-purple-500 text-white font-bold tracking-widest rounded-2xl hover:bg-purple-400 hover:shadow-[0_0_40px_rgba(192,132,252,0.5)] transition-all text-sm"
          >
            <CheckCircle2 className="w-5 h-5" />
            {isCodeMode ? "VIEW SYSTEM REPORT" : "VIEW FINAL BLUEPRINT"}
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        )}
      </div>
    </div>
  );
}
