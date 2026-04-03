/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: dynamicContextManager
 * Written: 2026-04-03T12:24:11.856Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// dynamicContextManager.mjs

import { createHash } from 'crypto';

/**
 * Splits a long input into manageable segments using a sliding window with overlap.
 * @param {string} input - The long input string to segment.
 * @param {number} windowSize - The size of each segment.
 * @param {number} overlapSize - The overlap size between consecutive segments.
 * @returns {Array<string>} - Array of segmented strings.
 */
export function segmentInput(input, windowSize, overlapSize) {
  if (windowSize <= 0 || overlapSize < 0 || overlapSize >= windowSize) {
    throw new Error("Invalid windowSize or overlapSize parameters.");
  }

  const segments = [];
  for (let i = 0; i < input.length; i += windowSize - overlapSize) {
    segments.push(input.slice(i, i + windowSize));
  }
  return segments;
}

/**
 * Scores segments based on relevance using a simple hash-based heuristic.
 * @param {Array<string>} segments - Array of segments to score.
 * @param {string} query - Query string to determine relevance.
 * @returns {Array<{ segment, score}>} - Array of segments with their relevance scores.
 */
export function scoreSegments(segments, query) {
  const queryHash = createHash('sha256').update(query).digest('hex');

  return segments.map(segment => {
    const segmentHash = createHash('sha256').update(segment).digest('hex');
    let score = 0;

    // Simple relevance heuristic: count matching characters in hashed values.
    for (let i = 0; i < Math.min(queryHash.length, segmentHash.length); i++) {
      if (queryHash[i] === segmentHash[i]) {
        score++;
      }
    }

    return { segment, score };
  }).sort((a, b) => b.score - a.score); // Sort by descending score.
}

/**
 * Combines the highest-scoring segments into a single prioritized context.
 * @param {Array<{ segment, score}>} scoredSegments - Scored segments.
 * @param {number} maxTokens - Maximum combined token length for the context.
 * @returns {string} - Combined context string.
 */
export function combineSegments(scoredSegments, maxTokens) {
  let combinedContext = '';
  for (const { segment } of scoredSegments) {
    if (combinedContext.length + segment.length > maxTokens) break;
    combinedContext += segment;
  }
  return combinedContext;
}

/**
 * Main utility to process long inputs dynamically and return prioritized context.
 * @param {string} input - Long input string to process.
 * @param {string} query - Query string to prioritize relevance.
 * @param {number} windowSize - Size of each segment.
 * @param {number} overlapSize - Overlap size between segments.
 * @param {number} maxTokens - Maximum token length for the final context.
 * @returns {string} - Final prioritized context string.
 */
export function dynamicContextManager(input, query, windowSize, overlapSize, maxTokens) {
  const segments = segmentInput(input, windowSize, overlapSize);
  const scoredSegments = scoreSegments(segments, query);
  return combineSegments(scoredSegments, maxTokens);
}

/**
 * Utility function to count tokens in a string (approximation based on word count).
 * @param {string} text - Input text.
 * @returns {number} - Approximate token count.
 */
export function countTokens(text) {
  return text.split(/\s+/).length;
}
