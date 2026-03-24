/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: apiResponseCache
 * Written: 2026-03-24T22:06:23.781Z
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

// Utility function to generate a hash key for caching
export function generateHashKey(input) {
  const hash = createHash('sha256');
  hash.update(JSON.stringify(input));
  return hash.digest('hex');
}

// LRU Cache implementation
export class LRUCache {
  constructor(maxSize = 100) {
    this.maxSize = maxSize;
    this.cache = new Map();
  }

  get(key) {
    if (this.cache.has(key)) {
      const value = this.cache.get(key);
      this.cache.delete(key);
      this.cache.set(key, value); // Move to the end (most recently used)
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

  clear() {
    this.cache.clear();
  }
}

// Vector similarity function using cosine similarity
export function cosineSimilarity(vecA, vecB) {
  const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
  const magnitudeA = Math.sqrt(vecA.reduce((sum, a) => sum + a ** 2, 0));
  const magnitudeB = Math.sqrt(vecB.reduce((sum, b) => sum + b ** 2, 0));
  return dotProduct / (magnitudeA * magnitudeB);
}

// Namespace isolated cache manager
export class NamespaceCacheManager {
  constructor(maxSizePerNamespace = 100) {
    this.namespaces = new Map();
    this.maxSizePerNamespace = maxSizePerNamespace;
  }

  get(namespace, key) {
    if (!this.namespaces.has(namespace)) return null;
    return this.namespaces.get(namespace).get(key);
  }

  set(namespace, key, value) {
    if (!this.namespaces.has(namespace)) {
      this.namespaces.set(namespace, new LRUCache(this.maxSizePerNamespace));
    }
    this.namespaces.get(namespace).set(key, value);
  }

  clearNamespace(namespace) {
    if (this.namespaces.has(namespace)) {
      this.namespaces.get(namespace).clear();
    }
  }

  clearAll() {
    this.namespaces.clear();
  }
}

// Embedding lookup with vector similarity
export function findClosestEmbedding(targetEmbedding, embeddings, threshold = 0.8) {
  let closestMatch = null;
  let highestSimilarity = -Infinity;

  for (const [key, embedding] of Object.entries(embeddings)) {
    const similarity = cosineSimilarity(targetEmbedding, embedding);
    if (similarity > highestSimilarity && similarity >= threshold) {
      highestSimilarity = similarity;
      closestMatch = key;
    }
  }

  return closestMatch;
}

// Example usage:
// const cacheManager = new NamespaceCacheManager();
// cacheManager.set('apiResponses', 'key1', { data: 'response' });
// const response = cacheManager.get('apiResponses', 'key1');
// const closest = findClosestEmbedding([0.1, 0.2, 0.3], { key1: [0.1, 0.2, 0.4], key2: [0.5, 0.6, 0.7] });