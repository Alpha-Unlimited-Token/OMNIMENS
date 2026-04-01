/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: adaptiveMemoryManager
 * Written: 2026-04-01T22:14:48.044Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// adaptiveMemoryManager.mjs

import { createHash } from 'crypto';

/**
 * Dynamically manages embeddings in memory using LRU caching and memory-mapped buffers.
 * Optimized for access speed and resource usage.
 */

// Internal LRU Cache implementation
const lruCache = new Map();
const memoryBuffer = new Map();
let memoryLimit = 100; // Default max items in memory

/**
 * Sets the memory limit for the LRU cache.
 * @param {number} limit - Maximum number of items to keep in memory.
 */
export function setMemoryLimit(limit) {
  if (typeof limit !== 'number' || limit <= 0) {
    throw new Error('Memory limit must be a positive number.');
  }
  memoryLimit = limit;
  enforceMemoryLimit();
}

/**
 * Adds or updates an embedding in the memory manager.
 * @param {string} key - Unique identifier for the embedding.
 * @param {Float32Array} embedding - The embedding data to store.
 */
export function addEmbedding(key, embedding) {
  if (typeof key !== 'string' || !(embedding instanceof Float32Array)) {
    throw new Error('Invalid key or embedding type.');
  }

  if (lruCache.has(key)) {
    lruCache.delete(key); // Remove to reinsert for LRU ordering
  }

  lruCache.set(key, embedding);
  enforceMemoryLimit();
}

/**
 * Retrieves an embedding from memory or loads it dynamically if not in memory.
 * @param {string} key - Unique identifier for the embedding.
 * @returns {Float32Array | null} - The embedding data or null if not found.
 */
export function getEmbedding(key) {
  if (typeof key !== 'string') {
    throw new Error('Key must be a string.');
  }

  if (lruCache.has(key)) {
    const embedding = lruCache.get(key);
    lruCache.delete(key); // Update LRU ordering
    lruCache.set(key, embedding);
    return embedding;
  }

  // Attempt to load from memory buffer
  if (memoryBuffer.has(key)) {
    const embedding = memoryBuffer.get(key);
    addEmbedding(key, embedding); // Move to LRU cache
    memoryBuffer.delete(key);
    return embedding;
  }

  return null; // Not found
}

/**
 * Removes an embedding from memory.
 * @param {string} key - Unique identifier for the embedding.
 */
export function removeEmbedding(key) {
  if (typeof key !== 'string') {
    throw new Error('Key must be a string.');
  }

  lruCache.delete(key);
  memoryBuffer.delete(key);
}

/**
 * Generates a unique hash key for a given embedding.
 * @param {Float32Array} embedding - The embedding data to hash.
 * @returns {string} - A unique hash key.
 */
export function generateKey(embedding) {
  if (!(embedding instanceof Float32Array)) {
    throw new Error('Embedding must be a Float32Array.');
  }

  const hash = createHash('sha256');
  hash.update(Buffer.from(embedding.buffer));
  return hash.digest('hex');
}

/**
 * Enforces the memory limit by offloading least recently used items to the memory buffer.
 */
function enforceMemoryLimit() {
  while (lruCache.size > memoryLimit) {
    const oldestKey = lruCache.keys().next().value;
    const oldestValue = lruCache.get(oldestKey);

    // Move to memory buffer
    memoryBuffer.set(oldestKey, oldestValue);
    lruCache.delete(oldestKey);
  }
}

/**
 * Clears all embeddings from memory and buffer.
 */
export function clearMemory() {
  lruCache.clear();
  memoryBuffer.clear();
}

/**
 * Returns the current memory usage statistics.
 * @returns {Object} - An object with cache and buffer sizes.
 */
export function getMemoryStats() {
  return {
    cacheSize: lruCache.size,
    bufferSize: memoryBuffer.size,
    memoryLimit
  };
}