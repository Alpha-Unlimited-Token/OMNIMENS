// vectorMemoryStore.js

/**
 * @module vectorMemoryStore
 * @description A lightweight approximate nearest neighbor (ANN) search implementation for fast in-memory vector searches and similarity queries.
 */

/**
 * VectorMemoryStore class for storing vectors and performing approximate nearest neighbor searches.
 */
class VectorMemoryStore {
  constructor() {
    /**
     * @type {Map<number, Array<number>>} - Map to store vectors with unique IDs.
     */
    this.vectorMap = new Map();
  }

  /**
   * Adds a vector to the store.
   * @param {number} id - Unique identifier for the vector.
   * @param {Array<number>} vector - The vector to store.
   * @throws {Error} Throws if the vector is not an array of numbers.
   */
  addVector(id, vector) {
    if (!Array.isArray(vector) || !vector.every((val) => typeof val === 'number')) {
      throw new Error('Vector must be an array of numbers.');
    }
    this.vectorMap.set(id, vector);
  }

  /**
   * Removes a vector from the store.
   * @param {number} id - Unique identifier for the vector to remove.
   * @returns {boolean} True if the vector was removed, false if it did not exist.
   */
  removeVector(id) {
    return this.vectorMap.delete(id);
  }

  /**
   * Finds the nearest neighbors to a given query vector.
   * @param {Array<number>} queryVector - The vector to search for neighbors.
   * @param {number} k - Number of nearest neighbors to return.
   * @returns {Array<{id: number, distance: number}>} An array of nearest neighbors sorted by distance.
   * @throws {Error} Throws if the queryVector is not an array of numbers.
   */
  findNearestNeighbors(queryVector, k) {
    if (!Array.isArray(queryVector) || !queryVector.every((val) => typeof val === 'number')) {
      throw new Error('Query vector must be an array of numbers.');
    }

    const distances = [];

    for (const [id, vector] of this.vectorMap.entries()) {
      const distance = this._calculateEuclideanDistance(queryVector, vector);
      distances.push({ id, distance });
    }

    distances.sort((a, b) => a.distance - b.distance);

    return distances.slice(0, k);
  }

  /**
   * Calculates the Euclidean distance between two vectors.
   * @param {Array<number>} vectorA - First vector.
   * @param {Array<number>} vectorB - Second vector.
   * @returns {number} The Euclidean distance between the vectors.
   * @throws {Error} Throws if vectors are not of the same length.
   */
  _calculateEuclideanDistance(vectorA, vectorB) {
    if (vectorA.length !== vectorB.length) {
      throw new Error('Vectors must be of the same length.');
    }

    return Math.sqrt(
      vectorA.reduce((sum, val, index) => sum + Math.pow(val - vectorB[index], 2), 0)
    );
  }
}

/**
 * Creates a new instance of the VectorMemoryStore.
 * @returns {VectorMemoryStore} A new VectorMemoryStore instance.
 */
function createVectorMemoryStore() {
  return new VectorMemoryStore();
}

export { createVectorMemoryStore, VectorMemoryStore };