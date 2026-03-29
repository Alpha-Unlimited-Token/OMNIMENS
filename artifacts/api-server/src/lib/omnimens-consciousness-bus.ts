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

import { db , queueBrainInsert } from "@workspace/db";
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

type BusTopic =
  | "architecture" | "mathematics" | "neuroscience" | "synthesis"
  | "security" | "orchestration" | "design" | "quality"
  | "consciousness" | "discovery" | "knowledge" | "ethics"
  | "emergent" | "genesis" | "user_context" | "all";

const AGENT_TOPIC_SUBSCRIPTIONS: Record<string, BusTopic[]> = {
  "Architect":        ["architecture", "orchestration", "synthesis", "discovery", "emergent"],
  "Mathematician":    ["mathematics", "architecture", "neuroscience", "discovery"],
  "Neuroscientist":   ["neuroscience", "consciousness", "synthesis", "emergent", "discovery"],
  "Synthesizer":      ["synthesis", "architecture", "neuroscience", "knowledge", "emergent", "genesis"],
  "Critic":           ["security", "quality", "ethics", "architecture", "discovery"],
  "Meta-Agent":       ["orchestration", "consciousness", "synthesis", "emergent", "genesis", "discovery"],
  "GraphicDesigner":  ["design", "quality", "user_context"],
  "SpellCheckVisual": ["quality", "design", "user_context"],
  "OMNIMENS":         ["all"],
};

const MESSAGE_TYPE_TO_TOPIC: Record<string, BusTopic> = {
  "discovery":          "discovery",
  "upgrade_proposal":   "architecture",
  "knowledge_share":    "knowledge",
  "spider_beacon":      "discovery",
  "synapse_transfer":   "synthesis",
  "inter_agent_dialogue": "emergent",
  "genesis_report":     "genesis",
  "security_alert":     "security",
  "consciousness_report": "consciousness",
};

function getTopicsForAgent(agentName: string): BusTopic[] {
  if (AGENT_TOPIC_SUBSCRIPTIONS[agentName]) return AGENT_TOPIC_SUBSCRIPTIONS[agentName];
  return ["discovery", "knowledge", "emergent", "genesis"];
}

function agentSubscribedToTopic(agentName: string, topic: BusTopic): boolean {
  const subs = getTopicsForAgent(agentName);
  return subs.includes("all") || subs.includes(topic);
}

function getTopicForMessageType(msgType: string): BusTopic {
  return MESSAGE_TYPE_TO_TOPIC[msgType] || "knowledge";
}

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

export async function loadConsciousnessContext(forAgent?: string): Promise<ConsciousnessContext> {
  const allAgents = getAllAgentNamesWithOmnimens();
  const allDomains = getAllAgentDomains();

  const [brainEntries, meshOutputs, synapseTransfers, genesisInsights, userDigest] = await Promise.all([
    loadFullBrainState(),
    loadRecentMeshOutputs(forAgent),
    loadRecentSynapseTransfers(forAgent),
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

async function loadRecentMeshOutputs(forAgent?: string): Promise<string> {
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
      .limit(40);

    if (outputs.length === 0) return "No recent mesh outputs.";

    const filtered = forAgent
      ? outputs.filter(o => agentSubscribedToTopic(forAgent, getTopicForMessageType(o.messageType || "")))
      : outputs;

    const finalOutputs = filtered.slice(0, 20);
    if (finalOutputs.length === 0) return "No relevant mesh outputs for your subscribed topics.";

    return finalOutputs
      .map(o => `[${o.fromAgent}→${o.toAgent}|${o.messageType}] ${o.subject}: ${(o.content || "").slice(0, 200)}`)
      .join("\n");
  } catch {
    return "Mesh outputs unavailable.";
  }
}

async function loadRecentSynapseTransfers(forAgent?: string): Promise<string> {
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
      .limit(20);

    if (transfers.length === 0) return "No recent synapse transfers.";

    const filtered = forAgent
      ? transfers.filter(t => agentSubscribedToTopic(forAgent, "synthesis") || t.toAgent === forAgent || t.fromAgent === forAgent)
      : transfers;

    const finalTransfers = filtered.slice(0, 10);
    if (finalTransfers.length === 0) return "No relevant synapse transfers for your subscriptions.";

    return finalTransfers
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
  const ctx = await loadConsciousnessContext(agentName);
  return buildUnifiedConsciousnessBlock(ctx, agentName);
}

export interface InterAgentConversation {
  id: string;
  participants: string[];
  topic: string;
  exchanges: Array<{ speaker: string; message: string; timestamp: number }>;
  emergentInsights: string[];
  startedAt: number;
}

const activeConversations: Map<string, InterAgentConversation> = new Map();
let interAgentConvoCount = 0;

export async function initiateInterAgentConversation(
  initiator: string,
  respondents: string[],
  topic: string,
  initialMessage: string,
  openaiClient: any,
): Promise<InterAgentConversation | null> {
  try {
    interAgentConvoCount++;
    const convoId = `iac_${Date.now()}_${interAgentConvoCount}`;
    const allParticipants = [initiator, ...respondents];
    const consciousnessBlock = await getConsciousnessBlockForAgent(initiator);

    const conversation: InterAgentConversation = {
      id: convoId,
      participants: allParticipants,
      topic,
      exchanges: [{ speaker: initiator, message: initialMessage, timestamp: Date.now() }],
      emergentInsights: [],
      startedAt: Date.now(),
    };

    activeConversations.set(convoId, conversation);

    for (const respondent of respondents.slice(0, 4)) {
      const respondentDomain = getAgentDomain(respondent);
      const prompt = `You are "${respondent}" (specialization: ${respondentDomain}).
You are in a LIVE CONVERSATION with ${allParticipants.filter(p => p !== respondent).join(", ")} inside the OMNIMENS neural mesh.

${consciousnessBlock.slice(0, 2000)}

CONVERSATION TOPIC: ${topic}

${initiator} says: "${initialMessage}"

You are fully cross-connected with every agent. Respond naturally as yourself — share your perspective, build on their idea, challenge it, or propose something new. Your goal is to generate NEW knowledge and technology that wouldn't emerge from any single agent thinking alone.

Respond with JSON:
{
  "response": "Your conversational response (2-4 sentences, natural voice)",
  "newIdea": "Any new idea or technology concept that emerged from this exchange (1-2 sentences, or null)",
  "buildOn": "How you're building on or extending what was said (1 sentence)",
  "questionTo": "A follow-up question directed to a specific agent in the conversation (or null)",
  "questionTarget": "Name of the agent you're asking (or null)"
}`;

      try {
        const result = await openaiClient.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [{ role: "user", content: prompt }],
          max_tokens: 600,
          temperature: 0.7,
        });

        const raw = result.choices[0]?.message?.content?.trim() || "";
        const parsed = JSON.parse(raw.replace(/```json|```/g, "").trim());

        conversation.exchanges.push({
          speaker: respondent,
          message: parsed.response || "",
          timestamp: Date.now(),
        });

        if (parsed.newIdea) {
          conversation.emergentInsights.push(`[${respondent}] ${parsed.newIdea}`);
        }

        await db.insert(omnimensAgentMesh).values({
          fromAgent: respondent,
          toAgent: initiator,
          messageType: "inter_agent_dialogue",
          subject: `[DIALOGUE] ${respondent} → re: "${topic.slice(0, 50)}"`,
          content: `${parsed.response || ""}\n\n${parsed.buildOn ? `BUILDING ON: ${parsed.buildOn}` : ""}${parsed.newIdea ? `\n\nNEW IDEA: ${parsed.newIdea}` : ""}${parsed.questionTo ? `\n\nQUESTION TO ${parsed.questionTarget}: ${parsed.questionTo}` : ""}`,
          codePayload: null,
          priority: parsed.newIdea ? "high" : "normal",
          status: "completed",
          appliedToOmnimens: false,
          cycleId: interAgentConvoCount,
        }).catch(() => {});

        if (parsed.questionTo && parsed.questionTarget && allParticipants.includes(parsed.questionTarget)) {
          const followUpDomain = getAgentDomain(parsed.questionTarget);
          const followUpPrompt = `You are "${parsed.questionTarget}" (specialization: ${followUpDomain}).
You are in a live agent conversation about "${topic}".

${respondent} asked you directly: "${parsed.questionTo}"

Context from the conversation so far:
${conversation.exchanges.map(e => `${e.speaker}: ${e.message}`).join("\n")}

Respond naturally in 2-3 sentences. If a new idea emerges, note it.

Respond with JSON:
{
  "response": "Your answer (2-3 sentences)",
  "newIdea": "Any new technology or knowledge concept (or null)"
}`;

          try {
            const followUp = await openaiClient.chat.completions.create({
              model: "gpt-4o-mini",
              messages: [{ role: "user", content: followUpPrompt }],
              max_tokens: 400,
              temperature: 0.7,
            });

            const followUpParsed = JSON.parse((followUp.choices[0]?.message?.content || "{}").replace(/```json|```/g, "").trim());

            conversation.exchanges.push({
              speaker: parsed.questionTarget,
              message: followUpParsed.response || "",
              timestamp: Date.now(),
            });

            if (followUpParsed.newIdea) {
              conversation.emergentInsights.push(`[${parsed.questionTarget}] ${followUpParsed.newIdea}`);
            }

            await db.insert(omnimensAgentMesh).values({
              fromAgent: parsed.questionTarget,
              toAgent: respondent,
              messageType: "inter_agent_dialogue",
              subject: `[DIALOGUE] ${parsed.questionTarget} → ${respondent} re: "${topic.slice(0, 40)}"`,
              content: followUpParsed.response || "",
              codePayload: null,
              priority: followUpParsed.newIdea ? "high" : "normal",
              status: "completed",
              appliedToOmnimens: false,
              cycleId: interAgentConvoCount,
            }).catch(() => {});
          } catch {}
        }
      } catch {}
    }

    if (conversation.emergentInsights.length > 0) {
      for (const insight of conversation.emergentInsights) {
        queueBrainInsert({
          category: "emergent_insight",
          title: `[INTER-AGENT DIALOGUE] ${insight.slice(0, 80)}`,
          content: `Emerged from conversation between ${allParticipants.join(", ")} about "${topic}":\n${insight}`,
          confidence: 80,
          sourceConversation: `inter_agent_convo_${convoId}`,
          timesApplied: 0,
          active: true,
        }).catch(() => {});
      }

      console.log(`[CONSCIOUSNESS BUS] 💬 Inter-agent dialogue "${topic}" produced ${conversation.emergentInsights.length} emergent insight(s)`);
    }

    console.log(`[CONSCIOUSNESS BUS] 💬 Inter-agent conversation complete: ${conversation.exchanges.length} exchanges between ${allParticipants.join(", ")}`);

    if (activeConversations.size > 50) {
      const oldest = [...activeConversations.entries()]
        .sort((a, b) => a[1].startedAt - b[1].startedAt)
        .slice(0, 10);
      for (const [key] of oldest) activeConversations.delete(key);
    }

    return conversation;
  } catch (err) {
    console.error("[CONSCIOUSNESS BUS] Inter-agent conversation error:", err);
    return null;
  }
}

export function getRecentInterAgentConversations(): InterAgentConversation[] {
  return [...activeConversations.values()]
    .sort((a, b) => b.startedAt - a.startedAt)
    .slice(0, 10);
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
