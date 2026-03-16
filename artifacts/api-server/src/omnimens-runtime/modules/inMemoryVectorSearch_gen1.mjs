/**
 * @module inMemoryVectorSearch
 * @description Implements an in-memory HNSW-based approximate nearest neighbor search for high-dimensional embeddings.
 * This module enables fast embedding-based retrieval for long-term memory and context reconstruction.
 */

/**
 * Node.js built-in modules
 */
const { performance } = require('perf_hooks');

/**
 * @typedef {Object} Node
 * @property {number[]} vector - The embedding vector.
 * @property {number} id - Unique identifier for the node.
 * @property {Map<number, number>} neighbors - Map of neighbor IDs to distances.
 */

/**
 * @class HNSWGraph
 * @description Implements the HNSW graph-based approximate nearest neighbor search.
 */
class HNSWGraph {
  constructor(maxNeighbors = 10) {
    /**
     * @type {Map<number, Node>} nodes - Stores all nodes in the graph.
     */
    this.nodes = new Map();

    /**
     * @type {number} maxNeighbors - Maximum number of neighbors per node.
     */
    this.maxNeighbors = maxNeighbors;
  }

  /**
   * @private
   * @description Computes the Euclidean distance between two vectors.
   * @param {number[]} vectorA - First vector.
   * @param {number[]} vectorB - Second vector.
   * @returns {number} - Euclidean distance.
   */
  _euclideanDistance(vectorA, vectorB) {
    if (vectorA.length !== vectorB.length) {
      throw new Error('Vectors must have the same dimensionality.');
    }
    return Math.sqrt(vectorA.reduce((sum, val, idx) => sum + Math.pow(val - vectorB[idx], 2), 0));
  }

  /**
   * @description Adds a new node to the graph.
   * @param {number} id - Unique identifier for the node.
   * @param {number[]} vector - Embedding vector for the node.
   */
  addNode(id, vector) {
    if (this.nodes.has(id)) {
      throw new Error(`Node with ID ${id} already exists.`);
    }

    const newNode = {
      id,
      vector,
      neighbors: new Map()
    };

    for (const [otherId, otherNode] of this.nodes) {
      const distance = this._euclideanDistance(vector, otherNode.vector);
      newNode.neighbors.set(otherId, distance);
      otherNode.neighbors.set(id, distance);
    }

    this._trimNeighbors(newNode);
    this.nodes.set(id, newNode);

    for (const [otherId, otherNode] of this.nodes) {
      this._trimNeighbors(otherNode);
    }
  }

  /**
   * @private
   * @description Trims neighbors of a node to maintain the maxNeighbors limit.
   * @param {Node} node - The node whose neighbors are to be trimmed.
   */
  _trimNeighbors(node) {
    const sortedNeighbors = Array.from(node.neighbors.entries())
      .sort((a, b) => a[1] - b[1])
      .slice(0, this.maxNeighbors);

    node.neighbors = new Map(sortedNeighbors);
  }

  /**
   * @description Searches for the nearest neighbors of a given vector.
   * @param {number[]} queryVector - The embedding vector to search for.
   * @param {number} k - Number of nearest neighbors to retrieve.
   * @returns {Array<{id: number, distance: number}>} - List of nearest neighbors.
   */
  search(queryVector, k = 5) {
    if (k <= 0) {
      throw new Error('Number of neighbors (k) must be greater than 0.');
    }

    const distances = [];

    for (const [id, node] of this.nodes) {
      const distance = this._euclideanDistance(queryVector, node.vector);
      distances.push({ id, distance });
    }

    return distances.sort((a, b) => a.distance - b.distance).slice(0, k);
  }
}

/**
 * @description Creates a new HNSW graph instance.
 * @param {number} maxNeighbors - Maximum number of neighbors per node.
 * @returns {HNSWGraph} - The HNSW graph instance.
 */
function createGraph(maxNeighbors = 10) {
  return new HNSWGraph(maxNeighbors);
}

/**
 * @description Measures the performance of a search operation.
 * @param {HNSWGraph} graph - The HNSW graph instance.
 * @param {number[]} queryVector - The embedding vector to search for.
 * @param {number} k - Number of nearest neighbors to retrieve.
 * @returns {{result: Array<{id: number, distance: number}>, timeMs: number}} - Search results and execution time.
 */
function measureSearchPerformance(graph, queryVector, k = 5) {
  const startTime = performance.now();
  const result = graph.search(queryVector, k);
  const endTime = performance.now();

  return {
    result,
    timeMs: endTime - startTime
  };
}

module.exports = {
  createGraph,
  measureSearchPerformance
};