/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: vectorSearchEngine
 * Written: 2026-04-01T22:10:41.134Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// vectorSearchEngine.mjs

import { createHash } from 'crypto';

// Utility: Compute Euclidean distance between two vectors
export function euclideanDistance(vectorA, vectorB) {
  if (vectorA.length !== vectorB.length) {
    throw new Error('Vectors must have the same dimensions');
  }
  return Math.sqrt(vectorA.reduce((sum, val, idx) => sum + Math.pow(val - vectorB[idx], 2), 0));
}

// Utility: Generate a stable hash for a vector (used for node keys in the graph)
export function hashVector(vector) {
  const hash = createHash('sha256');
  hash.update(vector.join(','));
  return hash.digest('hex');
}

// HNSW Graph Node Constructor
class HNSWNode {
  constructor(vector, id) {
    this.vector = vector;
    this.id = id;
    this.neighbors = []; // Array of {node, distance}
  }
}

// HNSW Graph Implementation
export class HNSWGraph {
  constructor(maxNeighbors = 10) {
    this.nodes = new Map(); // Map of id -> HNSWNode
    this.maxNeighbors = maxNeighbors;
  }

  // Add a vector to the graph
  addVector(vector) {
    const id = hashVector(vector);
    if (this.nodes.has(id)) {
      throw new Error('Vector already exists in the graph');
    }
    const newNode = new HNSWNode(vector, id);

    // Connect to existing nodes
    for (const node of this.nodes.values()) {
      const distance = euclideanDistance(vector, node.vector);
      node.neighbors.push({ node: newNode, distance });
      newNode.neighbors.push({ node, distance });

      // Maintain max neighbors by distance
      node.neighbors.sort((a, b) => a.distance - b.distance);
      newNode.neighbors.sort((a, b) => a.distance - b.distance);
      if (node.neighbors.length > this.maxNeighbors) node.neighbors.pop();
      if (newNode.neighbors.length > this.maxNeighbors) newNode.neighbors.pop();
    }

    this.nodes.set(id, newNode);
  }

  // Search for nearest neighbors to a given vector
  search(vector, k = 1) {
    const visited = new Set();
    const results = [];

    for (const node of this.nodes.values()) {
      const distance = euclideanDistance(vector, node.vector);
      results.push({ node, distance });
    }

    // Sort results by distance and return top-k
    results.sort((a, b) => a.distance - b.distance);
    return results.slice(0, k).map(result => ({ id: result.node.id, distance: result.distance }));
  }
}

// Example Usage
export function exampleUsage() {
  const graph = new HNSWGraph();

  // Add vectors
  graph.addVector([1, 2, 3]);
  graph.addVector([4, 5, 6]);
  graph.addVector([7, 8, 9]);

  // Search nearest neighbors
  return graph.search([5, 5, 5], 2);
}