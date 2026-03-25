/**
 * OMNIMENS Self-Authored Module (Migrated from DB)
 * Original Source: evolution_cycle_1
 * Name: checkpointingComputationManager
 * Purpose: Manages intermediate state saving and resumption for iterative computations exceeding subprocess timeouts.
 * Description: Manages iterative computations by saving and resuming intermediate states to handle long-running tasks and subprocess timeouts.
 * Migrated: 2026-03-25T22:49:34.109Z
 */

// checkpointingComputationManager.mjs
import { writeFile, readFile } from 'fs/promises';
import { createHash } from 'crypto';
import { resolve } from 'path';

const CHECKPOINT_DIR = resolve('./checkpoints');

/**
 * Generates a unique hash-based filename for a checkpoint.
 * @param {string} computationId - Unique identifier for the computation.
 * @returns {string} - Unique checkpoint filename.
 */
export function generateCheckpointFilename(computationId) {
  const hash = createHash('sha256').update(computationId).digest('hex');
  return resolve(CHECKPOINT_DIR, `${hash}.json`);
}

/**
 * Saves the current computation state to a checkpoint file.
 * @param {string} computationId - Unique identifier for the computation.
 * @param {object} state - The state object to save.
 * @returns {Promise<void>} - Resolves when the state is saved successfully.
 */
export async function saveCheckpoint(computationId, state) {
  const filename = generateCheckpointFilename(computationId);
  const data = JSON.stringify(state);
  await writeFile(filename, data, 'utf8');
}

/**
 * Loads the last saved computation state from a checkpoint file.
 * @param {string} computationId - Unique identifier for the computation.
 * @returns {Promise<object|null>} - Resolves with the state object or null if no checkpoint exists.
 */
export async function loadCheckpoint(computationId) {
  const filename = generateCheckpointFilename(computationId);
  try {
    const data = await readFile(filename, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    if (err.code === 'ENOENT') {
      return null; // No checkpoint found
    }
    throw err; // Rethrow other errors
  }
}

/**
 * Manages iterative computations, periodically saving state and resuming if interrupted.
 * @param {string} computationId - Unique identifier for the computation.
 * @param {function(object): Promise<object>} computationStep - Async function performing one computation step.
 * @param {object} initialState - Initial state to start the computation.
 * @param {number} checkpointInterval - Number of steps between checkpoints.
 * @returns {Promise<object>} - Resolves with the final computation state.
 */
export async function manageComputation(computationId, computationStep, initialState, checkpointInterval = 10) {
  let state = await loadCheckpoint(computationId) || initialState;
  let stepCount = state.stepCount || 0;

  while (!state.done) {
    state = await computationStep(state);
    stepCount++;
    state.stepCount = stepCount;

    if (stepCount % checkpointInterval === 0) {
      await saveCheckpoint(computationId, state);
    }
  }

  await saveCheckpoint(computationId, state); // Final save
  return state;
}

/**
 * Example computation step function for testing.
 * @param {object} state - Current computation state.
 * @returns {Promise<object>} - Next state.
 */
export async function exampleComputationStep(state) {
  const { current, target } = state;
  const next = current + 1;
  return {
    current: next,
    target,
    done: next >= target
  };
}