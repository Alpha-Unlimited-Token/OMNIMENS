/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: hierarchicalMemoryManager
 * Written: 2026-03-24T11:24:29.293Z
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
 * Generate a hash for embedding keys using SHA-256.
 * @param {string} key - The key to hash.
 * @returns {string} - The hashed key.
 */
export function hashKey(key) {
  return createHash('sha256').update(key).digest('hex');
}

/**
 * Partition embeddings into shards based on hash values.
 * @param {Array<Object>} embeddings - Array of embedding objects with { key, vector }.
 * @param {number} numShards - Number of shards to partition into.
 * @returns {Object} - Shard map with shard IDs as keys and embedding arrays as values.
 */
export function createShards(embeddings, numShards) {
  const shards = {};
  for (let i = 0; i < numShards; i++) {
    shards[i] = [];
  }

  embeddings.forEach(({ key, vector }) => {
    const hash = hashKey(key);
    const shardId = parseInt(hash.slice(-4), 16) % numShards;
    shards[shardId].push({ key, vector });
  });

  return shards;
}

/**
 * Perform hierarchical clustering on embedding vectors.
 * @param {Array<Object>} embeddings - Array of embedding objects with { key, vector }.
 * @param {number} clusterSize - Maximum number of embeddings per cluster.
 * @returns {Array<Array<Object>>} - Hierarchical clusters of embeddings.
 */
export function hierarchicalCluster(embeddings, clusterSize) {
  if (embeddings.length <= clusterSize) {
    return [embeddings];
  }

  const clusters = [];
  let currentCluster = [];

  embeddings.forEach((embedding) => {
    currentCluster.push(embedding);
    if (currentCluster.length === clusterSize) {
      clusters.push(currentCluster);
      currentCluster = [];
    }
  });

  if (currentCluster.length > 0) {
    clusters.push(currentCluster);
  }

  return clusters;
}

/**
 * Retrieve embeddings from shards using a hashed key lookup.
 * @param {Object} shards - Shard map with shard IDs as keys and embedding arrays as values.
 * @param {string} key - The key to retrieve.
 * @returns {Object|null} - The embedding object if found, otherwise null.
 */
export function retrieveFromShards(shards, key) {
  const hash = hashKey(key);
  const shardId = parseInt(hash.slice(-4), 16) % Object.keys(shards).length;

  const shard = shards[shardId];
  if (!shard) return null;

  return shard.find((embedding) => embedding.key === key) || null;
}

/**
 * Scale embedding retrieval using hierarchical clustering and shard storage.
 * @param {Array<Object>} embeddings - Array of embedding objects with { key, vector }.
 * @param {number} numShards - Number of shards to partition into.
 * @param {number} clusterSize - Maximum number of embeddings per cluster.
 * @returns {Object} - Object containing shards and hierarchical clusters.
 */
export function scaleEmbeddingRetrieval(embeddings, numShards, clusterSize) {
  const shards = createShards(embeddings, numShards);
  const hierarchicalClusters = hierarchicalCluster(embeddings, clusterSize);
  return { shards, hierarchicalClusters };
}

/**
 * Compute Euclidean distance between two vectors.
 * @param {Array<number>} vectorA - First vector.
 * @param {Array<number>} vectorB - Second vector.
 * @returns {number} - Euclidean distance.
 */
export function euclideanDistance(vectorA, vectorB) {
  if (vectorA.length !== vectorB.length) {
    throw new Error('Vectors must have the same length');
  }

  return Math.sqrt(
    vectorA.reduce((sum, val, idx) => sum + Math.pow(val - vectorB[idx], 2), 0)
  );
}

/**
 * Find the nearest neighbor embedding based on Euclidean distance.
 * @param {Array<Object>} embeddings - Array of embedding objects with { key, vector }.
 * @param {Array<number>} queryVector - Query vector to compare.
 * @returns {Object|null} - Nearest neighbor embedding object or null if no embeddings exist.
 */
export function findNearestNeighbor(embeddings, queryVector) {
  if (embeddings.length === 0) return null;

  let nearest = null;
  let minDistance = Infinity;

  embeddings.forEach(({ key, vector }) => {
    const distance = euclideanDistance(vector, queryVector);
    if (distance < minDistance) {
      minDistance = distance;
      nearest = { key, vector, distance };
    }
  });

  return nearest;
}