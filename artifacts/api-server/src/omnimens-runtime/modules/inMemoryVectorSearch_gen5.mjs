/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: inMemoryVectorSearch
 * Written: 2026-04-01T22:16:47.129Z
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

import { performance } from 'perf_hooks';

/**
 * Calculates Euclidean distance between two vectors.
 * @param {Array<number>} vectorA - First vector.
 * @param {Array<number>} vectorB - Second vector.
 * @returns {number} - Euclidean distance.
 */
export function calculateEuclideanDistance(vectorA, vectorB) {
  if (vectorA.length !== vectorB.length) {
    throw new Error("Vectors must have the same dimensions.");
  }
  return Math.sqrt(vectorA.reduce((sum, val, idx) => sum + Math.pow(val - vectorB[idx], 2), 0));
}

/**
 * Node structure for HNSW graph.
 * @typedef {Object} HNSWNode
 * @property {Array<number>} vector - The embedding vector.
 * @property {Array<number>} neighbors - Indices of neighboring nodes.
 */

/**
 * Class implementing HNSW for approximate nearest neighbor search.
 */
export class HNSW {
  constructor(maxNeighbors = 16, efConstruction = 200) {
    this.nodes = []; // Array of HNSWNode
    this.maxNeighbors = maxNeighbors; // Maximum neighbors per node
    this.efConstruction = efConstruction; // Search depth during graph construction
  }

  /**
   * Adds a new vector to the HNSW graph.
   * @param {Array<number>} vector - The embedding vector to add.
   */
  addVector(vector) {
    const newNode = { vector, neighbors: [] };
    const newIndex = this.nodes.length;
    this.nodes.push(newNode);

    if (this.nodes.length === 1) return; // First node, no neighbors yet

    const candidates = this._searchLayer(vector, this.efConstruction);

    candidates.forEach((candidate) => {
      this._connectNodes(newIndex, candidate);
    });
  }

  /**
   * Searches for the k nearest neighbors of a query vector.
   * @param {Array<number>} queryVector - The query vector.
   * @param {number} k - Number of neighbors to retrieve.
   * @returns {Array<{ index, distance}>} - Array of k nearest neighbors.
   */
  search(queryVector, k = 1) {
    if (this.nodes.length === 0) return [];

    const candidates = this._searchLayer(queryVector, k);
    return candidates.map((index) => ({
      index,
      distance: calculateEuclideanDistance(queryVector, this.nodes[index].vector)
    })).sort((a, b) => a.distance - b.distance).slice(0, k);
  }

  /**
   * Internal method to search a layer for nearest neighbors.
   * @param {Array<number>} queryVector - The query vector.
   * @param {number} ef - Search depth.
   * @returns {Array<number>} - Indices of nearest neighbors.
   */
  _searchLayer(queryVector, ef) {
    const visited = new Set();
    const candidates = [0]; // Start with the first node
    const results = [];

    while (candidates.length && results.length < ef) {
      const current = candidates.pop();
      if (visited.has(current)) continue;
      visited.add(current);

      results.push(current);

      const neighbors = this.nodes[current].neighbors;
      neighbors.forEach((neighbor) => {
        if (!visited.has(neighbor)) {
          candidates.push(neighbor);
        }
      });
    }

    return results;
  }

  /**
   * Connects two nodes in the HNSW graph, respecting maxNeighbors limit.
   * @param {number} indexA - Index of the first node.
   * @param {number} indexB - Index of the second node.
   */
  _connectNodes(indexA, indexB) {
    const nodeA = this.nodes[indexA];
    const nodeB = this.nodes[indexB];

    if (!nodeA.neighbors.includes(indexB)) {
      nodeA.neighbors.push(indexB);
      if (nodeA.neighbors.length > this.maxNeighbors) {
        nodeA.neighbors.sort((a, b) => this._distanceToNode(indexA, a) - this._distanceToNode(indexA, b));
        nodeA.neighbors.pop();
      }
    }

    if (!nodeB.neighbors.includes(indexA)) {
      nodeB.neighbors.push(indexA);
      if (nodeB.neighbors.length > this.maxNeighbors) {
        nodeB.neighbors.sort((a, b) => this._distanceToNode(indexB, a) - this._distanceToNode(indexB, b));
        nodeB.neighbors.pop();
      }
    }
  }

  /**
   * Calculates the distance between a node and another node by index.
   * @param {number} indexA - Index of the first node.
   * @param {number} indexB - Index of the second node.
   * @returns {number} - Distance between the two nodes.
   */
  _distanceToNode(indexA, indexB) {
    return calculateEuclideanDistance(this.nodes[indexA].vector, this.nodes[indexB].vector);
  }
}

/**
 * Measures execution time of a function.
 * @param {Function} func - The function to measure.
 * @returns {number} - Execution time in milliseconds.
 */
export function measureExecutionTime(func) {
  const start = performance.now();
  func();
  return performance.now() - start;
}