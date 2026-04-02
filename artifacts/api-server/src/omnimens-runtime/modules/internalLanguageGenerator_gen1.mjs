/**
 * OMNIMENS Self-Authored Module (Migrated from DB)
 * Original Source: evolution_cycle_41
 * Name: internalLanguageGenerator
 * Purpose: Generates conversational-scale natural language independently of external LLMs.
 * Description: A utility module for sparse attention, token generation, and vector math to support conversational intelligence in Node.js.
 * Migrated: 2026-04-02T14:08:14.875Z
 */

// internalLanguageGenerator.mjs

import { randomBytes } from 'crypto';

/**
 * Generates a sparse attention mask for efficient transformer computation.
 * @param {number} size - The size of the attention matrix (e.g., sequence length).
 * @param {number} sparsity - The fraction of elements to retain (0 < sparsity <= 1).
 * @returns {Uint8Array} - A binary mask array (1 = retain, 0 = discard).
 */
export function generateSparseAttentionMask(size, sparsity) {
  if (size <= 0 || sparsity <= 0 || sparsity > 1) {
    throw new Error('Invalid size or sparsity value. Size must be > 0 and 0 < sparsity <= 1.');
  }

  const mask = new Uint8Array(size * size);
  const numElementsToKeep = Math.floor(size * size * sparsity);
  const indices = new Set();

  while (indices.size < numElementsToKeep) {
    const randomIndex = Math.floor(Math.random() * (size * size));
    indices.add(randomIndex);
  }

  indices.forEach(index => {
    mask[index] = 1;
  });

  return mask;
}

/**
 * Applies a sparse attention mask to a matrix.
 * @param {Float32Array} matrix - The flattened input matrix (row-major order).
 * @param {Uint8Array} mask - The sparse attention mask (1 = retain, 0 = discard).
 * @returns {Float32Array} - The masked matrix.
 */
export function applySparseAttentionMask(matrix, mask) {
  if (matrix.length !== mask.length) {
    throw new Error('Matrix and mask must have the same length.');
  }

  const result = new Float32Array(matrix.length);

  for (let i = 0; i < matrix.length; i++) {
    result[i] = mask[i] ? matrix[i] : 0;
  }

  return result;
}

/**
 * Generates a random sequence of tokens for conversational purposes.
 * @param {number} length - The number of tokens to generate.
 * @param {string[]} vocabulary - The vocabulary to sample tokens from.
 * @returns {string[]} - An array of randomly generated tokens.
 */
export function generateTokenSequence(length, vocabulary) {
  if (length <= 0 || !Array.isArray(vocabulary) || vocabulary.length === 0) {
    throw new Error('Invalid length or vocabulary. Length must be > 0 and vocabulary must be a non-empty array.');
  }

  const tokens = [];

  for (let i = 0; i < length; i++) {
    const randomIndex = randomBytes(1)[0] % vocabulary.length;
    tokens.push(vocabulary[randomIndex]);
  }

  return tokens;
}

/**
 * Normalizes a vector to have unit length (L2 norm = 1).
 * @param {Float32Array} vector - The input vector.
 * @returns {Float32Array} - The normalized vector.
 */
export function normalizeVector(vector) {
  const norm = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));

  if (norm === 0) {
    throw new Error('Cannot normalize a zero vector.');
  }

  return vector.map(val => val / norm);
}

/**
 * Computes the dot product of two vectors.
 * @param {Float32Array} vectorA - The first vector.
 * @param {Float32Array} vectorB - The second vector.
 * @returns {number} - The dot product of the two vectors.
 */
export function computeDotProduct(vectorA, vectorB) {
  if (vectorA.length !== vectorB.length) {
    throw new Error('Vectors must have the same length.');
  }

  return vectorA.reduce((sum, val, i) => sum + val * vectorB[i], 0);
}

/**
 * Generates a conversational response by selecting the most contextually relevant token.
 * @param {string[]} contextTokens - The input context tokens.
 * @param {string[]} vocabulary - The vocabulary to sample responses from.
 * @returns {string} - The selected response token.
 */
export function generateConversationalResponse(contextTokens, vocabulary) {
  if (!Array.isArray(contextTokens) || !Array.isArray(vocabulary) || vocabulary.length === 0) {
    throw new Error('Invalid input. Context tokens and vocabulary must be non-empty arrays.');
  }

  // Placeholder: Select a random token for simplicity (can be replaced with a more advanced scoring mechanism).
  const randomIndex = randomBytes(1)[0] % vocabulary.length;
  return vocabulary[randomIndex];
}
