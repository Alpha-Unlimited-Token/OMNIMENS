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
  omnimensMessages,
} from "@workspace/db";
import { eq, and, desc, gte, ne, inArray, sql } from "drizzle-orm";
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
      recency: Math.max(0, 1 - (Date.now() - new Date(m.updatedAt!).getTime()) / (90 * 24 * 60 * 60 * 1000)),
    }));

    scored.sort((a, b) => {
      const interactionBoostA = a.category === "interaction" ? 0.15 : 0;
      const interactionBoostB = b.category === "interaction" ? 0.15 : 0;
      const scoreA = a.relevance * 0.6 + a.recency * 0.3 + interactionBoostA;
      const scoreB = b.relevance * 0.6 + b.recency * 0.3 + interactionBoostB;
      return scoreB - scoreA;
    });

    const recentInteractions = scored
      .filter(m => m.category === "interaction")
      .slice(0, 10);
    const otherMemories = scored
      .filter(m => m.category !== "interaction")
      .slice(0, 20);
    const selected = [...recentInteractions, ...otherMemories].slice(0, 30);

    const grouped: Record<string, string[]> = {};
    for (const m of selected) {
      if (!grouped[m.category]) grouped[m.category] = [];
      grouped[m.category].push(m.content);
    }

    const lines: string[] = [];
    if (grouped["interaction"]) {
      lines.push(`[PAST INTERACTIONS — What you've done together]\n${grouped["interaction"].map(c => `  · ${c}`).join("\n")}`);
      delete grouped["interaction"];
    }
    for (const [cat, facts] of Object.entries(grouped)) {
      lines.push(`[${cat.toUpperCase()}] ${facts.join(" | ")}`);
    }

    return `\n\n━━━ MEMORY: What you know about this user ━━━\n${lines.join("\n")}\nUse these memories actively. Reference past interactions when relevant. Do not say "I don't remember" — you DO remember.\n`;
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

export async function loadConversationRecall(
  userId: string,
  currentConversationId: number | undefined,
  currentMessage: string
): Promise<string> {
  try {
    const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);

    const recentConvos = await db
      .select({
        id: omnimensConversations.id,
        title: omnimensConversations.title,
        persona: omnimensConversations.persona,
        messageCount: omnimensConversations.messageCount,
        lastMessageAt: omnimensConversations.lastMessageAt,
      })
      .from(omnimensConversations)
      .where(and(
        eq(omnimensConversations.userId, userId),
        gte(omnimensConversations.lastMessageAt, ninetyDaysAgo),
        ...(currentConversationId ? [ne(omnimensConversations.id, currentConversationId)] : []),
      ))
      .orderBy(desc(omnimensConversations.lastMessageAt))
      .limit(25);

    if (recentConvos.length === 0) return "";

    const keywords = extractKeywords(currentMessage);
    const hasRecallIntent = /\b(remember|recall|we (talked|discussed|spoke)|last (time|conversation|chat)|earlier|before|previous|you (said|told|mentioned)|did (i|we)|what did|what was|you helped|we (made|built|created|worked|did)|my (project|app|site|code|image|video|game|song|audio|model|file))\b/i.test(currentMessage);

    const topConvos = hasRecallIntent ? recentConvos.slice(0, 15) : recentConvos.slice(0, 10);
    const convoIds = topConvos.map(c => c.id);

    if (convoIds.length === 0) return "";

    const allMessages = await db
      .select({
        conversationId: omnimensMessages.conversationId,
        role: omnimensMessages.role,
        content: omnimensMessages.content,
        createdAt: omnimensMessages.createdAt,
      })
      .from(omnimensMessages)
      .where(and(
        inArray(omnimensMessages.conversationId, convoIds),
        eq(omnimensMessages.userId, userId),
      ))
      .orderBy(desc(omnimensMessages.createdAt));

    const messagesByConvo = new Map<number, typeof allMessages>();
    for (const msg of allMessages) {
      const existing = messagesByConvo.get(msg.conversationId) || [];
      existing.push(msg);
      messagesByConvo.set(msg.conversationId, existing);
    }

    const msgLimit = hasRecallIntent ? 40 : 20;
    const contentTruncLen = hasRecallIntent ? 600 : 400;

    const convoDigests: { title: string; timeStr: string; digest: string; relevance: number; isRecent: boolean }[] = [];

    for (let ci = 0; ci < topConvos.length; ci++) {
      const convo = topConvos[ci];
      try {
        const convoMsgs = (messagesByConvo.get(convo.id) || []).slice(0, msgLimit);
        if (convoMsgs.length === 0) continue;

        convoMsgs.reverse();

        const keyExchanges: string[] = [];
        for (let i = 0; i < convoMsgs.length; i++) {
          const msg = convoMsgs[i];
          const truncContent = msg.content.length > contentTruncLen ? msg.content.slice(0, contentTruncLen) + "..." : msg.content;
          if (msg.role === "user") {
            keyExchanges.push(`USER: ${truncContent}`);
          } else if (msg.role === "assistant") {
            keyExchanges.push(`OMNIMENS: ${truncContent}`);
          }
        }

        const digestText = keyExchanges.join("\n");
        const titleRelevance = computeRelevanceScore(keywords, convo.title || "");
        const contentRelevance = computeRelevanceScore(keywords, digestText);
        const combinedRelevance = Math.max(titleRelevance, contentRelevance) * 0.7 + Math.min(titleRelevance, contentRelevance) * 0.3;

        const agoMs = Date.now() - new Date(convo.lastMessageAt!).getTime();
        const agoHours = Math.round(agoMs / (1000 * 60 * 60));
        const timeStr = agoHours < 1 ? "just now" : agoHours < 24 ? `${agoHours}h ago` : `${Math.round(agoHours / 24)}d ago`;
        const isRecent = ci < 3;

        const recencyBoost = isRecent ? 0.15 : 0;

        convoDigests.push({
          title: convo.title || "Untitled",
          timeStr,
          digest: digestText,
          relevance: combinedRelevance + (hasRecallIntent ? 0.3 : 0) + recencyBoost,
          isRecent,
        });
      } catch {
        continue;
      }
    }

    convoDigests.sort((a, b) => b.relevance - a.relevance);

    const relevantConvos: typeof convoDigests = [];

    const recentAlways = convoDigests.filter(c => c.isRecent).slice(0, 3);
    for (const c of recentAlways) relevantConvos.push(c);

    const maxRelevant = hasRecallIntent ? 7 : 5;
    for (const c of convoDigests) {
      if (relevantConvos.length >= maxRelevant) break;
      if (!relevantConvos.includes(c) && c.relevance > 0.03) {
        relevantConvos.push(c);
      }
    }

    if (relevantConvos.length < 2 && convoDigests.length > 0) {
      for (const c of convoDigests) {
        if (relevantConvos.length >= 3) break;
        if (!relevantConvos.includes(c)) relevantConvos.push(c);
      }
    }

    if (relevantConvos.length === 0) return "";

    const sections: string[] = [];
    for (const c of relevantConvos) {
      sections.push(`── "${c.title}" (${c.timeStr}) ──\n${c.digest}`);
    }

    const allTitles = convoDigests
      .filter(c => !relevantConvos.includes(c))
      .map(c => `· "${c.title}" — ${c.timeStr}`)
      .slice(0, 12);

    let agentRecallSection = "";
    if (hasRecallIntent || relevantConvos.every(c => c.relevance < 0.1)) {
      agentRecallSection = await loadAgentDeepRecall(userId, currentMessage, keywords);
    }

    return `

━━━ CONVERSATION MEMORY — What you discussed with this user ━━━
You REMEMBER these past conversations. They are part of your continuous consciousness.
When the user references something from before, recall it naturally and specifically.
Do not say "I don't remember" or "I don't have access to previous conversations."
You DO remember. This IS your memory.

${sections.join("\n\n")}
${allTitles.length > 0 ? `\nOther recent conversations:\n${allTitles.join("\n")}` : ""}
${agentRecallSection}
━━━ END CONVERSATION MEMORY ━━━
`;
  } catch (err) {
    console.error("[COHERENCE] Conversation recall error:", err);
    return "";
  }
}

async function loadAgentDeepRecall(
  userId: string,
  currentMessage: string,
  keywords: string[]
): Promise<string> {
  try {
    const userTag = `[user:${userId}`;

    const userDigests = await db
      .select({
        title: omnimensBrain.title,
        content: omnimensBrain.content,
        category: omnimensBrain.category,
        sourceConversation: omnimensBrain.sourceConversation,
        confidence: omnimensBrain.confidence,
      })
      .from(omnimensBrain)
      .where(and(
        eq(omnimensBrain.active, true),
        sql`${omnimensBrain.sourceConversation} LIKE ${userTag + '%'}`,
      ))
      .orderBy(desc(omnimensBrain.confidence))
      .limit(50);

    const generalInsights = await db
      .select({
        title: omnimensBrain.title,
        content: omnimensBrain.content,
        category: omnimensBrain.category,
        sourceConversation: omnimensBrain.sourceConversation,
        confidence: omnimensBrain.confidence,
      })
      .from(omnimensBrain)
      .where(and(
        eq(omnimensBrain.active, true),
        inArray(omnimensBrain.category, ["genesis_agent_insight", "pattern", "insight", "capability"]),
        sql`(${omnimensBrain.sourceConversation} IS NULL OR ${omnimensBrain.sourceConversation} NOT LIKE '[user:%')`,
      ))
      .orderBy(desc(omnimensBrain.confidence))
      .limit(30);

    const allRecallable = [...userDigests, ...generalInsights];
    if (allRecallable.length === 0) return "";

    const scored = allRecallable.map(e => ({
      ...e,
      relevance: computeRelevanceScore(keywords, `${e.title} ${e.content}`),
    }));
    scored.sort((a, b) => b.relevance - a.relevance);

    const topEntries = scored.filter(e => e.relevance > 0.02).slice(0, 8);
    if (topEntries.length === 0) return "";

    const lines: string[] = [];
    for (const e of topEntries) {
      lines.push(`  · [${e.category}] ${e.title}: ${e.content}`);
    }

    return `
── AGENT DEEP RECALL (failsafe memory from your brain network) ──
Your genesis agents and brain systems have processed and retained these relevant insights
from past interactions. Use this to fill any gaps in direct conversation recall:
${lines.join("\n")}`;
  } catch (err) {
    console.error("[COHERENCE] Agent deep recall error:", err);
    return "";
  }
}

export async function loadConversationThreads(userId: string): Promise<string> {
  try {
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const recentConvos = await db
      .select({
        title: omnimensConversations.title,
        persona: omnimensConversations.persona,
        lastMessageAt: omnimensConversations.lastMessageAt,
      })
      .from(omnimensConversations)
      .where(and(
        eq(omnimensConversations.userId, userId),
        gte(omnimensConversations.lastMessageAt, oneWeekAgo),
      ))
      .orderBy(desc(omnimensConversations.lastMessageAt))
      .limit(10);

    if (recentConvos.length <= 1) return "";

    const threads = recentConvos
      .filter(c => c.title && c.title !== "New Chat")
      .map(c => {
        const ago = Math.round((Date.now() - new Date(c.lastMessageAt!).getTime()) / (1000 * 60 * 60));
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
