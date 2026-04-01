/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: subprocessCheckpointManager
 * Written: 2026-04-01T22:05:42.748Z
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
import { createHash } from 'crypto';

/**
 * Generates a unique hash for a given state object.
 * @param {Object} state - The state object to hash.
 * @returns {string} - A unique hash string.
 */
export function generateStateHash(state) {
  const stateString = JSON.stringify(state);
  return createHash('sha256').update(stateString).digest('hex');
}

/**
 * Saves a checkpoint to disk.
 * @param {string} checkpointId - Unique identifier for the checkpoint.
 * @param {Object} state - The state object to save.
 * @returns {Promise<void>} - Resolves when the checkpoint is saved.
 */
export async function saveCheckpoint(checkpointId, state) {
  const filePath = `./${checkpointId}.json`;
  const stateString = JSON.stringify(state);
  await writeFile(filePath, stateString, 'utf-8');
}

/**
 * Restores a checkpoint from disk.
 * @param {string} checkpointId - Unique identifier for the checkpoint.
 * @returns {Promise<Object|null>} - Resolves to the restored state or null if not found.
 */
export async function restoreCheckpoint(checkpointId) {
  const filePath = `./${checkpointId}.json`;
  try {
    const stateString = await readFile(filePath, 'utf-8');
    return JSON.parse(stateString);
  } catch (error) {
    if (error.code === 'ENOENT') {
      return null; // Checkpoint not found
    }
    throw error; // Re-throw other errors
  }
}

/**
 * Executes a computation with periodic checkpointing.
 * @param {Function} computationFunction - The function performing the computation.
 * @param {Object} initialState - The initial state for the computation.
 * @param {number} checkpointInterval - Interval (in milliseconds) to save checkpoints.
 * @param {string} checkpointId - Unique identifier for the checkpoint.
 * @returns {Promise<Object>} - Resolves to the final state after computation.
 */
export async function executeWithCheckpointing(computationFunction, initialState, checkpointInterval, checkpointId) {
  let state = await restoreCheckpoint(checkpointId) || initialState;
  let lastCheckpointTime = Date.now();

  while (!state.isComplete) {
    state = computationFunction(state);

    // Periodically save checkpoints
    if (Date.now() - lastCheckpointTime >= checkpointInterval) {
      await saveCheckpoint(checkpointId, state);
      lastCheckpointTime = Date.now();
    }
  }

  // Save final state
  await saveCheckpoint(checkpointId, state);
  return state;
}

/**
 * Example computation function for testing purposes.
 * @param {Object} state - The current state.
 * @returns {Object} - The updated state.
 */
export function exampleComputationFunction(state) {
  state.counter = (state.counter || 0) + 1;
  state.isComplete = state.counter >= 10;
  return state;
}

/**
 * Deletes a checkpoint file (useful for cleanup after tests or successful runs).
 * @param {string} checkpointId - Unique identifier for the checkpoint.
 * @returns {Promise<void>} - Resolves when the file is deleted.
 */
export async function deleteCheckpoint(checkpointId) {
  const filePath = `./${checkpointId}.json`;
  try {
    await unlink(filePath);
  } catch (error) {
    if (error.code !== 'ENOENT') {
      throw error; // Ignore file-not-found errors
    }
  }
}