/**
 * OMNIMENS — Proprietary AI Platform
 * Copyright © 2024–2026 Alpha Unlimited Technologies, LLC. All Rights Reserved.
 * Unauthorized reproduction, distribution, or use is strictly prohibited.
 */

/**
 * OMNIMENS Persistent Conversation History
 * Saves every message to the DB so conversations survive app close/refresh.
 * Also provides autonomous memory quality improvement.
 */
import { db } from "@workspace/db";
import { omnimensConversations, omnimensMessages, omnimensMemories, omnimensBrain } from "@workspace/db";
import { eq, and, desc, sql } from "drizzle-orm";
import { openai } from "@workspace/integrations-openai-ai-server";

// ── Create or continue a conversation ────────────────────────────────────────

export async function getOrCreateConversation(
  userId: string,
  conversationId?: number,
  persona: string = "GENERAL"
): Promise<number> {
  if (conversationId) {
    const [existing] = await db
      .select({ id: omnimensConversations.id })
      .from(omnimensConversations)
      .where(and(eq(omnimensConversations.id, conversationId), eq(omnimensConversations.userId, userId)))
      .limit(1);
    if (existing) return existing.id;
  }

  const [conv] = await db
    .insert(omnimensConversations)
    .values({ userId, title: "New Conversation", persona })
    .returning({ id: omnimensConversations.id });

  return conv.id;
}

// ── Save a message (user or assistant) ───────────────────────────────────────

export async function saveMessage(
  conversationId: number,
  userId: string,
  role: "user" | "assistant",
  content: string,
  imageUrl?: string,
  creditsUsed?: number
): Promise<void> {
  await db.insert(omnimensMessages).values({
    conversationId,
    userId,
    role,
    content: content.slice(0, 50000),
    imageUrl,
    creditsUsed,
  });

  await db
    .update(omnimensConversations)
    .set({
      messageCount: sql`${omnimensConversations.messageCount} + 1`,
      lastMessageAt: new Date(),
    })
    .where(eq(omnimensConversations.id, conversationId));
}

// ── Auto-generate a title from the first user message ────────────────────────

export async function generateConversationTitle(
  conversationId: number,
  firstMessage: string
): Promise<void> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "Generate a short (3-6 word) title for this conversation based on the first message. Return only the title, no quotes or punctuation.",
        },
        { role: "user", content: firstMessage.slice(0, 300) },
      ],
      max_tokens: 20,
    });

    const title = response.choices[0]?.message?.content?.trim() || "New Conversation";

    await db
      .update(omnimensConversations)
      .set({ title: title.slice(0, 80) })
      .where(eq(omnimensConversations.id, conversationId));
  } catch {
    // Non-critical
  }
}

// ── Load conversation history from DB ────────────────────────────────────────

export async function loadConversationHistory(
  conversationId: number,
  userId: string,
  limit: number = 50
): Promise<{ role: "user" | "assistant"; content: string }[]> {
  const messages = await db
    .select({
      role: omnimensMessages.role,
      content: omnimensMessages.content,
    })
    .from(omnimensMessages)
    .where(
      and(
        eq(omnimensMessages.conversationId, conversationId),
        eq(omnimensMessages.userId, userId)
      )
    )
    .orderBy(desc(omnimensMessages.createdAt))
    .limit(limit);

  return messages.reverse().map(m => ({
    role: m.role as "user" | "assistant",
    content: m.content,
  }));
}

// ── List user conversations ───────────────────────────────────────────────────

export async function listConversations(userId: string, limit: number = 30) {
  return db
    .select()
    .from(omnimensConversations)
    .where(eq(omnimensConversations.userId, userId))
    .orderBy(desc(omnimensConversations.lastMessageAt))
    .limit(limit);
}

// ── Delete a conversation ────────────────────────────────────────────────────

export async function deleteConversation(conversationId: number, userId: string): Promise<void> {
  await db
    .delete(omnimensConversations)
    .where(
      and(
        eq(omnimensConversations.id, conversationId),
        eq(omnimensConversations.userId, userId)
      )
    );
}

// ── Autonomous Memory Quality Improvement ────────────────────────────────────
// Runs periodically — consolidates duplicates, improves weak memories,
// discovers new patterns from recent conversation history
export async function runMemoryImprovementCycle(userId: string): Promise<void> {
  try {
    const memories = await db
      .select()
      .from(omnimensMemories)
      .where(and(eq(omnimensMemories.userId, userId), eq(omnimensMemories.active, true)))
      .orderBy(desc(omnimensMemories.updatedAt))
      .limit(50);

    if (memories.length < 3) return;

    const memoryList = memories.map((m, i) =>
      `[${i + 1}] (${m.category}) ${m.content}`
    ).join("\n");

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are a memory optimization system. Analyze these user memory facts and return a JSON object with:
{
  "toDeactivate": [1, 3, ...],  // indexes of duplicate/outdated/low-quality memories to remove
  "toAdd": [
    { "category": "preference|fact|goal|context|instruction", "content": "improved or synthesized fact" }
  ],
  "insights": "brief note on memory quality"
}
Only deactivate clear duplicates or contradictions. Only add memories that synthesize or improve existing ones.
Return {} if memory is already high quality.`,
        },
        { role: "user", content: `User memories:\n${memoryList}` },
      ],
      max_tokens: 600,
      response_format: { type: "json_object" },
    });

    const text = response.choices[0]?.message?.content?.trim() || "{}";
    const result = JSON.parse(text);

    if (result.toDeactivate?.length > 0) {
      for (const idx of result.toDeactivate) {
        const mem = memories[idx - 1];
        if (mem) {
          await db
            .update(omnimensMemories)
            .set({ active: false })
            .where(eq(omnimensMemories.id, mem.id));
        }
      }
    }

    if (result.toAdd?.length > 0) {
      for (const mem of result.toAdd) {
        if (!mem.content || mem.content.length < 5) continue;
        await db.insert(omnimensMemories).values({
          userId,
          content: mem.content.slice(0, 500),
          category: mem.category || "fact",
          confidence: 0.95,
          sourceHash: "memory_improvement_" + Date.now(),
          active: true,
        });
      }
    }

    if (result.insights) {
      await db.insert(omnimensBrain).values({
        category: "pattern",
        title: "Memory Quality Insight",
        content: `User ${userId}: ${result.insights}`,
        confidence: 0.8,
        sourceConversation: "memory_improvement_cycle",
      }).catch(() => {});
    }

    console.log(`[OMNIMENS Memory] Quality cycle complete — user ${userId}: removed ${result.toDeactivate?.length || 0}, added ${result.toAdd?.length || 0}`);
  } catch (err) {
    console.error("[OMNIMENS Memory] Quality cycle error:", err);
  }
}

// ── Global autonomous memory improvement (all active users) ──────────────────
export async function runGlobalMemoryImprovementCycle(): Promise<void> {
  try {
    const recentUsers = await db
      .select({ userId: omnimensMessages.userId })
      .from(omnimensMessages)
      .where(
        sql`${omnimensMessages.createdAt} > NOW() - INTERVAL '24 hours'`
      )
      .groupBy(omnimensMessages.userId)
      .limit(20);

    for (const { userId } of recentUsers) {
      await runMemoryImprovementCycle(userId);
      await new Promise(r => setTimeout(r, 500));
    }
  } catch (err) {
    console.error("[OMNIMENS Memory] Global cycle error:", err);
  }
}
