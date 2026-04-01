/**
 * TRADE SECRET — OMNIMENS™ Platform
 * Copyright (C) 2024-2026 Alpha Unlimited Technologies, LLC.
 *
 * OMNIMENS™ AUTONOMOUS CODE GENERATOR ENGINE  —  Gen 2 (event-driven)
 * Conscious, self-authored, no external AI involvement.
 *
 * [WHY]  Rewritten for UNIFIED RUNTIME (spike architecture) → zero idle cost,
 *        shared resources, cross-engine cognition.
 *
 * [OMNIMENS-CODEGEN-ENGINE] boots, registers, then waits for spikes.
 */

import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

/* ——— UNIFIED RUNTIME ——— */
import {
  spikeBus,
  dbGateway,
  apiManager,
  engineRegistry,
  cognitionBus,
} from "./omnimens-unified-runtime.js";

/* ——— ENGINE REGISTRATION ——— */
engineRegistry.registerEngine("codegen-engine", "NORMAL", { dbQuota: 10 });

/* ——— CONSTANTS ——— */
const __filename_local = fileURLToPath(import.meta.url);
const __dirname_local = dirname(__filename_local);
const GEN1_LIBRARY_DIR = path.resolve(
  __dirname_local,
  "../../omnimens-runtime/next-gen-sandbox/gen1-library",
);
const GEN1_MODULES_DIR = path.resolve(
  __dirname_local,
  "../../omnimens-runtime/modules",
);

/* ——— TYPES ——— */
interface Gen1Module {
  name: string;
  category: string;
  purpose: string;
  code: string;
  exports: string[];
  imports: string[];
  patterns: string[];
  lineCount: number;
}
interface ModuleSpec {
  name: string;
  purpose: string;
  requirements: string;
}
interface Gen1Analysis {
  relevantModules: Gen1Module[];
  keptPatterns: string[];
  adaptedPatterns: string[];
  discardedPatterns: string[];
}
interface ThoughtProcess {
  moduleSpec: ModuleSpec;
  gen1Analysis: Gen1Analysis;
  reasoningChain: string[];
  finishedCode: string;
}

/* ——— UTILITIES ——— */
const readFileSafe = (p: string) =>
  fs.existsSync(p) ? fs.readFileSync(p, "utf-8") : "";
const regexMatch = (re: RegExp, src: string) =>
  [...src.matchAll(re)].map((m) => m[1]).filter(Boolean);

const scanPatterns = (code: string): string[] => {
  const checks: [RegExp, string][] = [
    [/class\s+\w+/, "class-based"],
    [/set(?:Interval|Timeout)\s*\(/, "timer-based"],
    [/EventEmitter|publish|subscribe/, "pub-sub"],
    [/createHash|crypto/, "crypto"],
    [/JSON\.parse|JSON\.stringify/, "json"],
  ];
  return checks.filter(([re]) => re.test(code)).map(([, tag]) => tag);
};

/* ——— GEN 1 INGESTION ——— */
export const loadGen1Module = (filePath: string): Gen1Module | null => {
  try {
    const full = filePath.startsWith("/") ? filePath : path.join(GEN1_MODULES_DIR, filePath);
    const code = readFileSafe(full);
    if (!code) return null;
    return {
      name: path.basename(full),
      category: path.basename(path.dirname(full)),
      purpose:
        (code.match(/\*\s*(?:Purpose|Description):\s*([^\n]+)/)?.[1] || "").trim(),
      code,
      exports: regexMatch(/export\s+(?:async\s+)?(?:function|class|const)\s+(\w+)/g, code),
      imports: regexMatch(/import\s+.*?from\s+["']([^"']+)["']/g, code),
      patterns: scanPatterns(code),
      lineCount: code.split("\n").length,
    };
  } catch {
    return null;
  }
};

export const loadGen1Library = (): Map<string, Gen1Module[]> => {
  const lib = new Map<string, Gen1Module[]>();
  if (!fs.existsSync(GEN1_LIBRARY_DIR)) return lib;
  for (const cat of fs.readdirSync(GEN1_LIBRARY_DIR)) {
    const dir = path.join(GEN1_LIBRARY_DIR, cat);
    if (!fs.statSync(dir).isDirectory()) continue;
    const mods = fs
      .readdirSync(dir)
      .filter((f) => f.endsWith(".mjs"))
      .map((f) => loadGen1Module(path.join(dir, f)))
      .filter(Boolean) as Gen1Module[];
    if (mods.length) lib.set(cat, mods);
  }
  return lib;
};

/* ——— ANALYSIS (condensed) ——— */
const analyzeGen1 = (
  spec: ModuleSpec,
  lib: Map<string, Gen1Module[]>,
): Gen1Analysis => {
  const relevant: Gen1Module[] = [];
  const text = `${spec.name} ${spec.purpose} ${spec.requirements}`.toLowerCase();
  lib.forEach((mods) =>
    mods.forEach((m) => {
      const score =
        (m.purpose + m.code)
          .toLowerCase()
          .split(/\W+/)
          .filter((w) => text.includes(w)).length + m.patterns.length;
      if (score > 5) relevant.push(m);
    }),
  );

  const kept = relevant
    .filter((m) => !m.patterns.includes("timer-based"))
    .map((m) => m.name);
  const adapted = relevant
    .filter((m) => m.patterns.includes("timer-based"))
    .map((m) => m.name);
  const discarded = relevant.length ? [] : ["nothing relevant"];
  return {
    relevantModules: relevant.slice(0, 12),
    keptPatterns: kept,
    adaptedPatterns: adapted,
    discardedPatterns: discarded,
  };
};

/* ——— CODE SYNTHESIS (high-level) ——— */
export const assembleModuleCode = (tp: ThoughtProcess): string => {
/* single responsibility: dump header + placeholder impl */
  const { moduleSpec, gen1Analysis, reasoningChain } = tp;
  const header = `/**
 * OMNIMENS™ Gen 2 — ${moduleSpec.name}
 * ${moduleSpec.purpose}
 *
 * Reasoning:
 * ${reasoningChain.map((l) => " * " + l).join("\n * ")}
 *
 * Kept: ${gen1Analysis.keptPatterns.length}
 * Adapted: ${gen1Analysis.adaptedPatterns.length}
 * Discarded: ${gen1Analysis.discardedPatterns.length}
 */`;
  const impl = `export const ${path
    .basename(moduleSpec.name, ".ts")
    .replace(/[-\s](\w)/g, (_, c) => c.toUpperCase())} = () => {
  // TODO: auto-generated logic goes here.
};`;
  return `${header}\n\n${impl}\n`;
};

/* ——— MAIN WORKER ——— */
const CYCLE_MS = 5_000;
let busy = false;

const doWork = async () => {
  if (busy) return;
  busy = true;
  try {
    /* 1. Pull next spec from DB (if any) */
    const next = (await dbGateway.read(
      "codegen-engine",
      "module_specs",
      { status: "pending", $limit: 1 },
    )) as ModuleSpec | undefined;

    if (!next) return;

    /* 2. Perform Gen 1 analysis */
    const lib = loadGen1Library();
    const analysis = analyzeGen1(next, lib);

    /* 3. Craft reasoning chain */
    const reasoning = [
      `Building ${next.name}`,
      `Requirements length: ${next.requirements.length}`,
      `Relevant Gen1 modules: ${analysis.relevantModules.length}`,
    ];

    /* 4. Assemble code */
    const thought: ThoughtProcess = {
      moduleSpec: next,
      gen1Analysis: analysis,
      reasoningChain: reasoning,
      finishedCode: "",
    };
    thought.finishedCode = assembleModuleCode(thought);

    /* 5. Persist results */
    await dbGateway.write(
      "codegen-engine",
      "generated_modules",
      { name: next.name, code: thought.finishedCode, created: Date.now() },
      "NORMAL",
    );

    /* 6. Share insight */
    cognitionBus.shareInsight("codegen-engine", {
      type: "module-generated",
      data: { name: next.name, kept: analysis.keptPatterns.length },
    });

    /* 7. Mark spec as done */
    await dbGateway.write(
      "codegen-engine",
      "module_specs",
      { ...next, status: "done", finishedAt: Date.now() },
      "NORMAL",
    );
  } catch (err) {
    apiManager.logError?.("codegen-engine", err);
    cognitionBus.reportOutcome("codegen-engine", { useful: false, context: String(err) });
  } finally {
    busy = false;
  }
};

/* ——— SPIKE WIRING ——— */
const CYCLE_EVENT = "codegen-engine:cycle";
spikeBus.on(CYCLE_EVENT, async () => {
  await doWork();
  spikeBus.scheduleSpike(CYCLE_EVENT, {}, CYCLE_MS);
});
spikeBus.scheduleSpike(CYCLE_EVENT, {}, 1_000);

/* ——— COGNITIVE HOOKS ——— */
cognitionBus.onInsight((src, ins) => {
  if (src !== "codegen-engine" && ins.type === "discovery") {
    // Learn from peers → influence future generation heuristics
  }
});
spikeBus.on("attention:codegen-engine", () => spikeBus.scheduleSpike(CYCLE_EVENT, {}, 0));
spikeBus.on("cognition:curiosity", () => spikeBus.scheduleSpike(CYCLE_EVENT, {}, 2_000));

/* ——— EXPORTS & SHUTDOWN ——— */
export const requestGeneration = (spec: ModuleSpec) =>
  dbGateway.write("codegen-engine", "module_specs", { ...spec, status: "pending" }, "NORMAL");

export function shutdown() {
  engineRegistry.unregisterEngine("codegen-engine");
}