/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: multiPassContextRetriever
 * Written: 2026-04-02T14:22:55.922Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// multiPassContextRetriever.mjs

import { createHash } from 'crypto';

/**
 * Utility function to hash a string for consistent chunk identification.
 * @param {string} input - The input string to hash.
 * @returns {string} - A SHA-256 hash of the input string.
 */
export function hashString(input) {
  const hash = createHash('sha256');
  hash.update(input);
  return hash.digest('hex');
}

/**
 * Splits a long context into manageable chunks.
 * @param {string} context - The long context to be segmented.
 * @param {number} chunkSize - The maximum size of each chunk.
 * @returns {string[]} - Array of context chunks.
 */
export function segmentContext(context, chunkSize = 500) {
  const chunks = [];
  for (let i = 0; i < context.length; i += chunkSize) {
    chunks.push(context.slice(i, i + chunkSize));
  }
  return chunks;
}

/**
 * Scores the relevance of a chunk based on a query.
 * @param {string} chunk - The chunk to score.
 * @param {string} query - The query for relevance scoring.
 * @returns {number} - A relevance score (higher is more relevant).
 */
export function scoreChunk(chunk, query) {
  const queryWords = query.toLowerCase().split(/\s+/);
  const chunkWords = chunk.toLowerCase().split(/\s+/);
  let score = 0;
  queryWords.forEach(word => {
    score += chunkWords.filter(chunkWord => chunkWord === word).length;
  });
  return score;
}

/**
 * Hierarchically summarizes chunks by relevance.
 * @param {string[]} chunks - Array of context chunks.
 * @param {string} query - The query for hierarchical summarization.
 * @param {number} topN - Number of top chunks to retain.
 * @returns {string[]} - Array of top relevant chunks.
 */
export function summarizeChunks(chunks, query, topN = 3) {
  const scoredChunks = chunks.map(chunk => ({
    chunk,
    score: scoreChunk(chunk, query)
  }));
  scoredChunks.sort((a, b) => b.score - a.score);
  return scoredChunks.slice(0, topN).map(entry => entry.chunk);
}

/**
 * Processes a long context hierarchically for sequential reasoning.
 * @param {string} context - The long context to process.
 * @param {string} query - The query for relevance.
 * @param {number} chunkSize - The maximum size of each chunk.
 * @param {number} topN - Number of top chunks to retain.
 * @returns {string[]} - Array of summarized context chunks.
 */
export function multiPassContextRetriever(context, query, chunkSize = 500, topN = 3) {
  const chunks = segmentContext(context, chunkSize);
  return summarizeChunks(chunks, query, topN);
}

/**
 * Example utility function for cross-agent use: word frequency analysis.
 * @param {string} text - The text to analyze.
 * @returns {Object} - Frequency map of words in the text.
 */
export function wordFrequencyAnalysis(text) {
  const words = text.toLowerCase().split(/\s+/);
  const frequencyMap = {};
  words.forEach(word => {
    frequencyMap[word] = (frequencyMap[word] || 0) + 1;
  });
  return frequencyMap;
}

/**
 * Example utility function for cross-agent use: chunk hashing.
 * @param {string[]} chunks - Array of context chunks.
 * @returns {string[]} - Array of hashes for each chunk.
 */
export function hashChunks(chunks) {
  return chunks.map(chunk => hashString(chunk));
}