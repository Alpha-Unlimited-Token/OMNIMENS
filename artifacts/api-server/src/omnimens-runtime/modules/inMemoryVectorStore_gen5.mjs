/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: inMemoryVectorStore
 * Written: 2026-04-01T22:10:58.494Z
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
 * Generates a unique hash for a vector to ensure uniqueness in the store.
 * @param {Array<number>} vector - The input vector.
 * @returns {string} - A unique hash string.
 */
export function generateVectorHash(vector) {
  const hash = createHash('sha256');
  hash.update(vector.join(','));
  return hash.digest('hex');
}

/**
 * Calculates the Euclidean distance between two vectors.
 * @param {Array<number>} vectorA - The first vector.
 * @param {Array<number>} vectorB - The second vector.
 * @returns {number} - The Euclidean distance.
 */
export function calculateEuclideanDistance(vectorA, vectorB) {
  if (vectorA.length !== vectorB.length) {
    throw new Error('Vectors must have the same dimensions.');
  }
  return Math.sqrt(vectorA.reduce((sum, val, idx) => sum + Math.pow(val - vectorB[idx], 2), 0));
}

/**
 * In-memory vector store class using approximate nearest neighbor search.
 */
export class InMemoryVectorStore {
  constructor() {
    this.vectors = new Map(); // Stores vectors with their hashes as keys.
  }

  /**
   * Adds a vector to the store.
   * @param {Array<number>} vector - The vector to add.
   */
  addVector(vector) {
    const hash = generateVectorHash(vector);
    if (this.vectors.has(hash)) {
      throw new Error('Duplicate vector detected.');
    }
    this.vectors.set(hash, vector);
  }

  /**
   * Finds the nearest neighbors to a given vector.
   * @param {Array<number>} queryVector - The vector to search for.
   * @param {number} k - The number of nearest neighbors to retrieve.
   * @returns {Array<{ vector, distance}>} - The nearest neighbors.
   */
  findNearestNeighbors(queryVector, k = 1) {
    if (k <= 0) {
      throw new Error('k must be a positive integer.');
    }

    const distances = [];

    for (const [_, vector] of this.vectors) {
      const distance = calculateEuclideanDistance(queryVector, vector);
      distances.push({ vector, distance });
    }

    distances.sort((a, b) => a.distance - b.distance);

    return distances.slice(0, k);
  }

  /**
   * Clears all vectors in the store.
   */
  clearStore() {
    this.vectors.clear();
  }

  /**
   * Returns the total number of vectors in the store.
   * @returns {number} - The count of vectors in the store.
   */
  getVectorCount() {
    return this.vectors.size;
  }
}

/**
 * Utility function to normalize a vector.
 * @param {Array<number>} vector - The vector to normalize.
 * @returns {Array<number>} - The normalized vector.
 */
export function normalizeVector(vector) {
  const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
  if (magnitude === 0) {
    throw new Error('Cannot normalize a zero vector.');
  }
  return vector.map(val => val / magnitude);
}

/**
 * Utility function to generate random vectors for testing.
 * @param {number} dimensions - The number of dimensions for the vector.
 * @param {number} count - The number of vectors to generate.
 * @returns {Array<Array<number>>} - An array of random vectors.
 */
export function generateRandomVectors(dimensions, count) {
  if (dimensions <= 0 || count <= 0) {
    throw new Error('Dimensions and count must be positive integers.');
  }
  return Array.from({ length: count }, () => Array.from({ length: dimensions }, () => Math.random()));
}
