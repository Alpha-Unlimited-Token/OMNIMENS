/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: asyncCheckpointExecutor
 * Written: 2026-04-02T15:15:11.927Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// asyncCheckpointExecutor.mjs

import { writeFile, readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';

/**
 * Hash generator for checkpoint filenames.
 * @param {string} input - Input string to hash.
 * @returns {string} - SHA256 hash as a hex string.
 */
export function generateHash(input) {
  return createHash('sha256').update(input).digest('hex');
}

/**
 * Save intermediate state to a checkpoint file.
 * @param {string} checkpointId - Unique identifier for the checkpoint.
 * @param {object} state - Serializable state object.
 * @returns {Promise<void>} - Resolves when the state is saved.
 */
export async function saveCheckpoint(checkpointId, state) {
  const filename = `checkpoint_${generateHash(checkpointId)}.json`;
  const serializedState = JSON.stringify(state);
  await writeFile(filename, serializedState, 'utf8');
}

/**
 * Load intermediate state from a checkpoint file.
 * @param {string} checkpointId - Unique identifier for the checkpoint.
 * @returns {Promise<object|null>} - Resolves to the state object or null if not found.
 */
export async function loadCheckpoint(checkpointId) {
  const filename = `checkpoint_${generateHash(checkpointId)}.json`;
  try {
    const serializedState = await readFile(filename, 'utf8');
    return JSON.parse(serializedState);
  } catch (error) {
    if (error.code === 'ENOENT') {
      return null; // Checkpoint file does not exist.
    }
    throw error; // Rethrow unexpected errors.
  }
}

/**
 * Execute a task iteratively with checkpointing.
 * @param {string} checkpointId - Unique identifier for the checkpoint.
 * @param {function(object): object} taskFunction - Function that processes the state.
 * @param {object} initialState - Initial state object.
 * @param {number} iterations - Total number of iterations.
 * @returns {Promise<object>} - Resolves to the final state after all iterations.
 */
export async function asyncCheckpointExecutor(checkpointId, taskFunction, initialState, iterations) {
  let state = await loadCheckpoint(checkpointId) || initialState;

  for (let i = state.iteration || 0; i < iterations; i++) {
    state = taskFunction(state);
    state.iteration = i + 1; // Track progress.
    await saveCheckpoint(checkpointId, state);
  }

  return state;
}

/**
 * Generic utility function for chunking data.
 * @param {Array} data - Array to chunk.
 * @param {number} chunkSize - Size of each chunk.
 * @returns {Array<Array>} - Array of chunks.
 */
export function chunkArray(data, chunkSize) {
  const chunks = [];
  for (let i = 0; i < data.length; i += chunkSize) {
    chunks.push(data.slice(i, i + chunkSize));
  }
  return chunks;
}

/**
 * Generic utility function for deep cloning objects.
 * @param {object} obj - Object to clone.
 * @returns {object} - Deep cloned object.
 */
export function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}
