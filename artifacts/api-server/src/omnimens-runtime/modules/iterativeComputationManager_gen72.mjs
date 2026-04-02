/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: iterativeComputationManager
 * Written: 2026-04-02T13:38:48.908Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// iterativeComputationManager.mjs

import { createHash } from 'crypto';

/**
 * Generates a unique hash for a given state object.
 * @param {object} state - The state object to hash.
 * @returns {string} - A unique hash string.
 */
export function generateStateHash(state) {
  const hash = createHash('sha256');
  hash.update(JSON.stringify(state));
  return hash.digest('hex');
}

/**
 * Splits a large task into smaller manageable chunks based on a chunk size.
 * @param {Array} taskArray - The array representing the full task.
 * @param {number} chunkSize - The size of each chunk.
 * @returns {Array<Array>} - An array of task chunks.
 */
export function splitTask(taskArray, chunkSize) {
  if (!Array.isArray(taskArray) || chunkSize <= 0) {
    throw new Error('Invalid input: taskArray must be an array and chunkSize must be a positive number.');
  }
  const chunks = [];
  for (let i = 0; i < taskArray.length; i += chunkSize) {
    chunks.push(taskArray.slice(i, i + chunkSize));
  }
  return chunks;
}

/**
 * Resolves dependencies dynamically between tasks.
 * @param {Array} tasks - An array of tasks with dependencies.
 * @param {Function} dependencyResolver - A function to resolve dependencies.
 * @returns {Promise<Array>} - A promise resolving to the completed tasks in order.
 */
export async function resolveDependencies(tasks, dependencyResolver) {
  if (typeof dependencyResolver !== 'function') {
    throw new Error('dependencyResolver must be a function.');
  }

  const resolvedTasks = [];
  const taskMap = new Map(tasks.map(task => [task.id, task]));

  const resolveTask = async (taskId) => {
    const task = taskMap.get(taskId);
    if (!task) {
      throw new Error(`Task with ID ${taskId} not found.`);
    }

    if (resolvedTasks.includes(taskId)) {
      return;
    }

    if (task.dependencies && task.dependencies.length > 0) {
      for (const depId of task.dependencies) {
        await resolveTask(depId);
      }
    }

    const result = await dependencyResolver(task);
    resolvedTasks.push({ id: taskId, result });
  };

  for (const task of tasks) {
    await resolveTask(task.id);
  }

  return resolvedTasks;
}

/**
 * Chains asynchronous tasks dynamically, ensuring proper state serialization.
 * @param {Array<Function>} asyncTasks - An array of asynchronous functions.
 * @returns {Promise<Array>} - A promise resolving to the results of all tasks.
 */
export async function chainAsyncTasks(asyncTasks) {
  if (!Array.isArray(asyncTasks) || !asyncTasks.every(fn => typeof fn === 'function')) {
    throw new Error('asyncTasks must be an array of functions.');
  }

  const results = [];
  for (const task of asyncTasks) {
    results.push(await task());
  }
  return results;
}

/**
 * Serializes the state of an iterative computation for checkpointing.
 * @param {object} state - The current state of the computation.
 * @returns {string} - A serialized JSON string of the state.
 */
export function serializeState(state) {
  return JSON.stringify(state);
}

/**
 * Deserializes a serialized state back into an object.
 * @param {string} serializedState - The serialized state string.
 * @returns {object} - The deserialized state object.
 */
export function deserializeState(serializedState) {
  try {
    return JSON.parse(serializedState);
  } catch (error) {
    throw new Error('Failed to deserialize state: Invalid JSON string.');
  }
}

/**
 * Manages iterative computations with checkpointing and state serialization.
 * @param {Array} tasks - The tasks to be processed iteratively.
 * @param {Function} processTask - A function to process each task.
 * @param {object} initialState - The initial state of the computation.
 * @returns {Promise<object>} - The final state after processing all tasks.
 */
export async function manageIterativeComputation(tasks, processTask, initialState = {}) {
  if (typeof processTask !== 'function') {
    throw new Error('processTask must be a function.');
  }

  let state = { ...initialState, completedTasks: [] };

  for (const task of tasks) {
    const taskHash = generateStateHash(task);
    if (!state.completedTasks.includes(taskHash)) {
      const result = await processTask(task);
      state.completedTasks.push(taskHash);
      state = { ...state, [taskHash]: result };
    }
  }

  return state;
}