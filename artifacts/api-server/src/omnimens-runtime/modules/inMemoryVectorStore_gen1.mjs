/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: inMemoryVectorStore
 * Written: 2026-04-03T02:38:02.168Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// inMemoryVectorStore.mjs

import { createHash } from 'crypto';

/**
 * Utility to calculate Euclidean distance between two vectors.
 * @param {number[]} vecA - First vector.
 * @param {number[]} vecB - Second vector.
 * @returns {number} - Euclidean distance.
 */
export function euclideanDistance(vecA, vecB) {
  if (vecA.length !== vecB.length) {
    throw new Error('Vectors must have the same dimensions.');
  }
  return Math.sqrt(vecA.reduce((sum, val, i) => sum + Math.pow(val - vecB[i], 2), 0));
}

/**
 * KD-Tree Node structure.
 * @class
 */
class KDTreeNode {
  constructor(point, index, axis) {
    this.point = point;
    this.index = index;
    this.axis = axis;
    this.left = null;
    this.right = null;
  }
}

/**
 * Builds a KD-Tree from a set of points.
 * @param {number[][]} points - Array of points (vectors).
 * @param {number} depth - Current depth in the tree.
 * @returns {KDTreeNode} - Root node of the KD-Tree.
 */
function buildKDTree(points, depth = 0) {
  if (points.length === 0) return null;

  const axis = depth % points[0].length;
  points.sort((a, b) => a[axis] - b[axis]);
  const median = Math.floor(points.length / 2);

  return new KDTreeNode(
    points[median],
    median,
    axis,
    buildKDTree(points.slice(0, median), depth + 1),
    buildKDTree(points.slice(median + 1), depth + 1)
  );
}

/**
 * Searches the KD-Tree for the nearest neighbor to a given target point.
 * @param {KDTreeNode} node - Root node of the KD-Tree.
 * @param {number[]} target - Target point (vector).
 * @param {number} depth - Current depth in the tree.
 * @param {object} best - Best match found so far.
 * @returns {object} - Nearest neighbor and its distance.
 */
function nearestNeighborSearch(node, target, depth = 0, best = { node: null, distance: Infinity }) {
  if (!node) return best;

  const axis = depth % target.length;
  const distance = euclideanDistance(target, node.point);

  if (distance < best.distance) {
    best = { node, distance };
  }

  const nextBranch = target[axis] < node.point[axis] ? node.left : node.right;
  const otherBranch = target[axis] < node.point[axis] ? node.right : node.left;

  best = nearestNeighborSearch(nextBranch, target, depth + 1, best);

  if (Math.abs(target[axis] - node.point[axis]) < best.distance) {
    best = nearestNeighborSearch(otherBranch, target, depth + 1, best);
  }

  return best;
}

/**
 * In-memory vector store class.
 * @class
 */
export class InMemoryVectorStore {
  constructor() {
    this.points = [];
    this.tree = null;
  }

  /**
   * Adds a vector to the store.
   * @param {number[]} vector - Vector to add.
   */
  addVector(vector) {
    this.points.push(vector);
    this.tree = buildKDTree(this.points);
  }

  /**
   * Finds the nearest neighbor to a given vector.
   * @param {number[]} vector - Target vector.
   * @returns {object} - Nearest neighbor and its distance.
   */
  findNearest(vector) {
    if (!this.tree) {
      throw new Error('Vector store is empty.');
    }
    return nearestNeighborSearch(this.tree, vector);
  }
}

/**
 * Generates a hash for a vector (useful for deduplication).
 * @param {number[]} vector - Vector to hash.
 * @returns {string} - Hash string.
 */
export function hashVector(vector) {
  const hash = createHash('sha256');
  hash.update(vector.join(','));
  return hash.digest('hex');
}

/**
 * Validates a vector for consistency.
 * @param {number[]} vector - Vector to validate.
 * @returns {boolean} - True if valid, false otherwise.
 */
export function validateVector(vector) {
  return Array.isArray(vector) && vector.every(val => typeof val === 'number');
}