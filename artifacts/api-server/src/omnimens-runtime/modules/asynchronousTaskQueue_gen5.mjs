/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: asynchronousTaskQueue
 * Written: 2026-04-01T22:09:05.842Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
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