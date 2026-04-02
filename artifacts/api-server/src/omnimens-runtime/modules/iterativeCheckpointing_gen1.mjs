/**
 * OMNIMENS Self-Authored Module (Migrated from DB)
 * Original Source: evolution_cycle_14
 * Name: iterativeCheckpointing
 * Purpose: Enable long-running computations by splitting tasks into smaller segments with state preservation.
 * Description: Provides iterative computation with checkpointing using in-memory state serialization for long-running tasks.
 * Migrated: 2026-04-02T14:50:29.446Z
 */

// Complete ES module code here

import { createHash } from 'crypto';

/**
 * Utility to create a unique hash for checkpoint keys.
 * @param {string} input - The input string to hash.
 * @returns {string} - A SHA-256 hash of the input.
 */
export function createCheckpointKey(input) {
  const hash = createHash('sha256');
  hash.update(input);
  return hash.digest('hex');
}

/**
 * In-memory cache to store serialized states.
 */
const stateCache = new Map();

/**
 * Save a computation state to the cache.
 * @param {string} key - Unique identifier for the state.
 * @param {object} state - The state object to serialize and store.
 */
export function saveState(key, state) {
  if (typeof key !== 'string') {
    throw new TypeError('Key must be a string');
  }
  if (typeof state !== 'object' || state === null) {
    throw new TypeError('State must be a non-null object');
  }
  stateCache.set(key, JSON.stringify(state));
}

/**
 * Restore a computation state from the cache.
 * @param {string} key - Unique identifier for the state.
 * @returns {object|null} - The restored state object, or null if not found.
 */
export function restoreState(key) {
  if (typeof key !== 'string') {
    throw new TypeError('Key must be a string');
  }
  const serializedState = stateCache.get(key);
  return serializedState ? JSON.parse(serializedState) : null;
}

/**
 * Perform iterative computations with checkpointing.
 * @param {string} key - Unique identifier for the computation.
 * @param {function} taskFunction - The function to execute for each segment.
 * @param {object} initialState - The initial state object.
 * @param {number} iterations - Total number of iterations.
 * @returns {object} - Final state after all iterations.
 */
export function iterativeCheckpointing(key, taskFunction, initialState, iterations) {
  if (typeof key !== 'string') {
    throw new TypeError('Key must be a string');
  }
  if (typeof taskFunction !== 'function') {
    throw new TypeError('Task function must be a valid function');
  }
  if (typeof initialState !== 'object' || initialState === null) {
    throw new TypeError('Initial state must be a non-null object');
  }
  if (!Number.isInteger(iterations) || iterations <= 0) {
    throw new TypeError('Iterations must be a positive integer');
  }

  let state = restoreState(key) || initialState;

  for (let i = state.currentIteration || 0; i < iterations; i++) {
    state = taskFunction(state, i);
    state.currentIteration = i + 1;
    saveState(key, state);
  }

  return state;
}

/**
 * Clear a saved state from the cache.
 * @param {string} key - Unique identifier for the state.
 */
export function clearState(key) {
  if (typeof key !== 'string') {
    throw new TypeError('Key must be a string');
  }
  stateCache.delete(key);
}

/**
 * List all active checkpoint keys in the cache.
 * @returns {string[]} - Array of active checkpoint keys.
 */
export function listCheckpointKeys() {
  return Array.from(stateCache.keys());
}