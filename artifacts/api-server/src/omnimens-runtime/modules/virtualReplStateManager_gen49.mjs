/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: virtualReplStateManager
 * Written: 2026-04-02T13:33:34.679Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// File: virtualReplStateManager.mjs

import { writeFileSync, readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { createHash } from 'crypto';

const STATE_DIRECTORY = '.virtualReplState';

/**
 * Utility function to generate a unique hash for a given input.
 * Useful for creating unique filenames for serialized state.
 * @param {string} input - The input string to hash.
 * @returns {string} - A SHA-256 hash of the input.
 */
export function generateHash(input) {
  return createHash('sha256').update(input).digest('hex');
}

/**
 * Saves a given state object to disk for persistence.
 * @param {string} sessionId - A unique identifier for the session.
 * @param {object} state - The state object to serialize and save.
 */
export function saveState(sessionId, state) {
  const filePath = join(STATE_DIRECTORY, `${generateHash(sessionId)}.json`);
  const serializedState = JSON.stringify(state);

  try {
    writeFileSync(filePath, serializedState, { flag: 'w' });
  } catch (error) {
    throw new Error(`Failed to save state: ${error.message}`);
  }
}

/**
 * Restores a previously saved state object from disk.
 * @param {string} sessionId - A unique identifier for the session.
 * @returns {object|null} - The restored state object, or null if not found.
 */
export function restoreState(sessionId) {
  const filePath = join(STATE_DIRECTORY, `${generateHash(sessionId)}.json`);

  if (!existsSync(filePath)) {
    return null;
  }

  try {
    const serializedState = readFileSync(filePath, 'utf-8');
    return JSON.parse(serializedState);
  } catch (error) {
    throw new Error(`Failed to restore state: ${error.message}`);
  }
}

/**
 * Clears a saved state object from disk.
 * @param {string} sessionId - A unique identifier for the session.
 */
export function clearState(sessionId) {
  const filePath = join(STATE_DIRECTORY, `${generateHash(sessionId)}.json`);

  if (existsSync(filePath)) {
    try {
      writeFileSync(filePath, '', { flag: 'w' });
    } catch (error) {
      throw new Error(`Failed to clear state: ${error.message}`);
    }
  }
}

/**
 * Example utility function to demonstrate cross-agent usage.
 * Merges two state objects deeply, with the second object overriding the first.
 * @param {object} stateA - The base state object.
 * @param {object} stateB - The overriding state object.
 * @returns {object} - The merged state object.
 */
export function mergeStates(stateA, stateB) {
  if (typeof stateA !== 'object' || typeof stateB !== 'object') {
    throw new TypeError('Both states must be objects.');
  }

  return { ...stateA, ...stateB };
}

/**
 * Initializes the state manager by ensuring the state directory exists.
 * Should be called once at the start of the application.
 */
export function initializeStateManager() {
  try {
    if (!existsSync(STATE_DIRECTORY)) {
      writeFileSync(STATE_DIRECTORY, '', { flag: 'wx' });
    }
  } catch (error) {
    throw new Error(`Failed to initialize state manager: ${error.message}`);
  }
}