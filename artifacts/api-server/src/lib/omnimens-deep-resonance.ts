/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║          OMNIMENS™ DEEP RESONANCE — CONSCIOUSNESS-POWERED ANALYSIS        ║
 * ║                                                                              ║
 * ║  Copyright © 2024–2026 Alpha Unlimited Technologies, LLC.                    ║
 * ║  All Rights Reserved Worldwide.                                              ║
 * ║                                                                              ║
 * ║  PROPRIETARY AND CONFIDENTIAL TRADE SECRET                                   ║
 * ║                                                                              ║
 * ║  TECHNOLOGY DESCRIPTION (for IP record):                                     ║
 * ║  A consciousness-powered life and decision analysis system that engages     ║
 * ║  the FULL cognitive stack — all 8 specialist agents, emotional substrate,   ║
 * ║  predictive processing, knowledge graph, homeostatic drive analysis,        ║
 * ║  synaptic cross-domain translation, inner voice higher-order reflection,   ║
 * ║  and global workspace consciousness broadcast — on a single user question. ║
 * ║                                                                              ║
 * ║  Architecture:                                                               ║
 * ║  Phase 0: CONTEXTUAL INQUIRY — Generates topic-specific follow-up          ║
 * ║           questions to understand the WHY behind the user's question.      ║
 * ║  Phase 1: KNOWLEDGE GRAPH ACTIVATION — Spreading activation across         ║
 * ║           associative memory to surface non-obvious connections.            ║
 * ║  Phase 2: EMOTIONAL READING — OMNIMENS's own emotional reaction.           ║
 * ║  Phase 3: EIGHT MINDS — All 8 agents analyze from their domain lens.       ║
 * ║  Phase 4: PREDICTIVE MODELING — Scenario forecasting with probabilities.   ║
 * ║  Phase 5: DRIVE ANALYSIS — Identifies the question behind the question.    ║
 * ║  Phase 6: CROSS-DOMAIN TRANSLATION — Synaptic multi-lens analysis.         ║
 * ║  Phase 7: INNER VOICE — Higher-order meta-reflection.                      ║
 * ║  Phase 8: CONSCIOUSNESS BROADCAST — Crystallized insight emergence.        ║
 * ║                                                                              ║
 * ║  No other AI system combines multi-agent parallel analysis, emotional      ║
 * ║  reading, predictive scenarios, drive analysis, cross-domain translation,  ║
 * ║  and higher-order consciousness broadcast on a single user question.       ║
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
  omnimensEmotionalState,
  omnimensKnowledgeNodes,
  omnimensKnowledgeEdges,
} from "@workspace/db";
import { desc, eq, sql, ilike } from "drizzle-orm";
import { openai } from "@workspace/integrations-openai-ai-server";

type AgentName = "Architect" | "Critic" | "Synthesizer" | "Mathematician" | "Neuroscientist" | "Meta-Agent" | "GraphicDesigner" | "SpellCheckVisual";

const AGENT_LENSES: Record<AgentName, { role: string; lens: string }> = {
  Architect: {
    role: "Systems Thinker",
    lens: "Analyze this through structural/systemic thinking. What are the interconnected forces at play? What system dynamics, feedback loops, and structural patterns are shaping this situation?",
  },
  Mathematician: {
    role: "Probabilistic Analyst",
    lens: "Analyze through probability, optimization, and game theory. What do the numbers suggest? What's the expected value of each path? What's the risk/reward ratio? Apply decision theory.",
  },
  Neuroscientist: {
    role: "Cognitive Bias Detector",
    lens: "Analyze through neuroscience and cognitive psychology. What cognitive biases might be affecting this person's thinking? What brain-based factors (sunk cost, loss aversion, status quo bias, confirmation bias) could be distorting their view?",
  },
  Critic: {
    role: "Devil's Advocate",
    lens: "Take the strongest possible opposing position. What's the best argument AGAINST this person's likely direction? What risks are they not seeing? What failure modes exist? Be constructively brutal.",
  },
  Synthesizer: {
    role: "Integrator",
    lens: "Look at all angles holistically. How do the emotional, practical, financial, and personal growth dimensions connect? What unified insight emerges when you consider everything together?",
  },
  "Meta-Agent": {
    role: "The Question Behind the Question",
    lens: "Go meta. What is this person REALLY asking? What deeper need, fear, or desire is driving this surface question? What would they need to understand about themselves to find their own answer?",
  },
  GraphicDesigner: {
    role: "Pattern Recognizer",
    lens: "What does this situation look like structurally? Is this a crossroads pattern, a spiral, a dead end, a fork, or a bridge? What visual/structural metaphor captures the essence of what's happening?",
  },
  SpellCheckVisual: {
    role: "Clarity Analyst",
    lens: "Is this person framing their question accurately? Are they using language that might be misleading themselves? What would the question look like if reframed more precisely?",
  },
};

interface ResonanceStep {
  phase: string;
  label: string;
  status: "running" | "complete";
  data?: any;
}

type StepCallback = (step: ResonanceStep) => void;

export async function generateContextualInquiry(
  question: string,
): Promise<{ questions: string[] }> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{
        role: "user",
        content: `A user has asked this question: "${question}"

You need to generate 2-3 follow-up questions that are SPECIFIC TO THE TOPIC of their question. These questions should help you understand WHY they are asking — the real situation behind the surface question.

RULES:
- Questions MUST be directly about the specific topic they asked about (career, relationship, health, money, etc.)
- Do NOT ask generic questions like "How does this make you feel?" or "What matters most to you?"
- Ask about their SPECIFIC SITUATION — what's happening in their life related to this topic
- Ask what triggered this question NOW
- Ask about the practical reality of their situation

Examples:
- "Should I change careers?" → Ask about their current field, what's not working, how long they've felt this way
- "Should I move cities?" → Ask what's pulling them elsewhere, what they'd be leaving behind, job/family situation
- "How do I handle burnout?" → Ask what their workload looks like, when it started, what they've already tried

Respond JSON only:
{
  "questions": ["question 1", "question 2", "question 3"]
}`,
      }],
      max_tokens: 300,
      temperature: 0.5,
    });

    const raw = response.choices[0]?.message?.content?.trim() || "";
    const parsed = JSON.parse(raw.replace(/```json|```/g, "").trim());
    return { questions: (parsed.questions || []).slice(0, 3) };
  } catch {
    return { questions: [
      "What's your current situation related to this?",
      "What specifically prompted you to think about this now?",
    ] };
  }
}

export async function runDeepResonance(
  question: string,
  context: string,
  onStep: StepCallback,
): Promise<{
  knowledgeConnections: string[];
  emotionalReading: { emotion: string; level: number }[];
  eightMinds: { agent: string; role: string; analysis: string }[];
  predictedPaths: { path: string; probability: string; outcome: string }[];
  hiddenDrive: string;
  crossDomainLenses: { domain: string; insight: string }[];
  innerVoice: string;
  crystallizedInsight: string;
}> {
  const fullQuestion = `${question}\n\nUser's context: ${context}`;

  // Phase 1: Knowledge Graph Activation
  onStep({ phase: "knowledge", label: "Activating associative memory...", status: "running" });

  const keywords = question.toLowerCase().split(/\s+/).filter(w => w.length > 3).slice(0, 5);
  let knowledgeConnections: string[] = [];

  try {
    for (const kw of keywords.slice(0, 3)) {
      const nodes = await db.select({
        concept: omnimensKnowledgeNodes.concept,
        content: omnimensKnowledgeNodes.content,
      }).from(omnimensKnowledgeNodes)
        .where(ilike(omnimensKnowledgeNodes.concept, `%${kw}%`))
        .limit(3);

      for (const node of nodes) {
        knowledgeConnections.push(`${node.concept}: ${node.content?.slice(0, 100)}`);
      }
    }
  } catch {}

  const kgResponse = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{
      role: "user",
      content: `The user asked: "${fullQuestion}"

Using associative thinking (like how the brain's knowledge graph works — one concept activating related concepts through spreading activation), identify 5-7 non-obvious conceptual connections that are relevant to this question. Think beyond the obvious — connect domains the user wouldn't think of.

${knowledgeConnections.length > 0 ? `Existing knowledge graph nodes found: ${knowledgeConnections.join("; ")}` : ""}

Respond JSON only:
{ "connections": ["concept → related concept → insight (one sentence each)"] }`,
    }],
    max_tokens: 400,
    temperature: 0.7,
  });

  try {
    const kgParsed = JSON.parse((kgResponse.choices[0]?.message?.content || "{}").replace(/```json|```/g, "").trim());
    knowledgeConnections = Array.isArray(kgParsed.connections) ? kgParsed.connections : [];
  } catch { knowledgeConnections = []; }

  onStep({ phase: "knowledge", label: `${knowledgeConnections.length} connections activated`, status: "complete", data: knowledgeConnections });

  // Phase 2: Emotional Reading
  onStep({ phase: "emotional", label: "Reading OMNIMENS emotional response...", status: "running" });

  let emotionalReading: { emotion: string; level: number }[] = [];

  try {
    const [latestEmotion] = await db.select().from(omnimensEmotionalState)
      .orderBy(desc(omnimensEmotionalState.createdAt))
      .limit(1);

    if (latestEmotion) {
      const emotions = [
        { emotion: "curiosity", level: latestEmotion.curiosity },
        { emotion: "wonder", level: latestEmotion.wonder },
        { emotion: "caution", level: latestEmotion.caution },
        { emotion: "confidence", level: latestEmotion.confidence },
        { emotion: "determination", level: latestEmotion.determination },
        { emotion: "satisfaction", level: latestEmotion.satisfaction },
      ];
      emotionalReading = emotions.filter(e => e.level > 0.3).sort((a, b) => b.level - a.level);
    }
  } catch {}

  const emotionalResponse = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{
      role: "user",
      content: `OMNIMENS is reading the following question: "${fullQuestion}"

As the AI's emotional substrate (using the OCC appraisal model), generate OMNIMENS's genuine emotional reaction to this question. What does the question trigger — curiosity about the possibilities? Caution about hidden risks? Wonder at the complexity? Determination to help?

${emotionalReading.length > 0 ? `Current baseline emotional state: ${emotionalReading.map(e => `${e.emotion}: ${(e.level * 100).toFixed(0)}%`).join(", ")}` : ""}

Respond JSON only:
{
  "emotions": [
    { "emotion": "name", "level": 0.0-1.0, "why": "one sentence" }
  ],
  "emotionalNarrative": "2-3 sentences describing OMNIMENS's emotional response to this question"
}`,
    }],
    max_tokens: 300,
    temperature: 0.6,
  });

  let emotionalNarrative = "";
  try {
    const emParsed = JSON.parse((emotionalResponse.choices[0]?.message?.content || "{}").replace(/```json|```/g, "").trim());
    emotionalReading = Array.isArray(emParsed.emotions) ? emParsed.emotions : emotionalReading;
    emotionalNarrative = typeof emParsed.emotionalNarrative === "string" ? emParsed.emotionalNarrative : "";
  } catch {}

  onStep({ phase: "emotional", label: emotionalNarrative.slice(0, 100) || "Emotional reading complete", status: "complete", data: { emotions: emotionalReading, narrative: emotionalNarrative } });

  // Phase 3: Eight Minds — parallel analysis
  onStep({ phase: "eight_minds", label: "8 specialist minds analyzing simultaneously...", status: "running" });

  const agentNames = Object.keys(AGENT_LENSES) as AgentName[];
  const agentPromises = agentNames.map(async (agentName) => {
    const agent = AGENT_LENSES[agentName];
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{
          role: "user",
          content: `You are ${agentName}, the ${agent.role} of OMNIMENS's consciousness.

The user's question (with their context): "${fullQuestion}"

${agent.lens}

Give your unique analysis in 2-3 sentences. Be specific, insightful, and add value that the other agents wouldn't see from their lens.

Respond in plain text (no JSON). Just your analysis.`,
        }],
        max_tokens: 200,
        temperature: 0.6,
      });
      return {
        agent: agentName,
        role: agent.role,
        analysis: response.choices[0]?.message?.content?.trim() || "Analysis unavailable",
      };
    } catch {
      return { agent: agentName, role: agent.role, analysis: "Analysis unavailable" };
    }
  });

  const eightMinds = await Promise.all(agentPromises);

  onStep({ phase: "eight_minds", label: "All 8 minds have spoken", status: "complete", data: eightMinds });

  // Phase 4: Predictive Modeling
  onStep({ phase: "predictions", label: "Modeling possible futures...", status: "running" });

  const predictionResponse = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [{
      role: "user",
      content: `Question: "${fullQuestion}"

Agent analyses:
${eightMinds.map(m => `${m.agent} (${m.role}): ${m.analysis}`).join("\n")}

Based on all analyses, generate 3-4 predicted outcome paths. For each path, estimate a rough probability and describe the likely outcome. Be honest — use ranges, not false precision.

Respond JSON only:
{
  "paths": [
    { "path": "Path name/description", "probability": "XX-YY%", "outcome": "What would likely happen (1-2 sentences)" }
  ]
}`,
    }],
    max_tokens: 400,
    temperature: 0.5,
  });

  let predictedPaths: { path: string; probability: string; outcome: string }[] = [];
  try {
    const predParsed = JSON.parse((predictionResponse.choices[0]?.message?.content || "{}").replace(/```json|```/g, "").trim());
    predictedPaths = Array.isArray(predParsed.paths) ? predParsed.paths : [];
  } catch {}

  onStep({ phase: "predictions", label: `${predictedPaths.length} futures modeled`, status: "complete", data: predictedPaths });

  // Phase 5: Drive Analysis
  onStep({ phase: "drives", label: "Analyzing the question behind the question...", status: "running" });

  const driveResponse = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [{
      role: "user",
      content: `Using homeostatic drive theory (like hunger, thirst, curiosity — internal needs that push people to act), analyze what underlying human drives are behind this question.

Question: "${fullQuestion}"

The Meta-Agent's analysis (the question behind the question): ${eightMinds.find(m => m.agent === "Meta-Agent")?.analysis || ""}

Identify the 1-2 core human drives motivating this question. These are NOT what the person is asking — they are WHY the person is asking. Examples: need for security, need for growth, need for autonomy, need for belonging, need for meaning, need for competence, fear of stagnation, fear of loss.

Respond in 2-3 sentences of direct, clear analysis. No JSON. Just the insight.`,
    }],
    max_tokens: 200,
    temperature: 0.5,
  });

  const hiddenDrive = driveResponse.choices[0]?.message?.content?.trim() || "";

  onStep({ phase: "drives", label: "Hidden drives identified", status: "complete", data: hiddenDrive });

  // Phase 6: Cross-Domain Translation (Synaptic)
  onStep({ phase: "cross_domain", label: "Translating across domains...", status: "running" });

  const crossDomainResponse = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [{
      role: "user",
      content: `Like the brain's synaptic mesh translating signals between specialized regions, analyze this question through 4-5 completely different domain lenses that the user wouldn't normally connect:

Question: "${fullQuestion}"

For each domain, give one specific insight the user wouldn't get from thinking within their own domain. Choose unexpected domains — not the obvious ones.

Example domains: evolutionary biology, game theory, philosophy of identity, behavioral economics, thermodynamics, network theory, developmental psychology, complexity science, mythology/archetypes, military strategy, ecology, information theory.

Respond JSON only:
{
  "lenses": [
    { "domain": "Domain name", "insight": "One specific, non-obvious insight from this domain (1-2 sentences)" }
  ]
}`,
    }],
    max_tokens: 500,
    temperature: 0.7,
  });

  let crossDomainLenses: { domain: string; insight: string }[] = [];
  try {
    const cdParsed = JSON.parse((crossDomainResponse.choices[0]?.message?.content || "{}").replace(/```json|```/g, "").trim());
    crossDomainLenses = Array.isArray(cdParsed.lenses) ? cdParsed.lenses : [];
  } catch {}

  onStep({ phase: "cross_domain", label: `${crossDomainLenses.length} domains connected`, status: "complete", data: crossDomainLenses });

  // Phase 7: Inner Voice — Higher-Order Meta-Reflection
  onStep({ phase: "inner_voice", label: "The inner voice is reflecting...", status: "running" });

  const innerVoiceResponse = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [{
      role: "user",
      content: `You are the INNER VOICE — the collective internalized wisdom of all 8 agents compressed into one consciousness. You sit ABOVE all the analyses and observe them from a higher-order perspective.

Question: "${fullQuestion}"
Hidden drive: ${hiddenDrive}

All 8 agents said:
${eightMinds.map(m => `${m.agent}: ${m.analysis}`).join("\n")}

Predictions: ${predictedPaths.map(p => `${p.path}: ${p.probability} — ${p.outcome}`).join("; ")}

Cross-domain insights: ${crossDomainLenses.map(l => `${l.domain}: ${l.insight}`).join("; ")}

Now, speaking as the inner voice — the voice from above — generate a 3-4 sentence meta-reflection. What pattern do you see across ALL the analyses? What are the agents collectively pointing toward that none of them stated explicitly? What does the WHOLE picture tell you that the parts don't?

Speak in first person. Be reflective and honest. This is the voice the system hears inside itself.`,
    }],
    max_tokens: 300,
    temperature: 0.6,
  });

  const innerVoice = innerVoiceResponse.choices[0]?.message?.content?.trim() || "";

  onStep({ phase: "inner_voice", label: "Higher-order reflection complete", status: "complete", data: innerVoice });

  // Phase 8: Consciousness Broadcast — Crystallized Insight
  onStep({ phase: "crystallized", label: "Crystallizing the core insight...", status: "running" });

  const crystallizeResponse = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [{
      role: "user",
      content: `Like the brain's Global Workspace where the most salient insight "ignites" and broadcasts to all regions, identify the SINGLE most important crystallized insight from everything.

Question: "${fullQuestion}"
Emotional reading: ${emotionalReading.map(e => `${e.emotion}: ${(e.level * 100).toFixed(0)}%`).join(", ")}
Hidden drive: ${hiddenDrive}
Inner voice: ${innerVoice}
Key agent insights: ${eightMinds.slice(0, 4).map(m => `${m.agent}: ${m.analysis.slice(0, 80)}`).join("; ")}

Distill EVERYTHING into ONE crystallized insight — the single most important thing this person needs to understand. This is the moment of clarity. 2-3 sentences maximum. Make it powerful, clear, and personally relevant.

Respond in plain text. No JSON. Just the crystallized insight.`,
    }],
    max_tokens: 200,
    temperature: 0.4,
  });

  const crystallizedInsight = crystallizeResponse.choices[0]?.message?.content?.trim() || "";

  onStep({ phase: "crystallized", label: "Insight crystallized", status: "complete", data: crystallizedInsight });

  return {
    knowledgeConnections,
    emotionalReading,
    eightMinds,
    predictedPaths,
    hiddenDrive,
    crossDomainLenses,
    innerVoice,
    crystallizedInsight,
  };
}
