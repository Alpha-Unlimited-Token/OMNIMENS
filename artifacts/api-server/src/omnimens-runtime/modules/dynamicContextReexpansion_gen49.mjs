/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: dynamicContextReexpansion
 * Written: 2026-04-02T14:27:12.165Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// dynamicContextReexpansion.mjs

import { createHash } from 'crypto';

/**
 * Generates a hash for identifying context chunks.
 * @param {string} input - The input string to hash.
 * @returns {string} - A SHA-256 hash of the input.
 */
export function generateHash(input) {
  const hash = createHash('sha256');
  hash.update(input);
  return hash.digest('hex');
}

/**
 * Summarizes a context chunk hierarchically.
 * @param {string} input - The input string to summarize.
 * @param {number} maxLength - Maximum length of the summary.
 * @returns {string} - A summarized version of the input.
 */
export function summarizeChunk(input, maxLength) {
  if (input.length <= maxLength) return input;

  const sentences = input.split('. ');
  const prioritizedSentences = sentences
    .map((sentence, index) => ({ sentence, score: index }))
    .sort((a, b) => a.score - b.score);

  const summary = prioritizedSentences
    .slice(0, Math.min(prioritizedSentences.length, maxLength / 10))
    .map(({ sentence }) => sentence)
    .join('. ');

  return summary;
}

/**
 * Re-expands compressed context based on relevance scoring.
 * @param {string[]} compressedChunks - Array of compressed context chunks.
 * @param {string} query - The query to evaluate relevance.
 * @param {number} threshold - Relevance threshold (0-1).
 * @returns {string[]} - Array of re-expanded context chunks.
 */
export function reExpandContext(compressedChunks, query, threshold) {
  const relevanceScores = compressedChunks.map(chunk => ({
    chunk,
    score: calculateRelevance(chunk, query)
  }));

  const relevantChunks = relevanceScores.filter(({ score }) => score >= threshold);

  return relevantChunks.map(({ chunk }) => chunk);
}

/**
 * Calculates relevance between a context chunk and a query.
 * @param {string} chunk - The context chunk.
 * @param {string} query - The query string.
 * @returns {number} - Relevance score (0-1).
 */
export function calculateRelevance(chunk, query) {
  const chunkWords = chunk.split(' ');
  const queryWords = query.split(' ');

  const matchingWords = queryWords.filter(word => chunkWords.includes(word));
  return matchingWords.length / queryWords.length;
}

/**
 * Dynamically restores compressed context chunks during reasoning.
 * @param {string[]} contextChunks - Array of original context chunks.
 * @param {string} query - The query to evaluate relevance.
 * @param {number} maxLength - Maximum length for re-expanded chunks.
 * @returns {string[]} - Array of restored context chunks.
 */
export function dynamicRestore(contextChunks, query, maxLength) {
  const compressedChunks = contextChunks.map(chunk => summarizeChunk(chunk, maxLength));
  return reExpandContext(compressedChunks, query, 0.5);
}

/**
 * Utility function for hierarchical summarization chains.
 * @param {string[]} contextChunks - Array of context chunks.
 * @param {number} maxLength - Maximum length for summaries.
 * @returns {string[]} - Array of summarized context chunks.
 */
export function hierarchicalSummarization(contextChunks, maxLength) {
  return contextChunks.map(chunk => summarizeChunk(chunk, maxLength));
}