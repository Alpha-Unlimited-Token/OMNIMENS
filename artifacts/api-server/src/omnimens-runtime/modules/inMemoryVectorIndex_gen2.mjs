/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: inMemoryVectorIndex
 * Written: 2026-04-03T07:00:34.548Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// inMemoryVectorIndex.mjs

import { createHash } from 'crypto';

/**
 * Computes the cosine similarity between two vectors.
 * @param {number[]} vecA - First vector.
 * @param {number[]} vecB - Second vector.
 * @returns {number} - Cosine similarity score.
 */
export function cosineSimilarity(vecA, vecB) {
  if (vecA.length !== vecB.length) {
    throw new Error('Vectors must be of the same length');
  }

  const dotProduct = vecA.reduce((sum, val, idx) => sum + val * vecB[idx], 0);
  const magnitudeA = Math.sqrt(vecA.reduce((sum, val) => sum + val ** 2, 0));
  const magnitudeB = Math.sqrt(vecB.reduce((sum, val) => sum + val ** 2, 0));

  return magnitudeA && magnitudeB ? dotProduct / (magnitudeA * magnitudeB) : 0;
}

/**
 * Generates a hash-based identifier for a vector.
 * @param {number[]} vector - Input vector.
 * @returns {string} - Hash identifier.
 */
export function vectorHash(vector) {
  const hash = createHash('sha256');
  hash.update(vector.join(','));
  return hash.digest('hex');
}

/**
 * Hierarchical k-means-based in-memory vector index.
 */
export class InMemoryVectorIndex {
  constructor(k = 10) {
    this.k = k; // Number of clusters at each level
    this.index = []; // Hierarchical index
    this.vectors = new Map(); // Store original vectors
  }

  /**
   * Adds a vector to the index.
   * @param {number[]} vector - Vector to add.
   */
  addVector(vector) {
    const id = vectorHash(vector);
    this.vectors.set(id, vector);
    this._insertIntoIndex(vector, id);
  }

  /**
   * Searches for the nearest neighbors of a query vector.
   * @param {number[]} queryVector - Query vector.
   * @param {number} topN - Number of nearest neighbors to return.
   * @returns {Array<{id, similarity}>} - Nearest neighbors.
   */
  search(queryVector, topN = 5) {
    const candidates = this._traverseIndex(queryVector);
    const scoredCandidates = candidates.map((id) => {
      const vector = this.vectors.get(id);
      return { id, similarity: cosineSimilarity(queryVector, vector) };
    });

    return scoredCandidates
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, topN);
  }

  /**
   * Inserts a vector into the hierarchical index.
   * @param {number[]} vector - Vector to insert.
   * @param {string} id - Unique identifier for the vector.
   */
  _insertIntoIndex(vector, id) {
    if (this.index.length === 0) {
      this.index.push({ centroids: [], children: [] });
    }

    let currentLevel = this.index[0];

    while (true) {
      if (currentLevel.centroids.length < this.k) {
        currentLevel.centroids.push(vector);
        currentLevel.children.push([id]);
        break;
      }

      const closestIdx = this._findClosestCentroid(vector, currentLevel.centroids);
      currentLevel = currentLevel.children[closestIdx];

      if (!Array.isArray(currentLevel)) {
        currentLevel = { centroids: [], children: [] };
        this.index.push(currentLevel);
      }
    }
  }

  /**
   * Traverses the hierarchical index to find candidate vectors.
   * @param {number[]} queryVector - Query vector.
   * @returns {string[]} - Candidate vector IDs.
   */
  _traverseIndex(queryVector) {
    let candidates = [];
    let currentLevel = this.index[0];

    while (currentLevel) {
      const closestIdx = this._findClosestCentroid(queryVector, currentLevel.centroids);
      candidates = currentLevel.children[closestIdx];

      if (Array.isArray(candidates)) {
        break;
      }

      currentLevel = candidates;
    }

    return candidates || [];
  }

  /**
   * Finds the closest centroid to a given vector.
   * @param {number[]} vector - Input vector.
   * @param {number[][]} centroids - List of centroids.
   * @returns {number} - Index of the closest centroid.
   */
  _findClosestCentroid(vector, centroids) {
    let maxSimilarity = -Infinity;
    let closestIdx = -1;

    centroids.forEach((centroid, idx) => {
      const similarity = cosineSimilarity(vector, centroid);
      if (similarity > maxSimilarity) {
        maxSimilarity = similarity;
        closestIdx = idx;
      }
    });

    return closestIdx;
  }
}