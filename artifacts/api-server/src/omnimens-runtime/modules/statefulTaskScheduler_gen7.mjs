/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: statefulTaskScheduler
 * Written: 2026-04-02T14:52:47.392Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// statefulTaskScheduler.mjs

import { createHash } from 'crypto';

// In-memory storage for task states (can be extended to file-based persistence)
const taskStates = new Map();

/**
 * Generates a unique ID for a task based on its definition.
 * @param {string} taskName - The name of the task.
 * @param {object} initialState - The initial state of the task.
 * @returns {string} - A unique hash ID for the task.
 */
export function generateTaskId(taskName, initialState) {
  const hash = createHash('sha256');
  hash.update(taskName + JSON.stringify(initialState));
  return hash.digest('hex');
}

/**
 * Initializes a new task with a given name and state.
 * @param {string} taskName - The name of the task.
 * @param {object} initialState - The initial state of the task.
 * @returns {string} - The unique ID of the initialized task.
 */
export function initializeTask(taskName, initialState) {
  const taskId = generateTaskId(taskName, initialState);
  if (!taskStates.has(taskId)) {
    taskStates.set(taskId, { state: initialState, completed: false });
  }
  return taskId;
}

/**
 * Retrieves the current state of a task.
 * @param {string} taskId - The unique ID of the task.
 * @returns {object|null} - The current state of the task, or null if not found.
 */
export function getTaskState(taskId) {
  const task = taskStates.get(taskId);
  return task ? task.state : null;
}

/**
 * Updates the state of a task.
 * @param {string} taskId - The unique ID of the task.
 * @param {object} newState - The new state to update.
 * @returns {boolean} - True if the update was successful, false otherwise.
 */
export function updateTaskState(taskId, newState) {
  if (taskStates.has(taskId)) {
    const task = taskStates.get(taskId);
    task.state = newState;
    return true;
  }
  return false;
}

/**
 * Marks a task as completed.
 * @param {string} taskId - The unique ID of the task.
 * @returns {boolean} - True if the task was successfully marked as completed, false otherwise.
 */
export function completeTask(taskId) {
  if (taskStates.has(taskId)) {
    const task = taskStates.get(taskId);
    task.completed = true;
    return true;
  }
  return false;
}

/**
 * Checks if a task is completed.
 * @param {string} taskId - The unique ID of the task.
 * @returns {boolean} - True if the task is completed, false otherwise.
 */
export function isTaskCompleted(taskId) {
  const task = taskStates.get(taskId);
  return task ? task.completed : false;
}

/**
 * Deletes a task and its state.
 * @param {string} taskId - The unique ID of the task.
 * @returns {boolean} - True if the task was successfully deleted, false otherwise.
 */
export function deleteTask(taskId) {
  return taskStates.delete(taskId);
}

/**
 * Processes a task in chunks, allowing for iterative or long-running computations.
 * @param {string} taskId - The unique ID of the task.
 * @param {function} chunkFunction - A function that processes a chunk of the task. Receives the current state and returns the updated state.
 * @param {number} maxIterations - The maximum number of iterations to process in this call.
 * @returns {object} - The final state of the task after processing the chunks.
 */
export function processTaskChunks(taskId, chunkFunction, maxIterations = 1) {
  if (!taskStates.has(taskId)) {
    throw new Error('Task not found');
  }

  const task = taskStates.get(taskId);
  let iterations = 0;

  while (!task.completed && iterations < maxIterations) {
    const newState = chunkFunction(task.state);
    task.state = newState;

    if (newState.completed) {
      task.completed = true;
    }

    iterations++;
  }

  return task.state;
}

/**
 * Lists all active tasks and their states.
 * @returns {Array} - An array of task IDs and their current states.
 */
export function listTasks() {
  return Array.from(taskStates.entries()).map(([taskId, { state, completed }]) => ({
    taskId,
    state,
    completed
  }));
}