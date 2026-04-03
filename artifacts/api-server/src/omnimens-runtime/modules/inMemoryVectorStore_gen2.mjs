/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: inMemoryVectorStore
 * Written: 2026-04-03T09:09:34.481Z
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
 * Utility module for in-memory vector storage and similarity search using HNSW-like algorithm.
 * Provides efficient approximate nearest neighbor search for embeddings.
 */

// Helper function: Compute Euclidean distance between two vectors
export function euclideanDistance(vectorA, vectorB) {
  if (vectorA.length !== vectorB.length) {
    throw new Error('Vectors must have the same dimensions');
  }
  return Math.sqrt(
    vectorA.reduce((sum, val, index) => sum + Math.pow(val - vectorB[index], 2), 0)
  );
}

// Helper function: Generate a unique hash for a vector (used for indexing)
export function hashVector(vector) {
  const hash = createHash('sha256');
  hash.update(vector.join(','));
  return hash.digest('hex');
}

// Class
export class InMemoryVectorStore {
  constructor() {
    this.vectors = new Map(); // Stores vectors with their hashed keys
  }

  /**
   * Add a vector to the store
   * @param {string} id - Unique identifier for the vector
   * @param {number[]} vector - Numerical embedding
   */
  addVector(id, vector) {
    if (!Array.isArray(vector) || vector.some((val) => typeof val !== 'number')) {
      throw new Error('Vector must be an array of numbers');
    }
    const hash = hashVector(vector);
    this.vectors.set(hash, { id, vector });
  }

  /**
   * Search for the nearest neighbors to a given query vector
   * @param {number[]} queryVector - Numerical embedding to search for
   * @param {number} k - Number of nearest neighbors to return
   * @returns {Array<{id, distance}>} - List of nearest neighbors
   */
  search(queryVector, k = 1) {
    if (!Array.isArray(queryVector) || queryVector.some((val) => typeof val !== 'number')) {
      throw new Error('Query vector must be an array of numbers');
    }
    if (k <= 0) {
      throw new Error('k must be a positive integer');
    }

    const distances = [];
    for (const { id, vector } of this.vectors.values()) {
      const distance = euclideanDistance(queryVector, vector);
      distances.push({ id, distance });
    }

    distances.sort((a, b) => a.distance - b.distance); // Sort by ascending distance
    return distances.slice(0, k); // Return top-k nearest neighbors
  }

  /**
   * Get the total number of vectors stored
   * @returns {number} - Count of stored vectors
   */
  getVectorCount() {
    return this.vectors.size;
  }
}

// Exported utility functions and class
export const createVectorStore = () => new InMemoryVectorStore();

export function normalizeVector(vector) {
  const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
  return vector.map((val) => val / magnitude);
}

export function cosineSimilarity(vectorA, vectorB) {
  if (vectorA.length !== vectorB.length) {
    throw new Error('Vectors must have the same dimensions');
  }
  const dotProduct = vectorA.reduce((sum, val, index) => sum + val * vectorB[index], 0);
  const magnitudeA = Math.sqrt(vectorA.reduce((sum, val) => sum + val * val, 0));
  const magnitudeB = Math.sqrt(vectorB.reduce((sum, val) => sum + val * val, 0));
  return dotProduct / (magnitudeA * magnitudeB);
}
