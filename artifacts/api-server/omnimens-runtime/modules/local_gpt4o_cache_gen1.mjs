/**
 * OMNIMENS Self-Authored Module (Migrated from DB)
 * Original Source: evolution_cycle_1
 * Name: local_gpt4o_cache
 * Purpose: Cache GPT-4o API responses to reduce redundant calls and enable simulated iterative fine-tuning.
 * Description: Caches GPT-4o API responses locally using an LRU cache and cosine similarity for approximate query matching.
 * Migrated: 2026-03-25T22:49:34.151Z
 */

// Complete ES module code here

import { createHash } from 'crypto';

// Utility function to hash input queries
export function hashQuery(query) {
  const hash = createHash('sha256');
  hash.update(query);
  return hash.digest('hex');
}

// Utility function to calculate cosine similarity between two vectors
export function cosineSimilarity(vecA, vecB) {
  if (vecA.length !== vecB.length) throw new Error('Vectors must be the same length');

  const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
  const magnitudeA = Math.sqrt(vecA.reduce((sum, a) => sum + a ** 2, 0));
  const magnitudeB = Math.sqrt(vecB.reduce((sum, b) => sum + b ** 2, 0));

  if (magnitudeA === 0 || magnitudeB === 0) return 0; // Handle zero vector edge case

  return dotProduct / (magnitudeA * magnitudeB);
}

// LRU Cache implementation
export class LRUCache {
  constructor(maxSize = 100) {
    this.maxSize = maxSize;
    this.cache = new Map();
  }

  get(key) {
    if (!this.cache.has(key)) return null;
    const value = this.cache.get(key);
    this.cache.delete(key);
    this.cache.set(key, value); // Move to the end (most recently used)
    return value;
  }

  set(key, value) {
    if (this.cache.has(key)) this.cache.delete(key);
    this.cache.set(key, value);
    if (this.cache.size > this.maxSize) {
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
    }
  }

  has(key) {
    return this.cache.has(key);
  }
}

// Main module for caching GPT-4o responses
export class GPT4oCache {
  constructor(maxCacheSize = 100) {
    this.cache = new LRUCache(maxCacheSize);
  }

  storeResponse(query, response) {
    const queryHash = hashQuery(query);
    this.cache.set(queryHash, { query, response });
  }

  findSimilarResponse(query, similarityThreshold = 0.8) {
    const queryHash = hashQuery(query);
    const queryVector = this.vectorizeQuery(query);

    for (const [key, { query: cachedQuery, response }] of this.cache.cache.entries()) {
      const cachedVector = this.vectorizeQuery(cachedQuery);
      const similarity = cosineSimilarity(queryVector, cachedVector);

      if (similarity >= similarityThreshold) {
        return response;
      }
    }

    return null; // No sufficiently similar response found
  }

  vectorizeQuery(query) {
    // Simple vectorization: convert characters to their char codes
    return Array.from(query).map(char => char.charCodeAt(0));
  }
}

// Example utility function for cross-agent use
export function normalizeText(text) {
  return text.trim().toLowerCase().replace(/\s+/g, ' ');
}

// Example usage
export const gptCache = new GPT4oCache();