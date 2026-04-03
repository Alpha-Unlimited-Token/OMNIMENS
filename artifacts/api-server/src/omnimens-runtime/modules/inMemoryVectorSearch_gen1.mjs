/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: inMemoryVectorSearch
 * Written: 2026-04-03T13:56:52.672Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// inMemoryVectorSearch.mjs

import { randomUUID } from 'crypto';

/**
 * Calculate the Euclidean distance between two vectors.
 * @param {number[]} vectorA - First vector.
 * @param {number[]} vectorB - Second vector.
 * @returns {number} - Euclidean distance.
 */
export function euclideanDistance(vectorA, vectorB) {
  if (vectorA.length !== vectorB.length) {
    throw new Error('Vectors must have the same dimensions');
  }
  return Math.sqrt(vectorA.reduce((sum, val, i) => sum + (val - vectorB[i]) ** 2, 0));
}

/**
 * Node in the HNSW graph.
 * @typedef {Object} HNSWNode
 * @property {string} id - Unique identifier for the node.
 * @property {number[]} vector - The embedding vector.
 * @property {Map<number, Set<string>>} neighbors - Map of layer to neighbors.
 */

/**
 * HNSW Graph class for in-memory vector search.
 */
export class HNSWGraph {
  constructor(maxLayers = 5, maxNeighbors = 10) {
    this.maxLayers = maxLayers;
    this.maxNeighbors = maxNeighbors;
    this.nodes = new Map();
    this.entryPoint = null;
  }

  /**
   * Add a new vector to the graph.
   * @param {number[]} vector - The embedding vector to add.
   */
  addVector(vector) {
    const id = randomUUID();
    const node = {
      id,
      vector,
      neighbors: new Map()
    };

    for (let layer = 0; layer < this.maxLayers; layer++) {
      node.neighbors.set(layer, new Set());
    }

    this.nodes.set(id, node);

    if (!this.entryPoint) {
      this.entryPoint = id;
      return;
    }

    let currentNodeId = this.entryPoint;

    for (let layer = this.maxLayers - 1; layer >= 0; layer--) {
      currentNodeId = this._searchLayer(vector, currentNodeId, layer);
    }

    this._connectNeighbors(node, currentNodeId, 0);
  }

  /**
   * Search for the nearest neighbors of a query vector.
   * @param {number[]} queryVector - The query embedding vector.
   * @param {number} k - Number of nearest neighbors to return.
   * @returns {Array<{ id, distance}>} - Nearest neighbors.
   */
  search(queryVector, k) {
    if (!this.entryPoint) {
      return [];
    }

    let currentNodeId = this.entryPoint;

    for (let layer = this.maxLayers - 1; layer >= 0; layer--) {
      currentNodeId = this._searchLayer(queryVector, currentNodeId, layer);
    }

    const candidates = new Set([currentNodeId]);
    const results = [];

    for (const candidateId of candidates) {
      const candidateNode = this.nodes.get(candidateId);
      const distance = euclideanDistance(queryVector, candidateNode.vector);
      results.push({ id: candidateId, distance });
    }

    return results
      .sort((a, b) => a.distance - b.distance)
      .slice(0, k);
  }

  /**
   * Search within a specific layer for the closest node.
   * @* @param {number[]} queryVector - The query vector.
   * @param {string} entryNodeId - Starting node ID.
   * @param {number} layer - The layer to search.
   * @returns {string} - ID of the closest node.
   */
  _searchLayer(queryVector, entryNodeId, layer) {
    let closestNodeId = entryNodeId;
    let closestDistance = euclideanDistance(queryVector, this.nodes.get(entryNodeId).vector);

    let changed = true;
    while (changed) {
      changed = false;
      for (const neighborId of this.nodes.get(closestNodeId).neighbors.get(layer)) {
        const neighborNode = this.nodes.get(neighborId);
        const distance = euclideanDistance(queryVector, neighborNode.vector);
        if (distance < closestDistance) {
          closestDistance = distance;
          closestNodeId = neighborId;
          changed = true;
        }
      }
    }

    return closestNodeId;
  }

  /**
   * Connect a new node to its nearest neighbors in the graph.
   * @* @param {HNSWNode} newNode - The new node to connect.
   * @param {string} entryNodeId - Starting node ID.
   * @param {number} layer - The layer to connect.
   */
  _connectNeighbors(newNode, entryNodeId, layer) {
    const neighbors = Array.from(this.nodes.values())
      .map(node => ({
        id: node.id,
        distance: euclideanDistance(newNode.vector, node.vector)
      }))
      .sort((a, b) => a.distance - b.distance)
      .slice(0, this.maxNeighbors);

    for (const neighbor of neighbors) {
      newNode.neighbors.get(layer).add(neighbor.id);
      this.nodes.get(neighbor.id).neighbors.get(layer).add(newNode.id);
    }
  }
}

/**
 * Utility function to normalize a vector.
 * @param {number[]} vector - The vector to normalize.
 * @returns {number[]} - Normalized vector.
 */
export function normalizeVector(vector) {
  const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val ** 2, 0));
  if (magnitude === 0) {
    throw new Error('Cannot normalize a zero vector');
  }
  return vector.map(val => val / magnitude);
}

/**
 * Utility function to generate random vectors for testing.
 * @param {number} dimensions - Number of dimensions for the vector.
 * @returns {number[]} - Random vector.
 */
export function generateRandomVector(dimensions) {
  return Array.from({ length: dimensions }, () => Math.random());
}