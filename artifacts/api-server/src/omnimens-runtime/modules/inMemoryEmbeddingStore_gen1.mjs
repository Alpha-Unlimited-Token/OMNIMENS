/**
 * @module inMemoryEmbeddingStore
 * @description A utility module for storing and retrieving vector embeddings using a k-d tree for fast similarity searches.
 */

/**
 * Represents a node in the k-d tree.
 * @class
 */
class KDTreeNode {
  /**
   * @param {number[]} point - The vector point (embedding) stored in this node.
   * @param {*} data - Additional data associated with the point.
   * @param {number} axis - The axis used to split the data at this node.
   */
  constructor(point, data, axis) {
    this.point = point;
    this.data = data;
    this.axis = axis;
    this.left = null;
    this.right = null;
  }
}

/**
 * A k-d tree implementation for storing embeddings and performing fast similarity searches.
 * @class
 */
class KDTree {
  /**
   * @constructor
   * @param {Array<{point: number[], data: *}>} points - Array of objects containing points (embeddings) and associated data.
   */
  constructor(points = []) {
    this.root = this.buildTree(points, 0);
  }

  /**
   * Recursively builds the k-d tree.
   * @private
   * @param {Array<{point: number[], data: *}>} points - Array of points to build the tree from.
   * @param {number} depth - The current depth in the tree.
   * @returns {KDTreeNode|null} The root node of the (sub)tree.
   */
  buildTree(points, depth) {
    if (points.length === 0) return null;

    const axis = depth % points[0].point.length;
    points.sort((a, b) => a.point[axis] - b.point[axis]);
    const medianIndex = Math.floor(points.length / 2);

    const node = new KDTreeNode(
      points[medianIndex].point,
      points[medianIndex].data,
      axis
    );

    node.left = this.buildTree(points.slice(0, medianIndex), depth + 1);
    node.right = this.buildTree(points.slice(medianIndex + 1), depth + 1);

    return node;
  }

  /**
   * Finds the nearest neighbor to a given point.
   * @param {number[]} target - The target point to search for.
   * @returns {{point: number[], data: *, distance: number}} The nearest neighbor's point, data, and distance.
   */
  nearestNeighbor(target) {
    let best = { node: null, distance: Infinity };

    /**
     * Recursively searches for the nearest neighbor.
     * @private
     * @param {KDTreeNode} node - The current node.
     * @param {number} depth - The current depth in the tree.
     */
    const search = (node, depth) => {
      if (!node) return;

      const axis = depth % target.length;
      const distance = this.euclideanDistance(target, node.point);

      if (distance < best.distance) {
        best = { node, distance };
      }

      const nextBranch = target[axis] < node.point[axis] ? node.left : node.right;
      const otherBranch = nextBranch === node.left ? node.right : node.left;

      search(nextBranch, depth + 1);

      if (Math.abs(target[axis] - node.point[axis]) < best.distance) {
        search(otherBranch, depth + 1);
      }
    };

    search(this.root, 0);

    return {
      point: best.node.point,
      data: best.node.data,
      distance: best.distance
    };
  }

  /**
   * Calculates the Euclidean distance between two points.
   * @private
   * @param {number[]} a - The first point.
   * @param {number[]} b - The second point.
   * @returns {number} The Euclidean distance.
   */
  euclideanDistance(a, b) {
    return Math.sqrt(a.reduce((sum, val, i) => sum + (val - b[i]) ** 2, 0));
  }
}

/**
 * Stores embeddings and allows for fast similarity searches.
 * @class
 */
class InMemoryEmbeddingStore {
  constructor() {
    this.tree = null;
    this.points = [];
  }

  /**
   * Adds a new embedding to the store.
   * @param {number[]} embedding - The vector embedding to add.
   * @param {*} data - Additional data associated with the embedding.
   */
  addEmbedding(embedding, data) {
    this.points.push({ point: embedding, data });
    this.tree = new KDTree(this.points);
  }

  /**
   * Finds the most similar embedding to the given vector.
   * @param {number[]} embedding - The query vector.
   * @returns {{point: number[], data: *, distance: number}} The nearest neighbor's point, data, and distance.
   */
  findMostSimilar(embedding) {
    if (!this.tree) {
      throw new Error("No embeddings have been added to the store.");
    }
    return this.tree.nearestNeighbor(embedding);
  }
}

export { KDTree, InMemoryEmbeddingStore };