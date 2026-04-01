/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: distributedTaskScheduler
 * Written: 2026-04-01T22:03:46.052Z
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
 * Represents a single task in the task graph.
 * @typedef {Object} Task
 * @property {string} id - Unique identifier for the task.
 * @property {Array<string>} dependencies - List of task IDs this task depends on.
 * @property {Function} execute - The function to execute this task. Must return a Promise.
 */

/**
 * Resolves and executes tasks in a distributed task graph.
 * Handles dependency resolution, avoids circular dependencies, and persists intermediate states in memory.
 */
export class DistributedTaskScheduler {
  constructor() {
    this.tasks = new Map();
    this.results = new Map();
    this.eventEmitter = new EventEmitter();
  }

  /**
   * Adds a task to the scheduler.
   * @param {Task} task - The task to add.
   */
  addTask(task) {
    if (this.tasks.has(task.id)) {
      throw new Error(`Task with ID '${task.id}' already exists.`);
    }
    this.tasks.set(task.id, { ...task, status: 'pending' });
  }

  /**
   * Validates the task graph for circular dependencies.
   * @private
   */
  validateGraph() {
    const visited = new Set();
    const stack = new Set();

    const visit = (taskId) => {
      if (stack.has(taskId)) {
        throw new Error(`Circular dependency detected involving task '${taskId}'.`);
      }
      if (!visited.has(taskId)) {
        stack.add(taskId);
        const task = this.tasks.get(taskId);
        if (task) {
          for (const dep of task.dependencies) {
            visit(dep);
          }
        }
        stack.delete(taskId);
        visited.add(taskId);
      }
    };

    for (const taskId of this.tasks.keys()) {
      visit(taskId);
    }
  }

  /**
   * Executes the task graph.
   * @returns {Promise<Map<string, any>>} - A promise that resolves with the results of all tasks.
   */
  async execute() {
    this.validateGraph();

    const executeTask = async (taskId) => {
      const task = this.tasks.get(taskId);
      if (!task) {
        throw new Error(`Task '${taskId}' not found.`);
      }
      if (task.status === 'completed') {
        return this.results.get(taskId);
      }
      if (task.status === 'running') {
        throw new Error(`Task '${taskId}' is already running. Possible cyclic dependency.`);
      }

      task.status = 'running';

      // Resolve dependencies first
      const dependencyResults = [];
      for (const dep of task.dependencies) {
        dependencyResults.push(await executeTask(dep));
      }

      // Execute the task
      try {
        const result = await task.execute(...dependencyResults);
        this.results.set(taskId, result);
        task.status = 'completed';
        this.eventEmitter.emit('taskCompleted', taskId, result);
        return result;
      } catch (error) {
        task.status = 'failed';
        throw new Error(`Task '${taskId}' failed: ${error.message}`);
      }
    };

    const promises = Array.from(this.tasks.keys()).map((taskId) => executeTask(taskId));
    await Promise.allSettled(promises);
    return this.results;
  }

  /**
   * Registers a listener for task completion events.
   * @param {Function} listener - The listener function.
   */
  onTaskCompleted(listener) {
    this.eventEmitter.on('taskCompleted', listener);
  }
}

/**
 * Utility function to create a simple task.
 * @param {string} id - The task ID.
 * @param {Array<string>} dependencies - Task dependencies.
 * @param {Function} execute - The task execution function.
 * @returns {Task} - The created task.
 */
export function createTask(id, dependencies, execute) {
  return { id, dependencies, execute };
}

/**
 * Utility function to delay execution for a given duration.
 * @param {number} ms - Milliseconds to delay.
 * @returns {Promise<void>} - A promise that resolves after the delay.
 */
export function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}