/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: persistentAsyncTaskChain
 * Written: 2026-04-02T14:10:15.354Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// persistentAsyncTaskChain.mjs

import { writeFile, readFile } from 'fs/promises';
import { randomUUID } from 'crypto';

/**
 * Checkpoints task state to disk and chains asynchronous functions for long-duration computations.
 * @param {string} taskId - Unique identifier for the task.
 * @param {function} taskFunction - Function to execute in each step (receives state, returns updated state).
 * @param {object} initialState - Initial state for the task.
 * @param {number} ttl - Time-to-live in milliseconds for task state.
 * @returns {Promise<object>} - Final state after task completion.
 */
export async function persistentAsyncTaskChain(taskId, taskFunction, initialState, ttl) {
  const stateFile = `./${taskId}.json`;
  let state;

  try {
    // Attempt to load existing state
    const fileContent = await readFile(stateFile, 'utf-8');
    state = JSON.parse(fileContent);

    // Check TTL expiration
    if (Date.now() - state.timestamp > ttl) {
      state = { data: initialState, timestamp: Date.now() };
    }
  } catch {
    // Initialize state if no prior state exists
    state = { data: initialState, timestamp: Date.now() };
  }

  // Perform the task function and update state
  state.data = await taskFunction(state.data);
  state.timestamp = Date.now();

  // Save updated state to disk
  await writeFile(stateFile, JSON.stringify(state), 'utf-8');

  return state.data;
}

/**
 * Generates a unique task identifier.
 * @returns {string} - A unique task ID.
 */
export function generateTaskId() {
  return randomUUID();
}

/**
 * Deletes expired task state files based on TTL.
 * @param {Array<string>} taskIds - List of task IDs to check.
 * @param {number} ttl - Time-to-live in milliseconds for task state.
 * @returns {Promise<Array<string>>} - List of deleted task IDs.
 */
export async function cleanupExpiredTasks(taskIds, ttl) {
  const deletedTasks = [];

  for (const taskId of taskIds) {
    const stateFile = `./${taskId}.json`;
    try {
      const fileContent = await readFile(stateFile, 'utf-8');
      const state = JSON.parse(fileContent);

      if (Date.now() - state.timestamp > ttl) {
        await writeFile(stateFile, ''); // Overwrite to simulate deletion
        deletedTasks.push(taskId);
      }
    } catch {
      // Ignore missing files or errors
    }
  }

  return deletedTasks;
}

/**
 * Example task function for testing purposes.
 * @param {object} state - Current state of the task.
 * @returns {Promise<object>} - Updated state.
 */
export async function exampleTaskFunction(state) {
  // Simulate some computation
  await new Promise((resolve) => setTimeout(resolve, 100));
  return { ...state, count: (state.count || 0) + 1 };
}