/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: inMemoryVectorStore
 * Written: 2026-04-01T21:49:37.656Z
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

// Utility function to calculate cosine similarity between two vectors
export function cosineSimilarity(vectorA, vectorB) {
  if (vectorA.length !== vectorB.length) {
    throw new Error('Vectors must have the same dimensionality');
  }

  const dotProduct = vectorA.reduce((sum, a, i) => sum + a * vectorB[i], 0);
  const magnitudeA = Math.sqrt(vectorA.reduce((sum, a) => sum + a ** 2, 0));
  const magnitudeB = Math.sqrt(vectorB.reduce((sum, b) => sum + b ** 2, 0));

  return dotProduct / (magnitudeA * magnitudeB);
}

// Hash function to generate unique keys for vectors
function hashVector(vector) {
  return createHash('sha256').update(vector.join(',')).digest('hex');
}

// In-memory vector store class
export class InMemoryVectorStore {
  constructor() {
    this.store = new Map();
  }

  // Add a vector to the store with an optional identifier
  addVector(vector, id = null) {
    if (!Array.isArray(vector) || vector.some(isNaN)) {
      throw new Error('Vector must be an array of numbers');
    }

    const key = id || hashVector(vector);
    this.store.set(key, vector);
    return key;
  }

  // Retrieve a vector by its identifier
  getVector(id) {
    return this.store.get(id) || null;
  }

  // Find the nearest neighbors to a given query vector
  findNearestNeighbors(queryVector, k = 1) {
    if (!Array.isArray(queryVector) || queryVector.some(isNaN)) {
      throw new Error('Query vector must be an array of numbers');
    }

    const similarities = [];

    for (const [id, vector] of this.store.entries()) {
      const similarity = cosineSimilarity(queryVector, vector);
      similarities.push({ id, similarity });
    }

    similarities.sort((a, b) => b.similarity - a.similarity);
    return similarities.slice(0, k);
  }

  // Remove a vector by its identifier
  removeVector(id) {
    return this.store.delete(id);
  }

  // Clear the entire vector store
  clearStore() {
    this.store.clear();
  }
}

// Example utility function to normalize a vector
export function normalizeVector(vector) {
  const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val ** 2, 0));
  return vector.map(val => val / magnitude);
}