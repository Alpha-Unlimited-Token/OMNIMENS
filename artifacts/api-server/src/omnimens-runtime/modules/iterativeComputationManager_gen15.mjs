/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: iterativeComputationManager
 * Written: 2026-04-02T15:14:06.106Z
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

import crypto from 'crypto';

/**
 * Utility function to serialize a state object into a JSON string.
 * Ensures consistent serialization for checkpointing.
 * @param {object} state - The state object to serialize.
 * @returns {string} - Serialized JSON string.
 */
export function serializeState(state) {
  return JSON.stringify(state);
}

/**
 * Utility function to deserialize a JSON string back into a state object.
 * Handles parsing errors gracefully.
 * @param {string} serializedState - The JSON string to deserialize.
 * @returns {object|null} - Deserialized state object or null if invalid.
 */
export function deserializeState(serializedState) {
  try {
    return JSON.parse(serializedState);
  } catch (error) {
    return null;
  }
}

/**
 * Generates a unique identifier for a computation task.
 * Useful for tracking tasks across iterations.
 * @returns {string} - A unique identifier string.
 */
export function generateTaskId() {
  return crypto.randomUUID();
}

/**
 * Creates an iterative computation manager instance.
 * Provides methods for managing asynchronous iterative computations.
 * @returns {object} - Computation manager with utility methods.
 */
export function createComputationManager() {
  const taskQueue = new Map();

  return {
    /**
     * Adds a new task to the queue.
     * @param {string} taskId - Unique identifier for the task.
     * @param {function} computationFunction - Function representing the computation.
     * @param {object} initialState - Initial state for the computation.
     */
    addTask(taskId, computationFunction, initialState) {
      if (taskQueue.has(taskId)) {
        throw new Error(`Task with ID ${taskId} already exists.`);
      }
      taskQueue.set(taskId, {
        computationFunction,
        state: initialState,
        completed: false
      });
    },

    /**
     * Executes the next iteration of a task.
     * @param {string} taskId - Unique identifier for the task.
     * @returns {object|null} - Updated state or null if task is completed.
     */
    executeTaskIteration(taskId) {
      const task = taskQueue.get(taskId);
      if (!task) {
        throw new Error(`Task with ID ${taskId} not found.`);
      }
      if (task.completed) {
        return null;
      }

      const { computationFunction, state } = task;
      const newState = computationFunction(state);

      if (newState === null || newState.completed) {
        task.completed = true;
        taskQueue.delete(taskId);
        return null;
      }

      task.state = newState;
      return newState;
    },

    /**
     * Retrieves the current state of a task.
     * @param {string} taskId - Unique identifier for the task.
     * @returns {object|null} - Current state or null if task is completed.
     */
    getTaskState(taskId) {
      const task = taskQueue.get(taskId);
      return task ? task.state : null;
    },

    /**
     * Removes a task from the queue.
     * @param {string} taskId - Unique identifier for the task.
     */
    removeTask(taskId) {
      taskQueue.delete(taskId);
    },

    /**
     * Lists all active task IDs.
     * @returns {Array<string>} - Array of active task IDs.
     */
    listActiveTasks() {
      return Array.from(taskQueue.keys());
    }
  };
}

/**
 * Example computation function for testing.
 * Simulates iterative computation by incrementing a counter.
 * @param {object} state - Current state object.
 * @returns {object} - Updated state object.
 */
export function exampleComputationFunction(state) {
  const { counter, maxIterations } = state;
  if (counter >= maxIterations) {
    return { ...state, completed: true };
  }
  return { ...state, counter: counter + 1 };
}