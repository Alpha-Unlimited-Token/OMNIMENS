/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: taskSplittingFramework
 * Written: 2026-04-02T15:17:51.676Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// taskSplittingFramework.mjs

import { writeFile, readFile } from 'fs/promises';
import { join } from 'path';
import { createHash } from 'crypto';

/**
 * Generates a unique hash for a given task identifier and state.
 * @param {string} taskId - The unique identifier for the task.
 * @param {object} state - The current state of the task.
 * @returns {string} - A unique hash string.
 */
export function generateTaskHash(taskId, state) {
  const hash = createHash('sha256');
  hash.update(taskId + JSON.stringify(state));
  return hash.digest('hex');
}

/**
 * Saves the intermediate state of a task to a file.
 * @param {string} taskId - The unique identifier for the task.
 * @param {object} state - The current state of the task.
 * @param {string} directory - The directory to save the state file.
 * @returns {Promise<void>} - Resolves when the state is saved.
 */
export async function saveState(taskId, state, directory = './task_states') {
  const filePath = join(directory, `${taskId}.json`);
  const data = JSON.stringify(state, null, 2);
  await writeFile(filePath, data, 'utf-8');
}

/**
 * Loads the intermediate state of a task from a file.
 * @param {string} taskId - The unique identifier for the task.
 * @param {string} directory - The directory to load the state file from.
 * @returns {Promise<object>} - Resolves with the loaded state object.
 */
export async function loadState(taskId, directory = './task_states') {
  const filePath = join(directory, `${taskId}.json`);
  try {
    const data = await readFile(filePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    if (error.code === 'ENOENT') {
      return null; // State file does not exist
    }
    throw error;
  }
}

/**
 * Splits a large task into smaller steps and executes them iteratively.
 * @param {string} taskId - The unique identifier for the task.
 * @param {function} stepFunction - The function that performs a single step of the task.
 * @param {object} initialState - The initial state of the task.
 * @param {string} directory - The directory to save and load state.
 * @returns {Promise<object>} - Resolves with the final state of the task.
 */
export async function executeTaskIteratively(taskId, stepFunction, initialState, directory = './task_states') {
  let state = await loadState(taskId, directory) || initialState;

  while (!state.isComplete) {
    state = await stepFunction(state);
    await saveState(taskId, state, directory);
  }

  return state;
}

/**
 * Example step function for demonstration purposes.
 * @param {object} state - The current state of the task.
 * @returns {Promise<object>} - Resolves with the updated state.
 */
export async function exampleStepFunction(state) {
  if (!state.counter) state.counter = 0;
  state.counter++;
  state.isComplete = state.counter >= 10;
  return state;
}

/**
 * Utility to clear a task's saved state (for testing or resetting).
 * @param {string} taskId - The unique identifier for the task.
 * @param {string} directory - The directory containing the state file.
 * @returns {Promise<void>} - Resolves when the state file is cleared.
 */
export async function clearTaskState(taskId, directory = './task_states') {
  const filePath = join(directory, `${taskId}.json`);
  try {
    await writeFile(filePath, '{}', 'utf-8');
  } catch (error) {
    if (error.code !== 'ENOENT') {
      throw error;
    }
  }
}