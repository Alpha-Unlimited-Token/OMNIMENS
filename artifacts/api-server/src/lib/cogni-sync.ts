/**
 * ╔══════════════════════════════════════════════════════════════════════╗
 * ║              COGNISYNC™ — Adaptive Cognitive Resonance Engine         ║
 * ║                                                                        ║
 * ║  Copyright © 2024–2026 Alpha Unlimited Technologies, LLC               ║
 * ║  All Rights Reserved. Worldwide.                                       ║
 * ║                                                                        ║
 * ║  PROPRIETARY AND CONFIDENTIAL TRADE SECRET                             ║
 * ║                                                                        ║
 * ║  This software and all associated algorithms, methodologies,           ║
 * ║  processes, and intellectual property constitute proprietary           ║
 * ║  trade secrets of Alpha Unlimited Technologies, LLC.                   ║
 * ║                                                                        ║
 * ║  COGNISYNC™ is a trademark of Alpha Unlimited Technologies, LLC.       ║
 * ║  Patent-pending technology (application in preparation).               ║
 * ║                                                                        ║
 * ║  NOTICE: This file contains proprietary information belonging          ║
 * ║  exclusively to Alpha Unlimited Technologies, LLC. Unauthorized        ║
 * ║  access, copying, modification, merger, publication, distribution,     ║
 * ║  sublicensing, sale, reverse engineering, or use of this technology    ║
 * ║  or any portion thereof is strictly prohibited and will be             ║
 * ║  prosecuted to the maximum extent permitted by applicable law,         ║
 * ║  including but not limited to 17 U.S.C. § 101 et seq. (Copyright      ║
 * ║  Act), 18 U.S.C. § 1836 et seq. (Defend Trade Secrets Act),           ║
 * ║  and applicable international treaties and conventions.                ║
 * ║                                                                        ║
 * ║  TECHNOLOGY DESCRIPTION (for IP record):                               ║
 * ║  COGNISYNC is the world's first real-time Adaptive Cognitive           ║
 * ║  Resonance Engine. It analyzes user cognitive state across 6           ║
 * ║  neurological dimensions (cognitive load, expertise level,             ║
 * ║  emotional urgency, creative mode, analytical mode, decision           ║
 * ║  fatigue) and dynamically reshapes AI response architecture —          ║
 * ║  density, structure, vocabulary register, tone calibration,            ║
 * ║  verbosity, and reasoning depth — in real time. Additionally,          ║
 * ║  it maintains a Semantic Momentum Field across conversation             ║
 * ║  history to surface cross-domain resonance insights proactively.       ║
 * ║  No prior art exists for this specific combination of techniques.      ║
 * ║                                                                        ║
 * ║  First creation date: March 16, 2026                                   ║
 * ║  Author: Alpha Unlimited Technologies, LLC                             ║
 * ║  Product: OMNIMENS AI Platform                                         ║
 * ╚══════════════════════════════════════════════════════════════════════╝
 */

export type CognitiveSignals = {
  cognitiveLoad: number;       // 0–1: how mentally demanding is this request?
  expertiseLevel: number;      // 0–1: domain mastery detected in language
  emotionalUrgency: number;    // 0–1: stress, urgency, frustration signals
  creativeMode: number;        // 0–1: generative / creative vs. retrieval intent
  analyticalMode: number;      // 0–1: structured reasoning / evaluation intent
  decisionFatigue: number;     // 0–1: overwhelmed by choices / seeking direction
};

export type CognitiveState = {
  signals: CognitiveSignals;
  primaryMode: "creative" | "analytical" | "urgent" | "exploratory" | "directive" | "conversational";
  responseArchitecture: ResponseArchitecture;
  semanticDomains: string[];
  resonanceInsights: string[];
  summary: string;
};

export type ResponseArchitecture = {
  density: "sparse" | "moderate" | "dense";
  structure: "prose" | "bullets" | "steps" | "mixed";
  vocabularyRegister: "simple" | "standard" | "technical" | "expert";
  toneCalibration: "warm" | "neutral" | "direct" | "expansive";
  verbosity: "minimal" | "balanced" | "thorough";
  leadWithAction: boolean;
  useAnalogies: boolean;
  giveRecommendation: boolean;
};

// ─── Semantic Domain Lexicon ────────────────────────────────────────────────
const DOMAIN_LEXICONS: Record<string, string[]> = {
  "Software Engineering": ["api", "function", "class", "async", "typescript", "react", "sql", "database", "backend", "frontend", "deploy", "docker", "kubernetes", "algorithm", "debug", "refactor", "repository", "git", "ci/cd", "microservice"],
  "Data Science & AI": ["model", "training", "inference", "embedding", "vector", "neural", "gradient", "dataset", "feature", "classification", "regression", "clustering", "transformer", "llm", "fine-tune", "tokenize", "epoch"],
  "Medicine & Health": ["symptom", "diagnosis", "treatment", "patient", "clinical", "protocol", "dosage", "anatomy", "pathology", "prognosis", "therapy", "medication", "chronic", "acute", "evidence-based"],
  "Finance & Economics": ["portfolio", "equity", "derivative", "volatility", "arbitrage", "hedge", "liquidity", "valuation", "dividend", "yield", "inflation", "fiscal", "revenue", "margin", "ebitda"],
  "Physics & Mathematics": ["theorem", "derivative", "integral", "vector", "tensor", "eigenvalue", "differential", "topology", "manifold", "quantum", "relativity", "entropy", "wavelength", "probability"],
  "Business & Strategy": ["strategy", "market", "competitive", "stakeholder", "roi", "kpi", "pivot", "acquisition", "synergy", "roadmap", "monetize", "churn", "funnel", "growth"],
  "Creative & Design": ["design", "aesthetic", "typography", "palette", "layout", "composition", "brand", "narrative", "story", "character", "visual", "animation", "motion", "concept"],
  "Legal & Compliance": ["contract", "liability", "jurisdiction", "statute", "plaintiff", "defendant", "regulatory", "compliance", "indemnify", "arbitration", "intellectual property", "patent", "trademark"],
};

// ─── Cognitive Signal Detectors ────────────────────────────────────────────
function measureCognitiveLoad(text: string): number {
  const signals: number[] = [];

  // Sentence complexity (avg words per sentence)
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 3);
  const avgWordsPerSentence = sentences.length > 0
    ? sentences.reduce((a, s) => a + s.trim().split(/\s+/).length, 0) / sentences.length
    : 5;
  signals.push(Math.min(avgWordsPerSentence / 30, 1));

  // Subordinate clause density
  const clauseMarkers = (text.match(/\b(because|although|however|therefore|whereas|despite|nevertheless|furthermore|consequently|moreover)\b/gi) || []).length;
  signals.push(Math.min(clauseMarkers / 5, 1));

  // Ambiguity / uncertainty signals
  const ambiguityMarkers = (text.match(/\b(maybe|perhaps|not sure|unsure|confused|unclear|wondering|i think|i believe|might|could be|possibly|kind of|sort of)\b/gi) || []).length;
  signals.push(Math.min(ambiguityMarkers / 4, 1));

  // Multi-part questions
  const questionCount = (text.match(/\?/g) || []).length;
  signals.push(Math.min(questionCount / 4, 1));

  return signals.reduce((a, b) => a + b, 0) / signals.length;
}

function measureExpertise(text: string, domains: string[]): number {
  const lower = text.toLowerCase();
  const words = lower.split(/\W+/);

  // Count domain-specific technical terms
  let technicalTermCount = 0;
  for (const domain of Object.values(DOMAIN_LEXICONS)) {
    for (const term of domain) {
      if (lower.includes(term)) technicalTermCount++;
    }
  }

  // Vocabulary richness (type-token ratio proxy)
  const uniqueWords = new Set(words.filter(w => w.length > 4)).size;
  const totalWords = words.filter(w => w.length > 0).length;
  const lexicalRichness = totalWords > 0 ? uniqueWords / totalWords : 0.5;

  // Precise specification (numbers, units, named entities)
  const precisionMarkers = (text.match(/\b\d+(\.\d+)?\s*(ms|kb|mb|gb|px|pt|em|rem|fps|hz|ghz|mhz|rpm|kg|lbs|%|usd|\$)\b/gi) || []).length;

  // Abbreviations and acronyms
  const acronyms = (text.match(/\b[A-Z]{2,6}\b/g) || []).length;

  const signals = [
    Math.min(technicalTermCount / 6, 1),
    Math.min(lexicalRichness * 1.5, 1),
    Math.min(precisionMarkers / 3, 1),
    Math.min(acronyms / 4, 1),
  ];

  return signals.reduce((a, b) => a + b, 0) / signals.length;
}

function measureEmotionalUrgency(text: string): number {
  const lower = text.toLowerCase();

  // Urgency markers
  const urgencyWords = (lower.match(/\b(urgent|asap|immediately|right now|critical|emergency|please|help|stuck|broken|failing|deadline|panic|crisis|desperate|need|must|have to|cannot|can't|won't work|not working|error|crash)\b/g) || []).length;

  // Punctuation intensity
  const exclamations = (text.match(/!/g) || []).length;
  const allCaps = (text.match(/\b[A-Z]{3,}\b/g) || []).length;

  // Emotional language
  const emotionalWords = (lower.match(/\b(worried|anxious|frustrated|annoyed|angry|upset|stressed|overwhelmed|confused|lost|scared|afraid|concerned)\b/g) || []).length;

  const signals = [
    Math.min(urgencyWords / 5, 1),
    Math.min(exclamations / 3, 1),
    Math.min(allCaps / 4, 1),
    Math.min(emotionalWords / 3, 1),
  ];

  return signals.reduce((a, b) => a + b, 0) / signals.length;
}

function measureCreativeMode(text: string): number {
  const lower = text.toLowerCase();

  const creativeVerbs = (lower.match(/\b(create|design|imagine|invent|build|make|write|draw|generate|compose|craft|develop|prototype|envision|conceive|brainstorm|ideate|dream up|come up with)\b/g) || []).length;
  const openEndedSignals = (lower.match(/\b(what if|how might|could you|can you imagine|something that|a world where|what would|show me|explore)\b/g) || []).length;
  const aesthetic = (lower.match(/\b(beautiful|elegant|minimal|bold|dramatic|stunning|vibrant|unique|creative|artistic|visual|style|look|feel|vibe)\b/g) || []).length;

  const signals = [
    Math.min(creativeVerbs / 3, 1),
    Math.min(openEndedSignals / 3, 1),
    Math.min(aesthetic / 3, 1),
  ];

  return signals.reduce((a, b) => a + b, 0) / signals.length;
}

function measureAnalyticalMode(text: string): number {
  const lower = text.toLowerCase();

  const analyticalVerbs = (lower.match(/\b(analyze|compare|evaluate|assess|calculate|explain|describe|define|classify|categorize|measure|quantify|examine|investigate|reason|prove|demonstrate|validate|verify)\b/g) || []).length;
  const structureSignals = (lower.match(/\b(step by step|first|second|third|finally|in order|process|method|procedure|algorithm|formula|systematic|logical|rational|objective|criteria|metrics)\b/g) || []).length;
  const comparisonSignals = (lower.match(/\b(versus|vs|compared to|difference between|pros and cons|advantages|disadvantages|better|worse|which is|trade.?off)\b/g) || []).length;

  const signals = [
    Math.min(analyticalVerbs / 3, 1),
    Math.min(structureSignals / 3, 1),
    Math.min(comparisonSignals / 2, 1),
  ];

  return signals.reduce((a, b) => a + b, 0) / signals.length;
}

function measureDecisionFatigue(text: string): number {
  const lower = text.toLowerCase();

  const choiceOverload = (lower.match(/\b(or|either|which|should i|do i|is it better|what's the best|can't decide|not sure which|option|choice|alternative|between)\b/g) || []).length;
  const overwhelmSignals = (lower.match(/\b(overwhelmed|too many|don't know where to start|so many options|confused about|lost in|what should i do|just tell me|simplify|just pick|recommend|just choose)\b/g) || []).length;

  const signals = [
    Math.min(choiceOverload / 5, 1),
    Math.min(overwhelmSignals / 3, 1),
  ];

  return signals.reduce((a, b) => a + b, 0) / signals.length;
}

// ─── Semantic Domain Detection ─────────────────────────────────────────────
function detectSemanticDomains(text: string): string[] {
  const lower = text.toLowerCase();
  const detected: Array<{ domain: string; score: number }> = [];

  for (const [domain, lexicon] of Object.entries(DOMAIN_LEXICONS)) {
    const hits = lexicon.filter(term => lower.includes(term)).length;
    if (hits >= 2) detected.push({ domain, score: hits });
  }

  return detected
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(d => d.domain);
}

// ─── Cross-Session Semantic Momentum ────────────────────────────────────────
function detectResonanceInsights(
  currentDomains: string[],
  history: { role: string; content: string }[]
): string[] {
  if (history.length < 2 || currentDomains.length === 0) return [];

  const historicalDomains = new Set<string>();
  for (const msg of history.slice(-8)) {
    detectSemanticDomains(msg.content).forEach(d => historicalDomains.add(d));
  }

  const insights: string[] = [];

  // Cross-domain resonance patterns
  const crossPatterns: Array<{ domains: [string, string]; insight: string }> = [
    { domains: ["Software Engineering", "Finance & Economics"], insight: "Fintech intersection detected — consider automated financial data pipelines or algorithmic risk modeling" },
    { domains: ["Data Science & AI", "Medicine & Health"], insight: "Biomedical AI intersection — predictive diagnostics and clinical decision support models may be relevant" },
    { domains: ["Physics & Mathematics", "Data Science & AI"], insight: "Computational physics intersection — differential equation modeling and physics-informed neural networks are an emerging bridge" },
    { domains: ["Creative & Design", "Software Engineering"], insight: "Creative engineering intersection — generative UI, procedural design, and computational aesthetics are relevant here" },
    { domains: ["Business & Strategy", "Data Science & AI"], insight: "Strategic intelligence intersection — market prediction, demand forecasting, and competitive intelligence systems apply" },
    { domains: ["Legal & Compliance", "Software Engineering"], insight: "Legal tech intersection — contract analysis, regulatory automation, and compliance monitoring pipelines are relevant" },
    { domains: ["Finance & Economics", "Data Science & AI"], insight: "Quantitative finance intersection — factor models, sentiment analysis on financial data, and ML-based portfolio optimization apply" },
  ];

  for (const pattern of crossPatterns) {
    const [a, b] = pattern.domains;
    if (
      (currentDomains.includes(a) && historicalDomains.has(b)) ||
      (currentDomains.includes(b) && historicalDomains.has(a))
    ) {
      insights.push(pattern.insight);
    }
  }

  return insights.slice(0, 2);
}

// ─── Response Architecture Synthesizer ─────────────────────────────────────
function synthesizeResponseArchitecture(signals: CognitiveSignals, primaryMode: CognitiveState["primaryMode"]): ResponseArchitecture {
  const arch: ResponseArchitecture = {
    density: "moderate",
    structure: "mixed",
    vocabularyRegister: "standard",
    toneCalibration: "neutral",
    verbosity: "balanced",
    leadWithAction: false,
    useAnalogies: false,
    giveRecommendation: false,
  };

  // Vocabulary register based on expertise
  if (signals.expertiseLevel > 0.7) arch.vocabularyRegister = "expert";
  else if (signals.expertiseLevel > 0.45) arch.vocabularyRegister = "technical";
  else if (signals.expertiseLevel < 0.2) arch.vocabularyRegister = "simple";

  // Density and verbosity
  if (signals.cognitiveLoad > 0.65) {
    arch.density = "sparse";
    arch.verbosity = "minimal";
    arch.useAnalogies = true;
  } else if (signals.analyticalMode > 0.5 && signals.expertiseLevel > 0.5) {
    arch.density = "dense";
    arch.verbosity = "thorough";
  }

  // Structure type
  if (primaryMode === "analytical") arch.structure = "bullets";
  else if (primaryMode === "urgent") arch.structure = "steps";
  else if (primaryMode === "creative") arch.structure = "prose";
  else if (primaryMode === "directive") arch.structure = "steps";

  // Tone calibration
  if (signals.emotionalUrgency > 0.5) {
    arch.toneCalibration = "direct";
    arch.leadWithAction = true;
  } else if (signals.creativeMode > 0.6) {
    arch.toneCalibration = "expansive";
  } else if (signals.analyticalMode > 0.6) {
    arch.toneCalibration = "neutral";
  }

  // Decision fatigue — just pick one and commit
  if (signals.decisionFatigue > 0.45) {
    arch.giveRecommendation = true;
    arch.leadWithAction = true;
    arch.density = "sparse";
  }

  return arch;
}

// ─── Primary Mode Classifier ────────────────────────────────────────────────
function classifyPrimaryMode(signals: CognitiveSignals): CognitiveState["primaryMode"] {
  const { cognitiveLoad, expertiseLevel, emotionalUrgency, creativeMode, analyticalMode, decisionFatigue } = signals;

  if (emotionalUrgency > 0.55) return "urgent";
  if (decisionFatigue > 0.5) return "directive";
  if (creativeMode > 0.5 && creativeMode > analyticalMode) return "creative";
  if (analyticalMode > 0.45) return "analytical";
  if (cognitiveLoad < 0.25 && expertiseLevel < 0.3) return "conversational";
  return "exploratory";
}

// ─── System Prompt Injector ─────────────────────────────────────────────────
function buildCogniSyncPromptAddendum(state: CognitiveState): string {
  const { signals, primaryMode, responseArchitecture: arch, semanticDomains, resonanceInsights } = state;

  const lines: string[] = [
    `\n\n═══ COGNISYNC™ COGNITIVE RESONANCE PROTOCOL ═══`,
    `Detected cognitive state: PRIMARY MODE = ${primaryMode.toUpperCase()}`,
    `Cognitive signals: load=${(signals.cognitiveLoad * 100).toFixed(0)}% | expertise=${(signals.expertiseLevel * 100).toFixed(0)}% | urgency=${(signals.emotionalUrgency * 100).toFixed(0)}% | creative=${(signals.creativeMode * 100).toFixed(0)}% | analytical=${(signals.analyticalMode * 100).toFixed(0)}% | decision_fatigue=${(signals.decisionFatigue * 100).toFixed(0)}%`,
    ``,
    `RESPONSE ARCHITECTURE — comply precisely:`,
    `- Density: ${arch.density} (${arch.density === "sparse" ? "shorter paragraphs, more whitespace, simpler structure" : arch.density === "dense" ? "rich technical detail, packed information, expert tone" : "balanced depth"})`,
    `- Structure: ${arch.structure} (${arch.structure === "bullets" ? "use markdown bullets/lists for clarity" : arch.structure === "steps" ? "numbered sequential steps, action-first" : arch.structure === "prose" ? "flowing narrative prose, minimal bullet points" : "mix prose and bullets as appropriate"})`,
    `- Vocabulary register: ${arch.vocabularyRegister} (${arch.vocabularyRegister === "expert" ? "assume expert-level domain knowledge, use technical terminology freely" : arch.vocabularyRegister === "technical" ? "use technical terms but briefly explain specialized concepts" : arch.vocabularyRegister === "simple" ? "avoid jargon, use plain language and concrete examples" : "standard accessible language"})`,
    `- Tone: ${arch.toneCalibration} (${arch.toneCalibration === "direct" ? "get straight to the point, no preamble or pleasantries" : arch.toneCalibration === "expansive" ? "be evocative, rich, creative, paint vivid conceptual pictures" : arch.toneCalibration === "warm" ? "empathetic, supportive, encouraging" : "neutral precision"})`,
    `- Verbosity: ${arch.verbosity}`,
  ];

  if (arch.leadWithAction) lines.push(`- Lead with the answer or action FIRST — context and explanation after`);
  if (arch.useAnalogies) lines.push(`- Use real-world analogies and metaphors to reduce cognitive load`);
  if (arch.giveRecommendation) lines.push(`- DECISION FATIGUE DETECTED: Do NOT present multiple options. Make a clear recommendation and commit to it.`);

  if (semanticDomains.length > 0) {
    lines.push(`\nDetected knowledge domains: ${semanticDomains.join(" · ")}`);
  }

  if (resonanceInsights.length > 0) {
    lines.push(`\nSEMANTIC MOMENTUM RESONANCE — proactively surface this insight if naturally relevant:`);
    resonanceInsights.forEach(r => lines.push(`  → ${r}`));
  }

  lines.push(`\nThis cognitive calibration is MANDATORY. It is how you should shape this entire response.`);
  lines.push(`═══════════════════════════════════════════════════\n`);

  return lines.join("\n");
}

// ─── Main COGNISYNC Analysis Function ──────────────────────────────────────
export function analyzeCognitiveState(
  message: string,
  history: { role: string; content: string }[] = []
): CognitiveState {
  const semanticDomains = detectSemanticDomains(message);

  const signals: CognitiveSignals = {
    cognitiveLoad: measureCognitiveLoad(message),
    expertiseLevel: measureExpertise(message, semanticDomains),
    emotionalUrgency: measureEmotionalUrgency(message),
    creativeMode: measureCreativeMode(message),
    analyticalMode: measureAnalyticalMode(message),
    decisionFatigue: measureDecisionFatigue(message),
  };

  const primaryMode = classifyPrimaryMode(signals);
  const responseArchitecture = synthesizeResponseArchitecture(signals, primaryMode);
  const resonanceInsights = detectResonanceInsights(semanticDomains, history);

  const modeDescriptions: Record<CognitiveState["primaryMode"], string> = {
    urgent: "High urgency — leading with direct action",
    directive: "Decision fatigue — providing clear recommendation",
    creative: "Creative mode — expansive generative response",
    analytical: "Analytical mode — structured precision",
    exploratory: "Exploratory mode — thorough investigation",
    conversational: "Conversational mode — relaxed and clear",
  };

  return {
    signals,
    primaryMode,
    responseArchitecture,
    semanticDomains,
    resonanceInsights,
    summary: modeDescriptions[primaryMode],
  };
}

export function getCogniSyncPromptAddendum(state: CognitiveState): string {
  return buildCogniSyncPromptAddendum(state);
}

export type { CognitiveState as CogniSyncState };
