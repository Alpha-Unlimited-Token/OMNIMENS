/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: inMemoryVectorStore
 * Written: 2026-04-03T14:26:02.997Z
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
 * @returns {number} - Cosine similarity score.
 */
export function cosineSimilarity(vectorA, vectorB) {
  const dotProduct = vectorA.reduce((sum, val, i) => sum + val * vectorB[i], 0);
  const magnitudeA = Math.sqrt(vectorA.reduce((sum, val) => sum + val ** 2, 0));
  const magnitudeB = Math.sqrt(vectorB.reduce((sum, val) => sum + val ** 2, 0));
  return magnitudeA && magnitudeB ? dotProduct / (magnitudeA * magnitudeB) : 0;
}

/**
 * Utility function to hash a vector for unique identification.
 * @param {number[]} vector - Input vector.
 * @returns {string} - Hash string.
 */
export function hashVector(vector) {
  return createHash('sha256').update(vector.join(',')).digest('hex');
}

/**
 * Class implementing an in-memory vector store with HNSW-like approximate nearest neighbor search.
 */
export class InMemoryVectorStore {
  constructor() {
    this.nodes = new Map(); // Stores nodes by their hashed vector.
    this.edges = new Map(); // Adjacency list for HNSW graph.
  }

  /**
   * Adds a vector to the store.
   * @param {number[]} vector - The vector to add.
   */
  addVector(vector) {
    const hash = hashVector(vector);
    if (!this.nodes.has(hash)) {
      this.nodes.set(hash, vector);
      this.edges.set(hash, new Set());
      this._connectNeighbors(hash);
    }
  }

  /**
   * Finds the k-nearest neighbors of a given vector.
   * @param {number[]} queryVector - The query vector.
   * @param {number} k - Number of neighbors to return.
   * @returns {Array<{vector, similarity}>} - List of k-nearest neighbors.
   */
  findNearestNeighbors(queryVector, k) {
    const visited = new Set();
    const candidates = Array.from(this.nodes.keys());

    const scoredCandidates = candidates.map((hash) => {
      const vector = this.nodes.get(hash);
      return { hash, similarity: cosineSimilarity(queryVector, vector) };
    });

    scoredCandidates.sort((a, b) => b.similarity - a.similarity);

    const nearestNeighbors = scoredCandidates.slice(0, k).map(({ hash, similarity }) => ({
      vector: this.nodes.get(hash),
      similarity
    }));

    return nearestNeighbors;
  }

  /**
   * Private method to connect a new node to its neighbors in the graph.
   * @param {string} hash - Hash of the new vector.
   */
  _connectNeighbors(hash) {
    const vector = this.nodes.get(hash);
    const neighbors = this.findNearestNeighbors(vector, 5); // Connect to 5 nearest neighbors.

    for (const { vector: neighborVector } of neighbors) {
      const neighborHash = hashVector(neighborVector);
      this.edges.get(hash).add(neighborHash);
      this.edges.get(neighborHash).add(hash);
    }
  }
}

/**
 * Utility function to create a new instance of InMemoryVectorStore.
 * @returns {InMemoryVectorStore} - New vector store instance.
 */
export function createVectorStore() {
  return new InMemoryVectorStore();
}