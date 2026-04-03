/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: inMemoryEmbeddingIndex
 * Written: 2026-04-03T15:49:05.992Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// inMemoryEmbeddingIndex.mjs

import { randomUUID } from 'crypto';

/**
 * Node class for HNSW graph representation.
 */
class Node {
  constructor(id, embedding) {
    this.id = id;
    this.embedding = embedding;
    this.neighbors = new Map(); // Level -> Array of neighbors
  }
}

/**
 * Utility function to calculate Euclidean distance between two embeddings.
 * @param {number[]} a - First embedding.
 * @param {number[]} b - Second embedding.
 * @returns {number} - Euclidean distance.
 */
export function euclideanDistance(a, b) {
  if (a.length !== b.length) {
    throw new Error("Embeddings must have the same dimension.");
  }
  return Math.sqrt(a.reduce((sum, val, i) => sum + (val - b[i]) ** 2, 0));
}

/**
 * Class implementing HNSW graph for approximate nearest neighbor search.
 */
export class HNSW {
  constructor(maxNeighbors = 10, maxLevels = 5) {
    this.maxNeighbors = maxNeighbors;
    this.maxLevels = maxLevels;
    this.nodes = new Map();
  }

  /**
   * Add a new embedding to the graph.
   * @param {number[]} embedding - Embedding vector.
   * @returns {string} - ID of the added node.
   */
  addEmbedding(embedding) {
    const id = randomUUID();
    const newNode = new Node(id, embedding);

    // Assign levels randomly (higher levels are less likely)
    const levels = Math.floor(Math.log(Math.random() * (Math.E ** this.maxLevels)));

    for (let level = 0; level <= levels; level++) {
      newNode.neighbors.set(level, []);
    }

    this.nodes.set(id, newNode);

    // Connect the node to existing nodes in the graph
    this._connectNode(newNode);

    return id;
  }

  /**
   * Perform a similarity search to find the nearest neighbors.
   * @param {number[]} embedding - Query embedding.
   * @param {number} k - Number of nearest neighbors to return.
   * @returns {Array<{id, distance}>} - Nearest neighbors.
   */
  search(embedding, k = 1) {
    const candidates = [];

    for (const node of this.nodes.values()) {
      const distance = euclideanDistance(embedding, node.embedding);
      candidates.push({ id: node.id, distance });
    }

    candidates.sort((a, b) => a.distance - b.distance);

    return candidates.slice(0, k);
  }

  /**
   * Connect a new node to the graph using approximate nearest neighbors.
   * @param {Node} newNode - Node to connect.
   */
  _connectNode(newNode) {
    for (let level = 0; level < this.maxLevels; level++) {
      const candidates = [];

      for (const node of this.nodes.values()) {
        if (node.neighbors.has(level)) {
          const distance = euclideanDistance(newNode.embedding, node.embedding);
          candidates.push({ node, distance });
        }
      }

      candidates.sort((a, b) => a.distance - b.distance);

      const neighbors = candidates.slice(0, this.maxNeighbors).map(c => c.node);
      newNode.neighbors.set(level, neighbors);

      for (const neighbor of neighbors) {
        neighbor.neighbors.get(level).push(newNode);
      }
    }
  }
}

/**
 * Utility function to normalize an embedding vector.
 * @param {number[]} embedding - Embedding vector.
 * @returns {number[]} - Normalized embedding.
 */
export function normalizeEmbedding(embedding) {
  const norm = Math.sqrt(embedding.reduce((sum, val) => sum + val ** 2, 0));
  if (norm === 0) {
    throw new Error("Cannot normalize a zero vector.");
  }
  return embedding.map(val => val / norm);
}

/**
 * Utility function to generate random embeddings for testing.
 * @param {number} dimension - Dimension of the embedding.
 * @returns {number[]} - Random embedding vector.
 */
export function generateRandomEmbedding(dimension) {
  return Array.from({ length: dimension }, () => Math.random());
}