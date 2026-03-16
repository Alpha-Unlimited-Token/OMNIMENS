/**
 * @module vectorStoreInMemory
 * @description Enables semantic search and embedding similarity lookups in memory using FAISS-like nearest neighbor search.
 * 
 * This module implements a vector store in memory for efficient similarity search operations. It uses a simple brute-force nearest neighbor algorithm optimized for small-scale datasets.
 */

/**
 * Represents the in-memory vector store.
 */
class VectorStore {
  constructor() {
    /**
     * @type {Array<{ id: string, vector: Float32Array }>} - Stores vectors with unique identifiers.
     */
    this.store = [];
  }

  /**
   * Adds a vector to the store.
   * @param {string} id - Unique identifier for the vector.
   * @param {Float32Array} vector - The vector to add.
   * @throws {Error} If the ID already exists in the store.
   */
  addVector(id, vector) {
    if (this.store.some(entry => entry.id === id)) {
      throw new Error(`Vector with ID '${id}' already exists in the store.`);
    }
    this.store.push({ id, vector });
  }

  /**
   * Finds the nearest neighbors to the given query vector.
   * @param {Float32Array} queryVector - The vector to search for.
   * @param {number} k - Number of nearest neighbors to retrieve.
   * @returns {Array<{ id: string, similarity: number }>} - The nearest neighbors sorted by similarity.
   */
  findNearestNeighbors(queryVector, k) {
    if (this.store.length === 0) {
      return [];
    }

    const neighbors = this.store.map(entry => {
      const similarity = this._cosineSimilarity(queryVector, entry.vector);
      return { id: entry.id, similarity };
    });

    return neighbors
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, k);
  }

  /**
   * Computes the cosine similarity between two vectors.
   * @param {Float32Array} vecA - First vector.
   * @param {Float32Array} vecB - Second vector.
   * @returns {number} - The cosine similarity.
   */
  _cosineSimilarity(vecA, vecB) {
    const dotProduct = vecA.reduce((sum, val, i) => sum + val * vecB[i], 0);
    const magnitudeA = Math.sqrt(vecA.reduce((sum, val) => sum + val * val, 0));
    const magnitudeB = Math.sqrt(vecB.reduce((sum, val) => sum + val * val, 0));

    if (magnitudeA === 0 || magnitudeB === 0) {
      return 0; // Handle edge case where one vector has zero magnitude.
    }

    return dotProduct / (magnitudeA * magnitudeB);
  }
}

/**
 * Creates a new instance of the vector store.
 * @returns {VectorStore} - A new vector store instance.
 */
function createVectorStore() {
  return new VectorStore();
}

export { createVectorStore };