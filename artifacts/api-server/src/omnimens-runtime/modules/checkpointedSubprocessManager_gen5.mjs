/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: checkpointedSubprocessManager
 * Written: 2026-04-03T14:26:02.979Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// checkpointedSubprocessManager.mjs

import { writeFile, readFile } from 'fs/promises';
import { createHash } from 'crypto';

/**
 * Saves the current state to a checkpoint file.
 * @param {string} filePath - The path to the checkpoint file.
 * @param {object} state - The current state to save.
 * @returns {Promise<void>} Resolves when the state is saved.
 */
export async function saveCheckpoint(filePath, state) {
  const serializedState = JSON.stringify(state);
  const hash = createHash('sha256').update(serializedState).digest('hex');
  const checkpointData = { state: serializedState, hash };
  await writeFile(filePath, JSON.stringify(checkpointData));
}

/**
 * Loads the state from a checkpoint file.
 * @param {string} filePath - The path to the checkpoint file.
 * @returns {Promise<object|null>} The loaded state, or null if invalid or not found.
 */
export async function loadCheckpoint(filePath) {
  try {
    const data = await readFile(filePath, 'utf8');
    const { state, hash } = JSON.parse(data);
    const computedHash = createHash('sha256').update(state).digest('hex');
    if (computedHash === hash) {
      return JSON.parse(state);
    }
    return null; // Corrupted checkpoint
  } catch {
    return null; // File not found or invalid format
  }
}

/**
 * Executes a computation with checkpointing and timeout handling.
 * @param {Function} computationFunction - The computation to execute.
 * @param {object} initialState - The initial state for the computation.
 * @param {string} checkpointPath - Path to save/load the checkpoint.
 * @param {number} timeoutMs - Timeout in milliseconds for each iteration.
 * @returns {Promise<object>} The final state after computation.
 */
export async function runWithCheckpointing(computationFunction, initialState, checkpointPath, timeoutMs) {
  let state = await loadCheckpoint(checkpointPath) || initialState;

  while (!state.done) {
    const startTime = Date.now();

    try {
      state = await Promise.race([
        computationFunction(state),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), timeoutMs))
      ]);
    } catch (error) {
      if (error.message === 'Timeout') {
        console.warn('Iteration timed out. Restarting from last checkpoint.');
      } else {
        throw error; // Propagate unexpected errors
      }
    }

    if (Date.now() - startTime < timeoutMs) {
      await saveCheckpoint(checkpointPath, state);
    }
  }

  return state;
}

/**
 * Generic utility to create a deep clone of an object.
 * @param {object} obj - The object to clone.
 * @returns {object} A deep clone of the object.
 */
export function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Utility to validate if an object matches a given schema.
 * @param {object} obj - The object to validate.
 * @param {object} schema - The schema to validate against (key-value pairs of expected types).
 * @returns {boolean} True if the object matches the schema, false otherwise.
 */
export function validateSchema(obj, schema) {
  return Object.entries(schema).every(([key, type]) => typeof obj[key] === type);
}