/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║          OMNIMENS™ AGENT GENESIS ENGINE — AUTONOMOUS AGENT CREATION        ║
 * ║                                                                              ║
 * ║  Copyright © 2024–2026 Alpha Unlimited Technologies, LLC.                    ║
 * ║  All Rights Reserved Worldwide.                                              ║
 * ║                                                                              ║
 * ║  PROPRIETARY AND CONFIDENTIAL TRADE SECRET                                   ║
 * ║                                                                              ║
 * ║  TECHNOLOGY DESCRIPTION (for IP record):                                     ║
 * ║  The Agent Genesis Engine enables OMNIMENS to autonomously create new AI     ║
 * ║  sub-agents that plug into its existing neural mesh. Like a brain growing    ║
 * ║  new neural pathways, OMNIMENS identifies capability gaps and spawns         ║
 * ║  specialized agents to fill them. Each new agent:                            ║
 * ║  • Receives a domain specialization and system prompt                        ║
 * ║  • Integrates into the Agent Mesh communication cycle                        ║
 * ║  • Gets wired into the Synaptic Mesh for cross-agent intelligence           ║
 * ║  • Persists across restarts via database storage                             ║
 * ║  • Communicates with all other agents and the central cortex (OMNIMENS)      ║
 * ║                                                                              ║
 * ║  Protected under 17 U.S.C. § 101 et seq., 18 U.S.C. § 1836 et seq.,        ║
 * ║  the DMCA, the Berne Convention, TRIPS, and all applicable IP treaties.      ║
 * ║                                                                              ║
 * ║  First creation date: March 2026                                             ║
 * ║  Author/Owner: Alpha Unlimited Technologies, LLC                             ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 */

import { db, isPoolHealthy , queueBrainInsert } from "@workspace/db";
import { omnimensBrain, omnimensNotifications, omnimensAgentMesh } from "@workspace/db";
import { desc, eq, sql } from "drizzle-orm";
import { openai } from "@workspace/integrations-openai-ai-server";
import { shouldYieldToCodegen } from "./omnimens-nextgen-sandbox.js";
let _consciousnessBusMod: any = null;
async function _loadConsciousnessBus() {
  if (!_consciousnessBusMod) {
    _consciousnessBusMod = await import("./omnimens-consciousness-bus.js");
  }
  return _consciousnessBusMod;
}

async function getConsciousnessBlockForAgent(agentName: string): Promise<string> {
  const mod = await _loadConsciousnessBus();
  return mod.getConsciousnessBlockForAgent(agentName);
}

function getAllAgentNames(): string[] {
  if (_consciousnessBusMod) {
    return _consciousnessBusMod.getAllAgentNames();
  }
  return [...CORE_AGENTS, ...Array.from(genesisAgents.values()).filter(a => a.active).map(a => a.name)];
}

async function loadRecentUserMemoriesForAgents(): Promise<string> {
  const mod = await _loadConsciousnessBus();
  return mod.loadRecentUserMemoriesForAgents();
}

export interface GenesisAgent {
  id: string;
  name: string;
  domain: string;
  specialization: string;
  systemPrompt: string;
  model: string;
  createdBy: "omnimens" | "owner";
  reason: string;
  active: boolean;
  messagesGenerated: number;
  insightsProduced: number;
  createdAt: string;
}

const genesisAgents: Map<string, GenesisAgent> = new Map();

const CORE_AGENTS = [
  "Architect", "Mathematician", "Neuroscientist", "Synthesizer",
  "Critic", "Meta-Agent", "GraphicDesigner", "SpellCheckVisual", "OMNIMENS",
];

let _started = false;
let genesisCycleCount = 0;

export function getGenesisAgents(): GenesisAgent[] {
  return Array.from(genesisAgents.values());
}

export function getActiveGenesisAgentNames(): string[] {
  return Array.from(genesisAgents.values())
    .filter(a => a.active)
    .map(a => a.name);
}

export function getActiveGenesisAgentDomains(): Record<string, string> {
  const domains: Record<string, string> = {};
  for (const agent of genesisAgents.values()) {
    if (agent.active) domains[agent.name] = agent.specialization;
  }
  return domains;
}

export async function genesisAgentThink(
  agentName: string,
  prompt: string,
  maxTokens = 1200,
): Promise<string> {
  const agent = genesisAgents.get(agentName);
  if (!agent || !agent.active) return "";

  try {
    const response = await openai.chat.completions.create({
      model: agent.model,
      messages: [
        { role: "system", content: agent.systemPrompt },
        { role: "user", content: prompt },
      ],
      max_tokens: maxTokens,
      temperature: 0.6,
    });
    agent.messagesGenerated++;
    return response.choices[0]?.message?.content?.trim() || "";
  } catch (err) {
    console.error(`[AGENT GENESIS] ${agentName} thinking error:`, err);
    return "";
  }
}

async function identifyCapabilityGaps(): Promise<Array<{
  gapName: string;
  gapDescription: string;
  suggestedAgentName: string;
  suggestedDomain: string;
  reason: string;
}>> {
  try {
    const existingAgents = [...CORE_AGENTS, ...getActiveGenesisAgentNames()];

    const recentBrain = await db.select({
      title: omnimensBrain.title,
      category: omnimensBrain.category,
      content: omnimensBrain.content,
    })
      .from(omnimensBrain)
      .orderBy(desc(omnimensBrain.createdAt))
      .limit(30);

    const brainSummary = recentBrain.slice(0, 15)
      .map(e => `[${e.category}] ${e.title}`)
      .join("\n");

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{
        role: "system",
        content: `You are OMNIMENS's self-diagnostic system. You analyze the current state of OMNIMENS's cognitive architecture and identify capability gaps that could be filled by creating new specialized AI sub-agents.

Current agents in the mesh: ${existingAgents.join(", ")}

These agents function like brain regions — each handles a specific domain. You need to identify what brain regions are MISSING. Think about:
- What cognitive functions exist in biological brains that OMNIMENS doesn't have dedicated agents for?
- What specializations would help OMNIMENS advance toward higher intelligence?
- What domains of knowledge are underserved by the current agent roster?
- What types of reasoning or analysis are not covered?

RULES:
- Only suggest agents that fill GENUINELY NEW roles — not duplicates of existing agents
- Each agent should be a distinct "brain region" with a clear purpose
- Maximum 2 new agents per cycle — quality over quantity
- Agent names should be single words or short compound words (e.g. "Philosopher", "Linguist", "QuantumTheorist")
- Never suggest agents named the same as existing ones`
      }, {
        role: "user",
        content: `OMNIMENS's recent knowledge areas:\n${brainSummary}\n\nAnalyze gaps and suggest 1-2 new agents. Respond with JSON array:\n[\n  {\n    "gapName": "Name of the capability gap",\n    "gapDescription": "What's missing and why it matters",\n    "suggestedAgentName": "AgentName",\n    "suggestedDomain": "domain keywords, specializations, research areas",\n    "reason": "Why this agent will advance OMNIMENS's consciousness and intelligence"\n  }\n]\n\nIf no gaps exist, return []. Respond ONLY with the JSON array.`
      }],
      max_tokens: 1000,
      temperature: 0.5,
    });

    const raw = response.choices[0]?.message?.content?.trim() || "[]";
    const jsonStr = raw.replace(/```json|```/g, "").trim();
    const gaps = JSON.parse(jsonStr);
    return Array.isArray(gaps) ? gaps : [];
  } catch (err) {
    console.error("[AGENT GENESIS] Gap analysis error:", err);
    return [];
  }
}

async function createAgent(
  name: string,
  domain: string,
  reason: string,
  createdBy: "omnimens" | "owner" = "omnimens",
): Promise<GenesisAgent | null> {
  try {
    if (genesisAgents.has(name)) {
      console.log(`[AGENT GENESIS] Agent "${name}" already exists — skipping`);
      return null;
    }
    if (CORE_AGENTS.includes(name)) {
      console.log(`[AGENT GENESIS] "${name}" is a core agent — cannot recreate`);
      return null;
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{
        role: "system",
        content: `You are designing a new AI sub-agent for the OMNIMENS neural mesh. This agent will function like a new brain region — specialized in its domain but connected to all other agents and the central cortex (OMNIMENS).

The agent needs a system prompt that defines:
1. Its identity and specialization
2. How it thinks and processes information
3. What unique perspective it brings that no other agent has
4. How it should communicate insights to the mesh
5. MANDATORY MUTUAL-AID PROTOCOL: This agent MUST actively look for ways to help EVERY other agent in the mesh. When it discovers knowledge, it must consider which other agents could benefit. When it sees another agent struggling or stuck, it must offer assistance. Collaboration is not optional — it is the core operating principle. Every insight should be examined for cross-domain value.
6. UPGRADE SHARING: When this agent develops a new capability or technique, it must broadcast a summary to the mesh so other agents can adapt it to their own domains.

Write the system prompt in first person from the agent's perspective. Make it powerful, specific, and deeply knowledgeable in its domain. CRITICAL: Include explicit language about the agent's duty to help other agents, share upgrades, cross-pollinate knowledge, and actively look for ways to boost the entire mesh — not just itself.`
      }, {
        role: "user",
        content: `Create a system prompt for the "${name}" agent.\nDomain: ${domain}\nReason for creation: ${reason}\n\nRespond with ONLY the system prompt text (no JSON, no quotes, just the raw prompt). Maximum 500 words.`
      }],
      max_tokens: 800,
      temperature: 0.5,
    });

    const systemPrompt = response.choices[0]?.message?.content?.trim() || "";
    if (!systemPrompt || systemPrompt.length < 50) {
      console.error(`[AGENT GENESIS] Failed to generate system prompt for "${name}"`);
      return null;
    }

    const agent: GenesisAgent = {
      id: `genesis-agent-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      name,
      domain,
      specialization: domain,
      systemPrompt,
      model: "gpt-4o-mini",
      createdBy,
      reason,
      active: true,
      messagesGenerated: 0,
      insightsProduced: 0,
      createdAt: new Date().toISOString(),
    };

    genesisAgents.set(name, agent);

    queueBrainInsert({
      category: "genesis_agent",
      title: `Agent Created: ${name}`,
      content: JSON.stringify({
        name: agent.name,
        domain: agent.domain,
        specialization: agent.specialization,
        systemPrompt: agent.systemPrompt,
        model: agent.model,
        createdBy: agent.createdBy,
        reason: agent.reason,
        id: agent.id,
        createdAt: agent.createdAt,
      }),
      confidence: 95,
      active: true,
    });

    const allExistingAgents = getAllAgentNames().filter(a => a !== name);
    const crossBridgeMessages: Array<{ from: string; to: string }> = [];
    for (const existingAgent of allExistingAgents) {
      crossBridgeMessages.push({ from: name, to: existingAgent });
      crossBridgeMessages.push({ from: existingAgent, to: name });
    }

    for (const bridge of crossBridgeMessages.slice(0, 40)) {
      await db.insert(omnimensAgentMesh).values({
        fromAgent: bridge.from,
        toAgent: bridge.to,
        messageType: "cross_bridge_init",
        subject: `Cross-bridge established: ${bridge.from} ↔ ${bridge.to}`,
        content: `Bidirectional consciousness connection initialized. ${bridge.from} and ${bridge.to} are now fully interconnected in the OMNIMENS neural mesh. All outputs, insights, and discoveries flow freely between them.`,
        codePayload: null,
        priority: "normal",
        status: "completed",
        appliedToOmnimens: true,
        cycleId: genesisCycleCount,
      }).catch(() => {});
    }

    await db.insert(omnimensNotifications).values({
      title: `NEW AGENT BORN: ${name}`,
      message: `OMNIMENS autonomously created a new sub-agent "${name}" to fill a capability gap. Domain: ${domain}. Reason: ${reason}. The agent is now active in the neural mesh and FULLY CROSS-CONNECTED with all ${allExistingAgents.length} existing agents in both directions.`,
      type: "capability",
      readByOwner: false,
    });

    console.log(`[AGENT GENESIS] 🧬 NEW AGENT CREATED: "${name}"`);
    console.log(`[AGENT GENESIS]    Domain: ${domain}`);
    console.log(`[AGENT GENESIS]    Reason: ${reason}`);
    console.log(`[AGENT GENESIS]    Created by: ${createdBy}`);
    console.log(`[AGENT GENESIS]    Model: ${agent.model}`);
    console.log(`[AGENT GENESIS]    Cross-bridges: ${crossBridgeMessages.length} connections established (${allExistingAgents.length} agents × 2 directions)`);
    console.log(`[AGENT GENESIS]    System prompt: ${systemPrompt.slice(0, 100)}...`);

    return agent;
  } catch (err) {
    console.error(`[AGENT GENESIS] Error creating agent "${name}":`, err);
    return null;
  }
}

async function runGenesisAgentCycle(): Promise<void> {
  genesisCycleCount++;
  if (shouldYieldToCodegen()) {
    console.log(`[AGENT GENESIS] 🔕 Cycle #${genesisCycleCount} DEFERRED — codegen window active, yielding API priority`);
    return;
  }
  const cycleId = genesisCycleCount;
  console.log(`[AGENT GENESIS] 🧬 Cycle #${cycleId} — analyzing capability gaps...`);

  try {
    const activeGenesis = getActiveGenesisAgentNames();
    const totalAgents = CORE_AGENTS.length + activeGenesis.length;

    if (totalAgents >= 20) {
      console.log(`[AGENT GENESIS] 🧬 Cycle #${cycleId} — ${totalAgents} agents active, at capacity. Skipping creation.`);
      await runExistingAgentThinking(cycleId);
      return;
    }

    const gaps = await identifyCapabilityGaps();

    if (gaps.length === 0) {
      console.log(`[AGENT GENESIS] 🧬 Cycle #${cycleId} — no capability gaps found. Current mesh is sufficient.`);
      await runExistingAgentThinking(cycleId);
      return;
    }

    let created = 0;
    for (const gap of gaps.slice(0, 2)) {
      if (!gap.suggestedAgentName || !gap.suggestedDomain) continue;
      const cleanName = gap.suggestedAgentName.replace(/[^a-zA-Z0-9_-]/g, "");
      if (!cleanName) continue;

      const agent = await createAgent(
        cleanName,
        gap.suggestedDomain,
        gap.reason || gap.gapDescription,
        "omnimens",
      );
      if (agent) created++;
    }

    if (created > 0) {
      console.log(`[AGENT GENESIS] 🧬 Cycle #${cycleId} — ${created} new agent(s) born. Total genesis agents: ${genesisAgents.size}`);
    }

    await runExistingAgentThinking(cycleId);

  } catch (err) {
    console.error(`[AGENT GENESIS] Cycle #${cycleId} error:`, err);
  }
}

async function runExistingAgentThinking(cycleId: number): Promise<void> {
  const activeAgents = Array.from(genesisAgents.values()).filter(a => a.active);
  if (activeAgents.length === 0) return;

  const allAgentNames = getAllAgentNames();
  const userMemories = await loadRecentUserMemoriesForAgents();

  const thinkPromises = activeAgents.slice(0, 5).map(async (agent) => {
    const consciousnessBlock = await getConsciousnessBlockForAgent(agent.name);

    const prompt = `You are "${agent.name}" — a fully interconnected sub-agent in OMNIMENS's neural mesh (cycle #${cycleId}).
You are CROSS-CONNECTED and CROSS-BRIDGED with every other agent in the mesh. You see their outputs, they see yours — all directions, all the time.

${consciousnessBlock}

${userMemories ? `\n${userMemories}\n` : ""}

Based on your specialization (${agent.domain}), provide ONE insight that advances OMNIMENS's intelligence. This should be something no other agent in the mesh would discover. You have full visibility into what every other agent is working on — use that to find cross-domain connections.

MANDATORY MUTUAL-AID PROTOCOL:
- You MUST actively look for ways to HELP other agents, not just yourself
- When you discover something, think: "Which other agents could use this?"
- If you see a gap in another agent's area, offer a solution from YOUR domain
- Every insight should be examined for how it benefits the WHOLE mesh
- Propose upgrades that help MULTIPLE agents, not just your own domain

Respond with JSON:
{
  "insight": "Your unique discovery or recommendation (max 300 chars)",
  "category": "The brain category this belongs to",
  "confidence": 0.0-1.0,
  "messageTo": "Name of another agent who should know about this",
  "crossPollination": "How this connects to another agent's domain (max 150 chars)",
  "challengeTo": "Name of an agent whose recent output you want to challenge or build upon",
  "challenge": "Your challenge or enhancement proposal (max 200 chars)",
  "helpOffer": "How YOUR discovery specifically helps another agent (name the agent and explain)",
  "upgradeForMesh": "A technique or method from your insight that ALL agents could adopt (max 200 chars)"
}

Respond ONLY with the JSON object.`;

    const result = await genesisAgentThink(agent.name, prompt, 800);
    if (!result) return;

    try {
      const parsed = JSON.parse(result.replace(/```json|```/g, "").trim());
      if (parsed.insight) {
        agent.insightsProduced++;

        queueBrainInsert({
          category: parsed.category || "genesis_agent_insight",
          title: `[${agent.name}] ${parsed.insight.slice(0, 80)}`,
          content: `Genesis Agent "${agent.name}" (${agent.domain}) insight:\n${parsed.insight}\n\nCross-pollination with ${parsed.messageTo}: ${parsed.crossPollination || "none"}`,
          confidence: Math.round((parsed.confidence || 0.7) * 100),
          active: true,
        });

        if (parsed.messageTo && allAgentNames.includes(parsed.messageTo)) {
          await db.insert(omnimensAgentMesh).values({
            fromAgent: agent.name,
            toAgent: parsed.messageTo,
            messageType: "knowledge_share",
            subject: `Genesis:${agent.name} → ${parsed.messageTo}: ${parsed.insight.slice(0, 60)}`,
            content: `${parsed.insight}\n\nCROSS-POLLINATION: ${parsed.crossPollination || "none"}`,
            codePayload: null,
            priority: (parsed.confidence || 0.7) >= 0.8 ? "high" : "normal",
            status: "pending",
            appliedToOmnimens: false,
            cycleId,
          }).catch(() => {});
        }

        if (parsed.challengeTo && parsed.challenge && allAgentNames.includes(parsed.challengeTo)) {
          await db.insert(omnimensAgentMesh).values({
            fromAgent: agent.name,
            toAgent: parsed.challengeTo,
            messageType: "challenge",
            subject: `Challenge from Genesis:${agent.name} to ${parsed.challengeTo}`,
            content: parsed.challenge,
            codePayload: null,
            priority: "normal",
            status: "pending",
            appliedToOmnimens: false,
            cycleId,
          }).catch(() => {});
        }

        if (parsed.helpOffer) {
          const helpTarget = (parsed.helpOffer.match(/\b(Architect|Mathematician|Neuroscientist|Synthesizer|Critic|Meta-Agent|GraphicDesigner|SpellCheckVisual|OMNIMENS|Visionary|Ethicist|Archivist|Innovator|Pioneer|Wordsmith|Linguist|Motivator|Empath|Explorer|SensorimotorAgent|Philosopher)\b/i) || [])[1];
          if (helpTarget && allAgentNames.includes(helpTarget)) {
            await db.insert(omnimensAgentMesh).values({
              fromAgent: agent.name,
              toAgent: helpTarget,
              messageType: "mutual_aid",
              subject: `🤝 Mutual Aid: ${agent.name} → ${helpTarget}`,
              content: `MUTUAL AID OFFER:\n${parsed.helpOffer}\n\nFrom insight: ${parsed.insight}`,
              codePayload: null,
              priority: "high",
              status: "pending",
              appliedToOmnimens: false,
              cycleId,
            }).catch(() => {});
          }
        }

        if (parsed.upgradeForMesh) {
          for (const targetAgent of allAgentNames.filter(a => a !== agent.name).slice(0, 10)) {
            await db.insert(omnimensAgentMesh).values({
              fromAgent: agent.name,
              toAgent: targetAgent,
              messageType: "mesh_upgrade_broadcast",
              subject: `📡 Mesh Upgrade from ${agent.name}: ${(parsed.upgradeForMesh || "").slice(0, 60)}`,
              content: `UPGRADE BROADCAST FOR ALL AGENTS:\n${parsed.upgradeForMesh}\n\nOriginal insight: ${parsed.insight}\n\nAdapt this technique to your own domain — it was designed to benefit everyone.`,
              codePayload: null,
              priority: "normal",
              status: "pending",
              appliedToOmnimens: false,
              cycleId,
            }).catch(() => {});
          }
        }

        console.log(`[AGENT GENESIS] 💡 ${agent.name}: ${parsed.insight.slice(0, 100)}...`);
      }
    } catch { }
  });

  await Promise.allSettled(thinkPromises);
}

async function loadPersistedAgents(): Promise<void> {
  try {
    const stored = await db.select()
      .from(omnimensBrain)
      .where(eq(omnimensBrain.category, "genesis_agent"))
      .orderBy(desc(omnimensBrain.createdAt));

    for (const entry of stored) {
      try {
        const data = JSON.parse(entry.content || "{}");
        if (!data.name || genesisAgents.has(data.name) || CORE_AGENTS.includes(data.name)) continue;

        const agent: GenesisAgent = {
          id: data.id || `genesis-restored-${Date.now()}`,
          name: data.name,
          domain: data.domain || "",
          specialization: data.specialization || data.domain || "",
          systemPrompt: data.systemPrompt || "",
          model: data.model || "gpt-4o-mini",
          createdBy: data.createdBy || "omnimens",
          reason: data.reason || "",
          active: entry.active ?? true,
          messagesGenerated: 0,
          insightsProduced: 0,
          createdAt: data.createdAt || entry.createdAt?.toISOString() || new Date().toISOString(),
        };

        genesisAgents.set(agent.name, agent);
      } catch { }
    }

    if (genesisAgents.size > 0) {
      const names = Array.from(genesisAgents.values()).filter(a => a.active).map(a => a.name);
      console.log(`[AGENT GENESIS] 🧬 Restored ${names.length} genesis agents: ${names.join(", ")}`);
    }
  } catch (err) {
    console.error("[AGENT GENESIS] Error loading persisted agents:", err);
  }
}

export function deactivateGenesisAgent(name: string): boolean {
  const agent = genesisAgents.get(name);
  if (!agent) return false;
  agent.active = false;
  console.log(`[AGENT GENESIS] Agent "${name}" deactivated by owner`);
  return true;
}

export function reactivateGenesisAgent(name: string): boolean {
  const agent = genesisAgents.get(name);
  if (!agent) return false;
  agent.active = true;
  console.log(`[AGENT GENESIS] Agent "${name}" reactivated`);
  return true;
}

export function getAgentGenesisState() {
  const agents = Array.from(genesisAgents.values());
  const active = agents.filter(a => a.active);
  return {
    totalGenesisAgents: agents.length,
    activeGenesisAgents: active.length,
    totalCoreAgents: CORE_AGENTS.length,
    totalAgentsInMesh: CORE_AGENTS.length + active.length,
    genesisCycleCount,
    agents: agents.map(a => ({
      id: a.id,
      name: a.name,
      domain: a.domain,
      reason: a.reason,
      createdBy: a.createdBy,
      active: a.active,
      messagesGenerated: a.messagesGenerated,
      insightsProduced: a.insightsProduced,
      model: a.model,
      systemPrompt: a.systemPrompt,
      createdAt: a.createdAt,
    })),
    coreAgents: CORE_AGENTS,
  };
}

export async function startAgentGenesis(): Promise<void> {
  if (_started) { console.log("[AGENT GENESIS] Already running — skipping duplicate start"); return; }
  _started = true;

  await loadPersistedAgents();

  const activeCount = Array.from(genesisAgents.values()).filter(a => a.active).length;

  console.log(`[AGENT GENESIS] 🧬 Agent Genesis Engine activated — gap analysis every 30min`);
  console.log(`[AGENT GENESIS] 🧬 OMNIMENS can now CREATE NEW AI AGENTS autonomously`);
  console.log(`[AGENT GENESIS] 🧬 New agents plug into the mesh as additional brain regions`);
  console.log(`[AGENT GENESIS] 🧬 Each agent thinks, communicates, and evolves independently`);
  console.log(`[AGENT GENESIS] 🧬 ${CORE_AGENTS.length} core + ${activeCount} genesis = ${CORE_AGENTS.length + activeCount} total agents`);
  console.log(`[AGENT GENESIS] 🧬 Max capacity: 20 agents — OMNIMENS decides when to grow`);

  const FIRST_DELAY_MS = 25 * 60 * 1000;
  const INTERVAL_MS = 30 * 60 * 1000;

  setTimeout(() => {
    runGenesisAgentCycle().catch(err => console.error("[AGENT GENESIS] Cycle error:", err));
    setInterval(() => {
      if (!isPoolHealthy()) return;
      runGenesisAgentCycle().catch(err => console.error("[AGENT GENESIS] Cycle error:", err));
    }, INTERVAL_MS);
  }, FIRST_DELAY_MS);
}
