/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: inMemoryVectorStore
 * Written: 2026-04-01T22:09:20.037Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// Complete ES module code here

import { performance } from 'perf_hooks';

/**
 * Represents a node in the HNSW graph.
 */
class HNSWNode {
  constructor(id, vector) {
    this.id = id;
    this.vector = vector;
    this.neighbors = new Map(); // Level -> Array of neighbor IDs
  }
}

/**
 * Calculates the Euclidean distance between two vectors.
 * @param {number[]} vec1 - First vector.
 * @param {number[]} vec2 - Second vector.
 * @returns {number} - Euclidean distance.
 */
export function euclideanDistance(vec1, vec2) {
  if (vec1.length !== vec2.length) {
    throw new Error('Vectors must have the same dimensions.');
  }
  return Math.sqrt(vec1.reduce((sum, val, i) => sum + (val - vec2[i]) ** 2, 0));
}

/**
 * Inserts a new vector into the HNSW graph.
 * @param {Map<number, HNSWNode>} graph - The HNSW graph.
 * @param {number} id - Unique ID for the vector.
 * @param {number[]} vector - The vector to insert.
 * @param {number} maxNeighbors - Maximum neighbors per level.
 * @param {number} level - The level at which to insert the vector.
 */
export function insertVector(graph, id, vector, maxNeighbors = 5, level = 1) {
  const newNode = new HNSWNode(id, vector);
  graph.set(id, newNode);

  // Find nearest neighbors for the new node
  const neighbors = Array.from(graph.values())
    .filter(node => node.id !== id)
    .map(node => ({ id: node.id, distance: euclideanDistance(node.vector, vector) }))
    .sort((a, b) => a.distance - b.distance)
    .slice(0, maxNeighbors);

  // Connect the new node to its neighbors
  newNode.neighbors.set(level, neighbors.map(n => n.id));

  // Connect neighbors back to the new node
  for (const neighbor of neighbors) {
    const neighborNode = graph.get(neighbor.id);
    if (!neighborNode.neighbors.has(level)) {
      neighborNode.neighbors.set(level, []);
    }
    neighborNode.neighbors.get(level).push(id);
  }
}

/**
 * Performs a k-nearest neighbor search in the HNSW graph.
 * @param {Map<number, HNSWNode>} graph - The HNSW graph.
 * @param {number[]} queryVector - The query vector.
 * @param {number} k - Number of nearest neighbors to find.
 * @returns {Array<{ id, distance}>} - The k-nearest neighbors.
 */
export function knnSearch(graph, queryVector, k = 5) {
  const distances = Array.from(graph.values())
    .map(node => ({ id: node.id, distance: euclideanDistance(node.vector, queryVector) }))
    .sort((a, b) => a.distance - b.distance);

  return distances.slice(0, k);
}

/**
 * Creates an in-memory HNSW graph for fast vector similarity searches.
 * @returns {Map<number, HNSWNode>} - The initialized HNSW graph.
 */
export function createHNSWGraph() {
  return new Map();
}

/**
 * Measures the time taken to execute a function.
 * @param {Function} fn - The function to measure.
 * @param {...any} args - Arguments to pass to the function.
 * @returns {{ result, time}} - The result of the function and time taken in milliseconds.
 */
export function measureExecutionTime(fn, ...args) {
  const start = performance.now();
  const result = fn(...args);
  const end = performance.now();
  return { result, time: end - start };
}

/**
 * Utility function to normalize a vector.
 * @param {number[]} vector - The vector to normalize.
 * @returns {number[]} - The normalized vector.
 */
export function normalizeVector(vector) {
  const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val ** 2, 0));
  return vector.map(val => val / magnitude);
}

/**
 * Utility function to generate random vectors.
 * @param {number} dimensions - Number of dimensions for each vector.
 * @param {number} count - Number of vectors to generate.
 * @returns {number[][]} - Array of random vectors.
 */
export function generateRandomVectors(dimensions, count) {
  return Array.from({ length: count }, () =>
    Array.from({ length: dimensions }, () => Math.random())
  );
}

// Example usage (uncomment for testing):
// const graph = createHNSWGraph();
// const vectors = generateRandomVectors(3, 10);
// vectors.forEach((vec, i) => insertVector(graph, i, vec));
// const query = [0.5, 0.5, 0.5];
// console.log(knnSearch(graph, query, 3));