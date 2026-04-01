/**
 * OMNIMENS Self-Authored Module (Migrated from DB)
 * Original Source: evolution_cycle_12
 * Name: statefulExecutionManager
 * Purpose: Persist intermediate states across subprocess executions to simulate a continuous REPL environment.
 * Description: Manages persistent execution states across subprocesses to simulate a continuous REPL environment.
 * Migrated: 2026-04-01T22:23:20.246Z
 */

// statefulExecutionManager.mjs
import { createHash } from 'crypto';

// In-memory store for serialized states
const stateStore = new Map();

/**
 * Generates a unique hash key for a given session ID.
 * @param {string} sessionId - Unique identifier for the session.
 * @returns {string} - A hash key for the session.
 */
export function generateSessionKey(sessionId) {
  const hash = createHash('sha256');
  hash.update(sessionId);
  return hash.digest('hex');
}

/**
 * Saves the current execution state for a session.
 * @param {string} sessionKey - Unique key for the session.
 * @param {object} state - The state object to persist.
 */
export function saveState(sessionKey, state) {
  if (typeof sessionKey !== 'string' || typeof state !== 'object') {
    throw new Error('Invalid arguments: sessionKey must be a string and state must be an object.');
  }
  stateStore.set(sessionKey, JSON.stringify(state));
}

/**
 * Restores the execution state for a session.
 * @param {string} sessionKey - Unique key for the session.
 * @returns {object|null} - The restored state object, or null if no state exists.
 */
export function restoreState(sessionKey) {
  if (typeof sessionKey !== 'string') {
    throw new Error('Invalid argument: sessionKey must be a string.');
  }
  const serializedState = stateStore.get(sessionKey);
  return serializedState ? JSON.parse(serializedState) : null;
}

/**
 * Clears the execution state for a session.
 * @param {string} sessionKey - Unique key for the session.
 */
export function clearState(sessionKey) {
  if (typeof sessionKey !== 'string') {
    throw new Error('Invalid argument: sessionKey must be a string.');
  }
  stateStore.delete(sessionKey);
}

/**
 * Executes a function with a persistent state across calls.
 * @param {string} sessionKey - Unique key for the session.
 * @param {function} fn - The function to execute, which receives the current state as its first argument.
 * @returns {any} - The result of the function execution.
 */
export function executeWithState(sessionKey, fn) {
  if (typeof sessionKey !== 'string' || typeof fn !== 'function') {
    throw new Error('Invalid arguments: sessionKey must be a string and fn must be a function.');
  }

  const currentState = restoreState(sessionKey) || {};
  const result = fn(currentState);
  saveState(sessionKey, currentState);
  return result;
}

/**
 * Lists all active session keys in the state store.
 * @returns {string[]} - Array of active session keys.
 */
export function listActiveSessions() {
  return Array.from(stateStore.keys());
}