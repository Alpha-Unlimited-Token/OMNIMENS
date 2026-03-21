/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: inMemoryVectorStore
 * Written: 2026-03-21T01:26:52.121Z
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
 * @description A pure JavaScript module that implements an in-memory vector store with approximate nearest neighbor (ANN) search.
 * This module uses a custom implementation of a KD-Tree for efficient vector similarity searches.
 */

/**
 * Calculates the Euclidean distance between two vectors.
 * @param {number[]} vectorA - The first vector.
 * @param {number[]} vectorB - The second vector.
 * @returns {number} The Euclidean distance between the two vectors.
 */
function euclideanDistance(vectorA, vectorB) {
  if (vectorA.length !== vectorB.length) {
    throw new Error("Vectors must have the same dimensions.");
  }
  return Math.sqrt(vectorA.reduce((sum, val, idx) => sum + Math.pow(val - vectorB[idx], 2), 0));
}

/**
 * A class representing a KD-Tree node.
 * @class
 */
class KDTreeNode {
  /**
   * @param {number[]} point - The vector stored in this node.
   * @param {number} axis - The axis along which this node is split.
   * @param {KDTreeNode|null} left - The left child node.
   * @param {KDTreeNode|null} right - The right child node.
   */
  constructor(point, axis, left = null, right = null) {
    this.point = point;
    this.axis = axis;
    this.left = left;
    this.right = right;
  }
}

/**
 * A class representing a KD-Tree for efficient nearest neighbor search.
 * @class
 */
class KDTree {
  /**
   * @param {number[][]} points - The dataset of vectors to build the tree from.
   */
  constructor(points) {
    this.root = this.buildTree(points, 0);
  }

  /**
   * Recursively builds the KD-Tree.
   * @param {number[][]} points - The dataset of vectors.
   * @param {number} depth - The current depth in the tree.
   * @returns {KDTreeNode|null} The root node of the subtree.
   */
  buildTree(points, depth) {
    if (points.length === 0) return null;

    const axis = depth % points[0].length;
    points.sort((a, b) => a[axis] - b[axis]);
    const medianIndex = Math.floor(points.length / 2);

    return new KDTreeNode(
      points[medianIndex],
      axis,
      this.buildTree(points.slice(0, medianIndex), depth + 1),
      this.buildTree(points.slice(medianIndex + 1), depth + 1)
    );
  }

  /**
   * Searches for the k nearest neighbors to a given vector.
   * @param {number[]} target - The vector to search for.
   * @param {number} k - The number of neighbors to return.
   * @returns {Array<{point: number[], distance: number}>} The k nearest neighbors and their distances.
   */
  nearestNeighbors(target, k) {
    const neighbors = [];

    /**
     * Recursively searches the tree for nearest neighbors.
     * @param {KDTreeNode|null} node - The current node.
     * @param {number} depth - The current depth in the tree.
     */
    const searchTree = (node, depth) => {
      if (!node) return;

      const axis = node.axis;
      const distance = euclideanDistance(target, node.point);

      if (neighbors.length < k) {
        neighbors.push({ point: node.point, distance });
        neighbors.sort((a, b) => a.distance - b.distance);
      } else if (distance < neighbors[neighbors.length - 1].distance) {
        neighbors[neighbors.length - 1] = { point: node.point, distance };
        neighbors.sort((a, b) => a.distance - b.distance);
      }

      const diff = target[axis] - node.point[axis];
      const primaryBranch = diff < 0 ? node.left : node.right;
      const secondaryBranch = diff < 0 ? node.right : node.left;

      searchTree(primaryBranch, depth + 1);

      if (neighbors.length < k || Math.abs(diff) < neighbors[neighbors.length - 1].distance) {
        searchTree(secondaryBranch, depth + 1);
      }
    };

    searchTree(this.root, 0);
    return neighbors;
  }
}

/**
 * A class for managing an in-memory vector store with KD-Tree-based ANN search.
 * @class
 */
class InMemoryVectorStore {
  constructor() {
    this.vectors = [];
    this.tree = null;
  }

  /**
   * Adds a vector to the store.
   * @param {number[]} vector - The vector to add.
   */
  addVector(vector) {
    this.vectors.push(vector);
    this.tree = new KDTree(this.vectors);
  }

  /**
   * Searches for the k nearest neighbors to a given vector.
   * @param {number[]} vector - The vector to search for.
   * @param {number} k - The number of neighbors to return.
   * @returns {Array<{point: number[], distance: number}>} The k nearest neighbors and their distances.
   */
  search(vector, k) {
    if (!this.tree) {
      throw new Error("The vector store is empty. Add vectors before searching.");
    }
    return this.tree.nearestNeighbors(vector, k);
  }
}

export { InMemoryVectorStore };