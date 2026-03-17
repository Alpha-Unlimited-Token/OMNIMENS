/**
 * @module semanticMemoryStore
 * @description Provides an in-memory vectorized embedding storage and retrieval system for semantic search.
 * This module is designed to integrate with vector search libraries like Faiss through a Node.js wrapper.
 */

/**
 * A class representing an in-memory vectorized embedding store.
 * It enables fast storage, retrieval, and similarity search for semantic embeddings.
 */
class SemanticMemoryStore {
  constructor() {
    /**
     * @private
     * @type {Map<string, Float32Array>}
     * A map to store embeddings with their associated keys.
     */
    this.store = new Map();
  }

  /**
   * Adds an embedding to the store.
   * @param {string} key - The unique identifier for the embedding.
   * @param {Float32Array} embedding - The vectorized embedding to store.
   * @throws {Error} If the key already exists or the embedding is invalid.
   */
  addEmbedding(key, embedding) {
    if (this.store.has(key)) {
      throw new Error(`Key '${key}' already exists in the store.`);
    }
    if (!(embedding instanceof Float32Array)) {
      throw new Error('Embedding must be a Float32Array.');
    }
    this.store.set(key, embedding);
  }

  /**
   * Retrieves an embedding from the store by its key.
   * @param {string} key - The unique identifier for the embedding.
   * @returns {Float32Array|null} The embedding if found, or null if not.
   */
  getEmbedding(key) {
    return this.store.get(key) || null;
  }

  /**
   * Finds the most similar embedding in the store to a given query embedding.
   * Uses cosine similarity as the similarity metric.
   * @param {Float32Array} queryEmbedding - The query embedding.
   * @returns {{ key: string, similarity: number } | null} The most similar embedding's key and similarity score, or null if the store is empty.
   */
  findMostSimilar(queryEmbedding) {
    if (!(queryEmbedding instanceof Float32Array)) {
      throw new Error('Query embedding must be a Float32Array.');
    }
    if (this.store.size === 0) {
      return null;
    }

    let mostSimilar = null;
    let highestSimilarity = -Infinity;

    for (const [key, embedding] of this.store.entries()) {
      const similarity = this._cosineSimilarity(queryEmbedding, embedding);
      if (similarity > highestSimilarity) {
        highestSimilarity = similarity;
        mostSimilar = { key, similarity };
      }
    }

    return mostSimilar;
  }

  /**
   * Calculates the cosine similarity between two embeddings.
   * @private
   * @param {Float32Array} a - The first embedding.
   * @param {Float32Array} b - The second embedding.
   * @returns {number} The cosine similarity score.
   */
  _cosineSimilarity(a, b) {
    if (a.length !== b.length) {
      throw new Error('Embeddings must have the same dimensionality.');
    }

    let dotProduct = 0;
    let magnitudeA = 0;
    let magnitudeB = 0;

    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      magnitudeA += a[i] ** 2;
      magnitudeB += b[i] ** 2;
    }

    magnitudeA = Math.sqrt(magnitudeA);
    magnitudeB = Math.sqrt(magnitudeB);

    return magnitudeA === 0 || magnitudeB === 0 ? 0 : dotProduct / (magnitudeA * magnitudeB);
  }
}

/**
 * Exports an instance of the SemanticMemoryStore class.
 * @type {SemanticMemoryStore}
 */
export const semanticMemoryStore = new SemanticMemoryStore();