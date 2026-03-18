// inMemoryVectorStore.js

/**
 * @module inMemoryVectorStore
 * @description A JavaScript ES module implementing an in-memory vector store with fast semantic search and retrieval using HNSW (Hierarchical Navigable Small World) graphs.
 */

/**
 * Represents a node in the HNSW graph.
 * @class
 */
class HNSWNode {
  /**
   * @param {number[]} vector - The vector embedding stored in this node.
   * @param {string} id - Unique identifier for the node.
   */
  constructor(vector, id) {
    this.vector = vector;
    this.id = id;
    this.neighbors = new Map(); // Maps level -> Array of neighbors
  }
}

/**
 * Calculates the Euclidean distance between two vectors.
 * @param {number[]} vectorA - The first vector.
 * @param {number[]} vectorB - The second vector.
 * @returns {number} The Euclidean distance.
 */
function calculateDistance(vectorA, vectorB) {
  if (vectorA.length !== vectorB.length) {
    throw new Error("Vectors must have the same dimensions.");
  }

  return Math.sqrt(vectorA.reduce((sum, val, idx) => sum + Math.pow(val - vectorB[idx], 2), 0));
}

/**
 * Represents the HNSW graph for approximate nearest neighbor search.
 * @class
 */
class HNSWGraph {
  constructor() {
    this.nodes = new Map(); // Stores all nodes by their ID
    this.entryPoint = null; // Entry point for search
    this.maxNeighbors = 5; // Maximum number of neighbors per level
  }

  /**
   * Adds a vector embedding to the graph.
   * @param {number[]} vector - The vector embedding.
   * @param {string} id - Unique identifier for the vector.
   */
  addNode(vector, id) {
    const newNode = new HNSWNode(vector, id);
    this.nodes.set(id, newNode);

    if (!this.entryPoint) {
      this.entryPoint = newNode;
      return;
    }

    this._linkNode(newNode);
  }

  /**
   * Links a new node to the graph by finding its nearest neighbors.
   * @param {HNSWNode} newNode - The new node to link.
   * @private
   */
  _linkNode(newNode) {
    const nearestNeighbors = this.search(newNode.vector, this.maxNeighbors);

    nearestNeighbors.forEach(({ node }) => {
      newNode.neighbors.set(0, [...(newNode.neighbors.get(0) || []), node]);
      node.neighbors.set(0, [...(node.neighbors.get(0) || []), newNode]);
    });
  }

  /**
   * Searches for the nearest neighbors of a given vector.
   * @param {number[]} queryVector - The vector to search for.
   * @param {number} k - The number of nearest neighbors to retrieve.
   * @returns {Array<{node: HNSWNode, distance: number}>} The nearest neighbors.
   */
  search(queryVector, k) {
    if (!this.entryPoint) {
      throw new Error("Graph is empty.");
    }

    const visited = new Set();
    const candidates = [{ node: this.entryPoint, distance: calculateDistance(queryVector, this.entryPoint.vector) }];
    const results = [];

    while (candidates.length > 0) {
      const current = candidates.shift();
      visited.add(current.node);

      current.node.neighbors.get(0)?.forEach((neighbor) => {
        if (!visited.has(neighbor)) {
          const distance = calculateDistance(queryVector, neighbor.vector);
          candidates.push({ node: neighbor, distance });
          visited.add(neighbor);
        }
      });

      results.push(current);
      results.sort((a, b) => a.distance - b.distance);

      if (results.length > k) {
        results.pop();
      }
    }

    return results;
  }
}

/**
 * Creates a new HNSW graph instance.
 * @returns {HNSWGraph} A new HNSWGraph instance.
 */
function createVectorStore() {
  return new HNSWGraph();
}

export { createVectorStore, calculateDistance };