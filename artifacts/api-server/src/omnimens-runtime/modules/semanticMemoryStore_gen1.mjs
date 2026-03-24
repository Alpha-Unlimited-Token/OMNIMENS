/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: semanticMemoryStore
 * Written: 2026-03-23T21:56:43.885Z
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
 * @description Implements an in-memory vector store for fast semantic search and retrieval using cosine similarity.
 */

/**
 * Calculates the cosine similarity between two vectors.
 * @param {number[]} vectorA - The first vector.
 * @param {number[]} vectorB - The second vector.
 * @returns {number} - The cosine similarity score between vectorA and vectorB.
 */
function cosineSimilarity(vectorA, vectorB) {
  if (vectorA.length !== vectorB.length) {
    throw new Error("Vectors must have the same length.");
  }

  const dotProduct = vectorA.reduce((sum, val, idx) => sum + val * vectorB[idx], 0);
  const magnitudeA = Math.sqrt(vectorA.reduce((sum, val) => sum + val ** 2, 0));
  const magnitudeB = Math.sqrt(vectorB.reduce((sum, val) => sum + val ** 2, 0));

  if (magnitudeA === 0 || magnitudeB === 0) {
    return 0; // Avoid division by zero; treat similarity.
  }

  return dotProduct / (magnitudeA * magnitudeB);
}

/**
 * Creates a semantic memory store for fast vector-based search.
 * @returns {object} - An object with methods to add, search, and retrieve vectors.
 */
function createSemanticMemoryStore() {
  const store = new Map();

  /**
   * Adds a vector with an associated key to the store.
   * @param {string} key - The unique identifier for the vector.
   * @param {number[]} vector - The vector to store.
   */
  function addVector(key, vector) {
    if (!Array.isArray(vector) || vector.some(isNaN)) {
      throw new Error("Vector must be an array of numbers.");
    }
    store.set(key, vector);
  }

  /**
   * Searches the store for the most similar vectors to the query vector.
   * @param {number[]} queryVector - The vector to search for.
   * @param {number} topK - The number of top results to return.
   * @returns {Array<{key, similarity}>} - An array of objects containing keys and similarity scores.
   */
  function search(queryVector, topK = 5) {
    if (!Array.isArray(queryVector) || queryVector.some(isNaN)) {
      throw new Error("Query vector must be an array of numbers.");
    }

    const results = [];

    for (const [key, vector] of store.entries()) {
      const similarity = cosineSimilarity(queryVector, vector);
      results.push({ key, similarity });
    }

    results.sort((a, b) => b.similarity - a.similarity);
    return results.slice(0, topK);
  }

  /**
   * Retrieves a vector by its key.
   * @param {string} key - The key of the vector to retrieve.
   * @returns {number[] | undefined} - The vector associated with the key, or undefined if not found.
   */
  function getVector(key) {
    return store.get(key);
  }

  return { addVector, search, getVector };
}

export { cosineSimilarity, createSemanticMemoryStore };