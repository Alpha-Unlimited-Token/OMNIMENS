/**
 * @module vectorMemoryStore
 * @description Provides an in-memory vector embedding index for semantic search and fast similarity lookups using KD-tree.
 */

/**
 * Represents a KD-tree node.
 * @class
 */
class KDTreeNode {
  constructor(point, axis) {
    this.point = point; // The vector embedding stored at this node
    this.axis = axis; // The axis this node splits on
    this.left = null; // Left child node
    this.right = null; // Right child node
  }
}

/**
 * KD-tree implementation for fast approximate nearest neighbor search.
 * @class
 */
class KDTree {
  constructor(points) {
    this.root = this.buildTree(points, 0);
  }

  /**
   * Builds the KD-tree recursively.
   * @param {Array<Array<number>>} points - Array of vector embeddings.
   * @param {number} depth - Current depth in the tree.
   * @returns {KDTreeNode} Root node of the KD-tree.
   */
  buildTree(points, depth) {
    if (points.length === 0) return null;

    const axis = depth % points[0].length;
    points.sort((a, b) => a[axis] - b[axis]);
    const medianIndex = Math.floor(points.length / 2);

    const node = new KDTreeNode(points[medianIndex], axis);
    node.left = this.buildTree(points.slice(0, medianIndex), depth + 1);
    node.right = this.buildTree(points.slice(medianIndex + 1), depth + 1);

    return node;
  }

  /**
   * Finds the nearest neighbor to a given vector.
   * @param {Array<number>} target - Target vector embedding.
   * @returns {Array<number>} Nearest neighbor vector embedding.
   */
  findNearest(target) {
    let best = { point: null, distance: Infinity };

    const search = (node) => {
      if (!node) return;

      const distance = this.euclideanDistance(target, node.point);
      if (distance < best.distance) {
        best = { point: node.point, distance };
      }

      const axis = node.axis;
      const direction = target[axis] < node.point[axis] ? 'left' : 'right';

      search(node[direction]);
      const otherDirection = direction === 'left' ? 'right' : 'left';

      if (Math.abs(target[axis] - node.point[axis]) < best.distance) {
        search(node[otherDirection]);
      }
    };

    search(this.root);
    return best.point;
  }

  /**
   * Calculates the Euclidean distance between two vectors.
   * @param {Array<number>} a - First vector.
   * @param {Array<number>} b - Second vector.
   * @returns {number} Euclidean distance.
   */
  euclideanDistance(a, b) {
    return Math.sqrt(a.reduce((sum, val, i) => sum + (val - b[i]) ** 2, 0));
  }
}

/**
 * Creates a KD-tree from a set of vector embeddings.
 * @param {Array<Array<number>>} points - Array of vector embeddings.
 * @returns {KDTree} KD-tree instance.
 */
export function createVectorIndex(points) {
  return new KDTree(points);
}

/**
 * Finds the nearest neighbor to a given vector using a KD-tree.
 * @param {KDTree} tree - KD-tree instance.
 * @param {Array<number>} target - Target vector embedding.
 * @returns {Array<number>} Nearest neighbor vector embedding.
 */
export function findNearestNeighbor(tree, target) {
  return tree.findNearest(target);
}