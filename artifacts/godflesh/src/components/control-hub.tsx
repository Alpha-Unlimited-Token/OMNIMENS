/**
 * OMNIMENS — Proprietary AI Platform
 * Copyright © 2024–2026 Alpha Unlimited Technologies, LLC. All Rights Reserved.
 * Unauthorized reproduction, distribution, or use is strictly prohibited.
 */

import { useState, useEffect, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, Zap, Wrench, Brain, Monitor, BookOpen, FolderOpen, Download, Share2,
  Globe, Image, Cpu, Box, Gamepad2, Memory, ShieldCheck, Swords, Mic2,
  Type, LayoutDensity, Clock, Eye, Palette, Volume2, ChevronRight,
  Plus, Trash2, Star, StarOff, Search, Copy, Check, AlertTriangle,
  RefreshCw, Save, Upload, Link, Layers, Briefcase, User, PenLine,
  FlaskConical, Lightbulb, Settings, ToggleLeft, ToggleRight, Sliders,
  Languages, MessageSquare, Code, FileText, BarChart3, Rocket,
} from "lucide-react";

export type HubSettings = {
  creativity: number;
  responseLength: "brief" | "normal" | "detailed" | "exhaustive";
  formatPreference: "auto" | "markdown" | "plain" | "code-first";
  responseLanguage: string;
  focusMode: string;
  webSearchEnabled: boolean;
  imageGenEnabled: boolean;
  codeExecEnabled: boolean;
  modelGenEnabled: boolean;
  gameCreationEnabled: boolean;
  memoryEnabled: boolean;
  antiHallucinationMode: boolean;
  debateMode: boolean;
  fontSize: "sm" | "md" | "lg";
  messageDensity: "compact" | "normal" | "comfortable";
  showTimestamps: boolean;
  showToolUsage: boolean;
  accentColor: "teal" | "purple" | "blue" | "orange" | "rose";
  autoScroll: boolean;
  soundFx: boolean;
  activeWorkspace: string;
};

const DEFAULT_HUB: HubSettings = {
  creativity: 0.7,
  responseLength: "normal",
  formatPreference: "auto",
  responseLanguage: "auto",
  focusMode: "general",
  webSearchEnabled: true,
  imageGenEnabled: true,
  codeExecEnabled: true,
  modelGenEnabled: true,
  gameCreationEnabled: true,
  memoryEnabled: true,
  antiHallucinationMode: false,
  debateMode: false,
  fontSize: "md",
  messageDensity: "normal",
  showTimestamps: false,
  showToolUsage: true,
  accentColor: "teal",
  autoScroll: true,
  soundFx: false,
  activeWorkspace: "general",
};

const LS_KEY = "omnimens_hub_settings";

export function loadHubSettingsFromStorage(): HubSettings {
  try {
    const s = localStorage.getItem(LS_KEY);
    if (s) return { ...DEFAULT_HUB, ...JSON.parse(s) };
  } catch {}
  return { ...DEFAULT_HUB };
}

export function saveHubSettingsToStorage(s: HubSettings) {
  localStorage.setItem(LS_KEY, JSON.stringify(s));
}

const TABS = [
  { id: "ai",        label: "AI CORE",    icon: <Zap className="w-3.5 h-3.5" /> },
  { id: "tools",     label: "TOOLS",      icon: <Wrench className="w-3.5 h-3.5" /> },
  { id: "memory",    label: "MEMORY",     icon: <Brain className="w-3.5 h-3.5" /> },
  { id: "interface", label: "INTERFACE",  icon: <Monitor className="w-3.5 h-3.5" /> },
  { id: "library",   label: "LIBRARY",    icon: <BookOpen className="w-3.5 h-3.5" /> },
  { id: "workspace", label: "WORKSPACE",  icon: <Layers className="w-3.5 h-3.5" /> },
  { id: "export",    label: "EXPORT",     icon: <Download className="w-3.5 h-3.5" /> },
];

const LANGUAGES = [
  { code: "auto", label: "Auto-detect" },
  { code: "en", label: "English" },
  { code: "es", label: "Spanish" },
  { code: "fr", label: "French" },
  { code: "de", label: "German" },
  { code: "pt", label: "Portuguese" },
  { code: "it", label: "Italian" },
  { code: "zh", label: "Chinese" },
  { code: "ja", label: "Japanese" },
  { code: "ko", label: "Korean" },
  { code: "ar", label: "Arabic" },
  { code: "ru", label: "Russian" },
  { code: "hi", label: "Hindi" },
  { code: "nl", label: "Dutch" },
  { code: "pl", label: "Polish" },
  { code: "sv", label: "Swedish" },
  { code: "tr", label: "Turkish" },
  { code: "vi", label: "Vietnamese" },
  { code: "uk", label: "Ukrainian" },
  { code: "id", label: "Indonesian" },
];

const ACCENT_COLORS = [
  { id: "teal",   label: "Teal",   bg: "bg-teal-400", border: "border-teal-400" },
  { id: "purple", label: "Purple", bg: "bg-purple-500", border: "border-purple-500" },
  { id: "blue",   label: "Blue",   bg: "bg-blue-500", border: "border-blue-500" },
  { id: "orange", label: "Orange", bg: "bg-orange-400", border: "border-orange-400" },
  { id: "rose",   label: "Rose",   bg: "bg-rose-500", border: "border-rose-500" },
];

const WORKSPACES = [
  { id: "general",  label: "General",  icon: "⚡", desc: "Default all-purpose workspace" },
  { id: "work",     label: "Work",     icon: "💼", desc: "Professional projects & tasks" },
  { id: "personal", label: "Personal", icon: "🏠", desc: "Personal projects & ideas" },
  { id: "creative", label: "Creative", icon: "🎨", desc: "Art, writing & creative work" },
  { id: "research", label: "Research", icon: "🔬", desc: "Deep research & analysis" },
  { id: "code",     label: "Code Lab", icon: "💻", desc: "Software development & coding" },
  { id: "business", label: "Business", icon: "📊", desc: "Business strategy & planning" },
];

function Toggle({ on, onToggle, color = "primary" }: { on: boolean; onToggle: () => void; color?: string }) {
  return (
    <button onClick={onToggle} className="shrink-0">
      {on
        ? <ToggleRight className={`w-7 h-7 ${color === "primary" ? "text-primary" : color === "violet" ? "text-violet-400" : color === "orange" ? "text-orange-400" : "text-primary"}`} />
        : <ToggleLeft className="w-7 h-7 text-white/30" />}
    </button>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="font-mono text-[9px] tracking-[0.2em] text-white/50 uppercase mb-2">{children}</p>;
}

function ToolRow({ icon, label, desc, on, onToggle, color = "primary" }: {
  icon: React.ReactNode; label: string; desc: string; on: boolean; onToggle: () => void; color?: string;
}) {
  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-white/5 last:border-0">
      <div className={`shrink-0 ${on ? "text-primary" : "text-white/30"}`}>{icon}</div>
      <div className="flex-1 min-w-0">
        <p className={`text-[11px] font-mono font-bold ${on ? "text-white" : "text-white/40"}`}>{label}</p>
        <p className="text-[9px] font-mono text-white/35 truncate">{desc}</p>
      </div>
      <Toggle on={on} onToggle={onToggle} color={color} />
    </div>
  );
}

// ── Prompt Library ─────────────────────────────────────────────────────────────

type SavedPrompt = {
  id: number;
  title: string;
  content: string;
  category: string;
  usageCount: number;
  isFavorite: boolean;
};

const BUILTIN_TEMPLATES = [
  { category: "Writing", title: "Blog Post", content: "Write a comprehensive, SEO-optimized blog post about [topic]. Include an engaging introduction, 5-7 main sections with subheadings, key takeaways, and a strong conclusion. Target audience: [audience]." },
  { category: "Writing", title: "Email Draft", content: "Write a professional email to [recipient] about [subject]. Tone: [formal/casual]. Key points to include: [points]. End with a clear call to action." },
  { category: "Writing", title: "Press Release", content: "Write a professional press release announcing [news]. Include: headline, dateline, strong opening paragraph (who, what, when, where, why), supporting details, boilerplate, and contact info." },
  { category: "Writing", title: "Cover Letter", content: "Write a compelling cover letter for a [position] role at [company]. My background: [background]. Key skills to highlight: [skills]. Match the company's culture and mission." },
  { category: "Writing", title: "Executive Summary", content: "Write a concise executive summary for [document/project]. Audience: C-suite executives. Include: key findings, recommendations, financial impact, and timeline. Maximum 1 page." },
  { category: "Coding", title: "Code Review", content: "Please review the following code for: bugs, security vulnerabilities, performance issues, code quality, and best practices. Provide specific suggestions for improvement:\n\n[paste code here]" },
  { category: "Coding", title: "API Documentation", content: "Write comprehensive API documentation for this endpoint/function. Include: overview, parameters (with types, required/optional, examples), return values, error codes, and usage examples:\n\n[paste code/spec here]" },
  { category: "Coding", title: "Debug This", content: "I'm getting this error: [error message]. Here's my code:\n\n[paste code]\n\nExplain what's causing the error and provide the fix with explanation." },
  { category: "Coding", title: "Refactor Code", content: "Refactor this code to improve readability, performance, and maintainability. Keep functionality identical. Explain each major change:\n\n[paste code]" },
  { category: "Coding", title: "Unit Tests", content: "Write comprehensive unit tests for the following function/class. Cover: happy path, edge cases, error conditions, and boundary values. Use [testing framework]:\n\n[paste code]" },
  { category: "Research", title: "Research Brief", content: "Create a comprehensive research brief on [topic]. Include: background/context, key stakeholders, current state of the field, major findings from recent research, controversies/debates, and gaps in knowledge. Cite sources." },
  { category: "Research", title: "Competitive Analysis", content: "Conduct a competitive analysis of [company/product] vs [competitors]. Include: market positioning, feature comparison, pricing strategy, strengths/weaknesses, target demographics, and strategic recommendations." },
  { category: "Research", title: "Literature Review", content: "Write a literature review on [topic] covering the last 5 years. Synthesize key themes, methodologies, findings, and consensus views. Identify gaps and future research directions." },
  { category: "Research", title: "SWOT Analysis", content: "Perform a detailed SWOT analysis for [company/project/idea]. For each quadrant, provide 5-7 specific, actionable items with supporting reasoning. Include strategic implications." },
  { category: "Analysis", title: "Data Analysis", content: "Analyze this data and provide insights: [paste data]. Include: summary statistics, key trends, anomalies, patterns, actionable recommendations, and suggested visualizations." },
  { category: "Analysis", title: "Root Cause Analysis", content: "Perform a root cause analysis for this problem: [describe problem]. Use the 5 Whys method and fishbone diagram approach. Identify primary, secondary, and contributing causes. Recommend preventive actions." },
  { category: "Analysis", title: "Risk Assessment", content: "Conduct a risk assessment for [project/decision]. For each risk: identify likelihood (1-5), impact (1-5), risk score, mitigation strategy, and contingency plan. Prioritize by risk score." },
  { category: "Business", title: "Business Plan", content: "Create a comprehensive business plan for [business idea]. Include: executive summary, problem/solution, market opportunity, business model, competitive advantage, go-to-market strategy, financial projections, and team overview." },
  { category: "Business", title: "Product Roadmap", content: "Create a product roadmap for [product] for the next 12 months. Include: quarterly goals, feature priorities (with rationale), success metrics, dependencies, and resource requirements. Format as a table." },
  { category: "Business", title: "Meeting Agenda", content: "Create a structured meeting agenda for a [type] meeting with [attendees] lasting [duration]. Include: goals, time blocks for each item, discussion questions, decision points, and action item section." },
  { category: "Business", title: "User Story", content: "Write user stories for [feature/product]. Format: As a [user type], I want [goal] so that [benefit]. Include acceptance criteria, edge cases, and technical notes for each story." },
  { category: "Creative", title: "Story Starter", content: "Write the opening chapter (1500 words) of a [genre] story set in [setting]. Protagonist: [character description]. Establish the world, voice, and central conflict. End on a hook." },
  { category: "Creative", title: "Character Profile", content: "Create a deep character profile for [name], a [age]-year-old [description]. Include: backstory, motivations, fears, relationships, speech patterns, strengths/flaws, and character arc potential." },
  { category: "Creative", title: "World Building", content: "Build a detailed fictional world for [genre/setting]. Include: geography, history, political systems, cultures, magic/technology systems, economy, and social structures. Make it internally consistent." },
  { category: "Creative", title: "Brainstorm Ideas", content: "Generate 20 creative ideas for [topic/problem]. Think across different domains, challenge assumptions, combine unexpected elements. Include: conventional ideas, unconventional ideas, and wild ideas. Brief rationale for each." },
  { category: "Education", title: "Lesson Plan", content: "Create a detailed lesson plan for teaching [topic] to [audience/grade level]. Include: learning objectives, materials needed, introduction (5 min), main activity (20 min), practice (10 min), assessment, and differentiation strategies." },
  { category: "Education", title: "Study Guide", content: "Create a comprehensive study guide for [subject/exam]. Include: key concepts with definitions, important formulas/rules, common exam patterns, memory tricks, practice questions with answers, and recommended resources." },
  { category: "Education", title: "Explain Simply", content: "Explain [complex topic] as if I'm [age/background]. Use analogies, real-world examples, and avoid jargon. Break it into digestible steps. End with the 3 key things to remember." },
  { category: "Personal", title: "Goal Planning", content: "Help me create a structured plan to achieve: [goal]. Timeline: [timeframe]. Current situation: [context]. Include: milestone breakdown, potential obstacles and solutions, daily/weekly habits, and success metrics." },
  { category: "Personal", title: "Decision Matrix", content: "Help me make this decision: [decision]. Options: [list options]. Key factors I care about: [factors]. Create a weighted decision matrix, score each option, and provide a recommendation with rationale." },
  { category: "Personal", title: "Resume Bullet Points", content: "Rewrite these job experience bullet points to be more impactful. Use strong action verbs, quantify achievements where possible, and focus on impact:\n\n[paste bullet points]" },
  { category: "Personal", title: "Travel Itinerary", content: "Create a detailed [duration] itinerary for [destination]. Travel style: [style]. Budget: [budget]. Include: daily schedule with times, top attractions, restaurant recommendations, local tips, and transportation advice." },
  { category: "Personal", title: "Meal Plan", content: "Create a [duration] meal plan for [dietary preference/restriction]. Include: breakfast, lunch, dinner, snacks, shopping list organized by category, prep tips, and rough calorie/macro estimates." },
  { category: "SEO", title: "SEO Content Brief", content: "Create an SEO content brief for the keyword: [keyword]. Include: search intent analysis, target audience, recommended word count, outline with H2/H3 structure, related keywords to include, meta title and description, and internal linking opportunities." },
  { category: "SEO", title: "Product Description", content: "Write a compelling product description for [product]. Include: attention-grabbing headline, key features (as benefits), technical specs, social proof hooks, and a call to action. Optimize for [platform]." },
  { category: "Medical", title: "PT Assessment Summary", content: "Summarize this physical therapy assessment for [body region/condition]. Patient profile: [age, activity level, goals]. Include: clinical reasoning, functional limitations, treatment priorities, and 4-week plan outline." },
];

function LibraryTab({ onUsePrompt }: { onUsePrompt: (content: string) => void }) {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [showNew, setShowNew] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newCategory, setNewCategory] = useState("general");
  const [copied, setCopied] = useState<number | null>(null);
  const [activeTab2, setActiveTab2] = useState<"saved" | "templates">("templates");

  const { data: saved = [] } = useQuery<SavedPrompt[]>({
    queryKey: ["saved-prompts"],
    queryFn: () => fetch("/api/omnimens/saved-prompts", { credentials: "include" }).then(r => r.json()),
  });

  const createMut = useMutation({
    mutationFn: (p: { title: string; content: string; category: string }) =>
      fetch("/api/omnimens/saved-prompts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(p),
      }).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["saved-prompts"] }); setShowNew(false); setNewTitle(""); setNewContent(""); },
  });

  const deleteMut = useMutation({
    mutationFn: (id: number) =>
      fetch(`/api/omnimens/saved-prompts/${id}`, { method: "DELETE", credentials: "include" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["saved-prompts"] }),
  });

  const favMut = useMutation({
    mutationFn: ({ id, fav }: { id: number; fav: boolean }) =>
      fetch(`/api/omnimens/saved-prompts/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ isFavorite: fav }),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["saved-prompts"] }),
  });

  const categories = ["All", ...Array.from(new Set(BUILTIN_TEMPLATES.map(t => t.category)))];

  const filteredTemplates = BUILTIN_TEMPLATES.filter(t =>
    (category === "All" || t.category === category) &&
    (t.title.toLowerCase().includes(search.toLowerCase()) || t.content.toLowerCase().includes(search.toLowerCase()))
  );

  const filteredSaved = saved.filter(s =>
    s.title.toLowerCase().includes(search.toLowerCase()) || s.content.toLowerCase().includes(search.toLowerCase())
  );

  const handleCopy = (content: string, id: number) => {
    navigator.clipboard.writeText(content);
    setCopied(id);
    setTimeout(() => setCopied(null), 1500);
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-1 mb-3">
        {["templates", "saved"].map(t => (
          <button key={t} onClick={() => setActiveTab2(t as any)}
            className={`flex-1 py-1.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider transition-all ${activeTab2 === t ? "bg-primary/20 text-primary border border-primary/30" : "text-white/50 border border-white/10 hover:text-white/70"}`}>
            {t === "templates" ? `Templates (${BUILTIN_TEMPLATES.length})` : `Saved (${saved.length})`}
          </button>
        ))}
      </div>

      <div className="relative">
        <Search className="w-3 h-3 absolute left-2.5 top-2.5 text-white/30" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search prompts..."
          className="w-full bg-white/5 border border-white/10 rounded-lg pl-7 pr-3 py-2 text-xs font-mono text-white placeholder:text-white/25 outline-none focus:border-primary/30" />
      </div>

      {activeTab2 === "templates" && (
        <>
          <div className="flex flex-wrap gap-1">
            {categories.map(c => (
              <button key={c} onClick={() => setCategory(c)}
                className={`px-2 py-0.5 rounded text-[9px] font-mono uppercase tracking-wider transition-all ${category === c ? "bg-primary/20 text-primary border border-primary/30" : "text-white/40 border border-white/10 hover:text-white/60"}`}>
                {c}
              </button>
            ))}
          </div>
          <div className="space-y-1.5 max-h-80 overflow-y-auto omnimens-scrollbar pr-1">
            {filteredTemplates.map((t, i) => (
              <div key={i} className="rounded-lg border border-white/8 bg-white/3 p-2.5 hover:border-primary/20 transition-all group">
                <div className="flex items-start gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-mono font-bold text-white/90 truncate">{t.title}</p>
                    <p className="text-[9px] font-mono text-primary/60">{t.category}</p>
                    <p className="text-[9px] font-mono text-white/40 mt-1 line-clamp-2">{t.content.slice(0, 120)}...</p>
                  </div>
                  <div className="flex flex-col gap-1 shrink-0">
                    <button onClick={() => onUsePrompt(t.content)}
                      className="px-2 py-1 rounded text-[9px] font-mono bg-primary/20 text-primary border border-primary/30 hover:bg-primary/30 transition-all">
                      USE
                    </button>
                    <button onClick={() => handleCopy(t.content, i)}
                      className="px-2 py-1 rounded text-[9px] font-mono bg-white/5 text-white/60 border border-white/10 hover:text-white transition-all">
                      {copied === i ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {activeTab2 === "saved" && (
        <>
          <button onClick={() => setShowNew(s => !s)}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg border border-dashed border-primary/30 text-primary/70 hover:text-primary hover:border-primary/50 transition-all text-[10px] font-mono">
            <Plus className="w-3.5 h-3.5" /> SAVE NEW PROMPT
          </button>
          <AnimatePresence>
            {showNew && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                className="border border-primary/20 rounded-lg p-3 bg-primary/5 space-y-2 overflow-hidden">
                <input value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="Prompt title..."
                  className="w-full bg-white/5 border border-white/10 rounded px-3 py-1.5 text-xs font-mono text-white placeholder:text-white/25 outline-none focus:border-primary/30" />
                <textarea value={newContent} onChange={e => setNewContent(e.target.value)} placeholder="Prompt content..." rows={4}
                  className="w-full bg-white/5 border border-white/10 rounded px-3 py-1.5 text-xs font-mono text-white placeholder:text-white/25 outline-none focus:border-primary/30 resize-none" />
                <select value={newCategory} onChange={e => setNewCategory(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded px-3 py-1.5 text-xs font-mono text-white outline-none">
                  {["general","coding","writing","research","analysis","creative","business","education","personal"].map(c => (
                    <option key={c} value={c} className="bg-gray-900">{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                  ))}
                </select>
                <button disabled={!newTitle || !newContent} onClick={() => createMut.mutate({ title: newTitle, content: newContent, category: newCategory })}
                  className="w-full py-1.5 rounded text-[10px] font-mono bg-primary/20 text-primary border border-primary/30 hover:bg-primary/30 disabled:opacity-40 transition-all">
                  {createMut.isPending ? "SAVING..." : "SAVE PROMPT"}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
          <div className="space-y-1.5 max-h-72 overflow-y-auto omnimens-scrollbar pr-1">
            {filteredSaved.length === 0 && (
              <p className="text-center text-[10px] font-mono text-white/30 py-8">No saved prompts yet. Create one above or use a template.</p>
            )}
            {filteredSaved.map(p => (
              <div key={p.id} className="rounded-lg border border-white/8 bg-white/3 p-2.5 hover:border-primary/20 transition-all">
                <div className="flex items-start gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-mono font-bold text-white/90 truncate">{p.title}</p>
                    <p className="text-[9px] font-mono text-white/40 mt-1 line-clamp-2">{p.content.slice(0, 100)}...</p>
                    <p className="text-[9px] font-mono text-white/25 mt-1">Used {p.usageCount}x</p>
                  </div>
                  <div className="flex flex-col gap-1 shrink-0">
                    <button onClick={() => onUsePrompt(p.content)}
                      className="px-2 py-1 rounded text-[9px] font-mono bg-primary/20 text-primary border border-primary/30 hover:bg-primary/30 transition-all">USE</button>
                    <button onClick={() => favMut.mutate({ id: p.id, fav: !p.isFavorite })}
                      className="px-2 py-1 rounded text-[9px] font-mono bg-white/5 text-white/60 border border-white/10 hover:text-yellow-400 transition-all">
                      {p.isFavorite ? <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" /> : <StarOff className="w-3 h-3" />}
                    </button>
                    <button onClick={() => deleteMut.mutate(p.id)}
                      className="px-2 py-1 rounded text-[9px] font-mono bg-white/5 text-white/60 border border-white/10 hover:text-red-400 transition-all">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ── Memory Tab ─────────────────────────────────────────────────────────────────

function MemoryTab() {
  const qc = useQueryClient();
  const [aboutUser, setAboutUser] = useState("");
  const [responseStyle, setResponseStyle] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/omnimens/custom-instructions", { credentials: "include" })
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d) { setAboutUser(d.aboutUser || ""); setResponseStyle(d.responseStyle || ""); } })
      .catch(() => {});
  }, []);

  const { data: memories = [] } = useQuery<any[]>({
    queryKey: ["memories"],
    queryFn: () => fetch("/api/omnimens/memories", { credentials: "include" }).then(r => r.json()),
  });

  const saveInstructions = async () => {
    const existing = await fetch("/api/omnimens/custom-instructions", { credentials: "include" }).then(r => r.json());
    await fetch("/api/omnimens/custom-instructions", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ aboutUser, responseStyle, persona: existing.persona || "GENERAL" }),
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const deleteMemory = async (id: number) => {
    await fetch(`/api/omnimens/memories/${id}`, { method: "DELETE", credentials: "include" });
    qc.invalidateQueries({ queryKey: ["memories"] });
  };

  const clearAllMemories = async () => {
    if (!confirm("Clear all memories? This cannot be undone.")) return;
    await fetch("/api/omnimens/memories", { method: "DELETE", credentials: "include" });
    qc.invalidateQueries({ queryKey: ["memories"] });
  };

  const catColor: Record<string, string> = {
    preference: "text-blue-400", fact: "text-green-400", goal: "text-yellow-400",
    context: "text-purple-400", instruction: "text-orange-400",
  };

  return (
    <div className="space-y-4">
      <div>
        <SectionLabel>Custom Instructions</SectionLabel>
        <div className="space-y-2">
          <div>
            <p className="text-[10px] font-mono text-white/60 mb-1">About you — what OMNIMENS should know</p>
            <textarea value={aboutUser} onChange={e => setAboutUser(e.target.value)} rows={3}
              placeholder="e.g. I'm a senior software engineer working in fintech. I prefer detailed technical answers and always want working code examples..."
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs font-mono text-white placeholder:text-white/20 outline-none focus:border-primary/30 resize-none" />
          </div>
          <div>
            <p className="text-[10px] font-mono text-white/60 mb-1">How OMNIMENS should respond</p>
            <textarea value={responseStyle} onChange={e => setResponseStyle(e.target.value)} rows={3}
              placeholder="e.g. Be direct and concise. Don't add unnecessary disclaimers. Always provide code examples. Use bullet points for lists..."
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs font-mono text-white placeholder:text-white/20 outline-none focus:border-primary/30 resize-none" />
          </div>
          <button onClick={saveInstructions}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-[10px] font-mono font-bold bg-primary/15 text-primary border border-primary/30 hover:bg-primary/25 transition-all">
            {saved ? <><Check className="w-3.5 h-3.5" /> SAVED</> : <><Save className="w-3.5 h-3.5" /> SAVE INSTRUCTIONS</>}
          </button>
        </div>
      </div>

      <div className="border-t border-white/8 pt-4">
        <div className="flex items-center justify-between mb-2">
          <SectionLabel>Long-term Memory ({memories.length})</SectionLabel>
          {memories.length > 0 && (
            <button onClick={clearAllMemories} className="text-[9px] font-mono text-red-400/60 hover:text-red-400 transition-colors">CLEAR ALL</button>
          )}
        </div>
        {memories.length === 0 ? (
          <p className="text-[10px] font-mono text-white/25 py-4 text-center">No memories yet. OMNIMENS learns about you through conversation.</p>
        ) : (
          <div className="space-y-1.5 max-h-56 overflow-y-auto omnimens-scrollbar pr-1">
            {memories.map((m: any) => (
              <div key={m.id} className="flex items-start gap-2 p-2 rounded-lg bg-white/3 border border-white/8 group">
                <div className="flex-1 min-w-0">
                  <p className={`text-[9px] font-mono font-bold uppercase ${catColor[m.category] || "text-white/50"}`}>{m.category}</p>
                  <p className="text-[10px] font-mono text-white/80 mt-0.5">{m.content}</p>
                </div>
                <button onClick={() => deleteMemory(m.id)}
                  className="opacity-0 group-hover:opacity-100 text-white/30 hover:text-red-400 transition-all shrink-0">
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Export Tab ─────────────────────────────────────────────────────────────────

function ExportTab({ currentConversationId }: { currentConversationId?: number }) {
  const [exporting, setExporting] = useState<string | null>(null);
  const [shareLink, setShareLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const exportConversation = async (format: "json" | "markdown" | "txt") => {
    if (!currentConversationId) { alert("No active conversation to export."); return; }
    setExporting(format);
    try {
      const res = await fetch(`/api/omnimens/conversations/${currentConversationId}/export?format=${format}`, { credentials: "include" });
      const blob = await res.blob();
      const ext = format === "json" ? "json" : format === "markdown" ? "md" : "txt";
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = `omnimens-conversation-${currentConversationId}.${ext}`;
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) { alert("Export failed."); }
    setExporting(null);
  };

  const generateShareLink = async () => {
    if (!currentConversationId) { alert("No active conversation to share."); return; }
    try {
      const res = await fetch(`/api/omnimens/conversations/${currentConversationId}/share`, {
        method: "POST", credentials: "include",
      });
      const data = await res.json();
      if (data.shareUrl) setShareLink(data.shareUrl);
    } catch { alert("Share failed."); }
  };

  const copyLink = () => {
    if (shareLink) { navigator.clipboard.writeText(shareLink); setCopied(true); setTimeout(() => setCopied(false), 2000); }
  };

  return (
    <div className="space-y-4">
      <div>
        <SectionLabel>Export Conversation</SectionLabel>
        <p className="text-[10px] font-mono text-white/40 mb-3">
          {currentConversationId ? `Conversation #${currentConversationId}` : "No active conversation"}
        </p>
        <div className="grid grid-cols-3 gap-2">
          {([
            { format: "json", label: "JSON", icon: <Code className="w-4 h-4" />, desc: "Structured data" },
            { format: "markdown", label: "Markdown", icon: <FileText className="w-4 h-4" />, desc: "Formatted text" },
            { format: "txt", label: "Plain Text", icon: <Type className="w-4 h-4" />, desc: "Simple text" },
          ] as const).map(({ format, label, icon, desc }) => (
            <button key={format} onClick={() => exportConversation(format)} disabled={!currentConversationId || exporting !== null}
              className="flex flex-col items-center gap-1.5 py-3 px-2 rounded-lg border border-white/10 bg-white/3 hover:border-primary/30 hover:bg-primary/5 disabled:opacity-40 transition-all">
              <span className={exporting === format ? "text-primary animate-pulse" : "text-white/60"}>{icon}</span>
              <p className="text-[10px] font-mono font-bold text-white/80">{label}</p>
              <p className="text-[8px] font-mono text-white/35">{desc}</p>
            </button>
          ))}
        </div>
      </div>

      <div className="border-t border-white/8 pt-4">
        <SectionLabel>Share Conversation</SectionLabel>
        <p className="text-[10px] font-mono text-white/40 mb-3">Generate a read-only link anyone can view</p>
        {shareLink ? (
          <div className="flex gap-2">
            <input readOnly value={shareLink}
              className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs font-mono text-white/70 outline-none min-w-0" />
            <button onClick={copyLink}
              className="shrink-0 px-3 py-2 rounded-lg border border-primary/30 bg-primary/10 text-primary hover:bg-primary/20 transition-all">
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        ) : (
          <button onClick={generateShareLink} disabled={!currentConversationId}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-white/15 text-white/70 hover:text-white hover:border-white/30 disabled:opacity-40 transition-all text-[10px] font-mono">
            <Link className="w-3.5 h-3.5" /> GENERATE SHARE LINK
          </button>
        )}
      </div>

      <div className="border-t border-white/8 pt-4">
        <SectionLabel>Keyboard Shortcuts</SectionLabel>
        <div className="space-y-1.5">
          {[
            ["Enter", "Send message"],
            ["Shift + Enter", "New line"],
            ["↑ Arrow", "Edit last message"],
            ["Ctrl + /", "Open Control Hub"],
            ["Ctrl + K", "New conversation"],
            ["Ctrl + Shift + R", "Toggle deep research"],
            ["Ctrl + Shift + V", "Toggle voice"],
          ].map(([key, desc]) => (
            <div key={key} className="flex items-center justify-between py-1">
              <span className="text-[10px] font-mono text-white/60">{desc}</span>
              <kbd className="px-1.5 py-0.5 rounded bg-white/8 border border-white/15 text-[9px] font-mono text-white/70">{key}</kbd>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Workspace Tab ──────────────────────────────────────────────────────────────

function WorkspaceTab({ settings, onUpdate }: { settings: HubSettings; onUpdate: (s: HubSettings) => void }) {
  const workspaceConfigs = settings.workspaces || {};

  const switchWorkspace = (id: string) => {
    const saved = workspaceConfigs[id];
    if (saved) {
      onUpdate({ ...settings, ...saved, activeWorkspace: id });
    } else {
      onUpdate({ ...settings, activeWorkspace: id });
    }
  };

  const saveCurrentAsWorkspace = (id: string) => {
    const { activeWorkspace, workspaces, ...rest } = settings;
    onUpdate({
      ...settings,
      workspaces: { ...workspaces, [id]: rest },
    });
  };

  return (
    <div className="space-y-3">
      <div>
        <SectionLabel>Named Workspaces</SectionLabel>
        <p className="text-[10px] font-mono text-white/35 mb-3">Each workspace saves all AI settings, tool preferences, and interface options.</p>
        <div className="space-y-1.5">
          {WORKSPACES.map(ws => (
            <div key={ws.id}
              className={`flex items-center gap-3 p-3 rounded-lg border transition-all cursor-pointer ${settings.activeWorkspace === ws.id ? "border-primary/40 bg-primary/8" : "border-white/8 bg-white/3 hover:border-white/15"}`}
              onClick={() => switchWorkspace(ws.id)}>
              <span className="text-lg shrink-0">{ws.icon}</span>
              <div className="flex-1 min-w-0">
                <p className={`text-[11px] font-mono font-bold ${settings.activeWorkspace === ws.id ? "text-primary" : "text-white/80"}`}>{ws.label}</p>
                <p className="text-[9px] font-mono text-white/35 truncate">{ws.desc}</p>
                {workspaceConfigs[ws.id] && <p className="text-[9px] font-mono text-primary/50 mt-0.5">✓ Saved</p>}
              </div>
              {settings.activeWorkspace === ws.id && (
                <button onClick={e => { e.stopPropagation(); saveCurrentAsWorkspace(ws.id); }}
                  className="shrink-0 px-2 py-1 rounded text-[9px] font-mono bg-primary/20 text-primary border border-primary/30 hover:bg-primary/30 transition-all">
                  SAVE
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
      <p className="text-[9px] font-mono text-white/25">Click a workspace to switch. Click SAVE to save current settings to active workspace.</p>
    </div>
  );
}

// ── Main ControlHub ────────────────────────────────────────────────────────────

export function ControlHub({
  open,
  onClose,
  onUsePrompt,
  currentConversationId,
  settings,
  onChange,
}: {
  open: boolean;
  onClose: () => void;
  onUsePrompt: (content: string) => void;
  currentConversationId?: number;
  settings: HubSettings;
  onChange: (s: HubSettings) => void;
}) {
  const [tab, setTab] = useState("ai");
  const [pendingSave, setPendingSave] = useState(false);

  const upd = useCallback(<K extends keyof HubSettings>(key: K, val: HubSettings[K]) => {
    const next = { ...settings, [key]: val };
    onChange(next);
    saveHubSettingsToStorage(next);
  }, [settings, onChange]);

  // Debounced save to API
  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => {
      fetch("/api/omnimens/hub-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(settings),
      }).catch(() => {});
    }, 800);
    return () => clearTimeout(t);
  }, [settings, open]);

  // Keyboard shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "/") { e.preventDefault(); open ? onClose() : null; }
      if (e.key === "Escape" && open) onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  const creativityLabel = settings.creativity < 0.35 ? "Precise" : settings.creativity < 0.65 ? "Balanced" : "Creative";

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.8)", backdropFilter: "blur(6px)" }}
          onClick={e => { if (e.target === e.currentTarget) onClose(); }}
        >
          <motion.div
            initial={{ scale: 0.94, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.94, y: 20, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="w-full max-w-2xl max-h-[88vh] bg-[#0a0a0f] border border-white/12 rounded-2xl overflow-hidden flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="shrink-0 flex items-center justify-between px-5 py-4 border-b border-white/8 bg-black/40">
              <div className="flex items-center gap-2.5">
                <Settings className="w-4 h-4 text-primary" />
                <div>
                  <h2 className="font-mono text-sm font-bold text-white tracking-wider">OMNIMENS CONTROL HUB</h2>
                  <p className="font-mono text-[9px] text-white/35 tracking-widest">CONFIGURE · CUSTOMIZE · COMMAND</p>
                </div>
              </div>
              <button onClick={onClose} className="text-white/40 hover:text-white transition-colors p-1 rounded">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Tab bar */}
            <div className="shrink-0 flex gap-0.5 px-3 py-2 border-b border-white/8 bg-black/20 overflow-x-auto">
              {TABS.map(t => (
                <button key={t.id} onClick={() => setTab(t.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[9px] font-mono font-bold tracking-wider uppercase whitespace-nowrap transition-all ${tab === t.id ? "bg-primary/20 text-primary border border-primary/30" : "text-white/45 hover:text-white/70 border border-transparent hover:bg-white/5"}`}>
                  {t.icon}
                  {t.label}
                </button>
              ))}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto omnimens-scrollbar p-5">
              <AnimatePresence mode="wait">
                <motion.div key={tab} initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -8 }} transition={{ duration: 0.15 }}>

                  {/* AI CORE */}
                  {tab === "ai" && (
                    <div className="space-y-5">
                      <div>
                        <SectionLabel>Creativity / Temperature</SectionLabel>
                        <div className="flex items-center gap-3">
                          <span className="text-[9px] font-mono text-white/40 w-12 shrink-0">Precise</span>
                          <input type="range" min={0} max={1} step={0.05} value={settings.creativity}
                            onChange={e => upd("creativity", parseFloat(e.target.value))}
                            className="flex-1 accent-teal-400 cursor-pointer" />
                          <span className="text-[9px] font-mono text-white/40 w-14 shrink-0 text-right">Creative</span>
                        </div>
                        <p className="text-center text-[10px] font-mono text-primary mt-1">{creativityLabel} · {(settings.creativity * 100).toFixed(0)}%</p>
                      </div>

                      <div>
                        <SectionLabel>Response Length</SectionLabel>
                        <div className="grid grid-cols-4 gap-1.5">
                          {(["brief", "normal", "detailed", "exhaustive"] as const).map(len => (
                            <button key={len} onClick={() => upd("responseLength", len)}
                              className={`py-2 rounded-lg text-[9px] font-mono uppercase font-bold transition-all border ${settings.responseLength === len ? "bg-primary/20 text-primary border-primary/40" : "text-white/40 border-white/10 hover:text-white/60"}`}>
                              {len === "exhaustive" ? "MAX" : len.charAt(0).toUpperCase() + len.slice(1)}
                            </button>
                          ))}
                        </div>
                        <div className="mt-1.5 grid grid-cols-4 gap-1.5">
                          {["1–2 paragraphs", "3–5 paragraphs", "Full coverage", "Comprehensive"].map((d, i) => (
                            <p key={i} className="text-[8px] font-mono text-white/25 text-center">{d}</p>
                          ))}
                        </div>
                      </div>

                      <div>
                        <SectionLabel>Format Preference</SectionLabel>
                        <div className="grid grid-cols-2 gap-2">
                          {([
                            { id: "auto", label: "Auto", desc: "OMNIMENS decides" },
                            { id: "markdown", label: "Markdown", desc: "Headers, bullets, code" },
                            { id: "plain", label: "Plain Text", desc: "No formatting" },
                            { id: "code-first", label: "Code-First", desc: "Always include code" },
                          ] as const).map(f => (
                            <button key={f.id} onClick={() => upd("formatPreference", f.id)}
                              className={`flex flex-col items-start px-3 py-2.5 rounded-lg border transition-all ${settings.formatPreference === f.id ? "border-primary/40 bg-primary/8 text-primary" : "border-white/8 hover:border-white/15 text-white/60"}`}>
                              <p className="text-[10px] font-mono font-bold">{f.label}</p>
                              <p className="text-[8px] font-mono text-white/30 mt-0.5">{f.desc}</p>
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <SectionLabel>Response Language</SectionLabel>
                        <select value={settings.responseLanguage} onChange={e => upd("responseLanguage", e.target.value)}
                          className="w-full bg-white/5 border border-white/12 rounded-lg px-3 py-2.5 text-xs font-mono text-white outline-none focus:border-primary/30">
                          {LANGUAGES.map(l => (
                            <option key={l.code} value={l.code} className="bg-gray-900">{l.label}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <SectionLabel>Focus Mode</SectionLabel>
                        <div className="grid grid-cols-3 gap-2">
                          {([
                            { id: "general", label: "General", icon: "⚡" },
                            { id: "coding", label: "Coding", icon: "💻" },
                            { id: "research", label: "Research", icon: "🔬" },
                            { id: "writing", label: "Writing", icon: "✍️" },
                            { id: "analysis", label: "Analysis", icon: "📊" },
                            { id: "creative", label: "Creative", icon: "🎨" },
                          ]).map(m => (
                            <button key={m.id} onClick={() => upd("focusMode", m.id)}
                              className={`flex items-center gap-1.5 px-2.5 py-2 rounded-lg border transition-all ${settings.focusMode === m.id ? "border-primary/40 bg-primary/8 text-primary" : "border-white/8 hover:border-white/15 text-white/60"}`}>
                              <span className="text-sm">{m.icon}</span>
                              <span className="text-[9px] font-mono">{m.label}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TOOLS */}
                  {tab === "tools" && (
                    <div className="space-y-1">
                      <ToolRow icon={<Globe className="w-4 h-4" />} label="Web Search" desc="Real-time internet search for current info" on={settings.webSearchEnabled} onToggle={() => upd("webSearchEnabled", !settings.webSearchEnabled)} />
                      <ToolRow icon={<Image className="w-4 h-4" />} label="Image Generation" desc="Create images from text descriptions" on={settings.imageGenEnabled} onToggle={() => upd("imageGenEnabled", !settings.imageGenEnabled)} />
                      <ToolRow icon={<Cpu className="w-4 h-4" />} label="Code Execution" desc="Run JavaScript and Python live" on={settings.codeExecEnabled} onToggle={() => upd("codeExecEnabled", !settings.codeExecEnabled)} />
                      <ToolRow icon={<Box className="w-4 h-4" />} label="3D Model Generation" desc="Generate 3D models in GLB/STL/OBJ" on={settings.modelGenEnabled} onToggle={() => upd("modelGenEnabled", !settings.modelGenEnabled)} />
                      <ToolRow icon={<Gamepad2 className="w-4 h-4" />} label="Game Creation" desc="Build games with Phaser/Godot/GDevelop" on={settings.gameCreationEnabled} onToggle={() => upd("gameCreationEnabled", !settings.gameCreationEnabled)} />
                      <ToolRow icon={<Brain className="w-4 h-4" />} label="Long-term Memory" desc="Remember facts between conversations" on={settings.memoryEnabled} onToggle={() => upd("memoryEnabled", !settings.memoryEnabled)} />

                      <div className="pt-3 border-t border-white/8 mt-2">
                        <SectionLabel>Exclusive OMNIMENS Modes</SectionLabel>
                        <ToolRow
                          icon={<ShieldCheck className="w-4 h-4" />}
                          label="Anti-Hallucination Mode"
                          desc="Every factual claim is verified before output (unique)"
                          on={settings.antiHallucinationMode}
                          onToggle={() => upd("antiHallucinationMode", !settings.antiHallucinationMode)}
                          color="orange"
                        />
                        <ToolRow
                          icon={<Swords className="w-4 h-4" />}
                          label="AI Debate Mode"
                          desc="OMNIMENS argues all sides — perfect for complex decisions (unique)"
                          on={settings.debateMode}
                          onToggle={() => upd("debateMode", !settings.debateMode)}
                          color="violet"
                        />
                      </div>

                      <div className="mt-3 p-3 rounded-lg bg-primary/5 border border-primary/10">
                        <p className="text-[9px] font-mono text-white/50">
                          Tool toggles take effect on the next message. Disabling a tool removes it from OMNIMENS's active capability set for that conversation.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* MEMORY */}
                  {tab === "memory" && <MemoryTab />}

                  {/* INTERFACE */}
                  {tab === "interface" && (
                    <div className="space-y-5">
                      <div>
                        <SectionLabel>Font Size</SectionLabel>
                        <div className="grid grid-cols-3 gap-2">
                          {(["sm", "md", "lg"] as const).map(s => (
                            <button key={s} onClick={() => upd("fontSize", s)}
                              className={`py-2 rounded-lg border transition-all ${settings.fontSize === s ? "border-primary/40 bg-primary/8 text-primary" : "border-white/8 text-white/50 hover:border-white/15"}`}>
                              <p className={`font-mono font-bold text-center ${s === "sm" ? "text-[9px]" : s === "md" ? "text-[11px]" : "text-[13px]"}`}>Aa</p>
                              <p className="font-mono text-[8px] text-white/40 text-center mt-0.5">{s === "sm" ? "Small" : s === "md" ? "Medium" : "Large"}</p>
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <SectionLabel>Message Density</SectionLabel>
                        <div className="grid grid-cols-3 gap-2">
                          {(["compact", "normal", "comfortable"] as const).map(d => (
                            <button key={d} onClick={() => upd("messageDensity", d)}
                              className={`py-2 px-3 rounded-lg border transition-all ${settings.messageDensity === d ? "border-primary/40 bg-primary/8 text-primary" : "border-white/8 text-white/50 hover:border-white/15"}`}>
                              <p className="font-mono text-[9px] font-bold text-center capitalize">{d}</p>
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <SectionLabel>Accent Color</SectionLabel>
                        <div className="flex gap-3">
                          {ACCENT_COLORS.map(c => (
                            <button key={c.id} onClick={() => upd("accentColor", c.id as any)}
                              className={`flex flex-col items-center gap-1.5 group`}>
                              <div className={`w-8 h-8 rounded-full ${c.bg} transition-all ${settings.accentColor === c.id ? "ring-2 ring-offset-2 ring-offset-black ring-white/60 scale-110" : "opacity-60 hover:opacity-90"}`} />
                              <p className="text-[8px] font-mono text-white/40">{c.label}</p>
                            </button>
                          ))}
                        </div>
                        <p className="text-[9px] font-mono text-white/25 mt-2">Color changes apply on next page load.</p>
                      </div>

                      <div className="space-y-1">
                        <SectionLabel>Display Options</SectionLabel>
                        <div className="space-y-0">
                          {[
                            { key: "showTimestamps" as const, label: "Show Timestamps", desc: "Show time on each message" },
                            { key: "showToolUsage" as const, label: "Show Tool Badges", desc: "Show web search / image gen indicators" },
                            { key: "autoScroll" as const, label: "Auto-Scroll", desc: "Scroll to new messages automatically" },
                            { key: "soundFx" as const, label: "Sound Effects", desc: "Subtle sounds for send/receive" },
                          ].map(opt => (
                            <div key={opt.key} className="flex items-center justify-between py-2.5 border-b border-white/5 last:border-0">
                              <div>
                                <p className="text-[11px] font-mono text-white/80">{opt.label}</p>
                                <p className="text-[9px] font-mono text-white/35">{opt.desc}</p>
                              </div>
                              <Toggle on={settings[opt.key]} onToggle={() => upd(opt.key, !settings[opt.key])} />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* LIBRARY */}
                  {tab === "library" && (
                    <LibraryTab onUsePrompt={(content) => { onUsePrompt(content); onClose(); }} />
                  )}

                  {/* WORKSPACE */}
                  {tab === "workspace" && (
                    <WorkspaceTab settings={settings} onUpdate={onChange} />
                  )}

                  {/* EXPORT */}
                  {tab === "export" && (
                    <ExportTab currentConversationId={currentConversationId} />
                  )}

                </motion.div>
              </AnimatePresence>
            </div>

            {/* Footer */}
            <div className="shrink-0 flex items-center justify-between px-5 py-3 border-t border-white/8 bg-black/30">
              <p className="font-mono text-[9px] text-white/25 tracking-widest">OMNIMENS · CONTROL HUB · ALL SETTINGS AUTO-SAVED</p>
              <button onClick={onClose}
                className="px-4 py-1.5 rounded-lg text-[10px] font-mono font-bold bg-primary/15 text-primary border border-primary/30 hover:bg-primary/25 transition-all">
                CLOSE
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
