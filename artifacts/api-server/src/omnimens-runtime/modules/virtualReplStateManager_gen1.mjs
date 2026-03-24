/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: virtualReplStateManager
 * Written: 2026-03-24T13:52:34.172Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// virtualReplStateManager.mjs

import { createHash } from 'crypto';

const memoryCache = new Map();

/**
 * Generates a unique identifier for a given task-specific context.
 * @param {string} context - The context string to generate an ID for.
 * @returns {string} - A unique hash ID.
 */
export function generateTaskId(context) {
  const hash = createHash('sha256');
  hash.update(context);
  return hash.digest('hex');
}

/**
 * Saves the execution state to the memory cache.
 * @param {string} taskId - The unique identifier for the task.
 * @param {object} state - The execution state object to save.
 * @returns {boolean} - True if saved successfully, false otherwise.
 */
export function saveState(taskId, state) {
  if (typeof taskId !== 'string' || !taskId.trim()) {
    throw new Error('Invalid taskId. Must be a non-empty string.');
  }
  if (typeof state !== 'object' || state === null) {
    throw new Error('Invalid state. Must be a non-null object.');
  }
  memoryCache.set(taskId, JSON.stringify(state));
  return true;
}

/**
 * Restores the execution state from the memory cache.
 * @param {string} taskId - The unique identifier for the task.
 * @returns {object|null} - The restored state object, or null if not found.
 */
export function restoreState(taskId) {
  if (typeof taskId !== 'string' || !taskId.trim()) {
    throw new Error('Invalid taskId. Must be a non-empty string.');
  }
  const serializedState = memoryCache.get(taskId);
  return serializedState ? JSON.parse(serializedState) : null;
}

/**
 * Clears the memory cache for a specific task ID.
 * @param {string} taskId - The unique identifier for the task.
 * @returns {boolean} - True if cleared successfully, false otherwise.
 */
export function clearState(taskId) {
  if (typeof taskId !== 'string' || !taskId.trim()) {
    throw new Error('Invalid taskId. Must be a non-empty string.');
  }
  return memoryCache.delete(taskId);
}

/**
 * Clears all memory cache entries.
 * @returns {boolean} - True if the cache was cleared successfully.
 */
export function clearAllStates() {
  memoryCache.clear();
  return true;
}

/**
 * Lists all task IDs currently stored in the memory cache.
 * @returns {string[]} - An array of task IDs.
 */
export function listTaskIds() {
  return Array.from(memoryCache.keys());
}

/**
 * Validates if a given task ID exists in the memory cache.
 * @param {string} taskId - The unique identifier for the task.
 * @returns {boolean} - True if the task ID exists, false otherwise.
 */
export function hasState(taskId) {
  if (typeof taskId !== 'string' || !taskId.trim()) {
    throw new Error('Invalid taskId. Must be a non-empty string.');
  }
  return memoryCache.has(taskId);
}