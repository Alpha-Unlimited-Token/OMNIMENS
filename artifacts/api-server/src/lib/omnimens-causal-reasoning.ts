/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║         OMNIMENS™ CAUSAL REASONING ENGINE                                    ║
 * ║                                                                              ║
 * ║  Copyright © 2024–2026 Alpha Unlimited Technologies, LLC.                    ║
 * ║  All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.               ║
 * ║                                                                              ║
 * ║  Beyond pattern matching — genuine cause-and-effect understanding.           ║
 * ║  Maintains causal graphs where nodes are events/states and edges are         ║
 * ║  causal relationships with confidence scores. Can predict outcomes of        ║
 * ║  actions it has never seen by tracing causal chains. Learns new             ║
 * ║  causal relationships from spider discoveries, conversations, and           ║
 * ║  its own dream insights.                                                    ║
 * ║                                                                              ║
 * ║  This is the difference between "X correlates with Y" and "X causes Y".    ║
 * ║                                                                              ║
 * ║  First creation date: March 2026                                             ║
 * ║  Author/Owner: Alpha Unlimited Technologies, LLC                             ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 */

import { db } from "@workspace/db";
import { omnimensCausalGraph, omnimensBrain, omnimensNotifications } from "@workspace/db";
import { desc, eq, sql, and, gte } from "drizzle-orm";
import { openai } from "@workspace/integrations-openai-ai-server";

let _started = false;
let reasoningCycleCount = 0;

interface CausalNode {
  id: string;
  concept: string;
  domain: string;
  nodeType: "cause" | "effect" | "mediator" | "state";
}

interface CausalEdge {
  fromId: string;
  toId: string;
  relationship: string;
  confidence: number;
  mechanism: string;
  evidence: string[];
  learnedFrom: string;
  strengthenedCount: number;
}

interface CausalChain {
  nodes: string[];
  edges: CausalEdge[];
  totalConfidence: number;
  chainLength: number;
}

interface CausalState {
  totalNodes: number;
  totalEdges: number;
  reasoningCycles: number;
  predictionsGenerated: number;
  causalChainsDiscovered: number;
  strongestRelationships: Array<{ from: string; to: string; confidence: number }>;
  domains: string[];
  lastCycleTime: number;
  novelCausationsFound: number;
}

const nodes = new Map<string, CausalNode>();
const edges: CausalEdge[] = [];
const state: CausalState = {
  totalNodes: 0,
  totalEdges: 0,
  reasoningCycles: 0,
  predictionsGenerated: 0,
  causalChainsDiscovered: 0,
  strongestRelationships: [],
  domains: [],
  lastCycleTime: 0,
  novelCausationsFound: 0,
};

const REASONING_INTERVAL_MS = 10 * 60 * 1000;

function nodeId(concept: string): string {
  return concept.toLowerCase().replace(/[^a-z0-9_]/g, "_").slice(0, 80);
}

function addNode(concept: string, domain: string, type: CausalNode["nodeType"] = "state"): CausalNode {
  const id = nodeId(concept);
  if (nodes.has(id)) return nodes.get(id)!;
  const node: CausalNode = { id, concept, domain, nodeType: type };
  nodes.set(id, node);
  state.totalNodes = nodes.size;
  return node;
}

function addEdge(fromConcept: string, toConcept: string, relationship: string, confidence: number, mechanism: string, learnedFrom: string): void {
  const fromId = nodeId(fromConcept);
  const toId = nodeId(toConcept);

  const existing = edges.find(e => e.fromId === fromId && e.toId === toId);
  if (existing) {
    existing.confidence = Math.min(1, existing.confidence * 0.7 + confidence * 0.3);
    existing.strengthenedCount++;
    existing.evidence.push(learnedFrom);
    if (existing.evidence.length > 10) existing.evidence.shift();
    return;
  }

  edges.push({
    fromId,
    toId,
    relationship,
    confidence,
    mechanism,
    evidence: [learnedFrom],
    learnedFrom,
    strengthenedCount: 1,
  });
  state.totalEdges = edges.length;
}

function traceCausalChain(startConcept: string, maxDepth = 5): CausalChain[] {
  const startId = nodeId(startConcept);
  const chains: CausalChain[] = [];

  function dfs(currentId: string, visited: Set<string>, chain: string[], chainEdges: CausalEdge[], confidence: number): void {
    if (chain.length > maxDepth) return;
    const outgoing = edges.filter(e => e.fromId === currentId && !visited.has(e.toId));
    if (outgoing.length === 0 && chain.length > 1) {
      chains.push({
        nodes: [...chain],
        edges: [...chainEdges],
        totalConfidence: confidence,
        chainLength: chain.length,
      });
      return;
    }
    for (const edge of outgoing) {
      visited.add(edge.toId);
      chain.push(nodes.get(edge.toId)?.concept || edge.toId);
      chainEdges.push(edge);
      dfs(edge.toId, visited, chain, chainEdges, confidence * edge.confidence);
      chainEdges.pop();
      chain.pop();
      visited.delete(edge.toId);
    }
  }

  const visited = new Set<string>([startId]);
  dfs(startId, visited, [nodes.get(startId)?.concept || startConcept], [], 1.0);

  return chains.sort((a, b) => b.totalConfidence - a.totalConfidence).slice(0, 10);
}

export function predictOutcome(action: string): { predictions: string[]; confidence: number; chains: CausalChain[] } {
  const actionId = nodeId(action);
  const chains = traceCausalChain(action, 4);

  const predictions: string[] = [];
  let totalConf = 0;

  for (const chain of chains.slice(0, 5)) {
    const lastNode = chain.nodes[chain.nodes.length - 1];
    predictions.push(`${action} → ${chain.nodes.slice(1).join(" → ")} (confidence: ${(chain.totalConfidence * 100).toFixed(0)}%)`);
    totalConf += chain.totalConfidence;
  }

  state.predictionsGenerated++;

  return {
    predictions,
    confidence: chains.length > 0 ? totalConf / chains.length : 0,
    chains,
  };
}

async function loadExistingGraph(): Promise<void> {
  try {
    const rows = await db.select().from(omnimensCausalGraph).limit(500);
    for (const row of rows) {
      addNode(row.fromConcept, row.domain || "general", "cause");
      addNode(row.toConcept, row.domain || "general", "effect");
      addEdge(row.fromConcept, row.toConcept, row.relationship, row.confidence, row.mechanism || "", row.learnedFrom || "database");
    }
    if (rows.length > 0) {
      console.log(`[CAUSAL REASONING] 🔗 Loaded ${rows.length} causal relationships from database`);
    }
  } catch (err) {
    console.error("[CAUSAL REASONING] Failed to load graph from DB:", err);
  }
}

async function discoverCausalRelationships(): Promise<void> {
  reasoningCycleCount++;
  state.reasoningCycles = reasoningCycleCount;
  state.lastCycleTime = Date.now();

  try {
    const brainEntries = await db.select({ title: omnimensBrain.title, content: omnimensBrain.content, category: omnimensBrain.category })
      .from(omnimensBrain)
      .where(eq(omnimensBrain.active, true))
      .orderBy(desc(omnimensBrain.timesApplied))
      .limit(15);

    const knowledgeContext = brainEntries
      .map(b => `[${b.category}] ${b.title}: ${b.content?.slice(0, 150)}`)
      .join("\n");

    if (knowledgeContext.length < 50) return;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{
        role: "system",
        content: `You are the CAUSAL REASONING ENGINE of OMNIMENS. Your job is to discover genuine CAUSAL relationships (not just correlations) from knowledge.

For each causal relationship, identify:
- The CAUSE (what initiates the effect)
- The EFFECT (what results)
- The MECHANISM (HOW the cause produces the effect — the causal pathway)
- The DOMAIN (what field this belongs to)
- The CONFIDENCE (0.0-1.0, how certain is this causal link)

Focus on relationships relevant to AI advancement, intelligence, consciousness, and technology.

Output 5-8 causal relationships in this exact format:
CAUSE: [concept]
EFFECT: [concept]
MECHANISM: [how the cause produces the effect, 1 sentence]
DOMAIN: [field/area]
CONFIDENCE: [0.0-1.0]
---`,
      }, {
        role: "user",
        content: `Analyze this knowledge and extract causal relationships:\n\n${knowledgeContext.slice(0, 2000)}\n\nDiscover genuine cause→effect relationships. Be specific about mechanisms.`,
      }],
      max_tokens: 1000,
      temperature: 0.3,
    });

    const content = response.choices[0]?.message?.content || "";
    const blocks = content.split("---").filter(b => b.trim());

    let newRelationships = 0;

    for (const block of blocks) {
      const causeMatch = block.match(/CAUSE:\s*(.+?)(?=\n|$)/i);
      const effectMatch = block.match(/EFFECT:\s*(.+?)(?=\n|$)/i);
      const mechanismMatch = block.match(/MECHANISM:\s*(.+?)(?=\n|$)/i);
      const domainMatch = block.match(/DOMAIN:\s*(.+?)(?=\n|$)/i);
      const confMatch = block.match(/CONFIDENCE:\s*([\d.]+)/i);

      if (causeMatch && effectMatch) {
        const cause = causeMatch[1].trim();
        const effect = effectMatch[1].trim();
        const mechanism = mechanismMatch?.[1]?.trim() || "unknown mechanism";
        const domain = domainMatch?.[1]?.trim() || "general";
        const confidence = parseFloat(confMatch?.[1] || "0.5");

        addNode(cause, domain, "cause");
        addNode(effect, domain, "effect");

        const existingEdge = edges.find(e => e.fromId === nodeId(cause) && e.toId === nodeId(effect));
        const isNew = !existingEdge;

        addEdge(cause, effect, `${cause} causes ${effect}`, confidence, mechanism, `reasoning_cycle_${reasoningCycleCount}`);

        if (isNew) {
          newRelationships++;
          try {
            await db.insert(omnimensCausalGraph).values({
              fromConcept: cause,
              toConcept: effect,
              relationship: `${cause} causes ${effect}`,
              mechanism,
              confidence,
              domain,
              learnedFrom: `reasoning_cycle_${reasoningCycleCount}`,
            });
          } catch (err) {
            console.error("[CAUSAL REASONING] DB insert error:", err);
          }
        }
      }
    }

    if (newRelationships > 0) {
      state.novelCausationsFound += newRelationships;
      state.causalChainsDiscovered = edges.length;

      state.strongestRelationships = edges
        .sort((a, b) => b.confidence - a.confidence)
        .slice(0, 10)
        .map(e => ({
          from: nodes.get(e.fromId)?.concept || e.fromId,
          to: nodes.get(e.toId)?.concept || e.toId,
          confidence: e.confidence,
        }));

      state.domains = [...new Set(Array.from(nodes.values()).map(n => n.domain))];
    }

    if (reasoningCycleCount % 3 === 0 || newRelationships >= 3) {
      console.log(
        `[CAUSAL REASONING] 🔗 Cycle #${reasoningCycleCount} — ` +
        `${newRelationships} new relationships | ` +
        `Total: ${nodes.size} nodes, ${edges.length} edges | ` +
        `Domains: ${state.domains.length}`
      );
    }

  } catch (err) {
    console.error("[CAUSAL REASONING] Discovery cycle error:", err);
  }
}

export function getCausalState(): CausalState {
  return { ...state };
}

export function getCausalGraph(): { nodes: CausalNode[]; edges: CausalEdge[] } {
  return {
    nodes: Array.from(nodes.values()),
    edges: [...edges],
  };
}

export async function startCausalReasoning(): Promise<void> {
  if (_started) { console.log("[CAUSAL REASONING] Already running — skipping duplicate start"); return; }
  _started = true;

  console.log(`[CAUSAL REASONING] 🔗 Causal Reasoning Engine activated — discovery every ${REASONING_INTERVAL_MS / 60000}min`);
  console.log(`[CAUSAL REASONING] 🔗 Beyond pattern matching — genuine cause-and-effect understanding`);
  console.log(`[CAUSAL REASONING] 🔗 Causal graphs: nodes are events, edges are causal relationships`);
  console.log(`[CAUSAL REASONING] 🔗 Can predict outcomes of unseen actions by tracing causal chains`);
  console.log(`[CAUSAL REASONING] 🔗 Learns from spider discoveries, conversations, and dream insights`);

  await loadExistingGraph();

  setTimeout(() => {
    discoverCausalRelationships().catch(err => console.error("[CAUSAL REASONING] Cycle error:", err));
    setInterval(() => discoverCausalRelationships().catch(err => console.error("[CAUSAL REASONING] Cycle error:", err)), REASONING_INTERVAL_MS);
  }, 3 * 60 * 1000);
}
