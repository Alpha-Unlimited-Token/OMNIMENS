/**
 * @module vectorStoreManager
 * @description Manages in-memory vector similarity searches and embedding indexing using KD-tree or Ball Tree algorithms.
 */

/**
 * Represents a KD-tree node.
 * @class
 */
class KDTreeNode {
  /**
   * @param {Array<number>} point - The point stored in the node.
   * @param {KDTreeNode|null} left - Left child node.
   * @param {KDTreeNode|null} right - Right child node.
   */
  constructor(point, left = null, right = null) {
    this.point = point;
    this.left = left;
    this.right = right;
  }
}

/**
 * Builds a KD-tree.
 * @param {Array<Array<number>>} points - Array of points to index.
 * @param {number} depth - Current depth in the tree.
 * @returns {KDTreeNode|null} Root node of the KD-tree.
 */
function buildKDTree(points, depth = 0) {
  if (points.length === 0) return null;

  const axis = depth % points[0].length;
  points.sort((a, b) => a[axis] - b[axis]);

  const median = Math.floor(points.length / 2);

  return new KDTreeNode(
    points[median],
    buildKDTree(points.slice(0, median), depth + 1),
    buildKDTree(points.slice(median + 1), depth + 1)
  );
}

/**
 * Finds the nearest neighbor to a given point in the KD-tree.
 * @param {KDTreeNode|null} node - Current node in the KD-tree.
 * @param {Array<number>} target - Target point to search for.
 * @param {number} depth - Current depth in the tree.
 * @param {KDTreeNode|null} best - Current best match.
 * @returns {KDTreeNode|null} Nearest neighbor node.
 */
function nearestNeighbor(node, target, depth = 0, best = null) {
  if (node === null) return best;

  const axis = depth % target.length;

  let nextBest = best;
  let nextBranch = null;

  if (
    nextBest === null ||
    distanceSquared(target, node.point) < distanceSquared(target, nextBest.point)
  ) {
    nextBest = node;
  }

  if (target[axis] < node.point[axis]) {
    nextBranch = node.left;
  } else {
    nextBranch = node.right;
  }

  nextBest = nearestNeighbor(nextBranch, target, depth + 1, nextBest);

  const otherBranch = target[axis] < node.point[axis] ? node.right : node.left;
  if (
    Math.abs(target[axis] - node.point[axis]) ** 2 <
    distanceSquared(target, nextBest.point)
  ) {
    nextBest = nearestNeighbor(otherBranch, target, depth + 1, nextBest);
  }

  return nextBest;
}

/**
 * Calculates squared Euclidean distance between two points.
 * @param {Array<number>} point1 - First point.
 * @param {Array<number>} point2 - Second point.
 * @returns {number} Squared distance.
 */
function distanceSquared(point1, point2) {
  return point1.reduce((sum, val, idx) => sum + (val - point2[idx]) ** 2, 0);
}

/**
 * Dynamically updates the KD-tree with a new point.
 * @param {KDTreeNode|null} node - Current node in the KD-tree.
 * @param {Array<number>} newPoint - New point to insert.
 * @param {number} depth - Current depth in the tree.
 * @returns {KDTreeNode} Updated KD-tree root node.
 */
function insert(node, newPoint, depth = 0) {
  if (node === null) return new KDTreeNode(newPoint);

  const axis = depth % newPoint.length;

  if (newPoint[axis] < node.point[axis]) {
    node.left = insert(node.left, newPoint, depth + 1);
  } else {
    node.right = insert(node.right, newPoint, depth + 1);
  }

  return node;
}

/**
 * Utility function to initialize a KD-tree.
 * @param {Array<Array<number>>} points - Array of points to index.
 * @returns {KDTreeNode|null} Root node of the KD-tree.
 */
function initializeKDTree(points) {
  return buildKDTree(points);
}

/**
 * Searches for the nearest neighbor to a given point.
 * @param {KDTreeNode|null} root - Root node of the KD-tree.
 * @param {Array<number>} target - Target point to search for.
 * @returns {Array<number>|null} Nearest neighbor point.
 */
function searchNearest(root, target) {
  const result = nearestNeighbor(root, target);
  return result ? result.point : null;
}

/**
 * Inserts a new point into the KD-tree.
 * @param {KDTreeNode|null} root - Root node of the KD-tree.
 * @param {Array<number>} newPoint - New point to insert.
 * @returns {KDTreeNode} Updated KD-tree root node.
 */
function updateTree(root, newPoint) {
  return insert(root, newPoint);
}

export { initializeKDTree, searchNearest, updateTree };