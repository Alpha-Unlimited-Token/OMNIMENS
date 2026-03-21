/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: memoryVectorStore
 * Written: 2026-03-21T01:58:43.642Z
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
 * @module memoryVectorStore
 * @description This module provides in-memory vector storage and retrieval using KD-tree for approximate nearest neighbor (ANN) search.
 * It is designed to facilitate fast context recall and similarity search for vector embeddings.
 */

/**
 * Represents a node in the KD-tree.
 * @class
 */
class KDTreeNode {
  constructor(point, axis) {
    this.point = point; // The vector (array of numbers)
    this.axis = axis; // The axis used to split (dimension index)
    this.left = null; // Left subtree
    this.right = null; // Right subtree
  }
}

/**
 * KD-tree implementation for fast nearest neighbor search.
 * @class
 */
class KDTree {
  /**
   * Constructs a KD-tree from a set of points.
   * @param {Array<Array<number>>} points - Array of vectors to store.
   */
  constructor(points) {
    this.root = this._buildTree(points, 0);
  }

  /**
   * Recursively builds the KD-tree.
   * @private
   * @param {Array<Array<number>>} points - Array of vectors.
   * @param {number} depth - Current depth in the tree.
   * @returns {KDTreeNode|null} The root node of the subtree.
   */
  _buildTree(points, depth) {
    if (points.length === 0) return null;

    const axis = depth % points[0].length; // Cycle through dimensions
    points.sort((a, b) => a[axis] - b[axis]); // Sort points by current axis

    const medianIndex = Math.floor(points.length / 2);
    const node = new KDTreeNode(points[medianIndex], axis);

    node.left = this._buildTree(points.slice(0, medianIndex), depth + 1);
    node.right = this._buildTree(points.slice(medianIndex + 1), depth + 1);

    return node;
  }

  /**
   * Finds the nearest neighbor to a given target vector.
   * @param {Array<number>} target - The target vector.
   * @returns {Array<number>} The nearest neighbor vector.
   */
  nearestNeighbor(target) {
    let best = { point: null, distance: Infinity };

    const distanceFunction = (a, b) => {
      return Math.sqrt(a.reduce((sum, val, i) => sum + (val - b[i]) ** 2, 0));
    };

    const search = (node, depth) => {
      if (!node) return;

      const axis = node.axis;
      const distance = distanceFunction(target, node.point);

      if (distance < best.distance) {
        best = { point: node.point, distance };
      }

      const nextBranch = target[axis] < node.point[axis] ? node.left : node.right;
      const otherBranch = target[axis] < node.point[axis] ? node.right : node.left;

      search(nextBranch, depth + 1);

      if (Math.abs(target[axis] - node.point[axis]) < best.distance) {
        search(otherBranch, depth + 1);
      }
    };

    search(this.root, 0);
    return best.point;
  }

  /**
   * Finds the k nearest neighbors to a given target vector.
   * @param {Array<number>} target - The target vector.
   * @param {number} k - The number of neighbors to retrieve.
   * @returns {Array<Array<number>>} The k nearest neighbor vectors.
   */
  kNearestNeighbors(target, k) {
    const neighbors = [];

    const distanceFunction = (a, b) => {
      return Math.sqrt(a.reduce((sum, val, i) => sum + (val - b[i]) ** 2, 0));
    };

    const search = (node, depth) => {
      if (!node) return;

      const axis = node.axis;
      const distance = distanceFunction(target, node.point);

      if (neighbors.length < k) {
        neighbors.push({ point: node.point, distance });
        neighbors.sort((a, b) => a.distance - b.distance);
      } else if (distance < neighbors[neighbors.length - 1].distance) {
        neighbors.pop();
        neighbors.push({ point: node.point, distance });
        neighbors.sort((a, b) => a.distance - b.distance);
      }

      const nextBranch = target[axis] < node.point[axis] ? node.left : node.right;
      const otherBranch = target[axis] < node.point[axis] ? node.right : node.left;

      search(nextBranch, depth + 1);

      if (Math.abs(target[axis] - node.point[axis]) < neighbors[neighbors.length - 1].distance) {
        search(otherBranch, depth + 1);
      }
    };

    search(this.root, 0);
    return neighbors.map((neighbor) => neighbor.point);
  }
}

/**
 * Creates a KD-tree from a set of vectors.
 * @param {Array<Array<number>>} points - Array of vectors to store.
 * @returns {KDTree} The constructed KD-tree.
 */
export function createKDTree(points) {
  return new KDTree(points);
}

/**
 * Finds the nearest neighbor to a target vector in the KD-tree.
 * @param {KDTree} tree - The KD-tree instance.
 * @param {Array<number>} target - The target vector.
 * @returns {Array<number>} The nearest neighbor vector.
 */
export function findNearestNeighbor(tree, target) {
  return tree.nearestNeighbor(target);
}

/**
 * Finds the k nearest neighbors to a target vector in the KD-tree.
 * @param {KDTree} tree - The KD-tree instance.
 * @param {Array<number>} target - The target vector.
 * @param {number} k - The number of neighbors to retrieve.
 * @returns {Array<Array<number>>} The k nearest neighbor vectors.
 */
export function findKNearestNeighbors(tree, target, k) {
  return tree.kNearestNeighbors(target, k);
}