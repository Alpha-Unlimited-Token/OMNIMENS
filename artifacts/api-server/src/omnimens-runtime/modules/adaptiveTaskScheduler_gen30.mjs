/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: adaptiveTaskScheduler
 * Written: 2026-04-02T14:12:40.251Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// adaptiveTaskScheduler.mjs

import { performance } from 'node:perf_hooks';

/**
 * Breaks down a task into smaller sub-tasks based on a dependency graph and executes them sequentially within a time limit.
 * This ensures long-running computations are efficiently managed and prevents blocking.
 */

/**
 * Splits a large task into smaller sub-tasks based on a dependency graph.
 * @param {Object} dependencyGraph - An object where keys are task IDs and values are arrays of dependent task IDs.
 * @returns {Array} An array of task execution groups in dependency order.
 */
export function resolveTaskOrder(dependencyGraph) {
  const resolved = new Set();
  const result = [];

  function visit(task) {
    if (resolved.has(task)) return;
    if (!dependencyGraph[task]) {
      resolved.add(task);
      result.push(task);
      return;
    }

    for (const dep of dependencyGraph[task]) {
      visit(dep);
    }
    resolved.add(task);
    result.push(task);
  }

  for (const task in dependencyGraph) {
    visit(task);
  }

  return result;
}

/**
 * Executes a list of tasks sequentially within a given time limit per batch.
 * @param {Array} taskOrder - An array of task IDs in execution order.
 * @param {Object} taskFunctions - An object mapping task IDs to their corresponding functions.
 * @param {number} timeLimitMs - Maximum time (in milliseconds) to execute tasks in a single batch.
 * @returns {Promise} Resolves when all tasks are completed.
 */
export async function executeTasksWithLimit(taskOrder, taskFunctions, timeLimitMs) {
  let index = 0;

  while (index < taskOrder.length) {
    const startTime = performance.now();

    while (index < taskOrder.length && (performance.now() - startTime) < timeLimitMs) {
      const taskId = taskOrder[index];
      if (taskFunctions[taskId]) {
        await taskFunctions[taskId]();
      }
      index++;
    }

    // Yield control to avoid blocking the event loop
    await new Promise(resolve => setTimeout(resolve, 0));
  }
}

/**
 * Schedules and executes tasks based on a dependency graph and time constraints.
 * @param {Object} dependencyGraph - An object where keys are task IDs and values are arrays of dependent task IDs.
 * @param {Object} taskFunctions - An object mapping task IDs to their corresponding functions.
 * @param {number} timeLimitMs - Maximum time (in milliseconds) to execute tasks in a single batch.
 * @returns {Promise} Resolves when all tasks are completed.
 */
export async function adaptiveTaskScheduler(dependencyGraph, taskFunctions, timeLimitMs) {
  const taskOrder = resolveTaskOrder(dependencyGraph);
  await executeTasksWithLimit(taskOrder, taskFunctions, timeLimitMs);
}

/**
 * Utility function to validate a dependency graph for circular dependencies.
 * @param {Object} dependencyGraph - An object where keys are task IDs and values are arrays of dependent task IDs.
 * @returns {boolean} True if the graph is valid (no cycles), false otherwise.
 */
export function validateDependencyGraph(dependencyGraph) {
  const visited = new Set();
  const stack = new Set();

  function visit(task) {
    if (stack.has(task)) return false; // Cycle detected
    if (visited.has(task)) return true;

    visited.add(task);
    stack.add(task);

    for (const dep of dependencyGraph[task] || []) {
      if (!visit(dep)) return false;
    }

    stack.delete(task);
    return true;
  }

  for (const task in dependencyGraph) {
    if (!visit(task)) return false;
  }

  return true;
}

/**
 * Example usage:
 * const dependencyGraph = {
 *   task1: [],
 *   task2: ['task1'],
 *   task3: ['task1'],
 *   task4: ['task2', 'task3']
 * };
 * const taskFunctions = {
 *   task1: async () => console.log('Task 1 executed'),
 *   task2: async () => console.log('Task 2 executed'),
 *   task3: async () => console.log('Task 3 executed'),
 *   task4: async () => console.log('Task 4 executed')
 * };
 * adaptiveTaskScheduler(dependencyGraph, taskFunctions, 50);
 */