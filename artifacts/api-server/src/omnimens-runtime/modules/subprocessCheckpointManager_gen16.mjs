/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: subprocessCheckpointManager
 * Written: 2026-04-02T14:11:05.307Z
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
 * Generates a unique hash for a given state object.
 * @param {object} state - The state object to hash.
 * @returns {string} - A unique hash representing the state.
 */
export function generateStateHash(state) {
  const hash = createHash('sha256');
  hash.update(JSON.stringify(state));
  return hash.digest('hex');
}

/**
 * Saves the current state to a checkpoint file.
 * @param {object} state - The state object to save.
 * @param {string} checkpointDir - Directory to store checkpoint files.
 * @returns {string} - The file path of the saved checkpoint.
 */
export function saveCheckpoint(state, checkpointDir) {
  const stateHash = generateStateHash(state);
  const filePath = resolve(checkpointDir, `${stateHash}.json`);
  writeFileSync(filePath, JSON.stringify(state, null, 2), 'utf8');
  return filePath;
}

/**
 * Loads a checkpoint from a file, if it exists.
 * @param {string} checkpointDir - Directory where checkpoints are stored.
 * @param {string} stateHash - The hash of the state to load.
 * @returns {object|null} - The loaded state object or null if not found.
 */
export function loadCheckpoint(checkpointDir, stateHash) {
  const filePath = resolve(checkpointDir, `${stateHash}.json`);
  if (existsSync(filePath)) {
    const fileContent = readFileSync(filePath, 'utf8');
    return JSON.parse(fileContent);
  }
  return null;
}

/**
 * Manages iterative computations by saving and resuming states.
 * @param {function} computeFunction - The computation function to execute.
 * @param {object} initialState - The initial state to start computations.
 * @param {string} checkpointDir - Directory to store checkpoint files.
 * @param {number} checkpointInterval - Number of iterations between checkpoints.
 * @returns {object} - The final state after computations.
 */
export function subprocessCheckpointManager(computeFunction, initialState, checkpointDir, checkpointInterval = 10) {
  let currentState = initialState;
  let iteration = currentState.iteration || 0;

  while (!currentState.done) {
    iteration++;
    currentState = computeFunction(currentState);
    currentState.iteration = iteration;

    if (iteration % checkpointInterval === 0) {
      saveCheckpoint(currentState, checkpointDir);
    }
  }

  saveCheckpoint(currentState, checkpointDir); // Final checkpoint
  return currentState;
}

/**
 * A sample computation function for demonstration purposes.
 * @param {object} state - The current state of the computation.
 * @returns {object} - The updated state after computation.
 */
export function sampleComputeFunction(state) {
  if (!state.counter) state.counter = 0;
  state.counter++;
  state.done = state.counter >= 100;
  return state;
}

/**
 * Utility to resume computations from the last checkpoint.
 * @param {function} computeFunction - The computation function to execute.
 * @param {string} checkpointDir - Directory where checkpoints are stored.
 * @param {number} checkpointInterval - Number of iterations between checkpoints.
 * @returns {object} - The final state after computations.
 */
export function resumeFromCheckpoint(computeFunction, checkpointDir, checkpointInterval = 10) {
  const checkpointFiles = readdirSync(checkpointDir).filter(file => file.endsWith('.json'));
  if (checkpointFiles.length === 0) {
    throw new Error('No checkpoints found to resume from.');
  }

  const latestCheckpoint = checkpointFiles.sort().pop();
  const latestState = JSON.parse(readFileSync(resolve(checkpointDir, latestCheckpoint), 'utf8'));

  return subprocessCheckpointManager(computeFunction, latestState, checkpointDir, checkpointInterval);
}
