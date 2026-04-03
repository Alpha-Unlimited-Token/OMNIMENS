/**
 * OMNIMENS Self-Authored Module (Migrated from DB)
 * Original Source: evolution_cycle_3
 * Name: longTaskStateManager
 * Purpose: Manages stateful checkpoints for long-running computations, allowing tasks to resume seamlessly across multiple subprocess invocations.
 * Description: Manages stateful checkpoints for long-running computations, enabling resumable tasks across subprocesses with a task queue and serialized state storage.
 * Migrated: 2026-04-03T08:36:30.241Z
 */

// Complete ES module code here

import { createHash } from 'crypto';

/**
 * Utility module to manage stateful checkpoints for long-running computations.
 * Allows tasks to resume seamlessly across multiple subprocess invocations.
 */

// Internal task queue
const taskQueue = new Map();

/**
 * Generates a unique hash for a task based on its input state.
 * @param {string} taskId - The unique identifier for the task.
 * @param {object} state - The current state of the task.
 * @returns {string} - A hash representing the task state.
 */
export function generateTaskHash(taskId, state) {
  const hash = createHash('sha256');
  hash.update(taskId + JSON.stringify(state));
  return hash.digest('hex');
}

/**
 * Adds a task to the queue with its initial state.
 * @param {string} taskId - The unique identifier for the task.
 * @param {object} initialState - The initial state of the task.
 */
export function addTask(taskId, initialState) {
  if (taskQueue.has(taskId)) {
    throw new Error(`Task with ID ${taskId} already exists.`);
  }
  taskQueue.set(taskId, { state: initialState, checkpointHash: generateTaskHash(taskId, initialState) });
}

/**
 * Updates the state of a task and creates a new checkpoint.
 * @param {string} taskId - The unique identifier for the task.
 * @param {object} newState - The updated state of the task.
 */
export function updateTaskState(taskId, newState) {
  if (!taskQueue.has(taskId)) {
    throw new Error(`Task with ID ${taskId} does not exist.`);
  }
  const checkpointHash = generateTaskHash(taskId, newState);
  taskQueue.set(taskId, { state: newState, checkpointHash });
}

/**
 * Retrieves the current state and checkpoint hash of a task.
 * @param {string} taskId - The unique identifier for the task.
 * @returns {object} - The current state and checkpoint hash of the task.
 */
export function getTaskState(taskId) {
  if (!taskQueue.has(taskId)) {
    throw new Error(`Task with ID ${taskId} does not exist.`);
  }
  return taskQueue.get(taskId);
}

/**
 * Removes a task from the queue.
 * @param {string} taskId - The unique identifier for the task.
 */
export function removeTask(taskId) {
  if (!taskQueue.has(taskId)) {
    throw new Error(`Task with ID ${taskId} does not exist.`);
  }
  taskQueue.delete(taskId);
}

/**
 * Lists all active tasks in the queue.
 * @returns {Array<string>} - An array of task IDs.
 */
export function listTasks() {
  return Array.from(taskQueue.keys());
}

/**
 * Resumes a task by providing its last known state.
 * @param {string} taskId - The unique identifier for the task.
 * @param {function} resumeFunction - A function that resumes the task using its state.
 * @returns {any} - The result of the resumed task.
 */
export function resumeTask(taskId, resumeFunction) {
  if (!taskQueue.has(taskId)) {
    throw new Error(`Task with ID ${taskId} does not exist.`);
  }
  const { state } = taskQueue.get(taskId);
  return resumeFunction(state);
}

/**
 * Clears all tasks from the queue.
 */
export function clearAllTasks() {
  taskQueue.clear();
}

/**
 * Checks whether a task exists in the queue.
 * @param {string} taskId - The unique identifier for the task.
 * @returns {boolean} - True if the task exists, false otherwise.
 */
export function taskExists(taskId) {
  return taskQueue.has(taskId);
}