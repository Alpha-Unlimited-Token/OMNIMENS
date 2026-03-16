import { useEffect, useRef, useState, useCallback } from "react";
import { Layout } from "@/components/layout";
import { useAuth } from "@workspace/replit-auth-web";
import { useLocation } from "wouter";
import { useGetOmnimensStatus } from "@workspace/api-client-react";
import { useQuery, useQueryClient as useQC } from "@tanstack/react-query";
import { useOmnimensChat, type GeneratedImage, type Generated3DModel, type GeneratedGame, type Artifact, type CostBreakdown, type TaskPlan, type RedFlagAlert } from "@/hooks/use-omnimens-chat";
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
  PanelLeft, PanelRight, X, Layers, Stethoscope, AlertTriangle, HeartPulse,
  MessageSquare, PlusCircle, Trash2
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
  conversations,
  currentConversationId,
  onNewChat,
  onLoadConversation,
  onDeleteConversation,
}: {
  persona: string;
  onPersonaChange: (p: string) => void;
  deepResearchMode: boolean;
  onToggleDeepResearch: () => void;
  voice: any;
  status: any;
  conversations: { id: number; title: string | null; updatedAt: string | null }[];
  currentConversationId: number | undefined;
  onNewChat: () => void;
  onLoadConversation: (id: number) => void;
  onDeleteConversation: (id: number) => void;
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

      {/* New Chat + History */}
      <div>
        <button
          onClick={onNewChat}
          className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-[10px] font-mono font-bold tracking-wider border border-primary/30 text-primary hover:bg-primary/10 transition-all"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          NEW CHAT
        </button>
        {conversations.length > 0 && (
          <div className="mt-2">
            <p className="font-mono text-[9px] tracking-[0.2em] text-white/75 uppercase mb-1 px-1">HISTORY</p>
            <div className="space-y-0.5 max-h-48 overflow-y-auto omnimens-scrollbar">
              {conversations.map(conv => (
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
            </div>
          </div>
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
  const qc = useQC();
  const { messages, sendMessage, isTyping, error, stopGeneration, currentConversationId, startNewConversation, loadConversation } = useOmnimensChat(() => {
    setShowLimitModal(true);
  });

  const { data: conversations = [], refetch: refetchConversations } = useQuery<{ id: number; title: string | null; updatedAt: string | null }[]>({
    queryKey: ["omnimens-conversations"],
    queryFn: () => fetch("/api/omnimens/conversations", { credentials: "include" }).then(r => r.json()),
    refetchInterval: 30000,
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

  // Refresh conversation list after each message
  useEffect(() => {
    if (!isTyping && currentConversationId) {
      refetchConversations();
    }
  }, [isTyping, currentConversationId]);
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
                conversations={conversations}
                currentConversationId={currentConversationId}
                onNewChat={handleNewChat}
                onLoadConversation={handleLoadConversation}
                onDeleteConversation={handleDeleteConversation}
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
                              {msg.generatingImages && <ImageGeneratingBadge />}
                              {msg.generating3d && <Model3DGeneratingBadge />}
                              {msg.generatingGame && <GameGeneratingBadge phase={msg.gamePhase} />}

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
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
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
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
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
