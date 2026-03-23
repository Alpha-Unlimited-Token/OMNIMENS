/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: memoryVectorStore
 * Written: 2026-03-23T07:39:36.698Z
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
 * @description Provides an in-memory embedding index for fast retrieval and reasoning using KNN search over embeddings stored in JavaScript arrays.
 */

/**
 * Calculates the Euclidean distance between two vectors.
 * @param {number[]} vectorA - The first vector.
 * @param {number[]} vectorB - The second vector.
 * @returns {number} The Euclidean distance.
 */
function euclideanDistance(vectorA, vectorB) {
  if (vectorA.length !== vectorB.length) {
    throw new Error("Vectors must have the same length.");
  }
  return Math.sqrt(vectorA.reduce((sum, value, index) => sum + Math.pow(value - vectorB[index], 2), 0));
}

/**
 * A class representing an in-memory vector store.
 */
class MemoryVectorStore {
  constructor() {
    /**
     * @type {Array<{id: string, embedding: number[]}>}
     * @description Stores the embeddings and their associated IDs.
     */
    this.store = [];
  }

  /**
   * Adds a new embedding to the store.
   * @param {string} id - A unique identifier for the embedding.
   * @param {number[]} embedding - The embedding vector.
   */
  add(id, embedding) {
    if (typeof id !== "string" || !Array.isArray(embedding)) {
      throw new Error("Invalid input: id must be a string and embedding must be an array.");
    }
    this.store.push({ id, embedding });
  }

  /**
   * Finds the k-nearest neighbors to a given query embedding.
   * @param {number[]} queryEmbedding - The query embedding vector.
   * @param {number} k - The number of neighbors to retrieve.
   * @returns {Array<{id: string, distance: number}>} The k-nearest neighbors sorted by distance.
   */
  knnSearch(queryEmbedding, k) {
    if (!Array.isArray(queryEmbedding) || typeof k !== "number" || k <= 0) {
      throw new Error("Invalid input: queryEmbedding must be an array and k must be a positive number.");
    }

    const distances = this.store.map(({ id, embedding }) => ({
      id,
      distance: euclideanDistance(queryEmbedding, embedding)
    }));

    return distances
      .sort((a, b) => a.distance - b.distance)
      .slice(0, k);
  }

  /**
   * Clears all embeddings from the store.
   */
  clear() {
    this.store = [];
  }
}

/**
 * Exports the MemoryVectorStore class and the euclideanDistance function.
 */
export { MemoryVectorStore, euclideanDistance };