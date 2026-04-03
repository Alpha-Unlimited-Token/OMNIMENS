/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: semanticVectorStore
 * Written: 2026-04-03T08:02:47.386Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// semanticVectorStore.mjs

import { createHash } from 'crypto';

// Utility function to compute cosine similarity between two vectors
export function cosineSimilarity(vectorA, vectorB) {
  if (vectorA.length !== vectorB.length) {
    throw new Error('Vectors must be of the same length');
  }

  const dotProduct = vectorA.reduce((sum, val, idx) => sum + val * vectorB[idx], 0);
  const magnitudeA = Math.sqrt(vectorA.reduce((sum, val) => sum + val ** 2, 0));
  const magnitudeB = Math.sqrt(vectorB.reduce((sum, val) => sum + val ** 2, 0));

  if (magnitudeA === 0 || magnitudeB === 0) {
    return 0; // Avoid division by zero
  }

  return dotProduct / (magnitudeA * magnitudeB);
}

// LRU Cache Implementation
class LRUCache {
  constructor(limit) {
    this.limit = limit;
    this.cache = new Map();
  }

  get(key) {
    if (!this.cache.has(key)) return undefined;
    const value = this.cache.get(key);
    this.cache.delete(key);
    this.cache.set(key, value);
    return value;
  }

  set(key, value) {
    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else if (this.cache.size >= this.limit) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    this.cache.set(key, value);
  }
}

// Semantic Vector Store
export class SemanticVectorStore {
  constructor(cacheSize = 100) {
    this.vectors = new Map();
    this.cache = new LRUCache(cacheSize);
  }

  // Adds a vector to the store with a unique key
  addVector(key, vector) {
    if (!Array.isArray(vector) || vector.some(isNaN)) {
      throw new Error('Vector must be an array of numbers');
    }
    const hash = this._hashKey(key);
    this.vectors.set(hash, vector);
  }

  // Retrieves the nearest neighbors for a given vector
  findNearestNeighbors(queryVector, topK = 5) {
    if (!Array.isArray(queryVector) || queryVector.some(isNaN)) {
      throw new Error('Query vector must be an array of numbers');
    }

    const cachedResult = this.cache.get(queryVector.toString());
    if (cachedResult) return cachedResult;

    const similarities = [];
    for (const [key, vector] of this.vectors.entries()) {
      const similarity = cosineSimilarity(queryVector, vector);
      similarities.push({ key, similarity });
    }

    similarities.sort((a, b) => b.similarity - a.similarity);
    const topResults = similarities.slice(0, topK).map(entry => ({ key: entry.key, similarity: entry.similarity }));

    this.cache.set(queryVector.toString(), topResults);
    return topResults;
  }

  // Private method to hash keys for consistency
  _hashKey(key) {
    return createHash('sha256').update(key).digest('hex');
  }
}

// Example utility function to normalize a vector
export function normalizeVector(vector) {
  const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val ** 2, 0));
  if (magnitude === 0) {
    throw new Error('Cannot normalize a zero vector');
  }
  return vector.map(val => val / magnitude);
}