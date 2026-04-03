/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: subprocessCheckpointing
 * Written: 2026-04-03T12:17:37.599Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// subprocessCheckpointing.mjs

import { writeFileSync, readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { createHash } from 'crypto';

/**
 * Generates a unique hash for a given state object.
 * @param {object} state - The state object to hash.
 * @returns {string} - A unique hash string.
 */
export function generateStateHash(state) {
  const hash = createHash('sha256');
  hash.update(JSON.stringify(state));
  return hash.digest('hex');
}

/**
 * Saves a computation state to disk.
 * @param {object} state - The state object to save.
 * @param {string} checkpointDir - Directory to save the checkpoint.
 * @returns {string} - The file path of the saved checkpoint.
 */
export function saveCheckpoint(state, checkpointDir) {
  const stateHash = generateStateHash(state);
  const filePath = join(checkpointDir, `${stateHash}.json`);
  writeFileSync(filePath, JSON.stringify(state, null, 2), 'utf-8');
  return filePath;
}

/**
 * Restores a computation state from a checkpoint file.
 * @param {string} filePath - Path to the checkpoint file.
 * @returns {object} - The restored state object.
 */
export function restoreCheckpoint(filePath) {
  if (!existsSync(filePath)) {
    throw new Error(`Checkpoint file not found: ${filePath}`);
  }
  const stateData = readFileSync(filePath, 'utf-8');
  return JSON.parse(stateData);
}

/**
 * Checks if a checkpoint exists for a given state.
 * @param {object} state - The state object to check.
 * @param {string} checkpointDir - Directory to check for the checkpoint.
 * @returns {string|null} - File path of the checkpoint if exists, otherwise null.
 */
export function checkpointExists(state, checkpointDir) {
  const stateHash = generateStateHash(state);
  const filePath = join(checkpointDir, `${stateHash}.json`);
  return existsSync(filePath) ? filePath : null;
}

/**
 * Iteratively computes a task with checkpointing.
 * @param {function} computeStep - Function to perform a single computation step.
 * @param {object} initialState - Initial state object for the computation.
 * @param {string} checkpointDir - Directory to save and load checkpoints.
 * @param {function} isComplete - Function to check if computation is complete.
 * @returns {object} - Final state after computation.
 */
export async function iterativeComputation(computeStep, initialState, checkpointDir, isComplete) {
  let state = initialState;

  // Check for existing checkpoint
  const existingCheckpoint = checkpointExists(state, checkpointDir);
  if (existingCheckpoint) {
    state = restoreCheckpoint(existingCheckpoint);
  }

  while (!isComplete(state)) {
    state = await computeStep(state);
    saveCheckpoint(state, checkpointDir);
  }

  return state;
}

/**
 * Example utility function for generic mathematical computations.
 * @param {number[]} array - Array of numbers to process.
 * @returns {number} - Sum of the array.
 */
export function sumArray(array) {
  return array.reduce((acc, val) => acc + val, 0);
}

/**
 * Example utility function for text processing.
 * @param {string} text - Input text.
 * @returns {object} - Word frequency map.
 */
export function wordFrequency(text) {
  return text.split(/\s+/).reduce((freqMap, word) => {
    const normalizedWord = word.toLowerCase();
    freqMap[normalizedWord] = (freqMap[normalizedWord] || 0) + 1;
    return freqMap;
  }, {});
}
