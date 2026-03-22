/**
 * ============================================================
 * OMNIMENS — Memory Management
 * Copyright © 2024–2026 Alpha Unlimited Technologies. All Rights Reserved.
 * ============================================================
 */
import { useState, useEffect } from "react";
import { useAuth } from "@workspace/replit-auth-web";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import {
  Brain, Trash2, Plus, X, Search, RefreshCw, AlertTriangle,
  Tag, Clock, Lightbulb, User, Settings, BookOpen, Heart, Cpu
} from "lucide-react";
import { SEO, seoData } from "@/components/seo";

type Memory = {
  id: number;
  content: string;
  category: string;
  createdAt: string;
  updatedAt?: string;
};

const CATEGORY_META: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  preference:  { label: "Preference",  icon: <Heart className="w-3 h-3" />,    color: "text-pink-400 border-pink-400/30 bg-pink-400/5" },
  fact:        { label: "Fact",        icon: <BookOpen className="w-3 h-3" />, color: "text-blue-400 border-blue-400/30 bg-blue-400/5" },
  instruction: { label: "Instruction", icon: <Settings className="w-3 h-3" />, color: "text-orange-400 border-orange-400/30 bg-orange-400/5" },
  context:     { label: "Context",     icon: <User className="w-3 h-3" />,     color: "text-green-400 border-green-400/30 bg-green-400/5" },
  skill:       { label: "Skill",       icon: <Cpu className="w-3 h-3" />,      color: "text-violet-400 border-violet-400/30 bg-violet-400/5" },
  goal:        { label: "Goal",        icon: <Lightbulb className="w-3 h-3" />,color: "text-yellow-400 border-yellow-400/30 bg-yellow-400/5" },
};

function CategoryBadge({ category }: { category: string }) {
  const meta = CATEGORY_META[category] ?? { label: category, icon: <Tag className="w-3 h-3" />, color: "text-white/50 border-white/10 bg-white/5" };
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-mono ${meta.color}`}>
      {meta.icon}{meta.label}
    </span>
  );
}

export default function MemoryPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const [, navigate] = useLocation();
  const [memories, setMemories] = useState<Memory[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [newContent, setNewContent] = useState("");
  const [newCategory, setNewCategory] = useState("fact");
  const [adding, setAdding] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [filterCategory, setFilterCategory] = useState("all");

  const fetchMemories = async () => {
    setLoading(true);
    try {
      const r = await fetch("/api/omnimens/memories", { credentials: "include" });
      if (r.ok) {
        const data = await r.json();
        setMemories(data);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isLoading && !isAuthenticated) navigate("/login");
    if (isAuthenticated) fetchMemories();
  }, [isAuthenticated, isLoading]);

  const deleteMemory = async (id: number) => {
    await fetch(`/api/omnimens/memories/${id}`, { method: "DELETE", credentials: "include" });
    setMemories(prev => prev.filter(m => m.id !== id));
  };

  const addMemory = async () => {
    if (!newContent.trim()) return;
    setAdding(true);
    try {
      const r = await fetch("/api/omnimens/memories", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newContent.trim(), category: newCategory }),
      });
      if (r.ok) {
        const mem = await r.json();
        setMemories(prev => [mem, ...prev]);
        setNewContent("");
        setShowAddForm(false);
      }
    } finally {
      setAdding(false);
    }
  };

  const clearAll = async () => {
    setClearing(true);
    try {
      await fetch("/api/omnimens/memories", { method: "DELETE", credentials: "include" });
      setMemories([]);
      setShowClearConfirm(false);
    } finally {
      setClearing(false);
    }
  };

  const filtered = memories.filter(m => {
    const matchSearch = !search || m.content.toLowerCase().includes(search.toLowerCase());
    const matchCat = filterCategory === "all" || m.category === filterCategory;
    return matchSearch && matchCat;
  });

  const categories = Array.from(new Set(memories.map(m => m.category)));

  if (isLoading) return (
    <div className="flex-1 flex items-center justify-center">
      <div className="animate-pulse text-primary font-mono tracking-widest">LOADING...</div>
    </div>
  );

  return (
    <>
      <SEO {...seoData.memory} />
      <div className="flex-1 overflow-auto">
        <div className="max-w-3xl mx-auto px-6 sm:px-4 py-8 space-y-6">

          {/* Header */}
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <Brain className="w-4 h-4 text-primary" />
                </div>
                <h1 className="text-xl font-semibold tracking-tight">Memory Bank</h1>
              </div>
              <p className="text-sm text-white/50">
                {memories.length} {memories.length === 1 ? "memory" : "memories"} stored — OMNIMENS remembers these across all conversations.
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Button variant="ghost" size="sm" onClick={fetchMemories} className="text-white/50 hover:text-white gap-1.5">
                <RefreshCw className="w-3.5 h-3.5" /> Refresh
              </Button>
              <Button size="sm" onClick={() => setShowAddForm(true)} className="gap-1.5 text-xs">
                <Plus className="w-3.5 h-3.5" /> Add Memory
              </Button>
            </div>
          </div>

          {/* Add memory form */}
          <AnimatePresence>
            {showAddForm && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="border border-primary/20 rounded-xl p-4 bg-primary/5 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-white/80">Add New Memory</span>
                  <button onClick={() => setShowAddForm(false)} className="text-white/40 hover:text-white/70">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <textarea
                  value={newContent}
                  onChange={e => setNewContent(e.target.value)}
                  placeholder="What should OMNIMENS remember? E.g. 'I prefer concise responses' or 'My name is Alex'"
                  className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/30 resize-none focus:outline-none focus:border-primary/40"
                  rows={3}
                />
                <div className="flex items-center gap-3">
                  <select
                    value={newCategory}
                    onChange={e => setNewCategory(e.target.value)}
                    className="bg-black/60 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none focus:border-primary/40"
                  >
                    {Object.entries(CATEGORY_META).map(([k, v]) => (
                      <option key={k} value={k}>{v.label}</option>
                    ))}
                  </select>
                  <Button size="sm" onClick={addMemory} disabled={adding || !newContent.trim()} className="ml-auto text-xs">
                    {adding ? "Saving..." : "Save Memory"}
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Search + filter */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search memories..."
                className="w-full bg-black/40 border border-white/10 rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-primary/40"
              />
            </div>
            <select
              value={filterCategory}
              onChange={e => setFilterCategory(e.target.value)}
              className="bg-black/60 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none focus:border-primary/40"
            >
              <option value="all">All types</option>
              {categories.map(c => (
                <option key={c} value={c}>{CATEGORY_META[c]?.label ?? c}</option>
              ))}
            </select>
          </div>

          {/* Memory list */}
          {loading ? (
            <div className="flex items-center justify-center py-20 text-white/30 font-mono text-xs">
              <Cpu className="w-4 h-4 animate-spin mr-2" /> Loading memories...
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20 space-y-3">
              <Brain className="w-10 h-10 text-white/10 mx-auto" />
              <p className="text-white/30 text-sm">
                {search || filterCategory !== "all" ? "No memories match your search." : "No memories yet. OMNIMENS will build them as you chat."}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <AnimatePresence initial={false}>
                {filtered.map(mem => (
                  <motion.div
                    key={mem.id}
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="group flex items-start gap-3 p-3 rounded-lg border border-white/6 bg-white/2 hover:border-white/12 hover:bg-white/4 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white/85 leading-relaxed">{mem.content}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <CategoryBadge category={mem.category} />
                        <span className="text-[10px] text-white/25 font-mono flex items-center gap-1">
                          <Clock className="w-2.5 h-2.5" />
                          {new Date(mem.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => deleteMemory(mem.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-md text-white/30 hover:text-red-400 hover:bg-red-400/10"
                      title="Delete this memory"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}

          {/* Danger zone */}
          {memories.length > 0 && (
            <div className="border border-red-500/15 rounded-xl p-4 bg-red-500/3 space-y-3">
              <div className="flex items-center gap-2 text-red-400 text-xs font-mono">
                <AlertTriangle className="w-3.5 h-3.5" /> DANGER ZONE
              </div>
              {!showClearConfirm ? (
                <div className="flex items-center justify-between">
                  <p className="text-xs text-white/40">Permanently delete all {memories.length} memories. OMNIMENS will start fresh.</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowClearConfirm(true)}
                    className="text-red-400 hover:text-red-300 hover:bg-red-400/10 text-xs gap-1.5"
                  >
                    <Trash2 className="w-3 h-3" /> Clear All Memories
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <p className="text-xs text-red-300 flex-1">Are you sure? This cannot be undone.</p>
                  <Button variant="ghost" size="sm" onClick={() => setShowClearConfirm(false)} className="text-xs text-white/50">Cancel</Button>
                  <Button size="sm" onClick={clearAll} disabled={clearing} className="bg-red-600 hover:bg-red-700 text-white text-xs">
                    {clearing ? "Clearing..." : "Yes, Delete All"}
                  </Button>
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </>
  );
}
