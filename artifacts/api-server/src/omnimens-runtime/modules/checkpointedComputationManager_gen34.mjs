/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: checkpointedComputationManager
 * Written: 2026-04-02T15:16:11.311Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// checkpointedComputationManager.mjs

import { performance } from 'node:perf_hooks';
import { createHash } from 'node:crypto';

/**
 * Saves the state of computation to memory (in a Map).
 * @param {string} taskId - Unique identifier for the task.
 * @param {object} state - The intermediate state to be saved.
 * @param {Map} checkpointStore - The in-memory store for checkpoints.
 */
export function saveCheckpoint(taskId, state, checkpointStore) {
  if (typeof taskId !== 'string' || !taskId.trim()) {
    throw new Error('taskId must be a non-empty string.');
  }
  if (typeof state !== 'object' || state === null) {
    throw new Error('state must be a non-null object.');
  }
  checkpointStore.set(taskId, JSON.stringify(state));
}

/**
 * Restores the state of computation from memory.
 * @param {string} taskId - Unique identifier for the task.
 * @param {Map} checkpointStore - The in-memory store for checkpoints.
 * @returns {object|null} - The restored state or null if not found.
 */
export function restoreCheckpoint(taskId, checkpointStore) {
  if (typeof taskId !== 'string' || !taskId.trim()) {
    throw new Error('taskId must be a non-empty string.');
  }
  const state = checkpointStore.get(taskId);
  return state ? JSON.parse(state) : null;
}

/**
 * Runs a long-running computation with periodic checkpointing.
 * @param {string} taskId - Unique identifier for the task.
 * @param {function} computeFunction - The function performing iterative computation.
 * @param {object} initialState - The initial state of the computation.
 * @param {number} timeoutMs - Maximum time (ms) before checkpointing.
 * @param {Map} checkpointStore - The in-memory store for checkpoints.
 * @returns {Promise<object>} - Resolves with the final computation state.
 */
export async function runCheckpointedComputation(taskId, computeFunction, initialState, timeoutMs, checkpointStore) {
  if (typeof computeFunction !== 'function') {
    throw new Error('computeFunction must be a valid function.');
  }
  if (typeof timeoutMs !== 'number' || timeoutMs <= 0) {
    throw new Error('timeoutMs must be a positive number.');
  }

  let state = restoreCheckpoint(taskId, checkpointStore) || initialState;
  let startTime = performance.now();

  while (!state.done) {
    state = computeFunction(state);

    if (performance.now() - startTime >= timeoutMs) {
      saveCheckpoint(taskId, state, checkpointStore);
      startTime = performance.now();
    }
  }

  checkpointStore.delete(taskId); // Clean up after completion
  return state;
}

/**
 * Generates a unique task ID based on input parameters.
 * @param {string} prefix - A prefix for the task ID.
 * @param {object} params - Parameters to hash for uniqueness.
 * @returns {string} - A unique task ID.
 */
export function generateTaskId(prefix, params) {
  if (typeof prefix !== 'string' || !prefix.trim()) {
    throw new Error('prefix must be a non-empty string.');
  }
  const hash = createHash('sha256').update(JSON.stringify(params)).digest('hex');
  return `${prefix}-${hash}`;
}

/**
 * Example computation function for testing.
 * @param {object} state - The current state of the computation.
 * @returns {object} - The updated state.
 */
export function exampleComputationFunction(state) {
  if (typeof state.counter !== 'number') {
    throw new Error('State must include a numeric counter.');
  }
  return { ...state, counter: state.counter + 1, done: state.counter >= 100 };
}

// Example usage (uncomment to test):
// const checkpointStore = new Map();
// const taskId = generateTaskId('exampleTask', { start: 0 });
// runCheckpointedComputation(taskId, exampleComputationFunction, { counter: 0, done: false }, 10000, checkpointStore)
//   .then(finalState => console.log('Final State:', finalState))
//   .catch(err => console.error(err));