/**
 * OMNIMENS Face Recognition & Analysis Engine
 * Copyright © 2024–2026 Alpha Unlimited Technologies, LLC
 *
 * Two-layer pipeline:
 *   Layer 1 — OpenCV (Python): Fast local face detection, bounding boxes, crop patches.
 *   Layer 2 — GPT-4 Vision: Deep semantic analysis — age, gender, emotion, expression,
 *             skin tone, hair, accessories, identity-safe insights.
 *
 * Used whenever the AI agent needs to analyze faces in uploaded images.
 */

import { execFile } from "child_process";
import { promisify } from "util";
import path from "path";
import { fileURLToPath } from "url";
import { openai } from "@workspace/integrations-openai-ai-server";

const execFileAsync = promisify(execFile);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PYTHON_SCRIPT = path.resolve(__dirname, "../python/face_analysis.py");
const PYTHON_BIN = process.env.PYTHON_BIN || "python3";

export interface FaceBox {
  face_index: number;
  x: number;
  y: number;
  width: number;
  height: number;
  confidence: number;
}

export interface FaceAnalysisResult {
  success: boolean;
  error?: string;
  face_count: number;
  image_width: number;
  image_height: number;
  bounding_boxes: FaceBox[];
  per_face_analysis: PerFaceAnalysis[];
  overall_scene_analysis: string;
  raw_full_image_b64?: string;
}

export interface PerFaceAnalysis {
  face_index: number;
  bounding_box: FaceBox;
  gpt4_analysis: {
    estimated_age_range?: string;
    gender_presentation?: string;
    detected_emotion?: string;
    secondary_emotions?: string[];
    expression?: string;
    eye_contact?: string;
    facial_features?: string;
    hair?: string;
    accessories?: string;
    skin_tone?: string;
    confidence_notes?: string;
    summary: string;
  };
}

// ── Layer 1: OpenCV face detection ────────────────────────────────────────────

async function runOpencvDetection(imageBase64: string): Promise<{
  success: boolean;
  face_count: number;
  bounding_boxes: FaceBox[];
  face_crops: { face_index: number; base64_jpeg: string }[];
  full_image_base64: string;
  image_width: number;
  image_height: number;
  error?: string;
}> {
  return new Promise((resolve) => {
    const { spawn } = require("child_process") as typeof import("child_process");
    const proc = spawn(PYTHON_BIN, [PYTHON_SCRIPT], {
      timeout: 30_000,
    });

    let stdout = "";
    let stderr = "";

    proc.stdout.on("data", (d: Buffer) => { stdout += d.toString(); });
    proc.stderr.on("data", (d: Buffer) => { stderr += d.toString(); });

    proc.on("close", (code: number) => {
      try {
        resolve(JSON.parse(stdout.trim()));
      } catch {
        resolve({
          success: false,
          error: stderr.slice(0, 500) || `Process exited with code ${code}`,
          face_count: 0,
          bounding_boxes: [],
          face_crops: [],
          full_image_base64: imageBase64,
          image_width: 0,
          image_height: 0,
        });
      }
    });

    proc.on("error", (err: Error) => {
      resolve({
        success: false,
        error: err.message,
        face_count: 0,
        bounding_boxes: [],
        face_crops: [],
        full_image_base64: imageBase64,
        image_width: 0,
        image_height: 0,
      });
    });

    // Write base64 image data to stdin, then close it
    proc.stdin.write(imageBase64);
    proc.stdin.end();
  });
}

// ── Layer 2: GPT-4 Vision deep analysis ───────────────────────────────────────

const FACE_ANALYSIS_SYSTEM_PROMPT = `You are OMNIMENS Face Analysis Engine, a world-class computer vision analyst.
Analyze the provided face image(s) with extreme detail and accuracy.

For each face/image, provide structured analysis covering:
- Estimated age range (e.g. "25–32 years")
- Gender presentation (descriptive, non-binary-aware)
- Primary detected emotion (joy, sadness, anger, fear, disgust, surprise, contempt, neutral)
- Secondary emotion overtones if present
- Facial expression description
- Eye contact / gaze direction
- Notable facial features
- Hair style/color
- Accessories (glasses, piercings, makeup, etc.)
- Skin tone description
- Overall confidence and engagement level

Be factual, detailed, and respectful. Return structured JSON only.`;

async function analyzeWithGPTVision(
  fullImageB64: string,
  faceCount: number,
  faceCrops: { face_index: number; base64_jpeg: string }[],
): Promise<{ per_face: PerFaceAnalysis["gpt4_analysis"][]; overall: string }> {
  const messages: any[] = [
    {
      role: "user",
      content: [
        {
          type: "text",
          text: `Analyze this image. ${faceCount > 0 ? `OpenCV detected ${faceCount} face(s).` : "No faces were detected by OpenCV — check if any are visible."} 
          
Provide:
1. Detailed analysis of each visible face (age range, emotion, expression, features, hair, accessories, etc.)
2. Overall scene description

Return JSON:
{
  "faces": [
    {
      "face_index": 0,
      "estimated_age_range": "...",
      "gender_presentation": "...",
      "detected_emotion": "...",
      "secondary_emotions": ["..."],
      "expression": "...",
      "eye_contact": "...",
      "facial_features": "...",
      "hair": "...",
      "accessories": "...",
      "skin_tone": "...",
      "confidence_notes": "...",
      "summary": "One sentence summary of this face"
    }
  ],
  "overall_scene_analysis": "Full scene description"
}`,
        },
        {
          type: "image_url",
          image_url: { url: `data:image/jpeg;base64,${fullImageB64}`, detail: "high" },
        },
        // Include up to 4 face crops for better per-face analysis
        ...faceCrops.slice(0, 4).map((c) => ({
          type: "image_url" as const,
          image_url: { url: `data:image/jpeg;base64,${c.base64_jpeg}`, detail: "high" },
        })),
      ],
    },
  ];

  try {
    const resp = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "system", content: FACE_ANALYSIS_SYSTEM_PROMPT }, ...messages],
      max_tokens: 2000,
      response_format: { type: "json_object" },
    });

    const text = resp.choices[0]?.message?.content?.trim() || "{}";
    const parsed = JSON.parse(text);
    return {
      per_face: parsed.faces || [],
      overall: parsed.overall_scene_analysis || "Scene analysis unavailable.",
    };
  } catch (err) {
    console.error("[FACE RECOGNITION] GPT-4 Vision error:", err);
    return {
      per_face: [],
      overall: "Vision analysis failed — face detection data only.",
    };
  }
}

// ── Main entry point ───────────────────────────────────────────────────────────

export async function analyzeFacesInImage(
  imageBase64OrUrl: string,
): Promise<FaceAnalysisResult> {
  console.log("[FACE RECOGNITION] Starting face analysis pipeline...");

  // Strip data URL prefix if present to pass raw base64 to python
  let b64 = imageBase64OrUrl;
  if (b64.startsWith("data:image")) {
    b64 = b64.split(",")[1] || b64;
  }

  // Layer 1: OpenCV detection
  const cvResult = await runOpencvDetection(b64);
  console.log(`[FACE RECOGNITION] OpenCV: ${cvResult.face_count} face(s) detected, success=${cvResult.success}`);

  if (!cvResult.success && !cvResult.full_image_base64) {
    return {
      success: false,
      error: cvResult.error || "OpenCV detection failed",
      face_count: 0,
      image_width: 0,
      image_height: 0,
      bounding_boxes: [],
      per_face_analysis: [],
      overall_scene_analysis: "",
    };
  }

  // Layer 2: GPT-4 Vision analysis
  const fullB64 = cvResult.full_image_base64 || b64;
  const visionResult = await analyzeWithGPTVision(fullB64, cvResult.face_count, cvResult.face_crops || []);

  // Combine results
  const perFaceAnalysis: PerFaceAnalysis[] = cvResult.bounding_boxes.map((box, i) => ({
    face_index: i,
    bounding_box: box,
    gpt4_analysis: visionResult.per_face[i] || {
      summary: `Face ${i + 1} detected at (${box.x}, ${box.y}) — ${Math.round(box.width)}×${Math.round(box.height)}px`,
    },
  }));

  // If GPT-4 found faces OpenCV missed (low light, profile view, etc.)
  if (visionResult.per_face.length > cvResult.bounding_boxes.length) {
    for (let i = cvResult.bounding_boxes.length; i < visionResult.per_face.length; i++) {
      perFaceAnalysis.push({
        face_index: i,
        bounding_box: { face_index: i, x: 0, y: 0, width: 0, height: 0, confidence: 0 },
        gpt4_analysis: visionResult.per_face[i] || { summary: `Additional face detected by Vision model` },
      });
    }
  }

  const totalFaces = Math.max(cvResult.face_count, visionResult.per_face.length);

  console.log(`[FACE RECOGNITION] Analysis complete — ${totalFaces} face(s) fully analyzed.`);

  return {
    success: true,
    face_count: totalFaces,
    image_width: cvResult.image_width,
    image_height: cvResult.image_height,
    bounding_boxes: cvResult.bounding_boxes,
    per_face_analysis: perFaceAnalysis,
    overall_scene_analysis: visionResult.overall,
  };
}

// ── Format result as readable markdown for chat ────────────────────────────────

export function formatFaceAnalysisForChat(result: FaceAnalysisResult): string {
  if (!result.success) {
    return `❌ Face analysis failed: ${result.error}`;
  }

  const lines: string[] = [];

  lines.push(`## 👁️ OMNIMENS Face Analysis`);
  lines.push(`**Faces Detected:** ${result.face_count}`);
  lines.push(`**Image Dimensions:** ${result.image_width} × ${result.image_height}px`);
  lines.push("");

  if (result.face_count === 0) {
    lines.push("No faces were detected in this image.");
    lines.push("");
    lines.push(`**Scene:** ${result.overall_scene_analysis}`);
    return lines.join("\n");
  }

  for (const face of result.per_face_analysis) {
    const a = face.gpt4_analysis;
    const box = face.bounding_box;
    lines.push(`### Face ${face.face_index + 1}${box.width > 0 ? ` (position: ${box.x},${box.y} — ${box.width}×${box.height}px)` : ""}`);
    if (a.estimated_age_range) lines.push(`- **Age Range:** ${a.estimated_age_range}`);
    if (a.gender_presentation) lines.push(`- **Gender Presentation:** ${a.gender_presentation}`);
    if (a.detected_emotion) {
      const secondary = a.secondary_emotions?.length ? ` *(with hints of ${a.secondary_emotions.join(", ")})*` : "";
      lines.push(`- **Primary Emotion:** ${a.detected_emotion}${secondary}`);
    }
    if (a.expression) lines.push(`- **Expression:** ${a.expression}`);
    if (a.eye_contact) lines.push(`- **Gaze / Eye Contact:** ${a.eye_contact}`);
    if (a.facial_features) lines.push(`- **Facial Features:** ${a.facial_features}`);
    if (a.hair) lines.push(`- **Hair:** ${a.hair}`);
    if (a.accessories) lines.push(`- **Accessories:** ${a.accessories}`);
    if (a.skin_tone) lines.push(`- **Skin Tone:** ${a.skin_tone}`);
    if (a.summary) lines.push(`- **Summary:** ${a.summary}`);
    lines.push("");
  }

  lines.push(`---`);
  lines.push(`**Scene Analysis:** ${result.overall_scene_analysis}`);

  return lines.join("\n");
}
