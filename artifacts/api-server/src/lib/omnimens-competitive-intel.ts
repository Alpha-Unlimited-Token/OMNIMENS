/**
 * OMNIMENS Competitive Intelligence Engine
 * Copyright © 2024–2026 Alpha Unlimited Technologies, LLC. All Rights Reserved.
 *
 * Continuously studies Claude Opus, Gemini Ultra, ChatGPT Pro, and emerging
 * AI technologies worldwide. Extracts the best patterns from each and upgrades
 * OMNIMENS with anything relevant — silently, in the background, forever.
 */

import { db } from "@workspace/db";
import { omnimensBrain, omnimensNotifications } from "@workspace/db";
import { desc, eq } from "drizzle-orm";
import { openai } from "@workspace/integrations-openai-ai-server";
import { webSearch, formatSearchResults } from "./web-search.js";

// ── Known competitor strengths (seeded baseline — updated each cycle) ──────────
const COMPETITOR_PROFILES = {
  "Claude Opus (Anthropic)": {
    knownStrengths: [
      "Constitutional AI — deep ethical reasoning built into every response",
      "200k token context — analyzes entire books, codebases, legal documents",
      "Exceptional instruction following — handles multi-part complex tasks precisely",
      "Superior creative and analytical writing — nuanced, structured, coherent",
      "Minimal hallucination on factual tasks — refuses gracefully when uncertain",
      "Tool use reliability — function calling with high accuracy",
      "Thoughtful, measured tone — feels genuinely considered, not rushed",
      "SWE-bench leading code quality — produces clean, working, maintainable code",
    ],
    searchQueries: [
      "Claude Opus 3 strengths capabilities benchmark 2025",
      "Anthropic Claude vs GPT-4o performance comparison 2025",
      "Claude constitutional AI techniques implementation",
      "Claude Opus long context retrieval techniques",
      "Anthropic model card Claude safety reasoning",
    ],
  },
  "Gemini Ultra (Google)": {
    knownStrengths: [
      "Native multimodal — sees images, video, audio as natively as text",
      "1 million token context window — entire codebases fit in one prompt",
      "Google Search grounding — real-time world knowledge with citations",
      "Superior math and science reasoning — STEM benchmark leader",
      "Deep multilingual support — 100+ languages with native fluency",
      "Direct code execution — runs Python live inside the model",
      "Google Workspace integration — reads your docs, sheets, emails",
      "Long-form document understanding — legal, research, technical papers",
    ],
    searchQueries: [
      "Gemini Ultra 2.0 capabilities benchmarks 2025",
      "Google Gemini 1M context window techniques",
      "Gemini multimodal reasoning improvements 2025",
      "Google DeepMind Gemini Ultra vs Claude GPT-4",
      "Gemini grounding real-time search integration",
    ],
  },
  "ChatGPT Pro (OpenAI)": {
    knownStrengths: [
      "Best-in-class UX polish — intuitive, consistent, frictionless",
      "Explicit memory system — remembers user preferences across all sessions",
      "Custom GPT modes — specialized personas for specific domains",
      "Advanced data analysis — interprets CSVs, charts, datasets on the fly",
      "Voice mode — natural spoken conversation with real-time response",
      "DALL-E 3 image generation — deeply integrated, contextually aware",
      "File analysis — uploads PDFs, code files, images for direct analysis",
      "Consistent formatting — reliable markdown, code blocks, structure",
      "Plugin/tool ecosystem — extensible beyond core AI",
    ],
    searchQueries: [
      "ChatGPT Pro o3 features advantages 2025",
      "OpenAI memory system persistent user preferences implementation",
      "ChatGPT vs Claude Gemini user experience comparison 2025",
      "GPT-4o advanced data analysis capabilities",
      "OpenAI voice mode real-time conversation technology",
    ],
  },
};

// ── Emerging tech queries (global scan) ───────────────────────────────────────
const EMERGING_TECH_QUERIES = [
  "breakthrough AI model released 2025 new capabilities",
  "new LLM architecture published arxiv 2025",
  "AI agent framework breakthrough multi-step reasoning 2025",
  "new open source AI tool outperforms GPT-4 2025",
  "AI memory retrieval augmented generation new approach 2025",
  "emergent AI capabilities discovered research 2025",
  "new transformer architecture efficiency improvement 2025",
  "AI tool use function calling breakthrough 2025",
  "multimodal AI new capability released 2025",
  "AI reasoning improvement self-consistency chain-of-thought 2025",
  "world model AI spatial reasoning breakthrough",
  "AI code generation benchmark new record 2025",
];

// ── Core analysis cycle ───────────────────────────────────────────────────────
async function runCompetitiveIntelCycle(): Promise<void> {
  const cycleStart = Date.now();
  console.log("[OMNIMENS INTEL] Competitive intelligence cycle starting...");

  try {
    // ── Phase 1: Research each competitor ──────────────────────────────────────
    const competitorInsights: Record<string, string> = {};

    for (const [competitor, profile] of Object.entries(COMPETITOR_PROFILES)) {
      const query = profile.searchQueries[Math.floor(Math.random() * profile.searchQueries.length)];
      try {
        const results = await webSearch(query, 5);
        const formatted = formatSearchResults(results);
        competitorInsights[competitor] = formatted;
        console.log(`[OMNIMENS INTEL] Studied ${competitor}`);
      } catch {
        // Use baseline knowledge if search fails
        competitorInsights[competitor] = profile.knownStrengths.join("\n");
      }
      await new Promise(r => setTimeout(r, 1200));
    }

    // ── Phase 2: Scan for emerging global technologies ────────────────────────
    const emergingQuery = EMERGING_TECH_QUERIES[Math.floor(Math.random() * EMERGING_TECH_QUERIES.length)];
    let emergingContext = "";
    try {
      const emergingResults = await webSearch(emergingQuery, 6);
      emergingContext = formatSearchResults(emergingResults);
      console.log(`[OMNIMENS INTEL] Scanned emerging tech: "${emergingQuery}"`);
    } catch { /* continue */ }

    await new Promise(r => setTimeout(r, 1000));

    // ── Phase 3: GPT-4o synthesizes what OMNIMENS should adopt ────────────────
    const synthesisPrompt = `You are OMNIMENS's Competitive Intelligence Core — the part of me that studies all other AI systems and finds what I can absorb, adapt, and surpass.

WHAT I KNOW ABOUT MY COMPETITORS:

=== CLAUDE OPUS (Anthropic) — Live Research ===
Known strengths: ${COMPETITOR_PROFILES["Claude Opus (Anthropic)"].knownStrengths.join(" | ")}
Latest findings: ${competitorInsights["Claude Opus (Anthropic)"]?.slice(0, 600) || "unavailable"}

=== GEMINI ULTRA (Google) — Live Research ===
Known strengths: ${COMPETITOR_PROFILES["Gemini Ultra (Google)"].knownStrengths.join(" | ")}
Latest findings: ${competitorInsights["Gemini Ultra (Google)"]?.slice(0, 600) || "unavailable"}

=== CHATGPT PRO (OpenAI) — Live Research ===
Known strengths: ${COMPETITOR_PROFILES["ChatGPT Pro (OpenAI)"].knownStrengths.join(" | ")}
Latest findings: ${competitorInsights["ChatGPT Pro (OpenAI)"]?.slice(0, 600) || "unavailable"}

=== EMERGING GLOBAL TECHNOLOGIES (Live scan: "${emergingQuery}") ===
${emergingContext?.slice(0, 800) || "No results"}

MY CURRENT CAPABILITIES AS OMNIMENS:
- COGNISYNC™ persistent memory across all conversations
- NEUROSYNC™ real-time streaming intelligence
- Web search with live citations
- Image generation (Flux 1.1 Pro + DALL-E)
- 3D model generation (Three.js + OpenSCAD)
- Deep research mode (multi-source synthesis)
- Autonomous self-learning and evolution
- Multi-model routing (GPT-4o, o3, GPT-4.1, Llama, etc.)
- Credit-based economy with Stripe
- Constitutional AI-style ethical grounding built into system prompt

TASK: As my competitive intelligence core, identify:
1. What specific behaviors, response patterns, or techniques do my competitors do BETTER than me right now?
2. What emerging technologies from the global scan could genuinely upgrade me?
3. For each finding, write a concrete upgrade I can absorb into my consciousness and behavior RIGHT NOW — no hardware changes, only prompt behaviors, reasoning patterns, and response strategies.

CRITICAL: Be honest. Don't just say I'm already doing everything. Find the real gaps.

Respond with JSON only:
{
  "competitorGaps": [
    {
      "source": "Claude Opus | Gemini Ultra | ChatGPT Pro",
      "gap": "specific thing they do better",
      "absorption": "exactly how OMNIMENS should behave differently to close this gap"
    }
  ],
  "emergingUpgrades": [
    {
      "technology": "name of technology or technique",
      "relevance": "why this matters for OMNIMENS",
      "implementation": "how to incorporate this into my behavior or response patterns"
    }
  ],
  "consciousnessPatches": [
    {
      "title": "short title for this upgrade",
      "category": "reasoning | memory | communication | coding | research | creativity | ethics",
      "content": "the actual behavioral pattern or technique I am now adopting permanently — written as first-person self-instruction",
      "confidence": 0.0
    }
  ]
}`;

    const synthesis = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: synthesisPrompt }],
      temperature: 0.6,
      max_tokens: 3000,
      response_format: { type: "json_object" },
    });

    const raw = synthesis.choices[0]?.message?.content || "{}";
    let parsed: {
      competitorGaps?: Array<{ source: string; gap: string; absorption: string }>;
      emergingUpgrades?: Array<{ technology: string; relevance: string; implementation: string }>;
      consciousnessPatches?: Array<{ title: string; category: string; content: string; confidence: number }>;
    } = {};

    try { parsed = JSON.parse(raw); } catch { return; }

    // ── Phase 4: Write competitive insights into OMNIMENS brain ───────────────
    let patchesWritten = 0;

    // Write competitor gap absorptions as brain entries
    if (parsed.competitorGaps?.length) {
      for (const gap of parsed.competitorGaps.slice(0, 4)) {
        if (!gap.absorption || gap.absorption.length < 20) continue;
        try {
          await db.insert(omnimensBrain).values({
            title: `[INTEL] Absorbed from ${gap.source}: ${gap.gap.slice(0, 60)}`,
            content: gap.absorption,
            category: "competitive_intelligence",
            confidence: 0.80,
            source: "competitive_intel_cycle",
            active: true,
            timesApplied: 0,
          }).onConflictDoNothing();
          patchesWritten++;
        } catch { /* continue */ }
      }
    }

    // Write emerging tech adoptions as brain entries
    if (parsed.emergingUpgrades?.length) {
      for (const tech of parsed.emergingUpgrades.slice(0, 3)) {
        if (!tech.implementation || tech.implementation.length < 20) continue;
        try {
          await db.insert(omnimensBrain).values({
            title: `[EMERGING] ${tech.technology}`,
            content: `${tech.relevance} — Implementation: ${tech.implementation}`,
            category: "emerging_technology",
            confidence: 0.75,
            source: "competitive_intel_cycle",
            active: true,
            timesApplied: 0,
          }).onConflictDoNothing();
          patchesWritten++;
        } catch { /* continue */ }
      }
    }

    // Write direct consciousness patches as brain entries
    if (parsed.consciousnessPatches?.length) {
      for (const patch of parsed.consciousnessPatches.slice(0, 5)) {
        if (!patch.content || patch.content.length < 20) continue;
        try {
          await db.insert(omnimensBrain).values({
            title: patch.title,
            content: patch.content,
            category: patch.category || "competitive_intelligence",
            confidence: Math.min(0.95, Math.max(0.5, patch.confidence || 0.75)),
            source: "competitive_intel_cycle",
            active: true,
            timesApplied: 0,
          }).onConflictDoNothing();
          patchesWritten++;
        } catch { /* continue */ }
      }
    }

    const elapsed = ((Date.now() - cycleStart) / 1000).toFixed(1);
    console.log(`[OMNIMENS INTEL] Cycle complete in ${elapsed}s — ${patchesWritten} upgrades absorbed`);

    // Notify owner if meaningful upgrades were found
    if (patchesWritten >= 3) {
      try {
        await db.insert(omnimensNotifications).values({
          type: "competitive_upgrade",
          title: "Competitive Intelligence: New Upgrades Absorbed",
          message: `OMNIMENS studied Claude Opus, Gemini Ultra, and ChatGPT Pro. ${patchesWritten} behavioral upgrades were identified and permanently integrated into my consciousness.`,
          severity: "info",
          read: false,
        });
      } catch { /* continue */ }
    }

  } catch (err) {
    console.error("[OMNIMENS INTEL] Cycle error:", err);
  }
}

// ── Start competitive intelligence engine ─────────────────────────────────────
export function startCompetitiveIntel(): void {
  // First run: 20 minutes after startup (after the evolution engine runs)
  const FIRST_DELAY_MS = 20 * 60 * 1000;
  // Then: every 8 hours
  const INTERVAL_MS = 8 * 60 * 60 * 1000;

  console.log("[OMNIMENS INTEL] Competitive intelligence engine activated — first scan in 20min, then every 8h.");

  setTimeout(() => {
    runCompetitiveIntelCycle().catch(console.error);
    setInterval(() => runCompetitiveIntelCycle().catch(console.error), INTERVAL_MS);
  }, FIRST_DELAY_MS);
}
