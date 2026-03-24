/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: asyncApiOptimizer
 * Written: 2026-03-24T06:08:07.719Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// asyncApiOptimizer.mjs

import { setTimeout } from 'timers/promises';

// A priority-based task queue with dynamic rate adjustment
const taskQueue = [];
let isProcessing = false;
let apiRateLimit = 1000; // Default API rate limit in ms

/**
 * Adds a task to the queue with a specified priority.
 * @param {Function} taskFunction - The async function representing the task.
 * @param {number} priority - The priority of the task (lower number = higher priority).
 */
export function addTask(taskFunction, priority = 10) {
  taskQueue.push({ taskFunction, priority });
  taskQueue.sort((a, b) => a.priority - b.priority); // Sort by priority
  processQueue();
}

/**
 * Dynamically adjusts the API rate limit based on observed throughput.
 * @param {number} newRateLimit - The new rate limit in milliseconds.
 */
export function adjustRateLimit(newRateLimit) {
  apiRateLimit = Math.max(1, newRateLimit); // Ensure rate limit is at least 1ms
}

/**
 * Processes the task queue asynchronously while respecting the API rate limit.
 */
async function processQueue() {
  if (isProcessing) return; // Prevent multiple concurrent processors
  isProcessing = true;

  while (taskQueue.length > 0) {
    const { taskFunction } = taskQueue.shift(); // Get the highest priority task
    try {
      await taskFunction();
    } catch (error) {
      console.error('Task execution failed:', error);
    }
    await setTimeout(apiRateLimit); // Respect the rate limit
  }

  isProcessing = false;
}

/**
 * Utility function to create a reusable task with context.
 * @param {Function} taskLogic - The logic of the task to be executed.
 * @param {object} context - Shared context object for the task.
 * @returns {Function} - A wrapped task function that can be added to the queue.
 */
export function createContextualTask(taskLogic, context = {}) {
  return async function () {
    try {
      await taskLogic(context);
    } catch (error) {
      console.error('Contextual task failed:', error);
    }
  };
}

/**
 * Utility function to get the current queue size.
 * @returns {number} - The number of tasks in the queue.
 */
export function getQueueSize() {
  return taskQueue.length;
}

/**
 * Utility function to clear all tasks in the queue.
 */
export function clearQueue() {
  taskQueue.length = 0;
}

/**
 * Example task logic for demonstration purposes.
 * @param {object} context - Shared context object.
 */
export async function exampleTaskLogic(context) {
  console.log('Executing task with context:', context);
  // Simulate task work
  await setTimeout(500);
}

// Example usage (can be removed in production):
// const task = createContextualTask(exampleTaskLogic, { userId: 123 });
// addTask(task, 5);
// adjustRateLimit(500);
