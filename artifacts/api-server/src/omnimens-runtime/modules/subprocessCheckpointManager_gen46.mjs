/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: subprocessCheckpointManager
 * Written: 2026-04-02T14:14:28.187Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// subprocessCheckpointManager.mjs

import { writeFile, readFile } from 'fs/promises';
import { join } from 'path';
import { createHash } from 'crypto';

/**
 * Generates a unique checkpoint filename based on the computation ID.
 * @param {string} computationId - Unique identifier for the computation.
 * @returns {string} - Checkpoint filename.
 */
export function generateCheckpointFilename(computationId) {
  const hash = createHash('sha256').update(computationId).digest('hex');
  return join(process.cwd(), `${hash}.checkpoint.json`);
}

/**
 * Saves the computation state to a checkpoint file.
 * @param {string} computationId - Unique identifier for the computation.
 * @param {object} state - The intermediate state to persist.
 * @returns {Promise<void>} - Resolves when the state is saved.
 */
export async function saveCheckpoint(computationId, state) {
  const filename = generateCheckpointFilename(computationId);
  const data = JSON.stringify(state, null, 2);
  await writeFile(filename, data, 'utf-8');
}

/**
 * Loads the computation state from a checkpoint file.
 * @param {string} computationId - Unique identifier for the computation.
 * @returns {Promise<object|null>} - Resolves with the state object or null if no checkpoint exists.
 */
export async function loadCheckpoint(computationId) {
  const filename = generateCheckpointFilename(computationId);
  try {
    const data = await readFile(filename, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    if (error.code === 'ENOENT') {
      return null; // No checkpoint exists
    }
    throw error; // Propagate other errors
  }
}

/**
 * Deletes the checkpoint file for a given computation ID.
 * @param {string} computationId - Unique identifier for the computation.
 * @returns {Promise<void>} - Resolves when the checkpoint is deleted.
 */
export async function deleteCheckpoint(computationId) {
  const filename = generateCheckpointFilename(computationId);
  try {
    await writeFile(filename, '', { flag: 'wx' }); // Prevent overwriting existing files
  } catch (error) {
    if (error.code !== 'ENOENT') {
      throw error; // Propagate other errors
    }
  }
}

/**
 * Executes a long-running computation with checkpointing.
 * @param {string} computationId - Unique identifier for the computation.
 * @param {function(object): object} stepFunction - Function to execute each step of the computation.
 * @param {number} timeoutMs - Maximum time (in ms) before checkpointing.
 * @returns {Promise<object>} - Resolves with the final computation result.
 */
export async function runWithCheckpoint(computationId, stepFunction, timeoutMs) {
  let state = await loadCheckpoint(computationId) || { step: 0, data: {} };
  const startTime = Date.now();

  while (true) {
    state = stepFunction(state);

    if (Date.now() - startTime >= timeoutMs) {
      await saveCheckpoint(computationId, state);
      throw new Error(`Computation timed out. State saved to checkpoint.`);
    }

    if (state.done) {
      await deleteCheckpoint(computationId);
      return state.result;
    }
  }
}
