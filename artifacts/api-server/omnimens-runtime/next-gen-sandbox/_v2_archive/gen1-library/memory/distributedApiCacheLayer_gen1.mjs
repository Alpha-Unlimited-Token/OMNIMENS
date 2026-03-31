/**
 * OMNIMENS Self-Authored Module (Migrated from DB)
 * Original Source: evolution_cycle_1
 * Name: distributedApiCacheLayer
 * Purpose: Cache GPT-4o API responses for frequently queried contexts to reduce rate-limit bottlenecks.
 * Description: Caches GPT-4o API responses using semantic similarity and LRU eviction for distributed intelligence optimization.
 * Migrated: 2026-03-25T22:49:34.114Z
 */

// distributedApiCacheLayer.mjs

import { createHash } from 'crypto';

// Utility to generate a unique hash for API request contexts
export function hashContext(context) {
  return createHash('sha256').update(context).digest('hex');
}

// Utility to calculate cosine similarity between two vectors
export function cosineSimilarity(vecA, vecB) {
  const dotProduct = vecA.reduce((sum, a, idx) => sum + a * vecB[idx], 0);
  const magnitudeA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
  const magnitudeB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
  return dotProduct / (magnitudeA * magnitudeB);
}

// HNSW-like structure for semantic similarity grouping
class SemanticCache {
  constructor(maxSize = 100) {
    this.maxSize = maxSize;
    this.cache = new Map();
    this.index = new Map();
  }

  add(contextHash, vector, response) {
    if (this.cache.size >= this.maxSize) {
      this.evictLRU();
    }
    this.cache.set(contextHash, { vector, response, timestamp: Date.now() });
    this.index.set(contextHash, vector);
  }

  evictLRU() {
    let oldestKey = null;
    let oldestTimestamp = Infinity;
    for (const [key, value] of this.cache.entries()) {
      if (value.timestamp < oldestTimestamp) {
        oldestTimestamp = value.timestamp;
        oldestKey = key;
      }
    }
    if (oldestKey) {
      this.cache.delete(oldestKey);
      this.index.delete(oldestKey);
    }
  }

  findSimilar(vector, threshold = 0.8) {
    const results = [];
    for (const [key, cachedVector] of this.index.entries()) {
      const similarity = cosineSimilarity(vector, cachedVector);
      if (similarity >= threshold) {
        results.push({ key, similarity });
      }
    }
    return results.sort((a, b) => b.similarity - a.similarity);
  }

  get(contextHash) {
    return this.cache.get(contextHash)?.response || null;
  }
}

// Exported instance of SemanticCache for distributed caching
export const distributedCache = new SemanticCache();

// Example function to cache API responses
export function cacheApiResponse(context, vector, response) {
  const contextHash = hashContext(context);
  distributedCache.add(contextHash, vector, response);
}

// Example function to retrieve cached responses based on semantic similarity
export function getCachedResponse(context, vector, similarityThreshold = 0.8) {
  const contextHash = hashContext(context);
  const exactMatch = distributedCache.get(contextHash);
  if (exactMatch) return exactMatch;

  const similarEntries = distributedCache.findSimilar(vector, similarityThreshold);
  if (similarEntries.length > 0) {
    return distributedCache.get(similarEntries[0].key);
  }

  return null;
}

// Example utility function for cross-agent usage
export function normalizeVector(vector) {
  const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
  return vector.map(val => val / magnitude);
}