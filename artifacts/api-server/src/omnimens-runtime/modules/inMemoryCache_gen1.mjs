/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: inMemoryCache
 * Written: 2026-03-22T22:18:04.897Z
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
 * @module inMemoryCache
 * @description A key-value in-memory cache with a Least Recently Used (LRU) eviction policy for efficient data retrieval.
 */

/**
 * A class representing an in-memory cache with an LRU eviction policy.
 */
export class InMemoryCache {
  /**
   * @param {number} maxSize - The maximum number of items the cache can hold.
   */
  constructor(maxSize) {
    if (maxSize <= 0 || !Number.isInteger(maxSize)) {
      throw new Error("maxSize must be a positive integer.");
    }
    this.maxSize = maxSize;
    this.cache = new Map(); // Stores the key-value pairs
  }

  /**
   * Retrieves a value from the cache.
   * @param {string} key - The key of the value to retrieve.
   * @returns {*} The value associated with the key, or undefined if the key is not found.
   */
  get(key) {
    if (!this.cache.has(key)) {
      return undefined;
    }
    // Move the accessed key to the end to mark it used
    const value = this.cache.get(key);
    this.cache.delete(key);
    this.cache.set(key, value);
    return value;
  }

  /**
   * Adds a key-value pair to the cache. If the cache exceeds the maximum size, the least recently used item is evicted.
   * @param {string} key - The key to add.
   * @param {*} value - The value to associate with the key.
   */
  set(key, value) {
    if (this.cache.has(key)) {
      // Remove the existing key to update its position
      this.cache.delete(key);
    } else if (this.cache.size >= this.maxSize) {
      // Evict the least recently used item (the first item in the Map)
      const lruKey = this.cache.keys().next().value;
      this.cache.delete(lruKey);
    }
    this.cache.set(key, value);
  }

  /**
   * Checks if a key exists in the cache.
   * @param {string} key - The key to check.
   * @returns {boolean} True if the key exists, false otherwise.
   */
  has(key) {
    return this.cache.has(key);
  }

  /**
   * Removes a key-value pair from the cache.
   * @param {string} key - The key to remove.
   * @returns {boolean} True if the key was removed, false if the key was not found.
   */
  delete(key) {
    return this.cache.delete(key);
  }

  /**
   * Clears all key-value pairs from the cache.
   */
  clear() {
    this.cache.clear();
  }

  /**
   * Returns the current size of the cache.
   * @returns {number} The number of items in the cache.
   */
  size() {
    return this.cache.size;
  }

  /**
   * Returns an array of all keys in the cache, ordered from least recently used to most recently used.
   * @returns {string[]} An array of keys.
   */
  keys() {
    return Array.from(this.cache.keys());
  }

  /**
   * Returns an array of all values in the cache, ordered from least recently used to most recently used.
   * @returns {Array} An array of values.
   */
  values() {
    return Array.from(this.cache.values());
  }
}

/**
 * Creates a new in-memory cache instance.
 * @param {number} maxSize - The maximum number of items the cache can hold.
 * @returns {InMemoryCache} The in-memory cache instance.
 */
export function createCache(maxSize) {
  return new InMemoryCache(maxSize);
}