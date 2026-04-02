/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: checkpointedProcessManager
 * Written: 2026-04-02T15:06:23.592Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// checkpointedProcessManager.mjs

import { writeFile, readFile } from 'fs/promises';
import { randomUUID } from 'crypto';

/**
 * Saves a checkpoint to disk or memory.
 * @param {string} id - Unique identifier for the process.
 * @param {object} state - Current state of the process to checkpoint.
 * @param {string} [filePath] - Optional file path to save the checkpoint.
 * @returns {Promise<void>} Resolves when the checkpoint is saved.
 */
export async function saveCheckpoint(id, state, filePath = `./${id}.checkpoint.json`) {
  const serializedState = JSON.stringify({ id, state, timestamp: Date.now() });
  await writeFile(filePath, serializedState, 'utf-8');
}

/**
 * Loads a checkpoint from disk or memory.
 * @param {string} id - Unique identifier for the process.
 * @param {string} [filePath] - Optional file path to load the checkpoint from.
 * @returns {Promise<object>} Resolves with the loaded state or null if not found.
 */
export async function loadCheckpoint(id, filePath = `./${id}.checkpoint.json`) {
  try {
    const data = await readFile(filePath, 'utf-8');
    const parsed = JSON.parse(data);
    if (parsed.id === id) {
      return parsed.state;
    }
    return null;
  } catch (error) {
    if (error.code === 'ENOENT') return null; // File not found
    throw error;
  }
}

/**
 * Manages a long-lived computation with periodic checkpointing.
 * @param {string} id - Unique identifier for the process.
 * @param {function(object): Promise<object>} computeFunction - Async function to execute computation, receives current state.
 * @param {object} initialState - Initial state to start the computation.
 * @param {number} checkpointInterval - Time interval in milliseconds for checkpointing.
 * @param {string} [filePath] - Optional file path for saving checkpoints.
 * @returns {Promise<object>} Resolves with the final state of the computation.
 */
export async function checkpointedProcessManager(id, computeFunction, initialState, checkpointInterval, filePath) {
  let state = await loadCheckpoint(id, filePath) || initialState;
  let lastCheckpointTime = Date.now();

  while (true) {
    state = await computeFunction(state);

    if (Date.now() - lastCheckpointTime >= checkpointInterval) {
      await saveCheckpoint(id, state, filePath);
      lastCheckpointTime = Date.now();
    }

    if (state.done) break; // Assume `state.done` signals completion
  }

  return state;
}

/**
 * Utility to generate a unique process ID.
 * @returns {string} A unique identifier.
 */
export function generateProcessId() {
  return randomUUID();
}