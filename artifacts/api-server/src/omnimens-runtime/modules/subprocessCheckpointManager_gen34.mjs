/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: subprocessCheckpointManager
 * Written: 2026-04-01T22:05:01.270Z
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
import { join } from 'path';
import { createHash } from 'crypto';

const CHECKPOINT_DIR = './checkpoints';

/**
 * Generates a unique hash for a given computation identifier and input state.
 * @param {string} computationId - Unique identifier for the computation.
 * @param {object} state - Current state of the computation.
 * @returns {string} - A unique hash string.
 */
export function generateCheckpointHash(computationId, state) {
  const hash = createHash('sha256');
  hash.update(computationId + JSON.stringify(state));
  return hash.digest('hex');
}

/**
 * Saves the current state of a computation to a checkpoint file.
 * @param {string} computationId - Unique identifier for the computation.
 * @param {object} state - Current state of the computation to save.
 * @returns {Promise<void>} - Resolves when the checkpoint is saved.
 */
export async function saveCheckpoint(computationId, state) {
  const hash = generateCheckpointHash(computationId, state);
  const filePath = join(CHECKPOINT_DIR, `${hash}.json`);
  const serializedState = JSON.stringify(state);
  await writeFile(filePath, serializedState, 'utf8');
}

/**
 * Loads a saved checkpoint state for a computation if it exists.
 * @param {string} computationId - Unique identifier for the computation.
 * @param {object} state - Current state to check for a matching checkpoint.
 * @returns {Promise<object|null>} - The loaded state or null if no checkpoint exists.
 */
export async function loadCheckpoint(computationId, state) {
  const hash = generateCheckpointHash(computationId, state);
  const filePath = join(CHECKPOINT_DIR, `${hash}.json`);
  try {
    const serializedState = await readFile(filePath, 'utf8');
    return JSON.parse(serializedState);
  } catch {
    return null; // No checkpoint found
  }
}

/**
 * Iteratively executes a computation function with checkpointing.
 * @param {string} computationId - Unique identifier for the computation.
 * @param {function} computationFunction - The computation function to execute.
 * @param {object} initialState - Initial state for the computation.
 * @param {function} shouldContinue - Function to determine if execution should continue.
 * @returns {Promise<object>} - Final state after computation completes.
 */
export async function executeWithCheckpointing(computationId, computationFunction, initialState, shouldContinue) {
  let state = await loadCheckpoint(computationId, initialState) || initialState;

  while (shouldContinue(state)) {
    state = computationFunction(state);
    await saveCheckpoint(computationId, state);
  }

  return state;
}

/**
 * Utility to determine if a computation should continue based on iteration count.
 * @param {number} maxIterations - Maximum number of iterations allowed.
 * @returns {function} - A function that takes a state and returns a boolean.
 */
export function createIterationLimiter(maxIterations) {
  return (state) => (state.iteration || 0) < maxIterations;
}

/**
 * Example computation function for testing purposes.
 * @param {object} state - Current state of the computation.
 * @returns {object} - Updated state after computation step.
 */
export function exampleComputationFunction(state) {
  const iteration = (state.iteration || 0) + 1;
  return { ...state, iteration, value: (state.value || 0) + iteration };
}
