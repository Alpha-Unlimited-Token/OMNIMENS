/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: statefulTaskManager
 * Written: 2026-04-03T12:58:34.485Z
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

/**
 * Utility module for managing long-running tasks with stateful checkpoints and seamless resumption.
 * Designed to handle interruptions and allow task segmentation.
 */

// Internal storage for task states
const taskStates = new Map();

/**
 * Generates a unique hash for a given task identifier and input data.
 * @param {string} taskId - A unique identifier for the task.
 * @param {any} input - The input data for the task.
 * @returns {string} A unique hash representing the task state.
 */
export function generateTaskHash(taskId, input) {
  const hash = createHash('sha256');
  hash.update(taskId + JSON.stringify(input));
  return hash.digest('hex');
}

/**
 * Saves the intermediate state of a task.
 * @param {string} taskHash - The unique hash for the task.
 * @param {any} state - The intermediate state to save.
 */
export function saveTaskState(taskHash, state) {
  taskStates.set(taskHash, state);
}

/**
 * Retrieves the intermediate state of a task.
 * @param {string} taskHash - The unique hash for the task.
 * @returns {any} The saved state, or undefined if not found.
 */
export function getTaskState(taskHash) {
  return taskStates.get(taskHash);
}

/**
 * Deletes the saved state of a task.
 * @param {string} taskHash - The unique hash for the task.
 */
export function deleteTaskState(taskHash) {
  taskStates.delete(taskHash);
}

/**
 * Executes a long-running task with checkpointing and resumption.
 * @param {string} taskId - A unique identifier for the task.
 * @param {any} input - The input data for the task.
 * @param {function} taskFunction - The function to execute, which should support checkpointing.
 * @returns {Promise<any>} The result of the task.
 */
export async function executeTask(taskId, input, taskFunction) {
  const taskHash = generateTaskHash(taskId, input);
  let state = getTaskState(taskHash) || { step: 0, result: null };

  try {
    while (!state.completed) {
      state = await taskFunction(state);
      saveTaskState(taskHash, state);
    }

    // Cleanup after task completion
    deleteTaskState(taskHash);
    return state.result;
  } catch (error) {
    console.error(`Task ${taskId} interrupted:`, error);
    throw error;
  }
}

/**
 * Example segmented task function for demonstration purposes.
 * @param {object} state - The current state of the task.
 * @returns {Promise<object>} The updated state after processing the next segment.
 */
export async function exampleTaskFunction(state) {
  const steps = 5; // Total number of steps

  if (state.step >= steps) {
    return { ...state, completed: true };
  }

  // Simulate computation for the current step
  await new Promise((resolve) => setTimeout(resolve, 100));

  return {
    step: state.step + 1,
    result: (state.result || 0) + state.step,
    completed: state.step + 1 >= steps
  };
}

/**
 * Clears all saved task states (useful for testing or resetting).
 */
export function clearAllTaskStates() {
  taskStates.clear();
}
