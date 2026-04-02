/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: statefulTaskExecutor
 * Written: 2026-04-02T13:33:52.664Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// statefulTaskExecutor.mjs

import { writeFileSync, readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const CHECKPOINT_DIR = './checkpoints';

/**
 * Saves the current state to a checkpoint file.
 * @param {string} taskName - Unique identifier for the task.
 * @param {object} state - Serializable state object.
 */
export function saveState(taskName, state) {
  const filePath = join(CHECKPOINT_DIR, `${taskName}.json`);
  const serializedState = JSON.stringify(state);
  writeFileSync(filePath, serializedState, 'utf-8');
}

/**
 * Loads the saved state from a checkpoint file.
 * @param {string} taskName - Unique identifier for the task.
 * @returns {object|null} - The deserialized state object or null if no checkpoint exists.
 */
export function loadState(taskName) {
  const filePath = join(CHECKPOINT_DIR, `${taskName}.json`);
  if (existsSync(filePath)) {
    const serializedState = readFileSync(filePath, 'utf-8');
    return JSON.parse(serializedState);
  }
  return null;
}

/**
 * Executes a long-running task with checkpointing.
 * @param {string} taskName - Unique identifier for the task.
 * @param {function} taskFunction - Function that performs one iteration of the task.
 * @param {number} iterations - Total number of iterations to perform.
 */
export function executeTask(taskName, taskFunction, iterations) {
  let state = loadState(taskName) || { currentIteration: 0 };

  for (let i = state.currentIteration; i < iterations; i++) {
    state.currentIteration = i;
    saveState(taskName, state);

    try {
      taskFunction(state);
    } catch (error) {
      console.error(`Error during iteration ${i}:`, error);
      break; // Stop execution on error
    }
  }

  // Final checkpoint to mark completion
  state.currentIteration = iterations;
  saveState(taskName, state);
}

/**
 * Utility function for generic progress tracking.
 * @param {object} state - Current task state.
 * @param {number} totalIterations - Total iterations for the task.
 * @returns {string} - Progress as a percentage.
 */
export function getProgress(state, totalIterations) {
  const progress = ((state.currentIteration / totalIterations) * 100).toFixed(2);
  return `${progress}% completed`;
}

/**
 * Example task function for testing.
 * @param {object} state - Current task state.
 */
export function exampleTaskFunction(state) {
  console.log(`Executing iteration ${state.currentIteration}...`);
  // Simulate computation
}

// Usage example (uncomment to test):
// executeTask('exampleTask', exampleTaskFunction, 10);