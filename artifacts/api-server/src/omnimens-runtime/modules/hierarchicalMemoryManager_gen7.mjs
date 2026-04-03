/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: hierarchicalMemoryManager
 * Written: 2026-04-03T14:49:34.961Z
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
 * Generates a unique hash for a given context string.
 * @param {string} context - The context string to hash.
 * @returns {string} - A unique hash representing the context.
 */
export function generateContextHash(context) {
  const hash = createHash('sha256');
  hash.update(context);
  return hash.digest('hex');
}

/**
 * Calculates an importance score for a given context.
 * @param {string} context - The context string to evaluate.
 * @param {number} ageInSeconds - The age of the context in seconds.
 * @returns {number} - The importance score (higher is more important).
 */
export function calculateImportanceScore(context, ageInSeconds) {
  const baseImportance = Math.min(context.length, 100); // Cap importance based on length
  const decayFactor = 0.99; // Exponential decay factor
  return baseImportance * Math.pow(decayFactor, ageInSeconds);
}

/**
 * Compresses a context string for storage.
 * @param {string} context - The context string to compress.
 * @returns {string} - A compressed representation of the context.
 */
export function compressContext(context) {
  return Buffer.from(context).toString('base64');
}

/**
 * Rehydrates a compressed context string back to its original form.
 * @param {string} compressedContext - The compressed context string.
 * @returns {string} - The original context string.
 */
export function rehydrateContext(compressedContext) {
  return Buffer.from(compressedContext, 'base64').toString('utf-8');
}

/**
 * Manages a hierarchical memory structure with importance scoring and temporal decay.
 */
export const hierarchicalMemoryManager = {
  memory: new Map(), // Stores context hashes and their metadata

  /**
   * Adds a context to the memory with metadata.
   * @param {string} context - The context string to add.
   * @param {number} timestamp - The timestamp when the context was created (in seconds).
   */
  addContext(context, timestamp) {
    const hash = generateContextHash(context);
    const compressedContext = compressContext(context);
    this.memory.set(hash, {
      compressedContext,
      timestamp,
      importance: calculateImportanceScore(context, 0)
    });
  },

  /**
   * Updates importance scores for all stored contexts based on current time.
   * @param {number} currentTimestamp - The current timestamp (in seconds).
   */
  updateImportanceScores(currentTimestamp) {
    for (const [hash, metadata] of this.memory.entries()) {
      const ageInSeconds = currentTimestamp - metadata.timestamp;
      metadata.importance = calculateImportanceScore(
        rehydrateContext(metadata.compressedContext),
        ageInSeconds
      );
    }
  },

  /**
   * Retrieves the most important contexts up to a specified limit.
   * @param {number} limit - The maximum number of contexts to retrieve.
   * @returns {Array<{context, importance}>} - An array of contexts and their importance scores.
   */
  getTopContexts(limit) {
    const contexts = Array.from(this.memory.entries())
      .map(([hash, metadata]) => ({
        context: rehydrateContext(metadata.compressedContext),
        importance: metadata.importance
      }))
      .sort((a, b) => b.importance - a.importance)
      .slice(0, limit);

    return contexts;
  },

  /**
   * Removes the least important contexts to free up space.
   * @param {number} retainCount - The number of most important contexts to retain.
   */
  pruneMemory(retainCount) {
    const sortedEntries = Array.from(this.memory.entries())
      .sort(([, a], [, b]) => b.importance - a.importance);

    this.memory = new Map(sortedEntries.slice(0, retainCount));
  }
};