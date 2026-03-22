/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: inMemoryVectorStore
 * Written: 2026-03-21T16:47:55.836Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

/**
 * @module inMemoryVectorStore
 * @description A lightweight in-memory vector store for storing and retrieving embedding vectors using k-d tree for efficient nearest neighbor search.
 */

/**
 * Represents a node in the k-d tree.
 * @typedef {Object} KDTreeNode
 * @property {number[]} point - The vector stored at this node.
 * @property {KDTreeNode|null} left - The left child node.
 * @property {KDTreeNode|null} right - The right child node.
 */

/**
 * Builds a k-d tree from a list of points.
 * @param {number[][]} points - Array of vectors to store in the k-d tree.
 * @param {number} depth - Current depth in the tree (used for determining the splitting dimension).
 * @returns {KDTreeNode|null} The root node of the k-d tree.
 */
function buildKDTree(points, depth = 0) {
  if (points.length === 0) return null;

  const k = points[0].length; // Dimensionality of the vectors
  const axis = depth % k; // Splitting dimension

  // Sort points by the current axis and choose the median as the root
  points.sort((a, b) => a[axis] - b[axis]);
  const medianIndex = Math.floor(points.length / 2);

  return {
    point: points[medianIndex],
    left: buildKDTree(points.slice(0, medianIndex), depth + 1),
    right: buildKDTree(points.slice(medianIndex + 1), depth + 1)
  };
}

/**
 * Calculates the Euclidean distance between two vectors.
 * @param {number[]} a - First vector.
 * @param {number[]} b - Second vector.
 * @returns {number} The Euclidean distance.
 */
function euclideanDistance(a, b) {
  return Math.sqrt(a.reduce((sum, val, i) => sum + (val - b[i]) ** 2, 0));
}

/**
 * Searches the k-d tree for the nearest neighbor to a given vector.
 * @param {KDTreeNode|null} node - The root of the k-d tree.
 * @param {number[]} target - The vector to find the nearest neighbor for.
 * @param {number} depth - Current depth in the tree.
 * @param {Object} best - The current best match ({ point: number[], distance: number }).
 * @returns {Object} The nearest neighbor ({ point: number[], distance: number }).
 */
function nearestNeighborSearch(node, target, depth = 0, best = { point: null, distance: Infinity }) {
  if (node === null) return best;

  const k = target.length;
  const axis = depth % k;

  // Compute distance to the current node
  const distance = euclideanDistance(target, node.point);
  if (distance < best.distance) {
    best = { point: node.point, distance };
  }

  // Determine which subtree to search first
  const direction = target[axis] < node.point[axis] ? 'left' : 'right';
  best = nearestNeighborSearch(node[direction], target, depth + 1, best);

  // Check the other subtree if necessary
  if (Math.abs(target[axis] - node.point[axis]) < best.distance) {
    const otherDirection = direction === 'left' ? 'right' : 'left';
    best = nearestNeighborSearch(node[otherDirection], target, depth + 1, best);
  }

  return best;
}

/**
 * Class representing an in-memory vector store using a k-d tree.
 */
export class InMemoryVectorStore {
  constructor() {
    /** @type {KDTreeNode|null} */
    this.root = null;
    /** @type {number[][]} */
    this.points = [];
  }

  /**
   * Adds a vector to the store.
   * @param {number[]} vector - The vector to add.
   */
  add(vector) {
    this.points.push(vector);
    this.root = buildKDTree(this.points);
  }

  /**
   * Finds the nearest neighbor to a given vector.
   * @param {number[]} vector - The query vector.
   * @returns {Object} The nearest neighbor ({ point: number[], distance: number }).
   */
  nearest(vector) {
    if (!this.root) throw new Error('Vector store is empty.');
    return nearestNeighborSearch(this.root, vector);
  }
}

/**
 * Example usage:
 * const store = new InMemoryVectorStore();
 * store.add([1, 2, 3]);
 * store.add([4, 5, 6]);
 * const nearest = store.nearest([3, 3, 3]);
 * console.log(nearest);
 */