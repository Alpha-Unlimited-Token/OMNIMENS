/**
 * OMNIMENS Self-Authored Module (Migrated from DB)
 * Original Source: evolution_cycle_3
 * Name: hierarchicalContextAttention
 * Purpose: Enables dynamic re-expansion of compressed context segments during reasoning for improved coherence.
 * Description: Enables dynamic re-expansion and hierarchical organization of compressed context segments for improved reasoning coherence.
 * Migrated: 2026-04-03T04:58:03.728Z
 */

// hierarchicalContextAttention.mjs

import { createHash } from 'crypto';

/**
 * Hashes a given context segment to create a unique identifier.
 * Useful for tracking and referencing compressed segments.
 * @param {string} segment - The context segment to hash.
 * @returns {string} - A unique hash for the segment.
 */
export function hashSegment(segment) {
  const hash = createHash('sha256');
  hash.update(segment);
  return hash.digest('hex');
}

/**
 * Scores relevance of a context segment based on a query.
 * Uses a simple keyword matching algorithm for scoring.
 * @param {string} segment - The context segment to score.
 * @param {string} query - The query to compare against.
 * @returns {number} - Relevance score (higher is better).
 */
export function scoreRelevance(segment, query) {
  const segmentWords = segment.toLowerCase().split(/\W+/);
  const queryWords = query.toLowerCase().split(/\W+/);
  const matches = queryWords.filter(word => segmentWords.includes(word));
  return matches.length / queryWords.length;
}

/**
 * Dynamically re-expands compressed context segments based on relevance.
 * @param {Array<{ hash: string, segment: string }>} compressedSegments - Array of compressed context segments.
 * @param {string} query - The query to guide re-expansion.
 * @param {number} threshold - Minimum relevance score to include a segment.
 * @returns {Array<string>} - Array of re-expanded context segments.
 */
export function reExpandContext(compressedSegments, query, threshold = 0.1) {
  return compressedSegments
    .map(({ hash, segment }) => ({ hash, segment, score: scoreRelevance(segment, query) }))
    .filter(({ score }) => score >= threshold)
    .sort((a, b) => b.score - a.score)
    .map(({ segment }) => segment);
}

/**
 * Combines multiple context segments into a hierarchical structure.
 * Useful for organizing large amounts of information.
 * @param {Array<string>} segments - Array of context segments.
 * @param {number} maxGroupSize - Maximum number of segments per group.
 * @returns {Array<Array<string>>} - Hierarchical grouping of segments.
 */
export function createHierarchy(segments, maxGroupSize = 5) {
  const hierarchy = [];
  for (let i = 0; i < segments.length; i += maxGroupSize) {
    hierarchy.push(segments.slice(i, i + maxGroupSize));
  }
  return hierarchy;
}

/**
 * Re-weights hierarchical context groups based on relevance scores.
 * @param {Array<Array<string>>} hierarchy - Hierarchical context groups.
 * @param {string} query - The query to guide re-weighting.
 * @returns {Array<{ group: Array<string>, weight: number }>} - Weighted groups.
 */
export function reWeightHierarchy(hierarchy, query) {
  return hierarchy.map(group => {
    const totalScore = group.reduce((sum, segment) => sum + scoreRelevance(segment, query), 0);
    return { group, weight: totalScore / group.length };
  }).sort((a, b) => b.weight - a.weight);
}

/**
 * Main utility function to process and expand context dynamically.
 * @param {Array<string>} rawSegments - Raw context segments.
 * @param {string} query - Query to guide processing.
 * @param {number} threshold - Minimum relevance score for inclusion.
 * @param {number} maxGroupSize - Maximum number of segments per group.
 * @returns {Array<{ group: Array<string>, weight: number }>} - Final weighted hierarchy.
 */
export function processContext(rawSegments, query, threshold = 0.1, maxGroupSize = 5) {
  const compressedSegments = rawSegments.map(segment => ({ hash: hashSegment(segment), segment }));
  const reExpanded = reExpandContext(compressedSegments, query, threshold);
  const hierarchy = createHierarchy(reExpanded, maxGroupSize);
  return reWeightHierarchy(hierarchy, query);
}
