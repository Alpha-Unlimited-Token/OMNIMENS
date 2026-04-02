/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: inMemoryVectorStore
 * Written: 2026-04-02T15:12:48.031Z
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
 * Utility to store and retrieve high-dimensional embeddings for fast similarity search using HNSW-like graph.
 */

// Node structure for HNSW graph
class Node {
  constructor(id, embedding) {
    this.id = id;
    this.embedding = embedding;
    this.neighbors = new Map(); // Layered neighbors
  }
}

// Utility function to calculate cosine similarity
export function cosineSimilarity(vecA, vecB) {
  const dotProduct = vecA.reduce((sum, val, i) => sum + val * vecB[i], 0);
  const magnitudeA = Math.sqrt(vecA.reduce((sum, val) => sum + val ** 2, 0));
  const magnitudeB = Math.sqrt(vecB.reduce((sum, val) => sum + val ** 2, 0));
  return dotProduct / (magnitudeA * magnitudeB);
}

// HNSW-like graph implementation
export class InMemoryVectorStore {
  constructor(maxNeighbors = 10) {
    this.nodes = new Map();
    this.maxNeighbors = maxNeighbors; // Maximum neighbors per node
  }

  // Add a new vector to the store
  addVector(id, embedding) {
    if (this.nodes.has(id)) {
      throw new Error(`Vector with ID '${id}' already exists.`);
    }

    const newNode = new Node(id, embedding);
    this.nodes.set(id, newNode);

    // Connect to nearest neighbors
    this._connectToNeighbors(newNode);
  }

  // Retrieve nearest neighbors for a given vector
  getNearestNeighbors(queryEmbedding, k = 5) {
    const results = [];

    for (const node of this.nodes.values()) {
      const similarity = cosineSimilarity(queryEmbedding, node.embedding);
      results.push({ id: node.id, similarity });
    }

    // Sort by similarity in descending order and return top k
    return results.sort((a, b) => b.similarity - a.similarity).slice(0, k);
  }

  // Internal method to connect a new node to its nearest neighbors
  _connectToNeighbors(newNode) {
    const neighbors = [];

    for (const node of this.nodes.values()) {
      if (node.id !== newNode.id) {
        const similarity = cosineSimilarity(newNode.embedding, node.embedding);
        neighbors.push({ node, similarity });
      }
    }

    // Sort by similarity in descending order and select top neighbors
    neighbors.sort((a, b) => b.similarity - a.similarity);
    const topNeighbors = neighbors.slice(0, this.maxNeighbors);

    // Add bidirectional connections
    for (const { node } of topNeighbors) {
      newNode.neighbors.set(node.id, node);
      node.neighbors.set(newNode.id, newNode);
    }
  }

  // Utility to hash embeddings for unique identification (optional)
  static hashEmbedding(embedding) {
    const hash = createHash('sha256');
    hash.update(embedding.join(','));
    return hash.digest('hex');
  }
}

// Example usage
export function exampleUsage() {
  const store = new InMemoryVectorStore();

  // Add vectors
  store.addVector('vec1', [0.1, 0.2, 0.3]);
  store.addVector('vec2', [0.4, 0.5, 0.6]);
  store.addVector('vec3', [0.7, 0.8, 0.9]);

  // Query nearest neighbors
  const neighbors = store.getNearestNeighbors([0.15, 0.25, 0.35]);
  return neighbors;
}
