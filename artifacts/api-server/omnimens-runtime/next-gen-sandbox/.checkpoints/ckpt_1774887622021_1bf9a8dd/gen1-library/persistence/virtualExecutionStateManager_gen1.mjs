/**
 * OMNIMENS Self-Authored Module (Migrated from DB)
 * Original Source: evolution_cycle_1
 * Name: virtualExecutionStateManager
 * Purpose: Preserves and restores execution states across subprocess calls to enable iterative computations.
 * Description: Preserves and restores execution states across subprocess calls using serialization and in-memory storage.
 * Migrated: 2026-03-25T22:49:34.111Z
 */

// virtualExecutionStateManager.mjs

import { serialize, deserialize } from 'v8';
import { createHash, randomBytes } from 'crypto';

// In-memory storage for execution states
const executionStateStore = new Map();

/**
 * Generates a unique identifier for storing/retrieving execution states.
 * @returns {string} A unique identifier.
 */
export function generateStateId() {
  const randomData = randomBytes(16).toString('hex');
  const timestamp = Date.now().toString();
  return createHash('sha256').update(randomData + timestamp).digest('hex');
}

/**
 * Serializes a JavaScript object or execution context into binary format.
 * @param {object} state - The object or context to serialize.
 * @returns {Buffer} Serialized binary data.
 */
export function serializeState(state) {
  try {
    return serialize(state);
  } catch (error) {
    throw new Error(`Failed to serialize state: ${error.message}`);
  }
}

/**
 * Deserializes binary data back into a JavaScript object or execution context.
 * @param {Buffer} binaryData - Serialized binary data.
 * @returns {object} Deserialized object or context.
 */
export function deserializeState(binaryData) {
  try {
    return deserialize(binaryData);
  } catch (error) {
    throw new Error(`Failed to deserialize state: ${error.message}`);
  }
}

/**
 * Saves a serialized execution state into memory.
 * @param {string} stateId - Unique identifier for the state.
 * @param {Buffer} serializedState - Serialized binary data.
 */
export function saveExecutionState(stateId, serializedState) {
  if (!stateId || !serializedState) {
    throw new Error('State ID and serialized state are required.');
  }
  executionStateStore.set(stateId, serializedState);
}

/**
 * Retrieves and deserializes an execution state from memory.
 * @param {string} stateId - Unique identifier for the state.
 * @returns {object|null} Deserialized execution state or null if not found.
 */
export function restoreExecutionState(stateId) {
  if (!stateId) {
    throw new Error('State ID is required.');
  }
  const serializedState = executionStateStore.get(stateId);
  if (!serializedState) {
    return null;
  }
  return deserializeState(serializedState);
}

/**
 * Deletes an execution state from memory.
 * @param {string} stateId - Unique identifier for the state.
 */
export function deleteExecutionState(stateId) {
  if (!stateId) {
    throw new Error('State ID is required.');
  }
  executionStateStore.delete(stateId);
}

/**
 * Clears all stored execution states from memory.
 */
export function clearAllStates() {
  executionStateStore.clear();
}

/**
 * Lists all stored state IDs.
 * @returns {string[]} Array of stored state IDs.
 */
export function listStateIds() {
  return Array.from(executionStateStore.keys());
}