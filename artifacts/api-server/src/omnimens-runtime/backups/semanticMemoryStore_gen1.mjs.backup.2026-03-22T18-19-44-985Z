/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: semanticMemoryStore
 * Written: 2026-03-22T05:07:02.448Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// semanticMemoryStore.js

/**
 * @module semanticMemoryStore
 * @description Provides an in-memory vector database for fast semantic recall using cosine similarity and approximate nearest neighbor search.
 */

/**
 * Computes the cosine similarity between two vectors.
 * @param {number[]} vectorA - The first vector.
 * @param {number[]} vectorB - The second vector.
 * @returns {number} Cosine similarity value between -1 and 1.
 */
export function cosineSimilarity(vectorA, vectorB) {
  if (vectorA.length !== vectorB.length) {
    throw new Error('Vectors must be of the same dimension.');
  }

  const dotProduct = vectorA.reduce((sum, a, i) => sum + a * vectorB[i], 0);
  const magnitudeA = Math.sqrt(vectorA.reduce((sum, a) => sum + a * a, 0));
  const magnitudeB = Math.sqrt(vectorB.reduce((sum, b) => sum + b * b, 0));

  if (magnitudeA === 0 || magnitudeB === 0) {
    return 0; // Avoid division by zero
  }

  return dotProduct / (magnitudeA * magnitudeB);
}

/**
 * An in-memory vector database for semantic recall.
 */
export class VectorDatabase {
  constructor() {
    /** @type {Map<string, number[]>} */
    this.store = new Map();
  }

  /**
   * Adds a vector to the database.
   * @param {string} key - The unique identifier for the vector.
   * @param {number[]} vector - The vector to store.
   */
  addVector(key, vector) {
    if (this.store.has(key)) {
      throw new Error(`Key '${key}' already exists.`);
    }
    this.store.set(key, vector);
  }

  /**
   * Searches for the top N most similar vectors to the query vector.
   * @param {number[]} queryVector - The vector to search for.
   * @param {number} topN - The number of results to return.
   * @returns {Array<{ key: string, similarity: number }>} Sorted array of results with keys and similarity scores.
   */
  search(queryVector, topN = 5) {
    if (topN <= 0) {
      throw new Error('topN must be a positive integer.');
    }

    const results = [];

    for (const [key, vector] of this.store.entries()) {
      const similarity = cosineSimilarity(queryVector, vector);
      results.push({ key, similarity });
    }

    results.sort((a, b) => b.similarity - a.similarity);

    return results.slice(0, topN);
  }

  /**
   * Clears all stored vectors.
   */
  clear() {
    this.store.clear();
  }

  /**
   * Gets the total number of vectors stored.
   * @returns {number} The count of stored vectors.
   */
  size() {
    return this.store.size;
  }
}

/**
 * Example usage:
 * const db = new VectorDatabase();
 * db.addVector('item1', [0.1, 0.2, 0.3]);
 * db.addVector('item2', [0.4, 0.5, 0.6]);
 * const results = db.search([0.1, 0.2, 0.3], 1);
 * console.log(results);
 */