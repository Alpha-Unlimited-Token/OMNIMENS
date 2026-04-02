/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: hierarchicalMemoryManager
 * Written: 2026-04-02T14:46:03.175Z
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
 * Generates a hash for identifying raw data chunks.
 * @param {string} data - The raw data to hash.
 * @returns {string} - The SHA-256 hash of the input data.
 */
export function generateHash(data) {
  const hash = createHash('sha256');
  hash.update(data);
  return hash.digest('hex');
}

/**
 * Compresses raw data into a summary based on importance scoring.
 * @param {string} data - The raw data to compress.
 * @param {number} importanceScore - A score between 0 and 1 representing the importance.
 * @returns {string} - The compressed summary.
 */
export function compressData(data, importanceScore) {
  const maxLength = Math.ceil(importanceScore * 100); // Scale compression length by importance.
  return data.length > maxLength ? data.slice(0, maxLength) + '...' : data;
}

/**
 * Stores raw data chunks and their importance-scored summaries.
 * @param {Object} memoryStore - The memory object to update.
 * @param {string} rawData - The raw data to store.
 * @param {number} importanceScore - A score between 0 and 1 representing the importance.
 */
export function storeMemory(memoryStore, rawData, importanceScore) {
  const hash = generateHash(rawData);
  if (!memoryStore.rawChunks[hash]) {
    memoryStore.rawChunks[hash] = rawData;
  }
  memoryStore.compressedSummaries[hash] = compressData(rawData, importanceScore);
}

/**
 * Retrieves raw data or compressed summaries based on relevance.
 * @param {Object} memoryStore - The memory object to query.
 * @param {string} query - The search query.
 * @param {boolean} retrieveRaw - Whether to retrieve raw data (true) or summaries (false).
 * @returns {Array<string>} - Matching data chunks or summaries.
 */
export function retrieveMemory(memoryStore, query, retrieveRaw = false) {
  const results = [];
  const targetStore = retrieveRaw ? memoryStore.rawChunks : memoryStore.compressedSummaries;
  for (const [hash, data] of Object.entries(targetStore)) {
    if (data.includes(query)) {
      results.push(data);
    }
  }
  return results;
}

/**
 * Initializes a hierarchical memory store object.
 * @returns {Object} - A new memory store with rawChunks and compressedSummaries.
 */
export function createMemoryStore() {
  return {
    rawChunks: {},
    compressedSummaries: {}
  };
}

/**
 * Scores relevance between a query and data chunk using simple keyword matching.
 * @param {string} query - The search query.
 * @param {string} dataChunk - The data chunk to score.
 * @returns {number} - A relevance score between 0 and 1.
 */
export function scoreRelevance(query, dataChunk) {
  const queryWords = query.split(/\s+/);
  const chunkWords = dataChunk.split(/\s+/);
  const matches = queryWords.filter(word => chunkWords.includes(word));
  return matches.length / queryWords.length;
}

/**
 * Retrieves the most relevant raw data chunk for a query.
 * @param {Object} memoryStore - The memory object to query.
 * @param {string} query - The search query.
 * @returns {string|null} - The most relevant raw data chunk or null if none found.
 */
export function retrieveMostRelevant(memoryStore, query) {
  let bestMatch = null;
  let highestScore = 0;
  for (const rawData of Object.values(memoryStore.rawChunks)) {
    const relevance = scoreRelevance(query, rawData);
    if (relevance > highestScore) {
      highestScore = relevance;
      bestMatch = rawData;
    }
  }
  return bestMatch;
}

// Example usage:
// const memoryStore = createMemoryStore();
// storeMemory(memoryStore, "This is a test data chunk", 0.8);
// console.log(retrieveMemory(memoryStore, "test", false));
// console.log(retrieveMostRelevant(memoryStore, "test"));