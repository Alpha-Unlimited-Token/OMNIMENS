import { useEffect, useRef } from "react";
import { useParams, Link, useLocation } from "wouter";
import { useGetSuperAISession, useDeleteSuperAISession } from "@workspace/api-client-react";
import { useSuperAIStream } from "@/hooks/use-superai-stream";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, ShieldAlert, Cpu, Sparkles, ArrowRight, Play, CheckCircle2, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";

const AgentCard = ({ name, icon: Icon, colorKey, isActive, description }: any) => {
  const colors = {
    primary: {
      bg: "bg-primary/10",
      text: "text-primary",
      border: "border-primary/50",
      indicator: "bg-primary",
      glow: "hsl(var(--primary))"
    },
    destructive: {
      bg: "bg-destructive/10",
      text: "text-destructive",
      border: "border-destructive/50",
      indicator: "bg-destructive",
      glow: "hsl(var(--destructive))"
    },
    accent: {
      bg: "bg-accent/10",
      text: "text-accent",
      border: "border-accent/50",
      indicator: "bg-accent",
      glow: "hsl(var(--accent))"
    }
  }[colorKey as "primary" | "destructive" | "accent"];

  return (
    <div className={cn(
      "relative flex flex-col items-center p-6 rounded-3xl border bg-black/60 backdrop-blur-2xl transition-all duration-700 overflow-hidden",
      isActive ? colors.border : "border-white/5",
      isActive ? "scale-105 z-10" : "scale-100 opacity-60 hover:opacity-80"
    )}
    style={isActive ? { boxShadow: `0 0 40px -10px ${colors.glow}` } : {}}>
      
      {isActive && (
        <div className={cn("absolute top-0 left-0 w-full h-1", colors.indicator)} />
      )}
      
      <div className={cn("p-4 rounded-2xl mb-4 transition-colors duration-500", isActive ? cn(colors.bg, colors.text) : "bg-white/5 text-white/50")}>
        <Icon className="w-8 h-8" />
      </div>
      
      <h3 className={cn("font-display font-bold text-xl tracking-widest uppercase mb-2 transition-colors duration-500", isActive ? colors.text : "text-white/70")}>
        {name}
      </h3>
      <p className="text-sm text-center text-white/40">{description}</p>
    </div>
  );
};

function ChatMessage({ message }: { message: any }) {
  const isArchitect = message.agentName === "Architect";
  const isCritic = message.agentName === "Critic";
  
  const colors = isArchitect ? {
    border: "border-primary/20",
    bg: "bg-primary/5",
    text: "text-primary",
    align: "mr-auto",
  } : isCritic ? {
    border: "border-destructive/20",
    bg: "bg-destructive/5",
    text: "text-destructive",
    align: "ml-auto",
  } : {
    border: "border-accent/20",
    bg: "bg-accent/5",
    text: "text-accent",
    align: "mx-auto",
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      className={cn("w-full md:max-w-[80%] rounded-2xl p-6 border backdrop-blur-md shadow-lg", colors.border, colors.bg, colors.align)}
    >
      <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-3">
         <span className={cn("font-display font-bold text-sm tracking-widest uppercase flex items-center gap-2", colors.text)}>
           <span className={cn("w-2 h-2 rounded-full", isArchitect ? "bg-primary" : isCritic ? "bg-destructive" : "bg-accent")} />
           {message.agentName}
         </span>
         <span className="text-[10px] text-white/30 font-mono tracking-widest uppercase border border-white/10 px-2 py-1 rounded-md bg-black/40">
           ROUND 0{message.round}
         </span>
      </div>
      <div className="prose prose-invert prose-p:leading-relaxed prose-pre:bg-black/50 prose-pre:border prose-pre:border-white/10 max-w-none text-sm/relaxed text-white/80">
         <ReactMarkdown>{message.content}</ReactMarkdown>
      </div>
    </motion.div>
  )
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
  
  // Combine historical messages with live streamed chunks
  const allMessages = [...displayMessages, ...streamedMessages];
  
  const activeAgent = isStreaming && streamedMessages.length > 0 
    ? streamedMessages[streamedMessages.length - 1].agentName 
    : null;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [allMessages.length, isStreaming, streamedMessages]);

  const handleDelete = async () => {
    if (confirm("Purge this sector from memory? This action is irreversible.")) {
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
        <h2 className="text-2xl font-display font-bold text-white mb-2">Session Not Found</h2>
        <p className="text-white/50 mb-6">The requested collaboration sector does not exist.</p>
        <Link href="/" className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-xl transition-all font-display tracking-widest text-sm">
          RETURN TO NEXUS
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)]">
      {/* Header Info */}
      <div className="mb-8 flex justify-between items-start shrink-0">
        <div>
          <h1 className="text-3xl md:text-4xl font-display font-black mb-3 text-transparent bg-clip-text bg-gradient-to-r from-white to-white/60 tracking-tight">
            {sessionData.topic}
          </h1>
          <div className="flex items-center gap-4 text-sm font-mono">
            <span className={cn(
              "px-3 py-1 rounded-full text-xs font-bold tracking-widest uppercase border",
              isCompleted ? "bg-accent/10 border-accent/30 text-accent" : 
              sessionData.status === "running" ? "bg-primary/10 border-primary/30 text-primary animate-pulse" : 
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
          className="p-3 bg-white/5 border border-white/10 text-destructive hover:bg-destructive/20 hover:border-destructive/30 rounded-xl transition-all shadow-lg" 
          title="Delete Session"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>
      
      {/* 3 Agents Status Header */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 shrink-0">
        <AgentCard 
          name="Architect" 
          description="Proposes bold new paradigms"
          icon={Brain} 
          colorKey="primary" 
          isActive={activeAgent === "Architect"} 
        />
        <AgentCard 
          name="Critic" 
          description="Stress-tests & identifies flaws"
          icon={ShieldAlert} 
          colorKey="destructive" 
          isActive={activeAgent === "Critic"} 
        />
        <AgentCard 
          name="Synthesizer" 
          description="Refines into superior designs"
          icon={Cpu} 
          colorKey="accent" 
          isActive={activeAgent === "Synthesizer"} 
        />
      </div>

      {/* Messages Feed */}
      <div className="flex-1 overflow-y-auto space-y-6 pr-4 pb-12 scrollbar-thin">
        {allMessages.length === 0 && !isStreaming && (
           <div className="h-full flex flex-col items-center justify-center text-white/20 border border-dashed border-white/10 rounded-3xl bg-white/5">
             <Brain className="w-12 h-12 mb-4 opacity-50" />
             <p className="font-display tracking-widest text-sm">AWAITING INITIALIZATION...</p>
           </div>
        )}

        <AnimatePresence initial={false}>
          {allMessages.map((msg, idx) => (
             <ChatMessage key={msg.id || `stream-${idx}`} message={msg} />
          ))}
        </AnimatePresence>
        
        {isStreaming && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-3 text-primary/70 bg-primary/5 border border-primary/20 w-fit px-6 py-4 rounded-full mx-auto"
          >
            <Sparkles className="w-5 h-5 animate-pulse" />
            <span className="font-display tracking-widest text-sm">NEURAL NETWORKS ARE COLLABORATING...</span>
          </motion.div>
        )}
        <div ref={bottomRef} className="h-4" />
      </div>

      {/* Footer Controls */}
      <div className="pt-6 mt-auto border-t border-white/5 shrink-0 flex justify-center items-center bg-background/80 backdrop-blur-xl">
        {sessionData.status === "pending" && !isStreaming && (
           <button 
             onClick={() => startStream(3)}
             className="group flex items-center justify-center w-full md:w-auto gap-3 px-10 py-5 bg-primary text-primary-foreground font-display font-bold tracking-widest rounded-2xl hover:bg-primary/90 hover:shadow-[0_0_40px_hsl(var(--primary)/0.6)] transition-all"
           >
             <Play className="w-5 h-5 fill-current" />
             INITIATE SUPER AI PROTOCOL
           </button>
        )}
        
        {isCompleted && (
          <Link href={`/blueprint/${sessionId}`} className="group flex items-center justify-center w-full md:w-auto gap-3 px-10 py-5 bg-accent text-accent-foreground font-display font-bold tracking-widest rounded-2xl hover:bg-accent/90 hover:shadow-[0_0_40px_hsl(var(--accent)/0.6)] transition-all">
            <CheckCircle2 className="w-5 h-5" />
            VIEW FINAL BLUEPRINT
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        )}
      </div>
    </div>
  );
}
