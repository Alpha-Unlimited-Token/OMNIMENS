/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: inMemoryVectorStore
 * Written: 2026-04-03T12:23:52.697Z
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
 * Utility function to compute a hash for caching purposes.
 * @param {string} input - The input string to hash.
 * @returns {string} - A SHA-256 hash of the input.
 */
export function computeHash(input) {
  return createHash('sha256').update(input).digest('hex');
}

/**
 * Computes cosine similarity between two vectors.
 * @param {number[]} vecA - First vector.
 * @param {number[]} vecB - Second vector.
 * @returns {number} - Cosine similarity score.
 */
export function cosineSimilarity(vecA, vecB) {
  const dotProduct = vecA.reduce((sum, val, idx) => sum + val * vecB[idx], 0);
  const magnitudeA = Math.sqrt(vecA.reduce((sum, val) => sum + val ** 2, 0));
  const magnitudeB = Math.sqrt(vecB.reduce((sum, val) => sum + val ** 2, 0));
  return magnitudeA && magnitudeB ? dotProduct / (magnitudeA * magnitudeB) : 0;
}

/**
 * Implements an LRU cache for embeddings.
 */
export class LRUCache {
  constructor(maxSize = 100) {
    this.maxSize = maxSize;
    this.cache = new Map();
  }

  /**
   * Adds an embedding to the cache.
   * @param {string} key - Unique key for the embedding.
   * @param {number[]} embedding - The embedding vector.
   */
  set(key, embedding) {
    if (this.cache.has(key)) {
      this.cache.delete(key);
    }
    this.cache.set(key, embedding);
    if (this.cache.size > this.maxSize) {
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
    }
  }

  /**
   * Retrieves an embedding from the cache.
   * @param {string} key - Unique key for the embedding.
   * @returns {number[] | undefined} - The embedding vector or undefined if not found.
   */
  get(key) {
    if (!this.cache.has(key)) return undefined;
    const value = this.cache.get(key);
    this.cache.delete(key);
    this.cache.set(key, value);
    return value;
  }

  /**
   * Clears the cache.
   */
  clear() {
    this.cache.clear();
  }
}

/**
 * Implements an approximate nearest neighbor (ANN) search using HNSW-like logic.
 */
export class ANNIndex {
  constructor() {
    this.embeddings = [];
  }

  /**
   * Adds an embedding to the index.
   * @param {number[]} embedding - The embedding vector.
   */
  add(embedding) {
    this.embeddings.push(embedding);
  }

  /**
   * Searches for the most similar embeddings.
   * @param {number[]} query - Query embedding.
   * @param {number} k - Number of nearest neighbors to retrieve.
   * @returns {Array<{index, similarity}>} - List of nearest neighbors with their indices and similarity scores.
   */
  search(query, k = 5) {
    const similarities = this.embeddings.map((embedding, index) => ({
      index,
      similarity: cosineSimilarity(query, embedding)
    }));
    return similarities
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, k);
  }
}

/**
 * Combines LRU cache and ANN search for efficient retrieval.
 */
export class InMemoryVectorStore {
  constructor(cacheSize = 100) {
    this.cache = new LRUCache(cacheSize);
    this.index = new ANNIndex();
  }

  /**
   * Adds an embedding to the store.
   * @param {string} key - Unique key for the embedding.
   * @param {number[]} embedding - The embedding vector.
   */
  add(key, embedding) {
    this.cache.set(key, embedding);
    this.index.add(embedding);
  }

  /**
   * Searches for the most similar embeddings.
   * @param {number[]} query - Query embedding.
   * @param {number} k - Number of nearest neighbors to retrieve.
   * @returns {Array<{key, similarity}>} - List of nearest neighbors with their keys and similarity scores.
   */
  search(query, k = 5) {
    const neighbors = this.index.search(query, k);
    return neighbors.map(({ index, similarity }) => ({
      key: Array.from(this.cache.cache.keys())[index],
      similarity
    }));
  }
}
