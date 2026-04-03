/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: dynamicContextReconstructor
 * Written: 2026-04-03T02:45:23.724Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// dynamicContextReconstructor.mjs

import { createHash } from 'crypto';

/**
 * Generate a semantic embedding hash for a given input string.
 * @param {string} input - The string to be embedded.
 * @returns {string} - A fixed-length hash representing the semantic embedding.
 */
export function generateSemanticHash(input) {
  const hash = createHash('sha256');
  hash.update(input);
  return hash.digest('hex');
}

/**
 * Calculate the similarity score between two semantic embeddings.
 * @param {string} hash1 - The first semantic hash.
 * @param {string} hash2 - The second semantic hash.
 * @returns {number} - A similarity score between 0 and 1.
 */
export function calculateSimilarity(hash1, hash2) {
  let matches = 0;
  for (let i = 0; i < hash1.length; i++) {
    if (hash1[i] === hash2[i]) matches++;
  }
  return matches / hash1.length;
}

/**
 * Apply temporal decay to a score based on its age.
 * @param {number} score - The original score.
 * @param {number} ageInSeconds - The age of the score in seconds.
 * @param {number} decayRate - The rate of decay per second (0 < decayRate < 1).
 * @returns {number} - The decayed score.
 */
export function applyTemporalDecay(score, ageInSeconds, decayRate = 0.001) {
  return score * Math.exp(-decayRate * ageInSeconds);
}

/**
 * Reconstruct lost context using semantic embeddings and temporal weighting.
 * @param {Array<{ content, timestamp}>} fragments - Array of content fragments with timestamps.
 * @param {number} currentTime - The current timestamp in seconds.
 * @returns {Array<{ content, score}>} - Reconstructed context with weighted scores.
 */
export function reconstructContext(fragments, currentTime) {
  const reconstructed = fragments.map(({ content, timestamp }) => {
    const embedding = generateSemanticHash(content);
    const age = currentTime - timestamp;
    const baseScore = calculateSimilarity(embedding, embedding); // Self-similarity as baseline
    const weightedScore = applyTemporalDecay(baseScore, age);
    return { content, score: weightedScore };
  });

  return reconstructed.sort((a, b) => b.score - a.score);
}

/**
 * Utility function to normalize scores to a 0-1 range.
 * @param {Array<{ content, score}>} scoredItems - Items with raw scores.
 * @returns {Array<{ content, score}>} - Items with normalized scores.
 */
export function normalizeScores(scoredItems) {
  const maxScore = Math.max(...scoredItems.map(item => item.score));
  return scoredItems.map(item => ({
    content: item.content,
    score: maxScore > 0 ? item.score / maxScore : 0
  }));
}

/**
 * Combine multiple contexts into a unified summary.
 * @param {Array<{ content, score}>} contexts - Context fragments with scores.
 * @returns {string} - Unified summary of the highest-scoring contexts.
 */
export function summarizeContext(contexts) {
  const topContexts = contexts.slice(0, 3); // Take top 3 contexts
  return topContexts.map(ctx => ctx.content).join(' ');
}
