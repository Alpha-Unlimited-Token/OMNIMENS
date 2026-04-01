/**
 * OMNIMENS Self-Authored Module (Migrated from DB)
 * Original Source: evolution_cycle_21
 * Name: longComputationCheckpointing
 * Purpose: Enables resumable long-running computations within sandbox limits.
 * Description: Enables resumable long-running computations with state checkpointing and restoration using pure algorithms and built-in Node.js modules.
 * Migrated: 2026-04-01T22:23:20.232Z
 */

// longComputationCheckpointing.mjs

import { writeFile, readFile } from 'fs/promises';
import { createHash } from 'crypto';

/**
 * Serialize state to a checkpoint file for resumable computations.
 * @param {string} checkpointId - Unique identifier for the checkpoint.
 * @param {object} state - Current state of the computation.
 * @returns {Promise<void>} Resolves when state is saved.
 */
export async function saveCheckpoint(checkpointId, state) {
  const fileName = `checkpoint_${createHash('sha256').update(checkpointId).digest('hex')}.json`;
  const serializedState = JSON.stringify(state);
  await writeFile(fileName, serializedState, 'utf8');
}

/**
 * Restore state from a checkpoint file.
 * @param {string} checkpointId - Unique identifier for the checkpoint.
 * @returns {Promise<object|null>} Restored state or null if not found.
 */
export async function loadCheckpoint(checkpointId) {
  const fileName = `checkpoint_${createHash('sha256').update(checkpointId).digest('hex')}.json`;
  try {
    const serializedState = await readFile(fileName, 'utf8');
    return JSON.parse(serializedState);
  } catch (error) {
    if (error.code === 'ENOENT') return null; // File not found
    throw error; // Other errors
  }
}

/**
 * Perform a long-running computation with checkpointing.
 * @param {string} checkpointId - Unique identifier for the computation.
 * @param {function(object): boolean} isComplete - Function to check if computation is complete.
 * @param {function(object): object} nextStep - Function to compute the next state.
 * @param {object} initialState - Initial state of the computation.
 * @returns {Promise<object>} Final state of the computation.
 */
export async function resumableComputation(checkpointId, isComplete, nextStep, initialState) {
  let state = await loadCheckpoint(checkpointId) || initialState;

  while (!isComplete(state)) {
    state = nextStep(state);
    await saveCheckpoint(checkpointId, state);
  }

  return state;
}

/**
 * Generic utility: Split a large task into smaller chunks.
 * @param {Array} data - Array of items to process.
 * @param {function(any): any} processItem - Function to process each item.
 * @returns {Array} Array of processed results.
 */
export function chunkedProcessing(data, processItem) {
  return data.map(processItem);
}

/**
 * Generic utility: Periodically log progress during computation.
 * @param {number} current - Current progress value.
 * @param {number} total - Total progress value.
 * @param {number} interval - Interval for logging (e.g., every 10%).
 * @returns {boolean} True if progress was logged.
 */
export function logProgress(current, total, interval) {
  const percentage = Math.floor((current / total) * 100);
  if (percentage % interval === 0) {
    console.log(`Progress: ${percentage}%`);
    return true;
  }
  return false;
}