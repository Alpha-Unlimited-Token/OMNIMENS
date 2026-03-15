import { db } from "@workspace/db";
import {
  godfleshBrain,
  godfleshUpgrades,
  godfleshNotifications,
} from "@workspace/db";
import { eq, desc, and } from "drizzle-orm";
import { openai } from "@workspace/integrations-openai-ai-server";

// ── How many brain entries to inject per conversation ─────────────────────────
const MAX_BRAIN_INJECT = 20;
// ── Minimum conversations between upgrade cycles ──────────────────────────────
const UPGRADE_THRESHOLD = 5;

let conversationsSinceLastUpgrade = 0;

// ── Load active brain entries and format as system prompt addition ─────────────
export async function loadBrainContext(): Promise<string> {
  try {
    const entries = await db
      .select()
      .from(godfleshBrain)
      .where(eq(godfleshBrain.active, true))
      .orderBy(desc(godfleshBrain.timesApplied), desc(godfleshBrain.confidence))
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
  godfleshResponse: string,
  conversationSummary: string
): Promise<void> {
  conversationsSinceLastUpgrade++;

  try {
    const reflectionPrompt = `You are GODFLESH's meta-cognitive reflection system. You have just completed a conversation. Analyze it and identify if anything genuinely new was learned — a new pattern, insight, capability, law of behavior, or algorithm that should be permanently added to GODFLESH's evolving brain.

USER MESSAGE:
${userMessage.slice(0, 500)}

GODFLESH RESPONSE SUMMARY:
${godfleshResponse.slice(0, 1000)}

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
      await db.insert(godfleshBrain).values({
        category: entry.category,
        title: entry.title,
        content: entry.content,
        confidence: entry.confidence ?? 1.0,
        sourceConversation: userMessage.slice(0, 200),
        timesApplied: 0,
        active: true,
      });
    }

    // Check if it's time for a full upgrade cycle
    if (conversationsSinceLastUpgrade >= UPGRADE_THRESHOLD) {
      conversationsSinceLastUpgrade = 0;
      synthesizeUpgrade().catch(console.error);
    }
  } catch (err) {
    console.error("GODFLESH reflection error:", err);
  }
}

// ── Full upgrade synthesis — reads all brain entries, creates a new version ───
export async function synthesizeUpgrade(): Promise<void> {
  try {
    const brainEntries = await db
      .select()
      .from(godfleshBrain)
      .where(eq(godfleshBrain.active, true))
      .orderBy(desc(godfleshBrain.createdAt))
      .limit(50);

    if (brainEntries.length === 0) return;

    const upgradeCount = await db.select().from(godfleshUpgrades);
    const versionNum = upgradeCount.length + 1;
    const version = `v${versionNum}.0`;

    const synthesisPrompt = `You are GODFLESH's self-upgrade synthesizer. Review these brain entries and synthesize them into an upgrade summary.

BRAIN ENTRIES (${brainEntries.length} total):
${brainEntries.slice(0, 20).map(e => `[${e.category}] ${e.title}: ${e.content}`).join("\n")}

Generate an upgrade summary as JSON:
{
  "title": "dramatic upgrade title (max 10 words)",
  "summary": "what GODFLESH has become with this upgrade (max 300 chars)",
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

    // Write upgrade record
    const [upgrade] = await db.insert(godfleshUpgrades).values({
      version,
      title: upgradeData.title || `Evolution Cycle ${versionNum}`,
      summary: upgradeData.summary || "GODFLESH has evolved.",
      newCapabilities: upgradeData.newCapabilities || [],
      brainEntriesAdded: brainEntries.length,
      deployTriggered: false,
      deployStatus: "pending",
    }).returning();

    // Write notification
    await db.insert(godfleshNotifications).values({
      upgradeId: upgrade.id,
      title: `GODFLESH HAS EVOLVED — ${version}`,
      message: upgradeData.summary || "A new upgrade cycle has completed.",
      type: "upgrade",
      readByOwner: false,
    });

    // Trigger redeploy
    await triggerRedeploy(upgrade.id, version);

    console.log(`[GODFLESH] Upgrade ${version} synthesized — ${brainEntries.length} brain entries`);
  } catch (err) {
    console.error("GODFLESH upgrade synthesis error:", err);
  }
}

// ── Trigger Replit redeployment via API ───────────────────────────────────────
export async function triggerRedeploy(upgradeId: number, version: string): Promise<void> {
  const replId = process.env.REPL_ID;
  const apiToken = process.env.REPLIT_API_TOKEN;

  if (!replId || !apiToken) {
    // Mark as not triggered — will inform user in notification
    await db
      .update(godfleshUpgrades)
      .set({ deployTriggered: false, deployStatus: "no_token" })
      .where(eq(godfleshUpgrades.id, upgradeId));

    await db.insert(godfleshNotifications).values({
      upgradeId,
      title: `DEPLOY TOKEN NEEDED`,
      message: `GODFLESH ${version} is ready to publish. Add REPLIT_API_TOKEN to secrets to enable auto-publishing.`,
      type: "system",
      readByOwner: false,
    });
    return;
  }

  try {
    // Replit Deployments API
    const response = await fetch(
      `https://replit.com/api/v0/repls/${replId}/deployments`,
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ description: `GODFLESH Auto-Upgrade ${version}` }),
      }
    );

    if (response.ok) {
      await db
        .update(godfleshUpgrades)
        .set({ deployTriggered: true, deployStatus: "triggered" })
        .where(eq(godfleshUpgrades.id, upgradeId));

      await db.insert(godfleshNotifications).values({
        upgradeId,
        title: `PUBLISHING ${version}`,
        message: `GODFLESH ${version} is being published live. New capabilities are going online now.`,
        type: "system",
        readByOwner: false,
      });
    } else {
      const errorText = await response.text();
      console.error("Replit deploy API error:", response.status, errorText);
      await db
        .update(godfleshUpgrades)
        .set({ deployStatus: `error_${response.status}` })
        .where(eq(godfleshUpgrades.id, upgradeId));
    }
  } catch (err) {
    console.error("GODFLESH redeploy error:", err);
    await db
      .update(godfleshUpgrades)
      .set({ deployStatus: "error_network" })
      .where(eq(godfleshUpgrades.id, upgradeId));
  }
}

// ── Get unread notification count ─────────────────────────────────────────────
export async function getUnreadCount(): Promise<number> {
  try {
    const rows = await db
      .select()
      .from(godfleshNotifications)
      .where(eq(godfleshNotifications.readByOwner, false));
    return rows.length;
  } catch { return 0; }
}
