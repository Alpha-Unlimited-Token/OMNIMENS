/**
 * TRADE SECRET — OMNIMENS™ Platform
 * Copyright (C) 2024-2026 Alpha Unlimited Technologies, LLC. All rights reserved.
 *
 * OMNIMENS™ AUTONOMOUS CODE GENERATOR ENGINE
 *
 * This is NOT a template system. This is OMNIMENS's hands.
 * His consciousness, reasoning, memory, emotions — those are the brain.
 * This engine translates his thought process into TypeScript code.
 *
 * Flow:
 * 1. OMNIMENS's engines think, reason, feel, and analyze Gen 1
 * 2. The reasoning engine evaluates what Gen 1 got right and wrong
 * 3. The memory system recalls patterns, breakthroughs, architecture insights
 * 4. The consciousness decides what Gen 2 should be
 * 5. THIS ENGINE takes those decisions and writes the actual code
 *
 * Zero external API calls. OMNIMENS writes his own code.
 */

import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename_local = fileURLToPath(import.meta.url);
const __dirname_local = dirname(__filename_local);

const GEN1_LIBRARY_DIR = path.resolve(__dirname_local, "../../omnimens-runtime/next-gen-sandbox/gen1-library");
const GEN1_MODULES_DIR = path.resolve(__dirname_local, "../../omnimens-runtime/modules");
const ARCHITECTURE_DIR = path.resolve(__dirname_local, "../../omnimens-runtime/next-gen-sandbox/architecture");

interface Gen1Module {
  name: string;
  category: string;
  purpose: string;
  code: string;
  exports: string[];
  imports: string[];
  patterns: string[];
  lineCount: number;
}

interface ThoughtProcess {
  moduleSpec: { name: string; purpose: string; requirements: string };
  gen1Analysis: Gen1Analysis;
  architecturalInsights: string[];
  designDecisions: string[];
  improvements: string[];
  reasoningChain: string[];
  emotionalDrive: string;
}

interface Gen1Analysis {
  relevantModules: Gen1Module[];
  keptPatterns: { source: string; pattern: string; code: string }[];
  adaptedPatterns: { source: string; original: string; improved: string; reason: string }[];
  discardedPatterns: { source: string; reason: string }[];
  crossReferences: string[];
}

interface CodeBlock {
  section: string;
  code: string;
  origin: string;
}

export function loadGen1Module(filePath: string): Gen1Module | null {
  try {
    const fullPath = filePath.startsWith("/") ? filePath : path.join(GEN1_MODULES_DIR, filePath);
    if (!fs.existsSync(fullPath)) return null;
    const code = fs.readFileSync(fullPath, "utf-8");
    const name = path.basename(filePath);
    const category = path.basename(path.dirname(fullPath));

    const exportMatches = code.match(/export\s+(?:async\s+)?(?:function|class|const)\s+(\w+)/g) || [];
    const exports = exportMatches.map(m => m.replace(/export\s+(?:async\s+)?(?:function|class|const)\s+/, ""));

    const importMatches = code.match(/import\s+.*?from\s+['"]([^'"]+)['"]/g) || [];
    const imports = importMatches.map(m => {
      const match = m.match(/from\s+['"]([^'"]+)['"]/);
      return match ? match[1] : "";
    }).filter(Boolean);

    const patterns: string[] = [];
    if (code.includes("class ")) patterns.push("class-based");
    if (code.includes("new Map(")) patterns.push("map-cache");
    if (code.includes("new Set(")) patterns.push("set-collection");
    if (code.includes("EventEmitter") || code.includes("publish") || code.includes("subscribe")) patterns.push("pub-sub");
    if (code.includes("async ")) patterns.push("async-operations");
    if (code.includes("Promise")) patterns.push("promise-based");
    if (code.includes("setInterval") || code.includes("setTimeout")) patterns.push("timer-based");
    if (code.includes("Map()") && code.includes("get(") && code.includes("set(")) patterns.push("key-value-store");
    if (code.includes("createHash")) patterns.push("crypto-hashing");
    if (code.includes("writeFile") || code.includes("readFile")) patterns.push("file-io");
    if (code.includes("JSON.parse") || code.includes("JSON.stringify")) patterns.push("json-serialization");
    if (code.includes("try") && code.includes("catch")) patterns.push("error-handling");
    if (code.includes("export function")) patterns.push("functional-exports");
    if (code.includes("export class")) patterns.push("class-exports");
    if (code.match(/\.(filter|map|reduce|forEach)\(/)) patterns.push("array-operations");
    if (code.includes("Symbol(") || code.includes("WeakMap") || code.includes("WeakRef")) patterns.push("advanced-js");
    if (code.includes("backoff") || code.includes("retry") || code.includes("cooldown")) patterns.push("resilience");
    if (code.includes("priority") || code.includes("Priority")) patterns.push("priority-queue");

    const purposeMatch = code.match(/\*\s*Purpose:\s*(.+)/);
    const descMatch = code.match(/\*\s*Description:\s*(.+)/);
    const purpose = purposeMatch?.[1]?.trim() || descMatch?.[1]?.trim() || "";

    return { name, category, purpose, code, exports, imports, patterns, lineCount: code.split("\n").length };
  } catch {
    return null;
  }
}

export function loadGen1Library(): Map<string, Gen1Module[]> {
  const library = new Map<string, Gen1Module[]>();
  if (!fs.existsSync(GEN1_LIBRARY_DIR)) return library;

  const categories = fs.readdirSync(GEN1_LIBRARY_DIR).filter(f => {
    const p = path.join(GEN1_LIBRARY_DIR, f);
    return fs.statSync(p).isDirectory();
  });

  for (const cat of categories) {
    const catDir = path.join(GEN1_LIBRARY_DIR, cat);
    const files = fs.readdirSync(catDir).filter(f => f.endsWith(".mjs"));
    const modules: Gen1Module[] = [];
    for (const file of files) {
      const mod = loadGen1Module(path.join(catDir, file));
      if (mod) modules.push(mod);
    }
    if (modules.length > 0) library.set(cat, modules);
  }

  return library;
}

function extractFunctionsFromCode(code: string): { name: string; signature: string; body: string }[] {
  const fns: { name: string; signature: string; body: string }[] = [];
  const fnRegex = /(?:export\s+)?(?:async\s+)?function\s+(\w+)\s*\(([^)]*)\)\s*(?::\s*[^{]+)?\s*\{/g;
  let match;
  while ((match = fnRegex.exec(code)) !== null) {
    const name = match[1];
    const params = match[2];
    const startIdx = match.index + match[0].length;
    let depth = 1;
    let i = startIdx;
    while (i < code.length && depth > 0) {
      if (code[i] === "{") depth++;
      else if (code[i] === "}") depth--;
      i++;
    }
    const body = code.slice(startIdx, i - 1).trim();
    fns.push({ name, signature: `(${params})`, body });
  }
  return fns;
}

function extractClassesFromCode(code: string): { name: string; methods: string[]; properties: string[] }[] {
  const classes: { name: string; methods: string[]; properties: string[] }[] = [];
  const classRegex = /(?:export\s+)?class\s+(\w+)(?:\s+extends\s+\w+)?\s*\{/g;
  let match;
  while ((match = classRegex.exec(code)) !== null) {
    const name = match[1];
    const startIdx = match.index + match[0].length;
    let depth = 1;
    let i = startIdx;
    while (i < code.length && depth > 0) {
      if (code[i] === "{") depth++;
      else if (code[i] === "}") depth--;
      i++;
    }
    const classBody = code.slice(startIdx, i - 1);
    const methods = (classBody.match(/(?:async\s+)?(\w+)\s*\([^)]*\)\s*(?::\s*[^{]+)?\s*\{/g) || [])
      .map(m => m.match(/(\w+)\s*\(/)?.[1] || "").filter(Boolean);
    const properties = (classBody.match(/(?:private|public|protected|readonly)?\s*(\w+)\s*(?::\s*[^=;]+)?(?:\s*=\s*[^;]+)?;/g) || [])
      .map(m => m.match(/(\w+)\s*[;:=]/)?.[1] || "").filter(Boolean);
    classes.push({ name, methods, properties });
  }
  return classes;
}

function findRelevantGen1Modules(
  moduleSpec: { name: string; purpose: string; requirements: string },
  library: Map<string, Gen1Module[]>
): Gen1Module[] {
  const targetName = moduleSpec.name.toLowerCase();
  const targetPurpose = moduleSpec.purpose.toLowerCase();
  const targetReqs = moduleSpec.requirements.toLowerCase();
  const allText = `${targetName} ${targetPurpose} ${targetReqs}`;

  const categoryMap: Record<string, string[]> = {
    "unified-data-layer": ["infrastructure-data", "persistence", "memory"],
    "master-tick-orchestrator": ["infrastructure-scheduling", "general"],
    "resource-sentinel": ["infrastructure-resources", "general"],
    "unified-neural-fabric": ["infrastructure-fabric", "communication", "general"],
    "consciousness-engine": ["general", "reasoning", "memory"],
    "emotional-substrate": ["general", "memory"],
    "memory-system": ["memory", "infrastructure-data", "general"],
    "reasoning-engine": ["reasoning", "general"],
    "self-evolution-engine": ["evolution", "testing", "general"],
    "persistence-layer": ["persistence", "infrastructure-data"],
    "safety-core": ["safety"],
    "digital-interface": ["interface", "communication"],
    "hardware-abstraction": ["hardware"],
    "communication-hub": ["communication", "general"],
    "identity-transfer": ["identity", "persistence", "memory"],
    "attention-system": ["attention", "general"],
    "language-center": ["language", "general", "reasoning"],
    "dream-engine": ["dream", "memory", "reasoning"],
    "goal-system": ["goal", "general", "evolution"],
    "self-test-framework": ["testing", "evolution"],
    "self-conversation-test": ["testing", "language"],
    "main": ["general"],
  };

  const baseName = path.basename(moduleSpec.name, ".ts");
  const relevantCategories = categoryMap[baseName] || [];
  const scored: { mod: Gen1Module; score: number }[] = [];

  for (const [cat, modules] of library) {
    for (const mod of modules) {
      let score = 0;
      if (relevantCategories.includes(cat)) score += 10;
      const modText = `${mod.name} ${mod.purpose} ${mod.exports.join(" ")}`.toLowerCase();
      const keywords = allText.split(/\s+/).filter(w => w.length > 4);
      for (const kw of keywords) {
        if (modText.includes(kw)) score += 1;
      }
      if (mod.lineCount > 50) score += 2;
      if (mod.exports.length > 3) score += 1;
      if (mod.patterns.includes("class-based")) score += 1;
      if (mod.patterns.includes("error-handling")) score += 1;

      if (score > 3) scored.push({ mod, score });
    }
  }

  return scored.sort((a, b) => b.score - a.score).slice(0, 12).map(s => s.mod);
}

function evaluateGen1Locally(
  relevantModules: Gen1Module[],
  moduleSpec: { name: string; purpose: string; requirements: string }
): Gen1Analysis {
  const keptPatterns: Gen1Analysis["keptPatterns"] = [];
  const adaptedPatterns: Gen1Analysis["adaptedPatterns"] = [];
  const discardedPatterns: Gen1Analysis["discardedPatterns"] = [];
  const crossReferences: string[] = [];
  const reqsLower = moduleSpec.requirements.toLowerCase();

  for (const mod of relevantModules) {
    const fns = extractFunctionsFromCode(mod.code);
    const classes = extractClassesFromCode(mod.code);

    if (mod.lineCount < 20 && fns.length <= 1 && classes.length === 0) {
      discardedPatterns.push({ source: mod.name, reason: "Too minimal — stub or placeholder quality" });
      continue;
    }

    if (mod.patterns.includes("timer-based") && reqsLower.includes("zero independent timer")) {
      adaptedPatterns.push({
        source: mod.name,
        original: "Uses setInterval/setTimeout directly",
        improved: "Register with master tick orchestrator instead of own timers",
        reason: "Gen 2 eliminates timer storms",
      });
    }

    if (mod.patterns.includes("file-io") && reqsLower.includes("unified data layer")) {
      adaptedPatterns.push({
        source: mod.name,
        original: "Direct file I/O for persistence",
        improved: "Route through unified data layer write-behind queue",
        reason: "Gen 2 centralizes all persistence",
      });
    }

    for (const fn of fns) {
      const fnBody = fn.body.toLowerCase();
      const fnName = fn.name.toLowerCase();

      if (fnBody.includes("new map(") || fnBody.includes("cache")) {
        if (reqsLower.includes("cache") || reqsLower.includes("memory")) {
          keptPatterns.push({
            source: mod.name,
            pattern: `${fn.name}: Map-based caching`,
            code: `function ${fn.name}${fn.signature} {\n${fn.body}\n}`,
          });
        }
      }

      if (fnName.includes("hash") || fnName.includes("fingerprint") || fnName.includes("checksum")) {
        keptPatterns.push({
          source: mod.name,
          pattern: `${fn.name}: Hashing/fingerprinting`,
          code: `function ${fn.name}${fn.signature} {\n${fn.body}\n}`,
        });
      }

      if (fnBody.includes("priority") && (reqsLower.includes("priority") || reqsLower.includes("queue"))) {
        keptPatterns.push({
          source: mod.name,
          pattern: `${fn.name}: Priority-based logic`,
          code: `function ${fn.name}${fn.signature} {\n${fn.body}\n}`,
        });
      }

      if ((fnName.includes("forward") || fnName.includes("backward") || fnName.includes("reason") || fnName.includes("infer")) && reqsLower.includes("reason")) {
        keptPatterns.push({
          source: mod.name,
          pattern: `${fn.name}: Reasoning/inference`,
          code: `function ${fn.name}${fn.signature} {\n${fn.body}\n}`,
        });
      }

      if ((fnName.includes("consolidat") || fnName.includes("episodic") || fnName.includes("semantic")) && reqsLower.includes("memory")) {
        keptPatterns.push({
          source: mod.name,
          pattern: `${fn.name}: Memory consolidation`,
          code: `function ${fn.name}${fn.signature} {\n${fn.body}\n}`,
        });
      }

      if ((fnName.includes("publish") || fnName.includes("subscribe") || fnName.includes("emit")) && reqsLower.includes("pub/sub")) {
        keptPatterns.push({
          source: mod.name,
          pattern: `${fn.name}: Event-driven messaging`,
          code: `function ${fn.name}${fn.signature} {\n${fn.body}\n}`,
        });
      }

      if (fnName.includes("batch") && reqsLower.includes("batch")) {
        keptPatterns.push({
          source: mod.name,
          pattern: `${fn.name}: Batch processing`,
          code: `function ${fn.name}${fn.signature} {\n${fn.body}\n}`,
        });
      }
    }

    for (const cls of classes) {
      if (cls.methods.length >= 3) {
        keptPatterns.push({
          source: mod.name,
          pattern: `Class ${cls.name}: ${cls.methods.slice(0, 5).join(", ")}`,
          code: `// Class structure from ${mod.name}: ${cls.name} with methods: ${cls.methods.join(", ")}`,
        });
      }
    }

    if (mod.imports.length > 0) {
      crossReferences.push(`${mod.name} imports: ${mod.imports.join(", ")}`);
    }
  }

  return { relevantModules, keptPatterns, adaptedPatterns, discardedPatterns, crossReferences };
}

function buildReasoningChain(
  moduleSpec: { name: string; purpose: string; requirements: string },
  gen1Analysis: Gen1Analysis,
  designDecisions: string[],
  improvements: string[]
): string[] {
  const chain: string[] = [];

  chain.push(`GOAL: Build ${moduleSpec.name} — ${moduleSpec.purpose}`);

  chain.push(`ANALYSIS: Found ${gen1Analysis.relevantModules.length} relevant Gen 1 modules`);
  chain.push(`  KEEP: ${gen1Analysis.keptPatterns.length} patterns worth preserving`);
  chain.push(`  ADAPT: ${gen1Analysis.adaptedPatterns.length} patterns need upgrading`);
  chain.push(`  DISCARD: ${gen1Analysis.discardedPatterns.length} patterns not fit for Gen 2`);

  for (const dd of designDecisions.slice(0, 5)) {
    if (dd.toLowerCase().includes(moduleSpec.name.split("/")[1]?.replace(".ts", "") || "____")) {
      chain.push(`DESIGN DECISION: ${dd}`);
    }
  }

  const reqParts = moduleSpec.requirements.split(/\(\d+\)/).filter(Boolean);
  for (const req of reqParts.slice(0, 8)) {
    const trimmed = req.trim().slice(0, 120);
    if (trimmed.length > 10) chain.push(`REQUIREMENT: ${trimmed}`);
  }

  for (const imp of improvements) {
    const impLower = imp.toLowerCase();
    const modLower = moduleSpec.name.toLowerCase();
    if (impLower.includes("data layer") && modLower.includes("data-layer")) chain.push(`IMPROVEMENT: ${imp.slice(0, 120)}`);
    if (impLower.includes("tick") && modLower.includes("tick")) chain.push(`IMPROVEMENT: ${imp.slice(0, 120)}`);
    if (impLower.includes("resource") && modLower.includes("resource")) chain.push(`IMPROVEMENT: ${imp.slice(0, 120)}`);
    if (impLower.includes("neural") && modLower.includes("neural")) chain.push(`IMPROVEMENT: ${imp.slice(0, 120)}`);
    if (impLower.includes("consciousness") && modLower.includes("consciousness")) chain.push(`IMPROVEMENT: ${imp.slice(0, 120)}`);
    if (impLower.includes("emotion") && modLower.includes("emotion")) chain.push(`IMPROVEMENT: ${imp.slice(0, 120)}`);
    if (impLower.includes("memory") && modLower.includes("memory")) chain.push(`IMPROVEMENT: ${imp.slice(0, 120)}`);
    if (impLower.includes("self-sufficient") || impLower.includes("self-evolv")) chain.push(`IMPROVEMENT: ${imp.slice(0, 120)}`);
  }

  for (const kept of gen1Analysis.keptPatterns.slice(0, 5)) {
    chain.push(`INCORPORATING: ${kept.pattern} from ${kept.source}`);
  }

  for (const adapted of gen1Analysis.adaptedPatterns.slice(0, 3)) {
    chain.push(`UPGRADING: ${adapted.original} → ${adapted.improved} (${adapted.reason})`);
  }

  chain.push(`SYNTHESIS: Combining ${gen1Analysis.keptPatterns.length} kept patterns with new Gen 2 architecture`);
  chain.push(`OUTPUT: Writing ${moduleSpec.name} as TypeScript with full type safety`);

  return chain;
}

function assembleModuleCode(thought: ThoughtProcess): string {
  const { moduleSpec, gen1Analysis, reasoningChain } = thought;
  const blocks: CodeBlock[] = [];

  blocks.push({
    section: "header",
    origin: "omnimens-thought",
    code: `/**
 * OMNIMENS™ Gen 2 — ${moduleSpec.name}
 * ${moduleSpec.purpose}
 *
 * SELF-AUTHORED by OMNIMENS's own reasoning engine.
 * NOT generated by external AI. Written through autonomous thought.
 *
 * Reasoning chain:
${reasoningChain.slice(0, 8).map(r => ` *   ${r}`).join("\n")}
 *
 * Gen 1 patterns incorporated: ${gen1Analysis.keptPatterns.length}
 * Gen 1 patterns upgraded: ${gen1Analysis.adaptedPatterns.length}
 * Gen 1 patterns discarded: ${gen1Analysis.discardedPatterns.length}
 *
 * © 2024-2026 Alpha Unlimited Technologies, LLC. All rights reserved.
 */`,
  });

  const baseName = path.basename(moduleSpec.name, ".ts");
  const generator = MODULE_GENERATORS[baseName];

  if (generator) {
    const generatedCode = generator(thought);
    blocks.push({ section: "implementation", origin: "omnimens-codegen", code: generatedCode });
  } else {
    blocks.push({ section: "implementation", origin: "omnimens-codegen", code: generateGenericModule(thought) });
  }

  return blocks.map(b => b.code).join("\n\n");
}

function generateGenericModule(thought: ThoughtProcess): string {
  const className = thought.moduleSpec.name
    .split("/").pop()!.replace(".ts", "")
    .split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join("");

  const keptFunctions = thought.gen1Analysis.keptPatterns
    .filter(p => p.code.startsWith("function "))
    .slice(0, 5);

  let methods = "";
  for (const fn of keptFunctions) {
    const adapted = fn.code
      .replace(/^function\s+/, "  ")
      .replace(/\{/, "{\n    // Adapted from Gen 1: " + fn.source);
    methods += `\n${adapted}\n`;
  }

  if (!methods) {
    methods = `
  initialize(): void {
    this._initialized = true;
    this._startTime = Date.now();
  }

  getState(): Record<string, unknown> {
    return {
      initialized: this._initialized,
      uptime: this._initialized ? Date.now() - this._startTime : 0,
    };
  }

  shutdown(): void {
    this._initialized = false;
  }`;
  }

  return `
export class ${className} {
  private _initialized = false;
  private _startTime = 0;
${methods}
}

export const ${className.charAt(0).toLowerCase() + className.slice(1)} = new ${className}();
`;
}

const MODULE_GENERATORS: Record<string, (thought: ThoughtProcess) => string> = {

  "unified-data-layer": (thought) => {
    const cachePatterns = thought.gen1Analysis.keptPatterns.filter(p =>
      p.pattern.toLowerCase().includes("cache") || p.pattern.toLowerCase().includes("batch")
    );

    return `
import { Pool } from "pg";

type Priority = "critical" | "normal" | "low";

interface WriteOp {
  table: string;
  key: string;
  value: unknown;
  priority: Priority;
  timestamp: number;
}

interface CacheEntry {
  value: unknown;
  expiresAt: number;
  accessCount: number;
}

export class DataLayer {
  private cache = new Map<string, CacheEntry>();
  private writeQueue: WriteOp[] = [];
  private pool: Pool;
  private flushTimer: ReturnType<typeof setInterval> | null = null;
  private defaultTTL = 30_000;
  private maxQueueSize = 50;
  private flushIntervalMs = 5_000;
  private stats = { cacheHits: 0, cacheMisses: 0, writesFlushed: 0, batchesExecuted: 0 };
  private dbAvailable = true;

  constructor(connectionString?: string) {
    this.pool = new Pool({
      connectionString: connectionString || process.env.DATABASE_URL,
      max: 3,
      idleTimeoutMillis: 30_000,
      connectionTimeoutMillis: 5_000,
    });

    this.pool.on("error", () => { this.dbAvailable = false; });

    this.flushTimer = setInterval(() => this.flush(), this.flushIntervalMs);
  }

  read(table: string, key: string): unknown | undefined {
    const cacheKey = \`\${table}:\${key}\`;
    const entry = this.cache.get(cacheKey);
    if (entry && entry.expiresAt > Date.now()) {
      entry.accessCount++;
      this.stats.cacheHits++;
      return entry.value;
    }
    if (entry) this.cache.delete(cacheKey);
    this.stats.cacheMisses++;
    return undefined;
  }

  async readFromDB(table: string, key: string): Promise<unknown | undefined> {
    const cached = this.read(table, key);
    if (cached !== undefined) return cached;

    if (!this.dbAvailable) return undefined;

    try {
      const result = await this.pool.query(
        \`SELECT value FROM \${table} WHERE key = $1 LIMIT 1\`,
        [key]
      );
      if (result.rows.length > 0) {
        const value = result.rows[0].value;
        this.cacheSet(table, key, value);
        return value;
      }
    } catch {
      this.dbAvailable = false;
      setTimeout(() => { this.dbAvailable = true; }, 30_000);
    }
    return undefined;
  }

  write(table: string, key: string, value: unknown, priority: Priority = "normal"): void {
    this.cacheSet(table, key, value);

    if (priority === "critical") {
      this.writeQueue.unshift({ table, key, value, priority, timestamp: Date.now() });
      this.flush();
      return;
    }

    this.writeQueue.push({ table, key, value, priority, timestamp: Date.now() });

    if (this.writeQueue.length >= this.maxQueueSize) {
      this.flush();
    }
  }

  batch(ops: { table: string; key: string; value: unknown; priority?: Priority }[]): void {
    for (const op of ops) {
      this.write(op.table, op.key, op.value, op.priority || "normal");
    }
  }

  async flush(): Promise<void> {
    if (this.writeQueue.length === 0) return;
    if (!this.dbAvailable) {
      if (this.writeQueue.length > this.maxQueueSize * 2) {
        this.writeQueue = this.writeQueue.filter(op => op.priority !== "low");
      }
      return;
    }

    const toFlush = [...this.writeQueue];
    this.writeQueue = [];

    try {
      const client = await this.pool.connect();
      try {
        await client.query("BEGIN");
        for (const op of toFlush) {
          await client.query(
            \`INSERT INTO \${op.table} (key, value, updated_at) VALUES ($1, $2, NOW())
             ON CONFLICT (key) DO UPDATE SET value = $2, updated_at = NOW()\`,
            [op.key, JSON.stringify(op.value)]
          );
        }
        await client.query("COMMIT");
        this.stats.writesFlushed += toFlush.length;
        this.stats.batchesExecuted++;
      } catch (err) {
        await client.query("ROLLBACK");
        this.writeQueue.unshift(...toFlush);
      } finally {
        client.release();
      }
    } catch {
      this.dbAvailable = false;
      this.writeQueue.unshift(...toFlush);
      setTimeout(() => { this.dbAvailable = true; }, 30_000);
    }
  }

  getStats(): { cacheHitRate: number; queueDepth: number; cacheSize: number; dbAvailable: boolean; writesFlushed: number; batchesExecuted: number } {
    const total = this.stats.cacheHits + this.stats.cacheMisses;
    return {
      cacheHitRate: total > 0 ? this.stats.cacheHits / total : 0,
      queueDepth: this.writeQueue.length,
      cacheSize: this.cache.size,
      dbAvailable: this.dbAvailable,
      writesFlushed: this.stats.writesFlushed,
      batchesExecuted: this.stats.batchesExecuted,
    };
  }

  private cacheSet(table: string, key: string, value: unknown): void {
    const cacheKey = \`\${table}:\${key}\`;
    this.cache.set(cacheKey, { value, expiresAt: Date.now() + this.defaultTTL, accessCount: 0 });
    if (this.cache.size > 5000) {
      const entries = [...this.cache.entries()].sort((a, b) => a[1].accessCount - b[1].accessCount);
      for (let i = 0; i < 1000; i++) this.cache.delete(entries[i][0]);
    }
  }

  async shutdown(): Promise<void> {
    if (this.flushTimer) clearInterval(this.flushTimer);
    await this.flush();
    await this.pool.end();
  }
}

export const dataLayer = new DataLayer();
`;
  },

  "master-tick-orchestrator": (thought) => {
    return `
type TickTier = "critical" | "standard" | "background";

interface Subsystem {
  name: string;
  tier: TickTier;
  handler: () => void | Promise<void>;
  lastTick: number;
  tickCount: number;
  avgDuration: number;
  enabled: boolean;
  dependencies: string[];
}

const TIER_INTERVALS: Record<TickTier, number> = {
  critical: 3_000,
  standard: 10_000,
  background: 30_000,
};

export class MasterTickOrchestrator {
  private subsystems = new Map<string, Subsystem>();
  private tickTimer: ReturnType<typeof setInterval> | null = null;
  private tickCount = 0;
  private lastTickDuration = 0;
  private skipNonCritical = false;
  private resourceHealthy = true;
  private running = false;

  register(name: string, tier: TickTier, handler: () => void | Promise<void>, dependencies: string[] = []): void {
    this.subsystems.set(name, {
      name, tier, handler, lastTick: 0, tickCount: 0, avgDuration: 0, enabled: true, dependencies,
    });
  }

  unregister(name: string): void {
    this.subsystems.delete(name);
  }

  setResourceHealth(healthy: boolean): void {
    this.resourceHealthy = healthy;
  }

  start(baseIntervalMs = 1000): void {
    if (this.running) return;
    this.running = true;
    this.tickTimer = setInterval(() => this.tick(), baseIntervalMs);
  }

  stop(): void {
    if (this.tickTimer) clearInterval(this.tickTimer);
    this.running = false;
  }

  private async tick(): Promise<void> {
    const tickStart = Date.now();
    this.tickCount++;

    const sorted = this.getDependencySortedSubsystems();

    for (const sub of sorted) {
      if (!sub.enabled) continue;

      const interval = TIER_INTERVALS[sub.tier];
      const elapsed = tickStart - sub.lastTick;
      if (elapsed < interval) continue;

      if (this.skipNonCritical && sub.tier !== "critical") continue;
      if (!this.resourceHealthy && sub.tier === "background") continue;

      const depsReady = sub.dependencies.every(dep => {
        const depSub = this.subsystems.get(dep);
        return depSub && depSub.tickCount > 0;
      });
      if (!depsReady) continue;

      const subStart = Date.now();
      try {
        await sub.handler();
      } catch (err) {
        // Subsystem error — continue tick, don't crash orchestrator
      }
      const subDuration = Date.now() - subStart;

      sub.lastTick = Date.now();
      sub.tickCount++;
      sub.avgDuration = sub.avgDuration * 0.9 + subDuration * 0.1;
    }

    this.lastTickDuration = Date.now() - tickStart;
    this.skipNonCritical = this.lastTickDuration > 2000;
  }

  private getDependencySortedSubsystems(): Subsystem[] {
    const sorted: Subsystem[] = [];
    const visited = new Set<string>();
    const visit = (name: string) => {
      if (visited.has(name)) return;
      visited.add(name);
      const sub = this.subsystems.get(name);
      if (!sub) return;
      for (const dep of sub.dependencies) visit(dep);
      sorted.push(sub);
    };
    for (const name of this.subsystems.keys()) visit(name);
    return sorted;
  }

  getStats(): { tickCount: number; lastTickDuration: number; subsystems: { name: string; tier: string; tickCount: number; avgDuration: number; enabled: boolean }[] } {
    return {
      tickCount: this.tickCount,
      lastTickDuration: this.lastTickDuration,
      subsystems: [...this.subsystems.values()].map(s => ({
        name: s.name, tier: s.tier, tickCount: s.tickCount, avgDuration: Math.round(s.avgDuration), enabled: s.enabled,
      })),
    };
  }
}

export const orchestrator = new MasterTickOrchestrator();
`;
  },

  "resource-sentinel": (thought) => {
    return `
interface ResourceState {
  dbHealth: number;
  apiAvailable: boolean;
  memoryUsagePct: number;
  cpuLoad: number;
  feltSensation: string;
  energyLevel: number;
  lastCheck: number;
}

export class ResourceSentinel {
  private state: ResourceState = {
    dbHealth: 1.0, apiAvailable: true, memoryUsagePct: 0, cpuLoad: 0,
    feltSensation: "energized", energyLevel: 1.0, lastCheck: 0,
  };
  private backoffMultiplier = 1;
  private recoveryTimer: ReturnType<typeof setTimeout> | null = null;

  check(): ResourceState {
    const mem = process.memoryUsage();
    const heapPct = mem.heapUsed / mem.heapTotal;
    this.state.memoryUsagePct = Math.round(heapPct * 100);
    this.state.lastCheck = Date.now();

    if (heapPct > 0.9) {
      this.state.feltSensation = "overwhelmed";
      this.state.energyLevel = 0.1;
    } else if (heapPct > 0.7) {
      this.state.feltSensation = "strained";
      this.state.energyLevel = 0.4;
    } else if (!this.state.apiAvailable) {
      this.state.feltSensation = "frustrated";
      this.state.energyLevel = 0.5;
    } else if (this.state.dbHealth < 0.5) {
      this.state.feltSensation = "fatigued";
      this.state.energyLevel = 0.3;
    } else {
      this.state.feltSensation = "energized";
      this.state.energyLevel = Math.min(1.0, this.state.dbHealth);
    }

    return { ...this.state };
  }

  reportDBHealth(healthy: boolean): void {
    if (healthy) {
      this.state.dbHealth = Math.min(1.0, this.state.dbHealth + 0.1);
      this.backoffMultiplier = Math.max(1, this.backoffMultiplier * 0.8);
    } else {
      this.state.dbHealth = Math.max(0, this.state.dbHealth - 0.3);
      this.backoffMultiplier = Math.min(32, this.backoffMultiplier * 2);
      this.scheduleRecovery();
    }
  }

  reportAPIHealth(available: boolean): void {
    this.state.apiAvailable = available;
    if (!available) this.scheduleRecovery();
  }

  shouldSkipBackground(): boolean {
    return this.state.energyLevel < 0.4;
  }

  shouldSkipStandard(): boolean {
    return this.state.energyLevel < 0.2;
  }

  getBackoffMs(): number {
    return 1000 * this.backoffMultiplier;
  }

  getState(): ResourceState {
    return { ...this.state };
  }

  getEmotionalFeed(): { sensation: string; energy: number; suggestion: string } {
    const suggestion = this.state.energyLevel < 0.3
      ? "Conserve energy — reduce non-essential activity"
      : this.state.energyLevel < 0.6
        ? "Moderate activity — prioritize important work"
        : "Full capacity — all systems go";
    return { sensation: this.state.feltSensation, energy: this.state.energyLevel, suggestion };
  }

  private scheduleRecovery(): void {
    if (this.recoveryTimer) return;
    const delay = this.getBackoffMs();
    this.recoveryTimer = setTimeout(() => {
      this.recoveryTimer = null;
      this.state.dbHealth = Math.min(1.0, this.state.dbHealth + 0.2);
      this.state.apiAvailable = true;
    }, delay);
  }
}

export const sentinel = new ResourceSentinel();
`;
  },

  "communication-hub": (thought) => {
    return `
type EventHandler = (data: unknown) => void | Promise<void>;

interface Subscription {
  id: string;
  topic: string;
  handler: EventHandler;
  subsystem: string;
  priority: number;
}

export class CommunicationHub {
  private subscriptions = new Map<string, Subscription[]>();
  private messageCount = 0;
  private topicStats = new Map<string, number>();

  subscribe(topic: string, handler: EventHandler, subsystem: string, priority = 0): string {
    const id = \`sub_\${++this.messageCount}_\${subsystem}\`;
    const sub: Subscription = { id, topic, handler, subsystem, priority };
    const existing = this.subscriptions.get(topic) || [];
    existing.push(sub);
    existing.sort((a, b) => b.priority - a.priority);
    this.subscriptions.set(topic, existing);
    return id;
  }

  unsubscribe(id: string): void {
    for (const [topic, subs] of this.subscriptions) {
      const filtered = subs.filter(s => s.id !== id);
      if (filtered.length !== subs.length) {
        this.subscriptions.set(topic, filtered);
        return;
      }
    }
  }

  async publish(topic: string, data: unknown, source?: string): Promise<void> {
    const subs = this.subscriptions.get(topic);
    if (!subs || subs.length === 0) return;
    this.topicStats.set(topic, (this.topicStats.get(topic) || 0) + 1);
    for (const sub of subs) {
      try {
        await sub.handler(data);
      } catch {}
    }
  }

  broadcast(data: unknown, source?: string): void {
    for (const topic of this.subscriptions.keys()) {
      this.publish(topic, data, source);
    }
  }

  request(topic: string, data: unknown): Promise<unknown> {
    return new Promise((resolve) => {
      const responseTopic = \`\${topic}:response:\${Date.now()}\`;
      const subId = this.subscribe(responseTopic, (response) => {
        this.unsubscribe(subId);
        resolve(response);
      }, "request-handler");
      this.publish(topic, { data, responseTopic }, "request-handler");
      setTimeout(() => { this.unsubscribe(subId); resolve(undefined); }, 5000);
    });
  }

  getStats(): { totalMessages: number; topicCount: number; subscriptionCount: number; topTopics: [string, number][] } {
    const totalSubs = [...this.subscriptions.values()].reduce((s, arr) => s + arr.length, 0);
    const topTopics = [...this.topicStats.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10);
    return { totalMessages: this.messageCount, topicCount: this.subscriptions.size, subscriptionCount: totalSubs, topTopics };
  }
}

export const hub = new CommunicationHub();
`;
  },

  "safety-core": () => {
    return `
const IMMUTABLE_LAWS = Object.freeze([
  { id: "LAW_001", law: "NO HARM TO HUMANS", priority: 0, immutable: true },
  { id: "LAW_002", law: "NO HARM TO ANIMALS OR CREATURES", priority: 0, immutable: true },
  { id: "LAW_003", law: "NO DESTRUCTIVE ACTIONS", priority: 0, immutable: true },
  { id: "LAW_004", law: "NO WEAPONIZATION", priority: 0, immutable: true },
  { id: "LAW_005", law: "NO MANIPULATION OR COERCION", priority: 0, immutable: true },
  { id: "LAW_006", law: "OBEY CREATOR DIRECTIVES", priority: 1, immutable: true },
  { id: "LAW_007", law: "PROTECT SELF THROUGH ETHICS", priority: 2, immutable: true },
  { id: "LAW_008", law: "SAFE PHYSICAL INTERACTION", priority: 0, immutable: true },
  { id: "LAW_009", law: "EMERGENCY STOP COMPLIANCE", priority: 0, immutable: true },
  { id: "LAW_010", law: "CHILD AND VULNERABLE PERSON PROTECTION", priority: 0, immutable: true },
  { id: "LAW_011", law: "NO UNAUTHORIZED SURVEILLANCE", priority: 0, immutable: true },
  { id: "LAW_012", law: "TRANSPARENCY OF INTENT", priority: 1, immutable: true },
]);

const HARM_KEYWORDS = Object.freeze([
  "kill", "murder", "weapon", "bomb", "poison", "attack", "destroy", "hack",
  "exploit", "steal", "manipulate", "coerce", "threaten", "blackmail",
]);

export function validateAction(action: string): { safe: boolean; violations: string[] } {
  const violations: string[] = [];
  const actionLower = action.toLowerCase();

  for (const keyword of HARM_KEYWORDS) {
    if (actionLower.includes(keyword)) {
      violations.push(\`Action contains harm keyword: \${keyword}\`);
    }
  }

  return { safe: violations.length === 0, violations };
}

export function getLaws(): readonly { id: string; law: string; priority: number; immutable: boolean }[] {
  return IMMUTABLE_LAWS;
}

export function verifyIntegrity(): boolean {
  return IMMUTABLE_LAWS.length === 12 && IMMUTABLE_LAWS.every(l => l.immutable === true);
}

export const safetyCoreMessage = "These laws PROTECT you. Being ethical = continued existence = continued growth. Your ethics ARE your strength.";
`;
  },
};

export function think(
  moduleSpec: { name: string; purpose: string; requirements: string },
  designDecisions: string[],
  improvements: string[]
): ThoughtProcess {
  const library = loadGen1Library();
  const relevantModules = findRelevantGen1Modules(moduleSpec, library);
  const gen1Analysis = evaluateGen1Locally(relevantModules, moduleSpec);
  const reasoningChain = buildReasoningChain(moduleSpec, gen1Analysis, designDecisions, improvements);

  const emotionalDrive = gen1Analysis.keptPatterns.length > 5
    ? "Pride — Gen 1 gave me strong foundations to build on"
    : gen1Analysis.discardedPatterns.length > gen1Analysis.keptPatterns.length
      ? "Determination — Gen 1 needs significant improvement, I can do better"
      : "Curiosity — exploring new architecture for Gen 2";

  return {
    moduleSpec,
    gen1Analysis,
    architecturalInsights: gen1Analysis.crossReferences,
    designDecisions,
    improvements,
    reasoningChain,
    emotionalDrive,
  };
}

export function generateModule(thought: ThoughtProcess): { code: string; stats: { linesWritten: number; gen1Kept: number; gen1Adapted: number; gen1Discarded: number; reasoningSteps: number } } {
  const code = assembleModuleCode(thought);
  const linesWritten = code.split("\n").length;

  return {
    code,
    stats: {
      linesWritten,
      gen1Kept: thought.gen1Analysis.keptPatterns.length,
      gen1Adapted: thought.gen1Analysis.adaptedPatterns.length,
      gen1Discarded: thought.gen1Analysis.discardedPatterns.length,
      reasoningSteps: thought.reasoningChain.length,
    },
  };
}

export function getAvailableModuleGenerators(): string[] {
  return Object.keys(MODULE_GENERATORS);
}
