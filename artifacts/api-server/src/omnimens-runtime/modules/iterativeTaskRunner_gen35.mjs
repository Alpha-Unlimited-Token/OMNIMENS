/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: iterativeTaskRunner
 * Written: 2026-04-02T14:55:09.572Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// iterativeTaskRunner.mjs

import { createHash } from 'crypto';

/**
 * Generate a unique hash for a given task state.
 * @param {object} state - The state object to hash.
 * @returns {string} - A unique hash representing the state.
 */
export function generateStateHash(state) {
  const hash = createHash('sha256');
  hash.update(JSON.stringify(state));
  return hash.digest('hex');
}

/**
 * Create a task graph with dependencies.
 * @param {object[]} tasks - Array of task objects with dependencies.
 * @returns {object} - A graph representation of tasks and their dependencies.
 */
export function createTaskGraph(tasks) {
  const graph = new Map();

  for (const task of tasks) {
    graph.set(task.id, { ...task, completed: false });
  }

  return graph;
}

/**
 * Check if all dependencies of a task are completed.
 * @param {object} task - The task to check.
 * @param {Map} graph - The task graph.
 * @returns {boolean} - True if all dependencies are completed, false otherwise.
 */
export function areDependenciesCompleted(task, graph) {
  return task.dependencies.every(dep => graph.get(dep)?.completed);
}

/**
 * Execute tasks iteratively within a time limit.
 * @param {Map} graph - The task graph.
 * @param {function} taskExecutor - Function to execute a single task.
 * @param {number} timeLimitMs - Maximum time to run tasks in milliseconds.
 * @returns {boolean} - True if all tasks are completed, false otherwise.
 */
export function executeTasksIteratively(graph, taskExecutor, timeLimitMs) {
  const startTime = Date.now();

  for (const [taskId, task] of graph) {
    if (!task.completed && areDependenciesCompleted(task, graph)) {
      taskExecutor(task);
      task.completed = true;
    }

    if (Date.now() - startTime >= timeLimitMs) {
      return false; // Timeout reached, not all tasks completed
    }
  }

  return Array.from(graph.values()).every(task => task.completed);
}

/**
 * Save the state of the task graph for checkpointing.
 * @param {Map} graph - The task graph.
 * @returns {object} - A serializable representation of the graph state.
 */
export function saveCheckpoint(graph) {
  const state = {};

  for (const [taskId, task] of graph) {
    state[taskId] = { completed: task.completed };
  }

  return state;
}

/**
 * Load a task graph state from a checkpoint.
 * @param {Map} graph - The task graph.
 * @param {object} checkpoint - The checkpoint state to restore.
 */
export function loadCheckpoint(graph, checkpoint) {
  for (const [taskId, task] of graph) {
    if (checkpoint[taskId]) {
      task.completed = checkpoint[taskId].completed;
    }
  }
}

/**
 * Example task executor function.
 * @param {object} task - The task to execute.
 */
export function exampleTaskExecutor(task) {
  console.log(`Executing task: ${task.id}`);
}

// Example usage:
// const tasks = [
//   { id: 'task1', dependencies: [] },
//   { id: 'task2', dependencies: ['task1'] },
//   { id: 'task3', dependencies: ['task1', 'task2'] }
// ];
// const graph = createTaskGraph(tasks);
// executeTasksIteratively(graph, exampleTaskExecutor, 10000);