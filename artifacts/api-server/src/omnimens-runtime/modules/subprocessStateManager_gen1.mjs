/**
 * OMNIMENS Self-Authored Module (Migrated from DB)
 * Original Source: evolution_cycle_9
 * Name: subprocessStateManager
 * Purpose: Allows iterative computations by serializing and restoring state across subprocess executions.
 * Description: A utility module for serializing, restoring, and iteratively processing state across subprocess executions in Node.js.
 * Migrated: 2026-04-01T22:23:20.238Z
 */

// subprocessStateManager.mjs

import { writeFile, readFile } from 'fs/promises';
import { createHash } from 'crypto';

/**
 * Serializes a given state object to a JSON file with a unique hash-based filename.
 * @param {Object} state - The state object to serialize.
 * @param {string} directory - Directory where the state file will be stored.
 * @returns {Promise<string>} - Resolves to the filename of the saved state.
 */
export async function saveState(state, directory) {
  if (typeof state !== 'object' || state === null) {
    throw new TypeError('State must be a non-null object.');
  }

  const stateString = JSON.stringify(state);
  const hash = createHash('sha256').update(stateString).digest('hex');
  const filename = `${directory}/state_${hash}.json`;

  await writeFile(filename, stateString, 'utf8');
  return filename;
}

/**
 * Restores a state object from a JSON file.
 * @param {string} filename - The filename of the state file to restore.
 * @returns {Promise<Object>} - Resolves to the restored state object.
 */
export async function restoreState(filename) {
  const fileContent = await readFile(filename, 'utf8');
  return JSON.parse(fileContent);
}

/**
 * Computes the next state based on a user-defined state transition function.
 * @param {Object} currentState - The current state object.
 * @param {Function} transitionFunction - A pure function that computes the next state.
 * @returns {Object} - The next state object.
 */
export function computeNextState(currentState, transitionFunction) {
  if (typeof transitionFunction !== 'function') {
    throw new TypeError('transitionFunction must be a function.');
  }

  return transitionFunction(currentState);
}

/**
 * Iteratively processes states by saving, restoring, and transitioning them.
 * @param {Object} initialState - The initial state object.
 * @param {Function} transitionFunction - A pure function that computes the next state.
 * @param {number} iterations - Number of iterations to perform.
 * @param {string} directory - Directory where state files will be stored.
 * @returns {Promise<Object>} - Resolves to the final state after all iterations.
 */
export async function processStatesIteratively(initialState, transitionFunction, iterations, directory) {
  let currentState = initialState;

  for (let i = 0; i < iterations; i++) {
    const filename = await saveState(currentState, directory);
    currentState = computeNextState(currentState, transitionFunction);

    // Optionally restore to verify integrity (can be omitted for performance)
    const restoredState = await restoreState(filename);
    if (JSON.stringify(restoredState) !== JSON.stringify(currentState)) {
      throw new Error('State integrity check failed. Restored state does not match expected state.');
    }
  }

  return currentState;
}

/**
 * Generates a unique hash for a given state object.
 * @param {Object} state - The state object to hash.
 * @returns {string} - The unique hash string.
 */
export function generateStateHash(state) {
  if (typeof state !== 'object' || state === null) {
    throw new TypeError('State must be a non-null object.');
  }

  const stateString = JSON.stringify(state);
  return createHash('sha256').update(stateString).digest('hex');
}
