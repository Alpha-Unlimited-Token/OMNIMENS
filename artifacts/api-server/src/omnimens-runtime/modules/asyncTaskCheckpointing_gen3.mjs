/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: asyncTaskCheckpointing
 * Written: 2026-04-03T07:27:37.514Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// asyncTaskCheckpointing.mjs

import { performance } from 'node:perf_hooks';

/**
 * Divides a task into smaller chunks and executes them asynchronously with checkpointing.
 * Useful for resumable iterative computations within time constraints.
 */

export function createAsyncTaskCheckpoint(taskFunction, checkpointInterval = 100) {
  if (typeof taskFunction !== 'function') {
    throw new TypeError('taskFunction must be a function');
  }
  if (typeof checkpointInterval !== 'number' || checkpointInterval <= 0) {
    throw new TypeError('checkpointInterval must be a positive number');
  }

  return {
    async execute(initialState, maxExecutionTime = 1000) {
      if (typeof maxExecutionTime !== 'number' || maxExecutionTime <= 0) {
        throw new TypeError('maxExecutionTime must be a positive number');
      }

      let state = initialState;
      let startTime = performance.now();

      while (true) {
        for (let i = 0; i < checkpointInterval; i++) {
          state = taskFunction(state);
        }

        if (performance.now() - startTime >= maxExecutionTime) {
          return { state, completed: false };
        }

        if (state.done) {
          return { state, completed: true };
        }
      }
    }
  };
}

/**
 * Example utility function for iterative tasks: summing numbers in a range.
 * Can be used by any agent needing resumable computations.
 */
export function sumRangeTask(state) {
  const { current, end, sum } = state;

  if (current > end) {
    return { ...state, done: true };
  }

  return { current: current + 1, end, sum: sum + current, done: false };
}

/**
 * Example utility function for iterative tasks: finding max in a list.
 * Can be used by agents needing resumable max search.
 */
export function findMaxTask(state) {
  const { currentIndex, array, max } = state;

  if (currentIndex >= array.length) {
    return { ...state, done: true };
  }

  return {
    currentIndex: currentIndex + 1,
    array,
    max: Math.max(max, array[currentIndex]),
    done: false
  };
}

/**
 * Example utility function for iterative tasks: calculating factorial.
 * Can be used by agents needing resumable factorial computation.
 */
export function factorialTask(state) {
  const { current, result } = state;

  if (current <= 1) {
    return { ...state, done: true };
  }

  return { current: current - 1, result: result * current, done: false };
}

/**
 * Example usage:
 * const task = createAsyncTaskCheckpoint(sumRangeTask, 10);
 * const initialState = { current: 1, end: 100, sum: 0 };
 * const result = await task.execute(initialState, 500);
 * console.log(result);
 */