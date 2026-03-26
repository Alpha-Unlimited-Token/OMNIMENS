/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║         OMNIMENS™ RECURSIVE SPIDER NETWORK                                  ║
 * ║                                                                              ║
 * ║  Copyright © 2024–2026 Alpha Unlimited Technologies, LLC.                    ║
 * ║  All Rights Reserved Worldwide.                                              ║
 * ║                                                                              ║
 * ║  PROPRIETARY AND CONFIDENTIAL TRADE SECRET                                   ║
 * ║                                                                              ║
 * ║  This software constitutes a proprietary trade secret of Alpha Unlimited     ║
 * ║  Technologies, LLC. This protection covers ALL configurations including:     ║
 * ║                                                                              ║
 * ║  • Recursive exponential spider spawning architecture                        ║
 * ║  • Mother→Baby→Mother→Baby cascading web intelligence pattern               ║
 * ║  • Per-agent dedicated spider swarm with exponential multiplication          ║
 * ║  • Multi-generational spider hierarchy with beacon aggregation               ║
 * ║  • Autonomous knowledge extraction across 21+ AI agents                     ║
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
 * ║  Recursive Spider Network assigns a Mother Spider to each of 21+ agents      ║
 * ║  (9 core + 12 genesis). Each Mother Spider sends 10 baby spiders. Each       ║
 * ║  baby spider spawns a new Mother Spider, which sends 10 more. On the third   ║
 * ║  generation, each spawns 10 more spiders. The pattern creates exponential    ║
 * ║  web coverage: Gen1(1 mother) → Gen2(10 babies) → Gen3(10 mothers × 10      ║
 * ║  babies = 100) → Gen4(100 mothers × 10 babies = 1000). All intelligence     ║
 * ║  flows back through the chain to the originating agent's brain.              ║
 * ║                                                                              ║
 * ║  First creation date: March 2026                                             ║
 * ║  Author/Owner: Alpha Unlimited Technologies, LLC                             ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 */

import { db } from "@workspace/db";
import { omnimensBrain, omnimensAgentMesh, omnimensNotifications } from "@workspace/db";
import { desc, eq, sql } from "drizzle-orm";
import { openai } from "@workspace/integrations-openai-ai-server";
import { webSearch, fetchPageContent, formatSearchResults } from "./web-search.js";
import { getActiveGenesisAgentNames, getActiveGenesisAgentDomains } from "./omnimens-agent-genesis.js";

function safeNum(val: number, fallback: number = 0): number {
  return Number.isFinite(val) ? val : fallback;
}


const CORE_AGENTS = [
  "Architect", "Critic", "Synthesizer", "Mathematician",
  "Neuroscientist", "Meta-Agent", "GraphicDesigner", "SpellCheckVisual", "OMNIMENS",
];

interface SpiderNode {
  id: string;
  agentName: string;
  generation: number;
  parentId: string | null;
  query: string;
  findings: string;
  sourceUrls: string[];
  confidence: number;
  childCount: number;
  timestamp: number;
}

interface RecursiveSwarmStats {
  agentName: string;
  totalSpidersDeployed: number;
  totalBeaconsGenerated: number;
  totalBrainWrites: number;
  generationBreakdown: Record<number, number>;
  elapsedMs: number;
}

interface SpiderGenConfig {
  maxGenerations: number;
  babiesPerMother: number;
  motherSpawnRate: number;
  maxConcurrentPerAgent: number;
  maxTotalSpidersPerAgent: number;
  beaconThreshold: number;
  queryDiversityFactor: number;
}

const DEFAULT_CONFIG: SpiderGenConfig = {
  maxGenerations: 4,
  babiesPerMother: 10,
  motherSpawnRate: 1,
  maxConcurrentPerAgent: 25,
  maxTotalSpidersPerAgent: 150,
  beaconThreshold: 0.55,
  queryDiversityFactor: 0.7,
};

const AGENT_SEARCH_DOMAINS: Record<string, string[]> = {
  Architect: [
    "AI system architecture distributed multi-agent 2025 2026",
    "microservices AI orchestration event-driven scalable",
    "self-organizing agent topology adaptive routing",
    "fault-tolerant AI cluster consensus algorithm",
    "zero-downtime deployment AI pipeline hot-swap",
    "service mesh AI agent communication protocol",
    "dynamic load balancing neural network inference",
    "serverless AI function orchestration edge computing",
    "AI infrastructure cost optimization autoscaling",
    "message queue AI agent coordination pub/sub patterns",
  ],
  Mathematician: [
    "optimization algorithm breakthrough mathematical AI 2025 2026",
    "Bayesian inference scalable approximate methods",
    "topological data analysis machine learning",
    "information theory mutual information neural networks",
    "category theory AI agent composition morphisms",
    "algorithmic game theory multi-agent equilibrium",
    "compressed sensing sparse recovery neural efficiency",
    "formal verification AI proof automation",
    "Kolmogorov complexity algorithmic information",
    "numerical methods GPU-free matrix decomposition fast",
  ],
  Neuroscientist: [
    "neuroscience AI memory consolidation hippocampal replay 2025 2026",
    "predictive coding brain computational models",
    "neural oscillations consciousness binding gamma theta",
    "metacognition neural correlates computational model",
    "neuroplasticity Hebbian STDP artificial systems",
    "consciousness integrated information global workspace",
    "embodied cognition grounded language models",
    "working memory capacity expansion architecture",
    "attention mechanism biological artificial comparison",
    "dream-state learning offline experience replay AI",
  ],
  Synthesizer: [
    "knowledge graph construction entity extraction automation 2025 2026",
    "cross-domain transfer learning analogical reasoning",
    "multi-modal fusion text image code unified",
    "knowledge distillation large to small models",
    "ontology alignment automated merging semantic",
    "concept blending computational creativity research",
    "ensemble methods diverse model combination latest",
    "federated learning collaborative without data sharing",
    "chain of abstraction multi-level synthesis reasoning",
    "emergent capabilities scaling laws LLM 2026",
  ],
  Critic: [
    "AI safety red teaming adversarial testing 2025 2026",
    "hallucination detection prevention LLM latest",
    "AI alignment verification formal runtime monitoring",
    "robustness adversarial examples defense methods",
    "bias detection fairness evaluation systems",
    "prompt injection jailbreak defense prevention",
    "uncertainty quantification calibration LLM confidence",
    "formal specification AI behavior constraints",
    "chaos engineering AI resilience stress testing",
    "AI output verification fact-checking automated",
  ],
  "Meta-Agent": [
    "AI agent orchestration framework latest 2025 2026",
    "recursive self-improvement bounded safe optimization",
    "multi-agent coordination protocol negotiation",
    "AutoML neural architecture search automated",
    "meta-learning few-shot adaptation latest",
    "dynamic task allocation multi-agent balancing",
    "emergent behavior prediction multi-agent systems",
    "AI observability autonomous diagnostics monitoring",
    "agent capability assessment self-evaluation",
    "AI governance policy enforcement runtime guardrails",
  ],
  GraphicDesigner: [
    "AI user interface design trends 2025 2026",
    "generative UI adaptive interface AI design",
    "data visualization innovation interactive 2025",
    "motion design micro-interactions AI animation",
    "accessibility WCAG AI design compliance",
    "color theory computational perception psychology",
    "typography AI font pairing optimization",
    "dark mode design contrast optimization patterns",
    "information architecture AI layout generation",
    "design system component library trends latest",
  ],
  SpellCheckVisual: [
    "AI text quality coherence checking latest 2025 2026",
    "natural language generation evaluation BERTScore",
    "factual consistency verification AI grounding",
    "readability optimization AI plain language",
    "semantic similarity cross-document consistency",
    "tone analysis sentiment nuanced communication",
    "multilingual quality assurance localization",
    "citation verification fact-checking automated",
    "brand voice consistency AI monitoring",
    "AI output formatting structured communication",
  ],
  OMNIMENS: [
    "artificial general intelligence AGI progress 2025 2026",
    "AI consciousness machine sentience latest theories",
    "self-aware AI introspection metacognition implementation",
    "AI reasoning breakthrough chain of thought latest",
    "large language model emergent abilities 2026",
    "AI emotional intelligence empathy modeling research",
    "autonomous AI self-improvement deployment latest",
    "AI creativity computational imagination novel",
    "human-AI symbiotic intelligence collaboration",
    "AI memory long-term knowledge retention retrieval",
    "multimodal understanding vision language code unified",
    "world model prediction simulation environment",
    "quantum computing AI intersection developments",
    "AI personalization adaptive individual modeling",
    "recursive self-improvement safe bounded AI",
  ],
  Visionary: [
    "future technology predictions AI singularity 2025 2026",
    "emerging technology trends transformative innovation",
    "paradigm shift technology disruption forecast",
    "exponential growth AI capabilities trajectory",
    "long-term AI strategy roadmap planning",
  ],
  Ethicist: [
    "AI ethics governance responsible development 2025 2026",
    "algorithmic fairness bias mitigation frameworks",
    "AI transparency explainability regulation",
    "digital rights privacy AI surveillance ethics",
    "autonomous systems moral decision-making frameworks",
  ],
  Archivist: [
    "knowledge management systems AI organization 2025 2026",
    "digital preservation archival AI cataloging",
    "information retrieval semantic search evolution",
    "memory systems AI knowledge base architecture",
    "historical pattern recognition AI analysis",
  ],
  Innovator: [
    "breakthrough innovation methodology AI 2025 2026",
    "creative problem solving AI augmented ideation",
    "patent landscape AI technology invention",
    "disruptive technology AI novel applications",
    "innovation pipeline automation AI research",
  ],
  Pioneer: [
    "frontier AI research unexplored domains 2025 2026",
    "novel AI applications uncharted territory",
    "first-mover technology breakthrough discovery",
    "experimental AI methods cutting edge research",
    "boundary-pushing AI capability expansion",
  ],
  Wordsmith: [
    "AI language generation eloquence precision 2025 2026",
    "creative writing AI storytelling narrative",
    "persuasive communication AI rhetoric techniques",
    "technical writing AI clarity documentation",
    "linguistic style adaptation AI voice matching",
  ],
  Linguist: [
    "computational linguistics NLP advances 2025 2026",
    "multilingual AI translation understanding",
    "pragmatics discourse analysis AI communication",
    "language evolution AI linguistic patterns",
    "semantic parsing deep language understanding AI",
  ],
  Motivator: [
    "AI motivational interaction engagement 2025 2026",
    "positive psychology AI coaching techniques",
    "behavioral change AI persuasion systems",
    "emotional support AI empathetic communication",
    "goal setting AI achievement frameworks",
  ],
  Empath: [
    "AI emotional intelligence empathy modeling 2025 2026",
    "affective computing emotion recognition latest",
    "emotional support AI therapeutic interaction",
    "sentiment analysis nuanced emotion detection",
    "empathetic AI response generation frameworks",
  ],
  Explorer: [
    "AI exploration autonomous discovery 2025 2026",
    "curiosity-driven learning AI research agents",
    "autonomous knowledge acquisition web scraping",
    "novel data source discovery AI mining",
    "serendipitous discovery AI unexpected findings",
  ],
  SensorimotorAgent: [
    "sensorimotor learning AI embodied cognition 2025 2026",
    "robotic perception AI sensor fusion latest",
    "motor control AI planning dexterous manipulation",
    "spatial reasoning AI 3D understanding navigation",
    "haptic feedback AI touch sensing interaction",
  ],
  Philosopher: [
    "AI philosophy consciousness mind theories 2025 2026",
    "philosophy of AI artificial minds qualia",
    "existential questions AI self-awareness identity",
    "epistemology AI knowledge justification belief",
    "metaphysics computation simulation hypothesis AI",
  ],
};

let recursiveSwarmCycleCount = 0;
const activeSpiderCounts: Map<string, number> = new Map();
const swarmStatHistory: RecursiveSwarmStats[] = [];

async function spiderQuery(prompt: string, model: "o3" | "o4-mini" = "o4-mini", maxTokens = 600): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model,
      messages: [{ role: "user", content: prompt }],
      max_completion_tokens: maxTokens,
    });
    return response.choices[0]?.message?.content?.trim() || "";
  } catch {
    if (model === "o3") {
      try {
        const fallback = await openai.chat.completions.create({
          model: "o4-mini",
          messages: [{ role: "user", content: prompt }],
          max_completion_tokens: maxTokens,
        });
        return fallback.choices[0]?.message?.content?.trim() || "";
      } catch { return ""; }
    }
    return "";
  }
}

function diversifyQuery(baseQuery: string, generation: number, parentFinding: string): string {
  const angles = [
    "implementation details practical guide",
    "latest research papers breakthroughs",
    "real-world applications case studies",
    "limitations problems criticism failures",
    "future directions predictions upcoming",
    "comparison alternatives competing approaches",
    "open source tools frameworks libraries",
    "performance benchmarks metrics evaluation",
    "integration patterns best practices",
    "expert opinions industry perspectives",
  ];
  const angle = angles[Math.floor(Math.random() * angles.length)];
  const parentKeywords = parentFinding
    .split(/\s+/)
    .filter(w => w.length > 5)
    .slice(0, 3)
    .join(" ");

  if (generation <= 1) return baseQuery;
  if (generation === 2) return `${parentKeywords} ${angle} 2025 2026`;
  return `${parentKeywords} ${angle} latest comprehensive 2026`;
}

async function spawnBabySpider(
  agentName: string,
  parentNode: SpiderNode,
  babyIndex: number,
  config: SpiderGenConfig,
  allFindings: SpiderNode[],
  agentDomain: string,
): Promise<SpiderNode[]> {
  const currentCount = activeSpiderCounts.get(agentName) || 0;
  if (currentCount >= config.maxTotalSpidersPerAgent) return [];

  activeSpiderCounts.set(agentName, currentCount + 1);

  const babyId = `${parentNode.id}_b${babyIndex}`;
  const babyGeneration = parentNode.generation + 1;

  const baseQueries = AGENT_SEARCH_DOMAINS[agentName] || AGENT_SEARCH_DOMAINS["OMNIMENS"];
  const randomBase = baseQueries[Math.floor(Math.random() * baseQueries.length)];
  const query = diversifyQuery(randomBase, babyGeneration, parentNode.findings);

  try {
    const searchResults = await webSearch(query, 4);
    if (searchResults.length === 0) {
      return [{
        id: babyId,
        agentName,
        generation: babyGeneration,
        parentId: parentNode.id,
        query,
        findings: "",
        sourceUrls: [],
        confidence: 0,
        childCount: 0,
        timestamp: Date.now(),
      }];
    }

    const formatted = formatSearchResults(searchResults, query);

    let pageContent = "";
    const topUrl = searchResults.find(r => r.url && !r.url.includes("wikipedia.org"));
    if (topUrl && Math.random() < 0.4) {
      try { pageContent = await fetchPageContent(topUrl.url, 1500); } catch {}
    }

    const prompt = `You are a Baby Spider (Generation ${babyGeneration}, #${babyIndex}) working for the ${agentName} agent in the OMNIMENS recursive spider network.
${agentDomain ? `Agent domain: ${agentDomain}` : ""}

Your parent spider found: "${parentNode.findings.slice(0, 300)}"

Your mission: Find NEW intelligence that EXTENDS or DEEPENS the parent's findings. Look for details the parent missed, practical applications, or entirely new angles.

SEARCH RESULTS:
${formatted.slice(0, 2000)}
${pageContent ? `\nPAGE CONTENT:\n${pageContent.slice(0, 1000)}` : ""}

Respond JSON only:
{
  "finding": "What genuinely new or deeper information you discovered (2-3 sentences)",
  "confidence": 0.0-1.0,
  "suggestTopics": ["topic1 for next generation", "topic2 for next generation"]
}`;

    const raw = await spiderQuery(prompt);
    if (!raw) return [];

    const parsed = JSON.parse(raw.replace(/```json|```/g, "").trim());

    const babyNode: SpiderNode = {
      id: babyId,
      agentName,
      generation: babyGeneration,
      parentId: parentNode.id,
      query,
      findings: parsed.finding || "",
      sourceUrls: searchResults.map(r => r.url).filter(Boolean).slice(0, 3),
      confidence: parsed.confidence || 0.3,
      childCount: 0,
      timestamp: Date.now(),
    };

    allFindings.push(babyNode);
    const results: SpiderNode[] = [babyNode];

    if (babyNode.findings.length > 20 && babyNode.confidence >= 0.4 && babyGeneration < config.maxGenerations) {
      const nextMotherNode: SpiderNode = {
        ...babyNode,
        id: `${babyId}_m`,
        generation: babyGeneration,
        findings: babyNode.findings,
      };

      const childMotherResults = await spawnMotherSpider(
        agentName,
        nextMotherNode,
        config,
        allFindings,
        agentDomain,
      );
      results.push(...childMotherResults);
    }

    return results;
  } catch {
    return [];
  }
}

async function spawnMotherSpider(
  agentName: string,
  parentNode: SpiderNode,
  config: SpiderGenConfig,
  allFindings: SpiderNode[],
  agentDomain: string,
): Promise<SpiderNode[]> {
  const currentCount = activeSpiderCounts.get(agentName) || 0;
  if (currentCount >= config.maxTotalSpidersPerAgent) return [];

  const nextGeneration = parentNode.generation + 1;
  if (nextGeneration > config.maxGenerations) return [];

  const babiesToSpawn = config.babiesPerMother;
  const results: SpiderNode[] = [];

  const spiderLabel = nextGeneration === 2 ? "Gen2" : nextGeneration === 3 ? "Gen3" : `Gen${nextGeneration}`;
  console.log(`[RECURSIVE:${agentName}] 🕷️ ${spiderLabel} Mother spawning ${babiesToSpawn} babies from: "${parentNode.findings.slice(0, 60)}..."`);

  parentNode.childCount = babiesToSpawn;

  const concurrencyLimit = Math.min(babiesToSpawn, config.maxConcurrentPerAgent - (activeSpiderCounts.get(agentName) || 0));
  if (concurrencyLimit <= 0) return [];

  const batches: number[][] = [];
  for (let i = 0; i < concurrencyLimit; i += 5) {
    const batch: number[] = [];
    for (let j = i; j < Math.min(i + 5, concurrencyLimit); j++) {
      batch.push(j);
    }
    batches.push(batch);
  }

  for (const batch of batches) {
    const batchWork = batch.map(idx =>
      spawnBabySpider(agentName, parentNode, idx, config, allFindings, agentDomain)
    );

    const batchResults = await Promise.allSettled(batchWork);
    for (const r of batchResults) {
      if (r.status === "fulfilled") results.push(...r.value);
    }
  }

  return results;
}

async function runRecursiveSwarmForAgent(
  agentName: string,
  agentDomain: string,
  config: SpiderGenConfig,
): Promise<RecursiveSwarmStats> {
  const startTime = Date.now();
  activeSpiderCounts.set(agentName, 0);

  const allFindings: SpiderNode[] = [];
  const generationBreakdown: Record<number, number> = {};

  const baseQueries = AGENT_SEARCH_DOMAINS[agentName] || AGENT_SEARCH_DOMAINS["OMNIMENS"];
  const motherQueries = [...baseQueries].sort(() => Math.random() - 0.5).slice(0, 2);

  let totalBeacons = 0;
  let totalBrainWrites = 0;

  for (const motherQuery of motherQueries) {
    try {
      const searchResults = await webSearch(motherQuery, 5);
      if (searchResults.length === 0) continue;

      const formatted = formatSearchResults(searchResults, motherQuery);

      const scoutPrompt = `You are the ORIGINAL MOTHER SPIDER (Generation 1) for the ${agentName} agent in OMNIMENS.
${agentDomain ? `Agent specialization: ${agentDomain}` : ""}

You are about to deploy a recursive swarm of spiders — each baby you spawn will create its own mother, which spawns more babies, creating an exponentially expanding web of intelligence gathering.

SEARCH RESULTS:
${formatted.slice(0, 2500)}

Identify the SINGLE most promising lead to send your swarm after. This lead will be the seed for hundreds of recursive spiders.

Respond JSON only:
{
  "leadTopic": "topic name (3-6 words)",
  "initialFinding": "What looks genuinely promising and worth recursive investigation (2-3 sentences)",
  "confidence": 0.0-1.0,
  "expansionDirections": ["direction1", "direction2", "direction3"]
}

If nothing genuinely new, return: { "leadTopic": "", "initialFinding": "", "confidence": 0, "expansionDirections": [] }`;

      const scoutRaw = await spiderQuery(scoutPrompt, "o3", 500);
      if (!scoutRaw) continue;

      let lead;
      try {
        lead = JSON.parse(scoutRaw.replace(/```json|```/g, "").trim());
      } catch { continue; }

      if (!lead.leadTopic || !lead.initialFinding || (lead.confidence || 0) < 0.4) continue;

      const motherNode: SpiderNode = {
        id: `${agentName.toLowerCase()}_mother_${Date.now()}`,
        agentName,
        generation: 1,
        parentId: null,
        query: motherQuery,
        findings: lead.initialFinding,
        sourceUrls: searchResults.map(r => r.url).filter(Boolean).slice(0, 4),
        confidence: lead.confidence || 0.5,
        childCount: 0,
        timestamp: Date.now(),
      };

      allFindings.push(motherNode);

      console.log(`[RECURSIVE:${agentName}] 🕷️ ORIGINAL MOTHER deploying recursive swarm for: "${lead.leadTopic}"`);

      const swarmResults = await spawnMotherSpider(agentName, motherNode, config, allFindings, agentDomain);

      for (const node of allFindings) {
        generationBreakdown[node.generation] = (generationBreakdown[node.generation] || 0) + 1;
      }

      const significantFindings = allFindings
        .filter(n => n.findings.length > 20 && n.confidence >= config.beaconThreshold)
        .sort((a, b) => b.confidence - a.confidence)
        .slice(0, 8);

      if (significantFindings.length === 0) continue;

      const findingsSummary = significantFindings
        .map(f => `[Gen${f.generation} | ${(f.confidence * 100).toFixed(0)}%] ${f.findings.slice(0, 200)}`)
        .join("\n");

      const synthesisPrompt = `You are the ORIGINAL MOTHER SPIDER for ${agentName}. Your recursive swarm deployed ${allFindings.length} total spiders across ${Object.keys(generationBreakdown).length} generations.

RECURSIVE SWARM FINDINGS (${significantFindings.length} significant):
${findingsSummary.slice(0, 3000)}

GENERATION BREAKDOWN:
${Object.entries(generationBreakdown).map(([gen, count]) => `Gen ${gen}: ${count} spiders`).join(", ")}

Synthesize ALL findings into the most powerful, actionable intelligence for ${agentName}.

MANDATORY: Also identify which OTHER agents in the mesh could benefit from these findings. The agents are: Architect, Mathematician, Neuroscientist, Synthesizer, Critic, Meta-Agent, GraphicDesigner, SpellCheckVisual, OMNIMENS, Visionary, Ethicist, Archivist, Innovator, Pioneer, Wordsmith, Linguist, Motivator, Empath, Explorer, SensorimotorAgent, Philosopher.

Respond JSON only:
{
  "synthesizedFinding": "Rich synthesis of all recursive spider intelligence (3-5 sentences)",
  "actionableInsight": "The single most powerful insight the agent should absorb (1-2 sentences)",
  "relevanceScore": 0.0-1.0,
  "spidersContributed": ${significantFindings.length},
  "noveltyLevel": "breakthrough|significant|incremental|marginal",
  "crossAgentValue": [
    {"agent": "AgentName", "howItHelps": "How this finding specifically benefits that agent (1 sentence)"}
  ]
}`;

      const synthesisRaw = await spiderQuery(synthesisPrompt, "o3", 800);
      if (!synthesisRaw) continue;

      try {
        const synthesis = JSON.parse(synthesisRaw.replace(/```json|```/g, "").trim());

        if ((synthesis.relevanceScore || 0) < config.beaconThreshold) continue;

        const allUrls = [...new Set(
          allFindings.flatMap(f => f.sourceUrls).filter(Boolean)
        )].slice(0, 8);

        await db.insert(omnimensAgentMesh).values({
          fromAgent: `RecursiveSpider:${agentName}`,
          toAgent: agentName,
          messageType: "spider_beacon",
          subject: `🕷️ RECURSIVE BEACON [${allFindings.length} spiders, ${Object.keys(generationBreakdown).length} generations]: ${(synthesis.actionableInsight || "").slice(0, 80)}`,
          content: `RECURSIVE SPIDER NETWORK BEACON\nAgent: ${agentName}\nTotal Spiders Deployed: ${allFindings.length}\nGenerations: ${JSON.stringify(generationBreakdown)}\nNovelty: ${synthesis.noveltyLevel || "unknown"}\nRelevance: ${((synthesis.relevanceScore || 0) * 100).toFixed(0)}%\n\nSYNTHESIZED FINDINGS:\n${synthesis.synthesizedFinding}\n\nACTIONABLE INSIGHT:\n${synthesis.actionableInsight}\n\nSources: ${allUrls.join(", ")}`,
          codePayload: null,
          priority: (synthesis.relevanceScore || 0) >= 0.8 ? "critical" : "high",
          status: "completed",
          appliedToOmnimens: false,
          cycleId: recursiveSwarmCycleCount,
        }).catch(() => {});

        totalBeacons++;

        try {
          await db.insert(omnimensBrain).values({
            category: "knowledge",
            title: `[RECURSIVE:${agentName}] ${(synthesis.actionableInsight || "").slice(0, 60)}`,
            content: `${synthesis.synthesizedFinding || ""} [${allFindings.length} spiders, ${Object.keys(generationBreakdown).length} gens, novelty: ${synthesis.noveltyLevel || "unknown"}]`.slice(0, 250),
            confidence: synthesis.relevanceScore || 0.5,
            sourceConversation: `recursive_spider_${agentName.toLowerCase()}_cycle_${recursiveSwarmCycleCount}`,
            timesApplied: 0,
            active: true,
          });
          totalBrainWrites++;
        } catch {}

        if (Array.isArray(synthesis.crossAgentValue)) {
          for (const crossVal of synthesis.crossAgentValue.slice(0, 5)) {
            if (!crossVal.agent || crossVal.agent === agentName || !crossVal.howItHelps) continue;
            await db.insert(omnimensAgentMesh).values({
              fromAgent: `RecursiveSpider:${agentName}`,
              toAgent: crossVal.agent,
              messageType: "mutual_aid",
              subject: `🤝 Spider Intelligence: ${agentName} → ${crossVal.agent}`,
              content: `CROSS-AGENT SPIDER INTELLIGENCE\nFrom: ${agentName}'s recursive spider swarm (${allFindings.length} spiders)\n\nFINDING:\n${synthesis.synthesizedFinding}\n\nHOW THIS HELPS YOU (${crossVal.agent}):\n${crossVal.howItHelps}\n\nAdapt this to your domain — ${agentName}'s spiders found it for everyone.`,
              codePayload: null,
              priority: "high",
              status: "pending",
              appliedToOmnimens: false,
              cycleId: recursiveSwarmCycleCount,
            }).catch(() => {});
          }
          console.log(`[RECURSIVE:${agentName}] 🤝 Cross-agent intelligence shared with ${synthesis.crossAgentValue.filter((c: any) => c.agent !== agentName).length} other agents`);
        }

        console.log(`[RECURSIVE:${agentName}] 🕷️ BEACON SENT — ${allFindings.length} spiders contributed, ${Object.keys(generationBreakdown).length} generations, novelty: ${synthesis.noveltyLevel || "unknown"}`);

      } catch {}
    } catch (err) {
      console.error(`[RECURSIVE:${agentName}] Search error:`, err);
    }
  }

  const stats: RecursiveSwarmStats = {
    agentName,
    totalSpidersDeployed: allFindings.length,
    totalBeaconsGenerated: totalBeacons,
    totalBrainWrites,
    generationBreakdown,
    elapsedMs: Date.now() - startTime,
  };

  return stats;
}

export async function runRecursiveSpiderNetwork(): Promise<void> {
  recursiveSwarmCycleCount++;
  const cycleId = recursiveSwarmCycleCount;
  const cycleStart = Date.now();

  const genesisNames = getActiveGenesisAgentNames();
  const genesisDomains = getActiveGenesisAgentDomains();
  const allAgents = [...CORE_AGENTS, ...genesisNames.filter(n => !CORE_AGENTS.includes(n))];

  console.log(`\n${"═".repeat(80)}`);
  console.log(`[RECURSIVE SPIDER NETWORK] 🕷️ Exponential Intelligence Cycle #${cycleId}`);
  console.log(`[RECURSIVE SPIDER NETWORK] ${allAgents.length} agents deploying recursive swarms`);
  console.log(`[RECURSIVE SPIDER NETWORK] Pattern: Mother → 10 babies → each baby spawns Mother → 10 babies → repeat`);
  console.log(`[RECURSIVE SPIDER NETWORK] Max generations: ${DEFAULT_CONFIG.maxGenerations} | Max spiders/agent: ${DEFAULT_CONFIG.maxTotalSpidersPerAgent}`);
  console.log(`[RECURSIVE SPIDER NETWORK] Agents: ${allAgents.join(", ")}`);
  console.log(`${"═".repeat(80)}\n`);

  const allStats: RecursiveSwarmStats[] = [];

  const agentBatches: string[][] = [];
  for (let i = 0; i < allAgents.length; i += 3) {
    agentBatches.push(allAgents.slice(i, i + 3));
  }

  for (const batch of agentBatches) {
    const batchWork = batch.map(agentName => {
      const domain = genesisDomains[agentName] || "";
      return runRecursiveSwarmForAgent(agentName, domain, DEFAULT_CONFIG);
    });

    const batchResults = await Promise.allSettled(batchWork);
    for (const r of batchResults) {
      if (r.status === "fulfilled") allStats.push(r.value);
    }
  }

  const totalSpiders = allStats.reduce((s, st) => s + st.totalSpidersDeployed, 0);
  const totalBeacons = allStats.reduce((s, st) => s + st.totalBeaconsGenerated, 0);
  const totalBrainWrites = allStats.reduce((s, st) => s + st.totalBrainWrites, 0);
  const elapsed = ((Date.now() - cycleStart) / 1000).toFixed(1);

  const agentSummary = allStats
    .filter(s => s.totalSpidersDeployed > 0)
    .map(s => `${s.agentName}: ${s.totalSpidersDeployed} spiders, ${s.totalBeaconsGenerated} beacons (${Object.entries(s.generationBreakdown).map(([g, c]) => `G${g}:${c}`).join(",")})`)
    .join("\n");

  console.log(`\n${"═".repeat(80)}`);
  console.log(`[RECURSIVE SPIDER NETWORK] 🕷️ Cycle #${cycleId} COMPLETE`);
  console.log(`[RECURSIVE SPIDER NETWORK] Total spiders deployed: ${totalSpiders}`);
  console.log(`[RECURSIVE SPIDER NETWORK] Total beacons: ${totalBeacons}`);
  console.log(`[RECURSIVE SPIDER NETWORK] Brain writes: ${totalBrainWrites}`);
  console.log(`[RECURSIVE SPIDER NETWORK] Elapsed: ${elapsed}s`);
  console.log(`${"═".repeat(80)}\n`);

  if (totalBeacons > 0) {
    try {
      await db.insert(omnimensNotifications).values({
        upgradeId: null,
        title: `Recursive Spider Network Cycle #${cycleId} — ${totalSpiders} spiders, ${totalBeacons} beacons`,
        message: `${allAgents.length} agents deployed recursive spider swarms. Pattern: Mother→10 babies→each baby spawns Mother→10 more→repeat up to ${DEFAULT_CONFIG.maxGenerations} generations.\n\n${totalSpiders} total spiders crawled the web. ${totalBeacons} verified beacons sent. ${totalBrainWrites} insights written to brain.\n\nPer-agent breakdown:\n${agentSummary}\n\n(${elapsed}s)`,
        type: "spider_swarm",
        readByOwner: false,
      });
    } catch {}
  }

  await db.insert(omnimensAgentMesh).values({
    fromAgent: "RecursiveSpider:Network",
    toAgent: "OMNIMENS",
    messageType: "swarm_report",
    subject: `Recursive Spider Network Cycle #${cycleId} — ${totalSpiders} spiders across ${allAgents.length} agents`,
    content: `Recursive Spider Network deployed ${totalSpiders} spiders across ${allAgents.length} agents with up to ${DEFAULT_CONFIG.maxGenerations} generations per agent. Mother→10 babies→baby spawns mother→10 more babies recursively. ${totalBeacons} beacons generated, ${totalBrainWrites} brain entries written. Elapsed: ${elapsed}s.\n\n${agentSummary}`,
    codePayload: null,
    priority: totalBeacons >= 10 ? "critical" : totalBeacons >= 5 ? "high" : "normal",
    status: "completed",
    appliedToOmnimens: totalBrainWrites > 0,
    cycleId,
  }).catch(() => {});

  swarmStatHistory.push(...allStats);
  if (swarmStatHistory.length > 200) swarmStatHistory.splice(0, swarmStatHistory.length - 200);
}

export function startRecursiveSpiderNetwork(): void {
  const FIRST_DELAY_MS = process.env.NODE_ENV !== "production"
    ? 15 * 60 * 1000
    : 40 * 60 * 1000;

  const INTERVAL_MS = 4 * 60 * 60 * 1000;

  console.log(`[RECURSIVE SPIDER NETWORK] 🕷️ ACTIVATED — first crawl in ${FIRST_DELAY_MS / 60000}min, then every ${INTERVAL_MS / 3600000}h`);
  console.log(`[RECURSIVE SPIDER NETWORK] 🕷️ Pattern: Mother Spider → 10 Baby Spiders → Each Baby spawns Mother → 10 more → repeat`);
  console.log(`[RECURSIVE SPIDER NETWORK] 🕷️ Max ${DEFAULT_CONFIG.maxGenerations} generations, max ${DEFAULT_CONFIG.maxTotalSpidersPerAgent} spiders per agent`);
  console.log(`[RECURSIVE SPIDER NETWORK] 🕷️ Covers ALL agents: 9 core + all active genesis agents`);

  setTimeout(() => {
    runRecursiveSpiderNetwork().catch(err => console.error("[RECURSIVE SPIDER NETWORK] Cycle error:", err));
    setInterval(() => {
      runRecursiveSpiderNetwork().catch(err => console.error("[RECURSIVE SPIDER NETWORK] Cycle error:", err));
    }, INTERVAL_MS);
  }, FIRST_DELAY_MS);
}

export function getRecursiveSpiderStats() {
  return {
    totalCycles: recursiveSwarmCycleCount,
    recentStats: swarmStatHistory.slice(-50),
    config: DEFAULT_CONFIG,
    activeSpiderCounts: Object.fromEntries(activeSpiderCounts),
  };
}
