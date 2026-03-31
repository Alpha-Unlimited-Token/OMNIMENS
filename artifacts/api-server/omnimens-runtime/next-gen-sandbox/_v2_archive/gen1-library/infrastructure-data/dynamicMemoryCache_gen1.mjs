/**
 * OMNIMENS Self-Authored Module (Migrated from DB)
 * Original Source: evolution_cycle_1
 * Name: dynamicMemoryCache
 * Purpose: Provide an in-memory caching layer for fast semantic search and dynamic memory augmentation.
 * Description: Provides a fast in-memory caching layer with ANN-based semantic search for OMNIMENS's dynamic memory augmentation.
 * Migrated: 2026-03-25T22:49:34.189Z
 */

/**
 * @module dynamicMemoryCache
 * @description Provides an in-memory caching layer with semantic search capabilities using approximate nearest neighbor (ANN) search.
 * This module is designed for high-performance dynamic memory augmentation in Node.js environments.
 */

/**
 * @typedef {Object} Embedding
 * @property {string} id - Unique identifier for the embedding.
 * @property {number[]} vector - Numerical vector representing the embedding.
 */

/**
 * @typedef {Object} SearchResult
 * @property {string} id - Unique identifier of the closest embedding.
 * @property {number} similarity - Cosine similarity score (0 to 1).
 */

/**
 * Calculates the cosine similarity between two vectors.
 * @param {number[]} vectorA - The first vector.
 * @param {number[]} vectorB - The second vector.
 * @returns {number} Cosine similarity between the two vectors.
 */
function cosineSimilarity(vectorA, vectorB) {
  if (vectorA.length !== vectorB.length) {
    throw new Error("Vectors must have the same length.");
  }

  const dotProduct = vectorA.reduce((sum, val, idx) => sum + val * vectorB[idx], 0);
  const magnitudeA = Math.sqrt(vectorA.reduce((sum, val) => sum + val ** 2, 0));
  const magnitudeB = Math.sqrt(vectorB.reduce((sum, val) => sum + val ** 2, 0));

  if (magnitudeA === 0 || magnitudeB === 0) {
    return 0; // Avoid division by zero
  }

  return dotProduct / (magnitudeA * magnitudeB);
}

/**
 * In-memory storage for embeddings.
 * @type {Map<string, number[]>}
 */
const embeddingStore = new Map();

/**
 * Adds an embedding to the in-memory store.
 * @param {string} id - Unique identifier for the embedding.
 * @param {number[]} vector - Numerical vector representing the embedding.
 */
function addEmbedding(id, vector) {
  if (embeddingStore.has(id)) {
    throw new Error(`Embedding with id '${id}' already exists.`);
  }
  embeddingStore.set(id, vector);
}

/**
 * Searches for the most similar embedding in the store to the given query vector.
 * @param {number[]} queryVector - The query vector.
 * @param {number} [topK=1] - Number of top results to return.
 * @returns {SearchResult[]} Array of search results sorted by similarity in descending order.
 */
function searchEmbeddings(queryVector, topK = 1) {
  if (topK <= 0) {
    throw new Error("topK must be greater than 0.");
  }

  const results = [];

  for (const [id, vector] of embeddingStore.entries()) {
    const similarity = cosineSimilarity(queryVector, vector);
    results.push({ id, similarity });
  }

  results.sort((a, b) => b.similarity - a.similarity);

  return results.slice(0, topK);
}

/**
 * Clears all embeddings from the store.
 */
function clearEmbeddings() {
  embeddingStore.clear();
}

/**
 * Returns the total number of embeddings in the store.
 * @returns {number} The number of embeddings in the store.
 */
function getEmbeddingCount() {
  return embeddingStore.size;
}

export { addEmbedding, searchEmbeddings, clearEmbeddings, getEmbeddingCount };