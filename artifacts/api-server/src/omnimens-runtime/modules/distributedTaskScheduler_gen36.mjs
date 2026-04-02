/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: distributedTaskScheduler
 * Written: 2026-04-02T14:54:53.273Z
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

import { EventEmitter } from 'events';

// Utility function to create a unique identifier for tasks
export function generateTaskId() {
  return crypto.randomUUID();
}

// Function to create a dependency graph for tasks
export function createTaskGraph(tasks) {
  const graph = new Map();

  tasks.forEach(({ id, dependencies }) => {
    graph.set(id, { dependencies: new Set(dependencies), complete: false });
  });

  return graph;
}

// Function to resolve dependencies asynchronously
export function resolveDependencies(taskGraph, taskExecutor) {
  const emitter = new EventEmitter();

  for (const [taskId, taskData] of taskGraph.entries()) {
    if (taskData.dependencies.size === 0) {
      emitter.emit('ready', taskId);
    }
  }

  emitter.on('ready', async (taskId) => {
    const taskData = taskGraph.get(taskId);
    if (!taskData.complete) {
      try {
        await taskExecutor(taskId);
        taskData.complete = true;

        for (const [dependentId, dependentData] of taskGraph.entries()) {
          dependentData.dependencies.delete(taskId);
          if (dependentData.dependencies.size === 0 && !dependentData.complete) {
            emitter.emit('ready', dependentId);
          }
        }
      } catch (error) {
        emitter.emit('error', { taskId, error });
      }
    }
  });

  return emitter;
}

// Function to execute tasks asynchronously with dependency resolution
export async function executeTasks(tasks, taskExecutor) {
  const taskGraph = createTaskGraph(tasks);
  const emitter = resolveDependencies(taskGraph, taskExecutor);

  return new Promise((resolve, reject) => {
    emitter.on('error', (errorInfo) => {
      reject(`Task ${errorInfo.taskId} failed: ${errorInfo.error.message}`);
    });

    emitter.on('ready', () => {
      if ([...taskGraph.values()].every((taskData) => taskData.complete)) {
        resolve('All tasks completed successfully');
      }
    });
  });
}

// Example usage function (to be removed in production, for demonstration only)
export async function exampleUsage() {
  const tasks = [
    { id: 'task1', dependencies: [] },
    { id: 'task2', dependencies: ['task1'] },
    { id: 'task3', dependencies: ['task1', 'task2'] }
  ];

  const taskExecutor = async (taskId) => {
    console.log(`Executing ${taskId}`);
    await new Promise((resolve) => setTimeout(resolve, 100));
  };

  try {
    const result = await executeTasks(tasks, taskExecutor);
    console.log(result);
  } catch (error) {
    console.error(error);
  }
}
