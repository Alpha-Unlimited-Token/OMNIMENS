/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: distributedTaskManager
 * Written: 2026-04-02T18:09:12.399Z
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

import { Worker, isMainThread, parentPort } from 'node:worker_threads';
import { randomUUID } from 'node:crypto';

// Task Queue with Priority Management
class TaskQueue {
  constructor() {
    this.queue = [];
  }

  addTask(task, priority = 0) {
    this.queue.push({ task, priority });
    this.queue.sort((a, b) => b.priority - a.priority); // Higher priority first
  }

  getNextTask() {
    return this.queue.shift();
  }

  hasTasks() {
    return this.queue.length > 0;
  }
}

// Worker Manager for Distributed Computation
class WorkerManager {
  constructor(workerCount) {
    this.workerCount = workerCount;
    this.workers = [];
    this.taskQueue = new TaskQueue();
    this.results = new Map();
    this.callbacks = new Map();
  }

  initializeWorkers(workerScript) {
    for (let i = 0; i < this.workerCount; i++) {
      const worker = new Worker(workerScript);
      worker.on('message', (message) => this.handleWorkerMessage(message));
      worker.on('error', (error) => console.error('Worker error:', error));
      this.workers.push(worker);
    }
  }

  distributeTasks() {
    for (const worker of this.workers) {
      if (this.taskQueue.hasTasks()) {
        const { task } = this.taskQueue.getNextTask();
        worker.postMessage(task);
      }
    }
  }

  addTask(task, priority = 0, callback) {
    const taskId = randomUUID();
    this.taskQueue.addTask({ id: taskId, data: task }, priority);
    this.callbacks.set(taskId, callback);
    this.distributeTasks();
  }

  handleWorkerMessage(message) {
    const { id, result } = message;
    this.results.set(id, result);
    const callback = this.callbacks.get(id);
    if (callback) {
      callback(result);
      this.callbacks.delete(id);
    }
    this.distributeTasks();
  }

  serializeState() {
    return JSON.stringify({
      queue: this.taskQueue.queue,
      results: Array.from(this.results.entries())
    });
  }

  deserializeState(serializedState) {
    const state = JSON.parse(serializedState);
    this.taskQueue.queue = state.queue;
    this.results = new Map(state.results);
  }
}

// Example Worker Script (to be used in a separate file)
export const workerScript = `
import { parentPort } from 'node:worker_threads';

parentPort.on('message', (task) => {
  const result = task.data * 2; // Example computation
  parentPort.postMessage({ id: task.id, result });
});
`;

// Utility Functions
export function createWorkerManager(workerCount) {
  return new WorkerManager(workerCount);
}

export function serializeManagerState(manager) {
  return manager.serializeState();
}

export function deserializeManagerState(manager, serializedState) {
  manager.deserializeState(serializedState);
}

export function exampleUsage() {
  const manager = createWorkerManager(4);
  manager.initializeWorkers(workerScript);

  manager.addTask(5, 1, (result) => {
    console.log('Task result:', result);
  });

  manager.addTask(10, 2, (result) => {
    console.log('Task result:', result);
  });
}
