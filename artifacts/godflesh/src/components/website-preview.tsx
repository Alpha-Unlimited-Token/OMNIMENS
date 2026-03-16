import { useState } from "react";
import { Download, Maximize2, Minimize2, Code2, ExternalLink } from "lucide-react";

interface WebsitePreviewProps {
  html: string;
  index?: number;
}

export function WebsitePreview({ html, index = 0 }: WebsitePreviewProps) {
  const [fullscreen, setFullscreen] = useState(false);
  const [tab, setTab] = useState<"preview" | "code">("preview");

  function download() {
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `omnimens-build-${index + 1}.html`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function openInTab() {
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank");
  }

  const previewContent = (
    <div className={`flex flex-col rounded-xl overflow-hidden border border-primary/30 bg-black shadow-[0_0_30px_rgba(204,0,0,0.1)] ${fullscreen ? "fixed inset-4 z-[200]" : "mt-3 w-full"}`}>
      {/* Toolbar */}
      <div className="flex items-center justify-between px-3 py-2 bg-black border-b border-white/10 shrink-0">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setTab("preview")}
            className={`px-3 py-1 rounded text-[11px] font-mono tracking-widest transition-colors ${tab === "preview" ? "bg-primary/20 text-primary border border-primary/40" : "text-white/40 hover:text-white/70"}`}
          >
            PREVIEW
          </button>
          <button
            onClick={() => setTab("code")}
            className={`px-3 py-1 rounded text-[11px] font-mono tracking-widest transition-colors flex items-center gap-1 ${tab === "code" ? "bg-primary/20 text-primary border border-primary/40" : "text-white/40 hover:text-white/70"}`}
          >
            <Code2 className="w-3 h-3" />
            SOURCE
          </button>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={openInTab}
            title="Open in new tab"
            className="p-1.5 text-white/40 hover:text-white/80 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={download}
            title="Download HTML"
            className="p-1.5 text-white/40 hover:text-primary transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setFullscreen((f) => !f)}
            title={fullscreen ? "Exit fullscreen" : "Fullscreen"}
            className="p-1.5 text-white/40 hover:text-white/80 transition-colors"
          >
            {fullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Content */}
      {tab === "preview" ? (
        <iframe
          srcDoc={html}
          sandbox="allow-scripts allow-same-origin allow-forms"
          className={`w-full bg-white border-0 ${fullscreen ? "flex-1" : "h-[480px]"}`}
          title={`OMNIMENS Build ${index + 1}`}
        />
      ) : (
        <pre className={`overflow-auto text-[11px] text-green-400 font-mono p-4 bg-black/80 leading-relaxed omnimens-scrollbar ${fullscreen ? "flex-1" : "h-[480px]"}`}>
          {html}
        </pre>
      )}
    </div>
  );

  return previewContent;
}

/**
 * Parse an OMNIMENS message and extract HTML code blocks.
 * Returns an array of segments: plain text or html.
 */
export function parseMessageSegments(content: string): Array<{ type: "text"; value: string } | { type: "html"; value: string }> {
  const segments: Array<{ type: "text"; value: string } | { type: "html"; value: string }> = [];
  const regex = /```html\n?([\s\S]*?)```/gi;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(content)) !== null) {
    if (match.index > lastIndex) {
      const text = content.slice(lastIndex, match.index).trim();
      if (text) segments.push({ type: "text", value: text });
    }
    segments.push({ type: "html", value: match[1].trim() });
    lastIndex = match.index + match[0].length;
  }

  const remaining = content.slice(lastIndex).trim();
  if (remaining) segments.push({ type: "text", value: remaining });

  return segments;
}
