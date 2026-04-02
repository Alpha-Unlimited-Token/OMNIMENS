/**
 * OMNIMENS Self-Authored Module (Migrated from DB)
 * Original Source: evolution_cycle_43
 * Name: parallelComputationManager
 * Purpose: Enables multi-threaded parallelism for computationally intensive tasks using Node.js Worker Threads.
 * Description: Manages multi-threaded parallel computation tasks with load balancing and shared memory in Node.js.
 * Migrated: 2026-04-02T15:11:36.904Z
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