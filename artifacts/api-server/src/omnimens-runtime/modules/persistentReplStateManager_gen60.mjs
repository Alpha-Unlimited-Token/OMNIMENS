/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: persistentReplStateManager
 * Written: 2026-04-02T15:19:56.267Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// persistentReplStateManager.mjs

import { writeFileSync, readFileSync, existsSync } from 'fs';
import { join } from 'path';

const STATE_FILE = join(process.cwd(), 'replState.json');

/**
 * Saves the provided REPL state to a JSON file.
 * @param {Object} state - The state object to be persisted.
 */
export function saveReplState(state) {
  if (typeof state !== 'object' || state === null) {
    throw new TypeError('State must be a non-null object.');
  }
  try {
    const serializedState = JSON.stringify(state);
    writeFileSync(STATE_FILE, serializedState, 'utf8');
  } catch (error) {
    throw new Error(`Failed to save REPL state: ${error.message}`);
  }
}

/**
 * Restores the REPL state from the JSON file.
 * @returns {Object} - The restored state object.
 */
export function restoreReplState() {
  if (!existsSync(STATE_FILE)) {
    return {};
  }
  try {
    const serializedState = readFileSync(STATE_FILE, 'utf8');
    return JSON.parse(serializedState);
  } catch (error) {
    throw new Error(`Failed to restore REPL state: ${error.message}`);
  }
}

/**
 * Merges a new state object into the existing REPL state and saves it.
 * @param {Object} newState - The new state object to merge.
 */
export function mergeReplState(newState) {
  if (typeof newState !== 'object' || newState === null) {
    throw new TypeError('New state must be a non-null object.');
  }
  const currentState = restoreReplState();
  const mergedState = { ...currentState, ...newState };
  saveReplState(mergedState);
}

/**
 * Clears the persisted REPL state by resetting it to an empty object.
 */
export function clearReplState() {
  saveReplState({});
}

/**
 * Validates the structure of a REPL state object against a schema.
 * @param {Object} state - The state object to validate.
 * @param {Object} schema - An object defining required keys and their types.
 * @returns {boolean} - True if the state is valid; otherwise, false.
 */
export function validateReplState(state, schema) {
  if (typeof state !== 'object' || state === null || typeof schema !== 'object' || schema === null) {
    throw new TypeError('State and schema must be non-null objects.');
  }
  return Object.entries(schema).every(([key, type]) => {
    return typeof state[key] === type;
  });
}

/**
 * Example utility: Computes the difference between two REPL states.
 * @param {Object} stateA - The first state object.
 * @param {Object} stateB - The second state object.
 * @returns {Object} - An object containing the differences.
 */
export function diffReplStates(stateA, stateB) {
  if (typeof stateA !== 'object' || stateA === null || typeof stateB !== 'object' || stateB === null) {
    throw new TypeError('Both states must be non-null objects.');
  }
  const differences = {};
  const allKeys = new Set([...Object.keys(stateA), ...Object.keys(stateB)]);
  for (const key of allKeys) {
    if (stateA[key] !== stateB[key]) {
      differences[key] = { from: stateA[key], to: stateB[key] };
    }
  }
  return differences;
}
