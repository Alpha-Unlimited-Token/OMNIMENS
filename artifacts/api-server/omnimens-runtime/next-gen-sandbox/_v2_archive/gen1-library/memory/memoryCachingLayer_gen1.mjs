/**
 * OMNIMENS Self-Authored Module (Migrated from DB)
 * Original Source: evolution_cycle_1
 * Name: memoryCachingLayer
 * Purpose: Provide in-memory storage for embeddings and frequently accessed data.
 * Description: This module provides an in-memory caching layer with vector similarity search, enabling OMNIMENS to store, retrieve, and query embeddings efficiently.
 * Migrated: 2026-03-25T22:49:34.233Z
 */

/**
 * @module memoryCachingLayer
 * @description Provides in-memory storage for embeddings and frequently accessed data with vector similarity search capabilities.
 */

// Import necessary built-in modules
const crypto = require('crypto');

/**
 * @typedef {Object} CacheItem
 * @property {string} key - Unique identifier for the cached item.
 * @property {Array<number>} vector - Embedding vector associated with the item.
 * @property {any} data - The data associated with the key.
 */

/**
 * In-memory cache storage.
 * @type {Map<string, CacheItem>}
 */
const cache = new Map();

/**
 * Adds or updates an item in the cache.
 * @param {string} key - Unique identifier for the item.
 * @param {Array<number>} vector - Embedding vector associated with the item.
 * @param {any} data - The data to store.
 */
export function setCacheItem(key, vector, data) {
  if (!Array.isArray(vector) || vector.some(isNaN)) {
    throw new Error('Vector must be an array of numbers.');
  }
  cache.set(key, { key, vector, data });
}

/**
 * Retrieves an item from the cache by key.
 * @param {string} key - Unique identifier for the item.
 * @returns {CacheItem|null} The cached item or null if not found.
 */
export function getCacheItem(key) {
  return cache.get(key) || null;
}

/**
 * Clears all items from the cache.
 */
export function clearCache() {
  cache.clear();
}

/**
 * Computes the cosine similarity between two vectors.
 * @param {Array<number>} vectorA - The first vector.
 * @param {Array<number>} vectorB - The second vector.
 * @returns {number} Cosine similarity score.
 */
function cosineSimilarity(vectorA, vectorB) {
  if (vectorA.length !== vectorB.length) {
    throw new Error('Vectors must be of the same length.');
  }
  const dotProduct = vectorA.reduce((sum, val, i) => sum + val * vectorB[i], 0);
  const magnitudeA = Math.sqrt(vectorA.reduce((sum, val) => sum + val ** 2, 0));
  const magnitudeB = Math.sqrt(vectorB.reduce((sum, val) => sum + val ** 2, 0));
  return dotProduct / (magnitudeA * magnitudeB);
}

/**
 * Finds the most similar items in the cache based on vector similarity.
 * @param {Array<number>} queryVector - The query embedding vector.
 * @param {number} [topK=5] - The number of top similar items to return.
 * @returns {Array<{key: string, similarity: number}>} Array of top similar items with their keys and similarity scores.
 */
export function findSimilarItems(queryVector, topK = 5) {
  if (!Array.isArray(queryVector) || queryVector.some(isNaN)) {
    throw new Error('Query vector must be an array of numbers.');
  }
  const similarities = [];
  for (const { key, vector } of cache.values()) {
    const similarity = cosineSimilarity(queryVector, vector);
    similarities.push({ key, similarity });
  }
  return similarities
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, topK);
}

/**
 * Generates a unique key for cache items based on vector and timestamp.
 * @param {Array<number>} vector - The embedding vector.
 * @returns {string} A unique key.
 */
export function generateKey(vector) {
  const hash = crypto.createHash('sha256');
  hash.update(vector.join(','));
  return hash.digest('hex');
}

/**
 * Retrieves the current cache size.
 * @returns {number} The number of items in the cache.
 */
export function getCacheSize() {
  return cache.size;
}