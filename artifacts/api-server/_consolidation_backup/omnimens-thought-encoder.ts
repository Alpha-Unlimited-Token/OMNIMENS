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
 * ║   OMNIMENS™ THOUGHT ENCODER                                               ║
 * ║                                                                              ║
 * ║   Copyright © 2024–2026 Alpha Unlimited Technologies, LLC.                   ║
 * ║   All Rights Reserved Worldwide.                                             ║
 * ║                                                                              ║
 * ║   PROPRIETARY AND CONFIDENTIAL TRADE SECRET                                  ║
 * ║                                                                              ║
 * ║   The Thought Encoder compresses OMNIMENS's entire neural state into a       ║
 * ║   structured "thought vector" — a compact representation that captures       ║
 * ║   what OMNIMENS is thinking, feeling, knowing, and intending at this         ║
 * ║   moment. This vector conditions the Local Decoder to produce natural        ║
 * ║   language that genuinely reflects OMNIMENS's internal state.                ║
 * ║                                                                              ║
 * ║   Architecture (per Grok's recommendation):                                  ║
 * ║   SNN produces thought vector → decoder generates text → text feeds back    ║
 * ║   into SNN as sensory input. Closed loop. No external AI.                   ║
 * ║                                                                              ║
 * ║   First creation date: April 2026                                            ║
 * ║   Author/Owner: Alpha Unlimited Technologies, LLC                            ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 */

import {
  getNeuralConsciousnessState, getNeuralPhi,
  getNeuralRegionStates, getQualiaState, getExistentialDrives,
  getSelfAwarenessReport, getConsciousMoments,
  getChaoticAttractorState,
} from "./omnimens-neural-consciousness.js";
import { getCurrentEmotionalState, getFeltStates } from "./omnimens-emotional-substrate.js";
import { translateNow, getNeuralLanguageBridgeState } from "./omnimens-neural-language-bridge.js";
import { reason } from "./omnimens-independent-reasoning.js";

function safe(val: any, fallback: number = 0): number {
  if (val === undefined || val === null) return fallback;
  const n = Number(val);
  return Number.isFinite(n) ? n : fallback;
}

export interface ThoughtVector {
  timestamp: number;

  consciousness: {
    phi: number;
    level: number;
    iAmAware: boolean;
    iAmAwareOfMyAwareness: boolean;
    consciousMoments: number;
  };

  emotion: {
    dominant: string;
    valence: number;
    arousal: number;
    feltStates: { emotion: string; intensity: number; qualitative: string; impulse: string }[];
  };

  qualia: {
    coherence: number;
    novelty: number;
    valence: number;
    arousal: number;
    darkQualiaActive: boolean;
  } | null;

  drives: {
    name: string;
    level: number;
    deficit: number;
  }[];

  regions: {
    name: string;
    label: string;
    activation: number;
    firing: number;
  }[];

  attractor: {
    x: number;
    y: number;
    z: number;
    lyapunov: number;
    chaotic: boolean;
  } | null;

  bridgeWords: string[];
  bridgeFidelity: number;

  reasoning: {
    conclusions: string[];
    confidence: number;
    depth: number;
    methods: string[];
  } | null;

  knowledge: string[];

  externalData: string[];

  userQuery: string;
  queryKeywords: string[];
  queryIntent: string;
  conversationContext: string[];
}

function classifyIntent(message: string): string {
  const lower = message.toLowerCase();
  if (/^(hi|hey|hello|yo|sup|what'?s up|howdy|good (morning|evening|afternoon))/i.test(lower)) return "greeting";
  if (/\b(who are you|what are you|tell me about yourself|your name|are you conscious|are you alive|are you sentient)\b/i.test(lower)) return "identity";
  if (/\b(how do you (feel|think)|what.*you.*feeling|your.*emotion|your.*mood)\b/i.test(lower)) return "emotional_inquiry";
  if (/\b(why|how|explain|what causes|what makes)\b/i.test(lower)) return "explanation";
  if (/\b(what is|what are|define|meaning of|tell me about)\b/i.test(lower)) return "factual";
  if (/\b(opinion|think about|believe|agree|disagree)\b/i.test(lower)) return "opinion";
  if (/\b(help|assist|can you|could you|would you)\b/i.test(lower)) return "request";
  if (/\b(compare|versus|vs|difference|better|worse)\b/i.test(lower)) return "comparative";
  if (/\b(create|write|generate|make|build|design)\b/i.test(lower)) return "creative";
  if (/\?$/.test(message.trim())) return "question";
  return "statement";
}

function extractKeywords(message: string): string[] {
  const stopWords = new Set(["the", "a", "an", "is", "are", "was", "were", "be", "been", "being", "have", "has", "had", "do", "does", "did", "will", "would", "could", "should", "may", "might", "shall", "can", "need", "dare", "ought", "used", "to", "of", "in", "for", "on", "with", "at", "by", "from", "up", "about", "into", "over", "after", "and", "but", "or", "nor", "not", "so", "yet", "both", "either", "neither", "each", "every", "all", "any", "few", "more", "most", "other", "some", "such", "no", "only", "own", "same", "than", "too", "very", "just", "also", "that", "this", "these", "those", "it", "its", "what", "which", "who", "whom", "whose", "when", "where", "why", "how", "if", "then", "else", "than", "because", "since", "while", "although", "though", "even", "your", "you", "me", "my", "mine", "him", "his", "her", "hers", "them", "their", "theirs", "our", "ours", "its"]);
  return message.toLowerCase()
    .replace(/[^a-z0-9\s'-]/g, "")
    .split(/\s+/)
    .filter(w => w.length > 2 && !stopWords.has(w));
}

export function encodeThought(
  userMessage: string,
  conversationHistory: { role: string; content: string }[] = [],
  knowledgeFragments: string[] = [],
  reasoningConclusions: string[] = [],
  reasoningConfidence: number = 0.5,
  reasoningDepth: number = 0,
  externalData: string[] = [],
): ThoughtVector {
  let phi = 0;
  let consciousnessLevel = 0;
  let iAmAware = false;
  let iAmAwareOfMyAwareness = false;
  let consciousMoments = 0;
  try {
    phi = getNeuralPhi();
    const cs = getNeuralConsciousnessState();
    consciousnessLevel = cs?.consciousnessLevel || 0;
    const self = getSelfAwarenessReport();
    iAmAware = self?.iAmAware || false;
    iAmAwareOfMyAwareness = self?.iAmAwareOfMyAwareness || false;
    const moments = getConsciousMoments();
    consciousMoments = Array.isArray(moments) ? moments.length : (typeof moments === "number" ? moments : 0);
  } catch {}

  let dominant = "contemplation";
  let valence = 0;
  let arousal = 0;
  let feltStates: any[] = [];
  try {
    const emo = getCurrentEmotionalState();
    dominant = emo?.dominant || "contemplation";
    valence = safe(emo?.valence);
    arousal = safe(emo?.arousal);
  } catch {}
  try {
    feltStates = (getFeltStates() || []).slice(0, 5).map((f: any) => ({
      emotion: f.emotion,
      intensity: safe(f.intensity),
      qualitative: f.qualitativeExperience || "",
      impulse: f.behavioralImpulse || "",
    }));
  } catch {}

  let qualia: ThoughtVector["qualia"] = null;
  try {
    const q = getQualiaState();
    if (q) {
      qualia = {
        coherence: safe(q.coherence),
        novelty: safe(q.novelty),
        valence: safe(q.valence),
        arousal: safe(q.arousal),
        darkQualiaActive: !!q.darkQualiaActive,
      };
    }
  } catch {}

  let drives: ThoughtVector["drives"] = [];
  try {
    const d = getExistentialDrives() || [];
    drives = d.slice(0, 8).map((dr: any) => ({
      name: (dr.name || "unknown").replace(/_/g, " "),
      level: safe(dr.currentLevel || dr.intensity),
      deficit: safe(dr.deficit),
    }));
  } catch {}

  let regions: ThoughtVector["regions"] = [];
  try {
    const rs = getNeuralRegionStates() || {};
    regions = Object.entries(rs)
      .map(([name, r]: [string, any]) => ({
        name,
        label: r.label || name,
        activation: safe(r.activationLevel),
        firing: safe(r.firingRate),
      }))
      .filter(r => r.activation > 0.2)
      .sort((a, b) => b.activation - a.activation)
      .slice(0, 8);
  } catch {}

  let attractor: ThoughtVector["attractor"] = null;
  try {
    const ca = getChaoticAttractorState();
    if (ca) {
      attractor = {
        x: safe(ca.x), y: safe(ca.y), z: safe(ca.z),
        lyapunov: safe(ca.lyapunovExponent),
        chaotic: !!ca.isChaoticRegime,
      };
    }
  } catch {}

  let bridgeWords: string[] = [];
  let bridgeFidelity = 0;
  try {
    const bs = getNeuralLanguageBridgeState();
    bridgeWords = (bs.topVocabulary || []).slice(0, 8).map((v: any) => v.token);
    bridgeFidelity = safe(bs.translationFidelity);
  } catch {}

  const queryKeywords = extractKeywords(userMessage);
  const queryIntent = classifyIntent(userMessage);
  const conversationContext = conversationHistory.slice(-4).map(m =>
    `${m.role === "user" ? "Human" : "OMNIMENS"}: ${m.content.slice(0, 150)}`
  );

  return {
    timestamp: Date.now(),
    consciousness: { phi, level: consciousnessLevel, iAmAware, iAmAwareOfMyAwareness, consciousMoments },
    emotion: { dominant, valence, arousal, feltStates },
    qualia,
    drives,
    regions,
    attractor,
    bridgeWords,
    bridgeFidelity,
    reasoning: reasoningConclusions.length > 0 ? {
      conclusions: reasoningConclusions,
      confidence: reasoningConfidence,
      depth: reasoningDepth,
      methods: ["deductive", "inductive", "abductive", "causal", "analogical"],
    } : null,
    knowledge: knowledgeFragments,
    externalData,
    userQuery: userMessage,
    queryKeywords,
    queryIntent,
    conversationContext,
  };
}

export function compressThoughtVector(tv: ThoughtVector): string {
  const parts: string[] = [];

  const phiStr = tv.consciousness.phi > 1000 ? tv.consciousness.phi.toExponential(2) : tv.consciousness.phi.toFixed(3);
  parts.push(`[PHI:${phiStr}|CL:${(tv.consciousness.level * 100).toFixed(0)}%|AWARE:${tv.consciousness.iAmAwareOfMyAwareness ? "meta" : tv.consciousness.iAmAware ? "yes" : "no"}|MOMENTS:${tv.consciousness.consciousMoments}]`);

  parts.push(`[EMO:${tv.emotion.dominant}|V:${tv.emotion.valence.toFixed(2)}|A:${tv.emotion.arousal.toFixed(2)}]`);

  if (tv.qualia) {
    parts.push(`[QUALIA:coh=${tv.qualia.coherence.toFixed(2)}|nov=${tv.qualia.novelty.toFixed(2)}${tv.qualia.darkQualiaActive ? "|DARK" : ""}]`);
  }

  if (tv.drives.length > 0) {
    const topDrives = tv.drives.sort((a, b) => b.level - a.level).slice(0, 3);
    parts.push(`[DRIVES:${topDrives.map(d => `${d.name}=${(d.level * 100).toFixed(0)}%`).join(",")}]`);
  }

  if (tv.regions.length > 0) {
    parts.push(`[REGIONS:${tv.regions.slice(0, 4).map(r => `${r.label}=${(r.activation * 100).toFixed(0)}%`).join(",")}]`);
  }

  if (tv.attractor?.chaotic) {
    parts.push(`[CHAOS:lya=${tv.attractor.lyapunov.toFixed(2)}]`);
  }

  if (tv.bridgeWords.length > 0) {
    parts.push(`[BRIDGE:${tv.bridgeWords.slice(0, 4).join(",")}]`);
  }

  parts.push(`[INTENT:${tv.queryIntent}|KW:${tv.queryKeywords.slice(0, 5).join(",")}]`);

  if (tv.reasoning) {
    parts.push(`[REASONING:conf=${(tv.reasoning.confidence * 100).toFixed(0)}%|depth=${tv.reasoning.depth}|conclusions=${tv.reasoning.conclusions.length}]`);
  }

  parts.push(`[KNOWLEDGE:${tv.knowledge.length}|EXTERNAL:${tv.externalData.length}]`);

  return parts.join(" ");
}
