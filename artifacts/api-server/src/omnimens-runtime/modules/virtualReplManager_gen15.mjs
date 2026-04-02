/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: virtualReplManager
 * Written: 2026-04-02T15:05:14.310Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// virtualReplManager.mjs

import { writeFileSync, readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

const CHECKPOINT_FILE = resolve('./repl_checkpoint.json');

/**
 * Saves the current execution context (e.g., variable states) to a checkpoint file.
 * @param {Object} context - The current execution context to serialize.
 */
export function saveContext(context) {
  if (typeof context !== 'object' || context === null) {
    throw new Error('Context must be a non-null object.');
  }
  const serializedContext = JSON.stringify(context, null, 2);
  writeFileSync(CHECKPOINT_FILE, serializedContext, 'utf-8');
}

/**
 * Restores the execution context from the checkpoint file.
 * @returns {Object} - The restored execution context.
 */
export function restoreContext() {
  if (!existsSync(CHECKPOINT_FILE)) {
    return {}; // Return an empty context if no checkpoint exists.
  }
  const serializedContext = readFileSync(CHECKPOINT_FILE, 'utf-8');
  try {
    return JSON.parse(serializedContext);
  } catch (error) {
    throw new Error('Failed to parse checkpoint file. It may be corrupted.');
  }
}

/**
 * Merges a new context into the existing context, ensuring no data is lost.
 * @param {Object} baseContext - The base context to merge into.
 * @param {Object} newContext - The new context to merge from.
 * @returns {Object} - The merged context.
 */
export function mergeContexts(baseContext, newContext) {
  if (typeof baseContext !== 'object' || baseContext === null ||
      typeof newContext !== 'object' || newContext === null) {
    throw new Error('Both baseContext and newContext must be non-null objects.');
  }
  return { ...baseContext, ...newContext };
}

/**
 * Clears the saved checkpoint file, resetting the REPL state.
 */
export function clearContext() {
  if (existsSync(CHECKPOINT_FILE)) {
    writeFileSync(CHECKPOINT_FILE, '{}', 'utf-8');
  }
}

/**
 * Utility function for safely updating the REPL state.
 * @param {Function} updateFunction - A function that takes the current context and returns an updated context.
 */
export function updateContext(updateFunction) {
  if (typeof updateFunction !== 'function') {
    throw new Error('updateFunction must be a function.');
  }
  const currentContext = restoreContext();
  const updatedContext = updateFunction(currentContext);
  saveContext(updatedContext);
}

// Example usage for testing purposes (to be removed in production):
// const initialContext = { a: 1, b: 2 };
// saveContext(initialContext);
// const restored = restoreContext();
// console.log(restored);
// const merged = mergeContexts(restored, { c: 3 });
// console.log(merged);
// updateContext(ctx => ({ ...ctx, d: 4 }));
// console.log(restoreContext());