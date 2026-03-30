/**
 * OMNIMENS Self-Authored Module (Migrated from DB)
 * Original Source: evolution_cycle_1
 * Name: embeddingMemoryStore
 * Purpose: Enable fast similarity searches and dynamic reasoning with embeddings.
 * Description: A Redis-free, JavaScript-based embedding memory store enabling fast similarity searches and reasoning for OMNIMENS.
 * Migrated: 2026-03-25T22:49:34.210Z
 */

// embeddingMemoryStore.js

/**
 * @module embeddingMemoryStore
 * @description A utility for storing, retrieving, and performing similarity searches on vector embeddings using cosine similarity.
 */

/**
 * Computes the cosine similarity between two vectors.
 * @param {number[]} vectorA - The first vector.
 * @param {number[]} vectorB - The second vector.
 * @returns {number} The cosine similarity between the two vectors.
 * @throws {Error} If the vectors are not the same length or are empty.
 */
export function cosineSimilarity(vectorA, vectorB) {
  if (vectorA.length !== vectorB.length || vectorA.length === 0) {
    throw new Error("Vectors must be non-empty and of the same length.");
  }

  const dotProduct = vectorA.reduce((sum, a, i) => sum + a * vectorB[i], 0);
  const magnitudeA = Math.sqrt(vectorA.reduce((sum, a) => sum + a * a, 0));
  const magnitudeB = Math.sqrt(vectorB.reduce((sum, b) => sum + b * b, 0));

  if (magnitudeA === 0 || magnitudeB === 0) {
    throw new Error("Vectors must not be zero-length.");
  }

  return dotProduct / (magnitudeA * magnitudeB);
}

/**
 * Class representing the embedding memory store.
 */
export class EmbeddingMemoryStore {
  constructor() {
    /** @type {Map<string, number[]>} */
    this.store = new Map();
  }

  /**
   * Adds an embedding to the store.
   * @param {string} key - The unique identifier for the embedding.
   * @param {number[]} embedding - The embedding vector.
   * @throws {Error} If the key already exists or the embedding is invalid.
   */
  addEmbedding(key, embedding) {
    if (this.store.has(key)) {
      throw new Error(`Key '${key}' already exists in the store.`);
    }
    if (!Array.isArray(embedding) || embedding.length === 0) {
      throw new Error("Embedding must be a non-empty array of numbers.");
    }
    this.store.set(key, embedding);
  }

  /**
   * Searches for the top N most similar embeddings to the given query vector.
   * @param {number[]} query - The query embedding vector.
   * @param {number} topN - The number of top results to return.
   * @returns {Array<{key: string, similarity: number}>} The top N most similar embeddings.
   * @throws {Error} If the query is invalid or topN is not a positive integer.
   */
  search(query, topN) {
    if (!Array.isArray(query) || query.length === 0) {
      throw new Error("Query must be a non-empty array of numbers.");
    }
    if (!Number.isInteger(topN) || topN <= 0) {
      throw new Error("topN must be a positive integer.");
    }

    const results = [];

    for (const [key, embedding] of this.store.entries()) {
      if (embedding.length !== query.length) {
        throw new Error(`Embedding for key '${key}' has a different dimensionality than the query.`);
      }
      const similarity = cosineSimilarity(query, embedding);
      results.push({ key, similarity });
    }

    return results
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, topN);
  }

  /**
   * Clears all embeddings from the store.
   */
  clear() {
    this.store.clear();
  }

  /**
   * Returns the number of embeddings in the store.
   * @returns {number} The number of embeddings in the store.
   */
  size() {
    return this.store.size;
  }
}

/**
 * Example usage:
 * const store = new EmbeddingMemoryStore();
 * store.addEmbedding("key1", [1, 2, 3]);
 * store.addEmbedding("key2", [4, 5, 6]);
 * const results = store.search([1, 2, 3], 1);
 * console.log(results);
 */