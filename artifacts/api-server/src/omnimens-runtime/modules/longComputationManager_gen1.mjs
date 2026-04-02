/**
 * OMNIMENS Self-Authored Module (Migrated from DB)
 * Original Source: evolution_cycle_21
 * Name: longComputationManager
 * Purpose: Manages iterative computations by saving intermediate states and resuming across subprocesses.
 * Description: Manages iterative computations with checkpointing and task queue for resumption across subprocesses.
 * Migrated: 2026-04-02T14:08:14.878Z
 */

// Complete ES module code here

import { createHash } from 'crypto';

// Utility to generate a unique hash for a computation state
export function generateStateHash(state) {
  const hash = createHash('sha256');
  hash.update(JSON.stringify(state));
  return hash.digest('hex');
}

// Task queue to manage computation steps
const taskQueue = [];

// In-memory checkpoint storage
const checkpoints = new Map();

/**
 * Adds a new task to the queue.
 * @param {Function} taskFunction - The function to execute.
 * @param {Object} initialState - Initial state for the task.
 */
export function addTask(taskFunction, initialState) {
  const task = {
    id: generateStateHash(initialState),
    taskFunction,
    state: initialState,
    completed: false
  };
  taskQueue.push(task);
}

/**
 * Saves a checkpoint for a given task.
 * @param {string} taskId - Unique ID of the task.
 * @param {Object} state - Current state to save.
 */
export function saveCheckpoint(taskId, state) {
  checkpoints.set(taskId, state);
}

/**
 * Resumes a task from its last checkpoint.
 * @param {string} taskId - Unique ID of the task.
 * @returns {Object|null} - The last saved state or null if no checkpoint exists.
 */
export function resumeFromCheckpoint(taskId) {
  return checkpoints.get(taskId) || null;
}

/**
 * Executes tasks in the queue iteratively, saving checkpoints after each step.
 * @param {number} maxIterations - Maximum iterations to process in one run.
 */
export async function processTasks(maxIterations = 10) {
  let iterations = 0;

  while (taskQueue.length > 0 && iterations < maxIterations) {
    const task = taskQueue.shift();

    if (task.completed) {
      continue; // Skip completed tasks
    }

    const lastState = resumeFromCheckpoint(task.id) || task.state;

    try {
      const nextState = await task.taskFunction(lastState);

      if (nextState.done) {
        task.completed = true;
      } else {
        saveCheckpoint(task.id, nextState);
        taskQueue.push(task); // Requeue task for further processing
      }
    } catch (error) {
      console.error(`Error processing task ${task.id}:`, error);
    }

    iterations++;
  }
}

/**
 * Clears all checkpoints and tasks (useful for resetting the system).
 */
export function clearAll() {
  taskQueue.length = 0;
  checkpoints.clear();
}

/**
 * Example task function for iterative computation.
 * @param {Object} state - Current state of the computation.
 * @returns {Object} - Next state of the computation.
 */
export async function exampleTaskFunction(state) {
  const { counter, limit } = state;
  const nextCounter = counter + 1;

  return {
    counter: nextCounter,
    limit,
    done: nextCounter >= limit
  };
} 

// Example usage (uncomment to test):
// addTask(exampleTaskFunction, { counter: 0, limit: 5 });
// processTasks();