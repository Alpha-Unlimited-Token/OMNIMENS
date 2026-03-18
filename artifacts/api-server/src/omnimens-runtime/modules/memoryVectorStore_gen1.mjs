/**
 * @module memoryVectorStore
 * @description Provides in-memory storage and fast retrieval of high-dimensional vectors using k-nearest neighbor search.
 * Designed to improve contextual recall and optimize AI memory management.
 */

/**
 * Represents a memory vector store for embedding storage and retrieval.
 */
class MemoryVectorStore {
  constructor() {
    /**
     * @type {Map<string, number[]>}
     * Stores vectors with unique string keys.
     */
    this.store = new Map();
  }

  /**
   * Adds a vector to the store.
   * @param {string} key - The unique identifier for the vector.
   * @param {number[]} vector - The high-dimensional vector to store.
   * @throws {Error} If the vector is not an array of numbers.
   */
  addVector(key, vector) {
    if (!Array.isArray(vector) || !vector.every((v) => typeof v === 'number')) {
      throw new Error('Vector must be an array of numbers.');
    }
    this.store.set(key, vector);
  }

  /**
   * Computes the Euclidean distance between two vectors.
   * @param {number[]} vectorA - The first vector.
   * @param {number[]} vectorB - The second vector.
   * @returns {number} The Euclidean distance.
   */
  static _euclideanDistance(vectorA, vectorB) {
    if (vectorA.length !== vectorB.length) {
      throw new Error('Vectors must be of the same dimensionality.');
    }
    return Math.sqrt(vectorA.reduce((sum, val, i) => sum + (val - vectorB[i]) ** 2, 0));
  }

  /**
   * Finds the k-nearest neighbors to a given vector.
   * @param {number[]} queryVector - The vector to search for neighbors.
   * @param {number} k - The number of neighbors to retrieve.
   * @returns {Array<{key: string, distance: number}>} The k-nearest neighbors with their distances.
   */
  findKNearestNeighbors(queryVector, k) {
    if (!Array.isArray(queryVector) || !queryVector.every((v) => typeof v === 'number')) {
      throw new Error('Query vector must be an array of numbers.');
    }
    if (k <= 0 || !Number.isInteger(k)) {
      throw new Error('k must be a positive integer.');
    }

    const distances = [];

    for (const [key, vector] of this.store.entries()) {
      const distance = MemoryVectorStore._euclideanDistance(queryVector, vector);
      distances.push({ key, distance });
    }

    distances.sort((a, b) => a.distance - b.distance);

    return distances.slice(0, k);
  }

  /**
   * Clears all vectors from the store.
   */
  clearStore() {
    this.store.clear();
  }
}

/**
 * Exports the MemoryVectorStore class for use in other modules.
 */
export { MemoryVectorStore };