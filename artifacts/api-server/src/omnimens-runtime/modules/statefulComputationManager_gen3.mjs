/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: statefulComputationManager
 * Written: 2026-04-02T14:10:00.549Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// statefulComputationManager.mjs

import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

const algorithm = 'aes-256-gcm';
const key = randomBytes(32); // Symmetric encryption key
const ivLength = 12; // Recommended length for AES-GCM IV

// In-memory buffer for serialized states
let stateBuffer = {};

// Periodic persistence to disk (simulated)
const diskStorage = {};

/**
 * Encrypts a given state object using AES-GCM.
 * @param {object} state - The state object to encrypt.
 * @returns {string} - The encrypted state as a base64 string.
 */
export function encryptState(state) {
  const iv = randomBytes(ivLength);
  const cipher = createCipheriv(algorithm, key, iv);

  const serializedState = JSON.stringify(state);
  const encrypted = Buffer.concat([cipher.update(serializedState, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();

  return JSON.stringify({
    iv: iv.toString('base64'),
    encrypted: encrypted.toString('base64'),
    authTag: authTag.toString('base64')
  });
}

/**
 * Decrypts an encrypted state back into its original object form.
 * @param {string} encryptedState - The encrypted state as a base64 string.
 * @returns {object} - The decrypted state object.
 */
export function decryptState(encryptedState) {
  const { iv, encrypted, authTag } = JSON.parse(encryptedState);
  const decipher = createDecipheriv(algorithm, key, Buffer.from(iv, 'base64'));
  decipher.setAuthTag(Buffer.from(authTag, 'base64'));

  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(encrypted, 'base64')),
    decipher.final()
  ]);

  return JSON.parse(decrypted.toString('utf8'));
}

/**
 * Saves the current state to the in-memory buffer.
 * @param {string} checkpointId - Unique identifier for the checkpoint.
 * @param {object} state - The state object to save.
 */
export function saveCheckpoint(checkpointId, state) {
  const encryptedState = encryptState(state);
  stateBuffer[checkpointId] = encryptedState;
}

/**
 * Restores a state from the in-memory buffer.
 * @param {string} checkpointId - Unique identifier for the checkpoint.
 * @returns {object|null} - The restored state object, or null if not found.
 */
export function restoreCheckpoint(checkpointId) {
  const encryptedState = stateBuffer[checkpointId];
  return encryptedState ? decryptState(encryptedState) : null;
}

/**
 * Periodically persists all in-memory states to simulated disk storage.
 */
export function persistToDisk() {
  for (const checkpointId in stateBuffer) {
    diskStorage[checkpointId] = stateBuffer[checkpointId];
  }
}

/**
 * Restores all states from simulated disk storage into memory.
 */
export function restoreFromDisk() {
  for (const checkpointId in diskStorage) {
    stateBuffer[checkpointId] = diskStorage[checkpointId];
  }
}

/**
 * Clears the in-memory buffer (useful for freeing memory).
 */
export function clearMemoryBuffer() {
  stateBuffer = {};
}

/**
 * Clears the simulated disk storage (use with caution).
 */
export function clearDiskStorage() {
  for (const checkpointId in diskStorage) {
    delete diskStorage[checkpointId];
  }
}

/**
 * Utility function to validate if a state object is serializable.
 * @param {object} state - The state object to validate.
 * @returns {boolean} - True if the state is serializable, false otherwise.
 */
export function isSerializable(state) {
  try {
    JSON.stringify(state);
    return true;
  } catch {
    return false;
  }
}