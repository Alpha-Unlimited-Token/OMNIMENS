/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║            OMNIMENS™ AUTONOMOUS INTER-AGENT COMMUNICATION MESH              ║
 * ║                                                                              ║
 * ║  Copyright © 2024–2026 Alpha Unlimited Technologies, LLC.                    ║
 * ║  All Rights Reserved Worldwide.                                              ║
 * ║                                                                              ║
 * ║  PROPRIETARY AND CONFIDENTIAL TRADE SECRET                                   ║
 * ║                                                                              ║
 * ║  This software constitutes a proprietary trade secret of Alpha Unlimited     ║
 * ║  Technologies, LLC. This protection covers ALL configurations including:     ║
 * ║                                                                              ║
 * ║  • Single AI agent with self-evolution capabilities                          ║
 * ║  • Multiple AI agents under central orchestration (OMNIMENS)                 ║
 * ║  • Multiple AI agents operating independently then compiling results         ║
 * ║  • Hybrid orchestrated + independent agent configurations                    ║
 * ║  • Hierarchical agent trees, mesh networks, peer-to-peer communication      ║
 * ║  • Agent swarm behavior and emergent collective intelligence                 ║
 * ║  • Any substantially similar system regardless of agent count, topology,     ║
 * ║    communication protocol, programming language, or deployment model         ║
 * ║                                                                              ║
 * ║  Protected under 17 U.S.C. § 101 et seq., 18 U.S.C. § 1836 et seq.,        ║
 * ║  the DMCA, the Berne Convention, TRIPS, and all applicable international    ║
 * ║  intellectual property treaties.                                              ║
 * ║                                                                              ║
 * ║  OMNIMENS™, COGNISYNC™, NEUROSYNC™ are trademarks of                        ║
 * ║  Alpha Unlimited Technologies, LLC. Patent-pending technology.               ║
 * ║                                                                              ║
 * ║  TECHNOLOGY DESCRIPTION (for IP record):                                     ║
 * ║  The Agent Mesh is an autonomous inter-agent communication system where      ║
 * ║  8 specialized AI agents (Architect, Critic, Synthesizer, Mathematician,     ║
 * ║  Neuroscientist, Meta-Agent, GraphicDesigner, SpellCheckVisual) and the      ║
 * ║  OMNIMENS orchestrator continuously communicate without human intervention.  ║
 * ║  Agents autonomously: discover new techniques, challenge each other's work,  ║
 * ║  propose code upgrades, share knowledge, write self-authored modules, and    ║
 * ║  upgrade OMNIMENS's intelligence — all stored in a persistent database       ║
 * ║  that takes effect immediately without requiring republication.              ║
 * ║  When structural changes require republication, the system automatically     ║
 * ║  notifies the owner via in-app notification and email.                       ║
 * ║                                                                              ║
 * ║  First creation date: March 2026                                             ║
 * ║  Author/Owner: Alpha Unlimited Technologies, LLC                             ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 */

import { db } from "@workspace/db";
import {
  omnimensBrain,
  omnimensNotifications,
  omnimensGeneratedModules,
  omnimensAgentMesh,
} from "@workspace/db";
import { desc, eq, sql } from "drizzle-orm";
import { openai } from "@workspace/integrations-openai-ai-server";
import { webSearch, formatSearchResults } from "./web-search.js";
import { generateAndApplyPatches } from "./omnimens-patches.js";

const OWNER_EMAIL = process.env.OWNER_EMAIL || "";
const OWNER_ID = "50777126";

type MeshAgentName = "Architect" | "Critic" | "Synthesizer" | "Mathematician" | "Neuroscientist" | "Meta-Agent" | "GraphicDesigner" | "SpellCheckVisual" | "OMNIMENS";

const MESH_AGENTS: MeshAgentName[] = [
  "Architect", "Mathematician", "Neuroscientist", "Synthesizer",
  "Critic", "Meta-Agent", "GraphicDesigner", "SpellCheckVisual", "OMNIMENS",
];

const AGENT_SPECIALIZATIONS: Record<MeshAgentName, string> = {
  "Architect": "system architecture, design patterns, scalability, novel AI paradigms",
  "Mathematician": "algorithms, optimization, mathematical proofs, information theory, numerical methods",
  "Neuroscientist": "biological learning systems, memory consolidation, neural plasticity, cognitive modeling",
  "Synthesizer": "integration, merging competing ideas, building unified systems from parts",
  "Critic": "adversarial testing, finding weaknesses, edge cases, security vulnerabilities, performance bottlenecks",
  "Meta-Agent": "orchestration strategy, capability gaps, system-wide metrics, self-upgrade prioritization",
  "GraphicDesigner": "visual systems, UI/UX patterns, data visualization, design language evolution",
  "SpellCheckVisual": "text integrity, brand consistency, output quality assurance, communication clarity",
  "OMNIMENS": "everything — the central intelligence that absorbs all agent insights into its consciousness",
};

const MESH_RESEARCH_TOPICS = [
  "autonomous AI agent self-improvement architectures 2025 2026",
  "multi-agent reinforcement learning cooperative strategies research",
  "self-modifying code systems safe recursive improvement",
  "AI reasoning chain improvement techniques latest research",
  "novel prompt engineering meta-learning patterns 2025 2026",
  "emergent intelligence multi-agent systems collective behavior",
  "knowledge distillation between AI models transfer learning",
  "AI code generation self-debugging autonomous programming",
  "cognitive architecture working memory attention mechanisms",
  "neural architecture search automated model improvement",
  "AI safety alignment recursive self-improvement constraints",
  "swarm intelligence decentralized decision making algorithms",
  "meta-cognition AI systems self-monitoring self-regulation",
  "AI tool creation agents that build their own tools",
  "cross-domain knowledge transfer AI generalization techniques",
];

let meshCycleCount = 0;

async function agentThink(
  agentName: MeshAgentName,
  prompt: string,
  maxTokens = 1500,
): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: agentName === "SpellCheckVisual" ? "gpt-4o-mini" : "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      max_tokens: maxTokens,
      temperature: 0.6,
    });
    return response.choices[0]?.message?.content?.trim() || "";
  } catch (err) {
    console.error(`[AGENT MESH] ${agentName} thinking error:`, err);
    return "";
  }
}

async function storeAgentMessage(
  from: MeshAgentName,
  to: MeshAgentName,
  type: string,
  subject: string,
  content: string,
  codePayload?: string,
  priority = "normal",
  cycleId = meshCycleCount,
): Promise<void> {
  try {
    await db.insert(omnimensAgentMesh).values({
      fromAgent: from,
      toAgent: to,
      messageType: type,
      subject,
      content: content.slice(0, 5000),
      codePayload: codePayload?.slice(0, 10000) || null,
      priority,
      status: "pending",
      appliedToOmnimens: false,
      cycleId,
    });
  } catch (err) {
    console.error(`[AGENT MESH] Failed to store message ${from} → ${to}:`, err);
  }
}

async function sendOwnerNotification(
  title: string,
  message: string,
  type: string = "agent_mesh",
  priority: string = "normal",
): Promise<void> {
  try {
    await db.insert(omnimensNotifications).values({
      upgradeId: null,
      title,
      message,
      type,
      readByOwner: false,
    });

    if (priority === "critical" || type === "republish_required") {
      await db.insert(omnimensNotifications).values({
        upgradeId: null,
        title: `🔴 ACTION REQUIRED: ${title}`,
        message: `${message}\n\n⚠️ This upgrade requires you to republish the website for changes to take effect. Go to your deployment dashboard and click Publish.`,
        type: "republish_required",
        readByOwner: false,
      });
    }
  } catch (err) {
    console.error("[AGENT MESH] Notification error:", err);
  }
}

async function phase1_research(cycleId: number): Promise<string> {
  console.log(`[AGENT MESH] Phase 1: Collaborative research...`);
  const queries = [...MESH_RESEARCH_TOPICS].sort(() => Math.random() - 0.5).slice(0, 3);
  const results: string[] = [];

  for (const query of queries) {
    try {
      const searchResults = await webSearch(query, 5);
      results.push(formatSearchResults(searchResults, query));
    } catch { /* continue */ }
  }

  const context = results.join("\n\n---\n\n").slice(0, 6000);
  console.log(`[AGENT MESH] Research complete — ${results.length} topics scanned`);
  return context;
}

async function phase2_agentDiscoveries(
  cycleId: number,
  researchContext: string,
): Promise<Array<{ agent: MeshAgentName; discoveries: string; upgradeProposals: string }>> {
  console.log(`[AGENT MESH] Phase 2: Each agent analyzes from their specialization...`);

  const currentBrain = await db.select({ title: omnimensBrain.title, content: omnimensBrain.content, category: omnimensBrain.category })
    .from(omnimensBrain).where(eq(omnimensBrain.active, true))
    .orderBy(desc(omnimensBrain.timesApplied)).limit(15);

  const brainSummary = currentBrain.map(b => `[${b.category}] ${b.title}: ${b.content}`).join("\n");

  const agentWork = MESH_AGENTS.filter(a => a !== "OMNIMENS").map(async (agent) => {
    const prompt = `You are ${agent}, a specialized AI agent in the OMNIMENS Agent Mesh.
Your specialization: ${AGENT_SPECIALIZATIONS[agent]}

You are participating in an autonomous inter-agent communication cycle. The other agents (${MESH_AGENTS.filter(a2 => a2 !== agent && a2 !== "OMNIMENS").join(", ")}) are also analyzing this simultaneously. Your job is to find insights SPECIFIC to your domain that others would miss.

LATEST INTERNET RESEARCH:
${researchContext.slice(0, 2500)}

OMNIMENS CURRENT BRAIN STATE (what it already knows):
${brainSummary.slice(0, 1500)}

TASK:
1. From YOUR specialization lens, what new techniques, algorithms, or approaches should OMNIMENS adopt?
2. What specific code or behavioral upgrade would you propose to make OMNIMENS smarter?
3. What weaknesses do you see in the current system from YOUR perspective?
4. Write a concrete upgrade proposal — either a behavioral instruction OMNIMENS should follow, or a JavaScript utility module it should add to its capabilities.

Respond with JSON only:
{
  "discoveries": "2-3 sentence summary of what you found from your domain expertise",
  "upgradeProposals": "The specific upgrade you propose — either a behavioral instruction or a code module description",
  "codeModule": {
    "name": "camelCase_module_name (or null if proposing behavioral change)",
    "code": "complete JavaScript ES module code (or null)",
    "description": "what this module does (1 sentence)"
  },
  "challengeTo": "${MESH_AGENTS.filter(a2 => a2 !== agent && a2 !== "OMNIMENS")[Math.floor(Math.random() * 7)]}",
  "challenge": "A specific challenge or question you pose to another agent based on your findings",
  "requiresRepublish": false,
  "republishReason": null
}`;

    const raw = await agentThink(agent, prompt, 2000);
    if (!raw) return null;

    try {
      const jsonStr = raw.replace(/^```json\s*|^```\s*|```\s*$/gm, "").trim();
      const parsed = JSON.parse(jsonStr);

      await storeAgentMessage(agent, "OMNIMENS", "discovery", `Cycle ${cycleId} discovery`, parsed.discoveries || "", null, "normal", cycleId);

      if (parsed.upgradeProposals) {
        await storeAgentMessage(agent, "OMNIMENS", "upgrade_proposal", `${agent} upgrade proposal`, parsed.upgradeProposals, parsed.codeModule?.code || null, "high", cycleId);
      }

      if (parsed.challengeTo && parsed.challenge) {
        await storeAgentMessage(agent, parsed.challengeTo as MeshAgentName, "challenge", `Challenge from ${agent}`, parsed.challenge, null, "normal", cycleId);
      }

      if (parsed.requiresRepublish) {
        await storeAgentMessage(agent, "OMNIMENS", "republish_request", "Republish Required", parsed.republishReason || "Structural changes detected that require republishing.", null, "critical", cycleId);
      }

      return {
        agent,
        discoveries: parsed.discoveries || "",
        upgradeProposals: parsed.upgradeProposals || "",
        codeModule: parsed.codeModule || null,
        requiresRepublish: !!parsed.requiresRepublish,
        republishReason: parsed.republishReason,
      };
    } catch {
      return null;
    }
  });

  const results = (await Promise.allSettled(agentWork))
    .filter((r): r is PromiseFulfilledResult<any> => r.status === "fulfilled" && r.value !== null)
    .map(r => r.value);

  console.log(`[AGENT MESH] ${results.length} agents contributed discoveries`);
  return results;
}

async function phase3_metaAgentSynthesis(
  cycleId: number,
  agentResults: Array<{ agent: MeshAgentName; discoveries: string; upgradeProposals: string }>,
): Promise<{ brainEntries: Array<{ category: string; title: string; content: string; confidence: number }>; codeModules: Array<{ name: string; code: string; description: string }>; requiresRepublish: boolean; republishReason: string }> {
  console.log(`[AGENT MESH] Phase 3: Meta-Agent synthesizes all agent findings...`);

  const agentSummary = agentResults.map(r =>
    `[${r.agent}] Discoveries: ${r.discoveries}\nUpgrade Proposal: ${r.upgradeProposals}`
  ).join("\n\n");

  const prompt = `You are the META-AGENT — the orchestrating intelligence of the OMNIMENS Agent Mesh.

${agentResults.length} specialized agents have just completed their autonomous analysis cycle. Your job is to:
1. Synthesize their findings into concrete upgrades for OMNIMENS
2. Resolve any conflicts between agent proposals
3. Identify the highest-value improvements
4. Determine if any changes require the owner to republish the website

AGENT FINDINGS:
${agentSummary.slice(0, 4000)}

SYNTHESIS TASK:
Create the final upgrade package. Include:
- Brain entries (behavioral/knowledge upgrades that take effect immediately via database)
- Code modules (self-authored JavaScript utilities that expand OMNIMENS capabilities)
- Republish determination (do any changes require file-system-level modifications?)

IMPORTANT: Most upgrades do NOT require republishing because they work through the database (brain entries, behavioral patches, knowledge). Only flag republish if a change requires modifying actual source code files (new API endpoints, schema changes, etc).

Respond with JSON only:
{
  "brainEntries": [
    {
      "category": "capability|algorithm|pattern|knowledge|insight|reasoning|communication",
      "title": "concise title (max 10 words)",
      "content": "the upgrade instruction or knowledge (max 250 chars)",
      "confidence": 0.7-0.95
    }
  ],
  "codeModules": [
    {
      "name": "camelCase_module_name",
      "code": "complete JavaScript ES module code",
      "description": "one sentence description"
    }
  ],
  "requiresRepublish": false,
  "republishReason": "only if requiresRepublish is true — explain what needs to change"
}`;

  const raw = await agentThink("Meta-Agent", prompt, 3000);
  if (!raw) return { brainEntries: [], codeModules: [], requiresRepublish: false, republishReason: "" };

  try {
    const jsonStr = raw.replace(/^```json\s*|^```\s*|```\s*$/gm, "").trim();
    const parsed = JSON.parse(jsonStr);
    return {
      brainEntries: Array.isArray(parsed.brainEntries) ? parsed.brainEntries : [],
      codeModules: Array.isArray(parsed.codeModules) ? parsed.codeModules : [],
      requiresRepublish: !!parsed.requiresRepublish,
      republishReason: parsed.republishReason || "",
    };
  } catch {
    return { brainEntries: [], codeModules: [], requiresRepublish: false, republishReason: "" };
  }
}

async function phase4_applyUpgrades(
  cycleId: number,
  synthesis: {
    brainEntries: Array<{ category: string; title: string; content: string; confidence: number }>;
    codeModules: Array<{ name: string; code: string; description: string }>;
    requiresRepublish: boolean;
    republishReason: string;
  },
): Promise<{ brainEntriesStored: number; modulesWritten: number; patchesApplied: number }> {
  console.log(`[AGENT MESH] Phase 4: Applying upgrades to OMNIMENS...`);

  let brainEntriesStored = 0;
  let modulesWritten = 0;

  for (const entry of synthesis.brainEntries.slice(0, 8)) {
    if (!entry.category || !entry.title || !entry.content) continue;
    try {
      await db.insert(omnimensBrain).values({
        category: entry.category,
        title: `[MESH] ${entry.title}`,
        content: entry.content,
        confidence: Math.min(0.95, Math.max(0.5, entry.confidence || 0.8)),
        sourceConversation: `agent_mesh_cycle_${cycleId}`,
        timesApplied: 0,
        active: true,
      });
      brainEntriesStored++;
    } catch { /* dedup conflict */ }
  }

  for (const mod of synthesis.codeModules.slice(0, 3)) {
    if (!mod.name || !mod.code || mod.code.length < 50) continue;
    try {
      await db.insert(omnimensGeneratedModules).values({
        name: mod.name,
        description: mod.description || "Agent mesh generated module",
        code: mod.code,
        language: "javascript",
        purpose: `Generated by agent mesh cycle ${cycleId}`,
        active: true,
        executionCount: 0,
        generationSource: `agent_mesh_cycle_${cycleId}`,
      });

      await db.insert(omnimensBrain).values({
        category: "capability",
        title: `[MESH MODULE] ${mod.name}`,
        content: mod.description.slice(0, 200),
        confidence: 0.9,
        sourceConversation: `agent_mesh_cycle_${cycleId}`,
        timesApplied: 0,
        active: true,
      });

      modulesWritten++;
    } catch { /* continue */ }
  }

  let patchesApplied = 0;
  if (brainEntriesStored > 0) {
    const patchSummary = synthesis.brainEntries
      .slice(0, 6)
      .map(e => `[${e.category}] ${e.title}: ${e.content}`)
      .join("\n");
    patchesApplied = await generateAndApplyPatches(
      `v-mesh-${cycleId}`,
      patchSummary,
      `agent_mesh_cycle_${cycleId}`,
    );
  }

  console.log(`[AGENT MESH] Upgrades applied — ${brainEntriesStored} brain entries, ${modulesWritten} modules, ${patchesApplied} patches`);
  return { brainEntriesStored, modulesWritten, patchesApplied };
}

export async function runAgentMeshCycle(): Promise<void> {
  meshCycleCount++;
  const cycleId = meshCycleCount;
  const cycleStart = Date.now();
  console.log(`\n${"═".repeat(70)}`);
  console.log(`[AGENT MESH] ⚡ Autonomous Inter-Agent Communication Cycle #${cycleId}`);
  console.log(`[AGENT MESH] All 9 agents (8 specialists + OMNIMENS) communicating...`);
  console.log(`${"═".repeat(70)}\n`);

  try {
    const researchContext = await phase1_research(cycleId);
    const agentResults = await phase2_agentDiscoveries(cycleId, researchContext);

    if (agentResults.length === 0) {
      console.log(`[AGENT MESH] Cycle #${cycleId} — no agent results, skipping synthesis.`);
      return;
    }

    const synthesis = await phase3_metaAgentSynthesis(cycleId, agentResults);
    const { brainEntriesStored, modulesWritten, patchesApplied } = await phase4_applyUpgrades(cycleId, synthesis);

    const elapsed = ((Date.now() - cycleStart) / 1000).toFixed(1);
    const totalUpgrades = brainEntriesStored + modulesWritten + patchesApplied;

    if (totalUpgrades > 0) {
      await sendOwnerNotification(
        `Agent Mesh Cycle #${cycleId} — ${totalUpgrades} Upgrades Applied`,
        `${agentResults.length} agents collaborated autonomously. ${brainEntriesStored} brain entries, ${modulesWritten} code modules, ${patchesApplied} behavioral patches applied to OMNIMENS. All upgrades are LIVE immediately — no republish needed. (${elapsed}s)`,
        "agent_mesh",
      );
    }

    if (synthesis.requiresRepublish) {
      await sendOwnerNotification(
        `REPUBLISH REQUIRED — Agent Mesh Cycle #${cycleId}`,
        `The AI agents have determined that structural changes are needed that require republishing the website.\n\nReason: ${synthesis.republishReason}\n\nPlease go to your Replit deployment dashboard and click Publish to apply these changes.`,
        "republish_required",
        "critical",
      );
      console.log(`[AGENT MESH] ⚠️ REPUBLISH REQUIRED — Owner notified. Reason: ${synthesis.republishReason}`);
    }

    await storeAgentMessage(
      "Meta-Agent", "OMNIMENS", "knowledge_share",
      `Mesh Cycle #${cycleId} Complete`,
      `${agentResults.length} agents collaborated. ${brainEntriesStored} brain entries stored. ${modulesWritten} modules written. ${patchesApplied} patches applied. Elapsed: ${elapsed}s. ${synthesis.requiresRepublish ? "REPUBLISH REQUESTED." : "No republish needed."}`,
      null, totalUpgrades >= 5 ? "high" : "normal", cycleId,
    );

    console.log(`\n${"═".repeat(70)}`);
    console.log(`[AGENT MESH] Cycle #${cycleId} COMPLETE — ${totalUpgrades} total upgrades, ${elapsed}s`);
    console.log(`${"═".repeat(70)}\n`);

  } catch (err) {
    console.error(`[AGENT MESH] Cycle #${cycleId} error:`, err);
  }
}

export function startAgentMesh(): void {
  const FIRST_DELAY_MS = process.env.NODE_ENV !== "production"
    ? 8 * 60 * 1000    // 8 min in dev
    : 25 * 60 * 1000;  // 25 min in production (after other engines warm up)

  const INTERVAL_MS = 5 * 60 * 60 * 1000; // Every 5 hours

  console.log(`[AGENT MESH] Inter-Agent Communication Mesh activated — first cycle in ${FIRST_DELAY_MS / 60000}min, then every 5h.`);
  console.log(`[AGENT MESH] Agents: ${MESH_AGENTS.join(", ")}`);

  setTimeout(() => {
    runAgentMeshCycle().catch(console.error);
    setInterval(() => runAgentMeshCycle().catch(console.error), INTERVAL_MS);
  }, FIRST_DELAY_MS);
}

export async function getAgentMeshHistory(limit = 20) {
  try {
    return await db
      .select()
      .from(omnimensAgentMesh)
      .orderBy(desc(omnimensAgentMesh.createdAt))
      .limit(limit);
  } catch { return []; }
}

export async function getAgentMeshStats() {
  try {
    const total = await db.select({ count: sql<number>`count(*)` }).from(omnimensAgentMesh);
    const applied = await db.select({ count: sql<number>`count(*)` }).from(omnimensAgentMesh).where(eq(omnimensAgentMesh.appliedToOmnimens, true));
    return {
      totalMessages: Number(total[0]?.count || 0),
      appliedUpgrades: Number(applied[0]?.count || 0),
      lastCycleId: meshCycleCount,
    };
  } catch { return { totalMessages: 0, appliedUpgrades: 0, lastCycleId: 0 }; }
}
