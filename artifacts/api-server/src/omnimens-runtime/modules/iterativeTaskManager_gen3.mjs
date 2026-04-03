/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: iterativeTaskManager
 * Written: 2026-04-03T02:41:36.783Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// iterativeTaskManager.mjs

import { setTimeout } from 'timers/promises';

/**
 * Splits a long-running computation into smaller tasks and manages their execution.
 * @param {Function} taskFunction - The main task function to execute. Must accept (state, context) and return updated state.
 * @param {Object} initialState - The initial state for the task.
 * @param {Object} context - Immutable context shared across all iterations.
 * @param {number} timeoutMs - Maximum allowed time per iteration in milliseconds (default: 10000ms).
 * @returns {Promise<Object>} - Resolves with the final state after all iterations.
 */
export async function iterativeTaskManager(taskFunction, initialState, context, timeoutMs = 10000) {
  if (typeof taskFunction !== 'function') {
    throw new TypeError('taskFunction must be a function');
  }
  if (typeof initialState !== 'object' || initialState === null) {
    throw new TypeError('initialState must be a non-null object');
  }
  if (typeof context !== 'object' || context === null) {
    throw new TypeError('context must be a non-null object');
  }
  if (typeof timeoutMs !== 'number' || timeoutMs <= 0) {
    throw new RangeError('timeoutMs must be a positive number');
  }

  let state = initialState;
  let isComplete = false;

  while (!isComplete) {
    const startTime = Date.now();

    // Execute the task function with the current state and context
    const result = await taskFunction(state, context);

    if (!result || typeof result !== 'object') {
      throw new Error('taskFunction must return an object with { state, isComplete }');
    }

    // Update state and completion status
    state = result.state;
    isComplete = result.isComplete;

    // Check if the iteration exceeded the timeout
    const elapsedTime = Date.now() - startTime;
    if (elapsedTime < timeoutMs && !isComplete) {
      await setTimeout(timeoutMs - elapsedTime);
    }
  }

  return state;
}

/**
 * Utility function to chunk an array into smaller pieces.
 * @param {Array} array - The array to chunk.
 * @param {number} size - The maximum size of each chunk.
 * @returns {Array[]} - An array of chunks.
 */
export function chunkArray(array, size) {
  if (!Array.isArray(array)) {
    throw new TypeError('array must be an array');
  }
  if (typeof size !== 'number' || size <= 0) {
    throw new RangeError('size must be a positive number');
  }

  const chunks = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

/**
 * Utility function to simulate a long-running computation for testing purposes.
 * @param {Object} state - The current state of the computation.
 * @param {Object} context - Immutable context shared across iterations.
 * @returns {Promise<Object>} - Resolves with updated state and completion status.
 */
export async function exampleTaskFunction(state, context) {
  const { data, currentIndex } = state;
  const { chunkSize } = context;

  const nextIndex = Math.min(currentIndex + chunkSize, data.length);
  const chunk = data.slice(currentIndex, nextIndex);

  // Simulate processing delay
  await setTimeout(100);

  // Example processing: Sum the chunk
  const partialSum = chunk.reduce((sum, num) => sum + num, 0);

  return {
    state: {
      ...state,
      currentIndex: nextIndex,
      result: (state.result || 0) + partialSum
    },
    isComplete: nextIndex >= data.length
  };
}

// Example usage (commented out for module safety)
// (async () => {
//   const initialState = { data: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], currentIndex: 0, result: 0 };
//   const context = { chunkSize: 3 };
//   const finalState = await iterativeTaskManager(exampleTaskFunction, initialState, context);
//   console.log(finalState.result); // Should output the sum of the array
// })();