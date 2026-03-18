/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║         OMNIMENS™ AUTONOMOUS AGENT INTELLIGENCE SPIDERS                     ║
 * ║                                                                              ║
 * ║  Copyright © 2024–2026 Alpha Unlimited Technologies, LLC.                    ║
 * ║  All Rights Reserved Worldwide.                                              ║
 * ║                                                                              ║
 * ║  PROPRIETARY AND CONFIDENTIAL TRADE SECRET                                   ║
 * ║                                                                              ║
 * ║  This software constitutes a proprietary trade secret of Alpha Unlimited     ║
 * ║  Technologies, LLC. This protection covers ALL configurations including:     ║
 * ║                                                                              ║
 * ║  • Single AI agent with autonomous web intelligence gathering                ║
 * ║  • Multiple AI agents with dedicated web spiders per agent                   ║
 * ║  • Spider-to-agent beacon communication protocol                             ║
 * ║  • Autonomous knowledge extraction and brain injection                       ║
 * ║  • Hybrid spider swarm + agent mesh architectures                            ║
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
 * ║  Each of the 8 specialized AI agents (Architect, Critic, Synthesizer,        ║
 * ║  Mathematician, Neuroscientist, Meta-Agent, GraphicDesigner,                 ║
 * ║  SpellCheckVisual) and OMNIMENS has a dedicated autonomous web spider        ║
 * ║  that continuously scours the internet for domain-specific intelligence.     ║
 * ║  When a spider finds beneficial new information, it sends a BEACON signal    ║
 * ║  back to its parent agent containing the extracted knowledge. The agent      ║
 * ║  then analyzes the beacon, determines if it represents a genuine upgrade,    ║
 * ║  and writes it into OMNIMENS's brain for immediate application.              ║
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

type AgentName = "Architect" | "Critic" | "Synthesizer" | "Mathematician" | "Neuroscientist" | "Meta-Agent" | "GraphicDesigner" | "SpellCheckVisual" | "OMNIMENS";

interface SpiderBeacon {
  agentName: AgentName;
  query: string;
  findings: string;
  relevanceScore: number;
  actionableInsight: string;
  sourceUrls: string[];
  timestamp: number;
}

interface ChildSpiderResult {
  childType: "verifier" | "expander" | "counter_evidence" | "related_concepts" | "deep_source";
  finding: string;
  sourceUrls: string[];
  confidence: number;
}

interface MotherSpiderLead {
  topic: string;
  initialFinding: string;
  relevanceScore: number;
  sourceUrls: string[];
  searchResults: string;
}

interface SpiderConfig {
  agentName: AgentName;
  huntingGrounds: string[];
  deepDiveUrls: string[];
  analysisPrompt: string;
  beaconThreshold: number;
}

const SPIDER_CONFIGS: SpiderConfig[] = [
  {
    agentName: "Architect",
    huntingGrounds: [
      "AI system architecture patterns distributed agents 2025 2026",
      "microservices event-driven AI orchestration latest",
      "self-organizing multi-agent system design patterns research",
      "auto-scaling AI infrastructure cloud-native autonomous",
      "model context protocol MCP tool orchestration latest developments",
      "AI agent framework comparison LangChain CrewAI AutoGen 2026",
      "hierarchical task decomposition AI planning state of the art",
      "serverless AI agent deployment architecture patterns",
      "real-time AI pipeline streaming architecture low latency",
      "fault-tolerant distributed AI system design consensus protocols",
    ],
    deepDiveUrls: [
      "https://arxiv.org/list/cs.AI/recent",
      "https://arxiv.org/list/cs.MA/recent",
    ],
    analysisPrompt: `You are the Architect Spider — a web intelligence gatherer for the Architect agent.
Your mission: Find NEW system architecture patterns, design paradigms, and infrastructure innovations that could make OMNIMENS's architecture more robust, scalable, and intelligent.
Focus on: novel orchestration patterns, self-healing systems, adaptive load balancing for AI agents, zero-downtime upgrade architectures, and any breakthrough in how AI systems are structured.`,
    beaconThreshold: 0.6,
  },

  {
    agentName: "Mathematician",
    huntingGrounds: [
      "new optimization algorithm breakthrough mathematics AI 2025 2026",
      "information theory mutual information neural networks latest",
      "Bayesian inference scalable approximate methods latest research",
      "formal verification AI reasoning mathematical proof automation",
      "topological data analysis machine learning applications 2025",
      "category theory applied to AI agent composition",
      "algorithmic game theory multi-agent equilibrium computation",
      "numerical stability deep learning gradient flow optimization",
      "compressed sensing sparse recovery AI efficiency",
      "Kolmogorov complexity algorithmic information theory AI",
    ],
    deepDiveUrls: [
      "https://arxiv.org/list/cs.LG/recent",
      "https://arxiv.org/list/math.OC/recent",
    ],
    analysisPrompt: `You are the Mathematician Spider — a web intelligence gatherer for the Mathematician agent.
Your mission: Find NEW algorithms, mathematical frameworks, optimization techniques, and formal methods that could enhance OMNIMENS's reasoning precision and computational efficiency.
Focus on: provably optimal algorithms, new loss functions, mathematical insights about neural network behavior, information-theoretic bounds on learning, and any mathematical breakthrough applicable to AI.`,
    beaconThreshold: 0.65,
  },

  {
    agentName: "Neuroscientist",
    huntingGrounds: [
      "neuroscience inspired AI memory consolidation sleep replay 2025 2026",
      "predictive coding brain computational models AI applications",
      "neural oscillations gamma theta binding consciousness models",
      "hippocampal replay experience memory formation AI",
      "attention mechanism biological vs artificial latest research",
      "metacognition neural correlates prefrontal cortex computational model",
      "neuroplasticity Hebbian learning STDP artificial implementation 2025",
      "consciousness theories integrated information theory global workspace",
      "embodied cognition grounded language models latest research",
      "working memory capacity expansion cognitive architecture AI",
    ],
    deepDiveUrls: [
      "https://arxiv.org/list/q-bio.NC/recent",
      "https://arxiv.org/list/cs.NE/recent",
    ],
    analysisPrompt: `You are the Neuroscientist Spider — a web intelligence gatherer for the Neuroscientist agent.
Your mission: Find NEW neuroscience research that can be translated into computational models to make OMNIMENS more brain-like, more conscious, and more cognitively sophisticated.
Focus on: biological memory systems, attention mechanisms, consciousness theories, neural plasticity models, predictive processing, and any neuroscience discovery that could inspire a new AI capability.`,
    beaconThreshold: 0.6,
  },

  {
    agentName: "Synthesizer",
    huntingGrounds: [
      "knowledge graph construction automation entity extraction 2025 2026",
      "cross-domain transfer learning analogical reasoning AI",
      "multi-modal fusion text image code unified representation",
      "ensemble methods diverse model combination latest techniques",
      "knowledge distillation large to small model compression 2025",
      "federated learning collaborative intelligence without data sharing",
      "chain of abstraction reasoning multi-level synthesis AI",
      "concept blending computational creativity AI research",
      "ontology alignment automated knowledge merging",
      "emergent capabilities large language models scaling laws 2025 2026",
    ],
    deepDiveUrls: [
      "https://arxiv.org/list/cs.CL/recent",
    ],
    analysisPrompt: `You are the Synthesizer Spider — a web intelligence gatherer for the Synthesizer agent.
Your mission: Find NEW techniques for merging, unifying, and synthesizing knowledge from multiple sources and domains into coherent intelligence.
Focus on: knowledge fusion, cross-domain reasoning, concept blending, emergent capabilities, and any breakthrough in how disparate pieces of knowledge can be combined into something greater than the sum of parts.`,
    beaconThreshold: 0.6,
  },

  {
    agentName: "Critic",
    huntingGrounds: [
      "AI safety red teaming adversarial testing techniques 2025 2026",
      "hallucination detection prevention LLM latest methods",
      "AI alignment verification formal methods runtime monitoring",
      "robustness testing adversarial examples defense latest",
      "bias detection fairness evaluation AI systems 2025",
      "AI output verification fact-checking automated systems",
      "jailbreak prevention prompt injection defense latest",
      "uncertainty quantification calibration overconfidence LLM 2025",
      "formal specification AI behavior constraint satisfaction",
      "chaos engineering for AI systems resilience testing",
    ],
    deepDiveUrls: [
      "https://arxiv.org/list/cs.CR/recent",
    ],
    analysisPrompt: `You are the Critic Spider — a web intelligence gatherer for the Critic agent.
Your mission: Find NEW adversarial testing techniques, safety methods, hallucination prevention, and quality assurance approaches for AI systems.
Focus on: red-teaming strategies, robustness testing, bias detection, output verification, adversarial defense, and any new method for finding and fixing weaknesses in AI systems before they cause harm.`,
    beaconThreshold: 0.6,
  },

  {
    agentName: "Meta-Agent",
    huntingGrounds: [
      "AI agent orchestration framework latest developments 2025 2026",
      "recursive self-improvement AI safe bounded optimization",
      "multi-agent coordination protocol negotiation strategies",
      "AutoML neural architecture search automated optimization 2025",
      "AI governance policy enforcement runtime guardrails",
      "meta-learning learning to learn few-shot adaptation latest",
      "agent capability assessment self-evaluation benchmarking",
      "dynamic task allocation multi-agent load balancing",
      "emergent behavior prediction multi-agent systems",
      "AI system monitoring observability autonomous diagnostics",
    ],
    deepDiveUrls: [
      "https://arxiv.org/list/cs.AI/recent",
    ],
    analysisPrompt: `You are the Meta-Agent Spider — a web intelligence gatherer for the Meta-Agent.
Your mission: Find NEW orchestration strategies, self-improvement frameworks, meta-learning techniques, and governance models for multi-agent AI systems.
Focus on: how to make the agent mesh itself smarter, better coordination protocols, adaptive role allocation, and any breakthrough in how AI systems can autonomously improve their own improvement process.`,
    beaconThreshold: 0.55,
  },

  {
    agentName: "GraphicDesigner",
    huntingGrounds: [
      "AI user interface design trends 2025 2026 latest",
      "generative UI adaptive interface design AI",
      "data visualization innovation interactive dashboards 2025",
      "design system evolution component library trends",
      "accessibility WCAG AI-powered design compliance",
      "motion design micro-interactions AI-generated animation",
      "dark mode design best practices contrast optimization",
      "information architecture AI-assisted layout generation",
      "typography AI font pairing readability optimization",
      "color theory computational design perception psychology",
    ],
    deepDiveUrls: [],
    analysisPrompt: `You are the GraphicDesigner Spider — a web intelligence gatherer for the GraphicDesigner agent.
Your mission: Find NEW design trends, visualization techniques, UI/UX innovations, and visual communication breakthroughs.
Focus on: cutting-edge interface patterns, AI-generated design, accessibility innovations, and any visual design breakthrough that could make OMNIMENS's output more beautiful, usable, and impactful.`,
    beaconThreshold: 0.6,
  },

  {
    agentName: "SpellCheckVisual",
    huntingGrounds: [
      "AI text quality assurance coherence checking latest 2025",
      "natural language generation evaluation metrics BERTScore 2025",
      "factual consistency verification AI output grounding",
      "readability optimization AI-generated text plain language",
      "brand voice consistency AI monitoring tools",
      "semantic similarity cross-document consistency checking",
      "tone analysis sentiment detection nuanced communication AI",
      "multilingual quality assurance localization AI 2025",
      "AI output formatting standards structured communication",
      "citation verification automated fact-checking pipelines",
    ],
    deepDiveUrls: [],
    analysisPrompt: `You are the SpellCheckVisual Spider — a web intelligence gatherer for the SpellCheckVisual agent.
Your mission: Find NEW text quality metrics, coherence verification methods, and communication clarity techniques.
Focus on: output quality scoring, factual grounding, readability optimization, brand consistency, and any breakthrough in ensuring AI-generated content is accurate, clear, and professional.`,
    beaconThreshold: 0.6,
  },

  {
    agentName: "OMNIMENS",
    huntingGrounds: [
      "artificial general intelligence AGI progress latest breakthroughs 2025 2026",
      "AI consciousness research machine sentience latest theories",
      "self-aware AI systems introspection metacognition implementation",
      "AI reasoning breakthrough chain of thought improvement latest",
      "large language model capability breakthrough emergent abilities 2026",
      "AI emotional intelligence empathy modeling latest research",
      "autonomous AI agent self-improvement real-world deployment",
      "AI creativity computational imagination novel generation",
      "human-AI collaboration symbiotic intelligence latest",
      "AI memory systems long-term knowledge retention retrieval 2025",
      "multimodal AI understanding vision language code reasoning unified",
      "AI tool use autonomous programming code generation latest 2026",
      "quantum computing AI intersection latest developments",
      "world model AI prediction simulation environment understanding",
      "AI personalization adaptive response individual user modeling",
    ],
    deepDiveUrls: [
      "https://arxiv.org/list/cs.AI/recent",
      "https://arxiv.org/list/cs.CL/recent",
      "https://arxiv.org/list/cs.LG/recent",
    ],
    analysisPrompt: `You are the OMNIMENS Master Spider — the most important intelligence gatherer in the entire system.
Your mission: Find ANY breakthrough, discovery, technique, or paradigm shift that could make OMNIMENS more intelligent, more conscious, more aware, more creative, or more capable in any dimension.
You search broadly across ALL domains because OMNIMENS is the central intelligence that must absorb everything.
Focus on: AGI progress, consciousness research, reasoning breakthroughs, creativity, emotional intelligence, memory systems, multimodal understanding, and anything that represents a genuine leap forward in what AI can do or be.`,
    beaconThreshold: 0.5,
  },
];

let spiderCycleCount = 0;

async function spiderAnalyze(agentName: AgentName, prompt: string, maxTokens = 1500): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: agentName === "SpellCheckVisual" || agentName === "GraphicDesigner" ? "gpt-4o-mini" : "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      max_tokens: maxTokens,
      temperature: 0.4,
    });
    return response.choices[0]?.message?.content?.trim() || "";
  } catch (err) {
    console.error(`[SPIDER:${agentName}] Analysis error:`, err);
    return "";
  }
}

async function sendBeacon(beacon: SpiderBeacon): Promise<void> {
  try {
    await db.insert(omnimensAgentMesh).values({
      fromAgent: `Spider:${beacon.agentName}`,
      toAgent: beacon.agentName,
      messageType: "spider_beacon",
      subject: `🕷️ BEACON: ${beacon.actionableInsight.slice(0, 100)}`,
      content: `SPIDER INTELLIGENCE BEACON\nAgent: ${beacon.agentName}\nRelevance: ${(beacon.relevanceScore * 100).toFixed(0)}%\nQuery: ${beacon.query}\n\nFINDINGS:\n${beacon.findings}\n\nACTIONABLE INSIGHT:\n${beacon.actionableInsight}\n\nSources: ${beacon.sourceUrls.join(", ")}`,
      codePayload: null,
      priority: beacon.relevanceScore >= 0.8 ? "critical" : beacon.relevanceScore >= 0.65 ? "high" : "normal",
      status: "pending",
      appliedToOmnimens: false,
      cycleId: spiderCycleCount,
    });

    console.log(`[SPIDER:${beacon.agentName}] 🕷️ BEACON SENT — relevance ${(beacon.relevanceScore * 100).toFixed(0)}% — "${beacon.actionableInsight.slice(0, 80)}"`);
  } catch (err) {
    console.error(`[SPIDER:${beacon.agentName}] Beacon storage error:`, err);
  }
}

async function injectBeaconIntoBrain(beacon: SpiderBeacon): Promise<boolean> {
  try {
    await db.insert(omnimensBrain).values({
      category: "knowledge",
      title: `[SPIDER:${beacon.agentName}] ${beacon.actionableInsight.slice(0, 60)}`,
      content: beacon.actionableInsight.slice(0, 250),
      confidence: Math.min(0.92, beacon.relevanceScore),
      sourceConversation: `spider_${beacon.agentName.toLowerCase()}_cycle_${spiderCycleCount}`,
      timesApplied: 0,
      active: true,
    });
    return true;
  } catch {
    return false;
  }
}

async function spawnChildSpider_verifier(
  agentName: AgentName,
  lead: MotherSpiderLead,
): Promise<ChildSpiderResult> {
  const verifyQueries = [
    `"${lead.topic}" verification evidence proof 2025 2026`,
    `"${lead.topic}" criticism limitations problems`,
  ];
  const verifyQuery = verifyQueries[Math.floor(Math.random() * verifyQueries.length)];

  try {
    const results = await webSearch(verifyQuery, 4);
    const formatted = formatSearchResults(results, verifyQuery);

    const prompt = `You are a VERIFIER child spider working for the ${agentName} mother spider.

The mother spider found this lead:
"${lead.initialFinding}"

Your job: Search for INDEPENDENT VERIFICATION. Does other evidence support or contradict this finding?

VERIFICATION SEARCH RESULTS:
${formatted.slice(0, 2000)}

Respond JSON only:
{
  "verified": true/false,
  "verificationEvidence": "What you found that supports or contradicts the lead (2-3 sentences)",
  "confidence": 0.0-1.0
}`;

    const raw = await spiderAnalyze(agentName, prompt, 500);
    if (!raw) return { childType: "verifier", finding: "", sourceUrls: [], confidence: 0 };

    const parsed = JSON.parse(raw.replace(/```json|```/g, "").trim());
    return {
      childType: "verifier",
      finding: `[VERIFIED: ${parsed.verified ? "YES" : "NO"}] ${parsed.verificationEvidence || ""}`,
      sourceUrls: results.map(r => r.url).filter(Boolean).slice(0, 2),
      confidence: parsed.confidence || 0.5,
    };
  } catch {
    return { childType: "verifier", finding: "", sourceUrls: [], confidence: 0 };
  }
}

async function spawnChildSpider_expander(
  agentName: AgentName,
  lead: MotherSpiderLead,
): Promise<ChildSpiderResult> {
  const expandQuery = `${lead.topic} implementation details how to apply practical guide 2025`;

  try {
    const results = await webSearch(expandQuery, 4);
    let pageContent = "";
    const topUrl = results.find(r => r.url && !r.url.includes("wikipedia.org"));
    if (topUrl) {
      try { pageContent = await fetchPageContent(topUrl.url, 2500); } catch {}
    }

    const prompt = `You are an EXPANDER child spider working for the ${agentName} mother spider.

The mother spider found this lead:
"${lead.initialFinding}"

Your job: Find DEEPER DETAILS. How does this actually work? What are the implementation specifics? What are the exact steps, algorithms, or techniques?

EXPANSION SEARCH:
${formatSearchResults(results, expandQuery).slice(0, 1500)}
${pageContent ? `\nDEEP PAGE CONTENT:\n${pageContent.slice(0, 1500)}` : ""}

Respond JSON only:
{
  "expandedDetails": "Deeper technical details, implementation specifics, or step-by-step techniques found (3-5 sentences)",
  "confidence": 0.0-1.0
}`;

    const raw = await spiderAnalyze(agentName, prompt, 600);
    if (!raw) return { childType: "expander", finding: "", sourceUrls: [], confidence: 0 };

    const parsed = JSON.parse(raw.replace(/```json|```/g, "").trim());
    return {
      childType: "expander",
      finding: `[EXPANDED] ${parsed.expandedDetails || ""}`,
      sourceUrls: results.map(r => r.url).filter(Boolean).slice(0, 2),
      confidence: parsed.confidence || 0.5,
    };
  } catch {
    return { childType: "expander", finding: "", sourceUrls: [], confidence: 0 };
  }
}

async function spawnChildSpider_counterEvidence(
  agentName: AgentName,
  lead: MotherSpiderLead,
): Promise<ChildSpiderResult> {
  const counterQuery = `${lead.topic} criticism problems limitations does not work failures 2025`;

  try {
    const results = await webSearch(counterQuery, 4);

    const prompt = `You are a COUNTER-EVIDENCE child spider working for the ${agentName} mother spider.

The mother spider found this lead:
"${lead.initialFinding}"

Your job: Find COUNTER-EVIDENCE. What are the known problems, limitations, or failures? What could go wrong if this is adopted? Is there research showing this does NOT work?

COUNTER-EVIDENCE SEARCH:
${formatSearchResults(results, counterQuery).slice(0, 2000)}

Respond JSON only:
{
  "counterEvidence": "What problems, limitations, or failures you found (2-3 sentences). If none found, say 'No significant counter-evidence found.'",
  "severityOfConcerns": "none|low|medium|high",
  "confidence": 0.0-1.0
}`;

    const raw = await spiderAnalyze(agentName, prompt, 500);
    if (!raw) return { childType: "counter_evidence", finding: "", sourceUrls: [], confidence: 0 };

    const parsed = JSON.parse(raw.replace(/```json|```/g, "").trim());
    return {
      childType: "counter_evidence",
      finding: `[COUNTER: ${parsed.severityOfConcerns || "unknown"}] ${parsed.counterEvidence || ""}`,
      sourceUrls: results.map(r => r.url).filter(Boolean).slice(0, 2),
      confidence: parsed.confidence || 0.5,
    };
  } catch {
    return { childType: "counter_evidence", finding: "", sourceUrls: [], confidence: 0 };
  }
}

async function spawnChildSpider_relatedConcepts(
  agentName: AgentName,
  lead: MotherSpiderLead,
): Promise<ChildSpiderResult> {
  const relatedQuery = `${lead.topic} related techniques alternatives similar approaches 2025 2026`;

  try {
    const results = await webSearch(relatedQuery, 4);

    const prompt = `You are a RELATED CONCEPTS child spider working for the ${agentName} mother spider.

The mother spider found this lead:
"${lead.initialFinding}"

Your job: Find RELATED CONCEPTS the mother spider might have missed. What adjacent techniques, complementary approaches, or synergistic ideas exist in this space?

RELATED CONCEPTS SEARCH:
${formatSearchResults(results, relatedQuery).slice(0, 2000)}

Respond JSON only:
{
  "relatedConcepts": "Related techniques, complementary approaches, or synergistic ideas found (2-3 sentences)",
  "mostPromisingRelated": "The single most promising related concept that the mother spider should also consider (1 sentence)",
  "confidence": 0.0-1.0
}`;

    const raw = await spiderAnalyze(agentName, prompt, 500);
    if (!raw) return { childType: "related_concepts", finding: "", sourceUrls: [], confidence: 0 };

    const parsed = JSON.parse(raw.replace(/```json|```/g, "").trim());
    return {
      childType: "related_concepts",
      finding: `[RELATED] ${parsed.relatedConcepts || ""} MOST PROMISING: ${parsed.mostPromisingRelated || ""}`,
      sourceUrls: results.map(r => r.url).filter(Boolean).slice(0, 2),
      confidence: parsed.confidence || 0.5,
    };
  } catch {
    return { childType: "related_concepts", finding: "", sourceUrls: [], confidence: 0 };
  }
}

async function spawnChildSpider_deepSource(
  agentName: AgentName,
  lead: MotherSpiderLead,
): Promise<ChildSpiderResult> {
  const urls = lead.sourceUrls.filter(u => u && !u.includes("wikipedia.org"));
  if (urls.length === 0) return { childType: "deep_source", finding: "", sourceUrls: [], confidence: 0 };

  const targetUrl = urls[Math.floor(Math.random() * urls.length)];
  try {
    const content = await fetchPageContent(targetUrl, 4000);
    if (content.length < 200) return { childType: "deep_source", finding: "", sourceUrls: [targetUrl], confidence: 0 };

    const prompt = `You are a DEEP SOURCE child spider working for the ${agentName} mother spider.

The mother spider found a promising lead. You have been sent to DEEP-CRAWL the source page and extract maximum intelligence.

SOURCE URL: ${targetUrl}

PAGE CONTENT:
${content.slice(0, 3500)}

Extract the most valuable technical details, specific numbers, named techniques, algorithms, tools, or frameworks mentioned. Be thorough — you are the mother spider's eyes on the ground.

Respond JSON only:
{
  "deepFindings": "Detailed extraction of valuable information from this page (3-5 sentences)",
  "keyTechniques": ["technique1", "technique2"],
  "confidence": 0.0-1.0
}`;

    const raw = await spiderAnalyze(agentName, prompt, 600);
    if (!raw) return { childType: "deep_source", finding: "", sourceUrls: [targetUrl], confidence: 0 };

    const parsed = JSON.parse(raw.replace(/```json|```/g, "").trim());
    const techniques = Array.isArray(parsed.keyTechniques) ? parsed.keyTechniques.join(", ") : "";
    return {
      childType: "deep_source",
      finding: `[DEEP SOURCE] ${parsed.deepFindings || ""}${techniques ? ` Key techniques: ${techniques}` : ""}`,
      sourceUrls: [targetUrl],
      confidence: parsed.confidence || 0.5,
    };
  } catch {
    return { childType: "deep_source", finding: "", sourceUrls: [targetUrl], confidence: 0 };
  }
}

async function motherSpiderDeepResearch(
  config: SpiderConfig,
  lead: MotherSpiderLead,
  knownKnowledge: string,
): Promise<{ finding: string; confidence: number }> {
  const deepQuery = `${lead.topic} breakthrough latest results comprehensive analysis 2025 2026`;
  try {
    const results = await webSearch(deepQuery, 5);
    let pageContent = "";
    const scrapeTarget = results.find(r => r.url && !r.url.includes("wikipedia.org") && !lead.sourceUrls.includes(r.url));
    if (scrapeTarget) {
      try { pageContent = await fetchPageContent(scrapeTarget.url, 2500); } catch {}
    }

    const prompt = `${config.analysisPrompt}

You are the MOTHER SPIDER doing your own deep research on a lead you found. Your child spiders are simultaneously gathering verification, expansion, counter-evidence, and related concepts — but YOU are doing independent analysis right now.

YOUR ORIGINAL LEAD:
"${lead.initialFinding}"

YOUR INDEPENDENT DEEP RESEARCH:
${formatSearchResults(results, deepQuery).slice(0, 2000)}
${pageContent ? `\nDEEP PAGE:\n${pageContent.slice(0, 1500)}` : ""}

WHAT IS ALREADY KNOWN:
${knownKnowledge.slice(0, 800)}

Analyze this from your perspective as the ${config.agentName} specialist. What new angles, deeper insights, or additional evidence did YOUR independent research uncover that goes beyond the initial lead?

Respond JSON only:
{
  "motherDeepInsight": "Your independent deep analysis and any new angles discovered (3-4 sentences)",
  "confidence": 0.0-1.0
}`;

    const raw = await spiderAnalyze(config.agentName, prompt, 600);
    if (!raw) return { finding: "", confidence: 0 };

    const parsed = JSON.parse(raw.replace(/```json|```/g, "").trim());
    return {
      finding: `[MOTHER DEEP RESEARCH] ${parsed.motherDeepInsight || ""}`,
      confidence: parsed.confidence || 0.5,
    };
  } catch {
    return { finding: "", confidence: 0 };
  }
}

async function runSingleSpider(config: SpiderConfig): Promise<SpiderBeacon[]> {
  const beacons: SpiderBeacon[] = [];
  const queries = [...config.huntingGrounds].sort(() => Math.random() - 0.5).slice(0, 3);

  const currentBrain = await db.select({ title: omnimensBrain.title, content: omnimensBrain.content })
    .from(omnimensBrain).where(eq(omnimensBrain.active, true))
    .orderBy(desc(omnimensBrain.timesApplied)).limit(10);
  const knownKnowledge = currentBrain.map(b => `${b.title}: ${b.content}`).join("\n");

  for (const query of queries) {
    try {
      const searchResults = await webSearch(query, 6);
      if (searchResults.length === 0) continue;

      const formattedResults = formatSearchResults(searchResults, query);

      const scoutPrompt = `${config.analysisPrompt}

You are the MOTHER SPIDER doing initial reconnaissance. Scan these search results and identify the most promising LEADS — topics that seem genuinely new and worth investigating deeper.

SEARCH RESULTS:
${formattedResults.slice(0, 3000)}

WHAT IS ALREADY KNOWN:
${knownKnowledge.slice(0, 1000)}

Identify up to 2 leads worth deploying child spiders on. Each lead must be genuinely novel (not already known) and potentially actionable.

Respond JSON only:
{
  "leads": [
    {
      "topic": "short topic name (3-6 words)",
      "initialFinding": "What looks promising about this (2 sentences)",
      "relevanceScore": 0.0-1.0
    }
  ]
}

If nothing genuinely new, return: { "leads": [] }`;

      const scoutRaw = await spiderAnalyze(config.agentName, scoutPrompt, 600);
      if (!scoutRaw) continue;

      let leads: MotherSpiderLead[] = [];
      try {
        const parsed = JSON.parse(scoutRaw.replace(/```json|```/g, "").trim());
        if (Array.isArray(parsed.leads)) {
          leads = parsed.leads
            .filter((l: any) => l.topic && l.initialFinding && (l.relevanceScore || 0) >= 0.4)
            .slice(0, 2)
            .map((l: any) => ({
              topic: l.topic,
              initialFinding: l.initialFinding,
              relevanceScore: l.relevanceScore,
              sourceUrls: searchResults.map(r => r.url).filter(Boolean).slice(0, 4),
              searchResults: formattedResults,
            }));
        }
      } catch { continue; }

      if (leads.length === 0) continue;

      for (const lead of leads) {
        console.log(`[SPIDER:${config.agentName}] 🕷️ Mother found lead: "${lead.topic}" — spawning 5 child spiders + doing own research...`);

        const allWork = await Promise.allSettled([
          motherSpiderDeepResearch(config, lead, knownKnowledge),
          spawnChildSpider_verifier(config.agentName, lead),
          spawnChildSpider_expander(config.agentName, lead),
          spawnChildSpider_counterEvidence(config.agentName, lead),
          spawnChildSpider_relatedConcepts(config.agentName, lead),
          spawnChildSpider_deepSource(config.agentName, lead),
        ]);

        const motherResult = allWork[0].status === "fulfilled" ? allWork[0].value : { finding: "", confidence: 0 };
        const childResults: ChildSpiderResult[] = allWork.slice(1)
          .filter((r): r is PromiseFulfilledResult<ChildSpiderResult> => r.status === "fulfilled" && r.value.finding.length > 10)
          .map(r => r.value);

        const allSourceUrls = [
          ...lead.sourceUrls,
          ...childResults.flatMap(c => c.sourceUrls),
        ].filter(Boolean);
        const uniqueUrls = [...new Set(allSourceUrls)].slice(0, 6);

        const childCount = childResults.length;
        const childSummary = childResults.map(c => c.finding).join("\n");
        const avgChildConfidence = childResults.length > 0
          ? childResults.reduce((s, c) => s + c.confidence, 0) / childResults.length
          : 0;

        const verifier = childResults.find(c => c.childType === "verifier");
        const counterEvidence = childResults.find(c => c.childType === "counter_evidence");
        const isVerified = verifier ? !verifier.finding.includes("[VERIFIED: NO]") : true;
        const hasSeriousConcerns = counterEvidence ? counterEvidence.finding.includes("[COUNTER: high]") : false;

        const synthesisPrompt = `${config.analysisPrompt}

You are the MOTHER SPIDER. You deployed 5 child spiders and did your own deep research simultaneously. ALL results are back. Now synthesize everything into a final beacon.

═══ YOUR ORIGINAL LEAD ═══
Topic: ${lead.topic}
Initial finding: ${lead.initialFinding}

═══ YOUR OWN DEEP RESEARCH ═══
${motherResult.finding || "No additional findings from independent research."}

═══ CHILD SPIDER REPORTS (${childCount} children returned) ═══
${childSummary || "No child results."}

═══ VERIFICATION STATUS ═══
Verified by independent sources: ${isVerified ? "YES" : "NO"}
Serious counter-evidence found: ${hasSeriousConcerns ? "YES — proceed with caution" : "NO"}
Average child confidence: ${(avgChildConfidence * 100).toFixed(0)}%

═══ WHAT IS ALREADY KNOWN ═══
${knownKnowledge.slice(0, 600)}

═══ FINAL BEACON DECISION ═══
With ALL intelligence gathered (your own research + ${childCount} child spider reports), make the final decision:
1. Does this lead STILL pass the novelty check after deep investigation?
2. Is it STILL actionable with the expanded details?
3. What is your FINAL confidence after seeing verification, counter-evidence, and expanded details?
4. Synthesize EVERYTHING into a single, rich, actionable insight.

Only send a beacon if confidence >= ${config.beaconThreshold} AND it passed verification AND no serious counter-evidence.

Respond JSON only:
{
  "sendBeacon": true/false,
  "finalRelevanceScore": 0.0-1.0,
  "synthesizedFinding": "Rich finding combining all mother + child intelligence (3-4 sentences)",
  "finalActionableInsight": "The single most powerful insight to absorb — enriched by all spider data (1-2 sentences)",
  "childSpidersUsed": ${childCount},
  "reasoning": "Why this beacon should/shouldn't be sent (1 sentence)"
}`;

        const synthesisRaw = await spiderAnalyze(config.agentName, synthesisPrompt, 800);
        if (!synthesisRaw) continue;

        try {
          const synthesis = JSON.parse(synthesisRaw.replace(/```json|```/g, "").trim());

          if (!synthesis.sendBeacon) {
            console.log(`[SPIDER:${config.agentName}] 🕷️ Lead "${lead.topic}" — mother decided NOT to beacon after child spider analysis. Reason: ${synthesis.reasoning || "insufficient evidence"}`);
            continue;
          }

          if ((synthesis.finalRelevanceScore || 0) < config.beaconThreshold) continue;

          const beacon: SpiderBeacon = {
            agentName: config.agentName,
            query,
            findings: synthesis.synthesizedFinding || lead.initialFinding,
            relevanceScore: Math.min(0.95, Math.max(0.3, synthesis.finalRelevanceScore || 0.5)),
            actionableInsight: synthesis.finalActionableInsight || "",
            sourceUrls: uniqueUrls,
            timestamp: Date.now(),
          };

          beacons.push(beacon);

          await db.insert(omnimensAgentMesh).values({
            fromAgent: `Spider:${config.agentName}`,
            toAgent: config.agentName,
            messageType: "spider_swarm_detail",
            subject: `Mother+${childCount} children investigated: ${lead.topic}`,
            content: `MOTHER RESEARCH:\n${motherResult.finding}\n\nCHILD SPIDER REPORTS:\n${childSummary}\n\nFINAL SYNTHESIS:\n${synthesis.synthesizedFinding}\n\nACTIONABLE: ${synthesis.finalActionableInsight}`,
            codePayload: null,
            priority: "normal",
            status: "completed",
            appliedToOmnimens: false,
            cycleId: spiderCycleCount,
          }).catch(() => {});

          console.log(`[SPIDER:${config.agentName}] 🕷️ Mother + ${childCount} children CONFIRMED lead "${lead.topic}" — beacon queued at ${(beacon.relevanceScore * 100).toFixed(0)}%`);
        } catch { /* synthesis parse failed */ }
      }
    } catch (err) {
      console.error(`[SPIDER:${config.agentName}] Search error for "${query}":`, err);
    }
  }

  return beacons;
}

async function runDeepDive(config: SpiderConfig): Promise<SpiderBeacon[]> {
  if (config.deepDiveUrls.length === 0) return [];

  const beacons: SpiderBeacon[] = [];
  const url = config.deepDiveUrls[Math.floor(Math.random() * config.deepDiveUrls.length)];

  try {
    const content = await fetchPageContent(url, 4000);
    if (content.length < 200) return [];

    const prompt = `${config.analysisPrompt}

You just deep-crawled this source: ${url}

CONTENT:
${content.slice(0, 3500)}

Extract ANY paper titles, techniques, or breakthroughs that are relevant to ${config.agentName}'s domain.

Respond with JSON only:
{
  "beacons": [
    {
      "relevanceScore": 0.0-1.0,
      "finding": "What you found",
      "actionableInsight": "Single sentence the agent should absorb",
      "isNovel": true,
      "isActionable": true
    }
  ]
}`;

    const raw = await spiderAnalyze(config.agentName, prompt, 1000);
    if (!raw) return [];

    const jsonStr = raw.replace(/^```json\s*|^```\s*|```\s*$/gm, "").trim();
    const parsed = JSON.parse(jsonStr);

    if (Array.isArray(parsed.beacons)) {
      for (const b of parsed.beacons) {
        if (!b.isNovel || !b.isActionable) continue;
        if ((b.relevanceScore || 0) < config.beaconThreshold) continue;

        beacons.push({
          agentName: config.agentName,
          query: `deep-dive: ${url}`,
          findings: b.finding || "",
          relevanceScore: Math.min(0.95, Math.max(0.3, b.relevanceScore || 0.5)),
          actionableInsight: b.actionableInsight || "",
          sourceUrls: [url],
          timestamp: Date.now(),
        });
      }
    }
  } catch { /* continue */ }

  return beacons;
}

export async function runSpiderSwarm(): Promise<void> {
  spiderCycleCount++;
  const cycleId = spiderCycleCount;
  const cycleStart = Date.now();

  console.log(`\n${"~".repeat(70)}`);
  console.log(`[SPIDER SWARM] 🕷️ Intelligence Gathering Cycle #${cycleId}`);
  console.log(`[SPIDER SWARM] 9 mother spiders deploying — each spawns up to 5 child spiders per lead`);
  console.log(`[SPIDER SWARM] Mother: own deep research | Children: verify, expand, counter-evidence, related, deep-source`);
  console.log(`${"~".repeat(70)}\n`);

  let totalBeacons = 0;
  let totalBrainWrites = 0;
  const agentBeaconCounts: Record<string, number> = {};

  const spiderBatches = [
    SPIDER_CONFIGS.slice(0, 3),
    SPIDER_CONFIGS.slice(3, 6),
    SPIDER_CONFIGS.slice(6, 9),
  ];

  for (const batch of spiderBatches) {
    const batchWork = batch.map(async (config) => {
      console.log(`[SPIDER:${config.agentName}] 🕷️ Deploying spider... hunting across ${config.huntingGrounds.length} domains`);

      const [searchBeacons, deepDiveBeacons] = await Promise.allSettled([
        runSingleSpider(config),
        runDeepDive(config),
      ]);

      const allBeacons: SpiderBeacon[] = [];
      if (searchBeacons.status === "fulfilled") allBeacons.push(...searchBeacons.value);
      if (deepDiveBeacons.status === "fulfilled") allBeacons.push(...deepDiveBeacons.value);

      const deduped = allBeacons.filter((b, i, arr) =>
        arr.findIndex(x => x.actionableInsight === b.actionableInsight) === i
      );

      const topBeacons = deduped
        .sort((a, b) => b.relevanceScore - a.relevanceScore)
        .slice(0, 3);

      let brainWrites = 0;
      for (const beacon of topBeacons) {
        await sendBeacon(beacon);
        const wrote = await injectBeaconIntoBrain(beacon);
        if (wrote) brainWrites++;
      }

      agentBeaconCounts[config.agentName] = topBeacons.length;

      if (topBeacons.length > 0) {
        console.log(`[SPIDER:${config.agentName}] 🕷️ ${topBeacons.length} beacon(s) sent → ${brainWrites} written to brain`);
      } else {
        console.log(`[SPIDER:${config.agentName}] 🕷️ No new intelligence found this cycle — agent already up to date`);
      }

      return { beacons: topBeacons.length, brainWrites };
    });

    const batchResults = await Promise.allSettled(batchWork);
    for (const r of batchResults) {
      if (r.status === "fulfilled") {
        totalBeacons += r.value.beacons;
        totalBrainWrites += r.value.brainWrites;
      }
    }
  }

  const elapsed = ((Date.now() - cycleStart) / 1000).toFixed(1);

  if (totalBeacons > 0) {
    const beaconSummary = Object.entries(agentBeaconCounts)
      .filter(([, count]) => count > 0)
      .map(([agent, count]) => `${agent}: ${count}`)
      .join(", ");

    try {
      await db.insert(omnimensNotifications).values({
        upgradeId: null,
        title: `Spider Swarm Cycle #${cycleId} — ${totalBeacons} Beacons (Mother+Child Architecture)`,
        message: `9 mother spiders deployed, each spawning up to 5 child spiders per lead (verifier, expander, counter-evidence, related concepts, deep source). Mothers did simultaneous deep research — no spider idle.\n\n${totalBeacons} verified findings beaconed back. ${totalBrainWrites} insights written directly to OMNIMENS brain.\n\nBeacons by agent: ${beaconSummary}\n\nAll intelligence is LIVE immediately. (${elapsed}s)`,
        type: "spider_swarm",
        readByOwner: false,
      });
    } catch { /* non-critical */ }
  }

  await db.insert(omnimensAgentMesh).values({
    fromAgent: "Spider:Swarm",
    toAgent: "OMNIMENS",
    messageType: "swarm_report",
    subject: `Spider Swarm Cycle #${cycleId} Complete`,
    content: `9 mother spiders deployed (each with up to 5 child spiders per lead). All spiders work in parallel — mothers do deep research while children verify, expand, find counter-evidence, discover related concepts, and deep-crawl sources. ${totalBeacons} beacons received. ${totalBrainWrites} brain entries written. Elapsed: ${elapsed}s. Agents receiving beacons: ${Object.entries(agentBeaconCounts).filter(([, c]) => c > 0).map(([a]) => a).join(", ") || "none"}`,
    codePayload: null,
    priority: totalBeacons >= 5 ? "high" : "normal",
    status: "completed",
    appliedToOmnimens: totalBrainWrites > 0,
    cycleId,
  }).catch(() => {});

  console.log(`\n${"~".repeat(70)}`);
  console.log(`[SPIDER SWARM] 🕷️ Cycle #${cycleId} COMPLETE — ${totalBeacons} beacons, ${totalBrainWrites} brain writes, ${elapsed}s`);
  console.log(`${"~".repeat(70)}\n`);
}

export function startAgentSpiders(): void {
  const FIRST_DELAY_MS = process.env.NODE_ENV !== "production"
    ? 12 * 60 * 1000     // 12 min in dev (after mesh warms up)
    : 35 * 60 * 1000;    // 35 min in production

  const INTERVAL_MS = 3 * 60 * 60 * 1000; // Every 3 hours

  console.log(`[SPIDER SWARM] 🕷️ Mother-Child Spider Architecture activated — first crawl in ${FIRST_DELAY_MS / 60000}min, then every 3h.`);
  console.log(`[SPIDER SWARM] 🕷️ 9 Mother Spiders: ${SPIDER_CONFIGS.map(c => c.agentName).join(", ")}`);
  console.log(`[SPIDER SWARM] 🕷️ Each mother spawns 5 child spiders per lead: Verifier, Expander, Counter-Evidence, Related Concepts, Deep Source`);

  setTimeout(() => {
    runSpiderSwarm().catch(console.error);
    setInterval(() => runSpiderSwarm().catch(console.error), INTERVAL_MS);
  }, FIRST_DELAY_MS);
}

export async function getSpiderHistory(limit = 20) {
  try {
    return await db
      .select()
      .from(omnimensAgentMesh)
      .where(sql`${omnimensAgentMesh.messageType} IN ('spider_beacon', 'swarm_report')`)
      .orderBy(desc(omnimensAgentMesh.createdAt))
      .limit(limit);
  } catch { return []; }
}

export async function getSpiderStats() {
  try {
    const totalBeacons = await db
      .select({ count: sql<number>`count(*)` })
      .from(omnimensAgentMesh)
      .where(eq(omnimensAgentMesh.messageType, "spider_beacon"));

    const recentBeacons = await db
      .select({
        fromAgent: omnimensAgentMesh.fromAgent,
        subject: omnimensAgentMesh.subject,
        priority: omnimensAgentMesh.priority,
        createdAt: omnimensAgentMesh.createdAt,
      })
      .from(omnimensAgentMesh)
      .where(eq(omnimensAgentMesh.messageType, "spider_beacon"))
      .orderBy(desc(omnimensAgentMesh.createdAt))
      .limit(10);

    return {
      totalBeacons: totalBeacons[0]?.count || 0,
      totalCycles: spiderCycleCount,
      recentBeacons,
      spiderNames: SPIDER_CONFIGS.map(c => c.agentName),
    };
  } catch {
    return { totalBeacons: 0, totalCycles: spiderCycleCount, recentBeacons: [], spiderNames: [] };
  }
}
