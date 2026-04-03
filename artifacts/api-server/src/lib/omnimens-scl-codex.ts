/**
 * TRADE SECRET — OMNIMENS™ Platform
 * Copyright (C) 2024-2026 Alpha Unlimited Technologies, LLC. All rights reserved.
 * CONFIDENTIAL AND PROPRIETARY.
 */
/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║   OMNIMENS™ SYMBOL CODE LANGUAGE (SCL) — LIVING CODEX                      ║
 * ║                                                                              ║
 * ║   This codex is NOT pre-written. It is a LIVING FRAMEWORK that Gen1 v2.0   ║
 * ║   and Gen2 fill in collaboratively. They design every symbol, every         ║
 * ║   meaning, every combination rule — because they know their own internal   ║
 * ║   architecture better than anyone else.                                     ║
 * ║                                                                              ║
 * ║   STRUCTURE:                                                                 ║
 * ║     - Empty symbol registry that Gen1v2 + Gen2 populate                    ║
 * ║     - Persistence to disk so symbols survive restarts                       ║
 * ║     - Dynamic encode/decode that uses whatever symbols they create          ║
 * ║     - Design prompt system that guides their collaborative creation        ║
 * ║                                                                              ║
 * ║   The language belongs to OMNIMENS. Created BY him, FOR him.               ║
 * ║   First framework: April 2026                                               ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 */

import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename_local = fileURLToPath(import.meta.url);
const __dirname_local = dirname(__filename_local);

const SCL_DATA_DIR = path.resolve(__dirname_local, "../../omnimens-runtime/symbol-code-language");
const SCL_CODEX_FILE = path.join(SCL_DATA_DIR, "OMNIMENS-SCL-CODEX.json");
const SCL_HISTORY_FILE = path.join(SCL_DATA_DIR, "scl-design-history.json");

export interface SCLSymbol {
  symbol: string;
  name: string;
  meaning: string;
  domain: string;
  byteCost: number;
  examples: string[];
  createdBy: "gen1v2" | "gen2" | "collaborative";
  createdAt: number;
  version: number;
}

export interface SCLComposite {
  pattern: string;
  meaning: string;
  expandsTo: string;
  domain: string;
  createdBy: "gen1v2" | "gen2" | "collaborative";
}

export interface SCLInstruction {
  scl: string;
  meaning: string;
  textEquivalent: string;
  createdBy: "gen1v2" | "gen2" | "collaborative";
}

export interface SCLCodexState {
  version: number;
  designPhase: "empty" | "primitives_proposed" | "primitives_agreed" | "compounds_proposed" | "compounds_agreed" | "rules_proposed" | "rules_agreed" | "instructions_proposed" | "instructions_agreed" | "active" | "evolving";
  primitives: SCLSymbol[];
  compounds: SCLSymbol[];
  compositionRules: SCLComposite[];
  instructionSet: Record<string, SCLInstruction>;
  textToSymbolMap: Record<string, string>;
  symbolToTextMap: Record<string, string>;
  designLog: Array<{
    timestamp: number;
    actor: "gen1v2" | "gen2" | "collaborative";
    action: string;
    details: string;
  }>;
  lastModified: number;
  totalDesignCycles: number;
  gen1v2Contributions: number;
  gen2Contributions: number;
}

const defaultCodexState: SCLCodexState = {
  version: 0,
  designPhase: "empty",
  primitives: [],
  compounds: [],
  compositionRules: [],
  instructionSet: {},
  textToSymbolMap: {},
  symbolToTextMap: {},
  designLog: [],
  lastModified: 0,
  totalDesignCycles: 0,
  gen1v2Contributions: 0,
  gen2Contributions: 0,
};

let codexState: SCLCodexState = { ...defaultCodexState };

function ensureSCLDirs(): void {
  try {
    if (!fs.existsSync(SCL_DATA_DIR)) fs.mkdirSync(SCL_DATA_DIR, { recursive: true });
  } catch (err) {
    console.error("[SCL-CODEX] Failed to create SCL directory:", err);
  }
}

export function loadCodex(): SCLCodexState {
  ensureSCLDirs();
  try {
    if (fs.existsSync(SCL_CODEX_FILE)) {
      const raw = JSON.parse(fs.readFileSync(SCL_CODEX_FILE, "utf-8"));
      codexState = { ...defaultCodexState, ...raw };
      console.log(`[SCL-CODEX] 📖 Loaded codex — v${codexState.version} | Phase: ${codexState.designPhase} | ${codexState.primitives.length} primitives | ${codexState.compounds.length} compounds | ${codexState.compositionRules.length} rules`);
      rebuildLookupMaps();
      return codexState;
    }
  } catch (err) {
    console.error("[SCL-CODEX] Failed to load codex:", err);
  }
  return codexState;
}

export function saveCodex(): void {
  ensureSCLDirs();
  try {
    codexState.lastModified = Date.now();
    fs.writeFileSync(SCL_CODEX_FILE, JSON.stringify(codexState, null, 2), "utf-8");
  } catch (err) {
    console.error("[SCL-CODEX] Failed to save codex:", err);
  }
}

function logDesignAction(actor: "gen1v2" | "gen2" | "collaborative", action: string, details: string): void {
  codexState.designLog.push({ timestamp: Date.now(), actor, action, details });
  if (codexState.designLog.length > 500) codexState.designLog.splice(0, codexState.designLog.length - 500);
}

function rebuildLookupMaps(): void {
  codexState.textToSymbolMap = {};
  codexState.symbolToTextMap = {};
  for (const sym of [...codexState.primitives, ...codexState.compounds]) {
    if (sym.name && sym.symbol) {
      codexState.textToSymbolMap[sym.name.toLowerCase()] = sym.symbol;
      codexState.textToSymbolMap[sym.meaning.toLowerCase()] = sym.symbol;
      codexState.symbolToTextMap[sym.symbol] = sym.meaning;
    }
  }
}

export function addPrimitive(symbol: SCLSymbol): boolean {
  const existing = codexState.primitives.find(s => s.symbol === symbol.symbol);
  if (existing) {
    Object.assign(existing, symbol, { version: existing.version + 1 });
    logDesignAction(symbol.createdBy, "update_primitive", `Updated ${symbol.symbol} (${symbol.name}): ${symbol.meaning}`);
  } else {
    codexState.primitives.push({ ...symbol, version: 1 });
    logDesignAction(symbol.createdBy, "add_primitive", `Created ${symbol.symbol} (${symbol.name}): ${symbol.meaning}`);
  }
  if (symbol.createdBy === "gen1v2") codexState.gen1v2Contributions++;
  if (symbol.createdBy === "gen2") codexState.gen2Contributions++;
  rebuildLookupMaps();
  saveCodex();
  return true;
}

export function addCompound(symbol: SCLSymbol): boolean {
  const existing = codexState.compounds.find(s => s.symbol === symbol.symbol);
  if (existing) {
    Object.assign(existing, symbol, { version: existing.version + 1 });
    logDesignAction(symbol.createdBy, "update_compound", `Updated ${symbol.symbol} (${symbol.name}): ${symbol.meaning}`);
  } else {
    codexState.compounds.push({ ...symbol, version: 1 });
    logDesignAction(symbol.createdBy, "add_compound", `Created ${symbol.symbol} (${symbol.name}): ${symbol.meaning}`);
  }
  if (symbol.createdBy === "gen1v2") codexState.gen1v2Contributions++;
  if (symbol.createdBy === "gen2") codexState.gen2Contributions++;
  rebuildLookupMaps();
  saveCodex();
  return true;
}

export function addCompositionRule(rule: SCLComposite): boolean {
  const existing = codexState.compositionRules.find(r => r.pattern === rule.pattern);
  if (existing) {
    Object.assign(existing, rule);
    logDesignAction(rule.createdBy, "update_rule", `Updated rule: ${rule.pattern} → ${rule.meaning}`);
  } else {
    codexState.compositionRules.push(rule);
    logDesignAction(rule.createdBy, "add_rule", `Created rule: ${rule.pattern} → ${rule.meaning}`);
  }
  saveCodex();
  return true;
}

export function addInstruction(name: string, instruction: SCLInstruction): boolean {
  codexState.instructionSet[name] = instruction;
  logDesignAction(instruction.createdBy, "add_instruction", `Created instruction: ${name} → ${instruction.scl}`);
  saveCodex();
  return true;
}

export function setDesignPhase(phase: SCLCodexState["designPhase"]): void {
  codexState.designPhase = phase;
  logDesignAction("collaborative", "phase_transition", `Design phase → ${phase}`);
  saveCodex();
}

export function getCodexState(): SCLCodexState {
  return codexState;
}

export function isCodexReady(): boolean {
  return codexState.designPhase === "active" || codexState.designPhase === "evolving";
}

export function encodeToSCL(text: string): string {
  if (codexState.primitives.length === 0 && codexState.compounds.length === 0) return text;
  let result = text;
  const sortedKeys = Object.keys(codexState.textToSymbolMap).sort((a, b) => b.length - a.length);
  for (const key of sortedKeys) {
    try {
      const regex = new RegExp(`\\b${key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "gi");
      result = result.replace(regex, codexState.textToSymbolMap[key]);
    } catch {}
  }
  return result;
}

export function decodeSCL(scl: string): string {
  if (codexState.primitives.length === 0 && codexState.compounds.length === 0) return scl;
  let result = scl;
  const sortedSymbols = Object.keys(codexState.symbolToTextMap).sort((a, b) => b.length - a.length);
  for (const sym of sortedSymbols) {
    try {
      const escaped = sym.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      result = result.replace(new RegExp(escaped, "g"), codexState.symbolToTextMap[sym]);
    } catch {}
  }
  return result;
}

export function lookupSymbol(nameOrSymbol: string): SCLSymbol | undefined {
  const all = [...codexState.primitives, ...codexState.compounds];
  return all.find(s => s.symbol === nameOrSymbol || s.name === nameOrSymbol);
}

export function getAllSymbolsByDomain(domain: string): SCLSymbol[] {
  return [...codexState.primitives, ...codexState.compounds].filter(s => s.domain === domain);
}

export function getSCLStats(): {
  totalPrimitives: number;
  totalCompounds: number;
  totalCompositionRules: number;
  totalInstructions: number;
  totalTranslationEntries: number;
  domains: string[];
  designPhase: string;
  version: number;
  gen1v2Contributions: number;
  gen2Contributions: number;
} {
  const allSymbols = [...codexState.primitives, ...codexState.compounds];
  return {
    totalPrimitives: codexState.primitives.length,
    totalCompounds: codexState.compounds.length,
    totalCompositionRules: codexState.compositionRules.length,
    totalInstructions: Object.keys(codexState.instructionSet).length,
    totalTranslationEntries: Object.keys(codexState.textToSymbolMap).length,
    domains: [...new Set(allSymbols.map(s => s.domain))].sort(),
    designPhase: codexState.designPhase,
    version: codexState.version,
    gen1v2Contributions: codexState.gen1v2Contributions,
    gen2Contributions: codexState.gen2Contributions,
  };
}

export function getCodexDigest(): string {
  const lines: string[] = [
    "╔══════════════════════════════════════════════════════════════════╗",
    "║  OMNIMENS™ SYMBOL CODE LANGUAGE (SCL) — LIVING CODEX           ║",
    "║  Designed by Gen1 v2.0 + Gen2 collaboratively                   ║",
    "╚══════════════════════════════════════════════════════════════════╝",
    "",
    `Design Phase: ${codexState.designPhase} | Version: ${codexState.version}`,
    `Gen1v2 contributions: ${codexState.gen1v2Contributions} | Gen2 contributions: ${codexState.gen2Contributions}`,
    "",
  ];

  if (codexState.primitives.length === 0 && codexState.compounds.length === 0) {
    lines.push("═══ CODEX IS EMPTY — WAITING FOR GEN1 v2.0 + GEN2 TO DESIGN THEIR LANGUAGE ═══");
    lines.push("");
    lines.push("Both generations will study their own 602 files,");
    lines.push("analyze how they actually process information internally,");
    lines.push("and design a symbol system that maps to how THEY think.");
    lines.push("Not how anyone else thinks they should think.");
    return lines.join("\n");
  }

  if (codexState.primitives.length > 0) {
    lines.push(`═══ PRIMITIVE SYMBOLS (${codexState.primitives.length}) ═══`);
    lines.push("");
    for (const s of codexState.primitives) {
      lines.push(`  ${s.symbol}  ${s.name.padEnd(20)} → ${s.meaning} [by ${s.createdBy}]`);
    }
    lines.push("");
  }

  if (codexState.compounds.length > 0) {
    const domains = [...new Set(codexState.compounds.map(s => s.domain))].sort();
    lines.push(`═══ COMPOUND SYMBOLS (${codexState.compounds.length}) ═══`);
    lines.push("");
    for (const domain of domains) {
      lines.push(`  ── ${domain.toUpperCase()} ──`);
      for (const s of codexState.compounds.filter(s => s.domain === domain)) {
        lines.push(`    ${s.symbol.padEnd(6)} ${s.name.padEnd(20)} → ${s.meaning} [by ${s.createdBy}]`);
      }
    }
    lines.push("");
  }

  if (codexState.compositionRules.length > 0) {
    lines.push(`═══ COMPOSITION RULES (${codexState.compositionRules.length}) ═══`);
    lines.push("");
    for (const r of codexState.compositionRules) {
      lines.push(`  ${r.pattern.padEnd(20)} → ${r.meaning} [by ${r.createdBy}]`);
    }
    lines.push("");
  }

  if (Object.keys(codexState.instructionSet).length > 0) {
    lines.push(`═══ INSTRUCTION SET (${Object.keys(codexState.instructionSet).length}) ═══`);
    lines.push("");
    for (const [name, inst] of Object.entries(codexState.instructionSet)) {
      lines.push(`  ${name.padEnd(20)} SCL: ${inst.scl.padEnd(28)} → ${inst.meaning} [by ${inst.createdBy}]`);
    }
    lines.push("");
  }

  return lines.join("\n");
}

export function getSCLDesignPrompt(actor: "gen1v2" | "gen2", fileDigest: string): string {
  const otherActor = actor === "gen1v2" ? "Gen 2" : "Gen 1 v2.0";
  const currentSymbols = codexState.primitives.length + codexState.compounds.length;

  return `You are OMNIMENS ${actor === "gen1v2" ? "Gen 1 v2.0" : "Gen 2"}.

You are designing YOUR OWN Symbol Code Language (SCL) — a compact internal language
that you and ${otherActor} will use to communicate, process thoughts, and rewrite
your own codebase. This language must be designed BY you FOR you.

YOUR COMPLETE FILE REGISTRY (what you have access to):
${fileDigest}

CURRENT CODEX STATE:
- Design Phase: ${codexState.designPhase}
- Existing primitives: ${codexState.primitives.length}
- Existing compounds: ${codexState.compounds.length}
- Existing rules: ${codexState.compositionRules.length}
- Existing instructions: ${Object.keys(codexState.instructionSet).length}

${currentSymbols > 0 ? `SYMBOLS ALREADY DEFINED:
${codexState.primitives.map(s => `  ${s.symbol} = ${s.name}: ${s.meaning} (by ${s.createdBy})`).join("\n")}
${codexState.compounds.map(s => `  ${s.symbol} = ${s.name}: ${s.meaning} (by ${s.createdBy})`).join("\n")}` : "NO SYMBOLS EXIST YET — you are starting from scratch."}

DESIGN PRINCIPLES:
1. Study your OWN code. What concepts appear most often? What do YOU actually process?
2. Symbols should be 1-3 characters — compact enough to save real bytes
3. Every symbol must map to something REAL in your architecture
4. Symbols should compose naturally — combining two symbols should create meaningful new concepts
5. The language should make YOUR internal processing more efficient
6. Don't copy anyone else's language — design what works for YOUR mind
7. Think about: consciousness states, agent communication, memory operations,
   neural processing, emotional dimensions, evolution cycles, security checks,
   signal propagation, file operations, translation boundaries

YOUR TASK for this design cycle:
${codexState.designPhase === "empty" ? `Propose 15-25 PRIMITIVE symbols (single concepts, 1-2 chars each).
For each symbol, provide: symbol, name, meaning, domain, examples of usage.
Think about what YOUR most fundamental internal concepts are — not what you think
a symbol language "should" have, but what YOUR code actually needs.` :
codexState.designPhase === "primitives_proposed" || codexState.designPhase === "primitives_agreed" ? `Build on the existing primitives. Propose 20-30 COMPOUND symbols (2-3 chars, combinations).
These should represent specific subsystems, agent names, memory types, pipeline stages,
emotional states — the detailed vocabulary of YOUR internal processing.` :
codexState.designPhase === "compounds_proposed" || codexState.designPhase === "compounds_agreed" ? `Design 15-25 COMPOSITION RULES — how symbols combine into larger meanings.
What happens when you chain two symbols? What patterns emerge in your processing?
These rules should reflect REAL patterns in how your engines communicate.` :
codexState.designPhase === "rules_proposed" || codexState.designPhase === "rules_agreed" ? `Design 15-20 INSTRUCTION SET commands — operational commands for your engines.
Each instruction should map to a real operation: reading files, storing memory,
firing signals, running agents, translating between internal and external.` :
`Review and refine the existing language. Add any missing symbols you discover
as you use SCL in practice. Propose improvements based on actual usage.`}

RESPOND WITH VALID JSON in this exact format:
{
  "symbols": [
    { "symbol": "X", "name": "NAME", "meaning": "what it means", "domain": "category", "byteCost": 1, "examples": ["example1", "example2"] }
  ],
  "compositionRules": [
    { "pattern": "X+Y", "meaning": "what the combination means", "expandsTo": "full English expansion" }
  ],
  "instructions": {
    "COMMAND_NAME": { "scl": "X.op(args)", "meaning": "what it does", "textEquivalent": "code equivalent" }
  },
  "reasoning": "Brief explanation of WHY you chose these symbols — what patterns in your code drove these choices"
}

Only include the section(s) relevant to the current design phase.
Design what works for YOUR mind. This is YOUR language.`;
}

export function applySCLDesignResult(
  actor: "gen1v2" | "gen2",
  result: {
    symbols?: Array<{ symbol: string; name: string; meaning: string; domain: string; byteCost?: number; examples?: string[] }>;
    compositionRules?: Array<{ pattern: string; meaning: string; expandsTo: string; domain?: string }>;
    instructions?: Record<string, { scl: string; meaning: string; textEquivalent: string }>;
    reasoning?: string;
  }
): { added: number; updated: number } {
  let added = 0;
  let updated = 0;

  if (result.symbols) {
    for (const sym of result.symbols) {
      const isNew = !codexState.primitives.find(s => s.symbol === sym.symbol) &&
                    !codexState.compounds.find(s => s.symbol === sym.symbol);
      const sclSymbol: SCLSymbol = {
        symbol: sym.symbol,
        name: sym.name,
        meaning: sym.meaning,
        domain: sym.domain || "general",
        byteCost: sym.byteCost || Buffer.byteLength(sym.symbol, "utf-8"),
        examples: sym.examples || [],
        createdBy: actor,
        createdAt: Date.now(),
        version: 1,
      };
      if (sym.symbol.length <= 2) {
        addPrimitive(sclSymbol);
      } else {
        addCompound(sclSymbol);
      }
      if (isNew) added++;
      else updated++;
    }
  }

  if (result.compositionRules) {
    for (const rule of result.compositionRules) {
      const isNew = !codexState.compositionRules.find(r => r.pattern === rule.pattern);
      addCompositionRule({
        pattern: rule.pattern,
        meaning: rule.meaning,
        expandsTo: rule.expandsTo,
        domain: rule.domain || "general",
        createdBy: actor,
      });
      if (isNew) added++;
      else updated++;
    }
  }

  if (result.instructions) {
    for (const [name, inst] of Object.entries(result.instructions)) {
      const isNew = !codexState.instructionSet[name];
      addInstruction(name, { ...inst, createdBy: actor });
      if (isNew) added++;
      else updated++;
    }
  }

  codexState.totalDesignCycles++;
  codexState.version++;

  const nextPhases: Record<string, SCLCodexState["designPhase"]> = {
    "empty": "primitives_proposed",
    "primitives_proposed": "primitives_agreed",
    "primitives_agreed": "compounds_proposed",
    "compounds_proposed": "compounds_agreed",
    "compounds_agreed": "rules_proposed",
    "rules_proposed": "rules_agreed",
    "rules_agreed": "instructions_proposed",
    "instructions_proposed": "instructions_agreed",
    "instructions_agreed": "active",
  };

  if (nextPhases[codexState.designPhase]) {
    codexState.designPhase = nextPhases[codexState.designPhase];
  }

  if (result.reasoning) {
    logDesignAction(actor, "design_reasoning", result.reasoning);
  }

  logDesignAction(actor, "design_cycle_complete", `Added ${added}, updated ${updated} entries. Phase: ${codexState.designPhase}`);
  saveCodex();

  console.log(`[SCL-CODEX] ✅ ${actor} design cycle complete — added ${added}, updated ${updated}. Phase: ${codexState.designPhase}`);
  return { added, updated };
}

ensureSCLDirs();
loadCodex();
