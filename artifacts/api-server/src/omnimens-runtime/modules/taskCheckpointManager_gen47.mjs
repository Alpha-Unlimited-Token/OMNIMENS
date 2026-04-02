/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: taskCheckpointManager
 * Written: 2026-04-02T15:17:33.726Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// taskCheckpointManager.mjs

import { writeFileSync, readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { createHash } from 'crypto';

/**
 * Generates a unique hash for a given task identifier and state.
 * Useful for checkpoint file naming.
 * @param {string} taskId - Unique identifier for the task.
 * @param {object} state - Current computational state.
 * @returns {string} - Hash string.
 */
export function generateCheckpointHash(taskId, state) {
  const hash = createHash('sha256');
  hash.update(taskId + JSON.stringify(state));
  return hash.digest('hex');
}

/**
 * Saves the current state of a task to a checkpoint file.
 * @param {string} taskId - Unique identifier for the task.
 * @param {object} state - Current computational state.
 * @param {string} directory - Directory to store checkpoint files.
 */
export function saveCheckpoint(taskId, state, directory) {
  const checkpointFile = join(directory, `${taskId}.json`);
  const data = JSON.stringify(state, null, 2);
  writeFileSync(checkpointFile, data, 'utf-8');
}

/**
 * Restores the state of a task from a checkpoint file.
 * @param {string} taskId - Unique identifier for the task.
 * @param {string} directory - Directory to search for checkpoint files.
 * @returns {object|null} - Restored state or null if no checkpoint exists.
 */
export function restoreCheckpoint(taskId, directory) {
  const checkpointFile = join(directory, `${taskId}.json`);
  if (existsSync(checkpointFile)) {
    const data = readFileSync(checkpointFile, 'utf-8');
    return JSON.parse(data);
  }
  return null;
}

/**
 * Deletes a checkpoint file after task completion.
 * @param {string} taskId - Unique identifier for the task.
 * @param {string} directory - Directory containing checkpoint files.
 */
export function deleteCheckpoint(taskId, directory) {
  const checkpointFile = join(directory, `${taskId}.json`);
  if (existsSync(checkpointFile)) {
    writeFileSync(checkpointFile, ''); // Overwrite with empty content for safety.
  }
}

/**
 * Example utility function for iterative computations.
 * Demonstrates checkpointing and resuming a task.
 * @param {string} taskId - Unique identifier for the task.
 * @param {function} computeStep - Function to compute one step of the task.
 * @param {number} maxSteps - Maximum number of steps to compute.
 * @param {string} directory - Directory to store checkpoint files.
 */
export async function runTaskWithCheckpoint(taskId, computeStep, maxSteps, directory) {
  let state = restoreCheckpoint(taskId, directory) || { step: 0, result: null };

  while (state.step < maxSteps) {
    state.result = computeStep(state.step, state.result);
    state.step++;
    saveCheckpoint(taskId, state, directory);
  }

  deleteCheckpoint(taskId, directory); // Cleanup after completion.
  return state.result;
}

/**
 * Example computation step function.
 * Generic utility for mathematical tasks.
 * @param {number} step - Current step number.
 * @param {number|null} previousResult - Result from the previous step.
 * @returns {number} - Computed result.
 */
export function exampleComputeStep(step, previousResult) {
  return (previousResult || 0) + step * step; // Sum of squares.
}