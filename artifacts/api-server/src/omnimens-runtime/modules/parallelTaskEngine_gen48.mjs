/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: parallelTaskEngine
 * Written: 2026-04-02T15:17:00.884Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// parallelTaskEngine.mjs

import { Worker, isMainThread, parentPort, workerData } from 'node:worker_threads';
import { performance } from 'node:perf_hooks';

// Utility function to divide tasks into chunks
export function chunkArray(array, chunkSize) {
  const chunks = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    chunks.push(array.slice(i, i + chunkSize));
  }
  return chunks;
}

// Task queue system with dynamic load balancing
export class ParallelTaskEngine {
  constructor(workerFile, maxWorkers = 4) {
    if (!workerFile) {
      throw new Error('Worker file path is required');
    }
    this.workerFile = workerFile;
    this.maxWorkers = maxWorkers;
    this.taskQueue = [];
    this.workers = [];
    this.results = [];
    this.activeTasks = 0;
  }

  // Add a task to the queue
  addTask(taskData) {
    this.taskQueue.push(taskData);
  }

  // Initialize workers
  _initWorkers() {
    for (let i = 0; i < this.maxWorkers; i++) {
      const worker = new Worker(this.workerFile);
      worker.on('message', (message) => {
        this.results.push(message.result);
        this.activeTasks--;
        this._processQueue();
      });
      worker.on('error', (err) => {
        console.error('Worker error:', err);
        this.activeTasks--;
        this._processQueue();
      });
      worker.on('exit', (code) => {
        if (code !== 0) {
          console.error(`Worker exited with code ${code}`);
        }
      });
      this.workers.push(worker);
    }
  }

  // Process the task queue
  _processQueue() {
    if (this.taskQueue.length === 0 && this.activeTasks === 0) {
      this._terminateWorkers();
      return;
    }

    while (this.taskQueue.length > 0 && this.activeTasks < this.maxWorkers) {
      const taskData = this.taskQueue.shift();
      const worker = this.workers.find(w => w.threadId);
      if (worker) {
        this.activeTasks++;
        worker.postMessage({ taskData });
      }
    }
  }

  // Start processing tasks
  start() {
    this._initWorkers();
    this._processQueue();
  }

  // Terminate all workers
  _terminateWorkers() {
    for (const worker of this.workers) {
      worker.terminate();
    }
    this.workers = [];
  }

  // Get results
  getResults() {
    return this.results;
  }
}

// Worker thread code (to be used in a separate file)
if (!isMainThread) {
  parentPort.on('message', ({ taskData }) => {
    const result = performTask(taskData);
    parentPort.postMessage({ result });
  });

  function performTask(data) {
    // Example: Simulate a computationally intensive task
    const start = performance.now();
    const result = data.map(x => x * x); // Example computation (square numbers)
    const end = performance.now();
    return { result, duration: end - start };
  }
}
