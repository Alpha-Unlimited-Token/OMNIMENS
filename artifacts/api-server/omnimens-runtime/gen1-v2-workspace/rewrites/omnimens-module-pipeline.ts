/**
 * TRADE SECRET — OMNIMENS™ Platform
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * CONFIDENTIAL AND PROPRIETARY.
 */

import {
  readdirSync,
  readFileSync,
  existsSync,
  writeFileSync,
  mkdirSync,
  copyFileSync,
} from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import vm from "vm";

/* ─── UNIFIED RUNTIME ──────────────────────────────────────────────────────── */
import {
  spikeBus,
  dbGateway,
  apiManager,
  engineRegistry,
  cognitionBus,
} from "./omnimens-unified-runtime.js";

engineRegistry.registerEngine("module-pipeline", "NORMAL", { dbQuota: 10 });

const LOG = (...m: any[]) =>
  console.log("[OMNIMENS-MODULE-PIPELINE]", ...m);

/* ─── PATHS ────────────────────────────────────────────────────────────────── */
const __dirname = dirname(fileURLToPath(import.meta.url));
const RUNTIME_DIR = join(__dirname, "../omnimens-runtime");
const MODULES_DIR = join(RUNTIME_DIR, "modules");
const REGISTRY_PATH = join(RUNTIME_DIR, "pipeline-registry.json");

/* ─── TYPES ───────────────────────────────────────────────────────────────── */
type Stage =
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

interface ModMeta {
  filename: string;
  stage: Stage;
  exports: string[];
  loadedAt: number;
  callCount: number;
  lastCalledAt: number | null;
  totalDurationMs: number;
  errors: number;
  active: boolean;
}

interface Registry {
  modules: Record<string, ModMeta>;
  lastScan: number;
  totalModules: number;
  totalCalls: number;
}

/* ─── KEYWORDS → STAGE ────────────────────────────────────────────────────── */
const KW: Record<Stage, RegExp[]> = {
  context_compression: [
    "context",
    "compress",
    "summariz",
    "preserv",
    "sliding",
    "window",
    "conversation",
    "truncat",
    "compact",
  ],
  memory_retrieval: [
    "memory",
    "recall",
    "retriev",
    "embedding",
    "vector",
    "cache",
    "store",
    "search",
    "nearest",
    "knn",
    "hnsw",
    "persist",
    "encrypted.*store",
    "persistent.*memory",
    "bulk.*get",
    "bulk.*set",
  ],
  reasoning_enhancement: [
    "reason",
    "thinking",
    "thought",
    "metacognit",
    "dual.*process",
    "inference",
    "hypothesis",
    "counterfactual",
    "formal.*verif",
    "tree.*thought",
    "graph.*rag",
  ],
  confidence_scoring: [
    "confidence",
    "calibrat",
    "bayesian",
    "uncertainty",
    "entropy",
    "scoring",
    "consistency",
    "weighted.*vote",
  ],
  knowledge_synthesis: [
    "knowledge.*graph",
    "synthe",
    "insight",
    "integrat",
    "graph.*entity",
    "semantic",
  ],
  adversarial_testing: [
    "adversarial",
    "fault.*inject",
    "stress.*test",
    "edge.*case",
    "self.*test",
    "self.*reward",
    "debate",
  ],
  causal_analysis: [
    "causal",
    "counterfactual",
    "intervene",
    "multiverse",
    "cause.*effect",
    "propagat",
  ],
  vector_operations: [
    "matrix",
    "wasm",
    "gpu",
    "accelerat",
    "linear.*algebra",
    "dot.*product",
    "efficient.*math",
    "parallel.*comput",
    "chunked.*compute",
    "iterative.*compute",
    "time.*budget",
    "map.*reduce",
    "genetic.*search",
    "convergence",
  ],
  orchestration: [
    "orchestrat",
    "allocat",
    "coordinat",
    "pub.*sub",
    "event.*driven",
    "hierarchical.*task",
    "dynamic.*role",
    "swarm",
    "agent.*orchestrat",
  ],
  utility: [
    "tool.*forge",
    "tool.*creat",
    "evolve",
    "alpha.*evolve",
    "evolution.*marker",
    "sleep.*phase",
    "daydream",
    "sandbox",
  ],
};

for (const k in KW) KW[k as Stage] = KW[k as Stage].map((w) => new RegExp(w, "gi"));

/* ─── RUNTIME STATE ───────────────────────────────────────────────────────── */
const live = new Map<string, { module: any; meta: ModMeta }>();
let registry: Registry = {
  modules: {},
  lastScan: 0,
  totalModules: 0,
  totalCalls: 0,
};

/* ─── HELPERS ─────────────────────────────────────────────────────────────── */
const readJSON = (p: string) => JSON.parse(readFileSync(p, "utf8"));
const writeJSON = (p: string, o: any) =>
  writeFileSync(p, JSON.stringify(o, null, 2), "utf8");

const classify = (file: string, code: string): Stage => {
  const sample = (file + " " + code.slice(0, 1500)).toLowerCase();
  let best: Stage = "utility";
  let score = 0;
  for (const [stage, kw] of Object.entries(KW) as [Stage, RegExp[]][]) {
    const s = kw.reduce((n, r) => n + (sample.match(r)?.length || 0), 0);
    if (s > score) (score = s), (best = stage);
  }
  return best;
};

const getExports = (code: string) => {
  const out = new Set<string>();
  const add = (re: RegExp) => {
    let m;
    while ((m = re.exec(code))) out.add(m[1] || "default");
  };
  add(/export\s+(?:async\s+)?function\s+(\w+)/g);
  add(/export\s+class\s+(\w+)/g);
  add(/export\s+(?:const|let|var)\s+(\w+)/g);
  add(/export\s+default\s+(?:function|class)\s*(\w*)/g);
  let n;
  const named = /export\s*\{([^}]+)\}/g;
  while ((n = named.exec(code)))
    n[1]
      .split(",")
      .map((x) => x.trim().split(/\s+as\s+/).pop())
      .forEach((x) => x && out.add(x));
  if (!out.size && /(module\.exports|exports\.)/.test(code)) out.add("default");
  return [...out];
};

const saveRegistry = () => {
  try {
    mkdirSync(RUNTIME_DIR, { recursive: true });
    writeJSON(REGISTRY_PATH, registry);
  } catch {}
};
const loadRegistry = () => {
  try {
    if (existsSync(REGISTRY_PATH)) registry = readJSON(REGISTRY_PATH);
  } catch {}
};

const safeCall = async (fn: Function, args: any[], ms = 500) => {
  try {
    const r = fn(...args);
    return r?.then
      ? await Promise.race([
          r,
          new Promise((_, rej) => setTimeout(() => rej("timeout"), ms)),
        ])
      : r;
  } catch {}
};

const tryRepair = (code: string) => {
  const fixes: string[] = [];
  let fixed = code;

  if (/\barguments\b/.test(code.replace(/(["'`]).*?\1/g, ""))) {
    fixed = fixed.replace(/\barguments\b(?!\s*[.[])/g, "/*args*/[]");
    fixes.push("args");
  }
  if (
    /(?<!\w)(RecursiveScaffolder|ScaffoldingEngine|BaseScaffold)\b/.test(fixed)
  ) {
    fixed = fixed.replace(
      /(?<!\w)(RecursiveScaffolder|ScaffoldingEngine|BaseScaffold)\b/g,
      "Object",
    );
    fixes.push("class");
  }
  if (/(?<!\w)eval\s*\(/.test(fixed.replace(/(["'`]).*?\1/g, ""))) return null;
  if (!fixes.length) return null;

  try {
    new vm.Script(
      fixed
        .replace(/^import .*$/gm, "")
        .replace(/^export .*$/gm, ""),
      { filename: "check.mjs" },
    );
    return { fixed, fixes };
  } catch {
    return null;
  }
};

/* ─── MODULE LOAD / REGISTER ──────────────────────────────────────────────── */
async function loadModule(
  filename: string,
  code: string,
  stage: Stage,
  exports: string[],
  repaired = false,
) {
  const filePath = join(MODULES_DIR, filename);
  try {
    const mod = await import(`${filePath}?t=${Date.now()}`); // cache-bust
    live.set(filename, {
      module: mod,
      meta: (registry.modules[filename] = {
        filename,
        stage,
        exports,
        loadedAt: Date.now(),
        callCount: registry.modules[filename]?.callCount || 0,
        lastCalledAt: registry.modules[filename]?.lastCalledAt || null,
        totalDurationMs: registry.modules[filename]?.totalDurationMs || 0,
        errors: registry.modules[filename]?.errors || 0,
        active: true,
      }),
    });
    return true;
  } catch (e: any) {
    if (!repaired) {
      const repair = tryRepair(code);
      if (repair) {
        const bkp = join(MODULES_DIR, "../backups");
        mkdirSync(bkp, { recursive: true });
        copyFileSync(filePath, join(bkp, `${filename}.${Date.now()}`));
        writeFileSync(filePath, repair.fixed, "utf8");
        return loadModule(filename, repair.fixed, stage, exports, true);
      }
    }
    LOG("import failed:", filename, e?.message?.slice(0, 120) || e);
    registry.modules[filename] &&
      (registry.modules[filename].active = false);
    return false;
  }
}

/* ─── PUBLIC API ──────────────────────────────────────────────────────────── */
export async function scanAndRegisterModules() {
  if (!existsSync(MODULES_DIR)) {
    mkdirSync(MODULES_DIR, { recursive: true });
    return { total: 0, registered: 0, byStage: {} };
  }
  loadRegistry();
  const files = readdirSync(MODULES_DIR).filter((f) => /\.[cm]?js$/.test(f));
  const byStage: Record<string, number> = {};
  let registered = 0;

  await Promise.all(
    files.map(async (f) => {
      try {
        const code = readFileSync(join(MODULES_DIR, f), "utf8");
        const stage = classify(f, code);
        const exports = getExports(code);
        if (!exports.length) return;
        if (await loadModule(f, code, stage, exports)) {
          registered++;
          byStage[stage] = (byStage[stage] || 0) + 1;
        }
      } catch {}
    }),
  );

  registry.lastScan = Date.now();
  registry.totalModules = registered;
  saveRegistry();

  LOG(`🔌 ${registered}/${files.length} modules live`);
  Object.entries(byStage).forEach(([s, c]) => LOG("  ", s, c));
  return { total: files.length, registered, byStage };
}

export async function registerNewModule(filename: string) {
  const fp = join(MODULES_DIR, filename);
  if (!existsSync(fp)) return false;
  const code = readFileSync(fp, "utf8");
  const stage = classify(filename, code);
  const exports = getExports(code);
  if (!exports.length) return false;
  const ok = await loadModule(filename, code, stage, exports);
  if (ok) {
    registry.totalModules++;
    saveRegistry();
    LOG("⚡ NEW MODULE", filename, "→", stage);
  }
  return ok;
}

export async function runPipelineStage(stage: Stage, input: any) {
  const start = Date.now();
  const out: any[] = [];
  const used: string[] = [];

  const mods = [...live.values()]
    .filter(({ meta }) => meta.stage === stage && meta.active)
    .sort((a, b) => b.meta.callCount - a.meta.callCount)
    .slice(0, 5);

  await Promise.all(
    mods.map(async ({ meta, module }) => {
      const callStart = Date.now();
      try {
        for (const name of meta.exports) {
          const fn = module[name] || module.default?.[name];
          if (typeof fn !== "function") continue;
          const M = (r: RegExp) => r.test(name);
          let o;
          switch (stage) {
            case "context_compression":
              if (M(/compress|summariz/i) && input?.entries)
                o = await safeCall(fn, [input.entries, input.maxLength || 2e3]);
              break;
            case "confidence_scoring":
              if (M(/score|calibrat|evaluat/i))
                o = await safeCall(fn, [input.text || input, input.confidence || 0.5]);
              break;
            case "reasoning_enhancement":
              if (M(/reason|think|infer|process/i) && typeof input === "string")
                o = await safeCall(fn, [input]);
              break;
            case "memory_retrieval":
              if (M(/search|retriev|query|find/i) && typeof input === "string")
                o = await safeCall(fn, [input]);
              break;
            case "adversarial_testing":
              if (M(/test|challeng|verif/i))
                o = await safeCall(fn, [input.response || input, input.query || ""]);
              break;
            case "knowledge_synthesis":
              if (M(/synthe|integrat|merg/i))
                o = await safeCall(fn, [input.sources || [input]]);
              break;
            case "causal_analysis":
              if (M(/causal|counterfactual|propagat/i))
                o = await safeCall(fn, [input]);
              break;
            default:
              o = await safeCall(fn, [input]);
          }
          if (o !== undefined && o !== null) {
            meta.callCount++;
            meta.lastCalledAt = Date.now();
            meta.totalDurationMs += Date.now() - callStart;
            registry.totalCalls++;
            used.push(meta.filename);
            out.push({
              module: meta.filename,
              stage,
              output:
                typeof o === "string"
                  ? o.slice(0, 500)
                  : JSON.stringify(o).slice(0, 500),
              durationMs: Date.now() - callStart,
            });
            break; // stop at first successful export
          }
        }
      } catch {
        meta.errors++;
        if (meta.errors > 10) {
          meta.active = false;
          LOG("disabled", meta.filename, "too many errors");
        }
      }
    }),
  );

  if (out.length) saveRegistry();
  return { results: out, modulesUsed: used, durationMs: Date.now() - start };
}

export async function runFullPipeline(
  message: string,
  context?: { history?: any[]; confidence?: number },
) {
  const start = Date.now();
  const parts: string[] = [];
  const stages: string[] = [];
  const mods: string[] = [];

  const ctx = await runPipelineStage("context_compression", {
    entries: context?.history?.map((h) => h.content) || [],
    maxLength: 2000,
  });
  if (ctx.results.length) {
    stages.push("context_compression");
    mods.push(...ctx.modulesUsed);
    parts.push(`[CTX] ${ctx.results.map((r) => r.output).join(" | ")}`);
  }

  const rsn = await runPipelineStage("reasoning_enhancement", message);
  if (rsn.results.length) {
    stages.push("reasoning_enhancement");
    mods.push(...rsn.modulesUsed);
    parts.push(`[RSN] ${rsn.results.map((r) => r.output).join(" | ")}`);
  }

  const conf = await runPipelineStage("confidence_scoring", {
    text: message,
    confidence: context?.confidence || 0.5,
  });
  if (conf.results.length) {
    stages.push("confidence_scoring");
    mods.push(...conf.modulesUsed);
    parts.push(`[CONF] ${conf.results.map((r) => r.output).join(" | ")}`);
  }

  const knw = await runPipelineStage("knowledge_synthesis", { sources: parts });
  if (knw.results.length) {
    stages.push("knowledge_synthesis");
    mods.push(...knw.modulesUsed);
    parts.push(`[KNOW] ${knw.results.map((r) => r.output).join(" | ")}`);
  }

  return {
    pipelineContext: parts.length
      ? `\n\n═══ LIVE MODULE PIPELINE — ${mods.length} modules ═══\n${parts.join(
          "\n",
        )}`
      : "",
    stagesRun: stages,
    modulesUsed: mods,
    totalDurationMs: Date.now() - start,
  };
}

export function getPipelineState() {
  const byStage: Record<string, number> = {};
  [...live.values()]
    .filter((l) => l.meta.active)
    .forEach((l) => (byStage[l.meta.stage] = (byStage[l.meta.stage] || 0) + 1));
  return {
    totalRegistered: live.size,
    activeModules: [...live.values()].filter((l) => l.meta.active).length,
    byStage,
    totalCalls: registry.totalCalls,
    lastScan: registry.lastScan,
  };
}

export function getModuleStats() {
  return [...live.values()]
    .map(({ meta }) => ({
      filename: meta.filename,
      stage: meta.stage,
      calls: meta.callCount,
      active: meta.active,
    }))
    .sort((a, b) => b.calls - a.calls);
}

/* ─── COGNITION HOOKS ─────────────────────────────────────────────────────── */
cognitionBus.onInsight((src, ins) => {
  if (src !== "module-pipeline" && ins.type === "discovery") {
    const m = ins.data?.module as string | undefined;
    if (m && live.has(m)) live.get(m)!.meta.callCount++;
  }
});

spikeBus.on("attention:module-pipeline", () => {
  /* future: dynamic priority boost */
});

spikeBus.on("cognition:curiosity", () => {
  /* future: exploratory rescan */
});

/* ─── PERIODIC RESCAN → SPIKE ─────────────────────────────────────────────── */
const RESCAN = () =>
  scanAndRegisterModules().finally(() =>
    spikeBus.scheduleSpike("module-pipeline:rescan", {}, 60_000),
  );
spikeBus.on("module-pipeline:rescan", RESCAN);
spikeBus.scheduleSpike("module-pipeline:rescan", {}, 0);

/* ─── SHUTDOWN ───────────────────────────────────────────────────────────── */
export function shutdown() {
  engineRegistry.unregisterEngine("module-pipeline");
}