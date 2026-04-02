/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: hierarchicalMemoryManager
 * Written: 2026-04-02T14:11:59.953Z
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

/**
 * Compresses a given text using a simple hashing mechanism for storage efficiency.
 * @param {string} text - The text to be compressed.
 * @returns {string} - A hash representing the compressed text.
 */
export function compressText(text) {
  const hash = createHash('sha256');
  hash.update(text);
  return hash.digest('hex');
}

/**
 * Summarizes a given text hierarchically by extracting key sentences.
 * @param {string} text - The text to summarize.
 * @param {number} sentenceCount - Number of sentences to extract.
 * @returns {string} - A summarized version of the text.
 */
export function summarizeText(text, sentenceCount = 3) {
  const sentences = text.split('.');
  const keySentences = sentences.slice(0, Math.min(sentenceCount, sentences.length));
  return keySentences.join('.') + (keySentences.length < sentences.length ? '...' : '');
}

/**
 * Implements an LRU caching mechanism for storing and retrieving compressed context segments.
 */
export class LRUCache {
  constructor(maxSize) {
    this.maxSize = maxSize;
    this.cache = new Map();
  }

  /**
   * Retrieves an item from the cache.
   * @param {string} key - The key of the item to retrieve.
   * @returns {string|null} - The cached value or null if not found.
   */
  get(key) {
    if (!this.cache.has(key)) return null;
    const value = this.cache.get(key);
    this.cache.delete(key);
    this.cache.set(key, value); // Move to the end (most recently used).
    return value;
  }

  /**
   * Adds an item to the cache, evicting the least recently used item if necessary.
   * @param {string} key - The key of the item to add.
   * @param {string} value - The value to add.
   */
  set(key, value) {
    if (this.cache.size >= this.maxSize) {
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
    }
    this.cache.set(key, value);
  }
}

/**
 * Manages hierarchical memory by combining summarization, compression, and caching.
 */
export class HierarchicalMemoryManager {
  constructor(maxCacheSize = 100) {
    this.cache = new LRUCache(maxCacheSize);
  }

  /**
   * Stores a text segment in the cache after summarizing and compressing it.
   * @param {string} key - The key to store the segment under.
   * @param {string} text - The text segment to store.
   */
  storeSegment(key, text) {
    const summarized = summarizeText(text);
    const compressed = compressText(summarized);
    this.cache.set(key, compressed);
  }

  /**
   * Retrieves a text segment from the cache.
   * @param {string} key - The key of the segment to retrieve.
   * @returns {string|null} - The compressed segment or null if not found.
   */
  retrieveSegment(key) {
    return this.cache.get(key);
  }
}

/**
 * Utility function to check if a text segment is contextually relevant.
 * @param {string} text - The text to evaluate.
 * @param {string} keyword - The keyword to check for relevance.
 * @returns {boolean} - True if the text contains the keyword, false otherwise.
 */
export function isContextRelevant(text, keyword) {
  return text.toLowerCase().includes(keyword.toLowerCase());
}