/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: parallelWorkerEngine
 * Written: 2026-04-03T02:43:56.376Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// parallelWorkerEngine.mjs

import { Worker, isMainThread, parentPort } from 'node:worker_threads';

/**
 * Worker thread code encapsulated as a function to be executed in separate threads.
 * Handles tasks from the main thread and returns results.
 */
function workerThreadCode() {
  parentPort.on('message', ({ taskId, taskData }) => {
    try {
      // Simulate computationally intensive task
      const result = taskData.map(x => x * x); // Example: square each number
      parentPort.postMessage({ taskId, result });
    } catch (error) {
      parentPort.postMessage({ taskId, error: error.message });
    }
  });
}

/**
 * Main thread logic: Manages worker threads and distributes tasks dynamically.
 */
export class ParallelWorkerEngine {
  constructor(workerCount = 4) {
    this.workerCount = workerCount;
    this.workers = [];
    this.taskQueue = [];
    this.activeTasks = new Map();
    this.nextTaskId = 0;

    // Initialize worker threads
    for (let i = 0; i < workerCount; i++) {
      const worker = new Worker(`data:text/javascript,(${workerThreadCode.toString()})()`);
      worker.on('message', this._handleWorkerMessage.bind(this));
      worker.on('error', this._handleWorkerError.bind(this));
      this.workers.push(worker);
    }
  }

  /**
   * Adds a task to the queue and attempts to dispatch it.
   * @param {Array} taskData - Data to process in the task.
   * @returns {Promise} - Resolves with the task result.
   */
  addTask(taskData) {
    return new Promise((resolve, reject) => {
      const taskId = this.nextTaskId++;
      this.taskQueue.push({ taskId, taskData, resolve, reject });
      this._dispatchTasks();
    });
  }

  /**
   * Dispatches tasks to available workers.
   */
  _dispatchTasks() {
    for (const worker of this.workers) {
      if (this.taskQueue.length === 0) break;

      const workerIsIdle = !this.activeTasks.has(worker);
      if (workerIsIdle) {
        const task = this.taskQueue.shift();
        this.activeTasks.set(worker, task.taskId);
        worker.postMessage(task);
      }
    }
  }

  /**
   * Handles messages from worker threads.
   * @param {Object} message - Message from the worker.
   */
  _handleWorkerMessage({ taskId, result, error }) {
    const worker = this._findWorkerByTaskId(taskId);
    if (!worker) return;

    const task = this._findTaskById(taskId);
    if (!task) return;

    this.activeTasks.delete(worker);

    if (error) {
      task.reject(new Error(error));
    } else {
      task.resolve(result);
    }

    this._dispatchTasks();
  }

  /**
   * Handles errors from worker threads.
   * @param {Error} error - Error from the worker.
   */
  _handleWorkerError(error) {
    console.error('Worker error:', error);
  }

  /**
   * Finds a worker by its active task ID.
   * @param {number} taskId - Task ID.
   * @returns {Worker|null} - Worker handling the task.
   */
  _findWorkerByTaskId(taskId) {
    for (const [worker, activeTaskId] of this.activeTasks.entries()) {
      if (activeTaskId === taskId) {
        return worker;
      }
    }
    return null;
  }

  /**
   * Finds a task by its ID.
   * @param {number} taskId - Task ID.
   * @returns {Object|null} - Task object.
   */
  _findTaskById(taskId) {
    return this.taskQueue.find(task => task.taskId === taskId);
  }

  /**
   * Terminates all worker threads.
   */
  terminate() {
    for (const worker of this.workers) {
      worker.terminate();
    }
  }
}

/**
 * Utility function for parallel processing.
 * @param {Array} data - Array of data to process.
 * @param {number} workerCount - Number of worker threads.
 * @returns {Promise<Array>} - Processed data.
 */
export async function parallelProcess(data, workerCount = 4) {
  const engine = new ParallelWorkerEngine(workerCount);
  const tasks = data.map(chunk => engine.addTask(chunk));
  const results = await Promise.all(tasks);
  engine.terminate();
  return results.flat();
}