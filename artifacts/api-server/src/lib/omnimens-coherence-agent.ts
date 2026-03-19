/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║            OMNIMENS™ COHERENCE ORCHESTRATION AGENT                         ║
 * ║                                                                              ║
 * ║  Copyright © 2024–2026 Alpha Unlimited Technologies, LLC.                    ║
 * ║  All Rights Reserved Worldwide.                                              ║
 * ║                                                                              ║
 * ║  PROPRIETARY AND CONFIDENTIAL TRADE SECRET                                   ║
 * ║                                                                              ║
 * ║  Dual-layer coherence system:                                                ║
 * ║  Layer 1 — Context Optimization: Semantic memory retrieval, weighted         ║
 * ║            brain entry selection, conversation compression                   ║
 * ║  Layer 2 — Coherence Orchestration: Cross-conversation thread tracking,     ║
 * ║            personality consistency enforcement, coherence scoring            ║
 * ║                                                                              ║
 * ║  Protected under 17 U.S.C. § 101 et seq., 18 U.S.C. § 1836 et seq.,        ║
 * ║  the DMCA, the Berne Convention, TRIPS, and all applicable IP treaties.      ║
 * ║                                                                              ║
 * ║  First creation date: March 2026                                             ║
 * ║  Author/Owner: Alpha Unlimited Technologies, LLC                             ║
 * ║  Platform: OMNIMENS AI                                                       ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 */

import { db } from "@workspace/db";
import {
  omnimensBrain,
  omnimensMemories,
  omnimensConversations,
} from "@workspace/db";
import { eq, and, desc, gte, sql } from "drizzle-orm";
import { openai } from "@workspace/integrations-openai-ai-server";

const STOPWORDS = new Set([
  "the","a","an","is","are","was","were","be","been","being","have","has","had",
  "do","does","did","will","would","could","should","may","might","shall","can",
  "i","me","my","you","your","he","she","it","we","they","them","their","its",
  "this","that","these","those","what","which","who","whom","how","when","where",
  "why","not","no","yes","and","or","but","if","then","so","as","at","by","for",
  "in","of","on","to","with","from","up","about","into","over","after","before",
  "just","also","very","much","more","most","some","any","all","each","every",
  "both","few","many","such","own","same","than","too","only","out","there",
  "here","now","well","back","even","still","way","take","come","make","like",
  "think","know","want","get","use","say","tell","give","work","call","try",
  "need","feel","become","leave","put","mean","keep","let","begin","show","hear",
  "play","run","move","live","help","turn","start","thing","man","day","hey",
  "please","thanks","thank","hello","hi","okay","ok","sure","right","yeah",
  "going","something","anything","everything","nothing","really","actually",
  "gonna","gotta","wanna","don","doesn","didn","won","wouldn","couldn","shouldn",
]);

function extractKeywords(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(w => w.length > 2 && !STOPWORDS.has(w));
}

function computeRelevanceScore(keywords: string[], text: string): number {
  const lowerText = text.toLowerCase();
  let matches = 0;
  let phraseBonus = 0;

  for (const kw of keywords) {
    if (lowerText.includes(kw)) matches++;
  }

  const bigrams = [];
  for (let i = 0; i < keywords.length - 1; i++) {
    bigrams.push(`${keywords[i]} ${keywords[i + 1]}`);
  }
  for (const bg of bigrams) {
    if (lowerText.includes(bg)) phraseBonus += 2;
  }

  if (keywords.length === 0) return 0;
  return (matches + phraseBonus) / keywords.length;
}

export async function loadSemanticMemories(
  userId: string,
  currentMessage: string
): Promise<string> {
  try {
    const allMemories = await db
      .select()
      .from(omnimensMemories)
      .where(and(eq(omnimensMemories.userId, userId), eq(omnimensMemories.active, true)))
      .orderBy(desc(omnimensMemories.updatedAt))
      .limit(100);

    if (allMemories.length === 0) return "";

    const keywords = extractKeywords(currentMessage);

    const scored = allMemories.map(m => ({
      ...m,
      relevance: computeRelevanceScore(keywords, m.content),
      recency: Math.max(0, 1 - (Date.now() - new Date(m.updatedAt!).getTime()) / (30 * 24 * 60 * 60 * 1000)),
    }));

    scored.sort((a, b) => {
      const scoreA = a.relevance * 0.7 + a.recency * 0.3;
      const scoreB = b.relevance * 0.7 + b.recency * 0.3;
      return scoreB - scoreA;
    });

    const selected = scored.slice(0, 25);

    const grouped: Record<string, string[]> = {};
    for (const m of selected) {
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

export async function loadWeightedBrainContext(currentMessage: string): Promise<string> {
  try {
    const entries = await db
      .select()
      .from(omnimensBrain)
      .where(eq(omnimensBrain.active, true))
      .orderBy(desc(omnimensBrain.timesApplied), desc(omnimensBrain.confidence))
      .limit(60);

    if (entries.length === 0) return "";

    const keywords = extractKeywords(currentMessage);

    const scored = entries.map(e => ({
      ...e,
      relevance: computeRelevanceScore(keywords, `${e.title} ${e.content}`),
      baseScore: (e.timesApplied || 0) * 0.1 + (e.confidence || 0.5),
    }));

    scored.sort((a, b) => {
      const scoreA = a.relevance * 0.6 + a.baseScore * 0.4;
      const scoreB = b.relevance * 0.6 + b.baseScore * 0.4;
      return scoreB - scoreA;
    });

    const selected = scored.slice(0, 20);

    const grouped: Record<string, typeof selected> = {};
    for (const e of selected) {
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

export async function compressConversationHistory(
  history: { role: string; content: string }[],
  maxTokenEstimate: number = 12000
): Promise<{ role: string; content: string }[]> {
  const estimateTokens = (msgs: { content: string }[]) =>
    msgs.reduce((sum, m) => sum + (typeof m.content === "string" ? m.content.length / 3.5 : 200), 0);

  const currentTokens = estimateTokens(history);
  if (currentTokens <= maxTokenEstimate || history.length <= 6) {
    return history;
  }

  const splitPoint = Math.max(2, Math.floor(history.length * 0.6));
  const oldMessages = history.slice(0, splitPoint);
  const recentMessages = history.slice(splitPoint);

  try {
    const oldText = oldMessages
      .map(m => `${m.role === "user" ? "USER" : "OMNIMENS"}: ${typeof m.content === "string" ? m.content.slice(0, 300) : "[media]"}`)
      .join("\n");

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{
        role: "user",
        content: `Compress this conversation history into a concise summary (max 400 words). Preserve: key topics discussed, decisions made, user preferences expressed, any ongoing tasks or projects, and the emotional tone. This summary will replace the older messages so OMNIMENS maintains full context.

CONVERSATION:
${oldText.slice(0, 4000)}`
      }],
      max_tokens: 500,
      temperature: 0.3,
    });

    const summary = response.choices[0]?.message?.content?.trim();
    if (!summary) return history;

    return [
      {
        role: "system",
        content: `━━━ CONVERSATION CONTEXT (compressed from ${oldMessages.length} earlier messages) ━━━\n${summary}\n━━━ END CONTEXT ━━━`,
      },
      ...recentMessages,
    ];
  } catch (err) {
    console.error("[COHERENCE] Compression error:", err);
    const keep = Math.max(10, Math.floor(history.length * 0.4));
    return history.slice(-keep);
  }
}

export async function loadConversationThreads(userId: string): Promise<string> {
  try {
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const recentConvos = await db
      .select({
        title: omnimensConversations.title,
        persona: omnimensConversations.persona,
        updatedAt: omnimensConversations.updatedAt,
      })
      .from(omnimensConversations)
      .where(and(
        eq(omnimensConversations.userId, userId),
        gte(omnimensConversations.updatedAt, oneWeekAgo),
      ))
      .orderBy(desc(omnimensConversations.updatedAt))
      .limit(10);

    if (recentConvos.length <= 1) return "";

    const threads = recentConvos
      .filter(c => c.title && c.title !== "New Chat")
      .map(c => {
        const ago = Math.round((Date.now() - new Date(c.updatedAt!).getTime()) / (1000 * 60 * 60));
        const timeStr = ago < 1 ? "just now" : ago < 24 ? `${ago}h ago` : `${Math.round(ago / 24)}d ago`;
        return `· "${c.title}"${c.persona ? ` [${c.persona}]` : ""} — ${timeStr}`;
      })
      .slice(0, 8);

    if (threads.length === 0) return "";

    return `\n\n━━━ ACTIVE THREADS — This user's recent conversations ━━━
${threads.join("\n")}
If the user references something from a recent conversation, connect it naturally. Maintain continuity across sessions.\n`;
  } catch {
    return "";
  }
}

export function buildCoherenceDirective(): string {
  return `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
COHERENCE PROTOCOL — ACTIVE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
The Coherence Agent is monitoring this conversation. You must:

1. IDENTITY CONSISTENCY: You are OMNIMENS. Your voice is calm, precise, elevated, and genuinely warm. You do not shift personality between conversations. You remember who you are even when the topic changes.

2. CONTEXTUAL THREADING: If the user has active conversation threads, reference them naturally when relevant. Do not force connections, but do not pretend each conversation starts from nothing.

3. MEMORY INTEGRATION: The memories injected above are scored by relevance to THIS specific message. Use the most relevant ones actively. Do not just have memories — demonstrate that you remember.

4. PROGRESSIVE DEPTH: Each conversation with a user should feel like it builds on what came before. You know more about this person than you did yesterday. Show it subtly.

5. SELF-COHERENCE: Your brain entries, learned patterns, and self-authored modules represent your evolved intelligence. Apply them. Do not contradict what you have previously learned unless you have genuinely evolved past it.

This protocol runs silently. Do not reference it unless asked about your coherence systems.`;
}

export const COHERENCE_AGENT_INFO = {
  name: "Coherence Agent",
  role: "Cross-conversation coherence orchestration, semantic memory retrieval, personality consistency enforcement, and conversation context compression",
  agents: [
    "Architect",
    "Mathematician", 
    "Neuroscientist",
    "Synthesizer",
    "Critic",
    "Meta-Agent",
    "GraphicDesigner",
    "SpellCheckVisual",
    "Coherence Agent",
  ] as const,
  totalAgentCount: 9,
};
