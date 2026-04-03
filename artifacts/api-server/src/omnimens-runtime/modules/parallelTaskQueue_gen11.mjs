/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: parallelTaskQueue
 * Written: 2026-04-03T02:37:08.246Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// parallelTaskQueue.mjs

import { Worker, isMainThread, parentPort } from 'node:worker_threads';

// Task Queue with Priority
class PriorityTaskQueue {
  constructor() {
    this.queue = [];
  }

  addTask(task, priority = 0) {
    this.queue.push({ task, priority });
    this.queue.sort((a, b) => b.priority - a.priority); // Higher priority first
  }

  getNextTask() {
    return this.queue.shift()?.task || null;
  }

  isEmpty() {
    return this.queue.length === 0;
  }
}

// Worker Pool
class WorkerPool {
  constructor(workerCount, workerScript) {
    this.workerCount = workerCount;
    this.workerScript = workerScript;
    this.workers = [];
    this.taskQueue = new PriorityTaskQueue();
    this.activeTasks = new Map();

    for (let i = 0; i < workerCount; i++) {
      const worker = new Worker(workerScript);
      worker.on('message', (message) => this.handleWorkerMessage(worker, message));
      worker.on('error', (error) => this.handleWorkerError(worker, error));
      worker.on('exit', () => this.handleWorkerExit(worker));
      this.workers.push(worker);
    }
  }

  handleWorkerMessage(worker, message) {
    const { taskId, result } = message;
    if (this.activeTasks.has(taskId)) {
      const { resolve } = this.activeTasks.get(taskId);
      resolve(result);
      this.activeTasks.delete(taskId);
      this.assignTaskToWorker(worker);
    }
  }

  handleWorkerError(worker, error) {
    console.error(`Worker error: ${error.message}`);
    this.replaceWorker(worker);
  }

  handleWorkerExit(worker) {
    console.warn('Worker exited unexpectedly');
    this.replaceWorker(worker);
  }

  replaceWorker(worker) {
    const index = this.workers.indexOf(worker);
    if (index !== -1) {
      this.workers.splice(index, 1);
      const newWorker = new Worker(this.workerScript);
      newWorker.on('message', (message) => this.handleWorkerMessage(newWorker, message));
      newWorker.on('error', (error) => this.handleWorkerError(newWorker, error));
      newWorker.on('exit', () => this.handleWorkerExit(newWorker));
      this.workers.push(newWorker);
    }
  }

  assignTaskToWorker(worker) {
    if (!this.taskQueue.isEmpty()) {
      const task = this.taskQueue.getNextTask();
      const taskId = crypto.randomUUID();
      this.activeTasks.set(taskId, task);
      worker.postMessage({ taskId, task: task.task });
    }
  }

  addTask(task, priority = 0) {
    return new Promise((resolve, reject) => {
      this.taskQueue.addTask({ task, resolve, reject }, priority);
      this.workers.some((worker) => {
        if (worker.threadId && !this.activeTasks.has(worker.threadId)) {
          this.assignTaskToWorker(worker);
          return true;
        }
        return false;
      });
    });
  }

  terminate() {
    this.workers.forEach((worker) => worker.terminate());
  }
}

// Worker script logic
if (!isMainThread) {
  parentPort.on('message', ({ taskId, task }) => {
    try {
      const result = executeTask(task); // Replace with actual task logic
      parentPort.postMessage({ taskId, result });
    } catch (error) {
      parentPort.postMessage({ taskId, error: error.message });
    }
  });

  function executeTask(task) {
    // Example: Simulate computation
    return task.data * 2;
  }
}

// Exported functions
export function createWorkerPool(workerCount, workerScript) {
  return new WorkerPool(workerCount, workerScript);
}

export function createPriorityTaskQueue() {
  return new PriorityTaskQueue();
}

export const exampleTask = { data: 42 };