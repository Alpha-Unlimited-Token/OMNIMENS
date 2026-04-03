/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: hierarchical_memory_manager
 * Written: 2026-04-03T06:34:07.186Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// hierarchical_memory_manager.mjs

import { createHash } from 'crypto';

/**
 * Compresses a context window into a smaller representation using hashing.
 * @param {string[]} contextSegments - Array of context strings to compress.
 * @returns {Object[]} - Array of objects containing segment hashes and weights.
 */
export function compressContext(contextSegments) {
  return contextSegments.map(segment => {
    const hash = createHash('sha256').update(segment).digest('hex');
    const weight = calculateWeight(segment);
    return { hash, weight };
  });
}

/**
 * Decompresses and selectively retrieves relevant context segments based on weights.
 * @param {Object[]} compressedContext - Array of objects with segment hashes and weights.
 * @param {Map<string, string>} segmentMap - Map of hashes to original context strings.
 * @param {number} threshold - Minimum weight to include a segment.
 * @returns {string[]} - Array of relevant context strings.
 */
export function decompressContext(compressedContext, segmentMap, threshold) {
  return compressedContext
    .filter(({ weight }) => weight >= threshold)
    .map(({ hash }) => segmentMap.get(hash))
    .filter(Boolean); // Remove undefined entries if hash is missing.
}

/**
 * Calculates a weight for a context segment based on its length and keyword density.
 * @param {string} segment - The context segment to evaluate.
 * @returns {number} - Calculated weight for the segment.
 */
export function calculateWeight(segment) {
  const lengthWeight = Math.min(segment.length / 100, 1); // Normalize length to max 1.
  const keywordDensity = calculateKeywordDensity(segment); // Keywords boost relevance.
  return lengthWeight * 0.7 + keywordDensity * 0.3; // Weighted combination.
}

/**
 * Calculates keyword density as a fraction of total words.
 * @param {string} text - The text to analyze.
 * @returns {number} - Keyword density (0 to 1).
 */
export function calculateKeywordDensity(text) {
  const keywords = ['AI', 'intelligence', 'memory', 'context', 'model']; // Example keywords.
  const words = text.split(/\s+/);
  const keywordCount = words.filter(word => keywords.includes(word)).length;
  return Math.min(keywordCount / words.length, 1); // Normalize to max 1.
}

/**
 * Generates a map of hashes to original context segments.
 * @param {string[]} contextSegments - Array of original context strings.
 * @returns {Map<string, string>} - Map of segment hashes to their original strings.
 */
export function generateHashMap(contextSegments) {
  const map = new Map();
  contextSegments.forEach(segment => {
    const hash = createHash('sha256').update(segment).digest('hex');
    map.set(hash, segment);
  });
  return map;
}

/**
 * Dynamically manages memory by compressing and selectively decompressing context.
 * @param {string[]} contextSegments - Array of context strings to manage.
 * @param {number} threshold - Minimum weight to retain during decompression.
 * @returns {string[]} - Array of relevant context strings after management.
 */
export function manageMemory(contextSegments, threshold) {
  const compressed = compressContext(contextSegments);
  const hashMap = generateHashMap(contextSegments);
  return decompressContext(compressed, hashMap, threshold);
}

// Example Usage (for testing purposes only, remove in production):
// const context = ["AI is evolving rapidly.", "Memory management is crucial.", "Context windows are limited by token size."];
// console.log(manageMemory(context, 0.5));