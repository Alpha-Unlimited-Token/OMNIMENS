/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: vectorSearchEngine
 * Written: 2026-04-01T22:00:27.454Z
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

import { performance } from 'perf_hooks';

// Utility function: Calculate Euclidean distance between two vectors
export function euclideanDistance(vec1, vec2) {
  if (vec1.length !== vec2.length) {
    throw new Error('Vectors must be of the same dimension');
  }
  return Math.sqrt(vec1.reduce((sum, val, i) => sum + Math.pow(val - vec2[i], 2), 0));
}

// Utility function: Generate random integer in range [min, max]
export function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// HNSW Node class
class HNSWNode {
  constructor(vector, id) {
    this.vector = vector;
    this.id = id;
    this.connections = []; // Neighboring nodes
  }
}

// HNSW Graph class
class HNSWGraph {
  constructor(maxConnections = 16) {
    this.nodes = [];
    this.maxConnections = maxConnections; // Max neighbors per node
  }

  // Add a vector to the graph
  addVector(vector) {
    const newNode = new HNSWNode(vector, this.nodes.length);
    if (this.nodes.length === 0) {
      this.nodes.push(newNode);
      return;
    }

    const nearest = this.search(vector, 1)[0];
    newNode.connections.push(nearest);
    nearest.connections.push(newNode);

    // Limit connections to maxConnections
    newNode.connections = this._pruneConnections(newNode);
    nearest.connections = this._pruneConnections(nearest);

    this.nodes.push(newNode);
  }

  // Search for k nearest neighbors
  search(queryVector, k) {
    if (this.nodes.length === 0) {
      throw new Error('Graph is empty');
    }

    const visited = new Set();
    const candidates = [...this.nodes];
    candidates.sort((a, b) => euclideanDistance(queryVector, a.vector) - euclideanDistance(queryVector, b.vector));

    const result = [];
    while (result.length < k && candidates.length > 0) {
      const candidate = candidates.shift();
      if (!visited.has(candidate.id)) {
        visited.add(candidate.id);
        result.push(candidate);
      }
    }

    return result;
  }

  // Prune connections to maintain maxConnections
  _pruneConnections(node) {
    return node.connections
      .sort((a, b) => euclideanDistance(node.vector, a.vector) - euclideanDistance(node.vector, b.vector))
      .slice(0, this.maxConnections);
  }
}

// Exported function: Create a new HNSW graph
export function createHNSWGraph(maxConnections = 16) {
  return new HNSWGraph(maxConnections);
}

// Exported function: Measure execution time of a function
export function measureExecutionTime(func, ...args) {
  const start = performance.now();
  const result = func(...args);
  const end = performance.now();
  return { result, time: end - start };
}

// Exported function: Normalize a vector to unit length
export function normalizeVector(vector) {
  const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
  if (magnitude === 0) {
    throw new Error('Cannot normalize a zero vector');
  }
  return vector.map(val => val / magnitude);
}
