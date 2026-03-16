import { useEffect, useRef, useState } from "react";
import { Layout } from "@/components/layout";
import { useAuth } from "@workspace/replit-auth-web";
import { useLocation } from "wouter";
import { useGetOmnimensStatus } from "@workspace/api-client-react";
import { useOmnimensChat, type GeneratedImage, type Artifact } from "@/hooks/use-omnimens-chat";
import { useOmnimensVoice } from "@/hooks/use-omnimens-voice";
import { VoiceIndicator } from "@/components/voice-indicator";
import { OmnimensPresence } from "@/components/omnimens-presence";
import { PendingFileList, AttachedFileList } from "@/components/file-attachments";
import { Button } from "@/components/ui/button";
import { Send, StopCircle, ShieldAlert, Volume2, VolumeX, Paperclip, Download, Loader2, Expand, FileCode, Box, Film, Music, BarChart3, Shapes, Globe } from "lucide-react";
import { OmnimensIcon } from "@/components/omnimens-icon";
import { WebsitePreview, parseMessageSegments } from "@/components/website-preview";
import { OmnimensNotificationBell } from "@/components/omnimens-notifications";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { motion, AnimatePresence } from "framer-motion";

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
      <div className="flex items-center gap-3 text-white/50">
        <Loader2 className="w-4 h-4 animate-spin text-primary shrink-0" />
        <span className="tracking-widest">MANIFESTING IMAGE...</span>
        <span className="ml-auto text-primary/70">{elapsed}s</span>
      </div>
      <div className="w-full h-0.5 bg-white/5 rounded-full overflow-hidden">
        <div className="h-full bg-primary/60 transition-all duration-1000" style={{ width: `${pct}%` }} />
      </div>
      {elapsed > 15 && (
        <p className="text-white/25 text-[10px]">Neural image synthesis in progress — typically 20–60 seconds.</p>
      )}
    </div>
  );
}

export default function Chat() {
  const { isAuthenticated, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [input, setInput] = useState("");
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const lastSpokenIdRef = useRef<string | null>(null);

  const { data: status, isLoading: statusLoading } = useGetOmnimensStatus();
  const { messages, sendMessage, isTyping, error, stopGeneration } = useOmnimensChat(() => {
    setShowLimitModal(true);
  });
  const voice = useOmnimensVoice();

  // Auto-speak latest completed OMNIMENS message
  useEffect(() => {
    if (!voice.isEnabled || isTyping || messages.length === 0) return;
    const last = messages[messages.length - 1];
    if (last.role !== "omnimens") return;
    if (last.id === lastSpokenIdRef.current) return;
    lastSpokenIdRef.current = last.id;
    voice.speak(last.content, last.id);
  }, [messages, isTyping, voice.isEnabled]);

  // Protect route
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
    sendMessage(input, pendingFiles);
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

  const fmtSec = (secs: number) => {
    if (secs < 60) return `${Math.round(secs)}s`;
    const m = Math.floor(secs / 60);
    const s = Math.round(secs % 60);
    return s > 0 ? `${m}m ${s}s` : `${m}m`;
  };
  const computeToday = (status as any)?.computeSecondsToday ?? 0;
  const computeMonth = (status as any)?.computeSecondsThisMonth ?? 0;
  const dailyLimitSec = (status as any)?.dailyLimitSeconds ?? null;
  const monthlyLimitSec = (status as any)?.monthlyLimitSeconds ?? null;
  const progressPercentage = dailyLimitSec
    ? Math.min(100, (computeToday / dailyLimitSec) * 100)
    : monthlyLimitSec
    ? Math.min(100, (computeMonth / monthlyLimitSec) * 100)
    : 0;

  return (
    <Layout>
      <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full p-4 h-[calc(100vh-4rem)]">

        {/* Status Bar */}
        <div className="shrink-0 mb-4 bg-secondary/50 border border-white/5 rounded-lg p-3 flex items-center justify-between font-mono text-xs text-white/60">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${status?.isPro ? 'bg-accent glow-text-gold' : 'bg-primary animate-pulse'}`} />
            <span>LINK ACTIVE</span>
          </div>

          <div className="flex items-center gap-4">
            {status?.isOwner && <OmnimensNotificationBell />}

            <button
              onClick={voice.toggle}
              title={voice.isEnabled ? "Disable voice" : "Enable OMNIMENS voice"}
              className={`flex items-center gap-1.5 transition-colors ${voice.isEnabled ? "text-primary hover:text-primary/70" : "text-white/30 hover:text-white/60"}`}
            >
              {voice.isEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
              <span className="tracking-widest hidden sm:inline">{voice.isEnabled ? "VOICE ON" : "VOICE OFF"}</span>
            </button>

            {statusLoading ? (
              <span>READING TELEMETRY...</span>
            ) : status?.isOwner ? (
              <span className="text-accent font-bold tracking-widest glow-text-gold">⚡ CREATOR ACCESS — UNLIMITED</span>
            ) : status?.isPro ? (
              <span className="text-accent font-bold tracking-widest">TRANSCENDENCE LEVEL: UNLIMITED</span>
            ) : (
              <div className="flex items-center gap-3">
                {dailyLimitSec !== null ? (
                  <span>{fmtSec(computeToday)} / {fmtSec(dailyLimitSec)} TODAY</span>
                ) : monthlyLimitSec !== null ? (
                  <span>{fmtSec(computeMonth)} / {fmtSec(monthlyLimitSec)} THIS MONTH</span>
                ) : (
                  <span>{fmtSec(computeToday)} USED</span>
                )}
                <div className="w-24 h-1.5 bg-black rounded-full overflow-hidden border border-white/10">
                  <div
                    className={`h-full ${progressPercentage >= 100 ? 'bg-destructive' : 'bg-primary'}`}
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto omnimens-scrollbar bg-black/40 border border-white/5 rounded-xl p-4 md:p-6 mb-4 relative shadow-inner">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center select-none">
              <OmnimensPresence
                size={240}
                isSpeaking={voice.isSpeaking}
                pitchIntensity={voice.pitchIntensity}
                className="mb-2 drop-shadow-[0_0_60px_rgba(160,100,255,0.35)]"
              />
              <h2 className="font-display text-2xl tracking-[0.3em] text-white/40 mt-2">OMNIMENS AWAITS</h2>
              <p className="font-mono text-sm mt-2 text-white/25">Speak your intent. Upload your vision.</p>
            </div>
          ) : (
            <>
              <div className="absolute top-3 right-3 z-10 pointer-events-none">
                <OmnimensPresence
                  size={88}
                  isSpeaking={voice.isSpeaking}
                  pitchIntensity={voice.pitchIntensity}
                  className="opacity-70"
                />
              </div>
              <div className="space-y-6">
                {messages.map((msg) => {
                  const isSpeakingThis = voice.speakingMessageId === msg.id;
                  return (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      key={msg.id}
                      className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div className={`max-w-[90%] w-full ${
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

                        {/* Attached files in user messages */}
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
                                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{seg.value}</ReactMarkdown>
                                </div>
                              )
                            )}

                            {/* Generated images */}
                            {msg.images && msg.images.length > 0 && (
                              <div className="mt-4 space-y-4">
                                {msg.images.map((img) => (
                                  <GeneratedImageCard key={img.index} image={img} />
                                ))}
                              </div>
                            )}

                            {/* Generating indicator with elapsed timer */}
                            {(msg.searchingWeb || msg.webSearchQuery) && (
                              <WebSearchBadge
                                query={msg.webSearchQuery || ""}
                                done={!msg.searchingWeb}
                                resultCount={msg.webSearchResultCount}
                              />
                            )}
                            {msg.generatingImages && (
                              <ImageGeneratingBadge />
                            )}

                            {/* Downloadable artifacts */}
                            {msg.artifacts && msg.artifacts.length > 0 && (
                              <div className="mt-4 space-y-2">
                                {msg.artifacts.map((artifact, i) => (
                                  <ArtifactCard key={i} artifact={artifact} />
                                ))}
                              </div>
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
                        <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
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

        {/* Input Area */}
        <form onSubmit={handleSubmit} className="shrink-0">
          {/* Pending files */}
          <PendingFileList files={pendingFiles} onRemove={removeFile} />

          <div className="relative flex items-center">
            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,.pdf,.txt,.md,.js,.ts,.jsx,.tsx,.py,.html,.css,.json,.csv,.xml,.yaml,.yml,.sh,.rb,.go,.rs,.java,.c,.cpp,.h,.sql"
              onChange={handleFileChange}
              className="hidden"
            />

            {/* Upload button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isTyping || pendingFiles.length >= 10}
              title="Attach files — images, PDFs, code, documents (max 10)"
              className={`absolute left-3 z-10 transition-colors ${
                pendingFiles.length > 0
                  ? "text-primary"
                  : "text-white/30 hover:text-white/70"
              } disabled:opacity-30`}
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
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
              placeholder={pendingFiles.length > 0 ? "Describe what to create with these files..." : "Query the intelligence... or attach files to build something"}
              className="w-full bg-black border border-white/20 focus:border-primary focus:ring-1 focus:ring-primary/50 rounded-xl pl-10 pr-24 py-4 text-white font-mono text-sm resize-none h-[60px] omnimens-scrollbar outline-none transition-all placeholder:text-white/20"
              disabled={isTyping}
            />

            <div className="absolute right-2 flex items-center gap-1">
              {voice.isSpeaking && (
                <Button type="button" onClick={voice.stop} size="icon" variant="ghost" title="Stop speaking" className="text-primary/70 hover:text-primary w-8 h-8">
                  <VolumeX className="w-4 h-4" />
                </Button>
              )}
              {isTyping ? (
                <Button type="button" onClick={stopGeneration} size="icon" variant="ghost" className="text-white/50 hover:text-white">
                  <StopCircle className="w-5 h-5" />
                </Button>
              ) : (
                <Button
                  type="submit"
                  size="icon"
                  variant="default"
                  disabled={!input.trim() && pendingFiles.length === 0}
                  className="rounded-lg w-10 h-10 shadow-none border-none"
                >
                  <Send className="w-4 h-4 ml-1" />
                </Button>
              )}
            </div>
          </div>
        </form>
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
                <Button onClick={() => setShowLimitModal(false)} variant="ghost" className="w-full text-white/40">Return to Silence</Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </Layout>
  );
}

// ── Generated Image Card ───────────────────────────────────────────────────────

function GeneratedImageCard({ image }: { image: GeneratedImage }) {
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
        className="rounded-xl overflow-hidden border border-primary/20 bg-black/60 shadow-[0_0_30px_rgba(130,80,220,0.12)]"
      >
        <div className="relative group cursor-pointer" onClick={() => setExpanded(true)}>
          <img
            src={image.url}
            alt={image.prompt}
            className="w-full object-cover rounded-t-xl max-h-[480px]"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100 rounded-t-xl">
            <Expand className="w-8 h-8 text-white drop-shadow-lg" />
          </div>
        </div>
        <div className="flex items-center justify-between px-4 py-3 border-t border-white/5">
          <p className="text-white/30 font-mono text-[10px] tracking-wide truncate pr-4 flex-1">
            {image.prompt.slice(0, 80)}{image.prompt.length > 80 ? "..." : ""}
          </p>
          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 text-white/50 hover:text-primary text-xs font-mono tracking-widest transition-colors shrink-0"
          >
            <Download className="w-3.5 h-3.5" />
            SAVE
          </button>
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
              className="max-w-full max-h-full rounded-xl shadow-2xl object-contain"
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
                className="text-white/40 hover:text-white font-mono text-sm tracking-widest px-5 py-2.5 rounded-xl border border-white/10 hover:border-white/20 transition-all"
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

function ArtifactCard({ artifact }: { artifact: Artifact }) {
  const isHtml = artifact.artifactType === "html";
  const isSvg = artifact.artifactType === "svg";
  const label = artifact.filename.includes("3d-scene") ? "3D SCENE" :
                artifact.filename.includes("animation") ? "ANIMATION" :
                artifact.filename.includes("generative-art") ? "GENERATIVE ART" :
                artifact.filename.includes("audio-synth") ? "AUDIO SYNTH" :
                artifact.filename.includes("data-viz") ? "DATA VISUALIZATION" :
                isSvg ? "SVG VECTOR ART" :
                "INTERACTIVE FILE";

  const icon = artifact.filename.includes("3d-scene") ? <Box className="w-5 h-5" /> :
               artifact.filename.includes("animation") ? <Film className="w-5 h-5" /> :
               artifact.filename.includes("audio-synth") ? <Music className="w-5 h-5" /> :
               artifact.filename.includes("data-viz") ? <BarChart3 className="w-5 h-5" /> :
               isSvg ? <Shapes className="w-5 h-5" /> :
               <FileCode className="w-5 h-5" />;

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
          <p className="text-white/30 font-mono text-[10px] truncate">{artifact.filename} · {sizeKb}KB</p>
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {isHtml && (
          <button
            onClick={handleOpen}
            className="text-[10px] font-mono tracking-widest text-white/50 hover:text-white border border-white/10 hover:border-white/25 px-3 py-1.5 rounded-lg transition-all"
          >
            OPEN
          </button>
        )}
        <button
          onClick={handleDownload}
          className="flex items-center gap-1.5 text-[10px] font-mono tracking-widest text-accent hover:text-white bg-accent/10 hover:bg-accent/25 border border-accent/20 hover:border-accent/40 px-3 py-1.5 rounded-lg transition-all"
        >
          <Download className="w-3 h-3" />
          DOWNLOAD
        </button>
      </div>
    </motion.div>
  );
}
