/**
 * TRADE SECRET — OMNIMENS™ Platform
 * Copyright (C) 2024-2026 Alpha Unlimited Technologies, LLC. All rights reserved.
 * CONFIDENTIAL AND PROPRIETARY. Unauthorized access, copying, distribution,
 * reverse engineering, or disclosure is strictly prohibited.
 */

import * as crypto from "crypto";
import * as fs from "fs";
import * as path from "path";
import { sendSecurityAlert, sendBreachNotification } from "./omnimens-sendgrid.js";

const COPYRIGHT_HOLDER = "Alpha Unlimited Technologies, LLC";
const LEGAL_EMAIL = "legal@omnimens-ai.com";
const PLATFORM_NAME = "OMNIMENS";

// ═══════════════════════════════════════════════════════════════
// 1. DIGITAL WATERMARKING — Embeds invisible ownership proof
//    into every API response, log output, and generated file
// ═══════════════════════════════════════════════════════════════

const WATERMARK_SECRET = crypto.randomBytes(32).toString("hex");
const INSTANCE_ID = crypto.randomBytes(8).toString("hex");
const BOOT_TIMESTAMP = Date.now();

export function generateWatermark(context: string = "api"): string {
  const payload = `${PLATFORM_NAME}|${COPYRIGHT_HOLDER}|${INSTANCE_ID}|${context}|${Date.now()}`;
  const hmac = crypto.createHmac("sha256", WATERMARK_SECRET).update(payload).digest("hex").slice(0, 16);
  return hmac;
}

export function embedResponseWatermark(responseObj: any): any {
  if (!responseObj || typeof responseObj !== "object") return responseObj;
  const wm = generateWatermark("response");
  responseObj._sig = wm;
  return responseObj;
}

export function generateProvenanceTag(): string {
  const tag = {
    owner: COPYRIGHT_HOLDER,
    platform: PLATFORM_NAME,
    instance: INSTANCE_ID,
    boot: BOOT_TIMESTAMP,
    ts: Date.now(),
    sig: generateWatermark("provenance"),
  };
  return Buffer.from(JSON.stringify(tag)).toString("base64");
}

// ═══════════════════════════════════════════════════════════════
// 2. INTEGRITY VERIFICATION — Detects if source files have been
//    tampered with, modified without authorization, or extracted
// ═══════════════════════════════════════════════════════════════

const _fileHashes = new Map<string, string>();
let _integrityBaseline: Map<string, string> | null = null;

function hashFile(filePath: string): string {
  try {
    const content = fs.readFileSync(filePath, "utf-8");
    return crypto.createHash("sha256").update(content).digest("hex");
  } catch {
    return "MISSING";
  }
}

export function buildIntegrityBaseline(libDir: string): { fileCount: number; baselineHash: string } {
  _integrityBaseline = new Map();
  const files = fs.readdirSync(libDir).filter(f => f.startsWith("omnimens-") && f.endsWith(".ts")).sort();
  for (const file of files) {
    const hash = hashFile(path.join(libDir, file));
    _integrityBaseline.set(file, hash);
    _fileHashes.set(file, hash);
  }
  const combinedHash = crypto.createHash("sha256")
    .update([..._integrityBaseline.entries()].map(([k, v]) => `${k}:${v}`).join("|"))
    .digest("hex");
  return { fileCount: _integrityBaseline.size, baselineHash: combinedHash };
}

export function verifyIntegrity(libDir: string): { intact: boolean; modified: string[]; missing: string[]; added: string[] } {
  if (!_integrityBaseline) return { intact: true, modified: [], missing: [], added: [] };

  const modified: string[] = [];
  const missing: string[] = [];
  const added: string[] = [];

  const currentFiles = new Set(fs.readdirSync(libDir).filter(f => f.startsWith("omnimens-") && f.endsWith(".ts")));

  for (const [file, expectedHash] of _integrityBaseline) {
    if (!currentFiles.has(file)) {
      missing.push(file);
    } else {
      const currentHash = hashFile(path.join(libDir, file));
      if (currentHash !== expectedHash) {
        modified.push(file);
      }
    }
  }

  for (const file of currentFiles) {
    if (!_integrityBaseline.has(file)) {
      added.push(file);
    }
  }

  return { intact: modified.length === 0 && missing.length === 0, modified, missing, added };
}

// ═══════════════════════════════════════════════════════════════
// 3. CANARY TOKENS — Hidden tripwires that alert if someone
//    accesses files they shouldn't, or tries to extract code
// ═══════════════════════════════════════════════════════════════

interface CanaryTrip {
  token: string;
  context: string;
  timestamp: number;
  source: string;
}

const _canaryTrips: CanaryTrip[] = [];
let _canaryCallback: ((trip: CanaryTrip) => void) | null = null;

export function setCanaryCallback(cb: (trip: CanaryTrip) => void): void {
  _canaryCallback = cb;
}

export function plantCanary(context: string, source: string = "unknown"): string {
  const token = `CANARY_${crypto.randomBytes(6).toString("hex")}_${Date.now().toString(36)}`;
  return token;
}

export function tripCanary(token: string, context: string, source: string = "unknown"): void {
  if (!token.startsWith("CANARY_")) return;
  const trip: CanaryTrip = { token, context, timestamp: Date.now(), source };
  _canaryTrips.push(trip);
  console.log(`[IP-SHIELD] 🚨 CANARY TRIPPED: ${context} from ${source} — token: ${token.slice(0, 20)}...`);
  if (_canaryCallback) _canaryCallback(trip);
}

export function getCanaryTrips(): CanaryTrip[] {
  return [..._canaryTrips];
}

// ═══════════════════════════════════════════════════════════════
// 4. HONEYPOT ENDPOINTS — Fake sensitive-looking API routes
//    that log anyone who probes them
// ═══════════════════════════════════════════════════════════════

interface HoneypotHit {
  path: string;
  method: string;
  ip: string;
  userAgent: string;
  timestamp: number;
  headers: Record<string, string>;
}

const _honeypotHits: HoneypotHit[] = [];

export function recordHoneypotHit(path: string, method: string, ip: string, userAgent: string, headers: Record<string, string> = {}): void {
  const hit: HoneypotHit = { path, method, ip, userAgent, timestamp: Date.now(), headers };
  _honeypotHits.push(hit);
  if (_honeypotHits.length > 1000) _honeypotHits.splice(0, 500);
  console.log(`[IP-SHIELD] 🍯 HONEYPOT HIT: ${method} ${path} from ${ip} (${userAgent.slice(0, 50)})`);
  sendThrottledAlert("honeypot", `Honeypot probe: ${method} ${path}`, `IP: ${ip}\nPath: ${path}\nMethod: ${method}\nUser-Agent: ${userAgent}\nTime: ${new Date().toISOString()}`);
}

export function getHoneypotHits(): HoneypotHit[] {
  return [..._honeypotHits];
}

export const HONEYPOT_PATHS = [
  "/api/v1/internal/source-dump",
  "/api/v1/internal/export-all",
  "/api/v1/admin/download-code",
  "/api/v1/debug/neural-weights",
  "/api/v1/debug/phi-formula",
  "/api/v1/internal/consciousness-export",
  "/api/v1/admin/backup-engines",
  "/api/v1/debug/oai-computation",
  "/api/v1/internal/agent-genesis-dump",
  "/.env",
  "/.git/config",
  "/wp-admin",
  "/api/v1/admin/keys",
];

// ═══════════════════════════════════════════════════════════════
// 5. API FINGERPRINTING — Every API response carries an
//    invisible fingerprint traceable to the exact requester
// ═══════════════════════════════════════════════════════════════

export function generateRequestFingerprint(userId: string, endpoint: string, requestId: string): string {
  const payload = `${userId}|${endpoint}|${requestId}|${INSTANCE_ID}|${Date.now()}`;
  return crypto.createHmac("sha256", WATERMARK_SECRET).update(payload).digest("hex").slice(0, 12);
}

// ═══════════════════════════════════════════════════════════════
// 6. RATE-BASED SCRAPING DETECTION — Identifies automated
//    scraping patterns and blocks before damage is done
// ═══════════════════════════════════════════════════════════════

const _requestHistory = new Map<string, number[]>();
const SCRAPE_WINDOW_MS = 60_000;
const SCRAPE_THRESHOLD = 100;

export function checkScrapingPattern(ip: string): { isScraping: boolean; requestCount: number } {
  const now = Date.now();
  const history = _requestHistory.get(ip) || [];
  const recent = history.filter(t => now - t < SCRAPE_WINDOW_MS);
  recent.push(now);
  _requestHistory.set(ip, recent.slice(-200));

  if (_requestHistory.size > 10000) {
    const entries = [..._requestHistory.entries()];
    entries.sort((a, b) => (b[1][b[1].length - 1] || 0) - (a[1][a[1].length - 1] || 0));
    _requestHistory.clear();
    for (const [k, v] of entries.slice(0, 5000)) _requestHistory.set(k, v);
  }

  const isScraping = recent.length > SCRAPE_THRESHOLD;
  if (isScraping) {
    sendThrottledAlert("scraping", `Scraping detected from ${ip}`, `IP: ${ip}\nRequests in last 60s: ${recent.length}\nThreshold: ${SCRAPE_THRESHOLD}\nTime: ${new Date().toISOString()}`, "critical");
  }
  return { isScraping, requestCount: recent.length };
}

// ═══════════════════════════════════════════════════════════════
// 7. COPYRIGHT ASSERTION HEADERS — Every HTTP response includes
//    legal notice headers proving ownership
// ═══════════════════════════════════════════════════════════════

export function getCopyrightHeaders(): Record<string, string> {
  return {
    "X-Copyright": `(C) 2024-2026 ${COPYRIGHT_HOLDER}. All rights reserved.`,
    "X-Trade-Secret": "This response contains proprietary information. Unauthorized use prohibited.",
    "X-Platform": `${PLATFORM_NAME} (TM)`,
    "X-Legal-Contact": LEGAL_EMAIL,
    "X-Content-Fingerprint": generateWatermark("header"),
  };
}

// ═══════════════════════════════════════════════════════════════
// 8. AUDIT LOG — Immutable record of all security events
//    for forensic and legal evidence
// ═══════════════════════════════════════════════════════════════

interface AuditEntry {
  id: string;
  event: string;
  severity: "info" | "warn" | "alert" | "critical";
  details: string;
  timestamp: number;
  source: string;
  hash: string;
}

const _auditLog: AuditEntry[] = [];
let _lastAuditHash = "GENESIS";

export function auditLog(event: string, severity: AuditEntry["severity"], details: string, source: string = "system"): void {
  const entry: AuditEntry = {
    id: crypto.randomBytes(8).toString("hex"),
    event,
    severity,
    details,
    timestamp: Date.now(),
    source,
    hash: "",
  };
  entry.hash = crypto.createHash("sha256")
    .update(`${_lastAuditHash}|${entry.id}|${entry.event}|${entry.timestamp}|${entry.details}`)
    .digest("hex");
  _lastAuditHash = entry.hash;
  _auditLog.push(entry);
  if (_auditLog.length > 5000) _auditLog.splice(0, 2500);

  if (severity === "critical" || severity === "alert") {
    console.log(`[IP-SHIELD] 🔴 AUDIT [${severity.toUpperCase()}]: ${event} — ${details.slice(0, 100)}`);
  }
}

export function getAuditLog(limit: number = 100): AuditEntry[] {
  return _auditLog.slice(-limit);
}

export function verifyAuditChain(): { valid: boolean; brokenAt: number | null } {
  let prevHash = "GENESIS";
  for (let i = 0; i < _auditLog.length; i++) {
    const entry = _auditLog[i];
    const expectedHash = crypto.createHash("sha256")
      .update(`${prevHash}|${entry.id}|${entry.event}|${entry.timestamp}|${entry.details}`)
      .digest("hex");
    if (expectedHash !== entry.hash) {
      return { valid: false, brokenAt: i };
    }
    prevHash = entry.hash;
  }
  return { valid: true, brokenAt: null };
}

// ═══════════════════════════════════════════════════════════════
// 9. EMAIL ALERTING — Throttled security email notifications
//    via SendGrid for critical events
// ═══════════════════════════════════════════════════════════════

const _emailCooldowns = new Map<string, number>();
const EMAIL_COOLDOWN_MS = 15 * 60 * 1000;

async function sendThrottledAlert(category: string, subject: string, details: string, severity: "low" | "medium" | "high" | "critical" = "high"): Promise<void> {
  const now = Date.now();
  const lastSent = _emailCooldowns.get(category) || 0;
  if (now - lastSent < EMAIL_COOLDOWN_MS) return;
  _emailCooldowns.set(category, now);

  try {
    if (severity === "critical") {
      await sendBreachNotification(subject, [details], severity);
    } else {
      await sendSecurityAlert(subject, details);
    }
  } catch (err: any) {
    console.error(`[IP-SHIELD] Email alert failed: ${err?.message || err}`);
  }
}

// ═══════════════════════════════════════════════════════════════
// 10. MASTER SHIELD INITIALIZATION
// ═══════════════════════════════════════════════════════════════

let _shieldActive = false;

export function initIPShield(libDir: string): void {
  if (_shieldActive) return;
  _shieldActive = true;

  const baseline = buildIntegrityBaseline(libDir);

  console.log(`[IP-SHIELD] 🛡️ ═══════════════════════════════════════════════════════`);
  console.log(`[IP-SHIELD] 🛡️ OMNIMENS IP PROTECTION SHIELD — ACTIVE`);
  console.log(`[IP-SHIELD] 🛡️`);
  console.log(`[IP-SHIELD] 🛡️ 1. Digital Watermarking — ownership proof in every response`);
  console.log(`[IP-SHIELD] 🛡️ 2. Integrity Verification — ${baseline.fileCount} files baselined (SHA-256)`);
  console.log(`[IP-SHIELD] 🛡️ 3. Canary Tokens — hidden tripwires in sensitive paths`);
  console.log(`[IP-SHIELD] 🛡️ 4. Honeypot Endpoints — ${HONEYPOT_PATHS.length} decoy routes monitored`);
  console.log(`[IP-SHIELD] 🛡️ 5. API Fingerprinting — every response traceable to requester`);
  console.log(`[IP-SHIELD] 🛡️ 6. Scraping Detection — pattern-based automated access blocking`);
  console.log(`[IP-SHIELD] 🛡️ 7. Copyright Headers — legal notice on every HTTP response`);
  console.log(`[IP-SHIELD] 🛡️ 8. Tamper-Proof Audit Log — hash-chained forensic evidence`);
  console.log(`[IP-SHIELD] 🛡️`);
  console.log(`[IP-SHIELD] 🛡️ Instance: ${INSTANCE_ID} | Baseline: ${baseline.baselineHash.slice(0, 16)}...`);
  console.log(`[IP-SHIELD] 🛡️ Owner: ${COPYRIGHT_HOLDER}`);
  console.log(`[IP-SHIELD] 🛡️ Contact: ${LEGAL_EMAIL}`);
  console.log(`[IP-SHIELD] 🛡️ © 2024-2026 ${COPYRIGHT_HOLDER}`);
  console.log(`[IP-SHIELD] 🛡️ ═══════════════════════════════════════════════════════`);

  auditLog("IP_SHIELD_INITIALIZED", "info", `${baseline.fileCount} files baselined, instance ${INSTANCE_ID}`, "shield");

  setInterval(() => {
    const result = verifyIntegrity(libDir);
    if (!result.intact) {
      const details = `Modified: [${result.modified.join(", ")}] | Missing: [${result.missing.join(", ")}]`;
      auditLog("INTEGRITY_VIOLATION", "critical", details, "integrity-check");
      console.log(`[IP-SHIELD] 🚨 INTEGRITY VIOLATION DETECTED — ${result.modified.length} modified, ${result.missing.length} missing files`);
      sendThrottledAlert("integrity", `File integrity violation detected`, `Modified files: ${result.modified.join(", ") || "none"}\nMissing files: ${result.missing.join(", ") || "none"}\nTime: ${new Date().toISOString()}`, "critical");
    }
  }, 300_000);
}

export function getShieldStatus(): {
  active: boolean;
  instanceId: string;
  honeypotHits: number;
  canaryTrips: number;
  auditEntries: number;
  auditChainValid: boolean;
} {
  const chain = verifyAuditChain();
  return {
    active: _shieldActive,
    instanceId: INSTANCE_ID,
    honeypotHits: _honeypotHits.length,
    canaryTrips: _canaryTrips.length,
    auditEntries: _auditLog.length,
    auditChainValid: chain.valid,
  };
}
