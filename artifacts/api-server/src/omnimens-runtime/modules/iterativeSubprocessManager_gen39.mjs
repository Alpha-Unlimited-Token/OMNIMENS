/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: iterativeSubprocessManager
 * Written: 2026-04-02T14:26:24.990Z
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

import { randomUUID } from 'crypto';

/**
 * Stores checkpoints in memory for simplicity. Replace with a database for persistence.
 */
const inMemoryCheckpointStore = new Map();

/**
 * Creates a unique task ID.
 * @returns {string} A unique identifier for a task.
 */
export function createTaskId() {
  return randomUUID();
}

/**
 * Initializes a task with its initial state.
 * @param {string} taskId - Unique identifier for the task.
 * @param {object} initialState - The starting state of the task.
 */
export function initializeTask(taskId, initialState) {
  if (inMemoryCheckpointStore.has(taskId)) {
    throw new Error(`Task with ID ${taskId} already exists.`);
  }
  inMemoryCheckpointStore.set(taskId, { state: initialState, completed: false });
}

/**
 * Saves a checkpoint for a task.
 * @param {string} taskId - Unique identifier for the task.
 * @param {object} state - The current state of the task.
 */
export function saveCheckpoint(taskId, state) {
  const task = inMemoryCheckpointStore.get(taskId);
  if (!task) {
    throw new Error(`Task with ID ${taskId} not found.`);
  }
  task.state = state;
}

/**
 * Retrieves the last checkpoint for a task.
 * @param {string} taskId - Unique identifier for the task.
 * @returns {object} The last saved state of the task.
 */
export function getCheckpoint(taskId) {
  const task = inMemoryCheckpointStore.get(taskId);
  if (!task) {
    throw new Error(`Task with ID ${taskId} not found.`);
  }
  return task.state;
}

/**
 * Marks a task as completed.
 * @param {string} taskId - Unique identifier for the task.
 */
export function completeTask(taskId) {
  const task = inMemoryCheckpointStore.get(taskId);
  if (!task) {
    throw new Error(`Task with ID ${taskId} not found.`);
  }
  task.completed = true;
}

/**
 * Checks if a task is completed.
 * @param {string} taskId - Unique identifier for the task.
 * @returns {boolean} True if the task is completed, false otherwise.
 */
export function isTaskCompleted(taskId) {
  const task = inMemoryCheckpointStore.get(taskId);
  if (!task) {
    throw new Error(`Task with ID ${taskId} not found.`);
  }
  return task.completed;
}

/**
 * Processes a task iteratively by applying a worker function to its state.
 * @param {string} taskId - Unique identifier for the task.
 * @param {function} workerFunction - Function that processes the task state and returns the next state.
 * @param {number} iterations - Number of iterations to process.
 */
export function processTaskIteratively(taskId, workerFunction, iterations) {
  if (typeof workerFunction !== 'function') {
    throw new Error('workerFunction must be a function.');
  }

  for (let i = 0; i < iterations; i++) {
    if (isTaskCompleted(taskId)) {
      break;
    }

    const currentState = getCheckpoint(taskId);
    const nextState = workerFunction(currentState);
    saveCheckpoint(taskId, nextState);
  }
}

/**
 * Deletes a task and its associated data.
 * @param {string} taskId - Unique identifier for the task.
 */
export function deleteTask(taskId) {
  if (!inMemoryCheckpointStore.delete(taskId)) {
    throw new Error(`Task with ID ${taskId} not found.`);
  }
}

/**
 * Lists all active task IDs.
 * @returns {string[]} An array of active task IDs.
 */
export function listActiveTasks() {
  return Array.from(inMemoryCheckpointStore.keys());
}
