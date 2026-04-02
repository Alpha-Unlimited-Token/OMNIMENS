/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: asynchronousComputationManager
 * Written: 2026-04-02T14:37:21.996Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// Complete ES module code here

import { performance } from 'perf_hooks';

/**
 * Utility function to split a task into smaller chunks.
 * @param {Function} taskFunction - The main task function to execute.
 * @param {Array} inputData - Array of input data to process in chunks.
 * @param {number} chunkSize - Number of items to process per chunk.
 * @returns {AsyncGenerator} - An async generator yielding progress and results.
 */
export async function* chunkedTaskRunner(taskFunction, inputData, chunkSize) {
  if (typeof taskFunction !== 'function') throw new TypeError('taskFunction must be a function');
  if (!Array.isArray(inputData)) throw new TypeError('inputData must be an array');
  if (typeof chunkSize !== 'number' || chunkSize <= 0) throw new RangeError('chunkSize must be a positive number');

  const totalChunks = Math.ceil(inputData.length / chunkSize);
  let completedChunks = 0;

  for (let i = 0; i < inputData.length; i += chunkSize) {
    const chunk = inputData.slice(i, i + chunkSize);
    const results = await Promise.all(chunk.map(taskFunction));
    completedChunks++;

    yield {
      progress: completedChunks / totalChunks,
      results
    };
  }
}

/**
 * Utility function to create a resumable task manager.
 * @param {Function} taskFunction - The task to execute.
 * @param {Array} inputData - Array of input data.
 * @param {number} chunkSize - Number of items to process per chunk.
 * @param {Object} [state] - Optional state object to resume from.
 * @returns {AsyncGenerator} - An async generator yielding progress and results.
 */
export async function* resumableTaskManager(taskFunction, inputData, chunkSize, state = {}) {
  if (state.completedChunks === undefined) state.completedChunks = 0;

  const totalChunks = Math.ceil(inputData.length / chunkSize);

  for (let i = state.completedChunks * chunkSize; i < inputData.length; i += chunkSize) {
    const chunk = inputData.slice(i, i + chunkSize);
    const results = await Promise.all(chunk.map(taskFunction));
    state.completedChunks++;

    yield {
      progress: state.completedChunks / totalChunks,
      results,
      state
    };
  }
}

/**
 * Utility function to measure execution time of an async function.
 * @param {Function} asyncFunction - The async function to measure.
 * @param {...any} args - Arguments to pass to the async function.
 * @returns {Promise<{ duration, result}>} - Execution time and result.
 */
export async function measureExecutionTime(asyncFunction, ...args) {
  if (typeof asyncFunction !== 'function') throw new TypeError('asyncFunction must be a function');

  const start = performance.now();
  const result = await asyncFunction(...args);
  const end = performance.now();

  return {
    duration: end - start,
    result
  };
}

/**
 * Utility function to retry a task with exponential backoff.
 * @param {Function} taskFunction - The task to retry.
 * @param {number} retries - Number of retry attempts.
 * @param {number} delay - Initial delay in milliseconds.
 * @returns {Promise<any>} - Resolved value of the task or throws an error.
 */
export async function retryWithBackoff(taskFunction, retries, delay) {
  if (typeof taskFunction !== 'function') throw new TypeError('taskFunction must be a function');
  if (typeof retries !== 'number' || retries < 0) throw new RangeError('retries must be a non-negative number');
  if (typeof delay !== 'number' || delay <= 0) throw new RangeError('delay must be a positive number');

  let attempt = 0;

  while (attempt <= retries) {
    try {
      return await taskFunction();
    } catch (error) {
      if (attempt === retries) throw error;
      await new Promise(resolve => setTimeout(resolve, delay * 2 ** attempt));
      attempt++;
    }
  }
}

/**
 * Utility function to pause execution for a given duration.
 * @param {number} ms - Milliseconds to pause.
 * @returns {Promise<void>} - Resolves after the duration.
 */
export function sleep(ms) {
  if (typeof ms !== 'number' || ms < 0) throw new RangeError('ms must be a non-negative number');
  return new Promise(resolve => setTimeout(resolve, ms));
}
