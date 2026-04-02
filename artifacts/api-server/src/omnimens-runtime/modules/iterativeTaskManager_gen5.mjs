/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: iterativeTaskManager
 * Written: 2026-04-02T21:45:18.959Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// iterativeTaskManager.mjs

import { performance } from 'perf_hooks';

/**
 * Breaks long-running tasks into resumable chunks with checkpointing and context restoration.
 */

// Utility function to divide an array into chunks
export function chunkArray(array, chunkSize) {
  if (!Array.isArray(array)) throw new TypeError('Input must be an array.');
  if (chunkSize <= 0) throw new RangeError('Chunk size must be greater than 0.');

  const chunks = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    chunks.push(array.slice(i, i + chunkSize));
  }
  return chunks;
}

// Task Manager class to handle stateful, resumable tasks
export class IterativeTaskManager {
  constructor(taskFunction, checkpointInterval = 1000) {
    if (typeof taskFunction !== 'function') {
      throw new TypeError('taskFunction must be a function.');
    }

    this.taskFunction = taskFunction; // Function to execute on each item
    this.checkpointInterval = checkpointInterval; // Time in ms to checkpoint
    this.state = {
      taskQueue: [],
      results: [],
      currentIndex: 0,
      isRunning: false
    };
  }

  // Load tasks into the queue
  loadTasks(tasks) {
    if (!Array.isArray(tasks)) throw new TypeError('Tasks must be an array.');
    this.state.taskQueue = tasks;
    this.state.results = new Array(tasks.length).fill(null);
    this.state.currentIndex = 0;
  }

  // Resume processing tasks from the last checkpoint
  async run() {
    if (this.state.isRunning) {
      throw new Error('Task manager is already running.');
    }

    this.state.isRunning = true;
    const startTime = performance.now();

    while (this.state.currentIndex < this.state.taskQueue.length) {
      const task = this.state.taskQueue[this.state.currentIndex];
      try {
        const result = await this.taskFunction(task, this.state.currentIndex);
        this.state.results[this.state.currentIndex] = result;
      } catch (error) {
        this.state.results[this.state.currentIndex] = { error: error.message };
      }

      this.state.currentIndex++;

      // Checkpointing: periodically save state
      if (performance.now() - startTime >= this.checkpointInterval) {
        this.state.isRunning = false;
        return;
      }
    }

    this.state.isRunning = false;
  }

  // Get the current state of the task manager
  getState() {
    return {
      taskQueue: [...this.state.taskQueue],
      results: [...this.state.results],
      currentIndex: this.state.currentIndex,
      isRunning: this.state.isRunning
    };
  }

  // Restore state from a saved checkpoint
  restoreState(savedState) {
    if (!savedState || typeof savedState !== 'object') {
      throw new TypeError('Invalid state object.');
    }

    this.state.taskQueue = [...savedState.taskQueue];
    this.state.results = [...savedState.results];
    this.state.currentIndex = savedState.currentIndex;
    this.state.isRunning = false;
  }
}

// Example utility function to simulate a long-running computation
export async function exampleTaskFunction(task, index) {
  // Simulate computation delay
  await new Promise(resolve => setTimeout(resolve, 100));
  return { task, index, result: task * 2 }; // Example operation: doubling the task value
}

// Example usage
export async function exampleUsage() {
  const tasks = [1, 2, 3, 4, 5];
  const manager = new IterativeTaskManager(exampleTaskFunction, 500); // Checkpoint every 500ms

  manager.loadTasks(tasks);
  await manager.run();

  console.log('Results after first run:', manager.getState().results);

  // Simulate resuming from a checkpoint
  await manager.run();
  console.log('Final results:', manager.getState().results);
}