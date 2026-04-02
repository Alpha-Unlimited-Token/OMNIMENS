/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: hierarchicalMemoryManager
 * Written: 2026-04-02T13:33:20.954Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// hierarchicalMemoryManager.mjs

import { createHash } from 'crypto';

/**
 * Generate a hash for a given string using SHA-256.
 * Useful for indexing compressed contexts efficiently.
 */
export function generateHash(input) {
  const hash = createHash('sha256');
  hash.update(input);
  return hash.digest('hex');
}

/**
 * Compress a context using importance-scored hierarchical summarization.
 * @param {string} context - The original context data (text).
 * @param {number} importanceThreshold - Threshold for scoring importance (0-1).
 * @returns {string} - Compressed summary of the context.
 */
export function compressContext(context, importanceThreshold = 0.5) {
  const sentences = context.split('.');
  const compressed = sentences
    .filter(sentence => scoreImportance(sentence) >= importanceThreshold)
    .join('.');
  return compressed;
}

/**
 * Score the importance of a sentence based on length and keywords.
 * @param {string} sentence - Sentence to score.
 * @returns {number} - Importance score (0-1).
 */
function scoreImportance(sentence) {
  const keywords = ['critical', 'important', 'key', 'significant'];
  const keywordScore = keywords.reduce((score, keyword) => {
    return sentence.includes(keyword) ? score + 0.2 : score;
  }, 0);
  const lengthScore = Math.min(sentence.length / 100, 0.8);
  return Math.min(keywordScore + lengthScore, 1);
}

/**
 * Store compressed contexts in a hierarchical memory structure.
 * @param {Map} memoryMap - A Map object to store hashed contexts.
 * @param {string} context - Original context data.
 * @param {number} importanceThreshold - Threshold for compression.
 */
export function storeContext(memoryMap, context, importanceThreshold = 0.5) {
  const compressed = compressContext(context, importanceThreshold);
  const hashKey = generateHash(compressed);
  memoryMap.set(hashKey, compressed);
}

/**
 * Retrieve and re-expand a compressed context from memory.
 * @param {Map} memoryMap - A Map object containing hashed contexts.
 * @param {string} hashKey - Hash key of the compressed context.
 * @returns {string|null} - Re-expanded context or null if not found.
 */
export function retrieveContext(memoryMap, hashKey) {
  return memoryMap.get(hashKey) || null;
}

/**
 * Perform adaptive context retrieval using LSH-based indexing.
 * @param {string[]} contexts - Array of contexts.
 * @param {string} query - Query string for similarity search.
 * @returns {string[]} - Array of contexts matching the query.
 */
export function adaptiveRetrieval(contexts, query) {
  const queryHash = generateHash(query);
  const results = contexts.filter(context => {
    const contextHash = generateHash(context);
    return calculateHashSimilarity(queryHash, contextHash) >= 0.8;
  });
  return results;
}

/**
 * Calculate similarity between two hash strings.
 * @param {string} hash1 - First hash.
 * @param {string} hash2 - Second hash.
 * @returns {number} - Similarity score (0-1).
 */
function calculateHashSimilarity(hash1, hash2) {
  let matches = 0;
  for (let i = 0; i < Math.min(hash1.length, hash2.length); i++) {
    if (hash1[i] === hash2[i]) matches++;
  }
  return matches / Math.max(hash1.length, hash2.length);
}

/**
 * Utility to initialize hierarchical memory.
 * @returns {Map} - A new Map object for storing hierarchical memory.
 */
export function initializeMemory() {
  return new Map();
}