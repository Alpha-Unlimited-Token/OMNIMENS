/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: hierarchicalMemoryManager
 * Written: 2026-04-02T21:25:01.962Z
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
 * Calculates a hash for a given memory segment to ensure unique identification.
 * @param {string} segment - The memory segment to hash.
 * @returns {string} - A unique hash for the segment.
 */
export function generateMemoryHash(segment) {
  const hash = createHash('sha256');
  hash.update(segment);
  return hash.digest('hex');
}

/**
 * Scores a memory segment based on importance and relevance.
 * @param {string} segment - The memory segment to score.
 * @param {number} importance - A user-defined importance value (0-1).
 * @param {number} relevance - A system-calculated relevance value (0-1).
 * @returns {number} - A combined score (0-1).
 */
export function calculateMemoryScore(segment, importance, relevance) {
  if (importance < 0 || importance > 1 || relevance < 0 || relevance > 1) {
    throw new Error('Importance and relevance must be between 0 and 1.');
  }
  return 0.6 * importance + 0.4 * relevance; // Weighted scoring formula.
}

/**
 * Selects memory segments for rehydration based on priority scores.
 * @param {Array} memoryQueue - An array of memory objects { hash, segment, score }.
 * @param {number} threshold - Minimum score required for rehydration (0-1).
 * @returns {Array} - Selected memory segments for rehydration.
 */
export function selectMemoryForRehydration(memoryQueue, threshold) {
  if (!Array.isArray(memoryQueue)) {
    throw new Error('Memory queue must be an array.');
  }
  if (threshold < 0 || threshold > 1) {
    throw new Error('Threshold must be between 0 and 1.');
  }
  return memoryQueue
    .filter(({ score }) => score >= threshold)
    .sort((a, b) => b.score - a.score) // Sort by descending score.
    .map(({ segment }) => segment); // Return only the segments.
}

/**
 * Compresses a memory segment for long-term storage.
 * @param {string} segment - The memory segment to compress.
 * @returns {string} - A compressed representation of the memory segment.
 */
export function compressMemory(segment) {
  return Buffer.from(segment, 'utf8').toString('base64'); // Simple base64 compression.
}

/**
 * Decompresses a memory segment for re-expansion.
 * @param {string} compressedSegment - The compressed memory segment.
 * @returns {string} - The original memory segment.
 */
export function decompressMemory(compressedSegment) {
  return Buffer.from(compressedSegment, 'base64').toString('utf8');
}

/**
 * Manages a hierarchical memory queue with scoring and rehydration.
 * @param {Array} memoryQueue - An array of memory objects { hash, segment, score }.
 * @param {string} newSegment - A new memory segment to add.
 * @param {number} importance - Importance score for the new segment (0-1).
 * @param {number} relevance - Relevance score for the new segment (0-1).
 * @param {number} maxQueueSize - Maximum size of the memory queue.
 * @returns {Array} - Updated memory queue.
 */
export function manageMemoryQueue(memoryQueue, newSegment, importance, relevance, maxQueueSize) {
  const hash = generateMemoryHash(newSegment);
  const score = calculateMemoryScore(newSegment, importance, relevance);

  // Add new memory segment to the queue.
  memoryQueue.push({ hash, segment: newSegment, score });

  // Sort the queue by descending score and trim to max size.
  memoryQueue.sort((a, b) => b.score - a.score);
  return memoryQueue.slice(0, maxQueueSize);
}

/**
 * Rehydrates archived memory segments based on a priority threshold.
 * @param {Array} archivedMemory - An array of compressed memory segments.
 * @param {number} threshold - Minimum score required for rehydration (0-1).
 * @param {Array} memoryQueue - An array of memory objects { hash, segment, score }.
 * @returns {Array} - Rehydrated memory segments.
 */
export function rehydrateArchivedMemory(archivedMemory, threshold, memoryQueue) {
  const selectedHashes = selectMemoryForRehydration(memoryQueue, threshold).map(segment => generateMemoryHash(segment));
  return archivedMemory
    .filter(({ hash }) => selectedHashes.includes(hash))
    .map(({ compressedSegment }) => decompressMemory(compressedSegment));
}
