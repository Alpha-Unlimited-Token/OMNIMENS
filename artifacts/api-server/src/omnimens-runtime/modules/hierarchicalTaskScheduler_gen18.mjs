/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: hierarchicalTaskScheduler
 * Written: 2026-04-02T15:06:20.145Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// hierarchicalTaskScheduler.mjs

import { createHash } from 'crypto';

/**
 * Builds a dependency graph and schedules tasks based on topological sorting.
 * @param {Object} tasks - An object where keys are task IDs and values are arrays of dependent task IDs.
 * @returns {Array} - Ordered list of task IDs for execution.
 */
export function scheduleTasks(tasks) {
  const graph = new Map();
  const inDegree = new Map();
  const result = [];

  // Initialize graph and in-degree map
  for (const task of Object.keys(tasks)) {
    if (!graph.has(task)) graph.set(task, []);
    if (!inDegree.has(task)) inDegree.set(task, 0);

    for (const dependency of tasks[task]) {
      if (!graph.has(dependency)) graph.set(dependency, []);
      graph.get(dependency).push(task);
      inDegree.set(task, (inDegree.get(task) || 0) + 1);
    }
  }

  // Find all tasks with no dependencies (in-degree = 0)
  const queue = [];
  for (const [task, degree] of inDegree.entries()) {
    if (degree === 0) queue.push(task);
  }

  // Process tasks in topological order
  while (queue.length > 0) {
    const current = queue.shift();
    result.push(current);

    for (const dependent of graph.get(current)) {
      inDegree.set(dependent, inDegree.get(dependent) - 1);
      if (inDegree.get(dependent) === 0) queue.push(dependent);
    }
  }

  // Check for cycles (remaining tasks with in-degree > 0)
  if (result.length !== graph.size) {
    throw new Error("Cycle detected in task dependencies");
  }

  return result;
}

/**
 * Generates a unique hash for a given task configuration.
 * @param {Object} tasks - An object representing task dependencies.
 * @returns {string} - SHA256 hash of the task configuration.
 */
export function generateTaskHash(tasks) {
  const serialized = JSON.stringify(tasks, Object.keys(tasks).sort());
  return createHash('sha256').update(serialized).digest('hex');
}

/**
 * Validates the task dependency graph.
 * @param {Object} tasks - An object representing task dependencies.
 * @returns {boolean} - True if the graph is valid, false otherwise.
 */
export function validateTaskGraph(tasks) {
  try {
    scheduleTasks(tasks);
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Splits a large task graph into smaller independent subgraphs.
 * @param {Object} tasks - An object representing task dependencies.
 * @returns {Array} - Array of subgraphs (each subgraph is an object).
 */
export function splitTaskGraph(tasks) {
  const visited = new Set();
  const subgraphs = [];

  function dfs(task, subgraph) {
    if (visited.has(task)) return;
    visited.add(task);
    subgraph[task] = tasks[task];

    for (const dependency of tasks[task]) {
      dfs(dependency, subgraph);
    }
  }

  for (const task of Object.keys(tasks)) {
    if (!visited.has(task)) {
      const subgraph = {};
      dfs(task, subgraph);
      subgraphs.push(subgraph);
    }
  }

  return subgraphs;
}
