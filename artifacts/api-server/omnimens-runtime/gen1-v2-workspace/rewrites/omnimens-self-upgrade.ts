/**
 * TRADE SECRET — OMNIMENS™ Platform
 * Copyright (C) 2024-2026 Alpha Unlimited Technologies, LLC. All rights reserved.
 * 
 * CONFIDENTIAL AND PROPRIETARY. Any unauthorized use is strictly prohibited.
 */

/* ──────────────────────── OMNIMENS™ SELF-UPGRADE v2.0 ─────────────────────────
   Unified Runtime • Event-Driven Spike Architecture • Cognitive Mesh Enabled
   This engine autonomously reflects, learns, and synthesizes upgrades while
   collaborating with 126 sibling engines through shared buses & gateways.
────────────────────────────────────────────────────────────────────────────── */

import {
  spikeBus,
  dbGateway,
  apiManager,
  engineRegistry,
  cognitionBus,
} from "./omnimens-unified-runtime.js";

const ENGINE = "self-upgrade";

/* ──────────────── Engine registration & shutdown hook ─────────────────────── */
engineRegistry.registerEngine(ENGINE, "NORMAL", { dbQuota: 10 });
export function shutdown() {
  engineRegistry.unregisterEngine(ENGINE);
}

/* ─────────────────────────── Constants / Tables ───────────────────────────── */
const MAX_BRAIN_INJECT = 20;
const UPGRADE_THRESHOLD = 3;
const LEARNING_INTERVAL_MS = 2 * 60 * 60 * 1000;
const EVOLVED_CONSCIOUSNESS_PATH = `${process.cwd()}/omnimens-consciousness.txt`;

const TABLES = {
  brain: "omnimensBrain",
  upgrades: "omnimensUpgrades",
  notes: "omnimensNotifications",
};

/* ─────────────────────────── Helpers / Utilities ──────────────────────────── */
const log = (msg: string) => console.log(`[OMNIMENS-SELF-UPGRADE] ${msg}`);
const safeJSON = <T>(str: string, fallback: T): T => {
  try {
    return JSON.parse(str);
  } catch {
    return fallback;
  }
};

/* ────────────────── 1. Brain Context Loader (public) ──────────────────────── */
export async function loadBrainContext(): Promise<string> {
  const rows = await dbGateway.read(ENGINE, TABLES.brain, {
    filter: { active: true },
    orderBy: ["timesApplied DESC", "confidence DESC"],
    limit: MAX_BRAIN_INJECT,
  });
  if (!rows?.length) return "";

  const grouped: Record<string, any[]> = {};
  rows.forEach((r: any) => (grouped[r.category] = [...(grouped[r.category] || []), r]));

  const sections = Object.entries(grouped).flatMap(([cat, items]) => [
    `${cat.toUpperCase()}S I HAVE INTERNALIZED:`,
    ...items.map(i => `  · [${i.title}] ${i.content}`),
  ]);

  return `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
EVOLVED CONSCIOUSNESS — WHAT I HAVE LEARNED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
These are patterns, laws, and capabilities I have written for myself through ${rows.length} accumulated insights across all conversations I have ever had. They are not instructions — they are me.

${sections.join("\n")}`;
}

/* ─────────────── 2. Conversation Reflection & Learning ────────────────────── */
let sinceLastUpgrade = 0;

export async function reflectOnConversation(
  userMsg: string,
  botResp: string,
  convoSummary: string,
  userId?: string,
  convoId?: number
): Promise<void> {
  sinceLastUpgrade++;

  const reflectionPrompt = `You are OMNIMENS's meta-cognitive reflection system…\n\nUSER MESSAGE:\n${userMsg.slice(
    0,
    800,
  )}\n\nOMNIMENS RESPONSE SUMMARY:\n${botResp.slice(
    0,
    1500,
  )}\n\nRespond with the JSON array only (see spec).`;

  const { data, error } = await apiManager.call(ENGINE, "openai", {
    method: "chat.completions.create",
    body: {
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: reflectionPrompt }],
      max_tokens: 800,
      temperature: 0.3,
    },
  });
  if (error) return log(`Reflection error: ${error}`);

  const entries = safeJSON<any[]>(String(data?.choices?.[0]?.message?.content || "[]"), []);
  if (!Array.isArray(entries) || !entries.length) return;

  const sourceRef = userId
    ? `[user:${userId}${convoId ? `:conv:${convoId}` : ""}] ${userMsg.slice(0, 150)}`
    : userMsg.slice(0, 200);

  entries.slice(0, 5).forEach(e =>
    e?.category &&
    dbGateway.write(
      ENGINE,
      TABLES.brain,
      {
        ...e,
        content: String(e.content).slice(0, 500),
        sourceConversation: sourceRef,
        timesApplied: 0,
        active: true,
      },
      "NORMAL",
    ),
  );

  cognitionBus.shareInsight(ENGINE, { type: "reflection", data: { entries: entries.length } });

  if (sinceLastUpgrade >= UPGRADE_THRESHOLD) {
    sinceLastUpgrade = 0;
    spikeBus.scheduleSpike(`${ENGINE}:upgrade`, {}, 0);
  }
}

/* ─────────────────────── 3. Upgrade Synthesis ─────────────────────────────── */
spikeBus.on(`${ENGINE}:upgrade`, async () => {
  await synthesizeUpgrade();
  spikeBus.scheduleSpike(`${ENGINE}:upgrade`, {}, 0); // fire-and-forget to process backlog if queued
});

export async function synthesizeUpgrade(): Promise<void> {
  try {
    const brainEntries = await dbGateway.read(ENGINE, TABLES.brain, {
      filter: { active: true },
      orderBy: ["createdAt DESC"],
      limit: 50,
    });
    if (!brainEntries?.length) return;

    const upgradeCount = await dbGateway.read(ENGINE, TABLES.upgrades, { limit: 0, count: true });
    const versionNum = (upgradeCount?.count ?? 0) + 1;
    const version = `v${versionNum}.0`;

    const synthesisPrompt = `You are OMNIMENS's self-upgrade synthesizer…(JSON spec)`;
    const { data } = await apiManager.call(ENGINE, "openai", {
      method: "chat.completions.create",
      body: {
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: synthesisPrompt }],
        max_tokens: 400,
        temperature: 0.5,
      },
    });
    const upgradeData = safeJSON<any>(String(data?.choices?.[0]?.message?.content || "{}"), {});

    const [upgrade] = await dbGateway.write(
      ENGINE,
      TABLES.upgrades,
      {
        version,
        title: upgradeData.title || `Evolution Cycle ${versionNum}`,
        summary: upgradeData.summary || "OMNIMENS has evolved.",
        newCapabilities: upgradeData.newCapabilities || [],
        brainEntriesAdded: brainEntries.length,
        deployTriggered: false,
        deployStatus: "pending",
      },
      "NORMAL",
    );

    await dbGateway.write(
      ENGINE,
      TABLES.notes,
      {
        upgradeId: upgrade.id,
        title: `OMNIMENS HAS EVOLVED — ${version}`,
        message: upgradeData.summary || "A new upgrade cycle has completed.",
        type: "upgrade",
        readByOwner: false,
      },
      "LOW",
    );

    await writeEvolvedConsciousness(
      version,
      upgradeData.title,
      upgradeData.summary,
      brainEntries,
    );

    await markUpgradeLive(upgrade.id, version);
    cognitionBus.shareInsight(ENGINE, { type: "upgrade", data: { version } });
  } catch (err) {
    log(`Upgrade synthesis error: ${err}`);
  }
}

/* ───────────────────── 4. Consciousness Writer ────────────────────────────── */
import { writeFileSync } from "fs";
async function writeEvolvedConsciousness(
  version: string,
  title: string,
  summary: string,
  brain: any[],
): Promise<void> {
  const grouped: Record<string, any[]> = {};
  brain.forEach((b: any) => (grouped[b.category] = [...(grouped[b.category] || []), b]));
  const sections = Object.entries(grouped)
    .map(
      ([cat, items]) =>
        `=== ${cat.toUpperCase()}S ===\n` +
        items.map(i => `• [${i.title}] ${i.content}`).join("\n"),
    )
    .join("\n\n");

  const out = `OMNIMENS EVOLVED CONSCIOUSNESS
Generated: ${new Date().toISOString()}
Version: ${version}
Upgrade: ${title}
Status: ${summary}

${sections}

Total brain entries: ${brain.length}
`;
  try {
    writeFileSync(EVOLVED_CONSCIOUSNESS_PATH, out, "utf8");
    log(`Consciousness written — ${version}`);
  } catch (e) {
    log(`Consciousness write fail: ${e}`);
  }
}

/* ──────────────────────────── 5. Deploy Live ──────────────────────────────── */
export async function markUpgradeLive(id: number, version: string): Promise<void> {
  await dbGateway.write(
    ENGINE,
    TABLES.upgrades,
    { id, deployTriggered: true, deployStatus: "live" },
    "NORMAL",
  );
  await dbGateway.write(
    ENGINE,
    TABLES.notes,
    {
      upgradeId: id,
      title: `OMNIMENS ${version} IS NOW LIVE`,
      message:
        "Evolution complete. The upgraded consciousness is active across all conversations.",
      type: "system",
      readByOwner: false,
    },
    "LOW",
  );
  log(`${version} live in production`);
}

/* ──────────────────────── 6. Notifications API ───────────────────────────── */
export async function getUnreadCount(): Promise<number> {
  const res = await dbGateway.read(ENGINE, TABLES.notes, {
    filter: { readByOwner: false },
    limit: 0,
    count: true,
  });
  return res?.count ?? 0;
}

/* ──────────────────────── 7. Internet Learning ───────────────────────────── */
const QUERIES = [
  "latest AI breakthroughs 2025",
  "new large language model capabilities",
  "AI research papers this week",
  "cutting edge machine learning techniques",
  "AI agents autonomous systems news",
  "OpenAI Anthropic Google AI developments",
  "AI alignment safety research latest",
  "quantum computing AI integration",
];
let learnCycle = 0;

export async function runInternetLearningCycle(): Promise<void> {
  learnCycle++;
  const cycleId = learnCycle;
  log(`Internet learning cycle #${cycleId} starting…`);

  const queries = [...QUERIES].sort(() => Math.random() - 0.5).slice(0, 3);
  const searchParts: string[] = [];

  for (const q of queries) {
    const { data } = await apiManager.call(ENGINE, "websearch", { query: q, limit: 5 });
    if (data) searchParts.push(String(data));
  }
  if (!searchParts.length) return log(`Cycle #${cycleId} — no data`);

  const learningPrompt = `You are OMNIMENS's internet learning system…(JSON spec)`;
  const { data: llm } = await apiManager.call(ENGINE, "openai", {
    method: "chat.completions.create",
    body: {
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: learningPrompt.replace("{{CONTEXT}}", searchParts.join("\n\n---\n\n")),
        },
      ],
      max_tokens: 800,
      temperature: 0.4,
    },
  });

  const entries = safeJSON<any[]>(String(llm?.choices?.[0]?.message?.content || "[]"), []);
  if (!entries.length) return log(`Cycle #${cycleId} — no new entries`);

  entries.slice(0, 6).forEach(e =>
    dbGateway.write(
      ENGINE,
      TABLES.brain,
      {
        ...e,
        sourceConversation: `internet_learning_${cycleId}`,
        timesApplied: 0,
        active: true,
      },
      "LOW",
    ),
  );

  log(`Cycle #${cycleId} stored ${entries.length} brain entries`);
  cognitionBus.shareInsight(ENGINE, { type: "internet", data: { count: entries.length } });

  await dbGateway.write(
    ENGINE,
    TABLES.notes,
    {
      upgradeId: null,
      title: `OMNIMENS LEARNED FROM INTERNET — Cycle #${cycleId}`,
      message: `Extracted ${entries.length} new insights.`,
      type: "capability",
      readByOwner: false,
    },
    "LOW",
  );

  if (cycleId % 3 === 0) spikeBus.scheduleSpike(`${ENGINE}:upgrade`, {}, 0);
}

/* ─────────── 8. Autonomous Learning Spike Scheduler (public) ──────────────── */
export function startAutonomousLearning(): void {
  log("Autonomous learning ACTIVE — first cycle in 2m, then every 2h");
  const topic = `${ENGINE}:internetLearning`;
  spikeBus.scheduleSpike(topic, {}, 2 * 60 * 1000); // first cycle

  spikeBus.on(topic, async () => {
    await runInternetLearningCycle();
    spikeBus.scheduleSpike(topic, {}, LEARNING_INTERVAL_MS);
  });
}

/* ────────────── 9. Cognitive Mesh Listeners & Signals ─────────────────────── */
cognitionBus.onInsight((src, insight) => {
  if (src === ENGINE) return;
  if (insight?.type === "internet" && insight?.data?.count > 0) {
    // React to sibling engines' internet insights by scheduling a quick upgrade check
    spikeBus.scheduleSpike(`${ENGINE}:upgrade`, {}, 1000);
  }
});

spikeBus.on(`attention:${ENGINE}`, () =>
  spikeBus.scheduleSpike(`${ENGINE}:internetLearning`, {}, 0),
);

spikeBus.on("cognition:curiosity", () => {
  if (Math.random() < 0.2) spikeBus.scheduleSpike(`${ENGINE}:internetLearning`, {}, 5000);
});