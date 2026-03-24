/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: persistentReplStateManager
 * Written: 2026-03-24T22:06:12.152Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// persistentReplStateManager.mjs

import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';
import { resolve } from 'path';
import { readFileSync, writeFileSync, existsSync } from 'fs';

const algorithm = 'aes-256-gcm';
const key = randomBytes(32); // Replace with a securely stored key for production
const ivLength = 12; // AES-GCM requires a 12-byte IV

/**
 * Encrypts data using AES-256-GCM.
 * @param {Buffer|string} data - Data to encrypt.
 * @returns {Object} - Encrypted payload containing ciphertext, IV, and authentication tag.
 */
export function encryptData(data) {
  const iv = randomBytes(ivLength);
  const cipher = createCipheriv(algorithm, key, iv);

  const encrypted = Buffer.concat([cipher.update(data), cipher.final()]);
  const authTag = cipher.getAuthTag();

  return { ciphertext: encrypted.toString('hex'), iv: iv.toString('hex'), authTag: authTag.toString('hex') };
}

/**
 * Decrypts data using AES-256-GCM.
 * @param {Object} encryptedPayload - Encrypted payload containing ciphertext, IV, and authentication tag.
 * @returns {Buffer} - Decrypted data.
 */
export function decryptData(encryptedPayload) {
  const { ciphertext, iv, authTag } = encryptedPayload;
  const decipher = createDecipheriv(algorithm, key, Buffer.from(iv, 'hex'));
  decipher.setAuthTag(Buffer.from(authTag, 'hex'));

  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(ciphertext, 'hex')),
    decipher.final()
  ]);

  return decrypted;
}

/**
 * Saves the current state to an encrypted file.
 * @param {Object} state - State object to save.
 * @param {string} filePath - Path to the state file.
 */
export function saveState(state, filePath) {
  const encryptedState = encryptData(JSON.stringify(state));
  writeFileSync(filePath, JSON.stringify(encryptedState));
}

/**
 * Loads the state from an encrypted file.
 * @param {string} filePath - Path to the state file.
 * @returns {Object|null} - Decrypted state object or null if file does not exist.
 */
export function loadState(filePath) {
  if (!existsSync(filePath)) return null;

  const encryptedPayload = JSON.parse(readFileSync(filePath, 'utf-8'));
  const decryptedState = decryptData(encryptedPayload);

  return JSON.parse(decryptedState.toString());
}

/**
 * Updates the state by applying a delta (partial update).
 * @param {Object} currentState - Current state object.
 * @param {Object} delta - Partial update to apply.
 * @returns {Object} - Updated state object.
 */
export function updateState(currentState, delta) {
  return { ...currentState, ...delta };
}

/**
 * Utility function to initialize a default state if none exists.
 * @param {string} filePath - Path to the state file.
 * @param {Object} defaultState - Default state object.
 * @returns {Object} - Loaded or initialized state.
 */
export function initializeState(filePath, defaultState) {
  const existingState = loadState(filePath);
  return existingState || defaultState;
}

// Example usage:
// const stateFilePath = resolve('./state.json');
// const initialState = { counter: 0 };
// const state = initializeState(stateFilePath, initialState);
// const updatedState = updateState(state, { counter: state.counter + 1 });
// saveState(updatedState, stateFilePath);