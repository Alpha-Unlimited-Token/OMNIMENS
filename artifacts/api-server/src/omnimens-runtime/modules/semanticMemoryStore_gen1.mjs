/**
 * @module semanticMemoryStore
 * @description This module provides a semantic memory store for real-time embedding storage, search, and similarity operations.
 * It uses an in-memory vector store for fast indexing and retrieval of high-dimensional embeddings.
 */

/**
 * Internal in-memory store for embeddings and associated metadata.
 * @type {Map<string, { embedding: number[], metadata: any }>}
 */
const memoryStore = new Map();

/**
 * Adds an embedding and associated metadata to the memory store.
 * @param {string} id - Unique identifier for the embedding.
 * @param {number[]} embedding - The high-dimensional vector representation.
 * @param {any} metadata - Additional metadata associated with the embedding.
 * @throws {Error} If the embedding is not a valid array of numbers.
 */
export function addEmbedding(id, embedding, metadata = {}) {
  if (!Array.isArray(embedding) || !embedding.every((x) => typeof x === 'number')) {
    throw new Error('Embedding must be an array of numbers.');
  }
  memoryStore.set(id, { embedding, metadata });
}

/**
 * Computes the cosine similarity between two vectors.
 * @param {number[]} vecA - First vector.
 * @param {number[]} vecB - Second vector.
 * @returns {number} Cosine similarity value between -1 and 1.
 */
function cosineSimilarity(vecA, vecB) {
  const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
  const magnitudeA = Math.sqrt(vecA.reduce((sum, a) => sum + a ** 2, 0));
  const magnitudeB = Math.sqrt(vecB.reduce((sum, b) => sum + b ** 2, 0));
  return magnitudeA && magnitudeB ? dotProduct / (magnitudeA * magnitudeB) : 0;
}

/**
 * Searches for the most similar embeddings in the memory store.
 * @param {number[]} queryEmbedding - The query embedding vector.
 * @param {number} topK - Number of top results to return (default: 5).
 * @returns {Array<{ id: string, similarity: number, metadata: any }>} Array of topK results sorted by similarity.
 */
export function searchSimilar(queryEmbedding, topK = 5) {
  if (!Array.isArray(queryEmbedding) || !queryEmbedding.every((x) => typeof x === 'number')) {
    throw new Error('Query embedding must be an array of numbers.');
  }

  const results = [];

  for (const [id, { embedding, metadata }] of memoryStore.entries()) {
    const similarity = cosineSimilarity(queryEmbedding, embedding);
    results.push({ id, similarity, metadata });
  }

  return results
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, topK);
}

/**
 * Clears all embeddings from the memory store.
 */
export function clearMemoryStore() {
  memoryStore.clear();
}

/**
 * Retrieves the current size of the memory store.
 * @returns {number} The number of embeddings stored.
 */
export function getMemoryStoreSize() {
  return memoryStore.size;
}

/**
 * Retrieves metadata for a specific embedding by ID.
 * @param {string} id - The unique identifier of the embedding.
 * @returns {any|null} The metadata associated with the embedding, or null if not found.
 */
export function getMetadataById(id) {
  const entry = memoryStore.get(id);
  return entry ? entry.metadata : null;
}