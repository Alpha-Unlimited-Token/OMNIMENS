/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: taskQueuingSystem
 * Written: 2026-04-02T14:10:39.177Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// taskQueuingSystem.mjs

import { createHash } from 'crypto';

/**
 * Generates a unique task ID based on task data.
 * @param {Object} taskData - The task data to hash.
 * @returns {string} - A unique task ID.
 */
export function generateTaskId(taskData) {
  const hash = createHash('sha256');
  hash.update(JSON.stringify(taskData));
  return hash.digest('hex');
}

/**
 * Creates a priority queue for task scheduling.
 * @returns {Object} - An object with enqueue, dequeue, and peek functions.
 */
export function createPriorityQueue() {
  const queue = [];

  return {
    /**
     * Adds a task to the queue with a given priority.
     * @param {Object} task - The task to enqueue.
     * @param {number} priority - The priority of the task (lower is higher priority).
     */
    enqueue(task, priority) {
      const newItem = { task, priority };
      let added = false;

      for (let i = 0; i < queue.length; i++) {
        if (queue[i].priority > priority) {
          queue.splice(i, 0, newItem);
          added = true;
          break;
        }
      }

      if (!added) {
        queue.push(newItem);
      }
    },

    /**
     * Removes and returns the highest-priority task from the queue.
     * @returns {Object|null} - The highest-priority task or null if the queue is empty.
     */
    dequeue() {
      return queue.length > 0 ? queue.shift().task : null;
    },

    /**
     * Returns the highest-priority task without removing it.
     * @returns {Object|null} - The highest-priority task or null if the queue is empty.
     */
    peek() {
      return queue.length > 0 ? queue[0].task : null;
    },

    /**
     * Checks if the queue is empty.
     * @returns {boolean} - True if the queue is empty, false otherwise.
     */
    isEmpty() {
      return queue.length === 0;
    }
  };
}

/**
 * Persists a task's state to a simulated database (in-memory for this example).
 * @param {Map} db - The in-memory database.
 * @param {string} taskId - The unique task ID.
 * @param {Object} state - The task's state to persist.
 */
export function persistTaskState(db, taskId, state) {
  db.set(taskId, state);
}

/**
 * Retrieves a task's state from the simulated database.
 * @param {Map} db - The in-memory database.
 * @param {string} taskId - The unique task ID.
 * @returns {Object|null} - The retrieved state or null if not found.
 */
export function retrieveTaskState(db, taskId) {
  return db.has(taskId) ? db.get(taskId) : null;
}

/**
 * Deletes a task's state from the simulated database.
 * @param {Map} db - The in-memory database.
 * @param {string} taskId - The unique task ID.
 */
export function deleteTaskState(db, taskId) {
  db.delete(taskId);
}

/**
 * Executes a task and allows pausing/resuming by persisting intermediate states.
 * @param {Function} taskFunction - The task function to execute.
 * @param {Object} initialState - The initial state of the task.
 * @param {Function} shouldPause - A function that determines if the task should pause.
 * @param {Map} db - The in-memory database for state persistence.
 * @returns {Promise<void>} - Resolves when the task completes.
 */
export async function executeTask(taskFunction, initialState, shouldPause, db) {
  let state = initialState;
  const taskId = generateTaskId(initialState);

  while (true) {
    if (shouldPause(state)) {
      persistTaskState(db, taskId, state);
      break;
    }

    state = await taskFunction(state);

    if (state.isComplete) {
      deleteTaskState(db, taskId);
      break;
    }
  }
}

// Example usage:
// const queue = createPriorityQueue();
// const db = new Map();
// enqueue tasks, persist states, and execute them as needed.