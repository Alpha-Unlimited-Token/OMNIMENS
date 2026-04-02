/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: chainedTaskExecutor
 * Written: 2026-04-02T14:53:16.352Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// chainedTaskExecutor.mjs

import { createHash } from 'crypto';

/**
 * Generates a unique hash for a given task state.
 * Useful for checkpointing and ensuring task uniqueness.
 */
export function generateTaskHash(taskState) {
  const hash = createHash('sha256');
  hash.update(JSON.stringify(taskState));
  return hash.digest('hex');
}

/**
 * Splits a long-running task into smaller subtasks based on a dependency graph.
 * Each task is represented as a node with dependencies.
 */
export function createTaskGraph(tasks) {
  const taskMap = new Map();

  for (const task of tasks) {
    if (!task.id || !task.execute || !Array.isArray(task.dependencies)) {
      throw new Error('Each task must have an id, execute function, and dependencies array.');
    }
    taskMap.set(task.id, { ...task, status: 'pending' });
  }

  return taskMap;
}

/**
 * Resolves the next executable tasks based on their dependencies.
 */
export function getExecutableTasks(taskGraph) {
  const executableTasks = [];

  for (const [id, task] of taskGraph.entries()) {
    if (task.status === 'pending' && task.dependencies.every(dep => taskGraph.get(dep)?.status === 'completed')) {
      executableTasks.push(task);
    }
  }

  return executableTasks;
}

/**
 * Executes tasks asynchronously, checkpointing intermediate states.
 */
export async function executeTaskGraph(taskGraph, checkpointCallback) {
  while (true) {
    const executableTasks = getExecutableTasks(taskGraph);

    if (executableTasks.length === 0) {
      break;
    }

    await Promise.all(executableTasks.map(async (task) => {
      try {
        const result = await task.execute();
        task.status = 'completed';
        task.result = result;

        if (checkpointCallback) {
          checkpointCallback(task.id, result);
        }
      } catch (error) {
        task.status = 'failed';
        task.error = error;
      }
    }));
  }

  return Array.from(taskGraph.values()).map(task => ({ id: task.id, status: task.status, result: task.result, error: task.error }));
}

/**
 * Utility to reset a task graph's state for re-execution.
 */
export function resetTaskGraph(taskGraph) {
  for (const task of taskGraph.values()) {
    task.status = 'pending';
    delete task.result;
    delete task.error;
  }
}

/**
 * Example usage of the module.
 *
 * const tasks = [
 *   { id: 'task1', execute: async () => 1, dependencies: [] },
 *   { id: 'task2', execute: async () => 2, dependencies: ['task1'] },
 *   { id: 'task3', execute: async () => 3, dependencies: ['task1', 'task2'] },
 * ];
 *
 * const taskGraph = createTaskGraph(tasks);
 * const results = await executeTaskGraph(taskGraph, (id, result) => {
 *   console.log(`Checkpoint: Task ${id} completed with result ${result}`);
 * });
 * console.log(results);
 */