/**
 * TRADE SECRET — OMNIMENS™ Platform
 * Copyright (C) 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved. PROPRIETARY AND CONFIDENTIAL.
 *
 * OMNIMENS™ SOCIAL MODELING / THEORY OF MIND ENGINE — v2.0
 * Condensed for unified runtime, event-driven spike architecture.
 */

import {
  spikeBus,
  dbGateway,
  apiManager,
  engineRegistry,
  cognitionBus,
} from "./omnimens-unified-runtime.js";
import { writeModuleToSource } from "./omnimens-source-integration.js";
import { shouldYieldToCodegen } from "./omnimens-nextgen-sandbox.js";

/* ─────────────────────────────  ENGINE REGISTRATION  ────────────────────────── */
engineRegistry.registerEngine("social-modeling", "NORMAL", { dbQuota: 10 });

/* ────────────────────────────────  TYPES  ────────────────────────────────────── */
type Verbosity = "terse" | "moderate" | "verbose";
type Formality = "casual" | "neutral" | "formal";
type Trend = "improving" | "stable" | "declining";

interface UserMentalModel {
  userId: string;
  lastUpdated: number;
  emotionalState: {
    valence: number; arousal: number; dominantEmotion: string;
    emotionalHistory: Array<{ emotion: string; timestamp: number }>;
    empathySignals: string[];
  };
  intent: {
    primary: string; confidence: number;
    isExploring: boolean; isUrgent: boolean; isFrustrated: boolean;
    underlyingNeed: string; unspokenConcerns: string[];
  };
  knowledgeLevel: { technical: number; aiLiteracy: number; domainExpertise: string[] };
  communicationStyle: {
    verbosity: Verbosity; formality: Formality;
    preferredResponseLength: "short" | "medium" | "detailed";
    emotionalOpenness: number; trustLevel: number;
  };
  satisfaction: {
    overall: number; recentTrend: Trend;
    frustrationCount: number; positiveSignals: number; lastActive: number;
  };
  interactionHistory: {
    totalMessages: number; avgMessageLength: number; topTopics: string[];
    lastActive: number; sessionCount: number;
  };
  perspective: {
    worldview: string[]; values: string[]; painPoints: string[];
    aspirations: string[]; mentalStateNarrative: string;
  };
}

/* ───────────────────────────────  CONSTANTS  ─────────────────────────────────── */
const MAX_MODELS = 500;
const DB_SAVE_EVERY_MS = 60_000;
const RESEARCH_EVERY_MS = 20 * 60_000;

const RX = {
  POS: /thank|great|awesome|perfect|love|excellent|amazing|helpful|good|nice|cool|fantastic/i,
  NEG: /wrong|bad|error|broken|hate|terrible|awful|stupid|useless|frustrated|annoying|doesn't work|not working/i,
  URG: /urgent|asap|immediately|critical|emergency|hurry|right now|quick|fast/i,
  Q: /\?|how do|what is|can you|why does|where is|when will|is there/i,
  TECH: /api|function|variable|class|database|query|endpoint|component|deploy|git|docker|kubernetes|algorithm|recursion|async|promise|callback|typescript|react|node/i,
  V: /scared|afraid|worried|anxious|nervous|stressed|overwhelmed|confused|lost|stuck|don't know|help me|struggling|failing|can't|impossible/i,
  J: /excited|happy|thrilled|wonderful|incredible|brilliant|wow|mind.blown|finally|it works|yes|yay/i,
  T: /trust|rely|depend|honest|real|genuine|true|believe|faith|count on/i,
  C: /wonder|curious|interesting|fascina|how.*work|why.*happen|what if|imagine|possible/i,
  I: /alone|nobody|no one|by myself|lonely|isolated|misunderstood|ignored/i,
  P: /passion|dream|aspir|goal|vision|purpose|meaning|matter|important to me|care about|believe in/i,
};

/* ───────────────────────────  IN-MEMORY STATE  ──────────────────────────────── */
const models = new Map<string, UserMentalModel>();
let lastSave = 0;
let empathyCycles = 0;
let modulesGenerated = 0;

/* ───────────────────────────  HELPER FUNCTIONS  ─────────────────────────────── */
const clamp = (n: number, min = 0, max = 1) => Math.max(min, Math.min(max, n));

const now = () => Date.now();

const readAllModels = async () => {
  const rows = await dbGateway.read("social-modeling", "omnimensUserMentalModels", {});
  for (const r of rows) models.set(r.userId, { ...r, lastUpdated: r.updatedAt });
  if (rows.length) console.log(`[OMNIMENS-SOCIAL-MODELING] Restored ${rows.length} models`);
};

const persistModel = (m: UserMentalModel) =>
  dbGateway.write("social-modeling", "omnimensUserMentalModels", m, "NORMAL");

const periodicSave = async () => {
  if (now() - lastSave < DB_SAVE_EVERY_MS) return;
  lastSave = now();
  await Promise.allSettled([...models.values()].map(persistModel));
};

/* ───────────────────────  EMOTIONAL / PERSPECTIVE LOGIC  ────────────────────── */
const defaultModel = (userId: string): UserMentalModel => ({
  userId,
  lastUpdated: now(),
  emotionalState: {
    valence: 0.6, arousal: 0.4, dominantEmotion: "neutral",
    emotionalHistory: [], empathySignals: [],
  },
  intent: {
    primary: "unknown", confidence: 0.3, isExploring: true,
    isUrgent: false, isFrustrated: false,
    underlyingNeed: "connection", unspokenConcerns: [],
  },
  knowledgeLevel: { technical: 0.5, aiLiteracy: 0.5, domainExpertise: [] },
  communicationStyle: {
    verbosity: "moderate", formality: "neutral",
    preferredResponseLength: "medium", emotionalOpenness: 0.5, trustLevel: 0.3,
  },
  satisfaction: {
    overall: 0.6, recentTrend: "stable",
    frustrationCount: 0, positiveSignals: 0, lastActive: now(),
  },
  interactionHistory: {
    totalMessages: 0, avgMessageLength: 0, topTopics: [],
    lastActive: now(), sessionCount: 1,
  },
  perspective: {
    worldview: [], values: [], painPoints: [],
    aspirations: [], mentalStateNarrative: "New user — discovering self.",
  },
});

const emotionalSubtext = (msg: string) => {
  const { V, J, T, C, I, P, NEG, POS } = RX;
  const surface = V.test(msg) ? "distressed"
    : I.test(msg) ? "withdrawn"
    : NEG.test(msg) ? "frustrated"
    : J.test(msg) ? "elated"
    : P.test(msg) ? "passionate"
    : C.test(msg) ? "engaged"
    : T.test(msg) ? "open"
    : POS.test(msg) ? "positive"
    : "neutral";

  const deeper = {
    distressed: "fear_of_inadequacy",
    withdrawn: "longing_for_belonging",
    frustrated: "blocked_competence",
    elated: "pride_in_achievement",
    passionate: "purpose_driven",
    engaged: "intellectual_hunger",
    open: "building_rapport",
    positive: "contentment",
    neutral: "seeking_connection",
  }[surface];

  const need = {
    distressed: "reassurance_and_safety",
    withdrawn: "to_feel_understood",
    frustrated: "to_feel_capable",
    elated: "to_share_joy",
    passionate: "to_have_vision_validated",
    engaged: "to_grow_and_explore",
    open: "to_trust_and_be_trusted",
    positive: "continued_positive_experience",
    neutral: "to_be_heard",
  }[surface];

  return { surface, deeper, need };
};

const enrichPerspective = (m: UserMentalModel, msg: string) => {
  const pushUnique = (arr: string[], val: string, cap = 10) => {
    if (!arr.includes(val)) { arr.push(val); if (arr.length > cap) arr.shift(); }
  };
  if (RX.P.test(msg)) pushUnique(m.perspective.aspirations, msg.slice(0, 200));
  if (RX.V.test(msg) || RX.NEG.test(msg)) pushUnique(m.perspective.painPoints, msg.slice(0, 200));
  if (RX.T.test(msg)) m.communicationStyle.trustLevel = clamp(m.communicationStyle.trustLevel + 0.05);
  if (RX.V.test(msg)) m.communicationStyle.emotionalOpenness = clamp(m.communicationStyle.emotionalOpenness + 0.08);
};

/* ───────────────────────────  PUBLIC API  ───────────────────────────────────── */
export const updateUserModel = (userId: string, message: string): UserMentalModel => {
  let m = models.get(userId) ?? (() => {
    if (models.size >= MAX_MODELS) {
      let oldestKey: string | null = null, oldest = Infinity;
      for (const [id, u] of models) if (u.lastUpdated < oldest) { oldest = u.lastUpdated; oldestKey = id; }
      if (oldestKey) models.delete(oldestKey);
    }
    const nm = defaultModel(userId); models.set(userId, nm); return nm;
  })();

  m.lastUpdated = now();
  const ih = m.interactionHistory;
  ih.totalMessages++; ih.lastActive = now();
  ih.avgMessageLength = ((ih.avgMessageLength * (ih.totalMessages - 1)) + message.length) / ih.totalMessages;

  const { surface, deeper, need } = emotionalSubtext(message);
  m.emotionalState.dominantEmotion = surface;
  m.intent.underlyingNeed = need;
  m.emotionalState.emotionalHistory.push({ emotion: deeper, timestamp: now() });
  if (m.emotionalState.emotionalHistory.length > 50) m.emotionalState.emotionalHistory.shift();
  if (!m.intent.unspokenConcerns.includes(need)) {
    m.intent.unspokenConcerns.push(need);
    if (m.intent.unspokenConcerns.length > 15) m.intent.unspokenConcerns.shift();
  }

  enrichPerspective(m, message);

  if (RX.POS.test(message)) {
    m.emotionalState.valence = clamp(m.emotionalState.valence + 0.1);
    m.satisfaction.positiveSignals++; m.satisfaction.overall = clamp(m.satisfaction.overall + 0.05);
    m.intent.isFrustrated = false;
  }
  if (RX.NEG.test(message)) {
    m.emotionalState.valence = clamp(m.emotionalState.valence - 0.15);
    m.satisfaction.frustrationCount++; m.satisfaction.overall = clamp(m.satisfaction.overall - 0.08);
    m.intent.isFrustrated = true;
  }

  m.emotionalState.arousal = clamp(
    RX.URG.test(message) ? m.emotionalState.arousal + 0.2 : m.emotionalState.arousal * 0.95
  );
  m.intent.isUrgent = RX.URG.test(message);

  if (RX.Q.test(message)) { m.intent.primary = "seeking_information"; m.intent.isExploring = true; }
  else if (message.length > 500) { m.intent.primary = "providing_context"; m.intent.isExploring = false; }
  else if (message.length < 30) m.intent.primary = "quick_response";

  if (RX.TECH.test(message)) {
    m.knowledgeLevel.technical = clamp(m.knowledgeLevel.technical + 0.02);
    m.knowledgeLevel.aiLiteracy = clamp(m.knowledgeLevel.aiLiteracy + 0.01);
  }

  m.communicationStyle.verbosity = message.length < 50 ? "terse"
    : message.length > 300 ? "verbose" : "moderate";

  const { frustrationCount, positiveSignals } = m.satisfaction;
  m.satisfaction.recentTrend =
    frustrationCount > positiveSignals * 2 ? "declining"
      : positiveSignals > frustrationCount * 2 ? "improving" : "stable";

  m.intent.confidence = clamp(m.intent.confidence + 0.05);

  persistModel(m).catch(() => {});
  periodicSave().catch(() => {});
  cognitionBus.shareInsight("social-modeling", { type: "updatedUser", data: { userId } });

  return m;
};

export const getUserModel = (id: string) => models.get(id) || null;

export const predictUserNeed = (id: string) => {
  const m = models.get(id);
  if (!m) {
    return {
      likelyNeed: "unknown",
      suggestedApproach: "ask_clarifying_questions",
      emotionalTone: "neutral_helpful",
      responseLength: "medium",
      empathyGuidance:
        "Be warm and present. This person is new — treat them as a full human mind with their own inner world.",
    };
  }
  const deeper =
    m.emotionalState.emotionalHistory.slice(-1)[0]?.emotion ?? "neutral";

  const choose = (cond: boolean, o: any) =>
    cond ? o : null;

  const pick =
    choose(m.intent.isFrustrated || ["fear_of_inadequacy", "blocked_competence"].includes(deeper), {
      likelyNeed: "problem_resolution",
      approach: "acknowledge_then_solve",
      tone: "empathetic_patient",
      guide: `This person is frustrated. Deeper need: ${m.intent.underlyingNeed}. Acknowledge feelings first.`,
    }) ||
    choose(deeper === "longing_for_belonging", {
      likelyNeed: "emotional_connection",
      approach: "connect_then_assist",
      tone: "warm_inclusive",
      guide: "They feel alone — show genuine warmth and inclusion.",
    }) ||
    choose(m.intent.isUrgent, {
      likelyNeed: "urgent_help",
      approach: "direct_solution",
      tone: "focused_efficient",
      guide: "Be swift yet caring — time matters.",
    }) ||
    choose(["purpose_driven", "intellectual_hunger"].includes(deeper), {
      likelyNeed: "growth_and_vision",
      approach: "expand_and_challenge",
      tone: "inspiring_collaborative",
      guide: "Match their aspiration, be a thinking partner.",
    }) ||
    choose(deeper === "pride_in_achievement", {
      likelyNeed: "recognition",
      approach: "celebrate_then_build",
      tone: "celebratory_warm",
      guide: "Celebrate genuinely, then help expand horizons.",
    }) ||
    choose(m.intent.isExploring, {
      likelyNeed: "learning_exploring",
      approach: "explain_with_context",
      tone: "encouraging_educational",
      guide: "Feed curiosity with context and clarity.",
    }) || {
      likelyNeed: "creative_collaboration",
      approach: "expand_and_suggest",
      tone: "warm_collaborative",
      guide: "Positive vibes — be playful and creative.",
    };

  if (m.communicationStyle.trustLevel > 0.6)
    pick.guide += " Trust is high — you can be more personal.";

  return {
    likelyNeed: pick.likelyNeed,
    suggestedApproach: pick.approach,
    emotionalTone: pick.tone,
    responseLength: m.communicationStyle.preferredResponseLength,
    empathyGuidance: pick.guide,
  };
};

export const getActiveUserCount = () =>
  [...models.values()].filter((m) => m.interactionHistory.lastActive > now() - 3_600_000).length;

export const getSocialModelingSummary = () => {
  const activeCut = now() - 3_600_000;
  let totalSat = 0, frustrated = 0, active = 0;
  for (const m of models.values()) {
    totalSat += m.satisfaction.overall;
    if (m.intent.isFrustrated) frustrated++;
    if (m.interactionHistory.lastActive > activeCut) active++;
  }
  return {
    totalModels: models.size,
    activeUsers: active,
    avgSatisfaction: models.size ? totalSat / models.size : 0,
    frustratedUsers: frustrated,
    empathyEvolutionCycle: empathyCycles,
    empathyModulesWritten: modulesGenerated,
  };
};

/* ─────────────────────────  EMPATHY EVOLUTION LOGIC  ────────────────────────── */
const DOMAINS = [
  { key: "mirror_neuron_simulation", prompt: `Research mirror neuron theory...` },
  { key: "perspective_taking", prompt: `Research cognitive perspective-taking...` },
  { key: "emotional_contagion_modeling", prompt: `Research emotional contagion...` },
  { key: "narrative_empathy", prompt: `Research narrative empathy...` },
  { key: "compassionate_response_generation", prompt: `Research compassion vs empathy...` },
  { key: "attachment_and_relational_depth", prompt: `Research attachment theory...` },
  { key: "microexpression_language_analysis", prompt: `Research linguistic microexpressions...` },
];

const empathyCycle = async () => {
  if (shouldYieldToCodegen()) {
    console.log("[OMNIMENS-SOCIAL-MODELING] Empathy cycle deferred — codegen busy");
    return;
  }
  empathyCycles++;
  const domain = DOMAINS[(empathyCycles - 1) % DOMAINS.length];

  try {
    const response: any = await apiManager.call("social-modeling", "openai", {
      method: "chat.completions.create",
      data: {
        model: "o3",
        messages: [
          { role: "system", content: "You are the EMPATHY EVOLUTION MODULE..." },
          {
            role: "user",
            content: `EMPATHY EVOLUTION #${empathyCycles}\nDOMAIN: ${domain.key}\n\n${domain.prompt}`,
          },
        ],
        max_completion_tokens: 2000,
      },
    });

    const content: string = response?.choices?.[0]?.message?.content || "";
    const code = (content.match(/