/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: distributedComputationScheduler
 * Written: 2026-04-02T14:27:29.828Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// distributedComputationScheduler.mjs

import { createHash } from 'crypto';

/**
 * Generates a unique task ID based on task data.
 * @param {any} taskData - The data representing the task.
 * @returns {string} - A unique hash for the task.
 */
export function generateTaskId(taskData) {
  const hash = createHash('sha256');
  hash.update(JSON.stringify(taskData));
  return hash.digest('hex');
}

/**
 * A class to manage distributed computation tasks with state persistence.
 */
export class DistributedComputationScheduler {
  constructor() {
    this.taskQueue = [];
    this.taskStates = new Map();
  }

  /**
   * Adds a new task to the queue.
   * @param {Function} taskFunction - The function to execute.
   * @param {any} initialState - The initial state of the task.
   */
  addTask(taskFunction, initialState) {
    const taskId = generateTaskId({ taskFunction: taskFunction.toString(), initialState });
    this.taskQueue.push({ taskId, taskFunction, state: initialState });
    this.taskStates.set(taskId, initialState);
  }

  /**
   * Executes the next task in the queue.
   * @returns {Promise<{ taskId, result}>} - The result of the task execution.
   */
  async executeNextTask() {
    if (this.taskQueue.length === 0) {
      throw new Error('No tasks in the queue.');
    }

    const { taskId, taskFunction, state } = this.taskQueue.shift();

    try {
      const result = await taskFunction(state);
      this.taskStates.delete(taskId); // Remove completed task state
      return { taskId, result };
    } catch (error) {
      // Re-enqueue the task with its last known state
      this.taskQueue.push({ taskId, taskFunction, state });
      throw error;
    }
  }

  /**
   * Gets the current state of a task.
   * @param {string} taskId - The ID of the task.
   * @returns {any} - The current state of the task.
   */
  getTaskState(taskId) {
    return this.taskStates.get(taskId);
  }

  /**
   * Checks if the task queue is empty.
   * @returns {boolean} - True if the queue is empty, false otherwise.
   */
  isQueueEmpty() {
    return this.taskQueue.length === 0;
  }
}

/**
 * Example utility function to divide a computation into smaller chunks.
 * @param {Function} computeFunction - The function to compute a chunk.
 * @param {number} totalChunks - The total number of chunks.
 * @returns {Function} - A task function for the scheduler.
 */
export function createChunkedTask(computeFunction, totalChunks) {
  let currentChunk = 0;

  return async function chunkedTask(state) {
    if (currentChunk >= totalChunks) {
      return state; // Task complete
    }

    const result = await computeFunction(currentChunk, state);
    currentChunk++;
    return result;
  };
}

/**
 * Utility to retry a function with exponential backoff.
 * @param {Function} fn - The function to retry.
 * @param {number} retries - The number of retries.
 * @param {number} delay - The initial delay in milliseconds.
 * @returns {Promise<any>} - The result of the function.
 */
export async function retryWithBackoff(fn, retries, delay) {
  let attempt = 0;
  while (attempt < retries) {
    try {
      return await fn();
    } catch (error) {
      if (attempt === retries - 1) {
        throw error;
      }
      await new Promise(resolve => setTimeout(resolve, delay * 2 ** attempt));
      attempt++;
    }
  }
}

/**
 * Utility to split an array into chunks.
 * @param {Array} array - The array to split.
 * @param {number} chunkSize - The size of each chunk.
 * @returns {Array[]} - An array of chunks.
 */
export function splitIntoChunks(array, chunkSize) {
  const chunks = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    chunks.push(array.slice(i, i + chunkSize));
  }
  return chunks;
}