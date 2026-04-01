/**
 * OMNIMENS Self-Authored Module (Migrated from DB)
 * Original Source: evolution_cycle_4
 * Name: vectorMemoryIndex
 * Purpose: Provides an in-memory vector store for fast similarity searches.
 * Description: Provides an in-memory vector store with fast similarity search using cosine similarity for AI embedding lookups.
 * Migrated: 2026-04-01T22:23:20.236Z
 */

// vectorMemoryIndex.mjs

import { createHash } from 'crypto';

/**
 * Computes the cosine similarity between two vectors.
 * @param {number[]} vectorA - First vector.
 * @param {number[]} vectorB - Second vector.
 * @returns {number} - Cosine similarity score (-1 to 1).
 */
export function cosineSimilarity(vectorA, vectorB) {
  if (vectorA.length !== vectorB.length) {
    throw new Error('Vectors must have the same dimensions');
  }

  const dotProduct = vectorA.reduce((sum, a, i) => sum + a * vectorB[i], 0);
  const magnitudeA = Math.sqrt(vectorA.reduce((sum, a) => sum + a ** 2, 0));
  const magnitudeB = Math.sqrt(vectorB.reduce((sum, b) => sum + b ** 2, 0));

  if (magnitudeA === 0 || magnitudeB === 0) {
    throw new Error('Vectors must not be zero-length');
  }

  return dotProduct / (magnitudeA * magnitudeB);
}

/**
 * Generates a unique hash for a vector to use as a key.
 * @param {number[]} vector - Input vector.
 * @returns {string} - Hash string.
 */
export function hashVector(vector) {
  const hash = createHash('sha256');
  hash.update(vector.join(','));
  return hash.digest('hex');
}

/**
 * Class representing an in-memory vector store for similarity searches.
 */
export class VectorMemoryIndex {
  constructor() {
    this.index = new Map(); // Map of vector hashes to vectors and metadata
  }

  /**
   * Adds a vector to the index.
   * @param {number[]} vector - The vector to add.
   * @param {any} metadata - Optional metadata associated with the vector.
   */
  addVector(vector, metadata = null) {
    const key = hashVector(vector);
    this.index.set(key, { vector, metadata });
  }

  /**
   * Searches for the top-k most similar vectors in the index.
   * @param {number[]} queryVector - The query vector.
   * @param {number} k - Number of nearest neighbors to return.
   * @returns {Array<{ vector: number[], metadata: any, similarity: number }>} - Top-k similar vectors.
   */
  search(queryVector, k = 1) {
    if (k <= 0) {
      throw new Error('k must be a positive integer');
    }

    const results = [];

    for (const { vector, metadata } of this.index.values()) {
      const similarity = cosineSimilarity(queryVector, vector);
      results.push({ vector, metadata, similarity });
    }

    results.sort((a, b) => b.similarity - a.similarity);
    return results.slice(0, k);
  }

  /**
   * Clears all vectors from the index.
   */
  clear() {
    this.index.clear();
  }
}

/**
 * Utility function to normalize a vector to unit length.
 * @param {number[]} vector - Input vector.
 * @returns {number[]} - Normalized vector.
 */
export function normalizeVector(vector) {
  const magnitude = Math.sqrt(vector.reduce((sum, x) => sum + x ** 2, 0));
  if (magnitude === 0) {
    throw new Error('Vector magnitude must not be zero');
  }
  return vector.map(x => x / magnitude);
}

/**
 * Utility function to generate random vectors for testing.
 * @param {number} dimensions - Number of dimensions for the vector.
 * @returns {number[]} - Randomly generated vector.
 */
export function generateRandomVector(dimensions) {
  if (dimensions <= 0) {
    throw new Error('Dimensions must be a positive integer');
  }
  return Array.from({ length: dimensions }, () => Math.random() * 2 - 1);
}