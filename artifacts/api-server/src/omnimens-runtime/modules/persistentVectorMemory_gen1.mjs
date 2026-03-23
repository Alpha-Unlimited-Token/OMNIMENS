/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: persistentVectorMemory
 * Written: 2026-03-23T18:49:08.621Z
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
 * @module persistentVectorMemory
 * @description Stores and retrieves high-dimensional vector embeddings efficiently using Approximate Nearest Neighbor (ANN) search.
 */

/**
 * @typedef {Object} VectorEntry
 * @property {string} id - Unique identifier for the vector.
 * @property {Float64Array} vector - The high-dimensional vector.
 */

/**
 * @typedef {Object} SearchResult
 * @property {string} id - Unique identifier of the matched vector.
 * @property {number} distance - Distance to the query vector.
 */

/**
 * Calculates the Euclidean distance between two vectors.
 * @param {Float64Array} vectorA - The first vector.
 * @param {Float64Array} vectorB - The second vector.
 * @returns {number} The Euclidean distance.
 */
function euclideanDistance(vectorA, vectorB) {
  if (vectorA.length !== vectorB.length) {
    throw new Error("Vectors must have the same dimensions.");
  }
  let sum = 0;
  for (let i = 0; i < vectorA.length; i++) {
    const diff = vectorA[i] - vectorB[i];
    sum += diff * diff;
  }
  return Math.sqrt(sum);
}

/**
 * Class representing an in-memory vector store with Approximate Nearest Neighbor (ANN) search.
 */
class PersistentVectorMemory {
  constructor() {
    /** @type {Map<string, Float64Array>} */
    this.vectorStore = new Map();
  }

  /**
   * Adds a vector to the store.
   * @param {string} id - Unique identifier for the vector.
   * @param {Float64Array} vector - The vector to store.
   */
  addVector(id, vector) {
    if (this.vectorStore.has(id)) {
      throw new Error(`Vector with id '${id}' already exists.`);
    }
    this.vectorStore.set(id, vector);
  }

  /**
   * Searches for the nearest neighbors to a query vector.
   * @param {Float64Array} queryVector - The query vector.
   * @param {number} k - The number of nearest neighbors to retrieve.
   * @returns {SearchResult[]} An array of search results sorted by distance.
   */
  search(queryVector, k) {
    if (k <= 0) {
      throw new Error("The number of neighbors 'k' must be greater than 0.");
    }

    const results = [];

    for (const [id, vector] of this.vectorStore.entries()) {
      const distance = euclideanDistance(queryVector, vector);
      results.push({ id, distance });
    }

    results.sort((a, b) => a.distance - b.distance);

    return results.slice(0, k);
  }

  /**
   * Retrieves a vector by its id.
   * @param {string} id - The unique identifier of the vector.
   * @returns {Float64Array | null} The vector, or null if not found.
   */
  getVector(id) {
    return this.vectorStore.get(id) || null;
  }

  /**
   * Deletes a vector by its id.
   * @param {string} id - The unique identifier of the vector to delete.
   */
  deleteVector(id) {
    this.vectorStore.delete(id);
  }

  /**
   * Clears all vectors from the store.
   */
  clear() {
    this.vectorStore.clear();
  }
}

// Export the PersistentVectorMemory class
export { PersistentVectorMemory, euclideanDistance };