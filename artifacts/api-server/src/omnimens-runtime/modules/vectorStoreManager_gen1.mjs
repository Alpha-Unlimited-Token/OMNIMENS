/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: vectorStoreManager
 * Written: 2026-04-03T12:16:57.190Z
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

import { createHash } from 'crypto';

/**
 * Generate a unique hash key for an embedding vector.
 * @param {Float32Array} vector - The input vector.
 * @returns {string} - A unique hash for the vector.
 */
export function generateVectorHash(vector) {
  const hash = createHash('sha256');
  for (const value of vector) {
    hash.update(value.toString());
  }
  return hash.digest('hex');
}

/**
 * Calculate the Euclidean distance between two vectors.
 * @param {Float32Array} vectorA - The first vector.
 * @param {Float32Array} vectorB - The second vector.
 * @returns {number} - The Euclidean distance.
 */
export function calculateDistance(vectorA, vectorB) {
  if (vectorA.length !== vectorB.length) {
    throw new Error('Vectors must have the same dimensions.');
  }
  let sum = 0;
  for (let i = 0; i < vectorA.length; i++) {
    const diff = vectorA[i] - vectorB[i];
    sum += diff * diff;
  }
  return Math.sqrt(sum);
}

/**
 * Insert an embedding into the in-memory store.
 * @param {Map} store - The in-memory vector store.
 * @param {string} id - The unique identifier for the embedding.
 * @param {Float32Array} vector - The embedding vector.
 */
export function insertEmbedding(store, id, vector) {
  if (store.has(id)) {
    throw new Error(`Embedding with ID '${id}' already exists.`);
  }
  store.set(id, vector);
}

/**
 * Perform an approximate nearest neighbor (ANN) search.
 * @param {Map} store - The in-memory vector store.
 * @param {Float32Array} queryVector - The query vector.
 * @param {number} k - The number of nearest neighbors to retrieve.
 * @returns {Array} - An array of the k nearest neighbors as { id, distance }.
 */
export function searchNearestNeighbors(store, queryVector, k) {
  const results = [];

  for (const [id, vector] of store.entries()) {
    const distance = calculateDistance(queryVector, vector);
    results.push({ id, distance });
  }

  results.sort((a, b) => a.distance - b.distance);
  return results.slice(0, k);
}

/**
 * Update an existing embedding in the store.
 * @param {Map} store - The in-memory vector store.
 * @param {string} id - The unique identifier for the embedding.
 * @param {Float32Array} newVector - The updated embedding vector.
 */
export function updateEmbedding(store, id, newVector) {
  if (!store.has(id)) {
    throw new Error(`Embedding with ID '${id}' does not exist.`);
  }
  store.set(id, newVector);
}

/**
 * Delete an embedding from the store.
 * @param {Map} store - The in-memory vector store.
 * @param {string} id - The unique identifier for the embedding.
 */
export function deleteEmbedding(store, id) {
  if (!store.has(id)) {
    throw new Error(`Embedding with ID '${id}' does not exist.`);
  }
  store.delete(id);
}

/**
 * Initialize a new in-memory vector store.
 * @returns {Map} - An empty Map to store embeddings.
 */
export function createVectorStore() {
  return new Map();
}

/**
 * Normalize a vector to unit length.
 * @param {Float32Array} vector - The input vector.
 * @returns {Float32Array} - The normalized vector.
 */
export function normalizeVector(vector) {
  const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
  if (magnitude === 0) {
    throw new Error('Cannot normalize a zero vector.');
  }
  return new Float32Array(vector.map(val => val / magnitude));
}
