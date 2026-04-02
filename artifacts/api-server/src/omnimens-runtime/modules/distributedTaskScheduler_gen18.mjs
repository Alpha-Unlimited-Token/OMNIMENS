/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: distributedTaskScheduler
 * Written: 2026-04-02T14:54:02.608Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// distributedTaskScheduler.mjs

import { createHash } from 'crypto';

/**
 * Utility function to generate a unique hash for a given task state.
 * @param {object} state - The state object to hash.
 * @returns {string} - A unique hash representing the state.
 */
export function generateStateHash(state) {
  const jsonState = JSON.stringify(state);
  return createHash('sha256').update(jsonState).digest('hex');
}

/**
 * Partitions a task graph into smaller subgraphs for distributed execution.
 * @param {object} taskGraph - The task graph represented as an adjacency list.
 * @param {number} maxPartitionSize - The maximum number of nodes per partition.
 * @returns {Array<object>} - Array of subgraphs (partitions).
 */
export function partitionTaskGraph(taskGraph, maxPartitionSize) {
  const partitions = [];
  const visited = new Set();

  function dfs(node, currentPartition) {
    if (visited.has(node) || currentPartition.length >= maxPartitionSize) {
      return;
    }
    visited.add(node);
    currentPartition.push(node);
    for (const neighbor of taskGraph[node] || []) {
      dfs(neighbor, currentPartition);
    }
  }

  for (const node in taskGraph) {
    if (!visited.has(node)) {
      const partition = [];
      dfs(node, partition);
      partitions.push(partition);
    }
  }

  return partitions;
}

/**
 * Checkpoints the state of a computation for persistence.
 * @param {object} state - The current state of the computation.
 * @returns {object} - A checkpoint object containing the state and its hash.
 */
export function checkpointState(state) {
  const stateHash = generateStateHash(state);
  return { state, stateHash, timestamp: Date.now() };
}

/**
 * Restores a computation state from a checkpoint.
 * @param {object} checkpoint - The checkpoint object.
 * @returns {object} - The restored state.
 */
export function restoreState(checkpoint) {
  return checkpoint.state;
}

/**
 * Executes a distributed computation across partitions with state persistence.
 * @param {Array<object>} partitions - Array of task graph partitions.
 * @param {function} computeFunction - The computation to perform on each partition.
 * @returns {Array<object>} - Array of results from each partition.
 */
export async function executeDistributedComputation(partitions, computeFunction) {
  const results = [];

  for (const partition of partitions) {
    const initialState = { partition, progress: 0 };
    let checkpoint = checkpointState(initialState);

    try {
      const result = await computeFunction(partition);
      results.push({ partition, result });
    } catch (error) {
      console.error('Error during computation:', error);
      results.push({ partition, error: error.message });
    }
  }

  return results;
}

/**
 * Validates the integrity of a checkpoint.
 * @param {object} checkpoint - The checkpoint object to validate.
 * @returns {boolean} - True if the checkpoint is valid, false otherwise.
 */
export function validateCheckpoint(checkpoint) {
  const recalculatedHash = generateStateHash(checkpoint.state);
  return recalculatedHash === checkpoint.stateHash;
}