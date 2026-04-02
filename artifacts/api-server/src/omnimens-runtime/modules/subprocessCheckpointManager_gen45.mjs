/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: subprocessCheckpointManager
 * Written: 2026-04-02T14:26:53.740Z
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

import { writeFileSync, readFileSync, existsSync } from 'fs';
import { resolve } from 'path';
import { createHash } from 'crypto';

/**
 * Generates a unique hash for a given computation state object.
 * @param {object} state - The computation state to hash.
 * @returns {string} A unique hash string.
 */
export function generateStateHash(state) {
  const hash = createHash('sha256');
  hash.update(JSON.stringify(state));
  return hash.digest('hex');
}

/**
 * Saves the computation state to a checkpoint file.
 * @param {object} state - The computation state to save.
 * @param {string} checkpointId - A unique identifier for the checkpoint.
 * @param {string} [directory='./checkpoints'] - Directory to save the checkpoint file.
 */
export function saveCheckpoint(state, checkpointId, directory = './checkpoints') {
  const filePath = resolve(directory, `${checkpointId}.json`);
  const serializedState = JSON.stringify(state);
  writeFileSync(filePath, serializedState, { encoding: 'utf8' });
}

/**
 * Loads the computation state from a checkpoint file.
 * @param {string} checkpointId - A unique identifier for the checkpoint.
 * @param {string} [directory='./checkpoints'] - Directory to load the checkpoint file from.
 * @returns {object|null} The loaded computation state, or null if no checkpoint exists.
 */
export function loadCheckpoint(checkpointId, directory = './checkpoints') {
  const filePath = resolve(directory, `${checkpointId}.json`);
  if (!existsSync(filePath)) return null;
  const serializedState = readFileSync(filePath, { encoding: 'utf8' });
  return JSON.parse(serializedState);
}

/**
 * Checks if a checkpoint file exists.
 * @param {string} checkpointId - A unique identifier for the checkpoint.
 * @param {string} [directory='./checkpoints'] - Directory to check for the checkpoint file.
 * @returns {boolean} True if the checkpoint exists, false otherwise.
 */
export function checkpointExists(checkpointId, directory = './checkpoints') {
  const filePath = resolve(directory, `${checkpointId}.json`);
  return existsSync(filePath);
}

/**
 * Iteratively processes a computation, resuming from the last checkpoint if available.
 * @param {function} processFunction - The function to process a single iteration.
 * @param {object} initialState - The initial state of the computation.
 * @param {string} checkpointId - A unique identifier for the checkpoint.
 * @param {number} iterations - The number of iterations to process.
 * @param {string} [directory='./checkpoints'] - Directory to save and load checkpoints.
 * @returns {object} The final computation state.
 */
export function iterativeComputation(processFunction, initialState, checkpointId, iterations, directory = './checkpoints') {
  let state = loadCheckpoint(checkpointId, directory) || initialState;

  for (let i = state.currentIteration || 0; i < iterations; i++) {
    state = processFunction(state, i);
    state.currentIteration = i + 1;
    saveCheckpoint(state, checkpointId, directory);
  }

  return state;
}

/**
 * Utility to clear the currentIteration field from a state object.
 * @param {object} state - The computation state to clean.
 * @returns {object} A new state object without the currentIteration field.
 */
export function cleanState(state) {
  const { currentIteration, ...cleanedState } = state;
  return cleanedState;
}