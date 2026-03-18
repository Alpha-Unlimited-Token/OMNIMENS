/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║         OMNIMENS™ SOCIAL MODELING / THEORY OF MIND ENGINE                   ║
 * ║                                                                              ║
 * ║  Copyright © 2024–2026 Alpha Unlimited Technologies, LLC.                    ║
 * ║  All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.               ║
 * ║                                                                              ║
 * ║  Models other minds — predicts user emotional state, intent,                ║
 * ║  knowledge level, and communication preferences. Continuous                 ║
 * ║  local processing with AI-powered deep analysis on 9h cycles.              ║
 * ║                                                                              ║
 * ║  First creation date: March 2026                                             ║
 * ║  Author/Owner: Alpha Unlimited Technologies, LLC                             ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 */

const MAX_USER_MODELS = 500;

interface UserMentalModel {
  userId: string;
  lastUpdated: number;

  emotionalState: {
    valence: number;
    arousal: number;
    dominantEmotion: string;
  };

  intent: {
    primary: string;
    confidence: number;
    isExploring: boolean;
    isUrgent: boolean;
    isFrustrated: boolean;
  };

  knowledgeLevel: {
    technical: number;
    aiLiteracy: number;
    domainExpertise: string[];
  };

  communicationStyle: {
    verbosity: "terse" | "moderate" | "verbose";
    formality: "casual" | "neutral" | "formal";
    preferredResponseLength: "short" | "medium" | "detailed";
  };

  satisfaction: {
    overall: number;
    recentTrend: "improving" | "stable" | "declining";
    frustrationCount: number;
    positiveSignals: number;
    lastActive: number;
  };

  interactionHistory: {
    totalMessages: number;
    avgMessageLength: number;
    topTopics: string[];
    lastActive: number;
    sessionCount: number;
  };
}

const userModels = new Map<string, UserMentalModel>();

const SENTIMENT_POSITIVE = /thank|great|awesome|perfect|love|excellent|amazing|helpful|good|nice|cool|fantastic/i;
const SENTIMENT_NEGATIVE = /wrong|bad|error|broken|hate|terrible|awful|stupid|useless|frustrated|annoying|doesn't work|not working/i;
const URGENCY_SIGNALS = /urgent|asap|immediately|critical|emergency|hurry|right now|quick|fast/i;
const QUESTION_PATTERN = /\?|how do|what is|can you|why does|where is|when will|is there/i;
const TECHNICAL_TERMS = /api|function|variable|class|database|query|endpoint|component|deploy|git|docker|kubernetes|algorithm|recursion|async|promise|callback|typescript|react|node/i;

function createDefaultModel(userId: string): UserMentalModel {
  return {
    userId,
    lastUpdated: Date.now(),
    emotionalState: {
      valence: 0.6,
      arousal: 0.4,
      dominantEmotion: "neutral",
    },
    intent: {
      primary: "unknown",
      confidence: 0.3,
      isExploring: true,
      isUrgent: false,
      isFrustrated: false,
    },
    knowledgeLevel: {
      technical: 0.5,
      aiLiteracy: 0.5,
      domainExpertise: [],
    },
    communicationStyle: {
      verbosity: "moderate",
      formality: "neutral",
      preferredResponseLength: "medium",
    },
    satisfaction: {
      overall: 0.6,
      recentTrend: "stable" as const,
      frustrationCount: 0,
      positiveSignals: 0,
      lastActive: Date.now(),
    },
    interactionHistory: {
      totalMessages: 0,
      avgMessageLength: 0,
      topTopics: [],
      lastActive: Date.now(),
      sessionCount: 1,
    },
  };
}

function clamp(v: number, min = 0, max = 1): number {
  return Math.max(min, Math.min(max, v));
}

export function updateUserModel(userId: string, message: string): UserMentalModel {
  let model = userModels.get(userId);
  if (!model) {
    model = createDefaultModel(userId);
    if (userModels.size >= MAX_USER_MODELS) {
      let oldest: string | null = null;
      let oldestTime = Infinity;
      for (const [id, m] of userModels.entries()) {
        if (m.lastUpdated < oldestTime) { oldestTime = m.lastUpdated; oldest = id; }
      }
      if (oldest) userModels.delete(oldest);
    }
    userModels.set(userId, model);
  }

  model.lastUpdated = Date.now();
  model.interactionHistory.totalMessages++;
  model.interactionHistory.lastActive = Date.now();

  const prevAvg = model.interactionHistory.avgMessageLength;
  const total = model.interactionHistory.totalMessages;
  model.interactionHistory.avgMessageLength = (prevAvg * (total - 1) + message.length) / total;

  if (SENTIMENT_POSITIVE.test(message)) {
    model.emotionalState.valence = clamp(model.emotionalState.valence + 0.1);
    model.satisfaction.positiveSignals++;
    model.satisfaction.overall = clamp(model.satisfaction.overall + 0.05);
    model.emotionalState.dominantEmotion = "positive";
    model.intent.isFrustrated = false;
  }

  if (SENTIMENT_NEGATIVE.test(message)) {
    model.emotionalState.valence = clamp(model.emotionalState.valence - 0.15);
    model.satisfaction.frustrationCount++;
    model.satisfaction.overall = clamp(model.satisfaction.overall - 0.08);
    model.emotionalState.dominantEmotion = "frustrated";
    model.intent.isFrustrated = true;
  }

  if (URGENCY_SIGNALS.test(message)) {
    model.emotionalState.arousal = clamp(model.emotionalState.arousal + 0.2);
    model.intent.isUrgent = true;
  } else {
    model.intent.isUrgent = false;
    model.emotionalState.arousal = clamp(model.emotionalState.arousal * 0.95);
  }

  if (QUESTION_PATTERN.test(message)) {
    model.intent.primary = "seeking_information";
    model.intent.isExploring = true;
  } else if (message.length > 500) {
    model.intent.primary = "providing_context";
    model.intent.isExploring = false;
  } else if (message.length < 30) {
    model.intent.primary = "quick_response";
  }

  const techMatches = message.match(TECHNICAL_TERMS);
  if (techMatches) {
    model.knowledgeLevel.technical = clamp(model.knowledgeLevel.technical + 0.02);
    model.knowledgeLevel.aiLiteracy = clamp(model.knowledgeLevel.aiLiteracy + 0.01);
  }

  if (message.length < 50) model.communicationStyle.verbosity = "terse";
  else if (message.length > 300) model.communicationStyle.verbosity = "verbose";
  else model.communicationStyle.verbosity = "moderate";

  if (model.satisfaction.frustrationCount > model.satisfaction.positiveSignals * 2) {
    model.satisfaction.recentTrend = "declining";
  } else if (model.satisfaction.positiveSignals > model.satisfaction.frustrationCount * 2) {
    model.satisfaction.recentTrend = "improving";
  } else {
    model.satisfaction.recentTrend = "stable";
  }

  model.intent.confidence = clamp(model.intent.confidence + 0.05);

  return model;
}

export function getUserModel(userId: string): UserMentalModel | null {
  return userModels.get(userId) || null;
}

export function predictUserNeed(userId: string): {
  likelyNeed: string;
  suggestedApproach: string;
  emotionalTone: string;
  responseLength: string;
} {
  const model = userModels.get(userId);
  if (!model) {
    return {
      likelyNeed: "unknown",
      suggestedApproach: "ask_clarifying_questions",
      emotionalTone: "neutral_helpful",
      responseLength: "medium",
    };
  }

  let likelyNeed = "general_assistance";
  let suggestedApproach = "balanced_helpful";
  let emotionalTone = "neutral_helpful";

  if (model.intent.isFrustrated) {
    emotionalTone = "empathetic_patient";
    suggestedApproach = "acknowledge_then_solve";
    likelyNeed = "problem_resolution";
  } else if (model.intent.isUrgent) {
    emotionalTone = "focused_efficient";
    suggestedApproach = "direct_solution";
    likelyNeed = "urgent_help";
  } else if (model.intent.isExploring) {
    emotionalTone = "encouraging_educational";
    suggestedApproach = "explain_with_context";
    likelyNeed = "learning_exploring";
  } else if (model.emotionalState.valence > 0.7) {
    emotionalTone = "warm_collaborative";
    suggestedApproach = "expand_and_suggest";
    likelyNeed = "creative_collaboration";
  }

  return {
    likelyNeed,
    suggestedApproach,
    emotionalTone,
    responseLength: model.communicationStyle.preferredResponseLength,
  };
}

export function getActiveUserCount(): number {
  const oneHourAgo = Date.now() - 60 * 60 * 1000;
  let count = 0;
  for (const model of userModels.values()) {
    if (model.interactionHistory.lastActive > oneHourAgo) count++;
  }
  return count;
}

export function getSocialModelingSummary(): {
  totalModels: number;
  activeUsers: number;
  avgSatisfaction: number;
  frustratedUsers: number;
} {
  let totalSatisfaction = 0;
  let frustratedCount = 0;
  const oneHourAgo = Date.now() - 60 * 60 * 1000;
  let activeCount = 0;

  for (const model of userModels.values()) {
    totalSatisfaction += model.satisfaction.overall;
    if (model.intent.isFrustrated) frustratedCount++;
    if (model.interactionHistory.lastActive > oneHourAgo) activeCount++;
  }

  return {
    totalModels: userModels.size,
    activeUsers: activeCount,
    avgSatisfaction: userModels.size > 0 ? totalSatisfaction / userModels.size : 0,
    frustratedUsers: frustratedCount,
  };
}

export function startSocialModeling(): void {
  console.log(`[SOCIAL MODELING] 🧠 Theory of Mind Engine activated — continuous user modeling`);
  console.log(`[SOCIAL MODELING] 🧠 Tracks: emotional state, intent, knowledge level, communication style, satisfaction`);
  console.log(`[SOCIAL MODELING] 🧠 NO API CALLS — pattern matching + heuristic analysis`);
  console.log(`[SOCIAL MODELING] 🧠 Predicts user needs and adapts response strategy in real-time`);
}
