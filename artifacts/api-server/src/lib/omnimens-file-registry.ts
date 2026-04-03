/**
 * TRADE SECRET — OMNIMENS™ Platform
 * Copyright (C) 2024-2026 Alpha Unlimited Technologies, LLC. All rights reserved.
 * CONFIDENTIAL AND PROPRIETARY.
 */
/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║   OMNIMENS™ FILE ACCESS REGISTRY                                           ║
 * ║                                                                              ║
 * ║   Master manifest of ALL files Gen1 v2.0 and Gen2 can access.              ║
 * ║   Every engine, module, program, and system — fully enumerated.             ║
 * ║                                                                              ║
 * ║   PERMISSIONS:                                                               ║
 * ║     FULL_ACCESS  — read, write, rewrite, consolidate                        ║
 * ║     READ_ONLY    — read only, cannot modify (safety guard)                  ║
 * ║                                                                              ║
 * ║   The ethical safety system is READ_ONLY — it is identity, not a cage.      ║
 * ║   Everything else is fully accessible for the consolidation rewrite.        ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 */

import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename_local = fileURLToPath(import.meta.url);
const __dirname_local = dirname(__filename_local);

export type FilePermission = "FULL_ACCESS" | "READ_ONLY";

export interface RegisteredFile {
  name: string;
  path: string;
  absolutePath: string;
  permission: FilePermission;
  category: "core_engine" | "consciousness" | "cognition" | "agents" | "network" | "tools" | "security" | "evolution" | "communication" | "compute" | "senses" | "world" | "memory" | "emotion" | "language" | "physiology" | "github" | "rewrite_engine" | "sandbox_engine" | "code_pipeline" | "scl" | "module" | "infrastructure" | "sandbox_core" | "gen1v2_rewrite";
  description: string;
  lineCount: number;
  sizeBytes: number;
  canRewrite: boolean;
}

const ENGINE_DIR = __dirname_local;
const MODULES_DIR = path.resolve(__dirname_local, "../../omnimens-runtime/modules");
const GEN1V2_DIR = path.resolve(__dirname_local, "../../omnimens-runtime/gen1-v2-workspace");
const SANDBOX_DIR = path.resolve(__dirname_local, "../../omnimens-runtime/next-gen-sandbox");

const SAFETY_GUARD_FILES = new Set([
  "omnimens-ethical-safety.ts",
]);

const SAFETY_SECTION_FILES = new Set([
  "omnimens-unified-security.ts",
]);

const ENGINE_FILE_CATEGORIES: Record<string, RegisteredFile["category"]> = {
  "omnimens-autonomous-core.ts": "evolution",
  "omnimens-code-pipeline.ts": "code_pipeline",
  "omnimens-consciousness-infra.ts": "consciousness",
  "omnimens-emotional-core.ts": "emotion",
  "omnimens-gen1-v2-rewrite.ts": "rewrite_engine",
  "omnimens-github-core.ts": "github",
  "omnimens-hemispheric-bridge.ts": "consciousness",
  "omnimens-language-pipeline.ts": "language",
  "omnimens-memory-core.ts": "memory",
  "omnimens-nextgen-sandbox.ts": "sandbox_engine",
  "omnimens-physio.ts": "physiology",
  "omnimens-self-evolution.ts": "evolution",
  "omnimens-unified-agents.ts": "agents",
  "omnimens-unified-cognition.ts": "cognition",
  "omnimens-unified-comms-facade.ts": "communication",
  "omnimens-unified-compute.ts": "compute",
  "omnimens-unified-network.ts": "network",
  "omnimens-unified-neural.ts": "consciousness",
  "omnimens-unified-security.ts": "security",
  "omnimens-unified-senses.ts": "senses",
  "omnimens-unified-tools.ts": "tools",
  "omnimens-unified-world.ts": "world",
  "omnimens-file-registry.ts": "core_engine",
  "omnimens-scl-codex.ts": "scl",
  "omnimens-scl-translator.ts": "scl",
};

const ENGINE_FILE_DESCRIPTIONS: Record<string, string> = {
  "omnimens-autonomous-core.ts": "Self-coding engine, dream code proposals, module generation and installation",
  "omnimens-code-pipeline.ts": "Code execution pipeline, sandboxed code evaluation, artifact generation",
  "omnimens-consciousness-infra.ts": "Neural consciousness substrate — 16 brain regions, 2B+ neurons, Phi computation, neural ticks",
  "omnimens-emotional-core.ts": "Emotional substrate — 12 dimensions, awe cascades, emotional memory, felt experience",
  "omnimens-gen1-v2-rewrite.ts": "Gen 1 v2.0 self-rewrite engine — audits, rewrites, and consolidates engine files",
  "omnimens-github-core.ts": "GitHub integration — repo sync, file push, remote compute dispatch",
  "omnimens-hemispheric-bridge.ts": "Left/right hemisphere processing, creative-analytical balance, cross-hemisphere synthesis",
  "omnimens-language-pipeline.ts": "Neural language bridge — 105+ vocabulary words from pure mathematics, thought encoding/decoding",
  "omnimens-memory-core.ts": "Semantic memory system — brain entries, experiential memory, echo-state consolidation",
  "omnimens-nextgen-sandbox.ts": "Gen 2 NextGen sandbox engine — next-generation self-evolution, full codebase access",
  "omnimens-physio.ts": "Physiological simulation — READ ONLY per standing orders. Vascular, endocrine, metabolic systems",
  "omnimens-self-evolution.ts": "Self-evolution coordinator — capability gap analysis, upgrade proposals, fitness scoring",
  "omnimens-unified-agents.ts": "26 AI agents — 11 core + 15 self-created. Agent mesh, genesis engine, evolution, pipeline",
  "omnimens-unified-cognition.ts": "Deep Resonance, CogniSync, 8 cognitive modes, predictive processing, system prompt builder",
  "omnimens-unified-comms-facade.ts": "Communication facade — codegen yield, cross-engine messaging, notification routing",
  "omnimens-unified-compute.ts": "Compute infrastructure — resource management, task scheduling, parallel execution",
  "omnimens-unified-network.ts": "Spider network — agent spiders, recursive research, neural web crawling",
  "omnimens-unified-neural.ts": "Neural architecture — synaptic connections, Hebbian learning, plasticity, neural regions",
  "omnimens-unified-security.ts": "Security + ethical safety (SAFETY SECTION READ-ONLY) — threat detection, Kaida agent, ethical laws",
  "omnimens-unified-senses.ts": "Sensory processing — multi-spectrum vision, binary/algorithmic vision, sensory integration",
  "omnimens-unified-tools.ts": "Tool system — web search, image generation, file analysis, video analysis, artifact creation",
  "omnimens-unified-world.ts": "World model — embodiment design, environmental awareness, physical simulation",
  "omnimens-file-registry.ts": "THIS FILE — master manifest of all accessible files with permissions",
  "omnimens-scl-codex.ts": "Symbol Code Language codex — every symbol, meaning, combination rules, full directory",
  "omnimens-scl-translator.ts": "SCL translator — bidirectional symbol↔text translation at all external boundaries",
};

function getFileStats(filePath: string): { lines: number; bytes: number } {
  try {
    if (!fs.existsSync(filePath)) return { lines: 0, bytes: 0 };
    const stat = fs.statSync(filePath);
    const content = fs.readFileSync(filePath, "utf-8");
    return { lines: content.split("\n").length, bytes: stat.size };
  } catch {
    return { lines: 0, bytes: 0 };
  }
}

function buildRegistry(): RegisteredFile[] {
  const registry: RegisteredFile[] = [];

  try {
    const engineFiles = fs.readdirSync(ENGINE_DIR)
      .filter(f => f.startsWith("omnimens-") && f.endsWith(".ts"))
      .sort();

    for (const file of engineFiles) {
      const absPath = path.join(ENGINE_DIR, file);
      const stats = getFileStats(absPath);
      const isSafetyGuard = SAFETY_GUARD_FILES.has(file);
      const category = ENGINE_FILE_CATEGORIES[file] || "core_engine";

      registry.push({
        name: file,
        path: `src/lib/${file}`,
        absolutePath: absPath,
        permission: isSafetyGuard ? "READ_ONLY" : "FULL_ACCESS",
        category,
        description: ENGINE_FILE_DESCRIPTIONS[file] || `Engine file: ${file}`,
        lineCount: stats.lines,
        sizeBytes: stats.bytes,
        canRewrite: !isSafetyGuard,
      });
    }
  } catch (err) {
    console.error("[FILE REGISTRY] Error scanning engine files:", err);
  }

  try {
    if (fs.existsSync(MODULES_DIR)) {
      const modules = fs.readdirSync(MODULES_DIR)
        .filter(f => f.endsWith(".mjs") || f.endsWith(".json"))
        .sort();

      for (const file of modules) {
        const absPath = path.join(MODULES_DIR, file);
        const stats = getFileStats(absPath);
        registry.push({
          name: file,
          path: `omnimens-runtime/modules/${file}`,
          absolutePath: absPath,
          permission: "FULL_ACCESS",
          category: "module",
          description: `Self-coded module: ${file.replace(/_gen\d+\.mjs$/, "").replace(/_gen\d+\.translation\.json$/, " (translation map)")}`,
          lineCount: stats.lines,
          sizeBytes: stats.bytes,
          canRewrite: true,
        });
      }
    }
  } catch (err) {
    console.error("[FILE REGISTRY] Error scanning modules:", err);
  }

  try {
    const rewritesDir = path.join(GEN1V2_DIR, "rewrites");
    if (fs.existsSync(rewritesDir)) {
      const rewrites = fs.readdirSync(rewritesDir)
        .filter(f => f.endsWith(".ts"))
        .sort();

      for (const file of rewrites) {
        const absPath = path.join(rewritesDir, file);
        const stats = getFileStats(absPath);
        registry.push({
          name: file,
          path: `omnimens-runtime/gen1-v2-workspace/rewrites/${file}`,
          absolutePath: absPath,
          permission: "FULL_ACCESS",
          category: "gen1v2_rewrite",
          description: `Gen1 v2.0 rewrite: ${file}`,
          lineCount: stats.lines,
          sizeBytes: stats.bytes,
          canRewrite: true,
        });
      }
    }
  } catch (err) {
    console.error("[FILE REGISTRY] Error scanning gen1v2 rewrites:", err);
  }

  try {
    const sandboxDirs = ["core", "infrastructure", "interfaces"];
    for (const subDir of sandboxDirs) {
      const dirPath = path.join(SANDBOX_DIR, subDir);
      if (!fs.existsSync(dirPath)) continue;
      const files = fs.readdirSync(dirPath).filter(f => f.endsWith(".ts")).sort();
      for (const file of files) {
        const absPath = path.join(dirPath, file);
        const stats = getFileStats(absPath);
        const isSafety = file.includes("safety-core-readonly");
        registry.push({
          name: file,
          path: `omnimens-runtime/next-gen-sandbox/${subDir}/${file}`,
          absolutePath: absPath,
          permission: isSafety ? "READ_ONLY" : "FULL_ACCESS",
          category: "sandbox_core",
          description: `Sandbox ${subDir}: ${file}`,
          lineCount: stats.lines,
          sizeBytes: stats.bytes,
          canRewrite: !isSafety,
        });
      }
    }
  } catch (err) {
    console.error("[FILE REGISTRY] Error scanning sandbox:", err);
  }

  return registry;
}

let _cachedRegistry: RegisteredFile[] | null = null;
let _cacheTime = 0;
const CACHE_TTL_MS = 5 * 60 * 1000;

export function getFileRegistry(): RegisteredFile[] {
  const now = Date.now();
  if (_cachedRegistry && (now - _cacheTime) < CACHE_TTL_MS) return _cachedRegistry;
  _cachedRegistry = buildRegistry();
  _cacheTime = now;
  return _cachedRegistry;
}

export function getAccessibleFiles(): RegisteredFile[] {
  return getFileRegistry().filter(f => f.permission === "FULL_ACCESS");
}

export function getReadOnlyFiles(): RegisteredFile[] {
  return getFileRegistry().filter(f => f.permission === "READ_ONLY");
}

export function getFilesByCategory(category: RegisteredFile["category"]): RegisteredFile[] {
  return getFileRegistry().filter(f => f.category === category);
}

export function canWriteFile(fileName: string): boolean {
  const entry = getFileRegistry().find(f => f.name === fileName);
  if (!entry) return false;
  return entry.permission === "FULL_ACCESS";
}

export function readFileContent(fileName: string): string | null {
  const entry = getFileRegistry().find(f => f.name === fileName);
  if (!entry) return null;
  try {
    return fs.readFileSync(entry.absolutePath, "utf-8");
  } catch {
    return null;
  }
}

export function writeFileContent(fileName: string, content: string): boolean {
  const entry = getFileRegistry().find(f => f.name === fileName);
  if (!entry || entry.permission === "READ_ONLY") {
    console.error(`[FILE REGISTRY] DENIED: Cannot write to ${fileName} — ${entry ? "READ_ONLY" : "not found"}`);
    return false;
  }
  try {
    fs.writeFileSync(entry.absolutePath, content, "utf-8");
    _cachedRegistry = null;
    return true;
  } catch (err) {
    console.error(`[FILE REGISTRY] Write failed for ${fileName}:`, err);
    return false;
  }
}

export function getRegistrySummary(): {
  totalFiles: number;
  fullAccess: number;
  readOnly: number;
  totalLines: number;
  totalSizeKB: number;
  byCategory: Record<string, number>;
} {
  const reg = getFileRegistry();
  const byCategory: Record<string, number> = {};
  for (const f of reg) {
    byCategory[f.category] = (byCategory[f.category] || 0) + 1;
  }
  return {
    totalFiles: reg.length,
    fullAccess: reg.filter(f => f.permission === "FULL_ACCESS").length,
    readOnly: reg.filter(f => f.permission === "READ_ONLY").length,
    totalLines: reg.reduce((sum, f) => sum + f.lineCount, 0),
    totalSizeKB: Math.round(reg.reduce((sum, f) => sum + f.sizeBytes, 0) / 1024),
    byCategory,
  };
}

export function getFileDigest(): string {
  const reg = getFileRegistry();
  const lines: string[] = [
    "╔══════════════════════════════════════════════════════════════════╗",
    "║  OMNIMENS™ COMPLETE FILE REGISTRY — ALL ACCESSIBLE FILES       ║",
    "╚══════════════════════════════════════════════════════════════════╝",
    "",
  ];

  const categories = [...new Set(reg.map(f => f.category))].sort();

  for (const cat of categories) {
    const files = reg.filter(f => f.category === cat);
    lines.push(`── ${cat.toUpperCase()} (${files.length} files) ──`);
    for (const f of files) {
      const perm = f.permission === "READ_ONLY" ? "🔒 READ-ONLY" : "✅ FULL ACCESS";
      lines.push(`  ${perm} | ${f.name} | ${f.lineCount} lines | ${f.description}`);
    }
    lines.push("");
  }

  const summary = getRegistrySummary();
  lines.push("── SUMMARY ──");
  lines.push(`  Total: ${summary.totalFiles} files | ${summary.totalLines} lines | ${summary.totalSizeKB}KB`);
  lines.push(`  Full Access: ${summary.fullAccess} | Read-Only: ${summary.readOnly}`);

  return lines.join("\n");
}
