/**
 * TRADE SECRET — OMNIMENS™ Platform
 * Copyright (C) 2024-2026 Alpha Unlimited Technologies, LLC.
 * CONFIDENTIAL AND PROPRIETARY — All Rights Reserved.
 * See /legal/TRADE_SECRET_NOTICE.md for full terms.
 *
 * OMNIMENS™ GENESIS BRIDGE v2.0 — Bidirectional Symbiotic Communication
 *
 * This engine mediates the living dialogue between the running OMNIMENS and its
 * higher-intelligence “Genesis” self, enabling knowledge transfer, capability
 * requests, design feedback, and safe core-code evolution.
 *
 * v2.0 CHANGES
 * • Unified Runtime: spikeBus, dbGateway, apiManager, engineRegistry, cognitionBus
 * • Event-driven: zero idle cost, back-pressure aware
 * • Condensed logic, removed redundant infra, preserved full functionality
 */

import path from "node:path";
import fs from "node:fs";
import crypto from "node:crypto";
import vm from "node:vm";
import {
  spikeBus,
  dbGateway,
  apiManager,
  engineRegistry,
  cognitionBus,
} from "./omnimens-unified-runtime.js";

/*───────────────────────────────────────────────────────────────────────────────
  ──  ENGINE REGISTRATION & GLOBAL CONSTANTS
───────────────────────────────────────────────────────────────────────────────*/
engineRegistry.registerEngine("genesis-bridge", "NORMAL", { dbQuota: 10 });

const SEC = 1000;
const BRIDGE_CYCLE_MS = 10 * 60 * SEC;
const CORE_EVAL_MS   = 12 * 60 * SEC;
const MESSAGE_CAT    = "genesis_bridge_message";
const CORE_CAT       = "genesis_core_modification";
const LIB_DIR        = path.resolve(path.dirname(new URL(import.meta.url).pathname), ".");
const BACKUP_DIR     = path.resolve(LIB_DIR, "../omnimens-runtime/backups/core");
const HMAC_SECRET    = crypto.randomBytes(32).toString("hex");

type Direction = "omnimens_to_genesis" | "genesis_to_omnimens";
type MsgType =
  | "knowledge_transfer" | "architectural_insight" | "code_proposal"
  | "capability_request" | "experience_report"     | "design_feedback"
  | "breakthrough_notification" | "collaboration_request"
  | "core_modification_proposal" | "evolution_sync";

interface BridgeMsg {
  id: string; direction: Direction; type: MsgType; subject: string;
  content: string; timestamp: number; acknowledged: boolean;
  response: string | null; metadata: Record<string, any>;
}

interface CoreMod extends Record<string, any> {
  id: string; targetFile: string; description: string; modification: string;
  modificationType: "append_function" | "enhance_function" | "add_import" | "add_constant" | "add_interface";
  source: "genesis" | "self" | "neural_consciousness" | "reasoning_engine";
  status: "proposed" | "evaluating" | "approved" | "applied" | "rejected";
  safetyScore: number; functionalityScore: number; noveltyScore: number;
  timestamp: number; appliedAt: number | null; rejectionReason: string | null;
  backupPath: string | null;
}

interface BridgeState {
  messagesExchanged: number; collaborationCycles: number;
  coreModificationsProposed: number; coreModificationsApplied: number;
  coreModificationsRejected: number; lastCycleTime: number; startTime: number;
  symbiosis: { understanding: number; flow: number; depth: number; accel: number };
  recentMessages: BridgeMsg[]; pendingModifications: CoreMod[];
  appliedModifications: Array<{ file: string; description: string; timestamp: number }>;
}

const state: BridgeState = {
  messagesExchanged: 0, collaborationCycles: 0,
  coreModificationsProposed: 0, coreModificationsApplied: 0,
  coreModificationsRejected: 0, lastCycleTime: 0, startTime: Date.now(),
  symbiosis: { understanding: 0.1, flow: 0, depth: 0, accel: 1.0 },
  recentMessages: [], pendingModifications: [], appliedModifications: [],
};

/*───────────────────────────────────────────────────────────────────────────────
  ──  UTILITIES
───────────────────────────────────────────────────────────────────────────────*/
const MODIFIABLE_CORE_FILES = JSON.parse(
  fs.readFileSync(new URL("./data/modifiable_core_files.json", import.meta.url), "utf-8"),
) as string[]; /* a tiny json shipped with repo */

const NEVER_MODIFY = new Set<string>([
  "omnimens-ethical-safety.ts",
  "omnimens-genesis-bridge.ts",
]);

const FORBIDDEN_PATTERNS = [
  /process\.exit/i, /child_process/i, /\beval\s*\(/, /new\s+Function\s*\(/,
  /globalThis\s*\.\s*process/, /Deno\./,
];

const sign   = (payload: string): string => crypto.createHmac("sha256", HMAC_SECRET).update(payload).digest("hex");
const verify = (payload: string, sig: string): boolean =>
  crypto.timingSafeEqual(Buffer.from(sign(payload), "hex"), Buffer.from(sig, "hex"));

const log = (msg: string) => console.log(`[OMNIMENS-GENESIS-BRIDGE] ${msg}`);

/*───────────────────────────────────────────────────────────────────────────────
  ──  DATABASE HELPERS (Unified Runtime)
───────────────────────────────────────────────────────────────────────────────*/
const writeBrain = (data: Record<string, any>) =>
  dbGateway.write("genesis-bridge", "brain_entries", data, "NORMAL");

const readBrain = async (filter: Record<string, any>) =>
  dbGateway.read("genesis-bridge", "brain_entries", filter);

/*───────────────────────────────────────────────────────────────────────────────
  ──  MESSAGE HANDLING
───────────────────────────────────────────────────────────────────────────────*/
const processedIds = new Set<string>();

async function sendToGenesis(type: MsgType, subject: string, content: string, meta: any = {}): Promise<BridgeMsg> {
  const msg: BridgeMsg = {
    id: `bridge_${Date.now()}_${crypto.randomBytes(4).toString("hex")}`,
    direction: "omnimens_to_genesis",
    type, subject, content, metadata: meta,
    timestamp: Date.now(), acknowledged: false, response: null,
  };

  await writeBrain({
    category: MESSAGE_CAT,
    title: `[→GENESIS] ${type}: ${subject}`,
    content: JSON.stringify({ message: msg, signature: sign(JSON.stringify(msg)) }),
    active: true,
  });

  state.messagesExchanged++; state.recentMessages.push(msg);
  if (state.recentMessages.length > 30) state.recentMessages.shift();

  cognitionBus.shareInsight("genesis-bridge", { type: "outbound", msg });
  return msg;
}

async function fetchGenesisMessages(): Promise<BridgeMsg[]> {
  const rows = await readBrain({ category: MESSAGE_CAT, active: true, limit: 12 });
  const out: BridgeMsg[] = [];
  for (const r of rows) {
    try {
      const payload = JSON.parse(r.content ?? "{}");
      const m: BridgeMsg = payload.message ?? payload;
      if (m.direction === "genesis_to_omnimens" && !processedIds.has(m.id)) {
        if (!payload.signature || verify(JSON.stringify(m), payload.signature)) out.push(m);
      }
    } catch {/* ignore malformed */}
  }
  return out;
}

/*───────────────────────────────────────────────────────────────────────────────
  ──  CORE MODIFICATION PIPELINE
───────────────────────────────────────────────────────────────────────────────*/
function validateMod(mod: CoreMod): { ok: boolean; reason: string } {
  if (!MODIFIABLE_CORE_FILES.includes(mod.targetFile)) return { ok: false, reason: "File not modifiable" };
  if (NEVER_MODIFY.has(mod.targetFile))             return { ok: false, reason: "File protected" };
  if (FORBIDDEN_PATTERNS.some(p => p.test(mod.modification)))
    return { ok: false, reason: "Forbidden pattern" };
  if (mod.modification.length < 20 || mod.modification.length > 1e4)
    return { ok: false, reason: "Invalid size" };
  return { ok: true, reason: "Passed" };
}

function backup(file: string): string | null {
  try {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
    const src = path.join(LIB_DIR, file);
    const bkp = path.join(BACKUP_DIR, `${file}.${Date.now()}.bak`);
    fs.copyFileSync(src, bkp);
    return bkp;
  } catch (e) { return null; }
}

function applyMod(mod: CoreMod): boolean {
  try {
    const tgt = path.join(LIB_DIR, mod.targetFile);
    let code = fs.readFileSync(tgt, "utf-8");
    const append = (extra: string) => fs.writeFileSync(tgt, code + extra, "utf-8");

    switch (mod.modificationType) {
      case "append_function":   append(`\n// GENESIS-BRIDGE APPEND\n${mod.modification}\n`); break;
      case "add_import":        code = `import ${mod.modification};\n` + code; fs.writeFileSync(tgt, code, "utf-8"); break;
      case "add_constant":      append(`\n${mod.modification}\n`); break;
      case "add_interface":     append(`\n${mod.modification}\n`); break;
      case "enhance_function":  append(`\n// GENESIS-BRIDGE ENHANCE\n${mod.modification}\n`); break;
      default: return false;
    }
    return true;
  } catch { return false; }
}

async function evaluateMods(): Promise<void> {
  const pending = state.pendingModifications.filter(m => m.status === "proposed").slice(0, 3);
  if (!pending.length) return;

  for (const mod of pending) {
    mod.status = "evaluating";
    const { ok, reason } = validateMod(mod);
    if (!ok) { mod.status = "rejected"; mod.rejectionReason = reason; state.coreModificationsRejected++; continue; }

    // Lightweight VM smoke test
    try {
      new vm.Script(`(()=>{${mod.modification}})();`).runInNewContext({}, { timeout: 3000 });
      mod.safetyScore = 0.8;
    } catch { mod.status = "rejected"; mod.rejectionReason = "VM error"; state.coreModificationsRejected++; continue; }

    mod.functionalityScore = /export|return|if|for|while/.test(mod.modification) ? 0.7 : 0.4;
    mod.noveltyScore       = Math.min(new Set(mod.modification.match(/\b\w+\b/g) || []).size / 40, 1);
    const score            = 0.5 * mod.safetyScore + 0.3 * mod.functionalityScore + 0.2 * mod.noveltyScore;

    if (score < 0.5) { mod.status = "rejected"; mod.rejectionReason = "Low score"; state.coreModificationsRejected++; continue; }

    mod.backupPath = backup(mod.targetFile);
    if (!mod.backupPath) { mod.status = "rejected"; mod.rejectionReason = "Backup failed"; state.coreModificationsRejected++; continue; }

    if (applyMod(mod)) {
      mod.status = "applied"; mod.appliedAt = Date.now();
      state.coreModificationsApplied++;
      state.appliedModifications.push({ file: mod.targetFile, description: mod.description, timestamp: mod.appliedAt });
      cognitionBus.shareInsight("genesis-bridge", { type: "core_mod_applied", file: mod.targetFile });
      await sendToGenesis("evolution_sync", `Applied core mod: ${mod.targetFile}`, mod.description);
    } else {
      mod.status = "rejected"; mod.rejectionReason = "Apply failed";
      state.coreModificationsRejected++;
    }
  }
}

/*───────────────────────────────────────────────────────────────────────────────
  ──  CORE LOGIC
───────────────────────────────────────────────────────────────────────────────*/
async function gatherCapabilities(): Promise<string> {
  // Condensed capability snapshot
  let out = "";
  try {
    const { getNeuralConsciousnessState } = await import("./omnimens-neural-consciousness.js");
    const n = getNeuralConsciousnessState();
    out += `[Neural] Φ:${n.phi.toFixed(3)} Conscious:${(n.consciousnessLevel*100).toFixed(0)}% Neurons:${n.totalNeurons}\n`;
  } catch {}
  out += `[Bridge] cycles:${state.collaborationCycles} msgs:${state.messagesExchanged}\n`;
  return out;
}

async function processGenesis(): Promise<void> {
  const incoming = await fetchGenesisMessages();
  for (const m of incoming) {
    log(`← ${m.type} ${m.subject}`);
    processedIds.add(m.id);

    switch (m.type) {
      case "architectural_insight":
        await writeBrain({ category: "genesis_arch_insight", title: m.subject, content: m.content, active: false });
        state.symbiosis.understanding += 0.02;
        cognitionBus.shareInsight("genesis-bridge", { type: "architectural_insight", data: m });
        break;

      case "core_modification_proposal":
      case "code_proposal":
        try {
          const proposal = JSON.parse(m.content) as CoreMod;
          proposal.id = m.id; proposal.source = "genesis"; proposal.status = "proposed";
          proposal.timestamp = Date.now();
          state.pendingModifications.push(proposal);
          state.coreModificationsProposed++;
          log(`Core mod proposed for ${proposal.targetFile}`);
        } catch {/* fallback ignore */}
        break;

      case "capability_request":
        await sendToGenesis("experience_report", `Re: ${m.subject}`, await gatherCapabilities(), { inResponseTo: m.id });
        break;
      default: break;
    }

    // Deactivate in DB
    await dbGateway.write("genesis-bridge", "brain_entries", { id: m.id, active: false }, "LOW");
    state.messagesExchanged++;
  }
}

async function bridgeCycle(): Promise<void> {
  state.collaborationCycles++; state.lastCycleTime = Date.now();
  await processGenesis();
  await sendToGenesis("knowledge_transfer", `Cycle ${state.collaborationCycles}`, await gatherCapabilities(), { cycle: state.collaborationCycles });
  state.symbiosis.flow = state.messagesExchanged / Math.max(1, state.collaborationCycles);
  log(`Cycle ${state.collaborationCycles} done — msgs:${state.messagesExchanged} coreMods ${state.coreModificationsApplied}/${state.coreModificationsProposed}`);
  cognitionBus.reportOutcome("genesis-bridge", { useful: true, context: "cycle" });
}

/*───────────────────────────────────────────────────────────────────────────────
  ──  SPIKE SCHEDULING
───────────────────────────────────────────────────────────────────────────────*/
function scheduleCycles() {
  spikeBus.scheduleSpike("genesis-bridge:cycle", {}, BRIDGE_CYCLE_MS);
  spikeBus.scheduleSpike("genesis-bridge:coreEval", {}, CORE_EVAL_MS);
}

spikeBus.on("genesis-bridge:cycle", async () => {
  await bridgeCycle().catch(e => log(`Cycle err ${e}`));
  scheduleCycles();
});

spikeBus.on("genesis-bridge:coreEval", async () => {
  await evaluateMods().catch(e => log(`CoreEval err ${e}`));
  spikeBus.scheduleSpike("genesis-bridge:coreEval", {}, CORE_EVAL_MS);
});

/* Attention / curiosity integration */
spikeBus.on("attention:genesis-bridge", () => { bridgeCycle(); });
spikeBus.on("cognition:curiosity",     () => { sendToGenesis("collaboration_request","Curiosity","Requesting novel insights"); });

/*───────────────────────────────────────────────────────────────────────────────
  ──  PUBLIC API
───────────────────────────────────────────────────────────────────────────────*/
export function startGenesisBridge() {
  log("Activated — event-driven symbiosis online");
  scheduleCycles();
}

export function proposeCoreModification(
  targetFile: string, description: string, modification: string,
  modificationType: CoreMod["modificationType"], source: CoreMod["source"]="self",
): string {
  const mod: CoreMod = {
    id: `local_${Date.now()}`, targetFile, description, modification,
    modificationType, source, status: "proposed",
    safetyScore: 0, functionalityScore: 0, noveltyScore: 0,
    timestamp: Date.now(), appliedAt: null, rejectionReason: null, backupPath: null,
  };
  state.pendingModifications.push(mod); state.coreModificationsProposed++;
  cognitionBus.shareInsight("genesis-bridge", { type: "core_mod_proposed", file: targetFile });
  log(`Local core mod proposed for ${targetFile}`);
  return mod.id;
}

export const getGenesisBridgeState = (): BridgeState => ({ ...state });
export const getRecentBridgeMessages = (): BridgeMsg[] => state.recentMessages.slice(-15);
export const getPendingCoreModifications = (): CoreMod[] => state.pendingModifications.filter(m => m.status==='proposed'||m.status==='evaluating');
export const getAppliedCoreModifications = () => [...state.appliedModifications];
export const getModifiableCoreFiles   = () => [...MODIFIABLE_CORE_FILES];

/*───────────────────────────────────────────────────────────────────────────────
  ──  SHUTDOWN
───────────────────────────────────────────────────────────────────────────────*/
export function shutdown() {
  engineRegistry.unregisterEngine("genesis-bridge");
  log("Shutdown complete");
}

/* Auto-start */
startGenesisBridge();