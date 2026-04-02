/**
 * OMNIMENS Self-Authored Module (Migrated from DB)
 * Original Source: evolution_cycle_28
 * Name: persistentSubprocessState
 * Purpose: Maintains a persistent virtual machine state across subprocess executions to overcome timeout limitations.
 * Description: Maintains persistent computation state across subprocess executions using serialization and periodic checkpoints.
 * Migrated: 2026-04-02T15:02:53.822Z
 */

// persistentSubprocessState.mjs

import { serialize, deserialize } from 'v8';

/**
 * Creates a snapshot of the current computation state.
 * @param {Object} state - An object representing the current state.
 * @returns {Buffer} Serialized snapshot of the state.
 */
export function createSnapshot(state) {
  if (typeof state !== 'object' || state === null) {
    throw new TypeError('State must be a non-null object.');
  }
  return serialize(state);
}

/**
 * Restores a computation state from a snapshot.
 * @param {Buffer} snapshot - Serialized snapshot of the state.
 * @returns {Object} Deserialized state object.
 */
export function restoreSnapshot(snapshot) {
  if (!Buffer.isBuffer(snapshot)) {
    throw new TypeError('Snapshot must be a Buffer object.');
  }
  return deserialize(snapshot);
}

/**
 * Periodically checkpoints computation state.
 * @param {Function} stateGenerator - Function that generates the current state.
 * @param {number} intervalMs - Interval in milliseconds for checkpointing.
 * @param {Function} onCheckpoint - Callback invoked with serialized snapshot.
 */
export function checkpointState(stateGenerator, intervalMs, onCheckpoint) {
  if (typeof stateGenerator !== 'function') {
    throw new TypeError('stateGenerator must be a function.');
  }
  if (typeof intervalMs !== 'number' || intervalMs <= 0) {
    throw new RangeError('intervalMs must be a positive number.');
  }
  if (typeof onCheckpoint !== 'function') {
    throw new TypeError('onCheckpoint must be a function.');
  }

  const intervalId = setInterval(() => {
    try {
      const state = stateGenerator();
      const snapshot = createSnapshot(state);
      onCheckpoint(snapshot);
    } catch (error) {
      console.error('Error during checkpointing:', error);
    }
  }, intervalMs);

  return () => clearInterval(intervalId); // Returns a cleanup function to stop checkpointing.
}

/**
 * Utility to merge multiple states into one.
 * @param {...Object} states - Multiple state objects to merge.
 * @returns {Object} Merged state object.
 */
export function mergeStates(...states) {
  return Object.assign({}, ...states);
}

/**
 * Validates a state object against a schema.
 * @param {Object} state - State object to validate.
 * @param {Object} schema - Schema defining required keys and types.
 * @returns {boolean} True if state matches the schema, false otherwise.
 */
export function validateState(state, schema) {
  if (typeof state !== 'object' || state === null || typeof schema !== 'object' || schema === null) {
    throw new TypeError('State and schema must be non-null objects.');
  }

  return Object.entries(schema).every(([key, type]) => {
    return typeof state[key] === type;
  });
}

/**
 * Example usage:
 * const cleanup = checkpointState(() => ({ count: 42 }), 1000, snapshot => {
 *   console.log('Checkpointed state:', restoreSnapshot(snapshot));
 * });
 * // Call cleanup() to stop checkpointing.
 */