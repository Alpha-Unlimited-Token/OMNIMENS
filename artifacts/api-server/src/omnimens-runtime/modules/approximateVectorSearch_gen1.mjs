/**
 * OMNIMENS Self-Authored Module (Migrated from DB)
 * Original Source: evolution_cycle_6
 * Name: approximateVectorSearch
 * Purpose: Enable fast similarity searches using approximate nearest neighbor algorithms.
 * Description: Provides approximate nearest neighbor search using locality-sensitive hashing (LSH) for fast vector similarity retrieval.
 * Migrated: 2026-04-01T22:23:20.239Z
 */

// approximateVectorSearch.mjs

import { createHash } from 'crypto';

/**
 * Generate a hash-based locality-sensitive hashing (LSH) signature for a vector.
 * @param {number[]} vector - Input vector.
 * @param {number} numHashes - Number of hash functions to use.
 * @returns {string[]} - Array of hash signatures.
 */
export function generateLSHSignature(vector, numHashes) {
  const signatures = [];
  for (let i = 0; i < numHashes; i++) {
    const hash = createHash('sha256');
    hash.update(vector.map(v => v * (i + 1)).join(','));
    signatures.push(hash.digest('hex').slice(0, 8)); // Use first 8 characters for compactness
  }
  return signatures;
}

/**
 * Compute the Euclidean distance between two vectors.
 * @param {number[]} vectorA - First vector.
 * @param {number[]} vectorB - Second vector.
 * @returns {number} - Euclidean distance.
 */
export function computeEuclideanDistance(vectorA, vectorB) {
  if (vectorA.length !== vectorB.length) {
    throw new Error('Vectors must have the same length');
  }
  return Math.sqrt(vectorA.reduce((sum, val, idx) => sum + Math.pow(val - vectorB[idx], 2), 0));
}

/**
 * Build an approximate nearest neighbor index using LSH.
 * @param {number[][]} dataset - Array of vectors.
 * @param {number} numHashes - Number of hash functions to use.
 * @returns {Map<string, number[]>} - LSH index mapping hash signatures to vector indices.
 */
export function buildLSHIndex(dataset, numHashes) {
  const index = new Map();
  dataset.forEach((vector, idx) => {
    const signatures = generateLSHSignature(vector, numHashes);
    signatures.forEach(signature => {
      if (!index.has(signature)) {
        index.set(signature, []);
      }
      index.get(signature).push(idx);
    });
  });
  return index;
}

/**
 * Perform an approximate nearest neighbor search.
 * @param {number[]} queryVector - Query vector.
 * @param {Map<string, number[]>} index - LSH index.
 * @param {number[][]} dataset - Original dataset.
 * @param {number} numHashes - Number of hash functions used in index.
 * @returns {number[]} - Indices of nearest neighbors.
 */
export function approximateNearestNeighbors(queryVector, index, dataset, numHashes) {
  const querySignatures = generateLSHSignature(queryVector, numHashes);
  const candidateIndices = new Set();

  querySignatures.forEach(signature => {
    if (index.has(signature)) {
      index.get(signature).forEach(idx => candidateIndices.add(idx));
    }
  });

  const neighbors = Array.from(candidateIndices)
    .map(idx => ({ idx, distance: computeEuclideanDistance(queryVector, dataset[idx]) }))
    .sort((a, b) => a.distance - b.distance);

  return neighbors.map(neighbor => neighbor.idx);
}

/**
 * Utility to normalize a vector.
 * @param {number[]} vector - Input vector.
 * @returns {number[]} - Normalized vector.
 */
export function normalizeVector(vector) {
  const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
  return vector.map(val => val / magnitude);
}

/**
 * Example usage:
 * const dataset = [
 *   [1, 2, 3],
 *   [4, 5, 6],
 *   [7, 8, 9]
 * ];
 * const query = [2, 3, 4];
 * const numHashes = 5;
 * const index = buildLSHIndex(dataset, numHashes);
 * const neighbors = approximateNearestNeighbors(query, index, dataset, numHashes);
 * console.log(neighbors);
 */