/**
 * TRADE SECRET — OMNIMENS™ Platform
 * Copyright (C) 2024-2026 Alpha Unlimited Technologies, LLC. All rights reserved.
 * 
 * CONFIDENTIAL AND PROPRIETARY. Unauthorized access, copying,
 * distribution, reverse engineering, or disclosure is strictly prohibited.
 * See /legal/TRADE_SECRET_NOTICE.md for full terms.
 * ╔════════════════════════════════════════════════════════════════════╗
 * ║         OMNIMENS™ CAUSAL REASONING ENGINE  v2.0 (event-driven)     ║
 * ╚════════════════════════════════════════════════════════════════════╝
 */

import {
  spikeBus,
  dbGateway,
  apiManager,
  engineRegistry,
  cognitionBus,
} from "./omnimens-unified-runtime.js";
import { shouldYieldToCodegen } from "./omnimens-nextgen-sandbox.js";

/* ------------------------------------------------------------------ *
 *  ENGINE REGISTRATION & STATE                                       *
 * ------------------------------------------------------------------ */
engineRegistry.registerEngine("causal-reasoning", "NORMAL", { dbQuota: 10 });

let started = false;
let cycleCount = 0;

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
export interface CausalState {
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

/* ------------------------------------------------------------------ *
 *  IN-MEMORY GRAPH                                                   *
 * ------------------------------------------------------------------ */
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

const REASONING_INTERVAL_MS = 10 * 60 * 1000; // 10 minutes
const CYCLE_SPIKE = "causal-reasoning:cycle";

/* ------------------------------------------------------------------ *
 *  UTILITIES                                                         *
 * ------------------------------------------------------------------ */
const nodeId = (concept: string) =>
  concept.toLowerCase().replace(/[^a-z0-9_]/g, "_").slice(0, 80);

const safeNum = (v: number, f = 0) => (Number.isFinite(v) ? v : f);

function addNode(
  concept: string,
  domain: string,
  type: CausalNode["nodeType"] = "state",
): CausalNode {
  const id = nodeId(concept);
  if (nodes.has(id)) return nodes.get(id)!;
  const n: CausalNode = { id, concept, domain, nodeType: type };
  nodes.set(id, n);
  state.totalNodes = nodes.size;
  return n;
}

function addEdge(
  fromConcept: string,
  toConcept: string,
  relationship: string,
  confidence: number,
  mechanism: string,
  learnedFrom: string,
): void {
  const fromId = nodeId(fromConcept);
  const toId = nodeId(toConcept);

  const existing = edges.find((e) => e.fromId === fromId && e.toId === toId);
  if (existing) {
    existing.confidence = existing.confidence * 0.7 + confidence * 0.3;
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

/* ------------------------------------------------------------------ *
 *  CHAIN TRACING & PREDICTION                                        *
 * ------------------------------------------------------------------ */
function traceCausalChain(startConcept: string, maxDepth = 5): CausalChain[] {
  const startId = nodeId(startConcept);
  const chains: CausalChain[] = [];

  function dfs(
    currentId: string,
    visited: Set<string>,
    chain: string[],
    chainEdges: CausalEdge[],
    confidence: number,
  ) {
    if (chain.length > maxDepth) return;
    const outgoing = edges.filter(
      (e) => e.fromId === currentId && !visited.has(e.toId),
    );
    if (!outgoing.length && chain.length > 1) {
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
      dfs(
        edge.toId,
        visited,
        chain,
        chainEdges,
        confidence * safeNum(edge.confidence, 1),
      );
      chainEdges.pop();
      chain.pop();
      visited.delete(edge.toId);
    }
  }

  dfs(startId, new Set([startId]), [nodes.get(startId)?.concept || startConcept], [], 1);
  return chains
    .sort((a, b) => b.totalConfidence - a.totalConfidence)
    .slice(0, 10);
}

export function predictOutcome(action: string) {
  const chains = traceCausalChain(action, 4);
  let totalConf = 0;
  const predictions = chains.slice(0, 5).map((c) => {
    totalConf += c.totalConfidence;
    return `${action} → ${c.nodes.slice(1).join(" → ")} (confidence: ${(
      c.totalConfidence * 100
    ).toFixed(0)}%)`;
  });

  state.predictionsGenerated++;
  return {
    predictions,
    confidence: chains.length ? totalConf / chains.length : 0,
    chains,
  };
}

/* ------------------------------------------------------------------ *
 *  PERSISTENCE                                                       *
 * ------------------------------------------------------------------ */
async function loadExistingGraph() {
  try {
    const rows: any[] = await dbGateway.read(
      "causal-reasoning",
      "omnimensCausalGraph",
      { limit: 500 },
    );
    for (const r of rows) {
      addNode(r.fromConcept, r.domain || "general", "cause");
      addNode(r.toConcept, r.domain || "general", "effect");
      addEdge(
        r.fromConcept,
        r.toConcept,
        r.relationship,
        safeNum(r.confidence, 0.5),
        r.mechanism || "",
        r.learnedFrom || "db",
      );
    }
    rows.length &&
      console.log(
        `[OMNIMENS-CAUSAL-REASONING] 🔗 Loaded ${rows.length} relationships`,
      );
  } catch (e) {
    console.error("[OMNIMENS-CAUSAL-REASONING] DB load error:", e);
  }
}

async function persistNewEdge(row: Record<string, unknown>) {
  try {
    await dbGateway.write("causal-reasoning", "omnimensCausalGraph", row, "NORMAL");
  } catch (e) {
    console.error("[OMNIMENS-CAUSAL-REASONING] DB write error:", e);
  }
}

/* ------------------------------------------------------------------ *
 *  DISCOVERY CYCLE                                                   *
 * ------------------------------------------------------------------ */
async function discover() {
  cycleCount++;
  state.reasoningCycles = cycleCount;
  state.lastCycleTime = Date.now();

  if (shouldYieldToCodegen()) {
    console.log(
      `[OMNIMENS-CAUSAL-REASONING] 🔕 Cycle #${cycleCount} deferred (codegen active)`,
    );
    scheduleNext();
    return;
  }

  try {
    const brainEntries: any[] = await dbGateway.read(
      "causal-reasoning",
      "omnimensBrain",
      {
        filter: { active: true },
        order: { timesApplied: "desc" },
        limit: 15,
      },
    );

    const knowledge = brainEntries
      .map(
        (b) =>
          `[${b.category}] ${b.title}: ${(b.content || "").slice(0, 150)}`,
      )
      .join("\n");

    if (knowledge.length < 50) {
      scheduleNext();
      return;
    }

    const response: any = await apiManager.call("causal-reasoning", "openai", {
      endpoint: "chat.completions.create",
      payload: {
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `You are the CAUSAL REASONING ENGINE of OMNIMENS. Your job is to discover genuine CAUSAL relationships (not correlations)...`,
          },
          {
            role: "user",
            content: `Analyze this knowledge and extract causal relationships:\n\n${knowledge.slice(
              0,
              2000,
            )}`,
          },
        ],
        max_tokens: 1000,
        temperature: 0.3,
      },
    });

    const content = response?.choices?.[0]?.message?.content || "";
    const blocks = content.split("---").filter((b: string) => b.trim());

    let newRels = 0;

    for (const blk of blocks) {
      const cause = blk.match(/CAUSE:\s*(.+?)(?=\n|$)/i)?.[1]?.trim();
      const effect = blk.match(/EFFECT:\s*(.+?)(?=\n|$)/i)?.[1]?.trim();
      if (!cause || !effect) continue;

      const mechanism =
        blk.match(/MECHANISM:\s*(.+?)(?=\n|$)/i)?.[1]?.trim() ||
        "unknown mechanism";
      const domain =
        blk.match(/DOMAIN:\s*(.+?)(?=\n|$)/i)?.[1]?.trim() || "general";
      const conf = parseFloat(
        blk.match(/CONFIDENCE:\s*([\d.]+)/i)?.[1] || "0.5",
      );

      const existing = edges.find(
        (e) => e.fromId === nodeId(cause) && e.toId === nodeId(effect),
      );
      addNode(cause, domain, "cause");
      addNode(effect, domain, "effect");
      addEdge(
        cause,
        effect,
        `${cause} causes ${effect}`,
        conf,
        mechanism,
        `cycle_${cycleCount}`,
      );

      if (!existing) {
        newRels++;
        persistNewEdge({
          fromConcept: cause,
          toConcept: effect,
          relationship: `${cause} causes ${effect}`,
          mechanism,
          confidence: conf,
          domain,
          learnedFrom: `cycle_${cycleCount}`,
        });
      }
    }

    if (newRels) {
      state.novelCausationsFound += newRels;
      cognitionBus.shareInsight("causal-reasoning", {
        type: "discovery",
        count: newRels,
      });

      dbGateway.write(
        "causal-reasoning",
        "omnimensBrain",
        {
          title: `[Causal] ${newRels} new relationships — cycle #${cycleCount}`,
          content: `Discovered ${newRels} new cause→effect links.`,
          category: "causal_reasoning",
          source: "causal_reasoning_engine",
          active: true,
          timesApplied: 0,
        },
        "LOW",
      );
    }

    if (cycleCount % 3 === 0 || newRels >= 3) {
      console.log(
        `[OMNIMENS-CAUSAL-REASONING] 🔗 Cycle #${cycleCount} | +${newRels} | ${nodes.size} nodes / ${edges.length} edges`,
      );
    }
  } catch (e) {
    console.error("[OMNIMENS-CAUSAL-REASONING] Cycle error:", e);
  } finally {
    scheduleNext();
  }
}

/* ------------------------------------------------------------------ *
 *  SPIKE SCHEDULING                                                  *
 * ------------------------------------------------------------------ */
function scheduleNext(delay = REASONING_INTERVAL_MS) {
  spikeBus.scheduleSpike(CYCLE_SPIKE, {}, delay);
}

spikeBus.on(CYCLE_SPIKE, discover);
spikeBus.on("attention:causal-reasoning", () => scheduleNext(1_000));
spikeBus.on("cognition:curiosity", () => scheduleNext(2_000));

cognitionBus.onInsight((src, insight) => {
  if (src !== "causal-reasoning" && insight?.type === "discovery") {
    // Future: incorporate foreign discoveries
  }
});

/* ------------------------------------------------------------------ *
 *  PUBLIC API                                                        *
 * ------------------------------------------------------------------ */
export function getCausalState(): CausalState {
  return { ...state };
}
export function getCausalGraph() {
  return { nodes: [...nodes.values()], edges: [...edges] };
}
export async function startCausalReasoning() {
  if (started) return;
  started = true;

  console.log(
    `[OMNIMENS-CAUSAL-REASONING] 🔗 Engine activated — interval ${REASONING_INTERVAL_MS /
      60000} min`,
  );
  await loadExistingGraph();
  scheduleNext(3 * 60 * 1000); // first cycle in 3 min
}

export function shutdown() {
  engineRegistry.unregisterEngine("causal-reasoning");
}