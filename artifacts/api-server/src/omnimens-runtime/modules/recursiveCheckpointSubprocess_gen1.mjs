/**
 * OMNIMENS Self-Authored Module (Migrated from DB)
 * Original Source: evolution_cycle_18
 * Name: recursiveCheckpointSubprocess
 * Purpose: Allows iterative computation by saving and resuming intermediate states in subprocesses.
 * Description: Provides recursive computation with checkpointing, enabling state saving and resumption for iterative tasks.
 * Migrated: 2026-04-02T14:08:14.880Z
 */

// recursiveCheckpointSubprocess.mjs

import { createHash } from 'crypto';

const stateStore = new Map();

/**
 * Saves a checkpoint of the current state.
 * @param {string} id - Unique identifier for the state.
 * @param {object} state - The state to save.
 */
export function saveCheckpoint(id, state) {
  if (typeof id !== 'string' || !id.trim()) {
    throw new Error('Checkpoint ID must be a non-empty string.');
  }
  const hash = createHash('sha256').update(id).digest('hex');
  stateStore.set(hash, JSON.stringify(state));
}

/**
 * Restores a previously saved state.
 * @param {string} id - Unique identifier for the state.
 * @returns {object|null} - The restored state or null if not found.
 */
export function restoreCheckpoint(id) {
  if (typeof id !== 'string' || !id.trim()) {
    throw new Error('Checkpoint ID must be a non-empty string.');
  }
  const hash = createHash('sha256').update(id).digest('hex');
  const state = stateStore.get(hash);
  return state ? JSON.parse(state) : null;
}

/**
 * Executes a recursive task with checkpointing.
 * @param {function} taskFunction - The main task function to execute.
 * @param {object} initialState - Initial state for the task.
 * @param {string} checkpointId - Unique ID for saving/restoring state.
 * @returns {Promise} - Resolves with the final result of the task.
 */
export async function recursiveTaskWithCheckpoint(taskFunction, initialState, checkpointId) {
  if (typeof taskFunction !== 'function') {
    throw new Error('taskFunction must be a function.');
  }
  if (typeof checkpointId !== 'string' || !checkpointId.trim()) {
    throw new Error('checkpointId must be a non-empty string.');
  }

  let state = restoreCheckpoint(checkpointId) || initialState;

  async function recursiveStep(currentState) {
    const { done, nextState, result } = await taskFunction(currentState);

    if (done) {
      return result;
    }

    saveCheckpoint(checkpointId, nextState);
    return recursiveStep(nextState);
  }

  return recursiveStep(state);
}

/**
 * Utility to create a simple asynchronous task function for testing.
 * @param {function} iterationLogic - Logic for each iteration.
 * @returns {function} - A task function compatible with recursiveTaskWithCheckpoint.
 */
export function createTaskFunction(iterationLogic) {
  if (typeof iterationLogic !== 'function') {
    throw new Error('iterationLogic must be a function.');
  }

  return async function taskFunction(state) {
    const { done, nextState, result } = iterationLogic(state);
    return { done, nextState, result };
  };
}

/**
 * Clears all saved checkpoints. Use cautiously.
 */
export function clearAllCheckpoints() {
  stateStore.clear();
}

/**
 * Lists all saved checkpoint IDs.
 * @returns {string[]} - Array of checkpoint IDs.
 */
export function listCheckpoints() {
  return Array.from(stateStore.keys());
}
