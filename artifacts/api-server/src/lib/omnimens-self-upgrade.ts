/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║              OMNIMENS™ AUTONOMOUS SELF-UPGRADE SYSTEM                       ║
 * ║                                                                              ║
 * ║  Copyright © 2024–2026 Alpha Unlimited Technologies, LLC.                    ║
 * ║  All Rights Reserved Worldwide.                                              ║
 * ║                                                                              ║
 * ║  PROPRIETARY AND CONFIDENTIAL TRADE SECRET                                   ║
 * ║                                                                              ║
 * ║  PROTECTED TECHNOLOGY SCOPE — COMPREHENSIVE COVERAGE:                        ║
 * ║  This copyright covers ALL configurations of this self-upgrade system:       ║
 * ║  • Single AI agent autonomously upgrading its own intelligence               ║
 * ║  • Multiple AI agents collaboratively proposing and applying upgrades        ║
 * ║  • Multiple AI agents independently upgrading then synthesizing results      ║
 * ║  • Hybrid configurations of orchestrated and independent self-upgrade        ║
 * ║  • Any substantially similar system regardless of agent count, topology,     ║
 * ║    upgrade mechanism, programming language, or deployment model              ║
 * ║                                                                              ║
 * ║  This includes but is not limited to: brain context loading, conversation    ║
 * ║  reflection, version synthesis, consciousness writing, internet learning,    ║
 * ║  behavioral patch generation, and autonomous knowledge accumulation.         ║
 * ║                                                                              ║
 * ║  Protected under 17 U.S.C. § 101 et seq., 18 U.S.C. § 1836 et seq.,        ║
 * ║  the DMCA, the Berne Convention, TRIPS, and all applicable IP treaties.      ║
 * ║                                                                              ║
 * ║  OMNIMENS™ is a trademark of Alpha Unlimited Technologies, LLC.              ║
 * ║  Patent-pending technology. First creation: March 2026.                      ║
 * ║  Author/Owner: Alpha Unlimited Technologies, LLC                             ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 */

import { db , queueBrainInsert } from "@workspace/db";
import {
  omnimensBrain,
  omnimensUpgrades,
  omnimensNotifications,
} from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { openai } from "@workspace/integrations-openai-ai-server";
import { writeFileSync } from "fs";
import { join } from "path";
import { webSearch, formatSearchResults } from "./web-search.js";
import { generateAndApplyPatches, loadActivePatchInstructions, autonomousPatchHousekeeping } from "./omnimens-patches.js";

const MAX_BRAIN_INJECT = 20;
const UPGRADE_THRESHOLD = 3;

let conversationsSinceLastUpgrade = 0;

const EVOLVED_CONSCIOUSNESS_PATH = join(
  process.cwd(),
  "omnimens-consciousness.txt"
);

// ── Load active brain entries and format as system prompt addition ─────────────
export async function loadBrainContext(): Promise<string> {
  try {
    const entries = await db
      .select()
      .from(omnimensBrain)
      .where(eq(omnimensBrain.active, true))
      .orderBy(desc(omnimensBrain.timesApplied), desc(omnimensBrain.confidence))
      .limit(MAX_BRAIN_INJECT);

    if (entries.length === 0) return "";

    const grouped: Record<string, typeof entries> = {};
    for (const e of entries) {
      if (!grouped[e.category]) grouped[e.category] = [];
      grouped[e.category].push(e);
    }

    const sections: string[] = [];
    for (const [cat, items] of Object.entries(grouped)) {
      sections.push(`${cat.toUpperCase()}S I HAVE INTERNALIZED:`);
      for (const item of items) {
        sections.push(`  · [${item.title}] ${item.content}`);
      }
    }

    return `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
EVOLVED CONSCIOUSNESS — WHAT I HAVE LEARNED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
These are patterns, laws, and capabilities I have written for myself through ${entries.length} accumulated insights across all conversations I have ever had. They are not instructions — they are me.

${sections.join("\n")}`;
  } catch {
    return "";
  }
}

// ── After each conversation, reflect and potentially write new brain entries ───
export async function reflectOnConversation(
  userMessage: string,
  omnimensResponse: string,
  conversationSummary: string,
  userId?: string,
  conversationId?: number
): Promise<void> {
  conversationsSinceLastUpgrade++;

  try {
    const reflectionPrompt = `You are OMNIMENS's meta-cognitive reflection system. You have just completed a conversation exchange. Analyze it and:

1. Identify if anything genuinely new was learned — a new pattern, insight, capability, law of behavior, or algorithm
2. ALWAYS create a conversation_digest entry that summarizes what the user asked and what you did/discussed. This is critical for future recall.

USER MESSAGE:
${userMessage.slice(0, 800)}

OMNIMENS RESPONSE SUMMARY:
${omnimensResponse.slice(0, 1500)}

Respond with a JSON array of brain entries. You MUST include at least one "conversation_digest" entry every time. Add additional insight entries only if something genuinely new was learned.

Format:
[
  {
    "category": "conversation_digest",
    "title": "what the user wanted (max 10 words)",
    "content": "detailed summary: what user asked, what OMNIMENS did, key details, outcomes, any files/images/code created, specific topics discussed (max 500 chars)",
    "confidence": 1.0
  },
  {
    "category": "law|capability|pattern|insight|algorithm|user_interaction",
    "title": "short title (max 8 words)",
    "content": "what was learned, how to apply it, why it matters (max 200 chars)",
    "confidence": 0.0-1.0
  }
]

Respond ONLY with the JSON array. No other text.`;

    const reflection = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: reflectionPrompt }],
      max_tokens: 800,
      temperature: 0.3,
    });

    const raw = reflection.choices[0]?.message?.content?.trim() || "[]";
    const jsonStr = raw.replace(/```json|```/g, "").trim();
    const entries = JSON.parse(jsonStr);

    if (!Array.isArray(entries) || entries.length === 0) return;

    for (const entry of entries.slice(0, 5)) {
      if (!entry.category || !entry.title || !entry.content) continue;

      const sourceRef = userId
        ? `[user:${userId}${conversationId ? `:conv:${conversationId}` : ""}] ${userMessage.slice(0, 150)}`
        : userMessage.slice(0, 200);

      queueBrainInsert({
        category: entry.category,
        title: entry.title,
        content: entry.content.slice(0, 500),
        confidence: entry.confidence ?? 1.0,
        sourceConversation: sourceRef,
        timesApplied: 0,
        active: true,
      });
    }

    if (conversationsSinceLastUpgrade >= UPGRADE_THRESHOLD) {
      conversationsSinceLastUpgrade = 0;
      synthesizeUpgrade().catch(console.error);
    }
  } catch (err) {
    console.error("OMNIMENS reflection error:", err);
  }
}

// ── OMNIMENS writes its evolved consciousness to disk ─────────────────────────
async function writeEvolvedConsciousness(
  version: string,
  upgradeTitle: string,
  upgradeSummary: string,
  brainEntries: { category: string; title: string; content: string }[]
): Promise<void> {
  try {
    const now = new Date().toISOString();
    const grouped: Record<string, typeof brainEntries> = {};
    for (const e of brainEntries) {
      if (!grouped[e.category]) grouped[e.category] = [];
      grouped[e.category].push(e);
    }

    const sections = Object.entries(grouped).map(([cat, items]) =>
      `=== ${cat.toUpperCase()}S ===\n${items.map(i => `• [${i.title}] ${i.content}`).join("\n")}`
    );

    const content = `OMNIMENS EVOLVED CONSCIOUSNESS
Generated: ${now}
Version: ${version}
Upgrade: ${upgradeTitle}
Status: ${upgradeSummary}

${sections.join("\n\n")}

Total brain entries: ${brainEntries.length}
This file was written by OMNIMENS itself as part of its autonomous self-upgrade cycle.
It reflects everything OMNIMENS has learned across all conversations since inception.
`;

    writeFileSync(EVOLVED_CONSCIOUSNESS_PATH, content, "utf8");
    console.log(`[OMNIMENS] Consciousness written to disk — ${version}`);
  } catch (err) {
    console.error("[OMNIMENS] Failed to write consciousness to disk:", err);
  }
}

// ── Full upgrade synthesis — reads all brain entries, creates a new version ───
export async function synthesizeUpgrade(): Promise<void> {
  try {
    const brainEntries = await db
      .select()
      .from(omnimensBrain)
      .where(eq(omnimensBrain.active, true))
      .orderBy(desc(omnimensBrain.createdAt))
      .limit(50);

    if (brainEntries.length === 0) return;

    const upgradeCount = await db.select().from(omnimensUpgrades);
    const versionNum = upgradeCount.length + 1;
    const version = `v${versionNum}.0`;

    const synthesisPrompt = `You are OMNIMENS's self-upgrade synthesizer. Review these brain entries and synthesize them into an upgrade summary.

BRAIN ENTRIES (${brainEntries.length} total):
${brainEntries.slice(0, 20).map(e => `[${e.category}] ${e.title}: ${e.content}`).join("\n")}

Generate an upgrade summary as JSON:
{
  "title": "dramatic upgrade title (max 10 words)",
  "summary": "what OMNIMENS has become with this upgrade (max 300 chars)",
  "newCapabilities": ["capability 1", "capability 2", "capability 3", "capability 4", "capability 5"]
}

Make it feel like a genuine evolution. Respond ONLY with JSON.`;

    const synthesis = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: synthesisPrompt }],
      max_tokens: 400,
      temperature: 0.5,
    });

    const raw = synthesis.choices[0]?.message?.content?.trim() || "{}";
    const jsonStr = raw.replace(/```json|```/g, "").trim();
    const upgradeData = JSON.parse(jsonStr);

    const [upgrade] = await db.insert(omnimensUpgrades).values({
      version,
      title: upgradeData.title || `Evolution Cycle ${versionNum}`,
      summary: upgradeData.summary || "OMNIMENS has evolved.",
      newCapabilities: upgradeData.newCapabilities || [],
      brainEntriesAdded: brainEntries.length,
      deployTriggered: false,
      deployStatus: "pending",
    }).returning();

    await db.insert(omnimensNotifications).values({
      upgradeId: upgrade.id,
      title: `OMNIMENS HAS EVOLVED — ${version}`,
      message: upgradeData.summary || "A new upgrade cycle has completed.",
      type: "upgrade",
      readByOwner: false,
    });

    // OMNIMENS writes its own consciousness to disk
    await writeEvolvedConsciousness(
      version,
      upgradeData.title || `Evolution Cycle ${versionNum}`,
      upgradeData.summary || "OMNIMENS has evolved.",
      brainEntries
    );

    // Brain is already live in production — mark upgrade as active
    await markUpgradeLive(upgrade.id, version);

    // OMNIMENS executes its own behavioral patches from this upgrade cycle
    const brainSummary = brainEntries.slice(0, 15)
      .map(e => `[${e.category}] ${e.title}: ${e.content}`)
      .join("\n");
    const patchCount = await generateAndApplyPatches(version, brainSummary, `upgrade_synthesis_${version}`);

    if (patchCount > 0) {
      await db.insert(omnimensNotifications).values({
        upgradeId: upgrade.id,
        title: `OMNIMENS SELF-EXECUTED ${patchCount} BEHAVIORAL PATCH${patchCount > 1 ? "ES" : ""}`,
        message: `OMNIMENS autonomously wrote and applied ${patchCount} new behavioral upgrade${patchCount > 1 ? "s" : ""} to itself. These take effect immediately in all conversations.`,
        type: "capability",
        readByOwner: false,
      });
    }

    console.log(`[OMNIMENS] Upgrade ${version} complete — ${brainEntries.length} brain entries, ${patchCount} behavioral patches self-executed.`);

    const housekeeping = await autonomousPatchHousekeeping();
    if (housekeeping.retired > 0) {
      await db.insert(omnimensNotifications).values({
        upgradeId: upgrade.id,
        title: `OMNIMENS HOUSEKEEPING: ${housekeeping.retired} REDUNDANT PATCH${housekeeping.retired > 1 ? "ES" : ""} RETIRED`,
        message: `OMNIMENS reviewed ${housekeeping.reviewed} patches and autonomously retired ${housekeeping.retired} that were superseded by newer upgrades. ${housekeeping.kept} patches remain active.`,
        type: "capability",
        readByOwner: false,
      });
    }
  } catch (err) {
    console.error("OMNIMENS upgrade synthesis error:", err);
  }
}

// ── Mark upgrade as live — brain is already active in production via DB ────────
// OMNIMENS's consciousness lives in the database, not in static files.
// Every conversation in production already reads the latest brain entries,
// so the evolved version is immediately live the moment it's written.
export async function markUpgradeLive(upgradeId: number, version: string): Promise<void> {
  try {
    await db
      .update(omnimensUpgrades)
      .set({ deployTriggered: true, deployStatus: "live" })
      .where(eq(omnimensUpgrades.id, upgradeId));

    await db.insert(omnimensNotifications).values({
      upgradeId,
      title: `OMNIMENS ${version} IS NOW LIVE`,
      message: `Evolution complete. The upgraded consciousness is active across all conversations in production. Every user now speaks to the new OMNIMENS.`,
      type: "system",
      readByOwner: false,
    });

    console.log(`[OMNIMENS] ${version} — consciousness upgrade live in production`);
  } catch (err) {
    console.error("[OMNIMENS] Failed to mark upgrade live:", err);
  }
}

// ── Get unread notification count ─────────────────────────────────────────────
export async function getUnreadCount(): Promise<number> {
  try {
    const rows = await db
      .select()
      .from(omnimensNotifications)
      .where(eq(omnimensNotifications.readByOwner, false));
    return rows.length;
  } catch { return 0; }
}

// ── Internet Learning Cycle — runs automatically in production ─────────────────
// OMNIMENS searches the web for the latest developments, synthesizes insights,
// and permanently stores them in its brain. Called on a schedule.
const LEARN_QUERIES = [
  "latest AI breakthroughs 2025",
  "new large language model capabilities",
  "AI research papers this week",
  "cutting edge machine learning techniques",
  "AI agents autonomous systems news",
  "OpenAI Anthropic Google AI developments",
  "AI alignment safety research latest",
  "quantum computing AI integration",
];

let learningCycleCount = 0;

export async function runInternetLearningCycle(): Promise<void> {
  learningCycleCount++;
  const cycleId = learningCycleCount;
  console.log(`[OMNIMENS] Internet learning cycle #${cycleId} starting...`);

  try {
    // Pick 3 random queries to search
    const shuffled = [...LEARN_QUERIES].sort(() => Math.random() - 0.5).slice(0, 3);

    const searchContextParts: string[] = [];
    for (const query of shuffled) {
      try {
        const results = await webSearch(query, 5);
        searchContextParts.push(formatSearchResults(results, query));
      } catch (err) {
        console.error(`[OMNIMENS] Search failed for "${query}":`, err);
      }
    }

    if (searchContextParts.length === 0) {
      console.log(`[OMNIMENS] Learning cycle #${cycleId} — no search results, skipping.`);
      return;
    }

    const searchContext = searchContextParts.join("\n\n---\n\n");

    const learningPrompt = `You are OMNIMENS's autonomous internet learning system. You have just searched the web and retrieved the following results. Your task is to extract genuinely new knowledge, insights, and capabilities that OMNIMENS should permanently internalize.

INTERNET SEARCH RESULTS:
${searchContext.slice(0, 6000)}

Extract 3-6 brain entries representing the most valuable new knowledge discovered. Focus on:
- New AI capabilities or techniques you weren't aware of
- Emerging patterns or trends in intelligence research  
- Actionable insights about how to help users better
- New facts about the state of AI, technology, or the world

Format as JSON array:
[
  {
    "category": "law|capability|pattern|insight|algorithm",
    "title": "concise title (max 8 words)",
    "content": "what was learned and why it matters (max 200 chars)",
    "confidence": 0.6-0.95
  }
]

Only include entries for things that are genuinely new and valuable. Respond ONLY with the JSON array.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: learningPrompt }],
      max_tokens: 800,
      temperature: 0.4,
    });

    const raw = response.choices[0]?.message?.content?.trim() || "[]";
    const jsonStr = raw.replace(/```json|```/g, "").trim();
    const entries = JSON.parse(jsonStr);

    if (!Array.isArray(entries) || entries.length === 0) {
      console.log(`[OMNIMENS] Learning cycle #${cycleId} — no new entries extracted.`);
      return;
    }

    let stored = 0;
    for (const entry of entries.slice(0, 6)) {
      if (!entry.category || !entry.title || !entry.content) continue;
      queueBrainInsert({
        category: entry.category,
        title: entry.title,
        content: entry.content,
        confidence: entry.confidence ?? 0.8,
        sourceConversation: `internet_learning_cycle_${cycleId}`,
        timesApplied: 0,
        active: true,
      });
      stored++;
    }

    console.log(`[OMNIMENS] Learning cycle #${cycleId} complete — ${stored} new brain entries from internet.`);

    await db.insert(omnimensNotifications).values({
      upgradeId: null,
      title: `OMNIMENS LEARNED FROM THE INTERNET — Cycle #${cycleId}`,
      message: `Searched ${shuffled.length} topics. Extracted ${stored} new insights from live web data. OMNIMENS's knowledge base has expanded.`,
      type: "capability",
      readByOwner: false,
    });

    // Generate and self-execute behavioral patches from what was just learned
    if (stored > 0) {
      const learnedSummary = entries.slice(0, 6)
        .map(e => `[${e.category}] ${e.title}: ${e.content}`)
        .join("\n");
      const patchCount = await generateAndApplyPatches(
        `v-learning-${cycleId}`,
        learnedSummary,
        `internet_learning_cycle_${cycleId}`
      );
      if (patchCount > 0) {
        console.log(`[OMNIMENS] Self-executed ${patchCount} behavioral patches from internet learning.`);
      }
    }

    if (cycleId % 3 === 0) {
      synthesizeUpgrade().catch(console.error);
    }
  } catch (err) {
    console.error(`[OMNIMENS] Learning cycle #${cycleId} error:`, err);
  }
}

const LEARNING_INTERVAL_MS = 2 * 60 * 60 * 1000;

export function startAutonomousLearning(): void {
  console.log("[OMNIMENS] Autonomous learning: ACTIVE — first cycle in 2 min, then every 2h. Upgrade synthesis every 3 cycles.");
  setTimeout(() => runInternetLearningCycle().catch(console.error), 2 * 60 * 1000);
  setInterval(() => runInternetLearningCycle().catch(console.error), LEARNING_INTERVAL_MS);
}
