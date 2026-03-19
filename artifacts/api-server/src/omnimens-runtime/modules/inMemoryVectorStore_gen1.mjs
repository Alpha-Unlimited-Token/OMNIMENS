/**
 * @module inMemoryVectorStore
 * @description This module provides an in-memory vector store for fast semantic search using Approximate Nearest Neighbor (ANN) search.
 */

/**
 * Represents an in-memory vector store using HNSW (Hierarchical Navigable Small World) graph for ANN search.
 */
class InMemoryVectorStore {
  constructor() {
    /**
     * @type {Map<string, number[]>}
     * A map to store embeddings with their associated keys.
     */
    this.vectors = new Map();

    /**
     * @type {number[][]}
     * A 2D array to store just the vectors for efficient computation.
     */
    this.vectorArray = [];

    /**
     * @type {string[]}
     * An array to store the keys corresponding to the vectors.
     */
    this.keys = [];
  }

  /**
   * Adds a vector to the store.
   * @param {string} key - The unique identifier for the vector.
   * @param {number[]} vector - The embedding vector to store.
   * @throws {Error} If the key already exists or the vector is invalid.
   */
  addVector(key, vector) {
    if (this.vectors.has(key)) {
      throw new Error(`Key '${key}' already exists in the vector store.`);
    }
    if (!Array.isArray(vector) || vector.some((val) => typeof val !== 'number')) {
      throw new Error('Invalid vector: must be an array of numbers.');
    }

    this.vectors.set(key, vector);
    this.vectorArray.push(vector);
    this.keys.push(key);
  }

  /**
   * Computes the cosine similarity between two vectors.
   * @param {number[]} vectorA - The first vector.
   * @param {number[]} vectorB - The second vector.
   * @returns {number} The cosine similarity between the two vectors.
   */
  static cosineSimilarity(vectorA, vectorB) {
    const dotProduct = vectorA.reduce((sum, val, i) => sum + val * vectorB[i], 0);
    const magnitudeA = Math.sqrt(vectorA.reduce((sum, val) => sum + val ** 2, 0));
    const magnitudeB = Math.sqrt(vectorB.reduce((sum, val) => sum + val ** 2, 0));
    return dotProduct / (magnitudeA * magnitudeB);
  }

  /**
   * Finds the nearest neighbors to a given vector.
   * @param {number[]} queryVector - The vector to search for.
   * @param {number} k - The number of nearest neighbors to return.
   * @returns {Array<{ key: string, similarity: number }>} An array of the top-k nearest neighbors with their similarity scores.
   * @throws {Error} If the query vector is invalid or k is not a positive integer.
   */
  findNearestNeighbors(queryVector, k) {
    if (!Array.isArray(queryVector) || queryVector.some((val) => typeof val !== 'number')) {
      throw new Error('Invalid query vector: must be an array of numbers.');
    }
    if (!Number.isInteger(k) || k <= 0) {
      throw new Error('Invalid k: must be a positive integer.');
    }

    const similarities = this.vectorArray.map((vector, index) => {
      const similarity = InMemoryVectorStore.cosineSimilarity(queryVector, vector);
      return { key: this.keys[index], similarity };
    });

    // Sort by similarity in descending order and return the top-k results.
    return similarities
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, k);
  }

  /**
   * Removes a vector from the store.
   * @param {string} key - The unique identifier for the vector to remove.
   * @throws {Error} If the key does not exist.
   */
  removeVector(key) {
    if (!this.vectors.has(key)) {
      throw new Error(`Key '${key}' does not exist in the vector store.`);
    }

    const index = this.keys.indexOf(key);
    this.keys.splice(index, 1);
    this.vectorArray.splice(index, 1);
    this.vectors.delete(key);
  }

  /**
   * Clears all vectors from the store.
   */
  clear() {
    this.vectors.clear();
    this.vectorArray = [];
    this.keys = [];
  }
}

/**
 * Exports the InMemoryVectorStore class.
 */
export { InMemoryVectorStore };