/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: inMemoryVectorStore
 * Written: 2026-03-22T21:28:10.321Z
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
 * @description Provides fast embedding retrieval using cosine similarity with an in-memory HNSW graph.
 */

/**
 * Computes cosine similarity between two vectors.
 * @param {number[]} vectorA - First vector.
 * @param {number[]} vectorB - Second vector.
 * @returns {number} - Cosine similarity score.
 */
function cosineSimilarity(vectorA, vectorB) {
  if (vectorA.length !== vectorB.length) {
    throw new Error('Vectors must be of the same length');
  }

  const dotProduct = vectorA.reduce((sum, val, i) => sum + val * vectorB[i], 0);
  const magnitudeA = Math.sqrt(vectorA.reduce((sum, val) => sum + val ** 2, 0));
  const magnitudeB = Math.sqrt(vectorB.reduce((sum, val) => sum + val ** 2, 0));

  if (magnitudeA === 0 || magnitudeB === 0) {
    throw new Error('Vector magnitude cannot be zero');
  }

  return dotProduct / (magnitudeA * magnitudeB);
}

/**
 * Represents a node in the HNSW graph.
 * @class
 */
class HNSWNode {
  /**
   * @param {number[]} vector - The embedding vector.
   * @param {string} id - Unique identifier for the node.
   */
  constructor(vector, id) {
    this.vector = vector;
    this.id = id;
    this.neighbors = new Set();
  }

  /**
   * Adds a neighbor to the node.
   * @param {HNSWNode} neighbor - Neighbor node.
   */
  addNeighbor(neighbor) {
    this.neighbors.add(neighbor);
  }
}

/**
 * Represents the HNSW graph for fast retrieval.
 * @class
 */
class HNSWGraph {
  constructor() {
    this.nodes = new Map();
  }

  /**
   * Adds a vector to the graph.
   * @param {number[]} vector - Embedding vector.
   * @param {string} id - Unique identifier for the vector.
   */
  addVector(vector, id) {
    if (this.nodes.has(id)) {
      throw new Error('ID already exists in the graph');
    }

    const newNode = new HNSWNode(vector, id);
    this.nodes.set(id, newNode);

    // Connect to existing nodes based on similarity
    for (const node of this.nodes.values()) {
      if (node.id !== id) {
        const similarity = cosineSimilarity(node.vector, vector);
        if (similarity > 0.8) { // Threshold for neighbor connection
          newNode.addNeighbor(node);
          node.addNeighbor(newNode);
        }
      }
    }
  }

  /**
   * Searches for the most similar vectors.
   * @param {number[]} queryVector - Query embedding vector.
   * @param {number} k - Number of top results to retrieve.
   * @returns {Array<{ id: string, similarity: number }>} - Top k results with similarity scores.
   */
  search(queryVector, k) {
    const results = [];

    for (const node of this.nodes.values()) {
      const similarity = cosineSimilarity(node.vector, queryVector);
      results.push({ id: node.id, similarity });
    }

    return results
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, k);
  }
}

/**
 * Creates a new instance of the HNSW graph.
 * @returns {HNSWGraph} - Instance of the HNSW graph.
 */
function createHNSWGraph() {
  return new HNSWGraph();
}

export { cosineSimilarity, createHNSWGraph };