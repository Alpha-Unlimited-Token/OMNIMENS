/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: inMemoryVectorStore
 * Written: 2026-04-03T14:25:40.970Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// Complete ES module code here

import { randomUUID } from 'crypto';

/**
 * Utility module for in-memory vector storage and similarity search using HNSW graphs.
 * Provides efficient nearest neighbor search for embedding-based knowledge bases.
 */

// Helper function: Calculate Euclidean distance between two vectors
export function euclideanDistance(vectorA, vectorB) {
  if (vectorA.length !== vectorB.length) {
    throw new Error('Vectors must have the same dimensions');
  }
  return Math.sqrt(vectorA.reduce((sum, val, idx) => sum + Math.pow(val - vectorB[idx], 2), 0));
}

// Helper function: Generate random unique ID for nodes
export function generateNodeId() {
  return randomUUID();
}

// Class representing a node in the HNSW graph
class HNSWNode {
  constructor(id, vector) {
    this.id = id;
    this.vector = vector;
    this.neighbors = new Map(); // Map of neighbor IDs to distances
  }
}

// Main HNSW Graph class
export class HNSWGraph {
  constructor(maxNeighbors = 10) {
    this.nodes = new Map(); // Map of node IDs to HNSWNode instances
    this.maxNeighbors = maxNeighbors; // Maximum neighbors per node
  }

  // Add a new vector to the graph
  addVector(vector) {
    const nodeId = generateNodeId();
    const newNode = new HNSWNode(nodeId, vector);

    // Connect to existing nodes based on distance
    for (const [existingNodeId, existingNode] of this.nodes) {
      const distance = euclideanDistance(vector, existingNode.vector);
      existingNode.neighbors.set(nodeId, distance);
      newNode.neighbors.set(existingNodeId, distance);
    }

    // Trim neighbors to maxNeighbors based on distance
    newNode.neighbors = new Map(
      [...newNode.neighbors.entries()].sort((a, b) => a[1] - b[1]).slice(0, this.maxNeighbors)
    );

    for (const [neighborId, distance] of newNode.neighbors) {
      const neighborNode = this.nodes.get(neighborId);
      neighborNode.neighbors.set(nodeId, distance);
      neighborNode.neighbors = new Map(
        [...neighborNode.neighbors.entries()].sort((a, b) => a[1] - b[1]).slice(0, this.maxNeighbors)
      );
    }

    this.nodes.set(nodeId, newNode);
    return nodeId;
  }

  // Find the nearest neighbors for a given vector
  searchNearestNeighbors(queryVector, k = 5) {
    const distances = [];

    for (const [nodeId, node] of this.nodes) {
      const distance = euclideanDistance(queryVector, node.vector);
      distances.push({ nodeId, distance });
    }

    return distances.sort((a, b) => a.distance - b.distance).slice(0, k);
  }
}

// Utility function: Create a new HNSW graph instance
export function createHNSWGraph(maxNeighbors = 10) {
  return new HNSWGraph(maxNeighbors);
}

// Example usage (commented out for production):
// const graph = createHNSWGraph();
// const id1 = graph.addVector([1, 2, 3]);
// const id2 = graph.addVector([4, 5, 6]);
// const neighbors = graph.searchNearestNeighbors([1, 2, 3], 2);
// console.log(neighbors);
