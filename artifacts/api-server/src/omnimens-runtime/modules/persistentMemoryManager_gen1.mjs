/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: persistentMemoryManager
 * Written: 2026-03-24T02:07:18.220Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// persistentMemoryManager.js

/**
 * @module persistentMemoryManager
 * @description Simulates persistent memory across restarts using encrypted local storage or IndexedDB-like in-memory emulation.
 */

import crypto from 'crypto';

/**
 * Encrypts data using AES-256-GCM.
 * @param {string} plaintext - The data to encrypt.
 * @param {string} key - A 32-byte encryption key.
 * @returns {{ciphertext, iv, authTag}} - Encrypted data with IV and authentication tag.
 */
export function encryptData(plaintext, key) {
  const iv = crypto.randomBytes(12); // 12-byte IV for AES-GCM
  const cipher = crypto.createCipheriv('aes-256-gcm', Buffer.from(key, 'hex'), iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();

  return {
    ciphertext: encrypted.toString('hex'),
    iv: iv.toString('hex'),
    authTag: authTag.toString('hex')
  };
}

/**
 * Decrypts data using AES-256-GCM.
 * @param {string} ciphertext - The encrypted data.
 * @param {string} key - A 32-byte encryption key.
 * @param {string} iv - The initialization vector used during encryption.
 * @param {string} authTag - The authentication tag.
 * @returns {string} - Decrypted plaintext.
 */
export function decryptData(ciphertext, key, iv, authTag) {
  const decipher = crypto.createDecipheriv('aes-256-gcm', Buffer.from(key, 'hex'), Buffer.from(iv, 'hex'));
  decipher.setAuthTag(Buffer.from(authTag, 'hex'));

  const decrypted = Buffer.concat([decipher.update(Buffer.from(ciphertext, 'hex')), decipher.final()]);
  return decrypted.toString('utf8');
}

/**
 * Serializes and encrypts dynamic state for storage.
 * @param {object} state - The dynamic state object to store.
 * @param {string} key - A 32-byte encryption key.
 * @returns {string} - Encrypted serialized state.
 */
export function saveState(state, key) {
  const serializedState = JSON.stringify(state);
  const encryptedState = encryptData(serializedState, key);
  return JSON.stringify(encryptedState);
}

/**
 * Decrypts and deserializes stored state.
 * @param {string} encryptedState - The encrypted serialized state.
 * @param {string} key - A 32-byte encryption key.
 * @returns {object} - The original dynamic state object.
 */
export function loadState(encryptedState, key) {
  const { ciphertext, iv, authTag } = JSON.parse(encryptedState);
  const decryptedState = decryptData(ciphertext, key, iv, authTag);
  return JSON.parse(decryptedState);
}

/**
 * Generates a secure 32-byte encryption key.
 * @returns {string} - A hex-encoded 32-byte encryption key.
 */
export function generateEncryptionKey() {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Creates an indexed metadata structure for fast access.
 * @param {object[]} states - Array of state objects.
 * @param {string[]} keys - Array of keys to index by.
 * @returns {object} - Metadata index mapping keys to state objects.
 */
export function createMetadataIndex(states, keys) {
  const index = {};
  for (const state of states) {
    for (const key of keys) {
      if (state[key] !== undefined) {
        index[state[key]] = state;
      }
    }
  }
  return index;
}

/**
 * Example usage:
 * const key = generateEncryptionKey();
 * const state = { userPreferences: { theme: 'dark', language: 'en' }, lastLogin: '2023-10-01' };
 * const encryptedState = saveState(state, key);
 * const loadedState = loadState(encryptedState, key);
 */