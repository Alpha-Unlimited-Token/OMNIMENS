/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: inMemoryVectorStore
 * Written: 2026-04-01T22:00:19.813Z
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

// Utility: Calculate Euclidean distance between two vectors
export function calculateEuclideanDistance(vectorA, vectorB) {
  if (vectorA.length !== vectorB.length) {
    throw new Error('Vectors must have the same dimensions');
  }
  return Math.sqrt(vectorA.reduce((sum, val, i) => sum + Math.pow(val - vectorB[i], 2), 0));
}

// Utility: Normalize a vector to unit length
export function normalizeVector(vector) {
  const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val ** 2, 0));
  if (magnitude === 0) {
    throw new Error('Cannot normalize a zero vector');
  }
  return vector.map(val => val / magnitude);
}

// Core: In-memory vector store with approximate nearest neighbor search
export function createInMemoryVectorStore(dimensions, maxCapacity = 1000) {
  if (!Number.isInteger(dimensions) || dimensions <= 0) {
    throw new Error('Dimensions must be a positive integer');
  }
  if (!Number.isInteger(maxCapacity) || maxCapacity <= 0) {
    throw new Error('Max capacity must be a positive integer');
  }

  const vectors = new Map();
  const ids = new Set();

  // Add a vector to the store
  function addVector(id, vector) {
    if (ids.has(id)) {
      throw new Error(`ID '${id}' already exists in the store`);
    }
    if (vector.length !== dimensions) {
      throw new Error(`Vector must have ${dimensions} dimensions`);
    }
    if (vectors.size >= maxCapacity) {
      throw new Error('Vector store is at maximum capacity');
    }
    vectors.set(id, normalizeVector(vector));
    ids.add(id);
  }

  // Remove a vector by ID
  function removeVector(id) {
    if (!ids.has(id)) {
      throw new Error(`ID '${id}' does not exist in the store`);
    }
    vectors.delete(id);
    ids.delete(id);
  }

  // Find the nearest neighbors for a given query vector
  function findNearestNeighbors(queryVector, k = 1) {
    if (queryVector.length !== dimensions) {
      throw new Error(`Query vector must have ${dimensions} dimensions`);
    }
    if (!Number.isInteger(k) || k <= 0) {
      throw new Error('k must be a positive integer');
    }
    const normalizedQuery = normalizeVector(queryVector);
    const distances = Array.from(vectors.entries()).map(([id, vector]) => ({
      id,
      distance: calculateEuclideanDistance(normalizedQuery, vector)
    }));
    distances.sort((a, b) => a.distance - b.distance);
    return distances.slice(0, k);
  }

  return {
    addVector,
    removeVector,
    findNearestNeighbors,
    size: () => vectors.size,
    capacity: () => maxCapacity
  };
}

// Utility: Generate a unique hash-based ID for a vector
export function generateVectorID(vector) {
  const hash = createHash('sha256');
  hash.update(vector.join(','));
  return hash.digest('hex');
}