/**
 * OMNIMENS — Proprietary AI Platform
 * Copyright © 2024–2026 Alpha Unlimited Technologies. All Rights Reserved.
 * Chat Sidebar — LeftPanel
 */
import React, { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  Brain, Check, ChevronRight, Cpu, Database, Download, ExternalLink,
  Eye, File, FolderOpen, Globe, HardDrive, Image, KeyRound, Layers,
  Loader2, Lock, MemoryStick, MessageSquare, Microscope, Moon,
  PersonStanding, Plus, PlusCircle, RefreshCw, Rocket, Search,
  Settings, ShieldCheck, Sparkles, Star, Sun, Trash2, Unlock,
  Upload, Wand2, Wrench, X, Zap, Record,
} from "lucide-react";
import { usePwaInstall } from "@/hooks/use-pwa-install";
import { PERSONA_ICONS, PERSONA_NAMES, PERSONA_DESC, OMNIMENS_SKILLS, type ActiveProject } from "./chat-badges";
import { DesktopDeployPanel } from "./chat-deploy-panels";

// ── Left Panel ─────────────────────────────────────────────────────────────────

export function LeftPanel({
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
      setDeployStatus({ status: "live", url: "https://omnimens-ai.com/", domain: "omnimens-ai.com" });
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
              <a href={`${window.location.origin}/projects`} className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-[10px] font-mono font-bold tracking-wider border border-white/10 text-white/85 hover:text-white/70 hover:border-white/20 transition-all">
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
                <a href={`${window.location.origin}/pricing`}
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
                    <a key={pack.name} href={`${window.location.origin}/pricing`}
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

