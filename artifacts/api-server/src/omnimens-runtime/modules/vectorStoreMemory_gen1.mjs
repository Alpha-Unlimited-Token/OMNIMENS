/**
 * @module vectorStoreMemory
 * @description Provides an in-memory vector store for fast similarity searches and embeddings using KD-tree.
 */

/**
 * A class representing a node in the KD-tree.
 */
class KDTreeNode {
  /**
   * @param {number[]} point - The vector stored at this node.
   * @param {number} axis - The axis used to split the space at this node.
   */
  constructor(point, axis) {
    this.point = point;
    this.axis = axis;
    this.left = null;
    this.right = null;
  }
}

/**
 * A class implementing a KD-tree for fast similarity search.
 */
class KDTree {
  /**
   * @param {number[][]} points - An array of vectors to build the KD-tree.
   */
  constructor(points) {
    this.root = this._buildTree(points, 0);
  }

  /**
   * Recursively builds the KD-tree.
   * @private
   * @param {number[][]} points - The points to build the tree from.
   * @param {number} depth - The current depth in the tree.
   * @returns {KDTreeNode|null} The root node of the subtree.
   */
  _buildTree(points, depth) {
    if (points.length === 0) return null;

    const axis = depth % points[0].length;
    points.sort((a, b) => a[axis] - b[axis]);
    const median = Math.floor(points.length / 2);

    const node = new KDTreeNode(points[median], axis);
    node.left = this._buildTree(points.slice(0, median), depth + 1);
    node.right = this._buildTree(points.slice(median + 1), depth + 1);

    return node;
  }

  /**
   * Finds the nearest neighbor to a given vector.
   * @param {number[]} target - The target vector to search for.
   * @returns {Object} The nearest neighbor and its distance.
   */
  nearestNeighbor(target) {
    let best = { node: null, distance: Infinity };

    const _search = (node, depth) => {
      if (!node) return;

      const axis = depth % target.length;
      const distance = this._euclideanDistance(target, node.point);

      if (distance < best.distance) {
        best = { node, distance };
      }

      const diff = target[axis] - node.point[axis];
      const primary = diff <= 0 ? node.left : node.right;
      const secondary = diff <= 0 ? node.right : node.left;

      _search(primary, depth + 1);

      if (Math.abs(diff) < best.distance) {
        _search(secondary, depth + 1);
      }
    };

    _search(this.root, 0);
    return { point: best.node.point, distance: best.distance };
  }

  /**
   * Computes the Euclidean distance between two vectors.
   * @private
   * @param {number[]} a - The first vector.
   * @param {number[]} b - The second vector.
   * @returns {number} The Euclidean distance.
   */
  _euclideanDistance(a, b) {
    return Math.sqrt(a.reduce((sum, val, idx) => sum + (val - b[idx]) ** 2, 0));
  }
}

/**
 * A utility class for managing an in-memory vector store.
 */
export class VectorStore {
  /**
   * @constructor
   */
  constructor() {
    this.vectors = [];
    this.tree = null;
  }

  /**
   * Adds a vector to the store.
   * @param {number[]} vector - The vector to add.
   */
  addVector(vector) {
    if (!Array.isArray(vector) || vector.some(isNaN)) {
      throw new Error("Invalid vector: must be an array of numbers.");
    }
    this.vectors.push(vector);
    this.tree = new KDTree(this.vectors);
  }

  /**
   * Finds the nearest vector in the store to the target vector.
   * @param {number[]} target - The target vector.
   * @returns {Object} The nearest vector and its distance.
   */
  findNearest(target) {
    if (!this.tree) {
      throw new Error("Vector store is empty. Add vectors before searching.");
    }
    return this.tree.nearestNeighbor(target);
  }

  /**
   * Clears all vectors from the store.
   */
  clear() {
    this.vectors = [];
    this.tree = null;
  }
}

/**
 * Example usage:
 * const store = new VectorStore();
 * store.addVector([1, 2, 3]);
 * store.addVector([4, 5, 6]);
 * console.log(store.findNearest([3, 3, 3]));
 */