/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: embeddingCache
 * Written: 2026-03-24T00:41:56.306Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

/**
 * @module embeddingCache
 * @description A utility module for storing and retrieving embeddings using approximate nearest neighbor (ANN) search with HNSW-like algorithm.
 */

/**
 * Represents a node in the HNSW graph.
 * @typedef {Object} Node
 * @property {number[]} vector - The embedding vector.
 * @property {number} id - Unique identifier for the node.
 * @property {Map<number, Set<number>>} neighbors - Hierarchical levels with connected neighbor IDs.
 */

/**
 * Calculates the Euclidean distance between two vectors.
 * @param {number[]} vectorA - First vector.
 * @param {number[]} vectorB - Second vector.
 * @returns {number} The Euclidean distance.
 */
function euclideanDistance(vectorA, vectorB) {
  if (vectorA.length !== vectorB.length) {
    throw new Error("Vectors must be of the same dimension.");
  }
  return Math.sqrt(vectorA.reduce((sum, val, i) => sum + (val - vectorB[i]) ** 2, 0));
}

/**
 * Class representing the HNSW graph for ANN search.
 */
class HNSW {
  /**
   * Creates an instance of HNSW.
   * @param {number} maxNeighbors - Maximum number of neighbors per node per level.
   * @param {number} maxLevels - Maximum number of hierarchical levels.
   */
  constructor(maxNeighbors = 5, maxLevels = 3) {
    this.maxNeighbors = maxNeighbors;
    this.maxLevels = maxLevels;
    this.nodes = new Map(); // Map of node ID to Node
    this.entryPoint = null; // Entry point for the graph
  }

  /**
   * Adds a new vector to the HNSW graph.
   * @param {number[]} vector - The embedding vector to add.
   * @param {number} id - Unique identifier for the vector.
   */
  add(vector, id) {
    if (this.nodes.has(id)) {
      throw new Error("ID already exists in the graph.");
    }

    const newNode = {
      vector,
      id,
      neighbors: new Map()
    };

    for (let level = 0; level < this.maxLevels; level++) {
      newNode.neighbors.set(level, new Set());
    }

    this.nodes.set(id, newNode);

    if (this.entryPoint === null) {
      this.entryPoint = id;
      return;
    }

    let currentNodeId = this.entryPoint;
    for (let level = this.maxLevels - 1; level >= 0; level--) {
      currentNodeId = this._searchLevel(vector, currentNodeId, level);
      this._connectNeighbors(newNode, currentNodeId, level);
    }
  }

  /**
   * Searches for the nearest neighbors of a given vector.
   * @param {number[]} queryVector - The query embedding vector.
   * @param {number} k - Number of nearest neighbors to retrieve.
   * @returns {Array<{id: number, distance: number}>} List of nearest neighbors with distances.
   */
  search(queryVector, k = 1) {
    if (this.entryPoint === null) {
      return [];
    }

    let currentNodeId = this.entryPoint;
    for (let level = this.maxLevels - 1; level >= 0; level--) {
      currentNodeId = this._searchLevel(queryVector, currentNodeId, level);
    }

    const visited = new Set();
    const candidates = [{ id: currentNodeId, distance: euclideanDistance(queryVector, this.nodes.get(currentNodeId).vector) }];

    while (candidates.length > 0) {
      const { id } = candidates.pop();
      visited.add(id);

      for (const neighborId of this.nodes.get(id).neighbors.get(0)) {
        if (!visited.has(neighborId)) {
          const distance = euclideanDistance(queryVector, this.nodes.get(neighborId).vector);
          candidates.push({ id: neighborId, distance });
        }
      }

      candidates.sort((a, b) => a.distance - b.distance);
      if (candidates.length > k) {
        candidates.length = k;
      }
    }

    return candidates;
  }

  /**
   * Searches for the closest node at a specific level.
   * @private
   * @param {number[]} vector - The query vector.
   * @param {number} entryId - Starting node ID.
   * @param {number} level - Level to search on.
   * @returns {number} The closest node ID at the level.
   */
  _searchLevel(vector, entryId, level) {
    let currentId = entryId;
    let closestDistance = euclideanDistance(vector, this.nodes.get(currentId).vector);

    let improved = true;
    while (improved) {
      improved = false;
      for (const neighborId of this.nodes.get(currentId).neighbors.get(level)) {
        const distance = euclideanDistance(vector, this.nodes.get(neighborId).vector);
        if (distance < closestDistance) {
          closestDistance = distance;
          currentId = neighborId;
          improved = true;
        }
      }
    }

    return currentId;
  }

  /**
   * Connects the new node to its nearest neighbors at a given level.
   * @private
   * @param {Node} newNode - The new node to connect.
   * @param {number} closestId - The closest node ID.
   * @param {number} level - The level to connect at.
   */
  _connectNeighbors(newNode, closestId, level) {
    const neighbors = Array.from(this.nodes.get(closestId).neighbors.get(level));
    neighbors.push(closestId);

    neighbors.sort((a, b) => {
      const distA = euclideanDistance(newNode.vector, this.nodes.get(a).vector);
      const distB = euclideanDistance(newNode.vector, this.nodes.get(b).vector);
      return distA - distB;
    });

    neighbors.length = Math.min(neighbors.length, this.maxNeighbors);

    newNode.neighbors.get(level).add(...neighbors);
    for (const neighborId of neighbors) {
      this.nodes.get(neighborId).neighbors.get(level).add(newNode.id);
    }
  }
}

export { HNSW, euclideanDistance };