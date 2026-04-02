/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: parallelTaskManager
 * Written: 2026-04-02T14:14:28.226Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// parallelTaskManager.mjs

import { Worker, isMainThread, parentPort, workerData } from 'node:worker_threads';

// Utility function to create a worker
function createWorker(workerScript) {
  return new Worker(workerScript);
}

// Task queue with round-robin scheduling
export class ParallelTaskManager {
  constructor(workerScript, numWorkers = 4) {
    if (!isMainThread) {
      throw new Error('ParallelTaskManager must be instantiated in the main thread');
    }

    this.workerScript = workerScript;
    this.numWorkers = numWorkers;
    this.workers = [];
    this.taskQueue = [];
    this.roundRobinIndex = 0;

    this._initializeWorkers();
  }

  _initializeWorkers() {
    for (let i = 0; i < this.numWorkers; i++) {
      const worker = createWorker(this.workerScript);
      worker.on('message', (result) => {
        const { resolve } = this.taskQueue.shift();
        resolve(result);
      });
      worker.on('error', (error) => {
        const { reject } = this.taskQueue.shift();
        reject(error);
      });
      this.workers.push(worker);
    }
  }

  _getNextWorker() {
    const worker = this.workers[this.roundRobinIndex];
    this.roundRobinIndex = (this.roundRobinIndex + 1) % this.numWorkers;
    return worker;
  }

  async executeTask(taskData) {
    return new Promise((resolve, reject) => {
      const worker = this._getNextWorker();
      this.taskQueue.push({ resolve, reject });
      worker.postMessage(taskData);
    });
  }

  terminateAll() {
    for (const worker of this.workers) {
      worker.terminate();
    }
  }
}

// Example worker script (to be used with ParallelTaskManager)
export const exampleWorkerScript = `
  const { parentPort } = require('node:worker_threads');

  parentPort.on('message', (taskData) => {
    // Simulate a task (e.g., heavy computation)
    const result = taskData.map(x => x * 2); // Example: doubling each number
    parentPort.postMessage(result);
  });
`;

// Generic utility function for shared memory buffer creation
export function createSharedBuffer(size) {
  return new SharedArrayBuffer(size);
}

// Generic utility function for atomic operations on shared memory
export function atomicIncrement(sharedBuffer, index) {
  const view = new Int32Array(sharedBuffer);
  return Atomics.add(view, index, 1);
}

// Generic utility function for distributing tasks
export function distributeTasks(tasks, numWorkers) {
  const chunks = Array.from({ length: numWorkers }, () => []);
  tasks.forEach((task, index) => {
    chunks[index % numWorkers].push(task);
  });
  return chunks;
}

// Example usage (main thread only)
if (isMainThread) {
  const manager = new ParallelTaskManager('./exampleWorker.js', 4);

  (async () => {
    const tasks = [[1, 2, 3], [4, 5, 6], [7, 8, 9], [10, 11, 12]];
    const results = await Promise.all(tasks.map(task => manager.executeTask(task)));
    console.log('Results:', results);
    manager.terminateAll();
  })();
}