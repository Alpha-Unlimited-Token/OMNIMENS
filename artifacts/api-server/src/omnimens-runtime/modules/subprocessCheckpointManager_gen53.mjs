/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: subprocessCheckpointManager
 * Written: 2026-04-02T13:33:52.698Z
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
 * Serializes a given state object and saves it to a persistence layer.
 * @param {string} id - Unique identifier for the subprocess.
 * @param {object} state - The computational state to serialize and save.
 * @param {string} directory - Directory path to store the serialized state.
 * @returns {Promise<string>} - Resolves to the file path of the saved state.
 */
export async function saveState(id, state, directory) {
  const filePath = `${directory}/${id}-${generateHash(state)}.json`;
  const serializedState = JSON.stringify(state);
  await writeFile(filePath, serializedState, 'utf8');
  return filePath;
}

/**
 * Restores a previously saved state from the persistence layer.
 * @param {string} filePath - Path to the serialized state file.
 * @returns {Promise<object>} - Resolves to the deserialized state object.
 */
export async function restoreState(filePath) {
  const serializedState = await readFile(filePath, 'utf8');
  return JSON.parse(serializedState);
}

/**
 * Periodically checkpoints a subprocess state.
 * @param {string} id - Unique identifier for the subprocess.
 * @param {Function} getStateFunction - Function that retrieves the current state of the subprocess.
 * @param {string} directory - Directory path to store the serialized states.
 * @param {number} intervalMs - Interval in milliseconds for checkpointing.
 * @returns {Function} - A function to stop the periodic checkpointing.
 */
export function startCheckpointing(id, getStateFunction, directory, intervalMs) {
  const intervalId = setInterval(async () => {
    try {
      const state = getStateFunction();
      await saveState(id, state, directory);
    } catch (error) {
      console.error(`Error during checkpointing for subprocess ${id}:`, error);
    }
  }, intervalMs);

  return () => clearInterval(intervalId);
}

/**
 * Generates a hash for a given object to ensure unique state file names.
 * @param {object} obj - The object to hash.
 * @returns {string} - A hash string representing the object.
 */
export function generateHash(obj) {
  const hash = createHash('sha256');
  hash.update(JSON.stringify(obj));
  return hash.digest('hex');
}

/**
 * Utility function to validate the integrity of a restored state.
 * @param {object} originalState - The original state object.
 * @param {object} restoredState - The restored state object.
 * @returns {boolean} - True if the states match, false otherwise.
 */
export function validateStateIntegrity(originalState, restoredState) {
  return generateHash(originalState) === generateHash(restoredState);
}
