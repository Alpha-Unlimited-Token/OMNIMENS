/**
 * @module vectorMemoryStore
 * @description A utility module for efficient vector embedding storage and similarity search using k-d tree algorithm.
 * @exports {addVector, searchNearest, clearStore}
 */

/**
 * Internal k-d tree node representation.
 * @typedef {Object} KDTreeNode
 * @property {number[]} point - The vector point stored in the node.
 * @property {KDTreeNode|null} left - Left child node.
 * @property {KDTreeNode|null} right - Right child node.
 */

/**
 * Internal k-d tree root node.
 * @type {KDTreeNode|null}
 */
let kdTreeRoot = null;

/**
 * Internal dimension of vectors stored in the tree.
 * @type {number|null}
 */
let vectorDimension = null;

/**
 * Adds a new vector to the k-d tree.
 * @param {number[]} vector - The vector to add.
 * @throws {Error} If vector dimensions are inconsistent.
 */
function addVector(vector) {
  if (!Array.isArray(vector) || vector.length === 0) {
    throw new Error("Vector must be a non-empty array of numbers.");
  }

  if (vectorDimension === null) {
    vectorDimension = vector.length;
  } else if (vector.length !== vectorDimension) {
    throw new Error(`Vector dimension mismatch. Expected ${vectorDimension}, got ${vector.length}.`);
  }

  kdTreeRoot = insertKDTree(kdTreeRoot, vector, 0);
}

/**
 * Inserts a vector into the k-d tree.
 * @param {KDTreeNode|null} node - Current node.
 * @param {number[]} point - Vector to insert.
 * @param {number} depth - Current depth in the tree.
 * @returns {KDTreeNode} Updated node.
 */
function insertKDTree(node, point, depth) {
  if (node === null) {
    return { point, left: null, right: null };
  }

  const axis = depth % vectorDimension;

  if (point[axis] < node.point[axis]) {
    node.left = insertKDTree(node.left, point, depth + 1);
  } else {
    node.right = insertKDTree(node.right, point, depth + 1);
  }

  return node;
}

/**
 * Searches for the nearest vector to the given query.
 * @param {number[]} query - The query vector.
 * @returns {number[]|null} The nearest vector or null if the tree is empty.
 */
function searchNearest(query) {
  if (!Array.isArray(query) || query.length !== vectorDimension) {
    throw new Error(`Query dimension mismatch. Expected ${vectorDimension}, got ${query.length}.`);
  }

  if (kdTreeRoot === null) {
    return null;
  }

  return nearestNeighborSearch(kdTreeRoot, query, 0).point;
}

/**
 * Performs nearest neighbor search in the k-d tree.
 * @param {KDTreeNode} node - Current node.
 * @param {number[]} query - Query vector.
 * @param {number} depth - Current depth in the tree.
 * @returns {KDTreeNode} Nearest node.
 */
function nearestNeighborSearch(node, query, depth) {
  if (node === null) {
    return { point: null, distance: Infinity };
  }

  const axis = depth % vectorDimension;
  const nextBranch = query[axis] < node.point[axis] ? node.left : node.right;
  const oppositeBranch = query[axis] < node.point[axis] ? node.right : node.left;

  const best = closerDistance(
    nearestNeighborSearch(nextBranch, query, depth + 1),
    { point: node.point, distance: euclideanDistance(query, node.point) }
  );

  const distanceToAxis = Math.abs(query[axis] - node.point[axis]);
  if (distanceToAxis < best.distance) {
    best = closerDistance(
      best,
      nearestNeighborSearch(oppositeBranch, query, depth + 1)
    );
  }

  return best;
}

/**
 * Calculates the Euclidean distance between two vectors.
 * @param {number[]} a - First vector.
 * @param {number[]} b - Second vector.
 * @returns {number} Euclidean distance.
 */
function euclideanDistance(a, b) {
  return Math.sqrt(a.reduce((sum, val, idx) => sum + Math.pow(val - b[idx], 2), 0));
}

/**
 * Compares two nodes and returns the one with the smaller distance.
 * @param {KDTreeNode} a - First node.
 * @param {KDTreeNode} b - Second node.
 * @returns {KDTreeNode} Node with the smaller distance.
 */
function closerDistance(a, b) {
  return a.distance < b.distance ? a : b;
}

/**
 * Clears the k-d tree and resets the vector dimension.
 */
function clearStore() {
  kdTreeRoot = null;
  vectorDimension = null;
}

export { addVector, searchNearest, clearStore };