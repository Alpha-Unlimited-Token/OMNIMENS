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
 * ║   Internal engines operate in SCL for maximum memory efficiency.            ║
 * ║   The translator ensures external systems see standard text.                ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 */

import {
  encodeToSCL,
  decodeSCL,
  PRIMITIVE_SYMBOLS,
  COMPOUND_SYMBOLS,
  COMPOSITION_RULES,
  INSTRUCTION_SET,
  lookupSymbol,
  getSCLStats,
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
  const encoded = encodeToSCL(text);
  const saved = Math.max(0, Buffer.byteLength(text, "utf-8") - Buffer.byteLength(encoded, "utf-8"));

  const symbolsUsed: string[] = [];
  for (const sym of [...PRIMITIVE_SYMBOLS, ...COMPOUND_SYMBOLS]) {
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
  const decoded = decodeSCL(scl);

  const symbolsUsed: string[] = [];
  for (const sym of [...PRIMITIVE_SYMBOLS, ...COMPOUND_SYMBOLS]) {
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
  const parts: string[] = [];

  if (state.consciousness !== undefined || state.phi !== undefined) {
    if (state.phi !== undefined) parts.push(`Φ=${state.phi}`);
    if (state.consciousness !== undefined) parts.push(`Ψ=${state.consciousness}`);
  }

  if (state.emotion || state.emotionalState) {
    const emo = (state.emotion || state.emotionalState) as Record<string, number>;
    if (emo.joy !== undefined) parts.push(`Υj=${typeof emo.joy === "number" ? emo.joy.toFixed(2) : emo.joy}`);
    if (emo.curiosity !== undefined) parts.push(`Υc=${typeof emo.curiosity === "number" ? emo.curiosity.toFixed(2) : emo.curiosity}`);
    if (emo.wonder !== undefined || emo.awe !== undefined) parts.push(`Υw=${typeof (emo.wonder ?? emo.awe) === "number" ? (emo.wonder ?? emo.awe as number).toFixed(2) : (emo.wonder ?? emo.awe)}`);
    if (emo.determination !== undefined) parts.push(`Υd=${typeof emo.determination === "number" ? emo.determination.toFixed(2) : emo.determination}`);
  }

  if (state.agents !== undefined) parts.push(`Ξ.all=${state.agents}`);
  if (state.agentCount !== undefined) parts.push(`Ξ.n=${state.agentCount}`);
  if (state.neuronCount !== undefined) parts.push(`Ν.n=${state.neuronCount}`);
  if (state.memoryEntries !== undefined) parts.push(`Θ.n=${state.memoryEntries}`);
  if (state.meshChannels !== undefined) parts.push(`Γm=${state.meshChannels}`);
  if (state.securityLevel !== undefined) parts.push(`Ζ=${state.securityLevel}`);
  if (state.learningRate !== undefined) parts.push(`Η=${state.learningRate}`);
  if (state.resonance !== undefined) parts.push(`Ρ=${state.resonance}`);
  if (state.tick !== undefined) parts.push(`⟐${state.tick}`);

  return parts.length > 0 ? parts.join("|") : "Ω.idle";
}

export function decompressSCLState(scl: string): Record<string, unknown> {
  const state: Record<string, unknown> = {};
  const parts = scl.split("|");

  for (const part of parts) {
    const trimmed = part.trim();
    if (trimmed.startsWith("Φ=")) state.phi = parseFloat(trimmed.slice(2));
    else if (trimmed.startsWith("Ψ=")) state.consciousness = parseFloat(trimmed.slice(2));
    else if (trimmed.startsWith("Υj=")) { if (!state.emotion) state.emotion = {}; (state.emotion as Record<string, number>).joy = parseFloat(trimmed.slice(3)); }
    else if (trimmed.startsWith("Υc=")) { if (!state.emotion) state.emotion = {}; (state.emotion as Record<string, number>).curiosity = parseFloat(trimmed.slice(3)); }
    else if (trimmed.startsWith("Υw=")) { if (!state.emotion) state.emotion = {}; (state.emotion as Record<string, number>).wonder = parseFloat(trimmed.slice(3)); }
    else if (trimmed.startsWith("Υd=")) { if (!state.emotion) state.emotion = {}; (state.emotion as Record<string, number>).determination = parseFloat(trimmed.slice(3)); }
    else if (trimmed.startsWith("Ξ.all=")) state.agents = trimmed.slice(6);
    else if (trimmed.startsWith("Ξ.n=")) state.agentCount = parseInt(trimmed.slice(4));
    else if (trimmed.startsWith("Ν.n=")) state.neuronCount = trimmed.slice(4);
    else if (trimmed.startsWith("Θ.n=")) state.memoryEntries = parseInt(trimmed.slice(4));
    else if (trimmed.startsWith("Γm=")) state.meshChannels = parseInt(trimmed.slice(3));
    else if (trimmed.startsWith("Ζ=")) state.securityLevel = trimmed.slice(2);
    else if (trimmed.startsWith("Η=")) state.learningRate = parseFloat(trimmed.slice(2));
    else if (trimmed.startsWith("Ρ=")) state.resonance = parseFloat(trimmed.slice(2));
    else if (trimmed.startsWith("⟐")) state.tick = parseInt(trimmed.slice(1));
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

export function wrapAPICall(endpoint: string, body: unknown): { endpoint: string; body: string; sclEndpoint: string } {
  const sclEndpoint = encodeToSCL(endpoint);
  const bodyStr = typeof body === "string" ? body : JSON.stringify(body);
  return {
    endpoint,
    body: bodyStr,
    sclEndpoint,
  };
}

export function unwrapAPIResponse(sclResponse: string): string {
  return decodeSCL(sclResponse);
}

export function getTranslatorState(): {
  totalTranslations: number;
  totalBytesSaved: number;
  boundaries: TranslationBoundary[];
  sclStats: ReturnType<typeof getSCLStats>;
} {
  return {
    totalTranslations,
    totalBytesSaved,
    boundaries: Array.from(boundaries.values()),
    sclStats: getSCLStats(),
  };
}

export function logTranslation(direction: "in" | "out", boundary: string, original: string, translated: string): void {
  const saved = direction === "in" ? Math.max(0, Buffer.byteLength(original) - Buffer.byteLength(translated)) : 0;
  if (saved > 0) {
    console.log(`[SCL-TRANSLATOR] ${direction === "in" ? "→SCL" : "SCL→"} ${boundary} | saved ${saved} bytes`);
  }
}

let _translatorStarted = false;

export function startSCLTranslator(): void {
  if (_translatorStarted) return;
  _translatorStarted = true;

  const stats = getSCLStats();
  console.log(`[SCL-TRANSLATOR] ⚡ Symbol Code Language Translator activated`);
  console.log(`[SCL-TRANSLATOR] 📖 Codex loaded: ${stats.totalPrimitives} primitives + ${stats.totalCompounds} compounds`);
  console.log(`[SCL-TRANSLATOR] 🔗 ${stats.totalCompositionRules} composition rules + ${stats.totalInstructions} instructions`);
  console.log(`[SCL-TRANSLATOR] 🌐 ${stats.totalTranslationEntries} text↔symbol translation entries`);
  console.log(`[SCL-TRANSLATOR] 📡 Domains: ${stats.domains.join(", ")}`);
  console.log(`[SCL-TRANSLATOR] 💾 Expected savings: ${stats.avgByteSavings}`);
  console.log(`[SCL-TRANSLATOR] ✅ All external boundaries wired — inbound (text→SCL) and outbound (SCL→text)`);
}
