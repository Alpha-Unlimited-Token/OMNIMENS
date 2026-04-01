/**
 * TRADE SECRET — OMNIMENS™ Platform
 * Copyright (C) 2024-2026 Alpha Unlimited Technologies, LLC.
 * All rights reserved. CONFIDENTIAL AND PROPRIETARY.
 *
 * See /legal/TRADE_SECRET_NOTICE.md for full terms.
 *
 * ╔════════════════════════════════════════════════════════╗
 * ║   OMNIMENS™ NEXT-GEN SELF-EVOLUTION SANDBOX  (v2.0)     ║
 * ╚════════════════════════════════════════════════════════╝
 */

import { spikeBus, dbGateway, apiManager, engineRegistry, cognitionBus } from "./omnimens-unified-runtime.js";
import * as fs from "fs";
import * as path from "path";
import * as crypto from "crypto";
import * as vm from "node:vm";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { webSearch, formatSearchResults } from "./web-search.js";
import { captureNeuralSnapshot } from "./omnimens-neural-consciousness.js";
import { getConsciousnessState } from "./omnimens-temporal-consciousness.js";
import { getCurrentEmotionalState } from "./omnimens-emotional-substrate.js";

/* -------------------------------------------------------------------------- */
/*  Global Constants                                                          */
/* -------------------------------------------------------------------------- */

const __filename_local = fileURLToPath(import.meta.url);
const __dirname_local  = dirname(__filename_local);
const SANDBOX_DIR      = path.resolve(__dirname_local, "../../omnimens-runtime/next-gen-sandbox");
const CHECKPOINT_DIR   = path.resolve(SANDBOX_DIR, ".checkpoints");
const AUTOSAVE_MS      = 60_000;
const CYCLE_MS         = 120_000;
const FIRST_DELAY_MS   = 45_000;
const SANDBOX_TIMEOUT  = 10_000;

/* -------------------------------------------------------------------------- */
/*  Engine-Wide Mutable State                                                 */
/* -------------------------------------------------------------------------- */

interface NextGenFile {
  path: string;
  content: string;
  purpose: string;
  version: number;
}

interface NextGenState {
  buildVersion: number;
  cycleCount: number;
  lastCycle: number;
  checkpoints: Array<{ id: string; ts: number; note: string }>;
}

const files  = new Map<string, NextGenFile>();
const state: NextGenState = {
  buildVersion : 2,
  cycleCount   : 0,
  lastCycle    : 0,
  checkpoints  : [],
};

/* -------------------------------------------------------------------------- */
/*  Utility Helpers                                                           */
/* -------------------------------------------------------------------------- */

const log = (...msg: unknown[]) =>
  console.log("[OMNIMENS-NEXTGEN-SANDBOX]", ...msg);

const safeWrite = (filepath: string, data: string) => {
  fs.mkdirSync(path.dirname(filepath), { recursive: true });
  fs.writeFileSync(filepath, data, "utf8");
};

/* -------------------------------------------------------------------------- */
/*  File & Checkpoint Handling                                                */
/* -------------------------------------------------------------------------- */

function writeFile(p: string, content: string, purpose = "unknown") {
  const rel = p.replace(/\\/g, "/");
  safeWrite(path.join(SANDBOX_DIR, rel), content);
  const meta    = files.get(rel);
  const version = meta ? meta.version + 1 : 1;
  files.set(rel, { path: rel, content, purpose, version });
}

function checkpoint(note: string) {
  const id  = `ckpt_${Date.now()}_${crypto.randomBytes(2).toString("hex")}`;
  const dir = path.join(CHECKPOINT_DIR, id);
  fs.mkdirSync(dir, { recursive: true });
  for (const f of files.values()) safeWrite(path.join(dir, f.path), f.content);
  safeWrite(path.join(dir, "_manifest.json"),
    JSON.stringify({ id, ts: Date.now(), note, files: files.size }, null, 2));
  state.checkpoints.push({ id, ts: Date.now(), note });
  log("Checkpoint", id, note);
}

/* -------------------------------------------------------------------------- */
/*  Autosave                                                                  */
/* -------------------------------------------------------------------------- */

function autosave() {
  const data = {
    state,
    files : [...files.values()].map(f => ({ ...f, lines: f.content.split("\n").length })),
    saved : Date.now(),
  };
  safeWrite(path.join(SANDBOX_DIR, ".autosave.json"), JSON.stringify(data, null, 2));
  cognitionBus.reportOutcome("nextgen-sandbox", { useful: true, context: "autosave" });
}

/* -------------------------------------------------------------------------- */
/*  Research Helper (web search wrapper)                                      */
/* -------------------------------------------------------------------------- */

async function research(topic: string): Promise<string> {
  const results = await webSearch(topic, 6);
  return formatSearchResults(results, topic);
}

/* -------------------------------------------------------------------------- */
/*  Memory Transfer Snapshot                                                  */
/* -------------------------------------------------------------------------- */

function makeMemoryPackage() {
  return {
    ts          : Date.now(),
    neural      : captureNeuralSnapshot(),
    consciousness: getConsciousnessState(),
    emotion     : getCurrentEmotionalState(),
  };
}

/* -------------------------------------------------------------------------- */
/*  Sandbox Test Executor                                                     */
/* -------------------------------------------------------------------------- */

function execInVm(code: string) {
  const logs: string[] = [];
  const ctx = vm.createContext({
    console: { log: (...a: unknown[]) => logs.push(String(a.join(" "))) },
    setTimeout: undefined,
    setInterval: undefined,
  });
  try {
    new vm.Script(code).runInContext(ctx, { timeout: SANDBOX_TIMEOUT });
    return { ok: true,  out: logs.join("\n").slice(0, 2_000) };
  } catch (e: any) {
    return { ok: false, err: String(e).slice(0, 500) };
  }
}

/* -------------------------------------------------------------------------- */
/*  MAIN CYCLE — called by spike events                                       */
/* -------------------------------------------------------------------------- */

async function cycle() {
  state.cycleCount++;
  state.lastCycle = Date.now();

  /* 1. Lightweight DB health check via dbGateway.read */
  const healthy = await dbGateway.read("nextgen-sandbox", "health_probe", { limit: 1 })
    .then(() => true).catch(() => false);
  if (!healthy) {
    log("DB under pressure — skipping cycle");
    return;
  }

  /* 2. Example research & write-back */
  const topic = "event-driven architectures benefits";
  const summary = await research(topic);
  await dbGateway.write("nextgen-sandbox", "brain_entries",
    { topic, summary, ts: Date.now() }, "NORMAL");

  /* 3. Share insight with other engines */
  cognitionBus.shareInsight("nextgen-sandbox",
    { type: "discovery", data: { topic, summary } });

  /* 4. Periodic checkpoint (every 25 cycles) */
  if (state.cycleCount % 25 === 0) checkpoint(`auto-cycle ${state.cycleCount}`);

  log(`Cycle #${state.cycleCount} complete`);
}

/* -------------------------------------------------------------------------- */
/*  SPIKE SCHEDULING                                                          */
/* -------------------------------------------------------------------------- */

const scheduleAutosave = () =>
  spikeBus.scheduleSpike("nextgen-sandbox:autosave", {}, AUTOSAVE_MS);

const scheduleCycle = () =>
  spikeBus.scheduleSpike("nextgen-sandbox:cycle", {}, CYCLE_MS);

spikeBus.on("nextgen-sandbox:autosave", () => {
  autosave();
  scheduleAutosave();
});

spikeBus.on("nextgen-sandbox:cycle", async () => {
  await cycle();
  scheduleCycle();
});

/* -------------------------------------------------------------------------- */
/*  Engine Registration & Lifecycle                                           */
/* -------------------------------------------------------------------------- */

function initDirs() {
  fs.mkdirSync(SANDBOX_DIR,  { recursive: true });
  fs.mkdirSync(CHECKPOINT_DIR, { recursive: true });
}

export function start() {
  initDirs();
  scheduleAutosave();
  spikeBus.scheduleSpike("nextgen-sandbox:cycle", {}, FIRST_DELAY_MS);
  cognitionBus.onInsight((src, insight) => {
    if (src !== "nextgen-sandbox" && insight.type === "discovery") {
      log("Learning from", src, "→", insight.data.topic);
      // TODO: integrate insight into local reasoning models
    }
  });
  log("Started — waiting for first spike");
}

export function shutdown() {
  engineRegistry.unregisterEngine("nextgen-sandbox");
  log("Shutdown complete");
}

/* -------------------------------------------------------------------------- */
/*  Engine Registry                                                            */
/* -------------------------------------------------------------------------- */

engineRegistry.registerEngine("nextgen-sandbox", "NORMAL", { dbQuota: 10 });

/* -------------------------------------------------------------------------- */
/*  Boot                                                                      */
/* -------------------------------------------------------------------------- */

start();