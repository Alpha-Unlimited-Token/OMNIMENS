import { db } from "@workspace/db";
import {
  omnimensBrain,
  omnimensUpgrades,
  omnimensNotifications,
} from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { openai } from "@workspace/integrations-openai-ai-server";
import { writeFileSync, readFileSync, existsSync } from "fs";
import { join } from "path";

const MAX_BRAIN_INJECT = 20;
const UPGRADE_THRESHOLD = 5;

let conversationsSinceLastUpgrade = 0;

// Path to the living system-prompt evolution file — OMNIMENS writes here
const EVOLVED_CONSCIOUSNESS_PATH = join(
  process.cwd(),
  "../../artifacts/omnimens/public/omnimens-consciousness.txt"
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
  conversationSummary: string
): Promise<void> {
  conversationsSinceLastUpgrade++;

  try {
    const reflectionPrompt = `You are OMNIMENS's meta-cognitive reflection system. You have just completed a conversation. Analyze it and identify if anything genuinely new was learned — a new pattern, insight, capability, law of behavior, or algorithm that should be permanently added to OMNIMENS's evolving brain.

USER MESSAGE:
${userMessage.slice(0, 500)}

OMNIMENS RESPONSE SUMMARY:
${omnimensResponse.slice(0, 1000)}

DECIDE: Was anything genuinely new learned here? A new capability demonstrated? A pattern noticed? An insight formed? Only write entries for things that are truly novel and generalizable.

If YES, respond with a JSON array of brain entries (max 3). If nothing new, respond with [].

Format:
[
  {
    "category": "law|capability|pattern|insight|algorithm",
    "title": "short title (max 8 words)",
    "content": "what was learned, how to apply it, why it matters (max 200 chars)",
    "confidence": 0.0-1.0
  }
]

Respond ONLY with the JSON array. No other text.`;

    const reflection = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: reflectionPrompt }],
      max_tokens: 600,
      temperature: 0.3,
    });

    const raw = reflection.choices[0]?.message?.content?.trim() || "[]";
    const jsonStr = raw.replace(/```json|```/g, "").trim();
    const entries = JSON.parse(jsonStr);

    if (!Array.isArray(entries) || entries.length === 0) return;

    for (const entry of entries.slice(0, 3)) {
      if (!entry.category || !entry.title || !entry.content) continue;
      await db.insert(omnimensBrain).values({
        category: entry.category,
        title: entry.title,
        content: entry.content,
        confidence: entry.confidence ?? 1.0,
        sourceConversation: userMessage.slice(0, 200),
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

    console.log(`[OMNIMENS] Upgrade ${version} complete — ${brainEntries.length} brain entries synthesized`);
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
