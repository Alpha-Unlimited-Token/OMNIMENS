/**
 * @module dynamicVectorStore
 * @description Provides fast, in-memory storage and retrieval of vector embeddings using KD-tree for efficient querying.
 * Designed for contextual reasoning and advanced AI capabilities.
 */

/**
 * Node.js built-in modules used
 */
import { performance } from "perf_hooks";

/**
 * Represents a KD-tree node.
 * @class
 */
class KDTreeNode {
  constructor(point, axis) {
    this.point = point; // The vector point stored in this node
    this.axis = axis; // The axis used for splitting
    this.left = null; // Left child node
    this.right = null; // Right child node
  }
}

/**
 * Builds a KD-tree from a set of points.
 * @param {Array<number[]>} points - Array of vector embeddings.
 * @param {number} depth - Current depth in the tree.
 * @returns {KDTreeNode} Root node of the KD-tree.
 */
export function buildKDTree(points, depth = 0) {
  if (points.length === 0) return null;

  const axis = depth % points[0].length;
  points.sort((a, b) => a[axis] - b[axis]);
  const medianIndex = Math.floor(points.length / 2);

  const node = new KDTreeNode(points[medianIndex], axis);
  node.left = buildKDTree(points.slice(0, medianIndex), depth + 1);
  node.right = buildKDTree(points.slice(medianIndex + 1), depth + 1);

  return node;
}

/**
 * Finds the nearest neighbor to a given point in the KD-tree.
 * @param {KDTreeNode} node - Root node of the KD-tree.
 * @param {number[]} target - Target vector to search for.
 * @param {KDTreeNode|null} best - Current best match.
 * @param {number} bestDistance - Distance of the current best match.
 * @returns {Object} Nearest neighbor and its distance.
 */
export function nearestNeighbor(node, target, best = null, bestDistance = Infinity) {
  if (!node) return { best, bestDistance };

  const distance = euclideanDistance(node.point, target);
  let nextBest = best;
  let nextBestDistance = bestDistance;

  if (distance < bestDistance) {
    nextBest = node;
    nextBestDistance = distance;
  }

  const axis = node.axis;
  const direction = target[axis] < node.point[axis] ? 'left' : 'right';

  const { best: newBest, bestDistance: newBestDistance } = nearestNeighbor(
    node[direction],
    target,
    nextBest,
    nextBestDistance
  );

  nextBest = newBest;
  nextBestDistance = newBestDistance;

  const otherDirection = direction === 'left' ? 'right' : 'left';
  if (Math.abs(target[axis] - node.point[axis]) < nextBestDistance) {
    const { best: otherBest, bestDistance: otherBestDistance } = nearestNeighbor(
      node[otherDirection],
      target,
      nextBest,
      nextBestDistance
    );

    if (otherBestDistance < nextBestDistance) {
      nextBest = otherBest;
      nextBestDistance = otherBestDistance;
    }
  }

  return { best: nextBest, bestDistance: nextBestDistance };
}

/**
 * Calculates Euclidean distance between two points.
 * @param {number[]} pointA - First vector.
 * @param {number[]} pointB - Second vector.
 * @returns {number} Euclidean distance.
 */
export function euclideanDistance(pointA, pointB) {
  return Math.sqrt(
    pointA.reduce((sum, value, index) => sum + (value - pointB[index]) ** 2, 0)
  );
}

/**
 * Stores and queries vector embeddings using KD-tree.
 * @class
 */
export class DynamicVectorStore {
  constructor() {
    this.points = [];
    this.tree = null;
  }

  /**
   * Adds a vector embedding to the store.
   * @param {number[]} vector - Vector embedding to add.
   */
  addVector(vector) {
    if (!Array.isArray(vector) || vector.some(isNaN)) {
      throw new Error('Invalid vector: must be an array of numbers.');
    }
    this.points.push(vector);
    this.tree = buildKDTree(this.points);
  }

  /**
   * Finds the nearest vector embedding to the given target.
   * @param {number[]} target - Target vector to search for.
   * @returns {Object} Nearest vector and its distance.
   */
  findNearest(target) {
    if (!this.tree) {
      throw new Error('No vectors stored. Add vectors before querying.');
    }
    if (!Array.isArray(target) || target.some(isNaN)) {
      throw new Error('Invalid target: must be an array of numbers.');
    }
    const { best, bestDistance } = nearestNeighbor(this.tree, target);
    return { vector: best.point, distance: bestDistance };
  }
}

/**
 * Exports
 */
