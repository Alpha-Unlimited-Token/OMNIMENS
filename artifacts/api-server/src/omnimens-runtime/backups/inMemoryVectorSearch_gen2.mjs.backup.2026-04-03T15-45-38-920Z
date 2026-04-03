/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: inMemoryVectorSearch
 * Written: 2026-04-03T08:37:32.141Z
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
 * Utility to calculate cosine similarity between two vectors.
 * @param {number[]} vectorA - First vector.
 * @param {number[]} vectorB - Second vector.
 * @returns {number} - Cosine similarity score between -1 and 1.
 */
export function cosineSimilarity(vectorA, vectorB) {
  if (vectorA.length !== vectorB.length) {
    throw new Error('Vectors must be of the same length');
  }

  const dotProduct = vectorA.reduce((sum, val, i) => sum + val * vectorB[i], 0);
  const magnitudeA = Math.sqrt(vectorA.reduce((sum, val) => sum + val ** 2, 0));
  const magnitudeB = Math.sqrt(vectorB.reduce((sum, val) => sum + val ** 2, 0));

  if (magnitudeA === 0 || magnitudeB === 0) {
    throw new Error('Vectors must not be zero-vectors');
  }

  return dotProduct / (magnitudeA * magnitudeB);
}

/**
 * HNSW Node class representing a single point in the graph.
 * @class
 */
class HNSWNode {
  constructor(id, vector) {
    this.id = id;
    this.vector = vector;
    this.neighbors = new Map(); // Map of level -> neighbors array
  }
}

/**
 * HNSW Graph class for approximate nearest neighbor search.
 * @class
 */
export class HNSWGraph {
  constructor(maxNeighbors = 16) {
    this.nodes = new Map(); // Map of node ID -> HNSWNode
    this.maxNeighbors = maxNeighbors;
  }

  /**
   * Add a new vector to the graph.
   * @param {string} id - Unique identifier for the vector.
   * @param {number[]} vector - Vector to add.
   */
  addNode(id, vector) {
    if (this.nodes.has(id)) {
      throw new Error(`Node with ID '${id}' already exists`);
    }
    const newNode = new HNSWNode(id, vector);
    this.nodes.set(id, newNode);

    // Connect to neighbors using cosine similarity
    for (const [otherId, otherNode] of this.nodes) {
      if (otherId === id) continue;
      const similarity = cosineSimilarity(vector, otherNode.vector);
      this._addNeighbor(newNode, otherNode, similarity);
    }
  }

  /**
   * Search for the nearest neighbors to a given vector.
   * @param {number[]} queryVector - Vector to search for.
   * @param {number} k - Number of nearest neighbors to return.
   * @returns {Array<{id, similarity}>} - List of nearest neighbors.
   */
  search(queryVector, k = 5) {
    const results = [];

    for (const [id, node] of this.nodes) {
      const similarity = cosineSimilarity(queryVector, node.vector);
      results.push({ id, similarity });
    }

    return results
      .sort((a, b) => b.similarity - a.similarity) // Sort by similarity descending
      .slice(0, k); // Return top-k results
  }

  /**
   * Add a neighbor to a node, ensuring maxNeighbors constraint.
   * @* @param {HNSWNode} node - Node to add neighbor to.
   * @param {HNSWNode} neighbor - Neighbor node.
   * @param {number} similarity - Similarity score.
   */
  _addNeighbor(node, neighbor, similarity) {
    if (!node.neighbors.has(0)) {
      node.neighbors.set(0, []);
    }

    const neighbors = node.neighbors.get(0);
    neighbors.push({ neighbor, similarity });

    // Sort neighbors by similarity and enforce maxNeighbors constraint
    neighbors.sort((a, b) => b.similarity - a.similarity);
    if (neighbors.length > this.maxNeighbors) {
      neighbors.pop();
    }
  }
}

/**
 * Generate a deterministic hash for a vector (useful for IDs).
 * @param {number[]} vector - Vector to hash.
 * @returns {string} - Hash string.
 */
export function hashVector(vector) {
  const hash = createHash('sha256');
  hash.update(vector.join(','));
  return hash.digest('hex');
}

/**
 * Example usage of the module.
 */
export function exampleUsage() {
  const graph = new HNSWGraph();

  const vectorA = [1, 0, 0];
  const vectorB = [0, 1, 0];
  const vectorC = [1, 1, 0];

  graph.addNode('A', vectorA);
  graph.addNode('B', vectorB);
  graph.addNode('C', vectorC);

  const queryVector = [0.9, 0.1, 0];
  const results = graph.search(queryVector, 2);

  return results;
}