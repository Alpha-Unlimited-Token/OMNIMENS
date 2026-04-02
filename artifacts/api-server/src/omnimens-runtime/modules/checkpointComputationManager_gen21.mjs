/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: checkpointComputationManager
 * Written: 2026-04-02T14:11:26.464Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// Complete ES module code here

import { createHash } from 'crypto';

/**
 * Computes a unique hash for checkpoint data.
 * @param {object} data - The data to hash.
 * @returns {string} - A SHA-256 hash of the data.
 */
export function computeCheckpointHash(data) {
  const serializedData = JSON.stringify(data);
  const hash = createHash('sha256');
  hash.update(serializedData);
  return hash.digest('hex');
}

/**
 * Saves a checkpoint state to memory.
 * @param {Map} memoryStore - A Map object to store checkpoints.
 * @param {string} key - The unique identifier for the checkpoint.
 * @param {object} state - The state to save.
 * @returns {boolean} - True if saved successfully.
 */
export function saveCheckpointToMemory(memoryStore, key, state) {
  if (!memoryStore || !(memoryStore instanceof Map)) {
    throw new Error('Invalid memory store provided.');
  }
  const hash = computeCheckpointHash(state);
  memoryStore.set(key, { state, hash });
  return true;
}

/**
 * Restores a checkpoint state from memory.
 * @param {Map} memoryStore - A Map object containing checkpoints.
 * @param {string} key - The unique identifier for the checkpoint.
 * @returns {object|null} - Restored state or null if not found.
 */
export function restoreCheckpointFromMemory(memoryStore, key) {
  if (!memoryStore || !(memoryStore instanceof Map)) {
    throw new Error('Invalid memory store provided.');
  }
  const checkpoint = memoryStore.get(key);
  return checkpoint ? checkpoint.state : null;
}

/**
 * Validates the integrity of a checkpoint.
 * @param {object} state - The state to validate.
 * @param {string} hash - The expected hash of the state.
 * @returns {boolean} - True if the state matches the hash.
 */
export function validateCheckpointIntegrity(state, hash) {
  const computedHash = computeCheckpointHash(state);
  return computedHash === hash;
}

/**
 * Periodically runs a computation and saves checkpoints.
 * @param {function} computationFunction - The iterative computation function.
 * @param {number} iterations - Total number of iterations.
 * @param {number} checkpointInterval - Interval for saving checkpoints.
 * @param {Map} memoryStore - A Map object to store checkpoints.
 * @returns {object} - Final computed result.
 */
export function runWithCheckpoints(computationFunction, iterations, checkpointInterval, memoryStore) {
  if (typeof computationFunction !== 'function') {
    throw new Error('Invalid computation function provided.');
  }
  if (!memoryStore || !(memoryStore instanceof Map)) {
    throw new Error('Invalid memory store provided.');
  }

  let state = {};
  for (let i = 0; i < iterations; i++) {
    state = computationFunction(state, i);

    if (i % checkpointInterval === 0 || i === iterations - 1) {
      saveCheckpointToMemory(memoryStore, `iteration_${i}`, state);
    }
  }

  return state;
}

/**
 * Restores and resumes a computation from a specific checkpoint.
 * @param {function} computationFunction - The iterative computation function.
 * @param {number} startIteration - The iteration to resume from.
 * @param {number} iterations - Total number of iterations.
 * @param {number} checkpointInterval - Interval for saving checkpoints.
 * @param {Map} memoryStore - A Map object containing checkpoints.
 * @returns {object} - Final computed result.
 */
export function resumeFromCheckpoint(computationFunction, startIteration, iterations, checkpointInterval, memoryStore) {
  if (typeof computationFunction !== 'function') {
    throw new Error('Invalid computation function provided.');
  }
  if (!memoryStore || !(memoryStore instanceof Map)) {
    throw new Error('Invalid memory store provided.');
  }

  const checkpoint = restoreCheckpointFromMemory(memoryStore, `iteration_${startIteration}`);
  if (!checkpoint) {
    throw new Error('Checkpoint not found for the given iteration.');
  }

  let state = checkpoint;
  for (let i = startIteration + 1; i < iterations; i++) {
    state = computationFunction(state, i);

    if (i % checkpointInterval === 0 || i === iterations - 1) {
      saveCheckpointToMemory(memoryStore, `iteration_${i}`, state);
    }
  }

  return state;
}