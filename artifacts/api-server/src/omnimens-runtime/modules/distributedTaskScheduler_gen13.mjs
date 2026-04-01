/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: distributedTaskScheduler
 * Written: 2026-04-01T22:11:26.776Z
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

import { performance } from 'node:perf_hooks';

/**
 * Splits long-running computations into smaller asynchronous tasks,
 * resolves dependencies, and executes incrementally using Promises.
 */

/**
 * Partitions a task graph into independent sub-tasks.
 * @param {Object} taskGraph - A directed acyclic graph (DAG) of tasks.
 * @returns {Array} - Ordered list of task batches based on dependencies.
 */
export function partitionTaskGraph(taskGraph) {
  const inDegree = new Map();
  const adjacencyList = new Map();

  for (const [task, dependencies] of Object.entries(taskGraph)) {
    inDegree.set(task, dependencies.length);
    for (const dep of dependencies) {
      if (!adjacencyList.has(dep)) adjacencyList.set(dep, []);
      adjacencyList.get(dep).push(task);
    }
  }

  const queue = [];
  for (const [task, degree] of inDegree.entries()) {
    if (degree === 0) queue.push(task);
  }

  const batches = [];
  while (queue.length > 0) {
    const batch = [];
    const nextQueue = [];

    for (const task of queue) {
      batch.push(task);
      if (adjacencyList.has(task)) {
        for (const dependent of adjacencyList.get(task)) {
          inDegree.set(dependent, inDegree.get(dependent) - 1);
          if (inDegree.get(dependent) === 0) nextQueue.push(dependent);
        }
      }
    }

    batches.push(batch);
    queue.splice(0, queue.length, ...nextQueue);
  }

  return batches;
}

/**
 * Executes task batches incrementally using Promises.
 * @param {Array} taskBatches - Ordered list of task batches.
 * @param {Function} taskExecutor - Function to execute individual tasks.
 * @returns {Promise} - Resolves when all tasks are completed.
 */
export async function executeTaskBatches(taskBatches, taskExecutor) {
  for (const batch of taskBatches) {
    await Promise.all(batch.map(taskExecutor));
  }
}

/**
 * Utility to measure execution time of a function.
 * @param {Function} func - Function to measure.
 * @param {...any} args - Arguments to pass to the function.
 * @returns {Object} - Contains result and execution time.
 */
export function measureExecutionTime(func, ...args) {
  const start = performance.now();
  const result = func(...args);
  const end = performance.now();
  return { result, time: end - start };
}

/**
 * Example usage: Define a task graph and executor.
 */
const exampleTaskGraph = {
  task1: [],
  task2: ['task1'],
  task3: ['task1'],
  task4: ['task2', 'task3']
};

async function exampleTaskExecutor(task) {
  console.log(`Executing ${task}`);
  await new Promise(resolve => setTimeout(resolve, 100));
}

(async () => {
  const taskBatches = partitionTaskGraph(exampleTaskGraph);
  await executeTaskBatches(taskBatches, exampleTaskExecutor);
})();