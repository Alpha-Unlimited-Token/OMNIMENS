/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: checkpointedTaskScheduler
 * Written: 2026-04-02T15:38:50.489Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// checkpointedTaskScheduler.mjs

import { writeFileSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

/**
 * Splits a long-running task into checkpointed subprocesses with state serialization.
 * @param {Function} taskFunction - The main task function to execute.
 * @param {Object} initialState - The initial state of the task.
 * @param {number} checkpointInterval - Number of iterations between checkpoints.
 * @param {string} checkpointFile - File path for saving/restoring state.
 * @returns {Promise<Object>} Final state after task completion.
 */
export async function checkpointedTaskRunner(taskFunction, initialState, checkpointInterval, checkpointFile) {
  let state = initialState;
  let iteration = state.iteration || 0;

  // Restore state if checkpoint file exists
  try {
    const savedState = JSON.parse(readFileSync(resolve(checkpointFile), 'utf-8'));
    state = savedState;
    iteration = state.iteration || 0;
  } catch (error) {
    // No checkpoint found, proceed with initial state
  }

  while (!state.completed) {
    state = taskFunction(state);
    iteration++;

    if (iteration % checkpointInterval === 0 || state.completed) {
      state.iteration = iteration;
      writeFileSync(resolve(checkpointFile), JSON.stringify(state));
    }
  }

  return state;
}

/**
 * Example task function for demonstration purposes.
 * @param {Object} state - Current state of the task.
 * @returns {Object} Updated state.
 */
export function exampleTaskFunction(state) {
  state.progress = (state.progress || 0) + 10;
  state.completed = state.progress >= 100;
  return state;
}

/**
 * Utility to reset the checkpoint file.
 * @param {string} checkpointFile - File path for the checkpoint.
 */
export function resetCheckpoint(checkpointFile) {
  writeFileSync(resolve(checkpointFile), JSON.stringify({ iteration: 0, progress: 0, completed: false }));
}

/**
 * Utility to load the current state from a checkpoint file.
 * @param {string} checkpointFile - File path for the checkpoint.
 * @returns {Object} The current state stored in the checkpoint file.
 */
export function loadCheckpoint(checkpointFile) {
  try {
    return JSON.parse(readFileSync(resolve(checkpointFile), 'utf-8'));
  } catch (error) {
    return null; // No checkpoint found
  }
}

/**
 * Utility to delete a checkpoint file (for testing purposes).
 * @param {string} checkpointFile - File path for the checkpoint.
 */
export function deleteCheckpoint(checkpointFile) {
  writeFileSync(resolve(checkpointFile), '');
}