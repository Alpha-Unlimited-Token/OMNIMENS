/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: iterativeSubprocessManager
 * Written: 2026-04-02T14:31:16.651Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// Complete ES module code here

import { writeFileSync, readFileSync, existsSync } from 'fs';
import { resolve } from 'path';
import { createHash } from 'crypto';

/**
 * Generates a unique hash for a given task identifier and step.
 * @param {string} taskId - The unique identifier for the task.
 * @param {number} step - The current step of the task.
 * @returns {string} - A unique hash string.
 */
export function generateCheckpointId(taskId, step) {
  const hash = createHash('sha256');
  hash.update(`${taskId}:${step}`);
  return hash.digest('hex');
}

/**
 * Saves the current state of a task to a checkpoint file.
 * @param {string} taskId - The unique identifier for the task.
 * @param {number} step - The current step of the task.
 * @param {object} state - The state object to be checkpointed.
 * @param {string} [directory='./checkpoints'] - Directory to store checkpoint files.
 */
export function saveCheckpoint(taskId, step, state, directory = './checkpoints') {
  const checkpointId = generateCheckpointId(taskId, step);
  const filePath = resolve(directory, `${checkpointId}.json`);
  const serializedState = JSON.stringify({ step, state });
  writeFileSync(filePath, serializedState, 'utf8');
}

/**
 * Loads the last checkpoint state for a given task.
 * @param {string} taskId - The unique identifier for the task.
 * @param {number} step - The step of the task to load.
 * @param {string} [directory='./checkpoints'] - Directory to look for checkpoint files.
 * @returns {object|null} - The loaded state object or null if not found.
 */
export function loadCheckpoint(taskId, step, directory = './checkpoints') {
  const checkpointId = generateCheckpointId(taskId, step);
  const filePath = resolve(directory, `${checkpointId}.json`);

  if (!existsSync(filePath)) {
    return null;
  }

  const serializedState = readFileSync(filePath, 'utf8');
  return JSON.parse(serializedState);
}

/**
 * Executes a long-running task in discrete steps with checkpointing.
 * @param {string} taskId - The unique identifier for the task.
 * @param {function(number, object): object} stepFunction - Function to execute each step.
 * @param {number} totalSteps - Total number of steps to execute.
 * @param {object} initialState - Initial state to start the task.
 * @param {string} [directory='./checkpoints'] - Directory to store/load checkpoint files.
 * @returns {object} - The final state after completing all steps.
 */
export function runTaskWithCheckpointing(taskId, stepFunction, totalSteps, initialState, directory = './checkpoints') {
  let currentState = initialState;
  let currentStep = 0;

  // Resume from the last checkpoint if available
  for (let step = totalSteps - 1; step >= 0; step--) {
    const checkpoint = loadCheckpoint(taskId, step, directory);
    if (checkpoint) {
      currentStep = checkpoint.step + 1;
      currentState = checkpoint.state;
      break;
    }
  }

  // Execute remaining steps
  for (let step = currentStep; step < totalSteps; step++) {
    currentState = stepFunction(step, currentState);
    saveCheckpoint(taskId, step, currentState, directory);
  }

  return currentState;
}

/**
 * Utility to clear all checkpoints for a given task.
 * @param {string} taskId - The unique identifier for the task.
 * @param {number} totalSteps - Total number of steps to clear.
 * @param {string} [directory='./checkpoints'] - Directory containing checkpoint files.
 */
export function clearCheckpoints(taskId, totalSteps, directory = './checkpoints') {
  for (let step = 0; step < totalSteps; step++) {
    const checkpointId = generateCheckpointId(taskId, step);
    const filePath = resolve(directory, `${checkpointId}.json`);
    if (existsSync(filePath)) {
      writeFileSync(filePath, ''); // Overwrite with empty content for safety
    }
  }
}