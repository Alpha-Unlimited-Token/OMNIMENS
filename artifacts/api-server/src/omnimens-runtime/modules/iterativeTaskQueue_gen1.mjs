/**
 * OMNIMENS Self-Authored Module (Migrated from DB)
 * Original Source: evolution_cycle_21
 * Name: iterativeTaskQueue
 * Purpose: Splits long-running computations into resumable tasks to bypass subprocess timeout.
 * Description: Splits long-running computations into resumable tasks with state persistence using in-memory storage.
 * Migrated: 2026-04-01T22:23:20.245Z
 */

// iterativeTaskQueue.mjs

import { createHash } from 'crypto';

const taskStore = new Map(); // In-memory storage for task state

/**
 * Generates a unique hash for a given task and its parameters.
 * @param {string} taskName - The name of the task.
 * @param {object} params - Parameters for the task.
 * @returns {string} - A unique hash string.
 */
export function generateTaskId(taskName, params) {
  const hash = createHash('sha256');
  hash.update(taskName + JSON.stringify(params));
  return hash.digest('hex');
}

/**
 * Initializes a new task or retrieves the current state of an existing task.
 * @param {string} taskId - The unique identifier for the task.
 * @param {object} initialState - The initial state of the task.
 * @returns {object} - The current state of the task.
 */
export function initializeTask(taskId, initialState) {
  if (!taskStore.has(taskId)) {
    taskStore.set(taskId, { ...initialState, completed: false });
  }
  return taskStore.get(taskId);
}

/**
 * Updates the state of a task.
 * @param {string} taskId - The unique identifier for the task.
 * @param {object} newState - The new state to merge into the task.
 * @returns {object} - The updated state of the task.
 */
export function updateTaskState(taskId, newState) {
  if (!taskStore.has(taskId)) {
    throw new Error(`Task with ID ${taskId} does not exist.`);
  }
  const currentState = taskStore.get(taskId);
  const updatedState = { ...currentState, ...newState };
  taskStore.set(taskId, updatedState);
  return updatedState;
}

/**
 * Executes a long-running computation in iterative chunks.
 * @param {string} taskId - The unique identifier for the task.
 * @param {function} taskFunction - The function to execute (receives current state).
 * @param {number} chunkSize - The size of each computation chunk.
 * @returns {object} - The final state of the task when completed.
 */
export async function executeTask(taskId, taskFunction, chunkSize) {
  if (!taskStore.has(taskId)) {
    throw new Error(`Task with ID ${taskId} does not exist.`);
  }

  let taskState = taskStore.get(taskId);

  while (!taskState.completed) {
    const { progress = 0, total } = taskState;

    // Determine the next chunk to process
    const nextChunk = Math.min(progress + chunkSize, total);

    // Execute the task function with the current state
    taskState = await taskFunction({ ...taskState, progress: nextChunk });

    // Update the task state in the store
    taskStore.set(taskId, taskState);

    // Exit early if the task is marked as completed
    if (taskState.completed) break;
  }

  return taskState;
}

/**
 * Deletes a task from the store.
 * @param {string} taskId - The unique identifier for the task.
 */
export function deleteTask(taskId) {
  if (!taskStore.has(taskId)) {
    throw new Error(`Task with ID ${taskId} does not exist.`);
  }
  taskStore.delete(taskId);
}

/**
 * Retrieves the current state of a task.
 * @param {string} taskId - The unique identifier for the task.
 * @returns {object} - The current state of the task.
 */
export function getTaskState(taskId) {
  if (!taskStore.has(taskId)) {
    throw new Error(`Task with ID ${taskId} does not exist.`);
  }
  return taskStore.get(taskId);
}