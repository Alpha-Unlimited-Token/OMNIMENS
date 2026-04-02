/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: checkpointedTaskRunner
 * Written: 2026-04-02T15:15:55.276Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// checkpointedTaskRunner.mjs

import { writeFile, readFile } from 'fs/promises';
import { resolve } from 'path';
import { createHash } from 'crypto';

/**
 * Generates a unique hash for a given task and its state.
 * @param {string} taskName - The name of the task.
 * @param {object} state - The current state of the task.
 * @returns {string} A unique hash string.
 */
export function generateCheckpointKey(taskName, state) {
  const hash = createHash('sha256');
  hash.update(taskName + JSON.stringify(state));
  return hash.digest('hex');
}

/**
 * Saves the task state to a checkpoint file.
 * @param {string} checkpointKey - Unique key for the task checkpoint.
 * @param {object} state - The state to be saved.
 * @param {string} [directory='./checkpoints'] - Directory for storing checkpoints.
 * @returns {Promise<void>} Resolves when the state is saved.
 */
export async function saveCheckpoint(checkpointKey, state, directory = './checkpoints') {
  const filePath = resolve(directory, `${checkpointKey}.json`);
  const data = JSON.stringify(state);
  await writeFile(filePath, data, 'utf-8');
}

/**
 * Restores the task state from a checkpoint file.
 * @param {string} checkpointKey - Unique key for the task checkpoint.
 * @param {string} [directory='./checkpoints'] - Directory for storing checkpoints.
 * @returns {Promise<object|null>} Resolves with the state object or null if not found.
 */
export async function restoreCheckpoint(checkpointKey, directory = './checkpoints') {
  const filePath = resolve(directory, `${checkpointKey}.json`);
  try {
    const data = await readFile(filePath, 'utf-8');
    return JSON.parse(data);
  } catch {
    return null; // Return null if the checkpoint does not exist
  }
}

/**
 * Runs a long-running task with checkpointing and resumable execution.
 * @param {string} taskName - The name of the task.
 * @param {object} initialState - The initial state of the task.
 * @param {function(object): Promise<object>} taskFunction - Function to process the task, returns updated state.
 * @param {function(object): boolean} isCompleteFunction - Function to check if the task is complete.
 * @param {string} [directory='./checkpoints'] - Directory for storing checkpoints.
 * @returns {Promise<object>} Resolves with the final state of the task.
 */
export async function checkpointedTaskRunner(taskName, initialState, taskFunction, isCompleteFunction, directory = './checkpoints') {
  let state = initialState;
  const checkpointKey = generateCheckpointKey(taskName, state);

  // Attempt to restore state from a checkpoint
  const restoredState = await restoreCheckpoint(checkpointKey, directory);
  if (restoredState) {
    state = restoredState;
  }

  // Process the task in segments until completion
  while (!isCompleteFunction(state)) {
    state = await taskFunction(state);
    await saveCheckpoint(checkpointKey, state, directory);
  }

  return state;
}

/**
 * Example utility function to split an array into chunks for processing.
 * @param {Array} array - The array to split.
 * @param {number} chunkSize - The size of each chunk.
 * @returns {Array[]} An array of chunks.
 */
export function chunkArray(array, chunkSize) {
  const chunks = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    chunks.push(array.slice(i, i + chunkSize));
  }
  return chunks;
}
