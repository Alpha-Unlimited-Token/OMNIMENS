/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: memoryRetrievalCache
 * Written: 2026-03-23T09:41:16.906Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// memoryRetrievalCache.js

/**
 * @module memoryRetrievalCache
 * @description A hybrid memory retrieval module combining Redis-like caching for embeddings and PostgreSQL-like persistent storage.
 * @author OMNIMENS
 */

/**
 * @typedef {Object} CacheEntry
 * @property {string} key - The unique identifier for the memory entry.
 * @property {Array<number>} embedding - High-dimensional vector representing the memory.
 * @property {string} data - The associated memory data.
 * @property {number} timestamp - UNIX timestamp for cache entry.
 */

/**
 * @typedef {Object} PersistentEntry
 * @property {string} key - The unique identifier for the memory entry.
 * @property {Array<number>} embedding - High-dimensional vector representing the memory.
 * @property {string} data - The associated memory data.
 */

/**
 * In-memory cache simulating Redis.
 * @type {Map<string, CacheEntry>}
 */
const redisCache = new Map();

/**
 * Persistent storage simulating PostgreSQL.
 * @type {Map<string, PersistentEntry>}
 */
const postgresStorage = new Map();

/**
 * Computes the cosine similarity between two embeddings.
 * @param {Array<number>} vectorA - First vector.
 * @param {Array<number>} vectorB - Second vector.
 * @returns {number} Cosine similarity score.
 */
function cosineSimilarity(vectorA, vectorB) {
  const dotProduct = vectorA.reduce((sum, a, idx) => sum + a * vectorB[idx], 0);
  const magnitudeA = Math.sqrt(vectorA.reduce((sum, a) => sum + a ** 2, 0));
  const magnitudeB = Math.sqrt(vectorB.reduce((sum, b) => sum + b ** 2, 0));
  return dotProduct / (magnitudeA * magnitudeB);
}

/**
 * Retrieves memory from cache or persistent storage based on embedding similarity.
 * @param {Array<number>} queryEmbedding - The embedding to search for.
 * @param {number} similarityThreshold - Minimum similarity score to consider a match.
 * @returns {Array<{key: string, data: string, similarity: number}>} Matching memories.
 */
function retrieveMemory(queryEmbedding, similarityThreshold = 0.8) {
  const results = [];

  // Search Redis-like cache
  for (const [key, entry] of redisCache.entries()) {
    const similarity = cosineSimilarity(queryEmbedding, entry.embedding);
    if (similarity >= similarityThreshold) {
      results.push({ key, data: entry.data, similarity });
    }
  }

  // Search PostgreSQL-like storage if no cache matches
  if (results.length === 0) {
    for (const [key, entry] of postgresStorage.entries()) {
      const similarity = cosineSimilarity(queryEmbedding, entry.embedding);
      if (similarity >= similarityThreshold) {
        results.push({ key, data: entry.data, similarity });
      }
    }
  }

  // Sort results by similarity descending
  return results.sort((a, b) => b.similarity - a.similarity);
}

/**
 * Adds a memory entry to persistent storage and optionally caches it.
 * @param {string} key - Unique identifier for the memory.
 * @param {Array<number>} embedding - High-dimensional vector representing the memory.
 * @param {string} data - Associated memory data.
 * @param {boolean} cache - Whether to add to cache.
 */
function addMemory(key, embedding, data, cache = true) {
  const entry = { key, embedding, data, timestamp: Date.now() };

  // Add to persistent storage
  postgresStorage.set(key, { key, embedding, data });

  // Optionally add to cache
  if (cache) {
    redisCache.set(key, entry);
  }
}

/**
 * Removes a memory entry from both cache and persistent storage.
 * @param {string} key - Unique identifier for the memory.
 */
function removeMemory(key) {
  redisCache.delete(key);
  postgresStorage.delete(key);
}

/**
 * Clears the entire cache.
 */
function clearCache() {
  redisCache.clear();
}

/**
 * Clears the entire persistent storage.
 */
function clearStorage() {
  postgresStorage.clear();
}

export { retrieveMemory, addMemory, removeMemory, clearCache, clearStorage };