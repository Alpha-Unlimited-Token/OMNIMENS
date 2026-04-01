/**
 * OMNIMENS Self-Authored Module (Migrated from DB)
 * Original Source: evolution_cycle_14
 * Name: hierarchicalMemoryIndex
 * Purpose: Enhances memory retrieval by organizing vector embeddings into hierarchical clusters for nuanced semantic access.
 * Description: This module organizes vector embeddings into hierarchical clusters for efficient semantic memory retrieval and dynamic sub-cluster expansion.
 * Migrated: 2026-04-01T22:23:20.240Z
 */

// hierarchicalMemoryIndex.mjs

import { createHash } from 'crypto';

/**
 * Generate a hash-based identifier for a given vector.
 * Useful for indexing and ensuring uniqueness.
 * @param {number[]} vector - The input vector.
 * @returns {string} - A unique hash string for the vector.
 */
export function generateVectorId(vector) {
  const hash = createHash('sha256');
  hash.update(vector.map(v => v.toFixed(6)).join(','));
  return hash.digest('hex');
}

/**
 * Calculate the Euclidean distance between two vectors.
 * @param {number[]} vectorA - The first vector.
 * @param {number[]} vectorB - The second vector.
 * @returns {number} - The Euclidean distance.
 */
export function calculateDistance(vectorA, vectorB) {
  if (vectorA.length !== vectorB.length) {
    throw new Error('Vectors must have the same length');
  }
  return Math.sqrt(vectorA.reduce((sum, val, idx) => sum + Math.pow(val - vectorB[idx], 2), 0));
}

/**
 * Find the centroid of a cluster of vectors.
 * @param {number[][]} cluster - A list of vectors.
 * @returns {number[]} - The centroid vector.
 */
export function calculateCentroid(cluster) {
  if (cluster.length === 0) {
    throw new Error('Cluster cannot be empty');
  }
  const dimension = cluster[0].length;
  const centroid = Array(dimension).fill(0);
  cluster.forEach(vector => {
    vector.forEach((value, index) => {
      centroid[index] += value;
    });
  });
  return centroid.map(sum => sum / cluster.length);
}

/**
 * Organize vectors into hierarchical clusters.
 * @param {number[][]} vectors - The input vectors.
 * @param {number} threshold - The maximum distance for clustering.
 * @returns {Object} - A hierarchical clustering structure.
 */
export function hierarchicalClustering(vectors, threshold) {
  const clusters = [];

  vectors.forEach(vector => {
    let addedToCluster = false;

    for (const cluster of clusters) {
      const centroid = calculateCentroid(cluster);
      if (calculateDistance(vector, centroid) <= threshold) {
        cluster.push(vector);
        addedToCluster = true;
        break;
      }
    }

    if (!addedToCluster) {
      clusters.push([vector]);
    }
  });

  return clusters.map(cluster => ({
    centroid: calculateCentroid(cluster),
    vectors: cluster
  }));
}

/**
 * Dynamically expand sub-clusters within a hierarchical structure.
 * @param {Object[]} clusters - The hierarchical clusters.
 * @param {number} subThreshold - The threshold for sub-cluster expansion.
 * @returns {Object[]} - The expanded hierarchical structure.
 */
export function expandSubClusters(clusters, subThreshold) {
  return clusters.map(cluster => {
    const subClusters = hierarchicalClustering(cluster.vectors, subThreshold);
    return {
      centroid: cluster.centroid,
      subClusters: subClusters
    };
  });
}

/**
 * Retrieve vectors semantically close to a query vector.
 * @param {Object[]} clusters - The hierarchical clusters.
 * @param {number[]} queryVector - The query vector.
 * @param {number} maxDistance - The maximum allowable distance.
 * @returns {number[][]} - A list of matching vectors.
 */
export function retrieveSimilarVectors(clusters, queryVector, maxDistance) {
  const results = [];

  clusters.forEach(cluster => {
    if (calculateDistance(queryVector, cluster.centroid) <= maxDistance) {
      cluster.vectors.forEach(vector => {
        if (calculateDistance(queryVector, vector) <= maxDistance) {
          results.push(vector);
        }
      });
    }
  });

  return results;
}

/**
 * Utility to normalize a vector to unit length.
 * @param {number[]} vector - The input vector.
 * @returns {number[]} - The normalized vector.
 */
export function normalizeVector(vector) {
  const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + Math.pow(val, 2), 0));
  if (magnitude === 0) {
    throw new Error('Cannot normalize a zero vector');
  }
  return vector.map(val => val / magnitude);
}
