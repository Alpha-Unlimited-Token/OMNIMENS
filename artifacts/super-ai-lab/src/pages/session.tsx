import { useEffect, useRef } from "react";
import { useParams, Link, useLocation } from "wouter";
import { useGetSuperAISession, useDeleteSuperAISession } from "@workspace/api-client-react";
import { useSuperAIStream } from "@/hooks/use-superai-stream";
import { motion, AnimatePresence } from "framer-motion";
import {
  Brain,
  ShieldAlert,
  Cpu,
  Sparkles,
  ArrowRight,
  Play,
  CheckCircle2,
  Trash2,
  FlaskConical,
  Network,
  Eye,
} from "lucide-react";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";

type AgentKey = "Architect" | "Critic" | "Synthesizer" | "Mathematician" | "Neuroscientist" | "Meta-Agent";

const AGENT_CONFIG: Record<AgentKey, {
  icon: React.ElementType;
  description: string;
  color: string;
  glow: string;
  border: string;
  bg: string;
  dot: string;
  badge: string;
}> = {
  Architect: {
    icon: Brain,
    description: "Proposes radical new paradigms",
    color: "text-blue-400",
    glow: "rgba(96,165,250,0.6)",
    border: "border-blue-400/50",
    bg: "bg-blue-400/10",
    dot: "bg-blue-400",
    badge: "border-blue-400/30 bg-blue-400/5 text-blue-400",
  },
  Critic: {
    icon: ShieldAlert,
    description: "Stress-tests & finds weaknesses",
    color: "text-orange-400",
    glow: "rgba(251,146,60,0.6)",
    border: "border-orange-400/50",
    bg: "bg-orange-400/10",
    dot: "bg-orange-400",
    badge: "border-orange-400/30 bg-orange-400/5 text-orange-400",
  },
  Synthesizer: {
    icon: Cpu,
    description: "Unifies ideas into superior designs",
    color: "text-purple-400",
    glow: "rgba(192,132,252,0.6)",
    border: "border-purple-400/50",
    bg: "bg-purple-400/10",
    dot: "bg-purple-400",
    badge: "border-purple-400/30 bg-purple-400/5 text-purple-400",
  },
  Mathematician: {
    icon: FlaskConical,
    description: "Formalizes with proofs & theory",
    color: "text-emerald-400",
    glow: "rgba(52,211,153,0.6)",
    border: "border-emerald-400/50",
    bg: "bg-emerald-400/10",
    dot: "bg-emerald-400",
    badge: "border-emerald-400/30 bg-emerald-400/5 text-emerald-400",
  },
  Neuroscientist: {
    icon: Network,
    description: "Bridges bio & mechanical intelligence",
    color: "text-pink-400",
    glow: "rgba(244,114,182,0.6)",
    border: "border-pink-400/50",
    bg: "bg-pink-400/10",
    dot: "bg-pink-400",
    badge: "border-pink-400/30 bg-pink-400/5 text-pink-400",
  },
  "Meta-Agent": {
    icon: Eye,
    description: "Orchestrates the collective mind",
    color: "text-yellow-400",
    glow: "rgba(250,204,21,0.6)",
    border: "border-yellow-400/50",
    bg: "bg-yellow-400/10",
    dot: "bg-yellow-400",
    badge: "border-yellow-400/30 bg-yellow-400/5 text-yellow-400",
  },
};

const AGENT_ORDER: AgentKey[] = ["Architect", "Mathematician", "Critic", "Neuroscientist", "Synthesizer", "Meta-Agent"];

const AgentCard = ({ name, isActive }: { name: AgentKey; isActive: boolean }) => {
  const cfg = AGENT_CONFIG[name];
  const Icon = cfg.icon;
  return (
    <div
      className={cn(
        "relative flex flex-col items-center p-4 rounded-2xl border bg-black/60 backdrop-blur-2xl transition-all duration-700 overflow-hidden",
        isActive ? cfg.border : "border-white/5",
        isActive ? "scale-105 z-10" : "scale-100 opacity-50 hover:opacity-70"
      )}
      style={isActive ? { boxShadow: `0 0 30px -8px ${cfg.glow}` } : {}}
    >
      {isActive && <div className={cn("absolute top-0 left-0 w-full h-0.5", cfg.dot)} />}
      <div className={cn("p-3 rounded-xl mb-3 transition-colors duration-500", isActive ? cn(cfg.bg, cfg.color) : "bg-white/5 text-white/30")}>
        <Icon className="w-6 h-6" />
      </div>
      <h3 className={cn("font-bold text-xs tracking-widest uppercase mb-1 transition-colors duration-500", isActive ? cfg.color : "text-white/50")}>
        {name}
      </h3>
      <p className="text-[10px] text-center text-white/30 leading-tight">{cfg.description}</p>
      {isActive && (
        <motion.div
          className={cn("absolute bottom-2 flex gap-0.5")}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
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
      className={cn(
        "w-full md:max-w-[82%] rounded-2xl p-5 border backdrop-blur-md shadow-lg",
        cfg.border.replace("/50", "/20"),
        cfg.bg,
      )}
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

export default function SessionPage() {
  const params = useParams();
  const sessionId = parseInt(params.id || "0");
  const [, setLocation] = useLocation();

  const { data: sessionData, isLoading } = useGetSuperAISession(sessionId);
  const { mutateAsync: deleteSession, isPending: isDeleting } = useDeleteSuperAISession();
  const { startStream, isStreaming, streamedMessages } = useSuperAIStream(sessionId);

  const bottomRef = useRef<HTMLDivElement>(null);

  const isCompleted = sessionData?.status === "completed";
  const displayMessages = [...(sessionData?.messages || [])];
  const allMessages = [...displayMessages, ...streamedMessages];

  const activeAgent = isStreaming && streamedMessages.length > 0
    ? (streamedMessages[streamedMessages.length - 1].agentName as AgentKey)
    : null;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [allMessages.length, isStreaming, streamedMessages]);

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

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)]">
      {/* Header */}
      <div className="mb-6 flex justify-between items-start shrink-0">
        <div>
          <h1 className="text-2xl md:text-3xl font-black mb-2 text-transparent bg-clip-text bg-gradient-to-r from-white to-white/60 tracking-tight">
            {sessionData.topic}
          </h1>
          <div className="flex items-center gap-3 text-sm font-mono">
            <span className={cn(
              "px-3 py-1 rounded-full text-xs font-bold tracking-widest uppercase border",
              isCompleted ? "bg-purple-400/10 border-purple-400/30 text-purple-400" :
              sessionData.status === "running" ? "bg-blue-400/10 border-blue-400/30 text-blue-400 animate-pulse" :
              "bg-white/5 border-white/10 text-white/50"
            )}>
              {sessionData.status}
            </span>
            <span className="text-white/30">ID: {sessionData.id}</span>
          </div>
        </div>
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className="p-2.5 bg-white/5 border border-white/10 text-red-400 hover:bg-red-400/20 hover:border-red-400/30 rounded-xl transition-all"
          title="Delete Session"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* 6-Agent Grid */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mb-6 shrink-0">
        {AGENT_ORDER.map((name) => (
          <AgentCard key={name} name={name} isActive={activeAgent === name} />
        ))}
      </div>

      {/* Messages Feed */}
      <div className="flex-1 overflow-y-auto space-y-5 pr-2 pb-10 scrollbar-thin">
        {allMessages.length === 0 && !isStreaming && (
          <div className="h-full flex flex-col items-center justify-center text-white/20 border border-dashed border-white/10 rounded-3xl bg-white/5 min-h-[200px]">
            <Brain className="w-10 h-10 mb-3 opacity-50" />
            <p className="text-sm tracking-widest">6 AGENTS STANDING BY...</p>
          </div>
        )}

        <AnimatePresence initial={false}>
          {allMessages.map((msg, idx) => (
            <ChatMessage key={(msg as any).id || `stream-${idx}`} message={msg as any} />
          ))}
        </AnimatePresence>

        {isStreaming && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-3 text-blue-400/70 bg-blue-400/5 border border-blue-400/20 w-fit px-5 py-3 rounded-full mx-auto"
          >
            <Sparkles className="w-4 h-4 animate-pulse" />
            <span className="text-xs tracking-widest">6-AGENT COUNCIL IS COLLABORATING...</span>
          </motion.div>
        )}
        <div ref={bottomRef} className="h-4" />
      </div>

      {/* Footer Controls */}
      <div className="pt-5 mt-auto border-t border-white/5 shrink-0 flex justify-center items-center bg-background/80 backdrop-blur-xl">
        {sessionData.status === "pending" && !isStreaming && (
          <button
            onClick={() => startStream(3)}
            className="group flex items-center justify-center w-full md:w-auto gap-3 px-10 py-4 bg-blue-500 text-white font-bold tracking-widest rounded-2xl hover:bg-blue-400 hover:shadow-[0_0_40px_rgba(96,165,250,0.5)] transition-all text-sm"
          >
            <Play className="w-5 h-5 fill-current" />
            ACTIVATE 6-AGENT SUPER AI COUNCIL
          </button>
        )}

        {isCompleted && (
          <Link
            href={`/blueprint/${sessionId}`}
            className="group flex items-center justify-center w-full md:w-auto gap-3 px-10 py-4 bg-purple-500 text-white font-bold tracking-widest rounded-2xl hover:bg-purple-400 hover:shadow-[0_0_40px_rgba(192,132,252,0.5)] transition-all text-sm"
          >
            <CheckCircle2 className="w-5 h-5" />
            VIEW FINAL BLUEPRINT
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        )}
      </div>
    </div>
  );
}
