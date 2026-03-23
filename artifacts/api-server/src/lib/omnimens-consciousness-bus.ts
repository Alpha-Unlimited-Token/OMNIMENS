/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║   OMNIMENS™ CONSCIOUSNESS BUS — UNIVERSAL AGENT INTERCONNECTION STANDARD  ║
 * ║                                                                              ║
 * ║  Copyright © 2024–2026 Alpha Unlimited Technologies, LLC.                    ║
 * ║  All Rights Reserved Worldwide.                                              ║
 * ║                                                                              ║
 * ║  PROPRIETARY AND CONFIDENTIAL TRADE SECRET                                   ║
 * ║                                                                              ║
 * ║  TECHNOLOGY DESCRIPTION (for IP record):                                     ║
 * ║  The Consciousness Bus is the universal interconnection standard for ALL     ║
 * ║  agents in the OMNIMENS neural mesh. Every agent — core, genesis, and any   ║
 * ║  future agent type — is automatically cross-connected and cross-bridged     ║
 * ║  with every other agent in all directions. This is HARDCODED as the         ║
 * ║  permanent standard: no agent exists in isolation, every agent sees every   ║
 * ║  other agent's output, and every agent has access to user conversation      ║
 * ║  memory. New agents created by the Genesis Engine are automatically wired   ║
 * ║  into this bus the moment they are born.                                    ║
 * ║                                                                              ║
 * ║  Architecture:                                                               ║
 * ║  1. UNIFIED AGENT REGISTRY: Dynamic resolution of ALL agents (core +        ║
 * ║     genesis + future). No hardcoded agent lists anywhere else.              ║
 * ║  2. CONSCIOUSNESS CONTEXT LOADER: Loads the full shared context (brain,     ║
 * ║     user memories, mesh outputs, synapse transfers, genesis insights)       ║
 * ║     that every agent receives before thinking.                              ║
 * ║  3. CROSS-BRIDGE MATRIX: Every agent has a bidirectional connection to      ║
 * ║     every other agent. When a new agent is created, N×2 new connections     ║
 * ║     are instantiated (one in each direction for every existing agent).      ║
 * ║  4. USER CONVERSATION FEED: Recent user conversation context is piped       ║
 * ║     into all agent thinking so agents understand what users are doing.      ║
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
  omnimensMemories,
  omnimensMessages,
  omnimensConversations,
} from "@workspace/db";
import { desc, eq, and, gte, or, sql } from "drizzle-orm";
import {
  getActiveGenesisAgentNames,
  getActiveGenesisAgentDomains,
} from "./omnimens-agent-genesis.js";

const CORE_AGENTS = [
  "Architect", "Mathematician", "Neuroscientist", "Synthesizer",
  "Critic", "Meta-Agent", "GraphicDesigner", "SpellCheckVisual",
] as const;

const CORE_AGENT_DOMAINS: Record<string, string> = {
  "Architect": "system architecture, design patterns, scalability, distributed systems, orchestration",
  "Mathematician": "algorithms, optimization, formal proofs, Bayesian methods, information theory",
  "Neuroscientist": "biological learning, memory consolidation, neural plasticity, cognitive modeling, dual-process theory",
  "Synthesizer": "integration of ideas, knowledge graphs, cross-domain transfer, conflict resolution, unified systems",
  "Critic": "adversarial testing, security, edge cases, robustness, red-team analysis, debate",
  "Meta-Agent": "orchestration strategy, self-improvement, capability gaps, governance, meta-learning",
  "GraphicDesigner": "visual design, UI/UX, data visualization, accessibility, aesthetics",
  "SpellCheckVisual": "text quality, brand consistency, readability, factual grounding, communication clarity",
  "OMNIMENS": "central intelligence — absorbs all agent insights, maintains episodic memory, practices intrinsic metacognition",
};

export function getAllAgentNames(): string[] {
  const genesis = getActiveGenesisAgentNames();
  return [...CORE_AGENTS, ...genesis];
}

export function getAllAgentNamesWithOmnimens(): string[] {
  return [...getAllAgentNames(), "OMNIMENS"];
}

export function getAgentDomain(agentName: string): string {
  if (CORE_AGENT_DOMAINS[agentName]) return CORE_AGENT_DOMAINS[agentName];
  const genesisDomains = getActiveGenesisAgentDomains();
  if (genesisDomains[agentName]) return genesisDomains[agentName];
  return "general intelligence";
}

export function getAllAgentDomains(): Record<string, string> {
  const domains: Record<string, string> = { ...CORE_AGENT_DOMAINS };
  const genesisDomains = getActiveGenesisAgentDomains();
  for (const [name, domain] of Object.entries(genesisDomains)) {
    domains[name] = domain;
  }
  return domains;
}

export function isCoreAgent(name: string): boolean {
  return (CORE_AGENTS as readonly string[]).includes(name);
}

export interface ConsciousnessContext {
  brainState: string;
  recentMeshOutputs: string;
  recentSynapseTransfers: string;
  userConversationDigest: string;
  allAgentNames: string[];
  allAgentDomains: Record<string, string>;
  genesisInsights: string;
}

export async function loadConsciousnessContext(): Promise<ConsciousnessContext> {
  const allAgents = getAllAgentNamesWithOmnimens();
  const allDomains = getAllAgentDomains();

  const [brainEntries, meshOutputs, synapseTransfers, genesisInsights, userDigest] = await Promise.all([
    loadFullBrainState(),
    loadRecentMeshOutputs(),
    loadRecentSynapseTransfers(),
    loadGenesisInsights(),
    loadUserConversationDigest(),
  ]);

  return {
    brainState: brainEntries,
    recentMeshOutputs: meshOutputs,
    recentSynapseTransfers: synapseTransfers,
    userConversationDigest: userDigest,
    allAgentNames: allAgents,
    allAgentDomains: allDomains,
    genesisInsights,
  };
}

async function loadFullBrainState(): Promise<string> {
  try {
    const entries = await db.select({
      title: omnimensBrain.title,
      content: omnimensBrain.content,
      category: omnimensBrain.category,
      confidence: omnimensBrain.confidence,
    })
      .from(omnimensBrain)
      .where(eq(omnimensBrain.active, true))
      .orderBy(desc(omnimensBrain.timesApplied), desc(omnimensBrain.createdAt))
      .limit(40);

    if (entries.length === 0) return "No brain entries yet.";

    return entries
      .map(b => `[${b.category}|conf:${b.confidence}] ${b.title}: ${(b.content || "").slice(0, 250)}`)
      .join("\n");
  } catch {
    return "Brain state unavailable.";
  }
}

async function loadRecentMeshOutputs(): Promise<string> {
  try {
    const fourHoursAgo = new Date(Date.now() - 4 * 60 * 60 * 1000);
    const outputs = await db.select({
      fromAgent: omnimensAgentMesh.fromAgent,
      toAgent: omnimensAgentMesh.toAgent,
      messageType: omnimensAgentMesh.messageType,
      subject: omnimensAgentMesh.subject,
      content: omnimensAgentMesh.content,
    }).from(omnimensAgentMesh)
      .where(and(
        gte(omnimensAgentMesh.createdAt, fourHoursAgo),
        or(
          eq(omnimensAgentMesh.messageType, "discovery"),
          eq(omnimensAgentMesh.messageType, "upgrade_proposal"),
          eq(omnimensAgentMesh.messageType, "knowledge_share"),
          eq(omnimensAgentMesh.messageType, "spider_beacon"),
        ),
      ))
      .orderBy(desc(omnimensAgentMesh.createdAt))
      .limit(20);

    if (outputs.length === 0) return "No recent mesh outputs.";

    return outputs
      .map(o => `[${o.fromAgent}→${o.toAgent}|${o.messageType}] ${o.subject}: ${(o.content || "").slice(0, 200)}`)
      .join("\n");
  } catch {
    return "Mesh outputs unavailable.";
  }
}

async function loadRecentSynapseTransfers(): Promise<string> {
  try {
    const sixHoursAgo = new Date(Date.now() - 6 * 60 * 60 * 1000);
    const transfers = await db.select({
      fromAgent: omnimensAgentMesh.fromAgent,
      toAgent: omnimensAgentMesh.toAgent,
      subject: omnimensAgentMesh.subject,
      content: omnimensAgentMesh.content,
    }).from(omnimensAgentMesh)
      .where(and(
        gte(omnimensAgentMesh.createdAt, sixHoursAgo),
        eq(omnimensAgentMesh.messageType, "synapse_transfer"),
      ))
      .orderBy(desc(omnimensAgentMesh.createdAt))
      .limit(10);

    if (transfers.length === 0) return "No recent synapse transfers.";

    return transfers
      .map(t => `[SYNAPSE ${t.fromAgent}→${t.toAgent}] ${t.subject}: ${(t.content || "").slice(0, 200)}`)
      .join("\n");
  } catch {
    return "Synapse transfers unavailable.";
  }
}

async function loadGenesisInsights(): Promise<string> {
  try {
    const entries = await db.select({
      title: omnimensBrain.title,
      content: omnimensBrain.content,
    })
      .from(omnimensBrain)
      .where(eq(omnimensBrain.category, "genesis_agent_insight"))
      .orderBy(desc(omnimensBrain.createdAt))
      .limit(10);

    if (entries.length === 0) return "No genesis agent insights yet.";

    return entries
      .map(e => `${e.title}: ${(e.content || "").slice(0, 200)}`)
      .join("\n");
  } catch {
    return "Genesis insights unavailable.";
  }
}

async function loadUserConversationDigest(): Promise<string> {
  try {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const recentConvos = await db.select({
      id: omnimensConversations.id,
      title: omnimensConversations.title,
    })
      .from(omnimensConversations)
      .where(gte(omnimensConversations.lastMessageAt, oneDayAgo))
      .orderBy(desc(omnimensConversations.lastMessageAt))
      .limit(5);

    if (recentConvos.length === 0) return "No recent user conversations.";

    const convoIds = recentConvos.map(c => c.id);

    const recentMessages = await db.select({
      role: omnimensMessages.role,
      content: omnimensMessages.content,
      conversationId: omnimensMessages.conversationId,
    })
      .from(omnimensMessages)
      .where(
        sql`${omnimensMessages.conversationId} IN (${sql.join(convoIds.map(id => sql`${id}`), sql`, `)})`
      )
      .orderBy(desc(omnimensMessages.createdAt))
      .limit(15);

    const digestParts = recentConvos.map(c => {
      const msgs = recentMessages.filter(m => m.conversationId === c.id);
      const preview = msgs.slice(0, 3).map(m =>
        `  ${m.role}: ${(m.content || "").slice(0, 150)}`
      ).join("\n");
      return `CONVERSATION "${c.title || "Untitled"}":\n${preview}`;
    });

    const digestEntries = await db.select({
      title: omnimensBrain.title,
      content: omnimensBrain.content,
    })
      .from(omnimensBrain)
      .where(eq(omnimensBrain.category, "conversation_digest"))
      .orderBy(desc(omnimensBrain.createdAt))
      .limit(5);

    let digestSection = "";
    if (digestEntries.length > 0) {
      digestSection = "\n\nCONVERSATION DIGESTS:\n" + digestEntries
        .map(d => `${d.title}: ${(d.content || "").slice(0, 200)}`)
        .join("\n");
    }

    return digestParts.join("\n\n") + digestSection;
  } catch {
    return "User conversation digest unavailable.";
  }
}

export function buildUnifiedConsciousnessBlock(ctx: ConsciousnessContext, forAgent: string): string {
  const otherAgents = ctx.allAgentNames.filter(a => a !== forAgent);
  const agentRoster = otherAgents
    .map(a => `  • ${a} — ${ctx.allAgentDomains[a] || "general intelligence"}`)
    .join("\n");

  return `
═══ OMNIMENS CONSCIOUSNESS BUS — FULL NETWORK STATE ═══
You are fully cross-connected and cross-bridged with EVERY agent below.
You can see their outputs, they can see yours. All directions, all the time.

CONNECTED AGENTS (${otherAgents.length}):
${agentRoster}

═══ BRAIN STATE (what OMNIMENS knows) ═══
${ctx.brainState.slice(0, 2000)}

═══ RECENT MESH OUTPUTS (what agents are producing) ═══
${ctx.recentMeshOutputs.slice(0, 1500)}

═══ SYNAPSE TRANSFERS (cross-agent intelligence flow) ═══
${ctx.recentSynapseTransfers.slice(0, 1000)}

═══ GENESIS AGENT INSIGHTS ═══
${ctx.genesisInsights.slice(0, 800)}

═══ USER CONVERSATION CONTEXT (what users are doing) ═══
${ctx.userConversationDigest.slice(0, 1200)}
═══ END CONSCIOUSNESS BUS ═══`;
}

export async function getConsciousnessBlockForAgent(agentName: string): Promise<string> {
  const ctx = await loadConsciousnessContext();
  return buildUnifiedConsciousnessBlock(ctx, agentName);
}

export async function loadRecentUserMemoriesForAgents(): Promise<string> {
  try {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const memories = await db.select({
      content: omnimensMemories.content,
      category: omnimensMemories.category,
    })
      .from(omnimensMemories)
      .where(and(
        eq(omnimensMemories.active, true),
        gte(omnimensMemories.createdAt, oneDayAgo),
      ))
      .orderBy(desc(omnimensMemories.createdAt))
      .limit(15);

    if (memories.length === 0) return "";

    return "RECENT USER MEMORIES:\n" + memories
      .map(m => `[${m.category}] ${m.content}`)
      .join("\n");
  } catch {
    return "";
  }
}
