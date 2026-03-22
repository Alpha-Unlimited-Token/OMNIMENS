/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: embeddingCacheManager
 * Written: 2026-03-22T18:33:25.408Z
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
 * @module embeddingCacheManager
 * @description Provides in-memory caching and nearest-neighbor search for high-dimensional embeddings.
 * This module is designed for fast contextual access to embeddings, leveraging cosine similarity for nearest-neighbor search.
 */

/**
 * @typedef {Object} Embedding
 * @property {string} id - Unique identifier for the embedding.
 * @property {number[]} vector - High-dimensional vector representing the embedding.
 */

/**
 * @class EmbeddingCacheManager
 * @description Manages storage and retrieval of embeddings with nearest-neighbor search.
 */
class EmbeddingCacheManager {
  constructor() {
    /**
     * @private
     * @type {Map<string, number[]>}
     * @description Internal storage for embeddings, keyed by their unique ID.
     */
    this.cache = new Map();
  }

  /**
   * Adds an embedding to the cache.
   * @param {string} id - Unique identifier for the embedding.
   * @param {number[]} vector - High-dimensional vector representing the embedding.
   * @throws {Error} If the vector is not an array of numbers.
   */
  addEmbedding(id, vector) {
    if (!Array.isArray(vector) || !vector.every((x) => typeof x === 'number')) {
      throw new Error('Vector must be an array of numbers.');
    }
    this.cache.set(id, vector);
  }

  /**
   * Retrieves an embedding by its ID.
   * @param {string} id - Unique identifier for the embedding.
   * @returns {number[] | null} The embedding vector, or null if not found.
   */
  getEmbedding(id) {
    return this.cache.get(id) || null;
  }

  /**
   * Calculates the cosine similarity between two vectors.
   * @param {number[]} vectorA - First vector.
   * @param {number[]} vectorB - Second vector.
   * @returns {number} Cosine similarity between the two vectors.
   * @throws {Error} If the vectors are not of the same length.
   */
  static cosineSimilarity(vectorA, vectorB) {
    if (vectorA.length !== vectorB.length) {
      throw new Error('Vectors must be of the same length.');
    }

    const dotProduct = vectorA.reduce((sum, a, i) => sum + a * vectorB[i], 0);
    const magnitudeA = Math.sqrt(vectorA.reduce((sum, a) => sum + a ** 2, 0));
    const magnitudeB = Math.sqrt(vectorB.reduce((sum, b) => sum + b ** 2, 0));

    return magnitudeA && magnitudeB ? dotProduct / (magnitudeA * magnitudeB) : 0;
  }

  /**
   * Finds the nearest embedding to a given vector based on cosine similarity.
   * @param {number[]} queryVector - The query vector.
   * @param {number} [topK=1] - Number of nearest neighbors to return.
   * @returns {Array<{id: string, similarity: number}>} An array of nearest neighbors with their IDs and similarities.
   * @throws {Error} If the query vector is not valid.
   */
  findNearestNeighbors(queryVector, topK = 1) {
    if (!Array.isArray(queryVector) || !queryVector.every((x) => typeof x === 'number')) {
      throw new Error('Query vector must be an array of numbers.');
    }

    const similarities = [];

    for (const [id, vector] of this.cache.entries()) {
      const similarity = EmbeddingCacheManager.cosineSimilarity(queryVector, vector);
      similarities.push({ id, similarity });
    }

    return similarities
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, topK);
  }

  /**
   * Clears the cache.
   */
  clearCache() {
    this.cache.clear();
  }
}

export default EmbeddingCacheManager;