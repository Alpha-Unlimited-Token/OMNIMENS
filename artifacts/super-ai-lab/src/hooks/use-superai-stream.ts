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
  iteration?: number;
};

export type CodeFile = {
  filename: string;
  language: string;
  code: string;
  writtenBy: AgentName;
  iteration?: number;
};

export type ExecutionResult = {
  filename: string;
  output: string;
  errors: string;
  success: boolean;
  qualityWarning?: string | null;
  iteration?: number;
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

export type IterationStatus = {
  current: number;
  total: number;
  challenge?: string;
  completedIterations: {
    iteration: number;
    fileCount: number;
    files: string[];
  }[];
};

export type NamingMessage = {
  agent: AgentName;
  content: string;
};

export type CrossChallenge = {
  from: AgentName;
  to: AgentName;
  files: string[];
  round: number;
  iteration?: number;
  timestamp: number;
};

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
  const [iterationStatus, setIterationStatus] = useState<IterationStatus | null>(null);
  const [isPackaging, setIsPackaging] = useState(false);
  const [packageReady, setPackageReady] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  // Cross-agent challenge events
  const [crossChallenges, setCrossChallenges] = useState<CrossChallenge[]>([]);
  // Naming ceremony state
  const [namingInProgress, setNamingInProgress] = useState(false);
  const [namingMessages, setNamingMessages] = useState<NamingMessage[]>([]);
  const [activeNamingAgent, setActiveNamingAgent] = useState<AgentName | null>(null);
  const [decidedName, setDecidedName] = useState<string | null>(null);
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
    setIterationStatus(null);
    setIsPackaging(false);
    setPackageReady(false);
    setDownloadUrl(null);
    setNamingInProgress(false);
    setNamingMessages([]);
    setActiveNamingAgent(null);
    setDecidedName(null);
    setCrossChallenges([]);
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

            // ── Workspace restoration ──
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
              if (parsed.files && parsed.files.length > 0) {
                setCodeFiles(
                  parsed.files.map((f: { filename: string; language: string; writtenBy: string }) => ({
                    filename: f.filename,
                    language: f.language,
                    code: "(loading from persistent workspace...)",
                    writtenBy: f.writtenBy as AgentName,
                  }))
                );
              }
            }

            // ── Iteration lifecycle ──
            if (parsed.type === "iteration_start") {
              setRestoringWorkspace(false);
              setIterationStatus((prev) => ({
                current: parsed.iteration,
                total: parsed.total,
                challenge: parsed.challenge,
                completedIterations: prev?.completedIterations || [],
              }));
            }
            if (parsed.type === "iteration_complete") {
              setIterationStatus((prev) => ({
                current: parsed.iteration,
                total: parsed.total,
                challenge: prev?.challenge,
                completedIterations: [
                  ...(prev?.completedIterations || []),
                  { iteration: parsed.iteration, fileCount: parsed.fileCount, files: parsed.files || [] },
                ],
              }));
            }

            // ── Agent lifecycle ──
            if (parsed.type === "agent_start" && parsed.agent) {
              setRestoringWorkspace(false);
              setActiveAgent(parsed.agent as AgentName);
            }
            if (parsed.type === "agent_done") {
              setActiveAgent(null);
            }

            // ── Cross-agent challenges ──
            if (parsed.type === "cross_challenge" && parsed.from && parsed.to) {
              setCrossChallenges((prev) => [
                ...prev.slice(-50), // keep last 50
                {
                  from: parsed.from as AgentName,
                  to: parsed.to as AgentName,
                  files: parsed.files || [],
                  round: parsed.round || 1,
                  iteration: parsed.iteration,
                  timestamp: Date.now(),
                },
              ]);
            }

            // ── Messages ──
            if (parsed.type === "message" && parsed.agent && parsed.content) {
              setStreamedMessages((prev) => {
                const last = prev[prev.length - 1];
                if (last && last.agentName === parsed.agent && last.round === parsed.round && last.iteration === (parsed.iteration || 1)) {
                  return [...prev.slice(0, -1), { ...last, content: last.content + parsed.content }];
                }
                return [...prev, {
                  agentName: parsed.agent as AgentName,
                  content: parsed.content,
                  round: parsed.round || 1,
                  iteration: parsed.iteration || 1,
                }];
              });
            }

            // ── Code files ──
            if (parsed.type === "code_write") {
              setCodeFiles((prev) => {
                const idx = prev.findIndex((f) => f.filename === parsed.filename);
                const entry: CodeFile = {
                  filename: parsed.filename,
                  language: parsed.language,
                  code: parsed.code,
                  writtenBy: parsed.agent as AgentName,
                  iteration: parsed.iteration || 1,
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
              setExecutions((prev) => [...prev, {
                filename: parsed.filename,
                output: parsed.output || "",
                errors: parsed.errors || "",
                success: parsed.success,
                qualityWarning: parsed.qualityWarning || null,
                iteration: parsed.iteration || 1,
              }]);
            }

            // ── Packages ──
            if (parsed.type === "package_install") {
              setInstallingPackages(parsed.packages);
            }
            if (parsed.type === "install_result") {
              setInstallingPackages(null);
            }

            // ── Naming Ceremony ──
            if (parsed.type === "naming_start") {
              setNamingInProgress(true);
              setActiveAgent(null);
              setActiveNamingAgent(null);
            }
            if (parsed.type === "naming_agent_thinking" && parsed.agent) {
              setActiveNamingAgent(parsed.agent as AgentName);
            }
            if (parsed.type === "naming_message" && parsed.agent && parsed.content) {
              setNamingMessages((prev) => {
                const last = prev[prev.length - 1];
                if (last && last.agent === parsed.agent) {
                  return [...prev.slice(0, -1), { agent: last.agent, content: last.content + parsed.content }];
                }
                return [...prev, { agent: parsed.agent as AgentName, content: parsed.content }];
              });
            }
            if (parsed.type === "naming_agent_done") {
              setActiveNamingAgent(null);
            }
            if (parsed.type === "naming_decision" && parsed.name) {
              setNamingInProgress(false);
              setActiveNamingAgent(null);
              setDecidedName(parsed.name);
            }

            // ── Packaging ──
            if (parsed.type === "packaging") {
              setIsPackaging(true);
              setActiveAgent(null);
            }
            if (parsed.type === "package_ready") {
              setIsPackaging(false);
              setPackageReady(true);
              setDownloadUrl(parsed.downloadUrl || "/api/superai/lab/download");
              if (parsed.aiName) setDecidedName(parsed.aiName);
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
    iterationStatus,
    isPackaging,
    packageReady,
    downloadUrl,
    namingInProgress,
    namingMessages,
    activeNamingAgent,
    decidedName,
    crossChallenges,
  };
}
