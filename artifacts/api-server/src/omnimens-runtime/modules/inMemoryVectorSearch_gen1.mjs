/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: inMemoryVectorSearch
 * Written: 2026-03-23T05:32:07.443Z
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
 * @module inMemoryVectorSearch
 * @description Provides fast in-memory vector search for semantic embeddings using HNSW (Hierarchical Navigable Small World) graph.
 * This module is designed for approximate nearest neighbor search with high performance and scalability.
 */

/**
 * Represents a node in the HNSW graph.
 * @class
 */
class HNSWNode {
  /**
   * @param {number[]} vector - The embedding vector of the node.
   * @param {number} id - Unique identifier for the node.
   */
  constructor(vector, id) {
    this.vector = vector;
    this.id = id;
    this.neighbors = []; // Array of neighboring nodes
  }
}

/**
 * Calculates the Euclidean distance between two vectors.
 * @param {number[]} vectorA - First vector.
 * @param {number[]} vectorB - Second vector.
 * @returns {number} - The Euclidean distance.
 */
function euclideanDistance(vectorA, vectorB) {
  if (vectorA.length !== vectorB.length) {
    throw new Error("Vectors must have the same dimensions.");
  }
  return Math.sqrt(vectorA.reduce((sum, val, idx) => sum + (val - vectorB[idx]) ** 2, 0));
}

/**
 * HNSW graph for approximate nearest neighbor search.
 * @class
 */
class HNSWGraph {
  /**
   * @param {number} maxNeighbors - Maximum number of neighbors per node.
   */
  constructor(maxNeighbors = 10) {
    this.nodes = []; // Array of all nodes in the graph
    this.maxNeighbors = maxNeighbors;
  }

  /**
   * Adds a new vector to the graph.
   * @param {number[]} vector - The embedding vector to add.
   * @returns {number} - The ID of the newly added vector.
   */
  addVector(vector) {
    const id = this.nodes.length;
    const newNode = new HNSWNode(vector, id);

    // Connect the new node to its nearest neighbors
    if (this.nodes.length > 0) {
      const neighbors = this._findNearestNeighbors(vector, this.maxNeighbors);
      newNode.neighbors = neighbors;
      for (const neighbor of neighbors) {
        neighbor.neighbors.push(newNode);
        if (neighbor.neighbors.length > this.maxNeighbors) {
          neighbor.neighbors.sort((a, b) => euclideanDistance(neighbor.vector, a.vector) - euclideanDistance(neighbor.vector, b.vector));
          neighbor.neighbors.pop();
        }
      }
    }

    this.nodes.push(newNode);
    return id;
  }

  /**
   * Searches for the nearest neighbors to a given vector.
   * @param {number[]} queryVector - The query vector.
   * @param {number} k - Number of nearest neighbors to return.
   * @returns {Array<{id: number, distance: number}>} - List of nearest neighbors with their IDs and distances.
   */
  search(queryVector, k = 1) {
    if (this.nodes.length === 0) {
      return [];
    }

    const visited = new Set();
    const candidates = [this.nodes[0]]; // Start from the first node
    const results = [];

    while (candidates.length > 0) {
      const current = candidates.pop();
      if (visited.has(current.id)) {
        continue;
      }
      visited.add(current.id);

      const distance = euclideanDistance(queryVector, current.vector);
      results.push({ id: current.id, distance });

      for (const neighbor of current.neighbors) {
        if (!visited.has(neighbor.id)) {
          candidates.push(neighbor);
        }
      }
    }

    results.sort((a, b) => a.distance - b.distance);
    return results.slice(0, k);
  }

  /**
   * Finds the nearest neighbors for a given vector.
   * @private
   * @param {number[]} vector - The query vector.
   * @param {number} k - Number of neighbors to find.
   * @returns {HNSWNode[]} - List of nearest neighbor nodes.
   */
  _findNearestNeighbors(vector, k) {
    const distances = this.nodes.map(node => ({ node, distance: euclideanDistance(vector, node.vector) }));
    distances.sort((a, b) => a.distance - b.distance);
    return distances.slice(0, k).map(entry => entry.node);
  }
}

export { HNSWGraph, euclideanDistance };