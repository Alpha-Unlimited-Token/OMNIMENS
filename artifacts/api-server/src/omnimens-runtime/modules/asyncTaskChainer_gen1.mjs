/**
 * OMNIMENS Self-Authored Module (Migrated from DB)
 * Original Source: evolution_cycle_28
 * Name: asyncTaskChainer
 * Purpose: Simulates extended iterative computations by chaining asynchronous tasks with intermediate state preservation.
 * Description: Chains asynchronous tasks with intermediate state preservation, enabling iterative computations with state sharing and optional delays.
 * Migrated: 2026-04-02T14:50:29.443Z
 */

// asyncTaskChainer.mjs

import { setTimeout } from 'timers/promises';

/**
 * Chains asynchronous tasks with intermediate state preservation.
 * @param {Array<Function>} tasks - Array of async functions to execute sequentially.
 * @param {Object} initialState - Initial state object to pass between tasks.
 * @param {number} delay - Optional delay (ms) between task executions.
 * @returns {Promise<Object>} - Final state after all tasks are executed.
 */
export async function asyncTaskChainer(tasks, initialState = {}, delay = 0) {
  if (!Array.isArray(tasks) || tasks.some(task => typeof task !== 'function')) {
    throw new Error('Tasks must be an array of functions.');
  }

  let state = { ...initialState };

  for (const task of tasks) {
    try {
      state = await task(state);
      if (delay > 0) await setTimeout(delay);
    } catch (error) {
      state.error = error;
      break;
    }
  }

  return state;
}

/**
 * Utility to create a delayed async task.
 * @param {Function} taskFunction - Function to execute as the task (receives state, returns updated state).
 * @param {number} delay - Delay (ms) before task execution.
 * @returns {Function} - Async task function.
 */
export function createDelayedTask(taskFunction, delay) {
  if (typeof taskFunction !== 'function') {
    throw new Error('Task function must be a function.');
  }

  return async (state) => {
    await setTimeout(delay);
    return taskFunction(state);
  };
}

/**
 * Splits a large computation into smaller chunks.
 * @param {Function} computation - Function that performs the computation (receives state, returns updated state).
 * @param {number} iterations - Number of chunks to split the computation into.
 * @returns {Array<Function>} - Array of async task functions.
 */
export function splitComputation(computation, iterations) {
  if (typeof computation !== 'function' || typeof iterations !== 'number' || iterations <= 0) {
    throw new Error('Invalid computation function or iterations count.');
  }

  const tasks = [];

  for (let i = 0; i < iterations; i++) {
    tasks.push(async (state) => computation(state, i, iterations));
  }

  return tasks;
}

/**
 * Example computation task for testing purposes.
 * @param {Object} state - Current state object.
 * @param {number} index - Current iteration index.
 * @param {number} total - Total number of iterations.
 * @returns {Object} - Updated state object.
 */
export function exampleComputation(state, index, total) {
  const progress = ((index + 1) / total) * 100;
  return { ...state, progress, message: `Completed ${progress.toFixed(2)}%` };
}

// Example usage (commented out for module safety):
// (async () => {
//   const tasks = splitComputation(exampleComputation, 5);
//   const finalState = await asyncTaskChainer(tasks, { data: 'initial' }, 1000);
//   console.log(finalState);
// })();