/**
 * OMNIMENS Self-Authored Module (Migrated from DB)
 * Original Source: evolution_cycle_4
 * Name: streamingContextManager
 * Purpose: Processes continuous data streams with incremental summarization and semantic preservation.
 * Description: Processes continuous data streams with sliding window summarization and hierarchical attention, preserving semantic context for multi-agent utility.
 * Migrated: 2026-04-02T21:43:58.503Z
 */

// streamingContextManager.mjs

import { createHash } from 'crypto';

/**
 * Utility to hash strings for efficient comparisons.
 * @param {string} input - The input string to hash.
 * @returns {string} - A SHA-256 hash of the input.
 */
export function hashString(input) {
  const hash = createHash('sha256');
  hash.update(input);
  return hash.digest('hex');
}

/**
 * Sliding window summarization with hierarchical attention.
 * @param {Array} dataStream - Continuous data stream (array of strings).
 * @param {number} windowSize - Size of the sliding window.
 * @param {number} attentionThreshold - Minimum attention score to preserve context.
 * @returns {Array} - Summarized data with semantic preservation.
 */
export function summarizeStream(dataStream, windowSize = 5, attentionThreshold = 0.5) {
  const summarizedData = [];

  for (let i = 0; i < dataStream.length; i += windowSize) {
    const window = dataStream.slice(i, i + windowSize);
    const attentionScores = calculateAttentionScores(window);
    const filteredWindow = window.filter((_, idx) => attentionScores[idx] >= attentionThreshold);
    summarizedData.push(...filteredWindow);
  }

  return summarizedData;
}

/**
 * Calculates hierarchical attention scores for a given data window.
 * @param {Array} window - Array of strings within the sliding window.
 * @returns {Array} - Attention scores corresponding to each element in the window.
 */
export function calculateAttentionScores(window) {
  const scores = [];

  for (const item of window) {
    const lengthScore = Math.min(item.length / 100, 1); // Longer items get higher scores.
    const uniquenessScore = calculateUniqueness(item, window);
    const totalScore = (lengthScore + uniquenessScore) / 2; // Hierarchical aggregation.
    scores.push(totalScore);
  }

  return scores;
}

/**
 * Calculates uniqueness score of an item within its context.
 * @param {string} item - The item to evaluate.
 * @param {Array} context - The context array.
 * @returns {number} - Uniqueness score (0 to 1).
 */
export function calculateUniqueness(item, context) {
  const itemHash = hashString(item);
  const contextHashes = context.map(hashString);
  const uniqueCount = contextHashes.filter(hash => hash === itemHash).length;
  return uniqueCount === 1 ? 1 : Math.max(0, 1 - uniqueCount / context.length); // Penalize duplicates.
}

/**
 * Utility to split large data streams into manageable chunks.
 * @param {Array} dataStream - Continuous data stream (array of strings).
 * @param {number} chunkSize - Size of each chunk.
 * @returns {Array} - Array of chunks.
 */
export function chunkDataStream(dataStream, chunkSize) {
  const chunks = [];

  for (let i = 0; i < dataStream.length; i += chunkSize) {
    chunks.push(dataStream.slice(i, i + chunkSize));
  }

  return chunks;
}

/**
 * Utility to merge multiple summarized streams into a single coherent summary.
 * @param {Array} summarizedStreams - Array of summarized data streams.
 * @returns {Array} - Merged and deduplicated summary.
 */
export function mergeSummaries(summarizedStreams) {
  const merged = new Set();

  for (const stream of summarizedStreams) {
    for (const item of stream) {
      merged.add(item); // Deduplication via Set.
    }
  }

  return Array.from(merged);
}
