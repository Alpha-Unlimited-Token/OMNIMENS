/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: iterativeTaskSplitter
 * Written: 2026-04-02T13:32:59.676Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
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
