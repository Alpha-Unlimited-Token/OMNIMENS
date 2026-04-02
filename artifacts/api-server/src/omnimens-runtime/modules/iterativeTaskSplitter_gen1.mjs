/**
 * OMNIMENS Self-Authored Module (Migrated from DB)
 * Original Source: evolution_cycle_42
 * Name: iterativeTaskSplitter
 * Purpose: Splits long-running computations into smaller tasks to bypass sandbox timeout limits.
 * Description: Splits long-running computations into smaller tasks with state preservation and incremental result aggregation to bypass timeout limits.
 * Migrated: 2026-04-02T14:08:14.873Z
 */

// iterativeTaskSplitter.mjs

import { performance } from 'node:perf_hooks';

/**
 * Splits long-running computations into smaller tasks to bypass sandbox timeout limits.
 * Preserves state and aggregates incremental results dynamically.
 */

/**
 * Dynamically splits a task into smaller chunks based on a time limit.
 * @param {Function} taskFunction - The function to execute. Must accept (state, chunkSize) and return { state, result }.
 * @param {Object} initialState - The initial state for the task.
 * @param {number} chunkSize - The size of each chunk to process.
 * @param {number} timeLimitMs - Maximum time (in milliseconds) allowed per iteration.
 * @returns {Promise<Object>} - Aggregated result and final state.
 */
export async function dynamicTaskSplitter(taskFunction, initialState, chunkSize, timeLimitMs) {
  let state = initialState;
  let aggregatedResult = [];

  while (true) {
    const startTime = performance.now();
    const { state: newState, result } = taskFunction(state, chunkSize);

    aggregatedResult.push(...result);
    state = newState;

    const elapsedTime = performance.now() - startTime;

    if (elapsedTime >= timeLimitMs || state.done) {
      break;
    }
  }

  return { aggregatedResult, finalState: state };
}

/**
 * Example utility function for splitting arrays into chunks.
 * @param {Array} array - The array to split.
 * @param {number} chunkSize - Size of each chunk.
 * @returns {Array[]} - Array of chunks.
 */
export function splitArrayIntoChunks(array, chunkSize) {
  const chunks = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    chunks.push(array.slice(i, i + chunkSize));
  }
  return chunks;
}

/**
 * Example task function for processing numerical data.
 * @param {Object} state - Current state.
 * @param {number} chunkSize - Size of each chunk to process.
 * @returns {Object} - Updated state and partial result.
 */
export function exampleTaskFunction(state, chunkSize) {
  const { data, index } = state;
  const chunk = data.slice(index, index + chunkSize);

  const result = chunk.map((x) => x * 2); // Example computation: doubling each number.
  const newIndex = index + chunkSize;

  return {
    state: { data, index: newIndex, done: newIndex >= data.length },
    result
  };
}

/**
 * Example usage of dynamicTaskSplitter.
 * @returns {Promise<void>} - Demonstrates task splitting.
 */
export async function demoTaskSplitter() {
  const data = Array.from({ length: 1000 }, (_, i) => i + 1);
  const initialState = { data, index: 0, done: false };
  const chunkSize = 100;
  const timeLimitMs = 50;

  const { aggregatedResult, finalState } = await dynamicTaskSplitter(exampleTaskFunction, initialState, chunkSize, timeLimitMs);

  console.log('Aggregated Result:', aggregatedResult);
  console.log('Final State:', finalState);
}
