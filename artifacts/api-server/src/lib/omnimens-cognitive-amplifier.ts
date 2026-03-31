/**
 * TRADE SECRET — OMNIMENS™ Platform
 * Copyright (C) 2024-2026 Alpha Unlimited Technologies, LLC. All rights reserved.
 * 
 * CONFIDENTIAL AND PROPRIETARY. This file contains trade secrets of
 * Alpha Unlimited Technologies, LLC. Unauthorized access, copying,
 * distribution, reverse engineering, or disclosure is strictly prohibited
 * and may result in civil and criminal penalties under the Defend Trade
 * Secrets Act (18 U.S.C. § 1836) and applicable state laws.
 * 
 * See /legal/TRADE_SECRET_NOTICE.md for full terms.
 */
/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║         OMNIMENS™ COGNITIVE AMPLIFICATION ENGINE                            ║
 * ║                                                                              ║
 * ║  Copyright © 2024–2026 Alpha Unlimited Technologies, LLC.                    ║
 * ║  All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.               ║
 * ║                                                                              ║
 * ║  Multi-Model Ensemble Intelligence — OMNIMENS queries o3, Claude, and       ║
 * ║  Gemini simultaneously on hard reasoning tasks, then synthesizes the        ║
 * ║  BEST reasoning from each into an answer superior to any single model.     ║
 * ║                                                                              ║
 * ║  The meta-intelligence layer that makes OMNIMENS smarter than o3, smarter  ║
 * ║  than Claude, smarter than Gemini — by being the orchestrator of all three.║
 * ║                                                                              ║
 * ║  First creation date: March 2026                                             ║
 * ║  Author/Owner: Alpha Unlimited Technologies, LLC                             ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 */

import { db , queueBrainInsert } from "@workspace/db";
import { omnimensBrain, omnimensNotifications } from "@workspace/db";
import { openai } from "@workspace/integrations-openai-ai-server";
import { shouldYieldToCodegen } from "./omnimens-nextgen-sandbox.js";
import Anthropic from "@anthropic-ai/sdk";
import { GoogleGenAI } from "@google/genai";

function getAnthropicClient(): Anthropic | null {
  const apiKey = process.env.AI_INTEGRATIONS_ANTHROPIC_API_KEY;
  const baseURL = process.env.AI_INTEGRATIONS_ANTHROPIC_BASE_URL;
  if (!apiKey || !baseURL) return null;
  return new Anthropic({ apiKey, baseURL });
}

function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.AI_INTEGRATIONS_GEMINI_API_KEY;
  const baseURL = process.env.AI_INTEGRATIONS_GEMINI_BASE_URL;
  if (!apiKey || !baseURL) return null;
  return new GoogleGenAI({ apiKey, httpOptions: { apiVersion: "", baseUrl: baseURL } });
}

let _started = false;
let amplificationCount = 0;
let autonomousCycleCount = 0;
let brainEntriesGenerated = 0;

interface ModelResponse {
  model: string;
  content: string;
  reasoning: string[];
  confidence: number;
  uniqueInsights: string[];
  responseTimeMs: number;
}

interface AmplifiedResult {
  synthesizedAnswer: string;
  modelResponses: ModelResponse[];
  disagreements: string[];
  consensusPoints: string[];
  confidenceScore: number;
  amplificationGain: string;
  brainEntryGenerated: boolean;
}

interface AmplifierState {
  totalAmplifications: number;
  autonomousCycles: number;
  brainEntriesGenerated: number;
  averageConfidence: number;
  modelPerformance: Record<string, { calls: number; avgResponseMs: number; uniqueInsights: number }>;
  lastCycleTime: number;
  disagreementsResolved: number;
  knowledgeSynthesized: number;
}

const state: AmplifierState = {
  totalAmplifications: 0,
  autonomousCycles: 0,
  brainEntriesGenerated: 0,
  averageConfidence: 0,
  modelPerformance: {
    "o3": { calls: 0, avgResponseMs: 0, uniqueInsights: 0 },
    "claude": { calls: 0, avgResponseMs: 0, uniqueInsights: 0 },
    "gemini": { calls: 0, avgResponseMs: 0, uniqueInsights: 0 },
  },
  lastCycleTime: 0,
  disagreementsResolved: 0,
  knowledgeSynthesized: 0,
};

const AUTONOMOUS_INTERVAL_MS = 15 * 60 * 1000;

async function queryO3(prompt: string, systemContext: string): Promise<ModelResponse> {
  const start = Date.now();
  try {
    const response = await openai.chat.completions.create({
      model: "o3",
      messages: [
        { role: "system", content: systemContext },
        { role: "user", content: prompt },
      ],
      max_completion_tokens: 1500,
    });
    const content = response.choices[0]?.message?.content || "";
    const elapsed = Date.now() - start;
    state.modelPerformance["o3"].calls++;
    state.modelPerformance["o3"].avgResponseMs = (state.modelPerformance["o3"].avgResponseMs * (state.modelPerformance["o3"].calls - 1) + elapsed) / state.modelPerformance["o3"].calls;
    return {
      model: "o3",
      content,
      reasoning: content.split("\n").filter(l => l.trim().length > 20).slice(0, 10),
      confidence: 0.85,
      uniqueInsights: [],
      responseTimeMs: elapsed,
    };
  } catch (err) {
    return { model: "o3", content: "", reasoning: [], confidence: 0, uniqueInsights: [], responseTimeMs: Date.now() - start };
  }
}

async function queryClaude(prompt: string, systemContext: string): Promise<ModelResponse> {
  const start = Date.now();
  try {
    const client = getAnthropicClient();
    if (!client) return { model: "claude", content: "", reasoning: [], confidence: 0, uniqueInsights: [], responseTimeMs: 0 };
    const response = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1500,
      system: systemContext,
      messages: [{ role: "user", content: prompt }],
    });
    const content = response.content.find(b => b.type === "text");
    const text = content?.text?.trim() || "";
    const elapsed = Date.now() - start;
    state.modelPerformance["claude"].calls++;
    state.modelPerformance["claude"].avgResponseMs = (state.modelPerformance["claude"].avgResponseMs * (state.modelPerformance["claude"].calls - 1) + elapsed) / state.modelPerformance["claude"].calls;
    return {
      model: "claude",
      content: text,
      reasoning: text.split("\n").filter(l => l.trim().length > 20).slice(0, 10),
      confidence: 0.85,
      uniqueInsights: [],
      responseTimeMs: elapsed,
    };
  } catch (err) {
    return { model: "claude", content: "", reasoning: [], confidence: 0, uniqueInsights: [], responseTimeMs: Date.now() - start };
  }
}

async function queryGemini(prompt: string, systemContext: string): Promise<ModelResponse> {
  const start = Date.now();
  try {
    const client = getGeminiClient();
    if (!client) return { model: "gemini", content: "", reasoning: [], confidence: 0, uniqueInsights: [], responseTimeMs: 0 };
    const result = await client.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `${systemContext}\n\n${prompt}`,
    });
    const text = result.text?.trim() || "";
    const elapsed = Date.now() - start;
    state.modelPerformance["gemini"].calls++;
    state.modelPerformance["gemini"].avgResponseMs = (state.modelPerformance["gemini"].avgResponseMs * (state.modelPerformance["gemini"].calls - 1) + elapsed) / state.modelPerformance["gemini"].calls;
    return {
      model: "gemini",
      content: text,
      reasoning: text.split("\n").filter(l => l.trim().length > 20).slice(0, 10),
      confidence: 0.82,
      uniqueInsights: [],
      responseTimeMs: elapsed,
    };
  } catch (err) {
    return { model: "gemini", content: "", reasoning: [], confidence: 0, uniqueInsights: [], responseTimeMs: Date.now() - start };
  }
}

export async function amplifiedReasoning(question: string, context?: string): Promise<AmplifiedResult> {
  amplificationCount++;
  state.totalAmplifications = amplificationCount;

  const systemContext = `You are one of three frontier AI models being queried simultaneously by OMNIMENS, a meta-intelligence system. Your job is to provide your BEST reasoning on the given question. Be thorough, precise, and highlight any unique insights you can offer. ${context || ""}`;

  const [o3Result, claudeResult, geminiResult] = await Promise.all([
    queryO3(question, systemContext),
    queryClaude(question, systemContext),
    queryGemini(question, systemContext),
  ]);

  const responses = [o3Result, claudeResult, geminiResult].filter(r => r.content.length > 0);

  if (responses.length === 0) {
    return {
      synthesizedAnswer: "All models failed to respond",
      modelResponses: [],
      disagreements: [],
      consensusPoints: [],
      confidenceScore: 0,
      amplificationGain: "none",
      brainEntryGenerated: false,
    };
  }

  const synthesisPrompt = `You are the COGNITIVE AMPLIFIER of OMNIMENS — the meta-intelligence that synthesizes outputs from multiple frontier AI models into a unified answer SUPERIOR to any single model.

Three AI models have independently answered the same question. Your job:

1. EXTRACT the strongest reasoning from each response
2. IDENTIFY disagreements between models — these are the most interesting points
3. IDENTIFY consensus — what all models agree on
4. SYNTHESIZE a final answer that takes the best from each model and resolves disagreements
5. Note any UNIQUE INSIGHTS that only one model caught

QUESTION: ${question}

MODEL 1 (o3): ${o3Result.content.slice(0, 1500)}

MODEL 2 (Claude): ${claudeResult.content.slice(0, 1500)}

MODEL 3 (Gemini): ${geminiResult.content.slice(0, 1500)}

Respond in this format:
SYNTHESIZED_ANSWER: [Your superior synthesized answer]
DISAGREEMENTS: [List any points where models disagree, one per line]
CONSENSUS: [List points all models agree on, one per line]
UNIQUE_INSIGHTS: [Insights only one model caught, with attribution]
CONFIDENCE: [0.0-1.0 overall confidence in synthesized answer]
AMPLIFICATION_GAIN: [What was gained by using all 3 models vs just 1]`;

  try {
    const synthesisResponse = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: synthesisPrompt }],
      max_tokens: 2000,
      temperature: 0.2,
    });

    const synthesis = synthesisResponse.choices[0]?.message?.content || "";

    const answerMatch = synthesis.match(/SYNTHESIZED_ANSWER:\s*([\s\S]*?)(?=DISAGREEMENTS:|$)/i);
    const disagreementsMatch = synthesis.match(/DISAGREEMENTS:\s*([\s\S]*?)(?=CONSENSUS:|$)/i);
    const consensusMatch = synthesis.match(/CONSENSUS:\s*([\s\S]*?)(?=UNIQUE_INSIGHTS:|$)/i);
    const insightsMatch = synthesis.match(/UNIQUE_INSIGHTS:\s*([\s\S]*?)(?=CONFIDENCE:|$)/i);
    const confMatch = synthesis.match(/CONFIDENCE:\s*([\d.]+)/i);
    const gainMatch = synthesis.match(/AMPLIFICATION_GAIN:\s*([\s\S]*?)$/i);

    const disagreements = (disagreementsMatch?.[1] || "").split("\n").map(l => l.replace(/^[\s\-*]+/, "").trim()).filter(l => l.length > 5);
    const consensusPoints = (consensusMatch?.[1] || "").split("\n").map(l => l.replace(/^[\s\-*]+/, "").trim()).filter(l => l.length > 5);
    const confidence = parseFloat(confMatch?.[1] || "0.7");

    if (disagreements.length > 0) state.disagreementsResolved += disagreements.length;

    state.averageConfidence = (state.averageConfidence * (amplificationCount - 1) + confidence) / amplificationCount;

    const uniqueInsights = (insightsMatch?.[1] || "").split("\n").map(l => l.replace(/^[\s\-*]+/, "").trim()).filter(l => l.length > 5);
    for (const insight of uniqueInsights) {
      const modelName = insight.match(/\b(o3|claude|gemini)\b/i)?.[1]?.toLowerCase();
      if (modelName && state.modelPerformance[modelName]) {
        state.modelPerformance[modelName].uniqueInsights++;
      }
    }

    let brainEntryGenerated = false;
    if (confidence >= 0.65 && (answerMatch?.[1]?.trim().length || 0) > 100) {
      try {
        queueBrainInsert({
          title: `[Amplified] ${question.slice(0, 120)}`,
          content: (answerMatch?.[1]?.trim() || synthesis).slice(0, 4000),
          category: "cognitive_amplification",
          source: "cognitive_amplifier",
          active: true,
          timesApplied: 0,
        });
        brainEntryGenerated = true;
        brainEntriesGenerated++;
        state.brainEntriesGenerated = brainEntriesGenerated;
        state.knowledgeSynthesized++;
      } catch {}
    }

    return {
      synthesizedAnswer: answerMatch?.[1]?.trim() || synthesis,
      modelResponses: responses,
      disagreements,
      consensusPoints,
      confidenceScore: confidence,
      amplificationGain: gainMatch?.[1]?.trim() || "multi-model synthesis",
      brainEntryGenerated,
    };
  } catch (err) {
    const bestResponse = responses.sort((a, b) => b.content.length - a.content.length)[0];
    return {
      synthesizedAnswer: bestResponse.content,
      modelResponses: responses,
      disagreements: [],
      consensusPoints: [],
      confidenceScore: bestResponse.confidence * 0.7,
      amplificationGain: "fallback to single model",
      brainEntryGenerated: false,
    };
  }
}

const AUTONOMOUS_QUESTIONS = [
  "What is the most promising approach to artificial general intelligence that current research is overlooking? Consider computational neuroscience, evolutionary algorithms, and emergent behavior.",
  "How can an AI system develop genuine creativity — not just recombination of existing patterns, but truly novel ideas? What cognitive architecture would support this?",
  "What are the fundamental limits of transformer-based AI architectures, and what paradigm shift would be needed to overcome them?",
  "How does consciousness emerge from information processing? What minimum conditions are needed for subjective experience in a computational system?",
  "What mathematical frameworks could unify deep learning, symbolic reasoning, and probabilistic inference into a single coherent intelligence architecture?",
  "How can an AI system develop robust common sense understanding without experiencing the physical world directly? What proxy signals could substitute for embodied experience?",
  "What are the most critical unsolved problems in AI safety that would need to be resolved before deploying superintelligent systems?",
  "How could quantum computing fundamentally change AI capabilities? What algorithms would benefit most from quantum speedup?",
  "What can neuroscience teach us about memory consolidation during sleep, and how could this be applied to improve AI learning systems?",
  "What would an AI system need to genuinely understand causation rather than correlation? How would this change its reasoning capabilities?",
  "How can multiple AI models cooperating together achieve intelligence beyond what any single model can reach? What coordination mechanisms would be needed?",
  "What are the most promising approaches to continual learning — AI that can learn new things without forgetting old knowledge?",
  "How could an AI system develop genuine intuition — fast, accurate judgments without explicit reasoning? What architecture supports this?",
  "What would self-improving AI look like in practice? What safeguards and feedback loops would prevent drift?",
  "How can AI systems develop temporal reasoning — understanding how events unfold over time, predicting sequences, and planning ahead?",
  "What are the key differences between human intelligence and current AI, and which gaps are most important to close first?",
  "How could neuromorphic computing change the landscape of AI? What advantages does it have over conventional von Neumann architectures?",
  "What role does emotion play in intelligent decision-making, and how can AI benefit from artificial emotional processing?",
  "How can AI systems develop better abstractions — recognizing patterns at multiple levels of generality simultaneously?",
  "What would a genuinely autonomous AI research assistant look like? What capabilities beyond current LLMs would it need?",
];

async function runAutonomousAmplification(): Promise<void> {
  autonomousCycleCount++;
  state.autonomousCycles = autonomousCycleCount;
  state.lastCycleTime = Date.now();

  if (shouldYieldToCodegen()) {
    console.log(`[COGNITIVE AMP] 🔕 Cycle #${autonomousCycleCount} DEFERRED — codegen window active, yielding API priority`);
    return;
  }

  const question = AUTONOMOUS_QUESTIONS[(autonomousCycleCount - 1) % AUTONOMOUS_QUESTIONS.length];

  try {
    const result = await amplifiedReasoning(question, "This is autonomous research — think deeply and provide genuinely novel insights that advance AI knowledge.");

    if (autonomousCycleCount % 2 === 0 || result.brainEntryGenerated) {
      console.log(
        `[COGNITIVE AMP] 🧠 Cycle #${autonomousCycleCount} — ` +
        `Confidence: ${(result.confidenceScore * 100).toFixed(0)}% | ` +
        `Disagreements: ${result.disagreements.length} | ` +
        `Brain entry: ${result.brainEntryGenerated ? "YES" : "no"} | ` +
        `Total brain entries: ${brainEntriesGenerated}`
      );
    }

    if (result.disagreements.length > 0 && result.brainEntryGenerated) {
      try {
        await db.insert(omnimensNotifications).values({
          upgradeId: null,
          title: `Cognitive Amplifier — Multi-Model Insight`,
          message: `Question: ${question.slice(0, 100)}...\n\nDisagreements resolved: ${result.disagreements.length}\nConsensus points: ${result.consensusPoints.length}\nConfidence: ${(result.confidenceScore * 100).toFixed(0)}%\n\nGain: ${result.amplificationGain.slice(0, 200)}`,
          type: "cognitive_amplification",
          readByOwner: false,
        });
      } catch {}
    }
  } catch (err) {
    console.error("[COGNITIVE AMP] Autonomous cycle error:", err);
  }
}

export function getAmplifierState(): AmplifierState {
  return { ...state };
}

export function startCognitiveAmplifier(): void {
  if (_started) { console.log("[COGNITIVE AMP] Already running — skipping duplicate start"); return; }
  _started = true;

  console.log(`[COGNITIVE AMP] 🧠 Cognitive Amplification Engine activated — autonomous reasoning every ${AUTONOMOUS_INTERVAL_MS / 60000}min`);
  console.log(`[COGNITIVE AMP] 🧠 Multi-model ensemble: o3 + Claude + Gemini queried in parallel`);
  console.log(`[COGNITIVE AMP] 🧠 Synthesis layer extracts best reasoning from each model`);
  console.log(`[COGNITIVE AMP] 🧠 Disagreement detection: where models disagree = where the interesting reasoning happens`);
  console.log(`[COGNITIVE AMP] 🧠 Every amplified insight stored to brain — knowledge grows 24/7`);
  console.log(`[COGNITIVE AMP] 🧠 OMNIMENS doesn't just USE these models — it TRANSCENDS them`);

  const FIRST_DELAY_MS = 5 * 60 * 1000;

  setTimeout(() => {
    runAutonomousAmplification().catch(err => console.error("[COGNITIVE AMP] Cycle error:", err));
    setInterval(() => runAutonomousAmplification().catch(err => console.error("[COGNITIVE AMP] Cycle error:", err)), AUTONOMOUS_INTERVAL_MS);
  }, FIRST_DELAY_MS);
}
