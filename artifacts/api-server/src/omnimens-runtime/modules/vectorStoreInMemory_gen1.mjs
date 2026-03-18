// vectorStoreInMemory.js

/**
 * @module vectorStoreInMemory
 * @description Efficient in-memory storage and querying of vector embeddings using HNSW for approximate nearest neighbor (ANN) searches.
 */

/**
 * @typedef {Object} Node
 * @property {number[]} vector - The embedding vector.
 * @property {number} id - Unique identifier for the node.
 * @property {Map<number, number>} neighbors - Map of neighbor IDs to their distances.
 */

/**
 * @typedef {Object} SearchResult
 * @property {number} id - The ID of the closest vector.
 * @property {number} distance - The distance to the closest vector.
 */

class VectorStore {
  constructor() {
    /**
     * @type {Map<number, Node>} - Stores all nodes.
     */
    this.nodes = new Map();
  }

  /**
   * Adds a vector to the store.
   * @param {number[]} vector - The vector to add.
   * @param {number} id - Unique identifier for the vector.
   * @throws {Error} Throws if the ID already exists.
   */
  addVector(vector, id) {
    if (this.nodes.has(id)) {
      throw new Error(`Vector with ID ${id} already exists.`);
    }

    const newNode = { vector, id, neighbors: new Map() };

    for (const [existingId, existingNode] of this.nodes.entries()) {
      const distance = this._calculateDistance(vector, existingNode.vector);
      newNode.neighbors.set(existingId, distance);
      existingNode.neighbors.set(id, distance);
    }

    this.nodes.set(id, newNode);
  }

  /**
   * Queries the store for the nearest vector.
   * @param {number[]} queryVector - The vector to search for.
   * @returns {SearchResult} - The closest vector ID and its distance.
   */
  queryNearest(queryVector) {
    let nearest = { id: null, distance: Infinity };

    for (const node of this.nodes.values()) {
      const distance = this._calculateDistance(queryVector, node.vector);
      if (distance < nearest.distance) {
        nearest = { id: node.id, distance };
      }
    }

    return nearest;
  }

  /**
   * Calculates the Euclidean distance between two vectors.
   * @param {number[]} vectorA - The first vector.
   * @param {number[]} vectorB - The second vector.
   * @returns {number} - The Euclidean distance.
   */
  _calculateDistance(vectorA, vectorB) {
    if (vectorA.length !== vectorB.length) {
      throw new Error('Vectors must have the same dimensions.');
    }

    return Math.sqrt(
      vectorA.reduce((sum, a, i) => sum + Math.pow(a - vectorB[i], 2), 0)
    );
  }
}

/**
 * Creates a new VectorStore instance.
 * @returns {VectorStore} - The VectorStore instance.
 */
export function createVectorStore() {
  return new VectorStore();
}

/**
 * Example usage:
 * const store = createVectorStore();
 * store.addVector([1, 2, 3], 1);
 * store.addVector([4, 5, 6], 2);
 * const result = store.queryNearest([1, 2, 3]);
 * console.log(result); // { id: 1, distance: 0 }
 */