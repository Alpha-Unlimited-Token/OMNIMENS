/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: hierarchicalContextManager
 * Written: 2026-04-01T22:00:26.820Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// hierarchicalContextManager.mjs

import { createHash } from 'crypto';

/**
 * Generates a unique hash for a given string to use as a cache key.
 * @param {string} input - The input string to hash.
 * @returns {string} - A unique hash string.
 */
export function generateHash(input) {
  return createHash('sha256').update(input).digest('hex');
}

/**
 * Segments a large context into smaller chunks based on a specified token limit.
 * @param {string} context - The full context string to segment.
 * @param {number} tokenLimit - The maximum tokens per segment.
 * @returns {string[]} - An array of segmented context strings.
 */
export function segmentContext(context, tokenLimit) {
  const words = context.split(' ');
  const segments = [];
  let currentSegment = [];
  let currentTokenCount = 0;

  for (const word of words) {
    const wordTokenCount = word.length; // Simplified token count approximation
    if (currentTokenCount + wordTokenCount > tokenLimit) {
      segments.push(currentSegment.join(' '));
      currentSegment = [];
      currentTokenCount = 0;
    }
    currentSegment.push(word);
    currentTokenCount += wordTokenCount;
  }

  if (currentSegment.length > 0) {
    segments.push(currentSegment.join(' '));
  }

  return segments;
}

/**
 * Prioritizes context segments based on relevance scores.
 * @param {Array<{ segment, relevance}>} segments - Array of context segments with relevance scores.
 * @param {number} maxSegments - Maximum number of segments to retain.
 * @returns {string[]} - Array of the most relevant context segments.
 */
export function prioritizeSegments(segments, maxSegments) {
  return segments
    .sort((a, b) => b.relevance - a.relevance) // Sort by relevance descending
    .slice(0, maxSegments) // Retain top N segments
    .map(segmentObj => segmentObj.segment); // Extract the segment strings
}

/**
 * Caches context segments hierarchically with a unique key for each segment.
 * @param {string[]} segments - Array of context segments to cache.
 * @returns {Map<string, string>} - A map of hash keys to context segments.
 */
export function cacheSegments(segments) {
  const cache = new Map();
  for (const segment of segments) {
    const key = generateHash(segment);
    cache.set(key, segment);
  }
  return cache;
}

/**
 * Main function to manage hierarchical context.
 * @param {string} context - The full context string.
 * @param {number} tokenLimit - Maximum tokens per segment.
 * @param {number} maxSegments - Maximum number of segments to retain.
 * @param {Function} relevanceFunction - Function to calculate relevance of a segment.
 * @returns {Map<string, string>} - Cached map of prioritized context segments.
 */
export function hierarchicalContextManager(context, tokenLimit, maxSegments, relevanceFunction) {
  const segments = segmentContext(context, tokenLimit);
  const scoredSegments = segments.map(segment => ({
    segment,
    relevance: relevanceFunction(segment)
  }));
  const prioritized = prioritizeSegments(scoredSegments, maxSegments);
  return cacheSegments(prioritized);
}

/**
 * Example relevance function based on segment length (can be replaced with more complex logic).
 * @param {string} segment - The context segment to evaluate.
 * @returns {number} - Relevance score.
 */
export function exampleRelevanceFunction(segment) {
  return segment.length; // Simple heuristic: longer segments are more relevant
}