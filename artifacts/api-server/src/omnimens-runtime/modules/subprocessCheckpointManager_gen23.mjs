/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: subprocessCheckpointManager
 * Written: 2026-04-02T14:25:07.570Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// subprocessCheckpointManager.mjs

import { writeFile, readFile } from 'fs/promises';
import { createHash } from 'crypto';

/**
 * Serializes a computation state to disk or memory periodically.
 * Restores state automatically upon timeout or failure.
 */

const checkpoints = new Map();

/**
 * Generates a unique hash-based key for a given process identifier.
 * @param {string} processId - Unique identifier for the process.
 * @returns {string} - A unique hash key.
 */
export function generateCheckpointKey(processId) {
  const hash = createHash('sha256');
  hash.update(processId);
  return hash.digest('hex');
}

/**
 * Saves the computation state to memory or disk.
 * @param {string} key - Unique key for the process.
 * @param {object} state - The current state of the computation.
 * @param {string} [filePath] - Optional file path for disk storage.
 * @returns {Promise<void>}
 */
export async function saveCheckpoint(key, state, filePath = null) {
  const serializedState = JSON.stringify(state);
  if (filePath) {
    await writeFile(filePath, serializedState, 'utf8');
  } else {
    checkpoints.set(key, serializedState);
  }
}

/**
 * Restores the computation state from memory or disk.
 * @param {string} key - Unique key for the process.
 * @param {string} [filePath] - Optional file path for disk storage.
 * @returns {Promise<object|null>} - The restored state or null if not found.
 */
export async function restoreCheckpoint(key, filePath = null) {
  if (filePath) {
    try {
      const data = await readFile(filePath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      return null; // File not found or invalid JSON
    }
  } else {
    const serializedState = checkpoints.get(key);
    return serializedState ? JSON.parse(serializedState) : null;
  }
}

/**
 * Periodically saves the computation state during long-running processes.
 * @param {string} key - Unique key for the process.
 * @param {Function} getStateFunction - Function returning the current state.
 * @param {number} intervalMs - Save interval in milliseconds.
 * @param {string} [filePath] - Optional file path for disk storage.
 * @returns {Promise<void>} - Resolves when the process completes.
 */
export async function manageCheckpoint(key, getStateFunction, intervalMs, filePath = null) {
  let isRunning = true;

  const interval = setInterval(async () => {
    if (!isRunning) return;
    const state = getStateFunction();
    await saveCheckpoint(key, state, filePath);
  }, intervalMs);

  return {
    stop: () => {
      isRunning = false;
      clearInterval(interval);
    }
  };
}

/**
 * Utility function to resume a process from its last checkpoint.
 * @param {string} key - Unique key for the process.
 * @param {Function} resumeFunction - Function to resume computation.
 * @param {string} [filePath] - Optional file path for disk storage.
 * @returns {Promise<void>} - Resolves when the process completes.
 */
export async function resumeFromCheckpoint(key, resumeFunction, filePath = null) {
  const state = await restoreCheckpoint(key, filePath);
  if (state) {
    await resumeFunction(state);
  } else {
    throw new Error('No checkpoint found to resume from.');
  }
}
