/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: checkpointedExecutionManager
 * Written: 2026-04-03T06:26:36.879Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// checkpointedExecutionManager.mjs
import { writeFileSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { createHash } from 'node:crypto';

const CHECKPOINT_DIR = './checkpoints';

/**
 * Serialize and persist intermediate state to a file.
 * Ensures atomic writes using temporary files.
 * @param {string} identifier - Unique identifier for the checkpoint.
 * @param {object} state - State object to persist.
 */
export function saveCheckpoint(identifier, state) {
  const tempFile = join(CHECKPOINT_DIR, `${identifier}.tmp`);
  const finalFile = join(CHECKPOINT_DIR, `${identifier}.json`);
  const serializedState = JSON.stringify(state);

  try {
    writeFileSync(tempFile, serializedState, { encoding: 'utf8' });
    writeFileSync(finalFile, serializedState, { encoding: 'utf8' });
  } catch (error) {
    throw new Error(`Failed to save checkpoint: ${error.message}`);
  }
}

/**
 * Load a previously saved checkpoint.
 * @param {string} identifier - Unique identifier for the checkpoint.
 * @returns {object|null} - Restored state object or null if checkpoint does not exist.
 */
export function loadCheckpoint(identifier) {
  const finalFile = join(CHECKPOINT_DIR, `${identifier}.json`);

  try {
    const serializedState = readFileSync(finalFile, { encoding: 'utf8' });
    return JSON.parse(serializedState);
  } catch (error) {
    if (error.code === 'ENOENT') return null; // Checkpoint not found
    throw new Error(`Failed to load checkpoint: ${error.message}`);
  }
}

/**
 * Execute a long-running computation with checkpointing.
 * @param {string} identifier - Unique identifier for the checkpoint.
 * @param {Function} computeStep - Function to compute a single step. Must return updated state.
 * @param {Function} isComplete - Function to check if computation is complete.
 * @param {object} initialState - Initial state for the computation.
 * @returns {object} - Final state after computation completes.
 */
export async function runCheckpointedComputation(identifier, computeStep, isComplete, initialState) {
  let state = loadCheckpoint(identifier) || initialState;

  while (!isComplete(state)) {
    state = await computeStep(state);
    saveCheckpoint(identifier, state);
  }

  return state;
}

/**
 * Generate a unique hash for checkpoint identifiers.
 * Useful for ensuring identifier uniqueness across agents.
 * @param {string} input - Input string to hash.
 * @returns {string} - SHA-256 hash of the input.
 */
export function generateIdentifier(input) {
  return createHash('sha256').update(input).digest('hex');
}

/**
 * Clear a specific checkpoint from storage.
 * @param {string} identifier - Unique identifier for the checkpoint.
 */
export function clearCheckpoint(identifier) {
  const finalFile = join(CHECKPOINT_DIR, `${identifier}.json`);

  try {
    writeFileSync(finalFile, ''); // Overwrite with empty content for safety
  } catch (error) {
    if (error.code !== 'ENOENT') {
      throw new Error(`Failed to clear checkpoint: ${error.message}`);
    }
  }
}

/**
 * Utility to check if a checkpoint exists.
 * @param {string} identifier - Unique identifier for the checkpoint.
 * @returns {boolean} - True if checkpoint exists, false otherwise.
 */
export function checkpointExists(identifier) {
  const finalFile = join(CHECKPOINT_DIR, `${identifier}.json`);

  try {
    readFileSync(finalFile);
    return true;
  } catch (error) {
    return false;
  }
}