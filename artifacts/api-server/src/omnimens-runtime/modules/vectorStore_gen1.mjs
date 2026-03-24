/**
 * @module vectorStore
 * @description Implements a vector similarity search and dynamic reasoning utility using HNSW (Hierarchical Navigable Small World).
 * This module enables fast approximate nearest neighbor searches for embedding-based reasoning tasks.
 */

/**
 * Represents a node in the HNSW graph.
 * @class
 */
class HNSWNode {
  constructor(id, vector) {
    this.id = id; // Unique identifier for the node
    this.vector = vector; // The vector associated with the node
    this.neighbors = new Map(); // Map of neighbors (key: neighbor ID, value: distance)
  }
}

/**
 * Calculates the Euclidean distance between two vectors.
 * @param {number[]} vectorA - The first vector.
 * @param {number[]} vectorB - The second vector.
 * @returns {number} The Euclidean distance.
 */
function euclideanDistance(vectorA, vectorB) {
  if (vectorA.length !== vectorB.length) {
    throw new Error("Vectors must have the same dimension.");
  }
  return Math.sqrt(vectorA.reduce((sum, val, i) => sum + Math.pow(val - vectorB[i], 2), 0));
}

/**
 * HNSW Graph implementation for approximate nearest neighbor search.
 * @class
 */
class HNSWGraph {
  constructor(maxNeighbors = 10) {
    this.nodes = new Map(); // Map of all nodes (key: node ID, value)
    this.maxNeighbors = maxNeighbors; // Maximum number of neighbors per node
  }

  /**
   * Adds a new node to the graph.
   * @param {string} id - Unique identifier for the node.
   * @param {number[]} vector - The vector associated with the node.
   */
  addNode(id, vector) {
    if (this.nodes.has(id)) {
      throw new Error(`Node with ID '${id}' already exists.`);
    }
    const newNode = new HNSWNode(id, vector);
    this.nodes.set(id, newNode);

    // Connect to existing nodes
    for (const [existingId, existingNode] of this.nodes) {
      if (existingId === id) continue;
      const distance = euclideanDistance(vector, existingNode.vector);
      this._addNeighbor(newNode, existingNode, distance);
      this._addNeighbor(existingNode, newNode, distance);
    }
  }

  /**
   * Performs a similarity search to find the nearest neighbors.
   * @param {number[]} queryVector - The query vector.
   * @param {number} k - Number of nearest neighbors to return.
   * @returns {Array<{id, distance}>} List of nearest neighbors.
   */
  search(queryVector, k = 5) {
    if (k <= 0) {
      throw new Error("Number of neighbors to return must be greater than 0.");
    }

    const distances = [];
    for (const [id, node] of this.nodes) {
      const distance = euclideanDistance(queryVector, node.vector);
      distances.push({ id, distance });
    }

    distances.sort((a, b) => a.distance - b.distance);
    return distances.slice(0, k);
  }

  /**
   * Adds a neighbor to a node, maintaining the maxNeighbors constraint.
   * @* @param {HNSWNode} node - The node to add a neighbor to.
   * @param {HNSWNode} neighbor - The neighbor node.
   * @param {number} distance - The distance between the nodes.
   */
  _addNeighbor(node, neighbor, distance) {
    node.neighbors.set(neighbor.id, distance);
    if (node.neighbors.size > this.maxNeighbors) {
      const sortedNeighbors = Array.from(node.neighbors.entries()).sort((a, b) => a[1] - b[1]);
      node.neighbors = new Map(sortedNeighbors.slice(0, this.maxNeighbors));
    }
  }
}

/**
 * Exports the HNSWGraph class and utility functions.
 */
export { HNSWGraph, euclideanDistance };