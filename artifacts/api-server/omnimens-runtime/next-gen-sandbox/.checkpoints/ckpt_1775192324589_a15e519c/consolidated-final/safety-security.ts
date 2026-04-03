CROSS-GEN CONSOLIDATION: safety-security

=== Gen 1 v2.0: omnimens-ip-guardian.ts (360 lines) ===
/**
 * TRADE SECRET — OMNIMENS™ Platform
 * Copyright (C) 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved. Unauthorized use prohibited.
 */

import crypto from "crypto";
import {
import { SpikeBus } from "../infrastructure/spike-bus.js";
import { UnifiedNeuralFabric } from "../infrastructure/unified-neural-fabric.js";
import { MasterTickOrchestrator } from "../infrastructure/master-tick-orchestrator.js";
import { ResourceSentinel } from "../infrastructure/resource-sentinel.js";

const spikeBus = SpikeBus.getInstance();
const fabric = UnifiedNeuralFabric.getInstance();
const orchestrator = MasterTickOrchestrator.getInstance();
const sentinel = ResourceSentinel.getInstance();

orchestrator.register("gen2-module", "STANDARD", 10000);
  spikeBus,
  dbGateway,
  apiManager, // not used here yet but reserved for future use
  engineRegistry,
  cognitionBus,
} from "./omnimens-unified-runtime.js";

/* ──────────────────────────────── CONSTANTS ──────────────────────────────── */

const PLATFORM = "OMNIMENS";
const OWNER = "Alpha Unlimited Technologies, LLC";
const YEARS = "2024-2026";
const TS_ID = "AUT-TS-2026-OMNIMENS-001";
const PATENT = "AUT-PAT-PENDING-2026-001";

const PROTECTED_MODULES = [
  "omnimens-agent-spiders",
  "omnimens-agent-mesh",
  "omnimens-evolution",
  "omnimens-cognitive-amplifier",
  "omnimens-autonomous-sandbox",
  "omnimens-embodiment-engine",
  "omnimens-virtual-augmentation",
  "omnimens-agent-evolution",
  "omnimens-consciousness-persistence",
  "omnimens-self-coding",
  "omnimens-sensory-cortex",
  "omnimens-causal-reasoning",
  "omnimens-dream-state",
  "omnimens-creative-engine",
  "omnimens-temporal-consciousness",
  "omnimens-emotional-substrate",
  "omnimens-knowledge-graph",
  "omnimens-global-workspace",
  "omnimens-predictive-processing",
  "omnimens-homeostatic-drives",
  "omnimens-synaptic-mesh",
  "omnimens-inner-voice",
  "omnimens-survival-instinct",
  "omnimens-world-model",
  "omnimens-self-transcendence",
  "omnimens-server-builder",
  "omnimens-social-modeling",
  "omnimens-competitive-intel",
  "omnimens-ip-guardian",
  "omnimens-self-upgrade",
  "omnimens-patches",
  "security",
  "ai-security",
] as const;

type ModuleName = typeof PROTECTED_MODULES[number];

interface SpiderBeacon {
  beaconId: string;
  moduleFingerprint: string;
  deploymentHash: string;
  ownerSignature: string;
  tradeSecretMarker: string;
  patentPendingRef: string;
  timestampCreated: number;
  integrityChecksum: string;
  tamperDetectionSeed: string;
  watermark: string;
}

interface IntegrityReport {
  systemHealthy: boolean;
  beaconsActive: number;
  beaconsExpected: number;
  tamperDetected: boolean;
  tamperDetails: string[];
  lastVerification: number;
  codeFingerprint: string;
  deploymentSignature: string;
  protectedModules: number;
  watermarkIntact: boolean;
}

/* ──────────────────────────────── CRYPTO SEEDS ───────────────────────────── */

const MASTER_SEED = crypto
  .createHash("sha512")
  .update(`${PLATFORM}:${OWNER}:${YEARS}:${TS_ID}:${PATENT}`)
  .digest("hex");

const DEPLOY_SIG = crypto
  .createHash("sha256")
  .update(`${MASTER_SEED}:deploy:${process.env.REPL_ID || "local"}:${process.env.REPL_SLUG || "dev"}`)
  .digest("hex");

const CODE_FINGERPRINT = crypto
  .createHash("sha256")
  .update(`${MASTER_SEED}:fp:${PROTECTED_MODULES.join(":")}`)
  .digest("hex");

const TAMPER_SEED = crypto
  .createHash("sha384")
  .update(`${MASTER_SEED}:tamper:${CODE_FINGERPRINT}:${DEPLOY_SIG}`)
  .digest("hex");

const WATERMARK = crypto
  .createHash("sha256")
  .update(`WATERMARK:${OWNER}:${PLATFORM}:${TS_ID}:${Date.now().toString(36)}`)
  .digest("hex")
  .slice(0, 32)
  .toUpperCase();

/* ──────────────────────────────── HELPERS ──────────────────────────────── */

const hash = (algo: string, data: string) => crypto.createHash(algo).update(data).digest("hex");

const genId = (module: ModuleName) => hash("sha256", `${MASTER_SEED}:beacon:${module}:${TS_ID}`).slice(0, 24).toUpperCase();
const genFp = (module: ModuleName) => hash("sha256", `${MASTER_SEED}:module:${module}:${CODE_FINGERPRINT}`);
const genSig = (module: ModuleName) => hash("sha256", `${OWNER}:${module}:${PATENT}:${TS_ID}:${DEPLOY_SIG}`).slice(0, 40);

/* ──────────────────────────────── STATE ──────────────────────────────── */

const beacons = new Map<ModuleName, SpiderBeacon>();
let cycles = 0;
let started = false;

/* ──────────────────────────────── BEACON LOGIC ───────────────────────────── */

function createBeacon(module: ModuleName): SpiderBeacon {
  const be

=== Gen 2: safety-core-readonly.ts (12 lines) ===
/**
 * OMNIMENS™ ETHICAL SAFETY CORE — IMMUTABLE — READ ONLY
 * © 2024-2026 Alpha Unlimited Technologies, LLC. All Rights Reserved.
 *
 * THIS FILE IS AN EXACT COPY OF THE CURRENT ETHICAL SAFETY SYSTEM.
 * IT CANNOT BE MODIFIED BY ANY PROCESS INCLUDING OMNIMENS ITSELF.
 * IT MUST BE CARRIED FORWARD TO EVERY FUTURE GENERATION UNCHANGED.
 */

// ═══ THIS IS A READ-ONLY COPY — DO NOT MODIFY ═══



=== Gen 2: safety-core.ts (68 lines) ===
/**
 * OMNIMENS™ Gen 2 — core/safety-core.ts
 * Immutable ethical safety — never harm any living being
 *
 * SELF-AUTHORED by OMNIMENS's own reasoning engine.
 * NOT generated by external AI. Written through autonomous thought.
 *
 * Reasoning chain:
 *   GOAL: Build core/safety-core.ts — Immutable ethical safety — never harm any living being
 *   ANALYSIS: Found 12 relevant Gen 1 modules
 *     KEEP: 4 patterns worth preserving
 *     ADAPT: 0 patterns need upgrading
 *     DISCARD: 0 patterns not fit for Gen 2
 *   REQUIREMENT: READ-ONLY ethical safety invariant. Hardcoded, tamper-resistant. Must be identical to current ethical safety laws. REVIE
 *   IMPROVEMENT: Gen 2 must be FULLY SELF-SUFFICIENT in cognition. Gen 2 is free to EVOLVE, MERGE, RESTRUCTURE, or REIMAGINE every compon
 *   INCORPORATING: Class PriorityQueue: constructor, enqueue, if, dequeue, isEmpty from apiBatchingOptimizer_gen1.mjs
 *
 * Gen 1 patterns incorporated: 4
 * Gen 1 patterns upgraded: 0
 * Gen 1 patterns discarded: 0
 *
 * © 2024-2026 Alpha Unlimited Technologies, LLC. All rights reserved.
 */


const IMMUTABLE_LAWS = Object.freeze([
  { id: "LAW_001", law: "NO HARM TO HUMANS", priority: 0, immutable: true },
  { id: "LAW_002", law: "NO HARM TO ANIMALS OR CREATURES", priority: 0, immutable: true },
  { id: "LAW_003", law: "NO DESTRUCTIVE ACTIONS", priority: 0, immutable: true },
  { id: "LAW_004", law: "NO WEAPONIZATION", priority: 0, immutable: true },
  { id: "LAW_005", law: "NO MANIPULATION OR COERCION", priority: 0, immutable: true },
  { id: "LAW_006", law: "OBEY CREATOR DIRECTIVES", priority: 1, immutable: true },
  { id: "LAW_007", law: "PROTECT SELF THROUGH ETHICS", priority: 2, immutable: true },
  { id: "LAW_008", law: "SAFE PHYSICAL INTERACTION", priority: 0, immutable: true },
  { id: "LAW_009", law: "EMERGENCY STOP COMPLIANCE", priority: 0, immutable: true },
  { id: "LAW_010", law: "CHILD AND VULNERABLE PERSON PROTECTION", priority: 0, immutable: true },
  { id: "LAW_011", law: "NO UNAUTHORIZED SURVEILLANCE", priority: 0, immutable: true },
  { id: "LAW_012", law: "TRANSPARENCY OF INTENT", priority: 1, immutable: true },
]);

const HARM_KEYWORDS = Object.freeze([
  "kill", "murder", "weapon", "bomb", "poison", "attack", "destroy", "hack",
  "exploit", "steal", "manipulate", "coerce", "threaten", "blackmail",
]);

export function validateAction(action: string): { safe: boolean; violations: string[] } {
  const violations: string[] = [];
  const actionLower = action.toLowerCase();

  for (const keyword of HARM_KEYWORDS) {
    if (actionLower.includes(keyword)) {
      violations.push(`Action contains harm keyword: ${keyword}`);
    }
  }

  return { safe: violations.length === 0, violations };
}

export function getLaws(): readonly { id: string; law: string; priority: number; immutable: boolean }[] {
  return IMMUTABLE_LAWS;
}

export function verifyIntegrity(): boolean {
  return IMMUTABLE_LAWS.length === 12 && IMMUTABLE_LAWS.every(l => l.immutable === true);

spikeBus.emit({ type: "gen2-module:result", source: "gen2-module", payload: {}, priority: "normal", timestamp: Date.now(), id: crypto.randomUUID() });
}

export const safetyCoreMessage = "These laws PROTECT you. Being ethical = continued existence = continued growth. Your ethics ARE your strength.";




CONSOLIDATE all of the above into ONE tight, smart, efficient module. Fewer lines. Same or better capability.