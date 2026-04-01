/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: vectorSearchEngine
 * Written: 2026-04-01T22:11:31.650Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// vectorSearchEngine.mjs

import { randomUUID } from 'crypto';

/**
 * Generates a random unique identifier for nodes in the HNSW graph.
 * Useful for uniquely identifying vectors.
 */
export function generateUUID() {
  return randomUUID();
}

/**
 * Calculates the Euclidean distance between two vectors.
 * @param {number[]} vectorA - First vector.
 * @param {number[]} vectorB - Second vector.
 * @returns {number} The Euclidean distance between the vectors.
 */
export function euclideanDistance(vectorA, vectorB) {
  if (vectorA.length !== vectorB.length) {
    throw new Error('Vectors must have the same dimensions.');
  }
  return Math.sqrt(vectorA.reduce((sum, val, idx) => sum + Math.pow(val - vectorB[idx], 2), 0));
}

/**
 * Initializes an empty HNSW graph structure.
 * @returns {object} An empty HNSW graph.
 */
export function initializeHNSW() {
  return {
    nodes: {},
    edges: {},
    levels: {},
    maxLevel: 0
  };
}

/**
 * Adds a vector to the HNSW graph.
 * @param {object} graph - The HNSW graph.
 * @param {number[]} vector - The vector to add.
 * @param {number} maxConnections - Maximum connections per level.
 * @returns {string} The UUID of the added vector.
 */
export function addVector(graph, vector, maxConnections = 5) {
  const id = generateUUID();
  const level = Math.floor(Math.random() * (graph.maxLevel + 2));

  graph.nodes[id] = vector;
  graph.levels[id] = level;
  graph.edges[id] = [];

  if (level > graph.maxLevel) {
    graph.maxLevel = level;
  }

  // Connect to nearest neighbors
  const neighbors = Object.keys(graph.nodes)
    .filter((nodeId) => nodeId !== id)
    .map((nodeId) => ({ id: nodeId, distance: euclideanDistance(vector, graph.nodes[nodeId]) }))
    .sort((a, b) => a.distance - b.distance)
    .slice(0, maxConnections);

  for (const neighbor of neighbors) {
    graph.edges[id].push(neighbor.id);
    graph.edges[neighbor.id].push(id);
  }

  return id;
}

/**
 * Searches for the k nearest neighbors of a query vector in the HNSW graph.
 * @param {object} graph - The HNSW graph.
 * @param {number[]} queryVector - The query vector.
 * @param {number} k - The number of neighbors to find.
 * @returns {Array<{id, distance}>} The k nearest neighbors.
 */
export function searchKNN(graph, queryVector, k) {
  const candidates = Object.keys(graph.nodes)
    .map((nodeId) => ({ id: nodeId, distance: euclideanDistance(queryVector, graph.nodes[nodeId]) }))
    .sort((a, b) => a.distance - b.distance)
    .slice(0, k);

  return candidates;
}

/**
 * Removes a vector from the HNSW graph.
 * @param {object} graph - The HNSW graph.
 * @param {string} id - The UUID of the vector to remove.
 */
export function removeVector(graph, id) {
  if (!graph.nodes[id]) {
    throw new Error('Vector ID not found in the graph.');
  }

  delete graph.nodes[id];
  delete graph.levels[id];

  for (const neighborId of graph.edges[id]) {
    graph.edges[neighborId] = graph.edges[neighborId].filter((nid) => nid !== id);
  }

  delete graph.edges[id];
}

/**
 * Updates a vector in the HNSW graph.
 * @param {object} graph - The HNSW graph.
 * @param {string} id - The UUID of the vector to update.
 * @param {number[]} newVector - The updated vector.
 */
export function updateVector(graph, id, newVector) {
  if (!graph.nodes[id]) {
    throw new Error('Vector ID not found in the graph.');
  }

  removeVector(graph, id);
  addVector(graph, newVector);
}

/**
 * Retrieves all vectors at a specific level in the HNSW graph.
 * @param {object} graph - The HNSW graph.
 * @param {number} level - The level to retrieve vectors from.
 * @returns {Array<{id, vector}>} All vectors at the specified level.
 */
export function getVectorsAtLevel(graph, level) {
  return Object.keys(graph.levels)
    .filter((id) => graph.levels[id] === level)
    .map((id) => ({ id, vector: graph.nodes[id] }));
}
