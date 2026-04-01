/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: dynamicVectorStore
 * Written: 2026-04-01T22:10:52.032Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// dynamicVectorStore.mjs

import { createHash } from 'crypto';

// Utility function to compute cosine similarity between two vectors
export function cosineSimilarity(vectorA, vectorB) {
  if (vectorA.length !== vectorB.length) {
    throw new Error('Vectors must be of the same length');
  }

  const dotProduct = vectorA.reduce((sum, val, idx) => sum + val * vectorB[idx], 0);
  const magnitudeA = Math.sqrt(vectorA.reduce((sum, val) => sum + val ** 2, 0));
  const magnitudeB = Math.sqrt(vectorB.reduce((sum, val) => sum + val ** 2, 0));

  return dotProduct / (magnitudeA * magnitudeB);
}

// Utility function to hash keys for consistent storage
export function hashKey(key) {
  return createHash('sha256').update(key).digest('hex');
}

// Class representing the dynamic vector store
export class DynamicVectorStore {
  constructor() {
    this.store = new Map();
  }

  // Add or update a vector in the store
  addOrUpdate(key, vector) {
    if (!Array.isArray(vector) || vector.some(isNaN)) {
      throw new Error('Vector must be an array of numbers');
    }

    const hashedKey = hashKey(key);
    this.store.set(hashedKey, vector);
  }

  // Remove a vector from the store
  remove(key) {
    const hashedKey = hashKey(key);
    this.store.delete(hashedKey);
  }

  // Find the most similar vector(s) to the given query vector
  findMostSimilar(queryVector, topN = 1) {
    if (!Array.isArray(queryVector) || queryVector.some(isNaN)) {
      throw new Error('Query vector must be an array of numbers');
    }

    const similarities = [];

    for (const [key, vector] of this.store.entries()) {
      const similarity = cosineSimilarity(queryVector, vector);
      similarities.push({ key, similarity });
    }

    similarities.sort((a, b) => b.similarity - a.similarity);

    return similarities.slice(0, topN).map((item) => ({ key: item.key, similarity: item.similarity }));
  }

  // Get the vector associated with a key
  getVector(key) {
    const hashedKey = hashKey(key);
    return this.store.get(hashedKey);
  }

  // Get all stored vectors (useful for debugging or batch operations)
  getAllVectors() {
    return Array.from(this.store.entries()).map(([key, vector]) => ({ key, vector }));
  }
}

// Example usage (uncomment for testing in Node.js)
// const store = new DynamicVectorStore();
// store.addOrUpdate('item1', [1, 2, 3]);
// store.addOrUpdate('item2', [4, 5, 6]);
// console.log(store.findMostSimilar([1, 2, 3], 1));
