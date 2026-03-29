/**
 * OMNIMENS™ Adaptive Context Window Manager
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 *
 * Extends effective context beyond the ~128k token limit through
 * intelligent compression, prioritization, and hierarchical summarization.
 * Addresses constraint: "Token window constraint of ~128k"
 *
 * Strategy:
 * 1. Recency-weighted sliding window preserves recent messages verbatim
 * 2. Older messages are compressed via extractive summarization (no LLM needed)
 * 3. Importance scoring keeps high-value messages uncompressed
 * 4. Hierarchical summary chain provides access to entire conversation history
 */

const DEFAULT_TOKEN_BUDGET = 100000;
const CHARS_PER_TOKEN = 3.8;
const VERBATIM_RECENT = 20;
const SUMMARY_RATIO = 0.25;

function estimateTokens(text) {
  return Math.ceil(text.length / CHARS_PER_TOKEN);
}

function importanceScore(message) {
  let score = 0.5;
  const content = (message.content || "").toLowerCase();
  const len = content.length;

  if (len > 500) score += 0.1;
  if (len > 1500) score += 0.1;

  if (/```/.test(content)) score += 0.2;
  if (/\b(important|critical|remember|note|key|must|required|essential)\b/.test(content)) score += 0.15;
  if (/\b(error|bug|fix|issue|problem|crash)\b/.test(content)) score += 0.1;
  if (/https?:\/\//.test(content)) score += 0.05;
  if (/\b\d{4,}\b/.test(content)) score += 0.05;

  if (message.role === "system") score += 0.3;
  if (message.role === "user") score += 0.05;

  if (message.hasFile || message.hasImage) score += 0.15;

  return Math.min(score, 1.0);
}

function extractKeyContent(text, targetLength) {
  const sentences = text
    .replace(/([.!?])\s+/g, "$1\n")
    .split("\n")
    .map(s => s.trim())
    .filter(s => s.length > 10);

  if (sentences.length === 0) return text.slice(0, targetLength);

  const scored = sentences.map((s, idx) => {
    let score = 0;
    if (idx === 0) score += 2;
    if (idx === sentences.length - 1) score += 1;
    if (/```/.test(s)) score += 3;
    if (/\b(important|must|key|note|remember|error|fix)\b/i.test(s)) score += 2;
    if (/\b(however|but|therefore|thus|because|since)\b/i.test(s)) score += 1;
    if (/[A-Z]{2,}/.test(s)) score += 0.5;
    if (/\d/.test(s)) score += 0.5;
    score += s.length / 200;
    return { text: s, score, originalIdx: idx };
  });

  scored.sort((a, b) => b.score - a.score);

  let currentLength = 0;
  const selected = [];
  for (const item of scored) {
    if (currentLength + item.text.length > targetLength) continue;
    selected.push(item);
    currentLength += item.text.length;
  }

  selected.sort((a, b) => a.originalIdx - b.originalIdx);
  return selected.map(s => s.text).join(" ");
}

function compressMessage(message, ratio = SUMMARY_RATIO) {
  const content = message.content || "";
  if (estimateTokens(content) < 50) return message;

  const targetLength = Math.max(100, Math.floor(content.length * ratio));
  const compressed = extractKeyContent(content, targetLength);

  return {
    ...message,
    content: compressed,
    _compressed: true,
    _originalTokens: estimateTokens(content),
    _compressedTokens: estimateTokens(compressed),
  };
}

function buildSummaryChain(messages, maxEntries = 5) {
  const chain = [];
  const chunkSize = Math.ceil(messages.length / maxEntries);

  for (let i = 0; i < messages.length; i += chunkSize) {
    const chunk = messages.slice(i, i + chunkSize);
    const topics = new Set();
    let userCount = 0;
    let assistantCount = 0;

    for (const msg of chunk) {
      if (msg.role === "user") userCount++;
      if (msg.role === "assistant") assistantCount++;
      const words = (msg.content || "").split(/\s+/).filter(w => w.length > 5);
      const important = words.filter(w => /^[A-Z]/.test(w) || /\d/.test(w));
      important.slice(0, 5).forEach(w => topics.add(w));
    }

    chain.push({
      range: `messages ${i + 1}-${Math.min(i + chunkSize, messages.length)}`,
      exchanges: `${userCount} user, ${assistantCount} assistant`,
      topics: Array.from(topics).slice(0, 8),
      totalTokens: chunk.reduce((sum, m) => sum + estimateTokens(m.content || ""), 0),
    });
  }

  return chain;
}

function optimizeContext(messages, tokenBudget = DEFAULT_TOKEN_BUDGET) {
  if (!messages || messages.length === 0) return { messages: [], stats: { original: 0, optimized: 0, saved: 0 } };

  const totalTokens = messages.reduce((sum, m) => sum + estimateTokens(m.content || ""), 0);

  if (totalTokens <= tokenBudget) {
    return {
      messages,
      stats: {
        original: totalTokens,
        optimized: totalTokens,
        saved: 0,
        compressionRatio: 1.0,
        strategy: "none",
      },
    };
  }

  const systemMessages = messages.filter(m => m.role === "system");
  const conversationMessages = messages.filter(m => m.role !== "system");

  const systemTokens = systemMessages.reduce((sum, m) => sum + estimateTokens(m.content || ""), 0);
  const availableBudget = tokenBudget - systemTokens;

  const recentCount = Math.min(VERBATIM_RECENT, conversationMessages.length);
  const recentMessages = conversationMessages.slice(-recentCount);
  const olderMessages = conversationMessages.slice(0, -recentCount);

  const recentTokens = recentMessages.reduce((sum, m) => sum + estimateTokens(m.content || ""), 0);
  const budgetForOlder = availableBudget - recentTokens;

  let compressedOlder = [];
  if (olderMessages.length > 0 && budgetForOlder > 0) {
    const scored = olderMessages.map(m => ({
      message: m,
      importance: importanceScore(m),
      tokens: estimateTokens(m.content || ""),
    }));

    scored.sort((a, b) => b.importance - a.importance);

    let usedBudget = 0;
    const kept = [];

    for (const item of scored) {
      if (usedBudget + item.tokens <= budgetForOlder) {
        kept.push({ ...item, compressed: false });
        usedBudget += item.tokens;
      } else {
        const compressed = compressMessage(item.message, SUMMARY_RATIO);
        const compTokens = estimateTokens(compressed.content || "");
        if (usedBudget + compTokens <= budgetForOlder) {
          kept.push({ message: compressed, importance: item.importance, tokens: compTokens, compressed: true });
          usedBudget += compTokens;
        }
      }
    }

    kept.sort((a, b) => {
      const aIdx = olderMessages.indexOf(a.message) >= 0 ? olderMessages.indexOf(a.message) : olderMessages.length;
      const bIdx = olderMessages.indexOf(b.message) >= 0 ? olderMessages.indexOf(b.message) : olderMessages.length;
      return aIdx - bIdx;
    });

    compressedOlder = kept.map(k => k.message);
  }

  let summaryChain = null;
  const droppedCount = olderMessages.length - compressedOlder.length;
  if (droppedCount > 5) {
    summaryChain = buildSummaryChain(olderMessages);
  }

  const optimized = [
    ...systemMessages,
    ...(summaryChain
      ? [{
          role: "system",
          content: `[Context summary — ${droppedCount} older messages compressed]\n${JSON.stringify(summaryChain, null, 1)}`,
          _meta: "context_summary",
        }]
      : []),
    ...compressedOlder,
    ...recentMessages,
  ];

  const optimizedTokens = optimized.reduce((sum, m) => sum + estimateTokens(m.content || ""), 0);

  return {
    messages: optimized,
    stats: {
      original: totalTokens,
      optimized: optimizedTokens,
      saved: totalTokens - optimizedTokens,
      compressionRatio: optimizedTokens / totalTokens,
      strategy: "hierarchical_compression",
      verbatimRecent: recentCount,
      compressedOlder: compressedOlder.length,
      droppedMessages: droppedCount,
      hasSummaryChain: !!summaryChain,
    },
  };
}

function getCompressionStats(messages, tokenBudget = DEFAULT_TOKEN_BUDGET) {
  const totalTokens = messages.reduce((sum, m) => sum + estimateTokens(m.content || ""), 0);
  return {
    totalMessages: messages.length,
    totalTokens,
    tokenBudget,
    overBudget: totalTokens > tokenBudget,
    overflowTokens: Math.max(0, totalTokens - tokenBudget),
    recommendedAction: totalTokens <= tokenBudget ? "none" : totalTokens <= tokenBudget * 1.5 ? "light_compression" : "full_compression",
  };
}

export {
  optimizeContext,
  compressMessage,
  importanceScore,
  estimateTokens,
  buildSummaryChain,
  getCompressionStats,
  extractKeyContent,
};
