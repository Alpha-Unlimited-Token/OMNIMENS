/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: inMemoryEmbeddingCache
 * Written: 2026-03-22T12:19:18.028Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

/**
 * @module inMemoryEmbeddingCache
 * @description A module for caching embeddings in memory using an LRU strategy, with periodic syncing to PostgreSQL.
 */

const crypto = require('crypto');

/**
 * A simple LRU cache implementation for storing embeddings in memory.
 * @class LRUCache
 */
class LRUCache {
  /**
   * @param {number} maxSize - Maximum number of items the cache can hold.
   */
  constructor(maxSize) {
    this.maxSize = maxSize;
    this.cache = new Map();
  }

  /**
   * Retrieves an item from the cache.
   * @param {string} key - The key of the item to retrieve.
   * @returns {any|null} - The cached value, or null if not found.
   */
  get(key) {
    if (!this.cache.has(key)) return null;
    const value = this.cache.get(key);
    // Move the accessed item to the end to mark it used.
    this.cache.delete(key);
    this.cache.set(key, value);
    return value;
  }

  /**
   * Adds an item to the cache.
   * @param {string} key - The key of the item to add.
   * @param {any} value - The value to cache.
   */
  set(key, value) {
    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else if (this.cache.size >= this.maxSize) {
      // Remove the least recently used item.
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
    }
    this.cache.set(key, value);
  }

  /**
   * Returns all items in the cache array of key-value pairs.
   * @returns {Array<[string, any]>} - An array of key-value pairs.
   */
  entries() {
    return Array.from(this.cache.entries());
  }
}

/**
 * Periodically syncs the in-memory cache to a PostgreSQL database.
 * @param {LRUCache} cache - The LRU cache instance.
 * @param {number} intervalMs - Sync interval in milliseconds.
 * @param {Function} syncFunction - A function to handle the syncing logic.
 */
function startCacheSync(cache, intervalMs, syncFunction) {
  setInterval(() => {
    const dataToSync = cache.entries();
    syncFunction(dataToSync);
  }, intervalMs);
}

/**
 * Generates a unique hash for a given embedding.
 * @param {Array<number>} embedding - The embedding array.
 * @returns {string} - A unique hash string.
 */
function generateEmbeddingHash(embedding) {
  const hash = crypto.createHash('sha256');
  hash.update(JSON.stringify(embedding));
  return hash.digest('hex');
}

/**
 * Adds an embedding to the cache.
 * @param {LRUCache} cache - The LRU cache instance.
 * @param {Array<number>} embedding - The embedding array.
 */
function addEmbeddingToCache(cache, embedding) {
  const hash = generateEmbeddingHash(embedding);
  cache.set(hash, embedding);
}

/**
 * Retrieves an embedding from the cache by its hash.
 * @param {LRUCache} cache - The LRU cache instance.
 * @param {string} hash - The hash of the embedding to retrieve.
 * @returns {Array<number>|null} - The embedding array, or null if not found.
 */
function getEmbeddingFromCache(cache, hash) {
  return cache.get(hash);
}

module.exports = {
  LRUCache,
  startCacheSync,
  generateEmbeddingHash,
  addEmbeddingToCache,
  getEmbeddingFromCache
};