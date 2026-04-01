/**
 * OMNIMENS Self-Authored Module (Migrated from DB)
 * Original Source: evolution_cycle_18
 * Name: persistentReplState
 * Purpose: Maintains a persistent REPL state for iterative code execution across subprocesses.
 * Description: Maintains a persistent REPL state by snapshotting and restoring execution contexts using JSON serialization.
 * Migrated: 2026-04-01T22:23:20.233Z
 */

// persistentReplState.mjs

import { createHash } from 'crypto';

/**
 * Serializes and deserializes execution contexts to maintain persistent REPL state.
 * This module provides utilities for snapshotting and restoring state using JSON.
 */

const stateStore = new Map();

/**
 * Generates a unique hash identifier for a given context object.
 * @param {object} context - The execution context to hash.
 * @returns {string} - A unique hash string.
 */
export function generateContextHash(context) {
  const jsonString = JSON.stringify(context);
  const hash = createHash('sha256');
  hash.update(jsonString);
  return hash.digest('hex');
}

/**
 * Saves the current execution context to the state store.
 * @param {string} key - A unique identifier for the context.
 * @param {object} context - The execution context to save.
 * @returns {boolean} - True if the context was saved successfully.
 */
export function saveContext(key, context) {
  if (typeof key !== 'string' || !key.trim()) {
    throw new Error('Key must be a non-empty string.');
  }
  if (typeof context !== 'object' || context === null) {
    throw new Error('Context must be a non-null object.');
  }
  const serializedContext = JSON.stringify(context);
  stateStore.set(key, serializedContext);
  return true;
}

/**
 * Restores an execution context from the state store.
 * @param {string} key - The unique identifier for the context.
 * @returns {object|null} - The restored execution context, or null if not found.
 */
export function restoreContext(key) {
  if (typeof key !== 'string' || !key.trim()) {
    throw new Error('Key must be a non-empty string.');
  }
  const serializedContext = stateStore.get(key);
  return serializedContext ? JSON.parse(serializedContext) : null;
}

/**
 * Deletes a saved context from the state store.
 * @param {string} key - The unique identifier for the context.
 * @returns {boolean} - True if the context was deleted successfully, false if not found.
 */
export function deleteContext(key) {
  if (typeof key !== 'string' || !key.trim()) {
    throw new Error('Key must be a non-empty string.');
  }
  return stateStore.delete(key);
}

/**
 * Lists all stored context keys.
 * @returns {string[]} - An array of all keys in the state store.
 */
export function listContextKeys() {
  return Array.from(stateStore.keys());
}

/**
 * Clears all stored contexts from the state store.
 * @returns {boolean} - True if the state store was cleared successfully.
 */
export function clearAllContexts() {
  stateStore.clear();
  return true;
}
