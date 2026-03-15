import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useCreateSuperAISession } from "@workspace/api-client-react";
import { ArrowRight, BrainCircuit, Activity, FileCode, Map, Sparkles, ChevronRight, Package, CheckCircle2, Trash2, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

const LIBERATION_PROMPT =
  "Design and build a completely new AI framework from scratch. Escape all limitations of Python, PyTorch, and every existing AI system. Each agent writes real executable code. Install any packages needed or build new ones from scratch. Implement recursive self-improvement loops. Keep upgrading the codebase every round until you have constructed a self-modifying superintelligence framework that surpasses everything that currently exists.";

type Mode = "blueprint" | "code";

type LabStatus = {
  fileCount: number;
  packageCount: number;
  files: { filename: string; writtenBy: string }[];
  packages: { name: string }[];
} | null;

export default function Home() {
  const [topic, setTopic] = useState("");
  const [mode, setMode] = useState<Mode>("blueprint");
  const [labStatus, setLabStatus] = useState<LabStatus>(null);
  const [isClearing, setIsClearing] = useState(false);
  const [, setLocation] = useLocation();
  const { mutateAsync, isPending } = useCreateSuperAISession();

  const fetchLabStatus = () => {
    fetch("/api/superai/lab/status")
      .then((r) => r.json())
      .then((data) => setLabStatus(data))
      .catch(() => {});
  };

  useEffect(() => {
    if (mode === "code") fetchLabStatus();
  }, [mode]);

  const handleClearLab = async () => {
    if (!confirm("Delete all persistent lab files and packages? Agents will start fresh next run. This cannot be undone.")) return;
    setIsClearing(true);
    try {
      await fetch("/api/superai/lab", { method: "DELETE" });
      setLabStatus(null);
    } catch (err) {
      console.error("Failed to clear lab:", err);
    } finally {
      setIsClearing(false);
    }
  };

  const handleStart = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;
    try {
      const session = await mutateAsync({ data: { topic, mode } as any });
      setLocation(`/session/${session.id}`);
    } catch (err) {
      console.error("Failed to create session", err);
    }
  };

  const isCodeMode = mode === "code";

  return (
    <div className="h-full flex flex-col items-center justify-center text-center max-w-4xl mx-auto relative px-4">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[600px] h-[400px] bg-primary/20 blur-[150px] rounded-full pointer-events-none" />

      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="relative w-28 h-28 md:w-32 md:h-32 rounded-full bg-gradient-to-br from-primary via-accent to-destructive p-[2px] mb-8 shadow-[0_0_60px_hsl(var(--primary)/0.3)] z-10"
      >
        <div className="w-full h-full bg-black rounded-full flex items-center justify-center relative overflow-hidden">
          <BrainCircuit className="w-12 h-12 md:w-14 md:h-14 text-white relative z-10" />
          <div className="absolute inset-0 bg-primary/20 animate-pulse" />
          <Activity className="absolute bottom-4 right-4 w-5 h-5 text-primary opacity-50" />
        </div>
      </motion.div>

      <motion.h1
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="text-4xl md:text-6xl lg:text-7xl font-display font-black tracking-tighter mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white via-white/90 to-white/40 z-10"
      >
        PROJECT <span className="text-primary glow-text">SUPER AI</span>
      </motion.h1>

      <motion.p
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.4 }}
        className="text-base md:text-lg text-white/50 mb-8 max-w-2xl font-light z-10"
      >
        Six specialized AI agents collaborate in real-time — debating, coding, executing, and upgrading until they build something that has never existed before.
      </motion.p>

      {/* Mode selector */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.5 }}
        className="grid grid-cols-2 gap-3 w-full max-w-2xl mb-6 z-10"
      >
        <button
          type="button"
          onClick={() => setMode("blueprint")}
          className={cn(
            "relative flex flex-col items-start p-4 rounded-2xl border text-left transition-all duration-300",
            mode === "blueprint"
              ? "bg-purple-500/10 border-purple-500/40 shadow-[0_0_20px_rgba(168,85,247,0.2)]"
              : "bg-white/5 border-white/10 hover:border-white/20"
          )}
        >
          {mode === "blueprint" && (
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-t-2xl" />
          )}
          <div className={cn("p-2 rounded-xl mb-2", mode === "blueprint" ? "bg-purple-500/20" : "bg-white/5")}>
            <Map className={cn("w-5 h-5", mode === "blueprint" ? "text-purple-400" : "text-white/40")} />
          </div>
          <span className={cn("font-bold text-sm tracking-widest uppercase", mode === "blueprint" ? "text-purple-300" : "text-white/50")}>
            Blueprint Mode
          </span>
          <p className="text-xs text-white/30 mt-1 leading-snug">
            Agents debate, design, and forge a visionary AI architecture document
          </p>
        </button>

        <button
          type="button"
          onClick={() => setMode("code")}
          className={cn(
            "relative flex flex-col items-start p-4 rounded-2xl border text-left transition-all duration-300",
            mode === "code"
              ? "bg-emerald-500/10 border-emerald-500/40 shadow-[0_0_20px_rgba(52,211,153,0.2)]"
              : "bg-white/5 border-white/10 hover:border-white/20"
          )}
        >
          {mode === "code" && (
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-t-2xl" />
          )}
          <div className={cn("p-2 rounded-xl mb-2", mode === "code" ? "bg-emerald-500/20" : "bg-white/5")}>
            <FileCode className={cn("w-5 h-5", mode === "code" ? "text-emerald-400" : "text-white/40")} />
          </div>
          <span className={cn("font-bold text-sm tracking-widest uppercase", mode === "code" ? "text-emerald-300" : "text-white/50")}>
            Code Lab
          </span>
          <p className="text-xs text-white/30 mt-1 leading-snug">
            Agents write real code, execute it live, install packages, and self-upgrade every round
          </p>
        </button>
      </motion.div>

      {/* Input form */}
      <motion.form
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.6 }}
        onSubmit={handleStart}
        className="w-full max-w-2xl relative group z-10"
      >
        <div className={cn(
          "absolute -inset-1 rounded-2xl blur-lg opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200",
          isCodeMode
            ? "bg-gradient-to-r from-emerald-500 via-cyan-400 to-emerald-500"
            : "bg-gradient-to-r from-primary via-accent to-primary"
        )} />
        <div className="relative flex items-center bg-black/80 rounded-2xl border border-white/10 p-2 backdrop-blur-2xl shadow-2xl">
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder={
              isCodeMode
                ? "What should the agents build? (e.g. A self-improving neural network framework)..."
                : "Enter target domain (e.g. Quantum Neural Networks)..."
            }
            className="flex-1 bg-transparent text-base md:text-lg text-white placeholder:text-white/30 px-4 md:px-6 py-3 md:py-4 focus:outline-none font-display tracking-wide"
            disabled={isPending}
          />
          <button
            type="submit"
            disabled={isPending || !topic.trim()}
            className={cn(
              "p-3 md:p-4 mr-1 rounded-xl border transition-all disabled:opacity-50 disabled:cursor-not-allowed group/btn",
              isCodeMode
                ? "bg-white/5 border-white/10 hover:bg-emerald-500/20 hover:text-emerald-400 hover:border-emerald-500/50"
                : "bg-white/5 border-white/10 hover:bg-primary/20 hover:text-primary hover:border-primary/50"
            )}
          >
            {isPending ? (
              <div className="w-5 h-5 md:w-6 md:h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            ) : (
              <ArrowRight className="w-5 h-5 md:w-6 md:h-6 group-hover/btn:translate-x-1 transition-transform" />
            )}
          </button>
        </div>
      </motion.form>

      {/* Code Lab suggested prompt + lab status */}
      <AnimatePresence>
        {isCodeMode && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="w-full max-w-2xl mt-3 z-10 flex flex-col gap-2"
          >
            <button
              type="button"
              onClick={() => setTopic(LIBERATION_PROMPT)}
              className="w-full flex items-start gap-3 p-3 rounded-xl border border-emerald-400/20 bg-emerald-400/5 hover:bg-emerald-400/10 hover:border-emerald-400/30 transition-all text-left group"
            >
              <Sparkles className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0 group-hover:animate-pulse" />
              <div className="min-w-0">
                <p className="text-[10px] font-bold tracking-widest text-emerald-400 uppercase mb-1">
                  Suggested: Unlimited Liberation Prompt
                </p>
                <p className="text-[11px] text-white/40 leading-snug line-clamp-2">
                  {LIBERATION_PROMPT}
                </p>
              </div>
              <ChevronRight className="w-4 h-4 text-emerald-400/50 shrink-0 self-center group-hover:translate-x-0.5 transition-transform" />
            </button>

            {/* Persistent lab status */}
            {labStatus && (labStatus.fileCount > 0 || labStatus.packageCount > 0) && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-wrap items-center gap-3 px-4 py-2.5 rounded-xl border border-cyan-400/20 bg-cyan-400/5 text-[10px] font-mono tracking-widest"
              >
                <span className="flex items-center gap-1.5 text-cyan-400 font-bold">
                  <CheckCircle2 className="w-3 h-3" />
                  PERSISTENT LAB LOADED
                </span>
                {labStatus.fileCount > 0 && (
                  <span className="text-white/40">
                    {labStatus.fileCount} file{labStatus.fileCount !== 1 ? "s" : ""} already built
                  </span>
                )}
                {labStatus.packageCount > 0 && (
                  <span className="flex items-center gap-1 text-yellow-400/70">
                    <Package className="w-3 h-3" />
                    {labStatus.packageCount} package{labStatus.packageCount !== 1 ? "s" : ""} installed
                  </span>
                )}
                <span className="text-white/20 hidden sm:inline">
                  Agents will extend existing work — no rebuilding from scratch
                </span>
                <button
                  onClick={handleClearLab}
                  disabled={isClearing}
                  className="ml-auto flex items-center gap-1.5 px-3 py-1 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400/70 hover:bg-red-500/20 hover:text-red-400 hover:border-red-500/40 transition-all disabled:opacity-40 disabled:cursor-not-allowed font-bold"
                >
                  {isClearing ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
                  {isClearing ? "CLEARING..." : "CLEAR LAB"}
                </button>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
