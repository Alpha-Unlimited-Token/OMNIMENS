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
  // ── 3D Software (headless, fully autonomous) ─────────────────────────────
  {
    id: "blender",
    name: "Blender 4.4 (headless bpy Python API)",
    category: "3d_modeling",
    searchQueries: [
      "Blender bpy Python API complete character model script example headless",
      "Blender Python subdivision surface smooth organic character creature script bpy",
      "Blender Principled BSDF procedural noise voronoi texture node script complete example",
      "Blender Python script BMesh extrude loop cut inset detailed mesh modeling",
      "Blender Python geometry nodes procedural mesh modifier stack complete script",
    ],
    docUrls: [
      "https://docs.blender.org/api/current/bpy.ops.mesh.html",
      "https://docs.blender.org/api/current/bpy.types.Modifier.html",
    ],
    why: "PRIMARY 3D engine — writes sophisticated bpy Python scripts for high-quality characters, organic shapes, PBR materials, modifiers, GLB export. Runs headlessly. Must produce cinema-quality output.",
  },
  {
    id: "openscad",
    name: "OpenSCAD 2021 (parametric 3D code)",
    category: "3d_modeling",
    searchQueries: [
      "OpenSCAD parametric 3D modeling tutorial examples",
      "OpenSCAD CSG union difference intersection advanced",
      "OpenSCAD hull minkowski for loop module library",
      "OpenSCAD mechanical gear bracket enclosure design",
    ],
    docUrls: [
      "https://openscad.org/documentation.html",
    ],
    why: "Parametric 3D engine — writes .scad code for mechanical/geometric/mathematical objects. Runs headlessly, exports STL→GLB.",
  },
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
    name: "scipy (Python scientific computing)",
    category: "math_science",
    searchQueries: [
      "scipy spatial convex hull Delaunay triangulation 3D",
      "scipy signal processing image generation",
      "scipy advanced geometry surface interpolation",
    ],
    docUrls: [],
    why: "Advanced spatial operations — Delaunay triangulation, convex hull, interpolation for complex geometry",
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

    if (hint.includes("3d") || hint.includes("model") || hint.includes("mesh") || hint.includes("glb") || hint.includes("stl") || hint.includes("blender") || hint.includes("bpy") || hint.includes("character") || hint.includes("sculpt")) {
      relevant.push("tool_blender", "tool_openscad", "tool_trimesh", "tool_numpy", "tool_scipy", "tool_shapely", "tool_threejs");
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
