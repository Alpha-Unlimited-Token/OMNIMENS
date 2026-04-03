/**
 * OMNIMENS Self-Authored Module (Migrated from DB)
 * Original Source: evolution_cycle_2
 * Name: inMemoryVectorIndex
 * Purpose: Provide a fast, in-memory vector search index for similarity-based retrieval tasks.
 * Description: Provides an in-memory HNSW graph implementation for fast vector similarity search, supporting multiple agents with reusable utilities.
 * Migrated: 2026-04-03T06:05:15.849Z
 */

// Complete ES module code here

import { performance } from 'perf_hooks';

// Utility function to calculate Euclidean distance between two vectors
export function euclideanDistance(vec1, vec2) {
  if (vec1.length !== vec2.length) {
    throw new Error('Vectors must have the same dimensions');
  }
  return Math.sqrt(vec1.reduce((sum, val, idx) => sum + Math.pow(val - vec2[idx], 2), 0));
}

// Node structure for HNSW graph
class HNSWNode {
  constructor(id, vector) {
    this.id = id;
    this.vector = vector;
    this.neighbors = new Map(); // Level -> Array of neighbor IDs
  }
}

// HNSW Graph implementation
export class HNSWIndex {
  constructor(maxNeighbors = 16, efConstruction = 200) {
    this.maxNeighbors = maxNeighbors; // Max neighbors per node
    this.efConstruction = efConstruction; // Search depth during insertion
    this.nodes = new Map(); // ID -> Node
    this.entryPoint = null; // Entry point for graph traversal
  }

  // Add a new vector to the index
  addVector(id, vector) {
    if (this.nodes.has(id)) {
      throw new Error(`Node with ID ${id} already exists`);
    }

    const newNode = new HNSWNode(id, vector);
    if (!this.entryPoint) {
      // First node becomes the entry point
      this.entryPoint = newNode;
    } else {
      this._insertNode(newNode);
    }
    this.nodes.set(id, newNode);
  }

  // Search for k-nearest neighbors
  search(queryVector, k = 1, efSearch = 50) {
    if (!this.entryPoint) {
      return [];
    }

    // Priority queue for candidates (min-heap)
    const candidates = [];
    const visited = new Set();

    // Start from the entry point
    let currentNode = this.entryPoint;
    let currentDistance = euclideanDistance(queryVector, currentNode.vector);

    candidates.push({ node: currentNode, distance: currentDistance });
    visited.add(currentNode.id);

    while (candidates.length > 0) {
      candidates.sort((a, b) => a.distance - b.distance);
      const { node } = candidates.shift();

      for (const neighborId of node.neighbors.get(0) || []) {
        if (visited.has(neighborId)) continue;

        const neighborNode = this.nodes.get(neighborId);
        const distance = euclideanDistance(queryVector, neighborNode.vector);
        visited.add(neighborId);

        if (candidates.length < efSearch || distance < candidates[candidates.length - 1].distance) {
          candidates.push({ node: neighborNode, distance });
        }
      }
    }

    return candidates
      .sort((a, b) => a.distance - b.distance)
      .slice(0, k)
      .map(({ node, distance }) => ({ id: node.id, distance }));
  }

  // Internal method to insert a node into the graph
  _insertNode(newNode) {
    const candidates = this.search(newNode.vector, this.efConstruction);

    for (const { id } of candidates) {
      const neighborNode = this.nodes.get(id);
      this._connectNodes(newNode, neighborNode);
    }
  }

  // Connect two nodes bidirectionally
  _connectNodes(node1, node2) {
    if (!node1.neighbors.has(0)) {
      node1.neighbors.set(0, []);
    }
    if (!node2.neighbors.has(0)) {
      node2.neighbors.set(0, []);
    }

    if (node1.neighbors.get(0).length < this.maxNeighbors) {
      node1.neighbors.get(0).push(node2.id);
    }

    if (node2.neighbors.get(0).length < this.maxNeighbors) {
      node2.neighbors.get(0).push(node1.id);
    }
  }
}

// Export utility for timing performance of functions
export function timeFunction(fn, ...args) {
  const start = performance.now();
  const result = fn(...args);
  const end = performance.now();
  return { result, time: end - start };
}