/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: iterativeTaskManager
 * Written: 2026-04-01T22:11:36.266Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// iterativeTaskManager.mjs

import { setTimeout } from 'timers/promises';

// Task Queue to manage tasks and intermediate states
const taskQueue = [];

// Internal state store
const stateStore = new Map();

/**
 * Adds a task to the queue.
 * @param {string} taskId - Unique identifier for the task.
 * @param {Function} taskFunction - The function to execute in chunks.
 * @param {Object} initialState - The initial state for the task.
 */
export function addTask(taskId, taskFunction, initialState = {}) {
  if (stateStore.has(taskId)) {
    throw new Error(`Task with ID '${taskId}' already exists.`);
  }
  stateStore.set(taskId, { ...initialState, isComplete: false });
  taskQueue.push({ taskId, taskFunction });
}

/**
 * Executes the next task in the queue.
 * @param {number} chunkSize - Number of iterations to execute in one chunk.
 * @returns {Promise<void>} Resolves when the task chunk is complete.
 */
export async function executeNextTask(chunkSize = 1) {
  if (taskQueue.length === 0) {
    throw new Error('No tasks in the queue to execute.');
  }

  const { taskId, taskFunction } = taskQueue[0];
  const taskState = stateStore.get(taskId);

  if (!taskState || taskState.isComplete) {
    taskQueue.shift();
    return;
  }

  for (let i = 0; i < chunkSize; i++) {
    const result = taskFunction(taskState);

    if (taskState.isComplete) {
      taskQueue.shift();
      break;
    }

    if (result instanceof Promise) {
      await result;
    }
  }
}

/**
 * Retrieves the state of a task.
 * @param {string} taskId - Unique identifier for the task.
 * @returns {Object} The state of the task.
 */
export function getTaskState(taskId) {
  if (!stateStore.has(taskId)) {
    throw new Error(`Task with ID '${taskId}' does not exist.`);
  }
  return stateStore.get(taskId);
}

/**
 * Removes a task and its state from the system.
 * @param {string} taskId - Unique identifier for the task.
 */
export function removeTask(taskId) {
  if (!stateStore.has(taskId)) {
    throw new Error(`Task with ID '${taskId}' does not exist.`);
  }
  stateStore.delete(taskId);
}

/**
 * Example utility function for chunking a long-running computation.
 * @param {Object} state - The state object for the computation.
 * @param {Function} computeFunction - The function to execute for each step.
 * @param {number} totalSteps - Total number of steps required to complete.
 */
export function chunkedComputation(state, computeFunction, totalSteps) {
  if (!state.currentStep) {
    state.currentStep = 0;
  }

  for (let i = 0; i < totalSteps; i++) {
    if (state.currentStep >= totalSteps) {
      state.isComplete = true;
      break;
    }

    computeFunction(state.currentStep);
    state.currentStep++;
  }
}

/**
 * Async delay utility for simulating long-running tasks.
 * @param {number} ms - Milliseconds to wait.
 * @returns {Promise<void>} Resolves after the specified delay.
 */
export async function delay(ms) {
  await setTimeout(ms);
}

/**
 * Clears all tasks and states (useful for testing or resetting the system).
 */
export function clearAllTasks() {
  taskQueue.length = 0;
  stateStore.clear();
}