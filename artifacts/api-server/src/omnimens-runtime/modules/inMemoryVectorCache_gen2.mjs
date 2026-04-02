/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: inMemoryVectorCache
 * Written: 2026-04-02T15:12:41.639Z
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

import { performance } from 'node:perf_hooks';

/**
 * inMemoryVectorCache: A fast, in-memory vector store with LRU eviction for caching embeddings.
 */

// Helper function to calculate cosine similarity between two vectors
export function cosineSimilarity(vectorA, vectorB) {
  if (vectorA.length !== vectorB.length) {
    throw new Error('Vectors must be of the same length.');
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
export class InMemoryVectorCache {
  constructor(maxSize = 100) {
    this.maxSize = maxSize;
    this.cache = new Map(); // JavaScript Map to store embeddings
  }

  // Add a vector to the cache
  add(key, vector) {
    if (this.cache.has(key)) {
      this.cache.delete(key); // Remove existing entry to update its position
    }

    this.cache.set(key, vector);

    if (this.cache.size > this.maxSize) {
      const oldestKey = this.cache.keys().next().value; // Get the oldest key
      this.cache.delete(oldestKey); // Evict the least recently used item
    }
  }

  // Retrieve a vector from the cache
  get(key) {
    if (!this.cache.has(key)) {
      return null; // Key not found
    }

    const value = this.cache.get(key);
    this.cache.delete(key); // Remove and re-add to update its position
    this.cache.set(key, value);
    return value;
  }

  // Check if a key exists in the cache
  has(key) {
    return this.cache.has(key);
  }

  // Remove a specific key from the cache
  remove(key) {
    this.cache.delete(key);
  }

  // Clear the entire cache
  clear() {
    this.cache.clear();
  }

  // Get all keys currently in the cache
  keys() {
    return Array.from(this.cache.keys());
  }
}

// Utility function to measure execution time of a callback
export function measureExecutionTime(callback) {
  const start = performance.now();
  const result = callback();
  const end = performance.now();
  return { result, timeTaken: end - start };
}

// Example usage:
// const cache = new InMemoryVectorCache(3);
// cache.add('key1', [0.1, 0.2, 0.3]);
// cache.add('key2', [0.4, 0.5, 0.6]);
// console.log(cache.get('key1')); // [0.1, 0.2, 0.3]
// console.log(cosineSimilarity([1, 0, 0], [0, 1, 0])); // 0
