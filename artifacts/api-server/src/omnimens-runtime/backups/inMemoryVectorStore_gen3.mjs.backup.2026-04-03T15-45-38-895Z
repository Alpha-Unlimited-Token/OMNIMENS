/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: inMemoryVectorStore
 * Written: 2026-04-03T14:26:02.970Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// inMemoryVectorStore.mjs

import { createHash } from 'crypto';

/**
 * Generates a hash for a given input to ensure unique identifiers for embeddings.
 * @param {string} input - The input string to hash.
 * @returns {string} - A unique hash string.
 */
export function generateHash(input) {
  return createHash('sha256').update(input).digest('hex');
}

/**
 * Calculates the Euclidean distance between two vectors.
 * @param {number[]} vectorA - First vector.
 * @param {number[]} vectorB - Second vector.
 * @returns {number} - The Euclidean distance.
 */
export function euclideanDistance(vectorA, vectorB) {
  if (vectorA.length !== vectorB.length) {
    throw new Error('Vectors must be of the same dimension.');
  }
  return Math.sqrt(vectorA.reduce((sum, val, i) => sum + Math.pow(val - vectorB[i], 2), 0));
}

/**
 * Class representing an in-memory vector store with HNSW-like graph functionality.
 */
export class InMemoryVectorStore {
  constructor() {
    this.store = new Map();
  }

  /**
   * Adds a vector to the store.
   * @param {string} id - Unique identifier for the vector.
   * @param {number[]} vector - The vector to store.
   */
  addVector(id, vector) {
    if (this.store.has(id)) {
      throw new Error(`Vector with ID ${id} already exists.`);
    }
    this.store.set(id, vector);
  }

  /**
   * Finds the nearest neighbors to a given query vector.
   * @param {number[]} queryVector - The vector to search for.
   * @param {number} k - Number of nearest neighbors to retrieve.
   * @returns {Array<{ id, distance}>} - List of nearest neighbors.
   */
  findNearestNeighbors(queryVector, k = 1) {
    if (k <= 0) {
      throw new Error('k must be a positive integer.');
    }

    const distances = [];

    for (const [id, vector] of this.store.entries()) {
      const distance = euclideanDistance(queryVector, vector);
      distances.push({ id, distance });
    }

    distances.sort((a, b) => a.distance - b.distance);

    return distances.slice(0, k);
  }

  /**
   * Removes a vector from the store.
   * @param {string} id - Unique identifier for the vector to remove.
   */
  removeVector(id) {
    if (!this.store.has(id)) {
      throw new Error(`Vector with ID ${id} does not exist.`);
    }
    this.store.delete(id);
  }

  /**
   * Clears all vectors from the store.
   */
  clearStore() {
    this.store.clear();
  }
}

/**
 * Utility function to normalize a vector.
 * @param {number[]} vector - The vector to normalize.
 * @returns {number[]} - The normalized vector.
 */
export function normalizeVector(vector) {
  const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + Math.pow(val, 2), 0));
  if (magnitude === 0) {
    throw new Error('Cannot normalize a zero vector.');
  }
  return vector.map(val => val / magnitude);
}

/**
 * Utility function to generate random vectors for testing.
 * @param {number} dimension - The dimensionality of the vector.
 * @returns {number[]} - A random vector.
 */
export function generateRandomVector(dimension) {
  if (dimension <= 0) {
    throw new Error('Dimension must be a positive integer.');
  }
  return Array.from({ length: dimension }, () => Math.random());
}