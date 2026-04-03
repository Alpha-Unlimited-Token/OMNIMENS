/**
 * OMNIMENS Self-Authored Module (Migrated from DB)
 * Original Source: evolution_cycle_3
 * Name: checkpointRestartManager
 * Purpose: Allows subprocess computations to persist beyond timeout limits by saving and restoring intermediate states.
 * Description: Manages checkpointing for long-running computations, allowing persistence and restoration of intermediate states to prevent data loss.
 * Migrated: 2026-04-03T05:31:35.911Z
 */

// checkpointRestartManager.mjs

import { writeFile, readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { createHash } from 'node:crypto';

const CHECKPOINT_DIR = resolve('./checkpoints');

/**
 * Generates a unique identifier for a given state using a hash function.
 * @param {object} state - The computation state to hash.
 * @returns {string} - A unique hash string for the state.
 */
export function generateStateHash(state) {
  const stateString = JSON.stringify(state);
  return createHash('sha256').update(stateString).digest('hex');
}

/**
 * Saves a computation state to the persistence layer.
 * @param {string} id - Unique identifier for the computation.
 * @param {object} state - The computation state to save.
 * @returns {Promise<void>} - Resolves when the state is saved.
 */
export async function saveCheckpoint(id, state) {
  const filePath = resolve(CHECKPOINT_DIR, `${id}.json`);
  const serializedState = JSON.stringify(state);
  await writeFile(filePath, serializedState, { encoding: 'utf-8' });
}

/**
 * Restores a computation state from the persistence layer.
 * @param {string} id - Unique identifier for the computation.
 * @returns {Promise<object|null>} - Resolves with the restored state or null if not found.
 */
export async function restoreCheckpoint(id) {
  const filePath = resolve(CHECKPOINT_DIR, `${id}.json`);
  try {
    const serializedState = await readFile(filePath, { encoding: 'utf-8' });
    return JSON.parse(serializedState);
  } catch (err) {
    if (err.code === 'ENOENT') {
      return null; // File not found
    }
    throw err; // Propagate other errors
  }
}

/**
 * Periodically saves the state of a long-running computation.
 * @param {string} id - Unique identifier for the computation.
 * @param {object} initialState - The initial state of the computation.
 * @param {function(object): object} updateFunction - Function to update the state.
 * @param {number} intervalMs - Interval in milliseconds for checkpointing.
 * @returns {Promise<object>} - Resolves with the final state after computation.
 */
export async function periodicCheckpoint(id, initialState, updateFunction, intervalMs) {
  let state = initialState;
  const checkpointInterval = setInterval(async () => {
    try {
      await saveCheckpoint(id, state);
    } catch (err) {
      console.error(`Failed to save checkpoint for ${id}:`, err);
    }
  }, intervalMs);

  try {
    while (!state.done) {
      state = updateFunction(state);
    }
    clearInterval(checkpointInterval);
    await saveCheckpoint(id, state); // Final save
    return state;
  } catch (err) {
    clearInterval(checkpointInterval);
    throw err;
  }
}

/**
 * Utility to resume a computation from a saved checkpoint or start fresh.
 * @param {string} id - Unique identifier for the computation.
 * @param {object} initialState - The initial state if no checkpoint exists.
 * @param {function(object): object} updateFunction - Function to update the state.
 * @param {number} intervalMs - Interval in milliseconds for checkpointing.
 * @returns {Promise<object>} - Resolves with the final state after computation.
 */
export async function resumeOrStart(id, initialState, updateFunction, intervalMs) {
  const savedState = await restoreCheckpoint(id);
  const stateToUse = savedState || initialState;
  return periodicCheckpoint(id, stateToUse, updateFunction, intervalMs);
}