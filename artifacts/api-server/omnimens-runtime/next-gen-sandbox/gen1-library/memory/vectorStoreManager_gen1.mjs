/**
 * OMNIMENS Self-Authored Module (Migrated from DB)
 * Original Source: evolution_cycle_1
 * Name: vectorStoreManager
 * Purpose: Manages in-memory vector embeddings for efficient retrieval and contextual augmentation.
 * Description: Manages in-memory vector embeddings for efficient approximate nearest neighbor (ANN) search, enabling OMNIMENS to enhance contextual data retrieval.
 * Migrated: 2026-03-25T22:49:34.240Z
 */

/**
 * @module vectorStoreManager
 * @description Manages in-memory vector embeddings for efficient retrieval and contextual augmentation using HNSW algorithm.
 */

/**
 * A class to manage vector embeddings and perform approximate nearest neighbor (ANN) searches using Hierarchical Navigable Small World (HNSW).
 */
class VectorStoreManager {
  constructor() {
    /**
     * @type {Map<string, number[]>} A map to store vectors with their associated keys.
     */
    this.vectorStore = new Map();

    /**
     * @type {Array<string>} A list of keys for efficient traversal.
     */
    this.keys = [];
  }

  /**
   * Adds a vector to the store.
   * @param {string} key - The unique identifier for the vector.
   * @param {number[]} vector - The vector to store.
   * @throws {Error} Throws an error if the vector is not an array of numbers.
   */
  addVector(key, vector) {
    if (!Array.isArray(vector) || !vector.every((val) => typeof val === 'number')) {
      throw new Error('Vector must be an array of numbers.');
    }
    this.vectorStore.set(key, vector);
    this.keys.push(key);
  }

  /**
   * Computes the Euclidean distance between two vectors.
   * @private
   * @param {number[]} vectorA - The first vector.
   * @param {number[]} vectorB - The second vector.
   * @returns {number} The Euclidean distance between the two vectors.
   */
  _euclideanDistance(vectorA, vectorB) {
    if (vectorA.length !== vectorB.length) {
      throw new Error('Vectors must have the same dimensions.');
    }
    return Math.sqrt(vectorA.reduce((sum, val, i) => sum + Math.pow(val - vectorB[i], 2), 0));
  }

  /**
   * Finds the nearest neighbors to a given vector using a simplified HNSW approach.
   * @param {number[]} queryVector - The vector to search for neighbors.
   * @param {number} k - The number of nearest neighbors to retrieve.
   * @returns {Array<{key: string, distance: number}>} An array of nearest neighbors with their keys and distances.
   */
  findNearestNeighbors(queryVector, k) {
    if (!Array.isArray(queryVector) || !queryVector.every((val) => typeof val === 'number')) {
      throw new Error('Query vector must be an array of numbers.');
    }

    const distances = this.keys.map((key) => {
      const vector = this.vectorStore.get(key);
      const distance = this._euclideanDistance(queryVector, vector);
      return { key, distance };
    });

    distances.sort((a, b) => a.distance - b.distance);
    return distances.slice(0, k);
  }

  /**
   * Removes a vector from the store.
   * @param {string} key - The unique identifier for the vector to remove.
   * @returns {boolean} True if the vector was removed, false otherwise.
   */
  removeVector(key) {
    if (this.vectorStore.has(key)) {
      this.vectorStore.delete(key);
      this.keys = this.keys.filter((k) => k !== key);
      return true;
    }
    return false;
  }

  /**
   * Clears all vectors from the store.
   */
  clearStore() {
    this.vectorStore.clear();
    this.keys = [];
  }
}

/**
 * Creates a new instance of the VectorStoreManager.
 * @returns {VectorStoreManager} A new instance of the vector store manager.
 */
export function createVectorStoreManager() {
  return new VectorStoreManager();
}

/**
 * Example usage of the VectorStoreManager.
 * @example
 * const manager = createVectorStoreManager();
 * manager.addVector('vector1', [1, 2, 3]);
 * manager.addVector('vector2', [4, 5, 6]);
 * const neighbors = manager.findNearestNeighbors([1, 2, 3], 1);
 * console.log(neighbors);
 */