/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: checkpointedTaskManager
 * Written: 2026-04-02T14:24:52.653Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// checkpointedTaskManager.mjs

import { createHash } from 'crypto';

// In-memory checkpoint storage (simulating persistent memory for simplicity)
const checkpointStore = new Map();

/**
 * Generates a unique hash key for a given task identifier and state.
 * @param {string} taskId - Unique identifier for the task.
 * @param {object} state - Current state of the task.
 * @returns {string} - A unique hash key.
 */
export function generateCheckpointKey(taskId, state) {
  const hash = createHash('sha256');
  hash.update(taskId + JSON.stringify(state));
  return hash.digest('hex');
}

/**
 * Saves the current state of a task to the checkpoint store.
 * @param {string} taskId - Unique identifier for the task.
 * @param {object} state - Current state of the task to checkpoint.
 */
export function saveCheckpoint(taskId, state) {
  const key = generateCheckpointKey(taskId, state);
  checkpointStore.set(key, { taskId, state, timestamp: Date.now() });
}

/**
 * Loads the most recent checkpoint for a given task.
 * @param {string} taskId - Unique identifier for the task.
 * @returns {object|null} - The most recent checkpoint state or null if none exists.
 */
export function loadCheckpoint(taskId) {
  let latestCheckpoint = null;

  for (const [key, value] of checkpointStore.entries()) {
    if (value.taskId === taskId) {
      if (!latestCheckpoint || value.timestamp > latestCheckpoint.timestamp) {
        latestCheckpoint = value;
      }
    }
  }

  return latestCheckpoint ? latestCheckpoint.state : null;
}

/**
 * Executes an iterative task with checkpointing support.
 * @param {string} taskId - Unique identifier for the task.
 * @param {function} taskFunction - Function to execute a single iteration of the task.
 * @param {object} initialState - Initial state for the task.
 * @param {number} maxIterations - Maximum number of iterations to run.
 * @returns {object} - Final state after all iterations.
 */
export async function executeCheckpointedTask(taskId, taskFunction, initialState, maxIterations) {
  let state = loadCheckpoint(taskId) || initialState;

  for (let i = 0; i < maxIterations; i++) {
    try {
      state = await taskFunction(state, i);
      saveCheckpoint(taskId, state);
    } catch (error) {
      console.error(`Error during iteration ${i}:`, error);
      break;
    }
  }

  return state;
}

/**
 * Clears all checkpoints for a specific task.
 * @param {string} taskId - Unique identifier for the task.
 */
export function clearCheckpoints(taskId) {
  for (const [key, value] of checkpointStore.entries()) {
    if (value.taskId === taskId) {
      checkpointStore.delete(key);
    }
  }
}

/**
 * Lists all saved checkpoints for debugging or monitoring purposes.
 * @returns {Array} - An array of all checkpoint metadata.
 */
export function listAllCheckpoints() {
  return Array.from(checkpointStore.values());
}