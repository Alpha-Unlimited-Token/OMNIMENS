/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: iterativeTaskManager
 * Written: 2026-04-02T14:17:46.172Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// iterativeTaskManager.mjs

import { randomUUID } from 'crypto';

// Task Queue and State Management
const taskQueue = [];
const taskStates = new Map();

/**
 * Adds a new task to the queue.
 * @param {Function} taskFunction - The function representing the task.
 * @param {Object} initialState - The initial state of the task.
 * @param {number} priority - Priority of the task (higher number = higher priority).
 * @returns {string} - The unique ID of the task.
 */
export function addTask(taskFunction, initialState = {}, priority = 1) {
  const taskId = randomUUID();
  taskQueue.push({ taskId, taskFunction, priority });
  taskStates.set(taskId, { state: initialState, completed: false });
  taskQueue.sort((a, b) => b.priority - a.priority); // Higher priority first
  return taskId;
}

/**
 * Executes the next step of the highest-priority task in the queue.
 * @returns {Object|null} - The result of the task step, or null if no tasks remain.
 */
export function executeNextTask() {
  if (taskQueue.length === 0) return null;

  const { taskId, taskFunction } = taskQueue.shift();
  const taskState = taskStates.get(taskId);

  try {
    const result = taskFunction(taskState.state);

    if (result.done) {
      taskState.completed = true;
      taskStates.set(taskId, taskState);
      return { taskId, result: result.value, completed: true };
    } else {
      taskState.state = result.value;
      taskQueue.push({ taskId, taskFunction, priority: 1 }); // Re-queue with default priority
      taskStates.set(taskId, taskState);
      return { taskId, result: result.value, completed: false };
    }
  } catch (error) {
    taskStates.delete(taskId);
    return { taskId, error: error.message, completed: false };
  }
}

/**
 * Checks the status of a task by its ID.
 * @param {string} taskId - The unique ID of the task.
 * @returns {Object|null} - The task state or null if not found.
 */
export function getTaskStatus(taskId) {
  if (!taskStates.has(taskId)) return null;
  return taskStates.get(taskId);
}

/**
 * Removes a task from the queue and state map.
 * @param {string} taskId - The unique ID of the task.
 * @returns {boolean} - True if the task was removed, false otherwise.
 */
export function removeTask(taskId) {
  const index = taskQueue.findIndex(task => task.taskId === taskId);
  if (index !== -1) taskQueue.splice(index, 1);
  return taskStates.delete(taskId);
}

/**
 * Lists all tasks currently in the queue.
 * @returns {Array} - An array of task IDs and their statuses.
 */
export function listTasks() {
  return taskQueue.map(task => ({ taskId: task.taskId, priority: task.priority }));
}

/**
 * Clears all tasks and resets the system.
 */
export function clearAllTasks() {
  taskQueue.length = 0;
  taskStates.clear();
}

// Example Task Function Template
/**
 * Example task function generator for incremental tasks.
 * @param {Object} state - The state object of the task.
 * @returns {Object} - { done, value}.
 */
export function exampleTaskFunction(state) {
  if (!state.counter) state.counter = 0;
  state.counter++;
  if (state.counter >= 5) return { done: true, value: state };
  return { done: false, value: state };
}