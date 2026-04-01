/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: hierarchicalMemoryManager
 * Written: 2026-04-01T22:22:40.432Z
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
 * Generates a hash for a given input string. Useful for deduplication or quick comparisons.
 * @param {string} input - The input string to hash.
 * @returns {string} - A hex-encoded SHA-256 hash.
 */
export function generateHash(input) {
  const hash = createHash('sha256');
  hash.update(input);
  return hash.digest('hex');
}

/**
 * Computes the cosine similarity between two vectors.
 * @param {number[]} vecA - The first vector.
 * @param {number[]} vecB - The second vector.
 * @returns {number} - Cosine similarity value between -1 and 1.
 */
export function cosineSimilarity(vecA, vecB) {
  if (vecA.length !== vecB.length) {
    throw new Error('Vectors must be of the same length');
  }

  const dotProduct = vecA.reduce((sum, val, i) => sum + val * vecB[i], 0);
  const magnitudeA = Math.sqrt(vecA.reduce((sum, val) => sum + val ** 2, 0));
  const magnitudeB = Math.sqrt(vecB.reduce((sum, val) => sum + val ** 2, 0));

  if (magnitudeA === 0 || magnitudeB === 0) {
    return 0; // Avoid division by zero
  }

  return dotProduct / (magnitudeA * magnitudeB);
}

/**
 * Summarizes a list of text entries into a shorter representation based on importance scores.
 * @param {Array<{ text, importance}>} entries - List of memory entries with importance scores.
 * @param {number} maxLength - The maximum length of the summarized output.
 * @returns {string} - A summarized representation of the input entries.
 */
export function summarizeEntries(entries, maxLength) {
  if (!Array.isArray(entries) || entries.some(e => typeof e.text !== 'string' || typeof e.importance !== 'number')) {
    throw new Error('Invalid entries format. Expected an array of { text, importance}');
  }

  // Sort entries by importance in descending order
  const sortedEntries = entries.sort((a, b) => b.importance - a.importance);

  // Concatenate entries until maxLength is reached
  let summary = '';
  for (const entry of sortedEntries) {
    if (summary.length + entry.text.length > maxLength) {
      break;
    }
    summary += (summary ? ' ' : '') + entry.text;
  }

  return summary;
}

/**
 * Dynamically compresses and prioritizes memory entries based on relevance.
 * @param {Array<{ text, vector}>} memories - List of memory entries with text and embedding vectors.
 * @param {number[]} queryVector - The query vector to compare against.
 * @param {number} maxEntries - Maximum number of entries to retain.
 * @returns {Array<{ text, similarity}>} - A prioritized and compressed list of memory entries.
 */
export function prioritizeMemories(memories, queryVector, maxEntries) {
  if (!Array.isArray(memories) || memories.some(m => typeof m.text !== 'string' || !Array.isArray(m.vector))) {
    throw new Error('Invalid memories format. Expected an array of { text, vector}');
  }

  // Compute similarity scores
  const scoredMemories = memories.map(memory => {
    const similarity = cosineSimilarity(memory.vector, queryVector);
    return { text: memory.text, similarity };
  });

  // Sort by similarity in descending order and limit to maxEntries
  return scoredMemories.sort((a, b) => b.similarity - a.similarity).slice(0, maxEntries);
}

/**
 * Recursively compresses memory by summarizing and prioritizing entries.
 * @param {Array<{ text, vector}>} memories - List of memory entries with text and embedding vectors.
 * @param {number[]} queryVector - The query vector to compare against.
 * @param {number} maxDepth - Maximum recursion depth for summarization.
 * @param {number} maxEntries - Maximum number of entries to retain at each level.
 * @returns {Array<{ text, similarity}>} - A recursively compressed and prioritized memory list.
 */
export function hierarchicalCompression(memories, queryVector, maxDepth, maxEntries) {
  if (maxDepth <= 0 || memories.length <= maxEntries) {
    return prioritizeMemories(memories, queryVector, maxEntries);
  }

  // Prioritize current level
  const prioritized = prioritizeMemories(memories, queryVector, maxEntries);

  // Summarize entries for the next level
  const summarizedText = summarizeEntries(prioritized.map(p => ({ text: p.text, importance: p.similarity })), 1000);
  const summarizedVector = queryVector; // Placeholder: In practice, compute embedding for summarizedText

  // Recurse with summarized data
  return hierarchicalCompression([{ text: summarizedText, vector: summarizedVector }], queryVector, maxDepth - 1, maxEntries);
}
