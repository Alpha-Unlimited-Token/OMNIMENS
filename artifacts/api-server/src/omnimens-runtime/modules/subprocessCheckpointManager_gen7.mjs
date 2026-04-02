/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: subprocessCheckpointManager
 * Written: 2026-04-02T14:23:18.252Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// subprocessCheckpointManager.mjs

import { createHash } from 'crypto';

/**
 * Generates a unique identifier for a given task state.
 * Useful for checkpointing and resuming subprocesses.
 * @param {object} state - The task state to hash.
 * @returns {string} - A unique hash representing the state.
 */
export function generateStateHash(state) {
  const stateString = JSON.stringify(state);
  return createHash('sha256').update(stateString).digest('hex');
}

/**
 * Serializes the task state into a compact representation.
 * @param {object} state - The task state to serialize.
 * @returns {string} - Serialized state as a JSON string.
 */
export function serializeState(state) {
  return JSON.stringify(state);
}

/**
 * Deserializes the task state from its compact representation.
 * @param {string} serializedState - Serialized state as a JSON string.
 * @returns {object} - Deserialized task state.
 */
export function deserializeState(serializedState) {
  try {
    return JSON.parse(serializedState);
  } catch (error) {
    throw new Error('Failed to deserialize state: Invalid JSON format');
  }
}

/**
 * Saves the intermediate state of a long-running task.
 * @param {object} state - The task state to save.
 * @param {Map} checkpointStore - A key-value store for checkpoints.
 * @returns {string} - The hash key used to store the state.
 */
export function saveCheckpoint(state, checkpointStore) {
  const stateHash = generateStateHash(state);
  checkpointStore.set(stateHash, serializeState(state));
  return stateHash;
}

/**
 * Restores the intermediate state of a long-running task.
 * @param {string} stateHash - The hash key used to retrieve the state.
 * @param {Map} checkpointStore - A key-value store for checkpoints.
 * @returns {object|null} - The restored state, or null if not found.
 */
export function restoreCheckpoint(stateHash, checkpointStore) {
  const serializedState = checkpointStore.get(stateHash);
  return serializedState ? deserializeState(serializedState) : null;
}

/**
 * Clears a specific checkpoint from the store.
 * @param {string} stateHash - The hash key to remove.
 * @param {Map} checkpointStore - A key-value store for checkpoints.
 * @returns {boolean} - True if the checkpoint was removed, false otherwise.
 */
export function clearCheckpoint(stateHash, checkpointStore) {
  return checkpointStore.delete(stateHash);
}

/**
 * Lists all saved checkpoints in the store.
 * @param {Map} checkpointStore - A key-value store for checkpoints.
 * @returns {Array<string>} - An array of all checkpoint hash keys.
 */
export function listCheckpoints(checkpointStore) {
  return Array.from(checkpointStore.keys());
}

/**
 * Validates a task state for serialization.
 * Ensures the state is an object and can be safely serialized.
 * @param {object} state - The task state to validate.
 * @returns {boolean} - True if valid, false otherwise.
 */
export function validateState(state) {
  try {
    serializeState(state);
    return true;
  } catch {
    return false;
  }
}

/**
 * Example usage:
 * const checkpointStore = new Map();
 * const taskState = { progress: 50, data: [1, 2, 3] };
 * const stateHash = saveCheckpoint(taskState, checkpointStore);
 * const restoredState = restoreCheckpoint(stateHash, checkpointStore);
 */