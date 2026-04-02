/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: iterativeComputationManager
 * Written: 2026-04-02T15:05:19.490Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// iterativeComputationManager.mjs

import { writeFileSync, readFileSync, existsSync } from 'fs';
import { join } from 'path';

/**
 * Saves the intermediate state of a computation to a JSON file.
 * @param {string} taskId - Unique identifier for the task.
 * @param {object} state - The state object to be serialized.
 * @param {string} directory - Directory to save the checkpoint file.
 */
export function saveCheckpoint(taskId, state, directory) {
  const filePath = join(directory, `${taskId}.json`);
  writeFileSync(filePath, JSON.stringify(state, null, 2), 'utf-8');
}

/**
 * Restores the intermediate state of a computation from a JSON file.
 * @param {string} taskId - Unique identifier for the task.
 * @param {string} directory - Directory where the checkpoint file is located.
 * @returns {object|null} - The restored state object, or null if no checkpoint exists.
 */
export function restoreCheckpoint(taskId, directory) {
  const filePath = join(directory, `${taskId}.json`);
  if (!existsSync(filePath)) return null;
  const stateData = readFileSync(filePath, 'utf-8');
  return JSON.parse(stateData);
}

/**
 * Divides a long-running computation into smaller segments and manages state checkpointing.
 * @param {string} taskId - Unique identifier for the task.
 * @param {function} computeFunction - Function that performs a segment of the computation.
 * @param {object} initialState - Initial state object for the computation.
 * @param {string} directory - Directory for saving checkpoints.
 * @param {number} maxIterations - Maximum number of iterations to process.
 * @returns {object} - Final state after computation.
 */
export function manageComputation(taskId, computeFunction, initialState, directory, maxIterations) {
  let state = restoreCheckpoint(taskId, directory) || initialState;

  for (let iteration = state.iteration || 0; iteration < maxIterations; iteration++) {
    state = computeFunction(state);
    state.iteration = iteration + 1;
    saveCheckpoint(taskId, state, directory);
  }

  return state;
}

/**
 * Example utility function for generic iterative computations.
 * @param {object} state - Current state of the computation.
 * @returns {object} - Updated state after processing a segment.
 */
export function exampleComputeFunction(state) {
  state.result = (state.result || 0) + (state.increment || 1);
  return state;
}

/**
 * Utility to clear a checkpoint file (useful for resetting tasks).
 * @param {string} taskId - Unique identifier for the task.
 * @param {string} directory - Directory where the checkpoint file is located.
 */
export function clearCheckpoint(taskId, directory) {
  const filePath = join(directory, `${taskId}.json`);
  if (existsSync(filePath)) {
    writeFileSync(filePath, '', 'utf-8');
  }
}