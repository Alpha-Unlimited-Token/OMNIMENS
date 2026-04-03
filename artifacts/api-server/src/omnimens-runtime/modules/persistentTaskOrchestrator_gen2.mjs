/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: persistentTaskOrchestrator
 * Written: 2026-04-03T12:17:37.625Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// persistentTaskOrchestrator.mjs

import { performance } from 'node:perf_hooks';

/**
 * Splits a long-running task into smaller chunks and manages state persistence between iterations.
 * @param {Function} taskFunction - The function to execute in chunks. Must accept (state, chunkSize) and return updated state.
 * @param {Object} initialState - The initial state object for the task.
 * @param {number} chunkSize - The size of each chunk (e.g., number of iterations per chunk).
 * @param {number} timeLimitMs - Maximum time (in ms) to spend per execution cycle.
 * @param {Function} onComplete - Callback invoked when the task is fully completed.
 * @returns {Object} - Task controller with methods to start, stop, and check status.
 */
export function createTaskOrchestrator(taskFunction, initialState, chunkSize, timeLimitMs, onComplete) {
  if (typeof taskFunction !== 'function') throw new Error('taskFunction must be a function');
  if (typeof onComplete !== 'function') throw new Error('onComplete must be a function');

  let state = { ...initialState };
  let isRunning = false;
  let timer = null;

  function executeChunk() {
    const startTime = performance.now();

    while (performance.now() - startTime < timeLimitMs) {
      state = taskFunction(state, chunkSize);
      if (state.isComplete) {
        stop();
        onComplete(state);
        return;
      }
    }

    // Schedule the next chunk
    if (isRunning) {
      timer = setTimeout(executeChunk, 0);
    }
  }

  function start() {
    if (isRunning) return;
    isRunning = true;
    executeChunk();
  }

  function stop() {
    isRunning = false;
    if (timer) clearTimeout(timer);
  }

  function getStatus() {
    return { isRunning, state };
  }

  return { start, stop, getStatus };
}

/**
 * Example utility function to split an array into smaller chunks.
 * @param {Array} array - The array to split.
 * @param {number} chunkSize - The size of each chunk.
 * @returns {Array[]} - An array of chunks.
 */
export function chunkArray(array, chunkSize) {
  if (!Array.isArray(array)) throw new Error('Input must be an array');
  if (chunkSize <= 0) throw new Error('chunkSize must be greater than 0');

  const chunks = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    chunks.push(array.slice(i, i + chunkSize));
  }
  return chunks;
}

/**
 * Example utility function for persisting state between iterations.
 * @param {Object} state - The current state object.
 * @param {string} key - The key to persist.
 * @param {*} value - The value to persist.
 * @returns {Object} - Updated state object.
 */
export function updateState(state, key, value) {
  return { ...state, [key]: value };
}

/**
 * Example task function for demonstration purposes.
 * @param {Object} state - The current state of the task.
 * @param {number} chunkSize - The number of iterations to process in this chunk.
 * @returns {Object} - Updated state object.
 */
export function exampleTaskFunction(state, chunkSize) {
  const { currentIndex, data, results } = state;
  const updatedResults = [...results];

  for (let i = 0; i < chunkSize && currentIndex + i < data.length; i++) {
    const item = data[currentIndex + i];
    updatedResults.push(item * 2); // Example computation: doubling each item
  }

  const newIndex = currentIndex + chunkSize;
  return {
    ...state,
    currentIndex: newIndex,
    results: updatedResults,
    isComplete: newIndex >= data.length
  };
}

/**
 * Example usage of the module.
 */
export function exampleUsage() {
  const data = Array.from({ length: 1000 }, (_, i) => i + 1); // Example data
  const initialState = { currentIndex: 0, data, results: [], isComplete: false };

  const orchestrator = createTaskOrchestrator(
    exampleTaskFunction,
    initialState,
    50, // Process 50 items per chunk
    100, // Spend at most 100ms per cycle
    (finalState) => {
      console.log('Task completed:', finalState.results);
    }
  );

  orchestrator.start();
}
