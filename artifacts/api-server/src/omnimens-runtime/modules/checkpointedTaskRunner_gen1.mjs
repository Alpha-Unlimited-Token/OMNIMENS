/**
 * OMNIMENS Self-Authored Module (Migrated from DB)
 * Original Source: evolution_cycle_7
 * Name: checkpointedTaskRunner
 * Purpose: Enable resumable long-running computations by checkpointing intermediate states.
 * Description: Enables resumable long-running computations by checkpointing intermediate states for persistence and task resumption.
 * Migrated: 2026-04-02T14:08:14.882Z
 */

// checkpointedTaskRunner.mjs

import { writeFile, readFile } from 'fs/promises';
import { join } from 'path';
import { createHash } from 'crypto';

/**
 * Serialize an object to a string for checkpointing.
 * @param {object} state - The state object to serialize.
 * @returns {string} Serialized JSON string.
 */
export function serializeState(state) {
  return JSON.stringify(state);
}

/**
 * Deserialize a string back to an object.
 * @param {string} serializedState - The serialized JSON string.
 * @returns {object} Deserialized state object.
 */
export function deserializeState(serializedState) {
  return JSON.parse(serializedState);
}

/**
 * Generate a hash for a task identifier based on its name.
 * @param {string} taskName - The name of the task.
 * @returns {string} A unique hash string.
 */
export function generateTaskHash(taskName) {
  return createHash('sha256').update(taskName).digest('hex');
}

/**
 * Save a checkpointed state to disk.
 * @param {string} taskName - The name of the task.
 * @param {object} state - The state object to checkpoint.
 * @param {string} checkpointDir - Directory to save the checkpoint file.
 */
export async function saveCheckpoint(taskName, state, checkpointDir) {
  const filePath = join(checkpointDir, `${generateTaskHash(taskName)}.json`);
  const serializedState = serializeState(state);
  await writeFile(filePath, serializedState, 'utf-8');
}

/**
 * Load a checkpointed state from disk.
 * @param {string} taskName - The name of the task.
 * @param {string} checkpointDir - Directory to load the checkpoint file from.
 * @returns {object|null} The deserialized state object, or null if not found.
 */
export async function loadCheckpoint(taskName, checkpointDir) {
  const filePath = join(checkpointDir, `${generateTaskHash(taskName)}.json`);
  try {
    const serializedState = await readFile(filePath, 'utf-8');
    return deserializeState(serializedState);
  } catch (error) {
    if (error.code === 'ENOENT') {
      return null; // File not found
    }
    throw error;
  }
}

/**
 * Run a long-running task with checkpointing.
 * @param {string} taskName - The name of the task.
 * @param {string} checkpointDir - Directory to save/load checkpoints.
 * @param {function} taskFunction - The function representing the task.
 * @param {function} progressCallback - Callback to report progress.
 */
export async function checkpointedTaskRunner(taskName, checkpointDir, taskFunction, progressCallback) {
  let state = await loadCheckpoint(taskName, checkpointDir);

  if (!state) {
    state = { step: 0 }; // Initialize state if no checkpoint exists
  }

  while (true) {
    const { done, nextState } = await taskFunction(state);
    progressCallback(state);

    if (done) {
      break;
    }

    state = nextState;
    await saveCheckpoint(taskName, state, checkpointDir);
  }
}

/**
 * Example task function for demonstration purposes.
 * @param {object} state - Current state of the task.
 * @returns {object} Object containing `done` and `nextState`.
 */
export async function exampleTaskFunction(state) {
  const maxSteps = 10;
  const nextStep = state.step + 1;

  return {
    done: nextStep >= maxSteps,
    nextState: { step: nextStep }
  };
}

/**
 * Example progress callback for demonstration purposes.
 * @param {object} state - Current state of the task.
 */
export function exampleProgressCallback(state) {
  console.log(`Progress: Step ${state.step}`);
}