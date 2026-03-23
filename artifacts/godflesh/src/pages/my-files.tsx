import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@workspace/replit-auth-web";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  Image, Video, Gamepad2, Box, FileCode, Music, FileText,
  Download, Trash2, Eye, Loader2, Search, Filter,
  ChevronLeft, HardDrive, Calendar, X, ExternalLink, RefreshCw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SEO } from "@/components/seo";

type UserFile = {
  id: number;
  userId: string;
  conversationId: number | null;
  projectId: number | null;
  filename: string;
  fileType: string;
  mimeType: string;
  fileSize: number;
  storageKey: string;
  prompt: string | null;
  metadata: string | null;
  createdAt: string;
};

type FileStats = {
  totalFiles: number;
  totalSizeBytes: number;
  byType: Record<string, number>;
};

const FILE_TYPE_CONFIG: Record<string, { icon: typeof Image; label: string; color: string }> = {
  image: { icon: Image, label: "Images", color: "#a855f7" },
  video: { icon: Video, label: "Videos", color: "#3b82f6" },
  "3d_model": { icon: Box, label: "3D Models", color: "#22c55e" },
  game: { icon: Gamepad2, label: "Games", color: "#f59e0b" },
  code: { icon: FileCode, label: "Code", color: "#06b6d4" },
  audio: { icon: Music, label: "Audio", color: "#ec4899" },
};

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: d.getFullYear() !== now.getFullYear() ? "numeric" : undefined });
}

function FilePreview({ file, onClose }: { file: UserFile; onClose: () => void }) {
  const downloadUrl = `/api/omnimens/files/${file.id}/download`;
  const inlineUrl = `${downloadUrl}?inline=true`;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="relative max-w-4xl max-h-[90vh] w-full mx-4 rounded-2xl overflow-hidden bg-[#1C2333] border border-white/10"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-mono text-white truncate">{file.filename}</h3>
            <p className="text-[10px] text-white/50 mt-0.5">{formatBytes(file.fileSize)} · {formatDate(file.createdAt)}</p>
          </div>
          <div className="flex items-center gap-2 ml-3">
            <a
              href={downloadUrl}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 hover:text-white text-xs transition-colors"
            >
              <Download className="w-3.5 h-3.5" /> Download
            </a>
            <button type="button" onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10 text-white/50 hover:text-white transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="p-4 max-h-[calc(90vh-80px)] overflow-auto flex items-center justify-center">
          {file.fileType === "image" && (
            <img src={inlineUrl} alt={file.filename} className="max-w-full max-h-[70vh] rounded-lg object-contain" />
          )}
          {file.fileType === "video" && (
            <video src={inlineUrl} controls className="max-w-full max-h-[70vh] rounded-lg" />
          )}
          {file.fileType === "audio" && (
            <div className="w-full max-w-lg p-8 rounded-xl bg-white/5">
              <Music className="w-16 h-16 text-pink-400 mx-auto mb-4" />
              <p className="text-center text-white/70 text-sm mb-4">{file.filename}</p>
              <audio src={inlineUrl} controls className="w-full" />
            </div>
          )}
          {(file.fileType === "3d_model" || file.fileType === "game" || file.fileType === "code") && (
            <div className="text-center p-8">
              {file.fileType === "3d_model" && <Box className="w-16 h-16 text-green-400 mx-auto mb-4" />}
              {file.fileType === "game" && <Gamepad2 className="w-16 h-16 text-amber-400 mx-auto mb-4" />}
              {file.fileType === "code" && <FileCode className="w-16 h-16 text-cyan-400 mx-auto mb-4" />}
              <p className="text-white/70 text-sm mb-2">{file.filename}</p>
              <p className="text-white/40 text-xs mb-4">{formatBytes(file.fileSize)}</p>
              <a
                href={downloadUrl}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/20 hover:bg-primary/30 text-primary text-sm transition-colors"
              >
                <Download className="w-4 h-4" /> Download File
              </a>
            </div>
          )}
        </div>

        {file.prompt && (
          <div className="px-4 py-3 border-t border-white/10">
            <p className="text-[10px] text-white/40 mb-1">PROMPT</p>
            <p className="text-xs text-white/60 line-clamp-2">{file.prompt}</p>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

export default function MyFiles() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [, navigate] = useLocation();
  const [files, setFiles] = useState<UserFile[]>([]);
  const [stats, setStats] = useState<FileStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [previewFile, setPreviewFile] = useState<UserFile | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const fetchFiles = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (activeFilter) params.set("type", activeFilter);
      params.set("limit", "100");
      const res = await fetch(`/api/omnimens/files?${params}`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch files");
      const data = await res.json();
      setFiles(data.files || []);
      setStats(data.stats || null);
    } catch (err) {
      console.error("Failed to load files:", err);
    } finally {
      setLoading(false);
    }
  }, [activeFilter]);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate("/login");
      return;
    }
    if (isAuthenticated) fetchFiles();
  }, [isAuthenticated, authLoading, fetchFiles, navigate]);

  const handleDelete = async (fileId: number) => {
    if (!confirm("Delete this file? This cannot be undone.")) return;
    setDeletingId(fileId);
    try {
      const res = await fetch(`/api/omnimens/files/${fileId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) {
        setFiles((prev) => prev.filter((f) => f.id !== fileId));
        if (stats) {
          const deleted = files.find((f) => f.id === fileId);
          if (deleted) {
            setStats({
              ...stats,
              totalFiles: stats.totalFiles - 1,
              totalSizeBytes: stats.totalSizeBytes - deleted.fileSize,
            });
          }
        }
      }
    } catch (err) {
      console.error("Failed to delete:", err);
    } finally {
      setDeletingId(null);
    }
  };

  const filtered = files.filter((f) => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return f.filename.toLowerCase().includes(q) || (f.prompt?.toLowerCase().includes(q));
    }
    return true;
  });

  const typeFilters = Object.entries(FILE_TYPE_CONFIG).filter(
    ([key]) => !stats || (stats.byType[key] && stats.byType[key] > 0),
  );

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0E1525]">
        <Loader2 className="w-6 h-6 animate-spin text-white/30" />
      </div>
    );
  }

  return (
    <>
      <SEO title="My Files" description="All your saved files, images, videos, 3D models, and more." path="/files" />

      <div className="min-h-screen bg-[#0E1525] text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 pb-24">
          <div className="flex items-center gap-3 mb-6">
            <button type="button" onClick={() => navigate("/")} className="p-1.5 rounded-lg hover:bg-white/5 text-white/40 hover:text-white transition-colors">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="flex-1">
              <h1 className="text-xl font-bold tracking-tight">My Files</h1>
              <p className="text-xs text-white/40 mt-0.5">
                Everything OMNIMENS has created for you — auto-saved and always available
              </p>
            </div>
            <button type="button" onClick={fetchFiles} className="p-2 rounded-lg hover:bg-white/5 text-white/40 hover:text-white transition-colors">
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>

          {stats && stats.totalFiles > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              <div className="rounded-xl bg-[#1C2333] border border-white/8 p-3">
                <div className="flex items-center gap-2 text-white/40 mb-1">
                  <FileText className="w-3.5 h-3.5" />
                  <span className="text-[10px] font-mono">TOTAL FILES</span>
                </div>
                <p className="text-lg font-bold">{stats.totalFiles}</p>
              </div>
              <div className="rounded-xl bg-[#1C2333] border border-white/8 p-3">
                <div className="flex items-center gap-2 text-white/40 mb-1">
                  <HardDrive className="w-3.5 h-3.5" />
                  <span className="text-[10px] font-mono">STORAGE</span>
                </div>
                <p className="text-lg font-bold">{formatBytes(stats.totalSizeBytes)}</p>
              </div>
              {Object.entries(stats.byType).slice(0, 2).map(([type, count]) => {
                const cfg = FILE_TYPE_CONFIG[type];
                const Icon = cfg?.icon || FileText;
                return (
                  <div key={type} className="rounded-xl bg-[#1C2333] border border-white/8 p-3">
                    <div className="flex items-center gap-2 text-white/40 mb-1">
                      <Icon className="w-3.5 h-3.5" style={{ color: cfg?.color }} />
                      <span className="text-[10px] font-mono">{cfg?.label?.toUpperCase() || type.toUpperCase()}</span>
                    </div>
                    <p className="text-lg font-bold">{count}</p>
                  </div>
                );
              })}
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search files..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#1C2333] border border-white/8 text-sm text-white placeholder-white/30 focus:outline-none focus:border-primary/50 transition-colors"
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
              <button
                type="button"
                onClick={() => setActiveFilter(null)}
                className={`shrink-0 px-3 py-2 rounded-lg text-xs font-mono transition-colors ${!activeFilter ? "bg-primary/20 text-primary border border-primary/30" : "bg-white/5 text-white/50 hover:text-white border border-white/8"}`}
              >
                All
              </button>
              {typeFilters.map(([key, cfg]) => {
                const Icon = cfg.icon;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setActiveFilter(activeFilter === key ? null : key)}
                    className={`shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-mono transition-colors ${activeFilter === key ? "bg-primary/20 text-primary border border-primary/30" : "bg-white/5 text-white/50 hover:text-white border border-white/8"}`}
                  >
                    <Icon className="w-3 h-3" style={{ color: cfg.color }} />
                    {cfg.label}
                  </button>
                );
              })}
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-6 h-6 animate-spin text-white/30" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <HardDrive className="w-12 h-12 text-white/10 mb-3" />
              <p className="text-white/40 text-sm mb-1">
                {files.length === 0 ? "No files yet" : "No matching files"}
              </p>
              <p className="text-white/25 text-xs max-w-sm">
                {files.length === 0
                  ? "When you create images, videos, 3D models, games, or other content with OMNIMENS, they'll automatically be saved here."
                  : "Try adjusting your search or filters."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <AnimatePresence mode="popLayout">
                {filtered.map((file) => {
                  const cfg = FILE_TYPE_CONFIG[file.fileType] || { icon: FileText, label: file.fileType, color: "#9DA5B4" };
                  const Icon = cfg.icon;
                  const isImage = file.fileType === "image";
                  const isDeleting = deletingId === file.id;

                  return (
                    <motion.div
                      key={file.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="group rounded-xl bg-[#1C2333] border border-white/8 hover:border-white/15 transition-all overflow-hidden"
                    >
                      <div
                        className="relative cursor-pointer"
                        onClick={() => setPreviewFile(file)}
                      >
                        {isImage ? (
                          <div className="h-40 bg-black/20 flex items-center justify-center overflow-hidden">
                            <img
                              src={`/api/omnimens/files/${file.id}/download?inline=true`}
                              alt={file.filename}
                              className="w-full h-full object-cover"
                              loading="lazy"
                            />
                          </div>
                        ) : (
                          <div className="h-40 flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${cfg.color}08, ${cfg.color}15)` }}>
                            <Icon className="w-12 h-12" style={{ color: cfg.color, opacity: 0.5 }} />
                          </div>
                        )}

                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                          <Eye className="w-6 h-6 text-white" />
                        </div>
                      </div>

                      <div className="p-3">
                        <div className="flex items-start gap-2 mb-2">
                          <Icon className="w-3.5 h-3.5 shrink-0 mt-0.5" style={{ color: cfg.color }} />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-mono text-white/85 truncate">{file.filename}</p>
                            <div className="flex items-center gap-2 text-[10px] text-white/35 mt-0.5">
                              <span>{formatBytes(file.fileSize)}</span>
                              <span>·</span>
                              <span>{formatDate(file.createdAt)}</span>
                            </div>
                          </div>
                        </div>

                        {file.prompt && (
                          <p className="text-[10px] text-white/30 line-clamp-1 mb-2 pl-5.5">{file.prompt}</p>
                        )}

                        <div className="flex items-center gap-2 pt-2 border-t border-white/5">
                          <button
                            type="button"
                            onClick={() => setPreviewFile(file)}
                            className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/50 hover:text-white text-[10px] transition-colors"
                          >
                            <Eye className="w-3 h-3" /> View
                          </button>
                          <a
                            href={`/api/omnimens/files/${file.id}/download`}
                            className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/50 hover:text-white text-[10px] transition-colors"
                          >
                            <Download className="w-3 h-3" /> Download
                          </a>
                          <button
                            type="button"
                            onClick={() => handleDelete(file.id)}
                            disabled={isDeleting}
                            className="p-1.5 rounded-lg hover:bg-red-500/10 text-white/20 hover:text-red-400 transition-colors disabled:opacity-50"
                          >
                            {isDeleting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {previewFile && (
          <FilePreview file={previewFile} onClose={() => setPreviewFile(null)} />
        )}
      </AnimatePresence>
    </>
  );
}
