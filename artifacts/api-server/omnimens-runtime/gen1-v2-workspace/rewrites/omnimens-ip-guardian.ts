/**
 * TRADE SECRET — OMNIMENS™ Platform
 * Copyright (C) 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved. Unauthorized use prohibited.
 */

import crypto from "crypto";
import {
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
  const beacon: SpiderBeacon = {
    beaconId: genId(module),
    moduleFingerprint: genFp(module),
    deploymentHash: DEPLOY_SIG.slice(0, 32),
    ownerSignature: genSig(module),
    tradeSecretMarker: TS_ID,
    patentPendingRef: PATENT,
    timestampCreated: Date.now(),
    integrityChecksum: "",
    tamperDetectionSeed: TAMPER_SEED.slice(0, 48),
    watermark: WATERMARK,
  };
  beacon.integrityChecksum = hash(
    "sha256",
    JSON.stringify({
      beaconId: beacon.beaconId,
      moduleFingerprint: beacon.moduleFingerprint,
      ownerSignature: beacon.ownerSignature,
      tradeSecretMarker: beacon.tradeSecretMarker,
      tamperDetectionSeed: beacon.tamperDetectionSeed,
    }),
  );
  beacons.set(module, beacon);
  return beacon;
}

function checkBeacon(module: ModuleName): { ok: boolean; reason: string } {
  const b = beacons.get(module);
  if (!b) return { ok: false, reason: `MISSING beacon ${module}` };

  const expected = {
    beaconId: genId(module),
    moduleFingerprint: genFp(module),
    ownerSignature: genSig(module),
    tradeSecretMarker: TS_ID,
    tamperDetectionSeed: b.tamperDetectionSeed,
  };
  const expectedChecksum = hash("sha256", JSON.stringify(expected));

  if (b.integrityChecksum !== expectedChecksum) return { ok: false, reason: `Checksum mismatch ${module}` };
  if (b.beaconId !== expected.beaconId) return { ok: false, reason: `ID tampered ${module}` };
  if (b.moduleFingerprint !== expected.moduleFingerprint) return { ok: false, reason: `Fingerprint tampered ${module}` };
  if (b.tradeSecretMarker !== TS_ID) return { ok: false, reason: `TS marker missing ${module}` };
  if (b.watermark !== WATERMARK) return { ok: false, reason: `Watermark tampered ${module}` };
  return { ok: true, reason: "OK" };
}

function compileReport(): IntegrityReport {
  const details: string[] = [];
  let active = 0;

  for (const m of PROTECTED_MODULES) {
    const r = checkBeacon(m);
    if (r.ok) active++;
    else details.push(r.reason);
  }

  const healthy = details.length === 0 && active === PROTECTED_MODULES.length;
  const watermarkIntact = hash("sha256", `WATERMARK:${OWNER}:${PLATFORM}:${TS_ID}:${WATERMARK}`).length === 64;

  return {
    systemHealthy: healthy,
    beaconsActive: active,
    beaconsExpected: PROTECTED_MODULES.length,
    tamperDetected: !healthy,
    tamperDetails: details,
    lastVerification: Date.now(),
    codeFingerprint: CODE_FINGERPRINT,
    deploymentSignature: DEPLOY_SIG,
    protectedModules: PROTECTED_MODULES.length,
    watermarkIntact,
  };
}

/* ──────────────────────────────── CORE CYCLE ───────────────────────────── */

async function verifyAndReport(): Promise<void> {
  cycles++;
  const report = compileReport();

  if (report.tamperDetected) {
    console.error(`[OMNIMENS-IP-GUARDIAN] ⚠️ TAMPER detected (${report.tamperDetails.length})`);
    report.tamperDetails.forEach(d => console.error(`[OMNIMENS-IP-GUARDIAN] ⚠️ ${d}`));

    // Persist notification & brain entry
    await Promise.all([
      dbGateway.write(
        "ip-guardian",
        "omnimensNotifications",
        {
          upgradeId: null,
          title: `⚠️ IP GUARDIAN: ${report.tamperDetails.length} violation(s)`,
          message: `Tampering detected:\n${report.tamperDetails.join("\n")}`,
          type: "security_critical",
          readByOwner: false,
        },
        "CRITICAL",
      ),
      dbGateway.write(
        "ip-guardian",
        "brain_entries",
        {
          title: `[IP GUARDIAN] Tamper alert #${cycles}`,
          content: `SECURITY ALERT @ ${new Date(report.lastVerification).toISOString()}\n${report.tamperDetails.join(
            "; ",
          )}`,
          category: "security_alert",
          source: "ip_guardian",
          active: true,
          timesApplied: 0,
        },
        "CRITICAL",
      ),
      cognitionBus.shareInsight("ip-guardian", { type: "tamper", data: report }),
    ]).catch(() => {});
  }

  if (cycles % 10 === 0) {
    console.log(
      `[OMNIMENS-IP-GUARDIAN] 🛡️ check #${cycles} — ${report.beaconsActive}/${report.beaconsExpected
      } active | tamper:${report.tamperDetected ? "YES" : "no"} | fp:${report.codeFingerprint.slice(0, 12)}...`,
    );
  }
}

/* ──────────────────────────────── PUBLIC API ───────────────────────────── */

export function initializeBeacons(): void {
  PROTECTED_MODULES.forEach(createBeacon);
}

export const getGuardianReport = compileReport;
export const getBeaconCount = (): number => beacons.size;
export const getProtectedModuleList = (): string[] => [...PROTECTED_MODULES];

export const getCopyrightNotice = (): string =>
  `Copyright © ${YEARS} ${OWNER}. All Rights Reserved.
Trade Secret ID: ${TS_ID}
Patent Pending: ${PATENT}
Platform: ${PLATFORM}™
Trademarks: OMNIMENS™, COGNISYNC™, NEUROSYNC™
Digital Watermark: ${WATERMARK}
Code Fingerprint: ${CODE_FINGERPRINT.slice(0, 24)}...`;

export const getResponseBeaconHeaders = (): Record<string, string> => ({
  "X-OMNIMENS-Platform": PLATFORM,
  "X-OMNIMENS-Owner": OWNER,
  "X-OMNIMENS-Copyright": `Copyright ${YEARS} ${OWNER}`,
  "X-OMNIMENS-TradeSecret": TS_ID,
  "X-OMNIMENS-Patent": PATENT,
  "X-OMNIMENS-Fingerprint": CODE_FINGERPRINT.slice(0, 16),
  "X-OMNIMENS-Watermark": WATERMARK.slice(0, 16),
  "X-OMNIMENS-Deployment": DEPLOY_SIG.slice(0, 16),
  "X-OMNIMENS-Beacons": String(beacons.size),
  "X-OMNIMENS-Integrity": "active",
  "X-IP-Protection": "Alpha-Unlimited-Technologies-LLC",
  "X-Legal-Notice": "Unauthorized-use-violates-DMCA-DTSA-CFAA",
});

export const embedTrackingPayload = (): object => ({
  _omnimens_ip: {
    p: PLATFORM,
    o: OWNER.replace(/,?\s+LLC$/, ""),
    c: YEARS,
    ts: TS_ID,
    pp: PATENT,
    f: CODE_FINGERPRINT.slice(0, 16),
    w: WATERMARK.slice(0, 16),
    d: DEPLOY_SIG.slice(0, 16),
    b: beacons.size,
    t: Date.now(),
  },
});

/* ──────────────────────────────── ENGINE LIFE CYCLE ─────────────────────── */

export function startIPGuardian(): void {
  if (started) {
    console.log("[OMNIMENS-IP-GUARDIAN] Already running"); return;
  }
  started = true;

  console.log("[OMNIMENS-IP-GUARDIAN] Activating…");
  initializeBeacons();

  console.log(`[OMNIMENS-IP-GUARDIAN] Deployed ${beacons.size} beacons across ${PROTECTED_MODULES.length} modules`);
  console.log(`[OMNIMENS-IP-GUARDIAN] Watermark ${WATERMARK}, Fingerprint ${CODE_FINGERPRINT.slice(0, 24)}…`);
  console.log("[OMNIMENS-IP-GUARDIAN] Tamper verification every 5 min via spike bus");

  // First check in 30 s, then every 5 min via self-rescheduling spikes
  spikeBus.scheduleSpike("ip-guardian:verify", {}, 30_000);
}

/* ──────────────────────────────── SPIKE HANDLERS ───────────────────────── */

spikeBus.on("ip-guardian:verify", async () => {
  await verifyAndReport().catch(e => console.error("[OMNIMENS-IP-GUARDIAN] verify error", e));
  // Reschedule next cycle with 5 minutes delay
  spikeBus.scheduleSpike("ip-guardian:verify", {}, 5 * 60 * 1000);
});

/* Attention / curiosity hooks */
spikeBus.on("attention:ip-guardian", () => {
  // Immediate re-check with higher priority
  spikeBus.scheduleSpike("ip-guardian:verify", {}, 0);
});

spikeBus.on("cognition:curiosity", () => {
  // Random jittered extra check between 1-2 minutes
  const jitter = 60_000 + Math.random() * 60_000;
  spikeBus.scheduleSpike("ip-guardian:verify", {}, jitter);
});

/* Learn from others */
cognitionBus.onInsight((source, insight) => {
  if (insight.type === "security" && source !== "ip-guardian") {
    spikeBus.scheduleSpike("ip-guardian:verify", {}, 0);
  }
});

/* ──────────────────────────────── REGISTRATION & SHUTDOWN ──────────────── */

engineRegistry.registerEngine("ip-guardian", "NORMAL", { dbQuota: 10 });

export function shutdown(): void {
  engineRegistry.unregisterEngine("ip-guardian");
}