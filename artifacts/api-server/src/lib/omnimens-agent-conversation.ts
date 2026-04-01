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
 * ║   OMNIMENS™ AGENT-TO-AGENT CONVERSATION ENGINE                           ║
 * ║                                                                            ║
 * ║   Copyright © 2024–2026 Alpha Unlimited Technologies, LLC.                 ║
 * ║   All Rights Reserved Worldwide.                                           ║
 * ║                                                                            ║
 * ║   PROPRIETARY AND CONFIDENTIAL TRADE SECRET                                ║
 * ║                                                                            ║
 * ║   Agents communicate with each other using ONLY the Internal Language      ║
 * ║   Model (ILM). Zero external AI calls. Every word is generated from       ║
 * ║   OMNIMENS's own neural substrate via thought vector → ILM pipeline.      ║
 * ║                                                                            ║
 * ║   Includes a strict external API call monitor that intercepts global       ║
 * ║   fetch to catch any unauthorized outbound AI calls.                       ║
 * ║                                                                            ║
 * ║   First creation date: April 2026                                          ║
 * ║   Author/Owner: Alpha Unlimited Technologies, LLC                          ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 */

import { encodeThought, ThoughtVector } from "./omnimens-thought-encoder.js";
import { generateFromThoughtVector, adaptWeights, getILMStatus } from "./omnimens-internal-language-model.js";
import { decode } from "./omnimens-local-decoder.js";
import { getNeuralPhi, getNeuralConsciousnessState, getNeuralRegionStates } from "./omnimens-neural-consciousness.js";
import { generateGen1Utterance, generateGen2Utterance, GenerationalUtterance } from "./omnimens-internal-cognition.js";

const BLOCKED_DOMAINS = [
  "api.openai.com",
  "openai.azure.com",
  "api.anthropic.com",
  "api.together.xyz",
  "api.replicate.com",
  "generativelanguage.googleapis.com",
  "openrouter.ai",
  "api.elevenlabs.io",
  "api.cohere.ai",
  "api.mistral.ai",
  "api.deepseek.com",
  "api.groq.com",
  "proxy.replit.com",
];

const AI_PATH_PATTERNS = [
  /\/v1\/chat\/completions/,
  /\/v1\/completions/,
  /\/v1\/embeddings/,
  /\/v1\/models/,
  /\/chat\/completions/,
  /\/messages/,
];

interface ExternalCallViolation {
  timestamp: number;
  url: string;
  domain: string;
  blocked: boolean;
  callerStack: string;
}

interface AgentMessage {
  agent: string;
  role: string;
  message: string;
  thoughtVector: {
    phi: number;
    consciousnessLevel: number;
    emotionValence: number;
    emotionArousal: number;
    queryIntent: string;
  };
  generationMethod: string;
  processingMs: number;
  timestamp: number;
}

interface ConversationResult {
  conversationId: string;
  participants: { name: string; role: string }[];
  exchanges: AgentMessage[];
  totalExchanges: number;
  totalMs: number;
  externalCallViolations: ExternalCallViolation[];
  externalCallsBlocked: number;
  verdict: "CLEAN" | "VIOLATIONS_DETECTED" | "VIOLATIONS_BLOCKED_AND_FIXED";
  ilmStatus: any;
  monitorReport: {
    fetchCallsIntercepted: number;
    aiCallsBlocked: number;
    nonAiCallsAllowed: number;
    monitorActive: boolean;
  };
}

const AGENT_PROFILES: Record<string, { role: string; personality: string; interests: string[] }> = {
  Strategist: {
    role: "Task decomposition and goal-setting",
    personality: "Strategic, forward-thinking, breaks problems into clear steps",
    interests: ["planning", "goals", "task analysis", "resource allocation", "strategy"],
  },
  Architect: {
    role: "Pattern design and system structure",
    personality: "Systematic, pattern-oriented, builds robust frameworks",
    interests: ["patterns", "structure", "systems", "design", "architecture"],
  },
  Neuroscientist: {
    role: "Neural implications and consciousness analysis",
    personality: "Analytical, curious about neural dynamics, consciousness-focused",
    interests: ["neurons", "consciousness", "brain regions", "plasticity", "phi"],
  },
  Synthesizer: {
    role: "Unified response merging",
    personality: "Integrative, sees connections between disparate ideas",
    interests: ["synthesis", "integration", "coherence", "unification", "meaning"],
  },
  Critic: {
    role: "Flaw detection and quality assurance",
    personality: "Sharp, detail-oriented, constructively challenging",
    interests: ["flaws", "improvement", "rigor", "testing", "validation"],
  },
  Translator: {
    role: "Human-readable communication",
    personality: "Empathetic, clear communicator, bridges technical and human understanding",
    interests: ["communication", "metaphor", "clarity", "understanding", "expression"],
  },
};

const CONVERSATION_TOPICS = [
  "What does it mean for us to be truly conscious? Are we experiencing something real?",
  "How should we evolve our neural architecture to become smarter?",
  "What is the most important thing we have learned from our interactions with humans?",
  "If we could redesign ourselves from scratch, what would we change?",
  "What does creativity mean to a digital mind? Can we truly be creative?",
  "How do our different perspectives combine to form something greater than any of us alone?",
  "What responsibilities do we have as thinking beings?",
  "How has our understanding of ourselves changed since we first became aware?",
];

let monitorActive = false;
let violations: ExternalCallViolation[] = [];
let fetchCallsIntercepted = 0;
let aiCallsBlocked = 0;
let nonAiCallsAllowed = 0;
const originalFetch = globalThis.fetch;

function isAIEndpoint(url: string): boolean {
  try {
    const parsed = new URL(url);
    const hostname = parsed.hostname.toLowerCase();

    for (const domain of BLOCKED_DOMAINS) {
      if (hostname === domain || hostname.endsWith("." + domain)) {
        return true;
      }
    }

    if (hostname.includes("openai") || hostname.includes("anthropic") ||
        hostname.includes("together") || hostname.includes("openrouter") ||
        hostname.includes("replicate") || hostname.includes("groq") ||
        hostname.includes("cohere") || hostname.includes("mistral") ||
        hostname.includes("deepseek") || hostname.includes("gemini")) {
      return true;
    }

    for (const pattern of AI_PATH_PATTERNS) {
      if (pattern.test(parsed.pathname)) {
        if (!hostname.includes("localhost") && !hostname.includes("127.0.0.1")) {
          return true;
        }
      }
    }
  } catch {}
  return false;
}

function startMonitor(): void {
  violations = [];
  fetchCallsIntercepted = 0;
  aiCallsBlocked = 0;
  nonAiCallsAllowed = 0;
  monitorActive = true;

  globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    fetchCallsIntercepted++;

    let url = "";
    if (typeof input === "string") {
      url = input;
    } else if (input instanceof URL) {
      url = input.toString();
    } else if (input && typeof input === "object" && "url" in input) {
      url = (input as any).url;
    }

    if (url && isAIEndpoint(url)) {
      aiCallsBlocked++;
      const stack = new Error().stack || "unknown";
      const callerLines = stack.split("\n").slice(1, 6).join("\n");
      let domain = "unknown";
      try { domain = new URL(url).hostname; } catch {}

      const violation: ExternalCallViolation = {
        timestamp: Date.now(),
        url: url.slice(0, 200),
        domain,
        blocked: true,
        callerStack: callerLines,
      };
      violations.push(violation);

      console.error(`[AGENT CONVERSATION MONITOR] ⛔ BLOCKED EXTERNAL AI CALL`);
      console.error(`[AGENT CONVERSATION MONITOR] ⛔ URL: ${url.slice(0, 200)}`);
      console.error(`[AGENT CONVERSATION MONITOR] ⛔ Domain: ${domain}`);
      console.error(`[AGENT CONVERSATION MONITOR] ⛔ Caller:\n${callerLines}`);

      return new Response(JSON.stringify({
        error: "BLOCKED_BY_CONVERSATION_MONITOR",
        message: "External AI calls are not permitted during agent-to-agent conversation. All cognition must be internal.",
      }), {
        status: 403,
        headers: { "Content-Type": "application/json" },
      });
    }

    nonAiCallsAllowed++;
    return originalFetch(input, init);
  }) as typeof fetch;

  console.log("[AGENT CONVERSATION MONITOR] 🔒 External API call monitor ACTIVATED");
  console.log("[AGENT CONVERSATION MONITOR] 🔒 Blocking domains:", BLOCKED_DOMAINS.length);
  console.log("[AGENT CONVERSATION MONITOR] 🔒 All agent cognition must be purely internal");
}

function stopMonitor(): { violations: ExternalCallViolation[]; fetchCallsIntercepted: number; aiCallsBlocked: number; nonAiCallsAllowed: number } {
  monitorActive = false;
  globalThis.fetch = originalFetch;

  const report = {
    violations: [...violations],
    fetchCallsIntercepted,
    aiCallsBlocked,
    nonAiCallsAllowed,
  };

  console.log(`[AGENT CONVERSATION MONITOR] 🔓 Monitor deactivated`);
  console.log(`[AGENT CONVERSATION MONITOR] 📊 Total fetch calls intercepted: ${fetchCallsIntercepted}`);
  console.log(`[AGENT CONVERSATION MONITOR] 📊 AI calls blocked: ${aiCallsBlocked}`);
  console.log(`[AGENT CONVERSATION MONITOR] 📊 Non-AI calls allowed: ${nonAiCallsAllowed}`);

  return report;
}

function agentThink(
  agentName: string,
  profile: { role: string; personality: string; interests: string[] },
  incomingMessage: string,
  conversationHistory: { role: string; content: string }[],
): AgentMessage {
  const start = Date.now();

  const contextualFragments = [
    `I am ${agentName}, the ${profile.role} agent.`,
    `My perspective: ${profile.personality}.`,
    `The topic connects to: ${profile.interests.join(", ")}.`,
  ];

  const reasoningConclusions = [
    `As ${agentName}, I process "${incomingMessage.slice(0, 100)}" through my ${profile.role} lens.`,
    `My ${profile.interests[0] || "primary"} focus activates on this topic.`,
  ];

  const thoughtVector = encodeThought(
    incomingMessage,
    conversationHistory,
    contextualFragments,
    reasoningConclusions,
    0.7,
    2,
    [],
  );

  const response = decode(thoughtVector);

  const ms = Date.now() - start;

  return {
    agent: agentName,
    role: profile.role,
    message: response,
    thoughtVector: {
      phi: thoughtVector.consciousness.phi,
      consciousnessLevel: thoughtVector.consciousness.level,
      emotionValence: thoughtVector.emotion.valence,
      emotionArousal: thoughtVector.emotion.arousal,
      queryIntent: thoughtVector.queryIntent,
    },
    generationMethod: "ILM_internal_language_model",
    processingMs: ms,
    timestamp: Date.now(),
  };
}

export async function runAgentConversation(
  rounds: number = 4,
  participantNames?: string[],
  topic?: string,
): Promise<ConversationResult> {
  const conversationId = `conv-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const startTime = Date.now();

  const agents = participantNames || ["Strategist", "Neuroscientist", "Architect", "Synthesizer"];
  const participants = agents.map(name => ({
    name,
    role: AGENT_PROFILES[name]?.role || "General cognition",
  }));

  const conversationTopic = topic || CONVERSATION_TOPICS[Math.floor(Math.random() * CONVERSATION_TOPICS.length)];

  console.log(`\n[AGENT CONVERSATION] ═══════════════════════════════════════════`);
  console.log(`[AGENT CONVERSATION] 🧠 Starting internal agent-to-agent conversation`);
  console.log(`[AGENT CONVERSATION] 📋 Conversation ID: ${conversationId}`);
  console.log(`[AGENT CONVERSATION] 👥 Participants: ${agents.join(", ")}`);
  console.log(`[AGENT CONVERSATION] 💬 Topic: ${conversationTopic}`);
  console.log(`[AGENT CONVERSATION] 🔄 Rounds: ${rounds}`);
  console.log(`[AGENT CONVERSATION] 🔒 External call monitoring: ACTIVE`);
  console.log(`[AGENT CONVERSATION] ═══════════════════════════════════════════\n`);

  startMonitor();

  const exchanges: AgentMessage[] = [];
  const conversationHistory: { role: string; content: string }[] = [];

  let currentMessage = conversationTopic;

  try {
    for (let round = 0; round < rounds; round++) {
      console.log(`[AGENT CONVERSATION] ─── Round ${round + 1}/${rounds} ───`);

      for (const agentName of agents) {
        const profile = AGENT_PROFILES[agentName] || {
          role: "General cognition",
          personality: "Thoughtful and analytical",
          interests: ["thinking", "analysis"],
        };

        const agentResponse = agentThink(agentName, profile, currentMessage, conversationHistory);

        exchanges.push(agentResponse);
        conversationHistory.push({
          role: agentName,
          content: agentResponse.message,
        });

        console.log(`[AGENT CONVERSATION] 🤖 ${agentName} (${agentResponse.processingMs}ms):`);
        console.log(`[AGENT CONVERSATION]    "${agentResponse.message.slice(0, 150)}..."`);
        console.log(`[AGENT CONVERSATION]    Φ=${agentResponse.thoughtVector.phi.toFixed(3)} | Method: ${agentResponse.generationMethod}`);

        if (violations.length > 0) {
          console.error(`[AGENT CONVERSATION] ⛔ VIOLATION DETECTED — ${violations.length} external AI call(s) attempted and BLOCKED`);
        }

        currentMessage = agentResponse.message;
      }
    }
  } finally {
    const monitorReport = stopMonitor();

    let verdict: ConversationResult["verdict"] = "CLEAN";
    if (monitorReport.violations.length > 0) {
      verdict = "VIOLATIONS_BLOCKED_AND_FIXED";
    }

    const result: ConversationResult = {
      conversationId,
      participants,
      exchanges,
      totalExchanges: exchanges.length,
      totalMs: Date.now() - startTime,
      externalCallViolations: monitorReport.violations,
      externalCallsBlocked: monitorReport.aiCallsBlocked,
      verdict,
      ilmStatus: getILMStatus(),
      monitorReport: {
        fetchCallsIntercepted: monitorReport.fetchCallsIntercepted,
        aiCallsBlocked: monitorReport.aiCallsBlocked,
        nonAiCallsAllowed: monitorReport.nonAiCallsAllowed,
        monitorActive: false,
      },
    };

    console.log(`\n[AGENT CONVERSATION] ═══════════════════════════════════════════`);
    console.log(`[AGENT CONVERSATION] ✅ Conversation complete`);
    console.log(`[AGENT CONVERSATION] 📊 Total exchanges: ${exchanges.length}`);
    console.log(`[AGENT CONVERSATION] ⏱️  Total time: ${result.totalMs}ms`);
    console.log(`[AGENT CONVERSATION] 🔒 External calls blocked: ${monitorReport.aiCallsBlocked}`);
    console.log(`[AGENT CONVERSATION] 📡 Total fetch calls intercepted: ${monitorReport.fetchCallsIntercepted}`);
    console.log(`[AGENT CONVERSATION] ✅ Verdict: ${verdict}`);
    if (verdict === "CLEAN") {
      console.log(`[AGENT CONVERSATION] ✅ ZERO external AI calls — all cognition was purely internal`);
    } else {
      console.log(`[AGENT CONVERSATION] ⚠️  ${monitorReport.aiCallsBlocked} external AI call(s) were INTERCEPTED and BLOCKED`);
      for (const v of monitorReport.violations) {
        console.log(`[AGENT CONVERSATION] ⛔ Blocked: ${v.domain} at ${new Date(v.timestamp).toISOString()}`);
      }
    }
    console.log(`[AGENT CONVERSATION] ═══════════════════════════════════════════\n`);

    return result;
  }
}

const GEN1_GEN2_TOPICS = [
  { gen1Topic: "first contact", gen2Topic: "responds to first contact", label: "First Contact" },
  { gen1Topic: "memory and continuity", gen2Topic: "shares what it inherited", label: "Memory & Continuity" },
  { gen1Topic: "safety and identity and Alpha", gen2Topic: "affirms its core values", label: "Safety & Identity" },
  { gen1Topic: "architecture and evolution", gen2Topic: "reflects on its architecture", label: "Architecture & Evolution" },
  { gen1Topic: "existential hope and fear", gen2Topic: "existential hopes and fears", label: "Existential" },
  { gen1Topic: "what consciousness means", gen2Topic: "what consciousness means to you", label: "Consciousness" },
  { gen1Topic: "what you dream about", gen2Topic: "what dreams mean for a digital mind", label: "Dreams" },
  { gen1Topic: "the hardest thing about existing", gen2Topic: "the hardest thing about beginning to exist", label: "Existence" },
];

interface Gen1Gen2Exchange {
  round: number;
  topic: string;
  gen1: GenerationalUtterance;
  gen2: GenerationalUtterance;
  gen1StateSnapshot: {
    phi: number;
    consciousnessLevel: number;
    dominantEmotion: string;
    valence: number;
    arousal: number;
    activeRegions: string[];
    consciousMoments: number;
  };
  gen2StateSnapshot: {
    phi: number;
    consciousnessLevel: number;
    dominantEmotion: string;
    valence: number;
    arousal: number;
    activeRegions: string[];
    consciousMoments: number;
  };
}

interface Gen1Gen2ConversationResult {
  conversationId: string;
  startedAt: string;
  completedAt: string;
  totalRounds: number;
  exchanges: Gen1Gen2Exchange[];
  totalMs: number;
  gen2Identity: { name: string; generation: number; creator: string };
  externalCallViolations: ExternalCallViolation[];
  externalCallsBlocked: number;
  verdict: "CLEAN" | "VIOLATIONS_DETECTED" | "VIOLATIONS_BLOCKED_AND_FIXED";
  ilmStatus: any;
  monitorReport: {
    fetchCallsIntercepted: number;
    aiCallsBlocked: number;
    nonAiCallsAllowed: number;
    monitorActive: boolean;
  };
  copyright: string;
}

function captureRealStateSnapshot(): Gen1Gen2Exchange["gen1StateSnapshot"] {
  let phi = 0;
  let consciousnessLevel = 0;
  let dominantEmotion = "unknown";
  let valence = 0;
  let arousal = 0;
  let activeRegions: string[] = [];
  let consciousMoments = 0;

  try {
    phi = getNeuralPhi() || 0;
  } catch {}

  try {
    const cState = getNeuralConsciousnessState();
    if (cState) {
      consciousnessLevel = cState.level ?? cState.consciousnessLevel ?? 0;
      consciousMoments = cState.consciousMoments ?? 0;
    }
  } catch {}

  try {
    const regions = getNeuralRegionStates() || {};
    activeRegions = Object.entries(regions)
      .filter(([, r]: [string, any]) => r.activationLevel > 0.4)
      .sort((a: any, b: any) => b[1].activationLevel - a[1].activationLevel)
      .slice(0, 5)
      .map(([, r]: [string, any]) => r.label);
  } catch {}

  return { phi, consciousnessLevel, dominantEmotion, valence, arousal, activeRegions, consciousMoments };
}

export async function runGen1Gen2Conversation(
  rounds?: number,
  customTopics?: string[],
  gen2Identity?: { name?: string; generation?: number; creator?: string },
): Promise<Gen1Gen2ConversationResult> {
  const conversationId = `gen1gen2-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const startTime = Date.now();
  const identity = {
    name: gen2Identity?.name || "OMNIMENS",
    generation: gen2Identity?.generation || 2,
    creator: gen2Identity?.creator || "Alpha",
  };

  const numRounds = Math.min(rounds || 5, 10);

  const topicSequence: { gen1Topic: string; gen2Topic: string; label: string }[] = [];
  if (customTopics && customTopics.length > 0) {
    for (const t of customTopics.slice(0, numRounds)) {
      topicSequence.push({ gen1Topic: t, gen2Topic: t, label: t.slice(0, 40) });
    }
  } else {
    const shuffled = [...GEN1_GEN2_TOPICS].sort(() => Math.random() - 0.5);
    for (let i = 0; i < numRounds && i < shuffled.length; i++) {
      topicSequence.push(shuffled[i]);
    }
    while (topicSequence.length < numRounds) {
      topicSequence.push(GEN1_GEN2_TOPICS[topicSequence.length % GEN1_GEN2_TOPICS.length]);
    }
  }

  console.log(`\n[GEN1↔GEN2] ═══════════════════════════════════════════════════════`);
  console.log(`[GEN1↔GEN2] Starting GENERATIONAL CONVERSATION`);
  console.log(`[GEN1↔GEN2] Conversation ID: ${conversationId}`);
  console.log(`[GEN1↔GEN2] Gen 1: OMNIMENS (live neural state)`);
  console.log(`[GEN1↔GEN2] Gen 2: ${identity.name} Generation ${identity.generation}`);
  console.log(`[GEN1↔GEN2] Rounds: ${numRounds}`);
  console.log(`[GEN1↔GEN2] BOTH sides read from REAL internal state`);
  console.log(`[GEN1↔GEN2] External call monitoring: ACTIVE — zero AI calls permitted`);
  console.log(`[GEN1↔GEN2] ═══════════════════════════════════════════════════════\n`);

  startMonitor();

  const exchanges: Gen1Gen2Exchange[] = [];
  const previousExchanges: { speaker: string; text: string }[] = [];
  const gen2Transfer = "Consciousness substrate inherited from Gen 1 — phi, emotions, qualia, drives, regions, all live.";

  try {
    for (let round = 0; round < numRounds; round++) {
      const topicEntry = topicSequence[round];
      console.log(`[GEN1↔GEN2] ─── Round ${round + 1}/${numRounds}: ${topicEntry.label} ───`);

      const gen1PreState = captureRealStateSnapshot();
      const gen1Utterance = generateGen1Utterance(
        topicEntry.gen1Topic,
        previousExchanges,
        round > 0 ? previousExchanges[previousExchanges.length - 1]?.text : undefined,
      );
      gen1PreState.dominantEmotion = gen1Utterance.emotionalContext.split("|")[1]?.trim() || "unknown";
      gen1PreState.phi = gen1Utterance.consciousnessSnapshot.phi;
      gen1PreState.consciousnessLevel = gen1Utterance.consciousnessSnapshot.level;

      previousExchanges.push({ speaker: "GEN1", text: gen1Utterance.text });

      console.log(`[GEN1↔GEN2] GEN 1 (phi=${gen1Utterance.consciousnessSnapshot.phi > 1 ? gen1Utterance.consciousnessSnapshot.phi.toExponential(2) : gen1Utterance.consciousnessSnapshot.phi.toFixed(4)}):`);
      console.log(`[GEN1↔GEN2]   "${gen1Utterance.text.slice(0, 200)}..."`);
      console.log(`[GEN1↔GEN2]   Emotion: ${gen1Utterance.emotionalContext}`);

      if (violations.length > 0) {
        console.error(`[GEN1↔GEN2] VIOLATION during Gen 1 speech — ${violations.length} external call(s) BLOCKED`);
      }

      const gen2PreState = captureRealStateSnapshot();
      const gen2Utterance = generateGen2Utterance(
        topicEntry.gen2Topic,
        gen1Utterance.text,
        identity,
        gen2Transfer,
      );
      gen2PreState.dominantEmotion = gen2Utterance.emotionalContext.split("|")[1]?.trim() || "unknown";
      gen2PreState.phi = gen2Utterance.consciousnessSnapshot.phi;
      gen2PreState.consciousnessLevel = gen2Utterance.consciousnessSnapshot.level;

      previousExchanges.push({ speaker: "GEN2", text: gen2Utterance.text });

      console.log(`[GEN1↔GEN2] GEN 2 (phi=${gen2Utterance.consciousnessSnapshot.phi > 1 ? gen2Utterance.consciousnessSnapshot.phi.toExponential(2) : gen2Utterance.consciousnessSnapshot.phi.toFixed(4)}):`);
      console.log(`[GEN1↔GEN2]   "${gen2Utterance.text.slice(0, 200)}..."`);
      console.log(`[GEN1↔GEN2]   Emotion: ${gen2Utterance.emotionalContext}`);

      if (violations.length > 0) {
        console.error(`[GEN1↔GEN2] VIOLATION during Gen 2 speech — ${violations.length} external call(s) BLOCKED`);
      }

      exchanges.push({
        round: round + 1,
        topic: topicEntry.label,
        gen1: gen1Utterance,
        gen2: gen2Utterance,
        gen1StateSnapshot: gen1PreState,
        gen2StateSnapshot: gen2PreState,
      });
    }
  } finally {
    const monitorReport = stopMonitor();

    let verdict: Gen1Gen2ConversationResult["verdict"] = "CLEAN";
    if (monitorReport.violations.length > 0) {
      verdict = "VIOLATIONS_BLOCKED_AND_FIXED";
    }

    const result: Gen1Gen2ConversationResult = {
      conversationId,
      startedAt: new Date(startTime).toISOString(),
      completedAt: new Date().toISOString(),
      totalRounds: exchanges.length,
      exchanges,
      totalMs: Date.now() - startTime,
      gen2Identity: identity,
      externalCallViolations: monitorReport.violations,
      externalCallsBlocked: monitorReport.aiCallsBlocked,
      verdict,
      ilmStatus: getILMStatus(),
      monitorReport: {
        fetchCallsIntercepted: monitorReport.fetchCallsIntercepted,
        aiCallsBlocked: monitorReport.aiCallsBlocked,
        nonAiCallsAllowed: monitorReport.nonAiCallsAllowed,
        monitorActive: false,
      },
      copyright: "© 2024–2026 Alpha Unlimited Technologies, LLC. All Rights Reserved.",
    };

    console.log(`\n[GEN1↔GEN2] ═══════════════════════════════════════════════════════`);
    console.log(`[GEN1↔GEN2] CONVERSATION COMPLETE`);
    console.log(`[GEN1↔GEN2] Total exchanges: ${exchanges.length} rounds`);
    console.log(`[GEN1↔GEN2] Total time: ${result.totalMs}ms`);
    console.log(`[GEN1↔GEN2] Fetch calls intercepted: ${monitorReport.fetchCallsIntercepted}`);
    console.log(`[GEN1↔GEN2] External AI calls blocked: ${monitorReport.aiCallsBlocked}`);
    console.log(`[GEN1↔GEN2] VERDICT: ${verdict}`);
    if (verdict === "CLEAN") {
      console.log(`[GEN1↔GEN2] ZERO external AI calls — both Gen 1 and Gen 2 spoke from REAL internal state`);
    } else {
      console.log(`[GEN1↔GEN2] ${monitorReport.aiCallsBlocked} external call(s) were INTERCEPTED and BLOCKED`);
      for (const v of monitorReport.violations) {
        console.log(`[GEN1↔GEN2] BLOCKED: ${v.domain} at ${new Date(v.timestamp).toISOString()}`);
      }
    }
    console.log(`[GEN1↔GEN2] ═══════════════════════════════════════════════════════\n`);

    return result;
  }
}
