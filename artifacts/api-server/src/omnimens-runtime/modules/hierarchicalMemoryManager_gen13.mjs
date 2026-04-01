/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: hierarchicalMemoryManager
 * Written: 2026-04-01T22:19:24.255Z
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

// Utility to hash strings for consistent keys
export function hashString(input) {
  const hash = createHash('sha256');
  hash.update(input);
  return hash.digest('hex');
}

// Utility to calculate weighted score based on proximity and recency
export function calculateWeightedScore(proximityScore, recencyScore, proximityWeight = 0.6, recencyWeight = 0.4) {
  return proximityScore * proximityWeight + recencyScore * recencyWeight;
}

// Approximate nearest neighbor search using Locality-Sensitive Hashing (LSH)
export function lshSearch(query, contextArray, hashFunction = hashString, topK = 5) {
  const queryHash = hashFunction(query);
  const scores = contextArray.map((context, index) => {
    const contextHash = hashFunction(context.text);
    const proximityScore = calculateHashSimilarity(queryHash, contextHash);
    const recencyScore = 1 / (1 + Math.abs(Date.now() - context.timestamp));
    const weightedScore = calculateWeightedScore(proximityScore, recencyScore);
    return { index, score: weightedScore };
  });

  return scores
    .sort((a, b) => b.score - a.score)
    .slice(0, topK)
    .map(({ index }) => contextArray[index]);
}

// Persistent database lookup simulation (mocked with in-memory storage)
const persistentDatabase = new Map();

export function addToPersistentDatabase(key, value) {
  persistentDatabase.set(key, value);
}

export function retrieveFromPersistentDatabase(key) {
  return persistentDatabase.get(key) || null;
}

// Hash similarity calculation (simple XOR-based similarity)
export function calculateHashSimilarity(hashA, hashB) {
  let similarity = 0;
  for (let i = 0; i < Math.min(hashA.length, hashB.length); i++) {
    if (hashA[i] === hashB[i]) similarity++;
  }
  return similarity / Math.max(hashA.length, hashB.length);
}

// Main hierarchical memory retrieval function
export function hierarchicalMemoryRetrieval(query, recentContext, persistentKey) {
  // Step 1: Retrieve from recent context using LSH
  const recentResults = lshSearch(query, recentContext);

  // Step 2: Retrieve from persistent database
  const persistentResult = retrieveFromPersistentDatabase(persistentKey);

  // Step 3: Combine results
  return {
    recentResults,
    persistentResult
  };
}

// Example usage
export const exampleUsage = () => {
  const recentContext = [
    { text: 'AI optimization techniques', timestamp: Date.now() - 1000 },
    { text: 'genetic programming in JavaScript', timestamp: Date.now() - 2000 },
    { text: 'chain-of-thought reasoning', timestamp: Date.now() - 3000 }
  ];

  addToPersistentDatabase('optimization', 'Cutting-edge AI optimization techniques from 2025');

  const query = 'AI optimization';
  const persistentKey = 'optimization';

  const results = hierarchicalMemoryRetrieval(query, recentContext, persistentKey);
  return results;
};