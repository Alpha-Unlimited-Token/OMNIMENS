/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: hierarchicalMemoryManager
 * Written: 2026-04-02T14:22:57.798Z
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
 * Generate hash for a given input string (used for clustering consistency).
 * @param {string} input
 * @returns {string} Hexadecimal hash string
 */
export function generateHash(input) {
  const hash = createHash('sha256');
  hash.update(input);
  return hash.digest('hex');
}

/**
 * Compute Euclidean distance between two vectors.
 * @param {number[]} vectorA
 * @param {number[]} vectorB
 * @returns {number} Distance
 */
export function euclideanDistance(vectorA, vectorB) {
  if (vectorA.length !== vectorB.length) {
    throw new Error('Vectors must have the same length');
  }
  return Math.sqrt(vectorA.reduce((sum, val, idx) => sum + Math.pow(val - vectorB[idx], 2), 0));
}

/**
 * Perform k-means clustering on a set of token embeddings.
 * @param {number[][]} embeddings Array of token embeddings (vectors).
 * @param {number} k Number of clusters.
 * @param {number} maxIterations Maximum iterations for convergence.
 * @returns {Object} Cluster assignments and centroids.
 */
export function kMeansClustering(embeddings, k, maxIterations = 100) {
  if (embeddings.length < k) {
    throw new Error('Number of clusters cannot exceed number of embeddings');
  }

  // Initialize centroids randomly
  const centroids = embeddings.slice(0, k).map(vec => [...vec]);
  let assignments = new Array(embeddings.length).fill(-1);

  for (let iteration = 0; iteration < maxIterations; iteration++) {
    let hasChanged = false;

    // Assign each embedding to the nearest centroid
    assignments = embeddings.map((embedding, idx) => {
      let closestCentroid = -1;
      let minDistance = Infinity;

      centroids.forEach((centroid, centroidIdx) => {
        const distance = euclideanDistance(embedding, centroid);
        if (distance < minDistance) {
          minDistance = distance;
          closestCentroid = centroidIdx;
        }
      });

      if (assignments[idx] !== closestCentroid) {
        hasChanged = true;
      }

      return closestCentroid;
    });

    // Recompute centroids based on assignments
    centroids.forEach((centroid, centroidIdx) => {
      const assignedEmbeddings = embeddings.filter((_, idx) => assignments[idx] === centroidIdx);
      if (assignedEmbeddings.length > 0) {
        for (let dim = 0; dim < centroid.length; dim++) {
          centroid[dim] = assignedEmbeddings.reduce((sum, vec) => sum + vec[dim], 0) / assignedEmbeddings.length;
        }
      }
    });

    // Break if no assignments changed
    if (!hasChanged) break;
  }

  return { assignments, centroids };
}

/**
 * Compress tokens into hierarchical clusters for extended context.
 * @param {string[]} tokens Array of tokens.
 * @param {number[][]} embeddings Corresponding embeddings for tokens.
 * @param {number} levels Number of hierarchical levels.
 * @returns {Object} Hierarchical clustering structure.
 */
export function hierarchicalTokenCompression(tokens, embeddings, levels) {
  if (tokens.length !== embeddings.length) {
    throw new Error('Tokens and embeddings arrays must have the same length');
  }

  let currentLevel = { tokens, embeddings };
  const hierarchy = [];

  for (let level = 0; level < levels; level++) {
    const k = Math.max(2, Math.floor(currentLevel.tokens.length / 2));
    const { assignments, centroids } = kMeansClustering(currentLevel.embeddings, k);

    const clusters = centroids.map((centroid, clusterIdx) => ({
      centroid,
      tokens: currentLevel.tokens.filter((_, idx) => assignments[idx] === clusterIdx)
    }));

    hierarchy.push(clusters);

    // Prepare for next level
    currentLevel = {
      tokens: clusters.map(cluster => generateHash(cluster.tokens.join(''))),
      embeddings: centroids
    };
  }

  return hierarchy;
}

/**
 * Retrieve relevant tokens from a hierarchical structure based on query embedding.
 * @param {Object[]} hierarchy Hierarchical clustering structure.
 * @param {number[]} queryEmbedding Query embedding vector.
 * @param {number} topK Number of top tokens to retrieve.
 * @returns {string[]} Relevant tokens.
 */
export function retrieveTokens(hierarchy, queryEmbedding, topK = 5) {
  let currentLevel = hierarchy[hierarchy.length - 1];

  for (let level = hierarchy.length - 1; level >= 0; level--) {
    currentLevel = currentLevel.sort((a, b) => {
      const distA = euclideanDistance(queryEmbedding, a.centroid);
      const distB = euclideanDistance(queryEmbedding, b.centroid);
      return distA - distB;
    }).slice(0, topK);
  }

  return currentLevel.flatMap(cluster => cluster.tokens);
}
