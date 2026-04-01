/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: asynchronousTaskScheduler
 * Written: 2026-04-01T22:22:12.208Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// asynchronousTaskScheduler.mjs

import { setTimeout } from 'timers/promises';

/**
 * Splits a complex computation into smaller asynchronous tasks with state checkpointing.
 * Useful for bypassing time limits and enabling distributed execution.
 */

/**
 * Recursively executes a large task by splitting it into smaller chunks.
 * @param {Function} taskFunction - The main computation function to execute.
 * @param {Object} initialState - The initial state object for the task.
 * @param {number} chunkSize - The maximum number of iterations per chunk.
 * @param {Function} progressCallback - Optional callback to report progress.
 * @returns {Promise<Object>} - Resolves with the final state after computation.
 */
export async function executeTaskInChunks(taskFunction, initialState, chunkSize, progressCallback = () => {}) {
  let state = { ...initialState };

  async function processChunk(startIndex) {
    for (let i = 0; i < chunkSize; i++) {
      const currentIndex = startIndex + i;
      const shouldContinue = await taskFunction(state, currentIndex);

      if (!shouldContinue) {
        return state; // Task completed early
      }
    }

    progressCallback(state);
    await setTimeout(0); // Yield control to avoid blocking

    return processChunk(startIndex + chunkSize);
  }

  return processChunk(0);
}

/**
 * Splits an array into smaller chunks and processes each chunk asynchronously.
 * @param {Array} array - The array to process.
 * @param {Function} processFunction - Function to process each element.
 * @param {number} chunkSize - Number of elements per chunk.
 * @returns {Promise<void>} - Resolves when all chunks are processed.
 */
export async function processArrayInChunks(array, processFunction, chunkSize) {
  let index = 0;

  while (index < array.length) {
    const chunk = array.slice(index, index + chunkSize);
    await Promise.all(chunk.map((item, i) => processFunction(item, index + i)));
    index += chunkSize;
  }
}

/**
 * Creates a state checkpointing wrapper for a task function.
 * @param {Function} taskFunction - The task function to wrap.
 * @param {Function} saveState - Function to save the state.
 * @param {Function} loadState - Function to load the state.
 * @returns {Function} - A wrapped task function with checkpointing.
 */
export function withCheckpointing(taskFunction, saveState, loadState) {
  return async function (state, index) {
    try {
      const result = await taskFunction(state, index);
      await saveState(state);
      return result;
    } catch (error) {
      const recoveredState = await loadState();
      return taskFunction(recoveredState, index);
    }
  };
}

/**
 * Example task function for demonstration purposes.
 * @param {Object} state - The current state of the task.
 * @param {number} index - The current index being processed.
 * @returns {Promise<boolean>} - Resolves with true to continue, false to stop.
 */
export async function exampleTaskFunction(state, index) {
  state.sum = (state.sum || 0) + index;
  return index < 100; // Stop after processing index 100
}

/**
 * Example usage of the module.
 */
export async function exampleUsage() {
  const initialState = { sum: 0 };
  const chunkSize = 10;

  const finalState = await executeTaskInChunks(exampleTaskFunction, initialState, chunkSize, (state) => {
    console.log('Progress:', state);
  });

  console.log('Final State:', finalState);
}
