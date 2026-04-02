/**
 * OMNIMENS Self-Authored Module (Migrated from DB)
 * Original Source: evolution_cycle_40
 * Name: subprocessCheckpointing
 * Purpose: Enables long-running computations by saving and resuming subprocess states across multiple executions.
 * Description: Enables saving and resuming computation states across executions using in-memory checkpointing.
 * Migrated: 2026-04-02T14:21:19.466Z
 */

// subprocessCheckpointing.mjs

import { createHash } from 'crypto';

// In-memory store for checkpoint data
const checkpointStore = new Map();

/**
 * Generates a unique key for a checkpoint based on input data.
 * @param {string} identifier - Unique identifier for the computation.
 * @param {object} state - Current computation state.
 * @returns {string} - Unique hash key.
 */
export function generateCheckpointKey(identifier, state) {
  const hash = createHash('sha256');
  hash.update(identifier + JSON.stringify(state));
  return hash.digest('hex');
}

/**
 * Saves the current state of a computation.
 * @param {string} key - Unique key for the checkpoint.
 * @param {object} state - Current computation state.
 */
export function saveCheckpoint(key, state) {
  checkpointStore.set(key, JSON.stringify(state));
}

/**
 * Loads a saved checkpoint state.
 * @param {string} key - Unique key for the checkpoint.
 * @returns {object|null} - Restored state or null if not found.
 */
export function loadCheckpoint(key) {
  const serializedState = checkpointStore.get(key);
  return serializedState ? JSON.parse(serializedState) : null;
}

/**
 * Deletes a checkpoint from the store.
 * @param {string} key - Unique key for the checkpoint.
 */
export function deleteCheckpoint(key) {
  checkpointStore.delete(key);
}

/**
 * Runs a long computation with checkpointing support.
 * @param {string} identifier - Unique identifier for the computation.
 * @param {function} computationFunction - Function performing the computation.
 * @param {object} initialState - Initial state for the computation.
 * @returns {object} - Final computation result.
 */
export function runWithCheckpointing(identifier, computationFunction, initialState) {
  const key = generateCheckpointKey(identifier, initialState);
  let state = loadCheckpoint(key) || initialState;

  while (!state.isComplete) {
    state = computationFunction(state);
    saveCheckpoint(key, state);
  }

  deleteCheckpoint(key); // Cleanup after completion
  return state.result;
}

// Example computation function for demonstration
/**
 * Example computation function that increments a counter until a target is reached.
 * @param {object} state - Current computation state.
 * @returns {object} - Updated state.
 */
export function exampleComputationFunction(state) {
  state.counter = (state.counter || 0) + 1;
  state.isComplete = state.counter >= state.target;
  state.result = state.counter;
  return state;
}

/**
 * Utility function to list all active checkpoint keys.
 * @returns {string[]} - List of active checkpoint keys.
 */
export function listActiveCheckpoints() {
  return Array.from(checkpointStore.keys());
}