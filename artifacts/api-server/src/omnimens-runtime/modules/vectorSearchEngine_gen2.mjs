/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: vectorSearchEngine
 * Written: 2026-04-03T13:57:14.583Z
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

// Utility function: Calculate Euclidean distance between two vectors
export function calculateEuclideanDistance(vectorA, vectorB) {
  if (vectorA.length !== vectorB.length) {
    throw new Error('Vectors must have the same dimensions');
  }
  return Math.sqrt(vectorA.reduce((sum, val, i) => sum + Math.pow(val - vectorB[i], 2), 0));
}

// Utility function: Generate a unique hash for a vector (used for node identification)
export function generateVectorHash(vector) {
  const hash = createHash('sha256');
  hash.update(vector.join(','));
  return hash.digest('hex');
}

// Core class implementing the HNSW algorithm
export class HNSW {
  constructor(maxNodes = 1000, maxEdgesPerNode = 16) {
    this.maxNodes = maxNodes;
    this.maxEdgesPerNode = maxEdgesPerNode;
    this.graph = new Map(); // Node hash -> { vector, edges: [neighborHashes] }
  }

  // Add a new vector to the graph
  addVector(vector) {
    const vectorHash = generateVectorHash(vector);
    if (this.graph.has(vectorHash)) {
      throw new Error('Vector already exists in the graph');
    }

    // Add the node to the graph
    this.graph.set(vectorHash, { vector, edges: [] });

    // Connect to nearest neighbors
    const neighbors = this._findNearestNeighbors(vector, this.maxEdgesPerNode);
    for (const neighbor of neighbors) {
      this.graph.get(vectorHash).edges.push(neighbor.hash);
      this.graph.get(neighbor.hash).edges.push(vectorHash);
    }
  }

  // Search for the nearest neighbors of a query vector
  search(queryVector, k = 1) {
    if (k <= 0) {
      throw new Error('k must be greater than 0');
    }

    const distances = [];

    for (const [hash, node] of this.graph.entries()) {
      const distance = calculateEuclideanDistance(queryVector, node.vector);
      distances.push({ hash, distance });
    }

    // Sort by distance and return the top-k results
    distances.sort((a, b) => a.distance - b.distance);
    return distances.slice(0, k).map(({ hash, distance }) => ({ vector: this.graph.get(hash).vector, distance }));
  }

  // Private method: Find nearest neighbors for a given vector
  _findNearestNeighbors(vector, maxNeighbors) {
    const distances = [];

    for (const [hash, node] of this.graph.entries()) {
      const distance = calculateEuclideanDistance(vector, node.vector);
      distances.push({ hash, distance });
    }

    // Sort by distance and return the top results
    distances.sort((a, b) => a.distance - b.distance);
    return distances.slice(0, maxNeighbors);
  }
}

// Exported utility function: Create an HNSW instance
export function createHNSW(maxNodes = 1000, maxEdgesPerNode = 16) {
  return new HNSW(maxNodes, maxEdgesPerNode);
}

// Exported utility function: Normalize a vector (scale to unit length)
export function normalizeVector(vector) {
  const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val ** 2, 0));
  if (magnitude === 0) {
    throw new Error('Cannot normalize a zero vector');
  }
  return vector.map(val => val / magnitude);
}