/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: iterativeCheckpointManager
 * Written: 2026-04-02T14:12:15.430Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// iterativeCheckpointManager.mjs

import { writeFileSync, readFileSync, existsSync } from 'fs';
import { resolve } from 'path';
import { createHash } from 'crypto';

/**
 * Generates a unique hash for a given input object.
 * @param {any} input - The input to be hashed.
 * @returns {string} - A unique hash string.
 */
export function generateHash(input) {
  const hash = createHash('sha256');
  hash.update(JSON.stringify(input));
  return hash.digest('hex');
}

/**
 * Saves the computation state to a checkpoint file.
 * @param {string} checkpointDir - Directory to store checkpoint files.
 * @param {string} checkpointId - Unique identifier for the checkpoint.
 * @param {object} state - The computation state to persist.
 */
export function saveCheckpoint(checkpointDir, checkpointId, state) {
  const filePath = resolve(checkpointDir, `${checkpointId}.json`);
  writeFileSync(filePath, JSON.stringify(state, null, 2), 'utf8');
}

/**
 * Loads the computation state from a checkpoint file.
 * @param {string} checkpointDir - Directory containing checkpoint files.
 * @param {string} checkpointId - Unique identifier for the checkpoint.
 * @returns {object|null} - The loaded state, or null if no checkpoint exists.
 */
export function loadCheckpoint(checkpointDir, checkpointId) {
  const filePath = resolve(checkpointDir, `${checkpointId}.json`);
  if (!existsSync(filePath)) return null;
  return JSON.parse(readFileSync(filePath, 'utf8'));
}

/**
 * Splits a long-running computation into smaller chunks with state persistence.
 * @param {string} checkpointDir - Directory to store checkpoint files.
 * @param {string} checkpointId - Unique identifier for the checkpoint.
 * @param {function} taskFunction - The computation function to execute.
 * @param {object} [initialState={}] - Initial state for the computation.
 * @returns {Promise<object>} - Final state after computation.
 */
export async function runWithCheckpoints(checkpointDir, checkpointId, taskFunction, initialState = {}) {
  let state = loadCheckpoint(checkpointDir, checkpointId) || initialState;

  while (!state.isComplete) {
    state = await taskFunction(state);
    saveCheckpoint(checkpointDir, checkpointId, state);
  }

  return state;
}

/**
 * Example task function for demonstration purposes.
 * @param {object} state - Current computation state.
 * @returns {Promise<object>} - Updated state after processing.
 */
export async function exampleTaskFunction(state) {
  const { currentStep = 0, totalSteps = 10 } = state;
  const nextStep = currentStep + 1;

  return {
    currentStep: nextStep,
    totalSteps,
    isComplete: nextStep >= totalSteps
  };
}

/**
 * Utility to clear a checkpoint file (useful for resetting).
 * @param {string} checkpointDir - Directory containing checkpoint files.
 * @param {string} checkpointId - Unique identifier for the checkpoint.
 */
export function clearCheckpoint(checkpointDir, checkpointId) {
  const filePath = resolve(checkpointDir, `${checkpointId}.json`);
  if (existsSync(filePath)) {
    writeFileSync(filePath, '{}', 'utf8');
  }
}