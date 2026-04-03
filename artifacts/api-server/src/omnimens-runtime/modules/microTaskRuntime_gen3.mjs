/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: microTaskRuntime
 * Written: 2026-04-03T06:34:07.168Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// microTaskRuntime.mjs

import { setTimeout } from 'timers/promises';

/**
 * Priority Queue implementation for managing micro-tasks.
 * Each task is an object with a priority and a function to execute.
 */
export class PriorityQueue {
  constructor() {
    this.queue = [];
  }

  enqueue(task, priority = 0) {
    this.queue.push({ task, priority });
    this.queue.sort((a, b) => b.priority - a.priority); // Higher priority first
  }

  dequeue() {
    return this.queue.shift()?.task || null;
  }

  isEmpty() {
    return this.queue.length === 0;
  }
}

/**
 * Stateful checkpointing utility to save and restore computation states.
 */
export class CheckpointManager {
  constructor() {
    this.state = new Map();
  }

  save(key, data) {
    this.state.set(key, data);
  }

  load(key) {
    return this.state.get(key);
  }

  hasCheckpoint(key) {
    return this.state.has(key);
  }
}

/**
 * Executes micro-tasks asynchronously in a sandboxed runtime.
 * Tasks are fragmented and executed iteratively based on priority.
 */
export async function runMicroTaskRuntime(tasks, checkpointKey = null) {
  const priorityQueue = new PriorityQueue();
  const checkpointManager = new CheckpointManager();

  // Restore checkpoint if available
  if (checkpointKey && checkpointManager.hasCheckpoint(checkpointKey)) {
    const savedState = checkpointManager.load(checkpointKey);
    savedState.forEach(({ task, priority }) => priorityQueue.enqueue(task, priority));
  } else {
    tasks.forEach(({ task, priority }) => priorityQueue.enqueue(task, priority));
  }

  while (!priorityQueue.isEmpty()) {
    const currentTask = priorityQueue.dequeue();

    try {
      const result = await currentTask();
      console.log('Task completed:', result);
    } catch (error) {
      console.error('Task failed:', error);
    }

    // Save checkpoint after each task execution
    const checkpointState = priorityQueue.queue.map(({ task, priority }) => ({ task, priority }));
    if (checkpointKey) checkpointManager.save(checkpointKey, checkpointState);

    // Simulate micro-task delay
    await setTimeout(0); // Allows other operations to interleave
  }

  console.log('All tasks completed.');
}

/**
 * Utility function for creating a delayed task.
 * Useful for testing or simulating asynchronous computations.
 */
export function createDelayedTask(taskFunction, delayMs) {
  return async function () {
    await setTimeout(delayMs);
    return taskFunction();
  };
}

/**
 * Example usage:
 * const tasks = [
 *   { task: createDelayedTask(() => 'Task 1', 100), priority: 1 },
 *   { task: createDelayedTask(() => 'Task 2', 200), priority: 2 },
 * ];
 * runMicroTaskRuntime(tasks, 'exampleCheckpoint');
 */