/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: inMemoryVectorStore
 * Written: 2026-04-01T22:13:20.183Z
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
 * Computes the Euclidean distance between two vectors.
 * @param {number[]} vectorA - First vector.
 * @param {number[]} vectorB - Second vector.
 * @returns {number} - The Euclidean distance.
 */
export function euclideanDistance(vectorA, vectorB) {
  if (vectorA.length !== vectorB.length) {
    throw new Error('Vectors must have the same dimensions.');
  }
  return Math.sqrt(vectorA.reduce((sum, val, idx) => sum + Math.pow(val - vectorB[idx], 2), 0));
}

/**
 * Normalizes a vector to unit length.
 * @param {number[]} vector - Input vector.
 * @returns {number[]} - Normalized vector.
 */
export function normalizeVector(vector) {
  const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
  if (magnitude === 0) {
    throw new Error('Cannot normalize a zero vector.');
  }
  return vector.map(val => val / magnitude);
}

/**
 * Hashes a vector into a unique string for indexing.
 * @param {number[]} vector - Input vector.
 * @returns {string} - Hashed string representation.
 */
export function hashVector(vector) {
  const hash = createHash('sha256');
  hash.update(vector.join(','));
  return hash.digest('hex');
}

/**
 * Class representing an in-memory vector store for ANN searches.
 */
export class InMemoryVectorStore {
  constructor() {
    this.store = new Map();
  }

  /**
   * Adds a vector and its associated metadata to the store.
   * @param {number[]} vector - Input vector.
   * @param {any} metadata - Associated metadata.
   */
  addVector(vector, metadata) {
    const normalizedVector = normalizeVector(vector);
    const key = hashVector(normalizedVector);
    this.store.set(key, { vector: normalizedVector, metadata });
  }

  /**
   * Finds the nearest neighbors to a query vector.
   * @param {number[]} queryVector - Query vector.
   * @param {number} k - Number of neighbors to retrieve.
   * @returns {Array<{ vector, metadata, distance}>} - Nearest neighbors.
   */
  findNearestNeighbors(queryVector, k = 1) {
    const normalizedQuery = normalizeVector(queryVector);
    const distances = [];

    for (const [key, { vector, metadata }] of this.store.entries()) {
      const distance = euclideanDistance(normalizedQuery, vector);
      distances.push({ vector, metadata, distance });
    }

    distances.sort((a, b) => a.distance - b.distance);
    return distances.slice(0, k);
  }

  /**
   * Clears all stored vectors.
   */
  clearStore() {
    this.store.clear();
  }
}

/**
 * Factory function to create a new vector store instance.
 * @returns {InMemoryVectorStore} - New vector store instance.
 */
export function createVectorStore() {
  return new InMemoryVectorStore();
}