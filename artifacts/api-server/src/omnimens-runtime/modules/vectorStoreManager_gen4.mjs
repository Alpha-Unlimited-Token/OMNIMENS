/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: vectorStoreManager
 * Written: 2026-04-01T22:10:50.863Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// vectorStoreManager.mjs

import { randomUUID } from 'crypto';

/**
 * Represents a node in the HNSW graph.
 * @typedef {Object} Node
 * @property {string} id - Unique identifier for the node.
 * @property {number[]} vector - High-dimensional vector.
 * @property {Set<string>} neighbors - Set of neighbor node IDs.
 */

// Internal data structure for the vector store
const vectorStore = new Map();

/**
 * Computes the Euclidean distance between two vectors.
 * @param {number[]} vectorA - First vector.
 * @param {number[]} vectorB - Second vector.
 * @returns {number} - Euclidean distance.
 */
export function euclideanDistance(vectorA, vectorB) {
  if (vectorA.length !== vectorB.length) {
    throw new Error('Vectors must have the same dimensions.');
  }
  return Math.sqrt(vectorA.reduce((sum, value, index) => sum + Math.pow(value - vectorB[index], 2), 0));
}

/**
 * Adds a vector to the store and connects it to nearest neighbors.
 * @param {number[]} vector - High-dimensional vector to add.
 * @param {number} numNeighbors - Number of nearest neighbors to connect to.
 * @returns {string} - ID of the newly added vector.
 */
export function addVector(vector, numNeighbors = 5) {
  const id = randomUUID();
  const newNode = { id, vector, neighbors: new Set() };

  // Find nearest neighbors
  const distances = Array.from(vectorStore.values()).map(node => ({
    id: node.id,
    distance: euclideanDistance(vector, node.vector)
  }));

  distances.sort((a, b) => a.distance - b.distance);

  // Connect to nearest neighbors
  for (let i = 0; i < Math.min(numNeighbors, distances.length); i++) {
    const neighbor = vectorStore.get(distances[i].id);
    newNode.neighbors.add(neighbor.id);
    neighbor.neighbors.add(newNode.id);
  }

  vectorStore.set(id, newNode);
  return id;
}

/**
 * Searches for the nearest neighbors of a given query vector.
 * @param {number[]} queryVector - Vector to search for.
 * @param {number} k - Number of nearest neighbors to retrieve.
 * @returns {Array<{id, distance}>} - List of nearest neighbors.
 */
export function searchNearestNeighbors(queryVector, k = 5) {
  const distances = Array.from(vectorStore.values()).map(node => ({
    id: node.id,
    distance: euclideanDistance(queryVector, node.vector)
  }));

  distances.sort((a, b) => a.distance - b.distance);
  return distances.slice(0, k);
}

/**
 * Removes a vector from the store.
 * @param {string} id - ID of the vector to remove.
 * @returns {boolean} - True if the vector was removed, false otherwise.
 */
export function removeVector(id) {
  const node = vectorStore.get(id);
  if (!node) return false;

  // Remove connections to neighbors
  for (const neighborId of node.neighbors) {
    const neighbor = vectorStore.get(neighborId);
    if (neighbor) {
      neighbor.neighbors.delete(id);
    }
  }

  vectorStore.delete(id);
  return true;
}

/**
 * Clears the entire vector store.
 */
export function clearStore() {
  vectorStore.clear();
}

/**
 * Returns the current size of the vector store.
 * @returns {number} - Number of vectors in the store.
 */
export function storeSize() {
  return vectorStore.size;
}

/**
 * Retrieves a vector and its neighbors by ID.
 * @param {string} id - ID of the vector to retrieve.
 * @returns {Node|null} - The vector node or null if not found.
 */
export function getVectorById(id) {
  return vectorStore.get(id) || null;
}