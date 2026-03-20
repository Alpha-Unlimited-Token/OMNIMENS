// Complete ES module code here, starting with /** JSDoc */ and exports

/**
 * @module inMemoryVectorSearch
 * @description This module provides fast semantic search and similarity matching using an in-memory vector store.
 * It implements a custom KD-tree for efficient nearest neighbor search.
 */

/**
 * Represents a KD-tree node.
 * @class
 */
class KDTreeNode {
  /**
   * @param {Array<number>} point - The vector point stored in this node.
   * @param {number} dimension - The splitting dimension for this node.
   * @param {KDTreeNode|null} left - Left child node.
   * @param {KDTreeNode|null} right - Right child node.
   */
  constructor(point, dimension, left = null, right = null) {
    this.point = point;
    this.dimension = dimension;
    this.left = left;
    this.right = right;
  }
}

/**
 * Builds a KD-tree from a list of points.
 * @param {Array<Array<number>>} points - List of vector points.
 * @param {number} depth - Current depth in the tree.
 * @returns {KDTreeNode|null} Root node of the KD-tree.
 */
function buildKDTree(points, depth = 0) {
  if (points.length === 0) return null;

  const dimension = depth % points[0].length;
  points.sort((a, b) => a[dimension] - b[dimension]);

  const medianIndex = Math.floor(points.length / 2);
  const medianPoint = points[medianIndex];

  return new KDTreeNode(
    medianPoint,
    dimension,
    buildKDTree(points.slice(0, medianIndex), depth + 1),
    buildKDTree(points.slice(medianIndex + 1), depth + 1)
  );
}

/**
 * Finds the nearest neighbor to a given target point.
 * @param {KDTreeNode|null} node - Current KD-tree node.
 * @param {Array<number>} target - Target vector point.
 * @param {KDTreeNode|null} best - Current best node.
 * @param {number} bestDistance - Current best distance.
 * @returns {KDTreeNode|null} Nearest neighbor node.
 */
function nearestNeighborSearch(node, target, best = null, bestDistance = Infinity) {
  if (!node) return best;

  const distance = euclideanDistance(node.point, target);
  if (distance < bestDistance) {
    best = node;
    bestDistance = distance;
  }

  const dimension = node.dimension;
  const nextBranch = target[dimension] < node.point[dimension] ? node.left : node.right;
  const otherBranch = target[dimension] < node.point[dimension] ? node.right : node.left;

  best = nearestNeighborSearch(nextBranch, target, best, bestDistance);

  if (Math.abs(target[dimension] - node.point[dimension]) < bestDistance) {
    best = nearestNeighborSearch(otherBranch, target, best, bestDistance);
  }

  return best;
}

/**
 * Calculates the Euclidean distance between two points.
 * @param {Array<number>} pointA - First vector point.
 * @param {Array<number>} pointB - Second vector point.
 * @returns {number} Euclidean distance.
 */
function euclideanDistance(pointA, pointB) {
  return Math.sqrt(pointA.reduce((sum, a, i) => sum + (a - pointB[i]) ** 2, 0));
}

/**
 * Searches for the k nearest neighbors to a target point.
 * @param {KDTreeNode|null} node - Current KD-tree node.
 * @param {Array<number>} target - Target vector point.
 * @param {number} k - Number of neighbors to find.
 * @returns {Array<{point: Array<number>, distance: number}>} List of k nearest neighbors.
 */
function kNearestNeighborsSearch(node, target, k) {
  const neighbors = [];

  function search(node) {
    if (!node) return;

    const distance = euclideanDistance(node.point, target);
    neighbors.push({ point: node.point, distance });
    neighbors.sort((a, b) => a.distance - b.distance);

    if (neighbors.length > k) neighbors.pop();

    const dimension = node.dimension;
    const nextBranch = target[dimension] < node.point[dimension] ? node.left : node.right;
    const otherBranch = target[dimension] < node.point[dimension] ? node.right : node.left;

    search(nextBranch);

    if (Math.abs(target[dimension] - node.point[dimension]) < neighbors[neighbors.length - 1].distance) {
      search(otherBranch);
    }
  }

  search(node);
  return neighbors;
}

/**
 * Exports the KD-tree utility functions.
 */
export { buildKDTree, nearestNeighborSearch, kNearestNeighborsSearch };