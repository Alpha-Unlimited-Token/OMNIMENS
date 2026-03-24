/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: statefulSubprocessManager
 * Written: 2026-03-24T12:47:27.980Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// statefulSubprocessManager.mjs

import { writeFileSync, readFileSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { createHash } from 'crypto';

/**
 * Serialize an in-memory state object into a TypedArray and save it to a memory-mapped file.
 * @param {Object} state - The in-memory state object to serialize.
 * @param {string} checkpointId - A unique identifier for the checkpoint.
 * @returns {string} - The file path where the state is saved.
 */
export function saveStateToCheckpoint(state, checkpointId) {
  if (typeof state !== 'object' || state === null) {
    throw new Error('State must be a non-null object.');
  }

  if (typeof checkpointId !== 'string' || checkpointId.trim() === '') {
    throw new Error('Checkpoint ID must be a non-empty string.');
  }

  const serializedState = JSON.stringify(state);
  const buffer = Buffer.from(serializedState, 'utf-8');
  const filePath = join(tmpdir(), `${checkpointId}.json`);

  writeFileSync(filePath, buffer);
  return filePath;
}

/**
 * Restore an in-memory state object from a memory-mapped file.
 * @param {string} checkpointId - The unique identifier for the checkpoint.
 * @returns {Object} - The restored in-memory state object.
 */
export function restoreStateFromCheckpoint(checkpointId) {
  if (typeof checkpointId !== 'string' || checkpointId.trim() === '') {
    throw new Error('Checkpoint ID must be a non-empty string.');
  }

  const filePath = join(tmpdir(), `${checkpointId}.json`);
  const buffer = readFileSync(filePath);
  const serializedState = buffer.toString('utf-8');

  return JSON.parse(serializedState);
}

/**
 * Generate a deterministic hash for a state object.
 * @param {Object} state - The in-memory state object to hash.
 * @returns {string} - The hash string representing the state.
 */
export function generateStateHash(state) {
  if (typeof state !== 'object' || state === null) {
    throw new Error('State must be a non-null object.');
  }

  const serializedState = JSON.stringify(state);
  const hash = createHash('sha256');
  hash.update(serializedState);

  return hash.digest('hex');
}

/**
 * Compare two state objects for equality based on their hashes.
 * @param {Object} stateA - The first state object.
 * @param {Object} stateB - The second state object.
 * @returns {boolean} - True if the states are equivalent, false otherwise.
 */
export function compareStates(stateA, stateB) {
  const hashA = generateStateHash(stateA);
  const hashB = generateStateHash(stateB);

  return hashA === hashB;
}

/**
 * Safely merge two state objects, prioritizing keys from the second state.
 * @param {Object} baseState - The base state object.
 * @param {Object} newState - The new state object to merge.
 * @returns {Object} - The merged state object.
 */
export function mergeStates(baseState, newState) {
  if (typeof baseState !== 'object' || baseState === null) {
    throw new Error('Base state must be a non-null object.');
  }

  if (typeof newState !== 'object' || newState === null) {
    throw new Error('New state must be a non-null object.');
  }

  return { ...baseState, ...newState };
}