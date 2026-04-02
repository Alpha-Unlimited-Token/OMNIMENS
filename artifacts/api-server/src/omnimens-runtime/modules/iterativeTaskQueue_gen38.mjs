/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: iterativeTaskQueue
 * Written: 2026-04-02T14:25:52.416Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// iterativeTaskQueue.mjs

import { performance } from 'node:perf_hooks';

/**
 * Utility module for managing long-running computations in iterative chunks.
 * Provides checkpoint-based state persistence and dynamic timeout handling.
 */

const DEFAULT_TIMEOUT_MS = 100; // Default maximum execution time per chunk

/**
 * Creates a new task queue for iterative computations.
 * @returns {Object} Task queue with methods to add, run, and manage tasks.
 */
export function createTaskQueue() {
  const tasks = new Map();

  /**
   * Adds a new task to the queue.
   * @param {string} taskId - Unique identifier for the task.
   * @param {Function} taskFunction - Function to execute. Must accept (state, checkpoint) args.
   * @param {Object} initialState - Initial state for the task.
   */
  function addTask(taskId, taskFunction, initialState = {}) {
    if (tasks.has(taskId)) {
      throw new Error(`Task with ID '${taskId}' already exists.`);
    }
    tasks.set(taskId, {
      taskFunction,
      state: initialState,
      checkpoint: null,
      completed: false
    });
  }

  /**
   * Runs a specific task iteratively until completion or timeout.
   * @param {string} taskId - ID of the task to run.
   * @param {number} timeoutMs - Maximum time to run in this invocation (default: DEFAULT_TIMEOUT_MS).
   * @returns {boolean} True if the task is completed, false otherwise.
   */
  function runTask(taskId, timeoutMs = DEFAULT_TIMEOUT_MS) {
    const task = tasks.get(taskId);
    if (!task) {
      throw new Error(`Task with ID '${taskId}' not found.`);
    }

    if (task.completed) {
      return true; // Task already completed
    }

    const startTime = performance.now();
    while (performance.now() - startTime < timeoutMs) {
      const { taskFunction, state, checkpoint } = task;
      const result = taskFunction(state, checkpoint);

      if (result.done) {
        task.completed = true;
        tasks.delete(taskId); // Cleanup completed task
        return true;
      }

      task.checkpoint = result.checkpoint;
    }

    return false; // Task not completed yet
  }

  /**
   * Checks if a task is completed.
   * @param {string} taskId - ID of the task to check.
   * @returns {boolean} True if the task is completed, false otherwise.
   */
  function isTaskCompleted(taskId) {
    const task = tasks.get(taskId);
    return task ? task.completed : false;
  }

  /**
   * Removes a task from the queue.
   * @param {string} taskId - ID of the task to remove.
   */
  function removeTask(taskId) {
    if (!tasks.has(taskId)) {
      throw new Error(`Task with ID '${taskId}' not found.`);
    }
    tasks.delete(taskId);
  }

  return {
    addTask,
    runTask,
    isTaskCompleted,
    removeTask
  };
}

/**
 * Example task function for demonstration purposes.
 * @param {Object} state - State object for the task.
 * @param {Object|null} checkpoint - Checkpoint data from previous iteration.
 * @returns {Object} Result object containing 'done' and 'checkpoint'.
 */
export function exampleTaskFunction(state, checkpoint) {
  const currentStep = checkpoint?.step || 0;
  const maxSteps = state.maxSteps || 10;

  if (currentStep >= maxSteps) {
    return { done: true, checkpoint: null };
  }

  return { done: false, checkpoint: { step: currentStep + 1 } };
}

/**
 * Utility function to create a timeout handler.
 * @param {number} timeoutMs - Timeout duration in milliseconds.
 * @returns {Promise} Resolves after the specified timeout.
 */
export function createTimeout(timeoutMs) {
  return new Promise(resolve => setTimeout(resolve, timeoutMs));
}