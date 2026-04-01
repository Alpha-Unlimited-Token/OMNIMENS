/**
 * OMNIMENS Self-Authored Module (Migrated from DB)
 * Original Source: evolution_cycle_38
 * Name: asyncSubprocessScheduler
 * Purpose: Handles iterative computations by chaining asynchronous subprocess tasks.
 * Description: Handles iterative computations by chaining asynchronous tasks with state persistence, supporting task decomposition and chunked processing.
 * Migrated: 2026-04-01T22:23:20.242Z
 */

// asyncSubprocessScheduler.mjs

import { setImmediate } from 'timers/promises';

/**
 * Executes a series of asynchronous tasks in a controlled, iterative manner.
 * Each task can persist state and chain the next task dynamically.
 */

export async function asyncSubprocessScheduler(taskArray, initialState = {}) {
  if (!Array.isArray(taskArray) || taskArray.some(task => typeof task !== 'function')) {
    throw new TypeError('taskArray must be an array of functions returning Promises.');
  }

  let state = { ...initialState };

  for (let i = 0; i < taskArray.length; i++) {
    const task = taskArray[i];

    try {
      // Execute the task and allow it to modify state
      state = await task(state);
    } catch (error) {
      // Handle individual task errors without stopping the entire chain
      state.error = error;
      break;
    }

    // Yield control to avoid blocking the event loop
    await setImmediate();
  }

  return state;
}

/**
 * Utility function to create a task that performs a computation and updates state.
 * @param {Function} computationFunction - A pure function that takes state and returns updated state.
 * @returns {Function} - An async task function for the scheduler.
 */
export function createAsyncTask(computationFunction) {
  if (typeof computationFunction !== 'function') {
    throw new TypeError('computationFunction must be a function.');
  }

  return async function task(state) {
    return computationFunction(state);
  };
}

/**
 * Example utility: Splits a large array into chunks and processes them iteratively.
 * @param {Array} dataArray - The array to process.
 * @param {Function} chunkProcessor - A function to process each chunk.
 * @param {number} chunkSize - Size of each chunk.
 * @returns {Array} - Processed results.
 */
export async function processInChunks(dataArray, chunkProcessor, chunkSize = 10) {
  if (!Array.isArray(dataArray)) {
    throw new TypeError('dataArray must be an array.');
  }
  if (typeof chunkProcessor !== 'function') {
    throw new TypeError('chunkProcessor must be a function.');
  }
  if (typeof chunkSize !== 'number' || chunkSize <= 0) {
    throw new RangeError('chunkSize must be a positive number.');
  }

  const results = [];

  for (let i = 0; i < dataArray.length; i += chunkSize) {
    const chunk = dataArray.slice(i, i + chunkSize);

    try {
      const processedChunk = await chunkProcessor(chunk);
      results.push(...processedChunk);
    } catch (error) {
      results.push({ error: error.message, chunk });
    }

    // Yield control to avoid blocking the event loop
    await setImmediate();
  }

  return results;
}

/**
 * Example task: Adds a number to all elements in an array and updates state.
 * @param {number} increment - The number to add.
 * @returns {Function} - A task function for asyncSubprocessScheduler.
 */
export function createIncrementTask(increment) {
  return createAsyncTask(state => {
    if (!Array.isArray(state.data)) {
      throw new TypeError('State must have a data property as an array.');
    }

    return {
      ...state,
      data: state.data.map(num => num + increment)
    };
  });
}
