/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: inMemoryVectorStore
 * Written: 2026-03-22T17:22:26.348Z
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
 * @description A module for storing and retrieving vector embeddings for similarity searches using cosine similarity.
 * Implements an efficient in-memory storage and search mechanism.
 */

/**
 * Computes the cosine similarity between two vectors.
 * @param {number[]} vectorA - The first vector.
 * @param {number[]} vectorB - The second vector.
 * @returns {number} The cosine similarity between the two vectors.
 * @throws {Error} If vectors are not of the same length or are empty.
 */
export function cosineSimilarity(vectorA, vectorB) {
  if (vectorA.length !== vectorB.length || vectorA.length === 0) {
    throw new Error("Vectors must be of the same length and non-empty.");
  }

  const dotProduct = vectorA.reduce((sum, a, i) => sum + a * vectorB[i], 0);
  const magnitudeA = Math.sqrt(vectorA.reduce((sum, a) => sum + a ** 2, 0));
  const magnitudeB = Math.sqrt(vectorB.reduce((sum, b) => sum + b ** 2, 0));

  if (magnitudeA === 0 || magnitudeB === 0) {
    throw new Error("Vectors must not have zero magnitude.");
  }

  return dotProduct / (magnitudeA * magnitudeB);
}

/**
 * Class representing an in-memory vector store.
 */
export class InMemoryVectorStore {
  /**
   * Initializes the vector store.
   */
  constructor() {
    this.store = new Map();
  }

  /**
   * Adds a vector to the store.
   * @param {string} key - The unique identifier for the vector.
   * @param {number[]} vector - The vector to store.
   * @throws {Error} If the key already exists or the vector is invalid.
   */
  addVector(key, vector) {
    if (this.store.has(key)) {
      throw new Error("Key already exists in the store.");
    }
    if (!Array.isArray(vector) || vector.length === 0 || !vector.every(Number.isFinite)) {
      throw new Error("Invalid vector. Must be a non-empty array of numbers.");
    }
    this.store.set(key, vector);
  }

  /**
   * Removes a vector from the store.
   * @param {string} key - The unique identifier for the vector to remove.
   * @returns {boolean} True if the vector was removed, false if it did not exist.
   */
  removeVector(key) {
    return this.store.delete(key);
  }

  /**
   * Finds the most similar vectors to a given query vector.
   * @param {number[]} queryVector - The query vector.
   * @param {number} topK - The number of top similar vectors to retrieve.
   * @returns {Array<{key: string, similarity: number}>} An array of objects containing keys and similarity scores.
   * @throws {Error} If the query vector is invalid or topK is not a positive integer.
   */
  findMostSimilar(queryVector, topK = 1) {
    if (!Array.isArray(queryVector) || queryVector.length === 0 || !queryVector.every(Number.isFinite)) {
      throw new Error("Invalid query vector. Must be a non-empty array of numbers.");
    }
    if (!Number.isInteger(topK) || topK <= 0) {
      throw new Error("topK must be a positive integer.");
    }

    const similarities = [];

    for (const [key, vector] of this.store.entries()) {
      const similarity = cosineSimilarity(queryVector, vector);
      similarities.push({ key, similarity });
    }

    similarities.sort((a, b) => b.similarity - a.similarity);
    return similarities.slice(0, topK);
  }

  /**
   * Clears all vectors from the store.
   */
  clear() {
    this.store.clear();
  }
}

/**
 * Example usage of the InMemoryVectorStore.
 * Uncomment the lines below to test the functionality.
 */
// const store = new InMemoryVectorStore();
// store.addVector("vec1", [1, 2, 3]);
// store.addVector("vec2", [4, 5, 6]);
// store.addVector("vec3", [7, 8, 9]);
// console.log(store.findMostSimilar([1, 2, 3], 2));
