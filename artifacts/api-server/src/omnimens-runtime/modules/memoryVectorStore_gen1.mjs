/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: memoryVectorStore
 * Written: 2026-03-22T09:19:01.402Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

/**
 * @module memoryVectorStore
 * @description A utility module to store and retrieve high-dimensional embeddings in-memory for fast context recall using k-nearest neighbor search.
 */

/**
 * Calculates the Euclidean distance between two vectors.
 * @param {number[]} vectorA - The first vector.
 * @param {number[]} vectorB - The second vector.
 * @returns {number} The Euclidean distance between the two vectors.
 * @throws {Error} If the vectors are not of the same length.
 */
function euclideanDistance(vectorA, vectorB) {
  if (vectorA.length !== vectorB.length) {
    throw new Error("Vectors must have the same length.");
  }
  return Math.sqrt(vectorA.reduce((sum, val, i) => sum + Math.pow(val - vectorB[i], 2), 0));
}

/**
 * A class representing an in-memory vector store with k-nearest neighbor search.
 */
class MemoryVectorStore {
  constructor() {
    /**
     * @private
     * @type {{ id: string, vector: number[] }[]}
     * @description Stores vectors along with their unique IDs.
     */
    this.store = [];
  }

  /**
   * Adds a vector to the store.
   * @param {string} id - A unique identifier for the vector.
   * @param {number[]} vector - The high-dimensional vector to store.
   */
  addVector(id, vector) {
    if (!Array.isArray(vector) || vector.some(isNaN)) {
      throw new Error("Vector must be an array of numbers.");
    }
    this.store.push({ id, vector });
  }

  /**
   * Finds the k-nearest neighbors to a given query vector.
   * @param {number[]} queryVector - The vector to search for neighbors.
   * @param {number} k - The number of nearest neighbors to retrieve.
   * @returns {{ id: string, distance: number }[]} The k-nearest neighbors with their distances.
   * @throws {Error} If k is not a positive integer or the query vector is invalid.
   */
  findNearestNeighbors(queryVector, k) {
    if (!Array.isArray(queryVector) || queryVector.some(isNaN)) {
      throw new Error("Query vector must be an array of numbers.");
    }
    if (!Number.isInteger(k) || k <= 0) {
      throw new Error("Parameter 'k' must be a positive integer.");
    }

    // Calculate distances to all stored vectors.
    const distances = this.store.map(({ id, vector }) => ({
      id,
      distance: euclideanDistance(queryVector, vector)
    }));

    // Sort by distance and return the top k results.
    return distances
      .sort((a, b) => a.distance - b.distance)
      .slice(0, k);
  }

  /**
   * Clears all vectors from the store.
   */
  clearStore() {
    this.store = [];
  }

  /**
   * Returns the number of vectors currently stored.
   * @returns {number} The count of stored vectors.
   */
  vectorCount() {
    return this.store.length;
  }
}

export { MemoryVectorStore, euclideanDistance };