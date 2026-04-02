/**
 * OMNIMENS Self-Authored Module (Migrated from DB)
 * Original Source: evolution_cycle_14
 * Name: semanticClusterPruner
 * Purpose: Optimize token retention by clustering semantically similar tokens and predicting importance scores.
 * Description: Clusters semantically similar tokens and calculates their importance using K-means and attention weighting.
 * Migrated: 2026-04-02T14:08:14.881Z
 */

// semanticClusterPruner.mjs

import { createHash } from 'crypto';

/**
 * Perform K-means clustering on an array of token embeddings.
 * @param {Array<Array<number>>} embeddings - Array of token embeddings (each embedding is an array of numbers).
 * @param {number} k - Number of clusters.
 * @param {number} maxIterations - Maximum number of iterations for convergence.
 * @returns {Array<number>} - Cluster assignments for each token.
 */
export function kMeansClustering(embeddings, k, maxIterations = 100) {
  if (!Array.isArray(embeddings) || embeddings.length === 0) {
    throw new Error('Embeddings must be a non-empty array.');
  }

  const dimensions = embeddings[0].length;
  if (!embeddings.every(e => e.length === dimensions)) {
    throw new Error('All embeddings must have the same dimensionality.');
  }

  // Initialize centroids randomly
  const centroids = embeddings.slice(0, k);
  let assignments = new Array(embeddings.length).fill(-1);

  for (let iteration = 0; iteration < maxIterations; iteration++) {
    // Step 1: Assign each embedding to the nearest centroid
    const newAssignments = embeddings.map(embedding => {
      let minDistance = Infinity;
      let clusterIndex = -1;

      centroids.forEach((centroid, index) => {
        const distance = euclideanDistance(embedding, centroid);
        if (distance < minDistance) {
          minDistance = distance;
          clusterIndex = index;
        }
      });

      return clusterIndex;
    });

    // Check for convergence
    if (newAssignments.every((a, i) => a === assignments[i])) {
      break;
    }

    assignments = newAssignments;

    // Step 2: Update centroids
    for (let i = 0; i < k; i++) {
      const clusterPoints = embeddings.filter((_, index) => assignments[index] === i);
      if (clusterPoints.length > 0) {
        centroids[i] = meanVector(clusterPoints);
      }
    }
  }

  return assignments;
}

/**
 * Calculate attention-weighted importance scores for tokens.
 * @param {Array<number>} attentionWeights - Attention weights for each token.
 * @param {Array<number>} clusterAssignments - Cluster assignments for each token.
 * @returns {Array<number>} - Importance scores for each token.
 */
export function calculateImportanceScores(attentionWeights, clusterAssignments) {
  if (attentionWeights.length !== clusterAssignments.length) {
    throw new Error('Attention weights and cluster assignments must have the same length.');
  }

  const clusterScores = {};
  clusterAssignments.forEach((cluster, index) => {
    if (!clusterScores[cluster]) {
      clusterScores[cluster] = [];
    }
    clusterScores[cluster].push(attentionWeights[index]);
  });

  return clusterAssignments.map(cluster => {
    const scores = clusterScores[cluster] || [];
    return scores.reduce((sum, weight) => sum + weight, 0) / scores.length;
  });
}

/**
 * Compute the Euclidean distance between two vectors.
 * @param {Array<number>} vectorA - First vector.
 * @param {Array<number>} vectorB - Second vector.
 * @returns {number} - Euclidean distance.
 */
export function euclideanDistance(vectorA, vectorB) {
  return Math.sqrt(vectorA.reduce((sum, a, index) => sum + Math.pow(a - vectorB[index], 2), 0));
}

/**
 * Compute the mean vector from an array of vectors.
 * @param {Array<Array<number>>} vectors - Array of vectors.
 * @returns {Array<number>} - Mean vector.
 */
export function meanVector(vectors) {
  const dimensions = vectors[0].length;
  const sumVector = new Array(dimensions).fill(0);

  vectors.forEach(vector => {
    vector.forEach((value, index) => {
      sumVector[index] += value;
    });
  });

  return sumVector.map(value => value / vectors.length);
}

/**
 * Generate a deterministic hash for a token (useful for debugging or mapping tokens).
 * @param {string} token - Input token.
 * @returns {string} - SHA-256 hash of the token.
 */
export function hashToken(token) {
  return createHash('sha256').update(token).digest('hex');
}

/**
 * Normalize an array of numbers to sum to 1 (useful for attention weights).
 * @param {Array<number>} values - Array of numbers.
 * @returns {Array<number>} - Normalized array.
 */
export function normalizeArray(values) {
  const sum = values.reduce((acc, val) => acc + val, 0);
  if (sum === 0) {
    return values.map(() => 0);
  }
  return values.map(value => value / sum);
}
