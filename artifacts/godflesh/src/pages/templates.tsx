/**
   * OMNIMENS — Proprietary AI Platform
   * Copyright © 2024–2026 Alpha Unlimited Technologies, LLC. All Rights Reserved.
   * Unauthorized reproduction, distribution, or use is strictly prohibited.
   */

  import { useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import {
  Globe, Monitor, Gamepad2, BarChart3, Server, Wrench, Package,
  Mic, BrainCircuit, ShoppingCart, BookOpen, Presentation,
  Search, Star, ArrowRight, Zap, Users, Download, Eye,
  Sparkles, TrendingUp, Clock, Filter, X, ChevronRight
} from "lucide-react";
import { SEO, seoData } from "@/components/seo";

type Template = {
  id: string;
  name: string;
  description: string;
  type: string;
  category: string;
  stars: number;
  forks: number;
  author: string;
  tags: string[];
  preview?: string;
  featured?: boolean;
};

const CATEGORIES = [
  { id: "all", label: "All", icon: <Sparkles className="w-3.5 h-3.5" /> },
  { id: "website", label: "Websites", icon: <Globe className="w-3.5 h-3.5" /> },
  { id: "webapp", label: "Web Apps", icon: <Monitor className="w-3.5 h-3.5" /> },
  { id: "game", label: "Games", icon: <Gamepad2 className="w-3.5 h-3.5" /> },
  { id: "dataviz", label: "Data Viz", icon: <BarChart3 className="w-3.5 h-3.5" /> },
  { id: "api", label: "APIs", icon: <Server className="w-3.5 h-3.5" /> },
  { id: "ai", label: "AI / ML", icon: <BrainCircuit className="w-3.5 h-3.5" /> },
  { id: "ecommerce", label: "E-Commerce", icon: <ShoppingCart className="w-3.5 h-3.5" /> },
  { id: "education", label: "Education", icon: <BookOpen className="w-3.5 h-3.5" /> },
];

const TYPE_COLORS: Record<string, string> = {
  website: "text-blue-400 bg-blue-500/15",
  webapp: "text-purple-400 bg-purple-500/15",
  game: "text-green-400 bg-green-500/15",
  dataviz: "text-yellow-400 bg-yellow-500/15",
  api: "text-pink-400 bg-pink-500/15",
  ai: "text-violet-400 bg-violet-500/15",
  ecommerce: "text-emerald-400 bg-emerald-500/15",
  education: "text-sky-400 bg-sky-500/15",
  tool: "text-orange-400 bg-orange-500/15",
};

const TYPE_ICONS: Record<string, React.ReactNode> = {
  website: <Globe className="w-4 h-4" />,
  webapp: <Monitor className="w-4 h-4" />,
  game: <Gamepad2 className="w-4 h-4" />,
  dataviz: <BarChart3 className="w-4 h-4" />,
  api: <Server className="w-4 h-4" />,
  ai: <BrainCircuit className="w-4 h-4" />,
  ecommerce: <ShoppingCart className="w-4 h-4" />,
  education: <BookOpen className="w-4 h-4" />,
  tool: <Wrench className="w-4 h-4" />,
  voice: <Mic className="w-4 h-4" />,
  extension: <Package className="w-4 h-4" />,
  presentation: <Presentation className="w-4 h-4" />,
};

const TEMPLATES: Template[] = [
  { id: "saas-landing", name: "SaaS Landing Page", description: "Modern landing page with hero, features, pricing, testimonials, and CTA sections. Fully responsive with dark mode.", type: "website", category: "website", stars: 284, forks: 142, author: "OMNIMENS", tags: ["landing", "saas", "responsive", "dark-mode"], featured: true },
  { id: "ai-chatbot", name: "AI Chatbot Interface", description: "Full-featured chat interface with streaming responses, message history, and markdown rendering.", type: "webapp", category: "ai", stars: 356, forks: 198, author: "OMNIMENS", tags: ["ai", "chat", "streaming", "markdown"], featured: true },
  { id: "dashboard-analytics", name: "Analytics Dashboard", description: "Interactive dashboard with charts, KPI cards, data tables, and date range filters.", type: "dataviz", category: "dataviz", stars: 221, forks: 109, author: "OMNIMENS", tags: ["dashboard", "charts", "analytics", "recharts"], featured: true },
  { id: "ecom-store", name: "E-Commerce Store", description: "Complete store with product listings, cart, checkout flow, and Stripe integration.", type: "ecommerce", category: "ecommerce", stars: 178, forks: 87, author: "OMNIMENS", tags: ["store", "stripe", "cart", "products"] },
  { id: "portfolio-dev", name: "Developer Portfolio", description: "Clean portfolio site with project showcase, about section, skills, and contact form.", type: "website", category: "website", stars: 312, forks: 256, author: "OMNIMENS", tags: ["portfolio", "personal", "projects", "contact"] },
  { id: "rest-api-starter", name: "REST API Starter", description: "Express API with auth, CRUD endpoints, database integration, rate limiting, and Swagger docs.", type: "api", category: "api", stars: 189, forks: 94, author: "OMNIMENS", tags: ["express", "auth", "crud", "swagger"] },
  { id: "quiz-platform", name: "Quiz Platform", description: "Interactive quiz app with timed questions, scoring, leaderboards, and progress tracking.", type: "education", category: "education", stars: 145, forks: 67, author: "OMNIMENS", tags: ["quiz", "gamification", "learning", "scores"] },
  { id: "pixel-platformer", name: "Pixel Platformer", description: "2D platformer game with physics, sprite animations, levels, and score tracking.", type: "game", category: "game", stars: 267, forks: 134, author: "OMNIMENS", tags: ["canvas", "physics", "sprites", "levels"] },
  { id: "blog-cms", name: "Blog with CMS", description: "Full blog platform with markdown editor, categories, tags, search, and admin panel.", type: "webapp", category: "webapp", stars: 198, forks: 112, author: "OMNIMENS", tags: ["blog", "cms", "markdown", "admin"] },
  { id: "ai-image-gen", name: "AI Image Generator", description: "Image generation interface with prompt builder, style presets, gallery, and history.", type: "webapp", category: "ai", stars: 234, forks: 156, author: "OMNIMENS", tags: ["ai", "images", "generation", "gallery"] },
  { id: "task-manager", name: "Task Manager", description: "Kanban-style task board with drag-and-drop, labels, due dates, and team assignment.", type: "webapp", category: "webapp", stars: 167, forks: 83, author: "OMNIMENS", tags: ["kanban", "tasks", "drag-drop", "productivity"] },
  { id: "weather-app", name: "Weather Dashboard", description: "Weather app with current conditions, 7-day forecast, radar maps, and city search.", type: "webapp", category: "dataviz", stars: 134, forks: 78, author: "OMNIMENS", tags: ["weather", "api", "maps", "forecast"] },
  { id: "social-feed", name: "Social Feed", description: "Social media feed with posts, comments, likes, user profiles, and real-time updates.", type: "webapp", category: "webapp", stars: 201, forks: 99, author: "OMNIMENS", tags: ["social", "feed", "realtime", "profiles"] },
  { id: "voice-assistant", name: "Voice Assistant", description: "Voice-controlled AI assistant with speech recognition, text-to-speech, and command routing.", type: "voice", category: "ai", stars: 156, forks: 72, author: "OMNIMENS", tags: ["voice", "speech", "tts", "commands"] },
  { id: "pitch-deck", name: "Pitch Deck Builder", description: "Create professional pitch decks with slide editor, themes, charts, and export to PDF.", type: "presentation", category: "webapp", stars: 123, forks: 58, author: "OMNIMENS", tags: ["slides", "pitch", "presentation", "pdf"] },
  { id: "crypto-tracker", name: "Crypto Portfolio Tracker", description: "Real-time cryptocurrency portfolio tracker with price alerts, charts, and P&L analysis.", type: "dataviz", category: "dataviz", stars: 189, forks: 91, author: "OMNIMENS", tags: ["crypto", "portfolio", "charts", "alerts"] },
];

export default function Templates() {
  const [, setLocation] = useLocation();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [sort, setSort] = useState<"popular" | "recent">("popular");

  const filtered = TEMPLATES.filter(t => {
    if (category !== "all" && t.category !== category) return false;
    if (search) {
      const q = search.toLowerCase();
      return t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q) || t.tags.some(tag => tag.includes(q));
    }
    return true;
  }).sort((a, b) => sort === "popular" ? b.stars - a.stars : 0);

  const featured = TEMPLATES.filter(t => t.featured);

  return (
    <>
      <SEO title="Templates — OMNIMENS" description="Browse and fork community templates to jumpstart your next project." />
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto px-6 py-8">
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <div className="mb-6">
              <h1 className="text-xl font-semibold text-white mb-1">Templates</h1>
              <p className="text-sm text-[#9DA5B4]">Fork a template and start building instantly</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mb-5">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9DA5B4]" />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search templates..."
                  className="w-full bg-[#1C2333] border border-[#2B3245] rounded-lg pl-10 pr-4 py-2 text-sm text-white placeholder:text-[#9DA5B4]/60 focus:outline-none focus:border-primary/50 transition-colors"
                />
                {search && (
                  <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9DA5B4] hover:text-white">
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setSort("popular")}
                  className={`px-3 py-2 rounded-lg text-sm transition-all ${sort === "popular" ? "bg-primary/15 text-primary border border-primary/25" : "text-[#9DA5B4] hover:text-white bg-[#1C2333] border border-[#2B3245]"}`}
                >
                  <Star className="w-3.5 h-3.5 inline mr-1.5" />Popular
                </button>
                <button
                  onClick={() => setSort("recent")}
                  className={`px-3 py-2 rounded-lg text-sm transition-all ${sort === "recent" ? "bg-primary/15 text-primary border border-primary/25" : "text-[#9DA5B4] hover:text-white bg-[#1C2333] border border-[#2B3245]"}`}
                >
                  <Clock className="w-3.5 h-3.5 inline mr-1.5" />Recent
                </button>
              </div>
            </div>

            <div className="flex gap-2 mb-6 overflow-x-auto pb-1 scrollbar-none">
              {CATEGORIES.map(c => (
                <button
                  key={c.id}
                  onClick={() => setCategory(c.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm whitespace-nowrap transition-all ${
                    category === c.id
                      ? "bg-primary/15 text-primary border border-primary/25"
                      : "text-[#9DA5B4] hover:text-white bg-[#1C2333] border border-[#2B3245]"
                  }`}
                >
                  {c.icon} {c.label}
                </button>
              ))}
            </div>

            {!search && category === "all" && (
              <section className="mb-8">
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="w-4 h-4 text-primary" />
                  <h2 className="text-sm font-semibold text-white">Featured</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {featured.map(t => (
                    <FeaturedCard key={t.id} template={t} onFork={() => setLocation("/chat")} />
                  ))}
                </div>
              </section>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {filtered.map(t => (
                <TemplateCard key={t.id} template={t} onFork={() => setLocation("/chat")} />
              ))}
            </div>

            {filtered.length === 0 && (
              <div className="flex flex-col items-center py-16">
                <Search className="w-10 h-10 text-[#9DA5B4]/40 mb-4" />
                <p className="text-sm text-[#9DA5B4]">No templates match your search</p>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </>
  );
}

function FeaturedCard({ template, onFork }: { template: Template; onFork: () => void }) {
  const color = TYPE_COLORS[template.type] || "text-white/50 bg-white/10";
  return (
    <div className="relative p-4 rounded-lg bg-[#1C2333] border border-primary/20 hover:border-primary/35 transition-all group cursor-pointer" onClick={onFork}>
      <div className="absolute top-3 right-3">
        <span className="text-[10px] font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">Featured</span>
      </div>
      <div className={`inline-flex p-2 rounded-lg mb-3 ${color}`}>
        {TYPE_ICONS[template.type]}
      </div>
      <h3 className="text-sm font-semibold text-white mb-1">{template.name}</h3>
      <p className="text-xs text-[#9DA5B4] line-clamp-2 mb-4">{template.description}</p>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 text-xs text-[#9DA5B4]">
          <span className="flex items-center gap-1"><Star className="w-3 h-3" />{template.stars}</span>
          <span className="flex items-center gap-1"><Download className="w-3 h-3" />{template.forks}</span>
        </div>
        <span className="flex items-center gap-1 text-xs text-primary opacity-0 group-hover:opacity-100 transition-opacity">
          Use Template <ArrowRight className="w-3 h-3" />
        </span>
      </div>
    </div>
  );
}

function TemplateCard({ template, onFork }: { template: Template; onFork: () => void }) {
  const color = TYPE_COLORS[template.type] || "text-white/50 bg-white/10";
  return (
    <div className="p-4 rounded-lg bg-[#1C2333] border border-[#2B3245] hover:bg-[#222D3E] hover:border-[#3D4659] transition-all group cursor-pointer" onClick={onFork}>
      <div className="flex items-center gap-2.5 mb-3">
        <div className={`p-1.5 rounded-lg ${color}`}>
          {TYPE_ICONS[template.type]}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-medium text-white truncate">{template.name}</h3>
          <span className="text-xs text-[#9DA5B4]">{template.author}</span>
        </div>
      </div>
      <p className="text-xs text-[#9DA5B4] line-clamp-2 mb-3">{template.description}</p>
      <div className="flex flex-wrap gap-1 mb-3">
        {template.tags.slice(0, 3).map(tag => (
          <span key={tag} className="text-[10px] text-[#9DA5B4]/70 bg-[#2B3245] px-1.5 py-0.5 rounded">{tag}</span>
        ))}
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 text-xs text-[#9DA5B4]">
          <span className="flex items-center gap-1"><Star className="w-3 h-3" />{template.stars}</span>
          <span className="flex items-center gap-1"><Download className="w-3 h-3" />{template.forks}</span>
        </div>
        <button className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs text-primary bg-primary/10 hover:bg-primary/20 transition-all opacity-0 group-hover:opacity-100">
          <Zap className="w-3 h-3" /> Fork
        </button>
      </div>
    </div>
  );
}
