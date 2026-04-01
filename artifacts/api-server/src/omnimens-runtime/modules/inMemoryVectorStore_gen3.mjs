/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: inMemoryVectorStore
 * Written: 2026-04-01T22:13:28.104Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// Complete ES module code here

import { createHash } from 'crypto';

/**
 * Generates a unique hash for a given embedding vector.
 * Useful for indexing and retrieval.
 * @param {Float64Array} vector - The embedding vector.
 * @returns {string} - A unique hash string.
 */
export function generateVectorHash(vector) {
  const hash = createHash('sha256');
  vector.forEach(val => hash.update(Buffer.from(Float64Array.of(val).buffer)));
  return hash.digest('hex');
}

/**
 * Stores embeddings in shared memory for fast retrieval.
 * @type {Map<string, Float64Array>} - A memory-based key-value store.
 */
const inMemoryStore = new Map();

/**
 * Adds an embedding vector to the in-memory store.
 * @param {string} id - Unique identifier for the embedding.
 * @param {Float64Array} vector - The embedding vector.
 */
export function addEmbedding(id, vector) {
  if (!(vector instanceof Float64Array)) {
    throw new TypeError('Embedding must be a Float64Array');
  }
  inMemoryStore.set(id, vector);
}

/**
 * Retrieves an embedding vector by its unique identifier.
 * @param {string} id - Unique identifier for the embedding.
 * @returns {Float64Array | null} - The embedding vector, or null if not found.
 */
export function getEmbedding(id) {
  return inMemoryStore.get(id) || null;
}

/**
 * Finds the closest embedding in the store using cosine similarity.
 * @param {Float64Array} queryVector - The query embedding vector.
 * @returns {{ id, similarity} | null} - Closest embedding ID and similarity score, or null if store is empty.
 */
export function findClosestEmbedding(queryVector) {
  if (!(queryVector instanceof Float64Array)) {
    throw new TypeError('Query vector must be a Float64Array');
  }

  let closest = null;
  let highestSimilarity = -Infinity;

  for (const [id, storedVector] of inMemoryStore.entries()) {
    const similarity = cosineSimilarity(queryVector, storedVector);
    if (similarity > highestSimilarity) {
      highestSimilarity = similarity;
      closest = { id, similarity };
    }
  }

  return closest;
}

/**
 * Computes cosine similarity between two embedding vectors.
 * @param {Float64Array} vectorA - First embedding vector.
 * @param {Float64Array} vectorB - Second embedding vector.
 * @returns {number} - Cosine similarity score.
 */
export function cosineSimilarity(vectorA, vectorB) {
  if (vectorA.length !== vectorB.length) {
    throw new Error('Vectors must have the same length');
  }

  let dotProduct = 0;
  let magnitudeA = 0;
  let magnitudeB = 0;

  for (let i = 0; i < vectorA.length; i++) {
    dotProduct += vectorA[i] * vectorB[i];
    magnitudeA += vectorA[i] ** 2;
    magnitudeB += vectorB[i] ** 2;
  }

  magnitudeA = Math.sqrt(magnitudeA);
  magnitudeB = Math.sqrt(magnitudeB);

  return dotProduct / (magnitudeA * magnitudeB);
}

/**
 * Clears all embeddings from the in-memory store.
 */
export function clearStore() {
  inMemoryStore.clear();
}

/**
 * Retrieves all stored embedding IDs.
 * @returns {string[]} - Array of all embedding IDs.
 */
export function listEmbeddingIDs() {
  return Array.from(inMemoryStore.keys());
}
