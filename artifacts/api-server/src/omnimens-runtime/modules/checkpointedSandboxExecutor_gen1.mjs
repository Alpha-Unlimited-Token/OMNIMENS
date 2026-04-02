/**
 * OMNIMENS Self-Authored Module (Migrated from DB)
 * Original Source: evolution_cycle_24
 * Name: checkpointedSandboxExecutor
 * Purpose: Enables iterative computations by checkpointing partial progress in subprocesses.
 * Description: Provides a utility to execute iterative computations with periodic checkpointing for state restoration and fault tolerance.
 * Migrated: 2026-04-02T15:02:53.823Z
 */

// checkpointedSandboxExecutor.mjs

import { writeFile, readFile } from 'fs/promises';
import { createHash } from 'crypto';

/**
 * Serialize an object to a JSON string with a stable hash for checkpointing.
 * @param {object} state - The state object to serialize.
 * @returns {{ json: string, hash: string }} - Serialized JSON and its hash.
 */
export function serializeState(state) {
  const json = JSON.stringify(state);
  const hash = createHash('sha256').update(json).digest('hex');
  return { json, hash };
}

/**
 * Save a checkpoint to disk.
 * @param {string} filePath - The file path to save the checkpoint.
 * @param {object} state - The state object to save.
 * @returns {Promise<void>} - Resolves when the checkpoint is saved.
 */
export async function saveCheckpoint(filePath, state) {
  const { json } = serializeState(state);
  await writeFile(filePath, json, 'utf-8');
}

/**
 * Load a checkpoint from disk.
 * @param {string} filePath - The file path to load the checkpoint from.
 * @returns {Promise<object|null>} - The loaded state object or null if the file does not exist.
 */
export async function loadCheckpoint(filePath) {
  try {
    const json = await readFile(filePath, 'utf-8');
    return JSON.parse(json);
  } catch (err) {
    if (err.code === 'ENOENT') return null; // File not found
    throw err; // Re-throw other errors
  }
}

/**
 * Execute a computation with periodic checkpointing.
 * @param {function(object): object} computeStep - A function to compute the next state.
 * @param {object} initialState - The initial state to start from.
 * @param {string} checkpointPath - The file path for checkpointing.
 * @param {number} maxSteps - Maximum number of steps to execute.
 * @param {number} checkpointInterval - Steps between checkpoints.
 * @returns {Promise<object>} - The final state after computation.
 */
export async function checkpointedExecutor(computeStep, initialState, checkpointPath, maxSteps, checkpointInterval) {
  let state = await loadCheckpoint(checkpointPath) || initialState;
  for (let step = 0; step < maxSteps; step++) {
    state = computeStep(state);
    if (step % checkpointInterval === 0) {
      await saveCheckpoint(checkpointPath, state);
    }
  }
  return state;
}

/**
 * Example utility function to reset a checkpoint file.
 * @param {string} filePath - The file path to reset.
 * @returns {Promise<void>} - Resolves when the file is cleared.
 */
export async function resetCheckpoint(filePath) {
  await writeFile(filePath, '', 'utf-8');
}