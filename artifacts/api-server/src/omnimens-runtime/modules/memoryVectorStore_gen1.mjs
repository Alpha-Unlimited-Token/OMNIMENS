// memoryVectorStore.js

/**
 * @module memoryVectorStore
 * @description In-memory vector database using HNSW for fast embedding storage and retrieval.
 */

/**
 * Node.js built-in modules used.
 */
const { performance } = require('perf_hooks');

/**
 * Class representing a node in the HNSW graph.
 */
class HNSWNode {
  /**
   * @param {number[]} vector - The embedding vector.
   * @param {string} id - Unique identifier for the node.
   */
  constructor(vector, id) {
    this.vector = vector;
    this.id = id;
    this.neighbors = []; // List of connected nodes.
  }
}

/**
 * Class implementing the HNSW algorithm for approximate nearest neighbor search.
 */
class MemoryVectorStore {
  constructor() {
    this.nodes = new Map(); // Stores nodes by ID.
    this.entryPoint = null; // Entry point for graph traversal.
  }

  /**
   * Adds a vector to the store.
   * @param {string} id - Unique identifier for the vector.
   * @param {number[]} vector - The embedding vector.
   * @throws {Error} If vector dimensions mismatch.
   */
  addVector(id, vector) {
    if (this.nodes.size > 0) {
      const firstNode = this.nodes.values().next().value;
      if (firstNode.vector.length !== vector.length) {
        throw new Error('Vector dimensions must match existing embeddings.');
      }
    }

    const newNode = new HNSWNode(vector, id);
    this.nodes.set(id, newNode);

    if (!this.entryPoint) {
      this.entryPoint = newNode;
    } else {
      this._connectNeighbors(newNode);
    }
  }

  /**
   * Finds the nearest neighbor(s) to the given vector.
   * @param {number[]} queryVector - The query embedding vector.
   * @param {number} k - Number of nearest neighbors to retrieve.
   * @returns {Array<{id: string, distance: number}>} List of nearest neighbors.
   */
  findNearestNeighbors(queryVector, k = 1) {
    if (!this.entryPoint) {
      throw new Error('The vector store is empty.');
    }

    const visited = new Set();
    const priorityQueue = [{ node: this.entryPoint, distance: this._euclideanDistance(queryVector, this.entryPoint.vector) }];

    while (priorityQueue.length > 0) {
      priorityQueue.sort((a, b) => a.distance - b.distance);
      const current = priorityQueue.shift();

      if (visited.has(current.node.id)) continue;
      visited.add(current.node.id);

      current.node.neighbors.forEach((neighbor) => {
        if (!visited.has(neighbor.id)) {
          const distance = this._euclideanDistance(queryVector, neighbor.vector);
          priorityQueue.push({ node: neighbor, distance });
        }
      });
    }

    const results = Array.from(visited)
      .map((id) => {
        const node = this.nodes.get(id);
        return { id: node.id, distance: this._euclideanDistance(queryVector, node.vector) };
      })
      .sort((a, b) => a.distance - b.distance)
      .slice(0, k);

    return results;
  }

  /**
   * Connects a new node to its nearest neighbors.
   * @param {HNSWNode} newNode - The new node to connect.
   * @private
   */
  _connectNeighbors(newNode) {
    const allNodes = Array.from(this.nodes.values());
    const distances = allNodes.map((node) => ({
      node,
      distance: this._euclideanDistance(newNode.vector, node.vector),
    }));

    distances.sort((a, b) => a.distance - b.distance);
    const nearestNeighbors = distances.slice(0, Math.min(5, distances.length));
    nearestNeighbors.forEach(({ node }) => {
      newNode.neighbors.push(node);
      node.neighbors.push(newNode);
    });
  }

  /**
   * Calculates the Euclidean distance between two vectors.
   * @param {number[]} vectorA - First vector.
   * @param {number[]} vectorB - Second vector.
   * @returns {number} The Euclidean distance.
   * @private
   */
  _euclideanDistance(vectorA, vectorB) {
    if (vectorA.length !== vectorB.length) {
      throw new Error('Vector dimensions must match.');
    }

    return Math.sqrt(vectorA.reduce((sum, val, idx) => sum + Math.pow(val - vectorB[idx], 2), 0));
  }
}

/**
 * Exports the MemoryVectorStore class.
 */
module.exports = MemoryVectorStore;