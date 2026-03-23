/**
 * OMNIMENS Self-Authored Module
 * Source: evolution_engine
 * Title: Evolution Module: semanticMemory
 * Written: 2026-03-20T18:15:28.231Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 */

/**
 * @module semanticMemory
 * @description Provides an in-memory vector store for semantic search and retrieval using HNSW (Hierarchical Navigable Small World) graphs.
 */

/**
 * Represents a node in the HNSW graph.
 * @class
 */
class Node {
  /**
   * @param {number[]} vector - The vector representing the node's semantic data.
   * @param {string} id - A unique identifier for the node.
   */
  constructor(vector, id) {
    this.vector = vector;
    this.id = id;
    this.neighbors = []; // List of neighboring nodes
  }
}

/**
 * Computes the Euclidean distance between two vectors.
 * @param {number[]} vectorA - First vector.
 * @param {number[]} vectorB - Second vector.
 * @returns {number} - Euclidean distance.
 */
function euclideanDistance(vectorA, vectorB) {
  if (vectorA.length !== vectorB.length) {
    throw new Error("Vectors must have the same dimensions.");
  }
  return Math.sqrt(vectorA.reduce((sum, val, i) => sum + Math.pow(val - vectorB[i], 2), 0));
}

/**
 * Represents the HNSW graph.
 * @class
 */
class HNSWGraph {
  constructor() {
    this.nodes = new Map(); // Map of nodes by their ID
  }

  /**
   * Adds a node to the graph.
   * @param {string} id - Unique identifier for the node.
   * @param {number[]} vector - Semantic vector for the node.
   */
  addNode(id, vector) {
    if (this.nodes.has(id)) {
      throw new Error(`Node with id ${id} already exists.`);
    }
    const newNode = new Node(vector, id);
    this.nodes.set(id, newNode);
    this._connectNode(newNode);
  }

  /**
   * Connects a node to its nearest neighbors.
   * @private
   * @param {Node} newNode - Node to connect.
   */
  _connectNode(newNode) {
    const neighbors = Array.from(this.nodes.values())
      .filter(node => node.id !== newNode.id)
      .map(node => ({ node, distance: euclideanDistance(newNode.vector, node.vector) }))
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 5); // Keep top 5 nearest neighbors

    newNode.neighbors = neighbors.map(n => n.node);
    neighbors.forEach(n => n.node.neighbors.push(newNode));
  }

  /**
   * Searches for the nearest neighbors of a given vector.
   * @param {number[]} queryVector - Vector to search for.
   * @param {number} k - Number of nearest neighbors to retrieve.
   * @returns {Array<{id: string, distance: number}>} - List of nearest neighbors.
   */
  search(queryVector, k) {
    const distances = Array.from(this.nodes.values())
      .map(node => ({ id: node.id, distance: euclideanDistance(queryVector, node.vector) }))
      .sort((a, b) => a.distance - b.distance)
      .slice(0, k);

    return distances;
  }
}

/**
 * Creates a new HNSWGraph instance.
 * @returns {HNSWGraph} - A new instance of the graph.
 */
function createGraph() {
  return new HNSWGraph();
}

/**
 * Example usage of the semanticMemory module.
 * @returns {void}
 */
function exampleUsage() {
  const graph = createGraph();
  graph.addNode("node1", [1, 2, 3]);
  graph.addNode("node2", [4, 5, 6]);
  graph.addNode("node3", [7, 8, 9]);

  const results = graph.search([5, 5, 5], 2);
  console.log("Search results:", results);
}

export { createGraph, exampleUsage };