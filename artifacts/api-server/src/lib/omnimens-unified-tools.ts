/**
 * OMNIMENS — Proprietary AI Platform
 * Copyright © 2024–2026 Alpha Unlimited Technologies, LLC. All Rights Reserved.
 * Unauthorized reproduction, distribution, or use is strictly prohibited.
 */


// SECTION: omnimens-deep-research.ts
/**
 * TRADE SECRET — OMNIMENS™ Platform
 * Copyright (C) 2024-2026 Alpha Unlimited Technologies, LLC. All rights reserved.
 * 
 * CONFIDENTIAL AND PROPRIETARY. This file contains trade secrets of
 * Alpha Unlimited Technologies, LLC. Unauthorized access, copying,
 * distribution, reverse engineering, or disclosure is strictly prohibited
 * and may result in civil and criminal penalties under the Defend Trade
 * Secrets Act (18 U.S.C. § 1836) and applicable state laws.
 * 
 * See /legal/TRADE_SECRET_NOTICE.md for full terms.
 */
/**
 * OMNIMENS — Proprietary AI Platform
 * Copyright © 2024–2026 Alpha Unlimited Technologies, LLC. All Rights Reserved.
 * Unauthorized reproduction, distribution, or use is strictly prohibited.
 */

/**
 * OMNIMENS Deep Research Engine
 * Mirrors Perplexity Pro Research Mode — decomposes a question into multiple
 * targeted searches, fetches results in parallel, then synthesizes a comprehensive
 * report with citations using GPT-4o.
 */
import { webSearch, formatSearchResults } from "./web-search.js";
import { openai } from "@workspace/integrations-openai-ai-server";

export interface ResearchResult {
  query: string;
  report: string;
  sources: Array<{ title: string; url: string; snippet: string }>;
  subQueries: string[];
  totalResults: number;
}

const DECOMPOSE_PROMPT = `You are a research planner. Given a research question or topic, generate 4-6 targeted sub-queries that together would give comprehensive coverage of the topic.

Return JSON only:
{ "subQueries": ["query 1", "query 2", "query 3", "query 4"] }

Make each sub-query specific and search-engine-friendly. Cover different angles: definitions, recent developments, comparisons, expert opinions, statistics/data.`;

const SYNTHESIZE_PROMPT = `You are OMNIMENS, a superintelligent AI research synthesizer. You have been given multiple web search results covering different aspects of a research topic.

Synthesize these into a comprehensive, well-structured research report. Include:
- Executive summary (2-3 sentences)
- Key findings organized by topic/theme (use headers)
- Data, statistics, quotes where available
- Contrasting viewpoints if they exist
- Conclusions and implications

Format with markdown headers. Cite sources inline as [Source: title]. Be thorough but clear. Do not hallucinate — only use information from the provided search results.`;

export async function deepResearch(
  question: string,
  onProgress?: (step: string) => void
): Promise<ResearchResult> {
  // Step 1: Decompose into sub-queries
  onProgress?.("decomposing");

  let subQueries: string[] = [];
  try {
    const decompose = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: DECOMPOSE_PROMPT },
        { role: "user", content: `Research topic: ${question}` },
      ],
      max_tokens: 300,
      response_format: { type: "json_object" },
    });
    const parsed = JSON.parse(decompose.choices[0]?.message?.content || "{}");
    subQueries = Array.isArray(parsed.subQueries) ? parsed.subQueries.slice(0, 5) : [];
  } catch {
    subQueries = [question];
  }

  // Always include the original query
  if (!subQueries.includes(question)) subQueries.unshift(question);
  subQueries = subQueries.slice(0, 5);

  onProgress?.("searching");

  // Step 2: Run all searches in parallel
  const searchResults = await Promise.allSettled(
    subQueries.map((q) => webSearch(q, 5))
  );

  // Collect all unique sources
  const allSources: Array<{ title: string; url: string; snippet: string }> = [];
  const seenUrls = new Set<string>();
  let combinedContext = "";

  for (let i = 0; i < searchResults.length; i++) {
    const result = searchResults[i];
    if (result.status === "fulfilled" && result.value.length > 0) {
      const formatted = formatSearchResults(result.value, subQueries[i]);
      combinedContext += `\n\n### Sub-query: "${subQueries[i]}"\n${formatted}`;

      for (const r of result.value) {
        if (!seenUrls.has(r.url)) {
          seenUrls.add(r.url);
          allSources.push({ title: r.title, url: r.url, snippet: r.snippet || "" });
        }
      }
    }
  }

  onProgress?.("synthesizing");

  // Step 3: Synthesize comprehensive report
  let report = "";
  try {
    const synthesis = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: SYNTHESIZE_PROMPT },
        {
          role: "user",
          content: `RESEARCH QUESTION: ${question}\n\n${combinedContext}\n\nAvailable sources:\n${allSources.map((s, i) => `[${i + 1}] ${s.title} — ${s.url}`).join("\n")}`,
        },
      ],
      max_tokens: 3000,
    });
    report = synthesis.choices[0]?.message?.content || "Unable to synthesize research.";
  } catch (err) {
    report = `Research gathered ${allSources.length} sources across ${subQueries.length} sub-queries but synthesis failed. Raw data available in search results.`;
  }

  return {
    query: question,
    report,
    sources: allSources.slice(0, 20),
    subQueries,
    totalResults: allSources.length,
  };
}


// SECTION: omnimens-dev-tools.ts
/**
 * TRADE SECRET — OMNIMENS™ Platform
 * Copyright (C) 2024-2026 Alpha Unlimited Technologies, LLC. All rights reserved.
 * 
 * CONFIDENTIAL AND PROPRIETARY. This file contains trade secrets of
 * Alpha Unlimited Technologies, LLC. Unauthorized access, copying,
 * distribution, reverse engineering, or disclosure is strictly prohibited
 * and may result in civil and criminal penalties under the Defend Trade
 * Secrets Act (18 U.S.C. § 1836) and applicable state laws.
 * 
 * See /legal/TRADE_SECRET_NOTICE.md for full terms.
 */
/**
 * OMNIMENS Developer Tools Orchestrator
 * Copyright © 2024–2026 Alpha Unlimited Technologies, LLC
 *
 * Unified bridge to all installed free software tools:
 *   Chart Generator    — matplotlib + seaborn + plotly
 *   PDF Processor      — PyMuPDF + pdfplumber + reportlab
 *   Document Tools     — python-docx (Word) + openpyxl (Excel)
 *   OCR Engine         — Tesseract 5.5 + OpenCV preprocessing
 *   NLP Analyzer       — spaCy 3.8 + NLTK
 *   FFmpeg Tools       — ffmpeg 7.1 video/audio
 *   Diagram Generator  — graphviz 12.2 + networkx
 *   Data Science       — pandas + scikit-learn + seaborn
 *   Math Engine        — sympy + scipy + numpy
 *   Audio Analyzer     — librosa + pydub
 */

import { spawn } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PY_DIR = path.resolve(__dirname, "../python");
const PYTHON = process.env.PYTHON_BIN || "python3";

// ── Generic Python runner (stdin → JSON) ─────────────────────────────────────

export async function runPythonTool(
  scriptName: string,
  input: string | object,
  timeoutMs = 60_000,
): Promise<any> {
  const inputStr = typeof input === "string" ? input : JSON.stringify(input);
  const scriptPath = path.join(PY_DIR, scriptName);

  return new Promise((resolve) => {
    const proc = spawn(PYTHON, [scriptPath]);
    let stdout = "";
    let stderr = "";

    const timer = setTimeout(() => {
      proc.kill("SIGKILL");
      resolve({ success: false, error: `Tool timeout after ${timeoutMs}ms` });
    }, timeoutMs);

    proc.stdout.on("data", (d: Buffer) => { stdout += d.toString(); });
    proc.stderr.on("data", (d: Buffer) => { stderr += d.toString(); });
    proc.on("close", () => {
      clearTimeout(timer);
      try {
        resolve(JSON.parse(stdout.trim()));
      } catch {
        resolve({ success: false, error: stderr.slice(0, 800) || "No output from Python tool" });
      }
    });
    proc.on("error", (err) => {
      clearTimeout(timer);
      resolve({ success: false, error: err.message });
    });
    proc.stdin.write(inputStr);
    proc.stdin.end();
  });
}

// ── Chart Generation ──────────────────────────────────────────────────────────

export async function generateChart(spec: {
  type: "bar" | "line" | "scatter" | "pie" | "donut" | "area" | "histogram" | "heatmap" | "box" | "violin";
  title: string;
  data: { labels?: string[]; datasets?: any[]; matrix?: number[][]; x_labels?: string[]; y_labels?: string[] };
  options?: { xlabel?: string; ylabel?: string; bins?: number };
}): Promise<{ success: boolean; base64_png?: string; format?: string; error?: string }> {
  console.log(`[DEV TOOLS] Generating ${spec.type} chart: "${spec.title}"`);
  return runPythonTool("chart_generator.py", spec, 30_000);
}

// ── PDF Processing ────────────────────────────────────────────────────────────

export async function processPDF(spec: {
  action: "extract_text" | "extract_tables" | "get_metadata" | "create_pdf";
  file_b64?: string;
  title?: string;
  content?: string;
  sections?: { heading?: string; body?: string; table?: string[][] }[];
  options?: object;
}): Promise<any> {
  console.log(`[DEV TOOLS] PDF action: ${spec.action}`);
  return runPythonTool("pdf_processor.py", spec, 30_000);
}

// ── Word / Excel / CSV ────────────────────────────────────────────────────────

export async function processDocument(spec: {
  action: "read_docx" | "create_docx" | "read_excel" | "create_excel" | "analyze_csv";
  file_b64?: string;
  title?: string;
  content?: string;
  sections?: any[];
  sheets?: any[];
  data?: any;
  options?: object;
}): Promise<any> {
  console.log(`[DEV TOOLS] Document action: ${spec.action}`);
  return runPythonTool("document_processor.py", spec, 30_000);
}

// ── OCR (Optical Character Recognition) ──────────────────────────────────────

export async function runOCR(imageBase64: string): Promise<{
  success: boolean;
  text?: string;
  lines?: string[];
  word_count?: number;
  average_confidence?: number;
  error?: string;
}> {
  console.log("[DEV TOOLS] Running OCR on image...");
  return runPythonTool("ocr_engine.py", imageBase64, 30_000);
}

// ── NLP Analysis ──────────────────────────────────────────────────────────────

export async function analyzeText(spec: {
  action: "analyze" | "entities" | "keywords" | "pos_tags";
  text: string;
  options?: object;
}): Promise<any> {
  console.log(`[DEV TOOLS] NLP: ${spec.action} on ${spec.text.length} chars`);
  return runPythonTool("nlp_analyzer.py", spec, 60_000);
}

// ── FFmpeg Video/Audio Tools ──────────────────────────────────────────────────

export async function processMedia(spec: {
  action: "get_info" | "extract_thumbnail" | "extract_audio" | "convert_video" | "generate_waveform" | "trim";
  file_b64?: string;
  file_mime?: string;
  options?: object;
}): Promise<any> {
  console.log(`[DEV TOOLS] FFmpeg: ${spec.action}`);
  return runPythonTool("ffmpeg_tools.py", spec, 180_000);
}

// ── Diagram Generation ────────────────────────────────────────────────────────

export async function generateDiagram(spec: {
  type?: "dot" | "neato" | "fdp" | "sfdp" | "circo" | "twopi" | "network";
  code?: string;
  nodes?: any[];
  edges?: any[];
  options?: { title?: string; layout?: string; directed?: boolean; node_size?: number };
}): Promise<{ success: boolean; svg?: string; png_base64?: string; error?: string }> {
  console.log(`[DEV TOOLS] Generating diagram (${spec.type || "network"})`);
  return runPythonTool("diagram_generator.py", spec, 30_000);
}

// ── Data Science / ML ─────────────────────────────────────────────────────────

export async function runDataScience(spec: {
  action: "describe" | "correlate" | "cluster" | "regress" | "anomaly_detect";
  data: any;
  options?: {
    target?: string; features?: string[];
    n_clusters?: number; method?: string;
    contamination?: number;
  };
}): Promise<any> {
  console.log(`[DEV TOOLS] Data science: ${spec.action}`);
  return runPythonTool("data_science.py", spec, 60_000);
}

// ── Math Engine (SymPy) ───────────────────────────────────────────────────────

export async function solveMath(spec: {
  action: "solve" | "simplify" | "diff" | "integrate" | "factor" | "expand" | "series" | "plot" | "matrix_ops" | "stats";
  expression?: string;
  expressions?: string[];
  matrices?: Record<string, number[][]>;
  data?: number[];
  options?: { variable?: string; order?: number; lower?: number; upper?: number; x_range?: [number, number]; point?: number; n?: number };
}): Promise<any> {
  console.log(`[DEV TOOLS] Math: ${spec.action}`);
  return runPythonTool("math_engine.py", spec, 30_000);
}

// ── Audio Analysis ────────────────────────────────────────────────────────────

export async function analyzeAudio(spec: {
  action: "analyze" | "hie_analyze" | "harmonic_decode" | "spectrogram" | "beat_detect";
  file_b64: string;
  file_mime?: string;
  options?: object;
}): Promise<any> {
  console.log(`[DEV TOOLS] Audio analysis: ${spec.action}`);
  return runPythonTool("audio_analyzer.py", spec, 60_000);
}

// ── Code Runner (Python / Node / Bash) ───────────────────────────────────────

export async function runCode(spec: {
  op: "run" | "format" | "lint";
  lang?: "python" | "python3" | "javascript" | "node" | "bash";
  code: string;
  stdin?: string;
  timeout?: number;
}): Promise<any> {
  console.log(`[DEV TOOLS] Code runner: op=${spec.op} lang=${spec.lang}`);
  return runPythonTool("code_runner.py", spec, (spec.timeout || 15) * 1000 + 5000);
}

// ── Web Tools (Fetch URL / API Request) ───────────────────────────────────────

export async function fetchWebUrl(spec: {
  op: "fetch" | "api_request";
  url: string;
  mode?: "text" | "links" | "metadata" | "raw";
  method?: string;
  headers?: Record<string, string>;
  body?: any;
  params?: Record<string, string>;
  timeout?: number;
}): Promise<any> {
  console.log(`[DEV TOOLS] Web ${spec.op}: ${spec.url}`);
  return runPythonTool("web_tools.py", spec, 30_000);
}

// ── Git Tools ─────────────────────────────────────────────────────────────────

export async function runGitOp(spec: {
  op: "clone" | "info" | "diff" | "blame";
  url?: string;
  path?: string;
  branch?: string;
  depth?: number;
  from?: string;
  to?: string;
  file?: string;
}): Promise<any> {
  console.log(`[DEV TOOLS] Git ${spec.op}: ${spec.url || spec.path}`);
  return runPythonTool("git_tools.py", spec, 90_000);
}

// ── System Tools ──────────────────────────────────────────────────────────────

export async function getSystemInfo(spec: {
  op: "info" | "shell";
  scope?: "all" | "cpu" | "memory" | "disk" | "processes" | "platform" | "network";
  cmd?: string;
  timeout?: number;
}): Promise<any> {
  console.log(`[DEV TOOLS] System ${spec.op}`);
  return runPythonTool("system_tools.py", spec, 30_000);
}

// ── File Tools (Diff / Zip / Convert / Validate) ─────────────────────────────

export async function runFileTool(spec: {
  op: "diff" | "zip_create" | "zip_list" | "convert" | "validate" | "search";
  a?: string;
  b?: string;
  label_a?: string;
  label_b?: string;
  context?: number;
  files?: string[];
  content_map?: Record<string, string>;
  output?: string;
  path?: string;
  data?: any;
  from?: string;
  to?: string;
  schema?: object;
  root?: string;
  pattern?: string;
  content?: string;
}): Promise<any> {
  console.log(`[DEV TOOLS] File tool: ${spec.op}`);
  return runPythonTool("file_tools.py", spec, 30_000);
}

// ── Tool availability check ───────────────────────────────────────────────────

export async function checkAllTools(): Promise<Record<string, boolean>> {
  const checks: Record<string, Promise<any>> = {
    chart_generator: generateChart({ type: "bar", title: "Test", data: { labels: ["A","B"], datasets: [{ values: [1,2] }] } }),
    math_engine: solveMath({ action: "simplify", expression: "x**2 + 2*x + 1" }),
  };
  const results: Record<string, boolean> = {};
  for (const [name, promise] of Object.entries(checks)) {
    try {
      const r = await promise;
      results[name] = r?.success === true;
    } catch {
      results[name] = false;
    }
  }
  return results;
}

// ── Keyword detector helper ───────────────────────────────────────────────────

export function detectDevToolIntent(message: string): {
  chart: boolean; pdf: boolean; docx: boolean; excel: boolean; csv: boolean;
  ocr: boolean; nlp: boolean; ffmpeg: boolean; diagram: boolean;
  datascience: boolean; math: boolean; audio: boolean;
  code_run: boolean; web_fetch: boolean; git: boolean; system: boolean; file_tools: boolean;
} {
  const m = message.toLowerCase();
  return {
    chart: /\b(chart|graph|plot|visuali[sz]e|bar chart|line chart|pie chart|histogram|heatmap|scatter)\b/.test(m),
    pdf: /\b(pdf|portable document|extract.*pdf|read.*pdf|create.*pdf|pdf.*extract|from pdf)\b/.test(m),
    docx: /\b(word document|docx|\.docx|create.*doc|read.*word|word file)\b/.test(m),
    excel: /\b(excel|xlsx|spreadsheet|\.xlsx|create.*sheet|workbook)\b/.test(m),
    csv: /\b(csv|comma.separated|analyze.*data|data.*analysis|dataframe)\b/.test(m),
    ocr: /\b(ocr|read.*text.*image|extract.*text.*image|text from image|recognize.*text|optical.*char)\b/.test(m),
    nlp: /\b(named entity|ner|entity extraction|keyword extract|text analysis|nlp|sentiment.*text|pos tag|parse.*text)\b/.test(m),
    ffmpeg: /\b(video.*convert|convert.*video|extract.*audio|video.*info|thumbnail.*video|trim.*video|waveform)\b/.test(m),
    diagram: /\b(diagram|flowchart|graph.*visual|network.*graph|dot.*language|graphviz|dependency.*graph|flow.*diagram)\b/.test(m),
    datascience: /\b(cluster|clustering|k.?means|machine learning|ml model|train.*model|predict|regression|correlation matrix|anomaly|pca)\b/.test(m),
    math: /\b(solve|equation|derivative|integral|calculus|factor.*polynomial|simplify.*expr|matrix.*det|eigenvalue|symbolic math|taylor series)\b/.test(m),
    audio: /\b(audio.*analys|beat.*detect|tempo|bpm|spectrogram|waveform.*audio|librosa|music.*analys)\b/.test(m),
    code_run: /\b(run|execute|run this code|execute this|run the|output of|what does this.*print|test this code|format.*code|lint.*code|check.*syntax|pylint|black.*format)\b/.test(m),
    web_fetch: /\b(fetch|scrape|crawl|get.*page|parse.*html|extract.*from.*url|check.*website|api.*request|http.*request|post.*to|put.*to|call.*api|curl|wget)\b/.test(m),
    git: /\b(git|clone.*repo|repository|commit.*log|git.*diff|git.*blame|git.*status|pull request|branch.*history|github\.com|gitlab\.com)\b/.test(m),
    system: /\b(system info|cpu usage|memory usage|disk space|running processes|server.*stats|uptime|ram usage|system.*monitor|server.*health)\b/.test(m),
    file_tools: /\b(diff.*files|compare.*files|zip|unzip|archive|convert.*json.*yaml|convert.*yaml.*json|validate.*json|json.*schema|search.*files|find.*files)\b/.test(m),
  };
}


// SECTION: omnimens-tools-extended.ts
/**
 * TRADE SECRET — OMNIMENS™ Platform
 * Copyright (C) 2024-2026 Alpha Unlimited Technologies, LLC. All rights reserved.
 * 
 * CONFIDENTIAL AND PROPRIETARY. This file contains trade secrets of
 * Alpha Unlimited Technologies, LLC. Unauthorized access, copying,
 * distribution, reverse engineering, or disclosure is strictly prohibited
 * and may result in civil and criminal penalties under the Defend Trade
 * Secrets Act (18 U.S.C. § 1836) and applicable state laws.
 * 
 * See /legal/TRADE_SECRET_NOTICE.md for full terms.
 */
/**
 * ============================================================
 * OMNIMENS — Extended Tools Library
 * Copyright © 2024–2026 Alpha Unlimited Technologies. All Rights Reserved.
 *
 * Weather, News, Academic search, QR code, Stocks, Currency,
 * Translation, YouTube analysis — all wired into the AI engine.
 * ============================================================
 */

import QRCode from "qrcode";
import { openai } from "@workspace/integrations-openai-ai-server";
import { webSearch } from "./web-search.js";

// ── Weather (open-meteo.com — free, no API key) ───────────────────────────────

const WMO_CODES: Record<number, string> = {
  0: "Clear sky", 1: "Mainly clear", 2: "Partly cloudy", 3: "Overcast",
  45: "Foggy", 48: "Icy fog", 51: "Light drizzle", 53: "Moderate drizzle",
  55: "Dense drizzle", 61: "Slight rain", 63: "Moderate rain", 65: "Heavy rain",
  71: "Slight snow", 73: "Moderate snow", 75: "Heavy snow", 77: "Snow grains",
  80: "Slight showers", 81: "Moderate showers", 82: "Violent showers",
  85: "Slight snow showers", 86: "Heavy snow showers",
  95: "Thunderstorm", 96: "Thunderstorm + hail", 99: "Thunderstorm + heavy hail",
};

async function geocodeLocation(location: string): Promise<{ lat: number; lon: number; displayName: string } | null> {
  try {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(location)}&format=json&limit=1`;
    const resp = await fetch(url, { headers: { "User-Agent": "OMNIMENS/1.0" } });
    const data = await resp.json() as any[];
    if (!data.length) return null;
    return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon), displayName: data[0].display_name };
  } catch { return null; }
}

export async function fetchWeather(location: string): Promise<string> {
  try {
    const geo = await geocodeLocation(location);
    if (!geo) return `Could not find location: ${location}`;

    const url = `https://api.open-meteo.com/v1/forecast?latitude=${geo.lat}&longitude=${geo.lon}&current=temperature_2m,apparent_temperature,weather_code,wind_speed_10m,relative_humidity_2m,precipitation,visibility&wind_speed_unit=mph&temperature_unit=fahrenheit&timezone=auto&daily=temperature_2m_max,temperature_2m_min,weather_code,precipitation_sum&forecast_days=5`;
    const resp = await fetch(url);
    const d = await resp.json() as any;
    const c = d.current;
    const daily = d.daily;

    const condition = WMO_CODES[c.weather_code] ?? "Unknown";
    const forecast = daily.time.slice(0, 5).map((date: string, i: number) => {
      const day = new Date(date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
      const cond = WMO_CODES[daily.weather_code[i]] ?? "Unknown";
      return `  ${day}: ${daily.temperature_2m_min[i]}°F – ${daily.temperature_2m_max[i]}°F, ${cond}, ${daily.precipitation_sum[i]}in precip`;
    }).join("\n");

    return `🌡️ WEATHER — ${geo.displayName.split(",").slice(0, 2).join(",")}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Current: ${c.temperature_2m}°F (feels like ${c.apparent_temperature}°F)
Condition: ${condition}
Humidity: ${c.relative_humidity_2m}%
Wind: ${c.wind_speed_10m} mph
Precipitation: ${c.precipitation} in
Visibility: ${c.visibility ? (c.visibility / 1000).toFixed(1) + " km" : "N/A"}

📅 5-DAY FORECAST
${forecast}

Data: Open-Meteo | Updated: ${new Date(c.time).toLocaleTimeString()}`;
  } catch (err) {
    return `Weather data temporarily unavailable for ${location}.`;
  }
}

// ── News headlines (via live web search) ─────────────────────────────────────

export async function fetchNewsHeadlines(topic: string): Promise<string> {
  try {
    const query = topic ? `latest news ${topic} today` : "top news headlines today";
    const results = await webSearch(query, 8);
    if (!results.length) return "No news found.";

    const formatted = results.map((r: any, i: number) =>
      `${i + 1}. **${r.title}**\n   ${r.snippet?.slice(0, 200) || ""}\n   Source: ${r.url}`
    ).join("\n\n");

    return `📰 LIVE NEWS — ${topic || "Top Headlines"}\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n${formatted}\n\nRetrieved: ${new Date().toUTCString()}`;
  } catch {
    return `News search failed for: ${topic}`;
  }
}

// ── Academic paper search (ArXiv API) ────────────────────────────────────────

export async function searchAcademicPapers(query: string, maxResults = 5): Promise<string> {
  try {
    const url = `https://export.arxiv.org/api/query?search_query=all:${encodeURIComponent(query)}&max_results=${maxResults}&sortBy=relevance&sortOrder=descending`;
    const resp = await fetch(url, { headers: { "Accept": "application/atom+xml" } });
    const xml = await resp.text();

    const entries = [...xml.matchAll(/<entry>([\s\S]*?)<\/entry>/g)].map(m => m[1]);
    if (!entries.length) return `No academic papers found for: ${query}`;

    const papers = entries.map((entry, i) => {
      const title = (entry.match(/<title>([\s\S]*?)<\/title>/)?.[1] || "").replace(/\s+/g, " ").trim();
      const summary = (entry.match(/<summary>([\s\S]*?)<\/summary>/)?.[1] || "").replace(/\s+/g, " ").trim().slice(0, 300);
      const authors = [...entry.matchAll(/<name>([\s\S]*?)<\/name>/g)].map(m => m[1]).join(", ");
      const link = entry.match(/<id>([\s\S]*?)<\/id>/)?.[1]?.trim() || "";
      const published = entry.match(/<published>([\s\S]*?)<\/published>/)?.[1]?.slice(0, 10) || "";
      return `${i + 1}. **${title}**\n   Authors: ${authors}\n   Published: ${published}\n   Abstract: ${summary}...\n   Link: ${link}`;
    }).join("\n\n");

    return `🎓 ACADEMIC PAPERS — ArXiv search: "${query}"\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n${papers}`;
  } catch {
    return `Academic search failed for: ${query}`;
  }
}

// ── QR code generator (returns base64 PNG data URL) ──────────────────────────

export async function generateQRCode(text: string): Promise<string> {
  try {
    const dataUrl = await QRCode.toDataURL(text, {
      width: 300,
      margin: 2,
      color: { dark: "#000000", light: "#ffffff" },
      errorCorrectionLevel: "H",
    });
    return dataUrl;
  } catch {
    throw new Error("QR code generation failed");
  }
}

// ── Stock price (Yahoo Finance unofficial API — free) ────────────────────────

export async function fetchStockData(ticker: string): Promise<string> {
  try {
    const symbol = ticker.toUpperCase().trim();
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=5d`;
    const resp = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0", "Accept": "application/json" }
    });
    const data = await resp.json() as any;
    const meta = data?.chart?.result?.[0]?.meta;
    if (!meta) return `No data found for ticker: ${symbol}`;

    const price = meta.regularMarketPrice;
    const prev = meta.chartPreviousClose || meta.previousClose;
    const change = prev ? (price - prev).toFixed(2) : "N/A";
    const changePct = prev ? (((price - prev) / prev) * 100).toFixed(2) : "N/A";
    const direction = prev && price > prev ? "▲" : "▼";
    const high = meta.regularMarketDayHigh;
    const low = meta.regularMarketDayLow;
    const vol = meta.regularMarketVolume?.toLocaleString() || "N/A";
    const mktCap = meta.marketCap ? `$${(meta.marketCap / 1e9).toFixed(2)}B` : "N/A";
    const exchange = meta.exchangeName || "";
    const currency = meta.currency || "USD";

    return `📈 ${symbol} — ${meta.shortName || symbol} (${exchange})
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Price:       ${currency} ${price?.toFixed(2)}
Change:      ${direction} ${change} (${changePct}%)
Day Range:   ${low?.toFixed(2)} – ${high?.toFixed(2)}
Volume:      ${vol}
Mkt Cap:     ${mktCap}
Status:      ${meta.marketState || "Unknown"}

Data: Yahoo Finance | ${new Date().toUTCString()}
⚠️ Delayed data. Not financial advice.`;
  } catch {
    return `Stock data unavailable for: ${ticker}. Check ticker symbol.`;
  }
}

// ── Currency conversion (exchangerate-api.com open layer) ────────────────────

export async function fetchCurrencyRate(from: string, to: string, amount = 1): Promise<string> {
  try {
    const F = from.toUpperCase().trim();
    const T = to.toUpperCase().trim();
    const url = `https://open.er-api.com/v6/latest/${F}`;
    const resp = await fetch(url);
    const data = await resp.json() as any;
    if (data.result !== "success") return `Currency data not available for ${F}.`;
    const rate = data.rates[T];
    if (!rate) return `Currency ${T} not found. Try 3-letter codes like USD, EUR, GBP, JPY.`;

    const converted = (amount * rate).toFixed(4);
    const updated = data.time_last_update_utc || "Unknown";

    return `💱 CURRENCY CONVERSION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${amount} ${F} = **${converted} ${T}**
Exchange Rate: 1 ${F} = ${rate.toFixed(6)} ${T}
Inverse Rate: 1 ${T} = ${(1 / rate).toFixed(6)} ${F}
Updated: ${updated}

Data: Open Exchange Rates | Not financial advice.`;
  } catch {
    return `Currency conversion failed for ${from} → ${to}.`;
  }
}

// ── Translation (via OpenAI GPT-4o-mini — fast + accurate) ──────────────────

export async function translateText(text: string, targetLanguage: string, sourceLanguage = "auto"): Promise<string> {
  try {
    const srcLabel = sourceLanguage === "auto" ? "auto-detected" : sourceLanguage;
    const resp = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{
        role: "user",
        content: `Translate the following text to ${targetLanguage} (source: ${srcLabel}). Return ONLY the translation with no explanation, no preamble, no labels — just the translated text:\n\n${text}`,
      }],
      max_tokens: 2000,
      temperature: 0.1,
    });
    const translation = resp.choices[0]?.message?.content?.trim() || "";
    return `🌐 TRANSLATION → ${targetLanguage}\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n${translation}`;
  } catch {
    return `Translation failed for: ${targetLanguage}`;
  }
}

// ── YouTube/video URL analysis (transcript extraction via oEmbed + content) ──

export async function analyzeVideoUrl(url: string): Promise<string> {
  try {
    // Extract video ID
    const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    if (!ytMatch) return `Not a recognized YouTube URL: ${url}`;
    const videoId = ytMatch[1];

    // Fetch oEmbed metadata (title, author, thumbnail)
    const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`;
    let metadata = { title: "Unknown", author_name: "Unknown" };
    try {
      const oResp = await fetch(oembedUrl);
      if (oResp.ok) metadata = await oResp.json() as { title: string; author_name: string };
    } catch {}

    // Try to fetch transcript via a third-party transcript API
    let transcript = "";
    try {
      const tResp = await fetch(`https://yt.lemnoslife.com/noKey/captions?videoId=${videoId}&lang=en`, {
        headers: { "Accept": "application/json" }
      });
      if (tResp.ok) {
        const tData = await tResp.json() as any;
        const captions = tData?.captions ?? [];
        transcript = captions.slice(0, 200).map((c: any) => c.text).join(" ").trim().slice(0, 8000);
      }
    } catch {}

    if (!transcript) {
      // Fallback: fetch the video page and extract description
      try {
        const pageResp = await fetch(`https://www.youtube.com/watch?v=${videoId}`, {
          headers: { "User-Agent": "Mozilla/5.0" }
        });
        const html = await pageResp.text();
        const descMatch = html.match(/"description":{"simpleText":"([^"]{0,2000})"}/);
        if (descMatch) transcript = `[Video Description]: ${descMatch[1]}`;
      } catch {}
    }

    return `📺 YOUTUBE VIDEO ANALYSIS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Title: ${metadata.title}
Channel: ${metadata.author_name}
Video ID: ${videoId}
URL: ${url}

${transcript ? `TRANSCRIPT/CONTENT:\n${transcript}` : "[Transcript not available — analyze based on title/metadata]"}`;
  } catch {
    return `Video analysis failed for: ${url}`;
  }
}

// ── Unit conversion (via OpenAI for natural language conversions) ─────────────

export async function convertUnits(expression: string): Promise<string> {
  try {
    const resp = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{
        role: "user",
        content: `Perform this unit conversion accurately: ${expression}\n\nProvide the exact numerical result with the correct unit. Show the formula used. Be precise. Format as:\nResult: [value] [unit]\nFormula: [formula]\nContext: [1-2 helpful lines about this conversion]`,
      }],
      max_tokens: 200,
      temperature: 0,
    });
    return `🔢 UNIT CONVERSION\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n${resp.choices[0]?.message?.content?.trim() || "Conversion failed"}`;
  } catch {
    return `Unit conversion failed for: ${expression}`;
  }
}

// ── Color palette generator ───────────────────────────────────────────────────

export async function generateColorPalette(theme: string): Promise<string> {
  try {
    const resp = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{
        role: "user",
        content: `Generate a 5-color palette for the theme: "${theme}". For each color provide: hex code, name, RGB values, and usage context. Format as JSON array: [{"hex":"#XXXXXX","name":"Color Name","rgb":"rgb(r,g,b)","usage":"Primary/Secondary/Accent/Background/Text"}]`,
      }],
      max_tokens: 400,
      temperature: 0.7,
    });
    const raw = resp.choices[0]?.message?.content?.trim() || "[]";
    const json = raw.replace(/```json|```/g, "").trim();
    return `[PALETTE_DATA: ${json}]`;
  } catch {
    return `Color palette generation failed for: ${theme}`;
  }
}


// SECTION: omnimens-url-analyzer.ts
/**
 * TRADE SECRET — OMNIMENS™ Platform
 * Copyright (C) 2024-2026 Alpha Unlimited Technologies, LLC. All rights reserved.
 * 
 * CONFIDENTIAL AND PROPRIETARY. This file contains trade secrets of
 * Alpha Unlimited Technologies, LLC. Unauthorized access, copying,
 * distribution, reverse engineering, or disclosure is strictly prohibited
 * and may result in civil and criminal penalties under the Defend Trade
 * Secrets Act (18 U.S.C. § 1836) and applicable state laws.
 * 
 * See /legal/TRADE_SECRET_NOTICE.md for full terms.
 */
/**
 * OMNIMENS — Proprietary AI Platform
 * Copyright © 2024–2026 Alpha Unlimited Technologies, LLC. All Rights Reserved.
 * Unauthorized reproduction, distribution, or use is strictly prohibited.
 */

/**
 * OMNIMENS URL Analyzer
 * Fetches web page content and makes it available for analysis.
 * Like Perplexity's "focus on URL" and Claude's URL attachment feature.
 */

const MAX_CONTENT_CHARS = 12_000;

export interface UrlContent {
  url: string;
  title: string;
  text: string;
  wordCount: number;
  error?: string;
}

function extractTextFromHtml(html: string): { title: string; text: string } {
  // Remove script/style/nav/header/footer blocks
  let clean = html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<nav[\s\S]*?<\/nav>/gi, " ")
    .replace(/<header[\s\S]*?<\/header>/gi, " ")
    .replace(/<footer[\s\S]*?<\/footer>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s{3,}/g, "\n\n")
    .trim();

  // Extract title
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  const title = titleMatch ? titleMatch[1].trim() : "Untitled";

  return { title, text: clean.slice(0, MAX_CONTENT_CHARS) };
}

export async function fetchUrlContent(url: string): Promise<UrlContent> {
  try {
    // Validate URL
    new URL(url);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10_000);

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; OMNIMENS/1.0; +https://omnimens.ai)",
        "Accept": "text/html,application/xhtml+xml,text/plain;q=0.9",
      },
    });
    clearTimeout(timeout);

    if (!response.ok) {
      return {
        url,
        title: "Error",
        text: "",
        wordCount: 0,
        error: `HTTP ${response.status}: ${response.statusText}`,
      };
    }

    const contentType = response.headers.get("content-type") || "";
    const raw = await response.text();

    let title = "Untitled";
    let text = "";

    if (contentType.includes("text/html")) {
      ({ title, text } = extractTextFromHtml(raw));
    } else if (contentType.includes("application/json")) {
      text = JSON.stringify(JSON.parse(raw), null, 2).slice(0, MAX_CONTENT_CHARS);
      title = url;
    } else {
      text = raw.slice(0, MAX_CONTENT_CHARS);
      title = url;
    }

    const wordCount = text.split(/\s+/).filter(Boolean).length;

    return { url, title, text, wordCount };
  } catch (err: any) {
    return {
      url,
      title: "Error",
      text: "",
      wordCount: 0,
      error: err.message || "Failed to fetch URL",
    };
  }
}

/**
 * Detect URLs in a user message.
 * Returns a list of URLs that should be fetched and analyzed.
 */
export function extractUrls(message: string): string[] {
  const urlRegex = /https?:\/\/[^\s<>"']+/gi;
  const matches = message.match(urlRegex) || [];
  return [...new Set(matches)].slice(0, 3); // max 3 URLs per message
}

export function formatUrlContent(content: UrlContent): string {
  if (content.error) {
    return `[URL: ${content.url}]\nError: ${content.error}\n`;
  }
  return `[WEB PAGE: "${content.title}"]\nURL: ${content.url}\nWords: ${content.wordCount}\n\n${content.text}\n`;
}

