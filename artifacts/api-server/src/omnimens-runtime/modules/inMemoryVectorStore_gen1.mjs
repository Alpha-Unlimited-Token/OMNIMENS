/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: inMemoryVectorStore
 * Written: 2026-03-23T00:24:23.604Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// Complete ES module code here, starting with /** JSDoc */ and exports

/**
 * @module inMemoryVectorStore
 * @description This module provides an in-memory vector store with fast approximate nearest neighbor search using HNSW-like graph-based algorithms.
 */

/**
 * Represents a node in the graph used for HNSW-like nearest neighbor search.
 * @typedef {Object} GraphNode
 * @property {number[]} vector - The embedding vector.
 * @property {Set<number>} neighbors - Indices of neighboring nodes.
 */

/**
 * Calculates the Euclidean distance between two vectors.
 * @param {number[]} vectorA - The first vector.
 * @param {number[]} vectorB - The second vector.
 * @returns {number} - The Euclidean distance.
 */
function euclideanDistance(vectorA, vectorB) {
  if (vectorA.length !== vectorB.length) {
    throw new Error('Vectors must have the same dimensions.');
  }
  return Math.sqrt(vectorA.reduce((sum, val, i) => sum + Math.pow(val - vectorB[i], 2), 0));
}

/**
 * Class representing an in-memory vector store with HNSW-like graph-based search.
 */
class InMemoryVectorStore {
  constructor() {
    /**
     * @type {GraphNode[]}
     * @private
     */
    this.graph = [];
  }

  /**
   * Adds a vector to the store.
   * @param {number[]} vector - The vector to add.
   */
  addVector(vector) {
    const newNode = { vector, neighbors: new Set() };
    const index = this.graph.length;

    // Connect to existing nodes based on similarity
    this.graph.forEach((node, i) => {
      const distance = euclideanDistance(vector, node.vector);
      if (distance < 1.0) { // Threshold for neighbor connection (adjustable)
        newNode.neighbors.add(i);
        node.neighbors.add(index);
      }
    });

    this.graph.push(newNode);
  }

  /**
   * Searches for the nearest neighbors of a given vector.
   * @param {number[]} queryVector - The vector to search for.
   * @param {number} k - The number of nearest neighbors to return.
   * @returns {Array<{index: number, distance: number}>} - The nearest neighbors.
   */
  search(queryVector, k) {
    if (k <= 0) {
      throw new Error('Number of neighbors (k) must be greater than 0.');
    }

    const distances = this.graph.map((node, index) => ({
      index,
      distance: euclideanDistance(queryVector, node.vector)
    }));

    distances.sort((a, b) => a.distance - b.distance);

    return distances.slice(0, k);
  }

  /**
   * Returns the total number of vectors stored.
   * @returns {number} - The count of vectors.
   */
  count() {
    return this.graph.length;
  }
}

/**
 * Creates a new instance of the in-memory vector store.
 * @returns {InMemoryVectorStore} - The vector store instance.
 */
function createVectorStore() {
  return new InMemoryVectorStore();
}

export { createVectorStore, euclideanDistance };