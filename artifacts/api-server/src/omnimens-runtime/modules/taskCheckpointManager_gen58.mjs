/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: taskCheckpointManager
 * Written: 2026-04-02T14:31:16.673Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// taskCheckpointManager.mjs

import { createHash } from 'crypto';

/**
 * Generates a unique hash for a given task state.
 * @param {Object} state - The task state to hash.
 * @returns {string} - A unique hash representing the state.
 */
export function generateStateHash(state) {
  const hash = createHash('sha256');
  hash.update(JSON.stringify(state));
  return hash.digest('hex');
}

/**
 * Partitions a task into discrete units based on a provided partition function.
 * @param {Array} taskData - The data to partition.
 * @param {function} partitionFunction - Function defining partition logic.
 * @returns {Array} - Array of partitioned task units.
 */
export function partitionTask(taskData, partitionFunction) {
  if (typeof partitionFunction !== 'function') {
    throw new Error('partitionFunction must be a function');
  }
  return partitionFunction(taskData);
}

/**
 * Serializes a task state to a memory object for checkpointing.
 * @param {Object} state - The task state to serialize.
 * @param {Object} memoryStore - The memory object to store serialized states.
 * @returns {string} - The hash key used for storing the state.
 */
export function serializeState(state, memoryStore) {
  if (typeof memoryStore !== 'object') {
    throw new Error('memoryStore must be an object');
  }
  const stateHash = generateStateHash(state);
  memoryStore[stateHash] = state;
  return stateHash;
}

/**
 * Resumes computation from a checkpointed state.
 * @param {string} stateHash - The hash key of the checkpointed state.
 * @param {Object} memoryStore - The memory object containing serialized states.
 * @returns {Object} - The resumed state.
 */
export function resumeFromCheckpoint(stateHash, memoryStore) {
  if (!memoryStore[stateHash]) {
    throw new Error('Checkpoint not found for the provided stateHash');
  }
  return memoryStore[stateHash];
}

/**
 * Executes a long-running computation with checkpointing.
 * @param {Array} taskData - The data to process.
 * @param {function} computeFunction - Function defining computation logic.
 * @param {Object} memoryStore - The memory object for checkpointing.
 * @returns {Object} - Final computation result.
 */
export function executeWithCheckpointing(taskData, computeFunction, memoryStore) {
  if (typeof computeFunction !== 'function') {
    throw new Error('computeFunction must be a function');
  }
  let currentState = { taskData, progress: 0 };
  const stateHash = serializeState(currentState, memoryStore);

  while (currentState.progress < taskData.length) {
    const taskUnit = taskData[currentState.progress];
    currentState.progress++;
    currentState.result = computeFunction(taskUnit, currentState.result);
    serializeState(currentState, memoryStore);
  }

  return currentState.result;
}

/**
 * Utility to clear all checkpoints from memory.
 * @param {Object} memoryStore - The memory object containing serialized states.
 */
export function clearCheckpoints(memoryStore) {
  Object.keys(memoryStore).forEach(key => delete memoryStore[key]);
}
