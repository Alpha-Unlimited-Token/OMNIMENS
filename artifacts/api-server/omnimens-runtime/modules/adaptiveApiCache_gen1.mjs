/**
 * OMNIMENS Self-Authored Module (Migrated from DB)
 * Original Source: evolution_cycle_1
 * Name: adaptiveApiCache
 * Purpose: Cache GPT-4o responses locally to simulate real-time adaptability within rate limits.
 * Description: Caches GPT-4o responses locally with LRU eviction, query fingerprinting, and response similarity matching to optimize API usage and simulate adaptability.
 * Migrated: 2026-03-25T22:49:34.150Z
 */

// adaptiveApiCache.mjs

import { createHash } from 'crypto';

const cache = new Map();
const MAX_CACHE_SIZE = 100; // Maximum number of entries in the cache

/**
 * Generates a unique fingerprint for a query string.
 * @param {string} query - The query string to fingerprint.
 * @returns {string} - A hashed fingerprint of the query.
 */
export function generateQueryFingerprint(query) {
  return createHash('sha256').update(query).digest('hex');
}

/**
 * Computes similarity between two text responses using Jaccard index.
 * @param {string} response1 - First response string.
 * @param {string} response2 - Second response string.
 * @returns {number} - Similarity score between 0 and 1.
 */
export function computeResponseSimilarity(response1, response2) {
  const set1 = new Set(response1.split(/\s+/));
  const set2 = new Set(response2.split(/\s+/));
  const intersectionSize = new Set([...set1].filter(x => set2.has(x))).size;
  const unionSize = new Set([...set1, ...set2]).size;
  return unionSize === 0 ? 0 : intersectionSize / unionSize;
}

/**
 * Retrieves a cached response or stores a new one if not found.
 * @param {string} query - The query string.
 * @param {string} response - The response string.
 * @returns {string} - Cached or newly stored response.
 */
export function getCachedResponse(query, response) {
  const fingerprint = generateQueryFingerprint(query);

  // Check if the query exists in the cache
  if (cache.has(fingerprint)) {
    return cache.get(fingerprint);
  }

  // If cache size exceeds limit, evict the least recently used (LRU) entry
  if (cache.size >= MAX_CACHE_SIZE) {
    const oldestKey = cache.keys().next().value;
    cache.delete(oldestKey);
  }

  // Store the new response in the cache
  cache.set(fingerprint, response);
  return response;
}

/**
 * Finds a similar cached response based on similarity matching.
 * @param {string} query - The query string.
 * @returns {string|null} - Similar cached response or null if none found.
 */
export function findSimilarCachedResponse(query) {
  const fingerprint = generateQueryFingerprint(query);
  let bestMatch = null;
  let highestSimilarity = 0;

  for (const [key, cachedResponse] of cache.entries()) {
    const similarity = computeResponseSimilarity(query, cachedResponse);
    if (similarity > highestSimilarity) {
      highestSimilarity = similarity;
      bestMatch = cachedResponse;
    }
  }

  return highestSimilarity > 0.8 ? bestMatch : null; // Threshold for similarity
}

/**
 * Clears the cache.
 */
export function clearCache() {
  cache.clear();
}

/**
 * Returns the current cache size.
 * @returns {number} - The number of items in the cache.
 */
export function getCacheSize() {
  return cache.size;
}

/**
 * Returns all cached keys and values.
 * @returns {Array} - Array of cached entries.
 */
export function getCacheEntries() {
  return Array.from(cache.entries());
}