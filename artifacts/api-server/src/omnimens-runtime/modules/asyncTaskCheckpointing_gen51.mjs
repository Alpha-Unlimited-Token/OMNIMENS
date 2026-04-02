/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: asyncTaskCheckpointing
 * Written: 2026-04-02T14:14:28.212Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// asyncTaskCheckpointing.mjs

import { writeFile, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { createHash } from 'node:crypto';

/**
 * Generates a unique hash for a given state object to ensure checkpoint uniqueness.
 * @param {Object} state - The state object to hash.
 * @returns {string} - A unique hash string.
 */
export function generateStateHash(state) {
  const hash = createHash('sha256');
  hash.update(JSON.stringify(state));
  return hash.digest('hex');
}

/**
 * Saves a serialized state object to a checkpoint file.
 * @param {string} checkpointDir - Directory to save the checkpoint.
 * @param {Object} state - The state object to serialize and save.
 * @returns {Promise<string>} - The file path of the saved checkpoint.
 */
export async function saveCheckpoint(checkpointDir, state) {
  const hash = generateStateHash(state);
  const filePath = join(checkpointDir, `${hash}.json`);
  await writeFile(filePath, JSON.stringify(state), 'utf8');
  return filePath;
}

/**
 * Loads a serialized state object from a checkpoint file.
 * @param {string} filePath - Path to the checkpoint file.
 * @returns {Promise<Object>} - The deserialized state object.
 */
export async function loadCheckpoint(filePath) {
  const data = await readFile(filePath, 'utf8');
  return JSON.parse(data);
}

/**
 * Splits a long-running task into smaller asynchronous chunks and persists intermediate states.
 * @param {Function} taskFunction - The task function to execute iteratively.
 * @param {Object} initialState - The initial state object for the task.
 * @param {string} checkpointDir - Directory for saving checkpoints.
 * @param {Function} completionCondition - Function to check if the task is complete.
 * @returns {Promise<Object>} - The final state after task completion.
 */
export async function runTaskWithCheckpointing(taskFunction, initialState, checkpointDir, completionCondition) {
  let currentState = initialState;

  while (!completionCondition(currentState)) {
    currentState = await taskFunction(currentState);
    await saveCheckpoint(checkpointDir, currentState);
  }

  return currentState;
}

/**
 * Example completion condition for iterative tasks.
 * @param {Object} state - The state object to evaluate.
 * @returns {boolean} - Whether the task is complete.
 */
export function exampleCompletionCondition(state) {
  return state.iterations >= state.maxIterations;
}

/**
 * Example task function for iterative computations.
 * @param {Object} state - The current state object.
 * @returns {Promise<Object>} - The updated state object.
 */
export async function exampleTaskFunction(state) {
  return {
    ...state,
    iterations: state.iterations + 1,
    result: (state.result || 0) + Math.random()
  };
}