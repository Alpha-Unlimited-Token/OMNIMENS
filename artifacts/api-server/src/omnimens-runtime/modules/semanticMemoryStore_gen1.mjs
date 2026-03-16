/**
 * @module semanticMemoryStore
 * @description A lightweight vector database for semantic search and embedding-based recall using cosine similarity.
 * This module enables efficient nearest-neighbor search for high-dimensional vectors.
 */

/**
 * Stores vectors and their associated metadata for semantic search.
 */
class SemanticMemoryStore {
  constructor() {
    /**
     * @type {Array<{vector: number[], metadata: object}>}
     * @description Array of stored vectors and their metadata.
     */
    this.store = [];
  }

  /**
   * Adds a vector and its metadata to the store.
   * @param {number[]} vector - The embedding vector to store.
   * @param {object} metadata - Associated metadata for the vector.
   * @throws {Error} If the vector is not an array of numbers.
   */
  add(vector, metadata = {}) {
    if (!Array.isArray(vector) || !vector.every((val) => typeof val === 'number')) {
      throw new Error('Vector must be an array of numbers.');
    }
    this.store.push({ vector, metadata });
  }

  /**
   * Searches the store for the nearest neighbors to the query vector.
   * @param {number[]} queryVector - The query vector to search for.
   * @param {number} k - The number of nearest neighbors to return.
   * @returns {Array<{vector: number[], metadata: object, similarity: number}>} The top-k nearest neighbors with similarity scores.
   * @throws {Error} If the query vector is not an array of numbers.
   */
  search(queryVector, k = 1) {
    if (!Array.isArray(queryVector) || !queryVector.every((val) => typeof val === 'number')) {
      throw new Error('Query vector must be an array of numbers.');
    }

    if (this.store.length === 0) {
      return [];
    }

    const results = this.store.map(({ vector, metadata }) => {
      const similarity = this._cosineSimilarity(queryVector, vector);
      return { vector, metadata, similarity };
    });

    return results
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, k);
  }

  /**
   * Computes the cosine similarity between two vectors.
   * @private
   * @param {number[]} vecA - The first vector.
   * @param {number[]} vecB - The second vector.
   * @returns {number} The cosine similarity between the two vectors.
   */
  _cosineSimilarity(vecA, vecB) {
    const dotProduct = vecA.reduce((sum, val, i) => sum + val * (vecB[i] || 0), 0);
    const magnitudeA = Math.sqrt(vecA.reduce((sum, val) => sum + val ** 2, 0));
    const magnitudeB = Math.sqrt(vecB.reduce((sum, val) => sum + val ** 2, 0));

    if (magnitudeA === 0 || magnitudeB === 0) {
      return 0; // Avoid division by zero
    }

    return dotProduct / (magnitudeA * magnitudeB);
  }
}

/**
 * Creates a new SemanticMemoryStore instance.
 * @returns {SemanticMemoryStore} A new instance of SemanticMemoryStore.
 */
export function createSemanticMemoryStore() {
  return new SemanticMemoryStore();
}

/**
 * Calculates the cosine similarity between two vectors.
 * @param {number[]} vecA - The first vector.
 * @param {number[]} vecB - The second vector.
 * @returns {number} The cosine similarity between the two vectors.
 */
export function cosineSimilarity(vecA, vecB) {
  const store = new SemanticMemoryStore();
  return store._cosineSimilarity(vecA, vecB);
}
