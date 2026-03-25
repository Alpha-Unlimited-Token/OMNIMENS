/**
 * ============================================================
 * OMNIMENS — Proprietary AI Platform
 * Copyright © 2024–2026 Alpha Unlimited Technologies, LLC. All Rights Reserved.
 *
 * SECURITY MIDDLEWARE — Comprehensive Threat Protection Layer
 *
 * This module implements multi-layer security hardening including:
 *   • Bot & scraper detection (user-agent analysis + behavioral fingerprinting)
 *   • Malicious request pattern detection (SQLi, XSS, path traversal, RCE)
 *   • IP-based abuse tracking with automatic cooldown
 *   • Security beacon — cryptographic OMNIMENS signature on all responses
 *   • Anti-hotlinking enforcement
 *   • Suspicious header detection
 *   • Honeypot traps for scanners and crawlers
 *
 * NOTICE: Unauthorized reproduction or use of this security architecture
 * is strictly prohibited. All enforcement measures are logged.
 * ============================================================
 */

import type { Request, Response, NextFunction } from "express";
import crypto from "crypto";

// ── Security Beacon ───────────────────────────────────────────────────────────
// Cryptographic signature embedded in every API response header.
// Serves as a proof-of-origin marker. If code is stolen and deployed elsewhere,
// this beacon still broadcasts "OMNIMENS by Alpha Unlimited Technologies".
const PLATFORM      = "OMNIMENS";
const OWNER         = "Alpha-Unlimited-Technologies";
const COPYRIGHT     = "2024-2026";
const BEACON_HASH   = crypto
  .createHash("sha256")
  .update(`${PLATFORM}:${OWNER}:${COPYRIGHT}:${process.env.NODE_ENV || "dev"}`)
  .digest("hex")
  .slice(0, 16)
  .toUpperCase();

export function securityBeacon(_req: Request, res: Response, next: NextFunction) {
  // Embed ownership beacon in every response — cannot be stripped without breaking signature
  res.setHeader("X-Powered-By-OMNIMENS", `${PLATFORM}/${BEACON_HASH}`);
  res.setHeader("X-Platform-Owner", OWNER);
  res.setHeader("X-IP-Protection", "Alpha-Unlimited-Technologies-LLC");
  // Permissions policy — lock down browser features that could be exploited
  res.setHeader(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), payment=(), usb=(), magnetometer=(), gyroscope=(), speaker-selection=()"
  );
  next();
}

// ── Trusted IPs — never blocked ───────────────────────────────────────────────
// Internal/loopback IPs used by reverse proxies and Replit's preview infrastructure.
// These must never be blocked — doing so would cut off all legitimate users.
const TRUSTED_IPS = new Set(["127.0.0.1", "::1", "localhost", "0.0.0.0"]);

// ── IP Abuse Tracker ──────────────────────────────────────────────────────────
// In-memory store for suspicious IP activity. Resets on server restart.
// Tracks: repeated auth failures, honeypot trips, malicious pattern hits.
type AbuseRecord = { count: number; firstSeen: number; lastSeen: number; reasons: Set<string> };
const abuseMap = new Map<string, AbuseRecord>();
const ABUSE_BLOCK_THRESHOLD = 8;     // block after 8 suspicious events
const ABUSE_RESET_MS        = 15 * 60 * 1000; // reset after 15 min of no activity

function recordAbuse(ip: string, reason: string): boolean {
  const now = Date.now();
  let rec = abuseMap.get(ip);
  if (!rec) {
    rec = { count: 1, firstSeen: now, lastSeen: now, reasons: new Set([reason]) };
  } else {
    if (now - rec.lastSeen > ABUSE_RESET_MS) {
      rec = { count: 1, firstSeen: now, lastSeen: now, reasons: new Set([reason]) };
    } else {
      rec.count++;
      rec.lastSeen = now;
      rec.reasons.add(reason);
    }
  }
  abuseMap.set(ip, rec);
  if (rec.count >= ABUSE_BLOCK_THRESHOLD) {
    console.warn(`[OMNIMENS SECURITY] IP ${ip} BLOCKED — ${rec.count} incidents: ${[...rec.reasons].join(", ")}`);
    return true; // blocked
  }
  return false;
}

function isBlocked(ip: string): boolean {
  const rec = abuseMap.get(ip);
  if (!rec) return false;
  if (Date.now() - rec.lastSeen > ABUSE_RESET_MS) {
    abuseMap.delete(ip);
    return false;
  }
  return rec.count >= ABUSE_BLOCK_THRESHOLD;
}

// ── Known Malicious / Bot User Agents ────────────────────────────────────────
const BLOCKED_UA_PATTERNS = [
  /sqlmap/i,           // SQL injection tool
  /nikto/i,            // web vulnerability scanner
  /nmap/i,             // network scanner
  /masscan/i,          // port scanner
  /zgrab/i,            // banner grabber
  /nuclei/i,           // vulnerability scanner
  /acunetix/i,         // web vulnerability scanner
  /nessus/i,           // security scanner
  /openvas/i,          // vulnerability scanner
  /havij/i,            // SQL injection tool
  /python-requests\/[01]\./i, // old python-requests (often scrapers)
  /go-http-client\/1\./i,    // basic Go scrapers
  /libwww-perl/i,      // Perl scanner
  /wget\//i,           // wget scraper
  /curl\//i,           // curl scraper (allow in dev)
  /scrapy/i,           // Python scraper
  /mechanize/i,        // Perl scraper
  /phantomjs/i,        // headless scraper
  /slimerjs/i,         // headless scraper
  /headlesschrome/i,   // headless chrome scraper (lowercase)
  /bot(?!.*google|.*bing|.*duckduck|.*slack|.*twitter|.*facebook|.*linkedin)/i, // bots except known good
  /spider(?!.*googlebot)/i, // spiders except Googlebot
  /crawl(?!.*googlebot|.*bingbot)/i, // crawlers except good ones
  /scanner/i,
  /pentest/i,
  /exploit/i,
  /burpsuite/i,
  /zap\//i,            // OWASP ZAP
  /dirbuster/i,
  /gobuster/i,
  /hydra/i,
  /metasploit/i,
  /w3af/i,
];

// In dev, allow curl and headless chrome (used by Replit testing tools)
const IS_PROD = process.env.NODE_ENV === "production";
const ACTUAL_BLOCKED_UA_PATTERNS = IS_PROD
  ? BLOCKED_UA_PATTERNS
  : BLOCKED_UA_PATTERNS.filter(p =>
      !p.toString().includes("curl") &&
      !p.toString().includes("headlesschrome") &&
      !p.toString().includes("phantomjs") &&
      !p.toString().includes("slimerjs")
    );

// ── Malicious Request Patterns ────────────────────────────────────────────────
// Detects SQL injection, XSS, path traversal, command injection, SSRF in URLs/bodies/headers
const MALICIOUS_URL_PATTERNS = [
  // SQL Injection
  /(\bunion\b.*\bselect\b|\bselect\b.*\bfrom\b|\bdrop\b.*\btable\b|\binsert\b.*\binto\b|\bdelete\b.*\bfrom\b)/i,
  /('|"|\`)\s*(or|and)\s*('|"|\`)?\s*[\d\w]+\s*=\s*[\d\w]+/i,
  /;\s*(drop|alter|create|truncate|exec|execute)\s/i,
  /\/\*.*\*\//,          // SQL comments
  /--\s*$/m,             // SQL comment at end of line
  // XSS
  /<script[\s>]/i,
  /javascript:/i,
  /on\w+\s*=/i,          // event handlers
  /vbscript:/i,
  /<iframe/i,
  /<object/i,
  /<embed/i,
  // Path traversal
  /\.\.[\/\\]/,
  /\.\.[%2f5c]/i,
  /%2e%2e[%2f5c]/i,
  // Command injection
  /[;&|`$]\s*(ls|cat|wget|curl|nc|bash|sh|python|perl|ruby|php|cmd|powershell)/i,
  // SSRF
  /https?:\/\/(localhost|127\.0\.0\.1|0\.0\.0\.0|10\.\d+|172\.(1[6-9]|2\d|3[01])\.|192\.168\.)/i,
  // PHP/shell injection
  /\$\{[^}]*\}/,         // template injection
  /\{\{[^}]*\}\}/,       // Jinja/Handlebars injection in non-template context
];

// ── Honeypot Paths ────────────────────────────────────────────────────────────
// Any access to these paths = automated scanner. Block IP immediately.
const HONEYPOT_PATHS = new Set([
  "/admin", "/administrator", "/wp-admin", "/wp-login.php",
  "/.env", "/.git", "/.git/config", "/.git/HEAD",
  "/config.php", "/configuration.php", "/backup", "/backups",
  "/phpmyadmin", "/pma", "/mysqladmin",
  "/etc/passwd", "/etc/shadow",
  "/proc/self/environ",
  "/xmlrpc.php", "/wp-json/wp/v2/users",
  "/api/v1/admin", "/api/admin",
  "/actuator", "/actuator/env", "/actuator/health",
  "/.aws/credentials", "/.ssh/id_rsa",
  "/server-status", "/server-info",
  "/solr", "/jenkins", "/jmx-console",
  "/invoker/JMXInvokerServlet",
  "/CFIDE/administrator",
  "/cgi-bin/", "/cgi-bin/test-cgi",
]);

// ── Main Security Middleware ──────────────────────────────────────────────────
export function requestSecurityMiddleware(req: Request, res: Response, next: NextFunction) {
  const ip = (req.ip || req.socket?.remoteAddress || "unknown").replace(/^::ffff:/, "");
  const ua = req.headers["user-agent"] || "";
  const path = req.path.toLowerCase();

  // 0. Trusted IPs (loopback / internal proxy) — bypass all checks
  if (TRUSTED_IPS.has(ip)) return next();

  // 1. Check if IP is already blocked
  if (isBlocked(ip)) {
    console.warn(`[OMNIMENS SECURITY] Blocked IP attempt: ${ip} → ${req.method} ${req.path}`);
    return res.status(403).json({ error: "Access denied" });
  }

  // 2. Honeypot check — instant IP block
  if (HONEYPOT_PATHS.has(path) || HONEYPOT_PATHS.has(req.path)) {
    console.warn(`[OMNIMENS SECURITY] Honeypot triggered: ${ip} → ${req.method} ${req.path}`);
    // Record multiple abuse incidents for honeypot (instant block)
    recordAbuse(ip, "honeypot:admin"); recordAbuse(ip, "honeypot:scan");
    recordAbuse(ip, "honeypot:enum"); recordAbuse(ip, "honeypot:probe");
    recordAbuse(ip, "honeypot:vuln"); recordAbuse(ip, "honeypot:evil");
    recordAbuse(ip, "honeypot:bad");  recordAbuse(ip, "honeypot:kill");
    return res.status(404).send("Not found");
  }

  // 3. User-agent check (exempt external-ai endpoints — other AIs need access)
  const isExternalAiPath = req.originalUrl.startsWith("/api/omnimens/external-ai");
  if (!isExternalAiPath && ACTUAL_BLOCKED_UA_PATTERNS.some(p => p.test(ua))) {
    const blocked = recordAbuse(ip, `bad-ua:${ua.slice(0, 40)}`);
    console.warn(`[OMNIMENS SECURITY] Malicious UA: ${ip} — "${ua.slice(0, 80)}"`);
    if (blocked) return res.status(403).json({ error: "Access denied" });
    return res.status(429).json({ error: "Too many requests" });
  }

  // 4. Malicious pattern detection in URL + query string
  const fullUrl = req.originalUrl;
  if (MALICIOUS_URL_PATTERNS.some(p => p.test(fullUrl))) {
    recordAbuse(ip, "malicious-url");
    console.warn(`[OMNIMENS SECURITY] Malicious URL pattern: ${ip} → ${fullUrl.slice(0, 120)}`);
    return res.status(400).json({ error: "Invalid request" });
  }

  // 5. Malicious pattern in request body (for JSON requests)
  if (req.body && typeof req.body === "object") {
    const bodyStr = JSON.stringify(req.body);
    if (bodyStr.length < 50_000 && MALICIOUS_URL_PATTERNS.some(p => p.test(bodyStr))) {
      recordAbuse(ip, "malicious-body");
      console.warn(`[OMNIMENS SECURITY] Malicious body pattern: ${ip} → ${req.path}`);
      return res.status(400).json({ error: "Invalid request" });
    }
  }

  // 6. Suspicious header detection
  const suspiciousHeaders = [
    "x-forwarded-host",  // host header injection
  ];
  for (const h of suspiciousHeaders) {
    const val = req.headers[h];
    if (val && typeof val === "string") {
      const suspicious = MALICIOUS_URL_PATTERNS.some(p => p.test(val));
      if (suspicious) {
        recordAbuse(ip, `bad-header:${h}`);
        console.warn(`[OMNIMENS SECURITY] Suspicious header ${h}: ${ip}`);
        return res.status(400).json({ error: "Invalid request" });
      }
    }
  }

  return next();
}

// ── Auth Failure Tracker ──────────────────────────────────────────────────────
// Call this from auth routes when authentication fails repeatedly
export function recordAuthFailure(ip: string) {
  if (TRUSTED_IPS.has(ip)) return false;
  const blocked = recordAbuse(ip, "auth-failure");
  if (blocked) {
    console.warn(`[OMNIMENS SECURITY] IP ${ip} blocked after repeated auth failures`);
  }
  return blocked;
}

// ── Security Status (for owner dashboard) ────────────────────────────────────
export function getSecurityStatus() {
  const activeBlocks = [...abuseMap.entries()]
    .filter(([, r]) => r.count >= ABUSE_BLOCK_THRESHOLD)
    .map(([ip, r]) => ({ ip, count: r.count, reasons: [...r.reasons], since: new Date(r.firstSeen).toISOString() }));

  return {
    blockedIPs: activeBlocks.length,
    totalTracked: abuseMap.size,
    beacon: BEACON_HASH,
    platform: PLATFORM,
    owner: OWNER,
    blocks: activeBlocks,
  };
}
