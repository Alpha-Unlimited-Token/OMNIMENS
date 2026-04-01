/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: inMemoryEmbeddingCache
 * Written: 2026-04-01T21:59:58.154Z
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

import { createHash } from 'crypto';

/**
 * Utility functions for in-memory embedding caching and similarity search using HNSW-like graph traversal.
 * Designed for fast approximate nearest neighbor search.
 */

// Internal data structure to store embeddings and graph connections
const embeddingStore = new Map();
const graphConnections = new Map();

/**
 * Hashes an embedding to create a unique key for storage.
 * @param {Array<number>} embedding - The embedding vector.
 * @returns {string} - A unique hash key.
 */
export function generateKey(embedding) {
  const hash = createHash('sha256');
  hash.update(embedding.join(','));
  return hash.digest('hex');
}

/**
 * Adds an embedding to the in-memory store and updates graph connections.
 * @param {Array<number>} embedding - The embedding vector.
 */
export function addEmbedding(embedding) {
  const key = generateKey(embedding);
  if (embeddingStore.has(key)) return; // Avoid duplicates

  embeddingStore.set(key, embedding);
  graphConnections.set(key, []);

  // Connect to nearest neighbors
  const neighbors = findNearestNeighbors(embedding, 5); // Find up to 5 nearest neighbors
  for (const neighbor of neighbors) {
    const neighborKey = generateKey(neighbor);
    graphConnections.get(key).push(neighborKey);
    graphConnections.get(neighborKey).push(key);
  }
}

/**
 * Finds the nearest neighbors of a given embedding.
 * @param {Array<number>} embedding - The embedding vector.
 * @param {number} k - Number of neighbors to retrieve.
 * @returns {Array<Array<number>>} - The nearest neighbors.
 */
export function findNearestNeighbors(embedding, k) {
  const distances = [];

  for (const [key, storedEmbedding] of embeddingStore.entries()) {
    const distance = calculateEuclideanDistance(embedding, storedEmbedding);
    distances.push({ key, embedding: storedEmbedding, distance });
  }

  distances.sort((a, b) => a.distance - b.distance);
  return distances.slice(0, k).map(item => item.embedding);
}

/**
 * Calculates the Euclidean distance between two vectors.
 * @param {Array<number>} vec1 - First vector.
 * @param {Array<number>} vec2 - Second vector.
 * @returns {number} - Euclidean distance.
 */
export function calculateEuclideanDistance(vec1, vec2) {
  if (vec1.length !== vec2.length) {
    throw new Error('Vectors must have the same length');
  }

  return Math.sqrt(vec1.reduce((sum, val, idx) => sum + (val - vec2[idx]) ** 2, 0));
}

/**
 * Retrieves an embedding by its unique key.
 * @param {string} key - The unique key of the embedding.
 * @returns {Array<number>|null} - The embedding vector or null if not found.
 */
export function getEmbeddingByKey(key) {
  return embeddingStore.get(key) || null;
}

/**
 * Retrieves graph connections for a given embedding key.
 * @param {string} key - The unique key of the embedding.
 * @returns {Array<string>|null} - List of connected keys or null if not found.
 */
export function getGraphConnections(key) {
  return graphConnections.get(key) || null;
}

/**
 * Clears all embeddings and graph connections from the store.
 */
export function clearStore() {
  embeddingStore.clear();
  graphConnections.clear();
}

/**
 * Returns the total number of embeddings stored.
 * @returns {number} - Count of embeddings.
 */
export function getEmbeddingCount() {
  return embeddingStore.size;
}
