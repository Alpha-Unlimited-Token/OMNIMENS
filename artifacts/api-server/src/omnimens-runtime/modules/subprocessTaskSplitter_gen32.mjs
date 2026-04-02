/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: subprocessTaskSplitter
 * Written: 2026-04-02T14:54:34.736Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// subprocessTaskSplitter.mjs

import { writeFileSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { createHash } from 'node:crypto';

/**
 * Generate a unique hash for checkpoint file names based on task identifier.
 * @param {string} taskId - Unique identifier for the task.
 * @returns {string} - Hash string.
 */
export function generateCheckpointFileName(taskId) {
  const hash = createHash('sha256');
  hash.update(taskId);
  return `${hash.digest('hex')}.json`;
}

/**
 * Save intermediate state to a checkpoint file.
 * @param {string} taskId - Unique identifier for the task.
 * @param {object} state - Intermediate state to persist.
 * @param {string} directory - Directory to save the checkpoint file.
 */
export function saveCheckpoint(taskId, state, directory = './checkpoints') {
  const fileName = generateCheckpointFileName(taskId);
  const filePath = join(directory, fileName);
  const serializedState = JSON.stringify(state);
  writeFileSync(filePath, serializedState, 'utf8');
}

/**
 * Load intermediate state from a checkpoint file.
 * @param {string} taskId - Unique identifier for the task.
 * @param {string} directory - Directory to load the checkpoint file from.
 * @returns {object|null} - Deserialized state object or null if file does not exist.
 */
export function loadCheckpoint(taskId, directory = './checkpoints') {
  try {
    const fileName = generateCheckpointFileName(taskId);
    const filePath = join(directory, fileName);
    const serializedState = readFileSync(filePath, 'utf8');
    return JSON.parse(serializedState);
  } catch (error) {
    return null; // Return null if file does not exist or is inaccessible.
  }
}

/**
 * Split a long-running computation into iterative chunks.
 * @param {string} taskId - Unique identifier for the task.
 * @param {object} initialState - Initial state for the computation.
 * @param {function} computeChunkFunction - Function to process a single chunk. Must return updated state.
 * @param {function} isCompleteFunction - Function to determine if the computation is complete.
 * @param {string} directory - Directory for checkpoint files.
 * @returns {object} - Final state after computation completes.
 */
export function runSubprocessTask(taskId, initialState, computeChunkFunction, isCompleteFunction, directory = './checkpoints') {
  let state = loadCheckpoint(taskId, directory) || initialState;

  while (!isCompleteFunction(state)) {
    state = computeChunkFunction(state);
    saveCheckpoint(taskId, state, directory);
  }

  return state; // Return final state after completion.
}

/**
 * Example utility to demonstrate usage of the module.
 * Increment a number until it reaches a target value.
 * @param {object} state - Current computation state.
 * @returns {object} - Updated state.
 */
export function exampleComputeChunk(state) {
  state.current += 1;
  return state;
}

/**
 * Example completion check function.
 * @param {object} state - Current computation state.
 * @returns {boolean} - True if computation is complete, false otherwise.
 */
export function exampleIsComplete(state) {
  return state.current >= state.target;
}

// Example usage:
// const finalState = runSubprocessTask(
//   'exampleTask',
//   { current: 0, target: 10 },
//   exampleComputeChunk,
//   exampleIsComplete
// );
// console.log(finalState);