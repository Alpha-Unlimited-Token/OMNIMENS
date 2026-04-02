/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: parallelTaskManager
 * Written: 2026-04-02T14:12:12.453Z
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

// Utility function to create a worker thread
function createWorker(workerScript, data) {
  return new Promise((resolve, reject) => {
    const worker = new Worker(workerScript, { workerData: data });

    worker.on('message', resolve);
    worker.on('error', reject);
    worker.on('exit', (code) => {
      if (code !== 0) {
        reject(new Error(`Worker stopped with exit code ${code}`));
      }
    });
  });
}

// Task queue with load balancing
const taskQueue = [];
const workerPool = [];

export function initializeWorkerPool(workerScript, poolSize) {
  for (let i = 0; i < poolSize; i++) {
    workerPool.push({
      workerScript,
      busy: false
    });
  }
}

export function addTaskToQueue(taskData) {
  taskQueue.push(taskData);
  processTaskQueue();
}

function processTaskQueue() {
  for (const worker of workerPool) {
    if (!worker.busy && taskQueue.length > 0) {
      const taskData = taskQueue.shift();
      worker.busy = true;

      createWorker(worker.workerScript, taskData)
        .then((result) => {
          worker.busy = false;
          processTaskQueue();
        })
        .catch((error) => {
          console.error('Worker error:', error);
          worker.busy = false;
          processTaskQueue();
        });
    }
  }
}

// Shared memory buffer utility
export function createSharedBuffer(size) {
  return new SharedArrayBuffer(size);
}

export function writeToSharedBuffer(buffer, offset, data) {
  const view = new Uint8Array(buffer);
  for (let i = 0; i < data.length; i++) {
    view[offset + i] = data[i];
  }
}

export function readFromSharedBuffer(buffer, offset, length) {
  const view = new Uint8Array(buffer);
  return view.slice(offset, offset + length);
}

// Example worker script (to be used externally)
export const exampleWorkerScript = `
import { parentPort, workerData } from 'node:worker_threads';

function heavyComputation(data) {
  // Simulate heavy computation
  return data.map((x) => x * 2);
}

const result = heavyComputation(workerData);
parentPort.postMessage(result);
`;

export function exampleUsage() {
  initializeWorkerPool(exampleWorkerScript, 4);

  addTaskToQueue([1, 2, 3, 4]);
  addTaskToQueue([5, 6, 7, 8]);
  addTaskToQueue([9, 10, 11, 12]);
}
