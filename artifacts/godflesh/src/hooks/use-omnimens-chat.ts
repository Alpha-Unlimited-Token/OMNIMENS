import { useState, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { getGetOmnimensStatusQueryKey } from "@workspace/api-client-react";

export type GeneratedImage = {
  url: string;
  prompt: string;
  index: number;
};

export type Artifact = {
  artifactType: "html" | "svg" | "image" | "zip";
  filename: string;
  dataUrl: string;
  size: number;
};

export type CostBreakdown = {
  actualCostUSD: number;
  chargedCostUSD: number;
  markup: number;
  tokens: { prompt_tokens: number; completion_tokens: number } | null;
  imagesGenerated: number;
};

export type Message = {
  id: string;
  role: "user" | "omnimens";
  content: string;
  files?: AttachedFile[];
  images?: GeneratedImage[];
  generatingImages?: boolean;
  artifacts?: Artifact[];
  searchingWeb?: boolean;
  webSearchQuery?: string;
  webSearchResultCount?: number;
  analyzingUrls?: boolean;
  urlCount?: number;
  creditCost?: number;
  costBreakdown?: CostBreakdown;
};

export type AttachedFile = {
  name: string;
  type: string;
  size: number;
  preview?: string;
};

export function useOmnimensChat(onLimitReached: () => void) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const abortControllerRef = useRef<AbortController | null>(null);

  const sendMessage = async (content: string, files: File[] = []) => {
    if (!content.trim() && files.length === 0) return;
    if (isTyping) return;

    const userMsgId = Date.now().toString();
    const assistantMsgId = (Date.now() + 1).toString();

    const attachedFiles: AttachedFile[] = await Promise.all(
      files.map(async (f) => {
        const base: AttachedFile = { name: f.name, type: f.type, size: f.size };
        if (f.type.startsWith("image/")) {
          base.preview = await new Promise<string>((res) => {
            const reader = new FileReader();
            reader.onload = (e) => res(e.target?.result as string);
            reader.readAsDataURL(f);
          });
        }
        return base;
      })
    );

    setMessages((prev) => [
      ...prev,
      { id: userMsgId, role: "user", content, files: attachedFiles.length ? attachedFiles : undefined },
    ]);
    setIsTyping(true);
    setError(null);

    abortControllerRef.current = new AbortController();

    try {
      const history = messages.slice(-10).map((m) => ({
        role: m.role === "user" ? "user" : "assistant",
        content: m.content,
      }));

      const form = new FormData();
      form.append("message", content);
      form.append("history", JSON.stringify(history));
      for (const file of files) {
        form.append("files", file);
      }

      const res = await fetch("/api/omnimens/chat", {
        method: "POST",
        body: form,
        signal: abortControllerRef.current.signal,
      });

      if (!res.ok) {
        if (res.status === 403) {
          onLimitReached();
          setMessages((prev) => prev.filter((m) => m.id !== userMsgId));
          setIsTyping(false);
          return;
        }
        throw new Error("Failed to communicate with OMNIMENS");
      }

      if (!res.body) throw new Error("No response body");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let assistantContent = "";

      setMessages((prev) => [...prev, { id: assistantMsgId, role: "omnimens", content: "" }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.slice(6));

              if (data.type === "chunk") {
                assistantContent += data.content;
                setMessages((prev) => {
                  const newMsgs = [...prev];
                  const lastMsg = newMsgs[newMsgs.length - 1];
                  if (lastMsg?.role === "omnimens") {
                    lastMsg.content = assistantContent;
                  }
                  return newMsgs;
                });

              } else if (data.type === "content_update") {
                // Server stripped [GENERATE_IMAGE: ...] markers — replace displayed text
                assistantContent = data.content;
                setMessages((prev) => {
                  const newMsgs = [...prev];
                  const msg = newMsgs.find((m) => m.id === assistantMsgId);
                  if (msg) msg.content = data.content;
                  return newMsgs;
                });

              } else if (data.type === "analyzing_urls") {
                setMessages((prev) => {
                  const newMsgs = [...prev];
                  const msg = newMsgs.find((m) => m.id === assistantMsgId);
                  if (msg) { msg.analyzingUrls = true; msg.urlCount = data.count; }
                  return newMsgs;
                });

              } else if (data.type === "url_analysis_complete") {
                setMessages((prev) => {
                  const newMsgs = [...prev];
                  const msg = newMsgs.find((m) => m.id === assistantMsgId);
                  if (msg) { msg.analyzingUrls = false; }
                  return newMsgs;
                });

              } else if (data.type === "searching_web") {
                setMessages((prev) => {
                  const newMsgs = [...prev];
                  const msg = newMsgs.find((m) => m.id === assistantMsgId);
                  if (msg) { msg.searchingWeb = true; msg.webSearchQuery = data.query; }
                  return newMsgs;
                });

              } else if (data.type === "search_complete") {
                setMessages((prev) => {
                  const newMsgs = [...prev];
                  const msg = newMsgs.find((m) => m.id === assistantMsgId);
                  if (msg) { msg.searchingWeb = false; msg.webSearchResultCount = data.resultCount; }
                  return newMsgs;
                });

              } else if (data.type === "image_generating") {
                // Show a "generating..." placeholder on the message
                setMessages((prev) => {
                  const newMsgs = [...prev];
                  const msg = newMsgs.find((m) => m.id === assistantMsgId);
                  if (msg) msg.generatingImages = true;
                  return newMsgs;
                });

              } else if (data.type === "image_generated") {
                // Append the real image to the message
                setMessages((prev) => {
                  const newMsgs = [...prev];
                  const msg = newMsgs.find((m) => m.id === assistantMsgId);
                  if (msg) {
                    msg.images = [...(msg.images || []), {
                      url: data.url,
                      prompt: data.prompt,
                      index: data.index,
                    }];
                    msg.generatingImages = false;
                  }
                  return newMsgs;
                });

              } else if (data.type === "image_error") {
                setMessages((prev) => {
                  const newMsgs = [...prev];
                  const msg = newMsgs.find((m) => m.id === assistantMsgId);
                  if (msg) msg.generatingImages = false;
                  return newMsgs;
                });

              } else if (data.type === "artifact_generated") {
                setMessages((prev) => {
                  const newMsgs = [...prev];
                  const msg = newMsgs.find((m) => m.id === assistantMsgId);
                  if (msg) {
                    msg.artifacts = [...(msg.artifacts || []), {
                      artifactType: data.artifactType,
                      filename: data.filename,
                      dataUrl: data.dataUrl,
                      size: data.size,
                    }];
                  }
                  return newMsgs;
                });

              } else if (data.type === "limit_reached" || data.type === "out_of_credits") {
                onLimitReached();

              } else if (data.type === "done") {
                setMessages((prev) => {
                  const newMsgs = [...prev];
                  const msg = newMsgs.find((m) => m.id === assistantMsgId);
                  if (msg) {
                    msg.generatingImages = false;
                    if (data.creditCost)     msg.creditCost    = data.creditCost;
                    if (data.costBreakdown)  msg.costBreakdown = data.costBreakdown;
                  }
                  return newMsgs;
                });
              }
            } catch {
              // Ignore parse errors on incomplete chunks
            }
          }
        }
      }
    } catch (err: any) {
      if (err.name !== "AbortError") {
        setError(err.message || "An unknown error occurred.");
      }
    } finally {
      setIsTyping(false);
      abortControllerRef.current = null;
      queryClient.invalidateQueries({ queryKey: getGetOmnimensStatusQueryKey() });
    }
  };

  const stopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  };

  return { messages, sendMessage, isTyping, error, stopGeneration };
}
