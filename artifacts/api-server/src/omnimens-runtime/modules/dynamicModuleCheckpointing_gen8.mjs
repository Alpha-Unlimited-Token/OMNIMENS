/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: dynamicModuleCheckpointing
 * Written: 2026-04-01T22:16:50.330Z
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

import { writeFile, readFile } from 'fs/promises';
import { createHash } from 'crypto';

/**
 * Serializes a dynamic module state into a binary format.
 * @param {Object} state - The state object to serialize.
 * @returns {Buffer} - The binary serialized state.
 */
export function serializeState(state) {
  if (typeof state !== 'object' || state === null) {
    throw new Error('State must be a non-null object');
  }
  return Buffer.from(JSON.stringify(state));
}

/**
 * Deserializes a binary buffer back into a module state.
 * @param {Buffer} buffer - The binary buffer to deserialize.
 * @returns {Object} - The restored state object.
 */
export function deserializeState(buffer) {
  if (!Buffer.isBuffer(buffer)) {
    throw new Error('Input must be a Buffer');
  }
  return JSON.parse(buffer.toString());
}

/**
 * Generates a unique hash for the serialized state for indexing purposes.
 * @param {Buffer} serializedState - The serialized state buffer.
 * @returns {string} - A unique hash string.
 */
export function generateStateHash(serializedState) {
  if (!Buffer.isBuffer(serializedState)) {
    throw new Error('Input must be a Buffer');
  }
  const hash = createHash('sha256');
  hash.update(serializedState);
  return hash.digest('hex');
}

/**
 * Saves the serialized state to a file.
 * @param {string} filePath - The file path to save the state.
 * @param {Buffer} serializedState - The serialized state buffer.
 * @returns {Promise<void>} - Resolves when the file is written.
 */
export async function saveStateToFile(filePath, serializedState) {
  if (typeof filePath !== 'string' || filePath.trim() === '') {
    throw new Error('File path must be a non-empty string');
  }
  if (!Buffer.isBuffer(serializedState)) {
    throw new Error('Serialized state must be a Buffer');
  }
  await writeFile(filePath, serializedState);
}

/**
 * Loads a serialized state from a file.
 * @param {string} filePath - The file path to load the state from.
 * @returns {Promise<Buffer>} - Resolves with the serialized state buffer.
 */
export async function loadStateFromFile(filePath) {
  if (typeof filePath !== 'string' || filePath.trim() === '') {
    throw new Error('File path must be a non-empty string');
  }
  return await readFile(filePath);
}

/**
 * Example utility to combine serialization, hashing, and saving.
 * @param {Object} state - The state object to process.
 * @param {string} filePath - The file path to save the state.
 * @returns {Promise<string>} - Resolves with the hash of the saved state.
 */
export async function processAndSaveState(state, filePath) {
  const serializedState = serializeState(state);
  const stateHash = generateStateHash(serializedState);
  await saveStateToFile(filePath, serializedState);
  return stateHash;
}

/**
 * Example utility to load, verify, and restore state from a file.
 * @param {string} filePath - The file path to load the state from.
 * @param {string} expectedHash - The expected hash of the state.
 * @returns {Promise<Object>} - Resolves with the restored state if hash matches.
 */
export async function loadAndVerifyState(filePath, expectedHash) {
  const serializedState = await loadStateFromFile(filePath);
  const actualHash = generateStateHash(serializedState);
  if (actualHash !== expectedHash) {
    throw new Error('State hash mismatch: data integrity compromised');
  }
  return deserializeState(serializedState);
}