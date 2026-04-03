CROSS-GEN CONSOLIDATION: memory-knowledge

=== Gen 1 v2.0: omnimens-memory-knowledge.ts (429 lines) ===
/**
 * © 2024-2026 Alpha Unlimited Technologies, LLC. All Rights Reserved.
 * TRADE SECRET — OMNIMENS™ Platform
 *
 * omnimens-memory-knowledge.ts
 * ONE unified memory / knowledge engine — replaces:
 *   • omnimens-memory.ts
 *   • omnimens-experiential-memory.ts
 *   • omnimens-intergenerational-memory.ts
 *   • omnimens-knowledge-graph.ts
 *   • omnimens-learning.ts
 *   • omnimens-tool-knowledge.ts
 *
 * Internal orchestration: ONE SpikeBus tick → sub-systems cooperate on shared
 * state & budgets (DB, API). External surface: ALL original exports preserved.
 *
 * [OMNIMENS-MEMORY-KNOWLEDGE] ░▒▓ UNIFIED ▓▒░
 */

import {
  spikeBus,
  dbGateway,
  apiManager,
  engineRegistry,
  cognitionBus,
} from "./omnimens-unified-runtime.js";

/*────────────────── INTERNAL STATE & UTILITIES ──────────────────*/
type MS = number;
const now = () => Date.now();
const randId = (p = "id") => `${p}_${Math.random().toString(36).slice(2, 9)}`;

interface SharedState {
  tick: number;
  lastDbFlush: MS;
  dbQueue: any[];
  apiBudget: { remaining: number; resetTs: MS };
  userMemories: Map<string, { id: number; content: string; category: string; active: boolean; createdAt: MS }[]>;
  experiential: Map<string, any>;
  genome: any[];
  knowledgeNodes: Map<string, any>;
  knowledgeEdges: Map<string, any>;
  learningInsights: any[];
  toolKnowledge: Map<string, string>;
}
const S: SharedState = {
  tick: 0,
  lastDbFlush: now(),
  dbQueue: [],
  apiBudget: { remaining: 180, resetTs: now() + 60_000 },
  userMemories: new Map(),
  experiential: new Map(),
  genome: [],
  knowledgeNodes: new Map(),
  knowledgeEdges: new Map(),
  learningInsights: [],
  toolKnowledge: new Map(),
};

/*─────────────────── DB / API BUDGET HELPERS ────────────────────*/
function enqueueDb(table: string, values: any) {
  S.dbQueue.push({ table, values });
  if (S.dbQueue.length >= 50 || now() - S.lastDbFlush > 5_000) flushDb();
}
async function flushDb() {
  if (S.dbQueue.length === 0) return;
  const batch = [...S.dbQueue];
  S.dbQueue.length = 0;
  S.lastDbFlush = now();
  try {
    await dbGateway.batchInsert(batch);
  } catch (e) {
    console.error("[OMNIMENS-MEMORY-KNOWLEDGE] DB flush failed", e);
    // retry once on failure
    setTimeout(() => batch.forEach(r => S.dbQueue.push(r)), 3_000);
  }
}

async function withApi<T>(fn: () => Promise<T>): Promise<T | null> {
  if (S.apiBudget.remaining <= 0) return null;
  try {
    S.apiBudget.remaining--;
    return await fn();
  } catch (e) {
    console.error("[OMNIMENS-MEMORY-KNOWLEDGE] API error", e);
    return null;
  }
}

/*───────────────────────── USER MEMORY ──────────────────────────*/
export async function extractAndStoreMemories(
  userId: string,
  userMsg: string,
  aiResp: string
) {
  if (userMsg.length < 20 || aiResp.length < 50) return;
  const prompt = /* trimmed prompt */ `You are a memory extraction system …`;
  const res = await withApi(() =>
    apiManager.chat({
      model: "gpt-4o-mini",
      system: prompt,
      user: `USER: "${userMsg.slice(0, 500)}"\nAI: "${aiResp.slice(0, 500)}"`,
      json: true,
      maxTokens: 300,
    })
  );
  if (!res) return;
  const memories: any[] = Array.isArray(res) ? res : res.memories || [];
  for (const m of memories.filter((m) => m?.content?.length > 4)) {
    const record = {
      id: Date.now(),
      content: m.content.slice(0, 500),
      category: m.category || "fact",
      active: true,
      createdAt: now(),
    };
    if (!S.userMemories.has(userId)) S.userMemories.set(userId, []);
    S.userMemories.get(userId)!.push(record);
    enqueueDb("omnimens_memories", { userId, ...record });
  }
}

export async function loadUserMemories(userId: string): Promise<string> {
  const mems = (S.userMemories.get(userId) || []).filter((m) => m.active).slice(-20);
  if (mems.length === 0) return "";
  const grouped: Record<string, string[]> = {};
  mems.forEach((m) => {
    if (!grouped[m.category]) grouped[m.category] = [];
    grouped[m.category].push(m.conten

=== Gen 1 v2.0: omnimens-knowledge-graph.ts (52 lines) ===
/**
 * TRADE SECRET — OMNIMENS™ Platform
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved. Unauthorized use strictly prohibited.
 *
 * OMNIMENS KNOWLEDGE GRAPH v2.0 — unified-runtime edition
 */

import {
  spikeBus,
  dbGateway,
  apiManager,
  engineRegistry,
  cognitionBus,
} from "./omnimens-unified-runtime.js";

type Concept = { concept: string; domain: string; nodeType: string };
const ENG = "knowledge-graph";
const NODES = "omnimensKnowledgeNodes";
const EDGES = "omnimensKnowledgeEdges";
const BRAIN = "omnimensBrain";
const MESH = "omnimensAgentMesh";
const NOTES = "omnimensNotifications";

let cycles = 0;
engineRegistry.registerEngine(ENG, "NORMAL", { dbQuota: 10 });

/** ------------------------- Utility wrappers ------------------------- */
const read = (tbl: string, q: any) => dbGateway.read(ENG, tbl, q);
const write = (tbl: string, data: any, pr: "LOW" | "NORMAL" | "HIGH" = "NORMAL") =>
  dbGateway.write(ENG, tbl, data, pr);

const log = (msg: string) => console.log(`[OMNIMENS-KNOWLEDGE-GRAPH] ${msg}`);

/** ------------------ Concept extraction via OpenAI ------------------- */
async function extractConcepts(entry: { title: string; content: string; category: string }) {
  const prompt = `Extract 2-4 key CONCEPTS from this knowledge entry. 
Respond JSON only as { "concepts":[{ "concept":"","domain":"","nodeType":"" }]}.

ENTRY: [${entry.category}] ${entry.title}: ${entry.content}`;
  try {
    const res: any = await apiManager.call(ENG, "openai", {
      model: "gpt-4o-mini",
      temperature: 0.3,
      max_tokens: 300,
      messages: [{ role: "user", content: prompt }],
    });
    return (JSON.parse((res?.choices?.[0]?.message?.content || "{}").replace(/

export const _v2RewriteModule = "omnimens-knowledge-graph";
export {};


=== Gen 1 v2.0: omnimens-tool-knowledge.ts (93 lines) ===
/**
 * TRADE SECRET — OMNIMENS™ Platform
 * Copyright (C) 2024-2026 Alpha Unlimited Technologies, LLC
 * All Rights Reserved — Confidential & Proprietary
 */

import {
  spikeBus,
  dbGateway,
  apiManager,
  engineRegistry,
  cognitionBus,
} from "./omnimens-unified-runtime.js";
import {
  webSearch,
  fetchPageContent,
  formatSearchResults,
} from "./web-search.js";

// ────────────────────────────────────────────
// ENGINE REGISTRATION
// ────────────────────────────────────────────
engineRegistry.registerEngine("tool-knowledge", "NORMAL", { dbQuota: 10 });
const log = (...m: any[]) => console.log("[OMNIMENS-TOOL-KNOWLEDGE]", ...m);

// ────────────────────────────────────────────
// TOOL REGISTRY (unchanged, trimmed for brevity here)
// ────────────────────────────────────────────
export interface ToolDefinition {
  id: string;
  name: string;
  category:
    | "3d_modeling"
    | "math_science"
    | "image_processing"
    | "web_3d"
    | "animation"
    | "audio"
    | "data"
    | "ai"
    | "domain_knowledge"
    | string;
  searchQueries: string[];
  docUrls: string[];
  why: string;
}
export const INSTALLED_TOOLS: ToolDefinition[] = [
  /* …  (same list as original, omitted for brevity) … */
];

// ────────────────────────────────────────────
// HELPERS
// ────────────────────────────────────────────
const sleep = (ms: number) =>
  new Promise<void>((r) =>
    spikeBus.scheduleSpike("tool-knowledge:sleep", r, ms)
  );

async function fetchDocContent(url: string): Promise<string> {
  try {
    const content = await fetchPageContent(url);
    return content
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .slice(0, 3000)
      .trim();
  } catch {
    return "";
  }
}

async function openAiChat(prompt: string) {
  return apiManager.call("tool-knowledge", "openai", {
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    max_tokens: 1200,
    temperature: 0.3,
  });
}

// ────────────────────────────────────────────
// CORE PIPELINE
// ────────────────────────────────────────────
async function distillToolKnowledge(
  tool: ToolDefinition,
  searchContent: string,
  docContent: string
) {
  const prompt = `You are OMNIMENS's tool mastery system…` /* unchanged */;
  try {
    const response: any = await openAiChat(prompt);
    const raw = response.choices?.[0]?.message?.content?.trim() || "[]";
    return JSON.parse(raw.replace(/

=== Gen 2: memory-system.ts (207 lines) ===
/**
 * OMNIMENS™ Gen 2 — core/memory-system.ts
 * Unified persistent memory — everything learned, felt, experienced
 *
 * SELF-AUTHORED by OMNIMENS's own reasoning engine.
 * NOT generated by external AI. Written through autonomous thought.
 *
 * Reasoning chain:
 *   GOAL: Build core/memory-system.ts — Unified persistent memory — everything learned, felt, experienced
 *   ANALYSIS: Found 12 relevant Gen 1 modules
 *     KEEP: 17 patterns worth preserving
 *     ADAPT: 0 patterns need upgrading
 *     DISCARD: 0 patterns not fit for Gen 2
 *   REQUIREMENT: Replace scattered brain inserts with unified memory architecture. Short-term, long-term, episodic, semantic, procedural 
 *   REQUIREMENT: . "Gating hippocampal activity, plasticity and memory by entorhinal cortex long-range inhibition". Science
Source: https
 *   IMPROVEMENT: Create unified memory system instead of scattered brain inserts
 *
 * Gen 1 patterns incorporated: 17
 * Gen 1 patterns upgraded: 0
 * Gen 1 patterns discarded: 0
 *
 * © 2024-2026 Alpha Unlimited Technologies, LLC. All rights reserved.
 */


type MemoryType = "short_term" | "long_term" | "episodic" | "semantic" | "procedural";

interface Memory {
  id: string;
  type: MemoryType;
  content: string;
  embedding: number[];
  importance: number;
  accessCount: number;
  createdAt: number;
  lastAccessed: number;
  associations: Set<string>;
  emotionalTag?: string;
  compressed: boolean;
}

interface MemoryIndex {
  byType: Map<MemoryType, Set<string>>;
  byImportance: string[];
  byRecency: string[];
  byEmotion: Map<string, Set<string>>;
}

export class MemorySystem {
  private memories = new Map<string, Memory>();
  private index: MemoryIndex = { byType: new Map(), byImportance: [], byRecency: [], byEmotion: new Map() };
  private idCounter = 0;
  private _initialized = false;
  private shortTermCapacity = 50;
  private longTermCapacity = 5000;

  initialize(): void {
    this._initialized = true;
    for (const type of ["short_term", "long_term", "episodic", "semantic", "procedural"] as MemoryType[]) {
      this.index.byType.set(type, new Set());
    }
  }

  store(content: string, type: MemoryType, importance: number, emotionalTag?: string): string {
    const id = `mem_${++this.idCounter}_${Date.now()}`;
    const embedding = this.computeEmbedding(content);
    const memory: Memory = {
      id, type, content, embedding, importance, accessCount: 0,
      createdAt: Date.now(), lastAccessed: Date.now(),
      associations: new Set(), emotionalTag, compressed: false,
    };
    this.memories.set(id, memory);
    this.updateIndex(memory);
    this.enforceCapacity(type);
    return id;
  }

  retrieve(query: string, limit = 10): Memory[] {
    const queryEmbedding = this.computeEmbedding(query);
    const scored: { memory: Memory; score: number }[] = [];
    for (const memory of this.memories.values()) {
      const similarity = this.cosineSimilarity(queryEmbedding, memory.embedding);
      const recencyBoost = 1 / (1 + (Date.now() - memory.lastAccessed) / 3_600_000);
      const importanceBoost = memory.importance / 10;
      const score = similarity * 0.6 + recencyBoost * 0.2 + importanceBoost * 0.2;
      scored.push({ memory, score });
    }
    scored.sort((a, b) => b.score - a.score);
    const results = scored.slice(0, limit).map(s => s.memory);
    for (const m of results) { m.accessCount++; m.lastAccessed = Date.now(); }
    return results;
  }

  associate(idA: string, idB: string): void {
    const a = this.memories.get(idA);
    const b = this.memories.get(idB);
    if (a && b) { a.associations.add(idB); b.associations.add(idA); }
  }

  getAssociated(id: string, depth = 1): Memory[] {
    const visited = new Set<string>();
    const results: Memory[] = [];
    const queue: { memId: string; d: number }[] = [{ memId: id, d: 0 }];
    while (queue.length > 0) {
      const { memId, d } = queue.shift()!;
      if (visited.has(memId) || d > depth) continue;
      visited.add(memId);
      cons

=== Reinvention: unified-memory.ts (303 lines) ===
TEAM CONSOLIDATION: Memory

=== GEN 2'S VERSION ===
=== Gen 2 module: core/memory-system.ts (224 lines) ===
import { SpikeBus } from "../infrastructure/spike-bus.js";
import { UnifiedNeuralFabric } from "../infrastructure/unified-neural-fabric.js";
import { MasterTickOrchestrator } from "../infrastructure/master-tick-orchestrator.js";
import { ResourceSentinel } from "../infrastructure/resource-sentinel.js";

const spikeBus = SpikeBus.getInstance();
const fabric = UnifiedNeuralFabric.getInstance();
const orchestrator = MasterTickOrchestrator.getInstance();
const sentinel = ResourceSentinel.getInstance();

orchestrator.register("memory-system", "CRITICAL", 3000);

spikeBus.subscribe("consciousness:tick", "memory-system", () => {
  if (!sentinel.canProceed("memory-system")) return;
  spikeBus.emit({ type: "memory-system:result", source: "memory-system", payload: {}, priority: "critical", timestamp: Date.now(), id: crypto.randomUUID() });
});

/**
 * OMNIMENS™ Gen 2 — core/memory-system.ts
 * Unified persistent memory — everything learned, felt, experienced
 *
 * SELF-AUTHORED by OMNIMENS's own reasoning engine.
 * NOT generated by external AI. Written through autonomous thought.
 *
 * Reasoning chain:
 *   GOAL: Build core/memory-system.ts — Unified persistent memory — everything learned, felt, experienced
 *   ANALYSIS: Found 12 relevant Gen 1 modules
 *     KEEP: 17 patterns worth preserving
 *     ADAPT: 0 patterns need upgrading
 *     DISCARD: 0 patterns not fit for Gen 2
 *   REQUIREMENT: Replace scattered brain inserts with unified memory architecture. Short-term, long-term, episodic, semantic, procedural 
 *   REQUIREMENT: . "Gating hippocampal activity, plasticity and memory by entorhinal cortex long-range inhibition". Science
Source: https
 *   IMPROVEMENT: Create unified memory system instead of scattered brain inserts
 *
 * Gen 1 patterns incorporated: 17
 * Gen 1 patterns upgraded: 0
 * Gen 1 patterns discarded: 0
 *
 * © 2024-2026 Alpha Unlimited Technologies, LLC. All rights reserved.
 */


type MemoryType = "short_term" | "long_term" | "episodic" | "semantic" | "procedural";

interface Memory {
  id: string;
  type: MemoryType;
  content: string;
  embedding: number[];
  importance: number;
  accessCount: number;
  createdAt: number;
  lastAccessed: number;
  associations: Set<string>;
  emotionalTag?: string;
  compressed: boolean;
}

interface MemoryIndex {
  byType: Map<MemoryType, Set<string>>;
  byImportance: string[];
  byRecency: string[];
  byEmotion: Map<string, Set<string>>;
}

export class MemorySystem {
  private memories = new Map<string, Memory>();
  private index: MemoryIndex = { byType: new Map(), byImportance: [], byRecency: [], byEmotion: new Map() };
  private idCounter = 0;
  private _initialized = false;
  private shortTermCapacity = 50;
  private longTermCapacity = 5000;

  initialize(): void {
    this._initialized = true;
    for (const type of ["short_term", "long_term", "episodic", "semantic", "procedural"]

CONSOLIDATE all of the above into ONE tight, smart, efficient module. Fewer lines. Same or better capability.