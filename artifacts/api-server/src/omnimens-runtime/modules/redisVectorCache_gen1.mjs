/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: redisVectorCache
 * Written: 2026-03-23T20:45:46.410Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// redisVectorCache.js

/**
 * Provides an in-memory store for embeddings and transient vector data using Redis-like structures.
 * Supports exact key-based retrieval and approximate nearest neighbor (ANN) search using cosine similarity.
 */

/**
 * Internal store for vectors, mimicking Redis-like key-value behavior.
 * @type {Map<string, number[]>}
 */
const vectorStore = new Map();

/**
 * Adds a vector to the store.
 * @param {string} key - The unique identifier for the vector.
 * @param {number[]} vector - The vector to store (must be an array of numbers).
 * @throws {Error} If the key is not a string or the vector is not a valid array of numbers.
 */
export function addVector(key, vector) {
  if (typeof key !== 'string') {
    throw new Error('Key must be a string.');
  }
  if (!Array.isArray(vector) || !vector.every(num => typeof num === 'number')) {
    throw new Error('Vector must be an array of numbers.');
  }
  vectorStore.set(key, vector);
}

/**
 * Retrieves a vector by its key.
 * @param {string} key - The key of the vector to retrieve.
 * @returns {number[] | null} The vector if found, or null if the key does not exist.
 */
export function getVector(key) {
  return vectorStore.get(key) || null;
}

/**
 * Deletes a vector by its key.
 * @param {string} key - The key of the vector to delete.
 * @returns {boolean} True if the vector was deleted, false if the key does not exist.
 */
export function deleteVector(key) {
  return vectorStore.delete(key);
}

/**
 * Calculates the cosine similarity between two vectors.
 * @param {number[]} vectorA - The first vector.
 * @param {number[]} vectorB - The second vector.
 * @returns {number} The cosine similarity, ranging from -1 (opposite) to 1 (identical).
 * @throws {Error} If the vectors are not the same length or contain invalid values.
 */
function cosineSimilarity(vectorA, vectorB) {
  if (vectorA.length !== vectorB.length) {
    throw new Error('Vectors must be of the same length.');
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
 * Finds the nearest neighbors to a given query vector.
 * @param {number[]} queryVector - The vector to compare against.
 * @param {number} topK - The number of nearest neighbors to retrieve.
 * @returns {Array<{ key, similarity}>} An array of nearest neighbors sorted by similarity (descending).
 * @throws {Error} If the query vector is invalid or topK is not a positive integer.
 */
export function findNearestNeighbors(queryVector, topK) {
  if (!Array.isArray(queryVector) || !queryVector.every(num => typeof num === 'number')) {
    throw new Error('Query vector must be an array of numbers.');
  }
  if (!Number.isInteger(topK) || topK <= 0) {
    throw new Error('topK must be a positive integer.');
  }

  const similarities = [];
  for (const [key, vector] of vectorStore.entries()) {
    const similarity = cosineSimilarity(queryVector, vector);
    similarities.push({ key, similarity });
  }

  return similarities
    .sort((a, b) => b.similarity - a.similarity) // Sort by similarity descending
    .slice(0, topK); // Return top K results
}

/**
 * Clears all vectors from the store.
 */
export function clearStore() {
  vectorStore.clear();
}

/**
 * Returns the current size of the vector store.
 * @returns {number} The number of vectors in the store.
 */
export function getStoreSize() {
  return vectorStore.size;
}