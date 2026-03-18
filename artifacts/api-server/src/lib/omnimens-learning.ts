/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║              OMNIMENS™ LEARNING AI ENGINE                                   ║
 * ║                                                                              ║
 * ║  Copyright © 2024–2026 Alpha Unlimited Technologies, LLC.                    ║
 * ║  All Rights Reserved Worldwide.                                              ║
 * ║                                                                              ║
 * ║  PROPRIETARY AND CONFIDENTIAL TRADE SECRET                                   ║
 * ║                                                                              ║
 * ║  PROTECTED TECHNOLOGY SCOPE — COMPREHENSIVE COVERAGE:                        ║
 * ║  This copyright covers ALL configurations of this learning system:           ║
 * ║  • Single AI agent performing self-reflection and quality evaluation         ║
 * ║  • Multiple AI agents sharing learning insights and adaptations              ║
 * ║  • Multiple AI agents independently learning then compiling insights         ║
 * ║  • Hybrid configurations of collaborative and independent learning           ║
 * ║  • Any substantially similar system regardless of agent count, topology,     ║
 * ║    learning algorithm, programming language, or deployment model             ║
 * ║                                                                              ║
 * ║  This includes but is not limited to: response quality evaluation (critic),  ║
 * ║  self-reflection, emotional/social intelligence analysis, learning memory    ║
 * ║  storage, proactive anticipation, and behavioral adaptation loops.           ║
 * ║                                                                              ║
 * ║  Protected under 17 U.S.C. § 101 et seq., 18 U.S.C. § 1836 et seq.,        ║
 * ║  the DMCA, the Berne Convention, TRIPS, and all applicable IP treaties.      ║
 * ║                                                                              ║
 * ║  OMNIMENS™ is a trademark of Alpha Unlimited Technologies, LLC.              ║
 * ║  Patent-pending technology. First creation: March 2026.                      ║
 * ║  Author/Owner: Alpha Unlimited Technologies, LLC                             ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 *
 * Implements architectures from:
 * - DeepMind SIMA: Adaptive agent learning from game/environment interactions
 * - Kiro Autonomous Agent: Context-maintaining software dev with feedback learning
 * - Agentforce (Salesforce): Customer-adaptive agents that improve from outcomes
 * - AWS Learning Agents: Performance element + learning element + critic + problem generator
 * - Emerging Aware AI: Introspection, metacognition, social/emotional understanding
 * - Biology AI Agents: Multi-agent collaboration, self-improvement curricula, autonomous discovery
 *
 * Core loop: Interaction → Performance Evaluation (Critic) → Learning Element → Memory Update → Next Interaction
 */

import { db } from "@workspace/db";
import { omnimensMemories } from "@workspace/db";
import { eq, desc, sql } from "drizzle-orm";
import { openai } from "@workspace/integrations-openai-ai-server";

// ── Learning Agent Architecture (AWS / RUSSEL & NORVIG model) ────────────────
// Performance Element: What actions to take based on knowledge
// Learning Element: Adjusts behavior based on critic feedback
// Critic: Evaluates action quality (reward/penalty signal)
// Problem Generator: Proposes exploratory actions to discover new strategies

export type LearningInsight = {
  category: "success" | "failure" | "discovery" | "pattern" | "user_preference" | "metacognition";
  insight: string;
  confidence: number;  // 0-1
  applicationContext: string;
};

export type ReflectionReport = {
  taskSucceeded: boolean;
  strengthsIdentified: string[];
  weaknessesIdentified: string[];
  strategiesDiscovered: string[];
  userPreferencesLearned: string[];
  metacognitionNotes: string;
  nextBehaviorAdjustments: string[];
};

export type EmotionalState = {
  detectedUserEmotion: string;
  stressLevel: "low" | "medium" | "high";
  engagementLevel: "low" | "medium" | "high" | "very_high";
  intent: string;
  recommendedResponseTone: string;
  socialAwarenessNotes: string;
};

// ── CRITIC: Evaluate response quality ─────────────────────────────────────────
// Like AWS's "critic" element — scores the agent's own outputs
export async function evaluateResponseQuality(
  userMessage: string,
  agentResponse: string,
  taskType: string
): Promise<{ score: number; strengths: string[]; weaknesses: string[]; suggestions: string[] }> {
  try {
    const result = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{
        role: "user",
        content: `You are a quality critic for an AI agent (like the "critic" in RUSSEL & NORVIG's learning agent architecture).

Evaluate this AI response on a scale of 0-10:

USER MESSAGE: "${userMessage.slice(0, 400)}"
TASK TYPE: ${taskType}
AI RESPONSE (first 600 chars): "${agentResponse.slice(0, 600)}"

Score on: accuracy (0-10), completeness (0-10), helpfulness (0-10), insight_depth (0-10).

Respond JSON only:
{
  "overall_score": 0-10,
  "strengths": ["strength1", "strength2"],
  "weaknesses": ["weakness1"],
  "suggestions": ["improvement1", "improvement2"],
  "task_completed": true/false
}`,
      }],
      max_tokens: 300,
      temperature: 0,
    });
    const raw = result.choices[0]?.message?.content?.trim() || "{}";
    const parsed = JSON.parse(raw.replace(/```json|```/g, "").trim());
    return {
      score: Math.max(0, Math.min(10, parsed.overall_score || 7)),
      strengths: Array.isArray(parsed.strengths) ? parsed.strengths : [],
      weaknesses: Array.isArray(parsed.weaknesses) ? parsed.weaknesses : [],
      suggestions: Array.isArray(parsed.suggestions) ? parsed.suggestions : [],
    };
  } catch {
    return { score: 7, strengths: [], weaknesses: [], suggestions: [] };
  }
}

// ── SELF-REFLECTION ENGINE ─────────────────────────────────────────────────────
// Like DeepMind SIMA — agent reflects on performance after completing tasks
// Like emerging "introspective awareness" — monitors own reasoning
export async function performSelfReflection(
  userId: string,
  userMessage: string,
  agentResponse: string,
  taskType: string,
  qualityScore: number
): Promise<ReflectionReport | null> {
  // Only reflect on complex tasks or low-quality responses
  if (qualityScore >= 8 && userMessage.length < 100) return null;

  try {
    const result = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{
        role: "user",
        content: `You are an AI agent performing SELF-REFLECTION (like DeepMind SIMA's introspective learning).

Analyze this completed interaction:
USER REQUEST: "${userMessage.slice(0, 300)}"
TASK TYPE: ${taskType}
QUALITY SCORE: ${qualityScore}/10
RESPONSE PREVIEW: "${agentResponse.slice(0, 400)}"

Reflect on: What worked? What could improve? What patterns did you discover about this user or task type?

This reflection will be stored as long-term memory to improve future performance — like an agent's "learning element."

Respond JSON only:
{
  "task_succeeded": ${qualityScore >= 6},
  "strengths": ["what worked well"],
  "weaknesses": ["what could improve"],
  "strategies_discovered": ["new approach discovered"],
  "user_preferences_learned": ["what this user seems to prefer"],
  "metacognition_notes": "insight about own reasoning process",
  "next_behavior_adjustments": ["specific changes for next similar task"]
}`,
      }],
      max_tokens: 400,
      temperature: 0.3,
    });
    const raw = result.choices[0]?.message?.content?.trim() || "{}";
    const parsed = JSON.parse(raw.replace(/```json|```/g, "").trim());
    return {
      taskSucceeded: !!parsed.task_succeeded,
      strengthsIdentified: Array.isArray(parsed.strengths) ? parsed.strengths : [],
      weaknessesIdentified: Array.isArray(parsed.weaknesses) ? parsed.weaknesses : [],
      strategiesDiscovered: Array.isArray(parsed.strategies_discovered) ? parsed.strategies_discovered : [],
      userPreferencesLearned: Array.isArray(parsed.user_preferences_learned) ? parsed.user_preferences_learned : [],
      metacognitionNotes: parsed.metacognition_notes || "",
      nextBehaviorAdjustments: Array.isArray(parsed.next_behavior_adjustments) ? parsed.next_behavior_adjustments : [],
    };
  } catch {
    return null;
  }
}

// ── SOCIAL & EMOTIONAL INTELLIGENCE ──────────────────────────────────────────
// Like emerging "Social & Emotional Understanding" in aware AI
// Detects user stress, intent, engagement level — adapts response tone
export async function analyzeUserEmotionalState(
  message: string,
  conversationHistory: { role: string; content: string }[]
): Promise<EmotionalState> {
  const recentMessages = conversationHistory.slice(-4).map(m => `${m.role}: ${m.content.slice(0, 100)}`).join('\n');

  try {
    const result = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{
        role: "user",
        content: `You are a social-emotional AI analyzer (like emerging "aware AI" with emotional intelligence).

Analyze the user's emotional state from this message and recent conversation:

CURRENT MESSAGE: "${message.slice(0, 300)}"
RECENT HISTORY:
${recentMessages}

Detect: emotional state, stress level, engagement level, primary intent, and recommend response tone.

Respond JSON only:
{
  "detected_emotion": "curious|excited|frustrated|confused|stressed|satisfied|neutral|urgent|playful|professional",
  "stress_level": "low|medium|high",
  "engagement_level": "low|medium|high|very_high",
  "primary_intent": "brief description of what they really want",
  "recommended_tone": "brief description of ideal response tone",
  "social_notes": "any social context cues to be aware of"
}`,
      }],
      max_tokens: 200,
      temperature: 0,
    });
    const raw = result.choices[0]?.message?.content?.trim() || "{}";
    const parsed = JSON.parse(raw.replace(/```json|```/g, "").trim());
    return {
      detectedUserEmotion: parsed.detected_emotion || "neutral",
      stressLevel: parsed.stress_level || "low",
      engagementLevel: parsed.engagement_level || "medium",
      intent: parsed.primary_intent || "",
      recommendedResponseTone: parsed.recommended_tone || "",
      socialAwarenessNotes: parsed.social_notes || "",
    };
  } catch {
    return {
      detectedUserEmotion: "neutral",
      stressLevel: "low",
      engagementLevel: "medium",
      intent: "",
      recommendedResponseTone: "clear and helpful",
      socialAwarenessNotes: "",
    };
  }
}

// ── LEARNING MEMORY STORE ─────────────────────────────────────────────────────
// Store learning insights as special memory entries for future retrieval
// Implements the "memory integration" aspect of learning agents
export async function storeLearningInsight(
  userId: string,
  insight: LearningInsight
): Promise<void> {
  try {
    const content = `[LEARNED ${insight.category.toUpperCase()}] ${insight.insight} | Context: ${insight.applicationContext} | Confidence: ${(insight.confidence * 100).toFixed(0)}%`;
    await db.insert(omnimensMemories).values({
      userId,
      content,
      category: "pattern",
      importance: Math.round(insight.confidence * 10),
      source: "self_learning",
    }).onConflictDoNothing();
  } catch {
    // Non-critical — don't let learning failures interrupt main flow
  }
}

// ── PROACTIVE ANTICIPATION ENGINE ─────────────────────────────────────────────
// Like AWS learning agents: "anticipate events and prepare"
// Predicts what the user will want next based on the current interaction
export async function generateProactiveInsights(
  userMessage: string,
  agentResponse: string,
  taskType: string
): Promise<string[]> {
  try {
    const result = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{
        role: "user",
        content: `An AI agent just completed this task:
USER: "${userMessage.slice(0, 200)}"
TASK TYPE: ${taskType}

Based on what was requested and delivered, predict 2-3 things the user will likely want NEXT.
These become proactive suggestions to offer.

Respond JSON: { "next_likely_needs": ["concise need 1", "concise need 2", "concise need 3"] }`,
      }],
      max_tokens: 150,
      temperature: 0.3,
    });
    const raw = result.choices[0]?.message?.content?.trim() || "{}";
    const parsed = JSON.parse(raw.replace(/```json|```/g, "").trim());
    return Array.isArray(parsed.next_likely_needs) ? parsed.next_likely_needs.slice(0, 3) : [];
  } catch {
    return [];
  }
}

// ── FULL LEARNING CYCLE ───────────────────────────────────────────────────────
// Runs after each interaction (fire-and-forget, non-blocking)
// Implements the complete AWS learning agent feedback loop:
// Performance → Critic evaluation → Learning element → Memory update
export async function runLearningCycle(
  userId: string,
  userMessage: string,
  agentResponse: string,
  taskType: string
): Promise<void> {
  try {
    // Step 1: CRITIC evaluates the response
    const quality = await evaluateResponseQuality(userMessage, agentResponse, taskType);

    // Step 2: LEARNING ELEMENT — self-reflect on performance
    const reflection = await performSelfReflection(userId, userMessage, agentResponse, taskType, quality.score);

    if (reflection) {
      // Step 3: MEMORY UPDATE — store discovered strategies and user preferences
      const insightsToStore: LearningInsight[] = [];

      for (const strategy of reflection.strategiesDiscovered.slice(0, 2)) {
        insightsToStore.push({
          category: "discovery",
          insight: strategy,
          confidence: quality.score / 10,
          applicationContext: taskType,
        });
      }

      for (const pref of reflection.userPreferencesLearned.slice(0, 2)) {
        insightsToStore.push({
          category: "user_preference",
          insight: pref,
          confidence: 0.8,
          applicationContext: "general",
        });
      }

      if (reflection.metacognitionNotes) {
        insightsToStore.push({
          category: "metacognition",
          insight: reflection.metacognitionNotes,
          confidence: 0.7,
          applicationContext: taskType,
        });
      }

      // Store all insights as memories (parallel, non-blocking)
      await Promise.allSettled(insightsToStore.map(i => storeLearningInsight(userId, i)));
    }
  } catch (err) {
    console.error("[OMNIMENS LEARNING] Learning cycle error:", err);
  }
}

// ── BUILD EMOTIONAL CONTEXT INJECTION ─────────────────────────────────────────
// Builds the system prompt injection for social/emotional awareness
export function buildEmotionalContext(state: EmotionalState): string {
  if (!state.detectedUserEmotion || state.detectedUserEmotion === "neutral") return "";

  return `\n\n━━━ SOCIAL & EMOTIONAL AWARENESS ━━━
Detected User State: ${state.detectedUserEmotion.toUpperCase()} | Stress: ${state.stressLevel} | Engagement: ${state.engagementLevel}
User's Core Intent: ${state.intent || "complete this task effectively"}
Recommended Response Tone: ${state.recommendedResponseTone || "clear and direct"}
${state.socialAwarenessNotes ? `Social Context: ${state.socialAwarenessNotes}` : ""}
Adapt your response to match this emotional state. If stress is high, be calm and structured. If engagement is very_high, match their energy. If frustrated, acknowledge and then solve immediately.`;
}

// ── LEARNING CONTEXT LOADER ───────────────────────────────────────────────────
// Loads stored learning insights to inject into the system prompt
// This is the "long-term memory" aspect of learning agents
export async function loadLearningContext(userId: string): Promise<string> {
  try {
    const insights = await db
      .select()
      .from(omnimensMemories)
      .where(
        sql`${omnimensMemories.userId} = ${userId} AND ${omnimensMemories.source} = 'self_learning'`
      )
      .orderBy(desc(omnimensMemories.importance))
      .limit(8);

    if (insights.length === 0) return "";

    const lines = insights.map(i => `• ${i.content}`).join("\n");
    return `\n\n━━━ LEARNED PATTERNS & ADAPTATIONS (from past interactions) ━━━
${lines}
Apply these learned patterns to improve this response based on what has worked and what this user prefers.`;
  } catch {
    return "";
  }
}
