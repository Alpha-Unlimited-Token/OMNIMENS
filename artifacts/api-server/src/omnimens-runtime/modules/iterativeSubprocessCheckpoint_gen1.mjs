/**
 * OMNIMENS Self-Authored Module (Migrated from DB)
 * Original Source: evolution_cycle_11
 * Name: iterativeSubprocessCheckpoint
 * Purpose: Allows long-running computations to persist intermediate states and resume after timeout.
 * Description: Provides state serialization, periodic checkpointing, and resumption for long-running computations.
 * Migrated: 2026-04-01T22:23:20.234Z
 */

// iterativeSubprocessCheckpoint.mjs

import { serialize, deserialize } from 'v8';
import { randomUUID } from 'crypto';

const checkpoints = new Map();

/**
 * Saves the current state of computation to a checkpoint.
 * @param {string} id - Unique identifier for the checkpoint.
 * @param {object} state - Serializable computation state.
 */
export function saveCheckpoint(id, state) {
  if (typeof id !== 'string') {
    throw new TypeError('Checkpoint ID must be a string.');
  }
  if (typeof state !== 'object' || state === null) {
    throw new TypeError('State must be a non-null object.');
  }
  const serializedState = serialize(state);
  checkpoints.set(id, serializedState);
}

/**
 * Restores the computation state from a checkpoint.
 * @param {string} id - Unique identifier for the checkpoint.
 * @returns {object|null} - Deserialized computation state, or null if checkpoint does not exist.
 */
export function restoreCheckpoint(id) {
  if (typeof id !== 'string') {
    throw new TypeError('Checkpoint ID must be a string.');
  }
  const serializedState = checkpoints.get(id);
  return serializedState ? deserialize(serializedState) : null;
}

/**
 * Deletes a checkpoint by its ID.
 * @param {string} id - Unique identifier for the checkpoint.
 */
export function deleteCheckpoint(id) {
  if (typeof id !== 'string') {
    throw new TypeError('Checkpoint ID must be a string.');
  }
  checkpoints.delete(id);
}

/**
 * Creates a new checkpoint ID.
 * @returns {string} - A unique identifier for a new checkpoint.
 */
export function createCheckpointID() {
  return randomUUID();
}

/**
 * Periodically checkpoints state during long-running computations.
 * @param {function} computationFunction - Function performing the computation.
 * @param {object} initialState - Initial state for the computation.
 * @param {number} intervalMs - Time interval for checkpointing in milliseconds.
 * @returns {Promise<object>} - Final state after computation completes.
 */
export async function runWithCheckpointing(computationFunction, initialState, intervalMs) {
  if (typeof computationFunction !== 'function') {
    throw new TypeError('computationFunction must be a function.');
  }
  if (typeof initialState !== 'object' || initialState === null) {
    throw new TypeError('Initial state must be a non-null object.');
  }
  if (typeof intervalMs !== 'number' || intervalMs <= 0) {
    throw new RangeError('Interval must be a positive number.');
  }

  let currentState = { ...initialState };
  const checkpointID = createCheckpointID();

  const interval = setInterval(() => {
    saveCheckpoint(checkpointID, currentState);
  }, intervalMs);

  try {
    currentState = await computationFunction(currentState);
  } finally {
    clearInterval(interval);
    deleteCheckpoint(checkpointID);
  }

  return currentState;
}

/**
 * Lists all active checkpoint IDs.
 * @returns {string[]} - Array of active checkpoint IDs.
 */
export function listCheckpoints() {
  return Array.from(checkpoints.keys());
}