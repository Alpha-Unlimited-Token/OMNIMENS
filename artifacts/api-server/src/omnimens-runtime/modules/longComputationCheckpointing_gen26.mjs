/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: longComputationCheckpointing
 * Written: 2026-04-02T15:15:41.708Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// longComputationCheckpointing.mjs

import { writeFile, readFile } from 'fs/promises';
import { createHash } from 'crypto';
import { resolve } from 'path';

/**
 * Generates a unique hash for a given state object.
 * @param {object} state - The state object to hash.
 * @returns {string} - A unique hash string.
 */
export function generateStateHash(state) {
  const hash = createHash('sha256');
  hash.update(JSON.stringify(state));
  return hash.digest('hex');
}

/**
 * Saves the computation state to a file.
 * @param {string} checkpointDir - Directory to save the checkpoint.
 * @param {object} state - The state object to save.
 * @returns {Promise<string>} - The file path of the saved checkpoint.
 */
export async function saveCheckpoint(checkpointDir, state) {
  const stateHash = generateStateHash(state);
  const filePath = resolve(checkpointDir, `${stateHash}.json`);
  const serializedState = JSON.stringify(state);
  await writeFile(filePath, serializedState, 'utf8');
  return filePath;
}

/**
 * Loads the computation state from a file.
 * @param {string} filePath - The file path of the saved checkpoint.
 * @returns {Promise<object>} - The deserialized state object.
 */
export async function loadCheckpoint(filePath) {
  const serializedState = await readFile(filePath, 'utf8');
  return JSON.parse(serializedState);
}

/**
 * Periodically checkpoints a long-running computation.
 * @param {Function} computeStep - A function that performs one computation step and returns the updated state.
 * @param {object} initialState - The initial state of the computation.
 * @param {string} checkpointDir - Directory to save checkpoints.
 * @param {number} checkpointInterval - Number of steps between checkpoints.
 * @returns {Promise<object>} - The final state after computation.
 */
export async function runWithCheckpointing(computeStep, initialState, checkpointDir, checkpointInterval) {
  let state = initialState;
  let step = 0;

  while (true) {
    state = computeStep(state);
    step++;

    if (step % checkpointInterval === 0) {
      await saveCheckpoint(checkpointDir, state);
    }

    if (state.done) {
      break;
    }
  }

  return state;
}

/**
 * Resumes a computation from the latest checkpoint or starts fresh if none exist.
 * @param {Function} computeStep - A function that performs one computation step and returns the updated state.
 * @param {object} initialState - The initial state of the computation.
 * @param {string} checkpointDir - Directory to save/load checkpoints.
 * @param {number} checkpointInterval - Number of steps between checkpoints.
 * @returns {Promise<object>} - The final state after computation.
 */
export async function resumeOrStartComputation(computeStep, initialState, checkpointDir, checkpointInterval) {
  let state = initialState;

  try {
    const stateHash = generateStateHash(initialState);
    const filePath = resolve(checkpointDir, `${stateHash}.json`);
    state = await loadCheckpoint(filePath);
  } catch {
    // No valid checkpoint found, start fresh
  }

  return runWithCheckpointing(computeStep, state, checkpointDir, checkpointInterval);
}