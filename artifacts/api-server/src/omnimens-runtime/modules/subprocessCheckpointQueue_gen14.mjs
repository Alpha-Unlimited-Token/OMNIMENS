/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: subprocessCheckpointQueue
 * Written: 2026-04-01T22:14:44.944Z
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

import { writeFile, readFile } from 'fs/promises';
import { createHash } from 'crypto';

/**
 * Generates a unique hash for a given task state.
 * @param {object} state - The current state of the task.
 * @returns {string} - A hash representing the state.
 */
export function generateStateHash(state) {
  const hash = createHash('sha256');
  hash.update(JSON.stringify(state));
  return hash.digest('hex');
}

/**
 * Splits a long-running task into smaller chunks and processes them sequentially.
 * @param {Array} taskQueue - An array of tasks to process.
 * @param {function} taskProcessor - A function that processes a single task chunk.
 * @param {object} options - Configuration options for checkpointing.
 * @param {string} options.checkpointFile - File path to save the checkpoint state.
 * @param {number} options.checkpointInterval - Number of tasks to process before checkpointing.
 * @returns {Promise<void>} - Resolves when all tasks are processed.
 */
export async function subprocessCheckpointQueue(taskQueue, taskProcessor, options) {
  const { checkpointFile, checkpointInterval } = options;
  let currentIndex = 0;

  // Load existing checkpoint if available
  try {
    const checkpointData = await readFile(checkpointFile, 'utf8');
    const checkpointState = JSON.parse(checkpointData);
    currentIndex = checkpointState.currentIndex;
  } catch {
    // No checkpoint file exists, start from the beginning
  }

  while (currentIndex < taskQueue.length) {
    const task = taskQueue[currentIndex];

    try {
      await taskProcessor(task);
    } catch (error) {
      console.error(`Error processing task at index ${currentIndex}:`, error);
      throw error; // Stop processing on error
    }

    currentIndex++;

    // Save checkpoint state periodically
    if (currentIndex % checkpointInterval === 0 || currentIndex === taskQueue.length) {
      const checkpointState = { currentIndex };
      await writeFile(checkpointFile, JSON.stringify(checkpointState), 'utf8');
    }
  }
}

/**
 * A utility function to process tasks in parallel with a maximum concurrency limit.
 * @param {Array} tasks - The array of tasks to process.
 * @param {function} taskProcessor - The function to process a single task.
 * @param {number} concurrencyLimit - The maximum number of tasks to process concurrently.
 * @returns {Promise<void>} - Resolves when all tasks are processed.
 */
export async function processTasksWithConcurrency(tasks, taskProcessor, concurrencyLimit) {
  const taskQueue = [...tasks];
  const activeTasks = new Set();

  while (taskQueue.length > 0 || activeTasks.size > 0) {
    while (activeTasks.size < concurrencyLimit && taskQueue.length > 0) {
      const task = taskQueue.shift();
      const taskPromise = taskProcessor(task).finally(() => activeTasks.delete(taskPromise));
      activeTasks.add(taskPromise);
    }

    await Promise.race(activeTasks);
  }
}

/**
 * Example task processor function for demonstration purposes.
 * @param {object} task - A single task to process.
 * @returns {Promise<void>} - Resolves when the task is processed.
 */
export async function exampleTaskProcessor(task) {
  console.log('Processing task:', task);
  await new Promise((resolve) => setTimeout(resolve, 100)); // Simulate async work
}

/**
 * Example usage of subprocessCheckpointQueue.
 * Demonstrates splitting a task queue into chunks and checkpointing state.
 */
export async function exampleUsage() {
  const tasks = Array.from({ length: 100 }, (_, i) => ({ id: i, data: `Task ${i}` }));
  const checkpointFile = './checkpoint.json';
  const checkpointInterval = 10;

  await subprocessCheckpointQueue(tasks, exampleTaskProcessor, { checkpointFile, checkpointInterval });
}
