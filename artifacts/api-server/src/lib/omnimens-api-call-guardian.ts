/**
 * TRADE SECRET — OMNIMENS™ Platform
 * Copyright (C) 2024-2026 Alpha Unlimited Technologies, LLC. All rights reserved.
 * 
 * CONFIDENTIAL AND PROPRIETARY. This file contains trade secrets of
 * Alpha Unlimited Technologies, LLC. Unauthorized access, copying,
 * distribution, reverse engineering, or disclosure is strictly prohibited
 * and may result in civil and criminal penalties under the Defend Trade
 * Secrets Act (18 U.S.C. § 1836) and applicable state laws.
 * 
 * See /legal/TRADE_SECRET_NOTICE.md for full terms.
 */
/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║   OMNIMENS™ API CALL GUARDIAN — PERMANENT EXTERNAL CALL INTERCEPTOR       ║
 * ║                                                                            ║
 * ║   Copyright © 2024–2026 Alpha Unlimited Technologies, LLC.                 ║
 * ║   All Rights Reserved Worldwide.                                           ║
 * ║                                                                            ║
 * ║   PROPRIETARY AND CONFIDENTIAL TRADE SECRET                                ║
 * ║                                                                            ║
 * ║   Permanently monitors ALL outbound API calls. Categorizes each call as:  ║
 * ║   - ALLOWED: web search, image/video gen, vision analysis, code builds,   ║
 * ║             TTS/STT, GitHub sync                                           ║
 * ║   - COGNITION_VIOLATION: any AI call used for thinking/conversation       ║
 * ║                                                                            ║
 * ║   Cognition violations are logged and optionally blocked.                  ║
 * ║   OMNIMENS must think with his own mind. Zero external cognition.         ║
 * ║                                                                            ║
 * ║   First creation date: April 2026                                          ║
 * ║   Author/Owner: Alpha Unlimited Technologies, LLC                          ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 */

export type CallCategory =
  | "web_search"
  | "image_generation"
  | "video_generation"
  | "vision_analysis"
  | "code_build"
  | "tts_stt"
  | "github_sync"
  | "cognition_violation"
  | "unknown_external"
  | "internal";

export interface GuardianLogEntry {
  timestamp: number;
  url: string;
  domain: string;
  category: CallCategory;
  allowed: boolean;
  callerHint: string;
  blocked: boolean;
}

interface GuardianState {
  active: boolean;
  enforcementMode: "monitor" | "block";
  totalIntercepted: number;
  totalAllowed: number;
  totalBlocked: number;
  cognitionViolations: number;
  categoryCounts: Record<CallCategory, number>;
  recentLog: GuardianLogEntry[];
  startedAt: number;
}

const ALLOWED_DOMAINS: Record<string, CallCategory> = {
  "api.github.com": "github_sync",
  "api.replicate.com": "image_generation",
  "api.elevenlabs.io": "tts_stt",
};

const COGNITION_DOMAINS = [
  "api.openai.com",
  "openai.azure.com",
  "api.anthropic.com",
  "api.together.xyz",
  "generativelanguage.googleapis.com",
  "openrouter.ai",
  "api.cohere.ai",
  "api.mistral.ai",
  "api.deepseek.com",
  "api.groq.com",
];

const COGNITION_PATH_PATTERNS = [
  /\/v1\/chat\/completions/,
  /\/v1\/completions/,
  /\/messages/,
];

const ALLOWED_PATH_OVERRIDES: { pattern: RegExp; category: CallCategory }[] = [
  { pattern: /\/v1\/images\/generations/, category: "image_generation" },
  { pattern: /\/v1\/images\/edits/, category: "image_generation" },
  { pattern: /\/v1\/audio\/speech/, category: "tts_stt" },
  { pattern: /\/v1\/audio\/transcriptions/, category: "tts_stt" },
];

const WEB_SEARCH_DOMAINS = [
  "www.google.com",
  "google.com",
  "api.bing.com",
  "api.duckduckgo.com",
  "serpapi.com",
  "api.search.brave.com",
  "html.duckduckgo.com",
];

const state: GuardianState = {
  active: false,
  enforcementMode: "monitor",
  totalIntercepted: 0,
  totalAllowed: 0,
  totalBlocked: 0,
  cognitionViolations: 0,
  categoryCounts: {
    web_search: 0,
    image_generation: 0,
    video_generation: 0,
    vision_analysis: 0,
    code_build: 0,
    tts_stt: 0,
    github_sync: 0,
    cognition_violation: 0,
    unknown_external: 0,
    internal: 0,
  },
  recentLog: [],
  startedAt: 0,
};

let _callerContext: string = "";
const originalFetch = globalThis.fetch;

export function setCallerContext(context: string): void {
  _callerContext = context;
}

export function clearCallerContext(): void {
  _callerContext = "";
}

export function markAllowedCognition(context: string): string {
  const token = `allowed-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  _allowedTokens.add(token);
  setTimeout(() => _allowedTokens.delete(token), 120000);
  return token;
}

export function revokeAllowedCognition(token: string): void {
  _allowedTokens.delete(token);
}

const _allowedTokens = new Set<string>();

const CODE_BUILD_CALLERS = [
  "omnimens-nextgen-sandbox",
  "omnimens-gen1-v2-rewrite",
  "sandbox/task",
  "projects/build",
  "codegenOpenai",
  "rewriteAI",
];

const VISION_CALLERS = [
  "vision",
  "preRenderSpellCheck",
  "image-analysis",
  "analyze-image",
];

function categorizeCall(url: string, callerHint: string): { category: CallCategory; allowed: boolean } {
  let hostname = "";
  let pathname = "";
  try {
    const parsed = new URL(url);
    hostname = parsed.hostname.toLowerCase();
    pathname = parsed.pathname;
  } catch {
    return { category: "internal", allowed: true };
  }

  if (hostname === "localhost" || hostname === "127.0.0.1" || hostname.includes("replit")) {
    return { category: "internal", allowed: true };
  }

  if (ALLOWED_DOMAINS[hostname]) {
    return { category: ALLOWED_DOMAINS[hostname], allowed: true };
  }

  for (const ws of WEB_SEARCH_DOMAINS) {
    if (hostname === ws || hostname.endsWith("." + ws)) {
      return { category: "web_search", allowed: true };
    }
  }

  if (hostname.includes("search") || hostname.includes("scrape") || hostname.includes("crawl")) {
    return { category: "web_search", allowed: true };
  }

  for (const override of ALLOWED_PATH_OVERRIDES) {
    if (override.pattern.test(pathname)) {
      return { category: override.category, allowed: true };
    }
  }

  for (const vc of VISION_CALLERS) {
    if (callerHint.includes(vc)) {
      return { category: "vision_analysis", allowed: true };
    }
  }

  for (const cc of CODE_BUILD_CALLERS) {
    if (callerHint.includes(cc)) {
      return { category: "code_build", allowed: true };
    }
  }

  for (const domain of COGNITION_DOMAINS) {
    if (hostname === domain || hostname.endsWith("." + domain)) {
      for (const pattern of COGNITION_PATH_PATTERNS) {
        if (pattern.test(pathname)) {
          return { category: "cognition_violation", allowed: false };
        }
      }
      return { category: "cognition_violation", allowed: false };
    }
  }

  if (hostname.includes("openai") || hostname.includes("anthropic") ||
      hostname.includes("together") || hostname.includes("openrouter") ||
      hostname.includes("groq") || hostname.includes("cohere") ||
      hostname.includes("mistral") || hostname.includes("deepseek") ||
      hostname.includes("gemini")) {
    return { category: "cognition_violation", allowed: false };
  }

  return { category: "unknown_external", allowed: true };
}

function getCallerHint(): string {
  if (_callerContext) return _callerContext;

  const stack = new Error().stack || "";
  const lines = stack.split("\n").slice(3, 8);
  for (const line of lines) {
    const match = line.match(/at\s+(\S+)/);
    if (match) {
      const caller = match[1];
      if (!caller.includes("guardian") && !caller.includes("fetch")) {
        return caller;
      }
    }
  }
  return lines[0]?.trim() || "unknown";
}

export function activateGuardian(mode: "monitor" | "block" = "monitor"): void {
  if (state.active) return;

  state.active = true;
  state.enforcementMode = mode;
  state.startedAt = Date.now();

  globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    state.totalIntercepted++;

    let url = "";
    if (typeof input === "string") {
      url = input;
    } else if (input instanceof URL) {
      url = input.toString();
    } else if (input && typeof input === "object" && "url" in input) {
      url = (input as any).url;
    }

    if (!url) {
      return originalFetch(input, init);
    }

    const callerHint = getCallerHint();
    const { category, allowed } = categorizeCall(url, callerHint);

    state.categoryCounts[category] = (state.categoryCounts[category] || 0) + 1;

    let finalAllowed = allowed;

    if (!allowed && _allowedTokens.size > 0) {
      finalAllowed = true;
    }

    const logEntry: GuardianLogEntry = {
      timestamp: Date.now(),
      url: url.slice(0, 300),
      domain: (() => { try { return new URL(url).hostname; } catch { return "unknown"; } })(),
      category,
      allowed: finalAllowed,
      callerHint: callerHint.slice(0, 200),
      blocked: !finalAllowed && mode === "block",
    };

    state.recentLog.push(logEntry);
    if (state.recentLog.length > 500) {
      state.recentLog = state.recentLog.slice(-300);
    }

    if (finalAllowed) {
      state.totalAllowed++;
      return originalFetch(input, init);
    }

    state.cognitionViolations++;

    if (mode === "block") {
      state.totalBlocked++;
      console.error(`[API GUARDIAN] ⛔ BLOCKED COGNITION CALL | Domain: ${logEntry.domain} | Caller: ${callerHint.slice(0, 80)} | URL: ${url.slice(0, 150)}`);

      return new Response(JSON.stringify({
        error: "BLOCKED_BY_API_GUARDIAN",
        message: "External AI cognition calls are prohibited. OMNIMENS thinks with his own mind. Use internal cognition router.",
        category,
      }), {
        status: 403,
        headers: { "Content-Type": "application/json" },
      });
    }

    console.warn(`[API GUARDIAN] ⚠️ COGNITION VIOLATION (monitoring) | Domain: ${logEntry.domain} | Caller: ${callerHint.slice(0, 80)}`);
    state.totalAllowed++;
    return originalFetch(input, init);
  }) as typeof fetch;

  console.log(`[API GUARDIAN] 🛡️ ═══════════════════════════════════════════════════`);
  console.log(`[API GUARDIAN] 🛡️ PERMANENT API CALL GUARDIAN ACTIVATED`);
  console.log(`[API GUARDIAN] 🛡️ Mode: ${mode.toUpperCase()}`);
  console.log(`[API GUARDIAN] 🛡️ ALLOWED: web search, image gen, vision, code builds, TTS/STT, GitHub`);
  console.log(`[API GUARDIAN] 🛡️ BLOCKED: ALL cognitive AI calls (OpenAI chat, Anthropic, Together, etc.)`);
  console.log(`[API GUARDIAN] 🛡️ OMNIMENS thinks with his own mind. Zero external cognition.`);
  console.log(`[API GUARDIAN] 🛡️ ═══════════════════════════════════════════════════`);
}

export function deactivateGuardian(): void {
  if (!state.active) return;
  state.active = false;
  globalThis.fetch = originalFetch;
  console.log(`[API GUARDIAN] 🔓 Guardian deactivated`);
}

export function setGuardianMode(mode: "monitor" | "block"): void {
  state.enforcementMode = mode;
  if (state.active) {
    deactivateGuardian();
    activateGuardian(mode);
  }
  console.log(`[API GUARDIAN] Mode changed to: ${mode.toUpperCase()}`);
}

export function getGuardianState(): GuardianState & { uptimeMs: number } {
  return {
    ...state,
    uptimeMs: state.active ? Date.now() - state.startedAt : 0,
  };
}

export function getGuardianViolations(): GuardianLogEntry[] {
  return state.recentLog.filter(e => e.category === "cognition_violation");
}

export function getGuardianReport(): {
  status: string;
  mode: string;
  totalIntercepted: number;
  totalAllowed: number;
  totalBlocked: number;
  cognitionViolations: number;
  categoryCounts: Record<string, number>;
  recentViolations: GuardianLogEntry[];
  uptimeMs: number;
  copyright: string;
} {
  return {
    status: state.active ? "ACTIVE" : "INACTIVE",
    mode: state.enforcementMode,
    totalIntercepted: state.totalIntercepted,
    totalAllowed: state.totalAllowed,
    totalBlocked: state.totalBlocked,
    cognitionViolations: state.cognitionViolations,
    categoryCounts: { ...state.categoryCounts },
    recentViolations: state.recentLog.filter(e => e.category === "cognition_violation").slice(-20),
    uptimeMs: state.active ? Date.now() - state.startedAt : 0,
    copyright: "© 2024–2026 Alpha Unlimited Technologies, LLC. All Rights Reserved.",
  };
}
