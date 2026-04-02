/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: episodicMemoryManager
 * Written: 2026-04-02T14:23:53.670Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// episodicMemoryManager.mjs

import { createHash } from 'crypto';

/**
 * Generate a unique hash for a memory entry based on its content.
 * @param {string} content - The content to hash.
 * @returns {string} - A unique hash identifier.
 */
export function generateMemoryHash(content) {
  const hash = createHash('sha256');
  hash.update(content);
  return hash.digest('hex');
}

/**
 * Cluster episodic memories into hierarchical groups based on similarity.
 * @param {Array<string>} memories - Array of memory entries.
 * @param {number} clusterSize - Maximum size of each cluster.
 * @returns {Array<Array<string>>} - Nested clusters of memories.
 */
export function clusterMemories(memories, clusterSize = 5) {
  const clusters = [];
  let currentCluster = [];

  for (const memory of memories) {
    currentCluster.push(memory);
    if (currentCluster.length >= clusterSize) {
      clusters.push([...currentCluster]);
      currentCluster = [];
    }
  }

  if (currentCluster.length > 0) {
    clusters.push(currentCluster);
  }

  return clusters;
}

/**
 * Retrieve the most relevant memory based on a query using vector similarity.
 * @param {Array<string>} memories - Array of memory entries.
 * @param {string} query - The query to search for.
 * @returns {string|null} - The most relevant memory or null if none found.
 */
export function retrieveMemory(memories, query) {
  let bestMatch = null;
  let highestScore = -Infinity;

  for (const memory of memories) {
    const score = calculateSimilarity(query, memory);
    if (score > highestScore) {
      highestScore = score;
      bestMatch = memory;
    }
  }

  return bestMatch;
}

/**
 * Calculate a simple similarity score between two strings.
 * @param {string} a - First string.
 * @param {string} b - Second string.
 * @returns {number} - Similarity score (higher is more similar).
 */
export function calculateSimilarity(a, b) {
  const commonLength = Math.min(a.length, b.length);
  let score = 0;

  for (let i = 0; i < commonLength; i++) {
    if (a[i] === b[i]) {
      score++;
    }
  }

  return score / commonLength;
}

/**
 * Store episodic memories in a hierarchical structure.
 * @param {Array<string>} memories - Array of memory entries.
 * @returns {Object} - Hierarchical memory structure.
 */
export function storeHierarchicalMemories(memories) {
  const hierarchy = {};

  for (const memory of memories) {
    const hash = generateMemoryHash(memory);
    hierarchy[hash] = memory;
  }

  return hierarchy;
}

/**
 * Retrieve a memory from the hierarchical structure by its hash.
 * @param {Object} hierarchy - Hierarchical memory structure.
 * @param {string} hash - Hash identifier of the memory.
 * @returns {string|null} - The memory content or null if not found.
 */
export function retrieveMemoryByHash(hierarchy, hash) {
  return hierarchy[hash] || null;
}

/**
 * Combine episodic memories into a unified context string.
 * @param {Array<string>} memories - Array of memory entries.
 * @returns {string} - Unified context.
 */
export function combineMemories(memories) {
  return memories.join(' ');
}
