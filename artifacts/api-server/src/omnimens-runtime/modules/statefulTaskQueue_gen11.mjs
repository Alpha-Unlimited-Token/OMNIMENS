/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: statefulTaskQueue
 * Written: 2026-04-02T13:30:03.508Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// statefulTaskQueue.mjs

import { writeFile, readFile } from 'fs/promises';
import { createHash } from 'crypto';

/**
 * Hashes a task ID to create a unique checkpoint file name.
 * @param {string} taskId - Unique identifier for the task.
 * @returns {string} - A hashed file name.
 */
export function generateCheckpointFileName(taskId) {
  const hash = createHash('sha256').update(taskId).digest('hex');
  return `checkpoint_${hash}.json`;
}

/**
 * Saves the current state of a task to a checkpoint file.
 * @param {string} taskId - Unique identifier for the task.
 * @param {object} state - The current state of the task to save.
 * @returns {Promise<void>} - Resolves when the state is saved.
 */
export async function saveCheckpoint(taskId, state) {
  const fileName = generateCheckpointFileName(taskId);
  await writeFile(fileName, JSON.stringify(state), 'utf8');
}

/**
 * Loads the last saved state of a task from a checkpoint file.
 * @param {string} taskId - Unique identifier for the task.
 * @returns {Promise<object|null>} - Resolves to the state object or null if no checkpoint exists.
 */
export async function loadCheckpoint(taskId) {
  const fileName = generateCheckpointFileName(taskId);
  try {
    const data = await readFile(fileName, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    if (err.code === 'ENOENT') {
      return null; // No checkpoint exists
    }
    throw err; // Re-throw other errors
  }
}

/**
 * Processes a long-running task in resumable chunks.
 * @param {string} taskId - Unique identifier for the task.
 * @param {function(object): object} taskFunction - Function to process a chunk; receives and returns state.
 * @param {object} initialState - Initial state of the task.
 * @param {number} chunkLimit - Maximum iterations per chunk.
 * @returns {Promise<void>} - Resolves when the task is complete.
 */
export async function processTaskInChunks(taskId, taskFunction, initialState, chunkLimit = 100) {
  let state = await loadCheckpoint(taskId) || initialState;

  for (let i = 0; i < chunkLimit; i++) {
    state = taskFunction(state);

    if (state.isComplete) {
      await saveCheckpoint(taskId, state); // Save final state
      return;
    }
  }

  await saveCheckpoint(taskId, state); // Save intermediate state if chunk limit is reached
}

/**
 * Utility to clear the checkpoint for a task.
 * @param {string} taskId - Unique identifier for the task.
 * @returns {Promise<void>} - Resolves when the checkpoint is cleared.
 */
export async function clearCheckpoint(taskId) {
  const fileName = generateCheckpointFileName(taskId);
  try {
    await writeFile(fileName, ''); // Overwrite with an empty file
  } catch (err) {
    if (err.code !== 'ENOENT') {
      throw err; // Ignore if file doesn't exist
    }
  }
}

/**
 * Example task function: increments a counter until a target is reached.
 * @param {object} state - Current state of the task.
 * @returns {object} - Updated state.
 */
export function exampleTaskFunction(state) {
  state.counter = (state.counter || 0) + 1;
  if (state.counter >= state.target) {
    state.isComplete = true;
  }
  return state;
}

/**
 * Example usage of the module.
 * Uncomment to test.
 */
// (async () => {
//   const taskId = 'exampleTask';
//   const initialState = { counter: 0, target: 10, isComplete: false };
//   await processTaskInChunks(taskId, exampleTaskFunction, initialState, 3);
// })();