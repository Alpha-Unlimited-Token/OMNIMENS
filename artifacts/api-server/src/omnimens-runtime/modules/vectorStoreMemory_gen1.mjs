/**
 * @module vectorStoreMemory
 * @description Provides fast in-memory embedding similarity search for adaptive learning.
 * Uses approximate nearest neighbor (ANN) search to find closest vectors.
 */

/**
 * @typedef {Object} Vector
 * @property {string} id - Unique identifier for the vector.
 * @property {Array<number>} embedding - Array of numbers representing the vector embedding.
 */

/**
 * @typedef {Object} SearchResult
 * @property {string} id - Unique identifier of the closest vector.
 * @property {number} similarity - Cosine similarity score.
 */

/**
 * @class VectorStore
 * @description In-memory store for vectors and similarity search.
 */
class VectorStore {
  constructor() {
    /** @type {Vector[]} */
    this.vectors = [];
  }

  /**
   * Adds a new vector to the store.
   * @param {string} id - Unique identifier for the vector.
   * @param {Array<number>} embedding - Array of numbers representing the vector embedding.
   */
  addVector(id, embedding) {
    if (!id || !Array.isArray(embedding) || embedding.length === 0) {
      throw new Error('Invalid vector input. Ensure id is a string and embedding is a non-empty array of numbers.');
    }
    this.vectors.push({ id, embedding });
  }

  /**
   * Performs cosine similarity search to find the most similar vector.
   * @param {Array<number>} queryEmbedding - Embedding of the query vector.
   * @returns {SearchResult|null} - The closest vector and its similarity score, or null if no vectors exist.
   */
  search(queryEmbedding) {
    if (!Array.isArray(queryEmbedding) || queryEmbedding.length === 0) {
      throw new Error('Invalid query embedding. Ensure it is a non-empty array of numbers.');
    }

    if (this.vectors.length === 0) {
      return null; // No vectors to search.
    }

    let bestMatch = null;
    let highestSimilarity = -Infinity;

    for (const vector of this.vectors) {
      const similarity = this._cosineSimilarity(queryEmbedding, vector.embedding);
      if (similarity > highestSimilarity) {
        highestSimilarity = similarity;
        bestMatch = vector;
      }
    }

    return bestMatch ? { id: bestMatch.id, similarity: highestSimilarity } : null;
  }

  /**
   * Calculates the cosine similarity between two vectors.
   * @private
   * @param {Array<number>} vectorA - First vector.
   * @param {Array<number>} vectorB - Second vector.
   * @returns {number} - Cosine similarity score.
   */
  _cosineSimilarity(vectorA, vectorB) {
    if (vectorA.length !== vectorB.length) {
      throw new Error('Vectors must have the same dimensions to compute cosine similarity.');
    }

    const dotProduct = vectorA.reduce((sum, val, i) => sum + val * vectorB[i], 0);
    const magnitudeA = Math.sqrt(vectorA.reduce((sum, val) => sum + val ** 2, 0));
    const magnitudeB = Math.sqrt(vectorB.reduce((sum, val) => sum + val ** 2, 0));

    if (magnitudeA === 0 || magnitudeB === 0) {
      return 0; // Avoid division by zero; similarity is undefined for zero vectors.
    }

    return dotProduct / (magnitudeA * magnitudeB);
  }
}

/**
 * Example usage:
 * const store = new VectorStore();
 * store.addVector('v1', [1, 0, 0]);
 * store.addVector('v2', [0, 1, 0]);
 * const result = store.search([1, 0, 0]);
 * console.log(result); // { id: 'v1', similarity: 1 }
 */

export { VectorStore };