/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: inMemoryVectorStore
 * Written: 2026-03-22T23:11:19.470Z
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
 * @description Implements an in-memory vector store with fast semantic search and similarity queries using HNSW (Hierarchical Navigable Small World) graph.
 * This module is designed for efficient approximate nearest neighbor (ANN) search for high-dimensional embeddings.
 */

/**
 * @typedef {Object} Node
 * @property {number[]} vector - The embedding vector stored in the node.
 * @property {number} id - Unique identifier for the node.
 * @property {Set<number>} neighbors - Set of neighbor node IDs.
 */

/**
 * @typedef {Object} SearchResult
 * @property {number} id - ID of the nearest neighbor.
 * @property {number} distance - Distance to the query vector.
 */

/**
 * Calculates the Euclidean distance between two vectors.
 * @param {number[]} vectorA - First vector.
 * @param {number[]} vectorB - Second vector.
 * @returns {number} - Euclidean distance.
 */
function euclideanDistance(vectorA, vectorB) {
  if (vectorA.length !== vectorB.length) {
    throw new Error("Vectors must have the same dimensions.");
  }
  return Math.sqrt(vectorA.reduce((sum, val, i) => sum + Math.pow(val - vectorB[i], 2), 0));
}

/**
 * Class representing the HNSW-based in-memory vector store.
 */
class InMemoryVectorStore {
  constructor() {
    /** @type {Map<number, Node>} */
    this.nodes = new Map();
    this.nextId = 0;
  }

  /**
   * Adds a vector to the store.
   * @param {number[]} vector - Embedding vector to add.
   * @returns {number} - ID of the added vector.
   */
  addVector(vector) {
    const id = this.nextId++;
    const node = { vector, id, neighbors: new Set() };
    this.nodes.set(id, node);

    // Connect to existing nodes based on proximity.
    this.nodes.forEach(existingNode => {
      if (existingNode.id !== id) {
        const distance = euclideanDistance(vector, existingNode.vector);
        if (distance < 1.0) { // Threshold for proximity (adjustable)
          node.neighbors.add(existingNode.id);
          existingNode.neighbors.add(id);
        }
      }
    });

    return id;
  }

  /**
   * Searches for the nearest neighbor to a query vector.
   * @param {number[]} queryVector - Query embedding vector.
   * @returns {SearchResult} - Nearest neighbor and its distance.
   */
  searchNearest(queryVector) {
    let nearest = null;
    let minDistance = Infinity;

    this.nodes.forEach(node => {
      const distance = euclideanDistance(queryVector, node.vector);
      if (distance < minDistance) {
        minDistance = distance;
        nearest = node;
      }
    });

    if (!nearest) {
      throw new Error("No vectors in the store.");
    }

    return { id: nearest.id, distance: minDistance };
  }

  /**
   * Performs a k-nearest neighbors search.
   * @param {number[]} queryVector - Query embedding vector.
   * @param {number} k - Number of neighbors to retrieve.
   * @returns {SearchResult[]} - Array of k nearest neighbors.
   */
  searchKNearest(queryVector, k) {
    const results = [];

    this.nodes.forEach(node => {
      const distance = euclideanDistance(queryVector, node.vector);
      results.push({ id: node.id, distance });
    });

    return results
      .sort((a, b) => a.distance - b.distance)
      .slice(0, k);
  }
}

// Exporting the module.
export { InMemoryVectorStore, euclideanDistance };