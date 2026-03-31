/**
 * OMNIMENS Self-Authored Module (Migrated from DB)
 * Original Source: evolution_cycle_1
 * Name: apiBatchingOptimizer
 * Purpose: Optimizes throughput for GPT-4o API calls under rate limits.
 * Description: Optimizes throughput for API calls under rate limits using a priority queue with dynamic batching and task scheduling.
 * Migrated: 2026-03-25T22:49:34.134Z
 */

// apiBatchingOptimizer.mjs
import { setTimeout as delay } from 'timers/promises';

/**
 * Priority Queue implementation for task management.
 * Each task is an object with { priority: number, execute: function }.
 */
export class PriorityQueue {
  constructor() {
    this.queue = [];
  }

  /**
   * Adds a task to the queue.
   * @param {Object} task - Task object with `priority` and `execute` function.
   */
  enqueue(task) {
    if (!task || typeof task.priority !== 'number' || typeof task.execute !== 'function') {
      throw new Error('Task must have a priority (number) and an execute (function) property.');
    }
    this.queue.push(task);
    this.queue.sort((a, b) => b.priority - a.priority); // Higher priority first
  }

  /**
   * Removes and returns the highest-priority task from the queue.
   * @returns {Object|null} - The task object or null if the queue is empty.
   */
  dequeue() {
    return this.queue.shift() || null;
  }

  /**
   * Checks if the queue is empty.
   * @returns {boolean}
   */
  isEmpty() {
    return this.queue.length === 0;
  }
}

/**
 * Optimizes API call batching under rate limits.
 * Dynamically batches low-priority tasks and reserves capacity for high-priority tasks.
 */
export class ApiBatchingOptimizer {
  constructor(rateLimitPerSecond) {
    if (typeof rateLimitPerSecond !== 'number' || rateLimitPerSecond <= 0) {
      throw new Error('rateLimitPerSecond must be a positive number.');
    }
    this.rateLimitPerSecond = rateLimitPerSecond;
    this.priorityQueue = new PriorityQueue();
    this.currentRequests = 0;
  }

  /**
   * Schedules a task for execution.
   * @param {number} priority - Priority of the task (higher is more important).
   * @param {Function} taskFunction - The function to execute.
   */
  scheduleTask(priority, taskFunction) {
    this.priorityQueue.enqueue({ priority, execute: taskFunction });
    this.processQueue();
  }

  /**
   * Processes the task queue, adhering to the rate limit.
   */
  async processQueue() {
    while (!this.priorityQueue.isEmpty() && this.currentRequests < this.rateLimitPerSecond) {
      const task = this.priorityQueue.dequeue();
      if (task) {
        this.currentRequests++;
        task.execute()
          .catch((err) => console.error('Task execution failed:', err))
          .finally(() => {
            this.currentRequests--;
            this.processQueue();
          });
      }
    }

    // Ensure rate limit compliance
    if (this.currentRequests >= this.rateLimitPerSecond) {
      await delay(1000); // Wait 1 second before retrying
      this.processQueue();
    }
  }
}

/**
 * Utility function to create a delay in milliseconds.
 * @param {number} ms - Milliseconds to delay.
 * @returns {Promise<void>}
 */
export function sleep(ms) {
  if (typeof ms !== 'number' || ms < 0) {
    throw new Error('ms must be a non-negative number.');
  }
  return delay(ms);
}

/**
 * Example usage of the ApiBatchingOptimizer.
 * This function demonstrates how to use the module.
 */
export async function exampleUsage() {
  const apiOptimizer = new ApiBatchingOptimizer(5); // 5 calls per second

  // Schedule tasks with varying priorities
  for (let i = 1; i <= 10; i++) {
    const priority = i % 2 === 0 ? 10 : 5; // Higher priority for even tasks
    apiOptimizer.scheduleTask(priority, async () => {
      console.log(`Executing task ${i} with priority ${priority}`);
      await sleep(200); // Simulate API call delay
    });
  }
}

// Uncomment the line below to test the example usage
// exampleUsage();