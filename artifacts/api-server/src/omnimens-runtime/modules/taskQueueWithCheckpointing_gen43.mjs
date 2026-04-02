/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: taskQueueWithCheckpointing
 * Written: 2026-04-02T15:16:58.933Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// taskQueueWithCheckpointing.mjs

import { writeFileSync, readFileSync, existsSync } from 'fs';
import { resolve } from 'path';
import { createHash } from 'crypto';

const CHECKPOINT_DIR = resolve('./checkpoints');

/**
 * Generates a unique hash for a task based on its content.
 * @param {string} taskData - The task data to hash.
 * @returns {string} - A unique hash string.
 */
export function generateTaskHash(taskData) {
  return createHash('sha256').update(taskData).digest('hex');
}

/**
 * Saves a checkpoint to disk.
 * @param {string} taskId - Unique identifier for the task.
 * @param {object} state - Current state of the task.
 */
export function saveCheckpoint(taskId, state) {
  const filePath = resolve(CHECKPOINT_DIR, `${taskId}.json`);
  writeFileSync(filePath, JSON.stringify(state, null, 2));
}

/**
 * Restores a checkpoint from disk.
 * @param {string} taskId - Unique identifier for the task.
 * @returns {object|null} - Restored state or null if no checkpoint exists.
 */
export function restoreCheckpoint(taskId) {
  const filePath = resolve(CHECKPOINT_DIR, `${taskId}.json`);
  if (existsSync(filePath)) {
    return JSON.parse(readFileSync(filePath, 'utf-8'));
  }
  return null;
}

/**
 * Executes a long-running task in chunks with checkpointing.
 * @param {string} taskId - Unique identifier for the task.
 * @param {Array} taskChunks - Array of task chunks to process.
 * @param {function} processChunk - Function to process a single chunk.
 * @returns {Promise<void>} - Resolves when all chunks are processed.
 */
export async function executeTaskWithCheckpointing(taskId, taskChunks, processChunk) {
  let state = restoreCheckpoint(taskId) || { completed: 0 };

  for (let i = state.completed; i < taskChunks.length; i++) {
    try {
      await processChunk(taskChunks[i]);
      state.completed = i + 1;
      saveCheckpoint(taskId, state);
    } catch (error) {
      console.error(`Error processing chunk ${i}:`, error);
      break; // Stop processing on error
    }
  }
}

/**
 * Priority-based task scheduling.
 * @param {Array} tasks - Array of task objects with priority.
 * @returns {Array} - Sorted array of tasks by priority.
 */
export function scheduleTasksByPriority(tasks) {
  return tasks.sort((a, b) => b.priority - a.priority);
}

/**
 * Utility to chunk a large task into smaller pieces.
 * @param {Array} data - The data to chunk.
 * @param {number} chunkSize - The size of each chunk.
 * @returns {Array} - Array of chunks.
 */
export function chunkTask(data, chunkSize) {
  const chunks = [];
  for (let i = 0; i < data.length; i += chunkSize) {
    chunks.push(data.slice(i, i + chunkSize));
  }
  return chunks;
}
