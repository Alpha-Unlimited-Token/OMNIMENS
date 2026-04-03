/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: semanticAwareContextManager
 * Written: 2026-04-03T02:37:08.264Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// semanticAwareContextManager.mjs

import { createHash } from 'crypto';

/**
 * Compute semantic importance scores for a set of text segments using a simple hashing-based embedding proxy.
 * @param {string[]} segments - Array of text segments to score.
 * @returns {number[]} - Array of semantic importance scores.
 */
export function computeSemanticScores(segments) {
  return segments.map(segment => {
    const hash = createHash('sha256').update(segment).digest('hex');
    return Array.from(hash).reduce((sum, char) => sum + parseInt(char, 16), 0) / hash.length;
  });
}

/**
 * Compress a large context into a smaller token window while preserving semantic importance.
 * @param {string[]} segments - Array of text segments to compress.
 * @param {number} targetSize - Target number of segments to retain.
 * @returns {string[]} - Array of retained segments.
 */
export function compressContext(segments, targetSize) {
  if (targetSize >= segments.length) return segments;

  const scores = computeSemanticScores(segments);
  const indexedScores = segments.map((segment, index) => ({ segment, score: scores[index] }));

  indexedScores.sort((a, b) => b.score - a.score); // Sort by descending score

  return indexedScores.slice(0, targetSize).sort((a, b) => segments.indexOf(a.segment) - segments.indexOf(b.segment))
    .map(item => item.segment); // Retain original order
}

/**
 * Partition a large context into hierarchical levels for better preservation of semantic structure.
 * @param {string[]} segments - Array of text segments to partition.
 * @param {number} levels - Number of hierarchical levels to create.
 * @returns {string[][]} - Array of hierarchical levels, each containing an array of segments.
 */
export function partitionContext(segments, levels) {
  if (levels <= 1) return [segments];

  const scores = computeSemanticScores(segments);
  const indexedScores = segments.map((segment, index) => ({ segment, score: scores[index] }));

  indexedScores.sort((a, b) => b.score - a.score); // Sort by descending score

  const partitions = Array.from({ length: levels }, () => []);
  indexedScores.forEach((item, index) => {
    partitions[index % levels].push(item.segment);
  });

  return partitions.map(partition => partition.sort((a, b) => segments.indexOf(a) - segments.indexOf(b))); // Retain original order
}

/**
 * Utility function to compute a hash-based unique identifier for a given text segment.
 * @param {string} segment - Text segment to hash.
 * @returns {string} - Unique hash identifier.
 */
export function generateSegmentHash(segment) {
  return createHash('sha256').update(segment).digest('hex');
}

/**
 * Utility function to normalize text segments by trimming and collapsing whitespace.
 * @param {string[]} segments - Array of text segments to normalize.
 * @returns {string[]} - Array of normalized text segments.
 */
export function normalizeSegments(segments) {
  return segments.map(segment => segment.trim().replace(/\s+/g, ' '));
}