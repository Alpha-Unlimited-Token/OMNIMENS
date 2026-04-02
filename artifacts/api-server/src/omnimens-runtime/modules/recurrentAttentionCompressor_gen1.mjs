/**
 * OMNIMENS Self-Authored Module (Migrated from DB)
 * Original Source: evolution_cycle_26
 * Name: recurrentAttentionCompressor
 * Purpose: Improves token window management by selectively re-expanding compressed segments during reasoning.
 * Description: Implements a recurrent attention mechanism to manage compressed token windows and dynamically restore relevant context for reasoning tasks.
 * Migrated: 2026-04-02T15:02:53.824Z
 */

// recurrentAttentionCompressor.mjs

import { createHash } from 'crypto';

/**
 * Compresses a segment into a hashed representation for efficient storage.
 * @param {string} segment - The text segment to compress.
 * @returns {string} - The hashed representation of the segment.
 */
export function compressSegment(segment) {
  const hash = createHash('sha256');
  hash.update(segment);
  return hash.digest('hex');
}

/**
 * Restores a compressed segment by querying a context map.
 * @param {string} hash - The hash of the compressed segment.
 * @param {Map<string, string>} contextMap - A map of hash to original segment.
 * @returns {string|null} - The restored segment or null if not found.
 */
export function restoreSegment(hash, contextMap) {
  return contextMap.get(hash) || null;
}

/**
 * Iteratively queries compressed segments and dynamically restores relevant context.
 * @param {Array<string>} queryTokens - Tokens to guide the attention mechanism.
 * @param {Map<string, string>} contextMap - A map of hash to original segment.
 * @param {Array<string>} compressedSegments - Array of compressed segment hashes.
 * @param {number} maxIterations - Maximum number of iterations for querying.
 * @returns {Array<string>} - Array of restored segments relevant to the query.
 */
export function recurrentAttention(queryTokens, contextMap, compressedSegments, maxIterations = 5) {
  const restoredSegments = [];
  const relevanceScores = new Map();

  for (let iteration = 0; iteration < maxIterations; iteration++) {
    for (const hash of compressedSegments) {
      const segment = restoreSegment(hash, contextMap);
      if (segment) {
        const relevance = calculateRelevance(queryTokens, segment);
        relevanceScores.set(hash, relevance);
      }
    }

    const mostRelevantHashes = Array.from(relevanceScores.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, queryTokens.length)
      .map(([hash]) => hash);

    for (const hash of mostRelevantHashes) {
      const segment = restoreSegment(hash, contextMap);
      if (segment && !restoredSegments.includes(segment)) {
        restoredSegments.push(segment);
      }
    }
  }

  return restoredSegments;
}

/**
 * Calculates relevance of a segment to a set of query tokens.
 * @param {Array<string>} queryTokens - Tokens to guide the attention mechanism.
 * @param {string} segment - The text segment to evaluate relevance.
 * @returns {number} - A numerical relevance score.
 */
export function calculateRelevance(queryTokens, segment) {
  const segmentTokens = segment.split(/\s+/);
  let score = 0;

  for (const token of queryTokens) {
    score += segmentTokens.filter(segToken => segToken.includes(token)).length;
  }

  return score;
}

/**
 * Builds a context map from an array of segments.
 * @param {Array<string>} segments - Array of original text segments.
 * @returns {Map<string, string>} - A map of hash to original segment.
 */
export function buildContextMap(segments) {
  const contextMap = new Map();

  for (const segment of segments) {
    const hash = compressSegment(segment);
    contextMap.set(hash, segment);
  }

  return contextMap;
}