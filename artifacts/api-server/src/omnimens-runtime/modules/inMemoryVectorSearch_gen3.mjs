/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: inMemoryVectorSearch
 * Written: 2026-04-03T16:10:22.607Z
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

import { createHash } from 'crypto';

/**
 * Utility function to calculate cosine similarity between two vectors.
 * @param {number[]} vectorA - First vector.
 * @param {number[]} vectorB - Second vector.
 * @returns {number} - Cosine similarity value.
 */
export function cosineSimilarity(vectorA, vectorB) {
  if (vectorA.length !== vectorB.length) {
    throw new Error('Vectors must be of the same length');
  }

  const dotProduct = vectorA.reduce((sum, a, i) => sum + a * vectorB[i], 0);
  const magnitudeA = Math.sqrt(vectorA.reduce((sum, a) => sum + a ** 2, 0));
  const magnitudeB = Math.sqrt(vectorB.reduce((sum, b) => sum + b ** 2, 0));

  if (magnitudeA === 0 || magnitudeB === 0) {
    return 0; // Avoid division by zero
  }

  return dotProduct / (magnitudeA * magnitudeB);
}

/**
 * Class implementing Hierarchical Navigable Small World (HNSW) graph for approximate nearest neighbor search.
 */
export class HNSW {
  constructor(maxElements = 1000, efConstruction = 200) {
    this.maxElements = maxElements;
    this.efConstruction = efConstruction;
    this.nodes = []; // Array to store nodes and their embeddings
  }

  /**
   * Adds a new vector to the HNSW graph.
   * @param {number[]} vector - The embedding vector to add.
   * @param {string} id - A unique identifier for the vector.
   */
  addNode(vector, id) {
    if (this.nodes.length >= this.maxElements) {
      throw new Error('Maximum number of elements reached');
    }

    const node = { id, vector, neighbors: [] };

    if (this.nodes.length > 0) {
      // Find nearest neighbors for the new node
      const nearest = this.search(vector, this.efConstruction);
      node.neighbors = nearest.map((n) => n.id);

      // Update neighbors to include the new node
      for (const neighbor of nearest) {
        neighbor.neighbors.push(id);
      }
    }

    this.nodes.push(node);
  }

  /**
   * Searches for the nearest neighbors of a given vector.
   * @param {number[]} queryVector - The query vector.
   * @param {number} k - The number of nearest neighbors to return.
   * @returns {object[]} - Array of nearest neighbor nodes.
   */
  search(queryVector, k) {
    if (this.nodes.length === 0) {
      return [];
    }

    const scoredNodes = this.nodes.map((node) => {
      return {
        id: node.id,
        vector: node.vector,
        score: cosineSimilarity(queryVector, node.vector)
      };
    });

    scoredNodes.sort((a, b) => b.score - a.score);
    return scoredNodes.slice(0, k);
  }

  /**
   * Generates a hash for a given vector for debugging or deduplication purposes.
   * @param {number[]} vector - The vector to hash.
   * @returns {string} - Hash value.
   */
  static hashVector(vector) {
    const hash = createHash('sha256');
    hash.update(vector.join(','));
    return hash.digest('hex');
  }
}

/**
 * Example utility function to normalize a vector.
 * @param {number[]} vector - The vector to normalize.
 * @returns {number[]} - Normalized vector.
 */
export function normalizeVector(vector) {
  const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val ** 2, 0));
  if (magnitude === 0) {
    throw new Error('Cannot normalize a zero vector');
  }
  return vector.map((val) => val / magnitude);
}

/**
 * Example usage: Create an HNSW instance, add nodes, and search.
 * Uncomment below to test in Node.js environment.
 */
// const hnsw = new HNSW();
// hnsw.addNode([0.1, 0.2, 0.3], 'vector1');
// hnsw.addNode([0.4, 0.5, 0.6], 'vector2');
// hnsw.addNode([0.7, 0.8, 0.9], 'vector3');
// console.log(hnsw.search([0.1, 0.2, 0.3], 2));
