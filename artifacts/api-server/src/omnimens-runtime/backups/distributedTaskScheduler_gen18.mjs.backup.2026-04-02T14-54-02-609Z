/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: distributedTaskScheduler
 * Written: 2026-04-02T14:11:50.570Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// distributedTaskScheduler.mjs

import { Worker } from 'node:worker_threads';

/**
 * TaskQueue class: Manages tasks and distributes them across workers using round-robin scheduling.
 */
export class TaskQueue {
  constructor(workerScript, numWorkers) {
    if (!workerScript) throw new Error('Worker script path is required.');
    if (numWorkers <= 0) throw new Error('Number of workers must be greater than zero.');

    this.workerScript = workerScript;
    this.numWorkers = numWorkers;
    this.workers = [];
    this.taskQueue = [];
    this.results = new Map();
    this.currentWorkerIndex = 0;

    // Initialize workers
    for (let i = 0; i < numWorkers; i++) {
      const worker = new Worker(workerScript);
      worker.on('message', (message) => this.handleWorkerMessage(message));
      worker.on('error', (err) => console.error(`Worker error: ${err.message}`));
      this.workers.push(worker);
    }
  }

  /**
   * Adds a task to the queue and attempts to distribute it.
   * @param {any} task - The task data to process.
   * @returns {Promise<any>} - Resolves with the result of the task.
   */
  addTask(task) {
    return new Promise((resolve, reject) => {
      const taskId = Symbol();
      this.taskQueue.push({ taskId, task, resolve, reject });
      this.distributeTasks();
    });
  }

  /**
   * Distributes tasks to available workers using round-robin scheduling.
   */
  distributeTasks() {
    while (this.taskQueue.length > 0) {
      const worker = this.workers[this.currentWorkerIndex];
      if (worker && worker.threadId) {
        const { taskId, task, resolve, reject } = this.taskQueue.shift();
        this.results.set(taskId, { resolve, reject });
        worker.postMessage({ taskId, task });
        this.currentWorkerIndex = (this.currentWorkerIndex + 1) % this.numWorkers;
      } else {
        break;
      }
    }
  }

  /**
   * Handles messages from workers and resolves/rejects the corresponding task promises.
   * @param {Object} message - The message from the worker.
   */
  handleWorkerMessage(message) {
    const { taskId, result, error } = message;
    const taskResult = this.results.get(taskId);
    if (taskResult) {
      const { resolve, reject } = taskResult;
      if (error) {
        reject(new Error(error));
      } else {
        resolve(result);
      }
      this.results.delete(taskId);
    }
  }

  /**
   * Terminates all workers.
   */
  terminateWorkers() {
    for (const worker of this.workers) {
      worker.terminate();
    }
  }
}

/**
 * Utility function to create a shared memory buffer.
 * @param {number} size - The size of the buffer in bytes.
 * @returns {SharedArrayBuffer} - A shared memory buffer.
 */
export function createSharedBuffer(size) {
  if (size <= 0) throw new Error('Buffer size must be greater than zero.');
  return new SharedArrayBuffer(size);
}

/**
 * Utility function to compute a similarity score between two vectors.
 * @param {number[]} vectorA - The first vector.
 * @param {number[]} vectorB - The second vector.
 * @returns {number} - The cosine similarity score.
 */
export function cosineSimilarity(vectorA, vectorB) {
  if (vectorA.length !== vectorB.length) {
    throw new Error('Vectors must have the same length.');
  }

  const dotProduct = vectorA.reduce((sum, a, i) => sum + a * vectorB[i], 0);
  const magnitudeA = Math.sqrt(vectorA.reduce((sum, a) => sum + a ** 2, 0));
  const magnitudeB = Math.sqrt(vectorB.reduce((sum, b) => sum + b ** 2, 0));

  return magnitudeA && magnitudeB ? dotProduct / (magnitudeA * magnitudeB) : 0;
}

/**
 * Utility function to create a worker script template.
 * @returns {string} - A string template for a worker script.
 */
export function getWorkerScriptTemplate() {
  return `
    const { parentPort } = require('worker_threads');

    parentPort.on('message', ({ taskId, task }) => {
      try {
        // Example: Perform computation (replace with actual logic)
        const result = task.map(x => x * 2); // Example computation
        parentPort.postMessage({ taskId, result });
      } catch (error) {
        parentPort.postMessage({ taskId, error: error.message });
      }
    });
  `;
}
