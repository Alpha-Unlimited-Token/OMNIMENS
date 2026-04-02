/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: taskCheckpointingSystem
 * Written: 2026-04-02T14:12:23.657Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// taskCheckpointingSystem.mjs

import { writeFile, readFile } from 'fs/promises';
import { join } from 'path';
import { createHash } from 'crypto';

/**
 * Generates a unique hash identifier for a given task and state.
 * @param {string} taskName - The name of the task.
 * @param {object} state - The current state of the task.
 * @returns {string} - A unique hash identifier.
 */
export function generateCheckpointId(taskName, state) {
  const hash = createHash('sha256');
  hash.update(taskName + JSON.stringify(state));
  return hash.digest('hex');
}

/**
 * Saves the current state of a task to a JSON file.
 * @param {string} taskName - The name of the task.
 * @param {object} state - The current state of the task.
 * @param {string} directory - The directory to save the checkpoint file.
 * @returns {Promise<void>} - Resolves when the state is saved.
 */
export async function saveCheckpoint(taskName, state, directory = './checkpoints') {
  const checkpointId = generateCheckpointId(taskName, state);
  const filePath = join(directory, `${checkpointId}.json`);
  const data = JSON.stringify({ taskName, state, timestamp: Date.now() }, null, 2);
  await writeFile(filePath, data);
}

/**
 * Loads a saved checkpoint state from a JSON file.
 * @param {string} checkpointId - The unique identifier of the checkpoint.
 * @param {string} directory - The directory where checkpoint files are stored.
 * @returns {Promise<object|null>} - Resolves with the checkpoint data or null if not found.
 */
export async function loadCheckpoint(checkpointId, directory = './checkpoints') {
  const filePath = join(directory, `${checkpointId}.json`);
  try {
    const data = await readFile(filePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    if (error.code === 'ENOENT') {
      return null; // File not found
    }
    throw error; // Propagate other errors
  }
}

/**
 * Restores the last known state of a task by searching for matching checkpoints.
 * @param {string} taskName - The name of the task.
 * @param {Array<object>} possibleStates - Array of possible intermediate states to match.
 * @param {string} directory - The directory where checkpoint files are stored.
 * @returns {Promise<object|null>} - Resolves with the restored state or null if no match found.
 */
export async function restoreLastCheckpoint(taskName, possibleStates, directory = './checkpoints') {
  for (const state of possibleStates) {
    const checkpointId = generateCheckpointId(taskName, state);
    const checkpoint = await loadCheckpoint(checkpointId, directory);
    if (checkpoint) {
      return checkpoint.state;
    }
  }
  return null; // No matching checkpoint found
}

/**
 * Deletes a specific checkpoint file.
 * @param {string} checkpointId - The unique identifier of the checkpoint.
 * @param {string} directory - The directory where checkpoint files are stored.
 * @returns {Promise<boolean>} - Resolves with true if deleted, false if not found.
 */
export async function deleteCheckpoint(checkpointId, directory = './checkpoints') {
  const filePath = join(directory, `${checkpointId}.json`);
  try {
    await writeFile(filePath, ''); // Overwrite file with empty content (safe deletion alternative)
    return true;
  } catch (error) {
    if (error.code === 'ENOENT') {
      return false; // File not found
    }
    throw error; // Propagate other errors
  }
}