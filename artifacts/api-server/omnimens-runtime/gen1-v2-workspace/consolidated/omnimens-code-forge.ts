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

/*───────────────────────────────
 *  COOPERATIVE SCHEDULER
 *───────────────────────────────*/
let schedulerStarted = false;
export function startCodeForge(intervalMs = 30_000): void {
  if (schedulerStarted) return;
  schedulerStarted = true;
  spikeBus.registerTick("omnimens-code-forge", async () => {
    try {
      await tickCycle();
    } catch (err: any) {
      console.error("[OMNIMENS-CODE-FORGE] ERROR:", err?.stack || err);
    }
  }, intervalMs);
  engineRegistry.registerEngine("code-forge", { version: "2.0" });
  console.log("[OMNIMENS-CODE-FORGE] registered with SpikeBus");
}

/* auto-start unless tests indicate otherwise */
if (process.env.OMNIMENS_AUTO_BOOT !== "false") startCodeForge();