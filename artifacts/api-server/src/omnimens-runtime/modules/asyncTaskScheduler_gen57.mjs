/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: asyncTaskScheduler
 * Written: 2026-04-02T13:37:25.334Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// asyncTaskScheduler.mjs
import { setTimeout } from 'timers/promises';

// Task queue with priority-based scheduling
const taskQueue = [];

/**
 * Adds a task to the queue with a specific priority.
 * @param {Function} taskFunction - The task to execute (must return a Promise).
 * @param {number} priority - Priority of the task (lower number = higher priority).
 */
export function addTask(taskFunction, priority = 0) {
  if (typeof taskFunction !== 'function') {
    throw new TypeError('Task must be a function that returns a Promise.');
  }
  taskQueue.push({ taskFunction, priority });
  taskQueue.sort((a, b) => a.priority - b.priority); // Sort by priority
}

/**
 * Executes tasks in the queue cooperatively, yielding to the event loop to maintain responsiveness.
 * @param {number} timeSliceMs - Maximum time (in ms) to execute tasks before yielding.
 */
export async function runScheduler(timeSliceMs = 50) {
  const startTime = Date.now();

  while (taskQueue.length > 0) {
    const { taskFunction } = taskQueue.shift();
    try {
      await taskFunction();
    } catch (error) {
      console.error('Task execution failed:', error);
    }

    if (Date.now() - startTime >= timeSliceMs) {
      await setTimeout(0); // Yield to the event loop
    }
  }
}

/**
 * Utility function to create a long-running task split into smaller chunks.
 * @param {Function} chunkFunction - Function that processes one chunk of work.
 * @param {number} totalChunks - Total number of chunks to process.
 * @returns {Function} - A task function suitable for addTask().
 */
export function createChunkedTask(chunkFunction, totalChunks) {
  if (typeof chunkFunction !== 'function') {
    throw new TypeError('Chunk function must be a function.');
  }
  if (!Number.isInteger(totalChunks) || totalChunks <= 0) {
    throw new RangeError('Total chunks must be a positive integer.');
  }

  return async function () {
    for (let i = 0; i < totalChunks; i++) {
      try {
        await chunkFunction(i, totalChunks);
      } catch (error) {
        console.error(`Error in chunk ${i + 1}/${totalChunks}:`, error);
        break;
      }
    }
  };
}

/**
 * Example usage: A generic utility to simulate a long-running computation.
 * @param {number} chunkIndex - Index of the current chunk.
 * @param {number} totalChunks - Total number of chunks.
 * @returns {Promise<void>} - Resolves when the chunk is processed.
 */
export async function exampleChunkFunction(chunkIndex, totalChunks) {
  console.log(`Processing chunk ${chunkIndex + 1} of ${totalChunks}...`);
  await setTimeout(10); // Simulate async work
}

// Example: Add a chunked task to the scheduler
addTask(createChunkedTask(exampleChunkFunction, 5), 1);

// Example: Run the scheduler
runScheduler().then(() => {
  console.log('All tasks completed.');
});