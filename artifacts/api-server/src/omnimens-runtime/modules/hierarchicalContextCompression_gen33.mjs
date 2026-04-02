/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: hierarchicalContextCompression
 * Written: 2026-04-02T15:07:32.990Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// hierarchicalContextCompression.mjs

import { createHash } from 'crypto';

/**
 * Generates a hash for a given string to uniquely identify segments.
 * @param {string} input - The string to hash.
 * @returns {string} - A unique hash of the input.
 */
export function generateHash(input) {
  return createHash('sha256').update(input).digest('hex');
}

/**
 * Splits a long text into manageable chunks of a specified size.
 * @param {string} text - The input text to split.
 * @param {number} chunkSize - The maximum size of each chunk.
 * @returns {string[]} - An array of text chunks.
 */
export function splitIntoChunks(text, chunkSize) {
  const chunks = [];
  for (let i = 0; i < text.length; i += chunkSize) {
    chunks.push(text.slice(i, i + chunkSize));
  }
  return chunks;
}

/**
 * Calculates semantic similarity between two text segments using a simple token overlap metric.
 * @param {string} textA - The first text segment.
 * @param {string} textB - The second text segment.
 * @returns {number} - A similarity score between 0 and 1.
 */
export function calculateSimilarity(textA, textB) {
  const tokensA = new Set(textA.split(/\s+/));
  const tokensB = new Set(textB.split(/\s+/));
  const intersection = new Set([...tokensA].filter(token => tokensB.has(token)));
  const union = new Set([...tokensA, ...tokensB]);
  return intersection.size / union.size;
}

/**
 * Clusters text segments based on semantic similarity.
 * @param {string[]} segments - An array of text segments.
 * @param {number} similarityThreshold - The minimum similarity score to cluster segments together.
 * @returns {string[][]} - An array of clusters, where each cluster is an array of related text segments.
 */
export function clusterSegments(segments, similarityThreshold) {
  const clusters = [];

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
 * Summarizes a cluster of text segments by extracting the most representative segment.
 * @param {string[]} cluster - An array of related text segments.
 * @returns {string} - A representative summary of the cluster.
 */
export function summarizeCluster(cluster) {
  if (cluster.length === 1) return cluster[0];

  let bestSegment = cluster[0];
  let bestScore = 0;

  for (const segment of cluster) {
    const score = cluster.reduce((sum, other) => sum + calculateSimilarity(segment, other), 0);
    if (score > bestScore) {
      bestScore = score;
      bestSegment = segment;
    }
  }

  return bestSegment;
}

/**
 * Compresses a long context into a hierarchical summary while preserving semantic fidelity.
 * @param {string} text - The input text to compress.
 * @param {number} chunkSize - The maximum size of each chunk.
 * @param {number} similarityThreshold - The minimum similarity score to cluster segments together.
 * @returns {string[]} - A hierarchical summary of the text.
 */
export function hierarchicalContextCompression(text, chunkSize = 512, similarityThreshold = 0.5) {
  const chunks = splitIntoChunks(text, chunkSize);
  let clusters = clusterSegments(chunks, similarityThreshold);

  while (clusters.length > 1) {
    clusters = clusters.map(cluster => summarizeCluster(cluster));
    clusters = clusterSegments(clusters, similarityThreshold);
  }

  return clusters.map(cluster => summarizeCluster(cluster));
}

/**
 * Utility function for multi-agent systems to retrieve compressed summaries.
 * @param {string} text - The input text.
 * @param {number} chunkSize - The maximum size of each chunk.
 * @param {number} similarityThreshold - The similarity threshold for clustering.
 * @returns {string[]} - Compressed summaries for multi-agent use.
 */
export function getCompressedSummaries(text, chunkSize = 512, similarityThreshold = 0.5) {
  return hierarchicalContextCompression(text, chunkSize, similarityThreshold);
}
