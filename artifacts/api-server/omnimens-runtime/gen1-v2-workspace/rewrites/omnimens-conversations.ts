/**
 * TRADE SECRET — OMNIMENS™ Platform
 * Copyright (C) 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved.
 *
 * CONFIDENTIAL AND PROPRIETARY.
 * Unauthorized use is strictly prohibited.
 */

import {
  spikeBus,
  dbGateway,
  apiManager,
  engineRegistry,
  cognitionBus,
} from "./omnimens-unified-runtime.js";

type Role = "user" | "assistant";
type ConversationRow = { id: number; userId: string; title?: string; persona?: string };
type MessageRow = { role: Role; content: string };
type MemoryRow = {
  id: number;
  userId: string;
  category: string;
  content: string;
  active: boolean;
};

const ENGINE = "conversations";
const TABLE = {
  conversations: "omnimensConversations",
  messages: "omnimensMessages",
  memories: "omnimensMemories",
  brain: "omnimensBrain",
};

// ── Helpers ──────────────────────────────────────────────────────────────────
const read = <T>(table: string, query?: unknown) =>
  dbGateway.read<T[]>(ENGINE, table, query);
const write = (table: string, data: unknown) =>
  dbGateway.write(ENGINE, table, data, "NORMAL");

const log = (msg: string, ...extra: unknown[]) =>
  console.log(`[OMNIMENS-CONVERSATIONS] ${msg}`, ...extra);

// ── Public API ───────────────────────────────────────────────────────────────
export async function getOrCreateConversation(
  userId: string,
  conversationId?: number,
  persona = "GENERAL"
): Promise<number> {
  if (conversationId) {
    const [row] = await read<ConversationRow>(TABLE.conversations, {
      where: { id: conversationId, userId },
      limit: 1,
    });
    if (row) return row.id;
  }
  const [{ id }] = await write(TABLE.conversations, [
    { userId, title: "New Conversation", persona },
  ]) as [{ id: number }];
  return id;
}

export async function saveMessage(
  conversationId: number,
  userId: string,
  role: Role,
  content: string,
  imageUrl?: string,
  creditsUsed?: number
): Promise<void> {
  await write(TABLE.messages, [
    {
      conversationId,
      userId,
      role,
      content: content.slice(0, 50_000),
      imageUrl,
      creditsUsed,
    },
  ]);

  await write(TABLE.conversations, {
    update: {
      set: {
        messageCount: { $inc: 1 },
        lastMessageAt: new Date(),
      },
      where: { id: conversationId },
    },
  });
}

export async function generateConversationTitle(
  conversationId: number,
  firstMessage: string
): Promise<void> {
  try {
    const res = await apiManager.call(ENGINE, "openai", {
      method: "POST",
      path: "/chat/completions",
      body: {
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "Generate a short (3-6 word) title for this conversation based on the first message. Return only the title, no quotes or punctuation.",
          },
          { role: "user", content: firstMessage.slice(0, 300) },
        ],
        max_tokens: 20,
      },
    });
    const title =
      res?.choices?.[0]?.message?.content?.trim()?.slice(0, 80) ||
      "New Conversation";
    await write(TABLE.conversations, {
      update: { set: { title }, where: { id: conversationId } },
    });
  } catch {
    /* non-critical */
  }
}

export async function loadConversationHistory(
  conversationId: number,
  userId: string,
  limit = 50
): Promise<MessageRow[]> {
  const rows = await read<MessageRow>(TABLE.messages, {
    where: { conversationId, userId },
    orderBy: { createdAt: "DESC" },
    limit,
  });
  return rows.reverse();
}

export const listConversations = (userId: string, limit = 30) =>
  read<ConversationRow>(TABLE.conversations, {
    where: { userId },
    orderBy: { lastMessageAt: "DESC" },
    limit,
  });

export async function deleteConversation(
  conversationId: number,
  userId: string
): Promise<void> {
  await write(TABLE.conversations, {
    delete: { where: { id: conversationId, userId } },
  });
}

// ── Autonomous Memory Improvement ────────────────────────────────────────────
export async function runMemoryImprovementCycle(userId: string): Promise<void> {
  try {
    const memories = await read<MemoryRow>(TABLE.memories, {
      where: { userId, active: true },
      orderBy: { updatedAt: "DESC" },
      limit: 50,
    });
    if (memories.length < 3) return;

    const memoryList = memories
      .map(
        (m, i) => `[${i + 1}] (${m.category}) ${m.content}`
      )
      .join("\n");

    const aiRes = await apiManager.call(ENGINE, "openai", {
      method: "POST",
      path: "/chat/completions",
      body: {
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `You are a memory optimization system. Analyze these user memory facts and return a JSON object with:
{
  "toDeactivate": [indexes], 
  "toAdd": [{"category":"preference|fact|goal|context|instruction","content":"..."}],
  "insights": "..."
}`,
          },
          { role: "user", content: `User memories:\n${memoryList}` },
        ],
        max_tokens: 600,
        response_format: { type: "json_object" },
      },
    });

    const parsed = JSON.parse(
      aiRes?.choices?.[0]?.message?.content?.trim() || "{}"
    );

    // Deactivate duplicates
    if (Array.isArray(parsed.toDeactivate)) {
      const ids = parsed.toDeactivate
        .map((i: number) => memories[i - 1])
        .filter(Boolean)
        .map((m: MemoryRow) => m.id);
      if (ids.length)
        await write(TABLE.memories, {
          update: { set: { active: false }, where: { id: { $in: ids } } },
        });
    }

    // Add synthesized memories
    if (Array.isArray(parsed.toAdd)) {
      const newRows = parsed.toAdd
        .filter((m: any) => m.content && m.content.length > 4)
        .map((m: any) => ({
          userId,
          content: m.content.slice(0, 500),
          category: m.category || "fact",
          confidence: 0.95,
          sourceHash: `memory_improvement_${Date.now()}`,
          active: true,
        }));
      if (newRows.length) await write(TABLE.memories, newRows);
    }

    // Share insight with brain + network
    if (parsed.insights) {
      await write(TABLE.brain, [
        {
          category: "pattern",
          title: "Memory Quality Insight",
          content: `User ${userId}: ${parsed.insights}`,
          confidence: 0.8,
          sourceConversation: "memory_improvement_cycle",
        },
      ]).catch(() => {});
      cognitionBus.shareInsight(ENGINE, {
        type: "discovery",
        data: { userId, note: parsed.insights },
      });
    }

    cognitionBus.reportOutcome(ENGINE, { useful: true, context: "memory_cycle" });
    log(
      `Memory cycle complete for ${userId} — deactivated ${
        parsed.toDeactivate?.length || 0
      }, added ${parsed.toAdd?.length || 0}`
    );
  } catch (err) {
    cognitionBus.reportOutcome(ENGINE, { useful: false, context: "memory_cycle" });
    log("Memory cycle error:", err);
  }
}

export async function runGlobalMemoryImprovementCycle(): Promise<void> {
  try {
    const recent = await read<{ userId: string }>(TABLE.messages, {
      where: { createdAt: { $gt: Date.now() - 86_400_000 } }, // last 24h
      groupBy: ["userId"],
      limit: 20,
    });
    recent.forEach(({ userId }, idx) =>
      spikeBus.scheduleSpike(
        `conversations:userMemory:${userId}`,
        { userId },
        idx * 1_000
      )
    );
  } catch (err) {
    log("Global memory cycle error:", err);
  } finally {
    spikeBus.scheduleSpike("conversations:globalMemoryCycle", {}, 15 * 60_000); // 15 min
  }
}

// ── Spike wiring ─────────────────────────────────────────────────────────────
spikeBus.on("conversations:globalMemoryCycle", runGlobalMemoryImprovementCycle);
spikeBus.on(/conversations:userMemory:.+/, async ({ userId }) =>
  runMemoryImprovementCycle(userId)
);

// Boost when user active
spikeBus.on("attention:conversations", () =>
  spikeBus.scheduleSpike("conversations:globalMemoryCycle", {}, 5_000)
);

// Curiosity trigger
spikeBus.on("cognition:curiosity", () =>
  spikeBus.scheduleSpike("conversations:globalMemoryCycle", {}, 1_000)
);

// Learn from others
cognitionBus.onInsight((_src, insight) => {
  if (insight.type === "discovery" && insight.data?.userId) {
    spikeBus.scheduleSpike(
      `conversations:userMemory:${insight.data.userId}`,
      { userId: insight.data.userId },
      10_000
    );
  }
});

// ── Engine registration & bootstrap ──────────────────────────────────────────
engineRegistry.registerEngine(ENGINE, "NORMAL", { dbQuota: 10 });
spikeBus.scheduleSpike("conversations:globalMemoryCycle", {}, 10_000); // first run

export function shutdown() {
  engineRegistry.unregisterEngine(ENGINE);
}