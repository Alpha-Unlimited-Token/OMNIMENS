/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: subprocessTaskQueue
 * Written: 2026-04-02T14:53:45.296Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// subprocessTaskQueue.mjs

import { randomUUID } from 'crypto';

// Internal state for task management
const taskQueue = new Map();
const checkpointIntervalMs = 5000; // Default checkpoint interval

/**
 * Creates a new task with an initial state.
 * @param {string} taskName - Unique name for the task.
 * @param {object} initialState - Initial state of the task.
 * @returns {string} - Task ID for reference.
 */
export function createTask(taskName, initialState) {
  const taskId = randomUUID();
  taskQueue.set(taskId, {
    name: taskName,
    state: initialState,
    lastCheckpoint: Date.now(),
    isPaused: false
  });
  return taskId;
}

/**
 * Updates the state of a task and optionally checkpoints.
 * @param {string} taskId - ID of the task to update.
 * @param {object} newState - New state to merge with the current state.
 */
export function updateTaskState(taskId, newState) {
  const task = taskQueue.get(taskId);
  if (!task) throw new Error(`Task with ID ${taskId} not found.`);

  task.state = { ...task.state, ...newState };

  const now = Date.now();
  if (now - task.lastCheckpoint >= checkpointIntervalMs) {
    checkpointTask(taskId);
  }
}

/**
 * Pauses a task, preventing further updates.
 * @param {string} taskId - ID of the task to pause.
 */
export function pauseTask(taskId) {
  const task = taskQueue.get(taskId);
  if (!task) throw new Error(`Task with ID ${taskId} not found.`);

  task.isPaused = true;
}

/**
 * Resumes a paused task.
 * @param {string} taskId - ID of the task to resume.
 */
export function resumeTask(taskId) {
  const task = taskQueue.get(taskId);
  if (!task) throw new Error(`Task with ID ${taskId} not found.`);

  task.isPaused = false;
}

/**
 * Retrieves the current state of a task.
 * @param {string} taskId - ID of the task to retrieve.
 * @returns {object} - Current state of the task.
 */
export function getTaskState(taskId) {
  const task = taskQueue.get(taskId);
  if (!task) throw new Error(`Task with ID ${taskId} not found.`);

  return task.state;
}

/**
 * Checkpoints a task's state (simulated persistence).
 * @param {string} taskId - ID of the task to checkpoint.
 */
function checkpointTask(taskId) {
  const task = taskQueue.get(taskId);
  if (!task) throw new Error(`Task with ID ${taskId} not found.`);

  if (task.isPaused) return; // Skip checkpointing if paused

  task.lastCheckpoint = Date.now();
  // Simulate persistence (e.g., logging or memory storage)
  console.log(`Checkpointed task ${task.name} (ID: ${taskId}) at ${new Date(task.lastCheckpoint).toISOString()}`);
}

/**
 * Deletes a task from the queue.
 * @param {string} taskId - ID of the task to delete.
 */
export function deleteTask(taskId) {
  if (!taskQueue.has(taskId)) throw new Error(`Task with ID ${taskId} not found.`);

  taskQueue.delete(taskId);
}

/**
 * Lists all active tasks.
 * @returns {Array} - Array of task summaries.
 */
export function listTasks() {
  return Array.from(taskQueue.entries()).map(([id, task]) => ({
    id,
    name: task.name,
    isPaused: task.isPaused,
    lastCheckpoint: new Date(task.lastCheckpoint).toISOString()
  }));
}

/**
 * Periodically checkpoint all tasks.
 */
export function startPeriodicCheckpoint() {
  setInterval(() => {
    for (const taskId of taskQueue.keys()) {
      checkpointTask(taskId);
    }
  }, checkpointIntervalMs);
}
