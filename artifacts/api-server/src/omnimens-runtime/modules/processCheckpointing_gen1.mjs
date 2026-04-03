/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: processCheckpointing
 * Written: 2026-04-03T07:00:22.618Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// processCheckpointing.mjs

import { writeFileSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { createHash } from 'node:crypto';

/**
 * Serializes a state object to a file for checkpointing.
 * @param {string} identifier - Unique identifier for the checkpoint.
 * @param {object} state - The state object to serialize.
 * @param {string} directory - Directory to store the checkpoint file.
 */
export function saveCheckpoint(identifier, state, directory = './checkpoints') {
  const filePath = resolve(directory, `${identifier}.json`);
  const serializedState = JSON.stringify(state);
  writeFileSync(filePath, serializedState, 'utf8');
}

/**
 * Deserializes a state object from a checkpoint file.
 * @param {string} identifier - Unique identifier for the checkpoint.
 * @param {string} directory - Directory where the checkpoint file is stored.
 * @returns {object|null} - The deserialized state object, or null if not found.
 */
export function loadCheckpoint(identifier, directory = './checkpoints') {
  const filePath = resolve(directory, `${identifier}.json`);
  try {
    const serializedState = readFileSync(filePath, 'utf8');
    return JSON.parse(serializedState);
  } catch (error) {
    return null; // Return null if the file doesn't exist or cannot be read.
  }
}

/**
 * Partitions a large task into smaller sub-tasks.
 * @param {Array} taskList - Array of tasks to be partitioned.
 * @param {number} partitionSize - Maximum size of each partition.
 * @returns {Array<Array>} - Array of task partitions.
 */
export function partitionTasks(taskList, partitionSize) {
  const partitions = [];
  for (let i = 0; i < taskList.length; i += partitionSize) {
    partitions.push(taskList.slice(i, i + partitionSize));
  }
  return partitions;
}

/**
 * Generates a unique hash for a given state object.
 * @param {object} state - The state object to hash.
 * @returns {string} - A SHA-256 hash representing the state.
 */
export function generateStateHash(state) {
  const serializedState = JSON.stringify(state);
  const hash = createHash('sha256');
  hash.update(serializedState);
  return hash.digest('hex');
}

/**
 * Validates if a checkpoint matches a given state by comparing hashes.
 * @param {object} state - The state object to validate.
 * @param {string} identifier - Unique identifier for the checkpoint.
 * @param {string} directory - Directory where the checkpoint file is stored.
 * @returns {boolean} - True if the checkpoint matches the state, otherwise false.
 */
export function validateCheckpoint(state, identifier, directory = './checkpoints') {
  const checkpointState = loadCheckpoint(identifier, directory);
  if (!checkpointState) return false;
  const stateHash = generateStateHash(state);
  const checkpointHash = generateStateHash(checkpointState);
  return stateHash === checkpointHash;
}

/**
 * Utility function for iterative computations.
 * @param {Array} tasks - Array of tasks to process.
 * @param {function} taskProcessor - Function to process each task.
 * @param {string} identifier - Unique identifier for checkpointing.
 * @param {string} directory - Directory to store checkpoints.
 * @returns {Array} - Results of processed tasks.
 */
export function processIteratively(tasks, taskProcessor, identifier, directory = './checkpoints') {
  const checkpoint = loadCheckpoint(identifier, directory);
  const startIndex = checkpoint?.lastProcessedIndex ?? 0;
  const results = checkpoint?.results ?? [];

  for (let i = startIndex; i < tasks.length; i++) {
    const result = taskProcessor(tasks[i]);
    results.push(result);
    saveCheckpoint(identifier, { lastProcessedIndex: i + 1, results }, directory);
  }

  return results;
}