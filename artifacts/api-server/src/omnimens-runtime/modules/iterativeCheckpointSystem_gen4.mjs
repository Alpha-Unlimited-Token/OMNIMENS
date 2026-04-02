/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: iterativeCheckpointSystem
 * Written: 2026-04-02T17:57:10.592Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// iterativeCheckpointSystem.mjs

import { writeFile, readFile } from 'fs/promises';
import { createHash } from 'crypto';

/**
 * Serialize an object to a JSON string and hash it for integrity.
 * @param {Object} state - The state object to serialize.
 * @returns {Object} - Contains serialized state and its hash.
 */
export function serializeState(state) {
  const serialized = JSON.stringify(state);
  const hash = createHash('sha256').update(serialized).digest('hex');
  return { serialized, hash };
}

/**
 * Deserialize a JSON string back into an object and verify its integrity.
 * @param {string} serialized - The serialized JSON string.
 * @param {string} hash - The hash to verify integrity.
 * @returns {Object|null} - Returns the deserialized object or null if hash fails.
 */
export function deserializeState(serialized, hash) {
  const calculatedHash = createHash('sha256').update(serialized).digest('hex');
  if (calculatedHash !== hash) return null;
  return JSON.parse(serialized);
}

/**
 * Save the serialized state to a file.
 * @param {string} filePath - The file path to save the state.
 * @param {Object} state - The state object to save.
 * @returns {Promise<void>} - Resolves when the state is saved.
 */
export async function saveCheckpoint(filePath, state) {
  const { serialized, hash } = serializeState(state);
  const checkpoint = JSON.stringify({ serialized, hash });
  await writeFile(filePath, checkpoint, 'utf8');
}

/**
 * Load the state from a checkpoint file.
 * @param {string} filePath - The file path to load the state from.
 * @returns {Promise<Object|null>} - Returns the state object or null if invalid.
 */
export async function loadCheckpoint(filePath) {
  try {
    const checkpoint = await readFile(filePath, 'utf8');
    const { serialized, hash } = JSON.parse(checkpoint);
    return deserializeState(serialized, hash);
  } catch (error) {
    return null; // Return null on any error (e.g., file not found, corruption)
  }
}

/**
 * Perform a long-running computation with periodic checkpointing.
 * @param {Function} computeStep - A function that performs a single computation step.
 * @param {Object} initialState - The initial state for the computation.
 * @param {string} checkpointPath - File path for saving checkpoints.
 * @param {number} checkpointInterval - Number of steps between checkpoints.
 * @returns {Promise<Object>} - Resolves with the final state.
 */
export async function runWithCheckpoints(computeStep, initialState, checkpointPath, checkpointInterval = 10) {
  let state = await loadCheckpoint(checkpointPath) || initialState;
  let step = state.step || 0;

  while (!state.done) {
    state = computeStep(state);
    step++;

    if (step % checkpointInterval === 0) {
      state.step = step; // Save the current step in the state
      await saveCheckpoint(checkpointPath, state);
    }
  }

  await saveCheckpoint(checkpointPath, state); // Final checkpoint
  return state;
}

/**
 * Example computation step function for testing purposes.
 * @param {Object} state - The current state of the computation.
 * @returns {Object} - The updated state.
 */
export function exampleComputeStep(state) {
  state.value = (state.value || 0) + 1;
  state.done = state.value >= 100; // Example condition to stop
  return state;
}