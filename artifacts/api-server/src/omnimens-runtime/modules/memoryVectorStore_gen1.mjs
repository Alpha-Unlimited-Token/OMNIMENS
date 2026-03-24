/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: memoryVectorStore
 * Written: 2026-03-23T23:13:32.150Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// memoryVectorStore.js

/**
 * @module memoryVectorStore
 * @description Provides a fast, in-memory vector store for temporary state handling and reasoning.
 * Implements efficient indexing and retrieval mechanisms for embedding storage.
 */

/**
 * @typedef {Object} VectorEntry
 * @property {string} id - Unique identifier for the vector.
 * @property {number[]} vector - The numerical vector representation.
 */

/**
 * @class MemoryVectorStore
 * @description A class to manage in-memory vector storage and retrieval.
 */
class MemoryVectorStore {
  constructor() {
    /**
     * @* @type {Map<string, VectorEntry>}
     * @description Internal store for vectors, using a Map for efficient indexing.
     */
    this.store = new Map();
  }

  /**
   * Adds a vector to the store.
   * @param {string} id - Unique identifier for the vector.
   * @param {number[]} vector - Numerical vector to store.
   * @throws {Error} If the vector is not an array of numbers.
   */
  addVector(id, vector) {
    if (!Array.isArray(vector) || !vector.every((v) => typeof v === 'number')) {
      throw new Error('Vector must be an array of numbers.');
    }
    this.store.set(id, { id, vector });
  }

  /**
   * Retrieves a vector by its ID.
   * @param {string} id - Unique identifier for the vector.
   * @returns {VectorEntry | null} The vector entry if found, or null if not.
   */
  getVector(id) {
    return this.store.get(id) || null;
  }

  /**
   * Finds the closest vector to a given query vector using cosine similarity.
   * @param {number[]} queryVector - The query vector.
   * @returns {VectorEntry | null} The closest vector entry, or null if the store is empty.
   */
  findClosestVector(queryVector) {
    if (!Array.isArray(queryVector) || !queryVector.every((v) => typeof v === 'number')) {
      throw new Error('Query vector must be an array of numbers.');
    }

    let closestEntry = null;
    let highestSimilarity = -Infinity;

    for (const entry of this.store.values()) {
      const similarity = this._cosineSimilarity(queryVector, entry.vector);
      if (similarity > highestSimilarity) {
        highestSimilarity = similarity;
        closestEntry = entry;
      }
    }

    return closestEntry;
  }

  /**
   * Clears all vectors from the store.
   */
  clearStore() {
    this.store.clear();
  }

  /**
   * Computes the cosine similarity between two vectors.
   * @* @param {number[]} vectorA - First vector.
   * @param {number[]} vectorB - Second vector.
   * @returns {number} The cosine similarity value.
   */
  _cosineSimilarity(vectorA, vectorB) {
    const dotProduct = vectorA.reduce((sum, val, idx) => sum + val * (vectorB[idx] || 0), 0);
    const magnitudeA = Math.sqrt(vectorA.reduce((sum, val) => sum + val * val, 0));
    const magnitudeB = Math.sqrt(vectorB.reduce((sum, val) => sum + val * val, 0));

    if (magnitudeA === 0 || magnitudeB === 0) {
      return 0; // Avoid division by zero
    }

    return dotProduct / (magnitudeA * magnitudeB);
  }
}

/**
 * Creates a new instance of MemoryVectorStore.
 * @returns {MemoryVectorStore} A new MemoryVectorStore instance.
 */
function createMemoryVectorStore() {
  return new MemoryVectorStore();
}

export { createMemoryVectorStore };