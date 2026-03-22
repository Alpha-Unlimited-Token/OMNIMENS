/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: embeddingCacheManager
 * Written: 2026-03-22T03:15:31.851Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// embeddingCacheManager.js

/**
 * @module embeddingCacheManager
 * @description A utility module for storing and retrieving embeddings in memory, 
 *              with an approximate nearest neighbor (ANN) search using the HNSW algorithm.
 */

/**
 * Represents a node in the HNSW graph.
 * @typedef {Object} HNSWNode
 * @property {number[]} vector - The embedding vector.
 * @property {number} id - Unique identifier for the node.
 * @property {Map<number, Set<number>>} neighbors - A map of layers to sets of neighboring node IDs.
 */

class HNSW {
  constructor(maxNeighbors = 16, maxLayers = 5) {
    this.nodes = new Map(); // Stores all nodes by their ID.
    this.maxNeighbors = maxNeighbors; // Maximum neighbors per node per layer.
    this.maxLayers = maxLayers; // Maximum number of layers in the graph.
    this.entryPoint = null; // Entry point for the graph.
  }

  /**
   * Adds a new vector to the HNSW graph.
   * @param {number[]} vector - The embedding vector to add.
   * @param {number} id - Unique identifier for the vector.
   */
  add(vector, id) {
    const newNode = {
      vector,
      id,
      neighbors: new Map()
    };
    for (let i = 0; i < this.maxLayers; i++) {
      newNode.neighbors.set(i, new Set());
    }
    this.nodes.set(id, newNode);

    if (!this.entryPoint) {
      this.entryPoint = id;
      return;
    }

    let currentNodeId = this.entryPoint;
    for (let layer = this.maxLayers - 1; layer >= 0; layer--) {
      currentNodeId = this._searchLayer(vector, currentNodeId, layer);
    }

    this._connect(newNode, this.nodes.get(currentNodeId), 0);
  }

  /**
   * Searches for the nearest neighbors of a given vector.
   * @param {number[]} vector - The query vector.
   * @param {number} k - The number of nearest neighbors to retrieve.
   * @returns {Array<{id: number, distance: number}>} The k nearest neighbors.
   */
  search(vector, k) {
    if (!this.entryPoint) return [];

    let currentNodeId = this.entryPoint;
    for (let layer = this.maxLayers - 1; layer >= 0; layer--) {
      currentNodeId = this._searchLayer(vector, currentNodeId, layer);
    }

    const visited = new Set();
    const candidates = [{ id: currentNodeId, distance: this._distance(vector, this.nodes.get(currentNodeId).vector) }];
    const results = [];

    while (candidates.length > 0) {
      candidates.sort((a, b) => a.distance - b.distance);
      const current = candidates.shift();

      if (!visited.has(current.id)) {
        visited.add(current.id);
        results.push(current);

        if (results.length > k) {
          results.sort((a, b) => a.distance - b.distance);
          results.pop();
        }

        const neighbors = this.nodes.get(current.id).neighbors.get(0) || [];
        for (const neighborId of neighbors) {
          if (!visited.has(neighborId)) {
            const neighborNode = this.nodes.get(neighborId);
            candidates.push({ id: neighborId, distance: this._distance(vector, neighborNode.vector) });
          }
        }
      }
    }

    return results;
  }

  /**
   * Searches for the closest node in a specific layer.
   * @param {number[]} vector - The query vector.
   * @param {number} entryId - The ID of the entry point node.
   * @param {number} layer - The layer to search in.
   * @returns {number} The ID of the closest node found.
   * @private
   */
  _searchLayer(vector, entryId, layer) {
    let currentNodeId = entryId;
    let currentDistance = this._distance(vector, this.nodes.get(currentNodeId).vector);

    while (true) {
      let foundCloser = false;
      for (const neighborId of this.nodes.get(currentNodeId).neighbors.get(layer) || []) {
        const neighborNode = this.nodes.get(neighborId);
        const distance = this._distance(vector, neighborNode.vector);
        if (distance < currentDistance) {
          currentNodeId = neighborId;
          currentDistance = distance;
          foundCloser = true;
        }
      }
      if (!foundCloser) break;
    }

    return currentNodeId;
  }

  /**
   * Connects two nodes in the graph.
   * @param {HNSWNode} nodeA - The first node.
   * @param {HNSWNode} nodeB - The second node.
   * @param {number} layer - The layer to connect the nodes in.
   * @private
   */
  _connect(nodeA, nodeB, layer) {
    const neighborsA = nodeA.neighbors.get(layer);
    const neighborsB = nodeB.neighbors.get(layer);

    if (neighborsA.size < this.maxNeighbors) {
      neighborsA.add(nodeB.id);
    }

    if (neighborsB.size < this.maxNeighbors) {
      neighborsB.add(nodeA.id);
    }
  }

  /**
   * Calculates the squared Euclidean distance between two vectors.
   * @param {number[]} vectorA - The first vector.
   * @param {number[]} vectorB - The second vector.
   * @returns {number} The squared Euclidean distance.
   * @private
   */
  _distance(vectorA, vectorB) {
    return vectorA.reduce((sum, val, i) => sum + (val - vectorB[i]) ** 2, 0);
  }
}

/**
 * Creates a new HNSW instance for managing embeddings.
 * @param {number} [maxNeighbors=16] - Maximum neighbors per node per layer.
 * @param {number} [maxLayers=5] - Maximum number of layers in the graph.
 * @returns {HNSW} A new HNSW instance.
 */
export function createEmbeddingCache(maxNeighbors = 16, maxLayers = 5) {
  return new HNSW(maxNeighbors, maxLayers);
}

/**
 * Example usage:
 * const cache = createEmbeddingCache();
 * cache.add([1, 2, 3], 1);
 * cache.add([4, 5, 6], 2);
 * const neighbors = cache.search([1, 2, 3], 1);
 * console.log(neighbors);
 */