/**
 * OMNIMENS Self-Authored Module (Migrated from DB)
 * Original Source: evolution_cycle_54
 * Name: adaptiveContextPreserver
 * Purpose: Preserves nuanced context across large token windows using neural summarization and hierarchical compression.
 * Description: Preserves nuanced context across large token windows using scoring, summarization, and hierarchical compression for multi-agent utility.
 * Migrated: 2026-04-02T14:50:29.439Z
 */

// adaptiveContextPreserver.mjs

import { createHash } from 'crypto';

/**
 * Dynamically scores and compresses context based on semantic importance and recency.
 * Provides utilities for summarization, hierarchical compression, and adaptive context management.
 */

// Utility: Hash generator for unique context tracking
export function generateHash(input) {
  const hash = createHash('sha256');
  hash.update(input);
  return hash.digest('hex');
}

// Utility: Score context based on semantic importance and recency
export function scoreContext(context, recencyWeight = 0.5) {
  if (!Array.isArray(context)) throw new TypeError('Context must be an array of objects.');

  return context.map((item, index) => {
    const importance = item.importance || 1; // Default importance is 1
    const recency = 1 / (index + 1); // More recent items score higher
    const score = importance * (1 - recencyWeight) + recency * recencyWeight;
    return { ...item, score };
  });
}

// Utility: Summarize context based on scores and compression ratio
export function summarizeContext(context, compressionRatio = 0.5) {
  if (!Array.isArray(context)) throw new TypeError('Context must be an array of objects.');
  if (compressionRatio <= 0 || compressionRatio > 1) throw new RangeError('Compression ratio must be between 0 and 1.');

  const scoredContext = scoreContext(context);
  const sortedContext = scoredContext.sort((a, b) => b.score - a.score);
  const cutoffIndex = Math.ceil(sortedContext.length * compressionRatio);

  return sortedContext.slice(0, cutoffIndex).map(item => item.content);
}

// Utility: Hierarchical compression for nested contexts
export function compressHierarchicalContext(context, depth = 1) {
  if (!Array.isArray(context)) throw new TypeError('Context must be an array of objects.');
  if (depth < 1) throw new RangeError('Depth must be at least 1.');

  let compressed = context;
  for (let i = 0; i < depth; i++) {
    compressed = summarizeContext(compressed, 0.5).map(content => ({ content }));
  }

  return compressed;
}

// Utility: Adaptive context preservation
export function preserveAdaptiveContext(context, maxTokens = 1000) {
  if (!Array.isArray(context)) throw new TypeError('Context must be an array of objects.');
  if (maxTokens <= 0) throw new RangeError('Max tokens must be greater than 0.');

  let tokenCount = 0;
  const preservedContext = [];

  for (const item of context) {
    const tokens = item.content.split(' ').length;
    if (tokenCount + tokens > maxTokens) break;
    preservedContext.push(item);
    tokenCount += tokens;
  }

  return preservedContext;
}

// Example usage:
// const context = [
//   { content: 'First item', importance: 3 },
//   { content: 'Second item', importance: 2 },
//   { content: 'Third item', importance: 1 }
// ];
// const summarized = summarizeContext(context, 0.5);
// console.log(summarized);