/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: hierarchicalContextCompressor
 * Written: 2026-04-02T14:19:05.832Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// hierarchicalContextCompressor.mjs

import { createHash } from 'crypto';

/**
 * Generate a hash-based unique identifier for a vector to enable clustering.
 * @param {Array<number>} vector - Input vector.
 * @returns {string} - Hash string representing the vector.
 */
export function hashVector(vector) {
  const hash = createHash('sha256');
  hash.update(vector.map(v => v.toFixed(6)).join(','));
  return hash.digest('hex');
}

/**
 * Calculate the Euclidean distance between two vectors.
 * @param {Array<number>} vec1 - First vector.
 * @param {Array<number>} vec2 - Second vector.
 * @returns {number} - Euclidean distance.
 */
export function euclideanDistance(vec1, vec2) {
  if (vec1.length !== vec2.length) {
    throw new Error('Vectors must have the same dimensions.');
  }
  return Math.sqrt(vec1.reduce((sum, val, i) => sum + Math.pow(val - vec2[i], 2), 0));
}

/**
 * Perform hierarchical vector quantization to cluster embeddings.
 * @param {Array<Array<number>>} embeddings - List of input vectors.
 * @param {number} clusterThreshold - Maximum distance for clustering.
 * @returns {Array<{ centroid: Array<number>, members: Array<Array<number>> }>} - Clusters with centroids and members.
 */
export function hierarchicalVectorQuantization(embeddings, clusterThreshold) {
  if (!Array.isArray(embeddings) || embeddings.length === 0) {
    throw new Error('Embeddings must be a non-empty array of vectors.');
  }

  const clusters = [];

  for (const embedding of embeddings) {
    let addedToCluster = false;

    for (const cluster of clusters) {
      const distance = euclideanDistance(embedding, cluster.centroid);

      if (distance <= clusterThreshold) {
        cluster.members.push(embedding);
        cluster.centroid = cluster.members[0].map((_, i) =>
          cluster.members.reduce((sum, vec) => sum + vec[i], 0) / cluster.members.length
        );
        addedToCluster = true;
        break;
      }
    }

    if (!addedToCluster) {
      clusters.push({ centroid: embedding, members: [embedding] });
    }
  }

  return clusters;
}

/**
 * Compress context by retaining representative vectors from clusters.
 * @param {Array<Array<number>>} embeddings - List of input vectors.
 * @param {number} clusterThreshold - Maximum distance for clustering.
 * @returns {Array<Array<number>>} - Representative vectors from clusters.
 */
export function compressContext(embeddings, clusterThreshold) {
  const clusters = hierarchicalVectorQuantization(embeddings, clusterThreshold);
  return clusters.map(cluster => cluster.centroid);
}

/**
 * Normalize a vector to unit length.
 * @param {Array<number>} vector - Input vector.
 * @returns {Array<number>} - Normalized vector.
 */
export function normalizeVector(vector) {
  const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
  if (magnitude === 0) {
    throw new Error('Cannot normalize a zero vector.');
  }
  return vector.map(val => val / magnitude);
}

/**
 * Utility to validate input vectors.
 * @param {Array<Array<number>>} embeddings - List of input vectors.
 */
export function validateEmbeddings(embeddings) {
  if (!Array.isArray(embeddings) || embeddings.length === 0) {
    throw new Error('Embeddings must be a non-empty array of vectors.');
  }
  const dimension = embeddings[0].length;
  if (!embeddings.every(vec => Array.isArray(vec) && vec.length === dimension)) {
    throw new Error('All vectors must have the same dimensions.');
  }
}

/**
 * Example usage function to demonstrate the module.
 * @param {Array<Array<number>>} embeddings - List of input vectors.
 * @param {number} clusterThreshold - Maximum distance for clustering.
 * @returns {Array<Array<number>>} - Compressed context.
 */
export function exampleUsage(embeddings, clusterThreshold) {
  validateEmbeddings(embeddings);
  return compressContext(embeddings, clusterThreshold);
}
