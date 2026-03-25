/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: subprocessStatePersistence
 * Written: 2026-03-25T01:20:20.987Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// subprocessStatePersistence.mjs

import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

const algorithm = 'aes-256-cbc';
const key = randomBytes(32); // Symmetric key for encryption/decryption
const iv = randomBytes(16); // Initialization vector

/**
 * Serialize and encrypt the state object.
 * @param {Object} state - The state object to serialize and encrypt.
 * @returns {string} - Encrypted state as a base64 string.
 */
export function serializeState(state) {
  const jsonString = JSON.stringify(state);
  const cipher = createCipheriv(algorithm, key, iv);
  let encrypted = cipher.update(jsonString, 'utf8', 'base64');
  encrypted += cipher.final('base64');
  return encrypted;
}

/**
 * Decrypt and deserialize the state object.
 * @param {string} encryptedState - Encrypted state as a base64 string.
 * @returns {Object} - Decrypted state object.
 */
export function deserializeState(encryptedState) {
  const decipher = createDecipheriv(algorithm, key, iv);
  let decrypted = decipher.update(encryptedState, 'base64', 'utf8');
  decrypted += decipher.final('utf8');
  return JSON.parse(decrypted);
}

/**
 * Persist the state in memory.
 * @param {Object} state - The state object to persist.
 * @returns {string} - Encrypted state string for storage.
 */
export function persistState(state) {
  return serializeState(state);
}

/**
 * Restore the state from memory.
 * @param {string} encryptedState - Encrypted state string to restore.
 * @returns {Object} - Restored state object.
 */
export function restoreState(encryptedState) {
  return deserializeState(encryptedState);
}

/**
 * Utility function to validate state object structure.
 * @param {Object} state - The state object to validate.
 * @returns {boolean} - True if the state is valid, false otherwise.
 */
export function validateState(state) {
  return state && typeof state === 'object' && !Array.isArray(state);
}

/**
 * Utility function to merge two state objects.
 * @param {Object} baseState - The base state object.
 * @param {Object} newState - The new state object to merge.
 * @returns {Object} - Merged state object.
 */
export function mergeStates(baseState, newState) {
  return { ...baseState, ...newState };
}