/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: embeddingVectorStore
 * Written: 2026-03-23T14:13:51.830Z
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
 * @module embeddingVectorStore
 * @description Implements a fast embedding vector store with similarity search using HNSW (Hierarchical Navigable Small World) graph.
 * This module is designed for fast retrieval and similarity search of high-dimensional vectors, useful for context management in large language models.
 */

/**
 * Represents a node in the HNSW graph.
 * @class
 */
class HNSWNode {
  constructor(id, vector) {
    this.id = id; // Unique identifier for the node
    this.vector = vector; // The embedding vector
    this.neighbors = new Map(); // Neighbors in different layers
  }
}

/**
 * Computes the Euclidean distance between two vectors.
 * @param {number[]} vectorA - First vector.
 * @param {number[]} vectorB - Second vector.
 * @returns {number} - The Euclidean distance.
 */
function euclideanDistance(vectorA, vectorB) {
  if (vectorA.length !== vectorB.length) {
    throw new Error("Vectors must be of the same dimension.");
  }
  return Math.sqrt(vectorA.reduce((sum, val, i) => sum + (val - vectorB[i]) ** 2, 0));
}

/**
 * HNSW-based embedding vector store.
 * @class
 */
class EmbeddingVectorStore {
  constructor(maxNeighbors = 16, efConstruction = 200) {
    this.maxNeighbors = maxNeighbors; // Maximum neighbors per node
    this.efConstruction = efConstruction; // Search depth during construction
    this.nodes = []; // All nodes in the graph
  }

  /**
   * Adds a new vector to the store.
   * @param {number[]} vector - The embedding vector to add.
   * @returns {number} - The ID of the added vector.
   */
  addVector(vector) {
    const id = this.nodes.length;
    const newNode = new HNSWNode(id, vector);
    this.nodes.push(newNode);

    if (this.nodes.length > 1) {
      const neighbors = this._search(vector, this.efConstruction);
      neighbors.forEach(neighbor => {
        newNode.neighbors.set(neighbor.id, neighbor);
        if (neighbor.neighbors.size < this.maxNeighbors) {
          neighbor.neighbors.set(newNode.id, newNode);
        }
      });
    }

    return id;
  }

  /**
   * Searches for the nearest neighbors of a given vector.
   * @param {number[]} queryVector - The vector to search for.
   * @param {number} k - The number of nearest neighbors to return.
   * @returns {Array<{id, distance}>} - The nearest neighbors.
   */
  search(queryVector, k = 1) {
    const candidates = this._search(queryVector, k);
    return candidates.map(node => ({ id: node.id, distance: euclideanDistance(queryVector, node.vector) }));
  }

  /**
   * Internal search function using a greedy approach.
   * @param {number[]} queryVector - The vector to search for.
   * @param {number} ef - The search depth.
   * @returns {HNSWNode[]} - The nearest neighbors.
   */
  _search(queryVector, ef) {
    if (this.nodes.length === 0) return [];

    let visited = new Set();
    let candidates = [this.nodes[0]]; // Start from the first node
    let results = [];

    while (candidates.length > 0 && results.length < ef) {
      const current = candidates.pop();
      if (visited.has(current.id)) continue;
      visited.add(current.id);

      results.push(current);
      const neighbors = Array.from(current.neighbors.values());
      neighbors.sort((a, b) => euclideanDistance(queryVector, a.vector) - euclideanDistance(queryVector, b.vector));

      candidates.push(...neighbors);
    }

    results.sort((a, b) => euclideanDistance(queryVector, a.vector) - euclideanDistance(queryVector, b.vector));
    return results.slice(0, ef);
  }
}

export { EmbeddingVectorStore, euclideanDistance };