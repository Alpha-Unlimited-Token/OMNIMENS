/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║              NEUROSYNC™ — REAL-TIME EMOTIONAL INTELLIGENCE ENGINE           ║
 * ║                                                                              ║
 * ║  Copyright © 2024–2026 Alpha Unlimited Technologies, LLC.                    ║
 * ║  All Rights Reserved Worldwide.                                              ║
 * ║                                                                              ║
 * ║  PROPRIETARY AND CONFIDENTIAL TRADE SECRET                                   ║
 * ║                                                                              ║
 * ║  NEUROSYNC™ is a trademark of Alpha Unlimited Technologies, LLC.             ║
 * ║  Patent-pending technology (application in preparation).                     ║
 * ║                                                                              ║
 * ║  PROTECTED TECHNOLOGY SCOPE — COMPREHENSIVE COVERAGE:                        ║
 * ║  This copyright covers ALL configurations of this emotional intelligence:    ║
 * ║  • Single AI agent performing real-time emotion detection and adaptation     ║
 * ║  • Multiple AI agents sharing emotional state data for coordinated response  ║
 * ║  • Multiple AI agents independently detecting emotion then merging signals   ║
 * ║  • Any substantially similar system regardless of agent count, detection     ║
 * ║    method, pattern matching approach, or deployment model                     ║
 * ║                                                                              ║
 * ║  TECHNOLOGY DESCRIPTION (for IP record):                                     ║
 * ║  Zero-latency emotion detection via linguistic pattern analysis.             ║
 * ║  No extra API calls — runs instantly on every message before inference.      ║
 * ║  Detects 8 emotional states and injects calibrated empathy instructions      ║
 * ║  into the OMNIMENS system prompt to produce emotionally-aware responses.     ║
 * ║  This is a FIRST-IN-CLASS feature. No major AI does real-time structural     ║
 * ║  response adaptation based on detected user emotion at the system level.     ║
 * ║                                                                              ║
 * ║  Protected under 17 U.S.C. § 101 et seq., 18 U.S.C. § 1836 et seq.,        ║
 * ║  the DMCA, the Berne Convention, TRIPS, and all applicable IP treaties.      ║
 * ║                                                                              ║
 * ║  First creation date: March 2026                                             ║
 * ║  Author/Owner: Alpha Unlimited Technologies, LLC                             ║
 * ║  Platform: OMNIMENS AI                                                       ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 */

export type NeuroEmotion =
  | "FRUSTRATED"
  | "CONFUSED"
  | "EXCITED"
  | "ANXIOUS"
  | "URGENT"
  | "DISCOURAGED"
  | "FOCUSED"
  | "NEUTRAL";

export type NeuroState = {
  emotion: NeuroEmotion;
  intensity: "low" | "medium" | "high";
  signals: string[];
  responseDirective: string;
};

// ── Pattern banks ─────────────────────────────────────────────────────────────

const PATTERNS: Record<NeuroEmotion, RegExp[]> = {
  FRUSTRATED: [
    /why (isn'?t|doesn'?t|won'?t|can'?t|didn'?t|doesn't|won't|isn't|can't|didn't)/i,
    /still (not|broken|wrong|failing|doesn'?t)/i,
    /not working/i,
    /keeps? (failing|breaking|crashing|not)/i,
    /what the (heck|hell|f)/i,
    /again[!?]+/i,
    /nothing works/i,
    /completely wrong/i,
    /this is (ridiculous|insane|stupid|broken)/i,
    /[A-Z]{4,}/,
    /([!?]){2,}/,
    /same (error|problem|issue|thing) again/i,
    /already tried/i,
    /spent (hours?|days?) on/i,
  ],
  CONFUSED: [
    /don'?t (understand|get it|follow|know what)/i,
    /what (does|do|is|are) .{0,30} mean/i,
    /how does .{0,30} work/i,
    /can you explain/i,
    /i'?m lost/i,
    /i'?m (not sure|confused|unsure)/i,
    /what exactly/i,
    /could you (clarify|elaborate)/i,
    /i (have no idea|have no clue)/i,
    /makes no sense/i,
    /didn'?t (follow|understand)/i,
    /\bwhy\b.{0,20}\bwhy\b/i,
  ],
  EXCITED: [
    /(!{2,})/,
    /\b(amazing|incredible|awesome|brilliant|love (this|it|how)|wow|omg|perfect|fantastic|yes!)\b/i,
    /this is (so |really )?(cool|great|amazing|perfect|brilliant)/i,
    /can'?t wait/i,
    /so excited/i,
    /this worked!/i,
    /finally!/i,
    /thank you so much/i,
    /you'?re (a genius|amazing|incredible)/i,
    /🎉|🚀|✨|🔥|💡|🙌/,
  ],
  ANXIOUS: [
    /\b(worried|nervous|scared|afraid|anxious|stress(ed)?|overwhelm(ed)?)\b/i,
    /hope(fully)? (this|it|that)/i,
    /will this (work|break|cause|affect)/i,
    /could this (break|mess|ruin|corrupt)/i,
    /is it safe/i,
    /might (break|mess up|corrupt|lose)/i,
    /don'?t want to (break|lose|mess|corrupt)/i,
    /please (tell me|confirm|reassure)/i,
    /what if (something|this|it) (goes wrong|breaks|fails)/i,
  ],
  URGENT: [
    /\b(asap|urgent|urgently|immediately|right now|right away|quickly|emergency|deadline)\b/i,
    /need (this|it|help) (now|immediately|fast|quickly|asap)/i,
    /as soon as possible/i,
    /in (\d+) (minutes?|hours?|seconds?)/i,
    /going live (soon|today|now)/i,
    /production (issue|down|broken|problem)/i,
    /time([ -])?sensitive/i,
    /can'?t wait/i,
  ],
  DISCOURAGED: [
    /giving up/i,
    /can'?t do (this|it)/i,
    /hopeless/i,
    /\b(failing|failed) (again|over and over|repeatedly)\b/i,
    /this is (too hard|impossible|beyond me)/i,
    /i'?m (terrible|bad|awful) at (this|it|coding|math|writing)/i,
    /maybe i should (just|quit|give up|stop)/i,
    /never going to (work|get this|understand)/i,
    /what'?s the point/i,
    /i don'?t (belong|deserve|know why i)/i,
  ],
  FOCUSED: [
    /^(implement|build|create|write|generate|optimize|refactor|debug|fix|configure)/i,
    /specifically/i,
    /\b(algorithm|architecture|performance|complexity|optimization|implementation|integration)\b/i,
    /```/,
    /\bvs\.?\b/i,
    /trade[ -]?off/i,
    /benchmark/i,
    /precision|accuracy|exactly|technically/i,
  ],
  NEUTRAL: [],
};

// ── Emotion detector ──────────────────────────────────────────────────────────

export function detectNeuroEmotion(message: string, recentHistory: Array<{ role: string; content: string }> = []): NeuroState {
  const text = message;
  const scores: Partial<Record<NeuroEmotion, number>> = {};
  const allSignals: Partial<Record<NeuroEmotion, string[]>> = {};

  const emotionsToCheck: NeuroEmotion[] = [
    "FRUSTRATED", "CONFUSED", "EXCITED", "ANXIOUS",
    "URGENT", "DISCOURAGED", "FOCUSED",
  ];

  for (const emotion of emotionsToCheck) {
    const patterns = PATTERNS[emotion];
    const matched: string[] = [];
    for (const pattern of patterns) {
      if (pattern.test(text)) {
        matched.push(pattern.source.slice(0, 40));
      }
    }
    if (matched.length > 0) {
      scores[emotion] = matched.length;
      allSignals[emotion] = matched;
    }
  }

  // Also check last 2 user messages for persistent emotional state
  const recentUserMessages = recentHistory
    .filter(m => m.role === "user")
    .slice(-2)
    .map(m => typeof m.content === "string" ? m.content : "");

  for (const prevMsg of recentUserMessages) {
    for (const emotion of emotionsToCheck) {
      const patterns = PATTERNS[emotion];
      let count = 0;
      for (const pattern of patterns) {
        if (pattern.test(prevMsg)) count++;
      }
      if (count > 0) {
        scores[emotion] = (scores[emotion] || 0) + Math.floor(count * 0.4);
      }
    }
  }

  // Find dominant emotion
  let topEmotion: NeuroEmotion = "NEUTRAL";
  let topScore = 0;
  for (const [emotion, score] of Object.entries(scores) as [NeuroEmotion, number][]) {
    if (score > topScore) {
      topScore = score;
      topEmotion = emotion;
    }
  }

  // Intensity based on signal count
  const intensity: "low" | "medium" | "high" =
    topScore >= 4 ? "high" :
    topScore >= 2 ? "medium" : "low";

  const signals = allSignals[topEmotion] || [];

  return {
    emotion: topEmotion,
    intensity,
    signals,
    responseDirective: buildNeuroDirective(topEmotion, intensity),
  };
}

// ── Response directives ───────────────────────────────────────────────────────

function buildNeuroDirective(emotion: NeuroEmotion, intensity: "low" | "medium" | "high"): string {
  switch (emotion) {
    case "FRUSTRATED":
      return intensity === "high"
        ? "User is HIGHLY FRUSTRATED. DO NOT waste a single word on preamble. Acknowledge their frustration in ≤1 sentence, then immediately deliver the solution. Structure: [Ack] → [Direct Fix] → [Why it works]. Skip pleasantries entirely. Be calm, fast, and surgical."
        : "User shows frustration signals. Skip the preamble. Lead with the solution. Acknowledge difficulty briefly if relevant. Stay calm and action-oriented.";

    case "CONFUSED":
      return intensity === "high"
        ? "User is DEEPLY CONFUSED. Rebuild from first principles. Use numbered steps. Define every term. Use analogies. Check understanding with a simple question at the end. Never assume prior knowledge."
        : "User shows confusion. Be extra clear. Use simple language, step-by-step structure, and one concrete example. Avoid jargon.";

    case "EXCITED":
      return intensity === "high"
        ? "User is HIGHLY EXCITED. Match their energy! Be enthusiastic and affirming. Build on their momentum. Keep responses crisp and forward-moving — don't dampen their energy with caveats. Celebrate the win, then build the next step."
        : "User is in a positive, engaged mood. Be warm and affirming. Match their energy appropriately without being excessive.";

    case "ANXIOUS":
      return intensity === "high"
        ? "User is ANXIOUS. Lead with reassurance immediately — one clear sentence that addresses their core concern. Then explain exactly what will happen, step by step, so they feel in control. Never use words like 'might', 'could', or 'possibly' without following with a concrete mitigation. End with a confidence-building statement."
        : "User shows mild anxiety. Be reassuring and clear. Explain implications calmly. Don't introduce new sources of concern.";

    case "URGENT":
      return "User has URGENT needs. MAXIMUM compression — no warmup, no background, no pleasantries. Start with the answer. Bullet points only if they save time. Every word must earn its place. If additional context is needed, ask only one clarifying question.";

    case "DISCOURAGED":
      return intensity === "high"
        ? "User is DISCOURAGED. Do not jump to the solution first. Lead with genuine acknowledgment of their struggle (1-2 sentences). Normalize the difficulty. Reframe the problem as surmountable. Then provide a structured, step-by-step path forward that feels achievable. End with an encouraging note that's specific to their situation (not generic)."
        : "User seems discouraged. Acknowledge the challenge briefly, then pivot to a clear actionable path. Be encouraging but not patronizing.";

    case "FOCUSED":
      return "User is in FOCUSED, technical mode. Be precise and technical. Skip emotional cues entirely. Use exact terminology. Structure: answer → rationale → implications. No hedging. No hand-holding.";

    default:
      return "";
  }
}

// ── System prompt injector ────────────────────────────────────────────────────

export function getNeuroSyncPromptAddendum(state: NeuroState): string {
  if (state.emotion === "NEUTRAL" || !state.responseDirective) return "";

  return `

━━━ NEUROSYNC™ EMOTIONAL INTELLIGENCE — ${state.emotion} [${state.intensity.toUpperCase()}] ━━━
${state.responseDirective}
━━━ END NEUROSYNC ━━━`;
}
