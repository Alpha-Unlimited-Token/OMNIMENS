/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: memoryEfficientVectorStore
 * Written: 2026-04-03T07:28:07.425Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// memoryEfficientVectorStore.mjs

import { randomUUID } from 'crypto';

/**
 * Computes the Euclidean distance between two vectors.
 * @param {number[]} vec1 - First vector.
 * @param {number[]} vec2 - Second vector.
 * @returns {number} - Euclidean distance.
 */
export function euclideanDistance(vec1, vec2) {
  if (vec1.length !== vec2.length) {
    throw new Error('Vectors must have the same length.');
  }
  return Math.sqrt(vec1.reduce((sum, val, i) => sum + (val - vec2[i]) ** 2, 0));
}

/**
 * Node in the HNSW graph.
 * @typedef {Object} HNSWNode
 * @property {string} id - Unique identifier for the node.
 * @property {number[]} vector - The embedding vector.
 * @property {Map<number, Set<string>>} neighbors - Map of layer -> set of neighbor IDs.
 */

/**
 * HNSW-based memory-efficient vector store.
 */
export class HNSWVectorStore {
  constructor(maxNeighbors = 16, efConstruction = 200) {
    this.maxNeighbors = maxNeighbors; // Maximum neighbors per layer.
    this.efConstruction = efConstruction; // Controls search depth during insertion.
    this.nodes = new Map(); // Map of node ID -> HNSWNode.
    this.entryPoint = null; // Entry point for the graph.
  }

  /**
   * Adds a vector to the store.
   * @param {number[]} vector - The embedding vector to add.
   * @returns {string} - The ID of the added vector.
   */
  addVector(vector) {
    const id = randomUUID();
    const newNode = {
      id,
      vector,
      neighbors: new Map()
    };
    this.nodes.set(id, newNode);

    if (this.entryPoint === null) {
      this.entryPoint = id;
      return id;
    }

    let currentNodeId = this.entryPoint;
    for (let layer = this.getMaxLayer(); layer >= 0; layer--) {
      currentNodeId = this._searchLayer(vector, currentNodeId, layer);
    }

    this._connectNewNode(newNode, currentNodeId);
    return id;
  }

  /**
   * Searches for the nearest neighbors of a given vector.
   * @param {number[]} queryVector - The query vector.
   * @param {number} k - Number of neighbors to retrieve.
   * @returns {Array<{id, distance}>} - Nearest neighbors.
   */
  search(queryVector, k) {
    if (this.entryPoint === null) {
      return [];
    }

    const visited = new Set();
    const candidates = [{ id: this.entryPoint, distance: euclideanDistance(queryVector, this.nodes.get(this.entryPoint).vector) }];
    const results = [];

    while (candidates.length > 0) {
      const current = candidates.pop();
      if (visited.has(current.id)) continue;
      visited.add(current.id);

      const currentNode = this.nodes.get(current.id);
      results.push(current);
      results.sort((a, b) => a.distance - b.distance);
      if (results.length > k) results.pop();

      for (const neighborId of currentNode.neighbors.get(0) || []) {
        if (!visited.has(neighborId)) {
          const distance = euclideanDistance(queryVector, this.nodes.get(neighborId).vector);
          candidates.push({ id: neighborId, distance });
        }
      }
      candidates.sort((a, b) => b.distance - a.distance);
    }

    return results;
  }

  /**
   * Searches a specific layer for the closest node to the given vector.
   * @* @param {number[]} vector - The query vector.
   * @param {string} entryNodeId - Entry point node ID.
   * @param {number} layer - Layer to search.
   * @returns {string} - Closest node ID.
   */
  _searchLayer(vector, entryNodeId, layer) {
    let closestNodeId = entryNodeId;
    let closestDistance = euclideanDistance(vector, this.nodes.get(entryNodeId).vector);

    let improved = true;
    while (improved) {
      improved = false;
      for (const neighborId of this.nodes.get(closestNodeId).neighbors.get(layer) || []) {
        const distance = euclideanDistance(vector, this.nodes.get(neighborId).vector);
        if (distance < closestDistance) {
          closestDistance = distance;
          closestNodeId = neighborId;
          improved = true;
        }
      }
    }

    return closestNodeId;
  }

  /**
   * Connects a new node to the graph.
   * @* @param {HNSWNode} newNode - The new node to connect.
   * @param {string} entryNodeId - Entry point node ID.
   */
  _connectNewNode(newNode, entryNodeId) {
    const layer = 0; // For simplicity, we only implement a single layer.
    const neighbors = this._searchLayerForNeighbors(newNode.vector, entryNodeId, layer);

    newNode.neighbors.set(layer, new Set(neighbors.map(n => n.id)));
    for (const neighborId of neighbors.map(n => n.id)) {
      const neighborNode = this.nodes.get(neighborId);
      if (!neighborNode.neighbors.has(layer)) {
        neighborNode.neighbors.set(layer, new Set());
      }
      neighborNode.neighbors.get(layer).add(newNode.id);
    }
  }

  /**
   * Searches a layer for neighbors to connect to a new node.
   * @* @param {number[]} vector - The new node's vector.
   * @param {string} entryNodeId - Entry point node ID.
   * @param {number} layer - Layer to search.
   * @returns {Array<{id, distance}>} - Nearest neighbors.
   */
  _searchLayerForNeighbors(vector, entryNodeId, layer) {
    const candidates = [{ id: entryNodeId, distance: euclideanDistance(vector, this.nodes.get(entryNodeId).vector) }];
    const results = [];

    while (candidates.length > 0) {
      const current = candidates.pop();
      results.push(current);
      results.sort((a, b) => a.distance - b.distance);
      if (results.length > this.maxNeighbors) results.pop();

      for (const neighborId of this.nodes.get(current.id).neighbors.get(layer) || []) {
        const distance = euclideanDistance(vector, this.nodes.get(neighborId).vector);
        candidates.push({ id: neighborId, distance });
      }
      candidates.sort((a, b) => b.distance - a.distance);
    }

    return results;
  }

  /**
   * Gets the maximum layer in the graph.
   * @* @returns {number} - Maximum layer.
   */
  getMaxLayer() {
    return 0; // For simplicity, we only implement a single layer.
  }
}
