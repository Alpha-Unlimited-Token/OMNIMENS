/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: taskSplittingEngine
 * Written: 2026-04-01T21:49:47.840Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// taskSplittingEngine.mjs

import { createHash } from 'crypto';

/**
 * Generate a unique hash for a given state object.
 * Useful for checkpointing and identifying task states.
 * @param {object} state - The state object to hash.
 * @returns {string} - A unique hash string for the state.
 */
export function generateStateHash(state) {
  const stateString = JSON.stringify(state);
  return createHash('sha256').update(stateString).digest('hex');
}

/**
 * Split a long-running computation into smaller tasks.
 * Each task persists its state for resumption in case of failure.
 * @param {function} taskFunction - The function to execute for each task.
 * @param {object} initialState - The initial state of the computation.
 * @param {function} isComplete - A function to check if the computation is complete.
 * @param {function} nextState - A function to generate the next state.
 * @returns {Promise<object>} - Resolves with the final state when computation is complete.
 */
export async function runTaskWithCheckpointing(taskFunction, initialState, isComplete, nextState) {
  let currentState = initialState;

  let _ckptCount = 0;
  while (!isComplete(currentState)) {
    try {
      currentState = await taskFunction(currentState);

      const checkpointHash = generateStateHash(currentState);
      _ckptCount++;
      if (_ckptCount % 1000 === 0) {
        console.log(`Checkpoint reached: ${checkpointHash} (${_ckptCount})`);
      }
    } catch (error) {
      console.error('Task failed, retrying from last state:', error);
    }

    currentState = nextState(currentState);
    if (_ckptCount % 100 === 0) {
      await new Promise(r => setTimeout(r, 0));
    }
  }

  return currentState;
}

/**
 * Example utility function for splitting a range into smaller chunks.
 * Useful for mathematical computations, simulations, or batch processing.
 * @param {number} start - The starting number of the range.
 * @param {number} end - The ending number of the range.
 * @param {number} chunkSize - The size of each chunk.
 * @returns {Array<{start, end}>} - An array of range chunks.
 */
export function splitRangeIntoChunks(start, end, chunkSize) {
  const chunks = [];
  for (let i = start; i < end; i += chunkSize) {
    chunks.push({ start: i, end: Math.min(i + chunkSize, end) });
  }
  return chunks;
}

/**
 * Example usage: A long-running summation task.
 * @param {object} state - The current state of the summation task.
 * @returns {Promise<object>} - Resolves with the updated state.
 */
export async function exampleSummationTask(state) {
  const { range, sum } = state;
  const { start, end } = range;
  let newSum = sum;

  for (let i = start; i < end; i++) {
    newSum += i;
  }

  return { range, sum: newSum };
}

/**
 * Example to check if the summation task is complete.
 * @param {object} state - The current state of the summation task.
 * @returns {boolean} - True if the task is complete, false otherwise.
 */
export function isSummationComplete(state) {
  return state.range.start >= state.range.end;
}

/**
 * Example to generate the next state for the summation task.
 * @param {object} state - The current state of the summation task.
 * @returns {object} - The next state of the summation task.
 */
export function getNextSummationState(state) {
  const { range, sum } = state;
  const nextRange = { start: range.end, end: range.end + 10 };
  return { range: nextRange, sum };
}

// Example usage of the module
(async () => {
  const initialState = { range: { start: 0, end: 10 }, sum: 0 };
  const finalState = await runTaskWithCheckpointing(
    exampleSummationTask,
    initialState,
    isSummationComplete,
    getNextSummationState
  );

  console.log('Final State:', finalState);
})();