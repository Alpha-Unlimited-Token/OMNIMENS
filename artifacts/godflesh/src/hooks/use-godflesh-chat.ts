import { useState, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { getGetGodfleshStatusQueryKey } from "@workspace/api-client-react";

export type Message = {
  id: string;
  role: "user" | "godflesh";
  content: string;
};

export function useGodfleshChat(onLimitReached: () => void) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const abortControllerRef = useRef<AbortController | null>(null);

  const sendMessage = async (content: string) => {
    if (!content.trim() || isTyping) return;

    const userMsgId = Date.now().toString();
    const assistantMsgId = (Date.now() + 1).toString();

    setMessages((prev) => [...prev, { id: userMsgId, role: "user", content }]);
    setIsTyping(true);
    setError(null);

    abortControllerRef.current = new AbortController();

    try {
      const res = await fetch("/api/godflesh/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: content }),
        signal: abortControllerRef.current.signal,
      });

      if (!res.ok) {
        if (res.status === 403) {
          onLimitReached();
          // Remove the optimistic user message if limit was reached before sending
          setMessages((prev) => prev.filter(m => m.id !== userMsgId));
          setIsTyping(false);
          return;
        }
        throw new Error("Failed to communicate with GODFLESH");
      }

      if (!res.body) throw new Error("No response body");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let assistantContent = "";

      setMessages((prev) => [...prev, { id: assistantMsgId, role: "godflesh", content: "" }]);

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
                  if (lastMsg && lastMsg.role === "godflesh") {
                    lastMsg.content = assistantContent;
                  }
                  return newMsgs;
                });
              } else if (data.type === "limit_reached") {
                onLimitReached();
              }
            } catch (e) {
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
      // Refresh status to update message counts
      queryClient.invalidateQueries({ queryKey: getGetGodfleshStatusQueryKey() });
    }
  };

  const stopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  };

  return { messages, sendMessage, isTyping, error, stopGeneration };
}
