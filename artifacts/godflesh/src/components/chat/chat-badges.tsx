/**
 * OMNIMENS — Proprietary AI Platform
 * Copyright © 2024–2026 Alpha Unlimited Technologies. All Rights Reserved.
 * Chat Badges & Small Cards
 */
import React, { useState, useEffect, createContext, useContext } from "react";
import { motion } from "framer-motion";
import {
  Globe, Loader2, Zap, ChevronDown, CheckCircle2, ArrowRight,
  AlertCircle, AlertTriangle, HeartPulse, Stethoscope,
  Cpu, Microscope, PenLine, BarChart2, Palette, GraduationCap,
  Briefcase, Play, ListChecks,
} from "lucide-react";
import type { CostBreakdown, TaskPlan, RedFlagAlert } from "@/hooks/use-omnimens-chat";

// ── Active Project Context ─────────────────────────────────────────────────────
export type ActiveProject = { id: number; name: string } | null;
export const ActiveProjectCtx = createContext<ActiveProject>(null);
export function useActiveProject() { return useContext(ActiveProjectCtx); }

// ── Small reusable badges ──────────────────────────────────────────────────────

export function WebSearchBadge({ query, done, resultCount }: { query: string; done: boolean; resultCount?: number }) {
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

export function ImageGeneratingBadge({ spellStatus, spellWords, spellCorrections }: {
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

export function ImageSpellConfirmCard({ spellRequestId, corrections, foundWords, onDecision }: {
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

export const OMNIMENS_3D_PHRASES_RAW = [
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

export function fisherYatesShuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function Model3DGeneratingBadge() {
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

export const GAME_PHASES: Record<string, string> = {
  designing:  "Architecting your game world...",
  html5:      "Forging the Phaser.js engine...",
  godot:      "Sculpting the Godot 4 project...",
  gdevelop:   "Assembling the GDevelop blueprint...",
  assets:     "Generating 3D game assets...",
  packing:    "Compressing the multiverse into a zip...",
};

export function GameGeneratingBadge({ phase }: { phase?: string }) {
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

export function CreditCostBadge({ creditCost, costBreakdown }: { creditCost: number; costBreakdown?: CostBreakdown }) {
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

export function UrlAnalysisBadge({ count, done }: { count: number; done: boolean }) {
  return (
    <div className="mt-3 border border-blue-500/20 rounded-xl px-4 py-2 bg-blue-500/5 font-mono text-xs flex items-center gap-3 text-white/70">
      {done ? <Globe className="w-3.5 h-3.5 text-blue-400 shrink-0" /> : <Loader2 className="w-3.5 h-3.5 text-blue-400 animate-spin shrink-0" />}
      <span className="tracking-wider">{done ? `${count} WEB PAGE${count > 1 ? "S" : ""} ANALYZED` : `READING ${count} WEB PAGE${count > 1 ? "S" : ""}...`}</span>
    </div>
  );
}

export const AGENT_MODE_COLORS: Record<string, string> = {
  RESEARCHER: "text-blue-300 border-blue-500/30 bg-blue-500/8",
  BUILDER: "text-emerald-300 border-emerald-500/30 bg-emerald-500/8",
  ANALYST: "text-violet-300 border-violet-500/30 bg-violet-500/8",
  WRITER: "text-amber-300 border-amber-500/30 bg-amber-500/8",
  STRATEGIST: "text-rose-300 border-rose-500/30 bg-rose-500/8",
  OPERATOR: "text-cyan-300 border-cyan-500/30 bg-cyan-500/8",
  GENERAL: "text-white/70 border-white/15 bg-white/5",
};

export function TaskPlanCard({ plan }: { plan: TaskPlan }) {
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

export function MultiSearchBadge({ count, done }: { count: number; done: boolean }) {
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

export const PERSONA_ICONS: Record<string, React.ReactNode> = {
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

export const PERSONA_NAMES: Record<string, string> = {
  GENERAL: "OMNIMENS", CODER: "CODER", RESEARCHER: "RESEARCHER",
  WRITER: "WRITER", ANALYST: "ANALYST", CREATIVE: "CREATIVE",
  TUTOR: "TUTOR", STRATEGIST: "STRATEGIST", GAME_BUILDER: "GAME ARCHITECT",
  PHYSIO: "PHYSIO AI",
};

export const PERSONA_DESC: Record<string, string> = {
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
export const OMNIMENS_SKILLS = [
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

export function RedFlagAlertCard({ alert }: { alert: RedFlagAlert }) {
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

export function ExerciseCard({ exercise }: { exercise: { name: string; sets: number; reps?: string; hold?: number; rest: number; frequency: string; position: string; instructions: string; cues: string[]; painRule: string; progressionCriteria: string; category: string; equipment: string[] } }) {
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

