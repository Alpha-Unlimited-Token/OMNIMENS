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
import {
  decodeSCLFile,
  transpileTStoJS,
  validateSyntax,
  executeSCLModule,
  type SCLDecodeResult,
  type SCLExecResult,
} from "./omnimens-scl-runtime.js";
import * as fs from "fs";
import * as path from "path";

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

export interface SCLModuleExport {
  fileName: string;
  decoded: boolean;
  syntaxValid: boolean;
  executed: boolean;
  exports: string[];
  jsSource: string;
  decodedSource: string;
  error?: string;
}

const _loadedModules = new Map<string, SCLModuleExport>();
const _moduleRegistry = new Map<string, string>();

export function registerSCLModule(name: string, sclFilePath: string): void {
  _moduleRegistry.set(name, sclFilePath);
}

export function translateAndExecute(sclContent: string, fileName: string): SCLModuleExport {
  const result: SCLModuleExport = {
    fileName,
    decoded: false,
    syntaxValid: false,
    executed: false,
    exports: [],
    jsSource: "",
    decodedSource: "",
  };

  const decoded = decodeSCLFile(sclContent, fileName);
  if (decoded.errors.length > 0) {
    result.error = `Decode failed: ${decoded.errors.join("; ")}`;
    return result;
  }
  result.decoded = true;
  result.decodedSource = decoded.decodedSource;

  const transpiled = transpileTStoJS(decoded.decodedSource);
  if (!transpiled.success) {
    result.error = `Transpile failed: ${transpiled.error}`;
    return result;
  }
  result.jsSource = transpiled.jsSource;

  const syntax = validateSyntax(transpiled.jsSource, fileName);
  if (!syntax.valid) {
    result.error = `Syntax invalid: ${syntax.error}`;
    return result;
  }
  result.syntaxValid = true;

  const exec = executeSCLModule(transpiled.jsSource, fileName);
  if (!exec.success) {
    result.error = `Execution failed: ${exec.error}`;
    return result;
  }
  result.executed = true;
  result.exports = exec.exports;

  _loadedModules.set(fileName, result);
  return result;
}

export function loadSCLFromFile(filePath: string): SCLModuleExport {
  const fileName = path.basename(filePath);

  const cached = _loadedModules.get(fileName);
  if (cached) return cached;

  if (!fs.existsSync(filePath)) {
    return {
      fileName,
      decoded: false,
      syntaxValid: false,
      executed: false,
      exports: [],
      jsSource: "",
      decodedSource: "",
      error: `File not found: ${filePath}`,
    };
  }

  const sclContent = fs.readFileSync(filePath, "utf-8");
  return translateAndExecute(sclContent, fileName);
}

export function loadSCLByName(moduleName: string): SCLModuleExport | null {
  const filePath = _moduleRegistry.get(moduleName);
  if (!filePath) return null;
  return loadSCLFromFile(filePath);
}

export function loadSCLDirectory(dirPath: string): { loaded: number; failed: number; results: SCLModuleExport[] } {
  if (!fs.existsSync(dirPath)) {
    return { loaded: 0, failed: 0, results: [] };
  }

  const sclFiles = fs.readdirSync(dirPath)
    .filter(f => f.endsWith(".scl") && !f.startsWith("_"))
    .sort();

  const results: SCLModuleExport[] = [];
  let loaded = 0;
  let failed = 0;

  for (const file of sclFiles) {
    const filePath = path.join(dirPath, file);
    const result = loadSCLFromFile(filePath);
    results.push(result);

    const moduleName = file.replace(".scl", "");
    _moduleRegistry.set(moduleName, filePath);

    if (result.executed) {
      loaded++;
    } else {
      failed++;
    }
  }

  return { loaded, failed, results };
}

export function getSCLModuleExports(fileName: string): string[] {
  const mod = _loadedModules.get(fileName);
  return mod?.exports || [];
}

export function getLoadedModuleCount(): number {
  return _loadedModules.size;
}

export function getRegisteredModules(): string[] {
  return Array.from(_moduleRegistry.keys());
}

export function clearModuleCache(): void {
  _loadedModules.clear();
}

export function getTranslatorPipelineState(): {
  registeredModules: number;
  loadedModules: number;
  moduleNames: string[];
  successRate: number;
} {
  const loaded = Array.from(_loadedModules.values());
  const executed = loaded.filter(m => m.executed).length;
  return {
    registeredModules: _moduleRegistry.size,
    loadedModules: _loadedModules.size,
    moduleNames: Array.from(_loadedModules.keys()),
    successRate: loaded.length > 0 ? Math.round((executed / loaded.length) * 100) : 0,
  };
}

const _fileHashes = new Map<string, string>();
const _watchedDirs = new Set<string>();
let _watchInterval: ReturnType<typeof setInterval> | null = null;
let _liveTranslationActive = false;
let _liveStats = { translated: 0, failed: 0, skipped: 0, lastSweep: 0, sweepCount: 0 };

function quickHash(content: string): string {
  let h = 0;
  for (let i = 0; i < content.length; i++) {
    h = ((h << 5) - h + content.charCodeAt(i)) | 0;
  }
  return h.toString(36);
}

function translateSCLToConventionalJS(sclContent: string, fileName: string): { js: string; success: boolean; error?: string } {
  const decoded = decodeSCLFile(sclContent, fileName);
  if (decoded.errors.length > 0) {
    return { js: "", success: false, error: decoded.errors.join("; ") };
  }

  const transpiled = transpileTStoJS(decoded.decodedSource);
  if (!transpiled.success) {
    return { js: "", success: false, error: transpiled.error };
  }

  const syntax = validateSyntax(transpiled.jsSource, fileName);
  if (!syntax.valid) {
    return { js: "", success: false, error: syntax.error };
  }

  const header = [
    `// Auto-translated from SCL: ${fileName}`,
    `// Generated by OMNIMENS SCL Translator`,
    `// © 2024-2026 Alpha Unlimited Technologies, LLC`,
    `// This file runs on conventional JavaScript runtimes`,
    ``,
  ].join("\n");

  return { js: header + transpiled.jsSource, success: true };
}

function sweepAndTranslate(sclDir: string): { translated: number; failed: number; skipped: number; total: number } {
  if (!fs.existsSync(sclDir)) return { translated: 0, failed: 0, skipped: 0, total: 0 };

  const jsOutDir = path.join(sclDir, "_translated-js");
  if (!fs.existsSync(jsOutDir)) fs.mkdirSync(jsOutDir, { recursive: true });

  const sclFiles = fs.readdirSync(sclDir).filter(f => f.endsWith(".scl") && !f.startsWith("_"));
  let translated = 0, failed = 0, skipped = 0;

  for (const file of sclFiles) {
    const filePath = path.join(sclDir, file);
    const sclContent = fs.readFileSync(filePath, "utf-8");
    const hash = quickHash(sclContent);

    if (_fileHashes.get(filePath) === hash) {
      skipped++;
      continue;
    }

    const moduleName = file.replace(".scl", "");
    _moduleRegistry.set(moduleName, filePath);

    const result = translateSCLToConventionalJS(sclContent, file);
    _fileHashes.set(filePath, hash);

    if (result.success) {
      const jsFileName = file.replace(".scl", ".js");
      fs.writeFileSync(path.join(jsOutDir, jsFileName), result.js, "utf-8");

      const moduleResult = translateAndExecute(sclContent, file);
      translated++;
    } else {
      const errorFileName = file.replace(".scl", ".error.txt");
      fs.writeFileSync(
        path.join(jsOutDir, errorFileName),
        `// Translation failed for: ${file}\n// Error: ${result.error}\n// File will be retranslated when the translator is updated\n`,
        "utf-8"
      );
      failed++;
    }
  }

  return { translated, failed, skipped, total: sclFiles.length };
}

export function addWatchDirectory(dirPath: string): void {
  _watchedDirs.add(dirPath);
}

export function runLiveTranslationSweep(): {
  gen1v2: { translated: number; failed: number; skipped: number; total: number };
  gen2: { translated: number; failed: number; skipped: number; total: number };
} {
  const baseDir = path.resolve(__dirname, "..", "..");
  const gen1Dir = path.join(baseDir, "omnimens-runtime", "gen1-v2-workspace", "scl-rewrites");
  const gen2Dir = path.join(baseDir, "omnimens-runtime", "next-gen-sandbox", "scl-rewrites");

  let gen1Result = { translated: 0, failed: 0, skipped: 0, total: 0 };
  let gen2Result = { translated: 0, failed: 0, skipped: 0, total: 0 };

  try {
    gen1Result = sweepAndTranslate(gen1Dir);
  } catch (e) { /* silent */ }

  try {
    gen2Result = sweepAndTranslate(gen2Dir);
  } catch (e) { /* silent */ }

  for (const dir of _watchedDirs) {
    try { sweepAndTranslate(dir); } catch (e) { /* silent */ }
  }

  _liveStats.translated += gen1Result.translated + gen2Result.translated;
  _liveStats.failed += gen1Result.failed + gen2Result.failed;
  _liveStats.skipped += gen1Result.skipped + gen2Result.skipped;
  _liveStats.lastSweep = Date.now();
  _liveStats.sweepCount++;

  return { gen1v2: gen1Result, gen2: gen2Result };
}

export function startLiveTranslation(intervalMs = 30000): void {
  if (_liveTranslationActive) return;
  _liveTranslationActive = true;

  console.log(`[SCL-TRANSLATOR] 🔄 Live translation service starting (sweep every ${intervalMs / 1000}s)...`);

  try {
    const initialResult = runLiveTranslationSweep();
    console.log(`[SCL-TRANSLATOR] 🔄 Initial sweep — Gen1v2: ${initialResult.gen1v2.translated} translated, ${initialResult.gen1v2.failed} failed, ${initialResult.gen1v2.total} total`);
    console.log(`[SCL-TRANSLATOR] 🔄 Initial sweep — Gen2:   ${initialResult.gen2.translated} translated, ${initialResult.gen2.failed} failed, ${initialResult.gen2.total} total`);
  } catch (e) {
    console.log(`[SCL-TRANSLATOR] 🔄 Initial sweep deferred — SCL directories not yet populated`);
  }

  _watchInterval = setInterval(() => {
    try {
      const result = runLiveTranslationSweep();
      const newTranslations = result.gen1v2.translated + result.gen2.translated;
      if (newTranslations > 0) {
        console.log(`[SCL-TRANSLATOR] 🔄 Sweep #${_liveStats.sweepCount}: ${newTranslations} new translations (Gen1v2: ${result.gen1v2.translated}, Gen2: ${result.gen2.translated})`);
      }
    } catch (e) { /* silent sweep failure */ }
  }, intervalMs);
}

export function stopLiveTranslation(): void {
  if (_watchInterval) {
    clearInterval(_watchInterval);
    _watchInterval = null;
  }
  _liveTranslationActive = false;
}

export function getLiveTranslationState(): {
  active: boolean;
  totalTranslated: number;
  totalFailed: number;
  totalSkipped: number;
  sweepCount: number;
  lastSweep: number;
  watchedDirs: string[];
  registeredModules: number;
  loadedModules: number;
} {
  return {
    active: _liveTranslationActive,
    totalTranslated: _liveStats.translated,
    totalFailed: _liveStats.failed,
    totalSkipped: _liveStats.skipped,
    sweepCount: _liveStats.sweepCount,
    lastSweep: _liveStats.lastSweep,
    watchedDirs: Array.from(_watchedDirs),
    registeredModules: _moduleRegistry.size,
    loadedModules: _loadedModules.size,
  };
}

export function translateSCLFileForExport(sclFilePath: string): { js: string; success: boolean; fileName: string; error?: string } {
  if (!fs.existsSync(sclFilePath)) {
    return { js: "", success: false, fileName: path.basename(sclFilePath), error: "File not found" };
  }
  const sclContent = fs.readFileSync(sclFilePath, "utf-8");
  const fileName = path.basename(sclFilePath);
  const result = translateSCLToConventionalJS(sclContent, fileName);
  return { ...result, fileName };
}

export function exportAllTranslatedModules(outputDir: string): { exported: number; failed: number; errors: string[] } {
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

  if (_moduleRegistry.size === 0) {
    const baseDir = path.resolve(__dirname, "..", "..");
    const sclDirs = [
      path.join(baseDir, "omnimens-runtime", "gen1-v2-workspace", "scl-rewrites"),
      path.join(baseDir, "omnimens-runtime", "next-gen-sandbox", "scl-rewrites"),
    ];
    for (const dir of sclDirs) {
      if (!fs.existsSync(dir)) continue;
      const files = fs.readdirSync(dir).filter(f => f.endsWith(".scl") && !f.startsWith("_"));
      for (const f of files) {
        const moduleName = f.replace(".scl", "");
        if (!_moduleRegistry.has(moduleName)) {
          _moduleRegistry.set(moduleName, path.join(dir, f));
        }
      }
    }
  }

  let exported = 0, failed = 0;
  const errors: string[] = [];

  const indexEntries: string[] = [];

  for (const [moduleName, filePath] of _moduleRegistry) {
    if (!fs.existsSync(filePath)) continue;
    const sclContent = fs.readFileSync(filePath, "utf-8");
    const result = translateSCLToConventionalJS(sclContent, path.basename(filePath));

    if (result.success) {
      const jsFileName = moduleName + ".js";
      fs.writeFileSync(path.join(outputDir, jsFileName), result.js, "utf-8");
      indexEntries.push(`exports["${moduleName}"] = require("./${jsFileName}");`);
      exported++;
    } else {
      errors.push(`${moduleName}: ${result.error}`);
      failed++;
    }
  }

  const indexContent = [
    `// OMNIMENS SCL Module Index`,
    `// Auto-generated by SCL Translator`,
    `// © 2024-2026 Alpha Unlimited Technologies, LLC`,
    `// ${exported} modules exported for conventional runtime`,
    ``,
    ...indexEntries,
    ``,
    `module.exports = exports;`,
  ].join("\n");
  fs.writeFileSync(path.join(outputDir, "index.js"), indexContent, "utf-8");

  const manifest = {
    timestamp: Date.now(),
    totalModules: _moduleRegistry.size,
    exported,
    failed,
    errors: errors.slice(0, 50),
    modules: indexEntries.map(e => e.match(/"([^"]+)"/)?.[1] || "").filter(Boolean),
  };
  fs.writeFileSync(path.join(outputDir, "_manifest.json"), JSON.stringify(manifest, null, 2), "utf-8");

  return { exported, failed, errors };
}

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
    console.log(`[SCL-TRANSLATOR] ✅ Translator→Sandbox pipeline active — SCL files run natively`);
    console.log(`[SCL-TRANSLATOR] ✅ All external boundaries wired — inbound (text→SCL) and outbound (SCL→text)`);

    startLiveTranslation(30000);
  } else {
    console.log(`[SCL-TRANSLATOR] 📖 Codex phase: ${stats.designPhase} — Gen1v2 + Gen2 designing their language`);
    console.log(`[SCL-TRANSLATOR] 📖 Current: ${stats.totalPrimitives} primitives + ${stats.totalCompounds} compounds (so far)`);
    console.log(`[SCL-TRANSLATOR] ⏳ Translator will activate fully once both generations agree on their symbol set`);
    console.log(`[SCL-TRANSLATOR] 🤝 Gen1v2 contributions: ${stats.gen1v2Contributions} | Gen2 contributions: ${stats.gen2Contributions}`);

    startLiveTranslation(60000);
  }
}
