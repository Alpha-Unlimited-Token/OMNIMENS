/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: vectorSearchEngine
 * Written: 2026-04-01T22:02:17.676Z
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

/**
 * Compute the Euclidean distance between two vectors.
 * @param {number[]} vectorA - First vector.
 * @param {number[]} vectorB - Second vector.
 * @returns {number} - Euclidean distance.
 */
export function euclideanDistance(vectorA, vectorB) {
  if (vectorA.length !== vectorB.length) {
    throw new Error('Vectors must have the same dimensions.');
  }
  return Math.sqrt(vectorA.reduce((sum, val, i) => sum + Math.pow(val - vectorB[i], 2), 0));
}

/**
 * Generate a unique hash for a vector (used for node identification).
 * @param {number[]} vector - Input vector.
 * @returns {string} - Hash of the vector.
 */
export function hashVector(vector) {
  const hash = createHash('sha256');
  hash.update(vector.join(','));
  return hash.digest('hex');
}

/**
 * HNSW Node class representing a point in the graph.
 */
class HNSWNode {
  constructor(vector, id) {
    this.vector = vector;
    this.id = id;
    this.neighbors = new Map(); // Map of layer -> array of neighbors
  }
}

/**
 * HNSW Graph for approximate nearest neighbor search.
 */
export class HNSW {
  constructor(maxNeighbors = 16, efConstruction = 200) {
    this.maxNeighbors = maxNeighbors; // Maximum neighbors per layer
    this.efConstruction = efConstruction; // Exploration factor during construction
    this.nodes = new Map(); // Map of id -> HNSWNode
    this.entryNode = null; // Entry point into the graph
  }

  /**
   * Add a vector to the graph.
   * @param {number[]} vector - Vector to add.
   */
  add(vector) {
    const id = hashVector(vector);
    if (this.nodes.has(id)) {
      throw new Error('Vector already exists in the graph.');
    }

    const newNode = new HNSWNode(vector, id);
    this.nodes.set(id, newNode);

    if (!this.entryNode) {
      this.entryNode = newNode;
      return;
    }

    const nearestNeighbors = this.searchLayer(vector, this.entryNode, this.efConstruction);
    for (const neighbor of nearestNeighbors) {
      this.link(newNode, neighbor);
    }
  }

  /**
   * Search for the nearest neighbors of a vector.
   * @param {number[]} query - Query vector.
   * @param {number} k - Number of neighbors to retrieve.
   * @returns {HNSWNode[]} - Array of nearest neighbors.
   */
  search(query, k = 1) {
    if (!this.entryNode) {
      return [];
    }

    const candidates = this.searchLayer(query, this.entryNode, k);
    return candidates.map(node => ({ id: node.id, vector: node.vector }));
  }

  /**
   * Search a specific layer for neighbors.
   * @param {number[]} query - Query vector.
   * @param {HNSWNode} entryNode - Starting node.
   * @param {number} ef - Exploration factor.
   * @returns {HNSWNode[]} - Array of nearest neighbors.
   */
  searchLayer(query, entryNode, ef) {
    const visited = new Set();
    const candidates = [entryNode];
    const results = [];

    while (candidates.length > 0 && results.length < ef) {
      const currentNode = candidates.pop();

      if (visited.has(currentNode.id)) {
        continue;
      }
      visited.add(currentNode.id);

      results.push(currentNode);
      const neighbors = Array.from(currentNode.neighbors.values()).flat();
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor.id)) {
          candidates.push(neighbor);
        }
      }

      candidates.sort((a, b) => euclideanDistance(query, a.vector) - euclideanDistance(query, b.vector));
    }

    return results.slice(0, ef);
  }

  /**
   * Link two nodes in the graph.
   * @param {HNSWNode} nodeA - First node.
   * @param {HNSWNode} nodeB - Second node.
   */
  link(nodeA, nodeB) {
    if (!nodeA.neighbors.has(0)) {
      nodeA.neighbors.set(0, []);
    }
    if (!nodeB.neighbors.has(0)) {
      nodeB.neighbors.set(0, []);
    }

    nodeA.neighbors.get(0).push(nodeB);
    nodeB.neighbors.get(0).push(nodeA);

    if (nodeA.neighbors.get(0).length > this.maxNeighbors) {
      nodeA.neighbors.set(0, nodeA.neighbors.get(0).slice(0, this.maxNeighbors));
    }

    if (nodeB.neighbors.get(0).length > this.maxNeighbors) {
      nodeB.neighbors.set(0, nodeB.neighbors.get(0).slice(0, this.maxNeighbors));
    }
  }
}

/**
 * Utility function to normalize a vector.
 * @param {number[]} vector - Input vector.
 * @returns {number[]} - Normalized vector.
 */
export function normalizeVector(vector) {
  const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
  return vector.map(val => val / magnitude);
}