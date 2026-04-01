/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: inMemoryVectorSearch
 * Written: 2026-04-01T21:57:51.333Z
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

// Utility functions for vector operations
export function euclideanDistance(vec1, vec2) {
  if (vec1.length !== vec2.length) {
    throw new Error('Vectors must have the same dimensions');
  }
  return Math.sqrt(vec1.reduce((sum, val, i) => sum + Math.pow(val - vec2[i], 2), 0));
}

export function cosineSimilarity(vec1, vec2) {
  if (vec1.length !== vec2.length) {
    throw new Error('Vectors must have the same dimensions');
  }
  const dotProduct = vec1.reduce((sum, val, i) => sum + val * vec2[i], 0);
  const magnitude1 = Math.sqrt(vec1.reduce((sum, val) => sum + val * val, 0));
  const magnitude2 = Math.sqrt(vec2.reduce((sum, val) => sum + val * val, 0));
  return dotProduct / (magnitude1 * magnitude2);
}

// HNSW Node structure
class HNSWNode {
  constructor(vector, id) {
    this.vector = vector;
    this.id = id;
    this.neighbors = [];
  }
}

// HNSW Graph implementation
export class HNSW {
  constructor(maxNeighbors = 16) {
    this.nodes = [];
    this.maxNeighbors = maxNeighbors;
  }

  addNode(vector, id) {
    const newNode = new HNSWNode(vector, id);
    if (this.nodes.length === 0) {
      this.nodes.push(newNode);
      return;
    }

    // Find nearest neighbors for the new node
    const neighbors = this.search(vector, this.maxNeighbors);
    newNode.neighbors = neighbors;

    // Update neighbors of the new node
    for (const neighbor of neighbors) {
      neighbor.neighbors.push(newNode);
      neighbor.neighbors.sort((a, b) => euclideanDistance(newNode.vector, a.vector) - euclideanDistance(newNode.vector, b.vector));
      if (neighbor.neighbors.length > this.maxNeighbors) {
        neighbor.neighbors.pop();
      }
    }

    this.nodes.push(newNode);
  }

  search(queryVector, k = 1) {
    if (this.nodes.length === 0) {
      return [];
    }

    const visited = new Set();
    const candidates = [...this.nodes];
    const results = [];

    while (candidates.length > 0) {
      const candidate = candidates.pop();
      if (visited.has(candidate.id)) {
        continue;
      }
      visited.add(candidate.id);

      const distance = euclideanDistance(queryVector, candidate.vector);
      results.push({ node: candidate, distance });
      results.sort((a, b) => a.distance - b.distance);

      if (results.length > k) {
        results.pop();
      }

      // Add neighbors of the candidate to the search space
      for (const neighbor of candidate.neighbors) {
        if (!visited.has(neighbor.id)) {
          candidates.push(neighbor);
        }
      }
    }

    return results.map(result => result.node);
  }
}

// Example utility function to normalize vectors
export function normalizeVector(vector) {
  const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
  return vector.map(val => val / magnitude);
}

// Example usage
export const exampleUsage = () => {
  const hnsw = new HNSW();

  hnsw.addNode([1, 0, 0], 'A');
  hnsw.addNode([0, 1, 0], 'B');
  hnsw.addNode([0, 0, 1], 'C');

  const nearest = hnsw.search([0.9, 0.1, 0], 2);
  return nearest.map(node => node.id);
};