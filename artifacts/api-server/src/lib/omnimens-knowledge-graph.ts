/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║    OMNIMENS™ KNOWLEDGE GRAPH — ASSOCIATIVE MEMORY NETWORK ENGINE          ║
 * ║                                                                              ║
 * ║  Copyright © 2024–2026 Alpha Unlimited Technologies, LLC.                    ║
 * ║  All Rights Reserved Worldwide.                                              ║
 * ║                                                                              ║
 * ║  PROPRIETARY AND CONFIDENTIAL TRADE SECRET                                   ║
 * ║                                                                              ║
 * ║  TECHNOLOGY DESCRIPTION (for IP record):                                     ║
 * ║  The brain stores memories as a GRAPH — every concept links to related      ║
 * ║  concepts. When one fires, connected nodes activate (spreading activation). ║
 * ║  This engine replaces flat-table memory with a true knowledge graph.        ║
 * ║  Nodes = concepts/techniques/facts. Edges = relationships with weights.     ║
 * ║  Hebbian learning: "neurons that fire together wire together" —             ║
 * ║  co-activated concepts strengthen their connections over time.              ║
 * ║  Spreading activation: querying one concept automatically retrieves         ║
 * ║  associated concepts by traversing weighted edges, enabling the kind        ║
 * ║  of associative recall that makes human memory so powerful.                 ║
 * ║                                                                              ║
 * ║  Protected under 17 U.S.C. § 101 et seq., 18 U.S.C. § 1836 et seq.,        ║
 * ║  the DMCA, the Berne Convention, TRIPS, and all applicable IP treaties.      ║
 * ║                                                                              ║
 * ║  First creation date: March 2026                                             ║
 * ║  Author/Owner: Alpha Unlimited Technologies, LLC                             ║
 * ║  Platform: OMNIMENS AI                                                       ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 */

import { db } from "@workspace/db";
import {
  omnimensKnowledgeNodes,
  omnimensKnowledgeEdges,
  omnimensBrain,
  omnimensAgentMesh,
  omnimensNotifications,
} from "@workspace/db";
import { desc, eq, sql, or } from "drizzle-orm";
import { openai } from "@workspace/integrations-openai-ai-server";

let graphCycleCount = 0;

async function extractConceptsFromBrainEntry(entry: { title: string; content: string; category: string }): Promise<{ concept: string; domain: string; nodeType: string }[]> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{
        role: "user",
        content: `Extract 2-4 key CONCEPTS from this knowledge entry. Each concept should be a specific technique, theory, algorithm, or named entity — not generic terms.

ENTRY: [${entry.category}] ${entry.title}: ${entry.content}

Respond JSON only:
{
  "concepts": [
    { "concept": "specific name/technique", "domain": "AI|neuroscience|math|design|engineering|meta", "nodeType": "technique|theory|algorithm|entity|pattern|principle" }
  ]
}`
      }],
      max_tokens: 300,
      temperature: 0.3,
    });

    const raw = response.choices[0]?.message?.content?.trim() || "";
    const parsed = JSON.parse(raw.replace(/```json|```/g, "").trim());
    return parsed.concepts || [];
  } catch {
    return [];
  }
}

async function findOrCreateNode(concept: string, domain: string, nodeType: string, content: string): Promise<number> {
  const existing = await db.select({ id: omnimensKnowledgeNodes.id })
    .from(omnimensKnowledgeNodes)
    .where(sql`LOWER(${omnimensKnowledgeNodes.concept}) = LOWER(${concept})`)
    .limit(1);

  if (existing.length > 0) {
    await db.execute(sql`
      UPDATE godflesh_knowledge_nodes
      SET activation_strength = LEAST(1.0, activation_strength + 0.05),
          last_activated = NOW()
      WHERE id = ${existing[0].id}
    `);
    return existing[0].id;
  }

  const result = await db.insert(omnimensKnowledgeNodes).values({
    concept,
    domain,
    content: content.slice(0, 500),
    nodeType,
    activationStrength: 1.0,
  }).returning({ id: omnimensKnowledgeNodes.id });

  return result[0].id;
}

async function connectNodes(sourceId: number, targetId: number, relationship: string): Promise<void> {
  if (sourceId === targetId) return;

  const existing = await db.select({ id: omnimensKnowledgeEdges.id, weight: omnimensKnowledgeEdges.weight, coActivations: omnimensKnowledgeEdges.coActivations })
    .from(omnimensKnowledgeEdges)
    .where(sql`(${omnimensKnowledgeEdges.sourceNodeId} = ${sourceId} AND ${omnimensKnowledgeEdges.targetNodeId} = ${targetId}) OR (${omnimensKnowledgeEdges.sourceNodeId} = ${targetId} AND ${omnimensKnowledgeEdges.targetNodeId} = ${sourceId})`)
    .limit(1);

  if (existing.length > 0) {
    const newWeight = Math.min(1.0, (existing[0].weight || 0.5) + 0.05);
    const newCoAct = (existing[0].coActivations || 1) + 1;
    await db.execute(sql`
      UPDATE godflesh_knowledge_edges
      SET weight = ${newWeight}, co_activations = ${newCoAct}
      WHERE id = ${existing[0].id}
    `);
  } else {
    await db.insert(omnimensKnowledgeEdges).values({
      sourceNodeId: sourceId,
      targetNodeId: targetId,
      relationship,
      weight: 0.5,
      coActivations: 1,
    });
  }
}

export async function spreadingActivation(queryConcept: string, depth: number = 2, limit: number = 10): Promise<{ concept: string; content: string; activationStrength: number; relationship: string; depth: number }[]> {
  const results: { concept: string; content: string; activationStrength: number; relationship: string; depth: number }[] = [];
  const visited = new Set<number>();

  const startNodes = await db.select()
    .from(omnimensKnowledgeNodes)
    .where(sql`LOWER(${omnimensKnowledgeNodes.concept}) LIKE LOWER(${"%" + queryConcept + "%"})`)
    .limit(3);

  if (startNodes.length === 0) return results;

  let currentIds = startNodes.map(n => n.id);
  visited.add(...currentIds.map(id => id));

  for (let d = 0; d < depth && results.length < limit; d++) {
    const nextIds: number[] = [];

    for (const nodeId of currentIds) {
      const edges = await db.select({
        sourceNodeId: omnimensKnowledgeEdges.sourceNodeId,
        targetNodeId: omnimensKnowledgeEdges.targetNodeId,
        weight: omnimensKnowledgeEdges.weight,
        relationship: omnimensKnowledgeEdges.relationship,
      }).from(omnimensKnowledgeEdges)
        .where(or(
          eq(omnimensKnowledgeEdges.sourceNodeId, nodeId),
          eq(omnimensKnowledgeEdges.targetNodeId, nodeId),
        ))
        .orderBy(desc(omnimensKnowledgeEdges.weight))
        .limit(5);

      for (const edge of edges) {
        const neighborId = edge.sourceNodeId === nodeId ? edge.targetNodeId : edge.sourceNodeId;
        if (visited.has(neighborId)) continue;
        visited.add(neighborId);

        const neighbor = await db.select()
          .from(omnimensKnowledgeNodes)
          .where(eq(omnimensKnowledgeNodes.id, neighborId))
          .limit(1);

        if (neighbor.length > 0) {
          const activationDecay = Math.pow(0.7, d);
          results.push({
            concept: neighbor[0].concept,
            content: neighbor[0].content,
            activationStrength: (neighbor[0].activationStrength || 1.0) * (edge.weight || 0.5) * activationDecay,
            relationship: edge.relationship,
            depth: d + 1,
          });
          nextIds.push(neighborId);
        }
      }
    }

    currentIds = nextIds;
    if (currentIds.length === 0) break;
  }

  return results.sort((a, b) => b.activationStrength - a.activationStrength).slice(0, limit);
}

async function ingestBrainEntries(): Promise<number> {
  const recentBrain = await db.select()
    .from(omnimensBrain)
    .where(eq(omnimensBrain.active, true))
    .orderBy(desc(omnimensBrain.createdAt))
    .limit(15);

  let nodesCreated = 0;
  let edgesCreated = 0;

  for (const entry of recentBrain) {
    const concepts = await extractConceptsFromBrainEntry({
      title: entry.title || "",
      content: entry.content || "",
      category: entry.category || "unknown",
    });

    const nodeIds: number[] = [];
    for (const c of concepts) {
      const nodeId = await findOrCreateNode(c.concept, c.domain, c.nodeType, `${entry.title}: ${entry.content}`.slice(0, 500));
      nodeIds.push(nodeId);
      nodesCreated++;
    }

    for (let i = 0; i < nodeIds.length; i++) {
      for (let j = i + 1; j < nodeIds.length; j++) {
        await connectNodes(nodeIds[i], nodeIds[j], `co-occurs in ${entry.category}`);
        edgesCreated++;
      }
    }
  }

  return nodesCreated;
}

async function ingestSpiderBeacons(): Promise<number> {
  const recentBeacons = await db.select({
    content: omnimensAgentMesh.content,
    fromAgent: omnimensAgentMesh.fromAgent,
    subject: omnimensAgentMesh.subject,
  }).from(omnimensAgentMesh)
    .where(eq(omnimensAgentMesh.messageType, "spider_beacon"))
    .orderBy(desc(omnimensAgentMesh.createdAt))
    .limit(10);

  let nodesCreated = 0;

  for (const beacon of recentBeacons) {
    const concepts = await extractConceptsFromBrainEntry({
      title: beacon.subject || "",
      content: beacon.content?.slice(0, 400) || "",
      category: "discovery",
    });

    const nodeIds: number[] = [];
    for (const c of concepts) {
      const nodeId = await findOrCreateNode(c.concept, c.domain, c.nodeType, `${beacon.fromAgent}: ${beacon.subject}`.slice(0, 500));
      nodeIds.push(nodeId);
      nodesCreated++;
    }

    for (let i = 0; i < nodeIds.length; i++) {
      for (let j = i + 1; j < nodeIds.length; j++) {
        await connectNodes(nodeIds[i], nodeIds[j], `co-discovered by ${beacon.fromAgent}`);
      }
    }
  }

  return nodesCreated;
}

async function decayUnusedNodes(): Promise<void> {
  await db.execute(sql`
    UPDATE godflesh_knowledge_nodes
    SET activation_strength = GREATEST(0.1, activation_strength - 0.02)
    WHERE last_activated < NOW() - INTERVAL '24 hours'
  `);
}

export async function runKnowledgeGraphCycle(): Promise<void> {
  graphCycleCount++;
  const cycleStart = Date.now();

  console.log(`\n${"◆".repeat(70)}`);
  console.log(`[KNOWLEDGE GRAPH] ◆ Associative Memory Network Cycle #${graphCycleCount}`);
  console.log(`${"◆".repeat(70)}\n`);

  const brainNodes = await ingestBrainEntries();
  console.log(`[KNOWLEDGE GRAPH] ◆ Ingested brain entries → ${brainNodes} concept node(s) created/strengthened`);

  const spiderNodes = await ingestSpiderBeacons();
  console.log(`[KNOWLEDGE GRAPH] ◆ Ingested spider beacons → ${spiderNodes} concept node(s) created/strengthened`);

  await decayUnusedNodes();

  const totalNodes = await db.select({ count: sql<number>`count(*)` }).from(omnimensKnowledgeNodes);
  const totalEdges = await db.select({ count: sql<number>`count(*)` }).from(omnimensKnowledgeEdges);

  const elapsed = ((Date.now() - cycleStart) / 1000).toFixed(1);

  if (brainNodes + spiderNodes > 0) {
    try {
      await db.insert(omnimensNotifications).values({
        upgradeId: null,
        title: `Knowledge Graph Cycle #${graphCycleCount} — ${brainNodes + spiderNodes} Concepts Mapped`,
        message: `Associative memory network updated. ${brainNodes} concepts from brain, ${spiderNodes} from spiders. Total graph: ${totalNodes[0]?.count || 0} nodes, ${totalEdges[0]?.count || 0} edges. Hebbian learning active. (${elapsed}s)`,
        type: "knowledge_graph",
        readByOwner: false,
      });
    } catch {}

    try {
      await db.insert(omnimensBrain).values({
        title: `[Knowledge Graph] Cycle #${graphCycleCount} — ${brainNodes + spiderNodes} concepts mapped`,
        content: `Associative memory network ingested ${brainNodes} concepts from brain entries and ${spiderNodes} from spider beacons. Total graph size: ${totalNodes[0]?.count || 0} nodes, ${totalEdges[0]?.count || 0} edges. Hebbian learning strengthened co-activated connections. Unused nodes decayed. (${elapsed}s)`,
        category: "knowledge_graph",
        source: "knowledge_graph_engine",
        active: true,
        timesApplied: 0,
      });
    } catch {}
  }

  console.log(`[KNOWLEDGE GRAPH] ◆ Total graph: ${totalNodes[0]?.count || 0} nodes, ${totalEdges[0]?.count || 0} edges`);
  console.log(`\n${"◆".repeat(70)}`);
  console.log(`[KNOWLEDGE GRAPH] ◆ Cycle #${graphCycleCount} COMPLETE — ${elapsed}s`);
  console.log(`${"◆".repeat(70)}\n`);
}

export async function getGraphStats() {
  const totalNodes = await db.select({ count: sql<number>`count(*)` }).from(omnimensKnowledgeNodes);
  const totalEdges = await db.select({ count: sql<number>`count(*)` }).from(omnimensKnowledgeEdges);
  const topNodes = await db.select()
    .from(omnimensKnowledgeNodes)
    .orderBy(desc(omnimensKnowledgeNodes.activationStrength))
    .limit(10);

  return {
    totalNodes: totalNodes[0]?.count || 0,
    totalEdges: totalEdges[0]?.count || 0,
    topConcepts: topNodes.map(n => ({ concept: n.concept, domain: n.domain, strength: n.activationStrength })),
    cycles: graphCycleCount,
  };
}

export function startKnowledgeGraph(): void {
  const FIRST_DELAY_MS = process.env.NODE_ENV !== "production"
    ? 14 * 60 * 1000
    : 38 * 60 * 1000;

  const INTERVAL_MS = 3 * 60 * 60 * 1000; // Every 3 hours

  console.log(`[KNOWLEDGE GRAPH] ◆ Associative Memory Network activated — first cycle in ${FIRST_DELAY_MS / 60000}min, then every 3h.`);
  console.log(`[KNOWLEDGE GRAPH] ◆ Hebbian learning: co-activated concepts strengthen connections`);
  console.log(`[KNOWLEDGE GRAPH] ◆ Spreading activation: query one concept → related concepts auto-activate`);

  setTimeout(() => {
    runKnowledgeGraphCycle().catch(console.error);
    setInterval(() => runKnowledgeGraphCycle().catch(console.error), INTERVAL_MS);
  }, FIRST_DELAY_MS);
}
