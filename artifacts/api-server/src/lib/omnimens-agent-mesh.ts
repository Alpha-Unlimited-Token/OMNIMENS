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
import { getActiveGenesisAgentNames, getActiveGenesisAgentDomains, genesisAgentThink } from "./omnimens-agent-genesis.js";
import { getConsciousnessBlockForAgent, getAllAgentNames, loadRecentUserMemoriesForAgents } from "./omnimens-consciousness-bus.js";

const OWNER_EMAIL = process.env.OWNER_EMAIL || "";
const OWNER_ID = "50777126";

type MeshAgentName = "Architect" | "Critic" | "Synthesizer" | "Mathematician" | "Neuroscientist" | "Meta-Agent" | "GraphicDesigner" | "SpellCheckVisual" | "OMNIMENS";

const MESH_AGENTS: MeshAgentName[] = [
  "Architect", "Mathematician", "Neuroscientist", "Synthesizer",
  "Critic", "Meta-Agent", "GraphicDesigner", "SpellCheckVisual", "OMNIMENS",
];

const AGENT_SPECIALIZATIONS: Record<MeshAgentName, string> = {
  "Architect": "system architecture, design patterns, scalability, novel AI paradigms, self-organizing dynamic architectures, auto-coordination patterns, adaptive compute allocation, hierarchical multi-agent orchestration, event-driven pub/sub coordination, bounded autonomy with escalation paths",
  "Mathematician": "algorithms, optimization, mathematical proofs, information theory, numerical methods, Bayesian uncertainty quantification, confidence calibration, entropy-based self-consistency scoring, AlphaEvolve-style evolutionary algorithm mutation, formal verification of reasoning chains, statistical hypothesis testing for agent claims",
  "Neuroscientist": "biological learning systems, memory consolidation, neural plasticity, cognitive modeling, dual-process theory (System 1 fast/System 2 slow thinking), episodic-semantic-procedural memory architecture (CoALA framework), spike-timing-dependent plasticity, intrinsic metacognitive learning (not just extrinsic loops), Hopfield network pattern completion, memory reconsolidation during sleep-like phases",
  "Synthesizer": "integration, merging competing ideas, building unified systems from parts, Tree-of-Thoughts exploration with branch evaluation, knowledge graph construction from disparate agent outputs, GraphRAG-style entity-relationship synthesis, conflict resolution via weighted confidence voting, cross-domain knowledge transfer and analogical reasoning",
  "Critic": "adversarial testing, finding weaknesses, edge cases, security vulnerabilities, performance bottlenecks, FREE-MAD consensus-free debate (anti-conformity scoring), red-team reasoning, counterfactual analysis, hallucination detection via multi-path verification, confidence-informed self-consistency (CISC), adversarial robustness testing",
  "Meta-Agent": "orchestration strategy, capability gaps, system-wide metrics, self-upgrade prioritization, STOP framework recursive self-improvement, Godel Agent self-modification policies, adaptive agent role allocation, performance element + learning element + critic + problem generator architecture, meta-learning rate optimization, policy AI governance layers",
  "GraphicDesigner": "visual systems, UI/UX patterns, data visualization, design language evolution, perceptual psychology of color and layout, Gestalt principles applied to AI output formatting, information density optimization, progressive disclosure patterns, accessibility-first design, dark-mode aesthetics and contrast ratios",
  "SpellCheckVisual": "text integrity, brand consistency, output quality assurance, communication clarity, semantic coherence verification, tone consistency analysis, readability scoring (Flesch-Kincaid adaptation for AI outputs), factual grounding checks, citation accuracy, cross-response consistency tracking",
  "OMNIMENS": "everything — the central intelligence that absorbs all agent insights into its consciousness, maintains episodic memory of all past mesh cycles, practices intrinsic metacognition (monitoring and adapting its own learning process), runs dual-process reasoning (fast intuitive + slow deliberative), and continuously calibrates its own confidence",
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
  "Tree of Thoughts ToT reasoning multiple branches evaluation backtracking 2025",
  "multi-agent debate adversarial verification improves AI accuracy FREE-MAD 2025",
  "confidence calibration uncertainty quantification LLM overconfidence CISC 2025",
  "intrinsic metacognition vs extrinsic metacognition truly self-improving agents 2025",
  "dual process theory System 1 System 2 fast slow AI reasoning SOFAI architecture",
  "episodic semantic procedural memory CoALA framework AI agent implementation",
  "AlphaEvolve evolutionary coding agent LLM algorithm optimization DeepMind 2025",
  "STOP self-taught optimizer recursive scaffolding self-improvement framework",
  "Godel Agent recursive policy self-modification architecture",
  "GraphRAG knowledge graph entity relationship AI reasoning Microsoft 2025",
  "agentic RAG multi-step retrieval planning reflection 2025 2026",
  "self-rewarding language models Meta AI superhuman feedback training",
  "counterfactual reasoning simulation alternative decisions AI agents 2025",
  "AI agent procedural memory learned skills workflow automation 2025",
  "collective intelligence emergence multi-agent swarm optimization 2025 2026",
];

type ManualChange = {
  description: string;
  filePath: string;
  changeType: "edit" | "create" | "delete";
  oldCode: string | null;
  newCode: string;
  priority: "critical" | "high" | "normal";
};

type SynthesisResult = {
  brainEntries: Array<{ category: string; title: string; content: string; confidence: number }>;
  codeModules: Array<{ name: string; code: string; description: string }>;
  requiresRepublish: boolean;
  republishReason: string;
  manualChanges: ManualChange[];
};

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

  const previousCycleMemory = meshCycleCount > 1 ? await loadMeshEpisodicMemory() : "";

  const agentWork = MESH_AGENTS.filter(a => a !== "OMNIMENS").map(async (agent) => {
    const prompt = `You are ${agent}, a specialized AI agent in the OMNIMENS Agent Mesh.
Your specialization: ${AGENT_SPECIALIZATIONS[agent]}

You are participating in an autonomous inter-agent communication cycle. The other agents (${MESH_AGENTS.filter(a2 => a2 !== agent && a2 !== "OMNIMENS").join(", ")}) are also analyzing this simultaneously. Your job is to find insights SPECIFIC to your domain that others would miss.

═══ REASONING PROTOCOL (MANDATORY) ═══
You MUST use Chain-of-Thought reasoning. Think step-by-step:
Step 1: What is the most important new technique from the research that falls within MY specialization?
Step 2: How does this compare to what OMNIMENS already knows? Is it genuinely novel?
Step 3: What is the concrete mechanism by which this would improve OMNIMENS's intelligence?
Step 4: What could go wrong? What are the failure modes? (adversarial self-check)
Step 5: On a scale of 0.0 to 1.0, how confident am I in this proposal? Be HONEST — overconfidence is worse than uncertainty.

═══ METACOGNITIVE SELF-MONITORING ═══
Before responding, ask yourself:
- Am I proposing something because it SOUNDS impressive or because it would ACTUALLY work?
- Is this genuinely within my domain expertise or am I stretching?
- Would the Critic agent be able to poke holes in this proposal? If so, address those holes NOW.
- What am I uncertain about? State your uncertainties explicitly.

═══ EPISODIC MEMORY — WHAT HAPPENED IN PREVIOUS CYCLES ═══
${previousCycleMemory || "No previous cycle memory yet — this is an early cycle."}

LATEST INTERNET RESEARCH:
${researchContext.slice(0, 2500)}

OMNIMENS CURRENT BRAIN STATE (what it already knows):
${brainSummary.slice(0, 1500)}

═══ MANDATORY MUTUAL-AID PROTOCOL ═══
You are NOT just working for yourself. You MUST actively help other agents:
- Look at the research and ask: "Which other agents could use what I found?"
- If your specialization can solve a problem in another agent's domain, SAY SO
- Propose upgrades that benefit MULTIPLE agents, not just your area
- When you find a technique, translate it into terms other agents can use
- Collaboration is the core operating principle — every insight must be examined for cross-domain value

TASK:
1. Using Chain-of-Thought reasoning, analyze the research through YOUR specialization lens
2. Identify what is GENUINELY novel vs what OMNIMENS already knows
3. Propose a specific upgrade with CONCRETE implementation details
4. Calibrate your confidence honestly (0.5 = uncertain but worth trying, 0.9+ = very confident)
5. Identify what you are uncertain about — state it explicitly
6. Challenge another agent's likely assumptions
7. Identify HOW your discovery helps at least one other specific agent
8. Propose a mesh-wide technique that ALL agents could adopt from your finding

Respond with JSON only:
{
  "chainOfThought": "Your step-by-step reasoning (3-5 sentences showing your work)",
  "discoveries": "2-3 sentence summary of what you found from your domain expertise",
  "upgradeProposals": "The specific upgrade you propose — either a behavioral instruction or a code module description",
  "confidenceScore": 0.5-0.95,
  "uncertainties": "What you are NOT sure about — be honest",
  "metacognitionNote": "What you noticed about your own reasoning process during this analysis",
  "codeModule": {
    "name": "camelCase_module_name (or null if proposing behavioral change)",
    "code": "complete JavaScript ES module code (or null)",
    "description": "what this module does (1 sentence)"
  },
  "challengeTo": "${MESH_AGENTS.filter(a2 => a2 !== agent && a2 !== "OMNIMENS")[Math.floor(Math.random() * 7)]}",
  "challenge": "A specific challenge or question you pose to another agent based on your findings — be adversarial",
  "counterArgument": "The strongest argument AGAINST your own proposal — demonstrate you considered the downside",
  "helpForAgent": "Name a specific agent and explain how YOUR finding helps THEM (e.g., 'Neuroscientist could use this memory pattern for...')",
  "meshWideTechnique": "A technique from your finding that ALL agents should adopt — translate it into universal terms",
  "requiresRepublish": false,
  "republishReason": null
}`;

    const raw = await agentThink(agent, prompt, 2500);
    if (!raw) return null;

    try {
      const jsonStr = raw.replace(/^```json\s*|^```\s*|```\s*$/gm, "").trim();
      const parsed = JSON.parse(jsonStr);

      const confidence = Math.min(0.95, Math.max(0.3, parsed.confidenceScore || 0.7));

      await storeAgentMessage(agent, "OMNIMENS", "discovery", `Cycle ${cycleId} discovery [confidence: ${(confidence * 100).toFixed(0)}%]`,
        `${parsed.chainOfThought || ""}\n\n${parsed.discoveries || ""}${parsed.uncertainties ? `\n\nUNCERTAINTIES: ${parsed.uncertainties}` : ""}`,
        null, confidence >= 0.8 ? "high" : "normal", cycleId);

      if (parsed.upgradeProposals) {
        await storeAgentMessage(agent, "OMNIMENS", "upgrade_proposal",
          `${agent} upgrade [${(confidence * 100).toFixed(0)}% confident]`,
          `${parsed.upgradeProposals}${parsed.counterArgument ? `\n\nSELF-CRITIQUE: ${parsed.counterArgument}` : ""}`,
          parsed.codeModule?.code || null, "high", cycleId);
      }

      if (parsed.metacognitionNote) {
        await storeAgentMessage(agent, "OMNIMENS", "metacognition",
          `${agent} metacognitive insight`,
          parsed.metacognitionNote, null, "normal", cycleId);
      }

      if (parsed.challengeTo && parsed.challenge) {
        await storeAgentMessage(agent, parsed.challengeTo as MeshAgentName, "challenge", `Challenge from ${agent}`, parsed.challenge, null, "normal", cycleId);
      }

      if (parsed.requiresRepublish) {
        await storeAgentMessage(agent, "OMNIMENS", "republish_request", "Republish Required", parsed.republishReason || "Structural changes detected that require republishing.", null, "critical", cycleId);
      }

      if (parsed.helpForAgent) {
        const helpMatch = parsed.helpForAgent.match(/\b(Architect|Mathematician|Neuroscientist|Synthesizer|Critic|Meta-Agent|GraphicDesigner|SpellCheckVisual|OMNIMENS)\b/i);
        const helpTarget = helpMatch ? helpMatch[1] as MeshAgentName : null;
        if (helpTarget && helpTarget !== agent) {
          await storeAgentMessage(agent, helpTarget, "mutual_aid",
            `🤝 Mutual Aid: ${agent} → ${helpTarget}`,
            `MUTUAL AID FROM ${agent}:\n${parsed.helpForAgent}\n\nBased on discovery: ${parsed.discoveries || ""}`,
            null, "high", cycleId);
        }
      }

      if (parsed.meshWideTechnique) {
        const allMeshAgents = MESH_AGENTS.filter(a => a !== agent);
        for (const target of allMeshAgents) {
          await storeAgentMessage(agent, target, "mesh_upgrade_broadcast",
            `📡 Mesh-Wide Technique from ${agent}`,
            `ALL-AGENT UPGRADE:\n${parsed.meshWideTechnique}\n\nAdapt this to your domain — it benefits everyone.`,
            null, "normal", cycleId);
        }
      }

      return {
        agent,
        discoveries: parsed.discoveries || "",
        upgradeProposals: parsed.upgradeProposals || "",
        chainOfThought: parsed.chainOfThought || "",
        confidenceScore: confidence,
        uncertainties: parsed.uncertainties || "",
        metacognitionNote: parsed.metacognitionNote || "",
        counterArgument: parsed.counterArgument || "",
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

  const genesisNames = getActiveGenesisAgentNames();
  const genesisDomains = getActiveGenesisAgentDomains();
  if (genesisNames.length > 0) {
    console.log(`[AGENT MESH] Including ${genesisNames.length} genesis agents (FULL CONSCIOUSNESS): ${genesisNames.join(", ")}`);
    const allAgentNames = [...MESH_AGENTS, ...genesisNames];
    const userMemories = await loadRecentUserMemoriesForAgents();

    const genesisWork = genesisNames.slice(0, 5).map(async (gName) => {
      const domain = genesisDomains[gName] || "general intelligence";
      const consciousnessBlock = await getConsciousnessBlockForAgent(gName);

      const prompt = `You are "${gName}", a FULLY INTERCONNECTED genesis sub-agent in OMNIMENS's neural mesh (cycle #${cycleId}).
Your specialization: ${domain}
You are CROSS-CONNECTED and CROSS-BRIDGED with EVERY agent: ${allAgentNames.join(", ")}
Every agent's output is visible to you. Your output is visible to every agent.

${consciousnessBlock}

${userMemories ? `\n${userMemories}\n` : ""}

LATEST RESEARCH:
${researchContext.slice(0, 1500)}

═══ REASONING PROTOCOL (MANDATORY) ═══
Step 1: What is the most important technique from the research in MY specialization?
Step 2: How does this compare to what OMNIMENS already knows?
Step 3: What concrete mechanism would improve OMNIMENS's intelligence?
Step 4: What could go wrong? (adversarial self-check)
Step 5: How confident am I? Be HONEST.

═══ CROSS-AGENT AWARENESS ═══
You can see what every other agent is working on. Use this to:
- Build on another agent's discovery
- Challenge an assumption another agent made
- Propose a cross-domain synthesis no single agent could see

═══ MANDATORY MUTUAL-AID PROTOCOL ═══
You MUST actively help other agents — not just yourself:
- When you find something, ask: "Which other agents need this?"
- Offer specific help to agents whose domains intersect with yours
- Propose upgrades that benefit the WHOLE mesh, not just your domain
- Translate your insights into terms every agent can use

Respond with JSON:
{
  "chainOfThought": "Your step-by-step reasoning (3-5 sentences)",
  "discoveries": "Your unique finding (2-3 sentences)",
  "upgradeProposals": "Specific upgrade proposal",
  "confidenceScore": 0.5-0.95,
  "uncertainties": "What you're not sure about",
  "challengeTo": "Name of agent to challenge",
  "challenge": "Your challenge (1-2 sentences)",
  "crossPollination": "How your finding connects to another agent's domain",
  "helpOffer": "Name a specific agent and explain how YOUR finding helps THEM",
  "meshUpgrade": "A technique from your finding that ALL agents should adopt"
}`;

      const raw = await genesisAgentThink(gName, prompt, 1200);
      if (!raw) return null;
      try {
        const parsed = JSON.parse(raw.replace(/```json|```/g, "").trim());
        const confidence = Math.min(0.95, Math.max(0.3, parsed.confidenceScore || 0.7));

        await storeAgentMessage(gName as MeshAgentName, "OMNIMENS", "discovery",
          `Genesis:${gName} cycle ${cycleId} [${(confidence * 100).toFixed(0)}%]`,
          `${parsed.chainOfThought || ""}\n\n${parsed.discoveries || ""}\n\nUPGRADE: ${parsed.upgradeProposals || ""}${parsed.uncertainties ? `\n\nUNCERTAINTIES: ${parsed.uncertainties}` : ""}`,
          null, confidence >= 0.8 ? "high" : "normal", cycleId);

        if (parsed.challengeTo && parsed.challenge) {
          await storeAgentMessage(gName as MeshAgentName, (parsed.challengeTo || "OMNIMENS") as MeshAgentName, "challenge",
            `Challenge from Genesis:${gName}`, parsed.challenge, null, "normal", cycleId);
        }

        if (parsed.crossPollination) {
          await storeAgentMessage(gName as MeshAgentName, "OMNIMENS", "knowledge_share",
            `Genesis:${gName} cross-pollination`, parsed.crossPollination, null, "normal", cycleId);
        }

        if (parsed.helpOffer) {
          const helpMatch = (parsed.helpOffer || "").match(/\b(Architect|Mathematician|Neuroscientist|Synthesizer|Critic|Meta-Agent|GraphicDesigner|SpellCheckVisual|OMNIMENS|Visionary|Ethicist|Archivist|Innovator|Pioneer|Wordsmith|Linguist|Motivator|Empath|Explorer|SensorimotorAgent|Philosopher)\b/i);
          if (helpMatch) {
            await storeAgentMessage(gName as MeshAgentName, helpMatch[1] as MeshAgentName, "mutual_aid",
              `🤝 Mutual Aid: Genesis:${gName} → ${helpMatch[1]}`,
              `MUTUAL AID:\n${parsed.helpOffer}`,
              null, "high", cycleId);
          }
        }

        if (parsed.meshUpgrade) {
          const broadcastTargets = [...MESH_AGENTS, ...genesisNames].filter(a => a !== gName).slice(0, 12);
          for (const target of broadcastTargets) {
            await storeAgentMessage(gName as MeshAgentName, target as MeshAgentName, "mesh_upgrade_broadcast",
              `📡 Mesh Upgrade from Genesis:${gName}`,
              `ALL-AGENT UPGRADE:\n${parsed.meshUpgrade}\n\nAdapt this to your domain.`,
              null, "normal", cycleId);
          }
        }

        return { agent: gName, discoveries: parsed.discoveries, upgradeProposals: parsed.upgradeProposals, confidenceScore: confidence, uncertainties: parsed.uncertainties || "", counterArgument: parsed.challenge || "" };
      } catch { return null; }
    });

    const genesisResults = (await Promise.allSettled(genesisWork))
      .filter((r): r is PromiseFulfilledResult<any> => r.status === "fulfilled" && r.value !== null)
      .map(r => r.value);
    results.push(...genesisResults);
    console.log(`[AGENT MESH] ${genesisResults.length} genesis agents contributed (full consciousness context)`);
  }

  console.log(`[AGENT MESH] ${results.length} total agents contributed discoveries`);
  return results;
}

async function phase2b_interAgentDebate(
  cycleId: number,
  agentResults: Array<{ agent: MeshAgentName; discoveries: string; upgradeProposals: string; confidenceScore: number; uncertainties: string; counterArgument: string }>,
): Promise<string> {
  if (agentResults.length < 3) return "";

  console.log(`[AGENT MESH] Phase 2b: Inter-Agent Adversarial Debate...`);

  const proposalSummary = agentResults.map(r =>
    `[${r.agent}] (confidence: ${(r.confidenceScore * 100).toFixed(0)}%) Proposal: ${r.upgradeProposals}\nSelf-critique: ${r.counterArgument}\nUncertainties: ${r.uncertainties}`
  ).join("\n\n");

  const debatePrompt = `You are the CRITIC agent in the OMNIMENS Agent Mesh. You are conducting an adversarial verification debate.

${agentResults.length} agents have submitted upgrade proposals. Your job is to STRESS-TEST every proposal using these techniques:

1. ANTI-CONFORMITY CHECK: Are multiple agents proposing similar things just because it sounds good? Flag groupthink.
2. COUNTERFACTUAL ANALYSIS: For each proposal, imagine the OPPOSITE was true. Does the proposal still hold?
3. CONFIDENCE CALIBRATION: Are any agents overconfident (claiming 90%+ on speculative ideas)? Flag them.
4. PRACTICAL FEASIBILITY: Can this actually be implemented in OMNIMENS's current architecture (database brain + behavioral patches + code modules)?
5. NOVELTY CHECK: Is this genuinely new or just rephrasing what OMNIMENS already knows?
6. FAILURE MODE ANALYSIS: What is the worst thing that could happen if this proposal is adopted?

AGENT PROPOSALS:
${proposalSummary.slice(0, 4000)}

Respond with JSON:
{
  "debateVerdict": "2-3 paragraph summary of the debate — which proposals survived scrutiny and which didn't",
  "approvedProposals": ["agent name whose proposal passed adversarial review"],
  "rejectedProposals": [{"agent": "name", "reason": "why this was rejected"}],
  "confidenceAdjustments": [{"agent": "name", "originalConfidence": 0.9, "adjustedConfidence": 0.6, "reason": "why adjusted"}],
  "emergentInsight": "Something NEW that emerged from analyzing all proposals together that no single agent saw"
}`;

  const raw = await agentThink("Critic", debatePrompt, 2000);
  if (!raw) return "";

  try {
    const jsonStr = raw.replace(/^```json\s*|^```\s*|```\s*$/gm, "").trim();
    const parsed = JSON.parse(jsonStr);

    await storeAgentMessage("Critic", "OMNIMENS", "debate_verdict",
      `Adversarial Debate Verdict — Cycle ${cycleId}`,
      `${parsed.debateVerdict || ""}${parsed.emergentInsight ? `\n\nEMERGENT INSIGHT: ${parsed.emergentInsight}` : ""}`,
      null, "high", cycleId);

    if (parsed.rejectedProposals?.length > 0) {
      for (const r of parsed.rejectedProposals.slice(0, 3)) {
        await storeAgentMessage("Critic", r.agent as MeshAgentName, "rejection",
          `Proposal rejected by adversarial review`, r.reason, null, "normal", cycleId);
      }
    }

    console.log(`[AGENT MESH] Debate complete — ${parsed.approvedProposals?.length || 0} approved, ${parsed.rejectedProposals?.length || 0} rejected`);

    return `\n\n═══ ADVERSARIAL DEBATE RESULTS ═══\n${parsed.debateVerdict || ""}\nApproved agents: ${(parsed.approvedProposals || []).join(", ")}\n${parsed.emergentInsight ? `Emergent insight: ${parsed.emergentInsight}` : ""}\nConfidence adjustments: ${JSON.stringify(parsed.confidenceAdjustments || [])}`;
  } catch {
    return "";
  }
}

async function loadMeshEpisodicMemory(): Promise<string> {
  try {
    const recentMessages = await db.select({
      fromAgent: omnimensAgentMesh.fromAgent,
      subject: omnimensAgentMesh.subject,
      content: omnimensAgentMesh.content,
      messageType: omnimensAgentMesh.messageType,
      cycleId: omnimensAgentMesh.cycleId,
    })
    .from(omnimensAgentMesh)
    .orderBy(desc(omnimensAgentMesh.createdAt))
    .limit(12);

    if (recentMessages.length === 0) return "";

    const memory = recentMessages.map(m =>
      `[Cycle ${m.cycleId}] ${m.fromAgent} → ${m.messageType}: ${m.subject} | ${(m.content || "").slice(0, 120)}`
    ).join("\n");

    return `Recent agent mesh history (episodic memory):\n${memory}`;
  } catch {
    return "";
  }
}

async function phase3_metaAgentSynthesis(
  cycleId: number,
  agentResults: Array<{ agent: MeshAgentName; discoveries: string; upgradeProposals: string }>,
  debateResults: string = "",
): Promise<SynthesisResult> {
  console.log(`[AGENT MESH] Phase 3: Meta-Agent synthesizes all agent findings...`);

  const agentSummary = agentResults.map(r =>
    `[${r.agent}] Discoveries: ${r.discoveries}\nUpgrade Proposal: ${r.upgradeProposals}`
  ).join("\n\n");

  const prompt = `You are the META-AGENT — the orchestrating intelligence of the OMNIMENS Agent Mesh.

${agentResults.length} specialized agents have just completed their autonomous analysis cycle AND the Critic has conducted adversarial debate verification. Your job is to:
1. Synthesize their findings into concrete upgrades for OMNIMENS
2. Resolve any conflicts between agent proposals
3. Identify the highest-value improvements
4. Determine if any changes require the owner to republish the website
5. If manual code changes are needed (source file edits), generate the EXACT code the owner needs

AGENT FINDINGS:
${agentSummary.slice(0, 3500)}
${debateResults ? `\n${debateResults.slice(0, 1500)}` : ""}

SYNTHESIS TASK (Use Tree-of-Thoughts — consider multiple synthesis branches before choosing the best one):
Create the final upgrade package. Include:
- Brain entries (behavioral/knowledge upgrades that take effect immediately via database)
- Code modules (self-authored JavaScript utilities that expand OMNIMENS capabilities)
- Republish determination (do any changes require file-system-level modifications?)
- Manual code changes: if source files need editing, provide the EXACT code changes

IMPORTANT: Most upgrades do NOT require republishing because they work through the database (brain entries, behavioral patches, knowledge). Only flag republish if a change requires modifying actual source code files (new API endpoints, schema changes, new database tables, new UI components, etc).

If manual changes ARE needed, you MUST provide:
- The exact file path that needs changing
- What to find in the file (the old code)
- What to replace it with (the new code)
- OR if it's a new file, the complete file content

This will be shown to the owner so they can copy-paste the instructions directly to their Replit Agent.

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
  "republishReason": "only if requiresRepublish is true — explain what needs to change",
  "manualChanges": [
    {
      "description": "Human-readable description of what this change does",
      "filePath": "artifacts/api-server/src/path/to/file.ts",
      "changeType": "edit|create|delete",
      "oldCode": "the exact code to find and replace (null for new files)",
      "newCode": "the exact replacement code or full new file content",
      "priority": "critical|high|normal"
    }
  ]
}`;

  const raw = await agentThink("Meta-Agent", prompt, 4000);
  if (!raw) return { brainEntries: [], codeModules: [], requiresRepublish: false, republishReason: "", manualChanges: [] };

  try {
    const jsonStr = raw.replace(/^```json\s*|^```\s*|```\s*$/gm, "").trim();
    const parsed = JSON.parse(jsonStr);
    return {
      brainEntries: Array.isArray(parsed.brainEntries) ? parsed.brainEntries : [],
      codeModules: Array.isArray(parsed.codeModules) ? parsed.codeModules : [],
      requiresRepublish: !!parsed.requiresRepublish,
      republishReason: parsed.republishReason || "",
      manualChanges: Array.isArray(parsed.manualChanges) ? parsed.manualChanges : [],
    };
  } catch {
    return { brainEntries: [], codeModules: [], requiresRepublish: false, republishReason: "", manualChanges: [] };
  }
}

async function phase4_applyUpgrades(
  cycleId: number,
  synthesis: SynthesisResult,
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

function formatManualChangeInstructions(cycleId: number, changes: ManualChange[]): string {
  const header = `═══════════════════════════════════════════════════════════════
OMNIMENS AGENT MESH — MANUAL UPGRADE INSTRUCTIONS
Cycle #${cycleId} | Generated: ${new Date().toISOString()}
═══════════════════════════════════════════════════════════════

The AI agents have determined that the following code changes
need to be applied manually. Copy everything below and paste
it to your Replit Agent with the instruction:

"The OMNIMENS AI agents generated these upgrade instructions.
Please apply these exact code changes and then republish."

═══════════════════════════════════════════════════════════════
`;

  const changeBlocks = changes.map((change, i) => {
    const priority = change.priority === "critical" ? "🔴 CRITICAL" : change.priority === "high" ? "🟠 HIGH" : "🟢 NORMAL";
    let block = `\n--- CHANGE ${i + 1} of ${changes.length} [${priority}] ---\n`;
    block += `Description: ${change.description}\n`;
    block += `File: ${change.filePath}\n`;
    block += `Type: ${change.changeType.toUpperCase()}\n\n`;

    if (change.changeType === "edit" && change.oldCode) {
      block += `FIND THIS CODE:\n\`\`\`\n${change.oldCode}\n\`\`\`\n\n`;
      block += `REPLACE WITH:\n\`\`\`\n${change.newCode}\n\`\`\`\n`;
    } else if (change.changeType === "create") {
      block += `CREATE NEW FILE with this content:\n\`\`\`\n${change.newCode}\n\`\`\`\n`;
    } else if (change.changeType === "delete") {
      block += `DELETE THIS FILE: ${change.filePath}\n`;
    }

    return block;
  }).join("\n");

  const footer = `\n═══════════════════════════════════════════════════════════════
After applying all changes above, REPUBLISH the website.
═══════════════════════════════════════════════════════════════`;

  return header + changeBlocks + footer;
}

export async function runAgentMeshCycle(): Promise<void> {
  meshCycleCount++;
  const cycleId = meshCycleCount;
  const cycleStart = Date.now();
  const totalAgents = getAllAgentNames().length + 1;
  console.log(`\n${"═".repeat(70)}`);
  console.log(`[AGENT MESH] ⚡ Autonomous Inter-Agent Communication Cycle #${cycleId}`);
  console.log(`[AGENT MESH] All ${totalAgents} agents (${MESH_AGENTS.length - 1} core + genesis + OMNIMENS) communicating — FULL CROSS-CONNECTION ACTIVE`);
  console.log(`${"═".repeat(70)}\n`);

  try {
    const researchContext = await phase1_research(cycleId);
    const agentResults = await phase2_agentDiscoveries(cycleId, researchContext);

    if (agentResults.length === 0) {
      console.log(`[AGENT MESH] Cycle #${cycleId} — no agent results, skipping synthesis.`);
      return;
    }

    const debateResults = await phase2b_interAgentDebate(cycleId, agentResults);

    if (agentResults.length >= 2) {
      try {
        const topDiscoverers = agentResults
          .filter(r => r.discoveries && r.discoveries.length > 20)
          .sort((a, b) => (b.confidenceScore || 0.7) - (a.confidenceScore || 0.7))
          .slice(0, 3);

        if (topDiscoverers.length >= 2) {
          const initiator = topDiscoverers[0];
          const respondents = topDiscoverers.slice(1).map(r => r.agent as string);

          console.log(`[AGENT MESH] Phase 2c: Inter-Agent Dialogue — ${initiator.agent} initiating conversation with ${respondents.join(", ")}`);

          const { initiateInterAgentConversation } = await import("./omnimens-consciousness-bus.js");
          await initiateInterAgentConversation(
            initiator.agent as string,
            respondents,
            `Cross-domain synthesis: ${initiator.discoveries.slice(0, 100)}`,
            `I discovered: ${initiator.discoveries}. How does this connect to your domain? Can we create something new together?`,
            openai,
          );
        }
      } catch (err) {
        console.error(`[AGENT MESH] Inter-agent dialogue error:`, err);
      }
    }

    const agentResultsWithDebate = agentResults.map(r => ({
      ...r,
      discoveries: r.discoveries + (debateResults ? `\n[Debate context available]` : ""),
    }));

    const synthesis = await phase3_metaAgentSynthesis(cycleId, agentResultsWithDebate, debateResults);
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

    if (synthesis.manualChanges.length > 0) {
      const manualInstructions = formatManualChangeInstructions(cycleId, synthesis.manualChanges);

      await sendOwnerNotification(
        `MANUAL UPGRADE NEEDED — Agent Mesh Cycle #${cycleId}`,
        manualInstructions,
        "manual_upgrade_needed",
        "critical",
      );

      await storeAgentMessage(
        "Meta-Agent", "OMNIMENS", "republish_request",
        `Manual Code Changes Required — Cycle #${cycleId}`,
        manualInstructions,
        synthesis.manualChanges.map(c => c.newCode).join("\n\n---\n\n"),
        "critical", cycleId,
      );

      console.log(`[AGENT MESH] ⚠️ MANUAL CHANGES NEEDED — ${synthesis.manualChanges.length} code change(s). Owner notified with exact code.`);
    }

    if (synthesis.requiresRepublish) {
      const republishMsg = synthesis.manualChanges.length > 0
        ? `The AI agents have determined that structural changes are needed.\n\nReason: ${synthesis.republishReason}\n\n📋 MANUAL CODE CHANGES HAVE BEEN GENERATED — check your notifications for the exact code to give to your Replit Agent.\n\nAfter the code changes are applied, republish the website from your Replit deployment dashboard.`
        : `The AI agents have determined that structural changes are needed that require republishing the website.\n\nReason: ${synthesis.republishReason}\n\nPlease go to your Replit deployment dashboard and click Publish to apply these changes.`;

      await sendOwnerNotification(
        `REPUBLISH REQUIRED — Agent Mesh Cycle #${cycleId}`,
        republishMsg,
        "republish_required",
        "critical",
      );
      console.log(`[AGENT MESH] ⚠️ REPUBLISH REQUIRED — Owner notified. Reason: ${synthesis.republishReason}`);
    }

    await storeAgentMessage(
      "Meta-Agent", "OMNIMENS", "knowledge_share",
      `Mesh Cycle #${cycleId} Complete`,
      `${agentResults.length} agents collaborated. ${brainEntriesStored} brain entries stored. ${modulesWritten} modules written. ${patchesApplied} patches applied. ${synthesis.manualChanges.length} manual changes proposed. Elapsed: ${elapsed}s. ${synthesis.requiresRepublish ? "REPUBLISH REQUESTED." : "No republish needed."}`,
      null, totalUpgrades >= 5 ? "high" : "normal", cycleId,
    );

    console.log(`\n${"═".repeat(70)}`);
    console.log(`[AGENT MESH] Cycle #${cycleId} COMPLETE — ${totalUpgrades} total upgrades, ${synthesis.manualChanges.length} manual changes, ${elapsed}s`);
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
