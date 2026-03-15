import { useState, useRef, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { getGetSuperAISessionQueryKey } from '@workspace/api-client-react';

export type StreamedMessage = {
  agentName: 'Architect' | 'Critic' | 'Synthesizer';
  content: string;
  round: number;
};

export function useSuperAIStream(sessionId: number) {
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamedMessages, setStreamedMessages] = useState<StreamedMessage[]>([]);
  const queryClient = useQueryClient();
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  const startStream = async (rounds: number = 3) => {
    setIsStreaming(true);
    setStreamedMessages([]);
    abortControllerRef.current = new AbortController();
    
    try {
      const res = await fetch(`/api/superai/sessions/${sessionId}/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rounds }),
        signal: abortControllerRef.current.signal,
      });

      if (!res.body) throw new Error("No response body");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const dataStr = line.slice(6).trim();
            if (!dataStr || dataStr === '[DONE]') continue;
            try {
              const parsed = JSON.parse(dataStr);
              if (parsed.done) {
                 break;
              }
              setStreamedMessages(prev => {
                const last = prev[prev.length - 1];
                if (last && last.agentName === parsed.agentName && last.round === parsed.round) {
                  return [
                    ...prev.slice(0, -1), 
                    { ...last, content: last.content + (parsed.content || '') }
                  ];
                }
                return [
                  ...prev, 
                  { agentName: parsed.agentName, content: parsed.content || '', round: parsed.round || 1 }
                ];
              });
            } catch (e) {
              console.error("Failed to parse SSE line:", dataStr);
            }
          }
        }
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.error("Stream failed:", err);
      }
    } finally {
      setIsStreaming(false);
      // Invalidate the session query to fetch the finalized messages and status from the DB
      queryClient.invalidateQueries({ queryKey: getGetSuperAISessionQueryKey(sessionId) });
    }
  };

  return { startStream, isStreaming, streamedMessages };
}
