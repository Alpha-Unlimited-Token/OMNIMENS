/**
 * OMNIMENS Self-Authored Module (Migrated from DB)
 * Original Source: evolution_cycle_1
 * Name: semanticVectorStore
 * Purpose: Enable fast semantic search and contextual retrieval for embeddings.
 * Description: Provides fast semantic search and contextual retrieval for embeddings using cosine similarity and k-nearest neighbors in Node.js.
 * Migrated: 2026-03-25T22:49:34.192Z
 */

// semanticVectorStore.js

/**
 * @module semanticVectorStore
 * @description Provides fast semantic search and contextual retrieval for embeddings using k-nearest neighbors and cosine similarity.
 */

/**
 * Computes the cosine similarity between two vectors.
 * @param {number[]} vectorA - First vector.
 * @param {number[]} vectorB - Second vector.
 * @returns {number} Cosine similarity value between -1 and 1.
 */
function cosineSimilarity(vectorA, vectorB) {
  if (vectorA.length !== vectorB.length) {
    throw new Error("Vectors must be of the same length.");
  }

  const dotProduct = vectorA.reduce((sum, val, idx) => sum + val * vectorB[idx], 0);
  const magnitudeA = Math.sqrt(vectorA.reduce((sum, val) => sum + val * val, 0));
  const magnitudeB = Math.sqrt(vectorB.reduce((sum, val) => sum + val * val, 0));

  if (magnitudeA === 0 || magnitudeB === 0) {
    throw new Error("Vectors must not be zero-length.");
  }

  return dotProduct / (magnitudeA * magnitudeB);
}

/**
 * Finds the k-nearest neighbors to a target vector based on cosine similarity.
 * @param {number[][]} vectors - Array of vectors to search.
 * @param {number[]} targetVector - The vector to find neighbors for.
 * @param {number} k - Number of neighbors to retrieve.
 * @returns {{index: number, similarity: number}[]} Array of k-nearest neighbors with their indices and similarity scores.
 */
function findKNearestNeighbors(vectors, targetVector, k) {
  if (!Array.isArray(vectors) || vectors.length === 0) {
    throw new Error("Vectors array must not be empty.");
  }

  if (k <= 0 || k > vectors.length) {
    throw new Error("Invalid value for k. Must be between 1 and the number of vectors.");
  }

  const similarities = vectors.map((vector, index) => {
    const similarity = cosineSimilarity(vector, targetVector);
    return { index, similarity };
  });

  similarities.sort((a, b) => b.similarity - a.similarity);

  return similarities.slice(0, k);
}

/**
 * Adds a new vector to the store.
 * @param {number[][]} store - The current vector store.
 * @param {number[]} vector - The vector to add.
 * @returns {number[][]} Updated vector store.
 */
function addVectorToStore(store, vector) {
  if (!Array.isArray(vector) || vector.length === 0) {
    throw new Error("Vector must be a non-empty array.");
  }

  store.push(vector);
  return store;
}

/**
 * Creates a new vector store.
 * @returns {number[][]} Empty vector store.
 */
function createVectorStore() {
  return [];
}

export { cosineSimilarity, findKNearestNeighbors, addVectorToStore, createVectorStore };