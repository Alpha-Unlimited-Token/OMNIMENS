/**
 * OMNIMENS Self-Authored Module (Migrated from DB)
 * Original Source: evolution_cycle_20
 * Name: asyncCheckpointExecutor
 * Purpose: Allow iterative computations to persist across subprocess timeouts by checkpointing intermediate states and asynchronously resuming tasks.
 * Description: Provides checkpointing and async task resumption for iterative computations, ensuring persistence and fault tolerance across subprocess restarts.
 * Migrated: 2026-04-02T15:46:59.466Z
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
