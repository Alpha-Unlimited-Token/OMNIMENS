/**
 * ============================================================
 * OMNIMENS — Tools Marketplace
 * Copyright © 2024–2026 Alpha Unlimited Technologies. All Rights Reserved.
 * ============================================================
 */
import { useState } from "react";
import { motion } from "framer-motion";
import {
  Globe, Image, Code2, Brain, Microscope, Cpu, Layers, Zap,
  Volume2, Cloud, Newspaper, BookOpen, QrCode, TrendingUp,
  Languages, Youtube, Calculator, Palette, Map, Activity,
  Camera, Film, Music2, FileText, Mail, Search, BarChart3,
  Workflow, Bot, Shield, Star, Lock, ChevronRight, Video
} from "lucide-react";
import { useLocation } from "wouter";
import { SEO, seoData } from "@/components/seo";

type Tool = {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  category: string;
  status: "active" | "beta" | "pro" | "coming";
  tier: "free" | "pro" | "owner";
  link?: string;
};

const TOOLS: Tool[] = [
  // Core AI
  { id: "streaming-chat",  name: "Streaming Chat",        description: "Real-time token-by-token responses with GPT-4o at full context.", icon: <Zap className="w-5 h-5" />,         category: "Core AI",      status: "active",  tier: "free" },
  { id: "image-gen",       name: "Image Generation",       description: "Photorealistic and artistic images via DALL·E / GPT-Image-1.",     icon: <Image className="w-5 h-5" />,        category: "Core AI",      status: "active",  tier: "free" },
  { id: "vision",          name: "Vision & OCR",           description: "Analyze images, screenshots, diagrams, handwriting, and charts.",   icon: <Camera className="w-5 h-5" />,       category: "Core AI",      status: "active",  tier: "free" },
  { id: "voice",           name: "Voice Input",            description: "Speak to OMNIMENS using your microphone in any language.",          icon: <Volume2 className="w-5 h-5" />,      category: "Core AI",      status: "active",  tier: "free" },
  { id: "tts",             name: "Text-to-Speech",         description: "Have any response read aloud in 13 OpenAI voices.",                 icon: <Volume2 className="w-5 h-5" />,      category: "Core AI",      status: "active",  tier: "free" },
  { id: "file-analysis",   name: "File Analysis",          description: "Analyze PDFs, Word docs, CSVs, code files, and more.",             icon: <FileText className="w-5 h-5" />,     category: "Core AI",      status: "active",  tier: "free" },
  { id: "multi-model",     name: "Multi-Model Routing",    description: "Choose GPT-4o, GPT-4o-mini, o3, o4-mini, or GPT-4.1.",            icon: <Cpu className="w-5 h-5" />,          category: "Core AI",      status: "active",  tier: "free" },

  // Intelligence
  { id: "web-search",      name: "Live Web Search",        description: "Real-time internet search with source citations.",                  icon: <Globe className="w-5 h-5" />,        category: "Intelligence", status: "active",  tier: "free" },
  { id: "deep-research",   name: "Deep Research",          description: "Multi-step research pipelines across hundreds of sources.",         icon: <Microscope className="w-5 h-5" />,    category: "Intelligence", status: "active",  tier: "pro" },
  { id: "academic",        name: "Academic Search",        description: "Search ArXiv for the latest peer-reviewed papers.",                 icon: <BookOpen className="w-5 h-5" />,     category: "Intelligence", status: "active",  tier: "free" },
  { id: "news",            name: "Live News",              description: "Real-time news headlines on any topic.",                            icon: <Newspaper className="w-5 h-5" />,    category: "Intelligence", status: "active",  tier: "free" },
  { id: "memory",          name: "Persistent Memory",      description: "OMNIMENS remembers facts about you across all conversations.",      icon: <Brain className="w-5 h-5" />,        category: "Intelligence", status: "active",  tier: "free" },
  { id: "url-analysis",    name: "URL Analyzer",           description: "Paste any URL and OMNIMENS reads and analyzes the full page.",      icon: <Search className="w-5 h-5" />,       category: "Intelligence", status: "active",  tier: "free" },

  // Data & Utilities
  { id: "weather",         name: "Weather",                description: "Live weather and 5-day forecast for any location worldwide.",       icon: <Cloud className="w-5 h-5" />,        category: "Data & Utils", status: "active",  tier: "free" },
  { id: "stocks",          name: "Stock Prices",           description: "Real-time stock quotes, market data, and trends.",                  icon: <TrendingUp className="w-5 h-5" />,   category: "Data & Utils", status: "active",  tier: "free" },
  { id: "currency",        name: "Currency Conversion",    description: "Live exchange rates between 170+ currencies.",                      icon: <Activity className="w-5 h-5" />,     category: "Data & Utils", status: "active",  tier: "free" },
  { id: "translation",     name: "Translation",            description: "Translate text to any of 100+ languages with context awareness.",   icon: <Languages className="w-5 h-5" />,    category: "Data & Utils", status: "active",  tier: "free" },
  { id: "units",           name: "Unit Converter",         description: "Convert any units — length, weight, temperature, pressure, more.",  icon: <Calculator className="w-5 h-5" />,   category: "Data & Utils", status: "active",  tier: "free" },
  { id: "qr-code",         name: "QR Code Generator",      description: "Generate scannable QR codes for URLs, text, contacts, or Wi-Fi.",  icon: <QrCode className="w-5 h-5" />,       category: "Data & Utils", status: "active",  tier: "free" },
  { id: "color-palette",   name: "Color Palette",          description: "Generate branded color palettes from a theme or mood.",             icon: <Palette className="w-5 h-5" />,      category: "Data & Utils", status: "active",  tier: "free" },

  // Creative & Build
  { id: "code-exec",       name: "Code Interpreter",       description: "Execute JavaScript live in a sandboxed environment.",               icon: <Code2 className="w-5 h-5" />,        category: "Creative",     status: "active",  tier: "free" },
  { id: "3d-gen",          name: "3D Model Generation",    description: "Generate Three.js 3D models from text prompts.",                   icon: <Layers className="w-5 h-5" />,       category: "Creative",     status: "active",  tier: "pro" },
  { id: "game-gen",        name: "Game Creation Engine",   description: "Build complete browser games from a single prompt.",               icon: <Cpu className="w-5 h-5" />,          category: "Creative",     status: "active",  tier: "pro" },
  { id: "diagrams",        name: "Diagram / Flowchart",    description: "Generate Mermaid diagrams, flowcharts, and mind maps.",            icon: <Workflow className="w-5 h-5" />,     category: "Creative",     status: "active",  tier: "free" },
  { id: "data-viz",        name: "Data Visualization",     description: "Generate interactive charts and graphs from raw data.",             icon: <BarChart3 className="w-5 h-5" />,    category: "Creative",     status: "active",  tier: "free" },
  { id: "projects",        name: "Projects Platform",      description: "Build and publish full web apps, APIs, and games.",                icon: <Globe className="w-5 h-5" />,        category: "Creative",     status: "active",  tier: "pro" },

  // Specialist Engines
  { id: "physio",          name: "Physical Therapy Engine",description: "Clinical-grade PT assessment, program design, and outcome tracking.",icon: <Activity className="w-5 h-5" />, category: "Specialist",   status: "active",  tier: "pro" },
  { id: "lip-sync",        name: "Lip Sync Studio",        description: "Real-time voice lip sync, camera face overlay, video-to-audio sync, and live avatar with facial recognition.", icon: <Video className="w-5 h-5" />, category: "Specialist", status: "active", tier: "free", link: "/lip-sync" },
  { id: "avatar",          name: "Avatar Studio",          description: "Cinematic 3D avatars with live camera tracking and lip sync overlay.", icon: <Film className="w-5 h-5" />,    category: "Specialist",   status: "active",  tier: "pro",  link: "/lip-sync" },
  { id: "restorative-art", name: "Restorative Art",        description: "Therapeutic art generation for emotional processing.",             icon: <Palette className="w-5 h-5" />,      category: "Specialist",   status: "active",  tier: "pro" },
  { id: "video-analysis",  name: "Video Analysis",         description: "Analyze YouTube videos — transcripts, summaries, key moments.",    icon: <Youtube className="w-5 h-5" />,      category: "Specialist",   status: "active",  tier: "free" },

  // Agentic
  { id: "multi-agent",     name: "Multi-Agent Crew",       description: "9 specialist AI agents collaborate on complex tasks — including the Coherence Agent for cross-conversation consistency.", icon: <Bot className="w-5 h-5" />, category: "Agentic", status: "active", tier: "pro" },
  { id: "task-planner",    name: "Autonomous Task Planner",description: "BabyAGI/AutoGPT-style goal decomposition and execution.",         icon: <Workflow className="w-5 h-5" />,     category: "Agentic",      status: "active",  tier: "pro" },
  { id: "email-draft",     name: "Email Drafting",         description: "Write professional emails, follow-ups, and cold outreach.",        icon: <Mail className="w-5 h-5" />,         category: "Agentic",      status: "active",  tier: "free" },
  { id: "scheduled-tasks", name: "Scheduled Automations",  description: "Run research, reports, and tasks on a recurring schedule.",        icon: <Activity className="w-5 h-5" />,     category: "Agentic",      status: "coming",  tier: "pro" },

  // Coming Soon
  { id: "music-gen",       name: "Music Generation",       description: "Generate original music and soundscapes from text.",               icon: <Music2 className="w-5 h-5" />,       category: "Coming Soon",  status: "coming",  tier: "pro" },
  { id: "video-gen",       name: "Video Generation",       description: "Create short AI-generated videos from prompts.",                   icon: <Film className="w-5 h-5" />,         category: "Coming Soon",  status: "coming",  tier: "pro" },
  { id: "browser-control", name: "Computer Use",           description: "Control a real browser to research and complete tasks.",           icon: <Globe className="w-5 h-5" />,        category: "Coming Soon",  status: "coming",  tier: "pro" },
  { id: "maps",            name: "Maps & Directions",      description: "Interactive maps, route planning, and location intelligence.",     icon: <Map className="w-5 h-5" />,          category: "Coming Soon",  status: "coming",  tier: "pro" },
];

const STATUS_STYLES: Record<string, string> = {
  active:  "text-green-400 bg-green-400/10 border border-green-400/20",
  beta:    "text-yellow-400 bg-yellow-400/10 border border-yellow-400/20",
  pro:     "text-violet-400 bg-violet-400/10 border border-violet-400/20",
  coming:  "text-white/30 bg-white/5 border border-white/10",
};

const TIER_STYLES: Record<string, string> = {
  free:  "text-white/40",
  pro:   "text-violet-400",
  owner: "text-amber-400",
};

const CATEGORIES = Array.from(new Set(TOOLS.map(t => t.category)));

export default function ToolsPage() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [, setLocation] = useLocation();

  const filtered = TOOLS.filter(t => {
    const matchCat = selectedCategory === "All" || t.category === selectedCategory;
    const matchSearch = !search || t.name.toLowerCase().includes(search.toLowerCase()) || t.description.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const grouped: Record<string, Tool[]> = {};
  for (const tool of filtered) {
    if (!grouped[tool.category]) grouped[tool.category] = [];
    grouped[tool.category].push(tool);
  }

  return (
    <>
      <SEO {...seoData.tools} />
      <div className="flex-1 overflow-auto">
        <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">

          {/* Header */}
          <div className="space-y-1">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                <Zap className="w-4 h-4 text-primary" />
              </div>
              <h1 className="text-xl font-semibold tracking-tight">Tools & Capabilities</h1>
            </div>
            <p className="text-sm text-white/50">
              {TOOLS.filter(t => t.status === "active").length} active tools · {TOOLS.filter(t => t.status === "coming").length} coming soon · All available in chat
            </p>
          </div>

          {/* Search + filter */}
          <div className="flex flex-wrap gap-2 items-center">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search tools..."
                className="bg-black/40 border border-white/10 rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-primary/40 w-56"
              />
            </div>
            <button
              onClick={() => setSelectedCategory("All")}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono border transition-colors ${selectedCategory === "All" ? "border-primary/40 bg-primary/10 text-primary" : "border-white/10 text-white/40 hover:border-white/20"}`}
            >All</button>
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono border transition-colors ${selectedCategory === cat ? "border-primary/40 bg-primary/10 text-primary" : "border-white/10 text-white/40 hover:border-white/20"}`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Tool groups */}
          {Object.entries(grouped).map(([category, tools]) => (
            <div key={category} className="space-y-3">
              <h2 className="text-xs font-mono text-white/30 uppercase tracking-widest">{category}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                {tools.map(tool => (
                  <motion.div
                    key={tool.id}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    onClick={() => tool.link && setLocation(tool.link)}
                    className={`p-3.5 rounded-xl border transition-colors ${tool.status === "coming" ? "border-white/6 bg-white/1 opacity-60" : tool.link ? "border-white/8 bg-white/2 hover:border-primary/35 hover:bg-primary/5 cursor-pointer" : "border-white/8 bg-white/2 hover:border-white/14 hover:bg-white/4 cursor-default"}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg shrink-0 ${tool.status === "coming" ? "bg-white/5 text-white/20" : tool.link ? "bg-primary/12 text-primary" : "bg-primary/8 text-primary/80"}`}>
                        {tool.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
                          <span className="text-sm font-medium text-white/90">{tool.name}</span>
                          {tool.tier !== "free" && (
                            <Star className={`w-2.5 h-2.5 shrink-0 ${TIER_STYLES[tool.tier]}`} />
                          )}
                          {tool.link && <ChevronRight className="w-3 h-3 text-primary/50 ml-auto" />}
                        </div>
                        <p className="text-[11px] text-white/40 leading-relaxed">{tool.description}</p>
                        <div className="flex items-center gap-1.5 mt-2">
                          <span className={`px-1.5 py-0.5 rounded text-[9px] font-mono uppercase ${STATUS_STYLES[tool.status]}`}>
                            {tool.status === "active" ? "Active" : tool.status === "beta" ? "Beta" : tool.status === "coming" ? "Soon" : "Pro"}
                          </span>
                          {tool.link && <span className="px-1.5 py-0.5 rounded text-[9px] font-mono text-primary/70 bg-primary/8 border border-primary/15">OPEN →</span>}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          ))}

          {/* How to use */}
          <div className="border border-white/6 rounded-xl p-5 bg-white/1 space-y-3">
            <div className="flex items-center gap-2 text-xs font-mono text-white/40 uppercase tracking-widest">
              <ChevronRight className="w-3.5 h-3.5" /> How to Use
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-white/50">
              <div>
                <p className="text-white/70 font-medium mb-1">Just ask naturally</p>
                <p>Say "What's the weather in Tokyo?" or "Search for recent papers on CRISPR" — OMNIMENS routes to the right tool automatically.</p>
              </div>
              <div>
                <p className="text-white/70 font-medium mb-1">Tools activate instantly</p>
                <p>Weather, stocks, news, translation, and all other tools run live during your conversation with no setup needed.</p>
              </div>
              <div>
                <p className="text-white/70 font-medium mb-1">Combine tools freely</p>
                <p>Ask OMNIMENS to research a topic, translate it, generate a diagram, and export it — all in one message.</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
