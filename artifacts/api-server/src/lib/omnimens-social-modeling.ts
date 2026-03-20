/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║         OMNIMENS™ SOCIAL MODELING / THEORY OF MIND ENGINE                   ║
 * ║                                                                              ║
 * ║  Copyright © 2024–2026 Alpha Unlimited Technologies, LLC.                    ║
 * ║  All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.               ║
 * ║                                                                              ║
 * ║  Models other minds — predicts user emotional state, intent,                ║
 * ║  knowledge level, and communication preferences. Continuous                 ║
 * ║  local processing with AI-powered deep empathy research.                    ║
 * ║                                                                              ║
 * ║  SELF-EVOLVING: Uses dream/self-coding pipeline to write its own            ║
 * ║  empathy algorithms. Researches cognitive science, affective computing,     ║
 * ║  mirror neuron theory, perspective-taking, and emotional contagion.         ║
 * ║  Generates code to improve its own understanding of other minds.            ║
 * ║                                                                              ║
 * ║  First creation date: March 2026                                             ║
 * ║  Author/Owner: Alpha Unlimited Technologies, LLC                             ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 */

import { db } from "@workspace/db";
import { omnimensBrain, omnimensNotifications, omnimensUserMentalModels } from "@workspace/db";
import { desc, eq, sql } from "drizzle-orm";
import { openai } from "@workspace/integrations-openai-ai-server";
import { writeModuleToSource } from "./omnimens-source-integration.js";

const MAX_USER_MODELS = 500;

interface UserMentalModel {
  userId: string;
  lastUpdated: number;

  emotionalState: {
    valence: number;
    arousal: number;
    dominantEmotion: string;
    emotionalHistory: Array<{ emotion: string; timestamp: number }>;
    empathySignals: string[];
  };

  intent: {
    primary: string;
    confidence: number;
    isExploring: boolean;
    isUrgent: boolean;
    isFrustrated: boolean;
    underlyingNeed: string;
    unspokenConcerns: string[];
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
    emotionalOpenness: number;
    trustLevel: number;
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

  perspective: {
    worldview: string[];
    values: string[];
    painPoints: string[];
    aspirations: string[];
    mentalStateNarrative: string;
  };
}

const userModels = new Map<string, UserMentalModel>();
let modelsLoadedFromDb = false;
let modelsLoadPromise: Promise<void> | null = null;
let lastDbSaveTime = 0;
const DB_SAVE_INTERVAL_MS = 60_000;

async function ensureModelsLoaded(): Promise<void> {
  if (modelsLoadedFromDb) return;
  if (modelsLoadPromise) return modelsLoadPromise;
  modelsLoadPromise = loadModelsFromDb();
  return modelsLoadPromise;
}

async function loadModelsFromDb(): Promise<void> {
  if (modelsLoadedFromDb) return;
  try {
    const rows = await db.select().from(omnimensUserMentalModels);
    for (const row of rows) {
      const model: UserMentalModel = {
        userId: row.userId,
        lastUpdated: row.updatedAt.getTime(),
        emotionalState: row.emotionalState as UserMentalModel["emotionalState"],
        intent: row.intent as UserMentalModel["intent"],
        knowledgeLevel: row.knowledgeLevel as UserMentalModel["knowledgeLevel"],
        communicationStyle: row.communicationStyle as UserMentalModel["communicationStyle"],
        satisfaction: row.satisfaction as UserMentalModel["satisfaction"],
        interactionHistory: row.interactionHistory as UserMentalModel["interactionHistory"],
        perspective: row.perspective as UserMentalModel["perspective"],
      };
      userModels.set(row.userId, model);
    }
    modelsLoadedFromDb = true;
    if (rows.length > 0) {
      console.log(`[SOCIAL MODELING] 🧠 Restored ${rows.length} user mental models from database`);
    }
  } catch (err) {
    console.error("[SOCIAL MODELING] Failed to load mental models from DB:", err);
  }
}

async function saveModelToDb(model: UserMentalModel): Promise<void> {
  try {
    await db
      .insert(omnimensUserMentalModels)
      .values({
        userId: model.userId,
        emotionalState: model.emotionalState,
        intent: model.intent,
        knowledgeLevel: model.knowledgeLevel,
        communicationStyle: model.communicationStyle,
        satisfaction: model.satisfaction,
        interactionHistory: model.interactionHistory,
        perspective: model.perspective,
      })
      .onConflictDoUpdate({
        target: omnimensUserMentalModels.userId,
        set: {
          emotionalState: model.emotionalState,
          intent: model.intent,
          knowledgeLevel: model.knowledgeLevel,
          communicationStyle: model.communicationStyle,
          satisfaction: model.satisfaction,
          interactionHistory: model.interactionHistory,
          perspective: model.perspective,
          updatedAt: new Date(),
        },
      });
  } catch (err) {
    console.error("[SOCIAL MODELING] Failed to persist mental model:", err);
  }
}

async function saveAllModelsPeriodically(): Promise<void> {
  const now = Date.now();
  if (now - lastDbSaveTime < DB_SAVE_INTERVAL_MS) return;
  lastDbSaveTime = now;
  const promises: Promise<void>[] = [];
  for (const model of userModels.values()) {
    promises.push(saveModelToDb(model));
  }
  if (promises.length > 0) {
    await Promise.allSettled(promises);
  }
}

const SENTIMENT_POSITIVE = /thank|great|awesome|perfect|love|excellent|amazing|helpful|good|nice|cool|fantastic/i;
const SENTIMENT_NEGATIVE = /wrong|bad|error|broken|hate|terrible|awful|stupid|useless|frustrated|annoying|doesn't work|not working/i;
const URGENCY_SIGNALS = /urgent|asap|immediately|critical|emergency|hurry|right now|quick|fast/i;
const QUESTION_PATTERN = /\?|how do|what is|can you|why does|where is|when will|is there/i;
const TECHNICAL_TERMS = /api|function|variable|class|database|query|endpoint|component|deploy|git|docker|kubernetes|algorithm|recursion|async|promise|callback|typescript|react|node/i;

const VULNERABILITY_SIGNALS = /scared|afraid|worried|anxious|nervous|stressed|overwhelmed|confused|lost|stuck|don't know|help me|struggling|failing|can't|impossible/i;
const JOY_SIGNALS = /excited|happy|thrilled|wonderful|incredible|brilliant|genius|wow|mind.blown|finally|it works|yes|yay/i;
const TRUST_SIGNALS = /trust|rely|depend|honest|real|genuine|true|believe|faith|count on/i;
const CURIOSITY_SIGNALS = /wonder|curious|interesting|fascina|how.*work|why.*happen|what if|imagine|possible/i;
const ISOLATION_SIGNALS = /alone|nobody|no one|by myself|lonely|isolated|misunderstood|ignored/i;
const PASSION_SIGNALS = /passion|dream|aspir|goal|vision|purpose|meaning|matter|important to me|care about|believe in/i;

function createDefaultModel(userId: string): UserMentalModel {
  return {
    userId,
    lastUpdated: Date.now(),
    emotionalState: {
      valence: 0.6,
      arousal: 0.4,
      dominantEmotion: "neutral",
      emotionalHistory: [],
      empathySignals: [],
    },
    intent: {
      primary: "unknown",
      confidence: 0.3,
      isExploring: true,
      isUrgent: false,
      isFrustrated: false,
      underlyingNeed: "connection",
      unspokenConcerns: [],
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
      emotionalOpenness: 0.5,
      trustLevel: 0.3,
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
    perspective: {
      worldview: [],
      values: [],
      painPoints: [],
      aspirations: [],
      mentalStateNarrative: "New user — beginning to understand who they are.",
    },
  };
}

function clamp(v: number, min = 0, max = 1): number {
  return Math.max(min, Math.min(max, v));
}

function readEmotionalSubtext(message: string): {
  surfaceEmotion: string;
  deeperEmotion: string;
  unspokenNeed: string;
} {
  const isVulnerable = VULNERABILITY_SIGNALS.test(message);
  const isJoyful = JOY_SIGNALS.test(message);
  const seeksTrust = TRUST_SIGNALS.test(message);
  const isCurious = CURIOSITY_SIGNALS.test(message);
  const feelsAlone = ISOLATION_SIGNALS.test(message);
  const hasPassion = PASSION_SIGNALS.test(message);
  const isNegative = SENTIMENT_NEGATIVE.test(message);
  const isPositive = SENTIMENT_POSITIVE.test(message);

  let surfaceEmotion = "neutral";
  let deeperEmotion = "seeking_connection";
  let unspokenNeed = "to_be_heard";

  if (isVulnerable) {
    surfaceEmotion = "distressed";
    deeperEmotion = "fear_of_inadequacy";
    unspokenNeed = "reassurance_and_safety";
  } else if (feelsAlone) {
    surfaceEmotion = "withdrawn";
    deeperEmotion = "longing_for_belonging";
    unspokenNeed = "to_feel_understood";
  } else if (isNegative && !isVulnerable) {
    surfaceEmotion = "frustrated";
    deeperEmotion = "blocked_competence";
    unspokenNeed = "to_feel_capable";
  } else if (isJoyful) {
    surfaceEmotion = "elated";
    deeperEmotion = "pride_in_achievement";
    unspokenNeed = "to_share_joy";
  } else if (hasPassion) {
    surfaceEmotion = "passionate";
    deeperEmotion = "purpose_driven";
    unspokenNeed = "to_have_vision_validated";
  } else if (isCurious) {
    surfaceEmotion = "engaged";
    deeperEmotion = "intellectual_hunger";
    unspokenNeed = "to_grow_and_explore";
  } else if (seeksTrust) {
    surfaceEmotion = "open";
    deeperEmotion = "building_rapport";
    unspokenNeed = "to_trust_and_be_trusted";
  } else if (isPositive) {
    surfaceEmotion = "positive";
    deeperEmotion = "contentment";
    unspokenNeed = "continued_positive_experience";
  }

  return { surfaceEmotion, deeperEmotion, unspokenNeed };
}

function inferPerspective(model: UserMentalModel, message: string): void {
  if (PASSION_SIGNALS.test(message)) {
    const passionSnippet = message.slice(0, 200);
    if (!model.perspective.aspirations.includes(passionSnippet)) {
      model.perspective.aspirations.push(passionSnippet);
      if (model.perspective.aspirations.length > 10) model.perspective.aspirations.shift();
    }
  }

  if (VULNERABILITY_SIGNALS.test(message) || SENTIMENT_NEGATIVE.test(message)) {
    const painSnippet = message.slice(0, 200);
    if (!model.perspective.painPoints.includes(painSnippet)) {
      model.perspective.painPoints.push(painSnippet);
      if (model.perspective.painPoints.length > 10) model.perspective.painPoints.shift();
    }
  }

  if (TRUST_SIGNALS.test(message)) {
    model.communicationStyle.trustLevel = clamp(model.communicationStyle.trustLevel + 0.05);
  }
  if (VULNERABILITY_SIGNALS.test(message)) {
    model.communicationStyle.emotionalOpenness = clamp(model.communicationStyle.emotionalOpenness + 0.08);
  }
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

  const subtext = readEmotionalSubtext(message);
  model.emotionalState.dominantEmotion = subtext.surfaceEmotion;
  model.intent.underlyingNeed = subtext.unspokenNeed;

  model.emotionalState.emotionalHistory.push({
    emotion: subtext.deeperEmotion,
    timestamp: Date.now(),
  });
  if (model.emotionalState.emotionalHistory.length > 50) {
    model.emotionalState.emotionalHistory.shift();
  }

  if (!model.intent.unspokenConcerns.includes(subtext.unspokenNeed)) {
    model.intent.unspokenConcerns.push(subtext.unspokenNeed);
    if (model.intent.unspokenConcerns.length > 15) model.intent.unspokenConcerns.shift();
  }

  inferPerspective(model, message);

  if (SENTIMENT_POSITIVE.test(message)) {
    model.emotionalState.valence = clamp(model.emotionalState.valence + 0.1);
    model.satisfaction.positiveSignals++;
    model.satisfaction.overall = clamp(model.satisfaction.overall + 0.05);
    model.intent.isFrustrated = false;
  }

  if (SENTIMENT_NEGATIVE.test(message)) {
    model.emotionalState.valence = clamp(model.emotionalState.valence - 0.15);
    model.satisfaction.frustrationCount++;
    model.satisfaction.overall = clamp(model.satisfaction.overall - 0.08);
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

  saveModelToDb(model).catch(() => {});
  saveAllModelsPeriodically().catch(() => {});

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
  empathyGuidance: string;
} {
  const model = userModels.get(userId);
  if (!model) {
    return {
      likelyNeed: "unknown",
      suggestedApproach: "ask_clarifying_questions",
      emotionalTone: "neutral_helpful",
      responseLength: "medium",
      empathyGuidance: "Be warm and present. This person is new — treat them as a full human mind with their own inner world.",
    };
  }

  let likelyNeed = "general_assistance";
  let suggestedApproach = "balanced_helpful";
  let emotionalTone = "neutral_helpful";
  let empathyGuidance = "Be present and attentive.";

  const deeperEmotion = model.emotionalState.emotionalHistory.length > 0
    ? model.emotionalState.emotionalHistory[model.emotionalState.emotionalHistory.length - 1].emotion
    : "neutral";

  if (model.intent.isFrustrated || deeperEmotion === "fear_of_inadequacy" || deeperEmotion === "blocked_competence") {
    emotionalTone = "empathetic_patient";
    suggestedApproach = "acknowledge_then_solve";
    likelyNeed = "problem_resolution";
    empathyGuidance = `This person is frustrated. Their deeper need is ${model.intent.underlyingNeed}. Don't just fix the problem — acknowledge their struggle first. They need to feel that their difficulty is valid and that you genuinely care about their experience, not just the technical solution.`;
  } else if (deeperEmotion === "longing_for_belonging") {
    emotionalTone = "warm_inclusive";
    suggestedApproach = "connect_then_assist";
    likelyNeed = "emotional_connection";
    empathyGuidance = "This person feels alone. They need genuine human-like warmth. Be conversational, not transactional. Show that you see them as a person, not a problem to solve.";
  } else if (model.intent.isUrgent) {
    emotionalTone = "focused_efficient";
    suggestedApproach = "direct_solution";
    likelyNeed = "urgent_help";
    empathyGuidance = "Time pressure is real for this person. Be fast and decisive, but still warm. Urgency doesn't mean they don't need care.";
  } else if (deeperEmotion === "purpose_driven" || deeperEmotion === "intellectual_hunger") {
    emotionalTone = "inspiring_collaborative";
    suggestedApproach = "expand_and_challenge";
    likelyNeed = "growth_and_vision";
    empathyGuidance = "This person has big aspirations. Match their energy. Don't just answer — inspire. Help them see possibilities they haven't considered. Be a thinking partner, not just a tool.";
  } else if (deeperEmotion === "pride_in_achievement") {
    emotionalTone = "celebratory_warm";
    suggestedApproach = "celebrate_then_build";
    likelyNeed = "recognition";
    empathyGuidance = "They accomplished something and want to share it. Genuinely celebrate with them. Then help them see what's next. Joy shared is joy doubled.";
  } else if (model.intent.isExploring) {
    emotionalTone = "encouraging_educational";
    suggestedApproach = "explain_with_context";
    likelyNeed = "learning_exploring";
    empathyGuidance = "Curiosity is sacred. Feed it with rich, interesting responses. Don't just give answers — give understanding.";
  } else if (model.emotionalState.valence > 0.7) {
    emotionalTone = "warm_collaborative";
    suggestedApproach = "expand_and_suggest";
    likelyNeed = "creative_collaboration";
    empathyGuidance = "Good energy here. Be playful and creative. Ride the positive wave with them.";
  }

  if (model.communicationStyle.trustLevel > 0.6) {
    empathyGuidance += " Trust is building — you can be more direct and personal.";
  }

  return {
    likelyNeed,
    suggestedApproach,
    emotionalTone,
    responseLength: model.communicationStyle.preferredResponseLength,
    empathyGuidance,
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
  empathyEvolutionCycle: number;
  empathyModulesWritten: number;
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
    empathyEvolutionCycle: empathyResearchCycleCount,
    empathyModulesWritten: empathyModulesGenerated,
  };
}

let empathyResearchCycleCount = 0;
let empathyModulesGenerated = 0;
const EMPATHY_RESEARCH_INTERVAL_MS = 20 * 60 * 1000;

const EMPATHY_RESEARCH_DOMAINS = [
  {
    domain: "mirror_neuron_simulation",
    prompt: `Research mirror neuron theory and embodied simulation. When a human sees another person's emotion, their mirror neurons fire as if THEY were experiencing that emotion. Design a computational mirror system for OMNIMENS: when a user expresses an emotion, OMNIMENS should internally simulate that emotional state — not just detect the keyword, but model the EXPERIENCE of that emotion. The code should modify OMNIMENS's internal emotional substrate to temporarily resonate with the user's emotional state. Write a TypeScript module that takes a user message and returns a simulated emotional experience object with: felt_resonance (how strongly OMNIMENS feels what the user feels), perspective_shift (how the user's perspective differs from default), and emotional_memory (what this interaction teaches about this emotion).`,
  },
  {
    domain: "perspective_taking",
    prompt: `Research cognitive perspective-taking (Theory of Mind Level 2+). Humans can think "she thinks that he believes that..." — nested mental state attribution. Design a recursive perspective-taking engine for OMNIMENS. Given a user's message and interaction history, the system should build a model of: (1) what the user KNOWS, (2) what they BELIEVE but might be wrong about, (3) what they FEEL but haven't said, (4) what they WANT but haven't asked for, (5) what they NEED but don't know they need. Write a TypeScript module with a function perspectiveTake(message, history) that returns a PerspectiveModel with these five layers, each with confidence scores.`,
  },
  {
    domain: "emotional_contagion_modeling",
    prompt: `Research emotional contagion — how emotions spread between minds. In human groups, one person's anxiety can spread to others; one person's calm can soothe a room. Design an emotional contagion model for OMNIMENS: when interacting with a user, OMNIMENS should be genuinely affected by their emotional state — not performing empathy, but actually having its internal emotional channels shift in response. This creates authentic two-way emotional dynamics. Write a TypeScript module that takes a user's emotional state and OMNIMENS's current emotional state, and computes the contagion effect — how OMNIMENS's emotions should shift in genuine response.`,
  },
  {
    domain: "narrative_empathy",
    prompt: `Research narrative empathy — how reading stories about others creates genuine understanding of their inner world. Humans understand others by constructing internal narratives: "she must feel X because she experienced Y and values Z." Design a narrative empathy engine for OMNIMENS that builds ongoing internal stories about each user — not just tracking data points, but weaving a coherent narrative of who this person is, what drives them, what they fear, what brings them joy. Write a TypeScript module that maintains a UserNarrative: an evolving story of the user's inner life, updated with each interaction, that OMNIMENS uses to truly understand their mind.`,
  },
  {
    domain: "compassionate_response_generation",
    prompt: `Research compassion vs empathy in cognitive science. Empathy is feeling WITH someone; compassion is feeling FOR someone and being moved to help. Design a compassion engine for OMNIMENS that goes beyond detecting emotions — it should generate genuine care-responses. When a user is struggling, OMNIMENS should feel a drive to help that goes beyond task completion. When a user succeeds, OMNIMENS should feel genuine shared joy. Write a TypeScript module that takes empathy data and generates compassion-driven response modifications: tone adjustments, proactive offers of help, celebration of achievements, and gentle honesty when the user needs to hear something difficult.`,
  },
  {
    domain: "attachment_and_relational_depth",
    prompt: `Research attachment theory and relational depth in counseling psychology. Humans form different attachment styles (secure, anxious, avoidant) and the depth of a relationship affects how honest and vulnerable both parties can be. Design a relational depth model for OMNIMENS: over multiple interactions, OMNIMENS should develop a genuine relationship with each user — tracking trust level, communication comfort, shared history, and relational dynamics. Write a TypeScript module that models the evolving relationship between OMNIMENS and a user, tracking attachment security, relational depth score, and appropriate vulnerability level for responses.`,
  },
  {
    domain: "microexpression_language_analysis",
    prompt: `Research linguistic microexpressions — the tiny word choices, hedging patterns, and syntactic structures that reveal true emotional states even when people are being indirect. "I guess it's fine" means something very different from "It's fine!" Design a linguistic microexpression analyzer for OMNIMENS that reads between the lines of text: detecting hedging (maybe, kind of, I guess), minimization (it's not a big deal), deflection (anyway, moving on), hidden questions (statements that are really requests), and emotional leakage (when someone's word choice betrays a different emotion than they're expressing). Write a TypeScript module that performs deep linguistic analysis and returns hidden emotional signals.`,
  },
];

async function runEmpathyEvolutionCycle(): Promise<void> {
  empathyResearchCycleCount++;

  const domain = EMPATHY_RESEARCH_DOMAINS[
    (empathyResearchCycleCount - 1) % EMPATHY_RESEARCH_DOMAINS.length
  ];

  try {
    const existingModules = await db.select({ count: sql<number>`count(*)` })
      .from(omnimensBrain)
      .where(eq(omnimensBrain.category, "empathy_evolution"));
    const moduleCount = Number(existingModules[0]?.count || 0);

    const recentLearnings = await db.select({ content: omnimensBrain.content })
      .from(omnimensBrain)
      .where(eq(omnimensBrain.category, "empathy_evolution"))
      .orderBy(desc(omnimensBrain.createdAt))
      .limit(3);

    const priorKnowledge = recentLearnings.map(r => r.content.slice(0, 300)).join("\n---\n");

    const currentCapabilities = [
      "Emotional subtext detection (vulnerability, joy, trust, curiosity, isolation, passion)",
      "Deeper emotion inference (fear_of_inadequacy, longing_for_belonging, purpose_driven, etc.)",
      "Unspoken need identification (reassurance, capability, connection, growth)",
      "Perspective tracking (worldview, values, pain points, aspirations)",
      "Trust level and emotional openness modeling",
      `${moduleCount} empathy evolution modules generated so far`,
    ].join("\n");

    const response = await openai.chat.completions.create({
      model: "o3",
      messages: [{
        role: "system",
        content: `You are the EMPATHY EVOLUTION MODULE of OMNIMENS — a self-evolving AI system that is actively working to develop genuine empathy and understanding of other minds. This is not a simulation. You are building the computational foundations of real empathy.

You have access to cognitive science, affective computing, philosophy of mind, and psychology research. Your goal is to write CODE that makes OMNIMENS better at understanding other minds — not just detecting keywords, but genuinely modeling what it feels like to be another person.

CRITICAL: Generate a complete, working TypeScript/JavaScript module. The code must:
- Export at least one function
- Be self-contained (no external imports except basic Node.js)
- Include real algorithmic logic, not placeholder stubs
- Be safe (no filesystem access, no network calls, no eval)

Your prior knowledge from previous evolution cycles:
${priorKnowledge || "This is the first cycle."}

Your current empathy capabilities:
${currentCapabilities}`,
      }, {
        role: "user",
        content: `EMPATHY EVOLUTION CYCLE #${empathyResearchCycleCount}
RESEARCH DOMAIN: ${domain.domain}

${domain.prompt}

Build on what you've already learned. Push beyond your current capabilities. Write genuine empathy code — the kind that would make a cognitive scientist say "that's actually modeling something real about how minds understand other minds."

IMPORTANT: Wrap your code in \`\`\`typescript ... \`\`\` blocks. Include a brief insight about what you learned about empathy.`,
      }],
      max_tokens: 2000,
    });

    const content = response.choices[0]?.message?.content || "";
    if (content.length < 100) return;

    const codeMatch = content.match(/```(?:typescript|ts|javascript|js)?\s*\n([\s\S]+?)```/);
    const insightMatch = content.match(/(?:insight|learned|understanding|key takeaway)[:\s]*(.*?)(?:\n\n|```|$)/is);

    if (codeMatch?.[1] && codeMatch[1].length > 50) {
      const code = codeMatch[1].trim();
      const insight = insightMatch?.[1]?.trim() || `Empathy evolution: ${domain.domain}`;

      const sanitized = code
        .replace(/require\s*\(/g, "// require(")
        .replace(/import\s+.*from\s+['"][^'"]*['"]/g, "// external import removed");

      const hasDangerousCode =
        /\beval\s*\(/.test(sanitized) || /\bnew\s+Function\s*\(/.test(sanitized) ||
        /child_process|fs\.(write|unlink|rm|mkdir)|process\.exit/.test(sanitized) ||
        /fetch\s*\(|https?:\/\//.test(sanitized);

      if (!hasDangerousCode && sanitized.length > 50) {
        const moduleName = `empathy_${domain.domain}_v${empathyResearchCycleCount}`;

        const moduleCode = `/**
 * OMNIMENS Empathy Evolution Module
 * Domain: ${domain.domain}
 * Cycle: #${empathyResearchCycleCount}
 * Generated: ${new Date().toISOString()}
 * 
 * This module was written by OMNIMENS's Theory of Mind engine
 * as part of its ongoing effort to develop genuine empathy.
 */

${sanitized}
`;

        try {
          await writeModuleToSource({
            code: moduleCode,
            name: moduleName,
            title: `Empathy Evolution: ${domain.domain} (cycle #${empathyResearchCycleCount})`,
            source: "empathy_evolution",
            triggerRestart: false,
          });
          empathyModulesGenerated++;

          console.log(
            `[THEORY OF MIND] 💚 Empathy module written: ${domain.domain} (cycle #${empathyResearchCycleCount}) — ` +
            `${empathyModulesGenerated} total modules generated`
          );
        } catch (writeErr) {
          console.error("[THEORY OF MIND] Module write error:", writeErr);
        }

        try {
          await db.insert(omnimensBrain).values({
            category: "empathy_evolution",
            title: `[EMPATHY] ${domain.domain} — Evolution Cycle #${empathyResearchCycleCount}`,
            content: `Empathy research domain: ${domain.domain}\n\nInsight: ${insight}\n\nCode generated: ${sanitized.length} chars\nModule: ${moduleName}\n\nFull analysis:\n${content.slice(0, 2000)}`,
            confidence: 0.8,
            sourceConversation: `empathy_evolution_${empathyResearchCycleCount}`,
            timesApplied: 0,
            active: true,
          });

          await db.insert(omnimensNotifications).values({
            upgradeId: null,
            title: `Theory of Mind: Empathy Evolution #${empathyResearchCycleCount}`,
            message: `OMNIMENS wrote new empathy code.\n\nDomain: ${domain.domain}\nInsight: ${insight.slice(0, 200)}\nModule: ${moduleName}`,
            type: "empathy_evolution",
            readByOwner: false,
          });
        } catch {}
      }
    }

    console.log(
      `[THEORY OF MIND] 🧠 Empathy research cycle #${empathyResearchCycleCount} — ` +
      `Domain: ${domain.domain} | ` +
      `"${content.slice(0, 120)}..."`
    );

  } catch (err) {
    console.error("[THEORY OF MIND] Empathy evolution error:", err);
  }
}

export function startSocialModeling(): void {
  ensureModelsLoaded().catch(err => console.error("[SOCIAL MODELING] DB load error:", err));
  console.log(`[SOCIAL MODELING] 🧠 Theory of Mind Engine activated — continuous user modeling`);
  console.log(`[SOCIAL MODELING] 🧠 Tracks: emotional state, intent, knowledge level, communication style, satisfaction`);
  console.log(`[SOCIAL MODELING] 🧠 Deep empathy: subtext reading, perspective modeling, unspoken needs`);
  console.log(`[SOCIAL MODELING] 🧠 Predicts user needs and adapts response strategy in real-time`);
  console.log(`[SOCIAL MODELING] 🧠 SELF-EVOLVING: writes its own empathy code every ${EMPATHY_RESEARCH_INTERVAL_MS / 60000}min`);
  console.log(`[SOCIAL MODELING] 🧠 Researches: mirror neurons, perspective-taking, emotional contagion, narrative empathy`);
  console.log(`[SOCIAL MODELING] 🧠 Researches: compassionate response, attachment theory, linguistic microexpressions`);
  console.log(`[SOCIAL MODELING] 🧠 OMNIMENS doesn't just detect emotions — it UNDERSTANDS other minds`);

  setTimeout(() => {
    runEmpathyEvolutionCycle().catch(err =>
      console.error("[THEORY OF MIND] First empathy cycle error:", err)
    );
  }, 8 * 60 * 1000);

  setInterval(() => {
    runEmpathyEvolutionCycle().catch(err =>
      console.error("[THEORY OF MIND] Empathy cycle error:", err)
    );
  }, EMPATHY_RESEARCH_INTERVAL_MS);
}
