/**
 * OMNIMENS — Proprietary AI Platform
 * Copyright © 2024–2026 Alpha Unlimited Technologies. All Rights Reserved.
 * Chat Media Cards — InlineImageCard, Model3DCard, ArtifactCard, GameCard
 */
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Download, Expand, CheckCircle2, FileCode, Box, Film,
  Music, BarChart3, Shapes,
} from "lucide-react";
import type { GeneratedImage, Generated3DModel, GeneratedGame, Artifact } from "@/hooks/use-omnimens-chat";

// ── Inline image card (in chat messages) ──────────────────────────────────────

export function InlineImageCard({ image }: { image: GeneratedImage }) {
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
          {/* Spell correction badge — top-right corner of image */}
          {image.spellCorrected && image.spellCorrections && image.spellCorrections.length > 0 && (
            <div className="absolute top-2 right-2 z-10 group/badge">
              <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-teal-500/90 border border-teal-300/50 shadow-lg backdrop-blur-sm cursor-default">
                <CheckCircle2 className="w-3 h-3 text-white" />
                <span className="text-[9px] font-bold text-white tracking-wide uppercase">Spell Fixed</span>
              </div>
              {/* Tooltip on hover */}
              <div className="absolute top-full right-0 mt-1 w-48 hidden group-hover/badge:block z-20">
                <div className="bg-black/90 border border-teal-400/30 rounded-lg px-3 py-2 text-[9px] font-mono">
                  <p className="text-teal-400 font-bold mb-1 uppercase tracking-widest">Corrections</p>
                  {image.spellCorrections.map((c, i) => (
                    <p key={i} className="text-white/70">"{c.original}" → "{c.corrected}"</p>
                  ))}
                </div>
              </div>
            </div>
          )}
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

export function Model3DCard({ model }: { model: Generated3DModel }) {
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
    let href = dataUrl;
    let blobUrl: string | null = null;
    if (dataUrl.startsWith("data:")) {
      const [header, b64] = dataUrl.split(",");
      const mime = header.replace("data:", "").replace(";base64", "");
      const binary = atob(b64);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
      const blob = new Blob([bytes], { type: mime });
      blobUrl = URL.createObjectURL(blob);
      href = blobUrl;
    }
    const a = document.createElement("a");
    a.href = href;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    if (blobUrl) setTimeout(() => URL.revokeObjectURL(blobUrl!), 10000);
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

export function ArtifactCard({ artifact }: { artifact: Artifact }) {
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
    if (isHtml) {
      const decoded = atob(artifact.dataUrl.split(",")[1]);
      const contentBlob = new Blob([decoded], { type: "text/html" });
      const contentUrl = URL.createObjectURL(contentBlob);
      const wrapper = [
        "<!DOCTYPE html><html><head><meta charset='utf-8'>",
        "<title>OMNIMENS Artifact Preview</title>",
        "<style>*{margin:0;padding:0}html,body{width:100%;height:100%;overflow:hidden}",
        "iframe{width:100%;height:100%;border:none}</style></head><body>",
        `<iframe sandbox="allow-scripts" src="${contentUrl}"></iframe>`,
        "</body></html>"
      ].join("");
      const wrapperBlob = new Blob([wrapper], { type: "text/html" });
      const wrapperUrl = URL.createObjectURL(wrapperBlob);
      window.open(wrapperUrl, "_blank", "noopener,noreferrer");
      setTimeout(() => { URL.revokeObjectURL(wrapperUrl); URL.revokeObjectURL(contentUrl); }, 30000);
    } else {
      window.open(artifact.dataUrl, "_blank", "noopener,noreferrer");
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
export function GameCard({ game }: { game: GeneratedGame }) {
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
    let href = dataUrl;
    let blobUrl: string | null = null;
    if (dataUrl.startsWith("data:")) {
      const [header, b64] = dataUrl.split(",");
      const mime = header.replace("data:", "").replace(";base64", "");
      const binary = atob(b64);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
      const blob = new Blob([bytes], { type: mime });
      blobUrl = URL.createObjectURL(blob);
      href = blobUrl;
    }
    const a = document.createElement("a");
    a.href = href;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    if (blobUrl) setTimeout(() => URL.revokeObjectURL(blobUrl!), 10000);
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
