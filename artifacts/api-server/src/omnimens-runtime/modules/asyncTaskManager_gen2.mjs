/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: asyncTaskManager
 * Written: 2026-04-03T02:43:56.383Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// asyncTaskManager.mjs

import { writeFile, readFile } from 'fs/promises';
import { randomUUID } from 'crypto';

/**
 * Saves the state of a task to a checkpoint file.
 * @param {string} checkpointId - Unique identifier for the checkpoint.
 * @param {object} state - The state to serialize and save.
 * @returns {Promise<void>} Resolves when the state is saved.
 */
export async function saveCheckpoint(checkpointId, state) {
  const filePath = `./${checkpointId}.json`;
  await writeFile(filePath, JSON.stringify(state, null, 2), 'utf8');
}

/**
 * Restores the state of a task from a checkpoint file.
 * @param {string} checkpointId - Unique identifier for the checkpoint.
 * @returns {Promise<object|null>} The restored state, or null if not found.
 */
export async function restoreCheckpoint(checkpointId) {
  const filePath = `./${checkpointId}.json`;
  try {
    const data = await readFile(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    if (error.code === 'ENOENT') return null; // File not found
    throw error; // Other errors
  }
}

/**
 * Runs an asynchronous task with periodic state checkpoints.
 * @param {string} checkpointId - Unique identifier for the checkpoint.
 * @param {function(object): Promise<object>} taskFunction - The task function to execute. Receives the last state.
 * @param {number} checkpointInterval - Interval (in ms) to save state checkpoints.
 * @returns {Promise<object>} Resolves with the final task state.
 */
export async function runTaskWithCheckpoints(checkpointId, taskFunction, checkpointInterval) {
  let state = await restoreCheckpoint(checkpointId) || {};

  const intervalId = setInterval(async () => {
    await saveCheckpoint(checkpointId, state);
  }, checkpointInterval);

  try {
    state = await taskFunction(state);
  } finally {
    clearInterval(intervalId);
    await saveCheckpoint(checkpointId, state); // Final save
  }

  return state;
}

/**
 * Chains multiple asynchronous tasks with state checkpoints.
 * @param {string} checkpointId - Unique identifier for the checkpoint.
 * @param {Array<function(object): Promise<object>>} taskFunctions - Array of task functions to execute sequentially.
 * @param {number} checkpointInterval - Interval (in ms) to save state checkpoints.
 * @returns {Promise<object>} Resolves with the final state after all tasks.
 */
export async function chainTasksWithCheckpoints(checkpointId, taskFunctions, checkpointInterval) {
  let state = await restoreCheckpoint(checkpointId) || {};

  for (const taskFunction of taskFunctions) {
    state = await runTaskWithCheckpoints(checkpointId, taskFunction, checkpointInterval);
  }

  return state;
}

/**
 * Generates a unique checkpoint ID.
 * @returns {string} A unique identifier for a checkpoint.
 */
export function generateCheckpointId() {
  return randomUUID();
}
