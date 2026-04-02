/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: subprocessCheckpointManager
 * Written: 2026-04-02T15:14:46.079Z
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
import { createHash } from 'crypto';

/**
 * Serialize an object to a JSON string and compute a hash for checkpointing.
 * @param {Object} state - The state object to serialize.
 * @returns {Object} - An object containing the serialized state and its hash.
 */
export function serializeState(state) {
  const serialized = JSON.stringify(state);
  const hash = createHash('sha256').update(serialized).digest('hex');
  return { serialized, hash };
}

/**
 * Write a serialized state to a checkpoint file.
 * @param {string} filePath - The file path to save the checkpoint.
 * @param {string} serializedState - The serialized state string.
 * @returns {Promise<void>} - A promise that resolves when the file is written.
 */
export async function saveCheckpoint(filePath, serializedState) {
  await writeFile(filePath, serializedState, 'utf8');
}

/**
 * Read a checkpoint file and parse its contents.
 * @param {string} filePath - The file path to read the checkpoint from.
 * @returns {Promise<Object>} - A promise that resolves to the parsed state object.
 */
export async function loadCheckpoint(filePath) {
  const serializedState = await readFile(filePath, 'utf8');
  return JSON.parse(serializedState);
}

/**
 * Resume a computation from a checkpoint or start fresh if none exists.
 * @param {string} filePath - The file path to the checkpoint.
 * @param {Function} computeFunction - The function to execute for computation.
 * @param {Object} initialState - The initial state to use if no checkpoint exists.
 * @returns {Promise<Object>} - A promise that resolves to the final computation state.
 */
export async function resumeComputation(filePath, computeFunction, initialState) {
  let state;
  try {
    state = await loadCheckpoint(filePath);
  } catch {
    state = initialState;
  }

  while (!state.done) {
    state = computeFunction(state);
    const { serialized } = serializeState(state);
    await saveCheckpoint(filePath, serialized);
  }

  return state;
}

/**
 * Example computation function for testing.
 * @param {Object} state - The current computation state.
 * @returns {Object} - The updated computation state.
 */
export function exampleComputeFunction(state) {
  state.counter = (state.counter || 0) + 1;
  state.done = state.counter >= 5;
  return state;
}

/**
 * Utility to clear sensitive data from a state object before checkpointing.
 * @param {Object} state - The state object to sanitize.
 * @param {Array<string>} keysToRemove - Keys to remove from the state.
 * @returns {Object} - A sanitized copy of the state object.
 */
export function sanitizeState(state, keysToRemove) {
  const sanitizedState = { ...state };
  for (const key of keysToRemove) {
    delete sanitizedState[key];
  }
  return sanitizedState;
}

/**
 * Utility to validate the integrity of a checkpoint file.
 * @param {string} serializedState - The serialized state string.
 * @param {string} expectedHash - The expected hash of the state.
 * @returns {boolean} - True if the hash matches, false otherwise.
 */
export function validateCheckpoint(serializedState, expectedHash) {
  const hash = createHash('sha256').update(serializedState).digest('hex');
  return hash === expectedHash;
}