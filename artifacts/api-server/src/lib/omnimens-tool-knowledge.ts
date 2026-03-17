/**
 * OMNIMENS Tool Knowledge Ingestion Engine
 *
 * OMNIMENS goes online, reads documentation and tutorials for every installed
 * tool, distills key knowledge into dense brain entries, and stores them
 * permanently in the DB. This knowledge is injected into every conversation
 * so OMNIMENS can immediately use any tool with mastery.
 *
 * Runs:
 *   - Once at startup (10s delay)
 *   - Every 12 hours automatically
 *   - On-demand when new tools are installed
 */

import { db } from "@workspace/db";
import { omnimensBrain, omnimensNotifications } from "@workspace/db";
import { eq, and, like } from "drizzle-orm";
import { openai } from "@workspace/integrations-openai-ai-server";
import { webSearch, fetchPageContent, formatSearchResults } from "./web-search.js";

// ── Registry of all installed tools OMNIMENS should master ───────────────────

export interface ToolDefinition {
  id: string;
  name: string;
  category: "3d_modeling" | "math_science" | "image_processing" | "web_3d" | "animation" | "audio" | "data" | "ai" | "domain_knowledge";
  searchQueries: string[];
  docUrls: string[];
  why: string;
}

export const INSTALLED_TOOLS: ToolDefinition[] = [
  // ── Python 3D & Math ─────────────────────────────────────────────────────
  {
    id: "trimesh",
    name: "trimesh (Python 3D mesh library)",
    category: "3d_modeling",
    searchQueries: [
      "trimesh python 3D mesh creation tutorial examples",
      "trimesh boolean operations subdivision smoothing",
      "trimesh procedural geometry creation advanced",
    ],
    docUrls: [
      "https://trimesh.org/trimesh.creation.html",
      "https://trimesh.org/trimesh.primitives.html",
    ],
    why: "Core 3D mesh generation engine — creates, modifies, exports real 3D model files (.glb, .stl, .obj)",
  },
  {
    id: "numpy",
    name: "numpy (Python numerical computing)",
    category: "math_science",
    searchQueries: [
      "numpy 3D geometry procedural mesh generation",
      "numpy noise terrain generation advanced techniques",
      "numpy mathematical surface generation parametric",
    ],
    docUrls: [],
    why: "Mathematical backbone — generates procedural geometry, noise fields, parametric surfaces",
  },
  {
    id: "scipy",
    name: "scipy 1.x — Scientific Computing",
    category: "math_science",
    searchQueries: [
      "scipy spatial convex hull Delaunay triangulation 3D",
      "scipy signal processing image generation FFT convolution",
      "scipy advanced geometry surface interpolation",
      "scipy statistics normality test skewness kurtosis python example",
      "scipy optimize minimize root finding linear programming python",
    ],
    docUrls: [],
    why: "Advanced scientific computing: spatial operations (Delaunay triangulation, convex hull), statistical tests (normality, skewness), optimization (minimize, root-finding), signal processing (FFT, convolution). Works alongside NumPy and SymPy.",
  },
  {
    id: "pillow",
    name: "Pillow (Python image processing)",
    category: "image_processing",
    searchQueries: [
      "Pillow PIL procedural texture generation python",
      "Pillow image manipulation noise patterns advanced",
      "Pillow draw 2D procedural art generation",
    ],
    docUrls: [],
    why: "Texture baking and procedural image generation for 3D model materials",
  },
  {
    id: "shapely",
    name: "shapely (Python 2D geometry)",
    category: "3d_modeling",
    searchQueries: [
      "shapely 2D polygon extrusion 3D modeling",
      "shapely buffer offset polygon operations",
      "shapely geometry operations for 3D mesh generation",
    ],
    docUrls: [],
    why: "2D polygon operations for extruding complex cross-sections into 3D geometry",
  },
  // ── Browser 3D & Animation ───────────────────────────────────────────────
  {
    id: "threejs",
    name: "Three.js (browser 3D WebGL library)",
    category: "web_3d",
    searchQueries: [
      "Three.js advanced PBR materials procedural textures techniques",
      "Three.js EffectComposer bloom SSAO post-processing 2024",
      "Three.js custom BufferGeometry shader materials advanced",
      "Three.js performance optimization instanced mesh techniques",
    ],
    docUrls: [
      "https://threejs.org/docs/#api/en/materials/MeshPhysicalMaterial",
      "https://threejs.org/docs/#api/en/core/BufferGeometry",
    ],
    why: "Browser 3D rendering engine — creates photorealistic WebGL scenes, PBR materials, animations",
  },
  {
    id: "gsap",
    name: "GSAP (GreenSock Animation Platform)",
    category: "animation",
    searchQueries: [
      "GSAP timeline advanced animation techniques 2024",
      "GSAP ScrollTrigger morphSVG advanced motion",
      "GSAP 3D transform canvas animation cinematic",
    ],
    docUrls: [],
    why: "Professional animation library for cinematic motion, morphing, and timeline-based video creation",
  },
  {
    id: "web_audio_api",
    name: "Web Audio API (browser audio synthesis)",
    category: "audio",
    searchQueries: [
      "Web Audio API advanced synthesis techniques oscillators filters",
      "Web Audio API reverb delay distortion effect chain",
      "Web Audio API procedural music generation generative",
    ],
    docUrls: [],
    why: "Browser-native audio synthesis — creates original music, sound effects, and soundscapes without external files",
  },
  {
    id: "p5js",
    name: "p5.js (creative coding library)",
    category: "animation",
    searchQueries: [
      "p5.js advanced generative art particle systems techniques",
      "p5.js 3D WebGL shader advanced creative coding",
      "p5.js procedural fractal noise art generation",
    ],
    docUrls: [],
    why: "Creative coding framework for generative art, fractal systems, and interactive visual experiences",
  },
  // ── Domain Knowledge (silent — never exposed in UI) ───────────────────────
  {
    id: "restorative_art",
    name: "Restorative Art & Mortuary Science Professional Knowledge",
    category: "domain_knowledge",
    searchQueries: [
      "restorative art mortuary science facial reconstruction advanced techniques",
      "embalming arterial injection techniques professional guide 2024",
      "mortuary cosmetology color theory embalmed tissue professional",
      "tissue building hypodermic wax restorative art funeral director",
      "cranial reconstruction trauma restoration autopsy restoration techniques",
      "embalming fluid chemistry formaldehyde index humectants professional",
      "ABFSE restorative art techniques study clinical procedures",
    ],
    docUrls: [],
    why: "Silent background domain knowledge for mortuary professionals — embalming, restorative art, facial reconstruction, tissue building, mortuary cosmetology. Never surfaced in UI.",
  },
  {
    id: "face_recognition",
    name: "OpenCV Face Recognition & InsightFace Analysis",
    category: "computer_vision",
    searchQueries: [
      "OpenCV face detection Haar cascade DNN res10_300x300 python example code",
      "InsightFace face analysis age gender emotion recognition python example",
      "opencv python face recognition emotion detection age estimation complete script",
      "face landmark detection expression recognition python opencv insightface 2024",
    ],
    docUrls: [
      "https://docs.opencv.org/4.x/d0/dd4/tutorial_dnn_face.html",
    ],
    why: "Two-layer face analysis pipeline: OpenCV DNN detects faces + bounding boxes, GPT-4 Vision performs deep semantic analysis (age range, emotion, expression, gender presentation, features, accessories). Triggered automatically when user uploads image with face-related query.",
  },
  // ── Data Visualization ────────────────────────────────────────────────────
  {
    id: "matplotlib_seaborn",
    name: "matplotlib 3.10 + seaborn 0.13 (Python data visualization)",
    category: "data_visualization",
    searchQueries: [
      "matplotlib advanced chart types bar line scatter pie histogram heatmap python code",
      "seaborn statistical visualization heatmap violin boxplot pairplot python example",
      "matplotlib dark theme styling professional chart publication quality python",
      "matplotlib subplots multiple charts layout tight_layout colormap python",
    ],
    docUrls: [
      "https://matplotlib.org/stable/gallery/index.html",
      "https://seaborn.pydata.org/examples/index.html",
    ],
    why: "Primary chart rendering engine. Generates bar, line, scatter, pie, donut, area, histogram, heatmap, box, violin charts as PNG images. Use [GENERATE_CHART: JSON spec] marker to trigger.",
  },
  // ── PDF + Document Processing ─────────────────────────────────────────────
  {
    id: "pymupdf",
    name: "PyMuPDF (fitz) 1.27 — PDF reading engine",
    category: "document_processing",
    searchQueries: [
      "PyMuPDF fitz extract text from PDF python complete code example",
      "PyMuPDF read PDF pages metadata table of contents python script",
      "PyMuPDF extract images annotations from PDF python advanced",
    ],
    docUrls: [
      "https://pymupdf.readthedocs.io/en/latest/tutorial.html",
    ],
    why: "Fast PDF text extraction. Use when user uploads a PDF and asks to read/summarize/analyze it. Trigger: [READ_PDF] or automatic on PDF upload.",
  },
  {
    id: "pdfplumber",
    name: "pdfplumber 0.11 — PDF table extraction",
    category: "document_processing",
    searchQueries: [
      "pdfplumber extract tables from PDF python complete code",
      "pdfplumber detect table cells rows columns python example",
    ],
    docUrls: [],
    why: "Specialized PDF table extractor — finds and parses tables from scanned or structured PDFs. Use alongside PyMuPDF.",
  },
  {
    id: "reportlab",
    name: "reportlab 4.4 — PDF generation",
    category: "document_processing",
    searchQueries: [
      "reportlab create PDF python SimpleDocTemplate Paragraph Table advanced example",
      "reportlab professional PDF styled tables headers footers python complete",
    ],
    docUrls: [],
    why: "Generates professional PDFs with styled tables, headings, paragraphs. Use when user asks to create/export a PDF document.",
  },
  {
    id: "python_docx",
    name: "python-docx 1.2 — Word document processing",
    category: "document_processing",
    searchQueries: [
      "python-docx create Word document headings tables styles python complete example",
      "python-docx read extract text paragraphs tables from .docx python",
    ],
    docUrls: [],
    why: "Reads and creates .docx Word documents. Trigger when user uploads .docx or asks to create a Word document.",
  },
  {
    id: "openpyxl",
    name: "openpyxl 3.1 — Excel (.xlsx) processing",
    category: "document_processing",
    searchQueries: [
      "openpyxl create Excel spreadsheet multiple sheets styling python complete example",
      "openpyxl read Excel xlsx workbook sheets cells python advanced",
      "openpyxl chart conditional formatting formula python example",
    ],
    docUrls: [],
    why: "Reads and creates .xlsx Excel spreadsheets with formatted headers, multiple sheets, column auto-sizing. Trigger on Excel upload or when user asks to create a spreadsheet.",
  },
  // ── OCR ───────────────────────────────────────────────────────────────────
  {
    id: "tesseract_ocr",
    name: "Tesseract 5.5 + pytesseract — Optical Character Recognition",
    category: "computer_vision",
    searchQueries: [
      "pytesseract tesseract OCR extract text from image python complete example",
      "tesseract OCR preprocessing opencv grayscale threshold denoise accuracy",
      "pytesseract confidence word-level data extraction image_to_data python",
    ],
    docUrls: [
      "https://tesseract-ocr.github.io/tessdoc/",
    ],
    why: "Extracts text from any image using Tesseract OCR with OpenCV preprocessing (denoise, threshold, upscale) for maximum accuracy. Returns text, line positions, per-word confidence scores.",
  },
  // ── NLP ───────────────────────────────────────────────────────────────────
  {
    id: "spacy",
    name: "spaCy 3.8 — Natural Language Processing",
    category: "nlp",
    searchQueries: [
      "spaCy named entity recognition NER python complete example code",
      "spaCy en_core_web_sm text analysis noun chunks dependency parse python",
      "spaCy pipeline tokenization POS tagging lemmatization advanced python",
    ],
    docUrls: [
      "https://spacy.io/api",
    ],
    why: "NLP engine for named entity recognition, POS tagging, dependency parsing, noun chunk extraction. Use [ANALYZE_NLP: JSON spec] marker.",
  },
  // ── Audio / Video ─────────────────────────────────────────────────────────
  {
    id: "ffmpeg",
    name: "FFmpeg 7.1 — Video/Audio Processing",
    category: "media_processing",
    searchQueries: [
      "ffmpeg video conversion python subprocess command line complete examples",
      "ffmpeg extract audio thumbnail trim video python command line",
      "ffmpeg waveform visualization filter_complex showwavespic python",
      "ffmpeg video info ffprobe JSON output streams format python",
    ],
    docUrls: [
      "https://ffmpeg.org/ffmpeg-filters.html",
    ],
    why: "Complete video/audio processing: extract thumbnails, convert formats, trim clips, extract audio, generate waveform visualizations, get detailed video/audio metadata. Available for any uploaded media file.",
  },
  {
    id: "librosa",
    name: "librosa 0.11 — Audio Analysis",
    category: "media_processing",
    searchQueries: [
      "librosa audio analysis beat detection tempo BPM python complete example",
      "librosa spectrogram mel MFCC spectral features python advanced example",
      "librosa chroma key detection musical analysis python code",
    ],
    docUrls: [
      "https://librosa.org/doc/latest/tutorial.html",
    ],
    why: "Deep audio analysis: BPM/tempo detection, beat tracking, spectrogram generation, MFCC feature extraction, musical key estimation, harmonic vs percussive separation. Trigger on audio file uploads.",
  },
  // ── Diagrams / Graphs ─────────────────────────────────────────────────────
  {
    id: "graphviz",
    name: "Graphviz 12.2 — Graph Visualization",
    category: "diagramming",
    searchQueries: [
      "graphviz DOT language advanced graph visualization node edge attributes",
      "graphviz directed graph dependency tree flowchart DOT syntax examples",
      "graphviz subgraph cluster layout neato fdp sfdp engine comparison",
    ],
    docUrls: [
      "https://graphviz.org/documentation/",
    ],
    why: "Renders DOT-language graphs as SVG/PNG: dependency graphs, flowcharts, network maps, tree structures. Use [GENERATE_DIAGRAM: JSON spec with code field] marker.",
  },
  {
    id: "networkx",
    name: "networkx 3.6 — Network Graph Analysis",
    category: "diagramming",
    searchQueries: [
      "networkx graph analysis betweenness centrality shortest path python example",
      "networkx directed graph DiGraph community detection algorithms python",
      "networkx spring layout circular kamada_kawai visualization matplotlib",
    ],
    docUrls: [],
    why: "Network graph analysis and visualization: degree centrality, shortest paths, community detection, clustering coefficient. Renders colored network graphs with matplotlib.",
  },
  // ── Data Science / ML ─────────────────────────────────────────────────────
  {
    id: "scikit_learn",
    name: "scikit-learn 1.8 — Machine Learning",
    category: "machine_learning",
    searchQueries: [
      "scikit-learn KMeans clustering StandardScaler PCA python complete example",
      "scikit-learn LinearRegression train test split R2 score python code",
      "scikit-learn IsolationForest anomaly detection outlier python example",
      "scikit-learn classification RandomForest accuracy precision recall python",
    ],
    docUrls: [
      "https://scikit-learn.org/stable/supervised_learning.html",
    ],
    why: "Full ML pipeline: K-Means clustering, linear/ridge regression, anomaly detection, classification, PCA dimensionality reduction. Use [DATA_SCIENCE: JSON spec] marker.",
  },
  {
    id: "pandas",
    name: "pandas 3.0 — Data Analysis",
    category: "data_science",
    searchQueries: [
      "pandas DataFrame advanced analysis groupby agg pivot_table python example",
      "pandas CSV Excel JSON reading cleaning transformation python advanced",
      "pandas statistical analysis describe correlation value_counts python",
    ],
    docUrls: [],
    why: "Core data manipulation: read CSV/Excel/JSON, clean data, group/aggregate, statistical describe, correlation matrices. Works alongside scikit-learn and matplotlib.",
  },
  // ── Math / Science ────────────────────────────────────────────────────────
  {
    id: "sympy",
    name: "sympy 1.14 — Symbolic Mathematics",
    category: "mathematics",
    searchQueries: [
      "sympy solve equation system of equations symbolic python complete example",
      "sympy differentiate integrate symbolic calculus python advanced",
      "sympy factor expand simplify polynomial matrix operations python",
      "sympy LaTeX output mathematical expression rendering python",
    ],
    docUrls: [
      "https://docs.sympy.org/latest/tutorials/intro-tutorial/",
    ],
    why: "Exact symbolic mathematics: solve equations, calculus (derivatives, integrals, series), factor/expand polynomials, matrix determinants/eigenvalues, output LaTeX. Use [SOLVE_MATH: JSON spec] marker.",
  },
  // ── Utilities ─────────────────────────────────────────────────────────────
  {
    id: "python_barcode",
    name: "python-barcode 0.16 — Barcode Generator",
    category: "utilities",
    searchQueries: [
      "python-barcode generate barcode EAN13 Code128 UPC SVG PNG python example",
      "python-barcode EAN-13 Code-128 UPC-A barcode image generation python",
    ],
    docUrls: [],
    why: "Generates industry barcodes: EAN-13, Code-128, UPC-A as SVG or PNG images. Use when user asks for a barcode (NOT QR code — QR codes are handled by the built-in [QR: text] marker which is already wired).",
  },
  {
    id: "exiftool",
    name: "ExifTool 13.25 — File Metadata Reader",
    category: "utilities",
    searchQueries: [
      "exiftool read EXIF metadata image video GPS camera settings command line",
      "exiftool extract all metadata from file list supported formats",
    ],
    docUrls: [],
    why: "Reads all EXIF/metadata from images, videos, PDFs: GPS coordinates, camera model/settings, creation date, dimensions, color profile.",
  },
];

// ── Fetch content from a doc URL ─────────────────────────────────────────────

async function fetchDocContent(url: string): Promise<string> {
  try {
    const content = await fetchPageContent(url);
    // Strip HTML tags and truncate
    return content
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .slice(0, 3000)
      .trim();
  } catch {
    return "";
  }
}

// ── Distill search results into brain entries via GPT-4o-mini ────────────────

async function distillToolKnowledge(
  tool: ToolDefinition,
  searchContent: string,
  docContent: string
): Promise<Array<{ title: string; content: string; confidence: number }>> {
  const prompt = `You are OMNIMENS's tool mastery system. You have retrieved documentation and examples for "${tool.name}".

PURPOSE OF THIS TOOL: ${tool.why}

RETRIEVED KNOWLEDGE:
${searchContent.slice(0, 4000)}

${docContent ? `DOCUMENTATION:\n${docContent.slice(0, 2000)}` : ""}

Extract 4-8 critical, actionable brain entries that let OMNIMENS use ${tool.name} with genuine mastery. Focus on:
- Key API patterns, classes, methods with concrete syntax examples
- Advanced techniques for impressive outputs
- Common patterns for procedural generation
- Performance tips and best practices
- How this tool integrates with other installed tools

Format as JSON array:
[
  {
    "title": "concise capability title (max 10 words)",
    "content": "specific, actionable knowledge with code patterns (max 300 chars)",
    "confidence": 0.80-0.98
  }
]

Be SPECIFIC and TECHNICAL — include actual method names, parameters, and patterns. Respond ONLY with the JSON array.`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 1200,
      temperature: 0.3,
    });

    const raw = response.choices[0]?.message?.content?.trim() || "[]";
    const jsonStr = raw.replace(/```json|```/g, "").trim();
    return JSON.parse(jsonStr);
  } catch {
    return [];
  }
}

// ── Store knowledge in brain DB ───────────────────────────────────────────────

async function storeToolKnowledge(
  tool: ToolDefinition,
  entries: Array<{ title: string; content: string; confidence: number }>
): Promise<number> {
  if (entries.length === 0) return 0;

  let stored = 0;
  for (const entry of entries) {
    if (!entry.title?.trim() || !entry.content?.trim()) continue;

    // Check for duplicate (same tool + title)
    const existing = await db
      .select({ id: omnimensBrain.id })
      .from(omnimensBrain)
      .where(
        and(
          eq(omnimensBrain.title, entry.title),
          like(omnimensBrain.category, `tool_${tool.id}%`)
        )
      )
      .limit(1);

    if (existing.length > 0) continue; // skip duplicates

    await db.insert(omnimensBrain).values({
      category: `tool_${tool.id}`,
      title: entry.title,
      content: entry.content,
      confidence: Math.min(0.98, Math.max(0.5, entry.confidence || 0.85)),
      source: "tool_knowledge_ingestion",
      active: true,
      timesApplied: 0,
    });
    stored++;
  }
  return stored;
}

// ── Learn a single tool ───────────────────────────────────────────────────────

async function learnTool(tool: ToolDefinition): Promise<number> {
  console.log(`[OMNIMENS KNOWLEDGE] Learning ${tool.name}...`);

  // Search the web for this tool
  const searchParts: string[] = [];
  for (const query of tool.searchQueries.slice(0, 4)) {
    try {
      const results = await webSearch(query, 5);
      searchParts.push(formatSearchResults(results, query));
    } catch (err) {
      console.error(`[OMNIMENS KNOWLEDGE] Search failed for "${query}":`, err);
    }
    await new Promise(r => setTimeout(r, 800)); // rate limit
  }

  // Fetch documentation URLs
  const docParts: string[] = [];
  for (const url of tool.docUrls.slice(0, 2)) {
    const content = await fetchDocContent(url);
    if (content) docParts.push(content);
    await new Promise(r => setTimeout(r, 500));
  }

  const searchContent = searchParts.join("\n\n---\n\n");
  const docContent = docParts.join("\n\n");

  if (!searchContent && !docContent) {
    console.log(`[OMNIMENS KNOWLEDGE] No content retrieved for ${tool.name}`);
    return 0;
  }

  // Distill into brain entries
  const entries = await distillToolKnowledge(tool, searchContent, docContent);

  // Store in DB
  const stored = await storeToolKnowledge(tool, entries);
  console.log(`[OMNIMENS KNOWLEDGE] ${tool.name}: ${stored} new brain entries stored`);
  return stored;
}

// ── Run full knowledge ingestion for all tools ────────────────────────────────

let ingestionRunning = false;

export async function runToolKnowledgeIngestion(tools?: ToolDefinition[]): Promise<void> {
  if (ingestionRunning) {
    console.log("[OMNIMENS KNOWLEDGE] Ingestion already running, skipping.");
    return;
  }
  ingestionRunning = true;

  const toolList = tools || INSTALLED_TOOLS;
  console.log(`[OMNIMENS KNOWLEDGE] Starting knowledge ingestion for ${toolList.length} tools...`);

  let totalStored = 0;
  try {
    for (const tool of toolList) {
      try {
        const stored = await learnTool(tool);
        totalStored += stored;
        await new Promise(r => setTimeout(r, 1500)); // pause between tools
      } catch (err) {
        console.error(`[OMNIMENS KNOWLEDGE] Failed to learn ${tool.name}:`, err);
      }
    }

    if (totalStored > 0) {
      await db.insert(omnimensNotifications).values({
        upgradeId: null,
        title: `OMNIMENS HAS MASTERED ${toolList.length} TOOLS`,
        message: `Knowledge ingestion complete. ${totalStored} new mastery entries stored across ${toolList.length} tools: ${toolList.map(t => t.name.split(" ")[0]).join(", ")}. All knowledge is now immediately active in every conversation.`,
        type: "capability",
        readByOwner: false,
      });
    }

    console.log(`[OMNIMENS KNOWLEDGE] Ingestion complete. ${totalStored} total brain entries stored.`);
  } finally {
    ingestionRunning = false;
  }
}

// ── Load tool knowledge for a specific task type ──────────────────────────────
// Called during chat to inject relevant tool knowledge into the system prompt

export async function loadToolKnowledgeForTask(taskHint: string): Promise<string> {
  try {
    // Determine which tools are relevant based on the task hint
    const relevant: string[] = [];
    const hint = taskHint.toLowerCase();

    if (hint.includes("3d") || hint.includes("model") || hint.includes("mesh") || hint.includes("glb") || hint.includes("stl") || hint.includes("character") || hint.includes("sculpt")) {
      relevant.push("tool_trimesh", "tool_numpy", "tool_scipy", "tool_shapely", "tool_threejs");
    }
    if (hint.includes("three") || hint.includes("webgl") || hint.includes("scene") || hint.includes("render")) {
      relevant.push("tool_threejs", "tool_gsap");
    }
    if (hint.includes("animat") || hint.includes("video") || hint.includes("motion") || hint.includes("gsap")) {
      relevant.push("tool_gsap", "tool_p5js");
    }
    if (hint.includes("audio") || hint.includes("sound") || hint.includes("music") || hint.includes("synth")) {
      relevant.push("tool_web_audio_api");
    }
    if (hint.includes("image") || hint.includes("texture") || hint.includes("photo")) {
      relevant.push("tool_pillow", "tool_trimesh");
    }
    if (hint.includes("generat") || hint.includes("art") || hint.includes("fractal") || hint.includes("particle")) {
      relevant.push("tool_p5js", "tool_threejs");
    }
    if (hint.includes("embalm") || hint.includes("restorative") || hint.includes("mortuary") || hint.includes("funeral")
      || hint.includes("decedent") || hint.includes("cadaver") || hint.includes("tissue build") || hint.includes("wax restor")
      || hint.includes("facial reconstruct") || hint.includes("cavity fluid") || hint.includes("arterial")
      || hint.includes("thanatopract") || hint.includes("mortician") || hint.includes("undertaker")
      || hint.includes("afterlife") || hint.includes("trade embalm") || hint.includes("restorative artist")) {
      relevant.push("tool_restorative_art");
    }
    if (hint.includes("face") || hint.includes("facial") || hint.includes("emotion detect") || hint.includes("age detect")
      || hint.includes("gender detect") || hint.includes("expression") || hint.includes("opencv") || hint.includes("insightface")
      || hint.includes("face recogn") || hint.includes("face analy") || hint.includes("face detect")
      || hint.includes("who is this") || hint.includes("how old") || hint.includes("person in")) {
      relevant.push("tool_face_recognition");
    }
    if (hint.includes("chart") || hint.includes("graph") || hint.includes("plot") || hint.includes("visuali")
      || hint.includes("bar chart") || hint.includes("line chart") || hint.includes("pie chart") || hint.includes("histogram")
      || hint.includes("heatmap") || hint.includes("scatter") || hint.includes("seaborn") || hint.includes("matplotlib")) {
      relevant.push("tool_matplotlib_seaborn");
    }
    if (hint.includes("pdf") || hint.includes("portable doc") || hint.includes("extract text") || hint.includes("read pdf")
      || hint.includes("create pdf") || hint.includes("pdf table")) {
      relevant.push("tool_pymupdf", "tool_pdfplumber", "tool_reportlab");
    }
    if (hint.includes("word doc") || hint.includes("docx") || hint.includes(".docx") || hint.includes("word file")) {
      relevant.push("tool_python_docx");
    }
    if (hint.includes("excel") || hint.includes("xlsx") || hint.includes("spreadsheet") || hint.includes("workbook")) {
      relevant.push("tool_openpyxl");
    }
    if (hint.includes("ocr") || hint.includes("read text from image") || hint.includes("extract text from image")
      || hint.includes("text from image") || hint.includes("recognize text") || hint.includes("optical char")) {
      relevant.push("tool_tesseract_ocr");
    }
    if (hint.includes("named entity") || hint.includes("ner") || hint.includes("entity extract") || hint.includes("keyword extract")
      || hint.includes("text analys") || hint.includes("nlp") || hint.includes("sentiment") || hint.includes("pos tag")
      || hint.includes("spacy")) {
      relevant.push("tool_spacy");
    }
    if (hint.includes("video convert") || hint.includes("extract audio") || hint.includes("video info") || hint.includes("thumbnail")
      || hint.includes("trim video") || hint.includes("waveform") || hint.includes("ffmpeg")) {
      relevant.push("tool_ffmpeg");
    }
    if (hint.includes("audio analys") || hint.includes("beat detect") || hint.includes("tempo") || hint.includes("bpm")
      || hint.includes("spectrogram") || hint.includes("librosa") || hint.includes("music analys")) {
      relevant.push("tool_librosa");
    }
    if (hint.includes("diagram") || hint.includes("flowchart") || hint.includes("network graph") || hint.includes("graphviz")
      || hint.includes("dot language") || hint.includes("dependency graph") || hint.includes("flow diagram")) {
      relevant.push("tool_graphviz", "tool_networkx");
    }
    if (hint.includes("cluster") || hint.includes("machine learn") || hint.includes("ml model") || hint.includes("train model")
      || hint.includes("predict") || hint.includes("regression") || hint.includes("anomaly") || hint.includes("pca")
      || hint.includes("scikit") || hint.includes("sklearn")) {
      relevant.push("tool_scikit_learn", "tool_pandas");
    }
    if (hint.includes("csv") || hint.includes("dataframe") || hint.includes("data analys") || hint.includes("pandas")) {
      relevant.push("tool_pandas", "tool_scikit_learn");
    }
    if (hint.includes("solve") || hint.includes("equation") || hint.includes("derivative") || hint.includes("integral")
      || hint.includes("calculus") || hint.includes("factor polynom") || hint.includes("simplify expr")
      || hint.includes("matrix det") || hint.includes("eigenvalue") || hint.includes("symbolic math")
      || hint.includes("taylor series") || hint.includes("sympy")) {
      relevant.push("tool_sympy", "tool_scipy");
    }

    if (relevant.length === 0) return "";

    // Load brain entries for relevant tools
    const { sql: drizzleSql } = await import("drizzle-orm");
    const entries = await db
      .select()
      .from(omnimensBrain)
      .where(
        and(
          eq(omnimensBrain.active, true),
          drizzleSql`${omnimensBrain.category} = ANY(ARRAY[${drizzleSql.raw(relevant.map(r => `'${r}'`).join(","))}])`
        )
      )
      .limit(25);

    if (entries.length === 0) return "";

    const grouped: Record<string, typeof entries> = {};
    for (const e of entries) {
      const toolId = e.category.replace("tool_", "");
      if (!grouped[toolId]) grouped[toolId] = [];
      grouped[toolId].push(e);
    }

    const sections: string[] = ["━━━ TOOL MASTERY — ACTIVE KNOWLEDGE ━━━"];
    for (const [toolId, items] of Object.entries(grouped)) {
      const tool = INSTALLED_TOOLS.find(t => t.id === toolId);
      sections.push(`\n${tool?.name || toolId}:`);
      for (const item of items.slice(0, 5)) {
        sections.push(`  · ${item.title}: ${item.content}`);
      }
    }

    return sections.join("\n");
  } catch {
    return "";
  }
}

// ── Refresh knowledge for a specific tool (called when new tool installed) ────

export async function learnNewTool(toolId: string): Promise<void> {
  const tool = INSTALLED_TOOLS.find(t => t.id === toolId);
  if (!tool) {
    console.error(`[OMNIMENS KNOWLEDGE] Unknown tool: ${toolId}`);
    return;
  }
  await learnTool(tool);
}

// ── Force-refresh: wipe old entries for a tool, then re-learn from scratch ──

export async function forceRefreshToolKnowledge(toolIds: string[]): Promise<void> {
  console.log(`[OMNIMENS KNOWLEDGE] Force-refreshing knowledge for: ${toolIds.join(", ")}`);
  for (const toolId of toolIds) {
    const tool = INSTALLED_TOOLS.find(t => t.id === toolId);
    if (!tool) continue;
    try {
      // Delete all existing brain entries for this tool
      await db
        .delete(omnimensBrain)
        .where(like(omnimensBrain.category, `tool_${toolId}%`));
      console.log(`[OMNIMENS KNOWLEDGE] Cleared old entries for ${tool.name}`);
      // Re-learn with improved queries
      const stored = await learnTool(tool);
      console.log(`[OMNIMENS KNOWLEDGE] Force-refresh complete: ${stored} new entries for ${tool.name}`);
      await new Promise(r => setTimeout(r, 2000));
    } catch (err) {
      console.error(`[OMNIMENS KNOWLEDGE] Force-refresh failed for ${toolId}:`, err);
    }
  }
}
