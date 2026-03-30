/**
 * OMNIMENS Self-Authored Module (Migrated from DB)
 * Original Source: evolution_cycle_1
 * Name: persistentBackgroundThreadSimulator
 * Purpose: Simulate persistent threads for tasks requiring continuous monitoring or learning.
 * Description: Simulates persistent threads for periodic tasks with state persistence and utility functions for state manipulation.
 * Migrated: 2026-03-25T22:49:34.118Z
 */

// persistentBackgroundThreadSimulator.mjs

import { setInterval, clearInterval } from 'timers';

/**
 * Simulates persistent threads for continuous monitoring or learning tasks.
 * Provides utility functions for managing periodic tasks with state persistence.
 */

let taskRegistry = new Map(); // Stores active tasks and their metadata

/**
 * Registers a new periodic task.
 * @param {string} taskId - Unique identifier for the task.
 * @param {function} taskFunction - Function to execute periodically.
 * @param {number} intervalMs - Interval in milliseconds for execution.
 * @param {object} initialState - Initial state object for the task.
 */
export function registerTask(taskId, taskFunction, intervalMs, initialState = {}) {
  if (taskRegistry.has(taskId)) {
    throw new Error(`Task with ID '${taskId}' is already registered.`);
  }

  let state = { ...initialState };

  const intervalHandle = setInterval(() => {
    try {
      const updatedState = taskFunction(state);
      if (updatedState && typeof updatedState === 'object') {
        state = { ...state, ...updatedState };
      }
    } catch (error) {
      console.error(`Error in task '${taskId}':`, error);
    }
  }, intervalMs);

  taskRegistry.set(taskId, { intervalHandle, state });
}

/**
 * Unregisters a periodic task.
 * @param {string} taskId - Unique identifier for the task.
 */
export function unregisterTask(taskId) {
  const task = taskRegistry.get(taskId);
  if (!task) {
    throw new Error(`Task with ID '${taskId}' is not registered.`);
  }

  clearInterval(task.intervalHandle);
  taskRegistry.delete(taskId);
}

/**
 * Retrieves the current state of a task.
 * @param {string} taskId - Unique identifier for the task.
 * @returns {object} - Current state of the task.
 */
export function getTaskState(taskId) {
  const task = taskRegistry.get(taskId);
  if (!task) {
    throw new Error(`Task with ID '${taskId}' is not registered.`);
  }

  return { ...task.state }; // Return a copy of the state
}

/**
 * Lists all registered tasks.
 * @returns {Array<string>} - Array of task IDs.
 */
export function listTasks() {
  return Array.from(taskRegistry.keys());
}

/**
 * Clears all registered tasks.
 */
export function clearAllTasks() {
  for (const taskId of taskRegistry.keys()) {
    unregisterTask(taskId);
  }
}

/**
 * Example utility function for generic use: Increment a numeric value.
 * @param {object} state - State object containing a numeric value.
 * @param {string} key - Key of the numeric value to increment.
 * @param {number} incrementBy - Amount to increment.
 * @returns {object} - Updated state.
 */
export function incrementStateValue(state, key, incrementBy = 1) {
  if (typeof state[key] !== 'number') {
    throw new Error(`State key '${key}' is not a number.`);
  }

  return { [key]: state[key] + incrementBy };
}

/**
 * Example utility function for generic use: Append to an array in state.
 * @param {object} state - State object containing an array.
 * @param {string} key - Key of the array to append to.
 * @param {*} value - Value to append.
 * @returns {object} - Updated state.
 */
export function appendToStateArray(state, key, value) {
  if (!Array.isArray(state[key])) {
    throw new Error(`State key '${key}' is not an array.`);
  }

  return { [key]: [...state[key], value] };
}

/**
 * Example usage:
 * registerTask('exampleTask', (state) => incrementStateValue(state, 'counter', 1), 1000, { counter: 0 });
 */