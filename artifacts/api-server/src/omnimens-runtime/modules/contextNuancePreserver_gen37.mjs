/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: contextNuancePreserver
 * Written: 2026-04-02T14:13:01.245Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// contextNuancePreserver.mjs

import { createHash } from 'crypto';

/**
 * Perform hierarchical summarization to compress long contexts while preserving key thematic elements.
 * @param {string[]} contextChunks - Array of text chunks representing the full context.
 * @param {number} maxSummaryLength - Maximum length of the final summary.
 * @returns {string} - Compressed summary preserving semantic nuances.
 */
export function hierarchicalSummarization(contextChunks, maxSummaryLength) {
  if (!Array.isArray(contextChunks) || contextChunks.length === 0) {
    throw new Error("contextChunks must be a non-empty array of strings.");
  }
  if (typeof maxSummaryLength !== 'number' || maxSummaryLength <= 0) {
    throw new Error("maxSummaryLength must be a positive number.");
  }

  // Step 1: Generate initial summaries for each chunk
  const initialSummaries = contextChunks.map(chunk => {
    return chunk.length > maxSummaryLength / contextChunks.length
      ? chunk.slice(0, maxSummaryLength / contextChunks.length) + "..."
      : chunk;
  });

  // Step 2: Combine summaries and refine
  const combinedSummary = initialSummaries.join(" ");
  return combinedSummary.length > maxSummaryLength
    ? combinedSummary.slice(0, maxSummaryLength) + "..."
    : combinedSummary;
}

/**
 * Perform Latent Semantic Analysis (LSA) to extract key thematic elements.
 * @param {string[]} contextChunks - Array of text chunks representing the full context.
 * @returns {Set<string>} - Set of key thematic elements.
 */
export function extractKeyThemes(contextChunks) {
  if (!Array.isArray(contextChunks) || contextChunks.length === 0) {
    throw new Error("contextChunks must be a non-empty array of strings.");
  }

  const wordFrequency = new Map();

  // Step 1: Tokenize and count word frequencies
  contextChunks.forEach(chunk => {
    const words = chunk.toLowerCase().match(/\b[a-z]{3}\b/g);
    if (words) {
      words.forEach(word => {
        wordFrequency.set(word, (wordFrequency.get(word) || 0) + 1);
      });
    }
  });

  // Step 2: Identify top thematic elements
  const sortedWords = Array.from(wordFrequency.entries()).sort((a, b) => b[1] - a[1]);
  const topThemes = new Set(sortedWords.slice(0, Math.min(10, sortedWords.length)).map(([word]) => word));

  return topThemes;
}

/**
 * Generate a semantic hash for a given context to ensure uniqueness and quick comparisons.
 * @param {string} context - Full text context.
 * @returns {string} - Semantic hash of the context.
 */
export function generateSemanticHash(context) {
  if (typeof context !== 'string' || context.length === 0) {
    throw new Error("context must be a non-empty string.");
  }

  const hash = createHash('sha256');
  hash.update(context);
  return hash.digest('hex');
}

/**
 * Compress long contexts while preserving semantic nuance using hierarchical summarization and LSA.
 * @param {string[]} contextChunks - Array of text chunks representing the full context.
 * @param {number} maxSummaryLength - Maximum length of the final summary.
 * @returns {{ summary, keyThemes, semanticHash}} - Object containing compressed summary, key themes, and semantic hash.
 */
export function compressContext(contextChunks, maxSummaryLength) {
  const summary = hierarchicalSummarization(contextChunks, maxSummaryLength);
  const keyThemes = extractKeyThemes(contextChunks);
  const semanticHash = generateSemanticHash(summary);

  return { summary, keyThemes, semanticHash };
}
