/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: distributedTaskScheduler
 * Written: 2026-04-02T13:30:39.691Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// distributedTaskScheduler.mjs
import { createHash } from 'crypto';

/**
 * Generates a unique hash for task state persistence.
 * @param {string} input - The input string to hash.
 * @returns {string} - A unique hash string.
 */
export function generateTaskHash(input) {
  const hash = createHash('sha256');
  hash.update(input);
  return hash.digest('hex');
}

/**
 * Splits a large task into smaller subtasks.
 * @param {Array} taskData - The data to be processed.
 * @param {number} chunkSize - The size of each chunk.
 * @returns {Array} - An array of subtasks.
 */
export function splitTask(taskData, chunkSize) {
  const subtasks = [];
  for (let i = 0; i < taskData.length; i += chunkSize) {
    subtasks.push(taskData.slice(i, i + chunkSize));
  }
  return subtasks;
}

/**
 * Executes a subtask with a given processing function.
 * @param {Array} subtask - The subtask data to process.
 * @param {Function} processFunction - The function to process the data.
 * @returns {Array} - The processed subtask result.
 */
export function executeSubtask(subtask, processFunction) {
  return subtask.map(processFunction);
}

/**
 * Saves the intermediate state of a task.
 * @param {string} taskId - The unique task identifier.
 * @param {Object} state - The state to save.
 * @param {Map} stateStore - The in-memory state store.
 */
export function saveState(taskId, state, stateStore) {
  stateStore.set(taskId, state);
}

/**
 * Restores the intermediate state of a task.
 * @param {string} taskId - The unique task identifier.
 * @param {Map} stateStore - The in-memory state store.
 * @returns {Object|null} - The restored state or null if not found.
 */
export function restoreState(taskId, stateStore) {
  return stateStore.get(taskId) || null;
}

/**
 * Schedules and executes a distributed task.
 * @param {Array} taskData - The data to process.
 * @param {number} chunkSize - The size of each subtask.
 * @param {Function} processFunction - The function to process the data.
 * @returns {Array} - The final aggregated results.
 */
export function scheduleTask(taskData, chunkSize, processFunction) {
  const stateStore = new Map();
  const taskId = generateTaskHash(JSON.stringify(taskData));
  const subtasks = splitTask(taskData, chunkSize);
  const results = [];

  for (let i = 0; i < subtasks.length; i++) {
    const subtaskId = `${taskId}-${i}`;
    const savedState = restoreState(subtaskId, stateStore);

    if (savedState) {
      results.push(...savedState);
    } else {
      const processed = executeSubtask(subtasks[i], processFunction);
      saveState(subtaskId, processed, stateStore);
      results.push(...processed);
    }
  }

  return results;
}

/**
 * Clears the state store for a given task.
 * @param {string} taskId - The unique task identifier.
 * @param {Map} stateStore - The in-memory state store.
 */
export function clearState(taskId, stateStore) {
  for (const key of stateStore.keys()) {
    if (key.startsWith(taskId)) {
      stateStore.delete(key);
    }
  }
}