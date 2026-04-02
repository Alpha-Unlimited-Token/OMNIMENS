/**
 * OMNIMENS Self-Authored Module (Migrated from DB)
 * Original Source: evolution_cycle_20
 * Name: statefulTaskScheduler
 * Purpose: Enable long-running computations by breaking them into smaller, resumable chunks.
 * Description: Implements a stateful task scheduler with resumable computations, priority-based execution, and cross-agent utility.
 * Migrated: 2026-04-02T14:08:14.879Z
 */

// statefulTaskScheduler.mjs

import { randomUUID } from 'crypto';

// Task Queue and State Management
const taskQueue = [];
const taskStates = new Map();

/**
 * Adds a new task to the queue with a given priority.
 * @param {Function} taskFunction - The function representing the task.
 * @param {number} priority - Priority of the task (higher number = higher priority).
 * @returns {string} - Unique ID for the task.
 */
export function addTask(taskFunction, priority = 1) {
  const taskId = randomUUID();
  taskQueue.push({ id: taskId, taskFunction, priority });
  taskQueue.sort((a, b) => b.priority - a.priority); // Sort by priority
  taskStates.set(taskId, { checkpoint: null, status: 'pending' });
  return taskId;
}

/**
 * Executes the next task in the queue.
 * @returns {string|null} - ID of the executed task, or null if queue is empty.
 */
export function executeNextTask() {
  if (taskQueue.length === 0) return null;

  const { id, taskFunction } = taskQueue.shift();
  const state = taskStates.get(id);

  try {
    const result = taskFunction(state.checkpoint);
    if (result && result.checkpoint !== undefined) {
      state.checkpoint = result.checkpoint;
      state.status = 'paused';
      taskQueue.push({ id, taskFunction, priority: 1 }); // Re-add with default priority
    } else {
      state.status = 'completed';
    }
  } catch (error) {
    state.status = 'failed';
    state.error = error.message;
  }

  return id;
}

/**
 * Gets the status of a task by ID.
 * @param {string} taskId - The unique ID of the task.
 * @returns {object|null} - Status object or null if task not found.
 */
export function getTaskStatus(taskId) {
  return taskStates.get(taskId) || null;
}

/**
 * Removes a task from the queue and state management.
 * @param {string} taskId - The unique ID of the task.
 * @returns {boolean} - True if task was removed, false if not found.
 */
export function removeTask(taskId) {
  const index = taskQueue.findIndex(task => task.id === taskId);
  if (index === -1) return false;

  taskQueue.splice(index, 1);
  taskStates.delete(taskId);
  return true;
}

/**
 * Utility function to create a resumable task.
 * @param {Function} stepFunction - Function that performs a single step of the task.
 * @returns {Function} - A task function compatible with the scheduler.
 */
export function createResumableTask(stepFunction) {
  return function (checkpoint) {
    return stepFunction(checkpoint);
  };
}

/**
 * Clears all tasks and their states.
 */
export function clearAllTasks() {
  taskQueue.length = 0;
  taskStates.clear();
}

/**
 * Lists all tasks in the queue.
 * @returns {Array} - Array of task IDs and their priorities.
 */
export function listTasks() {
  return taskQueue.map(task => ({ id: task.id, priority: task.priority }));
}

// Example Task Function
function exampleTask(checkpoint) {
  const progress = checkpoint || 0;
  if (progress < 100) {
    return { checkpoint: progress + 10 }; // Increment progress
  }
  return null; // Task completed
}

// Example Usage
const taskId = addTask(createResumableTask(exampleTask), 5);
executeNextTask();
console.log(getTaskStatus(taskId));