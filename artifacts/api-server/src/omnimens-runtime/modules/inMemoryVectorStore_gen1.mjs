/**
 * @module inMemoryVectorStore
 * @description This module provides an in-memory vector store for fast embedding retrieval and similarity search using KD-tree indexing.
 */

/**
 * KDTree class for efficient vector indexing and similarity search.
 */
class KDTree {
  constructor(points = []) {
    this.root = this.buildTree(points, 0);
  }

  /**
   * Builds the KD-tree recursively.
   * @param {Array<Array<number>>} points - Array of points (vectors).
   * @param {number} depth - Current depth in the tree.
   * @returns {Object|null} - Root node of the KD-tree.
   */
  buildTree(points, depth) {
    if (points.length === 0) return null;

    const axis = depth % points[0].length;
    points.sort((a, b) => a[axis] - b[axis]);

    const medianIndex = Math.floor(points.length / 2);

    return {
      point: points[medianIndex],
      left: this.buildTree(points.slice(0, medianIndex), depth + 1),
      right: this.buildTree(points.slice(medianIndex + 1), depth + 1)
    };
  }

  /**
   * Finds the nearest neighbor to a given target point.
   * @param {Array<number>} target - Target point (vector).
   * @returns {Object} - Nearest neighbor point and its distance.
   */
  nearestNeighbor(target) {
    let best = { point: null, distance: Infinity };

    const searchTree = (node, depth) => {
      if (!node) return;

      const axis = depth % target.length;
      const distance = this.euclideanDistance(target, node.point);

      if (distance < best.distance) {
        best = { point: node.point, distance };
      }

      const nextBranch = target[axis] < node.point[axis] ? node.left : node.right;
      const oppositeBranch = nextBranch === node.left ? node.right : node.left;

      searchTree(nextBranch, depth + 1);

      if (Math.abs(target[axis] - node.point[axis]) < best.distance) {
        searchTree(oppositeBranch, depth + 1);
      }
    };

    searchTree(this.root, 0);
    return best;
  }

  /**
   * Calculates the Euclidean distance between two points.
   * @param {Array<number>} pointA - First point.
   * @param {Array<number>} pointB - Second point.
   * @returns {number} - Euclidean distance.
   */
  euclideanDistance(pointA, pointB) {
    return Math.sqrt(pointA.reduce((sum, value, index) => sum + Math.pow(value - pointB[index], 2), 0));
  }
}

/**
 * @function createKDTree
 * @description Creates a KDTree instance from a set of vectors.
 * @param {Array<Array<number>>} vectors - Array of vectors.
 * @returns {KDTree} - KDTree instance.
 */
export function createKDTree(vectors) {
  if (!Array.isArray(vectors) || vectors.some(v => !Array.isArray(v) || v.some(n => typeof n !== 'number'))) {
    throw new TypeError('Invalid input: vectors must be an array of numeric arrays.');
  }
  return new KDTree(vectors);
}

/**
 * @function findNearestVector
 * @description Finds the nearest vector to a given target vector using a KDTree.
 * @param {KDTree} tree - KDTree instance.
 * @param {Array<number>} target - Target vector.
 * @returns {Object} - Nearest vector and its distance.
 */
export function findNearestVector(tree, target) {
  if (!(tree instanceof KDTree)) {
    throw new TypeError('Invalid input: tree must be an instance of KDTree.');
  }
  if (!Array.isArray(target) || target.some(n => typeof n !== 'number')) {
    throw new TypeError('Invalid input: target must be a numeric array.');
  }
  return tree.nearestNeighbor(target);
}

/**
 * @function euclideanDistance
 * @description Calculates the Euclidean distance between two vectors.
 * @param {Array<number>} vectorA - First vector.
 * @param {Array<number>} vectorB - Second vector.
 * @returns {number} - Euclidean distance.
 */
export function euclideanDistance(vectorA, vectorB) {
  if (!Array.isArray(vectorA) || !Array.isArray(vectorB) || vectorA.some(n => typeof n !== 'number') || vectorB.some(n => typeof n !== 'number')) {
    throw new TypeError('Invalid input: vectors must be numeric arrays.');
  }
  return Math.sqrt(vectorA.reduce((sum, value, index) => sum + Math.pow(value - vectorB[index], 2), 0));
}