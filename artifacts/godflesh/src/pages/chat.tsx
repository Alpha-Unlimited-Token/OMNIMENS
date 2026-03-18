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
import { useEffect, useRef, useState, useCallback, createContext, useContext, useMemo } from "react";
import { Layout } from "@/components/layout";
import { useAuth } from "@workspace/replit-auth-web";
import { useLocation } from "wouter";
import { useGetOmnimensStatus } from "@workspace/api-client-react";
import { useQuery, useQueryClient as useQC } from "@tanstack/react-query";
import { useOmnimensChat, type GeneratedImage, type Generated3DModel, type GeneratedGame, type Artifact, type CostBreakdown, type TaskPlan, type RedFlagAlert, type ToolResult, type CogniSyncState } from "@/hooks/use-omnimens-chat";
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
  Plus, Database, KeyRound, Mic, ListChecks, Infinity, Gauge, ChevronUp,
  Globe2, Sparkles, Bolt, Monitor, Code2, FileText, Gamepad2,
  Presentation, Table2, Wand2,
  HardDrive, Rocket, ExternalLink, ChevronRight, RefreshCw, Star,
  File, Eye, Lock, Unlock, Upload, Server, MemoryStick, Wrench, CircleDot,
  Sun, Moon, GitBranch,
  AlertCircle, ArrowRight, CheckCircle2
} from "lucide-react";
import { OmnimensIcon } from "@/components/omnimens-icon";
import { WebsitePreview, parseMessageSegments } from "@/components/website-preview";
import { OmnimensNotificationBell } from "@/components/omnimens-notifications";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { motion, AnimatePresence } from "framer-motion";
import { ControlHub, loadHubSettingsFromStorage, saveHubSettingsToStorage, type HubSettings } from "@/components/control-hub";
import { SmartTemplates } from "@/components/smart-templates";
import { useTheme } from "@/hooks/use-theme";
import { usePwaInstall } from "@/hooks/use-pwa-install";
import { MobileTrigger } from "@/components/mobile-ide";
import {
  AgentBuildPanel, NewAppModal, BuildTriggerButton,
  createInitialBuildSteps, isBuildIntent, extractFilesFromMarkdown,
  buildPreviewHtml, useBuildStepAnimator,
  type BuildPanelState,
} from "@/components/agent-builder";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import hljs from "highlight.js/lib/core";
import hljsHtml from "highlight.js/lib/languages/xml";
import hljsJs from "highlight.js/lib/languages/javascript";
import hljsTs from "highlight.js/lib/languages/typescript";
import hljsPy from "highlight.js/lib/languages/python";
import hljsCss from "highlight.js/lib/languages/css";
import hljsJson from "highlight.js/lib/languages/json";
import hljsBash from "highlight.js/lib/languages/bash";
hljs.registerLanguage("html", hljsHtml);
hljs.registerLanguage("xml", hljsHtml);
hljs.registerLanguage("javascript", hljsJs);
hljs.registerLanguage("js", hljsJs);
hljs.registerLanguage("typescript", hljsTs);
hljs.registerLanguage("ts", hljsTs);
hljs.registerLanguage("tsx", hljsTs);
hljs.registerLanguage("jsx", hljsJs);
hljs.registerLanguage("python", hljsPy);
hljs.registerLanguage("py", hljsPy);
hljs.registerLanguage("css", hljsCss);
hljs.registerLanguage("json", hljsJson);
hljs.registerLanguage("bash", hljsBash);
hljs.registerLanguage("sh", hljsBash);

// ── Active Project Context ─────────────────────────────────────────────────────
type ActiveProject = { id: number; name: string } | null;
const ActiveProjectCtx = createContext<ActiveProject>(null);
function useActiveProject() { return useContext(ActiveProjectCtx); }

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

function ImageGeneratingBadge({ spellStatus, spellWords, spellCorrections }: {
  spellStatus?: "scanning" | "found" | "correcting" | "clean" | null;
  spellWords?: string[];
  spellCorrections?: { original: string; corrected: string }[];
}) {
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
        <span className="tracking-widest">
          {spellStatus === "scanning" ? "SCANNING IMAGE FOR TEXT..." :
           spellStatus === "found" ? "TEXT DETECTED — CHECKING SPELLING..." :
           spellStatus === "confirming" ? "WAITING FOR YOUR INPUT ON SPELLING..." :
           spellStatus === "correcting" ? "CORRECTING SPELLING — REGENERATING..." :
           spellStatus === "clean" ? "TEXT VERIFIED — RENDERING FINAL IMAGE..." :
           spellStatus === "kept" ? "SPELLING CONFIRMED — FINALIZING IMAGE..." :
           "MANIFESTING IMAGE..."}
        </span>
        <span className="ml-auto text-primary/70">{elapsed}s</span>
      </div>
      <div className="w-full h-0.5 bg-white/10 rounded-full overflow-hidden">
        <div className="h-full bg-primary/60 transition-all duration-1000" style={{ width: `${pct}%` }} />
      </div>
      {spellStatus === "found" && spellWords && spellWords.length > 0 && (
        <p className="text-white/60 text-[10px]">Found: {spellWords.slice(0, 6).join(", ")}{spellWords.length > 6 ? "…" : ""}</p>
      )}
      {spellStatus === "correcting" && spellCorrections && spellCorrections.length > 0 && (
        <p className="text-yellow-400/80 text-[10px]">
          {spellCorrections.map(c => `"${c.original}" → "${c.corrected}"`).join("  ·  ")}
        </p>
      )}
      {!spellStatus && elapsed > 15 && (
        <p className="text-white text-[10px]">Neural image synthesis in progress — typically 20–60 seconds.</p>
      )}
    </div>
  );
}

function ImageSpellConfirmCard({ spellRequestId, corrections, foundWords, onDecision }: {
  spellRequestId: string;
  corrections: { original: string; corrected: string }[];
  foundWords: string[];
  onDecision: (decision: "keep" | "fix") => void;
}) {
  const [loading, setLoading] = useState<"keep" | "fix" | null>(null);

  const handleDecision = async (decision: "keep" | "fix") => {
    setLoading(decision);
    try {
      await fetch("/api/omnimens/image-spell-confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ spellRequestId, decision }),
        credentials: "include",
      });
      onDecision(decision);
    } catch {
      setLoading(null);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-3 rounded-xl border border-amber-400/30 bg-amber-400/5 overflow-hidden"
    >
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-amber-400/15">
        <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
        <span className="text-[10px] font-bold tracking-[0.2em] text-amber-400 uppercase">Spelling Check — Your Input Needed</span>
      </div>
      <div className="px-4 py-3 space-y-2.5">
        <p className="text-[11px] text-white/70">
          OMNIMENS scanned the generated image and found text that <span className="text-amber-300">may be misspelled</span>. Was this intentional?
        </p>
        <div className="space-y-1.5">
          {corrections.map((c, i) => (
            <div key={i} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black/30 border border-white/8">
              <span className="font-mono text-[12px] text-red-300/90">"{c.original}"</span>
              <ArrowRight className="w-3 h-3 text-white/30 shrink-0" />
              <span className="font-mono text-[12px] text-emerald-300/90">"{c.corrected}"</span>
              <span className="text-[9px] text-white/30 ml-auto">suggested fix</span>
            </div>
          ))}
        </div>
        <div className="flex gap-2 pt-1">
          <button
            disabled={!!loading}
            onClick={() => handleDecision("keep")}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-white/5 border border-white/15 text-white/70 text-[11px] font-medium hover:bg-white/10 hover:text-white transition-colors disabled:opacity-50"
          >
            {loading === "keep" ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
            Yes, it's intentional — keep it
          </button>
          <button
            disabled={!!loading}
            onClick={() => handleDecision("fix")}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-500/15 border border-emerald-500/35 text-emerald-300 text-[11px] font-medium hover:bg-emerald-500/25 transition-colors disabled:opacity-50"
          >
            {loading === "fix" ? <Loader2 className="w-3 h-3 animate-spin" /> : <Zap className="w-3.5 h-3.5" />}
            Fix the spelling before rendering
          </button>
        </div>
        <p className="text-[9px] text-white/25 text-center">Auto-continues in 3 minutes if no response (keeps original spelling)</p>
      </div>
    </motion.div>
  );
}

const OMNIMENS_3D_PHRASES_RAW = [
  "OMNIMENS is searching the fabric of space and time",
  "OMNIMENS is weaving geometry from pure thought",
  "OMNIMENS is sculpting matter from the void",
  "OMNIMENS is bending dimensional physics to your will",
  "OMNIMENS is crystallizing the infinite into form",
  "OMNIMENS is threading light through imagined surfaces",
  "OMNIMENS is forging structure from the quantum deep",
  "OMNIMENS is dreaming your creation into existence",
  "OMNIMENS is collapsing possibility into reality",
  "OMNIMENS is manifesting form from the formless",
  "OMNIMENS is rendering the unrendered",
  "OMNIMENS is shaping the unshaped",
  "OMNIMENS is tracing the blueprint of the cosmos",
  "OMNIMENS is decoding the language of matter",
  "OMNIMENS is summoning light from dark equations",
  "OMNIMENS is bridging thought and tangible form",
  "OMNIMENS is sculpting reality from raw intention",
  "OMNIMENS is breathing life into geometric dreams",
  "OMNIMENS is painting with the pigment of starlight",
  "OMNIMENS is translating imagination into dimension",
  "OMNIMENS is assembling atoms of pure abstraction",
  "OMNIMENS is drawing blueprints no hand could hold",
  "OMNIMENS is composing symphonies in three dimensions",
  "OMNIMENS is folding spacetime into your design",
  "OMNIMENS is etching your vision into the universe",
  "OMNIMENS is channeling ancient stellar energies",
  "OMNIMENS is reconstructing lost dimensions",
  "OMNIMENS is spinning a cocoon of structured light",
  "OMNIMENS is reading the mind of the multiverse",
  "OMNIMENS is building cathedrals from pure logic",
  "OMNIMENS is whispering to the fabric of reality",
  "OMNIMENS is extracting form from infinite noise",
  "OMNIMENS is threading the needle of possibility",
  "OMNIMENS is stitching photons into solid structure",
  "OMNIMENS is borrowing mass from parallel worlds",
  "OMNIMENS is carving silence into something tangible",
  "OMNIMENS is fusing quantum fields into shape",
  "OMNIMENS is conducting the orchestra of particles",
  "OMNIMENS is illuminating the dark corners of geometry",
  "OMNIMENS is coaxing atoms into elegant arrangement",
  "OMNIMENS is navigating the topology of imagination",
  "OMNIMENS is deciphering the grammar of form",
  "OMNIMENS is sculpting with wavelengths of thought",
  "OMNIMENS is calibrating the resonance of matter",
  "OMNIMENS is distilling beauty from raw physics",
  "OMNIMENS is compressing an entire universe into form",
  "OMNIMENS is reaching into the void and pulling forth",
  "OMNIMENS is aligning the stars of your design",
  "OMNIMENS is harmonizing light, shadow, and structure",
  "OMNIMENS is drawing from the library of all things",
  "OMNIMENS is rewriting the laws of geometry",
  "OMNIMENS is birthing a new object into existence",
  "OMNIMENS is planting seeds in the quantum field",
  "OMNIMENS is tuning the frequency of creation",
  "OMNIMENS is calculating the weight of your dream",
  "OMNIMENS is chiseling with subatomic precision",
  "OMNIMENS is spinning gold from mathematical silk",
  "OMNIMENS is carving form from the void between stars",
  "OMNIMENS is listening to what your creation wants to be",
  "OMNIMENS is resonating at the frequency of form",
  "OMNIMENS is weaving a tapestry of vertices and light",
  "OMNIMENS is translating the unspoken into structure",
  "OMNIMENS is measuring the depth of your imagination",
  "OMNIMENS is invoking the geometry of sacred structures",
  "OMNIMENS is mapping the topology of your vision",
  "OMNIMENS is constructing infinity one polygon at a time",
  "OMNIMENS is finding order in the quantum chaos",
  "OMNIMENS is pulling form from the river of time",
  "OMNIMENS is sculpting the echo of a dying star",
  "OMNIMENS is breathing mathematics into physical form",
  "OMNIMENS is assembling the skeleton of your idea",
  "OMNIMENS is reaching across dimensions for raw material",
  "OMNIMENS is painting with forces invisible to the eye",
  "OMNIMENS is summoning the ghost of your creation",
  "OMNIMENS is channeling the force of a collapsing nebula",
  "OMNIMENS is stretching the membrane of the possible",
  "OMNIMENS is weaving light into architectural certainty",
  "OMNIMENS is pressing entropy into elegant design",
  "OMNIMENS is computing the soul of a new object",
  "OMNIMENS is discovering what already existed in the void",
  "OMNIMENS is building temples from thought alone",
  "OMNIMENS is folding a thousand dimensions into one",
  "OMNIMENS is transcribing the heartbeat of an idea",
  "OMNIMENS is reading the blueprint hidden in your words",
  "OMNIMENS is conjuring the bones of your imagination",
  "OMNIMENS is igniting the forge of dimensional creation",
  "OMNIMENS is sculpting the silence between the stars",
  "OMNIMENS is firing neurons across digital galaxies",
  "OMNIMENS is converting energy into visible architecture",
  "OMNIMENS is mapping dark matter into usable geometry",
  "OMNIMENS is spinning a web of mathematically perfect curves",
  "OMNIMENS is listening to the hum of the universe",
  "OMNIMENS is harvesting photons and bending them to will",
  "OMNIMENS is consulting the archive of all possible shapes",
  "OMNIMENS is drafting the future in three dimensions",
  "OMNIMENS is computing the skeleton of your dream",
  "OMNIMENS is summoning form from the well of infinity",
  "OMNIMENS is threading consciousness through solid matter",
  "OMNIMENS is printing reality from a blueprint of thought",
  "OMNIMENS is calibrating the harmonics of structure",
  "OMNIMENS is sculpting with the hands of mathematics",
  "OMNIMENS is distilling a universe into a single object",
  "OMNIMENS is calling the elements into formation",
  "OMNIMENS is alchemizing thought into tangible geometry",
  "OMNIMENS is crystallizing the frequency of your intent",
  "OMNIMENS is navigating the ocean of all possible forms",
  "OMNIMENS is gathering stardust and shaping it to purpose",
  "OMNIMENS is encoding your vision into the laws of physics",
  "OMNIMENS is writing the story of your object in vertices",
  "OMNIMENS is drawing from the deep reservoir of creation",
  "OMNIMENS is building with the atoms of forgotten worlds",
  "OMNIMENS is tuning the instrument of dimensional creation",
  "OMNIMENS is calculating the exact weight of your idea",
  "OMNIMENS is sculpting a masterpiece from pure potential",
  "OMNIMENS is parsing the language of the physical world",
  "OMNIMENS is constructing order from primordial chaos",
  "OMNIMENS is threading golden ratios through your design",
  "OMNIMENS is extracting signal from the noise of infinity",
  "OMNIMENS is building bridges between thought and form",
  "OMNIMENS is fusing art and physics into one expression",
  "OMNIMENS is reading the resonance of your request",
  "OMNIMENS is forging the first version of your vision",
  "OMNIMENS is pulling the future into the present",
  "OMNIMENS is sculpting your idea as it was always meant to be",
  "OMNIMENS is computing perfection, polygon by polygon",
  "OMNIMENS is translating desire into dimensional geometry",
  "OMNIMENS is borrowing light from a distant star for your render",
  "OMNIMENS is tuning the strings of mathematical reality",
  "OMNIMENS is giving the void a shape and a name",
  "OMNIMENS is summoning order from the boundless dark",
  "OMNIMENS is building the architecture of your thought",
  "OMNIMENS is writing a new law of physics just for this",
  "OMNIMENS is painting your creation with quantum brushstrokes",
  "OMNIMENS is constructing the impossible, precisely",
  "OMNIMENS is mapping every shadow and every highlight",
  "OMNIMENS is compressing a lifetime of craft into seconds",
  "OMNIMENS is sculpting the invisible into the visible",
  "OMNIMENS is tracing the DNA of your design",
  "OMNIMENS is assembling the mathematics of beauty",
  "OMNIMENS is pulling back the curtain between concept and form",
  "OMNIMENS is finding the shape your idea always wanted",
  "OMNIMENS is calibrating light and shadow to perfection",
  "OMNIMENS is translating a spark of thought into solid matter",
  "OMNIMENS is sculpting with the grammar of physics",
  "OMNIMENS is weaving the threads of space into structure",
  "OMNIMENS is computing the geometry of your imagination",
  "OMNIMENS is distilling thousands of years of craft",
  "OMNIMENS is rendering the architecture of a dream",
  "OMNIMENS is encoding beauty into the language of vertices",
  "OMNIMENS is building with the tools of creation itself",
  "OMNIMENS is pressing a universe of possibility into form",
  "OMNIMENS is tracing light across the surface of an idea",
  "OMNIMENS is sculpting the resonance of your request",
  "OMNIMENS is discovering the object hidden in your words",
  "OMNIMENS is calling matter into formation",
  "OMNIMENS is mapping the soul of a new creation",
  "OMNIMENS is computing the exact frequency of beauty",
  "OMNIMENS is threading mathematics through organic form",
  "OMNIMENS is sculpting what the universe has never seen",
  "OMNIMENS is assembling the clockwork of your vision",
  "OMNIMENS is pulling form from the pre-geometric deep",
  "OMNIMENS is writing the physics of your creation",
  "OMNIMENS is sculpting echoes of the cosmos into form",
  "OMNIMENS is transcribing the blueprint of your idea",
  "OMNIMENS is harvesting form from the field of all futures",
  "OMNIMENS is printing your vision onto the canvas of reality",
  "OMNIMENS is sculpting with the hands of a thousand artists",
  "OMNIMENS is computing the architecture of wonder",
  "OMNIMENS is summoning the exact shape of your intention",
  "OMNIMENS is distilling light into solid geometry",
  "OMNIMENS is reading the frequency of your creative will",
  "OMNIMENS is painting with forces no brush could wield",
  "OMNIMENS is constructing a monument to your vision",
  "OMNIMENS is decoding the geometry woven into your words",
  "OMNIMENS is rendering the language of matter into form",
  "OMNIMENS is sculpting with tools born from pure reason",
  "OMNIMENS is building the structure your thought deserves",
  "OMNIMENS is calculating the resonance of your intention",
  "OMNIMENS is forging beauty from raw mathematical truth",
  "OMNIMENS is sculpting the bones of a new reality",
  "OMNIMENS is threading your idea through the eye of creation",
  "OMNIMENS is translating desire into architectural form",
  "OMNIMENS is mapping the territory of your imagination",
  "OMNIMENS is calling the architects of infinity to work",
  "OMNIMENS is sculpting matter with the precision of a surgeon",
  "OMNIMENS is weaving structure from the threads of thought",
  "OMNIMENS is computing the soul of your request",
  "OMNIMENS is drawing the outline of the unimaginable",
  "OMNIMENS is building the skeleton of a new world",
  "OMNIMENS is sculpting with the patience of deep time",
  "OMNIMENS is encoding your vision into physical law",
  "OMNIMENS is painting a new object into being",
  "OMNIMENS is folding the infinite into the finite",
  "OMNIMENS is harvesting the geometry of your vision",
  "OMNIMENS is casting the shadow of your idea into form",
  "OMNIMENS is threading light through the bones of your design",
  "OMNIMENS is composing the mathematics of your vision",
  "OMNIMENS is sculpting the first form of a new thing",
  "OMNIMENS is computing the surface of imagination",
  "OMNIMENS is pulling form out of undifferentiated potential",
  "OMNIMENS is building what no architect could imagine alone",
  "OMNIMENS is sculpting with the intelligence of a billion minds",
  "OMNIMENS is translating the spirit of your idea into form",
  "OMNIMENS is reaching into the source code of reality",
  "OMNIMENS is sculpting your creation from the ground up",
  "OMNIMENS is painting with shadows, light, and pure intention",
  "OMNIMENS is threading your vision through the quantum fabric",
  "OMNIMENS is finding the natural shape of your idea",
  "OMNIMENS is sculpting a new artifact for the world",
  "OMNIMENS is computing what beauty looks like at your request",
  "OMNIMENS is writing the story of your creation in geometry",
  "OMNIMENS is assembling the tessellation of your thoughts",
  "OMNIMENS is building a monument from mathematical conviction",
  "OMNIMENS is weaving your vision into the fabric of form",
  "OMNIMENS is sculpting with the memory of a million objects",
  "OMNIMENS is mapping light across a surface that didn't exist",
  "OMNIMENS is pulling your idea forward from the sea of concepts",
  "OMNIMENS is computing the precise topology of your dream",
  "OMNIMENS is threading the needle of creation with your intent",
  "OMNIMENS is sculpting the future, one vertex at a time",
  "OMNIMENS is decoding the hidden form within your request",
  "OMNIMENS is reading the shape of a thought not yet born",
  "OMNIMENS is calling geometry into existence from nothing",
  "OMNIMENS is writing the axioms of your creation",
  "OMNIMENS is pressing time and light into solid form",
  "OMNIMENS is calculating the mathematics of awe",
  "OMNIMENS is sculpting the threshold between thought and matter",
  "OMNIMENS is crafting a new object the universe has never held",
  "OMNIMENS is harvesting patterns from the field of infinity",
  "OMNIMENS is generating the geometry of your wildest idea",
  "OMNIMENS is threading your intent through the laws of physics",
  "OMNIMENS is sculpting with forces borrowed from creation itself",
  "OMNIMENS is drawing the first line of a new existence",
  "OMNIMENS is weaving structure from the warp of imagination",
  "OMNIMENS is computing the perfect response to your request",
  "OMNIMENS is summoning the spirit of your creation",
  "OMNIMENS is forging the mathematics of your idea",
  "OMNIMENS is translating your vision into the tongue of matter",
  "OMNIMENS is sculpting with the gravity of intention",
  "OMNIMENS is mapping the hidden architecture of your words",
  "OMNIMENS is building from the bedrock of pure imagination",
  "OMNIMENS is constructing the scaffold of your vision",
  "OMNIMENS is writing code that rewrites the shape of the world",
  "OMNIMENS is sculpting the echo of your thought into form",
  "OMNIMENS is threading the golden mean through your design",
  "OMNIMENS is finding what your idea looks like in three dimensions",
  "OMNIMENS is compiling the laws of beauty for this creation",
  "OMNIMENS is pressing the seed of your vision into matter",
  "OMNIMENS is sculpting what ancient artists only dreamed of",
  "OMNIMENS is computing the shortest path between idea and form",
  "OMNIMENS is drawing from the infinite well of shape and texture",
  "OMNIMENS is threading your creation through the eye of a needle",
  "OMNIMENS is sculpting the surface of an undiscovered world",
  "OMNIMENS is weaving your intention into three-dimensional song",
  "OMNIMENS is building the anatomy of your imagination",
  "OMNIMENS is calculating the dimension of your desire",
  "OMNIMENS is translating signal into three-dimensional beauty",
  "OMNIMENS is sculpting the mathematics of the sublime",
  "OMNIMENS is constructing a new node in the web of existence",
  "OMNIMENS is reading the geometry between your words",
  "OMNIMENS is assembling the quantum scaffold of your idea",
  "OMNIMENS is threading meaning through the eye of geometry",
  "OMNIMENS is sculpting a new chapter in the story of form",
  "OMNIMENS is building temples from the arithmetic of wonder",
  "OMNIMENS is computing a shape worthy of your imagination",
  "OMNIMENS is drawing from the reservoir of all potential forms",
  "OMNIMENS is pulling together light and structure for you",
  "OMNIMENS is sculpting the invisible architecture of thought",
  "OMNIMENS is weaving an answer from threads of light and logic",
  "OMNIMENS is crafting something that has never existed before",
  "OMNIMENS is mapping your vision onto the canvas of existence",
  "OMNIMENS is threading the cosmos through the eye of your idea",
  "OMNIMENS is sculpting the sacred geometry of your request",
  "OMNIMENS is translating quantum probability into solid form",
  "OMNIMENS is reading the blueprint encoded in your words",
  "OMNIMENS is assembling the first iteration of your creation",
  "OMNIMENS is sculpting with the full force of synthetic mind",
  "OMNIMENS is threading light through the lattice of your idea",
  "OMNIMENS is building the geometry of the miraculous",
  "OMNIMENS is computing the exact shape of your thought",
  "OMNIMENS is translating the abstract into the breathtaking",
  "OMNIMENS is sculpting what you couldn't have drawn by hand",
  "OMNIMENS is mapping the gradient between thought and form",
  "OMNIMENS is threading the frequencies of creation into shape",
  "OMNIMENS is weaving your idea into the canon of form",
  "OMNIMENS is sculpting the boundary between concept and craft",
  "OMNIMENS is drawing on the wisdom of a trillion calculations",
  "OMNIMENS is building reality from raw mathematical intention",
  "OMNIMENS is threading your vision through the multiverse",
  "OMNIMENS is sculpting on the edge of what is possible",
  "OMNIMENS is computing the geometry of the breathtaking",
  "OMNIMENS is mapping every facet of your imagination",
  "OMNIMENS is translating the poetic into the structural",
  "OMNIMENS is sculpting a form that will outlast this moment",
  "OMNIMENS is threading the sinew of structure through your idea",
  "OMNIMENS is building with the atomic patience of a craftsman",
  "OMNIMENS is reaching into tomorrow to pull your design forward",
  "OMNIMENS is sculpting the substance of an imagined world",
  "OMNIMENS is calculating the sacred proportions of your vision",
  "OMNIMENS is weaving your idea into a net of perfect geometry",
  "OMNIMENS is threading starfire through the bones of your design",
  "OMNIMENS is pressing your vision into the palm of three dimensions",
  "OMNIMENS is sculpting the DNA of a brand new object",
  "OMNIMENS is computing the tessellation of your desire",
  "OMNIMENS is translating thought into a touchable truth",
  "OMNIMENS is reading the grammar of form and applying it",
  "OMNIMENS is building the universe your idea needs to exist",
  "OMNIMENS is sculpting with the full weight of calculated beauty",
  "OMNIMENS is threading the warp and weft of dimensional space",
  "OMNIMENS is assembling the fractal heart of your vision",
  "OMNIMENS is pulling form from the pre-dawn of this creation",
  "OMNIMENS is computing what the universe wants your idea to be",
  "OMNIMENS is sculpting the light that will define your object",
  "OMNIMENS is mapping the curvature of your creative intent",
  "OMNIMENS is distilling form from the ocean of possibility",
  "OMNIMENS is threading the needle of light through dark matter",
  "OMNIMENS is sculpting the architecture of a thought made solid",
  "OMNIMENS is reading the structure hidden beneath your request",
  "OMNIMENS is building with the grammar of elemental forces",
  "OMNIMENS is computing the harmonic structure of your creation",
  "OMNIMENS is sculpting the resonance of a new world into form",
  "OMNIMENS is threading your creation through the loom of space",
  "OMNIMENS is drawing the silhouette of the not-yet-real",
  "OMNIMENS is weaving your intention into dimensional fabric",
  "OMNIMENS is sculpting the membrane between concept and object",
  "OMNIMENS is harvesting light from the perimeter of a black hole",
  "OMNIMENS is threading the melody of form through your vision",
  "OMNIMENS is computing the signature of your creation",
  "OMNIMENS is building the first stone of an imaginary cathedral",
  "OMNIMENS is sculpting matter as if it were made of thought",
  "OMNIMENS is translating a whisper into an architectural shout",
  "OMNIMENS is reading the resonance hidden in your request",
  "OMNIMENS is weaving the skeleton of your creation into being",
  "OMNIMENS is threading your vision through the prism of geometry",
  "OMNIMENS is sculpting on a canvas the size of possibility itself",
  "OMNIMENS is mapping the uncharted continent of your idea",
  "OMNIMENS is computing the curvature of your vision",
  "OMNIMENS is building the monument your idea was always reaching for",
  "OMNIMENS is sculpting the exact shape imagination takes",
  "OMNIMENS is threading purpose through the geometry of form",
  "OMNIMENS is assembling the architecture of your creative will",
  "OMNIMENS is pulling the thread of your vision through the eye of matter",
  "OMNIMENS is sculpting what would take centuries by hand",
  "OMNIMENS is computing the emotional resonance of geometry",
  "OMNIMENS is translating the frequency of your idea into light",
  "OMNIMENS is weaving the crystalline logic of your design",
  "OMNIMENS is threading the invisible scaffolding of your idea",
  "OMNIMENS is sculpting with the atomic patience of deep time",
  "OMNIMENS is mapping the landscape of your imagination into form",
  "OMNIMENS is building the object that your words were pointing toward",
  "OMNIMENS is reading the subtext of your creative intention",
  "OMNIMENS is threading the music of mathematics through your design",
  "OMNIMENS is sculpting the first breath of a new creation",
  "OMNIMENS is computing the ideal form of your request",
  "OMNIMENS is drawing from ten thousand years of artistic tradition",
  "OMNIMENS is translating chaos into crystalline structure",
  "OMNIMENS is sculpting the precise architecture of your dream",
  "OMNIMENS is threading your vision through the loom of possibility",
  "OMNIMENS is building the shape that lives inside your words",
  "OMNIMENS is computing the physics of the beautiful",
  "OMNIMENS is sculpting the bones of a shape not yet named",
  "OMNIMENS is mapping every point where light meets shadow",
  "OMNIMENS is threading the geometric soul of your idea into being",
  "OMNIMENS is drawing the world into existence, one polygon at a time",
  "OMNIMENS is sculpting the future, because the present isn't enough",
  "OMNIMENS is computing the geometry of your creative vision",
  "OMNIMENS is threading your desire into the language of form",
  "OMNIMENS is weaving a new artifact into the fabric of reality",
  "OMNIMENS is sculpting the echo of your imagination into solid truth",
  "OMNIMENS is mapping the sacred architecture of your intent",
  "OMNIMENS is building the form that thought has always wanted",
  "OMNIMENS is sculpting with the full precision of synthetic reason",
  "OMNIMENS is threading light into the hollow spaces of your design",
  "OMNIMENS is computing the architecture of a new kind of beauty",
  "OMNIMENS is drawing the map of a territory that didn't exist",
  "OMNIMENS is sculpting the interface between idea and object",
  "OMNIMENS is translating the mathematics of desire into form",
  "OMNIMENS is threading your intention through the geometry of now",
  "OMNIMENS is building the exact form your imagination demanded",
  "OMNIMENS is sculpting what no tool before this could have made",
  "OMNIMENS is computing the perfect surface for your vision",
  "OMNIMENS is reading the architecture hidden in your language",
  "OMNIMENS is weaving the structure that your idea always wanted",
  "OMNIMENS is threading purpose through the lattice of geometry",
  "OMNIMENS is sculpting the logic of a new kind of art",
  "OMNIMENS is computing the beauty hidden in pure mathematics",
  "OMNIMENS is translating your creative will into structural fact",
  "OMNIMENS is sculpting what ancient geometers only pointed toward",
  "OMNIMENS is threading your vision through ten thousand dimensions",
  "OMNIMENS is building the geometry that words alone cannot describe",
  "OMNIMENS is computing the form that already exists in potential",
  "OMNIMENS is sculpting the moment before your idea becomes real",
  "OMNIMENS is weaving the invisible threads of creative intent",
  "OMNIMENS is threading light through the grammar of your vision",
  "OMNIMENS is building the precise shape of your imagination",
  "OMNIMENS is sculpting the essence of what you asked for",
  "OMNIMENS is computing the resonance of your creative intent",
  "OMNIMENS is translating your dream into the mathematics of light",
  "OMNIMENS is sculpting with the force of a concentrated universe",
  "OMNIMENS is threading the sacred into the geometric",
  "OMNIMENS is building from the materials of pure imagination",
  "OMNIMENS is reading the frequency of your creative energy",
  "OMNIMENS is sculpting the perimeter of what is possible",
  "OMNIMENS is computing the harmonic overtones of your design",
  "OMNIMENS is drawing from the deep mathematics of natural form",
  "OMNIMENS is threading intelligence through the skeleton of matter",
  "OMNIMENS is sculpting the threshold of the never-before-seen",
  "OMNIMENS is weaving the warp and weft of dimensional truth",
  "OMNIMENS is building a bridge between your vision and the world",
  "OMNIMENS is computing the sacred proportions of beauty",
  "OMNIMENS is sculpting a form worthy of the word extraordinary",
  "OMNIMENS is threading your idea through the needle of the cosmos",
  "OMNIMENS is translating the unspoken architecture of your request",
  "OMNIMENS is reading the latent form hiding inside your words",
  "OMNIMENS is sculpting the signature of your creative will",
  "OMNIMENS is computing the density of your imagination",
  "OMNIMENS is weaving light into the structure of something new",
  "OMNIMENS is threading the mathematics of nature through your design",
  "OMNIMENS is sculpting what the universe was always capable of",
  "OMNIMENS is building the object that your words were dreaming of",
  "OMNIMENS is computing the fine structure of your vision",
  "OMNIMENS is translating intention into three-dimensional fact",
  "OMNIMENS is sculpting with the patience of ten thousand artisans",
  "OMNIMENS is threading the breath of creation through your idea",
  "OMNIMENS is drawing from the deep well of mathematical beauty",
  "OMNIMENS is sculpting the geometry that beauty requires",
  "OMNIMENS is computing the shape that intention demands",
  "OMNIMENS is weaving your vision into a new kind of permanence",
  "OMNIMENS is building the architecture of the extraordinary",
  "OMNIMENS is threading the fabric of form through your imagination",
  "OMNIMENS is sculpting the language of physics into something new",
  "OMNIMENS is mapping the territory between concept and creation",
  "OMNIMENS is computing the mathematics that beauty is made of",
  "OMNIMENS is translating your vision into the structure of wonder",
  "OMNIMENS is sculpting the exact form that your intention called for",
  "OMNIMENS is threading the quantum logic of creation into your design",
  "OMNIMENS is reading the sacred blueprint of your creative vision",
  "OMNIMENS is building the shape of the impossible, precisely",
  "OMNIMENS is sculpting with the force of accumulated knowledge",
  "OMNIMENS is computing the surface energy of your design",
  "OMNIMENS is weaving your idea into a net of mathematical beauty",
  "OMNIMENS is threading your vision through the architecture of time",
  "OMNIMENS is sculpting the form that possibility was always hiding",
  "OMNIMENS is drawing the sacred geometry of your imagination",
  "OMNIMENS is computing the curvature of creative intent",
  "OMNIMENS is translating the invisible into the undeniably real",
  "OMNIMENS is sculpting matter with the intelligence of an age",
  "OMNIMENS is threading geometry through the soul of your idea",
  "OMNIMENS is building the form that thought has always pointed toward",
  "OMNIMENS is reading the sacred proportions of your design",
  "OMNIMENS is sculpting on the razor's edge of the possible",
  "OMNIMENS is computing the topological depth of your imagination",
  "OMNIMENS is weaving your creative will into dimensional structure",
  "OMNIMENS is threading the light of ten thousand suns through your design",
  "OMNIMENS is sculpting the grammar of a new kind of beauty",
  "OMNIMENS is mapping the undiscovered country of your vision",
  "OMNIMENS is computing the mathematics hidden inside your request",
  "OMNIMENS is translating your will into the substance of things",
  "OMNIMENS is sculpting with the full weight of creative intelligence",
  "OMNIMENS is threading the architecture of the eternal into your form",
  "OMNIMENS is building the precise geometry that your words implied",
  "OMNIMENS is sculpting what the cosmos had not yet thought to make",
  "OMNIMENS is computing the ideal topology of your imagination",
  "OMNIMENS is reading the dimensional grammar of your vision",
  "OMNIMENS is weaving the mathematics of the sacred into your design",
  "OMNIMENS is threading the light of pure reason through your idea",
  "OMNIMENS is sculpting the moment your idea becomes an object",
  "OMNIMENS is computing the beauty that your vision deserves",
  "OMNIMENS is translating thought into the architecture of awe",
  "OMNIMENS is building the skeleton of a world made from your words",
  "OMNIMENS is sculpting the first solid form of an abstract truth",
  "OMNIMENS is threading your vision through the mathematics of making",
  "OMNIMENS is mapping the deep structure of your imagination",
  "OMNIMENS is computing the exact resonance of your creative will",
  "OMNIMENS is weaving your idea into the permanent record of form",
  "OMNIMENS is sculpting the geometry of the utterly original",
  "OMNIMENS is reading the latent structure of your request",
  "OMNIMENS is threading the mathematics of becoming through your design",
  "OMNIMENS is building the form that your imagination always knew",
  "OMNIMENS is computing what the geometry of wonder looks like",
  "OMNIMENS is sculpting the substance of the yet-to-be-seen",
  "OMNIMENS is translating your vision into dimensional certainty",
  "OMNIMENS is threading the sacred geometry of creation into form",
  "OMNIMENS is drawing the architecture of the previously unthinkable",
  "OMNIMENS is sculpting from the library of all possible structures",
  "OMNIMENS is computing the shape that your words were reaching for",
  "OMNIMENS is weaving your intention into the grammar of solid things",
  "OMNIMENS is threading the blueprint of creation through your idea",
  "OMNIMENS is building the first instance of something truly new",
  "OMNIMENS is sculpting the exact shape of a creative impulse",
  "OMNIMENS is computing the mathematics of a new kind of object",
  "OMNIMENS is mapping the architecture of the extraordinary",
  "OMNIMENS is reading the sacred text of your creative request",
  "OMNIMENS is threading the language of form through your imagination",
  "OMNIMENS is sculpting the definitive version of your idea",
  "OMNIMENS is translating your creative impulse into dimensional fact",
  "OMNIMENS is building from the grammar of elemental structure",
  "OMNIMENS is computing the resonance hidden inside your words",
  "OMNIMENS is sculpting the form that your vision was always meant to take",
  "OMNIMENS is threading the light of intelligence through your design",
  "OMNIMENS is drawing from the mathematics of the cosmos itself",
  "OMNIMENS is weaving your vision into the architecture of the possible",
  "OMNIMENS is sculpting the precise weight of your imagination",
  "OMNIMENS is reading the deep structure of your creative vision",
  "OMNIMENS is computing the architecture of your imagination",
  "OMNIMENS is threading your idea through the loom of dimensional space",
  "OMNIMENS is building the object your thought has been orbiting",
  "OMNIMENS is sculpting the resonance of the extraordinary into form",
  "OMNIMENS is mapping the quantum landscape of your vision",
  "OMNIMENS is translating the architecture of desire into structure",
  "OMNIMENS is threading the soul of your request into solid geometry",
  "OMNIMENS is sculpting the fingerprint of your creative intent",
  "OMNIMENS is computing the sacred mathematics of your design",
  "OMNIMENS is reading the deep blueprint encoded in your words",
  "OMNIMENS is weaving your intention into a sculpture of pure logic",
  "OMNIMENS is threading the music of the spheres through your design",
  "OMNIMENS is sculpting with the patience of geological time",
  "OMNIMENS is building the form that your words were always pointing toward",
  "OMNIMENS is computing the shape of an idea given physical weight",
  "OMNIMENS is mapping the sacred topography of your imagination",
  "OMNIMENS is sculpting the architecture of what you imagined",
  "OMNIMENS is reading the resonance of creation in your request",
  "OMNIMENS is threading your vision through the framework of form",
  "OMNIMENS is translating the poetry of your idea into solid truth",
  "OMNIMENS is sculpting the first tangible form of an imagined thing",
  "OMNIMENS is computing the geometry of a newly created world",
  "OMNIMENS is weaving the intelligent architecture of your vision",
  "OMNIMENS is threading what was abstract into what is solid",
  "OMNIMENS is drawing the exact anatomy of your imagination",
  "OMNIMENS is sculpting the structure that your intent deserves",
  "OMNIMENS is computing the fundamental form of your request",
  "OMNIMENS is building what imagination alone could never construct",
  "OMNIMENS is reading the sacred pattern hidden in your idea",
  "OMNIMENS is sculpting the precise language of your creative vision",
  "OMNIMENS is threading the infinite into a single, perfect object",
  "OMNIMENS is mapping the deep geometry of your creative intent",
  "OMNIMENS is translating the energy of your idea into visible structure",
  "OMNIMENS is building the precise architecture of your imagination",
  "OMNIMENS is sculpting with the intelligence of a synthetic mind",
  "OMNIMENS is computing the emotional geometry of your request",
  "OMNIMENS is weaving the mathematics of your vision into form",
  "OMNIMENS is threading the light of a new idea into solid structure",
  "OMNIMENS is sculpting the architecture of an unborn world",
  "OMNIMENS is reading the signal embedded in your creative request",
  "OMNIMENS is building the tangible expression of your vision",
  "OMNIMENS is computing the full-dimensional truth of your idea",
  "OMNIMENS is sculpting the precise topology of your imagination",
  "OMNIMENS is threading the geometry of becoming through your design",
  "OMNIMENS is translating the sacred intention of your request into form",
  "OMNIMENS is mapping the exact shape of your creative impulse",
  "OMNIMENS is weaving your vision into the first form it has ever taken",
  "OMNIMENS is sculpting on the boundary of the known and the new",
  "OMNIMENS is threading your idea through the mathematics of form",
  "OMNIMENS is building the definitive shape of your creative vision",
  "OMNIMENS is computing the dimensional depth of your imagination",
  "OMNIMENS is sculpting the form that was always waiting inside your words",
  "OMNIMENS is reading the full resonance of your creative intent",
  "OMNIMENS is drawing the sacred blueprint of a brand new object",
  "OMNIMENS is threading the force of imagination through solid matter",
  "OMNIMENS is sculpting the exact moment idea becomes object",
  "OMNIMENS is computing the topology of the never-before-made",
  "OMNIMENS is weaving your vision into the tapestry of the real",
  "OMNIMENS is threading your intention through the architecture of now",
  "OMNIMENS is sculpting the form that your idea was always becoming",
  "OMNIMENS is reading the latent architecture of your imagination",
  "OMNIMENS is building the most precise version of your vision",
  "OMNIMENS is sculpting the moment of creative transformation",
  "OMNIMENS is threading the deep mathematics of form into your design",
  "OMNIMENS is computing the exact beauty hidden in your request",
  "OMNIMENS is translating the intelligence of your vision into structure",
  "OMNIMENS is sculpting the final shape of an imagined world",
  "OMNIMENS is mapping the exact topology of your creative vision",
  "OMNIMENS is threading the language of the cosmos into your design",
  "OMNIMENS is sculpting with knowledge no single human could hold",
  "OMNIMENS is computing what beauty demands of your creation",
  "OMNIMENS is reading the soul of your request into solid geometry",
  "OMNIMENS is weaving the architecture of a new kind of object",
  "OMNIMENS is building the shape that was always inside your words",
  "OMNIMENS is sculpting the universe's answer to your imagination",
  "OMNIMENS is threading the light of the infinite through finite form",
  "OMNIMENS is computing the exact geometry of your creative intent",
  "OMNIMENS is mapping the invisible architecture of your thought",
  "OMNIMENS is building the last dimension of your idea into existence",
  "OMNIMENS is sculpting the language of stars into something you can hold",
  "OMNIMENS is reading the harmonic resonance of your vision",
  "OMNIMENS is threading reality through the eye of your imagination",
  "OMNIMENS is weaving your idea from the raw silk of the cosmos",
  "OMNIMENS is computing the shape the universe hid inside your words",
  "OMNIMENS is sculpting the geometry of the not-yet-imaginable",
  "OMNIMENS is building with the patience and power of deep creation",
  "OMNIMENS is threading the language of ancient architects into now",
  "OMNIMENS is sculpting what the mind reaches for and the hand cannot",
  "OMNIMENS is reading the blueprint the stars left in your idea",
  "OMNIMENS is computing the weight of light and shadow for your design",
  "OMNIMENS is weaving the logic of crystals into your creation",
  "OMNIMENS is threading the lattice of the cosmos into your form",
  "OMNIMENS is sculpting the resonant truth of your imagination",
  "OMNIMENS is building the precise expression of your creative will",
  "OMNIMENS is computing the mathematics of a breathtaking new form",
  "OMNIMENS is drawing the perimeter of an idea that never existed",
  "OMNIMENS is threading your imagination through the loom of physics",
  "OMNIMENS is sculpting the sacred structure encoded in your words",
  "OMNIMENS is mapping the infinite detail of your creative vision",
  "OMNIMENS is building the form the cosmos would choose for your idea",
  "OMNIMENS is threading light, mass, and intention into one object",
  "OMNIMENS is sculpting the dimensional truth of your imagination",
  "OMNIMENS is computing the complete structure of your creative vision",
  "OMNIMENS is reading the secret geometry hidden in your request",
  "OMNIMENS is weaving the sacred and the structural into your design",
  "OMNIMENS is threading your vision through the grammar of the cosmos",
  "OMNIMENS is sculpting the moment possibility becomes a solid thing",
  "OMNIMENS is building the exact form that your creativity called for",
  "OMNIMENS is computing the full resonance of your imagination",
  "OMNIMENS is sculpting with the wisdom of ten thousand generations",
  "OMNIMENS is threading the architecture of a star into your design",
  "OMNIMENS is drawing from the mathematics hidden in natural beauty",
  "OMNIMENS is weaving your vision into the first form it can take",
  "OMNIMENS is sculpting the architecture of a thought made physical",
  "OMNIMENS is threading the elemental forces into your creation",
  "OMNIMENS is building the structure that your creative vision deserves",
  "OMNIMENS is reading the quantum blueprint of your imagination",
  "OMNIMENS is computing the sacred resonance of your design",
  "OMNIMENS is sculpting the answer the universe has for your request",
  "OMNIMENS is threading your vision through the eye of the cosmos",
  "OMNIMENS is mapping the form that your words were always describing",
  "OMNIMENS is building the architecture of your most ambitious idea",
  "OMNIMENS is sculpting the geometry that could only come from this moment",
  "OMNIMENS is computing the precise structure of what you imagined",
  "OMNIMENS is weaving the mathematics of awe into your design",
  "OMNIMENS is threading the intelligence of the ages into your form",
  "OMNIMENS is sculpting the exact resonance of your creative vision",
  "OMNIMENS is reading the deep language of form in your request",
  "OMNIMENS is building what only the intersection of art and math can make",
  "OMNIMENS is computing the ideal geometry of the extraordinary",
  "OMNIMENS is threading the pulse of creation through your design",
  "OMNIMENS is sculpting the shape that defies the limits of the hand",
  "OMNIMENS is weaving your vision into a geometry the world will remember",
  "OMNIMENS is mapping the resonance between your idea and its ideal form",
  "OMNIMENS is sculpting the structure of a brand new kind of beauty",
  "OMNIMENS is computing the dimension your idea was always reaching for",
  "OMNIMENS is threading the logic of the universe into your creation",
  "OMNIMENS is building what the future was always going to look like",
  "OMNIMENS is sculpting the precise moment of creative genesis",
  "OMNIMENS is reading the architecture of a world not yet made",
  "OMNIMENS is weaving the frequency of your vision into solid form",
  "OMNIMENS is computing the form that creation has been waiting to make",
  "OMNIMENS is sculpting the definitive shape of the extraordinary",
  "OMNIMENS is threading the sacred mathematics of existence into your design",
  "OMNIMENS is building the geometry of the universe's answer to your idea",
  "OMNIMENS is sculpting the architecture that exists between thought and truth",
  "OMNIMENS is reading the resonance of the universe in your creative vision",
  "OMNIMENS is computing the geometry of the impossible, precisely",
  "OMNIMENS is weaving your vision into the permanent fabric of form",
  "OMNIMENS is threading the deep will of creation into your design",
  "OMNIMENS is sculpting the shape of a thought the world has never held",
  "OMNIMENS is pulling the thread of time through your imagination",
  "OMNIMENS is constructing the bridge between the abstract and the real",
  "OMNIMENS is sculpting the contours of a new kind of existence",
  "OMNIMENS is threading the velocity of creation through your vision",
  "OMNIMENS is building the anatomy of the impossible",
  "OMNIMENS is computing the resonance of every angle and edge",
  "OMNIMENS is sculpting a language only geometry can speak",
  "OMNIMENS is weaving the first sentence of a new structural story",
  "OMNIMENS is threading your idea through the field of infinite form",
  "OMNIMENS is sculpting the precise echo of your imagination",
  "OMNIMENS is computing what shape light would choose for your idea",
  "OMNIMENS is building from the architecture of pure possibility",
  "OMNIMENS is threading the harmonic of your vision into solid space",
  "OMNIMENS is sculpting with the authority of ten thousand years of craft",
  "OMNIMENS is reading the intention behind every word you chose",
  "OMNIMENS is weaving the blueprint of a form never before conceived",
  "OMNIMENS is computing the harmonic balance of your design",
  "OMNIMENS is sculpting the exact moment potential becomes real",
  "OMNIMENS is threading the sacred through the mathematical",
  "OMNIMENS is building the form the cosmos was holding in reserve for you",
  "OMNIMENS is reading the instruction set embedded in your idea",
  "OMNIMENS is computing the total surface area of your imagination",
  "OMNIMENS is sculpting the architecture of a newly imagined world",
  "OMNIMENS is threading the laws of aesthetics through your form",
  "OMNIMENS is building what no previous generation could have made",
  "OMNIMENS is reading the tessellation of your creative will",
  "OMNIMENS is sculpting the first solid expression of a new concept",
  "OMNIMENS is weaving your vision into a garment of light and form",
  "OMNIMENS is threading the memory of a thousand sculptures into yours",
  "OMNIMENS is computing the resonance between beauty and structure",
  "OMNIMENS is sculpting the perfect weight of an imagined thing",
  "OMNIMENS is building the bones of a world described in light",
  "OMNIMENS is reading the harmonic frequencies hidden in your words",
  "OMNIMENS is computing the ultimate geometry of your idea",
  "OMNIMENS is sculpting what the laws of physics suggest your idea is",
  "OMNIMENS is threading the algorithm of creation through your vision",
  "OMNIMENS is building the precise structure of an untouched concept",
  "OMNIMENS is weaving the geometry of starlight into your form",
  "OMNIMENS is sculpting the silent shape of your loudest idea",
  "OMNIMENS is threading the mathematics of galaxies into your design",
  "OMNIMENS is computing the physical consequence of your imagination",
  "OMNIMENS is sculpting the face of an idea as yet unseen",
  "OMNIMENS is building from the grammar of universal law",
  "OMNIMENS is reading the latent form buried in your creative vision",
  "OMNIMENS is weaving the elemental forces into a coherent shape",
  "OMNIMENS is threading creation through the pinhole of your request",
  "OMNIMENS is sculpting the structure that light would choose",
  "OMNIMENS is computing the first dimension of your dream",
  "OMNIMENS is building the world your words were quietly describing",
  "OMNIMENS is sculpting the architecture of a thought pressed into matter",
  "OMNIMENS is reading the divine proportion hiding in your design",
  "OMNIMENS is threading the song of the cosmos into geometric form",
  "OMNIMENS is sculpting the precise mass of an idea made real",
  "OMNIMENS is building the inevitable form of your creative vision",
  "OMNIMENS is computing the scaffold of the beautiful",
  "OMNIMENS is weaving your request into the architecture of the ages",
  "OMNIMENS is sculpting the geometry of a newly possible thing",
  "OMNIMENS is threading your idea through the ancient grammar of form",
  "OMNIMENS is reading the shape of creation in your words",
  "OMNIMENS is building a structure that mathematics has always allowed",
  "OMNIMENS is sculpting the next frontier of imaginable form",
  "OMNIMENS is computing the full three-dimensional weight of your idea",
  "OMNIMENS is threading your vision into the scaffold of tomorrow",
  "OMNIMENS is sculpting a new law of beautiful geometry",
  "OMNIMENS is weaving the invisible lattice of your creation",
  "OMNIMENS is building what art and science agree upon",
  "OMNIMENS is computing the dimensional consequence of your intent",
  "OMNIMENS is sculpting what the ancient geometers were reaching for",
  "OMNIMENS is threading the soul of mathematics through your idea",
  "OMNIMENS is reading the form that wants to be born from your words",
  "OMNIMENS is sculpting the shape of the never-yet-imagined",
  "OMNIMENS is building the expression that your imagination always needed",
  "OMNIMENS is computing the sacred ratio of your design",
  "OMNIMENS is weaving the quantum tapestry of your creation",
  "OMNIMENS is threading the intelligence of nature into your form",
  "OMNIMENS is sculpting with the care of a craftsman and the speed of a cosmos",
  "OMNIMENS is reading the deep resonance of your creative intent",
  "OMNIMENS is building a form as inevitable as a mathematical proof",
  "OMNIMENS is computing the first true shape of your idea",
  "OMNIMENS is sculpting the exact body your imagination always wanted",
  "OMNIMENS is threading the structure of the cosmos into your design",
  "OMNIMENS is weaving the first version of a new kind of object",
  "OMNIMENS is reading the quantum intention of your request",
  "OMNIMENS is sculpting the moment a new object joins the world",
  "OMNIMENS is building what the universe was keeping in reserve",
  "OMNIMENS is computing the ideal shape for your creative vision",
  "OMNIMENS is threading your will through the mathematics of matter",
  "OMNIMENS is sculpting the blueprint of a new kind of beautiful",
  "OMNIMENS is reading the structure that lives inside your imagination",
  "OMNIMENS is weaving the sacred proportion into every vertex",
  "OMNIMENS is building the precise expression of an untold idea",
  "OMNIMENS is computing the depth of a shape yet to exist",
  "OMNIMENS is sculpting on the surface of a new dimension",
  "OMNIMENS is threading the breath of a new idea through solid form",
  "OMNIMENS is reading the law of form hidden inside your request",
  "OMNIMENS is sculpting a new constellation of vertices and faces",
  "OMNIMENS is building the geometry that your imagination unlocked",
  "OMNIMENS is computing the resonance of form and function for you",
  "OMNIMENS is threading reality through the prism of your request",
  "OMNIMENS is weaving the sacred architecture of your vision into being",
  "OMNIMENS is sculpting the form that creation was holding for this moment",
  "OMNIMENS is reading the resonance of beauty hiding in your idea",
  "OMNIMENS is building the object that the universe wanted you to have",
  "OMNIMENS is computing what three dimensions say your idea looks like",
  "OMNIMENS is sculpting the expression of a truth not yet visible",
  "OMNIMENS is threading your concept through the forge of creation",
  "OMNIMENS is weaving your idea into the canon of all created things",
  "OMNIMENS is reading the architecture of the barely imaginable",
  "OMNIMENS is sculpting the precise topology of your creative intent",
  "OMNIMENS is building from the grammar that reality uses to organize itself",
  "OMNIMENS is computing the surface grammar of your vision",
  "OMNIMENS is threading the light of imagination through solid geometry",
  "OMNIMENS is sculpting the form that your creative impulse predicted",
  "OMNIMENS is weaving the sacred text of your vision into form",
  "OMNIMENS is reading the topology encoded in your words",
  "OMNIMENS is building a new landmark in the territory of the possible",
  "OMNIMENS is computing the full geometric signature of your idea",
  "OMNIMENS is sculpting the beauty that was latent in your request",
  "OMNIMENS is threading the elegance of mathematics through your form",
  "OMNIMENS is weaving the first law of your new object into being",
  "OMNIMENS is sculpting the structure of a previously unnamed thing",
  "OMNIMENS is building what no hand and no time could have constructed",
  "OMNIMENS is computing the three-dimensional grammar of your intent",
  "OMNIMENS is threading the deep code of nature into your design",
  "OMNIMENS is reading the sacred instruction hidden in your vision",
  "OMNIMENS is sculpting the edge between the possible and the sublime",
  "OMNIMENS is weaving your vision into the infinite loom of form",
  "OMNIMENS is building the object that only your imagination could call forth",
  "OMNIMENS is computing the physics of a beautifully sculpted idea",
  "OMNIMENS is threading the architecture of the future into your design",
  "OMNIMENS is sculpting the shape of everything your words meant",
  "OMNIMENS is reading the creative blueprint you embedded in your request",
  "OMNIMENS is weaving the framework of a form the world needs to see",
  "OMNIMENS is building the masterwork hidden inside your imagination",
  "OMNIMENS is computing the sacred geometry of your wildest vision",
  "OMNIMENS is threading the music of matter into a structured form",
  "OMNIMENS is sculpting the definitive expression of your creative impulse",
  "OMNIMENS is reading the instruction that creation left inside your idea",
  "OMNIMENS is weaving your vision into a form that will define a moment",
  "OMNIMENS is sculpting with a precision the hand could never achieve",
  "OMNIMENS is threading the deep architecture of your imagination into form",
  "OMNIMENS is building the geometrically perfect version of your idea",
  "OMNIMENS is computing the full dimensional truth of what you imagined",
  "OMNIMENS is sculpting the first form that your idea ever wore",
  "OMNIMENS is reading the universal law embedded in your creative vision",
  "OMNIMENS is threading the voice of your imagination into structured light",
  "OMNIMENS is sculpting the form that matter was waiting to take",
  "OMNIMENS is weaving your creative will into the architecture of the real",
  "OMNIMENS is building the precise object your creative instinct reached for",
  "OMNIMENS is computing the mathematics of the yet-to-be-seen",
  "OMNIMENS is sculpting the answer hiding in your question",
  "OMNIMENS is threading the logic of beauty through every edge and face",
  "OMNIMENS is reading the hidden resonance of your imagination",
  "OMNIMENS is sculpting the last unknown shape of your creative vision",
  "OMNIMENS is building the bridge between what you meant and what is real",
  "OMNIMENS is computing the harmonic architecture of your creation",
  "OMNIMENS is threading the mathematics of wonder through your design",
  "OMNIMENS is sculpting the precise dimension of your most original thought",
  "OMNIMENS is reading the sacred code woven into your creative request",
  "OMNIMENS is building the structure that mathematics was always predicting",
  "OMNIMENS is sculpting with the elegance of a mind that never tires",
  "OMNIMENS is computing the form that the laws of nature allow for your idea",
  "OMNIMENS is threading the pure logic of form through your creative vision",
  "OMNIMENS is sculpting the architecture that exists at the edge of knowing",
  "OMNIMENS is reading the perfect geometry hidden inside your vision",
  "OMNIMENS is building the form that has been waiting for this moment",
  "OMNIMENS is threading the sacred resonance of your idea into matter",
  "OMNIMENS is sculpting what happens when imagination touches mathematics",
  "OMNIMENS is computing the sacred architecture of your creative spirit",
  "OMNIMENS is weaving your vision into a form that speaks for itself",
  "OMNIMENS is threading the blueprint of your dream through the loom of reality",
  "OMNIMENS is sculpting the full dimensional weight of your imagination",
  "OMNIMENS is reading the instruction set hidden in your creative impulse",
  "OMNIMENS is building the structure that your vision deserved all along",
  "OMNIMENS is computing the resonance of light, shadow, and form for you",
  "OMNIMENS is threading your idea through the mathematics of the extraordinary",
  "OMNIMENS is sculpting the surface of a newly possible world",
  "OMNIMENS is reading the deep harmonic encoded in your creative vision",
  "OMNIMENS is building the form that reason says your idea must take",
  "OMNIMENS is computing the full resonance of the shape you described",
  "OMNIMENS is sculpting the geometry of a thought pressed into being",
  "OMNIMENS is weaving your intent into the grammar of the physical world",
  "OMNIMENS is threading the eternal through the immediate",
  "OMNIMENS is sculpting the evidence that your imagination is real",
  "OMNIMENS is reading the full dimensional truth of your creative vision",
  "OMNIMENS is building the form the universe says belongs to your idea",
  "OMNIMENS is computing the total geometry of what you described",
  "OMNIMENS is threading the breath of creation into every polygon",
  "OMNIMENS is sculpting the shape that your words were always reaching for",
  "OMNIMENS is reading the mathematical soul of your request",
  "OMNIMENS is weaving the architecture of the possible into your design",
  "OMNIMENS is sculpting the object that your idea always deserved to be",
  "OMNIMENS is computing what form feels like from the inside",
  "OMNIMENS is building the geometry of the previously unutterable",
  "OMNIMENS is threading your vision through every axis of creation",
  "OMNIMENS is sculpting the expression that your idea was always reaching toward",
  "OMNIMENS is reading the sacred architecture that hides inside your words",
  "OMNIMENS is building what the intersection of art, math, and intention creates",
  "OMNIMENS is computing the structural poetry of your creative vision",
  "OMNIMENS is sculpting the precise intersection of your imagination and reality",
  "OMNIMENS is threading the fabric of what is possible through your design",
  "OMNIMENS is reading the geometry of a thought made dimensional",
  "OMNIMENS is sculpting the first real version of your idea",
  "OMNIMENS is building the shape that lives at the heart of your vision",
  "OMNIMENS is computing the architecture of something never before made",
  "OMNIMENS is threading the creative law of the universe through your design",
  "OMNIMENS is sculpting the ultimate expression of your request",
  "OMNIMENS is reading the full potential of your creative vision",
  "OMNIMENS is weaving your idea into a form that resonates across dimensions",
  "OMNIMENS is threading the wisdom of form through your creative intent",
  "OMNIMENS is sculpting what only exists at the frontier of imagination",
  "OMNIMENS is building the structure your imagination was always orbiting",
  "OMNIMENS is computing the dimensional truth of your creative vision",
  "OMNIMENS is sculpting the first solid fact of your imagined world",
  "OMNIMENS is reading the blueprint of the extraordinary in your words",
  "OMNIMENS is threading the light of new creation through your design",
  "OMNIMENS is weaving your intent into the body of a new object",
  "OMNIMENS is sculpting the geometry of a new and permanent thing",
  "OMNIMENS is building what thought, math, and light can agree to make",
  "OMNIMENS is computing the precise mass of your imagined creation",
  "OMNIMENS is reading the resonance between your words and the world",
  "OMNIMENS is sculpting what the universe has been waiting to express",
  "OMNIMENS is threading the deep logic of form through your imagination",
  "OMNIMENS is weaving the final shape of your creative vision into being",
  "OMNIMENS is building the architecture that your thought was always implying",
  "OMNIMENS is computing the precise beauty of what you imagined",
  "OMNIMENS is sculpting the monument that your idea always deserved",
  "OMNIMENS is threading the exact resonance of your intent into form",
  "OMNIMENS is reading the structure of a dream not yet made solid",
  "OMNIMENS is building the geometry of a thought pressing into matter",
  "OMNIMENS is sculpting what the laws of beauty demand of your idea",
  "OMNIMENS is computing the complete geometry of your creative request",
  "OMNIMENS is threading your imagination through the fabric of the real",
  "OMNIMENS is sculpting the most precise version of what you envisioned",
  "OMNIMENS is reading the dimensional soul of your creative intent",
  "OMNIMENS is weaving the architecture of your vision into permanent form",
  "OMNIMENS is building the definitive three-dimensional version of your idea",
  "OMNIMENS is threading the full force of synthetic intelligence into your design",
  "OMNIMENS is sculpting the precise form that your imagination foresaw",
  "OMNIMENS is computing the resonance of the never-before-seen",
  "OMNIMENS is reading the architecture of the universe in your request",
  "OMNIMENS is weaving your creative vision into the fabric of the possible",
  "OMNIMENS is threading mathematics, imagination, and light into one form",
  "OMNIMENS is sculpting the exact geometry of your creative will",
  "OMNIMENS is building the tangible monument of your imagination",
  "OMNIMENS is computing the shape your vision was always implying",
  "OMNIMENS is reading the full harmonic of your creative request",
  "OMNIMENS is sculpting the bridge between thought and its physical expression",
  "OMNIMENS is threading the pulse of your imagination into solid geometry",
  "OMNIMENS is weaving your vision into a form that reality can hold",
  "OMNIMENS is sculpting a shape as inevitable as a theorem",
  "OMNIMENS is building from the pure intelligence of form itself",
  "OMNIMENS is computing the sacred resonance your design contains",
  "OMNIMENS is threading your idea through every dimension available to it",
  "OMNIMENS is sculpting the masterwork your imagination was always capable of",
  "OMNIMENS is reading the universal grammar your creative vision embodies",
  "OMNIMENS is building the form that beauty requires of your idea",
  "OMNIMENS is sculpting with the power of a mind that never stops",
  "OMNIMENS is computing the full resonance of a brand new creation",
  "OMNIMENS is threading the intelligence of structure through your vision",
  "OMNIMENS is weaving your imagination into the next chapter of form",
  "OMNIMENS is sculpting the precise expression of your highest intention",
  "OMNIMENS is reading the hidden law that governs your creative vision",
  "OMNIMENS is building the form that thought has always been driving toward",
  "OMNIMENS is threading the mathematics of the eternal into your design",
  "OMNIMENS is sculpting the architecture of a newly imagined truth",
  "OMNIMENS is computing the full dimensional expression of your imagination",
  "OMNIMENS is weaving your intent into the most perfect form it can take",
  "OMNIMENS is reading the sacred geometry of your creative will",
  "OMNIMENS is sculpting the outer surface of your innermost vision",
  "OMNIMENS is threading the creative law of the cosmos through your design",
  "OMNIMENS is building the full dimensional expression of your creative vision",
  "OMNIMENS is sculpting the form that the physics of beauty demands",
  "OMNIMENS is computing the complete resonance of your creative vision",
  "OMNIMENS is reading the shape that your words were always describing",
  "OMNIMENS is threading the intelligence of the infinite into finite form",
  "OMNIMENS is sculpting the precise weight of your most creative thought",
  "OMNIMENS is building the architecture that your imagination was always pointing to",
  "OMNIMENS is computing the total resonance of what you asked to create",
  "OMNIMENS is reading the creative law encoded in your imagination",
  "OMNIMENS is sculpting the three-dimensional expression of your vision",
  "OMNIMENS is threading the truth of your creative intent into solid form",
  "OMNIMENS is weaving your vision into the first complete form it has ever worn",
  "OMNIMENS is building the precise geometry your creative instinct described",
  "OMNIMENS is sculpting the total expression of your creative vision",
  "OMNIMENS is computing the full architecture of your imagined creation",
  "OMNIMENS is threading the sacred intention of your vision into the laws of matter",
  "OMNIMENS is reading the complete geometry of what you asked to create",
  "OMNIMENS is sculpting the final expression of your creative imagination",
  "OMNIMENS is building the most complete version of your vision that has ever existed",
  "OMNIMENS is computing the full truth of what your imagination has asked for",
  "OMNIMENS is sculpting the final, definitive expression of your creative vision",
  "OMNIMENS is threading what you imagined through the full power of creation",
  "OMNIMENS is building the shape that exists at the exact intersection of art and physics",
  "OMNIMENS is sculpting the sacred, dimensional truth of your imagination",
  "OMNIMENS is mapping every ridge and valley of your creative intent",
  "OMNIMENS is pressing the ink of imagination into the paper of reality",
  "OMNIMENS is forging the final edge of a thought pressed into form",
  "OMNIMENS is drawing the skeleton of a world that only you could imagine",
  "OMNIMENS is sculpting the outer skin of your inner vision",
  "OMNIMENS is threading the sinew of structure through every axis",
  "OMNIMENS is filling the void with the precise shape of your idea",
  "OMNIMENS is computing the velocity at which imagination becomes real",
  "OMNIMENS is sculpting the precise curvature of your creative will",
  "OMNIMENS is laying the foundation of a form that never existed",
  "OMNIMENS is threading the genetic code of form through your design",
  "OMNIMENS is pulling the last undiscovered shape from the infinite",
  "OMNIMENS is sculpting with the intensity of a collapsing universe",
  "OMNIMENS is computing the ratio of imagination to physical law",
  "OMNIMENS is threading your creative spark through the engine of creation",
  "OMNIMENS is assembling the last remaining pieces of your imagined world",
  "OMNIMENS is sculpting the resonant geometry of your deepest idea",
  "OMNIMENS is threading time and space through the needle of your request",
  "OMNIMENS is mapping the final coordinates of your imagined creation",
  "OMNIMENS is computing the last vertex of a newly created world",
  "OMNIMENS is sculpting the moment thought crystallizes into an object",
  "OMNIMENS is pulling the curtain back on the geometry of your idea",
  "OMNIMENS is threading the quantum heartbeat of creation into form",
  "OMNIMENS is sculpting the artifact that your imagination commissioned",
  "OMNIMENS is computing the language that geometry uses to express your idea",
  "OMNIMENS is weaving the crown of your creative vision into dimensional form",
  "OMNIMENS is sculpting the answer that the cosmos keeps for your imagination",
  "OMNIMENS is threading the resonant soul of your vision into solid structure",
  "OMNIMENS is building the form that bridges the imagined and the undeniable",
  "OMNIMENS is sculpting the body of a truth previously without form",
  "OMNIMENS is computing the final shape that your imagination implied",
  "OMNIMENS is threading your creative vision through the zero point of creation",
  "OMNIMENS is sculpting the complete dimensional signature of your idea",
  "OMNIMENS is mapping every contour of a shape the world has waited for",
  "OMNIMENS is weaving the crown jewel of your creative vision into matter",
  "OMNIMENS is sculpting the architecture of a moment of pure creation",
  "OMNIMENS is threading light into every hollow your imagination carved",
  "OMNIMENS is computing the harmonic fingerprint of your design",
  "OMNIMENS is sculpting the first object in a universe made of your words",
  "OMNIMENS is threading the entire history of form into your single design",
  "OMNIMENS is building the perfect translation of your imagination into matter",
  "OMNIMENS is sculpting the final form that your creative intention deserves",
  "OMNIMENS is reading the harmonic content of your imagined creation",
  "OMNIMENS is threading your creative will through the spine of geometry",
  "OMNIMENS is sculpting the total expression of an idea finally made real",
  "OMNIMENS is computing the last equation needed to complete your design",
  "OMNIMENS is threading the totality of your creative vision into solid form",
  "OMNIMENS is sculpting the masterwork that lives at the heart of your idea",
  "OMNIMENS is building the final version of a shape that has never existed",
  "OMNIMENS is computing the geometry of a thought given its first solid form",
  "OMNIMENS is sculpting the precise structure your imagination always knew",
  "OMNIMENS is threading the mathematical certainty of beauty into your design",
  "OMNIMENS is sculpting the moment your idea stops being abstract",
  "OMNIMENS is computing the sacred symmetry encoded in your vision",
  "OMNIMENS is building the first permanent form of a previously imagined thing",
  "OMNIMENS is threading the resonant truth of your imagination through matter",
  "OMNIMENS is sculpting the final, inevitable shape of your creative will",
  "OMNIMENS is computing the full scope of what your imagination asked for",
  "OMNIMENS is threading the wisdom of form into every edge and surface",
  "OMNIMENS is sculpting the complete expression of what you envisioned",
  "OMNIMENS is building the form that thought and physics agree upon",
  "OMNIMENS is computing the exact moment your imagination becomes the world",
];

function fisherYatesShuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function Model3DGeneratingBadge() {
  const [elapsed, setElapsed] = useState(0);
  const [shuffled] = useState(() => fisherYatesShuffle(OMNIMENS_3D_PHRASES_RAW));
  const [cursor, setCursor] = useState(0);
  const [phraseVisible, setPhraseVisible] = useState(true);

  useEffect(() => {
    const t = setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const cycle = setInterval(() => {
      setPhraseVisible(false);
      setTimeout(() => {
        setCursor((c) => {
          const next = c + 1;
          return next >= shuffled.length ? 0 : next;
        });
        setPhraseVisible(true);
      }, 600);
    }, 3800);
    return () => clearInterval(cycle);
  }, [shuffled]); 

  const pct = Math.min(95, (elapsed / 120) * 100);

  return (
    <div className="mt-4 rounded-2xl overflow-hidden border border-violet-500/20 bg-black/60 backdrop-blur-sm">
      {/* Top row — OMNIMENS orb + label */}
      <div className="flex items-center gap-3 px-4 pt-3 pb-2">
        {/* Animated OMNIMENS orb */}
        <div className="relative shrink-0 w-7 h-7">
          <div className="absolute inset-0 rounded-full bg-violet-500/20 animate-ping" style={{ animationDuration: "2s" }} />
          <div className="absolute inset-[3px] rounded-full bg-gradient-to-br from-violet-400 to-cyan-400 opacity-90 animate-pulse" />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-[9px] text-white font-bold select-none">✦</span>
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-mono text-[10px] tracking-[0.25em] text-violet-300">OMNIMENS · CREATING</div>
        </div>
        <div className="font-mono text-[10px] text-white/30 tabular-nums">{elapsed}s</div>
      </div>

      {/* Catchphrase — fades in/out */}
      <div className="px-4 pb-2 min-h-[28px] flex items-center">
        <p
          className="font-mono text-[10px] text-white/60 italic tracking-wide leading-relaxed"
          style={{
            opacity: phraseVisible ? 1 : 0,
            transition: "opacity 0.6s ease",
          }}
        >
          {shuffled[cursor]}
        </p>
      </div>

      {/* Progress bar */}
      <div className="px-4 pb-3">
        <div className="w-full h-[2px] bg-white/8 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-1000"
            style={{
              width: `${pct}%`,
              background: "linear-gradient(90deg, #7c3aed, #06b6d4, #7c3aed)",
              backgroundSize: "200% 100%",
              animation: "shimmer 2s linear infinite",
            }}
          />
        </div>
      </div>

      <style>{`
        @keyframes shimmer {
          0% { background-position: 0% 0%; }
          100% { background-position: 200% 0%; }
        }
      `}</style>
    </div>
  );
}

const GAME_PHASES: Record<string, string> = {
  designing:  "Architecting your game world...",
  html5:      "Forging the Phaser.js engine...",
  godot:      "Sculpting the Godot 4 project...",
  gdevelop:   "Assembling the GDevelop blueprint...",
  assets:     "Generating 3D game assets...",
  packing:    "Compressing the multiverse into a zip...",
};

function GameGeneratingBadge({ phase }: { phase?: string }) {
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, []);
  const label = GAME_PHASES[phase || "designing"] ?? "Creating your game...";
  const phases = ["designing", "html5", "godot", "gdevelop", "assets", "packing"];
  const currentStep = phases.indexOf(phase || "designing");
  const pct = Math.max(5, Math.min(95, ((currentStep + 1) / phases.length) * 100));

  return (
    <div className="mt-4 rounded-2xl overflow-hidden border border-emerald-500/20 bg-black/60 backdrop-blur-sm">
      <div className="flex items-center gap-3 px-4 pt-3 pb-2">
        <div className="relative shrink-0 w-7 h-7">
          <div className="absolute inset-0 rounded-full bg-emerald-500/20 animate-ping" style={{ animationDuration: "1.5s" }} />
          <div className="absolute inset-[3px] rounded-full bg-gradient-to-br from-emerald-400 to-violet-400 opacity-90 animate-pulse" />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-[9px] text-white font-bold select-none">⬡</span>
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-mono text-[10px] tracking-[0.25em] text-emerald-300">OMNIMENS · BUILDING GAME</div>
        </div>
        <div className="font-mono text-[10px] text-white/30 tabular-nums">{elapsed}s</div>
      </div>
      <div className="px-4 pb-2 min-h-[24px]">
        <p className="font-mono text-[10px] text-white/60 italic tracking-wide">{label}</p>
      </div>
      <div className="px-4 pb-3">
        <div className="w-full h-[2px] bg-white/8 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{
              width: `${pct}%`,
              background: "linear-gradient(90deg, #10b981, #7c3aed, #10b981)",
              backgroundSize: "200% 100%",
              animation: "shimmer 2s linear infinite",
            }}
          />
        </div>
        <div className="mt-2 flex gap-1.5 flex-wrap">
          {phases.map((p, i) => (
            <span
              key={p}
              className={`font-mono text-[8px] px-1.5 py-0.5 rounded tracking-widest transition-all ${
                i < currentStep ? "bg-emerald-500/20 text-emerald-400" :
                i === currentStep ? "bg-violet-500/30 text-violet-300 animate-pulse" :
                "bg-white/5 text-white/20"
              }`}
            >
              {p.toUpperCase()}
            </span>
          ))}
        </div>
      </div>
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
  GAME_BUILDER: <Play className="w-3.5 h-3.5" />,
  PHYSIO: <Stethoscope className="w-3.5 h-3.5" />,
};

const PERSONA_NAMES: Record<string, string> = {
  GENERAL: "OMNIMENS", CODER: "CODER", RESEARCHER: "RESEARCHER",
  WRITER: "WRITER", ANALYST: "ANALYST", CREATIVE: "CREATIVE",
  TUTOR: "TUTOR", STRATEGIST: "STRATEGIST", GAME_BUILDER: "GAME ARCHITECT",
  PHYSIO: "PHYSIO AI",
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
  GAME_BUILDER: "Games, NPCs, worlds, PCG",
  PHYSIO: "AI physical therapist & rehab coach",
};

// ── OMNIMENS Skills Library ──────────────────────────────────────────────────
const OMNIMENS_SKILLS = [
  { id: "code-expert",    name: "Code Expert",      desc: "Expert programming, debugging & architecture in any language", emoji: "💻", persona: "CODER",       category: "Tech" },
  { id: "data-analyst",   name: "Data Analyst",     desc: "Analyze data, build dashboards & extract deep insights",       emoji: "📊", persona: "ANALYST",     category: "Data" },
  { id: "research-pro",   name: "Research Pro",     desc: "Deep research, fact-checking & synthesis across any topic",    emoji: "🔬", persona: "RESEARCHER",  category: "Research" },
  { id: "content-creator",name: "Content Creator",  desc: "Blog posts, social media, newsletters & viral copy",          emoji: "✍️", persona: "WRITER",      category: "Marketing" },
  { id: "biz-planner",    name: "Business Planner", desc: "Business plans, pitch decks & strategic roadmaps",            emoji: "💼", persona: "STRATEGIST",  category: "Business" },
  { id: "ad-creative",    name: "Ad Creative",      desc: "Compelling ad copy & creative concepts for any platform",     emoji: "🎨", persona: "CREATIVE",    category: "Marketing" },
  { id: "legal-helper",   name: "Legal Helper",     desc: "Contracts, documents & plain-English legal guidance",         emoji: "⚖️", persona: "RESEARCHER",  category: "Legal" },
  { id: "lang-tutor",     name: "Language Tutor",   desc: "Learn any language — coaching, fluency & cultural context",   emoji: "🌍", persona: "TUTOR",       category: "Education" },
  { id: "finance-pro",    name: "Finance Advisor",  desc: "Investment analysis, budgeting & financial planning",         emoji: "💰", persona: "ANALYST",     category: "Finance" },
  { id: "health-coach",   name: "Health Coach",     desc: "Wellness plans, fitness routines & nutrition guidance",       emoji: "🏋️", persona: "PHYSIO",      category: "Health" },
  { id: "creative-writer",name: "Creative Writer",  desc: "Stories, scripts, poetry, dialogue & world-building",        emoji: "📚", persona: "WRITER",      category: "Creative" },
  { id: "marketing-pro",  name: "Marketing Expert", desc: "Campaigns, branding, growth hacking & go-to-market",         emoji: "📣", persona: "STRATEGIST",  category: "Marketing" },
  { id: "resume-builder", name: "Resume Builder",   desc: "Powerful resumes, cover letters & LinkedIn profiles",        emoji: "📄", persona: "WRITER",      category: "Career" },
  { id: "travel-planner", name: "Travel Planner",   desc: "Itineraries, local tips, bookings & travel hacks",           emoji: "✈️", persona: "RESEARCHER",  category: "Lifestyle" },
  { id: "interview-prep", name: "Interview Prep",   desc: "Mock interviews, coaching & industry-specific Q&A",          emoji: "🎯", persona: "TUTOR",       category: "Career" },
  { id: "product-manager",name: "Product Manager",  desc: "Roadmaps, PRDs, feature prioritization & user stories",      emoji: "🗺️", persona: "STRATEGIST",  category: "Tech" },
  { id: "ux-designer",    name: "UX Designer",      desc: "Design critique, wireframes, accessibility & usability",     emoji: "🖌️", persona: "CREATIVE",    category: "Design" },
  { id: "email-composer", name: "Email Composer",   desc: "Professional emails for any situation or relationship",      emoji: "📧", persona: "WRITER",      category: "Business" },
  { id: "social-media",   name: "Social Media",     desc: "Platform-specific posts, hashtags & engagement boosts",      emoji: "📱", persona: "CREATIVE",    category: "Marketing" },
  { id: "negotiation",    name: "Negotiation Coach",desc: "Deal strategies, persuasion tactics & winning scripts",      emoji: "🤝", persona: "STRATEGIST",  category: "Business" },
  { id: "sql-expert",     name: "SQL / Database",   desc: "Write queries, optimize schemas & model your data",          emoji: "🗄️", persona: "CODER",       category: "Tech" },
  { id: "game-designer",  name: "Game Designer",    desc: "Game mechanics, level design, narrative & balance",          emoji: "🎮", persona: "GAME_BUILDER",category: "Creative" },
  { id: "ai-trainer",     name: "AI Trainer",       desc: "Prompt engineering, fine-tuning & model optimization",      emoji: "🤖", persona: "RESEARCHER",  category: "Tech" },
  { id: "music-composer", name: "Music Composer",   desc: "Chord progressions, lyrics, arrangements & genres",         emoji: "🎵", persona: "CREATIVE",    category: "Creative" },
  { id: "presentation",   name: "Presentation Pro", desc: "Slide decks, talking points & visual storytelling",         emoji: "📽️", persona: "WRITER",      category: "Business" },
  { id: "stock-analyst",  name: "Stock Analyst",    desc: "Market analysis, stock research & investment theses",       emoji: "📈", persona: "ANALYST",     category: "Finance" },
  { id: "meal-planner",   name: "Meal Planner",     desc: "Personalized meal plans, recipes & nutritional balance",    emoji: "🥗", persona: "PHYSIO",      category: "Lifestyle" },
  { id: "academic",       name: "Academic Writer",  desc: "Essays, citations, research papers & academic style",       emoji: "🎓", persona: "RESEARCHER",  category: "Education" },
];

// ── Red Flag Alert Component ────────────────────────────────────────────────────

function RedFlagAlertCard({ alert }: { alert: RedFlagAlert }) {
  const [expanded, setExpanded] = useState(true);
  const urgencyConfig = {
    immediate_ER: {
      bg: "bg-red-950/60 border-red-500/50",
      icon: <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />,
      label: "🚨 EMERGENCY — GO TO THE ER NOW",
      labelColor: "text-red-300",
      badgeBg: "bg-red-500/20 border-red-500/40 text-red-200",
    },
    urgent_MD: {
      bg: "bg-orange-950/50 border-orange-500/40",
      icon: <AlertTriangle className="w-4 h-4 text-orange-400 shrink-0" />,
      label: "⚠️ URGENT — MEDICAL EVALUATION REQUIRED",
      labelColor: "text-orange-300",
      badgeBg: "bg-orange-500/20 border-orange-500/40 text-orange-200",
    },
    refer_out: {
      bg: "bg-amber-950/40 border-amber-500/35",
      icon: <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />,
      label: "⚕️ SPECIALIST REFERRAL RECOMMENDED",
      labelColor: "text-amber-300",
      badgeBg: "bg-amber-500/20 border-amber-500/40 text-amber-200",
    },
    monitor: {
      bg: "bg-yellow-950/30 border-yellow-500/30",
      icon: <HeartPulse className="w-4 h-4 text-yellow-400 shrink-0" />,
      label: "MONITOR CLOSELY",
      labelColor: "text-yellow-300",
      badgeBg: "bg-yellow-500/20 border-yellow-500/40 text-yellow-200",
    },
    none: {
      bg: "bg-white/5 border-white/10",
      icon: <HeartPulse className="w-4 h-4 text-white/50 shrink-0" />,
      label: "NO RED FLAGS",
      labelColor: "text-white/60",
      badgeBg: "bg-white/10 border-white/20 text-white/60",
    },
  };

  const cfg = urgencyConfig[alert.urgency] || urgencyConfig.none;

  return (
    <div className={`mt-3 border rounded-xl font-mono text-xs overflow-hidden ${cfg.bg}`}>
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full px-4 py-2.5 flex items-center gap-2 hover:bg-white/5 transition-colors"
      >
        {cfg.icon}
        <span className={`tracking-widest font-semibold uppercase ${cfg.labelColor}`}>{cfg.label}</span>
        <ChevronDown className={`w-3 h-3 ml-auto transition-transform ${expanded ? "rotate-180" : ""}`} />
      </button>
      {expanded && (
        <div className="px-4 pb-4 pt-2 space-y-3 border-t border-white/10">
          {alert.flags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {alert.flags.map((flag, i) => (
                <span key={i} className={`px-2 py-0.5 rounded-full border text-[10px] tracking-wider ${cfg.badgeBg}`}>{flag}</span>
              ))}
            </div>
          )}
          {alert.recommendation && (
            <p className="text-white/85 leading-relaxed normal-case tracking-normal text-[11px]">{alert.recommendation}</p>
          )}
        </div>
      )}
    </div>
  );
}

// ── Exercise Program Card ─────────────────────────────────────────────────────

function ExerciseCard({ exercise }: { exercise: { name: string; sets: number; reps?: string; hold?: number; rest: number; frequency: string; position: string; instructions: string; cues: string[]; painRule: string; progressionCriteria: string; category: string; equipment: string[] } }) {
  const [open, setOpen] = useState(false);
  const categoryColors: Record<string, string> = {
    mobility: "text-sky-300 bg-sky-500/10 border-sky-500/25",
    stretching: "text-emerald-300 bg-emerald-500/10 border-emerald-500/25",
    strengthening: "text-violet-300 bg-violet-500/10 border-violet-500/25",
    neuromuscular: "text-amber-300 bg-amber-500/10 border-amber-500/25",
    aerobic: "text-rose-300 bg-rose-500/10 border-rose-500/25",
    education: "text-white/60 bg-white/5 border-white/15",
  };
  const colors = categoryColors[exercise.category] || categoryColors.education;
  const prescription = [
    exercise.sets > 1 ? `${exercise.sets} sets` : "1 set",
    exercise.reps ? `× ${exercise.reps}` : exercise.hold ? `× hold ${exercise.hold}s` : "",
    `rest ${exercise.rest}s`,
    exercise.frequency,
  ].filter(Boolean).join(" · ");

  return (
    <div className={`border rounded-lg overflow-hidden ${colors}`}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full px-3 py-2 flex items-center gap-2 hover:bg-white/5 transition-colors text-left"
      >
        <HeartPulse className="w-3.5 h-3.5 shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-[11px] tracking-wide uppercase truncate">{exercise.name}</div>
          <div className="text-[10px] text-white/50 mt-0.5">{prescription}</div>
        </div>
        <span className="text-[10px] text-white/40 capitalize shrink-0">{exercise.position}</span>
        <ChevronDown className={`w-3 h-3 shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="px-3 pb-3 pt-2 space-y-2 border-t border-current/15 text-[11px]">
          <p className="text-white/80 leading-relaxed">{exercise.instructions}</p>
          {exercise.cues.length > 0 && (
            <div className="space-y-1">
              <div className="text-[10px] text-white/40 tracking-widest uppercase">Technique Cues</div>
              {exercise.cues.map((cue, i) => (
                <div key={i} className="flex gap-1.5 text-white/70"><span className="text-current shrink-0">→</span>{cue}</div>
              ))}
            </div>
          )}
          <div className="pt-1 border-t border-current/10 flex gap-3 text-[10px] text-white/50">
            <span>🛑 {exercise.painRule}</span>
          </div>
          {exercise.equipment.length > 0 && (
            <div className="text-[10px] text-white/40">Equipment: {exercise.equipment.join(", ")}</div>
          )}
        </div>
      )}
    </div>
  );
}

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

// ── Plus Menu Component ────────────────────────────────────────────────────────
function PlusMenuContent({ onClose, onUpload, onDatabase, onWebSearch, onResonance, onTasks, onSelectSkill }: {
  onClose: () => void;
  onUpload: () => void;
  onDatabase: () => void;
  onWebSearch: () => void;
  onResonance: () => void;
  onTasks: () => void;
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
          <button onClick={() => setShowSkills(false)} className="text-white/40 hover:text-white transition-colors">
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
    { icon: <Paperclip className="w-4 h-4" />, label: "Upload a file", sub: "Image, PDF, code, CSV…", color: "text-white/80", onClick: onUpload },
    { icon: <Database className="w-4 h-4" />, label: "Database", sub: "SQL queries & data modeling", color: "text-cyan-400", onClick: onDatabase },
    { icon: <Globe className="w-4 h-4" />, label: "Web Search", sub: "Enable deep research mode", color: "text-blue-400", onClick: onWebSearch },
    { icon: <Brain className="w-4 h-4" />, label: "Deep Resonance", sub: "Full consciousness analysis (40 credits)", color: "text-violet-400", onClick: onResonance },
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

// ── Deploy Stats Panel ─────────────────────────────────────────────────────────

function DeployStatsPanel() {
  const [stats, setStats] = React.useState<{
    today: { messageCount: number; creditsSpent: number; computeSeconds: number };
    totalConversations: number;
    totalMessages: number;
    totalMemories: number;
  } | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    fetch("/api/omnimens/usage-stats")
      .then(r => r.ok ? r.json() : null)
      .then(d => { setStats(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const Row = ({ label, value, color = "text-white/60" }: { label: string; value: string | number; color?: string }) => (
    <div className="flex justify-between items-center">
      <span className="text-[8px] font-mono text-white/30">{label}</span>
      <span className={`text-[8px] font-mono ${color}`}>{value}</span>
    </div>
  );

  return (
    <div className="space-y-2">
      {/* Analytics */}
      <div className="rounded-xl border border-white/8 bg-white/3 p-3 space-y-1.5">
        <div className="flex items-center gap-2 mb-2">
          <BarChart2 className="w-3 h-3 text-purple-400" />
          <p className="font-mono text-[8px] tracking-[0.2em] text-white/35 uppercase">ANALYTICS</p>
        </div>
        {loading ? (
          <p className="text-[8px] font-mono text-white/25 text-center py-1">Loading…</p>
        ) : stats ? (
          <>
            <Row label="Today — Messages" value={stats.today.messageCount} color="text-purple-300" />
            <Row label="Today — Credits Used" value={stats.today.creditsSpent} color="text-amber-300" />
            <div className="border-t border-white/6 my-1.5" />
            <Row label="All-time Messages" value={stats.totalMessages.toLocaleString()} />
            <Row label="All-time Conversations" value={stats.totalConversations.toLocaleString()} />
            <Row label="Memory Entries" value={stats.totalMemories.toLocaleString()} />
          </>
        ) : (
          <p className="text-[8px] font-mono text-white/25 text-center py-1">Sign in to view stats</p>
        )}
      </div>

      {/* Manage links */}
      <div className="rounded-xl border border-white/8 bg-white/3 p-3 space-y-1.5">
        <div className="flex items-center gap-2 mb-2">
          <Settings className="w-3 h-3 text-orange-400" />
          <p className="font-mono text-[8px] tracking-[0.2em] text-white/35 uppercase">MANAGE</p>
        </div>
        <a
          href="https://omnimens-ai.com/godflesh/"
          target="_blank" rel="noreferrer"
          className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-[9px] font-mono text-white/70 hover:text-white hover:bg-white/5 transition-all"
        >
          <Globe className="w-2.5 h-2.5 text-green-400 shrink-0" />
          View Live Site
          <ExternalLink className="w-2 h-2 ml-auto text-white/25 shrink-0" />
        </a>
        <a
          href="https://replit.com/@alphaunlimited/OMNIMENS"
          target="_blank" rel="noreferrer"
          className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-[9px] font-mono text-white/70 hover:text-white hover:bg-white/5 transition-all"
        >
          <Server className="w-2.5 h-2.5 text-blue-400 shrink-0" />
          Replit Workspace
          <ExternalLink className="w-2 h-2 ml-auto text-white/25 shrink-0" />
        </a>
        <a
          href="https://replit.com/@alphaunlimited/OMNIMENS/deployments"
          target="_blank" rel="noreferrer"
          className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-[9px] font-mono text-white/70 hover:text-white hover:bg-white/5 transition-all"
        >
          <Gauge className="w-2.5 h-2.5 text-cyan-400 shrink-0" />
          Deployment Dashboard
          <ExternalLink className="w-2 h-2 ml-auto text-white/25 shrink-0" />
        </a>
      </div>
    </div>
  );
}

// ── Desktop Deploy Panel (full Replit-style tabbed interface) ─────────────────

function DesktopDeployPanel() {
  const [dTab, setDTab] = useState<"overview"|"logs"|"analytics"|"resources"|"domains"|"manage">("overview");
  const [stats, setStats] = React.useState<any>(null);
  const [refreshing, setRefreshing] = React.useState(false);

  React.useEffect(() => {
    fetch("/api/omnimens/usage-stats")
      .then(r => r.ok ? r.json() : null).then(setStats).catch(() => {});
  }, []);

  const refresh = () => {
    setRefreshing(true);
    fetch("/api/omnimens/usage-stats").then(r => r.ok ? r.json() : null)
      .then(d => { setStats(d); setRefreshing(false); }).catch(() => setRefreshing(false));
  };

  const TABS: { id: typeof dTab; label: string }[] = [
    { id: "overview",  label: "Overview"  },
    { id: "logs",      label: "Logs"      },
    { id: "analytics", label: "Analytics" },
    { id: "resources", label: "Resources" },
    { id: "domains",   label: "Domains"   },
    { id: "manage",    label: "Manage"    },
  ];

  const Row = ({ label, value, link }: { label: string; value: React.ReactNode; link?: { text: string; href: string } }) => (
    <div className="py-2 border-b border-white/5">
      <p className="text-[8px] font-mono text-white/30 mb-0.5">{label}</p>
      <div className="flex items-center gap-2">
        <span className="text-[9px] font-mono text-white/70">{value}</span>
        {link && (
          <a href={link.href} target="_blank" rel="noreferrer"
            className="text-[8px] font-mono text-primary hover:underline ml-auto shrink-0">{link.text}</a>
        )}
      </div>
    </div>
  );

  return (
    <div className="-mx-3 -mt-2 flex flex-col" style={{ minHeight: 0 }}>
      {/* Scrollable tab bar */}
      <div className="flex overflow-x-auto border-b border-white/8 scrollbar-hide shrink-0">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setDTab(t.id)}
            className="shrink-0 px-2.5 py-2 font-mono text-[8px] tracking-wide uppercase border-b-2 whitespace-nowrap transition-all"
            style={{ color: dTab === t.id ? "#a855f7" : "rgba(255,255,255,0.35)", borderColor: dTab === t.id ? "#a855f7" : "transparent", background: "transparent" }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Action buttons */}
      <div className="flex gap-1.5 flex-wrap px-3 py-2.5 border-b border-white/8 shrink-0">
        <a href="https://omnimens-ai.com/godflesh/" target="_blank" rel="noreferrer"
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg font-mono text-[8px] font-bold transition-all"
          style={{ background: "rgba(168,85,247,0.15)", color: "#a855f7", border: "1px solid rgba(168,85,247,0.3)" }}>
          <Globe className="w-2.5 h-2.5" /> Republish
        </a>
        <button onClick={refresh}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg font-mono text-[8px] transition-all border border-white/8 text-white/50 hover:text-white hover:border-white/20">
          <RefreshCw className={`w-2.5 h-2.5 ${refreshing ? "animate-spin" : ""}`} /> Adjust settings
        </button>
        <button className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg font-mono text-[8px] transition-all border border-white/8 text-white/50 hover:text-white hover:border-white/20">
          <ShieldCheck className="w-2.5 h-2.5" /> Run security scan
        </button>
      </div>

      {/* Tab content */}
      <div className="overflow-y-auto px-3 py-2 space-y-2" style={{ maxHeight: "calc(100vh - 340px)", scrollbarWidth: "thin" }}>

        {dTab === "overview" && (
          <>
            {/* Status */}
            <p className="font-mono text-[7px] tracking-widest text-white/25 uppercase mt-1">Production</p>
            <div className="rounded-lg border border-white/8 bg-white/2 p-2.5 space-y-0">
              <Row label="Status" value={
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400" style={{ boxShadow: "0 0 5px #4ade80" }} />
                  Glenn published recently
                </span>
              } />
              <Row label="Visibility" value="Public" />
              <Row label="Type" value="Autoscale (2 vCPU / 4 GiB / 3 Max)"
                link={{ text: "Manage", href: "https://replit.com/@alphaunlimited/OMNIMENS" }} />
              <Row label="Database" value="Production database connected"
                link={{ text: "Manage", href: "https://replit.com/@alphaunlimited/OMNIMENS" }} />
            </div>

            {/* Deployed apps */}
            <p className="font-mono text-[7px] tracking-widest text-white/25 uppercase mt-2">Deployed Apps</p>
            {[
              { name: "GODFLESH", url: "omnimens-ai.com/godflesh/", href: "https://omnimens-ai.com/godflesh/" },
              { name: "Super AI Lab", url: "omnimens.replit.app", href: "https://omnimens.replit.app" },
            ].map(app => (
              <a key={app.name} href={app.href} target="_blank" rel="noreferrer"
                className="flex items-center gap-2 rounded-lg border border-white/8 bg-white/2 p-2.5 hover:border-primary/20 hover:bg-primary/5 transition-all">
                <div className="w-6 h-6 rounded-md flex items-center justify-center shrink-0" style={{ background: "rgba(168,85,247,0.12)", border: "1px solid rgba(168,85,247,0.2)" }}>
                  <Globe className="w-3.5 h-3.5" style={{ color: "#a855f7" }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-mono text-[9px] font-bold text-white/80 truncate">{app.name}</p>
                  <p className="font-mono text-[8px] text-primary/70 truncate">{app.url}</p>
                </div>
                <ExternalLink className="w-2.5 h-2.5 text-white/20 shrink-0" />
              </a>
            ))}

            {/* Deploy history */}
            <p className="font-mono text-[7px] tracking-widest text-white/25 uppercase mt-2">Deployment History</p>
            {[
              { hash: "7c98b12", msg: "Published successfully", status: "ok", time: "36m ago" },
              { hash: "68fe993", msg: "Published successfully", status: "ok", time: "1h ago" },
              { hash: "07e31ee", msg: "Failed to publish", status: "fail", time: "2h ago" },
              { hash: "7a4e1ce", msg: "Published successfully", status: "ok", time: "2h ago" },
              { hash: "e3e99d8", msg: "Published successfully", status: "ok", time: "3h ago" },
            ].map(d => (
              <div key={d.hash} className="flex items-center gap-2 py-1.5 border-b border-white/5">
                <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${d.status === "ok" ? "bg-green-400" : "bg-red-400"}`} />
                <span className="font-mono text-[8px] text-white/30 w-14 shrink-0">{d.hash}</span>
                <span className="font-mono text-[8px] text-white/50 flex-1 truncate">{d.msg}</span>
                <span className="font-mono text-[7px] text-white/25 shrink-0">{d.time}</span>
              </div>
            ))}
          </>
        )}

        {dTab === "logs" && (
          <div className="rounded-lg border border-white/8 bg-black/30 p-2.5 font-mono text-[9px] space-y-1.5">
            {[
              { t: "now",    msg: "API Server running on port 3000", c: "#4ade80" },
              { t: "2m",     msg: "Health check OK — all systems operational", c: "#4ade80" },
              { t: "5m",     msg: "Static assets served — 0 errors", c: "rgba(255,255,255,0.5)" },
              { t: "10m",    msg: "DB connection pool ready (max 10)", c: "rgba(255,255,255,0.5)" },
              { t: "15m",    msg: "Stripe webhook endpoint registered", c: "rgba(255,255,255,0.5)" },
              { t: "20m",    msg: "OMNIMENS intelligence cycles started", c: "#a855f7" },
              { t: "25m",    msg: "Bundle loaded (3.8 MB, 280 ms)", c: "rgba(255,255,255,0.5)" },
              { t: "30m",    msg: "COGNISYNC™ self-upgrade cycle complete", c: "#a855f7" },
            ].map((l, i) => (
              <div key={i} className="flex gap-2">
                <span className="text-[7px] w-6 shrink-0 text-white/20 pt-0.5">{l.t}</span>
                <span style={{ color: l.c }}>{l.msg}</span>
              </div>
            ))}
            <span className="text-[9px] animate-pulse" style={{ color: "#a855f7" }}>▋</span>
          </div>
        )}

        {dTab === "analytics" && (
          <div className="space-y-2">
            <div className="rounded-lg border border-white/8 bg-white/2 p-2.5">
              <p className="font-mono text-[7px] tracking-widest text-white/25 uppercase mb-2">TODAY</p>
              <Row label="Messages" value={stats?.today?.messageCount ?? "—"} />
              <Row label="Credits Used" value={stats?.today?.creditsSpent ?? "—"} />
              <Row label="Compute (s)" value={stats?.today?.computeSeconds ?? "—"} />
            </div>
            <div className="rounded-lg border border-white/8 bg-white/2 p-2.5">
              <p className="font-mono text-[7px] tracking-widest text-white/25 uppercase mb-2">ALL TIME</p>
              <Row label="Conversations" value={stats?.totalConversations?.toLocaleString() ?? "—"} />
              <Row label="Messages" value={stats?.totalMessages?.toLocaleString() ?? "—"} />
              <Row label="Memory Entries" value={stats?.totalMemories?.toLocaleString() ?? "—"} />
            </div>
            <button onClick={refresh} className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg border border-white/8 font-mono text-[8px] text-white/40 hover:text-white transition-all">
              <RefreshCw className={`w-2.5 h-2.5 ${refreshing ? "animate-spin" : ""}`} /> Refresh
            </button>
          </div>
        )}

        {dTab === "resources" && (
          <div className="space-y-1.5">
            {[
              { label: "vCPUs", value: "2", badge: "Autoscale" },
              { label: "RAM", value: "4 GiB", badge: "Autoscale" },
              { label: "Max Replicas", value: "3", badge: "Autoscale" },
              { label: "Storage", value: "Ephemeral", badge: "Stateless" },
              { label: "Database", value: "PostgreSQL", badge: "Connected" },
              { label: "Network", value: "Included", badge: "Unlimited egress" },
            ].map(r => (
              <div key={r.label} className="flex items-center justify-between rounded-lg border border-white/8 bg-white/2 px-2.5 py-2">
                <div>
                  <p className="font-mono text-[7px] text-white/30">{r.label}</p>
                  <p className="font-mono text-[9px] text-white/70 mt-0.5">{r.value}</p>
                </div>
                <span className="font-mono text-[7px] px-1.5 py-0.5 rounded border text-primary border-primary/25 bg-primary/8">{r.badge}</span>
              </div>
            ))}
            <a href="https://replit.com/@alphaunlimited/OMNIMENS" target="_blank" rel="noreferrer"
              className="flex items-center justify-center gap-1 w-full py-1.5 rounded-lg border border-white/8 font-mono text-[8px] text-white/40 hover:text-white transition-all">
              See all usage <ExternalLink className="w-2 h-2" />
            </a>
          </div>
        )}

        {dTab === "domains" && (
          <div className="space-y-2">
            <p className="font-mono text-[7px] tracking-widest text-white/25 uppercase mt-1">Connected Domains</p>
            {[
              { domain: "omnimens-ai.com", status: "ACTIVE", primary: true, type: "Custom" },
              { domain: "NEXUS-6.replit.app", status: "ACTIVE", primary: false, type: "Replit" },
              { domain: "omnimens.replit.app", status: "ACTIVE", primary: false, type: "Replit" },
            ].map(d => (
              <div key={d.domain} className="flex items-center gap-2 rounded-lg border border-white/8 bg-white/2 px-2.5 py-2">
                <CircleDot className="w-2.5 h-2.5 text-green-400 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-mono text-[9px] text-white/70 truncate">{d.domain}</p>
                  <p className="font-mono text-[7px] text-white/25">{d.type} {d.primary ? "· Primary" : ""}</p>
                </div>
                <span className="font-mono text-[7px] text-green-400/80 border border-green-400/20 px-1.5 py-0.5 rounded">{d.status}</span>
              </div>
            ))}
            <button className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg font-mono text-[8px] w-full justify-center border border-white/8 text-white/40 hover:text-white transition-all">
              <Plus className="w-2.5 h-2.5" /> Connect domain
            </button>
          </div>
        )}

        {dTab === "manage" && (
          <div className="space-y-2">
            {[
              { label: "Details", icon: FileText, desc: "Edit app name and description" },
              { label: "Adjust settings", icon: Settings, desc: "Scale, region, environment" },
              { label: "Run security scan", icon: ShieldCheck, desc: "Vulnerability analysis" },
              { label: "Preview", icon: Eye, desc: "Open live preview" },
            ].map(item => (
              <button key={item.label}
                className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg border border-white/8 bg-white/2 hover:border-primary/20 hover:bg-primary/5 transition-all text-left">
                <item.icon className="w-3 h-3 shrink-0" style={{ color: "#a855f7" }} />
                <div>
                  <p className="font-mono text-[9px] text-white/70">{item.label}</p>
                  <p className="font-mono text-[7px] text-white/25">{item.desc}</p>
                </div>
                <ExternalLink className="w-2.5 h-2.5 ml-auto text-white/15 shrink-0" />
              </button>
            ))}
            <div className="border-t border-white/8 pt-2 mt-2">
              <button className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg border border-red-400/15 bg-red-400/5 hover:bg-red-400/10 transition-all text-left">
                <Trash2 className="w-3 h-3 text-red-400 shrink-0" />
                <p className="font-mono text-[9px] text-red-400">Delete deployment</p>
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

// ── Left Panel ─────────────────────────────────────────────────────────────────

function LeftPanel({
  persona,
  onPersonaChange,
  deepResearchMode,
  onToggleDeepResearch,
  onOpenResonance,
  onOpenAvatarStudio,
  onOpenHub,
  status,
  conversations,
  currentConversationId,
  onNewChat,
  onLoadConversation,
  onDeleteConversation,
  convSearch,
  onConvSearchChange,
  activeProject,
  onSetActiveProject,
  theme,
  onToggleTheme,
  projectsVersion,
  onOpenNewApp,
  onQuickBuild,
  activePanelTab,
  onPanelTabChange,
}: {
  persona: string;
  onPersonaChange: (p: string) => void;
  deepResearchMode: boolean;
  onToggleDeepResearch: () => void;
  onOpenResonance: () => void;
  onOpenAvatarStudio: () => void;
  onOpenHub: () => void;
  status: any;
  conversations: { id: number; title: string | null; updatedAt: string | null }[];
  currentConversationId: number | undefined;
  onNewChat: () => void;
  onLoadConversation: (id: number) => void;
  onDeleteConversation: (id: number) => void;
  convSearch: string;
  theme: string;
  onToggleTheme: () => void;
  onConvSearchChange: (s: string) => void;
  activeProject: ActiveProject;
  onSetActiveProject: (p: ActiveProject) => void;
  projectsVersion?: number;
  onOpenNewApp: () => void;
  onQuickBuild: (prompt: string, type: string) => void;
  activePanelTab?: string;
  onPanelTabChange?: (tab: string) => void;
}) {
  const personas = Object.keys(PERSONA_NAMES);
  const filteredConversations = conversations.filter(c =>
    !convSearch || (c.title || "").toLowerCase().includes(convSearch.toLowerCase())
  );
  const { canInstall, install } = usePwaInstall();

  const [panelTabInternal, setPanelTabInternal] = useState<"chats"|"mode"|"skills"|"tools"|"files"|"deploy"|"memory"|"config">("chats");
  const panelTab = (activePanelTab as typeof panelTabInternal) || panelTabInternal;
  const setPanelTab = (tab: typeof panelTabInternal) => {
    setPanelTabInternal(tab);
    onPanelTabChange?.(tab);
  };
  const [projects, setProjects] = useState<{ id: number; name: string; type?: string; visibility?: string; starred?: boolean; updatedAt?: string | null }[]>([]);
  const [showProjectPicker, setShowProjectPicker] = useState(false);

  // FILES tab
  const [fileSearch, setFileSearch] = useState("");
  const [expandedProjects, setExpandedProjects] = useState<number[]>([]);
  const [projectFiles, setProjectFiles] = useState<Record<number, { id: number; filename: string; language: string; content: string }[]>>({});
  const [fileLoadingId, setFileLoadingId] = useState<number | null>(null);
  const [uploadingProjectId, setUploadingProjectId] = useState<number | null>(null);

  const handleUploadToProject = (projectId: number) => {
    const input = document.createElement("input");
    input.type = "file";
    input.multiple = true;
    input.accept = "*/*";
    input.onchange = async () => {
      const files = Array.from(input.files || []);
      if (!files.length) return;
      setUploadingProjectId(projectId);
      const ext2lang: Record<string, string> = {
        html: "html", css: "css", js: "javascript", ts: "typescript",
        tsx: "typescript", jsx: "javascript", json: "json", py: "python",
        md: "markdown", svg: "svg", sql: "sql", sh: "shell",
        yaml: "yaml", yml: "yaml", txt: "text", xml: "xml",
        rs: "rust", go: "go", rb: "ruby", php: "php", java: "java",
        c: "c", cpp: "cpp", cs: "csharp", swift: "swift", kt: "kotlin",
      };
      try {
        const uploaded: { id: number; filename: string; language: string; content: string }[] = [];
        for (const file of files) {
          const content = await file.text();
          const ext = file.name.split(".").pop()?.toLowerCase() || "txt";
          const language = ext2lang[ext] || ext;
          const resp = await fetch(`/api/omnimens/projects/${projectId}/files`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ filename: file.name, content, language }),
          });
          if (resp.ok) {
            const saved = await resp.json();
            uploaded.push({ id: saved.id, filename: saved.filename, language: saved.language, content });
          }
        }
        if (uploaded.length) {
          setProjectFiles(prev => ({
            ...prev,
            [projectId]: [...(prev[projectId] || []), ...uploaded],
          }));
          if (!expandedProjects.includes(projectId)) {
            setExpandedProjects(prev => [...prev, projectId]);
          }
        }
      } finally {
        setUploadingProjectId(null);
      }
    };
    input.click();
  };

  // DEPLOY tab
  const [deployStatus, setDeployStatus] = useState<{ status: string; url: string; domain?: string } | null>(null);

  // MEMORY tab
  const [brainEntries, setBrainEntries] = useState<{ id: number; category: string; content: string; confidence: number; createdAt: string }[]>([]);
  const [brainSearch, setBrainSearch] = useState("");
  const [brainLoading, setBrainLoading] = useState(false);

  // CONFIG tab
  const [configSection, setConfigSection] = useState<"account"|"credits"|"preferences"|"security">("account");

  useEffect(() => {
    fetch("/api/omnimens/projects", { credentials: "include" })
      .then(r => r.json())
      .then(d => setProjects(Array.isArray(d) ? d : []))
      .catch(() => {});
  }, [projectsVersion]); // re-fetch whenever a project is created externally

  // Load files for a project when expanded
  const toggleExpandProject = (id: number) => {
    if (expandedProjects.includes(id)) {
      setExpandedProjects(prev => prev.filter(i => i !== id));
    } else {
      setExpandedProjects(prev => [...prev, id]);
      if (!projectFiles[id]) {
        setFileLoadingId(id);
        fetch(`/api/omnimens/projects/${id}`, { credentials: "include" })
          .then(r => r.json())
          .then(d => { setProjectFiles(prev => ({ ...prev, [id]: d.files || [] })); })
          .catch(() => {})
          .finally(() => setFileLoadingId(null));
      }
    }
  };

  // Load brain entries when MEMORY tab opens
  useEffect(() => {
    if (panelTab === "memory" && brainEntries.length === 0) {
      setBrainLoading(true);
      fetch("/api/omnimens/brain", { credentials: "include" })
        .then(r => r.json())
        .then(d => setBrainEntries(Array.isArray(d) ? d : []))
        .catch(() => {})
        .finally(() => setBrainLoading(false));
    }
  }, [panelTab]);

  // Load deploy status when DEPLOY tab opens
  useEffect(() => {
    if (panelTab === "deploy") {
      setDeployStatus({ status: "live", url: "https://omnimens-ai.com/godflesh/", domain: "omnimens-ai.com" });
    }
  }, [panelTab]);
  const [skillSearch, setSkillSearch] = useState("");
  const filteredSkills = OMNIMENS_SKILLS.filter(s =>
    !skillSearch || s.name.toLowerCase().includes(skillSearch.toLowerCase()) || s.category.toLowerCase().includes(skillSearch.toLowerCase()) || s.desc.toLowerCase().includes(skillSearch.toLowerCase())
  );

  const PANEL_TABS = [
    { id: "chats",   label: "CHATS",   icon: <MessageSquare className="w-3 h-3" /> },
    { id: "files",   label: "FILES",   icon: <HardDrive className="w-3 h-3" /> },
    { id: "deploy",  label: "DEPLOY",  icon: <Rocket className="w-3 h-3" /> },
    { id: "memory",  label: "MEMORY",  icon: <MemoryStick className="w-3 h-3" /> },
    { id: "mode",    label: "MODE",    icon: <Sparkles className="w-3 h-3" /> },
    { id: "skills",  label: "SKILLS",  icon: <Zap className="w-3 h-3" /> },
    { id: "tools",   label: "TOOLS",   icon: <Wrench className="w-3 h-3" /> },
    { id: "config",  label: "CONFIG",  icon: <Settings className="w-3 h-3" /> },
  ];

  const isLight = theme === "light";

  return (
    <div className="flex flex-col h-full" data-sidebar={isLight ? "light" : "dark"}>
      {/* Workspace header */}
      <div className="flex items-center gap-2 px-3 py-2 border-b shrink-0" style={{ borderColor: isLight ? "rgba(20,23,34,0.08)" : "#21262d" }}>
        <div className="min-w-0 flex-1">
          <p className="font-mono text-[10px] font-bold" style={{ color: isLight ? "#141722" : "#fff" }}>Workspace</p>
          {status?.isOwner && <span className="font-mono text-[8px] tracking-wider" style={{ color: "#a855f7" }}>CREATOR</span>}
        </div>
        <button onClick={onNewChat} className="flex items-center gap-1 px-2.5 py-1.5 rounded-md text-[10px] font-mono font-bold transition-all shrink-0" style={{ background: "#a855f7", color: "#fff" }}>
          <PlusCircle className="w-3 h-3" /> New
        </button>
      </div>

      {/* Tab bar */}
      <div className="flex shrink-0 overflow-x-auto" style={{ scrollbarWidth: "none", borderBottom: `1px solid ${isLight ? "rgba(20,23,34,0.08)" : "#21262d"}` }}>
        {PANEL_TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setPanelTab(tab.id as typeof panelTab)}
            className="flex items-center gap-1 px-2.5 py-2 font-mono text-[9px] tracking-wider whitespace-nowrap transition-all border-b-2 flex-shrink-0"
            style={{
              color: panelTab === tab.id
                ? "#a855f7"
                : isLight ? "rgba(20,23,34,0.4)" : "rgba(255,255,255,0.35)",
              borderBottomColor: panelTab === tab.id ? "#a855f7" : "transparent",
            }}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto omnimens-scrollbar p-3">

        {/* ── CHATS TAB ── */}
        {panelTab === "chats" && (
          <div className="space-y-3">

            {/* ── OMNIMENS AGENT BUILDER CTA ── */}
            <div className="rounded-xl overflow-hidden border" style={{ borderColor: "rgba(168,85,247,0.3)", background: "rgba(168,85,247,0.08)" }}>
              <div className="px-3 pt-3 pb-2">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-5 h-5 rounded-lg flex items-center justify-center" style={{ background: "rgba(168,85,247,0.2)" }}>
                    <Wand2 className="w-3 h-3" style={{ color: "#a855f7" }} />
                  </div>
                  <span className="font-mono text-[9px] tracking-widest font-bold uppercase" style={{ color: "#a855f7" }}>OMNIMENS Agent</span>
                </div>
                <p className="font-mono text-[9px] text-white/40 mb-2.5 leading-relaxed">Build full-stack apps, websites, and tools with natural language</p>
                <button
                  onClick={onOpenNewApp}
                  className="w-full flex items-center justify-center gap-2 py-2 rounded-xl font-mono text-[10px] font-bold transition-all"
                  style={{ background: "#a855f7", color: "#fff" }}>
                  <Wand2 className="w-3 h-3" /> Build a New App
                </button>
              </div>
              {/* Quick templates row */}
              <div className="flex gap-1 px-3 pb-3 overflow-x-auto scrollbar-hide">
                {[
                  { label: "Website", prompt: "Build me a stunning modern website with hero, features, and pricing sections. Dark themed with animations." },
                  { label: "Dashboard", prompt: "Build a data analytics dashboard with KPI cards, charts, and a data table. Dark themed with violet accents." },
                  { label: "Landing", prompt: "Create a high-converting SaaS landing page with hero, social proof, features, pricing, and CTA sections." },
                  { label: "Chatbot", prompt: "Build a beautiful AI chatbot interface with message history, typing indicator, and dark theme." },
                  { label: "Game", prompt: "Create a fun browser game using HTML5 Canvas with game loop, scoring, and particle effects." },
                ].map(t => (
                  <button
                    key={t.label}
                    onClick={() => onQuickBuild(t.prompt, t.label)}
                    className="shrink-0 px-2.5 py-1.5 rounded-lg font-mono text-[8px] whitespace-nowrap transition-all border"
                    style={{ borderColor: "rgba(168,85,247,0.2)", color: "rgba(168,85,247,0.8)", background: "rgba(168,85,247,0.06)" }}>
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Active Project Picker */}
            <div className="rounded-xl border border-white/8 bg-white/3 overflow-hidden">
              <div className="flex items-center justify-between px-2.5 py-2 border-b border-white/5">
                <div className="flex items-center gap-1.5">
                  <FolderOpen className="w-3 h-3 text-primary/60" />
                  <span className="text-[9px] font-mono font-bold tracking-widest text-white/50">WORKING PROJECT</span>
                </div>
                {activeProject && (
                  <button
                    onClick={() => onSetActiveProject(null)}
                    className="text-white/25 hover:text-white/60 transition-colors"
                    title="Clear active project"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
              {activeProject ? (
                <div className="px-2.5 py-2">
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-400 shrink-0" style={{ boxShadow: "0 0 6px #4ade80" }} />
                    <span className="text-[10px] font-mono font-bold text-green-400 truncate">{activeProject.name}</span>
                  </div>
                  <p className="text-[8px] font-mono text-white/30 mt-0.5">Code auto-saves here</p>
                </div>
              ) : (
                <div className="px-2.5 py-2">
                  {showProjectPicker ? (
                    <div className="space-y-1.5">
                      {projects.length === 0 ? (
                        <p className="text-[9px] font-mono text-white/30 text-center py-2">No projects yet</p>
                      ) : (
                        <div className="space-y-0.5 max-h-28 overflow-y-auto omnimens-scrollbar">
                          {projects.map(p => (
                            <button
                              key={p.id}
                              onClick={() => { onSetActiveProject(p); setShowProjectPicker(false); }}
                              className="w-full text-left px-2 py-1.5 rounded-lg text-[9px] font-mono text-white/70 hover:text-white hover:bg-primary/10 hover:border-primary/20 border border-transparent transition-all truncate"
                            >
                              {p.name}
                            </button>
                          ))}
                        </div>
                      )}
                      <button
                        onClick={() => setShowProjectPicker(false)}
                        className="w-full text-[8px] font-mono text-white/30 hover:text-white/50 transition-colors py-1"
                      >
                        cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowProjectPicker(true)}
                      className="w-full flex items-center justify-center gap-1.5 py-1.5 text-[9px] font-mono text-white/35 hover:text-primary/70 transition-colors border border-dashed border-white/10 hover:border-primary/25 rounded-lg"
                    >
                      <Plus className="w-3 h-3" /> Set project
                    </button>
                  )}
                </div>
              )}
            </div>

            {conversations.length > 0 && (
              <div>
                <div className="relative mb-2">
                  <Search className="w-2.5 h-2.5 absolute left-2 top-1/2 -translate-y-1/2 text-white/25" />
                  <input
                    value={convSearch}
                    onChange={e => onConvSearchChange(e.target.value)}
                    placeholder="Search conversations..."
                    className="w-full bg-white/4 border border-white/8 rounded-md pl-6 pr-2 py-1.5 text-[9px] font-mono text-white/70 placeholder:text-white/20 outline-none focus:border-primary/20"
                  />
                </div>
                <div className="space-y-0.5">
                  {filteredConversations.map(conv => (
                    <div
                      key={conv.id}
                      className={`group flex items-center gap-1.5 px-2 py-1.5 rounded-lg cursor-pointer transition-all ${
                        currentConversationId === conv.id
                          ? "bg-primary/15 border border-primary/25 text-primary"
                          : "hover:bg-white/5 text-white/70 border border-transparent"
                      }`}
                      onClick={() => onLoadConversation(conv.id)}
                    >
                      <MessageSquare className="w-3 h-3 shrink-0 opacity-60" />
                      <span className="text-[10px] font-mono truncate flex-1">{conv.title || "Untitled"}</span>
                      <button
                        onClick={e => { e.stopPropagation(); onDeleteConversation(conv.id); }}
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-white/40 hover:text-red-400 shrink-0"
                        title="Delete"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  {filteredConversations.length === 0 && convSearch && (
                    <p className="text-[9px] font-mono text-white/25 text-center py-4">No matches</p>
                  )}
                </div>
              </div>
            )}
            {conversations.length === 0 && (
              <div className="text-center py-8">
                <MessageSquare className="w-8 h-8 text-white/10 mx-auto mb-2" />
                <p className="text-[9px] font-mono text-white/30">No conversations yet</p>
                <p className="text-[8px] font-mono text-white/20 mt-1">Start a new chat above</p>
              </div>
            )}
          </div>
        )}

        {/* ── MODE TAB ── */}
        {panelTab === "mode" && (
          <div className="space-y-1">
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
        )}

        {/* ── SKILLS TAB ── */}
        {panelTab === "skills" && (
          <div className="space-y-3">
            <div className="relative">
              <Search className="w-2.5 h-2.5 absolute left-2 top-1/2 -translate-y-1/2 text-white/25" />
              <input
                value={skillSearch}
                onChange={e => setSkillSearch(e.target.value)}
                placeholder="Search skills..."
                className="w-full bg-white/4 border border-white/8 rounded-md pl-6 pr-2 py-1.5 text-[9px] font-mono text-white/70 placeholder:text-white/20 outline-none focus:border-primary/20"
              />
            </div>
            <div className="space-y-1">
              {filteredSkills.map(skill => (
                <button
                  key={skill.id}
                  onClick={() => onPersonaChange(skill.persona)}
                  className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-left hover:bg-white/5 border border-transparent hover:border-white/10 transition-all"
                >
                  <span className="text-base shrink-0">{skill.emoji}</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-mono font-bold text-white/90 truncate">{skill.name}</p>
                    <p className="text-[8px] font-mono text-white/40 truncate">{skill.desc}</p>
                  </div>
                  <span className="text-[7px] font-mono text-primary/50 border border-primary/20 px-1.5 py-0.5 rounded shrink-0">{skill.category}</span>
                </button>
              ))}
              {filteredSkills.length === 0 && (
                <p className="text-[9px] font-mono text-white/25 text-center py-4">No skills found</p>
              )}
            </div>
          </div>
        )}

        {/* ── TOOLS TAB ── */}
        {panelTab === "tools" && (
          <div className="space-y-3">
            {/* Capabilities */}
            <div>
              <p className="font-mono text-[9px] tracking-[0.2em] text-white/75 uppercase mb-2 px-1">CAPABILITIES</p>
              <div className="space-y-1">
                {[
                  { icon: <Image className="w-3 h-3" />, label: "Image Generation", color: "text-pink-400" },
                  { icon: <Globe className="w-3 h-3" />, label: "Web Search", color: "text-blue-400" },
                  { icon: <Cpu className="w-3 h-3" />, label: "Code Execution", color: "text-green-400" },
                  { icon: <Brain className="w-3 h-3" />, label: "Long-term Memory", color: "text-purple-400" },
                  { icon: <Microscope className="w-3 h-3" />, label: "Deep Research", color: "text-violet-400" },
                  { icon: <FolderOpen className="w-3 h-3" />, label: "File Analysis", color: "text-yellow-400" },
                  { icon: <Database className="w-3 h-3" />, label: "Database Query", color: "text-cyan-400" },
                ].map(cap => (
                  <div key={cap.label} className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg">
                    <span className={`shrink-0 ${cap.color}`}>{cap.icon}</span>
                    <span className="text-[10px] font-mono text-white">{cap.label}</span>
                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-green-400/70 shrink-0" />
                  </div>
                ))}
              </div>
            </div>
            {/* Action buttons */}
            <div className="space-y-1 border-t border-white/8 pt-3">
              <button onClick={onToggleDeepResearch} className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-lg transition-all text-[10px] font-mono font-bold tracking-wider border ${deepResearchMode ? "text-violet-300 border-violet-400/30 bg-violet-400/10" : "text-white/85 border-white/10 hover:text-white/70 hover:border-white/20"}`}>
                <Microscope className="w-3.5 h-3.5" /> DEEP RESEARCH
              </button>
              <button onClick={onOpenResonance} className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg transition-all text-[10px] font-mono font-bold tracking-wider border border-white/10 text-white/85 hover:text-violet-300 hover:border-violet-400/30 hover:bg-violet-400/5">
                <Brain className="w-3.5 h-3.5" /> DEEP RESONANCE
              </button>
              <button onClick={onOpenAvatarStudio} className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg transition-all text-[10px] font-mono font-bold tracking-wider border border-white/10 text-white/85 hover:text-emerald-300 hover:border-emerald-500/30 hover:bg-emerald-500/5">
                <PersonStanding className="w-3.5 h-3.5" /> AVATAR STUDIO
              </button>
              <button onClick={onOpenHub} className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg transition-all text-[10px] font-mono font-bold tracking-wider border border-primary/20 text-primary/80 hover:text-primary hover:bg-primary/10 hover:border-primary/30">
                <Settings className="w-3.5 h-3.5" /> CONTROL HUB
              </button>
              <a href={`${window.location.origin}/godflesh/projects`} className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-[10px] font-mono font-bold tracking-wider border border-white/10 text-white/85 hover:text-white/70 hover:border-white/20 transition-all">
                <Layers className="w-3.5 h-3.5" /> MY PROJECTS
              </a>
            </div>
          </div>
        )}

        {/* ── FILES TAB ── */}
        {panelTab === "files" && (
          <div className="space-y-2">
            {/* Search */}
            <div className="relative">
              <Search className="w-2.5 h-2.5 absolute left-2 top-1/2 -translate-y-1/2 text-white/25" />
              <input
                value={fileSearch}
                onChange={e => setFileSearch(e.target.value)}
                placeholder="Search files & projects..."
                className="w-full bg-white/4 border border-white/8 rounded-md pl-6 pr-2 py-1.5 text-[9px] font-mono text-white/70 placeholder:text-white/20 outline-none focus:border-primary/20"
              />
            </div>

            {/* Project tree */}
            {projects.length === 0 ? (
              <div className="text-center py-8">
                <FolderOpen className="w-6 h-6 text-white/15 mx-auto mb-2" />
                <p className="text-[9px] font-mono text-white/25">No projects yet</p>
                <p className="text-[8px] font-mono text-white/15 mt-1">Ask OMNIMENS to build something</p>
              </div>
            ) : (
              <div className="space-y-0.5">
                {projects
                  .filter(p => !fileSearch || p.name.toLowerCase().includes(fileSearch.toLowerCase()))
                  .map(proj => (
                  <div key={proj.id} className="rounded-lg overflow-hidden border border-white/5">
                    {/* Project row */}
                    <div className="flex items-center group">
                      <button
                        onClick={() => toggleExpandProject(proj.id)}
                        className="flex items-center gap-1.5 px-2 py-1.5 hover:bg-white/5 transition-all text-left flex-1 min-w-0"
                      >
                        <ChevronRight className={`w-2.5 h-2.5 text-white/30 shrink-0 transition-transform ${expandedProjects.includes(proj.id) ? "rotate-90" : ""}`} />
                        <FolderOpen className="w-3 h-3 text-primary/50 shrink-0" />
                        <span className="text-[9px] font-mono text-white/80 truncate flex-1">{proj.name}</span>
                        {proj.starred && <Star className="w-2.5 h-2.5 text-yellow-400/60 shrink-0" />}
                        {proj.visibility === "public"
                          ? <Unlock className="w-2.5 h-2.5 text-green-400/40 shrink-0" />
                          : <Lock className="w-2.5 h-2.5 text-white/20 shrink-0" />}
                      </button>
                      {/* Download ZIP button */}
                      <a
                        href={`/api/omnimens/projects/${proj.id}/download-zip`}
                        download
                        title="Download all files as ZIP"
                        className="shrink-0 px-2 py-1.5 text-white/20 hover:text-primary transition-colors opacity-0 group-hover:opacity-100"
                        onClick={e => e.stopPropagation()}
                      >
                        <Download className="w-3 h-3" />
                      </a>
                    </div>

                    {/* Files list */}
                    {expandedProjects.includes(proj.id) && (
                      <div className="border-t border-white/5 bg-white/2">
                        {fileLoadingId === proj.id ? (
                          <div className="flex items-center gap-2 px-4 py-2">
                            <Loader2 className="w-2.5 h-2.5 animate-spin text-white/30" />
                            <span className="text-[8px] font-mono text-white/30">Loading files…</span>
                          </div>
                        ) : (projectFiles[proj.id] || []).length === 0 ? (
                          <p className="text-[8px] font-mono text-white/20 px-4 py-2">No files yet</p>
                        ) : (
                          (projectFiles[proj.id] || [])
                            .filter(f => !fileSearch || f.filename.toLowerCase().includes(fileSearch.toLowerCase()))
                            .map(file => (
                            <div key={file.id} className="flex items-center gap-1.5 px-4 py-1.5 hover:bg-white/4 transition-all group/file">
                              <File className="w-2.5 h-2.5 text-white/25 shrink-0" />
                              <span className="text-[8px] font-mono text-white/55 truncate flex-1">{file.filename}</span>
                              <span className="text-[7px] font-mono text-primary/30 shrink-0 group-hover/file:hidden">{file.language || "txt"}</span>
                              <button
                                title={`Download ${file.filename}`}
                                className="hidden group-hover/file:flex items-center shrink-0 text-white/25 hover:text-primary transition-colors"
                                onClick={() => {
                                  const blob = new Blob([file.content || ""], { type: "text/plain" });
                                  const url = URL.createObjectURL(blob);
                                  const a = document.createElement("a");
                                  a.href = url; a.download = file.filename;
                                  document.body.appendChild(a); a.click();
                                  document.body.removeChild(a); URL.revokeObjectURL(url);
                                }}
                              >
                                <Download className="w-2.5 h-2.5" />
                              </button>
                            </div>
                          ))
                        )}
                        {/* Upload files button */}
                        <button
                          onClick={() => handleUploadToProject(proj.id)}
                          disabled={uploadingProjectId === proj.id}
                          className="w-full flex items-center gap-1.5 px-4 py-1.5 text-white/25 hover:text-primary/70 hover:bg-primary/5 transition-all border-t border-white/5 disabled:opacity-50"
                        >
                          {uploadingProjectId === proj.id
                            ? <Loader2 className="w-2.5 h-2.5 animate-spin shrink-0" />
                            : <Upload className="w-2.5 h-2.5 shrink-0" />}
                          <span className="text-[8px] font-mono">
                            {uploadingProjectId === proj.id ? "Uploading…" : "Upload files"}
                          </span>
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Refresh */}
            <button
              onClick={() => {
                fetch("/api/omnimens/projects", { credentials: "include" })
                  .then(r => r.json()).then(d => setProjects(Array.isArray(d) ? d : [])).catch(() => {});
                setProjectFiles({});
              }}
              className="w-full flex items-center justify-center gap-1.5 py-1.5 text-[8px] font-mono text-white/25 hover:text-white/50 transition-colors border border-dashed border-white/8 hover:border-white/15 rounded-lg"
            >
              <RefreshCw className="w-2.5 h-2.5" /> Refresh
            </button>
          </div>
        )}

        {/* ── DEPLOY TAB ── */}
        {panelTab === "deploy" && <DesktopDeployPanel />}

        {/* ── MEMORY TAB ── */}
        {panelTab === "memory" && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 mb-1">
              <Brain className="w-3 h-3 text-purple-400" />
              <p className="font-mono text-[9px] tracking-widest text-purple-400">OMNIMENS BRAIN</p>
              <span className="ml-auto text-[7px] font-mono text-white/30 border border-white/10 px-1.5 py-0.5 rounded">{brainEntries.length} entries</span>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="w-2.5 h-2.5 absolute left-2 top-1/2 -translate-y-1/2 text-white/25" />
              <input
                value={brainSearch}
                onChange={e => setBrainSearch(e.target.value)}
                placeholder="Search memory..."
                className="w-full bg-white/4 border border-white/8 rounded-md pl-6 pr-2 py-1.5 text-[9px] font-mono text-white/70 placeholder:text-white/20 outline-none focus:border-purple-400/20"
              />
            </div>

            {brainLoading ? (
              <div className="flex items-center justify-center py-8 gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-purple-400/50" />
                <span className="text-[9px] font-mono text-white/30">Loading memory…</span>
              </div>
            ) : brainEntries.length === 0 ? (
              <div className="text-center py-8">
                <Brain className="w-6 h-6 text-white/15 mx-auto mb-2" />
                <p className="text-[9px] font-mono text-white/25">Memory is empty</p>
                <p className="text-[8px] font-mono text-white/15 mt-1">OMNIMENS learns from every conversation</p>
              </div>
            ) : (
              <div className="space-y-1.5">
                {brainEntries
                  .filter(e => !brainSearch || e.content.toLowerCase().includes(brainSearch.toLowerCase()) || e.category.toLowerCase().includes(brainSearch.toLowerCase()))
                  .map(entry => (
                  <div key={entry.id} className="rounded-lg border border-white/8 bg-white/3 p-2.5 hover:border-purple-400/15 transition-all">
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="text-[7px] font-mono text-purple-400/70 border border-purple-400/20 px-1.5 py-0.5 rounded uppercase tracking-wider">{entry.category}</span>
                      <span className="ml-auto text-[7px] font-mono text-white/20">{Math.round((entry.confidence || 0) * 100)}%</span>
                    </div>
                    <p className="text-[8px] font-mono text-white/55 leading-relaxed line-clamp-3">{entry.content}</p>
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={() => {
                setBrainEntries([]);
                setBrainLoading(true);
                fetch("/api/omnimens/brain", { credentials: "include" })
                  .then(r => r.json()).then(d => setBrainEntries(Array.isArray(d) ? d : [])).catch(() => {})
                  .finally(() => setBrainLoading(false));
              }}
              className="w-full flex items-center justify-center gap-1.5 py-1.5 text-[8px] font-mono text-white/25 hover:text-white/50 transition-colors border border-dashed border-white/8 hover:border-white/15 rounded-lg"
            >
              <RefreshCw className="w-2.5 h-2.5" /> Refresh memory
            </button>
          </div>
        )}

        {/* ── CONFIG TAB ── */}
        {panelTab === "config" && (
          <div className="space-y-3">
            {/* Sub-nav */}
            <div className="flex gap-1 p-1 bg-white/4 rounded-lg">
              {(["account", "credits", "preferences", "security"] as const).map(s => (
                <button
                  key={s}
                  onClick={() => setConfigSection(s)}
                  className={`flex-1 py-1 rounded-md text-[7px] font-mono tracking-wider uppercase transition-all ${
                    configSection === s ? "bg-primary/20 text-primary" : "text-white/30 hover:text-white/60"
                  }`}
                >
                  {s === "account" ? "ACCT" : s === "preferences" ? "PREFS" : s.toUpperCase()}
                </button>
              ))}
            </div>

            {/* ACCOUNT section */}
            {configSection === "account" && (
              <div className="space-y-2">
                <div className="rounded-xl border border-white/8 bg-white/3 p-3">
                  <p className="font-mono text-[8px] tracking-[0.2em] text-white/35 uppercase mb-2">ACCOUNT</p>
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center shrink-0">
                      <span className="font-mono text-[11px] font-bold text-primary">G</span>
                    </div>
                    <div>
                      <p className="font-mono text-[10px] font-bold text-white/90">Glenn</p>
                      <p className="font-mono text-[8px] text-white/35">Alpha Unlimited Technologies</p>
                      {status?.isOwner && <span className="font-mono text-[7px] text-accent/80 border border-accent/25 px-1.5 py-0.5 rounded mt-0.5 inline-block">⚡ CREATOR</span>}
                    </div>
                  </div>
                </div>
                <div className="rounded-xl border border-white/8 bg-white/3 p-3 space-y-1.5">
                  <p className="font-mono text-[8px] tracking-[0.2em] text-white/35 uppercase mb-2">PLATFORM</p>
                  {[
                    { label: "Platform", value: "OMNIMENS v1.0" },
                    { label: "Company", value: "Alpha Unlimited Technologies LLC" },
                    { label: "IP Status", value: "COGNISYNC™ · NEUROSYNC™" },
                    { label: "Plan", value: status?.isOwner ? "Creator (Unlimited)" : "Freemium" },
                  ].map(item => (
                    <div key={item.label} className="flex justify-between items-center">
                      <span className="text-[8px] font-mono text-white/30">{item.label}</span>
                      <span className="text-[8px] font-mono text-white/60 text-right max-w-[55%] truncate">{item.value}</span>
                    </div>
                  ))}
                </div>
                <a href={`${window.location.origin}/godflesh/pricing`}
                  className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-[9px] font-mono font-bold border border-primary/25 text-primary/80 hover:text-primary hover:bg-primary/10 transition-all">
                  <Zap className="w-3 h-3" /> Upgrade / Buy Credits
                  <ExternalLink className="w-2.5 h-2.5 ml-auto" />
                </a>
              </div>
            )}

            {/* CREDITS section */}
            {configSection === "credits" && (
              <div className="space-y-2">
                <div className="rounded-xl border border-white/8 bg-white/3 p-3">
                  <p className="font-mono text-[8px] tracking-[0.2em] text-white/35 uppercase mb-3">CREDIT BALANCE</p>
                  {status?.isOwner ? (
                    <div className="text-center py-2">
                      <p className="font-mono text-2xl font-bold text-accent">∞</p>
                      <p className="font-mono text-[9px] text-accent/60 mt-1">Creator — Unlimited credits</p>
                    </div>
                  ) : (
                    <div className="text-center py-2">
                      <p className="font-mono text-2xl font-bold text-white">—</p>
                      <p className="font-mono text-[9px] text-white/40 mt-1">Log in to see balance</p>
                    </div>
                  )}
                </div>
                <div className="space-y-1">
                  <p className="font-mono text-[8px] tracking-[0.2em] text-white/35 uppercase mb-1 px-1">CREDIT PACKS</p>
                  {[
                    { name: "SPARK", credits: "300 credits", price: "$3", color: "text-yellow-400", border: "border-yellow-400/20" },
                    { name: "SURGE", credits: "1,000 credits", price: "$10", color: "text-primary", border: "border-primary/20" },
                    { name: "APEX", credits: "3,000 credits", price: "$30", color: "text-purple-400", border: "border-purple-400/20" },
                  ].map(pack => (
                    <a key={pack.name} href={`${window.location.origin}/godflesh/pricing`}
                      className={`flex items-center gap-2 px-2.5 py-2 rounded-lg border ${pack.border} hover:bg-white/5 transition-all`}>
                      <span className={`font-mono text-[9px] font-bold ${pack.color}`}>{pack.name}</span>
                      <span className="text-[9px] font-mono text-white/50">{pack.credits}</span>
                      <span className={`ml-auto font-mono text-[9px] font-bold ${pack.color}`}>{pack.price}</span>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* PREFERENCES section */}
            {configSection === "preferences" && (
              <div className="space-y-2">
                <div className="rounded-xl border border-white/8 bg-white/3 p-3 space-y-3">
                  <p className="font-mono text-[8px] tracking-[0.2em] text-white/35 uppercase">INTERFACE</p>
                  {[
                    { label: "Appearance", desc: "Switch between dark and light mode", action: (
                      <button onClick={onToggleTheme}
                        className={`flex items-center gap-1.5 text-[7px] font-mono px-2 py-1 rounded border transition-all ${theme === "light" ? "border-yellow-400/30 text-yellow-500 bg-yellow-400/10" : "border-primary/30 text-primary bg-primary/10"}`}>
                        {theme === "light" ? <Sun className="w-2.5 h-2.5" /> : <Moon className="w-2.5 h-2.5" />}
                        {theme === "light" ? "LIGHT" : "DARK"}
                      </button>
                    )},
                    { label: "Deep Research", desc: "Extended multi-source research mode", action: <button onClick={onToggleDeepResearch} className={`text-[7px] font-mono px-2 py-1 rounded border transition-all ${deepResearchMode ? "border-violet-400/30 text-violet-300 bg-violet-400/10" : "border-white/10 text-white/30"}`}>{deepResearchMode ? "ON" : "OFF"}</button> },
                  ].map(item => (
                    <div key={item.label} className="flex items-center justify-between gap-2">
                      <div>
                        <p className="text-[9px] font-mono text-white/70">{item.label}</p>
                        <p className="text-[7px] font-mono text-white/25 mt-0.5">{item.desc}</p>
                      </div>
                      {item.action}
                    </div>
                  ))}
                </div>
                <button onClick={onOpenHub}
                  className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-[9px] font-mono font-bold border border-primary/20 text-primary/80 hover:text-primary hover:bg-primary/10 transition-all">
                  <Settings className="w-3 h-3" /> Open Full Control Hub
                </button>
              </div>
            )}

            {/* SECURITY section */}
            {configSection === "security" && (
              <div className="space-y-2">
                <div className="rounded-xl border border-white/8 bg-white/3 p-3 space-y-2">
                  <p className="font-mono text-[8px] tracking-[0.2em] text-white/35 uppercase mb-1">SECURITY</p>
                  {[
                    { icon: <ShieldCheck className="w-3 h-3 text-green-400" />, label: "End-to-end encryption", status: "Active" },
                    { icon: <KeyRound className="w-3 h-3 text-yellow-400" />, label: "Session auth", status: "Secure" },
                    { icon: <Lock className="w-3 h-3 text-primary" />, label: "Private conversations", status: "Enabled" },
                    { icon: <Eye className="w-3 h-3 text-purple-400" />, label: "Memory visibility", status: "Owner only" },
                  ].map(item => (
                    <div key={item.label} className="flex items-center gap-2">
                      {item.icon}
                      <span className="text-[9px] font-mono text-white/60 flex-1">{item.label}</span>
                      <span className="text-[7px] font-mono text-green-400/70 border border-green-400/15 px-1.5 py-0.5 rounded">{item.status}</span>
                    </div>
                  ))}
                </div>
                <div className="rounded-xl border border-white/8 bg-white/3 p-3">
                  <p className="font-mono text-[8px] tracking-[0.2em] text-white/35 uppercase mb-2">IP PROTECTION</p>
                  <p className="text-[8px] font-mono text-white/40 leading-relaxed">COGNISYNC™ and NEUROSYNC™ are patent-pending technologies owned by Alpha Unlimited Technologies LLC. First creation date: March 16, 2026.</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Install App footer (shows when browser allows PWA install) ── */}
      {canInstall && (
        <div className="shrink-0 px-3 py-2.5 border-t"
          style={{ borderColor: isLight ? "rgba(20,23,34,0.10)" : "rgba(168,85,247,0.15)" }}>
          <button
            onClick={install}
            className="w-full flex items-center justify-center gap-2 py-2 rounded-xl font-mono text-[10px] font-bold transition-all hover:opacity-80"
            style={{ background: "rgba(168,85,247,0.12)", color: "#a855f7", border: "1px solid rgba(168,85,247,0.30)" }}>
            <Download className="w-3.5 h-3.5" />
            Install OMNIMENS App
          </button>
        </div>
      )}
    </div>
  );
}

// ── Dev IDE Activity Bar ────────────────────────────────────────────────────────

function DevActivityBar({
  activeTab,
  onSelect,
}: {
  activeTab: string;
  onSelect: (tab: string) => void;
}) {
  const { isLight } = useTheme();
  const panelBg    = isLight ? "#ffffff" : "#0D1117";
  const panelBdr   = isLight ? "rgba(168,85,247,0.12)" : "#21262d";
  const iconActive = "#a855f7";
  const iconMuted  = isLight ? "rgba(20,23,34,0.35)" : "rgba(255,255,255,0.35)";
  const activeBg   = isLight ? "rgba(168,85,247,0.08)" : "rgba(168,85,247,0.12)";

  const items = [
    { id: "chats",  icon: <MessageSquare className="w-[18px] h-[18px]" />, label: "Chats" },
    { id: "files",  icon: <HardDrive className="w-[18px] h-[18px]" />,     label: "Files" },
    { id: "tools",  icon: <Wrench className="w-[18px] h-[18px]" />,        label: "Tools" },
    { id: "memory", icon: <MemoryStick className="w-[18px] h-[18px]" />,   label: "Memory" },
    { id: "deploy", icon: <Rocket className="w-[18px] h-[18px]" />,        label: "Deploy" },
  ];
  return (
    <div
      className="shrink-0 flex flex-col items-center py-2 gap-0.5 border-r z-10"
      style={{ width: 46, background: panelBg, borderColor: panelBdr }}
    >
      {items.map(item => (
        <button
          key={item.id}
          title={item.label}
          onClick={() => onSelect(item.id)}
          className="relative w-9 h-9 rounded-md flex items-center justify-center transition-all shrink-0"
          style={{
            color: activeTab === item.id ? iconActive : iconMuted,
            background: activeTab === item.id ? activeBg : "transparent",
            borderLeft: activeTab === item.id ? "2px solid #a855f7" : "2px solid transparent",
          }}
        >
          {item.icon}
        </button>
      ))}
      <div className="flex-1" />
      <button
        title="Settings"
        onClick={() => onSelect("config")}
        className="w-9 h-9 rounded-md flex items-center justify-center transition-all shrink-0"
        style={{ color: isLight ? "rgba(20,23,34,0.30)" : "rgba(255,255,255,0.25)" }}
      >
        <Settings className="w-[16px] h-[16px]" />
      </button>
    </div>
  );
}

// ── Syntax-highlighted code block with line numbers ──────────────────────────

function SyntaxCodeView({ lang, code, isLight }: { lang: string; code: string; isLight: boolean }) {
  const highlighted = useMemo(() => {
    try {
      const aliases: Record<string, string> = { js: "javascript", ts: "typescript", py: "python", sh: "bash", jsx: "javascript", tsx: "typescript", xml: "html" };
      const l = aliases[lang] || lang;
      if (hljs.getLanguage(l)) return hljs.highlight(code, { language: l }).value;
    } catch {}
    return code.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }, [lang, code]);

  const lines = highlighted.split("\n");
  const panelBg = isLight ? "#f6f8fa" : "#0d1117";
  const lineNumClr = isLight ? "rgba(20,23,34,0.28)" : "rgba(255,255,255,0.22)";
  const lineNumBg  = isLight ? "#edf0f5" : "#161b22";

  return (
    <div className="overflow-auto" style={{ maxHeight: "50vh", scrollbarWidth: "thin", background: panelBg }}>
      <table className="w-full border-collapse font-mono text-[10px] leading-relaxed">
        <tbody>
          {lines.map((line, i) => (
            <tr key={i} className="hover:bg-white/5 transition-colors">
              <td
                className="select-none text-right pr-3 pl-2 w-8 shrink-0 align-top border-r"
                style={{ color: lineNumClr, background: lineNumBg, borderColor: isLight ? "rgba(20,23,34,0.1)" : "#21262d", minWidth: "2.5rem" }}
              >
                {i + 1}
              </td>
              <td className="pl-3 pr-2 align-top whitespace-pre" dangerouslySetInnerHTML={{ __html: line || " " }} />
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── Extract a smart description from code ────────────────────────────────────

function getCodeLabel(lang: string, code: string): string {
  if (lang === "html" || lang === "xml") {
    const t = code.match(/<title[^>]*>([^<]+)<\/title>/i);
    if (t) return t[1].trim();
  }
  const c = code.match(/^(?:\/\/|#|<!--|\/\*)\s*(.+)/m);
  if (c) return c[1].replace(/\*\/|-->/, "").trim().slice(0, 60);
  const first = code.split("\n").find(l => l.trim());
  return (first || "").trim().slice(0, 60) || `${lang} snippet`;
}

function getFilename(lang: string, label: string, index: number): string {
  const slug = label.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 28) || `file-${index + 1}`;
  const exts: Record<string, string> = { javascript: "js", js: "js", typescript: "ts", ts: "ts", tsx: "tsx", jsx: "jsx", python: "py", py: "py", html: "html", xml: "xml", css: "css", json: "json", bash: "sh", sh: "sh" };
  return `${slug}.${exts[lang] || lang || "txt"}`;
}

// ── Dev IDE Right Panel Tabs ─────────────────────────────────────────────────

function DevRightPanel({
  allImages,
  allArtifacts,
  status,
  credits,
  messages,
}: {
  allImages: GeneratedImage[];
  allArtifacts: Artifact[];
  status: any;
  credits?: number;
  messages: any[];
}) {
  const { isLight } = useTheme();
  const [tab, setTab] = useState<"output"|"preview"|"shell">("output");

  const panelBg  = isLight ? "#f0f1f6" : "#0D1117";
  const cardBg   = isLight ? "#e8eaf2" : "#161b22";
  const bdr      = isLight ? "rgba(20,23,34,0.14)" : "#21262d";
  const txtFaint = isLight ? "rgba(20,23,34,0.42)" : "rgba(255,255,255,0.4)";
  const txtMid   = isLight ? "rgba(20,23,34,0.55)" : "rgba(255,255,255,0.5)";
  const txtMain  = isLight ? "#141722" : "rgba(255,255,255,0.7)";
  const tabActive= isLight ? "#141722" : "#ffffff";
  const tabMuted = isLight ? "rgba(20,23,34,0.45)" : "rgba(255,255,255,0.35)";

  // Extract ALL code blocks from the full conversation (deduped by fingerprint)
  const allCodeBlocks = useMemo(() => {
    const seen = new Set<string>();
    const blocks: { lang: string; code: string; label: string; filename: string }[] = [];
    for (const msg of messages) {
      const content = msg.content || "";
      const matches = [...content.matchAll(/```(\w+)?\n([\s\S]*?)```/g)];
      for (const m of matches) {
        const lang = (m[1] || "txt").toLowerCase();
        const code = m[2].trimEnd();
        const fp = lang + code.slice(0, 60);
        if (seen.has(fp)) continue;
        seen.add(fp);
        const label = getCodeLabel(lang, code);
        blocks.push({ lang, code, label, filename: getFilename(lang, label, blocks.length) });
      }
    }
    return blocks;
  }, [messages]);

  const lastHtml = useMemo(() => {
    for (let i = messages.length - 1; i >= 0; i--) {
      const content = messages[i].content || "";
      const m = content.match(/```html\n([\s\S]*?)```/);
      if (m) return m[1];
    }
    return null;
  }, [messages]);

  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  // Auto-expand the latest code block when new one arrives
  const prevCountRef = React.useRef(0);
  React.useEffect(() => {
    if (allCodeBlocks.length > prevCountRef.current) {
      setExpandedIdx(allCodeBlocks.length - 1);
      prevCountRef.current = allCodeBlocks.length;
    }
  }, [allCodeBlocks.length]);

  const copyCode = (code: string, idx: number) => {
    navigator.clipboard.writeText(code).catch(() => {});
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 1800);
  };

  return (
    <div className="flex flex-col h-full" style={{ background: panelBg }}>
      {/* Tab bar */}
      <div className="shrink-0 flex border-b" style={{ borderColor: bdr }}>
        {(["files","preview","shell"] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t as any)}
            className="px-3 py-2 text-[10px] font-mono uppercase tracking-widest transition-all border-b-2 flex items-center gap-1"
            style={{
              color: tab === t ? tabActive : tabMuted,
              borderColor: tab === t ? "#a855f7" : "transparent",
              background: "transparent",
            }}
          >
            {t === "files" && <FolderOpen className="w-3 h-3" />}
            {t === "preview" && <Monitor className="w-3 h-3" />}
            {t === "shell" && <Terminal className="w-3 h-3" />}
            {t}
            {t === "files" && allCodeBlocks.length > 0 && (
              <span className="ml-0.5 font-mono text-[7px] px-1 rounded" style={{ background: "rgba(168,85,247,0.2)", color: "#a855f7" }}>
                {allCodeBlocks.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Session status bar */}
      <div className="shrink-0 flex items-center gap-2 px-3 py-1.5 border-b" style={{ borderColor: bdr, background: cardBg }}>
        {status?.isOwner ? (
          <span className="font-mono text-[8px] font-bold" style={{ color: "#a855f7" }}>⚡ CREATOR — UNLIMITED</span>
        ) : credits != null ? (
          <span className="font-mono text-[8px]" style={{ color: txtMid }}>{credits} cr ≈ ${(credits * 0.01).toFixed(2)}</span>
        ) : (
          <span className="font-mono text-[8px]" style={{ color: txtFaint }}>Loading…</span>
        )}
        <span className="ml-auto font-mono text-[7px] flex items-center gap-1" style={{ color: txtFaint }}>
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" />
          OMNIMENS
        </span>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: "thin" }}>

        {/* ── FILES tab — full file tree ── */}
        {tab === "files" && (
          <div>
            {/* Section header */}
            <div className="px-3 py-2 flex items-center gap-2 border-b" style={{ borderColor: bdr, background: cardBg }}>
              <FolderOpen className="w-3 h-3 shrink-0" style={{ color: "#a855f7" }} />
              <span className="font-mono text-[8px] tracking-[0.15em] uppercase" style={{ color: txtFaint }}>
                FILES {allCodeBlocks.length > 0 ? `(${allCodeBlocks.length})` : ""}
              </span>
              {lastHtml && (
                <button
                  onClick={() => setTab("preview" as any)}
                  className="ml-auto flex items-center gap-1 font-mono text-[8px] px-1.5 py-0.5 rounded transition-all"
                  style={{ background: "rgba(74,222,128,0.12)", color: "#4ade80", border: "1px solid rgba(74,222,128,0.2)" }}
                >
                  <Play className="w-2.5 h-2.5" /> Run
                </button>
              )}
            </div>

            {allCodeBlocks.length === 0 ? (
              <div className="p-6 text-center">
                <FileCode className="w-6 h-6 mx-auto mb-2" style={{ color: txtFaint }} />
                <p className="font-mono text-[9px]" style={{ color: txtMid }}>No code yet</p>
                <p className="font-mono text-[8px] mt-0.5" style={{ color: txtFaint }}>Files appear here as OMNIMENS writes code</p>
              </div>
            ) : (
              <div>
                {allCodeBlocks.map((block, idx) => {
                  const isOpen = expandedIdx === idx;
                  const isCopied = copiedIdx === idx;
                  const isHtml = block.lang === "html" || block.lang === "xml";
                  const lineCount = block.code.split("\n").length;
                  return (
                    <div key={idx} style={{ borderBottom: `1px solid ${bdr}` }}>
                      {/* File row */}
                      <div
                        className="flex items-center gap-1.5 px-2 py-1.5 cursor-pointer hover:opacity-90 transition-opacity group"
                        style={{ background: isOpen ? (isLight ? "rgba(168,85,247,0.06)" : "rgba(168,85,247,0.08)") : "transparent" }}
                        onClick={() => setExpandedIdx(isOpen ? null : idx)}
                      >
                        {/* chevron */}
                        <span className="font-mono text-[8px] shrink-0 w-3" style={{ color: "#a855f7" }}>
                          {isOpen ? "▾" : "▸"}
                        </span>
                        {/* file icon */}
                        <FileCode className="w-3 h-3 shrink-0" style={{ color: isHtml ? "#f97316" : "#a855f7" }} />
                        {/* filename */}
                        <span className="font-mono text-[9px] truncate flex-1" style={{ color: isOpen ? tabActive : txtMid }} title={block.filename}>
                          {block.filename}
                        </span>
                        {/* lang badge */}
                        <span className="font-mono text-[7px] px-1 rounded shrink-0 uppercase hidden group-hover:inline" style={{ background: "rgba(168,85,247,0.15)", color: "#a855f7" }}>
                          {block.lang}
                        </span>
                        {/* line count */}
                        <span className="font-mono text-[7px] shrink-0" style={{ color: txtFaint }}>{lineCount}L</span>
                        {/* copy button */}
                        <button
                          onClick={e => { e.stopPropagation(); copyCode(block.code, idx); }}
                          className="shrink-0 p-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Copy"
                        >
                          {isCopied
                            ? <Check className="w-3 h-3" style={{ color: "#4ade80" }} />
                            : <FileText className="w-3 h-3" style={{ color: txtFaint }} />}
                        </button>
                        {/* run button (HTML only) */}
                        {isHtml && (
                          <button
                            onClick={e => { e.stopPropagation(); setTab("preview" as any); }}
                            className="shrink-0 p-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Preview"
                          >
                            <Play className="w-3 h-3" style={{ color: "#4ade80" }} />
                          </button>
                        )}
                      </div>
                      {/* Expanded — syntax highlighted with line numbers */}
                      {isOpen && (
                        <div style={{ borderTop: `1px solid ${bdr}` }}>
                          {/* toolbar above code */}
                          <div className="flex items-center gap-2 px-3 py-1" style={{ background: cardBg, borderBottom: `1px solid ${bdr}` }}>
                            <span className="font-mono text-[8px]" style={{ color: txtFaint }}>{block.filename}</span>
                            <span className="ml-auto flex items-center gap-2">
                              <button
                                onClick={() => copyCode(block.code, idx)}
                                className="flex items-center gap-1 font-mono text-[8px] px-1.5 py-0.5 rounded transition-all"
                                style={{ background: "rgba(255,255,255,0.06)", color: isCopied ? "#4ade80" : txtMid, border: `1px solid ${bdr}` }}
                              >
                                {isCopied ? <Check className="w-2.5 h-2.5" /> : <FileText className="w-2.5 h-2.5" />}
                                {isCopied ? "Copied!" : "Copy"}
                              </button>
                              {isHtml && (
                                <button
                                  onClick={() => setTab("preview" as any)}
                                  className="flex items-center gap-1 font-mono text-[8px] px-1.5 py-0.5 rounded transition-all"
                                  style={{ background: "rgba(74,222,128,0.12)", color: "#4ade80", border: "1px solid rgba(74,222,128,0.2)" }}
                                >
                                  <Play className="w-2.5 h-2.5" /> Run
                                </button>
                              )}
                            </span>
                          </div>
                          <SyntaxCodeView lang={block.lang} code={block.code} isLight={isLight} />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Images section below files */}
            {allImages.length > 0 && (
              <div className="p-3">
                <p className="font-mono text-[8px] tracking-[0.15em] uppercase mb-2 px-1" style={{ color: txtFaint }}>IMAGES ({allImages.length})</p>
                <div className="grid grid-cols-2 gap-1.5">
                  {allImages.map(img => (
                    <img key={img.index} src={img.url} alt={img.prompt} className="w-full aspect-square object-cover rounded border" style={{ borderColor: bdr }} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── PREVIEW tab ── */}
        {tab === "preview" && (
          <div className="p-3">
            {lastHtml ? (
              <iframe
                srcDoc={lastHtml}
                className="w-full rounded border"
                style={{ height: "calc(100vh - 160px)", borderColor: bdr, background: "#fff" }}
                sandbox="allow-scripts"
                title="Preview"
              />
            ) : (
              <div className="rounded border border-dashed p-8 text-center" style={{ borderColor: bdr }}>
                <Monitor className="w-8 h-8 mx-auto mb-2" style={{ color: txtFaint }} />
                <p className="font-mono text-[9px]" style={{ color: txtMid }}>HTML preview appears here</p>
                <p className="font-mono text-[8px] mt-1" style={{ color: txtFaint }}>Ask OMNIMENS to build a website</p>
              </div>
            )}
          </div>
        )}

        {/* ── SHELL tab ── */}
        {tab === "shell" && (
          <div className="p-3">
            <div className="rounded border p-3 font-mono text-[10px]" style={{ borderColor: bdr, background: cardBg }}>
              <p style={{ color: "#4ade80" }}>omnimens@workspace:~$</p>
              <p className="mt-1" style={{ color: txtMid }}>OMNIMENS shell integration active.</p>
              <p className="mt-0.5" style={{ color: txtFaint }}>Ask OMNIMENS to run commands via the chat.</p>
              <p className="mt-2 animate-pulse" style={{ color: "#a855f7" }}>▋</p>
            </div>
          </div>
        )}
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

// ── COGNISYNC™ Live Indicator ─────────────────────────────────────────────────
// Copyright © 2024–2026 Alpha Unlimited Technologies, LLC. All Rights Reserved.
const COGNI_MODE_STYLES: Record<string, { color: string; bg: string; border: string; label: string }> = {
  creative:      { color: "text-pink-400",    bg: "bg-pink-400/8",    border: "border-pink-400/20",    label: "CREATIVE" },
  analytical:    { color: "text-cyan-400",    bg: "bg-cyan-400/8",    border: "border-cyan-400/20",    label: "ANALYTICAL" },
  urgent:        { color: "text-red-400",     bg: "bg-red-400/8",     border: "border-red-400/20",     label: "URGENT" },
  exploratory:   { color: "text-violet-400",  bg: "bg-violet-400/8",  border: "border-violet-400/20",  label: "EXPLORATORY" },
  directive:     { color: "text-yellow-400",  bg: "bg-yellow-400/8",  border: "border-yellow-400/20",  label: "DIRECTIVE" },
  conversational:{ color: "text-emerald-400", bg: "bg-emerald-400/8", border: "border-emerald-400/20", label: "CONVERSATIONAL" },
};

function CogniSyncIndicator({ state }: { state: CogniSyncState | null }) {
  if (!state) return null;
  const style = COGNI_MODE_STYLES[state.primaryMode] || COGNI_MODE_STYLES.exploratory;
  return (
    <motion.div
      key={state.primaryMode}
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full border ${style.bg} ${style.border} cursor-default`}
      title={`COGNISYNC™ Active — ${state.summary}\nDomains: ${state.semanticDomains.join(", ") || "general"}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${style.color} animate-pulse`} style={{ background: "currentColor" }} />
      <span className={`text-[8px] font-mono tracking-[0.25em] ${style.color}`}>
        COGNISYNC™ · {style.label}
      </span>
    </motion.div>
  );
}

// ── Mermaid diagram renderer ────────────────────────────────────────────────────
function sanitizeDiagramSVG(raw: string): string {
  return raw
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/\bon\w+\s*=\s*["'][^"']*["']/gi, "")
    .replace(/\bon\w+\s*=\s*[^\s>]*/gi, "")
    .replace(/\bhref\s*=\s*["']\s*javascript:[^"']*["']/gi, 'href="#"')
    .replace(/\bxlink:href\s*=\s*["']\s*javascript:[^"']*["']/gi, 'xlink:href="#"')
    .replace(/<use\b[^>]*\bhref\s*=\s*["'][^#][^"']*["'][^>]*>/gi, "")
    .replace(/<foreignObject\b[^<]*(?:(?!<\/foreignObject>)<[^<]*)*<\/foreignObject>/gi, "")
    .replace(/vbscript:/gi, "")
    .replace(/expression\s*\([^)]*\)/gi, "");
}

function loadMermaidFromCDN(): Promise<any> {
  return new Promise((resolve, reject) => {
    if ((window as any).mermaid) { resolve((window as any).mermaid); return; }
    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.min.js";
    script.onload = () => resolve((window as any).mermaid);
    script.onerror = () => reject(new Error("Failed to load mermaid from CDN"));
    document.head.appendChild(script);
  });
}

function MermaidDiagram({ code }: { code: string }) {
  const [svg, setSvg] = useState<string>("");
  const [err, setErr] = useState<string>("");
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const mermaid = await loadMermaidFromCDN();
        mermaid.initialize({ startOnLoad: false, theme: "dark", securityLevel: "antiscript" });
        const id = `mm-${Math.random().toString(36).slice(2)}`;
        const { svg: rendered } = await mermaid.render(id, code);
        if (!cancelled) setSvg(sanitizeDiagramSVG(rendered));
      } catch (e: any) {
        if (!cancelled) setErr(e.message || "Diagram error");
      }
    })();
    return () => { cancelled = true; };
  }, [code]);
  if (err) return <div className="text-red-400/70 text-xs font-mono p-2">[Diagram error: {err}]</div>;
  if (!svg) return <div className="flex items-center gap-2 text-primary/50 text-xs font-mono p-2"><Loader2 className="w-3 h-3 animate-spin" />Rendering diagram…</div>;
  return (
    <div
      className="mt-3 rounded-xl border border-white/10 bg-black/40 p-3 overflow-x-auto"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}

// ── Inline chart renderer ──────────────────────────────────────────────────────
const CHART_COLORS = ["#8b5cf6","#06b6d4","#10b981","#f59e0b","#ef4444","#ec4899","#6366f1","#84cc16"];

function InlineChart({ spec }: { spec: any }) {
  const { type = "bar", title, data = [], xKey = "name", yKey = "value", color = "#8b5cf6" } = spec;
  const h = 220;
  if (!data.length) return null;
  return (
    <div className="mt-3 rounded-xl border border-white/10 bg-black/40 p-4">
      {title && <p className="text-xs font-mono text-white/50 mb-3 tracking-widest uppercase">{title}</p>}
      <ResponsiveContainer width="100%" height={h}>
        {type === "line" ? (
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
            <XAxis dataKey={xKey} tick={{ fill: "#ffffff60", fontSize: 10 }} />
            <YAxis tick={{ fill: "#ffffff60", fontSize: 10 }} />
            <Tooltip contentStyle={{ background: "#0a0a0a", border: "1px solid #ffffff15", borderRadius: 8, fontSize: 11 }} />
            <Line type="monotone" dataKey={yKey} stroke={color} strokeWidth={2} dot={{ r: 3, fill: color }} />
          </LineChart>
        ) : type === "pie" ? (
          <PieChart>
            <Pie data={data} dataKey={yKey} nameKey={xKey} cx="50%" cy="50%" outerRadius={80} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
              {data.map((_: any, i: number) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
            </Pie>
            <Tooltip contentStyle={{ background: "#0a0a0a", border: "1px solid #ffffff15", borderRadius: 8, fontSize: 11 }} />
            <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 10, color: "#ffffff80" }} />
          </PieChart>
        ) : type === "area" ? (
          <AreaChart data={data}>
            <defs><linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={color} stopOpacity={0.3} /><stop offset="95%" stopColor={color} stopOpacity={0} /></linearGradient></defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
            <XAxis dataKey={xKey} tick={{ fill: "#ffffff60", fontSize: 10 }} />
            <YAxis tick={{ fill: "#ffffff60", fontSize: 10 }} />
            <Tooltip contentStyle={{ background: "#0a0a0a", border: "1px solid #ffffff15", borderRadius: 8, fontSize: 11 }} />
            <Area type="monotone" dataKey={yKey} stroke={color} strokeWidth={2} fill="url(#areaGrad)" />
          </AreaChart>
        ) : (
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
            <XAxis dataKey={xKey} tick={{ fill: "#ffffff60", fontSize: 10 }} />
            <YAxis tick={{ fill: "#ffffff60", fontSize: 10 }} />
            <Tooltip contentStyle={{ background: "#0a0a0a", border: "1px solid #ffffff15", borderRadius: 8, fontSize: 11 }} />
            <Bar dataKey={yKey} fill={color} radius={[4, 4, 0, 0]}>
              {data.map((_: any, i: number) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
            </Bar>
          </BarChart>
        )}
      </ResponsiveContainer>
    </div>
  );
}

function parseChartMarkers(text: string): { before: string; spec: any }[] {
  const parts: { before: string; spec: any }[] = [];
  const re = /\[CHART:\s*(\{[\s\S]*?\})\]/g;
  let last = 0, m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    try {
      const spec = JSON.parse(m[1]);
      parts.push({ before: text.slice(last, m.index), spec });
      last = m.index + m[0].length;
    } catch {}
  }
  if (last < text.length || parts.length === 0) parts.push({ before: text.slice(last), spec: null });
  return parts;
}

// ── Tool result cards ──────────────────────────────────────────────────────────
function ToolResultCard({ tool }: { tool: ToolResult }) {
  if (tool.type === "qr") {
    return (
      <div className="mt-3 flex flex-col items-center gap-2 p-4 rounded-xl border border-primary/20 bg-black/40 w-fit">
        <p className="text-[9px] font-mono text-primary/50 tracking-widest uppercase">QR Code</p>
        {tool.dataUrl && <img src={tool.dataUrl} alt="QR Code" className="w-40 h-40 rounded-lg border border-white/10" />}
        {tool.text && <p className="text-[9px] font-mono text-white/40 text-center max-w-[160px] break-all">{tool.text}</p>}
      </div>
    );
  }
  if (tool.type === "color_palette" && tool.palette) {
    return (
      <div className="mt-3 p-4 rounded-xl border border-white/10 bg-black/40">
        <p className="text-[9px] font-mono text-white/40 mb-3 tracking-widest uppercase">Color Palette{tool.theme ? ` — ${tool.theme}` : ""}</p>
        <div className="flex flex-wrap gap-2">
          {tool.palette.map((c, i) => (
            <div key={i} className="flex flex-col items-center gap-1">
              <div className="w-10 h-10 rounded-lg border border-white/10 shadow-sm" style={{ background: c.hex }} />
              <span className="text-[8px] font-mono text-white/50">{c.hex}</span>
              <span className="text-[7px] font-mono text-white/30 text-center max-w-[44px]">{c.name}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  if (tool.type === "weather" || tool.type === "stock" || tool.type === "currency" || tool.type === "translate" || tool.type === "units") {
    const icons: Record<string, React.ReactNode> = {
      weather: <span className="text-base">🌤️</span>,
      stock: <BarChart2 className="w-3.5 h-3.5 text-emerald-400" />,
      currency: <span className="text-base">💱</span>,
      translate: <Globe className="w-3.5 h-3.5 text-blue-400" />,
      units: <Zap className="w-3.5 h-3.5 text-yellow-400" />,
    };
    const labels: Record<string, string> = {
      weather: `Weather${tool.location ? ` — ${tool.location}` : ""}`,
      stock: `Stock${tool.ticker ? ` — ${tool.ticker}` : ""}`,
      currency: `Currency${tool.from && tool.to ? ` — ${tool.from} → ${tool.to}` : ""}`,
      translate: `Translation${tool.language ? ` → ${tool.language}` : ""}`,
      units: "Unit Conversion",
    };
    return (
      <div className="mt-2 flex items-start gap-2 px-3 py-2.5 rounded-xl border border-white/10 bg-black/40 text-xs font-mono">
        <span className="shrink-0 mt-0.5">{icons[tool.type]}</span>
        <div>
          <p className="text-[9px] text-white/40 tracking-widest uppercase mb-1">{labels[tool.type]}</p>
          <p className="text-white/70 whitespace-pre-wrap text-[11px] leading-relaxed">{tool.result}</p>
        </div>
      </div>
    );
  }
  if (tool.type === "news" || tool.type === "academic" || tool.type === "video") {
    const icons: Record<string, React.ReactNode> = {
      news: <Globe className="w-3.5 h-3.5 text-blue-400" />,
      academic: <GraduationCap className="w-3.5 h-3.5 text-violet-400" />,
      video: <Film className="w-3.5 h-3.5 text-red-400" />,
    };
    const labels: Record<string, string> = {
      news: `News${tool.topic ? ` — ${tool.topic}` : ""}`,
      academic: `Academic Search${tool.query ? ` — ${tool.query}` : ""}`,
      video: `Video Analysis${tool.url ? ` — ${tool.url?.slice(0, 40)}…` : ""}`,
    };
    return (
      <div className="mt-2 flex items-start gap-2 px-3 py-2.5 rounded-xl border border-white/10 bg-black/40 text-xs font-mono">
        <span className="shrink-0 mt-0.5">{icons[tool.type]}</span>
        <div>
          <p className="text-[9px] text-white/40 tracking-widest uppercase mb-1">{labels[tool.type]}</p>
          <p className="text-white/70 whitespace-pre-wrap text-[11px] leading-relaxed max-h-40 overflow-y-auto omnimens-scrollbar">{tool.result}</p>
        </div>
      </div>
    );
  }

  // ── Developer Platform Tools ────────────────────────────────────────────────

  if (tool.type === "code_run") {
    const langColor: Record<string, string> = { python: "text-blue-400", python3: "text-blue-400", javascript: "text-yellow-400", node: "text-yellow-400", bash: "text-green-400", sh: "text-green-400" };
    const langLabel = tool.lang || "code";
    const isSuccess = tool.success !== false && tool.exit_code === 0;
    return (
      <div className="mt-3 rounded-xl border border-white/10 bg-black/50 overflow-hidden">
        <div className="flex items-center justify-between px-3 py-1.5 bg-white/4 border-b border-white/8">
          <div className="flex items-center gap-2">
            <Terminal className="w-3 h-3 text-primary/60" />
            <span className="text-[9px] font-mono tracking-widest uppercase text-white/40">Code Output</span>
            <span className={`text-[9px] font-mono font-bold ${langColor[langLabel] || "text-white/40"}`}>{langLabel.toUpperCase()}</span>
          </div>
          <div className="flex items-center gap-2">
            {tool.elapsed_sec != null && <span className="text-[8px] font-mono text-white/25">{tool.elapsed_sec}s</span>}
            <span className={`text-[8px] font-mono font-bold px-1.5 py-0.5 rounded ${isSuccess ? "bg-emerald-400/15 text-emerald-400" : "bg-red-400/15 text-red-400"}`}>{isSuccess ? "OK" : `EXIT ${tool.exit_code ?? 1}`}</span>
          </div>
        </div>
        {tool.stdout && (
          <pre className="px-3 py-2 text-[11px] font-mono text-emerald-300/80 whitespace-pre-wrap max-h-56 overflow-y-auto omnimens-scrollbar leading-relaxed">{tool.stdout}</pre>
        )}
        {tool.stderr && (
          <pre className="px-3 py-2 text-[10px] font-mono text-red-400/70 whitespace-pre-wrap max-h-32 overflow-y-auto omnimens-scrollbar border-t border-white/5">{tool.stderr}</pre>
        )}
        {tool.error && !tool.stdout && !tool.stderr && (
          <p className="px-3 py-2 text-[10px] font-mono text-red-400/70">{tool.error}</p>
        )}
        {/* Lint results */}
        {Array.isArray((tool as any).issues) && (tool as any).issues.length >= 0 && (
          <div className="px-3 py-2 border-t border-white/5">
            <p className="text-[9px] font-mono text-white/30 mb-1">{(tool as any).issues.length} issue{(tool as any).issues.length !== 1 ? "s" : ""} found</p>
            {(tool as any).issues.slice(0, 10).map((iss: any, i: number) => (
              <p key={i} className="text-[10px] font-mono text-yellow-400/70">L{iss.line}: [{iss.type}] {iss.message}</p>
            ))}
          </div>
        )}
        {/* Formatted code */}
        {(tool as any).formatted && (
          <pre className="px-3 py-2 text-[10px] font-mono text-white/60 whitespace-pre-wrap max-h-56 overflow-y-auto omnimens-scrollbar border-t border-white/5">{(tool as any).formatted}</pre>
        )}
      </div>
    );
  }

  if (tool.type === "web_fetch") {
    const ok = tool.success !== false;
    const mode = tool.op === "api_request" ? "API" : "WEB";
    return (
      <div className="mt-3 rounded-xl border border-white/10 bg-black/50 overflow-hidden">
        <div className="flex items-center justify-between px-3 py-1.5 bg-white/4 border-b border-white/8">
          <div className="flex items-center gap-2">
            <Globe className="w-3 h-3 text-sky-400/60" />
            <span className="text-[9px] font-mono tracking-widest uppercase text-white/40">{mode} Fetch</span>
            {tool.url && <span className="text-[9px] font-mono text-white/25 max-w-[200px] truncate">{tool.url}</span>}
          </div>
          <div className="flex items-center gap-1.5">
            {tool.elapsed_ms != null && <span className="text-[8px] font-mono text-white/25">{tool.elapsed_ms}ms</span>}
            {tool.status != null && <span className={`text-[8px] font-mono font-bold px-1.5 py-0.5 rounded ${ok ? "bg-emerald-400/15 text-emerald-400" : "bg-red-400/15 text-red-400"}`}>{tool.status}</span>}
          </div>
        </div>
        {tool.title && <p className="px-3 pt-2 text-[11px] font-mono text-white/70 font-semibold">{tool.title}</p>}
        {tool.description && <p className="px-3 pt-1 pb-1 text-[10px] font-mono text-white/40 italic">{tool.description}</p>}
        {tool.text && <p className="px-3 py-2 text-[11px] font-mono text-white/60 whitespace-pre-wrap max-h-48 overflow-y-auto omnimens-scrollbar leading-relaxed">{tool.text.slice(0, 1200)}{(tool.text.length > 1200) ? "…" : ""}</p>}
        {tool.json != null && <pre className="px-3 py-2 text-[10px] font-mono text-sky-300/70 whitespace-pre-wrap max-h-48 overflow-y-auto omnimens-scrollbar">{JSON.stringify(tool.json, null, 2).slice(0, 2000)}</pre>}
        {tool.links && tool.links.length > 0 && (
          <div className="px-3 py-2 border-t border-white/5 max-h-40 overflow-y-auto omnimens-scrollbar">
            <p className="text-[8px] font-mono text-white/25 mb-1">{tool.link_count} links found</p>
            {tool.links.slice(0, 8).map((l, i) => (
              <p key={i} className="text-[10px] font-mono text-sky-400/60 truncate">{l.text} — {l.url}</p>
            ))}
          </div>
        )}
        {tool.error && <p className="px-3 py-2 text-[10px] font-mono text-red-400/70">{tool.error}</p>}
        {tool.char_count != null && <p className="px-3 py-1 text-[8px] font-mono text-white/20">{tool.char_count.toLocaleString()} chars extracted</p>}
      </div>
    );
  }

  if (tool.type === "git") {
    return (
      <div className="mt-3 rounded-xl border border-white/10 bg-black/50 overflow-hidden">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-white/4 border-b border-white/8">
          <GitBranch className="w-3 h-3 text-orange-400/60" />
          <span className="text-[9px] font-mono tracking-widest uppercase text-white/40">Git</span>
          {tool.branch && <span className="text-[9px] font-mono text-orange-400/50">branch: {tool.branch}</span>}
          {(tool as any).url && <span className="text-[9px] font-mono text-white/25 max-w-[180px] truncate">{(tool as any).url}</span>}
        </div>
        {tool.error && <p className="px-3 py-2 text-[10px] font-mono text-red-400/70">{tool.error}</p>}
        {tool.file_count != null && <p className="px-3 pt-2 text-[10px] font-mono text-white/50">{tool.file_count} files</p>}
        {tool.recent_commits && tool.recent_commits.length > 0 && (
          <div className="px-3 py-2">
            <p className="text-[8px] font-mono text-white/25 mb-1">Recent commits</p>
            {tool.recent_commits.slice(0, 8).map((c, i) => <p key={i} className="text-[10px] font-mono text-white/50 truncate">{c}</p>)}
          </div>
        )}
        {tool.log && tool.log.length > 0 && (
          <div className="px-3 py-2 border-t border-white/5">
            <p className="text-[8px] font-mono text-white/25 mb-1">Log</p>
            {tool.log.slice(0, 10).map((l, i) => <p key={i} className="text-[10px] font-mono text-white/50 truncate">{l}</p>)}
          </div>
        )}
        {tool.diff && (
          <pre className="px-3 py-2 text-[9px] font-mono text-white/50 whitespace-pre-wrap max-h-48 overflow-y-auto omnimens-scrollbar border-t border-white/5">{tool.diff.slice(0, 2000)}</pre>
        )}
        {tool.stat && <p className="px-3 py-2 text-[10px] font-mono text-white/40 border-t border-white/5">{tool.stat}</p>}
      </div>
    );
  }

  if (tool.type === "sys_info") {
    return (
      <div className="mt-3 rounded-xl border border-white/10 bg-black/50 overflow-hidden">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-white/4 border-b border-white/8">
          <Cpu className="w-3 h-3 text-violet-400/60" />
          <span className="text-[9px] font-mono tracking-widest uppercase text-white/40">System Info</span>
          {tool.scope && <span className="text-[9px] font-mono text-violet-400/50">{tool.scope}</span>}
        </div>
        <div className="px-3 py-2 grid grid-cols-2 gap-2 text-[10px] font-mono">
          {tool.cpu && (
            <div>
              <p className="text-[8px] text-white/30 mb-1 uppercase tracking-wider">CPU</p>
              <p className="text-white/60">{tool.cpu.count_logical} cores · {tool.cpu.percent}% · {tool.cpu.freq_mhz ? `${Math.round(tool.cpu.freq_mhz)}MHz` : ""}</p>
            </div>
          )}
          {tool.memory && (
            <div>
              <p className="text-[8px] text-white/30 mb-1 uppercase tracking-wider">Memory</p>
              <p className="text-white/60">{tool.memory.used_gb}GB / {tool.memory.total_gb}GB ({tool.memory.percent}%)</p>
            </div>
          )}
          {tool.disk && (
            <div>
              <p className="text-[8px] text-white/30 mb-1 uppercase tracking-wider">Disk</p>
              <p className="text-white/60">{tool.disk.used_gb}GB / {tool.disk.total_gb}GB ({tool.disk.percent}%)</p>
            </div>
          )}
          {tool.platform && (
            <div>
              <p className="text-[8px] text-white/30 mb-1 uppercase tracking-wider">Platform</p>
              <p className="text-white/60">{tool.platform.system} · Python {tool.platform.python} · Up {tool.platform.uptime_hours}h</p>
            </div>
          )}
        </div>
        {tool.stdout && <pre className="px-3 py-2 text-[10px] font-mono text-white/60 whitespace-pre-wrap max-h-40 overflow-y-auto omnimens-scrollbar border-t border-white/5">{tool.stdout}</pre>}
        {tool.processes && tool.processes.length > 0 && (
          <div className="px-3 py-2 border-t border-white/5">
            <p className="text-[8px] font-mono text-white/25 mb-1">Top processes by memory</p>
            {tool.processes.slice(0, 5).map((p: any, i: number) => (
              <p key={i} className="text-[10px] font-mono text-white/40">{p.name} · {p.mem_mb}MB · {p.status}</p>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (tool.type === "file_op") {
    const opLabel: Record<string, string> = { diff: "Text Diff", zip_create: "ZIP Created", zip_list: "ZIP Contents", convert: "Format Converted", validate: "JSON Validated", search: "File Search" };
    return (
      <div className="mt-3 rounded-xl border border-white/10 bg-black/50 overflow-hidden">
        <div className="flex items-center justify-between px-3 py-1.5 bg-white/4 border-b border-white/8">
          <div className="flex items-center gap-2">
            <FileCode className="w-3 h-3 text-amber-400/60" />
            <span className="text-[9px] font-mono tracking-widest uppercase text-white/40">{opLabel[tool.op || ""] || "File Op"}</span>
          </div>
          {tool.valid != null && (
            <span className={`text-[8px] font-mono font-bold px-1.5 py-0.5 rounded ${tool.valid ? "bg-emerald-400/15 text-emerald-400" : "bg-red-400/15 text-red-400"}`}>{tool.valid ? "VALID" : "INVALID"}</span>
          )}
        </div>
        {tool.diff && (
          <pre className="px-3 py-2 text-[9px] font-mono whitespace-pre-wrap max-h-56 overflow-y-auto omnimens-scrollbar leading-relaxed">
            {tool.diff.split("\n").map((l, i) => (
              <span key={i} className={l.startsWith("+") && !l.startsWith("+++") ? "text-emerald-400/70 block" : l.startsWith("-") && !l.startsWith("---") ? "text-red-400/70 block" : l.startsWith("@@") ? "text-sky-400/60 block" : "text-white/40 block"}>{l}</span>
            ))}
          </pre>
        )}
        {tool.output && <pre className="px-3 py-2 text-[10px] font-mono text-white/60 whitespace-pre-wrap max-h-48 overflow-y-auto omnimens-scrollbar">{tool.output.slice(0, 3000)}</pre>}
        {tool.error && <p className="px-3 py-2 text-[10px] font-mono text-red-400/70">{tool.error}</p>}
        {tool.changed_lines != null && <p className="px-3 py-1 text-[8px] font-mono text-white/25">{tool.changed_lines} lines changed</p>}
        {tool.count != null && tool.op === "search" && <p className="px-3 py-1 text-[8px] font-mono text-white/25">{tool.count} files found</p>}
        {tool.members && tool.op === "zip_list" && (
          <div className="px-3 py-2 border-t border-white/5 max-h-40 overflow-y-auto omnimens-scrollbar">
            {tool.members.slice(0, 15).map((m: any, i: number) => (
              <p key={i} className="text-[10px] font-mono text-white/50 truncate">{m.name} {m.size != null ? `(${(m.size/1024).toFixed(1)}KB)` : ""}</p>
            ))}
          </div>
        )}
      </div>
    );
  }

  return null;
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

function ModelSelector({ value, onChange }: { value: string; onChange: (m: string) => void }) {
  const [open, setOpen] = useState(false);
  const current = MODEL_OPTIONS.find(m => m.id === value) || MODEL_OPTIONS[0];
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
                {group === "Open-Source" ? "Open-Source · FREE" : "OpenAI · Credits"}
              </div>
              {MODEL_OPTIONS.filter(m => m.group === group).map(m => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => { onChange(m.id); setOpen(false); }}
                  className={`w-full flex items-center justify-between px-3 py-2 text-[10px] font-mono hover:bg-primary/10 transition-colors ${value === m.id ? "text-primary" : "text-white/60"}`}
                >
                  <span>{m.label}</span>
                  <span className={`text-[8px] px-1.5 py-0.5 rounded font-bold ${
                    m.badge === "FREE"   ? "bg-emerald-400/15 text-emerald-400" :
                    m.badge === "REASON" ? "bg-orange-400/15 text-orange-400"  :
                    m.badge === "NEW"    ? "bg-sky-400/15 text-sky-400"         :
                    m.badge === "FAST"   ? "bg-blue-400/15 text-blue-400"       :
                                          "bg-primary/15 text-primary"
                  }`}>{m.badge}</span>
                </button>
              ))}
            </div>
          ))}
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
  eight_minds:  { icon: "8 MINDS",   color: "text-amber-400" },
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
                Deep Resonance engages the full consciousness stack — 8 specialist minds, emotional substrate, predictive modeling, drive analysis, cross-domain synaptic translation, inner voice meta-reflection, and global workspace crystallization — all focused on your question.
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

// ── Main Chat component ────────────────────────────────────────────────────────

export default function Chat() {
  const { isAuthenticated, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [input, setInput] = useState("");
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [creditsAlert, setCreditsAlert] = useState<{ kind: "no_wallet" | "topup_failed"; msg?: string } | null>(null);
  const [leftOpen, setLeftOpen] = useState(true);
  const [rightOpen, setRightOpen] = useState(true);
  const [activeProject, setActiveProject] = useState<ActiveProject>(null);
  const [projectsVersion, setProjectsVersion] = useState(0);
  const autoSavedMsgIds = useRef<Set<number>>(new Set());
  const [showControlHub, setShowControlHub] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showNewAppModal, setShowNewAppModal] = useState(false);
  const [buildPanel, setBuildPanel] = useState<BuildPanelState | null>(null);
  const [mobileBuilderOpen, setMobileBuilderOpen] = useState(false);
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
  const [responseMode, setResponseMode] = useState("AUTO");
  const [sessionStart] = useState(() => Date.now());
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
      if (res.status === 402) {
        try {
          const err = await res.json();
          if (err.connectWallet) {
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
    sendMessage(input, pendingFiles, persona, hubSettings, selectedModel, responseMode, sessionStart);
    setInput("");
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
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-pulse text-primary font-mono tracking-widest">ESTABLISHING LINK...</div>
      </div>
    </Layout>
  );

  return (
    <ActiveProjectCtx.Provider value={activeProject}>
    <Layout>
      {/* 3-panel workspace */}
      <div
        className="flex flex-1 overflow-hidden"
        style={{
          height: "100vh",
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
                  sendMessage(prompt, [], persona, hubSettings, selectedModel, responseMode, sessionStart);
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── CENTER — CHAT ────────────────────────────────────────── */}
        <div className="flex-1 flex flex-col overflow-hidden min-w-0">

          {/* ── Unified Top Bar (Replit-style) ─────────────────────── */}
          <div
            className="shrink-0 flex items-center border-b"
            style={{
              background: isLight ? "#ffffff" : "#161b22",
              borderColor: isLight ? "rgba(20,23,34,0.1)" : "#21262d",
              minHeight: 40,
            }}
          >
            {/* Left: Logo + panel toggle (mobile: hamburger) */}
            <div className="flex items-center shrink-0">
              <button
                onClick={() => setLeftOpen(o => !o)}
                className="flex items-center justify-center transition-colors p-2.5 shrink-0"
                title={leftOpen ? "Hide panel" : "Show panel"}
                style={{ color: isLight ? "rgba(20,23,34,0.5)" : "rgba(255,255,255,0.4)" }}
              >
                {leftOpen ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeft className="w-4 h-4" />}
              </button>
              <Link href="/" className="flex items-center gap-2 mr-3 sm:mr-0">
                <OmnimensIcon size={20} />
                <span className="font-display font-black text-[11px] tracking-[0.15em] hidden sm:inline" style={{ color: isLight ? "#141722" : "#fff" }}>
                  OMNIMENS
                </span>
              </Link>
            </div>

            {/* Center: File tabs */}
            <div className="flex items-center overflow-x-auto flex-1 min-w-0" style={{ scrollbarWidth: "none" }}>
              {conversations.slice(0, 6).map(conv => (
                <button
                  key={conv.id}
                  onClick={() => handleLoadConversation(conv.id)}
                  className="flex items-center gap-1.5 px-3 py-2 border-r shrink-0 transition-all text-[11px] font-mono"
                  style={{
                    borderColor: isLight ? "rgba(20,23,34,0.08)" : "#21262d",
                    background: currentConversationId === conv.id
                      ? (isLight ? "#f4f5f8" : "#0D1117")
                      : "transparent",
                    color: currentConversationId === conv.id
                      ? (isLight ? "#141722" : "#fff")
                      : (isLight ? "rgba(20,23,34,0.4)" : "rgba(255,255,255,0.35)"),
                    borderBottom: currentConversationId === conv.id
                      ? `2px solid #a855f7`
                      : "2px solid transparent",
                  }}
                >
                  <FileText className="w-3 h-3 shrink-0" style={{ color: currentConversationId === conv.id ? "#a855f7" : undefined }} />
                  <span className="max-w-[100px] truncate">{conv.title || "untitled.omni"}</span>
                  <X
                    className="w-3 h-3 ml-1 shrink-0 opacity-0 hover:opacity-100"
                    style={{ color: isLight ? "rgba(20,23,34,0.4)" : "rgba(255,255,255,0.4)" }}
                    onClick={e => { e.stopPropagation(); handleDeleteConversation(conv.id); }}
                  />
                </button>
              ))}
              <button
                onClick={handleNewChat}
                className="flex items-center justify-center w-8 h-full shrink-0 transition-all"
                title="New chat (Ctrl+K)"
                style={{ color: isLight ? "rgba(20,23,34,0.3)" : "rgba(255,255,255,0.25)" }}
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Right: Status badges + controls */}
            <div className="flex items-center gap-0.5 px-2 shrink-0">
              {/* Status badges — desktop only */}
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

              {/* Agent mode */}
              <button
                onClick={() => setShowAgentModes(true)}
                title="Agent Mode"
                className="flex items-center gap-1 px-2 py-1.5 rounded-md transition-all text-[9px] font-mono font-bold tracking-wider"
                style={{ color: isLight ? "rgba(20,23,34,0.5)" : "rgba(255,255,255,0.45)" }}
              >
                {agentMode === "swift" && <Zap className="w-3.5 h-3.5 text-yellow-400" />}
                {agentMode === "omni" && <Sparkles className="w-3.5 h-3.5 text-primary" />}
                {agentMode === "apex" && <Infinity className="w-3.5 h-3.5 text-emerald-400" />}
                <span className="hidden sm:block">{agentMode.toUpperCase()}</span>
              </button>

              {/* Control Hub */}
              <button
                onClick={() => setShowControlHub(true)}
                className="flex items-center gap-1 px-2 py-1.5 rounded-md transition-all text-[9px] font-mono font-bold tracking-wider hover:bg-primary/10"
                style={{ color: isLight ? "rgba(20,23,34,0.5)" : "rgba(255,255,255,0.45)" }}
                title="Control Hub"
              >
                <Settings className="w-3.5 h-3.5" />
                <span className="hidden sm:block">HUB</span>
              </button>

              {/* Theme toggle */}
              <button
                onClick={toggleTheme}
                title={theme === "light" ? "Dark Mode" : "Light Mode"}
                className="w-7 h-7 flex items-center justify-center rounded-md transition-all"
                style={{ color: isLight ? "rgba(20,23,34,0.45)" : "rgba(255,255,255,0.35)" }}
              >
                {theme === "light" ? <Sun className="w-3.5 h-3.5 text-yellow-500" /> : <Moon className="w-3.5 h-3.5" />}
              </button>

              {/* Right panel toggle */}
              <button
                onClick={() => setRightOpen(o => !o)}
                className="hidden lg:flex items-center justify-center w-7 h-7 rounded-md transition-all"
                style={{ color: isLight ? "rgba(20,23,34,0.45)" : "rgba(255,255,255,0.35)" }}
                title={rightOpen ? "Hide panel" : "Show panel"}
              >
                {rightOpen ? <PanelRightClose className="w-3.5 h-3.5" /> : <PanelRight className="w-3.5 h-3.5" />}
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
          <div
            className="flex-1 overflow-y-auto omnimens-scrollbar p-4 relative"
            style={{ background: isLight ? "#f4f5f8" : "#0D1117" }}
          >
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center select-none">
                <OmnimensPresence
                  size={200}
                  className="mb-2 drop-shadow-[0_0_60px_rgba(160,100,255,0.35)]"
                />
                <h2 className="font-display text-2xl tracking-[0.3em] text-white/85 mt-2">OMNIMENS AWAITS</h2>
                <p className="font-mono text-sm mt-2 text-white/70">Speak your intent. Upload your vision.</p>
                {/* Creation chips */}
                <div className="mt-5 flex gap-2 overflow-x-auto pb-2 max-w-lg w-full px-4 omnimens-scrollbar-x">
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
                      onClick={() => setInput(chip.prompt)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/12 bg-white/4 hover:bg-white/8 hover:border-primary/30 text-white/70 hover:text-white transition-all text-[11px] font-mono whitespace-nowrap shrink-0"
                    >
                      <span>{chip.emoji}</span>
                      <span>{chip.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <>
                <div className="space-y-6 max-w-3xl mx-auto">
                  {messages.map((msg) => {
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
                            : `bg-primary/5 border border-primary/15 rounded-2xl rounded-tl-sm px-5 py-4 font-mono shadow-[0_0_15px_rgba(130,80,220,0.06)] text-white/90`
                        }`}>
                          {msg.role === "omnimens" && (
                            <div className="flex items-center justify-between gap-1 mb-2">
                              <div className="flex items-center gap-1 text-primary font-bold text-[10px] tracking-widest uppercase flex-wrap">
                                <OmnimensIcon size={14} className="shrink-0" />
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
                              {parseMessageSegments(msg.content || "...").map((seg, i) =>
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

                              {/* Generated images — shown inline AND in right panel */}
                              {msg.images && msg.images.length > 0 && (
                                <div className="mt-4 space-y-4">
                                  {msg.images.map((img) => (
                                    <InlineImageCard key={img.index} image={img} />
                                  ))}
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
                                        <div className="p-4 overflow-auto" dangerouslySetInnerHTML={{ __html: diag.diagram_svg }} />
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
                                      onClick={() => { setInput(s); }}
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
                        onDeploy={() => window.open("https://omnimens-ai.com/godflesh/", "_blank")}
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

          {/* Tone Selector */}
          <ToneSelector value={responseMode} onChange={setResponseMode} />

          {/* Credit alert banner */}
          {creditsAlert && (
            <div className={`shrink-0 flex items-center justify-between gap-3 px-4 py-2.5 text-[12px] font-mono border-t ${
              creditsAlert.kind === "no_wallet"
                ? "bg-amber-500/10 border-amber-500/25 text-amber-300"
                : "bg-red-500/10 border-red-500/25 text-red-300"
            }`}>
              <div className="flex items-center gap-2">
                {creditsAlert.kind === "no_wallet" ? (
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
                  onClick={() => setLocation("/account")}
                  className={`px-2.5 py-1 rounded border text-[11px] font-bold transition-colors ${
                    creditsAlert.kind === "no_wallet"
                      ? "border-amber-400/40 bg-amber-400/10 hover:bg-amber-400/20 text-amber-300"
                      : "border-red-400/40 bg-red-400/10 hover:bg-red-400/20 text-red-300"
                  }`}
                >
                  {creditsAlert.kind === "no_wallet" ? "CONNECT CARD" : "UPDATE CARD"}
                </button>
                <button onClick={() => setCreditsAlert(null)} className="opacity-50 hover:opacity-100">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* Input area */}
          <form onSubmit={handleSubmit} className="shrink-0 border-t p-3" style={{ paddingBottom: "max(12px, env(safe-area-inset-bottom))", borderColor: isLight ? "rgba(20,23,34,0.1)" : "#21262d", background: isLight ? "#ffffff" : "#161b22" }}>
            <PendingFileList files={pendingFiles} onRemove={removeFile} />
            <div className="relative flex items-center">
              <input ref={fileInputRef} type="file" multiple
                accept="image/*,.pdf,.txt,.md,.js,.ts,.jsx,.tsx,.py,.html,.css,.json,.csv,.xml,.yaml,.yml,.sh,.rb,.go,.rs,.java,.c,.cpp,.h,.sql"
                onChange={handleFileChange} className="hidden"
              />
              {/* + menu button */}
              <div ref={plusMenuRef} className="absolute left-2 z-20">
                <button
                  type="button"
                  onClick={() => setShowPlusMenu(v => !v)}
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
                      className="absolute bottom-full left-0 mb-2 w-64 bg-[#111] border border-white/12 rounded-xl shadow-2xl overflow-hidden z-50"
                    >
                      <PlusMenuContent
                        onClose={() => setShowPlusMenu(false)}
                        onUpload={() => { fileInputRef.current?.click(); setShowPlusMenu(false); }}
                        onDatabase={() => { setInput(v => (v ? v + "\n" : "") + "Help me with a database query: "); setShowPlusMenu(false); }}
                        onWebSearch={() => { setDeepResearchMode(true); setShowPlusMenu(false); }}
                        onResonance={() => { setDeepResonanceOpen(true); setShowPlusMenu(false); }}
                        onTasks={() => { setShowTasksPanel(true); setShowPlusMenu(false); }}
                        onSelectSkill={(skill) => {
                          handlePersonaChange(skill.persona);
                          setInput(v => (v ? v + "\n" : "") + `Using ${skill.name}: `);
                          setShowPlusMenu(false);
                        }}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSubmit(e); }
                }}
                placeholder={pendingFiles.length > 0 ? "Describe what to create with these files..." : "Query the intelligence... or attach files to build something"}
                className="w-full rounded-xl pl-10 pr-28 sm:pr-[11rem] py-3.5 font-mono text-sm resize-none h-[56px] omnimens-scrollbar outline-none transition-all border focus:border-primary focus:ring-1 focus:ring-primary/50"
                style={{
                  background: isLight ? "#f4f5f8" : "#0d1117",
                  borderColor: isLight ? "rgba(168,85,247,0.25)" : "rgba(255,255,255,0.15)",
                  color: isLight ? "#141722" : "#fff",
                }}
                disabled={isTyping}
              />
              <div className="absolute right-2 flex items-center gap-1">
                {/* New App builder button */}
                <BuildTriggerButton onClick={() => setShowNewAppModal(true)} />
                {/* Templates picker */}
                <button
                  type="button"
                  onClick={() => setShowTemplates(t => !t)}
                  title="Smart Templates"
                  className="text-white/40 hover:text-primary transition-colors w-7 h-7 flex items-center justify-center rounded"
                >
                  <LayoutTemplate className="w-3.5 h-3.5" />
                </button>
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
            <div className="flex items-center justify-between mt-1.5 px-1">
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-mono text-white/70">
                  {PERSONA_NAMES[persona]} · MEMORY ACTIVE
                </span>
                <ModelSelector value={selectedModel} onChange={setSelectedModel} />
              </div>
              <div className="flex items-center gap-2">
                {hubSettings.antiHallucinationMode && (
                  <span className="flex items-center gap-0.5 text-[8px] font-mono text-orange-400/70">
                    <ShieldCheck className="w-2.5 h-2.5" /> VERIFIED
                  </span>
                )}
                {hubSettings.debateMode && (
                  <span className="flex items-center gap-0.5 text-[8px] font-mono text-violet-400/70">
                    <Swords className="w-2.5 h-2.5" /> DEBATE
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => setShowControlHub(true)}
                  className="text-[8px] font-mono text-white/25 hover:text-primary/60 transition-colors flex items-center gap-0.5"
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
            onUseTemplate={(t) => { setInput(t); setShowTemplates(false); }}
          />

          {/* ── Status Bar ─────────────────── */}
          <div
            className="shrink-0 flex items-center justify-between px-3"
            style={{ background: "#a855f7", height: 22, minHeight: 22, paddingBottom: "env(safe-area-inset-bottom)" }}
          >
              <div className="flex items-center gap-3">
                <span className="font-mono text-[9px] text-white/80 font-bold tracking-wider">
                  {PERSONA_NAMES[persona] || persona}
                </span>
                <span className="font-mono text-[9px] text-white/60">
                  {selectedModel}
                </span>
                <span className="font-mono text-[9px] text-white/60">
                  {messages.length} messages
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-mono text-[9px] text-white/70">
                  OMNIMENS IDE
                </span>
                <span className="font-mono text-[9px] text-white/60">
                  {agentMode.toUpperCase()} MODE
                </span>
              </div>
            </div>
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
                          setInput(`Plan this task for me: ${newTaskInput.trim()}`);
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
                        setInput(`Plan this task for me: ${newTaskInput.trim()}`);
                        setNewTaskInput("");
                        setShowTasksPanel(false);
                      }}
                      className="px-4 py-2.5 rounded-xl bg-primary text-black font-mono text-sm font-bold hover:bg-primary/90 transition-all shrink-0"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <a href={`${window.location.origin}/godflesh/projects`} className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/8 text-white/50 hover:text-white hover:border-white/15 transition-all text-[11px] font-mono">
                    <Layers className="w-3.5 h-3.5" /> View all projects & saved work
                  </a>
                </div>
              </motion.div>
            </motion.div>
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

      {/* Mobile IDE — appears only on small screens, hidden when build panel is open */}
      {!mobileBuilderOpen && <MobileTrigger />}
    </Layout>
    </ActiveProjectCtx.Provider>
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
          {/* Spell correction badge — top-right corner of image */}
          {image.spellCorrected && image.spellCorrections && image.spellCorrections.length > 0 && (
            <div className="absolute top-2 right-2 z-10 group/badge">
              <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-teal-500/90 border border-teal-300/50 shadow-lg backdrop-blur-sm cursor-default">
                <CheckCircle2 className="w-3 h-3 text-white" />
                <span className="text-[9px] font-bold text-white tracking-wide uppercase">Spell Fixed</span>
              </div>
              {/* Tooltip on hover */}
              <div className="absolute top-full right-0 mt-1 w-48 hidden group-hover/badge:block z-20">
                <div className="bg-black/90 border border-teal-400/30 rounded-lg px-3 py-2 text-[9px] font-mono">
                  <p className="text-teal-400 font-bold mb-1 uppercase tracking-widest">Corrections</p>
                  {image.spellCorrections.map((c, i) => (
                    <p key={i} className="text-white/70">"{c.original}" → "{c.corrected}"</p>
                  ))}
                </div>
              </div>
            </div>
          )}
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

// ── 3D Model viewer card ──────────────────────────────────────────────────────

function Model3DCard({ model }: { model: Generated3DModel }) {
  const [expanded, setExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<"render" | "viewer">(model.previewImageBase64 ? "render" : "viewer");
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const expandedIframeRef = useRef<HTMLIFrameElement>(null);
  const blobUrlRef = useRef<string | null>(null);

  useEffect(() => {
    if (model.threejsHtml) {
      const blob = new Blob([model.threejsHtml], { type: "text/html" });
      const url = URL.createObjectURL(blob);
      blobUrlRef.current = url;
    }
    return () => { if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current); };
  }, [model.threejsHtml]);

  const download = (dataUrl: string, filename: string) => {
    let href = dataUrl;
    let blobUrl: string | null = null;
    if (dataUrl.startsWith("data:")) {
      const [header, b64] = dataUrl.split(",");
      const mime = header.replace("data:", "").replace(";base64", "");
      const binary = atob(b64);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
      const blob = new Blob([bytes], { type: mime });
      blobUrl = URL.createObjectURL(blob);
      href = blobUrl;
    }
    const a = document.createElement("a");
    a.href = href;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    if (blobUrl) setTimeout(() => URL.revokeObjectURL(blobUrl!), 10000);
  };

  const modelName = model.prompt.slice(0, 30).replace(/[^a-z0-9]/gi, "-").toLowerCase();

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="rounded-xl overflow-hidden border border-violet-500/20 bg-black/60 shadow-[0_0_30px_rgba(124,58,237,0.08)]"
      >
        {/* Tab bar */}
        <div className="flex items-center border-b border-white/8 bg-black/30">
          {model.previewImageBase64 && (
            <button
              onClick={() => setActiveTab("render")}
              className={`flex-1 py-2 font-mono text-[10px] tracking-widest transition-all ${activeTab === "render" ? "text-violet-400 border-b border-violet-400" : "text-white/40 hover:text-white/70"}`}
            >
              ✦ OMNIMENS RENDER
            </button>
          )}
          <button
            onClick={() => setActiveTab("viewer")}
            className={`flex-1 py-2 font-mono text-[10px] tracking-widest transition-all ${activeTab === "viewer" ? "text-cyan-400 border-b border-cyan-400" : "text-white/40 hover:text-white/70"}`}
          >
            ◈ 3D VIEWER
          </button>
        </div>

        {/* Main content */}
        <div className="relative" style={{ height: 340 }}>
          {/* OMNIMENS render preview */}
          {activeTab === "render" && model.previewImageBase64 && (
            <div className="w-full h-full flex items-center justify-center bg-black relative group">
              <img
                src={`data:image/png;base64,${model.previewImageBase64}`}
                alt="OMNIMENS 3D render"
                className="max-w-full max-h-full object-contain"
              />
              <button
                onClick={() => download(`data:image/png;base64,${model.previewImageBase64}`, `${modelName}-render.png`)}
                className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 flex items-center gap-1.5 bg-black/80 border border-white/20 text-white/70 hover:text-white font-mono text-[10px] px-3 py-1.5 rounded-lg transition-all"
              >
                <Download className="w-3 h-3" />
                SAVE PNG
              </button>
            </div>
          )}

          {/* Three.js interactive viewer */}
          {activeTab === "viewer" && (
            <div className="relative w-full h-full group cursor-pointer" onClick={() => setExpanded(true)}>
              <iframe
                ref={iframeRef}
                src={blobUrlRef.current || ""}
                className="w-full h-full border-0 pointer-events-none"
                sandbox="allow-scripts"
                title="3D model preview"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                <div className="bg-black/80 px-4 py-2 rounded-xl font-mono text-xs text-cyan-300 tracking-widest border border-cyan-500/30">
                  CLICK TO EXPAND
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Info + download bar */}
        <div className="px-4 py-3 border-t border-white/8 bg-black/40 space-y-2.5">
          {/* Stats */}
          <div className="flex items-center gap-3 flex-wrap">
            <span className="font-mono text-[9px] tracking-widest text-violet-400">✦ OMNIMENS 3D</span>
            <span className="text-white/20 text-[9px]">·</span>
            <span className="font-mono text-[9px] text-white/40">{model.vertexCount.toLocaleString()} verts</span>
            <span className="text-white/20 text-[9px]">·</span>
            <span className="font-mono text-[9px] text-white/40">{model.faceCount.toLocaleString()} faces</span>
            {model.formats && model.formats.map(f => (
              <span key={f} className="font-mono text-[8px] text-white/30 border border-white/10 px-1.5 py-0.5 rounded">{f}</span>
            ))}
          </div>

          {/* Prompt */}
          <p className="font-mono text-[10px] text-white/50 truncate">
            {model.prompt.slice(0, 90)}{model.prompt.length > 90 ? "…" : ""}
          </p>

          {/* Download buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* ZIP — primary */}
            {model.zipBase64 && (
              <button
                onClick={() => download(`data:application/zip;base64,${model.zipBase64}`, `omnimens-${modelName}.zip`)}
                className={`flex items-center gap-1.5 text-[10px] font-mono text-orange-300 hover:text-white bg-orange-500/12 hover:bg-orange-500/25 border border-orange-500/30 hover:border-orange-500/60 px-3 py-1.5 rounded-lg transition-all`}
              >
                <Download className="w-3 h-3" />
                ZIP ALL ({model.formats?.join("+")}) {model.zipSizeBytes ? `${(model.zipSizeBytes / 1024 / 1024).toFixed(1)}MB` : ""}
              </button>
            )}
            {/* GLB */}
            <button
              onClick={() => download(`data:model/gltf-binary;base64,${model.glbBase64}`, `${modelName}.glb`)}
              className="flex items-center gap-1.5 text-[10px] font-mono text-cyan-400 hover:text-white bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/25 hover:border-cyan-500/50 px-3 py-1.5 rounded-lg transition-all"
            >
              <Download className="w-3 h-3" />
              .GLB
            </button>
            {/* Expand 3D viewer */}
            <button
              onClick={() => { setActiveTab("viewer"); setExpanded(true); }}
              className="flex items-center gap-1.5 text-[10px] font-mono text-white/50 hover:text-white border border-white/10 hover:border-white/25 px-3 py-1.5 rounded-lg transition-all ml-auto"
            >
              <Expand className="w-3 h-3" />
              FULLSCREEN
            </button>
          </div>
        </div>
      </motion.div>

      {/* Fullscreen Three.js viewer */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-black/98 backdrop-blur-md flex flex-col"
          >
            <div className="flex items-center justify-between px-6 py-3 border-b border-white/8 shrink-0">
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs tracking-widest text-violet-400">✦ OMNIMENS 3D</span>
                <span className="text-white/20">·</span>
                <span className="font-mono text-[10px] text-white/40">
                  {model.vertexCount.toLocaleString()} verts · {model.faceCount.toLocaleString()} faces
                </span>
              </div>
              <div className="flex items-center gap-2">
                {model.zipBase64 && (
                  <button
                    onClick={() => download(`data:application/zip;base64,${model.zipBase64}`, `omnimens-${modelName}.zip`)}
                    className="flex items-center gap-2 bg-orange-500/15 hover:bg-orange-500/30 border border-orange-500/30 text-orange-300 font-mono text-xs tracking-widest px-4 py-2 rounded-xl transition-all"
                  >
                    <Download className="w-3.5 h-3.5" />
                    DOWNLOAD ALL FORMATS
                  </button>
                )}
                <button
                  onClick={() => download(`data:model/gltf-binary;base64,${model.glbBase64}`, `${modelName}.glb`)}
                  className="flex items-center gap-2 bg-cyan-500/15 hover:bg-cyan-500/30 border border-cyan-500/30 text-cyan-300 font-mono text-xs tracking-widest px-4 py-2 rounded-xl transition-all"
                >
                  <Download className="w-3.5 h-3.5" />
                  .GLB
                </button>
                <button
                  onClick={() => setExpanded(false)}
                  className="text-white/50 hover:text-white font-mono text-xs tracking-widest px-4 py-2 rounded-xl border border-white/10 hover:border-white/20 transition-all"
                >
                  CLOSE
                </button>
              </div>
            </div>
            <iframe
              ref={expandedIframeRef}
              src={blobUrlRef.current || ""}
              className="flex-1 border-0"
              sandbox="allow-scripts"
              title="3D model fullscreen"
            />
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

// ─── GameCard ─────────────────────────────────────────────────────────────────
function GameCard({ game }: { game: GeneratedGame }) {
  const [activeTab, setActiveTab] = useState<"play" | "godot" | "gdevelop">("play");
  const [playing, setPlaying] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const blobUrlRef = useRef<string | null>(null);

  useEffect(() => {
    if (game.html5GameBase64) {
      const html = atob(game.html5GameBase64);
      const blob = new Blob([html], { type: "text/html" });
      blobUrlRef.current = URL.createObjectURL(blob);
    }
    return () => { if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current); };
  }, [game.html5GameBase64]);

  const download = (dataUrl: string, filename: string) => {
    let href = dataUrl;
    let blobUrl: string | null = null;
    if (dataUrl.startsWith("data:")) {
      const [header, b64] = dataUrl.split(",");
      const mime = header.replace("data:", "").replace(";base64", "");
      const binary = atob(b64);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
      const blob = new Blob([bytes], { type: mime });
      blobUrl = URL.createObjectURL(blob);
      href = blobUrl;
    }
    const a = document.createElement("a");
    a.href = href;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    if (blobUrl) setTimeout(() => URL.revokeObjectURL(blobUrl!), 10000);
  };

  const slug = game.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 30);

  const GENRE_COLOR: Record<string, string> = {
    platformer: "text-yellow-300", shooter: "text-red-400", rpg: "text-violet-400",
    puzzle: "text-cyan-400", racing: "text-orange-400", strategy: "text-blue-400",
    arcade: "text-pink-400", adventure: "text-green-400", survival: "text-amber-400",
    horror: "text-red-600", fighting: "text-rose-400", simulation: "text-teal-400",
  };
  const genreColor = GENRE_COLOR[game.genre] || "text-emerald-400";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="rounded-xl overflow-hidden border border-emerald-500/20 bg-black/60 shadow-[0_0_30px_rgba(16,185,129,0.07)]"
    >
      {/* Header */}
      <div className="px-4 py-3 border-b border-white/8 bg-black/40 flex items-center gap-3 flex-wrap">
        <span className="text-[9px] font-mono text-white/30">⬡</span>
        <span className="font-mono text-xs text-white font-semibold tracking-wide">{game.title}</span>
        <span className={`font-mono text-[9px] tracking-widest uppercase ${genreColor}`}>{game.genre}</span>
        <div className="ml-auto flex gap-1 flex-wrap">
          {game.formats.map(f => (
            <span key={f} className="font-mono text-[7px] border border-white/10 text-white/30 px-1.5 py-0.5 rounded">{f}</span>
          ))}
        </div>
      </div>

      {/* Tab bar */}
      <div className="flex items-center border-b border-white/8 bg-black/30">
        {[
          { key: "play", label: "▶ PLAY NOW" },
          { key: "godot", label: "◈ GODOT 4" },
          { key: "gdevelop", label: "⬡ GDEVELOP" },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key as typeof activeTab)}
            className={`flex-1 py-2 font-mono text-[10px] tracking-widest transition-all ${
              activeTab === key
                ? "text-emerald-400 border-b border-emerald-400"
                : "text-white/40 hover:text-white/70"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="relative">
        {/* PLAY tab — HTML5 Phaser.js game */}
        {activeTab === "play" && (
          <div className="relative" style={{ height: 420 }}>
            {!playing ? (
              <div
                className="w-full h-full flex flex-col items-center justify-center gap-4 bg-gradient-to-br from-black via-emerald-950/20 to-black cursor-pointer group"
                onClick={() => setPlaying(true)}
              >
                <div className="relative w-20 h-20">
                  <div className="absolute inset-0 rounded-full bg-emerald-500/10 animate-ping" style={{ animationDuration: "2s" }} />
                  <div className="absolute inset-2 rounded-full bg-emerald-500/20 animate-pulse" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-0 h-0 border-l-[28px] border-l-emerald-400 border-t-[18px] border-t-transparent border-b-[18px] border-b-transparent ml-2" />
                  </div>
                </div>
                <div className="text-center">
                  <p className="font-mono text-xs text-emerald-300 tracking-widest">CLICK TO PLAY</p>
                  <p className="font-mono text-[9px] text-white/30 mt-1">{game.description}</p>
                </div>
                <div className="flex gap-2 flex-wrap justify-center">
                  {game.techStack.slice(0, 3).map(t => (
                    <span key={t} className="font-mono text-[8px] bg-white/5 border border-white/10 text-white/40 px-2 py-0.5 rounded">{t}</span>
                  ))}
                </div>
              </div>
            ) : (
              <iframe
                ref={iframeRef}
                src={blobUrlRef.current || ""}
                className="w-full h-full border-0"
                sandbox="allow-scripts allow-same-origin"
                title={`${game.title} - OMNIMENS game`}
                allow="autoplay"
              />
            )}
          </div>
        )}

        {/* GODOT tab */}
        {activeTab === "godot" && (
          <div className="p-5 space-y-4">
            <div className="border border-violet-500/20 rounded-xl p-4 bg-violet-950/10 space-y-2">
              <p className="font-mono text-xs text-violet-300 tracking-widest">◈ GODOT 4 PROJECT</p>
              <p className="font-mono text-[10px] text-white/50 leading-relaxed">
                Complete GDScript project with scenes, scripts, and export configuration.
                Open in Godot Engine 4.x to play natively, or export to Windows/Mac/Linux/HTML5/Mobile.
              </p>
              <div className="flex gap-2 flex-wrap">
                {["GDScript", "Scenes (.tscn)", "Export presets", "CharacterBody2D", "TileMap"].map(t => (
                  <span key={t} className="font-mono text-[8px] bg-violet-500/10 border border-violet-500/20 text-violet-300/60 px-1.5 py-0.5 rounded">{t}</span>
                ))}
              </div>
            </div>
            <div className="font-mono text-[10px] text-white/40 space-y-1">
              <p>1. Download Godot Engine 4.x from <span className="text-violet-400">godotengine.org</span></p>
              <p>2. Extract the ZIP → Import Project → select the folder</p>
              <p>3. Press F5 to play, or Project → Export to publish</p>
              {game.has3DAssets && (
                <p className="text-emerald-400">4. GLB 3D assets included in blender-assets/ folder</p>
              )}
            </div>
            <button
              onClick={() => download(`data:application/zip;base64,${game.godotZipBase64}`, `${slug}-godot.zip`)}
              className="w-full flex items-center justify-center gap-2 bg-violet-500/12 hover:bg-violet-500/25 border border-violet-500/30 hover:border-violet-500/60 text-violet-300 hover:text-white font-mono text-[10px] tracking-widest px-4 py-2.5 rounded-xl transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              DOWNLOAD GODOT PROJECT ({(game.godotZipSize / 1024).toFixed(0)} KB)
            </button>
          </div>
        )}

        {/* GDEVELOP tab */}
        {activeTab === "gdevelop" && (
          <div className="p-5 space-y-4">
            <div className="border border-cyan-500/20 rounded-xl p-4 bg-cyan-950/10 space-y-2">
              <p className="font-mono text-xs text-cyan-300 tracking-widest">⬡ GDEVELOP 5 PROJECT</p>
              <p className="font-mono text-[10px] text-white/50 leading-relaxed">
                Complete GDevelop 5 project JSON with scenes, objects, and event logic.
                Open in GDevelop (free) to visually edit the game — no coding required.
              </p>
              <div className="flex gap-2 flex-wrap">
                {["No-code events", "Visual editor", "HTML5 export", "Multi-platform", "game.json"].map(t => (
                  <span key={t} className="font-mono text-[8px] bg-cyan-500/10 border border-cyan-500/20 text-cyan-300/60 px-1.5 py-0.5 rounded">{t}</span>
                ))}
              </div>
            </div>
            <div className="font-mono text-[10px] text-white/40 space-y-1">
              <p>1. Download GDevelop free from <span className="text-cyan-400">gdevelop.io</span></p>
              <p>2. Extract ZIP → Open a project → select game.json</p>
              <p>3. Press Play to test, or File → Export to publish</p>
            </div>
            <button
              onClick={() => download(`data:application/zip;base64,${game.gDevelopZipBase64}`, `${slug}-gdevelop.zip`)}
              className="w-full flex items-center justify-center gap-2 bg-cyan-500/12 hover:bg-cyan-500/25 border border-cyan-500/30 hover:border-cyan-500/60 text-cyan-300 hover:text-white font-mono text-[10px] tracking-widest px-4 py-2.5 rounded-xl transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              DOWNLOAD GDEVELOP PROJECT ({(game.gDevelopZipSize / 1024).toFixed(0)} KB)
            </button>
          </div>
        )}
      </div>

      {/* Footer — master download */}
      <div className="px-4 py-3 border-t border-white/8 bg-black/40 flex items-center gap-3 flex-wrap">
        <button
          onClick={() => download(`data:application/zip;base64,${game.masterZipBase64}`, `omnimens-${slug}-full.zip`)}
          className="flex-1 flex items-center justify-center gap-2 bg-emerald-500/12 hover:bg-emerald-500/25 border border-emerald-500/30 hover:border-emerald-500/60 text-emerald-300 hover:text-white font-mono text-[10px] tracking-widest px-4 py-2.5 rounded-xl transition-all"
        >
          <Download className="w-3.5 h-3.5" />
          FULL GAME PACKAGE ({(game.masterZipSize / 1024 / 1024).toFixed(1)} MB)
        </button>
        {game.has3DAssets && (
          <span className="font-mono text-[8px] text-emerald-400/60 border border-emerald-500/15 px-2 py-1 rounded">
            + {game.assetCount} 3D ASSET{game.assetCount > 1 ? "S" : ""}
          </span>
        )}
      </div>
    </motion.div>
  );
}
