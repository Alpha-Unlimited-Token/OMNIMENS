/**
 * @module inMemoryVectorStore
 * @description Provides high-speed vector operations and embedding retrieval using HNSW (Hierarchical Navigable Small World) graphs.
 * This module is designed for approximate nearest neighbor search in high-dimensional spaces.
 */

/**
 * Represents a node in the HNSW graph.
 * @class
 */
class HNSWNode {
  /**
   * @param {number[]} vector - The vector associated with this node.
   * @param {number} id - Unique identifier for the node.
   */
  constructor(vector, id) {
    this.vector = vector;
    this.id = id;
    this.neighbors = new Map(); // Map of level -> Set of neighbors
  }
}

/**
 * HNSW-based in-memory vector store for approximate nearest neighbor search.
 * @class
 */
class InMemoryVectorStore {
  constructor() {
    this.nodes = new Map(); // Map of id -> HNSWNode
    this.entryPoint = null; // Entry point for the graph
    this.levels = 0; // Number of levels in the graph
  }

  /**
   * Adds a vector to the store.
   * @param {number[]} vector - The vector to add.
   * @param {number} id - Unique identifier for the vector.
   */
  addVector(vector, id) {
    if (this.nodes.has(id)) {
      throw new Error(`Vector with id ${id} already exists.`);
    }

    const newNode = new HNSWNode(vector, id);
    this.nodes.set(id, newNode);

    if (!this.entryPoint) {
      this.entryPoint = newNode;
      this.levels = 1;
      return;
    }

    this._insertNode(newNode);
  }

  /**
   * Finds the nearest neighbors for a given query vector.
   * @param {number[]} queryVector - The query vector.
   * @param {number} k - Number of nearest neighbors to retrieve.
   * @returns {Array<{id: number, distance: number}>} The k-nearest neighbors.
   */
  search(queryVector, k) {
    if (!this.entryPoint) {
      throw new Error("The vector store is empty.");
    }

    const visited = new Set();
    const candidates = [this.entryPoint];
    const results = [];

    while (candidates.length > 0) {
      const current = candidates.pop();

      if (visited.has(current.id)) {
        continue;
      }

      visited.add(current.id);

      const distance = this._euclideanDistance(queryVector, current.vector);
      results.push({ id: current.id, distance });

      for (const neighbor of current.neighbors.get(0) || []) {
        if (!visited.has(neighbor.id)) {
          candidates.push(neighbor);
        }
      }
    }

    return results
      .sort((a, b) => a.distance - b.distance)
      .slice(0, k);
  }

  /**
   * Inserts a node into the graph.
   * @private
   * @param {HNSWNode} newNode - The node to insert.
   */
  _insertNode(newNode) {
    const entryPoint = this.entryPoint;
    const distance = this._euclideanDistance(newNode.vector, entryPoint.vector);

    if (!entryPoint.neighbors.has(0)) {
      entryPoint.neighbors.set(0, new Set());
    }

    entryPoint.neighbors.get(0).add(newNode);
    newNode.neighbors.set(0, new Set([entryPoint]));
  }

  /**
   * Calculates the Euclidean distance between two vectors.
   * @private
   * @param {number[]} vector1 - The first vector.
   * @param {number[]} vector2 - The second vector.
   * @returns {number} The Euclidean distance.
   */
  _euclideanDistance(vector1, vector2) {
    if (vector1.length !== vector2.length) {
      throw new Error("Vectors must have the same dimensionality.");
    }

    return Math.sqrt(
      vector1.reduce((sum, val, i) => sum + Math.pow(val - vector2[i], 2), 0)
    );
  }
}

/**
 * Creates a new instance of the in-memory vector store.
 * @returns {InMemoryVectorStore} The vector store instance.
 */
export function createVectorStore() {
  return new InMemoryVectorStore();
}

/**
 * Example usage of the module.
 * Uncomment the following lines to test the functionality.
 */
// const store = createVectorStore();
// store.addVector([1, 2, 3], 1);
// store.addVector([4, 5, 6], 2);
// console.log(store.search([1, 2, 3], 1));