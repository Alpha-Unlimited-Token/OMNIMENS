/**
 * @module vectorMemoryManager
 * @description A utility module for storing and retrieving high-dimensional vector embeddings using a k-d tree structure.
 * @version 1.0.0
 */

/**
 * Represents a Node in the k-d tree.
 * @class
 */
class KDTreeNode {
  /**
   * @param {Array<number>} point - The vector embedding.
   * @param {any} value - The associated value for the embedding.
   * @param {number} axis - The axis on which the node is split.
   */
  constructor(point, value, axis) {
    this.point = point;
    this.value = value;
    this.axis = axis;
    this.left = null;
    this.right = null;
  }
}

/**
 * A k-d tree implementation for efficient nearest-neighbor search.
 * @class
 */
class KDTree {
  /**
   * @constructor
   * @param {Array<{point: Array<number>, value: any}>} points - An array of points with associated values.
   */
  constructor(points = []) {
    this.root = this._buildTree(points, 0);
  }

  /**
   * Recursively builds the k-d tree.
   * @private
   * @param {Array<{point: Array<number>, value: any}>} points - The points to build the tree from.
   * @param {number} depth - The current depth in the tree.
   * @returns {KDTreeNode|null} The root node of the subtree.
   */
  _buildTree(points, depth) {
    if (points.length === 0) return null;

    const axis = depth % points[0].point.length;
    points.sort((a, b) => a.point[axis] - b.point[axis]);
    const median = Math.floor(points.length / 2);

    const node = new KDTreeNode(points[median].point, points[median].value, axis);
    node.left = this._buildTree(points.slice(0, median), depth + 1);
    node.right = this._buildTree(points.slice(median + 1), depth + 1);

    return node;
  }

  /**
   * Inserts a new point into the k-d tree.
   * @param {Array<number>} point - The vector embedding to insert.
   * @param {any} value - The value associated with the embedding.
   */
  insert(point, value) {
    const _insert = (node, point, value, depth) => {
      if (!node) return new KDTreeNode(point, value, depth % point.length);

      const axis = node.axis;
      if (point[axis] < node.point[axis]) {
        node.left = _insert(node.left, point, value, depth + 1);
      } else {
        node.right = _insert(node.right, point, value, depth + 1);
      }

      return node;
    };

    this.root = _insert(this.root, point, value, 0);
  }

  /**
   * Finds the nearest neighbor to a given point.
   * @param {Array<number>} target - The target vector embedding.
   * @returns {{point: Array<number>, value: any, distance: number}|null} The nearest neighbor.
   */
  nearestNeighbor(target) {
    let best = null;

    const _search = (node, depth) => {
      if (!node) return;

      const axis = depth % target.length;
      const distance = this._euclideanDistance(target, node.point);

      if (!best || distance < best.distance) {
        best = { point: node.point, value: node.value, distance };
      }

      const nextBranch = target[axis] < node.point[axis] ? node.left : node.right;
      const oppositeBranch = target[axis] < node.point[axis] ? node.right : node.left;

      _search(nextBranch, depth + 1);

      if (Math.abs(target[axis] - node.point[axis]) < best.distance) {
        _search(oppositeBranch, depth + 1);
      }
    };

    _search(this.root, 0);
    return best;
  }

  /**
   * Calculates the Euclidean distance between two points.
   * @private
   * @param {Array<number>} a - The first point.
   * @param {Array<number>} b - The second point.
   * @returns {number} The Euclidean distance.
   */
  _euclideanDistance(a, b) {
    return Math.sqrt(a.reduce((sum, val, i) => sum + (val - b[i]) ** 2, 0));
  }
}

/**
 * Stores and retrieves vector embeddings using a k-d tree.
 * @class
 */
class VectorMemoryManager {
  constructor() {
    this.tree = new KDTree();
  }

  /**
   * Adds a vector embedding to the memory.
   * @param {Array<number>} vector - The vector embedding.
   * @param {any} value - The associated value.
   */
  add(vector, value) {
    this.tree.insert(vector, value);
  }

  /**
   * Retrieves the closest vector embedding to the target.
   * @param {Array<number>} target - The target vector embedding.
   * @returns {{vector: Array<number>, value: any, distance: number}|null} The closest embedding and its value.
   */
  retrieve(target) {
    const result = this.tree.nearestNeighbor(target);
    return result ? { vector: result.point, value: result.value, distance: result.distance } : null;
  }
}

export { VectorMemoryManager };