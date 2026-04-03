/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: statefulSubprocessExecutor
 * Written: 2026-04-03T02:41:31.937Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// Complete ES module code here

import { createHash } from 'crypto';
import { URL } from 'url';

/**
 * Serialize intermediate computation state to a PostgreSQL-compatible format.
 * @param {Object} state - The computation state to serialize.
 * @returns {string} - A JSON string with a hash for integrity.
 */
export function serializeState(state) {
  if (typeof state !== 'object' || state === null) {
    throw new Error('State must be a non-null object');
  }
  const jsonString = JSON.stringify(state);
  const hash = createHash('sha256').update(jsonString).digest('hex');
  return JSON.stringify({ data: jsonString, hash });
}

/**
 * Deserialize and validate a computation state from a PostgreSQL-compatible format.
 * @param {string} serializedState - The serialized state string.
 * @returns {Object} - The original computation state object.
 */
export function deserializeState(serializedState) {
  if (typeof serializedState !== 'string') {
    throw new Error('Serialized state must be a string');
  }
  const { data, hash } = JSON.parse(serializedState);
  const calculatedHash = createHash('sha256').update(data).digest('hex');
  if (calculatedHash !== hash) {
    throw new Error('State integrity check failed');
  }
  return JSON.parse(data);
}

/**
 * Simulate iterative computation with state persistence.
 * @param {Function} computationStep - A function that performs one step of computation.
 * @param {Object} initialState - The initial state of the computation.
 * @param {number} maxSteps - Maximum number of steps to execute.
 * @returns {Object} - The final computation state.
 */
export async function statefulExecutor(computationStep, initialState, maxSteps) {
  if (typeof computationStep !== 'function') {
    throw new Error('Computation step must be a function');
  }
  if (typeof maxSteps !== 'number' || maxSteps <= 0) {
    throw new Error('Max steps must be a positive number');
  }

  let currentState = initialState;
  for (let step = 0; step < maxSteps; step++) {
    try {
      currentState = await computationStep(currentState);
    } catch (error) {
      console.error(`Error during computation step ${step}:`, error);
      break;
    }
  }
  return currentState;
}

/**
 * Generate a unique identifier for a computation process.
 * @param {string} namespace - A namespace string to scope the identifier.
 * @returns {string} - A unique identifier string.
 */
export function generateProcessId(namespace) {
  if (typeof namespace !== 'string' || namespace.trim() === '') {
    throw new Error('Namespace must be a non-empty string');
  }
  const timestamp = Date.now().toString();
  const hash = createHash('sha256').update(namespace + timestamp).digest('hex');
  return `${namespace}-${hash.slice(0, 12)}`;
}

/**
 * Validate a PostgreSQL connection string.
 * @param {string} connectionString - The connection string to validate.
 * @returns {boolean} - True if valid, otherwise false.
 */
export function validatePostgresConnectionString(connectionString) {
  try {
    new URL(connectionString); // Validate URL format
    return connectionString.startsWith('postgres://');
  } catch {
    return false;
  }
}