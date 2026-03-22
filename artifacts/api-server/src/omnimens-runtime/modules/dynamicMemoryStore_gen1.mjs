/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: dynamicMemoryStore
 * Written: 2026-03-22T20:08:57.847Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// Complete ES module code here, starting with /** JSDoc */ and exports

/**
 * @module dynamicMemoryStore
 * @description An in-memory vector store for fast retrieval using approximate nearest neighbor search.
 * This module uses Redis-like structures and pure algorithms for managing and querying vector embeddings.
 */

/**
 * Generates a unique identifier for stored vectors.
 * @returns {string} A unique ID string.
 */
function generateUniqueId() {
  return crypto.randomUUID();
}

/**
 * Calculates the Euclidean distance between two vectors.
 * @param {number[]} vectorA - The first vector.
 * @param {number[]} vectorB - The second vector.
 * @returns {number} The Euclidean distance between the vectors.
 */
function calculateDistance(vectorA, vectorB) {
  if (vectorA.length !== vectorB.length) {
    throw new Error("Vectors must have the same dimensions.");
  }
  return Math.sqrt(vectorA.reduce((sum, val, idx) => sum + Math.pow(val - vectorB[idx], 2), 0));
}

/**
 * Class representing the dynamic memory store.
 */
class DynamicMemoryStore {
  constructor() {
    /**
     * @type {Map<string, { vector: number[], metadata: any }>}
     * Stores vectors with associated metadata.
     */
    this.store = new Map();
  }

  /**
   * Adds a vector to the store.
   * @param {number[]} vector - The vector to store.
   * @param {any} metadata - Additional metadata associated with the vector.
   * @returns {string} The unique ID of the stored vector.
   */
  addVector(vector, metadata = null) {
    const id = generateUniqueId();
    this.store.set(id, { vector, metadata });
    return id;
  }

  /**
   * Performs an approximate nearest neighbor search.
   * @param {number[]} queryVector - The query vector.
   * @param {number} k - The number of nearest neighbors to retrieve.
   * @returns {Array<{ id: string, distance: number, metadata: any }>} The k nearest neighbors.
   */
  search(queryVector, k = 1) {
    if (k <= 0) {
      throw new Error("k must be a positive integer.");
    }

    const distances = [];

    for (const [id, { vector, metadata }] of this.store.entries()) {
      const distance = calculateDistance(queryVector, vector);
      distances.push({ id, distance, metadata });
    }

    return distances
      .sort((a, b) => a.distance - b.distance)
      .slice(0, k);
  }

  /**
   * Removes a vector from the store by its ID.
   * @param {string} id - The unique ID of the vector to remove.
   * @returns {boolean} True if the vector was removed, false otherwise.
   */
  removeVector(id) {
    return this.store.delete(id);
  }

  /**
   * Clears all vectors from the store.
   */
  clearStore() {
    this.store.clear();
  }

  /**
   * Returns the total number of vectors in the store.
   * @returns {number} The number of vectors in the store.
   */
  getSize() {
    return this.store.size;
  }
}

// Export the module
export {
  DynamicMemoryStore
};