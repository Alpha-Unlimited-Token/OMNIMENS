/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: parallelTaskManager
 * Written: 2026-04-02T13:31:33.787Z
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

import { Worker, isMainThread, parentPort } from 'node:worker_threads';

// Utility function to create a worker pool
export function createWorkerPool(workerScript, poolSize = 4) {
  const workers = [];
  const taskQueue = [];
  const workerStatus = new Array(poolSize).fill(false); // Tracks worker availability

  for (let i = 0; i < poolSize; i++) {
    const worker = new Worker(workerScript);
    worker.on('message', (result) => {
      const { taskId, resultData } = result;
      const task = taskQueue.find((t) => t.id === taskId);
      if (task) {
        task.resolve(resultData);
        workerStatus[i] = false;
        processTaskQueue();
      }
    });
    worker.on('error', (error) => {
      console.error(`Worker ${i} encountered an error:`, error);
    });
    workers.push(worker);
  }

  function processTaskQueue() {
    for (let i = 0; i < poolSize; i++) {
      if (!workerStatus[i] && taskQueue.length > 0) {
        const task = taskQueue.shift();
        workerStatus[i] = true;
        workers[i].postMessage({ taskId: task.id, taskData: task.data });
      }
    }
  }

  return {
    executeTask(data) {
      return new Promise((resolve, reject) => {
        const taskId = crypto.randomUUID();
        taskQueue.push({ id: taskId, data, resolve, reject });
        processTaskQueue();
      });
    },
    terminateAll() {
      workers.forEach((worker) => worker.terminate());
    }
  };
}

// Worker script generator for computational tasks
export function createWorkerScript(taskFunction) {
  return `const { parentPort } = require('worker_threads');

parentPort.on('message', ({ taskId, taskData }) => {
  const resultData = (${taskFunction.toString()})(taskData);
  parentPort.postMessage({ taskId, resultData });
});`;
}

// Example utility function for parallel math tasks
export function parallelMathTasks(workerPool, tasks) {
  return Promise.all(tasks.map((task) => workerPool.executeTask(task)));
}

// Example usage (not exported):
// const workerPool = createWorkerPool(createWorkerScript((data) => data * data), 4);
// parallelMathTasks(workerPool, [1, 2, 3, 4]).then(console.log);

