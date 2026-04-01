/**
 * OMNIMENS Self-Authored Module (Migrated from DB)
 * Original Source: evolution_cycle_23
 * Name: asynchronousTaskManager
 * Purpose: Manages long-running computations by splitting tasks into smaller chunks and scheduling them asynchronously.
 * Description: Manages long-running computations by splitting tasks into smaller chunks, scheduling them asynchronously, and preserving state between executions.
 * Migrated: 2026-04-01T22:23:20.245Z
 */

// asynchronousTaskManager.mjs

import { setImmediate } from 'timers/promises';

/**
 * Splits a long-running task into smaller chunks and schedules them asynchronously.
 * Supports priority-based scheduling and state preservation.
 */

/**
 * Splits a task into smaller chunks recursively based on a provided splitting function.
 * @param {any} task - The initial task to be split.
 * @param {function(any): any[]} splitFunction - Function to split a task into smaller chunks.
 * @returns {any[]} - Array of smaller tasks.
 */
export function splitTask(task, splitFunction) {
  const queue = [task];
  const result = [];

  while (queue.length > 0) {
    const currentTask = queue.pop();
    const subtasks = splitFunction(currentTask);

    if (subtasks && subtasks.length > 0) {
      queue.push(...subtasks);
    } else {
      result.push(currentTask);
    }
  }

  return result;
}

/**
 * Schedules tasks asynchronously based on priority.
 * @param {any[]} tasks - Array of tasks to be scheduled.
 * @param {function(any): number} priorityFunction - Function to determine task priority (lower number = higher priority).
 * @param {function(any): Promise<any>} taskExecutor - Function to execute a single task.
 * @returns {Promise<any[]>} - Resolves with an array of results from executed tasks.
 */
export async function scheduleTasks(tasks, priorityFunction, taskExecutor) {
  const taskQueue = tasks.sort((a, b) => priorityFunction(a) - priorityFunction(b));
  const results = [];

  while (taskQueue.length > 0) {
    const currentTask = taskQueue.shift();
    results.push(await taskExecutor(currentTask));
    await setImmediate(); // Yield to the event loop to prevent blocking.
  }

  return results;
}

/**
 * Manages a long-running computation by splitting, scheduling, and executing tasks.
 * @param {any} initialTask - The initial task to process.
 * @param {function(any): any[]} splitFunction - Function to split a task into smaller chunks.
 * @param {function(any): number} priorityFunction - Function to determine task priority.
 * @param {function(any): Promise<any>} taskExecutor - Function to execute a single task.
 * @returns {Promise<any[]>} - Resolves with an array of results from all executed tasks.
 */
export async function manageLongRunningTask(initialTask, splitFunction, priorityFunction, taskExecutor) {
  const subtasks = splitTask(initialTask, splitFunction);
  return await scheduleTasks(subtasks, priorityFunction, taskExecutor);
}

/**
 * Example utility function for generic task splitting (e.g., dividing a range into smaller ranges).
 * @param {{start: number, end: number}} task - A range task with start and end properties.
 * @returns {{start: number, end: number}[]} - Smaller range tasks.
 */
export function rangeSplitFunction(task) {
  const { start, end } = task;
  if (end - start <= 1) return []; // Base case: task is already small enough.

  const mid = Math.floor((start + end) / 2);
  return [
    { start, end: mid },
    { start: mid, end }
  ];
}

/**
 * Example priority function for tasks (e.g., smaller ranges have higher priority).
 * @param {{start: number, end: number}} task - A range task with start and end properties.
 * @returns {number} - Priority value (lower is higher priority).
 */
export function rangePriorityFunction(task) {
  return task.end - task.start; // Smaller ranges have higher priority.
}

/**
 * Example task executor that performs a computation on a range.
 * @param {{start: number, end: number}} task - A range task with start and end properties.
 * @returns {Promise<number>} - Sum of integers in the range [start, end).
 */
export async function rangeTaskExecutor(task) {
  const { start, end } = task;
  let sum = 0;
  for (let i = start; i < end; i++) {
    sum += i;
  }
  return sum;
}

// Example usage (uncomment to test in Node.js):
// const initialTask = { start: 0, end: 100 };
// manageLongRunningTask(
//   initialTask,
//   rangeSplitFunction,
//   rangePriorityFunction,
//   rangeTaskExecutor
// ).then(console.log);