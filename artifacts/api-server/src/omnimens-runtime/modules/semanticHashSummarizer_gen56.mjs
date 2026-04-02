/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: semanticHashSummarizer
 * Written: 2026-04-02T14:34:43.188Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// semanticHashSummarizer.mjs

import { createHash } from 'crypto';

/**
 * Generate a semantic hash for a given string using SHA-256.
 * @param {string} input - The input string to hash.
 * @returns {string} - A compact hash representation of the input.
 */
export function generateSemanticHash(input) {
  const hash = createHash('sha256');
  hash.update(input);
  return hash.digest('hex');
}

/**
 * Break a large context into smaller segments of a given size.
 * @param {string} context - The large input context to segment.
 * @param {number} segmentSize - The maximum size of each segment.
 * @returns {string[]} - An array of context segments.
 */
export function segmentContext(context, segmentSize = 256) {
  const segments = [];
  for (let i = 0; i < context.length; i += segmentSize) {
    segments.push(context.slice(i, i + segmentSize));
  }
  return segments;
}

/**
 * Assign importance scores to context segments based on length and content density.
 * @param {string[]} segments - The array of context segments.
 * @returns {Array<{ segment, score}>} - Segments with their importance scores.
 */
export function scoreSegments(segments) {
  return segments.map(segment => {
    const contentDensity = segment.replace(/\s+/g, '').length / segment.length;
    const score = contentDensity * segment.length;
    return { segment, score };
  });
}

/**
 * Summarize a large context by hashing its most important segments.
 * @param {string} context - The large input context to summarize.
 * @param {number} segmentSize - The maximum size of each segment.
 * @param {number} topN - The number of top segments to prioritize.
 * @returns {string[]} - An array of semantic hashes for the top segments.
 */
export function summarizeContext(context, segmentSize = 256, topN = 5) {
  const segments = segmentContext(context, segmentSize);
  const scoredSegments = scoreSegments(segments);
  scoredSegments.sort((a, b) => b.score - a.score);
  const topSegments = scoredSegments.slice(0, topN).map(({ segment }) => segment);
  return topSegments.map(generateSemanticHash);
}

/**
 * Combine multiple semantic hashes into a single composite hash.
 * @param {string[]} hashes - An array of semantic hashes.
 * @returns {string} - A composite hash representing the combined input.
 */
export function combineHashes(hashes) {
  const combined = hashes.join('');
  return generateSemanticHash(combined);
}

/**
 * Utility function to compress and hash a context in one step.
 * @param {string} context - The input context to compress and hash.
 * @param {number} segmentSize - The size of each segment for compression.
 * @param {number} topN - The number of top segments to prioritize.
 * @returns {string} - A single composite hash summarizing the context.
 */
export function compressAndHashContext(context, segmentSize = 256, topN = 5) {
  const hashes = summarizeContext(context, segmentSize, topN);
  return combineHashes(hashes);
}