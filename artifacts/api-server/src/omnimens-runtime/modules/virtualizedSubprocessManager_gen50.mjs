/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: virtualizedSubprocessManager
 * Written: 2026-04-02T15:17:51.699Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// virtualizedSubprocessManager.mjs

import { createHash } from 'crypto';

// In-memory cache to store persistent states across subprocess executions
const stateCache = new Map();

/**
 * Generate a unique hash key for a given identifier.
 * @param {string} identifier - The unique identifier for a subprocess.
 * @returns {string} - A hash key for the identifier.
 */
export function generateHashKey(identifier) {
  const hash = createHash('sha256');
  hash.update(identifier);
  return hash.digest('hex');
}

/**
 * Save the state of a subprocess to the in-memory cache.
 * @param {string} identifier - A unique identifier for the subprocess.
 * @param {object} state - The state object to save.
 */
export function saveState(identifier, state) {
  if (typeof identifier !== 'string' || typeof state !== 'object') {
    throw new Error('Invalid Array.from(/* args */{}): identifier must be a string and state must be an object.');
  }
  const key = generateHashKey(identifier);
  stateCache.set(key, JSON.stringify(state));
}

/**
 * Restore the state of a subprocess from the in-memory cache.
 * @param {string} identifier - A unique identifier for the subprocess.
 * @returns {object|null} - The restored state object or null if not found.
 */
export function restoreState(identifier) {
  if (typeof identifier !== 'string') {
    throw new Error('Invalid argument: identifier must be a string.');
  }
  const key = generateHashKey(identifier);
  const stateJSON = stateCache.get(key);
  return stateJSON ? JSON.parse(stateJSON) : null;
}

/**
 * Clear the state of a subprocess from the in-memory cache.
 * @param {string} identifier - A unique identifier for the subprocess.
 */
export function clearState(identifier) {
  if (typeof identifier !== 'string') {
    throw new Error('Invalid argument: identifier must be a string.');
  }
  const key = generateHashKey(identifier);
  stateCache.delete(key);
}

/**
 * List all active subprocess identifiers currently in the cache.
 * @returns {string[]} - An array of identifiers for active subprocesses.
 */
export function listActiveSubprocesses() {
  return Array.from(stateCache.keys());
}

/**
 * Check if a subprocess state exists in the cache.
 * @param {string} identifier - A unique identifier for the subprocess.
 * @returns {boolean} - True if the state exists, false otherwise.
 */
export function hasState(identifier) {
  if (typeof identifier !== 'string') {
    throw new Error('Invalid argument: identifier must be a string.');
  }
  const key = generateHashKey(identifier);
  return stateCache.has(key);
}

/**
 * Utility to merge two states (useful for iterative computations).
 * @param {object} baseState - The base state object.
 * @param {object} newState - The new state object to merge.
 * @returns {object} - A merged state object.
 */
export function mergeStates(baseState, newState) {
  if (typeof baseState !== 'object' || typeof newState !== 'object') {
    throw new Error('Invalid Array.from(/* args */{}): both baseState and newState must be objects.');
  }
  return { ...baseState, ...newState };
}
