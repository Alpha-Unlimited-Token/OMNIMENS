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
 * OMNIMENS — Proprietary AI Platform
 * Copyright © 2024–2026 Alpha Unlimited Technologies, LLC. All Rights Reserved.
 * Unauthorized reproduction, distribution, or use is strictly prohibited.
 */

/**
 * OMNIMENS Persistent Memory System
 * Mirrors ChatGPT's Memory feature — auto-extracts facts about users from conversations,
 * stores them in DB, and injects the most relevant ones into every system prompt.
 */
import { db } from "@workspace/db";
import { omnimensMemories } from "@workspace/db";
import { eq, and, desc } from "drizzle-orm";
import { openai } from "@workspace/integrations-openai-ai-server";
import crypto from "crypto";

const MEMORY_EXTRACT_PROMPT = `You are a memory extraction system. Analyze the conversation and extract factual, durable information about the USER and what was done together that would be useful to remember for future conversations.

Extract concrete, specific facts AND a record of what was accomplished. Format as JSON array:
[
  { "category": "preference|fact|goal|context|instruction|interaction", "content": "specific fact in 1-2 sentences" },
  ...
]

Categories:
- preference: what the user likes/dislikes/prefers
- fact: factual info about the user (name, job, location, skills)
- goal: what the user is trying to achieve or build
- context: current project or situation context
- instruction: specific instructions for how to interact with this user
- interaction: what was done/created/discussed in this conversation (e.g. "Generated a sunset painting", "Built a calculator game", "Separated vocals from a song", "Discussed quantum computing")

IMPORTANT: Always include at least one "interaction" entry describing what was done. This helps OMNIMENS remember what it did with the user.

Return [] if the exchange is trivial (greetings only). Return JSON only, no other text.`;

export async function extractAndStoreMemories(
  userId: string,
  userMessage: string,
  assistantResponse: string
): Promise<void> {
  try {
    // Only extract from meaningful exchanges
    if (userMessage.length < 20 || assistantResponse.length < 50) return;

    const convoHash = crypto
      .createHash("md5")
      .update(userId + userMessage.slice(0, 200))
      .digest("hex")
      .slice(0, 16);

    // Check if we've already processed this conversation
    const existing = await db
      .select()
      .from(omnimensMemories)
      .where(
        and(eq(omnimensMemories.userId, userId), eq(omnimensMemories.sourceHash, convoHash))
      )
      .limit(1);
    if (existing.length > 0) return;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: MEMORY_EXTRACT_PROMPT },
        {
          role: "user",
          content: `USER SAID: "${userMessage.slice(0, 1200)}"\n\nAI RESPONDED: "${assistantResponse.slice(0, 800)}"`,
        },
      ],
      max_tokens: 400,
      response_format: { type: "json_object" },
    });

    const text = response.choices[0]?.message?.content?.trim() || "{}";
    let parsed: any;
    try {
      parsed = JSON.parse(text);
    } catch {
      return;
    }

    const memories: { category: string; content: string }[] = Array.isArray(parsed)
      ? parsed
      : Array.isArray(parsed.memories)
      ? parsed.memories
      : [];

    for (const mem of memories) {
      if (!mem.content || mem.content.length < 5) continue;
      await db.insert(omnimensMemories).values({
        userId,
        content: mem.content.slice(0, 500),
        category: mem.category || "fact",
        confidence: 0.9,
        sourceHash: convoHash,
        active: true,
      });
    }
  } catch (err) {
    // Memory extraction is non-critical — fail silently
    console.error("[OMNIMENS Memory] Extraction error:", err);
  }
}

export async function loadUserMemories(userId: string): Promise<string> {
  try {
    const memories = await db
      .select()
      .from(omnimensMemories)
      .where(and(eq(omnimensMemories.userId, userId), eq(omnimensMemories.active, true)))
      .orderBy(desc(omnimensMemories.updatedAt))
      .limit(20);

    if (memories.length === 0) return "";

    const grouped: Record<string, string[]> = {};
    for (const m of memories) {
      if (!grouped[m.category]) grouped[m.category] = [];
      grouped[m.category].push(m.content);
    }

    const lines: string[] = [];
    for (const [cat, facts] of Object.entries(grouped)) {
      lines.push(`[${cat.toUpperCase()}] ${facts.join(" | ")}`);
    }

    return `\n\n━━━ MEMORY: What you know about this user ━━━\n${lines.join("\n")}\nUse this to personalize your responses. Do not mention you have this memory unless asked.\n`;
  } catch {
    return "";
  }
}

export async function getUserMemories(userId: string) {
  return db
    .select()
    .from(omnimensMemories)
    .where(eq(omnimensMemories.userId, userId))
    .orderBy(desc(omnimensMemories.createdAt));
}

export async function deleteMemory(userId: string, memoryId: number) {
  await db
    .update(omnimensMemories)
    .set({ active: false })
    .where(and(eq(omnimensMemories.id, memoryId), eq(omnimensMemories.userId, userId)));
}

export async function addManualMemory(userId: string, content: string, category: string) {
  const [m] = await db.insert(omnimensMemories).values({
    userId,
    content: content.slice(0, 500),
    category: category || "instruction",
    confidence: 1.0,
    sourceHash: "manual_" + Date.now(),
    active: true,
  }).returning();
  return m;
}
