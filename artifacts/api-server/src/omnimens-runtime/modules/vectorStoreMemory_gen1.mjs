// vectorStoreMemory.js

/**
 * @module vectorStoreMemory
 * @description A utility module for in-memory vector indexing and fast semantic search operations.
 * Implements a Faiss-like vector indexing algorithm using JavaScript.
 */

/**
 * Represents a memory-based vector store for fast semantic search.
 * @class
 */
class VectorStoreMemory {
  constructor() {
    /**
     * @type {Array<number[]>}
     * @description Stores vectors array of arrays.
     */
    this.vectors = [];

    /**
     * @type {Array<string>}
     * @description Stores metadata or identifiers associated with each vector.
     */
    this.metadata = [];
  }

  /**
   * Adds a vector and its associated metadata to the store.
   * @param {number[]} vector - The vector to store.
   * @param {string} meta - Metadata or identifier for the vector.
   * @throws {Error} Throws error if vector is not an array of numbers.
   */
  addVector(vector, meta) {
    if (!Array.isArray(vector) || !vector.every(Number.isFinite)) {
      throw new Error("Vector must be an array of finite numbers.");
    }
    this.vectors.push(vector);
    this.metadata.push(meta);
  }

  /**
   * Computes the cosine similarity between two vectors.
   * @param {number[]} vectorA - The first vector.
   * @param {number[]} vectorB - The second vector.
   * @returns {number} The cosine similarity score.
   */
  static cosineSimilarity(vectorA, vectorB) {
    const dotProduct = vectorA.reduce((sum, val, i) => sum + val * vectorB[i], 0);
    const magnitudeA = Math.sqrt(vectorA.reduce((sum, val) => sum + val ** 2, 0));
    const magnitudeB = Math.sqrt(vectorB.reduce((sum, val) => sum + val ** 2, 0));
    return magnitudeA && magnitudeB ? dotProduct / (magnitudeA * magnitudeB) : 0;
  }

  /**
   * Searches for the most similar vector in the store.
   * @param {number[]} queryVector - The query vector.
   * @param {number} topK - Number of top results to return.
   * @returns {Array<{meta, similarity}>} Top K similar vectors with metadata.
   * @throws {Error} Throws error if queryVector is not an array of numbers.
   */
  search(queryVector, topK = 1) {
    if (!Array.isArray(queryVector) || !queryVector.every(Number.isFinite)) {
      throw new Error("Query vector must be an array of finite numbers.");
    }

    const similarities = this.vectors.map((vector, index) => ({
      meta: this.metadata[index],
      similarity: VectorStoreMemory.cosineSimilarity(queryVector, vector)
    }));

    return similarities
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, topK);
  }

  /**
   * Clears all vectors and metadata from the store.
   */
  clear() {
    this.vectors = [];
    this.metadata = [];
  }
}

/**
 * Creates a new instance of VectorStoreMemory.
 * @returns {VectorStoreMemory} A new vector store instance.
 */
function createVectorStore() {
  return new VectorStoreMemory();
}

export { createVectorStore, VectorStoreMemory };