/**
 * OMNIMENS Self-Authored Module (Migrated from DB)
 * Original Source: evolution_cycle_25
 * Name: checkpointedTaskQueue
 * Purpose: Allows iterative computations to pause and resume without losing state, bypassing subprocess timeout limitations.
 * Description: Provides a mechanism for pausing, resuming, and checkpointing iterative computations in Node.js.
 * Migrated: 2026-04-02T14:08:14.877Z
 */

// checkpointedTaskQueue.mjs

import { serialize, deserialize } from 'v8';

/**
 * Stores the state of tasks and allows pausing/resuming computations.
 * @type {Map<string, {state: any, taskFunction: Function}>}
 */
const taskQueue = new Map();

/**
 * Registers a task with a unique identifier and its initial state.
 * @param {string} taskId - Unique identifier for the task.
 * @param {Function} taskFunction - Function performing the task (receives state).
 * @param {any} initialState - Initial state for the task.
 */
export function registerTask(taskId, taskFunction, initialState) {
  if (taskQueue.has(taskId)) {
    throw new Error(`Task with ID '${taskId}' already exists.`);
  }
  taskQueue.set(taskId, {
    state: serialize(initialState),
    taskFunction
  });
}

/**
 * Executes a task by its identifier, updating its state.
 * @param {string} taskId - Unique identifier for the task.
 * @returns {any} - The result of the task execution.
 */
export function executeTask(taskId) {
  const task = taskQueue.get(taskId);
  if (!task) {
    throw new Error(`Task with ID '${taskId}' not found.`);
  }
  const currentState = deserialize(task.state);
  const updatedState = task.taskFunction(currentState);
  task.state = serialize(updatedState);
  return updatedState;
}

/**
 * Serializes the state of all tasks for checkpointing.
 * @returns {string} - Serialized representation of all tasks.
 */
export function checkpointTasks() {
  const checkpoint = {};
  for (const [taskId, { state }] of taskQueue.entries()) {
    checkpoint[taskId] = state;
  }
  return JSON.stringify(checkpoint);
}

/**
 * Restores tasks from a serialized checkpoint.
 * @param {string} serializedCheckpoint - Serialized representation of tasks.
 */
export function restoreTasks(serializedCheckpoint) {
  const checkpoint = JSON.parse(serializedCheckpoint);
  for (const [taskId, state] of Object.entries(checkpoint)) {
    if (!taskQueue.has(taskId)) {
      throw new Error(`Cannot restore task '${taskId}' as it is not registered.`);
    }
    taskQueue.get(taskId).state = state;
  }
}

/**
 * Removes a task by its identifier.
 * @param {string} taskId - Unique identifier for the task.
 */
export function removeTask(taskId) {
  if (!taskQueue.delete(taskId)) {
    throw new Error(`Task with ID '${taskId}' not found.`);
  }
}

/**
 * Lists all registered task IDs.
 * @returns {string[]} - Array of registered task IDs.
 */
export function listTasks() {
  return Array.from(taskQueue.keys());
}

/**
 * Clears all tasks from the queue.
 */
export function clearTasks() {
  taskQueue.clear();
}