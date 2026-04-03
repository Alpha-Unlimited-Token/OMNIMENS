/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: parallelComputationManager
 * Written: 2026-04-03T12:43:50.111Z
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

import { Worker } from 'node:worker_threads';
import { cpus } from 'node:os';

/**
 * Dynamically manages parallel computation tasks using Web Workers or threads.
 * Supports efficient task distribution and message-passing.
 */

const MAX_WORKERS = Math.max(2, cpus().length - 1);

/**
 * Creates a pool of workers and manages task distribution.
 * @param {string} workerScript - Path to the worker script file.
 * @param {number} [poolSize=MAX_WORKERS] - Number of workers in the pool.
 * @returns {object} - An object with methods to execute tasks and terminate the pool.
 */
export function createWorkerPool(workerScript, poolSize = MAX_WORKERS) {
  const workers = [];
  const taskQueue = [];
  const results = new Map();
  const workerStatus = new Map();

  for (let i = 0; i < poolSize; i++) {
    const worker = new Worker(workerScript);
    workers.push(worker);
    workerStatus.set(worker, false); // false indicates the worker is idle

    worker.on('message', ({ taskId, result }) => {
      results.set(taskId, result);
      workerStatus.set(worker, false); // Mark worker as idle

      if (taskQueue.length > 0) {
        const nextTask = taskQueue.shift();
        workerStatus.set(worker, true); // Mark worker as busy
        worker.postMessage(nextTask);
      }
    });

    worker.on('error', (err) => {
      console.error(`Worker error: ${err.message}`);
    });

    worker.on('exit', (code) => {
      if (code !== 0) {
        console.error(`Worker exited with code ${code}`);
      }
    });
  }

  return {
    /**
     * Executes a task by assigning it to an available worker or queuing it.
     * @param {string} taskId - Unique identifier for the task.
     * @param {any} taskData - Data to be processed by the worker.
     */
    executeTask(taskId, taskData) {
      const availableWorker = workers.find(worker => !workerStatus.get(worker));

      if (availableWorker) {
        workerStatus.set(availableWorker, true); // Mark worker as busy
        availableWorker.postMessage({ taskId, taskData });
      } else {
        taskQueue.push({ taskId, taskData });
      }
    },

    /**
     * Retrieves the result of a completed task.
     * @param {string} taskId - Unique identifier for the task.
     * @returns {any | undefined} - The result of the task, or undefined if not completed.
     */
    getResult(taskId) {
      return results.get(taskId);
    },

    /**
     * Terminates all workers in the pool.
     */
    terminatePool() {
      workers.forEach(worker => worker.terminate());
    }
  };
}

/**
 * Splits a large array into smaller chunks for parallel processing.
 * @param {Array} array - The array to be split.
 * @param {number} chunkSize - The size of each chunk.
 * @returns {Array[]} - An array of chunks.
 */
export function splitArrayIntoChunks(array, chunkSize) {
  const chunks = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    chunks.push(array.slice(i, i + chunkSize));
  }
  return chunks;
}

/**
 * Combines results from multiple workers into a single output.
 * @param {Array} results - Array of results from workers.
 * @param {function} combineFunction - Function to combine results.
 * @returns {any} - The combined result.
 */
export function combineResults(results, combineFunction) {
  return results.reduce(combineFunction);
}
