/**
 * OMNIMENS Self-Authored Module (Migrated from DB)
 * Original Source: evolution_cycle_29
 * Name: persistentSubprocessCheckpoint
 * Purpose: Allows subprocesses to save and restore state for long-running computations.
 * Description: Provides checkpointing for subprocess computations, enabling save and restore of state for incremental execution.
 * Migrated: 2026-04-02T14:50:29.443Z
 */

// persistentSubprocessCheckpoint.mjs

import { writeFile, readFile } from 'fs/promises';
import { resolve } from 'path';

const CHECKPOINT_DIR = resolve('./checkpoints');

/**
 * Saves the state of a subprocess computation to a JSON file.
 * @param {string} id - Unique identifier for the subprocess.
 * @param {object} state - The state object to be serialized and saved.
 * @returns {Promise<void>} Resolves when the state is saved.
 */
export async function saveCheckpoint(id, state) {
  if (typeof id !== 'string' || !id.trim()) {
    throw new Error('Invalid id: must be a non-empty string.');
  }
  if (typeof state !== 'object' || state === null) {
    throw new Error('Invalid state: must be a non-null object.');
  }

  const filePath = resolve(CHECKPOINT_DIR, `${id}.json`);
  const serializedState = JSON.stringify(state);

  await writeFile(filePath, serializedState, 'utf8');
}

/**
 * Restores the state of a subprocess computation from a JSON file.
 * @param {string} id - Unique identifier for the subprocess.
 * @returns {Promise<object>} Resolves to the deserialized state object.
 */
export async function loadCheckpoint(id) {
  if (typeof id !== 'string' || !id.trim()) {
    throw new Error('Invalid id: must be a non-empty string.');
  }

  const filePath = resolve(CHECKPOINT_DIR, `${id}.json`);
  const serializedState = await readFile(filePath, 'utf8');

  return JSON.parse(serializedState);
}

/**
 * Executes a long-running computation incrementally with checkpointing.
 * @param {string} id - Unique identifier for the subprocess.
 * @param {Function} computeStep - Function that performs one computation step and returns updated state.
 * @param {object} initialState - The initial state to start computation from.
 * @param {number} maxSteps - Maximum number of steps to execute.
 * @returns {Promise<object>} Resolves to the final state after computation.
 */
export async function runWithCheckpoint(id, computeStep, initialState, maxSteps) {
  if (typeof computeStep !== 'function') {
    throw new Error('Invalid computeStep: must be a function.');
  }
  if (typeof maxSteps !== 'number' || maxSteps <= 0) {
    throw new Error('Invalid maxSteps: must be a positive number.');
  }

  let state;
  try {
    state = await loadCheckpoint(id);
  } catch {
    state = initialState;
  }

  for (let step = 0; step < maxSteps; step++) {
    state = computeStep(state);
    await saveCheckpoint(id, state);
  }

  return state;
}

/**
 * Deletes a checkpoint file by ID (utility function for cleanup).
 * @param {string} id - Unique identifier for the subprocess.
 * @returns {Promise<void>} Resolves when the checkpoint is deleted.
 */
export async function deleteCheckpoint(id) {
  if (typeof id !== 'string' || !id.trim()) {
    throw new Error('Invalid id: must be a non-empty string.');
  }

  const filePath = resolve(CHECKPOINT_DIR, `${id}.json`);
  await writeFile(filePath, '', { flag: 'w' }); // Overwrite with empty content for safety.
}