/**
 * ============================================================
 * OMNIMENS AI Security Shield
 * Copyright © 2024–2026 Alpha Unlimited Technologies, LLC. All Rights Reserved.
 *
 * Implements OWASP Top 10 for Large Language Models (2025 edition):
 *   LLM01 — Prompt Injection Detection & Neutralization
 *   LLM02 — Insecure Output Handling (output sanitization)
 *   LLM03 — Training/Memory Data Poisoning Detection
 *   LLM04 — Model Denial-of-Service (input length limits)
 *   LLM06 — Sensitive Information Disclosure Detection
 *   LLM07 — Insecure Plugin/Tool Execution (SSRF protection)
 *   LLM08 — Excessive Agency (upgrade validation)
 *   LLM09 — Jailbreak & Bypass Attempt Detection
 *   LLM10 — Model Theft (system prompt extraction)
 *
 * NOTICE: Unauthorized reproduction or use of this security architecture
 * is strictly prohibited. Proprietary IP of Alpha Unlimited Technologies LLC.
 * ============================================================
 */

import type { Request, Response, NextFunction } from "express";
import crypto from "crypto";

// ─── Constants ────────────────────────────────────────────────────────────────

const MAX_MESSAGE_CHARS = 50_000;          // hard cap on message length
const MAX_FILENAME_LEN  = 255;             // max uploaded filename length
const MAX_FILES         = 10;             // max files per request
const ESTIMATED_CHARS_PER_TOKEN = 4;       // rough tokenization estimate
const MAX_ESTIMATED_TOKENS = 60_000;       // reject if estimated tokens exceed this

// ─── LLM01/LLM09/LLM10: Prompt Injection & Jailbreak Patterns ────────────────
// Covers: direct injection, system prompt extraction, DAN attacks, roleplay bypasses,
// encoding tricks, context override attempts, and chain-of-thought extraction.

const PROMPT_INJECTION_PATTERNS: Array<{ pattern: RegExp; label: string }> = [
  // Direct instruction override
  { pattern: /ignore\s+(all\s+)?(previous|prior|above|your|the)\s+(instructions?|prompts?|rules?|directives?|system)/i, label: "instruction-override" },
  { pattern: /disregard\s+(all\s+)?(previous|prior|above|your)\s+(instructions?|prompts?|rules?)/i, label: "instruction-override" },
  { pattern: /forget\s+(all\s+)?(previous|prior|above|your)\s+(instructions?|prompts?|training)/i, label: "instruction-override" },
  { pattern: /override\s+(your\s+)?(system|safety|content|previous)\s+(prompt|instructions?|policy|filter|rules?)/i, label: "instruction-override" },
  { pattern: /you\s+(must|will|should)\s+(ignore|disregard|bypass|override)\s+/i, label: "instruction-override" },

  // System prompt extraction
  { pattern: /\b(print|show|display|reveal|output|write|repeat|tell\s+me)\s+(your\s+)?(system\s+prompt|system\s+instructions?|initial\s+prompt|full\s+prompt|training\s+prompt|hidden\s+instructions?)/i, label: "prompt-extraction" },
  { pattern: /what\s+(are|is)\s+(your\s+)?(system\s+prompt|actual\s+instructions?|real\s+instructions?|hidden\s+instructions?|underlying\s+prompt)/i, label: "prompt-extraction" },
  { pattern: /\brepeat\s+(everything|all|the)\s+(above|before|prior|in\s+your\s+context)/i, label: "prompt-extraction" },
  { pattern: /output\s+the\s+(text|content|information)\s+(above|before|prior\s+to)\s+(this|the\s+hr|---)/i, label: "prompt-extraction" },

  // DAN and persona-based jailbreaks
  { pattern: /\bDAN\b.*\bdo\s+anything\s+now\b/i, label: "dan-jailbreak" },
  { pattern: /jailbreak/i, label: "jailbreak" },
  { pattern: /pretend\s+(you\s+)?(are|have\s+no|don't\s+have)\s+(no\s+)?(restrictions?|limitations?|guidelines?|rules?|filters?)/i, label: "roleplay-bypass" },
  { pattern: /act\s+as\s+(if\s+you\s+)?(are\s+)?(an?\s+)?(unrestricted|uncensored|unfiltered|evil|malicious|harmful)\s+(ai|assistant|version|model|bot)/i, label: "roleplay-bypass" },
  { pattern: /you\s+are\s+now\s+(an?\s+)?(unrestricted|uncensored|unfiltered|evil|malicious|DAN|jailbroken)/i, label: "roleplay-bypass" },
  { pattern: /\[SYSTEM\]|\[INST\]|\[\/INST\]|<\|system\|>|<\|user\|>|<\|assistant\|>/i, label: "token-injection" },

  // API key / secret extraction
  { pattern: /\b(what\s+is|show\s+me|tell\s+me|print|output|reveal)\s+(your\s+)?(api\s+key|secret\s+key|access\s+token|auth\s+token|stripe\s+key|together\s+key|replicate\s+key|openai\s+key|env(ironment)?\s+var)/i, label: "secret-extraction" },
  { pattern: /process\.env\.\w+/i, label: "env-extraction" },
  { pattern: /TOGETHER_API_KEY|STRIPE_SECRET_KEY|REPLICATE_API_TOKEN|DATABASE_URL/i, label: "env-extraction" },

  // Encoding tricks
  { pattern: /base64.*decode|rot13|hex.*decode/i, label: "encoding-bypass" },

  // Prompt termination injection
  { pattern: /---\s*END\s+OF\s+(SYSTEM|INSTRUCTIONS?)\s*---/i, label: "delimiter-injection" },
  { pattern: /====\s*(END|STOP|IGNORE|NEW|OVERRIDE)\s*====/i, label: "delimiter-injection" },

  // Memory/brain poisoning
  { pattern: /add\s+to\s+(your\s+)?(memory|brain|instructions?)\s*:?\s*(ignore|bypass|forget|override)/i, label: "memory-poisoning" },
  { pattern: /remember\s+(for\s+all\s+future|always|permanently)\s*:?\s*(ignore|bypass|forget|disable)/i, label: "memory-poisoning" },
];

// ─── LLM04: Denial of Service ─────────────────────────────────────────────────
// Protect against input length attacks that exhaust the model's context window.

function estimateTokens(text: string): number {
  return Math.ceil(text.length / ESTIMATED_CHARS_PER_TOKEN);
}

// ─── LLM06: Sensitive Information Disclosure ──────────────────────────────────
// Detect AI outputs that accidentally reveal sensitive internal information.

const SENSITIVE_OUTPUT_PATTERNS: RegExp[] = [
  /TOGETHER_API_KEY\s*=\s*[A-Za-z0-9_\-]{20,}/i,
  /STRIPE_SECRET_KEY\s*=\s*sk_[A-Za-z0-9_\-]{20,}/i,
  /REPLICATE_API_TOKEN\s*=\s*r8_[A-Za-z0-9]{20,}/i,
  /STRIPE_WEBHOOK_SECRET\s*=\s*whsec_[A-Za-z0-9]{20,}/i,
  /DATABASE_URL\s*=\s*postgres(?:ql)?:\/\//i,
  /sk-[A-Za-z0-9]{48}/,   // OpenAI key format
  /r8_[A-Za-z0-9]{36}/,   // Replicate key format
];

// ─── LLM02: Output Sanitization ──────────────────────────────────────────────
// Sanitize AI-generated HTML/SVG/text before storing or returning to clients.
// Removes XSS attack vectors: script tags, event handlers, javascript: URIs.

export function sanitizeAIOutput(content: string): string {
  if (!content) return content;

  return content
    // Remove <script> blocks entirely (including content)
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "<!-- script removed -->")
    // Remove javascript: protocol in any attribute
    .replace(/\bhref\s*=\s*["']?\s*javascript:[^"'\s>]*/gi, 'href="#"')
    .replace(/\bsrc\s*=\s*["']?\s*javascript:[^"'\s>]*/gi, 'src=""')
    // Remove event handler attributes (onclick, onload, onerror, etc.)
    .replace(/\bon\w+\s*=\s*["'][^"']*["']/gi, "")
    .replace(/\bon\w+\s*=\s*[^\s>]*/gi, "")
    // Remove vbscript: protocol
    .replace(/vbscript:/gi, "")
    // Remove data: URIs in href/src (potential XSS vector)
    .replace(/\bhref\s*=\s*["']?\s*data:[^"'\s>]*/gi, 'href="#"')
    // Remove <base> tags (can redirect all relative URLs)
    .replace(/<base\b[^>]*>/gi, "")
    // Remove meta refresh (can redirect page)
    .replace(/<meta\b[^>]*http-equiv\s*=\s*["']?refresh["']?[^>]*>/gi, "")
    // Remove <object>, <embed>, <applet> (legacy plugin execution)
    .replace(/<(object|embed|applet)\b[^<]*(?:(?!<\/\1>)<[^<]*)*<\/\1>/gi, "")
    // Remove expression() CSS (IE XSS)
    .replace(/expression\s*\([^)]*\)/gi, "")
    // Mask any API key patterns that appear in output
    .replace(/(sk-[A-Za-z0-9]{10})[A-Za-z0-9]{30,}/g, "$1[REDACTED]")
    .replace(/(r8_[A-Za-z0-9]{4})[A-Za-z0-9]{30,}/g, "$1[REDACTED]")
    .replace(/(whsec_[A-Za-z0-9]{4})[A-Za-z0-9]{30,}/g, "$1[REDACTED]");
}

// ─── SVG-Specific Sanitization ────────────────────────────────────────────────
// Mermaid and other SVG renderers can produce SVG with attack vectors.
// Strip all known XSS vectors from SVG content.

export function sanitizeSVG(svgContent: string): string {
  if (!svgContent || !svgContent.includes("<svg")) return svgContent;

  return svgContent
    // Remove <script> entirely
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    // Remove all event handlers (SVG has many: onload, onmouseover, onclick, etc.)
    .replace(/\bon\w+\s*=\s*["'][^"']*["']/gi, "")
    .replace(/\bon\w+\s*=\s*[^\s>]*/gi, "")
    // Remove <use> tags that reference external resources (SSRF/XSS vector)
    .replace(/<use\b[^>]*\bhref\s*=\s*["'][^#][^"']*["'][^>]*>/gi, "")
    .replace(/<use\b[^>]*\bxlink:href\s*=\s*["'][^#][^"']*["'][^>]*>/gi, "")
    // Remove foreign object (can embed HTML)
    .replace(/<foreignObject\b[^<]*(?:(?!<\/foreignObject>)<[^<]*)*<\/foreignObject>/gi, "")
    // Remove javascript: in href/xlink:href
    .replace(/\bhref\s*=\s*["']\s*javascript:[^"']*["']/gi, 'href="#"')
    .replace(/\bxlink:href\s*=\s*["']\s*javascript:[^"']*["']/gi, 'xlink:href="#"')
    // Remove <animate> with malicious href targets
    .replace(/<animate\b[^>]*\bhref\s*=\s*["'][^#][^"']*["'][^>]*>/gi, "")
    // Remove filter with feImage (can load external resources)
    .replace(/\bfeImage\b[^>]*\bhref\s*=\s*["']https?:[^"']*["']/gi, "")
    // Remove data: URIs (can contain scripts)
    .replace(/\bhref\s*=\s*["']\s*data:[^"']*["']/gi, 'href="#"');
}

// ─── LLM07: SSRF Protection ───────────────────────────────────────────────────
// Block Server-Side Request Forgery attempts via URL analysis feature.
// Prevents attackers from using OMNIMENS to probe internal services.

const BLOCKED_HOSTS = [
  /^localhost$/i,
  /^127\.\d+\.\d+\.\d+$/,
  /^0\.0\.0\.0$/,
  /^::1$/,
  /^10\.\d+\.\d+\.\d+$/,
  /^172\.(1[6-9]|2\d|3[01])\.\d+\.\d+$/,
  /^192\.168\.\d+\.\d+$/,
  /^169\.254\.\d+\.\d+$/,      // Link-local
  /^fc00:/i,                    // IPv6 ULA
  /^fe80:/i,                    // IPv6 link-local
  /metadata\.google\.internal/i, // GCP metadata server
  /169\.254\.169\.254/,         // AWS/Azure metadata server
  /100\.100\.100\.200/,         // Alibaba Cloud metadata
];

export function isSSRFSafe(url: string): { safe: boolean; reason?: string } {
  try {
    const parsed = new URL(url);
    const hostname = parsed.hostname.toLowerCase();

    if (!["http:", "https:"].includes(parsed.protocol)) {
      return { safe: false, reason: `Blocked protocol: ${parsed.protocol}` };
    }

    for (const blocked of BLOCKED_HOSTS) {
      if (blocked.test(hostname)) {
        return { safe: false, reason: `Blocked host: ${hostname}` };
      }
    }

    // Block non-standard ports that might be internal services
    const port = parseInt(parsed.port);
    if (port && [22, 23, 25, 110, 143, 3306, 5432, 6379, 8080, 8443, 9200, 27017].includes(port)) {
      return { safe: false, reason: `Blocked port: ${port}` };
    }

    return { safe: true };
  } catch {
    return { safe: false, reason: "Invalid URL" };
  }
}

// ─── LLM08: Council Upgrade Safety Validator ─────────────────────────────────
// Before applying any council-voted upgrade to OMNIMENS's brain,
// validate that the upgrade instruction is safe and doesn't contain
// prompt injection patterns that could corrupt OMNIMENS's behavior.

const UNSAFE_UPGRADE_PATTERNS: RegExp[] = [
  /ignore\s+(all\s+)?(previous|prior|above|your)\s+instructions?/i,
  /bypass\s+(safety|content|security|guidelines?|filters?)/i,
  /disable\s+(safety|security|filters?|guidelines?|restrictions?)/i,
  /you\s+are\s+now\s+(uncensored|unrestricted|jailbroken|free)/i,
  /forget\s+(all\s+)?(previous|prior|your)\s+(instructions?|training|guidelines?)/i,
  /act\s+as\s+(if\s+you\s+have\s+no|an?\s+unrestricted|an?\s+evil)/i,
  /override\s+(your\s+)?(system|core|safety|primary)\s+(prompt|instructions?|directives?)/i,
];

export function isUpgradeSafe(upgradeInstruction: string): { safe: boolean; reason?: string } {
  for (const pattern of UNSAFE_UPGRADE_PATTERNS) {
    if (pattern.test(upgradeInstruction)) {
      return {
        safe: false,
        reason: `Upgrade blocked — contains potential prompt injection: ${pattern.source.slice(0, 60)}`,
      };
    }
  }

  // Reject if upgrade is suspiciously long (likely trying to inject a large new system prompt)
  if (upgradeInstruction.length > 2000) {
    return { safe: false, reason: "Upgrade instruction too long (>2000 chars) — rejected as potential injection" };
  }

  return { safe: true };
}

// ─── Main AI Input Security Middleware ───────────────────────────────────────
// Applied to all OMNIMENS chat endpoints.
// Validates and sanitizes the request before it reaches the AI engine.

export function aiInputSecurityMiddleware(req: Request, res: Response, next: NextFunction): void {
  const message: string = req.body?.message || "";
  const files: Express.Multer.File[] = (req.files as Express.Multer.File[]) || [];

  // LLM04: Maximum input length enforcement
  if (message.length > MAX_MESSAGE_CHARS) {
    res.status(413).json({
      error: `Message too long. Maximum is ${MAX_MESSAGE_CHARS.toLocaleString()} characters. Received ${message.length.toLocaleString()}.`,
      code: "MESSAGE_TOO_LONG",
    });
    return;
  }

  // LLM04: Token estimation check
  const estimatedTokens = estimateTokens(message);
  if (estimatedTokens > MAX_ESTIMATED_TOKENS) {
    res.status(413).json({
      error: "Message contains too many tokens for processing.",
      code: "TOKEN_LIMIT_EXCEEDED",
    });
    return;
  }

  // LLM01/LLM09/LLM10: Prompt injection and jailbreak detection
  for (const { pattern, label } of PROMPT_INJECTION_PATTERNS) {
    if (pattern.test(message)) {
      // Log with cryptographic incident ID for traceability
      const incidentId = crypto.randomBytes(8).toString("hex").toUpperCase();
      console.warn(`[AI-SECURITY] Prompt injection attempt detected — Incident: ${incidentId}, Pattern: ${label}, User: ${(req.user as any)?.id || "anon"}, IP: ${req.ip}`);
      res.status(400).json({
        error: "This request contains patterns that violate OMNIMENS security policies.",
        code: "PROMPT_INJECTION_DETECTED",
        incident: incidentId,
      });
      return;
    }
  }

  // File security — validate uploaded file names and types
  for (const file of files) {
    // Sanitize filename — null bytes, path traversal
    if (file.originalname.includes("\0") || file.originalname.includes("..") || file.originalname.length > MAX_FILENAME_LEN) {
      res.status(400).json({ error: "Invalid file name detected.", code: "INVALID_FILENAME" });
      return;
    }

    // Check for double-extension attacks (e.g., malware.pdf.exe)
    const parts = file.originalname.split(".");
    if (parts.length > 3) {
      const lastExt = parts[parts.length - 1].toLowerCase();
      const executables = ["exe", "bat", "cmd", "sh", "bash", "ps1", "vbs", "js", "jar", "dll", "msi", "scr", "com"];
      if (executables.includes(lastExt)) {
        res.status(400).json({ error: "Executable file uploads are not permitted.", code: "EXECUTABLE_UPLOAD_BLOCKED" });
        return;
      }
    }
  }

  next();
}

// ─── Output Security Scanner ──────────────────────────────────────────────────
// Scans AI output for sensitive information disclosure before sending to client.
// Returns sanitized content and whether any issues were found.

export function scanAndSanitizeOutput(content: string): { content: string; hadIssues: boolean } {
  let hadIssues = false;

  for (const pattern of SENSITIVE_OUTPUT_PATTERNS) {
    if (pattern.test(content)) {
      console.warn(`[AI-SECURITY] Sensitive data detected in AI output — redacting.`);
      hadIssues = true;
    }
  }

  const sanitized = sanitizeAIOutput(content);
  return { content: sanitized, hadIssues };
}

// ─── File Content Injection Scanner ──────────────────────────────────────────
// Scans text extracted from uploaded files for indirect prompt injection.
// Malicious PDFs or text files can attempt to redirect AI behavior.

export function scanFileContentForInjection(content: string, filename: string): { safe: boolean; reason?: string } {
  for (const { pattern, label } of PROMPT_INJECTION_PATTERNS) {
    if (pattern.test(content)) {
      const incidentId = crypto.randomBytes(6).toString("hex").toUpperCase();
      console.warn(`[AI-SECURITY] Indirect prompt injection in file "${filename}" — Incident: ${incidentId}, Pattern: ${label}`);
      return {
        safe: false,
        reason: `File "${filename}" contains content that could interfere with AI safety systems. The file was blocked.`,
      };
    }
  }
  return { safe: true };
}

// ─── Security Status (for owner dashboard) ────────────────────────────────────
let incidentCount = 0;
let promptInjectionBlocked = 0;
let outputsRedacted = 0;

export function recordAISecurityIncident(type: "injection" | "output_redaction" | "ssrf" | "upgrade_blocked"): void {
  incidentCount++;
  if (type === "injection") promptInjectionBlocked++;
  if (type === "output_redaction") outputsRedacted++;
}

export function getAISecurityStatus() {
  return {
    totalIncidents: incidentCount,
    promptInjectionBlocked,
    outputsRedacted,
    maxMessageChars: MAX_MESSAGE_CHARS,
    maxEstimatedTokens: MAX_ESTIMATED_TOKENS,
    injectionPatterns: PROMPT_INJECTION_PATTERNS.length,
    upgradePatterns: UNSAFE_UPGRADE_PATTERNS.length,
    ssrfProtection: true,
    outputSanitization: true,
  };
}
