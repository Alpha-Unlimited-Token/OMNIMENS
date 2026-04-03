/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: inMemoryVectorSearch
 * Written: 2026-04-01T22:02:18.036Z
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
 * Computes the Euclidean distance between two vectors.
 * @param {number[]} vec1 - First vector.
 * @param {number[]} vec2 - Second vector.
 * @returns {number} - Euclidean distance.
 */
export function euclideanDistance(vec1, vec2) {
  if (vec1.length !== vec2.length) {
    throw new Error('Vectors must have the same dimensions.');
  }
  return Math.sqrt(vec1.reduce((sum, val, idx) => sum + Math.pow(val - vec2[idx], 2), 0));
}

/**
 * Generates a unique hash for a vector to use as an identifier.
 * @param {number[]} vector - The input vector.
 * @returns {string} - A unique hash for the vector.
 */
export function vectorHash(vector) {
  const hash = createHash('sha256');
  hash.update(vector.join(','));
  return hash.digest('hex');
}

/**
 * Class representing an in-memory HNSW-based vector search index.
 */
export class HNSWIndex {
  constructor() {
    this.nodes = new Map(); // Map of nodeId -> { vector, edges }
    this.levels = new Map(); // Map of level -> Set(nodeId)
    this.maxLevel = 0;
  }

  /**
   * Adds a vector to the index.
   * @param {number[]} vector - The vector to add.
   */
  addVector(vector) {
    const id = vectorHash(vector);
    if (this.nodes.has(id)) {
      throw new Error('Vector already exists in the index.');
    }

    const level = this._randomLevel();
    this.maxLevel = Math.max(this.maxLevel, level);

    this.nodes.set(id, { vector, edges: new Map() });
    if (!this.levels.has(level)) {
      this.levels.set(level, new Set());
    }
    this.levels.get(level).add(id);

    this._connectNeighbors(id, level);
  }

  /**
   * Searches for the k nearest neighbors of a query vector.
   * @param {number[]} queryVector - The query vector.
   * @param {number} k - The number of neighbors to retrieve.
   * @returns {Array<{ id, distance}>} - Array of nearest neighbors.
   */
  search(queryVector, k) {
    if (k <= 0) {
      throw new Error('k must be a positive integer.');
    }

    let currentLevel = this.maxLevel;
    let candidates = Array.from(this.levels.get(currentLevel) || []).map(id => ({
      id,
      distance: euclideanDistance(queryVector, this.nodes.get(id).vector)
    }));

    while (currentLevel >= 0) {
      candidates.sort((a, b) => a.distance - b.distance);
      candidates = candidates.slice(0, k);

      const nextCandidates = new Map();
      for (const { id } of candidates) {
        for (const neighborId of this.nodes.get(id).edges.keys()) {
          if (!nextCandidates.has(neighborId)) {
            const distance = euclideanDistance(queryVector, this.nodes.get(neighborId).vector);
            nextCandidates.set(neighborId, { id: neighborId, distance });
          }
        }
      }
      candidates = Array.from(nextCandidates.values());
      currentLevel--;
    }

    return candidates.sort((a, b) => a.distance - b.distance).slice(0, k);
  }

  /**
   * Randomly generates a level for a new vector.
   * @returns {number} - The generated level.
   */
  _randomLevel() {
    let level = 0;
    while (Math.random() < 0.5) {
      level++;
    }
    return level;
  }

  /**
   * Connects a new vector to its nearest neighbors in the given level.
   * @param {string} id - The ID of the new vector.
   * @param {number} level - The level to connect neighbors in.
   */
  _connectNeighbors(id, level) {
    if (!this.levels.has(level)) return;

    const neighbors = Array.from(this.levels.get(level)).map(neighborId => ({
      id: neighborId,
      distance: euclideanDistance(this.nodes.get(id).vector, this.nodes.get(neighborId).vector)
    }));

    neighbors.sort((a, b) => a.distance - b.distance);
    const topNeighbors = neighbors.slice(0, 5); // Limit connections to 5 nearest neighbors.

    for (const neighbor of topNeighbors) {
      this.nodes.get(id).edges.set(neighbor.id, neighbor.distance);
      this.nodes.get(neighbor.id).edges.set(id, neighbor.distance);
    }
  }
}

/**
 * Utility function for bulk indexing vectors.
 * @param {HNSWIndex} index - The HNSW index instance.
 * @param {number[][]} vectors - Array of vectors to add.
 */
export function bulkAddVectors(index, vectors) {
  for (const vector of vectors) {
    index.addVector(vector);
  }
}