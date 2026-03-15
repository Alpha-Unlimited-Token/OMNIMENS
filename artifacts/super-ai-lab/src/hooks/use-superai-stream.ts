import { useState, useRef, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { getGetSuperAISessionQueryKey } from "@workspace/api-client-react";

export type AgentName =
  | "Architect"
  | "Critic"
  | "Synthesizer"
  | "Mathematician"
  | "Neuroscientist"
  | "Meta-Agent";

export type StreamedMessage = {
  agentName: AgentName;
  content: string;
  round: number;
};

export type CodeFile = {
  filename: string;
  language: string;
  code: string;
  writtenBy: AgentName;
};

export type ExecutionResult = {
  filename: string;
  output: string;
  errors: string;
  success: boolean;
  qualityWarning?: string | null;
};

export type InstallEvent = {
  packages: string[];
  success?: boolean;
  output?: string;
  done: boolean;
};

export type LabWorkspaceState = {
  fileCount: number;
  packageCount: number;
  files: { filename: string; writtenBy: string; language: string }[];
  packages: string[];
} | null;

export function useSuperAIStream(sessionId: number) {
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamedMessages, setStreamedMessages] = useState<StreamedMessage[]>([]);
  const [activeAgent, setActiveAgent] = useState<AgentName | null>(null);
  const [codeFiles, setCodeFiles] = useState<CodeFile[]>([]);
  const [executions, setExecutions] = useState<ExecutionResult[]>([]);
  const [executingFile, setExecutingFile] = useState<string | null>(null);
  const [installingPackages, setInstallingPackages] = useState<string[] | null>(null);
  const [restoringWorkspace, setRestoringWorkspace] = useState(false);
  const [restoredWorkspace, setRestoredWorkspace] = useState<LabWorkspaceState>(null);
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
    setCodeFiles([]);
    setExecutions([]);
    setExecutingFile(null);
    setInstallingPackages(null);
    setRestoringWorkspace(false);
    setRestoredWorkspace(null);
    abortControllerRef.current = new AbortController();

    try {
      const res = await fetch(`/api/superai/sessions/${sessionId}/run`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rounds }),
        signal: abortControllerRef.current.signal,
      });

      if (!res.ok || !res.body) {
        throw new Error(`HTTP ${res.status}`);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let finished = false;

      while (!finished) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const dataStr = line.slice(6).trim();
          if (!dataStr) continue;

          try {
            const parsed = JSON.parse(dataStr);

            if (parsed.done || parsed.type === "done") {
              finished = true;
              setActiveAgent(null);
              break;
            }

            // ── Workspace restoration events ──
            if (parsed.type === "workspace_restoring") {
              setRestoringWorkspace(true);
            }

            if (parsed.type === "workspace_restored") {
              setRestoringWorkspace(false);
              setRestoredWorkspace({
                fileCount: parsed.fileCount,
                packageCount: parsed.packageCount,
                files: parsed.files || [],
                packages: parsed.packages || [],
              });
              // Pre-load previously built code files into the UI
              if (parsed.files && parsed.files.length > 0) {
                setCodeFiles(
                  parsed.files.map((f: { filename: string; language: string; writtenBy: string }) => ({
                    filename: f.filename,
                    language: f.language,
                    code: "(loading from workspace...)",
                    writtenBy: f.writtenBy as AgentName,
                  }))
                );
              }
            }

            if (parsed.type === "agent_start" && parsed.agent) {
              setRestoringWorkspace(false);
              setActiveAgent(parsed.agent as AgentName);
            }

            if (parsed.type === "agent_done") {
              setActiveAgent(null);
            }

            if (parsed.type === "message" && parsed.agent && parsed.content) {
              setStreamedMessages((prev) => {
                const last = prev[prev.length - 1];
                if (last && last.agentName === parsed.agent && last.round === parsed.round) {
                  return [
                    ...prev.slice(0, -1),
                    { ...last, content: last.content + parsed.content },
                  ];
                }
                return [
                  ...prev,
                  { agentName: parsed.agent as AgentName, content: parsed.content, round: parsed.round || 1 },
                ];
              });
            }

            if (parsed.type === "code_write") {
              setCodeFiles((prev) => {
                const idx = prev.findIndex((f) => f.filename === parsed.filename);
                const entry: CodeFile = {
                  filename: parsed.filename,
                  language: parsed.language,
                  code: parsed.code,
                  writtenBy: parsed.agent as AgentName,
                };
                if (idx >= 0) {
                  const next = [...prev];
                  next[idx] = entry;
                  return next;
                }
                return [...prev, entry];
              });
            }

            if (parsed.type === "code_execute") {
              setExecutingFile(parsed.filename);
            }

            if (parsed.type === "execution_result") {
              setExecutingFile(null);
              setExecutions((prev) => [
                ...prev,
                {
                  filename: parsed.filename,
                  output: parsed.output || "",
                  errors: parsed.errors || "",
                  success: parsed.success,
                  qualityWarning: parsed.qualityWarning || null,
                },
              ]);
            }

            if (parsed.type === "package_install") {
              setInstallingPackages(parsed.packages);
            }

            if (parsed.type === "install_result") {
              setInstallingPackages(null);
            }
          } catch {
            // ignore malformed JSON
          }
        }
      }
    } catch (err: any) {
      if (err?.name !== "AbortError") {
        console.error("Stream error:", err);
      }
    } finally {
      setIsStreaming(false);
      setActiveAgent(null);
      setExecutingFile(null);
      setInstallingPackages(null);
      setRestoringWorkspace(false);
      queryClient.invalidateQueries({ queryKey: getGetSuperAISessionQueryKey(sessionId) });
    }
  };

  return {
    startStream,
    isStreaming,
    streamedMessages,
    activeAgent,
    codeFiles,
    executions,
    executingFile,
    installingPackages,
    restoringWorkspace,
    restoredWorkspace,
  };
}
