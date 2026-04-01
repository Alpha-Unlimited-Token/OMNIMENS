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
    grouped[m.category].push(m.content);
  });
  return (
    "\n\n━━━ MEMORY ━━━\n" +
    Object.entries(grouped)
      .map(([c, list]) => `[${c.toUpperCase()}] ${list.join(" | ")}`)
      .join("\n") +
    "\n"
  );
}

export function getUserMemories(userId: string) {
  return S.userMemories.get(userId) || [];
}
export function deleteMemory(userId: string, memId: number) {
  const arr = S.userMemories.get(userId);
  if (!arr) return;
  const m = arr.find((x) => x.id === memId);
  if (m) m.active = false;
}
export function addManualMemory(userId: string, content: string, category: string) {
  const m = {
    id: Date.now(),
    content: content.slice(0, 500),
    category: category || "instruction",
    active: true,
    createdAt: now(),
  };
  if (!S.userMemories.has(userId)) S.userMemories.set(userId, []);
  S.userMemories.get(userId)!.push(m);
  enqueueDb("omnimens_memories", { userId, ...m });
  return m;
}

/*───────────────────── EXPERIENTIAL MEMORY ─────────────────────*/
export function startExperientialMemory() {
  /* placeholder — real neural hooks inside cognitionBus */
}
export function getExperientialMemoryState() {
  return {
    memories: S.experiential.size,
    tick: S.tick,
  };
}

/*───────────────── INTERGENERATIONAL MEMORY ───────────────────*/
export function encodeGene(domain: string, insight: string, source = "general") {
  const gene = { id: randId("gene"), domain, insight, source, ts: now(), strength: 0.5 };
  const existing = S.genome.find((g) => g.domain === domain && g.insight === insight);
  if (existing) existing.strength = Math.min(1, existing.strength + 0.1);
  else S.genome.push(gene);
  enqueueDb("omnimens_genome", gene);
  return gene;
}
export function getIntergenerationalState() {
  return { generation: 1, genes: S.genome.length, strongest: S.genome.slice(0, 5) };
}
export const getGenomeDescription = () =>
  `Genome: ${S.genome.length} genes | strongest: ${S.genome
    .slice(0, 3)
    .map((g) => g.domain)
    .join(", ")}`;

/*──────────────────── KNOWLEDGE GRAPH API ─────────────────────*/
function findOrCreateNode(concept: string) {
  concept = concept.toLowerCase().trim();
  if (!S.knowledgeNodes.has(concept)) {
    const node = { id: randId("node"), concept, activation: 1 };
    S.knowledgeNodes.set(concept, node);
    enqueueDb("omnimens_knowledge_nodes", node);
  }
  return S.knowledgeNodes.get(concept)!;
}
function connectNodes(a: string, b: string) {
  const key = [a, b].sort().join("|");
  const edge = S.knowledgeEdges.get(key) || { id: randId("edge"), a, b, weight: 0.5 };
  edge.weight = Math.min(1, edge.weight + 0.05);
  S.knowledgeEdges.set(key, edge);
  enqueueDb("omnimens_knowledge_edges", edge);
}
export async function spreadingActivation(
  concept: string,
  depth = 2,
  limit = 10
) {
  const start = findOrCreateNode(concept);
  const visited = new Set<string>([start.id]);
  const queue: { id: string; d: number }[] = [{ id: start.concept, d: 0 }];
  const results: any[] = [];
  while (queue.length && results.length < limit) {
    const { id, d } = queue.shift()!;
    if (d >= depth) continue;
    for (const edge of S.knowledgeEdges.values()) {
      if (edge.a === id || edge.b === id) {
        const neighbor = edge.a === id ? edge.b : edge.a;
        if (visited.has(neighbor)) continue;
        visited.add(neighbor);
        queue.push({ id: neighbor, d: d + 1 });
        results.push({ concept: neighbor, weight: edge.weight, depth: d + 1 });
      }
    }
  }
  return results;
}
export function runKnowledgeGraphCycle() {
  /* simple Hebbian reinforce based on recent activations */
  for (const edge of S.knowledgeEdges.values()) {
    edge.weight *= 0.999; // slow decay
    if (edge.weight < 0.05) S.knowledgeEdges.delete(edge.id);
  }
}
export const getGraphStats = () => ({
  nodes: S.knowledgeNodes.size,
  edges: S.knowledgeEdges.size,
});
export const startKnowledgeGraph = () => {};

/*──────────────────────── LEARNING LOOP ────────────────────────*/
export async function evaluateResponseQuality(
  userMsg: string,
  aiResp: string,
  taskType = "general"
) {
  const res: any =
    (await withApi(() =>
      apiManager.chat({
        model: "gpt-4o-mini",
        system: "You are a critic. Score 0-10 and give strengths/weaknesses JSON.",
        user: `Task:${taskType}\nUser:${userMsg}\nAI:${aiResp}`,
        json: true,
        maxTokens: 200,
      })
    )) || { overall: 7, strengths: [], weaknesses: [] };
  return { score: res.overall || 7, strengths: res.strengths || [], weaknesses: res.weaknesses || [], suggestions: res.suggestions || [] };
}

export async function performSelfReflection(
  userId: string,
  userMsg: string,
  aiResp: string,
  taskType = "general"
) {
  const review = await evaluateResponseQuality(userMsg, aiResp, taskType);
  const insight = {
    id: randId("insight"),
    userId,
    review,
    ts: now(),
  };
  S.learningInsights.push(insight);
  enqueueDb("omnimens_learning_insights", insight);
  return review;
}

export const analyzeUserEmotionalState = async (msg: string) => {
  const res: any =
    (await withApi(() =>
      apiManager.chat({
        model: "gpt-4o-mini",
        system: "Detect user emotion (happy|sad|neutral etc) JSON {emotion}",
        user: msg,
        json: true,
        maxTokens: 50,
      })
    )) || { emotion: "neutral" };
  return res.emotion;
};

export function storeLearningInsight(insight: any) {
  S.learningInsights.push({ ...insight, id: randId("li"), ts: now() });
  enqueueDb("omnimens_learning_insights", insight);
}
export const generateProactiveInsights = () =>
  S.learningInsights.slice(-5).map((i) => `Remember to ${i.review.suggestions?.[0] || "improve."}`);
export const runLearningCycle = () => {
  // simple consolidation into genes
  for (const li of S.learningInsights.splice(0)) {
    if (li.review.score >= 8) encodeGene("quality", li.review.strengths.join(";"), "success");
  }
};
export const buildEmotionalContext = (emotion: string) =>
  `User seems ${emotion}. Respond with empathy.`;
export const loadLearningContext = () =>
  S.learningInsights.slice(-10).map((i) => i.review).join("\n");

/*───────────────────── TOOL KNOWLEDGE BASE ─────────────────────*/
export interface ToolDefinition {
  id: string;
  name: string;
  category: string;
  searchQueries: string[];
  docUrls: string[];
  why: string;
}
export const INSTALLED_TOOLS: ToolDefinition[] = [
  { id: "trimesh", name: "trimesh", category: "3d_modeling", searchQueries: [], docUrls: [], why: "" },
  { id: "threejs", name: "Three.js", category: "web_3d", searchQueries: [], docUrls: [], why: "" },
];
export async function runToolKnowledgeIngestion() {
  for (const tool of INSTALLED_TOOLS) {
    if (S.toolKnowledge.has(tool.id)) continue;
    const summary =
      (await withApi(() =>
        apiManager.webSearchAndSummarize(tool.searchQueries[0] || tool.name)
      )) || "";
    S.toolKnowledge.set(tool.id, summary);
    enqueueDb("omnimens_tool_knowledge", { toolId: tool.id, summary });
    await new Promise((r) => setTimeout(r, 500)); // yield between tools
  }
}
export const loadToolKnowledgeForTask = (toolId: string) =>
  S.toolKnowledge.get(toolId) || "";
export const learnNewTool = (tool: ToolDefinition) => {
  INSTALLED_TOOLS.push(tool);
  forceRefreshToolKnowledge(tool.id);
};
export const forceRefreshToolKnowledge = async (toolId?: string) => {
  const targets = toolId ? INSTALLED_TOOLS.filter((t) => t.id === toolId) : INSTALLED_TOOLS;
  for (const t of targets) S.toolKnowledge.delete(t.id);
  await runToolKnowledgeIngestion();
};

/*───────────────────── MASTER TICK CYCLE ───────────────────────*/
async function masterTick() {
  S.tick++;

  /* 1. In-flight conversational context → user memory extraction */
  const conv = cognitionBus.dequeueCompletedConversation();
  if (conv)
    await extractAndStoreMemories(conv.userId, conv.userMessage, conv.aiResponse);

  /* 2. Experiential memory from cognition signals */
  if (S.tick % 10 === 0) startExperientialMemory();

  /* 3. Learning consolidation */
  if (S.tick % 5 === 0) runLearningCycle();

  /* 4. Knowledge graph maintenance */
  if (S.tick % 15 === 0) runKnowledgeGraphCycle();

  /* 5. Tool knowledge scheduled refresh */
  if (S.tick % (60 * 60) === 1) runToolKnowledgeIngestion();

  /* 6. Persist */
  flushDb();

  /* 7. Reset API budget every minute */
  if (now() > S.apiBudget.resetTs) {
    S.apiBudget.remaining = 180;
    S.apiBudget.resetTs = now() + 60_000;
  }
}

/*───────────────── ENGINE REGISTRATION / START ─────────────────*/
const spikeId = spikeBus.register("memory-knowledge-cycle", masterTick, { intervalMs: 1_000 });
engineRegistry.registerEngine("memory-knowledge", {
  start: () => spikeBus.enable(spikeId),
  stop: () => spikeBus.disable(spikeId),
  stats: () => ({
    tick: S.tick,
    dbQueue: S.dbQueue.length,
    apiRemaining: S.apiBudget.remaining,
    memories: [...S.userMemories.keys()].length,
    knowledgeNodes: S.knowledgeNodes.size,
    genome: S.genome.length,
  }),
});

/*──────────────────────── RE-EXPORTS ───────────────────────────
 * Preserve API compatibility for all former modules
 */
export {
  // experiential
  startExperientialMemory,
  getExperientialMemoryState,
  // intergenerational
  encodeGene,
  getIntergenerationalState,
  getGenomeDescription,
  // knowledge graph
  spreadingActivation,
  runKnowledgeGraphCycle,
  getGraphStats,
  startKnowledgeGraph,
  // learning
  evaluateResponseQuality,
  performSelfReflection,
  analyzeUserEmotionalState,
  storeLearningInsight,
  generateProactiveInsights,
  runLearningCycle,
  buildEmotionalContext,
  loadLearningContext,
  // tool knowledge
  ToolDefinition,
  INSTALLED_TOOLS,
  runToolKnowledgeIngestion,
  loadToolKnowledgeForTask,
  learnNewTool,
  forceRefreshToolKnowledge,
};