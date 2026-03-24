/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: persistentTaskQueue
 * Written: 2026-03-24T22:37:34.438Z
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

import { createHash } from 'crypto';

// In-memory storage for task persistence
const taskQueue = new Map();

/**
 * Adds a new task to the queue.
 * @param {string} taskId - Unique identifier for the task.
 * @param {Function} taskFunction - Function to execute the task.
 * @param {any} initialState - Initial state for the task.
 */
export function addTask(taskId, taskFunction, initialState) {
  if (taskQueue.has(taskId)) {
    throw new Error(`Task with ID '${taskId}' already exists.`);
  }
  taskQueue.set(taskId, { taskFunction, state: initialState, completed: false });
}

/**
 * Executes the next step of a task and persists its state.
 * @param {string} taskId - Unique identifier for the task.
 * @returns {string} - Task status ("completed" or "in-progress").
 */
export function executeTask(taskId) {
  const task = taskQueue.get(taskId);
  if (!task) {
    throw new Error(`Task with ID '${taskId}' not found.`);
  }
  if (task.completed) {
    return 'completed';
  }

  try {
    const nextState = task.taskFunction(task.state);
    if (nextState === null || nextState === undefined) {
      task.completed = true;
      task.state = null;
      return 'completed';
    }
    task.state = nextState;
    return 'in-progress';
  } catch (error) {
    throw new Error(`Error executing task '${taskId}': ${error.message}`);
  }
}

/**
 * Removes a completed task from the queue.
 * @param {string} taskId - Unique identifier for the task.
 */
export function removeTask(taskId) {
  const task = taskQueue.get(taskId);
  if (!task) {
    throw new Error(`Task with ID '${taskId}' not found.`);
  }
  if (!task.completed) {
    throw new Error(`Cannot remove task '${taskId}' because it is not completed.`);
  }
  taskQueue.delete(taskId);
}

/**
 * Lists all tasks in the queue with their statuses.
 * @returns {Array<{ taskId, completed}>} - List of task statuses.
 */
export function listTasks() {
  return Array.from(taskQueue.entries()).map(([taskId, task]) => ({
    taskId,
    completed: task.completed
  }));
}

/**
 * Generates a unique task ID based on the task function and initial state.
 * @param {Function} taskFunction - Function representing the task.
 * @param {any} initialState - Initial state for the task.
 * @returns {string} - A unique task ID.
 */
export function generateTaskId(taskFunction, initialState) {
  const hash = createHash('sha256');
  hash.update(taskFunction.toString());
  hash.update(JSON.stringify(initialState));
  return hash.digest('hex');
}

/**
 * Resets the entire task queue (useful for testing or clearing state).
 */
export function resetQueue() {
  taskQueue.clear();
}