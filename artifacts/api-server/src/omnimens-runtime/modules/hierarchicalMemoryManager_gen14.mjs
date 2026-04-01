/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: hierarchicalMemoryManager
 * Written: 2026-04-01T22:14:23.276Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// hierarchicalMemoryManager.mjs

import { createHash } from 'crypto';

/**
 * Generates a hash for a given input string to uniquely identify clusters.
 * @param {string} input - The string to hash.
 * @returns {string} - A unique hash for the input.
 */
export function generateHash(input) {
  const hash = createHash('sha256');
  hash.update(input);
  return hash.digest('hex');
}

/**
 * Computes the cosine similarity between two vectors.
 * @param {number[]} vecA - The first vector.
 * @param {number[]} vecB - The second vector.
 * @returns {number} - The cosine similarity between vecA and vecB.
 */
export function cosineSimilarity(vecA, vecB) {
  const dotProduct = vecA.reduce((sum, val, i) => sum + val * vecB[i], 0);
  const magnitudeA = Math.sqrt(vecA.reduce((sum, val) => sum + val ** 2, 0));
  const magnitudeB = Math.sqrt(vecB.reduce((sum, val) => sum + val ** 2, 0));
  return magnitudeA && magnitudeB ? dotProduct / (magnitudeA * magnitudeB) : 0;
}

/**
 * Clusters input vectors into groups based on similarity.
 * @param {Array<{ id, vector}>} items - Items with unique IDs and embedding vectors.
 * @param {number} threshold - Similarity threshold for clustering (0 to 1).
 * @returns {Object[]} - Array of clusters with grouped items.
 */
export function clusterVectors(items, threshold = 0.8) {
  const clusters = [];

  for (const item of items) {
    let addedToCluster = false;

    for (const cluster of clusters) {
      const similarities = cluster.items.map(clusterItem => cosineSimilarity(item.vector, clusterItem.vector));
      const avgSimilarity = similarities.reduce((sum, sim) => sum + sim, 0) / similarities.length;

      if (avgSimilarity >= threshold) {
        cluster.items.push(item);
        addedToCluster = true;
        break;
      }
    }

    if (!addedToCluster) {
      clusters.push({ id: generateHash(JSON.stringify(item)), items: [item] });
    }
  }

  return clusters;
}

/**
 * Summarizes a cluster by averaging its vectors and returning a high-level abstraction.
 * @param {Object} cluster - A cluster containing items with vectors.
 * @returns {Object} - A summary object with the centroid vector and item references.
 */
export function summarizeCluster(cluster) {
  const centroid = cluster.items[0].vector.map((_, i) => {
    return cluster.items.reduce((sum, item) => sum + item.vector[i], 0) / cluster.items.length;
  });

  return {
    clusterId: cluster.id,
    centroid,
    items: cluster.items.map(item => item.id)
  };
}

/**
 * Compresses long-term context by clustering and summarizing vectors.
 * @param {Array<{ id, vector}>} items - Items with unique IDs and embedding vectors.
 * @param {number} threshold - Similarity threshold for clustering (0 to 1).
 * @returns {Object[]} - Array of summarized clusters.
 */
export function compressContext(items, threshold = 0.8) {
  const clusters = clusterVectors(items, threshold);
  return clusters.map(summarizeCluster);
}

/**
 * Retrieves the most relevant cluster for a given query vector.
 * @param {Object[]} summaries - Summarized clusters.
 * @param {number[]} queryVector - The query vector.
 * @returns {Object|null} - The most relevant cluster summary or null if no clusters exist.
 */
export function retrieveRelevantCluster(summaries, queryVector) {
  if (summaries.length === 0) return null;

  let bestMatch = null;
  let highestSimilarity = -Infinity;

  for (const summary of summaries) {
    const similarity = cosineSimilarity(summary.centroid, queryVector);
    if (similarity > highestSimilarity) {
      highestSimilarity = similarity;
      bestMatch = summary;
    }
  }

  return bestMatch;
}

/**
 * Utility function to normalize a vector.
 * @param {number[]} vector - The vector to normalize.
 * @returns {number[]} - The normalized vector.
 */
export function normalizeVector(vector) {
  const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val ** 2, 0));
  return magnitude ? vector.map(val => val / magnitude) : vector;
}