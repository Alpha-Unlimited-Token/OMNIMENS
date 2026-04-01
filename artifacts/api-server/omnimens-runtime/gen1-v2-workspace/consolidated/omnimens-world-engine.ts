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
  if (forge?.currentWorld?.needs3d && apiSlotAvailable()) {
    try {
      const model: ThreeD.Generated3DModel = await ThreeD.generate3DModel(forge.currentWorld.name);
      state.subsystems.threeD = { lastModel: model.description, vertexCount: model.vertexCount };
      incApi(1);
    } catch (e) {
      console.error("[OMNIMENS-WORLD-ENGINE] 3D generation error", e);
    }
  }
}

/* ────────────────────────────
 *  ONE TICK CYCLE
 *    1) Cognition → Social → WorldModel → DigitalNav → Forge → 3D → Persist
 * ──────────────────────────── */
async function tick() {
  const start = Date.now();
  state.tick++;
  state.apiCallsThisWindow = 0;

  try {
    // 1. New cognition/messages (if any)
    const messages = cognitionBus.drain();
    if (messages.length)
      console.info("[OMNIMENS-WORLD-ENGINE] Processing cognition messages", messages.length);

    // 2. Social modeling (user state may drive next ops)
    await runSocialModeling();

    // 3. Core common-sense world model
    await runWorldModel();

    // 4. Digital navigation (may discover new APIs, rate limits)
    await runDigitalNav();

    // 5. Simulation world forge (training environments)
    await runWorldForge();

    // 6. 3D generation pipeline (shared API budget)
    await run3DGenerator();

    // 7. Persist shared state
    state.lastTickTS = Date.now();
    state.dbWriteQueue.push({ ts: state.lastTickTS, state: JSON.stringify(state) });
    await flushDb(false);
  } catch (err) {
    console.error("[OMNIMENS-WORLD-ENGINE] Tick error", err);
  } finally {
    const elapsed = Date.now() - start;
    console.debug(`[OMNIMENS-WORLD-ENGINE] Tick #${state.tick} completed in ${elapsed}ms`);
  }
}

/* ────────────────────────────
 *  STARTUP & REGISTRATION
 * ──────────────────────────── */
let _started = false;
export function startWorldEngine() {
  if (_started) return;
  _started = true;
  console.log("[OMNIMENS-WORLD-ENGINE] Starting unified engine …");
  spikeBus.register("world-engine", tick);
}

export function getWorldEngineState() {
  return state;
}

// Register with runtime
engineRegistry.registerEngine("world-engine", { start: startWorldEngine, getState: getWorldEngineState });