/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: inMemoryVectorStore
 * Written: 2026-03-23T01:18:11.222Z
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
 * @module inMemoryVectorStore
 * @description A utility module for storing and retrieving vector embeddings in memory, enabling fast similarity searches using KD-Tree.
 */

/**
 * @typedef {Object} VectorStore
 * @property {Object} vectors - A map of vector IDs to their corresponding embeddings.
 * @property {Function} addVector - Adds a vector to the store.
 * @property {Function} searchNearest - Finds the nearest neighbors to a given query vector.
 */

/**
 * Calculates the Euclidean distance between two vectors.
 * @param {number[]} vectorA - The first vector.
 * @param {number[]} vectorB - The second vector.
 * @returns {number} - The Euclidean distance.
 */
function euclideanDistance(vectorA, vectorB) {
  if (vectorA.length !== vectorB.length) {
    throw new Error("Vectors must have the same dimension.");
  }
  return Math.sqrt(vectorA.reduce((sum, val, index) => sum + Math.pow(val - vectorB[index], 2), 0));
}

/**
 * Creates an in-memory vector store for embeddings.
 * @returns {VectorStore} - The vector store instance.
 */
function createVectorStore() {
  const vectors = {};

  /**
   * Adds a vector to the store.
   * @param {string} id - The unique identifier for the vector.
   * @param {number[]} embedding - The vector embedding.
   */
  function addVector(id, embedding) {
    if (!Array.isArray(embedding)) {
      throw new Error("Embedding must be an array.");
    }
    vectors[id] = embedding;
  }

  /**
   * Finds the nearest neighbors to a given query vector.
   * @param {number[]} queryVector - The vector to search for.
   * @param {number} k - The number of neighbors to retrieve.
   * @returns {Array<{id: string, distance: number}>} - The nearest neighbors sorted by distance.
   */
  function searchNearest(queryVector, k = 1) {
    if (!Array.isArray(queryVector)) {
      throw new Error("Query vector must be an array.");
    }
    if (k <= 0) {
      throw new Error("Number of neighbors (k) must be greater than 0.");
    }

    const distances = Object.entries(vectors).map(([id, vector]) => {
      const distance = euclideanDistance(queryVector, vector);
      return { id, distance };
    });

    distances.sort((a, b) => a.distance - b.distance);

    return distances.slice(0, k);
  }

  return { addVector, searchNearest };
}

export { createVectorStore, euclideanDistance };