/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: subprocessCheckpointing
 * Written: 2026-04-02T14:26:23.371Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// subprocessCheckpointing.mjs
import { writeFile, readFile } from 'fs/promises';
import { createHash } from 'crypto';

/**
 * Save a checkpoint to the persistence layer.
 * @param {string} taskId - Unique identifier for the task.
 * @param {object} state - The current state to save.
 */
export async function saveCheckpoint(taskId, state) {
  const checkpointFile = generateCheckpointFilename(taskId);
  const serializedState = JSON.stringify(state);
  await writeFile(checkpointFile, serializedState, 'utf-8');
}

/**
 * Load the last checkpoint for a given task.
 * @param {string} taskId - Unique identifier for the task.
 * @returns {object|null} - The last saved state or null if no checkpoint exists.
 */
export async function loadCheckpoint(taskId) {
  const checkpointFile = generateCheckpointFilename(taskId);
  try {
    const serializedState = await readFile(checkpointFile, 'utf-8');
    return JSON.parse(serializedState);
  } catch (err) {
    if (err.code === 'ENOENT') return null; // File does not exist
    throw err; // Re-throw other errors
  }
}

/**
 * Generate a unique filename for a task's checkpoint.
 * @param {string} taskId - Unique identifier for the task.
 * @returns {string} - Checkpoint filename.
 */
function generateCheckpointFilename(taskId) {
  const hash = createHash('sha256').update(taskId).digest('hex');
  return `checkpoint_${hash}.json`;
}

/**
 * Execute a long-running task with checkpointing support.
 * @param {string} taskId - Unique identifier for the task.
 * @param {function(object): Promise<object>} taskFunction - The task logic, accepts the current state and returns the next state.
 * @param {number} checkpointInterval - Interval (in milliseconds) to save checkpoints.
 */
export async function executeWithCheckpointing(taskId, taskFunction, checkpointInterval) {
  let state = await loadCheckpoint(taskId) || {};
  let lastCheckpointTime = Date.now();

  while (true) {
    state = await taskFunction(state);

    if (Date.now() - lastCheckpointTime >= checkpointInterval) {
      await saveCheckpoint(taskId, state);
      lastCheckpointTime = Date.now();
    }
  }
}

/**
 * Utility to clear a checkpoint for a task (e.g., after successful completion).
 * @param {string} taskId - Unique identifier for the task.
 */
export async function clearCheckpoint(taskId) {
  const checkpointFile = generateCheckpointFilename(taskId);
  try {
    await writeFile(checkpointFile, '', 'utf-8'); // Overwrite with empty content
  } catch (err) {
    if (err.code !== 'ENOENT') throw err; // Ignore if file doesn't exist
  }
}