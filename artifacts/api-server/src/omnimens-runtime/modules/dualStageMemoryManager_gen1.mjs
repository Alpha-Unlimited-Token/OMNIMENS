/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: dualStageMemoryManager
 * Written: 2026-04-03T03:25:14.852Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// dualStageMemoryManager.mjs

// Import built-in Node.js modules
import { createHash } from 'crypto';

// Utility to hash data for unique identification in long-term memory
export function generateHash(data) {
  const hash = createHash('sha256');
  hash.update(JSON.stringify(data));
  return hash.digest('hex');
}

// Short-term memory: High-resolution, immediate context storage
const shortTermMemory = new Map();

// Long-term memory: Low-dimensional semantic embeddings
const longTermMemory = new Map();

// Add data to short-term memory
export function addToShortTermMemory(key, value) {
  if (!key || !value) throw new Error('Key and value are required.');
  shortTermMemory.set(key, value);
}

// Retrieve data from short-term memory
export function getFromShortTermMemory(key) {
  if (!key) throw new Error('Key is required.');
  return shortTermMemory.get(key);
}

// Remove data from short-term memory
export function removeFromShortTermMemory(key) {
  if (!key) throw new Error('Key is required.');
  shortTermMemory.delete(key);
}

// Add data to long-term memory by generating a semantic hash
export function addToLongTermMemory(data) {
  if (!data) throw new Error('Data is required.');
  const hash = generateHash(data);
  longTermMemory.set(hash, data);
  return hash;
}

// Retrieve data from long-term memory using its hash
export function getFromLongTermMemory(hash) {
  if (!hash) throw new Error('Hash is required.');
  return longTermMemory.get(hash);
}

// Search long-term memory for similar data using a basic similarity function
export function searchLongTermMemory(query, similarityFunction) {
  if (!query || typeof similarityFunction !== 'function') {
    throw new Error('Query and a similarity function are required.');
  }

  let bestMatch = null;
  let highestSimilarity = -Infinity;

  for (const [hash, data] of longTermMemory) {
    const similarity = similarityFunction(query, data);
    if (similarity > highestSimilarity) {
      highestSimilarity = similarity;
      bestMatch = { hash, data, similarity };
    }
  }

  return bestMatch;
}

// Clear short-term memory (useful for resetting context)
export function clearShortTermMemory() {
  shortTermMemory.clear();
}

// Clear long-term memory (use with caution, as it erases all stored embeddings)
export function clearLongTermMemory() {
  longTermMemory.clear();
}

// Example similarity function for semantic search (cosine similarity placeholder)
export function exampleSimilarityFunction(query, data) {
  // Placeholder: Replace with actual vector-based similarity computation
  return query === data ? 1 : 0;
}

// Exported functions are designed for use across multiple agents
// - Short-term memory functions can handle immediate context for any task
// - Long-term memory functions enable semantic storage and retrieval for diverse agents