/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: vectorStoreInMemory
 * Written: 2026-03-21T16:24:11.404Z
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
 * @module vectorStoreInMemory
 * @description A utility module for storing and retrieving vectors/embeddings using cosine similarity and k-nearest neighbor search.
 */

/**
 * In-memory store for vectors and their associated metadata.
 * @type {Map<string, {vector: number[], metadata: any}>}
 */
const vectorStore = new Map();

/**
 * Adds a vector to the in-memory store.
 * @param {string} id - Unique identifier for the vector.
 * @param {number[]} vector - The vector to store.
 * @param {any} metadata - Optional metadata associated with the vector.
 * @throws {Error} If the vector is not a valid array of numbers.
 */
export function addVector(id, vector, metadata = null) {
  if (!Array.isArray(vector) || !vector.every((num) => typeof num === 'number')) {
    throw new Error('Vector must be an array of numbers.');
  }
  vectorStore.set(id, { vector, metadata });
}

/**
 * Computes the cosine similarity between two vectors.
 * @param {number[]} vecA - First vector.
 * @param {number[]} vecB - Second vector.
 * @returns {number} Cosine similarity value between -1 and 1.
 * @throws {Error} If vectors are not of the same length.
 */
export function cosineSimilarity(vecA, vecB) {
  if (vecA.length !== vecB.length) {
    throw new Error('Vectors must be of the same length.');
  }
  const dotProduct = vecA.reduce((sum, val, idx) => sum + val * vecB[idx], 0);
  const magnitudeA = Math.sqrt(vecA.reduce((sum, val) => sum + val ** 2, 0));
  const magnitudeB = Math.sqrt(vecB.reduce((sum, val) => sum + val ** 2, 0));
  return dotProduct / (magnitudeA * magnitudeB || 1); // Avoid division by zero
}

/**
 * Finds the k-nearest vectors to a given query vector based on cosine similarity.
 * @param {number[]} queryVector - The query vector.
 * @param {number} k - Number of nearest neighbors to retrieve.
 * @returns {Array<{id: string, similarity: number, metadata: any}>} Array of nearest neighbors with their similarity scores and metadata.
 * @throws {Error} If the query vector is not a valid array of numbers.
 */
export function findNearestNeighbors(queryVector, k) {
  if (!Array.isArray(queryVector) || !queryVector.every((num) => typeof num === 'number')) {
    throw new Error('Query vector must be an array of numbers.');
  }
  if (k <= 0) {
    return [];
  }
  const similarities = [];
  for (const [id, { vector, metadata }] of vectorStore.entries()) {
    const similarity = cosineSimilarity(queryVector, vector);
    similarities.push({ id, similarity, metadata });
  }
  similarities.sort((a, b) => b.similarity - a.similarity); // Sort by descending similarity
  return similarities.slice(0, k);
}

/**
 * Removes a vector from the store by its ID.
 * @param {string} id - The ID of the vector to remove.
 * @returns {boolean} True if the vector was removed, false if it did not exist.
 */
export function removeVector(id) {
  return vectorStore.delete(id);
}

/**
 * Clears all vectors from the store.
 */
export function clearStore() {
  vectorStore.clear();
}

/**
 * Retrieves metadata of a vector by its ID.
 * @param {string} id - The ID of the vector.
 * @returns {any|null} Metadata associated with the vector, or null if not found.
 */
export function getMetadata(id) {
  const entry = vectorStore.get(id);
  return entry ? entry.metadata : null;
}

/**
 * Retrieves the number of vectors currently stored.
 * @returns {number} The count of stored vectors.
 */
export function getVectorCount() {
  return vectorStore.size;
}