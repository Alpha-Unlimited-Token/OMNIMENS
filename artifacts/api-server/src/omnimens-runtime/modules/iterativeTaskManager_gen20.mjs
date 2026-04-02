/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: iterativeTaskManager
 * Written: 2026-04-02T14:24:39.215Z
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

import { createHash } from 'crypto';

/**
 * Generates a unique hash for a task state object.
 * @param {Object} state - The task state to hash.
 * @returns {string} - A unique hash string.
 */
export function generateStateHash(state) {
  const hash = createHash('sha256');
  hash.update(JSON.stringify(state));
  return hash.digest('hex');
}

/**
 * Breaks a long-running task into smaller subprocesses.
 * @param {Array} tasks - Array of task objects with dependencies.
 * @returns {Object} - A directed acyclic graph (DAG) of tasks.
 */
export function createTaskGraph(tasks) {
  const graph = new Map();

  tasks.forEach(task => {
    if (!task.id || !Array.isArray(task.dependencies)) {
      throw new Error('Each task must have an id and a dependencies array.');
    }
    graph.set(task.id, { ...task, status: 'pending' });
  });

  tasks.forEach(task => {
    task.dependencies.forEach(dep => {
      if (!graph.has(dep)) {
        throw new Error(`Dependency ${dep} for task ${task.id} not found.`);
      }
    });
  });

  return graph;
}

/**
 * Executes tasks asynchronously, respecting dependencies.
 * @param {Map} taskGraph - The DAG of tasks.
 * @param {Function} taskExecutor - A function to execute each task.
 * @returns {Promise<Map>} - Resolves with the updated task graph.
 */
export async function executeTaskGraph(taskGraph, taskExecutor) {
  const completed = new Set();

  async function executeTask(taskId) {
    const task = taskGraph.get(taskId);

    if (task.status === 'completed') return;

    for (const dep of task.dependencies) {
      if (!completed.has(dep)) {
        await executeTask(dep);
      }
    }

    task.status = 'in-progress';
    await taskExecutor(task);
    task.status = 'completed';
    completed.add(taskId);
  }

  const promises = Array.from(taskGraph.keys()).map(taskId => executeTask(taskId));
  await Promise.all(promises);

  return taskGraph;
}

/**
 * Serializes the current state of the task graph.
 * @param {Map} taskGraph - The DAG of tasks.
 * @returns {string} - A JSON string representing the task graph.
 */
export function serializeTaskGraph(taskGraph) {
  const serialized = {};
  taskGraph.forEach((task, id) => {
    serialized[id] = task;
  });
  return JSON.stringify(serialized);
}

/**
 * Deserializes a JSON string into a task graph.
 * @param {string} json - The JSON string representing the task graph.
 * @returns {Map} - The reconstructed task graph.
 */
export function deserializeTaskGraph(json) {
  const parsed = JSON.parse(json);
  const graph = new Map();
  Object.entries(parsed).forEach(([id, task]) => {
    graph.set(id, task);
  });
  return graph;
}

/**
 * Example task executor for demonstration purposes.
 * @param {Object} task - The task to execute.
 * @returns {Promise<void>} - Resolves when the task is done.
 */
export async function exampleTaskExecutor(task) {
  console.log(`Executing task: ${task.id}`);
  await new Promise(resolve => setTimeout(resolve, 100)); // Simulate async work
  console.log(`Completed task: ${task.id}`);
}

// Example usage (commented out for production):
// const tasks = [
//   { id: 'task1', dependencies: [] },
//   { id: 'task2', dependencies: ['task1'] },
//   { id: 'task3', dependencies: ['task1'] },
//   { id: 'task4', dependencies: ['task2', 'task3'] }
// ];
// const graph = createTaskGraph(tasks);
// executeTaskGraph(graph, exampleTaskExecutor).then(updatedGraph => {
//   console.log('All tasks completed:', serializeTaskGraph(updatedGraph));
// });