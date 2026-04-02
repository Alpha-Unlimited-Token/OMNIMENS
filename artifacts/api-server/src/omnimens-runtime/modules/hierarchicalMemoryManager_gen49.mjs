/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: hierarchicalMemoryManager
 * Written: 2026-04-02T14:14:28.165Z
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
 * Compresses a memory snapshot into a hash-based summary.
 * Useful for storing lightweight representations of large data.
 * @param {string} snapshot - The raw memory snapshot.
 * @returns {string} - A compressed hash summary.
 */
export function compressMemory(snapshot) {
  const hash = createHash('sha256');
  hash.update(snapshot);
  return hash.digest('hex');
}

/**
 * Scores memory importance based on a heuristic function.
 * Higher scores indicate more critical memories for retention.
 * @param {string} snapshot - The raw memory snapshot.
 * @returns {number} - Importance score (0 to 1).
 */
export function scoreMemoryImportance(snapshot) {
  const lengthFactor = Math.min(snapshot.length / 1000, 1); // Normalize length to 0-1 range
  const entropyFactor = calculateEntropy(snapshot) / 8; // Normalize entropy to 0-1 range
  return (lengthFactor + entropyFactor) / 2; // Weighted average
}

/**
 * Calculates Shannon entropy of a string.
 * Measures the randomness or information density of the input.
 * @param {string} input - The string to analyze.
 * @returns {number} - Shannon entropy value.
 */
export function calculateEntropy(input) {
  const frequency = {};
  for (const char of input) {
    frequency[char] = (frequency[char] || 0) + 1;
  }
  const length = input.length;
  return Object.values(frequency).reduce((entropy, count) => {
    const probability = count / length;
    return entropy - probability * Math.log2(probability);
  }, 0);
}

/**
 * Creates a hierarchical memory structure with clustering.
 * Groups related snapshots based on importance scores.
 * @param {Array<{snapshot, timestamp}>} memories - Array of memory objects.
 * @returns {Array} - Hierarchical memory clusters.
 */
export function createMemoryHierarchy(memories) {
  const sortedMemories = memories
    .map(memory => ({
      ...memory,
      importance: scoreMemoryImportance(memory.snapshot)
    }))
    .sort((a, b) => b.importance - a.importance);

  const clusters = [];
  for (const memory of sortedMemories) {
    const cluster = clusters.find(c =>
      calculateSimilarity(c.representative.snapshot, memory.snapshot) > 0.8
    );

    if (cluster) {
      cluster.memories.push(memory);
    } else {
      clusters.push({
        representative: memory,
        memories: [memory]
      });
    }
  }

  return clusters;
}

/**
 * Calculates similarity between two memory snapshots.
 * Uses Jaccard similarity on sets of words.
 * @param {string} snapshotA - First memory snapshot.
 * @param {string} snapshotB - Second memory snapshot.
 * @returns {number} - Similarity score (0 to 1).
 */
export function calculateSimilarity(snapshotA, snapshotB) {
  const setA = new Set(snapshotA.split(/\W+/));
  const setB = new Set(snapshotB.split(/\W+/));
  const intersection = new Set([...setA].filter(x => setB.has(x)));
  const union = new Set([...setA, ...setB]);
  return intersection.size / union.size;
}

/**
 * Selectively decompresses memory clusters for detailed reconstruction.
 * Retrieves the most relevant memories based on a query.
 * @param {Array} clusters - Hierarchical memory clusters.
 * @param {string} query - Query string for context reconstruction.
 * @returns {Array} - Relevant memory snapshots.
 */
export function reconstructContext(clusters, query) {
  const querySet = new Set(query.split(/\W+/));
  const scoredClusters = clusters.map(cluster => {
    const similarity = calculateSimilarity(
      cluster.representative.snapshot,
      query
    );
    return { cluster, similarity };
  });

  scoredClusters.sort((a, b) => b.similarity - a.similarity);

  return scoredClusters.slice(0, 3).flatMap(({ cluster }) => cluster.memories);
}

/**
 * Utility to add a new memory to the hierarchical memory manager.
 * Automatically updates clusters.
 * @param {Array} clusters - Existing memory clusters.
 * @param {string} snapshot - New memory snapshot.
 * @param {number} timestamp - Timestamp of the memory.
 * @returns {Array} - Updated memory clusters.
 */
export function addMemory(clusters, snapshot, timestamp) {
  const newMemory = { snapshot, timestamp, importance: scoreMemoryImportance(snapshot) };
  const similarityThreshold = 0.8;

  const cluster = clusters.find(c =>
    calculateSimilarity(c.representative.snapshot, snapshot) > similarityThreshold
  );

  if (cluster) {
    cluster.memories.push(newMemory);
  } else {
    clusters.push({
      representative: newMemory,
      memories: [newMemory]
    });
  }

  return clusters;
}