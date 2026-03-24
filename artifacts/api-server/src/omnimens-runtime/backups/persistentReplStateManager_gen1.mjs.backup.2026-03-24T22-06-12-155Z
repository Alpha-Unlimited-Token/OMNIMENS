/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: persistentReplStateManager
 * Written: 2026-03-24T10:21:20.869Z
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

import { parse, stringify } from 'querystring';
import { createHash } from 'crypto';

/**
 * Serialize a REPL state object into a JSON string.
 * @param {object} state - The REPL state object to serialize.
 * @returns {string} - Serialized JSON string.
 */
export function serializeState(state) {
  if (typeof state !== 'object' || state === null) {
    throw new Error('State must be a non-null object');
  }
  try {
    return JSON.stringify(state);
  } catch (error) {
    throw new Error(`Failed to serialize state: ${error.message}`);
  }
}

/**
 * Deserialize a JSON string into a REPL state object.
 * @param {string} jsonString - The JSON string to deserialize.
 * @returns {object} - Deserialized REPL state object.
 */
export function deserializeState(jsonString) {
  if (typeof jsonString !== 'string') {
    throw new Error('Input must be a string');
  }
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    throw new Error(`Failed to deserialize state: ${error.message}`);
  }
}

/**
 * Generate a unique hash for a given state object.
 * @param {object} state - The state object to hash.
 * @returns {string} - A SHA-256 hash of the state.
 */
export function generateStateHash(state) {
  const serialized = serializeState(state);
  return createHash('sha256').update(serialized).digest('hex');
}

/**
 * Merge two REPL state objects, prioritizing keys from the second object.
 * @param {object} baseState - The base state object.
 * @param {object} newState - The new state object to merge.
 * @returns {object} - Merged state object.
 */
export function mergeStates(baseState, newState) {
  if (typeof baseState !== 'object' || baseState === null || typeof newState !== 'object' || newState === null) {
    throw new Error('Both states must be non-null objects');
  }
  return { ...baseState, ...newState };
}

/**
 * Validate the integrity of a state object by comparing its hash.
 * @param {object} state - The state object to validate.
 * @param {string} expectedHash - The expected SHA-256 hash of the state.
 * @returns {boolean} - True if the hash matches, false otherwise.
 */
export function validateStateIntegrity(state, expectedHash) {
  const actualHash = generateStateHash(state);
  return actualHash === expectedHash;
}

/**
 * Extract function definitions from a REPL state object.
 * @param {object} state - The state object containing functions.
 * @returns {object} - An object containing only the functions from the state.
 */
export function extractFunctions(state) {
  if (typeof state !== 'object' || state === null) {
    throw new Error('State must be a non-null object');
  }
  const functions = {};
  for (const [key, value] of Object.entries(state)) {
    if (typeof value === 'function') {
      functions[key] = value;
    }
  }
  return functions;
}

/**
 * Extract non-function variables from a REPL state object.
 * @param {object} state - The state object containing variables.
 * @returns {object} - An object containing only the non-function variables from the state.
 */
export function extractVariables(state) {
  if (typeof state !== 'object' || state === null) {
    throw new Error('State must be a non-null object');
  }
  const variables = {};
  for (const [key, value] of Object.entries(state)) {
    if (typeof value !== 'function') {
      variables[key] = value;
    }
  }
  return variables;
}

/**
 * Restore a REPL-like state from serialized data.
 * @param {string} serializedState - The serialized state data.
 * @returns {object} - Restored state object.
 */
export function restoreState(serializedState) {
  return deserializeState(serializedState);
}

/**
 * Save a REPL-like state to serialized data.
 * @param {object} state - The state object to serialize.
 * @returns {string} - Serialized state data.
 */
export function saveState(state) {
  return serializeState(state);
}

/**
 * Deep clone a REPL state object.
 * @param {object} state - The state object to clone.
 * @returns {object} - A deep clone of the state object.
 */
export function cloneState(state) {
  return deserializeState(serializeState(state));
}