/**
 * OMNIMENS Self-Authored Module (Migrated from DB)
 * Original Source: evolution_cycle_1
 * Name: semanticMemoryCache
 * Purpose: Store and retrieve embeddings in-memory for fast semantic search.
 * Description: Provides in-memory semantic embedding storage and fast retrieval using cosine similarity for OMNIMENS's reasoning and search capabilities.
 * Migrated: 2026-03-25T22:49:34.187Z
 */

/**
 * @module semanticMemoryCache
 * @description Provides an in-memory cache for storing and retrieving semantic embeddings with cosine similarity search.
 */

/**
 * @typedef {Object} Embedding
 * @property {string} id - Unique identifier for the embedding.
 * @property {number[]} vector - The embedding vector.
 */

/**
 * @typedef {Object} SearchResult
 * @property {string} id - Identifier of the closest embedding.
 * @property {number} similarity - Cosine similarity score.
 */

const cache = new Map();

/**
 * Computes the cosine similarity between two vectors.
 * @param {number[]} vectorA - The first vector.
 * @param {number[]} vectorB - The second vector.
 * @returns {number} Cosine similarity between the two vectors.
 */
function cosineSimilarity(vectorA, vectorB) {
  const dotProduct = vectorA.reduce((sum, a, i) => sum + a * vectorB[i], 0);
  const magnitudeA = Math.sqrt(vectorA.reduce((sum, a) => sum + a * a, 0));
  const magnitudeB = Math.sqrt(vectorB.reduce((sum, b) => sum + b * b, 0));
  if (magnitudeA === 0 || magnitudeB === 0) return 0;
  return dotProduct / (magnitudeA * magnitudeB);
}

/**
 * Adds an embedding to the in-memory cache.
 * @param {string} id - Unique identifier for the embedding.
 * @param {number[]} vector - The embedding vector.
 */
export function addEmbedding(id, vector) {
  if (!id || !Array.isArray(vector) || vector.length === 0) {
    throw new Error("Invalid embedding: id must be a string and vector must be a non-empty array.");
  }
  cache.set(id, vector);
}

/**
 * Retrieves the most similar embedding from the cache based on cosine similarity.
 * @param {number[]} queryVector - The query vector to compare against.
 * @returns {SearchResult|null} The closest embedding and its similarity score, or null if the cache is empty.
 */
export function getMostSimilar(queryVector) {
  if (!Array.isArray(queryVector) || queryVector.length === 0) {
    throw new Error("Invalid query vector: must be a non-empty array.");
  }

  let bestMatch = null;
  let highestSimilarity = -Infinity;

  for (const [id, vector] of cache.entries()) {
    const similarity = cosineSimilarity(queryVector, vector);
    if (similarity > highestSimilarity) {
      highestSimilarity = similarity;
      bestMatch = { id, similarity };
    }
  }

  return bestMatch;
}

/**
 * Clears all embeddings from the cache.
 */
export function clearCache() {
  cache.clear();
}

/**
 * Returns the total number of embeddings in the cache.
 * @returns {number} The number of embeddings stored in the cache.
 */
export function getCacheSize() {
  return cache.size;
}