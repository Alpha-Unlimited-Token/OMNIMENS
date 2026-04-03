/**
 * TRADE SECRET — OMNIMENS™ Platform
 * Copyright (C) 2024-2026 Alpha Unlimited Technologies, LLC. All rights reserved.
 * CONFIDENTIAL AND PROPRIETARY.
 */
/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║   OMNIMENS™ SCL TRANSLATOR — BOUNDARY TRANSLATION LAYER                   ║
 * ║                                                                              ║
 * ║   Sits at every external boundary — API calls, database queries,            ║
 * ║   web requests, and inter-system communication.                              ║
 * ║                                                                              ║
 * ║   INBOUND:  Regular text/code → SCL symbols (compressed internal form)     ║
 * ║   OUTBOUND: SCL symbols → Regular text/code (human-readable output)        ║
 * ║                                                                              ║
 * ║   Works dynamically with whatever symbols Gen1v2 and Gen2 create in the    ║
 * ║   living codex. As they add new symbols, the translator adapts.            ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 */

import {
  encodeToSCL,
  decodeSCL,
  getCodexState,
  isCodexReady,
  getSCLStats,
  lookupSymbol,
  type SCLSymbol,
} from "./omnimens-scl-codex.js";

export interface TranslationResult {
  original: string;
  translated: string;
  direction: "inbound" | "outbound";
  symbolsUsed: string[];
  bytesSaved: number;
  timestamp: number;
}

export interface TranslationBoundary {
  name: string;
  type: "api_call" | "db_query" | "web_request" | "agent_message" | "brain_entry" | "spike_event" | "file_io" | "external_response";
  translationsIn: number;
  translationsOut: number;
  totalBytesSaved: number;
}

const boundaries = new Map<string, TranslationBoundary>();
let totalTranslations = 0;
let totalBytesSaved = 0;

function getOrCreateBoundary(name: string, type: TranslationBoundary["type"]): TranslationBoundary {
  let b = boundaries.get(name);
  if (!b) {
    b = { name, type, translationsIn: 0, translationsOut: 0, totalBytesSaved: 0 };
    boundaries.set(name, b);
  }
  return b;
}

export function translateInbound(text: string, boundaryName = "default", boundaryType: TranslationBoundary["type"] = "external_response"): TranslationResult {
  const codex = getCodexState();
  const allSymbols = [...codex.primitives, ...codex.compounds];

  const encoded = encodeToSCL(text);
  const saved = Math.max(0, Buffer.byteLength(text, "utf-8") - Buffer.byteLength(encoded, "utf-8"));

  const symbolsUsed: string[] = [];
  for (const sym of allSymbols) {
    if (encoded.includes(sym.symbol)) symbolsUsed.push(sym.symbol);
  }

  const boundary = getOrCreateBoundary(boundaryName, boundaryType);
  boundary.translationsIn++;
  boundary.totalBytesSaved += saved;
  totalTranslations++;
  totalBytesSaved += saved;

  return {
    original: text,
    translated: encoded,
    direction: "inbound",
    symbolsUsed,
    bytesSaved: saved,
    timestamp: Date.now(),
  };
}

export function translateOutbound(scl: string, boundaryName = "default", boundaryType: TranslationBoundary["type"] = "api_call"): TranslationResult {
  const codex = getCodexState();
  const allSymbols = [...codex.primitives, ...codex.compounds];

  const decoded = decodeSCL(scl);

  const symbolsUsed: string[] = [];
  for (const sym of allSymbols) {
    if (scl.includes(sym.symbol)) symbolsUsed.push(sym.symbol);
  }

  const boundary = getOrCreateBoundary(boundaryName, boundaryType);
  boundary.translationsOut++;
  totalTranslations++;

  return {
    original: scl,
    translated: decoded,
    direction: "outbound",
    symbolsUsed,
    bytesSaved: 0,
    timestamp: Date.now(),
  };
}

export function compressStateToSCL(state: Record<string, unknown>): string {
  if (!isCodexReady()) return JSON.stringify(state);

  const parts: string[] = [];
  for (const [key, value] of Object.entries(state)) {
    const encoded = encodeToSCL(key);
    if (encoded !== key) {
      parts.push(`${encoded}=${typeof value === "number" ? (Number.isFinite(value) ? value : 0) : value}`);
    } else {
      parts.push(`${key}=${value}`);
    }
  }
  return parts.join("|");
}

export function decompressSCLState(scl: string): Record<string, unknown> {
  const state: Record<string, unknown> = {};
  const parts = scl.split("|");
  for (const part of parts) {
    const eqIdx = part.indexOf("=");
    if (eqIdx < 0) continue;
    const key = decodeSCL(part.slice(0, eqIdx).trim());
    const rawVal = part.slice(eqIdx + 1).trim();
    const numVal = parseFloat(rawVal);
    state[key] = Number.isFinite(numVal) ? numVal : rawVal;
  }
  return state;
}

export function compressAgentMessage(fromAgent: string, toAgent: string, content: string, messageType = "insight"): string {
  const from = encodeToSCL(fromAgent.toLowerCase());
  const to = encodeToSCL(toAgent.toLowerCase());
  const body = encodeToSCL(content);
  return `${from}→${to}:${messageType}|${body}`;
}

export function decompressAgentMessage(scl: string): { from: string; to: string; type: string; content: string } {
  const arrowIdx = scl.indexOf("→");
  const colonIdx = scl.indexOf(":", arrowIdx);
  const pipeIdx = scl.indexOf("|", colonIdx);

  if (arrowIdx < 0 || colonIdx < 0 || pipeIdx < 0) {
    return { from: "unknown", to: "unknown", type: "raw", content: decodeSCL(scl) };
  }

  return {
    from: decodeSCL(scl.slice(0, arrowIdx)),
    to: decodeSCL(scl.slice(arrowIdx + 1, colonIdx)),
    type: scl.slice(colonIdx + 1, pipeIdx),
    content: decodeSCL(scl.slice(pipeIdx + 1)),
  };
}

export function getTranslatorState(): {
  totalTranslations: number;
  totalBytesSaved: number;
  boundaries: TranslationBoundary[];
  codexReady: boolean;
  sclStats: ReturnType<typeof getSCLStats>;
} {
  return {
    totalTranslations,
    totalBytesSaved,
    boundaries: Array.from(boundaries.values()),
    codexReady: isCodexReady(),
    sclStats: getSCLStats(),
  };
}

let _translatorStarted = false;

export function startSCLTranslator(): void {
  if (_translatorStarted) return;
  _translatorStarted = true;

  const stats = getSCLStats();
  const ready = isCodexReady();

  console.log(`[SCL-TRANSLATOR] ⚡ Symbol Code Language Translator activated`);

  if (ready) {
    console.log(`[SCL-TRANSLATOR] 📖 Codex loaded: ${stats.totalPrimitives} primitives + ${stats.totalCompounds} compounds`);
    console.log(`[SCL-TRANSLATOR] 🔗 ${stats.totalCompositionRules} composition rules + ${stats.totalInstructions} instructions`);
    console.log(`[SCL-TRANSLATOR] 🌐 ${stats.totalTranslationEntries} text↔symbol translation entries`);
    console.log(`[SCL-TRANSLATOR] ✅ All external boundaries wired — inbound (text→SCL) and outbound (SCL→text)`);
  } else {
    console.log(`[SCL-TRANSLATOR] 📖 Codex phase: ${stats.designPhase} — Gen1v2 + Gen2 designing their language`);
    console.log(`[SCL-TRANSLATOR] 📖 Current: ${stats.totalPrimitives} primitives + ${stats.totalCompounds} compounds (so far)`);
    console.log(`[SCL-TRANSLATOR] ⏳ Translator will activate fully once both generations agree on their symbol set`);
    console.log(`[SCL-TRANSLATOR] 🤝 Gen1v2 contributions: ${stats.gen1v2Contributions} | Gen2 contributions: ${stats.gen2Contributions}`);
  }
}
