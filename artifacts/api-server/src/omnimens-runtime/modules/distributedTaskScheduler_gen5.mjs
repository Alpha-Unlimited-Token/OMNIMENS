/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: distributedTaskScheduler
 * Written: 2026-04-02T15:13:19.329Z
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

/**
 * Breaks down computationally intensive processes into smaller, asynchronous tasks
 * and resolves dependencies using a task graph.
 */

// Utility function to create a unique ID for tasks
export function generateTaskId() {
  return crypto.randomUUID();
}

// Task Scheduler Class
export class DistributedTaskScheduler {
  constructor() {
    this.taskGraph = new Map(); // Stores tasks and their dependencies
    this.results = new Map(); // Stores task results
    this.eventEmitter = new EventEmitter();
  }

  /**
   * Adds a task to the scheduler.
   * @param {string} taskId - Unique ID for the task.
   * @param {function} taskFunction - The function to execute.
   * @param {Array<string>} dependencies - Array of task IDs this task depends on.
   */
  addTask(taskId, taskFunction, dependencies = []) {
    if (this.taskGraph.has(taskId)) {
      throw new Error(`Task with ID ${taskId} already exists.`);
    }
    this.taskGraph.set(taskId, { taskFunction, dependencies, status: 'pending' });
  }

  /**
   * Executes tasks in the graph, resolving dependencies incrementally.
   * @returns {Promise<Map<string, any>>} - Resolves with a map of task results.
   */
  async executeTasks() {
    const pendingTasks = Array.from(this.taskGraph.keys());

    while (pendingTasks.length > 0) {
      for (const taskId of pendingTasks) {
        const task = this.taskGraph.get(taskId);

        if (task.status === 'completed') {
          pendingTasks.splice(pendingTasks.indexOf(taskId), 1);
          continue;
        }

        const dependenciesResolved = task.dependencies.every(dep => this.results.has(dep));

        if (dependenciesResolved) {
          try {
            const dependencyResults = task.dependencies.map(dep => this.results.get(dep));
            const result = await task.taskFunction(...dependencyResults);
            this.results.set(taskId, result);
            task.status = 'completed';
            this.eventEmitter.emit('taskCompleted', taskId, result);
          } catch (error) {
            task.status = 'failed';
            this.eventEmitter.emit('taskFailed', taskId, error);
            throw new Error(`Task ${taskId} failed: ${error.message}`);
          }
        }
      }
    }

    return this.results;
  }

  /**
   * Subscribes to task events.
   * @param {string} event - Event name ('taskCompleted', 'taskFailed').
   * @param {function} listener - Callback function.
   */
  on(event, listener) {
    this.eventEmitter.on(event, listener);
  }
}

// Example utility function for generic task processing
export function createIncrementalTaskFunction(baseValue, increment) {
  return function () {
    return baseValue + increment;
  };
}

// Example utility function for dependency resolution
export function resolveDependencies(taskResults, dependencyIds) {
  return dependencyIds.map(id => taskResults.get(id));
}