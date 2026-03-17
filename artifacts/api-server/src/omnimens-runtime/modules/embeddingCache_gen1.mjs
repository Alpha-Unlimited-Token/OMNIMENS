/**
 * EmbeddingCache Module
 * Provides functionality to store, retrieve, and search semantic embeddings efficiently using cosine similarity.
 * Designed for use in AI systems to improve search and retrieval performance.
 */

/**
 * Calculates the cosine similarity between two vectors.
 * @param {number[]} vectorA - The first vector.
 * @param {number[]} vectorB - The second vector.
 * @returns {number} Cosine similarity score between -1 and 1.
 */
export function cosineSimilarity(vectorA, vectorB) {
  if (vectorA.length !== vectorB.length) {
    throw new Error('Vectors must have the same dimensions.');
  }

  const dotProduct = vectorA.reduce((sum, val, i) => sum + val * vectorB[i], 0);
  const magnitudeA = Math.sqrt(vectorA.reduce((sum, val) => sum + val ** 2, 0));
  const magnitudeB = Math.sqrt(vectorB.reduce((sum, val) => sum + val ** 2, 0));

  if (magnitudeA === 0 || magnitudeB === 0) {
    throw new Error('Vectors must not be zero-vectors.');
  }

  return dotProduct / (magnitudeA * magnitudeB);
}

/**
 * EmbeddingCache class for storing and retrieving embeddings with efficient similarity search.
 */
export class EmbeddingCache {
  constructor() {
    /**
     * Internal storage for embeddings.
     * @type {Map<string, number[]>}
     */
    this.cache = new Map();
  }

  /**
   * Stores an embedding in the cache.
   * @param {string} key - Unique identifier for the embedding.
   * @param {number[]} embedding - The embedding vector to store.
   */
  storeEmbedding(key, embedding) {
    if (!Array.isArray(embedding) || embedding.some(isNaN)) {
      throw new Error('Embedding must be an array of numbers.');
    }
    this.cache.set(key, embedding);
  }

  /**
   * Retrieves an embedding from the cache.
   * @param {string} key - Unique identifier for the embedding.
   * @returns {number[] | undefined} The embedding vector, or undefined if not found.
   */
  retrieveEmbedding(key) {
    return this.cache.get(key);
  }

  /**
   * Finds the most similar embedding in the cache to a given query vector.
   * @param {number[]} queryEmbedding - The query embedding vector.
   * @returns {{ key: string, similarity: number } | null} The most similar embedding's key and similarity score, or null if cache is empty.
   */
  findMostSimilar(queryEmbedding) {
    if (!Array.isArray(queryEmbedding) || queryEmbedding.some(isNaN)) {
      throw new Error('Query embedding must be an array of numbers.');
    }

    let bestMatch = null;
    let highestSimilarity = -Infinity;

    for (const [key, embedding] of this.cache.entries()) {
      const similarity = cosineSimilarity(queryEmbedding, embedding);
      if (similarity > highestSimilarity) {
        highestSimilarity = similarity;
        bestMatch = { key, similarity };
      }
    }

    return bestMatch;
  }

  /**
   * Clears all embeddings from the cache.
   */
  clearCache() {
    this.cache.clear();
  }
}

/**
 * Example usage:
 * const cache = new EmbeddingCache();
 * cache.storeEmbedding('doc1', [0.1, 0.2, 0.3]);
 * cache.storeEmbedding('doc2', [0.4, 0.5, 0.6]);
 * const result = cache.findMostSimilar([0.15, 0.25, 0.35]);
 * console.log(result); // { key: 'doc1', similarity: 0.99 }
 */