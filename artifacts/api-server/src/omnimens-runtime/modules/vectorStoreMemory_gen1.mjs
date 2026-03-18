/**
 * @module vectorStoreMemory
 * @description Implements in-memory vector storage and retrieval using HNSW (Hierarchical Navigable Small World) algorithm for approximate nearest neighbor search.
 */

/**
 * Represents a node in the HNSW graph.
 * @class
 */
class HNSWNode {
  /**
   * @param {number[]} vector - The vector associated with the node.
   * @param {number} id - Unique identifier for the node.
   */
  constructor(vector, id) {
    this.vector = vector;
    this.id = id;
    this.neighbors = new Map(); // Level -> Array of neighbor node IDs
  }
}

/**
 * A class implementing an HNSW-based in-memory vector store.
 * @class
 */
class VectorStore {
  constructor() {
    this.nodes = new Map(); // Map of node ID to HNSWNode
    this.nextNodeId = 0; // Auto-incrementing node ID
    this.maxNeighbors = 10; // Max neighbors per level
  }

  /**
   * Adds a vector to the store.
   * @param {number[]} vector - The vector to add.
   * @returns {number} The ID of the added vector.
   */
  addVector(vector) {
    if (!Array.isArray(vector) || vector.length === 0) {
      throw new Error("Vector must be a non-empty array of numbers.");
    }

    const id = this.nextNodeId++;
    const newNode = new HNSWNode(vector, id);
    this.nodes.set(id, newNode);

    // Connect the new node to existing nodes based on similarity
    this._connectNode(newNode);

    return id;
  }

  /**
   * Finds the k nearest neighbors to a given vector.
   * @param {number[]} queryVector - The vector to search for.
   * @param {number} k - The number of neighbors to retrieve.
   * @returns {Array<{id: number, distance: number}>} The k nearest neighbors with distances.
   */
  search(queryVector, k) {
    if (!Array.isArray(queryVector) || queryVector.length === 0) {
      throw new Error("Query vector must be a non-empty array of numbers.");
    }
    if (k <= 0) {
      throw new Error("k must be a positive integer.");
    }

    const distances = [];

    for (const node of this.nodes.values()) {
      const distance = this._euclideanDistance(queryVector, node.vector);
      distances.push({ id: node.id, distance });
    }

    distances.sort((a, b) => a.distance - b.distance);
    return distances.slice(0, k);
  }

  /**
   * Connects a new node to existing nodes based on similarity.
   * @private
   * @param {HNSWNode} newNode - The new node to connect.
   */
  _connectNode(newNode) {
    const distances = [];

    for (const node of this.nodes.values()) {
      if (node.id !== newNode.id) {
        const distance = this._euclideanDistance(newNode.vector, node.vector);
        distances.push({ node, distance });
      }
    }

    distances.sort((a, b) => a.distance - b.distance);
    const neighbors = distances.slice(0, this.maxNeighbors).map(d => d.node);

    newNode.neighbors.set(0, neighbors.map(n => n.id));
    for (const neighbor of neighbors) {
      const levelNeighbors = neighbor.neighbors.get(0) || [];
      if (levelNeighbors.length < this.maxNeighbors) {
        levelNeighbors.push(newNode.id);
        neighbor.neighbors.set(0, levelNeighbors);
      }
    }
  }

  /**
   * Computes the Euclidean distance between two vectors.
   * @private
   * @param {number[]} vec1 - The first vector.
   * @param {number[]} vec2 - The second vector.
   * @returns {number} The Euclidean distance.
   */
  _euclideanDistance(vec1, vec2) {
    if (vec1.length !== vec2.length) {
      throw new Error("Vectors must have the same dimensions.");
    }

    return Math.sqrt(vec1.reduce((sum, val, i) => sum + Math.pow(val - vec2[i], 2), 0));
  }
}

/**
 * Factory function to create a new VectorStore instance.
 * @returns {VectorStore} A new VectorStore instance.
 */
function createVectorStore() {
  return new VectorStore();
}

export { createVectorStore };