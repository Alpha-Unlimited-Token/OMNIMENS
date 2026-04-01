/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: adaptiveContextCompressor
 * Written: 2026-04-01T22:03:02.151Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// adaptiveContextCompressor.mjs

import { createHash } from 'crypto';

/**
 * Hashes a string to create a unique identifier for deduplication.
 * @param {string} input - The string to hash.
 * @returns {string} - A unique hash of the input.
 */
export function hashString(input) {
  return createHash('sha256').update(input).digest('hex');
}

/**
 * Groups similar text segments using a basic similarity threshold.
 * @param {string[]} segments - Array of text segments to cluster.
 * @param {number} similarityThreshold - Threshold for clustering (0 to 1).
 * @returns {string[][]} - Array of clusters, each containing similar text segments.
 */
export function clusterSegments(segments, similarityThreshold = 0.7) {
  const clusters = [];

  function calculateSimilarity(a, b) {
    const setA = new Set(a.split(/\s+/));
    const setB = new Set(b.split(/\s+/));
    const intersection = new Set([...setA].filter(word => setB.has(word)));
    return intersection.size / Math.max(setA.size, setB.size);
  }

  for (const segment of segments) {
    let addedToCluster = false;
    for (const cluster of clusters) {
      if (calculateSimilarity(segment, cluster[0]) >= similarityThreshold) {
        cluster.push(segment);
        addedToCluster = true;
        break;
      }
    }
    if (!addedToCluster) {
      clusters.push([segment]);
    }
  }

  return clusters;
}

/**
 * Summarizes a cluster of text segments into a single representative text.
 * @param {string[]} cluster - Array of similar text segments.
 * @returns {string} - A summarized version of the cluster.
 */
export function summarizeCluster(cluster) {
  const wordFrequency = {};

  for (const segment of cluster) {
    for (const word of segment.split(/\s+/)) {
      const normalizedWord = word.toLowerCase();
      wordFrequency[normalizedWord] = (wordFrequency[normalizedWord] || 0) + 1;
    }
  }

  const sortedWords = Object.entries(wordFrequency)
    .sort(([, freqA], [, freqB]) => freqB - freqA)
    .map(([word]) => word);

  return sortedWords.slice(0, 10).join(' ');
}

/**
 * Compresses and summarizes a large context into a smaller, more concise version.
 * @param {string[]} context - Array of text segments representing the context.
 * @param {number} similarityThreshold - Threshold for clustering (0 to 1).
 * @returns {string[]} - Array of summarized text segments.
 */
export function compressContext(context, similarityThreshold = 0.7) {
  const clusters = clusterSegments(context, similarityThreshold);
  return clusters.map(cluster => summarizeCluster(cluster));
}

/**
 * Removes duplicate text segments from the context.
 * @param {string[]} context - Array of text segments.
 * @returns {string[]} - Array of unique text segments.
 */
export function deduplicateContext(context) {
  const seenHashes = new Set();
  const uniqueSegments = [];

  for (const segment of context) {
    const hash = hashString(segment);
    if (!seenHashes.has(hash)) {
      seenHashes.add(hash);
      uniqueSegments.push(segment);
    }
  }

  return uniqueSegments;
}

/**
 * Adaptive context compression pipeline.
 * @param {string[]} context - Array of text segments representing the context.
 * @param {number} similarityThreshold - Threshold for clustering (0 to 1).
 * @returns {string[]} - Compressed and deduplicated context.
 */
export function adaptiveContextCompressor(context, similarityThreshold = 0.7) {
  const deduplicatedContext = deduplicateContext(context);
  return compressContext(deduplicatedContext, similarityThreshold);
}