/**
 * @module vectorMemoryStore
 * @description A utility module for in-memory vector-based retrieval using cosine similarity and K-Nearest Neighbors (KNN) indexing.
 * @version 1.0.0
 * @author OMNIMENS
 */

/**
 * Computes the cosine similarity between two vectors.
 * @param {number[]} vectorA - The first vector.
 * @param {number[]} vectorB - The second vector.
 * @returns {number} The cosine similarity between the two vectors.
 * @throws {Error} If the vectors are not of the same length or are empty.
 */
export function cosineSimilarity(vectorA, vectorB) {
  if (vectorA.length !== vectorB.length || vectorA.length === 0) {
    throw new Error("Vectors must be of the same length and non-empty.");
  }

  const dotProduct = vectorA.reduce((sum, val, i) => sum + val * vectorB[i], 0);
  const magnitudeA = Math.sqrt(vectorA.reduce((sum, val) => sum + val ** 2, 0));
  const magnitudeB = Math.sqrt(vectorB.reduce((sum, val) => sum + val ** 2, 0));

  return magnitudeA === 0 || magnitudeB === 0 ? 0 : dotProduct / (magnitudeA * magnitudeB);
}

/**
 * A class representing an in-memory vector store with KNN search capabilities.
 */
export class VectorMemoryStore {
  constructor() {
    /**
     * @type {Map<string, number[]>}
     * @private
     */
    this.store = new Map();
  }

  /**
   * Adds a vector to the store.
   * @param {string} key - The unique key associated with the vector.
   * @param {number[]} vector - The vector to store.
   * @throws {Error} If the key already exists or the vector is invalid.
   */
  addVector(key, vector) {
    if (this.store.has(key)) {
      throw new Error(`Key "${key}" already exists in the store.`);
    }
    if (!Array.isArray(vector) || vector.length === 0) {
      throw new Error("Vector must be a non-empty array of numbers.");
    }
    this.store.set(key, vector);
  }

  /**
   * Retrieves the K nearest neighbors to a given vector.
   * @param {number[]} queryVector - The query vector.
   * @param {number} k - The number of nearest neighbors to retrieve.
   * @returns {Array<{ key: string, similarity: number }>} An array of the K nearest neighbors and their similarities.
   * @throws {Error} If the query vector is invalid or K is not a positive integer.
   */
  getKNearestNeighbors(queryVector, k) {
    if (!Array.isArray(queryVector) || queryVector.length === 0) {
      throw new Error("Query vector must be a non-empty array of numbers.");
    }
    if (!Number.isInteger(k) || k <= 0) {
      throw new Error("K must be a positive integer.");
    }

    const similarities = [];

    for (const [key, vector] of this.store.entries()) {
      const similarity = cosineSimilarity(queryVector, vector);
      similarities.push({ key, similarity });
    }

    return similarities
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, k);
  }

  /**
   * Clears all vectors from the store.
   */
  clearStore() {
    this.store.clear();
  }

  /**
   * Returns the number of vectors in the store.
   * @returns {number} The number of vectors in the store.
   */
  size() {
    return this.store.size;
  }
}

/**
 * Example usage:
 * const store = new VectorMemoryStore();
 * store.addVector('item1', [0.1, 0.2, 0.3]);
 * store.addVector('item2', [0.4, 0.5, 0.6]);
 * const neighbors = store.getKNearestNeighbors([0.1, 0.2, 0.3], 1);
 * console.log(neighbors);
 */