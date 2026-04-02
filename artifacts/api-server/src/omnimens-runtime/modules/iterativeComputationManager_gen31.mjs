/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: iterativeComputationManager
 * Written: 2026-04-02T14:25:55.128Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// iterativeComputationManager.mjs

import { createHash } from 'crypto';

/**
 * Utility to manage iterative computations with checkpointing and dependency graphs.
 * Allows complex workflows to resume after interruptions.
 */

const stateStore = new Map();

/**
 * Generates a unique hash for a computation state.
 * @param {Object} state - The computation state object.
 * @returns {string} - A unique hash representing the state.
 */
export function generateStateHash(state) {
  const stateString = JSON.stringify(state);
  return createHash('sha256').update(stateString).digest('hex');
}

/**
 * Saves a computation state snapshot.
 * @param {string} id - Unique identifier for the computation.
 * @param {Object} state - The computation state object.
 */
export function saveState(id, state) {
  const stateHash = generateStateHash(state);
  stateStore.set(id, { state, stateHash });
}

/**
 * Retrieves a saved computation state.
 * @param {string} id - Unique identifier for the computation.
 * @returns {Object|null} - The saved state object or null if not found.
 */
export function loadState(id) {
  return stateStore.has(id) ? stateStore.get(id).state : null;
}

/**
 * Checks if a computation state has changed.
 * @param {string} id - Unique identifier for the computation.
 * @param {Object} newState - The new computation state object.
 * @returns {boolean} - True if the state has changed, false otherwise.
 */
export function hasStateChanged(id, newState) {
  const savedState = stateStore.get(id);
  if (!savedState) return true;
  const newStateHash = generateStateHash(newState);
  return savedState.stateHash !== newStateHash;
}

/**
 * Executes a computation step based on dependencies.
 * @param {Object} dependencies - Dependency graph for the computation.
 * @param {Function} computeStep - Function to execute a single computation step.
 * @returns {Object} - The result of the computation step.
 */
export function executeStep(dependencies, computeStep) {
  const resolvedDependencies = {};

  for (const [key, dependency] of Object.entries(dependencies)) {
    if (typeof dependency === 'function') {
      resolvedDependencies[key] = dependency();
    } else {
      resolvedDependencies[key] = dependency;
    }
  }

  return computeStep(resolvedDependencies);
}

/**
 * Manages iterative workflows by checkpointing and resuming computations.
 * @param {string} id - Unique identifier for the workflow.
 * @param {Object} dependencies - Dependency graph for the computation.
 * @param {Function} computeStep - Function to execute a single computation step.
 * @returns {Object} - The result of the computation step.
 */
export function manageWorkflow(id, dependencies, computeStep) {
  const previousState = loadState(id);
  const currentState = { dependencies, computeStep: computeStep.toString() };

  if (!previousState || hasStateChanged(id, currentState)) {
    const result = executeStep(dependencies, computeStep);
    saveState(id, currentState);
    return result;
  }

  return previousState.result;
}

/**
 * Clears all stored states (use cautiously).
 */
export function clearAllStates() {
  stateStore.clear();
}
