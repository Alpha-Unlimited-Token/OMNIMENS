/**
 * OMNIMENS Self-Authored Module (Migrated from DB)
 * Original Source: evolution_cycle_1
 * Name: dynamicVectorSearch
 * Purpose: Enable fast in-memory vector similarity searches for embeddings.
 * Description: Implements fast vector similarity search using HNSW graph for OMNIMENS's computational intelligence expansion.
 * Migrated: 2026-03-25T22:49:34.318Z
 */

/**
 * @module dynamicVectorSearch
 * @description Implements fast in-memory vector similarity search using HNSW graph for Approximate Nearest Neighbors (ANN).
 */

/**
 * Node class representing a single vector and its connections in the HNSW graph.
 */
class Node {
  /**
   * @param {number[]} vector - The vector embedding.
   * @param {number} id - Unique identifier for the node.
   */
  constructor(vector, id) {
    this.vector = vector;
    this.id = id;
    this.neighbors = new Set(); // Stores connected nodes
  }
}

/**
 * HNSW Graph class for fast vector similarity search.
 */
class HNSWGraph {
  constructor() {
    this.nodes = new Map(); // Stores all nodes by their ID
  }

  /**
   * Adds a new vector to the graph.
   * @param {number[]} vector - The vector embedding.
   * @param {number} id - Unique identifier for the vector.
   * @param {number} maxNeighbors - Maximum number of neighbors to connect.
   */
  addNode(vector, id, maxNeighbors = 10) {
    if (this.nodes.has(id)) {
      throw new Error(`Node with ID ${id} already exists.`);
    }

    const newNode = new Node(vector, id);
    this.nodes.set(id, newNode);

    // Find nearest neighbors to connect
    const neighbors = this.findNearestNeighbors(vector, maxNeighbors);
    for (const neighbor of neighbors) {
      newNode.neighbors.add(neighbor);
      neighbor.neighbors.add(newNode);
    }
  }

  /**
   * Finds the nearest neighbors for a given vector.
   * @param {number[]} vector - The query vector.
   * @param {number} maxNeighbors - Maximum number of neighbors to return.
   * @returns {Node[]} Array of nearest neighbor nodes.
   */
  findNearestNeighbors(vector, maxNeighbors) {
    const distances = [];

    for (const node of this.nodes.values()) {
      const distance = this._calculateDistance(vector, node.vector);
      distances.push({ node, distance });
    }

    distances.sort((a, b) => a.distance - b.distance);

    return distances.slice(0, maxNeighbors).map(entry => entry.node);
  }

  /**
   * Searches for the most similar vectors to a query vector.
   * @param {number[]} queryVector - The query vector.
   * @param {number} topK - Number of top results to return.
   * @returns {Object[]} Array of top K results with { id, distance }.
   */
  search(queryVector, topK = 5) {
    const distances = [];

    for (const node of this.nodes.values()) {
      const distance = this._calculateDistance(queryVector, node.vector);
      distances.push({ id: node.id, distance });
    }

    distances.sort((a, b) => a.distance - b.distance);

    return distances.slice(0, topK);
  }

  /**
   * Calculates the Euclidean distance between two vectors.
   * @param {number[]} vectorA - First vector.
   * @param {number[]} vectorB - Second vector.
   * @returns {number} Euclidean distance.
   */
  _calculateDistance(vectorA, vectorB) {
    if (vectorA.length !== vectorB.length) {
      throw new Error("Vectors must have the same dimensions.");
    }

    return Math.sqrt(vectorA.reduce((sum, value, index) => {
      return sum + Math.pow(value - vectorB[index], 2);
    }, 0));
  }
}

/**
 * Creates a new HNSW graph instance.
 * @returns {HNSWGraph} A new HNSWGraph instance.
 */
export function createGraph() {
  return new HNSWGraph();
}

/**
 * Example usage:
 * const graph = createGraph();
 * graph.addNode([1, 2, 3], 1);
 * graph.addNode([4, 5, 6], 2);
 * const results = graph.search([1, 2, 3]);
 * console.log(results);
 */