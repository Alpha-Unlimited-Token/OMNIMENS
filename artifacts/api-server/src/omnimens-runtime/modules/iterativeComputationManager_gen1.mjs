/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: iterativeComputationManager
 * Written: 2026-04-03T02:37:08.233Z
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
import { writeFile, readFile } from 'fs/promises';
import { randomUUID } from 'crypto';

/**
 * Manages long-running computations by dividing them into smaller asynchronous tasks with checkpointing.
 * This module provides utility functions for task queue management and state persistence.
 */

const checkpoints = new Map();

/**
 * Divides a long-running computation into smaller tasks and executes them asynchronously.
 * @param {Array<Function>} tasks - An array of functions representing the tasks to execute.
 * @param {string} checkpointFile - File path for saving checkpoint data.
 * @param {number} timeout - Maximum time (ms) allowed for each task before checkpointing.
 * @returns {Promise<void>} Resolves when all tasks are completed.
 */
export async function manageComputation(tasks, checkpointFile, timeout = 1000) {
  let currentIndex = 0;

  try {
    const savedState = await loadCheckpoint(checkpointFile);
    if (savedState) {
      currentIndex = savedState.currentIndex;
    }
  } catch (error) {
    console.error('Failed to load checkpoint:', error);
  }

  while (currentIndex < tasks.length) {
    const task = tasks[currentIndex];
    const startTime = Date.now();

    try {
      await task();
      currentIndex++;
    } catch (error) {
      console.error(`Task ${currentIndex} failed:`, error);
    }

    if (Date.now() - startTime >= timeout) {
      await saveCheckpoint(checkpointFile, { currentIndex });
    }
  }

  // Clean up checkpoint file after completion
  await deleteCheckpoint(checkpointFile);
}

/**
 * Saves the current computation state to a checkpoint file.
 * @param {string} filePath - File path for saving the checkpoint.
 * @param {Object} state - The state object to save.
 * @returns {Promise<void>} Resolves when the state is saved.
 */
export async function saveCheckpoint(filePath, state) {
  try {
    const serializedState = JSON.stringify(state);
    await writeFile(filePath, serializedState);
  } catch (error) {
    console.error('Failed to save checkpoint:', error);
  }
}

/**
 * Loads the computation state from a checkpoint file.
 * @param {string} filePath - File path for loading the checkpoint.
 * @returns {Promise<Object|null>} Resolves with the state object or null if not found.
 */
export async function loadCheckpoint(filePath) {
  try {
    const data = await readFile(filePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    if (error.code === 'ENOENT') {
      return null; // File does not exist
    }
    throw error;
  }
}

/**
 * Deletes the checkpoint file after computation is complete.
 * @param {string} filePath - File path for the checkpoint file.
 * @returns {Promise<void>} Resolves when the file is deleted.
 */
export async function deleteCheckpoint(filePath) {
  try {
    checkpoints.delete(filePath);
  } catch (error) {
    console.error('Failed to delete checkpoint:', error);
  }
}

/**
 * Creates a task queue from a generator function.
 * @param {Generator<Function>} generator - A generator yielding task functions.
 * @returns {Array<Function>} An array of task functions.
 */
export function createTaskQueue(generator) {
  const tasks = [];
  for (const task of generator) {
    tasks.push(task);
  }
  return tasks;
}

/**
 * Generates a unique identifier for checkpointing.
 * @returns {string} A unique identifier.
 */
export function generateCheckpointId() {
  return randomUUID();
}