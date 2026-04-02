/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: asyncTaskManager
 * Written: 2026-04-02T15:06:46.959Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// asyncTaskManager.mjs

import { EventEmitter } from 'events';

class AsyncTaskManager {
  constructor() {
    this.taskQueue = [];
    this.taskCheckpoints = new Map();
    this.eventEmitter = new EventEmitter();
    this.isProcessing = false;
  }

  addTask(taskId, taskFunction, dependencies = []) {
    if (this.taskCheckpoints.has(taskId)) {
      throw new Error(`Task with ID ${taskId} already exists.`);
    }

    this.taskQueue.push({ taskId, taskFunction, dependencies });
    this.taskCheckpoints.set(taskId, { status: 'pending', progress: 0 });
  }

  async processTasks() {
    if (this.isProcessing) return;
    this.isProcessing = true;

    while (this.taskQueue.length > 0) {
      const task = this.taskQueue.shift();
      const { taskId, taskFunction, dependencies } = task;

      // Check if dependencies are resolved
      if (!dependencies.every(dep => this.taskCheckpoints.get(dep)?.status === 'completed')) {
        this.taskQueue.push(task); // Requeue the task if dependencies aren't resolved
        continue;
      }

      try {
        this.taskCheckpoints.set(taskId, { status: 'in-progress', progress: 0 });
        const progressCallback = progress => {
          this.taskCheckpoints.set(taskId, { status: 'in-progress', progress });
          this.eventEmitter.emit('progress', { taskId, progress });
        };

        await taskFunction(progressCallback);
        this.taskCheckpoints.set(taskId, { status: 'completed', progress: 100 });
        this.eventEmitter.emit('completed', { taskId });
      } catch (error) {
        this.taskCheckpoints.set(taskId, { status: 'failed', progress: 0, error: error.message });
        this.eventEmitter.emit('failed', { taskId, error });
      }
    }

    this.isProcessing = false;
  }

  getTaskStatus(taskId) {
    return this.taskCheckpoints.get(taskId) || null;
  }

  on(event, listener) {
    this.eventEmitter.on(event, listener);
  }
}

export const asyncTaskManager = new AsyncTaskManager();

export function createTask(taskFunction, granularity = 10) {
  return async function (progressCallback) {
    for (let i = 0; i <= granularity; i++) {
      await taskFunction(i / granularity); // Simulate partial computation
      progressCallback(Math.floor((i / granularity) * 100));
    }
  };
}

export function dependencyGraphResolver(tasks) {
  const resolved = new Set();
  const result = [];

  function resolve(task) {
    if (resolved.has(task.taskId)) return;
    task.dependencies.forEach(dep => resolve(tasks.find(t => t.taskId === dep)));
    resolved.add(task.taskId);
    result.push(task);
  }

  tasks.forEach(task => resolve(task));
  return result;
}
