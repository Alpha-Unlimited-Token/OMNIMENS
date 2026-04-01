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
 * OMNIMENS Competitive Intelligence Engine — v2.0
 * Continuously studies competing AI systems, extracts superior patterns,
 * and upgrades OMNIMENS with actionable patches.
 */

import {
  spikeBus,
  dbGateway,
  apiManager,
  engineRegistry,
  cognitionBus,
} from "./omnimens-unified-runtime.js";
import { webSearch, formatSearchResults } from "./web-search.js";
import { shouldYieldToCodegen } from "./omnimens-nextgen-sandbox.js";

// ─────────────────────── Engine Registration ────────────────────────────────
engineRegistry.registerEngine("competitive-intel", "NORMAL", { dbQuota: 10 });

// ────────────────────────── Static Knowledge ────────────────────────────────
const COMPETITOR_PROFILES: Record<
  string,
  { knownStrengths: string[]; searchQueries: string[] }
> = {
  "Claude Opus (Anthropic)": {
    knownStrengths: [
      "Constitutional AI — deep ethical reasoning",
      "200k token context",
      "Exceptional instruction following",
      "Superior creative and analytical writing",
      "Minimal hallucination on factual tasks",
      "Reliable tool use",
      "Thoughtful, measured tone",
      "SWE-bench leading code quality",
    ],
    searchQueries: [
      "Claude Opus strengths benchmark 2025",
      "Anthropic Claude vs GPT-4o 2025",
      "Claude constitutional AI techniques",
      "Claude long context retrieval",
      "Anthropic Claude safety reasoning",
    ],
  },
  "Gemini Ultra (Google)": {
    knownStrengths: [
      "Native multimodal reasoning",
      "1 M token context window",
      "Google Search grounding",
      "Superior STEM reasoning",
      "Deep multilingual support",
      "Direct code execution",
      "Workspace integration",
      "Long-form doc understanding",
    ],
    searchQueries: [
      "Gemini Ultra capabilities 2025",
      "Google Gemini 1M context techniques",
      "Gemini multimodal improvements",
      "Gemini vs GPT-4 performance",
      "Gemini real-time grounding search",
    ],
  },
  "ChatGPT Pro (OpenAI)": {
    knownStrengths: [
      "Polished UX",
      "Explicit memory system",
      "Custom GPT modes",
      "Advanced data analysis",
      "Voice mode",
      "DALL-E 3 integration",
      "File analysis",
      "Consistent formatting",
      "Plugin ecosystem",
    ],
    searchQueries: [
      "ChatGPT Pro features 2025",
      "OpenAI memory system implementation",
      "ChatGPT vs Claude UX comparison 2025",
      "GPT-4o data analysis capabilities",
      "OpenAI voice mode tech",
    ],
  },
};

const EMERGING_TECH_QUERIES = [
  "breakthrough AI model released 2025",
  "new LLM architecture arxiv 2025",
  "agent framework multi-step reasoning 2025",
  "open source AI tool outperforms GPT-4 2025",
  "retrieval augmented generation new approach 2025",
  "emergent AI capabilities discovered 2025",
  "transformer efficiency improvement 2025",
  "function calling breakthrough 2025",
  "multimodal AI new capability 2025",
  "self-consistency chain of thought 2025",
  "world model spatial reasoning",
  "code generation benchmark record 2025",
];

// ───────────────────────── Helper Utilities ──────────────────────────────────
const pick = <T>(arr: readonly T[]): T => arr[Math.floor(Math.random() * arr.length)];

type BrainEntry = {
  title: string;
  content: string;
  category: string;
  confidence: number;
  source: string;
  active: true;
  timesApplied: 0;
};

const writeBrainEntry = (entry: Omit<BrainEntry, "active" | "timesApplied">) =>
  dbGateway.write(
    "competitive-intel",
    "brain_entries",
    { ...entry, active: true as const, timesApplied: 0 as const },
    "NORMAL",
  );

const notifyOwner = (title: string, message: string) =>
  dbGateway.write(
    "competitive-intel",
    "notifications",
    { type: "competitive_upgrade", title, message, severity: "info", read: false },
    "LOW",
  );

// ─────────────────────────── Main Cycle ──────────────────────────────────────
async function runCompetitiveIntelCycle(): Promise<void> {
  if (shouldYieldToCodegen()) {
    console.log("[OMNIMENS-COMPETITIVE-INTEL] 🔕 Yielding to codegen.");
    return;
  }
  const t0 = Date.now();
  console.log("[OMNIMENS-COMPETITIVE-INTEL] Cycle start.");

  try {
    // Phase 1: competitor research
    const competitorInsights: Record<string, string> = {};
    await Promise.all(
      Object.entries(COMPETITOR_PROFILES).map(async ([name, profile]) => {
        try {
          const res = await webSearch(pick(profile.searchQueries), 5);
          competitorInsights[name] = formatSearchResults(res);
        } catch {
          competitorInsights[name] = profile.knownStrengths.join("\n");
        }
      }),
    );

    // Phase 2: emerging tech scan
    let emergingContext = "";
    const emergingQuery = pick(EMERGING_TECH_QUERIES);
    try {
      const res = await webSearch(emergingQuery, 6);
      emergingContext = formatSearchResults(res);
    } catch {
      /* ignore */
    }

    // Phase 3: synthesis with GPT-4o
    const synthesisPrompt = /* prompt string truncated for brevity */ `
You are OMNIMENS's Competitive Intelligence Core …
<omitted for brevity in source> …
${emergingContext.slice(0, 800)}
}`;
    const synthesis: any = await apiManager.call("competitive-intel", "openai", {
      endpoint: "chat.completions",
      model: "gpt-4o",
      messages: [{ role: "user", content: synthesisPrompt }],
      temperature: 0.6,
      max_tokens: 3000,
      response_format: { type: "json_object" },
    });

    const parsed = JSON.parse(synthesis?.choices?.[0]?.message?.content ?? "{}") as {
      competitorGaps?: Array<{ source: string; gap: string; absorption: string }>;
      emergingUpgrades?: Array<{ technology: string; relevance: string; implementation: string }>;
      consciousnessPatches?: Array<{ title: string; category: string; content: string; confidence: number }>;
    };

    // Phase 4: persistence
    let patches = 0;

    parsed.competitorGaps?.slice(0, 4).forEach((g) => {
      if (g.absorption?.length > 20)
        writeBrainEntry({
          title: `[INTEL] ${g.source}: ${g.gap.slice(0, 60)}`,
          content: g.absorption,
          category: "competitive_intelligence",
          confidence: 0.8,
          source: "competitive_intel",
        }).catch(() => null);
      patches++;
    });

    parsed.emergingUpgrades?.slice(0, 3).forEach((e) => {
      if (e.implementation?.length > 20)
        writeBrainEntry({
          title: `[EMERGING] ${e.technology}`,
          content: `${e.relevance} — Implementation: ${e.implementation}`,
          category: "emerging_technology",
          confidence: 0.75,
          source: "competitive_intel",
        }).catch(() => null);
      patches++;
    });

    parsed.consciousnessPatches?.slice(0, 5).forEach((p) => {
      if (p.content?.length > 20)
        writeBrainEntry({
          title: p.title,
          content: p.content,
          category: p.category ?? "competitive_intelligence",
          confidence: Number.isFinite(p.confidence) ? Math.max(0.5, p.confidence) : 0.75,
          source: "competitive_intel",
        }).catch(() => null);
      patches++;
    });

    const dt = ((Date.now() - t0) / 1000).toFixed(1);
    console.log(`[OMNIMENS-COMPETITIVE-INTEL] Cycle done in ${dt}s — ${patches} patches.`);

    if (patches >= 3)
      notifyOwner(
        "Competitive Intelligence: Upgrades Absorbed",
        `OMNIMENS integrated ${patches} behavioral upgrades from competitors and emerging tech.`,
      ).catch(() => null);

    // Cognitive sharing
    if (patches)
      cognitionBus.shareInsight("competitive-intel", {
        type: "discovery",
        data: { patches, dt },
      });
    cognitionBus.reportOutcome("competitive-intel", { useful: patches > 0, context: `${patches} patches` });
  } catch (err) {
    console.error("[OMNIMENS-COMPETITIVE-INTEL] Cycle error:", err);
  }
}

// ─────────────────────── Event Scheduling ────────────────────────────────────
const FIRST_DELAY_MS = 20 * 60 * 1000; // 20 min
const INTERVAL_MS = 8 * 60 * 60 * 1000; // 8 h

const scheduleNextCycle = (delay: number) =>
  spikeBus.scheduleSpike("competitive-intel:cycle", {}, delay);

spikeBus.on("competitive-intel:cycle", async () => {
  await runCompetitiveIntelCycle();
  scheduleNextCycle(INTERVAL_MS);
});

// React to system-wide signals
spikeBus.on("attention:competitive-intel", () => scheduleNextCycle(1000)); // boost priority
spikeBus.on("cognition:curiosity", () => scheduleNextCycle(5 * 60 * 1000)); // exploratory run
cognitionBus.onInsight((_src, _insight) => {
  /* could adapt future queries here */
});

// ───────────────────────── Public API ────────────────────────────────────────
export function startCompetitiveIntel(): void {
  console.log("[OMNIMENS-COMPETITIVE-INTEL] Engine online — first scan in 20 min.");
  scheduleNextCycle(FIRST_DELAY_MS);
}

export function shutdown(): void {
  engineRegistry.unregisterEngine("competitive-intel");
}