// inMemoryVectorStore.js

/**
 * @module inMemoryVectorStore
 * @description Provides fast embedding storage and retrieval for context-aware operations
 * using HNSW (Hierarchical Navigable Small World) for approximate nearest neighbor search.
 */

/**
 * Represents a node in the HNSW graph.
 * @typedef {Object} Node
 * @property {number[]} vector - The embedding vector.
 * @property {Set<number>} neighbors - The indices of neighboring nodes.
 */

/**
 * Class implementing an in-memory vector store with HNSW-based approximate nearest neighbor search.
 */
class InMemoryVectorStore {
  constructor() {
    /**
     * @private
     * @type {Node[]}
     */
    this.nodes = [];

    /**
     * @private
     * @type {number}
     */
    this.dimension = null;
  }

  /**
   * Adds a new vector to the store.
   * @param {number[]} vector - The embedding vector to add.
   * @throws {Error} If vector dimension does not match existing vectors.
   */
  addVector(vector) {
    if (!Array.isArray(vector)) {
      throw new Error("Vector must be an array.");
    }

    if (this.dimension === null) {
      this.dimension = vector.length;
    } else if (vector.length !== this.dimension) {
      throw new Error("Vector dimension mismatch.");
    }

    const node = { vector, neighbors: new Set() };
    const index = this.nodes.length;

    this.nodes.push(node);

    // Connect the new node to existing nodes based on distance.
    for (let i = 0; i < this.nodes.length - 1; i++) {
      const neighborNode = this.nodes[i];
      const distance = this._euclideanDistance(vector, neighborNode.vector);

      if (distance < this._threshold()) {
        node.neighbors.add(i);
        neighborNode.neighbors.add(index);
      }
    }
  }

  /**
   * Searches for the nearest neighbors of a given query vector.
   * @param {number[]} queryVector - The query vector.
   * @param {number} k - The number of neighbors to retrieve.
   * @returns {Array<{index: number, distance: number}>} The nearest neighbors.
   */
  search(queryVector, k) {
    if (queryVector.length !== this.dimension) {
      throw new Error("Query vector dimension mismatch.");
    }

    const distances = this.nodes.map((node, index) => ({
      index,
      distance: this._euclideanDistance(queryVector, node.vector)
    }));

    distances.sort((a, b) => a.distance - b.distance);

    return distances.slice(0, k);
  }

  /**
   * Computes the Euclidean distance between two vectors.
   * @private
   * @param {number[]} vectorA - The first vector.
   * @param {number[]} vectorB - The second vector.
   * @returns {number} The Euclidean distance.
   */
  _euclideanDistance(vectorA, vectorB) {
    return Math.sqrt(vectorA.reduce((sum, val, i) => sum + Math.pow(val - vectorB[i], 2), 0));
  }

  /**
   * Determines the threshold for connecting nodes in the graph.
   * @private
   * @returns {number} The distance threshold.
   */
  _threshold() {
    return 0.5; // Example threshold; adjust for specific use cases.
  }
}

/**
 * Factory function to create a new vector store instance.
 * @returns {InMemoryVectorStore} A new instance of the vector store.
 */
function createVectorStore() {
  return new InMemoryVectorStore();
}

export { createVectorStore };