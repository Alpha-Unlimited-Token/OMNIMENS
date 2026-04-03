/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: inMemoryVectorSearch
 * Written: 2026-04-03T16:10:24.444Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// inMemoryVectorSearch.mjs

import { createHash } from 'crypto';

/**
 * Utility function to compute the cosine similarity between two vectors.
 * @param {number[]} vecA - First vector.
 * @param {number[]} vecB - Second vector.
 * @returns {number} - Cosine similarity between vecA and vecB.
 */
export function cosineSimilarity(vecA, vecB) {
  if (vecA.length !== vecB.length) throw new Error('Vectors must be of the same dimension.');

  const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
  const magnitudeA = Math.sqrt(vecA.reduce((sum, a) => sum + a ** 2, 0));
  const magnitudeB = Math.sqrt(vecB.reduce((sum, b) => sum + b ** 2, 0));

  return magnitudeA && magnitudeB ? dotProduct / (magnitudeA * magnitudeB) : 0;
}

/**
 * Generates a unique hash for a vector to use as an identifier.
 * @param {number[]} vector - Input vector.
 * @returns {string} - Unique hash string.
 */
export function hashVector(vector) {
  const hash = createHash('sha256');
  hash.update(vector.join(','));
  return hash.digest('hex');
}

/**
 * Class implementing an in-memory vector store with HNSW-like approximate nearest neighbor search.
 */
export class InMemoryVectorSearch {
  constructor() {
    this.vectors = new Map(); // Stores vectors with their hashes as keys.
    this.graph = new Map(); // Adjacency list for HNSW graph.
  }

  /**
   * Adds a vector to the store.
   * @param {number[]} vector - Vector to add.
   */
  addVector(vector) {
    const vectorHash = hashVector(vector);
    if (this.vectors.has(vectorHash)) return; // Avoid duplicates.

    this.vectors.set(vectorHash, vector);
    this.graph.set(vectorHash, new Set());

    // Connect to nearest neighbors (approximation step).
    const neighbors = this.getNearestNeighbors(vector, 5);
    for (const neighbor of neighbors) {
      this.graph.get(vectorHash).add(neighbor.hash);
      this.graph.get(neighbor.hash).add(vectorHash);
    }
  }

  /**
   * Finds the nearest neighbors to a given vector.
   * @param {number[]} queryVector - Query vector.
   * @param {number} k - Number of neighbors to retrieve.
   * @returns {Array<{ hash, vector, similarity}>} - List of nearest neighbors.
   */
  getNearestNeighbors(queryVector, k = 5) {
    const candidates = Array.from(this.vectors.entries())
      .map(([hash, vector]) => ({
        hash,
        vector,
        similarity: cosineSimilarity(queryVector, vector)
      }))
      .sort((a, b) => b.similarity - a.similarity);

    return candidates.slice(0, k);
  }

  /**
   * Performs a search using the HNSW graph for approximate nearest neighbors.
   * @param {number[]} queryVector - Query vector.
   * @param {number} k - Number of neighbors to retrieve.
   * @returns {Array<{ hash, vector, similarity}>} - List of nearest neighbors.
   */
  search(queryVector, k = 5) {
    const visited = new Set();
    const entryPoints = Array.from(this.graph.keys());
    let bestCandidates = [];

    for (const entry of entryPoints) {
      if (visited.has(entry)) continue;
      visited.add(entry);

      const vector = this.vectors.get(entry);
      const similarity = cosineSimilarity(queryVector, vector);
      bestCandidates.push({ hash: entry, vector, similarity });

      // Expand graph neighbors.
      for (const neighbor of this.graph.get(entry)) {
        if (!visited.has(neighbor)) {
          visited.add(neighbor);
          const neighborVector = this.vectors.get(neighbor);
          const neighborSimilarity = cosineSimilarity(queryVector, neighborVector);
          bestCandidates.push({ hash: neighbor, vector: neighborVector, similarity: neighborSimilarity });
        }
      }
    }

    return bestCandidates
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, k);
  }
}

/**
 * Utility function to normalize a vector.
 * @param {number[]} vector - Input vector.
 * @returns {number[]} - Normalized vector.
 */
export function normalizeVector(vector) {
  const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val ** 2, 0));
  return magnitude ? vector.map((val) => val / magnitude) : vector;
}