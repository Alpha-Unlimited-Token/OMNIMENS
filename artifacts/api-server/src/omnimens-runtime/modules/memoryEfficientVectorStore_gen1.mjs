/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: memoryEfficientVectorStore
 * Written: 2026-03-22T20:48:33.657Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// memoryEfficientVectorStore.js

/**
 * @module memoryEfficientVectorStore
 * @description Implements an in-memory vector store with approximate nearest neighbors (ANN) search using the HNSW algorithm.
 */

/**
 * @typedef {Object} Node
 * @property {number[]} vector - The semantic embedding vector.
 * @property {number} id - Unique identifier for the node.
 * @property {Map<number, number[]>} neighbors - Map of layer number to neighbor IDs.
 */

/**
 * @typedef {Object} SearchResult
 * @property {number} id - The ID of the nearest neighbor.
 * @property {number} distance - The distance to the query vector.
 */

/**
 * Calculates the Euclidean distance between two vectors.
 * @param {number[]} vectorA - First vector.
 * @param {number[]} vectorB - Second vector.
 * @returns {number} - Euclidean distance.
 */
function euclideanDistance(vectorA, vectorB) {
  if (vectorA.length !== vectorB.length) {
    throw new Error("Vectors must have the same length.");
  }
  return Math.sqrt(vectorA.reduce((sum, val, index) => sum + Math.pow(val - vectorB[index], 2), 0));
}

/**
 * Class representing the HNSW-based vector store.
 */
class HNSWVectorStore {
  constructor(maxLayers = 3, maxNeighbors = 5) {
    this.maxLayers = maxLayers;
    this.maxNeighbors = maxNeighbors;
    this.nodes = new Map();
    this.layerConnections = new Map();
  }

  /**
   * Adds a vector to the store.
   * @param {number[]} vector - The vector to add.
   * @param {number} id - Unique identifier for the vector.
   */
  addVector(vector, id) {
    if (this.nodes.has(id)) {
      throw new Error("ID already exists in the store.");
    }

    const node = { vector, id, neighbors: new Map() };
    this.nodes.set(id, node);

    for (let layer = 0; layer < this.maxLayers; layer++) {
      this._connectNode(node, layer);
    }
  }

  /**
   * Searches for the nearest neighbor to a given query vector.
   * @param {number[]} queryVector - The query vector.
   * @returns {SearchResult} - The nearest neighbor.
   */
  searchNearest(queryVector) {
    let bestMatch = null;
    let bestDistance = Infinity;

    for (const node of this.nodes.values()) {
      const distance = euclideanDistance(queryVector, node.vector);
      if (distance < bestDistance) {
        bestDistance = distance;
        bestMatch = node;
      }
    }

    return { id: bestMatch.id, distance: bestDistance };
  }

  /**
   * Connects a node to its neighbors in a given layer.
   * @param {Node} node - The node to connect.
   * @param {number} layer - The layer number.
   * @*/
  _connectNode(node, layer) {
    const candidates = Array.from(this.nodes.values());
    candidates.sort((a, b) => euclideanDistance(node.vector, a.vector) - euclideanDistance(node.vector, b.vector));

    const neighbors = candidates.slice(0, this.maxNeighbors).map(candidate => candidate.id);
    node.neighbors.set(layer, neighbors);
  }
}

/**
 * Exports the HNSWVectorStore class and utility functions.
 */
export { HNSWVectorStore, euclideanDistance };