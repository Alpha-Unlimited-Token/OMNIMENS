import { useState, useRef, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { getGetSuperAISessionQueryKey } from '@workspace/api-client-react';

export type StreamedMessage = {
  agentName: 'Architect' | 'Critic' | 'Synthesizer' | 'Mathematician' | 'Neuroscientist' | 'Meta-Agent';
  content: string;
  round: number;
};

export function useSuperAIStream(sessionId: number) {
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamedMessages, setStreamedMessages] = useState<StreamedMessage[]>([]);
  const [activeAgent, setActiveAgent] = useState<StreamedMessage['agentName'] | null>(null);
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
    setActiveAgent(null);
    abortControllerRef.current = new AbortController();

    try {
      const res = await fetch(`/api/superai/sessions/${sessionId}/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rounds }),
        signal: abortControllerRef.current.signal,
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error("Stream request failed:", res.status, errorText);
        return;
      }

      if (!res.body) throw new Error("No response body");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let finished = false;

      while (!finished) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const dataStr = line.slice(6).trim();
          if (!dataStr || dataStr === '[DONE]') continue;

          try {
            const parsed = JSON.parse(dataStr);

            if (parsed.done || parsed.type === 'done') {
              finished = true;
              setActiveAgent(null);
              break;
            }

            if (parsed.type === 'agent_start' && parsed.agent) {
              setActiveAgent(parsed.agent as StreamedMessage['agentName']);
            }

            if (parsed.type === 'agent_done') {
              setActiveAgent(null);
            }

            if (parsed.type === 'message' && parsed.agent && parsed.content) {
              setStreamedMessages(prev => {
                const last = prev[prev.length - 1];
                if (last && last.agentName === parsed.agent && last.round === parsed.round) {
                  return [
                    ...prev.slice(0, -1),
                    { ...last, content: last.content + parsed.content }
                  ];
                }
                return [
                  ...prev,
                  { agentName: parsed.agent, content: parsed.content, round: parsed.round || 1 }
                ];
              });
            }
          } catch (e) {
            // skip malformed lines
          }
        }
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.error("Stream failed:", err);
      }
    } finally {
      setIsStreaming(false);
      queryClient.invalidateQueries({ queryKey: getGetSuperAISessionQueryKey(sessionId) });
    }
  };

  return { startStream, isStreaming, streamedMessages, activeAgent };
}
