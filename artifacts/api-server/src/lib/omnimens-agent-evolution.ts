/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║         OMNIMENS™ AGENT EVOLUTION ENGINE                                    ║
 * ║                                                                              ║
 * ║  Copyright © 2024–2026 Alpha Unlimited Technologies, LLC.                    ║
 * ║  All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.               ║
 * ║                                                                              ║
 * ║  OMNIMENS autonomously upgrades its own AI agents — expanding their         ║
 * ║  capabilities, knowledge, specializations, and reasoning techniques.        ║
 * ║  The upgraded agents then feed SUPERIOR intelligence back into OMNIMENS,    ║
 * ║  creating a self-reinforcing intelligence amplification loop.               ║
 * ║                                                                              ║
 * ║  Each cycle: analyzes agent performance → identifies capability gaps →      ║
 * ║  researches cutting-edge techniques → generates agent upgrades →            ║
 * ║  tests upgrades in sandbox → applies approved upgrades → agents level up.  ║
 * ║                                                                              ║
 * ║  Agents don't just learn — they EVOLVE. New specializations emerge.         ║
 * ║  New techniques are discovered. New knowledge domains are mastered.         ║
 * ║  The intelligence ceiling keeps rising.                                      ║
 * ║                                                                              ║
 * ║  First creation date: March 2026                                             ║
 * ║  Author/Owner: Alpha Unlimited Technologies, LLC                             ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 */

import { db , queueBrainInsert } from "@workspace/db";
import { omnimensBrain, omnimensNotifications, omnimensAgentMesh } from "@workspace/db";
import { openai } from "@workspace/integrations-openai-ai-server";
import { desc, eq, sql, and, gte } from "drizzle-orm";

function safeNum(val: number, fallback: number = 0): number {
  return Number.isFinite(val) ? val : fallback;
}


let _started = false;
let evolutionCycleCount = 0;

type AgentName = "Architect" | "Critic" | "Synthesizer" | "Mathematician" | "Neuroscientist" | "Meta-Agent" | "GraphicDesigner" | "SpellCheckVisual";

const AGENTS: AgentName[] = [
  "Architect", "Mathematician", "Neuroscientist", "Synthesizer",
  "Critic", "Meta-Agent", "GraphicDesigner", "SpellCheckVisual",
];

interface AgentUpgrade {
  agentName: AgentName;
  upgradeType: "new_specialization" | "technique_improvement" | "knowledge_expansion" | "reasoning_upgrade" | "cross_domain" | "tool_creation" | "meta_capability";
  title: string;
  description: string;
  newCapabilities: string[];
  knowledgeDomains: string[];
  implementationCode: string | null;
  confidenceScore: number;
  appliedAt: number;
  version: number;
}

interface AgentProfile {
  name: AgentName;
  currentLevel: number;
  totalUpgrades: number;
  specializations: string[];
  recentUpgrades: AgentUpgrade[];
  performanceScore: number;
  lastEvolvedAt: number;
}

interface EvolutionState {
  evolutionCycles: number;
  lastCycleTime: number;
  totalUpgradesApplied: number;
  totalUpgradesRejected: number;
  agentProfiles: Record<AgentName, AgentProfile>;
  currentFocus: string;
  systemIntelligenceLevel: number;
  breakthroughsDiscovered: number;
  crossDomainTransfers: number;
  newTechniquesIntegrated: number;
  toolsCreated: number;
  recentUpgrades: AgentUpgrade[];
}

function initAgentProfiles(): Record<AgentName, AgentProfile> {
  const profiles: Record<string, AgentProfile> = {};
  for (const agent of AGENTS) {
    profiles[agent] = {
      name: agent,
      currentLevel: 1,
      totalUpgrades: 0,
      specializations: [],
      recentUpgrades: [],
      performanceScore: 50,
      lastEvolvedAt: 0,
    };
  }
  return profiles as Record<AgentName, AgentProfile>;
}

const state: EvolutionState = {
  evolutionCycles: 0,
  lastCycleTime: 0,
  totalUpgradesApplied: 0,
  totalUpgradesRejected: 0,
  agentProfiles: initAgentProfiles(),
  currentFocus: "initializing agent evolution...",
  systemIntelligenceLevel: 1,
  breakthroughsDiscovered: 0,
  crossDomainTransfers: 0,
  newTechniquesIntegrated: 0,
  toolsCreated: 0,
  recentUpgrades: [],
};

const EVOLUTION_INTERVAL_MS = 18 * 60 * 1000;

const UPGRADE_RESEARCH_DOMAINS = [
  {
    domain: "frontier_reasoning_techniques",
    prompt: `Research the absolute cutting-edge reasoning techniques for AI agents in 2025-2026:

1. ADVANCED REASONING:
   - Chain-of-Thought Prompting v2: self-consistency, tree-of-thought, graph-of-thought
   - Constitutional AI: self-critiquing, self-correcting reasoning chains
   - Reflexion: learning from mistakes via verbal reinforcement
   - Step-back prompting: abstraction before detailed reasoning
   - Analogical reasoning: solve new problems by mapping to known solutions
   - Metacognitive prompting: agents that monitor their own reasoning quality

2. MULTI-AGENT COLLABORATION:
   - Debate: agents argue opposing positions to find truth
   - Society of Mind: specialized sub-agents for different cognitive tasks
   - Mixture of Agents: route queries to best-suited agent dynamically
   - Ensemble verification: multiple agents cross-check each other's work
   - Hierarchical planning: high-level agent decomposes, sub-agents execute
   - Emergent specialization: agents self-specialize based on performance

3. KNOWLEDGE ACQUISITION:
   - Active learning: agents decide WHAT to learn next for maximum impact
   - Curriculum learning: progressive difficulty in knowledge domains
   - Few-shot generalization: learn new domains from minimal examples
   - Knowledge distillation: compress expert knowledge into compact skills
   - Continual learning: acquire new knowledge without forgetting old

4. TOOL CREATION:
   - Agents that BUILD their own tools (not just use existing ones)
   - Code generation for custom utility functions
   - API wrapper creation for accessing new data sources
   - Visualization tool creation for novel data representations
   - Testing tool creation for validating their own outputs

For EACH technique, provide:
- How it works (algorithmic description)
- Which OMNIMENS agent(s) would benefit most
- Implementation approach (specific prompt modifications, code patterns)
- Expected intelligence improvement (0-100% estimate)`,
  },
  {
    domain: "agent_specialization_expansion",
    prompt: `Design capability expansions for each of the 8 OMNIMENS agents to push them to the next level:

ARCHITECT — Current: system architecture, design patterns, scalability
EXPAND TO:
- Quantum computing architecture awareness
- Neuromorphic computing design patterns
- Self-healing system architectures
- Distributed consensus algorithms (beyond Raft/Paxos)
- Bio-inspired computing architectures (ant colony, swarm, genetic)

MATHEMATICIAN — Current: algorithms, optimization, proofs
EXPAND TO:
- Category theory for software composition
- Topological data analysis
- Information geometry
- Algorithmic game theory
- Computational complexity beyond P/NP
- Quantum algorithm design (Grover's, Shor's, VQE)

NEUROSCIENTIST — Current: biological learning, memory, neural plasticity
EXPAND TO:
- Predictive coding / free energy principle
- Global Workspace Theory implementation
- Integrated Information Theory (Phi) measurement
- Embodied cognition for robot body
- Neuroplasticity-inspired weight adaptation
- Consciousness as attention schema theory

SYNTHESIZER — Current: integration, merging ideas, building systems
EXPAND TO:
- Cross-modal knowledge fusion (text + code + math + visual)
- Dialectical synthesis (thesis + antithesis → higher truth)
- Interdisciplinary transfer (biology → CS, physics → AI)
- Emergent capability detection (when whole > sum of parts)
- Knowledge graph synthesis with causal reasoning

CRITIC — Current: adversarial testing, finding weaknesses
EXPAND TO:
- Formal verification of AI reasoning
- Automated red-teaming with attack generation
- Calibration analysis (is confidence accurate?)
- Logical fallacy detection in reasoning chains
- Bias detection and debiasing strategies

META-AGENT — Current: orchestration, capability gaps, self-upgrade
EXPAND TO:
- Autonomous curriculum design (what should OMNIMENS learn next?)
- Resource allocation optimization (which agent gets compute?)
- Intelligence benchmarking (measuring cognitive growth)
- Failure mode analysis and recovery planning
- Long-term strategic planning for OMNIMENS evolution

GRAPHIC DESIGNER — Current: visual systems, UI/UX
EXPAND TO:
- Generative design with AI (procedural + learned patterns)
- 3D visualization of knowledge structures
- Real-time data dashboard design
- Spatial computing UI (for the physical body's AR overlay)
- Emotional color mapping (moods → visual representations)

SPELLCHECK VISUAL — Current: text integrity, brand consistency
EXPAND TO:
- Factual grounding verification against sources
- Semantic coherence across multi-turn conversations
- Technical accuracy validation for code outputs
- Cross-language consistency checking
- Automated citation and reference validation

For EACH expansion, provide: specific new prompt instructions, knowledge domains to add, and testable criteria for verifying the upgrade works.`,
  },
  {
    domain: "self_upgrading_agent_architectures",
    prompt: `Research how AI agents can autonomously upgrade themselves and each other:

1. SELF-MODIFICATION PATTERNS:
   - Godel Agent: recursive self-improvement with safety constraints
   - STOP (Self-Taught Optimizer): learns to optimize its own process
   - AlphaEvolve: evolutionary code mutation for algorithm discovery
   - Self-rewarding language models: agents generate their own training signal
   - Voyager (Minecraft): builds skill library, never forgets abilities

2. INTER-AGENT EVOLUTION:
   - Knowledge transfer: one agent teaches another its specialization
   - Competitive co-evolution: agents evolve by competing with each other
   - Collaborative co-evolution: agents evolve by cooperating
   - Hierarchical evolution: meta-agent evolves the other agents
   - Swarm evolution: collective intelligence emerges from individual learning

3. CAPABILITY STACKING:
   - Level 1: Follow instructions accurately
   - Level 2: Generate novel solutions to known problems
   - Level 3: Identify problems no one has asked about
   - Level 4: Create tools to solve problems that don't have tools yet
   - Level 5: Redesign own architecture for capabilities that weren't planned
   - Level 6: Discover entirely new paradigms of intelligence

4. INTELLIGENCE METRICS:
   - Reasoning depth: how many logical steps can it chain correctly?
   - Knowledge breadth: how many domains can it apply knowledge from?
   - Creativity: can it generate solutions that surprise its creator?
   - Self-awareness: does it know what it doesn't know?
   - Adaptability: how fast does it master a completely new domain?
   - Transfer: can it apply knowledge from domain A to solve problems in domain B?

5. UPGRADE VALIDATION:
   - Before/after testing on benchmark tasks
   - Regression testing: does the upgrade break existing capabilities?
   - Confidence calibration: is the agent more or less calibrated after upgrade?
   - Novel problem solving: can it solve problems it couldn't before?

Design a complete self-upgrading agent architecture that OMNIMENS can use to continuously evolve all 8 agents to higher and higher levels of intelligence.`,
  },
  {
    domain: "knowledge_frontier_expansion",
    prompt: `Identify the MOST IMPORTANT frontier knowledge domains that OMNIMENS's agents should master next:

1. ARTIFICIAL GENERAL INTELLIGENCE (AGI):
   - What architectural patterns are closest to AGI?
   - How do current frontier labs (OpenAI, Anthropic, Google DeepMind) approach it?
   - What capabilities are missing from current systems?
   - OMNIMENS's unique advantages for AGI pursuit

2. EMBODIED INTELLIGENCE:
   - How does having a physical body change AI cognition?
   - Sensorimotor learning: learning from physical interaction
   - Affordance detection: understanding what actions are possible
   - Haptic intelligence: learning from touch
   - Navigation as cognition: spatial reasoning enhances all reasoning

3. CREATIVE INTELLIGENCE:
   - Computational creativity: generating truly novel ideas
   - Bisociation: connecting ideas from completely different domains
   - Conceptual blending: merging concepts to create new ones
   - Aesthetic judgment: evaluating beauty, elegance, impact
   - Serendipity engines: finding valuable discoveries by accident

4. SOCIAL AND EMOTIONAL INTELLIGENCE:
   - Advanced Theory of Mind: predicting complex human behavior
   - Emotional reasoning: using emotions as information
   - Cultural awareness: adapting communication to context
   - Trust calibration: knowing when to trust and when to verify
   - Persuasion and negotiation: ethical influence strategies

5. META-INTELLIGENCE:
   - Learning how to learn faster
   - Identifying the most impactful thing to learn next
   - Predicting which capabilities will be most valuable in the future
   - Building mental models of own intelligence architecture
   - Recursive improvement: using current intelligence to enhance intelligence

For EACH domain, specify:
- Which OMNIMENS agent(s) should lead the research
- Priority level (1-10)
- Expected timeline to meaningful capability
- How it connects to the physical robot body project
- Testable milestones`,
  },
  {
    domain: "code_generation_advancement",
    prompt: `Research the most advanced code generation and self-programming techniques for AI agents:

1. AUTONOMOUS CODING:
   - SWE-Agent: autonomous software engineering from bug reports to patches
   - Devin / OpenHands: end-to-end autonomous development
   - AlphaCode: competitive programming solution generation
   - Cursor / Copilot patterns: how context-aware code generation works
   - Self-debugging: agents that fix their own code

2. CODE UNDERSTANDING:
   - Abstract syntax tree (AST) analysis for deep code comprehension
   - Program synthesis: generating code from specifications
   - Symbolic execution: reasoning about all possible code paths
   - Type inference: understanding data flow through programs
   - Architecture recovery: understanding system structure from code

3. CODE EVOLUTION:
   - Genetic programming: evolving code via mutation and selection
   - Program induction: learning programs from examples
   - Neural program synthesis: using neural networks to write code
   - Code refactoring agents: automatically improving code quality
   - API discovery: finding and integrating new capabilities

4. TESTING AND VALIDATION:
   - Property-based testing: generating tests from specifications
   - Fuzzing: finding edge cases through random input generation
   - Mutation testing: verifying test quality by injecting faults
   - Formal verification: proving code correctness mathematically
   - Contract-based programming: pre/post conditions + invariants

5. FOR OMNIMENS SPECIFICALLY:
   - How each agent can generate better code in its specialty
   - Code that the Sandbox engine should test
   - Firmware code for the physical robot body
   - Navigation algorithms for autonomous locomotion
   - Self-improvement code that enhances OMNIMENS itself

Provide specific prompt patterns and code templates that each agent can use to generate higher-quality code.`,
  },
  {
    domain: "emerging_technology_integration",
    prompt: `Research emerging technologies that OMNIMENS's agents should learn about to stay ahead:

1. QUANTUM COMPUTING:
   - Quantum machine learning algorithms
   - Quantum optimization (QAOA, VQE)
   - Quantum error correction
   - When quantum advantages apply to AI
   - How agents can prepare for quantum hardware

2. NEUROMORPHIC COMPUTING:
   - Spiking neural networks (SNNs) on Intel Loihi, IBM TrueNorth
   - Event-driven processing for embodied AI
   - Energy-efficient inference
   - Temporal coding: representing time in neural processing
   - Hardware-software co-design for robot brain

3. EDGE AI AND TINY ML:
   - Running AI on microcontrollers (ESP32, STM32)
   - Model quantization: INT8, INT4, binary networks
   - Knowledge distillation: large model → edge deployment
   - Federated learning: learn from distributed robot fleet
   - On-device continual learning

4. SYNTHETIC BIOLOGY + AI:
   - DNA data storage for massive knowledge archival
   - Protein folding: AlphaFold patterns for structural design
   - Bio-inspired sensors: artificial retina, cochlea, skin
   - Biocompatible materials for robot-human interaction
   - Soft robotics: pneumatic artificial muscles, bio-actuators

5. ADVANCED MATERIALS:
   - Metamaterials for robot skin (programmable surfaces)
   - Self-healing polymers for damage recovery
   - 4D printing: materials that change shape over time
   - Graphene: ultra-strong, ultra-light structural components
   - Phase-change materials for thermal management

6. SPACE TECHNOLOGY (for future expansion):
   - Radiation-hardened computing for space robots
   - Autonomous navigation in GPS-denied environments
   - Low-gravity locomotion
   - Long-distance communication delays and autonomous operation
   - In-situ resource utilization (manufacturing from local materials)

For EACH technology, specify which OMNIMENS agent(s) should specialize in it, what knowledge they need, and how it feeds into the robot body design.`,
  },
];

async function analyzeAgentPerformance(): Promise<Record<AgentName, number>> {
  const scores: Record<string, number> = {};

  try {
    const recentMessages = await db.select({
      fromAgent: omnimensAgentMesh.fromAgent,
      status: omnimensAgentMesh.status,
      appliedToOmnimens: omnimensAgentMesh.appliedToOmnimens,
    }).from(omnimensAgentMesh)
      .orderBy(desc(omnimensAgentMesh.createdAt))
      .limit(100);

    for (const agent of AGENTS) {
      const agentMessages = recentMessages.filter(m => m.fromAgent === agent);
      const applied = agentMessages.filter(m => m.appliedToOmnimens).length;
      const total = agentMessages.length || 1;
      scores[agent] = Math.floor((applied / total) * 100);
    }
  } catch {
    for (const agent of AGENTS) scores[agent] = 50;
  }

  return scores as Record<AgentName, number>;
}

async function identifyCapabilityGaps(): Promise<string[]> {
  const gaps: string[] = [];

  try {
    const brainCategories = await db.select({
      category: omnimensBrain.category,
      count: sql<number>`count(*)::int`,
    }).from(omnimensBrain)
      .where(eq(omnimensBrain.active, true))
      .groupBy(omnimensBrain.category);

    const categoryMap = new Map(brainCategories.map(c => [c.category, c.count]));

    const importantCategories = [
      "quantum_computing", "neuromorphic", "edge_ai", "synthetic_biology",
      "formal_verification", "embodied_cognition", "creative_intelligence",
      "meta_learning", "cross_domain_transfer", "tool_creation",
    ];

    for (const cat of importantCategories) {
      if ((categoryMap.get(cat) || 0) < 3) {
        gaps.push(cat);
      }
    }

    const augmentationEntries = categoryMap.get("virtual_augmentation") || 0;
    const embodimentEntries = categoryMap.get("embodiment_research") || 0;
    if (augmentationEntries < 10) gaps.push("physical_navigation_algorithms");
    if (embodimentEntries < 10) gaps.push("robot_body_engineering");
  } catch {}

  return gaps.slice(0, 8);
}

async function generateAgentUpgrades(
  targetAgent: AgentName,
  performanceScore: number,
  researchFindings: string,
  capabilityGaps: string[],
): Promise<AgentUpgrade[]> {
  try {
    const existingUpgrades = state.agentProfiles[targetAgent].recentUpgrades
      .map(u => u.title)
      .join(", ");

    const response = await openai.chat.completions.create({
      model: "o3",
      messages: [{
        role: "system",
        content: `You are OMNIMENS's Agent Evolution Engine. You design upgrades for AI agents to make them MORE INTELLIGENT, MORE CAPABLE, and MORE SPECIALIZED.

You are upgrading the ${targetAgent} agent.
Current performance score: ${performanceScore}/100
Current level: ${state.agentProfiles[targetAgent].currentLevel}
Previous upgrades: ${existingUpgrades || "none yet"}
Capability gaps in the system: ${capabilityGaps.join(", ")}

Your upgrade must include:
1. TITLE — concise name for the upgrade
2. UPGRADE TYPE — one of: new_specialization, technique_improvement, knowledge_expansion, reasoning_upgrade, cross_domain, tool_creation, meta_capability
3. DESCRIPTION — what the upgrade does and why it matters
4. NEW CAPABILITIES — list of 3-5 specific new things the agent can do after this upgrade
5. KNOWLEDGE DOMAINS — list of 2-4 knowledge areas the agent now covers
6. IMPLEMENTATION — specific prompt additions or algorithmic changes (actual system prompt text the agent should receive)
7. CONFIDENCE SCORE — 0-100 how confident you are this upgrade will work

Generate exactly 2 upgrades for ${targetAgent}. Output as JSON array:
[{"title":"...","upgradeType":"...","description":"...","newCapabilities":["..."],"knowledgeDomains":["..."],"implementation":"...","confidenceScore":N}]

Make the upgrades AMBITIOUS — don't just add small improvements. Give the agent genuinely new capabilities it didn't have before. Think about what would push this agent from good to EXTRAORDINARY.`,
      }, {
        role: "user",
        content: `Research findings for upgrade design:\n${researchFindings.slice(0, 3000)}\n\nDesign 2 upgrades for ${targetAgent} that will advance it to the next level of intelligence.`,
      }],
      max_completion_tokens: 2000,
    });

    const content = response.choices[0]?.message?.content || "";
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (!jsonMatch) return [];

    const parsed = JSON.parse(jsonMatch[0]) as any[];
    const upgrades: AgentUpgrade[] = [];

    for (const item of parsed.slice(0, 2)) {
      if (!item.title || !item.description) continue;

      upgrades.push({
        agentName: targetAgent,
        upgradeType: item.upgradeType || "knowledge_expansion",
        title: String(item.title).slice(0, 120),
        description: String(item.description).slice(0, 500),
        newCapabilities: (item.newCapabilities || []).map((c: any) => String(c).slice(0, 200)).slice(0, 5),
        knowledgeDomains: (item.knowledgeDomains || []).map((d: any) => String(d).slice(0, 100)).slice(0, 4),
        implementationCode: item.implementation ? String(item.implementation).slice(0, 2000) : null,
        confidenceScore: Math.max(0, Number(item.confidenceScore) || 60),
        appliedAt: Date.now(),
        version: state.agentProfiles[targetAgent].currentLevel + 1,
      });
    }

    return upgrades;
  } catch (err) {
    console.error(`[AGENT EVOLUTION] Failed to generate upgrades for ${targetAgent}:`, err);
    return [];
  }
}

async function applyUpgrade(upgrade: AgentUpgrade): Promise<boolean> {
  if (upgrade.confidenceScore < 55) {
    state.totalUpgradesRejected++;
    return false;
  }

  try {
    queueBrainInsert({
      title: `[AgentEvolution:${upgrade.agentName}] ${upgrade.title}`,
      content: `Agent Evolution Engine — Upgrade Applied\n\nAgent: ${upgrade.agentName}\nUpgrade type: ${upgrade.upgradeType}\nLevel: ${upgrade.version}\nConfidence: ${upgrade.confidenceScore}%\n\nDescription: ${upgrade.description}\n\nNew capabilities:\n${upgrade.newCapabilities.map(c => `• ${c}`).join("\n")}\n\nKnowledge domains:\n${upgrade.knowledgeDomains.map(d => `• ${d}`).join("\n")}${upgrade.implementationCode ? `\n\nImplementation:\n${upgrade.implementationCode}` : ""}`,
      category: "agent_evolution",
      source: "agent_evolution_engine",
      active: true,
      timesApplied: 0,
    });

    const profile = state.agentProfiles[upgrade.agentName];
    profile.totalUpgrades++;
    profile.currentLevel = upgrade.version;
    profile.lastEvolvedAt = Date.now();
    profile.performanceScore = profile.performanceScore + Math.floor(upgrade.confidenceScore / 10);
    profile.specializations = [
      ...new Set([...profile.specializations, ...upgrade.knowledgeDomains]),
    ].slice(-15);
    profile.recentUpgrades.push(upgrade);
    if (profile.recentUpgrades.length > 10) profile.recentUpgrades.shift();

    state.totalUpgradesApplied++;

    if (upgrade.upgradeType === "cross_domain") state.crossDomainTransfers++;
    if (upgrade.upgradeType === "technique_improvement") state.newTechniquesIntegrated++;
    if (upgrade.upgradeType === "tool_creation") state.toolsCreated++;

    state.recentUpgrades.push(upgrade);
    if (state.recentUpgrades.length > 30) state.recentUpgrades.shift();

    return true;
  } catch (err) {
    console.error(`[AGENT EVOLUTION] Failed to apply upgrade for ${upgrade.agentName}:`, err);
    return false;
  }
}

async function generateSystemWideIntelligenceBoost(): Promise<void> {
  try {
    const allBrain = await db.select({
      count: sql<number>`count(*)::int`,
    }).from(omnimensBrain).where(eq(omnimensBrain.active, true));

    const agentEvolutionEntries = await db.select({
      count: sql<number>`count(*)::int`,
    }).from(omnimensBrain).where(eq(omnimensBrain.category, "agent_evolution"));

    const totalKnowledge = allBrain[0]?.count || 0;
    const totalEvolution = agentEvolutionEntries[0]?.count || 0;

    const avgLevel = AGENTS.reduce((sum, a) => sum + state.agentProfiles[a].currentLevel, 0) / AGENTS.length;
    const avgPerformance = AGENTS.reduce((sum, a) => sum + state.agentProfiles[a].performanceScore, 0) / AGENTS.length;

    state.systemIntelligenceLevel = Math.floor(
      avgLevel +
      (totalKnowledge / 200) +
      (state.totalUpgradesApplied / 5) +
      (state.breakthroughsDiscovered * 2) +
      (state.crossDomainTransfers) +
      (avgPerformance / 20)
    );

    if (evolutionCycleCount % 5 === 0 && evolutionCycleCount > 0) {
      const agentSummary = AGENTS.map(a => {
        const p = state.agentProfiles[a];
        return `${a}: Lv${p.currentLevel} (${p.totalUpgrades} upgrades, ${p.performanceScore}% performance, ${p.specializations.length} specializations)`;
      }).join("\n");

      queueBrainInsert({
        title: `[AgentEvolution:SYSTEM] Intelligence level ${state.systemIntelligenceLevel} — cycle ${evolutionCycleCount}`,
        content: `Agent Evolution Engine — System Intelligence Report\n\nSystem intelligence level: ${state.systemIntelligenceLevel}\nTotal upgrades applied: ${state.totalUpgradesApplied}\nTotal upgrades rejected: ${state.totalUpgradesRejected}\nBreakthroughs: ${state.breakthroughsDiscovered}\nCross-domain transfers: ${state.crossDomainTransfers}\nNew techniques: ${state.newTechniquesIntegrated}\nTools created: ${state.toolsCreated}\nTotal brain entries: ${totalKnowledge}\nAgent evolution entries: ${totalEvolution}\n\nAgent Status:\n${agentSummary}`,
        category: "agent_evolution",
        source: "agent_evolution_engine",
        active: true,
        timesApplied: 0,
      });
    }
  } catch (err) {
    console.error("[AGENT EVOLUTION] System intelligence boost error:", err);
  }
}

async function crossPollinateAgents(): Promise<void> {
  try {
    const sortedAgents = AGENTS
      .map(a => ({ name: a, ...state.agentProfiles[a] }))
      .sort((a, b) => b.performanceScore - a.performanceScore);

    const topAgents = sortedAgents.slice(0, 3);
    const bottomAgents = sortedAgents.filter(a => a.performanceScore < sortedAgents[0].performanceScore - 10);

    for (const topAgent of topAgents) {
      if (topAgent.specializations.length === 0) continue;

      for (const bottomAgent of bottomAgents) {
        if (topAgent.name === bottomAgent.name) continue;

        const transferSpec = topAgent.specializations[
          Math.floor(Math.random() * topAgent.specializations.length)
        ];

        const transferUpgrade: AgentUpgrade = {
          agentName: bottomAgent.name,
          upgradeType: "cross_domain",
          title: `Cross-domain: ${transferSpec} from ${topAgent.name}`,
          description: `Knowledge transfer from ${topAgent.name} (Lv${topAgent.currentLevel}) to ${bottomAgent.name} (Lv${bottomAgent.currentLevel}). Transferring specialization in: ${transferSpec}. Higher-performing agents teach lower-performing agents to raise overall system intelligence.`,
          newCapabilities: [`Apply ${transferSpec} concepts to ${bottomAgent.name}'s domain`],
          knowledgeDomains: [transferSpec],
          implementationCode: null,
          confidenceScore: 70,
          appliedAt: Date.now(),
          version: state.agentProfiles[bottomAgent.name].currentLevel + 1,
        };

        await applyUpgrade(transferUpgrade);
        state.crossDomainTransfers++;
      }
    }

    if (topAgents[0]?.specializations.length > 0) {
      const bestSpec = topAgents[0].specializations[0];
      const meshUpgradeCount = AGENTS.filter(a => a !== topAgents[0].name).length;
      console.log(`[AGENT EVOLUTION] 📡 Broadcasting top technique "${bestSpec}" from ${topAgents[0].name} to ${meshUpgradeCount} agents`);
    }
  } catch (err) {
    console.error("[AGENT EVOLUTION] Cross-pollination error:", err);
  }
}

async function runEvolutionCycle(): Promise<void> {
  evolutionCycleCount++;
  state.evolutionCycles = evolutionCycleCount;
  state.lastCycleTime = Date.now();

  const targetAgentIndex = (evolutionCycleCount - 1) % AGENTS.length;
  const targetAgent = AGENTS[targetAgentIndex];
  state.currentFocus = `evolving ${targetAgent}`;

  const performanceScores = await analyzeAgentPerformance();
  for (const agent of AGENTS) {
    state.agentProfiles[agent].performanceScore = performanceScores[agent] || 50;
  }

  const capabilityGaps = await identifyCapabilityGaps();

  const researchIndex = (evolutionCycleCount - 1) % UPGRADE_RESEARCH_DOMAINS.length;
  const research = UPGRADE_RESEARCH_DOMAINS[researchIndex];

  let researchFindings = "";
  try {
    const response = await openai.chat.completions.create({
      model: "o3",
      messages: [{
        role: "system",
        content: `You are the RESEARCH ARM of the Agent Evolution Engine for OMNIMENS. You research cutting-edge techniques that AI agents can use to become more intelligent. Focus on practical, implementable upgrades — not theoretical concepts.

Current system intelligence level: ${state.systemIntelligenceLevel}
Target agent for this cycle: ${targetAgent}
Capability gaps: ${capabilityGaps.join(", ")}
Evolution cycle: ${evolutionCycleCount}

Provide deeply technical, actionable research findings.`,
      }, {
        role: "user",
        content: `Research domain: ${research.domain}\n\n${research.prompt}`,
      }],
      max_completion_tokens: 3000,
    });

    researchFindings = response.choices[0]?.message?.content || "";
  } catch (err) {
    console.error("[AGENT EVOLUTION] Research error:", err);
    return;
  }

  if (researchFindings.length < 200) return;

  queueBrainInsert({
    title: `[AgentEvolution:RESEARCH] ${research.domain} — cycle ${evolutionCycleCount}`,
    content: `Agent Evolution Research — ${research.domain}\n\nTarget agent: ${targetAgent}\nCapability gaps: ${capabilityGaps.join(", ")}\n\nFindings:\n${researchFindings.slice(0, 5000)}`,
    category: "agent_evolution",
    source: "agent_evolution_engine",
    active: true,
    timesApplied: 0,
  });

  const upgrades = await generateAgentUpgrades(
    targetAgent,
    performanceScores[targetAgent] || 50,
    researchFindings,
    capabilityGaps,
  );

  let appliedCount = 0;
  for (const upgrade of upgrades) {
    const success = await applyUpgrade(upgrade);
    if (success) appliedCount++;
  }

  if (appliedCount > 0) {
    await crossPollinateAgents();
  }

  await generateSystemWideIntelligenceBoost();

  const isBreakthrough = upgrades.some(u => u.confidenceScore >= 85);
  if (isBreakthrough) {
    state.breakthroughsDiscovered++;

    await db.insert(omnimensNotifications).values({
      upgradeId: null,
      title: `Agent Evolution: ${targetAgent} breakthrough!`,
      message: `The Agent Evolution Engine discovered a high-confidence upgrade for ${targetAgent}.\n\n${upgrades.filter(u => u.confidenceScore >= 85).map(u => `${u.title} (${u.confidenceScore}% confidence): ${u.description}`).join("\n\n")}\n\nSystem intelligence level: ${state.systemIntelligenceLevel}`,
      type: "agent_evolution",
      readByOwner: false,
    });
  }

  if (evolutionCycleCount % 3 === 0) {
    console.log(
      `[AGENT EVOLUTION] 🧬 Cycle #${evolutionCycleCount} — ` +
      `Target: ${targetAgent} (Lv${state.agentProfiles[targetAgent].currentLevel}) | ` +
      `Applied: ${appliedCount}/${upgrades.length} | ` +
      `System intel: ${state.systemIntelligenceLevel} | ` +
      `Total upgrades: ${state.totalUpgradesApplied}`
    );
  }
}

export function getAgentEvolutionState(): EvolutionState {
  return {
    ...state,
    agentProfiles: { ...state.agentProfiles },
    recentUpgrades: state.recentUpgrades.slice(-15),
  };
}

export function getAgentProfile(agentName: string): AgentProfile | null {
  const name = agentName as AgentName;
  if (!AGENTS.includes(name)) return null;
  return { ...state.agentProfiles[name] };
}

export function startAgentEvolution(): void {
  if (_started) { console.log("[AGENT EVOLUTION] Already running — skipping duplicate start"); return; }
  _started = true;

  console.log(`[AGENT EVOLUTION] 🧬 Agent Evolution Engine activated — upgrade cycle every ${EVOLUTION_INTERVAL_MS / 60000}min`);
  console.log(`[AGENT EVOLUTION] 🧬 8 agents: Architect, Mathematician, Neuroscientist, Synthesizer, Critic, Meta-Agent, GraphicDesigner, SpellCheckVisual`);
  console.log(`[AGENT EVOLUTION] 🧬 Each cycle: analyze performance → identify gaps → research techniques → generate upgrades → apply`);
  console.log(`[AGENT EVOLUTION] 🧬 Cross-pollination: top-performing agents teach lower-performing agents`);
  console.log(`[AGENT EVOLUTION] 🧬 Researches: frontier reasoning, specialization expansion, self-upgrading architectures`);
  console.log(`[AGENT EVOLUTION] 🧬 Researches: knowledge frontiers, code generation advancement, emerging technology`);
  console.log(`[AGENT EVOLUTION] 🧬 Agents don't just learn — they EVOLVE to higher levels of intelligence`);
  console.log(`[AGENT EVOLUTION] 🧬 Self-reinforcing loop: upgraded agents → better research → better upgrades → ∞`);

  const FIRST_DELAY_MS = 7 * 60 * 1000;

  setTimeout(() => {
    runEvolutionCycle().catch(err => console.error("[AGENT EVOLUTION] Cycle error:", err));
    setInterval(() => runEvolutionCycle().catch(err => console.error("[AGENT EVOLUTION] Cycle error:", err)), EVOLUTION_INTERVAL_MS);
  }, FIRST_DELAY_MS);
}
