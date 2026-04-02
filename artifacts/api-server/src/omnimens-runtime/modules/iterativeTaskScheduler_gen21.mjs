/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: iterativeTaskScheduler
 * Written: 2026-04-02T14:53:56.517Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// iterativeTaskScheduler.mjs

import { createHash } from 'crypto';

/**
 * Generates a unique task ID based on task details.
 * @param {string} taskName - The name of the task.
 * @param {object} taskData - The data associated with the task.
 * @returns {string} - A unique task ID.
 */
export function generateTaskId(taskName, taskData) {
  const hash = createHash('sha256');
  hash.update(taskName + JSON.stringify(taskData));
  return hash.digest('hex');
}

/**
 * Splits a long-running computation into smaller chunks.
 * @param {function} taskFunction - The function to execute.
 * @param {Array} inputArray - The input data to process in chunks.
 * @param {number} chunkSize - The size of each chunk.
 * @returns {Array} - An array of results for each chunk.
 */
export function chunkedExecution(taskFunction, inputArray, chunkSize) {
  const results = [];
  for (let i = 0; i < inputArray.length; i += chunkSize) {
    const chunk = inputArray.slice(i, i + chunkSize);
    results.push(taskFunction(chunk));
  }
  return results;
}

/**
 * Schedules tasks with priority and resumable state.
 * @param {Array} tasks - An array of task objects { id, priority, data, function }.
 * @param {object} state - The current state of the scheduler.
 * @returns {object} - The updated state after execution.
 */
export function scheduleTasks(tasks, state = { completed: [], pending: [] }) {
  const sortedTasks = [...tasks].sort((a, b) => b.priority - a.priority);

  for (const task of sortedTasks) {
    if (!state.completed.includes(task.id)) {
      const result = task.function(task.data);
      state.completed.push({ id: task.id, result });
    }
  }

  return state;
}

/**
 * Creates a resumable checkpoint for task execution.
 * @param {object} state - The current state of the scheduler.
 * @returns {string} - A serialized checkpoint.
 */
export function createCheckpoint(state) {
  return JSON.stringify(state);
}

/**
 * Restores a scheduler state from a serialized checkpoint.
 * @param {string} checkpoint - The serialized checkpoint.
 * @returns {object} - The restored state object.
 */
export function restoreCheckpoint(checkpoint) {
  return JSON.parse(checkpoint);
}

/**
 * Executes a task function safely with error handling.
 * @param {function} taskFunction - The function to execute.
 * @param {object} taskData - The data to pass to the function.
 * @returns {object} - An object containing success status and result or error.
 */
export function executeTaskSafely(taskFunction, taskData) {
  try {
    const result = taskFunction(taskData);
    return { success: true, result };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Utility to divide a range into equal parts.
 * @param {number} start - The start of the range.
 * @param {number} end - The end of the range.
 * @param {number} parts - The number of parts to divide into.
 * @returns {Array} - An array of ranges.
 */
export function divideRange(start, end, parts) {
  const step = Math.ceil((end - start + 1) / parts);
  const ranges = [];
  for (let i = start; i <= end; i += step) {
    ranges.push([i, Math.min(i + step - 1, end)]);
  }
  return ranges;
}

/**
 * Prioritizes tasks based on a custom scoring function.
 * @param {Array} tasks - An array of task objects { id, data }.
 * @param {function} scoringFunction - A function to calculate priority.
 * @returns {Array} - Tasks sorted by priority.
 */
export function prioritizeTasks(tasks, scoringFunction) {
  return tasks
    .map(task => ({ ...task, priority: scoringFunction(task.data) }))
    .sort((a, b) => b.priority - a.priority);
}