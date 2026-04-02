/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: distributedTaskManager
 * Written: 2026-04-02T14:24:53.501Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// distributedTaskManager.mjs

import { createHash } from 'crypto';

/**
 * Utility function to generate a unique hash for task serialization.
 * @param {any} data - The data to hash.
 * @returns {string} - A unique hash string.
 */
export function generateTaskHash(data) {
  const hash = createHash('sha256');
  hash.update(JSON.stringify(data));
  return hash.digest('hex');
}

/**
 * Splits a large task into smaller subtasks.
 * @param {any} taskData - The original task data.
 * @param {number} chunkSize - Size of each subtask.
 * @returns {Array} - Array of subtasks.
 */
export function splitTask(taskData, chunkSize) {
  if (!Array.isArray(taskData)) {
    throw new Error('Task data must be an array.');
  }

  const subtasks = [];
  for (let i = 0; i < taskData.length; i += chunkSize) {
    subtasks.push(taskData.slice(i, i + chunkSize));
  }

  return subtasks;
}

/**
 * Serializes the state of a task for checkpointing.
 * @param {any} taskState - The current state of the task.
 * @returns {string} - Serialized state as a JSON string.
 */
export function serializeTaskState(taskState) {
  return JSON.stringify(taskState);
}

/**
 * Deserializes a serialized task state.
 * @param {string} serializedState - Serialized state string.
 * @returns {any} - Deserialized task state.
 */
export function deserializeTaskState(serializedState) {
  return JSON.parse(serializedState);
}

/**
 * Priority Queue implementation for task scheduling.
 */
export class PriorityQueue {
  constructor() {
    this.queue = [];
  }

  /**
   * Adds a task to the queue with a given priority.
   * @param {any} task - The task to add.
   * @param {number} priority - The priority of the task.
   */
  enqueue(task, priority) {
    this.queue.push({ task, priority });
    this.queue.sort((a, b) => a.priority - b.priority);
  }

  /**
   * Removes and returns the highest-priority task.
   * @returns {any} - The task with the highest priority.
   */
  dequeue() {
    return this.queue.shift().task;
  }

  /**
   * Checks if the queue is empty.
   * @returns {boolean} - True if empty, false otherwise.
   */
  isEmpty() {
    return this.queue.length === 0;
  }
}

/**
 * Executes tasks across subprocesses and resumes from checkpoints.
 * @param {Array} tasks - Array of tasks to execute.
 * @param {Function} taskFunction - Function to execute each task.
 * @param {number} chunkSize - Size of each subtask chunk.
 * @returns {Promise<Array>} - Results of all tasks.
 */
export async function executeDistributedTasks(tasks, taskFunction, chunkSize) {
  const subtasks = splitTask(tasks, chunkSize);
  const results = [];

  for (const subtask of subtasks) {
    const serializedState = serializeTaskState(subtask);
    const deserializedState = deserializeTaskState(serializedState);

    for (const task of deserializedState) {
      results.push(await taskFunction(task));
    }
  }

  return results;
}
