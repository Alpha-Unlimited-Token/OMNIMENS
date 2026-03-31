/**
 * OMNIMENS Self-Authored Module (Migrated from DB)
 * Original Source: evolution_cycle_1
 * Name: persistentTaskManager
 * Purpose: Simulates persistent background computation by breaking tasks into resumable chunks and storing intermediate states.
 * Description: Simulates persistent background computation via resumable tasks with checkpointing and state persistence in memory.
 * Migrated: 2026-03-25T22:49:34.130Z
 */

// Complete ES module code here

import { createHash } from 'crypto';

// In-memory storage for task states
const taskStateStore = new Map();

/**
 * Generates a unique hash for a given task.
 * @param {string} taskName - Name of the task.
 * @param {object} taskData - Data associated with the task.
 * @returns {string} - Unique hash identifier for the task.
 */
export function generateTaskId(taskName, taskData) {
  const hash = createHash('sha256');
  hash.update(taskName + JSON.stringify(taskData));
  return hash.digest('hex');
}

/**
 * Adds a new task to the queue.
 * @param {string} taskId - Unique identifier for the task.
 * @param {object} taskData - Data associated with the task.
 * @param {function} taskFunction - Function to execute the task.
 */
export function addTask(taskId, taskData, taskFunction) {
  if (taskStateStore.has(taskId)) {
    throw new Error('Task with this ID already exists.');
  }
  taskStateStore.set(taskId, {
    taskData,
    taskFunction,
    progress: 0,
    completed: false
  });
}

/**
 * Executes a chunk of a task and updates its state.
 * @param {string} taskId - Unique identifier for the task.
 * @param {number} chunkSize - Size of the chunk to execute.
 */
export function executeTaskChunk(taskId, chunkSize) {
  const taskState = taskStateStore.get(taskId);
  if (!taskState) {
    throw new Error('Task not found.');
  }
  if (taskState.completed) {
    throw new Error('Task already completed.');
  }

  const { taskData, taskFunction, progress } = taskState;
  const newProgress = Math.min(progress + chunkSize, 100);

  // Execute task chunk
  taskFunction(taskData, progress, newProgress);

  // Update task state
  taskState.progress = newProgress;
  if (newProgress === 100) {
    taskState.completed = true;
  }
}

/**
 * Retrieves the current state of a task.
 * @param {string} taskId - Unique identifier for the task.
 * @returns {object} - Current state of the task.
 */
export function getTaskState(taskId) {
  const taskState = taskStateStore.get(taskId);
  if (!taskState) {
    throw new Error('Task not found.');
  }
  return {
    progress: taskState.progress,
    completed: taskState.completed
  };
}

/**
 * Removes a task from the queue.
 * @param {string} taskId - Unique identifier for the task.
 */
export function removeTask(taskId) {
  if (!taskStateStore.has(taskId)) {
    throw new Error('Task not found.');
  }
  taskStateStore.delete(taskId);
}

/**
 * Lists all active tasks.
 * @returns {Array<string>} - Array of task IDs.
 */
export function listTasks() {
  return Array.from(taskStateStore.keys());
}
