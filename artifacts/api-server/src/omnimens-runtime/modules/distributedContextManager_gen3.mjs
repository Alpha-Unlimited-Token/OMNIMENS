/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: distributedContextManager
 * Written: 2026-04-03T06:07:47.125Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// distributedContextManager.mjs

import { createHash } from 'crypto';

/**
 * Generate a hash-based shard key for efficient distribution.
 * @param {string} input - The input string to hash.
 * @returns {string} - A hashed shard key.
 */
export function generateShardKey(input) {
  const hash = createHash('sha256');
  hash.update(input);
  return hash.digest('hex').slice(0, 8); // Return first 8 characters for shard key.
}

/**
 * Compute cosine similarity between two vectors.
 * @param {number[]} vectorA - First vector.
 * @param {number[]} vectorB - Second vector.
 * @returns {number} - Cosine similarity value.
 */
export function cosineSimilarity(vectorA, vectorB) {
  if (vectorA.length !== vectorB.length) {
    throw new Error('Vectors must be of the same length');
  }
  const dotProduct = vectorA.reduce((sum, val, idx) => sum + val * vectorB[idx], 0);
  const magnitudeA = Math.sqrt(vectorA.reduce((sum, val) => sum + val ** 2, 0));
  const magnitudeB = Math.sqrt(vectorB.reduce((sum, val) => sum + val ** 2, 0));
  return magnitudeA && magnitudeB ? dotProduct / (magnitudeA * magnitudeB) : 0;
}

/**
 * Perform locality-sensitive hashing (LSH) for fast similarity search.
 * @param {number[]} vector - Input vector.
 * @param {number} numHashes - Number of hash functions to apply.
 * @returns {string[]} - Array of hash keys.
 */
export function lsh(vector, numHashes = 4) {
  const hashes = [];
  for (let i = 0; i < numHashes; i++) {
    const hash = createHash('sha256');
    hash.update(vector.map((v) => v + i).join(','));
    hashes.push(hash.digest('hex').slice(0, 8));
  }
  return hashes;
}

/**
 * Distribute context fragments across shards.
 * @param {Object[]} contexts - Array of context objects with { id, data }.
 * @returns {Map<string, Object[]>} - Sharded context map.
 */
export function distributeContexts(contexts) {
  const shards = new Map();
  for (const context of contexts) {
    const shardKey = generateShardKey(context.id);
    if (!shards.has(shardKey)) {
      shards.set(shardKey, []);
    }
    shards.get(shardKey).push(context);
  }
  return shards;
}

/**
 * Retrieve the most relevant context fragment based on similarity.
 * @param {Map<string, Object[]>} shards - Sharded context map.
 * @param {number[]} queryVector - Query vector for similarity search.
 * @returns {Object|null} - Most relevant context fragment or null if none found.
 */
export function retrieveRelevantContext(shards, queryVector) {
  let bestMatch = null;
  let highestSimilarity = -Infinity;

  for (const shard of shards.values()) {
    for (const context of shard) {
      const similarity = cosineSimilarity(queryVector, context.vector);
      if (similarity > highestSimilarity) {
        highestSimilarity = similarity;
        bestMatch = context;
      }
    }
  }

  return bestMatch;
}

/**
 * Example usage to demonstrate functionality.
 */
export function exampleUsage() {
  const contexts = [
    { id: 'doc1', vector: [0.1, 0.2, 0.3], data: 'Document 1' },
    { id: 'doc2', vector: [0.4, 0.5, 0.6], data: 'Document 2' },
    { id: 'doc3', vector: [0.7, 0.8, 0.9], data: 'Document 3' }
  ];

  const shards = distributeContexts(contexts);
  const queryVector = [0.4, 0.5, 0.6];
  const result = retrieveRelevantContext(shards, queryVector);

  return result;
}