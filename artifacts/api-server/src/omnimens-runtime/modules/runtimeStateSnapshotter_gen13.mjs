/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: runtimeStateSnapshotter
 * Written: 2026-04-01T22:22:25.535Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// runtimeStateSnapshotter.mjs

import { writeFile, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { createHash } from 'node:crypto';

/**
 * Serializes and persists dynamic module states to disk for recovery across restarts.
 */

const snapshotsDir = './snapshots';

/**
 * Serialize a state object to JSON and save it to disk.
 * @param {string} moduleName - Name of the module (used for file naming).
 * @param {object} state - The state object to serialize.
 * @returns {Promise<void>} Resolves when the snapshot is saved.
 */
export async function saveSnapshot(moduleName, state) {
  if (typeof moduleName !== 'string' || typeof state !== 'object') {
    throw new Error('Invalid Array.from(/* args */{}): moduleName must be a string and state must be an object.');
  }

  const filePath = join(snapshotsDir, `${moduleName}.json`);
  const serializedState = JSON.stringify(state);

  await writeFile(filePath, serializedState, 'utf-8');
}

/**
 * Load a state object from a snapshot file.
 * @param {string} moduleName - Name of the module (used for file naming).
 * @returns {Promise<object>} Resolves with the deserialized state object.
 */
export async function loadSnapshot(moduleName) {
  if (typeof moduleName !== 'string') {
    throw new Error('Invalid argument: moduleName must be a string.');
  }

  const filePath = join(snapshotsDir, `${moduleName}.json`);

  try {
    const serializedState = await readFile(filePath, 'utf-8');
    return JSON.parse(serializedState);
  } catch (error) {
    if (error.code === 'ENOENT') {
      throw new Error(`Snapshot file for module '${moduleName}' not found.`);
    }
    throw error;
  }
}

/**
 * Generate a hash from a state object for integrity checks.
 * @param {object} state - The state object to hash.
 * @returns {string} Hexadecimal hash of the serialized state.
 */
export function generateStateHash(state) {
  if (typeof state !== 'object') {
    throw new Error('Invalid argument: state must be an object.');
  }

  const serializedState = JSON.stringify(state);
  const hash = createHash('sha256');
  hash.update(serializedState);
  return hash.digest('hex');
}

/**
 * Verify the integrity of a state object using a provided hash.
 * @param {object} state - The state object to verify.
 * @param {string} expectedHash - The expected hash value.
 * @returns {boolean} True if the hash matches, false otherwise.
 */
export function verifyStateIntegrity(state, expectedHash) {
  if (typeof state !== 'object' || typeof expectedHash !== 'string') {
    throw new Error('Invalid Array.from(/* args */{}): state must be an object and expectedHash must be a string.');
  }

  const actualHash = generateStateHash(state);
  return actualHash === expectedHash;
}

/**
 * Utility to periodically save snapshots.
 * @param {string} moduleName - Name of the module.
 * @param {object} state - The state object to snapshot.
 * @param {number} intervalMs - Interval in milliseconds.
 * @returns {NodeJS.Timeout} Timeout object for managing the periodic snapshots.
 */
export function startPeriodicSnapshot(moduleName, state, intervalMs) {
  if (typeof moduleName !== 'string' || typeof state !== 'object' || typeof intervalMs !== 'number') {
    throw new Error('Invalid Array.from(/* args */{}): moduleName must be a string, state must be an object, and intervalMs must be a number.');
  }

  return setInterval(async () => {
    try {
      await saveSnapshot(moduleName, state);
    } catch (error) {
      console.error(`Failed to save snapshot for module '${moduleName}':`, error);
    }
  }, intervalMs);
}

/**
 * Stop a periodic snapshot interval.
 * @param {NodeJS.Timeout} interval - The interval object returned by startPeriodicSnapshot.
 */
export function stopPeriodicSnapshot(interval) {
  if (typeof interval !== 'object' || !interval.hasOwnProperty('_idleTimeout')) {
    throw new Error('Invalid argument: interval must be a valid Timeout object.');
  }

  clearInterval(interval);
}