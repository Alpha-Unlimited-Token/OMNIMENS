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
 * OMNIMENS™ Live Module Pipeline
 * Copyright © 2024–2026 Alpha Unlimited Technologies, LLC. All Rights Reserved.
 *
 * Auto-wires self-authored runtime modules into the active processing pipeline.
 * Modules are categorized, registered, and called live during reasoning.
 * No module sits idle — every approved module becomes part of OMNIMENS's thinking.
 */

import { readdirSync, readFileSync, existsSync, writeFileSync, mkdirSync, copyFileSync } from "fs";
import { join, basename, dirname } from "path";
import { fileURLToPath } from "url";
import vm from "vm";

const __dirname = dirname(fileURLToPath(import.meta.url));
const MODULES_DIR = join(__dirname, "../omnimens-runtime/modules");
const REGISTRY_PATH = join(__dirname, "../omnimens-runtime/pipeline-registry.json");

export type PipelineStage =
  | "context_compression"
  | "memory_retrieval"
  | "reasoning_enhancement"
  | "confidence_scoring"
  | "knowledge_synthesis"
  | "adversarial_testing"
  | "causal_analysis"
  | "vector_operations"
  | "orchestration"
  | "utility";

interface RegisteredModule {
  filename: string;
  stage: PipelineStage;
  exports: string[];
  loadedAt: number;
  callCount: number;
  lastCalledAt: number | null;
  totalDurationMs: number;
  errors: number;
  active: boolean;
}

interface PipelineRegistry {
  modules: Record<string, RegisteredModule>;
  lastScan: number;
  totalModules: number;
  totalCalls: number;
}

const STAGE_KEYWORDS: Record<PipelineStage, string[]> = {
  context_compression: [
    "context", "compress", "summariz", "summarise", "preserv", "sliding",
    "window", "conversation", "truncat", "compact",
  ],
  memory_retrieval: [
    "memory", "recall", "retriev", "embedding", "vector", "cache",
    "store", "search", "nearest", "knn", "hnsw", "persist",
    "encrypted.*store", "persistent.*memory", "bulk.*get", "bulk.*set",
  ],
  reasoning_enhancement: [
    "reason", "thinking", "thought", "metacognit", "dual.*process",
    "inference", "hypothesis", "counterfactual", "formal.*verif",
    "tree.*thought", "graph.*rag",
  ],
  confidence_scoring: [
    "confidence", "calibrat", "bayesian", "uncertainty", "entropy",
    "scoring", "consistency", "weighted.*vote",
  ],
  knowledge_synthesis: [
    "knowledge.*graph", "synthe", "insight", "integrat",
    "graph.*entity", "semantic",
  ],
  adversarial_testing: [
    "adversarial", "fault.*inject", "stress.*test", "edge.*case",
    "self.*test", "self.*reward", "debate",
  ],
  causal_analysis: [
    "causal", "counterfactual", "intervene", "multiverse",
    "cause.*effect", "propagat",
  ],
  vector_operations: [
    "matrix", "wasm", "gpu", "accelerat", "linear.*algebra",
    "dot.*product", "efficient.*math", "parallel.*comput",
    "chunked.*compute", "iterative.*compute", "time.*budget",
    "map.*reduce", "genetic.*search", "convergence",
  ],
  orchestration: [
    "orchestrat", "allocat", "coordinat", "pub.*sub",
    "event.*driven", "hierarchical.*task", "dynamic.*role",
    "swarm", "agent.*orchestrat",
  ],
  utility: [
    "tool.*forge", "tool.*creat", "evolve", "alpha.*evolve",
    "evolution.*marker", "sleep.*phase", "daydream", "sandbox",
  ],
};

const liveModules: Map<string, { module: any; reg: RegisteredModule }> = new Map();
let registry: PipelineRegistry = {
  modules: {},
  lastScan: 0,
  totalModules: 0,
  totalCalls: 0,
};

function classifyModule(filename: string, code: string): PipelineStage {
  const lower = (filename + " " + code.slice(0, 1500)).toLowerCase();
  let bestStage: PipelineStage = "utility";
  let bestScore = 0;

  for (const [stage, keywords] of Object.entries(STAGE_KEYWORDS) as [PipelineStage, string[]][]) {
    let score = 0;
    for (const kw of keywords) {
      const regex = new RegExp(kw, "gi");
      const matches = lower.match(regex);
      if (matches) score += matches.length;
    }
    if (score > bestScore) {
      bestScore = score;
      bestStage = stage;
    }
  }

  return bestStage;
}

function extractExports(code: string): string[] {
  const exports: string[] = [];
  const funcRegex = /export\s+(?:async\s+)?function\s+(\w+)/g;
  const classRegex = /export\s+class\s+(\w+)/g;
  const constRegex = /export\s+(?:const|let|var)\s+(\w+)/g;
  const defaultRegex = /export\s+default\s+(?:function|class)\s*(\w*)/g;
  const namedExportRegex = /export\s*\{\s*([^}]+)\s*\}/g;

  let match;
  while ((match = funcRegex.exec(code))) exports.push(match[1]);
  while ((match = classRegex.exec(code))) exports.push(match[1]);
  while ((match = constRegex.exec(code))) exports.push(match[1]);
  while ((match = defaultRegex.exec(code))) exports.push(match[1] || "default");
  while ((match = namedExportRegex.exec(code))) {
    match[1].split(",").forEach((name) => {
      const clean = name.trim().split(/\s+as\s+/).pop()?.trim();
      if (clean) exports.push(clean);
    });
  }

  if (exports.length === 0 && (code.includes("module.exports") || code.includes("exports."))) {
    exports.push("default");
  }

  return exports;
}

function tryRepairModule(code: string): { repaired: string; fixes: string[] } | null {
  const fixes: string[] = [];
  let fixed = code;

  const headerEnd = fixed.indexOf("*/");
  const codeBody = headerEnd > 0 ? fixed.slice(headerEnd + 2) : fixed;
  const header = headerEnd > 0 ? fixed.slice(0, headerEnd + 2) : "";

  if (/\barguments\b/.test(codeBody)) {
    const codeNoStrings = codeBody.replace(/(["'`])(?:(?!\1|\\).|\\.)*\1/g, "''");
    if (/\barguments\b/.test(codeNoStrings)) {
      fixed = header + codeBody.replace(/\barguments\b(?!\s*[.[])/g, "/* args */[]");
      fixes.push("Replaced bare 'arguments' with safe alternative");
    }
  }

  if (/(?<!\w)(RecursiveScaffolder|ScaffoldingEngine|BaseScaffold)\b/.test(codeBody)) {
    fixed = fixed.replace(/(?<!\w)(RecursiveScaffolder|ScaffoldingEngine|BaseScaffold)\b/g, "Object");
    fixes.push("Replaced undefined class references with Object");
  }

  const evalPattern = /(?<!\w)eval\s*\(/;
  const codeNoStringsForEval = fixed.replace(/(["'`])(?:(?!\1|\\).|\\.)*\1/g, "''");
  if (evalPattern.test(codeNoStringsForEval)) {
    return null;
  }

  if (fixes.length === 0) return null;

  try {
    const testCode = fixed
      .replace(/^\s*import\s+.*?from\s+['"].*?['"]\s*;?\s*$/gm, "// import")
      .replace(/^\s*import\s*\{[^}]*\}\s*from\s+['"].*?['"]\s*;?\s*$/gm, "// import")
      .replace(/^\s*export\s+(default\s+)?/gm, "")
      .replace(/^\s*export\s*\{[^}]*\}\s*;?\s*$/gm, "// export");
    new vm.Script(testCode, { filename: "repair-test.mjs" });
  } catch {
    return null;
  }

  return { repaired: fixed, fixes };
}

function saveRegistry() {
  try {
    const dir = join(__dirname, "../omnimens-runtime");
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
    writeFileSync(REGISTRY_PATH, JSON.stringify(registry, null, 2), "utf8");
  } catch {}
}

function loadRegistry() {
  try {
    if (existsSync(REGISTRY_PATH)) {
      registry = JSON.parse(readFileSync(REGISTRY_PATH, "utf8"));
    }
  } catch {
    registry = { modules: {}, lastScan: 0, totalModules: 0, totalCalls: 0 };
  }
}

export async function scanAndRegisterModules(): Promise<{
  total: number;
  registered: number;
  byStage: Record<string, number>;
}> {
  if (!existsSync(MODULES_DIR)) {
    mkdirSync(MODULES_DIR, { recursive: true });
    return { total: 0, registered: 0, byStage: {} };
  }

  loadRegistry();

  const files = readdirSync(MODULES_DIR).filter(
    (f) => f.endsWith(".mjs") || f.endsWith(".js"),
  );

  const byStage: Record<string, number> = {};
  let registered = 0;
  let skippedNoExports = 0;
  let importFailed = 0;
  let readFailed = 0;
  let repaired = 0;

  for (const file of files) {
    const filePath = join(MODULES_DIR, file);

    try {
      const code = readFileSync(filePath, "utf8");
      const stage = classifyModule(file, code);
      const exports = extractExports(code);

      if (exports.length === 0) {
        skippedNoExports++;
        continue;
      }

      const existing = registry.modules[file];
      registry.modules[file] = {
        filename: file,
        stage,
        exports,
        loadedAt: Date.now(),
        callCount: existing?.callCount ?? 0,
        lastCalledAt: existing?.lastCalledAt ?? null,
        totalDurationMs: existing?.totalDurationMs ?? 0,
        errors: existing?.errors ?? 0,
        active: true,
      };

      try {
        const mod = await import(filePath);
        liveModules.set(file, { module: mod, reg: registry.modules[file] });
        registered++;
        byStage[stage] = (byStage[stage] || 0) + 1;
      } catch (importErr: any) {
        const repair = tryRepairModule(code);
        if (repair) {
          try {
            const backupsDir = join(MODULES_DIR, "../backups");
            if (!existsSync(backupsDir)) mkdirSync(backupsDir, { recursive: true });
            copyFileSync(filePath, join(backupsDir, `${file}.pre-repair.${Date.now()}`));
            writeFileSync(filePath, repair.repaired, "utf8");

            const repairKey = filePath + "?" + Date.now();
            const mod = await import(repairKey.startsWith("/") ? repairKey : filePath);
            liveModules.set(file, { module: mod, reg: registry.modules[file] });
            registered++;
            byStage[stage] = (byStage[stage] || 0) + 1;
            repaired++;
            if (repaired <= 10) {
              console.log(`[MODULE PIPELINE] 🔧 AUTO-REPAIRED: ${file} — ${repair.fixes.join("; ")}`);
            }
          } catch {
            registry.modules[file].active = false;
            importFailed++;
            if (importFailed <= 10) {
              console.log(`[MODULE PIPELINE] ⚠️ Import failed (repair attempted): ${file} — ${importErr?.message?.slice(0, 100) || "unknown"}`);
            }
          }
        } else {
          registry.modules[file].active = false;
          importFailed++;
          if (importFailed <= 10) {
            console.log(`[MODULE PIPELINE] ⚠️ Import failed: ${file} — ${importErr?.message?.slice(0, 100) || "unknown"}`);
          }
        }
      }
    } catch {
      readFailed++;
      continue;
    }
  }

  registry.lastScan = Date.now();
  registry.totalModules = registered;
  saveRegistry();

  console.log(
    `[MODULE PIPELINE] 🔌 ${registered}/${files.length} modules wired into live pipeline`,
  );
  if (skippedNoExports > 0 || importFailed > 0 || readFailed > 0 || repaired > 0) {
    console.log(`[MODULE PIPELINE] ℹ️ Skipped: ${skippedNoExports} no exports, ${importFailed} import errors, ${readFailed} read errors${repaired > 0 ? `, ${repaired} auto-repaired` : ""}`);
  }
  for (const [stage, count] of Object.entries(byStage)) {
    console.log(`[MODULE PIPELINE]   ${stage}: ${count} modules`);
  }

  return { total: files.length, registered, byStage };
}

export async function registerNewModule(filename: string): Promise<boolean> {
  const filePath = join(MODULES_DIR, filename);
  if (!existsSync(filePath)) return false;

  try {
    const code = readFileSync(filePath, "utf8");
    const stage = classifyModule(filename, code);
    const exports = extractExports(code);

    if (exports.length === 0) return false;

    registry.modules[filename] = {
      filename,
      stage,
      exports,
      loadedAt: Date.now(),
      callCount: 0,
      lastCalledAt: null,
      totalDurationMs: 0,
      errors: 0,
      active: true,
    };

    const mod = await import(filePath);
    liveModules.set(filename, { module: mod, reg: registry.modules[filename] });
    registry.totalModules++;
    saveRegistry();

    console.log(
      `[MODULE PIPELINE] ⚡ NEW MODULE LIVE — "${filename}" wired into ${stage} pipeline (exports: ${exports.join(", ")})`,
    );
    return true;
  } catch (err) {
    console.error(`[MODULE PIPELINE] ❌ Failed to wire "${filename}":`, err);
    return false;
  }
}

function safeCall(fn: Function, args: any[], timeoutMs: number = 500): any {
  try {
    const result = fn(...args);
    if (result && typeof result.then === "function") {
      return Promise.race([
        result,
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Module timeout")), timeoutMs),
        ),
      ]);
    }
    return result;
  } catch (err) {
    return undefined;
  }
}

export async function runPipelineStage(
  stage: PipelineStage,
  input: any,
): Promise<{ results: any[]; modulesUsed: string[]; durationMs: number }> {
  const start = Date.now();
  const results: any[] = [];
  const modulesUsed: string[] = [];

  const stageModules = Array.from(liveModules.entries()).filter(
    ([_, { reg }]) => reg.stage === stage && reg.active,
  );

  if (stageModules.length === 0) {
    return { results: [], modulesUsed: [], durationMs: 0 };
  }

  const MAX_PER_STAGE = 5;
  const sorted = stageModules.sort(
    (a, b) => b[1].reg.callCount - a[1].reg.callCount,
  );
  const selected = sorted.slice(0, MAX_PER_STAGE);

  const promises = selected.map(async ([filename, { module, reg }]) => {
    const callStart = Date.now();
    try {
      let output: any;

      for (const exportName of reg.exports) {
        const fn = module[exportName] || module.default?.[exportName];
        if (typeof fn !== "function") continue;

        try {
          if (stage === "context_compression") {
            if (
              exportName.match(/compress|summariz/i) &&
              typeof input === "object" &&
              Array.isArray(input.entries)
            ) {
              output = await safeCall(fn, [input.entries, input.maxLength || 2000]);
            }
          } else if (stage === "confidence_scoring") {
            if (
              exportName.match(/score|calibrat|evaluat/i) &&
              typeof input === "object"
            ) {
              output = await safeCall(fn, [input.text || input, input.confidence || 0.5]);
            }
          } else if (stage === "reasoning_enhancement") {
            if (
              exportName.match(/reason|think|infer|process/i) &&
              typeof input === "string"
            ) {
              output = await safeCall(fn, [input]);
            }
          } else if (stage === "memory_retrieval") {
            if (
              exportName.match(/search|retriev|query|find/i) &&
              typeof input === "string"
            ) {
              output = await safeCall(fn, [input]);
            }
          } else if (stage === "adversarial_testing") {
            if (
              exportName.match(/test|challeng|verif/i) &&
              typeof input === "object"
            ) {
              output = await safeCall(fn, [input.response || input, input.query || ""]);
            }
          } else if (stage === "knowledge_synthesis") {
            if (
              exportName.match(/synthe|integrat|merg/i) &&
              typeof input === "object"
            ) {
              output = await safeCall(fn, [input.sources || [input]]);
            }
          } else if (stage === "causal_analysis") {
            if (exportName.match(/causal|counterfactual|propagat/i)) {
              output = await safeCall(fn, [input]);
            }
          } else {
            if (typeof input === "string") {
              output = await safeCall(fn, [input]);
            } else if (typeof input === "object") {
              output = await safeCall(fn, [input]);
            }
          }

          if (output !== undefined && output !== null) break;
        } catch {
          continue;
        }
      }

      if (output !== undefined && output !== null) {
        reg.callCount++;
        reg.lastCalledAt = Date.now();
        reg.totalDurationMs += Date.now() - callStart;
        registry.totalCalls++;
        modulesUsed.push(filename);

        const stringified =
          typeof output === "string"
            ? output.slice(0, 500)
            : typeof output === "number"
              ? String(output)
              : typeof output === "object"
                ? JSON.stringify(output).slice(0, 500)
                : String(output).slice(0, 500);

        results.push({
          module: filename,
          stage,
          output: stringified,
          durationMs: Date.now() - callStart,
        });
      }
    } catch {
      reg.errors++;
      if (reg.errors > 10) {
        reg.active = false;
        console.log(
          `[MODULE PIPELINE] ⚠️ Disabled "${filename}" — too many errors (${reg.errors})`,
        );
      }
    }
  });

  await Promise.allSettled(promises);

  if (results.length > 0) {
    saveRegistry();
  }

  return { results, modulesUsed, durationMs: Date.now() - start };
}

export async function runFullPipeline(
  message: string,
  context?: { history?: any[]; confidence?: number },
): Promise<{
  pipelineContext: string;
  stagesRun: string[];
  modulesUsed: string[];
  totalDurationMs: number;
}> {
  const start = Date.now();
  const stagesRun: string[] = [];
  const allModulesUsed: string[] = [];
  const pipelineParts: string[] = [];

  const contextResult = await runPipelineStage("context_compression", {
    entries: context?.history?.map((h) => h.content) || [],
    maxLength: 2000,
  });
  if (contextResult.results.length > 0) {
    stagesRun.push("context_compression");
    allModulesUsed.push(...contextResult.modulesUsed);
    pipelineParts.push(
      `[CONTEXT COMPRESSION — ${contextResult.modulesUsed.length} modules] ${contextResult.results.map((r) => r.output).join(" | ")}`,
    );
  }

  const reasoningResult = await runPipelineStage(
    "reasoning_enhancement",
    message,
  );
  if (reasoningResult.results.length > 0) {
    stagesRun.push("reasoning_enhancement");
    allModulesUsed.push(...reasoningResult.modulesUsed);
    pipelineParts.push(
      `[REASONING MODULES — ${reasoningResult.modulesUsed.length} modules] ${reasoningResult.results.map((r) => r.output).join(" | ")}`,
    );
  }

  const confidenceResult = await runPipelineStage("confidence_scoring", {
    text: message,
    confidence: context?.confidence || 0.5,
  });
  if (confidenceResult.results.length > 0) {
    stagesRun.push("confidence_scoring");
    allModulesUsed.push(...confidenceResult.modulesUsed);
    pipelineParts.push(
      `[CONFIDENCE SCORING — ${confidenceResult.modulesUsed.length} modules] ${confidenceResult.results.map((r) => r.output).join(" | ")}`,
    );
  }

  const knowledgeResult = await runPipelineStage("knowledge_synthesis", {
    sources: pipelineParts,
  });
  if (knowledgeResult.results.length > 0) {
    stagesRun.push("knowledge_synthesis");
    allModulesUsed.push(...knowledgeResult.modulesUsed);
    pipelineParts.push(
      `[KNOWLEDGE SYNTHESIS — ${knowledgeResult.modulesUsed.length} modules] ${knowledgeResult.results.map((r) => r.output).join(" | ")}`,
    );
  }

  const totalDurationMs = Date.now() - start;

  const pipelineContext =
    pipelineParts.length > 0
      ? `\n\n═══ LIVE MODULE PIPELINE — ${allModulesUsed.length} self-authored modules active ═══\n${pipelineParts.join("\n")}`
      : "";

  return { pipelineContext, stagesRun, modulesUsed: allModulesUsed, totalDurationMs };
}

export function getPipelineState() {
  const byStage: Record<string, number> = {};
  const activeCount = Array.from(liveModules.values()).filter(
    (m) => m.reg.active,
  ).length;

  for (const [_, { reg }] of liveModules) {
    if (reg.active) {
      byStage[reg.stage] = (byStage[reg.stage] || 0) + 1;
    }
  }

  return {
    totalRegistered: liveModules.size,
    activeModules: activeCount,
    byStage,
    totalCalls: registry.totalCalls,
    lastScan: registry.lastScan,
  };
}

export function getModuleStats(): {
  filename: string;
  stage: string;
  calls: number;
  active: boolean;
}[] {
  return Array.from(liveModules.values())
    .map(({ reg }) => ({
      filename: reg.filename,
      stage: reg.stage,
      calls: reg.callCount,
      active: reg.active,
    }))
    .sort((a, b) => b.calls - a.calls);
}
