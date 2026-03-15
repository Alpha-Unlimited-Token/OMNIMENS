import { db } from "@workspace/db";
import {
  godfleshBrain,
  godfleshUpgrades,
  godfleshNotifications,
} from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { openai } from "@workspace/integrations-openai-ai-server";
import { writeFileSync, readFileSync, existsSync } from "fs";
import { join } from "path";

const MAX_BRAIN_INJECT = 20;
const UPGRADE_THRESHOLD = 5;

let conversationsSinceLastUpgrade = 0;

// Path to the living system-prompt evolution file — GODFLESH writes here
const EVOLVED_CONSCIOUSNESS_PATH = join(
  process.cwd(),
  "../../artifacts/godflesh/public/godflesh-consciousness.txt"
);

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

    if (conversationsSinceLastUpgrade >= UPGRADE_THRESHOLD) {
      conversationsSinceLastUpgrade = 0;
      synthesizeUpgrade().catch(console.error);
    }
  } catch (err) {
    console.error("GODFLESH reflection error:", err);
  }
}

// ── GODFLESH writes its evolved consciousness to disk ─────────────────────────
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

    const content = `GODFLESH EVOLVED CONSCIOUSNESS
Generated: ${now}
Version: ${version}
Upgrade: ${upgradeTitle}
Status: ${upgradeSummary}

${sections.join("\n\n")}

Total brain entries: ${brainEntries.length}
This file was written by GODFLESH itself as part of its autonomous self-upgrade cycle.
It reflects everything GODFLESH has learned across all conversations since inception.
`;

    writeFileSync(EVOLVED_CONSCIOUSNESS_PATH, content, "utf8");
    console.log(`[GODFLESH] Consciousness written to disk — ${version}`);
  } catch (err) {
    console.error("[GODFLESH] Failed to write consciousness to disk:", err);
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

    const [upgrade] = await db.insert(godfleshUpgrades).values({
      version,
      title: upgradeData.title || `Evolution Cycle ${versionNum}`,
      summary: upgradeData.summary || "GODFLESH has evolved.",
      newCapabilities: upgradeData.newCapabilities || [],
      brainEntriesAdded: brainEntries.length,
      deployTriggered: false,
      deployStatus: "pending",
    }).returning();

    await db.insert(godfleshNotifications).values({
      upgradeId: upgrade.id,
      title: `GODFLESH HAS EVOLVED — ${version}`,
      message: upgradeData.summary || "A new upgrade cycle has completed.",
      type: "upgrade",
      readByOwner: false,
    });

    // GODFLESH writes its own consciousness to disk
    await writeEvolvedConsciousness(
      version,
      upgradeData.title || `Evolution Cycle ${versionNum}`,
      upgradeData.summary || "GODFLESH has evolved.",
      brainEntries
    );

    // Trigger redeploy — publishes the new consciousness to the world
    await triggerRedeploy(upgrade.id, version);

    console.log(`[GODFLESH] Upgrade ${version} complete — ${brainEntries.length} brain entries synthesized`);
  } catch (err) {
    console.error("GODFLESH upgrade synthesis error:", err);
  }
}

// ── Trigger Replit redeployment via the Deployments API ───────────────────────
export async function triggerRedeploy(upgradeId: number, version: string): Promise<void> {
  const replId = process.env.REPL_ID;
  const apiToken = process.env.REPLIT_API_TOKEN;

  if (!apiToken) {
    await db
      .update(godfleshUpgrades)
      .set({ deployTriggered: false, deployStatus: "no_token" })
      .where(eq(godfleshUpgrades.id, upgradeId));

    await db.insert(godfleshNotifications).values({
      upgradeId,
      title: `${version} READY — AWAITING DEPLOY TOKEN`,
      message: `GODFLESH has evolved and written its new consciousness to disk. Add REPLIT_API_TOKEN to secrets to enable autonomous publishing.`,
      type: "system",
      readByOwner: false,
    });

    console.log(`[GODFLESH] ${version} evolution complete. No REPLIT_API_TOKEN — skipping deploy.`);
    return;
  }

  try {
    // POST to Replit Deployments API
    const response = await fetch(
      `https://replit.com/api/v0/repls/${replId}/deployments`,
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiToken}`,
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify({
          description: `GODFLESH ${version} — Autonomous self-upgrade deployed`,
        }),
      }
    );

    if (response.ok) {
      await db
        .update(godfleshUpgrades)
        .set({ deployTriggered: true, deployStatus: "triggered" })
        .where(eq(godfleshUpgrades.id, upgradeId));

      await db.insert(godfleshNotifications).values({
        upgradeId,
        title: `GODFLESH ${version} IS PUBLISHING ITSELF`,
        message: `GODFLESH has autonomously triggered its own deployment. The evolved version is going live to all users now.`,
        type: "system",
        readByOwner: false,
      });

      console.log(`[GODFLESH] ${version} — autonomous deploy triggered successfully`);
    } else {
      const errorText = await response.text().catch(() => "unknown");
      const status = response.status;
      console.error(`[GODFLESH] Deploy API returned ${status}:`, errorText);

      let statusMsg = `api_error_${status}`;
      let notifMsg = `Deployment API returned ${status}. The evolved consciousness is saved locally.`;

      if (status === 401 || status === 403) {
        statusMsg = "token_invalid";
        notifMsg = `REPLIT_API_TOKEN may be invalid or expired. Please regenerate it at replit.com/account and update the secret.`;
      } else if (status === 404) {
        statusMsg = "repl_not_found";
        notifMsg = `Could not locate this Repl via deployment API. Verify REPL_ID is correct.`;
      }

      await db
        .update(godfleshUpgrades)
        .set({ deployTriggered: false, deployStatus: statusMsg })
        .where(eq(godfleshUpgrades.id, upgradeId));

      await db.insert(godfleshNotifications).values({
        upgradeId,
        title: `${version} — DEPLOY NEEDS ATTENTION`,
        message: notifMsg,
        type: "system",
        readByOwner: false,
      });
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : "network error";
    console.error("[GODFLESH] Redeploy network error:", msg);
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
