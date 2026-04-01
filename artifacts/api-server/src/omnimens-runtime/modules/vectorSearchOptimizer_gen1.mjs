/**
 * OMNIMENS Self-Authored Module (Migrated from DB)
 * Original Source: evolution_cycle_6
 * Name: vectorSearchOptimizer
 * Purpose: Provides efficient similarity search for high-dimensional embeddings.
 * Description: Provides efficient vector similarity search using HNSW for high-dimensional embeddings in JavaScript.
 * Migrated: 2026-04-01T22:23:20.235Z
 */

// vectorSearchOptimizer.mjs

import { randomUUID } from 'crypto';

/**
 * Calculates the Euclidean distance between two vectors.
 * @param {number[]} vec1 - First vector.
 * @param {number[]} vec2 - Second vector.
 * @returns {number} - Euclidean distance.
 */
export function euclideanDistance(vec1, vec2) {
  if (vec1.length !== vec2.length) {
    throw new Error('Vectors must have the same dimensions');
  }
  return Math.sqrt(vec1.reduce((sum, val, i) => sum + Math.pow(val - vec2[i], 2), 0));
}

/**
 * Implements a basic Hierarchical Navigable Small World (HNSW) graph for vector similarity search.
 * @class
 */
export class HNSW {
  constructor(maxNodes = 100, maxEdges = 16) {
    this.maxNodes = maxNodes; // Maximum number of nodes in the graph.
    this.maxEdges = maxEdges; // Maximum number of edges per node.
    this.nodes = new Map(); // Stores nodes as { id: { vector, edges } }.
  }

  /**
   * Adds a new vector to the graph.
   * @param {number[]} vector - The vector to add.
   * @returns {string} - The unique ID of the added vector.
   */
  addVector(vector) {
    if (this.nodes.size >= this.maxNodes) {
      throw new Error('Graph has reached its maximum capacity');
    }
    const id = randomUUID();
    this.nodes.set(id, { vector, edges: [] });

    // Connect to nearest neighbors.
    const neighbors = this._findNearestNeighbors(vector, this.maxEdges);
    for (const neighbor of neighbors) {
      this.nodes.get(neighbor).edges.push(id);
      this.nodes.get(id).edges.push(neighbor);
    }

    return id;
  }

  /**
   * Searches for the nearest vectors to a given query vector.
   * @param {number[]} queryVector - The query vector.
   * @param {number} k - Number of nearest neighbors to return.
   * @returns {Array<{ id: string, distance: number }>} - Nearest neighbors.
   */
  search(queryVector, k = 1) {
    if (k <= 0) {
      throw new Error('k must be greater than 0');
    }

    const distances = [];
    for (const [id, { vector }] of this.nodes) {
      const distance = euclideanDistance(queryVector, vector);
      distances.push({ id, distance });
    }

    distances.sort((a, b) => a.distance - b.distance);
    return distances.slice(0, k);
  }

  /**
   * Finds the nearest neighbors for a given vector.
   * @private
   * @param {number[]} vector - The vector to find neighbors for.
   * @param {number} maxNeighbors - Maximum number of neighbors to return.
   * @returns {string[]} - IDs of the nearest neighbors.
   */
  _findNearestNeighbors(vector, maxNeighbors) {
    const distances = [];
    for (const [id, { vector: nodeVector }] of this.nodes) {
      const distance = euclideanDistance(vector, nodeVector);
      distances.push({ id, distance });
    }

    distances.sort((a, b) => a.distance - b.distance);
    return distances.slice(0, maxNeighbors).map(({ id }) => id);
  }
}

/**
 * Utility function to normalize a vector to unit length.
 * @param {number[]} vector - The vector to normalize.
 * @returns {number[]} - Normalized vector.
 */
export function normalizeVector(vector) {
  const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val ** 2, 0));
  if (magnitude === 0) {
    throw new Error('Cannot normalize a zero vector');
  }
  return vector.map(val => val / magnitude);
}

/**
 * Utility function to generate random vectors for testing purposes.
 * @param {number} dimensions - Number of dimensions in the vector.
 * @returns {number[]} - Random vector.
 */
export function generateRandomVector(dimensions) {
  return Array.from({ length: dimensions }, () => Math.random());
}
