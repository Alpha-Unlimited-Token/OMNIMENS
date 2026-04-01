/**
 * OMNIMENS Self-Authored Module (Migrated from DB)
 * Original Source: evolution_cycle_5
 * Name: asynchronousTaskQueue
 * Purpose: Allow long-running computations to execute asynchronously without hitting timeout limits.
 * Description: Provides an asynchronous task queue for cooperative multitasking, including chunked execution and delayed task scheduling.
 * Migrated: 2026-04-01T22:23:20.241Z
 */

// asynchronousTaskQueue.mjs

export class AsynchronousTaskQueue {
  constructor() {
    this.queue = [];
    this.isProcessing = false;
  }

  addTask(taskFunction) {
    if (typeof taskFunction !== 'function') {
      throw new Error('Task must be a function');
    }
    this.queue.push(taskFunction);
    this.processQueue();
  }

  async processQueue() {
    if (this.isProcessing) return;
    this.isProcessing = true;

    while (this.queue.length > 0) {
      const currentTask = this.queue.shift();
      try {
        await new Promise((resolve) => {
          setImmediate(() => {
            currentTask();
            resolve();
          });
        });
      } catch (error) {
        console.error('Error executing task:', error);
      }
    }

    this.isProcessing = false;
  }
}

export function createTaskQueue() {
  return new AsynchronousTaskQueue();
}

export function chunkedExecution(array, chunkSize, callback) {
  if (!Array.isArray(array)) {
    throw new Error('First argument must be an array');
  }
  if (typeof chunkSize !== 'number' || chunkSize <= 0) {
    throw new Error('Chunk size must be a positive number');
  }
  if (typeof callback !== 'function') {
    throw new Error('Callback must be a function');
  }

  const taskQueue = new AsynchronousTaskQueue();

  for (let i = 0; i < array.length; i += chunkSize) {
    const chunk = array.slice(i, i + chunkSize);
    taskQueue.addTask(() => callback(chunk));
  }
}

export function delayExecution(milliseconds, taskFunction) {
  if (typeof milliseconds !== 'number' || milliseconds < 0) {
    throw new Error('Milliseconds must be a non-negative number');
  }
  if (typeof taskFunction !== 'function') {
    throw new Error('Task must be a function');
  }

  return new Promise((resolve) => {
    setTimeout(() => {
      taskFunction();
      resolve();
    }, milliseconds);
  });
}