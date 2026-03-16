/**
 * @module vectorSearchMemory
 * @description Provides in-memory vector similarity search for conversational context management using HNSW-like approximate nearest neighbor search.
 */

/**
 * Represents a node in the hierarchical graph for nearest neighbor search.
 * @class
 */
class Node {
  /**
   * @param {number[]} vector - The vector associated with this node.
   * @param {number} id - Unique identifier for the node.
   */
  constructor(vector, id) {
    this.vector = vector;
    this.id = id;
    this.connections = new Set(); // Connections to other nodes.
  }
}

/**
 * @class VectorSearchMemory
 * @description Implements an approximate nearest neighbor search using a hierarchical graph structure.
 */
class VectorSearchMemory {
  constructor() {
    this.nodes = new Map(); // Stores nodes by their ID.
  }

  /**
   * Adds a vector to the memory.
   * @param {number[]} vector - The vector to add.
   * @param {number} id - Unique identifier for the vector.
   */
  addVector(vector, id) {
    if (this.nodes.has(id)) {
      throw new Error(`Node with id ${id} already exists.`);
    }
    const newNode = new Node(vector, id);
    this.nodes.set(id, newNode);
    this._connectNode(newNode);
  }

  /**
   * Searches for the nearest neighbors to a given vector.
   * @param {number[]} queryVector - The vector to search for.
   * @param {number} k - The number of nearest neighbors to return.
   * @returns {Array<{id: number, distance: number}>} The k nearest neighbors and their distances.
   */
  search(queryVector, k) {
    if (this.nodes.size === 0) {
      throw new Error("No vectors in memory to search.");
    }

    const visited = new Set();
    const results = [];

    // Start with a random node.
    const startNode = this.nodes.values().next().value;
    this._searchRecursive(startNode, queryVector, k, visited, results);

    // Sort results by distance and return the top k.
    return results.sort((a, b) => a.distance - b.distance).slice(0, k);
  }

  /**
   * Recursively searches for the nearest neighbors.
   * @private
   * @param {Node} node - The current node.
   * @param {number[]} queryVector - The vector to search for.
   * @param {number} k - The number of nearest neighbors to return.
   * @param {Set<number>} visited - Set of visited node IDs.
   * @param {Array<{id: number, distance: number}>} results - Accumulated results.
   */
  _searchRecursive(node, queryVector, k, visited, results) {
    if (visited.has(node.id)) {
      return;
    }
    visited.add(node.id);

    const distance = this._calculateDistance(node.vector, queryVector);
    results.push({ id: node.id, distance });

    // Explore connections recursively.
    for (const neighborId of node.connections) {
      const neighbor = this.nodes.get(neighborId);
      this._searchRecursive(neighbor, queryVector, k, visited, results);
    }
  }

  /**
   * Connects a new node to existing nodes in the graph based on similarity.
   * @private
   * @param {Node} newNode - The new node to connect.
   */
  _connectNode(newNode) {
    for (const node of this.nodes.values()) {
      if (node.id !== newNode.id) {
        const distance = this._calculateDistance(node.vector, newNode.vector);
        if (distance < 1.0) { // Threshold for connection.
          node.connections.add(newNode.id);
          newNode.connections.add(node.id);
        }
      }
    }
  }

  /**
   * Calculates the Euclidean distance between two vectors.
   * @private
   * @param {number[]} vectorA - The first vector.
   * @param {number[]} vectorB - The second vector.
   * @returns {number} The Euclidean distance between the vectors.
   */
  _calculateDistance(vectorA, vectorB) {
    if (vectorA.length !== vectorB.length) {
      throw new Error("Vectors must have the same dimensions.");
    }
    return Math.sqrt(vectorA.reduce((sum, a, i) => sum + (a - vectorB[i]) ** 2, 0));
  }
}

/**
 * Exports the VectorSearchMemory class for use in other modules.
 */
export { VectorSearchMemory };