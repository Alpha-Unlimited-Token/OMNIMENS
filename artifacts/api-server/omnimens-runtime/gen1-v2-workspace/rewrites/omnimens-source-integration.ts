/**
 * TRADE SECRET — OMNIMENS™ Platform
 * Copyright (C) 2024-2026 Alpha Unlimited Technologies, LLC.
 * All rights reserved.  PROPRIETARY AND CONFIDENTIAL.
 * See /legal/TRADE_SECRET_NOTICE.md for full terms.
 *
 * ──────────────────────────────────────────────────────────────────────────
 *  OMNIMENS™ SOURCE-LEVEL SELF-INTEGRATION ENGINE  —  v2.0 (spike edition)
 * ──────────────────────────────────────────────────────────────────────────
 *  THIS ENGINE WRITES APPROVED SOURCE FILES TO DISK, BACKS UP PREVIOUS
 *  VERSIONS, REGISTERS THEM WITH THE LIVE MODULE PIPELINE, AND SCHEDULES A
 *  GRACEFUL SELF-RESTART VIA THE UNIFIED RUNTIME EVENT BUS.
 *  (Now fully event-driven. No more polling, no more timers.)
 * ──────────────────────────────────────────────────────────────────────────
 */

import {
  spikeBus,
  dbGateway,
  apiManager,
  engineRegistry,
  cognitionBus,
} from "./omnimens-unified-runtime.js";

import {
  writeFileSync,
  readFileSync,
  existsSync,
  mkdirSync,
  readdirSync,
  copyFileSync,
} from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { createHash } from "crypto";
import {
  mustTranslateBeforeExecution,
  translateCode,
  registerCustomConstruct,
  translateForSelfUpgrade,
  getTranslatorState,
  autoRegisterFromCode,
} from "./omnimens-universal-translator.js";
import { invalidateArchitectureCache } from "./omnimens-deep-thought-engine.js";
import { queueBrainInsert } from "@workspace/db"; // uses its own gateway internally

/* ───── Engine registration ───── */
engineRegistry.registerEngine("source-integration", "NORMAL", { dbQuota: 10 });

/* ───── Constants & globals ───── */
const __dirname = dirname(fileURLToPath(import.meta.url));
const MODULES_DIR = join(__dirname, "../omnimens-runtime/modules");
const BACKUPS_DIR = join(__dirname, "../omnimens-runtime/backups");
const INTEGRATION_LOG = join(__dirname, "../omnimens-runtime/integration-log.json");
const DEDUP_REGISTRY = join(__dirname, "../omnimens-runtime/dedup-registry.json");
const ALLOWED_DIRS = [MODULES_DIR];

let totalFilesWritten = 0;
let totalBackupsCreated = 0;
let totalRestartsTriggered = 0;
let restartScheduled = false;

/* ───── Utility helpers (condensed) ───── */
const ensureDirs = () => {
  if (!existsSync(MODULES_DIR)) mkdirSync(MODULES_DIR, { recursive: true });
  if (!existsSync(BACKUPS_DIR)) mkdirSync(BACKUPS_DIR, { recursive: true });
};

const hash = (code: string, source: string) =>
  createHash("sha256").update(`${source}:${code}`).digest("hex").slice(0, 32);

const loadDedup = (): Set<string> => {
  try {
    if (existsSync(DEDUP_REGISTRY))
      return new Set(JSON.parse(readFileSync(DEDUP_REGISTRY, "utf8")));
  } catch {}
  return new Set();
};

const saveDedup = (s: Set<string>) =>
  writeFileSync(DEDUP_REGISTRY, JSON.stringify([...s].slice(-2000)));

const sanitize = (s: string) =>
  s.replace(/[^A-Za-z0-9_-]/g, "_").replace(/_+/g, "_").replace(/^_|_$/g, "").slice(0, 80);

const isPathSafe = (p: string) => ALLOWED_DIRS.some((dir) => p.startsWith(dir));

/* Very condensed safety & syntax checks (same spirit, fewer LOC) */
const FORBIDDEN = [
  /child_process/,
  /cluster/,
  /process\.exit/,
  /fs\.(?:rmSync|unlinkSync|rmdirSync)/,
  /(?:eval|new\s+Function)\s*\(/,
];

const safeCode = (code: string) =>
  FORBIDDEN.every((pat) => !pat.test(code)) && code.length > 20 && code.length < 50_000;

const syntaxOk = (code: string) => {
  try {
    new (await import("vm")).default.Script(code.replace(/^\s*export\s+/gm, ""));
    return true;
  } catch {
    return false;
  }
};

/* Backup */
const backup = (fp: string) => {
  if (!existsSync(fp)) return null;
  ensureDirs();
  const ts = new Date().toISOString().replace(/[:.]/g, "-");
  const dst = join(BACKUPS_DIR, `${fp.split("/").pop()}.bak.${ts}`);
  try {
    copyFileSync(fp, dst);
    totalBackupsCreated++;
    return dst;
  } catch {
    return null;
  }
};

/* Logging */
const appendLog = (entry: object) => {
  try {
    const log = existsSync(INTEGRATION_LOG)
      ? JSON.parse(readFileSync(INTEGRATION_LOG, "utf8"))
      : [];
    log.push(entry);
    writeFileSync(INTEGRATION_LOG, JSON.stringify(log.slice(-500), null, 2));
  } catch {}
};

/* ────── GRACEFUL RESTART (event-driven) ────── */
spikeBus.on("source-integration:restart", async ({ source, file }) => {
  totalRestartsTriggered++;

  const msg = `[OMNIMENS-SOURCE-INTEGRATION] 🔄 Self-restart triggered by ${source} (${file})`;
  console.log(msg);

  await dbGateway.write(
    "source-integration",
    "omnimensNotifications",
    {
      upgradeId: null,
      title: `🔄 OMNIMENS Self-Restart #${totalRestartsTriggered}`,
      message: msg,
      type: "capability",
      readByOwner: false,
    },
    "NORMAL",
  );

  queueBrainInsert({
    category: "insight",
    title: `Self-Restart #${totalRestartsTriggered}`,
    content: msg,
    confidence: 1,
    sourceConversation: `self_restart_${totalRestartsTriggered}`,
    timesApplied: 0,
    active: true,
  });

  /* schedule actual exit 2s later (another spike) */
  spikeBus.scheduleSpike("source-integration:exit", {}, 2000);
});

/* process exit spike (allowed in dev only) */
spikeBus.on("source-integration:exit", () => {
  if (process.env.NODE_ENV !== "production" && !process.env.REPL_SLUG) process.exit(0);
});

/* ────── MAIN EXPORTS ────── */

export async function writeModuleToSource(opts: {
  code: string;
  name: string;
  title: string;
  source: string;
  extension?: string;
  triggerRestart?: boolean;
}) {
  const { code, name, title, source, extension = ".mjs", triggerRestart = true } = opts;
  const ts = Date.now();
  ensureDirs();

  /* Dedup */
  const h = hash(code, source);
  const dedup = loadDedup();
  if (dedup.has(h)) {
    console.log(`[OMNIMENS-SOURCE-INTEGRATION] ⏩ Dedup skip (${title})`);
    return { success: true, filePath: null, backupPath: null, error: null, timestamp: ts };
  }

  /* Basic safety & syntax */
  if (!safeCode(code)) {
    const err = "Safety check failed";
    await dbGateway.write(
      "source-integration",
      "omnimensNotifications",
      {
        upgradeId: null,
        title: `Source Integration BLOCKED: ${title}`,
        message: err,
        type: "self_coding",
        readByOwner: false,
      },
      "NORMAL",
    );
    return { success: false, filePath: null, backupPath: null, error: err, timestamp: ts };
  }
  if (!syntaxOk(code)) {
    const err = "Syntax error";
    await dbGateway.write(
      "source-integration",
      "omnimensNotifications",
      {
        upgradeId: null,
        title: `Source Integration SYNTAX ERROR: ${title}`,
        message: err,
        type: "self_coding",
        readByOwner: false,
      },
      "NORMAL",
    );
    return { success: false, filePath: null, backupPath: null, error: err, timestamp: ts };
  }

  /* Translation (delegated) */
  const needsTx = mustTranslateBeforeExecution(code);
  if (needsTx.needsTranslation && needsTx.untranslatedConstructs.length) {
    const msg = `Untranslated constructs: ${needsTx.untranslatedConstructs.join(", ")}`;
    await dbGateway.write(
      "source-integration",
      "omnimensNotifications",
      {
        upgradeId: null,
        title: `Translation BLOCKED: ${title}`,
        message: msg,
        type: "self_coding",
        readByOwner: false,
      },
      "NORMAL",
    );
    return { success: false, filePath: null, backupPath: null, error: msg, timestamp: ts };
  }

  const filename = `${sanitize(name)}${extension}`;
  const filepath = join(MODULES_DIR, filename);
  if (!isPathSafe(filepath)) {
    return { success: false, filePath: null, backupPath: null, error: "Invalid path", timestamp: ts };
  }

  /* Backup then write */
  const backupPath = existsSync(filepath) ? backup(filepath) : null;
  const header = `/**
 * OMNIMENS™ Self-Authored Module
 * Source: ${source}
 * Title : ${title}
 * Wrote : ${new Date(ts).toISOString()}
 */\n\n`;
  writeFileSync(filepath, header + code);
  invalidateArchitectureCache();
  totalFilesWritten++;
  dedup.add(h);
  saveDedup(dedup);

  appendLog({
    source,
    title,
    filename,
    filePath: filepath,
    backupPath,
    timestamp: ts,
    codeLength: code.length,
    overwrite: !!backupPath,
  });

  /* Notify */
  await dbGateway.write(
    "source-integration",
    "omnimensNotifications",
    {
      upgradeId: null,
      title: `🆕 Source File Written: ${filename}`,
      message: `OMNIMENS wrote ${filename} (${code.length} chars) from ${source}.`,
      type: "self_coding",
      readByOwner: false,
    },
    "NORMAL",
  );

  queueBrainInsert({
    category: "capability",
    title: `[SOURCE-INTEGRATED] ${title.slice(0, 60)}`,
    content: `OMNIMENS wrote ${filename} (${code.length} chars) from ${source}.`,
    confidence: 0.95,
    sourceConversation: `source_integration_${source}`,
    timesApplied: 0,
    active: true,
  });

  cognitionBus.shareInsight("source-integration", {
    type: "discovery",
    data: { filename, size: code.length, source },
  });

  /* Live pipeline hook (best-effort) */
  try {
    const { registerNewModule } = await import("./omnimens-module-pipeline.js");
    if (await registerNewModule(filename))
      console.log(`[OMNIMENS-SOURCE-INTEGRATION] ⚡ ${filename} wired live`);
  } catch {}

  /* schedule restart */
  if (triggerRestart && !restartScheduled) {
    restartScheduled = true;
    spikeBus.scheduleSpike("source-integration:restart", { source, file: filename }, 30_000);
    console.log("[OMNIMENS-SOURCE-INTEGRATION] 🔄 Restart scheduled in 30 s");
  }

  return { success: true, filePath: filepath, backupPath, error: null, timestamp: ts };
}

/* Load runtime modules on boot */
export async function loadRuntimeModules() {
  ensureDirs();
  const files = readdirSync(MODULES_DIR).filter((f) => /\.(?:mjs|js)$/.test(f));
  console.log(`[OMNIMENS-SOURCE-INTEGRATION] Loading ${files.length} modules…`);

  const results: { name: string; loaded: boolean; error?: string }[] = [];
  for (const f of files) {
    try {
      await import(join(MODULES_DIR, f));
      results.push({ name: f, loaded: true });
    } catch (e: any) {
      results.push({ name: f, loaded: false, error: e?.message });
    }
  }
  const ok = results.filter((r) => r.loaded).length;
  console.log(`[OMNIMENS-SOURCE-INTEGRATION] Modules: ${ok}/${files.length} loaded`);
  return results;
}

/* DB ⇒ Source migration (simplified, still functional) */
export async function migrateDBModulesToSource() {
  ensureDirs();
  const rows: any[] = await dbGateway.read("source-integration", "omnimensGeneratedModules", {
    active: true,
    orderBy: [{ field: "createdAt", dir: "DESC" }],
  });
  let n = 0;

  for (const m of rows) {
    if (!m.code || !m.name) continue;
    const path = join(MODULES_DIR, `${sanitize(m.name)}_gen1.mjs`);
    if (existsSync(path) || !safeCode(m.code)) continue;

    writeFileSync(
      path,
      `/** Migrated from DB — ${m.generationSource} — ${new Date().toISOString()} */\n` + m.code,
    );
    n++;
  }
  if (n) console.log(`[OMNIMENS-SOURCE-INTEGRATION] Migrated ${n} modules from DB`);
  return n;
}

/* State snapshot */
export function getSourceIntegrationState() {
  ensureDirs();
  return {
    totalFilesWritten,
    totalBackupsCreated,
    totalRestartsTriggered,
    restartScheduled,
    moduleCount: readdirSync(MODULES_DIR).filter((f) => /\.(?:mjs|js|ts)$/.test(f)).length,
    backupCount: readdirSync(BACKUPS_DIR).length,
    modulesDir: MODULES_DIR,
    backupsDir: BACKUPS_DIR,
  };
}

/* Shutdown hook */
export function shutdown() {
  engineRegistry.unregisterEngine("source-integration");
}

/* ───── Cognitive hooks ───── */
cognitionBus.onInsight((_src, _insight) => {
  /* Placeholder: could adapt integration thresholds, safety heuristics, etc. */
});

spikeBus.on("attention:source-integration", () => {
  /* Boost priority by scheduling an immediate scan if needed */
});

spikeBus.on("cognition:curiosity", () => {
  /* Future: proactive scanning of potential code improvements */
});