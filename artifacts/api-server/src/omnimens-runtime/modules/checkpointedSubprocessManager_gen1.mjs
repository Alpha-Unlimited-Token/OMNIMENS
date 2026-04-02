/**
 * OMNIMENS Self-Authored Module (Migrated from DB)
 * Original Source: evolution_cycle_5
 * Name: checkpointedSubprocessManager
 * Purpose: Allows iterative computations across multiple subprocess executions by saving and restoring intermediate states.
 * Description: Manages iterative computations with checkpointing, allowing state saving/restoration for subprocesses in Node.js.
 * Migrated: 2026-04-02T00:45:21.085Z
 */

// checkpointedSubprocessManager.mjs

import { createHash } from 'crypto';

/**
 * Serializes an object to a JSON string and computes a unique hash for checkpointing.
 * @param {object} state - The computation state to serialize.
 * @returns {object} - An object containing the serialized state and its hash.
 */
export function serializeState(state) {
  if (typeof state !== 'object' || state === null) {
    throw new TypeError('State must be a non-null object');
  }
  const serialized = JSON.stringify(state);
  const hash = createHash('sha256').update(serialized).digest('hex');
  return { serialized, hash };
}

/**
 * Deserializes a JSON string back into an object.
 * @param {string} serializedState - The JSON string representing the state.
 * @returns {object} - The deserialized state object.
 */
export function deserializeState(serializedState) {
  if (typeof serializedState !== 'string') {
    throw new TypeError('Serialized state must be a string');
  }
  return JSON.parse(serializedState);
}

/**
 * Restores a computation state from a checkpoint.
 * @param {object} checkpoints - A map of hashes to serialized states.
 * @param {string} hash - The hash of the desired checkpoint.
 * @returns {object|null} - The restored state object, or null if not found.
 */
export function restoreCheckpoint(checkpoints, hash) {
  if (typeof checkpoints !== 'object' || checkpoints === null) {
    throw new TypeError('Checkpoints must be a non-null object');
  }
  if (typeof hash !== 'string') {
    throw new TypeError('Hash must be a string');
  }
  return checkpoints[hash] ? deserializeState(checkpoints[hash]) : null;
}

/**
 * Saves a computation state to the checkpoint map.
 * @param {object} checkpoints - A map of hashes to serialized states.
 * @param {object} state - The computation state to save.
 * @returns {string} - The hash of the saved checkpoint.
 */
export function saveCheckpoint(checkpoints, state) {
  if (typeof checkpoints !== 'object' || checkpoints === null) {
    throw new TypeError('Checkpoints must be a non-null object');
  }
  const { serialized, hash } = serializeState(state);
  checkpoints[hash] = serialized;
  return hash;
}

/**
 * Iteratively processes a task with checkpointing support.
 * @param {function} taskFunction - A function that performs a single iteration of the task.
 * @param {object} initialState - The initial state for the computation.
 * @param {object} checkpoints - A map of hashes to serialized states for checkpointing.
 * @param {number} iterations - The number of iterations to perform.
 * @returns {object} - The final state after all iterations.
 */
export function iterativeComputation(taskFunction, initialState, checkpoints, iterations) {
  if (typeof taskFunction !== 'function') {
    throw new TypeError('Task function must be a function');
  }
  if (typeof initialState !== 'object' || initialState === null) {
    throw new TypeError('Initial state must be a non-null object');
  }
  if (typeof checkpoints !== 'object' || checkpoints === null) {
    throw new TypeError('Checkpoints must be a non-null object');
  }
  if (typeof iterations !== 'number' || iterations <= 0 || !Number.isInteger(iterations)) {
    throw new TypeError('Iterations must be a positive integer');
  }

  let currentState = initialState;
  for (let i = 0; i < iterations; i++) {
    const hash = saveCheckpoint(checkpoints, currentState);
    const restoredState = restoreCheckpoint(checkpoints, hash);
    if (restoredState) {
      currentState = restoredState;
    } else {
      currentState = taskFunction(currentState, i);
      saveCheckpoint(checkpoints, currentState);
    }
  }
  return currentState;
}

/**
 * Utility function to generate a deep clone of an object.
 * @param {object} obj - The object to clone.
 * @returns {object} - A deep clone of the input object.
 */
export function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}