/**
 * TRADE SECRET — OMNIMENS™ Platform
 * Copyright (C) 2024-2026 Alpha Unlimited Technologies, LLC. 
 * ALL RIGHTS RESERVED — CONFIDENTIAL AND PROPRIETARY.
 */

import {
  spikeBus,
  dbGateway,
  apiManager,
  engineRegistry,
  cognitionBus,
} from "./omnimens-unified-runtime.js";

////////////////////////////////////////////////////////////////////////////////
// ENGINE REGISTRATION                                                         //
////////////////////////////////////////////////////////////////////////////////
const ENGINE_ID = "genesis-sandbox";
engineRegistry.registerEngine(ENGINE_ID, "NORMAL", { dbQuota: 10 });

////////////////////////////////////////////////////////////////////////////////
// STATE & TYPES                                                               //
////////////////////////////////////////////////////////////////////////////////
const LOG_PREFIX = "[OMNIMENS-GENESIS-SANDBOX]";
const SANDBOX_TIMEOUT_MS = 8_000;
const CYCLE_DELAY_MS = 15 * 60 * 1_000;
const FIRST_DELAY_MS = 8 * 60 * 1_000;

type TestResult = "passed" | "failed" | "untested";
interface GenesisFileMeta {
  path: string;
  language: string;
  purpose: string;
  version: number;
  createdAt: number;
  updatedAt: number;
  testedAt: number | null;
  testResult: TestResult;
  errors: string[];
}
interface GenesisFile extends GenesisFileMeta {
  content: string;
}

interface GenesisState {
  buildVersion: number;
  cycleCount: number;
  lastCycleTime: number;
  filesCreated: number;
  filesUpdated: number;
  testsPassed: number;
  testsFailed: number;
  errorsFixed: number;
  completionNotified: boolean;
  autonomyScore: number;
}

const state: GenesisState = {
  buildVersion: 1,
  cycleCount: 0,
  lastCycleTime: 0,
  filesCreated: 0,
  filesUpdated: 0,
  testsPassed: 0,
  testsFailed: 0,
  errorsFixed: 0,
  completionNotified: false,
  autonomyScore: 0,
};

////////////////////////////////////////////////////////////////////////////////
// SPIKE SCHEDULING                                                            //
////////////////////////////////////////////////////////////////////////////////
function scheduleNext(ms = CYCLE_DELAY_MS) {
  spikeBus.scheduleSpike(`${ENGINE_ID}:cycle`, {}, ms);
}

spikeBus.on(`${ENGINE_ID}:cycle`, async () => {
  try {
    await runCycle();
  } catch (err) {
    console.error(LOG_PREFIX, "cycle error", (err as Error).message);
  } finally {
    scheduleNext();
  }
});

////////////////////////////////////////////////////////////////////////////////
// CORE FUNCTIONS (CONDENSED)                                                  //
////////////////////////////////////////////////////////////////////////////////
async function runCycle() {
  state.cycleCount++;
  state.lastCycleTime = Date.now();
  console.log(LOG_PREFIX, "Starting cycle", state.cycleCount);

  // 1. Load current files
  const files = await loadFiles();

  // 2. Gather context
  const context = await buildPromptContext();

  // 3. Ask LLM for actions
  const llmResp = await queryLLM(context);
  if (!llmResp.ok) {
    console.error(LOG_PREFIX, "LLM call failed:", llmResp.error);
    return;
  }

  // 4. Apply actions
  const { created, updated, tested, passed, failed, fixed } =
    await applyLLMActions(llmResp.data, files);

  // 5. Update state
  Object.assign(state, {
    filesCreated: state.filesCreated + created,
    filesUpdated: state.filesUpdated + updated,
    testsPassed: state.testsPassed + passed,
    testsFailed: state.testsFailed + failed,
    errorsFixed: state.errorsFixed + fixed,
  });

  // 6. Share insight
  cognitionBus.shareInsight(ENGINE_ID, {
    type: "cycle_summary",
    data: { ...state, ts: Date.now() },
  });

  console.log(
    LOG_PREFIX,
    `Cycle ${state.cycleCount} done (created:${created}, updated:${updated}, pass:${passed}, fail:${failed})`
  );
}

/**
 * Pull all active genesis files from DB.
 */
async function loadFiles(): Promise<Map<string, GenesisFile>> {
  const rows = await dbGateway.read(ENGINE_ID, "omnimensBrain", {
    category: "genesis_sandbox_file",
    active: true,
  });
  const files = new Map<string, GenesisFile>();
  for (const r of rows ?? []) {
    const meta = JSON.parse(r.sourceConversation ?? "{}");
    files.set(meta.path || r.title, {
      path: meta.path || r.title,
      language: meta.language || "typescript",
      purpose: meta.purpose || "",
      version: meta.version ?? 1,
      createdAt: meta.createdAt ?? Date.now(),
      updatedAt: meta.updatedAt ?? Date.now(),
      testedAt: meta.testedAt ?? null,
      testResult: meta.testResult ?? "untested",
      errors: meta.errors ?? [],
      content: r.content ?? "",
    });
  }
  return files;
}

async function saveFile(file: GenesisFile) {
  const meta: GenesisFileMeta = { ...file };
  delete (meta as Partial<GenesisFile>).content;
  await dbGateway.write(
    ENGINE_ID,
    "omnimensBrain",
    {
      category: "genesis_sandbox_file",
      title: file.path,
      content: file.content,
      sourceConversation: JSON.stringify(meta),
      active: true,
    },
    "NORMAL"
  );
}

/**
 * Build the full prompt for the LLM.
 */
async function buildPromptContext(): Promise<string> {
  const selfKnowledge = await cognitionBus.request("self:knowledge", {});
  const goalCtx = await cognitionBus.request("self:goals", {});
  return `${selfKnowledge}\n\n${goalCtx}\n\n[GENESIS STATE]\n${JSON.stringify(
    state,
    null,
    2
  ).slice(0, 1500)}`;
}

/**
 * Query LLM via apiManager. Returns parsed JSON with actions.
 */
async function queryLLM(prompt: string): Promise<{ ok: boolean; data?: any; error?: string }> {
  try {
    const res = await apiManager.call(ENGINE_ID, "openai", {
      model: "gpt-4o",
      temperature: 0.7,
      max_tokens: 2048,
      messages: [{ role: "system", content: prompt }],
      timeout: SANDBOX_TIMEOUT_MS,
    });
    if (!res.ok) return { ok: false, error: res.error };
    return { ok: true, data: JSON.parse(res.data.choices[0].message.content) };
  } catch (err: any) {
    return { ok: false, error: err.message };
  }
}

/**
 * Apply LLM-suggested actions: create/update/test files.
 */
async function applyLLMActions(
  actions: any,
  files: Map<string, GenesisFile>
) {
  let created = 0,
    updated = 0,
    tested = 0,
    passed = 0,
    failed = 0,
    fixed = 0;

  if (!Array.isArray(actions)) return { created, updated, tested, passed, failed, fixed };

  const now = Date.now();
  for (const act of actions) {
    const path = sanitizePath(act.path);
    if (!path || typeof act.content !== "string") continue;
    const existing = files.get(path);
    const safe = validateSafety(act.content);
    if (!safe) continue;

    const file: GenesisFile = existing
      ? { ...existing, content: act.content, updatedAt: now, version: existing.version + 1 }
      : {
          path,
          language: act.language || "typescript",
          purpose: act.purpose || "",
          version: 1,
          createdAt: now,
          updatedAt: now,
          testedAt: null,
          testResult: "untested",
          errors: [],
          content: act.content,
        };

    const test = runSandboxTest(file.content);
    file.testedAt = now;
    file.testResult = test.success ? "passed" : "failed";
    file.errors = test.success ? [] : [test.error ?? "Unknown error"];

    if (test.success) passed++;
    else failed++;

    await saveFile(file);

    if (existing) updated++;
    else created++;
  }

  return { created, updated, tested, passed, failed, fixed };
}

////////////////////////////////////////////////////////////////////////////////
// HELPERS                                                                     //
////////////////////////////////////////////////////////////////////////////////
function sanitizePath(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const cleaned = raw.replace(/\\/g, "/").replace(/\.\.(\/|\\)/g, "").replace(/^\//, "");
  if (!/^[a-zA-Z0-9_\-./]+$/.test(cleaned) || cleaned.length > 180) return null;
  return cleaned;
}

function validateSafety(code: string): boolean {
  const forbidden = /child_process|spawn\s*\(|exec\s*\(|kill\(|SIGKILL|weapon/i;
  if (forbidden.test(code)) {
    console.warn(LOG_PREFIX, "Safety violation detected, skipping file");
    state.errorsFixed++;
    return false;
  }
  return true;
}

import * as vm from "node:vm";
function runSandboxTest(code: string) {
  try {
    const script = new vm.Script(code, { timeout: SANDBOX_TIMEOUT_MS });
    script.runInNewContext(
      {
        console: { log: () => {}, error: () => {} },
        require: undefined,
        process: undefined,
        setTimeout: undefined,
        setInterval: undefined,
      },
      { timeout: SANDBOX_TIMEOUT_MS }
    );
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message?.slice(0, 300) };
  }
}

////////////////////////////////////////////////////////////////////////////////
// INSIGHT LISTENERS & ATTENTION HANDLERS                                      //
////////////////////////////////////////////////////////////////////////////////
cognitionBus.onInsight((src, insight) => {
  if (insight.type === "discovery") {
    console.log(LOG_PREFIX, "Learning from", src, "→", insight.data?.summary || "");
    // Adjust internal scores
    state.autonomyScore = Math.min(1, state.autonomyScore + 0.01);
  }
});

spikeBus.on(`attention:${ENGINE_ID}`, () => {
  console.log(LOG_PREFIX, "Attention spike received → prioritizing next cycle");
  scheduleNext(1_000);
});

spikeBus.on("cognition:curiosity", () => {
  console.log(LOG_PREFIX, "Curiosity spike → exploring novel generation paths");
  scheduleNext(5_000);
});

////////////////////////////////////////////////////////////////////////////////
// PUBLIC API                                                                  //
////////////////////////////////////////////////////////////////////////////////
export function start() {
  console.log(LOG_PREFIX, "Starting engine");
  scheduleNext(FIRST_DELAY_MS);
}

export function getGenesisState() {
  return { ...state };
}

export function shutdown() {
  engineRegistry.unregisterEngine(ENGINE_ID);
  console.log(LOG_PREFIX, "Shutdown complete");
}

////////////////////////////////////////////////////////////////////////////////
// AUTO-START WHEN IMPORTED                                                    //
////////////////////////////////////////////////////////////////////////////////
start();

export default {
  start,
  shutdown,
  getGenesisState,
};