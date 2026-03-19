/**
 * OMNIMENS — Proprietary AI Platform
 * Copyright © 2024–2026 Alpha Unlimited Technologies, LLC. All Rights Reserved.
 * Unauthorized reproduction, distribution, or use is strictly prohibited.
 */

import { X, FileText, FileCode, FileImage, File } from "lucide-react";
import type { AttachedFile } from "@/hooks/use-omnimens-chat";

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}

function FileIcon({ type, name }: { type: string; name: string }) {
  if (type.startsWith("image/")) return <FileImage className="w-4 h-4 text-blue-400" />;
  if (type === "application/pdf") return <FileText className="w-4 h-4 text-red-400" />;
  const ext = name.split(".").pop()?.toLowerCase();
  if (["js","ts","py","html","css","json","jsx","tsx","go","rs","java"].includes(ext || "")) {
    return <FileCode className="w-4 h-4 text-green-400" />;
  }
  return <File className="w-4 h-4 text-white" />;
}

// Shown in the INPUT AREA before sending — with remove buttons
interface PendingFilesProps {
  files: File[];
  onRemove: (index: number) => void;
}

export function PendingFileList({ files, onRemove }: PendingFilesProps) {
  if (files.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-2 px-1 pb-2">
      {files.map((f, i) => {
        const isImage = f.type.startsWith("image/");
        const previewUrl = isImage ? URL.createObjectURL(f) : null;
        return (
          <div
            key={i}
            className="relative flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 max-w-[180px] group"
          >
            {previewUrl ? (
              <img src={previewUrl} className="w-8 h-8 rounded object-cover shrink-0" alt={f.name} />
            ) : (
              <FileIcon type={f.type} name={f.name} />
            )}
            <div className="min-w-0">
              <p className="text-[10px] text-white/70 font-mono truncate">{f.name}</p>
              <p className="text-[9px] text-white/75 font-mono">{formatBytes(f.size)}</p>
            </div>
            <button
              onClick={() => onRemove(i)}
              className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-black border border-white/20 flex items-center justify-center text-white hover:text-white hover:border-primary transition-colors opacity-0 group-hover:opacity-100"
            >
              <X className="w-2.5 h-2.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}

// Shown INSIDE a sent message — compact read-only previews
interface AttachedFilesProps {
  files: AttachedFile[];
}

export function AttachedFileList({ files }: AttachedFilesProps) {
  if (!files || files.length === 0) return null;

  const images = files.filter((f) => f.type.startsWith("image/") && f.preview);
  const others = files.filter((f) => !f.type.startsWith("image/") || !f.preview);

  return (
    <div className="mb-2 space-y-1">
      {images.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {images.map((f, i) => (
            <img
              key={i}
              src={f.preview}
              alt={f.name}
              className="max-h-48 max-w-[240px] rounded-lg border border-white/20 object-cover"
            />
          ))}
        </div>
      )}
      {others.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {others.map((f, i) => (
            <div
              key={i}
              className="flex items-center gap-1.5 bg-white/5 border border-white/10 rounded px-2 py-1"
            >
              <FileIcon type={f.type} name={f.name} />
              <span className="text-[10px] font-mono text-white/60 truncate max-w-[120px]">{f.name}</span>
              <span className="text-[9px] font-mono text-white/75">{formatBytes(f.size)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
