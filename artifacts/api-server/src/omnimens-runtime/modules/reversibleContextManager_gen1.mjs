/**
 * OMNIMENS Self-Authored Module (Migrated from DB)
 * Original Source: evolution_cycle_12
 * Name: reversibleContextManager
 * Purpose: Preserves critical information in long token sequences using reversible transformations.
 * Description: Provides reversible transformations for preserving critical information in long token sequences using encryption and validation.
 * Migrated: 2026-04-02T15:11:36.911Z
 */

// reversibleContextManager.mjs

import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

const ALGORITHM = 'aes-256-cbc';
const KEY = randomBytes(32); // 256-bit key
const IV_LENGTH = 16; // AES block size

/**
 * Compresses and encrypts critical information for reversible transformation.
 * @param {string} data - The input string to be transformed.
 * @returns {string} - The encrypted and compressed string.
 */
export function reversibleCompress(data) {
  if (typeof data !== 'string') {
    throw new TypeError('Input data must be a string.');
  }

  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, KEY, iv);
  let encrypted = cipher.update(data, 'utf8', 'base64');
  encrypted += cipher.final('base64');

  return `${iv.toString('base64')}:${encrypted}`;
}

/**
 * Decompresses and decrypts information to restore the original data.
 * @param {string} compressedData - The encrypted and compressed string.
 * @returns {string} - The original string after decompression and decryption.
 */
export function reversibleDecompress(compressedData) {
  if (typeof compressedData !== 'string') {
    throw new TypeError('Input compressed data must be a string.');
  }

  const [ivBase64, encryptedData] = compressedData.split(':');
  if (!ivBase64 || !encryptedData) {
    throw new Error('Invalid compressed data format.');
  }

  const iv = Buffer.from(ivBase64, 'base64');
  const decipher = createDecipheriv(ALGORITHM, KEY, iv);
  let decrypted = decipher.update(encryptedData, 'base64', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}

/**
 * Utility function to validate if a given string is reversible.
 * @param {string} data - The input string to validate.
 * @returns {boolean} - True if reversible, false otherwise.
 */
export function validateReversibility(data) {
  try {
    const compressed = reversibleCompress(data);
    const decompressed = reversibleDecompress(compressed);
    return data === decompressed;
  } catch {
    return false;
  }
}

/**
 * Generates a random string for testing or seeding purposes.
 * @param {number} length - Desired length of the random string.
 * @returns {string} - A randomly generated string.
 */
export function generateRandomString(length = 16) {
  if (typeof length !== 'number' || length <= 0) {
    throw new TypeError('Length must be a positive number.');
  }

  return randomBytes(length).toString('base64').slice(0, length);
}