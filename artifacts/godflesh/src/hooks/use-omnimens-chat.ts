import { useState, useRef, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { getGetOmnimensStatusQueryKey } from "@workspace/api-client-react";

export type GeneratedImage = {
  url: string;
  prompt: string;
  index: number;
};

export type Generated3DModel = {
  glbBase64: string;
  glbSizeBytes: number;
  threejsHtml: string;
  vertexCount: number;
  faceCount: number;
  prompt: string;
  index: number;
  toolUsed?: "blender" | "openscad" | "trimesh";
  previewImageBase64?: string;
  zipBase64?: string;
  zipSizeBytes?: number;
  formats?: string[];
};

export type GeneratedGame = {
  title: string;
  genre: string;
  description: string;
  techStack: string[];
  prompt: string;
  index: number;
  html5GameBase64: string;
  godotZipBase64: string;
  godotZipSize: number;
  gDevelopZipBase64: string;
  gDevelopZipSize: number;
  masterZipBase64: string;
  masterZipSize: number;
  has3DAssets: boolean;
  assetCount: number;
  formats: string[];
  phase?: string;
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

export type TaskPlan = {
  plan: string[];
  agentMode: string;
  taskType: string;
  crewRoles: string[];
};

export type RedFlagAlert = {
  urgency: "immediate_ER" | "urgent_MD" | "refer_out" | "monitor" | "none";
  flags: string[];
  recommendation: string;
};

export type CogniSyncState = {
  primaryMode: "creative" | "analytical" | "urgent" | "exploratory" | "directive" | "conversational";
  signals: {
    cognitiveLoad: number;
    expertiseLevel: number;
    emotionalUrgency: number;
    creativeMode: number;
    analyticalMode: number;
    decisionFatigue: number;
  };
  responseArchitecture: {
    density: string;
    structure: string;
    vocabularyRegister: string;
    toneCalibration: string;
    verbosity: string;
    leadWithAction: boolean;
    useAnalogies: boolean;
    giveRecommendation: boolean;
  };
  semanticDomains: string[];
  resonanceInsights: string[];
  summary: string;
};

export type ToolResult = {
  type: "weather" | "news" | "academic" | "stock" | "currency" | "translate" | "video" | "units" | "qr" | "color_palette"
      | "code_run" | "web_fetch" | "git" | "sys_info" | "file_op";
  result?: string;
  dataUrl?: string;
  palette?: Array<{ hex: string; name: string; rgb: string; usage: string }>;
  location?: string;
  topic?: string;
  query?: string;
  ticker?: string;
  from?: string;
  to?: string;
  language?: string;
  url?: string;
  expression?: string;
  text?: string;
  theme?: string;
  index: number;
  // Developer platform tool payloads
  success?: boolean;
  error?: string;
  stdout?: string;
  stderr?: string;
  exit_code?: number;
  elapsed_sec?: number;
  elapsed_ms?: number;
  lang?: string;
  status?: number;
  content_type?: string;
  char_count?: number;
  links?: Array<{ text: string; url: string }>;
  link_count?: number;
  title?: string;
  description?: string;
  h1?: string[];
  h2?: string[];
  json?: any;
  branch?: string;
  log?: string[];
  remotes?: string;
  contributors?: string[];
  files?: string[];
  file_count?: number;
  recent_commits?: string[];
  diff?: string;
  stat?: string;
  scope?: string;
  cpu?: any;
  memory?: any;
  disk?: any;
  processes?: any[];
  platform?: any;
  network?: any;
  valid?: boolean;
  changed_lines?: number;
  count?: number;
  members?: any[];
  output?: string;
  op?: string;
};

export type ChartResult = {
  index: number;
  chart_png?: string;
  chart_type?: string;
  title?: string;
  error?: string;
};

export type DiagramResult = {
  index: number;
  diagram_png?: string;
  diagram_svg?: string;
  diagram_type?: string;
  error?: string;
};

export type MathResult = {
  index: number;
  action?: string;
  expression?: string;
  result?: string;
  solutions?: string[];
  solutions_latex?: string[];
  latex?: string;
  derivative?: string;
  factored?: string;
  expanded?: string;
  series?: string;
  plot_png?: string;
  numeric?: number;
  mean?: number;
  median?: number;
  std?: number;
  results?: any;
  error?: string;
  success?: boolean;
};

export type NLPResult = {
  index: number;
  action?: string;
  stats?: any;
  keywords?: any[];
  named_entities?: any;
  sentiment?: any;
  key_phrases?: string[];
  grouped?: any;
  error?: string;
  success?: boolean;
};

export type DataScienceResult = {
  index: number;
  action?: string;
  shape?: number[];
  columns?: string[];
  cluster_counts?: any;
  n_clusters_found?: number;
  scatter_plot_png?: string;
  heatmap_png?: string;
  r2_score?: number;
  rmse?: number;
  coefficients?: any;
  anomaly_count?: number;
  anomaly_rate?: number;
  describe?: any;
  correlation_matrix?: any;
  top_correlations?: any[];
  error?: string;
  success?: boolean;
};

export type Message = {
  id: string;
  role: "user" | "omnimens";
  content: string;
  model?: string;
  files?: AttachedFile[];
  images?: GeneratedImage[];
  generatingImages?: boolean;
  models3d?: Generated3DModel[];
  generating3d?: boolean;
  games?: GeneratedGame[];
  generatingGame?: boolean;
  gamePhase?: string;
  artifacts?: Artifact[];
  searchingWeb?: boolean;
  webSearchQuery?: string;
  webSearchResultCount?: number;
  analyzingUrls?: boolean;
  urlCount?: number;
  creditCost?: number;
  costBreakdown?: CostBreakdown;
  taskPlan?: TaskPlan;
  multiSearching?: boolean;
  multiSearchCount?: number;
  multiSearchComplete?: boolean;
  redFlagAlert?: RedFlagAlert;
  toolResults?: ToolResult[];
  cogniSync?: CogniSyncState;
  neuroEmotion?: string;
  neuroIntensity?: string;
  suggestions?: string[];
  // Face recognition
  analyzingFaces?: boolean;
  faceAnalysis?: {
    faceCount: number;
    markdown: string;
    boundingBoxes: { face_index: number; x: number; y: number; width: number; height: number; confidence: number }[];
  };
  // Developer Power Tools
  chartResults?: ChartResult[];
  diagramResults?: DiagramResult[];
  mathResults?: MathResult[];
  nlpResults?: NLPResult[];
  dataScienceResults?: DataScienceResult[];
};

export type AttachedFile = {
  name: string;
  type: string;
  size: number;
  preview?: string;
};

export type GpuCompressorFn = (msgs: { role: string; content: string }[]) => Promise<string | null>;

export function useOmnimensChat(
  onLimitReached: () => void,
  gpuCompressor?: GpuCompressorFn,
) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentConversationId, setCurrentConversationId] = useState<number | undefined>();

  // Keep compressor ref up-to-date without requiring re-render
  const gpuCompressorRef = useRef<GpuCompressorFn | undefined>(gpuCompressor);
  useEffect(() => { gpuCompressorRef.current = gpuCompressor; }, [gpuCompressor]);
  const [activeCogniSync, setActiveCogniSync] = useState<CogniSyncState | null>(null);
  const queryClient = useQueryClient();
  const abortControllerRef = useRef<AbortController | null>(null);

  const startNewConversation = () => {
    setMessages([]);
    setCurrentConversationId(undefined);
    setError(null);
  };

  const loadConversation = (conversationId: number, dbMessages: { role: "user" | "assistant"; content: string }[]) => {
    setCurrentConversationId(conversationId);
    const mapped: Message[] = dbMessages.map((m, i) => ({
      id: `db-${conversationId}-${i}`,
      role: m.role === "user" ? "user" : "omnimens",
      content: m.content,
    }));
    setMessages(mapped);
  };

  const sendMessage = async (content: string, files: File[] = [], persona = "GENERAL", hubSettings?: any, model = "gpt-4o", responseMode = "AUTO", sessionStart?: number) => {
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
      const rawHistory = messages.slice(-20).map((m) => ({
        role: m.role === "user" ? "user" : "assistant",
        content: m.content,
      }));

      // GPU acceleration: if conversation is long and GPU is ready, compress
      // older messages locally before sending to the server. This reduces
      // token usage and server latency — fully transparent, no behavior change.
      let history = rawHistory;
      if (gpuCompressorRef.current && rawHistory.length > 8) {
        const olderMessages = rawHistory.slice(0, -6);
        const recentMessages = rawHistory.slice(-6);
        try {
          const summary = await gpuCompressorRef.current(olderMessages);
          if (summary) {
            history = [
              { role: "user", content: `[Earlier conversation summary: ${summary}]` },
              { role: "assistant", content: "Understood, I have the context from our earlier conversation." },
              ...recentMessages,
            ];
          }
        } catch {
          history = rawHistory.slice(-10);
        }
      } else {
        history = rawHistory.slice(-10);
      }

      const form = new FormData();
      form.append("message", content);
      form.append("history", JSON.stringify(history));
      form.append("persona", persona);
      form.append("model", model);
      if (currentConversationId !== undefined) {
        form.append("conversationId", String(currentConversationId));
      }
      if (hubSettings) {
        form.append("hubSettings", JSON.stringify(hubSettings));
      }
      form.append("responseMode", responseMode);
      if (sessionStart) form.append("sessionStart", String(sessionStart));
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
      let sseBuffer = "";

      setMessages((prev) => [...prev, { id: assistantMsgId, role: "omnimens", content: "" }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        sseBuffer += decoder.decode(value, { stream: true });
        const lines = sseBuffer.split("\n");
        sseBuffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          try {
              const data = JSON.parse(line.slice(6));

              if (data.type === "conversation_id") {
                setCurrentConversationId(data.conversationId);

              } else if (data.type === "chunk") {
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

              } else if (data.type === "task_plan") {
                setMessages((prev) => {
                  const newMsgs = [...prev];
                  const msg = newMsgs.find((m) => m.id === assistantMsgId);
                  if (msg) {
                    msg.taskPlan = {
                      plan: data.plan,
                      agentMode: data.agentMode,
                      taskType: data.taskType,
                      crewRoles: data.crewRoles,
                    };
                  }
                  return newMsgs;
                });

              } else if (data.type === "multi_search") {
                setMessages((prev) => {
                  const newMsgs = [...prev];
                  const msg = newMsgs.find((m) => m.id === assistantMsgId);
                  if (msg) { msg.multiSearching = true; msg.multiSearchCount = data.count; }
                  return newMsgs;
                });

              } else if (data.type === "multi_search_complete") {
                setMessages((prev) => {
                  const newMsgs = [...prev];
                  const msg = newMsgs.find((m) => m.id === assistantMsgId);
                  if (msg) { msg.multiSearching = false; msg.multiSearchComplete = true; msg.multiSearchCount = data.count; }
                  return newMsgs;
                });

              } else if (data.type === "image_generating") {
                setMessages((prev) => {
                  const newMsgs = [...prev];
                  const msg = newMsgs.find((m) => m.id === assistantMsgId);
                  if (msg) msg.generatingImages = true;
                  return newMsgs;
                });

              } else if (data.type === "image_generated") {
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

              } else if (data.type === "3d_generating") {
                setMessages((prev) => {
                  const newMsgs = [...prev];
                  const msg = newMsgs.find((m) => m.id === assistantMsgId);
                  if (msg) msg.generating3d = true;
                  return newMsgs;
                });

              } else if (data.type === "3d_generated") {
                setMessages((prev) => {
                  const newMsgs = [...prev];
                  const msg = newMsgs.find((m) => m.id === assistantMsgId);
                  if (msg) {
                    msg.models3d = [...(msg.models3d || []), {
                      glbBase64: data.glbBase64,
                      glbSizeBytes: data.glbSizeBytes,
                      threejsHtml: data.threejsHtml,
                      vertexCount: data.vertexCount,
                      faceCount: data.faceCount,
                      prompt: data.prompt,
                      index: data.index,
                      toolUsed: data.toolUsed,
                      previewImageBase64: data.previewImageBase64,
                      zipBase64: data.zipBase64,
                      zipSizeBytes: data.zipSizeBytes,
                      formats: data.formats,
                    }];
                    msg.generating3d = false;
                  }
                  return newMsgs;
                });

              } else if (data.type === "3d_error") {
                setMessages((prev) => {
                  const newMsgs = [...prev];
                  const msg = newMsgs.find((m) => m.id === assistantMsgId);
                  if (msg) msg.generating3d = false;
                  return newMsgs;
                });

              } else if (data.type === "game_generating") {
                setMessages((prev) => {
                  const newMsgs = [...prev];
                  const msg = newMsgs.find((m) => m.id === assistantMsgId);
                  if (msg) { msg.generatingGame = true; msg.gamePhase = "designing"; }
                  return newMsgs;
                });

              } else if (data.type === "game_phase") {
                setMessages((prev) => {
                  const newMsgs = [...prev];
                  const msg = newMsgs.find((m) => m.id === assistantMsgId);
                  if (msg) msg.gamePhase = data.phase;
                  return newMsgs;
                });

              } else if (data.type === "game_generated") {
                setMessages((prev) => {
                  const newMsgs = [...prev];
                  const msg = newMsgs.find((m) => m.id === assistantMsgId);
                  if (msg) {
                    msg.games = [...(msg.games || []), {
                      title: data.title,
                      genre: data.genre,
                      description: data.description,
                      techStack: data.techStack,
                      prompt: data.prompt,
                      index: data.index,
                      html5GameBase64: data.html5GameBase64,
                      godotZipBase64: data.godotZipBase64,
                      godotZipSize: data.godotZipSize,
                      gDevelopZipBase64: data.gDevelopZipBase64,
                      gDevelopZipSize: data.gDevelopZipSize,
                      masterZipBase64: data.masterZipBase64,
                      masterZipSize: data.masterZipSize,
                      has3DAssets: data.has3DAssets,
                      assetCount: data.assetCount,
                      formats: data.formats,
                    }];
                    msg.generatingGame = false;
                    msg.gamePhase = undefined;
                  }
                  return newMsgs;
                });

              } else if (data.type === "game_error") {
                setMessages((prev) => {
                  const newMsgs = [...prev];
                  const msg = newMsgs.find((m) => m.id === assistantMsgId);
                  if (msg) { msg.generatingGame = false; msg.gamePhase = undefined; }
                  return newMsgs;
                });

              } else if (data.type === "face_analyzing") {
                setMessages((prev) => {
                  const newMsgs = [...prev];
                  const msg = newMsgs.find((m) => m.id === assistantMsgId);
                  if (msg) msg.analyzingFaces = true;
                  return newMsgs;
                });

              } else if (data.type === "face_analysis_complete") {
                setMessages((prev) => {
                  const newMsgs = [...prev];
                  const msg = newMsgs.find((m) => m.id === assistantMsgId);
                  if (msg) {
                    msg.analyzingFaces = false;
                    msg.faceAnalysis = {
                      faceCount: data.faceCount,
                      markdown: data.markdown,
                      boundingBoxes: data.boundingBoxes || [],
                    };
                  }
                  return newMsgs;
                });

              } else if (data.type === "face_analysis_error") {
                setMessages((prev) => {
                  const newMsgs = [...prev];
                  const msg = newMsgs.find((m) => m.id === assistantMsgId);
                  if (msg) msg.analyzingFaces = false;
                  return newMsgs;
                });

              } else if (data.type === "tool_chart") {
                setMessages((prev) => {
                  const newMsgs = [...prev];
                  const msg = newMsgs.find((m) => m.id === assistantMsgId);
                  if (msg) {
                    if (!msg.chartResults) msg.chartResults = [];
                    msg.chartResults.push({ index: data.index, chart_png: data.chart_png, chart_type: data.chart_type, title: data.title, error: data.error });
                  }
                  return newMsgs;
                });

              } else if (data.type === "tool_diagram") {
                setMessages((prev) => {
                  const newMsgs = [...prev];
                  const msg = newMsgs.find((m) => m.id === assistantMsgId);
                  if (msg) {
                    if (!msg.diagramResults) msg.diagramResults = [];
                    msg.diagramResults.push({ index: data.index, diagram_png: data.diagram_png, diagram_svg: data.diagram_svg, diagram_type: data.diagram_type, error: data.error });
                  }
                  return newMsgs;
                });

              } else if (data.type === "tool_math") {
                setMessages((prev) => {
                  const newMsgs = [...prev];
                  const msg = newMsgs.find((m) => m.id === assistantMsgId);
                  if (msg) {
                    if (!msg.mathResults) msg.mathResults = [];
                    msg.mathResults.push({ ...data, index: data.index });
                  }
                  return newMsgs;
                });

              } else if (data.type === "tool_nlp") {
                setMessages((prev) => {
                  const newMsgs = [...prev];
                  const msg = newMsgs.find((m) => m.id === assistantMsgId);
                  if (msg) {
                    if (!msg.nlpResults) msg.nlpResults = [];
                    msg.nlpResults.push({ ...data, index: data.index });
                  }
                  return newMsgs;
                });

              } else if (data.type === "tool_data_science") {
                setMessages((prev) => {
                  const newMsgs = [...prev];
                  const msg = newMsgs.find((m) => m.id === assistantMsgId);
                  if (msg) {
                    if (!msg.dataScienceResults) msg.dataScienceResults = [];
                    msg.dataScienceResults.push({ ...data, index: data.index });
                  }
                  return newMsgs;
                });

              } else if (data.type === "red_flag_alert") {
                setMessages((prev) => {
                  const newMsgs = [...prev];
                  const msg = newMsgs.find((m) => m.id === assistantMsgId);
                  if (msg) {
                    msg.redFlagAlert = {
                      urgency: data.urgency,
                      flags: data.flags,
                      recommendation: data.recommendation,
                    };
                  }
                  return newMsgs;
                });

              } else if (data.type === "cognisync_state") {
                const cs: CogniSyncState = {
                  primaryMode: data.primaryMode,
                  signals: data.signals,
                  responseArchitecture: data.responseArchitecture,
                  semanticDomains: data.semanticDomains,
                  resonanceInsights: data.resonanceInsights,
                  summary: data.summary,
                };
                setActiveCogniSync(cs);
                setMessages((prev) => {
                  const newMsgs = [...prev];
                  const msg = newMsgs.find((m) => m.id === assistantMsgId);
                  if (msg) msg.cogniSync = cs;
                  return newMsgs;
                });

              } else if (data.type === "neuro_state") {
                setMessages((prev) => {
                  const newMsgs = [...prev];
                  const msg = newMsgs.find((m) => m.id === assistantMsgId);
                  if (msg) {
                    msg.neuroEmotion = data.emotion;
                    msg.neuroIntensity = data.intensity;
                  }
                  return newMsgs;
                });

              } else if (data.type === "suggestions") {
                setMessages((prev) => {
                  const newMsgs = [...prev];
                  const msg = newMsgs.find((m) => m.id === assistantMsgId);
                  if (msg) msg.suggestions = data.suggestions;
                  return newMsgs;
                });

              } else if (data.type?.startsWith("tool_")) {
                // Handle all extended tool results (weather, news, academic, stock, qr, etc.)
                const toolType = data.type.replace("tool_", "") as ToolResult["type"];
                setMessages((prev) => {
                  const newMsgs = [...prev];
                  const msg = newMsgs.find((m) => m.id === assistantMsgId);
                  if (msg) {
                    const toolResult: ToolResult = {
                      type: toolType,
                      result: data.result,
                      dataUrl: data.dataUrl,
                      palette: data.palette,
                      location: data.location,
                      topic: data.topic,
                      query: data.query,
                      ticker: data.ticker,
                      from: data.from,
                      to: data.to,
                      language: data.language,
                      url: data.url,
                      expression: data.expression,
                      text: data.text,
                      theme: data.theme,
                      index: data.index ?? 0,
                      // Developer platform fields
                      success: data.success,
                      error: data.error,
                      stdout: data.stdout,
                      stderr: data.stderr,
                      exit_code: data.exit_code,
                      elapsed_sec: data.elapsed_sec,
                      elapsed_ms: data.elapsed_ms,
                      lang: data.language ?? data.lang,
                      status: data.status,
                      content_type: data.content_type,
                      char_count: data.char_count,
                      links: data.links,
                      link_count: data.link_count,
                      title: data.title,
                      description: data.description,
                      h1: data.h1,
                      h2: data.h2,
                      json: data.json,
                      branch: data.branch,
                      log: data.log,
                      remotes: data.remotes,
                      contributors: data.contributors,
                      files: data.files,
                      file_count: data.file_count,
                      recent_commits: data.recent_commits,
                      diff: data.diff,
                      stat: data.stat,
                      scope: data.scope,
                      cpu: data.cpu,
                      memory: data.memory,
                      disk: data.disk,
                      processes: data.processes,
                      platform: data.platform,
                      network: data.network,
                      valid: data.valid,
                      changed_lines: data.changed_lines,
                      count: data.count,
                      members: data.members,
                      output: data.output,
                      op: data.op,
                    };
                    msg.toolResults = [...(msg.toolResults || []), toolResult];
                  }
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
                    msg.generating3d = false;
                    if (data.creditCost)     msg.creditCost    = data.creditCost;
                    if (data.costBreakdown)  msg.costBreakdown = data.costBreakdown;
                    if (data.model)          msg.model         = data.model;
                  }
                  return newMsgs;
                });
              }
            } catch {
              // Ignore parse errors on incomplete chunks
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

  return {
    messages,
    sendMessage,
    isTyping,
    error,
    stopGeneration,
    currentConversationId,
    startNewConversation,
    loadConversation,
    activeCogniSync,
  };
}
