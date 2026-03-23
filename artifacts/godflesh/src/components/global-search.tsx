import { useState, useEffect, useRef, useCallback } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, X, MessageSquare, FolderOpen, FileCode, Settings,
  CreditCard, BookOpen, HelpCircle, Globe, Zap, ArrowRight,
  CornerDownLeft, ChevronRight, Rocket, Wrench, Brain, Key, FileArchive
} from "lucide-react";

type SearchResult = {
  id: string;
  type: "page" | "project" | "action" | "template";
  title: string;
  subtitle?: string;
  icon: React.ReactNode;
  href: string;
  shortcut?: string;
};

const PAGES: SearchResult[] = [
  { id: "home", type: "page", title: "Home", subtitle: "Dashboard", icon: <Globe className="w-4 h-4" />, href: "/" },
  { id: "chat", type: "page", title: "Create", subtitle: "AI Chat", icon: <MessageSquare className="w-4 h-4" />, href: "/chat", shortcut: "C" },
  { id: "projects", type: "page", title: "My Projects", subtitle: "All projects", icon: <FolderOpen className="w-4 h-4" />, href: "/projects", shortcut: "P" },
  { id: "templates", type: "page", title: "Templates", subtitle: "Browse templates", icon: <Rocket className="w-4 h-4" />, href: "/templates" },
  { id: "pricing", type: "page", title: "Pricing", subtitle: "Plans & credits", icon: <CreditCard className="w-4 h-4" />, href: "/pricing" },
  { id: "account", type: "page", title: "Settings", subtitle: "Account & preferences", icon: <Settings className="w-4 h-4" />, href: "/account" },
  { id: "memory", type: "page", title: "Memory", subtitle: "AI memories", icon: <Brain className="w-4 h-4" />, href: "/memory" },
  { id: "developer", type: "page", title: "Developer", subtitle: "API & tools", icon: <Key className="w-4 h-4" />, href: "/developer" },
  { id: "tools", type: "page", title: "Tools", subtitle: "Built-in tools", icon: <Wrench className="w-4 h-4" />, href: "/tools" },
  { id: "faq", type: "page", title: "FAQ", subtitle: "Help & guides", icon: <HelpCircle className="w-4 h-4" />, href: "/faq" },
  { id: "deploy", type: "page", title: "Deployments", subtitle: "Deploy projects", icon: <Rocket className="w-4 h-4" />, href: "/deploy" },
  { id: "files", type: "page", title: "My Files", subtitle: "Saved images, videos & assets", icon: <FileArchive className="w-4 h-4" />, href: "/files", shortcut: "F" },
];

const ACTIONS: SearchResult[] = [
  { id: "new-chat", type: "action", title: "New Chat", subtitle: "Start a conversation", icon: <MessageSquare className="w-4 h-4 text-primary" />, href: "/chat" },
  { id: "new-project", type: "action", title: "New Project", subtitle: "Create a project", icon: <FolderOpen className="w-4 h-4 text-blue-400" />, href: "/projects" },
  { id: "buy-credits", type: "action", title: "Buy Credits", subtitle: "Get more credits", icon: <Zap className="w-4 h-4 text-amber-400" />, href: "/pricing" },
];

export function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [, setLocation] = useLocation();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen(v => !v);
      }
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  useEffect(() => {
    if (open) {
      setQuery("");
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  const results = query.trim()
    ? [...PAGES, ...ACTIONS].filter(r =>
        r.title.toLowerCase().includes(query.toLowerCase()) ||
        r.subtitle?.toLowerCase().includes(query.toLowerCase())
      )
    : [...ACTIONS, ...PAGES.slice(0, 6)];

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const navigate = useCallback((href: string) => {
    setOpen(false);
    setLocation(href);
  }, [setLocation]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex(i => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex(i => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && results[selectedIndex]) {
      navigate(results[selectedIndex].href);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-start justify-center pt-[15vh] px-4 bg-black/60 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -10 }}
            transition={{ duration: 0.15 }}
            className="w-full max-w-lg bg-[#1C2333] border border-[#2B3245] rounded-xl shadow-2xl overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 px-4 py-3 border-b border-[#2B3245]">
              <Search className="w-5 h-5 text-[#9DA5B4] shrink-0" />
              <input
                ref={inputRef}
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search pages, projects, actions..."
                className="flex-1 bg-transparent text-sm text-white placeholder:text-[#9DA5B4]/60 outline-none"
              />
              <kbd className="hidden sm:flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-[#2B3245] text-[10px] text-[#9DA5B4]">
                ESC
              </kbd>
            </div>
            <div className="max-h-72 overflow-y-auto py-1">
              {results.length === 0 ? (
                <div className="py-8 text-center">
                  <Search className="w-8 h-8 text-[#9DA5B4]/30 mx-auto mb-2" />
                  <p className="text-sm text-[#9DA5B4]">No results for "{query}"</p>
                </div>
              ) : (
                <>
                  {query === "" && <p className="px-4 pt-2 pb-1 text-xs text-[#9DA5B4]/60">Quick Actions</p>}
                  {results.map((r, i) => (
                    <button
                      key={r.id}
                      onClick={() => navigate(r.href)}
                      onMouseEnter={() => setSelectedIndex(i)}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                        i === selectedIndex ? "bg-primary/10" : "hover:bg-white/5"
                      }`}
                    >
                      <div className="shrink-0 text-[#9DA5B4]">{r.icon}</div>
                      <div className="min-w-0 flex-1">
                        <span className="text-sm text-white/85">{r.title}</span>
                        {r.subtitle && <span className="ml-2 text-xs text-[#9DA5B4]">{r.subtitle}</span>}
                      </div>
                      {r.shortcut && (
                        <kbd className="px-1.5 py-0.5 rounded bg-[#2B3245] text-[10px] text-[#9DA5B4]">{r.shortcut}</kbd>
                      )}
                      {i === selectedIndex && (
                        <CornerDownLeft className="w-3.5 h-3.5 text-[#9DA5B4]/50 shrink-0" />
                      )}
                    </button>
                  ))}
                </>
              )}
            </div>
            <div className="flex items-center gap-4 px-4 py-2 border-t border-[#2B3245] text-xs text-[#9DA5B4]/50">
              <span className="flex items-center gap-1"><CornerDownLeft className="w-3 h-3" /> Select</span>
              <span>Arrow keys to navigate</span>
              <span className="ml-auto">ESC to close</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function SearchTrigger({ expanded }: { expanded: boolean }) {
  const handleClick = () => {
    window.dispatchEvent(new KeyboardEvent("keydown", { key: "k", metaKey: true }));
  };

  return (
    <button
      onClick={handleClick}
      className={`group relative flex items-center gap-2.5 px-2 py-1.5 rounded-lg transition-all text-white/50 hover:text-white/80 hover:bg-white/5 ${
        expanded ? "" : "justify-center"
      }`}
    >
      <div className="shrink-0 flex items-center justify-center w-[18px]">
        <Search className="w-[18px] h-[18px]" />
      </div>
      {expanded ? (
        <div className="flex items-center justify-between flex-1 min-w-0">
          <span className="text-[13px] font-medium">Search</span>
          <kbd className="text-[10px] text-[#9DA5B4] bg-[#2B3245] px-1.5 py-0.5 rounded">⌘K</kbd>
        </div>
      ) : (
        <div className="absolute left-full ml-2 px-2 py-1 rounded-md bg-[#2B3245] border border-[#3D4659] text-xs text-white whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 shadow-lg">
          Search (⌘K)
        </div>
      )}
    </button>
  );
}
