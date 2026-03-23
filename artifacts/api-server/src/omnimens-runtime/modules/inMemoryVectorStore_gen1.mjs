/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: inMemoryVectorStore
 * Written: 2026-03-23T21:06:22.737Z
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
 * @description Provides fast semantic search and context retention using in-memory embeddings.
 */

/**
 * @typedef {Object} VectorStore
 * @property {Array<number[]>} vectors - Array of stored vectors.
 * @property {Array<string>} metadata - Metadata associated with each vector.
 */

/**
 * @typedef {Object} SearchResult
 * @property {string} metadata - Metadata of the closest vector.
 * @property {number} similarity - Cosine similarity score.
 */

/**
 * Computes the cosine similarity between two vectors.
 * @param {number[]} vectorA - First vector.
 * @param {number[]} vectorB - Second vector.
 * @returns {number} Cosine similarity score.
 */
function cosineSimilarity(vectorA, vectorB) {
  const dotProduct = vectorA.reduce((sum, value, index) => sum + value * vectorB[index], 0);
  const magnitudeA = Math.sqrt(vectorA.reduce((sum, value) => sum + value ** 2, 0));
  const magnitudeB = Math.sqrt(vectorB.reduce((sum, value) => sum + value ** 2, 0));
  return magnitudeA && magnitudeB ? dotProduct / (magnitudeA * magnitudeB) : 0;
}

/**
 * Creates a new in-memory vector store.
 * @returns {VectorStore} A new vector store object.
 */
function createVectorStore() {
  return {
    vectors: [],
    metadata: []
  };
}

/**
 * Adds a vector and its associated metadata to the store.
 * @param {VectorStore} store - The vector store.
 * @param {number[]} vector - The vector to add.
 * @param {string} metadata - Metadata associated with the vector.
 */
function addVector(store, vector, metadata) {
  if (!Array.isArray(vector) || typeof metadata !== 'string') {
    throw new Error('Invalid input: vector must be an array and metadata must be a string.');
  }
  store.vectors.push(vector);
  store.metadata.push(metadata);
}

/**
 * Searches for the closest vector in the store using cosine similarity.
 * @param {VectorStore} store - The vector store.
 * @param {number[]} queryVector - The query vector.
 * @returns {SearchResult|null} The closest vector's metadata and similarity score, or null if the store is empty.
 */
function searchVector(store, queryVector) {
  if (!Array.isArray(queryVector)) {
    throw new Error('Invalid input: queryVector must be an array.');
  }
  if (store.vectors.length === 0) {
    return null;
  }

  let bestMatch = null;
  let highestSimilarity = -Infinity;

  for (let i = 0; i < store.vectors.length; i++) {
    const similarity = cosineSimilarity(queryVector, store.vectors[i]);
    if (similarity > highestSimilarity) {
      highestSimilarity = similarity;
      bestMatch = store.metadata[i];
    }
  }

  return {
    metadata: bestMatch,
    similarity: highestSimilarity
  };
}

/**
 * Clears all vectors and metadata from the store.
 * @param {VectorStore} store - The vector store.
 */
function clearStore(store) {
  store.vectors.length = 0;
  store.metadata.length = 0;
}

export { createVectorStore, addVector, searchVector, clearStore };