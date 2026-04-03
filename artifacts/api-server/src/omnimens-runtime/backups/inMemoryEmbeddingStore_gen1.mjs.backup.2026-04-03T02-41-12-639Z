/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: inMemoryEmbeddingStore
 * Written: 2026-03-23T04:30:34.423Z
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
 * @module inMemoryEmbeddingStore
 * @description A runtime in-memory store for embeddings with fast cosine similarity search.
 */

/**
 * Computes the cosine similarity between two vectors.
 * @param {number[]} vectorA - The first vector.
 * @param {number[]} vectorB - The second vector.
 * @returns {number} - The cosine similarity value.
 * @throws {Error} - If vectors have different lengths or are empty.
 */
function cosineSimilarity(vectorA, vectorB) {
  if (vectorA.length !== vectorB.length || vectorA.length === 0) {
    throw new Error("Vectors must have the same non-zero length.");
  }

  const dotProduct = vectorA.reduce((sum, val, index) => sum + val * vectorB[index], 0);
  const magnitudeA = Math.sqrt(vectorA.reduce((sum, val) => sum + val * val, 0));
  const magnitudeB = Math.sqrt(vectorB.reduce((sum, val) => sum + val * val, 0));

  if (magnitudeA === 0 || magnitudeB === 0) {
    throw new Error("Vectors must not be zero vectors.");
  }

  return dotProduct / (magnitudeA * magnitudeB);
}

/**
 * A class representing an in-memory embedding store.
 */
class InMemoryEmbeddingStore {
  constructor() {
    /**
     * Internal storage for embeddings.
     * @type {Map<string, number[]>}
     */
    this.store = new Map();
  }

  /**
   * Adds an embedding to the store.
   * @param {string} key - The unique identifier for the embedding.
   * @param {number[]} embedding - The embedding vector.
   * @throws {Error} - If the key already exists or the embedding is invalid.
   */
  addEmbedding(key, embedding) {
    if (this.store.has(key)) {
      throw new Error(`Key '${key}' already exists in the store.`);
    }

    if (!Array.isArray(embedding) || embedding.length === 0 || !embedding.every(val => typeof val === 'number')) {
      throw new Error("Embedding must be a non-empty array of numbers.");
    }

    this.store.set(key, embedding);
  }

  /**
   * Searches for the most similar embeddings based on cosine similarity.
   * @param {number[]} queryEmbedding - The query embedding vector.
   * @param {number} topN - The number of top similar embeddings to return.
   * @returns {Array<{key, similarity}>} - An array of top similar embeddings.
   * @throws {Error} - If the query embedding is invalid or topN is not a positive integer.
   */
  search(queryEmbedding, topN = 1) {
    if (!Array.isArray(queryEmbedding) || queryEmbedding.length === 0 || !queryEmbedding.every(val => typeof val === 'number')) {
      throw new Error("Query embedding must be a non-empty array of numbers.");
    }

    if (!Number.isInteger(topN) || topN <= 0) {
      throw new Error("topN must be a positive integer.");
    }

    const similarities = [];

    for (const [key, embedding] of this.store.entries()) {
      try {
        const similarity = cosineSimilarity(queryEmbedding, embedding);
        similarities.push({ key, similarity });
      } catch (error) {
        // Skip invalid embeddings silently
        continue;
      }
    }

    return similarities
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, topN);
  }

  /**
   * Clears all embeddings from the store.
   */
  clearStore() {
    this.store.clear();
  }
}

/**
 * Exports the module functions and class.
 */
export { cosineSimilarity, InMemoryEmbeddingStore };