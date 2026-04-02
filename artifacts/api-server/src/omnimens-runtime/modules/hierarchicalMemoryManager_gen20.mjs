/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: hierarchicalMemoryManager
 * Written: 2026-04-02T13:31:00.006Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// hierarchicalMemoryManager.mjs

import { createHash } from 'crypto';

// Utility: Generate a unique hash for identifying embeddings
export function generateHash(input) {
  const hash = createHash('sha256');
  hash.update(input);
  return hash.digest('hex');
}

// Utility: Compress embeddings using a simple normalization technique
export function compressEmbedding(embedding) {
  const maxVal = Math.max(...embedding);
  const minVal = Math.min(...embedding);
  return embedding.map(value => (value - minVal) / (maxVal - minVal));
}

// Utility: Decompress embeddings back to original scale
export function decompressEmbedding(embedding, originalMin, originalMax) {
  return embedding.map(value => value * (originalMax - originalMin) + originalMin);
}

// Core: LRU Cache implementation
class LRUCache {
  constructor(limit = 100) {
    this.limit = limit;
    this.cache = new Map();
  }

  get(key) {
    if (this.cache.has(key)) {
      const value = this.cache.get(key);
      this.cache.delete(key);
      this.cache.set(key, value);
      return value;
    }
    return null;
  }

  set(key, value) {
    if (this.cache.size >= this.limit) {
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
    }
    this.cache.set(key, value);
  }
}

// Core: Hierarchical Memory Manager
export class HierarchicalMemoryManager {
  constructor(cacheLimit = 100) {
    this.cache = new LRUCache(cacheLimit);
    this.diskStorage = new Map(); // Simulating disk storage
  }

  storeEmbedding(key, embedding) {
    const compressed = compressEmbedding(embedding);
    this.cache.set(key, compressed);
    this.diskStorage.set(key, compressed); // Store compressed embedding to simulated disk
  }

  retrieveEmbedding(key) {
    let embedding = this.cache.get(key);
    if (!embedding) {
      embedding = this.diskStorage.get(key); // Retrieve from simulated disk
      if (embedding) {
        this.cache.set(key, embedding); // Add back to cache
      }
    }
    return embedding;
  }

  summarizeEmbeddings(keys) {
    const embeddings = keys.map(key => this.retrieveEmbedding(key)).filter(Boolean);
    if (embeddings.length === 0) return null;

    const dimension = embeddings[0].length;
    const summary = Array(dimension).fill(0);
    embeddings.forEach(embedding => {
      embedding.forEach((value, index) => {
        summary[index] += value;
      });
    });

    return summary.map(value => value / embeddings.length); // Average
  }
}

// Export instance for shared use
export const memoryManager = new HierarchicalMemoryManager();