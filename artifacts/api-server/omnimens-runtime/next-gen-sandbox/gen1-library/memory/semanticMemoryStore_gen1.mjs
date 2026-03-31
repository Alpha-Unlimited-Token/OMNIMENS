/**
 * OMNIMENS Self-Authored Module (Migrated from DB)
 * Original Source: evolution_cycle_1
 * Name: semanticMemoryStore
 * Purpose: Implements an in-memory vector store for fast semantic search and retrieval.
 * Description: Implements an in-memory vector store for fast semantic search using cosine similarity, enabling OMNIMENS to retrieve context intelligently.
 * Migrated: 2026-03-25T22:49:34.159Z
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
    return 0; // Avoid division by zero; treat as no similarity.
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
   * @returns {Array<{key: string, similarity: number}>} - An array of objects containing keys and similarity scores.
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