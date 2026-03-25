/**
 * OMNIMENS Self-Authored Module (Migrated from DB)
 * Original Source: evolution_cycle_1
 * Name: adaptiveApiCachingProxy
 * Purpose: Optimizes GPT-4o API usage by caching responses, prefetching probable queries, and prioritizing high-value calls.
 * Description: Optimizes API usage via caching, prefetching, and semantic query reuse to reduce redundant calls and improve response efficiency.
 * Migrated: 2026-03-25T22:49:34.132Z
 */

// adaptiveApiCachingProxy.mjs

import { createHash } from 'crypto';

// Utility function to generate a hash for caching keys
export function generateCacheKey(query) {
  return createHash('sha256').update(query).digest('hex');
}

// Semantic similarity scoring utility (basic cosine similarity)
export function cosineSimilarity(vecA, vecB) {
  const dotProduct = vecA.reduce((sum, val, idx) => sum + val * vecB[idx], 0);
  const magnitudeA = Math.sqrt(vecA.reduce((sum, val) => sum + val ** 2, 0));
  const magnitudeB = Math.sqrt(vecB.reduce((sum, val) => sum + val ** 2, 0));
  return magnitudeA && magnitudeB ? dotProduct / (magnitudeA * magnitudeB) : 0;
}

// Context-aware LRU cache implementation
export class AdaptiveLRUCache {
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
}

// Predictive prefetching based on query patterns
export function prefetchQueries(baseQuery, probableQueries, cache, fetchFunction) {
  probableQueries.forEach((query) => {
    const cacheKey = generateCacheKey(query);
    if (!cache.get(cacheKey)) {
      fetchFunction(query).then((response) => {
        cache.set(cacheKey, response);
      });
    }
  });
}

// Main API proxy function
export async function adaptiveApiProxy(query, fetchFunction, cache, similarityThreshold = 0.8) {
  const cacheKey = generateCacheKey(query);
  const cachedResponse = cache.get(cacheKey);
  if (cachedResponse) {
    return cachedResponse;
  }

  // Check for semantically similar queries in cache
  for (const [key, value] of cache.cache.entries()) {
    const similarity = cosineSimilarity(query.split('').map((char) => char.charCodeAt(0)), key.split('').map((char) => char.charCodeAt(0)));
    if (similarity >= similarityThreshold) {
      return value; // Reuse similar response
    }
  }

  // Fetch new response if no match found
  const newResponse = await fetchFunction(query);
  cache.set(cacheKey, newResponse);
  return newResponse;
}

// Example usage:
// const cache = new AdaptiveLRUCache(100);
// adaptiveApiProxy('example query', fetchFunction, cache).then(console.log);