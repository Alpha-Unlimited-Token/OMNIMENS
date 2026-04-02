/**
 * OMNIMENS Self-Authored Module (Migrated from DB)
 * Original Source: evolution_cycle_9
 * Name: longTaskContinuationManager
 * Purpose: Enable complex iterative computations by checkpointing state and resuming tasks after timeout.
 * Description: Manages long-running tasks by splitting them into chunks, checkpointing state, and resuming computation iteratively.
 * Migrated: 2026-04-02T14:50:29.447Z
 */

// longTaskContinuationManager.mjs

import { setTimeout } from 'timers/promises';

/**
 * Splits a long-running task into smaller chunks and manages state for continuation.
 * @param {Function} taskFunction - The function to execute in chunks.
 * @param {Object} options - Configuration for task execution.
 * @param {number} options.chunkSize - Number of iterations per chunk.
 * @param {number} options.timeout - Timeout in milliseconds between chunks.
 * @param {Function} [onProgress] - Optional callback to report progress.
 * @returns {Promise<*>} - Resolves with the final result of the task.
 */
export async function manageLongTask(taskFunction, { chunkSize, timeout }, onProgress = null) {
  if (typeof taskFunction !== 'function') {
    throw new TypeError('taskFunction must be a function');
  }
  if (typeof chunkSize !== 'number' || chunkSize <= 0) {
    throw new RangeError('chunkSize must be a positive number');
  }
  if (typeof timeout !== 'number' || timeout < 0) {
    throw new RangeError('timeout must be a non-negative number');
  }

  let state = { completedIterations: 0, result: null };

  async function executeChunk() {
    for (let i = 0; i < chunkSize; i++) {
      state.result = await taskFunction(state);
      state.completedIterations++;
      if (onProgress) {
        onProgress(state);
      }
    }
  }

  while (true) {
    await executeChunk();
    if (state.result && state.result.done) {
      return state.result.value;
    }
    await setTimeout(timeout);
  }
}

/**
 * Example utility to create a task function for iterative computations.
 * @param {Function} computeFunction - The computation logic for each iteration.
 * @param {number} totalIterations - Total number of iterations to perform.
 * @returns {Function} - A task function compatible with manageLongTask.
 */
export function createTaskFunction(computeFunction, totalIterations) {
  if (typeof computeFunction !== 'function') {
    throw new TypeError('computeFunction must be a function');
  }
  if (typeof totalIterations !== 'number' || totalIterations <= 0) {
    throw new RangeError('totalIterations must be a positive number');
  }

  return async function taskFunction(state) {
    if (state.completedIterations >= totalIterations) {
      return { done: true, value: state.result };
    }
    state.result = computeFunction(state.completedIterations, state.result);
    return { done: false };
  };
}

/**
 * Example utility to simulate a long-running computation.
 * @param {number} iterations - Total iterations to simulate.
 * @param {number} chunkSize - Number of iterations per chunk.
 * @param {number} timeout - Timeout in milliseconds between chunks.
 * @returns {Promise<number>} - Resolves with the final computed value.
 */
export async function simulateLongComputation(iterations, chunkSize, timeout) {
  const compute = (iteration, previousResult) => (previousResult || 0) + iteration;
  const taskFunction = createTaskFunction(compute, iterations);

  return manageLongTask(taskFunction, { chunkSize, timeout }, (progress) => {
    console.log(`Progress: ${progress.completedIterations}/${iterations}`);
  });
}