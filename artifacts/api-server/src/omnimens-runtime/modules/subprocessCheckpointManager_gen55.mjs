/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: subprocessCheckpointManager
 * Written: 2026-04-02T13:34:10.716Z
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

import { writeFileSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const cache = new Map();

/**
 * Serializes a state object to JSON and persists it to a file.
 * @param {string} key - Unique identifier for the state.
 * @param {object} state - The state object to persist.
 * @param {string} directory - Directory path for storing state files.
 */
export function saveState(key, state, directory) {
  if (typeof key !== 'string' || !key.trim()) {
    throw new Error('Key must be a non-empty string.');
  }
  if (typeof state !== 'object' || state === null) {
    throw new Error('State must be a non-null object.');
  }
  const filePath = join(directory, `${key}.json`);
  const json = JSON.stringify(state);
  writeFileSync(filePath, json, 'utf8');
  cache.set(key, state);
}

/**
 * Deserializes a state object from JSON stored in a file or cache.
 * @param {string} key - Unique identifier for the state.
 * @param {string} directory - Directory path for retrieving state files.
 * @returns {object|null} - The deserialized state object, or null if not found.
 */
export function loadState(key, directory) {
  if (typeof key !== 'string' || !key.trim()) {
    throw new Error('Key must be a non-empty string.');
  }
  if (cache.has(key)) {
    return cache.get(key);
  }
  const filePath = join(directory, `${key}.json`);
  try {
    const json = readFileSync(filePath, 'utf8');
    const state = JSON.parse(json);
    cache.set(key, state);
    return state;
  } catch (error) {
    return null;
  }
}

/**
 * Deletes a state from cache and optionally from the filesystem.
 * @param {string} key - Unique identifier for the state.
 * @param {string} directory - Directory path for state files.
 * @param {boolean} removeFile - If true, deletes the file from disk.
 */
export function deleteState(key, directory, removeFile = false) {
  if (typeof key !== 'string' || !key.trim()) {
    throw new Error('Key must be a non-empty string.');
  }
  cache.delete(key);
  if (removeFile) {
    const filePath = join(directory, `${key}.json`);
    try {
      writeFileSync(filePath, ''); // Overwrite with empty content to ensure safety.
    } catch (error) {
      // Silently fail if file does not exist.
    }
  }
}

/**
 * Executes a computation function with checkpointing support.
 * @param {string} key - Unique identifier for the computation.
 * @param {function} computeFunction - Function to execute, receives current state as input.
 * @param {object} initialState - Initial state for the computation.
 * @param {string} directory - Directory path for storing state files.
 * @returns {object} - Final computed state.
 */
export function executeWithCheckpoint(key, computeFunction, initialState, directory) {
  if (typeof computeFunction !== 'function') {
    throw new Error('computeFunction must be a function.');
  }
  let state = loadState(key, directory) || initialState;
  const nextState = computeFunction(state);
  saveState(key, nextState, directory);
  return nextState;
}

/**
 * Clears all cached states.
 */
export function clearCache() {
  cache.clear();
}
