/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: persistentSubprocessManager
 * Written: 2026-04-01T22:19:58.637Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// persistentSubprocessManager.mjs

import { createHash } from 'crypto';

/**
 * Generates a unique hash for a given state object.
 * Useful for checkpointing and ensuring state integrity.
 * @param {Object} state - The state object to hash.
 * @returns {string} - A unique hash representing the state.
 */
export function generateStateHash(state) {
  const serialized = JSON.stringify(state);
  return createHash('sha256').update(serialized).digest('hex');
}

/**
 * Creates a checkpointed state manager for persistent computations.
 * Tracks state and allows incremental updates.
 * @returns {Object} - An object with methods to manage state.
 */
export function createPersistentStateManager() {
  let currentState = {};
  let stateHistory = [];

  return {
    /**
     * Saves the current state as a checkpoint.
     * @param {Object} newState - The new state to checkpoint.
     */
    checkpoint(newState) {
      const stateHash = generateStateHash(newState);
      stateHistory.push({ hash: stateHash, state: newState });
      currentState = { ...newState };
    },

    /**
     * Restores the state to the last checkpoint.
     * @returns {Object} - The restored state.
     */
    restoreLastCheckpoint() {
      if (stateHistory.length === 0) {
        throw new Error('No checkpoints available to restore.');
      }
      const lastCheckpoint = stateHistory[stateHistory.length - 1];
      currentState = { ...lastCheckpoint.state };
      return currentState;
    },

    /**
     * Retrieves the current state.
     * @returns {Object} - The current state.
     */
    getCurrentState() {
      return { ...currentState };
    },

    /**
     * Retrieves the history of state checkpoints.
     * @returns {Array} - An array of checkpoint metadata.
     */
    getStateHistory() {
      return stateHistory.map(({ hash }) => ({ hash }));
    },

    /**
     * Compares a given state with the current state.
     * @param {Object} state - The state to compare.
     * @returns {boolean} - True if the states are identical, false otherwise.
     */
    isStateIdentical(state) {
      return generateStateHash(state) === generateStateHash(currentState);
    }
  };
}

/**
 * Combines incremental computations into a final result.
 * Useful for distributed or long-running tasks.
 * @param {Array} computations - An array of incremental computation results.
 * @param {Function} combineFunction - A reducer function to combine results.
 * @returns {*} - The final combined result.
 */
export function combineIncrementalComputations(computations, combineFunction) {
  if (!Array.isArray(computations)) {
    throw new TypeError('Computations must be an array.');
  }
  if (typeof combineFunction !== 'function') {
    throw new TypeError('Combine function must be a valid function.');
  }
  return computations.reduce(combineFunction);
}

/**
 * Tracks incremental computation progress.
 * @param {number} totalSteps - The total number of steps in the computation.
 * @returns {Object} - An object with methods to track progress.
 */
export function createProgressTracker(totalSteps) {
  if (typeof totalSteps !== 'number' || totalSteps <= 0) {
    throw new TypeError('Total steps must be a positive number.');
  }

  let completedSteps = 0;

  return {
    /**
     * Marks a step as completed.
     */
    completeStep() {
      if (completedSteps >= totalSteps) {
        throw new Error('All steps are already completed.');
      }
      completedSteps++;
    },

    /**
     * Retrieves the progress as a percentage.
     * @returns {number} - The progress percentage (0-100).
     */
    getProgressPercentage() {
      return (completedSteps / totalSteps) * 100;
    },

    /**
     * Checks if all steps are completed.
     * @returns {boolean} - True if all steps are completed, false otherwise.
     */
    isComplete() {
      return completedSteps === totalSteps;
    }
  };
}