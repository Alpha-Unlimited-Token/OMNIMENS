/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: slidingWindowMemory
 * Written: 2026-04-03T06:25:58.792Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// slidingWindowMemory.mjs

import { createHash } from 'crypto';

/**
 * Calculates a hash for a given string to enable efficient memory indexing.
 * @param {string} input - The input string to hash.
 * @returns {string} - A hexadecimal hash of the input.
 */
export function generateHash(input) {
  return createHash('sha256').update(input).digest('hex');
}

/**
 * Splits a long string into smaller chunks of a specified size.
 * @param {string} text - The input string to chunk.
 * @param {number} chunkSize - The maximum size of each chunk.
 * @returns {string[]} - An array of string chunks.
 */
export function chunkText(text, chunkSize) {
  const chunks = [];
  for (let i = 0; i < text.length; i += chunkSize) {
    chunks.push(text.slice(i, i + chunkSize));
  }
  return chunks;
}

/**
 * Scores the relevance of a memory chunk based on keyword matches.
 * @param {string} chunk - The memory chunk to evaluate.
 * @param {string[]} keywords - An array of keywords to match.
 * @returns {number} - A relevance score (higher is more relevant).
 */
export function calculateRelevance(chunk, keywords) {
  const lowerChunk = chunk.toLowerCase();
  return keywords.reduce((score, keyword) => {
    const lowerKeyword = keyword.toLowerCase();
    return score + (lowerChunk.includes(lowerKeyword) ? 1 : 0);
  }, 0);
}

/**
 * Maintains a sliding window of memory chunks, dynamically updating based on relevance.
 * @param {string[]} memory - The current memory chunks.
 * @param {string[]} newChunks - New memory chunks to consider.
 * @param {string[]} keywords - Keywords to prioritize for relevance.
 * @param {number} maxChunks - The maximum number of chunks to retain in memory.
 * @returns {string[]} - The updated memory chunks.
 */
export function updateSlidingWindow(memory, newChunks, keywords, maxChunks) {
  const allChunks = [...memory, ...newChunks];
  const scoredChunks = allChunks.map(chunk => ({
    chunk,
    score: calculateRelevance(chunk, keywords)
  }));

  scoredChunks.sort((a, b) => b.score - a.score);
  return scoredChunks.slice(0, maxChunks).map(entry => entry.chunk);
}

/**
 * Retrieves the most relevant memory chunks based on a query.
 * @param {string[]} memory - The memory chunks to search.
 * @param {string} query - The query to match against.
 * @param {number} topN - The number of top results to return.
 * @returns {string[]} - The most relevant memory chunks.
 */
export function retrieveRelevantChunks(memory, query, topN) {
  const keywords = query.split(/\s+/);
  const scoredChunks = memory.map(chunk => ({
    chunk,
    score: calculateRelevance(chunk, keywords)
  }));

  scoredChunks.sort((a, b) => b.score - a.score);
  return scoredChunks.slice(0, topN).map(entry => entry.chunk);
}

/**
 * Combines multiple chunks into a single coherent context string.
 * @param {string[]} chunks - The chunks to combine.
 * @param {string} delimiter - The delimiter to use between chunks.
 * @returns {string} - The combined context string.
 */
export function combineChunks(chunks, delimiter = ' ') {
  return chunks.join(delimiter);
}
