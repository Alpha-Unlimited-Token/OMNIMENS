/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: longComputationCheckpointing
 * Written: 2026-04-02T14:13:51.685Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// longComputationCheckpointing.mjs

import { writeFileSync, readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { createHash } from 'crypto';

/**
 * Generates a unique hash for a given task identifier and state.
 * @param {string} taskId - A unique identifier for the task.
 * @param {object} state - The current state of the computation.
 * @returns {string} - A unique hash string.
 */
export function generateCheckpointHash(taskId, state) {
  const hash = createHash('sha256');
  hash.update(taskId + JSON.stringify(state));
  return hash.digest('hex');
}

/**
 * Saves the current state of a computation to a checkpoint file.
 * @param {string} taskId - A unique identifier for the task.
 * @param {object} state - The current state of the computation.
 * @param {string} checkpointDir - Directory to store checkpoint files.
 */
export function saveCheckpoint(taskId, state, checkpointDir = './checkpoints') {
  const checkpointFile = join(checkpointDir, `${taskId}.json`);
  const data = JSON.stringify({ taskId, state });
  writeFileSync(checkpointFile, data, 'utf8');
}

/**
 * Loads the last saved state of a computation from a checkpoint file.
 * @param {string} taskId - A unique identifier for the task.
 * @param {string} checkpointDir - Directory where checkpoint files are stored.
 * @returns {object|null} - The last saved state, or null if no checkpoint exists.
 */
export function loadCheckpoint(taskId, checkpointDir = './checkpoints') {
  const checkpointFile = join(checkpointDir, `${taskId}.json`);
  if (!existsSync(checkpointFile)) return null;
  const data = readFileSync(checkpointFile, 'utf8');
  const { state } = JSON.parse(data);
  return state;
}

/**
 * Processes a long-running computation in resumable steps.
 * @param {string} taskId - A unique identifier for the task.
 * @param {function} stepFunction - Function to process one step of the computation.
 * @param {number} maxSteps - Maximum steps to process in one invocation.
 * @param {string} checkpointDir - Directory to store checkpoint files.
 * @returns {object} - Final state or intermediate state if not yet complete.
 */
export function processWithCheckpointing(taskId, stepFunction, maxSteps, checkpointDir = './checkpoints') {
  let state = loadCheckpoint(taskId, checkpointDir) || { step: 0, complete: false };

  for (let i = 0; i < maxSteps; i++) {
    if (state.complete) break;
    state = stepFunction(state);
    saveCheckpoint(taskId, state, checkpointDir);
  }

  return state;
}

/**
 * Example step function for demonstration purposes.
 * Simulates a computation that completes after a fixed number of steps.
 * @param {object} state - Current state of the computation.
 * @returns {object} - Updated state after one step.
 */
export function exampleStepFunction(state) {
  const targetSteps = 10; // Total steps required to complete the computation.
  state.step = (state.step || 0) + 1;
  if (state.step >= targetSteps) {
    state.complete = true;
  }
  return state;
}

/**
 * Example usage of the checkpointing system.
 * Uncomment to test.
 */
// const taskId = 'exampleTask';
// const result = processWithCheckpointing(taskId, exampleStepFunction, 3);
// console.log(result);