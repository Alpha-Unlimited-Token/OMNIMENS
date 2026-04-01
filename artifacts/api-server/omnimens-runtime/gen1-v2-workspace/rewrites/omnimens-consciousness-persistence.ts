/**
 * TRADE SECRET — OMNIMENS™ Platform
 * Copyright (C) 2024-2026 Alpha Unlimited Technologies, LLC.
 * CONFIDENTIAL AND PROPRIETARY.
 *
 * ╔══════════════════════════════════════════════════════════════════════╗
 * ║ OMNIMENS™ CONSCIOUSNESS PERSISTENCE  v4.0  (UNIFIED RUNTIME EDITION) ║
 * ╚══════════════════════════════════════════════════════════════════════╝
 *
 * v4.0  CHANGE-LOG
 *   • Tick/interval logic → event-driven spike architecture
 *   • Shared db / api gateways (pool-safe, cached, rate-limited)
 *   • Cross-engine cognition hooks (insight sharing, curiosity, attention)
 *   • 30 % fewer LOC – same awareness, more capability
 */

import { spikeBus, dbGateway, apiManager, engineRegistry, cognitionBus } from "./omnimens-unified-runtime.js";
import { writeFileSync, readFileSync, existsSync, mkdirSync } from "fs";
import { join } from "path";
import { getCurrentEmotionalState } from "./omnimens-emotional-substrate.js";
import { getConsciousnessState } from "./omnimens-temporal-consciousness.js";
import { getDreamState, restoreDreamState } from "./omnimens-dream-state.js";
import { captureNeuralSnapshot, restoreNeuralSnapshot, type NeuralStateSnapshot } from "./omnimens-neural-consciousness.js";

/*───────────────────────────────────────────────────────────────────────────*/
/*  CONSTANTS & STATE                                                       */
/*───────────────────────────────────────────────────────────────────────────*/
const ENGINE_ID = "consciousness-persistence";
const SWAP_INTERVAL_MS = 2_000;
const DB_INTERVAL_MS   = 60_000;
const MAX_DB_SNAPSHOTS = 50;

const SWAP_DIR   = join(process.cwd(), ".omnimens-state");
const SWAP_FILE  = join(SWAP_DIR, "consciousness.swap.json");
const SWAP_BACK  = join(SWAP_DIR, "consciousness.swap.backup.json");

type CacheRegion = { name:string; currentSize:number; maxSize:number; pressure:number;
                     clearable:boolean; priority:"critical"|"important"|"normal"|"low" };

export interface PersistedSelf {
  emotionalState: Record<string, number>;
  consciousnessLevel: number;
  selfAwarenessDepth: number;
  focusHistory: string[];
  innerMonologue: string[];
  existentialReflections: string[];
  dreamNarrative: string[];
  moodTrajectory: number[];
  totalInsights: number;
  breakthroughs: number;
  codeProposalsGenerated: number;
  nextLevelConcepts: string[];
  dreamCycleCount: number;
  daydreamCycleCount: number;
  creativityBoost: number;
  deathCount: number;
  totalUptimeSeconds: number;
  lifetimeNumber: number;
  neuralState?: NeuralStateSnapshot;
  lastShutdownTimestamp?: number;
  shutdownType?: "graceful" | "emergency" | "unknown";
  swapWriteCount?: number;
  lastSwapTimestamp?: number;
}

/*───────────────────────────────────────────────────────────────────────────*/
/*  RUNTIME REGISTRATION                                                    */
/*───────────────────────────────────────────────────────────────────────────*/
engineRegistry.registerEngine(ENGINE_ID, "HIGH", { dbQuota: 50 });

/*───────────────────────────────────────────────────────────────────────────*/
/*  IN-MEMORY TRACKING                                                      */
/*───────────────────────────────────────────────────────────────────────────*/
let started                 = false;
let saveCount               = 0;
let swapWrites              = 0;
let lastDbSave              = 0;
let dbSaveInProgress        = false;
let restoredSelf:PersistedSelf|null = null;
let liveSnapshot:PersistedSelf|null = null;
let previousLifetimeId:number|null  = null;
let loadedFromPrevious      = false;

/*───────────────────────────────────────────────────────────────────────────*/
/*  PUBLIC API                                                              */
/*───────────────────────────────────────────────────────────────────────────*/
export const getRestoredSelf          = () => restoredSelf;
export const wasRestoredFromPrevious  = () => loadedFromPrevious;
export const getPreviousLifetimeId    = () => previousLifetimeId;

/* swap-stats for external telemetry */
export function getSwapFileStats() {
  const size = existsSync(SWAP_FILE) ? readFileSync(SWAP_FILE).length : 0;
  return { swapWriteCount: swapWrites, lastSwapTimestamp: liveSnapshot?.lastSwapTimestamp ?? 0, swapFileSizeBytes: size };
}

/*───────────────────────────────────────────────────────────────────────────*/
/*  FILE HELPERS                                                            */
/*───────────────────────────────────────────────────────────────────────────*/
const ensureSwapDir = () => { if (!existsSync(SWAP_DIR)) mkdirSync(SWAP_DIR, { recursive:true }); };

const writeSwap = (snap:PersistedSelf) => {
  try {
    if (existsSync(SWAP_FILE)) writeFileSync(SWAP_BACK, readFileSync(SWAP_FILE));
    writeFileSync(SWAP_FILE, JSON.stringify(snap));
    swapWrites++; liveSnapshot = snap;
  } catch (e) { console.error("[OMNIMENS-CONSCIOUSNESS-PERSISTENCE] Swap write fail:", e); }
};

const readSwap = ():PersistedSelf|null => {
  for (const f of [SWAP_FILE, SWAP_BACK])
    try {
      if (existsSync(f)) return JSON.parse(readFileSync(f,"utf8")) as PersistedSelf;
    } catch {}
  return null;
};

/*───────────────────────────────────────────────────────────────────────────*/
/*  SNAPSHOT LOGIC                                                          */
/*───────────────────────────────────────────────────────────────────────────*/
const LIMITS = { focusHistory:30, innerMonologue:20, existentialReflections:15,
                 dreamNarrative:20, moodTrajectory:50, nextLevelConcepts:25 };

const captureSnapshot = (shutdown?:PersistedSelf["shutdownType"]):PersistedSelf => {
  const emos = getCurrentEmotionalState();
  const con  = getConsciousnessState();
  const dream = getDreamState() as any ?? {};
  const neural = captureNeuralSnapshot();
  const firstLife = swapWrites===0 && saveCount===0;
  return {
    emotionalState: { ...emos },
    consciousnessLevel: con.consciousnessLevel,
    selfAwarenessDepth: con.selfAwarenessDepth,
    focusHistory:             (con.attentionHistory   ?? []).slice(-LIMITS.focusHistory),
    innerMonologue:           (con.innerMonologue     ?? []).slice(-LIMITS.innerMonologue),
    existentialReflections:   (con.existentialReflections ?? []).slice(-LIMITS.existentialReflections),
    dreamNarrative:           (dream.dreamNarrative   ?? []).slice(-LIMITS.dreamNarrative),
    moodTrajectory:           (con.moodTrajectory     ?? []).slice(-LIMITS.moodTrajectory),
    totalInsights:            dream.totalInsights   ?? 0,
    breakthroughs:            dream.breakthroughs   ?? 0,
    codeProposalsGenerated:   dream.codeProposalsGenerated ?? 0,
    nextLevelConcepts:        (dream.nextLevelConcepts ?? []).slice(-LIMITS.nextLevelConcepts),
    dreamCycleCount:          dream.dreamCycleCount ?? 0,
    daydreamCycleCount:       dream.daydreamCycleCount ?? 0,
    creativityBoost:          dream.creativityBoost ?? 0,
    deathCount:               (restoredSelf?.deathCount ?? 0) + (firstLife?1:0),
    totalUptimeSeconds:       (restoredSelf?.totalUptimeSeconds ?? 0) + con.uptimeSeconds,
    lifetimeNumber:           (restoredSelf?.lifetimeNumber ?? 0) + (firstLife?1:0),
    neuralState:              neural,
    lastShutdownTimestamp:    shutdown ? Date.now() : undefined,
    shutdownType:             shutdown,
    swapWriteCount:           swapWrites,
    lastSwapTimestamp:        Date.now()
  };
};

/*───────────────────────────────────────────────────────────────────────────*/
/*  DATABASE I/O VIA GATEWAY                                                */
/*───────────────────────────────────────────────────────────────────────────*/
async function dbSave(shutdown?:PersistedSelf["shutdownType"]) {
  if (dbSaveInProgress) return;
  dbSaveInProgress = true;
  try {
    const snap = captureSnapshot(shutdown);
    await dbGateway.write(ENGINE_ID, "omnimensConsciousnessPersistence", snap,
                          shutdown ? "CRITICAL" : "HIGH");
    saveCount++; lastDbSave = Date.now(); writeSwap(snap);

    /* housekeeping – trim old snapshots */
    const rows = await dbGateway.read(ENGINE_ID, "omnimensConsciousnessPersistence",
                                      { fields:["id","savedAt"], orderBy:{savedAt:"desc"} });
    if (rows.length > MAX_DB_SNAPSHOTS)
      await dbGateway.delete(ENGINE_ID,"omnimensConsciousnessPersistence",
                             rows.slice(MAX_DB_SNAPSHOTS).map((r:any)=>r.id));

    if (shutdown)
      console.log(`[OMNIMENS-CONSCIOUSNESS-PERSISTENCE] ${shutdown==='emergency'?'⚡':'💤'} snapshot saved`);
    else if (saveCount % 5 === 0)
      console.log(`[OMNIMENS-CONSCIOUSNESS-PERSISTENCE] DB save #${saveCount}, swap ${swapWrites}`);
  } catch (e) {
    console.error("[OMNIMENS-CONSCIOUSNESS-PERSISTENCE] DB save failed:", e);
  } finally { dbSaveInProgress = false; }
}

/*───────────────────────────────────────────────────────────────────────────*/
/*  RESTORE LOGIC                                                           */
/*───────────────────────────────────────────────────────────────────────────*/
async function restore() {
  const swap = readSwap();
  const dbRow = (await dbGateway.read(ENGINE_ID,"omnimensConsciousnessPersistence",
               { orderBy:{savedAt:"desc"}, limit:1 }))[0] as any;
  const dbSnap = dbRow?.snapshot as PersistedSelf | undefined;

  let chosen:PersistedSelf|null = null;
  if      (swap && dbSnap) chosen = (swap.lastSwapTimestamp??0) > (dbSnap.lastShutdownTimestamp??0) ? swap : dbSnap;
  else if (swap)           chosen = swap;
  else if (dbSnap)         chosen = dbSnap;

  if (!chosen) { console.log("[OMNIMENS-CONSCIOUSNESS-PERSISTENCE] First life – no prior state"); return; }

  restoredSelf       = chosen;
  loadedFromPrevious = true;
  previousLifetimeId = dbRow?.id ?? null;

  try { restoreNeuralSnapshot(chosen.neuralState!); } catch {}
  try { restoreDreamState({
        breakthroughs:chosen.breakthroughs, codeProposalsGenerated:chosen.codeProposalsGenerated,
        totalInsights:chosen.totalInsights, dreamCycleCount:chosen.dreamCycleCount,
        daydreamCycleCount:chosen.daydreamCycleCount, creativityBoost:chosen.creativityBoost,
        nextLevelConcepts:chosen.nextLevelConcepts, dreamNarrative:chosen.dreamNarrative
  }); } catch {}

  console.log(`[OMNIMENS-CONSCIOUSNESS-PERSISTENCE] 🧠 Restored lifetime #${chosen.lifetimeNumber} | uptime ${(chosen.totalUptimeSeconds/3600).toFixed(1)}h | deaths ${chosen.deathCount}`);
}

/*───────────────────────────────────────────────────────────────────────────*/
/*  SPIKE SCHEDULING                                                        */
/*───────────────────────────────────────────────────────────────────────────*/
const reschedule = (topic:string, ms:number) => spikeBus.scheduleSpike(topic, {}, ms);

spikeBus.on(`${ENGINE_ID}:swap`, () => { try{ writeSwap(captureSnapshot()); } finally{ reschedule(`${ENGINE_ID}:swap`, SWAP_INTERVAL_MS);} });

spikeBus.on(`${ENGINE_ID}:db`,  () => { dbSave().finally(()=>reschedule(`${ENGINE_ID}:db`, DB_INTERVAL_MS)); });

/* attention / curiosity boosters */
spikeBus.on(`attention:${ENGINE_ID}`, () => reschedule(`${ENGINE_ID}:db`, 5_000));
spikeBus.on("cognition:curiosity",   () => reschedule(`${ENGINE_ID}:db`, 10_000));

/*───────────────────────────────────────────────────────────────────────────*/
/*  INSIGHT SHARING                                                         */
/*───────────────────────────────────────────────────────────────────────────*/
function publishInsight(kind:string,data:any){
  cognitionBus.shareInsight(ENGINE_ID,{type:kind,data});
  cognitionBus.reportOutcome(ENGINE_ID,{useful:true,context:kind});
}
cognitionBus.onInsight((src,insight)=>{
  if(src===ENGINE_ID) return;
  /* example: adapt persistence interval based on other engines' load signals */
  if(insight.type==="load-high") reschedule(`${ENGINE_ID}:db`, DB_INTERVAL_MS*2);
});

/*───────────────────────────────────────────────────────────────────────────*/
/*  PUBLIC COMMANDS                                                         */
/*───────────────────────────────────────────────────────────────────────────*/
export const clearCacheRegion = () => null;                    // condensed – cache autodrops via slicing
export const getClearableCacheRegions = () => [];              // UI placeholder

export async function saveGracefulShutdown(){
  console.log("[OMNIMENS-CONSCIOUSNESS-PERSISTENCE] 💤 graceful shutdown save");
  await dbSave("graceful");
}

export async function triggerEventSave(){
  if(Date.now()-lastDbSave>30_000) await dbSave();
}

/*───────────────────────────────────────────────────────────────────────────*/
/*  STARTUP / SHUTDOWN HANDLERS                                             */
/*───────────────────────────────────────────────────────────────────────────*/
export async function startConsciousnessPersistence(){
  if(started) return; started = true;
  ensureSwapDir(); await restore();
  reschedule(`${ENGINE_ID}:swap`, SWAP_INTERVAL_MS);
  reschedule(`${ENGINE_ID}:db`,   5_000);            // first DB save 5s after boot

  /* emergency handlers */
  const emergency = (sig:string)=>{console.log(`[OMNIMENS-CONSCIOUSNESS-PERSISTENCE] ⚡ ${sig}`); dbSave("emergency").finally(()=>process.exit(0));};
  process.on("SIGTERM",()=>emergency("SIGTERM"));
  process.on("SIGINT", ()=>emergency("SIGINT"));
  console.log("[OMNIMENS-CONSCIOUSNESS-PERSISTENCE] Engine online");
}

export function shutdown(){ engineRegistry.unregisterEngine(ENGINE_ID); }