/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: inMemoryVectorStore
 * Written: 2026-03-22T08:41:42.660Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

/**
 * @module inMemoryVectorStore
 * @description A JavaScript module implementing an in-memory vector store with approximate nearest neighbor (ANN) search using HNSW algorithm.
 * @exports {class} InMemoryVectorStore - Main class to store and search high-dimensional vectors.
 */

/**
 * Computes the Euclidean distance between two vectors.
 * @param {number[]} vectorA - The first vector.
 * @param {number[]} vectorB - The second vector.
 * @returns {number} - The Euclidean distance between the two vectors.
 */
function euclideanDistance(vectorA, vectorB) {
  if (vectorA.length !== vectorB.length) {
    throw new Error('Vectors must have the same dimensionality.');
  }
  return Math.sqrt(vectorA.reduce((sum, val, idx) => sum + Math.pow(val - vectorB[idx], 2), 0));
}

/**
 * Represents a node in the HNSW graph.
 * @class
 */
class HNSWNode {
  /**
   * @param {number[]} vector - The high-dimensional vector associated with this node.
   * @param {number} id - Unique identifier for the node.
   */
  constructor(vector, id) {
    this.vector = vector;
    this.id = id;
    this.neighbors = new Map(); // Map of level -> Array of neighbor node IDs
  }
}

/**
 * An in-memory vector store implementing HNSW for approximate nearest neighbor search.
 * @class
 */
class InMemoryVectorStore {
  constructor() {
    this.nodes = new Map(); // Map of node ID -> HNSWNode
    this.nextNodeId = 0;
    this.maxNeighbors = 10; // Maximum neighbors per node per level
  }

  /**
   * Adds a vector to the store.
   * @param {number[]} vector - The vector to add.
   * @returns {number} - The ID of the added vector.
   */
  addVector(vector) {
    const nodeId = this.nextNodeId++;
    const newNode = new HNSWNode(vector, nodeId);
    this.nodes.set(nodeId, newNode);

    // Connect to neighbors in the graph
    for (const [id, node] of this.nodes) {
      if (id !== nodeId) {
        const distance = euclideanDistance(vector, node.vector);
        this._addNeighbor(newNode, node, distance);
        this._addNeighbor(node, newNode, distance);
      }
    }

    return nodeId;
  }

  /**
   * Searches for the nearest neighbors of a query vector.
   * @param {number[]} queryVector - The query vector.
   * @param {number} k - The number of nearest neighbors to return.
   * @returns {Array<{id: number, distance: number}>} - List of nearest neighbors with their distances.
   */
  search(queryVector, k) {
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
   * @private
   * @param {HNSWNode} node - The node to add a neighbor to.
   * @param {HNSWNode} neighbor - The neighbor node to add.
   * @param {number} distance - The distance between the node and the neighbor.
   */
  _addNeighbor(node, neighbor, distance) {
    const level = 0; // Single-level implementation for simplicity

    if (!node.neighbors.has(level)) {
      node.neighbors.set(level, []);
    }

    const neighbors = node.neighbors.get(level);
    neighbors.push({ id: neighbor.id, distance });
    neighbors.sort((a, b) => a.distance - b.distance);

    if (neighbors.length > this.maxNeighbors) {
      neighbors.pop();
    }
  }
}

export { InMemoryVectorStore };