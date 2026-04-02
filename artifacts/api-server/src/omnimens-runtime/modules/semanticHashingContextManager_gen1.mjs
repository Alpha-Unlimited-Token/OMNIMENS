/**
 * OMNIMENS Self-Authored Module (Migrated from DB)
 * Original Source: evolution_cycle_59
 * Name: semanticHashingContextManager
 * Purpose: Preserves nuanced long-range dependencies through semantic hashing and recurrent memory networks.
 * Description: Implements semantic hashing and recurrent memory updates for dynamic context management and sequence encoding.
 * Migrated: 2026-04-02T14:50:29.438Z
 */

// semanticHashingContextManager.mjs

import { createHash } from 'crypto';

/**
 * Generates a semantic hash for a given input string using SHA-256 and LSH-inspired truncation.
 * @param {string} input - The input string to hash.
 * @param {number} hashLength - The desired length of the truncated hash.
 * @returns {string} A truncated semantic hash.
 */
export function generateSemanticHash(input, hashLength = 16) {
  if (typeof input !== 'string' || hashLength <= 0) {
    throw new Error('Invalid input or hashLength must be a positive integer.');
  }
  const fullHash = createHash('sha256').update(input).digest('hex');
  return fullHash.substring(0, hashLength);
}

/**
 * Implements a gated recurrent unit (GRU)-like mechanism to update and manage context state.
 * @param {Array<number>} previousState - The previous state vector.
 * @param {Array<number>} inputVector - The current input vector.
 * @param {number} updateGate - A value between 0 and 1 controlling update influence.
 * @returns {Array<number>} The updated state vector.
 */
export function updateRecurrentState(previousState, inputVector, updateGate) {
  if (!Array.isArray(previousState) || !Array.isArray(inputVector) || previousState.length !== inputVector.length) {
    throw new Error('State and input vectors must be arrays of the same length.');
  }
  if (typeof updateGate !== 'number' || updateGate < 0 || updateGate > 1) {
    throw new Error('Update gate must be a number between 0 and 1.');
  }
  return previousState.map((prev, idx) => updateGate * inputVector[idx] + (1 - updateGate) * prev);
}

/**
 * Encodes a sequence of inputs into a compressed semantic representation.
 * @param {Array<string>} inputSequence - An array of strings representing the input sequence.
 * @param {number} hashLength - The desired length of each semantic hash.
 * @returns {Array<string>} An array of semantic hashes representing the sequence.
 */
export function encodeSequence(inputSequence, hashLength = 16) {
  if (!Array.isArray(inputSequence) || inputSequence.some(item => typeof item !== 'string')) {
    throw new Error('Input sequence must be an array of strings.');
  }
  return inputSequence.map(item => generateSemanticHash(item, hashLength));
}

/**
 * Decodes a sequence of semantic hashes into a restored context approximation.
 * @param {Array<string>} hashSequence - An array of semantic hashes.
 * @param {Array<number>} initialState - The initial state vector for the recurrent memory.
 * @param {number} updateGate - A value between 0 and 1 controlling recurrent updates.
 * @returns {Array<number>} The final restored context vector.
 */
export function decodeSequence(hashSequence, initialState, updateGate = 0.5) {
  if (!Array.isArray(hashSequence) || hashSequence.some(item => typeof item !== 'string')) {
    throw new Error('Hash sequence must be an array of strings.');
  }
  if (!Array.isArray(initialState) || initialState.length === 0) {
    throw new Error('Initial state must be a non-empty array of numbers.');
  }
  return hashSequence.reduce((state, hash) => {
    const inputVector = Array.from(hash).map(char => char.charCodeAt(0) / 255);
    return updateRecurrentState(state, inputVector, updateGate);
  }, initialState);
}

/**
 * Utility function to initialize a zero vector of a given length.
 * @param {number} length - The length of the vector.
 * @returns {Array<number>} A zero-initialized vector.
 */
export function initializeZeroVector(length) {
  if (typeof length !== 'number' || length <= 0) {
    throw new Error('Length must be a positive integer.');
  }
  return Array(length).fill(0);
}

/**
 * Utility function to normalize a vector to unit length.
 * @param {Array<number>} vector - The vector to normalize.
 * @returns {Array<number>} The normalized vector.
 */
export function normalizeVector(vector) {
  if (!Array.isArray(vector) || vector.length === 0) {
    throw new Error('Vector must be a non-empty array of numbers.');
  }
  const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val ** 2, 0));
  return magnitude === 0 ? vector : vector.map(val => val / magnitude);
}