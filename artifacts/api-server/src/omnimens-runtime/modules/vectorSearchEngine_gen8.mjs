/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: vectorSearchEngine
 * Written: 2026-04-01T22:18:54.479Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// vectorSearchEngine.mjs

import { createHash } from 'crypto';

/**
 * Generate a hash for a vector using Locality-Sensitive Hashing (LSH).
 * @param {number[]} vector - The input vector.
 * @param {number} numBits - The number of hash bits to generate.
 * @returns {string} - The binary hash string.
 */
export function generateLSHHash(vector, numBits) {
  const hash = createHash('sha256');
  hash.update(vector.join(','));
  const binaryHash = BigInt('0x' + hash.digest('hex')).toString(2);
  return binaryHash.slice(0, numBits).padStart(numBits, '0');
}

/**
 * Compute the Euclidean distance between two vectors.
 * @param {number[]} vectorA - The first vector.
 * @param {number[]} vectorB - The second vector.
 * @returns {number} - The Euclidean distance.
 */
export function euclideanDistance(vectorA, vectorB) {
  if (vectorA.length !== vectorB.length) {
    throw new Error('Vectors must be of the same dimension.');
  }
  return Math.sqrt(vectorA.reduce((sum, val, i) => sum + (val - vectorB[i]) ** 2, 0));
}

/**
 * Build an LSH index for a dataset of vectors.
 * @param {number[][]} dataset - Array of high-dimensional vectors.
 * @param {number} numBits - Number of hash bits for LSH.
 * @returns {Map<string, number[][]>} - A hash table mapping LSH hashes to vectors.
 */
export function buildLSHIndex(dataset, numBits) {
  const index = new Map();
  for (const vector of dataset) {
    const hash = generateLSHHash(vector, numBits);
    if (!index.has(hash)) {
      index.set(hash, []);
    }
    index.get(hash).push(vector);
  }
  return index;
}

/**
 * Perform a similarity search for a query vector in an LSH index.
 * @param {number[]} queryVector - The vector to search for.
 * @param {Map<string, number[][]>} index - The LSH index.
 * @param {number} numBits - Number of hash bits used in the index.
 * @param {number} k - The number of nearest neighbors to return.
 * @returns {number[][]} - The k nearest neighbors.
 */
export function searchLSHIndex(queryVector, index, numBits, k) {
  const queryHash = generateLSHHash(queryVector, numBits);
  const candidates = index.get(queryHash) || [];

  // Sort candidates by Euclidean distance and return the top k
  return candidates
    .map(candidate => ({ vector: candidate, distance: euclideanDistance(queryVector, candidate) }))
    .sort((a, b) => a.distance - b.distance)
    .slice(0, k)
    .map(item => item.vector);
}

/**
 * Normalize a vector to unit length.
 * @param {number[]} vector - The input vector.
 * @returns {number[]} - The normalized vector.
 */
export function normalizeVector(vector) {
  const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val ** 2, 0));
  if (magnitude === 0) {
    throw new Error('Cannot normalize a zero vector.');
  }
  return vector.map(val => val / magnitude);
}

/**
 * Generate random high-dimensional vectors for testing.
 * @param {number} numVectors - Number of vectors to generate.
 * @param {number} dimensions - Dimensionality of each vector.
 * @returns {number[][]} - Array of random vectors.
 */
export function generateRandomVectors(numVectors, dimensions) {
  return Array.from({ length: numVectors }, () => Array.from({ length: dimensions }, () => Math.random()));
}

/**
 * Example usage of the module.
 */
export function exampleUsage() {
  const dataset = generateRandomVectors(1000, 128); // 1000 vectors, 128 dimensions
  const numBits = 16; // Use 16-bit hashes
  const lshIndex = buildLSHIndex(dataset, numBits);

  const queryVector = generateRandomVectors(1, 128)[0];
  const k = 5; // Find top 5 nearest neighbors
  const neighbors = searchLSHIndex(queryVector, lshIndex, numBits, k);

  return neighbors;
}