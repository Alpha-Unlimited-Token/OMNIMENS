/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: taskCheckpointingManager
 * Written: 2026-04-01T22:04:46.472Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// taskCheckpointingManager.mjs

import { writeFileSync, readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { createHash } from 'node:crypto';

const CHECKPOINT_DIR = './checkpoints';

/**
 * Generates a unique hash for a given task identifier.
 * @param {string} taskId - Unique identifier for the task.
 * @returns {string} - A hashed string for task identification.
 */
export function generateTaskHash(taskId) {
  return createHash('sha256').update(taskId).digest('hex');
}

/**
 * Saves the intermediate state of a computation to a checkpoint file.
 * @param {string} taskId - Unique identifier for the task.
 * @param {object} state - The intermediate state to serialize.
 */
export function saveCheckpoint(taskId, state) {
  const taskHash = generateTaskHash(taskId);
  const filePath = join(CHECKPOINT_DIR, `${taskHash}.json`);
  const serializedState = JSON.stringify(state);
  writeFileSync(filePath, serializedState, 'utf8');
}

/**
 * Loads the intermediate state of a computation from a checkpoint file.
 * @param {string} taskId - Unique identifier for the task.
 * @returns {object|null} - The deserialized state, or null if no checkpoint exists.
 */
export function loadCheckpoint(taskId) {
  const taskHash = generateTaskHash(taskId);
  const filePath = join(CHECKPOINT_DIR, `${taskHash}.json`);
  if (existsSync(filePath)) {
    const serializedState = readFileSync(filePath, 'utf8');
    return JSON.parse(serializedState);
  }
  return null;
}

/**
 * Checks if a checkpoint exists for the given task.
 * @param {string} taskId - Unique identifier for the task.
 * @returns {boolean} - True if the checkpoint exists, false otherwise.
 */
export function checkpointExists(taskId) {
  const taskHash = generateTaskHash(taskId);
  const filePath = join(CHECKPOINT_DIR, `${taskHash}.json`);
  return existsSync(filePath);
}

/**
 * Deletes a checkpoint for a given task to free resources.
 * @param {string} taskId - Unique identifier for the task.
 */
export function deleteCheckpoint(taskId) {
  const taskHash = generateTaskHash(taskId);
  const filePath = join(CHECKPOINT_DIR, `${taskHash}.json`);
  if (existsSync(filePath)) {
    writeFileSync(filePath, '{}', 'utf8'); // Overwrite with empty JSON.
  }
}

/**
 * Updates the progress of a computation dynamically.
 * @param {object} state - The computation state object.
 * @param {string} key - The key to update in the state.
 * @param {any} value - The new value to set for the key.
 * @returns {object} - Updated state object.
 */
export function updateProgress(state, key, value) {
  state[key] = value;
  return state;
}

/**
 * Resumes a computation by reloading its last known state or initializing a new one.
 * @param {string} taskId - Unique identifier for the task.
 * @param {object} initialState - The initial state if no checkpoint exists.
 * @returns {object} - The resumed or initialized state.
 */
export function resumeComputation(taskId, initialState) {
  const existingState = loadCheckpoint(taskId);
  return existingState || initialState;
}
