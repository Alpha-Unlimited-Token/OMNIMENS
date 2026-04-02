/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: iterativeProcessManager
 * Written: 2026-04-02T14:17:45.884Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// iterativeProcessManager.mjs

import { writeFile, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { createHash } from 'node:crypto';

/**
 * Generates a hash for a given string input (used for unique checkpoint filenames).
 * @param {string} input - The input string to hash.
 * @returns {string} - A unique hash string.
 */
export function generateHash(input) {
  return createHash('sha256').update(input).digest('hex');
}

/**
 * Saves the current state of an iterative process to a checkpoint file.
 * @param {string} processId - Unique identifier for the process.
 * @param {object} state - The current state of the process to save.
 * @param {string} [directory='./checkpoints'] - Directory to store checkpoint files.
 * @returns {Promise<void>} - Resolves when the state is saved.
 */
export async function saveCheckpoint(processId, state, directory = './checkpoints') {
  const filePath = join(directory, `${processId}.json`);
  const data = JSON.stringify(state);
  await writeFile(filePath, data, 'utf-8');
}

/**
 * Loads the saved state of an iterative process from a checkpoint file.
 * @param {string} processId - Unique identifier for the process.
 * @param {string} [directory='./checkpoints'] - Directory to retrieve checkpoint files.
 * @returns {Promise<object|null>} - Resolves with the saved state, or null if no checkpoint exists.
 */
export async function loadCheckpoint(processId, directory = './checkpoints') {
  try {
    const filePath = join(directory, `${processId}.json`);
    const data = await readFile(filePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    if (error.code === 'ENOENT') {
      return null; // No checkpoint file exists
    }
    throw error; // Re-throw other errors
  }
}

/**
 * Runs an iterative process with automatic checkpointing and resumption.
 * @param {string} processId - Unique identifier for the process.
 * @param {function(object): Promise<object>} iterationFunction - Function to execute each iteration.
 * @param {object} initialState - Initial state to start the process.
 * @param {number} maxIterations - Maximum number of iterations to run.
 * @param {string} [directory='./checkpoints'] - Directory to store/retrieve checkpoints.
 * @returns {Promise<object>} - Resolves with the final state after completion.
 */
export async function runIterativeProcess(processId, iterationFunction, initialState, maxIterations, directory = './checkpoints') {
  let state = await loadCheckpoint(processId, directory) || initialState;
  for (let i = state.iteration || 0; i < maxIterations; i++) {
    state.iteration = i;
    state = await iterationFunction(state);
    await saveCheckpoint(processId, state, directory);
  }
  return state;
}

/**
 * Utility function to clear a checkpoint file (useful for resetting a process).
 * @param {string} processId - Unique identifier for the process.
 * @param {string} [directory='./checkpoints'] - Directory containing checkpoint files.
 * @returns {Promise<void>} - Resolves when the checkpoint is cleared.
 */
export async function clearCheckpoint(processId, directory = './checkpoints') {
  const filePath = join(directory, `${processId}.json`);
  try {
    await writeFile(filePath, '', 'utf-8');
  } catch (error) {
    if (error.code !== 'ENOENT') {
      throw error; // Ignore file not found, re-throw other errors
    }
  }
}