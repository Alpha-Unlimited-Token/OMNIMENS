import { useAuth } from "@workspace/replit-auth-web";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import {
  Plus, MessageSquare, FolderOpen, Zap, Globe, Gamepad2,
  Monitor, Server, BarChart3, Clock, CheckCircle, Loader2,
  ArrowRight, Sparkles, Brain, Star, TrendingUp,
  CreditCard, Package, Search, Wrench, Code2, Mic,
  BrainCircuit, ShoppingCart, BookOpen, Presentation,
  XCircle, ChevronRight
} from "lucide-react";
import { motion } from "framer-motion";
import { OmnimensIcon } from "@/components/omnimens-icon";

const API = (path: string) => `/api${path}`;

type Project = {
  id: number;
  name: string;
  description: string;
  type: string;
  status: string;
  published: boolean;
  starred: boolean;
  updatedAt: string;
  createdAt: string;
};

const TYPE_ICONS: Record<string, React.ReactNode> = {
  website: <Globe className="w-4 h-4" />,
  webapp: <Monitor className="w-4 h-4" />,
  game: <Gamepad2 className="w-4 h-4" />,
  dataviz: <BarChart3 className="w-4 h-4" />,
  api: <Server className="w-4 h-4" />,
  tool: <Wrench className="w-4 h-4" />,
  extension: <Package className="w-4 h-4" />,
  voice: <Mic className="w-4 h-4" />,
  ai: <BrainCircuit className="w-4 h-4" />,
  ecommerce: <ShoppingCart className="w-4 h-4" />,
  education: <BookOpen className="w-4 h-4" />,
  presentation: <Presentation className="w-4 h-4" />,
};

const TYPE_COLORS: Record<string, string> = {
  website: "text-blue-400 bg-blue-400/10",
  webapp: "text-purple-400 bg-purple-400/10",
  game: "text-green-400 bg-green-400/10",
  dataviz: "text-yellow-400 bg-yellow-400/10",
  api: "text-pink-400 bg-pink-400/10",
  tool: "text-orange-400 bg-orange-400/10",
  extension: "text-cyan-400 bg-cyan-400/10",
  voice: "text-rose-400 bg-rose-400/10",
  ai: "text-violet-400 bg-violet-400/10",
  ecommerce: "text-emerald-400 bg-emerald-400/10",
  education: "text-sky-400 bg-sky-400/10",
  presentation: "text-amber-400 bg-amber-400/10",
};

const STATUS_BADGE: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  idle: { label: "Draft", color: "text-white/60 bg-white/5", icon: <Clock className="w-3 h-3" /> },
  building: { label: "Building", color: "text-yellow-400 bg-yellow-400/10", icon: <Loader2 className="w-3 h-3 animate-spin" /> },
  ready: { label: "Ready", color: "text-green-400 bg-green-400/10", icon: <CheckCircle className="w-3 h-3" /> },
  failed: { label: "Failed", color: "text-red-400 bg-red-400/10", icon: <XCircle className="w-3 h-3" /> },
};

export default function Dashboard() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");

  const { data: billing } = useQuery({
    queryKey: ["/api/omnimens/billing"],
    queryFn: async () => {
      const r = await fetch(API("/omnimens/billing"), { credentials: "include" });
      if (!r.ok) return null;
      return r.json();
    },
    retry: false,
  });

  const { data: projects, isLoading: projectsLoading } = useQuery({
    queryKey: ["/api/omnimens/projects"],
    queryFn: async () => {
      const r = await fetch(API("/omnimens/projects"), { credentials: "include" });
      if (!r.ok) return [];
      return r.json() as Promise<Project[]>;
    },
    retry: false,
  });

  const { data: conversations } = useQuery({
    queryKey: ["/api/omnimens/conversations"],
    queryFn: async () => {
      const r = await fetch(API("/omnimens/conversations"), { credentials: "include" });
      if (!r.ok) return [];
      return r.json();
    },
    retry: false,
  });

  const recentProjects = (projects || [])
    .sort((a: Project, b: Project) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 6);

  const starredProjects = (projects || []).filter((p: Project) => p.starred);
  const recentChats = (conversations || []).slice(0, 5);
  const username = (user as any)?.username || "User";
  const credits = billing?.credits ?? 0;
  const tier = billing?.tier || "free";

  const filteredProjects = searchQuery
    ? recentProjects.filter((p: Project) =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : recentProjects;

  const greeting = getGreeting();

  return (
    <div className="min-h-full">
      <div className="max-w-6xl mx-auto px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="flex items-start justify-between mb-8">
            <div>
              <h1 className="text-2xl font-display font-bold text-white mb-1">
                {greeting}, {username}
              </h1>
              <p className="text-sm font-mono text-white/50">
                What will you create today?
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/8">
                <Zap className="w-3.5 h-3.5 text-primary" />
                <span className="text-xs font-mono text-white/80">{credits.toLocaleString()}</span>
                <span className="text-[10px] font-mono text-white/40">CREDITS</span>
              </div>
              {tier !== "free" && (
                <div className="px-2.5 py-1 rounded-full bg-primary/10 border border-primary/20">
                  <span className="text-[10px] font-mono font-bold text-primary tracking-widest">{tier.toUpperCase()}</span>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-10">
            <QuickAction
              icon={<MessageSquare className="w-5 h-5" />}
              label="New Chat"
              desc="Start an AI conversation"
              color="text-primary bg-primary/8 border-primary/15 hover:border-primary/30"
              onClick={() => setLocation("/chat")}
            />
            <QuickAction
              icon={<Plus className="w-5 h-5" />}
              label="New Project"
              desc="Build something new"
              color="text-blue-400 bg-blue-400/8 border-blue-400/15 hover:border-blue-400/30"
              onClick={() => setLocation("/projects")}
            />
            <QuickAction
              icon={<Brain className="w-5 h-5" />}
              label="Deep Resonance"
              desc="8-mind parallel analysis"
              color="text-violet-400 bg-violet-400/8 border-violet-400/15 hover:border-violet-400/30"
              onClick={() => setLocation("/chat")}
            />
            <QuickAction
              icon={<CreditCard className="w-5 h-5" />}
              label="Get Credits"
              desc="Buy credits or subscribe"
              color="text-amber-400 bg-amber-400/8 border-amber-400/15 hover:border-amber-400/30"
              onClick={() => setLocation("/pricing")}
            />
          </div>

          {(recentProjects.length > 0 || recentChats?.length > 0) && (
            <div className="mb-6">
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search projects..."
                  className="w-full bg-white/5 border border-white/8 rounded-lg pl-10 pr-4 py-2 text-sm font-mono text-white placeholder:text-white/30 focus:outline-none focus:border-primary/30 transition-colors"
                />
              </div>
            </div>
          )}

          {starredProjects.length > 0 && !searchQuery && (
            <section className="mb-10">
              <div className="flex items-center gap-2 mb-4">
                <Star className="w-4 h-4 text-amber-400" />
                <h2 className="text-sm font-mono font-bold text-white tracking-widest">STARRED</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {starredProjects.slice(0, 3).map((p: Project) => (
                  <ProjectCard key={p.id} project={p} onClick={() => setLocation("/projects")} />
                ))}
              </div>
            </section>
          )}

          <section className="mb-10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <FolderOpen className="w-4 h-4 text-white/60" />
                <h2 className="text-sm font-mono font-bold text-white tracking-widest">RECENT PROJECTS</h2>
              </div>
              {(projects || []).length > 6 && (
                <button
                  onClick={() => setLocation("/projects")}
                  className="flex items-center gap-1 text-xs font-mono text-primary hover:text-primary/80 transition-colors"
                >
                  VIEW ALL <ChevronRight className="w-3 h-3" />
                </button>
              )}
            </div>
            {projectsLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-32 rounded-xl bg-white/3 border border-white/5 animate-pulse" />
                ))}
              </div>
            ) : filteredProjects.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {filteredProjects.map((p: Project) => (
                  <ProjectCard key={p.id} project={p} onClick={() => setLocation("/projects")} />
                ))}
              </div>
            ) : (projects || []).length === 0 ? (
              <EmptyState
                icon={<FolderOpen className="w-10 h-10 text-white/20" />}
                title="No projects yet"
                desc="Start a chat and ask OMNIMENS to build something for you."
                action="Start Creating"
                onAction={() => setLocation("/chat")}
              />
            ) : (
              <div className="text-center py-8">
                <p className="text-sm font-mono text-white/40">No projects match your search</p>
              </div>
            )}
          </section>

          {recentChats?.length > 0 && !searchQuery && (
            <section className="mb-10">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-white/60" />
                  <h2 className="text-sm font-mono font-bold text-white tracking-widest">RECENT CONVERSATIONS</h2>
                </div>
                <button
                  onClick={() => setLocation("/chat")}
                  className="flex items-center gap-1 text-xs font-mono text-primary hover:text-primary/80 transition-colors"
                >
                  VIEW ALL <ChevronRight className="w-3 h-3" />
                </button>
              </div>
              <div className="space-y-1">
                {recentChats.map((chat: any) => (
                  <button
                    key={chat.id}
                    onClick={() => setLocation("/chat")}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-white/[0.02] border border-white/5 hover:bg-white/5 hover:border-white/10 transition-all text-left group"
                  >
                    <MessageSquare className="w-4 h-4 text-white/30 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-mono text-white/80 truncate">
                        {chat.title || "Untitled conversation"}
                      </div>
                      <div className="text-[10px] font-mono text-white/30 mt-0.5">
                        {formatTimeAgo(chat.updatedAt || chat.createdAt)}
                      </div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-white/20 group-hover:text-white/50 transition-colors shrink-0" />
                  </button>
                ))}
              </div>
            </section>
          )}

          <section className="mb-10">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-4 h-4 text-primary" />
              <h2 className="text-sm font-mono font-bold text-white tracking-widest">QUICK START TEMPLATES</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {TEMPLATES.map((t) => (
                <button
                  key={t.label}
                  onClick={() => setLocation("/chat")}
                  className="flex items-start gap-3 p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/5 hover:border-white/10 transition-all text-left group"
                >
                  <div className={`p-2 rounded-lg ${t.color} shrink-0`}>{t.icon}</div>
                  <div>
                    <div className="text-xs font-mono font-bold text-white/85 mb-0.5">{t.label}</div>
                    <div className="text-[10px] font-mono text-white/40 leading-relaxed">{t.desc}</div>
                  </div>
                </button>
              ))}
            </div>
          </section>

        </motion.div>
      </div>
    </div>
  );
}

function QuickAction({
  icon,
  label,
  desc,
  color,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  desc: string;
  color: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-3 p-4 rounded-xl border transition-all text-left group ${color}`}
    >
      <div className="shrink-0">{icon}</div>
      <div>
        <div className="text-sm font-mono font-bold text-white">{label}</div>
        <div className="text-[10px] font-mono text-white/50">{desc}</div>
      </div>
    </button>
  );
}

function ProjectCard({ project, onClick }: { project: Project; onClick: () => void }) {
  const status = STATUS_BADGE[project.status] || STATUS_BADGE.idle;
  const typeColor = TYPE_COLORS[project.type] || "text-white/60 bg-white/5";
  const typeIcon = TYPE_ICONS[project.type] || <Code2 className="w-4 h-4" />;

  return (
    <button
      onClick={onClick}
      className="flex flex-col p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/5 hover:border-white/10 transition-all text-left group"
    >
      <div className="flex items-center justify-between mb-3">
        <div className={`p-1.5 rounded-lg ${typeColor}`}>{typeIcon}</div>
        <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono ${status.color}`}>
          {status.icon}
          {status.label}
        </div>
      </div>
      <div className="text-sm font-mono font-bold text-white/85 mb-1 truncate">{project.name}</div>
      <div className="text-[10px] font-mono text-white/40 line-clamp-2 mb-3">{project.description}</div>
      <div className="flex items-center justify-between mt-auto">
        <span className="text-[10px] font-mono text-white/25">{formatTimeAgo(project.updatedAt)}</span>
        {project.starred && <Star className="w-3 h-3 text-amber-400/60" />}
      </div>
    </button>
  );
}

function EmptyState({
  icon,
  title,
  desc,
  action,
  onAction,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
  action: string;
  onAction: () => void;
}) {
  return (
    <div className="flex flex-col items-center py-16 px-4">
      {icon}
      <h3 className="text-sm font-mono font-bold text-white/60 mt-4 mb-1">{title}</h3>
      <p className="text-xs font-mono text-white/35 mb-6 text-center max-w-xs">{desc}</p>
      <button
        onClick={onAction}
        className="flex items-center gap-2 px-5 py-2 rounded-lg bg-primary/10 border border-primary/20 text-primary text-xs font-mono font-bold tracking-widest hover:bg-primary/15 transition-colors"
      >
        <Plus className="w-3.5 h-3.5" />
        {action.toUpperCase()}
      </button>
    </div>
  );
}

const TEMPLATES = [
  { icon: <Globe className="w-4 h-4" />, label: "Landing Page", desc: "Modern marketing site with hero, features, CTA", color: "bg-blue-400/10 text-blue-400" },
  { icon: <Monitor className="w-4 h-4" />, label: "Web App", desc: "Full-stack app with auth and database", color: "bg-purple-400/10 text-purple-400" },
  { icon: <Gamepad2 className="w-4 h-4" />, label: "Browser Game", desc: "Interactive game with WebGL/Canvas", color: "bg-green-400/10 text-green-400" },
  { icon: <Server className="w-4 h-4" />, label: "REST API", desc: "Backend service with endpoints", color: "bg-pink-400/10 text-pink-400" },
  { icon: <BarChart3 className="w-4 h-4" />, label: "Dashboard", desc: "Data visualization with charts", color: "bg-yellow-400/10 text-yellow-400" },
  { icon: <BrainCircuit className="w-4 h-4" />, label: "AI Agent", desc: "Autonomous AI pipeline", color: "bg-violet-400/10 text-violet-400" },
  { icon: <ShoppingCart className="w-4 h-4" />, label: "E-Commerce", desc: "Store with products and checkout", color: "bg-emerald-400/10 text-emerald-400" },
  { icon: <BookOpen className="w-4 h-4" />, label: "Education", desc: "Course platform with quizzes", color: "bg-sky-400/10 text-sky-400" },
];

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

function formatTimeAgo(dateStr: string): string {
  if (!dateStr) return "";
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return `${Math.floor(days / 30)}mo ago`;
}
