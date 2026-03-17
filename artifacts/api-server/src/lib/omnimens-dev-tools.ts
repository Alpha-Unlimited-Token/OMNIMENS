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
  action: "analyze" | "spectrogram" | "beat_detect";
  file_b64: string;
  file_mime?: string;
  options?: object;
}): Promise<any> {
  console.log(`[DEV TOOLS] Audio analysis: ${spec.action}`);
  return runPythonTool("audio_analyzer.py", spec, 60_000);
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
  };
}
