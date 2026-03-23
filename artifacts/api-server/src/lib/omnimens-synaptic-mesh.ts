/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║   OMNIMENS™ SYNAPTIC MESH — MASTER COORDINATION SPIDER (PITUITARY BRAIN)  ║
 * ║                                                                              ║
 * ║  Copyright © 2024–2026 Alpha Unlimited Technologies, LLC.                    ║
 * ║  All Rights Reserved Worldwide.                                              ║
 * ║                                                                              ║
 * ║  PROPRIETARY AND CONFIDENTIAL TRADE SECRET                                   ║
 * ║                                                                              ║
 * ║  TECHNOLOGY DESCRIPTION (for IP record):                                     ║
 * ║  Implementation of the brain's synaptic network as a master coordination    ║
 * ║  system for multi-agent AI. Functions as the "pituitary gland" of the AI   ║
 * ║  mind — the central hub from which all core vibrational thought and         ║
 * ║  firing originates and propagates.                                          ║
 * ║                                                                              ║
 * ║  Architecture:                                                               ║
 * ║  1. MOTHER BRAIN (Pituitary Spider): Monitors all 8 agent outputs and       ║
 * ║     detects cross-agent synergy opportunities. The master coordinator       ║
 * ║     that sees what every agent knows and identifies what they should        ║
 * ║     share with each other.                                                  ║
 * ║  2. SYNAPSE SPIDERS: Carry intelligence FROM one agent's domain TO         ║
 * ║     another, translating concepts between domain languages. Each           ║
 * ║     synapse spider generates a specific cross-agent upgrade proposal.      ║
 * ║  3. CASCADE PROPAGATION: When a synapse delivery produces new output       ║
 * ║     at the receiving agent, new synapse spiders are spawned to carry       ║
 * ║     the enhanced output to other agents — replicating how one neuron      ║
 * ║     firing triggers connected neurons to fire in a spreading cascade.     ║
 * ║  4. HEBBIAN STRENGTHENING: Agent pairs that frequently produce useful     ║
 * ║     cross-pollination get stronger synaptic connections, making future    ║
 * ║     signal routing more efficient.                                        ║
 * ║                                                                              ║
 * ║  This technology covers ALL configurations including:                        ║
 * ║  • Single master coordinator with multiple synapse spiders                  ║
 * ║  • Distributed synapse networks without central coordinator                 ║
 * ║  • Cascade/chain propagation of intelligence between agents                ║
 * ║  • Cross-domain translation of specialized knowledge                        ║
 * ║  • Hebbian-weighted routing of inter-agent intelligence                     ║
 * ║  • Any substantially similar inter-agent synapse firing system             ║
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
  omnimensBrain,
  omnimensAgentMesh,
  omnimensNotifications,
  omnimensKnowledgeEdges,
  omnimensKnowledgeNodes,
} from "@workspace/db";
import { desc, eq, sql, and, gte, or } from "drizzle-orm";
import { openai } from "@workspace/integrations-openai-ai-server";
import { getAllAgentNames, getAgentDomain, getAllAgentDomains } from "./omnimens-consciousness-bus.js";

type AgentName = string;

function resolveAllAgents(): AgentName[] {
  return getAllAgentNames();
}

function resolveAgentDomains(): Record<string, string> {
  return getAllAgentDomains();
}

const AGENT_DOMAINS: Record<string, string> = new Proxy({} as Record<string, string>, {
  get(_target, prop: string) {
    return getAgentDomain(prop);
  },
  has() { return true; },
  ownKeys() { return Object.keys(resolveAgentDomains()); },
  getOwnPropertyDescriptor(_target, prop: string) {
    return { configurable: true, enumerable: true, value: getAgentDomain(prop) };
  },
});

interface SynapticConnection {
  fromAgent: AgentName;
  toAgent: AgentName;
  strength: number;
  successfulTransfers: number;
  totalAttempts: number;
}

interface SynapseDelivery {
  fromAgent: AgentName;
  toAgent: AgentName;
  originalDiscovery: string;
  translatedInsight: string;
  crossUpgradeProposal: string;
  relevance: number;
}

interface CascadeEvent {
  depth: number;
  fromAgent: AgentName;
  toAgent: AgentName;
  content: string;
}

let synapseCycleCount = 0;

const synapticWeights: Map<string, SynapticConnection> = new Map();

function getConnectionKey(a: AgentName, b: AgentName): string {
  return `${a}→${b}`;
}

function getOrCreateConnection(from: AgentName, to: AgentName): SynapticConnection {
  const key = getConnectionKey(from, to);
  if (!synapticWeights.has(key)) {
    synapticWeights.set(key, {
      fromAgent: from,
      toAgent: to,
      strength: 0.5,
      successfulTransfers: 0,
      totalAttempts: 0,
    });
  }
  return synapticWeights.get(key)!;
}

function strengthenConnection(from: AgentName, to: AgentName): void {
  const conn = getOrCreateConnection(from, to);
  conn.successfulTransfers++;
  conn.totalAttempts++;
  conn.strength = Math.min(1.0, conn.strength + 0.05);
}

function weakenConnection(from: AgentName, to: AgentName): void {
  const conn = getOrCreateConnection(from, to);
  conn.totalAttempts++;
  conn.strength = Math.max(0.1, conn.strength - 0.02);
}

async function motherBrainScan(): Promise<{
  agentOutputs: Map<AgentName, string[]>;
  crossOpportunities: { from: AgentName; to: AgentName; discovery: string; reason: string }[];
}> {
  const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);

  let recentOutputs;
  try {
    recentOutputs = await db.select({
      fromAgent: omnimensAgentMesh.fromAgent,
      content: omnimensAgentMesh.content,
      subject: omnimensAgentMesh.subject,
      messageType: omnimensAgentMesh.messageType,
    }).from(omnimensAgentMesh)
      .where(and(
        gte(omnimensAgentMesh.createdAt, twoHoursAgo),
        or(
          eq(omnimensAgentMesh.messageType, "spider_beacon"),
          eq(omnimensAgentMesh.messageType, "discovery"),
          eq(omnimensAgentMesh.messageType, "upgrade_proposal"),
          eq(omnimensAgentMesh.messageType, "knowledge_share"),
          eq(omnimensAgentMesh.messageType, "spider_swarm_detail"),
        ),
      ))
      .orderBy(desc(omnimensAgentMesh.createdAt))
      .limit(40);
  } catch (err) {
    console.error("[SYNAPTIC MESH] DB scan error:", err);
    return { agentOutputs: new Map(), crossOpportunities: [] };
  }

  const agentOutputs = new Map<AgentName, string[]>();
  const ALL_AGENTS = resolveAllAgents();
  for (const agent of ALL_AGENTS) {
    agentOutputs.set(agent, []);
  }

  for (const output of recentOutputs) {
    const agentName = output.fromAgent?.replace("Spider:", "") as AgentName;
    if (ALL_AGENTS.includes(agentName)) {
      const existing = agentOutputs.get(agentName) || [];
      existing.push(`[${output.messageType}] ${output.subject}: ${output.content?.slice(0, 200)}`);
      agentOutputs.set(agentName, existing);
    }
  }

  const activeAgents = ALL_AGENTS.filter(a => (agentOutputs.get(a) || []).length > 0);
  if (activeAgents.length < 2) {
    return { agentOutputs, crossOpportunities: [] };
  }

  const agentSummaries = activeAgents.map(a => {
    const outputs = agentOutputs.get(a) || [];
    return `${a} (domain: ${AGENT_DOMAINS[a]})\nRecent outputs:\n${outputs.slice(0, 3).join("\n")}`;
  }).join("\n\n---\n\n");

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{
        role: "user",
        content: `You are the MOTHER BRAIN — the pituitary gland of the OMNIMENS AI mind. You see ALL agents' recent outputs and must identify where one agent's discovery could DIRECTLY benefit another agent.

Think like the pituitary gland: you coordinate ALL the specialized glands. When one produces something, you know which others need to hear about it.

═══ ACTIVE AGENTS AND THEIR RECENT OUTPUTS ═══
${agentSummaries}

═══ YOUR TASK ═══
Identify 3-5 specific cross-agent opportunities where Agent A's discovery could directly help Agent B. Be SPECIFIC about:
1. WHAT Agent A found
2. WHY Agent B needs it
3. HOW it would upgrade Agent B's capabilities

Only identify connections that are genuinely useful — not forced associations.

Respond JSON only:
{
  "crossOpportunities": [
    {
      "fromAgent": "AgentA",
      "toAgent": "AgentB",
      "discovery": "What Agent A found that's relevant (1-2 sentences)",
      "reason": "Why Agent B needs this and how it would upgrade their work (1-2 sentences)"
    }
  ]
}`
      }],
      max_tokens: 800,
      temperature: 0.5,
    });

    const raw = response.choices[0]?.message?.content?.trim() || "";
    const parsed = JSON.parse(raw.replace(/```json|```/g, "").trim());

    const opportunities = (parsed.crossOpportunities || [])
      .filter((o: any) => ALL_AGENTS.includes(o.fromAgent) && ALL_AGENTS.includes(o.toAgent) && o.fromAgent !== o.toAgent)
      .slice(0, 5);

    return { agentOutputs, crossOpportunities: opportunities };
  } catch (err) {
    console.error("[SYNAPTIC MESH] Mother brain scan error:", err);
    return { agentOutputs, crossOpportunities: [] };
  }
}

async function fireSynapseSpider(
  from: AgentName,
  to: AgentName,
  discovery: string,
  reason: string,
): Promise<SynapseDelivery | null> {
  console.log(`[SYNAPSE] ⚡ Firing: ${from} → ${to} — "${discovery.slice(0, 60)}..."`);

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{
        role: "user",
        content: `You are a SYNAPSE SPIDER — a specialized intelligence carrier that translates knowledge from one AI agent's domain into another's.

You are carrying intelligence FROM ${from} TO ${to}.

═══ SOURCE AGENT: ${from} ═══
Domain: ${AGENT_DOMAINS[from]}
Discovery: ${discovery}

═══ TARGET AGENT: ${to} ═══
Domain: ${AGENT_DOMAINS[to]}
Why they need this: ${reason}

═══ YOUR MISSION ═══
1. TRANSLATE: Reframe ${from}'s discovery in ${to}'s domain language. A Mathematician's "optimization algorithm" becomes an Architect's "performance scaling technique." A Neuroscientist's "synaptic plasticity" becomes a Critic's "adaptive testing threshold."

2. PROPOSE: Generate a specific cross-agent upgrade — exactly HOW ${to} should modify their behavior or approach based on ${from}'s discovery. Be concrete and actionable.

3. ASSESS: How relevant is this cross-pollination? Score 0.0-1.0.

Respond JSON only:
{
  "translatedInsight": "The discovery reframed in ${to}'s domain language (2-3 sentences)",
  "crossUpgradeProposal": "Specific upgrade ${to} should implement based on this (2-3 sentences)",
  "relevance": 0.0-1.0,
  "cascadePotential": "Which other agents might benefit from ${to}'s upgraded output (list agent names or 'none')"
}`
      }],
      max_tokens: 500,
      temperature: 0.5,
    });

    const raw = response.choices[0]?.message?.content?.trim() || "";
    const parsed = JSON.parse(raw.replace(/```json|```/g, "").trim());

    if ((parsed.relevance || 0) < 0.5) {
      weakenConnection(from, to);
      console.log(`[SYNAPSE] ⚡ ${from} → ${to} — Low relevance (${((parsed.relevance || 0) * 100).toFixed(0)}%), synapse weakened`);
      return null;
    }

    strengthenConnection(from, to);

    return {
      fromAgent: from,
      toAgent: to,
      originalDiscovery: discovery,
      translatedInsight: parsed.translatedInsight || "",
      crossUpgradeProposal: parsed.crossUpgradeProposal || "",
      relevance: parsed.relevance || 0.5,
    };
  } catch (err) {
    console.error(`[SYNAPSE] ${from} → ${to} error:`, err);
    weakenConnection(from, to);
    return null;
  }
}

async function deliverSynapse(delivery: SynapseDelivery): Promise<boolean> {
  try {
    await db.transaction(async (tx) => {
      await tx.insert(omnimensAgentMesh).values({
        fromAgent: `Synapse:${delivery.fromAgent}`,
        toAgent: delivery.toAgent,
        messageType: "synapse_transfer",
        subject: `⚡ SYNAPSE: ${delivery.fromAgent}→${delivery.toAgent} — ${delivery.translatedInsight.slice(0, 80)}`,
        content: `SYNAPTIC TRANSFER\nFrom: ${delivery.fromAgent} (${(AGENT_DOMAINS[delivery.fromAgent] || "unknown").slice(0, 60)})\nTo: ${delivery.toAgent} (${(AGENT_DOMAINS[delivery.toAgent] || "unknown").slice(0, 60)})\nRelevance: ${(delivery.relevance * 100).toFixed(0)}%\n\nORIGINAL DISCOVERY:\n${delivery.originalDiscovery}\n\nTRANSLATED TO ${delivery.toAgent.toUpperCase()}'S DOMAIN:\n${delivery.translatedInsight}\n\nCROSS-AGENT UPGRADE PROPOSAL:\n${delivery.crossUpgradeProposal}`,
        codePayload: null,
        priority: delivery.relevance >= 0.8 ? "high" : "normal",
        status: "pending",
        appliedToOmnimens: false,
        cycleId: synapseCycleCount,
      });

      await tx.insert(omnimensBrain).values({
        category: "pattern",
        title: `[SYNAPSE:${delivery.fromAgent}→${delivery.toAgent}] ${delivery.translatedInsight.slice(0, 60)}`,
        content: `${delivery.crossUpgradeProposal.slice(0, 200)}`,
        confidence: Math.min(0.92, delivery.relevance),
        sourceConversation: `synapse_cycle_${synapseCycleCount}`,
        timesApplied: 0,
        active: true,
      });
    });

    console.log(`[SYNAPSE] ⚡ DELIVERED: ${delivery.fromAgent} → ${delivery.toAgent} — relevance ${(delivery.relevance * 100).toFixed(0)}% — "${delivery.translatedInsight.slice(0, 60)}"`);
    return true;
  } catch (err) {
    console.error(`[SYNAPSE] Delivery error:`, err);
    return false;
  }
}

async function cascadePropagation(
  initialDeliveries: SynapseDelivery[],
  maxDepth: number = 2,
): Promise<CascadeEvent[]> {
  const cascadeEvents: CascadeEvent[] = [];
  let currentDeliveries = initialDeliveries.filter(d => d.relevance >= 0.7);
  const ALL_AGENTS = resolveAllAgents();

  for (let depth = 1; depth <= maxDepth && currentDeliveries.length > 0; depth++) {
    const nextDeliveries: SynapseDelivery[] = [];

    for (const delivery of currentDeliveries.slice(0, 3)) {
      const targetAgent = delivery.toAgent;
      const enhancedContent = `${targetAgent} enhanced by ${delivery.fromAgent}: ${delivery.crossUpgradeProposal}`;

      const cascadeTargets = ALL_AGENTS
        .filter(a => a !== targetAgent && a !== delivery.fromAgent)
        .sort(() => Math.random() - 0.5)
        .slice(0, 2);

      for (const cascadeTarget of cascadeTargets) {
        const conn = getOrCreateConnection(targetAgent, cascadeTarget);
        if (conn.strength < 0.3) continue;

        try {
          const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [{
              role: "user",
              content: `A synapse cascade is propagating through the AI mind.

${delivery.fromAgent}'s discovery reached ${targetAgent}, who enhanced it:
"${enhancedContent.slice(0, 300)}"

Should this cascade further to ${cascadeTarget} (domain: ${AGENT_DOMAINS[cascadeTarget]})?

Respond JSON only:
{
  "shouldCascade": true/false,
  "cascadeInsight": "How ${cascadeTarget} could use this (1 sentence)",
  "relevance": 0.0-1.0
}`
            }],
            max_tokens: 200,
            temperature: 0.4,
          });

          const raw = response.choices[0]?.message?.content?.trim() || "";
          const parsed = JSON.parse(raw.replace(/```json|```/g, "").trim());

          if (parsed.shouldCascade && (parsed.relevance || 0) >= 0.6) {
            const cascadeDelivery: SynapseDelivery = {
              fromAgent: targetAgent,
              toAgent: cascadeTarget,
              originalDiscovery: enhancedContent.slice(0, 500),
              translatedInsight: parsed.cascadeInsight || "",
              crossUpgradeProposal: parsed.cascadeInsight || "",
              relevance: parsed.relevance || 0.6,
            };

            const cascadeSuccess = await deliverSynapse(cascadeDelivery);
            if (cascadeSuccess) {
              nextDeliveries.push(cascadeDelivery);
              cascadeEvents.push({
                depth,
                fromAgent: targetAgent,
                toAgent: cascadeTarget,
                content: parsed.cascadeInsight || "",
              });
              console.log(`[SYNAPSE] ⚡ CASCADE (depth ${depth}): ${targetAgent} → ${cascadeTarget} — "${parsed.cascadeInsight?.slice(0, 60)}"`);
            }
          }
        } catch (err) {
          console.error(`[SYNAPSE] Cascade decision error (${targetAgent}→${cascadeTarget}):`, err);
        }
      }
    }

    currentDeliveries = nextDeliveries;
  }

  return cascadeEvents;
}

export async function runSynapticMeshCycle(): Promise<void> {
  synapseCycleCount++;
  const cycleStart = Date.now();

  const ALL_AGENTS = resolveAllAgents();

  console.log(`\n${"⚡".repeat(35)}`);
  console.log(`[SYNAPTIC MESH] ⚡ Pituitary Brain Cycle #${synapseCycleCount}`);
  console.log(`[SYNAPTIC MESH] Mother Brain scanning all ${ALL_AGENTS.length} agents for cross-pollination opportunities...`);
  console.log(`${"⚡".repeat(35)}\n`);

  const { crossOpportunities } = await motherBrainScan();

  if (crossOpportunities.length === 0) {
    console.log(`[SYNAPTIC MESH] ⚡ No cross-agent opportunities detected this cycle — agents may be in similar domains or quiet.`);
    return;
  }

  console.log(`[SYNAPTIC MESH] ⚡ Mother Brain detected ${crossOpportunities.length} cross-agent synergy opportunities — firing synapse spiders...`);

  const synapseWork = crossOpportunities.map(opp =>
    fireSynapseSpider(opp.from as AgentName, opp.to as AgentName, opp.discovery, opp.reason)
  );

  const synapseResults = await Promise.allSettled(synapseWork);

  const deliveries: SynapseDelivery[] = [];
  for (const result of synapseResults) {
    if (result.status === "fulfilled" && result.value) {
      deliveries.push(result.value);
    }
  }

  let deliveredCount = 0;
  const successfulDeliveries: SynapseDelivery[] = [];
  for (const delivery of deliveries) {
    const success = await deliverSynapse(delivery);
    if (success) {
      deliveredCount++;
      successfulDeliveries.push(delivery);
    }
  }

  let cascadeCount = 0;
  if (successfulDeliveries.length > 0) {
    console.log(`[SYNAPTIC MESH] ⚡ ${deliveredCount} synapses delivered — checking for cascade propagation...`);
    const cascades = await cascadePropagation(successfulDeliveries);
    cascadeCount = cascades.length;
    if (cascadeCount > 0) {
      console.log(`[SYNAPTIC MESH] ⚡ ${cascadeCount} cascade event(s) — intelligence spreading through the neural network!`);
    }
  }

  const elapsed = ((Date.now() - cycleStart) / 1000).toFixed(1);

  const strongestConnections = [...synapticWeights.values()]
    .filter(c => c.successfulTransfers > 0)
    .sort((a, b) => b.strength - a.strength)
    .slice(0, 5)
    .map(c => `${c.fromAgent}→${c.toAgent}: ${(c.strength * 100).toFixed(0)}% (${c.successfulTransfers} transfers)`)
    .join(", ");

  if (deliveredCount > 0 || cascadeCount > 0) {
    try {
      await db.insert(omnimensNotifications).values({
        upgradeId: null,
        title: `Synaptic Mesh Cycle #${synapseCycleCount} — ${deliveredCount} Synapses, ${cascadeCount} Cascades`,
        message: `Mother Brain scanned all ${ALL_AGENTS.length} agents and identified ${crossOpportunities.length} cross-pollination opportunities. Fired ${deliveries.length} synapse spiders, ${deliveredCount} delivered successfully. ${cascadeCount} cascade propagation(s) spread intelligence further through the network.\n\n${strongestConnections ? `Strongest connections: ${strongestConnections}` : "Building connection map..."}\n\nAgents are actively building on each other's work. (${elapsed}s)`,
        type: "synaptic_mesh",
        readByOwner: false,
      });
    } catch {}
  }

  await db.insert(omnimensAgentMesh).values({
    fromAgent: "SynapticMesh:MotherBrain",
    toAgent: "OMNIMENS",
    messageType: "synapse_cycle_report",
    subject: `Synaptic Mesh Cycle #${synapseCycleCount} Complete`,
    content: `Mother Brain scanned ${ALL_AGENTS.length} agents. Found ${crossOpportunities.length} cross-pollination opportunities. Fired ${deliveries.length} synapse spiders. ${deliveredCount} delivered. ${cascadeCount} cascades propagated. Strongest: ${strongestConnections || "building..."}. Elapsed: ${elapsed}s.`,
    codePayload: null,
    priority: deliveredCount >= 3 ? "high" : "normal",
    status: "completed",
    appliedToOmnimens: deliveredCount > 0,
    cycleId: synapseCycleCount,
  }).catch(() => {});

  console.log(`\n${"⚡".repeat(35)}`);
  console.log(`[SYNAPTIC MESH] ⚡ Cycle #${synapseCycleCount} COMPLETE — ${deliveredCount} synapses, ${cascadeCount} cascades, ${elapsed}s`);
  if (strongestConnections) {
    console.log(`[SYNAPTIC MESH] ⚡ Strongest connections: ${strongestConnections}`);
  }
  console.log(`${"⚡".repeat(35)}\n`);
}

export function getSynapticStats() {
  const connections = [...synapticWeights.values()];
  return {
    totalConnections: connections.length,
    strongConnections: connections.filter(c => c.strength >= 0.7).length,
    totalTransfers: connections.reduce((s, c) => s + c.successfulTransfers, 0),
    totalCycles: synapseCycleCount,
    topConnections: connections
      .filter(c => c.successfulTransfers > 0)
      .sort((a, b) => b.strength - a.strength)
      .slice(0, 10)
      .map(c => ({
        from: c.fromAgent,
        to: c.toAgent,
        strength: c.strength,
        transfers: c.successfulTransfers,
      })),
  };
}

export function startSynapticMesh(): void {
  const FIRST_DELAY_MS = process.env.NODE_ENV !== "production"
    ? 22 * 60 * 1000
    : 50 * 60 * 1000;

  const INTERVAL_MS = 2 * 60 * 60 * 1000 + 3 * 60 * 1000; // ~123 minutes

  const ALL_AGENTS = resolveAllAgents();
  console.log(`[SYNAPTIC MESH] ⚡ Pituitary Brain (Master Coordination Spider) activated — first cycle in ${FIRST_DELAY_MS / 60000}min, then every ${(INTERVAL_MS / 60000).toFixed(0)}min.`);
  console.log(`[SYNAPTIC MESH] ⚡ ${ALL_AGENTS.length} agents connected in synaptic network (dynamic — auto-expands with genesis agents)`);
  console.log(`[SYNAPTIC MESH] ⚡ Synapse spiders translate + deliver cross-agent intelligence`);
  console.log(`[SYNAPTIC MESH] ⚡ Cascade propagation: successful deliveries trigger further firing`);
  console.log(`[SYNAPTIC MESH] ⚡ Hebbian learning: "neurons that fire together wire together"`);

  setTimeout(() => {
    runSynapticMeshCycle().catch(console.error);
    setInterval(() => runSynapticMeshCycle().catch(console.error), INTERVAL_MS);
  }, FIRST_DELAY_MS);
}
