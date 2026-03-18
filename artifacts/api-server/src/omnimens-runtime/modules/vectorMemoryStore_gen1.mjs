// vectorMemoryStore.js

/**
 * @module vectorMemoryStore
 * @description Implements an in-memory vector store for fast similarity searches and dynamic memory retrieval using k-d trees.
 */

/**
 * Represents a node in the k-d tree.
 * @class KDTreeNode
 */
class KDTreeNode {
  /**
   * @param {Array<number>} point - The vector point stored in this node.
   * @param {number} axis - The axis on which the split occurs.
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
 * Builds a k-d tree from an array of points.
 * @param {Array<Array<number>>} points - Array of vectors to store.
 * @param {number} depth - Current depth in the tree.
 * @returns {KDTreeNode|null} The root node of the k-d tree.
 */
function buildKDTree(points, depth = 0) {
  if (points.length === 0) return null;

  const k = points[0].length;
  const axis = depth % k;

  points.sort((a, b) => a[axis] - b[axis]);
  const median = Math.floor(points.length / 2);

  return new KDTreeNode(
    points[median],
    axis,
    buildKDTree(points.slice(0, median), depth + 1),
    buildKDTree(points.slice(median + 1), depth + 1)
  );
}

/**
 * Performs a nearest neighbor search in the k-d tree.
 * @param {KDTreeNode|null} node - The root node of the k-d tree.
 * @param {Array<number>} target - The target vector to search for.
 * @param {KDTreeNode|null} best - The current best node.
 * @param {number} bestDistance - The current best distance.
 * @returns {KDTreeNode|null} The nearest neighbor node.
 */
function nearestNeighborSearch(node, target, best = null, bestDistance = Infinity) {
  if (!node) return best;

  const distance = euclideanDistance(node.point, target);
  if (distance < bestDistance) {
    best = node;
    bestDistance = distance;
  }

  const axis = node.axis;
  const direction = target[axis] < node.point[axis] ? 'left' : 'right';

  best = nearestNeighborSearch(node[direction], target, best, bestDistance);

  const otherDirection = direction === 'left' ? 'right' : 'left';
  if (Math.abs(target[axis] - node.point[axis]) < bestDistance) {
    best = nearestNeighborSearch(node[otherDirection], target, best, bestDistance);
  }

  return best;
}

/**
 * Calculates the Euclidean distance between two vectors.
 * @param {Array<number>} a - The first vector.
 * @param {Array<number>} b - The second vector.
 * @returns {number} The Euclidean distance.
 */
function euclideanDistance(a, b) {
  return Math.sqrt(a.reduce((sum, val, i) => sum + (val - b[i]) ** 2, 0));
}

/**
 * Inserts a new vector into the k-d tree.
 * @param {KDTreeNode|null} node - The root node of the k-d tree.
 * @param {Array<number>} point - The vector to insert.
 * @param {number} depth - Current depth in the tree.
 * @returns {KDTreeNode} The updated k-d tree root.
 */
function insertKDTree(node, point, depth = 0) {
  if (!node) return new KDTreeNode(point, depth % point.length);

  const axis = node.axis;
  if (point[axis] < node.point[axis]) {
    node.left = insertKDTree(node.left, point, depth + 1);
  } else {
    node.right = insertKDTree(node.right, point, depth + 1);
  }

  return node;
}

/**
 * @typedef {Object} VectorMemoryStore
 * @property {KDTreeNode|null} root - The root node of the k-d tree.
 * @property {function(Array<number>): void} insert - Inserts a vector into the store.
 * @property {function(Array<number>): Array<number>|null} search - Searches for the nearest vector.
 */

/**
 * Creates a new vector memory store.
 * @returns {VectorMemoryStore} The vector memory store.
 */
function createVectorMemoryStore() {
  let root = null;

  return {
    /**
     * Inserts a vector into the store.
     * @param {Array<number>} vector - The vector to insert.
     */
    insert(vector) {
      root = insertKDTree(root, vector);
    },

    /**
     * Searches for the nearest vector to the target.
     * @param {Array<number>} target - The target vector.
     * @returns {Array<number>|null} The nearest vector or null if the store is empty.
     */
    search(target) {
      const nearestNode = nearestNeighborSearch(root, target);
      return nearestNode ? nearestNode.point : null;
    }
  };
}

export { createVectorMemoryStore };