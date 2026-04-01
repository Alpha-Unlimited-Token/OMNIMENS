/**
 * OMNIMENS Self-Authored Module (Migrated from DB)
 * Original Source: evolution_cycle_10
 * Name: virtualPersistentRepl
 * Purpose: Enables iterative computations by storing and restoring REPL state between subprocess executions.
 * Description: Enables iterative computations by storing and restoring REPL state between subprocess executions with a structured in-memory approach.
 * Migrated: 2026-04-01T22:23:20.230Z
 */

// Complete ES module code here

import { createHash } from 'crypto';

// In-memory storage for REPL states
const replStateStore = new Map();

/**
 * Generates a unique hash key for a given session ID.
 * @param {string} sessionId - The session identifier.
 * @returns {string} - A unique hash key.
 */
export function generateSessionKey(sessionId) {
  const hash = createHash('sha256');
  hash.update(sessionId);
  return hash.digest('hex');
}

/**
 * Saves the current REPL state for a given session.
 * @param {string} sessionId - The session identifier.
 * @param {object} state - The state object to save (e.g., variable bindings, intermediate results).
 * @returns {void}
 */
export function saveReplState(sessionId, state) {
  const sessionKey = generateSessionKey(sessionId);
  replStateStore.set(sessionKey, JSON.stringify(state));
}

/**
 * Restores the REPL state for a given session.
 * @param {string} sessionId - The session identifier.
 * @returns {object|null} - The restored state object, or null if no state exists.
 */
export function restoreReplState(sessionId) {
  const sessionKey = generateSessionKey(sessionId);
  const serializedState = replStateStore.get(sessionKey);
  return serializedState ? JSON.parse(serializedState) : null;
}

/**
 * Clears the REPL state for a given session.
 * @param {string} sessionId - The session identifier.
 * @returns {void}
 */
export function clearReplState(sessionId) {
  const sessionKey = generateSessionKey(sessionId);
  replStateStore.delete(sessionKey);
}

/**
 * Executes a computation within a persistent REPL context.
 * @param {string} sessionId - The session identifier.
 * @param {function} computationFunction - A pure function to execute, which takes the current state as input.
 * @returns {object} - The updated state after computation.
 */
export function executeInReplContext(sessionId, computationFunction) {
  if (typeof computationFunction !== 'function') {
    throw new TypeError('computationFunction must be a function');
  }

  const currentState = restoreReplState(sessionId) || {};
  const updatedState = computationFunction(currentState);

  if (typeof updatedState !== 'object' || updatedState === null) {
    throw new TypeError('computationFunction must return a non-null object');
  }

  saveReplState(sessionId, updatedState);
  return updatedState;
}

/**
 * Lists all active session IDs currently stored in the REPL state.
 * @returns {string[]} - An array of session IDs.
 */
export function listActiveSessions() {
  return Array.from(replStateStore.keys());
}

/**
 * Checks if a session has a stored state.
 * @param {string} sessionId - The session identifier.
 * @returns {boolean} - True if the session has a stored state, false otherwise.
 */
export function hasReplState(sessionId) {
  const sessionKey = generateSessionKey(sessionId);
  return replStateStore.has(sessionKey);
}
