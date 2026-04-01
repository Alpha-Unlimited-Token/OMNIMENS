/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: hierarchicalMemoryManager
 * Written: 2026-04-01T22:14:45.534Z
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
 * Generates a unique hash for a given input string.
 * Useful for indexing and identifying stored memory chunks.
 */
export function generateHash(input) {
  const hash = createHash('sha256');
  hash.update(input);
  return hash.digest('hex');
}

/**
 * Calculates a priority score for a memory chunk based on its last access time and importance.
 * Higher scores indicate higher priority for retention in primary memory.
 * @param {number} lastAccessTime - Unix timestamp of the last access.
 * @param {number} importance - A number between 0 and 1 indicating the memory's importance.
 * @returns {number} Priority score.
 */
export function calculatePriority(lastAccessTime, importance) {
  const currentTime = Date.now();
  const timeDecay = Math.exp(-(currentTime - lastAccessTime) / (1000 * 60 * 60 * 24)); // Decay over days
  return importance * timeDecay;
}

/**
 * Finds the nearest neighbors in a memory space using a simplified approximate nearest neighbor search.
 * @param {Array<{ vector, data}>} memorySpace - Array of memory objects with vectors.
 * @param {number[]} queryVector - The vector to search for.
 * @param {number} k - Number of nearest neighbors to find.
 * @returns {Array<{ vector, data, distance}>} The k nearest neighbors.
 */
export function findNearestNeighbors(memorySpace, queryVector, k) {
  return memorySpace
    .map((memory) => {
      const distance = euclideanDistance(memory.vector, queryVector);
      return { ...memory, distance };
    })
    .sort((a, b) => a.distance - b.distance)
    .slice(0, k);
}

/**
 * Calculates the Euclidean distance between two vectors.
 * @param {number[]} vectorA - First vector.
 * @param {number[]} vectorB - Second vector.
 * @returns {number} Euclidean distance.
 */
export function euclideanDistance(vectorA, vectorB) {
  if (vectorA.length !== vectorB.length) {
    throw new Error('Vectors must have the same dimensions');
  }
  return Math.sqrt(
    vectorA.reduce((sum, val, idx) => sum + Math.pow(val - vectorB[idx], 2), 0)
  );
}

/**
 * Manages hierarchical memory by compressing and offloading low-priority data.
 * @param {Array<{ vector, data, lastAccessTime, importance}>} memorySpace - The memory space.
 * @param {number} primaryMemoryLimit - Maximum size of primary memory.
 * @returns {{ primaryMemory, secondaryMemory}} Partitioned memory.
 */
export function manageMemoryHierarchy(memorySpace, primaryMemoryLimit) {
  const prioritizedMemory = memorySpace.map((memory) => ({
    ...memory,
    priority: calculatePriority(memory.lastAccessTime, memory.importance)
  }));

  prioritizedMemory.sort((a, b) => b.priority - a.priority);

  const primaryMemory = prioritizedMemory.slice(0, primaryMemoryLimit);
  const secondaryMemory = prioritizedMemory.slice(primaryMemoryLimit);

  return { primaryMemory, secondaryMemory };
}

/**
 * Updates the access time of a memory chunk.
 * @param {Array} memorySpace - The memory space.
 * @param {string} hash - Hash of the memory chunk to update.
 * @returns {Array} Updated memory space.
 */
export function updateAccessTime(memorySpace, hash) {
  return memorySpace.map((memory) => {
    if (generateHash(JSON.stringify(memory.data)) === hash) {
      return { ...memory, lastAccessTime: Date.now() };
    }
    return memory;
  });
}

/**
 * Compresses a memory chunk for secondary storage.
 * @param {any} data - The data to compress.
 * @returns {string} Compressed representation.
 */
export function compressMemory(data) {
  return JSON.stringify(data); // Placeholder for actual compression algorithm
}

/**
 * Decompresses a memory chunk from secondary storage.
 * @param {string} compressedData - The compressed data.
 * @returns {any} Decompressed data.
 */
export function decompressMemory(compressedData) {
  return JSON.parse(compressedData); // Placeholder for actual decompression algorithm
}

/**
 * Adds a new memory chunk to the memory space.
 * @param {Array} memorySpace - The memory space.
 * @param {number[]} vector - The vector representation of the memory.
 * @param {any} data - The data to store.
 * @param {number} importance - Importance of the memory (0-1).
 * @returns {Array} Updated memory space.
 */
export function addMemory(memorySpace, vector, data, importance) {
  const memoryChunk = {
    vector,
    data,
    lastAccessTime: Date.now(),
    importance
  };
  return [...memorySpace, memoryChunk];
}
