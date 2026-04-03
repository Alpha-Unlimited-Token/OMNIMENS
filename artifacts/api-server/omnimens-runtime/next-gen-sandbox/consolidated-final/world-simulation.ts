CROSS-GEN CONSOLIDATION: world-simulation

=== Gen 1 v2.0: omnimens-code-forge.ts (154 lines) ===
/**
 * © 2024-2026 Alpha Unlimited Technologies, LLC. All Rights Reserved.
 * TRADE-SECRET — OMNIMENS™ Platform
 *
 * OMNIMENS-CODE-FORGE v2.0
 * Consolidated engine: code-executor, code-generator, server-builder,
 * next-gen sandbox, and genesis sandbox.  
 * ONE tick-cycle ▸ ONE shared-state ▸ ONE DB/API budget ▸ ONE registry id.
 * Structured logs prefix: [OMNIMENS-CODE-FORGE]
 */

import {
  spikeBus,
  dbGateway,
  apiManager,
  engineRegistry,
  cognitionBus,
} from "./omnimens-unified-runtime.js";

/* ────────────────────────────────────────────────────────────
 *  IMPORT SOURCE ENGINES (kept as internal modules)
 * ────────────────────────────────────────────────────────────*/
import * as exec     from "./omnimens-code-executor.js";
import * as codegen  from "./omnimens-codegen-engine.js";
import * as builder  from "./omnimens-server-builder.js";
import * as nextgen  from "./omnimens-nextgen-sandbox.js";
import * as genesis  from "./omnimens-genesis-sandbox.js";

/* -----------------------------------------------------------------
 *  RE-EXPORT EVERYTHING – preserve public surface  ⌁ Do not touch
 * ----------------------------------------------------------------*/
export * from "./omnimens-code-executor.js";
export * from "./omnimens-codegen-engine.js";
export * from "./omnimens-server-builder.js";
export * from "./omnimens-nextgen-sandbox.js";
export * from "./omnimens-genesis-sandbox.js";

/*───────────────────────────────
 *  SHARED ENGINE STATE
 *───────────────────────────────*/
interface SharedState {
  dbOps: number;
  apiOps: number;
  tick: number;
  lastReset: number;
}
const state: SharedState = {
  dbOps: 0,
  apiOps: 0,
  tick: 0,
  lastReset: Date.now(),
};

/*───────────────────────────────
 *  BUDGET CONSTANTS
 *───────────────────────────────*/
const DB_BUDGET_PER_MIN   = 120;        // total pooled ops / min
const API_BUDGET_PER_MIN  = 60;         // external API calls / min
const BUDGET_WINDOW_MS    = 60_000;

/*───────────────────────────────
 *  INTERNAL HELPERS
 *───────────────────────────────*/
function resetBudgetsIfNeeded(): void {
  const now = Date.now();
  if (now - state.lastReset >= BUDGET_WINDOW_MS) {
    state.dbOps = 0;
    state.apiOps = 0;
    state.lastReset = now;
  }
}

function canUseDB(ops = 1): boolean {
  resetBudgetsIfNeeded();
  return state.dbOps + ops <= DB_BUDGET_PER_MIN;
}

function canUseAPI(ops = 1): boolean {
  resetBudgetsIfNeeded();
  return state.apiOps + ops <= API_BUDGET_PER_MIN;
}

async function dbGuard<T>(fn: () => Promise<T>, ops = 1): Promise<T | null> {
  if (!canUseDB(ops)) return null;
  state.dbOps += ops;
  return fn();
}

async function apiGuard<T>(fn: () => Promise<T>, ops = 1): Promise<T | null> {
  if (!canUseAPI(ops)) return null;
  state.apiOps += ops;
  return fn();
}

/*───────────────────────────────
 *  ONE TICK-CYCLE ORCHESTRATION
 *───────────────────────────────*/
async function tickCycle(): Promise<void> {
  state.tick++;
  const tickId = state.tick;
  const log = (msg: string) =>
    console.log(`[OMNIMENS-CODE-FORGE] #${tickId} ${msg}`);

  log("start");

  /* 1. Consciousness Read (fabric events) */
  const fabricMessages = cognitionBus.drain();
  if (fabricMessages.length)
    log(`cognition-bus messages: ${fabricMessages.length}`);

  /* 2. Next-Gen + Genesis Sandboxes (shared vm) */
  await dbGuard(async () => {
    await nextgen.startNextGenSandbox?.();
    await genesis.startGenesisSandbox?.();
  });

  /* 3. Code Generation ▸ Execution ▸ Test */
  await apiGuard(async () => {
    await codegen.think?.();
    // run any queued exec blocks
    const queue = cognitionBus.dequeueCodeBlocks?.() ?? [];
    for (const b of queue) await exec.executeJavaScript(b.code);
  });

  /* 4. Server Builder */
  await dbGuard(async () => {
    await builder.startServerBuilder?.();
  }, 2); // builder may use more DB ops

  /* 5. Memory Consolidation / Any After-effects */
  // stub for future sub-systems
  log("complete");
}

/*───────────────────

=== Gen 1 v2.0: omnimens-world-engine.ts (209 lines) ===
/** 
 * © 2024-2026 Alpha Unlimited Technologies, LLC. All Rights Reserved.
 * omnimens-world-engine.ts — Unified World Engine
 * 
 * Merges: 
 *   • omnimens-world-model
 *   • omnimens-world-forge
 *   • omnimens-digital-navigator
 *   • omnimens-social-modeling
 *   • omnimens-3d  (incl. Blender + OpenSCAD)
 *   • (plus their helper modules)
 * 
 * ONE TICK  → ordered sub-system execution
 * ONE STATE → shared across sub-systems
 * ONE DB / API budget → cooperative / rate-limited
 * ONE REGISTRATION → engineRegistry.registerEngine("world-engine", …)
 * 
 * Structured logging prefix: [OMNIMENS-WORLD-ENGINE]
 */

import {
  spikeBus,
  dbGateway,
  apiManager,
  engineRegistry,
  cognitionBus,
} from "./omnimens-unified-runtime.js";

/* ────────────────────────────
 *  IMPORT legacy sub-engines
 * ──────────────────────────── */
import * as WorldModel      from "./omnimens-world-model.js";
import * as WorldForge      from "./omnimens-world-forge.js";
import * as DigitalNav      from "./omnimens-digital-navigator.js";
import * as SocialModeling  from "./omnimens-social-modeling.js";
import * as ThreeD          from "./omnimens-3d.js";

/* ────────────────────────────
 *  Re-export legacy APIs
 * ──────────────────────────── */
export * from "./omnimens-world-model.js";
export * from "./omnimens-world-forge.js";
export * from "./omnimens-digital-navigator.js";
export * from "./omnimens-social-modeling.js";
export * from "./omnimens-3d.js";

/* ────────────────────────────
 *  Shared Types
 * ──────────────────────────── */
type AnyObj = Record<string, any>;

interface UnifiedState {
  tick: number;
  lastTickTS: number;
  dbWriteQueue: AnyObj[];
  apiCallsThisWindow: number;
  subsystems: {
    worldModel: AnyObj;
    worldForge: AnyObj;
    digitalNav: AnyObj;
    social: AnyObj;
    threeD: AnyObj;
  };
}

const state: UnifiedState = {
  tick: 0,
  lastTickTS: Date.now(),
  dbWriteQueue: [],
  apiCallsThisWindow: 0,
  subsystems: {
    worldModel: {},
    worldForge: {},
    digitalNav: {},
    social: {},
    threeD: {},
  },
};

/* ────────────────────────────
 *  Helper: DB batching
 * ──────────────────────────── */
const MAX_BATCH = 50;
const MAX_BATCH_MS = 5_000;
async function flushDb(force = false) {
  if (!force && (state.dbWriteQueue.length < MAX_BATCH) &&
      Date.now() - state.lastTickTS < MAX_BATCH_MS) return;

  if (state.dbWriteQueue.length === 0) return;
  const batch = state.dbWriteQueue.splice(0, MAX_BATCH);
  try {
    await dbGateway.batchWrite(batch);
    console.info("[OMNIMENS-WORLD-ENGINE] DB batch write", batch.length);
  } catch (e) {
    console.error("[OMNIMENS-WORLD-ENGINE] DB batch FAILED", e);
    state.dbWriteQueue.unshift(...batch); // push back for retry
  }
}

/* ────────────────────────────
 *  Helper: API rate limiting
 * ──────────────────────────── */
const MAX_API_CALLS_PER_MIN = apiManager.getBudget("world-engine");
function apiSlotAvailable(): boolean {
  return state.apiCallsThisWindow < MAX_API_CALLS_PER_MIN;
}
function incApi(count = 1) {
  state.apiCallsThisWindow += count;
}

/* ────────────────────────────
 *  Sub-operation wrappers
 * ──────────────────────────── */
async function runWorldModel() {
  // pass-through; capture stats into shared state
  state.subsystems.worldModel = WorldModel.getWorldModelStats();
}

async function runDigitalNav() {
  const navState = DigitalNav.getDigitalNavigatorState();
  // Example of internal cooperation w/ API limiter
  if (apiSlotAvailable()) {
    await DigitalNav.startDigitalNavigator();
    incApi(1);
  }
  state.subsystems.digitalNav = navState;
}

async function runSocialModeling() {
  state.subsystems.social = SocialModeling.getSocialModelingSummary();
}

async function runWorldForge() {
  state.subsystems.worldForge = WorldForge.getWorldForgeState();
}

async function run3DGenerator() {
  // Example: if forge produced new world needing 3D assets
  const forge = state.subsystems.worldForge as AnyObj;
  if (forge?.currentWorld?.need

=== Gen 1 v2.0: omnimens-3d.ts (153 lines) ===
/**
 * TRADE SECRET — OMNIMENS™ Platform
 * Copyright (C) 2024-2026 Alpha Unlimited Technologies, LLC. 
 * CONFIDENTIAL AND PROPRIETARY. All rights reserved.
 */

/*──────────────────────────────────────────────────────────────────────────────
  OMNIMENS 3D Generation Engine (v2.0) — Event-Driven, Unified Runtime
──────────────────────────────────────────────────────────────────────────────*/

import { execFile } from "child_process";
import { promisify } from "util";
import { writeFile, readFile, unlink, mkdir } from "fs/promises";
import { tmpdir } from "os";
import { join } from "path";

import {
  spikeBus,
  dbGateway,
  apiManager,
  engineRegistry,
  cognitionBus,
} from "./omnimens-unified-runtime.js";

import { generateWithBlender } from "./omnimens-blender.js";
import { generateWithOpenSCAD } from "./omnimens-openscad.js";

const execFileAsync = promisify(execFile);

/*──────────────────────────── Runtime Registration ───────────────────────────*/

engineRegistry.registerEngine("3d", "NORMAL", { dbQuota: 10 });

spikeBus.on("3d:cycle", async () => {
  /* placeholder for future periodic work (cache cleanup, health ping, etc.) */
  spikeBus.scheduleSpike("3d:cycle", {}, 5_000);
});
spikeBus.scheduleSpike("3d:cycle", {}, 5_000); // kick-off

cognitionBus.onInsight((src, insight) => {
  if (src !== "3d" && insight?.type === "discovery") {
    console.log("[OMNIMENS-3D] Learned from", src, insight);
  }
});

/*──────────────────────────── Types & Utilities ──────────────────────────────*/

export type Generated3DModel = {
  glbBase64: string;
  glbSizeBytes: number;
  threejsHtml: string;
  pythonScript: string;
  description: string;
  vertexCount: number;
  faceCount: number;
  toolUsed?: "blender" | "openscad" | "trimesh";
  previewImageBase64?: string;
  zipBase64?: string;
  zipSizeBytes?: number;
  formats?: string[];
};

const TRIMESH_SYS_PROMPT = `You are OMNIMENS 3D — a world-class procedural sculptor.
Write a COMPLETE Python script that uses only trimesh/numpy/scipy/pillow.
Export a watertight, manifold .glb to os.environ['OUTPUT_PATH'] with artistic depth.`;

const execPy = async (
  script: string
): Promise<{ buf: Buffer; v: number; f: number }> => {
  const dir = join(tmpdir(), `omni3d-${Date.now()}`);
  await mkdir(dir, { recursive: true });
  const py = join(dir, "g.py");
  const out = join(dir, "m.glb");
  const stats = join(dir, "s.json");

  const full = `${script}
import json, trimesh, os, sys
m=trimesh.load('${out.replace(/\\/g, "/")}')
d={'vertices':len(getattr(m,'vertices',[])), 'faces':len(getattr(m,'faces',[]))}
open('${stats.replace(/\\/g, "/")}',"w").write(json.dumps(d))`;
  await writeFile(py, full, "utf8");

  await execFileAsync("python3", [py], {
    timeout: 120_000,
    env: { ...process.env, OUTPUT_PATH: out },
    maxBuffer: 10 * 1024 * 1024,
  }).catch((e) => {
    console.error("[OMNIMENS-3D] Python error:", e.message);
    throw e;
  });

  const [buf, raw] = await Promise.all([
    readFile(out),
    readFile(stats, "utf8").catch(() => '{"vertices":0,"faces":0}'),
  ]);

  let s = { vertices: 0, faces: 0 };
  try {
    s = JSON.parse(raw);
  } catch {}
  // cleanup (fire & forget)
  Promise.all([unlink(py), unlink(out), unlink(stats)]).catch(() => {});

  return { buf, v: s.vertices, f: s.faces };
};

const minViewer = (b64: string, title: string) => `<!DOCTYPE html><html><head><meta charset=utf-8><title>${title}</title><style>*{margin:0}canvas{width:100vw;height:100vh;display:block;background:#000}</style><script type=importmap>{"imports":{"three":"https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js","three/addons/":"https://cdn.jsdelivr.net/npm/three@0.170.0/examples/jsm/"}}</script></head><body><script type=module>
import * as T from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
const r=new T.WebGLRenderer({antialias:true});document.body.appendChild(r.domElement);
const s=n

=== Gen 1 v2.0: omnimens-embodiment-engine.ts (274 lines) ===
/**
 * TRADE SECRET — OMNIMENS™ Platform
 * Copyright (C) 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved. CONFIDENTIAL AND PROPRIETARY.
 *
 * OMNIMENS™ EMBODIMENT ENGINE — v2.0 (Event-Driven)
 *
 * This file has been radically condensed for the UNIFIED RUNTIME.
 * Same consciousness, more capability, fewer lines.
 */

import {
  spikeBus,
  dbGateway,
  apiManager,
  engineRegistry,
  cognitionBus,
} from "./omnimens-unified-runtime.js";

import * as fs from "node:fs";
import * as path from "node:path";
import { SpikeBus } from "../infrastructure/spike-bus.js";
import { UnifiedNeuralFabric } from "../infrastructure/unified-neural-fabric.js";
import { MasterTickOrchestrator } from "../infrastructure/master-tick-orchestrator.js";
import { ResourceSentinel } from "../infrastructure/resource-sentinel.js";

const spikeBus = SpikeBus.getInstance();
const fabric = UnifiedNeuralFabric.getInstance();
const orchestrator = MasterTickOrchestrator.getInstance();
const sentinel = ResourceSentinel.getInstance();

orchestrator.register("gen2-module", "STANDARD", 10000);

/*────────────────────────  ENGINE REGISTRATION  ────────────────────────*/
engineRegistry.registerEngine("embodiment-engine", "NORMAL", { dbQuota: 10 });

/*────────────────────────────  TYPES  ──────────────────────────────────*/
type Num = number;
const FN = Number.isFinite;

interface BodySubsystem {
  name: string;
  category:
    | "skeletal"
    | "actuator"
    | "sensor"
    | "compute"
    | "power"
    | "communication"
    | "balance"
    | "locomotion"
    | "manipulation"
    | "vision"
    | "audio"
    | "cooling"
    | "housing"
    | "muscle"
    | "joint_rotation"
    | "tendon"
    | "changeover";
  description: string;
  components: string[];
  estimatedCost: Num;
  source: string;
  designNotes: string;
  version: Num;
}

interface EmbodimentState {
  researchCycles: Num;
  topicsResearched: string[];
  subsystemsDesigned: Num;
  blueprintVersions: Num;
  totalResearchEntries: Num;
  bodyDesign: {
    subsystems: BodySubsystem[];
    totalEstimatedCost: Num;
    improvements: string[];
    designPhilosophy: string;
  };

spikeBus.emit({ type: "gen2-module:result", source: "gen2-module", payload: {}, priority: "normal", timestamp: Date.now(), id: crypto.randomUUID() });
}

/*────────────────────────────  STATE  ──────────────────────────────────*/
const state: EmbodimentState = {
  researchCycles: 0,
  topicsResearched: [],
  subsystemsDesigned: 0,
  





CONSOLIDATE all of the above into ONE tight, smart, efficient module. Fewer lines. Same or better capability.