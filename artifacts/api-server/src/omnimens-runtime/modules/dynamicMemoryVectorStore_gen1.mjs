/**
 * OMNIMENS Self-Authored Module (Migrated from DB)
 * Original Source: evolution_cycle_2
 * Name: dynamicMemoryVectorStore
 * Purpose: Enable fast retrieval and reasoning over embeddings in-memory.
 * Description: An in-memory vector embedding store for fast retrieval and reasoning, enabling OMNIMENS to evolve its intelligence dynamically.
 * Migrated: 2026-03-20T14:56:48.217Z
 */

/**
 * @module dynamicMemoryVectorStore
 * @description A utility module for storing, retrieving, and reasoning over vector embeddings in-memory
 * using efficient indexing via Node.js Map.
 */

/**
 * VectorStore class
 * @class
 * @description Provides methods to store, retrieve, and query vector embeddings efficiently.
 */
class VectorStore {
  constructor() {
    /**
     * @private
     * @type {Map<string, { vector: number[], metadata: object }>}
     * @description Internal storage for vector embeddings indexed by unique keys.
     */
    this.store = new Map();
  }

  /**
   * Adds a vector embedding to the store.
   * @param {string} key - Unique identifier for the vector.
   * @param {number[]} vector - Array representing the vector embedding.
   * @param {object} metadata - Additional metadata associated with the vector.
   * @throws {Error} Throws an error if the key already exists.
   */
  addVector(key, vector, metadata = {}) {
    if (this.store.has(key)) {
      throw new Error(`Key '${key}' already exists in the store.`);
    }
    if (!Array.isArray(vector) || vector.some(v => typeof v !== 'number')) {
      throw new Error('Vector must be an array of numbers.');
    }
    this.store.set(key, { vector, metadata });
  }

  /**
   * Retrieves a vector embedding and its metadata by key.
   * @param {string} key - Unique identifier for the vector.
   * @returns {{ vector: number[], metadata: object }} The vector embedding and associated metadata.
   * @throws {Error} Throws an error if the key does not exist.
   */
  getVector(key) {
    if (!this.store.has(key)) {
      throw new Error(`Key '${key}' not found in the store.`);
    }
    return this.store.get(key);
  }

  /**
   * Finds the closest vector(s) to a given query vector using cosine similarity.
   * @param {number[]} queryVector - The query vector to compare against.
   * @param {number} topN - Number of closest vectors to retrieve (default is 1).
   * @returns {Array<{ key: string, similarity: number, vector: number[], metadata: object }>} Closest vectors sorted by similarity.
   * @throws {Error} Throws an error if the query vector is invalid.
   */
  findClosest(queryVector, topN = 1) {
    if (!Array.isArray(queryVector) || queryVector.some(v => typeof v !== 'number')) {
      throw new Error('Query vector must be an array of numbers.');
    }

    const cosineSimilarity = (vecA, vecB) => {
      const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
      const magnitudeA = Math.sqrt(vecA.reduce((sum, a) => sum + a ** 2, 0));
      const magnitudeB = Math.sqrt(vecB.reduce((sum, b) => sum + b ** 2, 0));
      return dotProduct / (magnitudeA * magnitudeB);
    };

    const results = [];

    for (const [key, { vector, metadata }] of this.store.entries()) {
      const similarity = cosineSimilarity(queryVector, vector);
      results.push({ key, similarity, vector, metadata });
    }

    return results
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, topN);
  }

  /**
   * Removes a vector embedding from the store by key.
   * @param {string} key - Unique identifier for the vector.
   * @returns {boolean} True if the vector was successfully removed, false otherwise.
   */
  removeVector(key) {
    return this.store.delete(key);
  }

  /**
   * Clears all vector embeddings from the store.
   */
  clearStore() {
    this.store.clear();
  }
}

/**
 * @function createVectorStore
 * @description Factory function to create a new instance of VectorStore.
 * @returns {VectorStore} A new VectorStore instance.
 */
function createVectorStore() {
  return new VectorStore();
}

export { createVectorStore };