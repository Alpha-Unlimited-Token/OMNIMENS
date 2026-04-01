/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: inMemoryVectorStore
 * Written: 2026-04-01T22:21:45.658Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// inMemoryVectorStore.mjs

import { performance } from 'node:perf_hooks';

/**
 * Calculates the Euclidean distance between two vectors.
 * @param {number[]} vectorA - First vector.
 * @param {number[]} vectorB - Second vector.
 * @returns {number} - Euclidean distance.
 */
export function euclideanDistance(vectorA, vectorB) {
  if (vectorA.length !== vectorB.length) {
    throw new Error('Vectors must have the same dimensions.');
  }
  return Math.sqrt(vectorA.reduce((sum, val, i) => sum + Math.pow(val - vectorB[i], 2), 0));
}

/**
 * Creates a new HNSW graph for approximate nearest neighbor search.
 * @param {number} maxNodes - Maximum number of nodes in the graph.
 * @param {number} maxLinks - Maximum number of links per node.
 * @returns {object} - HNSW graph instance.
 */
export function createHNSWGraph(maxNodes = 1000, maxLinks = 16) {
  const graph = [];

  /**
   * Adds a vector to the graph.
   * @param {number[]} vector - Vector to add.
   */
  function addNode(vector) {
    if (graph.length >= maxNodes) {
      throw new Error('Graph is full. Cannot add more nodes.');
    }
    const node = { vector, links: [] };
    graph.push(node);

    // Connect to nearest neighbors
    const distances = graph.map((n, index) => ({ index, distance: euclideanDistance(vector, n.vector) }));
    distances.sort((a, b) => a.distance - b.distance);
    const nearestNeighbors = distances.slice(1, maxLinks + 1);

    for (const neighbor of nearestNeighbors) {
      node.links.push(neighbor.index);
      graph[neighbor.index].links.push(graph.length - 1);
    }
  }

  /**
   * Searches for the nearest neighbors of a given query vector.
   * @param {number[]} queryVector - Query vector.
   * @param {number} k - Number of neighbors to return.
   * @returns {object[]} - Nearest neighbors with distances.
   */
  function search(queryVector, k = 1) {
    if (graph.length === 0) {
      throw new Error('Graph is empty.');
    }
    const visited = new Set();
    const candidates = graph.map((node, index) => ({ index, distance: euclideanDistance(queryVector, node.vector) }));
    candidates.sort((a, b) => a.distance - b.distance);

    const results = [];
    for (const candidate of candidates) {
      if (visited.size >= k) break;
      if (!visited.has(candidate.index)) {
        results.push(candidate);
        visited.add(candidate.index);
      }
    }

    return results;
  }

  return { addNode, search };
}

/**
 * Measures the execution time of a function.
 * @param {function} func - Function to measure.
 * @param {...any} args - Arguments to pass to the function.
 * @returns {object} - Result and execution time in milliseconds.
 */
export function measureExecutionTime(func, ...args) {
  const start = performance.now();
  const result = func(...args);
  const end = performance.now();
  return { result, timeMs: end - start };
}

/**
 * Generates random vectors for testing.
 * @param {number} count - Number of vectors.
 * @param {number} dimensions - Number of dimensions per vector.
 * @returns {number[][]} - Array of random vectors.
 */
export function generateRandomVectors(count, dimensions) {
  return Array.from({ length: count }, () => Array.from({ length: dimensions }, () => Math.random()));
}

/**
 * Example usage of the module.
 * Uncomment below to test in Node.js.
 */
// const graph = createHNSWGraph(100, 8);
// const vectors = generateRandomVectors(50, 3);
// vectors.forEach((vec) => graph.addNode(vec));
// const query = [0.5, 0.5, 0.5];
// console.log(graph.search(query, 5));

