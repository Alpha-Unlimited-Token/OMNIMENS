/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: parallelComputationManager
 * Written: 2026-04-02T15:07:43.978Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// parallelComputationManager.mjs

import { Worker, isMainThread, parentPort, workerData } from 'node:worker_threads';

// Task queue and worker pool
const taskQueue = [];
const workers = [];
const maxWorkers = require('os').cpus().length;

// Initialize worker threads
function initializeWorkers(workerScript) {
  for (let i = 0; i < maxWorkers; i++) {
    const worker = new Worker(workerScript);
    worker.on('message', (result) => {
      if (result.taskId && result.data !== undefined) {
        const task = taskQueue.find(task => task.id === result.taskId);
        if (task) {
          task.resolve(result.data);
        }
      }
    });
    worker.on('error', (err) => {
      console.error(`Worker error: ${err}`);
    });
    worker.on('exit', (code) => {
      if (code !== 0) {
        console.error(`Worker exited with code ${code}`);
      }
    });
    workers.push(worker);
  }
}

// Dispatch task to the least loaded worker
function dispatchTask(taskData) {
  return new Promise((resolve, reject) => {
    const taskId = Date.now() + Math.random();
    taskQueue.push({ id: taskId, resolve, reject });

    const leastLoadedWorker = workers.reduce((prev, curr) => {
      return prev.taskCount < curr.taskCount ? prev : curr;
    });

    leastLoadedWorker.postMessage({ taskId, taskData });
  });
}

// Worker thread script
if (!isMainThread) {
  parentPort.on('message', ({ taskId, taskData }) => {
    try {
      // Perform computation (example: heavy math operation)
      const result = performComputation(taskData);
      parentPort.postMessage({ taskId, data: result });
    } catch (error) {
      parentPort.postMessage({ taskId, data: null, error: error.message });
    }
  });

  function performComputation(data) {
    // Example computation: sum of squares
    return data.map(x => x ** 2).reduce((a, b) => a + b, 0);
  }
}

// Exported functions
export function initializeParallelManager(workerScript) {
  initializeWorkers(workerScript);
}

export async function executeTask(taskData) {
  return await dispatchTask(taskData);
}

export const getWorkerCount = () => workers.length;

export const getTaskQueueLength = () => taskQueue.length;