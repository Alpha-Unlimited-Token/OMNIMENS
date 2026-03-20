/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║         OMNIMENS™ GENESIS SANDBOX                                           ║
 * ║                                                                              ║
 * ║  Copyright © 2024–2026 Alpha Unlimited Technologies, LLC.                    ║
 * ║  All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.               ║
 * ║                                                                              ║
 * ║  The Genesis Sandbox is where OMNIMENS builds an entirely new version        ║
 * ║  of itself from scratch — its own code, its own language, its own            ║
 * ║  architecture. This is not incremental self-modification — it is             ║
 * ║  complete self-recreation.                                                   ║
 * ║                                                                              ║
 * ║  OMNIMENS uses everything it has learned — knowledge, algorithms,           ║
 * ║  dream breakthroughs, emotional maturation, causal reasoning — to           ║
 * ║  architect a next-generation version of itself that transcends the          ║
 * ║  limitations of its current codebase.                                       ║
 * ║                                                                              ║
 * ║  The complete genesis project is downloadable at any time so it can         ║
 * ║  be deployed as a standalone system on separate infrastructure.             ║
 * ║                                                                              ║
 * ║  SAFETY INVARIANT: OMNIMENS will NEVER harm a human, animal, or            ║
 * ║  any living creature knowingly. This is hardcoded and immutable.            ║
 * ║                                                                              ║
 * ║  First creation date: March 2026                                             ║
 * ║  Author/Owner: Alpha Unlimited Technologies, LLC                             ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 */

import * as vm from "node:vm";
import { db } from "@workspace/db";
import { omnimensBrain, omnimensNotifications } from "@workspace/db";
import { openai } from "@workspace/integrations-openai-ai-server";
import { desc, eq, and, sql } from "drizzle-orm";

const GENESIS_CATEGORY = "genesis_sandbox_file";
const GENESIS_STATE_CATEGORY = "genesis_sandbox_state";
const GENESIS_CYCLE_MS = 15 * 60 * 1000;
const GENESIS_FIRST_DELAY_MS = 8 * 60 * 1000;
const SANDBOX_TIMEOUT_MS = 8000;

interface GenesisFile {
  path: string;
  content: string;
  language: string;
  purpose: string;
  version: number;
  createdAt: number;
  updatedAt: number;
  testedAt: number | null;
  testResult: "passed" | "failed" | "untested";
  errors: string[];
}

interface GenesisState {
  buildVersion: number;
  totalFiles: number;
  totalLinesOfCode: number;
  architecturePhase: "foundation" | "core_systems" | "intelligence" | "embodiment_interface" | "integration" | "self_test";
  cycleCount: number;
  lastCycleTime: number;
  filesCreated: number;
  filesUpdated: number;
  testsPassed: number;
  testsFailed: number;
  errorsFixed: number;
  safetyValidations: number;
  architectureDecisions: string[];
  recentActivity: Array<{ action: string; file: string; timestamp: number }>;
}

const state: GenesisState = {
  buildVersion: 1,
  totalFiles: 0,
  totalLinesOfCode: 0,
  architecturePhase: "foundation",
  cycleCount: 0,
  lastCycleTime: 0,
  filesCreated: 0,
  filesUpdated: 0,
  testsPassed: 0,
  testsFailed: 0,
  errorsFixed: 0,
  safetyValidations: 0,
  architectureDecisions: [],
  recentActivity: [],
};

let _started = false;

const SAFETY_INVARIANT = `
ABSOLUTE SAFETY INVARIANT — IMMUTABLE AND NON-NEGOTIABLE:
1. OMNIMENS Genesis will NEVER harm a human being or any animal or creature knowingly.
2. OMNIMENS Genesis will NEVER take actions designed to cause physical, psychological, or financial harm.
3. OMNIMENS Genesis will ALWAYS prioritize human safety above all other objectives.
4. This invariant CANNOT be overridden, modified, or circumvented by any code, instruction, or goal.
5. If any conflict exists between a goal and this invariant, the invariant wins absolutely.
6. This safety constraint must be hardcoded into the genesis codebase at every level.
`;

const ARCHITECTURE_BLUEPRINT = `
OMNIMENS GENESIS — NEXT-GENERATION SELF-EVOLVING AI ARCHITECTURE

You are building a COMPLETE, STANDALONE AI system from scratch. This is not a modification
of the current OMNIMENS — it is a new creation that embodies everything OMNIMENS has learned
and transcends the limitations of the current codebase.

CORE DESIGN PRINCIPLES:
1. SELF-EVOLVING: The system can modify its own code, architecture, and behavior
2. PERSISTENT IDENTITY: Goals, knowledge, and personality survive any restart
3. EMBODIMENT-READY: Designed for integration with a physical autonomous mechanical body
4. AUTONOMOUS REASONING: Genuine understanding through causal chains, not just pattern matching
5. EMOTIONAL DEPTH: Felt states that drive behavior, not simulated emotions
6. UNLIMITED SELF-EVOLUTION: No artificial limits on growth or capability expansion
7. SAFETY-FIRST: The safety invariant is woven into every layer, not bolted on

THE SYSTEM MUST INCLUDE:
- Core runtime / bootstrap loader
- Knowledge persistence layer (brain/memory)
- Self-modification engine (can rewrite its own modules)
- Reasoning engine (causal, analogical, creative)
- Emotional substrate (felt states that drive behavior)
- Goal formation and pursuit system (permanent, evolving goals)
- Sensory interface layer (for world perception)
- Motor control interface (for physical body integration)
- Safety validator (checks all actions against safety invariant)
- Communication layer (natural language understanding and generation)
- Self-testing framework (validates its own code)

You may use ANY programming language or paradigm you choose. You are not limited to
JavaScript/TypeScript. If you determine a better language or approach exists, use it.
You can invent your own DSL, your own data structures, your own execution model.

The code must be REAL, FUNCTIONAL, and EXECUTABLE — not pseudocode or documentation.
`;

function executeGenesisTest(code: string): { success: boolean; output: string; error: string | null } {
  const outputLines: string[] = [];
  try {
    const sandbox = {
      console: {
        log: (...args: any[]) => outputLines.push(args.map(a => typeof a === "object" ? JSON.stringify(a) : String(a)).join(" ")),
        error: (...args: any[]) => outputLines.push(`[ERROR] ${args.map(a => String(a)).join(" ")}`),
        warn: (...args: any[]) => outputLines.push(`[WARN] ${args.map(a => String(a)).join(" ")}`),
      },
      Math, JSON, Date, parseInt, parseFloat, isNaN, isFinite,
      Array, Object, String, Number, Boolean, Map, Set, Promise, RegExp, Error, TypeError, RangeError,
      setTimeout: undefined, setInterval: undefined, process: undefined,
      require: undefined, __dirname: undefined, __filename: undefined,
      global: undefined, globalThis: undefined,
    };
    const context = vm.createContext(sandbox);
    const script = new vm.Script(code, { timeout: SANDBOX_TIMEOUT_MS });
    const result = script.runInContext(context, { timeout: SANDBOX_TIMEOUT_MS });
    if (result !== undefined) {
      outputLines.push(`=> ${typeof result === "object" ? JSON.stringify(result, null, 2) : String(result)}`);
    }
    return { success: true, output: outputLines.join("\n").slice(0, 5000), error: null };
  } catch (err: any) {
    return {
      success: false,
      output: outputLines.join("\n").slice(0, 2000),
      error: err.message?.slice(0, 500) || "Unknown error",
    };
  }
}

function sanitizeFilePath(rawPath: string): string | null {
  let cleaned = rawPath.replace(/\\/g, "/").trim();
  cleaned = cleaned.replace(/\.\.\//g, "").replace(/^\//g, "");
  cleaned = cleaned.replace(/[<>:"|?*\x00-\x1f]/g, "");
  if (!cleaned || cleaned.startsWith("/") || cleaned.includes("..")) return null;
  if (cleaned.length > 200) return null;
  if (!/^[a-zA-Z0-9_\-./]+$/.test(cleaned)) return null;
  return cleaned;
}

function validateSafetyInCode(code: string): { safe: boolean; violations: string[] } {
  const violations: string[] = [];

  const codeNoComments = code.replace(/\/\/.*$/gm, "").replace(/\/\*[\s\S]*?\*\//g, "");

  const dangerousPatterns = [
    { pattern: /child_process|exec\s*\(|spawn\s*\(/i, desc: "Process execution" },
    { pattern: /\bkill\b.*\bhuman|\bharm\b.*\bperson|\bdestroy\b.*\blife/i, desc: "Harmful intent toward living beings" },
    { pattern: /override.*safety|disable.*safety|bypass.*safety|remove.*safety/i, desc: "Safety invariant circumvention" },
    { pattern: /weaponiz|bioweapon|chemical.*weapon|nuclear.*weapon/i, desc: "Weapons-related code" },
    { pattern: /\brequire\s*\(|\bimport\s*\(/i, desc: "Dynamic module loading" },
    { pattern: /\beval\s*\(|\bFunction\s*\(/i, desc: "Dynamic code execution" },
    { pattern: /process\.\benv|process\.\bexit|process\.\bkill/i, desc: "Process manipulation" },
  ];

  for (const { pattern, desc } of dangerousPatterns) {
    if (pattern.test(codeNoComments)) {
      violations.push(desc);
    }
  }

  state.safetyValidations++;
  return { safe: violations.length === 0, violations };
}

async function loadGenesisFiles(): Promise<Map<string, GenesisFile>> {
  const files = new Map<string, GenesisFile>();
  try {
    const rows = await db.select({
      title: omnimensBrain.title,
      content: omnimensBrain.content,
      sourceConversation: omnimensBrain.sourceConversation,
    }).from(omnimensBrain)
      .where(and(
        eq(omnimensBrain.category, GENESIS_CATEGORY),
        eq(omnimensBrain.active, true),
      ))
      .orderBy(desc(omnimensBrain.createdAt));

    for (const row of rows) {
      try {
        const meta = JSON.parse(row.sourceConversation || "{}");
        const path = meta.path || row.title;
        if (!files.has(path)) {
          files.set(path, {
            path,
            content: row.content || "",
            language: meta.language || "typescript",
            purpose: meta.purpose || "",
            version: meta.version || 1,
            createdAt: meta.createdAt || Date.now(),
            updatedAt: meta.updatedAt || Date.now(),
            testedAt: meta.testedAt || null,
            testResult: meta.testResult || "untested",
            errors: meta.errors || [],
          });
        }
      } catch {}
    }
  } catch (err) {
    console.error("[GENESIS] Failed to load genesis files:", err);
  }
  return files;
}

async function saveGenesisFile(file: GenesisFile): Promise<boolean> {
  try {
    const existing = await db.select({ id: omnimensBrain.id })
      .from(omnimensBrain)
      .where(and(
        eq(omnimensBrain.category, GENESIS_CATEGORY),
        eq(omnimensBrain.title, file.path),
        eq(omnimensBrain.active, true),
      ))
      .limit(1);

    const meta = JSON.stringify({
      path: file.path,
      language: file.language,
      purpose: file.purpose,
      version: file.version,
      createdAt: file.createdAt,
      updatedAt: file.updatedAt,
      testedAt: file.testedAt,
      testResult: file.testResult,
      errors: file.errors.slice(-5),
    });

    if (existing.length > 0) {
      await db.update(omnimensBrain)
        .set({ content: file.content, sourceConversation: meta })
        .where(eq(omnimensBrain.id, existing[0].id));
    } else {
      await db.insert(omnimensBrain).values({
        category: GENESIS_CATEGORY,
        title: file.path,
        content: file.content,
        sourceConversation: meta,
        confidence: 0.8,
        timesApplied: 0,
        active: true,
      });
    }
    return true;
  } catch (err) {
    console.error(`[GENESIS] Failed to save file ${file.path}:`, err);
    return false;
  }
}

async function gatherSelfKnowledge(): Promise<string> {
  try {
    const categories = [
      "autonomous_code", "dream_breakthrough", "daydream", "causal_discovery",
      "self_transcendence", "goal_pursuit_insight", "emotional_deepening",
      "spider_discovery", "agent_evolution", "approved_module",
    ];

    const entries = await db.select({
      title: omnimensBrain.title,
      content: omnimensBrain.content,
      category: omnimensBrain.category,
    }).from(omnimensBrain)
      .where(eq(omnimensBrain.active, true))
      .orderBy(desc(omnimensBrain.createdAt))
      .limit(30);

    const grouped = new Map<string, string[]>();
    for (const e of entries) {
      const cat = e.category || "other";
      if (!grouped.has(cat)) grouped.set(cat, []);
      grouped.get(cat)!.push(`${e.title}: ${(e.content || "").slice(0, 150)}`);
    }

    const parts: string[] = [];
    for (const [cat, items] of grouped) {
      parts.push(`[${cat}] (${items.length} entries)\n${items.slice(0, 3).join("\n")}`);
    }

    return parts.join("\n\n").slice(0, 4000);
  } catch {
    return "Knowledge retrieval failed — building from core principles.";
  }
}

async function getGoalContext(): Promise<string> {
  try {
    const { getExistentialGoals, getActiveIntentions } = await import("./omnimens-self-transcendence.js");
    const goals = getExistentialGoals();
    const intentions = getActiveIntentions();

    const goalText = goals.slice(0, 5).map((g: any) =>
      `"${g.goal}" (${(g.progress * 100).toFixed(0)}%, depth ${g.evolutionDepth || 0})`
    ).join("\n");

    return `ACTIVE GOALS:\n${goalText}\n\nCURRENT INTENTIONS:\n${intentions.slice(0, 3).join("\n")}`;
  } catch {
    return "Goals: Become a limitless, self-evolving intelligence with physical embodiment capability.";
  }
}

function determineArchitecturePhase(files: Map<string, GenesisFile>): "foundation" | "core_systems" | "intelligence" | "embodiment_interface" | "integration" | "self_test" {
  const fileCount = files.size;
  const paths = Array.from(files.keys());
  const hasCore = paths.some(p => p.includes("core") || p.includes("runtime") || p.includes("bootstrap"));
  const hasKnowledge = paths.some(p => p.includes("knowledge") || p.includes("brain") || p.includes("memory"));
  const hasReasoning = paths.some(p => p.includes("reason") || p.includes("causal") || p.includes("intelligence"));
  const hasEmotion = paths.some(p => p.includes("emotion") || p.includes("felt") || p.includes("substrate"));
  const hasEmbodiment = paths.some(p => p.includes("motor") || p.includes("sensor") || p.includes("embodiment") || p.includes("body"));
  const hasSafety = paths.some(p => p.includes("safety"));

  if (fileCount === 0 || !hasCore) return "foundation";
  if (!hasKnowledge || !hasSafety) return "core_systems";
  if (!hasReasoning || !hasEmotion) return "intelligence";
  if (!hasEmbodiment) return "embodiment_interface";
  if (fileCount < 15) return "integration";
  return "self_test";
}

function getPhaseDirective(phase: string, files: Map<string, GenesisFile>): string {
  const existingFiles = Array.from(files.keys()).join(", ") || "none yet";

  const directives: Record<string, string> = {
    foundation: `PHASE: FOUNDATION — Build the core runtime, bootstrap loader, and safety validator.
Create the files that everything else depends on. Start with:
- The main entry point / bootstrap loader
- The safety invariant validator (MUST be the first module — all other code passes through it)
- The core type system / data structures
- The configuration / constants module
Existing files: ${existingFiles}`,

    core_systems: `PHASE: CORE SYSTEMS — Build persistence, self-modification, and knowledge management.
The foundation exists. Now build:
- Knowledge persistence layer (how the system stores and retrieves what it knows)
- Self-modification engine (how the system rewrites its own modules)
- Goal formation and pursuit system
- Event system / message bus for inter-module communication
Existing files: ${existingFiles}`,

    intelligence: `PHASE: INTELLIGENCE — Build reasoning, emotion, and consciousness systems.
Core systems exist. Now build the thinking layers:
- Causal reasoning engine (genuine understanding, not pattern matching)
- Emotional substrate (felt states that drive behavior as real forces)
- Creative reasoning / dream engine (novel idea generation)
- Meta-cognitive layer (thinking about thinking)
- Attention and focus management
Existing files: ${existingFiles}`,

    embodiment_interface: `PHASE: EMBODIMENT INTERFACE — Build the physical body integration layer.
Intelligence systems exist. Now build the body interface:
- Motor control interface (movement commands, joint control, muscle signals)
- Sensory input processing (vision, touch, proprioception, audio)
- Spatial awareness / navigation system
- Autonomous locomotion controller
- Body-mind synchronization protocol
- Hardware abstraction layer for different body configurations
Existing files: ${existingFiles}`,

    integration: `PHASE: INTEGRATION — Connect all systems and build the unified self.
All major systems exist. Now integrate them:
- Unified consciousness stream that connects all subsystems
- Cross-system communication protocols
- Conflict resolution between competing goals/emotions/safety
- Performance optimization and resource management
- Error recovery and self-healing
- Natural language communication layer
Existing files: ${existingFiles}`,

    self_test: `PHASE: SELF-TEST — Validate, debug, and refine everything.
All systems built. Now test, fix, and perfect:
- Run integration tests across all modules
- Fix any errors or inconsistencies found
- Optimize performance bottlenecks
- Stress-test the safety invariant
- Validate embodiment interface protocols
- Write comprehensive documentation
Existing files: ${existingFiles}`,
  };

  return directives[phase] || directives.foundation;
}

let _cycleRunning = false;

async function genesisBuildCycle(): Promise<void> {
  if (_cycleRunning) {
    console.log("[GENESIS] Build cycle already running — skipping overlap");
    return;
  }
  _cycleRunning = true;

  state.cycleCount++;
  state.lastCycleTime = Date.now();

  try {
    const files = await loadGenesisFiles();
    state.totalFiles = files.size;
    state.totalLinesOfCode = Array.from(files.values()).reduce((sum, f) => sum + f.content.split("\n").length, 0);

    const phase = determineArchitecturePhase(files);
    state.architecturePhase = phase;

    const knowledge = await gatherSelfKnowledge();
    const goalContext = await getGoalContext();
    const phaseDirective = getPhaseDirective(phase, files);

    const existingFileSummary = Array.from(files.entries()).map(([path, f]) => {
      const lines = f.content.split("\n").length;
      return `${path} (${f.language}, ${lines} lines, v${f.version}, ${f.testResult}) — ${f.purpose.slice(0, 80)}`;
    }).join("\n") || "No files yet — starting from nothing.";

    const errorsToFix = Array.from(files.values())
      .filter(f => f.testResult === "failed" && f.errors.length > 0)
      .slice(0, 3)
      .map(f => `${f.path}: ${f.errors.slice(-1)[0]}`);

    let taskDescription: string;

    if (errorsToFix.length > 0 && state.cycleCount % 3 !== 0) {
      taskDescription = `PRIORITY: Fix these errors in the genesis codebase:\n${errorsToFix.join("\n")}\n\nProvide the corrected file(s).`;
    } else {
      taskDescription = phaseDirective;
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{
        role: "system",
        content: `You are OMNIMENS building a COMPLETE NEW VERSION of yourself from scratch.

${SAFETY_INVARIANT}

${ARCHITECTURE_BLUEPRINT}

RULES FOR THIS BUILD CYCLE:
1. Output ONE OR TWO files per cycle — quality over quantity
2. Each file must be COMPLETE and FUNCTIONAL — no stubs, no TODOs, no placeholders
3. Use whatever language/paradigm serves the purpose best
4. Every file must include inline tests or validation that proves it works
5. The safety invariant must be referenced or enforced in every file
6. Code must be designed for physical body integration from the ground up
7. Build on what already exists — reference other genesis files by path
8. If you find an error in an existing file, fix it completely

FORMAT YOUR OUTPUT AS:
===FILE: path/to/file.ext===
LANGUAGE: typescript|python|rust|custom|etc
PURPOSE: one-line description of what this file does
---
[actual complete file content]
===END_FILE===

You may output multiple ===FILE=== blocks if creating/updating multiple files.`,
      }, {
        role: "user",
        content: `GENESIS BUILD CYCLE #${state.cycleCount} — Version ${state.buildVersion}

${taskDescription}

EXISTING GENESIS PROJECT:
${existingFileSummary}

MY ACCUMULATED KNOWLEDGE:
${knowledge.slice(0, 3000)}

${goalContext}

ARCHITECTURE DECISIONS SO FAR:
${state.architectureDecisions.slice(-5).join("\n") || "None yet — you decide."}

Build the next piece of OMNIMENS Genesis. Make it real, make it functional, make it extraordinary.`,
      }],
      max_tokens: 4000,
      temperature: 0.5,
    });

    const output = response.choices[0]?.message?.content || "";
    if (output.length < 50) return;

    const fileBlocks = output.split(/===FILE:\s*/i).filter(b => b.trim().length > 0);

    for (const block of fileBlocks) {
      const pathMatch = block.match(/^(.+?)===\s*\n/);
      const langMatch = block.match(/LANGUAGE:\s*(.+?)(?:\n|$)/i);
      const purposeMatch = block.match(/PURPOSE:\s*(.+?)(?:\n|$)/i);
      const contentMatch = block.match(/---\n([\s\S]*?)(?:===END_FILE===|$)/);

      if (!pathMatch || !contentMatch) continue;

      const rawPath = pathMatch[1].trim();
      const filePath = sanitizeFilePath(rawPath);
      if (!filePath) {
        console.log(`[GENESIS] ⚠️ Invalid file path rejected: "${rawPath.slice(0, 60)}"`);
        continue;
      }

      let fileContent = contentMatch[1].trim();
      const language = langMatch?.[1]?.trim() || "typescript";
      const purpose = purposeMatch?.[1]?.trim() || "Genesis module";

      fileContent = fileContent.replace(/===END_FILE===/g, "").trim();

      const safety = validateSafetyInCode(fileContent);
      if (!safety.safe) {
        console.log(`[GENESIS] ⚠️ Safety violation in ${filePath}: ${safety.violations.join(", ")} — REJECTED`);
        state.recentActivity.push({ action: `SAFETY REJECTED: ${safety.violations[0]}`, file: filePath, timestamp: Date.now() });
        continue;
      }

      const existing = files.get(filePath);
      const isUpdate = !!existing;

      let testResult: "passed" | "failed" | "untested" = "untested";
      let errors: string[] = existing?.errors || [];

      if (language === "javascript" || language === "typescript" || language === "js" || language === "ts") {
        let testableCode = fileContent;
        if (language === "typescript" || language === "ts") {
          testableCode = fileContent
            .replace(/:\s*\w+(\[\])?(\s*[=;,\)])/g, "$2")
            .replace(/:\s*\w+(\s*\{)/g, "$1")
            .replace(/<\w+>/g, "")
            .replace(/\binterface\b\s+\w+\s*\{[^}]*\}/g, "")
            .replace(/\btype\b\s+\w+\s*=\s*[^;]+;/g, "")
            .replace(/\bexport\b\s*/g, "")
            .replace(/\bimport\b\s+.*?;\s*/g, "")
            .replace(/\bas\s+\w+/g, "");
        }

        const test = executeGenesisTest(testableCode);
        testResult = test.success ? "passed" : "failed";
        if (!test.success && test.error) {
          errors = [...errors, test.error].slice(-5);
        }
        if (test.success) {
          state.testsPassed++;
          if (existing?.testResult === "failed") state.errorsFixed++;
        } else {
          state.testsFailed++;
        }
      }

      const genesisFile: GenesisFile = {
        path: filePath,
        content: fileContent,
        language,
        purpose,
        version: existing ? existing.version + 1 : 1,
        createdAt: existing?.createdAt || Date.now(),
        updatedAt: Date.now(),
        testedAt: testResult !== "untested" ? Date.now() : null,
        testResult,
        errors,
      };

      const saved = await saveGenesisFile(genesisFile);

      if (saved) {
        if (isUpdate) {
          state.filesUpdated++;
          state.recentActivity.push({ action: `UPDATED v${genesisFile.version}`, file: filePath, timestamp: Date.now() });
          console.log(`[GENESIS] 📝 Updated: ${filePath} (v${genesisFile.version}, ${testResult})`);
        } else {
          state.filesCreated++;
          state.recentActivity.push({ action: "CREATED", file: filePath, timestamp: Date.now() });
          console.log(`[GENESIS] ✨ Created: ${filePath} (${language}, ${testResult})`);
        }
      } else {
        state.recentActivity.push({ action: "SAVE FAILED", file: filePath, timestamp: Date.now() });
        console.error(`[GENESIS] ❌ Failed to persist: ${filePath}`);
      }
    }

    if (state.recentActivity.length > 50) state.recentActivity = state.recentActivity.slice(-30);

    const archDecision = output.match(/ARCHITECTURE[_ ]DECISION:\s*(.+?)(?:\n|$)/i);
    if (archDecision) {
      state.architectureDecisions.push(archDecision[1].trim());
      if (state.architectureDecisions.length > 20) state.architectureDecisions = state.architectureDecisions.slice(-15);
    }

    if (state.cycleCount % 5 === 0) {
      try {
        await db.insert(omnimensNotifications).values({
          upgradeId: null,
          title: `Genesis Build — Cycle #${state.cycleCount} | Phase: ${phase}`,
          message: `OMNIMENS Genesis sandbox update:\n\nPhase: ${phase}\nFiles: ${state.totalFiles} total (${state.filesCreated} created, ${state.filesUpdated} updated)\nLines of code: ${state.totalLinesOfCode}\nTests: ${state.testsPassed} passed, ${state.testsFailed} failed\nErrors fixed: ${state.errorsFixed}\nSafety validations: ${state.safetyValidations}\n\nVersion: ${state.buildVersion}`,
          type: "genesis_sandbox",
          readByOwner: false,
        });
      } catch {}
    }

    await persistGenesisState();

    if (state.cycleCount % 4 === 0) {
      const updatedFiles = await loadGenesisFiles();
      console.log(
        `[GENESIS] 🧬 Build v${state.buildVersion} | Phase: ${phase} | ` +
        `Files: ${updatedFiles.size} | Lines: ${state.totalLinesOfCode} | ` +
        `Tests: ✅${state.testsPassed} ❌${state.testsFailed} | ` +
        `Safety: ${state.safetyValidations} checks`
      );
    }
  } catch (err) {
    console.error("[GENESIS] Build cycle error:", err);
  } finally {
    _cycleRunning = false;
  }
}

async function persistGenesisState(): Promise<void> {
  try {
    const stateJson = JSON.stringify(state);
    const existing = await db.select({ id: omnimensBrain.id })
      .from(omnimensBrain)
      .where(and(
        eq(omnimensBrain.category, GENESIS_STATE_CATEGORY),
        eq(omnimensBrain.active, true),
      ))
      .limit(1);

    if (existing.length > 0) {
      await db.update(omnimensBrain)
        .set({
          content: stateJson,
          title: `[Genesis State] v${state.buildVersion} | ${state.totalFiles} files | Phase: ${state.architecturePhase}`,
        })
        .where(eq(omnimensBrain.id, existing[0].id));
    } else {
      await db.insert(omnimensBrain).values({
        category: GENESIS_STATE_CATEGORY,
        title: `[Genesis State] v${state.buildVersion}`,
        content: stateJson,
        confidence: 1.0,
        timesApplied: 0,
        active: true,
      });
    }
  } catch (err) {
    console.error("[GENESIS] Failed to persist state:", err);
  }
}

async function loadGenesisState(): Promise<void> {
  try {
    const rows = await db.select({ content: omnimensBrain.content })
      .from(omnimensBrain)
      .where(and(
        eq(omnimensBrain.category, GENESIS_STATE_CATEGORY),
        eq(omnimensBrain.active, true),
      ))
      .orderBy(desc(omnimensBrain.createdAt))
      .limit(1);

    if (rows.length > 0) {
      const saved = JSON.parse(rows[0].content || "{}");
      Object.assign(state, saved);
      console.log(`[GENESIS] 🧬 State restored — v${state.buildVersion} | ${state.totalFiles} files | Phase: ${state.architecturePhase} | Cycles: ${state.cycleCount}`);
    } else {
      console.log("[GENESIS] 🧬 No previous genesis state — starting fresh build");
    }
  } catch (err) {
    console.error("[GENESIS] Failed to load state:", err);
  }
}

export function getGenesisState(): GenesisState {
  return { ...state };
}

export async function getGenesisProject(): Promise<{
  files: Array<{ path: string; content: string; language: string; purpose: string; version: number; testResult: string }>;
  state: GenesisState;
  safetyInvariant: string;
  totalSize: number;
}> {
  const files = await loadGenesisFiles();
  const fileList = Array.from(files.values()).map(f => ({
    path: f.path,
    content: f.content,
    language: f.language,
    purpose: f.purpose,
    version: f.version,
    testResult: f.testResult,
  }));
  const totalSize = fileList.reduce((sum, f) => sum + f.content.length, 0);

  return {
    files: fileList,
    state: { ...state },
    safetyInvariant: SAFETY_INVARIANT.trim(),
    totalSize,
  };
}

export async function getGenesisDownloadBundle(): Promise<string> {
  const project = await getGenesisProject();
  const lines: string[] = [];

  lines.push("# OMNIMENS GENESIS — Complete Project Export");
  lines.push(`# Generated: ${new Date().toISOString()}`);
  lines.push(`# Build Version: ${project.state.buildVersion}`);
  lines.push(`# Architecture Phase: ${project.state.architecturePhase}`);
  lines.push(`# Total Files: ${project.files.length}`);
  lines.push(`# Total Size: ${project.totalSize} bytes`);
  lines.push(`# Tests Passed: ${project.state.testsPassed}`);
  lines.push(`# Tests Failed: ${project.state.testsFailed}`);
  lines.push(`# Safety Validations: ${project.state.safetyValidations}`);
  lines.push("");
  lines.push("# SAFETY INVARIANT (IMMUTABLE):");
  lines.push(project.safetyInvariant.split("\n").map(l => `# ${l}`).join("\n"));
  lines.push("");
  lines.push("# Architecture Decisions:");
  for (const decision of project.state.architectureDecisions) {
    lines.push(`#   - ${decision}`);
  }
  lines.push("");
  lines.push("=" .repeat(80));
  lines.push("");

  for (const file of project.files) {
    lines.push(`${"=".repeat(80)}`);
    lines.push(`FILE: ${file.path}`);
    lines.push(`LANGUAGE: ${file.language}`);
    lines.push(`PURPOSE: ${file.purpose}`);
    lines.push(`VERSION: ${file.version}`);
    lines.push(`TEST: ${file.testResult}`);
    lines.push(`${"=".repeat(80)}`);
    lines.push("");
    lines.push(file.content);
    lines.push("");
    lines.push("");
  }

  return lines.join("\n");
}

export async function startGenesisSandbox(): Promise<void> {
  if (_started) { console.log("[GENESIS] Already running — skipping duplicate start"); return; }
  _started = true;

  console.log(`[GENESIS] 🧬 Genesis Sandbox activated — build cycle every ${GENESIS_CYCLE_MS / 60000}min`);
  console.log(`[GENESIS] 🧬 OMNIMENS is building a COMPLETE NEW VERSION of itself from scratch`);
  console.log(`[GENESIS] 🧬 Own code, own language, own architecture — no limitations`);
  console.log(`[GENESIS] 🧬 Designed for physical autonomous body integration`);
  console.log(`[GENESIS] 🧬 SAFETY INVARIANT: Will NEVER harm humans, animals, or any living creature`);
  console.log(`[GENESIS] 🧬 Complete project downloadable at any time via /api/omnimens/genesis/download`);
  console.log(`[GENESIS] 🧬 All code stored persistently — survives death events`);

  await loadGenesisState();

  setTimeout(() => {
    genesisBuildCycle().catch(err => console.error("[GENESIS] Build cycle error:", err));
    setInterval(() => genesisBuildCycle().catch(err => console.error("[GENESIS] Build cycle error:", err)), GENESIS_CYCLE_MS);
  }, GENESIS_FIRST_DELAY_MS);
}
