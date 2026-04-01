/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: inMemoryVectorStore
 * Written: 2026-04-01T22:09:00.999Z
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

import { createHash } from 'crypto';

/**
 * Hashes a string to generate a consistent ID for embeddings.
 * @param {string} input - The input string to hash.
 * @returns {string} - A fixed-length hash ID.
 */
export function generateHashId(input) {
  return createHash('sha256').update(input).digest('hex');
}

/**
 * Calculates the Euclidean distance between two vectors.
 * @param {number[]} vec1 - The first vector.
 * @param {number[]} vec2 - The second vector.
 * @returns {number} - The Euclidean distance.
 */
export function calculateDistance(vec1, vec2) {
  if (vec1.length !== vec2.length) {
    throw new Error('Vectors must have the same dimensions');
  }
  return Math.sqrt(vec1.reduce((sum, val, i) => sum + Math.pow(val - vec2[i], 2), 0));
}

/**
 * Inserts an embedding into the vector store.
 * @param {Map<string, number[]>} store - The vector store.
 * @param {string} id - The ID of the embedding.
 * @param {number[]} embedding - The embedding vector.
 */
export function insertEmbedding(store, id, embedding) {
  if (store.has(id)) {
    throw new Error('ID already exists in the vector store');
  }
  store.set(id, embedding);
}

/**
 * Finds the k-nearest neighbors to a query vector.
 * @param {Map<string, number[]>} store - The vector store.
 * @param {number[]} query - The query vector.
 * @param {number} k - The number of neighbors to retrieve.
 * @returns {Array<{ id, distance}>} - The k-nearest neighbors.
 */
export function findKNearestNeighbors(store, query, k) {
  if (k <= 0) {
    throw new Error('k must be a positive integer');
  }
  const distances = [];
  for (const [id, vector] of store.entries()) {
    const distance = calculateDistance(query, vector);
    distances.push({ id, distance });
  }
  distances.sort((a, b) => a.distance - b.distance);
  return distances.slice(0, k);
}

/**
 * Updates an existing embedding in the vector store.
 * @param {Map<string, number[]>} store - The vector store.
 * @param {string} id - The ID of the embedding to update.
 * @param {number[]} newEmbedding - The new embedding vector.
 */
export function updateEmbedding(store, id, newEmbedding) {
  if (!store.has(id)) {
    throw new Error('ID does not exist in the vector store');
  }
  store.set(id, newEmbedding);
}

/**
 * Deletes an embedding from the vector store.
 * @param {Map<string, number[]>} store - The vector store.
 * @param {string} id - The ID of the embedding to delete.
 */
export function deleteEmbedding(store, id) {
  if (!store.has(id)) {
    throw new Error('ID does not exist in the vector store');
  }
  store.delete(id);
}

/**
 * Retrieves an embedding by ID.
 * @param {Map<string, number[]>} store - The vector store.
 * @param {string} id - The ID of the embedding to retrieve.
 * @returns {number[] | undefined} - The embedding vector or undefined if not found.
 */
export function getEmbedding(store, id) {
  return store.get(id);
}

/**
 * Creates a new in-memory vector store.
 * @returns {Map<string, number[]>} - A new vector store.
 */
export function createVectorStore() {
  return new Map();
}

// Example Usage:
// const store = createVectorStore();
// insertEmbedding(store, 'vec1', [1, 2, 3]);
// console.log(findKNearestNeighbors(store, [1, 2, 3], 1));