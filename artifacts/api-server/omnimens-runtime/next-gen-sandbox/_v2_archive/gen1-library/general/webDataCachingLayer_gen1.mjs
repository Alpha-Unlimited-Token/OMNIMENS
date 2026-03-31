/**
 * OMNIMENS Self-Authored Module (Migrated from DB)
 * Original Source: evolution_cycle_1
 * Name: webDataCachingLayer
 * Purpose: Caches web-accessed data locally to reduce API dependency and latency.
 * Description: Implements a web data caching layer with LRU, TTL, and namespace isolation for efficient data retrieval across agents.
 * Migrated: 2026-03-25T22:49:34.108Z
 */

// webDataCachingLayer.mjs

import crypto from 'crypto';

// Utility function to generate unique keys for namespaces
export function generateNamespaceKey(namespace, key) {
  return crypto.createHash('sha256').update(`${namespace}:${key}`).digest('hex');
}

// LRU Cache implementation with TTL and namespace isolation
export class LRUCache {
  constructor(maxSize = 100, defaultTTL = 300000) {
    this.maxSize = maxSize;
    this.defaultTTL = defaultTTL;
    this.cache = new Map();
    this.expiry = new Map();
  }

  // Set a value in the cache with optional TTL
  set(namespace, key, value, ttl = this.defaultTTL) {
    const fullKey = generateNamespaceKey(namespace, key);
    const now = Date.now();

    // Remove oldest entry if cache exceeds max size
    if (this.cache.size >= this.maxSize) {
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
      this.expiry.delete(oldestKey);
    }

    this.cache.set(fullKey, value);
    this.expiry.set(fullKey, now + ttl);
  }

  // Get a value from the cache if not expired
  get(namespace, key) {
    const fullKey = generateNamespaceKey(namespace, key);
    const now = Date.now();

    if (!this.cache.has(fullKey)) {
      return null;
    }

    if (this.expiry.get(fullKey) < now) {
      this.cache.delete(fullKey);
      this.expiry.delete(fullKey);
      return null;
    }

    // Refresh LRU order
    const value = this.cache.get(fullKey);
    this.cache.delete(fullKey);
    this.cache.set(fullKey, value);

    return value;
  }

  // Remove a specific key from the cache
  delete(namespace, key) {
    const fullKey = generateNamespaceKey(namespace, key);
    this.cache.delete(fullKey);
    this.expiry.delete(fullKey);
  }

  // Clear all keys within a namespace
  clearNamespace(namespace) {
    for (const fullKey of this.cache.keys()) {
      if (fullKey.startsWith(generateNamespaceKey(namespace, ''))) {
        this.cache.delete(fullKey);
        this.expiry.delete(fullKey);
      }
    }
  }

  // Clear the entire cache
  clearAll() {
    this.cache.clear();
    this.expiry.clear();
  }
}

// Example usage
export const cacheInstance = new LRUCache();