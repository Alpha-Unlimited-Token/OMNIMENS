/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: inMemoryVectorStore
 * Written: 2026-03-23T15:58:27.984Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// Complete ES module code here, starting with /** JSDoc */ and exports

/**
 * @module inMemoryVectorStore
 * @description Efficient in-memory storage and retrieval of semantically similar embeddings using k-d tree algorithm.
 */

/**
 * Represents a node in the k-d tree.
 * @class KDTreeNode
 */
class KDTreeNode {
  /**
   * @param {number[]} point - The vector point stored in this node.
   * @param {*} value - The associated value for the vector.
   * @param {number} depth - The depth of the node in the tree.
   */
  constructor(point, value, depth = 0) {
    this.point = point;
    this.value = value;
    this.depth = depth;
    this.left = null;
    this.right = null;
  }
}

/**
 * Represents a k-d tree for efficient nearest neighbor search.
 * @class KDTree
 */
class KDTree {
  constructor() {
    this.root = null;
  }

  /**
   * Inserts a point and its associated value into the k-d tree.
   * @param {number[]} point - The vector point to insert.
   * @param {*} value - The associated value for the vector.
   */
  insert(point, value) {
    const insertRec = (node, point, value, depth) => {
      if (!node) return new KDTreeNode(point, value, depth);

      const axis = depth % point.length;

      if (point[axis] < node.point[axis]) {
        node.left = insertRec(node.left, point, value, depth + 1);
      } else {
        node.right = insertRec(node.right, point, value, depth + 1);
      }

      return node;
    };

    this.root = insertRec(this.root, point, value, 0);
  }

  /**
   * Finds the nearest neighbor to the given point.
   * @param {number[]} target - The target vector point.
   * @returns {{point: number[], value: *, distance: number}} The nearest neighbor.
   */
  findNearest(target) {
    let best = { node: null, distance: Infinity };

    const distanceFunction = (a, b) => {
      return Math.sqrt(a.reduce((sum, val, i) => sum + (val - b[i]) ** 2, 0));
    };

    const searchRec = (node, target, depth) => {
      if (!node) return;

      const axis = depth % target.length;
      const distance = distanceFunction(node.point, target);

      if (distance < best.distance) {
        best = { node, distance };
      }

      const nextBranch = target[axis] < node.point[axis] ? node.left : node.right;
      const oppositeBranch = target[axis] < node.point[axis] ? node.right : node.left;

      searchRec(nextBranch, target, depth + 1);

      if (Math.abs(target[axis] - node.point[axis]) < best.distance) {
        searchRec(oppositeBranch, target, depth + 1);
      }
    };

    searchRec(this.root, target, 0);

    return {
      point: best.node.point,
      value: best.node.value,
      distance: best.distance
    };
  }
}

/**
 * In-memory vector store using k-d tree for efficient semantic similarity search.
 */
class InMemoryVectorStore {
  constructor() {
    this.tree = new KDTree();
  }

  /**
   * Adds a vector and its associated value to the store.
   * @param {number[]} vector - The vector to store.
   * @param {*} value - The associated value.
   */
  add(vector, value) {
    this.tree.insert(vector, value);
  }

  /**
   * Retrieves the most semantically similar vector and its value.
   * @param {number[]} queryVector - The query vector.
   * @returns {{vector: number[], value: *, distance: number}} The nearest neighbor.
   */
  search(queryVector) {
    const result = this.tree.findNearest(queryVector);
    return {
      vector: result.point,
      value: result.value,
      distance: result.distance
    };
  }
}

/**
 * Exports the InMemoryVectorStore class.
 * @type {InMemoryVectorStore}
 */
export default InMemoryVectorStore;