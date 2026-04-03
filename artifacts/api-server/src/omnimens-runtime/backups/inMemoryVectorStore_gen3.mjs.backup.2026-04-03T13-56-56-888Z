/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: inMemoryVectorStore
 * Written: 2026-04-01T22:16:20.762Z
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
 * Utility function to calculate Euclidean distance between two vectors.
 * @param {number[]} vec1 - First vector.
 * @param {number[]} vec2 - Second vector.
 * @returns {number} - Euclidean distance.
 */
export function euclideanDistance(vec1, vec2) {
  if (vec1.length !== vec2.length) {
    throw new Error('Vectors must be of the same dimension.');
  }
  return Math.sqrt(vec1.reduce((sum, val, i) => sum + Math.pow(val - vec2[i], 2), 0));
}

/**
 * Class representing an in-memory k-d tree for efficient nearest neighbor search.
 */
export class KDTree {
  constructor(points = [], depth = 0) {
    this.depth = depth;
    this.axis = depth % (points[0]?.length || 1);

    if (points.length === 0) {
      this.point = null;
      this.left = null;
      this.right = null;
    } else {
      points.sort((a, b) => a[this.axis] - b[this.axis]);
      const medianIndex = Math.floor(points.length / 2);

      this.point = points[medianIndex];
      this.left = new KDTree(points.slice(0, medianIndex), depth + 1);
      this.right = new KDTree(points.slice(medianIndex + 1), depth + 1);
    }
  }

  /**
   * Find the nearest neighbor to a given vector.
   * @param {number[]} target - Target vector.
   * @returns {number[]} - Nearest neighbor vector.
   */
  nearestNeighbor(target) {
    if (!this.point) {
      return null;
    }

    let best = this.point;
    let bestDist = euclideanDistance(target, this.point);

    const nextBranch = target[this.axis] < this.point[this.axis] ? this.left : this.right;
    const otherBranch = target[this.axis] < this.point[this.axis] ? this.right : this.left;

    const candidate = nextBranch?.nearestNeighbor(target);
    if (candidate) {
      const candidateDist = euclideanDistance(target, candidate);
      if (candidateDist < bestDist) {
        best = candidate;
        bestDist = candidateDist;
      }
    }

    if (Math.abs(target[this.axis] - this.point[this.axis]) < bestDist) {
      const candidate = otherBranch?.nearestNeighbor(target);
      if (candidate) {
        const candidateDist = euclideanDistance(target, candidate);
        if (candidateDist < bestDist) {
          best = candidate;
          bestDist = candidateDist;
        }
      }
    }

    return best;
  }
}

/**
 * Utility function to hash a vector for efficient storage/retrieval.
 * @param {number[]} vector - Input vector.
 * @returns {string} - Hash of the vector.
 */
export function hashVector(vector) {
  const hash = createHash('sha256');
  hash.update(vector.join(','));
  return hash.digest('hex');
}

/**
 * In-memory vector store for dynamic embedding storage and retrieval.
 */
export class InMemoryVectorStore {
  constructor() {
    this.store = new Map();
    this.tree = null;
  }

  /**
   * Add a vector to the store.
   * @param {number[]} vector - Vector to add.
   */
  addVector(vector) {
    const hash = hashVector(vector);
    this.store.set(hash, vector);
    this.tree = new KDTree(Array.from(this.store.values()));
  }

  /**
   * Retrieve the nearest neighbor to a given vector.
   * @param {number[]} vector - Target vector.
   * @returns {number[]} - Nearest neighbor vector.
   */
  getNearestNeighbor(vector) {
    if (!this.tree) {
      throw new Error('Vector store is empty.');
    }
    return this.tree.nearestNeighbor(vector);
  }
}

// Example usage:
// const store = new InMemoryVectorStore();
// store.addVector([1, 2, 3]);
// store.addVector([4, 5, 6]);
// console.log(store.getNearestNeighbor([2, 3, 4]));