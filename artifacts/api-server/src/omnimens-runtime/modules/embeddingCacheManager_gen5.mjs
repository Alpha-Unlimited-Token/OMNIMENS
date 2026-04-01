/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: embeddingCacheManager
 * Written: 2026-04-01T21:57:58.513Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// embeddingCacheManager.mjs

import { createHash } from 'crypto';

// Utility: Hash function for keys
export function hashKey(key) {
  return createHash('sha256').update(key).digest('hex');
}

// Utility: Euclidean distance calculation
export function euclideanDistance(vec1, vec2) {
  if (vec1.length !== vec2.length) {
    throw new Error('Vectors must be of the same dimension');
  }
  return Math.sqrt(vec1.reduce((sum, val, idx) => sum + Math.pow(val - vec2[idx], 2), 0));
}

// LRU Cache Implementation
export class LRUCache {
  constructor(maxSize) {
    if (maxSize <= 0) {
      throw new Error('Cache size must be greater than 0');
    }
    this.maxSize = maxSize;
    this.cache = new Map();
  }

  get(key) {
    if (this.cache.has(key)) {
      const value = this.cache.get(key);
      this.cache.delete(key);
      this.cache.set(key, value); // Move to end (most recently used)
      return value;
    }
    return null;
  }

  set(key, value) {
    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else if (this.cache.size >= this.maxSize) {
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
    }
    this.cache.set(key, value);
  }

  has(key) {
    return this.cache.has(key);
  }
}

// Approximate Nearest Neighbor (ANN) Search
export function findNearestNeighbors(targetVector, embeddings, k = 1) {
  if (k <= 0 || !Array.isArray(embeddings) || embeddings.length === 0) {
    throw new Error('Invalid input for nearest neighbor search');
  }
  const distances = embeddings.map(({ key, vector }) => ({
    key,
    distance: euclideanDistance(targetVector, vector)
  }));
  distances.sort((a, b) => a.distance - b.distance);
  return distances.slice(0, k);
}

// Main Cache Manager
export class EmbeddingCacheManager {
  constructor(maxCacheSize = 100) {
    this.cache = new LRUCache(maxCacheSize);
  }

  storeEmbedding(key, vector) {
    const hashedKey = hashKey(key);
    this.cache.set(hashedKey, { key, vector });
  }

  retrieveEmbedding(key) {
    const hashedKey = hashKey(key);
    return this.cache.get(hashedKey);
  }

  searchNearest(targetVector, k = 1) {
    const embeddings = Array.from(this.cache.cache.values());
    return findNearestNeighbors(targetVector, embeddings, k);
  }
}

// Example Usage:
// const manager = new EmbeddingCacheManager(50);
// manager.storeEmbedding('exampleKey', [0.1, 0.2, 0.3]);
// const result = manager.searchNearest([0.1, 0.2, 0.25], 1);
// console.log(result);