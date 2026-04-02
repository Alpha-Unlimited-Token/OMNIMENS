/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: sandboxCheckpointManager
 * Written: 2026-04-02T14:25:34.883Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// sandboxCheckpointManager.mjs

import { writeFileSync, readFileSync } from 'fs';
import { resolve } from 'path';
import { createHash } from 'crypto';

/**
 * Serialize computation state to disk for checkpointing.
 * @param {string} identifier - Unique identifier for the computation.
 * @param {object} state - The current state of the computation.
 * @param {string} directory - Directory to save the checkpoint file.
 */
export function saveCheckpoint(identifier, state, directory = './checkpoints') {
  const filePath = resolve(directory, `${identifier}.json`);
  const serializedState = JSON.stringify(state);
  writeFileSync(filePath, serializedState, 'utf8');
}

/**
 * Restore computation state from a checkpoint file.
 * @param {string} identifier - Unique identifier for the computation.
 * @param {string} directory - Directory containing the checkpoint file.
 * @returns {object|null} - Restored state or null if checkpoint doesn't exist.
 */
export function loadCheckpoint(identifier, directory = './checkpoints') {
  const filePath = resolve(directory, `${identifier}.json`);
  try {
    const serializedState = readFileSync(filePath, 'utf8');
    return JSON.parse(serializedState);
  } catch (error) {
    return null; // Return null if the file doesn't exist or is invalid
  }
}

/**
 * Generate a hash for a given computation state.
 * @param {object} state - The computation state to hash.
 * @returns {string} - A SHA-256 hash of the serialized state.
 */
export function generateStateHash(state) {
  const serializedState = JSON.stringify(state);
  const hash = createHash('sha256');
  hash.update(serializedState);
  return hash.digest('hex');
}

/**
 * Periodically checkpoint a computation state.
 * @param {string} identifier - Unique identifier for the computation.
 * @param {object} initialState - Initial state of the computation.
 * @param {function} updateFunction - Function to update the state.
 * @param {number} intervalMs - Interval in milliseconds for checkpointing.
 * @param {number} maxIterations - Maximum number of iterations.
 * @param {string} directory - Directory for saving checkpoints.
 * @returns {object} - Final state after computation.
 */
export async function runWithCheckpointing(
  identifier,
  initialState,
  updateFunction,
  intervalMs,
  maxIterations,
  directory = './checkpoints'
) {
  let state = loadCheckpoint(identifier, directory) || initialState;
  for (let i = 0; i < maxIterations; i++) {
    state = updateFunction(state, i);
    if (i % Math.floor(intervalMs / 100) === 0) {
      saveCheckpoint(identifier, state, directory);
    }
    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }
  return state;
}

/**
 * Utility to validate computation state integrity.
 * @param {object} state - The computation state.
 * @param {string} expectedHash - Expected hash for the state.
 * @returns {boolean} - True if the state hash matches the expected hash.
 */
export function validateStateIntegrity(state, expectedHash) {
  return generateStateHash(state) === expectedHash;
}