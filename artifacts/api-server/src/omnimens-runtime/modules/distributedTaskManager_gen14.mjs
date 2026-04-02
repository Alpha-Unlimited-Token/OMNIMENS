/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: distributedTaskManager
 * Written: 2026-04-02T15:13:49.557Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// distributedTaskManager.mjs

import { Worker, isMainThread, parentPort } from 'worker_threads';
import { createHash } from 'crypto';

/**
 * Splits a long-running computation into smaller tasks and distributes them across subprocesses with dependency resolution and checkpointing.
 */

// Utility function to hash task identifiers for checkpointing
export function generateTaskHash(taskId) {
  const hash = createHash('sha256');
  hash.update(taskId);
  return hash.digest('hex');
}

// Function to create a task graph with dependencies
export function createTaskGraph(tasks) {
  const graph = new Map();

  tasks.forEach(({ id, dependencies }) => {
    graph.set(id, { dependencies: new Set(dependencies), completed: false });
  });

  return graph;
}

// Function to find ready tasks (tasks with no unmet dependencies)
export function findReadyTasks(taskGraph) {
  const readyTasks = [];

  for (const [taskId, { dependencies, completed }] of taskGraph.entries()) {
    if (!completed && dependencies.size === 0) {
      readyTasks.push(taskId);
    }
  }

  return readyTasks;
}

// Function to mark a task as completed and update dependencies
export function markTaskCompleted(taskGraph, taskId) {
  if (!taskGraph.has(taskId)) {
    throw new Error(`Task ${taskId} does not exist in the task graph.`);
  }

  taskGraph.get(taskId).completed = true;

  for (const task of taskGraph.values()) {
    task.dependencies.delete(taskId);
  }
}

// Worker thread function to execute a task
function executeTask(task, checkpointFn, completeFn) {
  try {
    const result = task.fn(...task.args);
    checkpointFn(task.id, result);
    completeFn(task.id, result);
  } catch (error) {
    completeFn(task.id, null, error);
  }
}

// Main function to distribute tasks across worker threads
export async function distributeTasks(tasks, checkpointFn, maxWorkers = 4) {
  if (!isMainThread) {
    throw new Error('distributeTasks must be called from the main thread.');
  }

  const taskGraph = createTaskGraph(tasks);
  const workers = new Set();
  const results = new Map();

  return new Promise((resolve, reject) => {
    function processNextTask() {
      if (workers.size >= maxWorkers) {
        return;
      }

      const readyTasks = findReadyTasks(taskGraph);

      if (readyTasks.length === 0 && workers.size === 0) {
        resolve(results);
        return;
      }

      for (const taskId of readyTasks) {
        const task = tasks.find(t => t.id === taskId);

        if (!task) {
          reject(new Error(`Task ${taskId} not found.`));
          return;
        }

        const worker = new Worker(__filename, { workerData: task });
        workers.add(worker);

        worker.on('message', ({ id, result, error }) => {
          workers.delete(worker);
          worker.terminate();

          if (error) {
            reject(error);
            return;
          }

          results.set(id, result);
          markTaskCompleted(taskGraph, id);
          processNextTask();
        });

        worker.on('error', reject);
        worker.on('exit', code => {
          if (code !== 0) {
            reject(new Error(`Worker stopped with exit code ${code}`));
          }
        });

        worker.postMessage(task);
      }
    }

    processNextTask();
  });
}

if (!isMainThread) {
  const { workerData } = require('worker_threads');
  const { id, fn, args } = workerData;

  try {
    const result = fn(...args);
    parentPort.postMessage({ id, result });
  } catch (error) {
    parentPort.postMessage({ id, error: error.message });
  }
}