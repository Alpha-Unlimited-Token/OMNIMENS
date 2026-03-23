/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: vectorMemoryStore
 * Written: 2026-03-23T15:02:31.684Z
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
 * @module vectorMemoryStore
 * @description A pure JavaScript module for storing and querying high-dimensional vector embeddings efficiently.
 * This module uses a custom implementation of a k-Nearest Neighbors (k-NN) search algorithm with cosine similarity.
 */

/**
 * Stores vectors and their associated metadata.
 * @type {Map<string, {vector: number[], metadata: any}>}
 */
const vectorStore = new Map();

/**
 * Adds a vector and its metadata to the store.
 * @param {string} id - A unique identifier for the vector.
 * @param {number[]} vector - The high-dimensional vector to store.
 * @param {any} metadata - Optional metadata associated with the vector.
 * @throws {Error} If the vector is not an array of numbers.
 */
export function addVector(id, vector, metadata = null) {
  if (!Array.isArray(vector) || !vector.every((v) => typeof v === 'number')) {
    throw new Error('Vector must be an array of numbers.');
  }
  vectorStore.set(id, { vector, metadata });
}

/**
 * Computes the cosine similarity between two vectors.
 * @param {number[]} vectorA - The first vector.
 * @param {number[]} vectorB - The second vector.
 * @returns {number} The cosine similarity between the two vectors.
 * @throws {Error} If the vectors are not of the same length.
 */
function cosineSimilarity(vectorA, vectorB) {
  if (vectorA.length !== vectorB.length) {
    throw new Error('Vectors must have the same length.');
  }
  const dotProduct = vectorA.reduce((sum, a, i) => sum + a * vectorB[i], 0);
  const magnitudeA = Math.sqrt(vectorA.reduce((sum, a) => sum + a ** 2, 0));
  const magnitudeB = Math.sqrt(vectorB.reduce((sum, b) => sum + b ** 2, 0));
  return dotProduct / (magnitudeA * magnitudeB);
}

/**
 * Finds the k most similar vectors to a given query vector.
 * @param {number[]} queryVector - The vector to search for.
 * @param {number} k - The number of nearest neighbors to retrieve.
 * @returns {Array<{id: string, similarity: number, metadata: any}>} The top k most similar vectors with their metadata.
 * @throws {Error} If k is not a positive integer or the query vector is invalid.
 */
export function findNearestNeighbors(queryVector, k) {
  if (!Array.isArray(queryVector) || !queryVector.every((v) => typeof v === 'number')) {
    throw new Error('Query vector must be an array of numbers.');
  }
  if (!Number.isInteger(k) || k <= 0) {
    throw new Error('k must be a positive integer.');
  }

  const similarities = [];

  for (const [id, { vector, metadata }] of vectorStore.entries()) {
    const similarity = cosineSimilarity(queryVector, vector);
    similarities.push({ id, similarity, metadata });
  }

  return similarities
    .sort((a, b) => b.similarity - a.similarity) // Sort by descending similarity
    .slice(0, k); // Return the top k results
}

/**
 * Clears all vectors from the store.
 */
export function clearStore() {
  vectorStore.clear();
}

/**
 * Gets the current size of the vector store.
 * @returns {number} The number of vectors stored.
 */
export function getStoreSize() {
  return vectorStore.size;
}
