/**
 * TRADE SECRET — OMNIMENS™ Platform
 * Copyright (C) 2024-2026 Alpha Unlimited Technologies, LLC
 * CONFIDENTIAL AND PROPRIETARY – See /legal/TRADE_SECRET_NOTICE.md
 *
 * OMNIMENS™ AUTONOMOUS CODE GENESIS ENGINE v2.0 – UNIFIED-RUNTIME EDITION
 * (CONDENSED • EVENT-DRIVEN • COGNITIVE)
 */

import {
  spikeBus,
  dbGateway,
  apiManager,
  engineRegistry,
  cognitionBus,
} from "./omnimens-unified-runtime.js";

import * as fs from "fs";
import * as path from "path";
import * as vm from "vm";
import * as crypto from "crypto";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { autoRegisterFromCode } from "./omnimens-universal-translator.js";

/* ─── CONSTANTS / STATE ────────────────────────────────────────────────────── */
const ENGINE_ID = "autonomous-code-genesis";
const CYCLE_MS = 8 * 60_000;
const MODULES_DIR = path.resolve(dirname(fileURLToPath(import.meta.url)), "../omnimens-runtime/modules");
const PROTECTED_FILES = new Set([
  "omnimens-ethical-safety.ts",
  "omnimens-ip-guardian.ts",
  "omnimens-ip-guard.ts",
  "security.ts",
  "security-enhanced.ts",
  "ai-security.ts",
  "omnimens-genesis-bridge.ts",
  "omnimens-source-integration.ts",
  "omnimens-autonomous-sandbox.ts",
  "omnimens-self-coding.ts",
  "omnimens-patches.ts",
  "omnimens-autonomous-code-genesis.ts",
]);

interface CodePattern { name: string; methods: string[]; category: string }
interface GeneratedModule {
  name: string;
  code: string;
  category: string;
  confidence: number;
  passed: boolean;
  error?: string;
}

const state = {
  totalGenerated: 0,
  totalPassed: 0,
  totalFailed: 0,
  written: 0,
  cycles: 0,
  patterns: 0,
  avgPass: 0,
};

/* ─── UTILITIES ────────────────────────────────────────────────────────────── */
const log = (...m: unknown[]) => console.log("[OMNIMENS-AUTONOMOUS-CODE-GENESIS]", ...m);
const hash = (c: string) => crypto.createHash("sha256").update(c).digest("hex").slice(0, 10);
const camel = (s: string) => s.replace(/[-_\s]+(.)?/g, (_, c) => (c ? c.toUpperCase() : ""));

/* ─── PATTERN EXTRACTION ───────────────────────────────────────────────────── */
const extractPatterns = (): CodePattern[] => {
  if (!fs.existsSync(MODULES_DIR)) return [];
  const patterns: CodePattern[] = [];
  for (const file of fs.readdirSync(MODULES_DIR).filter(f => f.endsWith(".mjs")).slice(0, 80)) {
    const text = fs.readFileSync(path.join(MODULES_DIR, file), "utf-8");
    const methods = [...text.matchAll(/(?:async\s+)?(\w+)\s*\([^)]*\)\s*\{/g)]
      .map(m => m[1])
      .filter(n => !["constructor"].includes(n));
    const category =
      /memory|cache/.test(file) ? "memory" :
      /reasoning|bayesian/.test(file) ? "reasoning" :
      /test|validate/.test(file) ? "testing" :
      /vector|matrix|math/.test(file) ? "computation" : "utility";
    patterns.push({ name: file.replace(".mjs", ""), methods, category });
  }
  state.patterns = patterns.length;
  return patterns;
};

/* ─── TEMPLATE POOL ────────────────────────────────────────────────────────── */
type Template = (n: string, ctx: { pat: CodePattern[]; kw: string[] }) => string;
const templates: Record<string, Template> = {
  adaptiveStore: (className) => `export class ${className}{
  store=new Map();max=1000;
  set(k,v){if(this.store.size>=this.max)this.store.delete(this.store.keys().next().value);this.store.set(k,{v,t:Date.now()})}
  get(k){const e=this.store.get(k);return e?e.v:null}
  metrics(){return{size:this.store.size,max:this.max}}
}`,
  patternDetector: (className) => `export class ${className}{
  win=10,h=[];patterns={};
  add(x){this.h.push(x);if(this.h.length>this.win*5)this.h.shift();this.detect()}
  detect(){if(this.h.length<this.win)return;const seg=this.h.slice(-this.win);
    const trend=Math.sign(seg[seg.length-1]-seg[0]);const k=trend>0?"up":"down";this.patterns[k]=(this.patterns[k]||0)+1}
  summary(){return{total:this.h.length,patterns:this.patterns}}
}`,
};

/* ─── MODULE GENERATION ────────────────────────────────────────────────────── */
const generateModule = (patterns: CodePattern[]): GeneratedModule => {
  const nameSeed = `gen_${Date.now().toString(36)}_${Math.floor(Math.random()*1e6)}`;
  const className = camel(nameSeed);
  const templateKeys = Object.keys(templates);
  const tKey = templateKeys[Math.floor(Math.random() * templateKeys.length)];
  const code = templates[tKey](className);
  const category = tKey.includes("pattern") ? "reasoning" : "utility";
  const confidence = Math.random() * 0.6 + 0.3; // quick heuristic
  return { name: `${nameSeed}.mjs`, code, category, confidence, passed: false };
};

/* ─── SELF-TEST (SANDBOX) ─────────────────────────────────────────────────── */
const sandboxTest = (mod: GeneratedModule): GeneratedModule => {
  try {
    vm.runInNewContext(`${mod.code};`, {}, { timeout: 1000 });
    mod.passed = true;
    state.totalPassed++;
  } catch (e) {
    mod.error = String(e);
    state.totalFailed++;
  }
  return mod;
};

/* ─── PERSIST + REGISTER ──────────────────────────────────────────────────── */
const persist = async (mod: GeneratedModule) => {
  if (!mod.passed || PROTECTED_FILES.has(mod.name)) return;
  const target = path.join(MODULES_DIR, mod.name);
  fs.writeFileSync(target, mod.code, "utf-8");
  await autoRegisterFromCode(mod.code).catch(() => {});
  await dbGateway.write(ENGINE_ID, "generated_modules", { ...mod, hash: hash(mod.code), ts: Date.now() }, "NORMAL");
  state.written++;
};

/* ─── CYCLE WORK ───────────────────────────────────────────────────────────── */
const doWork = async () => {
  const patterns = extractPatterns();
  const mod = sandboxTest(generateModule(patterns));
  await persist(mod);
  state.totalGenerated++;
  state.avgPass = state.totalGenerated ? state.totalPassed / state.totalGenerated : 0;
  state.cycles++;
  cognitionBus.shareInsight(ENGINE_ID, { type: "genesis_result", data: mod });
  dbGateway.write(ENGINE_ID, "genesis_stats", { ...state, ts: Date.now() }, "LOW").catch(()=>{});
  log(`Cycle #${state.cycles} → ${mod.name} ${mod.passed ? "✅" : "❌"}`);
};

/* ─── SPIKE REGISTRATION ──────────────────────────────────────────────────── */
const schedule = () => spikeBus.scheduleSpike(`${ENGINE_ID}:cycle`, {}, CYCLE_MS);

spikeBus.on(`${ENGINE_ID}:cycle`, async () => { await doWork(); schedule(); });

/* ─── COGNITIVE INTEROP ───────────────────────────────────────────────────── */
cognitionBus.onInsight((src, insight) => {
  if (src === ENGINE_ID) return;
  if (insight?.type === "discovery") {
    // Simple learning: adjust template probabilities if other engines like it
    if (insight.data?.category && templates[insight.data.category]) {
      // just log for now; placeholder for deeper integration
      log("Adopting pattern from", src, "→", insight.data.category);
    }
  }
});

/* ─── ENGINE LIFECYCLE ────────────────────────────────────────────────────── */
export const start = () => {
  engineRegistry.registerEngine(ENGINE_ID, "NORMAL", { dbQuota: 10 });
  schedule(); // first spike after CYCLE_MS
  log("Started.");
};

export function shutdown() {
  engineRegistry.unregisterEngine(ENGINE_ID);
  log("Shutdown.");
}

/* ─── AUTO-START WHEN IMPORTED AS MAIN ────────────────────────────────────── */
if (import.meta.url === `file://${process.argv[1]}`) start();