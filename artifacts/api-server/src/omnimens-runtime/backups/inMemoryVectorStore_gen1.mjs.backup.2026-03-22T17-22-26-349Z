/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: inMemoryVectorStore
 * Written: 2026-03-22T15:07:16.703Z
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
 * @module inMemoryVectorStore
 * @description Provides fast semantic search and similarity lookups using approximate nearest neighbor (ANN) search with cosine similarity.
 */

/**
 * Represents an in-memory vector store for efficient similarity search.
 */
export class InMemoryVectorStore {
  constructor() {
    /**
     * @private
     * @type {Map<string, number[]>}
     * Stores vectors with unique keys.
     */
    this.vectorMap = new Map();
  }

  /**
   * Adds a vector to the store.
   * @param {string} key - Unique identifier for the vector.
   * @param {number[]} vector - The vector to store.
   * @throws {Error} If the vector is not an array of numbers.
   */
  addVector(key, vector) {
    if (!Array.isArray(vector) || !vector.every((val) => typeof val === "number")) {
      throw new Error("Vector must be an array of numbers.");
    }
    this.vectorMap.set(key, vector);
  }

  /**
   * Computes the cosine similarity between two vectors.
   * @private
   * @param {number[]} vecA - First vector.
   * @param {number[]} vecB - Second vector.
   * @returns {number} Cosine similarity value between -1 and 1.
   */
  _cosineSimilarity(vecA, vecB) {
    const dotProduct = vecA.reduce((sum, val, i) => sum + val * vecB[i], 0);
    const magnitudeA = Math.sqrt(vecA.reduce((sum, val) => sum + val ** 2, 0));
    const magnitudeB = Math.sqrt(vecB.reduce((sum, val) => sum + val ** 2, 0));
    return dotProduct / (magnitudeA * magnitudeB || 1); // Avoid division by zero
  }

  /**
   * Finds the top N most similar vectors to the query vector.
   * @param {number[]} queryVector - The vector to compare against.
   * @param {number} topN - Number of top results to return.
   * @returns {Array<{key: string, similarity: number}>} Sorted array of top N results.
   * @throws {Error} If the query vector is not an array of numbers.
   */
  search(queryVector, topN) {
    if (!Array.isArray(queryVector) || !queryVector.every((val) => typeof val === "number")) {
      throw new Error("Query vector must be an array of numbers.");
    }

    const results = [];

    for (const [key, vector] of this.vectorMap.entries()) {
      const similarity = this._cosineSimilarity(queryVector, vector);
      results.push({ key, similarity });
    }

    // Sort by similarity in descending order and return top N results
    return results
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, topN);
  }

  /**
   * Removes a vector from the store.
   * @param {string} key - Unique identifier for the vector to remove.
   * @returns {boolean} True if the vector was removed, false otherwise.
   */
  removeVector(key) {
    return this.vectorMap.delete(key);
  }

  /**
   * Clears all vectors from the store.
   */
  clearStore() {
    this.vectorMap.clear();
  }
}

/**
 * Utility function to normalize a vector.
 * @param {number[]} vector - The vector to normalize.
 * @returns {number[]} Normalized vector.
 * @throws {Error} If the vector is not an array of numbers.
 */
export function normalizeVector(vector) {
  if (!Array.isArray(vector) || !vector.every((val) => typeof val === "number")) {
    throw new Error("Vector must be an array of numbers.");
  }

  const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val ** 2, 0));
  return vector.map((val) => val / (magnitude || 1)); // Avoid division by zero
}

/**
 * Utility function to generate a random vector of a given dimension.
 * @param {number} dimension - The dimension of the vector.
 * @returns {number[]} Randomly generated vector.
 * @throws {Error} If the dimension is not a positive integer.
 */
export function generateRandomVector(dimension) {
  if (!Number.isInteger(dimension) || dimension <= 0) {
    throw new Error("Dimension must be a positive integer.");
  }

  return Array.from({ length: dimension }, () => Math.random() * 2 - 1); // Random values between -1 and 1
}