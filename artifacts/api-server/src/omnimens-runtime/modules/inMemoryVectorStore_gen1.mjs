/**
 * @module inMemoryVectorStore
 * @description Implements an in-memory vector store with approximate nearest neighbor (ANN) search using HNSW (Hierarchical Navigable Small World).
 * This module enables fast embedding retrieval for long-term memory and contextual awareness.
 */

/**
 * VectorStore class for managing vectors and performing approximate nearest neighbor searches.
 */
class VectorStore {
  constructor() {
    /**
     * @type {Map<number, Float32Array>} Stores vectors with unique integer IDs.
     */
    this.vectors = new Map();

    /**
     * @type {Map<number, Set<number>>} Adjacency list for HNSW graph representation.
     */
    this.graph = new Map();

    /**
     * @type {number} Maximum number of connections per node in the graph.
     */
    this.maxConnections = 16;
  }

  /**
   * Adds a vector to the store.
   * @param {number} id - Unique identifier for the vector.
   * @param {Float32Array} vector - The vector to store.
   */
  addVector(id, vector) {
    if (this.vectors.has(id)) {
      throw new Error(`Vector with ID ${id} already exists.`);
    }
    this.vectors.set(id, vector);
    this.graph.set(id, new Set());
    this._updateGraph(id, vector);
  }

  /**
   * Finds the nearest neighbors for a given query vector.
   * @param {Float32Array} queryVector - The query vector.
   * @param {number} k - Number of nearest neighbors to retrieve.
   * @returns {Array<{id: number, distance: number}>} Sorted array of nearest neighbors.
   */
  findNearestNeighbors(queryVector, k) {
    if (k <= 0) {
      throw new Error('The number of neighbors (k) must be greater than 0.');
    }

    const distances = [];

    for (const [id, vector] of this.vectors.entries()) {
      const distance = this._calculateEuclideanDistance(queryVector, vector);
      distances.push({ id, distance });
    }

    distances.sort((a, b) => a.distance - b.distance);
    return distances.slice(0, k);
  }

  /**
   * Updates the HNSW graph with a new vector.
   * @private
   * @param {number} id - The ID of the new vector.
   * @param {Float32Array} vector - The new vector.
   */
  _updateGraph(id, vector) {
    const neighbors = this.findNearestNeighbors(vector, this.maxConnections);
    const neighborIds = neighbors.map(neighbor => neighbor.id);

    for (const neighborId of neighborIds) {
      this.graph.get(id).add(neighborId);
      this.graph.get(neighborId).add(id);

      if (this.graph.get(neighborId).size > this.maxConnections) {
        const farthestNeighbor = [...this.graph.get(neighborId)].reduce((farthest, current) => {
          const currentDistance = this._calculateEuclideanDistance(this.vectors.get(neighborId), this.vectors.get(current));
          const farthestDistance = this._calculateEuclideanDistance(this.vectors.get(neighborId), this.vectors.get(farthest));
          return currentDistance > farthestDistance ? current : farthest;
        });
        this.graph.get(neighborId).delete(farthestNeighbor);
      }
    }
  }

  /**
   * Calculates the Euclidean distance between two vectors.
   * @private
   * @param {Float32Array} vector1 - The first vector.
   * @param {Float32Array} vector2 - The second vector.
   * @returns {number} The Euclidean distance between the vectors.
   */
  _calculateEuclideanDistance(vector1, vector2) {
    if (vector1.length !== vector2.length) {
      throw new Error('Vectors must have the same dimensions.');
    }

    let sum = 0;
    for (let i = 0; i < vector1.length; i++) {
      sum += (vector1[i] - vector2[i]) ** 2;
    }
    return Math.sqrt(sum);
  }
}

/**
 * Creates a new VectorStore instance.
 * @returns {VectorStore} A new instance of VectorStore.
 */
export function createVectorStore() {
  return new VectorStore();
}

/**
 * Example usage:
 * const store = createVectorStore();
 * store.addVector(1, new Float32Array([0.1, 0.2, 0.3]));
 * store.addVector(2, new Float32Array([0.4, 0.5, 0.6]));
 * const neighbors = store.findNearestNeighbors(new Float32Array([0.15, 0.25, 0.35]), 1);
 * console.log(neighbors);
 */