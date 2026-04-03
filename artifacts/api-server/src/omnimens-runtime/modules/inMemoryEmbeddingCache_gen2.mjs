/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: inMemoryEmbeddingCache
 * Written: 2026-04-03T16:15:20.629Z
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

/**
 * Generates a hash for a given query to use as a key in the cache.
 * @param {string} query - The input query to hash.
 * @returns {string} - A unique hash string.
 */
export function generateHashKey(query) {
  const hash = createHash('sha256');
  hash.update(query);
  return hash.digest('hex');
}

/**
 * In-memory cache to store and retrieve embeddings.
 * @type {Map<string, Float32Array>}
 */
const embeddingCache = new Map();

/**
 * Stores an embedding in the cache.
 * @param {string} query - The query string used to generate the embedding.
 * @param {Float32Array} embedding - The embedding vector to store.
 */
export function storeEmbedding(query, embedding) {
  if (!(embedding instanceof Float32Array)) {
    throw new TypeError('Embedding must be a Float32Array.');
  }
  const key = generateHashKey(query);
  embeddingCache.set(key, embedding);
}

/**
 * Retrieves an embedding from the cache.
 * @param {string} query - The query string used to generate the embedding.
 * @returns {Float32Array | null} - The cached embedding, or null if not found.
 */
export function retrieveEmbedding(query) {
  const key = generateHashKey(query);
  return embeddingCache.get(key) || null;
}

/**
 * Clears all entries from the embedding cache.
 */
export function clearCache() {
  embeddingCache.clear();
}

/**
 * Gets the current size of the embedding cache.
 * @returns {number} - The number of entries in the cache.
 */
export function getCacheSize() {
  return embeddingCache.size;
}

/**
 * Checks if a query exists in the cache.
 * @param {string} query - The query string to check.
 * @returns {boolean} - True if the query exists in the cache, false otherwise.
 */
export function hasEmbedding(query) {
  const key = generateHashKey(query);
  return embeddingCache.has(key);
}

/**
 * Retrieves all keys currently in the cache (for debugging or introspection purposes).
 * @returns {string[]} - An array of hash keys currently stored in the cache.
 */
export function listCacheKeys() {
  return Array.from(embeddingCache.keys());
}

/**
 * Example utility function to normalize an embedding vector.
 * @param {Float32Array} embedding - The embedding vector to normalize.
 * @returns {Float32Array} - The normalized embedding vector.
 */
export function normalizeEmbedding(embedding) {
  if (!(embedding instanceof Float32Array)) {
    throw new TypeError('Embedding must be a Float32Array.');
  }
  const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val ** 2, 0));
  return new Float32Array(embedding.map(val => val / magnitude));
}

// Example usage (for testing purposes, remove in production):
// const query = "example query";
// const embedding = new Float32Array([0.1, 0.2, 0.3]);
// storeEmbedding(query, embedding);
// console.log(retrieveEmbedding(query));
// console.log(getCacheSize());
// console.log(normalizeEmbedding(embedding));