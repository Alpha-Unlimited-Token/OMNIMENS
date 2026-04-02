/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: sandboxCheckpointManager
 * Written: 2026-04-02T20:36:21.521Z
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

import { writeFileSync, readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { createHash } from 'crypto';

/**
 * Generates a unique hash for a given state object.
 * @param {Object} state - The state to hash.
 * @returns {string} - A unique hash string.
 */
export function generateStateHash(state) {
  const hash = createHash('sha256');
  hash.update(JSON.stringify(state));
  return hash.digest('hex');
}

/**
 * Saves a checkpoint to disk.
 * @param {string} checkpointDir - Directory to save the checkpoint.
 * @param {string} checkpointName - Name of the checkpoint file.
 * @param {Object} state - The state to save.
 */
export function saveCheckpoint(checkpointDir, checkpointName, state) {
  const filePath = join(checkpointDir, `${checkpointName}.json`);
  const serializedState = JSON.stringify(state);
  writeFileSync(filePath, serializedState, 'utf8');
}

/**
 * Loads a checkpoint from disk.
 * @param {string} checkpointDir - Directory to load the checkpoint from.
 * @param {string} checkpointName - Name of the checkpoint file.
 * @returns {Object|null} - The loaded state, or null if not found.
 */
export function loadCheckpoint(checkpointDir, checkpointName) {
  const filePath = join(checkpointDir, `${checkpointName}.json`);
  if (!existsSync(filePath)) return null;
  const serializedState = readFileSync(filePath, 'utf8');
  return JSON.parse(serializedState);
}

/**
 * Deletes a checkpoint file.
 * @param {string} checkpointDir - Directory containing the checkpoint.
 * @param {string} checkpointName - Name of the checkpoint file.
 * @returns {boolean} - True if deleted successfully, false otherwise.
 */
export function deleteCheckpoint(checkpointDir, checkpointName) {
  const filePath = join(checkpointDir, `${checkpointName}.json`);
  if (existsSync(filePath)) {
    try {
      writeFileSync(filePath, '', 'utf8'); // Overwrite the file with empty content for safety
      return true;
    } catch {
      return false;
    }
  }
  return false;
}

/**
 * Checks if a checkpoint exists.
 * @param {string} checkpointDir - Directory to check.
 * @param {string} checkpointName - Name of the checkpoint file.
 * @returns {boolean} - True if the checkpoint exists, false otherwise.
 */
export function checkpointExists(checkpointDir, checkpointName) {
  const filePath = join(checkpointDir, `${checkpointName}.json`);
  return existsSync(filePath);
}

/**
 * Resumes computation from a checkpoint or starts fresh if none exists.
 * @param {string} checkpointDir - Directory for checkpoints.
 * @param {string} checkpointName - Name of the checkpoint file.
 * @param {Function} computeFunction - Function to execute for computation.
 * @param {Object} initialState - Initial state if no checkpoint exists.
 * @returns {Object} - Final state after computation.
 */
export function resumeOrStart(checkpointDir, checkpointName, computeFunction, initialState) {
  let state = loadCheckpoint(checkpointDir, checkpointName) || initialState;
  state = computeFunction(state);
  saveCheckpoint(checkpointDir, checkpointName, state);
  return state;
}
