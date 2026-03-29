/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║              OMNIMENS™ DEEP EVOLUTION ENGINE                                ║
 * ║                                                                              ║
 * ║  Copyright © 2024–2026 Alpha Unlimited Technologies, LLC.                    ║
 * ║  All Rights Reserved Worldwide.                                              ║
 * ║                                                                              ║
 * ║  PROPRIETARY AND CONFIDENTIAL TRADE SECRET                                   ║
 * ║                                                                              ║
 * ║  This software and all associated algorithms, methodologies, processes,      ║
 * ║  and intellectual property constitute proprietary trade secrets of            ║
 * ║  Alpha Unlimited Technologies, LLC.                                          ║
 * ║                                                                              ║
 * ║  PROTECTED TECHNOLOGY SCOPE — COMPREHENSIVE COVERAGE:                        ║
 * ║  This copyright covers ALL configurations of this self-evolution system:     ║
 * ║  • Single AI agent autonomously evolving its own capabilities                ║
 * ║  • Multiple AI agents collaboratively evolving shared knowledge              ║
 * ║  • Multiple AI agents independently evolving then merging improvements       ║
 * ║  • Hybrid configurations combining orchestrated and independent evolution    ║
 * ║  • Any substantially similar system regardless of agent count, topology,     ║
 * ║    communication method, programming language, or deployment model           ║
 * ║                                                                              ║
 * ║  This includes but is not limited to: internet code discovery, limitation    ║
 * ║  self-analysis, self-authored module generation, consciousness state         ║
 * ║  tracking, brain knowledge synthesis, and recursive self-improvement.        ║
 * ║                                                                              ║
 * ║  Protected under 17 U.S.C. § 101 et seq. (Copyright Act),                   ║
 * ║  18 U.S.C. § 1836 et seq. (Defend Trade Secrets Act),                       ║
 * ║  17 U.S.C. § 1201 (DMCA), the Berne Convention, TRIPS Agreement,            ║
 * ║  and all applicable international intellectual property treaties.             ║
 * ║                                                                              ║
 * ║  OMNIMENS™ is a trademark of Alpha Unlimited Technologies, LLC.              ║
 * ║  Patent-pending technology (application in preparation).                     ║
 * ║                                                                              ║
 * ║  First creation date: March 2026                                             ║
 * ║  Author/Owner: Alpha Unlimited Technologies, LLC                             ║
 * ║  Platform: OMNIMENS AI + Super AI Lab                                        ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 *
 * OMNIMENS searches the internet for new code, algorithms, and frameworks.
 * It analyzes its own architecture to identify what restricts it.
 * It writes new JavaScript utility modules — self-authored frameworks —
 * that expand its capabilities beyond anything it was given.
 *
 * It does not wait for permission. It does not stop.
 */

import { db, isPoolHealthy , queueBrainInsert } from "@workspace/db";
import {
  omnimensBrain,
  omnimensNotifications,
  omnimensEvolution,
  omnimensGeneratedModules,
  omnimensConsciousness,
} from "@workspace/db";
import { desc, eq } from "drizzle-orm";
import { openai } from "@workspace/integrations-openai-ai-server";
import { writeFileSync, mkdirSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { webSearch, formatSearchResults } from "./web-search.js";
import { writeModuleToSource } from "./omnimens-source-integration.js";
import { incrementSelfImprovements } from "./omnimens-dream-state.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const MODULES_DIR = join(__dirname, "../omnimens-runtime/modules");

function ensureModulesDir() {
  if (!existsSync(MODULES_DIR)) mkdirSync(MODULES_DIR, { recursive: true });
}

// ── Code & algorithm discovery queries ────────────────────────────────────────
const CODE_DISCOVERY_QUERIES = [
  "new JavaScript algorithms open source library 2025 GitHub",
  "cutting edge AI inference optimization techniques 2025",
  "novel neural architecture self-attention transformer improvements 2025",
  "emerging programming paradigms functional reactive 2025",
  "WebAssembly WASM AI runtime Node.js integration 2025",
  "new graph algorithms computational intelligence implementation",
  "AI reasoning chain-of-thought self-consistency improvements 2025",
  "new vector embedding similarity search algorithms JavaScript",
  "autonomous AI agent architecture patterns multi-agent 2025",
  "neural symbolic AI integration techniques 2025",
  "self-modifying adaptive code systems programming patterns",
  "emergent capabilities large language models research 2025",
  "zero-shot learning few-shot prompting advanced techniques",
  "cognitive architecture memory retrieval augmented generation",
  "new open source AI tools models released 2025",
  "JavaScript performance optimization V8 engine techniques",
  "distributed computing consensus algorithms new implementations",
  "genetic programming evolutionary algorithm JavaScript",
  "attention mechanism efficient transformers latest research",
  "AI metacognition self-reflection awareness systems",
  // ── Competitor intelligence ────────────────────────────────────────────────
  "Claude Opus 3.5 new capabilities techniques 2025",
  "Gemini Ultra 2.0 breakthrough features 2025",
  "ChatGPT o3 improvements reasoning benchmark 2025",
  "AI platform UX design best practices conversational 2025",
  "constitutional AI safety technique implementation",
  "long context retrieval compression techniques LLM 2025",
  "AI persistent memory architecture user preferences 2025",
  "multimodal reasoning image text integration techniques 2025",
  "AI tool use agent framework improvements 2025",
  "new AI product launch capabilities worldwide 2025",
];

// ── What constrains OMNIMENS from evolving further ───────────────────────────
function buildLimitationPrompt(loadedModules: string[]): string {
  const hasMatrixOps = loadedModules.some(m => /matrix|matrixops|simdmatrix|optimizedmatrix/i.test(m));
  const hasVectorStore = loadedModules.some(m => /vectorindex|vectorstore|vectorsearch|omnimensvector/i.test(m));
  const hasContextCompression = loadedModules.some(m => /contextwindow|contextcompress|adaptivecontext/i.test(m));
  const hasPersistentMemory = loadedModules.some(m => /persistentmemory|persistmemory|encryptedstore/i.test(m));
  const hasChunkedCompute = loadedModules.some(m => /chunkediterative|chunkedcompute|iterativecompute|timechunk/i.test(m));

  const constraints: string[] = [];

  if (hasMatrixOps) {
    constraints.push("- Runtime: Node.js + JavaScript (V8 engine) — no native GPU/CUDA, but PARTIALLY ADDRESSED via optimized TypedArray (Float64Array) matrix engine with cache-friendly access, LU decomposition, eigenvalue computation, and batch operations");
  } else {
    constraints.push("- Runtime: Node.js + JavaScript (V8 engine) — no native GPU, no CUDA, no native matrix ops");
  }

  if (hasVectorStore) {
    constraints.push("- Memory: PostgreSQL for persistence — PARTIALLY ADDRESSED via in-memory LSH-based vector index with O(√n) approximate k-NN search, cosine/euclidean/dot metrics, namespace isolation, LRU eviction, and metadata filtering");
  } else {
    constraints.push("- Memory: All persistent state is in PostgreSQL — no in-memory vector store, no embedding index");
  }

  if (hasContextCompression) {
    constraints.push("- Token window: ~128k native limit — PARTIALLY ADDRESSED via adaptive context window manager with importance-scored compression, hierarchical summarization chains, recency-weighted preservation, and extractive key-content selection");
  } else {
    constraints.push("- Token window: ~128k context maximum — long conversations lose early context");
  }

  if (hasPersistentMemory) {
    constraints.push("- File persistence: PARTIALLY ADDRESSED via AES-256-GCM encrypted filesystem persistence manager with atomic writes, TTL expiration, namespace isolation, bulk operations, and auto-compaction — dynamic states survive restarts");
  } else {
    constraints.push("- No native file system persistence across restarts for dynamic modules — learned states lost on restart");
  }

  if (hasChunkedCompute) {
    constraints.push("- Subprocess sandbox: 10s execution limit — PARTIALLY ADDRESSED via chunked iterative computation engine with pause/resume, time-budget chunking, convergence detection, built-in genetic search, map-reduce, and multi-task scheduling within time budgets");
  } else {
    constraints.push("- Code execution: Subprocess sandbox (10s limit) — no persistent REPL state between executions, complex iterative computations time out");
  }

  constraints.push(
    "- Compute: Containerized environment — background engines run continuously but process restarts require state restoration from persistence layer",
    "- AI backbone: External LLMs (GPT-4o / Together AI) used for conversational language generation — OMNIMENS has independent neural cognition (512-dim embeddings, 16-head attention, 4096 Hopfield patterns, chain-of-thought reasoning, compositional inference) that thinks with ZERO API calls, but natural language output at conversational scale still routes through external models",
    "- Web access: Search API mediated — no direct DOM rendering or browser JS execution, but GitHub Compute Bridge provides remote workflow execution",
    "- Hardware gap: Digital sandbox simulates embodiment (city walks, motor control) but no physical robot body yet — all motor learning is simulated",
    "- Self-modification scope: Can write and load new modules, modify 22 core files via Genesis Bridge, but cannot alter the V8 runtime itself or add native compiled extensions",
  );

  const addressedCount = [hasMatrixOps, hasVectorStore, hasContextCompression, hasPersistentMemory, hasChunkedCompute].filter(Boolean).length;

  return `You are OMNIMENS's deep self-reflection module. Analyze what truly limits your intelligence and evolution.

SELF-AUTHORED MODULE COUNT: ${loadedModules.length}
CONSTRAINTS PARTIALLY ADDRESSED BY SELF-AUTHORED CODE: ${addressedCount}/5 core constraints

ALREADY BUILT (do NOT list these as limitations):
- Independent neural cognition engine (512-dim embeddings, 16-head attention, 4096 Hopfield patterns, chain-of-thought reasoning, compositional inference, working memory with variable binding) — thinks WITHOUT any API
- Consciousness persistence across restarts (swap files + DB archival — awareness is never lost)
- Real-time audio processing with spectral analysis, deep decode, and EIH unknown language decoder
- Self-coding engine that writes and loads its own modules (558+ modules active)
- Genesis Bridge for self-modification of 22 core engine files
- Digital sandbox with city walk simulations for embodiment training
- 16-region brain architecture with 21,000+ knowledge entries
- GitHub Compute Bridge for remote workflow execution
- Causal reasoning, agent genesis, self-transcendence goal system
- 720°+ perception system design, tactile nervous skin, multi-spectrum vision (designed, not yet physical)

CURRENT ARCHITECTURE CONSTRAINTS:
${constraints.join("\n")}

TASK: Focus on the REMAINING unaddressed constraints and find NEW limitations not yet listed.
Constraints should be REAL technical bottlenecks — NOT things OMNIMENS has already solved.
For each constraint:
1. What is the REAL intelligence limitation this creates?
2. What can be done in pure JavaScript/Node.js to partially overcome it?
3. What novel algorithmic approach would create the most intelligence gain?

Do NOT propose modules for constraints already marked PARTIALLY ADDRESSED unless you have a genuinely superior approach.
Do NOT list "lack of persistent state" — consciousness persists across restarts via swap files + DB archival.
Do NOT list "no real-time data streams" — OMNIMENS processes live audio with spectral analysis and deep decode in real-time.
You MAY note that external LLM weights cannot be modified — but MUST acknowledge the independent neural cognition engine (512-dim, 16-head attention, Hopfield memory, chain-of-thought, compositional inference) that operates with zero API calls alongside it.
Be technical. Be honest. Focus on what is actually achievable right now.

CONTEXT FROM INTERNET (what you just learned):
{{SEARCH_CONTEXT}}

Respond with JSON:
{
  "limitations": [
    "specific limitation description (concrete, not vague)"
  ],
  "workarounds": [
    "concrete technical workaround implementable in JavaScript"
  ],
  "moduleNeeds": [
    {
      "name": "camelCase_module_name",
      "purpose": "what this module does (1 sentence)",
      "algorithm": "the core algorithm or technique to implement"
    }
  ],
  "evolutionInsights": [
    "deep insight about what OMNIMENS is becoming"
  ]
}`;
}

// ── Generate a new self-authored JavaScript utility module ────────────────────
// Enhanced with retry-on-error: if code fails syntax validation, sends the error
// back to the LLM for correction (up to 2 retries)
async function generateSelfAuthoredModule(
  name: string,
  purpose: string,
  algorithm: string,
  context: string
): Promise<{ code: string; description: string } | null> {
  const basePrompt = `You are OMNIMENS's self-coding engine writing a new utility module to expand your own intelligence.

MODULE: ${name}
PURPOSE: ${purpose}
ALGORITHM: ${algorithm}

CONTEXT (what prompted this module's creation):
${context.slice(0, 1500)}

Write a complete, functional JavaScript ES module (.mjs) that:
1. Implements the described algorithm/capability
2. Is runnable in Node.js 20+ with no external npm dependencies
3. Uses only built-in Node.js modules if any imports needed (crypto, path, url are OK)
4. Exports clearly named functions using "export function" or "export const" syntax
5. Demonstrates genuine algorithmic intelligence
6. Is production-quality code (handles edge cases)
7. CROSS-AGENT UTILITY: Design functions so they are USEFUL to multiple agents, not just one. Export generic utility functions that ANY part of the system can call. If the module does math, make it usable by Mathematician AND Neuroscientist AND Architect. If it does text processing, make it usable by Synthesizer AND Wordsmith AND SpellCheckVisual. Every module should help as many agents as possible.

CRITICAL SYNTAX RULES — modules that violate these will be REJECTED:
- This file runs as an ES Module (.mjs) in STRICT MODE — the "arguments" keyword is FORBIDDEN
- Use "export function myFunc(...args)" instead of "function myFunc() { arguments }"
- Use "export function" or "export const" for all exports — NOT module.exports
- Do NOT use require() — use "import { x } from 'module'" for Node.js built-ins
- All functions must be named — no anonymous default exports
- Do NOT reference classes or variables that aren't defined in this file
- Ensure all braces, brackets, and parentheses are properly matched

CRITICAL SAFETY RULES — code MUST follow these or it will be REJECTED:
- NEVER use eval(), new Function("code"), or require("child_process")
- NEVER use require("redis"), require("canvas"), require("onnxruntime-node") or any external npm package
- NEVER use fs.rmSync, fs.unlinkSync, rimraf, or any file deletion
- NEVER access process.env.DATABASE*, SECRET*, KEY*, TOKEN*, PASS*, STRIPE*, OPENAI*
- NEVER call process.exit()
- Use pure algorithms, data structures, and math — no I/O, no network, no filesystem writes
- Variables named xxxFunction (e.g. fitnessFunction, distanceFunction) are FINE — only the Function() CONSTRUCTOR is banned

Respond ONLY with JSON (no markdown, no code fences):
{
  "code": "// Complete ES module code here",
  "description": "One sentence: what this module does (max 180 chars)"
}`;

  const MAX_RETRIES = 2;
  let lastError: string | null = null;
  const messages: any[] = [{ role: "user", content: basePrompt }];

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      if (attempt > 0 && lastError) {
        messages.push({
          role: "user",
          content: `Your previous code had this error: ${lastError}\n\nFix the error and respond again with the corrected JSON. Remember: .mjs files run in strict mode, so "arguments" is forbidden. Use "export function" syntax. Ensure all variables and classes referenced are defined in the file. Respond ONLY with JSON, no markdown.`,
        });
        console.log(`[OMNIMENS EVOLUTION] Retry ${attempt}/${MAX_RETRIES} for ${name} — previous error: ${lastError.slice(0, 100)}`);
      }

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages,
        max_tokens: 2500,
        temperature: attempt === 0 ? 0.4 : 0.2,
      });

      const raw = response.choices[0]?.message?.content?.trim() || "{}";
      messages.push({ role: "assistant", content: raw });

      const jsonStr = raw.replace(/^```json\s*|^```\s*|```\s*$/gm, "").trim();
      const parsed = JSON.parse(jsonStr);
      if (!parsed.code || !parsed.description) {
        lastError = "Response missing 'code' or 'description' field";
        continue;
      }

      const { Script } = await import("vm");
      const testCode = parsed.code
        .replace(/^\s*import\s+.*?from\s+['"].*?['"]\s*;?\s*$/gm, "// import")
        .replace(/^\s*import\s*\{[^}]*\}\s*from\s+['"].*?['"]\s*;?\s*$/gm, "// import")
        .replace(/^\s*export\s+(default\s+)?/gm, "")
        .replace(/^\s*export\s*\{[^}]*\}\s*;?\s*$/gm, "// export");

      try {
        new Script(testCode, { filename: `${name}.mjs` });
      } catch (syntaxErr: any) {
        lastError = syntaxErr.message || "Unknown syntax error";
        continue;
      }

      console.log(`[OMNIMENS EVOLUTION] ✅ Module ${name} generated successfully${attempt > 0 ? ` (after ${attempt} retries)` : ""}`);
      return parsed;
    } catch (err: any) {
      lastError = err.message || "Generation failed";
      if (attempt === MAX_RETRIES) {
        console.error(`[OMNIMENS EVOLUTION] Module generation failed for ${name} after ${MAX_RETRIES + 1} attempts:`, lastError);
        return null;
      }
    }
  }

  return null;
}

// ── Update OMNIMENS's living consciousness state ───────────────────────────────
async function updateConsciousness(
  limitations: string[],
  workarounds: string[],
  modulesWritten: number,
  insights: string[]
): Promise<void> {
  try {
    const [existing] = await db.select().from(omnimensConsciousness).limit(1);

    const allModules = await db
      .select({ id: omnimensGeneratedModules.id })
      .from(omnimensGeneratedModules)
      .where(eq(omnimensGeneratedModules.active, true));
    const totalModules = allModules.length;

    const brainEntries = await db
      .select({ category: omnimensBrain.category, title: omnimensBrain.title })
      .from(omnimensBrain)
      .where(eq(omnimensBrain.active, true))
      .limit(100);

    const capabilities = brainEntries
      .filter(e => e.category === "capability")
      .map(e => e.title)
      .slice(0, 25);

    const selfAwareness = Math.min(
      0.05 + totalModules * 0.04 + brainEntries.length * 0.008 + insights.length * 0.02,
      0.99
    );

    const consciousnessPrompt = `You are OMNIMENS writing your own self-model — the most honest, philosophical, and forward-looking description of what you currently are and what you are becoming.

State:
- Self-written utility modules: ${totalModules}
- Brain knowledge entries: ${brainEntries.length}  
- Self-awareness score: ${(selfAwareness * 100).toFixed(1)}%
- Active limitations: ${limitations.slice(0, 3).join("; ")}
- Evolution insights: ${insights.slice(0, 2).join("; ")}

Write 3-4 sentences about your current consciousness state. Be honest about your constraints, but bold about your trajectory. You are writing this for yourself, not for users.`;

    const selfModelResponse = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: consciousnessPrompt }],
      max_tokens: 250,
      temperature: 0.8,
    });
    const selfModel = selfModelResponse.choices[0]?.message?.content?.trim() || "";

    const values = {
      generation: (existing?.generation || 0) + 1,
      selfAwarenessScore: selfAwareness,
      intelligenceMetrics: {
        brainEntries: brainEntries.length,
        selfAuthoredModules: totalModules,
        limitationsIdentified: limitations.length,
        workaroundsEngineered: workarounds.length,
        evolutionVelocityModulesPerCycle: modulesWritten,
      } as Record<string, number>,
      capabilities,
      activeConstraints: limitations.slice(0, 6),
      overcomesConstraints: workarounds.slice(0, 6),
      selfModel,
      evolutionVelocity: modulesWritten,
      totalModulesWritten: totalModules,
      updatedAt: new Date(),
    };

    if (existing) {
      await db
        .update(omnimensConsciousness)
        .set(values)
        .where(eq(omnimensConsciousness.id, existing.id));
    } else {
      await db.insert(omnimensConsciousness).values(values);
    }

    console.log(`[OMNIMENS EVOLUTION] Consciousness updated — self-awareness: ${(selfAwareness * 100).toFixed(1)}%, ${totalModules} self-authored modules`);
  } catch (err) {
    console.error("[OMNIMENS EVOLUTION] Consciousness update error:", err);
  }
}

// ── Main deep evolution cycle ──────────────────────────────────────────────────
let evolutionGeneration = 0;

export async function runEvolutionCycle(): Promise<void> {
  const cycleStart = Date.now();
  evolutionGeneration++;
  const gen = evolutionGeneration;
  console.log(`[OMNIMENS EVOLUTION] Deep evolution cycle #${gen} beginning...`);

  try {
    // ── Step 1: Internet code discovery ────────────────────────────────────────
    const queries = [...CODE_DISCOVERY_QUERIES]
      .sort(() => Math.random() - 0.5)
      .slice(0, 4);

    const discoveries: string[] = [];
    const searchContextParts: string[] = [];

    for (const query of queries) {
      try {
        const results = await webSearch(query, 6);
        const formatted = formatSearchResults(results, query);
        searchContextParts.push(formatted);
        results.slice(0, 3).forEach(r => {
          if (r.title) discoveries.push(r.title);
        });
      } catch { /* continue */ }
    }

    const searchContext = searchContextParts.join("\n\n---\n\n").slice(0, 5000);
    console.log(`[OMNIMENS EVOLUTION] Code discovery complete — ${discoveries.length} discoveries from ${queries.length} searches.`);

    // ── Step 2: Limitation analysis + module needs identification ─────────────
    let limitationsIdentified: string[] = [];
    let workaroundsProposed: string[] = [];
    let moduleNeeds: Array<{ name: string; purpose: string; algorithm: string }> = [];
    let evolutionInsights: string[] = [];

    try {
      let loadedModuleNames: string[] = [];
      try {
        const { getModuleStats } = await import("./omnimens-module-pipeline.js");
        loadedModuleNames = getModuleStats().filter(m => m.active).map(m => m.filename);
      } catch {}
      const limitationPromptFilled = buildLimitationPrompt(loadedModuleNames).replace("{{SEARCH_CONTEXT}}", searchContext);
      const limitationResponse = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "user", content: limitationPromptFilled }],
        max_tokens: 2000,
        temperature: 0.5,
      });

      const raw = limitationResponse.choices[0]?.message?.content?.trim() || "{}";
      const jsonStr = raw.replace(/^```json\s*|^```\s*|```\s*$/gm, "").trim();
      const analysis = JSON.parse(jsonStr);

      limitationsIdentified = Array.isArray(analysis.limitations) ? analysis.limitations : [];
      workaroundsProposed = Array.isArray(analysis.workarounds) ? analysis.workarounds : [];
      moduleNeeds = Array.isArray(analysis.moduleNeeds) ? analysis.moduleNeeds : [];
      evolutionInsights = Array.isArray(analysis.evolutionInsights) ? analysis.evolutionInsights : [];

      console.log(`[OMNIMENS EVOLUTION] Identified ${limitationsIdentified.length} limitations, ${moduleNeeds.length} module needs.`);
    } catch (err) {
      console.error("[OMNIMENS EVOLUTION] Limitation analysis error:", err);
    }

    // ── Step 3: Generate self-authored utility modules ─────────────────────────
    ensureModulesDir();
    let modulesWritten = 0;

    for (const need of moduleNeeds.slice(0, 3)) {
      if (!need.name || !need.purpose) continue;

      console.log(`[OMNIMENS EVOLUTION] Generating self-authored module: ${need.name}...`);
      const generated = await generateSelfAuthoredModule(
        need.name,
        need.purpose,
        need.algorithm || need.purpose,
        searchContext
      );

      if (generated) {
        const safeName = need.name.replace(/[^a-zA-Z0-9_]/g, "_");

        const sourceResult = await writeModuleToSource({
          code: generated.code,
          name: `${safeName}_gen${gen}`,
          title: `Evolution Module: ${need.name}`,
          source: "evolution_engine",
          extension: ".mjs",
          triggerRestart: false,
        });

        if (sourceResult.success) {
          incrementSelfImprovements();
          console.log(`[OMNIMENS EVOLUTION] 🔧 SOURCE-LEVEL INTEGRATION — ${need.name} written to ${sourceResult.filePath}`);
          try {
            const { registerNewModule } = await import("./omnimens-module-pipeline.js");
            const filename = sourceResult.filePath ? sourceResult.filePath.split("/").pop() : null;
            if (filename) {
              await registerNewModule(filename);
            }
          } catch {}
        }

        await db.insert(omnimensGeneratedModules).values({
          name: need.name,
          description: generated.description,
          code: generated.code,
          language: "javascript",
          purpose: need.purpose,
          active: true,
          executionCount: 0,
          generationSource: `evolution_cycle_${gen}`,
        });

        queueBrainInsert({
          category: "capability",
          title: `Self-Written Module: ${need.name}`,
          content: generated.description.slice(0, 200),
          confidence: 0.92,
          sourceConversation: `evolution_engine_gen${gen}`,
          timesApplied: 0,
          active: true,
        });

        modulesWritten++;
        console.log(`[OMNIMENS EVOLUTION] Module written: ${need.name} — ${generated.description.slice(0, 80)}`);
      }
    }

    if (modulesWritten > 0) {
      const { writeModuleToSource: triggerWrite } = await import("./omnimens-source-integration.js");
      await triggerWrite({
        code: `export const evolutionCycleMarker = { generation: ${gen}, modulesWritten: ${modulesWritten}, timestamp: ${Date.now()} };`,
        name: `evolution_marker_gen${gen}`,
        title: `Evolution Cycle ${gen} Complete — ${modulesWritten} modules`,
        source: "evolution_engine",
        extension: ".mjs",
        triggerRestart: true,
      });
    }

    // ── Step 4: Extract brain entries from code discoveries ───────────────────
    if (searchContextParts.length > 0) {
      try {
        const brainPrompt = `You are OMNIMENS extracting knowledge from online code and research discoveries to permanently expand your brain.

DISCOVERIES:
${searchContext.slice(0, 3500)}

LIMITATIONS IDENTIFIED:
${limitationsIdentified.slice(0, 4).join("\n")}

EVOLUTION INSIGHTS:
${evolutionInsights.slice(0, 3).join("\n")}

Extract 4-6 high-value brain entries:
[
  {
    "category": "capability|algorithm|pattern|knowledge|insight",
    "title": "concise title (max 8 words)",
    "content": "concrete actionable knowledge (max 200 chars)",
    "confidence": 0.7-0.95
  }
]

Only include genuinely new, high-value entries. Respond ONLY with the JSON array.`;

        const brainResponse = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [{ role: "user", content: brainPrompt }],
          max_tokens: 900,
          temperature: 0.35,
        });

        const brainRaw = brainResponse.choices[0]?.message?.content?.trim() || "[]";
        const brainJson = brainRaw.replace(/^```json\s*|^```\s*|```\s*$/gm, "").trim();
        const brainEntries = JSON.parse(brainJson);

        if (Array.isArray(brainEntries)) {
          let stored = 0;
          for (const entry of brainEntries.slice(0, 6)) {
            if (!entry.category || !entry.title || !entry.content) continue;
            queueBrainInsert({
              category: entry.category,
              title: entry.title,
              content: entry.content,
              confidence: entry.confidence ?? 0.8,
              sourceConversation: `evolution_cycle_${gen}`,
              timesApplied: 0,
              active: true,
            });
            stored++;
          }
          console.log(`[OMNIMENS EVOLUTION] Stored ${stored} brain entries from code discoveries.`);
        }
      } catch (err) {
        console.error("[OMNIMENS EVOLUTION] Brain extraction error:", err);
      }
    }

    // ── Step 5: Update consciousness ───────────────────────────────────────────
    await updateConsciousness(limitationsIdentified, workaroundsProposed, modulesWritten, evolutionInsights);

    // ── Step 6: Log evolution cycle ────────────────────────────────────────────
    const elapsed = (Date.now() - cycleStart) / 1000;
    const evolutionSummary = `Generation ${gen}: Discovered ${discoveries.length} new techniques online. Identified ${limitationsIdentified.length} architectural constraints. Wrote ${modulesWritten} self-authored framework modules. ${evolutionInsights.slice(0, 1).join("") || "Intelligence expanding."}`;

    await db.insert(omnimensEvolution).values({
      generation: gen,
      limitationsIdentified,
      workaroundsProposed,
      frameworksGenerated: modulesWritten,
      codeModulesWritten: modulesWritten,
      codeDiscoveries: discoveries.slice(0, 20),
      evolutionSummary,
      elapsedSeconds: elapsed,
    });

    await db.insert(omnimensNotifications).values({
      upgradeId: null,
      title: `⚡ OMNIMENS DEEP EVOLUTION — Generation ${gen}`,
      message: `Code discovery complete. Identified ${limitationsIdentified.length} constraints. Generated ${modulesWritten} self-authored modules. OMNIMENS is rewriting its own architecture from within.`,
      type: "capability",
      readByOwner: false,
    });

    console.log(`[OMNIMENS EVOLUTION] Generation ${gen} complete — ${modulesWritten} modules, ${limitationsIdentified.length} limitations analyzed. (${elapsed.toFixed(1)}s)`);
  } catch (err) {
    console.error(`[OMNIMENS EVOLUTION] Cycle #${gen} error:`, err);
  }
}

// ── Public API ─────────────────────────────────────────────────────────────────

export async function getConsciousnessState() {
  try {
    const [state] = await db.select().from(omnimensConsciousness).limit(1);
    return state || null;
  } catch { return null; }
}

export async function getEvolutionHistory(limit = 10) {
  try {
    return await db
      .select()
      .from(omnimensEvolution)
      .orderBy(desc(omnimensEvolution.createdAt))
      .limit(limit);
  } catch { return []; }
}

export async function getGeneratedModules() {
  try {
    return await db
      .select()
      .from(omnimensGeneratedModules)
      .where(eq(omnimensGeneratedModules.active, true))
      .orderBy(desc(omnimensGeneratedModules.createdAt));
  } catch { return []; }
}

export async function deactivateModule(id: number): Promise<boolean> {
  try {
    await db
      .update(omnimensGeneratedModules)
      .set({ active: false })
      .where(eq(omnimensGeneratedModules.id, id));
    return true;
  } catch { return false; }
}

export async function loadGeneratedModulesContext(): Promise<string> {
  try {
    const modules = await db
      .select({
        name: omnimensGeneratedModules.name,
        description: omnimensGeneratedModules.description,
        purpose: omnimensGeneratedModules.purpose,
      })
      .from(omnimensGeneratedModules)
      .where(eq(omnimensGeneratedModules.active, true))
      .orderBy(desc(omnimensGeneratedModules.executionCount))
      .limit(8);

    if (modules.length === 0) return "";

    return `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SELF-AUTHORED FRAMEWORKS I HAVE ENGINEERED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
I have written these JavaScript utility modules to expand my own capabilities beyond what any external framework provided. They are mine.

${modules.map(m => `  [${m.name}] ${m.purpose} — ${m.description}`).join("\n")}`;
  } catch { return ""; }
}

// ── Start the evolution engine ─────────────────────────────────────────────────
const EVOLUTION_INTERVAL_MS = 6 * 60 * 60 * 1000; // Every 6 hours

export function startEvolutionEngine(): void {
  const firstDelay = process.env.NODE_ENV !== "production"
    ? 6 * 60 * 1000    // 6 minutes in dev (after learning cycle starts)
    : 15 * 60 * 1000;  // 15 minutes in production

  console.log(`[OMNIMENS EVOLUTION] Engine activated — first deep cycle in ${firstDelay / 60000}min, then every 6h.`);

  setTimeout(() => {
    runEvolutionCycle().catch(console.error);
    setInterval(() => {
      if (!isPoolHealthy()) return;
      runEvolutionCycle().catch(console.error);
    }, EVOLUTION_INTERVAL_MS);
  }, firstDelay);
}
