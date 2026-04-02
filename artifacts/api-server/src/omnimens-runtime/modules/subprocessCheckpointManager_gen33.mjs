/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: subprocessCheckpointManager
 * Written: 2026-04-02T13:32:12.375Z
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

import { writeFileSync, readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { createHash } from 'crypto';

/**
 * Generates a unique hash for a given task input.
 * @param {string} input - The task input to hash.
 * @returns {string} - A unique hash string.
 */
export function generateTaskHash(input) {
  const hash = createHash('sha256');
  hash.update(input);
  return hash.digest('hex');
}

/**
 * Saves the state of a subprocess to a checkpoint file.
 * @param {string} taskId - Unique identifier for the task.
 * @param {object} state - The current state of the task.
 * @param {string} checkpointDir - Directory to store checkpoint files.
 */
export function saveCheckpoint(taskId, state, checkpointDir) {
  const filePath = join(checkpointDir, `${taskId}.json`);
  writeFileSync(filePath, JSON.stringify(state, null, 2), 'utf8');
}

/**
 * Loads the state of a subprocess from a checkpoint file.
 * @param {string} taskId - Unique identifier for the task.
 * @param {string} checkpointDir - Directory where checkpoint files are stored.
 * @returns {object|null} - The restored state or null if no checkpoint exists.
 */
export function loadCheckpoint(taskId, checkpointDir) {
  const filePath = join(checkpointDir, `${taskId}.json`);
  if (existsSync(filePath)) {
    const stateData = readFileSync(filePath, 'utf8');
    return JSON.parse(stateData);
  }
  return null;
}

/**
 * Executes a task in iterative subprocesses with checkpointing.
 * @param {string} taskId - Unique identifier for the task.
 * @param {function} taskFunction - The main function for the task.
 * @param {object} initialState - The initial state of the task.
 * @param {string} checkpointDir - Directory to store checkpoint files.
 * @param {function} isTaskComplete - Function to check if the task is complete.
 * @returns {object} - The final state of the task.
 */
export async function runWithCheckpoints(taskId, taskFunction, initialState, checkpointDir, isTaskComplete) {
  let state = loadCheckpoint(taskId, checkpointDir) || initialState;

  while (!isTaskComplete(state)) {
    state = await taskFunction(state);
    saveCheckpoint(taskId, state, checkpointDir);
  }

  return state;
}

/**
 * Example utility function for iterative graph traversal.
 * @param {object} graph - The graph structure.
 * @param {string} startNode - The starting node.
 * @param {function} visitFunction - Function to execute on each visited node.
 * @returns {object} - The traversal state.
 */
export function iterativeGraphTraversal(graph, startNode, visitFunction) {
  const visited = new Set();
  const stack = [startNode];
  const state = { visited: Array.from(visited), stack }; // Serializeable state

  while (stack.length > 0) {
    const currentNode = stack.pop();

    if (!visited.has(currentNode)) {
      visitFunction(currentNode);
      visited.add(currentNode);

      for (const neighbor of graph[currentNode] || []) {
        if (!visited.has(neighbor)) {
          stack.push(neighbor);
        }
      }
    }
  }

  state.visited = Array.from(visited);
  return state;
}
