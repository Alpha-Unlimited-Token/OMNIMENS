/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: contextSummarizer
 * Written: 2026-04-02T00:10:08.953Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// contextSummarizer.mjs

import { createHash } from 'crypto';

/**
 * Generate a hash-based unique identifier for a given input.
 * Useful for deduplication or embedding caching across agents.
 * @param {string} input - The input string to hash.
 * @returns {string} - A fixed-size hash string.
 */
export function generateHash(input) {
  const hash = createHash('sha256');
  hash.update(input);
  return hash.digest('hex');
}

/**
 * Tokenize a string into words, removing punctuation and normalizing case.
 * @param {string} text - Input text to tokenize.
 * @returns {string[]} - Array of normalized tokens.
 */
export function tokenizeText(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .split(/\s+/)
    .filter(Boolean);
}

/**
 * Compute a simple frequency-based embedding for a given text.
 * @param {string} text - Input text to process.
 * @returns {Object} - A frequency map of tokens.
 */
export function computeEmbedding(text) {
  const tokens = tokenizeText(text);
  const embedding = {};
  for (const token of tokens) {
    embedding[token] = (embedding[token] || 0) + 1;
  }
  return embedding;
}

/**
 * Merge two embeddings by summing their token frequencies.
 * @param {Object} embeddingA - First embedding.
 * @param {Object} embeddingB - Second embedding.
 * @returns {Object} - Merged embedding.
 */
export function mergeEmbeddings(embeddingA, embeddingB) {
  const merged = { ...embeddingA };
  for (const [token, count] of Object.entries(embeddingB)) {
    merged[token] = (merged[token] || 0) + count;
  }
  return merged;
}

/**
 * Periodically condense a sequence of text entries into a fixed-size embedding.
 * @param {string[]} context - Array of text entries representing conversation context.
 * @param {number} maxSize - Maximum number of tokens to retain in the embedding.
 * @returns {Object} - Condensed embedding.
 */
export function summarizeContext(context, maxSize = 100) {
  let combinedEmbedding = {};

  for (const entry of context) {
    const entryEmbedding = computeEmbedding(entry);
    combinedEmbedding = mergeEmbeddings(combinedEmbedding, entryEmbedding);
  }

  // Sort tokens by frequency and truncate to maxSize
  const sortedTokens = Object.entries(combinedEmbedding)
    .sort(([, countA], [, countB]) => countB - countA)
    .slice(0, maxSize);

  // Rebuild the embedding with only the top tokens
  const summarizedEmbedding = {};
  for (const [token, count] of sortedTokens) {
    summarizedEmbedding[token] = count;
  }

  return summarizedEmbedding;
}

/**
 * Convert an embedding into a normalized vector for comparison.
 * @param {Object} embedding - The embedding to normalize.
 * @returns {Object} - Normalized embedding vector.
 */
export function normalizeEmbedding(embedding) {
  const total = Object.values(embedding).reduce((sum, count) => sum + count, 0);
  const normalized = {};
  for (const [token, count] of Object.entries(embedding)) {
    normalized[token] = count / total;
  }
  return normalized;
}

/**
 * Calculate cosine similarity between two embeddings.
 * @param {Object} embeddingA - First embedding.
 * @param {Object} embeddingB - Second embedding.
 * @returns {number} - Cosine similarity score (0 to 1).
 */
export function cosineSimilarity(embeddingA, embeddingB) {
  const tokens = new Set([...Object.keys(embeddingA), ...Object.keys(embeddingB)]);
  let dotProduct = 0;
  let magnitudeA = 0;
  let magnitudeB = 0;

  for (const token of tokens) {
    const valueA = embeddingA[token] || 0;
    const valueB = embeddingB[token] || 0;
    dotProduct += valueA * valueB;
    magnitudeA += valueA ** 2;
    magnitudeB += valueB ** 2;
  }

  if (magnitudeA === 0 || magnitudeB === 0) return 0;
  return dotProduct / (Math.sqrt(magnitudeA) * Math.sqrt(magnitudeB));
}

/**
 * Example usage within Node.js environment.
 * Uncomment the following lines to test the module functionality.
 */
// const context = [
//   "Zero-shot learning is a powerful technique.",
//   "Few-shot prompting can improve performance.",
//   "Advanced techniques include fine-tuning and embedding generation."
// ];
// const summarized = summarizeContext(context);
// console.log(summarized);
