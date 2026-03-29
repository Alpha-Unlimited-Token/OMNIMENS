/**
 * OMNIMENS — Proprietary AI Platform
 * Copyright © 2024–2026 Alpha Unlimited Technologies. All Rights Reserved.
 * Chat Build Panel — DevActivityBar, SyntaxCodeView, DevRightPanel
 */
import React, { useState, useEffect, useRef, useMemo } from "react";
import DOMPurify from "dompurify";
import { motion, AnimatePresence } from "framer-motion";
import {
  Check, FileCode, FileText, FolderOpen, HardDrive, MemoryStick,
  MessageSquare, Monitor, Play, Rocket, Settings, Terminal, Wrench,
} from "lucide-react";
import hljs from "highlight.js/lib/core";
import hljsHtml from "highlight.js/lib/languages/xml";
import hljsJs from "highlight.js/lib/languages/javascript";
import hljsTs from "highlight.js/lib/languages/typescript";
import hljsPy from "highlight.js/lib/languages/python";
import hljsCss from "highlight.js/lib/languages/css";
import hljsJson from "highlight.js/lib/languages/json";
import hljsBash from "highlight.js/lib/languages/bash";

if (!hljs.getLanguage("html")) {
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
}

// ── Dev IDE Activity Bar ────────────────────────────────────────────────────────

export function DevActivityBar({
  activeTab,
  onSelect,
}: {
  activeTab: string;
  onSelect: (tab: string) => void;
}) {
  const { isLight } = useTheme();
  const panelBg  = isLight ? "#f0f1f6" : "#0D1117";
  const panelBdr = isLight ? "rgba(20,23,34,0.08)" : "rgba(255,255,255,0.06)";
  const iconActive = isLight ? "#141722" : "rgba(255,255,255,0.95)";
  const iconMuted  = isLight ? "rgba(20,23,34,0.4)" : "rgba(255,255,255,0.35)";

  const items = [
    { id: "chats",  icon: <MessageSquare className="w-[18px] h-[18px]" />, label: "Chats" },
    { id: "files",  icon: <HardDrive className="w-[18px] h-[18px]" />,     label: "Files" },
    { id: "tools",  icon: <Wrench className="w-[18px] h-[18px]" />,        label: "Tools" },
    { id: "memory", icon: <MemoryStick className="w-[18px] h-[18px]" />,   label: "Memory" },
    { id: "deploy", icon: <Rocket className="w-[18px] h-[18px]" />,        label: "Deploy" },
  ];
  return (
    <div
      className="shrink-0 flex flex-col items-center py-1.5 gap-0.5 border-r z-10"
      style={{ width: 48, background: panelBg, borderColor: panelBdr }}
    >
      {items.map(item => {
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            title={item.label}
            onClick={() => onSelect(item.id)}
            className="relative w-10 h-10 flex items-center justify-center transition-all shrink-0"
            style={{
              color: isActive ? iconActive : iconMuted,
            }}
          >
            {isActive && (
              <span
                className="absolute left-0 top-[20%] bottom-[20%] w-[2px] rounded-r"
                style={{ background: isLight ? "#141722" : "#fff" }}
              />
            )}
            {item.icon}
          </button>
        );
      })}
      <div className="flex-1" />
      <button
        title="Settings"
        onClick={() => onSelect("config")}
        className="w-10 h-10 flex items-center justify-center transition-all shrink-0"
        style={{ color: iconMuted }}
      >
        <Settings className="w-[16px] h-[16px]" />
      </button>
    </div>
  );
}

// ── Syntax-highlighted code block with line numbers ──────────────────────────

export function SyntaxCodeView({ lang, code, isLight }: { lang: string; code: string; isLight: boolean }) {
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
              <td className="pl-3 pr-2 align-top whitespace-pre" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(line || " ") }} />
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── Extract a smart description from code ────────────────────────────────────

export function getCodeLabel(lang: string, code: string): string {
  if (lang === "html" || lang === "xml") {
    const t = code.match(/<title[^>]*>([^<]+)<\/title>/i);
    if (t) return t[1].trim();
  }
  const c = code.match(/^(?:\/\/|#|<!--|\/\*)\s*(.+)/m);
  if (c) return c[1].replace(/\*\/|-->/, "").trim().slice(0, 60);
  const first = code.split("\n").find(l => l.trim());
  return (first || "").trim().slice(0, 60) || `${lang} snippet`;
}

export function getFilename(lang: string, label: string, index: number): string {
  const slug = label.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 28) || `file-${index + 1}`;
  const exts: Record<string, string> = { javascript: "js", js: "js", typescript: "ts", ts: "ts", tsx: "tsx", jsx: "jsx", python: "py", py: "py", html: "html", xml: "xml", css: "css", json: "json", bash: "sh", sh: "sh" };
  return `${slug}.${exts[lang] || lang || "txt"}`;
}

// ── Dev IDE Right Panel Tabs ─────────────────────────────────────────────────

export function DevRightPanel({
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
  const prevCountRef = useRef(0);
  useEffect(() => {
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

