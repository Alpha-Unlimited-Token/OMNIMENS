/**
 * @module inMemoryVectorStore
 * @description This module provides an in-memory vector store using a k-d tree for efficient similarity search
 *              of high-dimensional vectors. It is designed for fast indexing and retrieval of nearest neighbors.
 */

/**
 * Class representing a k-d tree node.
 */
class KDTreeNode {
  /**
   * @param {Array<number>} point - The vector stored at this node.
   * @param {number} axis - The dimension (axis) used to split the data.
   */
  constructor(point, axis) {
    this.point = point;
    this.axis = axis;
    this.left = null;
    this.right = null;
  }
}

/**
 * Class representing the k-d tree structure.
 */
class KDTree {
  /**
   * @param {Array<Array<number>>} points - The set of high-dimensional vectors to build the tree from.
   */
  constructor(points) {
    this.root = this._buildTree(points, 0);
  }

  /**
   * Recursively builds the k-d tree.
   * @private
   * @param {Array<Array<number>>} points - The set of points to build the tree from.
   * @param {number} depth - The current depth in the tree.
   * @returns {KDTreeNode|null} The root node of the subtree.
   */
  _buildTree(points, depth) {
    if (points.length === 0) return null;

    const axis = depth % points[0].length;
    points.sort((a, b) => a[axis] - b[axis]);
    const medianIndex = Math.floor(points.length / 2);

    const node = new KDTreeNode(points[medianIndex], axis);
    node.left = this._buildTree(points.slice(0, medianIndex), depth + 1);
    node.right = this._buildTree(points.slice(medianIndex + 1), depth + 1);

    return node;
  }

  /**
   * Finds the nearest neighbor to a given vector.
   * @param {Array<number>} target - The vector to search for.
   * @returns {Array<number>} The nearest neighbor vector.
   */
  findNearestNeighbor(target) {
    let best = { point: null, distance: Infinity };

    const _searchTree = (node, depth) => {
      if (!node) return;

      const axis = depth % target.length;
      const distance = this._euclideanDistance(target, node.point);

      if (distance < best.distance) {
        best = { point: node.point, distance };
      }

      const nextBranch = target[axis] < node.point[axis] ? node.left : node.right;
      const oppositeBranch = target[axis] < node.point[axis] ? node.right : node.left;

      _searchTree(nextBranch, depth + 1);

      if (Math.abs(target[axis] - node.point[axis]) < best.distance) {
        _searchTree(oppositeBranch, depth + 1);
      }
    };

    _searchTree(this.root, 0);
    return best.point;
  }

  /**
   * Calculates the Euclidean distance between two vectors.
   * @private
   * @param {Array<number>} a - The first vector.
   * @param {Array<number>} b - The second vector.
   * @returns {number} The Euclidean distance between the vectors.
   */
  _euclideanDistance(a, b) {
    return Math.sqrt(a.reduce((sum, val, i) => sum + (val - b[i]) ** 2, 0));
  }
}

/**
 * Creates a new in-memory vector store.
 * @param {Array<Array<number>>} vectors - The set of high-dimensional vectors to store.
 * @returns {KDTree} The k-d tree instance for similarity search.
 */
export function createVectorStore(vectors) {
  if (!Array.isArray(vectors) || vectors.some(v => !Array.isArray(v))) {
    throw new TypeError('Input must be an array of arrays of numbers.');
  }
  return new KDTree(vectors);
}

/**
 * Finds the nearest vector to a target vector in the given vector store.
 * @param {KDTree} vectorStore - The k-d tree instance.
 * @param {Array<number>} target - The vector to search for.
 * @returns {Array<number>} The nearest neighbor vector.
 */
export function findNearest(vectorStore, target) {
  if (!(vectorStore instanceof KDTree)) {
    throw new TypeError('vectorStore must be an instance of KDTree.');
  }
  if (!Array.isArray(target)) {
    throw new TypeError('Target must be an array of numbers.');
  }
  return vectorStore.findNearestNeighbor(target);
}
