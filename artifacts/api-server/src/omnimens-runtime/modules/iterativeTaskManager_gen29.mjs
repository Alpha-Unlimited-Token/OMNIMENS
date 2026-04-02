/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: iterativeTaskManager
 * Written: 2026-04-02T13:31:38.936Z
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

import { createHash } from 'crypto';

// Utility function to generate unique task IDs
export function generateTaskId(taskData) {
  const hash = createHash('sha256');
  hash.update(JSON.stringify(taskData));
  return hash.digest('hex');
}

// Priority queue implementation
export class PriorityQueue {
  constructor() {
    this.queue = [];
  }

  enqueue(task, priority) {
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

// Task manager class
export class IterativeTaskManager {
  constructor() {
    this.taskQueue = new PriorityQueue();
    this.taskStates = new Map();
  }

  addTask(taskData, priority = 1) {
    const taskId = generateTaskId(taskData);
    this.taskQueue.enqueue(taskId, priority);
    if (!this.taskStates.has(taskId)) {
      this.taskStates.set(taskId, { data: taskData, status: 'pending' });
    }
  }

  processNextTask(taskProcessor) {
    if (this.taskQueue.isEmpty()) return null;

    const taskId = this.taskQueue.dequeue();
    const taskState = this.taskStates.get(taskId);

    if (!taskState || taskState.status === 'completed') return null;

    try {
      const result = taskProcessor(taskState.data);
      taskState.status = 'completed';
      taskState.result = result;
      return result;
    } catch (error) {
      taskState.status = 'error';
      taskState.error = error.message;
      return null;
    }
  }

  getTaskState(taskId) {
    return this.taskStates.get(taskId) || null;
  }

  getPendingTasks() {
    return Array.from(this.taskStates.entries())
      .filter(([_, state]) => state.status === 'pending')
      .map(([taskId, state]) => ({ taskId, ...state }));
  }
}

// Example utility function for task processing
export function exampleTaskProcessor(taskData) {
  // Simulate computation by returning a transformation of the input
  return { processed: true, original: taskData, timestamp: Date.now() };
}

// Example usage
export const exampleUsage = () => {
  const manager = new IterativeTaskManager();

  // Add tasks
  manager.addTask({ type: 'compute', value: 42 }, 2);
  manager.addTask({ type: 'analyze', value: 'text' }, 1);

  // Process tasks
  while (!manager.taskQueue.isEmpty()) {
    const result = manager.processNextTask(exampleTaskProcessor);
    console.log('Processed Task Result:', result);
  }

  // Retrieve task states
  console.log('Task States:', manager.getPendingTasks());
};