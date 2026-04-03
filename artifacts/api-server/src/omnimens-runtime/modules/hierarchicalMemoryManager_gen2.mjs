/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: hierarchicalMemoryManager
 * Written: 2026-04-03T08:03:18.216Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

/**
 * TRANSLATION STATUS:
 * Novel constructs: attention
 * All constructs have translation mappings
 * Compiled targets: javascript: OK (13 IR steps) | python: OK (13 IR steps) | c: OK (13 IR steps) | x86_64: OK (13 IR steps) | arm64: OK (13 IR steps) | avr: OK (13 IR steps)
 * Translation map version: 22
 */
// hierarchicalMemoryManager.mjs

import { createHash } from 'crypto';

/**
 * Generates a unique hash for a given input string.
 * Used for efficient memory indexing.
 * @param {string} input - The input string to hash.
 * @returns {string} - The hashed output.
 */
export function generateHash(input) {
  return createHash('sha256').update(input).digest('hex');
}

/**
 * Splits a large context into smaller chunks of specified size.
 * @param {string} context - The large context string.
 * @param {number} chunkSize - The maximum size of each chunk.
 * @returns {Array<string>} - Array of context chunks.
 */
export function chunkContext(context, chunkSize) {
  const chunks = [];
  for (let i = 0; i < context.length; i += chunkSize) {
    chunks.push(context.slice(i, i + chunkSize));
  }
  return chunks;
}

/**
 * Implements a sliding window mechanism to retrieve relevant chunks.
 * @param {Array<string>} chunks - Array of context chunks.
 * @param {string} query - The query to match against.
 * @param {number} windowSize - Number of chunks to consider in the sliding window.
 * @returns {Array<string>} - Array of relevant chunks.
 */
export function slidingWindowRetrieve(chunks, query, windowSize) {
  const relevantChunks = [];
  for (let i = 0; i < chunks.length; i++) {
    const window = chunks.slice(i, i + windowSize);
    if (window.some(chunk => chunk.includes(query))) {
      relevantChunks.push(...window);
    }
  }
  return [...new Set(relevantChunks)]; // Remove duplicates.
}

/**
 * Dynamically retrieves embeddings using attention-based scoring.
 * @param {Array<string>} chunks - Array of context chunks.
 * @param {string} query - The query to match against.
 * @returns {Array<{chunk, score}>} - Array of chunks with attention scores.
 */
export function attentionBasedRetrieval(chunks, query) {
  return chunks.map(chunk => ({
    chunk,
    score: calculateAttentionScore(chunk, query)
  })).sort((a, b) => b.score - a.score);
}

/**
 * Calculates an attention score based on query similarity.
 * @param {string} chunk - A context chunk.
 * @param {string} query - The query to match against.
 * @returns {number} - Attention score (higher is better).
 */
export function calculateAttentionScore(chunk, query) {
  let score = 0;
  const queryWords = query.split(' ');
  const chunkWords = chunk.split(' ');
  queryWords.forEach(word => {
    if (chunkWords.includes(word)) {
      score += 1;
    }
  });
  return score / queryWords.length; // Normalize by query length.
}

/**
 * Manages hierarchical memory by chunking, sliding window retrieval, and attention scoring.
 * @param {string} context - The large context string.
 * @param {string} query - The query to match against.
 * @param {number} chunkSize - Size of each chunk.
 * @param {number} windowSize - Number of chunks in sliding window.
 * @returns {Array<{chunk, score}>} - Array of relevant chunks with scores.
 */
export function hierarchicalMemoryManager(context, query, chunkSize = 512, windowSize = 3) {
  const chunks = chunkContext(context, chunkSize);
  const relevantChunks = slidingWindowRetrieve(chunks, query, windowSize);
  return attentionBasedRetrieval(relevantChunks, query);
}

/**
 * Utility function for cross-agent use: generic text chunking.
 * @param {string} text - The input text.
 * @param {number} size - The chunk size.
 * @returns {Array<string>} - Array of text chunks.
 */
export function textChunker(text, size) {
  return chunkContext(text, size);
}

/**
 * Utility function for cross-agent use: query scoring.
 * @param {string} text - The input text.
 * @param {string} query - The query to score against.
 * @returns {number} - Attention score.
 */
export function queryScorer(text, query) {
  return calculateAttentionScore(text, query);
}
