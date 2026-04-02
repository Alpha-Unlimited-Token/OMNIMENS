/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: checkpointedComputationManager
 * Written: 2026-04-02T14:24:53.126Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// checkpointedComputationManager.mjs

import { writeFile, readFile } from 'fs/promises';
import { createHash } from 'crypto';

/**
 * Generates a unique checkpoint file name based on a computation ID.
 * @param {string} computationId - Unique identifier for the computation.
 * @returns {string} - Checkpoint file name.
 */
export function generateCheckpointFileName(computationId) {
  const hash = createHash('sha256').update(computationId).digest('hex');
  return `checkpoint_${hash}.json`;
}

/**
 * Saves a computation state to persistent storage.
 * @param {string} computationId - Unique identifier for the computation.
 * @param {object} state - The intermediate state to save.
 * @returns {Promise<void>} - Resolves when the state is saved.
 */
export async function saveCheckpoint(computationId, state) {
  const fileName = generateCheckpointFileName(computationId);
  const serializedState = JSON.stringify(state);
  await writeFile(fileName, serializedState, 'utf8');
}

/**
 * Loads a computation state from persistent storage.
 * @param {string} computationId - Unique identifier for the computation.
 * @returns {Promise<object|null>} - Resolves with the state or null if no checkpoint exists.
 */
export async function loadCheckpoint(computationId) {
  const fileName = generateCheckpointFileName(computationId);
  try {
    const serializedState = await readFile(fileName, 'utf8');
    return JSON.parse(serializedState);
  } catch (error) {
    if (error.code === 'ENOENT') {
      return null; // No checkpoint exists
    }
    throw error; // Rethrow unexpected errors
  }
}

/**
 * Executes a long-running computation with checkpointing.
 * @param {string} computationId - Unique identifier for the computation.
 * @param {function(object): object} stepFunction - Function to compute the next state.
 * @param {object} initialState - Initial state of the computation.
 * @param {number} maxSteps - Maximum number of steps to execute.
 * @returns {Promise<object>} - Resolves with the final state.
 */
export async function runCheckpointedComputation(computationId, stepFunction, initialState, maxSteps) {
  let state = await loadCheckpoint(computationId) || initialState;

  for (let step = 0; step < maxSteps; step++) {
    state = stepFunction(state);
    await saveCheckpoint(computationId, state);
  }

  return state;
}

/**
 * Utility function to clear checkpoints (e.g., after computation completes).
 * @param {string} computationId - Unique identifier for the computation.
 * @returns {Promise<void>} - Resolves when the checkpoint file is deleted.
 */
export async function clearCheckpoint(computationId) {
  const fileName = generateCheckpointFileName(computationId);
  try {
    await writeFile(fileName, ''); // Overwrite with empty content
  } catch (error) {
    if (error.code !== 'ENOENT') {
      throw error; // Ignore missing file, rethrow other errors
    }
  }
}
