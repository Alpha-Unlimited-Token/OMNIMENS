/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: inMemoryEmbeddingSearch
 * Written: 2026-04-03T05:32:16.656Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// Complete ES module code here

import { createHash } from 'crypto';

/**
 * Generate a hash-based signature for an embedding to be used in LSH buckets.
 * @param {number[]} embedding - Array of numbers representing the embedding.
 * @param {number} numBits - Number of bits for the hash signature.
 * @returns {string} - Binary string representing the hash signature.
 */
export function generateLSHSignature(embedding, numBits) {
  const hash = createHash('sha256');
  hash.update(embedding.join(','));
  const binaryHash = BigInt('0x' + hash.digest('hex')).toString(2);
  return binaryHash.slice(0, numBits).padStart(numBits, '0');
}

/**
 * Create LSH buckets from a collection of embeddings.
 * @param {Array<{ id, vector}>} embeddings - Array of objects with id and vector.
 * @param {number} numBits - Number of bits for the hash signature.
 * @returns {Map<string, Set<string>>} - Map of LSH buckets with hash keys and sets of embedding ids.
 */
export function createLSHBuckets(embeddings, numBits) {
  const buckets = new Map();
  for (const { id, vector } of embeddings) {
    const signature = generateLSHSignature(vector, numBits);
    if (!buckets.has(signature)) {
      buckets.set(signature, new Set());
    }
    buckets.get(signature).add(id);
  }
  return buckets;
}

/**
 * Compute the Euclidean distance between two embeddings.
 * @param {number[]} vectorA - First embedding vector.
 * @param {number[]} vectorB - Second embedding vector.
 * @returns {number} - Euclidean distance between the two vectors.
 */
export function euclideanDistance(vectorA, vectorB) {
  if (vectorA.length !== vectorB.length) {
    throw new Error('Vectors must have the same dimensions.');
  }
  return Math.sqrt(vectorA.reduce((sum, a, i) => sum + (a - vectorB[i]) ** 2, 0));
}

/**
 * Perform a nearest neighbor search within LSH buckets.
 * @param {number[]} queryVector - Query embedding vector.
 * @param {Map<string, Set<string>>} buckets - LSH buckets.
 * @param {Array<{ id, vector}>} embeddings - Original embeddings.
 * @param {number} numBits - Number of bits for the hash signature.
 * @param {number} k - Number of nearest neighbors to retrieve.
 * @returns {Array<{ id, distance}>} - Array of nearest neighbors sorted by distance.
 */
export function searchNearestNeighbors(queryVector, buckets, embeddings, numBits, k) {
  const querySignature = generateLSHSignature(queryVector, numBits);
  const candidateIds = buckets.get(querySignature) || new Set();

  const candidates = embeddings.filter(({ id }) => candidateIds.has(id));
  const distances = candidates.map(({ id, vector }) => ({
    id,
    distance: euclideanDistance(queryVector, vector)
  }));

  return distances
    .sort((a, b) => a.distance - b.distance)
    .slice(0, k);
}

/**
 * Utility function to normalize an embedding vector.
 * @param {number[]} vector - Embedding vector.
 * @returns {number[]} - Normalized vector.
 */
export function normalizeVector(vector) {
  const magnitude = Math.sqrt(vector.reduce((sum, x) => sum + x ** 2, 0));
  if (magnitude === 0) {
    throw new Error('Cannot normalize a zero vector.');
  }
  return vector.map(x => x / magnitude);
}

/**
 * Example usage of the module.
 */
export function exampleUsage() {
  const embeddings = [
    { id: 'doc1', vector: normalizeVector([1, 2, 3]) },
    { id: 'doc2', vector: normalizeVector([4, 5, 6]) },
    { id: 'doc3', vector: normalizeVector([7, 8, 9]) }
  ];

  const numBits = 16;
  const buckets = createLSHBuckets(embeddings, numBits);

  const queryVector = normalizeVector([1, 2, 3.1]);
  const nearestNeighbors = searchNearestNeighbors(queryVector, buckets, embeddings, numBits, 2);

  return nearestNeighbors;
}