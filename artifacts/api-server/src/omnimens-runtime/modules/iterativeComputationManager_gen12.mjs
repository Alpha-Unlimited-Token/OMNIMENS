/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: iterativeComputationManager
 * Written: 2026-04-02T15:05:00.018Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// iterativeComputationManager.mjs
import { writeFile, readFile } from 'fs/promises';
import { createHash } from 'crypto';

/**
 * Generates a unique checkpoint filename based on a computation ID.
 * @param {string} computationId - Unique ID for the computation.
 * @returns {string} - Checkpoint filename.
 */
export function generateCheckpointFilename(computationId) {
  const hash = createHash('sha256').update(computationId).digest('hex');
  return `checkpoint_${hash}.json`;
}

/**
 * Saves the current state of a computation to a persistence layer.
 * @param {string} computationId - Unique ID for the computation.
 * @param {object} state - Current state to save.
 * @returns {Promise<void>} - Resolves when the state is saved.
 */
export async function saveCheckpoint(computationId, state) {
  const filename = generateCheckpointFilename(computationId);
  const data = JSON.stringify(state);
  await writeFile(filename, data, 'utf8');
}

/**
 * Loads a previously saved computation state from the persistence layer.
 * @param {string} computationId - Unique ID for the computation.
 * @returns {Promise<object|null>} - The loaded state, or null if not found.
 */
export async function loadCheckpoint(computationId) {
  const filename = generateCheckpointFilename(computationId);
  try {
    const data = await readFile(filename, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    if (error.code === 'ENOENT') return null; // File not found
    throw error; // Re-throw other errors
  }
}

/**
 * Executes an iterative computation with checkpointing.
 * @param {string} computationId - Unique ID for the computation.
 * @param {function(object): { state, done}} iterationFunction - Function to execute each iteration.
 * @param {number} maxIterations - Maximum number of iterations to perform.
 * @returns {Promise<object>} - Final state after computation.
 */
export async function runIterativeComputation(computationId, iterationFunction, maxIterations = 1000) {
  let state = await loadCheckpoint(computationId) || { iteration: 0, data: {} };

  while (state.iteration < maxIterations) {
    const result = iterationFunction(state);
    state = { ...state, ...result.state, iteration: state.iteration + 1 };

    if (result.done) break;

    await saveCheckpoint(computationId, state);
  }

  return state;
}

/**
 * Utility function to clear a checkpoint file (e.g., after successful computation).
 * @param {string} computationId - Unique ID for the computation.
 * @returns {Promise<void>} - Resolves when the checkpoint is cleared.
 */
export async function clearCheckpoint(computationId) {
  const filename = generateCheckpointFilename(computationId);
  try {
    await writeFile(filename, '', 'utf8'); // Overwrite with empty content
  } catch (error) {
    if (error.code !== 'ENOENT') throw error; // Ignore if file doesn't exist
  }
}