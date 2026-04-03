/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: asyncTaskManager
 * Written: 2026-04-03T05:34:15.309Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// asyncTaskManager.mjs

import { randomUUID } from 'crypto';

/**
 * Task Queue to manage long-running computations with state serialization and resumable tasks.
 */

const taskQueue = new Map();

/**
 * Adds a new task to the queue.
 * @param {Function} taskFunction - The function representing the task.
 * @param {Object} initialState - Initial state to start the task.
 * @returns {string} - Unique task ID.
 */
export function addTask(taskFunction, initialState = {}) {
  const taskId = randomUUID();
  taskQueue.set(taskId, {
    taskFunction,
    state: initialState,
    isPaused: false,
    isCompleted: false
  });
  return taskId;
}

/**
 * Executes a task in chunks to prevent timeouts.
 * @param {string} taskId - The ID of the task to execute.
 * @param {number} chunkSize - Maximum iterations per execution chunk.
 * @returns {Promise} - Resolves when the task is completed or paused.
 */
export async function executeTask(taskId, chunkSize = 100) {
  const task = taskQueue.get(taskId);
  if (!task) throw new Error(`Task with ID ${taskId} not found.`);
  if (task.isCompleted) throw new Error(`Task with ID ${taskId} is already completed.`);

  task.isPaused = false;

  while (!task.isPaused && !task.isCompleted) {
    for (let i = 0; i < chunkSize; i++) {
      const result = task.taskFunction(task.state);
      if (result.done) {
        task.isCompleted = true;
        break;
      }
      task.state = result.state;
    }
    await new Promise(resolve => setTimeout(resolve, 0)); // Yield control to avoid blocking.
  }

  return task.isCompleted ? 'Task completed' : 'Task paused';
}

/**
 * Pauses an ongoing task.
 * @param {string} taskId - The ID of the task to pause.
 */
export function pauseTask(taskId) {
  const task = taskQueue.get(taskId);
  if (!task) throw new Error(`Task with ID ${taskId} not found.`);
  task.isPaused = true;
}

/**
 * Retrieves the current state of a task.
 * @param {string} taskId - The ID of the task to query.
 * @returns {Object} - The current state of the task.
 */
export function getTaskState(taskId) {
  const task = taskQueue.get(taskId);
  if (!task) throw new Error(`Task with ID ${taskId} not found.`);
  return {
    state: task.state,
    isPaused: task.isPaused,
    isCompleted: task.isCompleted
  };
}

/**
 * Removes a completed task from the queue.
 * @param {string} taskId - The ID of the task to remove.
 */
export function removeTask(taskId) {
  const task = taskQueue.get(taskId);
  if (!task) throw new Error(`Task with ID ${taskId} not found.`);
  if (!task.isCompleted) throw new Error(`Task with ID ${taskId} is not completed.`);
  taskQueue.delete(taskId);
}

/**
 * Utility function to create a generator-based task function.
 * @param {GeneratorFunction} generatorFunction - A generator function representing the task.
 * @returns {Function} - A task function compatible with the task queue.
 */
export function createTaskFunction(generatorFunction) {
  return function (state) {
    if (!state.generator) {
      state.generator = generatorFunction();
    }
    const { value, done } = state.generator.next(state.input);
    return { state: { ...state, output: value }, done };
  };
}

// Example usage:
// const taskId = addTask(createTaskFunction(function* () {
//   for (let i = 0; i < 1000; i++) {
//     yield i;
//   }
// }));
// executeTask(taskId, 10).then(console.log);