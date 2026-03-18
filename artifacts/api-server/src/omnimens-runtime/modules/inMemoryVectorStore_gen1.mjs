/**
 * @module inMemoryVectorStore
 * @description A module to store and retrieve high-dimensional embeddings for semantic search using approximate nearest neighbor (ANN) search.
 */

/**
 * Node.js built-in modules
 */
const { performance } = require('perf_hooks');

/**
 * @class VectorStore
 * @description A class to manage high-dimensional embeddings and perform ANN search using a simple HNSW-like graph structure.
 */
class VectorStore {
  constructor() {
    /**
     * @type {Map<number, number[]>}
     * @description Stores embeddings with unique IDs.
     */
    this.embeddings = new Map();

    /**
     * @type {Map<number, Set<number>>}
     * @description Graph structure to store nearest neighbors for each vector.
     */
    this.graph = new Map();
  }

  /**
   * Adds a new vector to the store.
   * @param {number} id - Unique identifier for the vector.
   * @param {number[]} vector - The high-dimensional vector to store.
   * @throws {Error} If the vector is not an array or ID already exists.
   */
  addVector(id, vector) {
    if (this.embeddings.has(id)) {
      throw new Error(`Vector with ID ${id} already exists.`);
    }
    if (!Array.isArray(vector)) {
      throw new Error('Vector must be an array of numbers.');
    }

    this.embeddings.set(id, vector);
    this.graph.set(id, new Set());

    // Update graph connections for ANN
    this._updateGraph(id, vector);
  }

  /**
   * Retrieves the k nearest neighbors for a given query vector.
   * @param {number[]} query - The query vector.
   * @param {number} k - Number of nearest neighbors to retrieve.
   * @returns {{id: number, distance: number}[]} Array of nearest neighbors with their distances.
   */
  getNearestNeighbors(query, k) {
    if (!Array.isArray(query)) {
      throw new Error('Query must be an array of numbers.');
    }
    if (k <= 0) {
      throw new Error('k must be a positive integer.');
    }

    const distances = [];

    for (const [id, vector] of this.embeddings.entries()) {
      const distance = this._euclideanDistance(query, vector);
      distances.push({ id, distance });
    }

    distances.sort((a, b) => a.distance - b.distance);

    return distances.slice(0, k);
  }

  /**
   * Updates the graph structure with a new vector.
   * @private
   * @param {number} id - The ID of the new vector.
   * @param {number[]} vector - The new vector.
   */
  _updateGraph(id, vector) {
    const neighbors = this.getNearestNeighbors(vector, 5); // Connect to 5 nearest neighbors

    for (const neighbor of neighbors) {
      this.graph.get(id).add(neighbor.id);
      this.graph.get(neighbor.id).add(id);
    }
  }

  /**
   * Calculates the Euclidean distance between two vectors.
   * @private
   * @param {number[]} vec1 - The first vector.
   * @param {number[]} vec2 - The second vector.
   * @returns {number} The Euclidean distance between the vectors.
   */
  _euclideanDistance(vec1, vec2) {
    if (vec1.length !== vec2.length) {
      throw new Error('Vectors must have the same dimensions.');
    }

    return Math.sqrt(vec1.reduce((sum, val, i) => sum + (val - vec2[i]) ** 2, 0));
  }
}

/**
 * Example usage of the VectorStore.
 */
const vectorStore = new VectorStore();

// Add some vectors
vectorStore.addVector(1, [1.0, 2.0, 3.0]);
vectorStore.addVector(2, [2.0, 3.0, 4.0]);
vectorStore.addVector(3, [3.0, 4.0, 5.0]);

// Query for nearest neighbors
const neighbors = vectorStore.getNearestNeighbors([2.5, 3.5, 4.5], 2);
console.log(neighbors);

module.exports = {
  VectorStore
};