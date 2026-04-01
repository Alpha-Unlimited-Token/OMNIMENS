/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: embeddingVectorStore
 * Written: 2026-04-01T22:13:23.619Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// embeddingVectorStore.mjs

import { createHash } from 'crypto';

// Utility: Compute the Euclidean distance between two vectors
export function euclideanDistance(vectorA, vectorB) {
  if (vectorA.length !== vectorB.length) {
    throw new Error('Vectors must have the same dimensions');
  }
  return Math.sqrt(vectorA.reduce((sum, val, i) => sum + Math.pow(val - vectorB[i], 2), 0));
}

// Utility: Generate a unique hash for a vector (used as an identifier)
export function vectorHash(vector) {
  const hash = createHash('sha256');
  hash.update(vector.join(','));
  return hash.digest('hex');
}

// HNSW Node class
class HNSWNode {
  constructor(vector, id) {
    this.vector = vector;
    this.id = id;
    this.neighbors = []; // List of { id, distance }
  }
}

// HNSW Graph class
export class HNSWGraph {
  constructor(maxNeighbors = 10) {
    this.nodes = new Map(); // Map of id -> HNSWNode
    this.maxNeighbors = maxNeighbors;
  }

  // Add a vector to the graph
  addVector(vector) {
    const id = vectorHash(vector);
    if (this.nodes.has(id)) {
      throw new Error('Vector already exists in the graph');
    }

    const newNode = new HNSWNode(vector, id);
    this.nodes.set(id, newNode);

    // Connect to nearest neighbors
    for (const node of this.nodes.values()) {
      if (node.id !== id) {
        const distance = euclideanDistance(node.vector, vector);
        node.neighbors.push({ id, distance });
        newNode.neighbors.push({ id: node.id, distance });

        // Keep only the closest neighbors
        node.neighbors.sort((a, b) => a.distance - b.distance);
        newNode.neighbors.sort((a, b) => a.distance - b.distance);

        if (node.neighbors.length > this.maxNeighbors) {
          node.neighbors.pop();
        }
        if (newNode.neighbors.length > this.maxNeighbors) {
          newNode.neighbors.pop();
        }
      }
    }
  }

  // Search for the nearest neighbors of a query vector
  search(queryVector, k = 5) {
    if (k <= 0) {
      throw new Error('k must be a positive integer');
    }

    const visited = new Set();
    const results = [];

    for (const node of this.nodes.values()) {
      const distance = euclideanDistance(node.vector, queryVector);
      results.push({ id: node.id, distance });
    }

    results.sort((a, b) => a.distance - b.distance);
    return results.slice(0, k);
  }

  // Retrieve a vector by its hash ID
  getVectorById(id) {
    const node = this.nodes.get(id);
    if (!node) {
      throw new Error('Vector not found');
    }
    return node.vector;
  }
}

// Exported utility: Create a new HNSW graph instance
export function createHNSWGraph(maxNeighbors = 10) {
  return new HNSWGraph(maxNeighbors);
}

// Exported utility: Normalize a vector to unit length
export function normalizeVector(vector) {
  const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
  if (magnitude === 0) {
    throw new Error('Cannot normalize a zero vector');
  }
  return vector.map(val => val / magnitude);
}