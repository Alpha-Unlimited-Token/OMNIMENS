/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: vectorMemoryManager
 * Written: 2026-03-22T19:26:33.525Z
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
 * @module vectorMemoryManager
 * @description Provides fast similarity search and context retrieval using an in-memory vector database.
 * Implements approximate nearest neighbor search with pure JavaScript.
 */

/**
 * Calculates the Euclidean distance between two vectors.
 * @param {number[]} vectorA - First vector.
 * @param {number[]} vectorB - Second vector.
 * @returns {number} The Euclidean distance between the two vectors.
 */
function euclideanDistance(vectorA, vectorB) {
  if (vectorA.length !== vectorB.length) {
    throw new Error("Vectors must be of the same dimension.");
  }

  return Math.sqrt(vectorA.reduce((sum, val, i) => sum + Math.pow(val - vectorB[i], 2), 0));
}

/**
 * Builds an in-memory vector index for approximate nearest neighbor search.
 * @class
 */
class VectorMemoryManager {
  constructor() {
    /** @type {Map<string, number[]>} */
    this.vectorStore = new Map();
  }

  /**
   * Adds a vector to the in-memory database.
   * @param {string} id - Unique identifier for the vector.
   * @param {number[]} vector - The vector to be stored.
   */
  addVector(id, vector) {
    if (this.vectorStore.has(id)) {
      throw new Error(`Vector with id '${id}' already exists.`);
    }

    this.vectorStore.set(id, vector);
  }

  /**
   * Searches for the closest vectors to a given query vector.
   * @param {number[]} queryVector - The vector to search for.
   * @param {number} k - The number of nearest neighbors to retrieve.
   * @returns {Array<{ id: string, distance: number }>} An array of nearest neighbors with their distances.
   */
  search(queryVector, k) {
    if (k <= 0) {
      throw new Error("Parameter 'k' must be greater than 0.");
    }

    const results = Array.from(this.vectorStore.entries())
      .map(([id, vector]) => ({ id, distance: euclideanDistance(queryVector, vector) }))
      .sort((a, b) => a.distance - b.distance)
      .slice(0, k);

    return results;
  }

  /**
   * Retrieves a vector by its ID.
   * @param {string} id - The unique identifier of the vector.
   * @returns {number[] | null} The vector if found, or null if not found.
   */
  getVector(id) {
    return this.vectorStore.get(id) || null;
  }

  /**
   * Removes a vector by its ID.
   * @param {string} id - The unique identifier of the vector to remove.
   */
  removeVector(id) {
    if (!this.vectorStore.has(id)) {
      throw new Error(`Vector with id '${id}' does not exist.`);
    }

    this.vectorStore.delete(id);
  }

  /**
   * Clears all vectors from the in-memory database.
   */
  clear() {
    this.vectorStore.clear();
  }
}

// Export the VectorMemoryManager class
export { VectorMemoryManager };