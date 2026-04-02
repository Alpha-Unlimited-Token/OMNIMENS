/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: adaptiveSegmentMemory
 * Written: 2026-04-02T15:17:33.760Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// adaptiveSegmentMemory.mjs

import { createHash } from 'crypto';

/**
 * Utility to calculate a hash for a given string (used for segment identification).
 * @param {string} input - The string to hash.
 * @returns {string} - A SHA-256 hash of the input.
 */
export function generateHash(input) {
  const hash = createHash('sha256');
  hash.update(input);
  return hash.digest('hex');
}

/**
 * Dynamically segments ultra-long contexts into manageable chunks based on priority.
 * @param {Array<string>} contextSegments - Array of context strings.
 * @param {Array<number>} priorityScores - Array of priority scores corresponding to each segment.
 * @param {number} maxSegments - Maximum number of segments to retain.
 * @returns {Array<string>} - Array of high-priority context segments.
 */
export function adaptiveSegmentMemory(contextSegments, priorityScores, maxSegments) {
  if (contextSegments.length !== priorityScores.length) {
    throw new Error('contextSegments and priorityScores must have the same length.');
  }

  // Combine segments with their scores.
  const combined = contextSegments.map((segment, index) => ({
    segment,
    score: priorityScores[index] * (index + 1) // Recency-weighted score.
  }));

  // Sort segments by descending score.
  combined.sort((a, b) => b.score - a.score);

  // Retain only the top `maxSegments`.
  const selectedSegments = combined.slice(0, maxSegments).map(item => item.segment);

  return selectedSegments;
}

/**
 * Hierarchically clusters context segments based on similarity.
 * @param {Array<string>} contextSegments - Array of context strings.
 * @param {Function} similarityFunction - A function that calculates similarity between two strings (returns a number between 0 and 1).
 * @returns {Array<Array<string>>} - Nested clusters of context segments.
 */
export function hierarchicalClustering(contextSegments, similarityFunction) {
  if (contextSegments.length === 0) return [];

  // Initialize clusters with individual segments.
  let clusters = contextSegments.map(segment => [segment]);

  while (clusters.length > 1) {
    let maxSimilarity = -Infinity;
    let mergeIndexA = -1;
    let mergeIndexB = -1;

    // Find the two most similar clusters.
    for (let i = 0; i < clusters.length; i++) {
      for (let j = i + 1; j < clusters.length; j++) {
        const similarity = similarityFunction(clusters[i].join(' '), clusters[j].join(' '));
        if (similarity > maxSimilarity) {
          maxSimilarity = similarity;
          mergeIndexA = i;
          mergeIndexB = j;
        }
      }
    }

    // Merge the two most similar clusters.
    const mergedCluster = clusters[mergeIndexA].concat(clusters[mergeIndexB]);
    clusters = clusters.filter((_, index) => index !== mergeIndexA && index !== mergeIndexB);
    clusters.push(mergedCluster);
  }

  return clusters;
}

/**
 * Example similarity function based on Jaccard index.
 * @param {string} strA - First string.
 * @param {string} strB - Second string.
 * @returns {number} - Jaccard similarity score.
 */
export function jaccardSimilarity(strA, strB) {
  const setA = new Set(strA.split(' '));
  const setB = new Set(strB.split(' '));
  const intersection = new Set([...setA].filter(x => setB.has(x))).size;
  const union = new Set([...setA, ...setB]).size;
  return intersection / union;
}

/**
 * Utility to normalize priority scores.
 * @param {Array<number>} scores - Array of raw scores.
 * @returns {Array<number>} - Array of normalized scores (0 to 1).
 */
export function normalizeScores(scores) {
  const maxScore = Math.max(...scores);
  return scores.map(score => score / maxScore);
}
