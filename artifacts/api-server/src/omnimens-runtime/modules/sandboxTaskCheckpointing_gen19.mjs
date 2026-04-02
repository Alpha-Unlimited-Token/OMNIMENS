/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: sandboxTaskCheckpointing
 * Written: 2026-04-02T13:30:42.522Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// sandboxTaskCheckpointing.mjs

import { createHash } from 'crypto';

// Utility to generate unique task IDs
export function generateTaskId(taskName) {
  const timestamp = Date.now();
  const hash = createHash('sha256').update(taskName + timestamp).digest('hex');
  return `${taskName}-${hash.slice(0, 12)}`;
}

// In-memory storage for checkpoints
const checkpointStore = new Map();

/**
 * Save checkpoint state for a task
 * @param {string} taskId - Unique task identifier
 * @param {object} state - Current state of the task
 */
export function saveCheckpoint(taskId, state) {
  checkpointStore.set(taskId, {
    state,
    timestamp: Date.now()
  });
}

/**
 * Load checkpoint state for a task
 * @param {string} taskId - Unique task identifier
 * @returns {object|null} - Returns the saved state or null if not found
 */
export function loadCheckpoint(taskId) {
  const checkpoint = checkpointStore.get(taskId);
  return checkpoint ? checkpoint.state : null;
}

/**
 * Delete checkpoint state for a task
 * @param {string} taskId - Unique task identifier
 */
export function deleteCheckpoint(taskId) {
  checkpointStore.delete(taskId);
}

/**
 * Split a long-running task into atomic units and process iteratively
 * @param {string} taskId - Unique task identifier
 * @param {Array} taskUnits - Array of atomic units to process
 * @param {function} processUnit - Function to process each unit
 * @returns {Promise<void>} - Resolves when all units are processed
 */
export async function executeTaskWithCheckpoints(taskId, taskUnits, processUnit) {
  let checkpointState = loadCheckpoint(taskId);
  let startIndex = checkpointState ? checkpointState.index : 0;

  for (let i = startIndex; i < taskUnits.length; i++) {
    try {
      await processUnit(taskUnits[i]);
      saveCheckpoint(taskId, { index: i + 1 });
    } catch (error) {
      console.error(`Error processing unit at index ${i}:`, error);
      throw error; // Halt execution on error
    }
  }

  deleteCheckpoint(taskId); // Task completed, clean up checkpoint
}

/**
 * Example usage: Generic task processor
 * @param {Array} data - Array of data to process
 * @param {function} processor - Function to process each data item
 */
export async function processDataWithCheckpointing(data, processor) {
  const taskId = generateTaskId('dataProcessing');
  await executeTaskWithCheckpoints(taskId, data, processor);
}
